import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Volume, // Added standard Sound indicator
  Compass, // Spiritual Compass
  Sparkles,
  Award,
  Plus,
  Moon,
  Sun,
  History,
  Bell,
  Info,
  ChevronRight,
  ChevronLeft,
  X,
  Smile,
  Volume1,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Subcomponents
import BeadsViewer from './components/BeadsViewer';
import AddDhikrModal from './components/AddDhikrModal';
import RemindersManager from './components/RemindersManager';
import HistoryLogs from './components/HistoryLogs';

// Types and Predefined Data
import { DhikrTemplate, DhikrSession, DhikrLog, ReminderSetting, UserPreferences } from './types';
import { defaultDhikrs } from './utils/dhikrData';
import { audioSynth } from './utils/audio';

export default function App() {
  // --- STATE ---
  const [dhikrs, setDhikrs] = useState<DhikrTemplate[]>(() => {
    const saved = localStorage.getItem('tasbeeh_dhikrs');
    return saved ? JSON.parse(saved) : defaultDhikrs;
  });

  const [activeDhikrId, setActiveDhikrId] = useState<string>(() => {
    const saved = localStorage.getItem('tasbeeh_active_id');
    return saved || 'subhanallah';
  });

  const activeDhikr = dhikrs.find((d) => d.id === activeDhikrId) || dhikrs[0];

  // Sessions map store counters for each dhikr
  const [sessions, setSessions] = useState<Record<string, DhikrSession>>(() => {
    const saved = localStorage.getItem('tasbeeh_sessions');
    if (saved) return JSON.parse(saved);
    
    // Initialize empty sessions for default dhikrs
    const initial: Record<string, DhikrSession> = {};
    defaultDhikrs.forEach((d) => {
      initial[d.id] = {
        templateId: d.id,
        currentCount: 0,
        targetCount: d.defaultTarget,
        completedCycles: 0,
        lastUpdatedAt: new Date().toISOString()
      };
    });
    return initial;
  });

  const currentSession: DhikrSession = sessions[activeDhikrId] || {
    templateId: activeDhikrId,
    currentCount: 0,
    targetCount: activeDhikr.defaultTarget,
    completedCycles: 0,
    lastUpdatedAt: new Date().toISOString()
  };

  const [logs, setLogs] = useState<DhikrLog[]>(() => {
    const saved = localStorage.getItem('tasbeeh_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [reminders, setReminders] = useState<ReminderSetting[]>(() => {
    const saved = localStorage.getItem('tasbeeh_reminders');
    return saved ? JSON.parse(saved) : [
      { id: '1', time: '05:30', label: 'Fajr Remembrance', enabled: true, frequency: 'daily' },
      { id: '2', time: '18:00', label: 'Evening Dhikr', enabled: true, frequency: 'daily' },
    ];
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('tasbeeh_preferences');
    return saved
      ? JSON.parse(saved)
      : {
          vibrationEnabled: true,
          soundEnabled: true,
          soundVolume: 0.5,
          soundType: 'ambient',
          theme: 'emerald',
          notificationsEnabled: true,
        };
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('tasbeeh_dark_mode');
    return saved ? JSON.parse(saved) : true;
  });

  // UI state managers
  const [activeTab, setActiveTab] = useState<'counter' | 'schedules' | 'history' | 'settings'>('counter');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showVirtueTip, setShowVirtueTip] = useState(true);
  
  // Confetti / Completion animation trigger state
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Floating numbers from tapping click
  const [floaters, setFloaters] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const floaterCounter = useRef(0);

  // Active in-app reminder trigger popup state
  const [activeTriggeredReminder, setActiveTriggeredReminder] = useState<ReminderSetting | null>(null);

  // --- LOCAL PERSISTENCE SYNC IN EFFECT ---
  useEffect(() => {
    localStorage.setItem('tasbeeh_dhikrs', JSON.stringify(dhikrs));
  }, [dhikrs]);

  useEffect(() => {
    localStorage.setItem('tasbeeh_active_id', activeDhikrId);
  }, [activeDhikrId]);

  useEffect(() => {
    localStorage.setItem('tasbeeh_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('tasbeeh_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('tasbeeh_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('tasbeeh_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('tasbeeh_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- AUTOMATED BACKGROUND CLOCK REMINDER CHECKER ---
  useEffect(() => {
    const checkClock = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${currentHours}:${currentMinutes}`;

      reminders.forEach((r) => {
        if (r.enabled && r.time === timeStr) {
          // Check to prevent multiple triggers in the same minute
          const triggerKey = `triggered_${r.id}_${now.toDateString()}_${timeStr}`;
          const isAlreadyTriggered = sessionStorage.getItem(triggerKey);

          if (!isAlreadyTriggered) {
            sessionStorage.setItem(triggerKey, 'true');
            // Trigger local Web push if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification("🕌 Remembrance Time", {
                body: `It's time for your dhikr: "${r.label}"`,
                icon: "/favicon.ico",
              });
            }
            // Fire beautiful audio notifications and in-app overlay dialog
            audioSynth.playNotificationChime();
            if (preferences.vibrationEnabled && 'vibrate' in navigator) {
              navigator.vibrate([200, 100, 200]);
            }
            setActiveTriggeredReminder(r);
          }
        }
      });
    };

    // Run every 25 seconds for precise alarm hitting
    const interval = setInterval(checkClock, 25000);
    checkClock(); // run initial
    return () => clearInterval(interval);
  }, [reminders, preferences]);

  // --- COUNTER ACTION HANDLERS ---
  const handleIncrement = () => {
    const nextCount = currentSession.currentCount + 1;
    const isCompleted = nextCount === currentSession.targetCount;

    // Haptics vibration
    if (preferences.vibrationEnabled && 'vibrate' in navigator) {
      if (isCompleted) {
        // Vibrant double haptic pulse on completing target
        navigator.vibrate([150, 80, 200]);
      } else {
        // Gentle tick on tap
        navigator.vibrate(35);
      }
    }

    // Play Synthesizer Sounds
    if (preferences.soundEnabled) {
      if (isCompleted) {
        audioSynth.playCompletionChime(preferences.soundVolume);
      } else {
        audioSynth.playTick(preferences.soundType, preferences.soundVolume);
      }
    }

    // Spawn animated floating ticker number inside circular button
    const id = floaterCounter.current++;
    const randomOffsetDir = (Math.random() - 0.5) * 50; 
    setFloaters((prev) => [
      ...prev,
      { id, x: randomOffsetDir, y: -40, text: `+${nextCount}` }
    ]);
    setTimeout(() => {
      setFloaters((prev) => prev.filter((f) => f.id !== id));
    }, 1000);

    // Update Session Count state
    setSessions((prev) => {
      const activeSession = prev[activeDhikrId] || {
        templateId: activeDhikrId,
        currentCount: 0,
        targetCount: activeDhikr.defaultTarget,
        completedCycles: 0,
        lastUpdatedAt: new Date().toISOString()
      };

      if (isCompleted) {
        // Reset count, increment cycles count, and record beautiful ledger entry logs
        const newLog: DhikrLog = {
          id: Math.random().toString(36).substr(2, 9),
          templateId: activeDhikrId,
          name: activeDhikr.name,
          count: activeSession.targetCount,
          target: activeSession.targetCount,
          completedAt: new Date().toISOString(),
        };
        
        setLogs((prevLogs) => [...prevLogs, newLog]);
        
        // Show delightful full-screen fireworks screen overlay
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3800);

        return {
          ...prev,
          [activeDhikrId]: {
            ...activeSession,
            currentCount: 0,
            completedCycles: activeSession.completedCycles + 1,
            lastUpdatedAt: new Date().toISOString(),
          },
        };
      }

      return {
        ...prev,
        [activeDhikrId]: {
          ...activeSession,
          currentCount: nextCount,
          lastUpdatedAt: new Date().toISOString(),
        },
      };
    });
  };

  const handleDecrement = () => {
    if (currentSession.currentCount === 0) return;
    setSessions((prev) => {
      const activeSession = prev[activeDhikrId];
      return {
        ...prev,
        [activeDhikrId]: {
          ...activeSession,
          currentCount: activeSession.currentCount - 1,
          lastUpdatedAt: new Date().toISOString(),
        },
      };
    });
    if (preferences.soundEnabled) audioSynth.playTick('mechanical', preferences.soundVolume * 0.7);
  };

  const handleResetSession = () => {
    if (currentSession.currentCount === 0) return;
    if (confirm("Reset current counts back to 0?")) {
      setSessions((prev) => {
        const activeSession = prev[activeDhikrId];
        return {
          ...prev,
          [activeDhikrId]: {
            ...activeSession,
            currentCount: 0,
            lastUpdatedAt: new Date().toISOString(),
          },
        };
      });
      if (preferences.soundEnabled) audioSynth.playTick('mechanical', preferences.soundVolume);
    }
  };

  const handleAdjustTarget = (newTarget: number) => {
    setSessions((prev) => {
      const activeSession = prev[activeDhikrId];
      return {
        ...prev,
        [activeDhikrId]: {
          ...activeSession,
          targetCount: newTarget,
          currentCount: activeSession.currentCount >= newTarget ? 0 : activeSession.currentCount,
          lastUpdatedAt: new Date().toISOString(),
        },
      };
    });
  };

  // --- DHIKR MANAGEMENT HANDLERS ---
  const handleAddCustomDhikr = (custom: Omit<DhikrTemplate, 'id' | 'category'>) => {
    const id = 'custom_' + Date.now();
    const newTemplate: DhikrTemplate = {
      ...custom,
      id,
      category: 'custom'
    };

    setDhikrs((prev) => [...prev, newTemplate]);
    
    // Setup corresponding empty session storage
    setSessions((prev) => ({
      ...prev,
      [id]: {
        templateId: id,
        currentCount: 0,
        targetCount: custom.defaultTarget,
        completedCycles: 0,
        lastUpdatedAt: new Date().toISOString(),
      },
    }));

    setActiveDhikrId(id);
    setIsAddModalOpen(false);
  };

  const handleDeleteCustomDhikr = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting it list-wide while clicking delete
    if (confirm("Delete this custom dhikr form?")) {
      setDhikrs((prev) => prev.filter((d) => d.id !== id));
      if (activeDhikrId === id) {
        setActiveDhikrId('subhanallah');
      }
    }
  };

  // Switch to next or previous dhikr in list (carousel action)
  const navigateDhikr = (direction: 'next' | 'prev') => {
    const currentIndex = dhikrs.findIndex((d) => d.id === activeDhikrId);
    let newIndex = 0;
    if (direction === 'next') {
      newIndex = currentIndex === dhikrs.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? dhikrs.length - 1 : currentIndex - 1;
    }
    setActiveDhikrId(dhikrs[newIndex].id);
    audioSynth.playTick('ambient', 0.4);
  };

  // --- STYLING ACCENTS GETTER ----
  const getThemeColors = () => {
    switch (preferences.theme) {
      case 'emerald':
        return {
          primary: 'text-elegant-accent dark:text-elegant-accent',
          bgPrimary: 'bg-elegant-accent',
          bgSecondary: 'bg-elegant-panel dark:bg-elegant-panel text-elegant-text dark:text-elegant-text',
          borderAccent: 'border-white/10 dark:border-white/10',
          ringAccent: 'focus:ring-elegant-accent/20',
          badgeText: 'text-elegant-accent dark:text-emerald-300 bg-elegant-accent/15 dark:bg-elegant-accent/20',
          gradientBg: 'from-elegant-accent to-emerald-900',
          solidBtn: 'bg-elegant-accent hover:bg-emerald-800 text-white',
          tabActive: 'text-white bg-elegant-accent',
        };
      case 'amber':
        return {
          primary: 'text-amber-500 dark:text-amber-400',
          bgPrimary: 'bg-amber-500',
          bgSecondary: 'bg-elegant-panel text-amber-100',
          borderAccent: 'border-white/15',
          ringAccent: 'focus:ring-amber-500/20',
          badgeText: 'text-amber-300 bg-amber-900/30',
          gradientBg: 'from-amber-600 to-amber-900',
          solidBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
          tabActive: 'text-white bg-amber-600',
        };
      case 'indigo':
        return {
          primary: 'text-indigo-400 dark:text-indigo-450',
          bgPrimary: 'bg-indigo-650',
          bgSecondary: 'bg-elegant-panel text-indigo-100',
          borderAccent: 'border-white/15',
          ringAccent: 'focus:ring-indigo-500/20',
          badgeText: 'text-indigo-300 bg-indigo-900/30',
          gradientBg: 'from-indigo-600 to-blue-900',
          solidBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
          tabActive: 'text-white bg-indigo-650',
        };
      case 'slate':
      default:
        return {
          primary: 'text-elegant-muted dark:text-white',
          bgPrimary: 'bg-elegant-panel',
          bgSecondary: 'bg-elegant-sidebar text-elegant-text',
          borderAccent: 'border-white/10',
          ringAccent: 'focus:ring-white/20',
          badgeText: 'text-white bg-white/10',
          gradientBg: 'from-zinc-800 to-black',
          solidBtn: 'bg-neutral-800 hover:bg-neutral-700 text-white',
          tabActive: 'text-white bg-neutral-805',
        };
    }
  };

  const themeColors = getThemeColors();

  // Progress percentage logic
  const progressRatio = Math.min(1, currentSession.currentCount / currentSession.targetCount);
  const strokeDashoffset = 282.6 - progressRatio * 282.6; // radius=45 -> circ=2*pi*45=282.74

  return (
    <div className="min-h-screen bg-elegant-bg text-elegant-text font-sans transition-colors duration-200 flex flex-col justify-between" id="app-root-container">
      
      {/* --- IN-APP ALARM DIALOG OVERLAY --- */}
      <AnimatePresence>
        {activeTriggeredReminder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-805 rounded-3xl p-6 shadow-2xl text-center space-y-5"
            >
              <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center ${themeColors.bgSecondary} animate-bounce`}>
                <Bell className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase font-extrabold tracking-widest text-neutral-400">🕌 Daily Remembrance Alert</p>
                <h3 className="text-xl font-bold">{activeTriggeredReminder.label}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Take a few calm moments right now to nourish your soul with dhikr.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    // Try to load any corresponding dhikr templates if label matches standard types
                    const normalizedLabel = activeTriggeredReminder.label.toLowerCase();
                    let bestMatch = 'subhanallah';
                    if (normalizedLabel.includes('alhamd') || normalizedLabel.includes('praise')) bestMatch = 'alhamdulillah';
                    else if (normalizedLabel.includes('akbar') || normalizedLabel.includes('great')) bestMatch = 'allahuakbar';
                    else if (normalizedLabel.includes('istig') || normalizedLabel.includes('forgiv')) bestMatch = 'astaghfirullah';
                    else if (normalizedLabel.includes('lah') || normalizedLabel.includes('illal')) bestMatch = 'lailahaillallah';
                    else if (normalizedLabel.includes('sala') || normalizedLabel.includes('bless')) bestMatch = 'salawat';

                    setActiveDhikrId(bestMatch);
                    setActiveTab('counter');
                    setActiveTriggeredReminder(null);
                    audioSynth.playTick('peaceful', preferences.soundVolume);
                  }}
                  className={`w-full py-3 rounded-xl font-bold shadow-md transition-all ${themeColors.solidBtn}`}
                >
                  Start Remembrance Session
                </button>
                <button
                  onClick={() => {
                    setActiveTriggeredReminder(null);
                    audioSynth.playTick('mechanical', 0.4);
                  }}
                  className="w-full py-2.5 text-xs font-semibold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                >
                  Dismiss gently
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SPARKLING CELEBRATION CONGRATULATIONS PANEL --- */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs flex items-center justify-center pointer-events-none"
          >
            <div className="text-center space-y-1 bg-white/95 dark:bg-neutral-900/95 border border-emerald-100 dark:border-emerald-950 p-6 rounded-3xl shadow-xl max-w-xs animate-popup-bounce">
              <span className="text-3xl">🎉</span>
              <h4 className="text-base font-bold text-neutral-800 dark:text-neutral-100">Tasbeeh Cycle Complete!</h4>
              <p className="text-[11px] text-neutral-400 italic">"Verily, in the remembrance of Allah do hearts find rest."</p>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">Recorded: +{currentSession.targetCount} count added</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <nav className="border-b border-neutral-150/60 dark:border-neutral-850 px-4 py-3 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between" id="app-nav-bar">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl text-white ${themeColors.bgPrimary} shadow-xs`}>
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <span className="text-sm font-extrabold tracking-tight dark:text-neutral-200 uppercase flex items-center gap-1.5">
              Tasbeeh App <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-semibold font-mono tracking-normal lowercase border border-neutral-200/50 dark:border-neutral-700">android mode</span>
            </span>
            <span className="text-[10px] block text-neutral-400 dark:text-neutral-500 -mt-0.5">Your peaceful dhikr partner</span>
          </div>
        </div>

        {/* Global Action settings */}
        <div className="flex items-center gap-2">
          {/* Quick Sound Toggle */}
          <button
            onClick={() => {
              setPreferences((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }));
              audioSynth.playTick('ambient', 0.5);
            }}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
            title="Toggle click sound"
          >
            {preferences.soundEnabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
          </button>

          {/* Light/Dark Toggle */}
          <button
            onClick={() => {
              setDarkMode(!darkMode);
              audioSynth.playTick('ambient', 0.4);
            }}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
            title="Toggle Night Theme"
          >
            {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        </div>
      </nav>

      {/* --- MAIN PAGE CONTENT CONTAINER --- */}
      <main className="w-full max-w-lg mx-auto p-4 flex-1 flex flex-col justify-start space-y-5" id="main-content-layout">

        {/* --- VIEW SWITCHER TABS --- */}
        <div className="bg-neutral-100 dark:bg-neutral-950 p-1 rounded-2xl border border-neutral-150/40 dark:border-neutral-800/40 grid grid-cols-4 gap-1 text-center" id="tab-switcher-grid">
          <button
            onClick={() => { setActiveTab('counter'); audioSynth.playTick('ambient', 0.3); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'counter' ? themeColors.tabActive : 'text-neutral-450 hover:text-neutral-800 dark:hover:text-neutral-200'}`}
          >
            Counter
          </button>
          <button
            onClick={() => { setActiveTab('schedules'); audioSynth.playTick('ambient', 0.3); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'schedules' ? themeColors.tabActive : 'text-neutral-450 hover:text-neutral-800 dark:hover:text-neutral-200'}`}
          >
            Alarms
          </button>
          <button
            onClick={() => { setActiveTab('history'); audioSynth.playTick('ambient', 0.3); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'history' ? themeColors.tabActive : 'text-neutral-450 hover:text-neutral-800 dark:hover:text-neutral-200'}`}
          >
            History
          </button>
          <button
            onClick={() => { setActiveTab('settings'); audioSynth.playTick('ambient', 0.3); }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'settings' ? themeColors.tabActive : 'text-neutral-450 hover:text-neutral-800 dark:hover:text-neutral-200'}`}
          >
            Settings
          </button>
        </div>

        {/* --- TAB VIEW 1: COUNTER LAYOUT --- */}
        {activeTab === 'counter' && (
          <div className="space-y-4" id="view-counter-main">
            
            {/* Active Dhikr Card Selector Widget */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-100 dark:border-neutral-800/80 shadow-xs flex flex-col items-center relative overflow-hidden" id="dhikr-selector-card">
              
              {/* Left/Right carousel switcher beads */}
              <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
                <button
                  onClick={() => navigateDhikr('prev')}
                  className="p-1 px-1.5 rounded-full pointer-events-auto bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-150 border border-neutral-200/50 dark:border-neutral-700 active:scale-90 transition-all shadow-2xs"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigateDhikr('next')}
                  className="p-1 px-1.5 rounded-full pointer-events-auto bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-150 border border-neutral-200/50 dark:border-neutral-700 active:scale-90 transition-all shadow-2xs"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Text info and translation display */}
              <div className="text-center space-y-1.5 w-full px-8 relative" id="dhikr-text-labels">
                <span className={`text-[10px] font-extrabold tracking-widest uppercase block ${themeColors.primary}`}>
                  {activeDhikr.category === 'custom' ? 'Custom Dhikr' : 'Prescribed Dhikr'}
                </span>

                <motion.div
                  key={activeDhikr.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1"
                >
                  {/* Huge elegant Arabic script typography */}
                  <h1 className="text-2xl md:text-3xl font-bold dark:text-white font-serif tracking-wide py-1 text-center" dir="rtl">
                    {activeDhikr.arabic}
                  </h1>
                  <h2 className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
                    {activeDhikr.name}
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 italic">
                    "{activeDhikr.translation}"
                  </p>
                </motion.div>
              </div>

              {/* Toggle-able Virtue / Benefit box */}
              {activeDhikr.benefit && (
                <div className="mt-4 w-full">
                  {showVirtueTip ? (
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-150/40 dark:border-neutral-800/40 rounded-2xl flex gap-2.5 shadow-2xs relative">
                      <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${themeColors.primary}`} />
                      <div>
                        <span className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-505 uppercase">Spiritual Promise</span>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
                          {activeDhikr.benefit}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowVirtueTip(false)}
                        className="p-0.5 absolute top-2 right-2 rounded-full hover:bg-neutral-150/50 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                        title="Hide advice"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowVirtueTip(true)}
                      className="text-[10px] font-bold text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 flex items-center gap-1.5 mx-auto py-1 transition-colors justify-center"
                    >
                      <Info className="w-3.5 h-3.5" /> Show virtues & blessings of this dhikr
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* --- CORE CIRCULAR TAP COUNTER BUTTON CONTAINER --- */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-100 dark:border-neutral-800/80 shadow-xs flex flex-col items-center space-y-5 relative" id="counter-circular-engine-card">
              
              <div className="relative flex items-center justify-center pt-2">
                
                {/* Embedded feedback indicators */}
                <span className="absolute -top-1 font-mono text-[10px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                  Target: {currentSession.targetCount}
                </span>

                {/* SVG Progress Circle behind Counter Button */}
                <svg className="w-68 h-68 transform -rotate-90 select-none pointer-events-none z-10">
                  {/* Background Track */}
                  <circle
                    cx="136"
                    cy="136"
                    r="54"
                    className="stroke-neutral-100 dark:stroke-neutral-800/40"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  {/* Colored Active Fill */}
                  <motion.circle
                    cx="136"
                    cy="136"
                    r="54"
                    className={themeColors.primary}
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray="339.3" // 2*pi*54
                    animate={{ strokeDashoffset: 339.3 - progressRatio * 339.3 }}
                    transition={{ type: 'spring', stiffness: 90, damping: 15 }}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Main Tap Target */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleIncrement}
                  className="absolute w-52 h-52 bg-linear-to-b from-neutral-50 to-neutral-100 dark:from-neutral-850 dark:to-neutral-900 rounded-full border border-neutral-150 dark:border-neutral-800 flex flex-col items-center justify-center select-none active:shadow-inner cursor-pointer"
                  id="main-clicker-trigger"
                  style={{
                    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.8), 0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.06)'
                  }}
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-0.5">
                    Tap to Recite
                  </span>
                  
                  {/* Huge active Digital counter */}
                  <motion.span 
                    key={currentSession.currentCount}
                    initial={{ scale: 0.9, opacity: 0.7 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-5xl font-extrabold tracking-tighter text-neutral-850 dark:text-neutral-50 font-mono leading-none my-1"
                  >
                    {currentSession.currentCount}
                  </motion.span>
                  
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full mt-1 border ${themeColors.badgeText} border-neutral-100/50`}>
                    Round {currentSession.completedCycles + 1}
                  </span>

                  {/* Absolute Floaters Canvas container for increment tracking animation */}
                  <div className="absolute inset-x-0 bottom-4 pointer-events-none flex justify-center">
                    <AnimatePresence>
                      {floaters.map((f) => (
                        <motion.span
                          key={f.id}
                          initial={{ opacity: 1, y: 0, scale: 0.9 }}
                          animate={{ opacity: 0, y: f.y, x: f.x, scale: 1.2 }}
                          exit={{ opacity: 0 }}
                          className={`absolute font-bold text-sm tracking-tight font-mono ${themeColors.primary}`}
                        >
                          {f.text}
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.button>
              </div>

              {/* Sub-counter functional options bottom row */}
              <div className="w-full flex justify-between items-center px-2 pt-2 border-t border-neutral-100/60 dark:border-neutral-800/40" id="counter-adjusters-row">
                
                {/* Decrement back button */}
                <button
                  type="button"
                  disabled={currentSession.currentCount === 0}
                  onClick={handleDecrement}
                  className="p-2 rounded-2xl border border-neutral-150/65 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 active:scale-95 transition-all text-xs flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none"
                  id="decrease-one-count"
                  title="Correct Mistaken Count (-1)"
                >
                  <span className="font-mono font-bold text-sm px-1">-1</span>
                </button>

                {/* Quick Target Modifier slider or list */}
                <div className="flex bg-neutral-100 dark:bg-neutral-950 p-1.5 rounded-2xl gap-1">
                  {[33, 99, 100].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { handleAdjustTarget(t); audioSynth.playTick('ambient', 0.4); }}
                      className={`px-3 py-1 font-mono text-xs font-bold rounded-xl transition-all ${
                        currentSession.targetCount === t
                          ? `${themeColors.bgPrimary} text-white shadow-2xs`
                          : 'text-neutral-550 dark:text-neutral-450 hover:bg-neutral-200/55 dark:hover:bg-neutral-800/50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const ans = prompt("Enter customized loop target count (e.g. 50, 1000):", String(currentSession.targetCount));
                      if (ans) {
                        const val = parseInt(ans, 10);
                        if (!isNaN(val) && val > 0) {
                          handleAdjustTarget(val);
                        }
                      }
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                      ![33, 99, 100].includes(currentSession.targetCount)
                        ? `${themeColors.bgPrimary} text-white shadow-2xs`
                        : 'text-neutral-550 dark:text-neutral-450 hover:bg-neutral-200/55 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    Set N
                  </button>
                </div>

                {/* Reset count button */}
                <button
                  type="button"
                  onClick={handleResetSession}
                  className="p-2 px-2.5 rounded-2xl border border-neutral-150/65 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 active:scale-95 transition-all flex items-center justify-center"
                  id="reset-current-session"
                  title="Reset Counter"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* --- TACILE PROGRESSIVE ROTATING BEADS STRIP WIDGET --- */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-4 border border-neutral-100 dark:border-neutral-800/80 shadow-xs space-y-2" id="tactile-bead-string-container">
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Tactile Scrollable Bead String</span>
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 font-mono">Loop: {currentSession.currentCount % currentSession.targetCount} / {currentSession.targetCount}</span>
              </div>
              
              <BeadsViewer
                currentCount={currentSession.currentCount}
                targetCount={currentSession.targetCount}
                theme={preferences.theme}
              />
            </div>

            {/* --- INTEGRATED DHIKR QUICK LIST SELECTOR --- */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 border border-neutral-100 dark:border-neutral-800/80 shadow-xs space-y-3" id="dhikr-quick-palette">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 text-sm">Select Remembrance Litany</h3>
                  <p className="text-[10px] text-neutral-500">Tap to instantly switch daily recitals</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className={`p-1 px-2 text-xs font-bold rounded-lg border flex items-center gap-1 transition-all ${themeColors.badgeText}`}
                  id="create-custom-template-button"
                >
                  <Plus className="w-3.5 h-3.5" /> Add custom
                </button>
              </div>

              {/* Grid selectors */}
              <div className="grid grid-cols-1 select-none divide-y divide-neutral-100/60 dark:divide-neutral-800/60">
                {dhikrs.map((dhikr) => {
                  const isActive = dhikr.id === activeDhikrId;
                  const itemSession = sessions[dhikr.id] || { currentCount: 0, targetCount: dhikr.defaultTarget, completedCycles: 0 };
                  
                  return (
                    <div
                      key={dhikr.id}
                      onClick={() => {
                        setActiveDhikrId(dhikr.id);
                        audioSynth.playTick('ambient', 0.5);
                        setShowVirtueTip(true);
                      }}
                      className={`py-3.5 flex items-center justify-between cursor-pointer transition-all ${
                        isActive ? 'bg-neutral-50/80 dark:bg-neutral-950/40 px-3 -mx-3 rounded-2xl font-semibold' : 'hover:bg-neutral-50/40 dark:hover:bg-neutral-950/20'
                      }`}
                    >
                      <div className="space-y-0.5 flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold truncate ${isActive ? themeColors.primary : 'text-neutral-800 dark:text-neutral-200'}`}>
                            {dhikr.name}
                          </span>
                          
                          {/* Arabic script accent small */}
                          <p className="text-xs text-neutral-400 dark:text-neutral-550 mr-auto truncate font-serif" dir="rtl">
                            {dhikr.arabic}
                          </p>
                        </div>
                        <p className="text-[11px] text-neutral-550 dark:text-neutral-450 truncate">
                          {dhikr.translation}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="block text-11px font-bold text-neutral-700 dark:text-neutral-300 font-mono">
                            {itemSession.currentCount} / {itemSession.targetCount}
                          </span>
                          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block block">
                            {itemSession.completedCycles} rounds done
                          </span>
                        </div>

                        {/* Custom Template Delete */}
                        {dhikr.category === 'custom' && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomDhikr(dhikr.id, e)}
                            className="p-1 px-1.5 rounded-lg text-neutral-350 hover:text-red-500 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title="Delete custom recital"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB VIEW 2: ALARM SCHEDULES LAYOUT --- */}
        {activeTab === 'schedules' && (
          <RemindersManager
            reminders={reminders}
            onUpdateReminders={setReminders}
            theme={preferences.theme}
          />
        )}

        {/* --- TAB VIEW 3: HISTORICAL LOGS LAYOUT --- */}
        {activeTab === 'history' && (
          <HistoryLogs
            logs={logs}
            onClearLogs={() => setLogs([])}
            theme={preferences.theme}
          />
        )}

        {/* --- TAB VIEW 4: SYSTEM PREFERENCES & SETTINGS LAYOUT --- */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-neutral-100 dark:border-neutral-800/80 shadow-xs space-y-6 animate-fade-in" id="settings-view-card">
            
            <div className="space-y-1">
              <h3 className="font-bold text-neutral-800 dark:text-neutral-100">Android App System Configuration</h3>
              <p className="text-xs text-neutral-500">Fine-tune clicks, haptics, themes, and audio profiles</p>
            </div>

            {/* ACCENT COLOR SETTERS */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-neutral-405 dark:text-neutral-400 uppercase tracking-wide">
                Custom Android Color Theme (Material You)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-600 border-emerald-500', hover: 'bg-emerald-50 text-emerald-700' },
                  { id: 'amber', label: 'Bronze', bg: 'bg-amber-500 border-amber-400', hover: 'bg-amber-50 text-amber-700' },
                  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-650 border-indigo-500', hover: 'bg-indigo-50 text-indigo-700' },
                  { id: 'slate', label: 'Dark Slate', bg: 'bg-slate-700 border-slate-600', hover: 'bg-slate-50 text-slate-700' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      setPreferences((prev) => ({ ...prev, theme: th.id as any }));
                      audioSynth.playTick('ambient', 0.5);
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all outline-hidden cursor-pointer ${
                      preferences.theme === th.id
                        ? 'border-neutral-400 bg-neutral-50/80 dark:bg-neutral-950 dark:border-neutral-700 ring-2 ring-neutral-200 dark:ring-neutral-800'
                        : 'border-neutral-150 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850/60'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${th.bg}`} />
                    <span className="text-[10px] font-bold">{th.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SOUND AUDIO SYNTH SELECTION */}
            <div className="space-y-3 pt-3 border-t border-neutral-100/60 dark:border-neutral-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-neutral-405 uppercase tracking-wide">
                    Audio Sound Volume
                  </label>
                  <p className="text-[10px] text-neutral-450">Tweak counting sound volume</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold">{Math.round(preferences.soundVolume * 100)}%</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Volume className="w-4.5 h-4.5 text-neutral-405" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={preferences.soundVolume}
                  onChange={(e) => {
                    const vol = parseFloat(e.target.value);
                    setPreferences((prev) => ({ ...prev, soundVolume: vol }));
                    audioSynth.playTick(preferences.soundType, vol);
                  }}
                  className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <label className="block text-xs font-bold text-neutral-405 dark:text-neutral-400 uppercase tracking-wide mt-2">
                Audio Preset Profile
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'mechanical', title: 'Mechanical', desc: 'Clicker machine' },
                  { id: 'ambient', title: 'Tactile Log', desc: 'Wooden stick' },
                  { id: 'peaceful', title: 'Soft Chime', desc: 'Water droplet' },
                ].map((snd) => (
                  <button
                    key={snd.id}
                    onClick={() => {
                      setPreferences((prev) => ({ ...prev, soundType: snd.id as any }));
                      audioSynth.playTick(snd.id as any, preferences.soundVolume);
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all outline-hidden cursor-pointer ${
                      preferences.soundType === snd.id
                        ? 'border-neutral-400 bg-neutral-50/80 dark:bg-neutral-950 dark:border-neutral-700 ring-2 ring-neutral-200 dark:ring-neutral-800'
                        : 'border-neutral-150 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850/60'
                    }`}
                  >
                    <span className="text-xs font-bold">{snd.title}</span>
                    <span className="text-[9px] text-neutral-450">{snd.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* GENERAL TOGGLES ROW */}
            <div className="space-y-3 pt-3 border-t border-neutral-100/60 dark:border-neutral-800/40">
              <label className="block text-xs font-bold text-neutral-405 dark:text-neutral-400 uppercase tracking-wide">
                Haptic Feedbacks and Vibration
              </label>
              
              <div className="flex items-center justify-between p-3.5 bg-neutral-50 dark:bg-neutral-950/60 rounded-2xl border border-neutral-150/40 dark:border-neutral-800/40">
                <div>
                  <span className="block text-xs font-bold">Vibration On Tap</span>
                  <span className="text-[10px] text-neutral-500 block">Deliver tactile clicks on Android tap inputs</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const vib = !preferences.vibrationEnabled;
                    setPreferences((prev) => ({ ...prev, vibrationEnabled: vib }));
                    if (vib && 'vibrate' in navigator) {
                      navigator.vibrate(50);
                    }
                  }}
                  className={`w-10 h-6.5 rounded-full p-1 transition-colors duration-200 outline-hidden ${
                    preferences.vibrationEnabled ? themeColors.bgPrimary : 'bg-neutral-200 dark:bg-neutral-800'
                  } relative flex`}
                >
                  <span
                    className={`w-[18px] h-[18px] bg-white rounded-full transition-transform shadow-xs ${
                      preferences.vibrationEnabled ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* MANUAL HOW TO USE */}
            <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-950 rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                <BookOpen className="w-4 h-4 shrink-0" />
                <h4 className="text-xs font-extrabold uppercase tracking-wide">Help & Remembrance Etiquettes</h4>
              </div>
              <ul className="text-[11px] text-neutral-600 dark:text-neutral-450 list-disc list-inside space-y-1">
                <li>Choose your daily dhikr template through the carousel navigation or palette.</li>
                <li>Tap anywhere on the circular target in Counter page to increment current tasbeeh.</li>
                <li>Continuous counting automatically registers finished sets into history.</li>
                <li>Set customizable daily or interval schedule alarms to avoid losing consistency.</li>
              </ul>
            </div>
          </div>
        )}

      </main>

      {/* --- ADD CUSTOM DHIKR TEMPLATE OVERLAY DIALOG --- */}
      <AddDhikrModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCustomDhikr}
        theme={preferences.theme}
      />

      {/* --- REVERENT SPIRTUAL FOOTER NOTE --- */}
      <footer className="text-center py-4 text-[10px] text-neutral-400 dark:text-neutral-500 space-y-0.5 border-t border-neutral-150/40 dark:border-neutral-850/40 bg-white/40 dark:bg-neutral-950/30">
        <p className="font-medium">"Verily, in the remembrance of Allah do hearts find rest." (Ar-Ra'd 13:28)</p>
        <p className="opacity-70">Tasbeeh App • Android mode optimized • Craftsmanship Edition • Local time 2026</p>
      </footer>
    </div>
  );
}
