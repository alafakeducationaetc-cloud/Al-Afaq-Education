import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { Logo } from '../common/Logo';
import { Program, TeacherProfile, ProgramCategory, StudyMode } from '../../types';
import { StudentEnrollmentModal } from './StudentEnrollmentModal';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Clock,
  Calendar,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Users,
  UserCheck,
  Globe,
  ArrowRight,
  ChevronRight,
  Search,
  Star,
  LogIn,
  Layers,
  Award,
  Video,
  MonitorCheck,
  Phone,
  Mail,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface PublicHomeViewProps {
  onOpenLogin: () => void;
}

export const PublicHomeView: React.FC<PublicHomeViewProps> = ({ onOpenLogin }) => {
  const { programs, teachers, settings } = useApp();
  const { isRTL, language, setLanguage, t } = useI18n();

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Enrollment Modal state
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState<boolean>(false);
  const [selectedEnrollProgramId, setSelectedEnrollProgramId] = useState<string | undefined>(undefined);
  const [selectedEnrollTeacherId, setSelectedEnrollTeacherId] = useState<string | undefined>(undefined);
  const [selectedEnrollMode, setSelectedEnrollMode] = useState<StudyMode>('PRIVATE');

  const categories: { key: string; labelAr: string; labelEn: string }[] = [
    { key: 'ALL', labelAr: 'جميع البرامج', labelEn: 'All Programs' },
    { key: 'ARABIC_LANGUAGE', labelAr: 'اللغة العربية لغير الناطقين بها', labelEn: 'Arabic Language' },
    { key: 'QURAN_RECITATION', labelAr: 'تلاوة وتحفيظ القرآن', labelEn: 'Quran Recitation' },
    { key: 'TAJWEED_MASTERY', labelAr: 'أحكام التجويد والإجازة', labelEn: 'Tajweed Mastery' },
    { key: 'CONVERSATION', labelAr: 'المحادثة والتعبير الفصيح', labelEn: 'Conversation' },
    { key: 'GRAMMAR_NAHW', labelAr: 'النحو والصرف والبلاغة', labelEn: 'Grammar (Nahw)' },
  ];

  const filteredPrograms = programs.filter(prog => {
    const matchesCat = selectedCategory === 'ALL' || prog.category === selectedCategory;
    const matchesSearch =
      prog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.nameArabic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prog.descriptionArabic && prog.descriptionArabic.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const getWhatsAppUrl = (customMsg?: string) => {
    const rawNumber = (settings.whatsappNumber || '+201012345678').replace(/[^0-9]/g, '');
    const msg = customMsg || settings.whatsappCustomMessage || 'مرحباً، أود الاستفسار والتسجيل في برامج منصة الآفاق الدولية للتدريب واللغة العربية.';
    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(msg)}`;
  };

  const handleOpenEnrollment = (programId?: string, teacherId?: string, mode: StudyMode = 'PRIVATE') => {
    setSelectedEnrollProgramId(programId);
    setSelectedEnrollTeacherId(teacherId);
    setSelectedEnrollMode(mode);
    setIsEnrollModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#29235D] flex flex-col font-sans selection:bg-[#D3B673]/30 selection:text-[#29235D]">
      
      {/* Top Header Navigation for Public Landing */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#29235D]/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Logo size="md" />
            </div>

            {/* Middle Nav Links (Desktop) */}
            <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-bold text-[#29235D]">
              <a href="#hero" className="hover:text-[#D3B673] transition-colors">
                {isRTL ? 'الرئيسية' : 'Home'}
              </a>
              <a href="#programs" className="hover:text-[#D3B673] transition-colors">
                {isRTL ? 'البرامج التدريبية' : 'Programs'}
              </a>
              <a href="#teachers" className="hover:text-[#D3B673] transition-colors">
                {isRTL ? 'المدربون والمواعيد (القاهرة)' : 'Trainers & Schedule'}
              </a>
              <a href="#features" className="hover:text-[#D3B673] transition-colors">
                {isRTL ? 'مميزات المنصة' : 'Features'}
              </a>
            </nav>

            {/* Right Action Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#29235D]/15 bg-[#F8F6F0] hover:bg-[#F1ECE1] text-[#29235D] text-xs font-bold transition-all cursor-pointer"
                title="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#D3B673]" />
                <span>{language === 'en' ? 'العربية' : 'English'}</span>
              </button>

              {/* WhatsApp Support Direct Button */}
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
                title="WhatsApp Support"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>{isRTL ? 'دعم واتساب' : 'WhatsApp'}</span>
              </a>

              {/* Login Portal Button */}
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] border border-[#D3B673]/40 shadow-md transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#D3B673]" />
                <span>{isRTL ? 'تسجيل الدخول' : 'Portal Login'}</span>
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative overflow-hidden bg-[#29235D] text-white py-14 sm:py-20 lg:py-24">
        {/* Decorative Gold & Blue Ambient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D3B673]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1D1845]/40 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            {/* Accreditation Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-[#D3B673]/40 text-[#D3B673] text-xs sm:text-sm font-bold shadow-xs">
              <Sparkles className="w-4 h-4" />
              <span>
                {isRTL
                  ? 'منصة الآفاق الدولية للتدريب والاستشارات التربوية واللغوية'
                  : 'Al-Afak International For Training And Educational Consultants'}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight text-white">
              {isRTL ? (
                <>
                  تعلّم اللغة العربية والقرآن الكريم{' '}
                  <span className="text-[#D3B673] block sm:inline">بأعلى المعايير الأكاديمية</span>
                </>
              ) : (
                <>
                  Master Arabic & Quranic Recitation{' '}
                  <span className="text-[#D3B673] block sm:inline">With Certified Instructors</span>
                </>
              )}
            </h1>

            {/* Sub-headline */}
            <p className="text-sm sm:text-lg text-gray-200 leading-relaxed font-medium max-w-2xl mx-auto">
              {isRTL
                ? 'برامج تفاعلية متخصصة لجميع المستويات مع نخبة من خيرة الأساتذة والمقرئين المجازين. خيارات دراسة فردية خاصة (1-on-1) أو في مجموعات تفاعلية، معتمدة بتوقيت القاهرة الرسمي.'
                : 'Specialized interactive programs for international adult and youth learners. Choose between 1-on-1 private tutoring or interactive group classes scheduled in Cairo Time (GMT+2).'}
            </p>

            {/* Key Feature Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-bold text-gray-200">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <UserCheck className="w-3.5 h-3.5 text-[#D3B673]" />
                {isRTL ? 'دراسة خاصة فردية (1-on-1)' : 'Private 1-on-1'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <Users className="w-3.5 h-3.5 text-[#D3B673]" />
                {isRTL ? 'مجموعات تفاعلية مرنة' : 'Group Classes'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-amber-300">
                <Clock className="w-3.5 h-3.5 text-[#D3B673]" />
                {isRTL ? '🇪🇬 توقيت القاهرة المعتمد (GMT+2)' : '🇪🇬 Cairo Timezone (GMT+2)'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <Award className="w-3.5 h-3.5 text-[#D3B673]" />
                {isRTL ? 'إجازات وشهادات معتمدة' : 'Official Certificates'}
              </span>
            </div>

            {/* Main Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <a
                href="#programs"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-black text-sm bg-[#D3B673] hover:bg-[#c2a462] text-[#29235D] shadow-lg hover:shadow-xl transition-all text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isRTL ? 'استكشف البرامج وسجل الآن' : 'Explore Programs & Enroll'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </a>

              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>{isRTL ? 'تحدث مع الدعم الفني عبر واتساب' : 'WhatsApp Instant Support'}</span>
              </a>

              <button
                type="button"
                onClick={onOpenLogin}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all text-center cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-[#D3B673]" />
                <span>{isRTL ? 'تسجيل الدخول للمنصة' : 'Portal Sign In'}</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* WhatsApp Support Highlight Banner */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-4 px-4 sm:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left rtl:sm:text-right">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 fill-white" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white">
                {isRTL
                  ? 'هل تحتاج مساعدة في اختيار البرنامج المناسب أو تحديد موعد مع معلم؟'
                  : 'Need assistance choosing a program or scheduling with a teacher?'}
              </p>
              <p className="text-[11px] sm:text-xs text-emerald-100">
                {isRTL
                  ? 'فريق الدعم والاستشارات التربوية متاح مباشرة للإجابة على جميع استفساراتك عبر واتساب'
                  : 'Our educational consultants are available live on WhatsApp to guide you.'}
              </p>
            </div>
          </div>

          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 rounded-xl text-xs font-black bg-white text-emerald-800 hover:bg-emerald-50 shadow-sm transition-all shrink-0 cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>{isRTL ? 'تواصل الآن عبر واتساب' : 'Chat on WhatsApp'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        
        {/* Section 1: Programs Catalog Showcase */}
        <section id="programs" className="space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#29235D]/5 text-[#29235D] text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5 text-[#D3B673]" />
              <span>{isRTL ? 'دليل البرامج التدريبية المعتمدة' : 'Accredited Curriculum'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#29235D]">
              {isRTL ? 'اختر البرنامج المناسب لأهدافك' : 'Choose Your Training Program'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {isRTL
                ? 'برامج شاملة معتمدة تغطي تأسيس اللغة العربية، القراءات، والتجويد مع خيارات دراسة خاصة أو في مجموعات.'
                : 'Comprehensive programs covering foundational Arabic, Quran recitation, and classical Tajweed.'}
            </p>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#29235D]/10 shadow-xs">
            
            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {categories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                      : 'bg-[#F8F6F0] text-gray-700 hover:bg-[#F1ECE1]'
                  }`}
                >
                  {isRTL ? cat.labelAr : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder={isRTL ? 'ابحث عن اسم البرنامج...' : 'Search programs...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-[#FBF9F4] text-xs font-semibold text-[#29235D] focus:border-[#29235D] outline-none"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 rtl:left-auto rtl:right-3" />
            </div>

          </div>

          {/* Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map(prog => {
              const privateFee = prog.privatePrice || prog.price;
              const groupFee = prog.groupPrice || Math.round(prog.price * 0.6);
              const assignedTeaList = teachers.filter(t => prog.assignedTeacherIds.includes(t.id));

              return (
                <div
                  key={prog.id}
                  className="bg-white rounded-3xl border border-[#29235D]/10 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                >
                  {/* Thumbnail / Header */}
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    <img
                      src={prog.thumbnailUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400'}
                      alt={prog.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#29235D]/90 via-[#29235D]/30 to-transparent" />
                    
                    {/* Badges on Thumbnail */}
                    <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 flex gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-[#29235D]/90 text-[#D3B673] border border-[#D3B673]/30 backdrop-blur-xs">
                        {prog.category.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-mono text-[#D3B673] font-bold block">{prog.code}</span>
                      <h3 className="text-base sm:text-lg font-bold text-white leading-snug line-clamp-2">
                        {isRTL ? prog.nameArabic : prog.name}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 font-medium">
                      {isRTL ? prog.descriptionArabic || prog.description : prog.description}
                    </p>

                    {/* Program Stats */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-[#F8F6F0] border border-[#29235D]/5 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-gray-500 block">{isRTL ? 'المدة' : 'Duration'}</span>
                        <span className="font-bold text-[#29235D]">{prog.durationMonths} {isRTL ? 'أشهر' : 'mo'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">{isRTL ? 'الحصص' : 'Sessions'}</span>
                        <span className="font-bold text-[#29235D]">{prog.totalSessions}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">{isRTL ? 'زمن الحصة' : 'Length'}</span>
                        <span className="font-bold text-[#29235D]">{prog.sessionDurationMinutes}m</span>
                      </div>
                    </div>

                    {/* Pricing Breakdown for Both Modes */}
                    <div className="space-y-1.5 border-t border-gray-100 pt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
                          <UserCheck className="w-3.5 h-3.5 text-[#D3B673]" />
                          <span>{isRTL ? 'دراسة خاصة (1-on-1):' : 'Private Tutoring:'}</span>
                        </span>
                        <span className="font-mono font-extrabold text-[#29235D]">${privateFee}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5 text-gray-600 font-semibold">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isRTL ? 'مجموعة تفاعلية:' : 'Group Class:'}</span>
                        </span>
                        <span className="font-mono font-extrabold text-emerald-700">${groupFee}</span>
                      </div>
                    </div>

                    {/* Assigned Teachers Mini Bar */}
                    {assignedTeaList.length > 0 && (
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <span className="text-[11px] text-gray-500 font-medium">{isRTL ? 'المدربون:' : 'Teachers:'}</span>
                        <div className="flex -space-x-1.5 rtl:space-x-reverse overflow-hidden">
                          {assignedTeaList.map(tea => (
                            <img
                              key={tea.id}
                              src={tea.avatarUrl}
                              alt={tea.name}
                              title={tea.nameArabic || tea.name}
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-[#29235D]">
                          {assignedTeaList.map(t => isRTL ? t.nameArabic : t.name).join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons: Enroll & WhatsApp */}
                    <div className="space-y-2 pt-2">
                      <button
                        onClick={() => handleOpenEnrollment(prog.id, prog.assignedTeacherIds[0], 'PRIVATE')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] border border-[#D3B673]/30 shadow-sm transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#D3B673]" />
                        <span>{isRTL ? 'سجل في البرنامج (خاص أو مجموعة)' : 'Enroll in Program'}</span>
                      </button>

                      <a
                        href={getWhatsAppUrl(`مرحباً، أود الاستفسار والتسجيل في برنامج: ${prog.nameArabic || prog.name}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-[11px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all text-center"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{isRTL ? 'استفسر عبر واتساب عن البرنامج' : 'Ask about program via WhatsApp'}</span>
                      </a>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </section>

        {/* Section 2: Certified Teachers & Cairo Time Availability Schedule */}
        <section id="teachers" className="space-y-8 pt-4">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#29235D]/5 text-[#29235D] text-xs font-bold">
              <GraduationCap className="w-3.5 h-3.5 text-[#D3B673]" />
              <span>{isRTL ? 'هيئة التدريس والمقرئون المجازون' : 'Certified Instructors'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#29235D]">
              {isRTL ? 'مدربونا وجداول المواعيد (توقيت القاهرة)' : 'Trainers & Cairo Timetable'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {isRTL
                ? 'تعرّف على السيرة الذاتية لمدربينا ومواعيد تواجدهم المتاحة للحصص الفردية والمجموعات المعتمدة بتوقيت القاهرة الرسمي.'
                : 'Explore instructor profiles and their available time slots strictly in Cairo Time (CLT / GMT+2).'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {teachers.map(teacher => {
              const availableSlots = (teacher.availabilitySlots || []).filter(s => s.isAvailable);

              return (
                <div
                  key={teacher.id}
                  className="bg-white rounded-3xl border border-[#29235D]/10 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-5"
                >
                  {/* Teacher Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={teacher.avatarUrl}
                        alt={teacher.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D3B673] shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-1">
                          <h3 className="text-base sm:text-lg font-black text-[#29235D]">
                            {isRTL ? teacher.nameArabic || teacher.name : teacher.name}
                          </h3>
                        </div>
                        <p className="text-xs text-[#D3B673] font-bold mt-0.5">
                          {isRTL ? teacher.specializationArabic || teacher.specialization : teacher.specialization}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {teacher.rating || 4.9}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono font-bold">
                            {teacher.code}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      {teacher.bio}
                    </p>

                    {/* Cairo Timetable Box */}
                    <div className="bg-[#F8F6F0] rounded-2xl p-3.5 border border-[#29235D]/10 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-[#29235D]">
                          <Clock className="w-3.5 h-3.5 text-[#D3B673]" />
                          <span>{isRTL ? 'المواعيد المتاحة (توقيت القاهرة)' : 'Available Slots (Cairo Time)'}</span>
                        </div>
                        <span className="text-[10px] font-mono text-amber-800 bg-amber-100/70 px-1.5 py-0.2 rounded font-bold">
                          GMT+2
                        </span>
                      </div>

                      {availableSlots.length === 0 ? (
                        <p className="text-[11px] text-gray-500 italic text-center py-2">
                          {isRTL ? 'يتم التنسيق وحجز الموعد عبر واتساب' : 'Slots arranged upon registration'}
                        </p>
                      ) : (
                        <div className="space-y-1.5">
                          {availableSlots.map(slot => (
                            <div
                              key={slot.id}
                              className="flex items-center justify-between bg-white p-2 rounded-xl border border-gray-100 text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#29235D]">{slot.dayArabic || slot.day}</span>
                                <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              </div>
                              <span className="text-[10px] font-semibold text-gray-500">
                                {slot.studyType === 'PRIVATE' ? '👤 خاص' : slot.studyType === 'GROUP' ? '👥 مجموعة' : '🌟 متاح'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions for this Teacher */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => handleOpenEnrollment(teacher.assignedProgramIds[0], teacher.id, 'PRIVATE')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] border border-[#D3B673]/30 shadow-sm transition-all cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#D3B673]" />
                      <span>{isRTL ? 'احجز موعداً مع هذا المدرب' : 'Book with this Instructor'}</span>
                    </button>

                    <a
                      href={getWhatsAppUrl(`مرحباً، أود التنسيق وحجز موعد دراسي مع المدرب: ${teacher.nameArabic || teacher.name}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-[11px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all text-center"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{isRTL ? 'استفسر عبر واتساب عن مواعيد المدرب' : 'Inquire on WhatsApp'}</span>
                    </a>
                  </div>

                </div>
              );
            })}
          </div>

        </section>

        {/* Section 3: Platform Features */}
        <section id="features" className="bg-[#29235D] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D3B673]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D3B673] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isRTL ? 'البيئة التعليمية التفاعلية' : 'Smart Learning Ecosystem'}</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white">
                {isRTL ? 'مميزات منصة الآفاق الدولية' : 'Why Choose AITEC Platform?'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#D3B673]/20 flex items-center justify-center text-[#D3B673]">
                  <MonitorCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  {isRTL ? 'السبورة التفاعلية الذكية' : 'Interactive Whiteboard'}
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {isRTL ? 'سبورة رقمية حية متكاملة لتعليم الحروف والتشكيل والرسم القرآني.' : 'Real-time collaborative canvas with Arabic calligraphy and Tajweed tools.'}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#D3B673]/20 flex items-center justify-center text-[#D3B673]">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  {isRTL ? '+100 نشاط ولعبة لغوية' : '100+ Gamified Activities'}
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {isRTL ? 'ألعاب تفاعلية، اختبارات إعراب، وتحديات نطق ومفردات مشوقة.' : 'Engaging linguistic games, grammar quizzes, and phonetic exercises.'}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#D3B673]/20 flex items-center justify-center text-[#D3B673]">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  {isRTL ? 'مواقيت القاهرة المعتمدة' : 'Cairo Timetable Sync'}
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {isRTL ? 'جدولة دقيقة للحصص المباشرة وروابط Zoom متزامنة بتوقيت القاهرة الرسمي.' : 'Synchronized live class scheduling with Zoom integration in CLT.'}
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#D3B673]/20 flex items-center justify-center text-[#D3B673]">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">
                  {isRTL ? 'إجازات وشهادات موثقة' : 'Verified Certificates'}
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {isRTL ? 'تقارير تقدم دورية وشهادات إتقان وإجازات في التلاوة والتجويد.' : 'Academic progress reports, completion certificates, and Quranic ijazahs.'}
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-[#29235D]/10 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-3">
              <Logo size="md" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600 font-semibold">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#D3B673]" />
                {settings.contactEmail}
              </span>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 transition-colors font-bold"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{isRTL ? 'الدعم الفني عبر واتساب' : 'WhatsApp Support'}</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
              </a>
            </div>

            <div className="text-center md:text-right rtl:md:text-left text-xs text-[#786F9A]">
              <p>© {new Date().getFullYear()} {isRTL ? settings.platformNameArabic : settings.platformName}. {isRTL ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
            </div>

          </div>
        </div>
      </footer>

      {/* Trainee Enrollment Modal */}
      <StudentEnrollmentModal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        initialProgramId={selectedEnrollProgramId}
        initialTeacherId={selectedEnrollTeacherId}
        initialStudyMode={selectedEnrollMode}
        onSuccessLogin={() => {
          // Trigger any post-login behavior
        }}
      />

    </div>
  );
};
