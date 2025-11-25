import React from 'react';
import GameSession from './components/GameSession';

const App: React.FC = () => {
  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-0 md:p-6">
      <div className="w-full h-full md:h-[800px] max-w-2xl shadow-none md:shadow-2xl rounded-none md:rounded-3xl overflow-hidden">
        <GameSession />
      </div>
    </div>
  );
};

export default App;