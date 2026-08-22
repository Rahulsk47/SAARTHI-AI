import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Globe,
  Info,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import SaarthiCore from '@/components/SaarthiCore';
import PageHeader from '@/components/PageHeader';
import { analyzeWebsite } from '@/lib/ai';
import { saveWebsiteAnalysis } from '@/lib/data';
import type { CoreState } from '@/types/core';

const SAMPLE_URLS = [
  'https://www.india.gov.in',
  'https://uidai.gov.in',
  'https://www.cowin.gov.in',
  'https://en.wikipedia.org',
  'https://example.com',
];

const STEPS = [
  {
    state: 'processing' as CoreState,
    label: 'Fetching website',
    desc: 'Retrieving public HTML content & landmarks',
  },
  {
    state: 'analyzing' as CoreState,
    label: 'Checking accessibility',
    desc: 'Auditing WCAG 2.1 AA rules, contrast, and tags',
  },
  {
    state: 'thinking' as CoreState,
    label: 'Calculating score & fixes',
    desc: 'Generating actionable remediation guide',
  },
  {
    state: 'success' as CoreState,
    label: 'Saving report',
    desc: 'Saving audit results to your history',
  },
];

export default function WebsiteAnalyzer() {
  const navigate = useNavigate();

  const [url, setUrl] = useState('');
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const startAnalysis = async (targetUrl?: string) => {
    if (running) {
      return;
    }

    let finalUrl = (targetUrl ?? url).trim();

    if (!finalUrl) {
      setErrorMessage('Please enter a website URL.');
      return;
    }

    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    try {
      new URL(finalUrl);
    } catch {
      setErrorMessage('Enter a valid website URL (e.g. https://www.india.gov.in).');
      return;
    }

    setUrl(finalUrl);
    setRunning(true);
    setSaved(false);
    setErrorMessage('');
    setStepIndex(0);

    try {
      // Step 1: Fetching
      setStepIndex(0);
      await new Promise((r) => setTimeout(r, 600));

      // Step 2: Analyzing
      setStepIndex(1);
      const result = await analyzeWebsite(finalUrl);

      // Step 3: Thinking / computing report
      setStepIndex(2);
      await new Promise((r) => setTimeout(r, 600));

      // Step 4: Saving
      setStepIndex(3);
      const savedItem = await saveWebsiteAnalysis(
        result.url,
        result.score,
        result.summary,
        result.issues,
        result.breakdown,
        result.quickFixes,
      );

      setSaved(true);

      setTimeout(() => {
        navigate(`/results?id=${savedItem.id}`);
      }, 800);
    } catch (error: any) {
      console.error('Analysis error:', error);
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to analyze this website.',
      );
      setStepIndex(-1);
    } finally {
      setRunning(false);
    }
  };

  const currentState =
    stepIndex >= 0 ? STEPS[stepIndex]?.state ?? 'idle' : 'idle';

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        title="Website Analyzer"
        subtitle="Perform deep WCAG 2.1 accessibility audits on any public website."
        icon={Globe}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <div className="card mb-6">
            <label
              htmlFor="website-url"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Website URL
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="website-url"
                type="url"
                value={url}
                disabled={running}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setErrorMessage('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void startAnalysis();
                  }
                }}
                placeholder="https://www.india.gov.in"
                className="input flex-1"
              />

              <button
                type="button"
                id="start-analyze-button"
                disabled={running || !url.trim()}
                onClick={() => {
                  void startAnalysis();
                }}
                className="btn-primary flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {running ? 'Analyzing…' : 'Analyze'}
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="self-center text-xs text-slate-500">
                Quick Test:
              </span>

              {SAMPLE_URLS.map((sampleUrl) => (
                <button
                  key={sampleUrl}
                  type="button"
                  disabled={running}
                  onClick={() => {
                    void startAnalysis(sampleUrl);
                  }}
                  className="chip border border-white/10 text-slate-400 transition hover:border-core-400/30 hover:text-core-300 disabled:opacity-40"
                >
                  {sampleUrl.replace('https://', '')}
                </button>
              ))}
            </div>

            {saved && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-success-500/20 bg-success-500/5 p-3 text-sm text-success-400">
                <CheckCircle2 size={16} />
                Analysis saved successfully! Redirecting to report…
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-danger-500/20 bg-danger-500/5 p-3 text-sm text-danger-400">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {errorMessage}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="mb-4 font-display text-lg font-semibold text-white">
              Automated Audit Pipeline
            </h2>

            <div className="space-y-3">
              {STEPS.map((step, index) => {
                const active = stepIndex === index;
                const completed = stepIndex > index;

                return (
                  <motion.div
                    key={step.label}
                    animate={{ opacity: active || completed ? 1 : 0.5 }}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      active
                        ? 'border-core-400/40 bg-core-500/10'
                        : completed
                          ? 'border-success-500/20 bg-success-500/5'
                          : 'border-white/5 bg-ink-900/40'
                    }`}
                  >
                    <div className="flex h-8 w-8 items-center justify-center">
                      {completed ? (
                        <CheckCircle2
                          size={20}
                          className="text-success-400"
                        />
                      ) : active ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-core-400/30 border-t-core-400" />
                      ) : (
                        <span className="font-mono text-sm text-slate-500">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-medium text-white">
                        {step.label}
                      </div>
                      <div className="text-xs text-slate-500">
                        {step.desc}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/5 bg-ink-900/40 p-3 text-xs text-slate-500">
              <Info size={14} className="mt-0.5 shrink-0" />
              SAARTHI uses automated DOM inspection combined with Gemini 2.5 AI to audit semantic structure, keyboard navigation, color contrast, and assistive tech compatibility.
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <SaarthiCore
            state={currentState}
            size={320}
            showStars={!running}
          />

          <div className="mt-6 text-center">
            <div className="font-display text-xl font-semibold text-white">
              {running
                ? STEPS[stepIndex]?.label ?? 'Auditing Website'
                : 'Ready for Analysis'}
            </div>

            <div className="text-sm text-slate-500">
              {running
                ? STEPS[stepIndex]?.desc ??
                  'Processing website elements and WCAG criteria'
                : 'Enter a URL to evaluate accessibility barriers'}
            </div>
          </div>

          {!running && (
            <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
              <Sparkles size={14} className="text-core-400" />
              Full WCAG 2.1 Level AA & AAA checklist included.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
