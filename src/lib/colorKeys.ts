import { ClassSessionStatus } from '../types';

export interface ColorKeyItem {
  key: ClassSessionStatus;
  labelEn: string;
  labelAr: string;
  shortLabelAr: string;
  hex: string;
  textColor: string;
  badgeClass: string;
  cardBorderClass: string;
  cardBgLightClass: string;
  cardBgDarkClass: string;
  meaningTeacherAr: string;
  meaningStudentAr: string;
  meaningEn: string;
  actionHintAr: string;
  actionHintEn: string;
  iconName: string;
}

export const COLOR_KEYS_CONFIG: Record<ClassSessionStatus, ColorKeyItem> = {
  SCHEDULED: {
    key: 'SCHEDULED',
    labelEn: 'Coming Classes',
    labelAr: 'حصص قادمة (مجدولة)',
    shortLabelAr: 'قادمة',
    hex: '#8B1D2C', // Dark Burgundy/Crimson Red as in screenshot
    textColor: '#FFFFFF',
    badgeClass: 'bg-[#8B1D2C] text-white border-[#701622]',
    cardBorderClass: 'border-l-4 border-l-[#8B1D2C]',
    cardBgLightClass: 'bg-white hover:border-[#8B1D2C]/40',
    cardBgDarkClass: 'night:bg-[#1A1633] night:border-[#8B1D2C]/30',
    meaningTeacherAr: 'حصة مجدولة في التقويم لم يحن وقتها بعد، جاهزة للانعقاد بالموعد المحدد.',
    meaningStudentAr: 'درسك القادم مع المعلم، يرجى الاستعداد والتحضير قبل موعد البدء.',
    meaningEn: 'Upcoming scheduled session ready to commence at its set time.',
    actionHintAr: 'يمكن بدء البث قبل الموعد بـ 5 دقائق عبر زر Zoom.',
    actionHintEn: 'You can launch live Zoom 5 minutes prior to start.',
    iconName: 'Clock',
  },
  LIVE: {
    key: 'LIVE',
    labelEn: 'Running',
    labelAr: 'جارية الآن (مباشر)',
    shortLabelAr: 'جارية الآن',
    hex: '#16A34A', // Bright green as in screenshot
    textColor: '#FFFFFF',
    badgeClass: 'bg-[#16A34A] text-white border-[#15803D] animate-pulse',
    cardBorderClass: 'border-l-4 border-l-[#16A34A] shadow-md shadow-emerald-500/10',
    cardBgLightClass: 'bg-emerald-50/60 border-emerald-300',
    cardBgDarkClass: 'night:bg-emerald-950/40 night:border-emerald-700',
    meaningTeacherAr: 'الحصة منعقدة حالياً وفي وضع البث الحي المباشر مع الطلاب.',
    meaningStudentAr: 'المعلم في الغرفة والبث نشط حالياً! انقر على الزر لدخول الفصل فوراً.',
    meaningEn: 'Live interactive class session currently running in real-time.',
    actionHintAr: 'يمكنك فتح السبورة التفاعلية أو تسجيل الحضور فوراً.',
    actionHintEn: 'Enter room or launch interactive whiteboard.',
    iconName: 'Radio',
  },
  COMPLETED: {
    key: 'COMPLETED',
    labelEn: 'Completed',
    labelAr: 'مكتملة (تم الحضور)',
    shortLabelAr: 'مكتملة',
    hex: '#15803D', // Deep Forest Green as in screenshot
    textColor: '#FFFFFF',
    badgeClass: 'bg-[#15803D] text-white border-[#166534]',
    cardBorderClass: 'border-l-4 border-l-[#15803D]',
    cardBgLightClass: 'bg-white hover:border-[#15803D]/40',
    cardBgDarkClass: 'night:bg-[#1A1633] night:border-[#15803D]/30',
    meaningTeacherAr: 'تم انتهاء الدرس بنجاح، وخُصمت الحصة من رصيد الطالب وتم رصد التقييم.',
    meaningStudentAr: 'تم حضور الحصة وإتمامها بنجاح واحتسابها ضمن تقدمك الدراسي.',
    meaningEn: 'Class session finished successfully and logged into attendance records.',
    actionHintAr: 'تم تدوين الملاحظات ورصد تقرير الحصة.',
    actionHintEn: 'Session logged into permanent student progress transcript.',
    iconName: 'CheckCircle',
  },
  MISSED: {
    key: 'MISSED',
    labelEn: 'Missed',
    labelAr: 'فائتة (غير مكتملة)',
    shortLabelAr: 'فائتة',
    hex: '#4B5563', // Slate/Dark Gray as in screenshot
    textColor: '#FFFFFF',
    badgeClass: 'bg-[#4B5563] text-white border-[#374151]',
    cardBorderClass: 'border-l-4 border-l-[#4B5563]',
    cardBgLightClass: 'bg-gray-50 hover:border-[#4B5563]/40',
    cardBgDarkClass: 'night:bg-[#1E1B38] night:border-[#4B5563]/30',
    meaningTeacherAr: 'انقضى موعد الحصة دون انعقادها أو تسجيل حضور الطرفين.',
    meaningStudentAr: 'فات موعد هذه الحصة، يرجى التنسيق مع المعلم لإعادة جدولتها.',
    meaningEn: 'Session time passed without live execution or attendance.',
    actionHintAr: 'يمكنك تعديل الموعد وتحويلها إلى "معاد جدولتها (Rescheduled)".',
    actionHintEn: 'Contact administration or teacher to reschedule.',
    iconName: 'ClockRewind',
  },
  TRIAL: {
    key: 'TRIAL',
    labelEn: 'Trial',
    labelAr: 'حصة تجريبية (تقييم)',
    shortLabelAr: 'تجريبية',
    hex: '#0D9488', // Teal/Cyan as in screenshot
    textColor: '#FFFFFF',
    badgeClass: 'bg-[#0D9488] text-white border-[#0F766E]',
    cardBorderClass: 'border-l-4 border-l-[#0D9488]',
    cardBgLightClass: 'bg-teal-50/40 border-teal-200',
    cardBgDarkClass: 'night:bg-teal-950/30 night:border-teal-800',
    meaningTeacherAr: 'حصة تقييم مستوى لطالب جديد، لتحديد المنهج المناسب والخطة التعليمية.',
    meaningStudentAr: 'جلستك التجريبية للتعرف على المعلم وتحديد مستواك الأكاديمي.',
    meaningEn: 'Introductory level assessment or free trial session for new students.',
    actionHintAr: 'ركز على قياس النطق والتلاوة وتحديد مستوى البداية المناسب.',
    actionHintEn: 'Evaluation & baseline placement lesson.',
    iconName: 'Sparkles',
  },
  RESCHEDULED: {
    key: 'RESCHEDULED',
    labelEn: 'Rescheduled',
    labelAr: 'مؤجلة (معاد جدولتها)',
    shortLabelAr: 'مؤجلة',
    hex: '#2563EB', // Royal Blue as in screenshot
    textColor: '#FFFFFF',
    badgeClass: 'bg-[#2563EB] text-white border-[#1D4ED8]',
    cardBorderClass: 'border-l-4 border-l-[#2563EB]',
    cardBgLightClass: 'bg-blue-50/40 border-blue-200',
    cardBgDarkClass: 'night:bg-blue-950/30 night:border-blue-800',
    meaningTeacherAr: 'تم تأجيل موعد الحصة وتحديد موعد بديل بطلب مسبق واتفاق مشترك.',
    meaningStudentAr: 'تم تعديل موعد الدرس إلى توقيت بديل بالتنسيق مع إدارة المنصة.',
    meaningEn: 'Session was postponed and rescheduled to an alternate time slot.',
    actionHintAr: 'تأكد من التوقيت الجديد في التقويم لتجنب التعارض.',
    actionHintEn: 'Check calendar for the updated new time slot.',
    iconName: 'CalendarSync',
  },
  CANCELLED: {
    key: 'CANCELLED',
    labelEn: 'Canceled',
    labelAr: 'ملغاة (بعذر)',
    shortLabelAr: 'ملغاة',
    hex: '#E11D48', // Coral / Salmon Red as in screenshot
    textColor: '#FFFFFF',
    badgeClass: 'bg-[#E11D48] text-white border-[#BE123C]',
    cardBorderClass: 'border-l-4 border-l-[#E11D48] opacity-75',
    cardBgLightClass: 'bg-rose-50/30 border-rose-200',
    cardBgDarkClass: 'night:bg-rose-950/30 night:border-rose-800',
    meaningTeacherAr: 'تم إلغاء الحصة رسمياً بعذر مقبول، ولم تُخصم من رصيد باقة الطالب.',
    meaningStudentAr: 'حصة أُلغيت بعذر مسبق، وسيتم الحفاظ على رصيد حصصك كاملة.',
    meaningEn: 'Session officially cancelled with prior excuse; quota preserved.',
    actionHintAr: 'الرصيد محفوظ ولا يتم خصمه من رصيد اشتراك الطالب.',
    actionHintEn: 'Quota is safely preserved for future booking.',
    iconName: 'XCircle',
  },
  ABSENT: {
    key: 'ABSENT',
    labelEn: 'Absent',
    labelAr: 'غياب الطالب (بدون عذر)',
    shortLabelAr: 'غياب',
    hex: '#18181B', // Solid Black as in screenshot
    textColor: '#FFFFFF',
    badgeClass: 'bg-[#18181B] text-white border-black shadow-xs',
    cardBorderClass: 'border-l-4 border-l-[#18181B]',
    cardBgLightClass: 'bg-zinc-100/80 border-zinc-300',
    cardBgDarkClass: 'night:bg-zinc-900 night:border-zinc-700',
    meaningTeacherAr: 'تغيب الطالب عن الحصة بدون إخطار مسبق، ويتم احتساب الحصة وخصمها من الرصيد.',
    meaningStudentAr: 'سُجّل غياب في هذا الدرس لعدم الحضور، يرجى الالتزام بالمواعيد لتجنب فقدان الحصص.',
    meaningEn: 'Unexcused student absence recorded; quota deducted automatically.',
    actionHintAr: 'تم إشعار الطالب وولي الأمر بتسجيل الغياب في السجل.',
    actionHintEn: 'Deducted from balance due to unexcused absence policy.',
    iconName: 'UserX',
  },
};

export const COLOR_KEYS_ORDER: ClassSessionStatus[] = [
  'SCHEDULED',
  'LIVE',
  'COMPLETED',
  'MISSED',
  'TRIAL',
  'RESCHEDULED',
  'CANCELLED',
  'ABSENT',
];

export function getClassStatusConfig(status: ClassSessionStatus | string): ColorKeyItem {
  if (status in COLOR_KEYS_CONFIG) {
    return COLOR_KEYS_CONFIG[status as ClassSessionStatus];
  }
  return COLOR_KEYS_CONFIG.SCHEDULED;
}
