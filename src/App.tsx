import React, { useRef, useState } from 'react';
import { GameEngine } from './game/gameEngine';
import { GameMode, GameStatus, KeyBindingsMap, MissionStats } from './types/game';
import { getKeyDisplayName, loadKeybindings, saveKeybindings } from './game/keybindings';
import { TopNav } from './components/TopNav';
import { TitleScreen } from './components/TitleScreen';
import { GameCanvas } from './components/GameCanvas';
import { ResultModal } from './components/ResultModal';
import { ElfSanctuaryModal } from './components/ElfSanctuaryModal';
import { SettingsModal } from './components/SettingsModal';
import { Swords, Zap, Shield } from 'lucide-react';

export default function App() {
  const [status, setStatus] = useState<GameStatus>('TITLE');
  const [mode, setMode] = useState<GameMode>('STORY');
  const [stats, setStats] = useState<MissionStats | null>(null);

  const [showElves, setShowElves] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [keybindings, setKeybindings] = useState<KeyBindingsMap>(() => loadKeybindings());

  const engineRef = useRef<GameEngine | null>(null);

  const handleStartGame = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setStatus('PLAYING');
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.restartCurrentLevel();
    } else {
      setStatus('PLAYING');
    }
  };

  const handleReturnTitle = () => {
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
    setStatus('TITLE');
    setStats(null);
  };

  const handleKeybindingsChange = (newBindings: KeyBindingsMap) => {
    setKeybindings(newBindings);
    saveKeybindings(newBindings);
    if (engineRef.current) {
      engineRef.current.updateKeybindings(newBindings);
    }
  };

  const handleToggleElf = (id: string) => {
    if (engineRef.current) {
      const elf = engineRef.current.elves.find((e) => e.id === id);
      if (elf && elf.unlocked) {
        elf.active = !elf.active;
        setShowElves((prev) => !prev);
        setTimeout(() => setShowElves(true), 0);
      }
    }
  };

  const handleUnlockWithCrystals = (id: string, cost: number) => {
    if (engineRef.current && engineRef.current.eCrystals >= cost) {
      engineRef.current.eCrystals -= cost;
      const elf = engineRef.current.elves.find((e) => e.id === id);
      if (elf) {
        elf.unlocked = true;
        elf.active = true;
        setShowElves((prev) => !prev);
        setTimeout(() => setShowElves(true), 0);
      }
    }
  };

  const saberKeyLabel = keybindings.saber?.map(getKeyDisplayName).join(' / ') || 'V / U';
  const busterKeyLabel = keybindings.attack?.map(getKeyDisplayName).join(' / ') || 'Z / J';
  const shieldKeyLabel = keybindings.shield?.map(getKeyDisplayName).join(' / ') || 'E / I';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Bar adhering to 3-zone contract */}
      <TopNav
        status={status}
        mode={mode}
        onSelectMission={() => handleStartGame('STORY')}
        onSelectBossRush={() => handleStartGame('BOSS_RUSH')}
        onOpenElves={() => setShowElves(true)}
        onOpenControls={() => setShowSettings(true)}
        onRestart={handleRestart}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col items-center justify-center">
        {status === 'TITLE' ? (
          <TitleScreen
            keybindings={keybindings}
            onStartGame={handleStartGame}
            onOpenElves={() => setShowElves(true)}
            onOpenSettings={() => setShowSettings(true)}
          />
        ) : (
          <div className="w-full flex flex-col items-center gap-6">
            <GameCanvas
              mode={mode}
              engineRef={engineRef}
              onStateChange={setStatus}
              onStatsUpdate={setStats}
              onReturnTitle={handleReturnTitle}
            />

            {/* Quick Combat Weapon Arsenal Bar below canvas (Displays custom bound keys) */}
            <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="w-9 h-9 rounded-lg bg-emerald-950/50 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                  <Swords className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-heading font-bold text-white flex items-center gap-1.5">
                    <span>Z-SABER</span>
                    <span className="font-mono text-[10px] text-emerald-400 font-bold bg-slate-800 px-1.5 py-0.5 rounded">
                      {saberKeyLabel}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    3-hit combo, dash slash, and aerial spin
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="w-9 h-9 rounded-lg bg-amber-950/50 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-heading font-bold text-white flex items-center gap-1.5">
                    <span>Z-BUSTER</span>
                    <span className="font-mono text-[10px] text-amber-400 font-bold bg-slate-800 px-1.5 py-0.5 rounded">
                      HOLD {busterKeyLabel}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Rapid fire and 3-stage charged plasma blast
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="w-9 h-9 rounded-lg bg-sky-950/50 border border-sky-500/50 flex items-center justify-center text-sky-400 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-heading font-bold text-white flex items-center gap-1.5">
                    <span>SHIELD BOOMERANG</span>
                    <span className="font-mono text-[10px] text-sky-400 font-bold bg-slate-800 px-1.5 py-0.5 rounded">
                      {shieldKeyLabel}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Deflects enemy projectiles and strikes foes
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 py-4 px-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>RESLICER: Zero Resurgence · Custom Sprites inspired by BBLIR (MMZ/ZX)</span>
          <button
            onClick={() => setShowSettings(true)}
            className="text-slate-400 hover:text-rose-400 transition-colors underline cursor-pointer"
          >
            Customize Key Bindings & Audio
          </button>
        </div>
      </footer>

      {/* Modals */}
      {status === 'STAGE_CLEAR' && stats && (
        <ResultModal
          stats={stats}
          onRetry={handleRestart}
          onTitle={handleReturnTitle}
        />
      )}

      {showElves && (
        <ElfSanctuaryModal
          elves={engineRef.current?.elves || [
            {
              id: 'winkie',
              name: 'WINKIE',
              type: 'NURSE',
              description: 'Nurse Elf that automatically restores 50% HP when life drops to critical level.',
              effect: 'Auto-Revive / Emergency Heal',
              unlocked: true,
              active: true,
              icon: 'sparkles'
            },
            {
              id: 'turbo',
              name: 'TURBO',
              type: 'ANIMAL',
              description: 'Animal Elf that grants Zero 20% faster dash and the legendary Double Jump!',
              effect: 'Dash Boost + Double Jump',
              unlocked: false,
              active: true,
              icon: 'zap'
            },
            {
              id: 'kelpie',
              name: 'KELPIE',
              type: 'HACKER',
              description: 'Hacker Elf that infuses Z-Saber slashes with electric plasma, dealing +30% damage.',
              effect: 'Plasma Saber Overcharge',
              unlocked: true,
              active: true,
              icon: 'shield'
            }
          ]}
          eCrystals={engineRef.current?.eCrystals ?? 120}
          onToggleElf={handleToggleElf}
          onUnlockWithCrystals={handleUnlockWithCrystals}
          onClose={() => setShowElves(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          keybindings={keybindings}
          onKeybindingsChange={handleKeybindingsChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
