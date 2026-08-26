import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { AitecLogo } from '../common/AitecLogo';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Palette,
  Eye,
  Sliders,
  Type,
  Layers,
} from 'lucide-react';

const PRESET_LOGOS = [
  {
    id: 'seal_official',
    label: 'ختم الآفاق الدولية الرسمي (Vector SVG)',
    mode: 'emblem' as const,
    url: '',
    previewBg: 'bg-[#29235D]',
  },
  {
    id: 'gold_crest',
    label: 'شعار الشعلة الذهبية الملكي',
    mode: 'custom' as const,
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    previewBg: 'bg-[#1D1845]',
  },
  {
    id: 'quran_calligraphy',
    label: 'مخطوطة المصحف الشريف والأكاديمية',
    mode: 'custom' as const,
    url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=200&auto=format&fit=crop&q=80',
    previewBg: 'bg-[#29235D]',
  },
  {
    id: 'academic_emblem',
    label: 'شعار الاعتماد الأكاديمي الدولي',
    mode: 'custom' as const,
    url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
    previewBg: 'bg-white',
  },
];

export const BrandingManager: React.FC = () => {
  const { settings, updatePlatformLogo, updateSettings } = useApp();
  const { isRTL } = useI18n();

  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [logoDisplayMode, setLogoDisplayMode] = useState<'emblem' | 'custom' | 'combined'>(
    settings.logoDisplayMode || 'combined'
  );
  const [logoTextEn, setLogoTextEn] = useState(settings.logoTextEn || settings.platformName || 'AITEC');
  const [logoTextAr, setLogoTextAr] = useState(
    settings.logoTextAr || settings.platformNameArabic || 'الآفاق الدولية للتدريب والاستشارات التربوية'
  );
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [savedToast, setSavedToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(isRTL ? 'حجم الملف كبير، يرجى اختيار ملف أصغر من 5 ميغابايت' : 'File too large (>5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setLogoUrl(base64);
        setLogoDisplayMode('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformLogo(logoUrl, logoDisplayMode, logoTextEn, logoTextAr);
    updateSettings({
      platformName: logoTextEn,
      platformNameArabic: logoTextAr,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleResetToDefault = () => {
    setLogoUrl('');
    setLogoDisplayMode('emblem');
    setLogoTextEn('AITEC');
    setLogoTextAr('الآفاق الدولية للتدريب والاستشارات التربوية');
    updatePlatformLogo('', 'emblem', 'AITEC', 'الآفاق الدولية للتدريب والاستشارات التربوية');
    updateSettings({
      platformName: 'AITEC',
      platformNameArabic: 'الآفاق الدولية للتدريب والاستشارات التربوية',
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#29235D]/15 shadow-xl p-6 sm:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#29235D]/10">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#29235D] text-[#D3B673] border border-[#D3B673]/40 shadow-xs">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#29235D] font-serif">
              {isRTL ? 'إدارة الهوية البصرية وشعار المنصة (Logo)' : 'Branding & Logo Management'}
            </h2>
            <p className="text-xs text-[#786F9A]">
              {isRTL
                ? 'تخصيص وتحديث لوجو الأكاديمية ونصوص الترويسة والشارات الرسمية للمشرف العام'
                : 'Customize academy logo, header lockups, and official branding elements'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetToDefault}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isRTL ? 'استعادة الشعار الرسمي' : 'Reset to Official Logo'}</span>
        </button>
      </div>

      {/* Toast Alert */}
      {savedToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{isRTL ? 'تم حفظ وتطبيق تعديلات الشعار والهوية بنجاح على كامل المنصة!' : 'Branding changes applied successfully!'}</span>
          </div>
          <Sparkles className="w-4 h-4 text-emerald-500" />
        </div>
      )}

      {/* Live Visual Preview Matrix */}
      <div className="bg-[#F8F6F0] p-5 rounded-2xl border border-[#29235D]/10 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#29235D] flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#D3B673]" />
            {isRTL ? 'المعاينة المباشرة للشعار (Live Preview):' : 'Live Logo Preview:'}
          </span>
          <span className="text-[11px] text-[#8C6826] font-mono">
            {logoDisplayMode === 'emblem' ? 'Seal Only' : logoDisplayMode === 'custom' ? 'Custom Image' : 'Combined'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Light Background Preview */}
          <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-2xs flex items-center justify-center">
            <AitecLogo size="lg" theme="light" customLogoUrl={logoUrl || undefined} />
          </div>

          {/* Dark Royal Navy Preview */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#29235D] to-[#1D1845] border border-[#D3B673]/30 shadow-md flex items-center justify-center">
            <AitecLogo size="lg" theme="dark" customLogoUrl={logoUrl || undefined} />
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Upload & Source Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Option 1: File Upload */}
          <div className="p-5 rounded-2xl border border-[#29235D]/15 bg-white space-y-3">
            <label className="block text-xs font-bold text-[#29235D] flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#B89955]" />
              <span>{isRTL ? '1. رفع ملف لوجو جديد من جهازك:' : '1. Upload logo file from device:'}</span>
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 px-4 rounded-xl border-2 border-dashed border-[#D3B673] bg-[#D3B673]/10 hover:bg-[#D3B673]/20 text-[#29235D] font-bold text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <ImageIcon className="w-6 h-6 text-[#B89955]" />
              <span>{isRTL ? 'اختر صورة من الكمبيوتر أو الهاتف (PNG, SVG, JPG)' : 'Choose image file'}</span>
              <span className="text-[10px] text-gray-500 font-normal">يدعم الصور الشفافة والخلفيات المفرغة</span>
            </button>
          </div>

          {/* Option 2: Image URL */}
          <div className="p-5 rounded-2xl border border-[#29235D]/15 bg-white space-y-3">
            <label className="block text-xs font-bold text-[#29235D] flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#B89955]" />
              <span>{isRTL ? '2. أو أدخل رابط مباشر لصورة الشعار (URL):' : '2. Or provide direct image URL:'}</span>
            </label>
            <div className="flex gap-2 pt-1">
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="flex-1 px-3.5 py-2.5 bg-[#FBF9F4] border border-[#29235D]/20 rounded-xl text-xs text-[#29235D] focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
              />
              <button
                type="button"
                onClick={() => {
                  if (customUrlInput.trim()) {
                    setLogoUrl(customUrlInput.trim());
                    setLogoDisplayMode('custom');
                  }
                }}
                className="px-4 py-2.5 bg-[#29235D] text-[#D3B673] rounded-xl text-xs font-bold hover:bg-[#1D1845] transition-all cursor-pointer"
              >
                {isRTL ? 'تطبيق الرابط' : 'Apply URL'}
              </button>
            </div>
            <p className="text-[10px] text-gray-500">
              {isRTL ? 'يمكنك وضع رابط لوجو من سحابة التخزين أو موقعك الخاص' : 'You can use any hosted direct link'}
            </p>
          </div>

        </div>

        {/* Display Mode Selection */}
        <div className="p-5 rounded-2xl border border-[#29235D]/15 bg-[#F8F6F0] space-y-3">
          <label className="block text-xs font-bold text-[#29235D] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#B89955]" />
            <span>{isRTL ? 'نمط عرض الشعار (Display Mode):' : 'Logo Display Mode:'}</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <button
              type="button"
              onClick={() => setLogoDisplayMode('emblem')}
              className={`p-3 rounded-xl border text-left rtl:text-right transition-all cursor-pointer ${
                logoDisplayMode === 'emblem'
                  ? 'bg-white border-[#29235D] ring-2 ring-[#D3B673] shadow-xs'
                  : 'bg-white/60 border-gray-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#29235D]">
                  {isRTL ? 'الختم الرسمي فقط' : 'SVG Seal Only'}
                </span>
                {logoDisplayMode === 'emblem' && <Check className="w-4 h-4 text-[#B89955]" />}
              </div>
              <p className="text-[10px] text-gray-500">
                {isRTL ? 'استخدام الختم الملكي للآفاق الدولية' : 'Official vector crest'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setLogoDisplayMode('custom')}
              className={`p-3 rounded-xl border text-left rtl:text-right transition-all cursor-pointer ${
                logoDisplayMode === 'custom'
                  ? 'bg-white border-[#29235D] ring-2 ring-[#D3B673] shadow-xs'
                  : 'bg-white/60 border-gray-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#29235D]">
                  {isRTL ? 'الصورة المرفوعة المخصصة' : 'Custom Image Only'}
                </span>
                {logoDisplayMode === 'custom' && <Check className="w-4 h-4 text-[#B89955]" />}
              </div>
              <p className="text-[10px] text-gray-500">
                {isRTL ? 'عرض اللوجو المرفوع بدلاً من الختم' : 'Render your uploaded file'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setLogoDisplayMode('combined')}
              className={`p-3 rounded-xl border text-left rtl:text-right transition-all cursor-pointer ${
                logoDisplayMode === 'combined'
                  ? 'bg-white border-[#29235D] ring-2 ring-[#D3B673] shadow-xs'
                  : 'bg-white/60 border-gray-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#29235D]">
                  {isRTL ? 'مدمج (صورة + نصوص رسمية)' : 'Combined Lockup'}
                </span>
                {logoDisplayMode === 'combined' && <Check className="w-4 h-4 text-[#B89955]" />}
              </div>
              <p className="text-[10px] text-gray-500">
                {isRTL ? 'أيقونة الشعار مع النصوص والأسماء' : 'Icon + Typography lockup'}
              </p>
            </button>

          </div>
        </div>

        {/* Text Customization (Brand Titles) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#29235D] mb-1.5">
              {isRTL ? 'اسم المنصة بالإنجليزية (English Brand):' : 'English Brand Name:'}
            </label>
            <input
              type="text"
              value={logoTextEn}
              onChange={(e) => setLogoTextEn(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FBF9F4] border border-[#29235D]/20 rounded-xl text-xs font-bold text-[#29235D] focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#29235D] mb-1.5">
              {isRTL ? 'اسم المنصة بالعربية (Arabic Brand):' : 'Arabic Brand Name:'}
            </label>
            <input
              type="text"
              value={logoTextAr}
              onChange={(e) => setLogoTextAr(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FBF9F4] border border-[#29235D]/20 rounded-xl text-xs font-bold text-[#29235D] focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#29235D] to-[#1D1845] text-[#D3B673] border border-[#D3B673] font-bold text-xs hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#D3B673]" />
            <span>{isRTL ? 'حفظ وتطبيق إعدادات الشعار والهوية' : 'Save & Apply Brand Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
