// src/types/index.ts
export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  url: string;
  order: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  isExpired?: boolean;
}

export interface Stat {
  label: string;
  value: string | number;
  trend?: string;
  trendType?: "up" | "down";
  status?: string;
}

// BẮT BUỘC phải có chữ export ở đầu
export interface Product {
  id: string | number;
  name: string;
  price: number;
  status?: string;
  image?: string;
  // Bạn có thể thêm bớt các thuộc tính cho khớp với data mẫu của bạn
}
