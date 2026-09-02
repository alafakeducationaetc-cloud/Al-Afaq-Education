import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { Certificate, CertificateFieldLayout } from '../../types';
import { exportCertificateAsPDF } from '../../lib/certificatePdf';
import { CertificateVisualDesigner, DEFAULT_CERTIFICATE_FIELDS } from './CertificateVisualDesigner';
import {
  Award,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Share2,
  Edit,
  Trash2,
  CheckCircle,
  ShieldCheck,
  QrCode,
  PenTool,
  Stamp,
  Sparkles,
  ExternalLink,
  Eye,
  X,
  FileCheck,
  User,
  GraduationCap,
  Calendar,
  RotateCcw,
  Check,
  Copy,
  Upload,
  Image as ImageIcon,
  Palette,
  Sliders,
  Maximize2,
  Move,
  FileText,
  Layers,
} from 'lucide-react';

export const CertificatesManager: React.FC = () => {
  const {
    currentUser,
    students,
    teachers,
    programs,
    certificates,
    issueCertificate,
    updateCertificate,
    deleteCertificate,
    updateTeacher,
    settings,
  } = useApp();
  const { isRTL } = useI18n();

  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';
  const isTeacher = currentUser?.role === 'TEACHER';
  const isStudent = currentUser?.role === 'STUDENT';

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('ALL');
  const [selectedCertificateForView, setSelectedCertificateForView] = useState<Certificate | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState<boolean>(false);
  const [editingCertId, setEditingCertId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [previewZoomMode, setPreviewZoomMode] = useState<'FIT' | 'ORIGINAL'>('FIT');
  const [editorActiveTab, setEditorActiveTab] = useState<'FIELDS' | 'VISUAL_DESIGNER'>('FIELDS');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [formCustomLayoutFields, setFormCustomLayoutFields] = useState<CertificateFieldLayout[]>(DEFAULT_CERTIFICATE_FIELDS);

  // Handle ESC key to exit any open modal immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedCertificateForView) {
          setSelectedCertificateForView(null);
        } else if (isIssueModalOpen) {
          setIsIssueModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCertificateForView, isIssueModalOpen]);

  // Form State for Issuing / Editing Certificate
  const [formStudentId, setFormStudentId] = useState<string>('');
  const [formProgramId, setFormProgramId] = useState<string>('');
  const [formTeacherId, setFormTeacherId] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('شهادة إتمام وتفوق معتمدة');
  const [formGrade, setFormGrade] = useState<string>('ممتاز مرتفع مع مرتبة الشرف (98%)');
  const [formCompletionDate, setFormCompletionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formIssueDate, setFormIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState<string>(
    'تشهد منصة الآفاق الدولية بأن الطالب قد أتم بنجاح متطلبات البرنامج التعليمي بتفوق واقتدار، واجتاز كافة الاختبارات والتقييمات المقررة وفق أعلى معايير الجودة والإتقان.'
  );

  // Template Mode & Custom Background
  const [formTemplateMode, setFormTemplateMode] = useState<'BUILT_IN' | 'CUSTOM_IMAGE'>('BUILT_IN');
  const [formCustomBackgroundImageUrl, setFormCustomBackgroundImageUrl] = useState<string>('');
  const [formCustomImageWidth, setFormCustomImageWidth] = useState<number | undefined>(undefined);
  const [formCustomImageHeight, setFormCustomImageHeight] = useState<number | undefined>(undefined);
  const [formHideBuiltinBorders, setFormHideBuiltinBorders] = useState<boolean>(true);
  const [formBorderStyle, setFormBorderStyle] = useState<'ROYAL_GOLD' | 'ISLAMIC_GEOMETRIC' | 'MODERN_NAVY' | 'PARCHMENT_CLASSIC'>('ROYAL_GOLD');
  const [formTextColorTheme, setFormTextColorTheme] = useState<'NAVY' | 'GOLD' | 'DARK' | 'WHITE'>('NAVY');
  const [formTextPositionPreset, setFormTextPositionPreset] = useState<'BALANCED' | 'COMPACT' | 'LOWER' | 'HIGHER'>('BALANCED');
  const [formShowQrCode, setFormShowQrCode] = useState<boolean>(true);
  const [formShowDate, setFormShowDate] = useState<boolean>(true);
  const [formShowSeal, setFormShowSeal] = useState<boolean>(true);
  const [formSaveSigToTeacherProfile, setFormSaveSigToTeacherProfile] = useState<boolean>(true);
  const [teacherSignatureFoundAlert, setTeacherSignatureFoundAlert] = useState<string | null>(null);

  // Teacher Signature & Seal Options
  const [formSignatureType, setFormSignatureType] = useState<'TEXT' | 'IMAGE' | 'DRAWN' | 'STAMP'>('IMAGE');
  const [formTeacherSignatureText, setFormTeacherSignatureText] = useState<string>('');
  const [formTeacherSignatureUrl, setFormTeacherSignatureUrl] = useState<string>('');
  const [formTeacherSealUrl, setFormTeacherSealUrl] = useState<string>('');
  const [formTeacherTitle, setFormTeacherTitle] = useState<string>('المعلم والمشرف الأكاديمي');
  const [formSealTitle, setFormSealTitle] = useState<string>('الختم المعتمد - منصة الآفاق الدولية');
  const [formIncludePlatformStamp, setFormIncludePlatformStamp] = useState<boolean>(true);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const templateUploadInputRef = useRef<HTMLInputElement | null>(null);
  const signatureUploadInputRef = useRef<HTMLInputElement | null>(null);
  const sealUploadInputRef = useRef<HTMLInputElement | null>(null);
  const certificatePrintRef = useRef<HTMLDivElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

  // Auto initialize form student, program & teacher
  useEffect(() => {
    if (students.length > 0 && !formStudentId) {
      setFormStudentId(students[0].id);
    }
    if (programs.length > 0 && !formProgramId) {
      setFormProgramId(programs[0].id);
    }
    if (teachers.length > 0 && !formTeacherId) {
      if (isTeacher && currentUser) {
        setFormTeacherId(currentUser.id);
      } else {
        setFormTeacherId(teachers[0].id);
      }
    }
  }, [students, programs, teachers, currentUser, isTeacher]);

  // AUTO RETRIEVE TEACHER SIGNATURE & SEAL WHEN TEACHER IS SELECTED
  useEffect(() => {
    if (!formTeacherId) return;
    const tea = teachers.find(t => t.id === formTeacherId);
    if (tea) {
      setFormTeacherSignatureText(tea.nameArabic || tea.name);
      setFormTeacherTitle(tea.titleArabic || (tea as any).title || 'المعلم والمشرف الأكاديمي');
      
      // Auto-retrieve signature if available
      if (tea.signatureUrl) {
        setFormTeacherSignatureUrl(tea.signatureUrl);
        setFormSignatureType('IMAGE');
        setTeacherSignatureFoundAlert(`تم استدعاء التوقيع المعتمد للمعلم (${tea.nameArabic || tea.name}) تلقائياً من المنصة.`);
      } else if ((currentUser as any)?.id === tea.id && (currentUser as any)?.signatureUrl) {
        setFormTeacherSignatureUrl((currentUser as any).signatureUrl);
        setFormSignatureType('IMAGE');
        setTeacherSignatureFoundAlert(`تم استدعاء توقيعك المعتمد تلقائياً.`);
      } else {
        setTeacherSignatureFoundAlert(null);
      }

      // Auto-retrieve seal if available
      if (tea.sealUrl) {
        setFormTeacherSealUrl(tea.sealUrl);
      }
    }
  }, [formTeacherId, teachers, currentUser]);

  // Clear Canvas handler
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
    setFormTeacherSignatureUrl('');
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#29235D';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawnSignature(true);
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false);
      const dataUrl = canvasRef.current.toDataURL('image/png');
      setFormTeacherSignatureUrl(dataUrl);
    }
  };

  // File Upload Handlers
  const handleTemplateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const dataUrl = reader.result;
          setFormCustomBackgroundImageUrl(dataUrl);
          setFormTemplateMode('CUSTOM_IMAGE');
          
          // Detect and extract the exact natural dimensions of the uploaded image
          const img = new Image();
          img.onload = () => {
            const naturalW = img.naturalWidth || img.width;
            const naturalH = img.naturalHeight || img.height;
            setFormCustomImageWidth(naturalW);
            setFormCustomImageHeight(naturalH);
          };
          img.src = dataUrl;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignatureFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormTeacherSignatureUrl(reader.result);
          setFormSignatureType('IMAGE');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormTeacherSealUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Filtered Certificates List
  const visibleCertificates = certificates.filter(cert => {
    if (isStudent && currentUser && cert.studentId !== currentUser.id) {
      return false;
    }
    if (isTeacher && currentUser && !isAdmin) {
      if (cert.teacherId !== currentUser.id && cert.issuedByUserId !== currentUser.id) {
        return false;
      }
    }
    if (selectedProgramFilter !== 'ALL' && cert.programId !== selectedProgramFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (cert.studentName || '').toLowerCase().includes(q);
      const matchArabic = (cert.studentNameArabic || '').toLowerCase().includes(q);
      const matchCode = (cert.code || '').toLowerCase().includes(q);
      const matchProgram = (cert.programName || '').toLowerCase().includes(q);
      const matchTeacher = (cert.teacherName || '').toLowerCase().includes(q);
      return matchName || matchArabic || matchCode || matchProgram || matchTeacher;
    }
    return true;
  });

  // Open Issue Modal (Reset)
  const handleOpenIssueModal = () => {
    setEditingCertId(null);
    setFormTitle('شهادة إتمام وتفوق معتمدة');
    setFormGrade('ممتاز مرتفع مع مرتبة الشرف (98%)');
    setFormCompletionDate(new Date().toISOString().split('T')[0]);
    setFormIssueDate(new Date().toISOString().split('T')[0]);
    setFormDescription(
      'تشهد منصة الآفاق الدولية بأن الطالب قد أتم بنجاح متطلبات البرنامج التعليمي بتفوق واقتدار، واجتاز كافة الاختبارات والتقييمات المقررة وفق أعلى معايير الجودة والإتقان.'
    );
    setFormTemplateMode('BUILT_IN');
    setFormCustomBackgroundImageUrl('');
    setFormCustomImageWidth(undefined);
    setFormCustomImageHeight(undefined);
    setFormHideBuiltinBorders(true);
    setFormBorderStyle('ROYAL_GOLD');
    setFormTextColorTheme('NAVY');
    setFormTextPositionPreset('BALANCED');
    setFormIncludePlatformStamp(true);
    setFormShowQrCode(true);
    setFormShowDate(true);
    setFormShowSeal(true);
    setFormCustomLayoutFields(DEFAULT_CERTIFICATE_FIELDS);
    setEditorActiveTab('FIELDS');

    if (students.length > 0) setFormStudentId(students[0].id);
    if (programs.length > 0) setFormProgramId(programs[0].id);
    
    // Auto populate teacher and signature
    const defaultTeacherId = isTeacher && currentUser ? currentUser.id : (teachers[0]?.id || '');
    setFormTeacherId(defaultTeacherId);

    const tea = teachers.find(t => t.id === defaultTeacherId);
    if (tea && tea.signatureUrl) {
      setFormTeacherSignatureUrl(tea.signatureUrl);
      setFormSignatureType('IMAGE');
    }

    setIsIssueModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cert: Certificate) => {
    setEditingCertId(cert.id);
    setFormStudentId(cert.studentId);
    setFormProgramId(cert.programId);
    setFormTeacherId(cert.teacherId || '');
    setFormTitle(cert.title || 'شهادة إتمام وتفوق معتمدة');
    setFormGrade(cert.grade || 'ممتاز مرتفع مع مرتبة الشرف');
    setFormCompletionDate(cert.completionDate || cert.issueDate);
    setFormIssueDate(cert.issueDate);
    setFormDescription(cert.description || '');
    setFormTemplateMode(cert.templateMode || (cert.customBackgroundImageUrl ? 'CUSTOM_IMAGE' : 'BUILT_IN'));
    setFormCustomBackgroundImageUrl(cert.customBackgroundImageUrl || '');
    setFormCustomImageWidth(cert.customImageWidth);
    setFormCustomImageHeight(cert.customImageHeight);
    setFormHideBuiltinBorders(cert.hideBuiltinBorders ?? true);
    setFormSignatureType(cert.teacherSignatureType || 'IMAGE');
    setFormTeacherSignatureText(cert.teacherSignatureText || cert.teacherName || '');
    setFormTeacherSignatureUrl(cert.teacherSignatureUrl || '');
    setFormTeacherSealUrl(cert.teacherSealUrl || '');
    setFormTeacherTitle(cert.teacherTitle || 'المعلم والمشرف الأكاديمي');
    setFormSealTitle(cert.sealTitle || 'الختم المعتمد - منصة الآفاق الدولية');
    setFormIncludePlatformStamp(cert.includePlatformStamp ?? true);
    setFormBorderStyle((cert.borderStyle as any) || 'ROYAL_GOLD');
    setFormCustomLayoutFields(cert.customLayoutFields && cert.customLayoutFields.length > 0 ? cert.customLayoutFields : DEFAULT_CERTIFICATE_FIELDS);
    setEditorActiveTab('FIELDS');

    setIsIssueModalOpen(true);
  };

  // Construct real-time certificate preview object for visual designer
  const currentFormCertPreviewObject = useMemo<Partial<Certificate>>(() => {
    const std = students.find((s) => s.id === formStudentId);
    const prg = programs.find((p) => p.id === formProgramId);
    const tea = teachers.find((t) => t.id === formTeacherId);

    let sigUrl = formTeacherSignatureUrl;
    if (formSignatureType === 'DRAWN' && canvasRef.current && hasDrawnSignature) {
      sigUrl = canvasRef.current.toDataURL('image/png');
    }

    return {
      id: editingCertId || 'draft-preview',
      code: editingCertId ? certificates.find((c) => c.id === editingCertId)?.code || 'AETC-CERT-PREVIEW' : 'AETC-2026-PREVIEW',
      studentId: formStudentId,
      studentName: std ? std.name : 'طالب المنصة',
      studentNameArabic: std ? std.nameArabic || std.name : 'طالب المنصة',
      programId: formProgramId,
      programName: prg ? prg.name : 'البرنامج التعليمي',
      programNameArabic: prg ? prg.nameArabic || prg.name : 'البرنامج التعليمي',
      teacherId: formTeacherId,
      teacherName: tea ? tea.nameArabic || tea.name : formTeacherSignatureText || 'المعلم المعتمد',
      teacherTitle: formTeacherTitle,
      title: formTitle,
      description: formDescription,
      grade: formGrade,
      issueDate: formIssueDate,
      completionDate: formCompletionDate,
      templateMode: formTemplateMode,
      customBackgroundImageUrl: formTemplateMode === 'CUSTOM_IMAGE' ? formCustomBackgroundImageUrl : undefined,
      customImageWidth: formTemplateMode === 'CUSTOM_IMAGE' ? formCustomImageWidth : undefined,
      customImageHeight: formTemplateMode === 'CUSTOM_IMAGE' ? formCustomImageHeight : undefined,
      hideBuiltinBorders: formTemplateMode === 'CUSTOM_IMAGE' ? formHideBuiltinBorders : false,
      teacherSignatureType: formSignatureType,
      teacherSignatureText: formTeacherSignatureText,
      teacherSignatureUrl: sigUrl,
      teacherSealUrl: formTeacherSealUrl,
      sealTitle: formSealTitle,
      includePlatformStamp: formIncludePlatformStamp,
      borderStyle: formBorderStyle,
      customLayoutFields: formCustomLayoutFields,
    };
  }, [
    editingCertId,
    certificates,
    formStudentId,
    formProgramId,
    formTeacherId,
    formTitle,
    formGrade,
    formCompletionDate,
    formIssueDate,
    formDescription,
    formTemplateMode,
    formCustomBackgroundImageUrl,
    formCustomImageWidth,
    formCustomImageHeight,
    formHideBuiltinBorders,
    formSignatureType,
    formTeacherSignatureText,
    formTeacherSignatureUrl,
    formTeacherSealUrl,
    formTeacherTitle,
    formSealTitle,
    formIncludePlatformStamp,
    formBorderStyle,
    formCustomLayoutFields,
    hasDrawnSignature,
    students,
    programs,
    teachers,
  ]);

  // Handle Save / Issue Certificate
  const handleSaveCertificate = (e: React.FormEvent) => {
    e.preventDefault();

    const std = students.find(s => s.id === formStudentId);
    const prg = programs.find(p => p.id === formProgramId);
    const tea = teachers.find(t => t.id === formTeacherId);

    const studentName = std ? std.name : 'طالب المنصة';
    const studentNameArabic = std ? std.nameArabic || std.name : 'طالب المنصة';
    const programName = prg ? prg.name : 'البرنامج التعليمي';
    const programNameArabic = prg ? prg.nameArabic || prg.name : 'البرنامج التعليمي';
    const teacherName = tea ? tea.nameArabic || tea.name : formTeacherSignatureText || 'المعلم المعتمد';

    let signatureUrlToSave = formTeacherSignatureUrl;
    if (formSignatureType === 'DRAWN' && canvasRef.current && hasDrawnSignature) {
      signatureUrlToSave = canvasRef.current.toDataURL('image/png');
    }

    // Optionally save signature permanently to the teacher's profile
    if (formSaveSigToTeacherProfile && formTeacherId && signatureUrlToSave) {
      updateTeacher(formTeacherId, {
        signatureUrl: signatureUrlToSave,
        sealUrl: formTeacherSealUrl || undefined,
      });
    }

    const payload = {
      studentId: formStudentId,
      studentName,
      studentNameArabic,
      studentCode: std?.code || 'STD-000',
      programId: formProgramId,
      programName,
      programNameArabic,
      teacherId: formTeacherId,
      teacherName,
      teacherTitle: formTeacherTitle,
      title: formTitle,
      description: formDescription,
      grade: formGrade,
      issueDate: formIssueDate,
      completionDate: formCompletionDate,
      templateMode: formTemplateMode,
      customBackgroundImageUrl: formTemplateMode === 'CUSTOM_IMAGE' ? formCustomBackgroundImageUrl : undefined,
      customImageWidth: formTemplateMode === 'CUSTOM_IMAGE' ? formCustomImageWidth : undefined,
      customImageHeight: formTemplateMode === 'CUSTOM_IMAGE' ? formCustomImageHeight : undefined,
      hideBuiltinBorders: formTemplateMode === 'CUSTOM_IMAGE' ? formHideBuiltinBorders : false,
      teacherSignatureType: formSignatureType,
      teacherSignatureText: formTeacherSignatureText,
      teacherSignatureUrl: signatureUrlToSave,
      teacherSealUrl: formTeacherSealUrl,
      sealTitle: formSealTitle,
      includePlatformStamp: formIncludePlatformStamp,
      borderStyle: formBorderStyle,
      customLayoutFields: formCustomLayoutFields,
    };

    if (editingCertId) {
      updateCertificate(editingCertId, payload);
      if (selectedCertificateForView && selectedCertificateForView.id === editingCertId) {
        setSelectedCertificateForView({
          ...selectedCertificateForView,
          ...payload,
        });
      }
    } else {
      const created = issueCertificate({
        ...payload,
        issuedByUserId: currentUser?.id || 'admin',
        issuedByRole: currentUser?.role || 'SUPER_ADMIN',
        status: 'ISSUED',
      });
      setSelectedCertificateForView(created);
    }

    setIsIssueModalOpen(false);
    setEditingCertId(null);
  };

  // High Resolution PDF Exporter
  const handleExportCertificatePDF = async (cert: Certificate) => {
    setIsExportingPdf(true);
    try {
      await exportCertificateAsPDF(cert, cert.customLayoutFields || formCustomLayoutFields);
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Print Certificate trigger
  const handlePrintCertificate = () => {
    window.print();
  };

  // Copy Verification Link
  const handleCopyVerification = (cert: Certificate) => {
    const url = cert.qrVerificationUrl || `https://alafak.edu/verify/${cert.code}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Download High Resolution Certificate Image (PNG) with 100% Natural Original Dimensions
  const handleDownloadCertificatePNG = async (cert: Certificate) => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      
      // If custom template image, load and use its exact natural dimensions
      if (cert.templateMode === 'CUSTOM_IMAGE' && cert.customBackgroundImageUrl) {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          bgImg.onload = resolve;
          bgImg.onerror = resolve;
          bgImg.src = cert.customBackgroundImageUrl!;
        });

        const naturalWidth = (bgImg.naturalWidth && bgImg.naturalWidth > 0) ? bgImg.naturalWidth : (cert.customImageWidth || 2400);
        const naturalHeight = (bgImg.naturalHeight && bgImg.naturalHeight > 0) ? bgImg.naturalHeight : (cert.customImageHeight || 1700);

        canvas.width = naturalWidth;
        canvas.height = naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw natural background image at 1:1 original scale
        ctx.drawImage(bgImg, 0, 0, naturalWidth, naturalHeight);

        // Proportional scale factor relative to standard reference
        const scaleX = naturalWidth / 2400;
        const scaleY = naturalHeight / 1700;
        const fontScale = Math.min(scaleX, scaleY);

        ctx.textAlign = 'center';
        ctx.direction = 'rtl';

        // 1. Header Basmala & Title
        ctx.font = `bold ${Math.round(34 * fontScale)}px "Amiri", serif`;
        ctx.fillStyle = '#29235D';
        ctx.fillText('بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ', naturalWidth / 2, 190 * scaleY);

        ctx.font = `bold ${Math.round(40 * fontScale)}px "Cairo", sans-serif`;
        ctx.fillStyle = '#29235D';
        ctx.fillText('منصة الآفاق الدولية', naturalWidth / 2, 275 * scaleY);

        ctx.font = `bold ${Math.round(50 * fontScale)}px "Cairo", sans-serif`;
        ctx.fillStyle = '#8C6826';
        ctx.fillText(cert.title || 'شهادة إتمام وتفوق معتمدة', naturalWidth / 2, 390 * scaleY);

        // 2. Intro Text
        ctx.font = `${Math.round(30 * fontScale)}px "Cairo", sans-serif`;
        ctx.fillStyle = '#4B5563';
        ctx.fillText('تتشرف منصة الآفاق الدولية بأن تمنح هذه الشهادة المعتمدة إلى الطالب / الطالبة:', naturalWidth / 2, 510 * scaleY);

        // 3. Student Name Calligraphy
        ctx.font = `bold ${Math.round(72 * fontScale)}px "Amiri", "Cairo", serif`;
        ctx.fillStyle = '#29235D';
        ctx.fillText(cert.studentNameArabic || cert.studentName, naturalWidth / 2, 650 * scaleY);

        // 4. Program & Grade
        ctx.font = `bold ${Math.round(38 * fontScale)}px "Cairo", sans-serif`;
        ctx.fillStyle = '#1F2937';
        ctx.fillText(`لاجتيازه بنجاح وتفوق برنامج: ${cert.programNameArabic || cert.programName}`, naturalWidth / 2, 790 * scaleY);

        ctx.font = `bold ${Math.round(34 * fontScale)}px "Cairo", sans-serif`;
        ctx.fillStyle = '#8C6826';
        ctx.fillText(`التقدير العام: ${cert.grade || 'ممتاز مرتفع مع مرتبة الشرف'}`, naturalWidth / 2, 875 * scaleY);

        // 5. Description
        if (cert.description) {
          ctx.font = `${Math.round(26 * fontScale)}px "Cairo", sans-serif`;
          ctx.fillStyle = '#4B5563';
          ctx.fillText(cert.description, naturalWidth / 2, 980 * scaleY);
        }

        // 6. Teacher Signature & Title
        ctx.textAlign = 'right';
        ctx.font = `bold ${Math.round(30 * fontScale)}px "Cairo", sans-serif`;
        ctx.fillStyle = '#29235D';
        ctx.fillText(cert.teacherTitle || 'المعلم والمشرف الأكاديمي:', naturalWidth - (280 * scaleX), 1250 * scaleY);
        ctx.fillText(cert.teacherName || '', naturalWidth - (280 * scaleX), 1400 * scaleY);

        if (cert.teacherSignatureUrl) {
          const sigImg = new Image();
          sigImg.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            sigImg.onload = resolve;
            sigImg.onerror = resolve;
            sigImg.src = cert.teacherSignatureUrl!;
          });
          if (sigImg.width > 0) {
            ctx.drawImage(sigImg, naturalWidth - (520 * scaleX), 1270 * scaleY, 200 * scaleX, 90 * scaleY);
          }
        }

        // 7. Date & Code Footer
        ctx.textAlign = 'left';
        ctx.font = `bold ${Math.round(26 * fontScale)}px "Cairo", sans-serif`;
        ctx.fillStyle = '#4B5563';
        ctx.fillText(`تاريخ الإصدار: ${cert.issueDate}`, 280 * scaleX, 1270 * scaleY);
        ctx.fillText(`رقم الوثيقة: ${cert.code}`, 280 * scaleX, 1340 * scaleY);
        ctx.fillText('منصة الآفاق الدولية - Al-Afak International', 280 * scaleX, 1410 * scaleY);

      } else {
        // Built-in Royal Template (Standard 2400 x 1700)
        canvas.width = 2400;
        canvas.height = 1700;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Fill background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Royal Gold Built-in Certificate Background
        ctx.fillStyle = '#FCFAF7';
        ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80);

        // Golden Frame Borders
        ctx.strokeStyle = '#D3B673';
        ctx.lineWidth = 14;
        ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

        ctx.strokeStyle = '#29235D';
        ctx.lineWidth = 4;
        ctx.strokeRect(80, 80, canvas.width - 160, canvas.height - 160);

        // Draw Certificate Texts
        ctx.textAlign = 'center';
        ctx.direction = 'rtl';

        // Header Basmala / Title
        ctx.font = 'bold 36px "Amiri", serif';
        ctx.fillStyle = '#29235D';
        ctx.fillText('بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ', canvas.width / 2, 220);

        // Platform Name
        ctx.font = 'bold 44px "Cairo", sans-serif';
        ctx.fillStyle = '#29235D';
        ctx.fillText('منصة الآفاق الدولية', canvas.width / 2, 310);

        // Certificate Title
        ctx.font = 'bold 54px "Cairo", sans-serif';
        ctx.fillStyle = '#8C6826';
        ctx.fillText(cert.title || 'شهادة إتمام وتفوق معتمدة', canvas.width / 2, 450);

        // Recipient Intro
        ctx.font = '34px "Cairo", sans-serif';
        ctx.fillStyle = '#4B5563';
        ctx.fillText('تتشرف منصة الآفاق الدولية بأن تمنح هذه الشهادة المعتمدة إلى الطالب / الطالبة:', canvas.width / 2, 590);

        // Student Name (Prominent Luxury Calligraphy)
        ctx.font = 'bold 76px "Amiri", "Cairo", serif';
        ctx.fillStyle = '#29235D';
        ctx.fillText(cert.studentNameArabic || cert.studentName, canvas.width / 2, 730);

        // Course / Program & Grade
        ctx.font = 'bold 42px "Cairo", sans-serif';
        ctx.fillStyle = '#1F2937';
        ctx.fillText(`لاجتيازه بنجاح وتفوق برنامج: ${cert.programNameArabic || cert.programName}`, canvas.width / 2, 870);

        ctx.font = 'bold 38px "Cairo", sans-serif';
        ctx.fillStyle = '#8C6826';
        ctx.fillText(`التقدير العام: ${cert.grade || 'ممتاز مرتفع مع مرتبة الشرف'}`, canvas.width / 2, 960);

        // Description
        ctx.font = '30px "Cairo", sans-serif';
        ctx.fillStyle = '#4B5563';
        ctx.fillText(cert.description || '', canvas.width / 2, 1070);

        // Teacher Name & Signature Title
        ctx.textAlign = 'right';
        ctx.font = 'bold 34px "Cairo", sans-serif';
        ctx.fillStyle = '#29235D';
        ctx.fillText(cert.teacherTitle || 'المعلم والمشرف الأكاديمي:', canvas.width - 320, 1320);
        ctx.fillText(cert.teacherName || '', canvas.width - 320, 1480);

        // If signature image exists, draw it
        if (cert.teacherSignatureUrl) {
          const sigImg = new Image();
          sigImg.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            sigImg.onload = resolve;
            sigImg.onerror = resolve;
            sigImg.src = cert.teacherSignatureUrl!;
          });
          if (sigImg.width > 0) {
            ctx.drawImage(sigImg, canvas.width - 550, 1350, 200, 90);
          }
        }

        // Date & Code
        ctx.textAlign = 'left';
        ctx.font = 'bold 30px "Cairo", sans-serif';
        ctx.fillStyle = '#4B5563';
        ctx.fillText(`تاريخ الإصدار: ${cert.issueDate}`, 320, 1350);
        ctx.fillText(`رقم الوثيقة: ${cert.code}`, 320, 1420);
        ctx.fillText('منصة الآفاق الدولية - Al-Afak International', 320, 1490);
      }

      // Trigger download with full natural resolution PNG
      const link = document.createElement('a');
      link.download = `Al-Afak-Certificate-${cert.code}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error('Download certificate error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#29235D] via-[#1D1845] to-[#29235D] text-white shadow-xl border border-[#D3B673]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#D3B673]/20 to-transparent pointer-events-none rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-[#D3B673]/20 border border-[#D3B673]/40 text-[#E8D5A3]">
                <Award className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#E8D5A3] font-serif">
                {isRTL ? 'إدارة وتوثيق الشهادات المعتمدة' : 'Official Certificates & Accreditations'}
              </h1>
            </div>
            <p className="text-xs text-white/80 max-w-xl">
              {isRTL
                ? 'منصة الآفاق الدولية — إصدار وتصميم الشهادات بالقوالب المخصصة مع التوقيع الرقمي والباركود المعتمد.'
                : 'Al-Afak International — Issue custom template certificates with automated teacher signatures & QR codes.'}
            </p>
          </div>

          {(isAdmin || isTeacher) && (
            <button
              onClick={handleOpenIssueModal}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D3B673] to-[#E8D5A3] hover:from-[#E8D5A3] hover:to-[#D3B673] text-[#29235D] font-bold text-xs shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20 self-start md:self-auto"
            >
              <Plus className="w-4 h-4 text-[#29235D]" />
              <span>{isRTL ? 'إصدار شهادة جديدة' : 'Issue New Certificate'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isRTL ? 'بحث بالاسم، الكود، البرنامج، أو المعلم...' : 'Search by name, code, program...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FBF9F4] border border-gray-200 rounded-xl text-xs text-[#29235D] focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedProgramFilter}
            onChange={e => setSelectedProgramFilter(e.target.value)}
            className="w-full sm:w-56 p-2 bg-[#FBF9F4] border border-gray-200 rounded-xl text-xs text-[#29235D] font-bold focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
          >
            <option value="ALL">{isRTL ? 'جميع البرامج التعليمية' : 'All Programs'}</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>
                {isRTL ? p.nameArabic || p.name : p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Certificates Grid List */}
      {visibleCertificates.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-gray-200 space-y-3">
          <Award className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-700">
            {isRTL ? 'لا توجد شهادات مطابقة' : 'No Certificates Found'}
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            {isRTL
              ? 'لم يتم إصدار شهادات بعد وفق معايير البحث المحددة. يمكنك الضغط على "إصدار شهادة جديدة" للبدء.'
              : 'No certificates match the current filter. Click "Issue New Certificate" to create one.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {visibleCertificates.map(cert => (
            <div
              key={cert.id}
              className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group overflow-hidden"
            >
              {/* Gold Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#29235D] via-[#D3B673] to-[#29235D]" />

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D3B673]/20 text-[#8C6826] border border-[#D3B673]/40">
                    {cert.code}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>{cert.issueDate}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#29235D] font-serif line-clamp-1">
                    {cert.studentNameArabic || cert.studentName}
                  </h3>
                  <p className="text-xs text-[#8C6826] font-bold line-clamp-1 mt-0.5">
                    {cert.programNameArabic || cert.programName}
                  </p>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#FBF9F4] border border-gray-100 space-y-1 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-500">{isRTL ? 'التقدير الأكاديمي:' : 'Grade / Honors:'}</span>
                    <span className="font-bold text-[#29235D]">{cert.grade}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-500">{isRTL ? 'المعلم المشرف:' : 'Teacher:'}</span>
                    <span className="font-bold text-[#29235D]">{cert.teacherName}</span>
                  </div>
                  {cert.templateMode === 'CUSTOM_IMAGE' && (
                    <div className="pt-1 flex items-center gap-1 text-[10px] text-amber-700 font-bold">
                      <Sparkles className="w-3 h-3 text-[#D3B673]" />
                      <span>{isRTL ? 'قالب شهادة مخصص' : 'Custom Image Template'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedCertificateForView(cert)}
                    className="px-3 py-1.5 rounded-xl bg-[#29235D] text-[#D3B673] hover:bg-[#1D1845] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'معاينة وطباعة' : 'View & Print'}</span>
                  </button>

                  <button
                    onClick={() => handleExportCertificatePDF(cert)}
                    disabled={isExportingPdf}
                    className="px-2.5 py-1.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-red-200"
                    title={isRTL ? 'تصدير كملف PDF عالي الدقة جاهز للطباعة' : 'Export High-Resolution PDF'}
                  >
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                    <span>PDF</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {(isAdmin || isTeacher) && (
                    <>
                      <button
                        onClick={() => handleOpenEdit(cert)}
                        className="p-2 rounded-xl text-gray-500 hover:text-[#29235D] hover:bg-gray-100 transition-all cursor-pointer"
                        title={isRTL ? 'تعديل الشهادة' : 'Edit'}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(isRTL ? 'هل أنت متأكد من حذف هذه الشهادة نهائياً؟' : 'Delete this certificate?')) {
                            deleteCertificate(cert.id);
                          }
                        }}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                        title={isRTL ? 'حذف الشهادة' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* CERTIFICATE FULL PREVIEW & PRINT MODAL (STANDARD A4 LANDSCAPE)            */}
      {/* ========================================================================= */}
      {selectedCertificateForView && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedCertificateForView(null);
            }
          }}
        >
          {/* Quick Floating Exit Button at Top Screen Corner for Easy Access */}
          <button
            type="button"
            onClick={() => setSelectedCertificateForView(null)}
            className="fixed top-3 left-3 z-[60] px-3.5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer border border-white/40 print:hidden hover:scale-105 active:scale-95"
            title="إغلاق المعاينة والرجوع"
          >
            <X className="w-4 h-4" />
            <span>{isRTL ? 'إغلاق المعاينة (ESC)' : 'Close Preview (ESC)'}</span>
          </button>

          <div 
            className="bg-white rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-gray-200 shadow-2xl overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none print:max-h-none"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Top Modal Toolbar (Sticky & High-Contrast) */}
            <div className="p-3 sm:p-4 bg-gradient-to-r from-[#29235D] to-[#1D1845] text-white flex flex-wrap items-center justify-between gap-2 shrink-0 print:hidden border-b border-[#D3B673]/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#D3B673]/20 border border-[#D3B673]/40 flex items-center justify-center">
                  <Award className="w-4 h-4 text-[#D3B673]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-[#E8D5A3] font-serif block line-clamp-1">
                      منصة الآفاق الدولية — {selectedCertificateForView.code}
                    </span>
                    {selectedCertificateForView.templateMode === 'CUSTOM_IMAGE' && (
                      <span className="px-2 py-0.5 rounded-full bg-[#D3B673]/20 border border-[#D3B673]/50 text-[#E8D5A3] text-[9px] font-bold">
                        {selectedCertificateForView.customImageWidth && selectedCertificateForView.customImageHeight 
                          ? `📐 أبعاد أصلية: ${selectedCertificateForView.customImageWidth} × ${selectedCertificateForView.customImageHeight}` 
                          : '📐 قالب مخصص بحجم طبيعي'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-300">
                    {selectedCertificateForView.studentNameArabic || selectedCertificateForView.studentName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {/* Fit / Zoom Mode Selector */}
                <div className="hidden md:flex items-center bg-black/40 rounded-xl p-0.5 border border-white/10 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPreviewZoomMode('FIT')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      previewZoomMode === 'FIT' ? 'bg-[#D3B673] text-[#29235D] shadow-xs' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {isRTL ? 'ملاءمة الشاشة' : 'Fit Screen'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewZoomMode('ORIGINAL')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      previewZoomMode === 'ORIGINAL' ? 'bg-[#D3B673] text-[#29235D] shadow-xs' : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {isRTL ? 'الحجم الكامل' : 'Original Size'}
                  </button>
                </div>

                {/* High-Resolution PDF Export Button */}
                <button
                  type="button"
                  onClick={() => handleExportCertificatePDF(selectedCertificateForView)}
                  disabled={isExportingPdf}
                  className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95 border border-red-400/30"
                  title="تصدير كملف PDF فائق الدقة مناسب للمطابع"
                >
                  <FileText className="w-4 h-4" />
                  <span>{isExportingPdf ? (isRTL ? 'جاري إنشاء PDF...' : 'Generating...') : (isRTL ? 'تصدير PDF عالي الدقة' : 'Export High-Res PDF')}</span>
                </button>

                {/* Print Button */}
                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  className="px-3 sm:px-4 py-1.5 rounded-xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
                  title="طباعة الشهادة"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isRTL ? 'طباعة / PDF' : 'Print'}</span>
                </button>

                {/* High Res Download */}
                <button
                  type="button"
                  onClick={() => handleDownloadCertificatePNG(selectedCertificateForView)}
                  disabled={isDownloading}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#E8D5A3] font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                  title="تحميل صورة الشهادة عالية الدقة بالحجم الطبيعي"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">{isDownloading ? (isRTL ? 'جاري التحميل...' : 'Downloading...') : (isRTL ? 'تحميل PNG الأصلي' : 'Download Original PNG')}</span>
                </button>

                {/* Copy QR verification */}
                <button
                  type="button"
                  onClick={() => handleCopyVerification(selectedCertificateForView)}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{copySuccess ? (isRTL ? 'تم!' : 'Done!') : (isRTL ? 'نسخ الرابط' : 'Link')}</span>
                </button>

                {/* Main Prominent Close Button */}
                <button
                  type="button"
                  onClick={() => setSelectedCertificateForView(null)}
                  className="px-3 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm ml-1"
                  title="إغلاق المعاينة والرجوع"
                >
                  <X className="w-4 h-4" />
                  <span>{isRTL ? 'إغلاق' : 'Close'}</span>
                </button>
              </div>
            </div>

            {/* Scrollable Printable Certificate Canvas Container */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-[#F6F4EE] print:p-0 print:bg-white flex flex-col items-center justify-center min-h-0">
              
              {/* Certificate Box with Dynamic Aspect-Ratio & 100% Natural Dimension Support */}
              <div
                ref={certificatePrintRef}
                id="printable-certificate"
                className={`w-full bg-white rounded-xl sm:rounded-2xl shadow-xl relative overflow-hidden select-none flex flex-col justify-between transition-all print:border-none print:shadow-none print:rounded-none print:w-[297mm] print:h-[210mm] ${
                  selectedCertificateForView.templateMode === 'CUSTOM_IMAGE' && (selectedCertificateForView.hideBuiltinBorders ?? true)
                    ? 'border border-gray-200'
                    : 'border-4 sm:border-8 border-double border-[#D3B673]'
                } ${
                  previewZoomMode === 'FIT'
                    ? 'max-w-[820px] max-h-[64vh] p-4 sm:p-6'
                    : 'max-w-[980px] p-6 sm:p-10 my-2'
                }`}
                style={{
                  aspectRatio: (selectedCertificateForView.templateMode === 'CUSTOM_IMAGE' && selectedCertificateForView.customImageWidth && selectedCertificateForView.customImageHeight)
                    ? `${selectedCertificateForView.customImageWidth} / ${selectedCertificateForView.customImageHeight}`
                    : '1.414 / 1',
                  ...(selectedCertificateForView.templateMode === 'CUSTOM_IMAGE' && selectedCertificateForView.customBackgroundImageUrl
                    ? {
                        backgroundImage: `url(${selectedCertificateForView.customBackgroundImageUrl})`,
                        backgroundSize: '100% 100%',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }
                    : {}),
                }}
              >
                {/* Background Watermark/Emblem for built-in template */}
                {selectedCertificateForView.templateMode !== 'CUSTOM_IMAGE' && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <Award className="w-[450px] h-[450px] text-[#29235D]" />
                  </div>
                )}

                {/* TOP HEADER SECTION */}
                <div className="relative z-10 space-y-1 sm:space-y-2 text-center shrink-0">
                  <div className="text-center space-y-0.5">
                    <p className="text-[10px] sm:text-sm font-serif text-[#29235D] font-bold tracking-wide">
                      بِسْمِ اللَّـهِ الرَّحْمَـٰنِ الرَّحِيمِ
                    </p>
                    <div className="w-20 sm:w-36 h-0.5 bg-gradient-to-r from-transparent via-[#D3B673] to-transparent mx-auto" />
                  </div>

                  <div className="flex items-center justify-between border-b-2 border-[#D3B673]/30 pb-2 sm:pb-3">
                    <div className="text-right space-y-0.5">
                      <h4 className="text-xs sm:text-base font-bold text-[#29235D] font-serif">
                        منصة الآفاق الدولية
                      </h4>
                      <p className="text-[8px] sm:text-xs text-gray-500 font-sans">
                        Al-Afak International
                      </p>
                    </div>

                    {/* Certificate Official Title Badge */}
                    <div className="px-3 sm:px-6 py-0.5 sm:py-1 rounded-full bg-[#29235D] text-[#D3B673] font-bold text-[10px] sm:text-base border border-[#D3B673]/40 shadow-xs font-serif">
                      {selectedCertificateForView.title || 'شهادة إتمام وتفوق معتمدة'}
                    </div>

                    <div className="text-left font-mono text-[8px] sm:text-xs text-gray-500">
                      <div>No: <span className="font-bold text-[#29235D]">{selectedCertificateForView.code}</span></div>
                      <div>Date: <span className="font-bold text-[#29235D]">{selectedCertificateForView.issueDate}</span></div>
                    </div>
                  </div>
                </div>

                {/* CENTER BODY: STUDENT NAME, PROGRAM & GRADE */}
                <div className="relative z-10 text-center space-y-1.5 sm:space-y-3 my-auto max-w-2xl mx-auto py-1 sm:py-2">
                  <p className="text-[10px] sm:text-sm text-gray-600 font-serif">
                    تتشرف منصة الآفاق الدولية بأن تمنح هذه الشهادة والاعتماد الأكاديمي إلى الطالب:
                  </p>

                  {/* Student Name Calligraphy */}
                  <div className="py-0.5 sm:py-1 border-b-2 border-dashed border-[#D3B673] inline-block min-w-[220px] sm:min-w-[380px]">
                    <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-[#29235D] font-serif tracking-wide drop-shadow-xs">
                      {selectedCertificateForView.studentNameArabic || selectedCertificateForView.studentName}
                    </h2>
                  </div>

                  {/* Program Description */}
                  <p className="text-[10px] sm:text-xs md:text-sm text-gray-700 leading-relaxed font-sans px-2 sm:px-4 line-clamp-3">
                    {selectedCertificateForView.description ||
                      `وذلك لاجتيازه بنجاح وتفوق برنامج "${selectedCertificateForView.programNameArabic || selectedCertificateForView.programName}"، بعد إتمام جميع الساعات المعتمدة والمتطلبات المقررة.`}
                  </p>

                  {/* Grade Badge */}
                  <div className="pt-0.5">
                    <span className="inline-block px-3 sm:px-5 py-0.5 sm:py-1 rounded-xl bg-gradient-to-r from-amber-50 to-[#E8D5A3]/40 border border-[#D3B673] text-[#29235D] font-bold text-[10px] sm:text-sm shadow-xs font-serif">
                      التقدير العام: {selectedCertificateForView.grade}
                    </span>
                  </div>
                </div>

                {/* BOTTOM FOOTER: TEACHER SIGNATURE, STAMP & QR CODE */}
                <div className="relative z-10 grid grid-cols-3 items-end pt-2 sm:pt-4 border-t-2 border-[#D3B673]/30 text-center text-xs shrink-0">
                  
                  {/* Column 1: Teacher Signature & Title */}
                  <div className="flex flex-col items-center space-y-0.5 sm:space-y-1">
                    <span className="text-[9px] sm:text-xs font-bold text-gray-600 block line-clamp-1">
                      {selectedCertificateForView.teacherTitle || 'المعلم والمشرف الأكاديمي'}
                    </span>
                    
                    {/* Render Dynamic Teacher Signature */}
                    <div className="h-9 sm:h-12 flex items-center justify-center">
                      {selectedCertificateForView.teacherSignatureUrl ? (
                        <img
                          src={selectedCertificateForView.teacherSignatureUrl}
                          alt="Teacher Signature"
                          className="max-h-9 sm:max-h-12 max-w-[100px] sm:max-w-[150px] object-contain"
                        />
                      ) : (
                        <span className="font-serif italic text-xs sm:text-base text-[#29235D] font-bold border-b border-gray-400 pb-0.5">
                          {selectedCertificateForView.teacherSignatureText || selectedCertificateForView.teacherName}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] sm:text-xs font-bold text-[#29235D] line-clamp-1">
                      {selectedCertificateForView.teacherName}
                    </span>
                  </div>

                  {/* Column 2: Official Platform Seal */}
                  <div className="flex flex-col items-center justify-center space-y-0.5">
                    {selectedCertificateForView.includePlatformStamp ? (
                      <div className="w-12 h-12 sm:w-18 sm:h-18 rounded-full border-2 sm:border-4 border-double border-[#D3B673] bg-gradient-to-br from-amber-500/10 via-[#D3B673]/20 to-amber-600/10 flex flex-col items-center justify-center text-[#29235D] shadow-inner p-0.5">
                        <Sparkles className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#D3B673]" />
                        <span className="text-[7px] sm:text-[9px] font-bold leading-tight mt-0.5 font-serif">منصة الآفاق الدولية</span>
                        <span className="text-[6px] sm:text-[7px] font-bold text-[#8C6826] uppercase">ختم الاعتماد</span>
                        <span className="text-[5px] sm:text-[6px] text-gray-500 font-mono">{new Date().getFullYear()}</span>
                      </div>
                    ) : (
                      <div className="h-12 sm:h-18" />
                    )}
                    <span className="text-[7px] sm:text-[8px] text-gray-400 font-mono">Official Accreditation</span>
                  </div>

                  {/* Column 3: Digital Verification QR Code */}
                  <div className="flex flex-col items-center space-y-0.5 sm:space-y-1">
                    <span className="text-[9px] sm:text-xs font-bold text-gray-600 block line-clamp-1">
                      التحقق والتوثيق الرقمي
                    </span>

                    <div className="p-0.5 sm:p-1 rounded-lg bg-white border border-[#D3B673] shadow-xs">
                      <QrCode className="w-8 h-8 sm:w-11 sm:h-11 text-[#29235D]" />
                    </div>

                    <span className="text-[8px] sm:text-[9px] font-mono text-gray-500 line-clamp-1">
                      alafak.edu/verify/{selectedCertificateForView.code}
                    </span>
                  </div>

                </div>

              </div>

            </div>

            {/* Bottom Modal Footer with Clear Dismiss / Print Actions */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 shrink-0 print:hidden text-xs">
              <span className="text-gray-500 text-[11px] hidden sm:inline">
                {isRTL ? '💡 يمكنك الضغط على زر ESC في لوحة المفاتيح أو الضغط خارج النافذة للإغلاق' : '💡 Press ESC or click outside to exit preview'}
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedCertificateForView(null)}
                  className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <X className="w-4 h-4 text-gray-600" />
                  <span>{isRTL ? 'إغلاق المعاينة والرجوع' : 'Close and Return'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  className="px-4 py-2 rounded-xl bg-[#29235D] text-[#D3B673] hover:bg-[#1D1845] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isRTL ? 'طباعة الشهادة الآن' : 'Print Certificate'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ISSUE / EDIT CERTIFICATE MODAL WITH TEMPLATE UPLOAD & SIGNATURE INTEGRATION*/}
      {/* ========================================================================= */}
      {isIssueModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsIssueModalOpen(false);
            }
          }}
        >
          {/* Quick Floating Exit Button */}
          <button
            type="button"
            onClick={() => setIsIssueModalOpen(false)}
            className="fixed top-3 left-3 z-[60] px-3.5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer border border-white/40 hover:scale-105 active:scale-95"
            title="إلغاء وإغلاق"
          >
            <X className="w-4 h-4" />
            <span>{isRTL ? 'إلغاء (ESC)' : 'Cancel (ESC)'}</span>
          </button>

          <div 
            className="bg-white rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-gray-200 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#29235D] to-[#1D1845] text-white flex justify-between items-center shrink-0 border-b border-[#D3B673]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#D3B673]/20 border border-[#D3B673]/40 text-[#D3B673] flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#E8D5A3] font-serif">
                    {editingCertId ? (isRTL ? 'تعديل بيانات وقالب الشهادة' : 'Edit Certificate & Template') : (isRTL ? 'إصدار شهادة معتمدة جديدة' : 'Issue New Certificate')}
                  </h3>
                  <p className="text-[11px] text-gray-300">
                    منصة الآفاق الدولية — Al-Afak International
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsIssueModalOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-600 text-gray-200 hover:text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              >
                <X className="w-4 h-4" />
                <span>{isRTL ? 'إغلاق' : 'Close'}</span>
              </button>
            </div>

            {/* Modal Navigation Tabs (Details vs Drag & Drop Visual Designer) */}
            <div className="bg-slate-100 p-2 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditorActiveTab('FIELDS')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    editorActiveTab === 'FIELDS'
                      ? 'bg-[#29235D] text-[#D3B673] shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{isRTL ? '1. بيانات ومعلومات الشهادة' : '1. Certificate Data'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditorActiveTab('VISUAL_DESIGNER')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    editorActiveTab === 'VISUAL_DESIGNER'
                      ? 'bg-gradient-to-r from-amber-600 to-[#29235D] text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <Move className="w-4 h-4 text-[#D3B673]" />
                  <span>{isRTL ? '2. محرر السحب والإفلات والمواقع' : '2. Drag & Drop Visual Designer'}</span>
                  {formTemplateMode === 'CUSTOM_IMAGE' && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-bold">
                      {formCustomImageWidth ? `${formCustomImageWidth}px` : 'مخصص'}
                    </span>
                  )}
                </button>
              </div>

              {editorActiveTab === 'FIELDS' && formTemplateMode === 'CUSTOM_IMAGE' && formCustomBackgroundImageUrl && (
                <button
                  type="button"
                  onClick={() => setEditorActiveTab('VISUAL_DESIGNER')}
                  className="hidden sm:flex px-3 py-1.5 rounded-lg bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold text-xs items-center gap-1.5 transition-all cursor-pointer shadow-xs animate-pulse"
                >
                  <Move className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'الانتقال لتوزيع النصوص على القالب ←' : 'Position Texts on Template →'}</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveCertificate} className="flex-1 flex flex-col overflow-hidden min-h-0">
              {editorActiveTab === 'FIELDS' ? (
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
                  {/* 1. Student & Program Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#29235D]">
                    {isRTL ? 'اسم الطالب المستحق للشهادة *' : 'Student Name *'}
                  </label>
                  <select
                    value={formStudentId}
                    onChange={e => setFormStudentId(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-[#FBF9F4] border border-gray-300 text-xs font-bold text-[#29235D] focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {isRTL ? s.nameArabic || s.name : s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#29235D]">
                    {isRTL ? 'اسم الدورة أو البرنامج التعليمي *' : 'Course / Program Name *'}
                  </label>
                  <select
                    value={formProgramId}
                    onChange={e => setFormProgramId(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-[#FBF9F4] border border-gray-300 text-xs font-bold text-[#29235D] focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                  >
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>
                        {isRTL ? p.nameArabic || p.name : p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Certificate Title & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#29235D]">
                    {isRTL ? 'عنوان ونوع الشهادة *' : 'Certificate Title *'}
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    required
                    placeholder="مثال: شهادة إتمام وتفوق معتمدة"
                    className="w-full p-2.5 rounded-xl bg-[#FBF9F4] border border-gray-300 text-xs text-[#29235D] focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#29235D]">
                    {isRTL ? 'التقييم / التقدير الأكاديمي *' : 'Grade / Assessment *'}
                  </label>
                  <input
                    type="text"
                    value={formGrade}
                    onChange={e => setFormGrade(e.target.value)}
                    required
                    placeholder="مثال: ممتاز مرتفع مع مرتبة الشرف (98%)"
                    className="w-full p-2.5 rounded-xl bg-[#FBF9F4] border border-gray-300 text-xs font-bold text-[#29235D] focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. Issue Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#29235D]">
                    {isRTL ? 'تاريخ اجتياز الدورة' : 'Completion Date'}
                  </label>
                  <input
                    type="date"
                    value={formCompletionDate}
                    onChange={e => setFormCompletionDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#FBF9F4] border border-gray-300 text-xs text-[#29235D] focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#29235D]">
                    {isRTL ? 'تاريخ إصدار الشهادة' : 'Issue Date'}
                  </label>
                  <input
                    type="date"
                    value={formIssueDate}
                    onChange={e => setFormIssueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#FBF9F4] border border-gray-300 text-xs text-[#29235D] focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. Description Text */}
              <div className="space-y-1">
                <label className="font-bold text-[#29235D]">
                  {isRTL ? 'نص ونصيب التقدير المعتمد' : 'Certificate Text'}
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#FBF9F4] border border-gray-300 text-xs text-[#29235D] focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                />
              </div>

              {/* ================================================================= */}
              {/* 5. CERTIFICATE TEMPLATE & BACKGROUND SELECTION                    */}
              {/* ================================================================= */}
              <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#D3B673]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-[#29235D]">
                    <ImageIcon className="w-4 h-4 text-[#D3B673]" />
                    <span>{isRTL ? 'تصميم وقالب الشهادة (أو رفع صورة القالب الخاص بك)' : 'Certificate Design & Template Background'}</span>
                  </div>
                  <span className="text-[10px] text-[#8C6826] font-bold">A4 Landscape</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormTemplateMode('BUILT_IN')}
                    className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      formTemplateMode === 'BUILT_IN'
                        ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isRTL ? 'النمط الملكي المعتمد للمنصة' : 'Official Royal Template'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormTemplateMode('CUSTOM_IMAGE');
                      if (!formCustomBackgroundImageUrl) {
                        templateUploadInputRef.current?.click();
                      }
                    }}
                    className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      formTemplateMode === 'CUSTOM_IMAGE'
                        ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isRTL ? 'رفع قالب صورة مخصص (JPG/PNG)' : 'Upload Custom Image Template'}</span>
                  </button>
                </div>

                {/* Custom Image Upload Box */}
                {formTemplateMode === 'CUSTOM_IMAGE' && (
                  <div className="p-3.5 bg-white rounded-xl border border-gray-200 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#29235D]">
                        {isRTL ? 'صورة قالب الشهادة المرفوعة:' : 'Custom Certificate Template Image:'}
                      </span>
                      <input
                        type="file"
                        ref={templateUploadInputRef}
                        onChange={handleTemplateFileUpload}
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => templateUploadInputRef.current?.click()}
                        className="px-3 py-1.5 bg-[#29235D] text-[#D3B673] rounded-lg text-[10px] font-bold hover:bg-[#1D1845] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'اختيار صورة القالب من جهازك' : 'Browse Local Image'}</span>
                      </button>
                    </div>

                    {formCustomBackgroundImageUrl ? (
                      <div className="space-y-2">
                        <div className="relative rounded-xl overflow-hidden border border-emerald-300 h-28 bg-gray-100 flex items-center justify-center">
                          <img
                            src={formCustomBackgroundImageUrl}
                            alt="Custom Template Preview"
                            className="w-full h-full object-contain bg-slate-900/5"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-between px-3 text-white">
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-emerald-300">✓ تم تفعيل القالب المخصص</span>
                              {formCustomImageWidth && formCustomImageHeight && (
                                <span className="text-[10px] text-gray-200 font-mono">
                                  📐 {formCustomImageWidth} × {formCustomImageHeight} بكسل (حجم طبيعي 100%)
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setFormCustomBackgroundImageUrl('');
                                setFormCustomImageWidth(undefined);
                                setFormCustomImageHeight(undefined);
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                            >
                              {isRTL ? 'إلغاء الصورة' : 'Remove'}
                            </button>
                          </div>
                        </div>

                        {/* Natural Size Confirmation Notice & Visual Designer Shortcut */}
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              {isRTL
                                ? 'سيتم تنزيل الشهادة بالأبعاد والدقة الطبيعية الأصلية 100% بدون أي مط أو تغيير في المقاسات.'
                                : 'Certificate will download at 100% natural dimensions and aspect ratio without stretching.'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setEditorActiveTab('VISUAL_DESIGNER')}
                            className="px-3 py-1.5 bg-[#29235D] text-[#D3B673] rounded-lg text-xs font-bold hover:bg-[#1D1845] transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
                          >
                            <Move className="w-3.5 h-3.5" />
                            <span>{isRTL ? 'توزيع النصوص على القالب بالسحب' : 'Drag & Position Texts'}</span>
                          </button>
                        </div>

                        {/* Option to toggle border */}
                        <label className="flex items-center gap-2 text-[11px] text-gray-700 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={formHideBuiltinBorders}
                            onChange={(e) => setFormHideBuiltinBorders(e.target.checked)}
                            className="rounded text-[#29235D] focus:ring-[#29235D] w-3.5 h-3.5"
                          />
                          <span>
                            {isRTL
                              ? 'إخفاء إطار المنصة الذهبي التلقائي (حتى يظهر برواز القالب المرفوع فقط بدون تداخل)'
                              : 'Hide default gold frame to keep only uploaded template borders'}
                          </span>
                        </label>
                      </div>
                    ) : (
                      <div className="p-4 border-2 border-dashed border-gray-300 rounded-xl text-center text-gray-400 bg-gray-50/50">
                        <p className="text-[11px]">
                          {isRTL
                            ? 'ارفع صورة القالب الفارغ وسيقوم النظام بتنزيل الشهادة بحجمها الطبيعي الأصلي كما هي تماماً وتنسيق البيانات فوقها.'
                            : 'Upload your certificate template image and it will be downloaded at 100% original dimensions.'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ================================================================= */}
              {/* 6. TEACHER SELECTION & AUTOMATIC SIGNATURE RETRIEVAL               */}
              {/* ================================================================= */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[#29235D]/5 to-transparent border border-[#D3B673]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-[#29235D]">
                    <PenTool className="w-4 h-4 text-[#D3B673]" />
                    <span>{isRTL ? 'بيانات المعلم واستدعاء التوقيع المعتمد' : 'Teacher Data & Signature Retrieval'}</span>
                  </div>
                  {teacherSignatureFoundAlert && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>{isRTL ? 'تم استدعاء التوقيع تلقائياً' : 'Signature Auto-Retrieved'}</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-[#29235D]">
                      {isRTL ? 'اسم المعلم المعتمد *' : 'Signing Teacher *'}
                    </label>
                    <select
                      value={formTeacherId}
                      onChange={e => setFormTeacherId(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl bg-white border border-gray-300 text-xs font-bold text-[#29235D] focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                    >
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {isRTL ? t.nameArabic || t.name : t.name} ({t.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#29235D]">
                      {isRTL ? 'المسمى الوظيفي للمعلم' : 'Teacher Title'}
                    </label>
                    <input
                      type="text"
                      value={formTeacherTitle}
                      onChange={e => setFormTeacherTitle(e.target.value)}
                      placeholder="مثال: المعلم والمشرف الأكاديمي"
                      className="w-full p-2.5 rounded-xl bg-white border border-gray-300 text-xs text-[#29235D] focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Signature Preview & Controls */}
                <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#29235D]">
                      {isRTL ? 'توقيع المعلم المستدعى في الشهادة:' : 'Teacher Signature for Certificate:'}
                    </span>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={signatureUploadInputRef}
                        onChange={handleSignatureFileUpload}
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => signatureUploadInputRef.current?.click()}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-[#29235D] rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3 text-[#8C6826]" />
                        <span>{isRTL ? 'رفع صورة توقيع جديدة' : 'Upload Signature Image'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFormSignatureType('DRAWN');
                        }}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-[#29235D] rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <PenTool className="w-3 h-3 text-[#8C6826]" />
                        <span>{isRTL ? 'رسم بالماوس' : 'Draw Live'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Draw Signature Canvas */}
                  {formSignatureType === 'DRAWN' && (
                    <div className="border-2 border-dashed border-[#29235D]/30 rounded-xl p-1 bg-[#FBF9F4] space-y-1">
                      <div className="flex justify-between items-center px-1 text-[10px] text-gray-500">
                        <span>{isRTL ? '✍️ ارسم التوقيع هنا:' : '✍️ Draw signature:'}</span>
                        <button
                          type="button"
                          onClick={handleClearCanvas}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          {isRTL ? 'مسح' : 'Clear'}
                        </button>
                      </div>
                      <canvas
                        ref={canvasRef}
                        width={450}
                        height={100}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-24 bg-white rounded-lg cursor-crosshair touch-none"
                      />
                    </div>
                  )}

                  {/* Display Active Signature */}
                  {formTeacherSignatureUrl && (
                    <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={formTeacherSignatureUrl}
                          alt="Signature Preview"
                          className="h-10 max-w-[140px] object-contain"
                        />
                        <span className="text-[10px] text-emerald-800 font-bold">
                          {isRTL ? '✓ التوقيع جاهز وسيتم إدراجه تلقائياً' : '✓ Signature ready for certificate'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setFormTeacherSignatureUrl('');
                          setFormSignatureType('TEXT');
                        }}
                        className="text-xs text-red-500 hover:text-red-700 font-bold px-2"
                      >
                        {isRTL ? 'تغيير' : 'Change'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Platform Seal & Save Option */}
                <div className="pt-2 border-t border-[#D3B673]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIncludePlatformStamp}
                      onChange={e => setFormIncludePlatformStamp(e.target.checked)}
                      className="rounded text-[#29235D] focus:ring-[#D3B673]"
                    />
                    <span className="font-bold text-[#29235D]">
                      {isRTL ? 'إدراج الختم الرسمي لمنصة الآفاق الدولية' : 'Include Official Platform Seal'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formSaveSigToTeacherProfile}
                      onChange={e => setFormSaveSigToTeacherProfile(e.target.checked)}
                      className="rounded text-[#29235D] focus:ring-[#D3B673]"
                    />
                    <span className="text-gray-600 font-bold">
                      {isRTL ? 'حفظ التوقيع كالتوقيع الدائم للمعلم' : 'Save as permanent teacher signature'}
                    </span>
                  </label>
                </div>
              </div>
                </div>
              ) : (
                /* Tab 2: Visual Drag-and-Drop Designer & Live Natural Resolution Preview */
                <div className="flex-1 overflow-hidden p-2 sm:p-4 bg-slate-950 flex flex-col min-h-0">
                  <CertificateVisualDesigner
                    cert={currentFormCertPreviewObject}
                    fields={formCustomLayoutFields}
                    onChangeFields={setFormCustomLayoutFields}
                    isRTL={isRTL}
                    onExportPDF={() => handleExportCertificatePDF(currentFormCertPreviewObject as any)}
                  />
                </div>
              )}

              {/* Form Action Buttons (Sticky Footer) */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
                <span className="text-[11px] text-gray-500 hidden sm:inline">
                  {isRTL ? '💡 يمكنك الضغط على زر ESC للإلغاء والعودة' : '💡 Press ESC to cancel and close'}
                </span>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsIssueModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-100 cursor-pointer transition-all"
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#29235D] to-[#1D1845] text-[#D3B673] font-bold border border-[#D3B673] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Award className="w-4 h-4" />
                    <span>
                      {editingCertId
                        ? (isRTL ? 'حفظ التعديلات على الشهادة' : 'Save Changes')
                        : (isRTL ? 'اعتماد وإصدار الشهادة' : 'Issue Certificate')}
                    </span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
