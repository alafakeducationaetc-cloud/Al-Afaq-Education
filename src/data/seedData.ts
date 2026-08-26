import {
  User,
  StudentProfile,
  TeacherProfile,
  Program,
  Subscription,
  ClassSession,
  AttendanceRecord,
  Activity,
  Lesson,
  NotificationItem,
  PlatformSettings,
} from '../types';

export const initialSettings: PlatformSettings = {
  platformName: 'AITEC Platform',
  platformNameArabic: 'منصة الآفاق الدولية للتدريب والاستشارات التربوية',
  tagline: 'Al-Afak International For Training And Educational Consultants',
  taglineArabic: 'الآفاق الدولية للتدريب والاستشارات التربوية والتعليم التفاعلي',
  primaryNavy: '#29235D',
  accentGold: '#D3B673',
  defaultLanguage: 'ar',
  studentCodePrefix: 'STD-',
  teacherCodePrefix: 'TEA-',
  programCodePrefix: 'PRG-',
  activityCodePrefix: 'ACT-',
  defaultSessionDuration: 60,
  defaultZoomLink: 'https://zoom.us/j/9876543210',
  enableRTL: true,
  contactEmail: 'alafak.education.aetc@gmail.com',
  contactPhone: '+20 101 234 5678',
  whatsappNumber: '+201012345678',
  whatsappCustomMessage: 'مرحباً، أود الاستفسار والتسجيل في برامج منصة الآفاق الدولية للتدريب واللغة العربية.',
  adminPasscode: 'admin123',
};

export const initialAdmin: User = {
  id: 'usr-adm-1',
  code: 'ADM-0001',
  name: 'Dr. Alafak Director (المشرف العام)',
  nameArabic: 'د. المشرف العام للآفاق الدولية',
  email: 'director@alafak.edu',
  phone: '+966 50 000 0001',
  password: 'admin123',
  role: 'SUPER_ADMIN',
  status: 'ACTIVE',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  joinedDate: '2025-01-01',
  permissions: ['*'],
};

export const initialTeachers: TeacherProfile[] = [
  {
    id: 'usr-tea-1',
    code: 'TEA-8821',
    name: 'Sheikh Ahmed Al-Mansoor',
    nameArabic: 'الشيخ أحمد المنصور',
    email: 'ahmed.mansoor@alafak.edu',
    phone: '+966 50 111 2233',
    password: 'teacher123',
    role: 'TEACHER',
    status: 'ACTIVE',
    specialization: 'Quranic Recitation & Ten Qira’at Specialist',
    specializationArabic: 'إجازة في القراءات العشر وعلوم القرآن والتجويد',
    bio: 'Senior Qari with 15+ years experience teaching non-native speakers classical Tajweed and Quranic pronunciation.',
    assignedProgramIds: ['prg-qur-01', 'prg-taj-01'],
    assignedStudentIds: ['usr-std-1', 'usr-std-3'],
    rating: 4.95,
    totalClassesTaught: 420,
    hourlyRatePrivateUSD: 25,
    monthlyRateGroupUSD: 70,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2025-01-15',
    availabilitySlots: [
      {
        id: 'slot-ahmed-1',
        day: 'SUNDAY',
        dayArabic: 'الأحد',
        startTime: '17:00',
        endTime: '19:00',
        timeZoneLabel: 'توقيت القاهرة (Cairo Time - CLT / GMT+2)',
        studyType: 'PRIVATE',
        isAvailable: true,
        notes: 'متاح لجلسات التسميع الفردي والإجازة القرآنية',
      },
      {
        id: 'slot-ahmed-2',
        day: 'TUESDAY',
        dayArabic: 'الثلاثاء',
        startTime: '19:30',
        endTime: '21:30',
        timeZoneLabel: 'توقيت القاهرة (Cairo Time - CLT / GMT+2)',
        studyType: 'GROUP',
        maxStudents: 6,
        isAvailable: true,
        notes: 'حلقة تلاوة وتجويد جماعية تفاعلية',
      },
      {
        id: 'slot-ahmed-3',
        day: 'THURSDAY',
        dayArabic: 'الخميس',
        startTime: '18:00',
        endTime: '20:00',
        timeZoneLabel: 'توقيت القاهرة (Cairo Time - CLT / GMT+2)',
        studyType: 'BOTH',
        isAvailable: true,
        notes: 'متاح للدروس الفردية والمجموعات المكثفة',
      },
    ],
    teacherPermissions: {
      canCreateLessons: true,
      canCreateActivities: true,
      canManageAttendance: true,
      canScheduleClasses: true,
      canViewAllReports: false,
      canIssueCertificates: true,
      canAccessWhiteboard: true,
      canEditCurriculum: false,
    },
  },
  {
    id: 'usr-tea-2',
    code: 'TEA-4432',
    name: 'Ustadh Bilal Hassan',
    nameArabic: 'الأستاذ بلال حسن',
    email: 'bilal.hassan@alafak.edu',
    phone: '+966 50 333 4455',
    password: 'teacher123',
    role: 'TEACHER',
    status: 'ACTIVE',
    specialization: 'Arabic for Non-Native Speakers & Modern Conversation',
    specializationArabic: 'تعليم اللغة العربية لغير الناطقين بها والمحادثة الحية',
    bio: 'Masters in Applied Linguistics, specialized in accelerated Arabic immersion for international adult learners.',
    assignedProgramIds: ['prg-arb-01', 'prg-con-01'],
    assignedStudentIds: ['usr-std-1', 'usr-std-2', 'usr-std-4'],
    rating: 4.88,
    totalClassesTaught: 310,
    hourlyRatePrivateUSD: 20,
    monthlyRateGroupUSD: 60,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2025-02-01',
    availabilitySlots: [
      {
        id: 'slot-bilal-1',
        day: 'MONDAY',
        dayArabic: 'الإثنين',
        startTime: '16:00',
        endTime: '18:00',
        timeZoneLabel: 'توقيت القاهرة (Cairo Time - CLT / GMT+2)',
        studyType: 'PRIVATE',
        isAvailable: true,
        notes: 'محادثة وتأسيس فردي مكثف',
      },
      {
        id: 'slot-bilal-2',
        day: 'WEDNESDAY',
        dayArabic: 'الأربعاء',
        startTime: '18:00',
        endTime: '20:00',
        timeZoneLabel: 'توقيت القاهرة (Cairo Time - CLT / GMT+2)',
        studyType: 'GROUP',
        maxStudents: 8,
        isAvailable: true,
        notes: 'ورشة المحادثة العربية التفاعلية للمجموعات',
      },
      {
        id: 'slot-bilal-3',
        day: 'SATURDAY',
        dayArabic: 'السبت',
        startTime: '15:00',
        endTime: '17:30',
        timeZoneLabel: 'توقيت القاهرة (Cairo Time - CLT / GMT+2)',
        studyType: 'BOTH',
        isAvailable: true,
        notes: 'متاح للدروس الفردية ومجموعات عطلة نهاية الأسبوع',
      },
    ],
    teacherPermissions: {
      canCreateLessons: true,
      canCreateActivities: true,
      canManageAttendance: true,
      canScheduleClasses: true,
      canViewAllReports: true,
      canIssueCertificates: false,
      canAccessWhiteboard: true,
      canEditCurriculum: false,
    },
  },
  {
    id: 'usr-tea-3',
    code: 'TEA-9914',
    name: 'Ustadha Fatima Al-Zahra',
    nameArabic: 'الأستاذة فاطمة الزهراء',
    email: 'fatima.zahra@alafak.edu',
    phone: '+966 50 555 6677',
    password: 'teacher123',
    role: 'TEACHER',
    status: 'ACTIVE',
    specialization: 'Classical Arabic Grammar (Nahw & Sarf) & Penmanship',
    specializationArabic: 'النحو والصرف والخط العربي والبلاغة الأدبية',
    bio: 'PhD candidate in Classical Arabic literature with interactive digital pedagogy expertise.',
    assignedProgramIds: ['prg-grm-01', 'prg-arb-01'],
    assignedStudentIds: ['usr-std-2', 'usr-std-3'],
    rating: 4.92,
    totalClassesTaught: 280,
    hourlyRatePrivateUSD: 22,
    monthlyRateGroupUSD: 65,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2025-03-10',
    availabilitySlots: [
      {
        id: 'slot-fatima-1',
        day: 'SUNDAY',
        dayArabic: 'الأحد',
        startTime: '15:00',
        endTime: '17:00',
        timeZoneLabel: 'توقيت القاهرة (Cairo Time - CLT / GMT+2)',
        studyType: 'PRIVATE',
        isAvailable: true,
        notes: 'إعراب ونحو تحليلي فردي',
      },
      {
        id: 'slot-fatima-2',
        day: 'TUESDAY',
        dayArabic: 'الثلاثاء',
        startTime: '17:00',
        endTime: '19:00',
        timeZoneLabel: 'توقيت القاهرة (Cairo Time - CLT / GMT+2)',
        studyType: 'GROUP',
        maxStudents: 6,
        isAvailable: true,
        notes: 'دورة النحو التفاعلية للمجموعات',
      },
    ],
    teacherPermissions: {
      canCreateLessons: true,
      canCreateActivities: false,
      canManageAttendance: true,
      canScheduleClasses: true,
      canViewAllReports: false,
      canIssueCertificates: false,
      canAccessWhiteboard: true,
      canEditCurriculum: true,
    },
  },
];

export const initialStudents: StudentProfile[] = [
  {
    id: 'usr-std-1',
    code: 'STD-1001',
    name: 'Tariq Ibrahim',
    nameArabic: 'طارق إبراهيم',
    email: 'tariq.ibrahim@example.com',
    phone: '+1 415 555 0192',
    password: 'student123',
    role: 'STUDENT',
    status: 'ACTIVE',
    nativeLanguage: 'English',
    assignedTeacherIds: ['usr-tea-2', 'usr-tea-1'],
    enrolledProgramIds: ['prg-arb-01', 'prg-qur-01'],
    activeSubscriptionId: 'sub-001',
    notes: 'Enthusiastic beginner, highly dedicated to daily Tajweed practice and conversation.',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2026-01-10',
  },
  {
    id: 'usr-std-2',
    code: 'STD-1002',
    name: 'Sara Jenkins',
    nameArabic: 'سارة جينكينز',
    email: 'sara.jenkins@example.com',
    phone: '+44 20 7946 0912',
    password: 'student123',
    role: 'STUDENT',
    status: 'ACTIVE',
    nativeLanguage: 'English',
    assignedTeacherIds: ['usr-tea-2', 'usr-tea-3'],
    enrolledProgramIds: ['prg-arb-01', 'prg-grm-01'],
    activeSubscriptionId: 'sub-002',
    notes: 'Focusing on Arabic business correspondence and conversational fluency.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2026-02-01',
  },
  {
    id: 'usr-std-3',
    code: 'STD-1003',
    name: 'Omar Chen',
    nameArabic: 'عمر تشن',
    email: 'omar.chen@example.com',
    phone: '+65 6789 0123',
    password: 'student123',
    role: 'STUDENT',
    status: 'ACTIVE',
    nativeLanguage: 'Mandarin',
    assignedTeacherIds: ['usr-tea-1', 'usr-tea-3'],
    enrolledProgramIds: ['prg-qur-01', 'prg-taj-01'],
    activeSubscriptionId: 'sub-003',
    notes: 'Aiming to complete memorization of Juz 30 with authentic Tajweed rules.',
    avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2026-02-15',
  },
  {
    id: 'usr-std-4',
    code: 'STD-1004',
    name: 'Amina Diallo',
    nameArabic: 'أمينة ديالو',
    email: 'amina.diallo@example.com',
    phone: '+33 1 42 68 55 00',
    password: 'student123',
    role: 'STUDENT',
    status: 'ACTIVE',
    nativeLanguage: 'French',
    assignedTeacherIds: ['usr-tea-2'],
    enrolledProgramIds: ['prg-con-01'],
    activeSubscriptionId: 'sub-004',
    notes: 'Preparing for Arabic translation proficiency exam.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    joinedDate: '2026-03-01',
  },
];

export const initialPrograms: Program[] = [
  {
    id: 'prg-arb-01',
    code: 'PRG-ARB01',
    name: 'Arabic for Non-Native Speakers — Foundation Level 1',
    nameArabic: 'اللغة العربية لغير الناطقين بها — المستوى التأسيسي الأول',
    description: 'Comprehensive introduction to Arabic phonetics, alphabet letters, vowel signs (Harakat), and core everyday vocabulary.',
    descriptionArabic: 'مقدمة شاملة للحروف الهجائية، مخارج الحروف، الحركات الإعرابية، والمفردات الأساسية للحياة اليومية.',
    category: 'ARABIC_LANGUAGE',
    level: 'BEGINNER',
    language: 'Arabic & English',
    durationMonths: 3,
    price: 350,
    privatePrice: 350,
    groupPrice: 190,
    currency: 'USD',
    totalSessions: 24,
    sessionDurationMinutes: 60,
    assignedTeacherIds: ['usr-tea-2', 'usr-tea-3'],
    enrolledStudentIds: ['usr-std-1', 'usr-std-2'],
    startDate: '2026-01-15',
    endDate: '2026-04-15',
    status: 'ACTIVE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'prg-qur-01',
    code: 'PRG-QUR01',
    name: 'Quranic Recitation & Memorization — Juz Amma',
    nameArabic: 'تلاوة وتحفيظ القرآن الكريم — جزء عم مع التجويد',
    description: 'Guided one-on-one and small group Quran recitation focusing on correct makharij, fluency, and Juz Amma retention.',
    descriptionArabic: 'جلسات تلاوة وتحفيظ فردية وجماعية مع التركيز على ضبط مخارج الحروف والتلاوة العذبة المتقنة.',
    category: 'QURAN_RECITATION',
    level: 'BEGINNER',
    language: 'Arabic',
    durationMonths: 4,
    price: 420,
    privatePrice: 420,
    groupPrice: 230,
    currency: 'USD',
    totalSessions: 32,
    sessionDurationMinutes: 45,
    assignedTeacherIds: ['usr-tea-1'],
    enrolledStudentIds: ['usr-std-1', 'usr-std-3'],
    startDate: '2026-01-20',
    endDate: '2026-05-20',
    status: 'ACTIVE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'prg-taj-01',
    code: 'PRG-TAJ01',
    name: 'Tajweed Rules & Applied Articulation Mastery',
    nameArabic: 'أحكام التجويد العملية — مخارج وصفات الحروف',
    description: 'Deep dive into Noon Sakinah, Meem Sakinah, Madd rules, Qalqalah, and practical application on Quranic passages.',
    descriptionArabic: 'دراسة تطبيقية لأحكام النون الساكنة والتنوين، والميم الساكنة، والمدود والقلقلة والتفخيم والترقيق.',
    category: 'TAJWEED_MASTERY',
    level: 'INTERMEDIATE',
    language: 'Arabic & English',
    durationMonths: 3,
    price: 380,
    privatePrice: 380,
    groupPrice: 210,
    currency: 'USD',
    totalSessions: 24,
    sessionDurationMinutes: 60,
    assignedTeacherIds: ['usr-tea-1'],
    enrolledStudentIds: ['usr-std-3'],
    startDate: '2026-02-01',
    endDate: '2026-05-01',
    status: 'ACTIVE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'prg-con-01',
    code: 'PRG-CON01',
    name: 'Modern Standard Arabic Daily Conversation',
    nameArabic: 'المحادثة والتعبير باللغة العربية الفصحى المعاصرة',
    description: 'Immersive conversational dialogues, interactive role-playing, situational vocabulary in airport, market, and university contexts.',
    descriptionArabic: 'حوارات تفاعلية حية، لعب أدوار واقعية، ومفردات المواقف اليومية في السفر والعمل والمواقف الاجتماعية.',
    category: 'CONVERSATION',
    level: 'ELEMENTARY',
    language: 'Arabic',
    durationMonths: 2,
    price: 290,
    privatePrice: 290,
    groupPrice: 160,
    currency: 'USD',
    totalSessions: 16,
    sessionDurationMinutes: 60,
    assignedTeacherIds: ['usr-tea-2'],
    enrolledStudentIds: ['usr-std-4'],
    startDate: '2026-03-01',
    endDate: '2026-05-01',
    status: 'ACTIVE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'prg-grm-01',
    code: 'PRG-GRM01',
    name: 'Classical Arabic Grammar (Nahw & Sarf)',
    nameArabic: 'قواعد النحو العربي والصرف والبناء اللغوي',
    description: 'Master sentence structure (Jumla Ismiyyah & Fi’liyyah), I’rab cases, verb conjugations, and structural analysis.',
    descriptionArabic: 'دراسة الجملة الاسمية والفعلية، علامات الإعراب، تصريف الأفعال والاشتقاق بدقة وسلاسة.',
    category: 'GRAMMAR_NAHW',
    level: 'INTERMEDIATE',
    language: 'Arabic & English',
    durationMonths: 3,
    price: 360,
    privatePrice: 360,
    groupPrice: 195,
    currency: 'USD',
    totalSessions: 24,
    sessionDurationMinutes: 60,
    assignedTeacherIds: ['usr-tea-3'],
    enrolledStudentIds: ['usr-std-2'],
    startDate: '2026-02-10',
    endDate: '2026-05-10',
    status: 'ACTIVE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format&fit=crop&q=80',
  },
];

export const initialSubscriptions: Subscription[] = [
  {
    id: 'sub-001',
    studentId: 'usr-std-1',
    programId: 'prg-arb-01',
    teacherId: 'usr-tea-2',
    startDate: '2026-01-15',
    endDate: '2026-04-15',
    totalSessions: 24,
    attendedSessions: 16,
    remainingSessions: 8,
    status: 'ACTIVE',
    paymentStatus: 'PAID',
    amount: 350,
    notes: 'Prompt attendance, requested additional conversation exercises.',
  },
  {
    id: 'sub-002',
    studentId: 'usr-std-2',
    programId: 'prg-arb-01',
    teacherId: 'usr-tea-2',
    startDate: '2026-02-01',
    endDate: '2026-05-01',
    totalSessions: 24,
    attendedSessions: 12,
    remainingSessions: 12,
    status: 'ACTIVE',
    paymentStatus: 'PAID',
    amount: 350,
  },
  {
    id: 'sub-003',
    studentId: 'usr-std-3',
    programId: 'prg-qur-01',
    teacherId: 'usr-tea-1',
    startDate: '2026-01-20',
    endDate: '2026-05-20',
    totalSessions: 32,
    attendedSessions: 22,
    remainingSessions: 10,
    status: 'ACTIVE',
    paymentStatus: 'PAID',
    amount: 420,
  },
  {
    id: 'sub-004',
    studentId: 'usr-std-4',
    programId: 'prg-con-01',
    teacherId: 'usr-tea-2',
    startDate: '2026-03-01',
    endDate: '2026-05-01',
    totalSessions: 16,
    attendedSessions: 4,
    remainingSessions: 12,
    status: 'ACTIVE',
    paymentStatus: 'PAID',
    amount: 290,
  },
];

export const initialClasses: ClassSession[] = [
  {
    id: 'cls-001',
    title: 'Live Interactive Session: Arabic Letters with Tashkeel & Reading',
    titleArabic: 'جلسة مباشرة: الحروف العربية بالحركات وتطبيقات القراءة',
    programId: 'prg-arb-01',
    teacherId: 'usr-tea-2',
    studentIds: ['usr-std-1', 'usr-std-2'],
    date: '2026-08-26', // tomorrow
    startTime: '18:00',
    endTime: '19:00',
    zoomUrl: 'https://zoom.us/j/9876543210',
    zoomMeetingId: '987 654 3210',
    zoomPassword: 'ALTEQ-ARABIC',
    status: 'SCHEDULED',
    topic: 'Connecting letters in beginning, middle and end of words',
    notes: 'Prepare the interactive whiteboard letter tracing sheet.',
  },
  {
    id: 'cls-002',
    title: 'Quran Recitation Lab: Surah Al-Balad & Tajweed Qalqalah Rules',
    titleArabic: 'مختبر تلاوة القرآن: سورة البلد وتطبيق أحكام القلقلة',
    programId: 'prg-qur-01',
    teacherId: 'usr-tea-1',
    studentIds: ['usr-std-1', 'usr-std-3'],
    date: '2026-08-27',
    startTime: '19:30',
    endTime: '20:15',
    zoomUrl: 'https://zoom.us/j/9876543211',
    zoomMeetingId: '987 654 3211',
    zoomPassword: 'ALTEQ-QURAN',
    status: 'SCHEDULED',
    topic: 'Qalqalah Kubra vs Sughra with live voice correction',
  },
  {
    id: 'cls-003',
    title: 'Situational Arabic: Shopping in Old Souq & Market Bargaining',
    titleArabic: 'المحادثة الحية: التسوق في السوق القديم وحوارات الشراء',
    programId: 'prg-con-01',
    teacherId: 'usr-tea-2',
    studentIds: ['usr-std-4'],
    date: '2026-08-28',
    startTime: '17:00',
    endTime: '18:00',
    zoomUrl: 'https://zoom.us/j/9876543212',
    status: 'SCHEDULED',
    topic: 'Dialogue role play with digital flashcards',
  },
  {
    id: 'cls-004',
    title: 'Past Completed Class: Arabic Greetings & Introduction Phrases',
    titleArabic: 'درس سابق: التحيات والتعارف وبناء الجمل الترحيبية',
    programId: 'prg-arb-01',
    teacherId: 'usr-tea-2',
    studentIds: ['usr-std-1', 'usr-std-2'],
    date: '2026-08-24',
    startTime: '18:00',
    endTime: '19:00',
    zoomUrl: 'https://zoom.us/j/9876543210',
    status: 'COMPLETED',
    topic: 'Ahlan wa Sahlan, Kayfa Haluk, and essential responses',
  },
];

export const initialAttendance: AttendanceRecord[] = [
  {
    id: 'att-001',
    sessionId: 'cls-004',
    studentId: 'usr-std-1',
    teacherId: 'usr-tea-2',
    programId: 'prg-arb-01',
    date: '2026-08-24',
    status: 'PRESENT',
    markedAt: '2026-08-24 18:02',
    notes: 'Arrived on time and actively participated in dialogs.',
  },
  {
    id: 'att-002',
    sessionId: 'cls-004',
    studentId: 'usr-std-2',
    teacherId: 'usr-tea-2',
    programId: 'prg-arb-01',
    date: '2026-08-24',
    status: 'PRESENT',
    markedAt: '2026-08-24 18:05',
  },
  {
    id: 'att-003',
    sessionId: 'cls-prev-1',
    studentId: 'usr-std-1',
    teacherId: 'usr-tea-2',
    programId: 'prg-arb-01',
    date: '2026-08-22',
    status: 'PRESENT',
    markedAt: '2026-08-22 18:00',
  },
  {
    id: 'att-004',
    sessionId: 'cls-prev-2',
    studentId: 'usr-std-1',
    teacherId: 'usr-tea-2',
    programId: 'prg-arb-01',
    date: '2026-08-19',
    status: 'LATE',
    markedAt: '2026-08-19 18:14',
    notes: 'Joined 14 minutes late due to technical connection.',
  },
  {
    id: 'att-005',
    sessionId: 'cls-prev-3',
    studentId: 'usr-std-1',
    teacherId: 'usr-tea-1',
    programId: 'prg-qur-01',
    date: '2026-08-17',
    status: 'PRESENT',
    markedAt: '2026-08-17 19:30',
  },
  {
    id: 'att-006',
    sessionId: 'cls-prev-4',
    studentId: 'usr-std-1',
    teacherId: 'usr-tea-1',
    programId: 'prg-qur-01',
    date: '2026-08-10',
    status: 'ABSENT',
    markedAt: '2026-08-10 19:45',
    notes: 'Excused notice sent prior to session.',
  },
];

// Rich interactive games ready to run in the secure isolated sandbox!
export const initialActivities: Activity[] = [
  {
    id: 'act-001',
    code: 'ACT-ARB01',
    name: 'Arabic Diacritics (Tashkeel) Sound & Shape Matcher',
    nameArabic: 'لعبة مطابقة الحروف بالحركات (فتحة، ضمة، كسرة، سكون)',
    description: 'Listen to the sound and match the correct letter with its proper diacritic mark.',
    descriptionArabic: 'استمع إلى النطق الصوتي الصحيح واختر الحرف المشكول بالحركة المناسبة.',
    category: 'ARABIC',
    level: 'BEGINNER',
    language: 'BILINGUAL',
    status: 'PUBLISHED',
    creatorId: 'usr-tea-2',
    creatorName: 'Ustadh Bilal Hassan',
    assignedProgramIds: ['prg-arb-01'],
    assignedTeacherIds: ['usr-tea-2'],
    createdAt: '2026-01-25',
    updatedAt: '2026-08-20',
    playCount: 184,
    rating: 4.9,
    thumbnailUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
    customCodeHtml: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Arabic Diacritics Matcher</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800&family=Amiri:wght@700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', sans-serif;
      background: linear-gradient(135deg, #29235D 0%, #1D1845 100%);
      color: #FFFFFF;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .game-card {
      background: rgba(255, 255, 255, 0.08);
      border: 2px solid #D3B673;
      border-radius: 20px;
      padding: 30px;
      max-width: 600px;
      width: 100%;
      text-align: center;
      backdrop-filter: blur(10px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 1px solid rgba(211, 182, 115, 0.3);
      padding-bottom: 12px;
    }
    .score-badge {
      background: #D3B673;
      color: #29235D;
      font-weight: 800;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 1.1rem;
    }
    .target-box {
      background: rgba(41, 35, 93, 0.8);
      border: 2px dashed #D3B673;
      border-radius: 16px;
      padding: 25px;
      margin: 20px 0;
    }
    .target-sound {
      font-size: 1.4rem;
      color: #E8D5A3;
      margin-bottom: 10px;
    }
    .play-sound-btn {
      background: #D3B673;
      color: #29235D;
      border: none;
      padding: 10px 24px;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .play-sound-btn:hover {
      background: #E8D5A3;
      transform: translateY(-2px);
    }
    .options-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-top: 25px;
    }
    .opt-btn {
      background: rgba(255, 255, 255, 0.12);
      border: 2px solid rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
      font-family: 'Amiri', serif;
      font-size: 3.5rem;
      line-height: 1;
      padding: 20px;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .opt-btn:hover {
      background: rgba(211, 182, 115, 0.25);
      border-color: #D3B673;
      transform: scale(1.04);
    }
    .feedback {
      min-height: 40px;
      margin-top: 15px;
      font-size: 1.2rem;
      font-weight: 700;
    }
    .correct { color: #4ADE80; }
    .wrong { color: #F87171; }
  </style>
</head>
<body>
  <div class="game-card">
    <div class="header">
      <h2 style="color: #D3B673; font-size: 1.3rem;">ALTEQ — تدريب الحركات والتسجيل الصوتي</h2>
      <div class="score-badge">النقاط: <span id="score">0</span> / <span id="total">5</span></div>
    </div>
    <div class="target-box">
      <div class="target-sound" id="promptText">اختر الحرف الذي ينطق بـ: (بَ - Ba مع الفتحة)</div>
      <button class="play-sound-btn" onclick="speakCurrent()">
        🔊 استمع للنطق
      </button>
    </div>
    <div class="options-grid" id="optionsGrid"></div>
    <div class="feedback" id="feedback"></div>
  </div>

  <script>
    const questions = [
      { prompt: "اختر الحرف المنطوق بـ الفتحة (بَ - Ba)", letter: "بَ", speech: "بَ", options: ["بَ", "بُ", "بِ", "بْ"] },
      { prompt: "اختر الحرف المنطوق بـ الضمة (تُ - Tu)", letter: "تُ", speech: "تُ", options: ["تَ", "تُ", "تِ", "تْ"] },
      { prompt: "اختر الحرف المنطوق بـ الكسرة (جِ - Ji)", letter: "جِ", speech: "جِ", options: ["جَ", "جُ", "جِ", "جْ"] },
      { prompt: "اختر الحرف المنطوق بـ السكون (رْ - R)", letter: "رْ", speech: "رْ", options: ["رَ", "رُ", "رِ", "رْ"] },
      { prompt: "اختر الحرف المنطوق بـ التنوين بالضم (مٌ - Mun)", letter: "مٌ", speech: "مٌ", options: ["مَ", "مٌ", "مٍ", "مً"] }
    ];
    let currentIndex = 0;
    let score = 0;

    function renderQuestion() {
      if (currentIndex >= questions.length) {
        document.querySelector('.game-card').innerHTML = \`
          <h1 style="color:#D3B673; font-size: 2.5rem; margin-bottom: 15px;">🎉 ممتاز! أحسنت</h1>
          <p style="font-size: 1.3rem; margin-bottom: 25px;">لقد أكملت النشاط بنجاح بنتيجة: \${score} من \${questions.length}</p>
          <button class="play-sound-btn" style="margin: 0 auto;" onclick="restart()">إعادة النشاط</button>
        \`;
        return;
      }
      const q = questions[currentIndex];
      document.getElementById('promptText').textContent = q.prompt;
      document.getElementById('score').textContent = score;
      document.getElementById('total').textContent = questions.length;
      document.getElementById('feedback').textContent = '';
      
      const grid = document.getElementById('optionsGrid');
      grid.innerHTML = '';
      
      q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(opt, q.letter);
        grid.appendChild(btn);
      });
      speakCurrent();
    }

    function speakCurrent() {
      const q = questions[currentIndex];
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(q.speech);
        utter.lang = 'ar-SA';
        utter.rate = 0.8;
        window.speechSynthesis.speak(utter);
      }
    }

    function checkAnswer(selected, correct) {
      const fb = document.getElementById('feedback');
      if (selected === correct) {
        score++;
        fb.className = 'feedback correct';
        fb.textContent = '✨ إجابة صحيحة ومتقنة! أحسنت';
        document.querySelectorAll('.opt-btn').forEach(b => b.disabled = true);
        setTimeout(() => {
          currentIndex++;
          renderQuestion();
        }, 1200);
      } else {
        fb.className = 'feedback wrong';
        fb.textContent = '❌ إجابة غير صحيحة، حاول مجدداً';
      }
    }

    function restart() {
      currentIndex = 0;
      score = 0;
      location.reload();
    }

    renderQuestion();
  </script>
</body>
</html>`,
  },
  {
    id: 'act-002',
    code: 'ACT-TAJ01',
    name: 'Tajweed Rules: Noon Sakinah & Tanween Classifier',
    nameArabic: 'لعبة أحكام التجويد: تصنيف أحكام النون الساكنة والتنوين',
    description: 'Drag or click Quranic examples into their correct rule category (Izh-har, Idgham, Iqlab, Ikhfa).',
    descriptionArabic: 'صنّف الأمثلة القرآنية في حكمها الصحيح (إظهار، إدغام، إقلاب، إخفاء) واكسب النقاط.',
    category: 'TAJWEED',
    level: 'INTERMEDIATE',
    language: 'ARABIC',
    status: 'PUBLISHED',
    creatorId: 'usr-tea-1',
    creatorName: 'Sheikh Ahmed Al-Mansoor',
    assignedProgramIds: ['prg-qur-01', 'prg-taj-01'],
    assignedTeacherIds: ['usr-tea-1'],
    createdAt: '2026-02-10',
    updatedAt: '2026-08-22',
    playCount: 245,
    rating: 4.98,
    thumbnailUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=300&auto=format&fit=crop&q=80',
    customCodeHtml: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>Tajweed Rules Matcher</title>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', sans-serif;
      background: #1D1845;
      color: #F8F6F0;
      padding: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .wrapper {
      max-width: 700px;
      width: 100%;
      background: #29235D;
      border: 2px solid #D3B673;
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.5);
    }
    .title {
      color: #D3B673;
      text-align: center;
      font-size: 1.5rem;
      margin-bottom: 8px;
    }
    .subtitle {
      text-align: center;
      font-size: 0.95rem;
      color: #E8D5A3;
      margin-bottom: 20px;
    }
    .verse-card {
      background: #1D1845;
      border: 2px solid #D3B673;
      border-radius: 14px;
      padding: 24px;
      text-align: center;
      margin-bottom: 25px;
    }
    .verse-text {
      font-family: 'Amiri', serif;
      font-size: 2.2rem;
      color: #FFFFFF;
      margin-bottom: 8px;
    }
    .highlight-rule {
      color: #D3B673;
      font-weight: bold;
    }
    .categories {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }
    .cat-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 2px solid rgba(211, 182, 115, 0.4);
      color: #FFFFFF;
      font-size: 1.2rem;
      font-weight: 700;
      padding: 16px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cat-btn:hover {
      background: #D3B673;
      color: #1D1845;
      transform: translateY(-2px);
    }
    .feedback {
      text-align: center;
      margin-top: 18px;
      font-size: 1.1rem;
      min-height: 30px;
      font-weight: 700;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <h1 class="title">ALTEQ — أحكام النون الساكنة والتنوين</h1>
    <div class="subtitle">حدد الحكم التجويدي الصحيح للمثال القرآني التالي:</div>
    <div class="verse-card">
      <div class="verse-text" id="verse">﴿ مَن يَقُولُ ﴾</div>
      <div style="font-size:0.95rem; color:#E8D5A3;" id="explanation">النون الساكنة بعدها حرف الياء</div>
    </div>
    <div class="categories">
      <button class="cat-btn" onclick="selectRule('إظهار حلقي')">إظهار حلقي</button>
      <button class="cat-btn" onclick="selectRule('إدغام')">إدغام (بغنة / بغير غنة)</button>
      <button class="cat-btn" onclick="selectRule('إقلاب')">إقلاب (قلب إلى ميم)</button>
      <button class="cat-btn" onclick="selectRule('إخفاء حقيقي')">إخفاء حقيقي</button>
    </div>
    <div class="feedback" id="feedback"></div>
  </div>

  <script>
    const items = [
      { text: "﴿ مَن يَقُولُ ﴾", note: "النون الساكنة جاء بعدها حرف الياء (من حروف ينمو)", rule: "إدغام" },
      { text: "﴿ مِّنْ خَوْفٍ ﴾", note: "النون الساكنة جاء بعدها حرف الخاء (من حروف الحلق)", rule: "إظهار حلقي" },
      { text: "﴿ مِن بَعْدِ ﴾", note: "النون الساكنة جاء بعدها حرف الباء", rule: "إقلاب" },
      { text: "﴿ كُنتُمْ ﴾", note: "النون الساكنة جاء بعدها حرف التاء", rule: "إخفاء حقيقي" },
      { text: "﴿ عَلِيمٌ حَكِيمٌ ﴾", note: "التنوين جاء بعده حرف الحاء", rule: "إظهار حلقي" }
    ];
    let idx = 0;
    let score = 0;

    function render() {
      if (idx >= items.length) {
        document.querySelector('.wrapper').innerHTML = \`
          <h2 style="color:#D3B673; text-align:center; font-size:2rem; margin-bottom:15px;">🌟 تبارك الله! أحسنت</h2>
          <p style="text-align:center; font-size:1.2rem;">أتقنت تصنيف أحكام التجويد بنجاح!</p>
          <div style="text-align:center; margin-top:20px;">
            <button class="cat-btn" style="display:inline-block; padding:10px 30px;" onclick="location.reload()">إعادة التمرين</button>
          </div>
        \`;
        return;
      }
      document.getElementById('verse').textContent = items[idx].text;
      document.getElementById('explanation').textContent = items[idx].note;
      document.getElementById('feedback').textContent = '';
    }

    function selectRule(rule) {
      const current = items[idx];
      const fb = document.getElementById('feedback');
      if (rule.includes(current.rule)) {
        fb.style.color = '#4ADE80';
        fb.textContent = '✨ أحسنت! إجابة تجويدية صحيحة';
        setTimeout(() => {
          idx++;
          render();
        }, 1200);
      } else {
        fb.style.color = '#F87171';
        fb.textContent = '❌ حاول مرة أخرى.. ركز في الحرف الواقع بعد النون الساكنة أو التنوين';
      }
    }

    render();
  </script>
</body>
</html>`,
  },
  {
    id: 'act-003',
    code: 'ACT-VOC01',
    name: 'Arabic Everyday Objects & Vocabulary Memory Game',
    nameArabic: 'لعبة الذاكرة: مفردات الأشياء اليومية والألوان في اللغة العربية',
    description: 'Flip cards and match Arabic words with their corresponding illustrations and voice recordings.',
    descriptionArabic: 'اقلب البطاقات وطابق الكلمات العربية بالصور واستمع للنطق الصحيح.',
    category: 'VOCABULARY',
    level: 'BEGINNER',
    language: 'BILINGUAL',
    status: 'PUBLISHED',
    creatorId: 'usr-tea-2',
    creatorName: 'Ustadh Bilal Hassan',
    assignedProgramIds: ['prg-arb-01', 'prg-con-01'],
    assignedTeacherIds: ['usr-tea-2'],
    createdAt: '2026-03-01',
    updatedAt: '2026-08-15',
    playCount: 312,
    rating: 4.92,
    thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&auto=format&fit=crop&q=80',
    customCodeHtml: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>Arabic Memory Matcher</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800&family=Amiri:wght@700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', sans-serif;
      background: #29235D;
      color: #FFFFFF;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .header h1 { color: #D3B673; font-size: 1.5rem; }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, 110px);
      gap: 12px;
      justify-content: center;
    }
    .card {
      width: 110px;
      height: 110px;
      background: #1D1845;
      border: 2px solid #D3B673;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.6rem;
      cursor: pointer;
      user-select: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .card.hidden {
      background: linear-gradient(135deg, #3D357F 0%, #1D1845 100%);
      color: transparent;
      border-color: rgba(211, 182, 115, 0.4);
    }
    .card.matched {
      background: #10B981;
      border-color: #34D399;
      cursor: default;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ALTEQ — لعبة مطابقة المفردات العربية</h1>
    <p style="color: #E8D5A3; font-size: 0.95rem;">اطابق بين الكلمات المتشابهة</p>
  </div>
  <div class="grid" id="grid"></div>

  <script>
    const items = ["كتاب 📖", "قلم ✏️", "بيت 🏠", "شمس ☀️", "كتاب 📖", "قلم ✏️", "بيت 🏠", "شمس ☀️"];
    // Shuffle
    items.sort(() => Math.random() - 0.5);

    const grid = document.getElementById('grid');
    let flipped = [];
    let matchedCount = 0;

    items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'card hidden';
      card.dataset.value = item;
      card.dataset.index = index;
      card.textContent = item;
      card.onclick = () => handleFlip(card);
      grid.appendChild(card);
    });

    function handleFlip(card) {
      if (flipped.length >= 2 || !card.classList.contains('hidden')) return;
      card.classList.remove('hidden');
      flipped.push(card);

      if (flipped.length === 2) {
        if (flipped[0].dataset.value === flipped[1].dataset.value) {
          flipped[0].classList.add('matched');
          flipped[1].classList.add('matched');
          matchedCount += 2;
          flipped = [];
          if (matchedCount === items.length) {
            setTimeout(() => {
              alert('🎉 رائع جداً! تم إكمال اللعبة ومطابقة جميع الكلمات.');
            }, 300);
          }
        } else {
          setTimeout(() => {
            flipped.forEach(c => c.classList.add('hidden'));
            flipped = [];
          }, 800);
        }
      }
    }
  </script>
</body>
</html>`,
  },
  {
    id: 'act-004',
    code: 'ACT-QUR01',
    name: 'Ayah Verse Reorder Puzzle: Surah Al-Ikhlas',
    nameArabic: 'ترتيب الآيات الكريمة: سورة الإخلاص والتلاوة العذبة',
    description: 'Arrange the verses of Surah Al-Ikhlas in their correct order and listen to the recitation.',
    descriptionArabic: 'رتب آيات سورة الإخلاص بالترتيب الصحيح واضغط للاستماع للتلاوة.',
    category: 'QURAN',
    level: 'BEGINNER',
    language: 'ARABIC',
    status: 'PUBLISHED',
    creatorId: 'usr-tea-1',
    creatorName: 'Sheikh Ahmed Al-Mansoor',
    assignedProgramIds: ['prg-qur-01'],
    assignedTeacherIds: ['usr-tea-1'],
    createdAt: '2026-03-05',
    updatedAt: '2026-08-18',
    playCount: 420,
    rating: 5.0,
    thumbnailUrl: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?w=300&auto=format&fit=crop&q=80',
    customCodeHtml: `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>Surah Al-Ikhlas Puzzle</title>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', sans-serif;
      background: #1D1845;
      color: #FFFFFF;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .box {
      max-width: 650px;
      width: 100%;
      background: #29235D;
      border: 2px solid #D3B673;
      border-radius: 20px;
      padding: 30px;
      text-align: center;
    }
    .bismillah {
      font-family: 'Amiri', serif;
      font-size: 1.8rem;
      color: #D3B673;
      margin-bottom: 20px;
    }
    .ayah-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 25px;
    }
    .ayah-card {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(211, 182, 115, 0.3);
      padding: 16px;
      border-radius: 12px;
      font-family: 'Amiri', serif;
      font-size: 1.6rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.2s;
    }
    .ayah-card:hover {
      background: rgba(211, 182, 115, 0.2);
      border-color: #D3B673;
    }
    .check-btn {
      background: #D3B673;
      color: #1D1845;
      font-weight: 800;
      border: none;
      padding: 12px 30px;
      font-size: 1.1rem;
      border-radius: 12px;
      cursor: pointer;
    }
    .check-btn:hover { background: #E8D5A3; }
  </style>
</head>
<body>
  <div class="box">
    <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
    <p style="color: #E8D5A3; margin-bottom: 20px;">اضغط على الأسهم لتبديل وترتيب آيات سورة الإخلاص بالترتيب الصحيح:</p>
    <div class="ayah-list" id="list"></div>
    <button class="check-btn" onclick="checkOrder()">تحقق من الترتيب 🌟</button>
    <div id="result" style="margin-top: 15px; font-weight: bold; font-size: 1.2rem;"></div>
  </div>

  <script>
    const correctAyahs = [
      "قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾",
      "اللَّهُ الصَّمَدُ ﴿٢﴾",
      "لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾",
      "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾"
    ];
    let currentOrder = [
      "اللَّهُ الصَّمَدُ ﴿٢﴾",
      "قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾",
      "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾",
      "لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾"
    ];

    function renderList() {
      const container = document.getElementById('list');
      container.innerHTML = '';
      currentOrder.forEach((ayah, index) => {
        const div = document.createElement('div');
        div.className = 'ayah-card';
        div.innerHTML = \`
          <span>\${ayah}</span>
          <div>
            \${index > 0 ? '<button onclick="moveUp(' + index + ')" style="background:none; border:none; color:#D3B673; font-size:1.3rem; cursor:pointer; margin-left:8px;">⬆️</button>' : ''}
            \${index < currentOrder.length - 1 ? '<button onclick="moveDown(' + index + ')" style="background:none; border:none; color:#D3B673; font-size:1.3rem; cursor:pointer;">⬇️</button>' : ''}
          </div>
        \`;
        container.appendChild(div);
      });
    }

    function moveUp(i) {
      const temp = currentOrder[i];
      currentOrder[i] = currentOrder[i - 1];
      currentOrder[i - 1] = temp;
      renderList();
    }

    function moveDown(i) {
      const temp = currentOrder[i];
      currentOrder[i] = currentOrder[i + 1];
      currentOrder[i + 1] = temp;
      renderList();
    }

    function checkOrder() {
      const isCorrect = currentOrder.every((val, idx) => val === correctAyahs[idx]);
      const res = document.getElementById('result');
      if (isCorrect) {
        res.style.color = '#4ADE80';
        res.textContent = '🎉 صدق الله العظيم! أحسنت الترتيب الصحيح لسورة الإخلاص';
      } else {
        res.style.color = '#F87171';
        res.textContent = '❌ الترتيب غير دقيق بعد، راجع أرقام الآيات الكريمة';
      }
    }

    renderList();
  </script>
</body>
</html>`,
  },
];

export const initialLessons: Lesson[] = [
  {
    id: 'lsn-001',
    code: 'LSN-ARB01',
    title: 'Mastering Arabic Letters with Short Vowels (Harakat)',
    titleArabic: 'الدرس الأول: الحروف العربية الهجائية بالحركات القصيرة',
    description: 'Foundation module introducing Fatha, Damma, and Kasra with interactive audio and writing practice.',
    programId: 'prg-arb-01',
    teacherId: 'usr-tea-2',
    level: 'BEGINNER',
    isPublished: true,
    createdAt: '2026-02-01',
    updatedAt: '2026-08-15',
    components: [
      {
        id: 'cmp-1',
        type: 'WHITEBOARD',
        title: 'Letter Tracing & Articulation Board',
        content: JSON.stringify({ notes: 'Practice writing Ba, Ta, Tha on the interactive whiteboard grid.' }),
        order: 1,
      },
      {
        id: 'cmp-2',
        type: 'ACTIVITY',
        title: 'Diacritics Sound Match Game',
        content: 'Interactive game to verify recognition of Fatha, Damma, and Kasra.',
        activityId: 'act-001',
        order: 2,
      },
    ],
  },
  {
    id: 'lsn-002',
    code: 'LSN-TAJ01',
    title: 'Rules of Noon Sakinah & Tanween Applied Workshop',
    titleArabic: 'الدرس التطبيقي: أحكام النون الساكنة والتنوين وتطبيقاتها',
    description: 'Interactive session exploring Izh-har, Idgham, Iqlab, and Ikhfa with live vocal examples.',
    programId: 'prg-qur-01',
    teacherId: 'usr-tea-1',
    level: 'INTERMEDIATE',
    isPublished: true,
    createdAt: '2026-02-15',
    updatedAt: '2026-08-20',
    components: [
      {
        id: 'cmp-3',
        type: 'ACTIVITY',
        title: 'Tajweed Rules Classifier',
        content: 'Sort verses into Izh-har and Idgham.',
        activityId: 'act-002',
        order: 1,
      },
    ],
  },
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'usr-std-1',
    title: 'Upcoming Class Reminder',
    titleArabic: 'تذكير بموعد الحصة القادمة',
    message: 'Your Arabic Letters & Reading session with Ustadh Bilal starts tomorrow at 6:00 PM.',
    messageArabic: 'جلستك التعليمية مع الأستاذ بلال ستبدأ غداً الساعة 6:00 مساءً.',
    type: 'CLASS_REMINDER',
    read: false,
    createdAt: '2026-08-25 10:00',
    link: 'classes',
  },
  {
    id: 'notif-2',
    userId: 'usr-std-1',
    title: 'New Interactive Activity Assigned',
    titleArabic: 'تمت إضافة نشاط تفاعلي جديد',
    message: 'Sheikh Ahmed Al-Mansoor assigned a new Tajweed Quiz for your program.',
    messageArabic: 'أضاف الشيخ أحمد المنصور نشاطاً تجويدياً جديداً لبرنامجك.',
    type: 'ASSIGNMENT',
    read: false,
    createdAt: '2026-08-24 15:30',
    link: 'activities',
  },
  {
    id: 'notif-3',
    userId: 'usr-std-1',
    title: 'Attendance Confirmed',
    titleArabic: 'تم تسجيل الحضور بنجاح',
    message: 'Your attendance for the previous class on Aug 24 was marked as PRESENT.',
    messageArabic: 'تم تسجيل حضورك لحصة 24 أغسطس بنجاح.',
    type: 'ATTENDANCE',
    read: true,
    createdAt: '2026-08-24 19:15',
    link: 'attendance',
  },
];
