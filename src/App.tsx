import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { A11yProvider } from '@/context/AccessibilityContext';
import AppShell from '@/components/AppShell';
import Landing from '@/pages/Landing';

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
    <div className="flex h-screen items-center justify-center">
      <div className="h-10 w-10 rounded-full border-2 border-core-400/30 border-t-core-400 animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <A11yProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route element={<AppShell />}>
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
            <Route path="*" element={<Landing />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </A11yProvider>
  );
}
