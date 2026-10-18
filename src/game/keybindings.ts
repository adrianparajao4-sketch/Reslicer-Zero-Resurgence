import { GameAction, KeyBindingsMap } from '../types/game';

export const DEFAULT_KEYBINDINGS: KeyBindingsMap = {
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
  down: ['ArrowDown', 'KeyS'],
  jump: ['Space', 'KeyX', 'KeyK'],
  dash: ['ShiftLeft', 'KeyC', 'KeyL'],
  saber: ['KeyV', 'KeyU'],
  attack: ['KeyZ', 'KeyJ'],
  shield: ['KeyE', 'KeyI'],
  pause: ['KeyP', 'Escape']
};

export const MODERN_WASD_KEYBINDINGS: KeyBindingsMap = {
  left: ['KeyA'],
  right: ['KeyD'],
  down: ['KeyS'],
  jump: ['Space'],
  dash: ['ShiftLeft'],
  saber: ['KeyJ'],
  attack: ['KeyK'],
  shield: ['KeyL'],
  pause: ['Escape']
};

export const ARROW_KEYS_KEYBINDINGS: KeyBindingsMap = {
  left: ['ArrowLeft'],
  right: ['ArrowRight'],
  down: ['ArrowDown'],
  jump: ['KeyZ', 'Space'],
  dash: ['KeyX'],
  saber: ['KeyC'],
  attack: ['KeyA'],
  shield: ['KeyS'],
  pause: ['KeyP']
};

export interface ActionMetadata {
  id: GameAction;
  name: string;
  category: 'Movement' | 'Combat' | 'System';
  description: string;
}

export const ACTION_METADATA: ActionMetadata[] = [
  { id: 'left', name: 'Move Left', category: 'Movement', description: 'Run left or cling to left wall' },
  { id: 'right', name: 'Move Right', category: 'Movement', description: 'Run right or cling to right wall' },
  { id: 'down', name: 'Drop Down Platform', category: 'Movement', description: 'Drop through one-way platforms' },
  { id: 'jump', name: 'Jump / Wall-Kick', category: 'Movement', description: 'Jump, double jump, and wall-kick' },
  { id: 'dash', name: 'Ground Dash', category: 'Movement', description: 'High-speed booster thrust slide' },
  { id: 'saber', name: 'Z-Saber Slash', category: 'Combat', description: '3-hit ground combo, dash slash, air spin' },
  { id: 'attack', name: 'Z-Buster / Charge', category: 'Combat', description: 'Fire plasma bolts or hold to charge' },
  { id: 'shield', name: 'Shield Boomerang', category: 'Combat', description: 'Reflect shots & throw spinning blade' },
  { id: 'pause', name: 'Pause / Resume', category: 'System', description: 'Pause combat simulation' }
];

const STORAGE_KEY = 'reslicer_zero_keybindings_v1';

export function loadKeybindings(): KeyBindingsMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_KEYBINDINGS };
    const parsed = JSON.parse(raw);
    // Ensure all actions exist
    const merged: KeyBindingsMap = { ...DEFAULT_KEYBINDINGS };
    for (const key of Object.keys(DEFAULT_KEYBINDINGS) as GameAction[]) {
      if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
        merged[key] = parsed[key];
      }
    }
    return merged;
  } catch {
    return { ...DEFAULT_KEYBINDINGS };
  }
}

export function saveKeybindings(bindings: KeyBindingsMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bindings));
  } catch {
    // Ignore localStorage write error in private modes
  }
}

export function getKeyDisplayName(code: string): string {
  if (!code) return '';

  if (code.startsWith('Key')) {
    return code.slice(3).toUpperCase();
  }
  if (code.startsWith('Digit')) {
    return code.slice(5);
  }
  if (code.startsWith('Numpad')) {
    return 'Num ' + code.slice(6);
  }

  switch (code) {
    case 'Space':
      return 'Spacebar';
    case 'ShiftLeft':
      return 'Left Shift';
    case 'ShiftRight':
      return 'Right Shift';
    case 'ControlLeft':
      return 'Left Ctrl';
    case 'ControlRight':
      return 'Right Ctrl';
    case 'AltLeft':
      return 'Left Alt';
    case 'AltRight':
      return 'Right Alt';
    case 'ArrowLeft':
      return '← Left';
    case 'ArrowRight':
      return '→ Right';
    case 'ArrowUp':
      return '↑ Up';
    case 'ArrowDown':
      return '↓ Down';
    case 'Enter':
      return 'Enter';
    case 'Escape':
      return 'Esc';
    case 'Tab':
      return 'Tab';
    case 'Backspace':
      return 'Backspace';
    case 'Slash':
      return '/';
    case 'Semicolon':
      return ';';
    case 'Period':
      return '.';
    case 'Comma':
      return ',';
    default:
      return code;
  }
}

export function isActionActive(
  action: GameAction,
  keys: Record<string, boolean>,
  bindings: KeyBindingsMap
): boolean {
  const codes = bindings[action];
  if (!codes) return false;
  return codes.some((code) => !!keys[code]);
}

export function isActionJustTriggered(
  action: GameAction,
  keys: Record<string, boolean>,
  prevKeys: Record<string, boolean>,
  bindings: KeyBindingsMap
): boolean {
  const codes = bindings[action];
  if (!codes) return false;
  return codes.some((code) => keys[code] && !prevKeys[code]);
}
