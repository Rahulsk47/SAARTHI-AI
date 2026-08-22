import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Type,
  Keyboard,
  Volume2,
  AlertTriangle,
  VolumeX,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  ShieldCheck,
  Check,
  Loader2,
} from 'lucide-react';
import SaarthiCore from '@/components/SaarthiCore';
import PageHeader from '@/components/PageHeader';
import { type CoreState } from '@/types/core';
import { transformAccessible, type AccessibleTransformResult } from '@/lib/ai';
import { useA11y } from '@/context/AccessibilityContext';

const STAGES = [
  {
    state: 'processing' as CoreState,
    label: 'Target Website',
    desc: 'Auditing source markup, landmarks & visual clutter',
  },
  {
    state: 'analyzing' as CoreState,
    label: 'Barrier Detection',
    desc: 'AI isolates WCAG AA barriers, contrast flaws & unlabeled elements',
  },
  {
    state: 'thinking' as CoreState,
    label: 'Accessibility Audit',
    desc: 'Categorizing critical navigation barriers and reading flow',
  },
  {
    state: 'processing' as CoreState,
    label: 'Adaptive Reconstruction',
    desc: 'Generating semantic, readable structure & ARIA landmarks',
  },
  {
    state: 'success' as CoreState,
    label: 'Accessible Experience',
    desc: 'Distraction-free, keyboard-ready, high-contrast interface',
  },
];

export default function AccessibleView() {
  const [searchParams] = useSearchParams();
  const targetUrl = searchParams.get('url') || 'https://www.india.gov.in';

  const { settings } = useA11y();
  const [stage, setStage] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const [reading, setReading] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(settings.fontScale || 1);
  const [highContrast, setHighContrast] = useState(settings.highContrast || false);
  const [transformedData, setTransformedData] = useState<AccessibleTransformResult | null>(null);
  const [loadingTransform, setLoadingTransform] = useState(false);

  useEffect(() => {
    setHighContrast(settings.highContrast);
  }, [settings.highContrast]);

  useEffect(() => {
    if (settings.fontScale) {
      setFontSizeMultiplier(settings.fontScale);
    }
  }, [settings.fontScale]);

  useEffect(() => {
    let isMounted = true;
    setLoadingTransform(true);
    transformAccessible(targetUrl)
      .then((res) => {
        if (isMounted && res) {
          setTransformedData(res);
        }
      })
      .catch((err) => {
        console.error('Transform error:', err);
      })
      .finally(() => {
        if (isMounted) setLoadingTransform(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetUrl]);

  useEffect(() => {
    if (!autoPlay) return;
    if (stage >= STAGES.length - 1) {
      setAutoPlay(false);
      return;
    }
    const id = setTimeout(() => setStage((s) => s + 1), 2200);
    return () => clearTimeout(id);
  }, [stage, autoPlay]);

  const current = STAGES[stage];
  const showOriginal = stage <= 1;
  const showIssues = stage === 2;
  const showTransform = stage === 3;
  const showAccessible = stage >= 4;

  const speakContent = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (reading) {
        setReading(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setReading(false);
      utterance.onerror = () => setReading(false);
      setReading(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        title="Accessible View Experience"
        subtitle={`Live transformation engine adapting ${targetUrl} into a barrier-free experience.`}
        icon={Sparkles}
        backTo="/results"
        backLabel="Back to Results"
      />

      {/* Stage progress */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {STAGES.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <button
              onClick={() => setStage(i)}
              className={`chip border transition ${
                i === stage
                  ? 'border-core-400 bg-core-500/15 text-core-200'
                  : i < stage
                  ? 'border-success-500/30 bg-success-500/10 text-success-400'
                  : 'border-white/10 text-slate-500 hover:text-slate-300'
              }`}
            >
              {i < stage && <CheckCircle2 size={12} />}
              {s.label}
            </button>
            {i < STAGES.length - 1 && <div className="h-px w-6 bg-white/10" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Core State */}
        <div className="flex flex-col items-center justify-center lg:sticky lg:top-8 lg:self-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.state + stage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <SaarthiCore state={current.state} size={280} showStars={false} />
              <div className="mt-4 text-center">
                <div className="font-display text-lg font-semibold text-white">{current.label}</div>
                <div className="text-sm text-slate-400">{current.desc}</div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setStage((s) => Math.max(0, s - 1))}
              disabled={stage === 0}
              className="btn-ghost disabled:opacity-30"
            >
              <ArrowLeft size={16} /> Prev
            </button>
            {stage < STAGES.length - 1 ? (
              <button onClick={() => setStage((s) => s + 1)} className="btn-primary">
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <Link to="/document-ai" className="btn-primary">
                Document AI <ArrowRight size={16} />
              </Link>
            )}
          </div>

          <button
            onClick={() => {
              if (stage >= STAGES.length - 1) setStage(0);
              setAutoPlay(!autoPlay);
            }}
            className="mt-3 text-sm text-core-300 hover:text-core-200"
          >
            {autoPlay ? 'Pause auto-play' : 'Auto-play transformation'}
          </button>
        </div>

        {/* Right: Visualization Canvas */}
        <div className="lg:col-span-2 space-y-4">
          {showAccessible && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink-900/60 p-3">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="font-semibold text-core-300">Adaptive Toolbar:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setFontSizeMultiplier((m) => Math.max(0.85, m - 0.1))}
                  className="chip border border-white/10 text-slate-300 hover:text-white"
                  title="Decrease font size"
                >
                  <ZoomOut size={13} /> A-
                </button>
                <button
                  onClick={() => setFontSizeMultiplier((m) => Math.min(1.4, m + 0.1))}
                  className="chip border border-white/10 text-slate-300 hover:text-white"
                  title="Increase font size"
                >
                  <ZoomIn size={13} /> A+
                </button>
                <button
                  onClick={() => setHighContrast(!highContrast)}
                  className={`chip border ${
                    highContrast
                      ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300'
                      : 'border-white/10 text-slate-300'
                  }`}
                  title="Toggle High Contrast"
                >
                  {highContrast ? <Sun size={13} /> : <Moon size={13} />} Contrast
                </button>
                <button
                  onClick={() =>
                    speakContent(
                      transformedData?.summary ||
                        'Welcome to the National Portal. Access citizen welfare programs, passport applications, and direct benefits with zero barriers.',
                    )
                  }
                  className="chip border border-core-400/40 bg-core-500/10 text-core-200"
                >
                  {reading ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  {reading ? 'Stop Audio' : 'Screen Reader'}
                </button>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {showOriginal && (
              <motion.div
                key="original"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="card"
              >
                <div className="mb-4 flex items-center justify-between text-danger-400">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} />
                    <h3 className="font-display text-lg font-semibold text-white">
                      Original Web Page ({targetUrl})
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">Unfiltered View</span>
                </div>
                <FakeComplexSite targetUrl={targetUrl} />
              </motion.div>
            )}

            {showIssues && (
              <motion.div
                key="issues"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="card"
              >
                <div className="mb-4 flex items-center gap-2 text-warning-400">
                  <AlertTriangle size={18} />
                  <h3 className="font-display text-lg font-semibold text-white">
                    WCAG AA Barriers Highlighted
                  </h3>
                </div>
                <FakeComplexSite targetUrl={targetUrl} highlighted />
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    '42 images missing descriptive alt tags',
                    'Low color contrast (< 4.5:1 ratio)',
                    'Missing keyboard focus rings & tab stops',
                    '9 form inputs without associated <label>',
                  ].map((t) => (
                    <div
                      key={t}
                      className="flex items-center gap-2 rounded-lg border border-danger-500/20 bg-danger-500/5 p-2.5 text-xs text-danger-400"
                    >
                      <AlertTriangle size={14} className="shrink-0" /> {t}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {showTransform && (
              <motion.div
                key="transform"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="card flex flex-col items-center justify-center py-20 text-center"
              >
                <SaarthiCore state="processing" size={220} showStars={false} />
                <div className="mt-6 font-display text-xl font-semibold text-white">
                  Synthesizing Accessible Structure…
                </div>
                <div className="mt-1 text-sm text-slate-400">
                  Injecting ARIA roles, high-contrast headings, keyboard skip-links, and plain language
                </div>
              </motion.div>
            )}

            {showAccessible && (
              <motion.div
                key="accessible"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className={`card ${
                  highContrast ? 'border-2 border-yellow-400 bg-black text-yellow-300' : ''
                }`}
                style={{ fontSize: `${fontSizeMultiplier * 100}%` }}
              >
                <div className="mb-4 flex items-center justify-between text-success-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} />
                    <h3
                      className={`font-display text-lg font-semibold ${
                        highContrast ? 'text-yellow-300' : 'text-white'
                      }`}
                    >
                      SAARTHI Accessible View
                    </h3>
                  </div>
                  <span className="text-xs text-success-400 font-mono">WCAG 2.1 AAA Ready</span>
                </div>

                <AccessiblePortalView
                  targetUrl={targetUrl}
                  highContrast={highContrast}
                  data={transformedData}
                  loading={loadingTransform}
                />

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: Type, label: 'Dyslexia Friendly' },
                    { icon: Keyboard, label: 'Keyboard Traps Fixed' },
                    { icon: Eye, label: 'Alt Text Injected' },
                    { icon: Volume2, label: 'Screen Reader Ready' },
                  ].map((f) => (
                    <div
                      key={f.label}
                      className="flex items-center gap-2 rounded-lg border border-success-500/20 bg-success-500/5 p-2.5 text-xs text-success-400"
                    >
                      <f.icon size={14} /> {f.label}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function FakeComplexSite({ targetUrl, highlighted }: { targetUrl: string; highlighted?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950 p-4 overflow-hidden">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-danger-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-warning-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-success-500/60" />
        </div>
        <span className="font-mono text-xs text-slate-500">{targetUrl}</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-40 rounded bg-white/10" />
          <div className="flex gap-2">
            <div className="h-4 w-12 rounded bg-white/5" />
            <div className="h-4 w-12 rounded bg-white/5" />
          </div>
        </div>
        <div className={`grid grid-cols-3 gap-2 ${highlighted ? 'ring-2 ring-danger-500/40 rounded-lg p-2' : ''}`}>
          <div className="h-16 rounded bg-white/5 flex items-center justify-center text-[10px] text-slate-600">Banner img (no alt)</div>
          <div className="h-16 rounded bg-white/5 flex items-center justify-center text-[10px] text-slate-600">Promo img (no alt)</div>
          <div className="h-16 rounded bg-white/5 flex items-center justify-center text-[10px] text-slate-600">Ad banner (no alt)</div>
        </div>
        <div className={`space-y-1.5 ${highlighted ? 'ring-2 ring-warning-500/40 rounded-lg p-2' : ''}`}>
          <div className="h-3 w-full rounded bg-white/10" />
          <div className="h-3 w-5/6 rounded bg-white/10" />
          <div className="h-3 w-4/6 rounded bg-white/10" />
        </div>
        <div className={`flex gap-2 ${highlighted ? 'ring-2 ring-danger-500/40 rounded-lg p-2' : ''}`}>
          <div className="h-8 flex-1 rounded bg-white/5 flex items-center px-2 text-[10px] text-slate-600">Unlabeled input</div>
          <div className="h-8 w-20 rounded bg-white/10" />
        </div>
      </div>
      <div className="mt-2 text-center text-[10px] text-slate-600">
        Original markup containing low-contrast text and unannounced interactive elements.
      </div>
    </div>
  );
}

function AccessiblePortalView({
  targetUrl,
  highContrast,
  data,
  loading,
}: {
  targetUrl: string;
  highContrast: boolean;
  data: AccessibleTransformResult | null;
  loading: boolean;
}) {
  const [activeTab, setActiveTab] = useState('all');
  const [formSubmitted, setFormSubmitted] = useState(false);

  const title = data?.title || 'National Public Services & Citizen Assistance';
  const summary =
    data?.summary ||
    'Access central government services, social welfare programs, identity cards, and Direct Benefit Transfers (DBT) directly with verified accessibility compliance.';
  const sections = data?.sections || [];
  const keyActions = data?.keyActions || [
    { label: 'Apply Online', description: 'Begin your direct application with step-by-step guidance' },
    { label: 'Track Status', description: 'Check status of your submitted application' },
    { label: 'Helpline & Support', description: 'Connect with live accessibility representatives' },
  ];

  return (
    <div
      className={`rounded-xl border p-6 ${
        highContrast
          ? 'border-yellow-400 bg-black text-yellow-300'
          : 'border-success-500/20 bg-ink-950 text-slate-200'
      }`}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <a
            href="#main-accessible-content"
            className="rounded bg-core-500 px-2 py-1 text-xs text-ink-950 font-bold focus:ring-2 focus:ring-white"
          >
            Skip to Main Content
          </a>
          <span className="text-xs text-slate-400">| Source: {targetUrl}</span>
          {loading && (
            <span className="flex items-center gap-1 text-xs text-core-400">
              <Loader2 size={12} className="animate-spin" /> Live AI Adapting…
            </span>
          )}
        </div>
        <h2
          className={`font-display text-xl font-semibold mt-2 ${
            highContrast ? 'text-yellow-300' : 'text-white'
          }`}
        >
          {title}
        </h2>
        {data?.notices && data.notices.length > 0 && (
          <div className="mt-3 rounded-lg border border-warning-500/30 bg-warning-500/10 p-3 text-xs text-warning-300 flex items-start gap-2">
            <ShieldCheck size={16} className="shrink-0 mt-0.5" />
            <div>
              <strong>Important Notice:</strong> {data.notices.join(' ')}
            </div>
          </div>
        )}
      </div>

      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Main accessible navigation">
        {keyActions.map((action, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(action.label.toLowerCase())}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
              activeTab === action.label.toLowerCase()
                ? highContrast
                  ? 'border-yellow-400 bg-yellow-400 text-black font-bold'
                  : 'border-core-400 bg-core-500/20 text-core-100 ring-1 ring-core-400'
                : highContrast
                ? 'border-yellow-400 bg-black text-yellow-300 hover:bg-yellow-400 hover:text-black'
                : 'border-core-400/20 bg-core-500/10 text-core-200 hover:bg-core-500/20'
            }`}
          >
            {action.label}
          </button>
        ))}
      </nav>

      <div className="space-y-4" id="main-accessible-content">
        <div className="rounded-lg border border-white/10 p-4">
          <h3 className={`font-semibold text-base ${highContrast ? 'text-yellow-300' : 'text-white'}`}>
            Executive Purpose
          </h3>
          <p className="text-sm leading-relaxed mt-1">{summary}</p>
        </div>

        {sections.map((sec, idx) => (
          <div key={idx} className="rounded-lg border border-white/10 p-4 space-y-2">
            <h3 className={`font-semibold text-sm ${highContrast ? 'text-yellow-300' : 'text-white'}`}>
              {sec.heading}
            </h3>
            <p className="text-xs text-slate-300">{sec.content}</p>
            {sec.simplifiedPoints && sec.simplifiedPoints.length > 0 && (
              <ul className="space-y-1 mt-2">
                {sec.simplifiedPoints.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-2 text-xs text-slate-300">
                    <Check size={14} className="shrink-0 text-success-400 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div className="rounded-lg border border-white/10 p-4">
          <label htmlFor="portal-ref-number" className={`block font-semibold text-sm mb-1.5 ${highContrast ? 'text-yellow-300' : 'text-white'}`}>
            Track Application Status
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="portal-ref-number"
              className="input flex-1"
              placeholder="e.g. DL-2026-98124"
              aria-label="Enter your application reference number"
            />
            <button
              onClick={() => setFormSubmitted(true)}
              className="btn-primary whitespace-nowrap"
            >
              Search Status
            </button>
          </div>
          {formSubmitted && (
            <p className="mt-2 text-xs text-success-400 flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Tracking request submitted. Status: Under Active Verification.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
