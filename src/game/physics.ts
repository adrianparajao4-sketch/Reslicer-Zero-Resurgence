import { Bullet, Enemy, Platform, PlayerState } from '../types/game';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function rectsIntersect(r1: Rect, r2: Rect): boolean {
  return (
    r1.x < r2.x + r2.width &&
    r1.x + r1.width > r2.x &&
    r1.y < r2.y + r2.height &&
    r1.y + r1.height > r2.y
  );
}

export function circleRectIntersect(
  cx: number,
  cy: number,
  radius: number,
  rect: Rect
): boolean {
  const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));

  const distanceX = cx - closestX;
  const distanceY = cy - closestY;

  return distanceX * distanceX + distanceY * distanceY < radius * radius;
}

/**
 * Resolves player collision with platforms, slopes, and hazard spikes.
 */
export function resolvePlayerCollisions(
  p: PlayerState,
  platforms: Platform[],
  isDroppingDown: boolean
): { hitSpike: boolean; wallSlideSide: -1 | 1 | 0 } {
  let hitSpike = false;
  let wallSlideSide: -1 | 1 | 0 = 0;

  p.grounded = false;

  // Update moving platforms first
  for (const plat of platforms) {
    if (plat.type === 'MOVING' && plat.vx) {
      plat.x += plat.vx;
      if (plat.minX !== undefined && plat.x <= plat.minX) {
        plat.x = plat.minX;
        plat.vx = Math.abs(plat.vx);
      } else if (plat.maxX !== undefined && plat.x >= plat.maxX) {
        plat.x = plat.maxX;
        plat.vx = -Math.abs(plat.vx);
      }
    }
  }

  const pRect: Rect = {
    x: p.x,
    y: p.y,
    width: p.width,
    height: p.height
  };

  for (const plat of platforms) {
    if (plat.type === 'SPIKE') {
      const isOverSpikesX = p.x + p.width > plat.x && p.x < plat.x + plat.width;
      if (rectsIntersect(pRect, plat) || (isOverSpikesX && p.y + p.height >= plat.y)) {
        hitSpike = true;
      }
      if (p.vy >= 0 && isOverSpikesX && p.y + p.height >= plat.y && p.y + p.height <= plat.y + 24) {
        p.y = plat.y - p.height;
        p.vy = 0;
        p.grounded = true;
      }
      continue;
    }

    if (plat.type === 'ONE_WAY') {
      // One-way platforms: only land on top if falling downwards and feet were above
      if (!isDroppingDown && p.vy >= 0) {
        const feetPrevY = p.y - p.vy + p.height;
        if (feetPrevY <= plat.y + 6 && p.y + p.height >= plat.y && p.x + p.width > plat.x && p.x < plat.x + plat.width) {
          p.y = plat.y - p.height;
          p.vy = 0;
          p.grounded = true;
        }
      }
      continue;
    }

    // SOLID, BREAKABLE, DOOR, MOVING platforms
    if (!rectsIntersect(pRect, plat)) continue;

    // Calculate overlap depths
    const overlapLeft = p.x + p.width - plat.x;
    const overlapRight = plat.x + plat.width - p.x;
    const overlapTop = p.y + p.height - plat.y;
    const overlapBottom = plat.y + plat.height - p.y;

    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBottom);

    if (minOverlapY < minOverlapX) {
      if (overlapTop < overlapBottom && p.vy >= 0) {
        // Landing on floor
        p.y = plat.y - p.height;
        p.vy = 0;
        p.grounded = true;
        if (plat.type === 'MOVING' && plat.vx) {
          p.x += plat.vx;
        }
      } else if (overlapBottom < overlapTop && p.vy <= 0) {
        // Hitting ceiling
        p.y = plat.y + plat.height;
        p.vy = 0;
      }
    } else {
      if (overlapLeft < overlapRight) {
        // Colliding with left side of wall
        p.x = plat.x - p.width;
        p.vx = 0;
        if (!p.grounded && p.vy > 0) {
          wallSlideSide = 1;
        }
      } else {
        // Colliding with right side of wall
        p.x = plat.x + plat.width;
        p.vx = 0;
        if (!p.grounded && p.vy > 0) {
          wallSlideSide = -1;
        }
      }
    }
  }

  return { hitSpike, wallSlideSide };
}

/**
 * Resolves enemy collision with ground & walls
 */
export function resolveEnemyCollisions(e: Enemy, platforms: Platform[]) {
  e.grounded = false;
  const eRect: Rect = {
    x: e.x,
    y: e.y,
    width: e.width,
    height: e.height
  };

  for (const plat of platforms) {
    if (plat.type === 'SPIKE') continue;

    if (plat.type === 'ONE_WAY') {
      if (e.vy >= 0) {
        const feetPrevY = e.y - e.vy + e.height;
        if (feetPrevY <= plat.y + 6 && e.y + e.height >= plat.y && e.x + e.width > plat.x && e.x < plat.x + plat.width) {
          e.y = plat.y - e.height;
          e.vy = 0;
          e.grounded = true;
        }
      }
      continue;
    }

    if (!rectsIntersect(eRect, plat)) continue;

    const overlapLeft = e.x + e.width - plat.x;
    const overlapRight = plat.x + plat.width - e.x;
    const overlapTop = e.y + e.height - plat.y;
    const overlapBottom = plat.y + plat.height - e.y;

    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBottom);

    if (minOverlapY < minOverlapX) {
      if (overlapTop < overlapBottom && e.vy >= 0) {
        e.y = plat.y - e.height;
        e.vy = 0;
        e.grounded = true;
      } else if (overlapBottom < overlapTop) {
        e.y = plat.y + plat.height;
        e.vy = 0;
      }
    } else {
      if (overlapLeft < overlapRight) {
        e.x = plat.x - e.width;
        e.vx = -e.vx;
        e.facing = -1;
      } else {
        e.x = plat.x + plat.width;
        e.vx = -e.vx;
        e.facing = 1;
      }
    }
  }
}

/**
 * Checks bullet hit against platforms or breakable walls
 */
export function resolveBulletPlatforms(
  bullet: Bullet,
  platforms: Platform[]
): { hit: boolean; breakableHit?: Platform } {
  for (const plat of platforms) {
    if (plat.type === 'SPIKE' || plat.type === 'ONE_WAY') continue;

    if (circleRectIntersect(bullet.x, bullet.y, bullet.radius, plat)) {
      if (plat.type === 'BREAKABLE') {
        return { hit: true, breakableHit: plat };
      }
      return { hit: true };
    }
  }
  return { hit: false };
}
