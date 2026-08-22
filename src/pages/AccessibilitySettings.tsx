import { motion } from 'framer-motion';
import {
  Settings2,
  Type,
  Contrast,
  AlignLeft,
  Wand2,
  Maximize2,
  ZapOff,
  Languages,
  RotateCcw,
  Eye,
  Sparkles,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import SectionCard from '@/components/SectionCard';
import { useA11y, LANGUAGES, type A11ySettings } from '@/context/AccessibilityContext';

export default function AccessibilitySettings() {
  const { settings, update, reset } = useA11y();

  const applyPreset = (preset: Partial<A11ySettings>) => {
    Object.entries(preset).forEach(([key, val]) => {
      update(key as keyof A11ySettings, val as any);
    });
  };

  return (
    <div className="px-6 py-8 md:px-10">
      <PageHeader
        title="Accessibility Center"
        subtitle="Personalize SAARTHI AI. These controls change the entire application in real time."
        icon={Settings2}
        actions={
          <button onClick={reset} className="btn-ghost text-sm">
            <RotateCcw size={16} /> Reset to Defaults
          </button>
        }
      />

      {/* Quick Profile Presets */}
      <div className="mb-8 rounded-2xl border border-white/10 bg-ink-900/40 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
          <Sparkles size={16} className="text-core-400" />
          <span>Instant Accessibility Presets</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            onClick={() =>
              applyPreset({
                fontScale: 1,
                letterSpacing: 0,
                wordSpacing: 0,
                lineHeight: 1.5,
                highContrast: false,
                simpleLanguage: false,
                largeControls: false,
                reduceMotion: false,
              })
            }
            className="rounded-xl border border-white/10 bg-ink-950 p-3 text-left hover:border-core-400/40 transition"
          >
            <div className="text-xs font-semibold text-white">Default Balanced</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Standard clean interface</div>
          </button>

          <button
            onClick={() =>
              applyPreset({
                fontScale: 1.25,
                highContrast: true,
                largeControls: true,
                letterSpacing: 0.04,
                lineHeight: 1.7,
              })
            }
            className="rounded-xl border border-yellow-400/40 bg-yellow-400/5 p-3 text-left hover:border-yellow-400 transition"
          >
            <div className="text-xs font-semibold text-yellow-300">High Contrast & Focus</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Max text-bg visibility</div>
          </button>

          <button
            onClick={() =>
              applyPreset({
                fontScale: 1.15,
                letterSpacing: 0.06,
                wordSpacing: 0.15,
                lineHeight: 1.8,
                simpleLanguage: true,
              })
            }
            className="rounded-xl border border-core-400/40 bg-core-500/10 p-3 text-left hover:border-core-300 transition"
          >
            <div className="text-xs font-semibold text-core-200">Dyslexia & Readability</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Expanded word tracking</div>
          </button>

          <button
            onClick={() =>
              applyPreset({
                fontScale: 1.3,
                largeControls: true,
                simpleLanguage: true,
                reduceMotion: true,
                lineHeight: 1.7,
              })
            }
            className="rounded-xl border border-success-500/40 bg-success-500/10 p-3 text-left hover:border-success-400 transition"
          >
            <div className="text-xs font-semibold text-success-300">Senior Citizen / Motor</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Large touch targets & simple words</div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Font Size */}
        <SectionCard title="Font Size" icon={<Type size={18} />} delay={0}>
          <div className="mb-3 text-sm text-slate-400">
            Current scale: <span className="text-core-300 font-medium">{settings.fontScale}x</span>
          </div>
          <input
            type="range"
            min={0.85}
            max={1.6}
            step={0.05}
            value={settings.fontScale}
            onChange={(e) => update('fontScale', parseFloat(e.target.value))}
            className="w-full accent-core-500"
            aria-label="Font size"
          />
          <div className="mt-3 flex items-center justify-between text-slate-500 text-xs">
            <span>A</span>
            <span style={{ fontSize: `${1.3 * settings.fontScale}rem` }} className="text-slate-300">A</span>
            <span style={{ fontSize: `${1.6 * settings.fontScale}rem` }} className="text-slate-300">A</span>
          </div>
        </SectionCard>

        {/* High Contrast */}
        <SectionCard title="High Contrast" icon={<Contrast size={18} />} delay={0.05}>
          <ToggleRow
            label="Enable high contrast mode"
            desc="Maximizes text-background contrast for better readability."
            checked={settings.highContrast}
            onChange={(v) => update('highContrast', v)}
          />
        </SectionCard>

        {/* Text Spacing */}
        <SectionCard title="Text Spacing" icon={<AlignLeft size={18} />} delay={0.1}>
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-slate-400">Letter spacing</span>
                <span className="text-core-300">{settings.letterSpacing}em</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.2}
                step={0.01}
                value={settings.letterSpacing}
                onChange={(e) => update('letterSpacing', parseFloat(e.target.value))}
                className="w-full accent-core-500"
                aria-label="Letter spacing"
              />
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-slate-400">Word spacing</span>
                <span className="text-core-300">{settings.wordSpacing}em</span>
              </div>
              <input
                type="range"
                min={0}
                max={0.5}
                step={0.05}
                value={settings.wordSpacing}
                onChange={(e) => update('wordSpacing', parseFloat(e.target.value))}
                className="w-full accent-core-500"
                aria-label="Word spacing"
              />
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-slate-400">Line height</span>
                <span className="text-core-300">{settings.lineHeight}</span>
              </div>
              <input
                type="range"
                min={1.3}
                max={2.2}
                step={0.1}
                value={settings.lineHeight}
                onChange={(e) => update('lineHeight', parseFloat(e.target.value))}
                className="w-full accent-core-500"
                aria-label="Line height"
              />
            </div>
          </div>
        </SectionCard>

        {/* Simple Language */}
        <SectionCard title="Simple Language" icon={<Wand2 size={18} />} delay={0.15}>
          <ToggleRow
            label="Use simple language by default"
            desc="SAARTHI will prefer simplified summaries and plain language."
            checked={settings.simpleLanguage}
            onChange={(v) => update('simpleLanguage', v)}
          />
        </SectionCard>

        {/* Large Controls */}
        <SectionCard title="Large Controls" icon={<Maximize2 size={18} />} delay={0.2}>
          <ToggleRow
            label="Enlarge buttons and inputs"
            desc="Makes all interactive elements larger and easier to tap."
            checked={settings.largeControls}
            onChange={(v) => update('largeControls', v)}
          />
        </SectionCard>

        {/* Reduce Motion */}
        <SectionCard title="Reduce Motion" icon={<ZapOff size={18} />} delay={0.25}>
          <ToggleRow
            label="Reduce animations and motion"
            desc="Disables 3D animations, transitions, and floating effects."
            checked={settings.reduceMotion}
            onChange={(v) => update('reduceMotion', v)}
          />
          {settings.reduceMotion && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-warning-500/20 bg-warning-500/5 p-3 text-sm text-warning-400">
              <Eye size={14} /> 3D Core animations are reduced. Static fallback is shown.
            </div>
          )}
        </SectionCard>

        {/* Preferred Language */}
        <SectionCard title="Preferred Language" icon={<Languages size={18} />} delay={0.3} className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => update('language', l.code)}
                className={`rounded-xl border p-4 text-center transition ${
                  settings.language === l.code
                    ? 'border-core-400/40 bg-core-500/15'
                    : 'border-white/5 bg-ink-900/40 hover:border-white/15'
                }`}
              >
                <div className="font-display text-lg font-semibold text-white">{l.native}</div>
                <div className="text-xs text-slate-500">{l.name}</div>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Live preview */}
      <div className="mt-8">
        <SectionCard title="Live Preview" delay={0.35}>
          <div className="rounded-xl border border-white/10 bg-ink-900/40 p-6">
            <h3 className="font-display text-xl font-semibold text-white">National Merit Scholarship 2026</h3>
            <p className="mt-2 text-slate-300">
              This scholarship supports students from low-income families. You can apply online with
              the required documents before the deadline.
            </p>
            <div className="mt-4 flex gap-3">
              <button className="btn-primary">Apply Now</button>
              <button className="btn-ghost">Learn More</button>
            </div>
          </div>
        </SectionCard>
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
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? 'bg-core-500' : 'bg-white/10'
        }`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <motion.div
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute top-1 h-5 w-5 rounded-full bg-white ${checked ? 'left-6' : 'left-1'}`}
        />
      </button>
    </div>
  );
}