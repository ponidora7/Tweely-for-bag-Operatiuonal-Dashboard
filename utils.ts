import { ShopeeItem, TiktokItem, ExecutiveSummary, DailyMetric, DateRange } from './types';

// --- UTILITY FUNCTIONS ---
export const parseShopeeValue = (val: string | undefined): number => {
  if (!val) return 0;
  // Handle "6RB+" -> 6000
  let str = val.toString().toUpperCase().replace(/TERJUAL/g, '').replace(/\+/g, '').replace(/,/g, '').trim();
  if (str.includes('RB')) {
    return parseFloat(str.replace('RB', '')) * 1000;
  }
  return parseFloat(str) || 0;
};

export const parsePrice = (val: string | undefined): number => {
  // Assuming format "96" -> 96000 if small, or "96.000"
  if (!val) return 0;
  let clean = val.toString().replace(/\./g, '').replace(/RP/ig, '').trim();
  let num = parseFloat(clean);
  // Heuristic: if price is < 1000, likely represented in thousands (common in ID datasets)
  return num < 1000 ? num * 1000 : num;
};

export const extractHashtags = (text: string | undefined): string[] => {
  if (!text) return [];
  const matches = text.match(/#[a-zA-Z0-9_]+/g);
  return matches || [];
};

export const formatDate = (isoString: string): string => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
};

// --- EXECUTIVE DASHBOARD UTILS ---

// Simulate historical data based on current snapshot for demo purposes
export const generateExecutiveTrend = (range: DateRange, totalRevenue: number, tiktokData: TiktokItem[]): DailyMetric[] => {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90; // approx for YTD demo
  const data: DailyMetric[] = [];
  const now = new Date();
  
  // Create a map of real tiktok dates to plays
  const tiktokMap: Record<string, number> = {};
  tiktokData.forEach(item => {
    const d = new Date(item.date).toLocaleDateString('en-CA'); // YYYY-MM-DD
    tiktokMap[d] = (tiktokMap[d] || 0) + item.plays;
  });

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateStr = d.toLocaleDateString('en-CA');
    
    // Simulate revenue fluctuations
    const baseRev = totalRevenue / days;
    const randomFactor = 0.7 + Math.random() * 0.6; // 0.7x to 1.3x variation
    
    // Inject events
    let event = undefined;
    let spike = 1;
    if (i === 5) { event = "Payday Sale"; spike = 1.8; }
    if (i === 12) { event = "Viral UGC"; spike = 1.4; }
    if (i === 25) { event = "Flash Sale"; spike = 1.5; }

    // Use real tiktok data if date matches, else smooth random
    const realTiktok = tiktokMap[dateStr];
    const mockTiktok = Math.floor(Math.random() * 50000) + 10000;

    data.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Math.floor(baseRev * randomFactor * spike),
      ugcReach: realTiktok || (mockTiktok * spike),
      event
    });
  }
  return data;
};

export const generateExecutiveSummary = (shopeeData: ShopeeItem[], range: DateRange): ExecutiveSummary => {
  const currentRevenue = shopeeData.reduce((acc, item) => acc + (item.price * item.sold), 0);
  const currentOrders = shopeeData.reduce((acc, item) => acc + item.sold, 0);
  const currentAOV = currentOrders > 0 ? currentRevenue / currentOrders : 0;

  // Mock previous period data with realistic variance
  const variance = 0.85 + Math.random() * 0.3; // -15% to +15%
  
  return {
    revenue: { current: currentRevenue, previous: currentRevenue * variance, delta: (1 - variance) * 100 },
    orders: { current: currentOrders, previous: currentOrders * (variance + 0.05), delta: (1 - (variance + 0.05)) * 100 },
    aov: { current: currentAOV, previous: currentAOV * 0.95, delta: 5.2 }
  };
};

export const getRiskAndOpportunities = (tiktokData: TiktokItem[]) => {
  const topTag = tiktokData[0]?.tags[0] || "#tweely";
  return {
    risk: `Inventory Alert: Stock levels for top SKU 'Mini Backpack' are critically low relative to daily run-rate.`,
    opportunity: `UGC Surge: Engagement on ${topTag} is up +12%, correlated with a 15% revenue lift.`,
    action: `Recommended: Amplify Creator @tweely_fan's recent video to sustain momentum.`
  };
};


// --- MOCK DATA GENERATORS ---
export const generateShopeeData = (): ShopeeItem[] => [
  { 
    id: 1, 
    name: "Tweelyforbag Flessy NEW Mini Backpack", 
    price: 96000, 
    discount: "36%", 
    tag: "Diskon Rp3RB", 
    rating: 4.9, 
    sold: 6000, 
    soldLabel: "6RB+", 
    // Image: Backpacks (Beige/Brown)
    image: "https://github.com/user-attachments/assets/71c61563-0056-4c75-9c86-185440618051", 
    url: "#" 
  },
  { 
    id: 2, 
    name: "Tweelyforbag Gigi Dompet Lipat Wanita", 
    price: 35000, 
    discount: "41%", 
    tag: "Voucher 50%", 
    rating: 4.8, 
    sold: 3000, 
    soldLabel: "3RB+", 
    // Image: Wallets
    image: "https://github.com/user-attachments/assets/38435136-1506-4444-9080-366551820612", 
    url: "#" 
  },
  { 
    id: 3, 
    name: "Tweelyforbag Elody Small Size KECIL", 
    price: 85000, 
    discount: "25%", 
    tag: "Cashback XTRA", 
    rating: 4.7, 
    sold: 1500, 
    soldLabel: "1.5RB+", 
    // Image: Circle of Backpacks
    image: "https://github.com/user-attachments/assets/68310006-2c5e-47f9-8d76-189689617260", 
    url: "#" 
  },
  { 
    id: 4, 
    name: "Tweelyforbag Cecille Totebag Canvas", 
    price: 120000, 
    discount: "10%", 
    tag: "Terlaris", 
    rating: 4.9, 
    sold: 800, 
    soldLabel: "800", 
    // Image: Model with Tote
    image: "https://github.com/user-attachments/assets/19f39088-333e-46d2-bb82-411327142416", 
    url: "#" 
  },
  { 
    id: 5, 
    name: "Tweelyforbag Pouch Makeup Travel", 
    price: 25000, 
    discount: "50%", 
    tag: "Flash Sale", 
    rating: 4.6, 
    sold: 10000, 
    soldLabel: "10RB+", 
    // Image: Brown Pouch
    image: "https://github.com/user-attachments/assets/c6607212-325b-4860-96f8-985226759755", 
    url: "#" 
  },
  { 
    id: 6, 
    name: "Tweelyforbag Shoulder Bag Retro", 
    price: 110000, 
    discount: "15%", 
    tag: "Diskon Rp10RB", 
    rating: 4.5, 
    sold: 500, 
    soldLabel: "500", 
    // Image: Hanging Shoulder Bags
    image: "https://github.com/user-attachments/assets/10101150-5100-4354-9915-101112201222", 
    url: "#" 
  },
  { 
    id: 7, 
    name: "Tweelyforbag Sling Phone Case", 
    price: 45000, 
    discount: "20%", 
    tag: "Murah Lebay", 
    rating: 4.8, 
    sold: 2200, 
    soldLabel: "2.2RB+", 
    // Image: Quilted Slings
    image: "https://github.com/user-attachments/assets/19323382-3580-4565-9830-478631525011", 
    url: "#" 
  },
  { 
    id: 8, 
    name: "Tweelyforbag Laptop Sleeve 14 Inch", 
    price: 75000, 
    discount: "30%", 
    tag: "", 
    rating: 4.9, 
    sold: 450, 
    soldLabel: "450", 
    // Image: Laptop Sleeves
    image: "https://github.com/user-attachments/assets/05933615-5205-4085-8833-255011880562", 
    url: "#" 
  },
];

export const generateTiktokData = (): TiktokItem[] => [
  { id: 1, caption: "Get yours! Cecille Totebag😍 #tweelyforbag", fullCaption: "Get yours! Cecille Totebag😍 #tweelyforbag", tags: ["#tweelyforbag", "#totebag"], likes: 830, shares: 118, plays: 121900, comments: 31, date: "2025-05-10" },
  { id: 2, caption: "NOT YOUR ORDINARY BACKPACK😎 Elody Large...", fullCaption: "NOT YOUR ORDINARY BACKPACK😎 Elody Large size is back!", tags: ["#backpack", "#racuntiktok"], likes: 12600, shares: 1507, plays: 940800, comments: 174, date: "2025-07-09" },
  { id: 3, caption: "Packing orders for 12.12 Sale! 📦 #packingasmr", fullCaption: "Packing orders for 12.12 Sale! 📦 #packingasmr", tags: ["#packing", "#asmr"], likes: 5400, shares: 200, plays: 450000, comments: 89, date: "2025-06-15" },
  { id: 4, caption: "New color alert! 🚨 Pastel Pink Series", fullCaption: "New color alert! 🚨 Pastel Pink Series", tags: ["#newarrival", "#pink"], likes: 3200, shares: 450, plays: 210000, comments: 120, date: "2025-06-20" },
  { id: 5, caption: "What fits in my Tweely Bag? 🎒", fullCaption: "What fits in my Tweely Bag? 🎒", tags: ["#whatsinmybag"], likes: 9800, shares: 890, plays: 780000, comments: 230, date: "2025-07-01" },
  { id: 6, caption: "Flash Sale Spoiler 🤫 Don't tell boss", fullCaption: "Flash Sale Spoiler 🤫 Don't tell boss", tags: ["#flashsale", "#spill"], likes: 15000, shares: 3000, plays: 1200000, comments: 560, date: "2025-07-15" },
  { id: 7, caption: "Styling tips for college students 👗", fullCaption: "Styling tips for college students 👗", tags: ["#ootd", "#campus"], likes: 4500, shares: 320, plays: 340000, comments: 95, date: "2025-05-25" },
];

export const parseShopeeCSV = (csvText: string): ShopeeItem[] => {
  const lines = csvText.split('\n');
  const newItems: ShopeeItem[] = [];

  // Skip header, iterate rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Simple CSV split
    const cols = line.split(','); 
    
    if (cols.length > 5) {
      const name = cols[3]?.replace(/"/g, '');
      const price = parsePrice(cols[4]);
      const discount = cols[5]?.replace(/"/g, '');
      const tag = cols[6]?.replace(/"/g, '');
      const rating = parseFloat(cols[7]) || 0;
      const soldRaw = cols[8];
      const sold = parseShopeeValue(soldRaw);
      
      if (name) {
        newItems.push({
          id: i,
          name,
          price,
          discount,
          tag,
          rating,
          sold,
          soldLabel: soldRaw,
          image: cols[1] || `https://picsum.photos/100/100?random=${i}`,
          url: cols[0]
        });
      }
    }
  }
  return newItems;
};

export const parseTiktokCSV = (csvText: string): TiktokItem[] => {
  const lines = csvText.split('\n');
  const newItems: TiktokItem[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(',');
    if (cols.length > 5) {
      const captionRaw = cols[2]?.replace(/"/g, '');
      newItems.push({
        id: i,
        caption: captionRaw.substring(0, 50) + "...",
        fullCaption: captionRaw,
        tags: extractHashtags(captionRaw),
        likes: parseInt(cols[3]) || 0,
        shares: parseInt(cols[4]) || 0,
        plays: parseInt(cols[5]) || 0,
        comments: parseInt(cols[6]) || 0,
        date: cols[9] // createTimeISO
      });
    }
  }
  return newItems;
};