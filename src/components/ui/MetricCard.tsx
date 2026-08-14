import React from 'react';
import { GlassCard } from './GlassCard';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  accentColor?: 'cyan' | 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
  id?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'blue',
  id
}) => {
  const accentStyles = {
    cyan: 'text-cyan-800 bg-cyan-50 border-cyan-200',
    blue: 'text-[#1e40af] bg-blue-50 border-blue-200',
    emerald: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    amber: 'text-amber-800 bg-amber-50 border-amber-200',
    rose: 'text-rose-800 bg-rose-50 border-rose-200',
    purple: 'text-purple-800 bg-purple-50 border-purple-200'
  }[accentColor];

  return (
    <GlassCard id={id} className="p-5 sm:p-6 relative overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base sm:text-lg font-semibold text-[#172033] tracking-tight">{title}</h4>
          <p className="text-2xl sm:text-3xl font-bold text-[#172033] mt-2 tracking-tight">{value}</p>
          {subtitle && <p className="text-sm text-[#5b6472] mt-1 font-medium">{subtitle}</p>}
        </div>

        <div className={`p-3 rounded-lg border shrink-0 ${accentStyles}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center space-x-2 text-sm">
          <span className={`font-semibold ${trend.positive ? 'text-emerald-700' : 'text-amber-700'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-[#5b6472]">vs last period</span>
        </div>
      )}
    </GlassCard>
  );
};
