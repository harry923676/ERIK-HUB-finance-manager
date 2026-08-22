/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FileSpreadsheet, X, CheckCircle2, AlertCircle, RefreshCw, PlusCircle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CSVImportResult } from '../utils/csvUtils';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  importResult: CSVImportResult | null;
  onConfirm: (mode: 'merge' | 'replace') => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  importResult,
  onConfirm
}) => {
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');

  if (!importResult) return null;

  const totalDetected = 
    importResult.counts.orders + 
    importResult.counts.expenditures + 
    importResult.counts.customers + 
    importResult.counts.products;

  const handleConfirm = () => {
    onConfirm(importMode);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="csv-import-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white font-['Outfit']">
                    Import CSV Business Data
                  </h3>
                  <p className="text-xs text-slate-400">
                    Review parsed CSV records before applying changes
                  </p>
                </div>
              </div>

              <button
                id="close-csv-import-modal-btn"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Summary Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Detected CSV Format
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 capitalize">
                    {importResult.detectedType === 'unified' ? 'Complete Unified Backup' : `${importResult.detectedType} CSV`}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  {importResult.summary}
                </p>
              </div>

              {/* Record Breakdown Stats */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                  Records Ready to Import
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-center">
                    <span className="block text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                      {importResult.counts.orders}
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      Orders
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 text-center">
                    <span className="block text-lg font-extrabold text-rose-600 dark:text-rose-400">
                      {importResult.counts.expenditures}
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      Expenses
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/50 text-center">
                    <span className="block text-lg font-extrabold text-cyan-600 dark:text-cyan-400">
                      {importResult.counts.customers}
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      Customers
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 text-center">
                    <span className="block text-lg font-extrabold text-purple-600 dark:text-purple-400">
                      {importResult.counts.products}
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      Products
                    </span>
                  </div>
                </div>
              </div>

              {/* Import Mode Selector */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                  Import Action Strategy
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Merge Option */}
                  <label 
                    onClick={() => setImportMode('merge')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      importMode === 'merge'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <PlusCircle className={`w-4 h-4 ${importMode === 'merge' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                        <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                          Merge Records
                        </span>
                      </div>
                      <input 
                        type="radio" 
                        name="importMode" 
                        checked={importMode === 'merge'} 
                        onChange={() => setImportMode('merge')}
                        className="text-indigo-600 focus:ring-indigo-500" 
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Appends new records and preserves your existing business entries.
                    </p>
                  </label>

                  {/* Replace Option */}
                  <label 
                    onClick={() => setImportMode('replace')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      importMode === 'replace'
                        ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <RefreshCw className={`w-4 h-4 ${importMode === 'replace' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`} />
                        <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white">
                          Replace All
                        </span>
                      </div>
                      <input 
                        type="radio" 
                        name="importMode" 
                        checked={importMode === 'replace'} 
                        onChange={() => setImportMode('replace')}
                        className="text-rose-600 focus:ring-rose-500" 
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Overwrites current data with the imported records from this file.
                    </p>
                  </label>
                </div>
              </div>

              {/* Warnings if any */}
              {importResult.warnings.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Notice:</span> {importResult.warnings.join(' ')}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={totalDetected === 0}
                onClick={handleConfirm}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                  totalDetected === 0
                    ? 'bg-slate-400 cursor-not-allowed opacity-60'
                    : importMode === 'replace'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Import ({totalDetected} Records)</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
