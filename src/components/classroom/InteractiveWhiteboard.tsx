import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useI18n } from '../../lib/i18n';
import { useApp } from '../../context/AppContext';
import { WhiteboardInsertModal, InsertItemPayload, InsertCategory } from './WhiteboardInsertModal';
import { ScreenSnippetModal } from './ScreenSnippetModal';
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
  Camera,
  Image as ImageIcon,
  FileText,
  MousePointer,
  ChevronDown,
  X,
  Move,
  Link as LinkIcon,
  Upload,
  AlertCircle,
  Eye,
  Scissors,
  Flame,
  Grid,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

export type BoardTheme = 'white' | 'chalkboard' | 'slate' | 'parchment' | 'calligraphy';

export interface DrawAction {
  id: string;
  type: 'freehand' | 'highlighter' | 'rect' | 'circle' | 'line' | 'arrow' | 'text' | 'sticky' | 'image' | 'file' | 'ayah' | 'screenshot';
  color: string;
  size: number;
  points: Point[];
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  isBold?: boolean;
  title?: string;
  url?: string;
  fileDataUrl?: string;
  fileName?: string;
  fileSize?: string;
  surahName?: string;
  surahNumber?: number;
  ayahNumber?: number;
  width?: number;
  height?: number;
}

export const InteractiveWhiteboard: React.FC = () => {
  const { t, isRTL } = useI18n();
  const { currentUser, hasTeacherPermission, getStudentQuota } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const canUseWhiteboard = hasTeacherPermission('canAccessWhiteboard');
  const studentQuota = currentUser?.role === 'STUDENT' ? getStudentQuota(currentUser.id) : null;
  const isStudentQuotaDepleted = studentQuota ? studentQuota.remainingSessions <= 0 : false;

  // Board Theme
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('white');
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Tool Selection
  const [activeTool, setActiveTool] = useState<
    'pen' | 'highlighter' | 'laser' | 'eraser' | 'rect' | 'circle' | 'line' | 'arrow' | 'text' | 'sticky' | 'select' | 'snip'
  >('pen');

  const [selectedColor, setSelectedColor] = useState<string>('#29235D');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageList, setPageList] = useState<number[]>([1, 2, 3]);

  // Zoom Level
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Multi-page drawing data
  const [pagesData, setPagesData] = useState<{ [page: number]: DrawAction[] }>({
    1: [],
    2: [],
    3: [],
  });

  const [redoStack, setRedoStack] = useState<{ [page: number]: DrawAction[] }>({
    1: [],
    2: [],
    3: [],
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Laser Pointer Trail Points (auto-fading)
  const [laserPoints, setLaserPoints] = useState<{ x: number; y: number; time: number }[]>([]);
  const laserTimerRef = useRef<any>(null);

  // Board Snip & Crop Box
  const [isSnipSelecting, setIsSnipSelecting] = useState<boolean>(false);
  const [snipStart, setSnipStart] = useState<Point | null>(null);
  const [snipEnd, setSnipEnd] = useState<Point | null>(null);
  const [rawSnippedImage, setRawSnippedImage] = useState<string | null>(null);
  const [isSnippingStudioOpen, setIsSnippingStudioOpen] = useState<boolean>(false);

  // Insert Modal & Placement Mode
  const [isInsertModalOpen, setIsInsertModalOpen] = useState<boolean>(false);
  const [insertModalDefaultTab, setInsertModalDefaultTab] = useState<InsertCategory>('AYAH');
  const [isInsertDropdownOpen, setIsInsertDropdownOpen] = useState<boolean>(false);
  const [pendingInsertItem, setPendingInsertItem] = useState<InsertItemPayload | null>(null);
  const [placementNotice, setPlacementNotice] = useState<string | null>(null);

  // In-Place Floating Text Editor State
  const [inlineTextEditor, setInlineTextEditor] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    text: string;
    fontSize: number;
    color: string;
    fontFamily: string;
    actionId?: string;
  } | null>(null);

  // Selection & Drag State
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [isDraggingElement, setIsDraggingElement] = useState<boolean>(false);
  const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null);
  const [dragInitialElementPoint, setDragInitialElementPoint] = useState<Point | null>(null);

  // Image Element Cache for HTML5 Canvas rendering
  const imageCacheRef = useRef<{ [key: string]: HTMLImageElement }>({});

  const currentActions = pagesData[currentPage] || [];

  const brandColors = [
    { name: 'AITEC Navy', value: '#29235D' },
    { name: 'AITEC Gold', value: '#D3B673' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Crimson', value: '#EF4444' },
    { name: 'Royal Blue', value: '#3B82F6' },
    { name: 'Amber Glow', value: '#F59E0B' },
    { name: 'Pure White', value: '#FFFFFF' },
    { name: 'Dark Slate', value: '#1E293B' },
  ];

  // Helper to load image for canvas
  const getLoadedImage = useCallback((urlOrData: string, onLoaded?: () => void): HTMLImageElement | null => {
    if (imageCacheRef.current[urlOrData]) {
      return imageCacheRef.current[urlOrData];
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCacheRef.current[urlOrData] = img;
      if (onLoaded) onLoaded();
    };
    img.src = urlOrData;
    imageCacheRef.current[urlOrData] = img;
    return img;
  }, []);

  // Board Themes definition
  const getBoardBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (boardTheme === 'chalkboard') {
      // Classic Classroom Green Chalkboard
      ctx.fillStyle = '#1B4D3E';
      ctx.fillRect(0, 0, width, height);

      if (showGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        const gridSize = 35;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }
    } else if (boardTheme === 'slate') {
      // Dark Slate Luxury
      ctx.fillStyle = '#14112E';
      ctx.fillRect(0, 0, width, height);

      if (showGrid) {
        ctx.strokeStyle = 'rgba(211, 182, 115, 0.08)';
        ctx.lineWidth = 1;
        const gridSize = 35;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }
    } else if (boardTheme === 'parchment') {
      // Warm Quran Manuscript Parchment
      ctx.fillStyle = '#FAF6EC';
      ctx.fillRect(0, 0, width, height);

      // Islamic Golden Border Frame
      ctx.strokeStyle = 'rgba(211, 182, 115, 0.35)';
      ctx.lineWidth = 3;
      ctx.strokeRect(12, 12, width - 24, height - 24);

      ctx.strokeStyle = 'rgba(41, 35, 93, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(16, 16, width - 32, height - 32);

      if (showGrid) {
        ctx.strokeStyle = 'rgba(211, 182, 115, 0.12)';
        ctx.lineWidth = 1;
        const gridSize = 35;
        for (let y = 30; y < height - 20; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(25, y);
          ctx.lineTo(width - 25, y);
          ctx.stroke();
        }
      }
    } else if (boardTheme === 'calligraphy') {
      // Arabic Calligraphy Ruled Lines
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Base, Ascender, and Descender Guidelines
      const lineGap = 70;
      for (let y = 60; y < height; y += lineGap) {
        // Base line (solid gold)
        ctx.strokeStyle = '#D3B673';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        // Waist line (dashed slate)
        ctx.strokeStyle = 'rgba(41, 35, 93, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, y - 24);
        ctx.lineTo(width, y - 24);
        ctx.stroke();

        // Ascender line (dashed blue)
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.beginPath();
        ctx.moveTo(0, y - 44);
        ctx.lineTo(width, y - 44);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    } else {
      // Modern Whiteboard
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      if (showGrid) {
        ctx.strokeStyle = '#F1ECE1';
        ctx.lineWidth = 1;
        const gridSize = 30;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }
    }
  }, [boardTheme, showGrid]);

  // Canvas Redraw Logic
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Draw Background & Guidelines
    getBoardBackground(ctx, canvas.width, canvas.height);

    // 2. Render all drawing and inserted actions
    currentActions.forEach(action => {
      ctx.save();
      ctx.strokeStyle = action.color;
      ctx.fillStyle = action.color;
      ctx.lineWidth = action.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Highlighter opacity
      if (action.type === 'highlighter') {
        ctx.globalAlpha = 0.38;
        ctx.lineWidth = action.size * 3.5;
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
        const headlen = 16;
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
        const pt = action.points[0];
        const fontSize = action.fontSize || 26;
        const fontFam = action.fontFamily || "'Amiri', 'Cairo', serif";
        ctx.font = `bold ${fontSize}px ${fontFam}`;
        ctx.fillStyle = action.color;
        
        // Multi-line text support
        const lines = (action.text || '').split('\n');
        lines.forEach((line, lineIdx) => {
          ctx.fillText(line, pt.x, pt.y + lineIdx * (fontSize * 1.35));
        });

        // Selection highlight if selected
        if (selectedActionId === action.id) {
          ctx.strokeStyle = '#D3B673';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          const textWidth = Math.max(...lines.map(l => ctx.measureText(l).width), 70);
          const totalHeight = lines.length * (fontSize * 1.35);
          ctx.strokeRect(pt.x - 6, pt.y - fontSize, textWidth + 12, totalHeight + 12);
          ctx.setLineDash([]);
        }
      } else if (action.type === 'sticky' && action.points.length > 0) {
        const p = action.points[0];
        const width = action.width || 250;
        const height = action.height || 120;

        // Sticky background
        ctx.fillStyle = '#FEF3C7';
        ctx.strokeStyle = '#D3B673';
        ctx.lineWidth = 2;
        ctx.fillRect(p.x, p.y, width, height);
        ctx.strokeRect(p.x, p.y, width, height);

        // Header line
        ctx.fillStyle = '#D3B673';
        ctx.fillRect(p.x, p.y, width, 20);

        // Sticky text
        ctx.fillStyle = '#29235D';
        ctx.font = "bold 14px 'Cairo', sans-serif";
        const lines = (action.text || 'ملاحظة المعلم').split('\n');
        lines.forEach((line, idx) => {
          ctx.fillText(line, p.x + 12, p.y + 44 + idx * 22);
        });

        if (selectedActionId === action.id) {
          ctx.strokeStyle = '#29235D';
          ctx.lineWidth = 3;
          ctx.strokeRect(p.x - 3, p.y - 3, width + 6, height + 6);
        }
      } else if (action.type === 'ayah' && action.points.length > 0) {
        // Quranic Ayah Card with Royal Islamic Frame
        const p = action.points[0];
        const cardWidth = Math.min(720, Math.max(480, canvas.width - p.x - 30));
        const fontSize = action.fontSize || 32;
        ctx.font = `bold ${fontSize}px 'Amiri', 'Cairo', serif`;

        // Calculate multi-line wrapping for Quranic text
        const words = (action.text || '').split(' ');
        let line = '';
        const lines: string[] = [];
        const maxLineWidth = cardWidth - 60;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxLineWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);

        const cardHeight = Math.max(120, 60 + lines.length * (fontSize * 1.55) + 35);

        // Card Gradient & Shadow
        const grad = ctx.createLinearGradient(p.x, p.y, p.x + cardWidth, p.y + cardHeight);
        grad.addColorStop(0, '#29235D');
        grad.addColorStop(0.5, '#221D4E');
        grad.addColorStop(1, '#17133B');
        ctx.fillStyle = grad;
        ctx.fillRect(p.x, p.y, cardWidth, cardHeight);

        // Gold border outer frame
        ctx.strokeStyle = '#D3B673';
        ctx.lineWidth = 3;
        ctx.strokeRect(p.x, p.y, cardWidth, cardHeight);

        // Inner decorative gold border
        ctx.strokeStyle = 'rgba(211, 182, 115, 0.45)';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x + 6, p.y + 6, cardWidth - 12, cardHeight - 12);

        // Surah Name Badge Header
        ctx.fillStyle = '#D3B673';
        ctx.font = "bold 13px 'Cairo', sans-serif";
        const surahTitle = action.title || (action.surahName ? `سورة ${action.surahName} • الآية ${action.ayahNumber || 1}` : 'آية كريمة');
        ctx.fillText(`📖 ${surahTitle}`, p.x + 22, p.y + 30);

        // Ayah end symbol indicator
        ctx.fillStyle = '#E8D5A3';
        ctx.font = "bold 12px 'Cairo', sans-serif";
        ctx.fillText(`﴿ المصحف الشريف ﴾`, p.x + cardWidth - 140, p.y + 30);

        // Verse Text with Amiri Quranic Calligraphy Font
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${fontSize}px 'Amiri', 'Cairo', serif`;
        ctx.textAlign = 'center';
        lines.forEach((l, idx) => {
          ctx.fillText(l.trim(), p.x + cardWidth / 2, p.y + 75 + idx * (fontSize * 1.55));
        });
        ctx.textAlign = 'left';

        // Selected outline
        if (selectedActionId === action.id) {
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 3.5;
          ctx.strokeRect(p.x - 4, p.y - 4, cardWidth + 8, cardHeight + 8);
        }
      } else if ((action.type === 'image' || action.type === 'screenshot') && action.points.length > 0) {
        const p = action.points[0];
        const src = action.fileDataUrl || action.url;
        if (src) {
          const img = getLoadedImage(src, redrawCanvas);
          if (img && img.complete && img.naturalWidth > 0) {
            const maxW = action.width || 360;
            const aspect = img.naturalHeight / img.naturalWidth;
            const targetW = maxW;
            const targetH = action.height || maxW * aspect;

            // Draw image with card frame
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = 'rgba(0,0,0,0.18)';
            ctx.shadowBlur = 10;
            ctx.fillRect(p.x, p.y, targetW, targetH + 28);
            ctx.shadowBlur = 0;

            ctx.drawImage(img, p.x, p.y, targetW, targetH);

            // Caption footer
            ctx.fillStyle = '#F8F6F0';
            ctx.fillRect(p.x, p.y + targetH, targetW, 28);
            ctx.fillStyle = '#29235D';
            ctx.font = "bold 12px 'Cairo', sans-serif";
            const caption = action.title || (action.type === 'screenshot' ? '📸 سكرين شوت مقصوصة' : 'صورة توضيحية');
            ctx.fillText(caption, p.x + 12, p.y + targetH + 19);

            ctx.strokeStyle = '#D3B673';
            ctx.lineWidth = 2;
            ctx.strokeRect(p.x, p.y, targetW, targetH + 28);

            if (selectedActionId === action.id) {
              ctx.strokeStyle = '#29235D';
              ctx.lineWidth = 3.5;
              ctx.strokeRect(p.x - 4, p.y - 4, targetW + 8, targetH + 36);
            }
          }
        }
      } else if (action.type === 'file' && action.points.length > 0) {
        // Document Card
        const p = action.points[0];
        const cardW = 290;
        const cardH = 80;

        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 8;
        ctx.fillRect(p.x, p.y, cardW, cardH);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = '#29235D';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, p.y, cardW, cardH);

        // Icon Box
        ctx.fillStyle = '#29235D';
        ctx.fillRect(p.x + 14, p.y + 16, 48, 48);
        ctx.fillStyle = '#D3B673';
        ctx.font = "bold 20px 'Cairo', sans-serif";
        ctx.fillText('📄', p.x + 27, p.y + 47);

        // Title & File info
        ctx.fillStyle = '#29235D';
        ctx.font = "bold 13px 'Cairo', sans-serif";
        const fileTitle = action.title || action.fileName || 'مستند تعليمي';
        ctx.fillText(fileTitle.substring(0, 26), p.x + 72, p.y + 38);

        ctx.fillStyle = '#786F9A';
        ctx.font = "11px 'Cairo', sans-serif";
        const meta = action.fileSize ? `الحجم: ${action.fileSize}` : (action.url ? 'رابط خارجي 🔗' : 'ملف مرفق');
        ctx.fillText(meta, p.x + 72, p.y + 58);

        if (selectedActionId === action.id) {
          ctx.strokeStyle = '#D3B673';
          ctx.lineWidth = 3;
          ctx.strokeRect(p.x - 3, p.y - 3, cardW + 6, cardH + 6);
        }
      }

      ctx.restore();
    });

    // 3. Render Laser Pointer Glowing Trail
    if (laserPoints.length > 0) {
      ctx.save();
      const now = Date.now();
      laserPoints.forEach((lp, idx) => {
        const age = now - lp.time;
        if (age < 1500) {
          const alpha = Math.max(0, 1 - age / 1500);
          ctx.beginPath();
          ctx.arc(lp.x, lp.y, 8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
          ctx.shadowColor = '#EF4444';
          ctx.shadowBlur = 14;
          ctx.fill();

          // Core bright dot
          ctx.beginPath();
          ctx.arc(lp.x, lp.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();
        }
      });
      ctx.restore();
    }

    // 4. Render Active In-Progress Board Snip Marquee Box
    if (isSnipSelecting && snipStart && snipEnd) {
      ctx.save();
      const minX = Math.min(snipStart.x, snipEnd.x);
      const minY = Math.min(snipStart.y, snipEnd.y);
      const w = Math.abs(snipEnd.x - snipStart.x);
      const h = Math.abs(snipEnd.y - snipStart.y);

      ctx.fillStyle = 'rgba(41, 35, 93, 0.2)';
      ctx.fillRect(minX, minY, w, h);

      ctx.strokeStyle = '#D3B673';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(minX, minY, w, h);

      ctx.fillStyle = '#29235D';
      ctx.fillRect(minX, Math.max(0, minY - 24), 140, 22);
      ctx.fillStyle = '#D3B673';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`✂️ ${Math.round(w)} × ${Math.round(h)} px`, minX + 6, Math.max(16, minY - 8));

      ctx.restore();
    }
  }, [currentActions, selectedActionId, getLoadedImage, getBoardBackground, laserPoints, isSnipSelecting, snipStart, snipEnd]);

  // Trigger canvas redraw on action changes
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Adjust canvas size to parent container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = Math.max(900, rect.width - 2);
      canvas.height = 660;
      redrawCanvas();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redrawCanvas]);

  // Keyboard Shortcuts (Delete, Undo, Redo, Paste)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedActionId) {
        handleDeleteSelected();
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
        handleRedo();
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              setRawSnippedImage(dataUrl);
              setIsSnippingStudioOpen(true);
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [selectedActionId, currentPage, pagesData, redoStack]);

  // Calculate coordinates on canvas
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

  // Find action under cursor
  const findActionAtPoint = (pt: Point): DrawAction | null => {
    for (let i = currentActions.length - 1; i >= 0; i--) {
      const act = currentActions[i];
      if (act.points.length === 0) continue;
      const p = act.points[0];

      if (act.type === 'text') {
        const textLen = (act.text || '').length * 14;
        if (pt.x >= p.x - 10 && pt.x <= p.x + textLen && pt.y >= p.y - 35 && pt.y <= p.y + 25) {
          return act;
        }
      } else if (act.type === 'sticky') {
        const w = act.width || 250;
        const h = act.height || 120;
        if (pt.x >= p.x && pt.x <= p.x + w && pt.y >= p.y && pt.y <= p.y + h) {
          return act;
        }
      } else if (act.type === 'ayah') {
        const w = 720;
        const h = 180;
        if (pt.x >= p.x && pt.x <= p.x + w && pt.y >= p.y && pt.y <= p.y + h) {
          return act;
        }
      } else if (act.type === 'image' || act.type === 'screenshot') {
        const w = act.width || 360;
        const h = act.height || 280;
        if (pt.x >= p.x && pt.x <= p.x + w && pt.y >= p.y && pt.y <= p.y + h) {
          return act;
        }
      } else if (act.type === 'file') {
        if (pt.x >= p.x && pt.x <= p.x + 290 && pt.y >= p.y && pt.y <= p.y + 80) {
          return act;
        }
      }
    }
    return null;
  };

  // Mouse Down Event Handler
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);

    // 1. Placement Mode for pending item (Ayah, Image, File, Screenshot)
    if (pendingInsertItem) {
      const newAction: DrawAction = {
        id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: pendingInsertItem.type,
        color: pendingInsertItem.color || selectedColor,
        size: strokeWidth,
        points: [pt],
        text: pendingInsertItem.text,
        title: pendingInsertItem.title,
        url: pendingInsertItem.url,
        fileDataUrl: pendingInsertItem.fileDataUrl,
        fileName: pendingInsertItem.fileName,
        fileSize: pendingInsertItem.fileSize,
        surahName: pendingInsertItem.surahName,
        surahNumber: pendingInsertItem.surahNumber,
        ayahNumber: pendingInsertItem.ayahNumber,
        fontSize: pendingInsertItem.fontSize || 32,
      };

      setPagesData(prev => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newAction],
      }));

      setPendingInsertItem(null);
      setPlacementNotice(null);
      setSelectedActionId(newAction.id);
      setActiveTool('select');
      return;
    }

    // 2. Snip Tool Mode: Start marquee box
    if (activeTool === 'snip') {
      setIsSnipSelecting(true);
      setSnipStart(pt);
      setSnipEnd(pt);
      return;
    }

    // 3. Laser Pointer Mode
    if (activeTool === 'laser') {
      setLaserPoints(prev => [...prev.slice(-20), { x: pt.x, y: pt.y, time: Date.now() }]);
      return;
    }

    // 4. Text Tool Click -> Open Inline Text Editor directly at (pt.x, pt.y)
    if (activeTool === 'text') {
      setInlineTextEditor({
        isOpen: true,
        x: pt.x,
        y: pt.y,
        text: '',
        fontSize: 26,
        color: selectedColor,
        fontFamily: "'Amiri', 'Cairo', serif",
      });
      return;
    }

    // 5. Select / Move Tool
    if (activeTool === 'select') {
      const hitAction = findActionAtPoint(pt);
      if (hitAction) {
        setSelectedActionId(hitAction.id);
        setIsDraggingElement(true);
        setDragStartPoint(pt);
        setDragInitialElementPoint({ ...hitAction.points[0] });
      } else {
        setSelectedActionId(null);
      }
      return;
    }

    // 6. Eraser Tool
    if (activeTool === 'eraser') {
      const filtered = currentActions.filter(act => {
        const isNear = act.points.some(
          p => Math.sqrt(Math.pow(p.x - pt.x, 2) + Math.pow(p.y - pt.y, 2)) < 30
        );
        return !isNear;
      });
      setPagesData(prev => ({ ...prev, [currentPage]: filtered }));
      return;
    }

    // 7. Sticky Note
    if (activeTool === 'sticky') {
      const newAction: DrawAction = {
        id: `act-${Date.now()}`,
        type: 'sticky',
        color: selectedColor,
        size: strokeWidth,
        points: [pt],
        text: isRTL ? 'ملاحظة المعلم: التركيز على أحكام التجويد والوقف والابتداء' : 'Teacher note: Focus on Tajweed and articulation points',
        width: 250,
        height: 120,
      };
      setPagesData(prev => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newAction],
      }));
      setSelectedActionId(newAction.id);
      setActiveTool('select');
      return;
    }

    // 8. Drawing Shapes / Freehand
    setIsDrawing(true);
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

  // Mouse Move Event Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);

    // Laser pointer trailing effect
    if (activeTool === 'laser') {
      setLaserPoints(prev => [...prev.slice(-30), { x: pt.x, y: pt.y, time: Date.now() }]);
      return;
    }

    // Board Snip dragging marquee
    if (isSnipSelecting && snipStart) {
      setSnipEnd(pt);
      return;
    }

    // Dragging an element in select mode
    if (isDraggingElement && selectedActionId && dragStartPoint && dragInitialElementPoint) {
      const dx = pt.x - dragStartPoint.x;
      const dy = pt.y - dragStartPoint.y;

      setPagesData(prev => {
        const list = (prev[currentPage] || []).map(act => {
          if (act.id === selectedActionId && act.points.length > 0) {
            return {
              ...act,
              points: [{ x: dragInitialElementPoint.x + dx, y: dragInitialElementPoint.y + dy }],
            };
          }
          return act;
        });
        return { ...prev, [currentPage]: list };
      });
      return;
    }

    if (!isDrawing) return;

    if (activeTool === 'eraser') {
      const filtered = currentActions.filter(act => {
        const isNear = act.points.some(
          p => Math.sqrt(Math.pow(p.x - pt.x, 2) + Math.pow(p.y - pt.y, 2)) < 30
        );
        return !isNear;
      });
      setPagesData(prev => ({ ...prev, [currentPage]: filtered }));
      return;
    }

    // Update freehand or shape endpoints
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

  // Mouse Up Event Handler
  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsDraggingElement(false);
    setDragStartPoint(null);
    setDragInitialElementPoint(null);

    // If snip marquee finished -> capture selected region to snipping studio
    if (isSnipSelecting && snipStart && snipEnd) {
      setIsSnipSelecting(false);
      const canvas = canvasRef.current;
      if (canvas) {
        const minX = Math.min(snipStart.x, snipEnd.x);
        const minY = Math.min(snipStart.y, snipEnd.y);
        const w = Math.abs(snipEnd.x - snipStart.x);
        const h = Math.abs(snipEnd.y - snipStart.y);

        if (w > 20 && h > 20) {
          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = w;
          cropCanvas.height = h;
          const cropCtx = cropCanvas.getContext('2d');
          if (cropCtx) {
            cropCtx.drawImage(canvas, minX, minY, w, h, 0, 0, w, h);
            const dataUrl = cropCanvas.toDataURL('image/png');
            setRawSnippedImage(dataUrl);
            setIsSnippingStudioOpen(true);
            setActiveTool('select');
          }
        }
      }
      setSnipStart(null);
      setSnipEnd(null);
    }
  };

  // Save Inline Text from Editor
  const handleSaveInlineText = () => {
    if (!inlineTextEditor || !inlineTextEditor.text.trim()) {
      setInlineTextEditor(null);
      return;
    }

    const newAction: DrawAction = {
      id: inlineTextEditor.actionId || `act-text-${Date.now()}`,
      type: 'text',
      color: inlineTextEditor.color,
      size: 4,
      points: [{ x: inlineTextEditor.x, y: inlineTextEditor.y }],
      text: inlineTextEditor.text,
      fontSize: inlineTextEditor.fontSize,
      fontFamily: inlineTextEditor.fontFamily,
    };

    setPagesData(prev => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), newAction],
    }));

    setInlineTextEditor(null);
    setSelectedActionId(newAction.id);
    setActiveTool('select');
  };

  // Handle Confirm Insert from Modal
  const handleConfirmInsert = (payload: InsertItemPayload) => {
    setPendingInsertItem(payload);
    const itemLabel =
      payload.type === 'ayah'
        ? isRTL ? 'الآية القرآنية' : 'Quranic verse'
        : payload.type === 'image'
        ? isRTL ? 'الصورة' : 'Image'
        : payload.type === 'file'
        ? isRTL ? 'الملف' : 'File'
        : isRTL ? 'لقطة الشاشة المقصوصة' : 'Cropped Screenshot';

    setPlacementNotice(
      isRTL
        ? `🎯 انقر الآن على السبورة لتحديد المكان الذي ترغب في وضع (${itemLabel}) فيه`
        : `🎯 Click anywhere on the whiteboard to place (${itemLabel})`
    );
  };

  // Undo / Redo / Clear / Export
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
    if (window.confirm(isRTL ? 'هل أنت متأكد من رغبتك في مسح الصفحة الحالية؟' : 'Clear current whiteboard page?')) {
      setPagesData(prev => ({ ...prev, [currentPage]: [] }));
      setSelectedActionId(null);
    }
  };

  const handleDeleteSelected = () => {
    if (!selectedActionId) return;
    setPagesData(prev => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).filter(a => a.id !== selectedActionId),
    }));
    setSelectedActionId(null);
  };

  const handleDuplicateSelected = () => {
    if (!selectedActionId) return;
    const item = currentActions.find(a => a.id === selectedActionId);
    if (!item) return;
    const duplicate: DrawAction = {
      ...item,
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      points: item.points.map(p => ({ x: p.x + 30, y: p.y + 30 })),
    };
    setPagesData(prev => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), duplicate],
    }));
    setSelectedActionId(duplicate.id);
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

  // Add a new whiteboard page
  const handleAddNewPage = () => {
    const nextNum = Math.max(...pageList) + 1;
    setPageList(prev => [...prev, nextNum]);
    setCurrentPage(nextNum);
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

  if (isStudentQuotaDepleted) {
    return (
      <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-rose-200 shadow-xl space-y-5 max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200 shadow-inner">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
            {isRTL ? '⚠️ رصيد الباقة منتهي (0 حصص متبقية)' : '⚠️ 0 Sessions Remaining'}
          </span>
          <h3 className="text-2xl font-black text-[#29235D] font-serif">
            {isRTL ? 'السبورة التفاعلية متوقفة مؤقتاً' : 'Whiteboard Temporarily Locked'}
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed max-w-lg mx-auto">
            {isRTL
              ? 'عزيزي المتدرب، لقد أتممت جميع الحصص المشحونة في باقتك الحالية. لفتح السبورة التفاعلية واستئناف الحصص المباشرة، يرجى طلب شحن وتجديد رصيدك.'
              : 'Dear student, your prepaid lessons balance has reached 0. To unlock the interactive whiteboard and resume live sessions, please recharge your session quota.'}
          </p>
        </div>
        <div className="pt-2 flex justify-center">
          <a
            href="https://wa.me/201021430489?text=السلام%20عليكم%20أريد%20شحن%20وتجديد%20باقة%20الحصص%20في%20منصة%20آفاق"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#29235D] to-[#1D1845] text-[#D3B673] hover:text-white font-bold text-sm flex items-center gap-2.5 shadow-lg border border-[#D3B673]/40 transition-all cursor-pointer"
          >
            <span>💬</span>
            <span>{isRTL ? 'طلب شحن وتجديد الباقة عبر واتساب' : 'Request Recharge via WhatsApp'}</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-3xl border border-[#29235D]/15 shadow-xl overflow-hidden relative select-none"
    >
      
      {/* 1. Header Toolbar */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-[#29235D] via-[#231E52] to-[#17133B] text-white flex flex-wrap items-center justify-between gap-3">
        
        {/* Title & Multi-Page Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#D3B673] text-[#29235D] font-bold shadow-xs">
              <Presentation className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#E8D5A3] font-serif flex items-center gap-2">
                <span>{t('whiteboard')}</span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-[#D3B673] font-normal hidden sm:inline">
                  السبورة الذكية الفاخرة
                </span>
              </h2>
              <p className="text-[10px] text-white/70">AITEC Smart Digital Classroom Board</p>
            </div>
          </div>

          {/* Page Tabs */}
          <div className="flex items-center bg-black/25 p-1 rounded-xl border border-white/10 ml-2">
            {pageList.map(pageNum => (
              <button
                key={pageNum}
                onClick={() => {
                  setCurrentPage(pageNum);
                  setSelectedActionId(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-[#D3B673] text-[#29235D] shadow-xs'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                {t('page')} {pageNum}
              </button>
            ))}
            <button
              onClick={handleAddNewPage}
              className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title={isRTL ? 'إضافة صفحة جديدة' : 'Add Page'}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Global Actions: Insert Dropdown, Screenshot Snipper, Themes, Export */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Board Themes Selector */}
          <div className="flex items-center bg-black/20 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setBoardTheme('white')}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                boardTheme === 'white' ? 'bg-white text-[#29235D] shadow-xs' : 'text-white/70 hover:text-white'
              }`}
              title={isRTL ? 'سبورة بيضاء حديثة' : 'Whiteboard'}
            >
              🤍 {isRTL ? 'بيضاء' : 'White'}
            </button>
            <button
              onClick={() => setBoardTheme('parchment')}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                boardTheme === 'parchment' ? 'bg-[#D3B673] text-[#29235D] shadow-xs' : 'text-white/70 hover:text-white'
              }`}
              title={isRTL ? 'مخطوطة ومصحف شريف' : 'Quran Parchment'}
            >
              📜 {isRTL ? 'مصحف' : 'Quran'}
            </button>
            <button
              onClick={() => setBoardTheme('chalkboard')}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                boardTheme === 'chalkboard' ? 'bg-[#1B4D3E] text-[#D3B673] shadow-xs border border-[#D3B673]/30' : 'text-white/70 hover:text-white'
              }`}
              title={isRTL ? 'سبورة خضراء كلاسيكية' : 'Chalkboard'}
            >
              🟢 {isRTL ? 'خضراء' : 'Chalk'}
            </button>
            <button
              onClick={() => setBoardTheme('slate')}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                boardTheme === 'slate' ? 'bg-[#14112E] text-[#D3B673] shadow-xs border border-[#D3B673]/40' : 'text-white/70 hover:text-white'
              }`}
              title={isRTL ? 'سبورة ليلية كحلية' : 'Slate Night'}
            >
              🖤 {isRTL ? 'داكنة' : 'Slate'}
            </button>
            <button
              onClick={() => setBoardTheme('calligraphy')}
              className={`px-2 py-1 rounded-lg font-bold transition-all ${
                boardTheme === 'calligraphy' ? 'bg-white text-[#29235D] shadow-xs' : 'text-white/70 hover:text-white'
              }`}
              title={isRTL ? 'سبورة مسطرة للخط العربي' : 'Calligraphy Ruled'}
            >
              📏 {isRTL ? 'مسطرة' : 'Ruled'}
            </button>
          </div>

          {/* Direct Screen Capture & Snipping Tool */}
          <button
            onClick={() => {
              setInsertModalDefaultTab('SCREENSHOT');
              setIsInsertModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#E8D5A3] text-xs font-bold transition-all border border-[#D3B673]/40 cursor-pointer shadow-xs"
            title={isRTL ? 'قص وتحديد لقطة شاشة مباشرة' : 'Snip & Crop Screen'}
          >
            <Scissors className="w-3.5 h-3.5 text-[#D3B673]" />
            <span className="hidden sm:inline">{isRTL ? 'قص وتصوير الشاشة' : 'Screen Snip'}</span>
          </button>

          {/* Insert Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsInsertDropdownOpen(!isInsertDropdownOpen)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D3B673] to-[#C4A358] hover:brightness-110 text-[#29235D] text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isRTL ? 'إدراج عنصر ▾' : 'Insert ▾'}</span>
            </button>

            {isInsertDropdownOpen && (
              <div
                className={`absolute ${
                  isRTL ? 'left-0' : 'right-0'
                } mt-2 w-60 bg-white border border-[#29235D]/15 rounded-2xl shadow-2xl p-2 z-50 text-[#29235D] animate-in fade-in space-y-1 text-xs`}
              >
                <div className="p-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  {isRTL ? 'خيارات الإدراج في السبورة' : 'Insert Options'}
                </div>

                {/* Option: Quranic Ayah */}
                <button
                  onClick={() => {
                    setInsertModalDefaultTab('AYAH');
                    setIsInsertModalOpen(true);
                    setIsInsertDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8F6F0] font-bold text-[#29235D] transition-all text-right cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-[#D3B673]" />
                  <span>{isRTL ? '📖 آية قرآنية (114 سورة كاملة)' : 'Quranic Ayah (All 114 Surahs)'}</span>
                </button>

                {/* Option: Screenshot & Snipping */}
                <button
                  onClick={() => {
                    setInsertModalDefaultTab('SCREENSHOT');
                    setIsInsertModalOpen(true);
                    setIsInsertDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8F6F0] font-bold text-[#29235D] transition-all text-right cursor-pointer"
                >
                  <Scissors className="w-4 h-4 text-[#D3B673]" />
                  <span>{isRTL ? '📸 قص وتحديد لقطة شاشة' : 'Screenshot & Snip Studio'}</span>
                </button>

                {/* Option: Image */}
                <button
                  onClick={() => {
                    setInsertModalDefaultTab('IMAGE');
                    setIsInsertModalOpen(true);
                    setIsInsertDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8F6F0] font-bold text-[#29235D] transition-all text-right cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-[#D3B673]" />
                  <span>{isRTL ? '🖼️ صورة (رابط أو من الحاسوب)' : 'Image (URL / Upload)'}</span>
                </button>

                {/* Option: File */}
                <button
                  onClick={() => {
                    setInsertModalDefaultTab('FILE');
                    setIsInsertModalOpen(true);
                    setIsInsertDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#F8F6F0] font-bold text-[#29235D] transition-all text-right cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#D3B673]" />
                  <span>{isRTL ? '📁 ملف ومستند (PDF, Word)' : 'File Document'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Export PNG Snapshot */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 cursor-pointer"
            title="Download PNG snapshot"
          >
            <Download className="w-3.5 h-3.5 text-[#D3B673]" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Save State */}
          <button
            onClick={() => {
              setSavedSuccess(true);
              setTimeout(() => setSavedSuccess(false), 2000);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 cursor-pointer"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5 text-[#D3B673]" />}
            <span>{savedSuccess ? 'Saved!' : 'Save'}</span>
          </button>
        </div>

      </div>

      {/* 2. Floating Tools Dock */}
      <div className="p-3 bg-[#FBF9F4] border-b border-[#29235D]/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Drawing, Pointer & Text Tools */}
        <div className="flex items-center gap-1.5 flex-wrap">
          
          {/* Select / Move Tool */}
          <button
            onClick={() => setActiveTool('select')}
            className={`p-2 rounded-xl border font-bold flex items-center gap-1 transition-all cursor-pointer ${
              activeTool === 'select'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-xs'
                : 'bg-white text-[#29235D] border-gray-200 hover:bg-gray-50'
            }`}
            title={isRTL ? 'أداة التحديد والتحريك (نقل العناصر وحذفها)' : 'Select & Move Tool'}
          >
            <MousePointer className="w-4 h-4" />
            <span className="hidden sm:inline">{isRTL ? 'تحريك' : 'Move'}</span>
          </button>

          {/* Smooth Pen */}
          <button
            onClick={() => setActiveTool('pen')}
            className={`p-2 rounded-xl border font-bold flex items-center gap-1 transition-all cursor-pointer ${
              activeTool === 'pen'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-xs'
                : 'bg-white text-[#29235D] border-gray-200 hover:bg-gray-50'
            }`}
            title="Pen"
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">{t('pen')}</span>
          </button>

          {/* Highlighter */}
          <button
            onClick={() => setActiveTool('highlighter')}
            className={`p-2 rounded-xl border font-bold flex items-center gap-1 transition-all cursor-pointer ${
              activeTool === 'highlighter'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-xs'
                : 'bg-white text-[#29235D] border-gray-200 hover:bg-gray-50'
            }`}
            title="Highlighter"
          >
            <Highlighter className="w-4 h-4" />
            <span className="hidden sm:inline">{t('highlighter')}</span>
          </button>

          {/* Laser Pointer */}
          <button
            onClick={() => setActiveTool('laser')}
            className={`p-2 rounded-xl border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === 'laser'
                ? 'bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-400'
                : 'bg-white text-red-600 border-gray-200 hover:bg-red-50'
            }`}
            title={isRTL ? 'مؤشر ليزري تفاعلي مضيء لتنبيه الطلاب' : 'Laser Pointer'}
          >
            <Flame className="w-4 h-4" />
            <span className="font-bold">{isRTL ? 'ليزر 🔴' : 'Laser'}</span>
          </button>

          {/* In-Board Region Snipping Tool */}
          <button
            onClick={() => {
              setActiveTool('snip');
              setPlacementNotice(isRTL ? '✂️ اسحب مستطيلاً فوق أي منطقة بالسبورة لقصها مباشرة' : '✂️ Drag a rectangle on the board to snip');
            }}
            className={`p-2 rounded-xl border font-bold flex items-center gap-1 transition-all cursor-pointer ${
              activeTool === 'snip'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-xs'
                : 'bg-white text-[#29235D] border-gray-200 hover:bg-gray-50'
            }`}
            title={isRTL ? 'قص منطقة من السبورة' : 'Snip Board Region'}
          >
            <Scissors className="w-4 h-4" />
            <span className="hidden sm:inline">{isRTL ? 'قص منطقة' : 'Snip'}</span>
          </button>

          {/* Eraser */}
          <button
            onClick={() => setActiveTool('eraser')}
            className={`p-2 rounded-xl border font-bold flex items-center gap-1 transition-all cursor-pointer ${
              activeTool === 'eraser'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-xs'
                : 'bg-white text-[#29235D] border-gray-200 hover:bg-gray-50'
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
            <span className="hidden sm:inline">{t('eraser')}</span>
          </button>

          <div className="h-5 w-[1px] bg-gray-300 mx-1" />

          {/* Text Tool */}
          <button
            onClick={() => setActiveTool('text')}
            className={`p-2 rounded-xl border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTool === 'text'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-xs ring-2 ring-[#D3B673]'
                : 'bg-white text-[#29235D] border-gray-200 hover:bg-gray-50'
            }`}
            title={isRTL ? 'كتابة نص (انقر على السبورة للمكان المحدد)' : 'Text Tool'}
          >
            <Type className="w-4 h-4 text-[#D3B673]" />
            <span className="font-bold">{isRTL ? 'نص ✍️' : 'Text'}</span>
          </button>

          {/* Sticky Note */}
          <button
            onClick={() => setActiveTool('sticky')}
            className={`p-2 rounded-xl border font-bold flex items-center gap-1 transition-all cursor-pointer ${
              activeTool === 'sticky'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D] shadow-xs'
                : 'bg-white text-[#29235D] border-gray-200 hover:bg-gray-50'
            }`}
            title="Sticky Note"
          >
            <StickyNote className="w-4 h-4" />
            <span className="hidden sm:inline">{isRTL ? 'ملاحظة' : 'Sticky'}</span>
          </button>

          {/* Shapes */}
          <button
            onClick={() => setActiveTool('rect')}
            className={`p-2 rounded-xl border font-bold transition-all cursor-pointer ${
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
            className={`p-2 rounded-xl border font-bold transition-all cursor-pointer ${
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
            className={`p-2 rounded-xl border font-bold transition-all cursor-pointer ${
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
            className={`p-2 rounded-xl border font-bold transition-all cursor-pointer ${
              activeTool === 'arrow'
                ? 'bg-[#29235D] text-[#D3B673] border-[#29235D]'
                : 'bg-white text-[#29235D] border-gray-200 hover:bg-gray-50'
            }`}
            title="Arrow"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Color Palette, Stroke Width, Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Color Circles */}
          <div className="flex items-center gap-1.5">
            {brandColors.map(c => (
              <button
                key={c.value}
                onClick={() => setSelectedColor(c.value)}
                className={`w-6 h-6 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                  selectedColor === c.value
                    ? 'ring-2 ring-offset-2 ring-[#29235D] scale-110'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.value, border: c.value === '#FFFFFF' ? '1px solid #ccc' : 'none' }}
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

          {/* Actions: Duplicate, Delete, Undo, Redo, Clear */}
          <div className="flex items-center gap-1">
            {selectedActionId && (
              <>
                <button
                  onClick={handleDuplicateSelected}
                  className="p-2 rounded-xl border border-[#D3B673] bg-[#FBF9F4] hover:bg-[#F3EFE6] text-[#29235D] font-bold text-xs flex items-center gap-1 cursor-pointer"
                  title={isRTL ? 'تكرار العنصر المحدد' : 'Duplicate Element'}
                >
                  <Copy className="w-3.5 h-3.5 text-[#D3B673]" />
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="p-2 rounded-xl border border-red-300 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                  title={isRTL ? 'حذف العنصر المحدد' : 'Delete Selected Element'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              onClick={handleUndo}
              disabled={currentActions.length === 0}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[#29235D] disabled:opacity-30 cursor-pointer"
              title={t('undo')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={(redoStack[currentPage] || []).length === 0}
              className="p-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-[#29235D] disabled:opacity-30 cursor-pointer"
              title={t('redo')}
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClear}
              className="p-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
              title={t('clearBoard')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* 3. Placement Banner Notification */}
      {(placementNotice || activeTool === 'text' || activeTool === 'snip') && (
        <div className="bg-gradient-to-r from-[#29235D] via-[#352D75] to-[#29235D] text-white px-4 py-2 text-xs font-bold flex items-center justify-between shadow-inner animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="animate-bounce text-sm">🎯</span>
            <span className="text-[#E8D5A3]">
              {placementNotice ||
                (activeTool === 'snip'
                  ? (isRTL ? '✂️ اسحب مستطيلاً بالمؤشر لتحديد وقص الجزء المطلوب' : '✂️ Drag a marquee box to snip region')
                  : (isRTL ? '✍️ انقر بالمؤشر على السبورة في الموضع الذي ترغب في كتابة النص فيه' : '✍️ Click on canvas to type text'))}
            </span>
          </div>
          <button
            onClick={() => {
              setPendingInsertItem(null);
              setPlacementNotice(null);
              setIsSnipSelecting(false);
              if (activeTool === 'text' || activeTool === 'snip') setActiveTool('pen');
            }}
            className="text-white/80 hover:text-white text-[11px] underline cursor-pointer"
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      )}

      {/* 4. Canvas Drawing Area */}
      <div className="relative w-full overflow-x-auto bg-[#FFFFFF] flex justify-center items-center">
        
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`touch-none select-none block max-w-full ${
            pendingInsertItem || activeTool === 'text' || activeTool === 'snip'
              ? 'cursor-crosshair'
              : activeTool === 'laser'
              ? 'cursor-pointer'
              : activeTool === 'select'
              ? 'cursor-move'
              : 'cursor-crosshair'
          }`}
        />

        {/* 5. In-Place Floating Text Editor Box */}
        {inlineTextEditor && inlineTextEditor.isOpen && (
          <div
            style={{
              left: `${Math.min(inlineTextEditor.x, (canvasRef.current?.width || 800) - 340)}px`,
              top: `${Math.min(inlineTextEditor.y, (canvasRef.current?.height || 600) - 220)}px`,
            }}
            className="absolute z-40 bg-white rounded-2xl shadow-2xl border-2 border-[#29235D] p-3.5 w-84 space-y-2.5 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#29235D]">
                <Type className="w-4 h-4 text-[#D3B673]" />
                <span>{isRTL ? 'كتابة نص على السبورة' : 'Add Canvas Text'}</span>
              </div>
              <button
                onClick={() => setInlineTextEditor(null)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Textarea */}
            <textarea
              autoFocus
              rows={3}
              placeholder={isRTL ? 'اكتب النص هنا (عربي أو إنجليزي)...' : 'Type text here...'}
              value={inlineTextEditor.text}
              onChange={e => setInlineTextEditor({ ...inlineTextEditor, text: e.target.value })}
              onKeyDown={e => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleSaveInlineText();
                }
              }}
              style={{ color: inlineTextEditor.color, fontFamily: inlineTextEditor.fontFamily }}
              className="w-full p-2.5 rounded-xl border border-gray-300 text-base text-[#29235D] outline-none focus:border-[#29235D] resize-none"
              dir="auto"
            />

            {/* Font Style & Size Bar */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] text-gray-500 font-bold block mb-0.5">{isRTL ? 'نوع الخط:' : 'Font:'}</label>
                <select
                  value={inlineTextEditor.fontFamily}
                  onChange={e => setInlineTextEditor({ ...inlineTextEditor, fontFamily: e.target.value })}
                  className="w-full px-2 py-1 rounded-lg border border-gray-300 text-xs font-bold text-[#29235D] outline-none bg-white"
                >
                  <option value="'Amiri', 'Cairo', serif">خط المصحف (Amiri)</option>
                  <option value="'Cairo', sans-serif">خط حديث (Cairo)</option>
                  <option value="sans-serif">عادي (Standard)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-500 font-bold block mb-0.5">{isRTL ? 'الحجم:' : 'Size:'}</label>
                <select
                  value={inlineTextEditor.fontSize}
                  onChange={e => setInlineTextEditor({ ...inlineTextEditor, fontSize: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded-lg border border-gray-300 text-xs font-bold text-[#29235D] outline-none bg-white"
                >
                  <option value={20}>20px</option>
                  <option value={26}>26px</option>
                  <option value={32}>32px</option>
                  <option value={40}>40px</option>
                  <option value={52}>52px</option>
                </select>
              </div>
            </div>

            {/* Save / Cancel Controls */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setInlineTextEditor(null)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                {isRTL ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveInlineText}
                className="px-4 py-1.5 rounded-lg bg-[#29235D] text-[#D3B673] hover:bg-[#1D1845] text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isRTL ? 'إدراج النص' : 'Insert Text'}</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 6. Footer Info & Status Bar */}
      <div className="p-3 bg-[#F8F6F0] border-t border-[#29235D]/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#786F9A]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[#29235D]">
            {currentUser?.role === 'TEACHER' ? 'Teacher Live Studio' : 'Interactive Session Board'}
          </span>
          <span className="text-gray-300">|</span>
          <span>{isRTL ? 'اختصار: Ctrl+V للصق أي لقطة شاشة وقصها فوراً' : 'Shortcut: Ctrl+V to paste & crop screenshots'}</span>
        </div>

        <div className="flex items-center gap-3">
          <span>{isRTL ? `الصفحة ${currentPage} (${currentActions.length} عناصر)` : `Page ${currentPage} (${currentActions.length} elements)`}</span>
        </div>
      </div>

      {/* 7. Insert Modal Dialog */}
      <WhiteboardInsertModal
        isOpen={isInsertModalOpen}
        onClose={() => setIsInsertModalOpen(false)}
        onConfirmInsert={handleConfirmInsert}
        defaultCategory={insertModalDefaultTab}
      />

      {/* 8. Snipping & Crop Studio for Board/Screen Snippets */}
      {isSnippingStudioOpen && rawSnippedImage && (
        <ScreenSnippetModal
          isOpen={isSnippingStudioOpen}
          imageDataUrl={rawSnippedImage}
          onClose={() => setIsSnippingStudioOpen(false)}
          onConfirmCrop={(croppedUrl) => {
            setIsSnippingStudioOpen(false);
            setPendingInsertItem({
              type: 'screenshot',
              title: isRTL ? 'لقطة شاشة مقصوصة' : 'Cropped Snippet',
              fileDataUrl: croppedUrl,
            });
            setPlacementNotice(
              isRTL
                ? '🎯 تم قص اللقطة بنجاح! انقر على السبورة لتحديد مكان وضعها'
                : '🎯 Snippet ready! Click on whiteboard to place.'
            );
          }}
        />
      )}

    </div>
  );
};
