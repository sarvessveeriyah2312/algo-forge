import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastContainer } from '../ui/ToastContainer';
import { motion } from 'motion/react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Activate global terminal navigation hotkeys
  useKeyboardShortcuts();

  return (
    <div className="flex bg-[#0a0e17] text-[#f9fafb] h-screen w-screen overflow-hidden font-sans select-none antialiased">
      {/* Toast Manager */}
      <ToastContainer />

      {/* Left Navigation Rails */}
      <Sidebar />

      {/* Right Workspaces */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        <TopBar />
        
        {/* Scrollable Workstation */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0a0e17]">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-7xl mx-auto space-y-6"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
