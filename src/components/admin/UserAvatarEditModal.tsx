import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../lib/i18n';
import { User, StudentProfile, TeacherProfile } from '../../types';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Sparkles,
  Camera,
  RefreshCw,
  User as UserIcon,
} from 'lucide-react';

interface UserAvatarEditModalProps {
  user: User | StudentProfile | TeacherProfile | null | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const PRESET_AVATARS = [
  {
    id: 'p1',
    category: 'scholar_male',
    label: 'شيخ / أستاذ معتمد 1',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',
  },
  {
    id: 'p2',
    category: 'scholar_male',
    label: 'أستاذ لغويات 2',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80',
  },
  {
    id: 'p3',
    category: 'scholar_female',
    label: 'أستاذة / باحثة 1',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',
  },
  {
    id: 'p4',
    category: 'director',
    label: 'إشراف أكاديمي',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
  },
  {
    id: 'p5',
    category: 'student_male',
    label: 'طالب جامعي 1',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&auto=format&fit=crop&q=80',
  },
  {
    id: 'p6',
    category: 'student_female',
    label: 'طالبة دراسات 1',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=250&auto=format&fit=crop&q=80',
  },
  {
    id: 'p7',
    category: 'student_male',
    label: 'دارس دولي 2',
    url: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=250&auto=format&fit=crop&q=80',
  },
  {
    id: 'p8',
    category: 'student_female',
    label: 'دارسة دولية 2',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=250&auto=format&fit=crop&q=80',
  },
  {
    id: 'p9',
    category: 'academic',
    label: 'أكاديمي تنفيذي',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80',
  },
  {
    id: 'p10',
    category: 'student',
    label: 'متعلم مجتهد',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=250&auto=format&fit=crop&q=80',
  },
];

export const UserAvatarEditModal: React.FC<UserAvatarEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { updateUserAvatar } = useApp();
  const { isRTL } = useI18n();

  const [selectedUrl, setSelectedUrl] = useState(user?.avatarUrl || '');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState(user?.avatarUrl || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.avatarUrl) {
      setSelectedUrl(user.avatarUrl);
      setPreviewUrl(user.avatarUrl);
    } else {
      setSelectedUrl('');
      setPreviewUrl('');
    }
  }, [user?.avatarUrl, user?.id, isOpen]);

  if (!isOpen || !user) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert(isRTL ? 'حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميغابايت' : 'File is too large. Please select under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedUrl(base64);
        setPreviewUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setSelectedUrl(customUrlInput.trim());
      setPreviewUrl(customUrlInput.trim());
    }
  };

  const handleSave = () => {
    if (!previewUrl) return;
    updateUserAvatar(user.id, previewUrl);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onSaved?.();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141033]/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-[#29235D]/20 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#29235D] to-[#1D1845] text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#D3B673]/20 border border-[#D3B673]/40 text-[#D3B673]">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif">
                {isRTL ? 'تعديل الصورة الشخصية' : 'Update Profile Picture'}
              </h2>
              <p className="text-xs text-[#E8D5A3]">
                {user.nameArabic || user.name} ({user.code})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Current / New Live Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-[#F8F6F0] border border-[#29235D]/10">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#D3B673] shadow-md bg-white flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <UserIcon className="w-12 h-12 text-[#786F9A]" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-[#29235D] text-[#D3B673] border-2 border-white shadow-md hover:bg-[#1D1845] transition-all cursor-pointer"
                title={isRTL ? 'رفع من الجهاز' : 'Upload file'}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center sm:text-left rtl:sm:text-right flex-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#29235D]/10 text-[#29235D]">
                {user.role}
              </span>
              <h3 className="text-sm font-bold text-[#29235D] mt-1">
                {user.nameArabic || user.name}
              </h3>
              <p className="text-xs text-gray-500 font-mono">{user.code}</p>
              <p className="text-[11px] text-[#8C6826] mt-1 font-medium">
                {isRTL ? 'اختر صورة من المكتبة أو قم برفع صورة جديدة من جهازك' : 'Choose a preset or upload from your device'}
              </p>
            </div>
          </div>

          {/* Upload Button Section */}
          <div>
            <label className="block text-xs font-bold text-[#29235D] mb-2">
              {isRTL ? '1. رفع صورة مباشرة من جهازك (كمبيوتر / هاتف):' : '1. Upload directly from your device:'}
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
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#D3B673] bg-[#D3B673]/10 hover:bg-[#D3B673]/20 text-[#29235D] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Upload className="w-4 h-4 text-[#B89955]" />
              <span>{isRTL ? 'اضغط هنا لرفع صورة من الجهاز (PNG, JPG, WebP)' : 'Click to upload image file'}</span>
            </button>
          </div>

          {/* Preset Gallery */}
          <div>
            <label className="block text-xs font-bold text-[#29235D] mb-2 flex items-center justify-between">
              <span>{isRTL ? '2. أو اختر من معرض الصور الأكاديمية الجاهزة:' : '2. Or choose from preset avatars:'}</span>
              <span className="text-[10px] text-gray-400">10 خيارات عالية الدقة</span>
            </label>
            <div className="grid grid-cols-5 gap-2.5">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = previewUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedUrl(preset.url);
                      setPreviewUrl(preset.url);
                    }}
                    className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all group cursor-pointer ${
                      isSelected
                        ? 'border-[#29235D] ring-2 ring-[#D3B673] scale-105 shadow-md'
                        : 'border-gray-200 hover:border-[#D3B673] hover:scale-102'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#29235D]/40 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-[#D3B673] text-[#29235D] flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Web URL input */}
          <div>
            <label className="block text-xs font-bold text-[#29235D] mb-1.5">
              {isRTL ? '3. أو أدخل رابط صورة خارجي (URL):' : '3. Or enter image URL:'}
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://images.example.com/avatar.jpg"
                className="flex-1 px-3 py-2 bg-[#FBF9F4] border border-gray-300 rounded-xl text-xs text-[#29235D] focus:outline-none focus:ring-2 focus:ring-[#D3B673]"
              />
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                className="px-3 py-2 bg-[#29235D] text-[#D3B673] rounded-xl text-xs font-bold hover:bg-[#1D1845] transition-all cursor-pointer"
              >
                {isRTL ? 'معاينة' : 'Apply'}
              </button>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#F8F6F0] border-t border-gray-200 flex justify-end gap-3 items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition-all cursor-pointer"
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={!previewUrl}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#29235D] to-[#1D1845] text-[#D3B673] border border-[#D3B673] text-xs font-bold hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{isRTL ? 'تم حفظ الصورة بنجاح!' : 'Saved Successfully!'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#D3B673]" />
                <span>{isRTL ? 'حفظ الصورة وتطبيقها' : 'Save & Apply Avatar'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
