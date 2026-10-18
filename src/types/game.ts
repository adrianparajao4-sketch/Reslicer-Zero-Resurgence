export type GameMode = 'STORY' | 'STAGE_2' | 'BOSS_RUSH';

export type GameStatus =
  | 'TITLE'
  | 'PLAYING'
  | 'BOSS_INTRO'
  | 'PAUSED'
  | 'STAGE_CLEAR'
  | 'GAME_OVER';

export type WeaponType = 'BUSTER' | 'SABER' | 'SHIELD';

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1;
  grounded: boolean;
  onWall: -1 | 1 | 0; // -1: left wall, 1: right wall, 0: not on wall
  isDashing: boolean;
  dashTimer: number;
  jumpCount: number;
  maxJumps: number;
  
  // Health
  hp: number;
  maxHp: number;
  subTankHp: number;
  invincibleTimer: number;

  // Combat
  currentWeapon: WeaponType;
  chargeTime: number;
  isCharging: boolean;
  attackCooldown: number;
  comboStep: number;
  comboTimer: number;
  isSlashing: boolean;
  slashTimer: number;
  slashType: 'SLASH_1' | 'SLASH_2' | 'SLASH_3' | 'DASH_SLASH' | 'AIR_SPIN' | 'CHARGE_THRUST';
  shieldActive: boolean;
  isShieldBashing: boolean;
  shieldBashTimer: number;

  // Visuals & Physics
  ponytailAngle: number;
  state: 'idle' | 'run' | 'dash' | 'jump' | 'fall' | 'wall_slide' | 'slash' | 'hurt' | 'shield_bash';
  animationFrame: number;
}

export type EnemyType =
  | 'PANTHEON_HUNTER'
  | 'MECHANILOID_HOUND'
  | 'FLYING_DRONE'
  | 'SPIKY_ROLLER'
  | 'TURRET'
  | 'BOSS_GOLEM'
  | 'BOSS_AEGIS_PALADIN';

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1;
  hp: number;
  maxHp: number;
  grounded: boolean;
  active: boolean;
  shootCooldown: number;
  stateTimer: number;
  actionState: string;
  invincibleTimer: number;
  stunTimer: number;
  shieldActive?: boolean;
  isBoss?: boolean;
  phase?: number;
  dashTimer?: number;
  jumpCooldown?: number;
  shootTimer?: number;
  aimAngle?: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  fromPlayer: boolean;
  type:
    | 'BUSTER_NORMAL'
    | 'BUSTER_LV2'
    | 'BUSTER_LV3'
    | 'SHIELD_BOOMERANG'
    | 'ENEMY_BULLET'
    | 'AEGIS_BULLET'
    | 'DEFLECTED_BULLET'
    | 'BOSS_LASER'
    | 'BOSS_RUBBLE';
  piercing?: boolean;
  life: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  shape: 'circle' | 'spark' | 'smoke' | 'slash_wave' | 'flame' | 'debris' | 'sonic_ring' | 'electric';
  angle?: number;
  opacity?: number;
}

export interface Pickup {
  id: string;
  type: 'HP_SMALL' | 'HP_LARGE' | 'E_CRYSTAL' | 'CYBER_ELF';
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  elfId?: string;
  collected: boolean;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'SOLID' | 'ONE_WAY' | 'SPIKE' | 'BREAKABLE' | 'DOOR' | 'MOVING';
  hp?: number; // for breakable walls
  vx?: number;
  minX?: number;
  maxX?: number;
}

export interface CyberElf {
  id: string;
  name: string;
  type: 'NURSE' | 'ANIMAL' | 'HACKER';
  description: string;
  effect: string;
  unlocked: boolean;
  active: boolean;
  icon: string;
}

export interface RadioTransmission {
  id: string;
  speaker: string;
  message: string;
  avatar: string;
  duration: number; // in seconds
  triggerX?: number;
  hasTriggered?: boolean;
}

export interface MissionStats {
  timeElapsed: number; // in seconds
  enemiesDefeated: number;
  totalEnemies: number;
  damageTaken: number;
  retries: number;
  elvesUsed: number;
  score: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  title: string;
  stageName?: string;
}

export type GameAction =
  | 'left'
  | 'right'
  | 'down'
  | 'jump'
  | 'dash'
  | 'saber'
  | 'attack'
  | 'shield'
  | 'pause';

export type KeyBindingsMap = Record<GameAction, string[]>;

export interface PlayerGhost {
  x: number;
  y: number;
  facing: 1 | -1;
  state: string;
  isSlashing: boolean;
  slashType: 'SLASH_1' | 'SLASH_2' | 'SLASH_3' | 'DASH_SLASH' | 'AIR_SPIN' | 'CHARGE_THRUST';
  comboStep: number;
  alpha: number;
  color: string;
}

