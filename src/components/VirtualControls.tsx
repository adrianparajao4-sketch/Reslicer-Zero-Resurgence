import React from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, ChevronUp, Zap, Swords, Crosshair, Shield } from 'lucide-react';

interface VirtualControlsProps {
  onKeyDown: (code: string) => void;
  onKeyUp: (code: string) => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({ onKeyDown, onKeyUp }) => {
  const handleTouch = (code: string) => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      onKeyDown(code);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      onKeyUp(code);
    },
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      onKeyDown(code);
    },
    onMouseUp: (e: React.MouseEvent) => {
      e.preventDefault();
      onKeyUp(code);
    }
  });

  return (
    <div className="w-full flex items-center justify-between gap-4 px-2 py-3 select-none touch-none">
      {/* Direction D-Pad */}
      <div className="flex items-center gap-2">
        <button
          {...handleTouch('ArrowLeft')}
          className="w-13 h-13 sm:w-14 sm:h-14 bg-slate-800/90 active:bg-slate-700 text-white rounded-xl flex items-center justify-center border border-slate-700 shadow-lg active:scale-95 transition-transform"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex flex-col gap-2">
          <button
            {...handleTouch('ArrowDown')}
            className="w-13 h-13 sm:w-14 sm:h-14 bg-slate-800/90 active:bg-slate-700 text-white rounded-xl flex items-center justify-center border border-slate-700 shadow-lg active:scale-95 transition-transform"
            aria-label="Drop Down Platform"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
        </div>

        <button
          {...handleTouch('ArrowRight')}
          className="w-13 h-13 sm:w-14 sm:h-14 bg-slate-800/90 active:bg-slate-700 text-white rounded-xl flex items-center justify-center border border-slate-700 shadow-lg active:scale-95 transition-transform"
          aria-label="Move Right"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Action Buttons Cluster */}
      <div className="flex items-center gap-2">
        {/* Dash */}
        <button
          {...handleTouch('KeyC')}
          className="w-12 h-12 sm:w-13 sm:h-13 bg-sky-700/80 active:bg-sky-600 text-white rounded-xl flex flex-col items-center justify-center border border-sky-600 shadow-lg active:scale-95 transition-transform"
          aria-label="Dash"
        >
          <Zap className="w-5 h-5" />
          <span className="text-[9px] font-mono font-bold leading-none mt-0.5">DASH</span>
        </button>

        {/* Shield */}
        <button
          {...handleTouch('KeyE')}
          className="w-12 h-12 sm:w-13 sm:h-13 bg-emerald-700/80 active:bg-emerald-600 text-white rounded-xl flex flex-col items-center justify-center border border-emerald-600 shadow-lg active:scale-95 transition-transform"
          aria-label="Shield Boomerang"
        >
          <Shield className="w-5 h-5" />
          <span className="text-[9px] font-mono font-bold leading-none mt-0.5">SHIELD</span>
        </button>

        {/* Buster Charge */}
        <button
          {...handleTouch('KeyZ')}
          className="w-12 h-12 sm:w-13 sm:h-13 bg-amber-600/80 active:bg-amber-500 text-white rounded-xl flex flex-col items-center justify-center border border-amber-500 shadow-lg active:scale-95 transition-transform"
          aria-label="Buster Attack and Charge"
        >
          <Crosshair className="w-5 h-5" />
          <span className="text-[9px] font-mono font-bold leading-none mt-0.5">BUSTER</span>
        </button>

        {/* Z-Saber */}
        <button
          {...handleTouch('KeyV')}
          className="w-13 h-13 sm:w-14 sm:h-14 bg-emerald-600 active:bg-emerald-500 text-white rounded-xl flex flex-col items-center justify-center border border-emerald-400 shadow-lg active:scale-95 transition-transform"
          aria-label="Z-Saber Slash"
        >
          <Swords className="w-6 h-6" />
          <span className="text-[10px] font-mono font-bold leading-none mt-0.5">SABER</span>
        </button>

        {/* Jump */}
        <button
          {...handleTouch('Space')}
          className="w-13 h-13 sm:w-14 sm:h-14 bg-rose-600 active:bg-rose-500 text-white rounded-xl flex flex-col items-center justify-center border border-rose-400 shadow-lg active:scale-95 transition-transform"
          aria-label="Jump"
        >
          <ChevronUp className="w-6 h-6" />
          <span className="text-[10px] font-mono font-bold leading-none mt-0.5">JUMP</span>
        </button>
      </div>
    </div>
  );
};
