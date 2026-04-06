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
