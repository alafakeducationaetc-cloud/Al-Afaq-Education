import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { TeacherProfile, User } from '../../types';
import {
  KeyRound,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  X,
  Eye,
  EyeOff,
  UserCheck,
  Send,
  Inbox,
  BookOpen,
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'TEACHER' | 'ADMIN' | 'STUDENT' | 'SELECTION';
  initialEmailOrCode?: string;
  onPasswordResetSuccess?: (accountCode: string, newPass: string) => void;
}

type ResetStep = 'ENTER_EMAIL' | 'VERIFY_OTP' | 'NEW_PASSWORD' | 'SUCCESS';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'TEACHER',
  initialEmailOrCode = '',
  onPasswordResetSuccess,
}) => {
  const { teachers, settings, updateUserPassword, updateAdminPasscode, loginWithCode } = useApp();
  const { isRTL } = useI18n();

  const [step, setStep] = useState<ResetStep>('ENTER_EMAIL');
  const [emailOrCode, setEmailOrCode] = useState(initialEmailOrCode);
  const [selectedTargetRole, setSelectedTargetRole] = useState<'TEACHER' | 'ADMIN'>(
    initialRole === 'ADMIN' ? 'ADMIN' : 'TEACHER'
  );

  // Identified User Account
  const [matchedAccount, setMatchedAccount] = useState<{
    id: string;
    name: string;
    nameArabic?: string;
    email: string;
    code: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER';
  } | null>(null);

  // OTP Verification state
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpExpirySeconds, setOtpExpirySeconds] = useState<number>(120);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // New Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Quick preset accounts for demo testing
  const [showQuickPresets, setShowQuickPresets] = useState(false);

  const adminAccount = {
    id: 'usr-adm-1',
    name: 'Dr. Alafak Director (المشرف العام)',
    nameArabic: 'د. المشرف العام للآفاق الدولية',
    email: settings.contactEmail || 'alafak.education.aetc@gmail.com',
    code: 'ADM-0001',
    role: 'SUPER_ADMIN' as const,
  };

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep('ENTER_EMAIL');
      setErrorMessage(null);
      setNewPassword('');
      setConfirmPassword('');
      setEnteredOtp('');
      if (initialEmailOrCode) {
        setEmailOrCode(initialEmailOrCode);
      }
    }
  }, [isOpen, initialEmailOrCode]);

  // Timer countdown for OTP
  useEffect(() => {
    let interval: any = null;
    if (step === 'VERIFY_OTP' && otpExpirySeconds > 0) {
      interval = setInterval(() => {
        setOtpExpirySeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpExpirySeconds]);

  if (!isOpen) return null;

  // Helper: Find teacher or admin by email or code
  const findAccount = (input: string) => {
    const clean = input.trim().toLowerCase();
    if (!clean) return null;

    // Check Admin
    if (
      clean === 'adm-0001' ||
      clean === 'admin' ||
      clean === 'director@alafak.edu' ||
      clean === (settings.contactEmail || '').toLowerCase()
    ) {
      return adminAccount;
    }

    // Check Teachers
    const foundTeacher = teachers.find(
      (t) =>
        t.code.toLowerCase() === clean ||
        (t.email && t.email.toLowerCase() === clean) ||
        t.id.toLowerCase() === clean
    );

    if (foundTeacher) {
      return {
        id: foundTeacher.id,
        name: foundTeacher.name,
        nameArabic: foundTeacher.nameArabic,
        email: foundTeacher.email || `${foundTeacher.code.toLowerCase()}@alafak.edu`,
        code: foundTeacher.code,
        role: 'TEACHER' as const,
      };
    }

    return null;
  };

  // STEP 1: Handle Send OTP Email Request
  const handleRequestOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const account = findAccount(emailOrCode);

    if (!account) {
      setErrorMessage(
        isRTL
          ? 'لم يتم العثور على حساب معلم أو إدارة مطابق لهذا البريد أو الكود. يرجى التحقق وإعادة المحاولة.'
          : 'No registered Teacher or Admin account found with this email or code. Please verify and try again.'
      );
      return;
    }

    setIsSendingCode(true);
    // Generate secure 6-digit OTP
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();

    setTimeout(() => {
      setMatchedAccount(account);
      setGeneratedOtp(randomOtp);
      setOtpExpirySeconds(120);
      setIsSendingCode(false);
      setStep('VERIFY_OTP');
    }, 600);
  };

  // STEP 2: Handle Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setErrorMessage(
        isRTL
          ? 'رمز التحقق غير صحيح. يرجى إدخال الرمز المكون من 6 أرقام الموضح في البريد.'
          : 'Invalid verification code. Please enter the 6-digit code shown in the email preview.'
      );
      return;
    }

    setStep('NEW_PASSWORD');
  };

  // STEP 3: Handle Reset Password
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword || newPassword.trim().length < 3) {
      setErrorMessage(
        isRTL
          ? 'يجب أن تتكون كلمة المرور الجديدة من 3 أحرف/أرقام على الأقل.'
          : 'New password must be at least 3 characters long.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        isRTL
          ? 'كلمتا المرور غير متطابقتين. يرجى التأكيد بشكل صحيح.'
          : 'Passwords do not match. Please re-enter the confirmation.'
      );
      return;
    }

    if (!matchedAccount) return;

    setIsSaving(true);

    setTimeout(() => {
      const cleanPass = newPassword.trim();

      if (matchedAccount.role === 'SUPER_ADMIN' || matchedAccount.role === 'ADMIN') {
        updateAdminPasscode(cleanPass);
      } else {
        updateUserPassword(matchedAccount.id, cleanPass);
      }

      setIsSaving(false);
      setStep('SUCCESS');

      if (onPasswordResetSuccess) {
        onPasswordResetSuccess(matchedAccount.code, cleanPass);
      }
    }, 500);
  };

  // Direct login with updated credentials
  const handleAutoLoginNow = () => {
    if (!matchedAccount) return;
    const targetRole = matchedAccount.role === 'SUPER_ADMIN' || matchedAccount.role === 'ADMIN' ? 'ADMIN' : 'TEACHER';
    loginWithCode(matchedAccount.code, newPassword.trim(), targetRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#29235D]/15 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#29235D] via-[#1D1845] to-[#29235D] p-5 sm:p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D3B673]/20 border border-[#D3B673]/50 flex items-center justify-center text-[#D3B673] shadow-inner flex-shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D3B673] bg-[#D3B673]/20 px-2 py-0.5 rounded-md border border-[#D3B673]/30">
                  {isRTL ? 'خدمة الأمان والتحقق' : 'Security & Recovery'}
                </span>
                <span className="text-[10px] text-gray-300">
                  {isRTL ? 'للمدربين والإدارة' : 'Teachers & Admins'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-[#E8D5A3] mt-0.5">
                {isRTL ? 'استعادة كلمة المرور عبر البريد' : 'Email-Based Password Reset'}
              </h2>
            </div>
          </div>

          {/* Stepper Progress Badges */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-[11px] font-bold">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${
                step === 'ENTER_EMAIL'
                  ? 'bg-[#D3B673] text-[#29235D] shadow-xs'
                  : step !== 'ENTER_EMAIL'
                  ? 'bg-white/20 text-emerald-300'
                  : 'bg-white/5 text-gray-400'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">1</span>
              <span className="truncate">{isRTL ? 'البريد والكود' : 'Email & Code'}</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${
                step === 'VERIFY_OTP'
                  ? 'bg-[#D3B673] text-[#29235D] shadow-xs'
                  : step === 'NEW_PASSWORD' || step === 'SUCCESS'
                  ? 'bg-white/20 text-emerald-300'
                  : 'bg-white/5 text-gray-400'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">2</span>
              <span className="truncate">{isRTL ? 'رمز التحقق' : 'Verify Code'}</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all ${
                step === 'NEW_PASSWORD' || step === 'SUCCESS'
                  ? 'bg-[#D3B673] text-[#29235D] shadow-xs'
                  : 'bg-white/5 text-gray-400'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-[10px]">3</span>
              <span className="truncate">{isRTL ? 'كلمة المرور' : 'New Password'}</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: ENTER EMAIL OR ACCESS CODE */}
          {/* ========================================================================= */}
          {step === 'ENTER_EMAIL' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="p-3 rounded-2xl bg-[#F8F6F0] border border-[#29235D]/10">
                <p className="text-xs text-[#29235D] font-medium leading-relaxed">
                  {isRTL
                    ? 'أدخل البريد الإلكتروني الرسمي المسجل أو كود المدرب/المشرف العام (Access Code) لإرسال رمز التحقق وكلمة المرور الجديدة عبر البريد.'
                    : 'Enter your registered official email or access code (e.g. TEA-8821 or ADM-0001) to receive a secure one-time verification code.'}
                </p>
              </div>

              {/* Target Role Selector Tabs */}
              <div>
                <label className="block text-xs font-bold text-[#29235D] mb-1.5">
                  {isRTL ? 'نوع الحساب المراد استعادة كلمة مروره:' : 'Account Role to Recover:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTargetRole('TEACHER');
                      setEmailOrCode(teachers[0]?.email || 'ahmed.mansoor@alafak.edu');
                      setErrorMessage(null);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      selectedTargetRole === 'TEACHER'
                        ? 'border-[#29235D] bg-[#29235D] text-[#D3B673] shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'مدرب / معلم' : 'Teacher / Trainer'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTargetRole('ADMIN');
                      setEmailOrCode(adminAccount.email);
                      setErrorMessage(null);
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      selectedTargetRole === 'ADMIN'
                        ? 'border-[#29235D] bg-[#29235D] text-[#D3B673] shadow-xs'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'المدير العام' : 'General Director'}</span>
                  </button>
                </div>
              </div>

              {/* Email or Access Code Input */}
              <div>
                <label className="block text-xs font-bold text-[#29235D] mb-1.5">
                  {isRTL
                    ? 'البريد الإلكتروني المسجل أو كود الدخول:'
                    : 'Registered Email or Access Code:'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pr-3.5 flex items-center pointer-events-none text-[#D3B673]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={emailOrCode}
                    onChange={(e) => setEmailOrCode(e.target.value)}
                    placeholder={
                      selectedTargetRole === 'TEACHER'
                        ? 'ahmed.mansoor@alafak.edu OR TEA-8821'
                        : 'director@alafak.edu OR ADM-0001'
                    }
                    required
                    className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2.5 bg-[#FBF9F4] border border-[#29235D]/20 rounded-xl text-sm text-[#29235D] focus:outline-none focus:ring-2 focus:ring-[#D3B673] transition-all font-mono"
                  />
                </div>
              </div>

              {/* Quick sample accounts helper for convenience in testing */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowQuickPresets(!showQuickPresets)}
                  className="text-[11px] text-[#8C6826] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-[#D3B673]" />
                  <span>
                    {isRTL
                      ? showQuickPresets
                        ? 'إخفاء الحسابات التجريبية'
                        : 'عرض الحسابات المسجلة للاختيار السريع'
                      : showQuickPresets
                      ? 'Hide quick sample accounts'
                      : 'Show registered accounts for quick selection'}
                  </span>
                </button>

                {showQuickPresets && (
                  <div className="mt-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-1.5 animate-in fade-in">
                    <button
                      type="button"
                      onClick={() => {
                        setEmailOrCode(adminAccount.email);
                        setSelectedTargetRole('ADMIN');
                      }}
                      className="p-2 rounded-lg bg-white border border-gray-200 text-left rtl:text-right hover:border-[#D3B673] text-[11px] transition-all"
                    >
                      <p className="font-bold text-[#29235D]">{adminAccount.nameArabic}</p>
                      <p className="text-gray-500 font-mono text-[10px]">{adminAccount.email}</p>
                    </button>
                    {teachers.slice(0, 3).map((tea) => (
                      <button
                        key={tea.id}
                        type="button"
                        onClick={() => {
                          setEmailOrCode(tea.email || `${tea.code.toLowerCase()}@alafak.edu`);
                          setSelectedTargetRole('TEACHER');
                        }}
                        className="p-2 rounded-lg bg-white border border-gray-200 text-left rtl:text-right hover:border-[#D3B673] text-[11px] transition-all"
                      >
                        <p className="font-bold text-[#29235D]">{tea.nameArabic || tea.name}</p>
                        <p className="text-gray-500 font-mono text-[10px]">
                          {tea.email || `${tea.code.toLowerCase()}@alafak.edu`}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSendingCode || !emailOrCode.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#29235D] to-[#1D1845] text-[#D3B673] font-bold text-sm hover:from-[#1D1845] hover:to-[#29235D] border border-[#D3B673] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSendingCode ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#D3B673]" />
                    <span>{isRTL ? 'جاري إرسال رمز التحقق...' : 'Dispatching Security Code...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#D3B673]" />
                    <span>{isRTL ? 'إرسال رمز التحقق إلى البريد' : 'Send Verification Code to Email'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: ENTER & VERIFY 6-DIGIT OTP WITH EMAIL PREVIEW */}
          {/* ========================================================================= */}
          {step === 'VERIFY_OTP' && matchedAccount && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
              {/* Account summary banner */}
              <div className="p-3 rounded-2xl bg-[#29235D]/5 border border-[#29235D]/15 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#29235D] text-[#D3B673]">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#29235D]">
                      {isRTL ? matchedAccount.nameArabic || matchedAccount.name : matchedAccount.name}
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono">{matchedAccount.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('ENTER_EMAIL')}
                  className="text-[11px] font-bold text-[#8C6826] hover:underline"
                >
                  {isRTL ? 'تعديل البريد' : 'Change'}
                </button>
              </div>

              {/* Realistic Email Notification Preview Simulator */}
              <div className="rounded-2xl border-2 border-dashed border-[#D3B673] bg-[#FCFBF8] p-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200 mb-3">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-[#B89955]" />
                    <span className="text-xs font-bold text-[#29235D]">
                      {isRTL ? 'معاينة الرسالة الواردة في البريد (Inbox):' : 'Dispatched Email Notification Preview:'}
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {isRTL ? 'تم الإرسال بنجاح' : 'Sent'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="text-gray-600">
                    <span className="font-bold text-[#29235D]">From:</span> AITEC Security System &lt;security@alafak.edu&gt;
                  </p>
                  <p className="text-gray-600">
                    <span className="font-bold text-[#29235D]">Subject:</span>{' '}
                    {isRTL
                      ? `رمز استعادة كلمة المرور لحساب ${matchedAccount.code}`
                      : `AITEC Password Reset Code for ${matchedAccount.code}`}
                  </p>
                  
                  {/* The Security OTP Box */}
                  <div className="mt-3 p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        {isRTL ? 'رمز التحقق السري (OTP):' : 'One-Time Security Code:'}
                      </span>
                      <span className="text-2xl font-black font-mono tracking-widest text-[#29235D]">
                        {generatedOtp}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEnteredOtp(generatedOtp);
                        setCopiedOtp(true);
                        setTimeout(() => setCopiedOtp(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#29235D] text-[#D3B673] hover:bg-[#1D1845] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isRTL ? 'تعبئة الرمز تلقائياً' : 'Auto-Fill Code'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* OTP Input Form */}
              <div>
                <label className="block text-xs font-bold text-[#29235D] mb-1.5 flex items-center justify-between">
                  <span>{isRTL ? 'أدخل رمز التحقق (6 أرقام):' : 'Enter 6-Digit Code:'}</span>
                  <span className="text-[11px] text-gray-500 font-mono">
                    {otpExpirySeconds > 0 ? (
                      `${isRTL ? 'صالح لمدة' : 'Expires in'}: ${Math.floor(otpExpirySeconds / 60)}:${(
                        otpExpirySeconds % 60
                      )
                        .toString()
                        .padStart(2, '0')}`
                    ) : (
                      <span className="text-rose-600 font-bold">{isRTL ? 'انتهت الصلاحية' : 'Expired'}</span>
                    )}
                  </span>
                </label>

                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="------"
                  required
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono py-2.5 bg-[#FBF9F4] border-2 border-[#29235D]/20 rounded-xl text-[#29235D] focus:outline-none focus:border-[#D3B673] focus:ring-2 focus:ring-[#D3B673] transition-all"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep('ENTER_EMAIL')}
                  className="text-gray-500 hover:text-[#29235D] font-bold flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                  <span>{isRTL ? 'الرجوع للخلف' : 'Back'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRequestOtp()}
                  className="text-[#8C6826] hover:underline font-bold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{isRTL ? 'إعادة إرسال الرمز' : 'Resend Code'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={enteredOtp.length !== 6}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#29235D] to-[#1D1845] text-[#D3B673] font-bold text-sm hover:from-[#1D1845] hover:to-[#29235D] border border-[#D3B673] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{isRTL ? 'تأكيد الرمز والمتابعة' : 'Verify & Continue'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 text-[#D3B673]" />
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: SET NEW PASSWORD */}
          {/* ========================================================================= */}
          {step === 'NEW_PASSWORD' && matchedAccount && (
            <form onSubmit={handleSaveNewPassword} className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="font-bold block">
                    {isRTL ? 'تم التحقق من الرمز بنجاح!' : 'Security Code Verified!'}
                  </span>
                  <span>
                    {isRTL
                      ? `يرجى إدخال كلمة المرور الجديدة لحساب ${matchedAccount.nameArabic || matchedAccount.name}`
                      : `Please enter the new password for ${matchedAccount.name}`}
                  </span>
                </div>
              </div>

              {/* New Password Input */}
              <div>
                <label className="block text-xs font-bold text-[#29235D] mb-1.5">
                  {isRTL ? 'كلمة المرور الجديدة:' : 'New Password:'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pr-3.5 flex items-center pointer-events-none text-[#D3B673]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isRTL ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                    required
                    minLength={3}
                    className="w-full pl-10 rtl:pl-10 rtl:pr-10 pr-10 py-2.5 bg-[#FBF9F4] border border-[#29235D]/20 rounded-xl text-sm text-[#29235D] focus:outline-none focus:ring-2 focus:ring-[#D3B673] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3.5 rtl:pr-0 rtl:pl-3.5 flex items-center text-gray-400 hover:text-[#29235D] cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-xs font-bold text-[#29235D] mb-1.5">
                  {isRTL ? 'تأكيد كلمة المرور الجديدة:' : 'Confirm New Password:'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pr-3.5 flex items-center pointer-events-none text-[#D3B673]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={isRTL ? 'أعد كتابة كلمة المرور' : 'Re-enter new password'}
                    required
                    minLength={3}
                    className="w-full pl-10 rtl:pl-10 rtl:pr-10 pr-10 py-2.5 bg-[#FBF9F4] border border-[#29235D]/20 rounded-xl text-sm text-[#29235D] focus:outline-none focus:ring-2 focus:ring-[#D3B673] transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSaving || !newPassword || newPassword !== confirmPassword}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#29235D] to-[#1D1845] text-[#D3B673] font-bold text-sm hover:from-[#1D1845] hover:to-[#29235D] border border-[#D3B673] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#D3B673]" />
                    <span>{isRTL ? 'جاري تحديث كلمة المرور...' : 'Updating Password...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{isRTL ? 'حفظ وتحديث كلمة المرور' : 'Save & Update Password'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: SUCCESS CONFIRMATION */}
          {/* ========================================================================= */}
          {step === 'SUCCESS' && matchedAccount && (
            <div className="text-center space-y-4 py-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#29235D] font-serif">
                  {isRTL ? 'تم تغيير كلمة المرور بنجاح!' : 'Password Successfully Changed!'}
                </h3>
                <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                  {isRTL
                    ? `تم تحديث كلمة المرور لحساب (${matchedAccount.nameArabic || matchedAccount.name}). يمكنك الآن تسجيل الدخول مباشرة.`
                    : `Your password for account ${matchedAccount.name} (${matchedAccount.code}) has been updated.`}
                </p>
              </div>

              <div className="p-3 bg-[#F8F6F0] rounded-2xl border border-[#29235D]/10 max-w-xs mx-auto text-xs font-mono text-[#29235D]">
                <span className="text-gray-500 block text-[10px] uppercase">
                  {isRTL ? 'كود الدخول الخاص بك:' : 'Your Access Code:'}
                </span>
                <span className="font-bold text-sm text-[#8C6826]">{matchedAccount.code}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-bold transition-all cursor-pointer"
                >
                  {isRTL ? 'الرجوع لشاشة الدخول' : 'Back to Login'}
                </button>

                <button
                  type="button"
                  onClick={handleAutoLoginNow}
                  className="py-2.5 px-4 rounded-xl bg-[#29235D] text-[#D3B673] hover:bg-[#1D1845] text-xs font-bold border border-[#D3B673] shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'دخول مباشر للمنصة' : 'Log In Directly'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
