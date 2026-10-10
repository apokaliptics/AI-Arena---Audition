/**
 * UV Canvas Renderer & Cultural Guideline Utilities
 * Detailed Unfolded Humanoid Template (All 6 faces distinct for Torso, Arms, Legs & Flaps)
 */

export interface UVFace {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface UVZone {
  id: string;
  name: string;
  subText: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  faces?: UVFace[];
}

export const UV_ZONES: UVZone[] = [
  {
    id: 'torso',
    name: 'THÂN ÁO (Torso - 6 Mặt Căn Chuẩn)',
    subText: 'Trước, Sau, Sườn Phải, Sườn Trái, Cổ Vai, Gấu Áo',
    x: 272,
    y: 20,
    w: 480,
    h: 460,
    color: '#DC2626',
    faces: [
      { id: 'torso_top', name: 'CỔ & VAI', x: 352, y: 20, w: 160, h: 70 },
      { id: 'torso_right', name: 'SƯỜN PHẢI', x: 272, y: 90, w: 80, h: 320 },
      { id: 'torso_front', name: 'THÂN TRƯỚC', x: 352, y: 90, w: 160, h: 320 },
      { id: 'torso_left', name: 'SƯỜN TRÁI', x: 512, y: 90, w: 80, h: 320 },
      { id: 'torso_back', name: 'THÂN SAU', x: 592, y: 90, w: 160, h: 320 },
      { id: 'torso_bottom', name: 'GẤU ÁO', x: 352, y: 410, w: 160, h: 70 },
    ],
  },
  {
    id: 'arm_left',
    name: 'TAY ÁO TRÁI (Left Arm - 6 Mặt)',
    subText: 'Ngoài, Trước, Trong, Sau, Đầu Vai, Cổ Tay',
    x: 24,
    y: 20,
    w: 180,
    h: 460,
    color: '#71717A',
    faces: [
      { id: 'arm_l_top', name: 'ĐẦU VAI', x: 69, y: 20, w: 45, h: 70 },
      { id: 'arm_l_outer', name: 'NGOÀI', x: 24, y: 90, w: 45, h: 320 },
      { id: 'arm_l_front', name: 'TRƯỚC', x: 69, y: 90, w: 45, h: 320 },
      { id: 'arm_l_inner', name: 'TRONG', x: 114, y: 90, w: 45, h: 320 },
      { id: 'arm_l_back', name: 'SAU', x: 159, y: 90, w: 45, h: 320 },
      { id: 'arm_l_bottom', name: 'CỔ TAY', x: 69, y: 410, w: 45, h: 70 },
    ],
  },
  {
    id: 'arm_right',
    name: 'TAY ÁO PHẢI (Right Arm - 6 Mặt)',
    subText: 'Sau, Trong, Trước, Ngoài, Đầu Vai, Cổ Tay',
    x: 820,
    y: 20,
    w: 180,
    h: 460,
    color: '#71717A',
    faces: [
      { id: 'arm_r_top', name: 'ĐẦU VAI', x: 910, y: 20, w: 45, h: 70 },
      { id: 'arm_r_back', name: 'SAU', x: 820, y: 90, w: 45, h: 320 },
      { id: 'arm_r_inner', name: 'TRONG', x: 865, y: 90, w: 45, h: 320 },
      { id: 'arm_r_front', name: 'TRƯỚC', x: 910, y: 90, w: 45, h: 320 },
      { id: 'arm_r_outer', name: 'NGOÀI', x: 955, y: 90, w: 45, h: 320 },
      { id: 'arm_r_bottom', name: 'CỔ TAY', x: 910, y: 410, w: 45, h: 70 },
    ],
  },
  {
    id: 'skirt_front',
    name: 'TÀ ÁO DÀI TRƯỚC (Front Flap)',
    subText: 'Tà Trước Buông Dài Căn Thẳng Thân Trước',
    x: 272,
    y: 520,
    w: 230,
    h: 480,
    color: '#DC2626',
    faces: [
      { id: 'skirt_f_main', name: 'MẶT TRƯỚC TÀ', x: 272, y: 520, w: 230, h: 430 },
      { id: 'skirt_f_hem', name: 'GẤU TÀ TRƯỚC', x: 272, y: 950, w: 230, h: 50 },
    ],
  },
  {
    id: 'skirt_back',
    name: 'TÀ ÁO DÀI SAU (Back Flap)',
    subText: 'Tà Sau Buông Dài Căn Thẳng Thân Sau',
    x: 522,
    y: 520,
    w: 230,
    h: 480,
    color: '#DC2626',
    faces: [
      { id: 'skirt_b_main', name: 'MẶT SAU TÀ', x: 522, y: 520, w: 230, h: 430 },
      { id: 'skirt_b_hem', name: 'GẤU TÀ SAU', x: 522, y: 950, w: 230, h: 50 },
    ],
  },
  {
    id: 'leg_left',
    name: 'QUẦN TRÁI (Left Leg - 6 Mặt)',
    subText: 'Ngoài, Trước, Trong, Sau, Đáy, Gấu Quần',
    x: 24,
    y: 520,
    w: 180,
    h: 480,
    color: '#52525B',
    faces: [
      { id: 'leg_l_top', name: 'ĐÁY QUẦN', x: 69, y: 520, w: 45, h: 55 },
      { id: 'leg_l_outer', name: 'NGOÀI', x: 24, y: 575, w: 45, h: 370 },
      { id: 'leg_l_front', name: 'TRƯỚC', x: 69, y: 575, w: 45, h: 370 },
      { id: 'leg_l_inner', name: 'TRONG', x: 114, y: 575, w: 45, h: 370 },
      { id: 'leg_l_back', name: 'SAU', x: 159, y: 575, w: 45, h: 370 },
      { id: 'leg_l_bottom', name: 'GẤU QUẦN', x: 69, y: 945, w: 45, h: 55 },
    ],
  },
  {
    id: 'leg_right',
    name: 'QUẦN PHẢI (Right Leg - 6 Mặt)',
    subText: 'Sau, Trong, Trước, Ngoài, Đáy, Gấu Quần',
    x: 820,
    y: 520,
    w: 180,
    h: 480,
    color: '#52525B',
    faces: [
      { id: 'leg_r_top', name: 'ĐÁY QUẦN', x: 910, y: 520, w: 45, h: 55 },
      { id: 'leg_r_back', name: 'SAU', x: 820, y: 575, w: 45, h: 370 },
      { id: 'leg_r_inner', name: 'TRONG', x: 865, y: 575, w: 45, h: 370 },
      { id: 'leg_r_front', name: 'TRƯỚC', x: 910, y: 575, w: 45, h: 370 },
      { id: 'leg_r_outer', name: 'NGOÀI', x: 955, y: 575, w: 45, h: 370 },
      { id: 'leg_r_bottom', name: 'GẤU QUẦN', x: 910, y: 945, w: 45, h: 55 },
    ],
  },
];

/**
 * Draws minimalist guidelines with subtle face wireframes
 */
export function drawCulturalGuidelines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  showGuides: boolean = true
) {
  if (!showGuides) return;

  ctx.save();

  // Subtle grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  const step = 64;
  for (let x = 0; x <= width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y <= height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Draw each UV zone guide box and all distinct faces
  UV_ZONES.forEach((zone) => {
    ctx.save();
    ctx.strokeStyle = zone.color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);

    // Outer cluster boundary
    ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);

    // If zone has individual unwrapped faces, draw clean face boundaries and subtle text tags
    if (zone.faces && zone.faces.length > 0) {
      zone.faces.forEach((face) => {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(face.x, face.y, face.w, face.h);

        // Faint face tag
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.font = 'bold 9px "Nunito", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(face.name, face.x + face.w / 2, face.y + 14);
      });
    }

    // Corner marks (solid)
    ctx.setLineDash([]);
    const cornerSize = 8;
    ctx.lineWidth = 2;
    ctx.strokeStyle = zone.color;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(zone.x, zone.y + cornerSize);
    ctx.lineTo(zone.x, zone.y);
    ctx.lineTo(zone.x + cornerSize, zone.y);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(zone.x + zone.w - cornerSize, zone.y);
    ctx.lineTo(zone.x + zone.w, zone.y);
    ctx.lineTo(zone.x + zone.w, zone.y + cornerSize);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(zone.x, zone.y + zone.h - cornerSize);
    ctx.lineTo(zone.x, zone.y + zone.h);
    ctx.lineTo(zone.x + cornerSize, zone.y + zone.h);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(zone.x + zone.w - cornerSize, zone.y + zone.h);
    ctx.lineTo(zone.x + zone.w, zone.y + zone.h);
    ctx.lineTo(zone.x + zone.w, zone.y + zone.h - cornerSize);
    ctx.stroke();

    ctx.restore();
  });

  ctx.restore();
}

/**
 * Draws cultural motif stamp
 */
export function drawMotifStamp(
  ctx: CanvasRenderingContext2D,
  motifType: string,
  cx: number,
  cy: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, size / 16);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const r = size / 2;

  switch (motifType) {
    case 'bronze_drum': {
      // Đông Sơn Bronze Drum Sun
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.28, 0, Math.PI * 2);
      ctx.fill();

      const rays = 12;
      for (let i = 0; i < rays; i++) {
        const angle = (i * Math.PI * 2) / rays;
        const x1 = Math.cos(angle) * (r * 0.32);
        const y1 = Math.sin(angle) * (r * 0.32);
        const x2 = Math.cos(angle) * (r * 0.85);
        const y2 = Math.sin(angle) * (r * 0.85);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'lotus': {
      // Đại Việt Lotus Petals
      const petals = 8;
      for (let i = 0; i < petals; i++) {
        const angle = (i * Math.PI * 2) / petals;
        ctx.save();
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(r * 0.35, -r * 0.5, 0, -r * 0.85);
        ctx.quadraticCurveTo(-r * 0.35, -r * 0.5, 0, 0);
        ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'bird_lac': {
      // Chim Lạc flight curve
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, r * 0.3);
      ctx.quadraticCurveTo(-r * 0.2, -r * 0.7, r * 0.7, -r * 0.6);
      ctx.quadraticCurveTo(r * 0.2, 0, r * 0.5, r * 0.6);
      ctx.quadraticCurveTo(0, r * 0.2, -r * 0.7, r * 0.3);
      ctx.stroke();
      break;
    }

    case 'thai_diamond': {
      // Thái Diamond geometric weave
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.8);
      ctx.lineTo(r * 0.8, 0);
      ctx.lineTo(0, r * 0.8);
      ctx.lineTo(-r * 0.8, 0);
      ctx.closePath();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, -r * 0.4);
      ctx.lineTo(r * 0.4, 0);
      ctx.lineTo(0, r * 0.4);
      ctx.lineTo(-r * 0.4, 0);
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'hmong_spiral': {
      // H'Mông Spiral Batik
      ctx.beginPath();
      for (let i = 0; i < 40; i++) {
        const angle = 0.25 * i;
        const dist = (r * 0.8 * i) / 40;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      break;
    }

    case 'dragon_cloud':
    default: {
      ctx.beginPath();
      ctx.arc(-r * 0.3, 0, r * 0.35, Math.PI * 0.8, Math.PI * 1.9);
      ctx.arc(r * 0.1, -r * 0.2, r * 0.4, Math.PI * 1.1, Math.PI * 2.1);
      ctx.arc(r * 0.45, r * 0.1, r * 0.3, Math.PI * 1.5, Math.PI * 2.6);
      ctx.quadraticCurveTo(0, r * 0.6, -r * 0.7, r * 0.4);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
}

/**
 * Removes lingering guide words / header badges from an uploaded texture
 */
export function cleanGuideWordsFromCanvas(ctx: CanvasRenderingContext2D, width: number = 1024, height: number = 1024) {
  UV_ZONES.forEach((zone) => {
    const sampleY = Math.min(height - 1, zone.y + 46);
    const sampleX = Math.min(width - 1, zone.x + Math.floor(zone.w / 2));
    const sample = ctx.getImageData(sampleX, sampleY, 1, 1).data;
    const fabricFill = `rgb(${sample[0]}, ${sample[1]}, ${sample[2]})`;

    ctx.save();
    ctx.fillStyle = fabricFill;
    ctx.fillRect(zone.x, zone.y, zone.w, 42);
    ctx.restore();
  });
}
