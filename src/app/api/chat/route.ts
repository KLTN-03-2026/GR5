import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ text: "Lỗi: Chưa có API Key!" });

    // 1. DÙNG CHÍNH XÁC TÊN TRONG DANH SÁCH BẠN VỪA GỬI
    const MODEL_NAME = "gemini-2.5-flash"; 
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    // 2. CẤU HÌNH DỮ LIỆU GỬI ĐI
    const payload = {
      contents: [{ 
        parts: [{ 
          text: `Bạn là trợ lý Freshy. Hãy tư vấn khách hàng và trả về JSON: 
          {"text": "nội dung trả lời", "hasProduct": false}. 
          Câu hỏi: ${message}` 
        }] 
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7
      }
    };

    // 3. GỌI API BẰNG FETCH
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Kiểm tra lỗi từ phía Google (như lỗi Quota 429)
    if (data.error) {
      console.error("GOOGLE ERROR:", data.error.message);
      return NextResponse.json({ 
        text: `Freshy đang bận (Lỗi: ${data.error.message}). Bạn đợi xíu rồi nhắn lại nhé!`, 
        hasProduct: false 
      });
    }

    // 4. TRẢ KẾT QUẢ
    const aiText = data.candidates[0].content.parts[0].text;
    return NextResponse.json(JSON.parse(aiText));

  } catch (error: any) {
    console.error("SYSTEM ERROR:", error.message);
    return NextResponse.json({ text: "Hệ thống gặp sự cố, thử lại sau nhé!" });
  }
}

// Giữ hàm GET để phòng hờ kiểm tra lại
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  return NextResponse.json(data);
}