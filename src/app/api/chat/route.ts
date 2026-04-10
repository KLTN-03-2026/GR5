import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // 1. BẮT BUỘC PHẢI IMPORT PRISMA

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ text: "Lỗi: Chưa có API Key!" });

    // 2. LẤY DỮ LIỆU THẬT TỪ DATABASE
    // Lấy tên và ID của các sản phẩm đang bán (Lấy tầm 20-50 cái để AI đọc cho nhanh)
    const products = await prisma.san_pham.findMany({
      select: {
        id: true,
        ten_san_pham: true,
        // Bạn có thể thêm mô tả hoặc tag nếu có để AI tư vấn thông minh hơn
      },
      take: 30, 
    });

    // Biến danh sách thành một chuỗi văn bản gọn gàng cho AI đọc
    const productCatalog = products.map(p => `[ID: ${p.id}] Tên: ${p.ten_san_pham}`).join("\n");

    const MODEL_NAME = "gemini-2.5-flash"; 
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    // 3. NHÉT DATA VÀO PROMPT (DẠY AI CÁCH TRẢ LỜI)
    const promptText = `
      Bạn là trợ lý Freshy, chuyên bán nông sản tươi sạch.
      Dưới đây là danh sách sản phẩm cửa hàng đang có:
      ${productCatalog}

      Nhiệm vụ:
      1. Trả lời khách hàng thân thiện, tự nhiên.
      2. Nếu khách muốn mua hàng, hãy tìm trong danh sách trên xem có sản phẩm nào phù hợp không để giới thiệu.
      3. BẮT BUỘC trả về ĐÚNG định dạng JSON sau:
      {
        "text": "Nội dung bạn nói với khách",
        "hasProduct": true hoặc false,
        "productIds": [Danh sách các ID sản phẩm bạn khuyên dùng (ví dụ: [1, 5]). Trống thì để []]
      }

      Câu hỏi của khách: "${message}"
    `;

    const payload = {
      contents: [{ 
        parts: [{ text: promptText }] 
      }],
      generationConfig: {
        responseMimeType: "application/json", // Ép AI trả ra chuẩn JSON
        temperature: 0.7
      }
    };

    // 4. GỌI API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.error) {
      console.error("GOOGLE ERROR:", data.error.message);
      return NextResponse.json({ 
        text: `Freshy đang bận xíu. Bạn đợi lát nhắn lại nhé!`, 
        hasProduct: false,
        productIds: []
      });
    }

    // 5. TRẢ KẾT QUẢ CHO FRONTEND
    const aiText = data.candidates[0].content.parts[0].text;
    const finalResult = JSON.parse(aiText);
    
    return NextResponse.json(finalResult);

  } catch (error: any) {
    console.error("SYSTEM ERROR:", error.message);
    return NextResponse.json({ 
      text: "Hệ thống gặp sự cố, thử lại sau nhé!",
      hasProduct: false,
      productIds: []
    });
  }
}