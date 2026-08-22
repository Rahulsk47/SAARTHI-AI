import { useState, useEffect, useCallback } from 'react';
import { User, Mail, Calendar, Award, Activity, Globe, FileText, Languages, Mic, Edit2, Save, Loader2, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface ActivityRow {
  id: string;
  type: string;
  title: string;
  detail: string;
  score: number | null;
  created_at: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [createdAt, setCreatedAt] = useState<string>('');
  const [stats, setStats] = useState({ websites: 0, documents: 0, translations: 0, voice: 0 });
  const [recent, setRecent] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    if (profile) {
      setFullName(profile.full_name ?? '');
    }
    setCreatedAt(user.created_at);

    const { data: logs } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (logs) {
      setRecent(logs.slice(0, 4) as ActivityRow[]);
      setStats({
        websites: logs.filter((l) => l.type === 'website').length,
        documents: logs.filter((l) => l.type === 'document').length,
        translations: logs.filter((l) => l.type === 'translation').length,
        voice: logs.filter((l) => l.type === 'voice').length,
      });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id);
    setSaving(false);
    if (!error) {
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const initials = (fullName || user?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-core-400" />
      </div>
    );
  }

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader title="Profile" subtitle="Your account and activity overview." icon={User} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <SectionCard delay={0} className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-core-400 to-core-700 text-3xl font-bold text-ink-950 shadow-glow">
              {initials}
            </div>
            {editing ? (
              <div className="mt-4 w-full">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  className="input text-center"
                  aria-label="Full name"
                />
                <div className="mt-3 flex gap-2">
                  <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save</>}
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-ghost flex-1">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="mt-4 font-display text-xl font-semibold text-white">
                  {fullName || 'Your Name'}
                </h2>
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                  <Mail size={14} /> {user?.email}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                  <Calendar size={14} /> Joined {new Date(createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </div>
                <button onClick={() => setEditing(true)} className="btn-ghost mt-6 w-full">
                  <Edit2 size={16} /> Edit Profile
                </button>
                {saved && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-success-400">
                    <CheckCircle2 size={14} /> Profile updated.
                  </div>
                )}
              </>
            )}
          </div>
        </SectionCard>

        {/* Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={Globe} label="Websites" value={stats.websites} color="text-core-300" />
            <StatCard icon={FileText} label="Documents" value={stats.documents} color="text-accent-400" />
            <StatCard icon={Languages} label="Translations" value={stats.translations} color="text-core-300" />
            <StatCard icon={Mic} label="Voice Sessions" value={stats.voice} color="text-accent-400" />
          </div>

          <SectionCard title="Achievements" icon={<Award size={18} />} delay={0.1}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { icon: Globe, title: 'First Analysis', desc: 'Analyzed your first website', unlocked: stats.websites > 0 },
                { icon: Languages, title: 'Polyglot', desc: 'Translated into 3+ languages', unlocked: stats.translations >= 3 },
                { icon: FileText, title: 'Document Master', desc: 'Processed 5 documents', unlocked: stats.documents >= 5 },
                { icon: Activity, title: 'Power User', desc: 'Used all 6 SAARTHI tools', unlocked: stats.websites > 0 && stats.documents > 0 },
              ].map((a) => (
                <div
                  key={a.title}
                  className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                    a.unlocked ? 'border-core-400/20 bg-core-500/5' : 'border-white/5 bg-ink-900/40 opacity-50'
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${a.unlocked ? 'bg-core-500/10 text-core-300' : 'bg-white/5 text-slate-600'}`}>
                    <a.icon size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{a.title}</div>
                    <div className="text-xs text-slate-500">{a.desc}</div>
                  </div>
                  {a.unlocked && <CheckCircle2 size={16} className="ml-auto text-success-400" />}
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Recent Activity" icon={<Activity size={18} />} delay={0.15}>
            <div className="space-y-2">
              {recent.length === 0 ? (
                <p className="text-center text-slate-500 py-4 text-sm">No activity yet.</p>
              ) : (
                recent.map((h) => (
                  <div key={h.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-ink-900/40 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400">
                      {h.type === 'website' && <Globe size={14} />}
                      {h.type === 'document' && <FileText size={14} />}
                      {h.type === 'voice' && <Mic size={14} />}
                      {h.type === 'translation' && <Languages size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{h.title}</div>
                      <div className="text-xs text-slate-500">{new Date(h.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Globe; label: string; value: number; color: string }) {
  return (
    <div className="card text-center">
      <Icon size={22} className={`mx-auto mb-2 ${color}`} />
      <div className="font-display text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
