import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { AttendanceStatus } from '../../types';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { attendance, students, teachers, programs, currentUser } = useApp();
  const { t, isRTL } = useI18n();

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter attendance records by user role
  const userAttendance = attendance.filter(rec => {
    if (currentUser?.role === 'STUDENT') {
      return rec.studentId === currentUser.id;
    }
    if (currentUser?.role === 'TEACHER') {
      return rec.teacherId === currentUser.id;
    }
    return true; // Admin
  });

  const filteredAttendance = userAttendance.filter(rec => {
    const student = students.find(s => s.id === rec.studentId);
    const teacher = teachers.find(t => t.id === rec.teacherId);
    const matchSearch =
      (student && student.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (teacher && teacher.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      rec.date.includes(searchQuery);
    const matchStatus = selectedStatus === 'ALL' || rec.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const presentCount = userAttendance.filter(a => a.status === 'PRESENT').length;
  const lateCount = userAttendance.filter(a => a.status === 'LATE').length;
  const excusedCount = userAttendance.filter(a => a.status === 'EXCUSED').length;
  const absentCount = userAttendance.filter(a => a.status === 'ABSENT').length;
  const total = userAttendance.length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 100;

  const exportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Date,Student,Teacher,Status,Notes']
        .concat(
          filteredAttendance.map(a => {
            const s = students.find(std => std.id === a.studentId)?.name || a.studentId;
            const tName = teachers.find(tea => tea.id === a.teacherId)?.name || a.teacherId;
            return `"${a.date}","${s}","${tName}","${a.status}","${a.notes || ''}"`;
          })
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AITEC_Attendance_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#29235D] to-[#1D1845] rounded-3xl p-6 sm:p-8 text-white border border-[#D3B673]/30 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D3B673]/20 text-[#E8D5A3] border border-[#D3B673]/40 mb-3">
              <ClipboardCheck className="w-4 h-4 text-[#D3B673]" />
              Official Attendance Record & Metrics
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-wide">
              {t('attendance')}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-2xl leading-relaxed">
              Verify class participation history, absence logs, punctuality metrics, and download audit sheets.
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-2xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold text-xs flex items-center gap-2 transition-all shadow-md flex-shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Metric Breakdown Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-[#29235D]/10 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-500">Overall Rate</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-[#29235D] font-serif">{attendanceRate}%</span>
            <span className="text-[10px] font-bold text-emerald-600">Verified</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#29235D]/10 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-500">Present Sessions</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-700 font-serif">{presentCount}</span>
            <span className="text-[10px] font-bold text-emerald-600">On Time</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#29235D]/10 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-500">Late Arrivals</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-700 font-serif">{lateCount}</span>
            <span className="text-[10px] font-bold text-amber-600">Recorded</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#29235D]/10 shadow-xs">
          <p className="text-[11px] font-semibold text-gray-500">Excused Leaves</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-700 font-serif">{excusedCount}</span>
            <span className="text-[10px] font-bold text-blue-600">Approved</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-[#29235D]/10 shadow-xs col-span-2 lg:col-span-1">
          <p className="text-[11px] font-semibold text-gray-500">Unexcused Absences</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-red-700 font-serif">{absentCount}</span>
            <span className="text-[10px] font-bold text-red-600">Missed</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#29235D]/10 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search student, teacher, or date..."
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 bg-[#FBF9F4] border border-gray-200 rounded-xl text-xs text-[#29235D] focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'PRESENT', 'LATE', 'EXCUSED', 'ABSENT'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStatus === st
                  ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                  : 'bg-[#F8F6F0] text-[#786F9A] hover:bg-[#F1ECE1]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#29235D]/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-[#F8F6F0] text-[#786F9A] uppercase tracking-wider font-bold">
              <tr>
                <th className="p-3.5 rounded-l-2xl rtl:rounded-r-2xl">Date</th>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Teacher</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5 rounded-r-2xl rtl:rounded-l-2xl">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredAttendance.map(rec => {
                const std = students.find(s => s.id === rec.studentId);
                const tea = teachers.find(t => t.id === rec.teacherId);
                return (
                  <tr key={rec.id} className="hover:bg-gray-50/70">
                    <td className="p-3.5 font-mono text-[#29235D] font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#D3B673]" />
                      {rec.date}
                    </td>
                    <td className="p-3.5 font-bold text-[#29235D]">
                      {std ? std.name : rec.studentId}
                      {std && <span className="block text-[10px] font-mono text-gray-400 font-normal">{std.code}</span>}
                    </td>
                    <td className="p-3.5 text-gray-700">
                      {tea ? tea.name : rec.teacherId}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          rec.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'LATE'
                            ? 'bg-amber-100 text-amber-800'
                            : rec.status === 'EXCUSED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {rec.status === 'PRESENT' && <CheckCircle className="w-3 h-3" />}
                        {rec.status === 'LATE' && <Clock className="w-3 h-3" />}
                        {rec.status === 'EXCUSED' && <AlertTriangle className="w-3 h-3" />}
                        {rec.status === 'ABSENT' && <XCircle className="w-3 h-3" />}
                        <span>{rec.status}</span>
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-gray-400">
                      {rec.markedAt}
                    </td>
                    <td className="p-3.5 text-gray-500">
                      {rec.notes || 'Routine check'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
