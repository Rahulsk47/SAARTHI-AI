import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  Globe,
  FileText,
  Mic,
  Languages,
  Accessibility,
  Zap,
  Eye,
  Volume2,
  Type,
  ShieldCheck,
  Play,
} from 'lucide-react';
import SaarthiCore from '@/components/SaarthiCore';
import { CORE_STATES, type CoreState } from '@/types/core';

const FEATURES = [
  { icon: Globe, title: 'Website Analyzer', desc: 'Enter any URL to get an accessibility score, issues, and fixes.', to: '/analyzer' },
  { icon: Sparkles, title: 'Accessible View', desc: 'Watch complex sites transform into clean, accessible experiences.', to: '/accessible-view' },
  { icon: FileText, title: 'Document AI', desc: 'Summarize, simplify, translate, and read documents aloud.', to: '/document-ai' },
  { icon: Mic, title: 'Voice Assistant', desc: 'Immersive 3D voice interface with live transcription.', to: '/voice' },
  { icon: Languages, title: 'Language Assistant', desc: '8 Indian languages with translate and simplify modes.', to: '/language' },
  { icon: Accessibility, title: 'Accessibility Center', desc: 'Global controls that adapt the entire app to your needs.', to: '/accessibility' },
];

const STATS = [
  { value: '8', label: 'Indian Languages' },
  { value: '58→92', label: 'Avg. Score Lift' },
  { value: '7', label: 'Core States' },
  { value: '100%', label: 'Keyboard Navigable' },
];

export default function Landing() {
  const [coreState, setCoreState] = useState<CoreState>('idle');
  const [stateIndex, setStateIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStateIndex((i) => {
        const next = (i + 1) % CORE_STATES.length;
        setCoreState(CORE_STATES[next]);
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-ink-950 text-slate-200 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-core-400 to-core-700 shadow-glow flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-core-200/40 animate-spin-slow" />
              <Sparkles size={18} className="text-ink-950" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold text-white leading-none">SAARTHI AI</div>
              <div className="text-[10px] tracking-[0.2em] text-core-300 uppercase">The Internet Adapts to You</div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-core-300 transition">Features</a>
            <a href="#how" className="hover:text-core-300 transition">How it Works</a>
            <Link to="/demo" className="hover:text-core-300 transition">Demo</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="btn-ghost text-sm">Sign In</Link>
            <Link to="/demo" className="btn-primary text-sm">
              <Play size={16} /> Try Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-core-600/10 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-accent-500/5 blur-[100px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-core-400/30 bg-core-500/10 px-4 py-1.5 text-sm text-core-200">
              <Zap size={14} /> AI-Powered Accessibility Platform
            </div>
            <h1 className="font-display text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
              The Internet
              <br />
              Should Adapt to <span className="shimmer-text">You</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-400">
              SAARTHI AI helps you understand complex websites and documents through AI, voice,
              language translation, text simplification, and personalized accessibility controls.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/demo" className="btn-primary text-base">
                Start Demo <ArrowRight size={18} />
              </Link>
              <Link to="/auth" className="btn-ghost text-base">
                Sign In / Sign Up
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-2xl font-bold text-core-300">{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-center justify-center"
          >
            <div className="relative">
              <SaarthiCore state={coreState} size={420} showStars />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={coreState}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mt-4 text-center"
              >
                <div className="font-display text-xl font-semibold capitalize text-white">{coreState}</div>
                <div className="text-sm text-slate-500">Core cycling through all states</div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl font-bold text-white">Everything you need to access the web</h2>
            <p className="mt-3 text-slate-400">Six powerful tools, one unified experience.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  to={f.to}
                  className="group block h-full card hover:border-core-400/40 hover:bg-ink-700/60 transition-all duration-300"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-core-500/15 border border-core-400/30 text-core-300 group-hover:scale-110 transition-transform">
                    <f.icon size={24} />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-sm text-core-300 opacity-0 group-hover:opacity-100 transition">
                    Open <ArrowRight size={14} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl font-bold text-white">How SAARTHI works</h2>
            <p className="mt-3 text-slate-400">From complex to accessible in four steps.</p>
          </div>
          <div className="space-y-4">
            {[
              { icon: Globe, title: 'Capture', desc: 'Enter a URL or upload a document. SAARTHI Core activates and begins analysis.' },
              { icon: Eye, title: 'Analyze', desc: 'AI identifies accessibility barriers, complexity, and language issues.' },
              { icon: Zap, title: 'Transform', desc: 'Content is simplified, translated, and reorganized for clarity.' },
              { icon: ShieldCheck, title: 'Accessible', desc: 'You get a clean, readable, navigable experience tailored to your needs.' },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-center gap-6 card"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-core-500/15 border border-core-400/30 text-core-300">
                  <step.icon size={26} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-core-400">0{i + 1}</span>
                    <h3 className="font-display text-xl font-semibold text-white">{step.title}</h3>
                  </div>
                  <p className="mt-1 text-slate-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities strip */}
      <section className="relative py-16 px-6 border-y border-white/5 bg-ink-900/40">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { icon: Type, label: 'Text Simplification' },
            { icon: Languages, label: '8 Languages' },
            { icon: Volume2, label: 'Read Aloud' },
            { icon: Accessibility, label: 'Personal Controls' },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-3">
              <c.icon size={22} className="text-core-400" />
              <span className="text-sm text-slate-300">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-4xl font-bold text-white">Ready to experience the adapted web?</h2>
          <p className="mt-4 text-slate-400">
            Try the full hackathon demo flow — from complex website to accessible experience — in minutes.
          </p>
          <Link to="/demo" className="btn-primary mt-8 text-base">
            <Play size={18} /> Launch Demo Mode
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-core-400 to-core-700 flex items-center justify-center">
              <Sparkles size={14} className="text-ink-950" />
            </div>
            <span className="font-display font-semibold text-white">SAARTHI AI</span>
          </div>
          <p className="text-sm text-slate-500">The Internet Should Adapt to You. © 2026</p>
        </div>
      </footer>
    </div>
  );
}
