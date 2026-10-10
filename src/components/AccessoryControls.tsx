import React, { useRef } from 'react';
import { AccessoryId, LightingMode, PoseType, AccessoryItem } from '../types';
import {
  Crown,
  User,
  Sparkles,
  Sun,
  Flame,
  Sunset,
  Smile,
  Upload,
  Palette
} from 'lucide-react';
import { createDefaultFaceCanvas } from './ThreeHeritageCanvas';

interface AccessoryControlsProps {
  accessories: AccessoryItem[];
  onToggleAccessory: (id: AccessoryId) => void;
  lightingMode: LightingMode;
  onChangeLighting: (mode: LightingMode) => void;
  currentPose: PoseType;
  onChangePose: (pose: PoseType) => void;
  skinColor: string;
  onChangeSkinColor: (color: string) => void;
  onSelectFace: (faceUrl: string) => void;
  showTunicFlap: boolean;
  onToggleTunicFlap: (show: boolean) => void;
}

const SKIN_TONES = [
  { name: 'Tự Nhiên', hex: '#F5CBAB' },
  { name: 'Trắng Ngà', hex: '#FDE5D0' },
  { name: 'Vàng Sáng', hex: '#FCE0C6' },
  { name: 'Bánh Mật', hex: '#DEAA88' },
  { name: 'Chàm Ngăm', hex: '#C28B65' },
  { name: 'Nắng Gió', hex: '#E5B896' },
];

/**
 * Creates preset face canvases and returns data URLs
 */
function createPresetFace(type: 'smile' | 'joy' | 'calm' | 'confident'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 512, 512);

  const cx = 256;
  const cy = 256;

  ctx.fillStyle = '#111113';

  if (type === 'smile') {
    return createDefaultFaceCanvas().toDataURL('image/png');
  }

  if (type === 'joy') {
    // Curved happy anime eyes
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#111113';
    ctx.lineCap = 'round';
    // Left eye curve ^
    ctx.beginPath();
    ctx.arc(cx - 55, cy - 30, 26, Math.PI * 1.1, Math.PI * 1.9, false);
    ctx.stroke();
    // Right eye curve ^
    ctx.beginPath();
    ctx.arc(cx + 55, cy - 30, 26, Math.PI * 1.1, Math.PI * 1.9, false);
    ctx.stroke();

    // Open mouth smile
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.arc(cx, cy + 25, 45, 0, Math.PI, false);
    ctx.fill();
    ctx.stroke();
    return canvas.toDataURL('image/png');
  }

  if (type === 'calm') {
    // Gentle refined oval eyes
    ctx.beginPath();
    ctx.ellipse(cx - 52, cy - 35, 12, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 52, cy - 35, 12, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gentle line smile
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#111113';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy + 20, 40, 0.25 * Math.PI, 0.75 * Math.PI, false);
    ctx.stroke();
    return canvas.toDataURL('image/png');
  }

  // confident
  ctx.beginPath();
  ctx.ellipse(cx - 52, cy - 35, 13, 20, -0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 52, cy - 35, 13, 20, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.lineWidth = 9;
  ctx.strokeStyle = '#111113';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 75, cy - 65);
  ctx.lineTo(cx - 30, cy - 60);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 75, cy - 65);
  ctx.lineTo(cx + 30, cy - 60);
  ctx.stroke();

  // Smirk
  ctx.beginPath();
  ctx.arc(cx + 10, cy + 25, 45, 0.1 * Math.PI, 0.7 * Math.PI, false);
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

export const AccessoryControls: React.FC<AccessoryControlsProps> = ({
  accessories,
  onToggleAccessory,
  lightingMode,
  onChangeLighting,
  currentPose,
  onChangePose,
  skinColor,
  onChangeSkinColor,
  onSelectFace,
  showTunicFlap,
  onToggleTunicFlap,
}) => {
  const faceInputRef = useRef<HTMLInputElement | null>(null);

  const lightingOptions: { id: LightingMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'museum',
      label: 'Bảo Tàng',
      icon: <Sparkles className="w-3.5 h-3.5 text-zinc-300" />,
      desc: 'Ánh đèn tiêu điểm ấm áp',
    },
    {
      id: 'daylight',
      label: 'Ban Ngày',
      icon: <Sun className="w-3.5 h-3.5 text-zinc-300" />,
      desc: 'Ánh sáng tự nhiên rõ nét',
    },
    {
      id: 'hoi_an_lantern',
      label: 'Đèn Lồng',
      icon: <Flame className="w-3.5 h-3.5 text-red-400" />,
      desc: 'Sắc đỏ vàng phố cổ',
    },
    {
      id: 'sunset',
      label: 'Hoàng Hôn',
      icon: <Sunset className="w-3.5 h-3.5 text-red-300" />,
      desc: 'Ánh ráng chiều ấm áp',
    },
  ];

  const poseOptions: { id: PoseType; label: string; desc: string }[] = [
    { id: 'idle', label: 'Tự Nhiên', desc: 'Dáng đứng thẳng' },
    { id: 'court_greeting', label: 'Chào Cung Đình', desc: 'Khoanh tay trang trọng' },
    { id: 'xoe_dance', label: 'Múa Xòe', desc: 'Tay nâng mềm mại' },
    { id: 'proud_stand', label: 'Kiêu Hãnh', desc: 'Tay chống hông' },
  ];

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onSelectFace(event.target.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-3 text-zinc-200">
      {/* 1. Human Skin Tone & Face Customization */}
      <div className="p-3 bg-[#141418] rounded-xl border border-[#26262E] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-red-500" />
            <span>Màu Da & Khuôn Mặt Nhân Vật</span>
          </h3>
          <span className="text-[10px] text-zinc-500">Màu da người tự nhiên</span>
        </div>

        {/* Skin Tone Swatches */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-zinc-400 mr-1">Tông da:</span>
          {SKIN_TONES.map((tone) => (
            <button
              key={tone.hex}
              onClick={() => onChangeSkinColor(tone.hex)}
              title={tone.name}
              className={`w-6 h-6 rounded-full border transition-transform ${
                skinColor.toLowerCase() === tone.hex.toLowerCase()
                  ? 'scale-125 border-white ring-2 ring-red-600/70'
                  : 'border-[#3F3F46] hover:scale-110'
              }`}
              style={{ backgroundColor: tone.hex }}
            />
          ))}
          <input
            type="color"
            value={skinColor}
            onChange={(e) => onChangeSkinColor(e.target.value)}
            className="w-6 h-6 rounded-full cursor-pointer border border-[#3F3F46] bg-transparent"
            title="Tự chọn màu da"
          />
        </div>

        {/* Face Style Picker & Uploader */}
        <div className="pt-2 border-t border-[#26262E] flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Khuôn mặt:</span>
            <button
              onClick={() => faceInputRef.current?.click()}
              className="flex items-center gap-1 text-red-400 hover:text-red-300 font-medium"
            >
              <Upload className="w-3 h-3" />
              <span>Tải mặt PNG lên</span>
            </button>
            <input
              ref={faceInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={handleFaceUpload}
            />
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            <button
              onClick={() => onSelectFace(createPresetFace('smile'))}
              className="px-2 py-1.5 rounded-lg border border-[#26262E] bg-[#18181D] hover:border-red-600 text-center text-[10px] text-zinc-300"
            >
              Nụ Cười Mặc Định
            </button>
            <button
              onClick={() => onSelectFace(createPresetFace('joy'))}
              className="px-2 py-1.5 rounded-lg border border-[#26262E] bg-[#18181D] hover:border-red-600 text-center text-[10px] text-zinc-300"
            >
              Tươi Tắn
            </button>
            <button
              onClick={() => onSelectFace(createPresetFace('calm'))}
              className="px-2 py-1.5 rounded-lg border border-[#26262E] bg-[#18181D] hover:border-red-600 text-center text-[10px] text-zinc-300"
            >
              Điềm Đạm
            </button>
            <button
              onClick={() => onSelectFace(createPresetFace('confident'))}
              className="px-2 py-1.5 rounded-lg border border-[#26262E] bg-[#18181D] hover:border-red-600 text-center text-[10px] text-zinc-300"
            >
              Tự Tin
            </button>
          </div>
        </div>

        {/* Tunic Flap Toggle */}
        <div className="pt-2 border-t border-[#26262E] flex items-center justify-between">
          <span className="text-[11px] text-zinc-300">Hiện tà áo dài dáng rủ:</span>
          <button
            onClick={() => onToggleTunicFlap(!showTunicFlap)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              showTunicFlap ? 'bg-red-600 text-white' : 'bg-[#222228] text-zinc-400'
            }`}
          >
            {showTunicFlap ? 'Đang bật' : 'Tắt (Áo Quần Ôm Gọn)'}
          </button>
        </div>
      </div>

      {/* 2. 3D Cultural Accessories */}
      <div className="p-3 bg-[#141418] rounded-xl border border-[#26262E] flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5 text-red-500" />
          <span>Phụ Kiện 3D Gắn Lên Đầu / Thân</span>
        </h3>

        <div className="grid grid-cols-2 gap-1.5">
          {accessories.map((item) => (
            <button
              key={item.id}
              onClick={() => onToggleAccessory(item.id)}
              className={`flex items-center justify-between p-2 rounded-lg border text-left transition-all ${
                item.enabled
                  ? 'border-red-600 bg-red-950/20 shadow-sm'
                  : 'border-[#26262E] bg-[#18181D] hover:border-[#3F3F46]'
              }`}
            >
              <span className="text-[11px] font-medium text-zinc-200">{item.name}</span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                  item.enabled ? 'bg-red-600 text-white' : 'bg-[#222228] text-zinc-400'
                }`}
              >
                {item.enabled ? 'Đeo' : 'Tháo'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Poses */}
      <div className="p-3 bg-[#141418] rounded-xl border border-[#26262E] flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-red-500" />
          <span>Tư Thế (Poses)</span>
        </h3>

        <div className="grid grid-cols-2 gap-1.5">
          {poseOptions.map((pose) => {
            const isSelected = currentPose === pose.id;
            return (
              <button
                key={pose.id}
                onClick={() => onChangePose(pose.id)}
                className={`p-2 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-red-600 bg-red-950/25'
                    : 'border-[#26262E] bg-[#18181D] hover:border-[#3F3F46]'
                }`}
              >
                <div className="text-[11px] font-medium text-zinc-200">{pose.label}</div>
                <div className="text-[9px] text-zinc-500">{pose.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Lighting */}
      <div className="p-3 bg-[#141418] rounded-xl border border-[#26262E] flex flex-col gap-2">
        <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          <span>Chiếu Sáng Studio</span>
        </h3>

        <div className="grid grid-cols-2 gap-1.5">
          {lightingOptions.map((opt) => {
            const isSelected = lightingMode === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onChangeLighting(opt.id)}
                className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-red-600 bg-red-950/25'
                    : 'border-[#26262E] bg-[#18181D] hover:border-[#3F3F46]'
                }`}
              >
                <div>{opt.icon}</div>
                <div>
                  <div className="text-[11px] font-medium text-zinc-200">{opt.label}</div>
                  <div className="text-[9px] text-zinc-500">{opt.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
