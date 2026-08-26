import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  StudentProfile,
  TeacherProfile,
  TeacherPermissions,
  Program,
  Subscription,
  ClassSession,
  AttendanceRecord,
  Activity,
  Lesson,
  NotificationItem,
  PlatformSettings,
  AttendanceStatus,
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage keys
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
  
  // Current user state (default to Tariq Ibrahim - student for instant rich view)
  const [currentUser, setCurrentUser] = useState<User | StudentProfile | TeacherProfile | null>(() => {
    const savedId = localStorage.getItem('alteq_current_user_id');
    const storedAdmin = loadStored('admin_profile', initialAdmin);
    if (savedId) {
      if (savedId === storedAdmin.id || savedId === initialAdmin.id) return storedAdmin;
      const foundStd = initialStudents.find(s => s.id === savedId);
      if (foundStd) return foundStd;
      const foundTea = initialTeachers.find(t => t.id === savedId);
      if (foundTea) return foundTea;
    }
    // Default to student Tariq Ibrahim
    return initialStudents[0];
  });

  // Persist to local storage
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
    setSettings(prev => ({ ...prev, adminPasscode: clean }));
    setAdminProfile(prev => ({ ...prev, password: clean }));
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
      setTeachers(prev => prev.map(t => t.id === userId ? { ...t, password: clean } : t));
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, password: clean } : null);
      }
      return;
    }

    const isStudent = students.some(s => s.id === userId);
    if (isStudent) {
      setStudents(prev => prev.map(s => s.id === userId ? { ...s, password: clean } : s));
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
      if (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN') {
        setCurrentUser(updated);
      }
      return;
    }

    const isTeacher = teachers.some(t => t.id === userId);
    if (isTeacher) {
      setTeachers(prev => prev.map(t => t.id === userId ? { ...t, avatarUrl: newAvatarUrl } : t));
      if (currentUser?.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, avatarUrl: newAvatarUrl } : null);
      }
      return;
    }

    const isStudent = students.some(s => s.id === userId);
    if (isStudent) {
      setStudents(prev => prev.map(s => s.id === userId ? { ...s, avatarUrl: newAvatarUrl } : s));
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
    setSettings(prev => ({
      ...prev,
      logoUrl,
      logoDisplayMode,
      ...(logoTextEn ? { logoTextEn } : {}),
      ...(logoTextAr ? { logoTextAr } : {}),
    }));
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

  // Student CRUD
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
  };

  const updateStudent = (id: string, updates: Partial<StudentProfile>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  // Teacher CRUD (Super Admin authority)
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
  };

  const updateTeacher = (id: string, updates: Partial<TeacherProfile>) => {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(initialAdmin);
    }
  };

  const updateTeacherPermissions = (teacherId: string, newPermissions: Partial<TeacherPermissions>) => {
    setTeachers(prev => prev.map(t => {
      if (t.id !== teacherId) return t;
      const mergedPermissions: TeacherPermissions = {
        ...(t.teacherPermissions || defaultTeacherPermissions),
        ...newPermissions,
      };
      return {
        ...t,
        teacherPermissions: mergedPermissions,
      };
    }));

    if (currentUser && currentUser.id === teacherId) {
      setCurrentUser(prev => {
        if (!prev) return null;
        const currentTea = prev as TeacherProfile;
        return {
          ...currentTea,
          teacherPermissions: {
            ...(currentTea.teacherPermissions || defaultTeacherPermissions),
            ...newPermissions,
          },
        };
      });
    }
  };

  const assignTeacherPrograms = (teacherId: string, programIds: string[]) => {
    setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, assignedProgramIds: programIds } : t));
    if (currentUser && currentUser.id === teacherId) {
      setCurrentUser(prev => prev ? { ...prev, assignedProgramIds: programIds } as TeacherProfile : null);
    }
  };

  const regenerateUserCode = (userId: string): string => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newCode = `TEA-${randomSuffix}`;
    setTeachers(prev => prev.map(t => t.id === userId ? { ...t, code: newCode } : t));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, code: newCode } : null);
    }
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
  };

  const updateProgram = (id: string, updates: Partial<Program>) => {
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProgram = (id: string) => {
    setPrograms(prev => prev.filter(p => p.id !== id));
  };

  // Subscription CRUD
  const addSubscription = (data: Omit<Subscription, 'id'>) => {
    const id = `sub-${Date.now()}`;
    const newSub: Subscription = {
      ...data,
      id,
    };
    setSubscriptions(prev => [newSub, ...prev]);
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const extendSubscription = (id: string, additionalDays: number, additionalSessions: number) => {
    setSubscriptions(prev => prev.map(s => {
      if (s.id !== id) return s;
      const currentEnd = new Date(s.endDate);
      currentEnd.setDate(currentEnd.getDate() + additionalDays);
      const newEndDate = currentEnd.toISOString().split('T')[0];
      return {
        ...s,
        endDate: newEndDate,
        totalSessions: s.totalSessions + additionalSessions,
        remainingSessions: s.remainingSessions + additionalSessions,
        status: 'ACTIVE',
      };
    }));
  };

  // Class CRUD
  const addClassSession = (data: Omit<ClassSession, 'id'>) => {
    const id = `cls-${Date.now()}`;
    const newCls: ClassSession = { ...data, id };
    setClasses(prev => [newCls, ...prev]);
  };

  const updateClassSession = (id: string, updates: Partial<ClassSession>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClassSession = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  // Attendance
  const markAttendance = (record: Omit<AttendanceRecord, 'id' | 'markedAt'>) => {
    const id = `att-${Date.now()}`;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const existingIndex = attendance.findIndex(a => a.sessionId === record.sessionId && a.studentId === record.studentId);
    
    if (existingIndex >= 0) {
      setAttendance(prev => {
        const copy = [...prev];
        copy[existingIndex] = { ...copy[existingIndex], status: record.status, notes: record.notes, markedAt: now };
        return copy;
      });
    } else {
      const newRecord: AttendanceRecord = {
        ...record,
        id,
        markedAt: now,
      };
      setAttendance(prev => [newRecord, ...prev]);
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
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    const today = new Date().toISOString().split('T')[0];
    setActivities(prev => prev.map(a => a.id === id ? { ...a, ...updates, updatedAt: today } : a));
  };

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
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
  };

  const updateLesson = (id: string, updates: Partial<Lesson>) => {
    const today = new Date().toISOString().split('T')[0];
    setLessons(prev => prev.map(l => l.id === id ? { ...l, ...updates, updatedAt: today } : l));
  };

  // Settings
  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
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
