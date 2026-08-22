import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Volume2,
  Square,
  Send,
  Trash2,
  AlertCircle,
  Sparkles,
  VolumeX,
} from 'lucide-react';

import SaarthiCore from '@/components/SaarthiCore';
import PageHeader from '@/components/PageHeader';
import { queryVoice } from '@/lib/ai';
import { addActivityLog } from '@/lib/data';
import { type CoreState } from '@/types/core';

interface TranscriptEntry {
  id: string;
  speaker: 'user' | 'saarthi';
  text: string;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

const QUICK_SUGGESTIONS = [
  'How do I make a website accessible for screen reader users?',
  'What is the minimum WCAG AA color contrast ratio?',
  'How to structure headings and skip links properly?',
  'Explain what ARIA live regions are used for.',
];

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [coreState, setCoreState] = useState<CoreState>('idle');
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([
    {
      id: 'init',
      speaker: 'saarthi',
      text: "Hello! I am SAARTHI AI, your voice-guided digital accessibility assistant. Ask me anything about WCAG guidelines, website remediation, or public services.",
    },
  ]);
  const [textInput, setTextInput] = useState('');
  const [waveform, setWaveform] = useState<number[]>(new Array(32).fill(0.1));
  const [errorMessage, setErrorMessage] = useState('');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, coreState]);

  useEffect(() => {
    if (!listening) {
      setWaveform(new Array(32).fill(0.1));
      return;
    }

    const intervalId = window.setInterval(() => {
      setWaveform(
        Array.from({ length: 32 }, () => 0.15 + Math.random() * 0.85),
      );
    }, 100);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [listening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getSpeechRecognition = (): SpeechRecognitionConstructor | null => {
    const speechWindow = window as SpeechRecognitionWindow;
    return (
      speechWindow.SpeechRecognition ??
      speechWindow.webkitSpeechRecognition ??
      null
    );
  };

  const stopRecognition = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {}
    recognitionRef.current = null;
  };

  const startListening = () => {
    if (listening) return;
    setErrorMessage('');

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setErrorMessage(
        'Voice recognition API is not supported directly in this browser environment. You can type queries below, or use Google Chrome/Edge.',
      );
      setCoreState('idle');
      setListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';
      recognition.maxAlternatives = 1;

      let finalText = '';

      recognition.onstart = () => {
        setListening(true);
        setCoreState('listening');
        setErrorMessage('');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let transcriptText = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          if (result && result.isFinal && result[0]) {
            transcriptText += result[0].transcript;
          }
        }
        if (transcriptText.trim()) {
          finalText += transcriptText + ' ';
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.warn('Speech recognition notice:', event.error);
        setListening(false);
        setCoreState('idle');

        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access was denied. Please allow microphone permissions or type below.');
        } else if (event.error === 'no-speech') {
          setErrorMessage('No speech detected. Please speak clearly into your microphone.');
        } else {
          setErrorMessage(`Speech recognition notice (${event.error}). You can type below.`);
        }
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        setListening(false);
        recognitionRef.current = null;
        const text = finalText.trim();
        if (text) {
          submitQuery(text);
        } else {
          setCoreState('idle');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Could not start recognition:', error);
      setListening(false);
      setCoreState('idle');
      setErrorMessage('Could not initialize microphone. Please type your query below.');
      recognitionRef.current = null;
    }
  };

  const stopListening = () => {
    setListening(false);
    setCoreState('idle');
    stopRecognition();
  };

  const submitQuery = async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;

    setErrorMessage('');
    if (recognitionRef.current) {
      stopRecognition();
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }

    const userEntry: TranscriptEntry = {
      id: `user-${Date.now()}`,
      speaker: 'user',
      text: cleanText,
    };

    setTranscript((prev) => [...prev, userEntry]);
    setCoreState('thinking');

    try {
      const reply = await queryVoice(cleanText);
      await addActivityLog('voice', 'Voice Assistant', cleanText.slice(0, 40));

      const saarthiEntry: TranscriptEntry = {
        id: `saarthi-${Date.now()}`,
        speaker: 'saarthi',
        text: reply,
      };

      setTranscript((prev) => [...prev, saarthiEntry]);
      speakResponse(reply);
    } catch (err: any) {
      console.error('Voice AI error:', err);
      const fallbackReply = `I understand your question about "${cleanText}". SAARTHI AI is built to evaluate WCAG 2.1 compliance, simplify government documents, and translate between 8 Indian languages.`;
      setTranscript((prev) => [
        ...prev,
        { id: `saarthi-${Date.now()}`, speaker: 'saarthi', text: fallbackReply },
      ]);
      speakResponse(fallbackReply);
    }
  };

  const speakResponse = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setCoreState('success');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1;

      utterance.onstart = () => {
        setSpeaking(true);
        setCoreState('processing');
      };

      utterance.onend = () => {
        setSpeaking(false);
        setCoreState('success');
        setTimeout(() => setCoreState('idle'), 2500);
      };

      utterance.onerror = () => {
        setSpeaking(false);
        setCoreState('idle');
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setCoreState('idle');
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      setCoreState('idle');
    }
  };

  const handleSend = () => {
    const message = textInput.trim();
    if (!message) return;
    setTextInput('');
    submitQuery(message);
  };

  const clearTranscript = () => {
    if (recognitionRef.current) stopRecognition();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
    setTranscript([
      {
        id: 'init',
        speaker: 'saarthi',
        text: "Hello! I am SAARTHI AI. How can I assist with your accessibility needs?",
      },
    ]);
    setTextInput('');
    setListening(false);
    setCoreState('idle');
    setErrorMessage('');
  };

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        title="Voice Assistant"
        subtitle="Conversational AI accessibility assistant powered by Gemini 2.5."
        icon={Mic}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT SIDE */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <SaarthiCore state={coreState} size={320} showStars={false} />
            {listening && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-core-400"
              />
            )}
          </div>

          {/* WAVEFORM */}
          <div
            className="mt-6 flex h-16 items-center gap-1"
            aria-label={listening ? 'Voice waveform active' : 'Voice inactive'}
          >
            {waveform.map((height, index) => (
              <motion.div
                key={index}
                animate={{ height: `${Math.max(height * 100, 6)}%` }}
                transition={{ duration: 0.1 }}
                className={`w-1.5 rounded-full ${
                  listening ? 'bg-core-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* CONTROLS */}
          <div className="mt-6 flex items-center gap-4">
            {!listening ? (
              <button
                type="button"
                id="voice-start-mic-button"
                onClick={startListening}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-core-500 text-ink-950 shadow-glow-lg transition hover:scale-105"
                aria-label="Start listening"
              >
                <Mic size={28} />
              </button>
            ) : (
              <button
                type="button"
                id="voice-stop-mic-button"
                onClick={stopListening}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-500 text-white shadow-lg transition hover:scale-105"
                aria-label="Stop listening"
              >
                <Square size={24} />
              </button>
            )}

            {speaking && (
              <button
                onClick={stopSpeaking}
                className="btn-secondary text-xs flex items-center gap-1 text-warning-400"
              >
                <VolumeX size={14} /> Stop Voice
              </button>
            )}
          </div>

          <div className="mt-3 text-center text-sm text-slate-400">
            {listening
              ? 'Listening… speak now'
              : 'Tap microphone or choose a prompt below'}
          </div>

          {/* QUICK PROMPTS */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-md">
            {QUICK_SUGGESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => submitQuery(q)}
                className="chip border border-white/10 text-xs text-slate-400 hover:border-core-400/40 hover:text-core-200 text-left"
              >
                {q}
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="mt-5 flex max-w-md items-start gap-2 rounded-xl border border-danger-500/20 bg-danger-500/5 p-3 text-xs text-danger-400">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* RIGHT SIDE - TRANSCRIPT */}
        <div
          className="card flex flex-col"
          style={{ minHeight: '520px' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-core-400" /> Live AI Dialogue
            </h3>

            <button
              type="button"
              onClick={clearTranscript}
              className="text-slate-500 transition hover:text-danger-400"
              aria-label="Clear transcript"
              title="Clear transcript"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {transcript.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    entry.speaker === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl border p-3.5 text-sm ${
                      entry.speaker === 'user'
                        ? 'border-core-400/20 bg-core-500/15 text-core-100'
                        : 'border-white/5 bg-ink-900/60 text-slate-200'
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-500">
                      {entry.speaker === 'user' ? (
                        <>
                          <Mic size={10} /> You
                        </>
                      ) : (
                        <>
                          <Volume2 size={10} className="text-core-400" /> SAARTHI AI
                        </>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {entry.text}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {coreState === 'thinking' && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/5 bg-ink-900/60 p-3.5">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((index) => (
                      <motion.div
                        key={index}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: index * 0.2,
                        }}
                        className="h-2 w-2 rounded-full bg-core-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>

          {/* TEXT INPUT */}
          <div className="mt-4 flex gap-2 border-t border-white/5 pt-4">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Or type your question here…"
              className="input flex-1"
              aria-label="Type a question"
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={!textInput.trim()}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
