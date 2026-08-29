import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useI18n } from '../../lib/i18n';
import {
  Crop,
  Check,
  X,
  RotateCw,
  Maximize2,
  Minimize2,
  Camera,
  Scissors,
  Sparkles,
  Move,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from 'lucide-react';

interface ScreenSnippetModalProps {
  isOpen: boolean;
  imageDataUrl: string | null;
  onClose: () => void;
  onConfirmCrop: (croppedDataUrl: string) => void;
  onRetake?: () => void;
}

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type DragHandle = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 's' | 'e' | 'w' | 'move' | null;

export const ScreenSnippetModal: React.FC<ScreenSnippetModalProps> = ({
  isOpen,
  imageDataUrl,
  onClose,
  onConfirmCrop,
  onRetake,
}) => {
  const { isRTL } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [crop, setCrop] = useState<CropRect>({ x: 40, y: 40, w: 400, h: 250 });
  const [activeHandle, setActiveHandle] = useState<DragHandle>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [initialCrop, setInitialCrop] = useState<CropRect | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [naturalDimensions, setNaturalDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 600 });
  const [isDrawingNewBox, setIsDrawingNewBox] = useState<boolean>(false);

  // Load image
  useEffect(() => {
    if (!imageDataUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setImageLoaded(true);
      // Set default crop centered
      const defaultW = Math.min(img.naturalWidth * 0.75, 600);
      const defaultH = Math.min(img.naturalHeight * 0.75, 400);
      setCrop({
        x: Math.max(10, (img.naturalWidth - defaultW) / 2),
        y: Math.max(10, (img.naturalHeight - defaultH) / 2),
        w: defaultW,
        h: defaultH,
      });
    };
    img.src = imageDataUrl;
  }, [imageDataUrl]);

  // Redraw canvas with image and interactive crop overlay
  const drawOverlay = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas to image dimensions
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw background image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Darkened backdrop outside crop box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, canvas.width, crop.y);
    ctx.fillRect(0, crop.y + crop.h, canvas.width, canvas.height - (crop.y + crop.h));
    ctx.fillRect(0, crop.y, crop.x, crop.h);
    ctx.fillRect(crop.x + crop.w, crop.y, canvas.width - (crop.x + crop.w), crop.h);

    // Crop Border with Gold stroke
    ctx.strokeStyle = '#D3B673';
    ctx.lineWidth = 3;
    ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);

    // Inner rule-of-thirds guidelines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    // Horizontal thirds
    ctx.beginPath();
    ctx.moveTo(crop.x, crop.y + crop.h / 3);
    ctx.lineTo(crop.x + crop.w, crop.y + crop.h / 3);
    ctx.moveTo(crop.x, crop.y + (2 * crop.h) / 3);
    ctx.lineTo(crop.x + crop.w, crop.y + (2 * crop.h) / 3);
    // Vertical thirds
    ctx.moveTo(crop.x + crop.w / 3, crop.y);
    ctx.lineTo(crop.x + crop.w / 3, crop.y + crop.h);
    ctx.moveTo(crop.x + (2 * crop.w) / 3, crop.y);
    ctx.lineTo(crop.x + (2 * crop.w) / 3, crop.y + crop.h);
    ctx.stroke();
    ctx.setLineDash([]);

    // 8 Draggable Corner & Edge Handles
    const handleSize = 14;
    const handles = [
      { x: crop.x, y: crop.y }, // nw
      { x: crop.x + crop.w / 2, y: crop.y }, // n
      { x: crop.x + crop.w, y: crop.y }, // ne
      { x: crop.x + crop.w, y: crop.y + crop.h / 2 }, // e
      { x: crop.x + crop.w, y: crop.y + crop.h }, // se
      { x: crop.x + crop.w / 2, y: crop.y + crop.h }, // s
      { x: crop.x, y: crop.y + crop.h }, // sw
      { x: crop.x, y: crop.y + crop.h / 2 }, // w
    ];

    handles.forEach(h => {
      ctx.fillStyle = '#29235D';
      ctx.strokeStyle = '#D3B673';
      ctx.lineWidth = 2.5;
      ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
    });

    // Dimension badge top-left of crop box
    ctx.fillStyle = 'rgba(41, 35, 93, 0.9)';
    ctx.strokeStyle = '#D3B673';
    ctx.lineWidth = 1;
    const badgeText = `${Math.round(crop.w)} × ${Math.round(crop.h)} px`;
    ctx.font = 'bold 12px sans-serif';
    const textWidth = ctx.measureText(badgeText).width;
    const badgeY = Math.max(18, crop.y - 8);
    ctx.fillRect(crop.x, badgeY - 16, textWidth + 14, 20);
    ctx.strokeRect(crop.x, badgeY - 16, textWidth + 14, 20);
    ctx.fillStyle = '#D3B673';
    ctx.fillText(badgeText, crop.x + 7, badgeY - 2);
  }, [crop, imageLoaded]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  // Convert client coordinates to canvas space
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } => {
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

  // Determine which handle or area is clicked
  const getHandleAtPoint = (pt: { x: number; y: number }): DragHandle => {
    const handleHitRadius = 24;
    const handles: { handle: DragHandle; x: number; y: number }[] = [
      { handle: 'nw', x: crop.x, y: crop.y },
      { handle: 'n', x: crop.x + crop.w / 2, y: crop.y },
      { handle: 'ne', x: crop.x + crop.w, y: crop.y },
      { handle: 'e', x: crop.x + crop.w, y: crop.y + crop.h / 2 },
      { handle: 'se', x: crop.x + crop.w, y: crop.y + crop.h },
      { handle: 's', x: crop.x + crop.w / 2, y: crop.y + crop.h },
      { handle: 'sw', x: crop.x, y: crop.y + crop.h },
      { handle: 'w', x: crop.x, y: crop.y + crop.h / 2 },
    ];

    for (const h of handles) {
      if (Math.hypot(pt.x - h.x, pt.y - h.y) <= handleHitRadius) {
        return h.handle;
      }
    }

    // Inside crop box -> move
    if (pt.x >= crop.x && pt.x <= crop.x + crop.w && pt.y >= crop.y && pt.y <= crop.y + crop.h) {
      return 'move';
    }

    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);
    const hitHandle = getHandleAtPoint(pt);

    if (hitHandle) {
      setActiveHandle(hitHandle);
      setDragStart(pt);
      setInitialCrop({ ...crop });
    } else {
      // Clicked outside -> start drawing new crop box
      setIsDrawingNewBox(true);
      setDragStart(pt);
      setCrop({ x: pt.x, y: pt.y, w: 10, h: 10 });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pt = getCanvasCoords(e);

    // Update cursor based on hover
    if (!activeHandle && !isDrawingNewBox) {
      const h = getHandleAtPoint(pt);
      const canvas = canvasRef.current;
      if (canvas) {
        if (h === 'nw' || h === 'se') canvas.style.cursor = 'nwse-resize';
        else if (h === 'ne' || h === 'sw') canvas.style.cursor = 'nesw-resize';
        else if (h === 'n' || h === 's') canvas.style.cursor = 'ns-resize';
        else if (h === 'e' || h === 'w') canvas.style.cursor = 'ew-resize';
        else if (h === 'move') canvas.style.cursor = 'move';
        else canvas.style.cursor = 'crosshair';
      }
      return;
    }

    if (!dragStart) return;

    if (isDrawingNewBox) {
      const minX = Math.min(dragStart.x, pt.x);
      const minY = Math.min(dragStart.y, pt.y);
      const w = Math.abs(pt.x - dragStart.x);
      const h = Math.abs(pt.y - dragStart.y);
      setCrop({ x: Math.max(0, minX), y: Math.max(0, minY), w: Math.max(20, w), h: Math.max(20, h) });
      return;
    }

    if (!initialCrop || !activeHandle) return;

    const dx = pt.x - dragStart.x;
    const dy = pt.y - dragStart.y;
    const canvas = canvasRef.current;
    const maxW = canvas?.width || naturalDimensions.width;
    const maxH = canvas?.height || naturalDimensions.height;

    let newCrop = { ...initialCrop };

    switch (activeHandle) {
      case 'move':
        newCrop.x = Math.max(0, Math.min(maxW - initialCrop.w, initialCrop.x + dx));
        newCrop.y = Math.max(0, Math.min(maxH - initialCrop.h, initialCrop.y + dy));
        break;
      case 'se':
        newCrop.w = Math.max(30, Math.min(maxW - initialCrop.x, initialCrop.w + dx));
        newCrop.h = Math.max(30, Math.min(maxH - initialCrop.y, initialCrop.h + dy));
        break;
      case 'nw':
        newCrop.x = Math.max(0, Math.min(initialCrop.x + initialCrop.w - 30, initialCrop.x + dx));
        newCrop.y = Math.max(0, Math.min(initialCrop.y + initialCrop.h - 30, initialCrop.y + dy));
        newCrop.w = initialCrop.w - (newCrop.x - initialCrop.x);
        newCrop.h = initialCrop.h - (newCrop.y - initialCrop.y);
        break;
      case 'ne':
        newCrop.y = Math.max(0, Math.min(initialCrop.y + initialCrop.h - 30, initialCrop.y + dy));
        newCrop.w = Math.max(30, Math.min(maxW - initialCrop.x, initialCrop.w + dx));
        newCrop.h = initialCrop.h - (newCrop.y - initialCrop.y);
        break;
      case 'sw':
        newCrop.x = Math.max(0, Math.min(initialCrop.x + initialCrop.w - 30, initialCrop.x + dx));
        newCrop.w = initialCrop.w - (newCrop.x - initialCrop.x);
        newCrop.h = Math.max(30, Math.min(maxH - initialCrop.y, initialCrop.h + dy));
        break;
      case 'e':
        newCrop.w = Math.max(30, Math.min(maxW - initialCrop.x, initialCrop.w + dx));
        break;
      case 's':
        newCrop.h = Math.max(30, Math.min(maxH - initialCrop.y, initialCrop.h + dy));
        break;
      case 'w':
        newCrop.x = Math.max(0, Math.min(initialCrop.x + initialCrop.w - 30, initialCrop.x + dx));
        newCrop.w = initialCrop.w - (newCrop.x - initialCrop.x);
        break;
      case 'n':
        newCrop.y = Math.max(0, Math.min(initialCrop.y + initialCrop.h - 30, initialCrop.y + dy));
        newCrop.h = initialCrop.h - (newCrop.y - initialCrop.y);
        break;
    }

    setCrop(newCrop);
  };

  const handleMouseUp = () => {
    setActiveHandle(null);
    setDragStart(null);
    setInitialCrop(null);
    setIsDrawingNewBox(false);
  };

  // Preset Selection: Full Screen
  const handleSelectFull = () => {
    const img = imageRef.current;
    if (!img) return;
    setCrop({ x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight });
  };

  // Confirm Crop and generate high-res cropped dataUrl
  const handleConfirm = () => {
    const img = imageRef.current;
    if (!img) return;

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = Math.max(1, Math.round(crop.w));
    cropCanvas.height = Math.max(1, Math.round(crop.h));
    const ctx = cropCanvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        img,
        crop.x,
        crop.y,
        crop.w,
        crop.h,
        0,
        0,
        cropCanvas.width,
        cropCanvas.height
      );
      const croppedDataUrl = cropCanvas.toDataURL('image/png');
      onConfirmCrop(croppedDataUrl);
    }
  };

  if (!isOpen || !imageDataUrl) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className="bg-[#1D1845] rounded-3xl max-w-4xl w-full border border-[#D3B673]/30 shadow-2xl overflow-hidden my-4 max-h-[95vh] flex flex-col text-white"
      >
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-[#29235D] to-[#15112E] border-b border-[#D3B673]/20 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D3B673]/20 border border-[#D3B673]/40 flex items-center justify-center text-[#D3B673]">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-serif flex items-center gap-2">
                <span>{isRTL ? 'أداة قص وتحديد لقطة الشاشة' : 'Screen Snipping & Crop Studio'}</span>
                <span className="text-xs font-mono font-normal bg-[#D3B673]/20 text-[#D3B673] px-2 py-0.5 rounded-full">
                  {Math.round(crop.w)} × {Math.round(crop.h)} px
                </span>
              </h3>
              <p className="text-[11px] text-[#E8D5A3]">
                {isRTL
                  ? 'اسحب إطار التحديد المضيء بالمؤشر لتحديد الجزء الذي ترغب في قصه وإدراجه على السبورة'
                  : 'Drag the golden crop box to select the exact region to insert on the whiteboard'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRetake && (
              <button
                type="button"
                onClick={onRetake}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#E8D5A3] text-xs font-bold transition-all border border-[#D3B673]/30 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{isRTL ? 'إعادة التصوير' : 'Retake'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Toolbar Preset Buttons */}
        <div className="bg-[#15112E] px-4 py-2 border-b border-white/10 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-bold">{isRTL ? 'أبعاد سريعة:' : 'Presets:'}</span>
            <button
              type="button"
              onClick={handleSelectFull}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/90 border border-white/10 transition-all cursor-pointer font-bold"
            >
              {isRTL ? 'كامل الشاشة 🔲' : 'Full Screen'}
            </button>
            <button
              type="button"
              onClick={() => {
                const img = imageRef.current;
                if (!img) return;
                const size = Math.min(img.naturalWidth, img.naturalHeight) * 0.7;
                setCrop({
                  x: (img.naturalWidth - size) / 2,
                  y: (img.naturalHeight - size) / 2,
                  w: size,
                  h: size,
                });
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/90 border border-white/10 transition-all cursor-pointer font-bold"
            >
              {isRTL ? 'مربع 1:1' : 'Square 1:1'}
            </button>
            <button
              type="button"
              onClick={() => {
                const img = imageRef.current;
                if (!img) return;
                const w = img.naturalWidth * 0.8;
                const h = w * (9 / 16);
                setCrop({
                  x: (img.naturalWidth - w) / 2,
                  y: Math.max(0, (img.naturalHeight - h) / 2),
                  w: w,
                  h: h,
                });
              }}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/90 border border-white/10 transition-all cursor-pointer font-bold"
            >
              {isRTL ? 'عرضي 16:9' : 'Widescreen 16:9'}
            </button>
          </div>

          <div className="text-[11px] text-[#D3B673] font-medium hidden sm:flex items-center gap-1">
            <Move className="w-3.5 h-3.5" />
            <span>{isRTL ? 'انقر واسحب لتغيير الموضع والأبعاد' : 'Click & drag handles to resize'}</span>
          </div>
        </div>

        {/* Interactive Snipping Area / Canvas */}
        <div className="flex-1 bg-[#0D0B1F] p-3 flex items-center justify-center overflow-auto max-h-[60vh] select-none">
          <div className="relative border border-[#D3B673]/30 rounded-xl overflow-hidden shadow-2xl inline-block max-w-full">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="max-w-full max-h-[55vh] object-contain block mx-auto cursor-crosshair"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#15112E] border-t border-[#D3B673]/20 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D3B673]" />
            <span>
              {isRTL
                ? 'سيتم قص المنطقة الذهبية المحددة فقط ووضعها على السبورة.'
                : 'Only the selected golden highlighted region will be placed on the canvas.'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/20 text-gray-300 hover:bg-white/10 font-bold text-xs transition-all cursor-pointer"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D3B673] to-[#C4A358] text-[#29235D] font-bold text-xs shadow-lg hover:brightness-110 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#29235D]" />
              <span>{isRTL ? 'تأكيد القص والإدراج على السبورة' : 'Confirm Crop & Place on Board'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
