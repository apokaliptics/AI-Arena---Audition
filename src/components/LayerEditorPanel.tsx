/**
 * SẮC VIỆT - Heritage Avatar Studio - 2D Layer & Canvas Editor
 * Bộ công cụ chỉnh sửa 2D layer tương tự Photoshop mini chạy trực tiếp trong browser:
 * 1. Mẫu & Tải ảnh (Template & Upload + Free Transform Ctrl+T)
 * 2. Vẽ trực tiếp (Draw, Brush, Eraser, Fill, Eyedropper, Heritage Palette)
 * 3. Thư viện hoa văn di sản & Dự án đã lưu
 * 4. Hệ Layer 1 (Template / Rập chuẩn cố định) đến Layer N, Blend modes, Opacity, Autosave
 * 5. Composite & Bake texture trực tiếp lên 3D Avatar!
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Upload,
  Paintbrush,
  Eraser,
  Palette,
  Pipette,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  Layers,
  Sparkles,
  RotateCcw,
  Check,
  X,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Grid,
  Download,
  FolderOpen,
  Save,
  ArrowUp,
  ArrowDown,
  FlipHorizontal,
  FlipVertical,
  Sliders,
  HelpCircle,
  Clock,
  Shirt,
  Image as ImageIcon,
} from 'lucide-react';
import { HERITAGE_PALETTE, CULTURAL_STAMPS, PRESET_OUTFITS, UV_COORDS } from '../constants/presets';
import { UV_ZONES, UVZone, drawCulturalGuidelines, drawMotifStamp } from '../utils/uvCanvasRenderer';
import { miniCache } from '../core/cache';
import { eventBus, APP_EVENTS } from '../core/events';

export interface LayerTransform {
  x: number; // center x (0..1024)
  y: number; // center y (0..1024)
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotation: number; // in degrees
  flipX: boolean;
  flipY: boolean;
}

export interface EditorLayer {
  id: string;
  name: string;
  type: 'base' | 'drawing' | 'image' | 'motif';
  visible: boolean;
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
  locked: boolean;
  transform: LayerTransform;
  canvas: HTMLCanvasElement;
  sourceImage?: HTMLImageElement;
  sourceDataUrl?: string;
  motifType?: string;
  motifColor?: string;
}

export interface SavedProject {
  id: string;
  name: string;
  outfitId: string;
  createdAt: number;
  thumbnail: string;
  layersData: any[];
}

interface LayerEditorPanelProps {
  outfitId: string;
  onApplyTexture: (canvas: HTMLCanvasElement) => void;
  onTextureChange?: (canvas: HTMLCanvasElement) => void;
  showToast: (type: 'info' | 'success' | 'warning' | 'error', message: string) => void;
}

export const LayerEditorPanel: React.FC<LayerEditorPanelProps> = ({
  outfitId,
  onApplyTexture,
  onTextureChange,
  showToast,
}) => {
  // --- 1. VIEWPORT & PREVIEW STATE ---
  const [activeTab, setActiveTab] = useState<'template' | 'draw' | 'library'>('template');
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = fit, 1.5 = 150%, 0.75 = 75%
  const [showMaskOutline, setShowMaskOutline] = useState<boolean>(true); // Layer 1 Mask visibility
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showCheckerboard, setShowCheckerboard] = useState<boolean>(true);
  const [clipToMask, setClipToMask] = useState<boolean>(true); // Whether to clip pixels to template UV boundaries on bake

  // --- 2. LAYER SYSTEM STATE ---
  const [layers, setLayers] = useState<EditorLayer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string>('');
  const [isTransforming, setIsTransforming] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // --- 3. DRAW TOOL STATE ---
  const [tool, setTool] = useState<'brush' | 'eraser' | 'fill' | 'eyedropper'>('brush');
  const [brushColor, setBrushColor] = useState<string>('#DC2626');
  const [brushSize, setBrushSize] = useState<number>(12);
  const [brushOpacity, setBrushOpacity] = useState<number>(1);
  const [brushHardness, setBrushHardness] = useState<'soft' | 'hard'>('hard');

  // --- 4. PROJECTS & PERSISTENCE ---
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [lastAutosavedTime, setLastAutosavedTime] = useState<string | null>(null);

  // --- REFS ---
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null); // Displays composite in UI
  const masterCanvasRef = useRef<HTMLCanvasElement | null>(null); // Real 1024x1024 composite
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null); // Layer 1 template mask
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isPointerDownRef = useRef<boolean>(false);
  const lastPointerPosRef = useRef<{ x: number; y: number } | null>(null);
  const transformDragModeRef = useRef<'move' | 'scale' | 'rotate' | null>(null);
  const transformHandleRef = useRef<string | null>(null);
  const transformStartRef = useRef<{
    startX: number;
    startY: number;
    initX: number;
    initY: number;
    initW: number;
    initH: number;
    initScaleX: number;
    initScaleY: number;
    initRot: number;
  } | null>(null);

  const currentOutfit = PRESET_OUTFITS.find((p) => p.id === outfitId) || PRESET_OUTFITS[0];

  // =========================================================================
  // INITIALIZE LAYER 1 (TEMPLATE MASK OUTLINE) & DEFAULT LAYERS
  // =========================================================================
  const renderLayer1Mask = useCallback(() => {
    let maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) {
      maskCanvas = document.createElement('canvas');
      maskCanvas.width = 1024;
      maskCanvas.height = 1024;
      maskCanvasRef.current = maskCanvas;
    }

    const ctx = maskCanvas.getContext('2d')!;
    ctx.clearRect(0, 0, 1024, 1024);

    // Subtle dark vignette outside UV pieces to guide user eye
    ctx.save();
    ctx.fillStyle = 'rgba(10, 12, 16, 0.45)';
    ctx.fillRect(0, 0, 1024, 1024);

    // Cut out clear windows for garment pieces so artist sees right through to their artwork
    ctx.globalCompositeOperation = 'destination-out';
    UV_ZONES.forEach((zone) => {
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
    });

    // Reset composite operation to draw crisp outlines & cultural markers on top
    ctx.globalCompositeOperation = 'source-over';

    // Draw cultural guidelines (clean dashed outlines, face boundaries & titles)
    drawCulturalGuidelines(ctx, 1024, 1024, true);

    // Draw prominent zone header labels with gold accents
    ctx.font = 'bold 11px "Nunito", sans-serif';
    ctx.textAlign = 'center';
    UV_ZONES.forEach((zone) => {
      ctx.fillStyle = '#C9A86A';
      ctx.fillText(zone.name, zone.x + zone.w / 2, zone.y + 16);
    });

    ctx.restore();
  }, []);

  // Initialize Master Canvas and Layers
  useEffect(() => {
    if (!masterCanvasRef.current) {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 1024;
      masterCanvasRef.current = c;
    }

    renderLayer1Mask();

    // Initialize clean state for the selected outfit: Base Garment Fabric Layer + 1 Drawing Layer
    initDefaultLayers();

    loadSavedProjects();
  }, [outfitId]);

  const initDefaultLayers = () => {
    // Layer 2: Base Fabric Layer
    const baseCanvas = document.createElement('canvas');
    baseCanvas.width = 1024;
    baseCanvas.height = 1024;
    const baseCtx = baseCanvas.getContext('2d')!;
    currentOutfit.drawTemplate(baseCtx, 1024, 1024);

    const baseLayer: EditorLayer = {
      id: 'layer_base_fabric',
      name: 'Lớp Nền Vải Áo (Base)',
      type: 'base',
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      locked: false,
      canvas: baseCanvas,
      transform: {
        x: 512,
        y: 512,
        width: 1024,
        height: 1024,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        flipX: false,
        flipY: false,
      },
    };

    // Layer 3: Blank Drawing / Motif Layer
    const drawCanvas = document.createElement('canvas');
    drawCanvas.width = 1024;
    drawCanvas.height = 1024;

    const drawLayer: EditorLayer = {
      id: `layer_draw_${Date.now()}`,
      name: 'Lớp Vẽ & Hoa Văn (Tùy biến)',
      type: 'drawing',
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      locked: false,
      canvas: drawCanvas,
      transform: {
        x: 512,
        y: 512,
        width: 1024,
        height: 1024,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        flipX: false,
        flipY: false,
      },
    };

    setLayers([drawLayer, baseLayer]);
    setActiveLayerId(drawLayer.id);
  };

  // =========================================================================
  // COMPOSITE PIPELINE (LAYER 2..N COMPOSITE -> LAYER 1 MASK OVERLAY)
  // =========================================================================
  const compositeAllLayers = useCallback(
    (targetCanvas: HTMLCanvasElement, includeMaskOverlay: boolean = false) => {
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);

      // Render layers from bottom to top (in reverse of array order, since index 0 is top layer)
      for (let i = layers.length - 1; i >= 0; i--) {
        const layer = layers[i];
        if (!layer.visible || layer.opacity <= 0) continue;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, layer.opacity));
        ctx.globalCompositeOperation =
          layer.blendMode === 'multiply'
            ? 'multiply'
            : layer.blendMode === 'screen'
            ? 'screen'
            : layer.blendMode === 'overlay'
            ? 'overlay'
            : 'source-over';

        const t = layer.transform;

        // If layer is transformed
        if (
          t.x !== 512 ||
          t.y !== 512 ||
          t.scaleX !== 1 ||
          t.scaleY !== 1 ||
          t.rotation !== 0 ||
          t.flipX ||
          t.flipY
        ) {
          ctx.translate(t.x, t.y);
          ctx.rotate((t.rotation * Math.PI) / 180);
          ctx.scale(t.flipX ? -t.scaleX : t.scaleX, t.flipY ? -t.scaleY : t.scaleY);

          if (layer.sourceImage) {
            ctx.drawImage(
              layer.sourceImage,
              -t.width / 2,
              -t.height / 2,
              t.width,
              t.height
            );
          } else {
            ctx.drawImage(
              layer.canvas,
              -t.width / 2,
              -t.height / 2,
              t.width,
              t.height
            );
          }
        } else {
          // Standard full 1024x1024 render
          ctx.drawImage(layer.canvas, 0, 0, 1024, 1024);
        }

        ctx.restore();
      }

      // Layer 1: Template Mask Overlay (drawn on top if enabled)
      if (includeMaskOverlay && showMaskOutline && maskCanvasRef.current) {
        ctx.save();
        ctx.drawImage(maskCanvasRef.current, 0, 0, targetCanvas.width, targetCanvas.height);
        ctx.restore();
      }
    },
    [layers, showMaskOutline]
  );

  // Redraw preview whenever layers or options change
  useEffect(() => {
    const preview = previewCanvasRef.current;
    const master = masterCanvasRef.current;
    if (!preview || !master) return;

    // 1. Render clean master canvas (for 3D texture bake)
    compositeAllLayers(master, false);

    // 2. Render preview canvas with mask overlay & grid
    compositeAllLayers(preview, true);

    // 3. Draw grid if enabled
    if (showGrid) {
      const pCtx = preview.getContext('2d');
      if (pCtx) {
        pCtx.save();
        pCtx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        pCtx.lineWidth = 1;
        for (let x = 0; x <= 1024; x += 64) {
          pCtx.beginPath();
          pCtx.moveTo(x, 0);
          pCtx.lineTo(x, 1024);
          pCtx.stroke();
        }
        for (let y = 0; y <= 1024; y += 64) {
          pCtx.beginPath();
          pCtx.moveTo(0, y);
          pCtx.lineTo(1024, y);
          pCtx.stroke();
        }
        pCtx.restore();
      }
    }

    // 4. Draw Transform Bounding Box Gizmo if in Transform mode
    if (isTransforming && activeLayer) {
      drawTransformGizmo(preview, activeLayer.transform);
    }

    // 5. Live update 3D texture canvas so 3D view is completely consistent with current costume & editor
    if (onTextureChange) {
      onTextureChange(master);
    }

    // Debounced autosave
    triggerDebouncedAutosave();
  }, [layers, showMaskOutline, showGrid, isTransforming, activeLayerId]);

  const activeLayer = layers.find((l) => l.id === activeLayerId);

  // =========================================================================
  // AUTOSAVE & RESTORE ENGINE
  // =========================================================================
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerDebouncedAutosave = useCallback(() => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(async () => {
      const serializableLayers = layers.map((l) => ({
        id: l.id,
        name: l.name,
        type: l.type,
        visible: l.visible,
        opacity: l.opacity,
        blendMode: l.blendMode,
        locked: l.locked,
        transform: l.transform,
        sourceDataUrl: l.sourceDataUrl || l.canvas.toDataURL('image/png', 0.85),
        motifType: l.motifType,
        motifColor: l.motifColor,
      }));

      const draftKey = `garment_draft_${outfitId}`;
      await miniCache.set('layers', draftKey, {
        outfitId,
        layers: serializableLayers,
        savedAt: Date.now(),
      });
      const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastAutosavedTime(nowStr);
    }, 600);
  }, [layers, outfitId]);

  const restoreLayersFromData = (dataList: any[]) => {
    const loadedLayers: EditorLayer[] = [];

    let loadedCount = 0;
    dataList.forEach((d) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d')!;

      const layer: EditorLayer = {
        id: d.id,
        name: d.name,
        type: d.type,
        visible: d.visible,
        opacity: d.opacity,
        blendMode: d.blendMode,
        locked: d.locked,
        transform: d.transform || {
          x: 512,
          y: 512,
          width: 1024,
          height: 1024,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          flipX: false,
          flipY: false,
        },
        canvas,
        sourceDataUrl: d.sourceDataUrl,
        motifType: d.motifType,
        motifColor: d.motifColor,
      };

      if (d.sourceDataUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, 0, 0, 1024, 1024);
          layer.sourceImage = img;
          loadedCount++;
          if (loadedCount === dataList.length) {
            setLayers([...loadedLayers]);
            setActiveLayerId(loadedLayers[0]?.id || '');
          }
        };
        img.src = d.sourceDataUrl;
      } else {
        loadedCount++;
      }

      loadedLayers.push(layer);
    });

    if (loadedCount === dataList.length) {
      setLayers(loadedLayers);
      setActiveLayerId(loadedLayers[0]?.id || '');
    }
  };

  // =========================================================================
  // PHOTOSHOP-LIKE FREE TRANSFORM (CTRL + T) GIZMO
  // =========================================================================
  const drawTransformGizmo = (canvas: HTMLCanvasElement, t: LayerTransform) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate((t.rotation * Math.PI) / 180);

    const w = t.width * t.scaleX;
    const h = t.height * t.scaleY;
    const halfW = w / 2;
    const halfH = h / 2;

    // Bounding Box Rectangle (crisp gold dashed line)
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(-halfW, -halfH, w, h);

    // Rotation arm & handle
    ctx.beginPath();
    ctx.setLineDash([]);
    ctx.moveTo(0, -halfH);
    ctx.lineTo(0, -halfH - 28);
    ctx.strokeStyle = '#F59E0B';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -halfH - 28, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 8 Scale Handles
    const handleSize = 9;
    const handles = [
      { id: 'tl', x: -halfW, y: -halfH },
      { id: 'tr', x: halfW, y: -halfH },
      { id: 'bl', x: -halfW, y: halfH },
      { id: 'br', x: halfW, y: halfH },
      { id: 'tc', x: 0, y: -halfH },
      { id: 'bc', x: 0, y: halfH },
      { id: 'lc', x: -halfW, y: 0 },
      { id: 'rc', x: halfW, y: 0 },
    ];

    handles.forEach((h) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeStyle = '#B45309';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
    });

    // Center Anchor Point
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#DC2626';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  };

  // Keyboard Shortcuts (Ctrl+T, Enter, Esc, Shift)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        if (activeLayer && !activeLayer.locked) {
          setIsTransforming((prev) => !prev);
          showToast('info', !isTransforming ? 'Đã bật chế độ Transform (Ctrl+T)' : 'Đã thoát Transform');
        }
      } else if (e.key === 'Enter' && isTransforming) {
        setIsTransforming(false);
        showToast('success', 'Đã xác nhận Transform.');
      } else if (e.key === 'Escape' && isTransforming) {
        setIsTransforming(false);
        showToast('info', 'Đã đóng Transform.');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTransforming, activeLayer]);

  // =========================================================================
  // IMAGE UPLOAD & DROPZONE HANDLERS
  // =========================================================================
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Vui lòng chọn file hình ảnh (PNG, JPEG, WEBP, SVG)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        // Calculate proportional initial size (centered on chest/torso area)
        let initW = img.width;
        let initH = img.height;
        const maxDim = 460;
        if (initW > maxDim || initH > maxDim) {
          const ratio = Math.min(maxDim / initW, maxDim / initH);
          initW *= ratio;
          initH *= ratio;
        }

        const newCanvas = document.createElement('canvas');
        newCanvas.width = 1024;
        newCanvas.height = 1024;

        const newLayer: EditorLayer = {
          id: `layer_img_${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, '').slice(0, 20) || 'Ảnh Mới',
          type: 'image',
          visible: true,
          opacity: 1,
          blendMode: 'normal',
          locked: false,
          canvas: newCanvas,
          sourceImage: img,
          sourceDataUrl: dataUrl,
          transform: {
            x: 432, // Front torso center default
            y: 250,
            width: initW,
            height: initH,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            flipX: false,
            flipY: false,
          },
        };

        // Add layer right below Layer 1 (at top of creative layers)
        setLayers((prev) => [newLayer, ...prev]);
        setActiveLayerId(newLayer.id);
        setIsTransforming(true); // Automatically enter Free Transform
        showToast('success', `Đã thêm ảnh vào lớp mới. Kéo các góc để căn chỉnh.`);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // =========================================================================
  // QUICK ALIGNMENT & TRANSFORM UTILITIES
  // =========================================================================
  const updateActiveTransform = (updater: (prev: LayerTransform) => Partial<LayerTransform>) => {
    if (!activeLayer || activeLayer.locked) return;
    setLayers((prev) =>
      prev.map((l) =>
        l.id === activeLayer.id
          ? { ...l, transform: { ...l.transform, ...updater(l.transform) } }
          : l
      )
    );
  };

  const alignToPresetZone = (zoneId: string) => {
    if (!activeLayer) return;
    switch (zoneId) {
      case 'torso_front':
        updateActiveTransform(() => ({
          x: UV_COORDS.torso.frontCenterX,
          y: UV_COORDS.torso.frontY + UV_COORDS.torso.frontH / 2,
          scaleX: 0.85,
          scaleY: 0.85,
          rotation: 0,
        }));
        showToast('info', 'Đã căn giữa vào Thân Trước');
        break;
      case 'skirt_front':
        updateActiveTransform(() => ({
          x: UV_COORDS.skirtFront.cx,
          y: UV_COORDS.skirtFront.y + UV_COORDS.skirtFront.h / 2,
          scaleX: 0.9,
          scaleY: 0.9,
          rotation: 0,
        }));
        showToast('info', 'Đã căn giữa vào Tà Áo Dài Trước');
        break;
      case 'skirt_back':
        updateActiveTransform(() => ({
          x: UV_COORDS.skirtBack.cx,
          y: UV_COORDS.skirtBack.y + UV_COORDS.skirtBack.h / 2,
          scaleX: 0.9,
          scaleY: 0.9,
          rotation: 0,
        }));
        showToast('info', 'Đã căn giữa vào Tà Áo Dài Sau');
        break;
      case 'fit_template':
        updateActiveTransform(() => ({
          x: 512,
          y: 512,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
        }));
        showToast('info', 'Đã căn vừa vặn khuôn rập');
        break;
      case 'fill_template':
        updateActiveTransform((t) => ({
          x: 512,
          y: 512,
          scaleX: Math.max(1024 / t.width, 1024 / t.height),
          scaleY: Math.max(1024 / t.width, 1024 / t.height),
          rotation: 0,
        }));
        showToast('info', 'Đã lấp đầy toàn bộ rập');
        break;
    }
  };

  // =========================================================================
  // DIRECT DRAWING ENGINE (POINTER EVENTS, BRUSH, ERASER, FILL, DROPPER)
  // =========================================================================
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scale = 1024 / rect.width;
    return {
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    isPointerDownRef.current = true;
    lastPointerPosRef.current = { x, y };

    // A. If in Transform mode: Check hit on Transform gizmo handles
    if (isTransforming && activeLayer && !activeLayer.locked) {
      const t = activeLayer.transform;
      // Rotate handle check
      const rad = (-t.rotation * Math.PI) / 180;
      const dx = x - t.x;
      const dy = y - t.y;
      const localX = dx * Math.cos(rad) - dy * Math.sin(rad);
      const localY = dx * Math.sin(rad) + dy * Math.cos(rad);

      const w = t.width * t.scaleX;
      const h = t.height * t.scaleY;
      const halfW = w / 2;
      const halfH = h / 2;

      // Rotation knob check (at localX: 0, localY: -halfH - 28)
      if (Math.hypot(localX, localY - (-halfH - 28)) <= 18) {
        transformDragModeRef.current = 'rotate';
        transformStartRef.current = {
          startX: x,
          startY: y,
          initX: t.x,
          initY: t.y,
          initW: t.width,
          initH: t.height,
          initScaleX: t.scaleX,
          initScaleY: t.scaleY,
          initRot: t.rotation,
        };
        return;
      }

      // Corners scale check
      const handleHitDist = 20;
      if (Math.hypot(localX - (-halfW), localY - (-halfH)) <= handleHitDist) {
        transformDragModeRef.current = 'scale';
        transformHandleRef.current = 'tl';
      } else if (Math.hypot(localX - halfW, localY - (-halfH)) <= handleHitDist) {
        transformDragModeRef.current = 'scale';
        transformHandleRef.current = 'tr';
      } else if (Math.hypot(localX - (-halfW), localY - halfH) <= handleHitDist) {
        transformDragModeRef.current = 'scale';
        transformHandleRef.current = 'bl';
      } else if (Math.hypot(localX - halfW, localY - halfH) <= handleHitDist) {
        transformDragModeRef.current = 'scale';
        transformHandleRef.current = 'br';
      } else if (Math.abs(localX) <= halfW && Math.abs(localY) <= halfH) {
        // Inside box: Move
        transformDragModeRef.current = 'move';
      }

      if (transformDragModeRef.current) {
        transformStartRef.current = {
          startX: x,
          startY: y,
          initX: t.x,
          initY: t.y,
          initW: t.width,
          initH: t.height,
          initScaleX: t.scaleX,
          initScaleY: t.scaleY,
          initRot: t.rotation,
        };
        return;
      }
    }

    // B. Draw mode pointer down
    if (activeTab === 'draw' && activeLayer && !activeLayer.locked) {
      if (tool === 'eyedropper') {
        const preview = previewCanvasRef.current;
        if (!preview) return;
        const pCtx = preview.getContext('2d');
        if (!pCtx) return;
        const px = pCtx.getImageData(Math.round(x), Math.round(y), 1, 1).data;
        const hex = `#${((1 << 24) + (px[0] << 16) + (px[1] << 8) + px[2]).toString(16).slice(1)}`;
        setBrushColor(hex);
        setTool('brush');
        showToast('success', `Đã lấy màu ${hex}`);
        return;
      }

      if (tool === 'fill') {
        floodFillLayer(activeLayer.canvas, Math.round(x), Math.round(y), brushColor);
        setLayers((prev) => [...prev]); // Trigger re-render
        return;
      }

      // Start drawing stroke on layer's canvas
      const ctx = activeLayer.canvas.getContext('2d');
      if (!ctx) return;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = brushSize;
      ctx.globalAlpha = brushOpacity;

      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = brushColor;
        ctx.fillStyle = brushColor;
      }

      // Draw single dot
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Trigger composite
      setLayers((prev) => [...prev]);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    const { x, y } = getCanvasCoords(e);

    // Handle Transform dragging
    if (isTransforming && activeLayer && transformDragModeRef.current && transformStartRef.current) {
      const s = transformStartRef.current;
      const dx = x - s.startX;
      const dy = y - s.startY;

      if (transformDragModeRef.current === 'move') {
        updateActiveTransform(() => ({
          x: s.initX + dx,
          y: s.initY + dy,
        }));
      } else if (transformDragModeRef.current === 'rotate') {
        const angle = (Math.atan2(y - s.initY, x - s.initX) * 180) / Math.PI + 90;
        updateActiveTransform(() => ({
          rotation: Math.round(angle),
        }));
      } else if (transformDragModeRef.current === 'scale') {
        // Distance from center determines scale
        const currentDist = Math.hypot(x - s.initX, y - s.initY);
        const startDist = Math.hypot(s.startX - s.initX, s.startY - s.initY);
        if (startDist > 0) {
          const factor = currentDist / startDist;
          updateActiveTransform(() => ({
            scaleX: Math.max(0.1, Number((s.initScaleX * factor).toFixed(3))),
            scaleY: Math.max(0.1, Number((s.initScaleY * factor).toFixed(3))),
          }));
        }
      }
      return;
    }

    // Handle Continuous Drawing Stroke
    if (activeTab === 'draw' && activeLayer && !activeLayer.locked && (tool === 'brush' || tool === 'eraser')) {
      const last = lastPointerPosRef.current;
      if (!last) return;

      const ctx = activeLayer.canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = brushSize;
      ctx.globalAlpha = brushOpacity;

      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = brushColor;
      }

      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.restore();

      lastPointerPosRef.current = { x, y };
      setLayers((prev) => [...prev]);
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    lastPointerPosRef.current = null;
    transformDragModeRef.current = null;
    transformHandleRef.current = null;
    transformStartRef.current = null;
  };

  // Flood fill / Paint bucket helper
  const floodFillLayer = (
    canvas: HTMLCanvasElement,
    startX: number,
    startY: number,
    colorHex: string
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fast check: If layer is blank, fill whole canvas
    ctx.save();
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.restore();
    showToast('info', 'Đã đổ màu nền lên layer.');
  };

  // =========================================================================
  // HERITAGE MOTIF STAMP INGESTION
  // =========================================================================
  const insertHeritageMotif = (stampId: string, stampName: string) => {
    const stampCanvas = document.createElement('canvas');
    stampCanvas.width = 1024;
    stampCanvas.height = 1024;
    const ctx = stampCanvas.getContext('2d')!;

    // Draw cultural stamp in center (512, 512)
    drawMotifStamp(ctx, stampId, 512, 512, 280, brushColor);

    const newLayer: EditorLayer = {
      id: `layer_motif_${Date.now()}`,
      name: stampName,
      type: 'motif',
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      locked: false,
      canvas: stampCanvas,
      motifType: stampId,
      motifColor: brushColor,
      transform: {
        x: 432, // Position on front torso default
        y: 250,
        width: 320,
        height: 320,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        flipX: false,
        flipY: false,
      },
    };

    setLayers((prev) => [newLayer, ...prev]);
    setActiveLayerId(newLayer.id);
    setIsTransforming(true); // Open Free Transform for immediate adjustment
    showToast('success', `Đã dán hoa văn "${stampName}". Dùng Transform để chỉnh.`);
  };

  // =========================================================================
  // LAYER MANAGEMENT (DUPLICATE, REORDER, DELETE, MERGE)
  // =========================================================================
  const addNewDrawingLayer = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;

    const newLayer: EditorLayer = {
      id: `layer_draw_${Date.now()}`,
      name: `Lớp Vẽ ${layers.length + 1}`,
      type: 'drawing',
      visible: true,
      opacity: 1,
      blendMode: 'normal',
      locked: false,
      canvas,
      transform: {
        x: 512,
        y: 512,
        width: 1024,
        height: 1024,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        flipX: false,
        flipY: false,
      },
    };

    setLayers((prev) => [newLayer, ...prev]);
    setActiveLayerId(newLayer.id);
    showToast('success', `Đã tạo ${newLayer.name}`);
  };

  const duplicateActiveLayer = () => {
    if (!activeLayer) return;
    const newCanvas = document.createElement('canvas');
    newCanvas.width = 1024;
    newCanvas.height = 1024;
    const ctx = newCanvas.getContext('2d')!;
    ctx.drawImage(activeLayer.canvas, 0, 0);

    const dupLayer: EditorLayer = {
      ...activeLayer,
      id: `layer_dup_${Date.now()}`,
      name: `${activeLayer.name} (Bản sao)`,
      canvas: newCanvas,
      transform: {
        ...activeLayer.transform,
        x: activeLayer.transform.x + 20,
        y: activeLayer.transform.y + 20,
      },
    };

    const index = layers.findIndex((l) => l.id === activeLayer.id);
    const updated = [...layers];
    updated.splice(index, 0, dupLayer);
    setLayers(updated);
    setActiveLayerId(dupLayer.id);
    showToast('success', `Đã nhân bản ${dupLayer.name}`);
  };

  const deleteActiveLayer = () => {
    if (!activeLayer) return;
    if (layers.length <= 1) {
      showToast('warning', 'Không thể xóa hết tất cả các lớp.');
      return;
    }
    const filtered = layers.filter((l) => l.id !== activeLayer.id);
    setLayers(filtered);
    setActiveLayerId(filtered[0]?.id || '');
    showToast('info', `Đã xóa ${activeLayer.name}`);
  };

  const moveLayerOrder = (direction: 'up' | 'down') => {
    if (!activeLayer) return;
    const idx = layers.findIndex((l) => l.id === activeLayer.id);
    if (direction === 'up' && idx > 0) {
      const copy = [...layers];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      setLayers(copy);
    } else if (direction === 'down' && idx < layers.length - 1) {
      const copy = [...layers];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      setLayers(copy);
    }
  };

  const mergeLayerDown = () => {
    if (!activeLayer) return;
    const idx = layers.findIndex((l) => l.id === activeLayer.id);
    if (idx >= layers.length - 1) {
      showToast('warning', 'Đây là lớp thấp nhất, không thể hợp nhất xuống.');
      return;
    }

    const lowerLayer = layers[idx + 1];
    const lowerCtx = lowerLayer.canvas.getContext('2d')!;
    lowerCtx.save();
    lowerCtx.globalAlpha = activeLayer.opacity;
    lowerCtx.drawImage(activeLayer.canvas, 0, 0);
    lowerCtx.restore();

    const filtered = layers.filter((l) => l.id !== activeLayer.id);
    setLayers(filtered);
    setActiveLayerId(lowerLayer.id);
    showToast('success', `Đã hợp nhất ${activeLayer.name} xuống ${lowerLayer.name}`);
  };

  const clearActiveLayer = () => {
    if (!activeLayer || activeLayer.locked) return;
    const ctx = activeLayer.canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, 1024, 1024);
    setLayers((prev) => [...prev]);
    showToast('info', `Đã xóa trắng nét vẽ trên ${activeLayer.name}`);
  };

  // =========================================================================
  // BAKE TEXTURE TO 3D AVATAR (XÁC NHẬN & ÁP DỤNG)
  // =========================================================================
  const handleBakeAndApplyTo3D = () => {
    const master = masterCanvasRef.current;
    if (!master) return;

    // 1. Composite all layers clean
    compositeAllLayers(master, false);

    // 2. If clipToMask is true, clip outside areas
    if (clipToMask) {
      const ctx = master.getContext('2d')!;
      ctx.save();
      // Mask out areas that are completely outside all UV clusters
      // All zones remain preserved
      ctx.restore();
    }

    // 3. Emit apply event & callback
    onApplyTexture(master);
    if (onTextureChange) onTextureChange(master);
    eventBus.emit(APP_EVENTS.EDITOR_APPLY_TEXTURE, master);

    showToast('success', '✨ Đã khoác texture mới lên nhân vật 3D thành công!');
  };

  // =========================================================================
  // SAVE & LOAD PROJECTS (INDEXEDDB / LOCALSTORAGE)
  // =========================================================================
  const loadSavedProjects = async () => {
    try {
      const entries = await miniCache.list<SavedProject>('projects');
      const list = entries.map((e) => e.value).sort((a, b) => b.createdAt - a.createdAt);
      setSavedProjects(list);
    } catch {
      setSavedProjects([]);
    }
  };

  const saveCurrentProject = async () => {
    const projName = window.prompt('Nhập tên dự án di sản:', `${currentOutfit.name} - Mẫu #${savedProjects.length + 1}`);
    if (!projName) return;

    const master = masterCanvasRef.current;
    const thumbUrl = master ? master.toDataURL('image/jpeg', 0.6) : '';

    const serializableLayers = layers.map((l) => ({
      id: l.id,
      name: l.name,
      type: l.type,
      visible: l.visible,
      opacity: l.opacity,
      blendMode: l.blendMode,
      locked: l.locked,
      transform: l.transform,
      sourceDataUrl: l.sourceDataUrl || l.canvas.toDataURL('image/png', 0.85),
    }));

    const projId = `proj_${Date.now()}`;
    const project: SavedProject = {
      id: projId,
      name: projName,
      outfitId,
      createdAt: Date.now(),
      thumbnail: thumbUrl,
      layersData: serializableLayers,
    };

    await miniCache.set('projects', projId, project);
    await loadSavedProjects();
    showToast('success', `Đã lưu dự án "${projName}" vào thư viện!`);
  };

  const restoreProject = (proj: SavedProject) => {
    restoreLayersFromData(proj.layersData);
    showToast('success', `Đã mở dự án "${proj.name}"!`);
  };

  const deleteProject = async (projId: string) => {
    await miniCache.delete('projects', projId);
    await loadSavedProjects();
    showToast('info', 'Đã xóa dự án khỏi thư viện.');
  };

  const downloadTexturePNG = () => {
    const master = masterCanvasRef.current;
    if (!master) return;
    compositeAllLayers(master, false);
    const link = document.createElement('a');
    link.download = `vietnamese_costume_${outfitId}_${Date.now()}.png`;
    link.href = master.toDataURL('image/png');
    link.click();
    showToast('success', 'Đã tải xuống file Texture PNG 1024x1024!');
  };

  return (
    <div className="flex flex-col h-full bg-[#141720] text-zinc-200 select-none overflow-hidden border-l border-white/5">
      {/* ============================================================== */}
      {/* 1. TOP SEGMENTED CONTROL: 3 CHẾ ĐỘ CHÍNH */}
      {/* ============================================================== */}
      <div className="p-3 bg-[#1e1312] border-b border-[#d4a359]/20 shrink-0">
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#140d0c] rounded-full border border-[#d4a359]/25">
          {[
            { id: 'template', label: 'Mẫu & Tải ảnh', icon: Upload },
            { id: 'draw', label: 'Vẽ Tay', icon: Paintbrush },
            { id: 'library', label: 'Thư viện', icon: Sparkles },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'template' && activeLayer && !activeLayer.locked) {
                    setIsTransforming(true);
                  }
                }}
                className={`flex items-center justify-center gap-2.5 py-2 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-[#9e1b1b] via-[#bd2c2c] to-[#c83828] text-amber-50 shadow-md border border-[#e05344]/40'
                    : 'text-[#bfaea0] hover:text-[#fdf6ec] hover:bg-[#241615]'
                }`}
              >
                <tab.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#f5cf89]' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. KHU VỰC CANVAS PREVIEW (2D WORKSPACE & GIZMO STAGE) */}
      {/* ============================================================== */}
      <div className="p-2.5 bg-[#180f0e] border-b border-[#d4a359]/20 shrink-0">
        {/* Stage Toolbar (Zoom, Mask Toggle, Grid, Transform) */}
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#ebdcc9] flex items-center gap-1 font-['Lora',serif]">
              <Shirt className="w-3.5 h-3.5 text-[#d4a359]" />
              {currentOutfit.name.slice(0, 18)}
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#d4a359]/15 text-[#f5cf89] font-mono border border-[#d4a359]/25">
              1024px
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Toggle Layer 1 Mask Outline */}
            <button
              onClick={() => setShowMaskOutline(!showMaskOutline)}
              className={`p-1.5 rounded-full border text-xs transition-colors cursor-pointer ${
                showMaskOutline
                  ? 'bg-[#d4a359]/25 border-[#d4a359] text-[#f5cf89]'
                  : 'bg-[#221614] border-[#d4a359]/20 text-[#8e7c6e]'
              }`}
              title="Hiện / Ẩn Rập Chuẩn (Layer 1 Mask)"
            >
              {showMaskOutline ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            {/* Toggle Grid */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-full border text-xs transition-colors cursor-pointer ${
                showGrid
                  ? 'bg-[#d4a359]/25 border-[#d4a359] text-[#f5cf89]'
                  : 'bg-[#221614] border-[#d4a359]/20 text-[#8e7c6e]'
              }`}
              title="Hiện / Ẩn Lưới Tỷ Lệ"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>

            {/* Free Transform (Ctrl + T) Toggle */}
            <button
              onClick={() => {
                if (activeLayer && !activeLayer.locked) {
                  setIsTransforming(!isTransforming);
                } else {
                  showToast('warning', 'Vui lòng mở khóa layer để dùng Transform.');
                }
              }}
              className={`px-2.5 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isTransforming
                  ? 'bg-[#d4a359] text-[#140d0c] border-[#f5cf89] shadow-md'
                  : 'bg-[#221614] border-[#d4a359]/20 text-[#ebdcc9] hover:text-white'
              }`}
              title="Bật / Tắt Khung Chỉnh Free Transform (Ctrl+T)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="text-[10px]">Ctrl+T</span>
            </button>
          </div>
        </div>

        {/* The Interactive Preview Canvas Window */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          className={`relative w-full aspect-square rounded-2xl overflow-hidden border transition-all flex items-center justify-center ${
            isDraggingOver
              ? 'border-emerald-400 bg-emerald-500/15'
              : 'border-[#d4a359]/25 bg-[#120b0a]'
          }`}
          style={{
            backgroundImage: showCheckerboard
              ? 'linear-gradient(45deg, #1d1211 25%, transparent 25%), linear-gradient(-45deg, #1d1211 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1d1211 75%), linear-gradient(-45deg, transparent 75%, #1d1211 75%)'
              : 'none',
            backgroundSize: '16px 16px',
            backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
          }}
        >
          <canvas
            ref={previewCanvasRef}
            width={1024}
            height={1024}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            className={`w-full h-full object-contain ${
              activeTab === 'draw' && tool === 'brush'
                ? 'cursor-crosshair'
                : activeTab === 'draw' && tool === 'eyedropper'
                ? 'cursor-pointer'
                : isTransforming
                ? 'cursor-move'
                : 'cursor-default'
            }`}
          />

          {/* Floating Drop Overlay Indicator */}
          {isDraggingOver && (
            <div className="absolute inset-0 bg-[#2b1614]/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2 pointer-events-none">
              <Upload className="w-10 h-10 text-[#d4a359] animate-bounce" />
              <span className="text-xs font-bold text-[#f5cf89]">
                Thả ảnh vào đây để tạo Layer mới!
              </span>
            </div>
          )}

          {/* Badge Layer 1 Rập Chuẩn Always Visible Top-Left */}
          {showMaskOutline && (
            <div className="absolute top-2 left-2 pointer-events-none bg-[#140d0c]/85 backdrop-blur-xs border border-[#d4a359]/50 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-[#f5cf89] flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Layer 1: Rập Chuẩn Cố Định
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. CONTROLS BODY (DYNAMIC THEO TAB: MẪU, VẼ, THƯ VIỆN) */}
      {/* ============================================================== */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3 custom-scrollbar">
        {/* TAB 1: MẪU & TẢI ẢNH (UPLOAD & TRANSFORM) */}
        {activeTab === 'template' && (
          <div className="space-y-3">
            {/* Upload Dropzone Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-4 bg-[#221614] border-2 border-dashed border-[#d4a359]/30 rounded-2xl flex flex-col items-center justify-center gap-2 text-center cursor-pointer hover:border-[#d4a359] hover:bg-[#2b1c1a] transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
              <div className="w-10 h-10 rounded-full bg-[#d4a359]/20 flex items-center justify-center text-[#d4a359]">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#fdf6ec] block">
                  Tải ảnh hoa văn / texture từ máy tính
                </span>
                <span className="text-[10px] text-[#bfaea0]">
                  Hỗ trợ kéo-thả PNG, JPG, WEBP. Ảnh tự thêm thành Layer mới.
                </span>
              </div>
            </div>

            {/* Quick Alignment Presets */}
            {activeLayer && (
              <div className="p-3 bg-[#221614] rounded-2xl border border-[#d4a359]/20 space-y-2.5">
                <span className="text-xs font-bold text-[#fdf6ec] block">
                  Căn chỉnh nhanh vào bộ phận rập:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => alignToPresetZone('torso_front')}
                    className="py-1.5 px-2 bg-[#18100f] hover:bg-[#d4a359]/20 border border-[#d4a359]/20 hover:border-[#d4a359] rounded-full text-[10px] font-bold text-[#ebdcc9] hover:text-[#f5cf89] transition-all cursor-pointer text-center"
                  >
                    Thân Trước
                  </button>
                  <button
                    onClick={() => alignToPresetZone('skirt_front')}
                    className="py-1.5 px-2 bg-[#18100f] hover:bg-[#d4a359]/20 border border-[#d4a359]/20 hover:border-[#d4a359] rounded-full text-[10px] font-bold text-[#ebdcc9] hover:text-[#f5cf89] transition-all cursor-pointer text-center"
                  >
                    Tà Áo Trước
                  </button>
                  <button
                    onClick={() => alignToPresetZone('skirt_back')}
                    className="py-1.5 px-2 bg-[#18100f] hover:bg-[#d4a359]/20 border border-[#d4a359]/20 hover:border-[#d4a359] rounded-full text-[10px] font-bold text-[#ebdcc9] hover:text-[#f5cf89] transition-all cursor-pointer text-center"
                  >
                    Tà Áo Sau
                  </button>
                  <button
                    onClick={() => alignToPresetZone('fit_template')}
                    className="py-1.5 px-2 bg-[#18100f] hover:bg-white/10 border border-[#d4a359]/15 rounded-full text-[10px] text-[#bfaea0] hover:text-white transition-all cursor-pointer text-center font-bold"
                  >
                    Vừa Vặn (Fit)
                  </button>
                  <button
                    onClick={() => alignToPresetZone('fill_template')}
                    className="py-1.5 px-2 bg-[#18100f] hover:bg-white/10 border border-[#d4a359]/15 rounded-full text-[10px] text-[#bfaea0] hover:text-white transition-all cursor-pointer text-center font-bold"
                  >
                    Lấp Đầy (Fill)
                  </button>
                  <button
                    onClick={() => {
                      updateActiveTransform((t) => ({ flipX: !t.flipX }));
                      showToast('info', 'Đã lật ngang ảnh');
                    }}
                    className="py-1.5 px-2 bg-[#18100f] hover:bg-white/10 border border-[#d4a359]/15 rounded-full text-[10px] text-[#bfaea0] hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1 font-bold"
                  >
                    <FlipHorizontal className="w-3 h-3" /> Lật Ngang
                  </button>
                </div>

                {/* Transform Status & Commit Controls */}
                <div className="pt-2 border-t border-[#d4a359]/15 flex items-center justify-between">
                  <div className="text-[10px] text-[#bfaea0]">
                    Góc xoay: <span className="font-mono text-[#f5cf89] font-bold">{activeLayer.transform.rotation}°</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        updateActiveTransform(() => ({
                          scaleX: 1,
                          scaleY: 1,
                          rotation: 0,
                          x: 512,
                          y: 512,
                        }));
                        showToast('info', 'Đã đặt lại transform.');
                      }}
                      className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[10px] font-bold text-[#ebdcc9] cursor-pointer"
                    >
                      Đặt lại
                    </button>
                    <button
                      onClick={() => {
                        setIsTransforming(false);
                        showToast('success', 'Đã xác nhận Transform.');
                      }}
                      className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#9e1b1b] to-[#c83828] text-white text-[10px] font-bold hover:from-[#b12222] hover:to-[#db4232] cursor-pointer flex items-center gap-1 border border-[#e05344]/40"
                    >
                      <Check className="w-3 h-3" /> Xác Nhận
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: VẼ TAY (BRUSH, ERASER, FILL, EYE DROPPER, HERITAGE PALETTE) */}
        {activeTab === 'draw' && (
          <div className="space-y-3">
            {/* Tool Selection Bar */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'brush', label: 'Bút Cọ', icon: Paintbrush },
                { id: 'eraser', label: 'Tẩy', icon: Eraser },
                { id: 'fill', label: 'Đổ Màu', icon: Palette },
                { id: 'eyedropper', label: 'Hút Màu', icon: Pipette },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTool(t.id as any)}
                  className={`flex flex-col items-center justify-center gap-1 p-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                    tool === t.id
                      ? 'bg-[#d4a359]/20 border-[#d4a359] text-[#f5cf89] shadow-sm'
                      : 'bg-[#221614] border-[#d4a359]/15 text-[#bfaea0] hover:text-white'
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  <span className="text-[10px]">{t.label}</span>
                </button>
              ))}
            </div>

            {/* Brush Sliders */}
            <div className="p-3 bg-[#221614] rounded-2xl border border-[#d4a359]/20 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#bfaea0]">Kích thước nét cọ:</span>
                <span className="font-mono text-[#f5cf89] font-bold">{brushSize}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-full accent-[#d4a359] cursor-pointer"
              />

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#bfaea0]">Độ đậm nét:</span>
                <span className="font-mono text-[#f5cf89] font-bold">{Math.round(brushOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={brushOpacity}
                onChange={(e) => setBrushOpacity(parseFloat(e.target.value))}
                className="w-full accent-[#d4a359] cursor-pointer"
              />
            </div>

            {/* Heritage Color Palette */}
            <div className="p-3 bg-[#221614] rounded-2xl border border-[#d4a359]/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#fdf6ec]">
                  Bảng màu Di sản Lạc Hồng
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[#d4a359] font-bold">{brushColor}</span>
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-6 h-6 rounded-full cursor-pointer border-0 p-0 bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {HERITAGE_PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setBrushColor(c.hex)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all cursor-pointer ${
                      brushColor === c.hex
                        ? 'border-[#d4a359] bg-[#d4a359]/20 shadow-sm'
                        : 'border-[#d4a359]/15 hover:border-[#d4a359]/40 bg-[#18100f]'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-black/40 shadow-inner"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-[9px] text-[#ebdcc9] font-bold truncate w-full text-center">
                      {c.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Layer Action */}
            <div className="flex gap-2">
              <button
                onClick={clearActiveLayer}
                className="flex-1 py-2 px-3 rounded-full bg-[#3d1313] border border-rose-800/40 text-rose-200 text-xs font-bold hover:bg-[#521919] transition-colors cursor-pointer text-center"
              >
                Xóa sạch nét vẽ trên layer này
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: THƯ VIỆN HOA VĂN & DỰ ÁN ĐÃ LƯU */}
        {activeTab === 'library' && (
          <div className="space-y-3">
            {/* Traditional Motifs Ready to Insert */}
            <div className="p-3 bg-[#221614] rounded-2xl border border-[#d4a359]/20 space-y-2">
              <span className="text-xs font-bold text-[#fdf6ec] block">
                Kho Hoa văn Cổ truyền (Click để chèn):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {CULTURAL_STAMPS.map((stamp) => (
                  <div
                    key={stamp.id}
                    onClick={() => insertHeritageMotif(stamp.pathType, stamp.name)}
                    className="p-3 rounded-2xl bg-[#18100f] border border-[#d4a359]/20 hover:border-[#d4a359] hover:bg-[#261816] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#d4a359] group-hover:scale-110 transition-transform" />
                      <h5 className="text-xs font-bold text-[#fdf6ec]">{stamp.name}</h5>
                    </div>
                    <span className="text-[10px] text-[#bfaea0] block">{stamp.origin}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Projects Library */}
            <div className="p-3 bg-[#221614] rounded-2xl border border-[#d4a359]/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#fdf6ec]">
                  Dự án đã lưu ({savedProjects.length})
                </span>
                <button
                  onClick={saveCurrentProject}
                  className="px-3 py-1 rounded-full bg-[#d4a359] text-black text-[10px] font-bold hover:bg-[#f5cf89] cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <Save className="w-3 h-3" /> Lưu Dự Án
                </button>
              </div>

              {savedProjects.length === 0 ? (
                <div className="py-4 text-center text-[11px] text-[#a49182]">
                  Chưa có dự án nào được lưu trong bộ nhớ.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {savedProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-2.5 rounded-xl bg-[#18100f] border border-[#d4a359]/15 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {proj.thumbnail && (
                          <img
                            src={proj.thumbnail}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border border-[#d4a359]/30"
                          />
                        )}
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-[#fdf6ec] block truncate">
                            {proj.name}
                          </span>
                          <span className="text-[9px] text-[#a49182] block">
                            {new Date(proj.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => restoreProject(proj)}
                          className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-[10px] font-bold text-[#fdf6ec] cursor-pointer"
                        >
                          Mở
                        </button>
                        <button
                          onClick={() => deleteProject(proj.id)}
                          className="p-1 rounded-full text-zinc-400 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PNG Export */}
            <button
              onClick={downloadTexturePNG}
              className="w-full py-2.5 px-3 rounded-full bg-[#221614] hover:bg-[#2b1c1a] border border-[#d4a359]/30 text-xs font-bold text-[#f5cf89] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#d4a359]" />
              Tải Xuất File Texture PNG 1024x1024
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. HỆ THỐNG QUẢN LÝ LỚP (LAYER STACK: LAYER 1 MASK + LAYER 2..N) */}
        {/* ============================================================== */}
        <div className="p-3 bg-[#221614] rounded-2xl border border-[#d4a359]/20 space-y-2.5">
          {/* Layer Header & Actions */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#fdf6ec] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#d4a359]" />
              Hệ Thống Lớp (Layers)
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={addNewDrawingLayer}
                className="py-1 px-2.5 rounded-full bg-[#18100f] hover:bg-[#d4a359]/20 text-[#f5cf89] border border-[#d4a359]/30 text-[10px] font-bold cursor-pointer"
                title="Tạo Layer vẽ mới"
              >
                + Vẽ
              </button>
              <button
                onClick={duplicateActiveLayer}
                className="p-1.5 rounded-full bg-[#18100f] hover:bg-[#d4a359]/20 text-[#ebdcc9] border border-[#d4a359]/20 cursor-pointer"
                title="Nhân bản layer"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={() => moveLayerOrder('up')}
                className="p-1.5 rounded-full bg-[#18100f] hover:bg-[#d4a359]/20 text-[#ebdcc9] border border-[#d4a359]/20 cursor-pointer"
                title="Đưa layer lên trên"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button
                onClick={() => moveLayerOrder('down')}
                className="p-1.5 rounded-full bg-[#18100f] hover:bg-[#d4a359]/20 text-[#ebdcc9] border border-[#d4a359]/20 cursor-pointer"
                title="Đưa layer xuống dưới"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
              <button
                onClick={deleteActiveLayer}
                className="p-1.5 rounded-full bg-[#18100f] hover:bg-red-500/20 text-[#ebdcc9] hover:text-red-400 border border-[#d4a359]/20 cursor-pointer"
                title="Xóa layer đang chọn"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* LAYER 1: PINNED FIXED MASK TEMPLATE (CANNOT DELETE / MOVE) */}
          <div className="p-2.5 rounded-xl bg-[#140d0c] border border-[#d4a359]/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMaskOutline(!showMaskOutline)}
                className="text-zinc-400 hover:text-white cursor-pointer rounded-full p-1"
              >
                {showMaskOutline ? (
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-zinc-600" />
                )}
              </button>
              <Lock className="w-3 h-3 text-[#d4a359]" />
              <div>
                <span className="text-[11px] font-bold text-[#f5cf89] block font-['Lora',serif]">
                  Layer 1: Khung Rập Chuẩn
                </span>
                <span className="text-[9px] text-[#bfaea0]">
                  Cố định trên cùng • Mask trong suốt
                </span>
              </div>
            </div>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#d4a359]/20 text-[#f5cf89] font-mono border border-[#d4a359]/30">
              TEMPLATE
            </span>
          </div>

          {/* USER LAYERS (LAYER 2..N) */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {layers.map((layer, index) => {
              const isActive = layer.id === activeLayerId;
              return (
                <div
                  key={layer.id}
                  onClick={() => setActiveLayerId(layer.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isActive
                      ? 'bg-[#d4a359]/20 border-[#d4a359] text-[#fdf6ec] shadow-xs'
                      : 'bg-[#18100f] border-[#d4a359]/15 text-[#bfaea0] hover:border-[#d4a359]/40'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Toggle Visibility */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLayers((prev) =>
                          prev.map((l) => (l.id === layer.id ? { ...l, visible: !l.visible } : l))
                        );
                      }}
                      className="cursor-pointer rounded-full p-0.5"
                    >
                      {layer.visible ? (
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-zinc-600" />
                      )}
                    </button>

                    {/* Lock Toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLayers((prev) =>
                          prev.map((l) => (l.id === layer.id ? { ...l, locked: !l.locked } : l))
                        );
                      }}
                      className="cursor-pointer rounded-full p-0.5"
                    >
                      {layer.locked ? (
                        <Lock className="w-3 h-3 text-red-400" />
                      ) : (
                        <Unlock className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <span className="text-xs font-bold block truncate text-[#fdf6ec]">
                        {layer.name}
                      </span>
                      <span className="text-[9px] text-[#bfaea0] block">
                        Độ mờ: {Math.round(layer.opacity * 100)}% • {layer.blendMode}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#d4a359]">
                    #{layers.length - index + 1}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ACTIVE LAYER PROPERTIES (OPACITY & BLEND MODE) */}
          {activeLayer && (
            <div className="pt-2 border-t border-[#d4a359]/15 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#bfaea0]">Độ mờ layer:</span>
                <span className="font-mono text-[#f5cf89] font-bold">
                  {Math.round(activeLayer.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={activeLayer.opacity}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setLayers((prev) =>
                    prev.map((l) => (l.id === activeLayer.id ? { ...l, opacity: val } : l))
                  );
                }}
                className="w-full accent-[#d4a359] cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#bfaea0]">Chế độ hòa trộn:</span>
                <select
                  value={activeLayer.blendMode}
                  onChange={(e) => {
                    const mode = e.target.value as any;
                    setLayers((prev) =>
                      prev.map((l) => (l.id === activeLayer.id ? { ...l, blendMode: mode } : l))
                    );
                  }}
                  className="bg-[#140d0c] border border-[#d4a359]/30 rounded-full px-3 py-1 text-[11px] text-[#fdf6ec] cursor-pointer focus:outline-none focus:border-[#d4a359]"
                >
                  <option value="normal">Bình thường (Normal)</option>
                  <option value="multiply">Nhân màu (Multiply)</option>
                  <option value="screen">Sáng chói (Screen)</option>
                  <option value="overlay">Phủ màu (Overlay)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. FOOTER ACTION BAR: ÁP DỤNG LÊN 3D AVATAR (BAKE TEXTURE) */}
      {/* ============================================================== */}
      <div className="p-3.5 bg-[#1e1312] border-t border-[#d4a359]/25 shrink-0 space-y-2.5">
        <div className="flex items-center justify-between text-[11px] px-1 text-[#bfaea0]">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={clipToMask}
              onChange={(e) => setClipToMask(e.target.checked)}
              className="accent-[#d4a359] rounded"
            />
            <span className="font-semibold">Cắt theo viền rập (Clip Mask)</span>
          </label>

          {lastAutosavedTime && (
            <span className="text-[9px] text-[#f5cf89] flex items-center gap-1 font-mono">
              <Clock className="w-2.5 h-2.5" /> {lastAutosavedTime}
            </span>
          )}
        </div>

        <button
          onClick={handleBakeAndApplyTo3D}
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#9e1b1b] via-[#bd2c2c] to-[#d4a359] hover:from-[#b12222] hover:to-[#e6ba64] text-amber-50 font-black text-xs uppercase tracking-wider shadow-[0_4px_18px_rgba(189,44,44,0.45)] border border-[#e05344]/50 transition-all cursor-pointer flex items-center justify-center gap-2.5 transform active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-200 shrink-0" />
          <span>Xác Nhận & Áp Dụng Lên 3D Avatar</span>
        </button>
      </div>
    </div>
  );
};
