import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Home, Smartphone } from 'lucide-react';
import { GameEngine } from '../game/gameEngine';
import { GameMode, GameStatus, MissionStats, RadioTransmission } from '../types/game';
import { VirtualControls } from './VirtualControls';

interface GameCanvasProps {
  mode: GameMode;
  engineRef: React.MutableRefObject<GameEngine | null>;
  onStateChange: (status: GameStatus) => void;
  onStatsUpdate: (stats: MissionStats) => void;
  onReturnTitle: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  mode,
  engineRef,
  onStateChange,
  onStatsUpdate,
  onReturnTitle
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>('PLAYING');
  const [transmission, setTransmission] = useState<RadioTransmission | null>(null);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(true);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;

    engine.onStateChange = (status) => {
      setGameStatus(status);
      onStateChange(status);
    };

    engine.onStatsUpdate = (stats) => {
      onStatsUpdate(stats);
    };

    engine.onTransmission = (trans) => {
      setTransmission(trans);
    };

    // Start current level
    engine.startMission(mode);

    // Global Key Listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scroll on space/arrows during gameplay
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      if (engine.status === 'GAME_OVER') {
        if (['Enter', 'Space', 'KeyR'].includes(e.code)) {
          engine.restartCurrentLevel();
          return;
        }
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (engine.status === 'PLAYING') {
          engine.setStatus('PAUSED');
        } else if (engine.status === 'PAUSED') {
          engine.setStatus('PLAYING');
        }
        return;
      }
      engine.keys[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      engine.destroy();
    };
  }, [mode]);

  const handleVirtualKeyDown = (code: string) => {
    if (engineRef.current) {
      engineRef.current.keys[code] = true;
    }
  };

  const handleVirtualKeyUp = (code: string) => {
    if (engineRef.current) {
      engineRef.current.keys[code] = false;
    }
  };

  const handleTogglePause = () => {
    if (!engineRef.current) return;
    if (gameStatus === 'PLAYING') {
      engineRef.current.setStatus('PAUSED');
    } else if (gameStatus === 'PAUSED') {
      engineRef.current.setStatus('PLAYING');
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.restartCurrentLevel();
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Canvas Viewport Frame */}
      <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl aspect-[16/9] flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="w-full h-full object-contain select-none"
        />

        {/* Top Floating Control Bar */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          <button
            onClick={() => setShowTouchControls(!showTouchControls)}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-lg backdrop-blur-sm border border-slate-700/60 transition-colors cursor-pointer"
            title="Toggle On-Screen Touch Controls"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={handleTogglePause}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 rounded-lg backdrop-blur-sm border border-slate-700/60 transition-colors cursor-pointer"
            title="Pause Game (P / Esc)"
          >
            {gameStatus === 'PAUSED' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>

        {/* Ciel Radio Codec Transmission Popup */}
        {transmission && (
          <div className="absolute bottom-6 left-6 right-6 sm:left-10 sm:right-auto sm:max-w-xl z-20 animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-3 p-3.5 bg-slate-950/90 border border-sky-500/60 rounded-xl shadow-2xl backdrop-blur-md">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-sky-400 shrink-0 bg-slate-900">
                <img
                  src={transmission.avatar}
                  alt={transmission.speaker}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-sky-400 tracking-wider">
                    {transmission.speaker}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    RESISTANCE TRANSMISSION
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-100 font-sans mt-0.5 leading-snug">
                  "{transmission.message}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Paused Overlay */}
        {gameStatus === 'PAUSED' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl flex flex-col items-center gap-4 text-center max-w-sm">
              <h3 className="text-2xl font-bold font-heading text-white">MISSION PAUSED</h3>
              <p className="text-xs text-slate-300">Zero is in standby mode.</p>
              <div className="flex items-center gap-3 w-full mt-2">
                <button
                  onClick={handleTogglePause}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Resume
                </button>
                <button
                  onClick={handleRestart}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700 cursor-pointer"
                  title="Restart Sector"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={onReturnTitle}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors border border-slate-700 cursor-pointer"
                  title="Title Menu"
                >
                  <Home className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameStatus === 'GAME_OVER' && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-rose-950/80 backdrop-blur-md">
            <div className="bg-slate-950 border border-rose-800 p-8 rounded-2xl flex flex-col items-center gap-4 text-center max-w-sm shadow-2xl">
              <div className="text-xs font-mono text-rose-500 tracking-widest uppercase">
                CRITICAL MALFUNCTION
              </div>
              <h3 className="text-3xl font-extrabold font-heading text-rose-500">
                ZERO SHUT DOWN
              </h3>
              <p className="text-xs text-slate-300">
                Resistance signals have been lost. Would you like to reboot Zero's combat unit?
              </p>
              <div className="flex items-center gap-3 w-full mt-2">
                <button
                  onClick={handleRestart}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-lg transition-colors shadow-lg cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reboot Sector
                </button>
                <button
                  onClick={onReturnTitle}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-lg transition-colors border border-slate-700 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  Title
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Virtual On-Screen Gamepad */}
      {showTouchControls && (
        <div className="w-full max-w-5xl mt-3">
          <VirtualControls
            onKeyDown={handleVirtualKeyDown}
            onKeyUp={handleVirtualKeyUp}
          />
        </div>
      )}
    </div>
  );
};
