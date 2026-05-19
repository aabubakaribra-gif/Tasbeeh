export interface DhikrTemplate {
  id: string;
  name: string; // e.g. SubhanAllah
  arabic: string; // e.g. سُبْحَانَ ٱللَّٰهِ
  translation: string; // e.g. Glory be to Allah
  defaultTarget: number; // e.g. 33, 100
  category: 'daily' | 'general' | 'morning_evening' | 'custom';
  benefit?: string; // Virtue of the Dhikr
}

export interface DhikrSession {
  templateId: string;
  currentCount: number;
  targetCount: number;
  completedCycles: number;
  lastUpdatedAt: string;
}

export interface DhikrLog {
  id: string;
  templateId: string;
  name: string;
  count: number;
  target: number;
  completedAt: string;
}

export interface ReminderSetting {
  id: string;
  time: string; // "HH:MM"
  label: string;
  enabled: boolean;
  frequency: 'daily' | 'hourly' | 'interval';
  intervalMinutes?: number;
  lastTriggered?: string;
}

export interface UserPreferences {
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  soundType: 'mechanical' | 'ambient' | 'peaceful';
  theme: 'emerald' | 'amber' | 'indigo' | 'slate';
  notificationsEnabled: boolean;
}
