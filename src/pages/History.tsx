import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Globe, FileText, Mic, Languages, Filter, ArrowRight, Loader2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import { getRecentActivity, type ActivityLog } from '@/lib/data';

type FilterType = 'all' | 'website' | 'document' | 'voice' | 'translation';

const TYPE_META: Record<string, { icon: typeof Globe; label: string; color: string }> = {
  website: { icon: Globe, label: 'Website Analysis', color: 'text-core-300' },
  document: { icon: FileText, label: 'Document AI', color: 'text-accent-400' },
  voice: { icon: Mic, label: 'Voice Session', color: 'text-core-300' },
  translation: { icon: Languages, label: 'Translation', color: 'text-accent-400' },
};

export default function History() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [items, setItems] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getRecentActivity(60);
      setItems(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all' ? items : items.filter((h) => h.type === filter);

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader title="Activity History" subtitle="Your saved audit logs, voice sessions, and document analyses." icon={HistoryIcon} />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm text-slate-500">
          <Filter size={14} /> Filter:
        </span>
        {(['all', 'website', 'document', 'voice', 'translation'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`chip border transition capitalize ${
              filter === f
                ? 'border-core-400/40 bg-core-500/15 text-core-200'
                : 'border-white/10 text-slate-400 hover:text-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-core-400" />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filtered.map((item, i) => {
              const meta = TYPE_META[item.type] ?? { icon: Globe, label: item.type, color: 'text-slate-400' };
              const Icon = meta.icon;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to={item.type === 'website' ? '/results' : item.type === 'document' ? '/document-ai' : item.type === 'voice' ? '/voice' : '/language'}
                    className="group flex items-center gap-4 card hover:border-core-400/30 hover:bg-ink-700/60 transition-all p-4"
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 ${meta.color}`}>
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">{item.title}</span>
                        <span className="chip border border-white/10 text-slate-500">{meta.label}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{item.detail}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(item.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                    {item.score != null && (
                      <span
                        className={`chip ${item.score >= 80 ? 'text-success-400' : item.score >= 60 ? 'text-warning-400' : 'text-danger-400'}`}
                      >
                        {item.score}/100
                      </span>
                    )}
                    <ArrowRight size={18} className="text-slate-600 group-hover:text-core-300 transition" />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <SectionCard delay={0}>
              <p className="text-center text-slate-500 py-8">
                {items.length === 0
                  ? 'No activities yet. Start by auditing a website, uploading a document, or speaking with SAARTHI AI.'
                  : 'No activities found for this filter.'}
              </p>
            </SectionCard>
          )}
        </>
      )}
    </div>
  );
}
