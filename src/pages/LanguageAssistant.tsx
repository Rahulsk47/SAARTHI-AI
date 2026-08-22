import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Wand2, Volume2, Copy, Check, ArrowRight, ArrowLeftRight } from 'lucide-react';
import SaarthiCore from '@/components/SaarthiCore';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import { LANGUAGES, type LanguageCode } from '@/context/AccessibilityContext';
import { TRANSLATIONS } from '@/data/demoData';
import { type CoreState } from '@/types/core';

type Mode = 'translate' | 'simplify' | 'both';

const SAMPLE_TEXT = TRANSLATIONS.ration.original;
const SIMPLIFIED_TEXT = TRANSLATIONS.ration.simplified;
const TRANSLATED: Record<string, string> = TRANSLATIONS.ration.languages;

export default function LanguageAssistant() {
  const [mode, setMode] = useState<Mode>('translate');
  const [sourceLang, setSourceLang] = useState<LanguageCode>('en');
  const [targetLang, setTargetLang] = useState<LanguageCode>('hi');
  const [coreState, setCoreState] = useState<CoreState>('idle');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const runProcess = () => {
    setCoreState('processing');
    setTimeout(() => setCoreState('analyzing'), 600);
    setTimeout(() => {
      let result = '';
      if (mode === 'simplify') {
        result = SIMPLIFIED_TEXT;
      } else if (mode === 'translate') {
        result = targetLang === 'en' ? SAMPLE_TEXT : (TRANSLATED[targetLang] ?? SIMPLIFIED_TEXT);
      } else {
        // both
        result = targetLang === 'en' ? SIMPLIFIED_TEXT : (TRANSLATED[targetLang] ?? SIMPLIFIED_TEXT);
      }
      setOutput(result);
      setCoreState('success');
    }, 1600);
  };

  const speakOutput = () => {
    if ('speechSynthesis' in window && output) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(output);
      utter.lang = targetLang === 'en' ? 'en-US' : `${targetLang}-IN`;
      window.speechSynthesis.speak(utter);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const swapLangs = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        title="Language Assistant"
        subtitle="Translate and simplify text across 8 Indian languages."
        icon={Languages}
      />

      {/* Mode selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        {([
          { key: 'translate', label: 'Translate', icon: ArrowRight },
          { key: 'simplify', label: 'Simplify', icon: Wand2 },
          { key: 'both', label: 'Translate + Simplify', icon: ArrowLeftRight },
        ] as { key: Mode; label: string; icon: typeof ArrowRight }[]).map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`btn ${mode === m.key ? 'btn-primary' : 'btn-ghost'}`}
          >
            <m.icon size={16} /> {m.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Core + language pickers */}
        <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <SectionCard className="flex flex-col items-center" delay={0}>
            <SaarthiCore state={coreState} size={180} showStars={false} />
          </SectionCard>

          {mode !== 'simplify' && (
            <SectionCard title="Languages" delay={0.1}>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">From</label>
                  <select
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value as LanguageCode)}
                    className="input"
                    aria-label="Source language"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.name} ({l.native})</option>
                    ))}
                  </select>
                </div>
                <button onClick={swapLangs} className="mx-auto flex text-slate-500 hover:text-core-300 transition" aria-label="Swap languages">
                  <ArrowLeftRight size={16} />
                </button>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">To</label>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value as LanguageCode)}
                    className="input"
                    aria-label="Target language"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.name} ({l.native})</option>
                    ))}
                  </select>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        {/* Right: input + output */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Input Text" delay={0}>
            <textarea
              defaultValue={SAMPLE_TEXT}
              className="input min-h-[140px] resize-y"
              aria-label="Input text to process"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">Sample: Ration card application text (demo)</span>
              <button onClick={runProcess} className="btn-primary">
                <Wand2 size={16} /> {mode === 'simplify' ? 'Simplify' : 'Process'}
              </button>
            </div>
          </SectionCard>

          <AnimatePresence>
            {output && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <SectionCard title="Output" delay={0}>
                  <div className="rounded-xl border border-white/10 bg-ink-900/40 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                      {mode === 'simplify' && <><Wand2 size={12} /> Simplified English</>}
                      {mode === 'translate' && <><Languages size={12} /> {LANGUAGES.find((l) => l.code === targetLang)?.name}</>}
                      {mode === 'both' && <><Wand2 size={12} /> Simplified · <Languages size={12} /> {LANGUAGES.find((l) => l.code === targetLang)?.name}</>}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-200">{output}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={speakOutput} className="btn-ghost text-sm">
                      <Volume2 size={16} /> Read Aloud
                    </button>
                    <button onClick={copyOutput} className="btn-ghost text-sm">
                      {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy</>}
                    </button>
                  </div>
                </SectionCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Language grid */}
          <SectionCard title="Supported Languages" icon={<Languages size={18} />} delay={0.1}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {LANGUAGES.map((l) => (
                <div
                  key={l.code}
                  className={`rounded-xl border p-3 text-center transition ${
                    targetLang === l.code && mode !== 'simplify'
                      ? 'border-core-400/40 bg-core-500/10'
                      : 'border-white/5 bg-ink-900/40'
                  }`}
                >
                  <div className="font-display text-lg font-semibold text-white">{l.native}</div>
                  <div className="text-xs text-slate-500">{l.name}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
