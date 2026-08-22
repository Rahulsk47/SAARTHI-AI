import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, Square, Send, Trash2 } from 'lucide-react';
import SaarthiCore from '@/components/SaarthiCore';
import PageHeader from '@/components/PageHeader';
import { type CoreState } from '@/types/core';

interface TranscriptEntry {
  id: string;
  speaker: 'user' | 'saarthi';
  text: string;
}

const DEMO_RESPONSES: Record<string, string> = {
  default: "I'm SAARTHI, your AI accessibility assistant. I can help you understand websites, simplify documents, translate between Indian languages, and check accessibility. What would you like to do?",
  website: "I can analyze any website for accessibility issues. Go to the Website Analyzer, enter a URL, and I'll check it for WCAG compliance, color contrast, keyboard navigation, and more. Would you like me to walk you through it?",
  document: "Upload any document to the Document AI page and I'll summarize it, extract important dates, check eligibility, list required documents, and give you next steps. I can also simplify or translate it for you.",
  translate: "I support English, Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, and Malayalam. Open the Language Assistant to translate or simplify any text. You can also combine both modes.",
  hello: "Hello! I'm here to help make the internet accessible to you. How can I assist today?",
  help: "I can help you with: analyzing websites for accessibility, simplifying complex documents, translating between 8 Indian languages, reading content aloud, and personalizing your experience. Just tell me what you need!",
};

function getResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes('website') || q.includes('analyze') || q.includes('url')) return DEMO_RESPONSES.website;
  if (q.includes('document') || q.includes('pdf') || q.includes('upload')) return DEMO_RESPONSES.document;
  if (q.includes('translat') || q.includes('language') || q.includes('hindi')) return DEMO_RESPONSES.translate;
  if (q.includes('hello') || q.includes('hi ') || q.startsWith('hi')) return DEMO_RESPONSES.hello;
  if (q.includes('help') || q.includes('what can you')) return DEMO_RESPONSES.help;
  return DEMO_RESPONSES.default;
}

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [coreState, setCoreState] = useState<CoreState>('idle');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([
    { id: 'init', speaker: 'saarthi', text: DEMO_RESPONSES.default },
  ]);
  const [textInput, setTextInput] = useState('');
  const [waveform, setWaveform] = useState<number[]>(new Array(32).fill(0.1));
  const recognitionRef = useRef<unknown>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Animate waveform when listening
  useEffect(() => {
    if (!listening) {
      setWaveform(new Array(32).fill(0.1));
      return;
    }
    const id = setInterval(() => {
      setWaveform(Array.from({ length: 32 }, () => 0.15 + Math.random() * 0.85));
    }, 100);
    return () => clearInterval(id);
  }, [listening]);

  const startListening = () => {
    setListening(true);
    setCoreState('listening');

    const SR = (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;
    if (SR) {
      const recognition = new SR();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let finalText = '';
      recognition.onresult = (event: { resultIndex: number; results: { isFinal: boolean; [0]: { transcript: string } }[] }) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
          }
        }
      };
      recognition.onerror = () => {
        setListening(false);
        setCoreState('idle');
      };
      recognition.onend = () => {
        setListening(false);
        if (finalText.trim()) {
          submitQuery(finalText.trim());
        } else {
          setCoreState('idle');
        }
      };
      recognition.start();
    } else {
      // Fallback: simulate listening
      setTimeout(() => {
        setListening(false);
        submitQuery('How can you help me with accessibility?');
      }, 2500);
    }
  };

  const stopListening = () => {
    setListening(false);
    setCoreState('idle');
    recognitionRef.current?.stop();
  };

  const submitQuery = (text: string) => {
    const userEntry: TranscriptEntry = { id: `u-${Date.now()}`, speaker: 'user', text };
    setTranscript((t) => [...t, userEntry]);
    setCoreState('thinking');

    setTimeout(() => {
      setCoreState('processing');
      const reply = getResponse(text);
      const saarthiEntry: TranscriptEntry = { id: `s-${Date.now()}`, speaker: 'saarthi', text: reply };
      setTranscript((t) => [...t, saarthiEntry]);

      // Speak the reply
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(reply);
        utter.rate = 0.95;
        utter.onstart = () => setCoreState('listening');
        utter.onend = () => setCoreState('success');
        window.speechSynthesis.speak(utter);
      } else {
        setCoreState('success');
      }
    }, 1200);
  };

  const handleSend = () => {
    if (!textInput.trim()) return;
    submitQuery(textInput.trim());
    setTextInput('');
  };

  const clearTranscript = () => {
    setTranscript([{ id: 'init', speaker: 'saarthi', text: DEMO_RESPONSES.default }]);
    setCoreState('idle');
  };

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        title="Voice Assistant"
        subtitle="Talk to SAARTHI AI. The Core reacts to your voice in real time."
        icon={Mic}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Core + waveform */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <SaarthiCore state={coreState} size={320} showStars={false} />
            {/* Pulse ring when listening */}
            {listening && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-core-400"
              />
            )}
          </div>

          {/* Waveform */}
          <div className="mt-6 flex h-16 items-center gap-1">
            {waveform.map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: `${h * 100}%` }}
                transition={{ duration: 0.1 }}
                className={`w-1.5 rounded-full ${listening ? 'bg-core-400' : 'bg-slate-700'}`}
                style={{ height: `${h * 100}%` }}
              />
            ))}
          </div>

          {/* Mic controls */}
          <div className="mt-6 flex items-center gap-4">
            {!listening ? (
              <button
                onClick={startListening}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-core-500 text-ink-950 shadow-glow-lg hover:scale-105 transition"
                aria-label="Start listening"
              >
                <Mic size={28} />
              </button>
            ) : (
              <button
                onClick={stopListening}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-500 text-white shadow-lg hover:scale-105 transition"
                aria-label="Stop listening"
              >
                <Square size={24} />
              </button>
            )}
          </div>
          <div className="mt-3 text-sm text-slate-500">
            {listening ? 'Listening… speak now' : 'Tap the microphone to speak'}
          </div>
        </div>

        {/* Right: transcript */}
        <div className="card flex flex-col" style={{ minHeight: '500px' }}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-white">Transcript</h3>
            <button onClick={clearTranscript} className="text-slate-500 hover:text-danger-400 transition" aria-label="Clear transcript">
              <Trash2 size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {transcript.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-sm ${
                      entry.speaker === 'user'
                        ? 'bg-core-500/15 text-core-100 border border-core-400/20'
                        : 'bg-ink-900/60 text-slate-300 border border-white/5'
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-500">
                      {entry.speaker === 'user' ? (
                        <>
                          <Mic size={10} /> You
                        </>
                      ) : (
                        <>
                          <Volume2 size={10} /> SAARTHI
                        </>
                      )}
                    </div>
                    {entry.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {coreState === 'thinking' && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-white/5 bg-ink-900/60 p-3.5">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        className="h-2 w-2 rounded-full bg-core-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>

          {/* Text input fallback */}
          <div className="mt-4 flex gap-2 border-t border-white/5 pt-4">
            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Or type your question…"
              className="input flex-1"
              aria-label="Type a question"
            />
            <button onClick={handleSend} className="btn-primary" aria-label="Send">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
