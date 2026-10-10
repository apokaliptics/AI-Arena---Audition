/**
 * Vietnamese Traditional Costume Studio - Layout Constants
 * Quy chuẩn kích thước chuẩn 1920x1080 cho môi trường laptop/màn hình cố định.
 */

export const LAYOUT = {
  CANVAS_WIDTH: 1920,
  CANVAS_HEIGHT: 1080,
  TOP_BAR_HEIGHT: 96,     // 84px - 112px
  LEFT_PANEL_WIDTH: 330,   // 300px - 360px
  RIGHT_PANEL_WIDTH: 410,  // 380px - 440px
  BORDER_RADIUS: 14,
  GAP: 8,
  PADDING: 8,
} as const;

export type LeftPanelSection =
  | 'overview'    // Điều chỉnh tổng thể
  | 'hierarchy'   // Cây chức năng
  | 'avatar'      // Nhân vật & Tỷ lệ
  | 'wardrobe'    // Trang phục & Phụ kiện
  | 'background'; // Ảnh nền & Phối cảnh

export type RightEditorMode =
  | 'template' // Bản mẫu trang phục UV
  | 'draw'     // Vẽ tay, nét cọ, màu sắc
  | 'layers'   // Quản lý lớp layer
  | 'library'; // Thư viện hoa văn & Upload

export interface TreeNodeItem {
  id: string;
  label: string;
  iconName: string;
  badge?: string;
  children?: TreeNodeItem[];
}

export const INITIAL_FEATURE_TREE: TreeNodeItem[] = [
  {
    id: 'node_avatar',
    label: 'Nhân vật 3D (Nữ)',
    iconName: 'User',
    badge: 'Mặc định',
    children: [
      { id: 'node_avatar_body', label: 'Hình thể & Tỷ lệ', iconName: 'Activity' },
      { id: 'node_avatar_skin', label: 'Màu da & Ánh sáng', iconName: 'Sun' },
      { id: 'node_avatar_pose', label: 'Tư thế (Dáng điệu)', iconName: 'Move' },
    ],
  },
  {
    id: 'node_costume',
    label: 'Y phục Di sản',
    iconName: 'Shirt',
    badge: 'Đang mặc',
    children: [
      { id: 'node_costume_ao_dai', label: 'Áo ngũ thân / Áo dài', iconName: 'Layers' },
      { id: 'node_costume_quan', label: 'Quần lụa truyền thống', iconName: 'Scissors' },
      { id: 'node_costume_ta_ao', label: 'Tà áo trước & sau', iconName: 'Maximize2' },
    ],
  },
  {
    id: 'node_accessories',
    label: 'Phụ kiện Cổ truyền',
    iconName: 'Sparkles',
    children: [
      { id: 'node_acc_non_la', label: 'Nón Lá truyền thống', iconName: 'Crown' },
      { id: 'node_acc_man', label: 'Mấn Đội Đầu', iconName: 'Disc' },
      { id: 'node_acc_kieng', label: 'Kiềng Bạc cổ truyền', iconName: 'Circle' },
      { id: 'node_acc_khan_dong', label: 'Khăn Đóng / Khăn Xếp', iconName: 'Square' },
      { id: 'node_acc_quat', label: 'Quạt Cung Đình', iconName: 'Feather' },
    ],
  },
  {
    id: 'node_background',
    label: 'Khung cảnh & Hậu cảnh',
    iconName: 'Image',
    children: [
      { id: 'node_bg_color', label: 'Màu sắc studio', iconName: 'Palette' },
      { id: 'node_bg_image', label: 'Ảnh bối cảnh di sản', iconName: 'Landscape' },
    ],
  },
];
