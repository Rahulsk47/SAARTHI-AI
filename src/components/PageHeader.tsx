import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  backTo?: string;
  backLabel?: string;
}

export default function PageHeader({ title, subtitle, icon: Icon, actions, backTo, backLabel }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {backTo && (
        <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-core-300 mb-4 transition">
          ← {backLabel ?? 'Back'}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {Icon && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-core-500/15 border border-core-400/30 text-core-300"
            >
              <Icon size={24} />
            </motion.div>
          )}
          <div>
            <h1 className="font-display text-3xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-muted mt-1 max-w-2xl">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
