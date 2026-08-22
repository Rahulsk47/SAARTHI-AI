import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Volume2,
  Square,
  Send,
  Trash2,
  AlertCircle,
} from 'lucide-react';

import SaarthiCore from '@/components/SaarthiCore';
import PageHeader from '@/components/PageHeader';
import { type CoreState } from '@/types/core';

interface TranscriptEntry {
  id: string;
  speaker: 'user' | 'saarthi';
  text: string;
}

/*
 * Browser Speech Recognition types.
 * These are declared here because TypeScript does not always
 * include the Web Speech API types by default.
 */

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

  onresult:
    | ((event: SpeechRecognitionEvent) => void)
    | null;

  onerror:
    | ((event: SpeechRecognitionErrorEvent) => void)
    | null;

  onend:
    | (() => void)
    | null;

  onstart:
    | (() => void)
    | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

const DEMO_RESPONSES: Record<string, string> = {
  default:
    "I'm SAARTHI, your AI accessibility assistant. I can help you understand websites, simplify documents, translate between Indian languages, and check accessibility. What would you like to do?",

  website:
    "I can analyze any website for accessibility issues. Go to the Website Analyzer, enter a URL, and I'll check it for WCAG compliance, color contrast, keyboard navigation, and more. Would you like me to walk you through it?",

  document:
    "Upload any document to the Document AI page and I'll summarize it, extract important dates, check eligibility, list required documents, and give you next steps. I can also simplify or translate it for you.",

  translate:
    'I support English, Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, and Malayalam. Open the Language Assistant to translate or simplify any text. You can also combine both modes.',

  hello:
    "Hello! I'm here to help make the internet accessible to you. How can I assist today?",

  help:
    'I can help you with analyzing websites for accessibility, simplifying complex documents, translating between 8 Indian languages, reading content aloud, and personalizing your experience. Just tell me what you need!',
};

function getResponse(input: string): string {
  const question = input.toLowerCase().trim();

  if (
    question.includes('website') ||
    question.includes('analyze') ||
    question.includes('analyse') ||
    question.includes('url')
  ) {
    return DEMO_RESPONSES.website;
  }

  if (
    question.includes('document') ||
    question.includes('pdf') ||
    question.includes('upload')
  ) {
    return DEMO_RESPONSES.document;
  }

  if (
    question.includes('translate') ||
    question.includes('translation') ||
    question.includes('language') ||
    question.includes('hindi') ||
    question.includes('kannada')
  ) {
    return DEMO_RESPONSES.translate;
  }

  if (
    question === 'hi' ||
    question.startsWith('hi ') ||
    question.includes('hello') ||
    question.includes('hey')
  ) {
    return DEMO_RESPONSES.hello;
  }

  if (
    question.includes('help') ||
    question.includes('what can you do') ||
    question.includes('what can you help')
  ) {
    return DEMO_RESPONSES.help;
  }

  return DEMO_RESPONSES.default;
}

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);

  const [coreState, setCoreState] =
    useState<CoreState>('idle');

  const [transcript, setTranscript] =
    useState<TranscriptEntry[]>([
      {
        id: 'init',
        speaker: 'saarthi',
        text: DEMO_RESPONSES.default,
      },
    ]);

  const [textInput, setTextInput] =
    useState('');

  const [waveform, setWaveform] =
    useState<number[]>(
      new Array(32).fill(0.1)
    );

  const [errorMessage, setErrorMessage] =
    useState('');

  const recognitionRef =
    useRef<SpeechRecognitionInstance | null>(null);

  const transcriptEndRef =
    useRef<HTMLDivElement | null>(null);

  const responseTimeoutRef =
    useRef<number | null>(null);

  /*
   * Scroll transcript to latest message.
   */

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [transcript]);

  /*
   * Animate waveform while listening.
   */

  useEffect(() => {
    if (!listening) {
      setWaveform(
        new Array(32).fill(0.1)
      );

      return;
    }

    const intervalId = window.setInterval(() => {
      setWaveform(
        Array.from(
          { length: 32 },
          () => 0.15 + Math.random() * 0.85
        )
      );
    }, 100);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [listening]);

  /*
   * Clean up recognition, speech synthesis and
   * pending timers when leaving the page.
   */

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Recognition may already be stopped.
        }
      }

      if (
        'speechSynthesis' in window
      ) {
        window.speechSynthesis.cancel();
      }

      if (
        responseTimeoutRef.current !== null
      ) {
        window.clearTimeout(
          responseTimeoutRef.current
        );
      }
    };
  }, []);

  /*
   * Get browser speech recognition implementation.
   */

  const getSpeechRecognition =
    (): SpeechRecognitionConstructor | null => {
      const speechWindow =
        window as SpeechRecognitionWindow;

      return (
        speechWindow.SpeechRecognition ??
        speechWindow.webkitSpeechRecognition ??
        null
      );
    };

  /*
   * Stop current speech recognition safely.
   */

  const stopRecognition = () => {
    if (!recognitionRef.current) {
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch {
      // Ignore if recognition has already stopped.
    }

    recognitionRef.current = null;
  };

  /*
   * Start microphone recognition.
   */

  const startListening = () => {
    if (listening) {
      return;
    }

    setErrorMessage('');

    /*
     * Stop any previous speech synthesis.
     */

    if (
      'speechSynthesis' in window
    ) {
      window.speechSynthesis.cancel();
    }

    const SpeechRecognition =
      getSpeechRecognition();

    /*
     * Browser does not support Speech Recognition.
     */

    if (!SpeechRecognition) {
      setErrorMessage(
        'Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge, or type your question below.'
      );

      setCoreState('idle');
      setListening(false);

      return;
    }

    try {
      const recognition =
        new SpeechRecognition();

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

      recognition.onresult = (
        event: SpeechRecognitionEvent
      ) => {
        let transcriptText = '';

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i += 1
        ) {
          const result =
            event.results[i];

          if (
            result &&
            result.isFinal &&
            result[0]
          ) {
            transcriptText +=
              result[0].transcript;
          }
        }

        if (transcriptText.trim()) {
          finalText +=
            transcriptText + ' ';
        }
      };

      recognition.onerror = (
        event: SpeechRecognitionErrorEvent
      ) => {
        console.error(
          'Speech recognition error:',
          event.error
        );

        setListening(false);
        setCoreState('idle');

        if (
          event.error ===
          'not-allowed'
        ) {
          setErrorMessage(
            'Microphone permission was denied. Please allow microphone access in your browser settings.'
          );
        } else if (
          event.error ===
          'no-speech'
        ) {
          setErrorMessage(
            'No speech was detected. Please try speaking again.'
          );
        } else if (
          event.error ===
          'audio-capture'
        ) {
          setErrorMessage(
            'No microphone was detected. Please check your microphone.'
          );
        } else if (
          event.error ===
          'network'
        ) {
          setErrorMessage(
            'Speech recognition could not connect. Please check your internet connection.'
          );
        } else {
          setErrorMessage(
            'Voice recognition failed. Please try again.'
          );
        }

        recognitionRef.current = null;
      };

      recognition.onend = () => {
        setListening(false);
        recognitionRef.current = null;

        const text =
          finalText.trim();

        if (text) {
          submitQuery(text);
        } else {
          setCoreState('idle');
        }
      };

      recognitionRef.current =
        recognition;

      recognition.start();
    } catch (error) {
      console.error(
        'Could not start speech recognition:',
        error
      );

      setListening(false);
      setCoreState('idle');

      setErrorMessage(
        'Could not start the microphone. Please check your browser microphone permission.'
      );

      recognitionRef.current = null;
    }
  };

  /*
   * Stop microphone recognition.
   */

  const stopListening = () => {
    setListening(false);
    setCoreState('idle');

    stopRecognition();
  };

  /*
   * Submit a question.
   */

  const submitQuery = (
    text: string
  ) => {
    const cleanText =
      text.trim();

    if (!cleanText) {
      return;
    }

    setErrorMessage('');

    /*
     * Stop microphone if still active.
     */

    if (recognitionRef.current) {
      stopRecognition();
    }

    /*
     * Stop current speech.
     */

    if (
      'speechSynthesis' in window
    ) {
      window.speechSynthesis.cancel();
    }

    const userEntry: TranscriptEntry =
      {
        id: `user-${Date.now()}`,
        speaker: 'user',
        text: cleanText,
      };

    setTranscript(
      (previous) => [
        ...previous,
        userEntry,
      ]
    );

    setCoreState('thinking');

    /*
     * Clear previous response timer.
     */

    if (
      responseTimeoutRef.current !== null
    ) {
      window.clearTimeout(
        responseTimeoutRef.current
      );
    }

    /*
     * Simulate AI processing.
     */

    responseTimeoutRef.current =
      window.setTimeout(() => {
        const reply =
          getResponse(cleanText);

        const saarthiEntry: TranscriptEntry =
          {
            id: `saarthi-${Date.now()}`,
            speaker: 'saarthi',
            text: reply,
          };

        setTranscript(
          (previous) => [
            ...previous,
            saarthiEntry,
          ]
        );

        speakResponse(reply);

        responseTimeoutRef.current =
          null;
      }, 1000);
  };

  /*
   * Speak SAARTHI response.
   */

  const speakResponse = (
    text: string
  ) => {
    if (
      !('speechSynthesis' in window)
    ) {
      setCoreState('success');
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance =
        new SpeechSynthesisUtterance(
          text
        );

      utterance.lang = 'en-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setCoreState('processing');
      };

      utterance.onend = () => {
        setCoreState('success');
      };

      utterance.onerror = (
        event
      ) => {
        console.error(
          'Speech synthesis error:',
          event
        );

        setCoreState('success');
      };

      window.speechSynthesis.speak(
        utterance
      );
    } catch (error) {
      console.error(
        'Speech synthesis failed:',
        error
      );

      setCoreState('success');
    }
  };

  /*
   * Send typed message.
   */

  const handleSend = () => {
    const message =
      textInput.trim();

    if (!message) {
      return;
    }

    setTextInput('');

    submitQuery(message);
  };

  /*
   * Clear transcript.
   */

  const clearTranscript = () => {
    if (
      recognitionRef.current
    ) {
      stopRecognition();
    }

    if (
      'speechSynthesis' in window
    ) {
      window.speechSynthesis.cancel();
    }

    if (
      responseTimeoutRef.current !== null
    ) {
      window.clearTimeout(
        responseTimeoutRef.current
      );

      responseTimeoutRef.current =
        null;
    }

    setTranscript([
      {
        id: 'init',
        speaker: 'saarthi',
        text: DEMO_RESPONSES.default,
      },
    ]);

    setTextInput('');
    setListening(false);
    setCoreState('idle');
    setErrorMessage('');
  };

  return (
    <div className="px-6 py-8 md:px-10">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <PageHeader
        title="Voice Assistant"
        subtitle="Talk to SAARTHI AI. The Core reacts to your voice in real time."
        icon={Mic}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* =====================================================
            LEFT SIDE
        ===================================================== */}

        <div className="flex flex-col items-center justify-center">

          <div className="relative">

            <SaarthiCore
              state={coreState}
              size={320}
              showStars={false}
            />

            {listening && (
              <motion.div
                initial={{
                  scale: 0.8,
                  opacity: 0.5,
                }}
                animate={{
                  scale: 1.4,
                  opacity: 0,
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                className="absolute inset-0 rounded-full border-2 border-core-400"
              />
            )}

          </div>

          {/* =================================================
              WAVEFORM
          ================================================= */}

          <div
            className="mt-6 flex h-16 items-center gap-1"
            aria-label={
              listening
                ? 'Voice waveform'
                : 'Voice inactive'
            }
          >
            {waveform.map(
              (height, index) => (
                <motion.div
                  key={index}
                  animate={{
                    height: `${Math.max(
                      height * 100,
                      4
                    )}%`,
                  }}
                  transition={{
                    duration: 0.1,
                  }}
                  className={`w-1.5 rounded-full ${
                    listening
                      ? 'bg-core-400'
                      : 'bg-slate-700'
                  }`}
                />
              )
            )}
          </div>

          {/* =================================================
              MICROPHONE
          ================================================= */}

          <div className="mt-6 flex items-center gap-4">

            {!listening ? (
              <button
                type="button"
                onClick={
                  startListening
                }
                className="flex h-16 w-16 items-center justify-center rounded-full bg-core-500 text-ink-950 shadow-glow-lg transition hover:scale-105"
                aria-label="Start listening"
              >
                <Mic size={28} />
              </button>
            ) : (
              <button
                type="button"
                onClick={
                  stopListening
                }
                className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-500 text-white shadow-lg transition hover:scale-105"
                aria-label="Stop listening"
              >
                <Square size={24} />
              </button>
            )}

          </div>

          <div className="mt-3 text-center text-sm text-slate-500">
            {listening
              ? 'Listening… speak now'
              : 'Tap the microphone to speak'}
          </div>

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {errorMessage && (
            <div className="mt-5 flex max-w-md items-start gap-2 rounded-xl border border-danger-500/20 bg-danger-500/5 p-3 text-xs text-danger-400">

              <AlertCircle
                size={15}
                className="mt-0.5 shrink-0"
              />

              <span>
                {errorMessage}
              </span>

            </div>
          )}

        </div>

        {/* =====================================================
            RIGHT SIDE - TRANSCRIPT
        ===================================================== */}

        <div
          className="card flex flex-col"
          style={{
            minHeight: '500px',
          }}
        >

          <div className="mb-4 flex items-center justify-between">

            <h3 className="font-display text-lg font-semibold text-white">
              Transcript
            </h3>

            <button
              type="button"
              onClick={
                clearTranscript
              }
              className="text-slate-500 transition hover:text-danger-400"
              aria-label="Clear transcript"
              title="Clear transcript"
            >
              <Trash2 size={16} />
            </button>

          </div>

          {/* =================================================
              MESSAGES
          ================================================= */}

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">

            <AnimatePresence
              initial={false}
            >
              {transcript.map(
                (entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className={`flex ${
                      entry.speaker ===
                      'user'
                        ? 'justify-end'
                        : 'justify-start'
                    }`}
                  >

                    <div
                      className={`max-w-[85%] rounded-2xl border p-3.5 text-sm ${
                        entry.speaker ===
                        'user'
                          ? 'border-core-400/20 bg-core-500/15 text-core-100'
                          : 'border-white/5 bg-ink-900/60 text-slate-300'
                      }`}
                    >

                      <div className="mb-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-500">

                        {entry.speaker ===
                        'user' ? (
                          <>
                            <Mic size={10} />
                            You
                          </>
                        ) : (
                          <>
                            <Volume2
                              size={10}
                            />
                            SAARTHI
                          </>
                        )}

                      </div>

                      <div className="whitespace-pre-wrap">
                        {entry.text}
                      </div>

                    </div>

                  </motion.div>
                )
              )}
            </AnimatePresence>

            {/* THINKING */}

            {coreState ===
              'thinking' && (
              <div className="flex justify-start">

                <div className="rounded-2xl border border-white/5 bg-ink-900/60 p-3.5">

                  <div className="flex gap-1">

                    {[0, 1, 2].map(
                      (index) => (
                        <motion.div
                          key={index}
                          animate={{
                            opacity: [
                              0.3,
                              1,
                              0.3,
                            ],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat:
                              Infinity,
                            delay:
                              index *
                              0.2,
                          }}
                          className="h-2 w-2 rounded-full bg-core-400"
                        />
                      )
                    )}

                  </div>

                </div>

              </div>
            )}

            <div
              ref={
                transcriptEndRef
              }
            />

          </div>

          {/* =================================================
              TEXT INPUT
          ================================================= */}

          <div className="mt-4 flex gap-2 border-t border-white/5 pt-4">

            <input
              type="text"
              value={textInput}
              onChange={(event) =>
                setTextInput(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter'
                ) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Or type your question…"
              className="input flex-1"
              aria-label="Type a question"
            />

            <button
              type="button"
              onClick={
                handleSend
              }
              disabled={
                !textInput.trim()
              }
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send"
              title="Send message"
            >
              <Send size={16} />
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}