import {
  BarChart3,
  Download,
  TrendingUp,
  Globe,
  FileText,
  Languages,
  Mic,
  Calendar,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import { DEMO_REPORT, DEMO_HISTORY } from '@/data/demoData';

export default function Reports() {
  // --------------------------------------------------
  // Safe data handling
  // --------------------------------------------------

  const history = Array.isArray(DEMO_HISTORY)
    ? DEMO_HISTORY
    : [];

  const categories = Array.isArray(DEMO_REPORT?.categories)
    ? DEMO_REPORT.categories
    : [];

  const issues = Array.isArray(DEMO_REPORT?.issues)
    ? DEMO_REPORT.issues
    : [];

  // --------------------------------------------------
  // Average score
  // --------------------------------------------------

  const scoredHistory = history.filter(
    (item) => typeof item?.score === 'number'
  );

  const avgScore =
    scoredHistory.length > 0
      ? scoredHistory.reduce(
          (total, item) => total + Number(item.score),
          0
        ) / scoredHistory.length
      : 0;

  // --------------------------------------------------
  // Activity counts
  // --------------------------------------------------

  const websiteCount = history.filter(
    (item) => item?.type === 'website'
  ).length;

  const documentCount = history.filter(
    (item) => item?.type === 'document'
  ).length;

  const voiceCount = history.filter(
    (item) => item?.type === 'voice'
  ).length;

  const translationCount = history.filter(
    (item) => item?.type === 'translation'
  ).length;

  // --------------------------------------------------
  // Monthly chart data
  // --------------------------------------------------

  const monthlyData = [
    { month: 'Mar', value: 45 },
    { month: 'Apr', value: 52 },
    { month: 'May', value: 61 },
    { month: 'Jun', value: 68 },
    { month: 'Jul', value: 74 },
    { month: 'Aug', value: 81 },
  ];

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        title="Reports"
        subtitle="Analytics and insights from your accessibility work."
        icon={BarChart3}
        actions={
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={() => window.print()}
          >
            <Download size={16} />
            <span>Export Report</span>
          </button>
        }
      />

      {/* ==================================================
          SUMMARY CARDS
      ================================================== */}

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard
          icon={Globe}
          label="Sites Analyzed"
          value="6"
        />

        <SummaryCard
          icon={TrendingUp}
          label="Avg. Score"
          value={avgScore.toFixed(0)}
        />

        <SummaryCard
          icon={FileText}
          label="Documents"
          value="4"
        />

        <SummaryCard
          icon={Languages}
          label="Translations"
          value="12"
        />
      </div>

      {/* ==================================================
          REPORT GRID
      ================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ==================================================
            ACCESSIBILITY SCORE TREND
        ================================================== */}

        <SectionCard
          title="Accessibility Score Trend"
          icon={<TrendingUp size={18} />}
          delay={0}
        >
          <div className="flex h-48 items-end justify-between gap-2 pt-4">
            {monthlyData.map((item, index) => (
              <div
                key={item.month}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{
                    height: `${item.value}%`,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                  }}
                  className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-core-700 to-core-400"
                  style={{
                    minHeight: '4px',
                  }}
                />

                <span className="text-xs text-slate-500">
                  {item.month}
                </span>

                <span className="text-xs font-medium text-core-300">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ==================================================
            ISSUE CATEGORIES
        ================================================== */}

        <SectionCard
          title="Issue Categories"
          icon={<BarChart3 size={18} />}
          delay={0.1}
        >
          <div className="space-y-3">
            {categories.map((category, index) => {
              const max = Number(category?.max ?? 0);
              const score = Number(category?.score ?? 0);

              const percentage =
                max > 0
                  ? Math.min((score / max) * 100, 100)
                  : 0;

              let barColor = 'bg-danger-500';

              if (percentage >= 75) {
                barColor = 'bg-success-500';
              } else if (percentage >= 50) {
                barColor = 'bg-warning-500';
              }

              return (
                <div
                  key={
                    category?.name ??
                    `category-${index}`
                  }
                >
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-300">
                      {category?.name ?? 'Unknown'}
                    </span>

                    <span className="text-slate-400">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${percentage}%`,
                      }}
                      transition={{
                        duration: 0.7,
                        delay: index * 0.1,
                      }}
                      className={`h-full rounded-full ${barColor}`}
                    />
                  </div>
                </div>
              );
            })}

            {categories.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">
                No issue category data available.
              </p>
            )}
          </div>
        </SectionCard>

        {/* ==================================================
            ACTIVITY BY TYPE
        ================================================== */}

        <SectionCard
          title="Activity by Type"
          icon={<Calendar size={18} />}
          delay={0.2}
        >
          <div className="space-y-3">

            <ActivityRow
              icon={Globe}
              label="Website Analysis"
              count={websiteCount}
              color="text-core-300"
            />

            <ActivityRow
              icon={FileText}
              label="Document AI"
              count={documentCount}
              color="text-accent-400"
            />

            <ActivityRow
              icon={Mic}
              label="Voice Sessions"
              count={voiceCount}
              color="text-core-300"
            />

            <ActivityRow
              icon={Languages}
              label="Translations"
              count={translationCount}
              color="text-accent-400"
            />

          </div>
        </SectionCard>

        {/* ==================================================
            MOST COMMON ISSUES
        ================================================== */}

        <SectionCard
          title="Most Common Issues"
          icon={<TrendingUp size={18} />}
          delay={0.25}
        >
          <div className="space-y-2">

            {issues.slice(0, 5).map((issue, index) => (
              <div
                key={
                  issue?.id ??
                  `issue-${index}`
                }
                className="flex items-center gap-3 rounded-lg border border-white/5 bg-ink-900/40 p-3"
              >
                {/* Rank */}

                <span className="font-mono text-sm text-slate-600">
                  {index + 1}
                </span>

                {/* Issue information */}

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-white">
                    {issue?.title ?? 'Unknown issue'}
                  </div>

                  <div className="text-xs text-slate-500">
                    {issue?.count ?? 0} occurrences
                  </div>
                </div>

                {/* Severity */}

                <span
                  className={`chip ${
                    issue?.severity === 'critical'
                      ? 'text-danger-400'
                      : issue?.severity === 'serious'
                        ? 'text-warning-400'
                        : 'text-slate-400'
                  }`}
                >
                  {issue?.severity ?? 'unknown'}
                </span>
              </div>
            ))}

            {issues.length === 0 && (
              <p className="py-6 text-center text-sm text-slate-500">
                No issue data available.
              </p>
            )}

          </div>
        </SectionCard>

      </div>
    </div>
  );
}

/* ======================================================
   SUMMARY CARD COMPONENT
====================================================== */

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="card">
      <Icon
        size={20}
        className="mb-2 text-core-400"
      />

      <div className="font-display text-2xl font-bold text-white">
        {value}
      </div>

      <div className="text-xs text-slate-500">
        {label}
      </div>
    </div>
  );
}

/* ======================================================
   ACTIVITY ROW COMPONENT
====================================================== */

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
      <Icon
        size={18}
        className={color}
      />

      <span className="flex-1 text-sm text-slate-300">
        {label}
      </span>

      <span className="font-display text-lg font-bold text-white">
        {count}
      </span>
    </div>
  );
}