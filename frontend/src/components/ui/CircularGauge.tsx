import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * The signature visual motif of CreditBridge: a radial score gauge with a
 * royal-blue-to-purple gradient arc, used on the dashboard, the analysis
 * page, and lender comparison cards so a business's standing is always
 * legible at a glance without reading a single number.
 */
export function CircularGauge({
  value,
  size = 160,
  strokeWidth = 12,
  label,
  sublabel,
  gradientId = 'gauge-gradient',
}: {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  gradientId?: string;
}) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedValue / 100) * circumference;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimatedValue(clamped));
    return () => cancelAnimationFrame(raf);
  }, [clamped]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#F1F2F6"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={cn('stat-font font-bold text-ink', size >= 140 ? 'text-4xl' : 'text-2xl')}
        >
          {Math.round(animatedValue)}
        </motion.span>
        {label && <span className="text-xs font-medium text-ink-secondary mt-0.5">{label}</span>}
        {sublabel && <span className="text-[11px] text-ink-secondary/70">{sublabel}</span>}
      </div>
    </div>
  );
}

/** Compact ring used inline in cards and tables where a full gauge would be too heavy. */
export function MiniRing({ value, size = 44 }: { value: number; size?: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#F1F2F6" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#4F46E5"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <span className="absolute stat-font text-[11px] font-bold text-ink">{Math.round(clamped)}</span>
    </div>
  );
}
