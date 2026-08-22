import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import SaarthiCore from '@/components/SaarthiCore';
import { useAuth } from '@/context/AuthContext';

export default function Auth() {
  const { session, loading, signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <Loader2 size={32} className="animate-spin text-core-400" />
      </div>
    );
  }

  if (session) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (mode === 'signup') {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        setError(error);
        setSubmitting(false);
        return;
      }
      // After signup, Supabase auto-signs in (email confirmation off)
      navigate('/dashboard');
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
        setSubmitting(false);
        return;
      }
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      {/* Background glow */}
      <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-core-600/10 blur-[120px]" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
        {/* Left: Core */}
        <div className="hidden flex-col items-center justify-center lg:flex">
          <SaarthiCore state="idle" size={360} showStars />
          <div className="mt-6 text-center">
            <h2 className="font-display text-2xl font-semibold text-white">SAARTHI AI</h2>
            <p className="text-sm text-slate-500">The Internet Should Adapt to You</p>
          </div>
        </div>

        {/* Right: Auth form */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-core-400 to-core-700 flex items-center justify-center">
                <Sparkles size={18} className="text-ink-950" />
              </div>
              <span className="font-display text-lg font-semibold text-white">SAARTHI AI</span>
            </div>

            <div className="card p-8">
              <h1 className="font-display text-2xl font-bold text-white">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {mode === 'login' ? 'Sign in to continue to SAARTHI AI' : 'Join SAARTHI AI to personalize your web experience'}
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-300">Full Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Aarav Sharma"
                        className="input pl-10"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input pl-10"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 rounded-xl border border-danger-500/30 bg-danger-500/10 p-3 text-sm text-danger-400"
                    >
                      <AlertCircle size={16} /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Please wait…</>
                  ) : (
                    <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-slate-400">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  onClick={() => {
                    setMode(mode === 'login' ? 'signup' : 'login');
                    setError(null);
                  }}
                  className="text-core-300 hover:text-core-200 font-medium"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-slate-500 hover:text-slate-300">← Back to home</Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
