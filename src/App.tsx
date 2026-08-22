import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { A11yProvider } from '@/context/AccessibilityContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import AppShell from '@/components/AppShell';
import Landing from '@/pages/Landing';
import Auth from '@/pages/Auth';
import { Loader2 } from 'lucide-react';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const WebsiteAnalyzer = lazy(() => import('@/pages/WebsiteAnalyzer'));
const AccessibilityResults = lazy(() => import('@/pages/AccessibilityResults'));
const AccessibleView = lazy(() => import('@/pages/AccessibleView'));
const DocumentAI = lazy(() => import('@/pages/DocumentAI'));
const VoiceAssistant = lazy(() => import('@/pages/VoiceAssistant'));
const LanguageAssistant = lazy(() => import('@/pages/LanguageAssistant'));
const AccessibilitySettings = lazy(() => import('@/pages/AccessibilitySettings'));
const History = lazy(() => import('@/pages/History'));
const Reports = lazy(() => import('@/pages/Reports'));
const Profile = lazy(() => import('@/pages/Profile'));
const Settings = lazy(() => import('@/pages/Settings'));
const DemoMode = lazy(() => import('@/pages/DemoMode'));

function PageFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-ink-950">
      <Loader2 size={32} className="animate-spin text-core-400" />
    </div>
  );
}

function ProtectedAppShell() {
  const { session, loading } = useAuth();
  if (loading) return <PageFallback />;
  if (!session) return <Navigate to="/auth" replace />;
  return <AppShell />;
}

export default function App() {
  return (
    <AuthProvider>
      <A11yProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route element={<ProtectedAppShell />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/analyzer" element={<WebsiteAnalyzer />} />
                <Route path="/results" element={<AccessibilityResults />} />
                <Route path="/accessible-view" element={<AccessibleView />} />
                <Route path="/document-ai" element={<DocumentAI />} />
                <Route path="/voice" element={<VoiceAssistant />} />
                <Route path="/language" element={<LanguageAssistant />} />
                <Route path="/accessibility" element={<AccessibilitySettings />} />
                <Route path="/history" element={<History />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/demo" element={<DemoMode />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </A11yProvider>
    </AuthProvider>
  );
}
