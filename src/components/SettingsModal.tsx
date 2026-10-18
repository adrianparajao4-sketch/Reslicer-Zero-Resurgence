import React, { useEffect, useState } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Keyboard,
  Sliders,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Gamepad2
} from 'lucide-react';
import { sound } from '../audio/soundEngine';
import {
  ACTION_METADATA,
  ARROW_KEYS_KEYBINDINGS,
  DEFAULT_KEYBINDINGS,
  MODERN_WASD_KEYBINDINGS,
  getKeyDisplayName,
  saveKeybindings
} from '../game/keybindings';
import { GameAction, KeyBindingsMap } from '../types/game';

interface SettingsModalProps {
  keybindings: KeyBindingsMap;
  onKeybindingsChange: (bindings: KeyBindingsMap) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  keybindings,
  onKeybindingsChange,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'CONTROLS' | 'AUDIO'>('CONTROLS');
  const [bgmVol, setBgmVol] = useState(sound.bgmVolume);
  const [sfxVol, setSfxVol] = useState(sound.sfxVolume);
  const [muted, setMuted] = useState(sound.muted);

  // Key Recording State
  const [recordingAction, setRecordingAction] = useState<GameAction | null>(null);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());

  // Listen for keyboard press to bind or test
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser default scroll for gameplay keys while testing
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      setPressedKeys((prev) => new Set(prev).add(e.code));

      // If recording a new keybinding for an action
      if (recordingAction) {
        e.preventDefault();
        e.stopPropagation();

        if (e.code === 'Escape' && recordingAction !== 'pause') {
          // Cancel recording
          setRecordingAction(null);
          return;
        }

        const currentKeys = keybindings[recordingAction] || [];
        if (!currentKeys.includes(e.code)) {
          const updated: KeyBindingsMap = {
            ...keybindings,
            [recordingAction]: [...currentKeys, e.code]
          };
          onKeybindingsChange(updated);
          saveKeybindings(updated);
        }

        setRecordingAction(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [recordingAction, keybindings, onKeybindingsChange]);

  const handleRemoveKey = (action: GameAction, codeToRemove: string) => {
    const currentKeys = keybindings[action] || [];
    const updated: KeyBindingsMap = {
      ...keybindings,
      [action]: currentKeys.filter((k) => k !== codeToRemove)
    };
    onKeybindingsChange(updated);
    saveKeybindings(updated);
  };

  const handleApplyPreset = (preset: KeyBindingsMap) => {
    onKeybindingsChange(preset);
    saveKeybindings(preset);
  };

  const handleBgmChange = (v: number) => {
    setBgmVol(v);
    sound.setVolumes(sfxVol, v);
  };

  const handleSfxChange = (v: number) => {
    setSfxVol(v);
    sound.setVolumes(v, bgmVol);
  };

  const handleMuteToggle = () => {
    const next = !muted;
    setMuted(next);
    sound.setMuted(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-500">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-white">
                Configuration & Key Bindings
              </h2>
              <p className="text-xs text-slate-400">
                Customize keyboard mapping and audio synthesizer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 bg-slate-950/40 border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('CONTROLS')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-heading font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'CONTROLS'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Custom Key Bindings
          </button>
          <button
            onClick={() => setActiveTab('AUDIO')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-heading font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'AUDIO'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Synthesizer Audio
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {activeTab === 'CONTROLS' ? (
            <>
              {/* Presets Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-xs font-mono text-slate-400 font-semibold uppercase">
                  Quick Presets:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleApplyPreset(DEFAULT_KEYBINDINGS)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700 cursor-pointer"
                  >
                    Classic (GBA)
                  </button>
                  <button
                    onClick={() => handleApplyPreset(MODERN_WASD_KEYBINDINGS)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700 cursor-pointer"
                  >
                    Modern WASD
                  </button>
                  <button
                    onClick={() => handleApplyPreset(ARROW_KEYS_KEYBINDINGS)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors border border-slate-700 cursor-pointer"
                  >
                    Arrow Keys
                  </button>
                  <button
                    onClick={() => handleApplyPreset(DEFAULT_KEYBINDINGS)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 rounded-lg transition-colors border border-slate-700 cursor-pointer"
                    title="Reset to default keybindings"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Recording Overlay Banner */}
              {recordingAction && (
                <div className="p-4 bg-rose-950/70 border border-rose-500 rounded-xl flex items-center justify-between gap-4 animate-pulse">
                  <div>
                    <div className="text-xs font-mono font-bold text-rose-300">
                      LISTENING FOR INPUT...
                    </div>
                    <div className="text-sm font-heading font-semibold text-white">
                      Press any key on your keyboard to bind to{' '}
                      <span className="text-amber-400 uppercase">
                        {ACTION_METADATA.find((a) => a.id === recordingAction)?.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200">Esc</kbd> to cancel.
                    </div>
                  </div>
                  <button
                    onClick={() => setRecordingAction(null)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg border border-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Action List Grid */}
              <div className="flex flex-col gap-2.5">
                {ACTION_METADATA.map((action) => {
                  const assignedKeys = keybindings[action.id] || [];
                  const isRecordingThis = recordingAction === action.id;

                  // Check if any assigned key is currently physically pressed on the keyboard
                  const isBeingPressed = assignedKeys.some((k) => pressedKeys.has(k));

                  return (
                    <div
                      key={action.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border transition-colors gap-3 ${
                        isBeingPressed
                          ? 'bg-rose-950/40 border-rose-500/70'
                          : isRecordingThis
                          ? 'bg-amber-950/30 border-amber-500/60'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-heading font-semibold text-white">
                            {action.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {action.category}
                          </span>
                          {isBeingPressed && (
                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                              <CheckCircle2 className="w-3 h-3" /> ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{action.description}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {assignedKeys.map((code) => {
                          const isKeyDown = pressedKeys.has(code);
                          return (
                            <span
                              key={code}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-semibold rounded-md border transition-all ${
                                isKeyDown
                                  ? 'bg-rose-600 text-white border-rose-400 scale-105 shadow-md shadow-rose-900/50'
                                  : 'bg-slate-800 text-slate-200 border-slate-700'
                              }`}
                            >
                              <span>{getKeyDisplayName(code)}</span>
                              <button
                                onClick={() => handleRemoveKey(action.id, code)}
                                className="text-slate-400 hover:text-rose-400 p-0.5 cursor-pointer"
                                title={`Remove ${getKeyDisplayName(code)}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}

                        <button
                          onClick={() => setRecordingAction(action.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                            isRecordingThis
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isRecordingThis ? 'Press Key...' : 'Add Key'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Test Bar */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Test your keys: press any key on your keyboard to see the action light up above in real-time.</span>
              </div>
            </>
          ) : (
            <>
              {/* Audio Controls Tab */}
              <div className="flex flex-col gap-5 p-5 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-heading font-bold text-white">
                      Procedural Web Audio Engine
                    </h3>
                    <p className="text-xs text-slate-400">
                      Real-time synthesized 16-bit chiptune sound waves
                    </p>
                  </div>
                  <button
                    onClick={handleMuteToggle}
                    className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      muted
                        ? 'bg-rose-950/50 border-rose-600 text-rose-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{muted ? 'Muted' : 'Audio Active'}</span>
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-medium">BGM Synth Melody Volume</span>
                    <span className="font-mono font-bold text-rose-400">
                      {Math.round(bgmVol * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bgmVol}
                    onChange={(e) => handleBgmChange(parseFloat(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-medium">SFX Saber & Buster Impact Volume</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {Math.round(sfxVol * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={sfxVol}
                    onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Combat Techniques Guide */}
              <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-300 flex flex-col gap-2">
                <span className="font-heading font-bold text-white text-sm">
                  Combat Techniques Reference:
                </span>
                <p>• <strong>Dash Jump:</strong> Press Jump while dashing to maintain high forward horizontal velocity through air.</p>
                <p>• <strong>Wall Slide & Kick:</strong> Cling against any vertical wall to slide down with friction sparks; press Jump to launch upward.</p>
                <p>• <strong>Dash Slash:</strong> Press Z-Saber while dashing to perform a lunging blade thrust that slices straight through shields.</p>
                <p>• <strong>Shield Reflection:</strong> Hold Shield Boomerang facing towards enemy bullets to reflect them right back at foes.</p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/80">
          <div className="text-xs font-mono text-slate-500">
            Settings auto-saved to browser storage
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-heading font-semibold text-xs rounded-lg transition-colors shadow-lg shadow-rose-900/30 cursor-pointer"
          >
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
};
