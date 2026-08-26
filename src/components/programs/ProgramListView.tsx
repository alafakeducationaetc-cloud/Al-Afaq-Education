import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { Program } from '../../types';
import { ProgramEditModal } from './ProgramEditModal';
import {
  BookOpen,
  Users,
  Clock,
  Award,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Star,
  Search,
  Edit3,
} from 'lucide-react';

interface ProgramListViewProps {
  onNavigateTab: (tab: string) => void;
}

export const ProgramListView: React.FC<ProgramListViewProps> = ({ onNavigateTab }) => {
  const { programs, teachers, currentUser, addSubscription, subscriptions, hasTeacherPermission } = useApp();
  const { t, isRTL } = useI18n();

  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [enrollSuccess, setEnrollSuccess] = useState(false);

  const canEditProgram =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'ADMIN' ||
    hasTeacherPermission('canEditCurriculum');

  const filteredPrograms = programs.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameArabic && p.nameArabic.includes(searchQuery)) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleEnroll = (program: Program) => {
    if (!currentUser) return;
    addSubscription({
      studentId: currentUser.id,
      programId: program.id,
      teacherId: program.assignedTeacherIds[0] || 'usr-tea-1',
      startDate: '2026-09-01',
      endDate: '2026-12-01',
      totalSessions: program.totalSessions,
      attendedSessions: 0,
      remainingSessions: program.totalSessions,
      amount: program.price,
      status: 'ACTIVE',
      paymentStatus: 'PAID',
    });
    setEnrollSuccess(true);
    setTimeout(() => {
      setEnrollSuccess(false);
      setSelectedProgram(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#29235D] to-[#1D1845] rounded-3xl p-6 sm:p-8 text-white border border-[#D3B673]/30 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D3B673]/20 text-[#E8D5A3] border border-[#D3B673]/40 mb-3">
              <BookOpen className="w-4 h-4 text-[#D3B673]" />
              ALTEQ Academic Programs & Curriculum
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-wide">
              {t('programs')}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-2xl leading-relaxed">
              Comprehensive certified curriculums in Arabic for Non-Native Speakers, Holy Quran Memorization, and Precision Tajweed Rules.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#29235D]/10 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search programs by name or code..."
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 bg-[#FBF9F4] border border-gray-200 rounded-xl text-xs text-[#29235D] focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { label: 'All Programs', value: 'ALL' },
            { label: 'Arabic Language', value: 'ARABIC_LANGUAGE' },
            { label: 'Quran Recitation', value: 'QURAN' },
            { label: 'Tajweed Rules', value: 'TAJWEED' },
          ].map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                  : 'bg-[#F8F6F0] text-[#786F9A] hover:bg-[#F1ECE1]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map(program => {
          const assignedTeachersList = teachers.filter(t => program.assignedTeacherIds.includes(t.id));
          const isEnrolled = subscriptions.some(
            sub => sub.studentId === currentUser?.id && sub.programId === program.id && sub.status === 'ACTIVE'
          );

          return (
            <div
              key={program.id}
              className="bg-white rounded-3xl border border-[#29235D]/10 hover:border-[#D3B673] shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group"
            >
              {/* Image & Header */}
              <div>
                <div className="relative h-44 bg-[#1D1845] overflow-hidden">
                  <img
                    src={program.thumbnailUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600'}
                    alt={program.name}
                    className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1D1845] via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-[#29235D]/90 backdrop-blur-md text-[#D3B673] border border-[#D3B673]/40 text-[10px] font-bold">
                      {program.level}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/60 text-white font-mono text-[9px] font-bold">
                      {program.code}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 px-3 py-1 rounded-xl bg-[#D3B673] text-[#29235D] text-xs font-black shadow-md">
                    ${program.price} / term
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#29235D] font-serif group-hover:text-[#B89955] transition-colors">
                      {isRTL ? program.nameArabic || program.name : program.name}
                    </h3>
                    <p className="text-xs text-[#786F9A] mt-1.5 line-clamp-2 leading-relaxed">
                      {isRTL ? program.descriptionArabic || program.description : program.description}
                    </p>
                  </div>

                  {/* Highlights */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#D3B673]" />
                      <span>{program.totalSessions} Sessions</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#D3B673]" />
                      <span>ALTEQ Certificate</span>
                    </div>
                  </div>

                  {/* Teachers */}
                  {assignedTeachersList.length > 0 && (
                    <div className="flex items-center gap-2 pt-2 text-xs text-gray-500">
                      <span className="text-[11px] font-medium">Faculty:</span>
                      <div className="flex -space-x-1.5 rtl:space-x-reverse">
                        {assignedTeachersList.map(t => (
                          <img
                            key={t.id}
                            src={t.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                            alt={t.name}
                            className="w-6 h-6 rounded-full border border-white object-cover"
                            title={t.name}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-[#29235D]">
                        {assignedTeachersList[0]?.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button & Admin Controls */}
              <div className="p-5 pt-0 space-y-2">
                {canEditProgram && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProgram(program);
                    }}
                    className="w-full py-2 rounded-xl bg-[#D3B673]/15 hover:bg-[#D3B673]/25 text-[#29235D] text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-[#D3B673]/40 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#B89955]" />
                    <span>{isRTL ? 'تعديل بيانات البرنامج' : 'Edit Program'}</span>
                  </button>
                )}

                {isEnrolled ? (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{isRTL ? 'مشترك بالفعل' : 'Enrolled (Active Subscription)'}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedProgram(program)}
                    className="w-full py-2.5 rounded-xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs border border-[#D3B673]/30 cursor-pointer"
                  >
                    <span>{isRTL ? 'عرض المنهج والتسجيل' : 'View Curriculum & Enroll'}</span>
                    <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Program Modal */}
      {editingProgram && (
        <ProgramEditModal
          program={editingProgram}
          isOpen={!!editingProgram}
          onClose={() => setEditingProgram(null)}
          onSaved={() => {
            setEditingProgram(null);
          }}
        />
      )}

      {/* Program Details & Enrollment Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 border border-[#29235D]/20 shadow-2xl">
            
            {enrollSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isRTL ? 'تم تأكيد الاشتراك بنجاح!' : 'Subscription confirmed! You are now enrolled in this program.'}</span>
              </div>
            )}

            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#29235D] text-[#D3B673]">
                  {selectedProgram.code}
                </span>
                <h3 className="text-xl font-bold text-[#29235D] font-serif mt-1">
                  {isRTL ? selectedProgram.nameArabic || selectedProgram.name : selectedProgram.name}
                </h3>
                <p className="text-xs text-gray-500 font-arabic">{selectedProgram.nameArabic}</p>
              </div>
              <div className="flex items-center gap-2">
                {canEditProgram && (
                  <button
                    onClick={() => {
                      const prog = selectedProgram;
                      setSelectedProgram(null);
                      setEditingProgram(prog);
                    }}
                    className="px-3 py-1 rounded-xl bg-[#D3B673]/20 hover:bg-[#D3B673]/30 text-[#29235D] text-xs font-bold border border-[#D3B673]/50 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'تعديل' : 'Edit'}</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {isRTL ? selectedProgram.descriptionArabic || selectedProgram.description : selectedProgram.description}
            </p>

            {/* Program Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FBF9F4] p-4 rounded-2xl border border-gray-100 text-xs">
              <div>
                <p className="text-gray-400 text-[10px]">{isRTL ? 'المستوى' : 'Level'}</p>
                <p className="font-bold text-[#29235D]">{selectedProgram.level}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px]">{isRTL ? 'الحصص الحية' : 'Total Sessions'}</p>
                <p className="font-bold text-[#29235D]">{selectedProgram.totalSessions} {isRTL ? 'ساعة حية' : 'live hours'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px]">{isRTL ? 'المدة' : 'Duration'}</p>
                <p className="font-bold text-[#29235D]">{selectedProgram.durationMonths} {isRTL ? 'شهور' : 'Months'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-[10px]">{isRTL ? 'الرسوم' : 'Fee'}</p>
                <p className="font-bold text-[#B89955]">${selectedProgram.price} USD</p>
              </div>
            </div>

            {/* Curriculum Modules */}
            <div>
              <h4 className="text-xs font-bold text-[#29235D] uppercase tracking-wider mb-2">
                {isRTL ? 'محاور وخطة المنهج الأكاديمي' : 'Curriculum Core Modules'}
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Module 1: Foundational Vocabulary & Phonetic Articulation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Module 2: Practical Conversational Dialogues & Interactive Whiteboard Drills</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Module 3: Tajweed Mastery & Audio Evaluation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Module 4: Final Practical Assessment & Official AITEC Certification</span>
                </li>
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => handleEnroll(selectedProgram)}
                className="px-6 py-2.5 rounded-xl bg-[#29235D] text-[#D3B673] font-bold text-xs hover:bg-[#1D1845] border border-[#D3B673] shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>{isRTL ? 'تأكيد التسجيل في البرنامج' : 'Confirm Enrollment'}</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
