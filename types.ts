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