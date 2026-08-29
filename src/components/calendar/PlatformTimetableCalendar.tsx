import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { TeacherProfile, TeacherAvailabilitySlot, WeekDay, StudyMode, SlotStatus } from '../../types';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Users,
  UserCheck,
  Zap,
  Info,
  CalendarDays,
  Check,
  X,
  Lock,
  Unlock,
  Layers,
  Filter,
  RefreshCw,
} from 'lucide-react';

export interface PlatformTimetableCalendarProps {
  teacher?: TeacherProfile;
  readOnly?: boolean;
  onSelectSlot?: (slot: TeacherAvailabilitySlot) => void;
  selectedSlotId?: string;
  showTeacherSelector?: boolean;
}

const WEEK_DAYS: { key: WeekDay; labelAr: string; labelEn: string; shortAr: string; shortEn: string }[] = [
  { key: 'SATURDAY', labelAr: 'السبت', labelEn: 'Saturday', shortAr: 'سبت', shortEn: 'Sat' },
  { key: 'SUNDAY', labelAr: 'الأحد', labelEn: 'Sunday', shortAr: 'أحد', shortEn: 'Sun' },
  { key: 'MONDAY', labelAr: 'الإثنين', labelEn: 'Monday', shortAr: 'إثنين', shortEn: 'Mon' },
  { key: 'TUESDAY', labelAr: 'الثلاثاء', labelEn: 'Tuesday', shortAr: 'ثلاثاء', shortEn: 'Tue' },
  { key: 'WEDNESDAY', labelAr: 'الأربعاء', labelEn: 'Wednesday', shortAr: 'أربعاء', shortEn: 'Wed' },
  { key: 'THURSDAY', labelAr: 'الخميس', labelEn: 'Thursday', shortAr: 'خميس', shortEn: 'Thu' },
  { key: 'FRIDAY', labelAr: 'الجمعة', labelEn: 'Friday', shortAr: 'جمعة', shortEn: 'Fri' },
];

export const PlatformTimetableCalendar: React.FC<PlatformTimetableCalendarProps> = ({
  teacher: propTeacher,
  readOnly = false,
  onSelectSlot,
  selectedSlotId,
  showTeacherSelector = false,
}) => {
  const { currentUser, teachers, updateTeacherAvailability } = useApp();
  const { isRTL } = useI18n();

  // If no teacher prop, check if currentUser is a teacher, or fallback to first teacher in list
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    propTeacher?.id || (currentUser?.role === 'TEACHER' ? currentUser.id : teachers[0]?.id || '')
  );

  const activeTeacher = propTeacher || teachers.find(t => t.id === selectedTeacherId) || (currentUser?.role === 'TEACHER' ? currentUser as TeacherProfile : null);

  const isTeacherOwner = !readOnly && currentUser?.role === 'TEACHER' && currentUser.id === activeTeacher?.id;
  const canEdit = !readOnly && (isTeacherOwner || currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN');

  const [slots, setSlots] = useState<TeacherAvailabilitySlot[]>(activeTeacher?.availabilitySlots || []);
  const [viewMode, setViewMode] = useState<'GRID' | 'DAY_BY_DAY' | 'LIST'>('GRID');
  const [activeDayFilter, setActiveDayFilter] = useState<WeekDay | 'ALL'>('ALL');
  const [studyFilter, setStudyFilter] = useState<'ALL' | 'PRIVATE' | 'GROUP'>('ALL');

  // Modal / Inline Add Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetDay, setTargetDay] = useState<WeekDay>('SUNDAY');
  const [startTime, setStartTime] = useState<string>('18:00');
  const [endTime, setEndTime] = useState<string>('19:30');
  const [slotTitle, setSlotTitle] = useState<string>('');
  const [studyType, setStudyType] = useState<'PRIVATE' | 'GROUP' | 'BOTH'>('BOTH');
  const [maxStudents, setMaxStudents] = useState<number>(5);
  const [initialStatus, setInitialStatus] = useState<SlotStatus>('AVAILABLE');
  const [notes, setNotes] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keep slots in sync if activeTeacher changes
  React.useEffect(() => {
    if (activeTeacher) {
      setSlots(activeTeacher.availabilitySlots || []);
    }
  }, [activeTeacher?.id, activeTeacher?.availabilitySlots]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const saveSlots = (newSlots: TeacherAvailabilitySlot[]) => {
    setSlots(newSlots);
    if (activeTeacher) {
      updateTeacherAvailability(activeTeacher.id, newSlots);
    }
  };

  // 1-Click Toggle between AVAILABLE and BUSY
  const handleToggleStatus = (slotId: string) => {
    if (!canEdit) return;
    const updated = slots.map(s => {
      if (s.id === slotId) {
        const isCurrentlyAvailable = s.status ? s.status === 'AVAILABLE' : s.isAvailable;
        const nextStatus: SlotStatus = isCurrentlyAvailable ? 'BUSY' : 'AVAILABLE';
        return {
          ...s,
          status: nextStatus,
          isAvailable: nextStatus === 'AVAILABLE',
        };
      }
      return s;
    });
    saveSlots(updated);
    showToast(isRTL ? 'تم تغيير حالة الموعد في الجدول' : 'Timetable slot status updated');
  };

  const handleDeleteSlot = (slotId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!canEdit) return;
    const updated = slots.filter(s => s.id !== slotId);
    saveSlots(updated);
    showToast(isRTL ? 'تم حذف الموعد من الجدول' : 'Slot removed from timetable');
  };

  const handleAddNewSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit || !activeTeacher) return;

    const dayObj = WEEK_DAYS.find(d => d.key === targetDay);
    const newSlot: TeacherAvailabilitySlot = {
      id: `slot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      day: targetDay,
      dayArabic: dayObj?.labelAr,
      startTime,
      endTime,
      title: slotTitle.trim() || undefined,
      studyType,
      maxStudents: studyType === 'PRIVATE' ? 1 : maxStudents,
      isAvailable: initialStatus === 'AVAILABLE',
      status: initialStatus,
      notes: notes.trim() || undefined,
    };

    const updated = [...slots, newSlot];
    saveSlots(updated);
    setIsAddModalOpen(false);
    setSlotTitle('');
    setNotes('');
    showToast(isRTL ? 'تمت إضافة الموعد إلى جدول المنصة' : 'New timetable slot added successfully');
  };

  // Quick Preset Handlers
  const handleApplyPreset = (presetType: 'EVENING_3DAYS' | 'WEEKEND' | 'FULL_WEEK') => {
    if (!canEdit || !activeTeacher) return;

    let presetSlots: TeacherAvailabilitySlot[] = [];
    if (presetType === 'EVENING_3DAYS') {
      const days: WeekDay[] = ['SUNDAY', 'TUESDAY', 'THURSDAY'];
      presetSlots = days.flatMap((day, idx) => {
        const dObj = WEEK_DAYS.find(d => d.key === day);
        return [
          {
            id: `slot-preset-${Date.now()}-${idx}-1`,
            day,
            dayArabic: dObj?.labelAr,
            startTime: '17:00',
            endTime: '18:30',
            title: isRTL ? 'جلسة تعليمية مسائية' : 'Evening Class Session',
            studyType: 'BOTH',
            isAvailable: true,
            status: 'AVAILABLE',
          },
          {
            id: `slot-preset-${Date.now()}-${idx}-2`,
            day,
            dayArabic: dObj?.labelAr,
            startTime: '19:00',
            endTime: '20:30',
            title: isRTL ? 'حلقة تفاعلية' : 'Interactive Circle',
            studyType: 'GROUP',
            maxStudents: 6,
            isAvailable: true,
            status: 'AVAILABLE',
          },
        ];
      });
    } else if (presetType === 'WEEKEND') {
      const days: WeekDay[] = ['FRIDAY', 'SATURDAY'];
      presetSlots = days.flatMap((day, idx) => {
        const dObj = WEEK_DAYS.find(d => d.key === day);
        return [
          {
            id: `slot-preset-we-${Date.now()}-${idx}-1`,
            day,
            dayArabic: dObj?.labelAr,
            startTime: '10:00',
            endTime: '12:00',
            title: isRTL ? 'حلقة عطلة نهاية الأسبوع الصباحية' : 'Weekend Morning Circle',
            studyType: 'BOTH',
            isAvailable: true,
            status: 'AVAILABLE',
          },
          {
            id: `slot-preset-we-${Date.now()}-${idx}-2`,
            day,
            dayArabic: dObj?.labelAr,
            startTime: '16:00',
            endTime: '18:00',
            title: isRTL ? 'جلسة تدريب فردي' : '1-on-1 Practice Session',
            studyType: 'PRIVATE',
            isAvailable: true,
            status: 'AVAILABLE',
          },
        ];
      });
    } else if (presetType === 'FULL_WEEK') {
      const days: WeekDay[] = ['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'];
      presetSlots = days.map((day, idx) => {
        const dObj = WEEK_DAYS.find(d => d.key === day);
        return {
          id: `slot-preset-fw-${Date.now()}-${idx}`,
          day,
          dayArabic: dObj?.labelAr,
          startTime: '18:00',
          endTime: '20:00',
          title: isRTL ? 'الفترة المسائية المعتمدة' : 'Standard Evening Slot',
          studyType: 'BOTH',
          isAvailable: true,
          status: 'AVAILABLE',
        };
      });
    }

    saveSlots(presetSlots);
    showToast(isRTL ? 'تم تطبيق قالب الجدول بنجاح' : 'Timetable template applied');
  };

  // Filter slots
  const filteredSlots = slots.filter(slot => {
    if (activeDayFilter !== 'ALL' && slot.day !== activeDayFilter) return false;
    if (studyFilter !== 'ALL') {
      if (studyFilter === 'PRIVATE' && slot.studyType === 'GROUP') return false;
      if (studyFilter === 'GROUP' && slot.studyType === 'PRIVATE') return false;
    }
    return true;
  });

  const availableCount = slots.filter(s => s.status === 'AVAILABLE' || (s.status === undefined && s.isAvailable)).length;
  const busyCount = slots.filter(s => s.status === 'BUSY' || (s.status === undefined && !s.isAvailable)).length;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#29235D]/10 shadow-xs space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#29235D] text-[#D3B673] px-5 py-3 rounded-2xl shadow-2xl border border-[#D3B673]/40 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4 text-[#D3B673]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Timetable Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D3B673] animate-pulse" />
            <h2 className="text-lg sm:text-xl font-black text-[#29235D] font-serif flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#D3B673]" />
              <span>{isRTL ? 'جدول المواعيد والحصص الأسبوعي للمنصة' : 'Platform Weekly Timetable & Schedule'}</span>
            </h2>
          </div>
          <p className="text-xs text-gray-500">
            {canEdit
              ? isRTL
                ? 'أنشئ جدول مواعيدك الأسبوعي بسهولة. يمكنك تبديل حالة أي موعد بين "متاح" و "مشغول" بنقرة واحدة فقط.'
                : 'Manage your weekly teaching timetable. Click any slot to toggle between Available and Busy.'
              : isRTL
              ? 'مواعيد المعلم المعتمدة: يظهر الموعد المتاح للحجز، أو كلمة "مشغول" في الأوقات المحجوزة.'
              : 'Instructor timetable: Available slots for enrollment or marked Busy when occupied.'}
          </p>
        </div>

        {/* Status Indicators & View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Badges */}
          <div className="flex items-center gap-2 bg-[#FBF9F4] px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>{isRTL ? `متاح (${availableCount})` : `Available (${availableCount})`}</span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1 text-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span>{isRTL ? `مشغول (${busyCount})` : `Busy (${busyCount})`}</span>
            </span>
          </div>

          {/* View Mode Buttons */}
          <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setViewMode('GRID')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'GRID' ? 'bg-[#29235D] text-[#D3B673] shadow-xs' : 'text-gray-600 hover:text-[#29235D]'
              }`}
            >
              {isRTL ? 'جدول أسبوعي' : 'Weekly Grid'}
            </button>
            <button
              onClick={() => setViewMode('DAY_BY_DAY')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'DAY_BY_DAY' ? 'bg-[#29235D] text-[#D3B673] shadow-xs' : 'text-gray-600 hover:text-[#29235D]'
              }`}
            >
              {isRTL ? 'حسب الأيام' : 'By Day'}
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'LIST' ? 'bg-[#29235D] text-[#D3B673] shadow-xs' : 'text-gray-600 hover:text-[#29235D]'
              }`}
            >
              {isRTL ? 'قائمة' : 'List'}
            </button>
          </div>

          {/* Add Slot Button (Teacher / Admin) */}
          {canEdit && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isRTL ? 'إضافة موعد' : 'Add Slot'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Optional Teacher Selector if browsing across instructors */}
      {showTeacherSelector && teachers.length > 0 && (
        <div className="bg-[#F8F6F0] p-3 rounded-2xl border border-[#29235D]/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#D3B673]" />
            <span className="text-xs font-bold text-[#29235D]">{isRTL ? 'عرض جدول المعلم:' : 'View Teacher Timetable:'}</span>
          </div>
          <select
            value={selectedTeacherId}
            onChange={e => setSelectedTeacherId(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-bold text-[#29235D] outline-none"
          >
            {teachers.map(t => (
              <option key={t.id} value={t.id}>
                {isRTL ? t.nameArabic : t.name} ({t.specializationArabic || t.specialization})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Teacher Quick Preset Tools Bar */}
      {canEdit && (
        <div className="bg-gradient-to-r from-[#FBF9F4] to-[#F3EFE6] p-3.5 rounded-2xl border border-[#D3B673]/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#D3B673]" />
            <span className="text-xs font-bold text-[#29235D]">
              {isRTL ? 'قوالب الجداول السريعة:' : 'Quick Timetable Presets:'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleApplyPreset('EVENING_3DAYS')}
              className="px-3 py-1 rounded-xl bg-white hover:bg-[#29235D] hover:text-[#D3B673] text-gray-700 text-xs font-bold border border-gray-200 transition-all shadow-2xs cursor-pointer"
            >
              🌙 {isRTL ? 'أحد - ثلاثاء - خميس (مساءً)' : 'Sun - Tue - Thu (Evening)'}
            </button>
            <button
              onClick={() => handleApplyPreset('WEEKEND')}
              className="px-3 py-1 rounded-xl bg-white hover:bg-[#29235D] hover:text-[#D3B673] text-gray-700 text-xs font-bold border border-gray-200 transition-all shadow-2xs cursor-pointer"
            >
              🏖️ {isRTL ? 'عطلة نهاية الأسبوع (جمعة وسبت)' : 'Weekend (Fri & Sat)'}
            </button>
            <button
              onClick={() => handleApplyPreset('FULL_WEEK')}
              className="px-3 py-1 rounded-xl bg-white hover:bg-[#29235D] hover:text-[#D3B673] text-gray-700 text-xs font-bold border border-gray-200 transition-all shadow-2xs cursor-pointer"
            >
              📅 {isRTL ? 'جدول مسائي كامل (السبت - الخميس)' : 'Full Week Evenings'}
            </button>
            {slots.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(isRTL ? 'هل أنت متأكد من رغبتك في مسح جدول المواعيد؟' : 'Are you sure you want to clear your timetable?')) {
                    saveSlots([]);
                    showToast(isRTL ? 'تم مسح الجدول' : 'Timetable cleared');
                  }
                }}
                className="px-2.5 py-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-all cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isRTL ? 'مسح الكل' : 'Clear All'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Day Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveDayFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeDayFilter === 'ALL'
              ? 'bg-[#29235D] text-[#D3B673]'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isRTL ? 'جميع الأيام' : 'All Days'}
        </button>
        {WEEK_DAYS.map(d => {
          const count = slots.filter(s => s.day === d.key).length;
          return (
            <button
              key={d.key}
              onClick={() => setActiveDayFilter(d.key)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeDayFilter === d.key
                  ? 'bg-[#29235D] text-[#D3B673]'
                  : 'bg-[#FBF9F4] text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>{isRTL ? d.labelAr : d.shortEn}</span>
              {count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeDayFilter === d.key ? 'bg-[#D3B673] text-[#29235D]' : 'bg-gray-200 text-gray-700'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {slots.length === 0 && (
        <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-gray-200 bg-[#FBF9F4] space-y-3">
          <CalendarDays className="w-12 h-12 text-[#D3B673] mx-auto opacity-70" />
          <h3 className="text-base font-bold text-[#29235D] font-serif">
            {isRTL ? 'لا توجد مواعيد مسجلة في الجدول حالياً' : 'No timetable slots scheduled yet'}
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            {canEdit
              ? isRTL
                ? 'يمكنك إضافة فترات تدريبية جديدة أو تطبيق أحد القوالب الجاهزة بالأعلى لتحديد أوقاتك المتاحة والمشغولة.'
                : 'Click "Add Slot" or apply a preset template above to build your weekly schedule.'
              : isRTL
              ? 'لم يقم المعلم بنشر جدول مواعيده بعد. يرجى التواصل عبر الدعم للتنسيق المباشر.'
              : 'The teacher has not published a timetable yet.'}
          </p>
          {canEdit && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-[#29235D] text-[#D3B673] font-bold text-xs inline-flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-[#1D1845]"
            >
              <Plus className="w-4 h-4" />
              <span>{isRTL ? 'إضافة أول موعد في الجدول' : 'Add First Slot'}</span>
            </button>
          )}
        </div>
      )}

      {/* VIEW 1: WEEKLY GRID (Responsive 7-Column Layout) */}
      {slots.length > 0 && viewMode === 'GRID' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {WEEK_DAYS.map(dayObj => {
            const daySlots = slots.filter(s => s.day === dayObj.key);
            const isFilterActive = activeDayFilter === 'ALL' || activeDayFilter === dayObj.key;
            if (!isFilterActive) return null;

            return (
              <div
                key={dayObj.key}
                className="bg-[#FBF9F4] rounded-2xl p-3 border border-gray-200 flex flex-col gap-2 min-h-[160px]"
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <span className="text-xs font-bold text-[#29235D] font-serif">
                    {isRTL ? dayObj.labelAr : dayObj.labelEn}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                    {daySlots.length}
                  </span>
                </div>

                {/* Day Slot Items */}
                <div className="space-y-2 flex-1">
                  {daySlots.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[11px] text-gray-400 italic py-4">
                      {isRTL ? 'فارغ' : 'Off'}
                    </div>
                  ) : (
                    daySlots.map(slot => {
                      const isBusy = slot.status === 'BUSY' || (slot.status === undefined && !slot.isAvailable);
                      const isSelected = selectedSlotId === slot.id;

                      return (
                        <div
                          key={slot.id}
                          onClick={() => {
                            if (canEdit) {
                              handleToggleStatus(slot.id);
                            } else if (onSelectSlot && !isBusy) {
                              onSelectSlot(slot);
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-xs transition-all relative group ${
                            isSelected
                              ? 'ring-2 ring-[#29235D] border-[#29235D] bg-[#29235D] text-white shadow-sm'
                              : isBusy
                              ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                              : 'bg-white border-emerald-200 text-[#29235D] hover:border-[#D3B673] hover:shadow-xs'
                          } ${canEdit || (onSelectSlot && !isBusy) ? 'cursor-pointer' : ''}`}
                        >
                          {/* Time */}
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono text-[11px] font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3 opacity-70" />
                              <span>{slot.startTime} - {slot.endTime}</span>
                            </span>

                            {/* Status Badge */}
                            {isBusy ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" />
                                <span>{isRTL ? 'مشغول' : 'Busy'}</span>
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" />
                                <span>{isRTL ? 'متاح' : 'Free'}</span>
                              </span>
                            )}
                          </div>

                          {/* Title / Type if available */}
                          {slot.title && (
                            <p className="text-[11px] font-bold truncate opacity-90 mb-1">
                              {slot.title}
                            </p>
                          )}

                          {/* Footer Tag */}
                          <div className="flex items-center justify-between text-[10px] opacity-75">
                            <span>
                              {slot.studyType === 'PRIVATE'
                                ? isRTL ? 'فردي' : '1-on-1'
                                : slot.studyType === 'GROUP'
                                ? isRTL ? 'مجموعة' : 'Group'
                                : isRTL ? 'مرن' : 'Flexible'}
                            </span>

                            {canEdit && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteSlot(slot.id, e)}
                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-0.5 rounded transition-opacity"
                                title={isRTL ? 'حذف' : 'Delete'}
                              >
                                <Trash2 className="w-3 h-3" />
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
      )}

      {/* VIEW 2 & 3: DAY BY DAY OR LIST VIEW */}
      {slots.length > 0 && (viewMode === 'DAY_BY_DAY' || viewMode === 'LIST') && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSlots.map(slot => {
            const isBusy = slot.status === 'BUSY' || (slot.status === undefined && !slot.isAvailable);
            const isSelected = selectedSlotId === slot.id;

            return (
              <div
                key={slot.id}
                onClick={() => {
                  if (canEdit) {
                    handleToggleStatus(slot.id);
                  } else if (onSelectSlot && !isBusy) {
                    onSelectSlot(slot);
                  }
                }}
                className={`p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'ring-2 ring-[#29235D] border-[#29235D] bg-[#29235D] text-white shadow-md'
                    : isBusy
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : 'bg-white border-gray-200 text-[#29235D] hover:border-[#D3B673] hover:shadow-xs'
                } ${canEdit || (onSelectSlot && !isBusy) ? 'cursor-pointer' : ''}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#D3B673] block">
                      📅 {slot.dayArabic || slot.day}
                    </span>
                    <h4 className="text-sm font-bold font-serif mt-0.5">
                      {slot.title || (isRTL ? 'فترة تدريبية معتمدة' : 'Scheduled Teaching Slot')}
                    </h4>
                  </div>

                  {/* Big Status Badge */}
                  {isBusy ? (
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'مشغول 🔒' : 'Busy 🔒'}</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                      <Check className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'متاح للحجز 🟢' : 'Available 🟢'}</span>
                    </span>
                  )}
                </div>

                {/* Time & Study Mode Details */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 opacity-90 font-mono font-bold">
                    <Clock className="w-3.5 h-3.5 text-[#D3B673]" />
                    <span>{slot.startTime} - {slot.endTime}</span>
                  </div>

                  <div className="flex items-center gap-2 opacity-80">
                    <Users className="w-3.5 h-3.5 text-[#D3B673]" />
                    <span>
                      {slot.studyType === 'PRIVATE'
                        ? isRTL ? 'حصة فردية خاصة (1-on-1)' : 'Private 1-on-1'
                        : slot.studyType === 'GROUP'
                        ? isRTL ? `مجموعة دراسية (${slot.maxStudents || 5} مقاعد)` : `Group Class (${slot.maxStudents || 5} seats)`
                        : isRTL ? 'متاح للفردي والمجموعات' : 'Private or Group'}
                    </span>
                  </div>

                  {slot.notes && (
                    <p className="text-[11px] opacity-75 italic pt-1 border-t border-gray-200/50">
                      "{slot.notes}"
                    </p>
                  )}
                </div>

                {/* Teacher Action Footer */}
                {canEdit && (
                  <div className="mt-3 pt-2.5 border-t border-gray-200/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-gray-500 font-medium">
                      {isRTL ? 'انقر لتبديل الحالة' : 'Click card to toggle status'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSlot(slot.id, e)}
                      className="text-red-600 hover:text-red-800 font-bold flex items-center gap-1 text-[11px] p-1 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{isRTL ? 'حذف' : 'Delete'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD TIMETABLE SLOT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#29235D]/20 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#D3B673]" />
                <h3 className="text-base font-bold text-[#29235D] font-serif">
                  {isRTL ? 'إضافة موعد في جدول المنصة' : 'Add Timetable Slot'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewSlot} className="space-y-3.5 text-xs">
              {/* Day Selection */}
              <div>
                <label className="block text-gray-600 font-bold mb-1">{isRTL ? 'اليوم' : 'Day of Week'}</label>
                <select
                  value={targetDay}
                  onChange={e => setTargetDay(e.target.value as WeekDay)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-[#FBF9F4] font-bold text-[#29235D] outline-none"
                >
                  {WEEK_DAYS.map(d => (
                    <option key={d.key} value={d.key}>
                      {isRTL ? d.labelAr : d.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title / Label */}
              <div>
                <label className="block text-gray-600 font-bold mb-1">{isRTL ? 'عنوان الفترة / نوع الحصة (اختياري)' : 'Slot Title (Optional)'}</label>
                <input
                  type="text"
                  placeholder={isRTL ? 'مثال: حلقة التجويد المسائية / محادثة حية' : 'e.g. Evening Tajweed Circle'}
                  value={slotTitle}
                  onChange={e => setSlotTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-semibold text-[#29235D] outline-none"
                />
              </div>

              {/* Time Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-600 font-bold mb-1">{isRTL ? 'من الساعة' : 'Start Time'}</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold text-[#29235D] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 font-bold mb-1">{isRTL ? 'إلى الساعة' : 'End Time'}</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold text-[#29235D] outline-none"
                  />
                </div>
              </div>

              {/* Study Mode */}
              <div>
                <label className="block text-gray-600 font-bold mb-1">{isRTL ? 'نمط الدراسة' : 'Study Mode'}</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['BOTH', 'PRIVATE', 'GROUP'] as const).map(mode => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setStudyType(mode)}
                      className={`py-2 px-1 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        studyType === mode
                          ? 'bg-[#29235D] text-[#D3B673] border-[#29235D]'
                          : 'bg-[#FBF9F4] text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {mode === 'BOTH' ? (isRTL ? 'فردي ومجموعة' : 'Both') : mode === 'PRIVATE' ? (isRTL ? 'خاص فردي' : '1-on-1') : (isRTL ? 'مجموعة' : 'Group')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Initial Status */}
              <div>
                <label className="block text-gray-600 font-bold mb-1">{isRTL ? 'الحالة المبدئية للموعد' : 'Initial Status'}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInitialStatus('AVAILABLE')}
                    className={`py-2 px-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      initialStatus === 'AVAILABLE'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-[#FBF9F4] text-gray-700 border-gray-200'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                    <span>{isRTL ? 'متاح للحجز' : 'Available'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInitialStatus('BUSY')}
                    className={`py-2 px-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      initialStatus === 'BUSY'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-[#FBF9F4] text-gray-700 border-gray-200'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isRTL ? 'مشغول 🔒' : 'Busy 🔒'}</span>
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-gray-600 font-bold mb-1">{isRTL ? 'ملاحظات المعلم (اختياري)' : 'Notes'}</label>
                <textarea
                  rows={2}
                  placeholder={isRTL ? 'مثال: موعد مخصص لتسميع وإجازة القرآن الكريم' : 'Optional notes for this slot'}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 font-medium text-[#29235D] outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#29235D] text-[#D3B673] font-bold shadow-md hover:bg-[#1D1845] cursor-pointer"
                >
                  {isRTL ? 'حفظ ونشر الموعد' : 'Save Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
