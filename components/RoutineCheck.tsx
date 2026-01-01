
import React, { useState, useEffect, useMemo } from 'react';
import { Language, ProgressState, DayRecord } from '../types';
import { ROUTINE_ITEMS, TRANSLATIONS } from '../constants';
import ProgressRing from './ProgressRing';
import CheckItem from './CheckItem';

const STORAGE_KEY = 'ihsan-routine-hub-progress';
const NOTES_KEY = 'ihsan-routine-hub-notes';
const DATE_KEY = 'ihsan-routine-hub-date';
const HISTORY_KEY = 'ihsan-routine-hub-history';

const RoutineCheck: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [progress, setProgress] = useState<ProgressState>({});
  const [notes, setNotes] = useState<string>('');
  const isRtl = lang === 'ur' || lang === 'ar';
  
  const isFriday = new Date().getDay() === 5;
  const filteredItems = useMemo(() => {
    return ROUTINE_ITEMS.filter(item => !item.isFridayOnly || (item.isFridayOnly && isFriday));
  }, [isFriday]);

  const calculateScore = (currentProgress: ProgressState) => {
    const virtueItems = filteredItems.filter(item => item.variant === 'virtue');
    const viceItems = filteredItems.filter(item => item.variant === 'vice');
    
    const virtuesChecked = virtueItems.filter(item => currentProgress[item.id]).length;
    const vicesChecked = viceItems.filter(item => currentProgress[item.id]).length;
    
    const rawScore = virtuesChecked - vicesChecked;
    const totalPossible = virtueItems.length;
    
    const percentage = (rawScore / totalPossible) * 100;
    return Math.max(0, percentage); // Minimum score is 0%
  };

  const progressPercentage = useMemo(() => calculateScore(progress), [filteredItems, progress]);

  // Initialize state and history tracking
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem(DATE_KEY);
    
    if (savedDate && savedDate !== today) {
      // Save previous day to history
      const prevProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const prevNotes = localStorage.getItem(NOTES_KEY) || '';
      const history: DayRecord[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      
      const prevScore = calculateScore(prevProgress);

      history.push({ date: savedDate, progress: prevProgress, notes: prevNotes, score: prevScore });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-60)));
      
      // Reset for new day
      localStorage.setItem(DATE_KEY, today);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
      localStorage.setItem(NOTES_KEY, '');
      setProgress({});
      setNotes('');
    } else if (!savedDate) {
      localStorage.setItem(DATE_KEY, today);
    } else {
      setProgress(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'));
      setNotes(localStorage.getItem(NOTES_KEY) || '');
    }
  }, []);

  // Persistent storage hooks
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, notes);
  }, [notes]);

  const toggleItem = (id: string) => {
    setProgress(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const t = TRANSLATIONS[lang];

  const downloadData = (type: 'daily' | 'weekly' | 'monthly') => {
    const today = new Date().toISOString().split('T')[0];
    const history: DayRecord[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    let dataToExport: any = [];

    const currentDay: DayRecord = { date: today, progress, notes, score: progressPercentage };

    if (type === 'daily') {
      dataToExport = [currentDay];
    } else if (type === 'weekly') {
      dataToExport = [...history.slice(-6), currentDay];
    } else if (type === 'monthly') {
      dataToExport = [...history.slice(-29), currentDay];
    }

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Routine_Report_${type}_${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderSection = (category: string, title: string) => {
    const sectionItems = filteredItems.filter(item => item.category === category);
    if (sectionItems.length === 0) return null;

    return (
      <div className="mb-8 last:mb-0">
        <h3 className={`text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 px-1 ${isRtl ? 'text-right' : 'text-left'}`}>
          {title}
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {sectionItems.map(item => (
            <CheckItem
              key={item.id}
              id={item.id}
              label={t[item.labelKey as keyof typeof t]}
              checked={!!progress[item.id]}
              onChange={toggleItem}
              dir={isRtl ? 'rtl' : 'ltr'}
              variant={item.variant}
            />
          ))}
        </div>
      </div>
    );
  };

  const langNames: Record<Language, string> = {
    en: 'English',
    ur: 'اردو',
    hi: 'हिंदी',
    ar: 'العربية'
  };

  return (
    <div className="max-w-md mx-auto p-6 md:p-8 min-h-screen pb-20" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Language Switcher */}
      <div className="flex justify-center gap-1 mb-8 glass p-1 rounded-2xl transform-gpu overflow-x-auto">
        {(['en', 'ur', 'hi', 'ar'] as Language[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`
              flex-shrink-0 py-2 px-3 rounded-xl text-[10px] sm:text-xs font-semibold transition-all duration-200
              ${lang === l ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}
            `}
          >
            {langNames[l]}
          </button>
        ))}
      </div>

      {/* Progress Section */}
      <div className="glass rounded-[2rem] p-4 mb-8 overflow-hidden transform-gpu">
        <ProgressRing 
          radius={110} 
          stroke={10} 
          progress={progressPercentage} 
          label={t.score_label}
        />
      </div>

      {/* Content Sections */}
      <div className="space-y-4">
        {renderSection('salah_fardh', t.salah_fardh)}
        {renderSection('salah_nawafil', t.salah_nawafil)}
        {renderSection('tilawat', t.tilawat)}
        {renderSection('habits', t.habits)}
        {renderSection('avoidance', t.avoidance)}
      </div>

      {/* Manual Notes Box */}
      <div className="mt-8 mb-8 space-y-3">
        <h3 className={`text-xs font-bold uppercase tracking-widest text-slate-500 px-1 ${isRtl ? 'text-right' : 'text-left'}`}>
          {t.notes_label}
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.notes_placeholder}
          className="w-full h-32 p-4 rounded-2xl glass border border-white/5 focus:border-emerald-500/50 outline-none text-sm text-slate-200 resize-none transition-all placeholder:text-slate-600"
          dir={isRtl ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Report Download Area */}
      <div className="p-6 glass rounded-3xl text-center space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-500">{t.download_report}</h4>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map(type => (
            <button 
              key={type}
              onClick={() => downloadData(type)} 
              className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] sm:text-xs font-medium transition-colors"
            >
              {t[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Logic */}
      <div className="mt-12 flex justify-center">
        <button 
          onClick={() => {
            if(confirm(t.reset_confirm)) {
              setProgress({});
              setNotes('');
            }
          }}
          className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all text-sm font-bold uppercase tracking-widest shadow-lg shadow-red-500/5"
        >
          {t.reset_button}
        </button>
      </div>
    </div>
  );
};

export default RoutineCheck;
