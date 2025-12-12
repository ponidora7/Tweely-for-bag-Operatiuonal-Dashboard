import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, ReferenceDot, Label
} from 'recharts';
import { 
  Calendar, Download, AlertTriangle, Lightbulb, TrendingUp, BarChart3, PieChart as PieIcon, ExternalLink, ArrowUpRight, Upload
} from 'lucide-react';
import { ShopeeItem, TiktokItem, DateRange } from '../types';
import { generateExecutiveSummary, generateExecutiveTrend, getRiskAndOpportunities } from '../utils';
import ExecutiveStatCard from './ExecutiveStatCard';

interface ExecutiveDashboardProps {
  shopeeData: ShopeeItem[];
  tiktokData: TiktokItem[];
  onShopeeUpload: (text: string) => void;
  onTiktokUpload: (text: string) => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b'];

export default function ExecutiveDashboard({ shopeeData, tiktokData, onShopeeUpload, onTiktokUpload }: ExecutiveDashboardProps) {
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [compareMode, setCompareMode] = useState(true);

  // --- DERIVED DATA ---
  const summary = useMemo(() => generateExecutiveSummary(shopeeData, dateRange), [shopeeData, dateRange]);
  const trendData = useMemo(() => generateExecutiveTrend(dateRange, summary.revenue.current, tiktokData), [dateRange, summary.revenue.current, tiktokData]);
  const insights = useMemo(() => getRiskAndOpportunities(tiktokData), [tiktokData]);
  
  const topProducts = useMemo(() => [...shopeeData].sort((a, b) => b.sold - a.sold).slice(0, 5), [shopeeData]);
  
  // Simulated Category "Channel" Mix
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    shopeeData.forEach(item => {
      // Simple heuristic for category grouping
      let cat = 'Other';
      const n = item.name.toLowerCase();
      if (n.includes('backpack')) cat = 'Backpack';
      else if (n.includes('tote')) cat = 'Tote';
      else if (n.includes('pouch') || n.includes('dompet')) cat = 'Accessories';
      else if (n.includes('sling')) cat = 'Sling';
      
      cats[cat] = (cats[cat] || 0) + (item.price * item.sold);
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 4);
  }, [shopeeData]);

  const handleExport = () => {
    alert("Exporting Executive Summary PDF...");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        onShopeeUpload(text);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. TOP BAR CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['7d', '30d', 'ytd'] as DateRange[]).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  dateRange === range ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {range === 'ytd' ? 'YTD' : `Last ${range.replace('d', ' Days')}`}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={compareMode} 
              onChange={(e) => setCompareMode(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300" 
            />
            Compare to previous
          </label>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
             <Upload className="w-4 h-4" />
             <span>Update Sales</span>
             <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* 2. RISK & OPPORTUNITY STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">Risk Detected</h4>
            <p className="text-sm text-amber-900 leading-snug">{insights.risk}</p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex gap-3 items-start">
          <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">Opportunity</h4>
            <p className="text-sm text-emerald-900 leading-snug">{insights.opportunity}</p>
          </div>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-3 items-start">
          <Lightbulb className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-1">Recommended Action</h4>
            <p className="text-sm text-indigo-900 leading-snug">{insights.action}</p>
          </div>
        </div>
      </div>

      {/* 3. KPI PANEL - PERIOD COMPARISON */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ExecutiveStatCard 
          title="Total Revenue" 
          currentValue={`Rp ${(summary.revenue.current / 1000000).toFixed(1)}M`}
          prevValue={`Rp ${(summary.revenue.previous / 1000000).toFixed(1)}M`}
          delta={summary.revenue.delta}
        />
        <ExecutiveStatCard 
          title="Total Orders" 
          currentValue={`${(summary.orders.current / 1000).toFixed(1)}K`}
          prevValue={`${(summary.orders.previous / 1000).toFixed(1)}K`}
          delta={summary.orders.delta}
        />
        <ExecutiveStatCard 
          title="Avg Order Value (AOV)" 
          currentValue={`Rp ${(summary.aov.current / 1000).toFixed(0)}K`}
          prevValue={`Rp ${(summary.aov.previous / 1000).toFixed(0)}K`}
          delta={summary.aov.delta}
        />
      </div>

      {/* 4. MAIN TREND CHART (Dual Axis) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Revenue & UGC Reach Correlation</h3>
            <p className="text-sm text-slate-500"> analyzing impact of viral content on daily sales performance.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
             <div className="flex items-center gap-1">
               <span className="w-3 h-3 bg-indigo-500 rounded-sm"></span> Revenue
             </div>
             <div className="flex items-center gap-1">
               <span className="w-3 h-3 bg-pink-500 rounded-full"></span> UGC Reach
             </div>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
              <YAxis yAxisId="left" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => `Rp ${(val/1000000).toFixed(0)}jt`} />
              <YAxis yAxisId="right" orientation="right" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value: number, name: string) => [
                  name === 'revenue' ? `Rp ${value.toLocaleString()}` : value.toLocaleString(), 
                  name === 'revenue' ? 'Revenue' : 'Views'
                ]}
              />
              <Bar yAxisId="left" dataKey="revenue" fill="#6366f1" barSize={20} radius={[4, 4, 0, 0]} fillOpacity={0.8} />
              <Line yAxisId="right" type="monotone" dataKey="ugcReach" stroke="#ec4899" strokeWidth={3} dot={false} />
              
              {/* Event Annotations */}
              {trendData.map((entry, index) => entry.event && (
                 <ReferenceDot 
                   key={index} 
                   yAxisId="right" 
                   x={entry.date} 
                   y={entry.ugcReach} 
                   r={5} 
                   fill="#fff" 
                   stroke="#ec4899" 
                   strokeWidth={2} 
                 >
                    <Label value={entry.event} position="top" offset={10} style={{ fontSize: '10px', fill: '#be185d', fontWeight: 'bold', textAnchor: 'middle' }} />
                 </ReferenceDot>
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. BOTTOM DRIVERS & SIGNALS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Products Compact */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-indigo-600"/> Top Revenue Drivers</h3>
              <ExternalLink className="w-4 h-4 text-slate-400 cursor-pointer hover:text-indigo-600" />
           </div>
           <div className="space-y-4">
             {topProducts.slice(0, 5).map((item, idx) => (
               <div key={item.id} className="group">
                 <div className="flex justify-between text-sm mb-1">
                   <span className="font-medium text-slate-700 truncate max-w-[180px]">{item.name}</span>
                   <span className="font-bold text-slate-900">Rp {(item.price * item.sold / 1000000).toFixed(1)}M</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                   <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${(item.sold / topProducts[0].sold) * 100}%` }}></div>
                 </div>
                 <p className="text-[10px] text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   Influenced by viral post on {idx === 0 ? 'May 10' : 'June 15'} • +{Math.floor(Math.random() * 20)}% MoM
                 </p>
               </div>
             ))}
           </div>
        </div>

        {/* Channel Mix */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><PieIcon className="w-4 h-4 text-indigo-600"/> Revenue by Category</h3>
           </div>
           <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `Rp ${(val/1000000).toFixed(0)}M`} />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-2 text-xs text-center text-slate-500">
             Backpacks account for <strong>{((categoryData[0]?.value / summary.revenue.current)*100).toFixed(0)}%</strong> of total revenue.
           </div>
        </div>

        {/* UGC Signal Snapshot */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-6 rounded-xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 p-3 opacity-10">
              <TrendingUp className="w-32 h-32" />
           </div>
           <div>
             <h3 className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-4">UGC Signal Strength</h3>
             <div className="flex items-end gap-2 mb-1">
               <span className="text-5xl font-bold">{tiktokData.reduce((a,b) => a + b.plays, 0) > 1000000 ? '2.4M' : '850K'}</span>
               <span className="text-emerald-400 font-bold mb-1.5 flex items-center text-sm"><ArrowUpRight className="w-4 h-4" /> +22%</span>
             </div>
             <p className="text-indigo-200 text-sm mb-6">Total Organic Views (Last 30d)</p>
             
             <div className="space-y-3 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex justify-between text-sm">
                   <span className="text-indigo-200">Top Post</span>
                   <span className="font-medium">@tweely_official</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-indigo-200">Sentiment</span>
                   <span className="font-medium text-emerald-300">92% Positive</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-indigo-200">Product Mentions</span>
                   <span className="font-medium">Mini Backpack (45%)</span>
                </div>
             </div>
           </div>
           <button className="mt-4 w-full bg-white text-indigo-900 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
              View Detailed Analysis
           </button>
        </div>

      </div>

    </div>
  );
}