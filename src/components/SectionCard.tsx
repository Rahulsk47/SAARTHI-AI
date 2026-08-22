import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SectionCardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function SectionCard({ title, icon, children, className = '', delay = 0 }: SectionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`card ${className}`}
    >
      {title && (
        <div className="mb-4 flex items-center gap-2 text-core-300">
          {icon}
          <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
        </div>
      )}
      {children}
    </motion.div>
  );
}
