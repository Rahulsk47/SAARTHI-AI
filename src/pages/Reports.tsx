import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  FileText,
  Globe,
  Languages,
  Loader2,
  Mic,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import {
  getAnalyses,
  getIssues,
  getRecentActivity,
  type ActivityLog,
  type WebsiteAnalysis,
  type WebsiteIssue,
} from '@/lib/data';

export default function Reports() {
  const [analyses, setAnalyses] = useState<WebsiteAnalysis[]>([]);
  const [issues, setIssues] = useState<WebsiteIssue[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAnalyses(),
      getIssues(),
      getRecentActivity(100),
    ])
      .then(([savedAnalyses, savedIssues, savedActivity]) => {
        setAnalyses(savedAnalyses);
        setIssues(savedIssues);
        setActivity(savedActivity);
      })
      .catch((error) => {
        console.error('Failed to load reports:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const averageScore = analyses.length
    ? analyses.reduce((sum, item) => sum + item.score, 0) /
      analyses.length
    : 0;

  const categories = useMemo(() => {
    const totals = issues.reduce<Record<string, number>>(
      (all, issue) => {
        const category = issue.category || 'Other';

        return {
          ...all,
          [category]: (all[category] ?? 0) + issue.count,
        };
      },
      {},
    );

    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [issues]);

  const commonIssues = useMemo(() => {
    const grouped = issues.reduce<Record<string, WebsiteIssue>>(
      (all, issue) => {
        const existing = all[issue.title];

        return {
          ...all,
          [issue.title]: existing
            ? {
                ...existing,
                count: existing.count + issue.count,
              }
            : issue,
        };
      },
      {},
    );

    return Object.values(grouped)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [issues]);

  const countActivity = (type: string) =>
    activity.filter((item) => item.type === type).length;

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        title="Reports"
        subtitle="Analytics and insights from your saved accessibility work."
        icon={BarChart3}
        actions={
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => window.print()}
          >
            <Download size={16} />
            Export Report
          </button>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-core-400" />
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCard
              icon={Globe}
              label="Sites Analyzed"
              value={analyses.length}
            />
            <SummaryCard
              icon={TrendingUp}
              label="Avg. Score"
              value={averageScore.toFixed(0)}
            />
            <SummaryCard
              icon={FileText}
              label="Documents"
              value={countActivity('document')}
            />
            <SummaryCard
              icon={Languages}
              label="Translations"
              value={countActivity('translation')}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SectionCard
              title="Accessibility Score Trend"
              icon={<TrendingUp size={18} />}
              delay={0}
            >
              <div className="flex h-48 items-end gap-2 pt-4">
                {analyses.length ? (
                  analyses.slice(-8).map((analysis, index) => (
                    <div
                      key={analysis.id}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${analysis.score}%` }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.08,
                        }}
                        className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-core-700 to-core-400"
                        style={{ minHeight: '4px' }}
                      />
                      <span className="text-xs font-medium text-core-300">
                        {analysis.score}
                      </span>
                    </div>
                  ))
                ) : (
                  <Empty />
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Issue Categories"
              icon={<BarChart3 size={18} />}
              delay={0.1}
            >
              <div className="space-y-3">
                {categories.length ? (
                  categories.slice(0, 6).map(([name, count]) => {
                    const highestCount = categories[0][1];
                    const percentage = highestCount
                      ? (count / highestCount) * 100
                      : 0;

                    return (
                      <div key={name}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-slate-300">{name}</span>
                          <span className="text-slate-400">{count}</span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-core-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <Empty />
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="Activity by Type"
              icon={<Calendar size={18} />}
              delay={0.2}
            >
              <div className="space-y-3">
                <ActivityRow
                  icon={Globe}
                  label="Website Analysis"
                  count={countActivity('website')}
                  color="text-core-300"
                />
                <ActivityRow
                  icon={FileText}
                  label="Document AI"
                  count={countActivity('document')}
                  color="text-accent-400"
                />
                <ActivityRow
                  icon={Mic}
                  label="Voice Sessions"
                  count={countActivity('voice')}
                  color="text-core-300"
                />
                <ActivityRow
                  icon={Languages}
                  label="Translations"
                  count={countActivity('translation')}
                  color="text-accent-400"
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Most Common Issues"
              icon={<TrendingUp size={18} />}
              delay={0.25}
            >
              <div className="space-y-2">
                {commonIssues.length ? (
                  commonIssues.map((issue, index) => (
                    <div
                      key={issue.title}
                      className="flex items-center gap-3 rounded-lg border border-white/5 bg-ink-900/40 p-3"
                    >
                      <span className="font-mono text-sm text-slate-600">
                        {index + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm text-white">
                          {issue.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {issue.count} occurrences
                        </div>
                      </div>

                      <span className="chip text-warning-400">
                        {issue.severity}
                      </span>
                    </div>
                  ))
                ) : (
                  <Empty />
                )}
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="card">
      <Icon size={20} className="mb-2 text-core-400" />
      <div className="font-display text-2xl font-bold text-white">
        {value}
      </div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function ActivityRow({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: LucideIcon;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900/40 p-3">
      <Icon size={18} className={color} />
      <span className="flex-1 text-sm text-slate-300">{label}</span>
      <span className="font-display text-lg font-bold text-white">
        {count}
      </span>
    </div>
  );
}

function Empty() {
  return (
    <p className="py-6 text-center text-sm text-slate-500">
      No saved data yet.
    </p>
  );
}