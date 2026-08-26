import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { Program, TeacherProfile, StudyMode, TeacherAvailabilitySlot } from '../../types';
import {
  X,
  Sparkles,
  CheckCircle2,
  User,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Clock,
  Calendar,
  MessageCircle,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Send,
  Lock,
  Eye,
  EyeOff,
  DollarSign,
  Users,
  UserCheck,
} from 'lucide-react';

interface StudentEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProgramId?: string;
  initialTeacherId?: string;
  initialStudyMode?: StudyMode;
  onSuccessLogin?: () => void;
}

export const StudentEnrollmentModal: React.FC<StudentEnrollmentModalProps> = ({
  isOpen,
  onClose,
  initialProgramId,
  initialTeacherId,
  initialStudyMode = 'PRIVATE',
  onSuccessLogin,
}) => {
  const { programs, teachers, settings, registerStudentAndEnroll, setCurrentUser } = useApp();
  const { isRTL } = useI18n();

  // Selection states
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    initialProgramId || (programs[0]?.id || '')
  );
  const [studyMode, setStudyMode] = useState<StudyMode>(initialStudyMode);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    initialTeacherId || ''
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');

  // Trainee Form Inputs
  const [fullName, setFullName] = useState<string>('');
  const [fullNameArabic, setFullNameArabic] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [customPassword, setCustomPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Flow steps: 'FORM' | 'SUCCESS_EMAIL_DISPATCH'
  const [step, setStep] = useState<'FORM' | 'SUCCESS_EMAIL_DISPATCH'>('FORM');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [registeredData, setRegisteredData] = useState<{
    code: string;
    tempPass: string;
    studentName: string;
    email: string;
    programTitle: string;
    teacherName: string;
    studyMode: StudyMode;
  } | null>(null);

  if (!isOpen) return null;

  const currentProgram = programs.find(p => p.id === selectedProgramId) || programs[0];
  const eligibleTeachers = teachers.filter(t => 
    !currentProgram || currentProgram.assignedTeacherIds.includes(t.id) || teachers.length <= 2
  );
  const currentTeacher = teachers.find(t => t.id === (selectedTeacherId || eligibleTeachers[0]?.id));

  // Filter slots for the selected teacher and study mode
  const teacherSlots: TeacherAvailabilitySlot[] = (currentTeacher?.availabilitySlots || []).filter(
    s => s.isAvailable && (s.studyType === 'BOTH' || s.studyType === studyMode)
  );

  const privatePrice = currentProgram?.privatePrice || currentProgram?.price || 350;
  const groupPrice = currentProgram?.groupPrice || Math.round((currentProgram?.price || 350) * 0.6);
  const activePrice = studyMode === 'PRIVATE' ? privatePrice : groupPrice;

  // WhatsApp Message Generator
  const generateWhatsAppLink = () => {
    const rawNumber = (settings.whatsappNumber || '+201012345678').replace(/[^0-9]/g, '');
    const modeText = studyMode === 'PRIVATE' ? 'دراسة فردية خاصة (1-on-1)' : 'دراسة في مجموعة تفاعلية (Group)';
    const selectedSlot = teacherSlots.find(s => s.id === selectedSlotId);
    const slotText = selectedSlot 
      ? `• الموعد المفضل: ${selectedSlot.dayArabic || selectedSlot.day} (${selectedSlot.startTime} إلى ${selectedSlot.endTime} بتوقيت القاهرة)` 
      : '• الموعد: يتم التنسيق لاحقاً';

    const msg = `السلام عليكم ورحمة الله،
أود التسجيل في منصة الآفاق الدولية للتدريب والاستشارات:
• البرنامج: ${currentProgram?.nameArabic || currentProgram?.name}
• نظام الدراسة: ${modeText}
• المدرب المفضل: ${currentTeacher?.nameArabic || currentTeacher?.name || 'أي مدرب متاح'}
${slotText}
• اسم الطالب: ${fullNameArabic || fullName || 'طالب جديد'}
• البريد الإلكتروني: ${email || 'غير محدد'}
• رقم الهاتف: ${phone || 'غير محدد'}

أرجو تزويدي بتفاصيل تأكيد الحجز والاشتراك. شكراً لكم!`;

    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(msg)}`;
  };

  // Direct Email-Based Registration & Login
  const handleEmailRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      alert(isRTL ? 'يرجى إدخال الاسم والبريد الإلكتروني' : 'Please enter your name and email');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = registerStudentAndEnroll({
        name: fullName.trim(),
        nameArabic: fullNameArabic.trim() || fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        programId: currentProgram.id,
        teacherId: currentTeacher?.id,
        studyMode,
        preferredSlotId: selectedSlotId || undefined,
        customPassword: customPassword.trim() || undefined,
      });

      setRegisteredData({
        code: result.code,
        tempPass: result.tempPass,
        studentName: result.student.nameArabic || result.student.name,
        email: result.student.email || email,
        programTitle: result.program.nameArabic || result.program.name,
        teacherName: result.teacher?.nameArabic || result.teacher?.name || 'المدرب المعتمد',
        studyMode,
      });

      setIsSubmitting(false);
      setStep('SUCCESS_EMAIL_DISPATCH');
    }, 600);
  };

  // Confirm credentials and directly start studying
  const handleConfirmAndEnterPortal = () => {
    if (!registeredData) return;
    const { students } = useApp ? useApp() : { students: [] };
    const freshlyCreated = students.find(s => s.code === registeredData.code);
    if (freshlyCreated) {
      setCurrentUser(freshlyCreated);
    }
    onClose();
    if (onSuccessLogin) onSuccessLogin();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#29235D]/15 shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-[#29235D] text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D3B673]/10 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#D3B673]/20 border border-[#D3B673]/40 flex items-center justify-center text-[#D3B673]">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  {isRTL ? 'التسجيل والانضمام للبرنامج التدريبي' : 'Enroll in Training Program'}
                </h3>
                <p className="text-xs sm:text-sm text-[#D3B673] font-medium mt-0.5">
                  {isRTL
                    ? 'منصة الآفاق الدولية للتدريب — دراسة فردية خاصة أو في مجموعة معتمدة'
                    : 'AITEC Platform — 1-on-1 Private Tutoring or Interactive Group Classes'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {step === 'FORM' ? (
          <form onSubmit={handleEmailRegistration} className="p-5 sm:p-8 space-y-6">
            
            {/* Step 1: Program & Study Mode Selection */}
            <div>
              <label className="block text-xs font-bold text-[#29235D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#D3B673]" />
                <span>{isRTL ? '١. اختر البرنامج ونظام الدراسة' : '1. Select Program & Study Mode'}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{isRTL ? 'البرنامج التدريبي' : 'Training Program'}</label>
                  <select
                    value={selectedProgramId}
                    onChange={e => {
                      setSelectedProgramId(e.target.value);
                      setSelectedSlotId('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-[#FBF9F4] text-xs sm:text-sm font-bold text-[#29235D] focus:border-[#29235D] focus:ring-1 focus:ring-[#29235D] outline-none"
                  >
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>
                        {isRTL ? p.nameArabic : p.name} ({p.currency} {p.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">{isRTL ? 'نظام الدراسة المطلوب' : 'Study Mode'}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStudyMode('PRIVATE');
                        setSelectedSlotId('');
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        studyMode === 'PRIVATE'
                          ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-[#FBF9F4]'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{isRTL ? 'خاص فردي (1-on-1)' : 'Private (1-on-1)'}</span>
                      <span className="text-[10px] opacity-80">${privatePrice}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStudyMode('GROUP');
                        setSelectedSlotId('');
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        studyMode === 'GROUP'
                          ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-[#FBF9F4]'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>{isRTL ? 'مجموعة تفاعلية' : 'Group Class'}</span>
                      <span className="text-[10px] opacity-80">${groupPrice}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Instructor & Cairo Time Slot Selection */}
            <div>
              <label className="block text-xs font-bold text-[#29235D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#D3B673]" />
                <span>{isRTL ? '٢. اختيار المدرب والموعد المعتمد (بتوقيت القاهرة)' : '2. Select Teacher & Cairo Timetable Slot'}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{isRTL ? 'المدرب / المعلم المجاز' : 'Assigned Instructor'}</label>
                  <select
                    value={selectedTeacherId || (eligibleTeachers[0]?.id || '')}
                    onChange={e => {
                      setSelectedTeacherId(e.target.value);
                      setSelectedSlotId('');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-[#FBF9F4] text-xs sm:text-sm font-bold text-[#29235D] focus:border-[#29235D] focus:ring-1 focus:ring-[#29235D] outline-none"
                  >
                    {eligibleTeachers.map(tea => (
                      <option key={tea.id} value={tea.id}>
                        {isRTL ? tea.nameArabic : tea.name} ({tea.specializationArabic || tea.specialization})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1 flex items-center justify-between">
                    <span>{isRTL ? 'الموعد المتاح (🇪🇬 توقيت القاهرة)' : 'Available Slot (🇪🇬 Cairo Time)'}</span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">GMT+2</span>
                  </label>
                  <select
                    value={selectedSlotId}
                    onChange={e => setSelectedSlotId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-[#FBF9F4] text-xs sm:text-sm font-bold text-[#29235D] focus:border-[#29235D] focus:ring-1 focus:ring-[#29235D] outline-none"
                  >
                    <option value="">{isRTL ? '-- اختر موعداً متاحاً أو تنسيق لاحق --' : '-- Choose slot or arrange later --'}</option>
                    {teacherSlots.map(slot => (
                      <option key={slot.id} value={slot.id}>
                        {slot.dayArabic || slot.day} | {slot.startTime} - {slot.endTime} (القاهرة)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {teacherSlots.length > 0 && (
                <div className="bg-[#F8F6F0] p-2.5 rounded-xl border border-[#29235D]/10 flex flex-wrap gap-2 items-center text-xs">
                  <span className="text-gray-500 text-[11px] font-medium">{isRTL ? 'مواعيد المدرب المتاحة:' : 'Teacher Slots:'}</span>
                  {teacherSlots.map(slot => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                        selectedSlotId === slot.id
                          ? 'bg-[#29235D] text-[#D3B673] border-[#29235D]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#D3B673]'
                      }`}
                    >
                      📅 {slot.dayArabic || slot.day} {slot.startTime} - {slot.endTime}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 3: Trainee Contact & Account Details */}
            <div>
              <label className="block text-xs font-bold text-[#29235D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#D3B673]" />
                <span>{isRTL ? '٣. بيانات الطالب والحساب' : '3. Trainee Details & Password'}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{isRTL ? 'الاسم بالكامل (بالعربية أو الإنجليزية) *' : 'Full Name *'}</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder={isRTL ? 'مثال: طارق عبد الرحمن' : 'e.g. Tariq Ibrahim'}
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold text-[#29235D] focus:border-[#29235D] outline-none"
                    />
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3 rtl:left-auto rtl:right-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">{isRTL ? 'البريد الإلكتروني (لاستلام الكود والباسورد) *' : 'Email Address *'}</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold text-[#29235D] focus:border-[#29235D] outline-none"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 rtl:left-auto rtl:right-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">{isRTL ? 'رقم الواتساب / الهاتف للتواصل والتنسيق' : 'WhatsApp / Phone Number'}</label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="+20 100 000 0000"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold text-[#29235D] focus:border-[#29235D] outline-none"
                    />
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3 rtl:left-auto rtl:right-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">{isRTL ? 'كلمة المرور المفضلة (اختياري - أو نولد لك كلمة سر)' : 'Preferred Password (Optional)'}</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={isRTL ? 'أدخل باسوورد خاص بك أو اتركه فارغاً' : 'Set custom password or leave blank'}
                      value={customPassword}
                      onChange={e => setCustomPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold text-[#29235D] focus:border-[#29235D] outline-none"
                    />
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 rtl:left-auto rtl:right-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 rtl:right-auto rtl:left-3"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Summary & Two Registration Options */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between bg-[#FBF9F4] p-3.5 rounded-2xl border border-[#D3B673]/30 mb-4">
                <div>
                  <p className="text-xs text-gray-600 font-semibold">{isRTL ? 'قيمة الاشتراك والبرنامج:' : 'Total Program Fee:'}</p>
                  <p className="text-lg font-black text-[#29235D]">
                    ${activePrice} <span className="text-xs font-medium text-gray-500">/ {currentProgram.durationMonths} {isRTL ? 'أشهر' : 'months'} ({currentProgram.totalSessions} {isRTL ? 'حصة' : 'sessions'})</span>
                  </p>
                </div>
                <div className="text-right rtl:text-left">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#29235D] text-[#D3B673]">
                    {studyMode === 'PRIVATE' ? '👤 دراسة خاصة 1-on-1' : '👥 مجموعة تفاعلية'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: WhatsApp & Direct Email Register */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* WhatsApp Support CTA */}
                <a
                  href={generateWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all text-center cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>{isRTL ? 'التسجيل وتأكيد الحجز عبر واتساب' : 'Enroll & Chat via WhatsApp'}</span>
                </a>

                {/* Direct Register & Email Passcode */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] border border-[#D3B673]/40 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-4 h-4 text-[#D3B673]" />
                  <span>{isSubmitting ? (isRTL ? 'جارٍ إنشاء الحساب...' : 'Creating Account...') : (isRTL ? 'تسجيل فوري واستلام الكود بالميل' : 'Direct Register & Get Credentials')}</span>
                </button>
              </div>

              <p className="text-[11px] text-gray-500 text-center mt-3">
                🔒 {isRTL ? 'جميع المواعيد المسجلة معتمدة بتوقيت القاهرة الرسمي (GMT+2) مع إمكانية تعديل كلمة المرور في أي وقت.' : 'All timetable slots are strictly in Cairo Time (GMT+2). Passwords can be changed anytime.'}
              </p>
            </div>

          </form>
        ) : (
          /* Step 2: Interactive Email Verification & Credential Dispatch Card */
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-[#29235D]">
                {isRTL ? 'تم إنشاء حسابك وتأكيد التسجيل بنجاح! 🎉' : 'Account Created & Enrolled Successfully! 🎉'}
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-lg mx-auto">
                {isRTL
                  ? `أهلاً بك يا ${registeredData?.studentName}. تم إرسال بيانات الدخول إلى بريدك الإلكتروني (${registeredData?.email}). يمكنك استخدام الكود وكلمة المرور أدناه للدخول ومباشرة حصصك الآن.`
                  : `Welcome ${registeredData?.studentName}. Your login credentials have been dispatched to ${registeredData?.email}. You may now access your portal.`}
              </p>
            </div>

            {/* Email Dispatch Simulated Card */}
            <div className="bg-[#F8F6F0] rounded-2xl border border-[#29235D]/15 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-[#29235D]">{isRTL ? 'رسالة التأكيد والترحيب بالبريد الإلكتروني' : 'Official Welcome & Credentials Email'}</span>
                </div>
                <span className="text-[11px] font-mono text-gray-400">alafak.education.aetc@gmail.com</span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                    <p className="text-[11px] text-gray-500">{isRTL ? 'كود الطالب للدخول (Trainee Code)' : 'Trainee Login Code'}</p>
                    <p className="text-lg font-mono font-black text-[#29235D] tracking-wider">{registeredData?.code}</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                    <p className="text-[11px] text-gray-500">{isRTL ? 'كلمة المرور المعتمدة (Password)' : 'Account Password'}</p>
                    <p className="text-lg font-mono font-black text-[#D3B673] tracking-wider">{registeredData?.tempPass}</p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-1.5 text-xs text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRTL ? 'البرنامج المسجل به:' : 'Program:'}</span>
                    <span className="font-bold text-[#29235D]">{registeredData?.programTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRTL ? 'نظام الدراسة:' : 'Study Mode:'}</span>
                    <span className="font-bold text-[#29235D]">
                      {registeredData?.studyMode === 'PRIVATE' ? '👤 دراسة فردية خاصة (1-on-1)' : '👥 مجموعة تفاعلية'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRTL ? 'المدرب المعتمد:' : 'Instructor:'}</span>
                    <span className="font-bold text-[#29235D]">{registeredData?.teacherName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{isRTL ? 'المواقيت المعتمدة:' : 'Approved Timezone:'}</span>
                    <span className="font-bold text-amber-800">🇪🇬 توقيت القاهرة (Cairo Time - CLT / GMT+2)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Login Button */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleConfirmAndEnterPortal}
                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] border border-[#D3B673]/40 shadow-lg transition-all cursor-pointer"
              >
                <span>{isRTL ? 'تأكيد ودخول المنصة ومباشرة الدروس فوراً' : 'Confirm & Access Student Dashboard Now'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 text-[#D3B673]" />
              </button>

              <a
                href={generateWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all text-center"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{isRTL ? 'تواصل مع الدعم الفني عبر واتساب لمزيد من الاستفسار' : 'Need help? Chat with WhatsApp Support'}</span>
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
