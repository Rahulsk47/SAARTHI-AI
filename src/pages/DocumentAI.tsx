import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  Sparkles,
  Languages,
  Volume2,
  MessageSquare,
  Calendar,
  CheckCircle2,
  ListChecks,
  Info,
  ListTodo,
  Wand2,
  Send,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import SaarthiCore from '@/components/SaarthiCore';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import { DEMO_DOCUMENT } from '@/data/demoData';
import { type CoreState } from '@/types/core';
import { supabase } from '@/lib/supabase';
import { simplifyText, translateText, chat } from '@/lib/ai';

type Action = 'simplify' | 'translate' | 'read' | 'ask';

export default function DocumentAI() {
  const [uploaded, setUploaded] = useState(false);
  const [coreState, setCoreState] = useState<CoreState>('idle');
  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const [simplified, setSimplified] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [askInput, setAskInput] = useState('');
  const [askMessages, setAskMessages] = useState<{ role: 'user' | 'saarthi'; text: string }[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savedToDb, setSavedToDb] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const saveDocumentToDb = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) return;

      const { error } = await supabase.from('documents').insert({
        file_name: DEMO_DOCUMENT.fileName,
        summary: DEMO_DOCUMENT.summary,
        important_dates: DEMO_DOCUMENT.importantDates,
        eligibility: DEMO_DOCUMENT.eligibility,
        required_documents: DEMO_DOCUMENT.requiredDocuments,
        important_info: DEMO_DOCUMENT.importantInfo,
        next_steps: DEMO_DOCUMENT.nextSteps,
      });
      if (error) {
        console.error('Failed to save document:', error);
        return;
      }

      await supabase.from('activity_logs').insert({
        type: 'document',
        title: DEMO_DOCUMENT.fileName,
        detail: 'Simplified & analyzed',
      });
      setSavedToDb(true);
    } catch (err) {
      console.error('Failed to save document:', err);
    }
  };

  const handleUpload = () => {
    setCoreState('processing');
    setTimeout(() => setCoreState('analyzing'), 800);
    setTimeout(() => {
      setCoreState('success');
      setUploaded(true);
      saveDocumentToDb();
    }, 2000);
  };

  const runAction = async (action: Action) => {
    setActiveAction(action);
    setActionError(null);
    setCoreState('thinking');
    setActionLoading(true);

    try {
      if (action === 'simplify') {
        const result = await simplifyText(DEMO_DOCUMENT.summary);
        setSimplified(true);
        setCoreState('success');
      } else if (action === 'translate') {
        const result = await translateText(DEMO_DOCUMENT.summary, 'Hindi');
        setTranslatedText(result);
        setCoreState('success');
      } else if (action === 'read') {
        speakText(DEMO_DOCUMENT.summary);
        setCoreState('success');
      } else if (action === 'ask') {
        setAskOpen(true);
        setCoreState('idle');
      }
    } catch (err) {
      setCoreState('error');
      setActionError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setActionLoading(false);
      setTimeout(() => setCoreState('idle'), 1500);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.95;
      utter.pitch = 1;
      window.speechSynthesis.speak(utter);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  };

  const sendAsk = async () => {
    if (!askInput.trim() || actionLoading) return;
    const userMsg = askInput;
    setAskMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setAskInput('');
    setCoreState('thinking');
    setActionLoading(true);
    try {
      const history = askMessages.map((m) => ({
        role: (m.role === 'saarthi' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: m.text,
      }));
      history.push({ role: 'user', content: userMsg });
      const reply = await chat(history);
      setAskMessages((m) => [...m, { role: 'saarthi', text: reply }]);
      setCoreState('success');
    } catch (err) {
      setCoreState('error');
      const errMsg = err instanceof Error ? err.message : 'Failed to get a response.';
      setAskMessages((m) => [...m, { role: 'saarthi', text: `I'm having trouble right now. ${errMsg}` }]);
    } finally {
      setActionLoading(false);
      setTimeout(() => setCoreState('idle'), 1500);
    }
  };

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        title="Document AI"
        subtitle="Upload a document to summarize, simplify, translate, and read aloud."
        icon={FileText}
      />

      {!uploaded ? (
        <div className="flex flex-col items-center justify-center py-20">
          <SaarthiCore state={coreState} size={280} showStars={false} />
          <div
            className="mt-8 w-full max-w-xl rounded-2xl border-2 border-dashed border-white/15 bg-ink-900/40 p-12 text-center transition hover:border-core-400/40 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              handleUpload();
            }}
            onDragOver={(e) => e.preventDefault()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleUpload()}
          >
            <Upload size={32} className="mx-auto text-core-400 mb-4" />
            <h3 className="font-display text-lg font-semibold text-white">Drop a document here</h3>
            <p className="text-sm text-slate-500 mt-1">PDF, DOCX, or TXT · Or click to browse</p>
            <p className="text-xs text-slate-600 mt-3">Demo uses sample: {DEMO_DOCUMENT.fileName}</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleUpload}
          />
          <button onClick={handleUpload} className="btn-primary mt-6">
            <Sparkles size={16} /> Analyze Sample Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Core + actions */}
          <div className="lg:sticky lg:top-8 lg:self-start space-y-4">
            <SectionCard className="flex flex-col items-center" delay={0}>
              <SaarthiCore state={coreState} size={200} showStars={false} />
              <div className="mt-3 text-center">
                <div className="font-display text-sm font-semibold text-white">{DEMO_DOCUMENT.fileName}</div>
                <div className="text-xs text-slate-500">Analyzed successfully</div>
              </div>
            </SectionCard>

            <SectionCard title="Actions" delay={0.1}>
              <div className="grid grid-cols-2 gap-2">
                <ActionButton icon={Wand2} label="Simplify" active={activeAction === 'simplify'} onClick={() => runAction('simplify')} />
                <ActionButton icon={Languages} label="Translate" active={activeAction === 'translate'} onClick={() => runAction('translate')} />
                <ActionButton icon={Volume2} label="Read Aloud" active={activeAction === 'read'} onClick={() => runAction('read')} />
                <ActionButton icon={MessageSquare} label="Ask SAARTHI" active={activeAction === 'ask' || askOpen} onClick={() => { setActiveAction('ask'); setAskOpen(true); }} />
              </div>
              {activeAction === 'read' && (
                <button onClick={stopSpeaking} className="mt-3 w-full btn-ghost text-sm">
                  Stop reading
                </button>
              )}
            </SectionCard>
          </div>

          {/* Right: document analysis */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {activeAction === 'translate' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <SectionCard title="Translation" icon={<Languages size={18} />} delay={0}>
                    <p className="text-sm text-slate-400 mb-3">Summary translated to Hindi:</p>
                    {actionLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Loader2 size={16} className="animate-spin" /> Translating…
                      </div>
                    ) : translatedText ? (
                      <p className="rounded-xl border border-white/10 bg-ink-900/40 p-4 text-sm text-slate-200">
                        {translatedText}
                      </p>
                    ) : (
                      <p className="rounded-xl border border-white/10 bg-ink-900/40 p-4 text-sm text-slate-200">
                        यह दस्तावेज़ राष्ट्रीय मेरिट छात्रवृत्ति 2026 कार्यक्रम की रूपरेखा देता है। इसमें पात्रता मानदंड, आवश्यक दस्तावेज, आवेदन की अंतिम तिथि और सबमिशन के चरण शामिल हैं।
                      </p>
                    )}
                  </SectionCard>
                </motion.div>
              )}
            </AnimatePresence>

            {actionError && (
              <div className="flex items-center gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-400">
                <AlertCircle size={16} /> {actionError}
              </div>
            )}

            {savedToDb && (
              <div className="flex items-center gap-2 rounded-xl border border-success-500/20 bg-success-500/5 p-3 text-sm text-success-400">
                <CheckCircle2 size={16} /> Document saved to your history.
              </div>
            )}

            <SectionCard title="Summary" icon={<FileText size={18} />} delay={0}>
              <p className={`text-slate-300 ${simplified ? '' : 'text-base'}`}>
                {simplified
                  ? 'This document explains the National Merit Scholarship 2026. It tells you who can apply, what documents you need, the deadlines, and how to apply step by step. The scholarship pays for tuition and gives a monthly stipend to students from low-income families.'
                  : DEMO_DOCUMENT.summary}
              </p>
              {simplified && (
                <div className="mt-3 flex items-center gap-2 text-sm text-core-300">
                  <Wand2 size={14} /> Simplified version shown · Toggle simplify to restore
                </div>
              )}
            </SectionCard>

            <SectionCard title="Important Dates" icon={<Calendar size={18} />} delay={0.1}>
              <div className="space-y-2">
                {DEMO_DOCUMENT.importantDates.map((d) => (
                  <div key={d.date} className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900/40 p-3">
                    <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-core-500/10 text-core-300">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <div className="text-sm text-white">{d.event}</div>
                      <div className="text-xs text-slate-500">{d.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <SectionCard title="Eligibility" icon={<CheckCircle2 size={18} />} delay={0.15}>
                <ul className="space-y-2">
                  {DEMO_DOCUMENT.eligibility.map((e) => (
                    <li key={e} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 size={14} className="mt-1 shrink-0 text-success-400" /> {e}
                    </li>
                  ))}
                </ul>
              </SectionCard>

              <SectionCard title="Required Documents" icon={<ListChecks size={18} />} delay={0.2}>
                <ul className="space-y-2">
                  {DEMO_DOCUMENT.requiredDocuments.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-slate-300">
                      <FileText size={14} className="mt-1 shrink-0 text-core-400" /> {d}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            </div>

            <SectionCard title="Important Information" icon={<Info size={18} />} delay={0.25}>
              <ul className="space-y-2">
                {DEMO_DOCUMENT.importantInfo.map((info) => (
                  <li key={info} className="flex items-start gap-2 text-sm text-slate-300">
                    <Info size={14} className="mt-1 shrink-0 text-warning-400" /> {info}
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Next Steps" icon={<ListTodo size={18} />} delay={0.3}>
              <ol className="space-y-3">
                {DEMO_DOCUMENT.nextSteps.map((step, i) => (
                  <li key={step} className="flex items-start gap-3 text-sm text-slate-300">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-core-500/15 text-xs font-medium text-core-300">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </SectionCard>

            {/* Ask SAARTHI panel */}
            <AnimatePresence>
              {askOpen && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}>
                  <SectionCard title="Ask SAARTHI" icon={<MessageSquare size={18} />} delay={0}>
                    <div className="mb-3 max-h-48 space-y-2 overflow-y-auto">
                      {askMessages.length === 0 && (
                        <p className="text-sm text-slate-500">Ask any question about this document.</p>
                      )}
                      {askMessages.map((m, i) => (
                        <div
                          key={i}
                          className={`rounded-xl p-3 text-sm ${
                            m.role === 'user'
                              ? 'ml-8 bg-core-500/15 text-core-100'
                              : 'mr-8 bg-ink-900/60 text-slate-300'
                          }`}
                        >
                          {m.text}
                        </div>
                      ))}
                      {actionLoading && (
                        <div className="mr-8 rounded-xl bg-ink-900/60 p-3">
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
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={askInput}
                        onChange={(e) => setAskInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendAsk()}
                        placeholder="Ask about this document…"
                        className="input flex-1"
                        aria-label="Ask a question"
                        disabled={actionLoading}
                      />
                      <button onClick={sendAsk} disabled={actionLoading} className="btn-primary disabled:opacity-40">
                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      </button>
                    </div>
                  </SectionCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Sparkles;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition ${
        active
          ? 'border-core-400/40 bg-core-500/15 text-core-200'
          : 'border-white/10 text-slate-400 hover:border-core-400/20 hover:text-core-300'
      }`}
    >
      <Icon size={20} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
