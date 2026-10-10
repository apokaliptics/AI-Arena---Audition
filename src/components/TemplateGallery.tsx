import React from 'react';
import { PRESET_OUTFITS } from '../constants/presets';
import { PresetOutfit } from '../types';
import { Check, Download } from 'lucide-react';
import { drawCulturalGuidelines } from '../utils/uvCanvasRenderer';

interface TemplateGalleryProps {
  selectedPresetId: string;
  onSelectPreset: (preset: PresetOutfit) => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  selectedPresetId,
  onSelectPreset,
}) => {
  const downloadTemplate = (preset: PresetOutfit, e: React.MouseEvent) => {
    e.stopPropagation();
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    preset.drawTemplate(ctx, 1024, 1024);
    drawCulturalGuidelines(ctx, 1024, 1024, true);

    const link = document.createElement('a');
    link.download = `SacViet_Template_${preset.id}_1024x1024.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col gap-3.5 text-zinc-200">
      <div className="p-3 bg-[#141418] rounded-xl border border-[#26262E]">
        <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span>Mẫu Template Chuẩn Văn Hóa (UV Layouts)</span>
        </h3>
        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
          Được căn chuẩn tỉ lệ humanoid cho trang phục truyền thống 54 dân tộc. Tải về thiết kế trên Canva/Photoshop hoặc nạp vào studio.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {PRESET_OUTFITS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`group p-3 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-red-600 bg-red-950/20 shadow-sm ring-1 ring-red-600/30'
                  : 'border-[#26262E] bg-[#141418] hover:border-[#3F3F46]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: preset.primaryColor }}
                  />
                  <h4 className="text-xs font-semibold text-zinc-100 group-hover:text-red-400 transition-colors">
                    {preset.name}
                  </h4>
                </div>
                {isSelected && (
                  <span className="p-0.5 rounded-full bg-red-600 text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-1">
                <span className="text-red-400 font-medium">{preset.ethnicity}</span>
                <span aria-hidden="true">·</span>
                <span>{preset.region}</span>
              </div>

              <p className="text-[11px] text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>

              <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-[#26262E]">
                <span className="text-[10px] text-zinc-500 font-mono">1024 × 1024 PNG</span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => downloadTemplate(preset, e)}
                    title="Tải template PNG"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#1A1A20] hover:bg-[#25252E] text-zinc-300 text-[11px] transition-colors border border-[#2D2D36]"
                  >
                    <Download className="w-3 h-3" />
                    <span>Tải</span>
                  </button>

                  <button
                    onClick={() => onSelectPreset(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                      isSelected
                        ? 'bg-red-600 text-white'
                        : 'bg-[#1A1A20] text-zinc-300 group-hover:bg-red-700 group-hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Đang dùng' : 'Chọn'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
