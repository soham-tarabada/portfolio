export const GRAVITY = 2100;
export const BOUNCE = 0.44;
export const DRAG = 0.9;
export const WALK_SPEED = 52;
export const HOP_SPEED = 420;
export const ARRIVE = 2;
export const REST_SPEED = 26;
export const MAX_THROW = 1600;

export function createMotion(x = 0) {
  return { x, y: 0, vx: 0, vy: 0, target: null, grounded: true, facing: -1, landed: 0 };
}

export function clamp(value, low, high) {
  if (high < low) return low;
  return Math.min(high, Math.max(low, value));
}

export function stepMotion(motion, dt, bounds, options = {}) {
  const { min, max } = bounds;
  const walkSpeed = options.walkSpeed ?? WALK_SPEED;
  const next = { ...motion };

  if (next.target !== null) {
    const target = clamp(next.target, min, max);
    const delta = target - next.x;
    const stride = walkSpeed * dt;

    if (Math.abs(delta) <= Math.max(stride, ARRIVE)) {
      next.x = target;
      next.target = null;
    } else {
      const direction = Math.sign(delta);
      next.x += direction * stride;
      next.facing = direction;
    }
  } else if (next.vx !== 0) {
    next.x += next.vx * dt;
    next.vx *= Math.pow(DRAG, dt * 60);
    if (Math.abs(next.vx) < 4) next.vx = 0;
    else next.facing = Math.sign(next.vx);
  }

  if (next.x < min || next.x > max) {
    next.x = clamp(next.x, min, max);
    if (next.vx !== 0) {
      next.vx = -next.vx * BOUNCE;
      next.facing = Math.sign(next.vx) || next.facing;
    }
    next.target = null;
  }

  const airborne = !next.grounded || next.vy !== 0 || next.y > 0;

  if (airborne) {
    next.vy -= GRAVITY * dt;
    next.y += next.vy * dt;

    if (next.y <= 0) {
      next.y = 0;
      if (Math.abs(next.vy) > REST_SPEED) {
        next.vy = -next.vy * BOUNCE;
        next.grounded = false;
      } else {
        next.vy = 0;
        if (!next.grounded) next.landed = motion.landed + 1;
        next.grounded = true;
      }
    } else {
      next.grounded = false;
    }
  }

  return next;
}

export function throwFrom(motion, vx, vy) {
  return {
    ...motion,
    target: null,
    grounded: false,
    vx: clamp(vx, -MAX_THROW, MAX_THROW),
    vy: clamp(vy, -MAX_THROW, MAX_THROW),
  };
}

export function hop(motion, strength = HOP_SPEED) {
  if (!motion.grounded) return motion;
  return { ...motion, grounded: false, vy: strength };
}

export function walkTo(motion, target) {
  return { ...motion, target, vx: 0 };
}

export function boundsFor(width, spriteWidth, margin = 8) {
  const max = Math.max(margin, width - spriteWidth - margin);
  return { min: margin, max };
}

export function pickTarget(motion, bounds, random = Math.random) {
  const span = bounds.max - bounds.min;
  if (span < 40) return bounds.min;

  const reach = Math.max(80, span * 0.4);
  const drift = (random() * 2 - 1) * reach;
  return clamp(motion.x + drift, bounds.min, bounds.max);
}
