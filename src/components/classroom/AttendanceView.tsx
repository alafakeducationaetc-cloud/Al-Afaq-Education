import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { AttendanceStatus } from '../../types';
import { ColorKeysGuide } from '../common/ColorKeysGuide';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Download,
  Calendar,
  Sparkles,
  Plus,
  User,
  GraduationCap,
  Info,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { attendance, students, teachers, programs, currentUser, markAttendance } = useApp();
  const { t, isRTL, language } = useI18n();

  const isTeacher = currentUser?.role === 'TEACHER';
  const isStudent = currentUser?.role === 'STUDENT';
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMarkModal, setShowMarkModal] = useState(false);

  // New attendance mark form
  const [markStudentId, setMarkStudentId] = useState(students[0]?.id || '');
  const [markTeacherId, setMarkTeacherId] = useState(isTeacher ? currentUser.id : teachers[0]?.id || '');
  const [markDate, setMarkDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [markStatus, setMarkStatus] = useState<AttendanceStatus>('PRESENT');
  const [markNotes, setMarkNotes] = useState('');

  // Filter attendance records by user role
  const userAttendance = useMemo(() => {
    return attendance.filter(rec => {
      if (isStudent) {
        return rec.studentId === currentUser.id;
      }
      if (isTeacher) {
        return rec.teacherId === currentUser.id;
      }
      return true; // Admin sees all
    });
  }, [attendance, currentUser, isStudent, isTeacher]);

  const filteredAttendance = useMemo(() => {
    return userAttendance.filter(rec => {
      const student = students.find(s => s.id === rec.studentId);
      const teacher = teachers.find(t => t.id === rec.teacherId);
      
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        (student && (student.name.toLowerCase().includes(q) || (student.nameArabic && student.nameArabic.includes(q)))) ||
        (teacher && (teacher.name.toLowerCase().includes(q) || (teacher.nameArabic && teacher.nameArabic.includes(q)))) ||
        rec.date.includes(q) ||
        (rec.notes && rec.notes.toLowerCase().includes(q));

      // Map color key filter to attendance statuses
      let matchStatus = true;
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'COMPLETED' || selectedStatus === 'PRESENT') {
          matchStatus = rec.status === 'PRESENT';
        } else if (selectedStatus === 'ABSENT') {
          matchStatus = rec.status === 'ABSENT';
        } else if (selectedStatus === 'MISSED' || selectedStatus === 'LATE') {
          matchStatus = rec.status === 'LATE';
        } else if (selectedStatus === 'CANCELLED' || selectedStatus === 'EXCUSED' || selectedStatus === 'RESCHEDULED') {
          matchStatus = rec.status === 'EXCUSED';
        } else {
          matchStatus = true;
        }
      }

      return matchSearch && matchStatus;
    });
  }, [userAttendance, students, teachers, searchQuery, selectedStatus]);

  const presentCount = userAttendance.filter(a => a.status === 'PRESENT').length;
  const lateCount = userAttendance.filter(a => a.status === 'LATE').length;
  const excusedCount = userAttendance.filter(a => a.status === 'EXCUSED').length;
  const absentCount = userAttendance.filter(a => a.status === 'ABSENT').length;
  const total = userAttendance.length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 100;

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!markStudentId) return;

    const std = students.find(s => s.id === markStudentId);
    const assignedProgId = std?.enrolledProgramIds?.[0] || programs[0]?.id || '';

    markAttendance({
      sessionId: `direct-mark-${Date.now()}`,
      programId: assignedProgId,
      studentId: markStudentId,
      teacherId: markTeacherId,
      date: markDate,
      status: markStatus,
      notes: markNotes.trim() || (markStatus === 'PRESENT' ? 'حضور منتظم' : markStatus === 'ABSENT' ? 'غياب بدون عذر' : 'تسجيل إلكتروني'),
    });

    setShowMarkModal(false);
    setMarkNotes('');
  };

  const exportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      ['التاريخ,الطالب,المعلم,الحالة,التوقيت,الملاحظات']
        .concat(
          filteredAttendance.map(a => {
            const s = students.find(std => std.id === a.studentId)?.name || a.studentId;
            const tName = teachers.find(tea => tea.id === a.teacherId)?.name || a.teacherId;
            return `"${a.date}","${s}","${tName}","${a.status}","${a.markedAt}","${a.notes || ''}"`;
          })
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AFAQ_Attendance_Audit_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#29235D] via-[#1D1845] to-[#29235D] rounded-3xl p-6 sm:p-8 text-white border border-[#D3B673]/30 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-[#D3B673]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D3B673]/20 text-[#E8D5A3] border border-[#D3B673]/40 flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-[#D3B673]" />
                {isRTL ? 'سجل الحضور والغياب المطور ودليل الألوان' : 'Advanced Attendance Ledger & Color Keys'}
              </span>
              <span className="text-[10px] font-mono font-bold bg-black/40 px-2 py-0.5 rounded text-white/80">
                {attendanceRate}% {isRTL ? 'معدل الانضباط' : 'Discipline Rate'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-wide">
              {t('attendance')}
            </h1>

            <p className="text-xs sm:text-sm text-white/80 max-w-2xl leading-relaxed">
              {isRTL
                ? 'متابعة دقيقة لحالات حضور وغياب الدروس وفق نظام الألوان المعتمد. يوضح للمعلم والمتدرب دلالة كل لون وتأثيره المباشر على رصيد الحصص.'
                : 'Live attendance audit sheet with standardized color coding, discipline metrics, and quota deduction records.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {!isStudent && (
              <button
                onClick={() => setShowMarkModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isRTL ? 'رصد حضور جديد' : 'Mark Attendance'}</span>
              </button>
            )}

            <button
              onClick={exportCSV}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-[#E8D5A3] font-bold text-xs sm:text-sm flex items-center gap-2 border border-[#D3B673]/40 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#D3B673]" />
              <span>{isRTL ? 'تصدير تقرير CSV' : 'Export CSV'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Standardized Color Keys Strip & Legend Guide */}
      <ColorKeysGuide
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        showDetailsToggle={true}
        userRole={currentUser?.role as any}
      />

      {/* 3. Advanced Metric Breakdown Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Overall Discipline */}
        <div className="bg-white night:bg-[#18152E] rounded-2xl p-4 border border-[#29235D]/10 night:border-[#393168] shadow-xs">
          <p className="text-[11px] font-semibold text-gray-500 night:text-gray-400">
            {isRTL ? 'معدل الالتزام الإجمالي' : 'Overall Rate'}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#29235D] night:text-[#E8D5A3] font-serif">{attendanceRate}%</span>
            <span className="text-[10px] font-bold text-emerald-600">
              {attendanceRate >= 80 ? (isRTL ? 'ممتاز' : 'Excellent') : (isRTL ? 'مقبول' : 'Good')}
            </span>
          </div>
        </div>

        {/* Present (Green) */}
        <div className="bg-white night:bg-[#18152E] rounded-2xl p-4 border-l-4 border-l-[#15803D] border border-gray-200 night:border-[#393168] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-gray-500 night:text-gray-400">
              {isRTL ? 'حضور مكتمل (أخضر)' : 'Present & Completed'}
            </p>
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-700 night:text-emerald-400 font-serif">{presentCount}</span>
            <span className="text-[10px] font-bold text-emerald-600">{isRTL ? 'في الموعد' : 'On Time'}</span>
          </div>
        </div>

        {/* Late / Rescheduled (Yellow/Amber) */}
        <div className="bg-white night:bg-[#18152E] rounded-2xl p-4 border-l-4 border-l-amber-500 border border-gray-200 night:border-[#393168] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-gray-500 night:text-gray-400">
              {isRTL ? 'تأخير / جزئي (أصفر)' : 'Late Arrivals'}
            </p>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-700 night:text-amber-400 font-serif">{lateCount}</span>
            <span className="text-[10px] font-bold text-amber-600">{isRTL ? 'مرصود' : 'Recorded'}</span>
          </div>
        </div>

        {/* Excused / Rescheduled (Blue) */}
        <div className="bg-white night:bg-[#18152E] rounded-2xl p-4 border-l-4 border-l-[#2563EB] border border-gray-200 night:border-[#393168] shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-gray-500 night:text-gray-400">
              {isRTL ? 'معذور / مؤجل (أزرق)' : 'Excused / Postponed'}
            </p>
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-700 night:text-blue-400 font-serif">{excusedCount}</span>
            <span className="text-[10px] font-bold text-blue-600">{isRTL ? 'رصيد محفوظ' : 'Quota Safe'}</span>
          </div>
        </div>

        {/* Absent (Solid Black / Crimson) */}
        <div className="bg-white night:bg-[#18152E] rounded-2xl p-4 border-l-4 border-l-[#18181B] border border-gray-200 night:border-[#393168] shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-gray-500 night:text-gray-400">
              {isRTL ? 'غياب بدون عذر (أسود)' : 'Unexcused Absence'}
            </p>
            <span className="w-2.5 h-2.5 rounded-full bg-[#18181B]" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-zinc-900 night:text-zinc-300 font-serif">{absentCount}</span>
            <span className="text-[10px] font-bold text-rose-600">{isRTL ? 'مخصوم من الرصيد' : 'Deducted'}</span>
          </div>
        </div>

      </div>

      {/* 4. Filter and Search Bar */}
      <div className="bg-white night:bg-[#18152E] rounded-2xl p-4 border border-[#29235D]/10 night:border-[#393168] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isRTL ? 'بحث عن طالب، معلم، تاريخ، أو ملاحظة...' : 'Search student, teacher, date...'}
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 bg-[#FBF9F4] night:bg-[#131124] border border-gray-200 night:border-gray-700 rounded-xl text-xs text-[#29235D] night:text-white focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
          />
        </div>

        {/* Quick Filter Pill Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedStatus === 'ALL'
                ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                : 'bg-[#F8F6F0] night:bg-[#201C3D] text-[#786F9A] night:text-gray-300 hover:bg-[#F1ECE1]'
            }`}
          >
            {isRTL ? 'جميع السجلات' : 'All Logs'}
          </button>
          
          <button
            onClick={() => setSelectedStatus('PRESENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedStatus === 'PRESENT'
                ? 'bg-[#15803D] text-white shadow-xs'
                : 'bg-[#F8F6F0] night:bg-[#201C3D] text-[#15803D] hover:bg-[#15803D]/10'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#15803D]" />
            <span>{isRTL ? 'حضور' : 'Present'}</span>
          </button>

          <button
            onClick={() => setSelectedStatus('LATE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedStatus === 'LATE'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-[#F8F6F0] night:bg-[#201C3D] text-amber-600 hover:bg-amber-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>{isRTL ? 'متأخر' : 'Late'}</span>
          </button>

          <button
            onClick={() => setSelectedStatus('EXCUSED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedStatus === 'EXCUSED'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-[#F8F6F0] night:bg-[#201C3D] text-[#2563EB] hover:bg-blue-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
            <span>{isRTL ? 'معذور' : 'Excused'}</span>
          </button>

          <button
            onClick={() => setSelectedStatus('ABSENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedStatus === 'ABSENT'
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'bg-[#F8F6F0] night:bg-[#201C3D] text-zinc-800 night:text-zinc-200 hover:bg-zinc-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#18181B]" />
            <span>{isRTL ? 'غياب' : 'Absent'}</span>
          </button>
        </div>
      </div>

      {/* 5. Attendance Logs Table */}
      <div className="bg-white night:bg-[#18152E] rounded-3xl p-4 sm:p-6 border border-[#29235D]/10 night:border-[#393168] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-[#F8F6F0] night:bg-[#201C3D] text-[#786F9A] night:text-[#E8D5A3] uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5 rounded-l-2xl rtl:rounded-r-2xl">{isRTL ? 'التاريخ' : 'Date'}</th>
                <th className="p-3.5">{isRTL ? 'الطالب' : 'Student'}</th>
                <th className="p-3.5">{isRTL ? 'المعلم' : 'Teacher'}</th>
                <th className="p-3.5">{isRTL ? 'الحالة والشارة الملونة' : 'Status & Badge'}</th>
                <th className="p-3.5">{isRTL ? 'توقيت الرصد' : 'Timestamp'}</th>
                <th className="p-3.5 rounded-r-2xl rtl:rounded-l-2xl">{isRTL ? 'الملاحظات وتأثير الرصيد' : 'Notes & Quota Impact'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 night:divide-gray-800 font-medium">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400 night:text-gray-500">
                    <ClipboardCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="font-bold">{isRTL ? 'لا توجد سجلات حضور تطابق الفلترة' : 'No attendance logs match your filter'}</p>
                  </td>
                </tr>
              ) : (
                filteredAttendance.map(rec => {
                  const std = students.find(s => s.id === rec.studentId);
                  const tea = teachers.find(t => t.id === rec.teacherId);

                  // Color configuration based on status
                  const isPresent = rec.status === 'PRESENT';
                  const isLate = rec.status === 'LATE';
                  const isExcused = rec.status === 'EXCUSED';
                  const isAbsent = rec.status === 'ABSENT';

                  return (
                    <tr key={rec.id} className="hover:bg-gray-50/70 night:hover:bg-[#221E42] transition-colors">
                      <td className="p-3.5 font-mono text-[#29235D] night:text-white font-bold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#D3B673]" />
                        {rec.date}
                      </td>
                      <td className="p-3.5 font-bold text-[#29235D] night:text-white">
                        {std ? (isRTL ? std.nameArabic || std.name : std.name) : rec.studentId}
                        {std && <span className="block text-[10px] font-mono text-gray-400 font-normal">{std.code}</span>}
                      </td>
                      <td className="p-3.5 text-gray-700 night:text-gray-300">
                        {tea ? (isRTL ? tea.nameArabic || tea.name : tea.name) : rec.teacherId}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-xs text-white ${
                            isPresent
                              ? 'bg-[#15803D]'
                              : isLate
                              ? 'bg-amber-600'
                              : isExcused
                              ? 'bg-[#2563EB]'
                              : 'bg-[#18181B]'
                          }`}
                        >
                          {isPresent && <CheckCircle className="w-3.5 h-3.5" />}
                          {isLate && <Clock className="w-3.5 h-3.5" />}
                          {isExcused && <AlertTriangle className="w-3.5 h-3.5" />}
                          {isAbsent && <XCircle className="w-3.5 h-3.5" />}
                          <span>
                            {isPresent
                              ? (isRTL ? 'حاضر (مكتمل)' : 'Present')
                              : isLate
                              ? (isRTL ? 'متأخر' : 'Late')
                              : isExcused
                              ? (isRTL ? 'معذور (مؤجل)' : 'Excused')
                              : (isRTL ? 'غياب بدون عذر' : 'Absent')}
                          </span>
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-gray-400">
                        {rec.markedAt}
                      </td>
                      <td className="p-3.5 text-gray-600 night:text-gray-400">
                        <div className="flex items-center justify-between gap-2">
                          <span>{rec.notes || (isRTL ? 'متابعة روتينية' : 'Routine entry')}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isAbsent
                              ? 'bg-rose-100 text-rose-800 night:bg-rose-950/60 night:text-rose-300'
                              : isExcused
                              ? 'bg-blue-100 text-blue-800 night:bg-blue-950/60 night:text-blue-300'
                              : 'bg-emerald-100 text-emerald-800 night:bg-emerald-950/60 night:text-emerald-300'
                          }`}>
                            {isAbsent
                              ? (isRTL ? 'خصم 1 حصة' : '-1 Session')
                              : isExcused
                              ? (isRTL ? 'حفظ الرصيد' : 'Preserved')
                              : (isRTL ? 'تم احتسابها' : 'Counted')}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Mark Attendance Modal (For Teachers & Admins) */}
      {showMarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white night:bg-[#18152E] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#D3B673]/30 shadow-2xl space-y-5 text-[#29235D] night:text-[#E8D5A3]">
            
            <div className="flex items-center justify-between border-b border-gray-100 night:border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <ClipboardCheck className="w-6 h-6 text-[#D3B673]" />
                <h3 className="text-lg font-black font-serif">
                  {isRTL ? 'رصد حضور وغياب حصة' : 'Record Class Attendance'}
                </h3>
              </div>
              <button
                onClick={() => setShowMarkModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-100 night:bg-gray-800 text-gray-500 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAttendance} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 night:text-gray-300 mb-1">
                  {isRTL ? 'اختر الطالب *' : 'Select Student *'}
                </label>
                <select
                  value={markStudentId}
                  onChange={e => setMarkStudentId(e.target.value)}
                  className="w-full p-2.5 bg-[#F8F6F0] night:bg-[#131124] border border-gray-200 night:border-gray-700 rounded-xl font-bold"
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {isRTL ? s.nameArabic || s.name : s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              {!isTeacher && (
                <div>
                  <label className="block font-bold text-gray-700 night:text-gray-300 mb-1">
                    {isRTL ? 'المعلم المسؤول' : 'Assigned Teacher'}
                  </label>
                  <select
                    value={markTeacherId}
                    onChange={e => setMarkTeacherId(e.target.value)}
                    className="w-full p-2.5 bg-[#F8F6F0] night:bg-[#131124] border border-gray-200 night:border-gray-700 rounded-xl"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {isRTL ? t.nameArabic || t.name : t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-gray-700 night:text-gray-300 mb-1">
                  {isRTL ? 'تاريخ الحصة *' : 'Session Date *'}
                </label>
                <input
                  type="date"
                  value={markDate}
                  onChange={e => setMarkDate(e.target.value)}
                  className="w-full p-2.5 bg-[#F8F6F0] night:bg-[#131124] border border-gray-200 night:border-gray-700 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 night:text-gray-300 mb-1">
                  {isRTL ? 'حالة الحضور واللون المقترن *' : 'Attendance Status & Color *'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMarkStatus('PRESENT')}
                    className={`p-2.5 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                      markStatus === 'PRESENT'
                        ? 'bg-[#15803D] text-white border-[#15803D] shadow-sm'
                        : 'bg-[#F8F6F0] night:bg-[#201C3D] text-gray-700 night:text-gray-300'
                    }`}
                  >
                    🟢 {isRTL ? 'حاضر (مكتمل)' : 'Present'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMarkStatus('LATE')}
                    className={`p-2.5 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                      markStatus === 'LATE'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-[#F8F6F0] night:bg-[#201C3D] text-gray-700 night:text-gray-300'
                    }`}
                  >
                    🟡 {isRTL ? 'متأخر' : 'Late'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMarkStatus('EXCUSED')}
                    className={`p-2.5 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                      markStatus === 'EXCUSED'
                        ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                        : 'bg-[#F8F6F0] night:bg-[#201C3D] text-gray-700 night:text-gray-300'
                    }`}
                  >
                    🔵 {isRTL ? 'معذور (مؤجل)' : 'Excused'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMarkStatus('ABSENT')}
                    className={`p-2.5 rounded-xl border font-bold text-center transition-all cursor-pointer ${
                      markStatus === 'ABSENT'
                        ? 'bg-[#18181B] text-white border-black shadow-sm'
                        : 'bg-[#F8F6F0] night:bg-[#201C3D] text-gray-700 night:text-gray-300'
                    }`}
                  >
                    ⚫ {isRTL ? 'غياب (مخصوم)' : 'Absent'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 night:text-gray-300 mb-1">
                  {isRTL ? 'ملاحظات المعلم' : 'Teacher Notes'}
                </label>
                <input
                  type="text"
                  value={markNotes}
                  onChange={e => setMarkNotes(e.target.value)}
                  placeholder={isRTL ? 'مثال: أداء ممتاز، تم تسميع صفحة 12...' : 'e.g., Excellent recitation...'}
                  className="w-full p-2.5 bg-[#F8F6F0] night:bg-[#131124] border border-gray-200 night:border-gray-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 night:bg-gray-800 text-gray-600 font-bold"
                >
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#29235D] text-[#D3B673] font-bold shadow-md hover:bg-[#1D1845]"
                >
                  {isRTL ? 'حفظ ورصد في السجل' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
