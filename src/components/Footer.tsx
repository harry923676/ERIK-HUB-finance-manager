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

      {/* Center: Highlighted "developed by Pawan Paji" with 5-second shine */}
      <div 
        id="footer-developer-credit"
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-amber-400/50 dark:hover:border-amber-400/50 transition-all"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-500 shine-star-sparkle shrink-0" />
        <span className="text-slate-600 dark:text-slate-300 font-medium text-xs">
          developed by
        </span>
        <span className="font-extrabold text-sm tracking-wide shine-text-pawan font-['Outfit'] cursor-default">
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
