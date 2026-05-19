import { Trash2, Trash, Calendar, Award, CheckCircle, Flame } from 'lucide-react';
import { DhikrLog } from '../types';
import { motion } from 'motion/react';

interface HistoryLogsProps {
  logs: DhikrLog[];
  onClearLogs: () => void;
  theme: 'emerald' | 'amber' | 'indigo' | 'slate';
}

export default function HistoryLogs({ logs, onClearLogs, theme }: HistoryLogsProps) {
  // Group logs by day to calculate streak and daily totals
  const todayStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  
  const dailyTotals = logs.reduce((acc, log) => {
    const dateStr = new Date(log.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    acc[dateStr] = (acc[dateStr] || 0) + log.count;
    return acc;
  }, {} as Record<string, number>);

  // Calculate Streak: sequential days with non-zero logs
  const calculateStreak = () => {
    let streak = 0;
    const today = new Date();
    
    // Check backwards from today
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date();
      checkDate.setDate(today.getDate() - i);
      const checkStr = checkDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      
      if (dailyTotals[checkStr] && dailyTotals[checkStr] > 0) {
        streak++;
      } else {
        // If it's today and empty, check if yesterday had data before breaking
        if (i === 0) {
          continue; 
        }
        break;
      }
    }
    return streak;
  };

  const streakCount = calculateStreak();
  const totalCountsAllTime = logs.reduce((sum, log) => sum + log.count, 0);
  const totalSessionsCount = logs.length;

  const getThemeText = () => {
    switch (theme) {
      case 'emerald': return 'text-emerald-600 dark:text-emerald-400';
      case 'amber': return 'text-amber-500 dark:text-amber-400';
      case 'indigo': return 'text-indigo-600 dark:text-indigo-400';
      case 'slate': return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getThemeBadge = () => {
    switch (theme) {
      case 'emerald': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-100/30';
      case 'amber': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-100/30';
      case 'indigo': return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-100/30';
      case 'slate': return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-705/30';
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-100 dark:border-neutral-800/80 shadow-xs space-y-6" id="history-logs-card">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-150/50 dark:border-neutral-800/40 text-center">
          <div className="flex justify-center mb-1">
            <Flame className={`w-5 h-5 ${streakCount > 0 ? 'text-orange-500 animate-bounce' : 'text-neutral-350'}`} />
          </div>
          <span className="block text-lg font-bold text-neutral-800 dark:text-neutral-100 font-mono leading-none">
            {streakCount}
          </span>
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mt-1 block">
            Days Streak
          </span>
        </div>

        <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-150/50 dark:border-neutral-800/40 text-center">
          <div className="flex justify-center mb-1">
            <Award className={`w-5 h-5 ${getThemeText()}`} />
          </div>
          <span className="block text-lg font-bold text-neutral-800 dark:text-neutral-100 font-mono leading-none">
            {totalCountsAllTime}
          </span>
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mt-1 block">
            Total Counts
          </span>
        </div>

        <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-150/50 dark:border-neutral-800/40 text-center">
          <div className="flex justify-center mb-1">
            <CheckCircle className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="block text-lg font-bold text-neutral-800 dark:text-neutral-100 font-mono leading-none">
            {totalSessionsCount}
          </span>
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mt-1 block">
            Tasbeehs
          </span>
        </div>
      </div>

      {/* Header and list of logs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-neutral-500" />
            Remembrance Logs History
          </h3>
          {logs.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear your remembrance logs history? This cannot be undone.")) {
                  onClearLogs();
                }
              }}
              className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>

        {/* List of completed items */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 dark:text-neutral-500 text-xs flex flex-col items-center justify-center gap-2">
              <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-full text-neutral-400">
                <Trash className="w-5 h-5" />
              </div>
              <p>Your history log is currently empty.</p>
              <p className="text-[10px]">Complete a tasbeeh cycle above to write a record!</p>
            </div>
          ) : (
            [...logs].reverse().map((log) => {
              const date = new Date(log.completedAt);
              const formattedTime = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
              const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

              return (
                <div
                  key={log.id}
                  className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-150/40 dark:border-neutral-800/40 flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      {log.name}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-medium">
                      {formattedDate} at {formattedTime}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border font-mono ${getThemeBadge()}`}>
                      {log.count} / {log.target}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
