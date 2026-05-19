import { DhikrTemplate } from '../types';

export const defaultDhikrs: DhikrTemplate[] = [
  {
    id: 'subhanallah',
    name: 'SubhanAllah',
    arabic: 'سُبْحَانَ ٱللَّٰهِ',
    translation: 'Glory be to Allah',
    defaultTarget: 33,
    category: 'daily',
    benefit: 'Wipes away minor sins and builds custom palaces in Jannah. One of the two words light on the tongue but heavy on the scale.'
  },
  {
    id: 'alhamdulillah',
    name: 'Alhamdulillah',
    arabic: 'ٱلْحَمْدُ لِلَّٰهِ',
    translation: 'All praise is due to Allah',
    defaultTarget: 33,
    category: 'daily',
    benefit: 'Fills the scale of good deeds. Expresses ultimate gratitude, which Quran promises will increase your blessings.'
  },
  {
    id: 'allahuakbar',
    name: 'Allahu Akbar',
    arabic: 'ٱللَّٰهُ أَكْبَرُ',
    translation: 'Allah is the Greatest',
    defaultTarget: 34,
    category: 'daily',
    benefit: 'Magnifies the glory of Allah, humbles our perspective of obstacles daily, and perfects faith.'
  },
  {
    id: 'astaghfirullah',
    name: 'Astaghfirullah',
    arabic: 'أَسْتَغْفِرُ ٱللَّٰهَ',
    translation: 'I seek forgiveness from Allah',
    defaultTarget: 100,
    category: 'daily',
    benefit: 'Opens doors of sustenance (Rizq), relieves anxiety, removes distress, and invites divine mercy and rain.'
  },
  {
    id: 'lailahaillallah',
    name: 'La Ilaha Illallah',
    arabic: 'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',
    translation: 'There is no deity but Allah',
    defaultTarget: 100,
    category: 'general',
    benefit: 'The best form of remembrance (Dhikr) and the key to Paradise. Rejuvenates faith in the oneness of Allah.'
  },
  {
    id: 'salawat',
    name: 'Salawat ala Nabi',
    arabic: 'ٱللَّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
    translation: 'O Allah, send blessings upon Muhammad',
    defaultTarget: 100,
    category: 'morning_evening',
    benefit: 'Allah sends 10 blessings upon you for every salawat. Relieves concerns, fulfills needs, and draws you closer to the Prophet.'
  },
  {
    id: 'hawqalah',
    name: 'La Hawla wa la Quwwata illa Billah',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ',
    translation: 'There is no power nor strength except with Allah',
    defaultTarget: 100,
    category: 'general',
    benefit: 'A precious treasure from the treasures of Paradise (Jannah). A powerful cure for feeling overwhelmed or helpless.'
  },
  {
    id: 'subhanallah_bihamdihi',
    name: 'SubhanAllahi wa biHamdihi',
    arabic: 'سُبْحَانَ ٱللَّٰهِ وَبِحَمْدِهِ',
    translation: 'Glory be to Allah and Praise be to Him',
    defaultTarget: 100,
    category: 'morning_evening',
    benefit: 'Recited 100 times daily, it forgives all of a person\'s sins, even if they are as abundant as the foam of the sea.'
  }
];
