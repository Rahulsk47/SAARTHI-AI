import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Globe,
  FileText,
  Mic,
  Languages,
  Settings2,
  History,
  BarChart3,
  User,
  Cog,
  Sparkles,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/analyzer', label: 'Website Analyzer', icon: Globe },
  { to: '/accessible-view', label: 'Accessible View', icon: Sparkles },
  { to: '/document-ai', label: 'Document AI', icon: FileText },
  { to: '/voice', label: 'Voice Assistant', icon: Mic },
  { to: '/language', label: 'Language Assistant', icon: Languages },
  { to: '/accessibility', label: 'Accessibility Center', icon: Settings2 },
  { to: '/history', label: 'History', icon: History },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Cog },
  { to: '/demo', label: 'Demo Mode', icon: Sparkles },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-4 z-50 btn-ghost md:hidden"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle navigation"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-white/10 bg-ink-900/60 backdrop-blur-xl">
        <SidebarContent onSignOut={handleSignOut} userEmail={user?.email} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-white/10 bg-ink-900 md:hidden"
            >
              <SidebarContent onNavigate={() => setOpen(false)} onSignOut={handleSignOut} userEmail={user?.email} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );

  function SidebarContent({
    onNavigate,
    onSignOut,
    userEmail,
  }: {
    onNavigate?: () => void;
    onSignOut: () => void;
    userEmail?: string;
  }) {
    return (
      <div className="flex h-full flex-col">
        <NavLink to="/" onClick={onNavigate} className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="relative h-9 w-9 rounded-full bg-gradient-to-br from-core-400 to-core-700 shadow-glow flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-core-200/40 animate-spin-slow" />
            <Sparkles size={18} className="text-ink-950" />
          </div>
          <div>
            <div className="font-display text-lg font-semibold text-white leading-none">SAARTHI</div>
            <div className="text-[10px] tracking-[0.2em] text-core-300 uppercase">AI</div>
          </div>
        </NavLink>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? 'bg-core-500/15 text-core-200 border border-core-400/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-3">
          {userEmail && (
            <div className="px-3">
              <div className="text-xs text-slate-400 truncate">{userEmail}</div>
            </div>
          )}
          <button
            onClick={onSignOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:text-danger-400 hover:bg-danger-500/5 transition"
          >
            <LogOut size={16} /> Sign Out
          </button>
          <div className="text-[10px] text-slate-500 px-3">v1.0 · Full-Stack Build</div>
          <div className="text-[10px] text-slate-600 px-3">{location.pathname}</div>
        </div>
      </div>
    );
  }
}
