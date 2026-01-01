
import React from 'react';
import RoutineCheck from './components/RoutineCheck';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 antialiased selection:bg-emerald-500/30">
      {/* Simple background decorative elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <main className="relative z-10">
        <RoutineCheck />
      </main>
    </div>
  );
};

export default App;
