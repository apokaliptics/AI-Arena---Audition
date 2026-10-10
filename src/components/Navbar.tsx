import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  Info,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
  Compass
} from 'lucide-react';
import { PresetOutfit } from '../types';
import { PRESET_OUTFITS } from '../constants/presets';

export interface TimelineEra {
  id: string;
  eraName: string;
  period: string;
  dynasty: string;
  highlightDescription: string;
  presetId: string;
  badgeColor: string;
}

export const HISTORICAL_TIMELINE: TimelineEra[] = [
  {
    id: 'dong_son',
    eraName: 'Cổ Đại / Đông Sơn',
    period: '2000 TCN - TK 1',
    dynasty: 'Thời Đại Hùng Vương',
    highlightDescription: 'Văn hóa Trống Đồng, chim Lạc, dệt thổ cẩm lanh nguyên sơ vùng núi cao sa pa.',
    presetId: 'hmong_lanh_tho_cam',
    badgeColor: '#D97706',
  },
  {
    id: 'ly_tran',
    eraName: 'Thời Lý - Trần',
    period: 'TK 11 - 14',
    dynasty: 'Đại Việt Cực Thịnh',
    highlightDescription: 'Áo Giao Lĩnh cổ chéo, hoa sen Đại Việt, sắc chàm trang nhã vùng Việt Bắc.',
    presetId: 'tay_tho_cam_cham',
    badgeColor: '#059669',
  },
  {
    id: 'ngu_than_nguyen',
    eraName: 'Triều Nguyễn (Ngũ Thân)',
    period: 'TK 18 - 19',
    dynasty: 'Thời Vua Minh Mạng',
    highlightDescription: 'Áo Dài Ngũ Thân định hình quốc phục: 5 thân áo, 5 khuy cài ngũ thường, tà trước tà sau buông dài.',
    presetId: 'kinh_ao_dai_ngu_than',
    badgeColor: '#DC2626',
  },
  {
    id: 'nhat_binh_hue',
    eraName: 'Cung Đình Huế (Nhật Bình)',
    period: 'TK 19 - 1945',
    dynasty: 'Hoàng Triều Nguyễn',
    highlightDescription: 'Áo Nhật Bình cổ hình chữ nhật tượng trưng ngũ hành, dải tay áo ngũ sắc trang trọng.',
    presetId: 'kinh_nhat_binh_hue',
    badgeColor: '#991B1B',
  },
  {
    id: 'tay_bac_thai',
    eraName: 'Tây Bắc (Áo Cóm)',
    period: 'Tây Bắc Cổ Truyền',
    dynasty: 'Văn Hóa Bản Địa Tây Bắc',
    highlightDescription: 'Áo Cóm hàng khuy bướm Hàng Mác Bén, váy đen tuyền thắt lưng đỏ duyên dáng.',
    presetId: 'thai_ao_com',
    badgeColor: '#F43F5E',
  },
  {
    id: 'tay_nguyen_ede',
    eraName: 'Tây Nguyên (Ê-đê)',
    period: 'Không Gian Cồng Chiêng',
    dynasty: 'Văn Hóa Đại Ngàn',
    highlightDescription: 'Áo dệt thổ cẩm xẻ ngang vai, dải đỏ tôn vinh thần mặt trời và thần rừng.',
    presetId: 'ede_tay_nguyen',
    badgeColor: '#EA580C',
  },
  {
    id: 'duyen_hai_cham',
    eraName: 'Champa (Katê)',
    period: 'Cổ Truyền Katê',
    dynasty: 'Duyên Hải Nam Trung Bộ',
    highlightDescription: 'Áo dài trắng cổ tròn chui đầu, dải khăn Kaban đỏ quấn chéo ngực rực rỡ.',
    presetId: 'cham_kate',
    badgeColor: '#EF4444',
  },
  {
    id: 'duong_dai',
    eraName: 'Đương Đại & Tự Do',
    period: 'TK 20 - Nay',
    dynasty: 'Giao Thoa Di Sản Toàn Dân',
    highlightDescription: 'Bản vẽ trống tự do sáng tạo, cá nhân hóa hoa văn 54 dân tộc trên nền tảng số.',
    presetId: 'custom_blank_template',
    badgeColor: '#71717A',
  },
];

interface NavbarProps {
  selectedPreset?: PresetOutfit;
  onSelectPreset?: (preset: PresetOutfit) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ selectedPreset, onSelectPreset }) => {
  const [showGuideModal, setShowGuideModal] = useState(false);
  const timelineNavRef = useRef<HTMLElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Find active era based on current selectedPreset
  const activeIndex = HISTORICAL_TIMELINE.findIndex(
    (e) => e.presetId === selectedPreset?.id
  );
  const currentIndex = activeIndex !== -1 ? activeIndex : 2;
  const activeEra = HISTORICAL_TIMELINE[currentIndex] || HISTORICAL_TIMELINE[0];

  const handleTimelineClick = (era: TimelineEra) => {
    if (!onSelectPreset) return;
    const matchingPreset = PRESET_OUTFITS.find((p) => p.id === era.presetId);
    if (matchingPreset) {
      onSelectPreset(matchingPreset);
    }
  };

  const handlePrevEra = () => {
    if (currentIndex > 0) {
      handleTimelineClick(HISTORICAL_TIMELINE[currentIndex - 1]);
    }
  };

  const handleNextEra = () => {
    if (currentIndex < HISTORICAL_TIMELINE.length - 1) {
      handleTimelineClick(HISTORICAL_TIMELINE[currentIndex + 1]);
    }
  };

  const handleJumpToNewest = () => {
    const newestEra = HISTORICAL_TIMELINE[HISTORICAL_TIMELINE.length - 1];
    handleTimelineClick(newestEra);
  };

  // Keep active timeline era node scrolled smoothly into view
  useEffect(() => {
    const activeBtn = nodeRefs.current[currentIndex];
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentIndex]);

  return (
    <>
      <header className="w-full bg-[#0B0B0E] border-b border-[#202026] sticky top-0 z-40 px-3 lg:px-4 py-2 flex items-center justify-between gap-3 overflow-hidden">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xs tracking-wider">SV</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-100 tracking-tight">SẮC VIỆT</span>
              <span className="text-[9px] font-semibold text-red-500 uppercase tracking-wider px-1 py-0.5 rounded border border-red-900/60 bg-red-950/30">
                Timeline
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 hidden xl:block truncate max-w-[140px]">
              Dòng Thời Gian Y Phục
            </div>
          </div>
        </div>

        {/* TIMELINE CONTROLS & CONTINUOUS AXIS WITH < > BUTTONS TOWARDS NEWEST */}
        <div className="flex-1 flex items-center gap-1.5 min-w-0">
          {/* Previous era button < */}
          <button
            onClick={handlePrevEra}
            disabled={currentIndex === 0}
            title="Lùi về niên đại cổ hơn (<)"
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-zinc-400 hover:text-white bg-[#141418] hover:bg-[#1E1E26] border border-[#272732] disabled:opacity-20 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 text-red-400" />
            <span className="hidden xl:inline text-[10px] font-medium text-zinc-300">Cổ hơn</span>
          </button>

          {/* INTERACTIVE HISTORICAL TIMELINE: CLEAN HORIZONTAL LINE WITH NODES */}
          <nav
            ref={timelineNavRef}
            aria-label="Dòng thời gian y phục"
            className="flex-1 flex items-center overflow-x-auto scrollbar-none py-1 px-1 relative min-w-0 scroll-smooth"
          >
            {/* Continuous sleek timeline axis line */}
            <div className="absolute top-[28px] left-6 right-6 h-[2px] bg-gradient-to-r from-[#22222A] via-[#3A3A48] to-[#22222A] pointer-events-none z-0" />

            <div className="flex items-center justify-between w-full min-w-max gap-3 sm:gap-5 px-3 relative z-10">
              {HISTORICAL_TIMELINE.map((era, idx) => {
                const isSelected = selectedPreset?.id === era.presetId;
                return (
                  <button
                    key={era.id}
                    ref={(el) => {
                      nodeRefs.current[idx] = el;
                    }}
                    onClick={() => handleTimelineClick(era)}
                    title={`${era.eraName} (${era.period}): ${era.highlightDescription}`}
                    className="group flex flex-col items-center py-0.5 px-1 transition-all cursor-pointer focus:outline-none select-none"
                  >
                    {/* Era Name (Above the line) */}
                    <span
                      className={`text-[11px] tracking-tight transition-all whitespace-nowrap mb-1.5 leading-none ${
                        isSelected
                          ? 'text-red-400 font-bold scale-105 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                          : 'text-zinc-400 font-medium group-hover:text-zinc-200'
                      }`}
                    >
                      {era.eraName}
                    </span>

                    {/* Node Dot (On the line) */}
                    <div className="relative flex items-center justify-center my-0.5">
                      <div
                        className={`w-3.5 h-3.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                          isSelected
                            ? 'bg-red-500 ring-4 ring-red-600/30 shadow-[0_0_12px_rgba(220,38,38,0.9)] scale-125'
                            : 'bg-[#121217] border-2 border-[#383844] group-hover:border-zinc-300 group-hover:scale-110'
                        }`}
                      >
                        {isSelected ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        ) : (
                          <div className="w-1 h-1 rounded-full bg-[#383844] group-hover:bg-zinc-400 transition-colors" />
                        )}
                      </div>
                    </div>

                    {/* Century / Period (Below the line) */}
                    <span
                      className={`text-[9px] font-mono tracking-wider transition-colors whitespace-nowrap mt-1.5 leading-none ${
                        isSelected
                          ? 'text-zinc-200 font-semibold'
                          : 'text-zinc-500 group-hover:text-zinc-400'
                      }`}
                    >
                      {era.period}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Next era button > (Moves towards the newest timeline) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleNextEra}
              disabled={currentIndex === HISTORICAL_TIMELINE.length - 1}
              title="Tiến tới niên đại mới hơn (>)"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-zinc-400 hover:text-white bg-[#141418] hover:bg-[#1E1E26] border border-[#272732] disabled:opacity-20 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer shadow-sm"
            >
              <span className="hidden xl:inline text-[10px] font-medium text-zinc-300">Mới hơn</span>
              <ChevronRight className="w-4 h-4 text-red-400" />
            </button>

            {currentIndex < HISTORICAL_TIMELINE.length - 1 && (
              <button
                onClick={handleJumpToNewest}
                title="Nhảy thẳng tới niên đại mới nhất (Đương Đại)"
                className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold text-red-400 hover:text-white bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 transition-colors cursor-pointer"
              >
                <span>Mới nhất</span>
                <span>»</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Info & Guide button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex flex-col text-right text-[10px]">
            <span className="text-zinc-500 uppercase tracking-widest text-[8px]">Niên Đại Đang Xem:</span>
            <span className="text-red-400 font-semibold truncate max-w-[130px]">{activeEra.dynasty}</span>
          </div>

          <button
            onClick={() => setShowGuideModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#18181D] hover:bg-[#25252E] border border-[#2D2D36] text-[11px] text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Xem nguyên lý mô hình UV Template 2D"
          >
            <Info className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden md:inline">Nguyên Lý</span>
          </button>
        </div>
      </header>

      {/* Guide modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-[#141418] border border-[#26262E] rounded-2xl shadow-2xl p-5 text-zinc-200">
            <div className="flex items-center justify-between border-b border-[#26262E] pb-3">
              <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
                <BookOpen className="w-4 h-4 text-red-500" />
                <span>Nguyên Lý & Dòng Thời Gian Y Phục "Sắc Việt"</span>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#25252E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 text-xs leading-relaxed text-zinc-400 max-h-[70vh] overflow-y-auto pr-1">
              <div className="p-3 bg-[#18181D] rounded-xl border border-[#26262E]">
                <h4 className="font-semibold text-zinc-200 text-xs mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-500" />
                  <span>Dòng Thời Gian Y Phục 54 Dân Tộc (Timeline)</span>
                </h4>
                <p>
                  Thanh dòng thời gian phía trên xâu chuỗi các niên đại lịch sử quan trọng: từ thời <strong className="text-zinc-200">Đông Sơn</strong>, triều đại <strong className="text-zinc-200">Lý - Trần</strong>, thời <strong className="text-zinc-200">Lê Sơ</strong>, đến <strong className="text-zinc-200">Triều Nguyễn</strong> (với Áo Dài Ngũ Thân và Áo Nhật Bình Cung Đình), kết hợp cùng kho tàng y phục truyền thống phong phú của các dân tộc <strong className="text-zinc-200">Thái, Tày, H'Mông, Ê-đê, Chăm</strong>.
                </p>
              </div>

              <div className="p-3 bg-[#18181D] rounded-xl border border-[#26262E]">
                <h4 className="font-semibold text-zinc-200 text-xs mb-1">
                  Cấu Trúc Tà Áo Dài (Tà Trước & Tà Sau)
                </h4>
                <p>
                  Áo Dài Ngũ Thân và Áo Nhật Bình được may với hai vạt áo chính buông rủ: <strong className="text-zinc-200">Tà Trước</strong> và <strong className="text-zinc-200">Tà Sau</strong>, bắt đầu chuẩn xác từ đường eo hông xuống chân, che phủ quần lụa bên trong và tạo dáng đi uyển chuyển khi di chuyển.
                </p>
              </div>

              <div className="p-3 bg-[#18181D] rounded-xl border border-[#26262E]">
                <h4 className="font-semibold text-zinc-200 text-xs mb-1">
                  Chế Độ Cô Lập Vùng Vẽ (Isolate Flaps)
                </h4>
                <p>
                  Bảng vẽ cho phép người dùng <strong className="text-zinc-200">cô lập riêng từng mảnh vải</strong> (Thân trước, Tà trước, Thân sau, Tà sau, Ống tay, Ống quần) để tập trung thêu dệt và vẽ hoa văn chi tiết mà không bị phân tâm bởi các vùng khác. Mọi nét vẽ tự động đồng bộ ngay lập tức sang mô hình 3D.
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg text-xs"
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
