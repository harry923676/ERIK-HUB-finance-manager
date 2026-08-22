import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';

export const Footer: React.FC = () => {
  const { settings } = useBusiness();

  return (
    <footer 
      id="app-footer" 
      className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500 dark:text-slate-400 shrink-0 no-print transition-colors select-none z-20"
    >
      {/* Left: App Title & Business Info */}
      <div className="flex items-center gap-2">
        <span className="font-bold text-slate-800 dark:text-slate-200 font-['Outfit']">
          {settings.business_name || 'ERIK-HUB Finance manager'}
        </span>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
        <span className="hidden sm:inline text-[11px] text-slate-400">
          Smart Business Operations
        </span>
      </div>

      {/* Center: Clean "developed by Pawan Paji" badge */}
      <div 
        id="footer-developer-credit"
        className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300"
      >
        <span className="text-slate-500 dark:text-slate-400 font-normal text-xs">
          developed by
        </span>
        <span className="font-bold text-xs text-indigo-600 dark:text-indigo-400 font-['Outfit']">
          Pawan Paji
        </span>
      </div>

      {/* Right: Copyright info */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
        <span>Crafted with</span>
        <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
        <span>© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
};
