import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  Type,
  Keyboard,
  Languages,
  Volume2,
  AlertTriangle,
} from 'lucide-react';
import SaarthiCore from '@/components/SaarthiCore';
import PageHeader from '@/components/PageHeader';
import { type CoreState } from '@/types/core';

const STAGES = [
  {
    state: 'processing' as CoreState,
    label: 'Complex Website',
    desc: 'Loading the original page with all its barriers',
  },
  {
    state: 'analyzing' as CoreState,
    label: 'AI Analysis',
    desc: 'SAARTHI Core identifies accessibility issues',
  },
  {
    state: 'thinking' as CoreState,
    label: 'Accessibility Issues',
    desc: '8 issues detected · 2 critical · 2 serious',
  },
  {
    state: 'processing' as CoreState,
    label: 'Transformation',
    desc: 'Reorganizing content for clarity and access',
  },
  {
    state: 'success' as CoreState,
    label: 'Accessible Experience',
    desc: 'Clean, readable, navigable result',
  },
];

export default function AccessibleView() {
  const [stage, setStage] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

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

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        title="Accessible View"
        subtitle="Watch a complex website transform into a clean, accessible experience."
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
                  ? 'border-core-400/40 bg-core-500/15 text-core-200'
                  : i < stage
                  ? 'border-success-500/20 bg-success-500/5 text-success-400'
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
        {/* Core */}
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
                <div className="text-sm text-slate-500">{current.desc}</div>
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
                Continue to Document AI <ArrowRight size={16} />
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
            {autoPlay ? 'Pause' : 'Auto-play'} transformation
          </button>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {showOriginal && (
              <motion.div
                key="original"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="card"
              >
                <div className="mb-4 flex items-center gap-2 text-danger-400">
                  <AlertTriangle size={18} />
                  <h3 className="font-display text-lg font-semibold text-white">Original Complex Website</h3>
                </div>
                <FakeComplexSite />
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
                  <h3 className="font-display text-lg font-semibold text-white">Issues Detected</h3>
                </div>
                <FakeComplexSite highlighted />
                <div className="mt-4 space-y-2">
                  {[
                    '42 images missing alt text',
                    'Color contrast below 4.5:1 minimum',
                    'No keyboard focus indicators',
                    '9 form fields without labels',
                  ].map((t) => (
                    <div key={t} className="flex items-center gap-2 rounded-lg border border-danger-500/20 bg-danger-500/5 p-2.5 text-sm text-danger-400">
                      <AlertTriangle size={14} /> {t}
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
                className="card flex flex-col items-center justify-center py-20"
              >
                <SaarthiCore state="processing" size={220} showStars={false} />
                <div className="mt-6 font-display text-xl font-semibold text-white">Transforming…</div>
                <div className="text-sm text-slate-500">Reorganizing content, fixing contrast, adding labels</div>
              </motion.div>
            )}

            {showAccessible && (
              <motion.div
                key="accessible"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="card"
              >
                <div className="mb-4 flex items-center gap-2 text-success-400">
                  <CheckCircle2 size={18} />
                  <h3 className="font-display text-lg font-semibold text-white">Accessible Experience</h3>
                </div>
                <FakeAccessibleSite />
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: Type, label: 'Readable text' },
                    { icon: Keyboard, label: 'Keyboard nav' },
                    { icon: Eye, label: 'Alt text added' },
                    { icon: Volume2, label: 'Screen reader' },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 rounded-lg border border-success-500/20 bg-success-500/5 p-2.5 text-sm text-success-400">
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

function FakeComplexSite({ highlighted }: { highlighted?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-ink-950 p-4 overflow-hidden">
      {/* Fake toolbar */}
      <div className="mb-3 flex gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-danger-500/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-warning-500/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-success-500/60" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-5 w-40 rounded bg-white/10" />
          <div className="flex gap-2">
            <div className="h-4 w-12 rounded bg-white/5" />
            <div className="h-4 w-12 rounded bg-white/5" />
          </div>
        </div>
        <div className={`grid grid-cols-3 gap-2 ${highlighted ? 'ring-2 ring-danger-500/40 rounded-lg p-2' : ''}`}>
          <div className="h-20 rounded bg-white/5" />
          <div className="h-20 rounded bg-white/5" />
          <div className="h-20 rounded bg-white/5" />
        </div>
        <div className={`space-y-1.5 ${highlighted ? 'ring-2 ring-warning-500/40 rounded-lg p-2' : ''}`}>
          <div className="h-3 w-full rounded bg-white/10" />
          <div className="h-3 w-5/6 rounded bg-white/10" />
          <div className="h-3 w-4/6 rounded bg-white/10" />
        </div>
        <div className={`flex gap-2 ${highlighted ? 'ring-2 ring-danger-500/40 rounded-lg p-2' : ''}`}>
          <div className="h-8 flex-1 rounded bg-white/5" />
          <div className="h-8 w-20 rounded bg-white/10" />
        </div>
      </div>
      <div className="mt-2 text-center text-[10px] text-slate-600">Simulated original page · Demo data</div>
    </div>
  );
}

function FakeAccessibleSite() {
  return (
    <div className="rounded-xl border border-success-500/20 bg-ink-950 p-6">
      <div className="mb-4">
        <div className="font-display text-xl font-semibold text-white">Government Services Portal</div>
        <div className="text-sm text-slate-400 mt-1">Accessible version · Simplified layout</div>
      </div>
      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Main navigation">
        {['Home', 'Services', 'Documents', 'Contact'].map((n) => (
          <span key={n} className="rounded-lg border border-core-400/20 bg-core-500/10 px-3 py-1.5 text-sm text-core-200">
            {n}
          </span>
        ))}
      </nav>
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-white">Apply for a Ration Card</h3>
          <p className="text-sm text-slate-300 mt-1">
            Submit your application online with the required documents. The process takes about 15 minutes.
          </p>
        </div>
        <div>
          <h3 className="font-medium text-white">Track Your Application</h3>
          <p className="text-sm text-slate-300 mt-1">
            Enter your reference number to check the status of your submission.
          </p>
          <div className="mt-2 flex gap-2">
            <input className="input flex-1" placeholder="Reference number" aria-label="Reference number" />
            <button className="btn-primary">Track</button>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-slate-400">
          <Languages size={16} className="text-core-400" />
          Language: English · Read aloud available · Keyboard navigable
        </div>
      </div>
    </div>
  );
}