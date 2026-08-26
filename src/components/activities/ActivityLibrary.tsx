import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { Activity, ActivityCategory, ActivityLevel } from '../../types';
import { ActivityPlayer } from './ActivityPlayer';
import {
  Gamepad2,
  Search,
  Filter,
  Plus,
  Play,
  Star,
  BookOpen,
  Code2,
  Trash2,
  Edit,
  Sparkles,
  Award,
} from 'lucide-react';

export const ActivityLibrary: React.FC = () => {
  const { activities, addActivity, deleteActivity, currentUser, hasTeacherPermission } = useApp();
  const { t, isRTL } = useI18n();

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New activity form state
  const [newName, setNewName] = useState('');
  const [newNameArabic, setNewNameArabic] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<ActivityCategory>('ARABIC');
  const [newLevel, setNewLevel] = useState<ActivityLevel>('BEGINNER');
  const [newCodeHtml, setNewCodeHtml] = useState(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; background: #29235D; color: #fff; text-align: center; padding: 40px; }
    h1 { color: #D3B673; margin-bottom: 15px; }
    button { background: #D3B673; color: #29235D; border: none; padding: 12px 24px; font-weight: bold; border-radius: 12px; cursor: pointer; }
  </style>
</head>
<body>
  <h1>AITEC Custom Game</h1>
  <p style="margin-bottom: 20px;">Welcome to this interactive exercise!</p>
  <button onclick="alert('Great job!')">Click to interact</button>
</body>
</html>`);

  const canCreate = hasTeacherPermission('canCreateActivities');
  const isTeacherOrAdmin =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'TEACHER';

  const categories: { label: string; value: string }[] = [
    { label: t('all'), value: 'ALL' },
    { label: 'Arabic Language', value: 'ARABIC' },
    { label: 'Quran Recitation', value: 'QURAN' },
    { label: 'Tajweed Mastery', value: 'TAJWEED' },
    { label: 'Vocabulary', value: 'VOCABULARY' },
    { label: 'Grammar', value: 'GRAMMAR' },
    { label: 'Games', value: 'GAMES' },
  ];

  const filteredActivities = activities.filter(act => {
    const matchSearch =
      act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.nameArabic && act.nameArabic.includes(searchQuery)) ||
      act.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'ALL' || act.category === selectedCategory;
    const matchLevel = selectedLevel === 'ALL' || act.level === selectedLevel;
    return matchSearch && matchCategory && matchLevel;
  });

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    addActivity({
      name: newName,
      nameArabic: newNameArabic,
      description: newDesc,
      category: newCategory,
      level: newLevel,
      language: 'BILINGUAL',
      customCodeHtml: newCodeHtml,
      status: 'PUBLISHED',
      creatorId: currentUser?.id || 'usr-adm-1',
      creatorName: currentUser?.name || 'Admin',
      assignedProgramIds: [],
      assignedTeacherIds: currentUser?.role === 'TEACHER' ? [currentUser.id] : [],
      rating: 5.0,
    });
    setShowCreateModal(false);
    setNewName('');
    setNewNameArabic('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      
      {/* If playing an activity, show player */}
      {selectedActivity ? (
        <ActivityPlayer
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      ) : (
        <>
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#29235D] to-[#1D1845] rounded-3xl p-6 sm:p-8 text-white border border-[#D3B673]/30 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#D3B673]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D3B673]/20 text-[#E8D5A3] border border-[#D3B673]/40 mb-3">
                  <Gamepad2 className="w-4 h-4 text-[#D3B673]" />
                  ALTEQ Gamified EdTech Library
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-wide">
                  {t('activities')}
                </h1>
                <p className="text-xs sm:text-sm text-white/80 mt-1.5 max-w-2xl leading-relaxed">
                  Interactive games, letter pronunciation trainers, Tajweed sorting challenges, and Quran memorization puzzles designed to make Arabic learning exciting and memorable.
                </p>
              </div>

              {isTeacherOrAdmin && (
                canCreate ? (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold text-xs sm:text-sm transition-all shadow-md flex-shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRTL ? 'إنشاء لعبة تعليمية' : 'Create Custom Game'}</span>
                  </button>
                ) : (
                  <div
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 text-white/50 font-semibold text-xs border border-white/20 opacity-70 cursor-not-allowed"
                    title={isRTL ? 'صلاحية بناء الألعاب مقيدة من المشرف العام' : 'Game creation restricted by supervisor'}
                  >
                    <span>{isRTL ? 'إنشاء الألعاب مقيّد' : 'Creation Restricted'}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-[#29235D]/10 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('search')}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 bg-[#FBF9F4] border border-gray-200 rounded-xl text-xs text-[#29235D] focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {categories.map(cat => (
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

          {/* Activities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredActivities.map(activity => (
              <div
                key={activity.id}
                className="bg-white rounded-3xl border border-[#29235D]/10 hover:border-[#D3B673] shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col group"
              >
                {/* Thumbnail Image Header */}
                <div className="relative h-40 bg-gradient-to-br from-[#29235D] to-[#1D1845] overflow-hidden">
                  <img
                    src={activity.thumbnailUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400'}
                    alt={activity.name}
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1D1845] via-transparent to-transparent" />
                  
                  {/* Category badge */}
                  <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-[#29235D]/90 backdrop-blur-md text-[#D3B673] border border-[#D3B673]/40 text-[10px] font-bold">
                      {activity.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/60 text-white font-mono text-[9px] font-bold">
                      {activity.code}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#D3B673] text-[10px] font-bold">
                    <Star className="w-3 h-3 fill-[#D3B673]" />
                    <span>{activity.rating || '5.0'}</span>
                  </div>

                  {/* Play count */}
                  <div className="absolute bottom-2.5 left-3 rtl:left-auto rtl:right-3 text-[10px] font-semibold text-[#E8D5A3]">
                    {activity.playCount} student completions
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-[#29235D] font-serif group-hover:text-[#B89955] transition-colors line-clamp-1">
                      {isRTL ? activity.nameArabic || activity.name : activity.name}
                    </h3>
                    <p className="text-xs text-[#786F9A] mt-2 line-clamp-2 leading-relaxed">
                      {isRTL ? activity.descriptionArabic || activity.description : activity.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold text-gray-500">
                      By {activity.creatorName}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isTeacherOrAdmin && (
                        <button
                          onClick={() => deleteActivity(activity.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Activity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedActivity(activity)}
                        className="px-4 py-2 rounded-xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-[#D3B673]" />
                        <span>{t('play')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
              <Gamepad2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#29235D]">No interactive activities found</h3>
              <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or filters</p>
            </div>
          )}
        </>
      )}

      {/* Create Custom Activity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#29235D]/20 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-[#29235D] font-serif">
                  Create Interactive Educational Activity
                </h3>
                <p className="text-xs text-gray-500">
                  Embed custom interactive HTML/CSS/JavaScript games securely.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateActivity} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">Activity Name (English)</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Arabic Numbers & Colors Quiz"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">Activity Name (Arabic)</label>
                  <input
                    type="text"
                    value={newNameArabic}
                    onChange={e => setNewNameArabic(e.target.value)}
                    placeholder="مثال: لعبة الأرقام والألوان العربية"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-arabic focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#29235D] mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Describe the learning objective of this interactive exercise..."
                  rows={2}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as ActivityCategory)}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-medium"
                  >
                    <option value="ARABIC">Arabic Language</option>
                    <option value="QURAN">Quran</option>
                    <option value="TAJWEED">Tajweed</option>
                    <option value="VOCABULARY">Vocabulary</option>
                    <option value="GRAMMAR">Grammar</option>
                    <option value="GAMES">Games</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">Level</label>
                  <select
                    value={newLevel}
                    onChange={e => setNewLevel(e.target.value as ActivityLevel)}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-medium"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="ALL_LEVELS">All Levels</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-[#29235D]">
                    Custom HTML / CSS / JavaScript Code (Sandboxed)
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    🛡️ Isolated Sandbox Enforced
                  </span>
                </div>
                <textarea
                  value={newCodeHtml}
                  onChange={e => setNewCodeHtml(e.target.value)}
                  rows={8}
                  className="w-full p-3 bg-[#0F0D24] text-emerald-400 font-mono text-xs rounded-xl border border-gray-800 focus:outline-none focus:border-[#D3B673]"
                  spellCheck={false}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#29235D] text-[#D3B673] font-bold hover:bg-[#1D1845] border border-[#D3B673]"
                >
                  Publish Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
