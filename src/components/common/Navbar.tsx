import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { Logo } from './Logo';
import { UserAvatarEditModal } from '../admin/UserAvatarEditModal';
import {
  Bell,
  Globe,
  LogOut,
  ChevronDown,
  CheckCheck,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Camera,
  User,
  Palette,
  Moon,
  Sun,
  Eye,
  Link,
  Copy,
  Check,
  Share2,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onNavigateTab?: (tab: string) => void;
  activeTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateTab }) => {
  const {
    currentUser,
    logout,
    notifications,
    markNotificationAsRead,
    themeMode,
    setThemeMode,
  } = useApp();
  const { language, setLanguage, t, isRTL } = useI18n();
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAvatarEditModal, setShowAvatarEditModal] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const unreadNotifications = Array.isArray(notifications) ? notifications.filter(n => !n.read) : [];

  const handleCopyAppUrl = () => {
    try {
      const liveUrl = window.location.origin;
      navigator.clipboard.writeText(liveUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const formatNotifTime = (createdAt?: string) => {
    if (!createdAt) return '';
    try {
      if (createdAt.includes(' ')) {
        const timePart = createdAt.split(' ')[1];
        return timePart ? timePart.substring(0, 5) : createdAt;
      }
      if (createdAt.includes('T')) {
        const parts = createdAt.split('T');
        return parts[1]?.substring(0, 5) || parts[0];
      }
      return createdAt;
    } catch {
      return '';
    }
  };

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
    <header className="sticky top-0 z-40 bg-white/95 night:bg-[#131124]/95 backdrop-blur-md border-b border-[#29235D]/10 night:border-[#393168] shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Logo size="md" />
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Copy Live Platform Share URL Button */}
            <button
              onClick={handleCopyAppUrl}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'bg-[#F8F6F0] night:bg-[#1D1845] border-[#29235D]/15 night:border-[#393168] text-[#29235D] night:text-[#E8D5A3] hover:bg-[#F1ECE1]'
              }`}
              title={isRTL ? 'نسخ رابط المنصة المباشر للمشاركة مع الطلاب والمعلمين' : 'Copy Direct Live App Link'}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>{isRTL ? 'تم نسخ الرابط ✅' : 'Link Copied!'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#D3B673]" />
                  <span>{isRTL ? 'رابط المنصة' : 'Share Link'}</span>
                </>
              )}
            </button>
            
            {/* Night Reading Mode / Theme Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  themeMode === 'night'
                    ? 'bg-[#1D1845] border-[#D3B673]/40 text-[#E8D5A3]'
                    : themeMode === 'sepia'
                    ? 'bg-[#EFE6D8] border-[#DCCFBE] text-[#2E251D]'
                    : 'bg-[#F8F6F0] border-[#29235D]/15 text-[#29235D] hover:bg-[#F1ECE1]'
                }`}
                title={isRTL ? 'تغيير وضع القراءة والإضاءة' : 'Toggle Reading & Theme Mode'}
              >
                {themeMode === 'night' && <Moon className="w-3.5 h-3.5 text-[#D3B673]" />}
                {themeMode === 'sepia' && <Eye className="w-3.5 h-3.5 text-amber-700" />}
                {themeMode === 'light' && <Sun className="w-3.5 h-3.5 text-amber-500" />}
                <span className="hidden sm:inline">
                  {themeMode === 'night'
                    ? (isRTL ? 'قراءة ليلية' : 'Night Mode')
                    : themeMode === 'sepia'
                    ? (isRTL ? 'قراءة دافئة' : 'Warm Sepia')
                    : (isRTL ? 'نهاري' : 'Light')}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {showThemeMenu && (
                <div
                  className={`absolute ${
                    isRTL ? 'left-0' : 'right-0'
                  } mt-2 w-52 bg-white night:bg-[#1A1633] border border-[#29235D]/15 night:border-[#393168] rounded-2xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2`}
                >
                  <div className="px-2.5 py-1.5 text-[11px] font-bold text-gray-500 night:text-gray-400 border-b border-gray-100 night:border-gray-800 mb-1">
                    {isRTL ? 'وضع الرؤية والقراءة:' : 'Reading & Display Mode:'}
                  </div>
                  <button
                    onClick={() => {
                      setThemeMode('light');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      themeMode === 'light'
                        ? 'bg-[#29235D] text-[#D3B673]'
                        : 'text-gray-700 night:text-gray-300 hover:bg-gray-100 night:hover:bg-[#251F45]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>{isRTL ? 'الوضع النهاري المشرق' : 'Light Day Mode'}</span>
                    </div>
                    {themeMode === 'light' && <CheckCheck className="w-3.5 h-3.5 text-[#D3B673]" />}
                  </button>

                  <button
                    onClick={() => {
                      setThemeMode('night');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      themeMode === 'night'
                        ? 'bg-[#29235D] text-[#D3B673]'
                        : 'text-gray-700 night:text-gray-300 hover:bg-gray-100 night:hover:bg-[#251F45]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-[#D3B673]" />
                      <span>{isRTL ? 'وضع القراءة الليلية (مريح للعين)' : 'Night Reading Mode'}</span>
                    </div>
                    {themeMode === 'night' && <CheckCheck className="w-3.5 h-3.5 text-[#D3B673]" />}
                  </button>

                  <button
                    onClick={() => {
                      setThemeMode('sepia');
                      setShowThemeMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      themeMode === 'sepia'
                        ? 'bg-[#29235D] text-[#D3B673]'
                        : 'text-gray-700 night:text-gray-300 hover:bg-gray-100 night:hover:bg-[#251F45]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-amber-700" />
                      <span>{isRTL ? 'قراءة دافئة (Sepia الورقي)' : 'Warm Paper (Sepia)'}</span>
                    </div>
                    {themeMode === 'sepia' && <CheckCheck className="w-3.5 h-3.5 text-[#D3B673]" />}
                  </button>
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#29235D]/15 night:border-[#393168] bg-[#F8F6F0] night:bg-[#1D1845] hover:bg-[#F1ECE1] text-[#29235D] night:text-[#E8D5A3] text-xs font-bold transition-all cursor-pointer"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#D3B673]" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl border border-[#29235D]/10 night:border-[#393168] bg-white night:bg-[#1D1845] hover:bg-[#F8F6F0] night:hover:bg-[#251F45] text-[#29235D] night:text-[#E8D5A3] transition-all cursor-pointer"
                title={t('notifications')}
              >
                <Bell className="w-4 h-4 text-[#29235D] night:text-[#E8D5A3]" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D3B673] text-[#29235D] text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white night:border-[#131124]">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className={`absolute ${
                    isRTL ? 'left-0' : 'right-0'
                  } mt-2 w-80 sm:w-96 bg-white night:bg-[#1A1633] border border-[#29235D]/15 night:border-[#393168] rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2`}
                >
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100 night:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#D3B673]" />
                      <span className="font-bold text-[#29235D] night:text-[#E8D5A3] text-sm">{t('notifications')}</span>
                    </div>
                    {unreadNotifications.length > 0 && (
                      <span className="text-[11px] font-semibold text-[#D3B673] bg-[#29235D] night:bg-[#2F2966] px-2 py-0.5 rounded-full">
                        {unreadNotifications.length} {isRTL ? 'جديد' : 'new'}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                    {(!notifications || notifications.length === 0) ? (
                      <div className="text-center py-6">
                        <Bell className="w-8 h-8 text-gray-300 night:text-gray-600 mx-auto mb-2 opacity-50" />
                        <p className="text-xs text-gray-500 night:text-gray-400 font-medium">
                          {isRTL ? 'لا توجد إشعارات حالياً' : 'No notifications'}
                        </p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            try {
                              markNotificationAsRead(notif.id);
                            } catch {
                              // Safe handle
                            }
                          }}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                            notif.read
                              ? 'bg-gray-50/70 night:bg-[#131124]/70 border-gray-100 night:border-gray-800 text-gray-600 night:text-gray-400'
                              : 'bg-[#FBF9F4] night:bg-[#251F45] border-[#D3B673]/40 text-[#29235D] night:text-[#E8D5A3] font-medium'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-[#29235D] night:text-[#E8D5A3]">
                              {isRTL ? notif.titleArabic || notif.title : notif.title}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {formatNotifTime(notif.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-gray-600 night:text-gray-300">
                            {isRTL ? notif.messageArabic || notif.message : notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Dropdown / Switcher on Mobile & Desktop */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-[#29235D]/15 night:border-[#393168] bg-white night:bg-[#1D1845] hover:bg-[#F8F6F0] night:hover:bg-[#251F45] transition-all cursor-pointer"
              >
                <img
                  src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={currentUser?.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover border border-[#D3B673]"
                />
                <div className="hidden sm:flex flex-col text-left rtl:text-right">
                  <span className="text-xs font-bold text-[#29235D] night:text-[#E8D5A3] leading-tight line-clamp-1">
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
                  } mt-2 w-72 bg-white night:bg-[#1A1633] border border-[#29235D]/15 night:border-[#393168] rounded-2xl shadow-xl p-3 z-50`}
                >
                  <div className="p-2 border-b border-gray-100 night:border-gray-800 mb-2">
                    <p className="text-xs font-semibold text-gray-500 night:text-gray-400">{t('loggedAs')}</p>
                    <div className="flex items-center justify-between mt-1">
                      <div>
                        <p className="text-sm font-bold text-[#29235D] night:text-white">
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
                  <div className="p-1 mb-2 bg-[#FBF9F4] night:bg-[#131124] rounded-xl border border-gray-100 night:border-gray-800 space-y-1">
                    <button
                      onClick={() => {
                        onNavigateTab?.('profile');
                        setShowDemoMenu(false);
                      }}
                      className="w-full text-left rtl:text-right px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#29235D] night:text-gray-200 hover:bg-white night:hover:bg-[#251F45] flex items-center gap-2 transition-all cursor-pointer"
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
                        className="w-full text-left rtl:text-right px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#29235D] night:text-gray-200 hover:bg-white night:hover:bg-[#251F45] flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <Palette className="w-3.5 h-3.5 text-[#B89955]" />
                        <span>{isRTL ? 'لوحة تحكم المشرف والشعار' : 'Admin & Branding'}</span>
                      </button>
                    )}
                    
                    {/* Copy Link inside user menu */}
                    <button
                      onClick={handleCopyAppUrl}
                      className="w-full text-left rtl:text-right px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#29235D] night:text-gray-200 hover:bg-white night:hover:bg-[#251F45] flex items-center justify-between transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Share2 className="w-3.5 h-3.5 text-[#D3B673]" />
                        <span>{isRTL ? 'نسخ رابط المنصة للمشاركة' : 'Copy Direct App Link'}</span>
                      </div>
                      {copiedLink && <span className="text-[10px] text-emerald-600 font-bold">تم ✅</span>}
                    </button>
                  </div>

                  <div className="pt-2 mt-2 border-t border-gray-100 night:border-gray-800">
                    <button
                      onClick={() => {
                        logout();
                        setShowDemoMenu(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-600 bg-red-50 night:bg-red-950/40 hover:bg-red-100 rounded-xl transition-all cursor-pointer"
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
