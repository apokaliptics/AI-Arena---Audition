import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Paintbrush,
  Eraser,
  Stamp,
  Download,
  Upload,
  Eye,
  EyeOff,
  Undo2,
  Info,
  Layers,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { HERITAGE_PALETTE, CULTURAL_STAMPS } from '../constants/presets';
import {
  drawCulturalGuidelines,
  drawMotifStamp,
  cleanGuideWordsFromCanvas,
  UV_ZONES,
  UVZone
} from '../utils/uvCanvasRenderer';
import { CulturalMotifStamp } from '../types';

interface UVEditorProps {
  onTextureChange: (canvas: HTMLCanvasElement) => void;
  activePresetDrawFn?: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  presetName: string;
}

type ToolMode = 'brush' | 'eraser' | 'stamp';

export const UVEditor: React.FC<UVEditorProps> = ({
  onTextureChange,
  activePresetDrawFn,
  presetName,
}) => {
  // Master 1024x1024 canvas - ALWAYS mounted in memory
  const masterCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const masterOverlayRef = useRef<HTMLCanvasElement | null>(null);

  // Isolated sub-canvas for the selected flap/piece
  const isolatedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isolatedOverlayRef = useRef<HTMLCanvasElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Tools state
  const [currentTool, setCurrentTool] = useState<ToolMode>('brush');
  const [currentColor, setCurrentColor] = useState<string>(HERITAGE_PALETTE[0].hex);
  const [brushSize, setBrushSize] = useState<number>(14);
  const [stampSize, setStampSize] = useState<number>(64);
  const [selectedStamp, setSelectedStamp] = useState<CulturalMotifStamp>(CULTURAL_STAMPS[0]);
  const [showGuides, setShowGuides] = useState<boolean>(true);

  // Active Zone: 'all' or specific zone ID (e.g. 'torso', 'arm_left', 'arm_right', 'skirt_front', 'skirt_back', 'leg_left', 'leg_right')
  const [activeZoneId, setActiveZoneId] = useState<string>('all');
  const [hoverZone, setHoverZone] = useState<string | null>(null);

  const historyStackRef = useRef<ImageData[]>([]);
  const isDrawingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const activeZone: UVZone | undefined = UV_ZONES.find((z) => z.id === activeZoneId);

  // Synchronize master canvas region to isolated canvas
  const syncMasterToIsolated = useCallback((zone: UVZone) => {
    const master = masterCanvasRef.current;
    const iso = isolatedCanvasRef.current;
    if (!master || !iso) return;

    iso.width = zone.w;
    iso.height = zone.h;

    const isoCtx = iso.getContext('2d');
    if (!isoCtx) return;

    // Default neutral fabric background if transparent
    isoCtx.fillStyle = '#18181D';
    isoCtx.fillRect(0, 0, zone.w, zone.h);

    // Draw cropped region from master canvas
    isoCtx.drawImage(master, zone.x, zone.y, zone.w, zone.h, 0, 0, zone.w, zone.h);

    // Draw isolated guides on overlay (shows each distinct face: Mặt Trước, Sau, Ngoài, Trong...)
    const isoOverlay = isolatedOverlayRef.current;
    if (isoOverlay) {
      isoOverlay.width = zone.w;
      isoOverlay.height = zone.h;
      const overlayCtx = isoOverlay.getContext('2d');
      if (overlayCtx) {
        overlayCtx.clearRect(0, 0, zone.w, zone.h);
        if (showGuides) {
          drawIsolatedGuidelines(overlayCtx, zone);
        }
      }
    }
  }, [showGuides]);

  // Initial draw of master template ONLY when preset changes
  useEffect(() => {
    const master = masterCanvasRef.current;
    if (!master) return;
    const ctx = master.getContext('2d');
    if (!ctx) return;

    if (activePresetDrawFn) {
      activePresetDrawFn(ctx, 1024, 1024);
    } else {
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(0, 0, 1024, 1024);
    }

    historyStackRef.current = [ctx.getImageData(0, 0, 1024, 1024)];
    onTextureChange(master);

    if (activeZone) {
      syncMasterToIsolated(activeZone);
    }
  }, [presetName, activePresetDrawFn]); // Crucial: NEVER depend on activeZone or activeZoneId here!

  // Master guidelines overlay
  useEffect(() => {
    const overlay = masterOverlayRef.current;
    if (!overlay) return;
    const ctx = overlay.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 1024, 1024);
    if (showGuides) {
      drawCulturalGuidelines(ctx, 1024, 1024, true);
    }
  }, [showGuides]);

  // When active zone changes or showGuides changes, re-sync isolated canvas
  useEffect(() => {
    if (activeZone) {
      // Small timeout ensures the DOM isolatedCanvas element is mounted and ready
      const timer = setTimeout(() => {
        syncMasterToIsolated(activeZone);
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [activeZoneId, activeZone, showGuides, syncMasterToIsolated]);

  const notifyTextureUpdated = useCallback(() => {
    if (masterCanvasRef.current) {
      onTextureChange(masterCanvasRef.current);
    }
  }, [onTextureChange]);

  const scheduleTextureUpdate = useCallback(() => {
    if (rafIdRef.current) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      notifyTextureUpdated();
    });
  }, [notifyTextureUpdated]);

  const pushToHistory = () => {
    const master = masterCanvasRef.current;
    if (!master) return;
    const ctx = master.getContext('2d');
    if (!ctx) return;
    const current = ctx.getImageData(0, 0, 1024, 1024);
    historyStackRef.current.push(current);
    if (historyStackRef.current.length > 20) {
      historyStackRef.current.shift();
    }
  };

  const handleUndo = () => {
    const master = masterCanvasRef.current;
    if (!master || historyStackRef.current.length <= 1) return;
    const ctx = master.getContext('2d');
    if (!ctx) return;

    historyStackRef.current.pop();
    const prevState = historyStackRef.current[historyStackRef.current.length - 1];
    if (prevState) {
      ctx.putImageData(prevState, 0, 0);
      notifyTextureUpdated();
      if (activeZone) {
        syncMasterToIsolated(activeZone);
      }
    }
  };

  // Helper to draw specific isolated face guidelines on a single isolated piece
  function drawIsolatedGuidelines(ctx: CanvasRenderingContext2D, zone: UVZone) {
    ctx.save();
    ctx.strokeStyle = zone.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, zone.w, zone.h);

    // If zone has individual faces (e.g. Front, Back, Left, Right sides)
    if (zone.faces && zone.faces.length > 0) {
      zone.faces.forEach((face) => {
        const localX = face.x - zone.x;
        const localY = face.y - zone.y;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(localX, localY, face.w, face.h);

        // Face Header Badge
        ctx.fillStyle = 'rgba(15, 15, 20, 0.75)';
        ctx.fillRect(localX + 2, localY + 2, face.w - 4, 18);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px "Nunito", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(face.name, localX + face.w / 2, localY + 14);
      });
    }

    ctx.restore();
  }

  // Master Canvas Coordinate calculations
  const getMasterCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const master = masterCanvasRef.current;
    if (!master) return { x: 0, y: 0 };
    const rect = master.getBoundingClientRect();
    const scaleX = 1024 / rect.width;
    const scaleY = 1024 / rect.height;
    return {
      x: Math.max(0, Math.min(1023, (e.clientX - rect.left) * scaleX)),
      y: Math.max(0, Math.min(1023, (e.clientY - rect.top) * scaleY)),
    };
  };

  // Isolated Canvas Coordinate calculations
  const getIsolatedCoords = (e: React.PointerEvent<HTMLCanvasElement>, zone: UVZone) => {
    const iso = isolatedCanvasRef.current;
    if (!iso) return { localX: 0, localY: 0, masterX: 0, masterY: 0 };
    const rect = iso.getBoundingClientRect();
    const scaleX = zone.w / rect.width;
    const scaleY = zone.h / rect.height;

    const localX = Math.max(0, Math.min(zone.w, (e.clientX - rect.left) * scaleX));
    const localY = Math.max(0, Math.min(zone.h, (e.clientY - rect.top) * scaleY));

    return {
      localX,
      localY,
      masterX: zone.x + localX,
      masterY: zone.y + localY,
    };
  };

  // --- DRAWING HANDLERS FOR MASTER (FULL) CANVAS ---
  const handleMasterPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const coords = getMasterCoords(e);
    isDrawingRef.current = true;
    lastPosRef.current = coords;

    const master = masterCanvasRef.current;
    if (!master) return;
    const ctx = master.getContext('2d');
    if (!ctx) return;

    if (currentTool === 'stamp') {
      drawMotifStamp(ctx, selectedStamp.pathType, coords.x, coords.y, stampSize, currentColor);
      pushToHistory();
      notifyTextureUpdated();
    } else {
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = currentTool === 'eraser' ? '#18181B' : currentColor;
      ctx.fill();
      scheduleTextureUpdate();
    }
  };

  const handleMasterPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const coords = getMasterCoords(e);

    const matchedZone = UV_ZONES.find(
      (z) =>
        coords.x >= z.x &&
        coords.x <= z.x + z.w &&
        coords.y >= z.y &&
        coords.y <= z.y + z.h
    );
    setHoverZone(matchedZone ? `${matchedZone.name}: ${matchedZone.subText}` : null);

    if (!isDrawingRef.current || currentTool === 'stamp') return;
    const master = masterCanvasRef.current;
    if (!master || !lastPosRef.current) return;
    const ctx = master.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = currentTool === 'eraser' ? '#18181B' : currentColor;

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    ctx.restore();

    lastPosRef.current = coords;
    scheduleTextureUpdate();
  };

  const handleMasterPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    if (isDrawingRef.current && currentTool !== 'stamp') {
      pushToHistory();
      notifyTextureUpdated();
    }
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  // --- DRAWING HANDLERS FOR ISOLATED CANVAS ---
  const handleIsolatedPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activeZone) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { localX, localY, masterX, masterY } = getIsolatedCoords(e, activeZone);
    isDrawingRef.current = true;
    lastPosRef.current = { x: localX, y: localY };

    const iso = isolatedCanvasRef.current;
    const master = masterCanvasRef.current;
    if (!iso || !master) return;

    const isoCtx = iso.getContext('2d');
    const masterCtx = master.getContext('2d');
    if (!isoCtx || !masterCtx) return;

    if (currentTool === 'stamp') {
      drawMotifStamp(isoCtx, selectedStamp.pathType, localX, localY, stampSize, currentColor);
      drawMotifStamp(masterCtx, selectedStamp.pathType, masterX, masterY, stampSize, currentColor);
      pushToHistory();
      notifyTextureUpdated();
    } else {
      const col = currentTool === 'eraser' ? '#18181B' : currentColor;
      // Local isolated canvas
      isoCtx.beginPath();
      isoCtx.arc(localX, localY, brushSize / 2, 0, Math.PI * 2);
      isoCtx.fillStyle = col;
      isoCtx.fill();

      // Master 1024x1024 canvas
      masterCtx.beginPath();
      masterCtx.arc(masterX, masterY, brushSize / 2, 0, Math.PI * 2);
      masterCtx.fillStyle = col;
      masterCtx.fill();

      scheduleTextureUpdate();
    }
  };

  const handleIsolatedPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activeZone || !isDrawingRef.current || currentTool === 'stamp') return;
    const { localX, localY, masterX, masterY } = getIsolatedCoords(e, activeZone);
    const iso = isolatedCanvasRef.current;
    const master = masterCanvasRef.current;
    if (!iso || !master || !lastPosRef.current) return;

    const isoCtx = iso.getContext('2d');
    const masterCtx = master.getContext('2d');
    if (!isoCtx || !masterCtx) return;

    const col = currentTool === 'eraser' ? '#18181B' : currentColor;

    // Draw on isolated canvas
    isoCtx.save();
    isoCtx.lineWidth = brushSize;
    isoCtx.lineCap = 'round';
    isoCtx.lineJoin = 'round';
    isoCtx.strokeStyle = col;
    isoCtx.beginPath();
    isoCtx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    isoCtx.lineTo(localX, localY);
    isoCtx.stroke();
    isoCtx.restore();

    // Mirror immediately onto master canvas
    masterCtx.save();
    masterCtx.lineWidth = brushSize;
    masterCtx.lineCap = 'round';
    masterCtx.lineJoin = 'round';
    masterCtx.strokeStyle = col;
    masterCtx.beginPath();
    masterCtx.moveTo(activeZone.x + lastPosRef.current.x, activeZone.y + lastPosRef.current.y);
    masterCtx.lineTo(masterX, masterY);
    masterCtx.stroke();
    masterCtx.restore();

    lastPosRef.current = { x: localX, y: localY };
    scheduleTextureUpdate();
  };

  const handleIsolatedPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    if (isDrawingRef.current && currentTool !== 'stamp') {
      pushToHistory();
      notifyTextureUpdated();
    }
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  // Upload image handler with automatic cleaning of any lingering guide words
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const master = masterCanvasRef.current;
        if (!master) return;
        const ctx = master.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, 1024, 1024);

        // Auto-clean any lingering guide words / header badges that were baked into the template
        cleanGuideWordsFromCanvas(ctx, 1024, 1024);

        pushToHistory();
        notifyTextureUpdated();

        if (activeZone) {
          syncMasterToIsolated(activeZone);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Clean guide words manually from currently loaded texture
  const handleCleanGuideWords = () => {
    const master = masterCanvasRef.current;
    if (!master) return;
    const ctx = master.getContext('2d');
    if (!ctx) return;

    cleanGuideWordsFromCanvas(ctx, 1024, 1024);
    pushToHistory();
    notifyTextureUpdated();

    if (activeZone) {
      syncMasterToIsolated(activeZone);
    }
  };

  const handleDownload = (includeGuidelines: boolean) => {
    const master = masterCanvasRef.current;
    if (!master) return;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;
    const exportCtx = exportCanvas.getContext('2d')!;

    exportCtx.drawImage(master, 0, 0);

    if (includeGuidelines) {
      drawCulturalGuidelines(exportCtx, 1024, 1024, true);
    }

    const link = document.createElement('a');
    link.download = `SacViet_UV_${presetName.replace(/\s+/g, '_')}_${
      includeGuidelines ? 'guided' : 'clean'
    }.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col gap-2.5 text-zinc-200 font-sans">
      {/* 1. TOP TOOLBAR: Pen, Eraser, Stamp, Undo, Clean Guides, Guides Toggle, Upload */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-[#141418] rounded-xl border border-[#26262E]">
        {/* Tool selector */}
        <div className="flex items-center gap-1 bg-[#1A1A20] p-1 rounded-lg border border-[#2D2D36]">
          <button
            onClick={() => setCurrentTool('brush')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              currentTool === 'brush'
                ? 'bg-red-600 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-[#25252E]'
            }`}
          >
            <Paintbrush className="w-3 h-3" />
            <span>Vẽ</span>
          </button>

          <button
            onClick={() => setCurrentTool('eraser')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              currentTool === 'eraser'
                ? 'bg-red-600 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-[#25252E]'
            }`}
          >
            <Eraser className="w-3 h-3" />
            <span>Tẩy</span>
          </button>

          <button
            onClick={() => setCurrentTool('stamp')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              currentTool === 'stamp'
                ? 'bg-red-600 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-[#25252E]'
            }`}
          >
            <Stamp className="w-3 h-3" />
            <span>Dấu Hoa Văn</span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleUndo}
            title="Hoàn tác nét vẽ (Undo)"
            className="p-1.5 rounded-lg bg-[#1A1A20] hover:bg-[#25252E] text-zinc-300 border border-[#2D2D36] transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCleanGuideWords}
            title="Xóa chữ hướng dẫn còn sót lại trên texture nạp vào"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1A1A20] hover:bg-[#25252E] border border-[#2D2D36] text-xs font-medium text-amber-300 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Xóa Chữ Hướng Dẫn</span>
          </button>

          <button
            onClick={() => setShowGuides(!showGuides)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              showGuides
                ? 'bg-red-950/40 border-red-800 text-red-300'
                : 'bg-[#1A1A20] border-[#2D2D36] text-zinc-400'
            }`}
          >
            {showGuides ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span className="hidden sm:inline">Đường Căn</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1A1A20] hover:bg-[#25252E] border border-[#2D2D36] text-xs font-medium text-zinc-200 transition-colors"
          >
            <Upload className="w-3 h-3 text-red-400" />
            <span>Nạp Ảnh</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
      </div>

      {/* 2. ISOLATION ZONE SELECTOR: CÔ LẬP RIÊNG TỪNG BỘ PHẬN ĐẦY ĐỦ 6 MẶT */}
      <div className="p-2 bg-[#141418] rounded-xl border border-[#26262E] flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-red-500" />
            <span>Cô Lập Chi Tiết Từng Phần (Trải Phẳng 6 Mặt):</span>
          </span>

          {activeZoneId !== 'all' && (
            <button
              onClick={() => setActiveZoneId('all')}
              className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 font-semibold"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Xem Toàn Bộ (1024×1024)</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
          <button
            onClick={() => setActiveZoneId('all')}
            className={`px-2 py-1.5 rounded-lg border text-center transition-all font-semibold ${
              activeZoneId === 'all'
                ? 'bg-red-600 text-white border-red-500 shadow-sm'
                : 'bg-[#18181D] border-[#26262E] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            }`}
          >
            Toàn Bộ Bản Vẽ (1024×1024)
          </button>

          <button
            onClick={() => setActiveZoneId('torso')}
            className={`px-2 py-1.5 rounded-lg border text-center transition-all font-semibold ${
              activeZoneId === 'torso'
                ? 'bg-red-600 text-white border-red-500 shadow-sm'
                : 'bg-[#18181D] border-[#26262E] text-zinc-300 hover:border-zinc-700'
            }`}
          >
            Thân Áo (Đầy đủ 6 mặt)
          </button>

          <button
            onClick={() => setActiveZoneId('skirt_front')}
            className={`px-2 py-1.5 rounded-lg border text-center transition-all font-semibold ${
              activeZoneId === 'skirt_front'
                ? 'bg-red-600 text-white border-red-500 shadow-sm'
                : 'bg-[#18181D] border-[#26262E] text-zinc-300 hover:border-zinc-700'
            }`}
          >
            Tà Áo Dài Trước
          </button>

          <button
            onClick={() => setActiveZoneId('skirt_back')}
            className={`px-2 py-1.5 rounded-lg border text-center transition-all font-semibold ${
              activeZoneId === 'skirt_back'
                ? 'bg-red-600 text-white border-red-500 shadow-sm'
                : 'bg-[#18181D] border-[#26262E] text-zinc-300 hover:border-zinc-700'
            }`}
          >
            Tà Áo Dài Sau
          </button>

          <button
            onClick={() => setActiveZoneId('arm_left')}
            className={`px-2 py-1.5 rounded-lg border text-center transition-all font-semibold ${
              activeZoneId === 'arm_left'
                ? 'bg-red-600 text-white border-red-500 shadow-sm'
                : 'bg-[#18181D] border-[#26262E] text-zinc-300 hover:border-zinc-700'
            }`}
          >
            Tay Áo Trái (6 mặt)
          </button>

          <button
            onClick={() => setActiveZoneId('arm_right')}
            className={`px-2 py-1.5 rounded-lg border text-center transition-all font-semibold ${
              activeZoneId === 'arm_right'
                ? 'bg-red-600 text-white border-red-500 shadow-sm'
                : 'bg-[#18181D] border-[#26262E] text-zinc-300 hover:border-zinc-700'
            }`}
          >
            Tay Áo Phải (6 mặt)
          </button>

          <button
            onClick={() => setActiveZoneId('leg_left')}
            className={`px-2 py-1.5 rounded-lg border text-center transition-all font-semibold ${
              activeZoneId === 'leg_left'
                ? 'bg-red-600 text-white border-red-500 shadow-sm'
                : 'bg-[#18181D] border-[#26262E] text-zinc-300 hover:border-zinc-700'
            }`}
          >
            Quần Trái (4 mặt ống)
          </button>

          <button
            onClick={() => setActiveZoneId('leg_right')}
            className={`px-2 py-1.5 rounded-lg border text-center transition-all font-semibold ${
              activeZoneId === 'leg_right'
                ? 'bg-red-600 text-white border-red-500 shadow-sm'
                : 'bg-[#18181D] border-[#26262E] text-zinc-300 hover:border-zinc-700'
            }`}
          >
            Quần Phải (4 mặt ống)
          </button>
        </div>
      </div>

      {/* 3. TOOL PARAMETERS: Palette, Brush Size, Cultural Stamps */}
      {currentTool === 'stamp' ? (
        <div className="p-2.5 bg-[#141418] rounded-xl border border-[#26262E] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Chọn con dấu hoa văn cổ:</span>
            <span>Cỡ: {stampSize}px</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {CULTURAL_STAMPS.map((stamp) => (
              <button
                key={stamp.id}
                onClick={() => setSelectedStamp(stamp)}
                className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-center transition-all ${
                  selectedStamp.id === stamp.id
                    ? 'border-red-600 bg-red-950/30 text-red-200'
                    : 'border-[#26262E] bg-[#18181D] text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <span className="text-[10px] font-semibold leading-tight">{stamp.name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-[11px] text-zinc-400">Kích thước:</span>
            <input
              type="range"
              min="24"
              max="160"
              value={stampSize}
              onChange={(e) => setStampSize(Number(e.target.value))}
              className="flex-1 accent-red-600 h-1.5 bg-[#25252E] rounded-lg"
            />
          </div>
        </div>
      ) : (
        <div className="p-2 bg-[#141418] rounded-xl border border-[#26262E] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-zinc-300">
            <span>Nét:</span>
            <input
              type="range"
              min="2"
              max="60"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-24 accent-red-600 h-1.5 bg-[#25252E] rounded-lg"
            />
            <span className="w-6 text-right font-mono text-zinc-400 text-[11px]">{brushSize}px</span>
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            {HERITAGE_PALETTE.map((pal) => (
              <button
                key={pal.hex}
                onClick={() => setCurrentColor(pal.hex)}
                title={pal.name}
                className={`w-4.5 h-4.5 rounded border transition-transform ${
                  currentColor.toLowerCase() === pal.hex.toLowerCase()
                    ? 'scale-125 border-white ring-2 ring-red-600/60'
                    : 'border-[#3F3F46] hover:scale-110'
                }`}
                style={{ backgroundColor: pal.hex }}
              />
            ))}
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border border-[#3F3F46] bg-transparent"
              title="Màu khác"
            />
          </div>
        </div>
      )}

      {/* 4. CANVAS VIEWPORT: PERSISTENT MASTER + ISOLATED VIEW (NEVER UNMOUNTED) */}
      <div className="relative w-full rounded-xl border border-[#26262E] shadow-xl bg-[#0F0F13] p-4 select-none flex flex-col items-center justify-center min-h-[440px]">
        {/* MASTER VIEW (Visible when activeZoneId is 'all', hidden otherwise to preserve image memory) */}
        <div className={activeZone ? 'hidden' : 'flex flex-col items-center w-full'}>
          <div
            className="relative mx-auto rounded-lg shadow-2xl border border-[#26262E] bg-[#141418] overflow-hidden"
            style={{
              width: '460px',
              height: '460px',
              maxWidth: '94%',
              aspectRatio: '1 / 1',
            }}
          >
            <canvas
              ref={masterCanvasRef}
              width={1024}
              height={1024}
              onPointerDown={handleMasterPointerDown}
              onPointerMove={handleMasterPointerMove}
              onPointerUp={handleMasterPointerUp}
              onPointerCancel={handleMasterPointerUp}
              className="w-full h-full block cursor-crosshair rounded-lg shadow-2xl touch-none"
            />

            <canvas
              ref={masterOverlayRef}
              width={1024}
              height={1024}
              className="w-full h-full block absolute top-0 left-0 pointer-events-none rounded-lg"
            />

            {hoverZone && (
              <div className="absolute bottom-2 left-2 right-2 bg-[#141418]/95 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-red-900/60 text-[11px] text-zinc-200 flex items-center gap-1.5 pointer-events-none shadow-lg">
                <Info className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="font-semibold truncate">{hoverZone}</span>
              </div>
            )}
          </div>
        </div>

        {/* ISOLATED VIEW (Visible only when a zone is selected) */}
        {activeZone && (
          <div className="flex flex-col items-center gap-3 w-full animate-fadeIn">
            <div className="flex items-center justify-between w-full max-w-lg px-3 py-1.5 bg-[#18181E] rounded-lg border border-[#2D2D36] text-[11px]">
              <div className="flex items-center gap-1.5 text-red-400 font-bold truncate">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Đang cô lập vùng vẽ: {activeZone.name}</span>
              </div>
              <span className="text-zinc-400 text-[10px] font-mono">
                {activeZone.w} × {activeZone.h} px
              </span>
            </div>

            {/* Isolated Canvas Container */}
            <div
              className="relative rounded-lg shadow-2xl border-2 border-red-600/70 bg-[#141418] overflow-hidden"
              style={{
                width: `${Math.min(520, Math.round(activeZone.w * 1.55))}px`,
                height: `${Math.min(520, Math.round(activeZone.h * 1.55))}px`,
                maxWidth: '94%',
                aspectRatio: `${activeZone.w} / ${activeZone.h}`,
              }}
            >
              <canvas
                ref={isolatedCanvasRef}
                width={activeZone.w}
                height={activeZone.h}
                onPointerDown={handleIsolatedPointerDown}
                onPointerMove={handleIsolatedPointerMove}
                onPointerUp={handleIsolatedPointerUp}
                onPointerCancel={handleIsolatedPointerUp}
                className="w-full h-full block cursor-crosshair touch-none"
              />

              <canvas
                ref={isolatedOverlayRef}
                width={activeZone.w}
                height={activeZone.h}
                className="w-full h-full block absolute top-0 left-0 pointer-events-none"
              />
            </div>

            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Từng mặt được trải phẳng rõ ràng. Nét vẽ tự động cập nhật thời gian thực sang mẫu 3D.</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. DOWNLOAD ACTION FOOTER */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 bg-[#141418] rounded-xl border border-[#26262E]">
        <div className="flex items-center gap-1 text-[11px] text-zinc-400">
          <span>Xuất bản vẽ UV (1024×1024):</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleDownload(false)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1A1A20] hover:bg-[#25252E] border border-[#2D2D36] text-[11px] font-semibold text-zinc-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Tải PNG Sạch (Không chữ)</span>
          </button>

          <button
            onClick={() => handleDownload(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-[11px] transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải Bản Kèm Đường Căn Mảnh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
