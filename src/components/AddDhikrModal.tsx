import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { DhikrTemplate } from '../types';

interface AddDhikrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (dhikr: Omit<DhikrTemplate, 'id' | 'category'>) => void;
  theme: 'emerald' | 'amber' | 'indigo' | 'slate';
}

export default function AddDhikrModal({ isOpen, onClose, onAdd, theme }: AddDhikrModalProps) {
  const [name, setName] = useState('');
  const [arabic, setArabic] = useState('');
  const [translation, setTranslation] = useState('');
  const [defaultTarget, setDefaultTarget] = useState(33);
  const [benefit, setBenefit] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onAdd({
      name: name.trim(),
      arabic: arabic.trim() || 'بِسْمِ ٱللَّٰهِ',
      translation: translation.trim() || 'In the name of Allah',
      defaultTarget: Number(defaultTarget) || 33,
      benefit: benefit.trim() || 'A personal prayer/remembrance of Allah.'
    });

    // Reset Form
    setName('');
    setArabic('');
    setTranslation('');
    setDefaultTarget(33);
    setBenefit('');
    onClose();
  };

  const getThemeColor = () => {
    switch (theme) {
      case 'emerald': return 'bg-emerald-600 focus:border-emerald-500 focus:ring-emerald-500/20 text-emerald-100 hover:bg-emerald-700';
      case 'amber': return 'bg-amber-600 focus:border-amber-500 focus:ring-amber-500/20 text-amber-100 hover:bg-amber-700';
      case 'indigo': return 'bg-indigo-600 focus:border-indigo-500 focus:ring-indigo-500/20 text-indigo-100 hover:bg-indigo-700';
      case 'slate': return 'bg-slate-700 focus:border-slate-600 focus:ring-slate-600/20 text-slate-100 hover:bg-slate-800';
    }
  };

  const getThemeInput = () => {
    switch (theme) {
      case 'emerald': return 'focus:border-emerald-500 focus:ring-emerald-500/20';
      case 'amber': return 'focus:border-amber-500 focus:ring-amber-500/20';
      case 'indigo': return 'focus:border-indigo-500 focus:ring-indigo-500/20';
      case 'slate': return 'focus:border-slate-600 focus:ring-slate-600/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-neutral-100 dark:border-neutral-800/80 transform transition-all"
        id="add-dhikr-modal"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800/80 flex justify-between items-center bg-neutral-50 dark:bg-neutral-950">
          <div className="flex items-center gap-2">
            <span className={`p-1.5 rounded-lg ${theme === 'emerald' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : theme === 'amber' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400' : theme === 'indigo' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
              <Plus className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">Add Custom Dhikr</h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Dhikr Name (Transliteration) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SubhanAllah, Hasbunallah..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-800 dark:text-neutral-100 focus:outline-hidden focus:ring-4 transition-all ${getThemeInput()}`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Arabic Script (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. سُبْحَانَ ٱللَّٰهِ"
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-800 dark:text-neutral-100 text-right font-semibold text-lg focus:outline-hidden focus:ring-4 transition-all ${getThemeInput()}`}
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Meaning Translation (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Glory be to Allah..."
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-800 dark:text-neutral-100 focus:outline-hidden focus:ring-4 transition-all ${getThemeInput()}`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                Target Count <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="99999"
                required
                value={defaultTarget}
                onChange={(e) => setDefaultTarget(Math.max(1, Number(e.target.value)))}
                className={`w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-800 dark:text-neutral-100 focus:outline-hidden focus:ring-4 transition-all ${getThemeInput()}`}
              />
            </div>
            
            <div className="flex flex-col justify-end">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDefaultTarget(33)}
                  className="flex-1 py-2.5 text-xs font-medium border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-600 dark:text-neutral-300 transition-colors"
                >
                  Set 33
                </button>
                <button
                  type="button"
                  onClick={() => setDefaultTarget(100)}
                  className="flex-1 py-2.5 text-xs font-medium border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 text-neutral-600 dark:text-neutral-300 transition-colors"
                >
                  Set 100
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
              Benefit & Virtue (Optional Description)
            </label>
            <textarea
              placeholder="e.g. Recitation of this leads to peaceful mind and spiritual elevation..."
              value={benefit}
              rows={2}
              onChange={(e) => setBenefit(e.target.value)}
              className={`w-full px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-800 dark:text-neutral-100 focus:outline-hidden focus:ring-4 transition-all resize-none ${getThemeInput()}`}
            />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${getThemeColor()}`}
          >
            <Plus className="w-5 h-5" />
            Add Dhikr to List
          </button>
        </form>
      </div>
    </div>
  );
}
