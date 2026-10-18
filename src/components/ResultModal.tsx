import React from 'react';
import { Trophy, Clock, Skull, ShieldAlert, RotateCcw, Home, Sparkles } from 'lucide-react';
import { MissionStats } from '../types/game';

interface ResultModalProps {
  stats: MissionStats;
  onRetry: () => void;
  onTitle: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ stats, onRetry, onTitle }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const rankColor =
    stats.rank === 'S'
      ? 'from-amber-400 to-yellow-500 text-yellow-300 border-amber-400'
      : stats.rank === 'A'
      ? 'from-rose-500 to-red-600 text-rose-300 border-rose-500'
      : stats.rank === 'B'
      ? 'from-blue-500 to-cyan-500 text-cyan-300 border-blue-500'
      : stats.rank === 'C'
      ? 'from-emerald-500 to-teal-500 text-emerald-300 border-emerald-500'
      : 'from-slate-600 to-slate-700 text-slate-300 border-slate-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="text-xs font-mono text-rose-400 tracking-wider">
              MISSION EVALUATION
            </div>
            <h2 className="text-2xl font-bold font-heading text-white">
              SECTOR CLEAR
            </h2>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-md text-xs font-mono text-slate-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{stats.title}</span>
          </div>
        </div>

        {/* Big Rank Badge */}
        <div className="flex items-center justify-between p-6 bg-slate-950/60 rounded-xl border border-slate-800">
          <div>
            <div className="text-xs font-mono text-slate-400 mb-1">FINAL MISSION RANK</div>
            <div className="text-sm text-slate-300">
              Total Score: <strong className="text-white text-base font-mono">{stats.score}</strong> / 100p
            </div>
          </div>
          <div
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${rankColor} border-2 flex items-center justify-center shadow-lg font-heading font-black text-5xl`}
          >
            {stats.rank}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Clear Time</span>
            </div>
            <span className="font-mono text-white font-medium">{formatTime(stats.timeElapsed)}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400">
              <Skull className="w-4 h-4 text-rose-400" />
              <span>Mechaniloids</span>
            </div>
            <span className="font-mono text-white font-medium">{stats.enemiesDefeated} Defeated</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Damage Taken</span>
            </div>
            <span className="font-mono text-white font-medium">{stats.damageTaken} HP</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Elves Used</span>
            </div>
            <span className="font-mono text-white font-medium">{stats.elvesUsed}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onTitle}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg transition-colors border border-slate-700 whitespace-nowrap cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            Title Menu
          </button>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-lg transition-colors shadow-lg shadow-rose-900/40 whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Replay Sector
          </button>
        </div>
      </div>
    </div>
  );
};
