import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import {
  User,
  ShieldCheck,
  CreditCard,
  Key,
  Globe,
  CheckCircle2,
  Copy,
  Mail,
  Phone,
  Sparkles,
  Camera,
  Upload,
  Lock,
  Eye,
  EyeOff,
  Save,
  Check,
  Edit3,
  Award,
  BookOpen,
  PenTool,
  Stamp,
  RotateCcw,
} from 'lucide-react';

const AVATAR_PRESETS = [
  {
    name: 'General Supervisor (Formal Portrait)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Islamic Academic Dean (Sheikh)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Senior Education Consultant',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Distinguished Professor (Female)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Executive Academic Director',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Classical Arabic Scholar',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'University Chancellor',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80',
  },
  {
    name: 'Senior Lecturer',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  },
];

export const ProfileView: React.FC = () => {
  const { currentUser, settings, updateCurrentUserProfile, updateAdminPasscode, logout } = useApp();
  const { t, lang, setLang, isRTL } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [copiedCode, setCopiedCode] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [name, setName] = useState(currentUser?.name || '');
  const [nameArabic, setNameArabic] = useState(currentUser?.nameArabic || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  // Master Passcode State for Super Admin
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';
  const [passcode, setPasscode] = useState(settings.adminPasscode || 'admin123');
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcodeSaved, setPasscodeSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  if (!currentUser) return null;

  const copyAccessCode = () => {
    navigator.clipboard.writeText(currentUser.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCustomAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = (selectedUrl?: string) => {
    const finalUrl = selectedUrl || customAvatarUrl;
    updateCurrentUserProfile({ avatarUrl: finalUrl });
    setShowAvatarModal(false);
  };

  const handleSaveProfileInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      name: name.trim(),
      nameArabic: nameArabic.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const isTeacher = currentUser?.role === 'TEACHER' || isSuperAdmin;
  const [signatureUrl, setSignatureUrl] = useState<string>((currentUser as any)?.signatureUrl || '');
  const [sealUrl, setSealUrl] = useState<string>((currentUser as any)?.sealUrl || '');
  const [signatureSaved, setSignatureSaved] = useState(false);
  const signatureInputRef = useRef<HTMLInputElement | null>(null);
  const sealInputRef = useRef<HTMLInputElement | null>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSigDrawing, setIsSigDrawing] = useState(false);

  const startSigDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsSigDrawing(true);
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

  const drawSig = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isSigDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopSigDraw = () => {
    if (isSigDrawing && sigCanvasRef.current) {
      setIsSigDrawing(false);
      const dataUrl = sigCanvasRef.current.toDataURL('image/png');
      setSignatureUrl(dataUrl);
    }
  };

  const clearSigCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureUrl('');
  };

  const handleSignatureFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSignatureUrl(reader.result);
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
          setSealUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePasscode = () => {
    if (!passcode || passcode.trim().length < 3) return;
    updateAdminPasscode(passcode.trim());
    setPasscodeSaved(true);
    setTimeout(() => setPasscodeSaved(false), 2500);
  };

  const handleSaveSignatureAndSeal = () => {
    updateCurrentUserProfile({
      signatureUrl,
      sealUrl,
    } as any);
    setSignatureSaved(true);
    setTimeout(() => setSignatureSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-[#29235D] via-[#1D1845] to-[#29235D] rounded-3xl p-6 sm:p-8 text-white border border-[#D3B673]/30 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          
          {/* Avatar Container with Edit Action */}
          <div className="relative group">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
              alt={currentUser.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-[#D3B673] shadow-lg flex-shrink-0"
            />
            <button
              onClick={() => {
                setCustomAvatarUrl(currentUser.avatarUrl || '');
                setShowAvatarModal(true);
              }}
              className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-[#D3B673] text-[#29235D] hover:bg-[#E8D5A3] shadow-lg border-2 border-white transition-all cursor-pointer group-hover:scale-110"
              title={isRTL ? 'تغيير الصورة الشخصية' : 'Change Profile Picture'}
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Details */}
          <div className="space-y-2 text-center sm:text-left rtl:sm:text-right flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D3B673]/20 text-[#E8D5A3] border border-[#D3B673]/40 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D3B673]" />
                {currentUser.role === 'SUPER_ADMIN' ? (isRTL ? 'المشرف العام (Super Admin)' : 'Super Admin') : currentUser.role}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                {currentUser.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-serif">
              {isRTL ? currentUser.nameArabic || currentUser.name : currentUser.name}
            </h1>

            <p className="text-xs text-white/80 max-w-xl">
              {isRTL
                ? 'منصة الآفاق الدولية — بوابة إدارة الحساب والاعتمادات الأكاديمية.'
                : 'Al-Afak International — Profile & Master Security Gateway.'}
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <div className="bg-black/40 px-3 py-1 rounded-xl border border-white/15 flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-[#D3B673]" />
                <span className="font-mono text-xs font-bold text-[#E8D5A3]">{currentUser.code}</span>
                <button
                  onClick={copyAccessCode}
                  className="text-white/60 hover:text-white p-1 cursor-pointer"
                  title="Copy Access Code"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              {copiedCode && <span className="text-xs text-emerald-400 font-bold">Copied!</span>}

              <button
                onClick={() => {
                  setCustomAvatarUrl(currentUser.avatarUrl || '');
                  setShowAvatarModal(true);
                }}
                className="text-xs font-bold text-[#D3B673] hover:text-[#E8D5A3] bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl border border-white/15 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isRTL ? 'تغيير الصورة' : 'Change Photo'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUPER ADMIN MASTER PASSCODE CARD (Dedicated to General Supervisor) */}
      {isSuperAdmin && (
        <div className="bg-gradient-to-br from-[#29235D] to-[#1D1845] text-white rounded-3xl p-6 sm:p-7 border-2 border-[#D3B673] shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/15">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D3B673]/20 border border-[#D3B673] flex items-center justify-center text-[#D3B673]">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#D3B673] text-[#29235D] uppercase tracking-wider">
                  Master Security Key
                </span>
                <h3 className="text-lg font-bold text-white font-serif mt-0.5">
                  {isRTL ? 'رمز المرور الرئيسي للمشرف العام (فتح كافة الصلاحيات)' : 'General Supervisor Master Passcode'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isRTL ? 'التحكم الشامل مفعّل' : 'Full Access Active'}</span>
              </span>
            </div>
          </div>

          <p className="text-xs text-white/80 leading-relaxed max-w-3xl">
            {isRTL
              ? 'هذا الرمز السري هو مفتاحك الرئيسي كمشرف عام للدخول إلى المنصة وفتح جميع الصلاحيات، وتعديل البرامج والمناهج الدراسية، وإدارة وتعيين المعلمين، ورصد الحضور والشهادات دون أي قيود.'
              : 'This Master Passcode allows you to authenticate as Super Admin from any login prompt, instantly unlocking full permissions to edit programs, faculty permissions, curriculum, and settings.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 items-center">
            <div className="sm:col-span-8 relative">
              <div className="relative">
                <input
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  placeholder="Enter custom master passcode..."
                  className="w-full pl-4 pr-11 py-3 bg-black/40 border border-[#D3B673]/50 rounded-2xl text-sm font-mono text-[#E8D5A3] font-bold focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-1 cursor-pointer"
                  title={showPasscode ? 'Hide Passcode' : 'Show Passcode'}
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="sm:col-span-4 flex gap-2">
              <button
                type="button"
                onClick={handleSavePasscode}
                className="w-full py-3 px-4 rounded-2xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-black text-xs border border-white/20 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isRTL ? 'حفظ رمز المرور الجديد' : 'Update Passcode'}</span>
              </button>
            </div>
          </div>

          {passcodeSaved && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>
                {isRTL
                  ? 'تم تحديث وحفظ رمز المرور السري للمشرف العام بنجاح!'
                  : 'Master Passcode updated and active across the platform!'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Account Info & Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Account Details & Edit Info */}
        <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#D3B673]" />
              <h3 className="text-base font-bold text-[#29235D] font-serif">
                {isRTL ? 'بيانات الملف الشخصي' : 'Account Details'}
              </h3>
            </div>
            <span className="text-xs text-gray-400 font-mono">{currentUser.code}</span>
          </div>

          <form onSubmit={handleSaveProfileInfo} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#29235D] mb-1">
                {isRTL ? 'الاسم بالإنجليزية' : 'Full Name (English)'}
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl text-[#29235D] font-medium focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#29235D] mb-1">
                {isRTL ? 'الاسم واللقب بالعربية' : 'Full Name (Arabic)'}
              </label>
              <input
                type="text"
                value={nameArabic}
                onChange={e => setNameArabic(e.target.value)}
                className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl text-[#29235D] font-arabic font-bold focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#29235D] mb-1">
                  {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl text-[#29235D] font-medium focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#29235D] mb-1">
                  {isRTL ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl text-[#29235D] font-medium focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                />
              </div>
            </div>

            {profileSaved && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl flex items-center gap-1.5 font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{isRTL ? 'تم حفظ التعديلات بنجاح!' : 'Profile info saved successfully!'}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] font-bold transition-all shadow-xs border border-[#D3B673]/30 cursor-pointer flex items-center justify-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isRTL ? 'حفظ البيانات' : 'Save Details'}</span>
            </button>
          </form>
        </div>

        {/* Language & UI Preferences */}
        <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Globe className="w-5 h-5 text-[#D3B673]" />
              <h3 className="text-base font-bold text-[#29235D] font-serif">
                {isRTL ? 'اللغة والاتجاه' : 'Language & Locale'}
              </h3>
            </div>

            <div className="py-3 space-y-3 text-xs">
              <p className="text-gray-500 leading-relaxed">
                {isRTL
                  ? 'اختر لغة واجهة المنصة المفضلة لديك. يتم تحويل اتجاه الشاشة تلقائياً بين اليمين لليسار (RTL) واليسار لليمين (LTR).'
                  : 'Choose your preferred interface language. The layout direction switches between LTR (English) and RTL (Arabic) automatically.'}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLang('en')}
                  className={`p-3 rounded-2xl border font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    lang === 'en'
                      ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-xs'
                      : 'bg-[#F8F6F0] text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>English (LTR)</span>
                </button>
                <button
                  onClick={() => setLang('ar')}
                  className={`p-3 rounded-2xl border font-bold flex items-center justify-center gap-2 font-arabic transition-all cursor-pointer ${
                    lang === 'ar'
                      ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-xs'
                      : 'bg-[#F8F6F0] text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>العربية (RTL)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all cursor-pointer"
            >
              {isRTL ? 'تسجيل الخروج من المنصة' : 'Sign Out from Al-Afak'}
            </button>
          </div>
        </div>

      </div>

      {/* TEACHER / SUPERVISOR OFFICIAL SIGNATURE & SEAL CARD */}
      {isTeacher && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#D3B673]/40 shadow-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#29235D] text-[#D3B673] flex items-center justify-center">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#D3B673]/20 text-[#8C6826] border border-[#D3B673]/40">
                  Digital Accreditation
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#29235D] font-serif">
                  {isRTL ? 'التوقيع والختم الرقمي المعتمد للشهادات' : 'Official Signature & Seal for Certificates'}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveSignatureAndSeal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#29235D] to-[#1D1845] text-[#D3B673] font-bold text-xs border border-[#D3B673] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isRTL ? 'حفظ واعتماد التوقيع في ملفك' : 'Save & Bind Signature'}</span>
            </button>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            {isRTL
              ? 'تتيح لك هذه الميزة رفع أو رسم توقيعك وختمك الرسمي، ليتم استدعاؤهما تلقائياً وفورياً عند إصدار الشهادات للطلاب دون الحاجة لإعادة الرفع في كل مرة.'
              : 'Upload or draw your official signature and stamp. It will be automatically retrieved whenever certificates are issued to students.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Signature Box */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#FBF9F4] border border-[#29235D]/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#29235D] flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-[#D3B673]" />
                  <span>{isRTL ? 'التوقيع الرقمي (رسم أو رفع صورة)' : 'Official Signature'}</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={clearSigCanvas}
                    className="text-[10px] text-gray-500 hover:text-red-600 flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-gray-200/60"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{isRTL ? 'مسح' : 'Clear'}</span>
                  </button>
                </div>
              </div>

              {/* Live Canvas Drawing */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl bg-white p-1 relative overflow-hidden flex flex-col items-center">
                <canvas
                  ref={sigCanvasRef}
                  width={340}
                  height={110}
                  onMouseDown={startSigDraw}
                  onMouseMove={drawSig}
                  onMouseUp={stopSigDraw}
                  onMouseLeave={stopSigDraw}
                  onTouchStart={startSigDraw}
                  onTouchMove={drawSig}
                  onTouchEnd={stopSigDraw}
                  className="cursor-crosshair w-full h-[110px] touch-none"
                />
                <span className="text-[10px] text-gray-400 font-sans absolute bottom-1 right-2 pointer-events-none">
                  {isRTL ? '✍️ ارسم توقيعك هنا بالماوس أو الإصبع' : '✍️ Draw signature here'}
                </span>
              </div>

              {/* Upload Image alternative */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="file"
                  ref={signatureInputRef}
                  onChange={handleSignatureFileUpload}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => signatureInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-[#29235D]/10 hover:bg-[#29235D]/15 text-[#29235D] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#8C6826]" />
                  <span>{isRTL ? 'أو رفع صورة توقيع مفرغة (PNG)' : 'Or Upload Signature PNG'}</span>
                </button>
              </div>

              {/* Current Signature Preview */}
              {signatureUrl && (
                <div className="p-2.5 rounded-xl bg-white border border-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={signatureUrl} alt="Signature Preview" className="h-10 max-w-[120px] object-contain" />
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {isRTL ? '✓ التوقيع جاهز ومحفوظ' : '✓ Signature ready'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSignatureUrl('')}
                    className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1"
                  >
                    {isRTL ? 'حذف' : 'Remove'}
                  </button>
                </div>
              )}
            </div>

            {/* Seal / Stamp Box */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#FBF9F4] border border-[#29235D]/10">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#29235D] flex items-center gap-1.5">
                  <Stamp className="w-3.5 h-3.5 text-[#D3B673]" />
                  <span>{isRTL ? 'الختم الأكاديمي المعتمد (صورة)' : 'Official Stamp / Seal'}</span>
                </label>
              </div>

              <div className="h-[110px] border-2 border-dashed border-gray-300 rounded-xl bg-white flex flex-col items-center justify-center p-2 text-center">
                {sealUrl ? (
                  <img src={sealUrl} alt="Official Seal" className="h-20 w-20 object-contain" />
                ) : (
                  <div className="space-y-1">
                    <Stamp className="w-7 h-7 text-gray-300 mx-auto" />
                    <p className="text-[10px] text-gray-400">
                      {isRTL ? 'لم يتم رفع ختم رسمي بعد' : 'No official stamp uploaded'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="file"
                  ref={sealInputRef}
                  onChange={handleSealFileUpload}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => sealInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-[#29235D]/10 hover:bg-[#29235D]/15 text-[#29235D] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#8C6826]" />
                  <span>{isRTL ? 'رفع صورة الختم المعتمد (PNG)' : 'Upload Official Seal'}</span>
                </button>
              </div>

              {sealUrl && (
                <div className="p-2.5 rounded-xl bg-white border border-emerald-300 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700 font-bold">
                    {isRTL ? '✓ الختم جاهز ومحفوظ' : '✓ Seal ready'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSealUrl('')}
                    className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1"
                  >
                    {isRTL ? 'حذف' : 'Remove'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {signatureSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>
                {isRTL
                  ? 'تم حفظ واعتماد التوقيع والختم في ملفك الشخصي بنجاح! سيتم استدعاؤهما تلقائياً في الشهادات.'
                  : 'Official signature and seal saved successfully! They will auto-load when issuing certificates.'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* AVATAR SELECTOR & UPLOAD MODAL */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 border border-[#29235D]/20 shadow-2xl">
            
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#29235D] text-[#D3B673] flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#29235D] font-serif">
                    {isRTL ? 'تعديل وتغيير الصورة الشخصية' : 'Change Profile Picture'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {isRTL ? 'ارفع صورتك من جهازك أو اختر من النماذج المعتمدة' : 'Upload from device or choose a preset portrait'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAvatarModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Current / Selected Preview */}
            <div className="flex items-center gap-4 bg-[#FBF9F4] p-4 rounded-2xl border border-gray-200">
              <img
                src={customAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                alt="Selected"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D3B673] shadow-md"
              />
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#29235D]">
                  {isRTL ? 'معاينة الصورة المحددة' : 'Selected Avatar Preview'}
                </p>
                <p className="text-[10px] text-gray-500 font-mono truncate max-w-xs">
                  {customAvatarUrl.substring(0, 45)}...
                </p>
              </div>
            </div>

            {/* Upload from device & Custom URL */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-[#29235D]">
                {isRTL ? 'رفع صورة من الكمبيوتر أو الهاتف:' : 'Upload from Computer / Mobile:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-[#29235D] text-[#D3B673] font-bold flex items-center gap-2 hover:bg-[#1D1845] transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isRTL ? 'اختيار ملف صورة من جهازك' : 'Browse Local Image'}</span>
                </button>
              </div>

              <div className="pt-2">
                <label className="block font-bold text-[#29235D] mb-1">
                  {isRTL ? 'أو أدخل رابط صورة مباشرة (Image URL):' : 'Or Paste Direct Image URL:'}
                </label>
                <input
                  type="url"
                  value={customAvatarUrl}
                  onChange={e => setCustomAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl text-xs text-[#29235D] focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                />
              </div>
            </div>

            {/* Curated Presets */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-[#29235D]">
                {isRTL ? 'أو اختر من المعرض الأكاديمي المعتمد:' : 'Or Select From Academic Presets:'}
              </label>
              <div className="grid grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCustomAvatarUrl(preset.url)}
                    className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer group transition-all ${
                      customAvatarUrl === preset.url
                        ? 'border-[#29235D] ring-2 ring-[#D3B673]'
                        : 'border-transparent hover:border-[#D3B673]'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-16 object-cover group-hover:scale-105 transition-all"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/15 flex items-end p-1">
                      <span className="text-[8px] font-bold text-white leading-tight truncate">
                        {preset.name.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 text-xs">
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 cursor-pointer"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleSaveAvatar()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#29235D] to-[#1D1845] text-[#D3B673] font-bold border border-[#D3B673] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isRTL ? 'اعتماد وحفظ الصورة' : 'Save Picture'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
