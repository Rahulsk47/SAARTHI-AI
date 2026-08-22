import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Globe,
  FileText,
  Mic,
  Languages,
  Sparkles,
  Settings2,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import SaarthiCore from '@/components/SaarthiCore';
import SectionCard from '@/components/SectionCard';
import { DEMO_HISTORY } from '@/data/demoData';

const QUICK_ACTIONS = [
  { icon: Globe, title: 'Analyze Website', desc: 'Check any URL for accessibility', to: '/analyzer', color: 'text-core-300' },
  { icon: FileText, title: 'Document AI', desc: 'Simplify & translate documents', to: '/document-ai', color: 'text-accent-400' },
  { icon: Mic, title: 'Voice Assistant', desc: 'Ask questions by voice', to: '/voice', color: 'text-core-300' },
  { icon: Languages, title: 'Language Assistant', desc: 'Translate across 8 languages', to: '/language', color: 'text-accent-400' },
  { icon: Sparkles, title: 'Accessible View', desc: 'Transform complex sites', to: '/accessible-view', color: 'text-core-300' },
  { icon: Settings2, title: 'Accessibility', desc: 'Personalize your experience', to: '/accessibility', color: 'text-accent-400' },
];

export default function Dashboard() {
  return (
    <div className="px-6 py-8 md:px-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-white">Welcome back</h1>
        <p className="text-muted mt-1">Your AI accessibility command center.</p>
      </motion.div>

      {/* Hero band with Core */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
        <SectionCard className="lg:col-span-2 flex flex-col justify-between" delay={0}>
          <div>
            <div className="flex items-center gap-2 text-core-300 mb-2">
              <TrendingUp size={18} />
              <span className="text-sm font-medium">This Week</span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-white">
              6 analyses completed · 34 issues resolved
            </h2>
            <p className="text-muted mt-2">
              You've improved accessibility scores by an average of 34 points across analyzed sites.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <Stat label="Sites Analyzed" value="6" icon={Globe} />
            <Stat label="Docs Processed" value="4" icon={FileText} />
            <Stat label="Translations" value="12" icon={Languages} />
          </div>
        </SectionCard>

        <SectionCard className="flex flex-col items-center justify-center" delay={0.1}>
          <SaarthiCore state="idle" size={200} showStars={false} />
          <div className="mt-4 text-center">
            <div className="font-display text-lg font-semibold text-white">SAARTHI Core</div>
            <div className="text-sm text-slate-500">Idle · Ready to assist</div>
          </div>
        </SectionCard>
      </div>

      {/* Quick actions */}
      <h2 className="section-title mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {QUICK_ACTIONS.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link
              to={a.to}
              className="group flex items-center gap-4 card hover:border-core-400/40 hover:bg-ink-700/60 transition-all"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 ${a.color} group-hover:scale-110 transition-transform`}>
                <a.icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white">{a.title}</h3>
                <p className="text-sm text-slate-400 truncate">{a.desc}</p>
              </div>
              <ArrowRight size={18} className="text-slate-500 group-hover:text-core-300 transition" />
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Recent Activity" icon={<Clock size={18} />} delay={0}>
          <div className="space-y-3">
            {DEMO_HISTORY.slice(0, 5).map((h) => (
              <div key={h.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900/40 p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-core-500/10 text-core-300">
                  {h.type === 'website' && <Globe size={16} />}
                  {h.type === 'document' && <FileText size={16} />}
                  {h.type === 'voice' && <Mic size={16} />}
                  {h.type === 'translation' && <Languages size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{h.title}</div>
                  <div className="text-xs text-slate-500">{h.detail}</div>
                </div>
                {h.score && (
                  <span className={`chip ${h.score >= 80 ? 'text-success-400' : h.score >= 60 ? 'text-warning-400' : 'text-danger-400'}`}>
                    {h.score}
                  </span>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Accessibility Health" icon={<CheckCircle2 size={18} />} delay={0.1}>
          <div className="space-y-4">
            <HealthBar label="Color Contrast" value={72} />
            <HealthBar label="Keyboard Nav" value={85} />
            <HealthBar label="Alt Text" value={48} warning />
            <HealthBar label="Form Labels" value={91} />
            <HealthBar label="Heading Structure" value={67} />
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-warning-500/20 bg-warning-500/5 p-3 text-sm text-warning-400">
              <AlertTriangle size={16} />
              Alt text coverage needs attention across analyzed sites.
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Globe }) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-900/40 p-4">
      <Icon size={18} className="text-core-400 mb-2" />
      <div className="font-display text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function HealthBar({ label, value, warning }: { label: string; value: number; warning?: boolean }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className={warning ? 'text-warning-400' : 'text-slate-400'}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8 }}
          className={`h-full rounded-full ${warning ? 'bg-warning-500' : 'bg-core-500'}`}
        />
      </div>
    </div>
  );
}
