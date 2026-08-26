import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { Lesson } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle,
  FileText,
  Video,
  Sparkles,
  Gamepad2,
  Presentation,
  Play,
  Edit,
  Trash2,
} from 'lucide-react';

interface LessonBuilderViewProps {
  onNavigateTab: (tab: string) => void;
}

export const LessonBuilderView: React.FC<LessonBuilderViewProps> = ({ onNavigateTab }) => {
  const { lessons, programs, addLesson, currentUser, activities, hasTeacherPermission } = useApp();
  const { t, isRTL } = useI18n();

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProgramId, setNewProgramId] = useState(programs[0]?.id || '');
  const [newContent, setNewContent] = useState('');
  const [newObjectives, setNewObjectives] = useState('1. Master correct letter pronunciation\n2. Practice vocabulary in dialogue');

  const canCreate = hasTeacherPermission('canCreateLessons');
  const isTeacherOrAdmin =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'TEACHER';

  const filteredLessons = lessons.filter(
    l =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.titleArabic && l.titleArabic.includes(searchQuery)) ||
      l.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    addLesson({
      programId: newProgramId,
      unitNumber: lessons.length + 1,
      title: newTitle,
      titleArabic: newTitleAr,
      description: newDesc,
      objectives: newObjectives.split('\n').filter(Boolean),
      vocabulary: [
        { arabic: 'كِتَاب', transliteration: 'Kitab', meaning: 'Book', example: 'هَٰذَا كِتَابٌ جَمِيلٌ' },
        { arabic: 'قَلَم', transliteration: 'Qalam', meaning: 'Pen', example: 'كَتَبْتُ بِالْقَلَمِ' },
      ],
      grammarRules: [
        {
          ruleName: 'Demonstrative Pronoun: Hatha (هذا)',
          explanation: 'Used to point to masculine singular objects nearby.',
          examples: ['هذا طالب مجتهد', 'هذا مسجد'],
        },
      ],
      attachedActivityIds: activities.slice(0, 2).map(a => a.id),
      isPublished: true,
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewTitleAr('');
    setNewDesc('');
    setNewContent('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#29235D] to-[#1D1845] rounded-3xl p-6 sm:p-8 text-white border border-[#D3B673]/30 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D3B673]/20 text-[#E8D5A3] border border-[#D3B673]/40 mb-3">
              <BookOpen className="w-4 h-4 text-[#D3B673]" />
              Curriculum Units & Lesson Builder
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-wide">
              {t('lessons')}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-2xl leading-relaxed">
              Structured lesson materials, vocabulary flashcards, grammar breakdowns, and attached interactive activities.
            </p>
          </div>

          {isTeacherOrAdmin && (
            canCreate ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold text-xs flex items-center gap-2 transition-all shadow-md flex-shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isRTL ? 'إعداد درس جديد' : 'Create New Lesson'}</span>
              </button>
            ) : (
              <div
                className="px-4 py-2.5 rounded-2xl bg-white/10 text-white/50 font-medium text-xs flex items-center gap-1.5 border border-white/20 opacity-70 cursor-not-allowed"
                title={isRTL ? 'صلاحية بناء الدروس مقيدة من المشرف العام' : 'Lesson creation restricted by supervisor'}
              >
                <span>{isRTL ? 'إنشاء الدروس مقيّد' : 'Creation Restricted'}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Lesson List Column */}
        <div className="md:col-span-1 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter lessons..."
              className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#29235D] focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
            />
          </div>

          <div className="space-y-2">
            {filteredLessons.map(lesson => {
              const isSelected = selectedLesson?.id === lesson.id;
              return (
                <div
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#29235D] text-white border-[#D3B673] shadow-md'
                      : 'bg-white text-[#29235D] border-[#29235D]/10 hover:border-[#D3B673]/60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                        isSelected ? 'bg-[#D3B673] text-[#29235D]' : 'bg-[#F8F6F0] text-[#29235D]'
                      }`}
                    >
                      {lesson.code}
                    </span>
                    <span className="text-[10px] font-semibold opacity-70">
                      Unit {lesson.unitNumber}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold font-serif line-clamp-2">
                    {isRTL ? lesson.titleArabic || lesson.title : lesson.title}
                  </h4>
                  <p className={`text-[11px] mt-1 line-clamp-1 ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                    {lesson.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Lesson Viewer Column */}
        <div className="md:col-span-2">
          {selectedLesson || lessons[0] ? (
            (() => {
              const current = selectedLesson || lessons[0];
              return (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#29235D]/10 shadow-xs space-y-6">
                  
                  {/* Top Bar */}
                  <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#29235D] text-[#D3B673]">
                          {current.code}
                        </span>
                        <span className="text-xs font-bold text-gray-500">Unit {current.unitNumber}</span>
                      </div>
                      <h2 className="text-xl font-bold text-[#29235D] font-serif mt-2">
                        {isRTL ? current.titleArabic || current.title : current.title}
                      </h2>
                      <p className="text-xs text-gray-600 mt-1">{current.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigateTab('whiteboard')}
                        className="p-2 rounded-xl bg-[#F8F6F0] hover:bg-[#F1ECE1] text-[#29235D] transition-all"
                        title="Teach on Whiteboard"
                      >
                        <Presentation className="w-4 h-4 text-[#D3B673]" />
                      </button>
                    </div>
                  </div>

                  {/* Objectives */}
                  {current.objectives && current.objectives.length > 0 && (
                    <div className="bg-[#FBF9F4] p-4 rounded-2xl border border-gray-100 space-y-2">
                      <h4 className="text-xs font-bold text-[#29235D] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[#D3B673]" />
                        <span>Learning Objectives</span>
                      </h4>
                      <ul className="space-y-1 text-xs text-gray-600 list-disc list-inside">
                        {current.objectives.map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Vocabulary Flashcards */}
                  {current.vocabulary && current.vocabulary.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-[#29235D] uppercase tracking-wider">
                        Core Vocabulary & Terminology
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {current.vocabulary.map((voc, i) => (
                          <div
                            key={i}
                            className="p-4 rounded-2xl border border-gray-100 bg-[#F8F6F0] space-y-1.5"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xl font-bold font-arabic text-[#29235D]">
                                {voc.arabic}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400 font-bold">
                                {voc.transliteration}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-[#B89955]">{voc.meaning}</p>
                            {voc.example && (
                              <p className="text-[11px] font-arabic text-gray-600 italic bg-white p-2 rounded-lg border border-gray-100">
                                {voc.example}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attached Interactive Activities */}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-[#29235D] uppercase tracking-wider flex items-center gap-1.5">
                        <Gamepad2 className="w-4 h-4 text-[#D3B673]" />
                        <span>Interactive Exercises for this Lesson</span>
                      </h4>
                      <button
                        onClick={() => onNavigateTab('activities')}
                        className="text-xs font-bold text-[#29235D] hover:text-[#B89955]"
                      >
                        All Games →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activities.slice(0, 2).map(act => (
                        <div
                          key={act.id}
                          onClick={() => onNavigateTab('activities')}
                          className="p-3 rounded-xl border border-gray-200 hover:border-[#D3B673] flex items-center justify-between cursor-pointer group transition-all"
                        >
                          <div>
                            <span className="text-[9px] font-mono text-gray-400 font-bold">{act.code}</span>
                            <h5 className="text-xs font-bold text-[#29235D] group-hover:text-[#B89955]">
                              {act.name}
                            </h5>
                          </div>
                          <Play className="w-4 h-4 text-[#D3B673] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })()
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-xs text-gray-500">Select a lesson to view detailed curriculum materials.</p>
            </div>
          )}
        </div>

      </div>

      {/* Create Lesson Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 border border-[#29235D]/20 shadow-2xl">
            <h3 className="text-base font-bold text-[#29235D] font-serif">
              Add New Educational Lesson Unit
            </h3>
            <form onSubmit={handleCreateLesson} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#29235D] mb-1">Lesson Title (English)</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Unit 3: Conversational Arabic at the Airport"
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-[#29235D] mb-1">Lesson Title (Arabic)</label>
                <input
                  type="text"
                  value={newTitleAr}
                  onChange={e => setNewTitleAr(e.target.value)}
                  placeholder="الوحدة الثالثة: المحادثة في المطار"
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-arabic"
                />
              </div>
              <div>
                <label className="block font-bold text-[#29235D] mb-1">Program</label>
                <select
                  value={newProgramId}
                  onChange={e => setNewProgramId(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                >
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-[#29235D] mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Brief synopsis of what this lesson covers..."
                  rows={2}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-[#29235D] mb-1">Learning Objectives (One per line)</label>
                <textarea
                  value={newObjectives}
                  onChange={e => setNewObjectives(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#29235D] text-[#D3B673] font-bold rounded-xl"
                >
                  Publish Lesson
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
