import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../lib/i18n';
import { SURAH_LIST, fetchAyahFromAPI, getAyahText, SurahMeta } from '../../data/quranData';
import { ScreenSnippetModal } from './ScreenSnippetModal';
import {
  FileText,
  Image as ImageIcon,
  BookOpen,
  Camera,
  Link as LinkIcon,
  Upload,
  X,
  Sparkles,
  Search,
  Check,
  Globe,
  Monitor,
  Clipboard,
  AlertCircle,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Copy,
} from 'lucide-react';

export type InsertCategory = 'FILE' | 'IMAGE' | 'AYAH' | 'SCREENSHOT';

export interface InsertItemPayload {
  type: 'file' | 'image' | 'ayah' | 'text' | 'screenshot';
  title?: string;
  url?: string;
  fileDataUrl?: string;
  fileName?: string;
  fileSize?: string;
  text?: string;
  surahNumber?: number;
  surahName?: string;
  ayahNumber?: number;
  fontSize?: number;
  color?: string;
  width?: number;
  height?: number;
}

interface WhiteboardInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmInsert: (payload: InsertItemPayload) => void;
  defaultCategory?: InsertCategory;
}

export const WhiteboardInsertModal: React.FC<WhiteboardInsertModalProps> = ({
  isOpen,
  onClose,
  onConfirmInsert,
  defaultCategory = 'AYAH',
}) => {
  const { isRTL } = useI18n();
  const [activeTab, setActiveTab] = useState<InsertCategory>(defaultCategory);

  // File Sub-tab & State
  const [fileMode, setFileMode] = useState<'LINK' | 'COMPUTER'>('COMPUTER');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [fileTitle, setFileTitle] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('');
  const [uploadedFileData, setUploadedFileData] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Image Sub-tab & State
  const [imageMode, setImageMode] = useState<'LINK' | 'COMPUTER'>('COMPUTER');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageCaption, setImageCaption] = useState<string>('');
  const [uploadedImageData, setUploadedImageData] = useState<string>('');
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  // Quran Ayah State
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(1);
  const [selectedAyahNum, setSelectedAyahNum] = useState<number>(1);
  const [ayahCustomText, setAyahCustomText] = useState<string>('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
  const [isLoadingAyah, setIsLoadingAyah] = useState<boolean>(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState<string>('');
  const [ayahFontSize, setAyahFontSize] = useState<number>(30);

  // Screenshot & Snipping Studio State
  const [rawCapturedImage, setRawCapturedImage] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState<boolean>(false);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  // Fetch verse dynamically whenever surah or ayah changes
  useEffect(() => {
    let isMounted = true;
    const loadVerse = async () => {
      setIsLoadingAyah(true);
      try {
        const text = await fetchAyahFromAPI(selectedSurahNum, selectedAyahNum);
        if (isMounted) {
          setAyahCustomText(text);
          setIsLoadingAyah(false);
        }
      } catch (err) {
        if (isMounted) {
          const fallback = getAyahText(selectedSurahNum, selectedAyahNum);
          setAyahCustomText(fallback);
          setIsLoadingAyah(false);
        }
      }
    };
    loadVerse();
    return () => {
      isMounted = false;
    };
  }, [selectedSurahNum, selectedAyahNum]);

  if (!isOpen) return null;

  const currentSurah = SURAH_LIST.find(s => s.number === selectedSurahNum) || SURAH_LIST[0];

  const filteredSurahs = SURAH_LIST.filter(s =>
    s.nameArabic.includes(surahSearchQuery) ||
    s.nameEnglish.toLowerCase().includes(surahSearchQuery.toLowerCase()) ||
    String(s.number).includes(surahSearchQuery)
  );

  // Surah change
  const handleSurahChange = (surahNum: number) => {
    setSelectedSurahNum(surahNum);
    setSelectedAyahNum(1);
  };

  // Next / Prev Ayah Navigation
  const handleNextAyah = () => {
    if (selectedAyahNum < currentSurah.ayahCount) {
      setSelectedAyahNum(prev => prev + 1);
    } else if (selectedSurahNum < 114) {
      setSelectedSurahNum(prev => prev + 1);
      setSelectedAyahNum(1);
    }
  };

  const handlePrevAyah = () => {
    if (selectedAyahNum > 1) {
      setSelectedAyahNum(prev => prev - 1);
    } else if (selectedSurahNum > 1) {
      const prevSurah = SURAH_LIST.find(s => s.number === selectedSurahNum - 1);
      setSelectedSurahNum(prev => prev - 1);
      setSelectedAyahNum(prevSurah ? prevSurah.ayahCount : 1);
    }
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setUploadedFileName(file.name);
    setUploadedFileSize(sizeFormatted);
    setFileTitle(file.name.replace(/\.[^/.]+$/, ''));

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedFileData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImageData(event.target?.result as string);
      if (!imageCaption) {
        setImageCaption(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  // Live Screen Capture & Launch Area Snipping Tool Directly
  const handleTriggerScreenCapture = async () => {
    setCaptureError(null);
    setIsCapturing(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error(isRTL ? 'متصفحك لا يدعم ميزة تصوير الشاشة المباشر' : 'Display media is not supported by your browser');
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: 'browser' } as any,
        audio: false,
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.muted = true;

      video.onloadedmetadata = () => {
        setTimeout(() => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            // Save raw image and open crop/snipping studio directly
            setRawCapturedImage(dataUrl);
            setIsCropModalOpen(true);
          }
          // Stop stream tracks
          stream.getTracks().forEach(track => track.stop());
          setIsCapturing(false);
        }, 500);
      };
    } catch (err: any) {
      setIsCapturing(false);
      if (err.name !== 'NotAllowedError') {
        setCaptureError(err.message || (isRTL ? 'تعذر التقاط الشاشة' : 'Could not capture screen'));
      }
    }
  };

  // Confirm Snipping / Crop from Modal
  const handleConfirmCroppedImage = (croppedDataUrl: string) => {
    setScreenshotData(croppedDataUrl);
    setIsCropModalOpen(false);
  };

  // Submit Handler
  const handleConfirm = () => {
    if (activeTab === 'FILE') {
      if (fileMode === 'COMPUTER' && uploadedFileData) {
        onConfirmInsert({
          type: 'file',
          title: fileTitle || uploadedFileName || 'مستند تعليمي',
          fileName: uploadedFileName,
          fileSize: uploadedFileSize,
          fileDataUrl: uploadedFileData,
        });
      } else if (fileMode === 'LINK' && fileUrl) {
        onConfirmInsert({
          type: 'file',
          title: fileTitle || 'رابط ملف دراسي',
          url: fileUrl,
          fileName: fileTitle || 'رابط خارجي',
        });
      }
    } else if (activeTab === 'IMAGE') {
      const src = imageMode === 'COMPUTER' ? uploadedImageData : imageUrl;
      if (src) {
        onConfirmInsert({
          type: 'image',
          title: imageCaption || 'صورة توضيحية',
          url: imageMode === 'LINK' ? imageUrl : undefined,
          fileDataUrl: imageMode === 'COMPUTER' ? uploadedImageData : undefined,
        });
      }
    } else if (activeTab === 'AYAH') {
      onConfirmInsert({
        type: 'ayah',
        text: ayahCustomText,
        surahNumber: selectedSurahNum,
        surahName: currentSurah.nameArabic,
        ayahNumber: selectedAyahNum,
        fontSize: ayahFontSize,
        title: `سورة ${currentSurah.nameArabic} - الآية ${selectedAyahNum}`,
      });
    } else if (activeTab === 'SCREENSHOT') {
      if (screenshotData) {
        onConfirmInsert({
          type: 'screenshot',
          title: isRTL ? 'لقطة شاشة محددة' : 'Whiteboard Screenshot',
          fileDataUrl: screenshotData,
        });
      }
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#29235D]/15 shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#29235D] to-[#1D1845] text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#D3B673]/20 border border-[#D3B673]/40 flex items-center justify-center text-[#D3B673]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white font-serif">
                  {isRTL ? 'قائمة الإدراج في السبورة الذكية' : 'Smart Whiteboard Insert Menu'}
                </h3>
                <p className="text-[11px] text-[#E8D5A3]">
                  {isRTL ? 'اختر العنصر ثم حدد موقعه على السبورة بنقرة واحدة' : 'Select element then click on canvas to place'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main 4 Primary Tabs */}
          <div className="bg-[#F8F6F0] p-2 border-b border-gray-200 flex items-center gap-1.5 flex-shrink-0 overflow-x-auto text-xs font-bold">
            
            {/* 1. Quran Ayah Tab */}
            <button
              onClick={() => setActiveTab('AYAH')}
              className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'AYAH'
                  ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                  : 'text-[#29235D] hover:bg-white/80'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{isRTL ? 'آية قرآنية' : 'Quranic Ayah'}</span>
            </button>

            {/* 2. Screenshot Tab */}
            <button
              onClick={() => setActiveTab('SCREENSHOT')}
              className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'SCREENSHOT'
                  ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                  : 'text-[#29235D] hover:bg-white/80'
              }`}
            >
              <Scissors className="w-4 h-4" />
              <span>{isRTL ? 'قص وتحديد الشاشة' : 'Screenshot & Snip'}</span>
            </button>

            {/* 3. Image Tab */}
            <button
              onClick={() => setActiveTab('IMAGE')}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'IMAGE'
                  ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                  : 'text-[#29235D] hover:bg-white/80'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>{isRTL ? 'صورة' : 'Image'}</span>
            </button>

            {/* 4. File Tab */}
            <button
              onClick={() => setActiveTab('FILE')}
              className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'FILE'
                  ? 'bg-[#29235D] text-[#D3B673] shadow-xs'
                  : 'text-[#29235D] hover:bg-white/80'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{isRTL ? 'ملف' : 'File'}</span>
            </button>

          </div>

          {/* Tab Contents */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
            
            {/* TAB 1: QURANIC AYAH (السورة والآية الدقيقة لجميع الـ 114 سورة) */}
            {activeTab === 'AYAH' && (
              <div className="space-y-4">
                <div className="bg-[#FBF9F4] p-3 rounded-2xl border border-[#D3B673]/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#D3B673]" />
                    <span className="font-bold text-[#29235D]">
                      {isRTL ? 'اختيار أي سورة وأي آية من القرآن الكريم كاملاً (114 سورة)' : 'Select Surah & Ayah from complete Quran'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#29235D] font-mono bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                    {currentSurah.type === 'Meccan' ? (isRTL ? 'مكية' : 'Meccan') : (isRTL ? 'مدنية' : 'Medinan')} • {currentSurah.ayahCount} {isRTL ? 'آية' : 'Ayahs'}
                  </span>
                </div>

                {/* Surah & Ayah Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Surah Select with Search */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">
                      {isRTL ? 'السورة الكريمة' : 'Surah'}
                    </label>
                    <div className="relative mb-1.5">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5" />
                      <input
                        type="text"
                        placeholder={isRTL ? 'بحث عن سورة (بالاسم أو الرقم)...' : 'Search surah...'}
                        value={surahSearchQuery}
                        onChange={e => setSurahSearchQuery(e.target.value)}
                        className="w-full pl-3 pr-8 py-1.5 rounded-xl border border-gray-300 text-xs text-[#29235D] outline-none focus:border-[#29235D]"
                      />
                    </div>
                    <select
                      value={selectedSurahNum}
                      onChange={e => handleSurahChange(Number(e.target.value))}
                      size={4}
                      className="w-full p-2 rounded-xl border border-gray-300 bg-white font-bold text-[#29235D] outline-none text-xs"
                    >
                      {filteredSurahs.map(s => (
                        <option key={s.number} value={s.number} className="py-1">
                          {s.number}. {s.nameArabic} ({s.nameEnglish}) - {s.ayahCount} {isRTL ? 'آية' : 'ayahs'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ayah Select, Quick Stepper, & Font Size */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-700 font-bold mb-1">
                        {isRTL ? `رقم الآية (من 1 إلى ${currentSurah.ayahCount})` : `Ayah Number (1 to ${currentSurah.ayahCount})`}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handlePrevAyah}
                          className="p-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-[#29235D] cursor-pointer"
                          title={isRTL ? 'الآية السابقة' : 'Previous Ayah'}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={currentSurah.ayahCount}
                          value={selectedAyahNum}
                          onChange={e => {
                            const val = Math.max(1, Math.min(currentSurah.ayahCount, Number(e.target.value) || 1));
                            setSelectedAyahNum(val);
                          }}
                          className="flex-1 px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold text-[#29235D] text-sm text-center outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleNextAyah}
                          className="p-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-[#29235D] cursor-pointer"
                          title={isRTL ? 'الآية التالية' : 'Next Ayah'}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {isRTL ? `سورة ${currentSurah.nameArabic} تحتوي على ${currentSurah.ayahCount} آية` : `Total ${currentSurah.ayahCount} verses`}
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-bold mb-1">
                        {isRTL ? 'حجم خط الآية على السبورة' : 'Ayah Font Size'}
                      </label>
                      <div className="flex items-center gap-2 bg-[#FBF9F4] p-2 rounded-xl border border-gray-200">
                        <input
                          type="range"
                          min="20"
                          max="46"
                          step="2"
                          value={ayahFontSize}
                          onChange={e => setAyahFontSize(Number(e.target.value))}
                          className="flex-1 accent-[#29235D]"
                        />
                        <span className="font-mono font-bold text-[#29235D] text-xs">{ayahFontSize}px</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Textarea Preview / Edit Quranic Text */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-gray-700 font-bold flex items-center gap-1.5">
                      <span>{isRTL ? 'نص الآية الكريمة (رسم عثماني مشكول)' : 'Quranic Verse Text'}</span>
                      {isLoadingAyah && <Loader2 className="w-3.5 h-3.5 text-[#D3B673] animate-spin" />}
                    </label>
                    <span className="text-[10px] text-[#D3B673] font-bold bg-[#29235D] px-2 py-0.5 rounded">
                      خط المصحف الشريف 📜
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={ayahCustomText}
                    onChange={e => setAyahCustomText(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-[#D3B673]/50 bg-[#FDFBF7] text-[#29235D] font-serif text-lg leading-relaxed text-right outline-none focus:ring-2 focus:ring-[#29235D]"
                    dir="rtl"
                  />
                </div>

                {/* Live Islamic Card Preview */}
                <div className="bg-gradient-to-r from-[#29235D] via-[#221D4E] to-[#17133B] p-4 rounded-2xl text-white text-center shadow-md border-2 border-[#D3B673]">
                  <div className="flex items-center justify-between border-b border-[#D3B673]/30 pb-2 mb-2">
                    <span className="text-xs font-bold text-[#D3B673] flex items-center gap-1">
                      <span>📖</span>
                      <span>{isRTL ? `سورة ${currentSurah.nameArabic}` : `Surah ${currentSurah.nameEnglish}`}</span>
                    </span>
                    <span className="text-xs font-bold text-[#E8D5A3]">
                      {isRTL ? `الآية ${selectedAyahNum}` : `Ayah ${selectedAyahNum}`}
                    </span>
                  </div>
                  <p className="font-serif text-lg sm:text-xl text-[#FFFFFF] leading-loose px-2 py-2 select-text" dir="rtl">
                    {isLoadingAyah ? (
                      <span className="text-gray-400 text-sm flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#D3B673]" />
                        <span>{isRTL ? 'جاري جلب نص الآية من المصحف...' : 'Loading ayah...'}</span>
                      </span>
                    ) : (
                      ayahCustomText
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: SCREENSHOT & AREA SNIPPING (قص وتحديد لقطة الشاشة مباشرة) */}
            {activeTab === 'SCREENSHOT' && (
              <div className="space-y-4">
                <div className="bg-[#FBF9F4] p-3 rounded-2xl border border-[#D3B673]/30 space-y-1.5">
                  <p className="font-bold text-[#29235D] text-xs flex items-center gap-1.5">
                    <Scissors className="w-4 h-4 text-[#D3B673]" />
                    <span>{isRTL ? 'أداة قص وتحديد لقطات الشاشة المباشرة' : 'Live Screen Snipping & Cropping'}</span>
                  </p>
                  <p className="text-[11px] text-gray-600">
                    {isRTL
                      ? 'التقط الشاشة وسيفتح لك فوراً ستوديو القص التفاعلي لتحديد وقص الجزء الذي تريده بدقة.'
                      : 'Capture screen and interactively drag the golden crop box to choose the exact snippet.'}
                  </p>
                </div>

                {captureError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{captureError}</span>
                  </div>
                )}

                {/* Main Capture Triggers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Button 1: Live Capture and Crop */}
                  <button
                    type="button"
                    disabled={isCapturing}
                    onClick={handleTriggerScreenCapture}
                    className="p-5 rounded-2xl bg-gradient-to-r from-[#29235D] to-[#1D1845] hover:brightness-110 text-white font-bold flex flex-col items-center justify-center gap-2 transition-all shadow-md cursor-pointer border-2 border-[#D3B673]/40 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#D3B673]/20 flex items-center justify-center text-[#D3B673] group-hover:scale-110 transition-transform">
                      <Scissors className="w-6 h-6" />
                    </div>
                    <span className="text-sm">
                      {isCapturing ? (isRTL ? 'جاري التقاط الشاشة...' : 'Capturing...') : (isRTL ? '📸 التقاط وتحديد جزء من الشاشة' : '📸 Snip & Crop Live Screen')}
                    </span>
                    <span className="text-[10px] text-[#E8D5A3]">
                      {isRTL ? 'يفتح إطار التحديد الذهبي للقص فوراً' : 'Opens interactive crop box'}
                    </span>
                  </button>

                  {/* Button 2: Upload Image & Crop */}
                  <label className="p-5 rounded-2xl bg-white hover:bg-[#FBF9F4] text-[#29235D] font-bold flex flex-col items-center justify-center gap-2 transition-all border-2 border-dashed border-gray-300 hover:border-[#29235D] shadow-xs cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#29235D]/10 flex items-center justify-center text-[#29235D] group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-[#D3B673]" />
                    </div>
                    <span className="text-sm">{isRTL ? 'رفع صورة من الحاسوب وقصها' : 'Upload Image & Snip'}</span>
                    <span className="text-[10px] text-gray-500">
                      {isRTL ? 'PNG, JPG, WEBP مع أداة القص' : 'PNG, JPG, WEBP with Cropper'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = ev => {
                          const dataUrl = ev.target?.result as string;
                          setRawCapturedImage(dataUrl);
                          setIsCropModalOpen(true);
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="hidden"
                    />
                  </label>

                </div>

                {/* Screenshot Result Preview */}
                {screenshotData && (
                  <div className="p-3 bg-[#F8F6F0] rounded-2xl border border-gray-300 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        ✓ {isRTL ? 'تم قص وتجهيز لقطة الشاشة المحددة' : 'Cropped Snippet Ready'}
                      </span>
                      <div className="flex items-center gap-2">
                        {rawCapturedImage && (
                          <button
                            type="button"
                            onClick={() => setIsCropModalOpen(true)}
                            className="text-xs text-[#29235D] font-bold hover:underline flex items-center gap-1"
                          >
                            <Scissors className="w-3 h-3" />
                            <span>{isRTL ? 'تعديل القص' : 'Edit Crop'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setScreenshotData(null)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          {isRTL ? 'حذف' : 'Remove'}
                        </button>
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-inner flex items-center justify-center">
                      <img
                        src={screenshotData}
                        alt="Cropped Snippet"
                        className="max-h-48 rounded-lg object-contain border border-gray-300 shadow-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: IMAGE (صورة: رابط / رفع) */}
            {activeTab === 'IMAGE' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-[#F8F6F0] p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setImageMode('COMPUTER')}
                    className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                      imageMode === 'COMPUTER'
                        ? 'bg-white text-[#29235D] shadow-xs'
                        : 'text-gray-600 hover:text-[#29235D]'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'من الحاسوب' : 'From Computer'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('LINK')}
                    className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                      imageMode === 'LINK'
                        ? 'bg-white text-[#29235D] shadow-xs'
                        : 'text-gray-600 hover:text-[#29235D]'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'رابط ويب (URL)' : 'Web URL Link'}</span>
                  </button>
                </div>

                {imageMode === 'COMPUTER' ? (
                  <div className="space-y-3">
                    <input
                      type="file"
                      ref={imageInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="border-2 border-dashed border-[#29235D]/30 hover:border-[#29235D] bg-[#FBF9F4] hover:bg-[#F3EFE6] rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
                    >
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-xs border border-gray-200 text-[#29235D]">
                        <ImageIcon className="w-6 h-6 text-[#D3B673]" />
                      </div>
                      <div>
                        <p className="font-bold text-[#29235D] text-xs">
                          {isRTL ? 'انقر لاختيار صورة من جهازك' : 'Click to select image'}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">PNG, JPG, WEBP, GIF</p>
                      </div>
                    </div>

                    {uploadedImageData && (
                      <div className="p-3 bg-[#F8F6F0] rounded-2xl border border-gray-200 space-y-2">
                        <img
                          src={uploadedImageData}
                          alt="Uploaded"
                          className="max-h-36 mx-auto rounded-xl object-contain border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-600 font-bold mb-1">
                        {isRTL ? 'رابط الصورة المباشر' : 'Direct Image URL'}
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com/image.png"
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-[#29235D] outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-gray-600 font-bold mb-1">
                    {isRTL ? 'وصف أو تعليق توضيحي للصورة (اختياري)' : 'Image Caption'}
                  </label>
                  <input
                    type="text"
                    placeholder={isRTL ? 'مثال: مخطط مخارج الحروف الشفوية' : 'e.g. Articulation diagram'}
                    value={imageCaption}
                    onChange={e => setImageCaption(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-[#29235D] outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: FILE (ملف: رابط / رفع) */}
            {activeTab === 'FILE' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-[#F8F6F0] p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setFileMode('COMPUTER')}
                    className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                      fileMode === 'COMPUTER'
                        ? 'bg-white text-[#29235D] shadow-xs'
                        : 'text-gray-600 hover:text-[#29235D]'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'من الحاسوب (PDF, Word)' : 'From Computer'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFileMode('LINK')}
                    className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                      fileMode === 'LINK'
                        ? 'bg-white text-[#29235D] shadow-xs'
                        : 'text-gray-600 hover:text-[#29235D]'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'رابط ملف سحابي' : 'File Web Link'}</span>
                  </button>
                </div>

                {fileMode === 'COMPUTER' ? (
                  <div className="space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-[#29235D]/30 hover:border-[#29235D] bg-[#FBF9F4] hover:bg-[#F3EFE6] rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
                    >
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-xs border border-gray-200 text-[#29235D]">
                        <FileText className="w-6 h-6 text-[#D3B673]" />
                      </div>
                      <div>
                        <p className="font-bold text-[#29235D] text-xs">
                          {isRTL ? 'انقر لاختيار مستند من حاسوبك' : 'Click to select file'}
                        </p>
                        <p className="text-[10px] text-gray-500 mt-0.5">PDF, DOC, DOCX, PPTX, TXT</p>
                      </div>
                    </div>

                    {uploadedFileName && (
                      <div className="flex items-center justify-between bg-[#F8F6F0] p-3 rounded-2xl border border-gray-200">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-xl bg-[#29235D] text-[#D3B673]">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-[#29235D] text-xs truncate max-w-[200px]">
                              {uploadedFileName}
                            </p>
                            <span className="text-[10px] text-gray-500 font-mono">{uploadedFileSize}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          ✓ {isRTL ? 'مكتمل' : 'Loaded'}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-600 font-bold mb-1">
                        {isRTL ? 'رابط الملف (Google Drive, Dropbox, إلخ)' : 'File URL Link'}
                      </label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/..."
                        value={fileUrl}
                        onChange={e => setFileUrl(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-[#29235D] outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-gray-600 font-bold mb-1">
                    {isRTL ? 'عنوان أو اسم الملف' : 'File Title'}
                  </label>
                  <input
                    type="text"
                    placeholder={isRTL ? 'مثال: مذكرة أحكام التجويد الشاملة' : 'e.g. Comprehensive Tajweed Guide'}
                    value={fileTitle}
                    onChange={e => setFileTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs text-[#29235D] outline-none"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Footer with Click-to-Place Guidance & Confirmation */}
          <div className="p-4 bg-[#F8F6F0] border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
              <span className="text-base">🎯</span>
              <span>
                {isRTL
                  ? 'عند الضغط على "تأكيد وإدراج"، انقر بالمؤشر على السبورة لتحديد مكان العنصر بدقة.'
                  : 'After confirming, click on the whiteboard to set the exact position.'}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 font-bold cursor-pointer"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-[#29235D] to-[#1D1845] text-[#D3B673] hover:brightness-110 font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5 border border-[#D3B673]/40"
              >
                <Check className="w-4 h-4" />
                <span>{isRTL ? 'تأكيد وتحديد المكان على السبورة' : 'Place on Whiteboard'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Screen Snipping Studio Modal */}
      {isCropModalOpen && rawCapturedImage && (
        <ScreenSnippetModal
          isOpen={isCropModalOpen}
          imageDataUrl={rawCapturedImage}
          onClose={() => setIsCropModalOpen(false)}
          onConfirmCrop={handleConfirmCroppedImage}
          onRetake={handleTriggerScreenCapture}
        />
      )}
    </>
  );
};
