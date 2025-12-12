export interface ShopeeItem {
  id: number;
  name: string;
  price: number;
  discount: string;
  tag: string;
  rating: number;
  sold: number;
  soldLabel: string;
  image: string;
  url: string;
}

export interface TiktokItem {
  id: number;
  caption: string;
  fullCaption: string;
  tags: string[];
  likes: number;
  shares: number;
  plays: number;
  comments: number;
  date: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}

export interface TrendDataPoint {
  date: string;
  plays: number;
  engagement: number;
}

export type DateRange = '7d' | '30d' | 'ytd';

export interface ExecutiveSummary {
  revenue: { current: number; previous: number; delta: number };
  orders: { current: number; previous: number; delta: number };
  aov: { current: number; previous: number; delta: number };
}

export interface DailyMetric {
  date: string;
  revenue: number;
  ugcReach: number;
  event?: string; // e.g., "Mega Sale", "Viral Post"
}