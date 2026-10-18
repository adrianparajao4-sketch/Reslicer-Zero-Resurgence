import { Enemy, Pickup, Platform, RadioTransmission } from '../types/game';

export interface LevelData {
  id: string;
  name: string;
  subtitle: string;
  width: number;
  height: number;
  playerSpawn: { x: number; y: number };
  platforms: Platform[];
  enemies: Enemy[];
  pickups: Pickup[];
  radioTransmissions: RadioTransmission[];
  bossRoomX: number;
}

export function getStoryLevel(): LevelData {
  const platforms: Platform[] = [
    // Starting floor (Awakening Lab Ruins)
    { x: 0, y: 550, width: 800, height: 150, type: 'SOLID' },
    // Ceiling & Left Boundary
    { x: -50, y: 0, width: 50, height: 700, type: 'SOLID' },
    { x: 0, y: -50, width: 4000, height: 50, type: 'SOLID' },

    // Lab Chamber Platforms
    { x: 220, y: 440, width: 140, height: 20, type: 'ONE_WAY' },
    { x: 420, y: 350, width: 160, height: 20, type: 'ONE_WAY' },
    { x: 620, y: 440, width: 140, height: 20, type: 'ONE_WAY' },

    // Gap 1: Spike pit
    { x: 800, y: 640, width: 250, height: 60, type: 'SPIKE' },
    // Floating stepping stone over spike pit
    { x: 860, y: 480, width: 120, height: 20, type: 'SOLID' },

    // Section 2: Industrial Girders & Wall-Jump Shaft
    { x: 1050, y: 550, width: 600, height: 150, type: 'SOLID' },
    // High wall requiring wall-slide and wall-jump
    { x: 1400, y: 220, width: 40, height: 240, type: 'SOLID' },
    { x: 1540, y: 280, width: 40, height: 270, type: 'SOLID' },
    // Upper overhead catwalk
    { x: 1250, y: 220, width: 150, height: 20, type: 'ONE_WAY' },
    { x: 1440, y: 150, width: 120, height: 20, type: 'ONE_WAY' },
    { x: 1580, y: 280, width: 300, height: 20, type: 'SOLID' },

    // Breakable Wall blocking secret Cyber-Elf alcove
    { x: 1280, y: 470, width: 30, height: 80, type: 'BREAKABLE', hp: 40 },
    { x: 1180, y: 470, width: 100, height: 80, type: 'SOLID' },

    // Section 3: Disposal Waste Pit & Moving Platform
    { x: 1650, y: 550, width: 300, height: 150, type: 'SOLID' },
    { x: 1950, y: 640, width: 400, height: 60, type: 'SPIKE' },
    // Moving platform crossing the acid/spike waste
    { x: 2050, y: 480, width: 120, height: 20, type: 'MOVING', vx: 1.8, minX: 1980, maxX: 2280 },

    // Section 4: Security Checkpoint & Elevator Bay
    { x: 2350, y: 550, width: 650, height: 150, type: 'SOLID' },
    { x: 2500, y: 420, width: 160, height: 20, type: 'ONE_WAY' },
    { x: 2720, y: 320, width: 180, height: 20, type: 'ONE_WAY' },
    { x: 2420, y: 260, width: 140, height: 20, type: 'ONE_WAY' },

    // Boss Entrance Corridor & Security Blast Shutter Gate
    { x: 3000, y: 550, width: 250, height: 150, type: 'SOLID' },
    // Boss Gate Door (triggers boss warning transition)
    { x: 3240, y: 390, width: 30, height: 160, type: 'DOOR' },

    // Boss Arena (3270px to 4200px)
    { x: 3270, y: 550, width: 930, height: 150, type: 'SOLID' },
    // Boss Arena Left Wall
    { x: 3250, y: 0, width: 20, height: 390, type: 'SOLID' },
    // Boss Arena Right Wall (high wall for wall-jumping during laser)
    { x: 4180, y: 0, width: 50, height: 700, type: 'SOLID' },
    // High tactical ledges in boss arena for dodging ground attacks
    { x: 3340, y: 380, width: 100, height: 20, type: 'ONE_WAY' },
    { x: 4050, y: 360, width: 100, height: 20, type: 'ONE_WAY' }
  ];

  const enemies: Enemy[] = [
    // Area 1: Pantheon scouts and hounds
    {
      id: 'pantheon-1',
      type: 'PANTHEON_HUNTER',
      x: 520,
      y: 490,
      vx: 0,
      vy: 0,
      width: 38,
      height: 60,
      facing: -1,
      hp: 35,
      maxHp: 35,
      grounded: true,
      active: true,
      shootCooldown: 90,
      stateTimer: 0,
      actionState: 'patrol',
      invincibleTimer: 0
    },
    {
      id: 'spiky-1',
      type: 'SPIKY_ROLLER',
      x: 700,
      y: 520,
      vx: -1,
      vy: 0,
      width: 32,
      height: 30,
      facing: -1,
      hp: 25,
      maxHp: 25,
      grounded: true,
      active: true,
      shootCooldown: 120,
      stateTimer: 0,
      actionState: 'roll',
      invincibleTimer: 0
    },
    {
      id: 'drone-1',
      type: 'FLYING_DRONE',
      x: 920,
      y: 320,
      vx: 0,
      vy: 0,
      width: 36,
      height: 28,
      facing: -1,
      hp: 20,
      maxHp: 20,
      grounded: false,
      active: true,
      shootCooldown: 100,
      stateTimer: 0,
      actionState: 'hover',
      invincibleTimer: 0
    },

    // Area 2: Vertical shaft & upper catwalk
    {
      id: 'hound-1',
      type: 'MECHANILOID_HOUND',
      x: 1180,
      y: 500,
      vx: 0,
      vy: 0,
      width: 48,
      height: 36,
      facing: -1,
      hp: 30,
      maxHp: 30,
      grounded: true,
      active: true,
      shootCooldown: 60,
      stateTimer: 0,
      actionState: 'stalk',
      invincibleTimer: 0
    },
    {
      id: 'pantheon-2',
      type: 'PANTHEON_HUNTER',
      x: 1680,
      y: 220,
      vx: 0,
      vy: 0,
      width: 38,
      height: 60,
      facing: -1,
      hp: 40,
      maxHp: 40,
      grounded: true,
      active: true,
      shootCooldown: 80,
      stateTimer: 0,
      actionState: 'aim',
      invincibleTimer: 0
    },
    {
      id: 'turret-1',
      type: 'TURRET',
      x: 1380,
      y: 190,
      vx: 0,
      vy: 0,
      width: 32,
      height: 30,
      facing: -1,
      hp: 30,
      maxHp: 30,
      grounded: true,
      active: true,
      shootCooldown: 140,
      stateTimer: 0,
      actionState: 'track',
      invincibleTimer: 0
    },

    // Area 3: Hazardous sector
    {
      id: 'drone-2',
      type: 'FLYING_DRONE',
      x: 2120,
      y: 350,
      vx: 0,
      vy: 0,
      width: 36,
      height: 28,
      facing: -1,
      hp: 25,
      maxHp: 25,
      grounded: false,
      active: true,
      shootCooldown: 90,
      stateTimer: 0,
      actionState: 'hover',
      invincibleTimer: 0
    },
    {
      id: 'hound-2',
      type: 'MECHANILOID_HOUND',
      x: 2450,
      y: 500,
      vx: 0,
      vy: 0,
      width: 48,
      height: 36,
      facing: -1,
      hp: 35,
      maxHp: 35,
      grounded: true,
      active: true,
      shootCooldown: 50,
      stateTimer: 0,
      actionState: 'stalk',
      invincibleTimer: 0
    },
    {
      id: 'pantheon-3',
      type: 'PANTHEON_HUNTER',
      x: 2600,
      y: 360,
      vx: 0,
      vy: 0,
      width: 38,
      height: 60,
      facing: -1,
      hp: 45,
      maxHp: 45,
      grounded: true,
      active: true,
      shootCooldown: 70,
      stateTimer: 0,
      actionState: 'patrol',
      invincibleTimer: 0
    },
    {
      id: 'spiky-2',
      type: 'SPIKY_ROLLER',
      x: 2800,
      y: 520,
      vx: -1,
      vy: 0,
      width: 32,
      height: 30,
      facing: -1,
      hp: 30,
      maxHp: 30,
      grounded: true,
      active: true,
      shootCooldown: 100,
      stateTimer: 0,
      actionState: 'roll',
      invincibleTimer: 0
    },

    // Boss: Heavy Mechaniloid GOLEM
    {
      id: 'boss-golem',
      type: 'BOSS_GOLEM',
      x: 3800,
      y: 410,
      vx: 0,
      vy: 0,
      width: 120,
      height: 140,
      facing: -1,
      hp: 260,
      maxHp: 260,
      grounded: true,
      active: false, // Activated upon crossing boss door
      shootCooldown: 120,
      stateTimer: 0,
      actionState: 'idle',
      invincibleTimer: 0,
      isBoss: true,
      phase: 1
    }
  ];

  const pickups: Pickup[] = [
    // Health pick-ups along the way
    { id: 'hp-1', type: 'HP_SMALL', x: 480, y: 310, width: 20, height: 20, vy: 0, collected: false },
    { id: 'ec-1', type: 'E_CRYSTAL', x: 920, y: 440, width: 22, height: 22, vy: 0, collected: false },
    { id: 'hp-2', type: 'HP_LARGE', x: 1210, y: 510, width: 26, height: 26, vy: 0, collected: false }, // Behind breakable wall!
    { id: 'elf-winkie', type: 'CYBER_ELF', elfId: 'winkie', x: 1240, y: 490, width: 28, height: 28, vy: 0, collected: false },
    { id: 'ec-2', type: 'E_CRYSTAL', x: 1480, y: 110, width: 22, height: 22, vy: 0, collected: false },
    { id: 'elf-turbo', type: 'CYBER_ELF', elfId: 'turbo', x: 2780, y: 280, width: 28, height: 28, vy: 0, collected: false },
    { id: 'hp-3', type: 'HP_LARGE', x: 3060, y: 510, width: 26, height: 26, vy: 0, collected: false }
  ];

  const radioTransmissions: RadioTransmission[] = [
    {
      id: 'intro',
      speaker: 'CIEL',
      message: 'Zero! You’re awake! Resistance troops are under heavy attack by Neo Arcadia pantheons! Please break through the disposal sector!',
      avatar: '/src/assets/images/ciel_resistance_operator_1792300397019.jpg',
      duration: 5.5,
      triggerX: 100
    },
    {
      id: 'wall-slide-tip',
      speaker: 'CIEL',
      message: 'Zero, hold against vertical walls to wall-slide and kick off to wall-jump! Combine with dash for immense speed!',
      avatar: '/src/assets/images/ciel_resistance_operator_1792300397019.jpg',
      duration: 5.0,
      triggerX: 1150
    },
    {
      id: 'boss-warning',
      speaker: 'CIEL',
      message: 'WARNING! Massive mechaniloid detected ahead: Heavy Golem! Avoid its optic laser by scaling the walls, and aim for its power core!',
      avatar: '/src/assets/images/ciel_resistance_operator_1792300397019.jpg',
      duration: 6.0,
      triggerX: 3100
    }
  ];

  return {
    id: 'sector-0',
    name: 'DISPOSAL CENTER RUINS',
    subtitle: 'Underground Laboratory · Sector 0',
    width: 4250,
    height: 700,
    playerSpawn: { x: 120, y: 470 },
    platforms,
    enemies,
    pickups,
    radioTransmissions,
    bossRoomX: 3250
  };
}

export function getStage2Level(): LevelData {
  const platforms: Platform[] = [
    // Entrance Skyway
    { x: 0, y: 550, width: 750, height: 150, type: 'SOLID' },
    { x: -50, y: 0, width: 50, height: 700, type: 'SOLID' },
    { x: 0, y: -50, width: 4400, height: 50, type: 'SOLID' },

    // Mid-air tactical catwalks
    { x: 200, y: 430, width: 150, height: 20, type: 'ONE_WAY' },
    { x: 400, y: 340, width: 170, height: 20, type: 'ONE_WAY' },
    { x: 600, y: 440, width: 130, height: 20, type: 'ONE_WAY' },

    // Pit Hazard 1: Sky Abyss / Electric Spikes
    { x: 750, y: 620, width: 300, height: 80, type: 'SPIKE' },
    { x: 820, y: 470, width: 140, height: 20, type: 'MOVING', vx: 1.6, minX: 790, maxX: 990 },

    // Sector 2: Citadel Bastion & Wall-climbing Shaft
    { x: 1050, y: 550, width: 700, height: 150, type: 'SOLID' },
    // Twin vertical pylons for wall-jumping
    { x: 1380, y: 200, width: 40, height: 260, type: 'SOLID' },
    { x: 1550, y: 260, width: 40, height: 290, type: 'SOLID' },
    { x: 1220, y: 200, width: 160, height: 20, type: 'ONE_WAY' },
    { x: 1420, y: 130, width: 130, height: 20, type: 'ONE_WAY' },
    { x: 1590, y: 250, width: 280, height: 20, type: 'SOLID' },

    // Breakable energy door guarding Kelpie secret stash
    { x: 1280, y: 470, width: 30, height: 80, type: 'BREAKABLE', hp: 50 },
    { x: 1180, y: 470, width: 100, height: 80, type: 'SOLID' },

    // Pit Hazard 2: Plasma Chasm with High-Speed Moving Lift
    { x: 1750, y: 550, width: 320, height: 150, type: 'SOLID' },
    { x: 2070, y: 620, width: 380, height: 80, type: 'SPIKE' },
    { x: 2160, y: 460, width: 140, height: 20, type: 'MOVING', vx: -2.0, minX: 2110, maxX: 2390 },

    // Sector 3: Grand Citadel Plaza
    { x: 2450, y: 550, width: 800, height: 150, type: 'SOLID' },
    { x: 2600, y: 420, width: 160, height: 20, type: 'ONE_WAY' },
    { x: 2820, y: 310, width: 180, height: 20, type: 'ONE_WAY' },
    { x: 2550, y: 240, width: 140, height: 20, type: 'ONE_WAY' },

    // Security Gate into Paladin's Duel Arena
    { x: 3250, y: 550, width: 200, height: 150, type: 'SOLID' },
    { x: 3440, y: 390, width: 30, height: 160, type: 'DOOR' },

    // Boss Arena: Shield Bearer Bastion
    { x: 3470, y: 550, width: 950, height: 150, type: 'SOLID' },
    { x: 3450, y: 0, width: 20, height: 390, type: 'SOLID' },
    { x: 4400, y: 0, width: 50, height: 700, type: 'SOLID' },
    // Arena elevated dodging ledges
    { x: 3560, y: 380, width: 120, height: 20, type: 'ONE_WAY' },
    { x: 4220, y: 380, width: 120, height: 20, type: 'ONE_WAY' },
    { x: 3880, y: 290, width: 160, height: 20, type: 'ONE_WAY' }
  ];

  const enemies: Enemy[] = [
    // Area 1: Vanguard scouts
    {
      id: 's2-pantheon-1',
      type: 'PANTHEON_HUNTER',
      x: 550,
      y: 490,
      vx: 0,
      vy: 0,
      width: 38,
      height: 60,
      facing: -1,
      hp: 45,
      maxHp: 45,
      grounded: true,
      active: true,
      shootCooldown: 80,
      stateTimer: 0,
      actionState: 'patrol',
      invincibleTimer: 0,
      stunTimer: 0
    },
    {
      id: 's2-drone-1',
      type: 'FLYING_DRONE',
      x: 900,
      y: 300,
      vx: 0,
      vy: 0,
      width: 36,
      height: 28,
      facing: -1,
      hp: 30,
      maxHp: 30,
      grounded: false,
      active: true,
      shootCooldown: 85,
      stateTimer: 0,
      actionState: 'hover',
      invincibleTimer: 0,
      stunTimer: 0
    },
    {
      id: 's2-hound-1',
      type: 'MECHANILOID_HOUND',
      x: 1200,
      y: 500,
      vx: 0,
      vy: 0,
      width: 48,
      height: 36,
      facing: -1,
      hp: 40,
      maxHp: 40,
      grounded: true,
      active: true,
      shootCooldown: 50,
      stateTimer: 0,
      actionState: 'stalk',
      invincibleTimer: 0,
      stunTimer: 0
    },
    {
      id: 's2-turret-1',
      type: 'TURRET',
      x: 1360,
      y: 170,
      vx: 0,
      vy: 0,
      width: 32,
      height: 30,
      facing: -1,
      hp: 35,
      maxHp: 35,
      grounded: true,
      active: true,
      shootCooldown: 110,
      stateTimer: 0,
      actionState: 'track',
      invincibleTimer: 0,
      stunTimer: 0
    },
    {
      id: 's2-pantheon-2',
      type: 'PANTHEON_HUNTER',
      x: 1700,
      y: 200,
      vx: 0,
      vy: 0,
      width: 38,
      height: 60,
      facing: -1,
      hp: 50,
      maxHp: 50,
      grounded: true,
      active: true,
      shootCooldown: 70,
      stateTimer: 0,
      actionState: 'aim',
      invincibleTimer: 0,
      stunTimer: 0
    },
    {
      id: 's2-spiky-1',
      type: 'SPIKY_ROLLER',
      x: 2600,
      y: 520,
      vx: -1.2,
      vy: 0,
      width: 32,
      height: 30,
      facing: -1,
      hp: 35,
      maxHp: 35,
      grounded: true,
      active: true,
      shootCooldown: 90,
      stateTimer: 0,
      actionState: 'roll',
      invincibleTimer: 0,
      stunTimer: 0
    },
    {
      id: 's2-drone-2',
      type: 'FLYING_DRONE',
      x: 2900,
      y: 330,
      vx: 0,
      vy: 0,
      width: 36,
      height: 28,
      facing: -1,
      hp: 30,
      maxHp: 30,
      grounded: false,
      active: true,
      shootCooldown: 80,
      stateTimer: 0,
      actionState: 'hover',
      invincibleTimer: 0,
      stunTimer: 0
    },
    {
      id: 's2-hound-2',
      type: 'MECHANILOID_HOUND',
      x: 3100,
      y: 500,
      vx: 0,
      vy: 0,
      width: 48,
      height: 36,
      facing: -1,
      hp: 45,
      maxHp: 45,
      grounded: true,
      active: true,
      shootCooldown: 45,
      stateTimer: 0,
      actionState: 'stalk',
      invincibleTimer: 0,
      stunTimer: 0
    },

    // Boss 2: THE SHIELD BEARER PALADIN (Agile reploid with front shield, dashes, high jumps, 2s aimed rifle)
    {
      id: 'boss-aegis-paladin',
      type: 'BOSS_AEGIS_PALADIN',
      x: 3950,
      y: 470,
      vx: 0,
      vy: 0,
      width: 44,
      height: 64,
      facing: -1,
      hp: 300,
      maxHp: 300,
      grounded: true,
      active: false, // Activated when crossing boss door at 3450
      shootCooldown: 120, // 2.0s = 120 frames at 60fps
      shootTimer: 120,
      stateTimer: 0,
      actionState: 'guard',
      invincibleTimer: 0,
      stunTimer: 0,
      shieldActive: true,
      isBoss: true,
      phase: 1,
      jumpCooldown: 90,
      dashCooldown: 140
    }
  ];

  const pickups: Pickup[] = [
    { id: 's2-hp-1', type: 'HP_SMALL', x: 450, y: 300, width: 20, height: 20, vy: 0, collected: false },
    { id: 's2-ec-1', type: 'E_CRYSTAL', x: 890, y: 430, width: 22, height: 22, vy: 0, collected: false },
    { id: 's2-hp-2', type: 'HP_LARGE', x: 1210, y: 510, width: 26, height: 26, vy: 0, collected: false },
    { id: 's2-ec-2', type: 'E_CRYSTAL', x: 1470, y: 90, width: 22, height: 22, vy: 0, collected: false },
    { id: 's2-hp-3', type: 'HP_LARGE', x: 2750, y: 270, width: 26, height: 26, vy: 0, collected: false },
    { id: 's2-ec-3', type: 'E_CRYSTAL', x: 3300, y: 510, width: 22, height: 22, vy: 0, collected: false }
  ];

  const radioTransmissions: RadioTransmission[] = [
    {
      id: 'stage2-intro',
      speaker: 'CIEL',
      message: 'Zero, you made it across! This is Sector 1: Neo Arcadia Citadel Highway. The Elite Shield Bearer Paladin has locked down the bridge!',
      avatar: '/src/assets/images/ciel_resistance_operator_1792300397019.jpg',
      duration: 6.0,
      triggerX: 100
    },
    {
      id: 'stage2-combat-tip',
      speaker: 'CIEL',
      message: 'Zero, remember: your Z-Saber can deflect incoming bullets! Combine Dash + Saber for a Piercing Charge Thrust, and Dash + Shield for a Shield Bash to stun enemies!',
      avatar: '/src/assets/images/ciel_resistance_operator_1792300397019.jpg',
      duration: 6.5,
      triggerX: 1100
    },
    {
      id: 'stage2-boss-warning',
      speaker: 'CIEL',
      message: 'WARNING! Commander Aegis Paladin approaches! He jumps, dashes, and snipes every 2 seconds! Use Shield Bash to stun him or Piercing Thrust to bypass his shield!',
      avatar: '/src/assets/images/ciel_resistance_operator_1792300397019.jpg',
      duration: 6.5,
      triggerX: 3350
    }
  ];

  return {
    id: 'sector-1',
    name: 'CITADEL HIGHWAY: BASTION BRIDGE',
    subtitle: 'Neo Arcadia Sector 1 · Aegis Paladin Stronghold',
    width: 4450,
    height: 700,
    playerSpawn: { x: 120, y: 470 },
    platforms,
    enemies,
    pickups,
    radioTransmissions,
    bossRoomX: 3450
  };
}

export function getBossRushLevel(): LevelData {
  const platforms: Platform[] = [
    { x: 0, y: 550, width: 1200, height: 150, type: 'SOLID' },
    { x: -50, y: 0, width: 50, height: 700, type: 'SOLID' },
    { x: 1200, y: 0, width: 50, height: 700, type: 'SOLID' },
    { x: 0, y: -50, width: 1250, height: 50, type: 'SOLID' },
    // Arena dodge platforms
    { x: 120, y: 390, width: 140, height: 20, type: 'ONE_WAY' },
    { x: 940, y: 390, width: 140, height: 20, type: 'ONE_WAY' },
    { x: 530, y: 300, width: 140, height: 20, type: 'ONE_WAY' }
  ];

  const enemies: Enemy[] = [
    {
      id: 'boss-aegis-rush',
      type: 'BOSS_AEGIS_PALADIN',
      x: 880,
      y: 470,
      vx: 0,
      vy: 0,
      width: 44,
      height: 64,
      facing: -1,
      hp: 320,
      maxHp: 320,
      grounded: true,
      active: true,
      shootCooldown: 120,
      shootTimer: 120,
      stateTimer: 0,
      actionState: 'guard',
      invincibleTimer: 0,
      stunTimer: 0,
      shieldActive: true,
      isBoss: true,
      phase: 1,
      jumpCooldown: 70,
      dashCooldown: 110
    }
  ];

  const pickups: Pickup[] = [
    { id: 'hp-rush-1', type: 'HP_LARGE', x: 180, y: 350, width: 26, height: 26, vy: 0, collected: false },
    { id: 'hp-rush-2', type: 'HP_LARGE', x: 1000, y: 350, width: 26, height: 26, vy: 0, collected: false }
  ];

  const radioTransmissions: RadioTransmission[] = [
    {
      id: 'rush-intro',
      speaker: 'CIEL',
      message: 'Zero, battle simulation against Commander Aegis Paladin initialized! Stun his shield with Shield Bash and strike!',
      avatar: '/src/assets/images/ciel_resistance_operator_1792300397019.jpg',
      duration: 4.5,
      triggerX: 0
    }
  ];

  return {
    id: 'boss-rush',
    name: 'BOSS DUEL: AEGIS PALADIN',
    subtitle: 'Neo Arcadia Shield Bearer Vanguard',
    width: 1200,
    height: 700,
    playerSpawn: { x: 220, y: 470 },
    platforms,
    enemies,
    pickups,
    radioTransmissions,
    bossRoomX: 0
  };
}
