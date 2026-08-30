import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { ClassSession, WeekDay, StudentProfile } from '../../types';
import { getClassStatusConfig } from '../../lib/colorKeys';
import {
  X,
  Calendar,
  Clock,
  Video,
  User,
  Users,
  AlertTriangle,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Info,
  Sparkles,
  MessageCircle,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Send,
  Lock,
} from 'lucide-react';

interface ClassActionModalProps {
  session: ClassSession;
  onClose: () => void;
  onOpenChat?: (targetId: string, isGroup: boolean, title?: string) => void;
}

const DURATION_PRESETS = [
  { minutes: 30, labelAr: 'نصف ساعة (30 د)', labelEn: '30 min' },
  { minutes: 45, labelAr: '45 دقيقة', labelEn: '45 min' },
  { minutes: 60, labelAr: 'ساعة كاملة (60 د)', labelEn: '1 hour' },
  { minutes: 90, labelAr: 'ساعة ونصف (90 د)', labelEn: '1.5 hours' },
  { minutes: 120, labelAr: 'ساعتان (120 د)', labelEn: '2 hours' },
  { minutes: 180, labelAr: '3 ساعات', labelEn: '3 hours' },
  { minutes: 240, labelAr: '4 ساعات', labelEn: '4 hours' },
];

export const ClassActionModal: React.FC<ClassActionModalProps> = ({
  session,
  onClose,
  onOpenChat,
}) => {
  const {
    currentUser,
    teachers,
    students,
    programs,
    cancelClassSession,
    rescheduleClassSession,
    deleteClassSession,
  } = useApp();
  const { isRTL } = useI18n();

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'CANCEL' | 'RESCHEDULE' | 'DELETE'>('DETAILS');

  // Cancel state
  const [cancelReason, setCancelReason] = useState('');
  const [cancelTargetStudentId, setCancelTargetStudentId] = useState<string>('ALL');
  const [adminWaiveDeduction, setAdminWaiveDeduction] = useState(true);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);

  // Reschedule state
  const [rescheduleDate, setRescheduleDate] = useState(session.date);
  const [rescheduleStartTime, setRescheduleStartTime] = useState(session.startTime);
  const [rescheduleDurationMinutes, setRescheduleDurationMinutes] = useState<number>(() => {
    try {
      const [sh, sm] = session.startTime.split(':').map(Number);
      const [eh, em] = session.endTime.split(':').map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      return diff > 0 ? diff : 60;
    } catch {
      return 60;
    }
  });
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleTargetStudentId, setRescheduleTargetStudentId] = useState<string>('ALL');
  const [rescheduleSuccessMsg, setRescheduleSuccessMsg] = useState<string | null>(null);

  // Delete state
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // User role determination
  const userRole = currentUser?.role || 'STUDENT';
  const isAdmin = userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
  const isTeacher = userRole === 'TEACHER';
  const isStudent = userRole === 'STUDENT';

  const teacher = teachers.find(t => t.id === session.teacherId);
  const sessionStudents = students.filter(s => session.studentIds.includes(s.id));
  const program = programs.find(p => p.id === session.programId);
  const statusCfg = getClassStatusConfig(session.status);

  // Calculate hours remaining until class start
  const hoursUntilClass = useMemo(() => {
    try {
      const classStartDateTime = new Date(`${session.date}T${session.startTime}:00`);
      const now = new Date();
      const diffMs = classStartDateTime.getTime() - now.getTime();
      return diffMs / (1000 * 60 * 60);
    } catch {
      return 999;
    }
  }, [session.date, session.startTime]);

  const isEarlyStudentCancellation = hoursUntilClass >= 2;

  // Calculate calculated end time for rescheduling
  const computedRescheduleEndTime = useMemo(() => {
    try {
      const [h, m] = rescheduleStartTime.split(':').map(Number);
      const totalMinutes = h * 60 + m + rescheduleDurationMinutes;
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    } catch {
      return session.endTime;
    }
  }, [rescheduleStartTime, rescheduleDurationMinutes, session.endTime]);

  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      alert(isRTL ? 'يرجى كتابة سبب الإلغاء' : 'Please provide a cancellation reason');
      return;
    }

    const targetId = cancelTargetStudentId === 'ALL' ? undefined : cancelTargetStudentId;
    const result = cancelClassSession(
      session.id,
      cancelReason.trim(),
      userRole,
      targetId,
      adminWaiveDeduction
    );

    setCancelSuccessMsg(result.message);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = rescheduleTargetStudentId === 'ALL' ? undefined : rescheduleTargetStudentId;
    rescheduleClassSession(
      session.id,
      rescheduleDate,
      rescheduleStartTime,
      computedRescheduleEndTime,
      rescheduleReason.trim(),
      targetId
    );

    setRescheduleSuccessMsg(
      isRTL
        ? `تمت إعادة جدولة الحصة بنجاح إلى تاريخ ${rescheduleDate} الساعة ${rescheduleStartTime}`
        : `Class successfully rescheduled to ${rescheduleDate} at ${rescheduleStartTime}`
    );
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const handleDeleteSubmit = () => {
    if (!isAdmin) return;
    deleteClassSession(session.id);
    onClose();
  };

  const handleStartChat = () => {
    if (onOpenChat) {
      if (session.studentIds.length > 1) {
        onOpenChat(
          session.id,
          true,
          isRTL ? session.titleArabic || session.title : session.title
        );
      } else if (session.studentIds.length === 1) {
        const studentId = session.studentIds[0];
        // If current user is student, open chat with teacher
        if (isStudent) {
          onOpenChat(session.teacherId, false, teacher?.name);
        } else {
          // If teacher or admin, open chat with student
          const std = sessionStudents[0];
          onOpenChat(studentId, false, std?.name);
        }
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white night:bg-[#1A1633] w-full max-w-2xl rounded-3xl border border-[#29235D]/20 night:border-[#393168] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#29235D] to-[#1D1845] text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D3B673]/20 border border-[#D3B673]/40 flex items-center justify-center text-[#E8D5A3]">
              <Calendar className="w-5 h-5 text-[#D3B673]" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#E8D5A3] font-serif line-clamp-1">
                {isRTL ? session.titleArabic || session.title : session.title}
              </h3>
              <p className="text-xs text-gray-300 flex items-center gap-2">
                <span>{session.date}</span>
                <span>•</span>
                <span>{session.startTime} - {session.endTime}</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: `${statusCfg.hex}25`,
                    color: '#E8D5A3',
                    border: `1px solid ${statusCfg.hex}`,
                  }}
                >
                  {isRTL ? statusCfg.labelAr : statusCfg.labelEn}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#E8D5A3] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-gray-100 night:border-gray-800 bg-[#F8F6F0] night:bg-[#1D1845] px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('DETAILS')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'DETAILS'
                ? 'bg-white night:bg-[#1A1633] text-[#29235D] night:text-[#E8D5A3] border-t-2 border-t-[#D3B673] shadow-sm'
                : 'text-gray-600 night:text-gray-400 hover:text-gray-900'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-[#D3B673]" />
            <span>{isRTL ? 'تفاصيل الحصة' : 'Details'}</span>
          </button>

          <button
            onClick={() => setActiveTab('CANCEL')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'CANCEL'
                ? 'bg-white night:bg-[#1A1633] text-amber-700 night:text-amber-400 border-t-2 border-t-amber-500 shadow-sm'
                : 'text-gray-600 night:text-gray-400 hover:text-gray-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>{isRTL ? 'إلغاء الحصة' : 'Cancel Session'}</span>
          </button>

          <button
            onClick={() => setActiveTab('RESCHEDULE')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'RESCHEDULE'
                ? 'bg-white night:bg-[#1A1633] text-blue-700 night:text-blue-400 border-t-2 border-t-blue-500 shadow-sm'
                : 'text-gray-600 night:text-gray-400 hover:text-gray-900'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
            <span>{isRTL ? 'تأجيل وإعادة جدولة' : 'Reschedule'}</span>
          </button>

          {/* Admin Only Delete Tab */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('DELETE')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-1.5 ml-auto ${
                activeTab === 'DELETE'
                  ? 'bg-white night:bg-[#1A1633] text-rose-700 night:text-rose-400 border-t-2 border-t-rose-500 shadow-sm'
                  : 'text-rose-600 night:text-rose-400 hover:text-rose-800'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>{isRTL ? 'مسح الحصة (DELET) - للمدير فقط' : 'DELETE (Admin Only)'}</span>
            </button>
          )}
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto flex-1 text-sm text-gray-800 night:text-gray-200">
          {/* TAB 1: DETAILS */}
          {activeTab === 'DETAILS' && (
            <div className="space-y-4">
              {/* Program & Mode Banner */}
              <div className="p-4 rounded-2xl bg-[#F8F6F0] night:bg-[#251F45] border border-[#29235D]/10 night:border-[#393168] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-gray-500 night:text-gray-400 uppercase tracking-wider block">
                    {isRTL ? 'البرنامج التعليمي' : 'Program'}
                  </span>
                  <span className="font-bold text-sm text-[#29235D] night:text-[#E8D5A3]">
                    {isRTL ? program?.nameArabic || program?.name : program?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 night:bg-emerald-950/60 night:text-emerald-300 text-xs font-bold">
                    {session.studyMode === 'GROUP'
                      ? isRTL ? 'حلقة جماعية' : 'Group Circle'
                      : isRTL ? 'درس فردي خاص' : '1-on-1 Private'}
                  </span>
                </div>
              </div>

              {/* Teacher & Students */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white night:bg-[#1D1845] border border-gray-200 night:border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-500 night:text-gray-400 mb-1">
                    <User className="w-3.5 h-3.5 text-[#D3B673]" />
                    <span>{isRTL ? 'المعلم المسؤول:' : 'Teacher:'}</span>
                  </div>
                  <div className="font-bold text-[#29235D] night:text-[#E8D5A3]">
                    {teacher?.name || 'غير محدد'}
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono">{teacher?.code}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white night:bg-[#1D1845] border border-gray-200 night:border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-gray-500 night:text-gray-400 mb-1">
                    <Users className="w-3.5 h-3.5 text-[#D3B673]" />
                    <span>{isRTL ? 'الطلاب المشتركون:' : 'Enrolled Students:'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {sessionStudents.map(std => (
                      <span
                        key={std.id}
                        className="px-2 py-0.5 rounded-lg bg-gray-100 night:bg-gray-800 text-xs font-bold text-gray-700 night:text-gray-300"
                      >
                        {std.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Topic / Notes */}
              {session.topic && (
                <div className="p-3.5 rounded-2xl bg-[#F8F6F0] night:bg-[#251F45] border border-gray-200 night:border-gray-700">
                  <div className="text-xs font-bold text-gray-500 mb-1">
                    {isRTL ? 'موضوع الدرس:' : 'Lesson Topic:'}
                  </div>
                  <div className="font-semibold">{session.topic}</div>
                </div>
              )}

              {/* Action Buttons: Live Room & Instant Chat */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={session.zoomUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>{isRTL ? 'دخول الغرفة التفاعلية (Zoom)' : 'Join Virtual Classroom'}</span>
                </a>

                {onOpenChat && (
                  <button
                    onClick={handleStartChat}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#29235D] to-[#1D1845] hover:opacity-90 text-[#E8D5A3] font-bold text-sm shadow-md transition-all cursor-pointer border border-[#D3B673]/30"
                  >
                    <MessageCircle className="w-4 h-4 text-[#D3B673]" />
                    <span>
                      {session.studentIds.length > 1
                        ? isRTL ? 'محادثة المجموعة والحلقة' : 'Group Circle Chat'
                        : isRTL ? 'محادثة خاصة' : 'Direct Message'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CANCEL */}
          {activeTab === 'CANCEL' && (
            <div>
              {cancelSuccessMsg ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-emerald-700">{cancelSuccessMsg}</h4>
                </div>
              ) : (
                <form onSubmit={handleCancelSubmit} className="space-y-4">
                  {/* Student cancellation rule notification banner */}
                  {isStudent && (
                    <div
                      className={`p-4 rounded-2xl border ${
                        isEarlyStudentCancellation
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900 night:bg-emerald-950/40 night:border-emerald-800 night:text-emerald-300'
                          : 'bg-amber-50 border-amber-200 text-amber-900 night:bg-amber-950/40 night:border-amber-800 night:text-amber-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {isEarlyStudentCancellation ? (
                          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="text-xs space-y-1">
                          <div className="font-bold text-sm">
                            {isEarlyStudentCancellation
                              ? (isRTL ? '✅ إلغاء مبكر مجاني متاح (أكثر من ساعتين)' : 'Free Early Cancellation')
                              : (isRTL ? '⚠️ تنبيه الإلغاء المتأخر (أقل من ساعتين)' : 'Late Cancellation Notice')}
                          </div>
                          <p>
                            {isEarlyStudentCancellation
                              ? (isRTL
                                  ? 'بما أن الإلغاء يتم قبل موعد الحصة بأكثر من ساعتين، فلن يتم خصم أي رصيد من باقتك وتبقى الحصة محفوظة لك.'
                                  : 'Since you are cancelling at least 2 hours in advance, no session quota will be deducted.')
                              : (isRTL
                                  ? 'وفقاً للائحة منصة الآفاق الدولية، الإلغاء قبل أقل من ساعتين يحتسب الحصة على حساب الطالب نظراً لحجز وقت المعلم.'
                                  : 'Cancelling less than 2 hours before the start time will count against your session quota.')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Teacher cancellation notice & suggestion to reschedule */}
                  {isTeacher && (
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 night:bg-blue-950/40 night:border-blue-800 night:text-blue-300">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                          <div className="font-bold text-sm">
                            {isRTL ? 'ملاحظة المعلم وإعادة الجدولة' : 'Teacher Notice'}
                          </div>
                          <p>
                            {isRTL
                              ? 'يمكنك إلغاء الحصة هنا أو الانتقال إلى تبويب (تأجيل وإعادة جدولة) لتحديد موعد بديل فوري للطلاب دون إرباك جدولهم.'
                              : 'You can cancel this session or use the Reschedule tab to set a replacement slot.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Group class target selection */}
                  {session.studentIds.length > 1 && (isAdmin || isTeacher) && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 night:text-gray-300 mb-1.5">
                        {isRTL ? 'نطاق الإلغاء (فردي أو جماعي):' : 'Cancellation Scope:'}
                      </label>
                      <select
                        value={cancelTargetStudentId}
                        onChange={e => setCancelTargetStudentId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 night:border-gray-700 bg-white night:bg-[#1D1845] text-xs font-bold"
                      >
                        <option value="ALL">
                          {isRTL ? '🚫 إلغاء الحصة لكامل طلاب الحلقة (جماعي)' : 'Cancel for ALL students in group'}
                        </option>
                        {sessionStudents.map(s => (
                          <option key={s.id} value={s.id}>
                            {isRTL ? `إلغاء الحضور للطالب فقط: ${s.name}` : `Cancel only for student: ${s.name}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Admin Deduction Override */}
                  {isAdmin && (
                    <div className="p-3.5 rounded-2xl bg-gray-50 night:bg-gray-800/60 border border-gray-200 night:border-gray-700 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-gray-800 night:text-gray-200">
                          {isRTL ? 'عدم الخصم من رصيد باقة الطالب (إعفاء إداري):' : 'Waive Quota Deduction (Admin):'}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {isRTL ? 'الحفاظ على رصيد حصص الطالب سليماً' : 'Preserve student quota'}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={adminWaiveDeduction}
                        onChange={e => setAdminWaiveDeduction(e.target.checked)}
                        className="w-4 h-4 accent-[#29235D]"
                      />
                    </div>
                  )}

                  {/* Cancellation Reason */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 night:text-gray-300 mb-1.5">
                      {isRTL ? 'سبب الإلغاء (مطلوب للتوثيق):' : 'Reason for Cancellation:'}
                    </label>
                    <textarea
                      required
                      value={cancelReason}
                      onChange={e => setCancelReason(e.target.value)}
                      placeholder={
                        isRTL
                          ? 'يرجى كتابة سبب الإلغاء بوضوح لإشعار الأطراف المعنية...'
                          : 'Please specify the cancellation reason...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 night:border-gray-700 bg-white night:bg-[#1D1845] text-xs h-24"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('DETAILS')}
                      className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold hover:bg-gray-100 transition-all cursor-pointer"
                    >
                      {isRTL ? 'تراجع' : 'Back'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>{isRTL ? 'تأكيد إلغاء الحصة' : 'Confirm Cancellation'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: RESCHEDULE */}
          {activeTab === 'RESCHEDULE' && (
            <div>
              {rescheduleSuccessMsg ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-blue-700">{rescheduleSuccessMsg}</h4>
                </div>
              ) : (
                <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                  {/* Group class scope */}
                  {session.studentIds.length > 1 && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 night:text-gray-300 mb-1.5">
                        {isRTL ? 'نطاق التأجيل (فردي أو جماعي):' : 'Reschedule Scope:'}
                      </label>
                      <select
                        value={rescheduleTargetStudentId}
                        onChange={e => setRescheduleTargetStudentId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 night:border-gray-700 bg-white night:bg-[#1D1845] text-xs font-bold"
                      >
                        <option value="ALL">
                          {isRTL ? '📅 تأجيل الحصة لجميع طلاب المجموعة' : 'Reschedule for ALL students in group'}
                        </option>
                        {sessionStudents.map(s => (
                          <option key={s.id} value={s.id}>
                            {isRTL ? `تأجيل الحصة لطالب محدد فقط: ${s.name}` : `Reschedule only for student: ${s.name}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* New Date & Start Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 night:text-gray-300 mb-1.5">
                        {isRTL ? 'التاريخ الجديد للحصة:' : 'New Date:'}
                      </label>
                      <input
                        type="date"
                        required
                        value={rescheduleDate}
                        onChange={e => setRescheduleDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 night:border-gray-700 bg-white night:bg-[#1D1845] text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 night:text-gray-300 mb-1.5">
                        {isRTL ? 'وقت البدء الجديد:' : 'New Start Time:'}
                      </label>
                      <input
                        type="time"
                        required
                        value={rescheduleStartTime}
                        onChange={e => setRescheduleStartTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 night:border-gray-700 bg-white night:bg-[#1D1845] text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Duration Presets */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 night:text-gray-300 mb-1.5">
                      {isRTL ? 'مدة الدرس المحددة:' : 'Lesson Duration:'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {DURATION_PRESETS.map(preset => (
                        <button
                          key={preset.minutes}
                          type="button"
                          onClick={() => setRescheduleDurationMinutes(preset.minutes)}
                          className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                            rescheduleDurationMinutes === preset.minutes
                              ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-sm'
                              : 'bg-gray-50 night:bg-[#1D1845] border-gray-200 night:border-gray-700 text-gray-700 night:text-gray-300 hover:border-[#D3B673]'
                          }`}
                        >
                          {isRTL ? preset.labelAr : preset.labelEn}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 text-xs font-bold text-[#29235D] night:text-[#E8D5A3] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#D3B673]" />
                      <span>
                        {isRTL
                          ? `وقت انتهاء الحصة المحسوب تلقائياً: ${computedRescheduleEndTime}`
                          : `Calculated End Time: ${computedRescheduleEndTime}`}
                      </span>
                    </div>
                  </div>

                  {/* Reason for rescheduling */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 night:text-gray-300 mb-1.5">
                      {isRTL ? 'سبب التأجيل (اختياري):' : 'Reason for Rescheduling:'}
                    </label>
                    <input
                      type="text"
                      value={rescheduleReason}
                      onChange={e => setRescheduleReason(e.target.value)}
                      placeholder={
                        isRTL
                          ? 'مثال: بطلب من الطالب، أو ظرف طارئ للمعلم...'
                          : 'e.g. Student request, Teacher emergency...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 night:border-gray-700 bg-white night:bg-[#1D1845] text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('DETAILS')}
                      className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold hover:bg-gray-100 transition-all cursor-pointer"
                    >
                      {isRTL ? 'تراجع' : 'Back'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>{isRTL ? 'تأكيد إعادة الجدولة' : 'Confirm Reschedule'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: DELETE (Admin Only) */}
          {activeTab === 'DELETE' && isAdmin && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 night:bg-rose-950/40 night:border-rose-800 night:text-rose-300">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-sm text-rose-800 night:text-rose-300">
                      {isRTL ? '⚠️ صلاحية خاصة للمدير العام فقط (DELET)' : 'Super Admin Delete Authority'}
                    </div>
                    <p>
                      {isRTL
                        ? 'زر الحذف ومسح الحصة نهائياً من قاعدة البيانات محصور بالإدارة العامة فقط ومحجوب تماماً عن المعلم والطالب. يرجى تأكيد العملية بحذر.'
                        : 'Permanent deletion is strictly restricted to Admin and cannot be undone.'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 night:text-gray-300 mb-1.5">
                  {isRTL
                    ? 'لتأكيد الحذف النهائي، اكتب كلمة (DELETE) أدناه:'
                    : 'To confirm permanent deletion, type (DELETE) below:'}
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 bg-white night:bg-[#1D1845] text-xs font-mono font-bold tracking-widest text-rose-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('DETAILS')}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-bold hover:bg-gray-100 transition-all cursor-pointer"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE'}
                  onClick={handleDeleteSubmit}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isRTL ? 'مسح الحصة نهائياً (DELET)' : 'Permanently Delete'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
