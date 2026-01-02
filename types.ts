
export type Language = 'en' | 'ur' | 'hi' | 'ar';

export interface RoutineItem {
  id: string;
  category: 'salah_fardh' | 'salah_nawafil' | 'tilawat' | 'habits' | 'avoidance' | 'ethics';
  labelKey: string;
  isFridayOnly?: boolean;
  variant?: 'virtue' | 'vice';
}

export interface ProgressState {
  [key: string]: boolean;
}

export interface DayRecord {
  date: string;
  progress: ProgressState;
  notes: string;
  score: number;
}

export interface Translation {
  title: string;
  score_label: string;
  salah_fardh: string;
  salah_nawafil: string;
  tilawat: string;
  habits: string;
  avoidance: string;
  ethics: string;
  reset_confirm: string;
  download_report: string;
  daily: string;
  weekly: string;
  monthly: string;
  notes_label: string;
  notes_placeholder: string;
  reset_button: string;
  // Specific Items
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  tahajjud: string;
  ishraq: string;
  duha: string;
  awwabin: string;
  yaseen: string;
  mulk: string;
  sajdah: string;
  waqiah: string;
  kahf: string;
  dhikr: string;
  exercise: string;
  meditation: string;
  family: string;
  // Ethics (New Virtues)
  halal_sustenance: string;
  good_character: string;
  modesty: string;
  // Vices
  backbiting: string;
  theft: string;
  bad_nazri: string;
  lying: string;
  anger: string;
  vulgarity: string;
  major_sins: string;
  evil_thoughts: string;
  against_sunnah: string;
}

export type Translations = Record<Language, Translation>;
