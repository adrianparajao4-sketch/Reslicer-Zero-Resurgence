import React from 'react';
import { GameMode, GameStatus } from '../types/game';

interface TopNavProps {
  status: GameStatus;
  mode: GameMode;
  onSelectMission: () => void;
  onSelectBossRush: () => void;
  onOpenElves: () => void;
  onOpenControls: () => void;
  onRestart: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  status,
  mode,
  onSelectMission,
  onSelectBossRush,
  onOpenElves,
  onOpenControls,
  onRestart
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950 border-b border-slate-800 text-slate-100 select-none z-30">
      {/* Zone 1: Brand wordmark (single line text element) */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-heading font-bold text-xl tracking-wider text-rose-500 whitespace-nowrap shrink-0">
          RESLICER
        </span>
        <span className="text-xs font-mono text-slate-400 hidden sm:inline whitespace-nowrap">
          ZERO RESURGENCE
        </span>
      </div>

      {/* Zone 2: Concise single-line navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={onSelectMission}
          className={`hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 ${
            status === 'PLAYING' && mode === 'STORY' ? 'text-rose-400 font-semibold' : ''
          }`}
        >
          Disposal Center
        </button>
        <button
          onClick={onSelectBossRush}
          className={`hover:text-rose-400 transition-colors whitespace-nowrap shrink-0 ${
            status === 'PLAYING' && mode === 'BOSS_RUSH' ? 'text-rose-400 font-semibold' : ''
          }`}
        >
          Boss Arena
        </button>
        <button
          onClick={onOpenElves}
          className="hover:text-rose-400 transition-colors whitespace-nowrap shrink-0"
        >
          Cyber-Elves
        </button>
        <button
          onClick={onOpenControls}
          className="hover:text-rose-400 transition-colors whitespace-nowrap shrink-0"
        >
          Controls & Audio
        </button>
      </nav>

      {/* Zone 3: Single primary action */}
      <div className="flex items-center gap-3 shrink-0">
        {status === 'PLAYING' || status === 'PAUSED' ? (
          <button
            onClick={onRestart}
            className="px-4 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Restart Sector
          </button>
        ) : (
          <button
            onClick={onSelectMission}
            className="px-4 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Deploy Mission
          </button>
        )}
      </div>
    </header>
  );
};
