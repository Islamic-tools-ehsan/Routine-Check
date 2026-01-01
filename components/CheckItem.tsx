
import React from 'react';

interface CheckItemProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (id: string) => void;
  dir: 'ltr' | 'rtl';
  variant?: 'virtue' | 'vice';
}

const CheckItem: React.FC<CheckItemProps> = ({ id, label, checked, onChange, dir, variant = 'virtue' }) => {
  const isVice = variant === 'vice';
  
  const activeBg = isVice ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30';
  const activeText = isVice ? 'text-red-400' : 'text-emerald-400';
  const boxActive = isVice ? 'bg-red-500 border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]' : 'bg-emerald-500 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]';

  return (
    <label 
      className={`
        flex items-center justify-between p-4 rounded-xl cursor-pointer 
        transition-all duration-200 transform-gpu select-none min-h-[64px]
        ${checked ? `${activeBg} border` : 'bg-white/5 border border-white/5 hover:bg-white/10'}
      `}
      onClick={() => onChange(id)}
    >
      <span className={`text-xl font-bold tracking-tight ${checked ? `${activeText}` : 'text-slate-200'}`}>
        {label}
      </span>
      <div 
        className={`
          w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0
          ${checked ? boxActive : 'border-white/20 bg-transparent'}
        `}
      >
        {checked && (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            {isVice ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            )}
          </svg>
        )}
      </div>
    </label>
  );
};

export default CheckItem;
