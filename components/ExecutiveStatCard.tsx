import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface ExecutiveStatCardProps {
  title: string;
  currentValue: string;
  prevValue: string;
  delta: number;
  isCurrency?: boolean;
}

const ExecutiveStatCard: React.FC<ExecutiveStatCardProps> = ({ title, currentValue, prevValue, delta }) => {
  const isPositive = delta >= 0;

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative group hover:border-indigo-300 transition-colors cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</h3>
        <Info className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-3xl font-bold text-slate-900">{currentValue}</span>
      </div>
      <div className="flex items-center mt-3 text-sm">
        <div className={`flex items-center font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'} bg-opacity-10 px-1.5 py-0.5 rounded`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
          {Math.abs(delta).toFixed(1)}%
        </div>
        <span className="text-slate-400 ml-2 text-xs">vs. previous period ({prevValue})</span>
      </div>
    </div>
  );
};

export default ExecutiveStatCard;