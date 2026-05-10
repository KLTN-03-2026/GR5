import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

const GHN_BASE = process.env.GHN_BASE_URL || "https://dev-online-gateway.ghn.vn/shiip/public-api";
const GHN_TOKEN = process.env.GHN_TOKEN!;
const GHN_SHOP_ID = process.env.GHN_SHOP_ID!;
const FROM_DISTRICT_ID = Number(process.env.GHN_FROM_DISTRICT_ID || 1527);

// Rate limit tracker (in-memory, resets on server restart)
let geminiCallTimestamps: number[] = [];
const GEMINI_RATE_LIMIT = 18; // slightly under 20 to be safe
const GEMINI_RATE_WINDOW = 60_000; // 1 minute

function isRateLimited(): boolean {
  const now = Date.now();
  geminiCallTimestamps = geminiCallTimestamps.filter(t => now - t < GEMINI_RATE_WINDOW);
  return geminiCallTimestamps.length >= GEMINI_RATE_LIMIT;
}

function recordGeminiCall() {
  geminiCallTimestamps.push(Date.now());
}

async function resolveGhnWard(tinh: string, quan: string, phuong: string) {
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()
    .replace(/thành phố |tỉnh |quận |huyện |phường |xã |thị trấn |thị xã /g, '');

  const provRes = await fetch(`${GHN_BASE}/master-data/province`, {
    method: "POST", headers: { Token: GHN_TOKEN, "Content-Type": "application/json" },
  }).then(r => r.json());
  const prov = provRes.data?.find((p: any) => normalize(p.ProvinceName) === normalize(tinh) || p.ProvinceName === tinh);
  if (!prov) return null;

  const distRes = await fetch(`${GHN_BASE}/master-data/district`, {
    method: "POST", headers: { Token: GHN_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ province_id: prov.ProvinceID }),
  }).then(r => r.json());
  const dist = distRes.data?.find((d: any) => normalize(d.DistrictName) === normalize(quan) || d.DistrictName === quan);
  if (!dist) return null;

  const wardRes = await fetch(`${GHN_BASE}/master-data/ward`, {
    method: "POST", headers: { Token: GHN_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ district_id: dist.DistrictID }),
  }).then(r => r.json());
  const ward = wardRes.data?.find((w: any) => normalize(w.WardName) === normalize(phuong) || w.WardName === phuong);
  if (!ward) return null;

  return { districtId: dist.DistrictID, wardCode: ward.WardCode };
}

async function resolveGhnDistrict(tinh: string, quan: string): Promise<number | null> {
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()
    .replace(/thành phố |tỉnh |quận |huyện |thị xã /g, '');

  const provRes = await fetch(`${GHN_BASE}/master-data/province`, {
    method: "POST", headers: { Token: GHN_TOKEN, "Content-Type": "application/json" },
  }).then(r => r.json());
  const prov = provRes.data?.find((p: any) => normalize(p.ProvinceName) === normalize(tinh) || p.ProvinceName === tinh);
  if (!prov) return null;

  const distRes = await fetch(`${GHN_BASE}/master-data/district`, {
    method: "POST", headers: { Token: GHN_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ province_id: prov.ProvinceID }),
  }).then(r => r.json());
  const dist = distRes.data?.find((d: any) => normalize(d.DistrictName) === normalize(quan) || d.DistrictName === quan);
  return dist ? dist.DistrictID : null;
}

async function calcShippingFee(districtId: number, wardCode: string, weight: number) {
  const res = await fetch(`${GHN_BASE}/v2/shipping-order/fee`, {
    method: "POST",
    headers: { Token: GHN_TOKEN, ShopId: GHN_SHOP_ID, "Content-Type": "application/json" },
    body: JSON.stringify({
      service_type_id: 2,
      from_district_id: FROM_DISTRICT_ID,
      to_district_id: districtId,
      to_ward_code: wardCode,
      weight,
      insurance_value: 0,
    }),
  }).then(r => r.json());
  return res.code === 200 ? res.data?.total : null;
}

export async function POST(req: Request) {
  try {
    const { message, history = [], cart } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        text: "Chatbot đang bảo trì, vui lòng thử lại sau!",
        products: [],
      });
    }

    // Fast-path: hỏi phí ship → xử lý trực tiếp không cần AI
    const shippingKeywords = /ph[ií]\s*(ship|giao|v[aậ]n\s*chuy[eể]n)|ship\s*(bao\s*nhi[eê]u|t[oố]n|m[aấ]t)|giao\s*h[aà]ng.*bao\s*nhi[eê]u|ti[eề]n\s*ship/i;
    if (shippingKeywords.test(message)) {
      const session = await auth();
      let savedAddr: any = null;
      if (session?.user?.email) {
        const user = await prisma.nguoi_dung.findUnique({ where: { email: session.user.email }, select: { id: true } });
        if (user) {
          savedAddr = await prisma.dia_chi_nguoi_dung.findFirst({ where: { ma_nguoi_dung: user.id, la_mac_dinh: true } });
        }
      }

      // Parse địa chỉ từ message
      // Format 1: "Phường X, Quận Y, TP Z"
      const addrMatch = message.match(/(?:phường|xã|thị trấn|p\.)\s*([^,]+),?\s*(?:quận|huyện|thị xã|thành phố|q\.)\s*([^,]+),?\s*(?:tỉnh|thành phố|tp\.?|t\.)\s*(.+)/i);
      // Format 2: "quận X, TP Y" (không có phường)
      const addrMatch2 = !addrMatch ? message.match(/(?:quận|huyện|q\.)\s*([^,]+),?\s*(?:tỉnh|thành phố|tp\.?|t\.)\s*(.+)/i) : null;
      let resolved: { districtId: number; wardCode: string } | null = null;

      if (addrMatch) {
        const phuong = addrMatch[1].trim();
        const quan = addrMatch[2].trim();
        const tinh = addrMatch[3].trim();
        resolved = await resolveGhnWard(tinh, quan, phuong);
        if (!resolved) resolved = await resolveGhnWard(tinh, `Quận ${quan}`, `Phường ${phuong}`);
      } else if (addrMatch2) {
        const quan = addrMatch2[1].trim();
        const tinh = addrMatch2[2].trim();
        const ghnDist = await resolveGhnDistrict(tinh, quan);
        if (ghnDist) {
          resolved = { districtId: ghnDist, wardCode: "0" };
        }
      }
      if (!resolved && savedAddr?.tinh_thanh && savedAddr?.quan_huyen && savedAddr?.phuong_xa) {
        resolved = await resolveGhnWard(savedAddr.tinh_thanh, savedAddr.quan_huyen, savedAddr.phuong_xa);
      }

      if (resolved) {
        const weight = cart?.totalWeight || 1000;
        const fee = await calcShippingFee(resolved.districtId, resolved.wardCode, weight);
        if (fee !== null) {
          const weightKg = (weight / 1000).toFixed(1);
          const cartNote = cart ? `cho đơn hàng ~${weightKg}kg (${cart.totalItems} sản phẩm)` : "ước tính cho đơn 1kg";
          const approx = resolved.wardCode === "0" ? " (ước tính theo quận, chưa có phường cụ thể)" : "";
          return NextResponse.json({
            text: `Phí vận chuyển đến địa chỉ của bạn khoảng **${fee.toLocaleString("vi-VN")}đ** (${cartNote})${approx}. Phí chính xác sẽ được tính khi checkout nhé! 🚚`,
            products: [],
            navigate: null,
          });
        } else {
          return NextResponse.json({
            text: "Mình không thể tính phí ship lúc này do hệ thống vận chuyển đang bận. Bạn vui lòng thử lại sau hoặc vào trang thanh toán để xem phí chính xác nhé! 🙏",
            products: [],
            navigate: "/cart",
          });
        }
      } else if (!savedAddr) {
        return NextResponse.json({
          text: "Bạn muốn giao đến đâu ạ? Cho mình biết địa chỉ để mình tính phí ship nhé!\n\nVí dụ: *Phường Hải Châu 1, Quận Hải Châu, Đà Nẵng* 📍",
          products: [],
          navigate: null,
        });
      }
    }

    // Fast-path: chào hỏi
    const greetingPattern = /^(xin\s*ch[aà]o|hello|hi|hey|chào|alo|bạn ơi|freshy|mình muốn hỏi|cho mình hỏi)\s*[!?.]*$/i;
    if (greetingPattern.test(message.trim())) {
      return NextResponse.json({
        text: "Chào bạn! Mình là Freshy 🥦 Mình có thể giúp bạn tìm nông sản, xem giá, tính phí ship, hoặc dẫn bạn đến bất kỳ trang nào. Bạn cần gì nào?",
        products: [],
        navigate: null,
      });
    }

    // Fast-path: điều hướng đơn giản
    const navPatterns: [RegExp, string, string][] = [
      [/gi[oỏ]\s*h[aà]ng|cart/i, "/cart", "Mình đưa bạn đến giỏ hàng nhé! 🛒"],
      [/thanh\s*to[aá]n|checkout|đặt\s*hàng/i, "/checkout", "Mình chuyển bạn đến trang thanh toán nhé! 💳"],
      [/đơn\s*h[aà]ng|order/i, "/account/orders", "Mình đưa bạn đến trang đơn hàng nhé! 📦"],
      [/t[aà]i\s*kho[aả]n|profile|thông\s*tin/i, "/account/profile", "Mình chuyển bạn đến trang tài khoản nhé! 👤"],
      [/địa\s*chỉ|address/i, "/account/addresses", "Mình đưa bạn đến quản lý địa chỉ nhé! 📍"],
      [/yêu\s*thích|favorite|wishlist/i, "/account/favorites", "Mình đưa bạn đến sản phẩm yêu thích nhé! ❤️"],
      [/trang\s*ch[uủ]|home|về\s*đầu/i, "/", "Mình đưa bạn về trang chủ nhé! 🏠"],
      [/giới\s*thiệu|about/i, "/about", "Mình chuyển bạn đến trang giới thiệu nhé! ℹ️"],
      [/nh[aà]\s*cung|nông\s*tr[aạ]i|farmer/i, "/farmers", "Mình đưa bạn đến trang nhà cung cấp nhé! 🌾"],
    ];
    for (const [pattern, path, text] of navPatterns) {
      if (pattern.test(message) && /đưa|chuyển|đi|mở|xem|vào|đến|tới/i.test(message)) {
        return NextResponse.json({ text, products: [], navigate: path });
      }
    }

    // Fast-path: hỏi giá / tìm sản phẩm đơn giản (xử lý local bằng DB query)
    const pricePattern = /(?:giá|bao\s*nhiêu|có\s*bán|tìm|mua)\s+(.+)/i;
    const searchPattern = /^(?:có|cho|tìm|xem|gợi\s*ý)\s+(.+?)(?:\s*(?:không|nào|đi|nhé|giúp|cho\s*mình))?$/i;
    const priceMatch = message.match(pricePattern) || message.match(searchPattern);

    if (priceMatch && !isRateLimited()) {
      // Let AI handle complex product queries if not rate limited - fall through
    } else if (priceMatch) {
      const keyword = priceMatch[1].trim().toLowerCase();
      const matchedProducts = await prisma.san_pham.findMany({
        where: {
          trang_thai: "DANG_BAN",
          OR: [
            { ten_san_pham: { contains: keyword, mode: "insensitive" } },
            { danh_muc: { ten_danh_muc: { contains: keyword, mode: "insensitive" } } },
          ],
        },
        select: {
          id: true,
          ten_san_pham: true,
          anh_san_pham: { where: { la_anh_chinh: true }, take: 1 },
          bien_the_san_pham: {
            select: { gia_ban: true, don_vi_tinh: true },
            orderBy: { gia_ban: "asc" },
            take: 1,
          },
        },
        take: 3,
      });

      if (matchedProducts.length > 0) {
        const productList = matchedProducts.map(p => ({
          id: p.id,
          name: p.ten_san_pham,
          image: p.anh_san_pham[0]?.duong_dan_anh || null,
          price: p.bien_the_san_pham[0]?.gia_ban ? Number(p.bien_the_san_pham[0].gia_ban) : null,
          unit: p.bien_the_san_pham[0]?.don_vi_tinh || "kg",
        }));
        const names = productList.map(p => p.name).join(", ");
        return NextResponse.json({
          text: `Mình tìm thấy ${productList.length} sản phẩm liên quan đến "${keyword}": ${names}. Bạn muốn xem chi tiết sản phẩm nào không? 🛒`,
          products: productList,
          navigate: null,
        });
      } else {
        return NextResponse.json({
          text: `Hiện cửa hàng chưa có sản phẩm "${keyword}". Bạn thử tìm kiếm từ khóa khác hoặc xem tất cả sản phẩm nhé!`,
          products: [],
          navigate: `/search?q=${encodeURIComponent(keyword)}`,
        });
      }
    }

    // Rate limit check - nếu đã hết quota thì dùng fallback response
    if (isRateLimited()) {
      return NextResponse.json({
        text: "Freshy đang hơi quá tải rồi 😅 Bạn đợi khoảng 1 phút rồi hỏi lại nhé! Hoặc bạn có thể dùng thanh tìm kiếm trên website để tìm sản phẩm nhanh hơn.",
        products: [],
        navigate: null,
      });
    }

    // Lấy sản phẩm đang bán kèm giá, danh mục, mô tả
    const products = await prisma.san_pham.findMany({
      where: { trang_thai: "DANG_BAN" },
      select: {
        id: true,
        ten_san_pham: true,
        mo_ta: true,
        xuat_xu: true,
        danh_muc: { select: { ten_danh_muc: true } },
        bien_the_san_pham: {
          select: { gia_ban: true, don_vi_tinh: true },
          orderBy: { gia_ban: "asc" },
          take: 1,
        },
      },
      take: 50,
    });

    const productCatalog = products
      .map((p) => {
        const gia = p.bien_the_san_pham[0]?.gia_ban
          ? `${Number(p.bien_the_san_pham[0].gia_ban).toLocaleString("vi-VN")}đ/${p.bien_the_san_pham[0].don_vi_tinh || "kg"}`
          : "Liên hệ";
        const danhMuc = p.danh_muc?.ten_danh_muc || "";
        return `[ID:${p.id}] ${p.ten_san_pham} | Giá: ${gia} | Danh mục: ${danhMuc} | Xuất xứ: ${p.xuat_xu || "Việt Nam"}`;
      })
      .join("\n");

    // Lấy địa chỉ user nếu đã đăng nhập
    const session = await auth();
    let userAddressInfo = "";
    let savedAddress: any = null;
    let cartInfo = "";

    if (session?.user?.email) {
      const user = await prisma.nguoi_dung.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (user) {
        savedAddress = await prisma.dia_chi_nguoi_dung.findFirst({
          where: { ma_nguoi_dung: user.id, la_mac_dinh: true },
        });
        if (savedAddress && savedAddress.tinh_thanh) {
          userAddressInfo = `\nĐỊA CHỈ GIAO HÀNG CỦA KHÁCH: ${savedAddress.phuong_xa}, ${savedAddress.quan_huyen}, ${savedAddress.tinh_thanh}`;
        }
      }
    }

    if (cart) {
      cartInfo = `\nGIỎ HÀNG HIỆN TẠI: ${cart.totalItems} sản phẩm, ~${(cart.totalWeight / 1000).toFixed(1)}kg`;
    }

    const MODEL_NAME = "gemini-2.5-flash";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    const promptText = `
Bạn là trợ lý bán hàng "Freshy" của cửa hàng nông sản sạch NôngSản Việt. Kho hàng đặt tại Đà Nẵng.

DANH SÁCH SẢN PHẨM ĐANG BÁN:
${productCatalog}
${userAddressInfo}${cartInfo}

CÁC TRANG CÓ THỂ ĐIỀU HƯỚNG:
- /products : Trang tất cả sản phẩm
- /products/{id} : Trang chi tiết sản phẩm (thay {id} bằng ID sản phẩm)
- /categories/{id} : Trang danh mục sản phẩm
- /cart : Giỏ hàng
- /checkout : Thanh toán
- /account/orders : Đơn hàng của tôi
- /account/profile : Thông tin tài khoản
- /account/addresses : Địa chỉ giao hàng
- /account/favorites : Sản phẩm yêu thích
- /search?q={keyword} : Tìm kiếm sản phẩm (thay {keyword} bằng từ khóa)
- /about : Giới thiệu cửa hàng
- /farmers : Nhà cung cấp/nông trại
- / : Trang chủ

QUY TẮC:
1. Trả lời ngắn gọn, thân thiện, tự nhiên bằng tiếng Việt.
2. Nếu khách hỏi về sản phẩm, tìm trong danh sách trên và gợi ý phù hợp.
3. Nếu khách hỏi giá, trả lời chính xác theo dữ liệu.
4. Nếu không tìm thấy sản phẩm phù hợp, nói "Hiện cửa hàng chưa có sản phẩm này" và gợi ý sản phẩm tương tự nếu có.
5. Có thể gợi ý combo, cách chế biến, bảo quản nông sản.
6. Nếu khách muốn đi đến trang nào (ví dụ: "đưa tôi đến giỏ hàng", "xem đơn hàng", "tìm rau cải", "về trang chủ"), hãy trả về navigate với đường dẫn phù hợp.
7. Khi điều hướng, hãy nói cho khách biết bạn đang chuyển họ đến đâu.
8. Nếu khách hỏi phí ship/vận chuyển mà bạn không thể tính, hướng dẫn họ cung cấp địa chỉ dạng "Phường X, Quận Y, Tỉnh/TP Z" hoặc vào trang thanh toán.
9. Kho hàng giao từ Đà Nẵng. Giao hàng qua GHN, thường 2-5 ngày tùy vùng.
BẮT BUỘC trả về JSON:
{
  "text": "Nội dung trả lời khách",
  "productIds": [mảng ID sản phẩm gợi ý, tối đa 3 sản phẩm, rỗng nếu không gợi ý],
  "navigate": "/đường-dẫn-trang hoặc null nếu không cần điều hướng"
}

Câu hỏi của khách: "${message}"
`;

    const contents: any[] = [
      { role: "user", parts: [{ text: promptText }] },
      { role: "model", parts: [{ text: '{"text":"Tôi đã hiểu vai trò và danh sách sản phẩm. Sẵn sàng hỗ trợ!","productIds":[],"navigate":null}' }] },
    ];

    for (const msg of history.slice(-10)) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.role === "user" ? msg.text : `{"text":"${msg.text.replace(/"/g, '\\"')}","productIds":[],"navigate":null}` }],
      });
    }

    contents.push({ role: "user", parts: [{ text: message }] });

    const payload = {
      contents,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    };

    recordGeminiCall();

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.error) {
      console.error("GEMINI ERROR:", data.error.message);
      const isQuotaError = data.error.message?.includes("quota") || data.error.code === 429;
      if (isQuotaError) {
        return NextResponse.json({
          text: "Freshy đang hơi quá tải rồi 😅 Bạn đợi khoảng 1 phút rồi hỏi lại nhé! Trong lúc đó bạn có thể tìm sản phẩm bằng thanh tìm kiếm trên website.",
          products: [],
          navigate: null,
        });
      }
      return NextResponse.json({
        text: "Freshy gặp trục trặc nhỏ, bạn thử lại sau nhé!",
        products: [],
      });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiText) {
      return NextResponse.json({
        text: "Mình chưa hiểu ý bạn lắm, bạn nói rõ hơn được không?",
        products: [],
      });
    }

    const aiResult = JSON.parse(aiText);
    const productIds: number[] = aiResult.productIds || [];
    const responseText = aiResult.text || "Mình chưa hiểu ý bạn.";

    // Query thông tin đầy đủ của sản phẩm được gợi ý
    let recommendedProducts: any[] = [];
    if (productIds.length > 0) {
      const dbProducts = await prisma.san_pham.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          ten_san_pham: true,
          anh_san_pham: { where: { la_anh_chinh: true }, take: 1 },
          bien_the_san_pham: {
            select: { gia_ban: true, don_vi_tinh: true },
            orderBy: { gia_ban: "asc" },
            take: 1,
          },
        },
      });

      recommendedProducts = dbProducts.map((p) => ({
        id: p.id,
        name: p.ten_san_pham,
        image: p.anh_san_pham[0]?.duong_dan_anh || null,
        price: p.bien_the_san_pham[0]?.gia_ban
          ? Number(p.bien_the_san_pham[0].gia_ban)
          : null,
        unit: p.bien_the_san_pham[0]?.don_vi_tinh || "kg",
      }));
    }

    return NextResponse.json({
      text: responseText,
      products: recommendedProducts,
      navigate: aiResult.navigate || null,
    });
  } catch (error: any) {
    console.error("CHAT ERROR:", error.message);
    return NextResponse.json({
      text: "Hệ thống gặp sự cố, thử lại sau nhé!",
      products: [],
    });
  }
}
