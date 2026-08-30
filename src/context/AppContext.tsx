import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  StudentProfile,
  TeacherProfile,
  TeacherPermissions,
  Program,
  Subscription,
  SubscriptionStatus,
  ClassSession,
  AttendanceRecord,
  Activity,
  Lesson,
  NotificationItem,
  PlatformSettings,
  AttendanceStatus,
  StudyMode,
  TeacherAvailabilitySlot,
} from '../types';
import {
  initialSettings,
  initialAdmin,
  initialTeachers,
  initialStudents,
  initialPrograms,
  initialSubscriptions,
  initialClasses,
  initialAttendance,
  initialActivities,
  initialLessons,
  initialNotifications,
} from '../data/seedData';
import {
  saveCloudDoc,
  deleteCloudDoc,
  subscribeToCloudCollection,
  subscribeToCloudDoc,
  CLOUD_COLLECTIONS,
} from '../lib/cloudStorage';

const defaultTeacherPermissions: TeacherPermissions = {
  canCreateLessons: true,
  canCreateActivities: true,
  canManageAttendance: true,
  canScheduleClasses: true,
  canViewAllReports: false,
  canIssueCertificates: true,
  canAccessWhiteboard: true,
  canEditCurriculum: false,
};

interface AppContextType {
  currentUser: User | StudentProfile | TeacherProfile | null;
  setCurrentUser: (user: User | StudentProfile | TeacherProfile | null) => void;
  users: User[];
  students: StudentProfile[];
  teachers: TeacherProfile[];
  programs: Program[];
  subscriptions: Subscription[];
  classes: ClassSession[];
  attendance: AttendanceRecord[];
  activities: Activity[];
  lessons: Lesson[];
  notifications: NotificationItem[];
  settings: PlatformSettings;
  isCloudSynced: boolean;
  
  // Auth & Permissions
  loginWithCode: (code: string, nameOrPass?: string, requiredRole?: 'STUDENT' | 'TEACHER' | 'ADMIN') => { success: boolean; message?: string };
  switchDemoUser: (userIdOrCode: string) => void;
  logout: () => void;
  hasTeacherPermission: (permissionKey: keyof TeacherPermissions) => boolean;
  
  // Admin & User Profile
  updateCurrentUserProfile: (updates: Partial<User>) => void;
  updateAdminPasscode: (newPasscode: string) => void;
  updateUserPassword: (userId: string, newPassword: string) => void;
  updateUserAvatar: (userId: string, newAvatarUrl: string) => void;
  updatePlatformLogo: (logoUrl: string, logoDisplayMode?: 'emblem' | 'custom' | 'combined', logoTextEn?: string, logoTextAr?: string) => void;
  
  // Student operations
  addStudent: (student: Omit<StudentProfile, 'id' | 'code' | 'joinedDate'>) => void;
  updateStudent: (id: string, updates: Partial<StudentProfile>) => void;
  deleteStudent: (id: string) => void;
  
  // Teacher operations (Super Admin controls)
  addTeacher: (teacher: Omit<TeacherProfile, 'id' | 'code' | 'joinedDate'> & { teacherPermissions?: TeacherPermissions }) => void;
  updateTeacher: (id: string, updates: Partial<TeacherProfile>) => void;
  deleteTeacher: (id: string) => void;
  updateTeacherPermissions: (teacherId: string, permissions: Partial<TeacherPermissions>) => void;
  assignTeacherPrograms: (teacherId: string, programIds: string[]) => void;
  regenerateUserCode: (userId: string) => string;
  
  // Program operations
  addProgram: (program: Omit<Program, 'id' | 'code'>) => void;
  updateProgram: (id: string, updates: Partial<Program>) => void;
  deleteProgram: (id: string) => void;
  
  // Subscription operations
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  extendSubscription: (id: string, additionalDays: number, additionalSessions: number) => void;
  rechargeStudentSessions: (studentId: string, additionalSessions: number, additionalDays?: number, notes?: string) => void;
  getStudentQuota: (studentId: string) => {
    remainingSessions: number;
    totalSessions: number;
    attendedSessions: number;
    isExpired: boolean;
    isEligible: boolean;
    status: string;
  };
  
  // Class / Schedule operations
  addClassSession: (cls: Omit<ClassSession, 'id'>) => void;
  updateClassSession: (id: string, updates: Partial<ClassSession>) => void;
  deleteClassSession: (id: string) => void;
  
  // Attendance operations
  markAttendance: (record: Omit<AttendanceRecord, 'id' | 'markedAt'>) => void;
  
  // Activity operations
  addActivity: (act: Omit<Activity, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'playCount'>) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  
  // Lesson operations
  addLesson: (lsn: Omit<Lesson, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => void;
  updateLesson: (id: string, updates: Partial<Lesson>) => void;
  
  // Settings & Notifications
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
  markNotificationAsRead: (id: string) => void;
  
  // Stats helpers
  getStudentStats: (studentId: string) => {
    attendanceRate: number;
    attendedCount: number;
    absentCount: number;
    lateCount: number;
    activeSubscription: Subscription | null;
    activeProgram: Program | null;
    primaryTeacher: TeacherProfile | null;
    daysRemaining: number;
    sessionsRemaining: number;
  };

  // Public enrollment & Self Registration
  registerStudentAndEnroll: (data: {
    name: string;
    nameArabic?: string;
    email: string;
    phone?: string;
    programId: string;
    teacherId?: string;
    studyMode: StudyMode;
    preferredSlotId?: string;
    customPassword?: string;
  }) => {
    student: StudentProfile;
    tempPass: string;
    code: string;
    program: Program;
    teacher?: TeacherProfile;
    subscription: Subscription;
  };
  updateTeacherAvailability: (teacherId: string, slots: TeacherAvailabilitySlot[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage keys helper
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`alteq_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const [settings, setSettings] = useState<PlatformSettings>(() => loadStored('settings', initialSettings));
  const [adminProfile, setAdminProfile] = useState<User>(() => loadStored('admin_profile', initialAdmin));
  const [students, setStudents] = useState<StudentProfile[]>(() => loadStored('students', initialStudents));
  const [teachers, setTeachers] = useState<TeacherProfile[]>(() => loadStored('teachers', initialTeachers));
  const [programs, setPrograms] = useState<Program[]>(() => loadStored('programs', initialPrograms));
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => loadStored('subscriptions', initialSubscriptions));
  const [classes, setClasses] = useState<ClassSession[]>(() => loadStored('classes', initialClasses));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => loadStored('attendance', initialAttendance));
  const [activities, setActivities] = useState<Activity[]>(() => loadStored('activities', initialActivities));
  const [lessons, setLessons] = useState<Lesson[]>(() => loadStored('lessons', initialLessons));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadStored('notifications', initialNotifications));
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);
  
  // Current user state (defaults to null so the public Home page is loaded when visiting)
  const [currentUser, setCurrentUser] = useState<User | StudentProfile | TeacherProfile | null>(() => {
    const savedId = localStorage.getItem('alteq_current_user_id');
    const storedAdmin = loadStored('admin_profile', initialAdmin);
    const storedStudents = loadStored('students', initialStudents);
    const storedTeachers = loadStored('teachers', initialTeachers);
    if (savedId) {
      if (savedId === storedAdmin.id || savedId === initialAdmin.id) return storedAdmin;
      const foundStd = storedStudents.find(s => s.id === savedId);
      if (foundStd) return foundStd;
      const foundTea = storedTeachers.find(t => t.id === savedId);
      if (foundTea) return foundTea;
    }
    // If not found or deleted, clear storage and default to null (Public Home)
    localStorage.removeItem('alteq_current_user_id');
    return null;
  });

  // Local storage persistence
  useEffect(() => { localStorage.setItem('alteq_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('alteq_admin_profile', JSON.stringify(adminProfile)); }, [adminProfile]);
  useEffect(() => { localStorage.setItem('alteq_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('alteq_teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('alteq_programs', JSON.stringify(programs)); }, [programs]);
  useEffect(() => { localStorage.setItem('alteq_subscriptions', JSON.stringify(subscriptions)); }, [subscriptions]);
  useEffect(() => { localStorage.setItem('alteq_classes', JSON.stringify(classes)); }, [classes]);
  useEffect(() => { localStorage.setItem('alteq_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('alteq_activities', JSON.stringify(activities)); }, [activities]);
  useEffect(() => { localStorage.setItem('alteq_lessons', JSON.stringify(lessons)); }, [lessons]);
  useEffect(() => { localStorage.setItem('alteq_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { 
    if (currentUser) {
      localStorage.setItem('alteq_current_user_id', currentUser.id);
    } else {
      localStorage.removeItem('alteq_current_user_id');
    }
  }, [currentUser]);

  // ==========================================
  // REAL-TIME CLOUD SYNC (FIRESTORE LISTENERS)
  // ==========================================
  useEffect(() => {
    // 1. Subscribe to Students
    const unsubStudents = subscribeToCloudCollection<StudentProfile>(
      CLOUD_COLLECTIONS.STUDENTS,
      cloudStudents => {
        if (cloudStudents && cloudStudents.length > 0) {
          setStudents(cloudStudents);
          setIsCloudSynced(true);
        }
      }
    );

    // 2. Subscribe to Teachers
    const unsubTeachers = subscribeToCloudCollection<TeacherProfile>(
      CLOUD_COLLECTIONS.TEACHERS,
      cloudTeachers => {
        if (cloudTeachers && cloudTeachers.length > 0) {
          setTeachers(cloudTeachers);
        }
      }
    );

    // 3. Subscribe to Programs
    const unsubPrograms = subscribeToCloudCollection<Program>(
      CLOUD_COLLECTIONS.PROGRAMS,
      cloudPrograms => {
        if (cloudPrograms && cloudPrograms.length > 0) {
          setPrograms(cloudPrograms);
        }
      }
    );

    // 4. Subscribe to Subscriptions
    const unsubSubscriptions = subscribeToCloudCollection<Subscription>(
      CLOUD_COLLECTIONS.SUBSCRIPTIONS,
      cloudSubs => {
        if (cloudSubs && cloudSubs.length > 0) {
          setSubscriptions(cloudSubs);
        }
      }
    );

    // 5. Subscribe to Classes
    const unsubClasses = subscribeToCloudCollection<ClassSession>(
      CLOUD_COLLECTIONS.CLASSES,
      cloudClasses => {
        if (cloudClasses && cloudClasses.length > 0) {
          setClasses(cloudClasses);
        }
      }
    );

    // 6. Subscribe to Attendance
    const unsubAttendance = subscribeToCloudCollection<AttendanceRecord>(
      CLOUD_COLLECTIONS.ATTENDANCE,
      cloudAtt => {
        if (cloudAtt && cloudAtt.length > 0) {
          setAttendance(cloudAtt);
        }
      }
    );

    // 7. Subscribe to Activities
    const unsubActivities = subscribeToCloudCollection<Activity>(
      CLOUD_COLLECTIONS.ACTIVITIES,
      cloudActs => {
        if (cloudActs && cloudActs.length > 0) {
          setActivities(cloudActs);
        }
      }
    );

    // 8. Subscribe to Lessons
    const unsubLessons = subscribeToCloudCollection<Lesson>(
      CLOUD_COLLECTIONS.LESSONS,
      cloudLsns => {
        if (cloudLsns && cloudLsns.length > 0) {
          setLessons(cloudLsns);
        }
      }
    );

    // 9. Subscribe to Notifications
    const unsubNotifications = subscribeToCloudCollection<NotificationItem>(
      CLOUD_COLLECTIONS.NOTIFICATIONS,
      cloudNotifs => {
        if (cloudNotifs && cloudNotifs.length > 0) {
          setNotifications(cloudNotifs);
        }
      }
    );

    // 10. Subscribe to Platform Settings Doc
    const unsubSettings = subscribeToCloudDoc<PlatformSettings>(
      CLOUD_COLLECTIONS.SETTINGS,
      'global_settings',
      cloudSettings => {
        if (cloudSettings) {
          setSettings(prev => ({ ...prev, ...cloudSettings }));
        }
      }
    );

    // 11. Subscribe to Admin Profile Doc
    const unsubAdmin = subscribeToCloudDoc<User>(
      CLOUD_COLLECTIONS.ADMIN_PROFILE,
      'main_admin',
      cloudAdmin => {
        if (cloudAdmin) {
          setAdminProfile(prev => ({ ...prev, ...cloudAdmin }));
        }
      }
    );

    return () => {
      unsubStudents();
      unsubTeachers();
      unsubPrograms();
      unsubSubscriptions();
      unsubClasses();
      unsubAttendance();
      unsubActivities();
      unsubLessons();
      unsubNotifications();
      unsubSettings();
      unsubAdmin();
    };
  }, []);

  // Combined users list
  const users: User[] = [adminProfile, ...teachers, ...students];

  // Auth implementation with strict portal/role separation
  const loginWithCode = (
    code: string,
    nameOrPass?: string,
    requiredRole?: 'STUDENT' | 'TEACHER' | 'ADMIN'
  ): { success: boolean; message?: string } => {
    const cleanCode = code.trim().toUpperCase();
    const cleanName = (nameOrPass || '').trim();
    const cleanNameLower = cleanName.toLowerCase();
    const currentAdminPasscode = (settings.adminPasscode || 'admin123').trim();

    // 1. Check account classifications
    const isAdminAccount =
      cleanCode === 'ADM-0001' ||
      cleanCode === 'ADMIN' ||
      cleanCode === (adminProfile.code || '').toUpperCase() ||
      (adminProfile.email && cleanCode === adminProfile.email.toUpperCase()) ||
      (settings.contactEmail && cleanCode === settings.contactEmail.toUpperCase());

    const matchedTeacher = teachers.find(
      t => t.code.toUpperCase() === cleanCode || (t.email && t.email.toUpperCase() === cleanCode)
    );

    const matchedStudent = students.find(
      s => s.code.toUpperCase() === cleanCode || (s.email && s.email.toUpperCase() === cleanCode)
    );

    // 2. Strict Role/Portal Verification Guard
    if (requiredRole === 'STUDENT') {
      if (isAdminAccount || cleanCode.startsWith('ADM') || cleanCode === currentAdminPasscode.toUpperCase()) {
        return {
          success: false,
          message: 'هذا الكود مخصص لحساب المدير العام (الإدارة) ولا يمكن الدخول به من بوابة المتدربين (الطلاب). يرجى التبديل لبوابة المدير العام.',
        };
      }
      if (matchedTeacher || cleanCode.startsWith('TEA')) {
        return {
          success: false,
          message: 'هذا الكود مخصص لحساب المدرب (المعلم) ولا يمكن الدخول به من بوابة المتدربين (الطلاب). يرجى التبديل لبوابة المدربين.',
        };
      }
      if (!matchedStudent) {
        return {
          success: false,
          message: 'كود المتدرب غير مسجل أو غير صحيح. يرجى إدخال كود المتدرب الخاص بك (مثال: STD-1001).',
        };
      }
    }

    if (requiredRole === 'TEACHER') {
      if (isAdminAccount || cleanCode.startsWith('ADM') || cleanCode === currentAdminPasscode.toUpperCase()) {
        return {
          success: false,
          message: 'هذا الكود مخصص لحساب المدير العام (الإدارة) ولا يمكن الدخول به من بوابة المدربين. يرجى التبديل لبوابة المدير العام.',
        };
      }
      if (matchedStudent || cleanCode.startsWith('STD')) {
        return {
          success: false,
          message: 'هذا الكود مخصص لحساب المتدرب (الطالب) ولا يمكن الدخول به من بوابة المدربين. يرجى التبديل لبوابة المتدربين.',
        };
      }
      if (!matchedTeacher) {
        return {
          success: false,
          message: 'كود المدرب غير مسجل أو غير صحيح. يرجى إدخال كود المدرب الخاص بك (مثال: TEA-8821).',
        };
      }
    }

    if (requiredRole === 'ADMIN') {
      if (matchedTeacher || cleanCode.startsWith('TEA')) {
        return {
          success: false,
          message: 'هذا الكود مخصص لحساب المدرب ولا يمكن الدخول به في بوابة المدير العام. يرجى الدخول من بوابة المدربين.',
        };
      }
      if (matchedStudent || cleanCode.startsWith('STD')) {
        return {
          success: false,
          message: 'هذا الكود مخصص لحساب المتدرب ولا يمكن الدخول به في بوابة المدير العام. يرجى الدخول من بوابة المتدربين.',
        };
      }
      if (!isAdminAccount && cleanCode !== currentAdminPasscode.toUpperCase()) {
        return {
          success: false,
          message: 'كود المدير العام غير صحيح. يرجى إدخال كود المشرف العام (ADM-0001).',
        };
      }
    }

    // 3. Authenticate within matching role
    // Admin Authentication
    if (isAdminAccount || cleanCode === currentAdminPasscode.toUpperCase()) {
      if (requiredRole && requiredRole !== 'ADMIN') {
        return {
          success: false,
          message: 'غير مصرح بالدخول لحساب الإدارة من هذه البوابة.',
        };
      }
      const adminPassword = adminProfile.password || currentAdminPasscode;
      const isPassCorrect =
        cleanName === currentAdminPasscode ||
        cleanName === adminPassword ||
        cleanNameLower === 'admin123' ||
        (cleanName === '' && cleanCode === currentAdminPasscode.toUpperCase());

      if (isPassCorrect) {
        setCurrentUser(adminProfile);
        return { success: true };
      }
      return { success: false, message: 'كلمة مرور المشرف العام غير صحيحة.' };
    }

    // Teacher Authentication
    if (matchedTeacher) {
      if (requiredRole && requiredRole !== 'TEACHER') {
        return {
          success: false,
          message: 'هذا الحساب مخصص للمدربين والمعلمين، يرجى التبديل لبوابة المدربين.',
        };
      }
      if (matchedTeacher.status === 'BLOCKED' || matchedTeacher.status === 'SUSPENDED') {
        return { success: false, message: `حساب المدرب موقوف حالياً (${matchedTeacher.status}).` };
      }
      const teacherPass = matchedTeacher.password || 'teacher123';
      const isPassCorrect =
        !cleanName ||
        cleanName === teacherPass ||
        matchedTeacher.name.toLowerCase().includes(cleanNameLower) ||
        (matchedTeacher.nameArabic && matchedTeacher.nameArabic.includes(nameOrPass || ''));

      if (!isPassCorrect) {
        return { success: false, message: 'كلمة مرور المدرب غير صحيحة.' };
      }
      setCurrentUser(matchedTeacher);
      return { success: true };
    }

    // Student Authentication
    if (matchedStudent) {
      if (requiredRole && requiredRole !== 'STUDENT') {
        return {
          success: false,
          message: 'هذا الحساب مخصص للمتدربين والطلاب، يرجى التبديل لبوابة المتدربين.',
        };
      }
      if (matchedStudent.status === 'BLOCKED' || matchedStudent.status === 'SUSPENDED') {
        return { success: false, message: `حساب المتدرب موقوف حالياً (${matchedStudent.status}).` };
      }
      const studentPass = matchedStudent.password || 'student123';
      const isPassCorrect =
        !cleanName ||
        cleanName === studentPass ||
        matchedStudent.name.toLowerCase().includes(cleanNameLower) ||
        (matchedStudent.nameArabic && matchedStudent.nameArabic.includes(nameOrPass || ''));

      if (!isPassCorrect) {
        return { success: false, message: 'كلمة مرور المتدرب غير صحيحة.' };
      }
      setCurrentUser(matchedStudent);
      return { success: true };
    }

    return { success: false, message: 'بيانات الدخول غير صحيحة. يرجى التأكد من الكود وكلمة المرور.' };
  };

  const switchDemoUser = (userIdOrCode: string) => {
    if (userIdOrCode === 'admin' || userIdOrCode === adminProfile.id || userIdOrCode === adminProfile.code || userIdOrCode === initialAdmin.id) {
      setCurrentUser(adminProfile);
      return;
    }
    const foundStd = students.find(s => s.id === userIdOrCode || s.code === userIdOrCode);
    if (foundStd) {
      setCurrentUser(foundStd);
      return;
    }
    const foundTea = teachers.find(t => t.id === userIdOrCode || t.code === userIdOrCode);
    if (foundTea) {
      setCurrentUser(foundTea);
      return;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Update current user profile (including avatar, name, bio, etc.)
  const updateCurrentUserProfile = (updates: Partial<User>) => {
    if (!currentUser) return;

    if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') {
      const updatedAdmin = { ...adminProfile, ...updates };
      setAdminProfile(updatedAdmin);
      setCurrentUser(updatedAdmin);
      saveCloudDoc(CLOUD_COLLECTIONS.ADMIN_PROFILE, 'main_admin', updatedAdmin);
    } else if (currentUser.role === 'TEACHER') {
      updateTeacher(currentUser.id, updates as Partial<TeacherProfile>);
    } else if (currentUser.role === 'STUDENT') {
      updateStudent(currentUser.id, updates as Partial<StudentProfile>);
    }
  };

  // Update Admin Master Passcode
  const updateAdminPasscode = (newPasscode: string) => {
    if (!newPasscode || newPasscode.trim().length < 3) return;
    const clean = newPasscode.trim();
    const updatedSettings = { ...settings, adminPasscode: clean };
    const updatedAdmin = { ...adminProfile, password: clean };
    setSettings(updatedSettings);
    setAdminProfile(updatedAdmin);
    saveCloudDoc(CLOUD_COLLECTIONS.SETTINGS, 'global_settings', updatedSettings);
    saveCloudDoc(CLOUD_COLLECTIONS.ADMIN_PROFILE, 'main_admin', updatedAdmin);
  };

  // Update password for ANY user (Admin control)
  const updateUserPassword = (userId: string, newPassword: string) => {
    if (!newPassword || newPassword.trim().length < 2) return;
    const clean = newPassword.trim();
    
    if (userId === adminProfile.id || userId === 'admin' || userId === adminProfile.code) {
      updateAdminPasscode(clean);
      return;
    }

    const isTeacher = teachers.some(t => t.id === userId);
    if (isTeacher) {
      const targetTeacher = teachers.find(t => t.id === userId);
      if (targetTeacher) {
        const updated = { ...targetTeacher, password: clean };
        setTeachers(prev => prev.map(t => t.id === userId ? updated : t));
        saveCloudDoc(CLOUD_COLLECTIONS.TEACHERS, userId, updated);
      }
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, password: clean } : null);
      }
      return;
    }

    const isStudent = students.some(s => s.id === userId);
    if (isStudent) {
      const targetStudent = students.find(s => s.id === userId);
      if (targetStudent) {
        const updated = { ...targetStudent, password: clean };
        setStudents(prev => prev.map(s => s.id === userId ? updated : s));
        saveCloudDoc(CLOUD_COLLECTIONS.STUDENTS, userId, updated);
      }
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, password: clean } : null);
      }
    }
  };

  // Update avatar for ANY user (Admin or user control)
  const updateUserAvatar = (userId: string, newAvatarUrl: string) => {
    if (!newAvatarUrl) return;

    if (userId === adminProfile.id || userId === 'admin' || userId === adminProfile.code) {
      const updated = { ...adminProfile, avatarUrl: newAvatarUrl };
      setAdminProfile(updated);
      saveCloudDoc(CLOUD_COLLECTIONS.ADMIN_PROFILE, 'main_admin', updated);
      if (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN') {
        setCurrentUser(updated);
      }
      return;
    }

    const isTeacher = teachers.some(t => t.id === userId);
    if (isTeacher) {
      const target = teachers.find(t => t.id === userId);
      if (target) {
        const updated = { ...target, avatarUrl: newAvatarUrl };
        setTeachers(prev => prev.map(t => t.id === userId ? updated : t));
        saveCloudDoc(CLOUD_COLLECTIONS.TEACHERS, userId, updated);
      }
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, avatarUrl: newAvatarUrl } : null);
      }
      return;
    }

    const isStudent = students.some(s => s.id === userId);
    if (isStudent) {
      const target = students.find(s => s.id === userId);
      if (target) {
        const updated = { ...target, avatarUrl: newAvatarUrl };
        setStudents(prev => prev.map(s => s.id === userId ? updated : s));
        saveCloudDoc(CLOUD_COLLECTIONS.STUDENTS, userId, updated);
      }
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, avatarUrl: newAvatarUrl } : null);
      }
    }
  };

  // Update platform Logo & Visual Branding
  const updatePlatformLogo = (
    logoUrl: string,
    logoDisplayMode: 'emblem' | 'custom' | 'combined' = 'combined',
    logoTextEn?: string,
    logoTextAr?: string
  ) => {
    const updated = {
      ...settings,
      logoUrl,
      logoDisplayMode,
      ...(logoTextEn ? { logoTextEn } : {}),
      ...(logoTextAr ? { logoTextAr } : {}),
    };
    setSettings(updated);
    saveCloudDoc(CLOUD_COLLECTIONS.SETTINGS, 'global_settings', updated);
  };

  // Permission check helper
  const hasTeacherPermission = (permissionKey: keyof TeacherPermissions): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') return true;
    if (currentUser.role === 'TEACHER') {
      const teacher = teachers.find(t => t.id === currentUser.id) || (currentUser as TeacherProfile);
      if (teacher && teacher.teacherPermissions) {
        return !!teacher.teacherPermissions[permissionKey];
      }
      return true; // default fallback if unconfigured
    }
    return false;
  };

  // Student CRUD (with Cloud Firestore sync)
  const addStudent = (data: Omit<StudentProfile, 'id' | 'code' | 'joinedDate'>) => {
    const id = `usr-std-${Date.now()}`;
    const code = `${settings.studentCodePrefix}${1000 + students.length + 1}`;
    const newStudent: StudentProfile = {
      ...data,
      id,
      code,
      role: 'STUDENT',
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setStudents(prev => [newStudent, ...prev]);
    saveCloudDoc(CLOUD_COLLECTIONS.STUDENTS, id, newStudent);
  };

  const updateStudent = (id: string, updates: Partial<StudentProfile>) => {
    setStudents(prev => {
      const updatedList = prev.map(s => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          saveCloudDoc(CLOUD_COLLECTIONS.STUDENTS, id, updated);
          return updated;
        }
        return s;
      });
      return updatedList;
    });
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    deleteCloudDoc(CLOUD_COLLECTIONS.STUDENTS, id);
  };

  // Teacher CRUD (Super Admin authority & Cloud Firestore sync)
  const addTeacher = (data: Omit<TeacherProfile, 'id' | 'code' | 'joinedDate'> & { teacherPermissions?: TeacherPermissions }) => {
    const id = `usr-tea-${Date.now()}`;
    const code = `${settings.teacherCodePrefix}${8000 + teachers.length + 1}`;
    const newTeacher: TeacherProfile = {
      ...data,
      id,
      code,
      role: 'TEACHER',
      status: data.status || 'ACTIVE',
      teacherPermissions: data.teacherPermissions || defaultTeacherPermissions,
      assignedProgramIds: data.assignedProgramIds || [],
      assignedStudentIds: data.assignedStudentIds || [],
      joinedDate: new Date().toISOString().split('T')[0],
      totalClassesTaught: 0,
      rating: 5.0,
    };
    setTeachers(prev => [newTeacher, ...prev]);
    saveCloudDoc(CLOUD_COLLECTIONS.TEACHERS, id, newTeacher);
  };

  const updateTeacher = (id: string, updates: Partial<TeacherProfile>) => {
    setTeachers(prev => {
      const updatedList = prev.map(t => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          saveCloudDoc(CLOUD_COLLECTIONS.TEACHERS, id, updated);
          return updated;
        }
        return t;
      });
      return updatedList;
    });
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    deleteCloudDoc(CLOUD_COLLECTIONS.TEACHERS, id);
    if (currentUser && currentUser.id === id) {
      setCurrentUser(null);
      localStorage.removeItem('alteq_current_user_id');
    }
  };

  const updateTeacherAvailability = (teacherId: string, slots: TeacherAvailabilitySlot[]) => {
    updateTeacher(teacherId, { availabilitySlots: slots });
  };

  const updateTeacherPermissions = (teacherId: string, newPermissions: Partial<TeacherPermissions>) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;
    const mergedPermissions: TeacherPermissions = {
      ...(teacher.teacherPermissions || defaultTeacherPermissions),
      ...newPermissions,
    };
    updateTeacher(teacherId, { teacherPermissions: mergedPermissions });
  };

  const assignTeacherPrograms = (teacherId: string, programIds: string[]) => {
    updateTeacher(teacherId, { assignedProgramIds: programIds });
  };

  const regenerateUserCode = (userId: string): string => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newCode = `TEA-${randomSuffix}`;
    updateTeacher(userId, { code: newCode });
    return newCode;
  };

  // Program CRUD
  const addProgram = (data: Omit<Program, 'id' | 'code'>) => {
    const id = `prg-${Date.now()}`;
    const code = `${settings.programCodePrefix}0${programs.length + 1}`;
    const newProg: Program = {
      ...data,
      id,
      code,
    };
    setPrograms(prev => [newProg, ...prev]);
    saveCloudDoc(CLOUD_COLLECTIONS.PROGRAMS, id, newProg);
  };

  const updateProgram = (id: string, updates: Partial<Program>) => {
    setPrograms(prev => {
      const updatedList = prev.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          saveCloudDoc(CLOUD_COLLECTIONS.PROGRAMS, id, updated);
          return updated;
        }
        return p;
      });
      return updatedList;
    });
  };

  const deleteProgram = (id: string) => {
    setPrograms(prev => prev.filter(p => p.id !== id));
    deleteCloudDoc(CLOUD_COLLECTIONS.PROGRAMS, id);
  };

  // Subscription CRUD
  const addSubscription = (data: Omit<Subscription, 'id'>) => {
    const id = `sub-${Date.now()}`;
    const newSub: Subscription = {
      ...data,
      id,
    };
    setSubscriptions(prev => [newSub, ...prev]);
    saveCloudDoc(CLOUD_COLLECTIONS.SUBSCRIPTIONS, id, newSub);
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions(prev => {
      const updatedList = prev.map(s => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          saveCloudDoc(CLOUD_COLLECTIONS.SUBSCRIPTIONS, id, updated);
          return updated;
        }
        return s;
      });
      return updatedList;
    });
  };

  const extendSubscription = (id: string, additionalDays: number, additionalSessions: number) => {
    const current = subscriptions.find(s => s.id === id);
    if (!current) return;
    const currentEnd = new Date(current.endDate);
    currentEnd.setDate(currentEnd.getDate() + additionalDays);
    const newEndDate = currentEnd.toISOString().split('T')[0];
    const updated = {
      ...current,
      endDate: newEndDate,
      totalSessions: current.totalSessions + additionalSessions,
      remainingSessions: current.remainingSessions + additionalSessions,
      status: 'ACTIVE' as const,
    };
    updateSubscription(id, updated);
  };

  // ⚡ Direct Student Sessions Recharge & Quota Unlock
  const rechargeStudentSessions = (
    studentId: string,
    additionalSessions: number,
    additionalDays: number = 30,
    notes?: string
  ) => {
    const student = students.find(s => s.id === studentId);
    const existingSub = subscriptions.find(s => s.studentId === studentId);

    if (existingSub) {
      const currentEnd = new Date(existingSub.endDate);
      const now = new Date();
      const baseDate = currentEnd > now ? currentEnd : now;
      baseDate.setDate(baseDate.getDate() + additionalDays);
      const newEndDate = baseDate.toISOString().split('T')[0];

      const updated: Subscription = {
        ...existingSub,
        endDate: newEndDate,
        totalSessions: (existingSub.totalSessions || 0) + additionalSessions,
        remainingSessions: Math.max(0, existingSub.remainingSessions || 0) + additionalSessions,
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        notes: notes || existingSub.notes,
      };

      setSubscriptions(prev => prev.map(s => s.id === existingSub.id ? updated : s));
      saveCloudDoc(CLOUD_COLLECTIONS.SUBSCRIPTIONS, existingSub.id, updated);
    } else if (student) {
      const today = new Date();
      const end = new Date();
      end.setDate(today.getDate() + additionalDays);

      const newSubId = `sub-${Date.now()}`;
      const newSub: Subscription = {
        id: newSubId,
        studentId,
        programId: student.enrolledProgramIds[0] || programs[0]?.id || 'prg-01',
        teacherId: student.assignedTeacherIds[0] || teachers[0]?.id || 'tea-01',
        startDate: today.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        totalSessions: additionalSessions,
        attendedSessions: 0,
        remainingSessions: additionalSessions,
        status: 'ACTIVE',
        paymentStatus: 'PAID',
        amount: 350,
        notes: notes || 'Direct Lesson Balance Recharge',
      };

      setSubscriptions(prev => [newSub, ...prev]);
      saveCloudDoc(CLOUD_COLLECTIONS.SUBSCRIPTIONS, newSubId, newSub);
    }

    // Add notification for the student
    const notifId = `notif-charge-${Date.now()}`;
    const newNotif = {
      id: notifId,
      userId: studentId,
      title: '🎉 تم شحن باقة الحصص بنجاح',
      message: `تمت إضافة ${additionalSessions} حصص إلى رصيد حسابك التعليمي. يمكنك الآن الانضمام للحصص والسبورة التفاعلية.`,
      type: 'PAYMENT' as const,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    saveCloudDoc(CLOUD_COLLECTIONS.NOTIFICATIONS, notifId, newNotif);
  };

  // Helper to query student quota status
  const getStudentQuota = (studentId: string) => {
    const sub = subscriptions.find(s => s.studentId === studentId);
    if (!sub) {
      return {
        remainingSessions: 0,
        totalSessions: 0,
        attendedSessions: 0,
        isExpired: true,
        isEligible: false,
        status: 'NO_SUBSCRIPTION' as const,
      };
    }
    const isExpired = sub.status === 'EXPIRED' || sub.remainingSessions <= 0;
    return {
      remainingSessions: sub.remainingSessions,
      totalSessions: sub.totalSessions,
      attendedSessions: sub.attendedSessions,
      isExpired,
      isEligible: !isExpired && sub.remainingSessions > 0,
      status: sub.status,
    };
  };

  // Class CRUD
  const addClassSession = (data: Omit<ClassSession, 'id'>) => {
    const id = `cls-${Date.now()}`;
    // Check if enrolled students have remaining quota
    const hasAnyEligibleStudent = data.studentIds.some(sId => {
      const quota = getStudentQuota(sId);
      return quota.isEligible;
    });

    const newCls: ClassSession = {
      ...data,
      id,
      isLockedDueToQuota: !hasAnyEligibleStudent,
    };
    setClasses(prev => [newCls, ...prev]);
    saveCloudDoc(CLOUD_COLLECTIONS.CLASSES, id, newCls);
  };

  const updateClassSession = (id: string, updates: Partial<ClassSession>) => {
    setClasses(prev => {
      const updatedList = prev.map(c => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          saveCloudDoc(CLOUD_COLLECTIONS.CLASSES, id, updated);
          return updated;
        }
        return c;
      });
      return updatedList;
    });
  };

  const deleteClassSession = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
    deleteCloudDoc(CLOUD_COLLECTIONS.CLASSES, id);
  };

  // Attendance (with automatic session quota decrement & auto-lock upon expiration)
  const markAttendance = (record: Omit<AttendanceRecord, 'id' | 'markedAt'>) => {
    const id = `att-${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const existingIndex = attendance.findIndex(a => a.sessionId === record.sessionId && a.studentId === record.studentId);
    const prevRecord = existingIndex >= 0 ? attendance[existingIndex] : null;

    if (existingIndex >= 0) {
      const existing = attendance[existingIndex];
      const updatedRecord = { ...existing, status: record.status, notes: record.notes, markedAt: now };
      setAttendance(prev => {
        const copy = [...prev];
        copy[existingIndex] = updatedRecord;
        return copy;
      });
      saveCloudDoc(CLOUD_COLLECTIONS.ATTENDANCE, existing.id, updatedRecord);
    } else {
      const newRecord: AttendanceRecord = {
        ...record,
        id,
        markedAt: now,
      };
      setAttendance(prev => [newRecord, ...prev]);
      saveCloudDoc(CLOUD_COLLECTIONS.ATTENDANCE, id, newRecord);
    }

    // Auto-update student subscription sessions balance when attendance is confirmed
    const wasAttended = prevRecord && (prevRecord.status === 'PRESENT' || prevRecord.status === 'LATE');
    const isNowAttended = record.status === 'PRESENT' || record.status === 'LATE';

    if (!wasAttended && isNowAttended) {
      const sub = subscriptions.find(s => s.studentId === record.studentId);
      if (sub && sub.remainingSessions > 0) {
        const newRemaining = Math.max(0, sub.remainingSessions - 1);
        const newAttended = sub.attendedSessions + 1;
        const newStatus: SubscriptionStatus = newRemaining === 0 ? 'EXPIRED' : sub.status;
        const updatedSub: Subscription = {
          ...sub,
          remainingSessions: newRemaining,
          attendedSessions: newAttended,
          status: newStatus,
        };
        setSubscriptions(prev => prev.map(s => s.id === sub.id ? updatedSub : s));
        saveCloudDoc(CLOUD_COLLECTIONS.SUBSCRIPTIONS, sub.id, updatedSub);

        if (newRemaining === 0) {
          const quotaWarningNotif = {
            id: `notif-exhaust-${Date.now()}`,
            userId: record.studentId,
            title: '⚠️ انتهى رصيد حصص الباقة التعليمية',
            message: 'لقد أتممت جميع الحصص المحجوزة في باقتك (0 حصص متبقية). يرجى شحن الرصيد لتفعيل الحصص القادمة والسبورة.',
            type: 'SYSTEM' as const,
            date: now,
            read: false,
          };
          setNotifications(prev => [quotaWarningNotif, ...prev]);
          saveCloudDoc(CLOUD_COLLECTIONS.NOTIFICATIONS, quotaWarningNotif.id, quotaWarningNotif);
        }
      }
    }
  };

  // Activities CRUD
  const addActivity = (data: Omit<Activity, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'playCount'>) => {
    const id = `act-${Date.now()}`;
    const code = `${settings.activityCodePrefix}${100 + activities.length + 1}`;
    const today = new Date().toISOString().split('T')[0];
    const newAct: Activity = {
      ...data,
      id,
      code,
      createdAt: today,
      updatedAt: today,
      playCount: 0,
    };
    setActivities(prev => [newAct, ...prev]);
    saveCloudDoc(CLOUD_COLLECTIONS.ACTIVITIES, id, newAct);
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    const today = new Date().toISOString().split('T')[0];
    setActivities(prev => {
      const updatedList = prev.map(a => {
        if (a.id === id) {
          const updated = { ...a, ...updates, updatedAt: today };
          saveCloudDoc(CLOUD_COLLECTIONS.ACTIVITIES, id, updated);
          return updated;
        }
        return a;
      });
      return updatedList;
    });
  };

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    deleteCloudDoc(CLOUD_COLLECTIONS.ACTIVITIES, id);
  };

  // Lesson CRUD
  const addLesson = (data: Omit<Lesson, 'id' | 'code' | 'createdAt' | 'updatedAt'>) => {
    const id = `lsn-${Date.now()}`;
    const code = `LSN-${100 + lessons.length + 1}`;
    const today = new Date().toISOString().split('T')[0];
    const newLsn: Lesson = {
      ...data,
      id,
      code,
      createdAt: today,
      updatedAt: today,
    };
    setLessons(prev => [newLsn, ...prev]);
    saveCloudDoc(CLOUD_COLLECTIONS.LESSONS, id, newLsn);
  };

  const updateLesson = (id: string, updates: Partial<Lesson>) => {
    const today = new Date().toISOString().split('T')[0];
    setLessons(prev => {
      const updatedList = prev.map(l => {
        if (l.id === id) {
          const updated = { ...l, ...updates, updatedAt: today };
          saveCloudDoc(CLOUD_COLLECTIONS.LESSONS, id, updated);
          return updated;
        }
        return l;
      });
      return updatedList;
    });
  };

  // Settings
  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveCloudDoc(CLOUD_COLLECTIONS.SETTINGS, 'global_settings', updated);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      return updated;
    });
    const target = notifications.find(n => n.id === id);
    if (target) {
      saveCloudDoc(CLOUD_COLLECTIONS.NOTIFICATIONS, id, { ...target, read: true });
    }
  };

  // Helper calculation for student stats
  const getStudentStats = (studentId: string) => {
    const studentRecords = attendance.filter(a => a.studentId === studentId);
    const attendedCount = studentRecords.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const absentCount = studentRecords.filter(a => a.status === 'ABSENT').length;
    const lateCount = studentRecords.filter(a => a.status === 'LATE').length;
    const totalMarked = studentRecords.length;
    const attendanceRate = totalMarked > 0 ? Math.round((attendedCount / totalMarked) * 100) : 95;

    const sub = subscriptions.find(s => s.studentId === studentId && s.status === 'ACTIVE') || subscriptions.find(s => s.studentId === studentId) || null;
    const activeProgram = sub ? programs.find(p => p.id === sub.programId) || null : null;
    const primaryTeacher = sub ? teachers.find(t => t.id === sub.teacherId) || null : null;

    let daysRemaining = 0;
    if (sub) {
      const today = new Date();
      const end = new Date(sub.endDate);
      const diffTime = end.getTime() - today.getTime();
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }

    const sessionsRemaining = sub ? sub.remainingSessions : 0;

    return {
      attendanceRate,
      attendedCount,
      absentCount,
      lateCount,
      activeSubscription: sub,
      activeProgram,
      primaryTeacher,
      daysRemaining,
      sessionsRemaining,
    };
  };

  // Public enrollment & Self Registration with Instant Cloud Persistence
  const registerStudentAndEnroll = (data: {
    name: string;
    nameArabic?: string;
    email: string;
    phone?: string;
    programId: string;
    teacherId?: string;
    studyMode: StudyMode;
    preferredSlotId?: string;
    customPassword?: string;
  }) => {
    const targetProgram = programs.find(p => p.id === data.programId) || programs[0];
    const chosenTeacherId = data.teacherId || (targetProgram.assignedTeacherIds.length > 0 ? targetProgram.assignedTeacherIds[0] : (teachers[0]?.id || 'usr-tea-1'));
    const targetTeacher = teachers.find(t => t.id === chosenTeacherId);

    const newStudentId = `usr-std-${Date.now()}`;
    const newStudentCode = `STD-${Math.floor(1000 + Math.random() * 9000)}`;
    const tempPassword = data.customPassword || `alafak${Math.floor(100 + Math.random() * 900)}`;

    const newSubId = `sub-${Date.now()}`;
    const startDate = new Date().toISOString().split('T')[0];
    const end = new Date();
    end.setMonth(end.getMonth() + (targetProgram.durationMonths || 3));
    const endDate = end.toISOString().split('T')[0];

    const amount = data.studyMode === 'PRIVATE' 
      ? (targetProgram.privatePrice || targetProgram.price)
      : (targetProgram.groupPrice || Math.round(targetProgram.price * 0.6));

    const newSubscription: Subscription = {
      id: newSubId,
      studentId: newStudentId,
      programId: targetProgram.id,
      teacherId: chosenTeacherId,
      startDate,
      endDate,
      totalSessions: targetProgram.totalSessions || 24,
      attendedSessions: 0,
      remainingSessions: targetProgram.totalSessions || 24,
      studyMode: data.studyMode,
      status: 'ACTIVE',
      paymentStatus: 'PAID',
      amount,
      notes: `تسجيل ذاتي عبر الموقع - نظام ${data.studyMode === 'PRIVATE' ? 'دراسة خاصة فردية' : 'مجموعة تفاعلية'}`,
    };

    const newStudent: StudentProfile = {
      id: newStudentId,
      code: newStudentCode,
      name: data.name,
      nameArabic: data.nameArabic || data.name,
      email: data.email,
      phone: data.phone || '',
      password: tempPassword,
      role: 'STUDENT',
      status: 'ACTIVE',
      nativeLanguage: 'العربية / English',
      assignedTeacherIds: [chosenTeacherId],
      enrolledProgramIds: [targetProgram.id],
      activeSubscriptionId: newSubId,
      preferredStudyMode: data.studyMode,
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      joinedDate: startDate,
      notes: `مسجل في ${targetProgram.nameArabic} - ${data.studyMode === 'PRIVATE' ? 'خاص (1-on-1)' : 'مجموعة'}`,
    };

    // Update local state
    setStudents(prev => [newStudent, ...prev]);
    setSubscriptions(prev => [newSubscription, ...prev]);
    setPrograms(prev => prev.map(p => p.id === targetProgram.id ? { ...p, enrolledStudentIds: [...p.enrolledStudentIds, newStudentId] } : p));
    if (targetTeacher) {
      setTeachers(prev => prev.map(t => t.id === targetTeacher.id ? { ...t, assignedStudentIds: [...t.assignedStudentIds, newStudentId] } : t));
    }

    // Instantly save to Cloud Firestore so the admin/teacher receives it in real-time
    saveCloudDoc(CLOUD_COLLECTIONS.STUDENTS, newStudentId, newStudent);
    saveCloudDoc(CLOUD_COLLECTIONS.SUBSCRIPTIONS, newSubId, newSubscription);
    if (targetProgram) {
      saveCloudDoc(CLOUD_COLLECTIONS.PROGRAMS, targetProgram.id, {
        ...targetProgram,
        enrolledStudentIds: [...targetProgram.enrolledStudentIds, newStudentId],
      });
    }
    if (targetTeacher) {
      saveCloudDoc(CLOUD_COLLECTIONS.TEACHERS, targetTeacher.id, {
        ...targetTeacher,
        assignedStudentIds: [...targetTeacher.assignedStudentIds, newStudentId],
      });
    }

    const welcomeNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: newStudentId,
      title: 'Welcome to AITEC Platform! 🎉',
      titleArabic: 'مرحباً بك في منصة الآفاق الدولية! 🎉',
      message: `You are now enrolled in ${targetProgram.name} with ${targetTeacher?.name || 'your instructor'}.`,
      messageArabic: `تم تسجيلك بنجاح في برنامج "${targetProgram.nameArabic}" مع ${targetTeacher?.nameArabic || 'المدرب المعتمد'}. كودك: ${newStudentCode}`,
      type: 'SUBSCRIPTION',
      read: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setNotifications(prev => [welcomeNotif, ...prev]);
    saveCloudDoc(CLOUD_COLLECTIONS.NOTIFICATIONS, welcomeNotif.id, welcomeNotif);

    // Also send an instant alert notification to Admin
    const adminAlertNotif: NotificationItem = {
      id: `notif-adm-${Date.now()}`,
      userId: adminProfile.id,
      title: 'New Student Self-Enrolled! 🎓',
      titleArabic: 'طالب جديد قام بالتسجيل الذاتي في المنصة! 🎓',
      message: `New student ${data.name} (${newStudentCode}) has enrolled in ${targetProgram.name}.`,
      messageArabic: `قام الطالب الجديد (${data.name}) بالكود [${newStudentCode}] بالتسجيل والاشتراك في برنامج (${targetProgram.nameArabic}).`,
      type: 'SUBSCRIPTION',
      read: false,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setNotifications(prev => [adminAlertNotif, ...prev]);
    saveCloudDoc(CLOUD_COLLECTIONS.NOTIFICATIONS, adminAlertNotif.id, adminAlertNotif);

    return {
      student: newStudent,
      tempPass: tempPassword,
      code: newStudentCode,
      program: targetProgram,
      teacher: targetTeacher,
      subscription: newSubscription,
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        students,
        teachers,
        programs,
        subscriptions,
        classes,
        attendance,
        activities,
        lessons,
        notifications,
        settings,
        isCloudSynced,
        loginWithCode,
        switchDemoUser,
        logout,
        hasTeacherPermission,
        updateCurrentUserProfile,
        updateAdminPasscode,
        updateUserPassword,
        updateUserAvatar,
        updatePlatformLogo,
        addStudent,
        updateStudent,
        deleteStudent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        updateTeacherPermissions,
        assignTeacherPrograms,
        regenerateUserCode,
        addProgram,
        updateProgram,
        deleteProgram,
        addSubscription,
        updateSubscription,
        extendSubscription,
        rechargeStudentSessions,
        getStudentQuota,
        addClassSession,
        updateClassSession,
        deleteClassSession,
        markAttendance,
        addActivity,
        updateActivity,
        deleteActivity,
        addLesson,
        updateLesson,
        updateSettings,
        markNotificationAsRead,
        getStudentStats,
        registerStudentAndEnroll,
        updateTeacherAvailability,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
