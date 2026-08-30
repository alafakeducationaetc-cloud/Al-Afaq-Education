import React, { useState } from 'react';
import { useI18n } from '../../lib/i18n';
import { ClassSessionStatus } from '../../types';
import { COLOR_KEYS_CONFIG, COLOR_KEYS_ORDER, ColorKeyItem } from '../../lib/colorKeys';
import {
  Info,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles,
  BookOpen,
  UserCheck,
  GraduationCap,
  ShieldCheck,
  Check,
  Filter,
  X,
} from 'lucide-react';

interface ColorKeysGuideProps {
  selectedStatus?: string; // 'ALL' or ClassSessionStatus
  onSelectStatus?: (status: string) => void;
  showDetailsToggle?: boolean;
  compact?: boolean;
  statusCounts?: Partial<Record<ClassSessionStatus, number>>;
  userRole?: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';
}

export const ColorKeysGuide: React.FC<ColorKeysGuideProps> = ({
  selectedStatus = 'ALL',
  onSelectStatus,
  showDetailsToggle = true,
  compact = false,
  statusCounts,
  userRole = 'TEACHER',
}) => {
  const { isRTL, language } = useI18n();
  const [showModal, setShowModal] = useState(false);
  const [expandedKey, setExpandedKey] = useState<ClassSessionStatus | null>(null);

  const isStudent = userRole === 'STUDENT';
  const isTeacher = userRole === 'TEACHER';

  return (
    <div className="space-y-3">
      {/* Horizontal Color Keys Bar */}
      <div className="bg-white night:bg-[#18152E] rounded-2xl p-3 sm:p-4 border border-[#29235D]/10 night:border-[#393168] shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D3B673] animate-pulse" />
            <h4 className="text-xs font-bold text-[#29235D] night:text-[#E8D5A3] font-serif uppercase tracking-wider flex items-center gap-1.5">
              <span>{isRTL ? 'دليل الألوان وحالات الدروس (Color Keys)' : 'Color Keys & Attendance Guide'}</span>
            </h4>
            {selectedStatus !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D3B673] text-[#29235D]">
                {isRTL ? 'فلترة مفعلة' : 'Filter active'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onSelectStatus && selectedStatus !== 'ALL' && (
              <button
                onClick={() => onSelectStatus('ALL')}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <X className="w-3 h-3" />
                <span>{isRTL ? 'إلغاء الفلترة' : 'Clear filter'}</span>
              </button>
            )}

            {showDetailsToggle && (
              <button
                onClick={() => setShowModal(true)}
                className="px-2.5 py-1 rounded-xl bg-[#F8F6F0] night:bg-[#201C3D] hover:bg-[#F1ECE1] night:hover:bg-[#2A254F] text-[#29235D] night:text-[#E8D5A3] text-[11px] font-bold border border-[#29235D]/15 night:border-[#393168] flex items-center gap-1.5 transition-all cursor-pointer"
                title={isRTL ? 'فتح دليل الإرشادات وشرح الألوان بالتفصيل' : 'View Color Guide Explanations'}
              >
                <Info className="w-3.5 h-3.5 text-[#D3B673]" />
                <span>{isRTL ? 'شرح دليل الألوان الإرشادي' : 'Color Guide Legend'}</span>
              </button>
            )}
          </div>
        </div>

        {/* The Exact Pills Strip Matching Screenshot */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {onSelectStatus && (
            <button
              onClick={() => onSelectStatus('ALL')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                selectedStatus === 'ALL'
                  ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-sm ring-2 ring-[#D3B673]/50'
                  : 'bg-[#F8F6F0] night:bg-[#201C3D] text-[#786F9A] night:text-gray-300 border-gray-200 night:border-gray-700 hover:bg-white'
              }`}
            >
              {isRTL ? 'الكل' : 'All'}
            </button>
          )}

          {COLOR_KEYS_ORDER.map(statusKey => {
            const item = COLOR_KEYS_CONFIG[statusKey];
            const isSelected = selectedStatus === statusKey;
            const count = statusCounts ? statusCounts[statusKey] : undefined;

            return (
              <button
                key={statusKey}
                onClick={() => onSelectStatus && onSelectStatus(isSelected ? 'ALL' : statusKey)}
                title={`${item.labelAr} - ${item.meaningTeacherAr}`}
                style={{
                  backgroundColor: isSelected ? item.hex : item.hex,
                  color: '#FFFFFF',
                }}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-xs select-none hover:opacity-95 hover:scale-105 active:scale-95 ${
                  isSelected ? 'ring-3 ring-[#D3B673] shadow-md scale-105 z-10' : 'opacity-90 hover:opacity-100'
                }`}
              >
                {/* Visual Status Indicator / dot */}
                {statusKey === 'LIVE' && (
                  <span className="w-2 h-2 rounded-full bg-white animate-ping mr-0.5" />
                )}
                {statusKey === 'ABSENT' && (
                  <span className="text-[11px] mr-0.5">⚠️</span>
                )}

                <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>

                {count !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-extrabold bg-black/25 text-white">
                    {count}
                  </span>
                )}

                {isSelected && (
                  <Check className="w-3 h-3 text-white ml-0.5 stroke-[3]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Guide & Explanations Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white night:bg-[#18152E] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#D3B673]/30 shadow-2xl p-6 sm:p-8 space-y-6 text-[#29235D] night:text-[#E8D5A3]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 night:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#29235D] text-[#D3B673] flex items-center justify-center shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#29235D] night:text-white font-serif">
                    {isRTL ? 'دليل الألوان وحالات الحضور والغياب للدروس' : 'Color Keys & Class Attendance Legend'}
                  </h3>
                  <p className="text-xs text-gray-500 night:text-gray-400 mt-0.5">
                    {isRTL
                      ? 'دليل إرشادي شامل لكل لون ودلالته للمعلم والمتدرب وتأثيره على رصيد الحصص'
                      : 'Comprehensive reference for each color status, actions, and quota rules'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-xl bg-gray-100 night:bg-gray-800 hover:bg-gray-200 night:hover:bg-gray-700 text-gray-500 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Context Card */}
            <div className="bg-[#F8F6F0] night:bg-[#201C3D] p-4 rounded-2xl border border-[#29235D]/10 night:border-[#393168] flex items-start gap-3">
              <Info className="w-5 h-5 text-[#D3B673] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#29235D] night:text-gray-300 leading-relaxed">
                <p className="font-bold mb-0.5">
                  {isRTL ? '💡 آلية التلوين الذكي في منصة آفاق:' : '💡 Intelligent Color System:'}
                </p>
                <p>
                  {isRTL
                    ? 'كل حصة في الجدول والتقويم يُطبق عليها هذا اللون كشارة (Badge) وشريط جانبي، لتسهيل المتابعة الفورية للمعلم والطالب والإدارة ومعرفة الحصص المنجزة أو المؤجلة أو التي سجل فيها غياب.'
                    : 'Each lesson in the calendar displays its corresponding color badge and sidebar indicator for instant recognition of attended, running, missed, or absent lessons.'}
                </p>
              </div>
            </div>

            {/* All 8 Keys Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {COLOR_KEYS_ORDER.map(statusKey => {
                const item = COLOR_KEYS_CONFIG[statusKey];

                return (
                  <div
                    key={statusKey}
                    className="p-4 rounded-2xl border border-gray-200 night:border-gray-700/80 bg-white night:bg-[#1F1B3C] shadow-xs space-y-2.5 transition-all hover:border-[#D3B673]"
                  >
                    {/* Header with Exact Color Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        style={{ backgroundColor: item.hex }}
                        className="px-3.5 py-1 rounded-full text-xs font-bold text-white shadow-xs inline-flex items-center gap-1.5"
                      >
                        {statusKey === 'LIVE' && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
                        {item.labelEn} | {item.labelAr}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 font-bold">{statusKey}</span>
                    </div>

                    {/* Teacher Meaning */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-start gap-1.5 text-gray-700 night:text-gray-300">
                        <BookOpen className="w-3.5 h-3.5 text-[#29235D] night:text-[#D3B673] flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[#29235D] night:text-white">
                            {isRTL ? 'للمعلم: ' : 'Teacher View: '}
                          </span>
                          <span>{isRTL ? item.meaningTeacherAr : item.meaningEn}</span>
                        </div>
                      </div>

                      {/* Student Meaning */}
                      <div className="flex items-start gap-1.5 text-gray-600 night:text-gray-400">
                        <GraduationCap className="w-3.5 h-3.5 text-[#D3B673] flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[#D3B673]">
                            {isRTL ? 'للطالب: ' : 'Student View: '}
                          </span>
                          <span>{isRTL ? item.meaningStudentAr : item.meaningEn}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action & Policy */}
                    <div className="pt-2 border-t border-gray-100 night:border-gray-800 flex items-center justify-between text-[11px]">
                      <span className="text-gray-500 night:text-gray-400 italic">
                        {isRTL ? item.actionHintAr : item.actionHintEn}
                      </span>
                      {onSelectStatus && (
                        <button
                          onClick={() => {
                            onSelectStatus(statusKey);
                            setShowModal(false);
                          }}
                          className="px-2.5 py-0.5 rounded-lg bg-[#29235D] text-[#D3B673] font-bold text-[10px] hover:bg-[#1D1845] transition-colors cursor-pointer"
                        >
                          {isRTL ? 'عرض حصص هذا اللون' : 'Filter by this'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2.5 rounded-2xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {isRTL ? 'إغلاق الدليل' : 'Close Guide'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
