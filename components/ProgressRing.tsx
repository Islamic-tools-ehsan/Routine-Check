
import React from 'react';

interface ProgressRingProps {
  radius: number;
  stroke: number;
  progress: number;
  label: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ radius, stroke, progress, label }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 transform-gpu">
      <div className="relative flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform-gpu"
        >
          {/* Background circle */}
          <circle
            stroke="rgba(255, 255, 255, 0.05)"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke="#10b981"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            className="progress-ring__circle"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-white leading-none">{Math.round(progress)}%</span>
          <span className="text-[12px] uppercase tracking-[0.2em] text-white/70 font-bold mt-2">score</span>
        </div>
      </div>
      {/* Label under the circle */}
      <p className="mt-6 text-white text-xl font-bold tracking-tight text-center">
        {label}
      </p>
    </div>
  );
};

export default ProgressRing;
