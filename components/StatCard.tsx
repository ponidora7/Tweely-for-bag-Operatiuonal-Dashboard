import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, icon: Icon, trend }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-indigo-50 rounded-lg">
        <Icon className="w-6 h-6 text-indigo-600" />
      </div>
      {trend && (
        <span className={`flex items-center text-sm font-medium ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend > 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <div className="text-2xl font-bold text-slate-900">{value}</div>
    {subtext && <p className="text-slate-400 text-xs mt-2">{subtext}</p>}
  </div>
);

export default StatCard;