import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Trash2, Plus, Clock, AlertCircle } from 'lucide-react';
import { ReminderSetting } from '../types';
import { audioSynth } from '../utils/audio';

interface RemindersManagerProps {
  reminders: ReminderSetting[];
  onUpdateReminders: (reminders: ReminderSetting[]) => void;
  theme: 'emerald' | 'amber' | 'indigo' | 'slate';
}

export default function RemindersManager({ reminders, onUpdateReminders, theme }: RemindersManagerProps) {
  const [newTime, setNewTime] = useState('08:00');
  const [newLabel, setNewLabel] = useState('Morning Dhikr');
  const [newFrequency, setNewFrequency] = useState<'daily' | 'hourly'>('daily');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert("This browser doesn't support desktop notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    if (permission === 'granted') {
      new Notification("Tasbeeh Reminder", {
        body: "Reminders are now successfully activated!",
        icon: "/favicon.ico"
      });
      audioSynth.playNotificationChime();
    }
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime) return;

    const newReminder: ReminderSetting = {
      id: Math.random().toString(36).substr(2, 9),
      time: newTime,
      label: newLabel.trim() || 'Dhikr Reminder',
      enabled: true,
      frequency: newFrequency
    };

    onUpdateReminders([...reminders, newReminder]);
    setNewLabel('');
    audioSynth.playTick('ambient', 0.5);
  };

  const toggleReminder = (id: string) => {
    onUpdateReminders(
      reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
    audioSynth.playTick('ambient', 0.3);
  };

  const deleteReminder = (id: string) => {
    onUpdateReminders(reminders.filter((r) => r.id !== id));
    audioSynth.playTick('mechanical', 0.4);
  };

  const getThemeBadge = () => {
    switch (theme) {
      case 'emerald': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'amber': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'indigo': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
      case 'slate': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getThemeButton = () => {
    switch (theme) {
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-700 text-white';
      case 'amber': return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'indigo': return 'bg-indigo-600 hover:bg-indigo-700 text-white';
      case 'slate': return 'bg-slate-700 hover:bg-slate-800 text-white';
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-100 dark:border-neutral-800/80 shadow-xs space-y-6" id="reminders-manager-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${getThemeBadge()}`}>
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-100">Tasbeeh Schedule</h3>
            <p className="text-xs text-neutral-500">Enable reminders to maintain daily dhikr consistency</p>
          </div>
        </div>
      </div>

      {/* Permissions Notification */}
      {permissionStatus !== 'granted' && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">System Notifications Blocked/Disabled</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">Enable device notifications to receive alarm triggers when minimized.</p>
            </div>
          </div>
          <button
            onClick={requestNotificationPermission}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all text-center shrink-0 ${
              theme === 'amber' ? 'bg-amber-600 hover:bg-amber-700 text-white' : getThemeButton()
            }`}
          >
            Enable Notifications
          </button>
        </div>
      )}

      {/* Quick Add Form */}
      <form onSubmit={handleAddReminder} className="p-4 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-150 dark:border-neutral-800/40 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        <div className="sm:col-span-3">
          <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Time</label>
          <input
            type="time"
            required
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:ring-2 focus:ring-emerald-500/20 text-neutral-800 dark:text-neutral-100"
          />
        </div>

        <div className="sm:col-span-4">
          <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Title / Label</label>
          <input
            type="text"
            placeholder="e.g. Istighfar 100x"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:ring-2 focus:ring-emerald-500/20 text-neutral-800 dark:text-neutral-100"
          />
        </div>

        <div className="sm:col-span-3">
          <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Frequency</label>
          <select
            value={newFrequency}
            onChange={(e) => setNewFrequency(e.target.value as 'daily' | 'hourly')}
            className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:ring-2 focus:ring-emerald-500/20 text-neutral-850 dark:text-neutral-150"
          >
            <option value="daily">Once Daily</option>
            <option value="hourly">Every Hour</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            className={`w-full py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-1 transition-all ${getThemeButton()}`}
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </form>

      {/* Reminder Schedules List */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {reminders.length === 0 ? (
          <div className="text-center py-6 text-neutral-400 dark:text-neutral-500 text-xs">
            No reminder schedules added yet. Create one above to remind you!
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all ${
                reminder.enabled
                  ? 'bg-neutral-50/60 dark:bg-neutral-900/60 border-neutral-100 dark:border-neutral-800/80'
                  : 'bg-neutral-50/20 dark:bg-neutral-950/20 border-neutral-100/40 dark:border-neutral-900/40 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className={`w-4 h-4 ${reminder.enabled ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-300'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-neutral-800 dark:text-neutral-150 font-mono">
                      {reminder.time}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-sm ${
                      reminder.frequency === 'daily'
                        ? 'bg-neutral-200/50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                        : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400'
                    }`}>
                      {reminder.frequency}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    {reminder.label}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Switch Button */}
                <button
                  type="button"
                  onClick={() => toggleReminder(reminder.id)}
                  className={`w-10 h-6.5 rounded-full p-1 transition-colors duration-200 outline-hidden ${
                    reminder.enabled ? (theme === 'emerald' ? 'bg-emerald-600' : theme === 'amber' ? 'bg-amber-500' : theme === 'indigo' ? 'bg-indigo-600' : 'bg-slate-700') : 'bg-neutral-300 dark:bg-neutral-700'
                  } relative flex`}
                >
                  <span
                    className={`w-[18px] h-[18px] bg-white rounded-full transition-transform shadow-xs ${
                      reminder.enabled ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => deleteReminder(reminder.id)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-850/60 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
