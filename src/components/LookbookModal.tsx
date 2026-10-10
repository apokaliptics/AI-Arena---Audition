import React, { useRef, useState } from 'react';
import { GeminiAnalysisResult } from '../types';
import { Download, X, CheckCircle2, Feather, Sparkles } from 'lucide-react';

interface LookbookModalProps {
  analysis: GeminiAnalysisResult | null;
  snapshotUrl: string;
  onClose: () => void;
}

const MESSAGE_PRESETS = [
  'Non sông gấm vóc, ngàn năm rạng rỡ di sản Việt.',
  'Gìn giữ hồn cốt tiền nhân qua từng đường kim mũi chỉ.',
  'Nét son Đại Việt trường tồn cùng năm tháng.',
  'Hào khí ngàn năm kết tinh trong từng tà áo lụa.',
  'Khắc ghi cội nguồn, rạng danh bản sắc năm mươi tư dân tộc.',
];

export const LookbookModal: React.FC<LookbookModalProps> = ({
  analysis,
  snapshotUrl,
  onClose,
}) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [customMessage, setCustomMessage] = useState<string>(
    'Non sông gấm vóc, ngàn năm rạng rỡ di sản Việt.'
  );
  const [isEditingMessage, setIsEditingMessage] = useState<boolean>(false);

  if (!analysis) return null;

  const handleDownloadPoster = () => {
    const posterCanvas = document.createElement('canvas');
    posterCanvas.width = 1200;
    posterCanvas.height = 800;
    const ctx = posterCanvas.getContext('2d')!;

    // Background gradient in deep imperial charcoal and obsidian
    const grad = ctx.createLinearGradient(0, 0, 1200, 800);
    grad.addColorStop(0, '#0F0F14');
    grad.addColorStop(0.5, '#0A0A0D');
    grad.addColorStop(1, '#050508');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 800);

    // Outer Antique Crimson & Gold frame border
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(28, 28, 1144, 744);

    // Inner Gold filigree line
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 1;
    ctx.strokeRect(36, 36, 1128, 728);

    // Decorative corner ticks
    const drawCorner = (x: number, y: number, dx: number, dy: number) => {
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x, y + dy * 20);
      ctx.lineTo(x, y);
      ctx.lineTo(x + dx * 20, y);
      ctx.stroke();
    };
    drawCorner(44, 44, 1, 1);
    drawCorner(1156, 44, -1, 1);
    drawCorner(44, 756, 1, -1);
    drawCorner(1156, 756, -1, -1);

    // Header Title (Mystical Vietnamese Typography)
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 22px "Cinzel", "Charm", serif';
    ctx.fillText('SẮC VIỆT — HERITAGE AVATAR LOOKBOOK', 60, 80);

    ctx.fillStyle = '#A1A1AA';
    ctx.font = '12px "Nunito", sans-serif';
    ctx.fillText('HỆ THỐNG Y PHỤC TRUYỀN THỐNG 54 DÂN TỘC VIỆT NAM · AI THẨM ĐỊNH DI SẢN', 60, 104);

    // Left: 3D Avatar Image with frame
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 60, 125, 470, 595);

      ctx.strokeStyle = '#3F3F46';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(60, 125, 470, 595);

      const rightX = 570;

      // Ethnicity and title in mystical Vietnamese font
      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 14px "Nunito", sans-serif';
      ctx.fillText(analysis.identifiedEthnicity.toUpperCase(), rightX, 155);

      ctx.fillStyle = '#FEF08A';
      ctx.font = 'bold 26px "Charm", "Playfair Display", "Lora", serif';
      ctx.fillText(analysis.loreCard.title, rightX, 195);

      ctx.fillStyle = '#A1A1AA';
      ctx.font = '13px "Nunito", sans-serif';
      ctx.fillText(`Niên đại & Khu vực: ${analysis.loreCard.origin}`, rightX, 222);

      // Harmony Score Badge
      ctx.fillStyle = '#17171C';
      ctx.fillRect(rightX, 240, 270, 36);
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(rightX, 240, 270, 36);

      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 14px "Nunito", sans-serif';
      ctx.fillText(`✔ ĐỘ HÀI HÒA DI SẢN: ${analysis.harmonyScore}/100`, rightX + 16, 263);

      // Cultural Story block in elegant Lora serif
      ctx.fillStyle = '#E4E4E7';
      ctx.font = 'italic 14.5px "Lora", Georgia, serif';
      const words = analysis.loreCard.culturalStory.split(' ');
      let line = '';
      let curY = 308;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 540 && n > 0) {
          ctx.fillText(line, rightX, curY);
          line = words[n] + ' ';
          curY += 23;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, rightX, curY);

      // Craftsmanship note
      curY += 32;
      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 12.5px "Nunito", sans-serif';
      ctx.fillText('KỸ NGHỆ THỦ CÔNG:', rightX, curY);

      curY += 20;
      ctx.fillStyle = '#A1A1AA';
      ctx.font = '12px "Nunito", sans-serif';
      ctx.fillText(analysis.loreCard.craftsmanship, rightX, curY, 540);

      // USER'S CUSTOM ADJUSTED MESSAGE (Lời tựa cá nhân hóa trong khung son vàng)
      curY += 38;
      const boxW = 540;
      const boxH = 92;
      ctx.fillStyle = 'rgba(23, 23, 30, 0.9)';
      ctx.fillRect(rightX, curY, boxW, boxH);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1;
      ctx.strokeRect(rightX, curY, boxW, boxH);

      // Tag
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 10px "Nunito", sans-serif';
      ctx.fillText('✦ LỜI TỰA TRIỂN LÃM & DI SẢN ✦', rightX + 14, curY + 20);

      // Custom message text in mystical calligraphy font
      ctx.fillStyle = '#FEF08A';
      ctx.font = 'italic 16.5px "Charm", "Lora", cursive, serif';
      const msgWords = (`“${customMessage}”`).split(' ');
      let msgLine = '';
      let msgY = curY + 46;
      for (let i = 0; i < msgWords.length; i++) {
        const testLine = msgLine + msgWords[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > 510 && i > 0) {
          ctx.fillText(msgLine, rightX + 16, msgY);
          msgLine = msgWords[i] + ' ';
          msgY += 24;
        } else {
          msgLine = testLine;
        }
      }
      ctx.fillText(msgLine, rightX + 16, msgY);

      // Watermark
      ctx.fillStyle = '#52525B';
      ctx.font = '11px "Nunito", sans-serif';
      ctx.fillText('Mô hình Humanoid 3D — Sắc Việt Heritage Avatar Studio', rightX, 706);

      const downloadLink = document.createElement('a');
      downloadLink.download = `Lookbook_SacViet_${analysis.loreCard.title.replace(/\s+/g, '_')}.png`;
      downloadLink.href = posterCanvas.toDataURL('image/png');
      downloadLink.click();
    };
    img.src = snapshotUrl;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#141418] border border-[#26262E] rounded-2xl shadow-2xl overflow-hidden my-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 px-5 sm:px-6 border-b border-[#26262E] bg-[#101014]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="text-zinc-100 font-semibold text-xs sm:text-sm tracking-wide">
              Lookbook Sắc Việt — Triển Lãm Avatar Di Sản
            </span>
            <span className="hidden sm:inline text-[10px] text-amber-400 font-mono px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/40">
              HD 1200×800
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#25252E] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div ref={posterRef} className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 bg-[#0E0E12]">
          {/* Left: 3D Snapshot */}
          <div className="flex flex-col items-center justify-center bg-[#101014] rounded-xl border border-[#26262E] overflow-hidden relative min-h-[320px]">
            {snapshotUrl ? (
              <img
                src={snapshotUrl}
                alt="Humanoid Avatar 3D"
                className="w-full h-auto max-h-[440px] object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
              />
            ) : (
              <div className="p-12 text-zinc-600 text-xs">Chưa có ảnh chụp 3D</div>
            )}
            <div className="absolute bottom-2.5 left-2.5 bg-[#18181D]/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-zinc-400 border border-[#2D2D36]">
              Humanoid 3D Mesh
            </div>
          </div>

          {/* Right: Cultural Lore & User Custom Message */}
          <div className="flex flex-col justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold text-red-500 uppercase tracking-widest">
                {analysis.identifiedEthnicity}
              </div>

              {/* Mystical Vietnamese Title */}
              <h3 className="text-2xl sm:text-3xl font-bold text-amber-200 font-mystical mt-1 leading-snug drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]">
                {analysis.loreCard.title}
              </h3>

              <div className="text-xs text-zinc-400 mt-0.5 font-heritage">
                Niên đại & Khu vực: <span className="text-zinc-300">{analysis.loreCard.origin}</span>
              </div>

              <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#18181D] border border-red-900/60 rounded-lg text-xs font-semibold text-red-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Độ Hài Hòa Di Sản: {analysis.harmonyScore}/100</span>
              </div>

              {/* Cultural Story with Mystical/Heritage styling */}
              <div className="mt-3 p-3 bg-[#16161C] rounded-xl border border-[#282832] text-xs text-zinc-200 leading-relaxed font-heritage italic">
                "{analysis.loreCard.culturalStory}"
              </div>

              <div className="mt-2.5 text-xs text-zinc-400 leading-relaxed">
                <span className="text-red-400 font-medium">Kỹ nghệ: </span>
                {analysis.loreCard.craftsmanship}
              </div>

              {/* USER ADJUSTABLE CUSTOM MESSAGE (LỜI TỰA / THÔNG ĐIỆP CÁ NHÂN HÓA) */}
              <div className="mt-3.5 p-3 rounded-xl bg-gradient-to-br from-[#1A1612] to-[#14141A] border border-amber-900/60 shadow-inner">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                    <Feather className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lời Tựa Triển Lãm & Thông Điệp Của Bạn:</span>
                  </div>
                  <button
                    onClick={() => setIsEditingMessage(!isEditingMessage)}
                    className="text-[10px] text-amber-400 hover:text-amber-200 underline cursor-pointer"
                  >
                    {isEditingMessage ? 'Xong' : 'Chỉnh sửa'}
                  </button>
                </div>

                {/* Live Mystical Message Preview */}
                <div className="p-2.5 rounded-lg bg-[#0F0E13] border border-amber-950 text-amber-200 font-mystical text-base sm:text-lg leading-relaxed shadow-sm">
                  “{customMessage}”
                </div>

                {/* Edit Controls / Message Input */}
                {isEditingMessage && (
                  <div className="mt-2.5 flex flex-col gap-2 animate-fadeIn">
                    <input
                      type="text"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Nhập thông điệp, lời đề từ hoặc cảm hứng của bạn..."
                      maxLength={95}
                      className="w-full px-2.5 py-1.5 bg-[#101014] border border-amber-800/60 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    />

                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1 mr-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Gợi ý:
                      </span>
                      {MESSAGE_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCustomMessage(preset)}
                          className="px-2 py-0.5 rounded text-[10px] bg-[#221C16] hover:bg-amber-950/80 text-amber-300 border border-amber-900/50 transition-colors truncate max-w-[200px]"
                          title={preset}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-3 border-t border-[#26262E] flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 font-mono">HD Poster 1200 × 800</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-[#25252E] transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={handleDownloadPoster}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-semibold rounded-lg text-xs transition-all shadow-md cursor-pointer hover:shadow-red-900/40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Poster Di Sản HD</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

