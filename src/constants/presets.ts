import { PresetOutfit, CulturalMotifStamp } from '../types';
import { drawMotifStamp } from '../utils/uvCanvasRenderer';

export const HERITAGE_PALETTE = [
  { name: 'Đỏ Son (Crimson)', hex: '#DC2626' },
  { name: 'Đỏ Thẫm Cung Đình', hex: '#991B1B' },
  { name: 'Xám Than (Charcoal)', hex: '#27272A' },
  { name: 'Xám Nhạt (Ash)', hex: '#71717A' },
  { name: 'Trắng Lụa (Silk White)', hex: '#FAFAFA' },
  { name: 'Đen Nhám (Matte Black)', hex: '#18181B' },
  { name: 'Bạc (Silver)', hex: '#E4E4E7' },
  { name: 'Vàng Kim (Gold)', hex: '#F59E0B' },
];

export const CULTURAL_STAMPS: CulturalMotifStamp[] = [
  { id: 'lotus', name: 'Hoa Sen Đại Việt', origin: 'Thời Lý - Trần', pathType: 'lotus' },
  { id: 'bronze_drum', name: 'Mặt Trời Đông Sơn', origin: 'Thời Đại Hùng Vương', pathType: 'bronze_drum' },
  { id: 'bird_lac', name: 'Chim Lạc', origin: 'Trống Đồng', pathType: 'bird_lac' },
  { id: 'dragon_cloud', name: 'Vân Mây Cát Tường', origin: 'Thời Lê - Nguyễn', pathType: 'dragon_cloud' },
  { id: 'thai_diamond', name: 'Quả Trám Thổ Cẩm', origin: 'Dân Tộc Thái', pathType: 'thai_diamond' },
  { id: 'hmong_spiral', name: 'Xoắn Ốc Sáp Ong', origin: 'Dân Tộc H\'Mông', pathType: 'hmong_spiral' },
];

/**
 * Standard UV Coordinates matching UV_ZONES wireframe layout 100%
 */
export const UV_COORDS = {
  torso: {
    x: 272,
    y: 20,
    w: 480,
    h: 460,
    frontX: 352,
    frontY: 90,
    frontW: 160,
    frontH: 320,
    frontCenterX: 432,
    backX: 592,
    backY: 90,
    backW: 160,
    backH: 320,
    backCenterX: 672,
  },
  armL: { x: 24, y: 20, w: 180, h: 460, cuffY: 410, cuffH: 70 },
  armR: { x: 820, y: 20, w: 180, h: 460, cuffY: 410, cuffH: 70 },
  skirtFront: { x: 272, y: 520, w: 230, h: 480, cx: 387 },
  skirtBack: { x: 522, y: 520, w: 230, h: 480, cx: 637 },
  legL: { x: 24, y: 520, w: 180, h: 480 },
  legR: { x: 820, y: 520, w: 180, h: 480 },
};

export const PRESET_OUTFITS: PresetOutfit[] = [
  {
    id: 'kinh_ao_dai_ngu_than',
    name: 'Áo Dài Ngũ Thân Truyền Thống',
    ethnicity: 'Kinh (Áo Dài / Ngũ Thân)',
    era: 'Thế kỷ 18 - 19 (Triều Nguyễn)',
    region: 'Toàn quốc',
    description: 'Áo ngũ thân đỏ son đoan trang, cài 5 cúc ngũ thường, quần lụa trắng thanh lịch.',
    primaryColor: '#DC2626',
    accentColor: '#FAFAFA',
    suggestedAccessories: ['man_doi_dau', 'kieng_bac'],
    drawTemplate: (ctx, width, height) => {
      // Base background
      ctx.fillStyle = '#18181D';
      ctx.fillRect(0, 0, width, height);

      // Pants (Quần lụa trắng) - exactly inside left and right leg clusters
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(UV_COORDS.legL.x, UV_COORDS.legL.y, UV_COORDS.legL.w, UV_COORDS.legL.h);
      ctx.fillRect(UV_COORDS.legR.x, UV_COORDS.legR.y, UV_COORDS.legR.w, UV_COORDS.legR.h);

      // Torso Cluster (Crimson Red)
      ctx.fillStyle = '#B91C1C';
      ctx.fillRect(UV_COORDS.torso.x, UV_COORDS.torso.y, UV_COORDS.torso.w, UV_COORDS.torso.h);

      // Collar
      ctx.fillStyle = '#991B1B';
      ctx.fillRect(412, 90, 40, 50);

      // Diagonal lapel line (Cổ chéo ngũ thân)
      ctx.strokeStyle = '#FAFAFA';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(412, 105);
      ctx.lineTo(507, 175);
      ctx.stroke();

      // 5 Buttons along lapel
      ctx.fillStyle = '#FAFAFA';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(420 + i * 19, 110 + i * 14, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Lotus chest motif (centered at x = 432)
      drawMotifStamp(ctx, 'lotus', 432, 250, 65, '#EF4444');

      // Gấu áo bottom border
      ctx.fillStyle = '#991B1B';
      ctx.fillRect(UV_COORDS.torso.frontX, 410, UV_COORDS.torso.frontW, 20);
      ctx.fillRect(UV_COORDS.torso.backX, 410, UV_COORDS.torso.backW, 20);

      // Flaps (Tà áo dài trước & sau)
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(UV_COORDS.skirtFront.x, UV_COORDS.skirtFront.y, UV_COORDS.skirtFront.w, UV_COORDS.skirtFront.h);
      ctx.fillRect(UV_COORDS.skirtBack.x, UV_COORDS.skirtBack.y, UV_COORDS.skirtBack.w, UV_COORDS.skirtBack.h);

      // Sleeves (Tay áo trái & phải)
      ctx.fillStyle = '#B91C1C';
      ctx.fillRect(UV_COORDS.armL.x, UV_COORDS.armL.y, UV_COORDS.armL.w, UV_COORDS.armL.h);
      ctx.fillRect(UV_COORDS.armR.x, UV_COORDS.armR.y, UV_COORDS.armR.w, UV_COORDS.armR.h);

      // White silk cuffs
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(UV_COORDS.armL.x, UV_COORDS.armL.cuffY, UV_COORDS.armL.w, 24);
      ctx.fillRect(UV_COORDS.armR.x, UV_COORDS.armR.cuffY, UV_COORDS.armR.w, 24);
    },
  },
  {
    id: 'kinh_nhat_binh_hue',
    name: 'Áo Nhật Bình Cung Đình Huế',
    ethnicity: 'Kinh (Áo Nhật Bình Cung Đình)',
    era: 'Triều Nguyễn (Cố đô Huế)',
    region: 'Kinh đô Huế',
    description: 'Y phục cung đình trang nghiêm với cổ áo hình chữ nhật ngũ hành và dải tay áo ngũ sắc.',
    primaryColor: '#991B1B',
    accentColor: '#DC2626',
    suggestedAccessories: ['man_doi_dau', 'kieng_bac'],
    drawTemplate: (ctx, width, height) => {
      ctx.fillStyle = '#18181D';
      ctx.fillRect(0, 0, width, height);

      // Pants (White)
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(UV_COORDS.legL.x, UV_COORDS.legL.y, UV_COORDS.legL.w, UV_COORDS.legL.h);
      ctx.fillRect(UV_COORDS.legR.x, UV_COORDS.legR.y, UV_COORDS.legR.w, UV_COORDS.legR.h);

      // Torso Cluster
      ctx.fillStyle = '#991B1B';
      ctx.fillRect(UV_COORDS.torso.x, UV_COORDS.torso.y, UV_COORDS.torso.w, UV_COORDS.torso.h);

      // Rectangular Collar (Cổ Nhật Bình) centered on front face (432)
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(397, 90, 70, 95);
      ctx.fillStyle = '#27272A';
      ctx.fillRect(412, 90, 40, 75);

      drawMotifStamp(ctx, 'bronze_drum', 432, 260, 70, '#DC2626');

      // Sleeves with 5 color bands (Tay áo ngũ sắc)
      ctx.fillStyle = '#991B1B';
      ctx.fillRect(UV_COORDS.armL.x, UV_COORDS.armL.y, UV_COORDS.armL.w, UV_COORDS.armL.h);
      ctx.fillRect(UV_COORDS.armR.x, UV_COORDS.armR.y, UV_COORDS.armR.w, UV_COORDS.armR.h);

      const bands = ['#27272A', '#DC2626', '#FAFAFA', '#F59E0B', '#71717A'];
      bands.forEach((b, idx) => {
        ctx.fillStyle = b;
        ctx.fillRect(UV_COORDS.armL.x, 360 + idx * 15, UV_COORDS.armL.w, 15);
        ctx.fillRect(UV_COORDS.armR.x, 360 + idx * 15, UV_COORDS.armR.w, 15);
      });

      // Flaps
      ctx.fillStyle = '#991B1B';
      ctx.fillRect(UV_COORDS.skirtFront.x, UV_COORDS.skirtFront.y, UV_COORDS.skirtFront.w, UV_COORDS.skirtFront.h);
      ctx.fillRect(UV_COORDS.skirtBack.x, UV_COORDS.skirtBack.y, UV_COORDS.skirtBack.w, UV_COORDS.skirtBack.h);

      // Hemline band
      ctx.fillStyle = '#27272A';
      ctx.fillRect(UV_COORDS.skirtFront.x, 940, UV_COORDS.skirtFront.w, 40);
      ctx.fillRect(UV_COORDS.skirtBack.x, 940, UV_COORDS.skirtBack.w, 40);
    },
  },
  {
    id: 'thai_ao_com',
    name: 'Áo Cóm Hàng Khuy Bướm & Váy Đen',
    ethnicity: 'Thái (Áo Cóm Khuy Bướm)',
    era: 'Văn hóa cổ truyền Tây Bắc',
    region: 'Sơn La, Điện Biên',
    description: 'Áo Cóm trắng bó sát, hàng cúc bạc khuy bướm Hàng Mác Bén, váy đen tuyền thắt lưng đỏ.',
    primaryColor: '#FAFAFA',
    accentColor: '#DC2626',
    suggestedAccessories: ['khan_pieu', 'kieng_bac'],
    drawTemplate: (ctx, width, height) => {
      ctx.fillStyle = '#18181B';
      ctx.fillRect(0, 0, width, height);

      // Torso (Áo Cóm Trắng)
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(UV_COORDS.torso.x, UV_COORDS.torso.y, UV_COORDS.torso.w, UV_COORDS.torso.h);

      // Cổ V nẹp đen centered at 432
      ctx.fillStyle = '#18181B';
      ctx.beginPath();
      ctx.moveTo(402, 90);
      ctx.lineTo(432, 135);
      ctx.lineTo(462, 90);
      ctx.closePath();
      ctx.fill();

      // Hàng Cúc Bướm Bạc (Mác Bén)
      ctx.fillStyle = '#71717A';
      for (let y = 150; y <= 370; y += 26) {
        ctx.beginPath();
        ctx.arc(432, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(422, y - 2, 20, 4);
      }

      // Thắt lưng đỏ (Hông áo)
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(UV_COORDS.torso.x, 385, UV_COORDS.torso.w, 35);

      // Sleeves (Trắng)
      ctx.fillStyle = '#FAFAFA';
      ctx.fillRect(UV_COORDS.armL.x, UV_COORDS.armL.y, UV_COORDS.armL.w, UV_COORDS.armL.h);
      ctx.fillRect(UV_COORDS.armR.x, UV_COORDS.armR.y, UV_COORDS.armR.w, UV_COORDS.armR.h);

      // Váy đen (Tà & Quần)
      ctx.fillStyle = '#09090B';
      ctx.fillRect(UV_COORDS.skirtFront.x, UV_COORDS.skirtFront.y, UV_COORDS.skirtFront.w, UV_COORDS.skirtFront.h);
      ctx.fillRect(UV_COORDS.skirtBack.x, UV_COORDS.skirtBack.y, UV_COORDS.skirtBack.w, UV_COORDS.skirtBack.h);
      ctx.fillRect(UV_COORDS.legL.x, UV_COORDS.legL.y, UV_COORDS.legL.w, UV_COORDS.legL.h);
      ctx.fillRect(UV_COORDS.legR.x, UV_COORDS.legR.y, UV_COORDS.legR.w, UV_COORDS.legR.h);

      // Gấu váy viền đỏ
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(UV_COORDS.skirtFront.x, 950, UV_COORDS.skirtFront.w, 30);
      ctx.fillRect(UV_COORDS.skirtBack.x, 950, UV_COORDS.skirtBack.w, 30);
    },
  },
  {
    id: 'tay_tho_cam_cham',
    name: 'Thổ Cẩm Chàm & Bạc Dân Tộc Tày',
    ethnicity: 'Tày (Thổ Cẩm Chàm & Bạc)',
    era: 'Văn hóa bản địa Việt Bắc',
    region: 'Cao Bằng, Lạng Sơn',
    description: 'Áo chàm xám than mộc mạc, nẹp áo viền đỏ son, dải quả trám Tây Bắc.',
    primaryColor: '#27272A',
    accentColor: '#DC2626',
    suggestedAccessories: ['kieng_bac', 'non_la'],
    drawTemplate: (ctx, width, height) => {
      ctx.fillStyle = '#18181B';
      ctx.fillRect(0, 0, width, height);

      // Torso & Skirt (Sắc chàm)
      ctx.fillStyle = '#27272A';
      ctx.fillRect(UV_COORDS.torso.x, UV_COORDS.torso.y, UV_COORDS.torso.w, UV_COORDS.torso.h);
      ctx.fillRect(UV_COORDS.skirtFront.x, UV_COORDS.skirtFront.y, UV_COORDS.skirtFront.w, UV_COORDS.skirtFront.h);
      ctx.fillRect(UV_COORDS.skirtBack.x, UV_COORDS.skirtBack.y, UV_COORDS.skirtBack.w, UV_COORDS.skirtBack.h);
      ctx.fillRect(UV_COORDS.legL.x, UV_COORDS.legL.y, UV_COORDS.legL.w, UV_COORDS.legL.h);
      ctx.fillRect(UV_COORDS.legR.x, UV_COORDS.legR.y, UV_COORDS.legR.w, UV_COORDS.legR.h);

      // Nẹp viền đỏ
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(422, 90);
      ctx.quadraticCurveTo(462, 140, 512, 190);
      ctx.stroke();

      // Quả trám ngực centered at 432
      drawMotifStamp(ctx, 'thai_diamond', 432, 250, 55, '#DC2626');

      // Thắt lưng đỏ
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(UV_COORDS.torso.x, 390, UV_COORDS.torso.w, 30);

      // Sleeves
      ctx.fillStyle = '#27272A';
      ctx.fillRect(UV_COORDS.armL.x, UV_COORDS.armL.y, UV_COORDS.armL.w, UV_COORDS.armL.h);
      ctx.fillRect(UV_COORDS.armR.x, UV_COORDS.armR.y, UV_COORDS.armR.w, UV_COORDS.armR.h);
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(UV_COORDS.armL.x, UV_COORDS.armL.cuffY, UV_COORDS.armL.w, 20);
      ctx.fillRect(UV_COORDS.armR.x, UV_COORDS.armR.cuffY, UV_COORDS.armR.w, 20);
    },
  },
  {
    id: 'hmong_lanh_tho_cam',
    name: 'Thổ Cẩm Hoa Văn Lanh Dân Tộc H\'Mông',
    ethnicity: 'H\'Mông (Thổ Cẩm Hoa Văn Lanh)',
    era: 'Văn hóa cổ truyền vùng cao',
    region: 'Hà Giang, Sa Pa',
    description: 'Thổ cẩm H\'Mông với cổ vạt chéo, sọc tay áo đậm nét và họa tiết sáp ong truyền thống.',
    primaryColor: '#DC2626',
    accentColor: '#27272A',
    suggestedAccessories: ['kieng_bac'],
    drawTemplate: (ctx, width, height) => {
      ctx.fillStyle = '#18181B';
      ctx.fillRect(0, 0, width, height);

      // Base charcoal
      ctx.fillStyle = '#27272A';
      ctx.fillRect(UV_COORDS.torso.x, UV_COORDS.torso.y, UV_COORDS.torso.w, UV_COORDS.torso.h);
      ctx.fillRect(UV_COORDS.skirtFront.x, UV_COORDS.skirtFront.y, UV_COORDS.skirtFront.w, UV_COORDS.skirtFront.h);
      ctx.fillRect(UV_COORDS.skirtBack.x, UV_COORDS.skirtBack.y, UV_COORDS.skirtBack.w, UV_COORDS.skirtBack.h);
      ctx.fillRect(UV_COORDS.legL.x, UV_COORDS.legL.y, UV_COORDS.legL.w, UV_COORDS.legL.h);
      ctx.fillRect(UV_COORDS.legR.x, UV_COORDS.legR.y, UV_COORDS.legR.w, UV_COORDS.legR.h);

      // Cổ áo chữ V đỏ centered at 432
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(382, 90);
      ctx.lineTo(432, 190);
      ctx.lineTo(482, 90);
      ctx.stroke();

      drawMotifStamp(ctx, 'hmong_spiral', 432, 280, 50, '#DC2626');

      // Sleeves sọc đỏ - xám - trắng
      const colors = ['#DC2626', '#27272A', '#FAFAFA'];
      for (let y = 90; y < 410; y += 35) {
        ctx.fillStyle = colors[Math.floor(y / 35) % colors.length];
        ctx.fillRect(UV_COORDS.armL.x, y, UV_COORDS.armL.w, 30);
        ctx.fillRect(UV_COORDS.armR.x, y, UV_COORDS.armR.w, 30);
      }

      // Váy xòe thổ cẩm viền đỏ
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(UV_COORDS.skirtFront.x, 720, UV_COORDS.skirtFront.w, 50);
      ctx.fillRect(UV_COORDS.skirtBack.x, 720, UV_COORDS.skirtBack.w, 50);
    },
  },
  {
    id: 'ede_tay_nguyen',
    name: 'Áo Dài Thổ Cẩm Lễ Hội Dân Tộc Ê-đê',
    ethnicity: 'Ê-đê (Thổ Cẩm Lễ Hội Tây Nguyên)',
    era: 'Không gian văn hóa cồng chiêng',
    region: 'Đắk Lắk, Gia Lai',
    description: 'Áo chui đầu xẻ ngang vai, dải thổ cẩm đỏ chạy dọc ngực tượng trưng cho thần mặt trời.',
    primaryColor: '#DC2626',
    accentColor: '#18181B',
    suggestedAccessories: ['kieng_bac'],
    drawTemplate: (ctx, width, height) => {
      ctx.fillStyle = '#18181B';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#18181B';
      ctx.fillRect(UV_COORDS.torso.x, UV_COORDS.torso.y, UV_COORDS.torso.w, UV_COORDS.torso.h);

      // Cổ ngang vai đỏ centered at 432
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(372, 90, 120, 16);

      // Dải đỏ giữa ngực
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(414, 106, 36, 300);

      // Váy
      ctx.fillStyle = '#09090B';
      ctx.fillRect(UV_COORDS.skirtFront.x, UV_COORDS.skirtFront.y, UV_COORDS.skirtFront.w, UV_COORDS.skirtFront.h);
      ctx.fillRect(UV_COORDS.skirtBack.x, UV_COORDS.skirtBack.y, UV_COORDS.skirtBack.w, UV_COORDS.skirtBack.h);
      ctx.fillRect(UV_COORDS.legL.x, UV_COORDS.legL.y, UV_COORDS.legL.w, UV_COORDS.legL.h);
      ctx.fillRect(UV_COORDS.legR.x, UV_COORDS.legR.y, UV_COORDS.legR.w, UV_COORDS.legR.h);

      ctx.fillStyle = '#DC2626';
      ctx.fillRect(UV_COORDS.skirtFront.x, 720, UV_COORDS.skirtFront.w, 40);
      ctx.fillRect(UV_COORDS.skirtBack.x, 720, UV_COORDS.skirtBack.w, 40);

      // Sleeves
      ctx.fillStyle = '#18181B';
      ctx.fillRect(UV_COORDS.armL.x, UV_COORDS.armL.y, UV_COORDS.armL.w, UV_COORDS.armL.h);
      ctx.fillRect(UV_COORDS.armR.x, UV_COORDS.armR.y, UV_COORDS.armR.w, UV_COORDS.armR.h);
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(UV_COORDS.armL.x, UV_COORDS.armL.cuffY, UV_COORDS.armL.w, 24);
      ctx.fillRect(UV_COORDS.armR.x, UV_COORDS.armR.cuffY, UV_COORDS.armR.w, 24);
    },
  },
  {
    id: 'cham_kate',
    name: 'Y Phục Lễ Hội Katê Cổ Truyền Dân Tộc Chăm',
    ethnicity: 'Chăm (Y Phục Cổ Truyền Katê)',
    era: 'Văn hóa Katê truyền thống',
    region: 'Ninh Thuận, Bình Thuận',
    description: 'Áo dài trắng chui đầu, thắt lưng đỏ chéo ngực đặc trưng của lễ hội Katê.',
    primaryColor: '#FAFAFA',
    accentColor: '#DC2626',
    suggestedAccessories: ['quat_cung_dinh'],
    drawTemplate: (ctx, width, height) => {
      ctx.fillStyle = '#18181D';
      ctx.fillRect(0, 0, width, height);

      // Pure white fabric
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(UV_COORDS.torso.x, UV_COORDS.torso.y, UV_COORDS.torso.w, UV_COORDS.torso.h);
      ctx.fillRect(UV_COORDS.skirtFront.x, UV_COORDS.skirtFront.y, UV_COORDS.skirtFront.w, UV_COORDS.skirtFront.h);
      ctx.fillRect(UV_COORDS.skirtBack.x, UV_COORDS.skirtBack.y, UV_COORDS.skirtBack.w, UV_COORDS.skirtBack.h);
      ctx.fillRect(UV_COORDS.legL.x, UV_COORDS.legL.y, UV_COORDS.legL.w, UV_COORDS.legL.h);
      ctx.fillRect(UV_COORDS.legR.x, UV_COORDS.legR.y, UV_COORDS.legR.w, UV_COORDS.legR.h);
      ctx.fillRect(UV_COORDS.armL.x, UV_COORDS.armL.y, UV_COORDS.armL.w, UV_COORDS.armL.h);
      ctx.fillRect(UV_COORDS.armR.x, UV_COORDS.armR.y, UV_COORDS.armR.w, UV_COORDS.armR.h);

      // Cổ tròn đỏ centered at 432
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(432, 100, 24, 0, Math.PI);
      ctx.fill();

      // Dải Kaban chéo ngực đỏ
      ctx.strokeStyle = '#DC2626';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(382, 90);
      ctx.lineTo(482, 380);
      ctx.stroke();

      // Thắt lưng eo đỏ
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(UV_COORDS.torso.x, 385, UV_COORDS.torso.w, 40);

      // Cổ tay áo
      ctx.fillRect(UV_COORDS.armL.x, UV_COORDS.armL.cuffY, UV_COORDS.armL.w, 24);
      ctx.fillRect(UV_COORDS.armR.x, UV_COORDS.armR.cuffY, UV_COORDS.armR.w, 24);

      // Gấu váy viền đỏ
      ctx.fillRect(UV_COORDS.skirtFront.x, 950, UV_COORDS.skirtFront.w, 30);
      ctx.fillRect(UV_COORDS.skirtBack.x, 950, UV_COORDS.skirtBack.w, 30);
    },
  },
  {
    id: 'custom_blank_template',
    name: 'Bản Vẽ Trống (Custom UV Canvas)',
    ethnicity: 'Tùy Chỉnh (Custom)',
    era: 'Sáng tạo tự do',
    region: 'Toàn quốc',
    description: 'Bản vẽ trống xám tối để tự do sáng tạo hoa văn trên nhân hình Sắc Việt.',
    primaryColor: '#27272A',
    accentColor: '#DC2626',
    suggestedAccessories: ['non_la', 'kieng_bac'],
    drawTemplate: (ctx, width, height) => {
      ctx.fillStyle = '#18181B';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#27272A';
      ctx.fillRect(UV_COORDS.torso.x, UV_COORDS.torso.y, UV_COORDS.torso.w, UV_COORDS.torso.h);
      ctx.fillRect(UV_COORDS.skirtFront.x, UV_COORDS.skirtFront.y, UV_COORDS.skirtFront.w, UV_COORDS.skirtFront.h);
      ctx.fillRect(UV_COORDS.skirtBack.x, UV_COORDS.skirtBack.y, UV_COORDS.skirtBack.w, UV_COORDS.skirtBack.h);

      ctx.fillStyle = '#222226';
      ctx.fillRect(UV_COORDS.armL.x, UV_COORDS.armL.y, UV_COORDS.armL.w, UV_COORDS.armL.h);
      ctx.fillRect(UV_COORDS.armR.x, UV_COORDS.armR.y, UV_COORDS.armR.w, UV_COORDS.armR.h);
      ctx.fillRect(UV_COORDS.legL.x, UV_COORDS.legL.y, UV_COORDS.legL.w, UV_COORDS.legL.h);
      ctx.fillRect(UV_COORDS.legR.x, UV_COORDS.legR.y, UV_COORDS.legR.w, UV_COORDS.legR.h);
    },
  },
];

export const ERA_DEFAULT_OUTFIT: Record<string, string> = {
  hung_vuong: 'ede_tay_nguyen',
  ly_tran: 'tay_tho_cam_cham',
  le_so: 'thai_ao_com',
  nguyen: 'kinh_ao_dai_ngu_than',
  hien_dai: 'kinh_nhat_binh_hue',
};
