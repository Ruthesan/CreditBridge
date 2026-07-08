import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import type { MonthlySummary } from '../../types';
import { formatCompactNaira } from '../../lib/utils';

function CashFlowTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-white px-3.5 py-2.5 shadow-soft">
      <p className="text-xs font-semibold text-ink-secondary">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="stat-font text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {formatCompactNaira(p.value)}
        </p>
      ))}
    </div>
  );
}

export function CashFlowChart({ data }: { data: MonthlySummary[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => formatCompactNaira(v)} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={56} />
        <Tooltip content={<CashFlowTooltip />} cursor={{ fill: 'rgba(79,70,229,0.05)' }} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#6B7280' }} />
        <Bar dataKey="total_credits" name="Credits" fill="#10B981" radius={[6, 6, 0, 0]} animationDuration={900} />
        <Bar dataKey="total_debits" name="Debits" fill="#EF4444" radius={[6, 6, 0, 0]} animationDuration={900} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RevenueTrendChart({ data }: { data: MonthlySummary[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => formatCompactNaira(v)} tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} width={56} />
        <Tooltip content={<CashFlowTooltip />} />
        <Line
          type="monotone"
          dataKey="net_flow"
          name="Net flow"
          stroke="#7C3AED"
          strokeWidth={2.5}
          dot={{ r: 3, fill: '#7C3AED' }}
          activeDot={{ r: 5 }}
          animationDuration={900}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
