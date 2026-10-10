import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to get GoogleGenAI client
function getGenAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY chưa được cấu hình.');
  }
  return new GoogleGenAI({ apiKey });
}

// API endpoint: Cultural analysis of the texture UV layout and outfit
app.post('/api/analyze-culture', async (req, res) => {
  try {
    const { imageBase64, outfitType, accessories, notes } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Thiếu hình ảnh texture để phân tích.' });
    }

    const ai = getGenAI();

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|webp);base64,/, '');

    const prompt = `Bạn là một chuyên gia hàng đầu về Di sản Văn hóa & Trang phục 54 Dân tộc Việt Nam (Viện Nghiên cứu Văn hóa & Trang phục Truyền thống Việt Nam).
Hãy phân tích hình ảnh Bản vẽ UV Texture 2D / Trang phục nhân vật "Sắc Việt" được cung cấp.

Thông tin bối cảnh người dùng cung cấp:
- Mẫu trang phục dự kiến: ${outfitType || 'Tự do sáng tạo'}
- Phụ kiện đi kèm: ${Array.isArray(accessories) ? accessories.join(', ') : (accessories || 'Không có')}
- Ghi chú thiết kế: ${notes || 'Không có'}

Hãy phân tích chi tiết và trả về JSON chuẩn theo cấu trúc sau (KHÔNG dùng markdown bọc ngoài ngoài \`\`\`json ... \`\`\`):
{
  "identifiedEthnicity": "Tên dân tộc hoặc dòng trang phục nhận diện được (ví dụ: Kinh (Áo Dài Ngũ Thân), Thái Đen (Áo Cóm), H'Mông Hoa, Chăm, Tày, Dao Đỏ, v.v.)",
  "styleCategory": "Cổ truyền / Cách tân nhã nhặn / Di sản nguyên bản / Giao thoa hiện đại",
  "harmonyScore": 92, // Điểm số hài hòa văn hóa từ 70 đến 100
  "verdictTitle": "Tiêu đề ngắn gọn nhận định (ví dụ: Tinh hoa Thổ cẩm Tây Bắc / Nét duyên Cung đình Huế)",
  "harmonyComment": "Nhận xét tổng thể về sự phối hợp giữa cổ áo, tà áo, tay áo và các dải hoa văn thổ cẩm.",
  "motifs": [
    {
      "region": "Cổ & Ngực (Torso)",
      "element": "Chi tiết hoa văn nhận diện",
      "meaning": "Ý nghĩa biểu tượng văn hóa hoặc phong thủy"
    },
    {
      "region": "Ống tay (Arms)",
      "element": "Chi tiết hoa văn nhận diện",
      "meaning": "Ý nghĩa tạo hình"
    },
    {
      "region": "Tà áo & Chân váy (Skirt/Legs)",
      "element": "Chi tiết hoa văn nhận diện",
      "meaning": "Ý nghĩa nguồn cội hoặc phong tục"
    }
  ],
  "loreCard": {
    "title": "Tên thẻ Di sản (Lore Card)",
    "origin": "Khu vực / Dân tộc / Niên đại",
    "culturalStory": "Một câu chuyện truyền thuyết hoặc bối cảnh văn hóa lịch sử đặc sắc của bộ trang phục này (3-4 câu xúc động, tôn vinh bản sắc dân tộc).",
    "craftsmanship": "Đặc trưng kỹ thuật dệt nhuộm hoặc may đo truyền thống (như nhuộm chàm, thêu chỉ tơ tằm, đính cườm, bạc chạm khắc)."
  },
  "recommendations": [
    "Gợi ý 1 để hoàn thiện trang phục đúng chuẩn văn hóa hơn",
    "Gợi ý 2 về việc phối phụ kiện (kiềng bạc, nón lá, mấn, khăn piêu)"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'image/png',
                data: cleanBase64,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Fallback clean regex
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Không thể phân tích dữ liệu trả về từ Gemini.');
      }
    }

    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error analyzing culture:', error);
    return res.status(500).json({
      error: error.message || 'Lỗi khi kết nối với Gemini AI phân tích văn hóa.',
    });
  }
});

// API endpoint: Gợi ý hoa văn di sản & ý tưởng sáng tạo từ Gemini
app.post('/api/ai-motif-idea', async (req, res) => {
  try {
    const { ethnicity, theme } = req.body;
    const ai = getGenAI();

    const prompt = `Gợi ý bảng màu di sản và hoa văn đặc trưng cho trang phục dân tộc: "${ethnicity || 'Kinh - Áo Dài'}" theo chủ đề "${theme || 'Lễ hội truyền thống'}".
Trả về JSON cấu trúc:
{
  "ethnicity": "${ethnicity || 'Kinh'}",
  "theme": "${theme || 'Lễ hội'}",
  "colorPalette": [
    { "name": "Tên màu truyền thống (vd: Đỏ Son, Chàm Thẫm, Vàng Hoàng Thổ)", "hex": "#HEX" }
  ],
  "motifs": [
    { "name": "Tên hoa văn (vd: Vân mây thời Lê, Quả trám thổ cẩm Thái)", "description": "Mô tả nét vẽ & vị trí máp trên template UV (Thân trước, Ống tay, Tà áo)", "symbolism": "Ý nghĩa may mắn / tín ngưỡng" }
  ],
  "designTip": "Lời khuyên khi vẽ lên UV template 2D để nhân vật 3D trông sống động nhất"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error motif idea:', error);
    return res.status(500).json({ error: error.message || 'Lỗi AI gợi ý hoa văn' });
  }
});

// Vite middleware in dev or static serve in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SẮC VIỆT Server running at http://localhost:${PORT}`);
  });
}

startServer();
