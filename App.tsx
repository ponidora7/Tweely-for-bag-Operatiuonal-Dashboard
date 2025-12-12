import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, LabelList
} from 'recharts';
import { 
  LayoutDashboard, ShoppingBag, Video, TrendingUp,
  DollarSign, Heart, Share2, Play, Tag
} from 'lucide-react';
import { ShopeeItem, TiktokItem } from './types';
import { 
  generateShopeeData, generateTiktokData, parseShopeeCSV, 
  parseTiktokCSV, formatDate 
} from './utils';
import StatCard from './components/StatCard';
import FileUploader from './components/FileUploader';

// Colors for Pie Chart - expanded palette
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a05195', '#d45087'];

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'shopee' | 'tiktok'>('overview');
  const [shopeeData, setShopeeData] = useState<ShopeeItem[]>(generateShopeeData());
  const [tiktokData, setTiktokData] = useState<TiktokItem[]>(generateTiktokData());

  // --- DATA HANDLERS ---
  const handleShopeeUpload = (text: string) => {
    const newItems = parseShopeeCSV(text);
    if (newItems.length > 0) setShopeeData(newItems);
  };

  const handleTiktokUpload = (text: string) => {
    const newItems = parseTiktokCSV(text);
    if (newItems.length > 0) setTiktokData(newItems);
  };

  // --- AGGREGATED METRICS ---
  const totalRevenue = useMemo(() => shopeeData.reduce((acc, item) => acc + (item.price * item.sold), 0), [shopeeData]);
  const totalSalesCount = useMemo(() => shopeeData.reduce((acc, item) => acc + item.sold, 0), [shopeeData]);
  const totalViews = useMemo(() => tiktokData.reduce((acc, item) => acc + item.plays, 0), [tiktokData]);
  const totalEngagement = useMemo(() => tiktokData.reduce((acc, item) => acc + item.likes + item.shares + item.comments, 0), [tiktokData]);
  
  const topProducts = useMemo(() => [...shopeeData].sort((a, b) => b.sold - a.sold).slice(0, 5), [shopeeData]);
  const topVideos = useMemo(() => [...tiktokData].sort((a, b) => b.plays - a.plays).slice(0, 5), [tiktokData]);

  // Chart Data Preparation
  const categorySalesData = useMemo(() => {
    const cats: Record<string, number> = { 
      'Backpack': 0, 
      'Totebag': 0, 
      'Wallet': 0, 
      'Shoulder Bag': 0, 
      'Sling Bag': 0, 
      'Laptop Case': 0,
      'Pouch': 0,
      'Other': 0 
    };

    shopeeData.forEach(item => {
      const name = item.name.toLowerCase();
      if (name.includes('backpack') || name.includes('ransel')) cats['Backpack'] += item.sold;
      else if (name.includes('tote') || name.includes('totebag')) cats['Totebag'] += item.sold;
      else if (name.includes('dompet') || name.includes('wallet')) cats['Wallet'] += item.sold;
      else if (name.includes('shoulder')) cats['Shoulder Bag'] += item.sold;
      else if (name.includes('sling') || name.includes('selempang')) cats['Sling Bag'] += item.sold;
      else if (name.includes('laptop') || name.includes('sleeve')) cats['Laptop Case'] += item.sold;
      else if (name.includes('pouch') || name.includes('tempat') || name.includes('makeup')) cats['Pouch'] += item.sold;
      else cats['Other'] += item.sold;
    });

    return Object.keys(cats)
      .filter(key => cats[key] > 0)
      .map(key => ({ name: key, value: cats[key] }));
  }, [shopeeData]);

  const engagementTrend = useMemo(() => {
    return [...tiktokData]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(item => ({
        date: formatDate(item.date),
        plays: item.plays,
        engagement: item.likes + item.shares
      }));
  }, [tiktokData]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-indigo-200 shadow-md">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Tweely Ops Board</h1>
                <p className="text-xs text-slate-500 font-medium">Official Store & Content Command Center</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                {(['overview', 'shopee', 'tiktok'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === tab 
                      ? 'bg-white text-indigo-600 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* FILE UPLOAD SECTION */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-2 pr-4">
             <h3 className="text-lg font-bold text-slate-900">Data Sources</h3>
             <p className="text-sm text-slate-500">
               Upload your latest CSV exports to update the dashboard metrics in real-time.
               The dashboard automatically processes sales and engagement data.
             </p>
          </div>
          <div className="md:col-span-1 h-24">
            <FileUploader 
              label="Upload Shopee Data.csv" 
              accept=".csv"
              onDataLoaded={handleShopeeUpload}
            />
          </div>
          <div className="md:col-span-1 h-24">
            <FileUploader 
              label="Upload Tiktok Content.csv" 
              accept=".csv"
              onDataLoaded={handleTiktokUpload}
            />
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Est. Gross Revenue (GMV)" 
                value={`Rp ${(totalRevenue / 1000000).toFixed(1)}Jt`} 
                icon={DollarSign} 
                subtext="Lifetime GMV (Price x Sold)"
                trend={12}
              />
              <StatCard 
                title="Total Products Sold" 
                value={`${(totalSalesCount / 1000).toFixed(1)}K`} 
                icon={ShoppingBag} 
                subtext="Cumulative Volume"
                trend={5.4}
              />
              <StatCard 
                title="Total Video Views" 
                value={`${(totalViews / 1000000).toFixed(2)}M`} 
                icon={Video} 
                subtext="Organic & Paid views"
                trend={22}
              />
              <StatCard 
                title="Engagement Rate" 
                value={`${totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(2) : 0}%`} 
                icon={TrendingUp} 
                subtext="Likes + Shares + Comments"
                trend={-1.2}
              />
            </div>

            {/* CHARTS ROW 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales Mix */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-1 flex flex-col">
                <h3 className="text-slate-800 font-bold mb-1">Product Category Mix</h3>
                <p className="text-xs text-slate-400 mb-4">Breakdown by item type sales volume</p>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categorySalesData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80} 
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={true}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {categorySalesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toLocaleString()} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Engagement Trend */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
                <h3 className="text-slate-800 font-bold mb-4">TikTok Performance Trends</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={engagementTrend} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} dy={10} />
                      <YAxis yAxisId="left" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12, fill: '#64748b'}} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Line 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="plays" 
                        stroke="#8884d8" 
                        strokeWidth={3} 
                        dot={true} 
                        name="Views"
                        activeDot={{ r: 8 }}
                      >
                         <LabelList dataKey="plays" position="top" formatter={(val: number) => (val/1000).toFixed(0) + 'k'} style={{ fill: '#8884d8', fontSize: 10 }} />
                      </Line>
                      <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#82ca9d" strokeWidth={3} name="Interactions" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* TOP PERFORMERS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-800">Top Selling Products</h3>
                  <button className="text-indigo-600 text-xs font-semibold hover:text-indigo-700 uppercase tracking-wider">View All</button>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Product</th>
                        <th className="px-5 py-3 text-right font-semibold">Tag</th>
                        <th className="px-5 py-3 text-right font-semibold">Price</th>
                        <th className="px-5 py-3 text-right font-semibold">Sold</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topProducts.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-200 group-hover:scale-105 transition-transform" />
                              <div className="font-medium text-slate-900 truncate max-w-[150px]">{item.name}</div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right">
                             {item.tag ? (
                               <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 whitespace-normal text-left max-w-[120px]">
                                 {item.tag}
                               </span>
                             ) : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="px-5 py-3 text-right font-mono text-slate-600">
                            {item.price.toLocaleString('id-ID')}
                          </td>
                          <td className="px-5 py-3 text-right text-emerald-600 font-bold">
                            {item.soldLabel}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

               {/* Top Videos */}
               <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="font-bold text-slate-800">Viral Content</h3>
                  <button className="text-indigo-600 text-xs font-semibold hover:text-indigo-700 uppercase tracking-wider">View All</button>
                </div>
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Caption & Tags</th>
                        <th className="px-5 py-3 text-right font-semibold">Plays</th>
                        <th className="px-5 py-3 text-right font-semibold">Likes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {topVideos.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3">
                            <p className="truncate max-w-[250px] font-medium text-slate-700">{item.caption}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                               {item.tags && item.tags.slice(0,2).map((tag, i) => (
                                 <span key={i} className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{tag}</span>
                               ))}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-bold text-slate-800">
                            {(item.plays / 1000).toFixed(1)}K
                          </td>
                          <td className="px-5 py-3 text-right text-rose-500">
                            <div className="flex items-center justify-end gap-1">
                              <Heart className="w-3 h-3 fill-current" />
                              {(item.likes / 1000).toFixed(1)}K
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SHOPEE DETAIL TAB */}
        {activeTab === 'shopee' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <h3 className="text-slate-800 font-bold mb-2">Price vs. Sales Volume Analysis</h3>
                <p className="text-sm text-slate-500 mb-6">Are cheaper bags selling significantly more? (Bubble size = Rating)</p>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" dataKey="price" name="Price" unit=" IDR" tickFormatter={(val) => (val/1000) + 'k'} stroke="#94a3b8" />
                      <YAxis type="number" dataKey="sold" name="Sold" stroke="#94a3b8" />
                      <ZAxis type="number" dataKey="rating" range={[50, 400]} name="Rating" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Scatter name="Products" data={shopeeData} fill="#8884d8">
                         {shopeeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.sold > 5000 ? '#10b981' : '#6366f1'} />
                          ))}
                         <LabelList dataKey="name" position="top" style={{ fontSize: 10, fill: '#64748b' }} formatter={(val: string) => val.split(' ').slice(0, 2).join(' ')} />
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopeeData.map(product => (
                  <div key={product.id} className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4 hover:shadow-md hover:border-indigo-200 transition-all relative group">
                    <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-lg bg-slate-100 group-hover:scale-105 transition-transform" />
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900 line-clamp-2 leading-snug mb-1 pr-6">{product.name}</h4>
                        <div className="text-lg font-bold text-slate-800">Rp {product.price.toLocaleString()}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                         <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">{product.soldLabel} Sold</span>
                         {product.discount && <span className="text-xs text-rose-600 font-medium bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">{product.discount}</span>}
                      </div>
                      {product.tag && (
                          <div className="mt-2 flex items-center gap-1 text-xs font-medium text-orange-700">
                             <Tag className="w-3 h-3 flex-shrink-0" />
                             <span className="whitespace-normal leading-tight">{product.tag}</span>
                          </div>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {product.rating} ★
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* TIKTOK DETAIL TAB */}
        {activeTab === 'tiktok' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="text-slate-800 font-bold mb-4">Content Performance Matrix</h3>
                  <div className="h-96">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={tiktokData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" tickFormatter={formatDate} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                          <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} cursor={{fill: '#f8fafc'}} />
                          <Legend />
                          <Bar 
                            dataKey="likes" 
                            fill="#f43f5e" 
                            stackId="a" 
                            name="Likes" 
                            barSize={32}
                          >
                             <LabelList dataKey="likes" position="top" style={{ fill: '#f43f5e', fontSize: 10, fontWeight: 'bold' }} formatter={(val: number) => val > 1000 ? (val/1000).toFixed(1) + 'k' : val} />
                          </Bar>
                          <Bar dataKey="shares" fill="#8b5cf6" stackId="a" name="Shares" barSize={32} />
                          <Bar dataKey="comments" fill="#0ea5e9" stackId="a" name="Comments" barSize={32} radius={[4, 4, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>
               
               <div className="space-y-4">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                   High Impact Videos
                 </h3>
                 {topVideos.slice(0, 4).map((video, idx) => (
                   <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 relative overflow-hidden group hover:border-indigo-300 transition-all shadow-sm hover:shadow-md cursor-pointer">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                      <div className="pl-3">
                        <p className="text-sm font-medium text-slate-800 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">"{video.caption}"</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                             {video.tags && video.tags.map((tag, i) => (
                               <span key={i} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{tag}</span>
                             ))}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-2">
                           <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {(video.plays/1000).toFixed(1)}K</span>
                           <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-500" /> {video.likes}</span>
                           <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-indigo-500" /> {video.shares}</span>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}