import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Globe,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Code,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import { getAnalysisById, getLatestAnalysis, type WebsiteAnalysis, type WebsiteIssue } from '@/lib/data';

export default function AccessibilityResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const analysisId = searchParams.get('id');

  const [analysis, setAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        let result: WebsiteAnalysis | null = null;
        if (analysisId) {
          result = await getAnalysisById(analysisId);
        }
        if (!result) {
          result = await getLatestAnalysis();
        }
        setAnalysis(result);
      } catch (err) {
        console.error('Failed to load analysis:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [analysisId]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-core-400 border-t-transparent" />
        <p className="mt-4 text-sm text-slate-400">Loading accessibility evaluation...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="px-6 py-12 text-center md:px-10">
        <div className="mx-auto max-w-md card p-8">
          <Globe size={40} className="mx-auto text-core-400 mb-4" />
          <h2 className="font-display text-xl font-semibold text-white">No Audit Results Found</h2>
          <p className="mt-2 text-sm text-slate-400">
            Run a website analysis to generate an automated WCAG 2.1 accessibility report.
          </p>
          <Link to="/website-analyzer" className="btn-primary mt-6 inline-flex">
            <Sparkles size={16} /> Analyze a Website
          </Link>
        </div>
      </div>
    );
  }

  const issues = analysis.issues || [];
  const criticalCount = issues.filter((i) => i.severity.toLowerCase() === 'critical').length;
  const seriousCount = issues.filter((i) => i.severity.toLowerCase() === 'serious').length;
  const moderateCount = issues.filter((i) => i.severity.toLowerCase() === 'moderate').length;
  const minorCount = issues.filter((i) => i.severity.toLowerCase() === 'minor').length;

  const filteredIssues = issues.filter((issue) => {
    if (selectedSeverity === 'all') return true;
    return issue.severity.toLowerCase() === selectedSeverity;
  });

  const breakdown = analysis.breakdown || {
    perceivable: Math.max(45, analysis.score - 4),
    operable: Math.max(50, analysis.score + 2),
    understandable: Math.max(55, analysis.score - 2),
    robust: Math.max(40, analysis.score),
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-success-400 border-success-500/30 bg-success-500/10';
    if (score >= 65) return 'text-warning-400 border-warning-500/30 bg-warning-500/10';
    return 'text-danger-400 border-danger-500/30 bg-danger-500/10';
  };

  const getSeverityBadge = (severity: string) => {
    const sev = severity.toLowerCase();
    if (sev === 'critical') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-danger-500/30 bg-danger-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-danger-400">
          <AlertCircle size={12} /> Critical
        </span>
      );
    }
    if (sev === 'serious') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-warning-500/30 bg-warning-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-warning-400">
          <AlertTriangle size={12} /> Serious
        </span>
      );
    }
    if (sev === 'moderate') {
      return (
        <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
          <Info size={12} /> Moderate
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-slate-500/20 bg-slate-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-slate-300">
        <CheckCircle2 size={12} /> Minor
      </span>
    );
  };

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        title="Accessibility Audit Report"
        subtitle={`WCAG 2.1 AA Compliance evaluation for ${analysis.url}`}
        icon={ShieldCheck}
        backTo="/website-analyzer"
        backLabel="Run New Analysis"
      />

      {/* Top Banner Overview */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Overall Score Card */}
        <div className="card flex flex-col items-center justify-center p-6 text-center lg:col-span-1">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={
                  analysis.score >= 80
                    ? 'text-success-400'
                    : analysis.score >= 60
                    ? 'text-warning-400'
                    : 'text-danger-400'
                }
                strokeDasharray={`${analysis.score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-display text-3xl font-bold text-white">{analysis.score}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">Score / 100</span>
            </div>
          </div>

          <div className="mt-4">
            <span
              className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${getScoreColor(
                analysis.score,
              )}`}
            >
              {analysis.score >= 85
                ? 'High Accessibility'
                : analysis.score >= 65
                ? 'Moderate Accessibility'
                : 'Needs Remediation'}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 truncate max-w-[200px]" title={analysis.url}>
            {analysis.url}
          </p>
        </div>

        {/* Breakdown by WCAG Principles */}
        <div className="card grid grid-cols-2 gap-4 p-6 lg:col-span-3 sm:grid-cols-4">
          <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-ink-900/40 p-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                1. Perceivable
              </div>
              <div className="mt-2 font-display text-2xl font-bold text-white">
                {breakdown.perceivable}%
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">Alt text, colors, media captions</div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-ink-900/40 p-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                2. Operable
              </div>
              <div className="mt-2 font-display text-2xl font-bold text-white">
                {breakdown.operable}%
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">Keyboard navigation & focus rings</div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-ink-900/40 p-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                3. Understandable
              </div>
              <div className="mt-2 font-display text-2xl font-bold text-white">
                {breakdown.understandable}%
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">Language tags & clear form labels</div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-white/5 bg-ink-900/40 p-4">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400">
                4. Robust
              </div>
              <div className="mt-2 font-display text-2xl font-bold text-white">
                {breakdown.robust}%
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">Semantic markup & ARIA roles</div>
          </div>
        </div>
      </div>

      {/* Action Banner */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-core-500/20 bg-gradient-to-r from-core-600/10 via-ink-900 to-core-900/20 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-white">
            Transform this URL with SAARTHI Adaptive Engine
          </h3>
          <p className="mt-1 text-sm text-slate-300">
            Generate a clean, simplified, distraction-free view adapted to personal accessibility settings.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/accessible-view?url=${encodeURIComponent(analysis.url)}`}
            className="btn-primary"
            id="open-accessible-view-button"
          >
            <Sparkles size={16} /> Accessible View <ArrowRight size={16} />
          </Link>
          <button
            onClick={() => navigate('/website-analyzer')}
            className="btn-secondary"
          >
            <RefreshCw size={16} /> Re-audit
          </button>
        </div>
      </div>

      {/* Executive Summary */}
      <SectionCard title="Executive Accessibility Summary" icon={<Info size={18} />} delay={0.1}>
        <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-line">
          {analysis.summary}
        </p>
      </SectionCard>

      {/* Quick Remediation Code Snippets (if present) */}
      {analysis.quickFixes && analysis.quickFixes.length > 0 && (
        <div className="mt-8">
          <SectionCard title="Recommended Code Snippets & Quick Fixes" icon={<Code size={18} />} delay={0.15}>
            <div className="space-y-4">
              {analysis.quickFixes.map((fix, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-ink-950 p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-sm font-semibold text-white">{fix.title}</h4>
                    <button
                      onClick={() => copyToClipboard(fix.code, idx)}
                      className="flex items-center gap-1 text-xs text-core-300 hover:text-core-200"
                    >
                      {copiedCodeIndex === idx ? (
                        <>
                          <Check size={14} className="text-success-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy snippet
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{fix.explanation}</p>
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-ink-900 p-3 font-mono text-xs text-core-200">
                    <code>{fix.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* Issues Section */}
      <div className="mt-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Detected Accessibility Barriers ({issues.length})
            </h2>
            <p className="text-xs text-slate-400">
              Categorized and evaluated against WCAG 2.1 Level A and Level AA criteria.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedSeverity('all')}
              className={`chip border transition ${
                selectedSeverity === 'all'
                  ? 'border-core-400 bg-core-500/20 text-white'
                  : 'border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({issues.length})
            </button>
            {criticalCount > 0 && (
              <button
                onClick={() => setSelectedSeverity('critical')}
                className={`chip border transition ${
                  selectedSeverity === 'critical'
                    ? 'border-danger-400 bg-danger-500/20 text-danger-200'
                    : 'border-danger-500/20 text-danger-400'
                }`}
              >
                Critical ({criticalCount})
              </button>
            )}
            {seriousCount > 0 && (
              <button
                onClick={() => setSelectedSeverity('serious')}
                className={`chip border transition ${
                  selectedSeverity === 'serious'
                    ? 'border-warning-400 bg-warning-500/20 text-warning-200'
                    : 'border-warning-500/20 text-warning-400'
                }`}
              >
                Serious ({seriousCount})
              </button>
            )}
            {moderateCount > 0 && (
              <button
                onClick={() => setSelectedSeverity('moderate')}
                className={`chip border transition ${
                  selectedSeverity === 'moderate'
                    ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                    : 'border-amber-500/20 text-amber-300'
                }`}
              >
                Moderate ({moderateCount})
              </button>
            )}
            {minorCount > 0 && (
              <button
                onClick={() => setSelectedSeverity('minor')}
                className={`chip border transition ${
                  selectedSeverity === 'minor'
                    ? 'border-slate-400 bg-white/20 text-white'
                    : 'border-white/10 text-slate-400'
                }`}
              >
                Minor ({minorCount})
              </button>
            )}
          </div>
        </div>

        {/* Issue Cards */}
        <div className="space-y-3">
          {filteredIssues.map((issue: WebsiteIssue) => {
            const isExpanded = expandedIssueId === issue.id;

            return (
              <div
                key={issue.id}
                className="card p-4 transition hover:border-white/20"
              >
                <div
                  className="flex cursor-pointer items-start justify-between gap-4"
                  onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setExpandedIssueId(isExpanded ? null : issue.id)}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getSeverityBadge(issue.severity)}
                      <span className="rounded bg-white/5 px-2 py-0.5 text-xs text-slate-400">
                        {issue.category}
                      </span>
                      {issue.count > 1 && (
                        <span className="text-xs text-slate-500">
                          ({issue.count} occurrences)
                        </span>
                      )}
                    </div>
                    <h3 className="mt-2 font-display text-base font-semibold text-white">
                      {issue.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">{issue.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden font-mono text-[11px] text-core-300 sm:inline">
                      {issue.wcag}
                    </span>
                    <button className="text-slate-400 hover:text-white" aria-label="Toggle issue details">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 border-t border-white/10 pt-4"
                    >
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-core-500/20 bg-core-500/5 p-3">
                          <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-core-300">
                            <Sparkles size={13} /> Recommended Fix
                          </div>
                          <p className="mt-1 text-xs text-slate-200 leading-relaxed">
                            {issue.recommendation}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/5 bg-ink-950 p-3">
                          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            WCAG 2.1 Standard
                          </div>
                          <p className="mt-1 font-mono text-xs text-slate-300">{issue.wcag}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
