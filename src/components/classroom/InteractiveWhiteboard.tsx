import React, { useRef, useState, useEffect } from 'react';
import { useI18n } from '../../lib/i18n';
import { useApp } from '../../context/AppContext';
import {
  Pencil,
  Highlighter,
  Eraser,
  Square,
  Circle,
  Minus,
  ArrowUpRight,
  Type,
  StickyNote,
  RotateCcw,
  RotateCw,
  Trash2,
  Download,
  Plus,
  BookOpen,
  Sparkles,
  Layers,
  Save,
  Check,
  Presentation,
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface DrawAction {
  id: string;
  type: 'freehand' | 'highlighter' | 'rect' | 'circle' | 'line' | 'arrow' | 'text' | 'sticky';
  color: string;
  size: number;
  points: Point[];
  text?: string;
  fontSize?: number;
}

export const InteractiveWhiteboard: React.FC = () => {
  const { t, isRTL } = useI18n();
  const { currentUser, hasTeacherPermission } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const canUseWhiteboard = hasTeacherPermission('canAccessWhiteboard');

  const [activeTool, setActiveTool] = useState<
    'pen' | 'highlighter' | 'eraser' | 'rect' | 'circle' | 'line' | 'arrow' | 'text' | 'sticky'
  >('pen');
  const [selectedColor, setSelectedColor] = useState<string>('#29235D');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pagesData, setPagesData] = useState<{ [page: number]: DrawAction[] }>({
    1: [],
    2: [],
  });
  const [redoStack, setRedoStack] = useState<{ [page: number]: DrawAction[] }>({
    1: [],
    2: [],
  });
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showArabicTemplates, setShowArabicTemplates] = useState<boolean>(false);

  const currentActions = pagesData[currentPage] || [];

  const brandColors = [
    { name: 'AITEC Navy', value: '#29235D' },
    { name: 'AITEC Gold', value: '#D3B673' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Crimson', value: '#EF4444' },
    { name: 'Royal Blue', value: '#3B82F6' },
    { name: 'Dark Slate', value: '#1E293B' },
  ];

  // Redraw canvas on state changes
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background to warm ivory grid
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines
    ctx.strokeStyle = '#F1ECE1';
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw all actions
    currentActions.forEach(action => {
      ctx.save();
      ctx.strokeStyle = action.color;
      ctx.fillStyle = action.color;
      ctx.lineWidth = action.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (action.type === 'highlighter') {
        ctx.globalAlpha = 0.35;
        ctx.lineWidth = action.size * 3;
      }

      if (action.type === 'freehand' || action.type === 'highlighter') {
        if (action.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(action.points[0].x, action.points[0].y);
          for (let i = 1; i < action.points.length; i++) {
            ctx.lineTo(action.points[i].x, action.points[i].y);
          }
          ctx.stroke();
        }
      } else if (action.type === 'rect' && action.points.length >= 2) {
        const start = action.points[0];
        const end = action.points[action.points.length - 1];
        ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      } else if (action.type === 'circle' && action.points.length >= 2) {
        const start = action.points[0];
        const end = action.points[action.points.length - 1];
        const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (action.type === 'line' && action.points.length >= 2) {
        const start = action.points[0];
        const end = action.points[action.points.length - 1];
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      } else if (action.type === 'arrow' && action.points.length >= 2) {
        const start = action.points[0];
        const end = action.points[action.points.length - 1];
        const headlen = 15;
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.lineTo(
          end.x - headlen * Math.cos(angle - Math.PI / 6),
          end.y - headlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headlen * Math.cos(angle + Math.PI / 6),
          end.y - headlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      } else if (action.type === 'text' && action.points.length > 0) {
        ctx.font = `700 ${action.fontSize || 24}px 'Amiri', 'Cairo', serif`;
        ctx.fillText(action.text || '', action.points[0].x, action.points[0].y);
      } else if (action.type === 'sticky' && action.points.length > 0) {
        const p = action.points[0];
        ctx.fillStyle = '#FEF3C7';
        ctx.strokeStyle = '#D3B673';
        ctx.lineWidth = 2;
        ctx.fillRect(p.x, p.y, 220, 100);
        ctx.strokeRect(p.x, p.y, 220, 100);
        ctx.fillStyle = '#29235D';
        ctx.font = "600 15px 'Cairo', sans-serif";
        ctx.fillText(action.text || 'ملاحظة المعلم', p.x + 12, p.y + 35);
      }

      ctx.restore();
    });
  };

  useEffect(() => {
    redrawCanvas();
  }, [currentActions, currentPage]);

  // Adjust canvas size to parent container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = Math.max(800, rect.width - 2);
      canvas.height = 620;
      redrawCanvas();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);
    setIsDrawing(true);

    if (activeTool === 'eraser') {
      // Find nearest action and remove it
      const filtered = currentActions.filter(act => {
        const isNear = act.points.some(
          p => Math.sqrt(Math.pow(p.x - pt.x, 2) + Math.pow(p.y - pt.y, 2)) < 25
        );
        return !isNear;
      });
      setPagesData(prev => ({ ...prev, [currentPage]: filtered }));
      return;
    }

    if (activeTool === 'text') {
      const promptText = window.prompt('Enter Arabic or English text to insert:', 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ');
      if (promptText) {
        const newAction: DrawAction = {
          id: `act-${Date.now()}`,
          type: 'text',
          color: selectedColor,
          size: strokeWidth,
          points: [pt],
          text: promptText,
          fontSize: 28,
        };
        setPagesData(prev => ({
          ...prev,
          [currentPage]: [...(prev[currentPage] || []), newAction],
        }));
      }
      setIsDrawing(false);
      return;
    }

    if (activeTool === 'sticky') {
      const promptText = window.prompt('Enter teacher note:', 'تنبيه: مخرج حرف القاف من أقصى اللسان مع الحنك الأعلى');
      if (promptText) {
        const newAction: DrawAction = {
          id: `act-${Date.now()}`,
          type: 'sticky',
          color: selectedColor,
          size: strokeWidth,
          points: [pt],
          text: promptText,
        };
        setPagesData(prev => ({
          ...prev,
          [currentPage]: [...(prev[currentPage] || []), newAction],
        }));
      }
      setIsDrawing(false);
      return;
    }

    // Shapes or Freehand
    const newAction: DrawAction = {
      id: `act-${Date.now()}`,
      type: activeTool === 'highlighter' ? 'highlighter' : activeTool === 'pen' ? 'freehand' : activeTool,
      color: selectedColor,
      size: strokeWidth,
      points: [pt],
    };

    setPagesData(prev => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), newAction],
    }));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const pt = getCanvasCoords(e);

    if (activeTool === 'eraser') {
      const filtered = currentActions.filter(act => {
        const isNear = act.points.some(
          p => Math.sqrt(Math.pow(p.x - pt.x, 2) + Math.pow(p.y - pt.y, 2)) < 25
        );
        return !isNear;
      });
      setPagesData(prev => ({ ...prev, [currentPage]: filtered }));
      return;
    }

    setPagesData(prev => {
      const list = [...(prev[currentPage] || [])];
      if (list.length === 0) return prev;
      const last = { ...list[list.length - 1] };
      if (last.type === 'freehand' || last.type === 'highlighter') {
        last.points = [...last.points, pt];
      } else {
        last.points = [last.points[0], pt];
      }
      list[list.length - 1] = last;
      return { ...prev, [currentPage]: list };
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (currentActions.length === 0) return;
    const last = currentActions[currentActions.length - 1];
    setPagesData(prev => ({
      ...prev,
      [currentPage]: prev[currentPage].slice(0, -1),
    }));
    setRedoStack(prev => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), last],
    }));
  };

  const handleRedo = () => {
    const redoList = redoStack[currentPage] || [];
    if (redoList.length === 0) return;
    const last = redoList[redoList.length - 1];
    setRedoStack(prev => ({
      ...prev,
      [currentPage]: prev[currentPage].slice(0, -1),
    }));
    setPagesData(prev => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), last],
    }));
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear this page on the whiteboard?')) {
      setPagesData(prev => ({ ...prev, [currentPage]: [] }));
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `AITEC-Whiteboard-Page-${currentPage}.png`;
    link.href = dataUrl;
    link.click();
  };

  const insertArabicTemplate = (text: string) => {
    const canvas = canvasRef.current;
    const centerX = canvas ? canvas.width / 2 - 150 : 250;
    const centerY = canvas ? canvas.height / 2 - 30 : 200;

    const newAction: DrawAction = {
      id: `act-${Date.now()}`,
      type: 'text',
      color: '#29235D',
      size: 4,
      points: [{ x: centerX, y: centerY }],
      text,
      fontSize: 36,
    };

    setPagesData(prev => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), newAction],
    }));
    setShowArabicTemplates(false);
  };

  if (!canUseWhiteboard) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-[#29235D]/10 shadow-xs space-y-4">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-200">
          <Presentation className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-[#29235D] font-serif">
          {isRTL ? 'صلاحية السبورة التفاعلية مقيدة' : 'Interactive Whiteboard Restricted'}
        </h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          {isRTL
            ? 'تم تقييد الوصول إلى السبورة التفاعلية لحسابك من قِبل المشرف العام. يُرجى مراجعة إدارة المنصة لتفعيل هذه الميزة.'
            : 'Access to the interactive whiteboard has been restricted for your teacher profile by the General Supervisor.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#29235D]/15 shadow-xl overflow-hidden">
      
      {/* Header Toolbar */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-[#29235D] to-[#1D1845] text-white flex flex-wrap items-center justify-between gap-3">
        
        {/* Title & Page Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#D3B673] text-[#29235D] font-bold">
              <Presentation className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#E8D5A3] font-serif">
                {t('whiteboard')}
              </h2>
              <p className="text-[10px] text-white/70">AITEC Interactive Digital Canvas</p>
            </div>
          </div>

          {/* Page Tabs */}
          <div className="flex items-center bg-black/20 p-1 rounded-xl border border-white/10 ml-2">
            {[1, 2, 3].map(pageNum => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentPage === pageNum
                    ? 'bg-[#D3B673] text-[#29235D] shadow-xs'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                {t('page')} {pageNum}
              </button>
            ))}
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Insert Arabic Quranic Template dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowArabicTemplates(!showArabicTemplates)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-[#D3B673]/40 text-[#E8D5A3] text-xs font-bold transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#D3B673]" />
              <span className="hidden sm:inline">{t('insertAyah')}</span>
            </button>

            {showArabicTemplates && (
              <div
                className={`absolute ${
                  isRTL ? 'left-0' : 'right-0'
                } mt-2 w-72 bg-white border border-[#29235D]/15 rounded-2xl shadow-xl p-3 z-50 text-[#29235D] animate-in fade-in`}
              >
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Insert Quranic / Calligraphy Text
                </p>
                <div className="space-y-1.5">
                  <button
                    onClick={() => insertArabicTemplate('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')}
                    className="w-full text-right font-quran p-2 rounded-xl text-lg hover:bg-[#F8F6F0] border border-gray-100 transition-all text-[#29235D]"
                  >
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </button>
                  <button
                    onClick={() => insertArabicTemplate('﴿ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴾')}
                    className="w-full text-right font-quran p-2 rounded-xl text-lg hover:bg-[#F8F6F0] border border-gray-100 transition-all text-[#29235D]"
                  >
                    ﴿ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴾
                  </button>
                  <button
                    onClick={() => insertArabicTemplate('أحكام النون الساكنة: الإظهار، الإدغام، الإقلاب، الإخفاء')}
                    className="w-full text-right font-arabic p-2 rounded-xl text-xs font-bold hover:bg-[#F8F6F0] border border-gray-100 transition-all text-[#29235D]"
                  >
                    أحكام النون الساكنة والتنوين
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10"
            title="Download PNG snapshot"
          >
            <Download className="w-3.5 h-3.5 text-[#D3B673]" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => {
              setSavedSuccess(true);
              setTimeout(() => setSavedSuccess(false), 2000);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#D3B673] hover:bg-[#E8D5A3] text-[#29235D] text-xs font-bold transition-all shadow-xs"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? 'Saved!' : 'Save State'}</span>
          </button>
        </div>

      </div>

      {/* Floating Tools Dock */}
      <div className="p-3 bg-[#FBF9F4] border-b border-[#29235D]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Drawing Tools */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTool('pen')}
            className={`p-2 rounded-xl border font-bold flex items-center gap-1 transition-all ${
              activeTool === 'pen'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D]'
                : 'bg-white text-[#29235D] border-gray-200 hover:bg-gray-50'
            }`}
            title="Pen"
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">{t('pen')}</span>
          </button>

          <button
            onClick={() => setActiveTool('highlighter')}
            className={`p-2 rounded-xl border font-bold flex items-center gap-1 transition-all ${
              activeTool === 'highlighter'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D]'
                : 'bg-white text-[#29235D] border-gray-200 hover:bg-gray-50'
            }`}
            title="Highlighter"
          >
            <Highlighter className="w-4 h-4" />
            <span className="hidden sm:inline">{t('highlighter')}</span>
          </button>

          <button
            onClick={() => setActiveTool('eraser')}
            className={`p-2 rounded-xl border font-bold flex items-center gap-1 transition-all ${
              activeTool === 'eraser'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D]'
                : 'bg-white text-[#29235D] border-gray-200 hover:bg-gray-50'
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
            <span className="hidden sm:inline">{t('eraser')}</span>
          </button>

          <div className="h-5 w-[1px] bg-gray-300 mx-1" />

          {/* Shapes */}
          <button
            onClick={() => setActiveTool('rect')}
            className={`p-2 rounded-xl border font-bold transition-all ${
              activeTool === 'rect'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D]'
                : 'bg-white text-[#29235D] border-gray-200 hover:bg-gray-50'
            }`}
            title="Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('circle')}
            className={`p-2 rounded-xl border font-bold transition-all ${
              activeTool === 'circle'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D]'
                : 'bg-white text-[#29235D] border-gray-200 hover:bg-gray-50'
            }`}
            title="Circle"
          >
            <Circle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('line')}
            className={`p-2 rounded-xl border font-bold transition-all ${
              activeTool === 'line'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D]'
                : 'bg-white text-[#29235D] border-gray-200 hover:bg-gray-50'
            }`}
            title="Line"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('arrow')}
            className={`p-2 rounded-xl border font-bold transition-all ${
              activeTool === 'arrow'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D]'
                : 'bg-white text-[#29235D] border-gray-200 hover:bg-gray-50'
            }`}
            title="Arrow"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setActiveTool('text')}
            className={`p-2 rounded-xl border font-bold flex items-center gap-1 transition-all ${
              activeTool === 'text'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D]'
                : 'bg-white text-[#29235D] border-gray-200 hover:bg-gray-50'
            }`}
            title="Text Note"
          >
            <Type className="w-4 h-4" />
            <span className="hidden sm:inline">{t('textNote')}</span>
          </button>

          <button
            onClick={() => setActiveTool('sticky')}
            className={`p-2 rounded-xl border font-bold flex items-center gap-1 transition-all ${
              activeTool === 'sticky'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D]'
                : 'bg-white text-[#29235D] border-gray-200 hover:bg-gray-50'
            }`}
            title="Sticky Note"
          >
            <StickyNote className="w-4 h-4" />
            <span className="hidden sm:inline">Sticky</span>
          </button>
        </div>

        {/* Color Palette & Stroke Width */}
        <div className="flex items-center gap-3">
          {/* Color Circles */}
          <div className="flex items-center gap-1.5">
            {brandColors.map(c => (
              <button
                key={c.value}
                onClick={() => setSelectedColor(c.value)}
                className={`w-6 h-6 rounded-full transition-all flex items-center justify-center ${
                  selectedColor === c.value
                    ? 'ring-2 ring-offset-2 ring-[#29235D] scale-110'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>

          {/* Stroke Slider */}
          <div className="hidden sm:flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-gray-200">
            <span className="text-[10px] font-bold text-gray-500">Size</span>
            <input
              type="range"
              min="2"
              max="16"
              value={strokeWidth}
              onChange={e => setStrokeWidth(Number(e.target.value))}
              className="w-16 accent-[#D3B673]"
            />
            <span className="font-mono text-[10px] font-bold text-[#29235D] w-3">{strokeWidth}</span>
          </div>

          {/* Undo / Redo / Clear */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={currentActions.length === 0}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[#29235D] disabled:opacity-30"
              title={t('undo')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={(redoStack[currentPage] || []).length === 0}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[#29235D] disabled:opacity-30"
              title={t('redo')}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClear}
              className="p-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600"
              title={t('clearBoard')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Canvas Area */}
      <div className="relative w-full overflow-x-auto bg-[#FFFFFF] flex justify-center items-center cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="touch-none select-none block max-w-full"
        />
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#F8F6F0] border-t border-[#29235D]/10 flex items-center justify-between text-[11px] text-[#786F9A]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[#29235D]">
            {currentUser?.role === 'TEACHER' ? 'Teacher Live Host Mode' : 'Interactive Session Board'}
          </span>
        </div>
        <span>Total elements on page {currentPage}: {currentActions.length}</span>
      </div>

    </div>
  );
};
