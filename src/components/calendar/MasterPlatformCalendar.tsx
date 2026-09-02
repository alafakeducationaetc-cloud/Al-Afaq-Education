import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { ClassSession, WeekDay, StudentProfile, TeacherProfile, SubscriptionStatus, ClassSessionStatus } from '../../types';
import { ColorKeysGuide } from '../common/ColorKeysGuide';
import { COLOR_KEYS_CONFIG, COLOR_KEYS_ORDER, getClassStatusConfig } from '../../lib/colorKeys';
import { ClassActionModal } from '../classroom/ClassActionModal';
import { ClassChatModal } from '../chat/ClassChatModal';
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
  Repeat,
  Timer,
  RotateCw,
  CalendarRange,
  Info,
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

const DURATION_PRESETS = [
  { minutes: 30, labelAr: 'نصف ساعة (30 د)', labelEn: '30 min', shortAr: '½ ساعة' },
  { minutes: 45, labelAr: '45 دقيقة', labelEn: '45 min', shortAr: '45 د' },
  { minutes: 60, labelAr: 'ساعة كاملة (60 د)', labelEn: '1 hour', shortAr: '1 ساعة' },
  { minutes: 90, labelAr: 'ساعة ونصف (90 د)', labelEn: '1.5 hrs', shortAr: '1½ ساعة' },
  { minutes: 120, labelAr: 'ساعتان (120 د)', labelEn: '2 hours', shortAr: '2 ساعة' },
  { minutes: 150, labelAr: 'ساعتان ونصف', labelEn: '2.5 hrs', shortAr: '2½ ساعة' },
  { minutes: 180, labelAr: '3 ساعات', labelEn: '3 hours', shortAr: '3 ساعات' },
  { minutes: 240, labelAr: '4 ساعات', labelEn: '4 hours', shortAr: '4 ساعات' },
];

const RECURRENCE_COUNT_PRESETS = [
  { count: 2, labelAr: 'أسبوعان (حصتان)', labelEn: '2 Weeks (2 Classes)' },
  { count: 4, labelAr: 'شهر كامل (4 أسابيع / 4 حصص)', labelEn: '1 Month (4 Weeks)' },
  { count: 8, labelAr: 'شهران (8 أسابيع / 8 حصص)', labelEn: '2 Months (8 Weeks)' },
  { count: 12, labelAr: '3 أشهر (12 أسبوعاً / 12 حصة)', labelEn: '3 Months (12 Weeks)' },
  { count: 16, labelAr: 'فصل دراسي (16 أسبوعاً / 16 حصة)', labelEn: 'Semester (16 Weeks)' },
  { count: 24, labelAr: 'نصف سنة (24 أسبوعاً / 24 حصة)', labelEn: 'Half-Year (24 Weeks)' },
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
    addClassSessionsBatch,
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
  // Teacher cannot add classes; scheduling classes is strictly reserved for Admin/Super Admin only
  const canSchedule = isAdmin;
  const canRecharge = isAdmin || isTeacher;

  // Available instructors list: includes teachers and Admin himself for self-teaching (dual role)
  const availableInstructors = useMemo(() => {
    const list: { id: string; name: string; nameArabic?: string; isSelfAdmin?: boolean }[] = teachers.map(t => ({
      id: t.id,
      name: t.name,
      nameArabic: t.nameArabic || t.name,
      isSelfAdmin: false,
    }));

    if (currentUser && (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN')) {
      const alreadyIn = list.some(i => i.id === currentUser.id);
      if (!alreadyIn) {
        list.unshift({
          id: currentUser.id,
          name: `${currentUser.name} (General Supervisor / Self-Teaching)`,
          nameArabic: `${currentUser.nameArabic || currentUser.name} (المشرف العام - تدريس مباشر)`,
          isSelfAdmin: true,
        });
      }
    }
    return list;
  }, [teachers, currentUser]);

  // Views & Filters State
  const [viewMode, setViewMode] = useState<'WEEK' | 'MONTH' | 'DAY' | 'LIST'>(defaultView);
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedDayKey, setSelectedDayKey] = useState<WeekDay>('SATURDAY');
  const [filterTeacherId, setFilterTeacherId] = useState<string>('ALL');
  const [filterStudentId, setFilterStudentId] = useState<string>('ALL');
  const [filterProgramId, setFilterProgramId] = useState<string>('ALL');
  const [filterQuotaStatus, setFilterQuotaStatus] = useState<'ALL' | 'ACTIVE' | 'DEPLETED'>('ALL');
  const [filterStatusKey, setFilterStatusKey] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Month Calendar View State
  const [calendarMonth, setCalendarMonth] = useState<number>(() => new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState<number>(() => new Date().getFullYear());

  // Modals State
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeTargetStudentId, setRechargeTargetStudentId] = useState<string>('');
  const [rechargeSessionsCount, setRechargeSessionsCount] = useState<number>(5);
  const [rechargeDaysCount, setRechargeDaysCount] = useState<number>(30);
  const [rechargeNotes, setRechargeNotes] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedActionSession, setSelectedActionSession] = useState<ClassSession | null>(null);
  const [activeChatConfig, setActiveChatConfig] = useState<{ targetId: string; isGroup: boolean } | null>(null);

  // New Class Form State (1-to-1 vs Group Support)
  const [newStudyMode, setNewStudyMode] = useState<'PRIVATE' | 'GROUP'>('PRIVATE');
  const [newTitle, setNewTitle] = useState('');
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newProgramId, setNewProgramId] = useState(programs[0]?.id || '');
  const [newTeacherId, setNewTeacherId] = useState(
    isTeacher ? currentUser.id : availableInstructors[0]?.id || teachers[0]?.id || ''
  );
  const [newStudentId, setNewStudentId] = useState(students[0]?.id || '');
  const [newGroupStudentIds, setNewGroupStudentIds] = useState<string[]>(students.length > 0 ? [students[0].id] : []);
  const [studentSearchInModal, setStudentSearchInModal] = useState<string>('');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('17:00');
  const [newEndTime, setNewEndTime] = useState('18:00');
  const [newDurationMinutes, setNewDurationMinutes] = useState<number>(60);
  const [newZoomUrl, setNewZoomUrl] = useState(settings.defaultZoomLink || 'https://zoom.us/j/9876543210');
  const [newTopic, setNewTopic] = useState('');

  // Recurrence / Repetition State
  const [recurrenceMode, setRecurrenceMode] = useState<'ONCE' | 'WEEKS' | 'INFINITE'>('ONCE');
  const [recurrenceWeeksCount, setRecurrenceWeeksCount] = useState<number>(4);
  const [recurrenceSelectedDays, setRecurrenceSelectedDays] = useState<WeekDay[]>([]);
  const [showRecurrencePreview, setShowRecurrencePreview] = useState<boolean>(false);

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

      // Status key filter (Color Keys)
      if (filterStatusKey !== 'ALL' && cls.status !== filterStatusKey) {
        return false;
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
  }, [scopedClasses, filterTeacherId, filterStudentId, filterProgramId, filterQuotaStatus, filterStatusKey, searchQuery, teachers, getStudentQuota]);

  // Compute status counts for ColorKeysGuide
  const statusCounts = useMemo(() => {
    const counts: Partial<Record<ClassSessionStatus, number>> = {};
    scopedClasses.forEach(cls => {
      const st = cls.status as ClassSessionStatus;
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }, [scopedClasses]);

  // Handle Quick Status Change for a class session
  const handleQuickStatusChange = (classId: string, newStatus: ClassSessionStatus) => {
    updateClassSession(classId, { status: newStatus });
    
    // Automatically record attendance when marked completed or absent
    const targetClass = classes.find(c => c.id === classId);
    if (targetClass && targetClass.studentIds.length > 0) {
      const primaryStudentId = targetClass.studentIds[0];
      if (newStatus === 'COMPLETED') {
        markAttendance({
          sessionId: targetClass.id,
          programId: targetClass.programId,
          studentId: primaryStudentId,
          teacherId: targetClass.teacherId,
          date: targetClass.date,
          status: 'PRESENT',
          notes: `تم الحضور وإتمام الدرس بنجاح (${targetClass.title})`,
        });
        showToast(isRTL ? '✅ تم تحديث حالة الحصة إلى مكتملة وتسجيل حضور الطالب بنجاح' : '✅ Marked as Completed & Attendance recorded');
      } else if (newStatus === 'ABSENT') {
        markAttendance({
          sessionId: targetClass.id,
          programId: targetClass.programId,
          studentId: primaryStudentId,
          teacherId: targetClass.teacherId,
          date: targetClass.date,
          status: 'ABSENT',
          notes: `غياب بدون عذر (${targetClass.title})`,
        });
        showToast(isRTL ? '⚠️ تم تسجيل غياب الطالب وخصم الحصة من الرصيد' : '⚠️ Student marked Absent; quota deducted');
      } else {
        const config = getClassStatusConfig(newStatus);
        showToast(isRTL ? `تم تغيير حالة الحصة إلى: ${config.labelAr}` : `Status updated to: ${config.labelEn}`);
      }
    }
  };

  // Calculate current student's quota if student role
  const currentStudentQuota = isStudent ? getStudentQuota(currentUser.id) : null;

  // Time & Duration Calculation Helpers
  const calculateEndTimeFromDuration = (startTime: string, minutes: number): string => {
    const [hStr, mStr] = (startTime || '17:00').split(':');
    let h = parseInt(hStr, 10) || 0;
    let m = parseInt(mStr, 10) || 0;
    let total = h * 60 + m + minutes;
    total = total % (24 * 60);
    const newH = Math.floor(total / 60);
    const newM = total % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  };

  const handleStartTimeChange = (newStart: string) => {
    setNewStartTime(newStart);
    setNewEndTime(calculateEndTimeFromDuration(newStart, newDurationMinutes));
  };

  const handleDurationSelect = (mins: number) => {
    setNewDurationMinutes(mins);
    setNewEndTime(calculateEndTimeFromDuration(newStartTime, mins));
  };

  const handleEndTimeChange = (newEnd: string) => {
    setNewEndTime(newEnd);
    const [h1, m1] = (newStartTime || '17:00').split(':').map(Number);
    const [h2, m2] = (newEnd || '18:00').split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff <= 0) diff += 24 * 60;
    setNewDurationMinutes(diff);
  };

  const getDayKeyFromDate = (dateStr: string): WeekDay => {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      const idx = d.getDay(); // 0 Sun, 1 Mon, 2 Tue, 3 Wed, 4 Thu, 5 Fri, 6 Sat
      const found = WEEK_DAYS.find(w => w.dayIndex === idx);
      return found ? found.key : 'SATURDAY';
    } catch {
      return 'SATURDAY';
    }
  };

  // Generate Recurring Dates based on Recurrence Mode and Weekdays
  const generatedRecurringDates = useMemo(() => {
    if (recurrenceMode === 'ONCE') {
      return [newDate];
    }

    const weeksToGenerate = recurrenceMode === 'INFINITE' ? 52 : (recurrenceWeeksCount || 1);
    const primaryDay = getDayKeyFromDate(newDate);
    const targetDays = recurrenceSelectedDays.length > 0 ? recurrenceSelectedDays : [primaryDay];

    const resultDates: string[] = [];
    const baseDate = new Date(newDate + 'T00:00:00');
    const baseDayIdx = baseDate.getDay();

    for (let w = 0; w < weeksToGenerate; w++) {
      targetDays.forEach(dayKey => {
        const dayObj = WEEK_DAYS.find(d => d.key === dayKey);
        if (dayObj) {
          const dayOffset = (dayObj.dayIndex - baseDayIdx + 7) % 7;
          const curr = new Date(baseDate);
          curr.setDate(baseDate.getDate() + (w * 7) + dayOffset);
          const dStr = curr.toISOString().split('T')[0];
          if (!resultDates.includes(dStr)) {
            resultDates.push(dStr);
          }
        }
      });
    }

    resultDates.sort();
    return resultDates;
  }, [newDate, recurrenceMode, recurrenceWeeksCount, recurrenceSelectedDays]);

  // Open Add Class Modal for a specific calendar date (from Month or Day View)
  const handleOpenAddForDate = (targetDateStr: string) => {
    if (!canSchedule) {
      alert(isRTL ? 'صلاحية جدولة الحصص مقيدة لحسابك' : 'Class scheduling is restricted for your role');
      return;
    }
    setNewDate(targetDateStr);
    const dayKey = getDayKeyFromDate(targetDateStr);
    setRecurrenceSelectedDays([dayKey]);
    setRecurrenceMode('ONCE');
    setRecurrenceWeeksCount(4);
    setNewDurationMinutes(60);
    setNewEndTime(calculateEndTimeFromDuration(newStartTime, 60));

    if (isTeacher) {
      setNewTeacherId(currentUser.id);
    }
    setNewTitle(isRTL ? `حصة دراسية (${targetDateStr})` : `Class Session (${targetDateStr})`);
    setNewTitleAr(isRTL ? `حصة دراسية (${targetDateStr})` : `Class Session (${targetDateStr})`);
    setNewStudyMode('PRIVATE');
    if (students.length > 0 && !newStudentId) {
      setNewStudentId(students[0].id);
      setNewGroupStudentIds([students[0].id]);
    }
    setShowAddClassModal(true);
  };

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

    setRecurrenceSelectedDays([dayKey]);
    setRecurrenceMode('ONCE');
    setRecurrenceWeeksCount(4);
    setNewDurationMinutes(60);
    setNewEndTime(calculateEndTimeFromDuration(newStartTime, 60));

    if (isTeacher) {
      setNewTeacherId(currentUser.id);
    }

    const dayName = WEEK_DAYS.find(d => d.key === dayKey);
    setNewTitle(isRTL ? `حصة ${dayName?.labelAr || ''}` : `${dayName?.labelEn || ''} Session`);
    setNewTitleAr(isRTL ? `حصة ${dayName?.labelAr || ''}` : `${dayName?.labelEn || ''} Session`);
    setNewStudyMode('PRIVATE');
    setShowAddClassModal(true);
  };

  // Handle Schedule Submit (Single or Multi-Week Recurring, 1-on-1 vs Group)
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert(isRTL ? 'يرجى كتابة عنوان للحصة' : 'Please enter class title');
      return;
    }

    const targetStudentIds = newStudyMode === 'PRIVATE' 
      ? (newStudentId ? [newStudentId] : []) 
      : newGroupStudentIds;

    if (targetStudentIds.length === 0) {
      alert(isRTL ? 'يرجى اختيار طالب واحد على الأقل للحصة' : 'Please select at least one student');
      return;
    }

    // Check if any selected student has depleted quota
    const hasDepletedStudent = targetStudentIds.some(sId => {
      const q = getStudentQuota(sId);
      return q.remainingSessions <= 0 || q.isExpired;
    });

    const datesToSchedule = generatedRecurringDates.length > 0 ? generatedRecurringDates : [newDate];

    if (datesToSchedule.length === 1) {
      addClassSession({
        programId: newProgramId || programs[0]?.id || 'prg-01',
        teacherId: newTeacherId || teachers[0]?.id || 'tea-01',
        studentIds: targetStudentIds,
        studyMode: newStudyMode,
        title: newTitle.trim(),
        titleArabic: newTitleAr.trim() || newTitle.trim(),
        topic: newTopic.trim() || undefined,
        date: datesToSchedule[0],
        startTime: newStartTime,
        endTime: newEndTime,
        zoomUrl: newZoomUrl || settings.defaultZoomLink || 'https://zoom.us/j/9876543210',
        zoomMeetingId: '987 654 3210',
        zoomPassword: 'ALTEQ2026',
        status: 'SCHEDULED',
        isLockedDueToQuota: hasDepletedStudent,
      });
    } else {
      const batchList = datesToSchedule.map((d, index) => ({
        programId: newProgramId || programs[0]?.id || 'prg-01',
        teacherId: newTeacherId || teachers[0]?.id || 'tea-01',
        studentIds: targetStudentIds,
        studyMode: newStudyMode,
        title: newTitle.trim(),
        titleArabic: newTitleAr.trim() || newTitle.trim(),
        topic: newTopic.trim() ? `${newTopic.trim()} (جلسة ${index + 1})` : undefined,
        date: d,
        startTime: newStartTime,
        endTime: newEndTime,
        zoomUrl: newZoomUrl || settings.defaultZoomLink || 'https://zoom.us/j/9876543210',
        zoomMeetingId: '987 654 3210',
        zoomPassword: 'ALTEQ2026',
        status: 'SCHEDULED' as ClassSessionStatus,
        isLockedDueToQuota: hasDepletedStudent,
      }));

      addClassSessionsBatch(batchList);
    }

    setShowAddClassModal(false);
    setNewTitle('');
    setNewTitleAr('');
    setNewTopic('');

    const dayName = WEEK_DAYS.find(w => w.key === getDayKeyFromDate(newDate));

    if (datesToSchedule.length > 1) {
      showToast(
        isRTL
          ? `🔄 تم بنجاح تكرار وجدولة ${datesToSchedule.length} حصة في التقويم (كل ${dayName?.labelAr || ''} حتى ${datesToSchedule[datesToSchedule.length - 1]})`
          : `🔄 Successfully scheduled ${datesToSchedule.length} recurring classes (${dayName?.labelEn} until ${datesToSchedule[datesToSchedule.length - 1]})`
      );
    } else if (hasDepletedStudent) {
      showToast(
        isRTL
          ? `⚠️ تمت إضافة الحصة، ولكن يوجد طالب رصيده 0 حصص. ستبقى الحصة مقفلة حتى الشحن.`
          : `⚠️ Class added, but one or more students have 0 remaining quota.`
      );
    } else {
      showToast(
        isRTL
          ? `✅ تمت جدولة الحصة بنجاح! (${newStudyMode === 'GROUP' ? `حلقة جماعية: ${targetStudentIds.length} طلاب` : 'حصة فردية خاصة'})`
          : `✅ Class scheduled successfully! (${newStudyMode === 'GROUP' ? `Group circle: ${targetStudentIds.length} students` : '1-on-1 private'})`
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

  const MONTH_NAMES = [
    { index: 0, ar: 'يناير', en: 'January' },
    { index: 1, ar: 'فبراير', en: 'February' },
    { index: 2, ar: 'مارس', en: 'March' },
    { index: 3, ar: 'أبريل', en: 'April' },
    { index: 4, ar: 'مايو', en: 'May' },
    { index: 5, ar: 'يونيو', en: 'June' },
    { index: 6, ar: 'يوليو', en: 'July' },
    { index: 7, ar: 'أغسطس', en: 'August' },
    { index: 8, ar: 'سبتمبر', en: 'September' },
    { index: 9, ar: 'أكتوبر', en: 'October' },
    { index: 10, ar: 'نوفمبر', en: 'November' },
    { index: 11, ar: 'ديسمبر', en: 'December' },
  ];

  // Compute Standard Month Calendar Grid Data (Saturday-first)
  const monthGridData = useMemo(() => {
    const firstDayObj = new Date(calendarYear, calendarMonth, 1);
    const firstDayOfWeek = firstDayObj.getDay(); // 0: Sun, 1: Mon, ..., 6: Sat
    // Saturday-first offset (Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6)
    const startOffset = (firstDayOfWeek + 1) % 7;

    const totalDaysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(calendarYear, calendarMonth, 0).getDate();

    const cells: {
      dayNumber: number;
      isCurrentMonth: boolean;
      dateStr: string;
      isToday: boolean;
      classes: ClassSession[];
    }[] = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Leading days from previous month
    for (let i = startOffset - 1; i >= 0; i--) {
      const dayNum = prevMonthTotalDays - i;
      const prevDate = new Date(calendarYear, calendarMonth - 1, dayNum);
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      const d = String(dayNum).padStart(2, '0');
      const dateStr = `${prevDate.getFullYear()}-${m}-${d}`;
      const dayClasses = filteredClasses.filter(c => c.date === dateStr);
      cells.push({
        dayNumber: dayNum,
        isCurrentMonth: false,
        dateStr,
        isToday: dateStr === todayStr,
        classes: dayClasses,
      });
    }

    // Days in current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const mStr = String(calendarMonth + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${calendarYear}-${mStr}-${dStr}`;
      const dayClasses = filteredClasses.filter(c => c.date === dateStr);
      cells.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateStr,
        isToday: dateStr === todayStr,
        classes: dayClasses,
      });
    }

    // Trailing days from next month to complete the grid
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(calendarYear, calendarMonth + 1, i);
      const m = String(nextDate.getMonth() + 1).padStart(2, '0');
      const d = String(i).padStart(2, '0');
      const dateStr = `${nextDate.getFullYear()}-${m}-${d}`;
      const dayClasses = filteredClasses.filter(c => c.date === dateStr);
      cells.push({
        dayNumber: i,
        isCurrentMonth: false,
        dateStr,
        isToday: dateStr === todayStr,
        classes: dayClasses,
      });
    }

    return cells;
  }, [calendarYear, calendarMonth, filteredClasses]);

  const currentMonthClassesCount = useMemo(() => {
    const mStr = String(calendarMonth + 1).padStart(2, '0');
    const prefix = `${calendarYear}-${mStr}`;
    return filteredClasses.filter(c => c.date.startsWith(prefix)).length;
  }, [calendarYear, calendarMonth, filteredClasses]);

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCalendarMonth(now.getMonth());
    setCalendarYear(now.getFullYear());
  };

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

      {/* 3. Standardized Color Keys Strip & Interactive Guide (Color Keys Bar) */}
      <ColorKeysGuide
        selectedStatus={filterStatusKey}
        onSelectStatus={setFilterStatusKey}
        showDetailsToggle={true}
        statusCounts={statusCounts}
        userRole={currentUser?.role as any}
      />

      {/* 4. Controls & Filter Bar */}
      <div className="bg-white night:bg-[#18152E] rounded-3xl p-4 sm:p-5 border border-[#29235D]/10 night:border-[#393168] shadow-xs space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F8F6F0] rounded-2xl border border-gray-200 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                viewMode === 'MONTH'
                  ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                  : 'text-[#786F9A] hover:text-[#29235D]'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>{isRTL ? 'التقويم الشهري الكامل (شهر/سنة)' : 'Month / Year Calendar'}</span>
            </button>

            <button
              onClick={() => setViewMode('WEEK')}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all ${
                viewMode === 'WEEK'
                  ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                  : 'text-[#786F9A] hover:text-[#29235D]'
              }`}
            >
              <Layers className="w-4 h-4" />
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
            
            {/* Filter by Teacher / Admin (Admin only) */}
            {isAdmin && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1">
                  {isRTL ? 'فلترة حسب المعلم / المشرف' : 'Filter by Instructor'}
                </label>
                <select
                  value={filterTeacherId}
                  onChange={e => setFilterTeacherId(e.target.value)}
                  className="w-full p-2 bg-[#FBF9F4] border border-gray-200 rounded-xl font-medium text-[#29235D]"
                >
                  <option value="ALL">{isRTL ? 'جميع المعلمين والمشرف' : 'All Instructors'}</option>
                  {availableInstructors.map(inst => (
                    <option key={inst.id} value={inst.id}>
                      {isRTL ? inst.nameArabic || inst.name : inst.name}
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

      {/* 4. MAIN VIEW: STANDARD MONTH / YEAR CALENDAR (تقويم شهري وسنوي قياسي) */}
      {viewMode === 'MONTH' && (
        <div className="bg-white night:bg-[#18152E] rounded-3xl p-4 sm:p-6 border border-[#29235D]/10 night:border-[#393168] shadow-xs space-y-4">
          
          {/* Month / Year Navigation & Quick Jump Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 night:border-gray-800">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Previous Month */}
              <button
                onClick={handlePrevMonth}
                className="p-2.5 rounded-2xl bg-[#F8F6F0] night:bg-[#231E44] hover:bg-[#29235D] text-[#29235D] night:text-white hover:text-[#D3B673] transition-all cursor-pointer border border-gray-200 night:border-gray-700"
                title={isRTL ? 'الشهر السابق' : 'Previous Month'}
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              {/* Month Select */}
              <select
                value={calendarMonth}
                onChange={e => setCalendarMonth(Number(e.target.value))}
                className="px-3.5 py-2 rounded-2xl bg-[#F8F6F0] night:bg-[#231E44] border border-gray-200 night:border-gray-700 text-sm font-bold text-[#29235D] night:text-white focus:ring-2 focus:ring-[#D3B673]"
              >
                {MONTH_NAMES.map(m => (
                  <option key={m.index} value={m.index}>
                    {isRTL ? m.ar : m.en}
                  </option>
                ))}
              </select>

              {/* Year Select */}
              <select
                value={calendarYear}
                onChange={e => setCalendarYear(Number(e.target.value))}
                className="px-3.5 py-2 rounded-2xl bg-[#F8F6F0] night:bg-[#231E44] border border-gray-200 night:border-gray-700 text-sm font-bold text-[#29235D] night:text-white font-mono focus:ring-2 focus:ring-[#D3B673]"
              >
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              {/* Next Month */}
              <button
                onClick={handleNextMonth}
                className="p-2.5 rounded-2xl bg-[#F8F6F0] night:bg-[#231E44] hover:bg-[#29235D] text-[#29235D] night:text-white hover:text-[#D3B673] transition-all cursor-pointer border border-gray-200 night:border-gray-700"
                title={isRTL ? 'الشهر التالي' : 'Next Month'}
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              </button>

              {/* Today Quick Jump */}
              <button
                onClick={handleJumpToToday}
                className="px-3 py-2 rounded-2xl bg-white night:bg-[#29235D]/50 border border-[#D3B673] text-[#29235D] night:text-[#E8D5A3] hover:bg-[#D3B673]/15 text-xs font-bold transition-all cursor-pointer"
              >
                {isRTL ? 'اليوم' : 'Today'}
              </button>
            </div>

            {/* Month Stats Summary & Add Class on this Month */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 night:text-gray-400">
                {isRTL
                  ? `إجمالي الحصص بهذا الشهر: (${currentMonthClassesCount})`
                  : `Month Sessions: (${currentMonthClassesCount})`}
              </span>

              {canSchedule && (
                <button
                  onClick={() => {
                    const mStr = String(calendarMonth + 1).padStart(2, '0');
                    handleOpenAddForDate(`${calendarYear}-${mStr}-01`);
                  }}
                  className="px-3.5 py-2 rounded-2xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'إضافة حصة' : 'Add Class'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Days of the Week Column Headers (Saturday to Friday) */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs font-bold text-[#29235D] night:text-[#E8D5A3]">
            {WEEK_DAYS.map(d => (
              <div
                key={d.key}
                className="py-2 px-1 rounded-xl bg-[#F8F6F0] night:bg-[#231E44] border border-gray-100 night:border-gray-800"
              >
                <span className="hidden sm:inline">{isRTL ? d.labelAr : d.labelEn}</span>
                <span className="sm:hidden">{isRTL ? d.shortAr : d.shortEn}</span>
              </div>
            ))}
          </div>

          {/* 7-Column Month Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {monthGridData.map((cell, idx) => {
              const hasClasses = cell.classes.length > 0;
              const hasDepletedClass = cell.classes.some(cls => {
                return cls.studentIds.some(sId => {
                  const quota = getStudentQuota(sId);
                  return quota.remainingSessions <= 0 || quota.isExpired;
                });
              });

              return (
                <div
                  key={`${cell.dateStr}-${idx}`}
                  className={`min-h-[110px] sm:min-h-[130px] p-2 rounded-2xl border transition-all flex flex-col justify-between group ${
                    cell.isToday
                      ? 'ring-2 ring-[#D3B673] bg-[#D3B673]/5 dark:bg-[#D3B673]/10 border-[#D3B673]'
                      : !cell.isCurrentMonth
                      ? 'bg-gray-50/50 night:bg-gray-900/30 border-gray-100 night:border-gray-800/40 opacity-40'
                      : hasDepletedClass
                      ? 'bg-amber-50/30 night:bg-amber-950/20 border-amber-200'
                      : 'bg-white night:bg-[#1E193C] border-gray-200/70 night:border-gray-700/60 hover:border-[#D3B673]'
                  }`}
                >
                  {/* Top Day Header in Cell */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${
                        cell.isToday
                          ? 'bg-[#29235D] text-[#D3B673]'
                          : cell.isCurrentMonth
                          ? 'text-[#29235D] night:text-white'
                          : 'text-gray-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    <div className="flex items-center gap-1">
                      {hasClasses && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#29235D]/10 night:bg-white/10 text-[#29235D] night:text-white">
                          {cell.classes.length}
                        </span>
                      )}

                      {canSchedule && (
                        <button
                          type="button"
                          onClick={() => handleOpenAddForDate(cell.dateStr)}
                          className="opacity-0 group-hover:opacity-100 sm:opacity-0 focus:opacity-100 hover:opacity-100 transition-opacity w-5 h-5 rounded-md bg-[#29235D] hover:bg-[#D3B673] text-[#D3B673] hover:text-[#29235D] flex items-center justify-center cursor-pointer text-xs"
                          title={isRTL ? `إضافة حصة بتاريخ ${cell.dateStr}` : `Add class on ${cell.dateStr}`}
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sessions List within Cell */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px] sm:max-h-[95px] pr-0.5">
                    {cell.classes.map(cls => {
                      const statusConfig = getClassStatusConfig(cls.status);
                      const isGroup = cls.studyMode === 'GROUP' || cls.studentIds.length > 1;
                      const primaryStudent = students.find(s => cls.studentIds.includes(s.id));
                      const quota = primaryStudent ? getStudentQuota(primaryStudent.id) : null;
                      const isDepleted = quota ? quota.remainingSessions <= 0 || quota.isExpired : false;

                      return (
                        <div
                          key={cls.id}
                          style={{ borderRightColor: isRTL ? statusConfig.hex : undefined, borderLeftColor: !isRTL ? statusConfig.hex : undefined, borderWidth: isRTL ? '0 3px 0 0' : '0 0 0 3px' }}
                          className={`p-1.5 rounded-lg text-[10px] leading-tight border transition-all cursor-pointer hover:shadow-xs ${
                            isDepleted
                              ? 'bg-amber-50 night:bg-amber-950/40 border-amber-300'
                              : 'bg-[#FBF9F4] night:bg-[#231E44] border-gray-100 night:border-gray-700'
                          }`}
                          onClick={() => setSelectedActionSession(cls)}
                          title={isRTL ? `خيارات وإدارة الحصة: ${cls.titleArabic || cls.title}` : `Manage Session: ${cls.title}`}
                        >
                          <div className="flex items-center justify-between gap-1 font-bold text-[#29235D] night:text-white">
                            <span className="truncate">{cls.titleArabic || cls.title}</span>
                            <span className="text-[9px] font-mono opacity-70 shrink-0">{cls.startTime}</span>
                          </div>

                          <div className="flex items-center justify-between gap-1 text-[9px] text-gray-500 night:text-gray-400 mt-0.5">
                            <span className="truncate">
                              {isGroup
                                ? (isRTL ? `👥 حلقة (${cls.studentIds.length})` : `👥 Group (${cls.studentIds.length})`)
                                : (isRTL ? primaryStudent?.nameArabic || primaryStudent?.name : primaryStudent?.name)}
                            </span>
                            <span
                              style={{ color: statusConfig.hex }}
                              className="font-bold shrink-0 text-[8px]"
                            >
                              {isRTL ? statusConfig.labelAr : statusConfig.labelEn}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. MAIN VIEW: WEEKLY MATRIX (7 Columns: Saturday to Friday) */}
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
                        const statusConfig = getClassStatusConfig(cls.status);

                        return (
                          <div
                            key={cls.id}
                            style={{ borderLeftColor: statusConfig.hex, borderLeftWidth: '4px' }}
                            className={`p-3 rounded-2xl border transition-all relative ${
                              isDepleted
                                ? 'bg-rose-50/90 night:bg-rose-950/40 border-rose-300 shadow-xs'
                                : 'bg-[#FBF9F4] night:bg-[#18152E] border-gray-200 night:border-gray-700 hover:border-[#D3B673] shadow-xs'
                            }`}
                          >
                            {/* Inactive Due to Quota Badge or Color Key Status Badge */}
                            <div className="mb-2 flex items-center justify-between gap-1 flex-wrap">
                              <span
                                style={{ backgroundColor: statusConfig.hex }}
                                className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white shadow-xs inline-flex items-center gap-1"
                              >
                                {cls.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                                {cls.status === 'ABSENT' && <span>⚠️</span>}
                                <span>{isRTL ? statusConfig.labelAr : statusConfig.labelEn}</span>
                              </span>

                              <span className="font-mono text-[10px] text-gray-500 font-semibold">{cls.startTime}</span>
                            </div>

                            {/* Quota Depletion Alert if Applicable */}
                            {isDepleted && (
                              <div className="mb-2 px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-900/50 border border-rose-300 text-rose-800 dark:text-rose-200 text-[9px] font-extrabold flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <Lock className="w-3 h-3 text-rose-600 flex-shrink-0" />
                                  {isRTL ? 'الرصيد 0 (غير مفعّلة)' : '0 Quota (Locked)'}
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
                            )}

                            {/* Class Title */}
                            <h4 className="text-xs font-bold text-[#29235D] night:text-white line-clamp-1">
                              {isRTL ? cls.titleArabic || cls.title : cls.title}
                            </h4>

                            {/* Student Name */}
                            {student && (
                              <p className="text-[11px] text-gray-700 night:text-gray-300 mt-1 flex items-center gap-1">
                                <GraduationCap className="w-3 h-3 text-[#D3B673]" />
                                <span className="font-semibold">{isRTL ? student.nameArabic || student.name : student.name}</span>
                              </p>
                            )}

                            {/* Teacher Name (if not in teacher view) */}
                            {!isTeacher && teacher && (
                              <p className="text-[10px] text-gray-500 night:text-gray-400 mt-0.5 flex items-center gap-1">
                                <User className="w-2.5 h-2.5 text-gray-400" />
                                <span>{isRTL ? teacher.nameArabic || teacher.name : teacher.name}</span>
                              </p>
                            )}

                            {/* Quick Status Selector for Teacher/Admin */}
                            {!isStudent && (
                              <div className="mt-2 flex items-center justify-between gap-1 text-[9px]">
                                <span className="text-gray-400 font-semibold">{isRTL ? 'الحالة:' : 'Status:'}</span>
                                <select
                                  value={cls.status}
                                  onChange={(e) => handleQuickStatusChange(cls.id, e.target.value as ClassSessionStatus)}
                                  className="text-[9px] font-bold bg-white night:bg-[#131124] border border-gray-300 night:border-gray-700 rounded px-1 py-0.5 text-gray-700 night:text-gray-200 cursor-pointer"
                                >
                                  {COLOR_KEYS_ORDER.map(st => (
                                    <option key={st} value={st}>
                                      {isRTL ? COLOR_KEYS_CONFIG[st].labelAr : COLOR_KEYS_CONFIG[st].labelEn}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Quick Action Buttons */}
                            <div className="mt-2.5 pt-2 border-t border-gray-200/60 night:border-gray-700/60 flex items-center justify-between gap-1 flex-wrap">
                              {/* Session Action Options Button */}
                              <button
                                type="button"
                                onClick={() => setSelectedActionSession(cls)}
                                className="px-2 py-1 rounded-lg bg-[#29235D] text-[#D3B673] hover:bg-[#1D1845] text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                                title={isRTL ? 'خيارات الحصة (إلغاء، تأجيل، حذف، محادثة)' : 'Session Options (Cancel, Reschedule, Delete, Chat)'}
                              >
                                <span>⚙️</span>
                                <span>{isRTL ? 'خيارات الحصة' : 'Options'}</span>
                              </button>

                              {/* Direct Chat Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (cls.studentIds.length > 1) {
                                    setActiveChatConfig({ targetId: cls.id, isGroup: true });
                                  } else {
                                    const otherId = isStudent ? cls.teacherId : cls.studentIds[0];
                                    setActiveChatConfig({ targetId: otherId, isGroup: false });
                                  }
                                }}
                                className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 night:bg-purple-950/40 night:text-purple-300 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                                title={isRTL ? 'فتح المحادثة والرسائل' : 'Open Chat'}
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>{isRTL ? 'محادثة' : 'Chat'}</span>
                              </button>

                              {/* Attendance toggle (for teacher / admin) */}
                              {!isStudent && student && (
                                <button
                                  type="button"
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
                const statusConfig = getClassStatusConfig(cls.status);

                return (
                  <div
                    key={cls.id}
                    style={{ borderLeftColor: statusConfig.hex, borderLeftWidth: '4px' }}
                    className={`p-5 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                      isDepleted
                        ? 'bg-rose-50/70 night:bg-rose-950/40 border-rose-300'
                        : 'bg-[#FBF9F4] night:bg-[#18152E] border-gray-200 night:border-gray-700'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Color Badge */}
                        <span
                          style={{ backgroundColor: statusConfig.hex }}
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs inline-flex items-center gap-1"
                        >
                          {cls.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                          {cls.status === 'ABSENT' && <span>⚠️</span>}
                          <span>{isRTL ? statusConfig.labelAr : statusConfig.labelEn}</span>
                        </span>

                        {isDepleted ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-200 text-rose-900 border border-rose-300 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-rose-700" />
                            {isRTL ? 'الرصيد منتهي (0)' : 'Depleted (0)'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            {quota ? `${quota.remainingSessions} ${isRTL ? 'حصص متبقية' : 'left'}` : 'نشطة'}
                          </span>
                        )}

                        <span className="text-xs font-mono font-bold text-gray-500 night:text-gray-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#D3B673]" />
                          {cls.startTime} - {cls.endTime}
                        </span>

                        {program && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white night:bg-[#131124] text-[#29235D] night:text-[#E8D5A3] border border-gray-200 night:border-gray-700">
                            {isRTL ? program.nameArabic || program.name : program.name}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[#29235D] night:text-white font-serif">
                        {isRTL ? cls.titleArabic || cls.title : cls.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-gray-600 night:text-gray-300 pt-1 flex-wrap">
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

                      {/* Quick Status Selector for Teacher / Admin */}
                      {!isStudent && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[11px] text-gray-400 font-semibold">{isRTL ? 'تعديل الحالة:' : 'Change Status:'}</span>
                          <select
                            value={cls.status}
                            onChange={(e) => handleQuickStatusChange(cls.id, e.target.value as ClassSessionStatus)}
                            className="text-xs font-bold bg-white night:bg-[#131124] border border-gray-300 night:border-gray-700 rounded-lg px-2 py-1 text-gray-700 night:text-gray-200 cursor-pointer"
                          >
                            {COLOR_KEYS_ORDER.map(st => (
                              <option key={st} value={st}>
                                {isRTL ? COLOR_KEYS_CONFIG[st].labelAr : COLOR_KEYS_CONFIG[st].labelEn}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelectedActionSession(cls)}
                        className="px-3.5 py-2 rounded-xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        title={isRTL ? 'خيارات الحصة (إلغاء، تأجيل، حذف، محادثة)' : 'Session Options'}
                      >
                        <span>⚙️</span>
                        <span>{isRTL ? 'خيارات وإدارة الحصة' : 'Session Options'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (cls.studentIds.length > 1) {
                            setActiveChatConfig({ targetId: cls.id, isGroup: true });
                          } else {
                            const otherId = isStudent ? cls.teacherId : cls.studentIds[0];
                            setActiveChatConfig({ targetId: otherId, isGroup: false });
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 night:bg-purple-950/40 night:text-purple-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'محادثة' : 'Chat'}</span>
                      </button>

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
        <div className="bg-white night:bg-[#18152E] rounded-3xl p-6 border border-[#29235D]/10 night:border-[#393168] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#29235D] night:text-[#E8D5A3] font-serif">
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
              const statusConfig = getClassStatusConfig(cls.status);

              return (
                <div
                  key={cls.id}
                  style={{ borderLeftColor: statusConfig.hex, borderLeftWidth: '4px' }}
                  className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    isDepleted
                      ? 'bg-rose-50/60 night:bg-rose-950/40 border-rose-200'
                      : 'bg-[#FBF9F4] night:bg-[#131124] border-gray-100 night:border-gray-800 hover:border-[#D3B673]'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        style={{ backgroundColor: statusConfig.hex }}
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs inline-flex items-center gap-1"
                      >
                        {cls.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                        {cls.status === 'ABSENT' && <span>⚠️</span>}
                        <span>{isRTL ? statusConfig.labelAr : statusConfig.labelEn}</span>
                      </span>

                      <span className="text-xs font-mono font-bold text-gray-500 night:text-gray-400 flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-[#D3B673]" />
                        {cls.date} ({cls.startTime} - {cls.endTime})
                      </span>

                      {isDepleted ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                          {isRTL ? '⚠️ رصيد الطالب 0 - غير مفعّلة' : '⚠️ 0 Balance - Inactive'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {quota ? `${quota.remainingSessions} ${isRTL ? 'حصص' : 'left'}` : 'مفعّلة'}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-[#29235D] night:text-white font-serif">
                      {isRTL ? cls.titleArabic || cls.title : cls.title}
                    </h4>

                    <div className="flex items-center gap-4 text-xs text-gray-600 night:text-gray-300 flex-wrap">
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

                    {/* Quick Status selector for Teacher/Admin in list view */}
                    {!isStudent && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-gray-400 font-semibold">{isRTL ? 'تعديل الحالة:' : 'Change Status:'}</span>
                        <select
                          value={cls.status}
                          onChange={(e) => handleQuickStatusChange(cls.id, e.target.value as ClassSessionStatus)}
                          className="text-xs font-bold bg-white night:bg-[#18152E] border border-gray-300 night:border-gray-700 rounded-lg px-2 py-1 text-gray-700 night:text-gray-200 cursor-pointer"
                        >
                          {COLOR_KEYS_ORDER.map(st => (
                            <option key={st} value={st}>
                              {isRTL ? COLOR_KEYS_CONFIG[st].labelAr : COLOR_KEYS_CONFIG[st].labelEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedActionSession(cls)}
                      className="px-3 py-2 rounded-xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                      title={isRTL ? 'خيارات وإدارة الحصة' : 'Session Options'}
                    >
                      <span>⚙️</span>
                      <span>{isRTL ? 'خيارات الحصة' : 'Options'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (cls.studentIds.length > 1) {
                          setActiveChatConfig({ targetId: cls.id, isGroup: true });
                        } else {
                          const otherId = isStudent ? cls.teacherId : cls.studentIds[0];
                          setActiveChatConfig({ targetId: otherId, isGroup: false });
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 night:bg-purple-950/40 night:text-purple-300 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'محادثة' : 'Chat'}</span>
                    </button>

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
              
              {/* 1-on-1 vs Group Circle Toggle */}
              <div>
                <label className="block font-bold text-[#29235D] mb-1.5">
                  {isRTL ? 'نوع الحصة / نظام الدراسة *' : 'Session Type / Study Mode *'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewStudyMode('PRIVATE');
                      if (students.length > 0 && !newStudentId) {
                        setNewStudentId(students[0].id);
                      }
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                      newStudyMode === 'PRIVATE'
                        ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-xs'
                        : 'bg-[#FBF9F4] text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>{isRTL ? 'حصة فردية خاصة (1-to-1)' : '1-on-1 Private'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewStudyMode('GROUP');
                      if (newGroupStudentIds.length === 0 && newStudentId) {
                        setNewGroupStudentIds([newStudentId]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${
                      newStudyMode === 'GROUP'
                        ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-xs'
                        : 'bg-[#FBF9F4] text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>{isRTL ? 'حلقة جماعية (مجموعة طلاب)' : 'Group Circle'}</span>
                  </button>
                </div>
              </div>

              {/* Conditional Student Picker: 1-to-1 Single Dropdown vs Group Multi-Select */}
              {newStudyMode === 'PRIVATE' ? (
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
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#29235D]">
                      {isRTL ? 'اختر طلاب الحلقة الجماعية *' : 'Select Group Students *'}
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setNewGroupStudentIds(students.map(s => s.id))}
                        className="text-[#B89955] hover:underline font-bold cursor-pointer"
                      >
                        {isRTL ? 'تحديد الكل' : 'Select All'}
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => setNewGroupStudentIds([])}
                        className="text-gray-500 hover:underline font-bold cursor-pointer"
                      >
                        {isRTL ? 'إلغاء التحديد' : 'Clear'}
                      </button>
                    </div>
                  </div>

                  {/* Selected count info & Badges */}
                  <div className="p-3 rounded-2xl bg-[#F8F6F0] border border-[#29235D]/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-[#29235D] text-xs">
                        {isRTL
                          ? `👥 الطلاب المحددين في الحلقة (${newGroupStudentIds.length} من أصل ${students.length})`
                          : `👥 Selected Students (${newGroupStudentIds.length} of ${students.length})`}
                      </span>
                      {newGroupStudentIds.length === 0 && (
                        <span className="text-[10px] text-red-500 font-bold">
                          {isRTL ? '⚠️ يجب اختيار طالب واحد على الأقل' : 'Select at least 1'}
                        </span>
                      )}
                    </div>

                    {newGroupStudentIds.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto mb-2.5">
                        {newGroupStudentIds.map(sId => {
                          const std = students.find(s => s.id === sId);
                          const quota = getStudentQuota(sId);
                          return (
                            <span
                              key={sId}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${
                                quota.remainingSessions > 0
                                  ? 'bg-white border-gray-200 text-[#29235D]'
                                  : 'bg-rose-50 border-rose-300 text-rose-800'
                              }`}
                            >
                              <span>{isRTL ? std?.nameArabic || std?.name : std?.name}</span>
                              <span className="text-[10px] opacity-75 font-mono">({quota.remainingSessions}ح)</span>
                              <button
                                type="button"
                                onClick={() => setNewGroupStudentIds(prev => prev.filter(id => id !== sId))}
                                className="hover:text-red-500 text-gray-400 font-bold ml-1 cursor-pointer"
                              >
                                ✕
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Search within student list */}
                    <input
                      type="text"
                      value={studentSearchInModal}
                      onChange={e => setStudentSearchInModal(e.target.value)}
                      placeholder={isRTL ? 'بحث بالاسم أو الكود لتحديد طلاب...' : 'Search student by name or code...'}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs mb-2"
                    />

                    {/* Scrollable list of students with checkboxes */}
                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                      {students
                        .filter(s => {
                          if (!studentSearchInModal.trim()) return true;
                          const q = studentSearchInModal.toLowerCase();
                          return (
                            s.name.toLowerCase().includes(q) ||
                            (s.nameArabic && s.nameArabic.includes(q)) ||
                            s.code.toLowerCase().includes(q)
                          );
                        })
                        .map(s => {
                          const isSelected = newGroupStudentIds.includes(s.id);
                          const quota = getStudentQuota(s.id);
                          return (
                            <label
                              key={s.id}
                              className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all border ${
                                isSelected
                                  ? 'bg-white border-[#D3B673] shadow-xs'
                                  : 'hover:bg-white/70 border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      setNewGroupStudentIds(prev => [...prev, s.id]);
                                    } else {
                                      setNewGroupStudentIds(prev => prev.filter(id => id !== s.id));
                                    }
                                  }}
                                  className="rounded text-[#29235D] focus:ring-[#D3B673]"
                                />
                                <span className="font-bold text-[#29235D]">
                                  {isRTL ? s.nameArabic || s.name : s.name}
                                </span>
                                <span className="text-[10px] font-mono text-gray-400">({s.code})</span>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  quota.remainingSessions > 0
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {quota.remainingSessions > 0
                                  ? `${quota.remainingSessions} ${isRTL ? 'حصة متبقية' : 'sessions'}`
                                  : (isRTL ? '⚠️ رصيد 0' : '0 quota')}
                              </span>
                            </label>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}

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
                    {isRTL ? 'المعلم أو المشرف المسند للدرس *' : 'Assigned Teacher / Instructor *'}
                  </label>
                  <select
                    disabled={isTeacher}
                    value={newTeacherId}
                    onChange={e => setNewTeacherId(e.target.value)}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-semibold"
                  >
                    {availableInstructors.map(t => (
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
              <div className="bg-[#FAF7F0] p-3.5 rounded-2xl border border-[#D3B673]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#29235D] font-bold text-xs sm:text-sm">
                    <Clock className="w-4 h-4 text-[#D3B673]" />
                    <span>{isRTL ? 'توقيت ومدة الدرس' : 'Class Timing & Duration'}</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-[#29235D] text-[#D3B673] text-[11px] font-bold">
                    {WEEK_DAYS.find(w => w.key === getDayKeyFromDate(newDate))?.[isRTL ? 'labelAr' : 'labelEn']}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#29235D] mb-1">
                      {isRTL ? 'تاريخ الحصة *' : 'Class Date *'}
                    </label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={e => {
                        setNewDate(e.target.value);
                        const k = getDayKeyFromDate(e.target.value);
                        if (!recurrenceSelectedDays.includes(k)) {
                          setRecurrenceSelectedDays([k]);
                        }
                      }}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl font-mono text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#29235D] mb-1">
                      {isRTL ? 'وقت البدء *' : 'Start Time *'}
                    </label>
                    <input
                      type="time"
                      required
                      value={newStartTime}
                      onChange={e => handleStartTimeChange(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl font-mono text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#29235D] mb-1 flex items-center justify-between">
                      <span>{isRTL ? 'وقت الانتهاء' : 'End Time'}</span>
                      <span className="text-[10px] text-gray-500 font-normal">
                        ({newDurationMinutes} {isRTL ? 'دقيقة' : 'min'})
                      </span>
                    </label>
                    <input
                      type="time"
                      required
                      value={newEndTime}
                      onChange={e => handleEndTimeChange(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-xl font-mono text-xs font-bold"
                    />
                  </div>
                </div>

                {/* Duration Presets Selector (30m up to 4 hours) */}
                <div className="pt-2 border-t border-gray-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold text-[#29235D] flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5 text-[#D3B673]" />
                      <span>{isRTL ? 'اختر مدة الحصة (من نصف ساعة إلى 4 ساعات):' : 'Select Duration (30 min to 4 hrs):'}</span>
                    </label>
                    <span className="text-[11px] font-bold text-[#29235D] bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                      {DURATION_PRESETS.find(d => d.minutes === newDurationMinutes)?.[isRTL ? 'labelAr' : 'labelEn'] || `${newDurationMinutes} ${isRTL ? 'دقيقة' : 'min'}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                    {DURATION_PRESETS.map(preset => {
                      const isSelected = newDurationMinutes === preset.minutes;
                      return (
                        <button
                          key={preset.minutes}
                          type="button"
                          onClick={() => handleDurationSelect(preset.minutes)}
                          className={`py-1.5 px-1 rounded-xl text-center text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#29235D] text-[#D3B673] shadow-sm ring-2 ring-[#D3B673]'
                              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          <div className="text-[11px] whitespace-nowrap">{isRTL ? preset.shortAr : preset.labelEn}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* RECURRENCE & REPETITION SYSTEM (تكرار وجدولة الحصص تلقائياً)             */}
              {/* ========================================================================= */}
              <div className="bg-[#FAF7F0] p-3.5 rounded-2xl border border-[#D3B673]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#29235D] font-bold text-xs sm:text-sm">
                    <Repeat className="w-4 h-4 text-[#D3B673]" />
                    <span>{isRTL ? 'تكرار الحصة وجدولتها تلقائياً' : 'Lesson Recurrence & Repetition'}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold">
                    {isRTL ? 'لتوفير عناء الإضافة المتكررة' : 'Avoid repeated manual entries'}
                  </span>
                </div>

                {/* Recurrence Mode Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Mode 1: Single Session (No Repeat) */}
                  <button
                    type="button"
                    onClick={() => setRecurrenceMode('ONCE')}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      recurrenceMode === 'ONCE'
                        ? 'bg-[#29235D] text-white border-[#29235D] shadow-sm'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${recurrenceMode === 'ONCE' ? 'text-[#D3B673]' : 'text-[#29235D]'}`}>
                        {isRTL ? 'حصة واحدة فقط' : 'Once (Single Class)'}
                      </span>
                      {recurrenceMode === 'ONCE' && <Check className="w-3.5 h-3.5 text-[#D3B673]" />}
                    </div>
                    <p className={`text-[10px] leading-relaxed ${recurrenceMode === 'ONCE' ? 'text-gray-200' : 'text-gray-500'}`}>
                      {isRTL ? 'لا يعاد (في هذا اليوم والتاريخ فقط)' : 'No repeat (single selected date)'}
                    </p>
                  </button>

                  {/* Mode 2: Multi-Week Repetition */}
                  <button
                    type="button"
                    onClick={() => setRecurrenceMode('WEEKS')}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      recurrenceMode === 'WEEKS'
                        ? 'bg-[#29235D] text-white border-[#29235D] shadow-sm'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${recurrenceMode === 'WEEKS' ? 'text-[#D3B673]' : 'text-[#29235D]'}`}>
                        {isRTL ? 'تكرار لعدد محدد' : 'Specific Count'}
                      </span>
                      {recurrenceMode === 'WEEKS' && <Check className="w-3.5 h-3.5 text-[#D3B673]" />}
                    </div>
                    <p className={`text-[10px] leading-relaxed ${recurrenceMode === 'WEEKS' ? 'text-gray-200' : 'text-gray-500'}`}>
                      {isRTL ? 'تكرار أسبوعي (شهر، فصل، أو مخصص)' : 'Weekly repeat for N weeks'}
                    </p>
                  </button>

                  {/* Mode 3: Continuous / Infinite (Academic Year) */}
                  <button
                    type="button"
                    onClick={() => setRecurrenceMode('INFINITE')}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      recurrenceMode === 'INFINITE'
                        ? 'bg-[#29235D] text-white border-[#29235D] shadow-sm'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${recurrenceMode === 'INFINITE' ? 'text-[#D3B673]' : 'text-[#29235D]'}`}>
                        {isRTL ? 'تكرار مستمر بلا نهاية' : 'Ongoing / Infinite'}
                      </span>
                      {recurrenceMode === 'INFINITE' && <Check className="w-3.5 h-3.5 text-[#D3B673]" />}
                    </div>
                    <p className={`text-[10px] leading-relaxed ${recurrenceMode === 'INFINITE' ? 'text-gray-200' : 'text-gray-500'}`}>
                      {isRTL ? 'على مدار العام كاملاً (52 أسبوعاً)' : 'Full academic year (52 weeks)'}
                    </p>
                  </button>
                </div>

                {/* Specific Weeks Configuration */}
                {recurrenceMode === 'WEEKS' && (
                  <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2.5">
                    <label className="block text-[11px] font-bold text-[#29235D]">
                      {isRTL ? 'حدد عدد مرات التكرار / الأسابيع:' : 'Select Repetition Count / Weeks:'}
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {RECURRENCE_COUNT_PRESETS.map(preset => {
                        const isSelected = recurrenceWeeksCount === preset.count;
                        return (
                          <button
                            key={preset.count}
                            type="button"
                            onClick={() => setRecurrenceWeeksCount(preset.count)}
                            className={`p-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#29235D] text-[#D3B673] ring-2 ring-[#D3B673]'
                                : 'bg-[#FAF7F0] hover:bg-gray-100 text-[#29235D] border border-gray-200'
                            }`}
                          >
                            <div>{isRTL ? preset.labelAr : preset.labelEn}</div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-bold text-gray-600">
                        {isRTL ? 'أو أدخل عدداً مخصصاً:' : 'Or custom count:'}
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="52"
                        value={recurrenceWeeksCount}
                        onChange={e => setRecurrenceWeeksCount(Math.max(1, Math.min(52, parseInt(e.target.value, 10) || 1)))}
                        className="w-20 p-1.5 bg-[#FAF7F0] border border-gray-200 rounded-lg text-center font-bold text-xs"
                      />
                      <span className="text-xs text-gray-500 font-bold">
                        {isRTL ? 'حصة / أسبوع' : 'classes / weeks'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Weekdays Selector (if recurring) */}
                {recurrenceMode !== 'ONCE' && (
                  <div className="p-3 bg-white rounded-xl border border-gray-200 space-y-2">
                    <label className="block text-[11px] font-bold text-[#29235D]">
                      {isRTL ? 'أيام التكرار في الأسبوع (محدد تلقائياً على يوم الحصة):' : 'Repeat on weekdays:'}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {WEEK_DAYS.map(day => {
                        const isChecked = recurrenceSelectedDays.includes(day.key);
                        return (
                          <button
                            key={day.key}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                if (recurrenceSelectedDays.length > 1) {
                                  setRecurrenceSelectedDays(prev => prev.filter(d => d !== day.key));
                                }
                              } else {
                                setRecurrenceSelectedDays(prev => [...prev, day.key]);
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isChecked
                                ? 'bg-[#29235D] text-[#D3B673] shadow-sm'
                                : 'bg-[#FAF7F0] text-gray-600 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 text-[#D3B673]" />}
                            <span>{isRTL ? day.labelAr : day.shortEn}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Live Recurrence Generation Summary Card */}
                {recurrenceMode !== 'ONCE' && (
                  <div className="p-3 bg-gradient-to-r from-[#29235D] to-[#1D1845] rounded-xl text-white space-y-2 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarRange className="w-4 h-4 text-[#D3B673]" />
                        <span className="font-bold text-xs text-[#D3B673]">
                          {isRTL ? 'ملخص الجدولة والتكرار التلقائي' : 'Auto-Schedule Summary'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-[#D3B673] text-[#29235D] text-[11px] font-black rounded-full">
                        {generatedRecurringDates.length} {isRTL ? 'حصة ستُضاف للتقويم' : 'classes to add'}
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-200 space-y-1 pt-1 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span>{isRTL ? 'الفترة الزمنية:' : 'Period:'}</span>
                        <span className="font-mono font-bold text-white">
                          {generatedRecurringDates[0]} ➔ {generatedRecurringDates[generatedRecurringDates.length - 1]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{isRTL ? 'التوقيت والمدة:' : 'Time & Duration:'}</span>
                        <span className="font-mono font-bold text-[#D3B673]">
                          {newStartTime} - {newEndTime} ({newDurationMinutes} {isRTL ? 'دقيقة' : 'min'})
                        </span>
                      </div>
                    </div>

                    {/* Collapsible Date Preview */}
                    <div className="pt-1.5">
                      <button
                        type="button"
                        onClick={() => setShowRecurrencePreview(!showRecurrencePreview)}
                        className="text-[11px] font-bold text-[#D3B673] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Info className="w-3 h-3" />
                        <span>
                          {showRecurrencePreview
                            ? (isRTL ? 'إخفاء قائمة تواريخ الحصص' : 'Hide class dates list')
                            : (isRTL ? `معاينة تواريخ الـ ${generatedRecurringDates.length} حصة بالتفصيل` : `Preview all ${generatedRecurringDates.length} dates`)}
                        </span>
                      </button>

                      {showRecurrencePreview && (
                        <div className="mt-2 max-h-36 overflow-y-auto bg-black/30 p-2 rounded-lg space-y-1 text-[10px] font-mono border border-white/10">
                          {generatedRecurringDates.map((d, i) => (
                            <div key={d} className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-white/5">
                              <span className="text-gray-300">
                                {isRTL ? `حصة ${i + 1}:` : `Class ${i + 1}:`}
                              </span>
                              <span className="text-[#D3B673] font-bold">{d}</span>
                              <span className="text-gray-400">{newStartTime} - {newEndTime}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                  <span>
                    {recurrenceMode !== 'ONCE' && generatedRecurringDates.length > 1
                      ? (isRTL ? `تأكيد وحفظ (${generatedRecurringDates.length} حصة)` : `Save ${generatedRecurringDates.length} Classes`)
                      : (isRTL ? 'تأكيد وحفظ في الجدول' : 'Save to Schedule')}
                  </span>
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

      {/* Class Action Modal (Cancel, Reschedule, Admin-only Delete, Zoom, Chat) */}
      {selectedActionSession && (
        <ClassActionModal
          session={selectedActionSession}
          onClose={() => setSelectedActionSession(null)}
          onOpenChat={(targetId, isGroup) => {
            setSelectedActionSession(null);
            setActiveChatConfig({ targetId, isGroup });
          }}
        />
      )}

      {/* Class Interactive Chat Modal */}
      {activeChatConfig && (
        <ClassChatModal
          initialThreadId={activeChatConfig.targetId}
          initialIsGroup={activeChatConfig.isGroup}
          onClose={() => setActiveChatConfig(null)}
        />
      )}

    </div>
  );
};
