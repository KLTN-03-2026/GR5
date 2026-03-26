agricultural-products/
├── prisma/
│   ├── schema.prisma          # Định nghĩa toàn bộ DB schema (BE phụ trách)
│   ├── seed.ts                # Dữ liệu mẫu để dev/test
│   └── migrations/            # Auto-generated bởi prisma migrate
│
├── public/
│   ├── images/                # Ảnh tĩnh (logo, placeholder)
│   └── mockServiceWorker.js   # MSW worker (nếu dùng sau này)
│
└── src/
    ├── app/                           # Next.js App Router — FE phụ trách
    │   ├── layout.tsx                 # Root layout (font, metadata)
    │   ├── page.tsx                   # Trang chủ (redirect về dashboard)
    │   ├── globals.css                # Global styles
    │   │
    │   ├── (auth)/                    # Route group: không có sidebar
    │   │   ├── login/
    │   │   │   └── page.tsx
    │   │   └── layout.tsx             # Auth layout (centered, no sidebar)
    │   │
    │   ├── (dashboard)/               # Route group: có sidebar admin
    │   │   ├── layout.tsx             # Dashboard layout (sidebar + topbar)
    │   │   ├── overview/
    │   │   │   └── page.tsx           # Trang tổng quan
    │   │   ├── products/
    │   │   │   ├── page.tsx           # Danh sách sản phẩm
    │   │   │   └── [id]/
    │   │   │       └── page.tsx       # Chi tiết / chỉnh sửa sản phẩm
    │   │   ├── suppliers/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/page.tsx
    │   │   ├── orders/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/page.tsx
    │   │   ├── customers/
    │   │   │   ├── page.tsx
    │   │   │   └── [id]/page.tsx
    │   │   ├── categories/
    │   │   │   └── page.tsx
    │   │   ├── analytics/
    │   │   │   └── page.tsx           # Thống kê & báo cáo
    │   │   ├── payments/
    │   │   │   └── page.tsx
    │   │   ├── content/
    │   │   │   └── page.tsx           # Banner & nội dung
    │   │   └── settings/
    │   │       └── page.tsx
    │   │
    │   └── api/                       # API Routes — BE phụ trách
    │       ├── auth/
    │       │   └── [...nextauth]/
    │       │       └── route.ts       # NextAuth handler
    │       ├── products/
    │       │   ├── route.ts           # GET /api/products, POST /api/products
    │       │   └── [id]/
    │       │       └── route.ts       # GET PUT DELETE /api/products/:id
    │       ├── suppliers/
    │       │   ├── route.ts
    │       │   └── [id]/route.ts
    │       ├── orders/
    │       │   ├── route.ts
    │       │   └── [id]/route.ts
    │       ├── customers/
    │       │   ├── route.ts
    │       │   └── [id]/route.ts
    │       ├── categories/
    │       │   ├── route.ts
    │       │   └── [id]/route.ts
    │       ├── analytics/
    │       │   └── route.ts           # GET thống kê tổng hợp
    │       ├── payments/
    │       │   ├── route.ts
    │       │   └── refunds/route.ts
    │       └── chatbot/
    │           └── route.ts           # POST /api/chatbot (RAG + LLM)
    │
    ├── components/                    # FE phụ trách
    │   ├── ui/                        # Atomic components tái sử dụng
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Card.tsx
    │   │   ├── Modal.tsx
    │   │   ├── Table.tsx
    │   │   ├── Pagination.tsx
    │   │   ├── Select.tsx
    │   │   ├── Toggle.tsx
    │   │   └── index.ts               # Re-export tất cả
    │   │
    │   ├── layout/                    # Layout components
    │   │   ├── Sidebar.tsx            # Sidebar với nav items
    │   │   ├── Topbar.tsx             # Header bar
    │   │   └── DashboardShell.tsx     # Wrapper sidebar + topbar
    │   │
    │   ├── charts/                    # Chart components (Recharts)
    │   │   ├── RevenueLineChart.tsx
    │   │   ├── OrderStatusDonut.tsx
    │   │   ├── TopProductsBar.tsx
    │   │   └── CategoryRevenueBar.tsx
    │   │
    │   ├── dashboard/                 # Components cho từng trang
    │   │   ├── overview/
    │   │   │   ├── KpiCards.tsx
    │   │   │   ├── RecentOrders.tsx
    │   │   │   ├── LowStockTable.tsx
    │   │   │   └── ActivityFeed.tsx
    │   │   ├── products/
    │   │   │   ├── ProductTable.tsx
    │   │   │   ├── ProductFilter.tsx
    │   │   │   └── ProductFormModal.tsx
    │   │   ├── suppliers/
    │   │   │   ├── SupplierGrid.tsx
    │   │   │   ├── SupplierCard.tsx
    │   │   │   └── SupplierDetailPanel.tsx
    │   │   ├── orders/
    │   │   │   ├── OrderTable.tsx
    │   │   │   ├── OrderStatusTabs.tsx
    │   │   │   └── OrderDetailModal.tsx
    │   │   ├── customers/
    │   │   │   ├── CustomerTable.tsx
    │   │   │   └── CustomerSidePanel.tsx
    │   │   ├── analytics/
    │   │   │   └── AnalyticsKpiCards.tsx
    │   │   └── settings/
    │   │       ├── StoreInfoForm.tsx
    │   │       ├── ChatbotConfigForm.tsx
    │   │       └── PermissionsTable.tsx
    │   │
    │   └── shared/                    # Dùng chung nhiều trang
    │       ├── PageHeader.tsx         # Title + action button row
    │       ├── FilterBar.tsx          # Search + select + button lọc
    │       ├── EmptyState.tsx         # UI khi không có data
    │       ├── LoadingSkeleton.tsx    # Loading placeholder
    │       └── ConfirmDialog.tsx      # Modal xác nhận xoá
    │
    ├── hooks/                         # Custom React hooks — FE phụ trách
    │   ├── useProducts.ts             # Fetch + mutate products
    │   ├── useOrders.ts
    │   ├── useSuppliers.ts
    │   ├── useCustomers.ts
    │   ├── useCategories.ts
    │   ├── useAnalytics.ts
    │   ├── useDebounce.ts             # Debounce search input
    │   └── useLocalStorage.ts        # Lưu filter state
    │
    ├── services/                      # Gọi API — cầu nối FE ↔ BE
    │   ├── product.service.ts         # fetch('/api/products', ...)
    │   ├── supplier.service.ts
    │   ├── order.service.ts
    │   ├── customer.service.ts
    │   ├── category.service.ts
    │   ├── analytics.service.ts
    │   ├── payment.service.ts
    │   └── chatbot.service.ts
    │
    ├── lib/                           # Utilities — Full-stack phụ trách
    │   ├── prisma.ts                  # Prisma client singleton
    │   ├── auth.ts                    # NextAuth config
    │   ├── api-response.ts            # Helper: chuẩn hoá JSON response
    │   ├── format.ts                  # Format tiền VND, ngày tháng VN
    │   ├── constants.ts               # ORDER_STATUS, ROLES, v.v.
    │   └── utils.ts                   # Các hàm nhỏ tái sử dụng
    │
    ├── schemas/                       # Zod schemas — Full-stack phụ trách
    │   ├── product.schema.ts
    │   ├── supplier.schema.ts
    │   ├── order.schema.ts
    │   ├── customer.schema.ts
    │   ├── category.schema.ts
    │   └── index.ts                   # Re-export tất cả
    │
    └── types/                         # TypeScript types toàn cục
        ├── api.types.ts               # Request / Response types
        ├── auth.types.ts              # User, Session
        └── index.ts                   # Re-export
