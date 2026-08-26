import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { User, StudentProfile, TeacherProfile } from '../../types';
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Copy,
  User as UserIcon,
  Search,
  Filter,
  Camera,
} from 'lucide-react';

interface PasswordManagerModalProps {
  initialTargetUser?: User | StudentProfile | TeacherProfile | null;
  initialSelectedUserId?: string | null;
  onSelectUserForAvatar?: (user: User | StudentProfile | TeacherProfile) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const PasswordManagerModal: React.FC<PasswordManagerModalProps> = ({
  initialTargetUser,
  initialSelectedUserId,
  onSelectUserForAvatar,
  isOpen = true,
  onClose,
}) => {
  const {
    students,
    teachers,
    settings,
    currentUser,
    updateUserPassword,
    updateAdminPasscode,
  } = useApp();
  const { isRTL } = useI18n();

  // Super Admin mock/real object
  const adminObj: User = {
    id: 'usr-adm-1',
    code: 'ADM-0001',
    name: 'Dr. Alafak Director (المشرف العام)',
    nameArabic: 'د. المشرف العام للآفاق الدولية',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    password: settings.adminPasscode || 'admin123',
    joinedDate: '2025-01-01',
    avatarUrl: currentUser?.avatarUrl,
  };

  const allAccountList: (User | StudentProfile | TeacherProfile)[] = [
    adminObj,
    ...teachers,
    ...students,
  ];

  const [selectedUser, setSelectedUser] = useState<User | StudentProfile | TeacherProfile | null>(() => {
    if (initialTargetUser) return initialTargetUser;
    if (initialSelectedUserId) {
      const found = allAccountList.find(u => u.id === initialSelectedUserId);
      if (found) return found;
    }
    return teachers[0] || students[0] || adminObj;
  });

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<'ALL' | 'TEACHER' | 'STUDENT' | 'ADMIN'>('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  const filteredList = allAccountList.filter((u) => {
    if (filterRole === 'ADMIN' && u.role !== 'SUPER_ADMIN' && u.role !== 'ADMIN') return false;
    if (filterRole === 'TEACHER' && u.role !== 'TEACHER') return false;
    if (filterRole === 'STUDENT' && u.role !== 'STUDENT') return false;

    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q) || (u.nameArabic && u.nameArabic.includes(q));
      const matchCode = u.code.toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      return matchName || matchCode || matchEmail;
    }
    return true;
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = 'AITEC-';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(result);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword.trim()) return;

    const trimmed = newPassword.trim();
    if (selectedUser.role === 'SUPER_ADMIN' || selectedUser.id === 'usr-adm-1' || selectedUser.code === 'ADM-0001') {
      updateAdminPasscode(trimmed);
      setToastMessage(isRTL ? 'تم تحديث رمز المرور السري للمشرف العام بنجاح!' : 'Admin Master passcode updated successfully!');
    } else {
      updateUserPassword(selectedUser.id, trimmed);
      setToastMessage(
        isRTL
          ? `تم تحديث كلمة مرور (${selectedUser.nameArabic || selectedUser.name}) بنجاح!`
          : `Password for ${selectedUser.name} updated successfully!`
      );
    }

    setNewPassword('');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#29235D]/15 shadow-xl p-6 sm:p-8 space-y-6">
      
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#29235D]/10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#29235D] text-[#D3B673] border border-[#D3B673]/40 shadow-xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#29235D] font-serif">
              {isRTL ? 'إدارة كلمات المرور وبيانات الدخول' : 'Access & Password Control'}
            </h2>
            <p className="text-xs text-[#786F9A]">
              {isRTL
                ? 'صلاحية كاملة للمشرف العام لتعديل وتعيين كلمات المرور لجميع المعلمين والطلاب وحماية الحسابات'
                : 'Full authority for General Supervisor to manage and reset passwords for all faculty & students'}
            </p>
          </div>
        </div>

        {/* Master Admin Security Passcode Widget */}
        <div className="flex items-center gap-3 bg-[#D3B673]/15 border border-[#D3B673]/40 p-3 rounded-2xl">
          <ShieldCheck className="w-5 h-5 text-[#B89955]" />
          <div>
            <span className="text-[10px] font-bold text-[#8C6826] uppercase tracking-wider block">
              {isRTL ? 'رمز المشرف العام الحالي:' : 'Current Master Passcode:'}
            </span>
            <span className="font-mono text-sm font-black text-[#29235D]">
              {settings.adminPasscode || 'admin123'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(settings.adminPasscode || 'admin123', 'admin-pass')}
            className="p-1.5 rounded-lg bg-white text-[#29235D] hover:bg-[#F8F6F0] transition-all text-xs cursor-pointer shadow-2xs"
            title="Copy Master Passcode"
          >
            {copiedId === 'admin-pass' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <Sparkles className="w-4 h-4 text-emerald-500" />
        </div>
      )}

      {/* Main Grid: Accounts List on Left, Reset Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Filter & User Selection List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={isRTL ? 'بحث بالاسم، الكود، أو البريد...' : 'Search by name, code, email...'}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 bg-[#FBF9F4] border border-[#29235D]/15 rounded-xl text-xs text-[#29235D] focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
              />
            </div>

            <div className="flex bg-[#F8F6F0] p-1 rounded-xl border border-[#29235D]/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterRole('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterRole === 'ALL' ? 'bg-[#29235D] text-[#D3B673]' : 'text-gray-600 hover:text-[#29235D]'
                }`}
              >
                {isRTL ? 'الكل' : 'All'}
              </button>
              <button
                type="button"
                onClick={() => setFilterRole('TEACHER')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterRole === 'TEACHER' ? 'bg-[#29235D] text-[#D3B673]' : 'text-gray-600 hover:text-[#29235D]'
                }`}
              >
                {isRTL ? 'المعلمون' : 'Teachers'}
              </button>
              <button
                type="button"
                onClick={() => setFilterRole('STUDENT')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterRole === 'STUDENT' ? 'bg-[#29235D] text-[#D3B673]' : 'text-gray-600 hover:text-[#29235D]'
                }`}
              >
                {isRTL ? 'الطلاب' : 'Students'}
              </button>
            </div>
          </div>

          {/* User List Container */}
          <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 rtl:pr-0 rtl:pl-1 divide-y divide-gray-100">
            {filteredList.map((user) => {
              const isSelected = selectedUser?.id === user.id;
              const isTeacher = user.role === 'TEACHER';
              const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
              const currentPass = isAdmin
                ? settings.adminPasscode || 'admin123'
                : user.password || (isTeacher ? 'teacher123' : 'student123');

              return (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#29235D]/5 border-[#29235D] shadow-xs'
                      : 'bg-white border-gray-100 hover:bg-[#F8F6F0]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#D3B673] bg-white flex items-center justify-center flex-shrink-0">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#29235D]">
                          {user.nameArabic || user.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                            isAdmin
                              ? 'bg-[#29235D] text-[#D3B673]'
                              : isTeacher
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {user.code}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-500 block">
                        {user.email || (isTeacher ? 'teacher@alafak.edu' : 'student@alafak.edu')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right rtl:text-left">
                      <span className="text-[10px] text-gray-400 block font-mono">كلمة المرور الحالية</span>
                      <span className="font-mono text-xs font-bold text-[#29235D] bg-[#F8F6F0] px-2 py-0.5 rounded-md border border-gray-200">
                        {currentPass}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(user);
                        generateRandomPassword();
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-[#29235D] text-[#D3B673] hover:bg-[#1D1845] text-xs font-bold transition-all shadow-2xs"
                    >
                      {isRTL ? 'تعديل' : 'Edit'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Side: Password Change Action Card (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#F8F6F0] to-[#F1ECE1] p-6 rounded-3xl border border-[#29235D]/15 flex flex-col justify-between">
          
          {selectedUser ? (
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#29235D]/10">
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#D3B673] bg-white flex items-center justify-center flex-shrink-0">
                      {selectedUser.avatarUrl ? (
                        <img src={selectedUser.avatarUrl} alt={selectedUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    {onSelectUserForAvatar && (
                      <button
                        type="button"
                        onClick={() => onSelectUserForAvatar(selectedUser)}
                        className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#29235D] text-[#D3B673] shadow-md hover:scale-110 transition-all cursor-pointer"
                        title={isRTL ? 'تعديل الصورة الشخصية' : 'Change Avatar'}
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#8C6826]">
                      {selectedUser.role} • {selectedUser.code}
                    </span>
                    <h3 className="text-sm font-black text-[#29235D]">
                      {selectedUser.nameArabic || selectedUser.name}
                    </h3>
                  </div>
                </div>

                {onSelectUserForAvatar && (
                  <button
                    type="button"
                    onClick={() => onSelectUserForAvatar(selectedUser)}
                    className="px-2.5 py-1.5 rounded-xl bg-white border border-[#D3B673] text-[#29235D] hover:bg-[#D3B673]/10 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#B89955]" />
                    <span>{isRTL ? 'تغيير الصورة' : 'Photo'}</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#29235D] mb-1.5">
                  {isRTL ? 'كلمة المرور الجديدة / رمز الدخول:' : 'New Password / Passcode:'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={isRTL ? 'أدخل كلمة المرور الجديدة...' : 'Enter new password...'}
                    required
                    className="w-full pl-3 pr-10 rtl:pl-10 rtl:pr-3 py-2.5 bg-white border border-[#29235D]/20 rounded-xl text-sm font-mono text-[#29235D] focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 pr-3 rtl:pr-0 rtl:pl-3 flex items-center text-gray-400 hover:text-[#29235D]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-gray-50 border border-[#29235D]/20 text-[#29235D] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#B89955]" />
                  <span>{isRTL ? 'توليد كلمة عشوائية' : 'Generate'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewPassword(selectedUser.role === 'TEACHER' ? 'teacher123' : selectedUser.role === 'STUDENT' ? 'student123' : 'admin123')}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-gray-50 border border-[#29235D]/20 text-gray-600 text-xs font-bold transition-all shadow-2xs"
                >
                  {isRTL ? 'الافتراضية' : 'Default'}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-[#29235D]/5 border border-[#29235D]/10 text-[11px] text-[#29235D] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#8C6826]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'ملاحظة للمشرف العام:' : 'Supervisor Note:'}</span>
                </div>
                <p>
                  {isRTL
                    ? 'سيتمكن المستخدم فوراً من تسجيل الدخول بكلمة المرور الجديدة هذه من شاشة تسجيل الدخول.'
                    : 'The user will immediately be able to log in using this new password.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={!newPassword.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#29235D] to-[#1D1845] text-[#D3B673] border border-[#D3B673] font-bold text-xs hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{isRTL ? 'حفظ وتحديث كلمة المرور' : 'Save & Update Password'}</span>
              </button>
            </form>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <UserIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-xs">{isRTL ? 'اختر مستخدماً من القائمة لتعديل كلمة المرور' : 'Select a user from the list to update password'}</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
