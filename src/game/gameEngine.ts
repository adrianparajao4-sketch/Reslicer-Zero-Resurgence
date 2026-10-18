import { sound } from '../audio/soundEngine';
import {
  Bullet,
  CyberElf,
  Enemy,
  GameMode,
  GameStatus,
  KeyBindingsMap,
  MissionStats,
  Particle,
  Pickup,
  Platform,
  PlayerGhost,
  PlayerState,
  RadioTransmission
} from '../types/game';
import { isActionActive, isActionJustTriggered, loadKeybindings } from './keybindings';
import { getBossRushLevel, getStoryLevel, LevelData } from './levels';
import { circleRectIntersect, rectsIntersect, resolveEnemyCollisions, resolvePlayerCollisions } from './physics';
import { renderBullet, renderEnemy, renderParticle, renderPickup, renderPlayer, renderPlayerGhost } from './sprites';

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public status: GameStatus = 'TITLE';
  public mode: GameMode = 'STORY';
  public currentLevel!: LevelData;

  // Keybindings
  public keybindings: KeyBindingsMap = loadKeybindings();

  // Camera
  public cameraX = 0;
  public cameraY = 0;
  public screenShake = 0;
  public hitStopFrames = 0;

  // Player State
  public player!: PlayerState;
  public ghosts: PlayerGhost[] = [];

  // Entities
  public bullets: Bullet[] = [];
  public particles: Particle[] = [];
  public enemies: Enemy[] = [];
  public platforms: Platform[] = [];
  public pickups: Pickup[] = [];

  // Active Radio Codec
  public activeTransmission: RadioTransmission | null = null;
  public transmissionTimer = 0;

  // Boss Warning State
  public bossWarningActive = false;
  public bossWarningTimer = 0;

  // Cyber Elves
  public elves: CyberElf[] = [
    {
      id: 'winkie',
      name: 'WINKIE',
      type: 'NURSE',
      description: 'Nurse Elf that automatically restores 50% HP when life drops to critical level.',
      effect: 'Auto-Revive / Emergency Heal',
      unlocked: false,
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
  ];

  // Stats
  public stats: MissionStats = {
    timeElapsed: 0,
    enemiesDefeated: 0,
    totalEnemies: 0,
    damageTaken: 0,
    retries: 0,
    elvesUsed: 0,
    score: 100,
    rank: 'S',
    title: 'Legendary Reploid'
  };

  public eCrystals = 120;

  // Input states
  public keys: Record<string, boolean> = {};
  private prevKeys: Record<string, boolean> = {};

  // Background Image
  public cityBackdrop: HTMLImageElement | null = null;

  // Callbacks for React state
  public onStateChange?: (status: GameStatus) => void;
  public onStatsUpdate?: (stats: MissionStats) => void;
  public onTransmission?: (msg: RadioTransmission | null) => void;

  private animationFrameId: number | null = null;
  private lastTime = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // Load backdrop image
    const img = new Image();
    img.src = '/src/assets/images/zero_cyber_city_backdrop_1792300395361.jpg';
    img.onload = () => {
      this.cityBackdrop = img;
    };

    this.initPlayer();
  }

  public initPlayer(spawnX = 120, spawnY = 470) {
    const hasDoubleJump = this.isElfActive('turbo');

    this.player = {
      x: spawnX,
      y: spawnY,
      vx: 0,
      vy: 0,
      width: 32,
      height: 48,
      facing: 1,
      grounded: true,
      onWall: 0,
      isDashing: false,
      dashTimer: 0,
      jumpCount: 0,
      maxJumps: hasDoubleJump ? 2 : 1,

      hp: 32,
      maxHp: 32,
      subTankHp: 32,
      invincibleTimer: 0,

      currentWeapon: 'SABER',
      chargeTime: 0,
      isCharging: false,
      attackCooldown: 0,
      comboStep: 0,
      comboTimer: 0,
      isSlashing: false,
      slashTimer: 0,
      slashType: 'SLASH_1',
      shieldActive: false,

      ponytailAngle: 0,
      state: 'idle',
      animationFrame: 0
    };
  }

  public startMission(mode: GameMode = 'STORY') {
    this.mode = mode;
    this.currentLevel = mode === 'STORY' ? getStoryLevel() : getBossRushLevel();
    this.platforms = [...this.currentLevel.platforms];
    this.enemies = JSON.parse(JSON.stringify(this.currentLevel.enemies));
    this.pickups = JSON.parse(JSON.stringify(this.currentLevel.pickups));
    this.bullets = [];
    this.particles = [];
    this.ghosts = [];

    this.initPlayer(this.currentLevel.playerSpawn.x, this.currentLevel.playerSpawn.y);

    this.stats = {
      timeElapsed: 0,
      enemiesDefeated: 0,
      totalEnemies: this.enemies.length,
      damageTaken: 0,
      retries: this.stats.retries,
      elvesUsed: 0,
      score: 100,
      rank: 'S',
      title: 'Legendary Reploid'
    };

    this.bossWarningActive = false;
    this.bossWarningTimer = 0;
    this.setStatus('PLAYING');

    sound.playMusic(mode === 'BOSS_RUSH' ? 'BOSS' : 'STAGE');

    if (!this.animationFrameId) {
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }
  }

  public updateKeybindings(newBindings: KeyBindingsMap) {
    this.keybindings = newBindings;
  }

  public restartCurrentLevel() {
    this.stats.retries++;
    this.startMission(this.mode);
  }

  public setStatus(s: GameStatus) {
    this.status = s;
    if (this.onStateChange) this.onStateChange(s);
  }

  public isElfActive(id: string): boolean {
    const elf = this.elves.find((e) => e.id === id);
    return !!(elf && elf.unlocked && elf.active);
  }

  // ==========================================
  // MAIN GAME LOOP
  // ==========================================

  private loop = (currentTime: number) => {
    this.animationFrameId = requestAnimationFrame(this.loop);
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (this.status === 'PLAYING' || this.status === 'BOSS_INTRO') {
      if (this.hitStopFrames > 0) {
        this.hitStopFrames--;
      } else {
        this.update(dt);
      }
    }

    this.render();
  };

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    sound.stopMusic();
    sound.stopChargeHum();
  }

  // ==========================================
  // UPDATE LOGIC
  // ==========================================

  private update(dt: number) {
    this.stats.timeElapsed += dt;

    if (this.screenShake > 0) {
      this.screenShake -= dt * 25;
      if (this.screenShake < 0) this.screenShake = 0;
    }

    // Radio Transmission timer
    if (this.activeTransmission) {
      this.transmissionTimer -= dt;
      if (this.transmissionTimer <= 0) {
        this.activeTransmission = null;
        if (this.onTransmission) this.onTransmission(null);
      }
    }

    // Check level radio triggers
    for (const t of this.currentLevel.radioTransmissions) {
      if (!t.hasTriggered && t.triggerX !== undefined && this.player.x >= t.triggerX) {
        t.hasTriggered = true;
        this.triggerTransmission(t);
        break;
      }
    }

    // Boss Warning Sequence
    if (this.bossWarningActive) {
      this.bossWarningTimer -= dt;
      if (Math.floor(this.bossWarningTimer * 4) % 2 === 0) {
        // Warning flash
      }
      if (this.bossWarningTimer <= 0) {
        this.bossWarningActive = false;
        this.setStatus('PLAYING');
        sound.playMusic('BOSS');
        // Activate boss
        const boss = this.enemies.find((e) => e.isBoss);
        if (boss) boss.active = true;
      }
      return;
    }

    // Update Holographic After-Image Ghosts
    for (let i = this.ghosts.length - 1; i >= 0; i--) {
      this.ghosts[i].alpha -= dt * 3.5;
      if (this.ghosts[i].alpha <= 0) {
        this.ghosts.splice(i, 1);
      }
    }

    this.updatePlayer(dt);
    this.updateBullets(dt);
    this.updateEnemies(dt);
    this.updatePickups(dt);
    this.updateParticles(dt);

    // Update Camera (Smooth tracking with look-ahead)
    const targetCamX = this.player.x - this.canvas.width / 2 + this.player.facing * 80;
    const targetCamY = Math.max(0, Math.min(this.player.y - this.canvas.height / 2, this.currentLevel.height - this.canvas.height));

    this.cameraX += (targetCamX - this.cameraX) * 0.12;
    this.cameraY += (targetCamY - this.cameraY) * 0.12;

    // Clamp camera within level bounds
    const maxCamX = Math.max(0, this.currentLevel.width - this.canvas.width);
    const maxCamY = Math.max(0, this.currentLevel.height - this.canvas.height);
    this.cameraX = Math.max(0, Math.min(this.cameraX, maxCamX));
    this.cameraY = Math.max(0, Math.min(this.cameraY, maxCamY));

    // Save previous keys
    this.prevKeys = { ...this.keys };
  }

  private triggerTransmission(t: RadioTransmission) {
    this.activeTransmission = t;
    this.transmissionTimer = t.duration;
    sound.playCodecBeep();
    if (this.onTransmission) this.onTransmission(t);
  }

  // ==========================================
  // PLAYER UPDATE
  // ==========================================

  private updatePlayer(dt: number) {
    const p = this.player;
    p.animationFrame++;

    if (p.invincibleTimer > 0) p.invincibleTimer--;
    if (p.attackCooldown > 0) p.attackCooldown--;

    const isTurbo = this.isElfActive('turbo');
    const runMaxSpeed = isTurbo ? 5.8 : 5.0;
    const dashMaxSpeed = isTurbo ? 11.5 : 9.5;
    const accel = 0.8;
    const friction = 0.82;

    // Dynamic input checking using customizable Keybindings
    const leftPressed = isActionActive('left', this.keys, this.keybindings);
    const rightPressed = isActionActive('right', this.keys, this.keybindings);
    const downPressed = isActionActive('down', this.keys, this.keybindings);
    const jumpPressed = isActionActive('jump', this.keys, this.keybindings);
    const jumpJustPressed = isActionJustTriggered('jump', this.keys, this.prevKeys, this.keybindings);
    const dashPressed = isActionActive('dash', this.keys, this.keybindings);
    const dashJustPressed = isActionJustTriggered('dash', this.keys, this.prevKeys, this.keybindings);
    const attackPressed = isActionActive('attack', this.keys, this.keybindings);
    const saberJustPressed = isActionJustTriggered('saber', this.keys, this.prevKeys, this.keybindings);
    const shieldPressed = isActionActive('shield', this.keys, this.keybindings);

    // Spawn after-image ghost during dash or high-speed slashes
    if ((p.isDashing || p.isSlashing) && p.animationFrame % 3 === 0) {
      this.ghosts.push({
        x: p.x,
        y: p.y,
        facing: p.facing,
        state: p.state,
        isSlashing: p.isSlashing,
        slashType: p.slashType,
        comboStep: p.comboStep,
        alpha: 0.55,
        color: p.isSlashing ? 'rgba(52, 211, 153, 0.45)' : 'rgba(56, 189, 248, 0.45)'
      });
      if (this.ghosts.length > 8) {
        this.ghosts.shift();
      }
    }

    // 1. Dash Mechanism
    if (dashJustPressed && p.grounded && !p.isDashing) {
      p.isDashing = true;
      p.dashTimer = 22; // ~0.36 sec
      sound.playDash();
      this.createDashParticles(p.x, p.y + p.height - 4, p.facing);
    }

    if (p.isDashing) {
      p.dashTimer--;
      p.vx = p.facing * dashMaxSpeed;

      // Spawn dash trail particles every 3 frames
      if (p.animationFrame % 3 === 0) {
        this.particles.push({
          id: Math.random().toString(),
          x: p.x + p.width / 2 - p.facing * 12,
          y: p.y + p.height / 2,
          vx: -p.facing * 1.5,
          vy: (Math.random() - 0.5) * 1.2,
          life: 14,
          maxLife: 14,
          size: 6,
          color: 'rgba(56, 189, 248, 0.65)',
          shape: 'smoke'
        });
      }

      if (p.dashTimer <= 0 || (!leftPressed && !rightPressed && !dashPressed)) {
        p.isDashing = false;
      }
    } else {
      // Normal Horizontal Running Movement
      if (leftPressed && !rightPressed) {
        p.vx = Math.max(p.vx - accel, -runMaxSpeed);
        p.facing = -1;
      } else if (rightPressed && !leftPressed) {
        p.vx = Math.min(p.vx + accel, runMaxSpeed);
        p.facing = 1;
      } else {
        p.vx *= friction;
        if (Math.abs(p.vx) < 0.1) p.vx = 0;
      }
    }

    // 2. Jumping & Wall-Jumping
    if (jumpJustPressed) {
      if (p.grounded) {
        // Ground Jump (preserves dash speed if dashing!)
        p.vy = -11.0;
        p.grounded = false;
        p.jumpCount = 1;
        sound.playJump();
        this.createJumpParticles(p.x + p.width / 2, p.y + p.height);
      } else if (p.onWall !== 0) {
        // Wall-Jump Kick!
        p.vy = -10.5;
        p.vx = -p.onWall * 8.0;
        p.facing = p.onWall === 1 ? -1 : 1;
        p.onWall = 0;
        sound.playJump();
        this.createWallSparks(p.x + (p.facing === 1 ? 0 : p.width), p.y + 20, p.facing);
      } else if (p.jumpCount < p.maxJumps) {
        // Double Jump (Turbo Elf)
        p.vy = -10.0;
        p.jumpCount++;
        sound.playJump();
        this.createJumpParticles(p.x + p.width / 2, p.y + p.height);
      }
    }

    // Variable jump height: release early cuts jump velocity
    if (!jumpPressed && p.vy < -4) {
      p.vy = -4;
    }

    // 3. Gravity & Wall Slide
    const gravity = 0.52;
    p.vy += gravity;

    // Wall slide check
    if (!p.grounded && p.onWall !== 0 && p.vy > 0) {
      // Clamp wall slide descent speed
      p.vy = Math.min(p.vy, 2.0);
      p.state = 'wall_slide';

      if (p.animationFrame % 4 === 0) {
        sound.playWallSlide();
        this.createWallSparks(p.x + (p.onWall === 1 ? p.width : 0), p.y + p.height - 10, p.onWall);
      }
    }

    // Update Position
    p.x += p.vx;
    p.y += p.vy;

    // Resolve Collisions with platforms
    const isDroppingDown = downPressed && jumpJustPressed;
    const { hitSpike, wallSlideSide } = resolvePlayerCollisions(p, this.platforms, isDroppingDown);

    p.onWall = wallSlideSide;
    if (p.grounded) {
      p.jumpCount = 0;
    }

    // Check Fall into Bottomless Pit (Below floor boundary)
    if (p.y > this.currentLevel.height - 70 || p.y > 630) {
      this.damagePlayer(999, 'Bottomless Pit');
      return;
    }

    // Check Spike Trap Damage (Instant KO)
    if (hitSpike) {
      this.damagePlayer(999, 'Spike Trap');
      return;
    }

    // Check Boss Shutter Door Transition
    if (p.x >= this.currentLevel.bossRoomX && !this.bossWarningActive) {
      const boss = this.enemies.find((e) => e.isBoss);
      if (boss && !boss.active && this.bossWarningTimer <= 0) {
        this.bossWarningActive = true;
        this.bossWarningTimer = 3.5;
        this.setStatus('BOSS_INTRO');
        sound.playBossAlarm();
        this.screenShake = 12;
      }
    }

    // 4. Combat: Z-Saber Slashing
    if (p.isSlashing) {
      p.slashTimer--;
      if (p.slashTimer <= 0) {
        p.isSlashing = false;
      }
    }

    // Combo chaining timer
    if (p.comboTimer > 0) {
      p.comboTimer--;
      if (p.comboTimer <= 0) {
        p.comboStep = 0;
      }
    }

    if (saberJustPressed && p.attackCooldown <= 0) {
      this.executeSaberAttack();
    }

    // 5. Combat: Buster Charge & Shoot
    if (attackPressed && !p.isSlashing) {
      p.chargeTime++;
      p.isCharging = true;
      if (p.chargeTime === 20) {
        sound.startChargeHum();
      }
    } else {
      if (p.isCharging) {
        // Release charged shot or normal shot!
        if (p.chargeTime > 75) {
          this.fireBusterShot(3);
        } else if (p.chargeTime > 35) {
          this.fireBusterShot(2);
        } else if (p.chargeTime > 0) {
          this.fireBusterShot(1);
        }
        p.chargeTime = 0;
        p.isCharging = false;
        sound.stopChargeHum();
      }
    }

    // 6. Shield Boomerang
    p.shieldActive = shieldPressed && !p.isSlashing;

    // 7. Determine Player State
    if (p.isSlashing) {
      p.state = 'slash';
    } else if (p.onWall !== 0 && !p.grounded) {
      p.state = 'wall_slide';
    } else if (p.isDashing) {
      p.state = 'dash';
    } else if (!p.grounded) {
      p.state = p.vy < 0 ? 'jump' : 'fall';
    } else if (Math.abs(p.vx) > 0.4) {
      p.state = 'run';
    } else {
      p.state = 'idle';
    }

    // Auto-heal with Winkie Elf if low HP
    if (p.hp <= 8 && this.isElfActive('winkie') && p.hp > 0) {
      const elf = this.elves.find((e) => e.id === 'winkie');
      if (elf) {
        elf.active = false; // single use per mission
        p.hp = Math.min(p.maxHp, p.hp + 16);
        this.stats.elvesUsed++;
        sound.playPickup();
        this.createHealAura(p.x + p.width / 2, p.y + p.height / 2);
      }
    }
  }

  private executeSaberAttack() {
    const p = this.player;
    p.isSlashing = true;
    p.attackCooldown = 14;

    const isKelpie = this.isElfActive('kelpie');
    const damageMultiplier = isKelpie ? 1.35 : 1.0;

    let slashType: PlayerState['slashType'] = 'SLASH_1';
    let baseDamage = 32;

    if (p.isDashing) {
      slashType = 'DASH_SLASH';
      baseDamage = 45;
      p.slashTimer = 16;
      sound.playSaberSlash(3);
    } else if (!p.grounded) {
      slashType = 'AIR_SPIN';
      baseDamage = 38;
      p.slashTimer = 18;
      sound.playSaberSlash(2);
    } else {
      // 3-hit combo chain
      p.comboStep = (p.comboStep % 3) + 1;
      p.comboTimer = 28;
      if (p.comboStep === 3) {
        slashType = 'SLASH_3';
        baseDamage = 52;
        p.slashTimer = 18;
        this.screenShake = 5;
        sound.playSaberSlash(3);
      } else if (p.comboStep === 2) {
        slashType = 'SLASH_2';
        baseDamage = 38;
        p.slashTimer = 14;
        sound.playSaberSlash(2);
      } else {
        slashType = 'SLASH_1';
        baseDamage = 30;
        p.slashTimer = 12;
        sound.playSaberSlash(1);
      }
    }

    p.slashType = slashType;
    const finalDamage = Math.round(baseDamage * damageMultiplier);

    // Hitbox for Z-Saber
    const reach = slashType === 'DASH_SLASH' ? 70 : slashType === 'AIR_SPIN' ? 55 : 50;
    const slashRect = {
      x: p.facing === 1 ? p.x + p.width : p.x - reach,
      y: p.y - 12,
      width: reach,
      height: p.height + 24
    };

    // Check hit against breakable platforms
    for (const plat of this.platforms) {
      if (plat.type === 'BREAKABLE' && rectsIntersect(slashRect, plat)) {
        plat.hp = (plat.hp || 40) - finalDamage;
        this.createExplosion(plat.x + plat.width / 2, plat.y + plat.height / 2, false);
        if (plat.hp <= 0) {
          const idx = this.platforms.indexOf(plat);
          if (idx !== -1) this.platforms.splice(idx, 1);
          sound.playExplosion(true);
        }
      }
    }

    // Check hit against enemies
    for (const enemy of this.enemies) {
      if (!enemy.active || enemy.hp <= 0) continue;

      if (rectsIntersect(slashRect, enemy)) {
        this.damageEnemy(enemy, finalDamage, true);
        sound.playSaberHit();
        this.hitStopFrames = 2; // Impact crunch frame
        this.screenShake = Math.max(this.screenShake, 4);

        // Sparks & slash arc particles
        this.particles.push({
          id: Math.random().toString(),
          x: enemy.x + enemy.width / 2,
          y: enemy.y + enemy.height / 2,
          vx: p.facing * 3,
          vy: -2,
          life: 12,
          maxLife: 12,
          size: 18,
          color: '#34D399',
          shape: 'slash_wave'
        });
      }
    }
  }

  private fireBusterShot(level: 1 | 2 | 3) {
    const p = this.player;
    const speed = level === 3 ? 12 : level === 2 ? 10.5 : 9;
    const radius = level === 3 ? 16 : level === 2 ? 9 : 4.5;
    const damage = level === 3 ? 55 : level === 2 ? 30 : 14;

    const bullet: Bullet = {
      id: Math.random().toString(),
      x: p.x + (p.facing === 1 ? p.width + 8 : -8),
      y: p.y + 20,
      vx: p.facing * speed,
      vy: 0,
      radius,
      damage,
      fromPlayer: true,
      type: level === 3 ? 'BUSTER_LV3' : level === 2 ? 'BUSTER_LV2' : 'BUSTER_NORMAL',
      piercing: level >= 2,
      life: 70
    };

    this.bullets.push(bullet);

    if (level === 1) {
      sound.playBusterShoot();
    } else {
      sound.playChargedShot(level);
      this.screenShake = level === 3 ? 6 : 2;
    }
  }

  // ==========================================
  // BULLETS UPDATE
  // ==========================================

  private updateBullets(dt: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      if (b.life <= 0) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Player bullet collision with enemies
      if (b.fromPlayer) {
        for (const enemy of this.enemies) {
          if (!enemy.active || enemy.hp <= 0) continue;

          if (circleRectIntersect(b.x, b.y, b.radius, enemy)) {
            this.damageEnemy(enemy, b.damage, false);
            this.createHitSparks(b.x, b.y, '#FDE047');

            if (!b.piercing) {
              this.bullets.splice(i, 1);
              break;
            }
          }
        }
      } else {
        // Enemy bullet collision with player
        if (circleRectIntersect(b.x, b.y, b.radius, this.player)) {
          // Check if shielded by Shield Boomerang
          if (this.player.shieldActive && this.player.facing * b.vx < 0) {
            // Deflect bullet!
            b.fromPlayer = true;
            b.vx = -b.vx * 1.5;
            sound.playSaberHit();
            this.createHitSparks(b.x, b.y, '#34D399');
            continue;
          }

          if (this.player.invincibleTimer <= 0) {
            this.damagePlayer(b.damage, 'Enemy Fire');
            this.bullets.splice(i, 1);
          }
        }
      }
    }
  }

  // ==========================================
  // ENEMIES UPDATE
  // ==========================================

  private updateEnemies(dt: number) {
    const p = this.player;

    for (const e of this.enemies) {
      if (!e.active) continue;

      if (e.invincibleTimer > 0) e.invincibleTimer--;

      const distToPlayer = Math.hypot(p.x - e.x, p.y - e.y);

      // AI Logic by Enemy Type
      if (e.type === 'PANTHEON_HUNTER') {
        e.facing = p.x > e.x ? 1 : -1;
        e.shootCooldown--;

        // Aim & Shoot 3-round burst when in range
        if (distToPlayer < 450 && e.shootCooldown <= 0) {
          e.shootCooldown = 110;
          sound.playBusterShoot();
          this.bullets.push({
            id: Math.random().toString(),
            x: e.x + (e.facing === 1 ? e.width + 6 : -6),
            y: e.y + 22,
            vx: e.facing * 5.5,
            vy: 0,
            radius: 4,
            damage: 8,
            fromPlayer: false,
            type: 'ENEMY_BULLET',
            life: 80
          });
        }
      } else if (e.type === 'MECHANILOID_HOUND') {
        // Stalk and pounce towards player
        e.facing = p.x > e.x ? 1 : -1;
        e.shootCooldown--;

        if (distToPlayer < 320 && e.grounded && e.shootCooldown <= 0) {
          e.shootCooldown = 90;
          e.vx = e.facing * 7.0;
          e.vy = -7.5;
          e.grounded = false;
        }

        e.vy += 0.45;
        e.x += e.vx;
        e.y += e.vy;
        e.vx *= 0.94;
        resolveEnemyCollisions(e, this.platforms);
      } else if (e.type === 'FLYING_DRONE') {
        // Hover above player and shoot downward lasers
        const targetX = p.x + Math.sin(Date.now() / 300) * 80;
        e.vx += (targetX - e.x) * 0.02;
        e.vx = Math.max(-3, Math.min(3, e.vx));
        e.x += e.vx;

        e.shootCooldown--;
        if (Math.abs(p.x - e.x) < 50 && e.shootCooldown <= 0) {
          e.shootCooldown = 100;
          this.bullets.push({
            id: Math.random().toString(),
            x: e.x + e.width / 2,
            y: e.y + e.height,
            vx: 0,
            vy: 6.5,
            radius: 5,
            damage: 10,
            fromPlayer: false,
            type: 'ENEMY_BULLET',
            life: 60
          });
        }
      } else if (e.type === 'SPIKY_ROLLER') {
        // Patrol back and forth
        e.x += e.vx;
        resolveEnemyCollisions(e, this.platforms);
      } else if (e.type === 'BOSS_GOLEM') {
        this.updateGolemBoss(e, dt);
      }

      // Contact damage with player
      if (rectsIntersect(p, e) && p.invincibleTimer <= 0) {
        const contactDmg = e.isBoss ? 14 : 8;
        this.damagePlayer(contactDmg, `${e.type} Collision`);
      }
    }
  }

  private updateGolemBoss(boss: Enemy, dt: number) {
    const p = this.player;
    boss.facing = p.x > boss.x ? 1 : -1;
    boss.stateTimer++;

    // Boss attack phases
    const isEnraged = boss.hp < boss.maxHp * 0.45;
    const cycleDuration = isEnraged ? 180 : 260;
    const step = boss.stateTimer % cycleDuration;

    // Attack 1: Ground Fist Slam with Ceiling Rubble
    if (step === 40) {
      sound.playExplosion(true);
      this.screenShake = 12;

      // Drop falling ceiling rubble debris across arena
      for (let i = 0; i < 4; i++) {
        const dropX = boss.x - 300 + Math.random() * 600;
        this.bullets.push({
          id: Math.random().toString(),
          x: dropX,
          y: 20,
          vx: 0,
          vy: 6.0 + Math.random() * 2,
          radius: 12,
          damage: 10,
          fromPlayer: false,
          type: 'BOSS_RUBBLE',
          life: 90
        });
      }
    }

    // Attack 2: Sweeping Optic Laser Cannon (Zero must wall-slide/jump over!)
    if (step === 110) {
      sound.playBossAlarm();
      const beamDir = boss.facing;
      this.bullets.push({
        id: Math.random().toString(),
        x: boss.x + (beamDir === 1 ? boss.width + 120 : -120),
        y: boss.y + 45,
        vx: beamDir * 18,
        vy: 0,
        radius: 140,
        damage: 18,
        fromPlayer: false,
        type: 'BOSS_LASER',
        life: 45
      });
    }

    // Attack 3: Enraged Missile Spread
    if (isEnraged && step === 190) {
      for (let ang = -0.4; ang <= 0.4; ang += 0.25) {
        this.bullets.push({
          id: Math.random().toString(),
          x: boss.x + (boss.facing === 1 ? boss.width : 0),
          y: boss.y + 20,
          vx: boss.facing * Math.cos(ang) * 6,
          vy: Math.sin(ang) * 6,
          radius: 6,
          damage: 12,
          fromPlayer: false,
          type: 'ENEMY_BULLET',
          life: 70
        });
      }
    }
  }

  // ==========================================
  // DAMAGE & COMBAT CALCULATIONS
  // ==========================================

  public damageEnemy(enemy: Enemy, damage: number, isSaber: boolean) {
    enemy.hp -= damage;
    enemy.invincibleTimer = 8;

    if (enemy.hp <= 0) {
      enemy.active = false;
      this.stats.enemiesDefeated++;
      sound.playExplosion(enemy.isBoss);

      // Boss Defeated!
      if (enemy.isBoss) {
        this.screenShake = 20;
        this.triggerStageClear();
        return;
      }

      // Drop pickups
      if (Math.random() < 0.45) {
        this.pickups.push({
          id: Math.random().toString(),
          type: Math.random() < 0.6 ? 'E_CRYSTAL' : 'HP_SMALL',
          x: enemy.x + enemy.width / 2,
          y: enemy.y + enemy.height / 2,
          width: 20,
          height: 20,
          vy: -3,
          collected: false
        });
      }

      this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, false);
    }
  }

  public damagePlayer(damage: number, reason: string) {
    const p = this.player;
    if (this.status === 'GAME_OVER') return;

    const isInstantKill = damage >= 999 || reason.includes('Pit') || reason.includes('Spike');

    if (isInstantKill) {
      p.hp = 0;
      this.stats.damageTaken += 32;
      sound.playHurt();
      sound.playExplosion(true);
      this.screenShake = 16;
      this.createExplosion(p.x + p.width / 2, Math.min(p.y + p.height / 2, 600), true);
      this.setStatus('GAME_OVER');
      sound.stopMusic();
      return;
    }

    if (p.invincibleTimer > 0) return;

    p.hp -= damage;
    p.invincibleTimer = 45; // 0.75s invulnerability
    this.stats.damageTaken += damage;
    sound.playHurt();
    this.screenShake = 8;

    this.createHitSparks(p.x + p.width / 2, p.y + p.height / 2, '#EF4444');

    if (p.hp <= 0) {
      p.hp = 0;
      this.setStatus('GAME_OVER');
      sound.playExplosion(true);
      sound.stopMusic();
    }
  }

  // ==========================================
  // PICKUPS UPDATE
  // ==========================================

  private updatePickups(dt: number) {
    const p = this.player;

    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const item = this.pickups[i];
      if (item.collected) continue;

      if (rectsIntersect(p, item)) {
        item.collected = true;
        sound.playPickup();

        if (item.type === 'HP_SMALL') {
          p.hp = Math.min(p.maxHp, p.hp + 6);
        } else if (item.type === 'HP_LARGE') {
          p.hp = Math.min(p.maxHp, p.hp + 16);
        } else if (item.type === 'E_CRYSTAL') {
          this.eCrystals += 20;
        } else if (item.type === 'CYBER_ELF' && item.elfId) {
          const elf = this.elves.find((e) => e.id === item.elfId);
          if (elf) {
            elf.unlocked = true;
            this.triggerTransmission({
              id: 'elf-acquired',
              speaker: 'CIEL',
              message: `Cyber-Elf [${elf.name}] rescued! Go to Elf Sanctuary to activate its abilities!`,
              avatar: '/src/assets/images/ciel_resistance_operator_1792300397019.jpg',
              duration: 5.0
            });
          }
        }

        this.pickups.splice(i, 1);
      }
    }
  }

  // ==========================================
  // PARTICLES UPDATE
  // ==========================================

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;

      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private createDashParticles(x: number, y: number, facing: number) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        id: Math.random().toString(),
        x,
        y: y - Math.random() * 8,
        vx: -facing * (2 + Math.random() * 3),
        vy: -Math.random() * 2,
        life: 14,
        maxLife: 14,
        size: 4 + Math.random() * 4,
        color: '#E0E7FF',
        shape: 'smoke'
      });
    }
  }

  private createJumpParticles(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        id: Math.random().toString(),
        x: x + (Math.random() - 0.5) * 16,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.random() * 2,
        life: 12,
        maxLife: 12,
        size: 3 + Math.random() * 3,
        color: '#E2E8F0',
        shape: 'smoke'
      });
    }
  }

  private createWallSparks(x: number, y: number, side: number) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        id: Math.random().toString(),
        x,
        y,
        vx: -side * (1 + Math.random() * 3),
        vy: Math.random() * 3 + 1,
        life: 8,
        maxLife: 8,
        size: 3,
        color: '#FDE047',
        shape: 'spark'
      });
    }
  }

  private createHitSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 6; i++) {
      const ang = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        life: 10,
        maxLife: 10,
        size: 4,
        color,
        shape: 'spark'
      });
    }
  }

  private createExplosion(x: number, y: number, large: boolean) {
    const count = large ? 16 : 8;
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 5;
      this.particles.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        life: 18,
        maxLife: 18,
        size: 6 + Math.random() * 6,
        color: i % 2 === 0 ? '#EF4444' : '#F59E0B',
        shape: 'flame'
      });
    }
  }

  private createHealAura(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        id: Math.random().toString(),
        x: x + (Math.random() - 0.5) * 30,
        y: y + 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -2 - Math.random() * 2,
        life: 25,
        maxLife: 25,
        size: 4,
        color: '#34D399',
        shape: 'circle'
      });
    }
  }

  // ==========================================
  // STAGE CLEAR & RANK EVALUATION
  // ==========================================

  private triggerStageClear() {
    this.setStatus('STAGE_CLEAR');
    sound.stopMusic();

    // Calculate Mega Man Zero Style Rank:
    // Base 100 points
    let points = 100;

    // Time penalty (par time: 90s for story, 45s for boss rush)
    const parTime = this.mode === 'STORY' ? 95 : 50;
    if (this.stats.timeElapsed > parTime) {
      const timeOver = Math.floor((this.stats.timeElapsed - parTime) / 5);
      points -= Math.min(25, timeOver * 3);
    }

    // Damage taken penalty
    const dmgPenalty = Math.floor(this.stats.damageTaken / 6);
    points -= Math.min(30, dmgPenalty * 2);

    // Retries penalty
    points -= this.stats.retries * 5;

    // Cyber-Elf usage penalty
    points -= this.stats.elvesUsed * 5;

    points = Math.max(20, Math.min(100, points));
    this.stats.score = points;

    if (points >= 96) {
      this.stats.rank = 'S';
      this.stats.title = 'Supreme Striker Zero';
    } else if (points >= 86) {
      this.stats.rank = 'A';
      this.stats.title = 'Master Reploid';
    } else if (points >= 75) {
      this.stats.rank = 'B';
      this.stats.title = 'Elite Vanguard';
    } else if (points >= 65) {
      this.stats.rank = 'C';
      this.stats.title = 'Resistance Soldier';
    } else if (points >= 50) {
      this.stats.rank = 'D';
      this.stats.title = 'Scout Unit';
    } else {
      this.stats.rank = 'F';
      this.stats.title = 'Damaged Reploid';
    }

    if (this.onStatsUpdate) this.onStatsUpdate(this.stats);
  }

  // ==========================================
  // CANVAS RENDERING
  // ==========================================

  public render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.save();
    // Screen shake offset
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Parallax Background
    this.renderBackground(ctx, w, h);

    // 2. Camera Offset for World Entities
    ctx.save();
    ctx.translate(-Math.round(this.cameraX), -Math.round(this.cameraY));

    // Draw Platforms & Environment
    this.renderPlatforms(ctx);

    // Draw Pickups
    for (const item of this.pickups) {
      renderPickup(ctx, item);
    }

    // Draw Enemies
    for (const enemy of this.enemies) {
      if (enemy.active) {
        renderEnemy(ctx, enemy);
      }
    }

    // Draw Holographic After-Image Ghosts
    for (const ghost of this.ghosts) {
      renderPlayerGhost(ctx, ghost);
    }

    // Draw Player
    if (this.player.hp > 0) {
      renderPlayer(ctx, this.player);
    }

    // Draw Bullets
    for (const bullet of this.bullets) {
      renderBullet(ctx, bullet);
    }

    // Draw Particles
    for (const pt of this.particles) {
      renderParticle(ctx, pt);
    }

    ctx.restore();

    // 3. Render HUD (Heads-up Display) in Screen Coordinates
    this.renderHUD(ctx, w, h);

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
    if (this.cityBackdrop && this.cityBackdrop.complete) {
      // Parallax scroll factor: 0.15
      const bgX = -(this.cameraX * 0.15) % w;
      ctx.drawImage(this.cityBackdrop, bgX, 0, w, h);
      if (bgX < 0) {
        ctx.drawImage(this.cityBackdrop, bgX + w, 0, w, h);
      }
      // Atmospheric dark sci-fi tint
      ctx.fillStyle = 'rgba(10, 15, 29, 0.45)';
      ctx.fillRect(0, 0, w, h);
    } else {
      // Fallback gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#0F172A');
      grad.addColorStop(1, '#1E1B4B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    // Industrial girder grid silhouette in mid-ground
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    const midX = -(this.cameraX * 0.4) % 240;
    for (let x = midX - 240; x < w + 240; x += 240) {
      ctx.fillRect(x, h - 350, 24, 350);
      ctx.fillRect(x - 60, h - 280, 160, 14);
    }
  }

  private renderPlatforms(ctx: CanvasRenderingContext2D) {
    for (const plat of this.platforms) {
      if (plat.type === 'SPIKE') {
        // Lethal hazard spikes
        ctx.fillStyle = '#EF4444';
        const spikeCount = Math.floor(plat.width / 14);
        for (let i = 0; i < spikeCount; i++) {
          const sx = plat.x + i * 14;
          ctx.beginPath();
          ctx.moveTo(sx, plat.y + plat.height);
          ctx.lineTo(sx + 7, plat.y);
          ctx.lineTo(sx + 14, plat.y + plat.height);
          ctx.closePath();
          ctx.fill();
        }
        continue;
      }

      if (plat.type === 'ONE_WAY') {
        // Floating cyber catwalk
        ctx.fillStyle = '#0284C7';
        ctx.fillRect(plat.x, plat.y, plat.width, 4);
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(plat.x, plat.y + 4, plat.width, plat.height - 4);
        continue;
      }

      if (plat.type === 'BREAKABLE') {
        // Cracked reinforced metal wall
        ctx.fillStyle = '#78350F';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.strokeStyle = '#D97706';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
        continue;
      }

      if (plat.type === 'DOOR') {
        // Security gate shutter
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        ctx.fillStyle = '#FEE2E2';
        for (let y = plat.y + 10; y < plat.y + plat.height; y += 20) {
          ctx.fillRect(plat.x + 4, y, plat.width - 8, 4);
        }
        continue;
      }

      // Default SOLID & MOVING Platforms
      ctx.fillStyle = plat.type === 'MOVING' ? '#0369A1' : '#1E293B';
      ctx.fillRect(plat.x, plat.y, plat.width, plat.height);

      // Top highlighted cyber edge
      ctx.fillStyle = plat.type === 'MOVING' ? '#38BDF8' : '#334155';
      ctx.fillRect(plat.x, plat.y, plat.width, 3);

      // Subtle tech rivets
      ctx.fillStyle = '#475569';
      for (let rx = plat.x + 20; rx < plat.x + plat.width - 10; rx += 40) {
        ctx.beginPath();
        ctx.arc(rx, plat.y + 12, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderHUD(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const p = this.player;

    // 1. Zero's Classic Segmented Vertical Life Bar (Upper Left)
    const barX = 24;
    const barY = 24;
    const barWidth = 14;
    const tickHeight = 3;
    const totalTicks = 32;

    // Border Frame
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(barX - 3, barY - 3, barWidth + 6, totalTicks * 4 + 6);
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX - 3, barY - 3, barWidth + 6, totalTicks * 4 + 6);

    // Segmented Ticks (fills from bottom to top)
    for (let i = 0; i < totalTicks; i++) {
      const isFilled = i < p.hp;
      const ty = barY + (totalTicks - 1 - i) * 4;

      if (isFilled) {
        // Green ticks, turning yellow/red when low HP
        ctx.fillStyle = p.hp > 10 ? '#22C55E' : p.hp > 5 ? '#F59E0B' : '#EF4444';
      } else {
        ctx.fillStyle = '#1E293B';
      }
      ctx.fillRect(barX, ty, barWidth, tickHeight);
    }

    // Zero Icon & Sub-Tank Indicator next to bar
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px "Chakra Petch", sans-serif';
    ctx.fillText('ZERO', barX + 22, barY + 12);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(`HP ${p.hp}/${p.maxHp}`, barX + 22, barY + 26);

    // E-Crystals
    ctx.fillStyle = '#38BDF8';
    ctx.fillText(`EC ${this.eCrystals}`, barX + 22, barY + 42);

    // 2. Boss Life Bar (Upper Right when Boss is Active)
    const boss = this.enemies.find((e) => e.isBoss && e.active);
    if (boss) {
      const bossBarX = w - 40;
      const bossBarY = 24;
      const bossTicks = 32;
      const bossFill = Math.ceil((boss.hp / boss.maxHp) * bossTicks);

      ctx.fillStyle = '#0F172A';
      ctx.fillRect(bossBarX - 3, bossBarY - 3, barWidth + 6, bossTicks * 4 + 6);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bossBarX - 3, bossBarY - 3, barWidth + 6, bossTicks * 4 + 6);

      for (let i = 0; i < bossTicks; i++) {
        const isFilled = i < bossFill;
        const ty = bossBarY + (bossTicks - 1 - i) * 4;
        ctx.fillStyle = isFilled ? '#EF4444' : '#1E293B';
        ctx.fillRect(bossBarX, ty, barWidth, tickHeight);
      }

      ctx.fillStyle = '#EF4444';
      ctx.font = 'bold 11px "Chakra Petch", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('GOLEM v1', bossBarX - 10, bossBarY + 12);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillText(`${boss.hp}/${boss.maxHp}`, bossBarX - 10, bossBarY + 26);
      ctx.textAlign = 'left';
    }

    // 3. Boss Warning Siren Overlay
    if (this.bossWarningActive) {
      const flash = Math.floor(Date.now() / 150) % 2 === 0;
      if (flash) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
        ctx.fillRect(0, 0, w, h);
      }

      // Red Warning Banner
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(0, h / 2 - 45, w, 90);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px "Chakra Petch", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('WARNING! EMERGENCY ALARM', w / 2, h / 2 - 6);
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillStyle = '#FEF08A';
      ctx.fillText('HEAVY MECHANILOID APPROACHING · ENGAGE COMBAT', w / 2, h / 2 + 22);
      ctx.textAlign = 'left';
    }
  }
}
