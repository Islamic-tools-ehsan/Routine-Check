
import React, { useState, useEffect, useMemo } from 'react';
import { Language, ProgressState, DayRecord } from '../types';
import { ROUTINE_ITEMS, TRANSLATIONS } from '../constants';
import ProgressRing from './ProgressRing';
import CheckItem from './CheckItem';

const STORAGE_KEY = 'routine-hub-progress-v2';
const NOTES_KEY = 'routine-hub-notes-v2';
const DATE_KEY = 'routine-hub-date-v2';
const HISTORY_KEY = 'routine-hub-history-v2';

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
    
    // Each bad deed checked subtracts from the score
    const rawScore = virtuesChecked - vicesChecked;
    const totalPossible = virtueItems.length;
    
    const percentage = (rawScore / totalPossible) * 100;
    return Math.max(0, percentage); // Floor at 0%
  };

  const progressPercentage = useMemo(() => calculateScore(progress), [filteredItems, progress]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem(DATE_KEY);
    
    if (savedDate && savedDate !== today) {
      const prevProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const prevNotes = localStorage.getItem(NOTES_KEY) || '';
      const history: DayRecord[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      
      const prevScore = calculateScore(prevProgress);

      history.push({ date: savedDate, progress: prevProgress, notes: prevNotes, score: prevScore });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-60)));
      
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, notes);
  }, [notes]);

  const toggleItem = (id: string) => {
    setProgress(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const t = TRANSLATIONS[lang];

  const downloadData = (type: 'daily' | 'weekly' | 'monthly') => {
    const today = new Date().toISOString().split('T')[0];
    const history: DayRecord[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const currentDay: DayRecord = { date: today, progress, notes, score: progressPercentage };
    
    let dataToExport: DayRecord[] = [];
    if (type === 'daily') dataToExport = [currentDay];
    else if (type === 'weekly') dataToExport = [...history.slice(-6), currentDay];
    else if (type === 'monthly') dataToExport = [...history.slice(-29), currentDay];

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
        <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 px-1 ${isRtl ? 'text-right' : 'text-left'}`}>
          {title}
        </h3>
        <div className="grid grid-cols-1 gap-3">
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
    <div className="max-w-md mx-auto p-6 md:p-8 min-h-screen pb-24" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Language Switcher */}
      <div className="flex justify-center gap-1 mb-10 glass p-1.5 rounded-2xl transform-gpu">
        {(['en', 'ur', 'hi', 'ar'] as Language[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`
              flex-1 py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300
              ${lang === l ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]' : 'text-slate-500 hover:text-white hover:bg-white/5'}
            `}
          >
            {langNames[l]}
          </button>
        ))}
      </div>

      {/* Score Section */}
      <div className="glass rounded-[2.5rem] p-4 mb-10 shadow-2xl shadow-black/20">
        <ProgressRing 
          radius={110} 
          stroke={12} 
          progress={progressPercentage} 
          label={t.score_label}
        />
      </div>

      {/* Routine Sections */}
      <div className="space-y-6">
        {renderSection('salah_fardh', t.salah_fardh)}
        {renderSection('salah_nawafil', t.salah_nawafil)}
        {renderSection('tilawat', t.tilawat)}
        {renderSection('habits', t.habits)}
        {renderSection('avoidance', t.avoidance)}
      </div>

      {/* Manual Reflections */}
      <div className="mt-10 mb-10 space-y-4">
        <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 px-1 ${isRtl ? 'text-right' : 'text-left'}`}>
          {t.notes_label}
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t.notes_placeholder}
          className="w-full h-40 p-5 rounded-3xl glass border border-white/5 focus:border-emerald-500/40 outline-none text-base text-slate-200 resize-none transition-all placeholder:text-slate-700 shadow-inner"
          dir={isRtl ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Download Section */}
      <div className="p-8 glass rounded-[2.5rem] text-center space-y-5 border-emerald-500/10">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">{t.download_report}</h4>
        <div className="flex gap-3">
          {(['daily', 'weekly', 'monthly'] as const).map(type => (
            <button 
              key={type}
              onClick={() => downloadData(type)} 
              className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95"
            >
              {t[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-12 flex justify-center">
        <button 
          onClick={() => {
            if(confirm(t.reset_confirm)) {
              setProgress({});
              setNotes('');
            }
          }}
          className="w-full py-5 rounded-3xl bg-red-500/5 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-red-500/5"
        >
          {t.reset_button}
        </button>
      </div>
    </div>
  );
};

export default RoutineCheck;
