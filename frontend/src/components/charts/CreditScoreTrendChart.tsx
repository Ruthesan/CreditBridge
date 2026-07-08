import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { ScoreHistoryPoint } from '../../hooks/useScoreHistory';

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-white px-3.5 py-2.5 shadow-soft">
      <p className="text-xs font-semibold text-ink-secondary">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="stat-font text-sm font-semibold text-ink">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export function CreditScoreTrendChart({ data }: { data: ScoreHistoryPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreTrend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} width={32} />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="averageScore"
          name="Avg. score"
          stroke="#4F46E5"
          strokeWidth={2.5}
          fill="url(#scoreTrend)"
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
