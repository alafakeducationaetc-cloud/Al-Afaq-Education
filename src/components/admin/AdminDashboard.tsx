import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { TeacherPermissionManager } from './TeacherPermissionManager';
import { ProgramEditModal } from '../programs/ProgramEditModal';
import { PasswordManagerModal } from './PasswordManagerModal';
import { BrandingManager } from './BrandingManager';
import { UserAvatarEditModal } from './UserAvatarEditModal';
import { BroadcastNotificationModal } from './BroadcastNotificationModal';
import { CertificatesManager } from '../certificates/CertificatesManager';
import { PlatformTimetableCalendar } from '../calendar/PlatformTimetableCalendar';
import {
  Program,
  User,
  UserRole,
  UserStatus,
  ProgramCategory,
  ProgramLevel,
  SubscriptionStatus,
  AttendanceStatus,
  StudentProfile,
  TeacherProfile,
  StudyMode,
} from '../../types';
import {
  Users,
  GraduationCap,
  BookOpen,
  CreditCard,
  Calendar,
  ClipboardCheck,
  ShieldCheck,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Lock,
  Save,
  Download,
  Sparkles,
  ArrowRight,
  TrendingUp,
  KeyRound,
  Palette,
  Camera,
  Bell,
  Send,
  Video,
  Clock,
  Check,
  Award,
  Crown,
  X,
  UserCheck,
} from 'lucide-react';

export type AdminSubTab =
  | 'OVERVIEW'
  | 'STUDENTS'
  | 'TEACHERS'
  | 'MY_CLASSES'
  | 'NOTIFICATIONS'
  | 'CERTIFICATES'
  | 'PROGRAMS'
  | 'SUBSCRIPTIONS'
  | 'ATTENDANCE'
  | 'PERMISSIONS'
  | 'PASSWORDS'
  | 'BRANDING'
  | 'SETTINGS';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  initialSubTab?: AdminSubTab;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab, initialSubTab }) => {
  const {
    currentUser,
    adminProfile,
    students,
    teachers,
    programs,
    subscriptions,
    classes,
    attendance,
    activities,
    certificates,
    settings,
    notifications,
    deleteNotification,
    addStudent,
    updateStudent,
    deleteStudent,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addProgram,
    updateProgram,
    deleteProgram,
    addSubscription,
    updateSubscription,
    extendSubscription,
    rechargeStudentSessions,
    getStudentQuota,
    addClassSession,
    updateSettings,
  } = useApp();

  const { t, isRTL } = useI18n();

  const [activeAdminSubTab, setActiveAdminSubTab] = useState<AdminSubTab>(initialSubTab || 'OVERVIEW');
  const [showSupervisorTimetableModal, setShowSupervisorTimetableModal] = useState(false);

  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [avatarModalUser, setAvatarModalUser] = useState<User | StudentProfile | TeacherProfile | null>(null);
  const [passwordTargetUser, setPasswordTargetUser] = useState<User | StudentProfile | TeacherProfile | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddProgramModal, setShowAddProgramModal] = useState(false);
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [showExtendSubId, setShowExtendSubId] = useState<string | null>(null);
  const [extendDays, setExtendDays] = useState(30);
  const [extendSessions, setExtendSessions] = useState(8);

  // List of all teachers ensuring Super Admin (Supervisor) is ALWAYS included and prioritized first
  const supervisorTeacherInList: TeacherProfile = teachers.find(t => t.id === 'usr-adm-1' || t.code === 'ADM-0001') || {
    id: 'usr-adm-1',
    code: 'ADM-0001',
    name: adminProfile?.name || currentUser?.name || 'Ahmad Ibrahim',
    nameArabic: adminProfile?.nameArabic || currentUser?.nameArabic || 'أحمد إبراهيم',
    email: adminProfile?.email || currentUser?.email || 'alafak.education.aetc@gmail.com',
    phone: adminProfile?.phone || currentUser?.phone || '+20 101 199 2165',
    role: 'TEACHER',
    status: 'ACTIVE',
    avatarUrl: adminProfile?.avatarUrl || currentUser?.avatarUrl,
    specialization: 'General Supervision & Master Arabic & Quranic Studies Instructor',
    specializationArabic: 'المشرف العام — أستاذ وموجه اللغة العربية والقرآن الكريم',
    bio: 'أحمد إبراهيم — المشرف العام وإدارة منصة الآفاق الدولية، تدريس مباشر وإشراف أكاديمي شامل على البرامج وحلقات التلاوة وتأهيل المعلمين والطلاب.',
    assignedProgramIds: programs.map(p => p.id),
    assignedStudentIds: [],
    joinedDate: '2025-01-01',
    rating: 5.0,
    totalClassesTaught: 18,
  };

  const otherTeachersList = teachers.filter(t => t.id !== 'usr-adm-1' && t.code !== 'ADM-0001');
  const allSelectableTeachers = [supervisorTeacherInList, ...otherTeachersList];

  // New Student State
  const [newStdName, setNewStdName] = useState('');
  const [newStdNameAr, setNewStdNameAr] = useState('');
  const [newStdEmail, setNewStdEmail] = useState('');
  const [newStdPhone, setNewStdPhone] = useState('');
  const [newStdTeacherId, setNewStdTeacherId] = useState('usr-adm-1');
  const [newStdProgramId, setNewStdProgramId] = useState(programs[0]?.id || '');
  const [newStdStudyMode, setNewStdStudyMode] = useState<StudyMode>('PRIVATE');

  // New Teacher State
  const [newTeaName, setNewTeaName] = useState('');
  const [newTeaNameAr, setNewTeaNameAr] = useState('');
  const [newTeaSpec, setNewTeaSpec] = useState('');
  const [newTeaEmail, setNewTeaEmail] = useState('');

  // New Program State
  const [newPrgName, setNewPrgName] = useState('');
  const [newPrgNameAr, setNewPrgNameAr] = useState('');
  const [newPrgDesc, setNewPrgDesc] = useState('');
  const [newPrgCategory, setNewPrgCategory] = useState<ProgramCategory>('ARABIC_LANGUAGE');
  const [newPrgLevel, setNewPrgLevel] = useState<ProgramLevel>('BEGINNER');
  const [newPrgPrice, setNewPrgPrice] = useState(350);
  const [newPrgSessions, setNewPrgSessions] = useState(24);

  // Settings form state
  const [platformName, setPlatformName] = useState(settings.platformName);
  const [studentPrefix, setStudentPrefix] = useState(settings.studentCodePrefix);
  const [teacherPrefix, setTeacherPrefix] = useState(settings.teacherCodePrefix);
  const [programPrefix, setProgramPrefix] = useState(settings.programCodePrefix);
  const [defaultZoom, setDefaultZoom] = useState(settings.defaultZoomLink);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Stats calculation
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'ACTIVE').length;
  const totalTeachers = teachers.length;
  const activePrograms = programs.filter(p => p.status === 'ACTIVE').length;
  const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE').length;
  const totalAttendanceRecords = attendance.length;
  const presentRecords = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const globalAttendanceRate = totalAttendanceRecords > 0 ? Math.round((presentRecords / totalAttendanceRecords) * 100) : 94;

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStdName && !newStdNameAr) return;
    const finalTeacherId = newStdTeacherId || 'usr-adm-1';
    addStudent({
      role: 'STUDENT',
      name: newStdName || newStdNameAr,
      nameArabic: newStdNameAr || newStdName,
      email: newStdEmail,
      phone: newStdPhone,
      status: 'ACTIVE',
      assignedTeacherIds: [finalTeacherId],
      enrolledProgramIds: newStdProgramId ? [newStdProgramId] : [],
      preferredStudyMode: newStdStudyMode,
      nativeLanguage: isRTL ? 'العربية' : 'English',
    });

    // Automatically create a subscription if a program was selected
    if (newStdProgramId) {
      const prog = programs.find(p => p.id === newStdProgramId);
      if (prog) {
        addSubscription({
          studentId: '',
          programId: prog.id,
          teacherId: finalTeacherId,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + (prog.durationMonths || 3) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalSessions: prog.totalSessions || 24,
          attendedSessions: 0,
          remainingSessions: prog.totalSessions || 24,
          studyMode: newStdStudyMode,
          status: 'ACTIVE',
          paymentStatus: 'PAID',
          amount: newStdStudyMode === 'PRIVATE' ? (prog.privatePrice || prog.price) : (prog.groupPrice || Math.round(prog.price * 0.6)),
          notes: `مسجل عبر لوحة التحكم — المعلم المسند: ${finalTeacherId === 'usr-adm-1' ? 'المشرف العام (تدريس مباشر)' : 'معلم معتمد'}`,
        });
      }
    }

    setShowAddStudentModal(false);
    setNewStdName('');
    setNewStdNameAr('');
    setNewStdEmail('');
    setNewStdPhone('');
  };

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeaName) return;
    addTeacher({
      role: 'TEACHER',
      name: newTeaName,
      nameArabic: newTeaNameAr,
      specialization: newTeaSpec || 'Arabic & Quran Specialist',
      email: newTeaEmail,
      status: 'ACTIVE',
      assignedProgramIds: [],
      assignedStudentIds: [],
      rating: 5.0,
      totalClassesTaught: 0,
    });
    setShowAddTeacherModal(false);
    setNewTeaName('');
    setNewTeaNameAr('');
    setNewTeaSpec('');
  };

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrgName) return;
    addProgram({
      name: newPrgName,
      nameArabic: newPrgNameAr,
      description: newPrgDesc,
      category: newPrgCategory,
      level: newPrgLevel,
      language: 'Arabic & English',
      durationMonths: 3,
      price: Number(newPrgPrice),
      currency: 'USD',
      totalSessions: Number(newPrgSessions),
      sessionDurationMinutes: 60,
      assignedTeacherIds: [],
      enrolledStudentIds: [],
      startDate: '2026-09-01',
      endDate: '2026-12-01',
      status: 'ACTIVE',
    });
    setShowAddProgramModal(false);
    setNewPrgName('');
    setNewPrgNameAr('');
    setNewPrgDesc('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      platformName,
      studentCodePrefix: studentPrefix,
      teacherCodePrefix: teacherPrefix,
      programCodePrefix: programPrefix,
      defaultZoomLink: defaultZoom,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Admin Control Header Banner */}
      <div className="bg-gradient-to-r from-[#29235D] via-[#1D1845] to-[#29235D] rounded-3xl p-6 sm:p-8 text-white border border-[#D3B673]/30 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-[#D3B673]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D3B673]/20 text-[#E8D5A3] border border-[#D3B673]/40 inline-flex items-center gap-1.5 mb-3">
              <ShieldCheck className="w-4 h-4 text-[#D3B673]" />
              Central Administration Control Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-wide">
              {t('platformName')} Administration
            </h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-xl">
              Manage students, teachers, educational programs, subscriptions, attendance records, and platform settings from one central system.
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isRTL ? '📢 إرسال وبث إشعار' : 'Broadcast Alert'}</span>
            </button>
            <button
              onClick={() => setActiveAdminSubTab('MY_CLASSES')}
              className="px-4 py-2.5 rounded-2xl bg-[#1D1845] hover:bg-[#251F45] text-[#E8D5A3] font-bold text-xs flex items-center gap-2 border border-[#D3B673]/40 transition-all cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-[#D3B673]" />
              <span>{isRTL ? '🎓 حصصي وتدريسي' : 'My Classes'}</span>
            </button>
            <button
              onClick={() => {
                setAvatarModalUser(currentUser || ({
                  id: 'usr-adm-1',
                  code: 'ADM-0001',
                  name: 'Dr. Alafak Director (المشرف العام)',
                  nameArabic: 'د. المشرف العام للآفاق الدولية',
                  role: 'SUPER_ADMIN',
                  status: 'ACTIVE',
                  avatarUrl: currentUser?.avatarUrl,
                } as any));
              }}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#D3B673]" />
              <span>{isRTL ? 'تعديل صورتي' : 'My Photo'}</span>
            </button>
            <button
              onClick={() => setActiveAdminSubTab('BRANDING')}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-[#E8D5A3] font-bold text-xs flex items-center gap-2 border border-[#D3B673]/40 transition-all cursor-pointer"
            >
              <Palette className="w-4 h-4 text-[#D3B673]" />
              <span>{isRTL ? 'الشعار والهوية' : 'Branding'}</span>
            </button>
            <button
              onClick={() => setActiveAdminSubTab('PASSWORDS')}
              className="px-4 py-2.5 rounded-2xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] font-bold text-xs flex items-center gap-2 border border-[#D3B673]/40 transition-all cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isRTL ? 'الباسوردات' : 'Passwords'}</span>
            </button>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D3B673]" />
              <span>Add Student</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        <div className="bg-white rounded-2xl p-4 border border-[#29235D]/10 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-500">Total Students</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#29235D] font-serif">{totalStudents}</span>
            <span className="text-[10px] font-bold text-emerald-600">({activeStudents} active)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#29235D]/10 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-500">Faculty / Teachers</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#29235D] font-serif">{totalTeachers}</span>
            <span className="text-[10px] font-bold text-emerald-600">Certified</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#29235D]/10 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-500">Active Programs</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#29235D] font-serif">{activePrograms}</span>
            <span className="text-[10px] font-bold text-[#B89955]">Catalog</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#29235D]/10 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-500">Active Subscriptions</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#29235D] font-serif">{activeSubscriptions}</span>
            <span className="text-[10px] font-bold text-emerald-600">Enrolled</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#29235D]/10 shadow-xs col-span-2 lg:col-span-1">
          <p className="text-[11px] font-semibold text-gray-500">Global Attendance</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#29235D] font-serif">{globalAttendanceRate}%</span>
            <span className="text-[10px] font-bold text-emerald-600">High</span>
          </div>
        </div>

      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-1.5 rounded-2xl border border-[#29235D]/10 text-xs font-bold">
        {[
          { id: 'OVERVIEW', label: isRTL ? 'نظرة عامة' : 'Dashboard Overview', icon: <BarChart3 className="w-3.5 h-3.5" /> },
          { id: 'CERTIFICATES', label: isRTL ? `🏆 الشهادات والاعتمادات (${certificates.length})` : `Certificates (${certificates.length})`, icon: <Award className="w-3.5 h-3.5 text-[#D3B673]" /> },
          { id: 'MY_CLASSES', label: isRTL ? `🎓 دروسي المباشرة (${classes.filter(c => c.teacherId === currentUser?.id || c.teacherId === 'usr-adm-1').length})` : `My Classes (${classes.filter(c => c.teacherId === currentUser?.id || c.teacherId === 'usr-adm-1').length})`, icon: <GraduationCap className="w-3.5 h-3.5 text-[#D3B673]" /> },
          { id: 'NOTIFICATIONS', label: isRTL ? `📢 بث وإدارة الإشعارات (${notifications.length})` : `Notifications (${notifications.length})`, icon: <Bell className="w-3.5 h-3.5 text-[#D3B673]" /> },
          { id: 'STUDENTS', label: isRTL ? `الطلاب (${students.length})` : `Students (${students.length})`, icon: <GraduationCap className="w-3.5 h-3.5" /> },
          { id: 'TEACHERS', label: isRTL ? `المعلمون (${teachers.length})` : `Teachers (${teachers.length})`, icon: <Users className="w-3.5 h-3.5" /> },
          { id: 'PASSWORDS', label: isRTL ? 'كلمات المرور والأمان' : 'Passwords & Passcodes', icon: <KeyRound className="w-3.5 h-3.5 text-[#B89955]" /> },
          { id: 'BRANDING', label: isRTL ? 'الهوية والشعار (Logo)' : 'Branding & Logo', icon: <Palette className="w-3.5 h-3.5 text-[#B89955]" /> },
          { id: 'PROGRAMS', label: isRTL ? `البرامج (${programs.length})` : `Programs (${programs.length})`, icon: <BookOpen className="w-3.5 h-3.5" /> },
          { id: 'SUBSCRIPTIONS', label: isRTL ? `الاشتراكات (${subscriptions.length})` : `Subscriptions (${subscriptions.length})`, icon: <CreditCard className="w-3.5 h-3.5" /> },
          { id: 'ATTENDANCE', label: isRTL ? 'سجل الحضور' : 'Attendance Roll', icon: <ClipboardCheck className="w-3.5 h-3.5" /> },
          { id: 'PERMISSIONS', label: isRTL ? 'صلاحيات المعلمين' : 'Role Permissions', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          { id: 'SETTINGS', label: isRTL ? 'إعدادات النظام' : 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminSubTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeAdminSubTab === tab.id
                ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                : 'text-[#786F9A] hover:bg-[#F8F6F0] hover:text-[#29235D]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 4. Tab Contents */}

      {/* CERTIFICATES TAB */}
      {activeAdminSubTab === 'CERTIFICATES' && (
        <CertificatesManager />
      )}

      {/* OVERVIEW TAB */}
      {activeAdminSubTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Students Table */}
          <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#29235D] font-serif">Recent Student Enrolments</h3>
              <button
                onClick={() => setActiveAdminSubTab('STUDENTS')}
                className="text-xs font-bold text-[#29235D] hover:text-[#B89955]"
              >
                View All →
              </button>
            </div>

            <div className="space-y-2.5">
              {students.slice(0, 4).map(std => (
                <div
                  key={std.id}
                  className="p-3 rounded-xl bg-[#FBF9F4] border border-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={std.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={std.name}
                      className="w-9 h-9 rounded-lg object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#29235D]">{std.name}</span>
                        <span className="text-[10px] font-mono text-gray-400 font-bold">{std.code}</span>
                      </div>
                      <p className="text-[11px] text-gray-500">{std.email || 'student@example.com'}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {std.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Programs Overview */}
          <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#29235D] font-serif">Educational Programs Catalog</h3>
              <button
                onClick={() => setActiveAdminSubTab('PROGRAMS')}
                className="text-xs font-bold text-[#29235D] hover:text-[#B89955]"
              >
                Manage Programs →
              </button>
            </div>

            <div className="space-y-2.5">
              {programs.slice(0, 4).map(prg => (
                <div
                  key={prg.id}
                  className="p-3 rounded-xl bg-[#FBF9F4] border border-gray-100 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#29235D] font-serif">{prg.name}</span>
                      <span className="text-[9px] font-mono bg-[#29235D] text-[#D3B673] px-1.5 py-0.2 rounded">
                        {prg.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Level: {prg.level} • {prg.totalSessions} Sessions • ${prg.price}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#B89955]">${prg.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MY CLASSES (TEACHER DUAL ROLE) TAB */}
      {activeAdminSubTab === 'MY_CLASSES' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#29235D] via-[#1D1845] to-[#29235D] rounded-3xl p-6 text-white border border-[#D3B673]/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D3B673] text-[#29235D]">
                  {isRTL ? 'وضع التدريس المباشر للمشرف العام' : 'Supervisor Direct Teaching Mode'}
                </span>
                <span className="text-xs text-[#E8D5A3]">
                  {isRTL ? 'إدارة وتقديم الدروس الخاصة بك' : 'Manage your direct sessions'}
                </span>
              </div>
              <h3 className="text-xl font-bold font-serif mt-1 text-white">
                {isRTL ? '🎓 حصصي وتدريسي المباشر' : 'My Direct Teaching Classes'}
              </h3>
              <p className="text-xs text-gray-300 mt-1 max-w-xl">
                {isRTL
                  ? 'بصفتك المشرف العام، يمكنك جدولة وتدريس الحصص بنفسك مباشرة للطلاب مع كامل أدوات الغرفة الافتراضية والسبورة التفاعلية وسجل المتابعة.'
                  : 'As Super Admin, you can assign and teach sessions directly to students with full classroom controls.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => setShowSupervisorTimetableModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer border border-white/20 shadow-xs"
              >
                <Clock className="w-4 h-4 text-[#D3B673]" />
                <span>{isRTL ? 'جدول مواعيدي الأسبوعية (التفرغ)' : 'My Weekly Availability'}</span>
              </button>

              <button
                onClick={() => onNavigateTab('calendar')}
                className="px-4 py-2.5 rounded-2xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span>{isRTL ? 'جدولة درس جديد لنفسي' : 'Schedule Lesson in Calendar'}</span>
              </button>
            </div>
          </div>

          {/* Classes list */}
          {(() => {
            const adminClasses = classes.filter(
              c => c.teacherId === currentUser?.id || c.teacherId === 'usr-adm-1'
            );

            if (adminClasses.length === 0) {
              return (
                <div className="bg-white rounded-3xl p-12 border border-[#29235D]/10 text-center space-y-4 shadow-xs">
                  <div className="w-16 h-16 rounded-full bg-[#F4EFE6] text-[#29235D] flex items-center justify-center mx-auto">
                    <GraduationCap className="w-8 h-8 text-[#B89955]" />
                  </div>
                  <h4 className="text-base font-bold text-[#29235D] font-serif">
                    {isRTL ? 'لا توجد حصص مسندة لتدريسك المباشر حالياً' : 'No direct teaching sessions assigned yet'}
                  </h4>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    {isRTL
                      ? 'يمكنك التوجه لجدول المنصة، والضغط على "إضافة موعد حصة"، واختيار نفسك كمعلم مسند للدرس لتبدأ التدريس فورياً.'
                      : 'Go to the Platform Calendar, click "Add Class Session", and select yourself as the Instructor to start teaching.'}
                  </p>
                  <button
                    onClick={() => onNavigateTab('calendar')}
                    className="px-5 py-2.5 bg-[#29235D] text-[#D3B673] font-bold text-xs rounded-2xl shadow-md hover:bg-[#1D1845] transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isRTL ? 'إضافة حصة دراسية جديدة' : 'Add Class Session Now'}</span>
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminClasses.map(cls => {
                  const enrolledStudents = students.filter(s => cls.studentIds.includes(s.id));
                  const program = programs.find(p => p.id === cls.programId);

                  return (
                    <div
                      key={cls.id}
                      className="bg-white rounded-3xl p-5 border border-[#29235D]/10 shadow-xs space-y-4 hover:border-[#D3B673] transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#29235D] text-[#D3B673]">
                              {program?.nameArabic || program?.name || 'برنامج دراسي'}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              {cls.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#29235D] mt-1.5 font-serif">
                            {isRTL ? cls.titleArabic || cls.title : cls.title}
                          </h4>
                          {cls.topic && <p className="text-xs text-gray-500 mt-0.5">{cls.topic}</p>}
                        </div>
                      </div>

                      {/* Date & Time info */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 bg-[#FBF9F4] p-3 rounded-2xl">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-[#B89955]" />
                          <span>{cls.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#B89955]" />
                          <span>{cls.startTime} - {cls.endTime}</span>
                        </div>
                        <div className="text-[10px] font-bold text-[#29235D] mr-auto rtl:mr-0 rtl:ml-auto">
                          {cls.durationMinutes || 60} {isRTL ? 'دقيقة' : 'min'}
                        </div>
                      </div>

                      {/* Enrolled Students */}
                      <div className="space-y-2">
                        <p className="text-[11px] font-bold text-[#29235D]">
                          {isRTL ? `الطلاب المشتركون (${enrolledStudents.length}):` : `Enrolled Students (${enrolledStudents.length}):`}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {enrolledStudents.map(std => {
                            const quota = getStudentQuota(std.id);
                            return (
                              <div
                                key={std.id}
                                className="flex items-center gap-2 p-1.5 pr-3 rtl:pr-1.5 rtl:pl-3 bg-gray-50 border border-gray-100 rounded-xl text-xs"
                              >
                                <img
                                  src={std.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                                  alt={std.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <span className="font-bold text-[#29235D] text-[11px]">
                                  {isRTL ? std.nameArabic || std.name : std.name}
                                </span>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                    quota.isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {quota.remainingSessions} {isRTL ? 'حصة متبقية' : 'left'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Classroom Actions */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <a
                          href={cls.zoomUrl || settings.defaultZoomLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-2 rounded-xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>{isRTL ? 'دخول قاعة البث (Zoom)' : 'Launch Classroom'}</span>
                        </a>
                        <button
                          onClick={() => onNavigateTab('whiteboard')}
                          className="px-3 py-2 rounded-xl bg-[#F4EFE6] hover:bg-[#EAE2D2] text-[#29235D] text-xs font-bold transition-all cursor-pointer"
                        >
                          {isRTL ? 'السبورة' : 'Whiteboard'}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* NOTIFICATIONS & BROADCAST TAB */}
      {activeAdminSubTab === 'NOTIFICATIONS' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#29235D] text-[#D3B673]">
                  {isRTL ? 'مركز التحكم بالإشعارات والبث المباشر' : 'Broadcast & Notifications Center'}
                </span>
              </div>
              <h3 className="text-xl font-bold font-serif mt-1 text-[#29235D]">
                {isRTL ? '📢 إدارة وبث الإشعارات لجميع المستخدمين' : 'Platform Broadcast Notifications'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {isRTL
                  ? 'بث الإعلانات العامة والتنبيهات المخصصة للطلاب فقط أو للمعلمين فقط أو لكلا الفئتين فورياً.'
                  : 'Broadcast system updates and announcements to students, faculty, or all platform users.'}
              </p>
            </div>
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-5 py-3 rounded-2xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer self-start md:self-auto"
            >
              <Send className="w-4 h-4" />
              <span>{isRTL ? 'إرسال إشعار جديد الآن' : 'Send New Broadcast'}</span>
            </button>
          </div>

          {/* Notifications feed list */}
          <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#29235D] font-serif">
              {isRTL ? `سجل الإشعارات المرسلة (${notifications.length})` : `Sent Notifications Feed (${notifications.length})`}
            </h4>

            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2 opacity-50" />
                <p className="text-xs text-gray-500 font-medium">
                  {isRTL ? 'لا توجد إشعارات مسجلة حتى الآن' : 'No notifications found in feed'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    className="p-4 rounded-2xl bg-[#FBF9F4] border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            notif.targetAudience === 'ALL'
                              ? 'bg-purple-100 text-purple-800'
                              : notif.targetAudience === 'STUDENTS'
                              ? 'bg-blue-100 text-blue-800'
                              : notif.targetAudience === 'TEACHERS'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {notif.targetAudience === 'ALL'
                            ? (isRTL ? 'عام (الجميع)' : 'Everyone')
                            : notif.targetAudience === 'STUDENTS'
                            ? (isRTL ? 'الطلاب فقط' : 'Students Only')
                            : notif.targetAudience === 'TEACHERS'
                            ? (isRTL ? 'المعلمون فقط' : 'Teachers Only')
                            : (isRTL ? 'مخصص / فردي' : 'Individual')}
                        </span>
                        <span className="text-xs font-bold text-[#29235D]">
                          {isRTL ? notif.titleArabic || notif.title : notif.title}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {notif.createdAt}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {isRTL ? notif.messageArabic || notif.message : notif.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          if (confirm(isRTL ? 'هل تريد حذف هذا الإشعار نهائياً؟' : 'Delete this notification?')) {
                            deleteNotification(notif.id);
                          }
                        }}
                        className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                        title={isRTL ? 'حذف الإشعار' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STUDENTS TAB */}
      {activeAdminSubTab === 'STUDENTS' && (
        <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#D3B673]" />
              <h3 className="text-base font-bold text-[#29235D] font-serif">
                Student Management & Status Control
              </h3>
            </div>
            <button
              onClick={() => setShowAddStudentModal(true)}
              className="px-4 py-2 bg-[#29235D] text-[#D3B673] text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-[#1D1845] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Student</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-[#F8F6F0] text-[#786F9A] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3 rounded-l-xl rtl:rounded-r-xl">{isRTL ? 'الطالب' : 'Student'}</th>
                  <th className="p-3">{isRTL ? 'كود الطالب' : 'Code'}</th>
                  <th className="p-3">{isRTL ? 'المعلم المسند' : 'Assigned Teacher'}</th>
                  <th className="p-3">{isRTL ? 'تاريخ الانضمام' : 'Joined Date'}</th>
                  <th className="p-3">{isRTL ? 'الحالة' : 'Status'}</th>
                  <th className="p-3 rounded-r-xl rtl:rounded-l-xl text-right rtl:text-left">{isRTL ? 'الإجراءات' : 'Status Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map(std => {
                  const teacher = teachers.find(t => std.assignedTeacherIds.includes(t.id));
                  const isSupervisorTeacher = teacher?.id === 'usr-adm-1' || teacher?.code === 'ADM-0001';
                  return (
                    <tr key={std.id} className="hover:bg-gray-50/60">
                      <td className="p-3 font-semibold text-[#29235D] flex items-center gap-2">
                        <div className="relative group">
                          <img
                            src={std.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={std.name}
                            className="w-8 h-8 rounded-full border border-[#D3B673] object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setAvatarModalUser(std)}
                            className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#29235D] text-[#D3B673] shadow-xs hover:scale-110 transition-all cursor-pointer"
                            title={isRTL ? 'تعديل صورة الطالب' : 'Change Avatar'}
                          >
                            <Camera className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <div>
                          <div className="font-bold">{std.nameArabic || std.name}</div>
                          <div className="text-[10px] text-gray-400 font-normal">{std.email}</div>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-[#D3B673]">{std.code}</td>
                      <td className="p-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isSupervisorTeacher && (
                              <Crown className="w-3.5 h-3.5 text-[#B89955] shrink-0" />
                            )}
                            <span className={`font-semibold ${isSupervisorTeacher ? 'text-[#29235D] font-bold' : 'text-gray-700'}`}>
                              {teacher ? (isRTL ? teacher.nameArabic || teacher.name : teacher.name) : (isRTL ? 'غير مسند' : 'Unassigned')}
                            </span>
                            {isSupervisorTeacher && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-[#29235D] text-[#D3B673]">
                                {isRTL ? 'المشرف العام' : 'Supervisor'}
                              </span>
                            )}
                          </div>
                          {/* Quick change / reassign teacher dropdown */}
                          <select
                            value={std.assignedTeacherIds[0] || ''}
                            onChange={e => {
                              const val = e.target.value;
                              updateStudent(std.id, {
                                assignedTeacherIds: val ? [val] : [],
                              });
                            }}
                            className="text-[10px] py-1 px-1.5 bg-[#FBF9F4] border border-gray-200 rounded-lg text-gray-700 hover:border-[#D3B673] focus:outline-none max-w-[170px]"
                            title={isRTL ? 'تغيير أو إسناد المعلم' : 'Reassign Teacher'}
                          >
                            <option value="">{isRTL ? '-- اختر معلماً مسنداً --' : '-- Choose Instructor --'}</option>
                            {allSelectableTeachers.map(tea => {
                              const isSup = tea.id === 'usr-adm-1' || tea.code === 'ADM-0001';
                              return (
                                <option key={tea.id} value={tea.id}>
                                  {isSup ? '👑 ' : ''}
                                  {isRTL ? tea.nameArabic || tea.name : tea.name}
                                  {isSup ? (isRTL ? ' (المشرف العام)' : ' (Supervisor)') : ` (${tea.code})`}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </td>
                      <td className="p-3 text-gray-500">{std.joinedDate}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            std.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : std.status === 'SUSPENDED'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {std.status}
                        </span>
                      </td>
                      <td className="p-3 text-right rtl:text-left">
                        <div className="flex items-center justify-end rtl:justify-start gap-1">
                          {/* Change Avatar */}
                          <button
                            onClick={() => setAvatarModalUser(std)}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#29235D] transition-all"
                            title={isRTL ? 'تعديل الصورة' : 'Change Avatar'}
                          >
                            <Camera className="w-3.5 h-3.5 text-[#B89955]" />
                          </button>

                          {/* Change Password */}
                          <button
                            onClick={() => {
                              setPasswordTargetUser(std);
                              setActiveAdminSubTab('PASSWORDS');
                            }}
                            className="p-1.5 rounded-lg bg-[#29235D]/10 hover:bg-[#29235D]/20 text-[#29235D] transition-all"
                            title={isRTL ? 'تعديل كلمة المرور' : 'Change Password'}
                          >
                            <KeyRound className="w-3.5 h-3.5 text-[#29235D]" />
                          </button>

                          {/* Toggle Active / Suspended */}
                          <button
                            onClick={() =>
                              updateStudent(std.id, {
                                status: std.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                              })
                            }
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                              std.status === 'ACTIVE'
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {std.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => deleteStudent(std.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEACHERS TAB */}
      {activeAdminSubTab === 'TEACHERS' && (
        <TeacherPermissionManager />
      )}

      {/* PROGRAMS TAB */}
      {activeAdminSubTab === 'PROGRAMS' && (
        <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#D3B673]" />
              <h3 className="text-base font-bold text-[#29235D] font-serif">
                Programs & Courses Catalog
              </h3>
            </div>
            <button
              onClick={() => setShowAddProgramModal(true)}
              className="px-4 py-2 bg-[#29235D] text-[#D3B673] text-xs font-bold rounded-xl flex items-center gap-1.5 hover:bg-[#1D1845]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Program</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map(prg => (
              <div
                key={prg.id}
                className="p-5 rounded-2xl border border-gray-200 bg-[#FBF9F4] space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#29235D] text-[#D3B673]">
                      {prg.code}
                    </span>
                    <h4 className="text-sm font-bold text-[#29235D] font-serif mt-1">{prg.name}</h4>
                    <p className="text-xs text-gray-500 font-arabic">{prg.nameArabic}</p>
                  </div>
                  <span className="text-base font-black text-[#B89955]">${prg.price}</span>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">{prg.description}</p>

                <div className="pt-2 border-t border-gray-200 flex justify-between items-center text-[11px] text-gray-500">
                  <span>Level: {prg.level}</span>
                  <span>{prg.totalSessions} sessions</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditingProgram(prg)}
                      className="text-[#29235D] hover:text-[#1D1845] font-bold flex items-center gap-1 cursor-pointer bg-[#D3B673]/20 hover:bg-[#D3B673]/30 px-2.5 py-1 rounded-lg border border-[#D3B673]/40"
                    >
                      <Edit className="w-3 h-3 text-[#B89955]" />
                      <span>{isRTL ? 'تعديل البرنامج' : 'Edit'}</span>
                    </button>
                    <button
                      onClick={() => deleteProgram(prg.id)}
                      className="text-red-500 hover:text-red-700 font-bold cursor-pointer"
                    >
                      {isRTL ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBSCRIPTIONS TAB */}
      {activeAdminSubTab === 'SUBSCRIPTIONS' && (
        <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#D3B673]" />
              <h3 className="text-base font-bold text-[#29235D] font-serif">
                Student Subscriptions & Expirations
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-[#F8F6F0] text-[#786F9A] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">Program</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">End Date</th>
                  <th className="p-3">Sessions (Attended/Total)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right rtl:text-left">Extend / Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subscriptions.map(sub => {
                  const student = students.find(s => s.id === sub.studentId);
                  const program = programs.find(p => p.id === sub.programId);
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50/60">
                      <td className="p-3 font-bold text-[#29235D]">{student?.name || sub.studentId}</td>
                      <td className="p-3 text-gray-700">{program?.name || sub.programId}</td>
                      <td className="p-3 text-gray-500">{sub.startDate}</td>
                      <td className="p-3 font-semibold text-[#29235D]">{sub.endDate}</td>
                      <td className="p-3 font-mono font-bold">
                        {sub.attendedSessions} / {sub.totalSessions} ({sub.remainingSessions} left)
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {sub.status}
                        </span>
                      </td>
                      <td className="p-3 text-right rtl:text-left flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            rechargeStudentSessions(sub.studentId, 5, 30, 'Admin 5-Session Top-Up');
                            alert(isRTL ? 'تم شحن 5 حصص وتمديد الصلاحية بنجاح!' : 'Successfully recharged 5 sessions & extended validity!');
                          }}
                          className="px-2.5 py-1 bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] font-bold rounded-lg text-[10px] shadow-xs cursor-pointer"
                        >
                          + 5 {isRTL ? 'حصص ⚡' : 'Lessons ⚡'}
                        </button>
                        <button
                          onClick={() => setShowExtendSubId(sub.id)}
                          className="px-3 py-1 bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold rounded-lg text-[10px] shadow-xs cursor-pointer"
                        >
                          + Extend Validity
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeAdminSubTab === 'ATTENDANCE' && (
        <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-[#D3B673]" />
              <h3 className="text-base font-bold text-[#29235D] font-serif">
                Global Attendance Log & Verification
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-[#F8F6F0] text-[#786F9A] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Teacher</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Marked Timestamp</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendance.map(att => {
                  const student = students.find(s => s.id === att.studentId);
                  const teacher = teachers.find(t => t.id === att.teacherId);
                  return (
                    <tr key={att.id} className="hover:bg-gray-50/60">
                      <td className="p-3 font-mono text-gray-500">{att.date}</td>
                      <td className="p-3 font-bold text-[#29235D]">{student?.name || att.studentId}</td>
                      <td className="p-3 text-gray-600">{teacher?.name || att.teacherId}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            att.status === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : att.status === 'ABSENT'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-gray-400">{att.markedAt}</td>
                      <td className="p-3 text-gray-500">{att.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PERMISSIONS TAB */}
      {activeAdminSubTab === 'PERMISSIONS' && (
        <TeacherPermissionManager />
      )}

      {/* PASSWORDS & SECURITY TAB */}
      {activeAdminSubTab === 'PASSWORDS' && (
        <PasswordManagerModal
          initialSelectedUserId={passwordTargetUser?.id}
          onSelectUserForAvatar={u => setAvatarModalUser(u)}
        />
      )}

      {/* BRANDING & LOGO TAB */}
      {activeAdminSubTab === 'BRANDING' && (
        <BrandingManager />
      )}

      {/* SETTINGS TAB */}
      {activeAdminSubTab === 'SETTINGS' && (
        <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#D3B673]" />
            <h3 className="text-base font-bold text-[#29235D] font-serif">
              Platform & Brand Configuration
            </h3>
          </div>

          {settingsSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Platform settings updated and persisted successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#29235D] mb-1">Platform Name</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={e => setPlatformName(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-bold text-[#29235D]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#29235D] mb-1">Default Zoom Room URL</label>
                <input
                  type="text"
                  value={defaultZoom}
                  onChange={e => setDefaultZoom(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-[#29235D] mb-1">Student Code Prefix</label>
                <input
                  type="text"
                  value={studentPrefix}
                  onChange={e => setStudentPrefix(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-[#29235D] mb-1">Teacher Code Prefix</label>
                <input
                  type="text"
                  value={teacherPrefix}
                  onChange={e => setTeacherPrefix(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-[#29235D] mb-1">Program Code Prefix</label>
                <input
                  type="text"
                  value={programPrefix}
                  onChange={e => setProgramPrefix(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#29235D] text-[#D3B673] font-bold hover:bg-[#1D1845] border border-[#D3B673] shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Platform Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add Student */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#29235D]/20 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#29235D]/10 text-[#29235D]">
                  <UserCheck className="w-5 h-5 text-[#B89955]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#29235D] font-serif">
                    {isRTL ? 'تسجيل وإضافة طالب جديد' : 'Create New Student Account'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {isRTL ? 'إسناد الطالب للمشرف العام أو لأحد المعلمين المعتمدين' : 'Assign student to Supervisor or certified teacher'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'الاسم الكامل (بالعربية) *' : 'Full Name (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newStdNameAr}
                    onChange={e => setNewStdNameAr(e.target.value)}
                    placeholder="ياسمين الحسن"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-arabic focus:border-[#D3B673] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'الاسم الكامل (بالإنجليزية)' : 'Full Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={newStdName}
                    onChange={e => setNewStdName(e.target.value)}
                    placeholder="Yasmin Al-Hassan"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl focus:border-[#D3B673] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={newStdEmail}
                    onChange={e => setNewStdEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl focus:border-[#D3B673] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}
                  </label>
                  <input
                    type="tel"
                    value={newStdPhone}
                    onChange={e => setNewStdPhone(e.target.value)}
                    placeholder="+20 101 234 5678"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl focus:border-[#D3B673] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Program Selection */}
              <div>
                <label className="block font-bold text-[#29235D] mb-1">
                  {isRTL ? 'البرنامج التعليمي المسجل به' : 'Enrolled Academic Program'}
                </label>
                <select
                  value={newStdProgramId}
                  onChange={e => setNewStdProgramId(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl focus:border-[#D3B673] outline-none font-medium"
                >
                  <option value="">{isRTL ? '-- اختر البرنامج التعليمي --' : '-- Select Program --'}</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>
                      {isRTL ? p.nameArabic : p.name} ({p.currency} {p.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Study Mode */}
              <div>
                <label className="block font-bold text-[#29235D] mb-1">
                  {isRTL ? 'نظام الدراسة المفضل' : 'Preferred Study Mode'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStdStudyMode('PRIVATE')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      newStdStudyMode === 'PRIVATE'
                        ? 'bg-[#29235D] text-[#D3B673] border-[#29235D]'
                        : 'bg-[#FBF9F4] text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'دراسة فردية خاصة (1-on-1)' : 'Private (1-on-1)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStdStudyMode('GROUP')}
                    className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      newStdStudyMode === 'GROUP'
                        ? 'bg-[#29235D] text-[#D3B673] border-[#29235D]'
                        : 'bg-[#FBF9F4] text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'مجموعة تفاعلية (Group)' : 'Interactive Group'}</span>
                  </button>
                </div>
              </div>

              {/* Assign Primary Teacher with Supervisor Prioritized First */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-[#29235D] flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-[#B89955]" />
                    <span>{isRTL ? 'تعيين المعلم / المدرب الأساسي للطالب' : 'Assign Primary Instructor'}</span>
                  </label>
                  <span className="text-[10px] font-bold text-[#B89955] flex items-center gap-1">
                    <Crown className="w-3 h-3 text-[#B89955]" />
                    <span>{isRTL ? 'اسمك كمشرف متاح أولاً' : 'Director Available'}</span>
                  </span>
                </div>

                <select
                  value={newStdTeacherId}
                  onChange={e => setNewStdTeacherId(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF9F4] border-2 border-[#29235D]/30 focus:border-[#D3B673] rounded-xl font-bold text-[#29235D] outline-none"
                >
                  {allSelectableTeachers.map(t => {
                    const isSupervisor = t.id === 'usr-adm-1' || t.code === 'ADM-0001';
                    const displayName = isRTL ? (t.nameArabic || t.name) : t.name;
                    return (
                      <option
                        key={t.id}
                        value={t.id}
                        className={isSupervisor ? 'font-black bg-[#F8F6F0] text-[#29235D]' : ''}
                      >
                        {isSupervisor ? '👑 ' : ''}
                        {displayName}
                        {isSupervisor
                          ? (isRTL ? ' (المشرف العام - تدريس مباشر)' : ' (Supervisor & Master Instructor)')
                          : ` (${t.code}) - ${isRTL ? (t.specializationArabic || t.specialization) : t.specialization}`}
                      </option>
                    );
                  })}
                </select>

                {/* Supervisor confirmation banner */}
                {(newStdTeacherId === 'usr-adm-1' || newStdTeacherId === 'ADM-0001') && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-[#B89955] shrink-0" />
                    <span className="text-[11px] font-bold leading-relaxed">
                      {isRTL
                        ? 'سيتم إسناد الطالب مباشرة إلى حسابك التدريسي (المشرف العام)، وسيظهر الطالب في جدول حصصك وقائمة طلابك المباشرة.'
                        : 'The student will be directly assigned to your supervisor teaching schedule and direct classes.'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isRTL ? 'تسجيل الطالب وتأكيد الإسناد' : 'Create Student & Assign'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Teacher */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#29235D]/20 shadow-2xl">
            <h3 className="text-base font-bold text-[#29235D] font-serif">Add Certified Teacher</h3>
            <form onSubmit={handleCreateTeacher} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#29235D] mb-1">Teacher Name</label>
                <input
                  type="text"
                  required
                  value={newTeaName}
                  onChange={e => setNewTeaName(e.target.value)}
                  placeholder="Sheikh Yusuf Al-Ghamdi"
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-[#29235D] mb-1">Specialization</label>
                <input
                  type="text"
                  value={newTeaSpec}
                  onChange={e => setNewTeaSpec(e.target.value)}
                  placeholder="Classical Arabic & Tajweed Specialist"
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 text-gray-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#29235D] text-[#D3B673] font-bold rounded-xl"
                >
                  Add Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Program */}
      {showAddProgramModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#29235D]/20 shadow-2xl">
            <h3 className="text-base font-bold text-[#29235D] font-serif">Create Educational Program</h3>
            <form onSubmit={handleCreateProgram} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">Program Name (English)</label>
                  <input
                    type="text"
                    required
                    value={newPrgName}
                    onChange={e => setNewPrgName(e.target.value)}
                    placeholder="Quranic Phonetics & Makharij"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">Program Name (Arabic)</label>
                  <input
                    type="text"
                    value={newPrgNameAr}
                    onChange={e => setNewPrgNameAr(e.target.value)}
                    placeholder="مخارج الحروف وصفاتها"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-arabic"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={newPrgPrice}
                    onChange={e => setNewPrgPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">Total Sessions</label>
                  <input
                    type="number"
                    value={newPrgSessions}
                    onChange={e => setNewPrgSessions(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddProgramModal(false)}
                  className="px-4 py-2 text-gray-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#29235D] text-[#D3B673] font-bold rounded-xl"
                >
                  Create Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Extend Subscription Validity */}
      {showExtendSubId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-[#29235D]/20 shadow-2xl">
            <h3 className="text-base font-bold text-[#29235D] font-serif">Extend Subscription Validity</h3>
            <p className="text-xs text-gray-500">
              Add additional calendar days and live session quotas.
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#29235D] mb-1">Add Days</label>
                <input
                  type="number"
                  value={extendDays}
                  onChange={e => setExtendDays(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-[#29235D] mb-1">Add Extra Sessions</label>
                <input
                  type="number"
                  value={extendSessions}
                  onChange={e => setExtendSessions(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowExtendSubId(null)}
                  className="px-4 py-2 text-gray-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    extendSubscription(showExtendSubId, extendDays, extendSessions);
                    setShowExtendSubId(null);
                  }}
                  className="px-5 py-2 bg-[#29235D] text-[#D3B673] font-bold rounded-xl"
                >
                  Confirm Extension
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROGRAM MODAL */}
      {editingProgram && (
        <ProgramEditModal
          program={editingProgram}
          isOpen={!!editingProgram}
          onClose={() => setEditingProgram(null)}
          onSaved={() => setEditingProgram(null)}
        />
      )}

      {/* USER AVATAR EDIT MODAL */}
      <UserAvatarEditModal
        user={avatarModalUser}
        isOpen={!!avatarModalUser}
        onClose={() => setAvatarModalUser(null)}
      />

      {/* BROADCAST NOTIFICATION MODAL */}
      <BroadcastNotificationModal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
      />

      {/* SUPERVISOR TIMETABLE MODAL */}
      {showSupervisorTimetableModal && (
        <PlatformTimetableCalendar
          teacher={
            teachers.find(t => t.id === 'usr-adm-1' || t.code === 'ADM-0001') || {
              id: 'usr-adm-1',
              code: 'ADM-0001',
              name: adminProfile?.name || 'Ahmad Ibrahim',
              nameArabic: adminProfile?.nameArabic || 'أحمد إبراهيم',
              email: 'alafak.education.aetc@gmail.com',
              role: 'TEACHER',
              status: 'ACTIVE',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              joinedDate: '2025-01-01',
              assignedProgramIds: programs.map(p => p.id),
              assignedStudentIds: [],
              teacherPermissions: {
                canCreateLessons: true,
                canCreateActivities: true,
                canManageAttendance: true,
                canScheduleClasses: true,
                canViewAllReports: true,
                canIssueCertificates: true,
                canAccessWhiteboard: true,
                canEditCurriculum: true,
              },
              availabilitySlots: [],
            }
          }
          onClose={() => setShowSupervisorTimetableModal(false)}
        />
      )}

    </div>
  );
};
