import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowRight, Sparkles, Info, CheckCircle2 } from 'lucide-react';
import SaarthiCore from '@/components/SaarthiCore';
import PageHeader from '@/components/PageHeader';
import { type CoreState } from '@/types/core';
import { supabase } from '@/lib/supabase';
import { DEMO_REPORT } from '@/data/demoData';

const STEPS: { state: CoreState; label: string; desc: string }[] = [
  { state: 'processing', label: 'Fetching', desc: 'Retrieving page content and resources' },
  { state: 'analyzing', label: 'Analyzing', desc: 'Parsing DOM, styles, and structure' },
  { state: 'thinking', label: 'Accessibility Check', desc: 'Running WCAG 2.2 checks against the page' },
  { state: 'success', label: 'Recommendations', desc: 'Generating fixes and suggestions' },
];

const SAMPLE_URLS = [
  'https://example-gov-portal.gov.in',
  'https://bank-portal.example.com',
  'https://news-site.example.org',
];

export default function WebsiteAnalyzer() {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [saved, setSaved] = useState(false);

  const saveAnalysis = async (analysisUrl: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return;

      const { data: analysis, error } = await supabase
        .from('website_analyses')
        .insert({
          url: analysisUrl,
          score: DEMO_REPORT.score,
          summary: DEMO_REPORT.summary,
        })
        .select()
        .single();

      if (error || !analysis) return;

      const issues = DEMO_REPORT.issues.map((issue) => ({
        analysis_id: analysis.id,
        title: issue.title,
        severity: issue.severity,
        category: issue.category,
        description: issue.description,
        recommendation: issue.recommendation,
        wcag: issue.wcag,
        count: issue.count,
      }));

      await supabase.from('website_issues').insert(issues);

      await supabase.from('activity_logs').insert({
        type: 'website',
        title: analysisUrl,
        detail: `Accessibility analysis · ${DEMO_REPORT.issues.length} issues found`,
        score: DEMO_REPORT.score,
      });

      setSaved(true);
    } catch (err) {
      console.error('Failed to save analysis:', err);
    }
  };

  const startAnalysis = (target?: string) => {
    const finalUrl = target ?? url;
    if (!finalUrl.trim()) return;
    setUrl(finalUrl);
    setRunning(true);
    setStepIndex(0);
    setSaved(false);

    STEPS.forEach((_, i) => {
      setTimeout(() => setStepIndex(i), i * 1400);
    });

    setTimeout(() => {
      setRunning(false);
      saveAnalysis(finalUrl);
      setTimeout(() => navigate('/results'), 600);
    }, STEPS.length * 1400 + 800);
  };

  const currentState = stepIndex >= 0 && stepIndex < STEPS.length ? STEPS[stepIndex].state : 'idle';

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        title="Website Analyzer"
        subtitle="Enter any URL to get an accessibility score, issues, and recommendations."
        icon={Globe}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: input + steps */}
        <div>
          <div className="card mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-300">Website URL</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && startAnalysis()}
                placeholder="https://example.com"
                className="input flex-1"
                aria-label="Website URL to analyze"
              />
              <button
                onClick={() => startAnalysis()}
                disabled={running || !url.trim()}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {running ? 'Analyzing…' : 'Analyze'} <ArrowRight size={16} />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-xs text-slate-500 self-center">Try:</span>
              {SAMPLE_URLS.map((s) => (
                <button
                  key={s}
                  onClick={() => startAnalysis(s)}
                  disabled={running}
                  className="chip border border-white/10 text-slate-400 hover:text-core-300 hover:border-core-400/30 transition disabled:opacity-40"
                >
                  {s.replace('https://', '')}
                </button>
              ))}
            </div>
            {saved && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-success-500/20 bg-success-500/5 p-3 text-sm text-success-400">
                <CheckCircle2 size={16} /> Analysis saved to your history.
              </div>
            )}
          </div>

          {/* Steps */}
          <div className="card">
            <h3 className="mb-4 font-display text-lg font-semibold text-white">Analysis Pipeline</h3>
            <div className="space-y-3">
              {STEPS.map((step, i) => {
                const done = stepIndex > i;
                const active = stepIndex === i;
                return (
                  <div
                    key={step.label}
                    className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                      active
                        ? 'border-core-400/40 bg-core-500/10'
                        : done
                        ? 'border-success-500/20 bg-success-500/5'
                        : 'border-white/5 bg-ink-900/40 opacity-50'
                    }`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                      {done ? (
                        <span className="text-success-400">✓</span>
                      ) : active ? (
                        <div className="h-5 w-5 rounded-full border-2 border-core-400/30 border-t-core-400 animate-spin" />
                      ) : (
                        <span className="font-mono text-sm text-slate-600">{i + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${active ? 'text-core-200' : done ? 'text-success-400' : 'text-slate-400'}`}>
                        {step.label}
                      </div>
                      <div className="text-xs text-slate-500">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/5 bg-ink-900/40 p-3 text-xs text-slate-500">
              <Info size={14} className="shrink-0 mt-0.5" />
              Analysis uses demo data and saves results to your account. Connect an AI API key for real WCAG analysis.
            </div>
          </div>
        </div>

        {/* Right: Core */}
        <div className="flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <SaarthiCore state={currentState} size={340} showStars={!running} />
              <div className="mt-6 text-center">
                {running ? (
                  <>
                    <div className="font-display text-xl font-semibold capitalize text-white">
                      {STEPS[stepIndex]?.label}
                    </div>
                    <div className="text-sm text-slate-500">{STEPS[stepIndex]?.desc}</div>
                  </>
                ) : (
                  <>
                    <div className="font-display text-xl font-semibold text-white">Ready</div>
                    <div className="text-sm text-slate-500">Enter a URL to begin</div>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {!running && (
            <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
              <Sparkles size={14} className="text-core-400" />
              SAARTHI Core reacts to every analysis stage
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
