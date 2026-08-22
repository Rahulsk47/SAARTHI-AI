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
} from 'lucide-react';

import SaarthiCore from '@/components/SaarthiCore';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import {
  LANGUAGES,
  type LanguageCode,
} from '@/context/AccessibilityContext';
import type { CoreState } from '@/types/core';

type Mode = 'translate' | 'simplify' | 'both';

const SAMPLE_TEXT =
  'I would like to apply for a new ration card for my family. Please process my application and provide the required food supplies and benefits under the government ration scheme.';

const SIMPLIFIED_TEXT =
  'I need a new ration card for my family. Please check my application and help us receive government food and benefits.';

const TRANSLATED: Record<string, string> = {
  en: SAMPLE_TEXT,

  hi: 'मैं अपने परिवार के लिए नया राशन कार्ड बनवाना चाहता हूँ। कृपया मेरे आवेदन की प्रक्रिया पूरी करें और सरकारी राशन योजना के अंतर्गत आवश्यक खाद्य सामग्री और लाभ प्रदान करें।',

  kn: 'ನನ್ನ ಕುಟುಂಬಕ್ಕಾಗಿ ಹೊಸ ರೇಷನ್ ಕಾರ್ಡ್‌ಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ನಾನು ಬಯಸುತ್ತೇನೆ. ದಯವಿಟ್ಟು ನನ್ನ ಅರ್ಜಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಿ ಮತ್ತು ಸರ್ಕಾರಿ ರೇಷನ್ ಯೋಜನೆಯ ಅಡಿಯಲ್ಲಿ ಅಗತ್ಯ ಆಹಾರ ಮತ್ತು ಸೌಲಭ್ಯಗಳನ್ನು ಒದಗಿಸಿ.',

  ta: 'என் குடும்பத்திற்காக புதிய ரேஷன் கார்டுக்கு விண்ணப்பிக்க விரும்புகிறேன். தயவுசெய்து என் விண்ணப்பத்தை செயல்படுத்தி அரசின் ரேஷன் திட்டத்தின் கீழ் தேவையான உணவு மற்றும் சலுகைகளை வழங்கவும்.',

  te: 'నా కుటుంబం కోసం కొత్త రేషన్ కార్డు కోసం దరఖాస్తు చేయాలనుకుంటున్నాను. దయచేసి నా దరఖాస్తును ప్రాసెస్ చేసి ప్రభుత్వ రేషన్ పథకం కింద అవసరమైన ఆహారం మరియు ప్రయోజనాలను అందించండి.',

  ml: 'എന്റെ കുടുംബത്തിനായി പുതിയ റേഷൻ കാർഡിന് അപേക്ഷിക്കാനാണ് ഞാൻ ആഗ്രഹിക്കുന്നത്. ദയവായി എന്റെ അപേക്ഷ പരിഗണിച്ച് സർക്കാർ റേഷൻ പദ്ധതിയുടെ ആനുകൂല്യങ്ങൾ നൽകുക.',

  mr: 'माझ्या कुटुंबासाठी नवीन रेशन कार्डसाठी अर्ज करायचा आहे. कृपया माझ्या अर्जावर प्रक्रिया करून सरकारी रेशन योजनेअंतर्गत आवश्यक अन्न आणि लाभ द्यावेत.',

  bn: 'আমি আমার পরিবারের জন্য একটি নতুন রেশন কার্ডের আবেদন করতে চাই। অনুগ্রহ করে আমার আবেদনটি প্রক্রিয়া করুন এবং সরকারি রেশন প্রকল্পের অধীনে প্রয়োজনীয় খাদ্য ও সুবিধা প্রদান করুন।',
};

export default function LanguageAssistant() {
  const [mode, setMode] = useState<Mode>('translate');

  const [sourceLang, setSourceLang] =
    useState<LanguageCode>('en');

  const [targetLang, setTargetLang] =
    useState<LanguageCode>('hi');

  const [coreState, setCoreState] =
    useState<CoreState>('idle');

  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const runProcess = () => {
    setCoreState('processing');

    setTimeout(() => {
      setCoreState('analyzing');
    }, 600);

    setTimeout(() => {
      let result = '';

      if (mode === 'simplify') {
        result = SIMPLIFIED_TEXT;
      } else if (mode === 'translate') {
        result =
          targetLang === 'en'
            ? SAMPLE_TEXT
            : TRANSLATED[targetLang] ?? SIMPLIFIED_TEXT;
      } else {
        result =
          targetLang === 'en'
            ? SIMPLIFIED_TEXT
            : TRANSLATED[targetLang] ?? SIMPLIFIED_TEXT;
      }

      setOutput(result);
      setCoreState('success');
    }, 1600);
  };

  const speakOutput = () => {
    if (!output) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(output);

      utterance.lang =
        targetLang === 'en'
          ? 'en-US'
          : `${targetLang}-IN`;

      window.speechSynthesis.speak(utterance);
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const swapLangs = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
  };

  const getTargetLanguageName = () => {
    return (
      LANGUAGES.find(
        (language) => language.code === targetLang
      )?.name ?? 'Language'
    );
  };

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        title="Language Assistant"
        subtitle="Translate and simplify text across 8 Indian languages."
        icon={Languages}
      />

      {/* Mode Selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode('translate')}
          className={`btn ${
            mode === 'translate'
              ? 'btn-primary'
              : 'btn-ghost'
          }`}
        >
          <ArrowRight size={16} />
          Translate
        </button>

        <button
          type="button"
          onClick={() => setMode('simplify')}
          className={`btn ${
            mode === 'simplify'
              ? 'btn-primary'
              : 'btn-ghost'
          }`}
        >
          <Wand2 size={16} />
          Simplify
        </button>

        <button
          type="button"
          onClick={() => setMode('both')}
          className={`btn ${
            mode === 'both'
              ? 'btn-primary'
              : 'btn-ghost'
          }`}
        >
          <ArrowLeftRight size={16} />
          Translate + Simplify
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT SIDE */}
        <div className="space-y-4 lg:sticky lg:top-8 lg:self-start">
          <SectionCard
            className="flex flex-col items-center"
            delay={0}
          >
            <SaarthiCore
              state={coreState}
              size={180}
              showStars={false}
            />
          </SectionCard>

          {/* Language Selection */}
          {mode !== 'simplify' && (
            <SectionCard
              title="Languages"
              delay={0.1}
            >
              <div className="space-y-3">
                {/* From */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    From
                  </label>

                  <select
                    value={sourceLang}
                    onChange={(event) =>
                      setSourceLang(
                        event.target.value as LanguageCode
                      )
                    }
                    className="input"
                    aria-label="Source language"
                  >
                    {LANGUAGES.map((language) => (
                      <option
                        key={language.code}
                        value={language.code}
                      >
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
                    onChange={(event) =>
                      setTargetLang(
                        event.target.value as LanguageCode
                      )
                    }
                    className="input"
                    aria-label="Target language"
                  >
                    {LANGUAGES.map((language) => (
                      <option
                        key={language.code}
                        value={language.code}
                      >
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
          <SectionCard
            title="Input Text"
            delay={0}
          >
            <textarea
              defaultValue={SAMPLE_TEXT}
              className="input min-h-[140px] resize-y"
              aria-label="Input text to process"
            />

            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-xs text-slate-500">
                Sample: Ration card application text (demo)
              </span>

              <button
                type="button"
                onClick={runProcess}
                className="btn-primary"
              >
                <Wand2 size={16} />

                {mode === 'simplify'
                  ? 'Simplify'
                  : 'Process'}
              </button>
            </div>
          </SectionCard>

          {/* OUTPUT */}
          <AnimatePresence>
            {output && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 16,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                }}
              >
                <SectionCard
                  title="Output"
                  delay={0}
                >
                  <div className="rounded-xl border border-white/10 bg-ink-900/40 p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                      {mode === 'simplify' && (
                        <>
                          <Wand2 size={12} />
                          Simplified English
                        </>
                      )}

                      {mode === 'translate' && (
                        <>
                          <Languages size={12} />
                          {getTargetLanguageName()}
                        </>
                      )}

                      {mode === 'both' && (
                        <>
                          <Wand2 size={12} />
                          Simplified
                          <Languages size={12} />
                          {getTargetLanguageName()}
                        </>
                      )}
                    </div>

                    <p className="text-sm leading-relaxed text-slate-200">
                      {output}
                    </p>
                  </div>

                  <div className="mt-3 flex gap-2">
                    {/* Read Aloud */}
                    <button
                      type="button"
                      onClick={speakOutput}
                      className="btn-ghost text-sm"
                    >
                      <Volume2 size={16} />
                      Read Aloud
                    </button>

                    {/* Copy */}
                    <button
                      type="button"
                      onClick={copyOutput}
                      className="btn-ghost text-sm"
                    >
                      {copied ? (
                        <>
                          <Check size={16} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy
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
            title="Supported Languages"
            icon={<Languages size={18} />}
            delay={0.1}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {LANGUAGES.map((language) => (
                <div
                  key={language.code}
                  className={`rounded-xl border p-3 text-center transition ${
                    targetLang === language.code &&
                    mode !== 'simplify'
                      ? 'border-core-400/40 bg-core-500/10'
                      : 'border-white/5 bg-ink-900/40'
                  }`}
                >
                  <div className="font-display text-lg font-semibold text-white">
                    {language.native}
                  </div>

                  <div className="text-xs text-slate-500">
                    {language.name}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}