import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ label, value, sub, trend, icon: Icon, color = 'brand' }) {
  const colors = {
    brand:  { bg: 'bg-brand-50',  icon: 'text-brand-600'  },
    green:  { bg: 'bg-green-50',  icon: 'text-green-600'  },
    yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600' },
    red:    { bg: 'bg-red-50',    icon: 'text-red-500'    },
  };

  const c = colors[color] || colors.brand;

  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-500">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
            <Icon size={16} className={c.icon} />
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl font-semibold text-ink-900">{value}</p>
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