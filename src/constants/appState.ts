/**
 * Vietnamese Traditional Costume Studio - App State Model
 * Định nghĩa cấu trúc dữ liệu trung tâm chuẩn theo đặc tả kiến trúc.
 */

export interface ToastItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration?: number;
}

export interface LayerTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

export interface LayerItem {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
  type: 'base' | 'drawing' | 'motif' | 'texture' | 'image';
  dataUrl?: string;
  locked?: boolean;
  transform?: LayerTransform;
}

export interface HistoricalEra {
  id: string;
  name: string;
  period: string;
  highlight: string;
  costumeCount: number;
}

export const HISTORICAL_ERAS: HistoricalEra[] = [
  { id: 'hung_vuong', name: 'Đông Sơn - Hùng Vương', period: 'TK VII TCN - TK II TCN', highlight: 'Hoa văn chim Lạc, váy xòe lông vũ, trâm đồng', costumeCount: 3 },
  { id: 'ly_tran', name: 'Thời Lý - Trần', period: 'TK XI - TK XIV', highlight: 'Áo tràng vạt, hoa sen Đại Việt, y phục quý tộc', costumeCount: 4 },
  { id: 'le_so', name: 'Thời Lê Sơ - Hậu Lê', period: 'TK XV - TK XVIII', highlight: 'Áo giao lĩnh, viền cổ thêu rồng mây, cân đai', costumeCount: 4 },
  { id: 'nguyen', name: 'Thời Triều Nguyễn', period: 'TK XIX - TK XX', highlight: 'Áo Nhật Bình cung đình, Áo Dài Ngũ Thân đoan trang', costumeCount: 6 },
  { id: 'hien_dai', name: 'Áo Dài Đương Đại', period: 'TK XX - Hiện nay', highlight: 'Áo Dài Lemur, Áo Dài tà bay hiện đại di sản', costumeCount: 4 },
];

export interface AppStateModel {
  app: {
    version: string;
    canvasSize: { width: number; height: number };
    locale: string;
  };
  ui: {
    activeLeftSection: 'overview' | 'hierarchy' | 'avatar' | 'wardrobe' | 'background';
    activeRightMode: 'template' | 'draw' | 'layers' | 'library';
    selectedTreeId: string | null;
    modal: string | null;
    toasts: ToastItem[];
    debugOpen: boolean;
  };
  avatar: {
    gender: 'female';
    source: 'default' | 'glb' | 'vrm' | 'json' | 'code';
    modelUrl: string | null;
    recipe: any | null;
    params: {
      face: {
        textureUrl?: string;
        lipColor?: string;
      };
      hair: {
        style?: string;
        color?: string;
      };
      skin: {
        color: string;
        roughness?: number;
      };
      body: {
        scale: number;
        showTunicFlap: boolean;
        pose: 'idle' | 'court_greeting' | 'xoe_dance' | 'proud_stand';
        lighting: 'museum' | 'daylight' | 'hoi_an_lantern' | 'sunset';
      };
    };
  };
  wardrobe: {
    equipped: {
      outfitId: string | null;
      garmentIds: string[];
      accessories: Record<string, boolean>;
    };
    customParams: {
      lengthRatio?: number;
      collarType?: string;
      sleeveWidth?: number;
    };
  };
  editor: {
    targetAsset: string | null; // e.g. "garment:ao-dai", "background", "accessory"
    layers: LayerItem[];
    activeLayerId: string | null;
    brushColor: string;
    brushSize: number;
    brushOpacity: number;
    tool: 'brush' | 'eraser' | 'fill' | 'stamp';
    activeStampId: string | null;
    undoStack: any[];
    redoStack: any[];
  };
  timeline: {
    selectedEraId: string | null;
    selectedCostumeId: string | null;
    previewState: Record<string, any>;
    cache: Record<string, any>;
  };
  background: {
    type: 'none' | 'color' | 'image';
    color: string;
    imageUrl: string | null;
    transform: { x: number; y: number; scale: number; rotation: number };
    fitMode: 'cover' | 'contain' | 'stretch' | 'manual';
    opacity: number;
  };
  chat: {
    open: boolean;
    apiKey: string;
    model: string;
    messages: Array<{ id: string; role: 'user' | 'model'; text: string; timestamp: number }>;
  };
  cache: {
    metadata: {
      lastSaved: number | null;
      autoSaveCount: number;
    };
  };
}

export const INITIAL_APP_STATE: AppStateModel = {
  app: {
    version: '0.1.0',
    canvasSize: { width: 1920, height: 1080 },
    locale: 'vi-VN',
  },
  ui: {
    activeLeftSection: 'overview',
    activeRightMode: 'template',
    selectedTreeId: 'node_costume_ao_dai',
    modal: null,
    toasts: [],
    debugOpen: false,
  },
  avatar: {
    gender: 'female',
    source: 'default',
    modelUrl: null,
    recipe: null,
    params: {
      face: {
        textureUrl: '',
        lipColor: '#DC2626',
      },
      hair: {
        style: 'traditional_bun',
        color: '#18181B',
      },
      skin: {
        color: '#F5CBAB',
        roughness: 0.6,
      },
      body: {
        scale: 1.0,
        showTunicFlap: true,
        pose: 'idle',
        lighting: 'museum',
      },
    },
  },
  wardrobe: {
    equipped: {
      outfitId: 'kinh_ao_dai_ngu_than',
      garmentIds: ['kinh_ao_dai_ngu_than'],
      accessories: {
        non_la: false,
        man_doi_dau: false,
        kieng_bac: false,
        khan_pieu: false,
        khan_dong: false,
        quat_cung_dinh: false,
      },
    },
    customParams: {
      lengthRatio: 1.0,
      collarType: 'standing',
      sleeveWidth: 1.0,
    },
  },
  editor: {
    targetAsset: 'garment:ao-dai',
    layers: [
      {
        id: 'layer_base',
        name: 'Lớp Nền Áo (Base)',
        visible: true,
        opacity: 1,
        blendMode: 'normal',
        type: 'base',
        locked: false,
      },
      {
        id: 'layer_draw',
        name: 'Nét Vẽ Hoa Văn (Draw)',
        visible: true,
        opacity: 1,
        blendMode: 'normal',
        type: 'drawing',
        locked: false,
      },
    ],
    activeLayerId: 'layer_draw',
    brushColor: '#DC2626',
    brushSize: 6,
    brushOpacity: 1,
    tool: 'brush',
    activeStampId: 'lotus',
    undoStack: [],
    redoStack: [],
  },
  timeline: {
    selectedEraId: 'nguyen',
    selectedCostumeId: 'kinh_ao_dai_ngu_than',
    previewState: {},
    cache: {},
  },
  background: {
    type: 'color',
    color: '#0e0e12',
    imageUrl: null,
    transform: { x: 0, y: 0, scale: 1, rotation: 0 },
    fitMode: 'cover',
    opacity: 1,
  },
  chat: {
    open: false,
    apiKey: '',
    model: 'gemini-3.8-flash',
    messages: [
      {
        id: 'msg_init',
        role: 'model',
        text: 'Xin chào! Tôi là Trợ lý Di sản Sắc Việt. Bạn có thể hỏi về ý nghĩa hoa văn, cách phối màu áo ngũ thân, hoặc đặc trưng y phục các triều đại.',
        timestamp: Date.now(),
      },
    ],
  },
  cache: {
    metadata: {
      lastSaved: null,
      autoSaveCount: 0,
    },
  },
};
