import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { ClassSession, WeekDay, StudentProfile, TeacherProfile, SubscriptionStatus } from '../../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Plus,
  Search,
  Filter,
  Users,
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Zap,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CreditCard,
  ClipboardCheck,
  Layers,
  CalendarDays,
  ListFilter,
  Check,
  User,
  GraduationCap,
  RefreshCw,
  Phone,
  MessageCircle,
} from 'lucide-react';

interface MasterPlatformCalendarProps {
  onNavigateTab?: (tab: string) => void;
  defaultView?: 'WEEK' | 'MONTH' | 'DAY' | 'LIST';
}

const WEEK_DAYS: { key: WeekDay; dayIndex: number; labelAr: string; labelEn: string; shortAr: string; shortEn: string }[] = [
  { key: 'SATURDAY', dayIndex: 6, labelAr: 'السبت', labelEn: 'Saturday', shortAr: 'سبت', shortEn: 'Sat' },
  { key: 'SUNDAY', dayIndex: 0, labelAr: 'الأحد', labelEn: 'Sunday', shortAr: 'أحد', shortEn: 'Sun' },
  { key: 'MONDAY', dayIndex: 1, labelAr: 'الإثنين', labelEn: 'Monday', shortAr: 'إثنين', shortEn: 'Mon' },
  { key: 'TUESDAY', dayIndex: 2, labelAr: 'الثلاثاء', labelEn: 'Tuesday', shortAr: 'ثلاثاء', shortEn: 'Tue' },
  { key: 'WEDNESDAY', dayIndex: 3, labelAr: 'الأربعاء', labelEn: 'Wednesday', shortAr: 'أربعاء', shortEn: 'Wed' },
  { key: 'THURSDAY', dayIndex: 4, labelAr: 'الخميس', labelEn: 'Thursday', shortAr: 'خميس', shortEn: 'Thu' },
  { key: 'FRIDAY', dayIndex: 5, labelAr: 'الجمعة', labelEn: 'Friday', shortAr: 'جمعة', shortEn: 'Fri' },
];

export const MasterPlatformCalendar: React.FC<MasterPlatformCalendarProps> = ({
  onNavigateTab,
  defaultView = 'WEEK',
}) => {
  const {
    currentUser,
    classes,
    students,
    teachers,
    programs,
    subscriptions,
    attendance,
    addClassSession,
    updateClassSession,
    deleteClassSession,
    markAttendance,
    rechargeStudentSessions,
    getStudentQuota,
    hasTeacherPermission,
    settings,
  } = useApp();

  const { t, isRTL } = useI18n();

  // Role permissions
  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';
  const isTeacher = currentUser?.role === 'TEACHER';
  const isStudent = currentUser?.role === 'STUDENT';
  const canSchedule = isAdmin || (isTeacher && hasTeacherPermission('canScheduleClasses'));
  const canRecharge = isAdmin || isTeacher;

  // Views & Filters State
  const [viewMode, setViewMode] = useState<'WEEK' | 'MONTH' | 'DAY' | 'LIST'>(defaultView);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedDayKey, setSelectedDayKey] = useState<WeekDay>('SATURDAY');
  const [filterTeacherId, setFilterTeacherId] = useState<string>('ALL');
  const [filterStudentId, setFilterStudentId] = useState<string>('ALL');
  const [filterProgramId, setFilterProgramId] = useState<string>('ALL');
  const [filterQuotaStatus, setFilterQuotaStatus] = useState<'ALL' | 'ACTIVE' | 'DEPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals State
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeTargetStudentId, setRechargeTargetStudentId] = useState<string>('');
  const [rechargeSessionsCount, setRechargeSessionsCount] = useState<number>(5);
  const [rechargeDaysCount, setRechargeDaysCount] = useState<number>(30);
  const [rechargeNotes, setRechargeNotes] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Class Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newProgramId, setNewProgramId] = useState(programs[0]?.id || '');
  const [newTeacherId, setNewTeacherId] = useState(isTeacher ? currentUser.id : teachers[0]?.id || '');
  const [newStudentId, setNewStudentId] = useState(students[0]?.id || '');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('17:00');
  const [newEndTime, setNewEndTime] = useState('18:00');
  const [newZoomUrl, setNewZoomUrl] = useState(settings.defaultZoomLink || 'https://zoom.us/j/9876543210');
  const [newTopic, setNewTopic] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Scoped classes based on Role
  const scopedClasses = useMemo(() => {
    return classes.filter(cls => {
      if (isStudent) {
        return cls.studentIds.includes(currentUser.id);
      }
      if (isTeacher) {
        return cls.teacherId === currentUser.id;
      }
      return true; // Admin sees all
    });
  }, [classes, currentUser, isStudent, isTeacher]);

  // Filtered classes according to user selection
  const filteredClasses = useMemo(() => {
    return scopedClasses.filter(cls => {
      if (filterTeacherId !== 'ALL' && cls.teacherId !== filterTeacherId) return false;
      if (filterStudentId !== 'ALL' && !cls.studentIds.includes(filterStudentId)) return false;
      if (filterProgramId !== 'ALL' && cls.programId !== filterProgramId) return false;

      // Quota filter
      if (filterQuotaStatus !== 'ALL') {
        const hasDepletedStudent = cls.studentIds.some(sId => {
          const quota = getStudentQuota(sId);
          return quota.remainingSessions <= 0 || quota.isExpired;
        });
        if (filterQuotaStatus === 'DEPLETED' && !hasDepletedStudent) return false;
        if (filterQuotaStatus === 'ACTIVE' && hasDepletedStudent) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const teacher = teachers.find(t => t.id === cls.teacherId);
        const matchTitle = cls.title.toLowerCase().includes(q) || (cls.titleArabic && cls.titleArabic.includes(q));
        const matchTeacher = teacher?.name.toLowerCase().includes(q) || teacher?.nameArabic?.includes(q);
        const matchTopic = cls.topic && cls.topic.toLowerCase().includes(q);
        if (!matchTitle && !matchTeacher && !matchTopic) return false;
      }

      return true;
    });
  }, [scopedClasses, filterTeacherId, filterStudentId, filterProgramId, filterQuotaStatus, searchQuery, teachers, getStudentQuota]);

  // Calculate current student's quota if student role
  const currentStudentQuota = isStudent ? getStudentQuota(currentUser.id) : null;

  // Open Add Class Modal pre-filled for specific Day
  const handleOpenAddForDay = (dayKey: WeekDay, targetDateStr?: string) => {
    if (!canSchedule) {
      alert(isRTL ? 'صلاحية جدولة الحصص مقيدة لحسابك' : 'Class scheduling is restricted for your role');
      return;
    }

    if (targetDateStr) {
      setNewDate(targetDateStr);
    } else {
      // Calculate next occurrence of this weekday
      const dayObj = WEEK_DAYS.find(d => d.key === dayKey);
      if (dayObj) {
        const today = new Date();
        const currentDayIndex = today.getDay();
        const distance = (dayObj.dayIndex + 7 - currentDayIndex) % 7;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + (distance === 0 ? 0 : distance));
        setNewDate(targetDate.toISOString().split('T')[0]);
      }
    }

    if (isTeacher) {
      setNewTeacherId(currentUser.id);
    }

    const dayName = WEEK_DAYS.find(d => d.key === dayKey);
    setNewTitle(isRTL ? `حصة ${dayName?.labelAr || ''}` : `${dayName?.labelEn || ''} Session`);
    setNewTitleAr(isRTL ? `حصة ${dayName?.labelAr || ''}` : `${dayName?.labelEn || ''} Session`);
    setShowAddClassModal(true);
  };

  // Handle Schedule Submit
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newStudentId) {
      alert(isRTL ? 'يرجى ملء جميع الحقول المطلوبة واختيار الطالب' : 'Please fill all required fields and select student');
      return;
    }

    // Check student quota
    const quota = getStudentQuota(newStudentId);
    const selectedStudent = students.find(s => s.id === newStudentId);

    addClassSession({
      programId: newProgramId || programs[0]?.id || 'prg-01',
      teacherId: newTeacherId || teachers[0]?.id || 'tea-01',
      studentIds: [newStudentId],
      title: newTitle.trim(),
      titleArabic: newTitleAr.trim() || newTitle.trim(),
      topic: newTopic.trim() || undefined,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      zoomUrl: newZoomUrl,
      zoomMeetingId: '987 654 3210',
      zoomPassword: 'ALTEQ2026',
      status: 'SCHEDULED',
      isLockedDueToQuota: quota.remainingSessions <= 0 || quota.isExpired,
    });

    setShowAddClassModal(false);
    setNewTitle('');
    setNewTitleAr('');
    setNewTopic('');

    if (quota.remainingSessions <= 0) {
      showToast(
        isRTL
          ? `⚠️ تمت إضافة الحصة، ولكن رصيد الطالب (${selectedStudent?.name}) منتهي (0 حصص). الحصة غير مفعّلة حتى يتم الشحن.`
          : `⚠️ Class added, but student (${selectedStudent?.name}) has 0 remaining sessions. Class will stay inactive until recharged.`
      );
    } else {
      showToast(
        isRTL
          ? `✅ تمت جدولة الحصة بنجاح! رصيد الطالب: ${quota.remainingSessions} حصص متبقية.`
          : `✅ Class scheduled successfully! Student quota: ${quota.remainingSessions} remaining.`
      );
    }
  };

  // Open Quick Recharge Modal
  const handleOpenRecharge = (studentId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRechargeTargetStudentId(studentId);
    setRechargeSessionsCount(5);
    setRechargeDaysCount(30);
    setRechargeNotes('');
    setShowRechargeModal(true);
  };

  // Confirm Recharge
  const handleConfirmRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeTargetStudentId || rechargeSessionsCount <= 0) return;

    const student = students.find(s => s.id === rechargeTargetStudentId);
    rechargeStudentSessions(
      rechargeTargetStudentId,
      Number(rechargeSessionsCount),
      Number(rechargeDaysCount),
      rechargeNotes || `Recharged by ${currentUser?.name || 'Administrator'}`
    );

    setShowRechargeModal(false);
    showToast(
      isRTL
        ? `🎉 تم شحن (${rechargeSessionsCount} حصص) للطالب [${student?.name || ''}] بنجاح، وتفعيل الحصص والسبورة!`
        : `🎉 Successfully charged ${rechargeSessionsCount} lessons for ${student?.name || ''}! System unlocked.`
    );
  };

  // Quick Attendance Roll Call
  const handleToggleAttendance = (cls: ClassSession, studentId: string) => {
    const existing = attendance.find(a => a.sessionId === cls.id && a.studentId === studentId);
    const isCurrentlyPresent = existing && (existing.status === 'PRESENT' || existing.status === 'LATE');
    const nextStatus = isCurrentlyPresent ? 'ABSENT' : 'PRESENT';

    markAttendance({
      sessionId: cls.id,
      studentId,
      teacherId: cls.teacherId,
      programId: cls.programId,
      date: cls.date,
      status: nextStatus,
      notes: isCurrentlyPresent ? 'Marked Absent' : 'Attended & session deducted',
    });

    if (nextStatus === 'PRESENT') {
      showToast(isRTL ? '✅ تم تسجيل حضور الطالب وخصم حصة من رصيد الباقة' : '✅ Attendance confirmed & 1 session deducted from quota');
    } else {
      showToast(isRTL ? 'تم تعديل السجل إلى غائب' : 'Status updated to absent');
    }
  };

  // Compute Weekly Columns data
  const weekDaysData = useMemo(() => {
    return WEEK_DAYS.map(dayInfo => {
      // Find classes that match this day of week or specific dates
      const dayClasses = filteredClasses.filter(cls => {
        try {
          const clsDate = new Date(cls.date);
          return clsDate.getDay() === dayInfo.dayIndex;
        } catch {
          return false;
        }
      });

      return {
        ...dayInfo,
        classes: dayClasses,
      };
    });
  }, [filteredClasses]);

  return (
    <div className="space-y-6">
      
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#29235D] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#D3B673] flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 max-w-md">
          <Sparkles className="w-5 h-5 text-[#D3B673] flex-shrink-0 animate-spin" />
          <p className="text-xs font-bold leading-relaxed">{toastMessage}</p>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#29235D] via-[#1D1845] to-[#29235D] rounded-3xl p-6 sm:p-8 text-white border border-[#D3B673]/30 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-[#D3B673]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D3B673]/20 text-[#E8D5A3] border border-[#D3B673]/40 flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-[#D3B673]" />
                {isAdmin
                  ? isRTL ? 'التقويم الشامل للمنصة والحصص' : 'Master Platform Schedule'
                  : isTeacher
                  ? isRTL ? 'جدول حصصي والطلاب المعتمدين' : 'Faculty Timetable & Students'
                  : isRTL ? 'جدول حصصي ومواعيدي مع المعلمين' : 'My Personal Class Schedule'}
              </span>
              <span className="text-[10px] font-mono font-bold bg-black/40 px-2 py-0.5 rounded text-white/80">
                {filteredClasses.length} {isRTL ? 'حصة مسجلة' : 'Sessions'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-wide">
              {isRTL ? 'التقويم التفاعلي وإدارة رصيد الحصص' : 'Interactive Calendar & Lesson Quotas'}
            </h1>

            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              {isAdmin
                ? isRTL
                  ? 'عرض جميع الحصص لجميع المعلمين والطلاب في شاشة واحدة. يمكنك النقر على أي يوم لإضافة حصة ومتابعة رصيد شحن كل طالب.'
                  : 'Central interactive calendar for all teachers & students. Click any day to schedule sessions and monitor quota balances.'
                : isTeacher
                ? isRTL
                  ? 'جدول حصصك المباشرة مع طلابك. يتم تمييز الحصص غير المفعّلة في حال انتهاء شحن رصيد الطالب تلقائياً.'
                  : 'Live schedule for your assigned students. Inactive classes with depleted quotas are highlighted automatically.'
                : isRTL
                ? 'مواعيدك الدراسية المباشرة مع المعلمين وروابط Zoom. يتوقف الجدول تلقائياً عند انتهاء باقة الحصص المشحونة.'
                : 'Your upcoming live classes with teachers. Access Zoom links and track your remaining lesson credits.'}
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {canSchedule && (
              <button
                onClick={() => handleOpenAddForDay('SATURDAY')}
                className="px-4 py-2.5 rounded-2xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isRTL ? 'إضافة حصة للجدول' : 'Schedule Class'}</span>
              </button>
            )}

            {canRecharge && (
              <button
                onClick={() => handleOpenRecharge(students[0]?.id || '')}
                className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-[#E8D5A3] font-bold text-xs sm:text-sm flex items-center gap-2 border border-[#D3B673]/40 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-[#D3B673]" />
                <span>{isRTL ? 'شحن رصيد طالب ⚡' : 'Recharge Student Quota ⚡'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Student Alert if Quota is Depleted (Student View) */}
      {isStudent && currentStudentQuota && (
        currentStudentQuota.remainingSessions <= 0 ? (
          <div className="bg-gradient-to-r from-red-600 via-rose-700 to-red-800 text-white rounded-3xl p-5 sm:p-6 shadow-lg border border-red-400 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold font-serif">
                  {isRTL ? '⚠️ انتهى رصيد باقة الحصص الخاصة بك (0 حصة متبقية)' : '⚠️ Lesson Package Depleted (0 Remaining Sessions)'}
                </h3>
                <p className="text-xs text-white/90 leading-relaxed max-w-2xl">
                  {isRTL
                    ? 'لقد استنفذت جميع الحصص المحجوزة في باقتك. النظام والسبورة متوقفان مؤقتاً. يرجى التواصل مع الإدارة أو طلب شحن وتجديد الباقة لتفعيل جدول الحصص القادمة.'
                    : 'All booked lessons have been completed. System access is paused. Please contact administration to recharge your quota.'}
                </p>
              </div>
            </div>

            <a
              href="https://wa.me/201021430489?text=السلام%20عليكم%20أريد%20شحن%20وتجديد%20باقة%20الحصص%20في%20منصة%20آفاق"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-white text-red-700 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-2 shadow-md flex-shrink-0 transition-all"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>{isRTL ? 'طلب شحن الباقة عبر واتساب 💬' : 'Request Recharge via WhatsApp'}</span>
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-5 border border-[#29235D]/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{isRTL ? 'حالة باقة الحصص النشطة' : 'Active Lesson Package'}</p>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#29235D] font-serif">
                    {currentStudentQuota.remainingSessions} {isRTL ? 'حصص متبقية' : 'Sessions Remaining'}
                  </span>
                  <span className="text-xs font-bold text-gray-400">
                    ({currentStudentQuota.attendedSessions} {isRTL ? 'مكتملة' : 'Attended'} / {currentStudentQuota.totalSessions} {isRTL ? 'إجمالي' : 'Total'})
                  </span>
                </div>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
              <Unlock className="w-3.5 h-3.5 text-emerald-600" />
              {isRTL ? 'السيستم مفعّل والحصص نشطة' : 'System Active & Unlocked'}
            </span>
          </div>
        )
      )}

      {/* 3. Controls & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#29235D]/10 shadow-xs space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F8F6F0] rounded-2xl border border-gray-200 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setViewMode('WEEK')}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                viewMode === 'WEEK'
                  ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                  : 'text-[#786F9A] hover:text-[#29235D]'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>{isRTL ? 'الجدول الأسبوعي (7 أيام)' : 'Weekly Matrix (7 Days)'}</span>
            </button>

            <button
              onClick={() => setViewMode('DAY')}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                viewMode === 'DAY'
                  ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                  : 'text-[#786F9A] hover:text-[#29235D]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{isRTL ? 'جدول اليوم (يوم بيوم)' : 'Day Agenda'}</span>
            </button>

            <button
              onClick={() => setViewMode('LIST')}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                viewMode === 'LIST'
                  ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                  : 'text-[#786F9A] hover:text-[#29235D]'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>{isRTL ? 'قائمة الحصص المفصلة' : 'Session List'}</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'بحث عن حصة، معلم، أو موضوع...' : 'Search classes, teachers, topics...'}
              className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 bg-[#FBF9F4] border border-gray-200 rounded-xl text-xs text-[#29235D] focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
            />
          </div>
        </div>

        {/* Filter Dropdowns (for Admin & Teacher) */}
        {!isStudent && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2 border-t border-gray-100 text-xs">
            
            {/* Filter by Teacher (Admin only) */}
            {isAdmin && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">
                  {isRTL ? 'فلترة حسب المعلم' : 'Filter by Teacher'}
                </label>
                <select
                  value={filterTeacherId}
                  onChange={e => setFilterTeacherId(e.target.value)}
                  className="w-full p-2 bg-[#FBF9F4] border border-gray-200 rounded-xl font-medium text-[#29235D]"
                >
                  <option value="ALL">{isRTL ? 'جميع المعلمين' : 'All Teachers'}</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {isRTL ? t.nameArabic || t.name : t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter by Student */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">
                {isRTL ? 'فلترة حسب الطالب' : 'Filter by Student'}
              </label>
              <select
                value={filterStudentId}
                onChange={e => setFilterStudentId(e.target.value)}
                className="w-full p-2 bg-[#FBF9F4] border border-gray-200 rounded-xl font-medium text-[#29235D]"
              >
                <option value="ALL">{isRTL ? 'جميع الطلاب' : 'All Students'}</option>
                {students.map(s => {
                  const quota = getStudentQuota(s.id);
                  return (
                    <option key={s.id} value={s.id}>
                      {isRTL ? s.nameArabic || s.name : s.name} ({quota.remainingSessions} {isRTL ? 'حصص' : 'left'})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Filter by Program */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">
                {isRTL ? 'فلترة حسب البرنامج' : 'Filter by Program'}
              </label>
              <select
                value={filterProgramId}
                onChange={e => setFilterProgramId(e.target.value)}
                className="w-full p-2 bg-[#FBF9F4] border border-gray-200 rounded-xl font-medium text-[#29235D]"
              >
                <option value="ALL">{isRTL ? 'جميع البرامج' : 'All Programs'}</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>
                    {isRTL ? p.nameArabic || p.name : p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Quota / Balance Status */}
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1">
                {isRTL ? 'حالة رصيد الطالب' : 'Student Quota Status'}
              </label>
              <select
                value={filterQuotaStatus}
                onChange={e => setFilterQuotaStatus(e.target.value as any)}
                className="w-full p-2 bg-[#FBF9F4] border border-gray-200 rounded-xl font-bold text-[#29235D]"
              >
                <option value="ALL">{isRTL ? 'جميع الحالات' : 'All Quota Statuses'}</option>
                <option value="ACTIVE">{isRTL ? '🟢 رصيد نشط (مفعّلة)' : '🟢 Active Balance'}</option>
                <option value="DEPLETED">{isRTL ? '🔴 رصيد منتهي (غير مفعّلة - تحتاج شحن)' : '🔴 Depleted Quota (Inactive)'}</option>
              </select>
            </div>

          </div>
        )}

      </div>

      {/* 4. MAIN VIEW: WEEKLY MATRIX (7 Columns: Saturday to Friday) */}
      {viewMode === 'WEEK' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4">
            {weekDaysData.map(dayCol => {
              const hasClasses = dayCol.classes.length > 0;
              const hasDepletedClass = dayCol.classes.some(cls => {
                return cls.studentIds.some(sId => {
                  const quota = getStudentQuota(sId);
                  return quota.remainingSessions <= 0 || quota.isExpired;
                });
              });

              return (
                <div
                  key={dayCol.key}
                  className={`rounded-3xl border transition-all flex flex-col min-h-[380px] ${
                    hasDepletedClass
                      ? 'bg-amber-50/40 border-amber-200'
                      : hasClasses
                      ? 'bg-white border-[#29235D]/15 shadow-xs'
                      : 'bg-white/70 border-gray-200/80'
                  }`}
                >
                  {/* Day Column Header */}
                  <div className="p-3.5 border-b border-gray-100 bg-[#FBF9F4] rounded-t-3xl flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#29235D] font-serif">
                        {isRTL ? dayCol.labelAr : dayCol.labelEn}
                      </h3>
                      <span className="text-[10px] text-gray-500 font-semibold">
                        {dayCol.classes.length} {isRTL ? 'حصص' : 'Classes'}
                      </span>
                    </div>

                    {canSchedule && (
                      <button
                        onClick={() => handleOpenAddForDay(dayCol.key)}
                        className="w-7 h-7 rounded-xl bg-[#29235D] hover:bg-[#D3B673] text-[#D3B673] hover:text-[#29235D] flex items-center justify-center transition-all cursor-pointer shadow-xs"
                        title={isRTL ? `إضافة حصة يوم ${dayCol.labelAr}` : `Schedule class on ${dayCol.labelEn}`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Day Classes Content List */}
                  <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[500px]">
                    {dayCol.classes.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-400">
                        <CalendarIcon className="w-6 h-6 mb-1 opacity-30" />
                        <p className="text-[11px] font-medium">
                          {isRTL ? 'لا توجد حصص مجدولة' : 'No classes'}
                        </p>
                        {canSchedule && (
                          <button
                            onClick={() => handleOpenAddForDay(dayCol.key)}
                            className="mt-2 text-[10px] font-bold text-[#29235D] hover:text-[#D3B673] flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>{isRTL ? 'إضافة حصة' : 'Add class'}</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      dayCol.classes.map(cls => {
                        const teacher = teachers.find(t => t.id === cls.teacherId);
                        const program = programs.find(p => p.id === cls.programId);
                        const student = students.find(s => cls.studentIds.includes(s.id));
                        const quota = student ? getStudentQuota(student.id) : null;
                        const isDepleted = quota ? quota.remainingSessions <= 0 || quota.isExpired : false;

                        return (
                          <div
                            key={cls.id}
                            className={`p-3 rounded-2xl border transition-all relative ${
                              isDepleted
                                ? 'bg-rose-50/90 border-rose-300 shadow-xs'
                                : 'bg-[#FBF9F4] border-gray-200 hover:border-[#D3B673] shadow-xs'
                            }`}
                          >
                            {/* Inactive Due to Quota Badge */}
                            {isDepleted ? (
                              <div className="mb-2 px-2 py-0.5 rounded-lg bg-rose-100 border border-rose-300 text-rose-800 text-[9px] font-extrabold flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-rose-600 flex-shrink-0" />
                                  {isRTL ? 'الحصة غير مفعّلة (رصيد 0)' : 'Inactive (0 Quota)'}
                                </span>
                                {canRecharge && student && (
                                  <button
                                    onClick={(e) => handleOpenRecharge(student.id, e)}
                                    className="underline text-rose-900 font-black hover:text-rose-700 cursor-pointer"
                                  >
                                    {isRTL ? 'شحن ⚡' : 'Recharge ⚡'}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="mb-2 flex items-center justify-between text-[9px]">
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                                  {quota ? `متبقي ${quota.remainingSessions} حصص` : 'نشطة'}
                                </span>
                                <span className="font-mono text-gray-500 font-semibold">{cls.startTime}</span>
                              </div>
                            )}

                            {/* Class Title */}
                            <h4 className="text-xs font-bold text-[#29235D] line-clamp-1">
                              {isRTL ? cls.titleArabic || cls.title : cls.title}
                            </h4>

                            {/* Student Name */}
                            {student && (
                              <p className="text-[11px] text-gray-700 mt-1 flex items-center gap-1">
                                <GraduationCap className="w-3 h-3 text-[#D3B673]" />
                                <span className="font-semibold">{isRTL ? student.nameArabic || student.name : student.name}</span>
                              </p>
                            )}

                            {/* Teacher Name (if not in teacher view) */}
                            {!isTeacher && teacher && (
                              <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                                <User className="w-2.5 h-2.5 text-gray-400" />
                                <span>{isRTL ? teacher.nameArabic || teacher.name : teacher.name}</span>
                              </p>
                            )}

                            {/* Program Name */}
                            {program && (
                              <span className="inline-block text-[9px] font-medium text-gray-400 mt-1 truncate max-w-full">
                                {isRTL ? program.nameArabic || program.name : program.name}
                              </span>
                            )}

                            {/* Quick Action Buttons */}
                            <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center justify-between gap-1">
                              {/* Zoom Link Button */}
                              {isDepleted && isStudent ? (
                                <span
                                  className="text-[10px] font-bold text-gray-400 flex items-center gap-1"
                                  title={isRTL ? 'يرجى شحن الرصيد لفتح رابط الزووم' : 'Please recharge to unlock Zoom'}
                                >
                                  <Lock className="w-3 h-3 text-gray-400" />
                                  <span>{isRTL ? 'مقفول' : 'Locked'}</span>
                                </span>
                              ) : (
                                <a
                                  href={cls.zoomUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 rounded-lg bg-[#29235D] text-[#D3B673] hover:bg-[#1D1845] text-[10px] font-bold flex items-center gap-1 transition-all"
                                >
                                  <Video className="w-3 h-3" />
                                  <span>Zoom</span>
                                </a>
                              )}

                              {/* Attendance toggle (for teacher / admin) */}
                              {!isStudent && student && (
                                <button
                                  onClick={() => handleToggleAttendance(cls, student.id)}
                                  className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 border border-emerald-200 transition-all cursor-pointer"
                                  title={isRTL ? 'تسجيل الحضور وخصم حصة' : 'Mark Attendance & Deduct 1 Session'}
                                >
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>{isRTL ? 'حضور' : 'Attend'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. DAY-BY-DAY AGENDA VIEW */}
      {viewMode === 'DAY' && (
        <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs space-y-6">
          
          {/* Day Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold">
            {WEEK_DAYS.map(d => (
              <button
                key={d.key}
                onClick={() => setSelectedDayKey(d.key)}
                className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all whitespace-nowrap ${
                  selectedDayKey === d.key
                    ? 'bg-[#29235D] text-[#D3B673] shadow-md'
                    : 'bg-[#F8F6F0] text-[#786F9A] hover:text-[#29235D]'
                }`}
              >
                <span>{isRTL ? d.labelAr : d.labelEn}</span>
                <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
                  {filteredClasses.filter(c => {
                    try {
                      return new Date(c.date).getDay() === d.dayIndex;
                    } catch {
                      return false;
                    }
                  }).length}
                </span>
              </button>
            ))}
          </div>

          {/* Selected Day Agenda Cards */}
          <div className="space-y-3">
            {filteredClasses
              .filter(c => {
                const targetDayObj = WEEK_DAYS.find(d => d.key === selectedDayKey);
                try {
                  return new Date(c.date).getDay() === targetDayObj?.dayIndex;
                } catch {
                  return false;
                }
              })
              .map(cls => {
                const teacher = teachers.find(t => t.id === cls.teacherId);
                const program = programs.find(p => p.id === cls.programId);
                const student = students.find(s => cls.studentIds.includes(s.id));
                const quota = student ? getStudentQuota(student.id) : null;
                const isDepleted = quota ? quota.remainingSessions <= 0 || quota.isExpired : false;

                return (
                  <div
                    key={cls.id}
                    className={`p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      isDepleted
                        ? 'bg-rose-50/70 border-rose-300'
                        : 'bg-[#FBF9F4] border-gray-200'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isDepleted ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-200 text-rose-900 border border-rose-300 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-rose-700" />
                            {isRTL ? 'الحصة غير مفعّلة - رصيد الطالب منتهي (0)' : 'Inactive - Depleted Quota (0)'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            {quota ? `متبقي ${quota.remainingSessions} حصص` : 'نشطة'}
                          </span>
                        )}

                        <span className="text-xs font-mono font-bold text-gray-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#D3B673]" />
                          {cls.startTime} - {cls.endTime}
                        </span>

                        {program && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#29235D] border border-gray-200">
                            {isRTL ? program.nameArabic || program.name : program.name}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[#29235D] font-serif">
                        {isRTL ? cls.titleArabic || cls.title : cls.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-gray-600 pt-1 flex-wrap">
                        {student && (
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-[#D3B673]" />
                            <strong>{isRTL ? 'الطالب:' : 'Student:'}</strong> {isRTL ? student.nameArabic || student.name : student.name}
                          </span>
                        )}
                        {teacher && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-[#D3B673]" />
                            <strong>{isRTL ? 'المعلم:' : 'Teacher:'}</strong> {isRTL ? teacher.nameArabic || teacher.name : teacher.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      {canRecharge && student && (
                        <button
                          onClick={(e) => handleOpenRecharge(student.id, e)}
                          className="px-3.5 py-2 rounded-xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{isRTL ? 'شحن رصيد الطالب ⚡' : 'Recharge Quota'}</span>
                        </button>
                      )}

                      <a
                        href={cls.zoomUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                          isDepleted && isStudent
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                            : 'bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673]'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>{t('joinZoomClass')}</span>
                      </a>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 6. DETAILED LIST VIEW */}
      {viewMode === 'LIST' && (
        <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#29235D] font-serif">
              {isRTL ? 'جميع الحصص المجدولة وجدول الطلاب' : 'All Scheduled Classes & Quota Logs'}
            </h3>
            <span className="text-xs text-gray-500 font-semibold">
              {filteredClasses.length} {isRTL ? 'حصة' : 'Sessions'}
            </span>
          </div>

          <div className="space-y-3">
            {filteredClasses.map(cls => {
              const teacher = teachers.find(t => t.id === cls.teacherId);
              const program = programs.find(p => p.id === cls.programId);
              const student = students.find(s => cls.studentIds.includes(s.id));
              const quota = student ? getStudentQuota(student.id) : null;
              const isDepleted = quota ? quota.remainingSessions <= 0 || quota.isExpired : false;

              return (
                <div
                  key={cls.id}
                  className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    isDepleted ? 'bg-rose-50/60 border-rose-200' : 'bg-[#FBF9F4] border-gray-100 hover:border-[#D3B673]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-gray-500 flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-[#D3B673]" />
                        {cls.date} ({cls.startTime} - {cls.endTime})
                      </span>

                      {isDepleted ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                          {isRTL ? '⚠️ رصيد الطالب 0 - غير مفعّلة' : '⚠️ 0 Balance - Inactive'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {quota ? `متبقي ${quota.remainingSessions} حصص` : 'مفعّلة'}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-[#29235D] font-serif">
                      {isRTL ? cls.titleArabic || cls.title : cls.title}
                    </h4>

                    <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                      {student && (
                        <span>
                          <strong>{isRTL ? 'الطالب:' : 'Student:'}</strong> {isRTL ? student.nameArabic || student.name : student.name}
                        </span>
                      )}
                      {teacher && (
                        <span>
                          <strong>{isRTL ? 'المعلم:' : 'Teacher:'}</strong> {isRTL ? teacher.nameArabic || teacher.name : teacher.name}
                        </span>
                      )}
                      {program && (
                        <span className="text-gray-400">
                          ({isRTL ? program.nameArabic || program.name : program.name})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {canRecharge && student && (
                      <button
                        onClick={(e) => handleOpenRecharge(student.id, e)}
                        className="px-3 py-2 rounded-xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'شحن ⚡' : 'Recharge'}</span>
                      </button>
                    )}

                    <a
                      href={cls.zoomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] font-bold text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{t('joinZoomClass')}</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SCHEDULE NEW CLASS MODAL                                         */}
      {/* ========================================================================= */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-4 border border-[#29235D]/20 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#D3B673]" />
                <h3 className="text-base font-bold text-[#29235D] font-serif">
                  {isRTL ? 'إضافة وجدولة حصة في تقويم المنصة' : 'Schedule Class in Master Timetable'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddClassModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5 text-xs">
              
              {/* Student Selector with Real-Time Quota Display */}
              <div>
                <label className="block font-bold text-[#29235D] mb-1">
                  {isRTL ? 'اختر المتدرب / الطالب *' : 'Select Student *'}
                </label>
                <select
                  required
                  value={newStudentId}
                  onChange={e => setNewStudentId(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-bold text-[#29235D]"
                >
                  {students.map(s => {
                    const quota = getStudentQuota(s.id);
                    return (
                      <option key={s.id} value={s.id}>
                        {isRTL ? s.nameArabic || s.name : s.name} — [رصيد الحصص المتبقية: {quota.remainingSessions} {quota.remainingSessions > 0 ? '✅' : '⚠️ منتهي'}]
                      </option>
                    );
                  })}
                </select>

                {/* Quota Check Alert Badge under selection */}
                {(() => {
                  const selQuota = getStudentQuota(newStudentId);
                  if (selQuota.remainingSessions <= 0) {
                    return (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between">
                        <span className="text-[11px] font-semibold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          {isRTL ? 'تنبيه: رصيد هذا الطالب 0 حصص. ستبقى الحصة غير مفعّلة حتى يتم الشحن.' : 'Warning: Student balance is 0. Class will be inactive until recharged.'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenRecharge(newStudentId)}
                          className="px-2.5 py-1 rounded-lg bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold text-[10px] cursor-pointer"
                        >
                          {isRTL ? 'شحن رصيده الآن ⚡' : 'Recharge Now ⚡'}
                        </button>
                      </div>
                    );
                  }
                  return (
                    <p className="text-[11px] text-emerald-600 font-bold mt-1">
                      {isRTL ? `✅ رصيد الطالب متاح (${selQuota.remainingSessions} حصص متبقية في الباقة)` : `✅ Active quota: ${selQuota.remainingSessions} sessions remaining`}
                    </p>
                  );
                })()}
              </div>

              {/* Title Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'عنوان الحصة (عربي)' : 'Class Title (Arabic)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitleAr}
                    onChange={e => setNewTitleAr(e.target.value)}
                    placeholder="مثال: حلقة إتقان التجويد - الدرس 3"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-arabic font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'عنوان الحصة (إنجليزي)' : 'Class Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Quran Tajweed Circle Session 3"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              {/* Teacher & Program Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'المعلم المسند *' : 'Assigned Teacher *'}
                  </label>
                  <select
                    disabled={isTeacher}
                    value={newTeacherId}
                    onChange={e => setNewTeacherId(e.target.value)}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-semibold"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {isRTL ? t.nameArabic || t.name : t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'البرنامج التعليمي' : 'Educational Program'}
                  </label>
                  <select
                    value={newProgramId}
                    onChange={e => setNewProgramId(e.target.value)}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-semibold"
                  >
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>
                        {isRTL ? p.nameArabic || p.name : p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Time Selectors */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'تاريخ الحصة' : 'Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full p-2 bg-[#FBF9F4] border border-gray-200 rounded-xl font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'وقت البدء' : 'Start Time'}
                  </label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={e => setNewStartTime(e.target.value)}
                    className="w-full p-2 bg-[#FBF9F4] border border-gray-200 rounded-xl font-mono text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'وقت الانتهاء' : 'End Time'}
                  </label>
                  <input
                    type="time"
                    required
                    value={newEndTime}
                    onChange={e => setNewEndTime(e.target.value)}
                    className="w-full p-2 bg-[#FBF9F4] border border-gray-200 rounded-xl font-mono text-xs font-bold"
                  />
                </div>
              </div>

              {/* Zoom Meeting Link */}
              <div>
                <label className="block font-bold text-[#29235D] mb-1">
                  {isRTL ? 'رابط الزووم (Zoom Meeting URL)' : 'Zoom Meeting Link'}
                </label>
                <input
                  type="url"
                  required
                  value={newZoomUrl}
                  onChange={e => setNewZoomUrl(e.target.value)}
                  placeholder="https://zoom.us/j/9876543210"
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-mono text-xs"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold cursor-pointer"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isRTL ? 'تأكيد وحفظ في الجدول' : 'Save to Schedule'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RECHARGE STUDENT LESSON QUOTA MODAL                              */}
      {/* ========================================================================= */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 border border-[#29235D]/20 shadow-2xl animate-in fade-in">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#D3B673]/20 flex items-center justify-center text-[#29235D]">
                  <Zap className="w-5 h-5 text-[#D3B673]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#29235D] font-serif">
                    {isRTL ? 'شحن وتجديد رصيد حصص الطالب ⚡' : 'Recharge Student Lesson Quota ⚡'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {isRTL ? 'إضافة حصص جديدة وتفعيل السيستم تلقائياً' : 'Add session credits & automatically unlock system'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRechargeModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmRecharge} className="space-y-4 text-xs">
              
              {/* Select Student */}
              <div>
                <label className="block font-bold text-[#29235D] mb-1">
                  {isRTL ? 'المتدرب / الطالب المراد شحن حسابه' : 'Select Student to Recharge'}
                </label>
                <select
                  value={rechargeTargetStudentId}
                  onChange={e => setRechargeTargetStudentId(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-bold text-[#29235D]"
                >
                  {students.map(s => {
                    const quota = getStudentQuota(s.id);
                    return (
                      <option key={s.id} value={s.id}>
                        {isRTL ? s.nameArabic || s.name : s.name} ({s.code}) — [الرصيد الحالي: {quota.remainingSessions} حصص]
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Number of sessions to recharge with quick buttons */}
              <div>
                <label className="block font-bold text-[#29235D] mb-1">
                  {isRTL ? 'عدد الحصص المراد إضافتها للرصيد *' : 'Number of Lessons to Add *'}
                </label>
                <div className="flex items-center gap-2 mb-2">
                  {[3, 5, 8, 10, 20].map(cnt => (
                    <button
                      type="button"
                      key={cnt}
                      onClick={() => setRechargeSessionsCount(cnt)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                        rechargeSessionsCount === cnt
                          ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                          : 'bg-[#F8F6F0] text-gray-700 hover:bg-[#F1ECE1]'
                      }`}
                    >
                      +{cnt} {isRTL ? 'حصص' : 'lessons'}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={rechargeSessionsCount}
                  onChange={e => setRechargeSessionsCount(Math.max(1, Number(e.target.value)))}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-mono text-sm font-bold text-[#29235D]"
                />
              </div>

              {/* Validity Days */}
              <div>
                <label className="block font-bold text-[#29235D] mb-1">
                  {isRTL ? 'فترة الصلاحية الإضافية (بالأيام)' : 'Additional Validity (Days)'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={rechargeDaysCount}
                  onChange={e => setRechargeDaysCount(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-mono text-xs"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-[#29235D] mb-1">
                  {isRTL ? 'ملاحظات الشحن أو رقم الإيصال (اختياري)' : 'Recharge Notes / Receipt (Optional)'}
                </label>
                <input
                  type="text"
                  value={rechargeNotes}
                  onChange={e => setRechargeNotes(e.target.value)}
                  placeholder={isRTL ? 'مثال: تم التحويل بنكياً / فودافون كاش' : 'e.g. Bank transfer / Visa'}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRechargeModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold cursor-pointer"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>{isRTL ? 'تأكيد الشحن وتفعيل السيستم ⚡' : 'Confirm Recharge ⚡'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
