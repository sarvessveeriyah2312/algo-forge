import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, X, ShieldAlert } from 'lucide-react';
import { useToastStore } from '../../store/useToastStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-[#00d4aa]" />;
      case 'error':
        return <ShieldAlert className="w-4 h-4 text-[#ef4444]" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-[#f59e0b]" />;
      default:
        return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-[#00d4aa]/30';
      case 'error':
        return 'border-[#ef4444]/30';
      case 'warning':
        return 'border-[#f59e0b]/30';
      default:
        return 'border-sky-400/30';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className={`pointer-events-auto flex items-center p-3 rounded-md bg-[#111827] border ${getBorderColor(
              toast.type
            )} shadow-2xl space-x-3 select-none`}
          >
            <div className="shrink-0">{getIcon(toast.type)}</div>
            <p className="flex-1 text-xs text-gray-200 font-sans tracking-wide">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-gray-500 hover:text-white transition-all cursor-pointer rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
