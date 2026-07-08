import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Sparkles, Landmark, FileDown } from 'lucide-react';
import { Button } from '../ui/Button';

export function WelcomeHero({ businessName }: { businessName: string }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-secondary p-6 sm:p-8"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-primary-100">{greeting},</p>
      <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">{businessName}</h1>
      <p className="mt-2 max-w-xl text-sm text-primary-100">
        Here's your latest credit readiness overview.
      </p>
    </motion.div>
  );
}

const ACTIONS = [
  { label: 'Upload documents', icon: UploadCloud, path: '/app/upload' },
  { label: 'View analysis', icon: Sparkles, path: '/app/analysis' },
  { label: 'Compare lenders', icon: Landmark, path: '/app/lenders' },
  { label: 'Download report', icon: FileDown, path: '/app/reports' },
];

export function QuickActions() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ACTIONS.map((a, i) => (
        <motion.div key={a.path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
          <Button variant="outline" fullWidth className="h-auto flex-col gap-2 py-4" onClick={() => navigate(a.path)}>
            <a.icon size={20} className="text-primary" />
            <span className="text-xs font-semibold">{a.label}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
