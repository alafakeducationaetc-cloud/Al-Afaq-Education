import React from 'react';
import { TeacherProfile } from '../../types';
import { PlatformTimetableCalendar } from '../calendar/PlatformTimetableCalendar';
import { X, Calendar } from 'lucide-react';
import { useI18n } from '../../lib/i18n';

interface TeacherAvailabilityModalProps {
  teacher: TeacherProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherAvailabilityModal: React.FC<TeacherAvailabilityModalProps> = ({
  teacher,
  isOpen,
  onClose,
}) => {
  const { isRTL } = useI18n();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-[#29235D]/15 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#29235D] text-white p-5 sm:p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D3B673]/20 border border-[#D3B673]/40 flex items-center justify-center text-[#D3B673]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white font-serif">
                {isRTL ? `جدول المواعيد والحصص: ${teacher.nameArabic || teacher.name}` : `Timetable & Availability: ${teacher.name}`}
              </h3>
              <p className="text-xs text-[#D3B673] font-medium mt-0.5">
                {isRTL ? teacher.specializationArabic || teacher.specialization : teacher.specialization} ({teacher.code})
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

        {/* Calendar Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <PlatformTimetableCalendar
            teacher={teacher}
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {isRTL ? 'إغلاق الجدول' : 'Close Timetable'}
          </button>
        </div>
      </div>
    </div>
  );
};
