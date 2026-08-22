import { BarChart3, Download, TrendingUp, Globe, FileText, Languages, Mic, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import { DEMO_REPORT, DEMO_HISTORY } from '@/data/demoData';

export default function Reports() {
  const avgScore = DEMO_HISTORY.filter((h) => h.score).reduce((a, h) => a + (h.score ?? 0), 0) / DEMO_HISTORY.filter((h) => h.score).length;

  const monthlyData = [
    { month: 'Mar', value: 45 },
    { month: 'Apr', value: 52 },
    { month: 'May', value: 61 },
    { month: 'Jun', value: 68 },
    { month: 'Jul', value: 74 },
    { month: 'Aug', value: 81 },
  ];

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        title="Reports"
        subtitle="Analytics and insights from your accessibility work."
        icon={BarChart3}
        actions={
          <button className="btn-ghost text-sm">
            <Download size={16} /> Export Report
          </button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        <SummaryCard icon={Globe} label="Sites Analyzed" value="6" />
        <SummaryCard icon={TrendingUp} label="Avg. Score" value={avgScore.toFixed(0)} />
        <SummaryCard icon={FileText} label="Documents" value="4" />
        <SummaryCard icon={Languages} label="Translations" value="12" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Score trend */}
        <SectionCard title="Accessibility Score Trend" icon={<TrendingUp size={18} />} delay={0}>
          <div className="flex items-end justify-between gap-2 h-48 pt-4">
            {monthlyData.map((d, i) => (
              <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(d.value / 100) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-core-700 to-core-400"
                  style={{ minHeight: '4px' }}
                />
                <span className="text-xs text-slate-500">{d.month}</span>
                <span className="text-xs font-medium text-core-300">{d.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Category breakdown */}
        <SectionCard title="Issue Categories" icon={<BarChart3 size={18} />} delay={0.1}>
          <div className="space-y-3">
            {DEMO_REPORT.categories.map((c, i) => {
              const pct = (c.score / c.max) * 100;
              return (
                <div key={c.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-300">{c.name}</span>
                    <span className="text-slate-400">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: i * 0.1 }}
                      className={`h-full rounded-full ${pct >= 75 ? 'bg-success-500' : pct >= 50 ? 'bg-warning-500' : 'bg-danger-500'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* Activity by type */}
        <SectionCard title="Activity by Type" icon={<Calendar size={18} />} delay={0.2}>
          <div className="space-y-3">
            {[
              { icon: Globe, label: 'Website Analysis', count: DEMO_HISTORY.filter((h) => h.type === 'website').length, color: 'text-core-300' },
              { icon: FileText, label: 'Document AI', count: DEMO_HISTORY.filter((h) => h.type === 'document').length, color: 'text-accent-400' },
              { icon: Mic, label: 'Voice Sessions', count: DEMO_HISTORY.filter((h) => h.type === 'voice').length, color: 'text-core-300' },
              { icon: Languages, label: 'Translations', count: DEMO_HISTORY.filter((h) => h.type === 'translation').length, color: 'text-accent-400' },
            ].map((a) => (
              <div key={a.label} className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900/40 p-3">
                <a.icon size={18} className={a.color} />
                <span className="flex-1 text-sm text-slate-300">{a.label}</span>
                <span className="font-display text-lg font-bold text-white">{a.count}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Top issues */}
        <SectionCard title="Most Common Issues" icon={<TrendingUp size={18} />} delay={0.25}>
          <div className="space-y-2">
            {DEMO_REPORT.issues.slice(0, 5).map((issue, i) => (
              <div key={issue.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-ink-900/40 p-3">
                <span className="font-mono text-sm text-slate-600">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{issue.title}</div>
                  <div className="text-xs text-slate-500">{issue.count} occurrences</div>
                </div>
                <span className={`chip ${issue.severity === 'critical' ? 'text-danger-400' : issue.severity === 'serious' ? 'text-warning-400' : 'text-slate-400'}`}>
                  {issue.severity}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof Globe; label: string; value: string }) {
  return (
    <div className="card">
      <Icon size={20} className="text-core-400 mb-2" />
      <div className="font-display text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
