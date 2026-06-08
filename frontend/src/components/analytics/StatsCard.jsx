import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ label, value, sub, trend, icon: Icon, color = 'brand' }) {
  const colors = {
    brand:  { bg: 'bg-brand-50',   icon: 'text-brand-700'   },
    green:  { bg: 'bg-emerald-50', icon: 'text-emerald-700' },
    yellow: { bg: 'bg-amber-50',   icon: 'text-amber-700'   },
    red:    { bg: 'bg-red-50',     icon: 'text-red-700'     },
  };

  const c = colors[color] || colors.brand;

  return (
    <div className="card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink-500">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-2xl ${c.bg} flex items-center justify-center`}>
            <Icon size={16} className={c.icon} />
          </div>
        )}
      </div>

      <div>
        <p className="font-display text-3xl font-bold text-ink-900 tabular-nums">{value}</p>
        {sub && <p className="text-xs text-ink-500 mt-0.5">{sub}</p>}
      </div>

      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium
          ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}% vs last month
        </div>
      )}
    </div>
  );
}
