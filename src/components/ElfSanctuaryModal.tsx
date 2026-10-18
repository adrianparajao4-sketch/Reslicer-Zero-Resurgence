import React from 'react';
import { Sparkles, Zap, Shield, X, Check, Lock } from 'lucide-react';
import { CyberElf } from '../types/game';

interface ElfSanctuaryModalProps {
  elves: CyberElf[];
  eCrystals: number;
  onToggleElf: (id: string) => void;
  onUnlockWithCrystals: (id: string, cost: number) => void;
  onClose: () => void;
}

export const ElfSanctuaryModal: React.FC<ElfSanctuaryModalProps> = ({
  elves,
  eCrystals,
  onToggleElf,
  onUnlockWithCrystals,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="text-xs font-mono text-emerald-400">CYBERNETIC RESONANCE</div>
            <h2 className="text-xl font-bold font-heading text-white">
              Cyber-Elf Sanctuary
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* E-Crystal Energy Balance */}
        <div className="flex items-center justify-between p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
          <div className="text-xs font-mono text-slate-400">
            CURRENT E-CRYSTALS
          </div>
          <div className="flex items-center gap-1.5 text-sky-400 font-mono font-bold text-base">
            <Sparkles className="w-4 h-4" />
            <span>{eCrystals} EC</span>
          </div>
        </div>

        {/* Elf List */}
        <div className="flex flex-col gap-3">
          {elves.map((elf) => {
            const unlockCost = 60;
            const canAfford = eCrystals >= unlockCost;

            return (
              <div
                key={elf.id}
                className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 gap-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center border ${
                      elf.unlocked
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                  >
                    {elf.type === 'NURSE' && <Sparkles className="w-5 h-5" />}
                    {elf.type === 'ANIMAL' && <Zap className="w-5 h-5" />}
                    {elf.type === 'HACKER' && <Shield className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-white">
                        {elf.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {elf.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">{elf.description}</p>
                    <div className="text-[11px] font-mono text-emerald-400 mt-1">
                      Effect: {elf.effect}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {elf.unlocked ? (
                    <button
                      onClick={() => onToggleElf(elf.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                        elf.active
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      }`}
                    >
                      {elf.active && <Check className="w-3.5 h-3.5" />}
                      {elf.active ? 'Equipped' : 'Equip'}
                    </button>
                  ) : (
                    <button
                      onClick={() => onUnlockWithCrystals(elf.id, unlockCost)}
                      disabled={!canAfford}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                        canAfford
                          ? 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <Lock className="w-3 h-3" />
                      Feed {unlockCost} EC
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-xs font-mono text-slate-400 border-t border-slate-800 pt-3">
          Cyber-Elves can also be found in secret containers during missions!
        </div>
      </div>
    </div>
  );
};
