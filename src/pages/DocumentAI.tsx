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
  VolumeX,
  RefreshCw,
} from 'lucide-react';
import SaarthiCore from '@/components/SaarthiCore';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import { DEMO_DOCUMENT } from '@/data/demoData';
import { type CoreState } from '@/types/core';
import { processDocument, simplifyText, translateText, chat, type DocumentAnalysisResult } from '@/lib/ai';
import { saveDocument } from '@/lib/data';

type Action = 'simplify' | 'translate' | 'read' | 'ask';

const SAMPLE_DOCS = [
  {
    name: 'National Merit Scholarship 2026',
    text: `Ministry of Education, Government of India.
National Merit Scholarship Scheme 2026-2027 Guidelines.
The National Merit Scholarship provides full tuition assistance and a monthly stipend of Rs. 2,500 to meritorious students from economically weaker sections enrolled in recognized universities.
Eligibility Criteria:
- Applicant must be an Indian citizen enrolled in a full-time undergraduate or postgraduate degree program.
- Minimum 75% marks or equivalent CGPA in Class XII board examination.
- Total annual family income from all sources must not exceed Rs. 3,50,000 per annum.
Important Deadlines:
- Portal opens for online registration: September 1, 2026
- Last date for application submission: October 31, 2026
- Institution verification cutoff: November 15, 2026
- Merit list publication and DBT disbursement: December 10, 2026
Required Documentation:
1. Class 10th and 12th passing mark sheets and certificates.
2. Valid Aadhaar Card linked to active bank account.
3. Income Certificate issued by authorized Tehsildar or Revenue Officer.
4. Bonafide student certificate issued by the Head of Institution.
5. Proof of residence (Electricity bill, Domicile certificate, or Ration Card).
Important Instructions:
- Incomplete applications without verifiable income certificates will be rejected automatically without notice.
- Disbursal will be processed strictly via Aadhaar Enabled Payment System (AEPS).
- Scholarship is renewable annually subject to maintaining at least 60% aggregate marks.`,
  },
  {
    name: 'Ayushman Bharat PM-JAY Scheme',
    text: `National Health Authority - Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY).
Provides health coverage of up to Rs. 5,00,000 per family per year for secondary and tertiary care hospitalization across public and empanelled private hospitals in India.
Key Benefits:
- Covers pre-existing conditions from day one.
- Includes 3 days pre-hospitalization and 15 days post-hospitalization expenses such as diagnostics and medicines.
Eligibility:
- Families identified in Socio-Economic Caste Census (SECC) database.
- Beneficiary must possess an active Ayushman Card (PM-JAY Golden Card).
Next Steps:
- Check eligibility at pmjay.gov.in or visit the nearest Common Service Centre (CSC).
- Submit Aadhaar card and Ration card for e-KYC.
- Collect physical plastic Ayushman card or download digital copy.`,
  },
];

export default function DocumentAI() {
  const [uploaded, setUploaded] = useState(false);
  const [coreState, setCoreState] = useState<CoreState>('idle');
  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const [docData, setDocData] = useState<DocumentAnalysisResult>({
    file_name: DEMO_DOCUMENT.fileName,
    summary: DEMO_DOCUMENT.summary,
    important_dates: DEMO_DOCUMENT.importantDates,
    eligibility: DEMO_DOCUMENT.eligibility,
    required_documents: DEMO_DOCUMENT.requiredDocuments,
    important_info: DEMO_DOCUMENT.importantInfo,
    next_steps: DEMO_DOCUMENT.nextSteps,
  });

  const [rawText, setRawText] = useState(SAMPLE_DOCS[0].text);
  const [uploadedFileMeta, setUploadedFileMeta] = useState<{ name: string; size?: string; type?: string } | null>(null);
  const [simplified, setSimplified] = useState(false);
  const [simplifiedText, setSimplifiedText] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState('hi');
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [askOpen, setAskOpen] = useState(false);
  const [askInput, setAskInput] = useState('');
  const [askMessages, setAskMessages] = useState<{ role: 'user' | 'saarthi'; text: string }[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [savedToDb, setSavedToDb] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeDocContent = async (
    input: string | { text?: string; fileData?: string; mimeType?: string; fileName?: string },
    fileName: string,
  ) => {
    setCoreState('processing');
    setActionLoading(true);
    setActionError(null);
    setProcessingStatus('Parsing document content…');

    try {
      setCoreState('analyzing');
      setProcessingStatus('Gemini 3.7 AI extracting eligibility, deadlines & checklists…');
      const analysis = await processDocument(input, fileName);
      setDocData(analysis);
      setUploaded(true);
      setCoreState('success');
      setProcessingStatus(null);

      await saveDocument({
        fileName: analysis.file_name,
        summary: analysis.summary,
        importantDates: analysis.important_dates,
        eligibility: analysis.eligibility,
        requiredDocuments: analysis.required_documents,
        importantInfo: analysis.important_info,
        nextSteps: analysis.next_steps,
      });
      setSavedToDb(true);
    } catch (err: any) {
      console.error('Doc analysis error:', err);
      setActionError(err?.message || 'Document analysis failed. Please try a different document.');
      setCoreState('error');
      setProcessingStatus(null);
    } finally {
      setActionLoading(false);
      setTimeout(() => setCoreState('idle'), 1800);
    }
  };

  const processIncomingFile = (file: File) => {
    const isTextType =
      file.type === 'text/plain' ||
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.json') ||
      file.name.endsWith('.csv');

    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setUploadedFileMeta({
      name: file.name,
      size: formattedSize,
      type: file.type || 'Document',
    });

    if (isTextType) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        setRawText(content);
        await analyzeDocContent({ text: content, fileName: file.name }, file.name);
      };
      reader.readAsText(file);
    } else {
      // PDF, Images, Word documents or binary - Read as Data URL (base64)
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        const mime = file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
        setRawText(`[Uploaded Document: ${file.name} (${formattedSize})]`);
        await analyzeDocContent(
          {
            fileData: dataUrl,
            mimeType: mime,
            fileName: file.name,
          },
          file.name,
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processIncomingFile(file);
  };

  const runAction = async (action: Action) => {
    setActiveAction(action);
    setActionError(null);
    setCoreState('thinking');
    setActionLoading(true);

    try {
      if (action === 'simplify') {
        if (!simplifiedText) {
          const result = await simplifyText(docData.summary);
          setSimplifiedText(result);
        }
        setSimplified((prev) => !prev);
        setCoreState('success');
      } else if (action === 'translate') {
        const result = await translateText(docData.summary, targetLang);
        setTranslatedText(result);
        setCoreState('success');
      } else if (action === 'read') {
        speakText(simplified && simplifiedText ? simplifiedText : docData.summary);
        setCoreState('success');
      } else if (action === 'ask') {
        setAskOpen(true);
        setCoreState('idle');
      }
    } catch (err: any) {
      setCoreState('error');
      setActionError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setActionLoading(false);
      setTimeout(() => setCoreState('idle'), 1500);
    }
  };

  const handleLanguageChange = async (newLang: string) => {
    setTargetLang(newLang);
    setActionLoading(true);
    try {
      const result = await translateText(docData.summary, newLang);
      setTranslatedText(result);
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (speaking) {
        setSpeaking(false);
        return;
      }
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.95;
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utter);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  const sendAsk = async () => {
    if (!askInput.trim() || actionLoading) return;
    const userMsg = askInput;
    setAskMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setAskInput('');
    setCoreState('thinking');
    setActionLoading(true);

    try {
      const promptMessages = [
        {
          role: 'system' as const,
          content: `You are answering questions strictly based on this document (${docData.file_name}):\n\n${rawText || docData.summary}`,
        },
        ...askMessages.map((m) => ({
          role: (m.role === 'saarthi' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: m.text,
        })),
        { role: 'user' as const, content: userMsg },
      ];

      const reply = await chat(promptMessages);
      setAskMessages((m) => [...m, { role: 'saarthi', text: reply }]);
      setCoreState('success');
    } catch (err: any) {
      setCoreState('error');
      setAskMessages((m) => [
        ...m,
        { role: 'saarthi', text: `I could not process this right now. ${err?.message || ''}` },
      ]);
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
        title="Document AI Intelligence"
        subtitle="Extract eligibility, deadlines, required documents, and simplify legal jargon with Gemini 3.7."
        icon={FileText}
      />

      {!uploaded ? (
        <div className="flex flex-col items-center justify-center py-12">
          <SaarthiCore state={coreState} size={280} showStars={false} />

          {processingStatus && (
            <div className="mt-4 flex items-center gap-2 rounded-full border border-core-400/30 bg-core-500/10 px-4 py-1.5 text-xs text-core-200 animate-pulse">
              <Loader2 size={14} className="animate-spin text-core-400" />
              {processingStatus}
            </div>
          )}

          {actionError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3 text-xs text-danger-300 max-w-lg">
              <AlertCircle size={16} className="shrink-0 text-danger-400" />
              <span>{actionError}</span>
            </div>
          )}

          <div
            className="mt-6 w-full max-w-xl rounded-2xl border-2 border-dashed border-white/15 bg-ink-900/40 p-10 text-center transition hover:border-core-400/40 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) {
                processIncomingFile(file);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <Upload size={32} className="mx-auto text-core-400 mb-4" />
            <h3 className="font-display text-lg font-semibold text-white">Upload Any Document</h3>
            <p className="text-sm text-slate-400 mt-1">PDF, DOCX, TXT, Images, or Markdown · Drag & Drop here</p>
            <p className="text-xs text-slate-500 mt-3">Click to browse your device files (up to 15MB)</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md,.json,.csv,image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          <div className="mt-8 flex flex-col items-center gap-3">
            <span className="text-xs text-slate-500 uppercase tracking-wider">
              Or Try a Pre-loaded Government Scheme
            </span>
            <div className="flex flex-wrap gap-2 justify-center">
              {SAMPLE_DOCS.map((doc) => (
                <button
                  key={doc.name}
                  onClick={() => {
                    setUploadedFileMeta({ name: doc.name, size: 'Sample Scheme' });
                    setRawText(doc.text);
                    analyzeDocContent({ text: doc.text, fileName: doc.name }, doc.name);
                  }}
                  className="chip border border-white/10 text-xs text-slate-300 hover:border-core-400/40 hover:text-white"
                >
                  <Sparkles size={12} className="text-core-400" /> {doc.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Core + actions */}
          <div className="lg:sticky lg:top-8 lg:self-start space-y-4">
            <SectionCard className="flex flex-col items-center" delay={0}>
              <SaarthiCore state={coreState} size={200} showStars={false} />
              <div className="mt-3 text-center">
                <div className="font-display text-sm font-semibold text-white truncate max-w-[200px]">
                  {docData.file_name}
                </div>
                <div className="text-xs text-slate-400">
                  {uploadedFileMeta?.size ? `${uploadedFileMeta.size} · ` : ''}Gemini 3.7 AI
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Accessibility Tools" delay={0.1}>
              <div className="grid grid-cols-2 gap-2">
                <ActionButton
                  icon={Wand2}
                  label={simplified ? 'Original' : 'Simplify'}
                  active={simplified}
                  onClick={() => runAction('simplify')}
                />
                <ActionButton
                  icon={Languages}
                  label="Translate"
                  active={activeAction === 'translate'}
                  onClick={() => runAction('translate')}
                />
                <ActionButton
                  icon={speaking ? VolumeX : Volume2}
                  label={speaking ? 'Stop Voice' : 'Read Aloud'}
                  active={speaking}
                  onClick={() => runAction('read')}
                />
                <ActionButton
                  icon={MessageSquare}
                  label="Ask SAARTHI"
                  active={activeAction === 'ask' || askOpen}
                  onClick={() => {
                    setActiveAction('ask');
                    setAskOpen(true);
                  }}
                />
              </div>

              <button
                onClick={() => setUploaded(false)}
                className="mt-3 w-full btn-ghost text-xs flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={13} /> Analyze another document
              </button>
            </SectionCard>
          </div>

          {/* Right: document analysis */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {activeAction === 'translate' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <SectionCard title="Multilingual Translation" icon={<Languages size={18} />} delay={0}>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-xs text-slate-400">Select language:</span>
                      <select
                        value={targetLang}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="input text-xs py-1 px-2"
                      >
                        <option value="hi">Hindi (हिंदी)</option>
                        <option value="kn">Kannada (ಕನ್ನಡ)</option>
                        <option value="ta">Tamil (தமிழ்)</option>
                        <option value="te">Telugu (తెలుగు)</option>
                        <option value="ml">Malayalam (മലയാളം)</option>
                        <option value="mr">Marathi (मराठी)</option>
                        <option value="bn">Bengali (বাংলা)</option>
                        <option value="gu">Gujarati (ગુજરાતી)</option>
                      </select>
                    </div>

                    {actionLoading ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500 py-3">
                        <Loader2 size={16} className="animate-spin text-core-400" /> Translating document summary…
                      </div>
                    ) : translatedText ? (
                      <p className="rounded-xl border border-core-500/20 bg-ink-900/60 p-4 text-sm text-slate-100 whitespace-pre-line leading-relaxed">
                        {translatedText}
                      </p>
                    ) : null}
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

            <SectionCard title="Executive Summary" icon={<FileText size={18} />} delay={0}>
              <p className="text-slate-200 leading-relaxed text-sm whitespace-pre-line">
                {simplified && simplifiedText ? simplifiedText : docData.summary}
              </p>
              {simplified && (
                <div className="mt-3 flex items-center gap-2 text-xs text-core-300">
                  <Wand2 size={14} /> Simplified plain language view active
                </div>
              )}
            </SectionCard>

            {docData.important_dates && docData.important_dates.length > 0 && (
              <SectionCard title="Key Deadlines & Dates" icon={<Calendar size={18} />} delay={0.1}>
                <div className="space-y-2">
                  {docData.important_dates.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900/40 p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-core-500/10 text-core-300">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{d.event}</div>
                        <div className="text-xs text-slate-400">{d.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {docData.eligibility && docData.eligibility.length > 0 && (
                <SectionCard title="Eligibility Criteria" icon={<CheckCircle2 size={18} />} delay={0.15}>
                  <ul className="space-y-2">
                    {docData.eligibility.map((e, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <CheckCircle2 size={14} className="mt-1 shrink-0 text-success-400" /> {e}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {docData.required_documents && docData.required_documents.length > 0 && (
                <SectionCard title="Required Documents" icon={<ListChecks size={18} />} delay={0.2}>
                  <ul className="space-y-2">
                    {docData.required_documents.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <FileText size={14} className="mt-1 shrink-0 text-core-400" /> {d}
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}
            </div>

            {docData.important_info && docData.important_info.length > 0 && (
              <SectionCard title="Crucial Guidelines & Warnings" icon={<Info size={18} />} delay={0.25}>
                <ul className="space-y-2">
                  {docData.important_info.map((info, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <Info size={14} className="mt-1 shrink-0 text-warning-400" /> {info}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {docData.next_steps && docData.next_steps.length > 0 && (
              <SectionCard title="Action Checklist / Next Steps" icon={<ListTodo size={18} />} delay={0.3}>
                <ol className="space-y-3">
                  {docData.next_steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-core-500/15 text-xs font-medium text-core-300">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </SectionCard>
            )}

            {/* Ask SAARTHI panel */}
            <AnimatePresence>
              {askOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                >
                  <SectionCard title="Ask SAARTHI About This Document" icon={<MessageSquare size={18} />} delay={0}>
                    <div className="mb-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                      {askMessages.length === 0 && (
                        <p className="text-xs text-slate-400">
                          Ask any question (e.g. "What is the income limit?", "Can a 1st year student apply?").
                        </p>
                      )}
                      {askMessages.map((m, i) => (
                        <div
                          key={i}
                          className={`rounded-xl p-3 text-sm ${
                            m.role === 'user'
                              ? 'ml-8 bg-core-500/15 text-core-100'
                              : 'mr-8 bg-ink-900/60 text-slate-200'
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
                        placeholder="Ask anything about this document…"
                        className="input flex-1"
                        aria-label="Ask a question"
                        disabled={actionLoading}
                      />
                      <button
                        onClick={sendAsk}
                        disabled={actionLoading || !askInput.trim()}
                        className="btn-primary disabled:opacity-40"
                      >
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
