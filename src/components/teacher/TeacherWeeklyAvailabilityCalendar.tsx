import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { TeacherProfile, TeacherAvailabilitySlot, WeekDay, StudyMode } from '../../types';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  Globe,
  Sparkles,
  Users,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  Save,
  Copy,
  Zap,
  Info,
  CalendarDays,
} from 'lucide-react';

interface TeacherWeeklyAvailabilityCalendarProps {
  teacher: TeacherProfile;
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

export const TeacherWeeklyAvailabilityCalendar: React.FC<TeacherWeeklyAvailabilityCalendarProps> = ({ teacher }) => {
  const { updateTeacherAvailability } = useApp();
  const { isRTL } = useI18n();

  const [slots, setSlots] = useState<TeacherAvailabilitySlot[]>(teacher.availabilitySlots || []);
  const [selectedDay, setSelectedDay] = useState<WeekDay | 'ALL'>('ALL');
  const [selectedStudyFilter, setSelectedStudyFilter] = useState<'ALL' | 'PRIVATE' | 'GROUP'>('ALL');
  
  // Live Cairo Clock
  const [cairoTimeStr, setCairoTimeStr] = useState<string>('');

  // Quick Add Slot Modal / Inline Drawer
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [targetDay, setTargetDay] = useState<WeekDay>('SUNDAY');
  const [startTime, setStartTime] = useState<string>('18:00');
  const [endTime, setEndTime] = useState<string>('20:00');
  const [studyType, setStudyType] = useState<'PRIVATE' | 'GROUP' | 'BOTH'>('BOTH');
  const [maxStudents, setMaxStudents] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync slots when teacher prop updates
  useEffect(() => {
    setSlots(teacher.availabilitySlots || []);
  }, [teacher.availabilitySlots]);

  // Real-time Cairo Clock Effect
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
          timeZone: 'Africa/Cairo',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        };
        const formatter = new Intl.DateTimeFormat(isRTL ? 'ar-EG' : 'en-US', options);
        setCairoTimeStr(formatter.format(now));
      } catch {
        setCairoTimeStr(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [isRTL]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Persist slots to state and AppContext
  const saveSlots = (newSlots: TeacherAvailabilitySlot[]) => {
    setSlots(newSlots);
    updateTeacherAvailability(teacher.id, newSlots);
  };

  const handleToggleSlot = (slotId: string) => {
    const updated = slots.map(s => (s.id === slotId ? { ...s, isAvailable: !s.isAvailable } : s));
    saveSlots(updated);
    showNotification(isRTL ? 'تم تحديث حالة الموعد مباشرة' : 'Slot availability updated');
  };

  const handleDeleteSlot = (slotId: string) => {
    const updated = slots.filter(s => s.id !== slotId);
    saveSlots(updated);
    showNotification(isRTL ? 'تم حذف الموعد' : 'Slot removed');
  };

  const handleAddNewSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const dayObj = WEEK_DAYS.find(d => d.key === targetDay);
    const newSlot: TeacherAvailabilitySlot = {
      id: `slot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      day: targetDay,
      dayArabic: dayObj?.labelAr,
      startTime,
      endTime,
      timeZoneLabel: 'توقيت القاهرة (Cairo Time - CLT / GMT+2)',
      studyType,
      maxStudents: studyType === 'PRIVATE' ? 1 : maxStudents,
      isAvailable: true,
      notes: notes.trim() || undefined,
    };

    const updated = [...slots, newSlot];
    saveSlots(updated);
    setIsAddModalOpen(false);
    setNotes('');
    showNotification(isRTL ? 'تمت إضافة الموعد بنجاح ويظهر الآن للطلاب' : 'New availability slot added & published in real time!');
  };

  // Quick Preset Handlers
  const handleApplyPreset = (presetType: 'EVENING_3DAYS' | 'WEEKEND_CIRCLES' | 'DAILY_AFTERNOON') => {
    let presetSlots: TeacherAvailabilitySlot[] = [];
    if (presetType === 'EVENING_3DAYS') {
      const days: WeekDay[] = ['SUNDAY', 'TUESDAY', 'THURSDAY'];
      presetSlots = days.map((day, idx) => {
        const dObj = WEEK_DAYS.find(d => d.key === day);
        return {
          id: `preset-eve-${Date.now()}-${idx}`,
          day,
          dayArabic: dObj?.labelAr,
          startTime: '18:00',
          endTime: '20:00',
          timeZoneLabel: 'توقيت القاهرة (Cairo Time - CLT / GMT+2)',
          studyType: 'BOTH',
          isAvailable: true,
          notes: 'مواعيد مسائية معتمدة (فردي أو مجموعة)',
        };
      });
    } else if (presetType === 'WEEKEND_CIRCLES') {
      const days: WeekDay[] = ['FRIDAY', 'SATURDAY'];
      presetSlots = days.map((day, idx) => {
        const dObj = WEEK_DAYS.find(d => d.key === day);
        return {
          id: `preset-wknd-${Date.now()}-${idx}`,
          day,
          dayArabic: dObj?.labelAr,
          startTime: '16:00',
          endTime: '18:30',
          timeZoneLabel: 'توقيت القاهرة (Cairo Time - CLT / GMT+2)',
          studyType: 'GROUP',
          maxStudents: 6,
          isAvailable: true,
          notes: 'حلقات إجازة وتجويد عطلة نهاية الأسبوع',
        };
      });
    } else if (presetType === 'DAILY_AFTERNOON') {
      const days: WeekDay[] = ['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'];
      presetSlots = days.map((day, idx) => {
        const dObj = WEEK_DAYS.find(d => d.key === day);
        return {
          id: `preset-aft-${Date.now()}-${idx}`,
          day,
          dayArabic: dObj?.labelAr,
          startTime: '15:00',
          endTime: '17:00',
          timeZoneLabel: 'توقيت القاهرة (Cairo Time - CLT / GMT+2)',
          studyType: 'PRIVATE',
          isAvailable: true,
          notes: 'جلسات تسميع فردي خاصة',
        };
      });
    }

    const merged = [...slots, ...presetSlots];
    saveSlots(merged);
    showNotification(isRTL ? 'تم تطبيق القالب الجاهز وإضافته للجدول' : 'Schedule preset applied successfully');
  };

  // Filtered Slots
  const filteredSlots = slots.filter(s => {
    const dayMatch = selectedDay === 'ALL' || s.day === selectedDay;
    const studyMatch =
      selectedStudyFilter === 'ALL' ||
      s.studyType === 'BOTH' ||
      s.studyType === selectedStudyFilter;
    return dayMatch && studyMatch;
  });

  // Calculate stats
  const activeSlotsCount = slots.filter(s => s.isAvailable).length;
  const privateSlotsCount = slots.filter(s => s.isAvailable && (s.studyType === 'PRIVATE' || s.studyType === 'BOTH')).length;
  const groupSlotsCount = slots.filter(s => s.isAvailable && (s.studyType === 'GROUP' || s.studyType === 'BOTH')).length;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#29235D]/10 shadow-sm space-y-6">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
            {isRTL ? 'متزامن لحظياً' : 'Live Synced'}
          </span>
        </div>
      )}

      {/* Header & Cairo Timezone Indicator */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#29235D] text-[#D3B673] flex items-center justify-center shadow-xs">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#29235D] font-serif">
                {isRTL ? 'جدول المواعيد الأسبوعي المتاح للحجز (توقيت القاهرة)' : 'Weekly Cairo Time Availability Calendar'}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {isRTL
                  ? 'حدد أوقات فراغك وحصصك المتاحة ليتمكن الطلاب والزوار من حجزها فورياً بتوقيت القاهرة الرسمي.'
                  : 'Manage your weekly teaching slots in Cairo Time (CLT / GMT+2) for instant student booking.'}
              </p>
            </div>
          </div>
        </div>

        {/* Cairo Clock & Quick Add Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Cairo Clock Widget */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#F8F6F0] border border-[#D3B673]/40 text-[#29235D]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <Clock className="w-4 h-4 text-[#D3B673]" />
            <div className="text-left rtl:text-right">
              <span className="text-[10px] font-bold text-amber-800 uppercase block leading-none">
                🇪🇬 CLT (GMT+2)
              </span>
              <span className="text-xs font-mono font-black text-[#29235D]">
                {cairoTimeStr || 'Cairo Time'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-[#D3B673]/40 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#D3B673]" />
            <span>{isRTL ? 'إضافة موعد جديد' : 'Add Time Slot'}</span>
          </button>
        </div>
      </div>

      {/* Quick Schedule Statistics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-[#FBF9F4] border border-[#29235D]/10">
          <span className="text-[11px] text-gray-500 block font-medium">{isRTL ? 'إجمالي المواعيد' : 'Total Slots'}</span>
          <span className="text-lg font-black text-[#29235D]">{slots.length}</span>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200">
          <span className="text-[11px] text-emerald-800 block font-medium">{isRTL ? 'مواعيد متاحة للحجز' : 'Active & Bookable'}</span>
          <span className="text-lg font-black text-emerald-900">{activeSlotsCount}</span>
        </div>

        <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-200">
          <span className="text-[11px] text-indigo-800 block font-medium">{isRTL ? 'حصص خاصة (1-on-1)' : 'Private 1-on-1'}</span>
          <span className="text-lg font-black text-indigo-900">{privateSlotsCount}</span>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200">
          <span className="text-[11px] text-amber-800 block font-medium">{isRTL ? 'مجموعات تفاعلية' : 'Group Classes'}</span>
          <span className="text-lg font-black text-amber-900">{groupSlotsCount}</span>
        </div>
      </div>

      {/* Quick Presets Drawer */}
      <div className="bg-[#F8F6F0] p-3.5 rounded-2xl border border-[#29235D]/10 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#29235D]">
          <Zap className="w-3.5 h-3.5 text-[#D3B673]" />
          <span>{isRTL ? 'قوالب جدول جاهزة ومقترحة (بنقرة واحدة):' : 'One-Click Cairo Schedule Presets:'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleApplyPreset('EVENING_3DAYS')}
            className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#D3B673] text-[11px] font-bold text-[#29235D] transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>🌙 {isRTL ? 'أحد / ثلاثاء / خميس (18:00 - 20:00)' : 'Sun/Tue/Thu (18:00 - 20:00)'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('WEEKEND_CIRCLES')}
            className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#D3B673] text-[11px] font-bold text-[#29235D] transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>🕌 {isRTL ? 'حلقات نهاية الأسبوع الجمعة والسبت (16:00 - 18:30)' : 'Fri/Sat Circles (16:00 - 18:30)'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('DAILY_AFTERNOON')}
            className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-[#D3B673] text-[11px] font-bold text-[#29235D] transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>☀️ {isRTL ? 'جلسات يومية بعد الظهر (15:00 - 17:00)' : 'Daily Afternoon (15:00 - 17:00)'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs: Days of the Week */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#29235D]">{isRTL ? 'تصفية حسب اليوم:' : 'Filter by Day:'}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedStudyFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedStudyFilter === 'ALL' ? 'bg-[#29235D] text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isRTL ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setSelectedStudyFilter('PRIVATE')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedStudyFilter === 'PRIVATE' ? 'bg-[#29235D] text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isRTL ? 'خاص 1-on-1' : 'Private'}
            </button>
            <button
              onClick={() => setSelectedStudyFilter('GROUP')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                selectedStudyFilter === 'GROUP' ? 'bg-[#29235D] text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isRTL ? 'مجموعة' : 'Group'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedDay('ALL')}
            className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
              selectedDay === 'ALL'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-[#FBF9F4]'
            }`}
          >
            {isRTL ? 'جميع الأيام' : 'All Days'}
            <span className="block text-[10px] opacity-70">({slots.length})</span>
          </button>

          {WEEK_DAYS.map(d => {
            const count = slots.filter(s => s.day === d.key).length;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setSelectedDay(d.key)}
                className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  selectedDay === d.key
                    ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-[#FBF9F4]'
                }`}
              >
                {isRTL ? d.shortAr : d.shortEn}
                <span className="block text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Weekly Visual Schedule Grid / List */}
      <div className="space-y-3">
        {filteredSlots.length === 0 ? (
          <div className="p-8 text-center bg-[#FBF9F4] rounded-3xl border border-dashed border-gray-300 space-y-3">
            <Calendar className="w-10 h-10 text-gray-400 mx-auto" />
            <p className="text-xs sm:text-sm font-bold text-gray-600">
              {isRTL
                ? 'لا توجد مواعيد مضافة في هذا التصنيف. أضف موعداً جديداً بتوقيت القاهرة.'
                : 'No slots configured for this selection. Click "+ Add Time Slot" to schedule.'}
            </p>
            <button
              type="button"
              onClick={() => {
                if (selectedDay !== 'ALL') setTargetDay(selectedDay);
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#29235D] text-[#D3B673] text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isRTL ? 'إضافة موعد لهذا اليوم' : 'Add Slot for this day'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredSlots.map(slot => {
              const dayObj = WEEK_DAYS.find(d => d.key === slot.day);

              return (
                <div
                  key={slot.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                    slot.isAvailable
                      ? 'bg-white border-[#29235D]/15 shadow-xs hover:border-[#D3B673]'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-black bg-[#29235D] text-white">
                          {slot.dayArabic || dayObj?.labelAr || slot.day}
                        </span>
                        <span className="font-mono text-xs font-black text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300">
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <span className="text-[10px] text-gray-500 font-semibold">🇪🇬 توقيت القاهرة</span>
                        <span className="text-gray-300">•</span>
                        <span className="font-bold text-[#29235D] flex items-center gap-1">
                          {slot.studyType === 'PRIVATE' ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-[#D3B673]" />
                              <span>{isRTL ? 'خاص فردي (1-on-1)' : 'Private 1-on-1'}</span>
                            </>
                          ) : slot.studyType === 'GROUP' ? (
                            <>
                              <Users className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{isRTL ? `مجموعة (${slot.maxStudents || 6} طلاب)` : `Group (${slot.maxStudents || 6} max)`}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>{isRTL ? 'متاح للخاص والمجموعات' : 'Both Private & Group'}</span>
                            </>
                          )}
                        </span>
                      </div>

                      {slot.notes && (
                        <p className="text-[11px] text-gray-600 bg-[#FBF9F4] p-1.5 rounded-lg border border-gray-100 mt-1">
                          📝 {slot.notes}
                        </p>
                      )}
                    </div>

                    {/* Quick Action Toggle & Delete */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleSlot(slot.id)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                          slot.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                        }`}
                        title={isRTL ? 'تبديل إتاحة الموعد للطلاب' : 'Toggle student availability'}
                      >
                        {slot.isAvailable ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>{isRTL ? 'متاح' : 'Open'}</span>
                          </>
                        ) : (
                          <>
                            <span className="w-2 h-2 rounded-full bg-gray-400" />
                            <span>{isRTL ? 'معطل' : 'Paused'}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
                        title={isRTL ? 'حذف الموعد' : 'Delete slot'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Slot Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#29235D]/15 shadow-2xl overflow-hidden my-6">
            
            {/* Modal Header */}
            <div className="bg-[#29235D] text-white p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#D3B673]/20 border border-[#D3B673]/40 flex items-center justify-center text-[#D3B673]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      {isRTL ? 'إضافة موعد متاح جديد بتوقيت القاهرة' : 'Add Cairo Availability Slot'}
                    </h4>
                    <p className="text-[11px] text-[#D3B673]">
                      🇪🇬 Cairo Standard Time (CLT / GMT+2)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddNewSlot} className="p-5 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-[#29235D] mb-1">
                  {isRTL ? 'يوم الحصة' : 'Day of Week'}
                </label>
                <select
                  value={targetDay}
                  onChange={e => setTargetDay(e.target.value as WeekDay)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-[#FBF9F4] text-xs sm:text-sm font-bold text-[#29235D] outline-none"
                >
                  {WEEK_DAYS.map(d => (
                    <option key={d.key} value={d.key}>
                      {isRTL ? d.labelAr : d.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#29235D] mb-1">
                    {isRTL ? 'من (توقيت القاهرة) *' : 'Start Time (Cairo) *'}
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm font-bold text-[#29235D] outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#29235D] mb-1">
                    {isRTL ? 'إلى (توقيت القاهرة) *' : 'End Time (Cairo) *'}
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm font-bold text-[#29235D] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#29235D] mb-1">
                  {isRTL ? 'نوع الدراسة المتاحة في هذا الموعد' : 'Study Mode'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStudyType('BOTH')}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                      studyType === 'BOTH'
                        ? 'bg-[#29235D] text-[#D3B673] border-[#29235D]'
                        : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    🌟 {isRTL ? 'خاص ومجموعة' : 'Both'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudyType('PRIVATE')}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                      studyType === 'PRIVATE'
                        ? 'bg-[#29235D] text-[#D3B673] border-[#29235D]'
                        : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    👤 {isRTL ? 'خاص (1-on-1)' : 'Private 1-on-1'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudyType('GROUP')}
                    className={`p-2 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                      studyType === 'GROUP'
                        ? 'bg-[#29235D] text-[#D3B673] border-[#29235D]'
                        : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    👥 {isRTL ? 'مجموعة تفاعلية' : 'Group Class'}
                  </button>
                </div>
              </div>

              {studyType !== 'PRIVATE' && (
                <div>
                  <label className="block text-xs font-bold text-[#29235D] mb-1">
                    {isRTL ? 'الحد الأقصى للطلاب في المجموعة' : 'Max Students in Group'}
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={maxStudents}
                    onChange={e => setMaxStudents(parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-[#29235D] outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#29235D] mb-1">
                  {isRTL ? 'ملاحظة أو تخصص الحصة (اختياري)' : 'Notes / Special Focus (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder={isRTL ? 'مثال: جلسات تسميع سورة البقرة، تصحيح مخارج الحروف' : 'e.g. Recitation & Tajweed mastery'}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs text-[#29235D] outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#29235D] text-[#D3B673] hover:bg-[#1D1845] border border-[#D3B673]/40 shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'حفظ ونشر الموعد فوراً' : 'Save & Publish Slot'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
