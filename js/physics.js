/**
 * SUPER GALIANO - Physics & Collision Engine
 * Platformer physics, tile collision, one-way platforms, particle system.
 */

const Physics = (() => {
  const GRAVITY = 0.58;
  const TERMINAL_VELOCITY = 12;

  // Simple AABB overlap check
  function checkOverlap(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // Particle System
  class ParticlePool {
    constructor() {
      this.particles = [];
    }

    emit(x, y, color, count = 5, speed = 2, size = 3, life = 30) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const vel = (Math.random() * 0.7 + 0.3) * speed;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * vel,
          vy: Math.sin(angle) * vel - (Math.random() * 1.5),
          color,
          size: Math.random() * size + 1.5,
          life,
          maxLife: life
        });
      }
    }

    emitSparks(x, y, count = 8) {
      const colors = ['#facc15', '#00f2fe', '#ffffff', '#ff0055'];
      for (let i = 0; i < count; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        this.emit(x, y, color, 1, 3.5, 2.5, 25);
      }
    }

    update() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // light particle gravity
        p.life--;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    draw(ctx) {
      for (const p of this.particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.round(p.size), Math.round(p.size));
      }
      ctx.globalAlpha = 1.0;
    }

    clear() {
      this.particles = [];
    }
  }

  return {
    GRAVITY,
    TERMINAL_VELOCITY,
    checkOverlap,
    ParticlePool
  };
})();

if (typeof window !== 'undefined') {
  window.Physics = Physics;
}
