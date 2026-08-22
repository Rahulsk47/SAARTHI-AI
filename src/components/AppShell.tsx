import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Chatbot from './Chatbot';
import { motion, AnimatePresence } from 'framer-motion';

export default function AppShell() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-ink-950">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="min-h-screen"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Chatbot />
    </div>
  );
}
