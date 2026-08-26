import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { Logo } from '../common/Logo';
import {
  GraduationCap,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  KeyRound,
  Globe,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginWithCode } = useApp();
  const { language, setLanguage, t, isRTL } = useI18n();

  // Role Selection Step: 'SELECTION' or specific role 'STUDENT' | 'TEACHER' | 'ADMIN'
  const [selectedRole, setSelectedRole] = useState<'SELECTION' | 'STUDENT' | 'TEACHER' | 'ADMIN'>('SELECTION');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectRole = (role: 'STUDENT' | 'TEACHER' | 'ADMIN') => {
    setSelectedRole(role);
    setError(null);
    setCode('');
    setPassword('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!code.trim()) {
      setError(
        selectedRole === 'STUDENT'
          ? isRTL ? 'يرجى إدخال كود المتدرب أو البريد الإلكتروني' : 'Please enter your trainee code or email.'
          : selectedRole === 'TEACHER'
          ? isRTL ? 'يرجى إدخال كود المدرب أو البريد الإلكتروني' : 'Please enter your trainer code or email.'
          : isRTL ? 'يرجى إدخال كود المدير العام' : 'Please enter the general director code.'
      );
      return;
    }
    const result = loginWithCode(code.trim(), password.trim());
    if (!result.success) {
      setError(result.message || (isRTL ? 'فشل تسجيل الدخول. يرجى التأكد من الكود وكلمة المرور.' : 'Authentication failed. Please verify your credentials.'));
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-between">
      {/* Top Header */}
      <header className="p-4 sm:p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <Logo size="md" />
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#29235D]/15 bg-white hover:bg-[#F1ECE1] text-[#29235D] text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-[#D3B673]" />
          <span>{language === 'en' ? 'العربية (RTL)' : 'English'}</span>
        </button>
      </header>

      {/* Main Login Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-xl w-full">
          
          {/* Card Container */}
          <div className="bg-white rounded-3xl border border-[#29235D]/10 shadow-2xl p-6 sm:p-9 transition-all">
            
            {/* Header / Intro */}
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-[#D3B673]/15 text-[#B89955] border border-[#D3B673]/40 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                {isRTL ? 'بوابة الآفاق الدولية الأكاديمية' : 'AITEC International Portal'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-[#29235D] font-serif tracking-wide">
                {t('platformName')}
              </h1>
              <p className="text-xs sm:text-sm text-[#786F9A] mt-1.5 font-medium">
                {isRTL
                  ? 'اختر نوع الحساب لتسجيل الدخول: متدرب، مدرب، أو المدير العام'
                  : 'Select your role to proceed: Trainee, Trainer, or General Director'}
              </p>
            </div>

            {/* STEP 1: Outer Role Selection */}
            {selectedRole === 'SELECTION' ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="text-center pb-1">
                  <p className="text-xs font-bold text-[#8C6826] uppercase tracking-wider">
                    {isRTL ? 'حدد نوع حسابك للدخول إلى البوابة' : 'Select Your Account Type'}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {/* Option 1: Trainee / المتدرب */}
                  <button
                    type="button"
                    onClick={() => handleSelectRole('STUDENT')}
                    className="p-4 rounded-2xl border-2 border-gray-100 hover:border-[#29235D] bg-[#FBF9F4] hover:bg-[#F1ECE1] flex items-center justify-between text-left rtl:text-right transition-all group cursor-pointer shadow-xs hover:shadow-md"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center group-hover:scale-105 transition-all">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#29235D]">
                          {isRTL ? 'متدرب' : 'Trainee / Student'}
                        </h3>
                        <p className="text-xs text-[#786F9A] mt-0.5">
                          {isRTL ? 'بوابة المتدربين والطلاب — متابعة الدروس، الحضور، والواجبات' : 'Trainee Portal — Classes, attendance & assignments'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 rtl:rotate-180 group-hover:text-[#29235D] transition-all" />
                  </button>

                  {/* Option 2: Trainer / المدرب */}
                  <button
                    type="button"
                    onClick={() => handleSelectRole('TEACHER')}
                    className="p-4 rounded-2xl border-2 border-gray-100 hover:border-[#29235D] bg-[#FBF9F4] hover:bg-[#F1ECE1] flex items-center justify-between text-left rtl:text-right transition-all group cursor-pointer shadow-xs hover:shadow-md"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center group-hover:scale-105 transition-all">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#29235D]">
                          {isRTL ? 'مدرب' : 'Trainer / Instructor'}
                        </h3>
                        <p className="text-xs text-[#786F9A] mt-0.5">
                          {isRTL ? 'بوابة المدربين والمعلمين — إدارة الحلقات، تسجيل الحضور، والتقييمات' : 'Trainer Portal — Manage sessions, attendance & evaluations'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 rtl:rotate-180 group-hover:text-[#29235D] transition-all" />
                  </button>

                  {/* Option 3: General Director / المدير العام */}
                  <button
                    type="button"
                    onClick={() => handleSelectRole('ADMIN')}
                    className="p-4 rounded-2xl border-2 border-[#D3B673]/60 bg-gradient-to-r from-[#29235D] to-[#1D1845] text-white flex items-center justify-between text-left rtl:text-right transition-all group cursor-pointer shadow-md hover:shadow-lg hover:border-[#D3B673]"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#D3B673]/20 text-[#D3B673] border border-[#D3B673]/40 flex items-center justify-center group-hover:scale-105 transition-all">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[#D3B673]">
                            {isRTL ? 'المدير العام' : 'General Director'}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D3B673]/20 text-[#D3B673] border border-[#D3B673]/30">
                            {isRTL ? 'المشرف العام' : 'Super Admin'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 mt-0.5">
                          {isRTL ? 'الإدارة العامة — التحكم بكلمات المرور، البرامج، الصور، والشعار' : 'Full Management — Passwords, branding, programs & users'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#D3B673] rtl:rotate-180 transition-all" />
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 2: Dedicated Login Form */
              <div className="space-y-5 animate-in fade-in">
                
                {/* Active Role Indicator & Switch Back button */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F8F6F0] border border-[#29235D]/10">
                  <div className="flex items-center gap-3">
                    {selectedRole === 'STUDENT' && (
                      <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                    )}
                    {selectedRole === 'TEACHER' && (
                      <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                        <BookOpen className="w-5 h-5" />
                      </div>
                    )}
                    {selectedRole === 'ADMIN' && (
                      <div className="p-2.5 rounded-xl bg-[#29235D] text-[#D3B673]">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold block uppercase">
                        {isRTL ? 'تسجيل الدخول بصفتك:' : 'Logging in as:'}
                      </span>
                      <span className="text-sm font-black text-[#29235D]">
                        {selectedRole === 'STUDENT'
                          ? isRTL ? 'متدرب' : 'Trainee'
                          : selectedRole === 'TEACHER'
                          ? isRTL ? 'مدرب' : 'Trainer'
                          : isRTL ? 'المدير العام (المشرف العام)' : 'General Director'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('SELECTION');
                      setError(null);
                    }}
                    className="text-xs font-bold text-[#8C6826] hover:text-[#29235D] underline transition-all cursor-pointer px-2 py-1"
                  >
                    {isRTL ? '← تغيير الحساب' : '← Switch Role'}
                  </button>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Access Code / Email */}
                  <div>
                    <label className="block text-xs font-bold text-[#29235D] mb-1.5">
                      {selectedRole === 'STUDENT'
                        ? isRTL ? 'كود المتدرب (Access Code) أو البريد الإلكتروني:' : 'Trainee Code or Email:'
                        : selectedRole === 'TEACHER'
                        ? isRTL ? 'كود المدرب (Access Code) أو البريد الإلكتروني:' : 'Trainer Code or Email:'
                        : isRTL ? 'كود المدير العام (Admin Code):' : 'General Director Code:'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pr-3.5 flex items-center pointer-events-none">
                        <KeyRound className="w-4 h-4 text-[#D3B673]" />
                      </div>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder={
                          selectedRole === 'STUDENT'
                            ? isRTL ? 'أدخل كود المتدرب (مثل STD-1001)' : 'Enter trainee code (e.g. STD-1001)'
                            : selectedRole === 'TEACHER'
                            ? isRTL ? 'أدخل كود المدرب (مثل TEA-8821)' : 'Enter trainer code (e.g. TEA-8821)'
                            : isRTL ? 'أدخل كود المدير العام (مثل ADM-0001)' : 'Enter admin code (e.g. ADM-0001)'
                        }
                        required
                        className="w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2.5 bg-[#FBF9F4] border border-[#29235D]/20 rounded-xl text-sm font-mono text-[#29235D] focus:outline-none focus:ring-2 focus:ring-[#D3B673] transition-all"
                      />
                    </div>
                  </div>

                  {/* Password / Passcode */}
                  <div>
                    <label className="block text-xs font-bold text-[#29235D] mb-1.5 flex items-center justify-between">
                      <span>
                        {selectedRole === 'ADMIN'
                          ? isRTL ? 'كلمة المرور الرئيسية (Master Passcode):' : 'Admin Master Passcode:'
                          : isRTL ? 'كلمة المرور (Password):' : 'Password:'}
                      </span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3.5 rtl:pr-3.5 flex items-center pointer-events-none">
                        <Lock className="w-4 h-4 text-[#D3B673]" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter password'}
                        required
                        className="w-full pl-10 rtl:pl-10 rtl:pr-10 pr-10 py-2.5 bg-[#FBF9F4] border border-[#29235D]/20 rounded-xl text-sm text-[#29235D] focus:outline-none focus:ring-2 focus:ring-[#D3B673] transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3.5 rtl:pr-0 rtl:pl-3.5 flex items-center text-gray-400 hover:text-[#29235D] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-[#29235D] to-[#1D1845] text-[#D3B673] font-bold text-sm hover:from-[#1D1845] hover:to-[#29235D] border border-[#D3B673] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t('loginButton')}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180 text-[#D3B673]" />
                  </button>
                </form>

              </div>
            )}

          </div>
          
          {/* Footer note */}
          <p className="text-center text-xs text-[#786F9A] mt-6 font-medium">
            © {new Date().getFullYear()} AITEC — Al-Afak International For Training And Educational Consultants.
          </p>

        </div>
      </div>

      <div />
    </div>
  );
};
