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
import { analyzeWebsite, type AccessibilityAnalysisResult } from '@/lib/ai';
import { supabase } from '@/lib/supabase';
import type { CoreState } from '@/types/core';

const SAMPLE_URLS = [
  'https://example.com',
  'https://www.wikipedia.org',
  'https://www.gov.in',
];

const STEPS = [
  {
    state: 'processing' as CoreState,
    label: 'Fetching website',
    desc: 'Retrieving public HTML content',
  },
  {
    state: 'analyzing' as CoreState,
    label: 'Checking accessibility',
    desc: 'Inspecting common accessibility issues',
  },
  {
    state: 'thinking' as CoreState,
    label: 'Calculating score',
    desc: 'Preparing your accessibility report',
  },
  {
    state: 'success' as CoreState,
    label: 'Saving report',
    desc: 'Saving results securely to your account',
  },
];

export default function WebsiteAnalyzer() {
  const navigate = useNavigate();

  const [url, setUrl] = useState('');
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const saveAnalysis = async (
    result: AccessibilityAnalysisResult,
  ) => {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.user) {
      throw new Error('Please log in before saving an analysis.');
    }

    const { data: analysis, error: analysisError } = await supabase
      .from('website_analyses')
      .insert({
        url: result.url,
        score: result.score,
        summary: result.summary,
      })
      .select()
      .single();

    if (analysisError || !analysis) {
      throw new Error(
        analysisError?.message || 'Failed to save website analysis.',
      );
    }

    if (result.issues.length > 0) {
      const { error: issuesError } = await supabase
        .from('website_issues')
        .insert(
          result.issues.map((issue) => ({
            analysis_id: analysis.id,
            title: issue.title,
            severity: issue.severity,
            category: issue.category,
            description: issue.description,
            recommendation: issue.recommendation,
            wcag: issue.wcag,
            count: issue.count,
          })),
        );

      if (issuesError) {
        throw new Error(
          `Analysis was saved, but issues could not be saved: ${issuesError.message}`,
        );
      }
    }

    const { error: activityError } = await supabase
      .from('activity_logs')
      .insert({
        type: 'website',
        title: result.url,
        detail: `Accessibility analysis · ${result.issues.length} issue types found`,
        score: result.score,
      });

    if (activityError) {
      console.error('Unable to save activity log:', activityError);
    }
  };

  const startAnalysis = async (targetUrl?: string) => {
    if (running) {
      return;
    }

    const finalUrl = (targetUrl ?? url).trim();

    if (!finalUrl) {
      setErrorMessage('Please enter a website URL.');
      return;
    }

    try {
      const parsedUrl = new URL(finalUrl);

      if (
        parsedUrl.protocol !== 'http:' &&
        parsedUrl.protocol !== 'https:'
      ) {
        throw new Error();
      }
    } catch {
      setErrorMessage(
        'Enter a valid public website URL, for example https://example.com.',
      );
      return;
    }

    setUrl(finalUrl);
    setRunning(true);
    setSaved(false);
    setErrorMessage('');
    setStepIndex(0);

    try {
      for (let index = 0; index < STEPS.length - 1; index += 1) {
        setStepIndex(index);

        await new Promise((resolve) => {
          window.setTimeout(resolve, 650);
        });
      }

      setStepIndex(2);

      const result = await analyzeWebsite(finalUrl);

      setStepIndex(3);

      await saveAnalysis(result);

      setSaved(true);
      setStepIndex(STEPS.length - 1);

      window.setTimeout(() => {
        navigate('/results');
      }, 900);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to analyze this website.',
      );

      setStepIndex(-1);
    } finally {
      setRunning(false);
    }
  };

  const currentState =
    stepIndex >= 0
      ? STEPS[stepIndex]?.state ?? 'idle'
      : 'idle';

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        title="Website Analyzer"
        subtitle="Analyze a public website and save its accessibility report."
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
                placeholder="https://example.com"
                className="input flex-1"
              />

              <button
                type="button"
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

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="self-center text-xs text-slate-500">
                Try:
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
                Analysis saved successfully.
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
              Analysis Pipeline
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
              The automated check finds common HTML accessibility issues.
              Manual WCAG testing is still recommended.
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
                ? STEPS[stepIndex]?.label ?? 'Analyzing'
                : 'Ready'}
            </div>

            <div className="text-sm text-slate-500">
              {running
                ? STEPS[stepIndex]?.desc ??
                  'Processing your request'
                : 'Enter a URL to begin'}
            </div>
          </div>

          {!running && (
            <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">
              <Sparkles size={14} className="text-core-400" />
              Results are saved securely to your account.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}