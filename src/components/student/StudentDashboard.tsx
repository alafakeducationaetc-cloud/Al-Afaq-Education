import React from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { StudentProfile } from '../../types';
import { PlatformTimetableCalendar } from '../calendar/PlatformTimetableCalendar';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Presentation,
  Gamepad2,
  BookOpen,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Award,
  TrendingUp,
  User,
  ShieldCheck,
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigateTab }) => {
  const { currentUser, getStudentStats, classes, activities } = useApp();
  const { t, isRTL } = useI18n();

  const student = currentUser as StudentProfile;
  if (!student) return null;

  const stats = getStudentStats(student.id);
  const studentClasses = classes.filter(c => c.studentIds.includes(student.id));
  const upcomingClass = studentClasses.find(c => c.status === 'SCHEDULED');
  const pastClasses = studentClasses.filter(c => c.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      
      {/* 1. Personalized Welcome Header Banner */}
      <div className="bg-gradient-to-r from-[#29235D] via-[#1D1845] to-[#29235D] rounded-3xl p-6 sm:p-8 text-white border border-[#D3B673]/30 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-[#D3B673]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D3B673]/20 text-[#E8D5A3] border border-[#D3B673]/40 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D3B673]" />
                Student Portal
              </span>
              <span className="font-mono text-xs text-white/80 font-bold px-2 py-0.5 rounded bg-black/30">
                {student.code}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-wide">
              {t('welcomeBack')}{' '}
              <span className="text-[#E8D5A3]">
                {isRTL ? student.nameArabic || student.name : student.name}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              {stats.activeProgram
                ? isRTL
                  ? stats.activeProgram.nameArabic
                  : stats.activeProgram.name
                : 'ALTEQ Interactive Educational Programs'}
            </p>

            {stats.primaryTeacher && (
              <div className="flex items-center gap-2 pt-1">
                <img
                  src={stats.primaryTeacher.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                  alt={stats.primaryTeacher.name}
                  className="w-6 h-6 rounded-full border border-[#D3B673] object-cover"
                />
                <span className="text-xs text-[#E8D5A3] font-semibold">
                  {t('assignedTeacher')}: {isRTL ? stats.primaryTeacher.nameArabic || stats.primaryTeacher.name : stats.primaryTeacher.name}
                </span>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('whiteboard')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-[#E8D5A3] font-bold text-xs flex items-center gap-2 border border-[#D3B673]/40 transition-all shadow-xs cursor-pointer"
            >
              <Presentation className="w-4 h-4 text-[#D3B673]" />
              <span>{t('openWhiteboard')}</span>
            </button>
            <button
              onClick={() => onNavigateTab('activities')}
              className="px-4 py-2.5 rounded-2xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Play Activities</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards: Subscription Countdown + Attendance Gauge + Next Class */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Visual "Subscription Remaining" Component (Explicitly Requested) */}
        <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs hover:border-[#D3B673] transition-all relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#29235D] text-[#D3B673] flex items-center justify-center font-bold">
                📅
              </div>
              <span className="text-xs font-bold text-[#29235D] uppercase tracking-wider">
                {t('subscriptionRemaining')}
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {stats.activeSubscription?.status || 'ACTIVE'}
            </span>
          </div>

          <div className="py-4 space-y-3">
            <div>
              <p className="text-xs text-gray-500 font-medium">Enrolled Program</p>
              <p className="text-sm font-bold text-[#29235D] font-serif line-clamp-1">
                {stats.activeProgram?.name || 'Arabic & Quran Immersion'}
              </p>
            </div>

            {/* Countdown Big Metric */}
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#29235D] font-serif">
                {stats.daysRemaining}
              </span>
              <span className="text-xs font-bold text-[#B89955] uppercase tracking-wider">
                {t('daysRemaining')}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-semibold text-gray-600">
                <span>{stats.activeSubscription?.attendedSessions || 16} Sessions Completed</span>
                <span className="text-[#B89955] font-bold">
                  {stats.sessionsRemaining} remaining
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#F1EFEA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#29235D] to-[#D3B673] rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      ((stats.activeSubscription?.attendedSessions || 16) /
                        (stats.activeSubscription?.totalSessions || 24)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex justify-between text-[11px] text-gray-500">
            <span>Start: {stats.activeSubscription?.startDate || '2026-01-15'}</span>
            <span className="font-semibold text-[#29235D]">
              Expires: {stats.activeSubscription?.endDate || '2026-04-15'}
            </span>
          </div>
        </div>

        {/* Attendance Statistics Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs hover:border-[#D3B673] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#29235D] text-[#D3B673] flex items-center justify-center font-bold">
                📊
              </div>
              <span className="text-xs font-bold text-[#29235D] uppercase tracking-wider">
                {t('attendanceRate')}
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Excellent
            </span>
          </div>

          <div className="py-4 flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-4xl font-black text-[#29235D] font-serif">
                {stats.attendanceRate}%
              </div>
              <p className="text-xs text-gray-500">Live Class Attendance</p>
            </div>

            {/* Breakdown Mini List */}
            <div className="space-y-1.5 text-xs text-right rtl:text-left">
              <div className="flex items-center justify-end rtl:justify-start gap-1.5 text-emerald-700 font-semibold">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{stats.attendedCount} Attended</span>
              </div>
              <div className="flex items-center justify-end rtl:justify-start gap-1.5 text-red-600 font-semibold">
                <XCircle className="w-3.5 h-3.5" />
                <span>{stats.absentCount} Absences</span>
              </div>
              <div className="flex items-center justify-end rtl:justify-start gap-1.5 text-amber-600 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{stats.lateCount} Late</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('attendance')}
            className="pt-3 border-t border-gray-100 text-xs font-bold text-[#29235D] hover:text-[#B89955] flex items-center justify-between transition-colors"
          >
            <span>View Full Attendance History</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>

        {/* Next Class & Direct Zoom Link Card */}
        <div className="bg-gradient-to-br from-[#1D1845] to-[#29235D] text-white rounded-3xl p-6 border border-[#D3B673]/40 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-[#E8D5A3] uppercase tracking-wider">
                {t('nextClass')}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D3B673] text-[#29235D]">
              Tomorrow
            </span>
          </div>

          {upcomingClass ? (
            <div className="py-4 space-y-2">
              <h3 className="text-base font-bold text-white font-serif line-clamp-2">
                {isRTL ? upcomingClass.titleArabic || upcomingClass.title : upcomingClass.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-[#E8D5A3]">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{upcomingClass.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{upcomingClass.startTime} — {upcomingClass.endTime}</span>
                </div>
              </div>
              <p className="text-[11px] text-white/70 line-clamp-1">
                Topic: {upcomingClass.topic}
              </p>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-white/70">
              No live classes scheduled for today.
            </div>
          )}

          {upcomingClass && (
            <a
              href={upcomingClass.zoomUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>{t('joinZoomClass')}</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </a>
          )}
        </div>

      </div>

      {/* 3. Interactive Games Quick Access Banner */}
      <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#F8F6F0] text-[#29235D] border border-[#29235D]/10">
              <Gamepad2 className="w-5 h-5 text-[#D3B673]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#29235D] font-serif">
                Featured Interactive Activities & Games
              </h3>
              <p className="text-xs text-gray-500">
                Enhance your pronunciation, Tajweed rules, and vocabulary through gamified exercises.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('activities')}
            className="text-xs font-bold text-[#29235D] hover:text-[#B89955] flex items-center gap-1"
          >
            <span>All Activities ({activities.length})</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activities.slice(0, 4).map(act => (
            <div
              key={act.id}
              onClick={() => onNavigateTab('activities')}
              className="p-4 rounded-2xl bg-[#FBF9F4] border border-gray-200 hover:border-[#D3B673] transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#29235D] text-[#D3B673]">
                    {act.category}
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">{act.code}</span>
                </div>
                <h4 className="text-xs font-bold text-[#29235D] font-serif group-hover:text-[#B89955] transition-colors line-clamp-2">
                  {isRTL ? act.nameArabic || act.name : act.name}
                </h4>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-500 font-semibold">
                <span>{act.level}</span>
                <span className="text-[#B89955] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                  Play Now →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Instructor Availability Timetable (Shows Free / Busy Slots) */}
      {stats.primaryTeacher && (
        <PlatformTimetableCalendar
          teacher={stats.primaryTeacher}
          readOnly={true}
        />
      )}

      {/* 5. Upcoming & Previous Classes List */}
      <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#D3B673]" />
            <h3 className="text-base font-bold text-[#29235D] font-serif">
              Class Schedule & Zoom Sessions
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('classes')}
            className="text-xs font-bold text-[#29235D] hover:text-[#B89955]"
          >
            Full Calendar View →
          </button>
        </div>

        <div className="space-y-3">
          {studentClasses.map(cls => (
            <div
              key={cls.id}
              className="p-4 rounded-2xl border border-gray-100 bg-[#FBF9F4] hover:border-[#D3B673]/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      cls.status === 'SCHEDULED'
                        ? 'bg-blue-100 text-blue-800'
                        : cls.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {cls.status}
                  </span>
                  <span className="text-xs font-mono font-bold text-gray-500">
                    {cls.date} • {cls.startTime} - {cls.endTime}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#29235D] font-serif">
                  {isRTL ? cls.titleArabic || cls.title : cls.title}
                </h4>
                {cls.topic && (
                  <p className="text-xs text-gray-500">Topic: {cls.topic}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {cls.status === 'SCHEDULED' && (
                  <a
                    href={cls.zoomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] font-bold text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Class</span>
                  </a>
                )}
                {cls.status === 'COMPLETED' && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    ✓ Completed & Recorded
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
