import { Cog, Bell, Shield, Palette, Globe, Save } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import { useState } from 'react';

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [theme, setTheme] = useState('dark');

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader title="Settings" subtitle="Application preferences and account configuration." icon={Cog} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Notifications" icon={<Bell size={18} />} delay={0}>
          <div className="space-y-4">
            <ToggleRow
              label="Email notifications"
              desc="Receive updates about your analyses and reports."
              checked={notifications}
              onChange={setNotifications}
            />
            <ToggleRow
              label="Auto-analyze visited URLs"
              desc="Automatically run accessibility checks on URLs you enter."
              checked={autoAnalyze}
              onChange={setAutoAnalyze}
            />
          </div>
        </SectionCard>

        <SectionCard title="Appearance" icon={<Palette size={18} />} delay={0.05}>
          <div className="space-y-3">
            <div className="text-sm text-slate-400">Theme</div>
            <div className="grid grid-cols-3 gap-2">
              {['dark', 'midnight', 'system'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`rounded-xl border p-3 text-sm capitalize transition ${
                    theme === t ? 'border-core-400/40 bg-core-500/15 text-core-200' : 'border-white/5 text-slate-400 hover:border-white/15'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">Dark futuristic theme is the default and recommended experience.</p>
          </div>
        </SectionCard>

        <SectionCard title="Privacy" icon={<Shield size={18} />} delay={0.1}>
          <div className="space-y-3 text-sm text-slate-400">
            <p>Your data is stored locally in this demo build. When connected to Supabase, analyses and documents are saved to your account.</p>
            <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-ink-900/40 p-3">
              <Shield size={16} className="text-success-400" />
              <span>No data leaves your device in demo mode.</span>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Region & Language" icon={<Globe size={18} />} delay={0.15}>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Default analysis language</label>
              <select className="input" aria-label="Default language">
                <option>English</option>
                <option>Hindi</option>
                <option>Tamil</option>
                <option>Kannada</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">Timezone</label>
              <select className="input" aria-label="Timezone">
                <option>India Standard Time (IST)</option>
                <option>UTC</option>
              </select>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="btn-primary">
          <Save size={16} /> Save Changes
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? 'bg-core-500' : 'bg-white/10'}`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <div className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}
