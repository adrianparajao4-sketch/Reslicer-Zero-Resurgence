import React from 'react';
import { Play, Swords, Sparkles, Sliders } from 'lucide-react';
import { GameMode, KeyBindingsMap } from '../types/game';
import { getKeyDisplayName } from '../game/keybindings';

interface TitleScreenProps {
  keybindings: KeyBindingsMap;
  onStartGame: (mode: GameMode) => void;
  onOpenElves: () => void;
  onOpenSettings: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  keybindings,
  onStartGame,
  onOpenElves,
  onOpenSettings
}) => {
  const getKeysLabel = (keys: string[]) => {
    if (!keys || keys.length === 0) return 'Unbound';
    return keys.map(getKeyDisplayName).join(' or ');
  };

  return (
    <div className="relative w-full min-h-[600px] flex flex-col justify-between p-8 md:p-12 overflow-hidden bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl">
      {/* Background Artwork Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/zero_cyber_city_backdrop_1792300395361.jpg"
          alt="Neo Arcadia Ruins"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-35 filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
      </div>

      {/* Header Info Banner */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Resistance Archive 21XX</span>
          <span aria-hidden="true">·</span>
          <span>Mega Man Zero Tribute Engine</span>
          <span aria-hidden="true">·</span>
          <span>Custom Key Bindings Enabled</span>
        </div>
        <div className="text-xs font-mono text-rose-400 font-semibold">
          STATUS: COMBAT READY
        </div>
      </div>

      {/* Main Hero Section */}
      <div className="relative z-10 my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="inline-flex items-center gap-2 text-rose-400 text-xs font-mono tracking-widest uppercase">
            Legendary Reploid Awakening
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-heading text-balance leading-none">
            RESLICER
            <span className="block text-rose-500 mt-1">ZERO RESURGENCE</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
            Awakened after a century in the disposal ruins, the crimson warrior wields the Z-Saber
            and Buster Cannon against relentless Neo Arcadia mechaniloids. Dash through perilous shafts,
            wall-jump past hazard spikes, and confront the titanic Heavy Golem.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onStartGame('STORY')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-heading font-semibold text-sm rounded-lg transition-colors shadow-lg shadow-rose-900/40 whitespace-nowrap cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Mission (Sector 0)
            </button>

            <button
              onClick={() => onStartGame('BOSS_RUSH')}
              className="inline-flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-heading font-semibold text-sm rounded-lg transition-colors border border-slate-700 whitespace-nowrap cursor-pointer"
            >
              <Swords className="w-4 h-4 text-amber-400" />
              Boss Arena: Golem Duel
            </button>

            <button
              onClick={onOpenElves}
              className="inline-flex items-center gap-2 px-4 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-medium text-sm rounded-lg transition-colors border border-slate-800 whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Cyber-Elves
            </button>

            <button
              onClick={onOpenSettings}
              aria-label="Customize Controls and Audio Settings"
              className="inline-flex items-center gap-2 px-4 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors border border-slate-800 cursor-pointer text-sm font-medium"
            >
              <Sliders className="w-4 h-4 text-rose-400" />
              <span>Remap Controls</span>
            </button>
          </div>
        </div>

        {/* Character Visual Showcase */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative group w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-900">
            <img
              src="/src/assets/images/zero_reploid_portrait_1792300397272.jpg"
              alt="Zero Legendary Warrior"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono">
              <span className="text-white font-semibold">UNIT: ZERO</span>
              <span className="text-emerald-400">CLASS: Z-SERIES</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Controls Quick Bar (Reflects Custom Keybindings) */}
      <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>
            Move: <strong className="text-slate-200">{getKeysLabel(keybindings.left)} / {getKeysLabel(keybindings.right)}</strong>
          </span>
          <span>
            Jump: <strong className="text-slate-200">{getKeysLabel(keybindings.jump)}</strong>
          </span>
          <span>
            Dash: <strong className="text-slate-200">{getKeysLabel(keybindings.dash)}</strong>
          </span>
          <span>
            Z-Saber: <strong className="text-emerald-400">{getKeysLabel(keybindings.saber)}</strong>
          </span>
          <span>
            Buster: <strong className="text-amber-400">{getKeysLabel(keybindings.attack)}</strong>
          </span>
          <span>
            Shield: <strong className="text-sky-400">{getKeysLabel(keybindings.shield)}</strong>
          </span>
        </div>
        <button
          onClick={onOpenSettings}
          className="text-rose-400 hover:text-rose-300 underline underline-offset-2 cursor-pointer font-sans text-xs"
        >
          Change Key Bindings →
        </button>
      </div>
    </div>
  );
};
