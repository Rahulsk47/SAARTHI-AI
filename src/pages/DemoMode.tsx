import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Globe,
  Eye,
  AlertTriangle,
  Wand2,
  FileText,
  Languages,
  Mic,
  Settings2,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import SaarthiCore from '@/components/SaarthiCore';
import { type CoreState } from '@/types/core';

interface DemoStep {
  id: string;
  label: string;
  state: CoreState;
  icon: typeof Globe;
  title: string;
  desc: string;
  link?: string;
  linkLabel?: string;
}

const STEPS: DemoStep[] = [
  {
    id: 'complex',
    label: 'Complex Website',
    state: 'processing',
    icon: Globe,
    title: 'A complex, hard-to-navigate website',
    desc: 'Many government and service portals are dense, have poor contrast, missing labels, and are hard to use — especially for people with disabilities.',
    link: '/analyzer',
    linkLabel: 'Open Website Analyzer',
  },
  {
    id: 'analysis',
    label: 'AI Analysis',
    state: 'analyzing',
    icon: Eye,
    title: 'SAARTHI Core analyzes the page',
    desc: 'The Core inspects the DOM, styles, images, forms, and structure to identify every accessibility barrier.',
    link: '/accessible-view',
    linkLabel: 'See Accessible View',
  },
  {
    id: 'score',
    label: 'Accessibility Score',
    state: 'thinking',
    icon: Sparkles,
    title: 'Accessibility score: 58 / 100',
    desc: 'SAARTHI calculates a score across four WCAG categories: Perceivable, Operable, Understandable, and Robust.',
    link: '/results',
    linkLabel: 'View Full Results',
  },
  {
    id: 'issues',
    label: 'Issues',
    state: 'analyzing',
    icon: AlertTriangle,
    title: '8 issues found · 2 critical',
    desc: 'Missing alt text, poor contrast, no keyboard focus, and unlabeled forms are the most severe barriers detected.',
    link: '/results',
    linkLabel: 'See All Issues',
  },
  {
    id: 'generate',
    label: 'Generate Accessible',
    state: 'processing',
    icon: Wand2,
    title: 'Generating an accessible experience',
    desc: 'SAARTHI reorganizes the content into a clean, readable, keyboard-navigable layout with proper labels and contrast.',
    link: '/accessible-view',
    linkLabel: 'Open Accessible View',
  },
  {
    id: 'transform',
    label: '3D Transformation',
    state: 'success',
    icon: Sparkles,
    title: 'Transformation complete',
    desc: 'The complex site is now a clean, accessible experience. Text is readable, forms are labeled, and navigation works with a keyboard.',
    link: '/accessible-view',
    linkLabel: 'View Result',
  },
  {
    id: 'document',
    label: 'Document AI',
    state: 'success',
    icon: FileText,
    title: 'Document AI extracts key information',
    desc: 'Upload any document to get summaries, important dates, eligibility, required documents, and next steps — simplified and translated.',
    link: '/document-ai',
    linkLabel: 'Open Document AI',
  },
  {
    id: 'translation',
    label: 'Translation',
    state: 'processing',
    icon: Languages,
    title: 'Translate across 8 Indian languages',
    desc: 'English, Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, and Malayalam — with simplify and read-aloud modes.',
    link: '/language',
    linkLabel: 'Open Language Assistant',
  },
  {
    id: 'voice',
    label: 'Voice',
    state: 'listening',
    icon: Mic,
    title: 'Talk to SAARTHI by voice',
    desc: 'An immersive 3D voice interface with live transcription, waveform visualization, and Core reactions.',
    link: '/voice',
    linkLabel: 'Open Voice Assistant',
  },
  {
    id: 'personalize',
    label: 'Personalization',
    state: 'success',
    icon: Settings2,
    title: 'Personalize your experience',
    desc: 'Adjust font size, contrast, text spacing, language, motion, and controls. The entire app adapts instantly.',
    link: '/accessibility',
    linkLabel: 'Open Accessibility Center',
  },
];

export default function DemoMode() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (step >= STEPS.length - 1) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => setStep((s) => s + 1), 3500);
    return () => clearTimeout(id);
  }, [step, playing]);

  const current = STEPS[step];
  const Icon = current.icon;

  const restart = () => {
    setStep(0);
    setPlaying(false);
  };

  return (
    <div className="px-6 py-8 md:px-10">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-core-400/30 bg-core-500/10 px-4 py-1.5 text-sm text-core-200">
          <Sparkles size={14} /> Hackathon Demo Flow
        </div>
        <h1 className="font-display text-4xl font-bold text-white">SAARTHI AI — Full Demo</h1>
        <p className="mt-2 text-slate-400 max-w-2xl mx-auto">
          Follow the complete journey: from a complex website to an accessible, translated, personalized experience.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex flex-wrap items-center justify-center gap-1.5">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            className={`group flex items-center gap-1.5 ${i === step ? 'text-core-200' : i < step ? 'text-success-400' : 'text-slate-600'}`}
            aria-label={s.label}
          >
            {i < step && <CheckCircle2 size={14} />}
            <div className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-core-400' : i < step ? 'w-2 bg-success-500' : 'w-2 bg-white/10'}`} />
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: Core */}
        <div className="flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.state + step}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.5 }}
            >
              <SaarthiCore state={current.state} size={340} showStars />
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="mt-8 flex items-center gap-3">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="btn-ghost disabled:opacity-30"
            >
              <ArrowLeft size={16} /> Prev
            </button>
            <button
              onClick={() => {
                if (step >= STEPS.length - 1) {
                  restart();
                  return;
                }
                setPlaying(!playing);
              }}
              className="btn-primary"
            >
              {playing ? <><Pause size={16} /> Pause</> : step >= STEPS.length - 1 ? <><RotateCcw size={16} /> Restart</> : <><Play size={16} /> Auto-play</>}
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep((s) => s + 1)} className="btn-ghost">
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <Link to="/dashboard" className="btn-ghost">
                Dashboard <ArrowRight size={16} />
              </Link>
            )}
          </div>

          <div className="mt-4 text-sm text-slate-500">
            Step {step + 1} of {STEPS.length} · {current.label}
          </div>
        </div>

        {/* Right: step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col justify-center"
          >
            <div className="card">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-core-500/15 border border-core-400/30 text-core-300">
                  <Icon size={26} />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-core-400">{current.label}</div>
                  <h2 className="font-display text-2xl font-semibold text-white">{current.title}</h2>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed">{current.desc}</p>

              {current.link && (
                <Link to={current.link} className="btn-primary mt-6">
                  {current.linkLabel} <ArrowRight size={16} />
                </Link>
              )}
            </div>

            {/* Mini step list */}
            <div className="mt-4 space-y-1">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setStep(i)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                    i === step ? 'bg-core-500/10 text-core-200' : i < step ? 'text-success-400/70' : 'text-slate-600 hover:text-slate-400'
                  }`}
                >
                  {i < step ? <CheckCircle2 size={14} /> : <span className="font-mono text-xs w-3.5">{i + 1}</span>}
                  {s.label}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
