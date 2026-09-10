import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { TeacherProfile, TeacherPermissions, Program, UserStatus } from '../../types';
import { UserAvatarEditModal } from './UserAvatarEditModal';
import { PlatformTimetableCalendar } from '../calendar/PlatformTimetableCalendar';
import {
  ShieldCheck,
  Users,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  KeyRound,
  Trash2,
  Edit3,
  BookOpen,
  Sliders,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  GraduationCap,
  Presentation,
  Gamepad2,
  ClipboardCheck,
  Calendar,
  BarChart3,
  Award,
  Layers,
  HelpCircle,
  CheckCircle,
  Camera,
  Crown,
  Lock,
} from 'lucide-react';

export const permissionDefinitions: {
  key: keyof TeacherPermissions;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: 'canCreateLessons',
    labelAr: 'إنشاء وتعديل وحدات الدروس والمناهج',
    labelEn: 'Create & Edit Interactive Lessons',
    descAr: 'السماح للمعلم ببناء شرائح ومكونات الدروس التفاعلية ونشرها للطلاب',
    descEn: 'Allows building and publishing interactive lesson slides and materials',
    icon: BookOpen,
  },
  {
    key: 'canCreateActivities',
    labelAr: 'برمجة وبناء الألعاب التفاعلية',
    labelEn: 'Build Interactive Games & Sandboxes',
    descAr: 'السماح للمعلم بإنشاء ألعاب تفاعلية ومسابقات ومحرر الأكواد المعزول',
    descEn: 'Enables creation and editing of HTML/JS educational games and quizzes',
    icon: Gamepad2,
  },
  {
    key: 'canManageAttendance',
    labelAr: 'تسجيل وإدارة الحضور والغياب',
    labelEn: 'Manage Attendance & Excuses',
    descAr: 'صلاحية رصد حضور الطلاب، تسجيل الغياب والتأخير وإرسال الملاحظات',
    descEn: 'Permits recording attendance, logging tardiness, and submitting notes',
    icon: ClipboardCheck,
  },
  {
    key: 'canScheduleClasses',
    labelAr: 'جدولة الحصص المباشرة وروابط Zoom',
    labelEn: 'Schedule Live Classes & Zoom Links',
    descAr: 'إمكانية تحديد مواعيد الحصص المباشرة وتعيين أو تعديل غرف Zoom',
    descEn: 'Allows creating calendar schedule slots and configuring Zoom meeting links',
    icon: Calendar,
  },
  {
    key: 'canAccessWhiteboard',
    labelAr: 'استخدام السبورة التفاعلية الذكية',
    labelEn: 'Access Digital Interactive Whiteboard',
    descAr: 'إمكانية فتح السبورة الذكية والرسم وإدراج الآيات القرآنية أثناء الحصة',
    descEn: 'Enables the interactive digital canvas, Quranic verses & drawing tools',
    icon: Presentation,
  },
  {
    key: 'canIssueCertificates',
    labelAr: 'إصدار واعتماد الشهادات الأكاديمية',
    labelEn: 'Issue Academic Certificates',
    descAr: 'منح المعلم صلاحية تخريج الطلاب وطباعة شهادات إتمام المستويات',
    descEn: 'Authorizes issuing course completion certificates and grades',
    icon: Award,
  },
  {
    key: 'canViewAllReports',
    labelAr: 'الاطلاع على التقارير والإحصائيات الشاملة',
    labelEn: 'Access Comprehensive Reports',
    descAr: 'عرض مؤشرات الأداء الأكاديمية وسجلات المركز وتقارير الاشتراكات',
    descEn: 'Grants access to global center analytics and subscription logs',
    icon: BarChart3,
  },
  {
    key: 'canEditCurriculum',
    labelAr: 'تعديل وتحديث محتوى البرامج التعليمية',
    labelEn: 'Edit Master Curriculum & Programs',
    descAr: 'صلاحية عليا لتعديل بيانات البرنامج التعليمي والأسعار والمدة',
    descEn: 'Advanced privilege to modify program descriptions, levels, and structure',
    icon: Layers,
  },
];

const PRESETS = {
  FULL: {
    canCreateLessons: true,
    canCreateActivities: true,
    canManageAttendance: true,
    canScheduleClasses: true,
    canViewAllReports: true,
    canIssueCertificates: true,
    canAccessWhiteboard: true,
    canEditCurriculum: true,
  },
  STANDARD: {
    canCreateLessons: true,
    canCreateActivities: true,
    canManageAttendance: true,
    canScheduleClasses: true,
    canViewAllReports: false,
    canIssueCertificates: true,
    canAccessWhiteboard: true,
    canEditCurriculum: false,
  },
  ASSISTANT: {
    canCreateLessons: false,
    canCreateActivities: false,
    canManageAttendance: true,
    canScheduleClasses: false,
    canViewAllReports: false,
    canIssueCertificates: false,
    canAccessWhiteboard: true,
    canEditCurriculum: false,
  },
};

export const TeacherPermissionManager: React.FC = () => {
  const {
    teachers,
    programs,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    updateTeacherPermissions,
    assignTeacherPrograms,
    regenerateUserCode,
  } = useApp();

  const { t, isRTL } = useI18n();

  const [viewMode, setViewMode] = useState<'CARDS' | 'MATRIX'>('CARDS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modals state
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherProfile | null>(null);
  const [selectedTeacherForPermissions, setSelectedTeacherForPermissions] = useState<TeacherProfile | null>(null);
  const [selectedTeacherForPrograms, setSelectedTeacherForPrograms] = useState<TeacherProfile | null>(null);
  const [selectedTeacherForTimetable, setSelectedTeacherForTimetable] = useState<TeacherProfile | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherProfile | null>(null);
  const [avatarModalUser, setAvatarModalUser] = useState<TeacherProfile | null>(null);

  // Copied code feedback
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // New Teacher Form State
  const [newTeaName, setNewTeaName] = useState('');
  const [newTeaNameAr, setNewTeaNameAr] = useState('');
  const [newTeaSpec, setNewTeaSpec] = useState('');
  const [newTeaSpecAr, setNewTeaSpecAr] = useState('');
  const [newTeaEmail, setNewTeaEmail] = useState('');
  const [newTeaPhone, setNewTeaPhone] = useState('');
  const [newTeaBio, setNewTeaBio] = useState('');
  const [newTeaAvatar, setNewTeaAvatar] = useState('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');
  const [newTeaAssignedPrograms, setNewTeaAssignedPrograms] = useState<string[]>([]);
  const [newTeaPermissions, setNewTeaPermissions] = useState<TeacherPermissions>(PRESETS.STANDARD);

  // Filtered teachers
  const filteredTeachers = teachers.filter(tea => {
    const matchesSearch =
      tea.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tea.nameArabic && tea.nameArabic.includes(searchQuery)) ||
      tea.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tea.specialization.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProgram =
      selectedProgramFilter === 'ALL' ||
      (tea.assignedProgramIds && tea.assignedProgramIds.includes(selectedProgramFilter));

    const matchesStatus =
      selectedStatusFilter === 'ALL' || tea.status === selectedStatusFilter;

    return matchesSearch && matchesProgram && matchesStatus;
  });

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    showToast(isRTL ? `تم نسخ كود الدخول: ${code}` : `Copied access code: ${code}`);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleRegenerateCode = (teacherId: string) => {
    const newCode = regenerateUserCode(teacherId);
    showToast(isRTL ? `تم توليد كود دخول جديد بنجاح: ${newCode}` : `New code generated: ${newCode}`);
  };

  const handleCreateTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeaName) return;

    addTeacher({
      role: 'TEACHER',
      name: newTeaName,
      nameArabic: newTeaNameAr || newTeaName,
      specialization: newTeaSpec || 'Arabic & Quran Trainer',
      specializationArabic: newTeaSpecAr || 'مدرب لغة عربية وقرآن كريم',
      email: newTeaEmail,
      phone: newTeaPhone,
      bio: newTeaBio,
      avatarUrl: newTeaAvatar,
      status: 'ACTIVE',
      assignedProgramIds: newTeaAssignedPrograms,
      assignedStudentIds: [],
      teacherPermissions: newTeaPermissions,
      rating: 5.0,
      totalClassesTaught: 0,
    });

    showToast(isRTL ? `تمت إضافة المدرب ${newTeaName} بنجاح` : `Trainer ${newTeaName} added successfully`);
    setShowAddTeacherModal(false);

    // Reset form
    setNewTeaName('');
    setNewTeaNameAr('');
    setNewTeaSpec('');
    setNewTeaSpecAr('');
    setNewTeaEmail('');
    setNewTeaPhone('');
    setNewTeaBio('');
    setNewTeaAssignedPrograms([]);
    setNewTeaPermissions(PRESETS.STANDARD);
  };

  const handleEditTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;

    updateTeacher(editingTeacher.id, {
      name: editingTeacher.name,
      nameArabic: editingTeacher.nameArabic,
      specialization: editingTeacher.specialization,
      specializationArabic: editingTeacher.specializationArabic,
      email: editingTeacher.email,
      phone: editingTeacher.phone,
      bio: editingTeacher.bio,
      status: editingTeacher.status,
    });

    showToast(isRTL ? 'تم حفظ بيانات المدرب بنجاح' : 'Teacher details updated successfully');
    setEditingTeacher(null);
  };

  const handleDeleteTeacherConfirm = () => {
    if (!teacherToDelete) return;
    deleteTeacher(teacherToDelete.id);
    showToast(isRTL ? `تم حذف المدرب ${teacherToDelete.name} بنجاح` : `Trainer ${teacherToDelete.name} removed`);
    setTeacherToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#29235D] text-[#E8D5A3] px-5 py-3 rounded-2xl shadow-2xl border border-[#D3B673]/40 flex items-center gap-3 animate-bounce">
          <CheckCircle className="w-5 h-5 text-[#D3B673]" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* 1. Top Authority Banner */}
      <div className="bg-gradient-to-r from-[#29235D] via-[#1E1945] to-[#29235D] rounded-3xl p-6 sm:p-7 text-white border border-[#D3B673]/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D3B673]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D3B673]/20 text-[#E8D5A3] border border-[#D3B673]/40 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D3B673]" />
                {t('generalSupervisorAuthority')}
              </span>
              <span className="text-xs bg-black/30 px-2.5 py-0.5 rounded text-white/80 font-mono">
                RBAC Level: SUPER_ADMIN
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white font-serif tracking-wide">
              {isRTL ? 'إدارة هيئة التدريس وتخصيص الصلاحيات الفردية' : 'Faculty Management & Granular Permissions'}
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              {isRTL
                ? 'يتمتع المشرف العام بالصلاحيات المطلقة لإضافة وحذف أي مدرب، وتحديد البرامج المسندة إليه، وتخصيص حزمة الصلاحيات (الدروس، الألعاب، الحضور، الحصص، السبورة، الشهادات) لكل مدرب على حدة.'
                : 'As General Supervisor, you have absolute authority to recruit or remove trainers, assign curriculum programs, and configure precise capability matrices for each trainer individually.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddTeacherModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isRTL ? 'إضافة مدرب جديد' : 'Add New Trainer'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#29235D]/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute top-3.5 left-3.5 rtl:left-auto rtl:right-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'بحث بالاسم، كود المدرب، أو التخصص...' : 'Search by name, code, specialization...'}
            className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 bg-[#FBF9F4] border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#29235D] text-[#29235D]"
          />
        </div>

        {/* Filters & View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Program filter */}
          <select
            value={selectedProgramFilter}
            onChange={e => setSelectedProgramFilter(e.target.value)}
            className="px-3 py-2 bg-[#FBF9F4] border border-gray-200 rounded-xl text-xs font-semibold text-[#29235D]"
          >
            <option value="ALL">{isRTL ? 'جميع البرامج' : 'All Programs'}</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>
                {isRTL ? p.nameArabic : p.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatusFilter}
            onChange={e => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#FBF9F4] border border-gray-200 rounded-xl text-xs font-semibold text-[#29235D]"
          >
            <option value="ALL">{isRTL ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="ACTIVE">{isRTL ? 'نشط فقط' : 'Active'}</option>
            <option value="SUSPENDED">{isRTL ? 'معلّق' : 'Suspended'}</option>
            <option value="INACTIVE">{isRTL ? 'غير نشط' : 'Inactive'}</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#F8F6F0] p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'CARDS'
                  ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                  : 'text-gray-500 hover:text-[#29235D]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isRTL ? 'بطاقات' : 'Cards'}</span>
            </button>
            <button
              onClick={() => setViewMode('MATRIX')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'MATRIX'
                  ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                  : 'text-gray-500 hover:text-[#29235D]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{isRTL ? 'مصفوفة الصلاحيات' : 'Matrix'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Display: Cards View OR Matrix View */}
      {viewMode === 'CARDS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachers.map(tea => {
            const perms = tea.teacherPermissions || PRESETS.STANDARD;
            const assignedProgramsList = programs.filter(p =>
              (tea.assignedProgramIds || []).includes(p.id)
            );

            const isSupervisor = tea.id === 'usr-adm-1' || tea.code === 'ADM-0001';

            return (
              <div
                key={tea.id}
                className={`rounded-3xl p-5 border transition-all flex flex-col justify-between space-y-4 relative group ${
                  isSupervisor
                    ? 'bg-gradient-to-b from-[#FBF8EF] to-white border-2 border-[#D3B673] shadow-md ring-4 ring-[#D3B673]/10'
                    : 'bg-white border-[#29235D]/10 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Supervisor distinctive badge */}
                {isSupervisor && (
                  <div className="flex items-center justify-between pb-2 border-b border-[#D3B673]/20">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-[#29235D] text-[#D3B673] border border-[#D3B673]/40 shadow-xs">
                      <Crown className="w-3.5 h-3.5 text-[#D3B673]" />
                      {isRTL ? 'المشرف العام (إشراف المنصة + تدريس مباشر)' : 'Platform Supervisor & Master Instructor'}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      {isRTL ? 'إشراف وتدريس' : 'Admin & Teacher'}
                    </span>
                  </div>
                )}

                {/* Status and Actions header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative group/avatar">
                      <img
                        src={tea.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                        alt={tea.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D3B673]/40 shadow-xs flex-shrink-0"
                      />
                      <button
                        type="button"
                        onClick={() => setAvatarModalUser(tea)}
                        className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-[#29235D] text-[#D3B673] shadow-md hover:bg-[#1E1945] hover:scale-110 transition-all cursor-pointer"
                        title={isRTL ? 'تعديل صورة المدرب' : 'Change Avatar'}
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#29235D] font-serif leading-tight">
                        {isRTL ? tea.nameArabic || tea.name : tea.name}
                      </h4>
                      <p className="text-[11px] text-[#B89955] font-medium mt-0.5 line-clamp-1">
                        {isRTL ? tea.specializationArabic || tea.specialization : tea.specialization}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {/* Code badge with 1-click copy */}
                        <button
                          onClick={() => handleCopyCode(tea.code, tea.id)}
                          className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#29235D] text-[#D3B673] hover:bg-[#1E1945] transition-all cursor-pointer"
                          title={isRTL ? 'انقر لنسخ كود الدخول' : 'Click to copy code'}
                        >
                          {copiedCodeId === tea.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-70" />
                          )}
                          <span>{tea.code}</span>
                        </button>

                        {/* Regenerate code button */}
                        {!isSupervisor && (
                          <button
                            onClick={() => handleRegenerateCode(tea.id)}
                            className="p-1 text-gray-400 hover:text-[#29235D] hover:bg-gray-100 rounded transition-all cursor-pointer"
                            title={isRTL ? 'توليد كود دخول جديد للمدرب' : 'Regenerate access code'}
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  {isSupervisor ? (
                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {isRTL ? 'نشط دائماً' : 'Always Active'}
                    </span>
                  ) : (
                    <select
                      value={tea.status}
                      onChange={e => updateTeacher(tea.id, { status: e.target.value as UserStatus })}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border cursor-pointer ${
                        tea.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : tea.status === 'SUSPENDED'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                    >
                      <option value="ACTIVE">{isRTL ? 'نشط' : 'Active'}</option>
                      <option value="SUSPENDED">{isRTL ? 'معلّق' : 'Suspended'}</option>
                      <option value="INACTIVE">{isRTL ? 'غير نشط' : 'Inactive'}</option>
                    </select>
                  )}
                </div>

                {/* Assigned Programs Section */}
                <div className="bg-[#FBF9F4] rounded-2xl p-3 border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#29235D] flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#D3B673]" />
                      {isRTL ? 'البرامج المعتمدة لهذا المدرب:' : 'Assigned Programs:'}
                    </span>
                    <button
                      onClick={() => setSelectedTeacherForPrograms(tea)}
                      className="text-[10px] font-bold text-[#D3B673] hover:text-[#B89955] hover:underline cursor-pointer"
                    >
                      {isRTL ? 'تعديل البرامج' : 'Manage'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {assignedProgramsList.length > 0 ? (
                      assignedProgramsList.map(prg => (
                        <span
                          key={prg.id}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-white border border-[#29235D]/15 text-[#29235D]"
                        >
                          {isRTL ? prg.nameArabic : prg.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-gray-400 italic">
                        {isRTL ? 'لم يتم إسناد أي برنامج بعد' : 'No programs assigned yet'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Permissions Summary Badges */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#29235D] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#D3B673]" />
                      {isRTL ? 'الصلاحيات الأكاديمية المفعلة:' : 'Active Capabilities:'}
                    </span>
                    <button
                      onClick={() => setSelectedTeacherForPermissions(tea)}
                      className="text-[10px] font-bold text-[#D3B673] hover:text-[#B89955] hover:underline cursor-pointer"
                    >
                      {isRTL ? 'تخصيص' : 'Customize'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    {permissionDefinitions.slice(0, 6).map(pDef => {
                      const isGranted = !!perms[pDef.key];
                      const Icon = pDef.icon;
                      return (
                        <div
                          key={pDef.key}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${
                            isGranted
                              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900 font-medium'
                              : 'bg-gray-50 border-gray-200 text-gray-400 line-through opacity-70'
                          }`}
                        >
                          <Icon className={`w-3 h-3 ${isGranted ? 'text-emerald-600' : 'text-gray-400'}`} />
                          <span className="truncate">{isRTL ? pDef.labelAr : pDef.labelEn}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedTeacherForPermissions(tea)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#29235D] hover:bg-[#1E1945] text-[#D3B673] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'الصلاحيات' : 'Permissions'}</span>
                  </button>

                  <button
                    onClick={() => setSelectedTeacherForTimetable(tea)}
                    className={`p-2 rounded-xl transition-all cursor-pointer border ${
                      isSupervisor
                        ? 'bg-[#29235D] text-[#D3B673] border-[#D3B673] shadow-xs hover:bg-[#1E1945]'
                        : 'text-[#29235D] hover:bg-[#D3B673]/20 bg-[#F8F6F0] border-[#D3B673]/40'
                    }`}
                    title={isRTL ? 'جدول المواعيد والتفرغ الأسبوعي' : 'Weekly Timetable'}
                  >
                    <Calendar className={`w-4 h-4 ${isSupervisor ? 'text-[#D3B673]' : 'text-[#B89955]'}`} />
                  </button>

                  <button
                    onClick={() => setEditingTeacher(tea)}
                    className="p-2 text-gray-500 hover:text-[#29235D] hover:bg-gray-100 rounded-xl transition-all cursor-pointer border border-gray-200"
                    title={isRTL ? 'تعديل البيانات' : 'Edit details'}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {isSupervisor ? (
                    <button
                      disabled
                      className="p-2 text-gray-300 bg-gray-50 rounded-xl cursor-not-allowed border border-gray-100"
                      title={isRTL ? 'حساب المشرف العام محمي ولا يمكن حذفه' : 'Supervisor is Protected'}
                    >
                      <Lock className="w-4 h-4 text-gray-400" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setTeacherToDelete(tea)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-gray-200"
                      title={isRTL ? 'حذف المدرب' : 'Delete teacher'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* MATRIX VIEW: Live switches table for all teachers */
        <div className="bg-white rounded-3xl p-5 border border-[#29235D]/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-[#F8F6F0] text-[#786F9A] uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-3.5 rounded-l-xl rtl:rounded-r-xl sticky left-0 rtl:left-auto rtl:right-0 bg-[#F8F6F0] z-10">
                    {isRTL ? 'المدرب / الكود' : 'Trainer / Code'}
                  </th>
                  {permissionDefinitions.map(pDef => (
                    <th key={pDef.key} className="p-3.5 text-center whitespace-nowrap">
                      {isRTL ? pDef.labelAr : pDef.labelEn}
                    </th>
                  ))}
                  <th className="p-3.5 rounded-r-xl rtl:rounded-l-xl text-center">
                    {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTeachers.map(tea => {
                  const perms = tea.teacherPermissions || PRESETS.STANDARD;
                  return (
                    <tr key={tea.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="p-3.5 font-semibold text-[#29235D] sticky left-0 rtl:left-auto rtl:right-0 bg-white z-10 shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={tea.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                            alt={tea.name}
                            className="w-8 h-8 rounded-lg object-cover border border-[#D3B673]"
                          />
                          <div>
                            <div className="font-bold">{isRTL ? tea.nameArabic || tea.name : tea.name}</div>
                            <span className="font-mono text-[10px] text-[#D3B673]">{tea.code}</span>
                          </div>
                        </div>
                      </td>

                      {permissionDefinitions.map(pDef => {
                        const isGranted = !!perms[pDef.key];
                        return (
                          <td key={pDef.key} className="p-3.5 text-center">
                            <button
                              onClick={() => {
                                updateTeacherPermissions(tea.id, {
                                  [pDef.key]: !isGranted,
                                });
                                showToast(
                                  isRTL
                                    ? `تم ${!isGranted ? 'تفعيل' : 'إلغاء'} صلاحية (${pDef.labelAr}) للمدرب ${tea.name}`
                                    : `Updated permission for ${tea.name}`
                                );
                              }}
                              className={`w-9 h-9 rounded-xl inline-flex items-center justify-center transition-all cursor-pointer ${
                                isGranted
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 shadow-xs'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                              title={
                                isGranted
                                  ? isRTL ? 'مفعلة — انقر للتعطيل' : 'Granted — Click to revoke'
                                  : isRTL ? 'معطلة — انقر للتفعيل' : 'Denied — Click to grant'
                              }
                            >
                              {isGranted ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                          </td>
                        );
                      })}

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              updateTeacherPermissions(tea.id, PRESETS.FULL);
                              showToast(isRTL ? `تم منح كافة الصلاحيات للمدرب ${tea.name}` : `Granted all permissions to ${tea.name}`);
                            }}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-[10px] cursor-pointer"
                          >
                            {isRTL ? 'الكل ✓' : 'All'}
                          </button>
                          <button
                            onClick={() => {
                              updateTeacherPermissions(tea.id, PRESETS.ASSISTANT);
                              showToast(isRTL ? `تم تقييد صلاحيات المدرب ${tea.name}` : `Restricted permissions for ${tea.name}`);
                            }}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded text-[10px] cursor-pointer"
                          >
                            {isRTL ? 'تقييد ✗' : 'Restrict'}
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

      {/* 4. MODAL: Customize Permissions for Specific Teacher */}
      {selectedTeacherForPermissions && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 border border-[#29235D]/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#29235D] text-[#D3B673] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#29235D] font-serif">
                    {isRTL
                      ? `تخصيص الصلاحيات الفردية: ${selectedTeacherForPermissions.nameArabic || selectedTeacherForPermissions.name}`
                      : `Customize Permissions: ${selectedTeacherForPermissions.name}`}
                  </h3>
                  <span className="font-mono text-xs text-[#D3B673] font-bold">
                    {selectedTeacherForPermissions.code}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeacherForPermissions(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets Buttons */}
            <div className="bg-[#F8F6F0] p-3 rounded-2xl border border-gray-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#29235D] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D3B673]" />
                {isRTL ? 'نماذج الصلاحيات الجاهزة:' : 'Quick Presets:'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateTeacherPermissions(selectedTeacherForPermissions.id, PRESETS.FULL);
                    setSelectedTeacherForPermissions(prev => prev ? { ...prev, teacherPermissions: PRESETS.FULL } : null);
                    showToast(isRTL ? 'تم تطبيق صلاحيات كاملة' : 'Full access preset applied');
                  }}
                  className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isRTL ? 'صلاحيات كاملة' : 'Full Access'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateTeacherPermissions(selectedTeacherForPermissions.id, PRESETS.STANDARD);
                    setSelectedTeacherForPermissions(prev => prev ? { ...prev, teacherPermissions: PRESETS.STANDARD } : null);
                    showToast(isRTL ? 'تم تطبيق صلاحيات قياسية' : 'Standard preset applied');
                  }}
                  className="px-3 py-1 bg-[#29235D] hover:bg-[#1E1945] text-[#D3B673] rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isRTL ? 'مدرب قياسي' : 'Standard Trainer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateTeacherPermissions(selectedTeacherForPermissions.id, PRESETS.ASSISTANT);
                    setSelectedTeacherForPermissions(prev => prev ? { ...prev, teacherPermissions: PRESETS.ASSISTANT } : null);
                    showToast(isRTL ? 'تم تطبيق صلاحيات مساعد' : 'Assistant preset applied');
                  }}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isRTL ? 'مدرب مساعد' : 'Assistant'}
                </button>
              </div>
            </div>

            {/* Granular switches list */}
            <div className="space-y-3">
              {permissionDefinitions.map(pDef => {
                const currentPerms = selectedTeacherForPermissions.teacherPermissions || PRESETS.STANDARD;
                const isEnabled = !!currentPerms[pDef.key];
                const Icon = pDef.icon;

                return (
                  <div
                    key={pDef.key}
                    onClick={() => {
                      const updated = { ...currentPerms, [pDef.key]: !isEnabled };
                      updateTeacherPermissions(selectedTeacherForPermissions.id, { [pDef.key]: !isEnabled });
                      setSelectedTeacherForPermissions(prev => prev ? { ...prev, teacherPermissions: updated } : null);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                      isEnabled
                        ? 'bg-emerald-50/40 border-emerald-300'
                        : 'bg-gray-50 border-gray-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#29235D]">
                          {isRTL ? pDef.labelAr : pDef.labelEn}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {isRTL ? pDef.descAr : pDef.descEn}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-12 h-6 rounded-full p-1 transition-colors relative flex-shrink-0 ${
                        isEnabled ? 'bg-emerald-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          isEnabled ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedTeacherForPermissions(null)}
                className="px-6 py-2.5 bg-[#29235D] text-[#D3B673] font-bold rounded-xl text-xs hover:bg-[#1E1945] cursor-pointer"
              >
                {isRTL ? 'حفظ وإغلاق' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: Assign Programs to Teacher */}
      {selectedTeacherForPrograms && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#29235D]/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#D3B673]" />
                <h3 className="text-base font-bold text-[#29235D] font-serif">
                  {isRTL ? 'إسناد البرامج التدريبية للمدرب' : 'Assign Programs to Trainer'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTeacherForPrograms(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              {isRTL
                ? `حدد البرامج والدورات التي يحق للمدرب (${selectedTeacherForPrograms.name}) تدريسها وإدارتها:`
                : `Select the courses this trainer is authorized to teach:`}
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {programs.map(prg => {
                const isAssigned = (selectedTeacherForPrograms.assignedProgramIds || []).includes(prg.id);
                return (
                  <label
                    key={prg.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isAssigned ? 'bg-[#FBF9F4] border-[#D3B673]' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#29235D] font-serif">
                          {isRTL ? prg.nameArabic : prg.name}
                        </span>
                        <span className="font-mono text-[9px] bg-[#29235D] text-[#D3B673] px-1.5 py-0.5 rounded">
                          {prg.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{prg.category} • {prg.level}</p>
                    </div>

                    <input
                      type="checkbox"
                      checked={isAssigned}
                      onChange={e => {
                        const current = selectedTeacherForPrograms.assignedProgramIds || [];
                        const next = e.target.checked
                          ? [...current, prg.id]
                          : current.filter(id => id !== prg.id);
                        assignTeacherPrograms(selectedTeacherForPrograms.id, next);
                        setSelectedTeacherForPrograms(prev => prev ? { ...prev, assignedProgramIds: next } : null);
                      }}
                      className="w-5 h-5 text-[#29235D] rounded accent-[#29235D] cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTeacherForPrograms(null)}
                className="px-5 py-2 bg-[#29235D] text-[#D3B673] font-bold rounded-xl text-xs hover:bg-[#1E1945]"
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: Add New Teacher (Super Admin creation) */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 border border-[#29235D]/20 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#D3B673]" />
                <h3 className="text-base font-bold text-[#29235D] font-serif">
                  {isRTL ? 'إضافة مدرب / معلم جديد وتحديد صلاحياته' : 'Add New Trainer & Set Permissions'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddTeacherModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTeacherSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'الاسم بالإنجليزية' : 'Full Name (English)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeaName}
                    onChange={e => setNewTeaName(e.target.value)}
                    placeholder="e.g. Dr. Yusuf Al-Ghamdi"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'الاسم بالعربية' : 'Full Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={newTeaNameAr}
                    onChange={e => setNewTeaNameAr(e.target.value)}
                    placeholder="د. يوسف الغامدي"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-arabic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'التخصص بالإنجليزية' : 'Specialization (English)'}
                  </label>
                  <input
                    type="text"
                    value={newTeaSpec}
                    onChange={e => setNewTeaSpec(e.target.value)}
                    placeholder="Classical Arabic & Tajweed Expert"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'التخصص بالعربية' : 'Specialization (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={newTeaSpecAr}
                    onChange={e => setNewTeaSpecAr(e.target.value)}
                    placeholder="خبير اللغة العربية والتجويد"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-arabic"
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
                    value={newTeaEmail}
                    onChange={e => setNewTeaEmail(e.target.value)}
                    placeholder="trainer@aitec-edu.com"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}
                  </label>
                  <input
                    type="tel"
                    value={newTeaPhone}
                    onChange={e => setNewTeaPhone(e.target.value)}
                    placeholder="+966 50 123 4567"
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Initial Permissions Template */}
              <div className="bg-[#F8F6F0] p-3 rounded-2xl border border-gray-200 space-y-2">
                <label className="block font-bold text-[#29235D]">
                  {isRTL ? 'حزمة الصلاحيات الأولية للمدرب:' : 'Initial Permissions Package:'}
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTeaPermissions(PRESETS.STANDARD)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                      newTeaPermissions === PRESETS.STANDARD
                        ? 'bg-[#29235D] text-[#D3B673]'
                        : 'bg-white border text-gray-600'
                    }`}
                  >
                    {isRTL ? 'مدرب قياسي (موصى به)' : 'Standard Trainer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTeaPermissions(PRESETS.FULL)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                      newTeaPermissions === PRESETS.FULL
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border text-gray-600'
                    }`}
                  >
                    {isRTL ? 'صلاحيات كاملة' : 'Full Privileges'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTeaPermissions(PRESETS.ASSISTANT)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                      newTeaPermissions === PRESETS.ASSISTANT
                        ? 'bg-gray-700 text-white'
                        : 'bg-white border text-gray-600'
                    }`}
                  >
                    {isRTL ? 'مساعد مدرب' : 'Assistant'}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 text-gray-500 font-bold"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#29235D] text-[#D3B673] font-bold rounded-xl hover:bg-[#1E1945] cursor-pointer shadow-md"
                >
                  {isRTL ? 'إضافة المدرب وتوليد الكود' : 'Add Trainer & Generate Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: Edit Teacher Details */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#29235D]/20 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#D3B673]" />
                <h3 className="text-base font-bold text-[#29235D] font-serif">
                  {isRTL ? 'تعديل بيانات المدرب' : 'Edit Trainer Details'}
                </h3>
              </div>
              <button
                onClick={() => setEditingTeacher(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditTeacherSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'الاسم (English)' : 'Name (English)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTeacher.name}
                    onChange={e => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={editingTeacher.nameArabic || ''}
                    onChange={e => setEditingTeacher({ ...editingTeacher, nameArabic: e.target.value })}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-arabic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'التخصص (English)' : 'Specialization (English)'}
                  </label>
                  <input
                    type="text"
                    value={editingTeacher.specialization}
                    onChange={e => setEditingTeacher({ ...editingTeacher, specialization: e.target.value })}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">
                    {isRTL ? 'التخصص (عربي)' : 'Specialization (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={editingTeacher.specializationArabic || ''}
                    onChange={e => setEditingTeacher({ ...editingTeacher, specializationArabic: e.target.value })}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-arabic"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">Email</label>
                  <input
                    type="email"
                    value={editingTeacher.email || ''}
                    onChange={e => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">Phone</label>
                  <input
                    type="tel"
                    value={editingTeacher.phone || ''}
                    onChange={e => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 text-gray-500 font-bold"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#29235D] text-[#D3B673] font-bold rounded-xl hover:bg-[#1E1945]"
                >
                  {isRTL ? 'حفظ التعديلات' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: Delete Teacher Confirmation */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-red-200 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-[#29235D] font-serif">
              {isRTL ? 'تأكيد حذف المدرب' : 'Confirm Teacher Deletion'}
            </h3>

            <p className="text-xs text-gray-600">
              {isRTL
                ? `هل أنت متأكد من رغبتك في حذف المدرب (${teacherToDelete.name}) نهائياً من هيئة التدريس؟`
                : `Are you sure you want to remove ${teacherToDelete.name} permanently from the faculty roster?`}
            </p>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteTeacherConfirm}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md"
              >
                {isRTL ? 'نعم، حذف المدرب' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 9. MODAL: Edit User Avatar */}
      <UserAvatarEditModal
        user={avatarModalUser}
        isOpen={!!avatarModalUser}
        onClose={() => setAvatarModalUser(null)}
      />

      {/* 10. MODAL: Teacher Timetable Management */}
      {selectedTeacherForTimetable && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl border border-[#29235D]/20 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img
                  src={selectedTeacherForTimetable.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                  alt={selectedTeacherForTimetable.name}
                  className="w-10 h-10 rounded-xl object-cover border border-[#D3B673]"
                />
                <div>
                  <h3 className="text-base font-bold text-[#29235D] font-serif">
                    {isRTL ? `جدول مواعيد المدرب: ${selectedTeacherForTimetable.nameArabic || selectedTeacherForTimetable.name}` : `Timetable: ${selectedTeacherForTimetable.name}`}
                  </h3>
                  <span className="text-xs text-gray-500 font-mono">{selectedTeacherForTimetable.code}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeacherForTimetable(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <PlatformTimetableCalendar
              teacher={selectedTeacherForTimetable}
            />

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                onClick={() => setSelectedTeacherForTimetable(null)}
                className="px-5 py-2 bg-[#29235D] text-[#D3B673] font-bold rounded-xl text-xs hover:bg-[#1D1845] cursor-pointer"
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
