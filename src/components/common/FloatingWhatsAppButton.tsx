import React, { useState } from 'react';
import { useI18n } from '../../lib/i18n';
import { useApp } from '../../context/AppContext';
import {
  MessageCircle,
  Headphones,
  Sparkles,
  ExternalLink,
  X,
  Send,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const FloatingWhatsAppButton: React.FC = () => {
  const { isRTL } = useI18n();
  const { settings, currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [customQuery, setCustomQuery] = useState('');

  // Support WhatsApp Number (Egypt 01011992165 -> 201011992165)
  // Notice: We strictly use it inside the direct link without printing the raw phone number in the UI text.
  const SUPPORT_WHATSAPP_NUMBER = '201011992165';

  const defaultMessage = isRTL
    ? 'السلام عليكم ورحمة الله، أود الاستفسار والتواصل مع فريق الدعم الفني وخدمة العملاء لمنصة الآفاق الدولية.'
    : 'Hello, I would like to contact support regarding AITEC Platform courses and schedule.';

  const handleOpenWhatsApp = (messageText?: string) => {
    const textToSend = messageText || customQuery || defaultMessage;
    const url = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setCustomQuery('');
  };

  const quickTopics = isRTL
    ? [
        { label: 'استفسار عن حجز الحصص والبرامج', text: 'مرحباً، أود الاستفسار عن حجز الحصص وجداول المعلمين المتاحة.' },
        { label: 'مساعدة في التسجيل والدفع', text: 'مرحباً، أحتاج مساعدة بخصوص خطوات التسجيل وتفعيل الاشتراك.' },
        { label: 'دعم تقني وتنسيق مع معلم', text: 'مرحباً، أحتاج دعماً فنياً بخصوص الدخول للحصص والتنسيق مع المعلم.' },
      ]
    : [
        { label: 'Inquiry about Class Booking', text: 'Hello, I would like to inquire about available teacher slots and course bookings.' },
        { label: 'Enrollment & Payment Help', text: 'Hello, I need assistance with enrollment and subscription activation.' },
        { label: 'Technical & Teacher Support', text: 'Hello, I need technical support regarding live classes and teacher coordination.' },
      ];

  return (
    <div className={`fixed bottom-5 sm:bottom-6 z-50 ${isRTL ? 'left-5 sm:left-6' : 'right-5 sm:right-6'}`}>
      
      {/* Expanded Support Dialogue Box */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-3xl border border-[#29235D]/15 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#29235D] to-[#1D1845] p-4 text-white relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md">
                    <MessageCircle className="w-6 h-6 fill-current" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-[#29235D] rounded-full" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>{isRTL ? 'الدعم الفني وخدمة العملاء' : 'Customer & Tech Support'}</span>
                  </h4>
                  <p className="text-[11px] text-[#E8D5A3]">
                    {isRTL ? 'متاحون لخدمتك عبر واتساب مباشرة' : 'Online & ready to assist on WhatsApp'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body & Quick Options */}
          <div className="p-4 space-y-3 bg-[#FBF9F4]">
            <p className="text-xs text-[#29235D] font-medium leading-relaxed">
              {isRTL
                ? 'أهلاً بك! فريق الدعم الفني لمنصة الآفاق الدولية جاهز للإجابة على استفساراتك وتنسيق مواعيد الحصص.'
                : 'Welcome! Our support team is ready to answer your inquiries and coordinate your study schedule.'}
            </p>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#786F9A] block">
                {isRTL ? 'اختر موضوع الاستفسار السريع:' : 'Choose a quick topic:'}
              </span>
              {quickTopics.map((topic, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleOpenWhatsApp(topic.text)}
                  className="w-full text-left rtl:text-right p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-gray-200 hover:border-[#25D366] text-xs font-semibold text-[#29235D] transition-all flex items-center justify-between group cursor-pointer"
                >
                  <span className="line-clamp-1">{topic.label}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#25D366] flex-shrink-0" />
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={isRTL ? 'اكتب استفسارك هنا...' : 'Type your message...'}
                  value={customQuery}
                  onChange={e => setCustomQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleOpenWhatsApp();
                  }}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white text-[#29235D] outline-none focus:border-[#25D366]"
                />
                <button
                  type="button"
                  onClick={() => handleOpenWhatsApp()}
                  className="p-2 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white transition-all shadow-sm cursor-pointer"
                  title={isRTL ? 'بدء المحادثة' : 'Start Chat'}
                >
                  <Send className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>
            </div>

            {/* Direct Instant Action Button */}
            <button
              type="button"
              onClick={() => handleOpenWhatsApp(defaultMessage)}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>{isRTL ? 'محادثة مباشرة مع الدعم الفني' : 'Chat with Support Now'}</span>
            </button>
          </div>

          {/* Footer note */}
          <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 text-[10px] text-gray-500 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isRTL ? 'دعم رسمي معتمد ومباشر' : 'Verified Official Support'}</span>
          </div>

        </div>
      )}

      {/* Persistent Floating Action Trigger Button */}
      <button
        type="button"
        id="persistent-contact-support-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 py-3 px-4 sm:px-5 rounded-full bg-gradient-to-r from-[#25D366] to-[#1EBE5D] hover:from-[#20ba5a] hover:to-[#19a550] text-white shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-white/80 cursor-pointer"
        aria-label="Contact Support"
      >
        {/* Pulsing indicator ring */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300 border-2 border-[#25D366]" />
        </span>

        {/* WhatsApp Icon */}
        <div className="w-6 h-6 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 fill-current text-white" />
        </div>

        {/* Action Label */}
        <div className="text-left rtl:text-right hidden xs:flex flex-col">
          <span className="text-xs font-black tracking-wide leading-tight text-white drop-shadow-xs">
            {isRTL ? 'تواصل مع الدعم الفني' : 'Contact Support'}
          </span>
          <span className="text-[10px] font-medium text-emerald-100 leading-none">
            {isRTL ? 'خدمة العملاء عبر واتساب' : 'WhatsApp Support'}
          </span>
        </div>
      </button>

    </div>
  );
};
