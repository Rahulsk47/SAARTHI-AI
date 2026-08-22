import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Trash2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import SaarthiCore from '@/components/SaarthiCore';
import { type CoreState } from '@/types/core';
import { chat, type ChatMessage } from '@/lib/ai';
import {
  getOrCreateConversation,
  loadMessages,
  saveMessage,
  clearConversation,
  type Conversation,
} from '@/lib/chat';

interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME_MESSAGE = "Hello! I'm SAARTHI AI, your accessibility assistant. I can help you understand websites, simplify complex text, translate between Indian languages, explain documents, and guide you through this app. How can I help you today?";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [coreState, setCoreState] = useState<CoreState>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Initialize conversation when chatbot first opened
  useEffect(() => {
    if (!open || initialized) return;
    let cancelled = false;
    (async () => {
      const conv = await getOrCreateConversation();
      if (cancelled) return;
      setConversation(conv);
      if (conv) {
        const saved = await loadMessages(conv.id);
        if (cancelled) return;
        if (saved.length > 0) {
          setMessages(saved.map((m) => ({ id: m.id, role: m.role, content: m.content })));
        } else {
          setMessages([{ id: 'welcome', role: 'assistant', content: WELCOME_MESSAGE }]);
        }
      } else {
        setMessages([{ id: 'welcome', role: 'assistant', content: WELCOME_MESSAGE }]);
      }
      setInitialized(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, initialized]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput('');
    setError(null);

    const userMsg: DisplayMessage = { id: `u-${Date.now()}`, role: 'user', content: userText };
    setMessages((m) => [...m, userMsg]);
    setCoreState('listening');
    setLoading(true);

    // Save user message to DB
    if (conversation) {
      await saveMessage(conversation.id, 'user', userText);
    }

    // Build conversation history for AI
    const history: ChatMessage[] = messages
      .filter((m) => m.id !== 'welcome')
      .map((m) => ({ role: m.role, content: m.content }));
    history.push({ role: 'user', content: userText });

    setCoreState('thinking');

    try {
      const reply = await chat(history);
      setCoreState('success');

      const aiMsg: DisplayMessage = { id: `a-${Date.now()}`, role: 'assistant', content: reply };
      setMessages((m) => [...m, aiMsg]);

      if (conversation) {
        await saveMessage(conversation.id, 'assistant', reply);
      }
    } catch (err) {
      setCoreState('error');
      const errMsg = err instanceof Error ? err.message : 'Failed to get a response.';
      setError(errMsg);
      const fallback: DisplayMessage = {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: `I'm having trouble responding right now. ${errMsg}`,
      };
      setMessages((m) => [...m, fallback]);
    } finally {
      setLoading(false);
      setTimeout(() => setCoreState('idle'), 1500);
    }
  };

  const handleClear = async () => {
    if (conversation) {
      await clearConversation(conversation.id);
    }
    setMessages([{ id: 'welcome', role: 'assistant', content: WELCOME_MESSAGE }]);
    setError(null);
    setCoreState('idle');
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-core-500 text-ink-950 shadow-glow-lg hover:scale-110 transition"
        aria-label={open ? 'Close chat' : 'Open SAARTHI Assistant'}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare size={24} />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-core-400 opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-core-500" />
          </span>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 flex h-[min(600px,75vh)] w-[min(420px,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-800/95 backdrop-blur-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-core-400 to-core-700 flex items-center justify-center">
                  <Sparkles size={14} className="text-ink-950" />
                </div>
                <div>
                  <div className="font-display text-sm font-semibold text-white">SAARTHI Assistant</div>
                  <div className="text-[10px] text-core-300 capitalize">{coreState === 'idle' ? 'Ready' : coreState}</div>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="text-slate-500 hover:text-danger-400 transition"
                aria-label="Clear conversation"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {/* Mini Core */}
            <div className="flex items-center justify-center border-b border-white/5 bg-ink-900/40 py-2">
              <div className="scale-50 origin-center">
                <SaarthiCore state={coreState} size={80} showStars={false} interactive={false} />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? 'bg-core-500/15 text-core-100 border border-core-400/20'
                        : 'bg-ink-900/60 text-slate-300 border border-white/5'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Thinking indicator */}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-white/5 bg-ink-900/60 px-3.5 py-2.5">
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

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3 text-xs text-danger-400">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask SAARTHI anything…"
                  className="input flex-1 py-2 text-sm"
                  aria-label="Chat message"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="btn-primary shrink-0 p-2.5 disabled:opacity-40"
                  aria-label="Send message"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
