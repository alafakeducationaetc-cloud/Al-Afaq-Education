import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

export interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export const translations: Translations = {
  // Brand & Header
  platformName: {
    en: 'AITEC Platform',
    ar: 'منصة الآفاق الدولية للتدريب والاستشارات التربوية',
  },
  platformSubname: {
    en: 'Al-Afak International For Training And Educational Consultants',
    ar: 'الآفاق الدولية للتدريب والاستشارات التربوية والتعليم التفاعلي',
  },
  tagline: {
    en: 'Excellence in Arabic Language, Quran & Tajweed Education',
    ar: 'الريادة والتميز في تعليم اللغة العربية لغير الناطقين بها والقرآن الكريم والتجويد',
  },

  // Auth & Roles
  student: { en: 'Student', ar: 'طالب' },
  teacher: { en: 'Teacher / Trainer', ar: 'معلم / مدرب' },
  admin: { en: 'Administrator', ar: 'المشرف الإداري' },
  superAdmin: { en: 'General Supervisor (Super Admin)', ar: 'المشرف العام (صلاحيات مطلقة)' },
  studentLogin: { en: 'Student Access', ar: 'دخول الطلاب' },
  teacherLogin: { en: 'Teacher Access', ar: 'دخول المدربين والمعلمين' },
  adminLogin: { en: 'General Supervisor Login', ar: 'دخول المشرف العام' },
  enterStudentCode: { en: 'Student Code (e.g. STD-1001)', ar: 'كود الطالب (مثال: STD-1001)' },
  enterStudentName: { en: 'Full Name', ar: 'الاسم الكامل' },
  enterTeacherCode: { en: 'Teacher Code (e.g. TEA-8821)', ar: 'كود المدرب (مثال: TEA-8821)' },
  enterTeacherName: { en: 'Teacher Name', ar: 'اسم المدرب' },
  enterAdminCode: { en: 'Admin Passcode / ID', ar: 'رمز المرور أو كود الإدارة' },
  loginButton: { en: 'Enter Platform', ar: 'دخول المنصة' },
  logout: { en: 'Sign Out', ar: 'تسجيل الخروج' },
  quickDemoLogin: { en: 'Quick Switcher', ar: 'التبديل السريع للحسابات' },
  loggedAs: { en: 'Logged in as', ar: 'مسجل كـ' },

  // Teacher Permissions Specifics
  generalSupervisorAuthority: { en: 'General Supervisor Absolute Authority', ar: 'صلاحيات المشرف العام المطلقة' },
  teacherPermissionsMatrix: { en: 'Trainer Permissions Matrix', ar: 'مصفوفة صلاحيات المدربين' },
  canCreateLessons: { en: 'Create & Edit Lessons', ar: 'إنشاء وتعديل وحدات الدروس' },
  canCreateActivities: { en: 'Build Interactive Games', ar: 'برمجة وبناء الألعاب التفاعلية' },
  canManageAttendance: { en: 'Manage Attendance Logs', ar: 'تسجيل وإدارة الحضور والغياب' },
  canScheduleClasses: { en: 'Schedule Live Classes & Zoom', ar: 'جدولة الحصص المباشرة وروابط Zoom' },
  canViewAllReports: { en: 'Access Platform Analytics', ar: 'الاطلاع على التقارير والإحصائيات الشاملة' },
  canIssueCertificates: { en: 'Issue Official Certificates', ar: 'إصدار واعتماد الشهادات الأكاديمية' },
  canAccessWhiteboard: { en: 'Use Interactive Whiteboard', ar: 'استخدام السبورة التفاعلية الذكية' },
  canEditCurriculum: { en: 'Edit Curriculum & Programs', ar: 'تعديل وتحديث مناهج البرامج' },
  grantAll: { en: 'Grant All Permissions', ar: 'منح جميع الصلاحيات' },
  revokeAll: { en: 'Revoke All Permissions', ar: 'سحب الصلاحيات' },
  assignedPrograms: { en: 'Assigned Programs', ar: 'البرامج المخصصة' },
  assignedStudents: { en: 'Assigned Students', ar: 'الطلاب المخصصين' },
  regenerateCode: { en: 'Reset / Regenerate Code', ar: 'توليد كود دخول جديد' },
  permissionRestricted: { en: 'Permission Restricted by General Supervisor', ar: 'هذه الصلاحية مقيدة ومحددة من المشرف العام' },

  // Navigation
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  myPrograms: { en: 'My Programs', ar: 'برامجي التعليمية' },
  myClasses: { en: 'My Classes', ar: 'حصصي وجدولي' },
  myStudents: { en: 'My Students', ar: 'طلابي' },
  allStudents: { en: 'Students', ar: 'إدارة الطلاب' },
  allTeachers: { en: 'Teachers', ar: 'إدارة المعلمين' },
  programs: { en: 'Programs', ar: 'البرامج والدورات' },
  subscriptions: { en: 'Subscriptions', ar: 'الاشتراكات' },
  attendance: { en: 'Attendance', ar: 'سجل الحضور والغياب' },
  interactiveClassroom: { en: 'Digital Classroom', ar: 'الفصل الرقمي التفاعلي' },
  whiteboard: { en: 'Interactive Whiteboard', ar: 'السبورة الذكية التفاعلية' },
  activities: { en: 'Interactive Activities & Games', ar: 'الأنشطة والألعاب التفاعلية' },
  lessons: { en: 'Lesson Builder', ar: 'صانع الدروس التفاعلية' },
  assignments: { en: 'Assignments', ar: 'الواجبات والتكليفات' },
  zoomMeetings: { en: 'Zoom Meetings', ar: 'جلسات زووم المباشرة' },
  permissions: { en: 'Permissions & Roles', ar: 'الصلاحيات والأدوار' },
  reports: { en: 'Analytics & Reports', ar: 'التقارير والإحصائيات' },
  settings: { en: 'Platform Settings', ar: 'إعدادات المنصة' },
  notifications: { en: 'Notifications', ar: 'الإشعارات' },
  profile: { en: 'Profile', ar: 'الملف الشخصي' },

  // Student Dashboard Specifics
  welcomeBack: { en: 'Welcome back,', ar: 'أهلاً وسهلاً بك،' },
  activeSubscription: { en: 'Active Subscription', ar: 'الاشتراك الحالي' },
  subscriptionRemaining: { en: 'Subscription Status', ar: 'حالة وصلاحية الاشتراك' },
  daysRemaining: { en: 'Days Remaining', ar: 'الأيام المتبقية' },
  sessionsRemaining: { en: 'Sessions Remaining', ar: 'الحصص المتبقية' },
  expiresOn: { en: 'Expires on', ar: 'تاريخ الانتهاء' },
  startedOn: { en: 'Started on', ar: 'تاريخ البدء' },
  nextClass: { en: 'Next Upcoming Class', ar: 'الحصة القادمة' },
  joinZoomClass: { en: 'Join Zoom Class', ar: 'انضم لدرس زووم الآن' },
  openWhiteboard: { en: 'Launch Whiteboard', ar: 'فتح السبورة التفاعلية' },
  attendanceRate: { en: 'Attendance Rate', ar: 'نسبة الحضور' },
  attendedCount: { en: 'Attended Classes', ar: 'حصص تم حضورها' },
  absentCount: { en: 'Absences', ar: 'حصص غياب' },
  assignedTeacher: { en: 'Assigned Teacher', ar: 'المعلم المشرف' },
  completedProgress: { en: 'Curriculum Progress', ar: 'نسبة إنجاز المنهج' },

  // Actions
  addNew: { en: 'Add New', ar: 'إضافة جديد' },
  create: { en: 'Create', ar: 'إنشاء' },
  edit: { en: 'Edit', ar: 'تعديل' },
  delete: { en: 'Delete', ar: 'حذف' },
  save: { en: 'Save Changes', ar: 'حفظ التغييرات' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  search: { en: 'Search...', ar: 'بحث...' },
  filter: { en: 'Filter', ar: 'تصفية' },
  all: { en: 'All', ar: 'الكل' },
  status: { en: 'Status', ar: 'الحالة' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  details: { en: 'Details', ar: 'التفاصيل' },
  preview: { en: 'Preview', ar: 'معاينة' },
  play: { en: 'Play Activity', ar: 'بدء النشاط' },
  publish: { en: 'Publish', ar: 'نشر' },
  archive: { en: 'Archive', ar: 'أرشفة' },
  exportData: { en: 'Export Data', ar: 'تصدير البيانات' },
  markAttendance: { en: 'Mark Attendance', ar: 'تسجيل الحضور' },

  // Statuses
  active: { en: 'Active', ar: 'نشط' },
  suspended: { en: 'Suspended', ar: 'معلّق' },
  expired: { en: 'Expired', ar: 'منتهي' },
  expiringSoon: { en: 'Expiring Soon', ar: 'قارب على الانتهاء' },
  blocked: { en: 'Blocked', ar: 'محظور' },
  inactive: { en: 'Inactive', ar: 'غير نشط' },
  present: { en: 'Present', ar: 'حاضر' },
  absent: { en: 'Absent', ar: 'غائب' },
  late: { en: 'Late', ar: 'متأخر' },
  excused: { en: 'Excused', ar: 'عذر مقبول' },

  // Categories
  arabicLanguage: { en: 'Arabic for Non-Native Speakers', ar: 'اللغة العربية لغير الناطقين بها' },
  quranRecitation: { en: 'Quran Recitation & Memorization', ar: 'تلاوة وتحفيظ القرآن الكريم' },
  tajweedMastery: { en: 'Tajweed Mastery & Rules', ar: 'أحكام وقواعد التجويد' },
  conversation: { en: 'Arabic Conversation', ar: 'المحادثة والتحدث باللغة العربية' },
  grammarNahw: { en: 'Grammar & Morphology (Nahw & Sarf)', ar: 'النحو والصرف وقواعد الإعراب' },
  readingWriting: { en: 'Reading & Penmanship', ar: 'القراءة والكتابة والخط العربي' },

  // Whiteboard
  pen: { en: 'Pen', ar: 'قلم' },
  highlighter: { en: 'Highlighter', ar: 'تظليل' },
  eraser: { en: 'Eraser', ar: 'ممحاة' },
  shapes: { en: 'Shapes', ar: 'أشكال هندسية' },
  textNote: { en: 'Text Note', ar: 'نص توضيحي' },
  clearBoard: { en: 'Clear Board', ar: 'مسح السبورة' },
  saveLesson: { en: 'Save Whiteboard State', ar: 'حفظ محتوى السبورة' },
  insertAyah: { en: 'Insert Quranic Verse / Arabic Calligraphy', ar: 'إدراج آية قرآنية أو نص عربي' },
  undo: { en: 'Undo', ar: 'تراجع' },
  redo: { en: 'Redo', ar: 'إعادة' },
  colorPalette: { en: 'Colors', ar: 'الألوان' },
  page: { en: 'Page', ar: 'صفحة' },
  newPage: { en: 'New Page', ar: 'صفحة جديدة' },

  // Interactive Games
  sandboxPlayer: { en: 'Secure Sandboxed Game Engine', ar: 'محرك الألعاب التفاعلية الآمن' },
  customCodeActivity: { en: 'Custom HTML/CSS/JS Activity', ar: 'نشاط مبرمج مخصص' },
  codeEditor: { en: 'Code Editor', ar: 'محرر الكود' },
  testSandbox: { en: 'Run in Sandbox', ar: 'تشغيل في بيئة معزولة' },
  score: { en: 'Score', ar: 'النقاط' },
  timeRemaining: { en: 'Time', ar: 'الوقت' },
  tryAgain: { en: 'Try Again', ar: 'أعد المحاولة' },
  wellDone: { en: 'Excellent! Well Done', ar: 'ممتاز! أحسنت صنعاً' },
};

interface I18nContextType {
  language: Language;
  lang: Language;
  setLanguage: (lang: Language) => void;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('alteq_lang') as Language;
    return saved || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('alteq_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const setLang = setLanguage;
  const lang = language;

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    const item = translations[key];
    if (!item) return key;
    return item[language] || item.en || key;
  };

  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    <I18nContext.Provider value={{ language, lang, setLanguage, setLang, t, isRTL, dir }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
