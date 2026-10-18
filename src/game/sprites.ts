import { Bullet, Enemy, Particle, Pickup, PlayerGhost, PlayerState } from '../types/game';

/**
 * High-performance vector sprite renderer with authentic Mega Man Zero styling.
 * Features multi-layered shading, dynamic ponytail strands, thruster plasma,
 * detailed reploid armor plates, and holographic after-image ghosts.
 */

export function renderPlayerGhost(ctx: CanvasRenderingContext2D, g: PlayerGhost) {
  ctx.save();
  ctx.translate(g.x + 16, g.y + 24);
  ctx.scale(g.facing, 1);
  ctx.globalAlpha = g.alpha;

  // Holographic After-Image Silhouette (Cyan or Crimson)
  ctx.fillStyle = g.color;
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 1;

  // Approximate silhouette
  ctx.beginPath();
  // Head & Ponytail
  ctx.arc(0, -22, 11, 0, Math.PI * 2);
  // Ponytail streamer
  ctx.moveTo(-8, -18);
  ctx.quadraticCurveTo(-24, -12, -36, 4);
  ctx.quadraticCurveTo(-18, 0, -8, -10);
  // Torso
  ctx.rect(-9, -8, 18, 20);
  // Legs
  ctx.rect(-12, 10, 8, 20);
  ctx.rect(2, 10, 8, 20);
  ctx.closePath();
  ctx.fill();

  // If slashing during ghost frame, draw the blade phantom
  if (g.isSlashing) {
    ctx.strokeStyle = '#34D399';
    ctx.lineWidth = 10;
    ctx.beginPath();
    if (g.slashType === 'AIR_SPIN') {
      ctx.arc(0, 0, 48, -Math.PI * 0.7, Math.PI * 0.7);
    } else {
      ctx.arc(16, 0, 44, -Math.PI * 0.4, Math.PI * 0.4);
    }
    ctx.stroke();
  }

  ctx.restore();
}

export function renderPlayer(ctx: CanvasRenderingContext2D, p: PlayerState) {
  ctx.save();
  ctx.translate(p.x + p.width / 2, p.y + p.height / 2);

  // Invincibility flashing
  if (p.invincibleTimer > 0 && Math.floor(p.invincibleTimer / 3) % 2 === 1) {
    ctx.restore();
    return;
  }

  // Facing direction
  ctx.scale(p.facing, 1);

  // 1. Charge Aura & Sparks
  if (p.isCharging && p.chargeTime > 18) {
    renderChargeAura(ctx, p);
  }

  // Animation parameters
  let tilt = 0;
  let bodyOffsetY = 0;
  let legSpread = 0;

  if (p.isDashing) {
    tilt = 0.36; // Aggressive forward dash angle
    bodyOffsetY = 7;
  } else if (p.state === 'run') {
    bodyOffsetY = Math.sin(p.animationFrame * 0.4) * 2;
    legSpread = Math.sin(p.animationFrame * 0.4) * 11;
  } else if (p.state === 'wall_slide') {
    tilt = -0.16;
  } else if (p.state === 'jump') {
    bodyOffsetY = -3;
    tilt = 0.12;
  } else if (p.state === 'fall') {
    bodyOffsetY = 1;
    tilt = 0.05;
  }

  ctx.rotate(tilt);

  // 2. Dash / Jump Booster Plasma Thrusters (Back & Heel Jets)
  if (p.isDashing || (p.state === 'jump' && p.vy < 0)) {
    renderBoosterFlames(ctx, p, bodyOffsetY);
  }

  // 3. Dynamic Flowing Blonde Ponytail (Multi-strand physics)
  renderDetailedPonytail(ctx, p, bodyOffsetY);

  // 4. Back Pauldron & Arm
  renderBackArm(ctx, p, bodyOffsetY);

  // 5. Reploid Undersuit & Contoured Torso
  renderDetailedTorso(ctx, p, bodyOffsetY);

  // 6. Detailed Reploid Boots & Greaves
  renderDetailedBoots(ctx, p, bodyOffsetY, legSpread);

  // 7. High-Detail Crimson Helmet & Visor
  renderDetailedHelmet(ctx, p, bodyOffsetY);

  // 8. Front Weapon / Arm & Z-Saber / Shield
  renderFrontWeaponArm(ctx, p, bodyOffsetY);

  ctx.restore();
}

function renderChargeAura(ctx: CanvasRenderingContext2D, p: PlayerState) {
  ctx.save();
  const chargeLevel = p.chargeTime > 75 ? 3 : p.chargeTime > 35 ? 2 : 1;
  const pulse = Math.sin(Date.now() / 50) * 5;
  const rad = 34 + pulse;

  const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, rad);
  if (chargeLevel === 3) {
    grad.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
    grad.addColorStop(0.6, 'rgba(249, 115, 22, 0.4)');
    grad.addColorStop(1, 'rgba(234, 179, 8, 0)');
  } else if (chargeLevel === 2) {
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
    grad.addColorStop(0.6, 'rgba(14, 165, 233, 0.35)');
    grad.addColorStop(1, 'rgba(2, 132, 199, 0)');
  } else {
    grad.addColorStop(0, 'rgba(34, 197, 94, 0.5)');
    grad.addColorStop(0.7, 'rgba(74, 222, 128, 0.3)');
    grad.addColorStop(1, 'rgba(34, 197, 94, 0)');
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, rad, 0, Math.PI * 2);
  ctx.fill();

  // Crackling electrical arcs
  const arcColor = chargeLevel === 3 ? '#FEF08A' : chargeLevel === 2 ? '#BAE6FD' : '#86EFAC';
  ctx.strokeStyle = arcColor;
  ctx.lineWidth = 1.5;
  const arcs = chargeLevel === 3 ? 5 : chargeLevel === 2 ? 3 : 2;
  for (let i = 0; i < arcs; i++) {
    const ang = Math.random() * Math.PI * 2;
    const dist = 18 + Math.random() * 16;
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang) * (dist - 12), Math.sin(ang) * (dist - 12));
    ctx.lineTo(Math.cos(ang + 0.1) * (dist - 4), Math.sin(ang + 0.1) * (dist - 4));
    ctx.lineTo(Math.cos(ang) * dist, Math.sin(ang) * dist);
    ctx.stroke();
  }

  ctx.restore();
}

function renderBoosterFlames(ctx: CanvasRenderingContext2D, p: PlayerState, bodyOffsetY: number) {
  ctx.save();
  const flameLength = p.isDashing ? 22 + Math.random() * 8 : 14 + Math.random() * 6;
  const flameX = -14;
  const flameY = -4 + bodyOffsetY;

  // Back thruster pack housing
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.fillRect(flameX + 2, flameY - 5, 5, 10);
  ctx.strokeRect(flameX + 2, flameY - 5, 5, 10);

  // Outer Cyan Plasma Flame
  ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
  ctx.beginPath();
  ctx.moveTo(flameX + 2, flameY - 4);
  ctx.lineTo(flameX - flameLength, flameY);
  ctx.lineTo(flameX + 2, flameY + 4);
  ctx.closePath();
  ctx.fill();

  // Inner White-hot Flame Core
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(flameX + 2, flameY - 2);
  ctx.lineTo(flameX - flameLength * 0.55, flameY);
  ctx.lineTo(flameX + 2, flameY + 2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function renderDetailedPonytail(ctx: CanvasRenderingContext2D, p: PlayerState, bodyOffsetY: number) {
  ctx.save();
  const hairBaseX = -7;
  const hairBaseY = -17 + bodyOffsetY;

  // Velocity-driven hair lag & wind matching BBLIR sprite sheet
  let windOffset = -14;
  let vertOffset = p.vy * 0.8;
  const sway = Math.sin(Date.now() / 110 + p.animationFrame * 0.12) * 5;

  if (p.isDashing) {
    // Low horizontal arrow stream when dashing
    windOffset = -42;
    vertOffset = -1;
  } else if (p.state === 'fall' || p.vy > 2) {
    // Iconic Mega Man Zero upward hair whip while falling
    windOffset = -18;
    vertOffset = -22 - Math.min(p.vy * 1.2, 16);
  } else if (p.state === 'run') {
    // Dynamic running wave
    windOffset = -26;
    vertOffset = Math.sin(p.animationFrame * 0.4) * 6;
  } else if (p.state === 'wall_slide') {
    // Hanging straight down against wall
    windOffset = -6;
    vertOffset = 18;
  }

  // Layer 1: Dark Amber Shadow Layer
  ctx.fillStyle = '#885000'; // BBLIR deep amber shadow
  ctx.beginPath();
  ctx.moveTo(hairBaseX, hairBaseY);
  ctx.bezierCurveTo(
    hairBaseX + windOffset * 0.45,
    hairBaseY - 6 + vertOffset + sway,
    hairBaseX + windOffset * 0.85,
    hairBaseY + 6 + vertOffset + sway,
    hairBaseX + windOffset * 1.35,
    hairBaseY + 25 + vertOffset + sway
  );
  ctx.bezierCurveTo(
    hairBaseX + windOffset * 0.9,
    hairBaseY + 22 + vertOffset,
    hairBaseX + windOffset * 0.35,
    hairBaseY + 12,
    hairBaseX,
    hairBaseY + 5
  );
  ctx.closePath();
  ctx.fill();

  // Layer 2: Main Vibrant Golden Blonde Lock
  ctx.fillStyle = '#F8B800'; // BBLIR golden blonde
  ctx.strokeStyle = '#B87800';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(hairBaseX, hairBaseY - 1);
  ctx.bezierCurveTo(
    hairBaseX + windOffset * 0.4,
    hairBaseY - 9 + vertOffset + sway,
    hairBaseX + windOffset * 0.8,
    hairBaseY + 2 + vertOffset + sway,
    hairBaseX + windOffset * 1.25,
    hairBaseY + 22 + vertOffset + sway
  );
  ctx.bezierCurveTo(
    hairBaseX + windOffset * 0.75,
    hairBaseY + 16 + vertOffset,
    hairBaseX + windOffset * 0.3,
    hairBaseY + 8,
    hairBaseX,
    hairBaseY + 2
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Layer 3: Radiant Blonde Specular Highlight Ribbon
  ctx.strokeStyle = '#F8F040'; // BBLIR pale lemon highlight
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(hairBaseX - 1, hairBaseY - 2);
  ctx.bezierCurveTo(
    hairBaseX + windOffset * 0.35,
    hairBaseY - 7 + vertOffset + sway,
    hairBaseX + windOffset * 0.7,
    hairBaseY + 2 + vertOffset + sway,
    hairBaseX + windOffset * 1.05,
    hairBaseY + 16 + vertOffset + sway
  );
  ctx.stroke();

  // Golden Hair Clasp Ring at the base of the helmet
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(hairBaseX, hairBaseY, 3, 5, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function renderBackArm(ctx: CanvasRenderingContext2D, p: PlayerState, bodyOffsetY: number) {
  // Back Shoulder Pauldron (Crimson with gold accent)
  ctx.save();
  ctx.fillStyle = '#991B1B'; // Darker shaded crimson
  ctx.fillRect(-13, -9 + bodyOffsetY, 6, 8);
  ctx.fillStyle = '#F59E0B'; // Gold accent trim
  ctx.fillRect(-13, -10 + bodyOffsetY, 6, 2);
  ctx.restore();
}

function renderDetailedTorso(ctx: CanvasRenderingContext2D, p: PlayerState, bodyOffsetY: number) {
  ctx.save();

  // 1. Charcoal/Gunmetal Reploid Bodysuit
  ctx.fillStyle = '#18181B';
  ctx.fillRect(-10, -7 + bodyOffsetY, 19, 18);

  // Subtle cyan circuit muscle fibers on side
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-9, -2 + bodyOffsetY);
  ctx.lineTo(-4, 3 + bodyOffsetY);
  ctx.lineTo(-4, 8 + bodyOffsetY);
  ctx.stroke();

  // 2. White Beveled Chest Armor Vest
  const chestGrad = ctx.createLinearGradient(-10, -7, 10, 5);
  chestGrad.addColorStop(0, '#FFFFFF');
  chestGrad.addColorStop(0.7, '#F1F5F9');
  chestGrad.addColorStop(1, '#CBD5E1');

  ctx.fillStyle = chestGrad;
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.moveTo(-10, -7 + bodyOffsetY);
  ctx.lineTo(8, -7 + bodyOffsetY);
  ctx.lineTo(6, 6 + bodyOffsetY);
  ctx.lineTo(-7, 6 + bodyOffsetY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Golden Chest Collar Accent
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(-8, -8 + bodyOffsetY, 14, 2);

  // 3. Iconic Z-Emerald Core Jewel (Glowing multifaceted diode)
  const corePulse = Math.sin(Date.now() / 140) * 0.15 + 0.85;

  // Outer Emerald Glow
  ctx.fillStyle = `rgba(16, 185, 129, ${0.4 * corePulse})`;
  ctx.beginPath();
  ctx.arc(-0.5, -1 + bodyOffsetY, 6, 0, Math.PI * 2);
  ctx.fill();

  // Gem Base
  ctx.fillStyle = '#059669';
  ctx.beginPath();
  ctx.arc(-0.5, -1 + bodyOffsetY, 3.8, 0, Math.PI * 2);
  ctx.fill();

  // Gem Core
  ctx.fillStyle = '#34D399';
  ctx.beginPath();
  ctx.arc(-0.5, -1 + bodyOffsetY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Specular Reflection Gleam
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-1.5, -2 + bodyOffsetY, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // 4. Tactical Belt & Power Holsters
  ctx.fillStyle = '#F59E0B'; // Golden belt
  ctx.fillRect(-10, 7 + bodyOffsetY, 19, 3);
  ctx.fillStyle = '#78350F';
  ctx.fillRect(-2, 6 + bodyOffsetY, 4, 5); // Buckle
  ctx.fillStyle = '#10B981'; // Green energy capsule on hip
  ctx.fillRect(-9, 7 + bodyOffsetY, 3, 4);

  // 5. Front Shoulder Pauldron (Bright Crimson)
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(6, -10 + bodyOffsetY);
  ctx.lineTo(13, -7 + bodyOffsetY);
  ctx.lineTo(11, -1 + bodyOffsetY);
  ctx.lineTo(5, -3 + bodyOffsetY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gold Pauldron Trim
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(7, -10 + bodyOffsetY, 6, 2);

  ctx.restore();
}

function renderDetailedBoots(
  ctx: CanvasRenderingContext2D,
  p: PlayerState,
  bodyOffsetY: number,
  legSpread: number
) {
  ctx.save();

  // Back Leg & Thruster Boot
  const bLegX = -12 - legSpread * 0.45;
  const bLegY = 10 + bodyOffsetY;

  // Thigh (black under-armor)
  ctx.fillStyle = '#18181B';
  ctx.fillRect(bLegX + 1, bLegY, 7, 7);

  // Greave / Boot Armor (Shaded Crimson)
  ctx.fillStyle = '#B91C1C';
  ctx.fillRect(bLegX - 1, bLegY + 6, 9, 14);

  // Ankle Cuff (White)
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(bLegX - 2, bLegY + 18, 11, 4);

  // Boot Sole & Tread
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(bLegX - 3, bLegY + 22, 13, 4);

  // Front Leg & Thruster Boot (Bright Crimson)
  const fLegX = 1 + legSpread * 0.45;
  const fLegY = 10 + bodyOffsetY;

  // Thigh
  ctx.fillStyle = '#27272A';
  ctx.fillRect(fLegX + 1, fLegY, 7, 7);
  // Knee Guard (White diamond)
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(fLegX + 2, fLegY + 5, 5, 4);

  // Crimson Boot Armor
  const bootGrad = ctx.createLinearGradient(fLegX, fLegY + 7, fLegX + 10, fLegY + 20);
  bootGrad.addColorStop(0, '#EF4444');
  bootGrad.addColorStop(1, '#DC2626');
  ctx.fillStyle = bootGrad;
  ctx.strokeStyle = '#991B1B';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.rect(fLegX, fLegY + 8, 9, 12);
  ctx.fill();
  ctx.stroke();

  // Boot Calf Exhaust Vent (Gold)
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(fLegX - 2, fLegY + 11, 3, 5);

  // White Ankle Cuff
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#CBD5E1';
  ctx.fillRect(fLegX - 1, fLegY + 18, 12, 4);
  ctx.strokeRect(fLegX - 1, fLegY + 18, 12, 4);

  // Armored Sole Tread
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(fLegX - 2, fLegY + 22, 14, 4);
  // Cyan Sole Light
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(fLegX, fLegY + 24, 8, 1.5);

  ctx.restore();
}

function renderDetailedHelmet(ctx: CanvasRenderingContext2D, p: PlayerState, bodyOffsetY: number) {
  ctx.save();
  const headY = -22 + bodyOffsetY;

  // 1. Crimson Helmet Dome with Curvature Highlight
  const helmGrad = ctx.createRadialGradient(-2, headY - 4, 3, 0, headY, 13);
  helmGrad.addColorStop(0, '#EF4444');
  helmGrad.addColorStop(0.7, '#DC2626');
  helmGrad.addColorStop(1, '#991B1B');

  ctx.fillStyle = helmGrad;
  ctx.strokeStyle = '#7F1D1D';
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  ctx.arc(0, headY, 11.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 2. Ear Cap Intake Wings (Golden fins with cyan slit)
  ctx.fillStyle = '#F59E0B'; // Golden wing fin
  ctx.strokeStyle = '#B45309';
  ctx.lineWidth = 1;

  // Left/Rear Wing Fin
  ctx.beginPath();
  ctx.moveTo(-5, headY - 4);
  ctx.lineTo(-12, headY - 14);
  ctx.lineTo(-7, headY - 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White Ear Module
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#CBD5E1';
  ctx.beginPath();
  ctx.arc(-2, headY + 1, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Cyan Ear Diode
  ctx.fillStyle = '#06B6D4';
  ctx.beginPath();
  ctx.arc(-2, headY + 1, 2, 0, Math.PI * 2);
  ctx.fill();

  // 3. Face & Skin Profile
  ctx.fillStyle = '#FED7AA'; // Anime peach skin
  ctx.beginPath();
  ctx.moveTo(3, headY - 4);
  ctx.lineTo(9, headY - 4);
  ctx.lineTo(8, headY + 4);
  ctx.lineTo(3, headY + 5);
  ctx.closePath();
  ctx.fill();

  // Chin Guard (Crimson reploid faceplate)
  ctx.fillStyle = '#DC2626';
  ctx.beginPath();
  ctx.moveTo(3, headY + 4);
  ctx.lineTo(8, headY + 3);
  ctx.lineTo(6, headY + 7);
  ctx.lineTo(2, headY + 7);
  ctx.closePath();
  ctx.fill();

  // 4. Sharp Emerald Green Visor Optics
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.moveTo(4, headY - 4);
  ctx.lineTo(11, headY - 4);
  ctx.lineTo(10, headY);
  ctx.lineTo(4, headY - 1);
  ctx.closePath();
  ctx.fill();

  // Visor White Glint
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(8, headY - 3.5, 2, 1.5);

  // 5. Forehead Crest & Green Diamond Gem (The Z-Crest)
  // Golden Crest Plate
  ctx.fillStyle = '#F59E0B';
  ctx.strokeStyle = '#78350F';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-1, headY - 11);
  ctx.lineTo(5, headY - 19);
  ctx.lineTo(8, headY - 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Forehead Green Jewel
  ctx.fillStyle = '#34D399';
  ctx.beginPath();
  ctx.moveTo(3, headY - 12);
  ctx.lineTo(6, headY - 15);
  ctx.lineTo(7, headY - 11);
  ctx.lineTo(4, headY - 9);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function renderFrontWeaponArm(ctx: CanvasRenderingContext2D, p: PlayerState, bodyOffsetY: number) {
  ctx.save();

  if (p.isShieldBashing) {
    // Render High-Speed Shield Battering Ram
    renderDetailedShieldBash(ctx, bodyOffsetY);
  } else if (p.isSlashing) {
    // Render High-Detail Z-Saber Slash Visuals
    renderDetailedZSaber(ctx, p, bodyOffsetY);
  } else if (p.shieldActive) {
    // Render High-Detail Shield Boomerang
    renderDetailedShield(ctx, bodyOffsetY);
  } else {
    // Default Buster Arm (Crimson gauntlet with white trim and glowing nozzle)
    const armY = -3 + bodyOffsetY;
    // Bicep
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(3, armY - 2, 8, 6);
    // White Elbow Cuff
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(9, armY - 3, 3, 8);
    // Forearm / Buster
    ctx.fillStyle = '#DC2626';
    ctx.strokeStyle = '#991B1B';
    ctx.lineWidth = 1;
    ctx.fillRect(11, armY - 2, 9, 6);
    ctx.strokeRect(11, armY - 2, 9, 6);

    // Green Hand Gem
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(16, armY + 1, 2, 0, Math.PI * 2);
    ctx.fill();

    // Buster Barrel Muzzle
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(20, armY - 1, 3, 4);
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(21, armY, 1.5, 2);
  }

  ctx.restore();
}

function renderDetailedZSaber(ctx: CanvasRenderingContext2D, p: PlayerState, bodyOffsetY: number) {
  ctx.save();
  const step = p.comboStep;
  const type = p.slashType;

  // Arm grasping hilt
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(2, -4 + bodyOffsetY, 10, 6);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(10, -5 + bodyOffsetY, 3, 8);

  // Metallic Saber Hilt (Gunmetal with gold emitter ring)
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.fillRect(12, -7 + bodyOffsetY, 9, 5);
  ctx.strokeRect(12, -7 + bodyOffsetY, 9, 5);

  // Gold Emitter Ring
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(20, -9 + bodyOffsetY, 3, 9);

  // Blade Beam Glow & Arc
  ctx.translate(22, -4 + bodyOffsetY);

  if (type === 'CHARGE_THRUST') {
    // Ultimate Piercing Charge Lance Thrust (Dash + Sword)
    renderBladeChargeThrust(ctx);
  } else if (type === 'DASH_SLASH') {
    // Lunging forward piercing beam
    renderBladeThrust(ctx);
  } else if (type === 'AIR_SPIN') {
    // 360° Aerial emerald ring
    renderBladeAirSpin(ctx);
  } else if (step === 3) {
    // Giant Downward Cleave
    renderBladeCleave(ctx);
  } else if (step === 2) {
    // Upward Crescent Slash
    renderBladeUpward(ctx);
  } else {
    // Quick Horizontal Slash
    renderBladeHorizontal(ctx);
  }

  ctx.restore();
}

function renderBladeHorizontal(ctx: CanvasRenderingContext2D) {
  // Radiant Emerald Laser Blade
  const bladeLen = 65;

  // Outer Plasma Fringe (Cyan/Green Gradient)
  const grad = ctx.createLinearGradient(0, 0, bladeLen, 0);
  grad.addColorStop(0, '#A7F3D0');
  grad.addColorStop(0.3, '#10B981');
  grad.addColorStop(0.8, '#059669');
  grad.addColorStop(1, 'rgba(16, 185, 129, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(bladeLen, -2);
  ctx.lineTo(bladeLen - 8, 6);
  ctx.lineTo(0, 4);
  ctx.closePath();
  ctx.fill();

  // White-hot core beam
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(2, -1);
  ctx.lineTo(bladeLen - 12, 0);
  ctx.stroke();

  // Trailing Slash Arc Ribbon
  ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(-10, 0, 45, -0.4, 0.4);
  ctx.stroke();
}

function renderBladeUpward(ctx: CanvasRenderingContext2D) {
  // Upward Crescent Slice Arc
  ctx.save();
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.85)';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(-4, -6, 54, -Math.PI * 0.45, Math.PI * 0.3);
  ctx.stroke();

  // White Core
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(-4, -6, 54, -Math.PI * 0.38, Math.PI * 0.22);
  ctx.stroke();
  ctx.restore();
}

function renderBladeCleave(ctx: CanvasRenderingContext2D) {
  // Heavy Downward Cleave
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 248, 120, 0.9)';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.arc(-2, 8, 64, -Math.PI * 0.42, Math.PI * 0.45);
  ctx.stroke();

  // Inner Cyan Aura
  ctx.strokeStyle = '#6EE7B7';
  ctx.lineWidth = 8;
  ctx.stroke();

  // White-Hot Impact Core
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // Ground Energy Shockwave Spikes (BBLIR signature Slash 3 impact)
  ctx.fillStyle = '#00F870';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1.5;
  const spikePositions = [28, 48, 68];
  for (let i = 0; i < spikePositions.length; i++) {
    const sx = spikePositions[i];
    const sHeight = 24 - i * 5;
    ctx.beginPath();
    ctx.moveTo(sx - 7, 24);
    ctx.lineTo(sx, 24 - sHeight);
    ctx.lineTo(sx + 7, 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function renderBladeChargeThrust(ctx: CanvasRenderingContext2D) {
  // Ultimate Piercing Laser Lance Thrust (Dash + Saber)
  const bladeLen = 120;
  
  // 1. Aerodynamic Sonic Shockwave Cones
  ctx.save();
  ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.beginPath();
  ctx.moveTo(10, -22);
  ctx.lineTo(bladeLen * 0.45, 0);
  ctx.lineTo(10, 22);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(52, 211, 153, 0.45)';
  ctx.beginPath();
  ctx.moveTo(35, -16);
  ctx.lineTo(bladeLen * 0.75, 0);
  ctx.lineTo(35, 16);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 2. High-Density Piercing Emerald Plasma Lance
  const grad = ctx.createLinearGradient(0, 0, bladeLen, 0);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.15, '#6EE7B7');
  grad.addColorStop(0.5, '#10B981');
  grad.addColorStop(0.85, '#059669');
  grad.addColorStop(1, 'rgba(5, 150, 105, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.lineTo(bladeLen, 0);
  ctx.lineTo(0, 11);
  ctx.closePath();
  ctx.fill();

  // 3. Piercing Laser Tip Diamond
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(bladeLen - 28, -6);
  ctx.lineTo(bladeLen, 0);
  ctx.lineTo(bladeLen - 28, 6);
  ctx.closePath();
  ctx.fill();

  // 4. White-Hot Core Beam with Electric Cyan Spiral
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(bladeLen - 6, 0);
  ctx.stroke();

  // Electric crackle arcs along the lance
  ctx.strokeStyle = '#BAE6FD';
  ctx.lineWidth = 1.8;
  for (let x = 15; x < bladeLen - 15; x += 25) {
    const yOff = (Math.random() - 0.5) * 12;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 12, yOff);
    ctx.lineTo(x + 20, 0);
    ctx.stroke();
  }
}

function renderBladeThrust(ctx: CanvasRenderingContext2D) {
  // Dash Slash Lunging Blade Wave
  const bladeLen = 85;
  const grad = ctx.createLinearGradient(0, 0, bladeLen, 0);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.2, '#6EE7B7');
  grad.addColorStop(0.7, '#10B981');
  grad.addColorStop(1, 'rgba(5, 150, 105, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(bladeLen, 0);
  ctx.lineTo(0, 8);
  ctx.closePath();
  ctx.fill();

  // White Core
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(bladeLen - 15, 0);
  ctx.stroke();
}

function renderBladeAirSpin(ctx: CanvasRenderingContext2D) {
  // Full 360° Aerial Laser Wheel
  ctx.save();
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.arc(-22, 0, 50, -Math.PI * 0.8, Math.PI * 0.8);
  ctx.stroke();

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function renderDetailedShield(ctx: CanvasRenderingContext2D, bodyOffsetY: number) {
  ctx.save();
  const time = Date.now() / 70;
  ctx.translate(24, -2 + bodyOffsetY);

  // Arm holding shield
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(-14, -3, 12, 6);

  // Rotating Runic Nodes
  ctx.rotate(time);

  // Hexagonal Emerald Energy Aegis
  ctx.fillStyle = 'rgba(16, 185, 129, 0.38)';
  ctx.strokeStyle = '#34D399';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  const sides = 6;
  const rad = 28;
  for (let i = 0; i < sides; i++) {
    const a = (i * Math.PI * 2) / sides;
    const sx = Math.cos(a) * rad;
    const sy = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Rotating Emitter Nodes
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    ctx.fillStyle = '#FEF08A';
    ctx.beginPath();
    ctx.arc(Math.cos(a) * 18, Math.sin(a) * 18, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Central Core Diode
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function renderDetailedShieldBash(ctx: CanvasRenderingContext2D, bodyOffsetY: number) {
  // Rocket Powered Shield Bash Battering Ram (Dash + Shield)
  ctx.save();
  ctx.translate(28, -2 + bodyOffsetY);

  // Arm braced heavily forward
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(-16, -5, 16, 9);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-2, -6, 4, 11);

  // Back thruster flame for shield ram
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.moveTo(-16, -6);
  ctx.lineTo(-32, 0);
  ctx.lineTo(-16, 6);
  ctx.closePath();
  ctx.fill();

  // Heavy Armored Aegis Ram Head
  ctx.fillStyle = '#1E293B';
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(16, -14);
  ctx.lineTo(24, 0);
  ctx.lineTo(16, 14);
  ctx.lineTo(0, 22);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // High-Energy Cyan Hex Shield Barrier
  ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
  ctx.strokeStyle = '#67E8F9';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(8, -26);
  ctx.lineTo(26, -16);
  ctx.lineTo(34, 0);
  ctx.lineTo(26, 16);
  ctx.lineTo(8, 26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Kinetic Shockwave Arcs in front of bash
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(18, 0, 26, -Math.PI * 0.35, Math.PI * 0.35);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(28, 0, 32, -Math.PI * 0.3, Math.PI * 0.3);
  ctx.stroke();

  // Central Gold Power Core
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.arc(10, 0, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ==========================================
// ENEMY RENDERING
// ==========================================

export function renderEnemy(ctx: CanvasRenderingContext2D, e: Enemy) {
  ctx.save();
  ctx.translate(e.x + e.width / 2, e.y + e.height / 2);
  ctx.scale(e.facing, 1);

  // Flash white/red when taking damage
  const isHurt = e.invincibleTimer > 0;
  if (isHurt && Math.floor(e.invincibleTimer / 3) % 2 === 1) {
    ctx.filter = 'brightness(2.5)';
  }

  if (e.type === 'PANTHEON_HUNTER') {
    renderPantheonHunter(ctx, e);
  } else if (e.type === 'MECHANILOID_HOUND') {
    renderHound(ctx, e);
  } else if (e.type === 'FLYING_DRONE') {
    renderDrone(ctx, e);
  } else if (e.type === 'SPIKY_ROLLER') {
    renderSpiky(ctx, e);
  } else if (e.type === 'TURRET') {
    renderTurret(ctx, e);
  } else if (e.type === 'BOSS_GOLEM') {
    renderGolemBoss(ctx, e);
  } else if (e.type === 'BOSS_AEGIS_PALADIN') {
    renderAegisPaladin(ctx, e);
  }

  // Stunned Effect Overlay (Electric Arcs & Status Indicator)
  if (e.stunTimer > 0) {
    renderStunEffect(ctx, e);
  }

  // Draw health bar above non-boss enemies when damaged
  if (!e.isBoss && e.hp < e.maxHp) {
    ctx.scale(e.facing, 1);
    const barW = 32;
    const barH = 4;
    const hpPct = Math.max(0, e.hp / e.maxHp);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(-barW / 2, -e.height / 2 - 8, barW, barH);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(-barW / 2, -e.height / 2 - 8, barW * hpPct, barH);
  }

  ctx.restore();
}

function renderStunEffect(ctx: CanvasRenderingContext2D, e: Enemy) {
  ctx.save();
  // Draw crackling yellow/cyan electric rings around enemy
  const t = Date.now() / 60;
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 2;

  for (let i = 0; i < 3; i++) {
    const a = t + (i * Math.PI * 2) / 3;
    const rx = Math.cos(a) * (e.width * 0.65);
    const ry = -e.height * 0.35 + Math.sin(a * 2) * 8;
    ctx.beginPath();
    ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
    ctx.stroke();

    // Electric sparks
    ctx.strokeStyle = '#67E8F9';
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.lineTo(rx + (Math.random() - 0.5) * 12, ry + (Math.random() - 0.5) * 12);
    ctx.stroke();
  }

  // Floating Stun text
  ctx.scale(e.facing, 1);
  ctx.fillStyle = '#FDE047';
  ctx.font = 'bold 9px "Chakra Petch", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('⚡ STUNNED', 0, -e.height / 2 - 12);
  ctx.restore();
}

function renderPantheonHunter(ctx: CanvasRenderingContext2D, _e: Enemy) {
  // Neo Arcadia Soldier Reploid (Forest green armor, cone helmet, glowing red optic)
  ctx.fillStyle = '#065F46';
  ctx.fillRect(-10, 8, 8, 20);
  ctx.fillRect(2, 8, 8, 20);

  ctx.fillStyle = '#047857';
  ctx.fillRect(-12, -10, 22, 18);
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(-12, 4, 22, 4);

  // Conical Helmet
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.moveTo(8, -26);
  ctx.lineTo(-14, -14);
  ctx.lineTo(8, -8);
  ctx.closePath();
  ctx.fill();

  // Visor Eye (Glowing Red Reploid Optic)
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(3, -16, 5, 4);
  ctx.fillStyle = '#FCA5A5';
  ctx.fillRect(4, -15, 2, 2);

  // Rifle Arm
  ctx.fillStyle = '#374151';
  ctx.fillRect(2, -4, 18, 6);
  ctx.fillStyle = '#111827';
  ctx.fillRect(20, -3, 6, 4);
}

function renderHound(ctx: CanvasRenderingContext2D, e: Enemy) {
  const isPouncing = !e.grounded;
  ctx.fillStyle = '#374151';
  ctx.fillRect(-18, -8, 34, 16);

  ctx.fillStyle = '#1F2937';
  if (isPouncing) {
    ctx.fillRect(-22, 6, 8, 12);
    ctx.fillRect(14, 6, 8, 12);
  } else {
    ctx.fillRect(-16, 8, 6, 10);
    ctx.fillRect(10, 8, 6, 10);
  }

  ctx.fillStyle = '#4B5563';
  ctx.beginPath();
  ctx.moveTo(12, -12);
  ctx.lineTo(24, -4);
  ctx.lineTo(14, 4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#EF4444';
  ctx.fillRect(16, -8, 6, 3);
}

function renderDrone(ctx: CanvasRenderingContext2D, _e: Enemy) {
  const bob = Math.sin(Date.now() / 150) * 3;
  ctx.translate(0, bob);

  ctx.fillStyle = '#9CA3AF';
  ctx.fillRect(-18, -12, 36, 3);

  ctx.fillStyle = '#1E3A8A';
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.arc(4, 2, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#64748B';
  ctx.fillRect(0, 12, 6, 6);
}

function renderSpiky(ctx: CanvasRenderingContext2D, _e: Enemy) {
  const roll = (Date.now() / 100) % (Math.PI * 2);
  ctx.rotate(roll);

  ctx.fillStyle = '#B45309';
  ctx.beginPath();
  ctx.arc(0, 0, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#78350F';
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI * 2) / 6;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a - 0.2) * 12, Math.sin(a - 0.2) * 12);
    ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20);
    ctx.lineTo(Math.cos(a + 0.2) * 12, Math.sin(a + 0.2) * 12);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = '#EF4444';
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
}

function renderTurret(ctx: CanvasRenderingContext2D, _e: Enemy) {
  ctx.fillStyle = '#334155';
  ctx.fillRect(-14, -12, 28, 24);

  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#DC2626';
  ctx.fillRect(8, -3, 14, 6);
}

function renderGolemBoss(ctx: CanvasRenderingContext2D, _e: Enemy) {
  const breath = Math.sin(Date.now() / 200) * 3;

  ctx.fillStyle = '#1E293B';
  ctx.fillRect(-50, -50 + breath, 95, 100);

  ctx.fillStyle = '#D97706';
  ctx.fillRect(-45, -45 + breath, 85, 30);
  ctx.fillRect(-45, 15 + breath, 85, 30);

  const corePulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
  ctx.fillStyle = `rgba(239, 68, 68, ${corePulse})`;
  ctx.beginPath();
  ctx.arc(0, -5 + breath, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#475569';
  ctx.fillRect(10, -70 + breath, 45, 30);
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(25, -62 + breath, 25, 8);

  ctx.fillStyle = '#78350F';
  ctx.fillRect(25, -20 + breath, 45, 40);
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(60, -15 + breath, 18, 30);

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(-40, -75 + breath, 30, 25);
  ctx.fillStyle = '#38BDF8';
  ctx.beginPath();
  ctx.arc(-25, -62 + breath, 6, 0, Math.PI * 2);
  ctx.fill();
}

// ==========================================
// BULLET RENDERING
// ==========================================

export function renderBullet(ctx: CanvasRenderingContext2D, b: Bullet) {
  ctx.save();
  ctx.translate(b.x, b.y);

  if (b.type === 'BUSTER_NORMAL') {
    ctx.fillStyle = '#FACC15';
    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (b.type === 'BUSTER_LV2') {
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, b.radius);
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.5, '#38BDF8');
    grad.addColorStop(1, 'rgba(3, 105, 161, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
    ctx.fill();
  } else if (b.type === 'BUSTER_LV3') {
    const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, b.radius);
    grad.addColorStop(0, '#FEF08A');
    grad.addColorStop(0.5, '#F97316');
    grad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
    ctx.fill();
  } else if (b.type === 'SHIELD_BOOMERANG') {
    ctx.rotate(Date.now() / 40);
    ctx.fillStyle = '#10B981';
    ctx.strokeStyle = '#6EE7B7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (b.type === 'ENEMY_BULLET') {
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
    ctx.fill();
  } else if (b.type === 'BOSS_LASER') {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.fillRect(-b.radius, -8, b.radius * 2, 16);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-b.radius, -3, b.radius * 2, 6);
  } else if (b.type === 'BOSS_RUBBLE') {
    ctx.fillStyle = '#64748B';
    ctx.fillRect(-b.radius, -b.radius, b.radius * 2, b.radius * 2);
  }

  ctx.restore();
}

// ==========================================
// PICKUP RENDERING
// ==========================================

export function renderPickup(ctx: CanvasRenderingContext2D, p: Pickup) {
  ctx.save();
  ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
  const bob = Math.sin(Date.now() / 200 + p.x) * 3;
  ctx.translate(0, bob);

  if (p.type === 'HP_SMALL') {
    ctx.fillStyle = '#10B981';
    ctx.fillRect(-6, -8, 12, 16);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-4, -6, 3, 12);
  } else if (p.type === 'HP_LARGE') {
    ctx.fillStyle = '#059669';
    ctx.fillRect(-9, -12, 18, 24);
    ctx.fillStyle = '#A7F3D0';
    ctx.fillRect(-7, -9, 5, 18);
  } else if (p.type === 'E_CRYSTAL') {
    ctx.rotate(Date.now() / 400);
    ctx.fillStyle = '#38BDF8';
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(8, 0);
    ctx.lineTo(0, 10);
    ctx.lineTo(-8, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (p.type === 'CYBER_ELF') {
    const flap = Math.sin(Date.now() / 80) * 8;
    ctx.fillStyle = 'rgba(167, 139, 250, 0.8)';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(224, 231, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(-9, -4 + flap * 0.2, 8, 4, -0.4, 0, Math.PI * 2);
    ctx.ellipse(9, -4 - flap * 0.2, 8, 4, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// ==========================================
// PARTICLE RENDERING
// ==========================================

export function renderParticle(ctx: CanvasRenderingContext2D, pt: Particle) {
  ctx.save();
  ctx.translate(pt.x, pt.y);
  ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);

  if (pt.shape === 'spark') {
    ctx.strokeStyle = pt.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-pt.size, 0);
    ctx.lineTo(pt.size, 0);
    ctx.stroke();
  } else if (pt.shape === 'smoke') {
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(0, 0, pt.size, 0, Math.PI * 2);
    ctx.fill();
  } else if (pt.shape === 'slash_wave') {
    ctx.strokeStyle = pt.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, pt.size * 2, -0.5, 0.5);
    ctx.stroke();
  } else {
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(0, 0, pt.size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
