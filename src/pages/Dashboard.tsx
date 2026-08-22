import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Languages,
  Loader2,
  Mic,
  Settings2,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import SaarthiCore from '@/components/SaarthiCore';
import SectionCard from '@/components/SectionCard';
import {
  getDashboardMetrics,
  type ActivityLog,
} from '@/lib/data';

const actions = [
  {
    icon: Globe,
    title: 'Analyze Website',
    desc: 'Check any URL for accessibility',
    to: '/analyzer',
    color: 'text-core-300',
  },
  {
    icon: FileText,
    title: 'Document AI',
    desc: 'Simplify and translate documents',
    to: '/document-ai',
    color: 'text-accent-400',
  },
  {
    icon: Mic,
    title: 'Voice Assistant',
    desc: 'Ask questions by voice',
    to: '/voice',
    color: 'text-core-300',
  },
  {
    icon: Languages,
    title: 'Language Assistant',
    desc: 'Translate across 8 languages',
    to: '/language',
    color: 'text-accent-400',
  },
  {
    icon: Sparkles,
    title: 'Accessible View',
    desc: 'Transform complex sites',
    to: '/accessible-view',
    color: 'text-core-300',
  },
  {
    icon: Settings2,
    title: 'Accessibility',
    desc: 'Personalize your experience',
    to: '/accessibility',
    color: 'text-accent-400',
  },
];

const icons: Record<string, LucideIcon> = {
  website: Globe,
  document: FileText,
  voice: Mic,
  translation: Languages,
};

export default function Dashboard() {
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [metrics, setMetrics] = useState({
    analyses: 0,
    documents: 0,
    translations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardMetrics()
      .then(({ activity: logs, ...counts }) => {
        setActivity(logs);
        setMetrics(counts);
      })
      .catch((error) => {
        console.error('Failed to load dashboard:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="px-6 py-8 md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-white">
          Welcome back
        </h1>
        <p className="mt-1 text-muted">
          Your AI accessibility command center.
        </p>
      </motion.div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          className="flex flex-col justify-between lg:col-span-2"
          delay={0}
        >
          <div>
            <div className="mb-2 flex items-center gap-2 text-core-300">
              <TrendingUp size={18} />
              <span className="text-sm font-medium">Your progress</span>
            </div>

            <h2 className="font-display text-2xl font-semibold text-white">
              {metrics.analyses} analyses completed
            </h2>

            <p className="mt-2 text-muted">
              Your saved accessibility work is private to your account.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <Stat
              label="Sites Analyzed"
              value={metrics.analyses}
              icon={Globe}
            />
            <Stat
              label="Docs Processed"
              value={metrics.documents}
              icon={FileText}
            />
            <Stat
              label="Translations"
              value={metrics.translations}
              icon={Languages}
            />
          </div>
        </SectionCard>

        <SectionCard
          className="flex flex-col items-center justify-center"
          delay={0.1}
        >
          <SaarthiCore
            state="idle"
            size={200}
            showStars={false}
          />

          <div className="mt-4 text-center">
            <div className="font-display text-lg font-semibold text-white">
              SAARTHI Core
            </div>
            <div className="text-sm text-slate-500">
              Idle · Ready to assist
            </div>
          </div>
        </SectionCard>
      </div>

      <h2 className="mb-4 section-title">Quick Actions</h2>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((item, index) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <Link
                to={item.to}
                className="group card flex items-center gap-4 transition-all hover:border-core-400/40 hover:bg-ink-700/60"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-transform group-hover:scale-110 ${item.color}`}
                >
                  <Icon size={22} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-white">{item.title}</h3>
                  <p className="truncate text-sm text-slate-400">
                    {item.desc}
                  </p>
                </div>

                <ArrowRight
                  size={18}
                  className="text-slate-500 transition group-hover:text-core-300"
                />
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Recent Activity"
          icon={<Clock size={18} />}
          delay={0}
        >
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-core-300" />
            </div>
          ) : (
            <div className="space-y-3">
              {activity.length ? (
                activity.map((item) => {
                  const Icon = icons[item.type] ?? Globe;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900/40 p-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-core-500/10 text-core-300">
                        <Icon size={16} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-white">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.detail}
                        </div>
                      </div>

                      {item.score !== null && (
                        <span className="chip text-core-300">
                          {item.score}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="py-6 text-center text-sm text-slate-500">
                  No activity yet. Start by analyzing a website.
                </p>
              )}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Data Status"
          icon={<CheckCircle2 size={18} />}
          delay={0.1}
        >
          <p className="text-sm text-slate-400">
            This dashboard now reads your saved Supabase data.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-900/40 p-4">
      <Icon size={18} className="mb-2 text-core-400" />
      <div className="font-display text-2xl font-bold text-white">
        {value}
      </div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}