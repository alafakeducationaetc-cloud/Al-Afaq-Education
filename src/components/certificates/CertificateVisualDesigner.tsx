import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Certificate, CertificateFieldLayout } from '../../types';
import {
  Move,
  Eye,
  EyeOff,
  Type,
  Maximize2,
  Minimize2,
  Download,
  Printer,
  Sparkles,
  RotateCcw,
  Sliders,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  FileText,
  HelpCircle,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Layers,
  Palette,
  Image as ImageIcon,
  Award,
} from 'lucide-react';
import { exportCertificateAsPDF } from '../../lib/certificatePdf';

export const DEFAULT_CERTIFICATE_FIELDS: CertificateFieldLayout[] = [
  {
    id: 'basmala',
    label: 'Basmala',
    labelArabic: 'البسملة الشريفة',
    xPercent: 50,
    yPercent: 11,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#29235D',
    textAlign: 'center',
    visible: true,
    customText: 'بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ',
  },
  {
    id: 'platformName',
    label: 'Platform Name',
    labelArabic: 'اسم المنصة والترويسة',
    xPercent: 50,
    yPercent: 17,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'sans',
    color: '#29235D',
    textAlign: 'center',
    visible: true,
    customText: 'منصة الآفاق الدولية للتعليم والتدريب',
  },
  {
    id: 'certTitle',
    label: 'Certificate Title',
    labelArabic: 'عنوان الشهادة الرئيسي',
    xPercent: 50,
    yPercent: 24,
    fontSize: 28,
    fontWeight: 'extrabold',
    fontFamily: 'sans',
    color: '#8C6826',
    textAlign: 'center',
    visible: true,
  },
  {
    id: 'introText',
    label: 'Introductory Phrase',
    labelArabic: 'مقدمة الشهادة',
    xPercent: 50,
    yPercent: 32,
    fontSize: 16,
    fontWeight: 'normal',
    fontFamily: 'sans',
    color: '#4B5563',
    textAlign: 'center',
    visible: true,
    customText: 'تتشرف منصة الآفاق الدولية بأن تمنح هذه الشهادة المعتمدة إلى الطالب / الطالبة:',
  },
  {
    id: 'studentName',
    label: 'Student Name',
    labelArabic: 'اسم الطالب المكرم',
    xPercent: 50,
    yPercent: 41,
    fontSize: 38,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#29235D',
    textAlign: 'center',
    visible: true,
  },
  {
    id: 'courseTitle',
    label: 'Course / Program',
    labelArabic: 'اسم البرنامج التعليمي',
    xPercent: 50,
    yPercent: 50,
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'sans',
    color: '#1F2937',
    textAlign: 'center',
    visible: true,
    prefix: 'لاجتيازه بنجاح وتفوق برنامج: ',
  },
  {
    id: 'grade',
    label: 'Grade / Evaluation',
    labelArabic: 'التقدير والدرجة',
    xPercent: 50,
    yPercent: 56,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'sans',
    color: '#8C6826',
    textAlign: 'center',
    visible: true,
    prefix: 'التقدير العام: ',
  },
  {
    id: 'description',
    label: 'Description / Body',
    labelArabic: 'نص التوصية والوصف',
    xPercent: 50,
    yPercent: 64,
    fontSize: 14,
    fontWeight: 'normal',
    fontFamily: 'sans',
    color: '#4B5563',
    textAlign: 'center',
    visible: true,
  },
  {
    id: 'teacherName',
    label: 'Teacher Title & Name',
    labelArabic: 'اسم المعلم والمشرف',
    xPercent: 82,
    yPercent: 82,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'sans',
    color: '#29235D',
    textAlign: 'right',
    visible: true,
  },
  {
    id: 'teacherSignature',
    label: 'Teacher Signature',
    labelArabic: 'التوقيع المعتمد للمعلم',
    xPercent: 82,
    yPercent: 90,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#29235D',
    textAlign: 'right',
    visible: true,
  },
  {
    id: 'issueDate',
    label: 'Issue Date',
    labelArabic: 'تاريخ الإصدار',
    xPercent: 18,
    yPercent: 82,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'sans',
    color: '#4B5563',
    textAlign: 'left',
    visible: true,
    prefix: 'تاريخ الإصدار: ',
  },
  {
    id: 'certCode',
    label: 'Certificate Code',
    labelArabic: 'رقم وثيقة الشهادة',
    xPercent: 18,
    yPercent: 88,
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'mono',
    color: '#6B7280',
    textAlign: 'left',
    visible: true,
    prefix: 'رقم الوثيقة: ',
  },
  {
    id: 'qrCode',
    label: 'QR Verification Code',
    labelArabic: 'رمز QR للتحقق الفوري',
    xPercent: 50,
    yPercent: 86,
    fontSize: 14,
    fontWeight: 'normal',
    fontFamily: 'sans',
    color: '#29235D',
    textAlign: 'center',
    visible: true,
  },
  {
    id: 'platformStamp',
    label: 'Academy Seal',
    labelArabic: 'الختم الرسمي للمنصة',
    xPercent: 34,
    yPercent: 85,
    fontSize: 14,
    fontWeight: 'normal',
    fontFamily: 'sans',
    color: '#D3B673',
    textAlign: 'center',
    visible: true,
  },
];

interface CertificateVisualDesignerProps {
  cert: Partial<Certificate>;
  fields: CertificateFieldLayout[];
  onChangeFields: (newFields: CertificateFieldLayout[]) => void;
  isRTL: boolean;
  onExportPDF?: () => void;
  onDownloadPNG?: () => void;
  onPrint?: () => void;
}

export const CertificateVisualDesigner: React.FC<CertificateVisualDesignerProps> = ({
  cert,
  fields,
  onChangeFields,
  isRTL,
  onExportPDF,
  onDownloadPNG,
  onPrint,
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string>('studentName');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [showCenterGuide, setShowCenterGuide] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'DESIGNER' | 'LIVE_PREVIEW'>('DESIGNER');
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 75, 100, 125, 150
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragStartPos = useRef<{ mouseX: number; mouseY: number; elemX: number; elemY: number } | null>(null);

  // Active selected field definition
  const selectedField = useMemo(() => {
    return fields.find((f) => f.id === selectedFieldId) || fields[0];
  }, [fields, selectedFieldId]);

  // Update a single field's properties
  const updateField = (id: string, updates: Partial<CertificateFieldLayout>) => {
    const updated = fields.map((f) => (f.id === id ? { ...f, ...updates } : f));
    onChangeFields(updated);
  };

  // Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, fieldId: string) => {
    e.stopPropagation();
    setSelectedFieldId(fieldId);
    setActiveDragId(fieldId);
    setIsDragging(true);

    const targetField = fields.find((f) => f.id === fieldId);
    if (!targetField || !stageRef.current) return;

    const rect = stageRef.current.getBoundingClientRect();
    dragStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: targetField.xPercent,
      elemY: targetField.yPercent,
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !activeDragId || !dragStartPos.current || !stageRef.current) return;

    const rect = stageRef.current.getBoundingClientRect();
    const deltaXPixels = e.clientX - dragStartPos.current.mouseX;
    const deltaYPixels = e.clientY - dragStartPos.current.mouseY;

    const deltaXPercent = (deltaXPixels / rect.width) * 100;
    const deltaYPercent = (deltaYPixels / rect.height) * 100;

    let newX = Math.min(96, Math.max(4, dragStartPos.current.elemX + deltaXPercent));
    let newY = Math.min(96, Math.max(4, dragStartPos.current.elemY + deltaYPercent));

    // Snap to horizontal center if within 2.5%
    if (Math.abs(newX - 50) < 2.5) {
      newX = 50;
      setShowCenterGuide(true);
    } else {
      setShowCenterGuide(false);
    }

    updateField(activeDragId, {
      xPercent: Math.round(newX * 10) / 10,
      yPercent: Math.round(newY * 10) / 10,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      setActiveDragId(null);
      setShowCenterGuide(false);
      dragStartPos.current = null;
    }
  };

  // Reset to default balanced layout
  const handleResetLayout = () => {
    onChangeFields(DEFAULT_CERTIFICATE_FIELDS);
  };

  // Add custom text field
  const handleAddCustomField = () => {
    const newId = `custom_${Date.now()}`;
    const newField: CertificateFieldLayout = {
      id: newId,
      label: 'Custom Text',
      labelArabic: 'نص إضافي مخصص',
      xPercent: 50,
      yPercent: 70,
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: 'sans',
      color: '#29235D',
      textAlign: 'center',
      visible: true,
      customText: 'نص مخصص جديد',
    };
    onChangeFields([...fields, newField]);
    setSelectedFieldId(newId);
  };

  // Delete custom field
  const handleDeleteCustomField = (id: string) => {
    onChangeFields(fields.filter((f) => f.id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId('studentName');
    }
  };

  // Trigger PDF Export
  const handleDirectPdfExport = async () => {
    setIsExportingPdf(true);
    try {
      if (onExportPDF) {
        onExportPDF();
      } else {
        await exportCertificateAsPDF(cert as Certificate, fields);
      }
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Resolve preview text content
  const renderFieldContent = (field: CertificateFieldLayout) => {
    if (field.id === 'studentName') {
      return cert.studentNameArabic || cert.studentName || 'عبدالله أحمد العلي';
    }
    if (field.id === 'courseTitle') {
      return `${field.prefix || ''}${cert.programNameArabic || cert.programName || 'الدبلوم الاحترافي للذكاء الاصطناعي'}${field.suffix || ''}`;
    }
    if (field.id === 'grade') {
      return `${field.prefix || ''}${cert.grade || 'ممتاز مرتفع مع مرتبة الشرف (98%)'}${field.suffix || ''}`;
    }
    if (field.id === 'issueDate') {
      return `${field.prefix || ''}${cert.issueDate || new Date().toISOString().split('T')[0]}${field.suffix || ''}`;
    }
    if (field.id === 'certCode') {
      return `${field.prefix || ''}${cert.code || 'AETC-2026-CERT-8842'}${field.suffix || ''}`;
    }
    if (field.id === 'certTitle') {
      return cert.title || 'شهادة إتمام وتفوق معتمدة';
    }
    if (field.id === 'description') {
      return cert.description || 'تشهد منصة الآفاق الدولية بأن الطالب قد أتم بنجاح متطلبات البرنامج التعليمي بتفوق واقتدار.';
    }
    if (field.id === 'teacherName') {
      return `${cert.teacherTitle || 'المعلم والمشرف الأكاديمي'}: ${cert.teacherName || 'د. محمد المهدي'}`;
    }
    if (field.id === 'teacherSignature') {
      if (cert.teacherSignatureUrl) {
        return (
          <img
            src={cert.teacherSignatureUrl}
            alt="Signature"
            className="h-9 sm:h-12 w-auto object-contain pointer-events-none drop-shadow-xs"
          />
        );
      }
      return <span className="font-serif italic text-sm">{cert.teacherSignatureText || cert.teacherName || 'التوقيع المعتمد'}</span>;
    }
    if (field.id === 'qrCode') {
      return (
        <div className="p-1.5 bg-white border border-[#D3B673] rounded-lg shadow-xs flex flex-col items-center gap-0.5">
          <div className="w-10 h-10 bg-slate-900/90 rounded flex items-center justify-center text-[#D3B673] text-[9px] font-mono">
            QR CODE
          </div>
          <span className="text-[8px] font-bold text-[#29235D]">تحقق معتمد</span>
        </div>
      );
    }
    if (field.id === 'platformStamp') {
      return (
        <div className="w-12 h-12 rounded-full border-2 border-double border-[#D3B673] bg-[#D3B673]/10 flex flex-col items-center justify-center text-[8px] font-bold text-[#29235D] shadow-xs">
          <span>الآفاق</span>
          <span className="text-[7px] text-[#8C6826]">★ معتمد ★</span>
        </div>
      );
    }
    return field.customText || field.labelArabic;
  };

  const calculatedAspectRatio =
    cert.templateMode === 'CUSTOM_IMAGE' && cert.customImageWidth && cert.customImageHeight
      ? `${cert.customImageWidth} / ${cert.customImageHeight}`
      : '1.414 / 1';

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
      {/* Top Header & Toolbar */}
      <div className="p-3 sm:p-4 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D3B673] to-[#8C6826] text-[#29235D] flex items-center justify-center font-bold shadow-md">
            <Move className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#E8D5A3]">
              {isRTL ? 'محرر السحب والإفلات وتحديد مواضع الحقول' : 'Drag & Drop Template Positioner'}
            </h4>
            <p className="text-[10px] text-slate-400">
              {isRTL
                ? 'اسحب أي حقل بالمؤشر لوضعه في المكان المناسب على القالب المرفوع بدقة'
                : 'Drag elements directly onto the template at their natural coordinates'}
            </p>
          </div>
        </div>

        {/* View Mode Switcher & Actions */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="hidden sm:flex items-center bg-slate-700/60 rounded-xl p-0.5 border border-slate-600 text-xs">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(75, z - 25))}
              className="p-1.5 hover:bg-slate-600 rounded-lg text-slate-300"
              title="تصغير"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] text-[#E8D5A3]">{zoomLevel}%</span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(150, z + 25))}
              className="p-1.5 hover:bg-slate-600 rounded-lg text-slate-300"
              title="تكبير"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Switch Designer / Preview */}
          <div className="flex bg-slate-700/80 rounded-xl p-1 border border-slate-600 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('DESIGNER')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'DESIGNER'
                  ? 'bg-[#D3B673] text-[#29235D] shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isRTL ? 'المحرر التفاعلي' : 'Designer'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('LIVE_PREVIEW')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'LIVE_PREVIEW'
                  ? 'bg-[#D3B673] text-[#29235D] shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isRTL ? 'المعاينة الحية' : 'Live Preview'}</span>
            </button>
          </div>

          {/* Export High-Res PDF */}
          <button
            type="button"
            onClick={handleDirectPdfExport}
            disabled={isExportingPdf}
            className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer border border-red-400/30"
            title="تصدير كملف PDF فائق الدقة جاهز للطباعة"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isExportingPdf ? (isRTL ? 'جاري إنشاء PDF...' : 'Generating...') : (isRTL ? 'تصدير PDF عالي الدقة' : 'Export PDF')}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace (Stage + Side Inspector) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[460px] max-h-[620px]">
        {/* Left/Main Canvas Stage */}
        <div
          className="flex-1 bg-slate-950 p-3 sm:p-6 overflow-auto flex items-center justify-center relative select-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Live Stage Frame */}
          <div
            ref={stageRef}
            style={{
              aspectRatio: calculatedAspectRatio,
              width: `${zoomLevel}%`,
              maxWidth: '920px',
              backgroundImage:
                cert.templateMode === 'CUSTOM_IMAGE' && cert.customBackgroundImageUrl
                  ? `url(${cert.customBackgroundImageUrl})`
                  : undefined,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
            className={`relative rounded-xl shadow-2xl transition-all overflow-hidden ${
              cert.templateMode !== 'CUSTOM_IMAGE'
                ? 'bg-[#FCFAF7] border-4 sm:border-8 border-double border-[#D3B673]'
                : (cert.hideBuiltinBorders ?? true)
                ? 'bg-slate-900/40 border border-slate-600'
                : 'bg-[#FCFAF7] border-4 border-[#D3B673]'
            }`}
          >
            {/* Center Vertical Snapping Guide */}
            {showCenterGuide && (
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-rose-500/80 -translate-x-1/2 z-40 pointer-events-none flex items-start justify-center">
                <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-md">
                  المنتصف 50%
                </span>
              </div>
            )}

            {/* Template Dimension Badge */}
            {cert.templateMode === 'CUSTOM_IMAGE' && cert.customImageWidth && cert.customImageHeight && (
              <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[9px] text-[#E8D5A3] font-mono pointer-events-none border border-white/20">
                📐 {cert.customImageWidth} × {cert.customImageHeight} px
              </div>
            )}

            {/* Built-in Watermark if not custom */}
            {cert.templateMode !== 'CUSTOM_IMAGE' && (
              <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                <Award className="w-64 h-64 text-[#29235D]" />
              </div>
            )}

            {/* Placed Dynamic Fields */}
            {fields.map((field) => {
              if (!field.visible) return null;
              const isSelected = selectedFieldId === field.id;
              const isFieldDragging = activeDragId === field.id;

              return (
                <div
                  key={field.id}
                  onPointerDown={(e) => handlePointerDown(e, field.id)}
                  style={{
                    left: `${field.xPercent}%`,
                    top: `${field.yPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    color: field.color || '#29235D',
                    fontSize: `${Math.max(10, Math.round(field.fontSize * (zoomLevel / 100) * 0.75))}px`,
                    fontWeight: field.fontWeight === 'extrabold' ? 900 : field.fontWeight === 'bold' ? 700 : 400,
                    fontFamily:
                      field.fontFamily === 'serif'
                        ? '"Amiri", serif'
                        : field.fontFamily === 'mono'
                        ? 'monospace'
                        : '"Cairo", sans-serif',
                    textAlign: field.textAlign || 'center',
                  }}
                  className={`absolute transition-shadow cursor-grab active:cursor-grabbing ${
                    viewMode === 'DESIGNER'
                      ? `p-1 sm:p-1.5 rounded-lg border-2 ${
                          isSelected
                            ? 'border-[#D3B673] bg-[#29235D]/80 text-[#E8D5A3] shadow-lg ring-2 ring-[#D3B673]/50 z-30'
                            : 'border-blue-400/40 hover:border-blue-400 bg-white/70 hover:bg-white/90 text-[#29235D] shadow-xs z-20'
                        }`
                      : 'pointer-events-none z-10'
                  }`}
                  title={field.labelArabic}
                >
                  {/* Designer Label Badge for context */}
                  {viewMode === 'DESIGNER' && isSelected && (
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#29235D] text-[#D3B673] border border-[#D3B673] text-[9px] px-1.5 py-0.5 rounded shadow-md pointer-events-none font-sans font-bold">
                      {field.labelArabic} ({field.xPercent}%, {field.yPercent}%)
                    </span>
                  )}

                  {/* Render Field Content */}
                  <div className="flex items-center gap-1">
                    {viewMode === 'DESIGNER' && (
                      <Move className="w-3 h-3 opacity-40 shrink-0 hidden sm:inline" />
                    )}
                    <span className="whitespace-pre-wrap">{renderFieldContent(field)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side Inspector & Styling Tool Box */}
        <div className="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-700 flex flex-col overflow-y-auto">
          {/* Header of Inspector */}
          <div className="p-3 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#E8D5A3]">
              <Palette className="w-4 h-4" />
              <span>{isRTL ? 'خصائص وتنسيق الحقل المحدد' : 'Field Properties'}</span>
            </div>
            <button
              type="button"
              onClick={handleResetLayout}
              className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1 hover:underline"
              title="إعادة ضبط المواضع الافتراضية"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{isRTL ? 'إعادة ضبط' : 'Reset'}</span>
            </button>
          </div>

          <div className="p-4 space-y-4 text-xs flex-1">
            {/* Field Selector Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span>{isRTL ? 'اختيار الحقل للتحكم فيه:' : 'Select Field:'}</span>
                <span className="text-[10px] text-[#D3B673] font-mono">
                  X: {selectedField.xPercent}% | Y: {selectedField.yPercent}%
                </span>
              </label>
              <select
                value={selectedFieldId}
                onChange={(e) => setSelectedFieldId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-xs focus:ring-2 focus:ring-[#D3B673] outline-hidden"
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.visible ? '👁️ ' : '❌ '} {f.labelArabic}
                  </option>
                ))}
              </select>
            </div>

            {/* Visibility Toggle & Custom Text (if applicable) */}
            <div className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/80">
              <span className="font-bold text-slate-300">{isRTL ? 'إظهار هذا الحقل بالشهادة:' : 'Visibility:'}</span>
              <button
                type="button"
                onClick={() => updateField(selectedField.id, { visible: !selectedField.visible })}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  selectedField.visible
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {selectedField.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{selectedField.visible ? (isRTL ? 'ظاهر' : 'Visible') : (isRTL ? 'مخفي' : 'Hidden')}</span>
              </button>
            </div>

            {/* Custom Text input if custom field */}
            {selectedField.id.startsWith('custom_') && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">
                  {isRTL ? 'النص المكتوب:' : 'Custom Text:'}
                </label>
                <input
                  type="text"
                  value={selectedField.customText || ''}
                  onChange={(e) => updateField(selectedField.id, { customText: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs"
                />
              </div>
            )}

            {/* Prefix & Suffix Controls */}
            {(selectedField.id === 'courseTitle' || selectedField.id === 'grade' || selectedField.id === 'issueDate' || selectedField.id === 'certCode') && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">
                  {isRTL ? 'النص التمهيدي المسبق (Prefix):' : 'Text Prefix:'}
                </label>
                <input
                  type="text"
                  value={selectedField.prefix || ''}
                  onChange={(e) => updateField(selectedField.id, { prefix: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-white text-xs"
                />
              </div>
            )}

            {/* Font Size Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold text-slate-300">
                <span>{isRTL ? 'حجم الخط:' : 'Font Size:'}</span>
                <span className="font-mono text-[#D3B673]">{selectedField.fontSize} pt</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={selectedField.fontSize}
                onChange={(e) => updateField(selectedField.id, { fontSize: Number(e.target.value) })}
                className="w-full accent-[#D3B673] cursor-pointer"
              />
            </div>

            {/* Font Family Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">
                {isRTL ? 'نوع الخط والتصميم:' : 'Font Family:'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'serif', name: 'خط كلاسيكي (Amiri)' },
                  { id: 'sans', name: 'خط حديث (Cairo)' },
                  { id: 'mono', name: 'خط أرقام (Mono)' },
                ].map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => updateField(selectedField.id, { fontFamily: font.id as any })}
                    className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                      selectedField.fontFamily === font.id
                        ? 'bg-[#29235D] text-[#D3B673] border-[#D3B673]'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Color Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">
                {isRTL ? 'لون النص:' : 'Text Color:'}
              </label>
              <div className="flex items-center gap-2">
                {[
                  { color: '#29235D', label: 'كحلي ملكي' },
                  { color: '#8C6826', label: 'ذهبي معتمد' },
                  { color: '#1F2937', label: 'رمادي داكن' },
                  { color: '#FFFFFF', label: 'أبيض ناصع' },
                  { color: '#B91C1C', label: 'عنابي رسمي' },
                ].map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => updateField(selectedField.id, { color: c.color })}
                    style={{ backgroundColor: c.color }}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      selectedField.color === c.color ? 'scale-125 border-[#D3B673] shadow-md' : 'border-slate-500 hover:scale-110'
                    }`}
                    title={c.label}
                  />
                ))}
                <input
                  type="color"
                  value={selectedField.color || '#29235D'}
                  onChange={(e) => updateField(selectedField.id, { color: e.target.value })}
                  className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border border-slate-600"
                  title="لون مخصص"
                />
              </div>
            </div>

            {/* Text Alignment */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">
                {isRTL ? 'محاذاة النص:' : 'Text Alignment:'}
              </label>
              <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700">
                {[
                  { align: 'right', icon: AlignRight, name: 'يمين' },
                  { align: 'center', icon: AlignCenter, name: 'توسيط' },
                  { align: 'left', icon: AlignLeft, name: 'يسار' },
                ].map((al) => {
                  const Icon = al.icon;
                  return (
                    <button
                      key={al.align}
                      type="button"
                      onClick={() => updateField(selectedField.id, { textAlign: al.align as any })}
                      className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 font-bold text-xs transition-all ${
                        selectedField.textAlign === al.align
                          ? 'bg-[#D3B673] text-[#29235D]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{al.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Position Percentages Manual Adjustment */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">{isRTL ? 'الموقع الأفقي (X%):' : 'X Position (%):'}</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={selectedField.xPercent}
                  onChange={(e) => updateField(selectedField.id, { xPercent: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">{isRTL ? 'الموقع الرأسي (Y%):' : 'Y Position (%):'}</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={selectedField.yPercent}
                  onChange={(e) => updateField(selectedField.id, { yPercent: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white font-mono text-xs"
                />
              </div>
            </div>

            {/* Add Custom Text Field & Delete Button */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddCustomField}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-[#D3B673] font-bold text-[11px] border border-[#D3B673]/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRTL ? 'إضافة نص مخصص جديد' : 'Add Custom Text'}</span>
              </button>

              {selectedField.id.startsWith('custom_') && (
                <button
                  type="button"
                  onClick={() => handleDeleteCustomField(selectedField.id)}
                  className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/30 transition-all"
                  title="حذف هذا الحقل"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status bar */}
      <div className="p-3 bg-slate-800 border-t border-slate-700 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D3B673]" />
          <span>
            {isRTL
              ? '💡 نصيحة: يمكنك النقر والسحب لأي عنصر على القالب مباشرة. سيتم تصدير ملف الـ PDF بأعلى دقة متطابقة مع هذه المواضع.'
              : 'Tip: Drag elements directly. High-resolution PDF export will render accurately with zero loss.'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">
            {isRTL ? 'إجمالي الحقول النشطة:' : 'Active fields:'} {fields.filter((f) => f.visible).length} / {fields.length}
          </span>
        </div>
      </div>
    </div>
  );
};
