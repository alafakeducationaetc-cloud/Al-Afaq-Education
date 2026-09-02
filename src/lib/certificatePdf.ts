import { jsPDF } from 'jspdf';
import { Certificate, CertificateFieldLayout } from '../types';

/**
 * Render a high-resolution canvas for a certificate (supporting custom templates,
 * dynamic field positions, typography, signatures, QR codes, and academy stamps).
 */
export async function renderCertificateCanvas(
  cert: Certificate,
  fieldLayouts?: CertificateFieldLayout[],
  options?: { targetWidth?: number; targetHeight?: number }
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');

  // Determine natural canvas dimensions
  let canvasWidth = options?.targetWidth || 2400;
  let canvasHeight = options?.targetHeight || 1700;

  let bgImg: HTMLImageElement | null = null;

  if (cert.templateMode === 'CUSTOM_IMAGE' && cert.customBackgroundImageUrl) {
    bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    await new Promise((resolve) => {
      if (!bgImg) return resolve(null);
      bgImg.onload = () => resolve(bgImg);
      bgImg.onerror = () => resolve(null);
      bgImg.src = cert.customBackgroundImageUrl!;
    });

    if (bgImg && bgImg.naturalWidth > 0 && bgImg.naturalHeight > 0) {
      canvasWidth = bgImg.naturalWidth;
      canvasHeight = bgImg.naturalHeight;
    } else if (cert.customImageWidth && cert.customImageHeight) {
      canvasWidth = cert.customImageWidth;
      canvasHeight = cert.customImageHeight;
    }
  }

  // Ensure high-resolution minimum for crisp print quality
  if (canvasWidth < 2000 && canvasHeight < 1500) {
    const scaleFactor = Math.max(2000 / canvasWidth, 1500 / canvasHeight);
    canvasWidth = Math.round(canvasWidth * scaleFactor);
    canvasHeight = Math.round(canvasHeight * scaleFactor);
  }

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get 2D canvas context');

  // Clear & fill white base
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 1. Draw Background Image or Royal Built-in Frame
  if (cert.templateMode === 'CUSTOM_IMAGE' && bgImg && bgImg.naturalWidth > 0) {
    ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);

    // If built-in borders are not hidden, overlay royal accents
    if (!cert.hideBuiltinBorders) {
      ctx.strokeStyle = '#D3B673';
      ctx.lineWidth = Math.max(6, Math.round(canvasWidth * 0.003));
      ctx.strokeRect(30, 30, canvasWidth - 60, canvasHeight - 60);
    }
  } else {
    // Royal Luxury Built-in Background
    ctx.fillStyle = '#FCFAF7';
    ctx.fillRect(40, 40, canvasWidth - 80, canvasHeight - 80);

    // Outer Gold Border
    ctx.strokeStyle = '#D3B673';
    ctx.lineWidth = Math.max(12, Math.round(canvasWidth * 0.006));
    ctx.strokeRect(50, 50, canvasWidth - 100, canvasHeight - 100);

    // Inner Navy Border
    ctx.strokeStyle = '#29235D';
    ctx.lineWidth = Math.max(4, Math.round(canvasWidth * 0.002));
    ctx.strokeRect(80, 80, canvasWidth - 160, canvasHeight - 160);

    // Subtle Corner Accents
    const cornerSize = Math.round(canvasWidth * 0.03);
    ctx.fillStyle = '#D3B673';
    ctx.fillRect(60, 60, cornerSize, 6);
    ctx.fillRect(60, 60, 6, cornerSize);
    ctx.fillRect(canvasWidth - 60 - cornerSize, 60, cornerSize, 6);
    ctx.fillRect(canvasWidth - 66, 60, 6, cornerSize);
    ctx.fillRect(60, canvasHeight - 66, cornerSize, 6);
    ctx.fillRect(60, canvasHeight - 60 - cornerSize, 6, cornerSize);
    ctx.fillRect(canvasWidth - 60 - cornerSize, canvasHeight - 66, cornerSize, 6);
    ctx.fillRect(canvasWidth - 66, canvasHeight - 60 - cornerSize, 6, cornerSize);
  }

  // Determine active fields (custom layouts or fallback standard positioning)
  const fields = (fieldLayouts && fieldLayouts.length > 0)
    ? fieldLayouts
    : (cert.customLayoutFields && cert.customLayoutFields.length > 0)
      ? cert.customLayoutFields
      : null;

  const fontScale = canvasWidth / 1000; // base scalar

  if (fields) {
    // Render according to custom drag-and-drop field layouts
    for (const field of fields) {
      if (!field.visible) continue;

      const posX = (field.xPercent / 100) * canvasWidth;
      const posY = (field.yPercent / 100) * canvasHeight;
      const computedFontSize = Math.round(field.fontSize * fontScale * 0.85);

      ctx.save();
      ctx.textAlign = field.textAlign || 'center';
      ctx.direction = 'rtl';

      const weight = field.fontWeight === 'extrabold' ? '900' : field.fontWeight === 'bold' ? 'bold' : 'normal';
      const family = field.fontFamily === 'serif' ? '"Amiri", "Traditional Arabic", serif' : field.fontFamily === 'mono' ? 'monospace' : '"Cairo", sans-serif';
      ctx.font = `${weight} ${computedFontSize}px ${family}`;
      ctx.fillStyle = field.color || '#29235D';

      if (field.id === 'teacherSignature') {
        if (cert.teacherSignatureUrl) {
          const sigImg = new Image();
          sigImg.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            sigImg.onload = () => resolve(sigImg);
            sigImg.onerror = () => resolve(null);
            sigImg.src = cert.teacherSignatureUrl!;
          });
          if (sigImg.naturalWidth > 0) {
            const sigW = Math.round(180 * fontScale);
            const sigH = Math.round(75 * fontScale);
            const drawX = field.textAlign === 'center' ? posX - sigW / 2 : field.textAlign === 'right' ? posX - sigW : posX;
            ctx.drawImage(sigImg, drawX, posY - sigH / 2, sigW, sigH);
          } else {
            ctx.fillText(cert.teacherSignatureText || cert.teacherName || 'التوقيع المعتمد', posX, posY);
          }
        } else {
          ctx.fillText(cert.teacherSignatureText || cert.teacherName || 'التوقيع المعتمد', posX, posY);
        }
      } else if (field.id === 'qrCode') {
        // Draw Stylized QR Box with Security Badge
        const qrSize = Math.round(100 * fontScale);
        const qrX = field.textAlign === 'center' ? posX - qrSize / 2 : field.textAlign === 'right' ? posX - qrSize : posX;
        const qrY = posY - qrSize / 2;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(qrX, qrY, qrSize, qrSize);
        ctx.strokeStyle = '#D3B673';
        ctx.lineWidth = Math.max(2, Math.round(2 * fontScale));
        ctx.strokeRect(qrX, qrY, qrSize, qrSize);

        // QR Inner Grid pattern simulation
        ctx.fillStyle = '#29235D';
        const cellSize = qrSize / 6;
        for (let r = 0; r < 6; r++) {
          for (let c = 0; c < 6; c++) {
            if ((r === 0 || r === 5 || c === 0 || c === 5) || (r === 2 && c === 2) || (r === 3 && c === 3)) {
              ctx.fillRect(qrX + c * cellSize + 2, qrY + r * cellSize + 2, cellSize - 4, cellSize - 4);
            }
          }
        }

        ctx.font = `bold ${Math.max(10, Math.round(10 * fontScale))}px "Cairo", sans-serif`;
        ctx.fillStyle = '#29235D';
        ctx.textAlign = 'center';
        ctx.fillText('تحقق رقمي', qrX + qrSize / 2, qrY + qrSize + 16 * fontScale);
      } else if (field.id === 'platformStamp') {
        // Draw Academy Stamp Emblem
        const stampRadius = Math.round(48 * fontScale);
        ctx.save();
        ctx.translate(posX, posY);
        ctx.beginPath();
        ctx.arc(0, 0, stampRadius, 0, Math.PI * 2);
        ctx.strokeStyle = '#D3B673';
        ctx.lineWidth = Math.max(3, Math.round(3 * fontScale));
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, stampRadius - 6 * fontScale, 0, Math.PI * 2);
        ctx.strokeStyle = '#29235D';
        ctx.lineWidth = Math.max(1.5, Math.round(1.5 * fontScale));
        ctx.stroke();

        ctx.font = `bold ${Math.max(9, Math.round(9 * fontScale))}px "Cairo", sans-serif`;
        ctx.fillStyle = '#29235D';
        ctx.textAlign = 'center';
        ctx.fillText('منصة الآفاق', 0, -8 * fontScale);
        ctx.fillText('★ معتمد ★', 0, 8 * fontScale);
        ctx.restore();
      } else {
        // Resolve field text content
        let textValue = '';
        if (field.id === 'studentName') {
          textValue = cert.studentNameArabic || cert.studentName;
        } else if (field.id === 'courseTitle') {
          textValue = `${field.prefix || ''}${cert.programNameArabic || cert.programName}${field.suffix || ''}`;
        } else if (field.id === 'grade') {
          textValue = `${field.prefix || ''}${cert.grade || 'ممتاز مرتفع مع مرتبة الشرف'}${field.suffix || ''}`;
        } else if (field.id === 'issueDate') {
          textValue = `${field.prefix || ''}${cert.issueDate}${field.suffix || ''}`;
        } else if (field.id === 'certCode') {
          textValue = `${field.prefix || ''}${cert.code}${field.suffix || ''}`;
        } else if (field.id === 'certTitle') {
          textValue = cert.title || 'شهادة إتمام وتفوق معتمدة';
        } else if (field.id === 'description') {
          textValue = cert.description || '';
        } else if (field.id === 'teacherName') {
          textValue = `${cert.teacherTitle || 'المعلم'}: ${cert.teacherName || ''}`;
        } else if (field.customText) {
          textValue = field.customText;
        }

        if (textValue) {
          ctx.fillText(textValue, posX, posY);
        }
      }

      ctx.restore();
    }
  } else {
    // Default High-Precision Standard Layout
    const scaleX = canvasWidth / 2400;
    const scaleY = canvasHeight / 1700;
    const sFont = Math.min(scaleX, scaleY);

    ctx.textAlign = 'center';
    ctx.direction = 'rtl';

    // 1. Basmala
    ctx.font = `bold ${Math.round(36 * sFont)}px "Amiri", serif`;
    ctx.fillStyle = '#29235D';
    ctx.fillText('بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ', canvasWidth / 2, 200 * scaleY);

    // 2. Platform Name
    ctx.font = `bold ${Math.round(44 * sFont)}px "Cairo", sans-serif`;
    ctx.fillStyle = '#29235D';
    ctx.fillText('منصة الآفاق الدولية للتعليم والتدريب', canvasWidth / 2, 290 * scaleY);

    // 3. Title
    ctx.font = `bold ${Math.round(54 * sFont)}px "Cairo", sans-serif`;
    ctx.fillStyle = '#8C6826';
    ctx.fillText(cert.title || 'شهادة إتمام وتفوق معتمدة', canvasWidth / 2, 420 * scaleY);

    // 4. Intro
    ctx.font = `${Math.round(32 * sFont)}px "Cairo", sans-serif`;
    ctx.fillStyle = '#4B5563';
    ctx.fillText('تتشرف منصة الآفاق الدولية بأن تمنح هذه الشهادة المعتمدة إلى الطالب / الطالبة:', canvasWidth / 2, 540 * scaleY);

    // 5. Student Name
    ctx.font = `bold ${Math.round(76 * sFont)}px "Amiri", "Cairo", serif`;
    ctx.fillStyle = '#29235D';
    ctx.fillText(cert.studentNameArabic || cert.studentName, canvasWidth / 2, 680 * scaleY);

    // 6. Course & Grade
    ctx.font = `bold ${Math.round(40 * sFont)}px "Cairo", sans-serif`;
    ctx.fillStyle = '#1F2937';
    ctx.fillText(`لاجتيازه بنجاح وتفوق برنامج: ${cert.programNameArabic || cert.programName}`, canvasWidth / 2, 820 * scaleY);

    ctx.font = `bold ${Math.round(36 * sFont)}px "Cairo", sans-serif`;
    ctx.fillStyle = '#8C6826';
    ctx.fillText(`التقدير العام: ${cert.grade || 'ممتاز مرتفع مع مرتبة الشرف'}`, canvasWidth / 2, 910 * scaleY);

    // 7. Description
    if (cert.description) {
      ctx.font = `${Math.round(28 * sFont)}px "Cairo", sans-serif`;
      ctx.fillStyle = '#4B5563';
      ctx.fillText(cert.description, canvasWidth / 2, 1020 * scaleY);
    }

    // 8. Teacher & Signature
    ctx.textAlign = 'right';
    ctx.font = `bold ${Math.round(32 * sFont)}px "Cairo", sans-serif`;
    ctx.fillStyle = '#29235D';
    ctx.fillText(cert.teacherTitle || 'المعلم والمشرف الأكاديمي:', canvasWidth - 320 * scaleX, 1300 * scaleY);
    ctx.fillText(cert.teacherName || '', canvasWidth - 320 * scaleX, 1450 * scaleY);

    if (cert.teacherSignatureUrl) {
      const sigImg = new Image();
      sigImg.crossOrigin = 'anonymous';
      await new Promise((resolve) => {
        sigImg.onload = () => resolve(sigImg);
        sigImg.onerror = () => resolve(null);
        sigImg.src = cert.teacherSignatureUrl!;
      });
      if (sigImg.naturalWidth > 0) {
        ctx.drawImage(sigImg, canvasWidth - 560 * scaleX, 1320 * scaleY, 220 * scaleX, 100 * scaleY);
      }
    }

    // 9. Issue Date & Code
    ctx.textAlign = 'left';
    ctx.font = `bold ${Math.round(28 * sFont)}px "Cairo", sans-serif`;
    ctx.fillStyle = '#4B5563';
    ctx.fillText(`تاريخ الإصدار: ${cert.issueDate}`, 320 * scaleX, 1320 * scaleY);
    ctx.fillText(`رقم الوثيقة: ${cert.code}`, 320 * scaleX, 1390 * scaleY);
    ctx.fillText('منصة الآفاق الدولية - Al-Afak International', 320 * scaleX, 1460 * scaleY);
  }

  return canvas;
}

/**
 * Export certificate as High-Resolution Print-Ready PDF
 */
export async function exportCertificateAsPDF(
  cert: Certificate,
  fieldLayouts?: CertificateFieldLayout[],
  fileName?: string
): Promise<void> {
  const canvas = await renderCertificateCanvas(cert, fieldLayouts);
  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  const isLandscape = canvas.width >= canvas.height;
  const orientation = isLandscape ? 'landscape' : 'portrait';

  // Standard A4 dimensions in mm: 297 x 210
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = isLandscape ? 297 : 210;
  const pageHeight = isLandscape ? 210 : 297;

  // Fit image to page dimensions while preserving aspect ratio
  const canvasAspect = canvas.width / canvas.height;
  const pageAspect = pageWidth / pageHeight;

  let renderW = pageWidth;
  let renderH = pageHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (canvasAspect > pageAspect) {
    // Wider than page
    renderW = pageWidth;
    renderH = pageWidth / canvasAspect;
    offsetY = (pageHeight - renderH) / 2;
  } else {
    // Taller than page
    renderH = pageHeight;
    renderW = pageHeight * canvasAspect;
    offsetX = (pageWidth - renderW) / 2;
  }

  pdf.addImage(imgData, 'JPEG', offsetX, offsetY, renderW, renderH, undefined, 'FAST');

  const cleanName = fileName || `شهادة-${cert.studentNameArabic || cert.studentName}-${cert.code}.pdf`;
  pdf.save(cleanName);
}
