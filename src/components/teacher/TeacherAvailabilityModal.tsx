import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { TeacherProfile, TeacherAvailabilitySlot, WeekDay, StudyMode } from '../../types';
import {
  X,
  Plus,
  Trash2,
  Clock,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Users,
  UserCheck,
  Globe,
  Sparkles,
} from 'lucide-react';

interface TeacherAvailabilityModalProps {
  teacher: TeacherProfile;
  isOpen: boolean;
  onClose: () => void;
}

const WEEK_DAYS: { key: WeekDay; labelAr: string; labelEn: string }[] = [
  { key: 'SATURDAY', labelAr: 'السبت', labelEn: 'Saturday' },
  { key: 'SUNDAY', labelAr: 'الأحد', labelEn: 'Sunday' },
  { key: 'MONDAY', labelAr: 'الإثنين', labelEn: 'Monday' },
  { key: 'TUESDAY', labelAr: 'الثلاثاء', labelEn: 'Tuesday' },
  { key: 'WEDNESDAY', labelAr: 'الأربعاء', labelEn: 'Wednesday' },
  { key: 'THURSDAY', labelAr: 'الخميس', labelEn: 'Thursday' },
  { key: 'FRIDAY', labelAr: 'الجمعة', labelEn: 'Friday' },
];

export const TeacherAvailabilityModal: React.FC<TeacherAvailabilityModalProps> = ({
  teacher,
  isOpen,
  onClose,
}) => {
  const { updateTeacherAvailability } = useApp();
  const { isRTL } = useI18n();

  const [slots, setSlots] = useState<TeacherAvailabilitySlot[]>(
    teacher.availabilitySlots || []
  );
  const [showSavedToast, setShowSavedToast] = useState(false);

  // New slot form state
  const [newDay, setNewDay] = useState<WeekDay>('SUNDAY');
  const [newStartTime, setNewStartTime] = useState<string>('18:00');
  const [newEndTime, setNewEndTime] = useState<string>('20:00');
  const [newStudyType, setNewStudyType] = useState<'PRIVATE' | 'GROUP' | 'BOTH'>('BOTH');
  const [newNotes, setNewNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const dayObj = WEEK_DAYS.find(d => d.key === newDay);
    const newSlot: TeacherAvailabilitySlot = {
      id: `slot-${Date.now()}`,
      day: newDay,
      dayArabic: dayObj?.labelAr,
      startTime: newStartTime,
      endTime: newEndTime,
      timeZoneLabel: 'توقيت القاهرة (Cairo Time - CLT / GMT+2)',
      studyType: newStudyType,
      isAvailable: true,
      notes: newNotes.trim() || undefined,
    };

    setSlots(prev => [...prev, newSlot]);
    setNewNotes('');
  };

  const handleRemoveSlot = (id: string) => {
    setSlots(prev => prev.filter(s => s.id !== id));
  };

  const handleToggleSlotAvailable = (id: string) => {
    setSlots(prev =>
      prev.map(s => (s.id === id ? { ...s, isAvailable: !s.isAvailable } : s))
    );
  };

  const handleSaveAll = () => {
    updateTeacherAvailability(teacher.id, slots);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#29235D]/15 shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-[#29235D] text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#D3B673]/20 border border-[#D3B673]/40 flex items-center justify-center text-[#D3B673]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {isRTL ? 'جدول المواعيد المتاحة للمعلم (توقيت القاهرة)' : 'Teacher Availability & Timetable (Cairo Time)'}
                </h3>
                <p className="text-xs text-[#D3B673] font-medium mt-0.5">
                  {isRTL ? teacher.nameArabic || teacher.name : teacher.name} — 🇪🇬 CLT (GMT+2)
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

        {/* Body */}
        <div className="p-5 sm:p-7 space-y-6">
          
          {/* Cairo Timezone Badge */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FBF9F4] border border-[#D3B673]/30 text-xs">
            <div className="flex items-center gap-2 text-[#29235D] font-bold">
              <Globe className="w-4 h-4 text-[#D3B673]" />
              <span>{isRTL ? 'التوقيت المعتمد الرسمي:' : 'Official Platform Timezone:'}</span>
              <span className="text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md font-mono">
                🇪🇬 Cairo (GMT+2) CLT
              </span>
            </div>
            <span className="text-gray-500 text-[11px] font-medium">
              {isRTL ? 'يظهر للطلاب والزوار للتسجيل الفوري' : 'Visible on public profile'}
            </span>
          </div>

          {/* Existing Slots List */}
          <div>
            <h4 className="text-xs font-bold text-[#29235D] uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>{isRTL ? 'المواعيد والحصص المحددة حالياً' : 'Configured Availability Slots'}</span>
              <span className="text-xs font-semibold text-gray-500">({slots.length})</span>
            </h4>

            {slots.length === 0 ? (
              <div className="p-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-medium">
                  {isRTL ? 'لم يتم إضافة مواعيد متاحة بعد. أضف موعداً أدناه.' : 'No slots added yet. Add one below.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {slots.map(slot => (
                  <div
                    key={slot.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      slot.isAvailable
                        ? 'bg-white border-gray-200 shadow-2xs'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleSlotAvailable(slot.id)}
                        className={`w-3.5 h-3.5 rounded-full border-2 transition-all cursor-pointer ${
                          slot.isAvailable
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'bg-transparent border-gray-400'
                        }`}
                        title={slot.isAvailable ? 'Available' : 'Unavailable'}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#29235D]">
                            {slot.dayArabic || slot.day}
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className="text-[10px] font-semibold text-gray-500 px-1.5 py-0.2 rounded bg-gray-100">
                            {slot.studyType === 'PRIVATE'
                              ? '👤 خاص فقط'
                              : slot.studyType === 'GROUP'
                              ? '👥 مجموعة'
                              : '🌟 خاص ومجموعة'}
                          </span>
                        </div>
                        {slot.notes && (
                          <p className="text-[11px] text-gray-500 mt-0.5">{slot.notes}</p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                      title="Delete slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Slot Form */}
          <form onSubmit={handleAddSlot} className="p-4 rounded-2xl bg-[#F8F6F0] border border-[#29235D]/10 space-y-3">
            <h5 className="text-xs font-bold text-[#29235D] flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-[#D3B673]" />
              <span>{isRTL ? 'إضافة موعد جديد بتوقيت القاهرة' : 'Add New Cairo Time Slot'}</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">{isRTL ? 'اليوم' : 'Day'}</label>
                <select
                  value={newDay}
                  onChange={e => setNewDay(e.target.value as WeekDay)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-bold text-[#29235D] outline-none"
                >
                  {WEEK_DAYS.map(d => (
                    <option key={d.key} value={d.key}>
                      {isRTL ? d.labelAr : d.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-gray-500 mb-1">{isRTL ? 'من (توقيت القاهرة)' : 'From (Cairo)'}</label>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={e => setNewStartTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-bold text-[#29235D] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-gray-500 mb-1">{isRTL ? 'إلى (توقيت القاهرة)' : 'To (Cairo)'}</label>
                <input
                  type="time"
                  value={newEndTime}
                  onChange={e => setNewEndTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-bold text-[#29235D] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">{isRTL ? 'نوع الدراسة المتاحة' : 'Study Mode'}</label>
                <select
                  value={newStudyType}
                  onChange={e => setNewStudyType(e.target.value as 'PRIVATE' | 'GROUP' | 'BOTH')}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-bold text-[#29235D] outline-none"
                >
                  <option value="BOTH">{isRTL ? 'متاح للدروس الفردية والمجموعات' : 'Both (Private & Group)'}</option>
                  <option value="PRIVATE">{isRTL ? 'دراسة خاصة فردية فقط (1-on-1)' : 'Private Tutoring Only'}</option>
                  <option value="GROUP">{isRTL ? 'مجموعة تفاعلية فقط' : 'Group Class Only'}</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-gray-500 mb-1">{isRTL ? 'ملاحظة أو تخصص الحصة' : 'Notes (Optional)'}</label>
                <input
                  type="text"
                  placeholder={isRTL ? 'مثال: تسميع وإجازة قرآنية' : 'e.g. Recitation & Tajweed'}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-[#29235D] outline-none"
                />
              </div>
            </div>

            <div className="text-right rtl:text-left pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#29235D] text-[#D3B673] hover:bg-[#1D1845] transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRTL ? 'إدراج الموعد في الجدول' : 'Insert Slot'}</span>
              </button>
            </div>
          </form>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#29235D] text-[#D3B673] hover:bg-[#1D1845] border border-[#D3B673]/40 shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              {showSavedToast ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
              <span>{showSavedToast ? (isRTL ? 'تم حفظ الجدول بنجاح!' : 'Saved!') : (isRTL ? 'حفظ وتحديث الجدول المعتمد' : 'Save Timetable')}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
