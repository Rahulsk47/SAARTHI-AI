import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import SaarthiCore from '@/components/SaarthiCore';
import PageHeader from '@/components/PageHeader';
import { type CoreState } from '@/types/core';
import { supabase } from '@/lib/supabase';
import { DEMO_REPORT } from '@/data/demoData';

const STEPS: {
  state: CoreState;
  label: string;
  desc: string;
}[] = [
  {
    state: 'processing',
    label: 'Fetching',
    desc: 'Retrieving page content and resources',
  },
  {
    state: 'analyzing',
    label: 'Analyzing',
    desc: 'Parsing DOM, styles, and structure',
  },
  {
    state: 'thinking',
    label: 'Accessibility Check',
    desc: 'Running WCAG 2.2 checks against the page',
  },
  {
    state: 'success',
    label: 'Recommendations',
    desc: 'Generating fixes and suggestions',
  },
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
  const [errorMessage, setErrorMessage] = useState('');

  const saveAnalysis = async (analysisUrl: string) => {
    try {
      setErrorMessage('');

      // ---------------------------------------------
      // Get logged-in user
      // ---------------------------------------------

      const {
        data: sessionData,
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        setErrorMessage(
          'Unable to verify your account.'
        );
        return false;
      }

      const user = sessionData.session?.user;

      if (!user) {
        console.warn(
          'No authenticated Supabase user found.'
        );

        setErrorMessage(
          'Please log in before saving an analysis.'
        );

        return false;
      }

      // ---------------------------------------------
      // Save website analysis
      // ---------------------------------------------

      const {
        data: analysis,
        error: analysisError,
      } = await supabase
        .from('website_analyses')
        .insert({
          url: analysisUrl,
          score: Number(DEMO_REPORT?.score ?? 0),
          summary: String(
            DEMO_REPORT?.summary ?? ''
          ),
        })
        .select()
        .single();

      if (analysisError) {
        console.error(
          'Website analysis insert error:',
          analysisError
        );

        setErrorMessage(
          analysisError.message ||
            'Failed to save website analysis.'
        );

        return false;
      }

      if (!analysis) {
        setErrorMessage(
          'Analysis was created but no result was returned.'
        );

        return false;
      }

      // ---------------------------------------------
      // Save issues
      // ---------------------------------------------

      const reportIssues = Array.isArray(
        DEMO_REPORT?.issues
      )
        ? DEMO_REPORT.issues
        : [];

      if (reportIssues.length > 0) {
        /*
         * Keep the database payload simple.
         *
         * If your Supabase website_issues table has
         * different columns, this prevents the whole
         * analysis from crashing because of extra fields.
         */

        const issues = reportIssues.map((issue) => ({
          analysis_id: analysis.id,
          title: String(issue?.title ?? ''),
          severity: String(issue?.severity ?? ''),
          category: String(issue?.category ?? ''),
          description: String(
            issue?.description ?? ''
          ),
          recommendation: String(
            issue?.recommendation ?? ''
          ),
          wcag: String(issue?.wcag ?? ''),
          count: Number(issue?.count ?? 0),
        }));

        const {
          error: issuesError,
        } = await supabase
          .from('website_issues')
          .insert(issues);

        if (issuesError) {
          /*
           * Don't stop the whole feature if issue
           * insertion fails.
           */
          console.error(
            'Website issues insert error:',
            issuesError
          );

          console.error(
            'Issues payload:',
            issues
          );
        }
      }

      // ---------------------------------------------
      // Activity log
      // ---------------------------------------------

      const { error: activityError } =
        await supabase
          .from('activity_logs')
          .insert({
            type: 'website',
            title: analysisUrl,
            detail: `Accessibility analysis · ${reportIssues.length} issues found`,
            score: Number(
              DEMO_REPORT?.score ?? 0
            ),
          });

      if (activityError) {
        console.error(
          'Activity log error:',
          activityError
        );
      }

      setSaved(true);

      return true;
    } catch (error) {
      console.error(
        'Unexpected analysis save error:',
        error
      );

      setErrorMessage(
        'Something went wrong while saving the analysis.'
      );

      return false;
    }
  };

  const startAnalysis = async (
    target?: string
  ) => {
    if (running) {
      return;
    }

    const finalUrl = (
      target ?? url
    ).trim();

    if (!finalUrl) {
      setErrorMessage(
        'Please enter a website URL.'
      );
      return;
    }

    // Basic URL validation
    try {
      const parsedUrl = new URL(finalUrl);

      if (
        parsedUrl.protocol !== 'http:' &&
        parsedUrl.protocol !== 'https:'
      ) {
        setErrorMessage(
          'Please enter a valid HTTP or HTTPS URL.'
        );
        return;
      }
    } catch {
      setErrorMessage(
        'Please enter a valid website URL, for example https://example.com'
      );
      return;
    }

    setUrl(finalUrl);
    setRunning(true);
    setSaved(false);
    setErrorMessage('');
    setStepIndex(0);

    // ---------------------------------------------
    // Run visual analysis steps
    // ---------------------------------------------

    STEPS.forEach((_, index) => {
      window.setTimeout(() => {
        setStepIndex(index);
      }, index * 1400);
    });

    // ---------------------------------------------
    // Complete analysis
    // ---------------------------------------------

    const totalTime =
      STEPS.length * 1400 + 800;

    window.setTimeout(async () => {
      setStepIndex(STEPS.length - 1);

      const success =
        await saveAnalysis(finalUrl);

      setRunning(false);

      if (success) {
        window.setTimeout(() => {
          navigate('/results');
        }, 700);
      }
    }, totalTime);
  };

  const currentState: CoreState =
    stepIndex >= 0 &&
    stepIndex < STEPS.length
      ? STEPS[stepIndex].state
      : 'idle';

  return (
    <div className="px-6 py-8 md:px-10">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <PageHeader
        title="Website Analyzer"
        subtitle="Enter any URL to get an accessibility score, issues, and recommendations."
        icon={Globe}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

        {/* =================================================
            LEFT COLUMN
        ================================================= */}

        <div>

          {/* URL CARD */}

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
                aria-label="Website URL to analyze"
              />

              <button
                type="button"
                onClick={() => {
                  void startAnalysis();
                }}
                disabled={
                  running ||
                  !url.trim()
                }
                className="btn-primary flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {running
                  ? 'Analyzing…'
                  : 'Analyze'}

                <ArrowRight size={16} />
              </button>

            </div>

            {/* SAMPLE URLS */}

            <div className="mt-4 flex flex-wrap gap-2">

              <span className="self-center text-xs text-slate-500">
                Try:
              </span>

              {SAMPLE_URLS.map(
                (sampleUrl) => (
                  <button
                    key={sampleUrl}
                    type="button"
                    disabled={running}
                    onClick={() => {
                      void startAnalysis(
                        sampleUrl
                      );
                    }}
                    className="chip border border-white/10 text-slate-400 transition hover:border-core-400/30 hover:text-core-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sampleUrl.replace(
                      'https://',
                      ''
                    )}
                  </button>
                )
              )}

            </div>

            {/* SUCCESS */}

            {saved && !errorMessage && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-success-500/20 bg-success-500/5 p-3 text-sm text-success-400">
                <CheckCircle2 size={16} />

                <span>
                  Analysis saved successfully.
                </span>
              </div>
            )}

            {/* ERROR */}

            {errorMessage && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-danger-500/20 bg-danger-500/5 p-3 text-sm text-danger-400">
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {errorMessage}
                </span>
              </div>
            )}

          </div>

          {/* =================================================
              ANALYSIS PIPELINE
          ================================================= */}

          <div className="card">

            <h3 className="mb-4 font-display text-lg font-semibold text-white">
              Analysis Pipeline
            </h3>

            <div className="space-y-3">

              {STEPS.map(
                (step, index) => {
                  const done =
                    stepIndex > index;

                  const active =
                    stepIndex === index;

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

                      {/* ICON */}

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">

                        {done ? (
                          <CheckCircle2
                            size={20}
                            className="text-success-400"
                          />
                        ) : active ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-core-400/30 border-t-core-400" />
                        ) : (
                          <span className="font-mono text-sm text-slate-600">
                            {index + 1}
                          </span>
                        )}

                      </div>

                      {/* TEXT */}

                      <div className="flex-1">

                        <div
                          className={`text-sm font-medium ${
                            active
                              ? 'text-core-200'
                              : done
                                ? 'text-success-400'
                                : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </div>

                        <div className="text-xs text-slate-500">
                          {step.desc}
                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

            {/* INFO */}

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/5 bg-ink-900/40 p-3 text-xs text-slate-500">

              <Info
                size={14}
                className="mt-0.5 shrink-0"
              />

              <span>
                Analysis currently uses demo
                accessibility data. The result is
                saved to your Supabase account.
              </span>

            </div>

          </div>
        </div>

        {/* =================================================
            RIGHT COLUMN - SAARTHI CORE
        ================================================= */}

        <div className="flex flex-col items-center justify-center">

          <AnimatePresence mode="wait">

            <motion.div
              key={currentState}
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
              }}
              transition={{
                duration: 0.3,
              }}
              className="flex flex-col items-center"
            >

              <SaarthiCore
                state={currentState}
                size={340}
                showStars={!running}
              />

              <div className="mt-6 text-center">

                {running ? (
                  <>
                    <div className="font-display text-xl font-semibold capitalize text-white">
                      {STEPS[
                        stepIndex
                      ]?.label ??
                        'Analyzing'}
                    </div>

                    <div className="text-sm text-slate-500">
                      {STEPS[
                        stepIndex
                      ]?.desc ??
                        'Processing your request'}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-display text-xl font-semibold text-white">
                      Ready
                    </div>

                    <div className="text-sm text-slate-500">
                      Enter a URL to begin
                    </div>
                  </>
                )}

              </div>

            </motion.div>

          </AnimatePresence>

          {/* CORE MESSAGE */}

          {!running && (
            <div className="mt-8 flex items-center gap-2 text-sm text-slate-500">

              <Sparkles
                size={14}
                className="text-core-400"
              />

              <span>
                SAARTHI Core reacts to every analysis stage
              </span>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}