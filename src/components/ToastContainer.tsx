import React from 'react';
import { useBusiness } from '../context/BusinessContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useBusiness();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-indigo-500 shrink-0" />;
    }
  };

  const getBgClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/20 bg-emerald-50/90 text-emerald-950 dark:bg-emerald-950/80 dark:text-emerald-100 dark:border-emerald-800/40';
      case 'error':
        return 'border-rose-500/20 bg-rose-50/90 text-rose-950 dark:bg-rose-950/80 dark:text-rose-100 dark:border-rose-800/40';
      case 'warning':
        return 'border-amber-500/20 bg-amber-50/90 text-amber-950 dark:bg-amber-950/80 dark:text-amber-100 dark:border-amber-800/40';
      default:
        return 'border-indigo-500/20 bg-indigo-50/90 text-indigo-950 dark:bg-indigo-950/80 dark:text-indigo-100 dark:border-indigo-800/40';
    }
  };

  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md ${getBgClass(toast.type)}`}
          >
            {getIcon(toast.type)}
            <div className="flex-1 text-sm font-medium leading-snug">
              {toast.message}
            </div>
            <button
              id={`toast-close-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-0.5 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
