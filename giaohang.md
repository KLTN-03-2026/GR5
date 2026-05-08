# Tích hợp API Giao Hàng Nhanh (GHN) — Hướng dẫn triển khai

---

## 1. Chuẩn bị tài khoản

- Đăng ký tài khoản sandbox tại: https://dev.ghn.vn
- Sau khi đăng ký, vào **Quản lý cửa hàng** → lấy:
  - `Token` (header `Token`)
  - `ShopId` (dùng trong body mỗi request)
- Base URL sandbox: `https://dev-online-gateway.ghn.vn/shiip/public-api`
- Base URL production: `https://online-gateway.ghn.vn/shiip/public-api`
- Lưu vào `.env`:
  ```
  GHN_TOKEN=your_token_here
  GHN_SHOP_ID=your_shop_id
  GHN_BASE_URL=https://dev-online-gateway.ghn.vn/shiip/public-api
  ```

---

## 2. Các endpoint GHN cần dùng

| Mục đích                 | Method | Endpoint                    |
| ------------------------ | ------ | --------------------------- |
| Lấy danh sách tỉnh/thành | GET    | `/master-data/province`     |
| Lấy danh sách quận/huyện | GET    | `/master-data/district`     |
| Lấy danh sách phường/xã  | GET    | `/master-data/ward`         |
| Tính phí vận chuyển      | POST   | `/v2/shipping-order/fee`    |
| Tạo vận đơn              | POST   | `/v2/shipping-order/create` |
| Lấy trạng thái vận đơn   | POST   | `/v2/shipping-order/detail` |
| Hủy vận đơn              | POST   | `/v2/shipping-order/cancel` |

Headers cho mọi request:

```
Token: <GHN_TOKEN>
ShopId: <GHN_SHOP_ID>
Content-Type: application/json
```

---

## 3. Luồng nghiệp vụ tổng thể

```
Checkout (người dùng)
  → Tính phí ship (gọi GHN fee API, hiển thị cho user)
  → Đặt hàng thành công (tạo don_hang trong DB)
  → Admin xác nhận đơn (gọi GHN create order API, lưu order_code vào don_van_chuyen)
  → Webhook GHN gọi về khi trạng thái thay đổi (cập nhật trang_thai vào DB)
  → Người dùng tra cứu vận đơn (gọi GHN detail API)
```

---

## 4. Cấu trúc API Routes (Next.js)

### 4.1 Tính phí vận chuyển — `app/api/ghn/fee/route.ts`

Request body từ frontend:

```json
{
  "to_district_id": 1442,
  "to_ward_code": "21211",
  "weight": 1000,
  "insurance_value": 150000
}
```

Code:

```ts
export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${process.env.GHN_BASE_URL}/v2/shipping-order/fee`, {
    method: "POST",
    headers: {
      Token: process.env.GHN_TOKEN!,
      ShopId: process.env.GHN_SHOP_ID!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_type_id: 2, // 2 = E-commerce (chuẩn), 5 = Express
      from_district_id: 1542, // district_id kho của shop (lấy từ master-data)
      to_district_id: body.to_district_id,
      to_ward_code: body.to_ward_code,
      weight: body.weight,
      insurance_value: body.insurance_value,
    }),
  });
  const data = await res.json();
  return NextResponse.json({ fee: data.data?.total });
}
```

### 4.2 Tạo vận đơn — `app/api/ghn/create-order/route.ts`

Gọi sau khi admin xác nhận đơn hàng. Body mẫu:

```json
{
  "orderId": 123
}
```

Code:

```ts
export async function POST(req: Request) {
  const { orderId } = await req.json();

  const order = await prisma.don_hang.findUnique({
    where: { id: orderId },
    include: {
      nguoi_dung: true,
      chi_tiet_don_hang: {
        include: { bien_the_san_pham: { include: { san_pham: true } } },
      },
    },
  });

  const ghnRes = await fetch(
    `${process.env.GHN_BASE_URL}/v2/shipping-order/create`,
    {
      method: "POST",
      headers: {
        Token: process.env.GHN_TOKEN!,
        ShopId: process.env.GHN_SHOP_ID!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to_name: order.ho_ten_nguoi_nhan,
        to_phone: order.sdt_nguoi_nhan,
        to_address: order.dia_chi_giao_hang,
        to_ward_code: order.ma_phuong_xa_ghn, // cần lưu khi user chọn địa chỉ
        to_district_id: order.ma_quan_huyen_ghn, // cần lưu khi user chọn địa chỉ
        cod_amount:
          order.phuong_thuc_thanh_toan === "COD" ? order.tong_tien : 0,
        weight: 1000, // tính từ sản phẩm nếu có trường khối lượng
        service_type_id: 2,
        payment_type_id: 1, // 1 = shop trả phí, 2 = người nhận trả
        required_note: "CHOXEMHANGKHONGTHU",
        items: order.chi_tiet_don_hang.map((item: any) => ({
          name: item.bien_the_san_pham.san_pham.ten_san_pham,
          quantity: item.so_luong,
          price: item.don_gia,
        })),
      }),
    },
  );

  const ghnData = await ghnRes.json();
  const orderCode = ghnData.data?.order_code;

  // Lưu mã vận đơn vào bảng don_van_chuyen
  await prisma.don_van_chuyen.upsert({
    where: { ma_don_hang: orderId },
    create: {
      ma_don_hang: orderId,
      ma_van_don: orderCode,
      trang_thai: "ready_to_pick",
    },
    update: { ma_van_don: orderCode, trang_thai: "ready_to_pick" },
  });

  return NextResponse.json({ success: true, order_code: orderCode });
}
```

### 4.3 Tra cứu vận đơn — `app/api/ghn/tracking/route.ts`

```ts
export async function POST(req: Request) {
  const { order_code } = await req.json();

  const res = await fetch(
    `${process.env.GHN_BASE_URL}/v2/shipping-order/detail`,
    {
      method: "POST",
      headers: {
        Token: process.env.GHN_TOKEN!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order_code }),
    },
  );

  const data = await res.json();
  return NextResponse.json(data.data);
}
```

### 4.4 Webhook nhận cập nhật tự động — `app/api/ghn/webhook/route.ts`

GHN gọi POST về URL này khi trạng thái vận đơn thay đổi. Cần cấu hình URL webhook trong dashboard GHN:

```
https://yourdomain.com/api/ghn/webhook
```

```ts
export async function POST(req: Request) {
  const body = await req.json();
  // body.OrderCode = mã vận đơn, body.Status = trạng thái mới

  const STATUS_MAP: Record<string, string> = {
    ready_to_pick: "DANG_CHUAN_BI",
    picking: "DANG_LAY_HANG",
    picked: "DA_LAY_HANG",
    delivering: "DANG_GIAO_HANG",
    delivered: "DA_GIAO",
    delivery_fail: "GIAO_THAT_BAI",
    return: "DANG_HOAN_TRA",
    returned: "DA_HOAN_TRA",
    cancel: "DA_HUY",
  };

  const newStatus = STATUS_MAP[body.Status];
  if (!newStatus) return NextResponse.json({ success: true });

  await prisma.don_van_chuyen.updateMany({
    where: { ma_van_don: body.OrderCode },
    data: { trang_thai: body.Status },
  });

  // Đồng bộ trạng thái đơn hàng chính nếu cần
  if (newStatus === "DA_GIAO" || newStatus === "DA_HUY") {
    const shipment = await prisma.don_van_chuyen.findFirst({
      where: { ma_van_don: body.OrderCode },
    });
    if (shipment) {
      await prisma.don_hang.update({
        where: { id: shipment.ma_don_hang },
        data: { trang_thai: newStatus },
      });
    }
  }

  return NextResponse.json({ success: true });
}
```

> **Lưu ý khi báo cáo**: Khi demo trên localhost, webhook không thể nhận được. Dùng **ngrok** (`ngrok http 3000`) để tạo public URL tạm thời rồi đăng ký vào GHN dashboard.

---

## 5. Frontend — Hiển thị phí ship khi checkout

```tsx
const [shippingFee, setShippingFee] = useState(0);

const calcFee = async (districtId: number, wardCode: string) => {
  const res = await fetch("/api/ghn/fee", {
    method: "POST",
    body: JSON.stringify({
      to_district_id: districtId,
      to_ward_code: wardCode,
      weight: 1000,
    }),
  });
  const data = await res.json();
  setShippingFee(data.fee);
};
```

---

## 6. Những trường cần bổ sung vào schema Prisma

Để tích hợp đầy đủ, `don_hang` hoặc `dia_chi_nguoi_dung` cần lưu thêm:

```prisma
ma_quan_huyen_ghn  Int?    // district_id từ GHN master-data
ma_phuong_xa_ghn   String? // ward_code từ GHN master-data
```

Các trường này lấy khi người dùng chọn địa chỉ giao hàng (gọi `/master-data/district` và `/master-data/ward`).

---

## 7. Lưu ý quan trọng

- Token tuyệt đối không hardcode — luôn dùng `process.env.GHN_TOKEN`
- `ShopId` phải khớp với cửa hàng đã đăng ký trên GHN, thiếu sẽ lỗi 401
- Sandbox và production dùng token khác nhau
- `to_ward_code` là kiểu **string** (ví dụ `"21211"`), không phải số
- `weight` đơn vị là **gram**
- `cod_amount` chỉ điền khi thanh toán COD, không thì để 0
- Khi báo cáo: vẽ sequence diagram Webhook để thể hiện kiến trúc event-driven

Đã build xong
7 file mới tạo:

src/app/api/ghn/master-data/route.ts — Lấy tỉnh/quận/phường từ GHN
src/app/api/ghn/fee/route.ts — Tính phí ship
src/app/api/ghn/create-order/route.ts — Tạo vận đơn GHN
src/app/api/ghn/tracking/route.ts — Tra cứu trạng thái
src/app/api/ghn/webhook/route.ts — Nhận webhook GHN tự động
src/components/store/orders/TrackingTimeline.tsx — Component timeline vận chuyển cho user
5 file đã sửa:

prisma/schema.prisma — Thêm ma_tinh_ghn, ma_quan_huyen_ghn, ma_phuong_xa_ghn vào dia_chi_nguoi_dung và don_hang; thêm ho_ten_nguoi_nhan, sdt_nguoi_nhan, dia_chi_giao_hang vào don_hang
src/app/(store)/payment/page.tsx — Form chọn tỉnh/quận/phường từ GHN, tính phí ship động, ngày giao dự kiến
src/app/api/store/orders/route.ts — Lưu snapshot địa chỉ GHN khi tạo đơn
src/app/admin/orders/page.tsx — Thêm nút "Tạo vận đơn GHN" trong drawer, hiển thị địa chỉ giao hàng, link tra cứu GHN
src/app/(store)/orders/page.tsx — Nhúng TrackingTimeline vào modal chi tiết đơn hàng
⚠️ Việc bạn cần làm bên ngoài

1. Đăng ký tài khoản GHN Sandbox

Truy cập: https://dev.ghn.vn → đăng ký → vào Quản lý cửa hàng lấy Token và ShopId 2. Thêm biến môi trường vào .env

GHN_TOKEN=your_token_here
GHN_SHOP_ID=your_shop_id_here
GHN_BASE_URL=https://dev-online-gateway.ghn.vn/shiip/public-api
GHN_FROM_DISTRICT_ID=1542 # District ID kho của shop (tra từ API master-data/district) 3. Chạy migration Prisma

npx prisma db push
(hoặc npx prisma migrate dev --name add-ghn-fields nếu dùng migrate)

4. Đăng ký URL Webhook GHN (để nhận cập nhật tự động)

Dùng ngrok khi test local: ngrok http 3000
Vào GHN Dashboard → Cài đặt webhook → nhập URL: https://your-ngrok-url.ngrok.io/api/ghn/webhook
Production: thay bằng domain thật https://yourdomain.com/api/ghn/webhook 5. Xác định GHN_FROM_DISTRICT_ID của kho

Gọi GET /api/ghn/master-data?type=province để lấy ProvinceID của tỉnh kho
Gọi GET /api/ghn/master-data?type=district&province_id=xxx để lấy DistrictID kho
Điền vào .env là GHN_FROM_DISTRICT_ID
