export type EthnicGroup =
  | 'Kinh (Áo Dài / Ngũ Thân)'
  | 'Kinh (Áo Nhật Bình Cung Đình)'
  | 'Đông Sơn - Văn Lang (Thời Hùng Vương)'
  | 'Thái (Áo Cóm Khuy Bướm)'
  | 'Tày (Thổ Cẩm Chàm & Bạc)'
  | 'H\'Mông (Thổ Cẩm Hoa Văn Lanh)'
  | 'Ê-đê (Thổ Cẩm Lễ Hội Tây Nguyên)'
  | 'Chăm (Y Phục Cổ Truyền Katê)'
  | 'Tùy Chỉnh (Custom)'
  | string;

export type AccessoryId = 'non_la' | 'man_doi_dau' | 'kieng_bac' | 'khan_pieu' | 'khan_dong' | 'quat_cung_dinh';

export interface AccessoryItem {
  id: AccessoryId;
  name: string;
  ethnicity: string;
  description: string;
  enabled: boolean;
  color?: string;
}

export type PoseType = 'idle' | 'court_greeting' | 'xoe_dance' | 'proud_stand';

export type LightingMode = 'museum' | 'daylight' | 'hoi_an_lantern' | 'sunset';

export interface CulturalMotifStamp {
  id: string;
  name: string;
  origin: string;
  pathType: 'lotus' | 'bronze_drum' | 'dragon_cloud' | 'thai_diamond' | 'hmong_spiral' | 'bird_lac' | 'royal_bat';
}

export interface PresetOutfit {
  id: string;
  name: string;
  ethnicity: EthnicGroup;
  era: string;
  region: string;
  description: string;
  primaryColor: string;
  accentColor: string;
  suggestedAccessories: AccessoryId[];
  hasTunicFlaps?: boolean;
  drawTemplate: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
}

export interface MotifAnalysisItem {
  region: string;
  element: string;
  meaning: string;
}

export interface GeminiAnalysisResult {
  identifiedEthnicity: string;
  styleCategory: string;
  harmonyScore: number;
  verdictTitle: string;
  harmonyComment: string;
  motifs: MotifAnalysisItem[];
  loreCard: {
    title: string;
    origin: string;
    culturalStory: string;
    craftsmanship: string;
  };
  recommendations: string[];
}
