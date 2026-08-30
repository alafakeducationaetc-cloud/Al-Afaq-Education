import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { TeacherProfile, AttendanceStatus } from '../../types';
import { TeacherWeeklyAvailabilityCalendar } from './TeacherWeeklyAvailabilityCalendar';
import {
  BookOpen,
  Users,
  Calendar,
  Presentation,
  Gamepad2,
  Video,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Plus,
  ClipboardCheck,
  UserCheck,
  ShieldCheck,
  Lock,
  Check,
} from 'lucide-react';

interface TeacherDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigateTab }) => {
  const { currentUser, students, programs, classes, attendance, markAttendance, hasTeacherPermission, getStudentQuota, rechargeStudentSessions } = useApp();
  const { t, isRTL } = useI18n();

  const teacher = currentUser as TeacherProfile;
  if (!teacher) return null;

  // Granular permissions
  const perms = teacher.teacherPermissions || {
    canCreateLessons: true,
    canCreateActivities: true,
    canManageAttendance: true,
    canScheduleClasses: true,
    canViewAllReports: false,
    canIssueCertificates: true,
    canAccessWhiteboard: true,
    canEditCurriculum: false,
  };

  // Selected session for attendance quick-modal
  const [activeAttendanceSession, setActiveAttendanceSession] = useState<string | null>(null);

  // Filter teacher's programs and students
  const teacherPrograms = programs.filter(p => (teacher.assignedProgramIds || []).includes(p.id) || p.assignedTeacherIds.includes(teacher.id));
  const teacherStudents = students.filter(s => (teacher.assignedStudentIds || []).includes(s.id) || s.assignedTeacherIds.includes(teacher.id));
  const teacherClasses = classes.filter(c => c.teacherId === teacher.id);
  const upcomingClass = teacherClasses.find(c => c.status === 'SCHEDULED');

  const handleQuickAttendance = (sessionId: string, studentId: string, status: AttendanceStatus) => {
    if (!perms.canManageAttendance) {
      alert(isRTL ? 'صلاحية رصد الحضور والغياب مقيدة من قِبل المشرف العام' : 'Attendance logging is restricted by the General Supervisor');
      return;
    }
    const session = classes.find(c => c.id === sessionId);
    if (!session) return;
    markAttendance({
      sessionId,
      studentId,
      teacherId: teacher.id,
      programId: session.programId,
      date: session.date,
      status,
      notes: `Marked by ${teacher.name}`,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Teacher Welcome & Profile Banner */}
      <div className="bg-gradient-to-r from-[#29235D] via-[#1D1845] to-[#29235D] rounded-3xl p-6 sm:p-8 text-white border border-[#D3B673]/30 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-[#D3B673]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={teacher.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
              alt={teacher.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#D3B673] shadow-md flex-shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D3B673]/20 text-[#E8D5A3] border border-[#D3B673]/40 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#D3B673]" />
                  {isRTL ? 'بوابة المدرب المعتمد' : 'Certified Trainer Portal'}
                </span>
                <span className="font-mono text-xs text-white/80 font-bold px-2 py-0.5 rounded bg-black/30">
                  {teacher.code}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-wide">
                {isRTL ? teacher.nameArabic || teacher.name : teacher.name}
              </h1>

              <p className="text-xs sm:text-sm text-[#E8D5A3] font-medium max-w-xl">
                {isRTL ? teacher.specializationArabic || teacher.specialization : teacher.specialization}
              </p>
            </div>
          </div>

          {/* Quick Teaching Actions with Granular Permission Guards */}
          <div className="flex flex-wrap items-center gap-2.5">
            {perms.canAccessWhiteboard ? (
              <button
                onClick={() => onNavigateTab('whiteboard')}
                className="px-4 py-2.5 rounded-2xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Presentation className="w-4 h-4" />
                <span>{t('openWhiteboard')}</span>
              </button>
            ) : (
              <div
                className="px-4 py-2.5 rounded-2xl bg-white/5 text-gray-400 text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/10 cursor-not-allowed opacity-60"
                title={isRTL ? 'صلاحية السبورة مقيدة من المشرف العام' : 'Whiteboard restricted by General Supervisor'}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t('openWhiteboard')}</span>
              </div>
            )}

            {perms.canCreateLessons ? (
              <button
                onClick={() => onNavigateTab('lessons')}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-[#E8D5A3] font-bold text-xs sm:text-sm flex items-center gap-2 border border-[#D3B673]/40 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#D3B673]" />
                <span>{isRTL ? 'صانع الدروس' : 'Lesson Builder'}</span>
              </button>
            ) : (
              <div
                className="px-4 py-2.5 rounded-2xl bg-white/5 text-gray-400 text-xs sm:text-sm font-semibold flex items-center gap-2 border border-white/10 cursor-not-allowed opacity-60"
                title={isRTL ? 'صلاحية بناء الدروس مقيدة من المشرف العام' : 'Lesson builder restricted by General Supervisor'}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isRTL ? 'صانع الدروس' : 'Lesson Builder'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Supervisor Authorization & Active Permissions Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#29235D]/10 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D3B673]" />
            <h3 className="text-sm font-bold text-[#29235D] font-serif">
              {isRTL ? 'صلاحياتي المعتمدة من قِبل المشرف العام' : 'Active Privileges Assigned by General Supervisor'}
            </h3>
          </div>
          <span className="text-[11px] text-[#786F9A]">
            {isRTL ? 'تُحدد وتُعدل هذه الصلاحيات من قِبل الإدارة العامة' : 'Configured individually by Academic Supervision'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { key: 'canCreateLessons', label: isRTL ? 'إنشاء الدروس' : 'Create Lessons', active: perms.canCreateLessons },
            { key: 'canCreateActivities', label: isRTL ? 'بناء الألعاب' : 'Build Games', active: perms.canCreateActivities },
            { key: 'canManageAttendance', label: isRTL ? 'رصد الحضور' : 'Take Attendance', active: perms.canManageAttendance },
            { key: 'canScheduleClasses', label: isRTL ? 'جدولة الحصص' : 'Schedule Classes', active: perms.canScheduleClasses },
            { key: 'canAccessWhiteboard', label: isRTL ? 'السبورة التفاعلية' : 'Whiteboard', active: perms.canAccessWhiteboard },
            { key: 'canIssueCertificates', label: isRTL ? 'اعتماد الشهادات' : 'Certificates', active: perms.canIssueCertificates },
            { key: 'canViewAllReports', label: isRTL ? 'تقارير المنصة' : 'Global Reports', active: perms.canViewAllReports },
            { key: 'canEditCurriculum', label: isRTL ? 'تعديل المناهج' : 'Edit Curriculum', active: perms.canEditCurriculum },
          ].map(item => (
            <div
              key={item.key}
              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                item.active
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-semibold'
                  : 'bg-gray-50 border-gray-200 text-gray-400 line-through opacity-75'
              }`}
            >
              <span>{item.label}</span>
              {item.active ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Key Stats: Assigned Students + Active Programs + Rating */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-3xl p-5 border border-[#29235D]/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F8F6F0] border border-[#D3B673]/40 flex items-center justify-center text-[#29235D]">
            <Users className="w-6 h-6 text-[#D3B673]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Active Students</p>
            <h3 className="text-2xl font-black text-[#29235D] font-serif">
              {teacherStudents.length}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#29235D]/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F8F6F0] border border-[#D3B673]/40 flex items-center justify-center text-[#29235D]">
            <BookOpen className="w-6 h-6 text-[#D3B673]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Assigned Programs</p>
            <h3 className="text-2xl font-black text-[#29235D] font-serif">
              {teacherPrograms.length}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#29235D]/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F8F6F0] border border-[#D3B673]/40 flex items-center justify-center text-[#29235D]">
            <Calendar className="w-6 h-6 text-[#D3B673]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Scheduled Sessions</p>
            <h3 className="text-2xl font-black text-[#29235D] font-serif">
              {teacherClasses.length}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#29235D]/10 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F8F6F0] border border-[#D3B673]/40 flex items-center justify-center text-[#29235D]">
            <Award className="w-6 h-6 text-[#D3B673]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500">Student Rating</p>
            <h3 className="text-2xl font-black text-[#29235D] font-serif">
              ★ {teacher.rating || '4.95'}
            </h3>
          </div>
        </div>

      </div>

      {/* 3. Next Upcoming Class Live Host Card */}
      {upcomingClass && (
        <div className="bg-gradient-to-r from-[#1D1845] to-[#29235D] rounded-3xl p-6 text-white border border-[#D3B673]/40 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-[#E8D5A3] uppercase tracking-wider">
                  Upcoming Live Class to Host
                </span>
                <span className="text-[10px] font-mono bg-black/40 px-2 py-0.5 rounded text-white/80">
                  {upcomingClass.date} • {upcomingClass.startTime} - {upcomingClass.endTime}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white font-serif">
                {isRTL ? upcomingClass.titleArabic || upcomingClass.title : upcomingClass.title}
              </h3>
              <p className="text-xs text-white/80">
                Enrolled Students: {upcomingClass.studentIds.length} students • Zoom Meeting ID: {upcomingClass.zoomMeetingId || '987 654 3210'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => setActiveAttendanceSession(activeAttendanceSession === upcomingClass.id ? null : upcomingClass.id)}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-[#E8D5A3] font-bold text-xs flex items-center gap-2 border border-[#D3B673]/40 transition-all cursor-pointer"
              >
                <ClipboardCheck className="w-4 h-4 text-[#D3B673]" />
                <span>Mark Attendance</span>
              </button>

              <a
                href={upcomingClass.zoomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-2xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Start Zoom Meeting</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            </div>
          </div>

          {/* Quick Attendance Sheet Dropdown */}
          {activeAttendanceSession === upcomingClass.id && (
            <div className="mt-5 pt-4 border-t border-white/15 bg-black/20 rounded-2xl p-4 animate-in fade-in">
              <h4 className="text-xs font-bold text-[#D3B673] uppercase tracking-wider mb-3">
                Live Attendance Roll Call
              </h4>
              <div className="space-y-2">
                {upcomingClass.studentIds.map(stdId => {
                  const std = students.find(s => s.id === stdId);
                  if (!std) return null;
                  const record = attendance.find(a => a.sessionId === upcomingClass.id && a.studentId === stdId);
                  return (
                    <div
                      key={stdId}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={std.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                          alt={std.name}
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                        <div>
                          <span className="text-xs font-bold text-white">{std.name}</span>
                          <span className="text-[10px] font-mono text-gray-400 ml-2">{std.code}</span>
                        </div>
                      </div>

                      {/* Status Selector Buttons */}
                      <div className="flex items-center gap-1.5">
                        {(['PRESENT', 'LATE', 'EXCUSED', 'ABSENT'] as AttendanceStatus[]).map(st => (
                          <button
                            key={st}
                            onClick={() => handleQuickAttendance(upcomingClass.id, stdId, st)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              record?.status === st
                                ? st === 'PRESENT'
                                  ? 'bg-emerald-500 text-white'
                                  : st === 'ABSENT'
                                  ? 'bg-red-500 text-white'
                                  : 'bg-amber-500 text-white'
                                : 'bg-white/10 text-white/70 hover:bg-white/20'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Weekly Cairo Time Availability Calendar */}
      <TeacherWeeklyAvailabilityCalendar teacher={teacher} />

      {/* 5. Student Roster */}
      <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D3B673]" />
            <h3 className="text-base font-bold text-[#29235D] font-serif">
              My Assigned Students Roster ({teacherStudents.length})
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('students')}
            className="text-xs font-bold text-[#29235D] hover:text-[#B89955]"
          >
            Manage All Students →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teacherStudents.map(std => {
            const quota = getStudentQuota(std.id);
            const isDepleted = quota.remainingSessions <= 0 || quota.isExpired;

            return (
              <div
                key={std.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  isDepleted
                    ? 'bg-rose-50/70 border-rose-200'
                    : 'bg-[#FBF9F4] border-gray-100 hover:border-[#D3B673]/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={std.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={std.name}
                    className="w-12 h-12 rounded-xl object-cover border border-[#D3B673]"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#29235D] font-serif">{isRTL ? std.nameArabic || std.name : std.name}</h4>
                      <span className="text-[10px] font-mono text-gray-500 font-bold">{std.code}</span>
                    </div>
                    
                    {/* Quota Indicator */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      {isDepleted ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-200 text-rose-900 border border-rose-300">
                          {isRTL ? '⚠️ رصيد منتهي (0 حصة)' : '⚠️ 0 Sessions (Depleted)'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {isRTL ? `متبقي ${quota.remainingSessions} حصص` : `${quota.remainingSessions} sessions left`}
                        </span>
                      )}
                    </div>

                    {std.notes && (
                      <p className="text-[11px] text-[#786F9A] italic line-clamp-1">"{std.notes}"</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {std.status}
                  </span>
                  <button
                    onClick={() => onNavigateTab('classes')}
                    className="text-[10px] font-bold text-[#29235D] hover:text-[#D3B673] underline"
                  >
                    {isRTL ? 'جدول الحصص' : 'Schedule'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
