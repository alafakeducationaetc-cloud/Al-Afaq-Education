import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { Program, ProgramCategory, ProgramLevel } from '../../types';
import {
  BookOpen,
  X,
  Save,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Calendar,
  Layers,
  Users,
  Upload,
  CheckCircle2,
  Sparkles,
  Award,
  Globe,
  Tag,
  Crown,
} from 'lucide-react';

interface ProgramEditModalProps {
  program: Program;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const PROGRAM_THUMBNAIL_PRESETS = [
  {
    name: 'Quran & Tajweed Classic',
    url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Arabic Calligraphy & Script',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Modern Classroom & Study',
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Library & Classical Manuscripts',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Islamic Architecture & Heritage',
    url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Interactive Digital Tablet Learning',
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
  },
];

export const ProgramEditModal: React.FC<ProgramEditModalProps> = ({
  program,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { updateProgram, teachers } = useApp();
  const { isRTL, t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(program.name || '');
  const [nameArabic, setNameArabic] = useState(program.nameArabic || '');
  const [description, setDescription] = useState(program.description || '');
  const [descriptionArabic, setDescriptionArabic] = useState(program.descriptionArabic || '');
  const [category, setCategory] = useState<ProgramCategory>(program.category || 'ARABIC_LANGUAGE');
  const [level, setLevel] = useState<ProgramLevel>(program.level || 'BEGINNER');
  const [price, setPrice] = useState<number>(program.price || 0);
  const [currency, setCurrency] = useState<string>(program.currency || 'USD');
  const [durationMonths, setDurationMonths] = useState<number>(program.durationMonths || 3);
  const [totalSessions, setTotalSessions] = useState<number>(program.totalSessions || 24);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState<number>(
    program.sessionDurationMinutes || 60
  );
  const [status, setStatus] = useState<'ACTIVE' | 'UPCOMING' | 'ARCHIVED'>(
    program.status || 'ACTIVE'
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(program.thumbnailUrl || '');
  const [assignedTeacherIds, setAssignedTeacherIds] = useState<string[]>(
    program.assignedTeacherIds || []
  );

  const [activeTab, setActiveTab] = useState<'info' | 'pricing' | 'faculty' | 'media'>('info');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setThumbnailUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTeacher = (teacherId: string) => {
    setAssignedTeacherIds(prev =>
      prev.includes(teacherId) ? prev.filter(id => id !== teacherId) : [...prev, teacherId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProgram(program.id, {
      name: name.trim(),
      nameArabic: nameArabic.trim(),
      description: description.trim(),
      descriptionArabic: descriptionArabic.trim(),
      category,
      level,
      price: Number(price),
      currency,
      durationMonths: Number(durationMonths),
      totalSessions: Number(totalSessions),
      sessionDurationMinutes: Number(sessionDurationMinutes),
      status,
      thumbnailUrl: thumbnailUrl.trim(),
      assignedTeacherIds,
    });

    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      if (onSaved) onSaved();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#29235D]/20 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#29235D] via-[#1D1845] to-[#29235D] text-white p-5 sm:p-6 flex justify-between items-center relative overflow-hidden border-b border-[#D3B673]/30">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-[#D3B673]/20 border border-[#D3B673]/40 flex items-center justify-center text-[#E8D5A3]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#D3B673] text-[#29235D] text-[10px] font-black uppercase">
                  {program.code}
                </span>
                <span className="text-xs text-[#E8D5A3] font-medium">
                  {isRTL ? 'تعديل البرنامج التعليمي' : 'Curriculum & Program Editor'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-white mt-0.5">
                {isRTL ? nameArabic || name : name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-[#FBF9F4] px-4 sm:px-6 gap-2 overflow-x-auto">
          {[
            { id: 'info', labelEn: 'General & Description', labelAr: 'المعلومات والوصف', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'pricing', labelEn: 'Fees & Schedule', labelAr: 'الرسوم والجدولة', icon: <DollarSign className="w-3.5 h-3.5" /> },
            { id: 'faculty', labelEn: 'Assigned Faculty', labelAr: 'هيئة التدريس', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'media', labelEn: 'Cover Thumbnail', labelAr: 'صورة الغلاف', icon: <ImageIcon className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-[#29235D] text-[#29235D]'
                  : 'border-transparent text-gray-500 hover:text-[#29235D]'
              }`}
            >
              {tab.icon}
              <span>{isRTL ? tab.labelAr : tab.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Success Alert */}
        {isSavedNotice && (
          <div className="m-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              {isRTL
                ? 'تم حفظ وتحديث بيانات البرنامج الأكاديمي بنجاح في المنصة!'
                : 'Program details and curriculum updated successfully!'}
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* TAB 1: INFO */}
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    Program Title (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Classical Arabic for Adults"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl text-[#29235D] font-medium focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    عنوان البرنامج (بالعربية) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nameArabic}
                    onChange={e => setNameArabic(e.target.value)}
                    placeholder="مثال: تعليم اللغة العربية لغير الناطقين بها"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl text-[#29235D] font-arabic font-bold focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'تصنيف المادة / المسار' : 'Category / Track'}
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ProgramCategory)}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl text-[#29235D] font-medium focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                  >
                    <option value="ARABIC_LANGUAGE">Arabic Language (اللغة العربية)</option>
                    <option value="QURAN_RECITATION">Quran Recitation (تلاوة القرآن الكريم)</option>
                    <option value="TAJWEED_MASTERY">Tajweed Mastery (أحكام التجويد)</option>
                    <option value="ISLAMIC_STUDIES">Islamic Studies (الدراسات الإسلامية)</option>
                    <option value="CONVERSATION">Conversation & Speech (المحادثة والتعبير)</option>
                    <option value="GRAMMAR_NAHW">Grammar & Syntax (النحو والصرف)</option>
                    <option value="READING_WRITING">Reading & Writing (القراءة والكتابة)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'المستوى الأكاديمي' : 'Academic Level'}
                  </label>
                  <select
                    value={level}
                    onChange={e => setLevel(e.target.value as ProgramLevel)}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl text-[#29235D] font-medium focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                  >
                    <option value="BEGINNER">Beginner (مبتدئ)</option>
                    <option value="ELEMENTARY">Elementary (تمهيدي)</option>
                    <option value="INTERMEDIATE">Intermediate (متوسط)</option>
                    <option value="ADVANCED">Advanced (متقدم)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'حالة البرنامج' : 'Program Status'}
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl text-[#29235D] font-medium focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                  >
                    <option value="ACTIVE">Active (نشط ومتاح للتسجيل)</option>
                    <option value="UPCOMING">Upcoming (قريباً)</option>
                    <option value="ARCHIVED">Archived (مؤرشف)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#29235D] mb-1">
                  Description & Syllabus (English)
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Detailed academic objectives, syllabus topics, expected outcomes..."
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl text-[#29235D] focus:ring-2 focus:ring-[#D3B673] focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-[#29235D] mb-1">
                  الوصف والمخرجات التعليمية (بالعربية)
                </label>
                <textarea
                  rows={3}
                  value={descriptionArabic}
                  onChange={e => setDescriptionArabic(e.target.value)}
                  placeholder="شرح أهداف الدورة، المحاور التفصيلية، المخرجات والمهارات المكتسبة..."
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl text-[#29235D] font-arabic focus:ring-2 focus:ring-[#D3B673] focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & SCHEDULE */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'الرسوم الدراسية ($ USD)' : 'Tuition Fee ($ USD)'}
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-[#D3B673] absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={0}
                      value={price}
                      onChange={e => setPrice(Number(e.target.value))}
                      className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl text-[#29235D] font-bold text-sm focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'مدة البرنامج بالشهور' : 'Duration (Months)'}
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#D3B673] absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={durationMonths}
                      onChange={e => setDurationMonths(Number(e.target.value))}
                      className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl text-[#29235D] font-bold text-sm focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'إجمالي عدد الحصص الحية' : 'Total Live Sessions'}
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-[#D3B673] absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={1}
                      value={totalSessions}
                      onChange={e => setTotalSessions(Number(e.target.value))}
                      className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl text-[#29235D] font-bold text-sm focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'مدة الحصة الواحدة (بالدقائق)' : 'Session Duration (Minutes)'}
                  </label>
                  <select
                    value={sessionDurationMinutes}
                    onChange={e => setSessionDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl text-[#29235D] font-medium focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes (Standard)</option>
                    <option value={90}>90 Minutes (Extended)</option>
                    <option value={120}>120 Minutes (Intensive)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5 text-amber-900">
                <Award className="w-4 h-4 text-[#B89955] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  {isRTL
                    ? 'سيتم منح شهادة إتمام معتمدة من مركز الآفاق الدولية (AITEC) فور إكمال المتعلم لجميع الحصص واجتياز التقييم النهائي.'
                    : 'Students completing this program will be eligible for an official AITEC Completion Certificate.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: FACULTY */}
          {activeTab === 'faculty' && (
            <div className="space-y-3">
              <p className="text-gray-500">
                {isRTL
                  ? 'اختر المعلمين والمدربين المعتمدين لتدريس هذا البرنامج الأكاديمي:'
                  : 'Select certified teachers and faculty members assigned to deliver this curriculum:'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {[...teachers]
                  .sort((a, b) => ((a.id === 'usr-adm-1' || a.code === 'ADM-0001') ? -1 : (b.id === 'usr-adm-1' || b.code === 'ADM-0001') ? 1 : 0))
                  .map(teacher => {
                    const isAssigned = assignedTeacherIds.includes(teacher.id);
                    const isSupervisor = teacher.id === 'usr-adm-1' || teacher.code === 'ADM-0001';
                    return (
                      <div
                        key={teacher.id}
                        onClick={() => toggleTeacher(teacher.id)}
                        className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                          isAssigned
                            ? 'bg-[#29235D]/5 border-[#29235D] shadow-xs'
                            : 'bg-[#FBF9F4] border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => {}}
                          className="rounded text-[#29235D] focus:ring-[#D3B673]"
                        />
                        <div className="relative shrink-0">
                          <img
                            src={teacher.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                            alt={teacher.name}
                            className="w-9 h-9 rounded-full object-cover border border-[#D3B673]"
                          />
                          {isSupervisor && (
                            <span className="absolute -top-1 -right-1 p-0.5 rounded-full bg-[#29235D] text-[#D3B673]">
                              <Crown className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-bold text-[#29235D] truncate">
                              {isRTL ? teacher.nameArabic || teacher.name : teacher.name}
                            </p>
                            {isSupervisor && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-[#D3B673]/20 text-[#29235D]">
                                {isRTL ? 'المشرف العام' : 'Supervisor'}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 font-mono truncate">{teacher.code}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 4: MEDIA & THUMBNAIL */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-[#29235D] mb-1">
                  {isRTL ? 'رابط صورة الغلاف (URL)' : 'Cover Image URL'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={e => setThumbnailUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl text-[#29235D] focus:ring-2 focus:ring-[#D3B673] focus:outline-none"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2.5 rounded-xl bg-[#29235D] text-[#D3B673] font-bold flex items-center gap-1.5 hover:bg-[#1D1845] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'رفع من الجهاز' : 'Upload Image'}</span>
                  </button>
                </div>
              </div>

              {/* Image Preview */}
              {thumbnailUrl && (
                <div className="relative h-40 rounded-2xl overflow-hidden border-2 border-[#D3B673]/50">
                  <img
                    src={thumbnailUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/70 text-[#D3B673] font-bold text-[10px]">
                    Live Preview
                  </div>
                </div>
              )}

              {/* Presets */}
              <div>
                <label className="block font-bold text-[#29235D] mb-2">
                  {isRTL ? 'أو اختر من المعرض الجاهز عالي الدقة:' : 'Or Select from High-Resolution Presets:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PROGRAM_THUMBNAIL_PRESETS.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => setThumbnailUrl(preset.url)}
                      className={`relative h-20 rounded-xl overflow-hidden border-2 cursor-pointer group transition-all ${
                        thumbnailUrl === preset.url
                          ? 'border-[#29235D] ring-2 ring-[#D3B673]'
                          : 'border-transparent hover:border-[#D3B673]'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-end p-1.5">
                        <span className="text-[9px] font-bold text-white leading-tight">
                          {preset.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all cursor-pointer"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#29235D] to-[#1D1845] text-[#D3B673] font-bold border border-[#D3B673] shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isRTL ? 'حفظ تعديلات البرنامج' : 'Save Changes'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
