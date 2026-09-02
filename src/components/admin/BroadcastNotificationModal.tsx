import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import {
  Bell,
  Send,
  Users,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  X,
  AlertCircle,
  BookOpen,
  CreditCard,
} from 'lucide-react';
import { NotificationAudience } from '../../types';

interface BroadcastNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BroadcastNotificationModal: React.FC<BroadcastNotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { sendBroadcastNotification, currentUser, students, teachers } = useApp();
  const { isRTL } = useI18n();

  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [messageAr, setMessageAr] = useState('');
  const [messageEn, setMessageEn] = useState('');
  const [targetAudience, setTargetAudience] = useState<NotificationAudience>('ALL');
  const [notifType, setNotifType] = useState<'SYSTEM' | 'CLASS_REMINDER' | 'SUBSCRIPTION' | 'ASSIGNMENT' | 'PAYMENT'>('SYSTEM');
  const [sentSuccess, setSentSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleAr.trim() && !titleEn.trim()) {
      alert(isRTL ? 'يرجى كتابة عنوان للإشعار' : 'Please enter a notification title');
      return;
    }
    if (!messageAr.trim() && !messageEn.trim()) {
      alert(isRTL ? 'يرجى كتابة نص الإشعار' : 'Please enter notification message content');
      return;
    }

    sendBroadcastNotification({
      title: titleEn || titleAr,
      titleArabic: titleAr || titleEn,
      message: messageEn || messageAr,
      messageArabic: messageAr || messageEn,
      targetAudience: targetAudience as 'ALL' | 'STUDENTS' | 'TEACHERS',
      type: notifType,
    });

    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1800);
  };

  const getRecipientCount = () => {
    if (targetAudience === 'ALL') return students.length + teachers.length;
    if (targetAudience === 'STUDENTS') return students.length;
    if (targetAudience === 'TEACHERS') return teachers.length;
    return 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white night:bg-[#1A1633] w-full max-w-xl rounded-3xl border border-[#29235D]/15 night:border-[#393168] shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#29235D] via-[#1D1845] to-[#29235D] p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D3B673]/20 border border-[#D3B673]/40 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-[#D3B673]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D3B673] text-[#29235D]">
                  {isRTL ? 'صلاحية المشرف العام' : 'Super Admin Authority'}
                </span>
                <span className="text-xs text-[#E8D5A3] font-medium">
                  {currentUser?.nameArabic || currentUser?.name}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black font-serif text-white mt-1">
                {isRTL ? '📢 إرسال وبث إشعار عام / مخصص' : 'Broadcast & Targeted Notifications'}
              </h2>
            </div>
          </div>
        </div>

        {/* Content */}
        {sentSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#29235D] night:text-white">
              {isRTL ? 'تم إرسال الإشعار بنجاح!' : 'Notification Sent Successfully!'}
            </h3>
            <p className="text-xs text-gray-500 night:text-gray-300">
              {isRTL
                ? `وصل الإشعار إلى المستهدفين (${getRecipientCount()} مستخدم) فورياً وسيظهر في شريط التنبيهات الخاص بهم.`
                : `Broadcast delivered instantly to ${getRecipientCount()} targeted users.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
            
            {/* Target Audience Selector */}
            <div>
              <label className="block text-[11px] font-bold text-[#29235D] night:text-[#E8D5A3] mb-1.5">
                {isRTL ? 'الجهة المستهدفة بالإشعار *' : 'Target Audience *'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetAudience('ALL')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    targetAudience === 'ALL'
                      ? 'bg-[#29235D] text-[#D3B673] border-[#D3B673] shadow-xs'
                      : 'bg-[#FBF9F4] night:bg-[#231E44] border-gray-200 night:border-gray-700 text-[#29235D] night:text-gray-300'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="font-bold text-[11px]">{isRTL ? 'الجميع (طلاب ومعلمون)' : 'All Users'}</span>
                  <span className="text-[9px] opacity-75">({students.length + teachers.length} {isRTL ? 'مستخدم' : 'users'})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetAudience('STUDENTS')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    targetAudience === 'STUDENTS'
                      ? 'bg-[#29235D] text-[#D3B673] border-[#D3B673] shadow-xs'
                      : 'bg-[#FBF9F4] night:bg-[#231E44] border-gray-200 night:border-gray-700 text-[#29235D] night:text-gray-300'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span className="font-bold text-[11px]">{isRTL ? 'الطلاب فقط' : 'Students Only'}</span>
                  <span className="text-[9px] opacity-75">({students.length} {isRTL ? 'طالب' : 'students'})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetAudience('TEACHERS')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    targetAudience === 'TEACHERS'
                      ? 'bg-[#29235D] text-[#D3B673] border-[#D3B673] shadow-xs'
                      : 'bg-[#FBF9F4] night:bg-[#231E44] border-gray-200 night:border-gray-700 text-[#29235D] night:text-gray-300'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="font-bold text-[11px]">{isRTL ? 'المعلمون فقط' : 'Teachers Only'}</span>
                  <span className="text-[9px] opacity-75">({teachers.length} {isRTL ? 'معلم' : 'teachers'})</span>
                </button>
              </div>
            </div>

            {/* Notification Type Selector */}
            <div>
              <label className="block text-[11px] font-bold text-[#29235D] night:text-[#E8D5A3] mb-1">
                {isRTL ? 'تصنيف الإشعار' : 'Notification Category'}
              </label>
              <select
                value={notifType}
                onChange={e => setNotifType(e.target.value as any)}
                className="w-full p-2.5 bg-[#FBF9F4] night:bg-[#231E44] border border-gray-200 night:border-gray-700 rounded-xl font-medium text-[#29235D] night:text-white"
              >
                <option value="SYSTEM">{isRTL ? '📢 إعلان وتنبيه إداري عام' : '📢 System Announcement'}</option>
                <option value="CLASS_REMINDER">{isRTL ? '📅 تنبيه بخصوص الحصص والجداول' : '📅 Class & Schedule Notice'}</option>
                <option value="SUBSCRIPTION">{isRTL ? '⚡ تنبيه باقات واشتراكات' : '⚡ Subscriptions & Quota'}</option>
                <option value="ASSIGNMENT">{isRTL ? '📝 واجبات وأنشطة تعليمية' : '📝 Assignments & Activities'}</option>
                <option value="PAYMENT">{isRTL ? '💳 شحن وتجديد الرصيد' : '💳 Recharge & Payments'}</option>
              </select>
            </div>

            {/* Title (Arabic & English) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#29235D] night:text-[#E8D5A3] mb-1">
                  {isRTL ? 'عنوان الإشعار (بالعربية) *' : 'Title (Arabic) *'}
                </label>
                <input
                  type="text"
                  required
                  value={titleAr}
                  onChange={e => setTitleAr(e.target.value)}
                  placeholder="مثال: تنويه هام بخصوص جدول إجازة العيد"
                  className="w-full p-2.5 bg-[#FBF9F4] night:bg-[#231E44] border border-gray-200 night:border-gray-700 rounded-xl font-bold text-[#29235D] night:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#29235D] night:text-[#E8D5A3] mb-1">
                  {isRTL ? 'عنوان الإشعار (بالإنجليزية)' : 'Title (English)'}
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={e => setTitleEn(e.target.value)}
                  placeholder="e.g. Important Notice Regarding Holiday"
                  className="w-full p-2.5 bg-[#FBF9F4] night:bg-[#231E44] border border-gray-200 night:border-gray-700 rounded-xl font-medium text-[#29235D] night:text-white"
                />
              </div>
            </div>

            {/* Message Content (Arabic & English) */}
            <div>
              <label className="block text-[11px] font-bold text-[#29235D] night:text-[#E8D5A3] mb-1">
                {isRTL ? 'نص الإشعار والتفاصيل (بالعربية) *' : 'Message Content (Arabic) *'}
              </label>
              <textarea
                required
                rows={3}
                value={messageAr}
                onChange={e => setMessageAr(e.target.value)}
                placeholder="اكتب رسالة الإشعار بالتفصيل هنا..."
                className="w-full p-2.5 bg-[#FBF9F4] night:bg-[#231E44] border border-gray-200 night:border-gray-700 rounded-xl text-[#29235D] night:text-white resize-none"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 night:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gray-100 night:bg-gray-800 text-gray-700 night:text-gray-300 font-bold transition-all cursor-pointer"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#29235D] hover:bg-[#1D1845] text-[#D3B673] font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isRTL ? 'بث وإرسال الإشعار الآن' : 'Broadcast Notification Now'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
