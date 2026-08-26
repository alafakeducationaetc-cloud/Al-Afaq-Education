import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { ClassSession } from '../../types';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Search,
  ExternalLink,
  Users,
  CheckCircle,
  AlertCircle,
  Copy,
  Presentation,
} from 'lucide-react';

interface ClassScheduleViewProps {
  onNavigateTab: (tab: string) => void;
}

export const ClassScheduleView: React.FC<ClassScheduleViewProps> = ({ onNavigateTab }) => {
  const { classes, teachers, students, programs, addClassSession, currentUser, hasTeacherPermission } = useApp();
  const { t, isRTL } = useI18n();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Class Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTitleAr, setNewTitleAr] = useState('');
  const [newProgramId, setNewProgramId] = useState(programs[0]?.id || '');
  const [newTeacherId, setNewTeacherId] = useState(teachers[0]?.id || '');
  const [newDate, setNewDate] = useState('2026-09-02');
  const [newStartTime, setNewStartTime] = useState('16:00');
  const [newEndTime, setNewEndTime] = useState('17:00');
  const [newZoomUrl, setNewZoomUrl] = useState('https://zoom.us/j/9876543210');
  const [newTopic, setNewTopic] = useState('');

  const canSchedule = hasTeacherPermission('canScheduleClasses');
  const canWhiteboard = hasTeacherPermission('canAccessWhiteboard');

  const isTeacherOrAdmin =
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'TEACHER';

  // Filter classes based on role
  const userClasses = classes.filter(cls => {
    if (currentUser?.role === 'STUDENT') {
      return cls.studentIds.includes(currentUser.id);
    }
    if (currentUser?.role === 'TEACHER') {
      return cls.teacherId === currentUser.id;
    }
    return true; // Admin sees all
  });

  const filteredClasses = userClasses.filter(cls => {
    const matchesSearch =
      cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.titleArabic && cls.titleArabic.includes(searchQuery)) ||
      (cls.topic && cls.topic.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = selectedStatus === 'ALL' || cls.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    // Pick enrolled students in that program
    const programStudents = students.filter(s => s.enrolledProgramIds.includes(newProgramId)).map(s => s.id);

    addClassSession({
      programId: newProgramId,
      teacherId: newTeacherId,
      studentIds: programStudents.length > 0 ? programStudents : [students[0]?.id || 'usr-std-1'],
      title: newTitle,
      titleArabic: newTitleAr,
      topic: newTopic,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      zoomUrl: newZoomUrl,
      zoomMeetingId: '987 654 3210',
      zoomPassword: 'ALTEQ2026',
      status: 'SCHEDULED',
    });

    setShowAddClassModal(false);
    setNewTitle('');
    setNewTitleAr('');
    setNewTopic('');
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#29235D] to-[#1D1845] rounded-3xl p-6 sm:p-8 text-white border border-[#D3B673]/30 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D3B673]/20 text-[#E8D5A3] border border-[#D3B673]/40 mb-3">
              <Calendar className="w-4 h-4 text-[#D3B673]" />
              Live Virtual Classrooms & Zoom Schedule
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-wide">
              {t('classes')}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-2xl leading-relaxed">
              Real-time schedule of upcoming interactive classes, Zoom meeting credentials, curriculum topics, and classroom links.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canWhiteboard && (
              <button
                onClick={() => onNavigateTab('whiteboard')}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-[#E8D5A3] font-bold text-xs flex items-center gap-2 border border-[#D3B673]/40 transition-all cursor-pointer"
              >
                <Presentation className="w-4 h-4 text-[#D3B673]" />
                <span>{t('openWhiteboard')}</span>
              </button>
            )}

            {isTeacherOrAdmin && (
              canSchedule ? (
                <button
                  onClick={() => setShowAddClassModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isRTL ? 'جدولة حصة جديدة' : 'Schedule New Class'}</span>
                </button>
              ) : (
                <div
                  className="px-4 py-2.5 rounded-2xl bg-white/10 text-white/50 font-semibold text-xs border border-white/20 opacity-70 cursor-not-allowed"
                  title={isRTL ? 'صلاحية جدولة الحصص مقيدة من المشرف العام' : 'Class scheduling restricted by supervisor'}
                >
                  <span>{isRTL ? 'جدولة الحصص مقيّدة' : 'Scheduling Restricted'}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#29235D]/10 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search class title, topic, or date..."
            className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 bg-[#FBF9F4] border border-gray-200 rounded-xl text-xs text-[#29235D] focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].map(st => (
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

      {/* Classes Grid */}
      <div className="space-y-4">
        {filteredClasses.map(cls => {
          const teacher = teachers.find(t => t.id === cls.teacherId);
          const program = programs.find(p => p.id === cls.programId);
          return (
            <div
              key={cls.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-[#29235D]/10 hover:border-[#D3B673] shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      cls.status === 'SCHEDULED'
                        ? 'bg-blue-100 text-blue-800'
                        : cls.status === 'LIVE'
                        ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {cls.status}
                  </span>

                  <span className="text-xs font-mono font-bold text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#D3B673]" />
                    {cls.date}
                  </span>

                  <span className="text-xs font-mono font-bold text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#D3B673]" />
                    {cls.startTime} - {cls.endTime}
                  </span>

                  {program && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F8F6F0] text-[#29235D]">
                      {program.name}
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#29235D] font-serif">
                  {isRTL ? cls.titleArabic || cls.title : cls.title}
                </h3>

                {cls.topic && (
                  <p className="text-xs text-gray-600">
                    <strong className="text-[#29235D]">Topic:</strong> {cls.topic}
                  </p>
                )}

                {/* Teacher and Student Count */}
                <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                  {teacher && (
                    <div className="flex items-center gap-1.5">
                      <img
                        src={teacher.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                        alt={teacher.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-semibold text-[#29235D]">{teacher.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span>{cls.studentIds.length} Enrolled Students</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Join Zoom Class & Copy Credentials */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
                {cls.zoomMeetingId && (
                  <button
                    onClick={() => copyToClipboard(`Meeting ID: ${cls.zoomMeetingId}\nPasscode: ${cls.zoomPassword || 'ALTEQ2026'}`, cls.id)}
                    className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    title="Copy Meeting ID & Passcode"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedId === cls.id ? 'Copied!' : 'Credentials'}</span>
                  </button>
                )}

                <a
                  href={cls.zoomUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs border border-[#D3B673]/30"
                >
                  <Video className="w-4 h-4" />
                  <span>{t('joinZoomClass')}</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule New Class Modal */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 border border-[#29235D]/20 shadow-2xl">
            <h3 className="text-base font-bold text-[#29235D] font-serif">
              Schedule Live Virtual Classroom Session
            </h3>
            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#29235D] mb-1">Class Title (English)</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Session 4: Arabic Greetings & Dialogues"
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-[#29235D] mb-1">Class Title (Arabic)</label>
                <input
                  type="text"
                  value={newTitleAr}
                  onChange={e => setNewTitleAr(e.target.value)}
                  placeholder="الدرس الرابع: المحادثات والتحيات العربية"
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-arabic"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">Program</label>
                  <select
                    value={newProgramId}
                    onChange={e => setNewProgramId(e.target.value)}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                  >
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">Assign Teacher</label>
                  <select
                    value={newTeacherId}
                    onChange={e => setNewTeacherId(e.target.value)}
                    className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full p-2 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={e => setNewStartTime(e.target.value)}
                    className="w-full p-2 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29235D] mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={e => setNewEndTime(e.target.value)}
                    className="w-full p-2 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-[#29235D] mb-1">Zoom Meeting URL</label>
                <input
                  type="text"
                  value={newZoomUrl}
                  onChange={e => setNewZoomUrl(e.target.value)}
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl font-mono text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-[#29235D] mb-1">Lesson Topic & Notes</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  placeholder="e.g. Practicing conversational greetings and vocal intonation"
                  className="w-full p-2.5 bg-[#FBF9F4] border border-gray-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddClassModal(false)}
                  className="px-4 py-2 text-gray-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#29235D] text-[#D3B673] font-bold rounded-xl"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
