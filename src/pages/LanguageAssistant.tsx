import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Languages,
  Wand2,
  Volume2,
  Copy,
  Check,
  ArrowRight,
  ArrowLeftRight,
  Sparkles,
  Loader2,
  AlertCircle,
  VolumeX,
} from 'lucide-react';

import SaarthiCore from '@/components/SaarthiCore';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import { LANGUAGES, type LanguageCode } from '@/context/AccessibilityContext';
import { translateText, simplifyText } from '@/lib/ai';
import { addActivityLog } from '@/lib/data';
import type { CoreState } from '@/types/core';

type Mode = 'translate' | 'simplify' | 'both';

const PRESETS = [
  {
    label: 'Ration Card Application',
    text: 'I would like to apply for a new ration card for my family. Please process my application and provide the required food supplies and benefits under the government ration scheme.',
  },
  {
    label: 'Disability Certificate',
    text: 'Applicant requests a medical board assessment for issuing a Unique Disability ID (UDID) card for availing transport concessions and educational reservations.',
  },
  {
    label: 'Bank Account & DBT',
    text: 'Please link my Aadhaar number with my savings bank account to receive Direct Benefit Transfer (DBT) welfare subsidies without interruption.',
  },
];

export default function LanguageAssistant() {
  const [mode, setMode] = useState<Mode>('translate');
  const [sourceLang, setSourceLang] = useState<LanguageCode>('en');
  const [targetLang, setTargetLang] = useState<LanguageCode>('hi');
  const [coreState, setCoreState] = useState<CoreState>('idle');
  const [inputText, setInputText] = useState(PRESETS[0].text);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const runProcess = async () => {
    if (!inputText.trim() || loading) return;

    setError(null);
    setLoading(true);
    setCoreState('processing');

    try {
      setCoreState('analyzing');
      let result = '';

      if (mode === 'simplify') {
        result = await simplifyText(inputText);
        await addActivityLog('translation', 'Simplified text', `${inputText.slice(0, 40)}...`);
      } else if (mode === 'translate') {
        result = await translateText(inputText, targetLang, false);
        await addActivityLog(
          'translation',
          `Translated to ${targetLang}`,
          `${inputText.slice(0, 40)}...`,
        );
      } else {
        // Both: Translate + Simplify
        result = await translateText(inputText, targetLang, true);
        await addActivityLog(
          'translation',
          `Translated & Simplified into ${targetLang}`,
          `${inputText.slice(0, 40)}...`,
        );
      }

      setOutput(result);
      setCoreState('success');
    } catch (err: any) {
      console.error('Translation error:', err);
      setError(err?.message || 'Processing failed.');
      setCoreState('error');
    } finally {
      setLoading(false);
      setTimeout(() => setCoreState('idle'), 2000);
    }
  };

  const speakOutput = () => {
    if (!output) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      if (speaking) {
        setSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(output);
      utterance.lang = targetLang === 'en' ? 'en-IN' : `${targetLang}-IN`;
      utterance.rate = 0.92;

      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const swapLangs = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  const getTargetLanguageName = () => {
    return (
      LANGUAGES.find((language) => language.code === targetLang)?.name ?? 'Language'
    );
  };

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        title="Language & Plain Language Assistant"
        subtitle="Translate and simplify complex language into 8 Indian languages using Gemini AI."
        icon={Languages}
      />

      {/* Mode Selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode('translate')}
          className={`btn ${mode === 'translate' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <ArrowRight size={16} />
          Translate
        </button>

        <button
          type="button"
          onClick={() => setMode('simplify')}
          className={`btn ${mode === 'simplify' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <Wand2 size={16} />
          Simplify Plain English
        </button>

        <button
          type="button"
          onClick={() => setMode('both')}
          className={`btn ${mode === 'both' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <ArrowLeftRight size={16} />
          Translate + Simplify
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT SIDE */}
        <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <SectionCard className="flex flex-col items-center" delay={0}>
            <SaarthiCore state={coreState} size={180} showStars={false} />
            <div className="mt-3 text-center">
              <span className="text-xs text-slate-400">
                {loading ? 'Processing with Gemini AI...' : 'Multilingual Neural Engine'}
              </span>
            </div>
          </SectionCard>

          {/* Language Selection */}
          {mode !== 'simplify' && (
            <SectionCard title="Languages" delay={0.1}>
              <div className="space-y-3">
                {/* From */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    From
                  </label>
                  <select
                    value={sourceLang}
                    onChange={(event) => setSourceLang(event.target.value as LanguageCode)}
                    className="input"
                    aria-label="Source language"
                  >
                    {LANGUAGES.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.name} ({language.native})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap */}
                <button
                  type="button"
                  onClick={swapLangs}
                  className="mx-auto flex text-slate-500 transition hover:text-core-300"
                  aria-label="Swap languages"
                >
                  <ArrowLeftRight size={16} />
                </button>

                {/* To */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    To
                  </label>
                  <select
                    value={targetLang}
                    onChange={(event) => setTargetLang(event.target.value as LanguageCode)}
                    className="input"
                    aria-label="Target language"
                  >
                    {LANGUAGES.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.name} ({language.native})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6 lg:col-span-2">
          {/* INPUT */}
          <SectionCard title="Input Text" delay={0}>
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="text-xs text-slate-500 self-center">Presets:</span>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setInputText(p.text)}
                  className="chip border border-white/10 text-xs text-slate-400 hover:border-core-400/40 hover:text-core-300"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="input min-h-[140px] resize-y"
              placeholder="Enter or paste text here to translate or simplify..."
              aria-label="Input text to process"
            />

            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3 text-xs text-danger-400">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                {inputText.length} characters · AI Plain Language Processor
              </span>

              <button
                type="button"
                id="process-language-button"
                disabled={loading || !inputText.trim()}
                onClick={runProcess}
                className="btn-primary disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Processing…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    {mode === 'simplify'
                      ? 'Simplify Text'
                      : mode === 'both'
                      ? 'Translate & Simplify'
                      : `Translate to ${getTargetLanguageName()}`}
                  </>
                )}
              </button>
            </div>
          </SectionCard>

          {/* OUTPUT */}
          <AnimatePresence>
            {output && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <SectionCard title="Output Result" delay={0}>
                  <div className="rounded-xl border border-core-500/20 bg-ink-900/60 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs text-core-300 font-medium">
                      {mode === 'simplify' && (
                        <>
                          <Wand2 size={12} /> Plain Language English
                        </>
                      )}
                      {mode === 'translate' && (
                        <>
                          <Languages size={12} /> {getTargetLanguageName()}
                        </>
                      )}
                      {mode === 'both' && (
                        <>
                          <Wand2 size={12} /> Simplified &bull; <Languages size={12} /> {getTargetLanguageName()}
                        </>
                      )}
                    </div>

                    <p className="text-base leading-relaxed text-slate-100 whitespace-pre-line">
                      {output}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {/* Read Aloud */}
                    <button
                      type="button"
                      onClick={speakOutput}
                      className="btn-secondary text-sm"
                    >
                      {speaking ? <VolumeX size={16} className="text-warning-400" /> : <Volume2 size={16} />}
                      {speaking ? 'Stop Speaking' : 'Read Aloud'}
                    </button>

                    {/* Copy */}
                    <button
                      type="button"
                      onClick={copyOutput}
                      className="btn-ghost text-sm"
                    >
                      {copied ? (
                        <>
                          <Check size={16} className="text-success-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={16} /> Copy
                        </>
                      )}
                    </button>
                  </div>
                </SectionCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUPPORTED LANGUAGES */}
          <SectionCard
            title="Supported Languages & Dialects"
            icon={<Languages size={18} />}
            delay={0.1}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => setTargetLang(language.code)}
                  className={`rounded-xl border p-3 text-center transition cursor-pointer ${
                    targetLang === language.code && mode !== 'simplify'
                      ? 'border-core-400 bg-core-500/15'
                      : 'border-white/5 bg-ink-900/40 hover:border-white/20'
                  }`}
                >
                  <div className="font-display text-lg font-semibold text-white">
                    {language.native}
                  </div>
                  <div className="text-xs text-slate-400">{language.name}</div>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
