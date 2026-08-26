import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { Logo } from './Logo';
import { UserAvatarEditModal } from '../admin/UserAvatarEditModal';
import {
  Bell,
  Globe,
  LogOut,
  UserCheck,
  ChevronDown,
  Sparkles,
  CheckCheck,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Camera,
  User,
  KeyRound,
  Palette,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onNavigateTab?: (tab: string) => void;
  activeTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateTab, activeTab }) => {
  const { currentUser, switchDemoUser, logout, notifications, markNotificationAsRead, students, teachers } = useApp();
  const { language, setLanguage, t, isRTL } = useI18n();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAvatarEditModal, setShowAvatarEditModal] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return {
          label: t('admin'),
          bg: 'bg-[#29235D] text-[#D3B673] border-[#D3B673]/40',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-[#D3B673]" />,
        };
      case 'TEACHER':
        return {
          label: t('teacher'),
          bg: 'bg-[#1D1845] text-[#E8D5A3] border-[#D3B673]/30',
          icon: <BookOpen className="w-3.5 h-3.5 text-[#D3B673]" />,
        };
      case 'STUDENT':
      default:
        return {
          label: t('student'),
          bg: 'bg-[#F4EFE6] text-[#29235D] border-[#D3B673]/50',
          icon: <GraduationCap className="w-3.5 h-3.5 text-[#B89955]" />,
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#29235D]/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Logo size="md" />
          </div>

          {/* Quick Demo Switcher Bar */}
          <div className="hidden lg:flex items-center bg-[#F8F6F0] p-1 rounded-xl border border-[#29235D]/10 text-xs">
            <span className="px-2.5 py-1 text-[#786F9A] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D3B673]" />
              {t('quickDemoLogin')}:
            </span>
            <button
              onClick={() => switchDemoUser('usr-std-1')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentUser?.id === 'usr-std-1'
                  ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                  : 'text-[#29235D] hover:bg-white'
              }`}
            >
              🎓 Tariq (Student)
            </button>
            <button
              onClick={() => switchDemoUser('usr-tea-1')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentUser?.id === 'usr-tea-1'
                  ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                  : 'text-[#29235D] hover:bg-white'
              }`}
            >
              📖 Sh. Ahmed (Teacher)
            </button>
            <button
              onClick={() => switchDemoUser('usr-tea-2')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentUser?.id === 'usr-tea-2'
                  ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                  : 'text-[#29235D] hover:bg-white'
              }`}
            >
              📖 Ust. Bilal (Teacher)
            </button>
            <button
              onClick={() => switchDemoUser('admin')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN'
                  ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                  : 'text-[#29235D] hover:bg-white'
              }`}
            >
              🛡️ Admin
            </button>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#29235D]/15 bg-[#F8F6F0] hover:bg-[#F1ECE1] text-[#29235D] text-xs font-bold transition-all"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#D3B673]" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl border border-[#29235D]/10 bg-white hover:bg-[#F8F6F0] text-[#29235D] transition-all"
                title={t('notifications')}
              >
                <Bell className="w-4 h-4 text-[#29235D]" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D3B673] text-[#29235D] text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className={`absolute ${
                    isRTL ? 'left-0' : 'right-0'
                  } mt-2 w-80 sm:w-96 bg-white border border-[#29235D]/15 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#D3B673]" />
                      <span className="font-bold text-[#29235D] text-sm">{t('notifications')}</span>
                    </div>
                    {unreadNotifications.length > 0 && (
                      <span className="text-[11px] font-semibold text-[#D3B673] bg-[#29235D] px-2 py-0.5 rounded-full">
                        {unreadNotifications.length} new
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-6">No notifications</p>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            notif.read
                              ? 'bg-gray-50/70 border-gray-100 text-gray-600'
                              : 'bg-[#FBF9F4] border-[#D3B673]/40 text-[#29235D] font-medium'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-[#29235D]">
                              {isRTL ? notif.titleArabic || notif.title : notif.title}
                            </span>
                            <span className="text-[10px] text-gray-400">{notif.createdAt.split(' ')[1]}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-gray-600">
                            {isRTL ? notif.messageArabic || notif.message : notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown / Switcher on Mobile */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[#29235D]/15 bg-white hover:bg-[#F8F6F0] transition-all"
              >
                <img
                  src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={currentUser?.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-[#D3B673]"
                />
                <div className="hidden sm:flex flex-col text-left rtl:text-right">
                  <span className="text-xs font-bold text-[#29235D] leading-tight line-clamp-1">
                    {isRTL ? currentUser?.nameArabic || currentUser?.name : currentUser?.name}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold border ${roleInfo.bg}`}>
                      {roleInfo.icon}
                      {roleInfo.label}
                    </span>
                    <span className="text-[10px] font-mono text-[#D3B673] font-bold">
                      {currentUser?.code}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {showDemoMenu && (
                <div
                  className={`absolute ${
                    isRTL ? 'left-0' : 'right-0'
                  } mt-2 w-72 bg-white border border-[#29235D]/15 rounded-2xl shadow-xl p-3 z-50`}
                >
                  <div className="p-2 border-b border-gray-100 mb-2">
                    <p className="text-xs font-semibold text-gray-500">{t('loggedAs')}</p>
                    <div className="flex items-center justify-between mt-1">
                      <div>
                        <p className="text-sm font-bold text-[#29235D]">
                          {isRTL ? currentUser?.nameArabic || currentUser?.name : currentUser?.name}
                        </p>
                        <p className="text-xs font-mono text-[#D3B673] font-bold">{currentUser?.code}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowAvatarEditModal(true);
                          setShowDemoMenu(false);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#29235D] text-[#D3B673] text-[10px] font-bold flex items-center gap-1 hover:bg-[#1D1845] transition-all cursor-pointer"
                        title={isRTL ? 'تغيير صورتي' : 'Change Avatar'}
                      >
                        <Camera className="w-3 h-3" />
                        <span>{isRTL ? 'صورتي' : 'Photo'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Profile & Settings Navigation Links */}
                  <div className="p-1 mb-2 bg-[#FBF9F4] rounded-xl border border-gray-100 space-y-1">
                    <button
                      onClick={() => {
                        onNavigateTab?.('profile');
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left rtl:text-right px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#29235D] hover:bg-white flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-[#B89955]" />
                      <span>{isRTL ? 'الملف الشخصي وتغيير الباسورد' : 'Profile & Password'}</span>
                    </button>
                    {(currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN') && (
                      <button
                        onClick={() => {
                          onNavigateTab?.('settings');
                          setShowDemoMenu(false);
                        }}
                        className="w-full text-left rtl:text-right px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#29235D] hover:bg-white flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Palette className="w-3.5 h-3.5 text-[#B89955]" />
                        <span>{isRTL ? 'لوحة تحكم المشرف والشعار' : 'Admin & Branding'}</span>
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">
                    {t('quickDemoLogin')}
                  </div>

                  <div className="space-y-1">
                    {students.slice(0, 2).map(std => (
                      <button
                        key={std.id}
                        onClick={() => {
                          switchDemoUser(std.id);
                          setShowDemoMenu(false);
                        }}
                        className={`w-full text-left rtl:text-right px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all ${
                          currentUser?.id === std.id ? 'bg-[#29235D] text-[#D3B673] font-bold' : 'hover:bg-gray-100 text-[#29235D]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">🎓 {std.name}</span>
                        <span className="font-mono text-[10px]">{std.code}</span>
                      </button>
                    ))}

                    {teachers.slice(0, 2).map(tea => (
                      <button
                        key={tea.id}
                        onClick={() => {
                          switchDemoUser(tea.id);
                          setShowDemoMenu(false);
                        }}
                        className={`w-full text-left rtl:text-right px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all ${
                          currentUser?.id === tea.id ? 'bg-[#29235D] text-[#D3B673] font-bold' : 'hover:bg-gray-100 text-[#29235D]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">📖 {tea.name}</span>
                        <span className="font-mono text-[10px]">{tea.code}</span>
                      </button>
                    ))}

                    <button
                      onClick={() => {
                        switchDemoUser('admin');
                        setShowDemoMenu(false);
                      }}
                      className={`w-full text-left rtl:text-right px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all ${
                        currentUser?.role === 'SUPER_ADMIN' ? 'bg-[#29235D] text-[#D3B673] font-bold' : 'hover:bg-gray-100 text-[#29235D]'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">🛡️ Admin (Dr. Alafak)</span>
                      <span className="font-mono text-[10px]">ADM-0001</span>
                    </button>
                  </div>

                  <div className="pt-2 mt-2 border-t border-gray-100">
                    <button
                      onClick={() => {
                        logout();
                        setShowDemoMenu(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {t('logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* User Avatar Edit Modal */}
      <UserAvatarEditModal
        user={currentUser}
        isOpen={showAvatarEditModal}
        onClose={() => setShowAvatarEditModal(false)}
      />
    </header>
  );
};
