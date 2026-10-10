import React, { useState } from 'react';
import {
  X,
  MapPin,
  Compass,
  Layers,
  Sparkles,
  Info,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Shirt,
  Shield,
  Eye
} from 'lucide-react';
import { Button } from '../ui/components';

export interface EthnicRegionInfo {
  id: string;
  name: string;
  groupName: string;
  outfitId?: string;
  region: string;
  provinces: string[];
  population: string;
  color: string;
  culturalTrait: string;
  costumeHighlight: string;
  coordinates: { x: number; y: number }; // SVG percentage
  territoryPolygon?: string; // Optional path
}

export interface HistoricalTerritoryEra {
  id: string;
  yearLabel: string;
  dynasty: string;
  title: string;
  description: string;
  boundaryNote: string;
  color: string;
  eraId: string;
  svgHighlightRegion: string; // 'north_only' | 'north_central' | 'down_to_hue' | 'down_to_binhdinh' | 'full_s_shape'
}

export const ETHNIC_REGIONS: EthnicRegionInfo[] = [
  {
    id: 'thai',
    name: 'Dân Tộc Thái',
    groupName: 'Thái Đen & Thái Trắng',
    outfitId: 'thai_ao_com',
    region: 'Tây Bắc Bộ',
    provinces: ['Sơn La', 'Điện Biên', 'Lai Châu', 'Hòa Bình'],
    population: '~1.8 triệu người',
    color: '#38bdf8',
    culturalTrait: 'Văn hóa múa Xòe di sản UNESCO, nhà sàn truyền thống, lễ hội Hết Chá, điệu Khắp Thái trữ tình.',
    costumeHighlight: 'Áo Cóm trắng bó sát, hàng cúc bạc khuy bướm (Mác Bén), váy đen tuyền, thắt lưng xanh đỏ và khăn Piêu thêu tay tinh xảo.',
    coordinates: { x: 31, y: 15 },
  },
  {
    id: 'hmong',
    name: 'Dân Tộc H\'Mông',
    groupName: 'H\'Mông Hoa, H\'Mông Đen, H\'Mông Trắng',
    outfitId: 'hmong_lanh_tho_cam',
    region: 'Vùng Núi Cao Phía Bắc',
    provinces: ['Hà Giang', 'Lào Cai (Sa Pa)', 'Yên Bái', 'Sơn La'],
    population: '~1.4 triệu người',
    color: '#e11d48',
    culturalTrait: 'Kỹ thuật vẽ sáp ong trên vải lanh, nhuộm chàm cổ truyền, tiếng khèn H\'Mông gọi bạn tình trên vách đá tai mèo.',
    costumeHighlight: 'Váy xòe xếp nếp lanh thêu hoa văn chữ thập, xoắn ốc sáp ong, nẹp ngực vạt chéo và vòng kiềng bạc chạm khắc.',
    coordinates: { x: 42, y: 8 },
  },
  {
    id: 'tay',
    name: 'Dân Tộc Tày',
    groupName: 'Tày & Nùng',
    outfitId: 'tay_tho_cam_cham',
    region: 'Đông Bắc Bộ (Việt Bắc)',
    provinces: ['Cao Bằng', 'Lạng Sơn', 'Bắc Kạn', 'Tuyên Quang'],
    population: '~1.85 triệu người',
    color: '#818cf8',
    culturalTrait: 'Hát Then - đàn Tính di sản phi vật thể nhân loại, lễ hội Lồng Tồng (xuống đồng), nhà sàn cột gỗ nghiến.',
    costumeHighlight: 'Áo dài chàm năm thân dung dị đoan trang, thắt lưng lụa, xà tích bạc bên hông và khăn vuông đội đầu đen tuyền.',
    coordinates: { x: 62, y: 12 },
  },
  {
    id: 'kinh',
    name: 'Dân Tộc Kinh (Việt)',
    groupName: 'Dân tộc đa số toàn quốc',
    outfitId: 'kinh_ao_dai_ngu_than',
    region: 'Đồng Bằng Sông Hồng & Dọc Duyên Hải',
    provinces: ['Hà Nội', 'Thừa Thiên Huế', 'TP. Hồ Chí Minh', 'Toàn quốc'],
    population: '~82 triệu người (chiếm 85.3%)',
    color: '#f59e0b',
    culturalTrait: 'Văn minh lúa nước Sông Hồng, văn hóa Nho học Thăng Long, nhã nhạc cung đình Huế, ca trù, quan họ.',
    costumeHighlight: 'Áo Dài Ngũ Thân năm tà ngũ thường, Áo Nhật Bình cổ vuông cung đình, nón lá chóp nhọn, khăn đóng truyền thống.',
    coordinates: { x: 58, y: 22 },
  },
  {
    id: 'cham',
    name: 'Dân Tộc Chăm',
    groupName: 'Chăm Hroi & Chăm Nam Bộ',
    outfitId: 'cham_kate',
    region: 'Duyên Hải Nam Trung Bộ',
    provinces: ['Ninh Thuận', 'Bình Thuận', 'An Giang'],
    population: '~180.000 người',
    color: '#ec4899',
    culturalTrait: 'Lễ hội Katê bên tháp Chăm cổ kính, vũ điệu Apsara uyển chuyển, gốm Bàu Trúc, dệt thổ cẩm Mỹ Nghiệp.',
    costumeHighlight: 'Áo dài trắng chui đầu Aw Baf-kawn, dải khăn Kaban choàng chéo ngực rực rỡ sắc màu, thắt lưng thêu hoa văn hình học.',
    coordinates: { x: 70, y: 72 },
  },
  {
    id: 'ede',
    name: 'Dân Tộc Ê-đê',
    groupName: 'Không Gian Văn Hóa Cồng Chiêng',
    outfitId: 'ede_tay_nguyen',
    region: 'Cao Nguyên Tây Nguyên',
    provinces: ['Đắk Lắk', 'Gia Lai', 'Đắk Nông'],
    population: '~400.000 người',
    color: '#10b981',
    culturalTrait: 'Chế độ mẫu hệ nhà dài Ê-đê, Không gian văn hóa Cồng chiêng Tây Nguyên, sử thi Đăm Săn anh hùng.',
    costumeHighlight: 'Áo chui đầu xẻ ngang vai (Áo Kteh), dải hoa văn thổ cẩm đỏ chạy dọc ngực tượng trưng thần mặt trời, váy dệt chỉ màu kỳ công.',
    coordinates: { x: 65, y: 60 },
  },
];

export const HISTORICAL_TERRITORIES: HistoricalTerritoryEra[] = [
  {
    id: 'era_dong_son',
    yearLabel: 'TK VII TCN - TK II TCN',
    dynasty: 'Thời Hùng Vương - Văn Lang / Âu Lạc',
    title: 'Cái nôi Văn minh Sông Hồng & Văn hóa Đông Sơn',
    description: 'Địa bàn thời các Vua Hùng định đô tại Phong Châu (Phú Thọ ngày nay), cư dân Lạc Việt định cư tại lưu vực ba con sông lớn: Sông Hồng, Sông Mã, Sông Cả.',
    boundaryNote: 'Bắc Bộ và một phần Bắc Trung Bộ (Thanh Hóa, Nghệ An).',
    color: '#d4a359',
    eraId: 'hung_vuong',
    svgHighlightRegion: 'north_only',
  },
  {
    id: 'era_1009',
    yearLabel: 'Năm 1009 - 1069',
    dynasty: 'Thời Nhà Lý (Vua Lý Thái Tổ)',
    title: 'Đại Việt định đô Thăng Long (1010)',
    description: 'Vua Lý Thái Tổ dời đô từ Hoa Lư về Đại La đổi tên thành Thăng Long. Cương vực Đại Việt thời kỳ đầu trải từ vùng biên giới phía Bắc (Việt Bắc) đến Đèo Ngang (Hà Tĩnh).',
    boundaryNote: 'Bắc Bộ kéo dài tới Hà Tĩnh (giáp ranh Vương quốc Chăm Pa cổ).',
    color: '#eab308',
    eraId: 'ly_tran',
    svgHighlightRegion: 'north_central',
  },
  {
    id: 'era_1069',
    yearLabel: 'Năm 1069',
    dynasty: 'Thời Lý Thường Kiệt (Lý Thánh Tông)',
    title: 'Mở rộng về phía Nam: 3 Châu Bố Chính, Địa Lý, Ma Linh',
    description: 'Sau cuộc tiến quân của Lý Thường Kiệt, Đại Việt tiếp nhận thêm 3 châu Bố Chính, Địa Lý, Ma Linh (nay thuộc toàn bộ địa giới tỉnh Quảng Bình và bắc tỉnh Quảng Trị).',
    boundaryNote: 'Mở rộng qua Sông Gianh đến sông Bến Hải (Quảng Trị ngày nay).',
    color: '#a3e635',
    eraId: 'ly_tran',
    svgHighlightRegion: 'down_to_quangbinh',
  },
  {
    id: 'era_1306',
    yearLabel: 'Năm 1306',
    dynasty: 'Thời Nhà Trần (Vua Trần Anh Tông & Huyền Trân Công Chúa)',
    title: 'Tiếp nhận Châu Ô & Châu Lý làm sính lễ',
    description: 'Công chúa Huyền Trân kết duyên cùng vua Chăm Pa Chế Mân; Đại Việt tiếp nhận hai châu Ô và châu Lý, sau đổi tên thành Thuận Châu và Hóa Châu (Quảng Trị và Thừa Thiên Huế ngày nay).',
    boundaryNote: 'Cương vực tiến đến Đèo Hải Vân (Thừa Thiên Huế).',
    color: '#4ade80',
    eraId: 'ly_tran',
    svgHighlightRegion: 'down_to_hue',
  },
  {
    id: 'era_1471',
    yearLabel: 'Năm 1471',
    dynasty: 'Thời Vua Lê Thánh Tông (Thời Lê Sơ)',
    title: 'Lập Đạo Thừa Tuyên Quảng Nam & Bình Định',
    description: 'Vua Lê Thánh Tông tiến quân bình định phương Nam, thành lập đạo thừa tuyên Quảng Nam (gồm Đà Nẵng, Quảng Nam, Quảng Ngãi, Bình Định tới đèo Cù Mông).',
    boundaryNote: 'Cương vực vươn tới Quy Nhơn, Bình Định (thành Đồ Bàn / Vijaya cũ).',
    color: '#2dd4bf',
    eraId: 'le_so',
    svgHighlightRegion: 'down_to_binhdinh',
  },
  {
    id: 'era_1757',
    yearLabel: 'Năm 1653 - 1757',
    dynasty: 'Thời Các Chúa Nguyễn Khai Khẩn',
    title: 'Mở cõi phương Nam: Nam Trung Bộ & Nam Bộ (Gia Định)',
    description: 'Dưới thời các Chúa Nguyễn, tướng Nguyễn Hữu Cảnh kinh lược lập phủ Gia Định (1698). Đến năm 1757, toàn bộ vùng đất Nam Bộ (Đồng bằng Sông Cửu Long) được sáp nhập hòa nhập vào bản đồ Đại Việt.',
    boundaryNote: 'Định hình trọn vẹn dải đất phương Nam và mũi Cà Mau.',
    color: '#38bdf8',
    eraId: 'nguyen',
    svgHighlightRegion: 'full_s_shape',
  },
  {
    id: 'era_1802',
    yearLabel: 'Năm 1802 - Hiện Nay',
    dynasty: 'Thời Triều Nguyễn & Việt Nam Toàn Vẹn',
    title: 'Toàn vẹn lãnh thổ hình chữ S & Biển Đảo Hoàng Sa - Trường Sa',
    description: 'Vua Gia Long thống nhất non sông, quốc hiệu Việt Nam (1804), khẳng định chủ quyền vững chắc trên hai quần đảo Hoàng Sa và Trường Sa. Đây là mái nhà chung của 54 dân tộc anh em.',
    boundaryNote: 'Lãnh thổ toàn vẹn từ Lũng Cú (Hà Giang) đến Mũi Cà Mau, cùng vùng trời và biển đảo.',
    color: '#fb7185',
    eraId: 'nguyen',
    svgHighlightRegion: 'full_s_shape',
  },
];

interface HeritageMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOutfitId?: string;
  selectedEraId?: string;
  onSelectEthnicityOutfit?: (outfitId: string) => void;
  onSelectHistoricalEra?: (eraId: string) => void;
}

export const HeritageMapModal: React.FC<HeritageMapModalProps> = ({
  isOpen,
  onClose,
  selectedOutfitId,
  selectedEraId,
  onSelectEthnicityOutfit,
  onSelectHistoricalEra,
}) => {
  const [mapMode, setMapMode] = useState<'ethnicities' | 'historical'>('ethnicities');
  const [selectedEthnicId, setSelectedEthnicId] = useState<string>('thai');
  const [selectedHistoricalIndex, setSelectedHistoricalIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentEthnic = ETHNIC_REGIONS.find((e) => e.id === selectedEthnicId) || ETHNIC_REGIONS[0];
  const currentHistory = HISTORICAL_TERRITORIES[selectedHistoricalIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl h-[92vh] max-h-[860px] bg-[#160e0d] border border-[#d4a359]/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#fdf6ec]">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-[#d4a359]/20 bg-[#1f1311] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#9e1b1b] to-[#d4a359] p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#160e0d] rounded-full flex items-center justify-center text-[#d4a359]">
                <Compass className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-base font-black text-[#fdf6ec] tracking-wide font-['Cinzel',serif]">
                BẢN ĐỒ DI SẢN & LÃNH THỔ LỊCH SỬ VIỆT NAM
              </h2>
              <p className="text-[11px] text-[#bfaea0]">
                Địa bàn 54 Dân tộc anh em & Diễn trình mở rộng cương vực qua các triều đại
              </p>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-2">
            <div className="bg-[#120b0a] p-1 rounded-full border border-[#d4a359]/25 flex items-center gap-1">
              <button
                onClick={() => setMapMode('ethnicities')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  mapMode === 'ethnicities'
                    ? 'bg-gradient-to-r from-[#9e1b1b] to-[#c83828] text-white shadow-md'
                    : 'text-[#bfaea0] hover:text-[#fdf6ec]'
                }`}
              >
                🗺️ Phân Bố 54 Dân Tộc
              </button>
              <button
                onClick={() => setMapMode('historical')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  mapMode === 'historical'
                    ? 'bg-gradient-to-r from-[#c99846] to-[#b88530] text-[#140d0c] shadow-md'
                    : 'text-[#bfaea0] hover:text-[#fdf6ec]'
                }`}
              >
                📜 Lãnh Thổ Qua Các Thời Kỳ
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-[#241615] hover:bg-[#341e1c] border border-[#d4a359]/30 flex items-center justify-center text-[#bfaea0] hover:text-white transition-colors cursor-pointer ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body: Left Map Viewport (SVG) + Right Details Panel */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* LEFT: INTERACTIVE SVG MAP OF VIETNAM (7 Cols) */}
          <div className="md:col-span-7 bg-[#100908] p-4 flex flex-col items-center justify-center relative border-r border-[#d4a359]/15 overflow-hidden select-none">
            {/* Ambient Background Grid */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#d4a359 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Map Canvas SVG Container */}
            <div className="w-full h-full max-h-[580px] relative flex items-center justify-center">
              <svg
                viewBox="0 0 520 680"
                className="w-full h-full max-h-[560px] filter drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]"
              >
                {/* Definitions: Gradients */}
                <defs>
                  <linearGradient id="vietnamGradNorth" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0.85" />
                  </linearGradient>
                  <linearGradient id="vietnamGradCentral" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#059669" stopOpacity="0.85" />
                  </linearGradient>
                  <linearGradient id="vietnamGradSouth" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.85" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Surrounding Geography Hints (Laos, Cambodia, Gulf) */}
                <text x="75" y="300" fill="#4a372f" fontSize="13" fontWeight="bold" letterSpacing="2">
                  LÀO
                </text>
                <text x="85" y="490" fill="#4a372f" fontSize="13" fontWeight="bold" letterSpacing="2">
                  CAMPUCHIA
                </text>
                <text x="330" y="190" fill="#40302b" fontSize="12" fontWeight="bold" letterSpacing="1">
                  VỊNH BẮC BỘ
                </text>
                <text x="360" y="440" fill="#40302b" fontSize="14" fontWeight="bold" letterSpacing="2">
                  BIỂN ĐÔNG
                </text>

                {/* ========================================================= */}
                {/* VIETNAM TERRITORY PATHS (S-SHAPE DIVIDED INTO 4 SECTORS)   */}
                {/* ========================================================= */}

                {/* 1. MIỀN BẮC (North: Hà Giang, Tây Bắc, Đồng Bằng Sông Hồng) */}
                <path
                  d="M 170 45 C 190 35, 230 40, 260 55 C 290 70, 310 90, 310 115 C 300 135, 280 150, 260 165 C 235 180, 220 200, 215 225 L 180 230 C 160 210, 140 180, 125 150 C 115 125, 125 90, 145 65 Z"
                  fill={
                    mapMode === 'historical'
                      ? currentHistory.svgHighlightRegion !== 'none'
                        ? currentHistory.color
                        : '#3b2520'
                      : selectedEthnicId === 'thai'
                      ? '#38bdf8'
                      : selectedEthnicId === 'hmong'
                      ? '#e11d48'
                      : selectedEthnicId === 'tay'
                      ? '#818cf8'
                      : '#f59e0b'
                  }
                  fillOpacity={0.85}
                  stroke="#fdf6ec"
                  strokeWidth="1.8"
                  className="transition-all duration-300 hover:opacity-95 cursor-pointer"
                  onClick={() => {
                    if (mapMode === 'ethnicities') setSelectedEthnicId('thai');
                  }}
                />

                {/* 2. BẮC TRUNG BỘ (Thanh Hóa, Nghệ An, Hà Tĩnh, Quảng Bình) */}
                <path
                  d="M 215 225 C 225 240, 240 260, 250 285 C 260 310, 275 330, 290 355 L 260 365 C 240 335, 225 305, 205 270 C 195 245, 205 235, 215 225 Z"
                  fill={
                    mapMode === 'historical'
                      ? ['down_to_quangbinh', 'down_to_hue', 'down_to_binhdinh', 'full_s_shape'].includes(
                          currentHistory.svgHighlightRegion
                        ) || currentHistory.svgHighlightRegion === 'north_central'
                        ? currentHistory.color
                        : '#291815'
                      : '#eab308'
                  }
                  fillOpacity={0.8}
                  stroke="#fdf6ec"
                  strokeWidth="1.8"
                  className="transition-all duration-300 hover:opacity-95 cursor-pointer"
                  onClick={() => {
                    if (mapMode === 'ethnicities') setSelectedEthnicId('kinh');
                  }}
                />

                {/* 3. NAM TRUNG BỘ & TÂY NGUYÊN (Quảng Trị, Huế, Đà Nẵng, Quảng Nam, Bình Định, Đắk Lắk, Ninh Thuận) */}
                <path
                  d="M 290 355 C 310 375, 335 400, 345 435 C 355 470, 350 510, 330 535 C 305 525, 280 495, 275 460 C 265 425, 260 395, 260 365 Z"
                  fill={
                    mapMode === 'historical'
                      ? ['down_to_hue', 'down_to_binhdinh', 'full_s_shape'].includes(
                          currentHistory.svgHighlightRegion
                        )
                        ? currentHistory.color
                        : '#221310'
                      : selectedEthnicId === 'ede'
                      ? '#10b981'
                      : selectedEthnicId === 'cham'
                      ? '#ec4899'
                      : '#059669'
                  }
                  fillOpacity={0.85}
                  stroke="#fdf6ec"
                  strokeWidth="1.8"
                  className="transition-all duration-300 hover:opacity-95 cursor-pointer"
                  onClick={() => {
                    if (mapMode === 'ethnicities') setSelectedEthnicId('ede');
                  }}
                />

                {/* 4. NAM BỘ (TP. Hồ Chí Minh, Đồng Bằng Sông Cửu Long, Mũi Cà Mau) */}
                <path
                  d="M 330 535 C 320 560, 290 585, 260 610 C 235 630, 205 640, 185 625 C 175 605, 195 580, 225 560 C 255 540, 290 530, 330 535 Z"
                  fill={
                    mapMode === 'historical'
                      ? currentHistory.svgHighlightRegion === 'full_s_shape'
                        ? currentHistory.color
                        : '#1c0f0d'
                      : '#38bdf8'
                  }
                  fillOpacity={0.85}
                  stroke="#fdf6ec"
                  strokeWidth="1.8"
                  className="transition-all duration-300 hover:opacity-95 cursor-pointer"
                  onClick={() => {
                    if (mapMode === 'ethnicities') setSelectedEthnicId('kinh');
                  }}
                />

                {/* ĐẢO PHÚ QUỐC */}
                <ellipse cx="145" cy="590" rx="9" ry="14" fill="#38bdf8" stroke="#fdf6ec" strokeWidth="1.2" />
                <text x="135" y="618" fill="#d4a359" fontSize="9" fontWeight="bold">
                  Phú Quốc
                </text>

                {/* QUẦN ĐẢO HOÀNG SA */}
                <g className="cursor-pointer">
                  <circle cx="430" cy="300" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="442" cy="312" r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="422" cy="318" r="3" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                  <text x="395" y="285" fill="#f5cf89" fontSize="11" fontWeight="bold">
                    QĐ. HOÀNG SA (Việt Nam)
                  </text>
                </g>

                {/* QUẦN ĐẢO TRƯỜNG SA */}
                <g className="cursor-pointer">
                  <circle cx="440" cy="520" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="455" cy="535" r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="425" cy="545" r="3" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="460" cy="565" r="3.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
                  <text x="400" y="505" fill="#f5cf89" fontSize="11" fontWeight="bold">
                    QĐ. TRƯỜNG SA (Việt Nam)
                  </text>
                </g>

                {/* ========================================================= */}
                {/* ETHNIC GROUP PINS / PINS IN ETHNIC MODE                   */}
                {/* ========================================================= */}
                {mapMode === 'ethnicities' && (
                  <>
                    {ETHNIC_REGIONS.map((ethnic) => {
                      const isSel = ethnic.id === selectedEthnicId;
                      // Mapping coordinate percentage to SVG 520x680
                      const px = (ethnic.coordinates.x / 100) * 520;
                      const py = (ethnic.coordinates.y / 100) * 680;

                      return (
                        <g
                          key={ethnic.id}
                          className="cursor-pointer transition-transform"
                          onClick={() => setSelectedEthnicId(ethnic.id)}
                        >
                          {/* Pulse wave if selected */}
                          {isSel && (
                            <circle
                              cx={px}
                              cy={py}
                              r="20"
                              fill={ethnic.color}
                              fillOpacity="0.25"
                              className="animate-ping"
                            />
                          )}

                          {/* Outer Pin */}
                          <circle
                            cx={px}
                            cy={py}
                            r={isSel ? '12' : '8'}
                            fill={ethnic.color}
                            stroke="#ffffff"
                            strokeWidth={isSel ? '3' : '1.8'}
                            filter="url(#glow)"
                          />
                          <circle cx={px} cy={py} r={isSel ? '4.5' : '3'} fill="#120b0a" />

                          {/* Label Chip */}
                          <rect
                            x={px - 44}
                            y={py + 12}
                            width="88"
                            height="20"
                            rx="10"
                            fill="#160e0d"
                            fillOpacity="0.92"
                            stroke={isSel ? ethnic.color : '#d4a359'}
                            strokeWidth={isSel ? '1.8' : '1'}
                          />
                          <text
                            x={px}
                            y={py + 26}
                            textAnchor="middle"
                            fill={isSel ? '#ffffff' : '#f5cf89'}
                            fontSize="10"
                            fontWeight="bold"
                          >
                            {ethnic.name}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>
            </div>

            {/* Bottom Legend Hint */}
            <div className="w-full flex items-center justify-between text-[11px] text-[#bfaea0] pt-2 border-t border-[#d4a359]/15">
              <span>* Nhấp vào vùng bản đồ hoặc địa bàn để xem chi tiết văn hóa & trang phục</span>
              <span className="text-[#f5cf89] font-bold">Chủ quyền toàn vẹn lãnh thổ Việt Nam</span>
            </div>
          </div>

          {/* RIGHT: DETAILS PANEL & ACTION CONTROLS (5 Cols) */}
          <div className="md:col-span-5 bg-[#1a1110] p-4.5 flex flex-col justify-between overflow-y-auto custom-scrollbar">
            {/* MODE 1: ETHNICITIES INFORMATION */}
            {mapMode === 'ethnicities' ? (
              <div className="space-y-4">
                {/* Horizontal Quick Select Carousel */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-[#f5cf89] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#d4a359]" />
                    Chọn dân tộc để định vị trên bản đồ:
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {ETHNIC_REGIONS.map((e) => {
                      const isSel = e.id === selectedEthnicId;
                      return (
                        <button
                          key={e.id}
                          onClick={() => setSelectedEthnicId(e.id)}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                            isSel
                              ? 'bg-[#d4a359]/20 border-[#d4a359] text-white shadow-sm'
                              : 'bg-[#221614] border-[#d4a359]/15 text-[#bfaea0] hover:border-[#d4a359]/40'
                          }`}
                        >
                          <div className="text-xs font-black truncate" style={{ color: isSel ? '#f5cf89' : e.color }}>
                            {e.name}
                          </div>
                          <div className="text-[10px] text-[#8e7c6e] truncate">{e.region}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Ethnic Info Card */}
                <div className="bg-[#241615] border border-[#d4a359]/25 rounded-2xl p-3.5 space-y-3 shadow-md">
                  <div className="flex items-center justify-between border-b border-[#d4a359]/15 pb-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#9e1b1b]/40 text-[#f5cf89] border border-[#d4a359]/25">
                        {currentEthnic.region}
                      </span>
                      <h3 className="text-base font-black text-[#fdf6ec] font-['Lora',serif] mt-1">
                        {currentEthnic.name}
                      </h3>
                      <p className="text-[11px] text-[#bfaea0] italic">{currentEthnic.groupName}</p>
                    </div>
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-inner"
                      style={{ backgroundColor: `${currentEthnic.color}25`, border: `2px solid ${currentEthnic.color}` }}
                    >
                      <MapPin className="w-5 h-5" style={{ color: currentEthnic.color }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#1a1110] p-2 rounded-xl border border-[#d4a359]/10">
                      <span className="text-[10px] text-[#8e7c6e] block">Địa bàn sinh sống:</span>
                      <span className="text-[#ebdcc9] font-bold text-[11px]">{currentEthnic.provinces.join(', ')}</span>
                    </div>
                    <div className="bg-[#1a1110] p-2 rounded-xl border border-[#d4a359]/10">
                      <span className="text-[10px] text-[#8e7c6e] block">Dân số thống kê:</span>
                      <span className="text-[#f5cf89] font-bold text-[11px]">{currentEthnic.population}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="text-[#f5cf89] font-bold flex items-center gap-1 text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
                      Bản sắc văn hóa đặc trưng:
                    </span>
                    <p className="text-[#bfaea0] text-[11px] leading-relaxed pl-1">{currentEthnic.culturalTrait}</p>
                  </div>

                  <div className="space-y-1.5 text-xs bg-[#1c1211] p-2.5 rounded-xl border border-[#d4a359]/15">
                    <span className="text-[#f5cf89] font-bold flex items-center gap-1 text-[11px]">
                      <Shirt className="w-3.5 h-3.5 text-[#d4a359]" />
                      Đặc trưng trang phục truyền thống:
                    </span>
                    <p className="text-[#ebdcc9] text-[11px] leading-relaxed">{currentEthnic.costumeHighlight}</p>
                  </div>
                </div>

                {/* 1-Click Equip Button */}
                {currentEthnic.outfitId && onSelectEthnicityOutfit && (
                  <Button
                    variant="gold"
                    size="md"
                    icon={Shirt}
                    onClick={() => {
                      onSelectEthnicityOutfit(currentEthnic.outfitId!);
                      onClose();
                    }}
                    className="w-full shadow-lg"
                  >
                    Khoác Lên Avatar 3D ({currentEthnic.name})
                  </Button>
                )}
              </div>
            ) : (
              /* MODE 2: HISTORICAL TERRITORY EVOLUTION */
              <div className="space-y-4">
                <span className="text-xs font-bold text-[#f5cf89] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#d4a359]" />
                  Chọn mốc thời kỳ mở rộng bờ cõi:
                </span>

                {/* Historical Timeline Milestone Cards */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                  {HISTORICAL_TERRITORIES.map((hist, idx) => {
                    const isSel = idx === selectedHistoricalIndex;
                    return (
                      <div
                        key={hist.id}
                        onClick={() => setSelectedHistoricalIndex(idx)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSel
                            ? 'bg-[#d4a359]/20 border-[#d4a359] text-white shadow-sm'
                            : 'bg-[#221614] border-[#d4a359]/15 text-[#bfaea0] hover:border-[#d4a359]/40'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[10px] font-bold px-2 py-0.2 rounded-full font-mono text-black"
                              style={{ backgroundColor: hist.color }}
                            >
                              {hist.yearLabel}
                            </span>
                            <span className="text-xs font-black text-[#fdf6ec]">{hist.dynasty}</span>
                          </div>
                          <p className="text-[10px] text-[#bfaea0] line-clamp-1">{hist.title}</p>
                        </div>
                        {isSel && <CheckCircle2 className="w-4 h-4 text-[#f5cf89] shrink-0 ml-2" />}
                      </div>
                    );
                  })}
                </div>

                {/* Detailed Historical Card */}
                <div className="bg-[#241615] border border-[#d4a359]/25 rounded-2xl p-3.5 space-y-2.5 shadow-md">
                  <div className="flex items-center gap-2 border-b border-[#d4a359]/15 pb-2">
                    <Shield className="w-4 h-4 text-[#d4a359]" />
                    <h4 className="text-sm font-black text-[#f5cf89] font-['Lora',serif]">
                      {currentHistory.title}
                    </h4>
                  </div>
                  <p className="text-xs text-[#ebdcc9] leading-relaxed">{currentHistory.description}</p>
                  <div className="bg-[#1c1211] p-2.5 rounded-xl border border-[#d4a359]/15">
                    <span className="text-[10px] text-[#8e7c6e] block font-bold">Ranh giới cương vực thời điểm này:</span>
                    <span className="text-xs text-[#f5cf89] font-bold">{currentHistory.boundaryNote}</span>
                  </div>
                </div>

                {/* Sync Era Button */}
                {onSelectHistoricalEra && (
                  <Button
                    variant="primary"
                    size="md"
                    icon={Calendar}
                    onClick={() => {
                      onSelectHistoricalEra(currentHistory.eraId);
                      onClose();
                    }}
                    className="w-full shadow-lg"
                  >
                    Đồng Bộ Dòng Lịch Sử ({currentHistory.dynasty})
                  </Button>
                )}
              </div>
            )}

            {/* Close Button at bottom */}
            <div className="pt-3 border-t border-[#d4a359]/15 flex justify-end">
              <Button variant="outline" size="sm" onClick={onClose} className="rounded-full">
                Đóng Bản Đồ
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
