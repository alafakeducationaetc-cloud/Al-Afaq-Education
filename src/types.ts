export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'BLOCKED' | 'INACTIVE';

export type StudyMode = 'PRIVATE' | 'GROUP';

export type WeekDay = 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';

export type SlotStatus = 'AVAILABLE' | 'BUSY';

export interface TeacherAvailabilitySlot {
  id: string;
  day: WeekDay;
  dayArabic?: string;
  startTime: string; // e.g. '17:00'
  endTime: string;   // e.g. '19:00'
  title?: string;    // e.g. 'حلقة التجويد' / 'تأسيس اللغة العربية'
  studyType: 'PRIVATE' | 'GROUP' | 'BOTH';
  maxStudents?: number;
  isAvailable: boolean; // true = Available, false = Busy
  status?: SlotStatus;  // 'AVAILABLE' | 'BUSY'
  notes?: string;
}

export type ProgramCategory = 
  | 'ARABIC_LANGUAGE'
  | 'QURAN_RECITATION'
  | 'TAJWEED_MASTERY'
  | 'ISLAMIC_STUDIES'
  | 'CONVERSATION'
  | 'GRAMMAR_NAHW'
  | 'READING_WRITING';

export type ProgramLevel = 'BEGINNER' | 'ELEMENTARY' | 'INTERMEDIATE' | 'ADVANCED';

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type ActivityCategory = 
  | 'ARABIC'
  | 'QURAN'
  | 'TAJWEED'
  | 'GRAMMAR'
  | 'VOCABULARY'
  | 'READING'
  | 'WRITING'
  | 'LISTENING'
  | 'SPEAKING'
  | 'GAMES'
  | 'TESTS';

export type ActivityLevel = 'ALL_LEVELS' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type ActivityStatus = 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';

export type LessonComponentType = 'WHITEBOARD' | 'ACTIVITY' | 'TEXT' | 'AUDIO' | 'VIDEO' | 'QUIZ' | 'NOTES';

export interface TeacherPermissions {
  canCreateLessons: boolean; // إضافة وتعديل وحدات الدروس
  canCreateActivities: boolean; // إنشاء وبرمجة الألعاب التفاعلية
  canManageAttendance: boolean; // تسجيل ومراجعة سجلات الحضور
  canScheduleClasses: boolean; // جدولة الحصص المباشرة وروابط Zoom
  canViewAllReports: boolean; // الاطلاع على التقارير الشاملة
  canIssueCertificates: boolean; // إصدار الشهادات والتقييمات الأكاديمية
  canAccessWhiteboard: boolean; // استخدام السبورة التفاعلية
  canEditCurriculum: boolean; // تعديل محتوى وتفاصيل البرامج
}

export interface User {
  id: string;
  code: string; // STD-XXXX, TEA-XXXX, ADM-XXXX
  name: string;
  nameArabic?: string;
  email?: string;
  phone?: string;
  password?: string; // Specific password for this user
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  joinedDate: string;
  lastLogin?: string;
  permissions?: string[] | TeacherPermissions;
}

export interface StudentProfile extends User {
  role: 'STUDENT';
  nativeLanguage?: string;
  assignedTeacherIds: string[];
  enrolledProgramIds: string[];
  activeSubscriptionId?: string;
  preferredStudyMode?: StudyMode;
  isEmailVerified?: boolean;
  notes?: string;
}

export interface TeacherProfile extends User {
  role: 'TEACHER';
  specialization: string;
  specializationArabic?: string;
  bio?: string;
  assignedProgramIds: string[];
  assignedStudentIds: string[];
  teacherPermissions?: TeacherPermissions;
  rating?: number;
  totalClassesTaught?: number;
  availabilitySlots?: TeacherAvailabilitySlot[];
  hourlyRatePrivateUSD?: number;
  monthlyRateGroupUSD?: number;
  signatureUrl?: string; // Saved teacher signature image (transparent PNG or data URL)
  sealUrl?: string;      // Saved teacher official seal/stamp image
  titleArabic?: string;  // e.g. 'المعلم والمشرف الأكاديمي'
}

export interface Program {
  id: string;
  code: string; // PRG-XXXX
  name: string;
  nameArabic: string;
  description: string;
  descriptionArabic?: string;
  category: ProgramCategory;
  level: ProgramLevel;
  language: string;
  durationMonths: number;
  price: number; // default base price
  privatePrice?: number; // Price for 1-on-1 private tutoring
  groupPrice?: number;   // Price for interactive group class
  currency: string;
  totalSessions: number;
  sessionDurationMinutes: number;
  assignedTeacherIds: string[];
  enrolledStudentIds: string[];
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'UPCOMING' | 'ARCHIVED';
  thumbnailUrl?: string;
}

export interface Subscription {
  id: string;
  studentId: string;
  programId: string;
  teacherId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalSessions: number;
  attendedSessions: number;
  remainingSessions: number;
  studyMode?: StudyMode;
  status: SubscriptionStatus;
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE' | 'SCHOLARSHIP';
  amount: number;
  notes?: string;
}

export type ThemeMode = 'light' | 'night' | 'sepia';

export type ClassSessionStatus =
  | 'SCHEDULED'   // Coming Classes (قادمة / مجدولة)
  | 'LIVE'        // Running (جارية الآن / مباشر)
  | 'COMPLETED'   // Completed (مكتملة / تم الحضور)
  | 'MISSED'      // Missed (فائتة)
  | 'TRIAL'       // Trial (تجريبية)
  | 'RESCHEDULED' // Rescheduled (مؤجلة / معاد جدولتها)
  | 'CANCELLED'   // Canceled (ملغاة)
  | 'ABSENT';     // Absent (غياب)

export interface ClassSession {
  id: string;
  title: string;
  titleArabic?: string;
  programId: string;
  teacherId: string;
  studentIds: string[];
  studyMode?: StudyMode;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM (24h)
  endTime: string; // HH:MM (24h)
  durationMinutes?: number;
  zoomUrl: string;
  zoomMeetingId?: string;
  zoomPassword?: string;
  status: ClassSessionStatus;
  topic?: string;
  lessonId?: string;
  notes?: string;
  isLockedDueToQuota?: boolean;
  cancelledBy?: UserRole;
  cancellationReason?: string;
  cancelledAt?: string;
  isEarlyCancelledWithoutDeduction?: boolean;
  rescheduledFromDate?: string;
  rescheduledFromTime?: string;
  rescheduledAt?: string;
  rescheduleReason?: string;
}

export type MessageAttachmentType = 'IMAGE' | 'FILE' | 'GAME_LINK';

export interface MessageAttachment {
  id: string;
  type: MessageAttachmentType;
  name: string;
  url: string;
  size?: string;
  activityId?: string; // Reference to platform interactive electronic game
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  recipientId?: string;     // For 1-on-1 private chat (Student <-> Teacher)
  groupId?: string;         // For Group Circle (Class Session ID or Program ID)
  groupTitle?: string;      // e.g. "حلقة تأسيس اللغة العربية"
  content: string;
  attachments?: MessageAttachment[];
  timestamp: string;
  readBy?: string[];
  isGroup?: boolean;
}

export interface ChatThread {
  id: string;
  type: 'PRIVATE' | 'GROUP';
  participantIds: string[];
  title?: string;
  titleArabic?: string;
  classSessionId?: string;
  programId?: string;
  lastMessage?: ChatMessage;
  unreadCount?: number;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId?: string;
  studentId: string;
  teacherId: string;
  programId?: string;
  date: string;
  status: AttendanceStatus;
  markedAt: string;
  notes?: string;
}

export interface Activity {
  id: string;
  code: string; // ACT-XXXX
  name: string;
  nameArabic?: string;
  description: string;
  descriptionArabic?: string;
  category: ActivityCategory;
  level: ActivityLevel;
  language: 'ARABIC' | 'ENGLISH' | 'BILINGUAL';
  customCodeHtml?: string; // HTML/CSS/JS bundled code for sandboxed player
  status: ActivityStatus;
  creatorId: string;
  creatorName: string;
  assignedProgramIds: string[];
  assignedTeacherIds: string[];
  createdAt: string;
  updatedAt: string;
  playCount: number;
  rating?: number;
  thumbnailUrl?: string;
  type?: 'SANDBOX_CODE' | 'BUILTIN_FLASHCARDS' | 'BUILTIN_QUIZ' | 'BUILTIN_ORDERING';
}

export interface LessonComponent {
  id: string;
  type: LessonComponentType;
  title: string;
  content: string; // Markdown or JSON configuration
  activityId?: string;
  mediaUrl?: string;
  order: number;
}

export interface Lesson {
  id: string;
  code: string; // LSN-XXXX
  title: string;
  titleArabic?: string;
  description: string;
  programId: string;
  teacherId?: string;
  level?: ProgramLevel;
  unitNumber?: number;
  components?: LessonComponent[];
  isPublished?: boolean;
  objectives?: string[];
  vocabulary?: { arabic: string; transliteration: string; meaning: string; example?: string }[];
  grammarRules?: { ruleName: string; explanation: string; examples?: string[] }[];
  attachedActivityIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export type NotificationAudience = 'ALL' | 'STUDENTS' | 'TEACHERS' | 'INDIVIDUAL';

export interface NotificationItem {
  id: string;
  userId?: string; // Specific user ID if targeted individually
  targetAudience?: NotificationAudience;
  title: string;
  titleArabic?: string;
  message: string;
  messageArabic?: string;
  type: 'CLASS_REMINDER' | 'SUBSCRIPTION' | 'ASSIGNMENT' | 'ATTENDANCE' | 'SYSTEM' | 'PAYMENT';
  read: boolean;
  readBy?: string[];
  createdAt: string;
  link?: string;
  senderName?: string;
  senderRole?: UserRole;
}

export interface Certificate {
  id: string;
  code: string; // CERT-2026-XXXX
  studentId: string;
  studentName: string;
  studentNameArabic?: string;
  studentCode?: string;
  teacherId?: string;
  teacherName: string;
  teacherNameArabic?: string;
  teacherTitle?: string;
  programId: string;
  programName: string;
  programNameArabic?: string;
  title?: string;
  description?: string;
  issueDate: string; // YYYY-MM-DD
  completionDate?: string;
  grade?: string; // e.g. 'ممتاز مع مرتبة الشرف'
  gradeEnglish?: string; // e.g. 'Excellent with Highest Honors'
  descriptionArabic?: string;
  descriptionEnglish?: string;
  issuedByUserId?: string;
  issuedByRole?: UserRole;
  supervisorSignatureName?: string;
  supervisorSignatureTitle?: string;
  teacherSignatureType?: 'DRAWN' | 'TEXT' | 'IMAGE' | 'IMAGE_UPLOAD' | 'STAMP';
  teacherSignatureText?: string;
  teacherSignatureUrl?: string;
  teacherSignatureData?: string; // base64 / text
  teacherSignatureTitle?: string;
  teacherSealUrl?: string;
  sealTitle?: string;
  includePlatformStamp?: boolean;
  academyStampType?: 'OFFICIAL_GOLD' | 'OFFICIAL_EMBLEM' | 'CUSTOM_UPLOAD' | 'NONE';
  academyStampUrl?: string;
  templateMode?: 'PRESET_ROYAL' | 'PRESET_ISLAMIC' | 'PRESET_MODERN' | 'PRESET_CLASSIC' | 'CUSTOM_IMAGE';
  customBackgroundImageUrl?: string;
  customImageWidth?: number;
  customImageHeight?: number;
  hideBuiltinBorders?: boolean;
  borderStyle?: string;
  customLayoutFields?: CertificateFieldLayout[];
  status: 'ISSUED' | 'DRAFT' | 'REVOKED';
  qrVerificationUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface CertificateFieldLayout {
  id: string; // 'studentName' | 'courseTitle' | 'issueDate' | 'grade' | 'description' | 'teacherName' | 'teacherSignature' | 'qrCode' | 'platformStamp' | 'certTitle' | 'certCode' | 'basmala'
  label: string;
  labelArabic: string;
  xPercent: number; // 0 to 100 (% of canvas width)
  yPercent: number; // 0 to 100 (% of canvas height)
  fontSize: number; // pt size e.g. 14, 18, 24, 32, 48
  fontWeight?: 'normal' | 'bold' | 'extrabold';
  fontFamily?: 'serif' | 'sans' | 'mono';
  color?: string; // hex color e.g. #29235D, #8C6826
  textAlign?: 'center' | 'right' | 'left';
  visible: boolean;
  prefix?: string;
  suffix?: string;
  customText?: string;
}

export interface PlatformSettings {
  platformName: string;
  platformNameArabic: string;
  tagline: string;
  taglineArabic: string;
  primaryNavy: string;
  accentGold: string;
  defaultLanguage: 'en' | 'ar';
  studentCodePrefix: string;
  teacherCodePrefix: string;
  programCodePrefix: string;
  activityCodePrefix: string;
  defaultSessionDuration: number;
  defaultZoomLink: string;
  enableRTL: boolean;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber?: string;
  whatsappCustomMessage?: string;
  adminPasscode?: string; // Master security passcode for Super Admin to unlock everything
  logoUrl?: string; // Custom logo image URL (uploaded or web)
  platformLogoUrl?: string;
  logoDisplayMode?: 'emblem' | 'custom' | 'combined'; // Logo rendering preference
  logoTextEn?: string;
  logoTextAr?: string;
}

export interface RolePermission {
  role: UserRole;
  permissions: string[];
}
