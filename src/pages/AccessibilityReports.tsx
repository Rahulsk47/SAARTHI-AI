import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Globe,
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import { DEMO_REPORT, type Severity, type AccessibilityIssue } from '@/data/demoData';

const SEVERITY_META: Record<Severity, { label: string; color: string; bg: string; icon: typeof AlertTriangle }> = {
  critical: { label: 'Critical', color: 'text-danger-400', bg: 'bg-danger-500/10 border-danger-500/30', icon: AlertCircle },
  serious: { label: 'Serious', color: 'text-warning-400', bg: 'bg-warning-500/10 border-warning-500/30', icon: AlertTriangle },
  moderate: { label: 'Moderate', color: 'text-accent-400', bg: 'bg-accent-500/10 border-accent-500/30', icon: Info },
  minor: { label: 'Minor', color: 'text-slate-400', bg: 'bg-white/5 border-white/10', icon: Info },
};

export default function AccessibilityResults() {
  const [expanded, setExpanded] = useState<string | null>(DEMO_REPORT.issues[0]?.id ?? null);
  const score = DEMO_REPORT.score;
  const scoreColor = score >= 80 ? 'text-success-400' : score >= 60 ? 'text-warning-400' : 'text-danger-400';
  const scoreBg = score >= 80 ? 'stroke-success-500' : score >= 60 ? 'stroke-warning-500' : 'stroke-danger-500';

  const counts = DEMO_REPORT.issues.reduce(
    (acc, i) => {
      acc[i.severity] = (acc[i.severity] ?? 0) + 1;
      return acc;
    },
    {} as Record<Severity, number>,
  );

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        title="Accessibility Results"
        subtitle={`Analysis of ${DEMO_REPORT.url}`}
        icon={Globe}
        backTo="/analyzer"
        backLabel="Back to Analyzer"
        actions={
          <Link to="/accessible-view" className="btn-primary">
            <Sparkles size={16} /> Transform to Accessible View
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        {/* Score gauge */}
        <SectionCard className="flex flex-col items-center justify-center" delay={0}>
          <div className="relative h-44 w-44">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                className={scoreBg}
                strokeDasharray={2 * Math.PI * 52}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - score / 100) }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`font-display text-5xl font-bold ${scoreColor}`}>{score}</span>
              <span className="text-xs text-slate-500">/ 100</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className={`font-medium ${scoreColor}`}>
              {score >= 80 ? 'Good' : score >= 60 ? 'Needs Work' : 'Poor'}
            </div>
            <div className="text-xs text-slate-500">Accessibility Score</div>
          </div>
        </SectionCard>

        {/* Category breakdown */}
        <SectionCard title="Category Breakdown" delay={0.1} className="lg:col-span-2">
          <div className="space-y-4">
            {DEMO_REPORT.categories.map((c) => {
              const pct = (c.score / c.max) * 100;
              return (
                <div key={c.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-slate-300">{c.name}</span>
                    <span className="text-slate-400">{c.score} / {c.max}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${pct >= 75 ? 'bg-success-500' : pct >= 50 ? 'bg-warning-500' : 'bg-danger-500'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 rounded-xl border border-white/5 bg-ink-900/40 p-4">
            <div className="mb-2 text-sm font-medium text-core-300">Summary</div>
            <p className="text-sm text-slate-400">{DEMO_REPORT.summary}</p>
          </div>
        </SectionCard>
      </div>

      {/* Severity counts */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
        {(Object.keys(SEVERITY_META) as Severity[]).map((sev) => {
          const meta = SEVERITY_META[sev];
          const Icon = meta.icon;
          return (
            <div key={sev} className={`rounded-xl border p-4 ${meta.bg}`}>
              <Icon size={18} className={meta.color} />
              <div className="mt-2 font-display text-2xl font-bold text-white">{counts[sev] ?? 0}</div>
              <div className={`text-xs ${meta.color}`}>{meta.label}</div>
            </div>
          );
        })}
      </div>

      {/* Issues list */}
      <h2 className="section-title mb-4">Issues Found ({DEMO_REPORT.issues.length})</h2>
      <div className="space-y-3">
        {DEMO_REPORT.issues.map((issue, i) => (
          <IssueRow
            key={issue.id}
            issue={issue}
            expanded={expanded === issue.id}
            onToggle={() => setExpanded(expanded === issue.id ? null : issue.id)}
            delay={i * 0.04}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/accessible-view" className="btn-primary">
          <Sparkles size={16} /> Generate Accessible View <ArrowRight size={16} />
        </Link>
        <Link to="/reports" className="btn-ghost">
          View Full Report
        </Link>
      </div>
    </div>
  );
}

function IssueRow({
  issue,
  expanded,
  onToggle,
  delay,
}: {
  issue: AccessibilityIssue;
  expanded: boolean;
  onToggle: () => void;
  delay: number;
}) {
  const meta = SEVERITY_META[issue.severity];
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`rounded-xl border ${meta.bg} overflow-hidden`}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 p-4 text-left"
        aria-expanded={expanded}
      >
        <Icon size={20} className={`shrink-0 ${meta.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{issue.title}</span>
            <span className={`chip border ${meta.color} border-current/20`}>{meta.label}</span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {issue.category} · {issue.count} occurrence{issue.count > 1 ? 's' : ''} · WCAG {issue.wcag}
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
      </button>
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-white/5 px-4 py-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Description</div>
              <p className="text-sm text-slate-300">{issue.description}</p>
            </div>
            <div>
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-core-300">Recommendation</div>
              <p className="text-sm text-slate-200">{issue.recommendation}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}