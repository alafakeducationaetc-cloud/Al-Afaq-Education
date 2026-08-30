import React from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
  Gamepad2,
  Presentation,
  FileCode2,
  ShieldAlert,
  BarChart3,
  Settings,
  CreditCard,
  Video,
  UserCheck,
  FileText,
  MessageCircle,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser } = useApp();
  const { t, isRTL } = useI18n();

  const role = currentUser?.role;

  interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }

  const getStudentItems = (): NavItem[] => [
    { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'messages', label: isRTL ? 'الرسائل والمحادثات' : 'Messages & Chat', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'programs', label: t('myPrograms'), icon: <BookOpen className="w-4 h-4" /> },
    { id: 'classes', label: t('myClasses'), icon: <Calendar className="w-4 h-4" />, badge: 'Next Class' },
    { id: 'attendance', label: t('attendance'), icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'whiteboard', label: t('whiteboard'), icon: <Presentation className="w-4 h-4" /> },
    { id: 'activities', label: t('activities'), icon: <Gamepad2 className="w-4 h-4" />, badge: '4 Games' },
    { id: 'lessons', label: t('lessons'), icon: <FileText className="w-4 h-4" /> },
    { id: 'profile', label: t('profile'), icon: <UserCheck className="w-4 h-4" /> },
  ];

  const getTeacherItems = (): NavItem[] => [
    { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'messages', label: isRTL ? 'الرسائل والحلقات' : 'Messages & Circles', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'students', label: t('myStudents'), icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'programs', label: t('myPrograms'), icon: <BookOpen className="w-4 h-4" /> },
    { id: 'classes', label: t('myClasses'), icon: <Calendar className="w-4 h-4" /> },
    { id: 'attendance', label: t('attendance'), icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'whiteboard', label: t('whiteboard'), icon: <Presentation className="w-4 h-4" />, badge: 'Live Tool' },
    { id: 'activities', label: t('activities'), icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'lessons', label: t('lessons'), icon: <FileCode2 className="w-4 h-4" /> },
    { id: 'zoom', label: t('zoomMeetings'), icon: <Video className="w-4 h-4" /> },
    { id: 'profile', label: t('profile'), icon: <UserCheck className="w-4 h-4" /> },
  ];

  const getAdminItems = (): NavItem[] => [
    { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'messages', label: isRTL ? 'مراقبة المحادثات والرسائل' : 'Live Chat Monitor', icon: <MessageCircle className="w-4 h-4" />, badge: isRTL ? 'رقابة خفية' : 'Oversight' },
    { id: 'students', label: t('allStudents'), icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'teachers', label: t('allTeachers'), icon: <Users className="w-4 h-4" /> },
    { id: 'programs', label: t('programs'), icon: <BookOpen className="w-4 h-4" /> },
    { id: 'subscriptions', label: t('subscriptions'), icon: <CreditCard className="w-4 h-4" /> },
    { id: 'classes', label: t('myClasses'), icon: <Calendar className="w-4 h-4" /> },
    { id: 'attendance', label: t('attendance'), icon: <ClipboardCheck className="w-4 h-4" /> },
    { id: 'whiteboard', label: t('whiteboard'), icon: <Presentation className="w-4 h-4" /> },
    { id: 'activities', label: t('activities'), icon: <Gamepad2 className="w-4 h-4" />, badge: 'Custom Code' },
    { id: 'lessons', label: t('lessons'), icon: <FileCode2 className="w-4 h-4" /> },
    { id: 'permissions', label: t('permissions'), icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'reports', label: t('reports'), icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: t('settings'), icon: <Settings className="w-4 h-4" /> },
  ];

  const items = role === 'SUPER_ADMIN' || role === 'ADMIN'
    ? getAdminItems()
    : role === 'TEACHER'
    ? getTeacherItems()
    : getStudentItems();

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block">
      <div className="sticky top-24 bg-white/90 backdrop-blur-md border border-[#29235D]/10 rounded-2xl p-3 shadow-xs space-y-1">
        
        {/* User context card */}
        <div className="p-3 mb-2 rounded-xl bg-gradient-to-br from-[#29235D] to-[#1D1845] text-white border border-[#D3B673]/30">
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={currentUser?.name}
              className="w-10 h-10 rounded-lg object-cover border border-[#D3B673]"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#E8D5A3] line-clamp-1">
                {isRTL ? currentUser?.nameArabic || currentUser?.name : currentUser?.name}
              </p>
              <p className="text-[11px] font-mono text-white/80">{currentUser?.code}</p>
              <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 mt-0.5 rounded bg-[#D3B673] text-[#29235D]">
                {currentUser?.status || 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {items.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                    : 'text-[#29235D]/80 hover:bg-[#F8F6F0] hover:text-[#29235D]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-[#D3B673]' : 'text-[#786F9A]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[#D3B673] text-[#29235D]'
                        : 'bg-[#D3B673]/20 text-[#B89955] border border-[#D3B673]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
