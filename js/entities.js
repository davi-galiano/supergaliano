/**
 * SUPER GALIANO - Entities Engine
 * Player (Galiano & Gato Mount), Weapons, Enemies (Aranhas), Boss (Barba Amarela),
 * Civilians, Projectiles, Coins, and Interactive Blocks.
 */

const Entities = (() => {

  // --- PROJECTILE ---
  class Projectile {
    constructor(x, y, vx, vy, isEnemy = false) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
      this.width = isEnemy ? 16 : 14;
      this.height = isEnemy ? 16 : 12;
      this.isEnemy = isEnemy;
      this.alive = true;
      this.life = 120;
    }

    update(level, particles) {
      this.x += this.vx;
      this.y += this.vy;
      this.life--;
      if (this.life <= 0) {
        this.alive = false;
        return;
      }

      // Trail particles
      if (Math.random() < 0.6) {
        particles.emit(
          this.x + this.width / 2,
          this.y + this.height / 2,
          this.isEnemy ? '#facc15' : '#00f2fe',
          1, 1.2, 2, 15
        );
      }

      // Check tile collision
      if (level.isSolidAt(this.x + this.width / 2, this.y + this.height / 2)) {
        this.alive = false;
        particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 5);
      }
    }

    draw(ctx) {
      const sprite = this.isEnemy
        ? Sprites.get('projectile_boss')
        : Sprites.get('projectile_laser');
      if (sprite) {
        ctx.drawImage(sprite, Math.round(this.x), Math.round(this.y));
      } else {
        ctx.fillStyle = this.isEnemy ? '#facc15' : '#00f2fe';
        ctx.fillRect(Math.round(this.x), Math.round(this.y), this.width, this.height);
      }
    }
  }

  // --- PLAYER (GALIANO) ---
  class Player {
    constructor(x, y) {
      this.startX = x;
      this.startY = y;
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.width = 30;
      this.height = 46;

      this.facing = 1; // 1 = right, -1 = left
      this.isGrounded = false;
      this.isMounted = false; // Riding Gato Preto
      this.hasWeapon = false; // Equipped Backpack Weapon

      this.hp = 3;
      this.maxHp = 3;
      this.score = 0;
      this.coins = 0;

      this.hurtTimer = 0;
      this.attackTimer = 0;
      this.animTimer = 0;
      this.animFrame = 0;
      this.state = 'idle'; // idle, walk, run, jump, fall, attack, hurt, defeat

      this.shootCooldown = 0;
      this.catChompTimer = 0;
      this.isDead = false;
    }

    reset(x, y) {
      this.x = x !== undefined ? x : this.startX;
      this.y = y !== undefined ? y : this.startY;
      this.vx = 0;
      this.vy = 0;
      this.hp = this.maxHp;
      this.hurtTimer = 0;
      this.attackTimer = 0;
      this.catChompTimer = 0;
      this.isDead = false;
      this.state = 'idle';
    }

    takeDamage(amount = 1, particles) {
      if (this.hurtTimer > 0 || this.isDead) return;
      this.hp -= amount;
      this.hurtTimer = 60; // 1 second invulnerability
      this.vy = -6;
      this.vx = -this.facing * 4;
      SoundEngine.playPlayerHurt();
      if (particles) {
        particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 10);
      }

      if (this.hp <= 0) {
        this.isDead = true;
        this.vy = -10;
      }
    }

    attack(projectiles) {
      if (!this.hasWeapon || this.shootCooldown > 0 || this.isDead) return;
      this.attackTimer = 16;
      this.shootCooldown = 18;

      SoundEngine.playShoot();
      const projX = this.facing === 1 ? this.x + this.width + 4 : this.x - 16;
      const projY = this.isMounted ? this.y + 12 : this.y + 16;
      projectiles.push(new Projectile(projX, projY, this.facing * 9, 0, false));
    }

    update(input, level, particles, projectiles) {
      if (this.isDead) {
        this.y += this.vy;
        this.vy += Physics.GRAVITY;
        return;
      }

      // Adjust dimensions depending on mount
      if (this.isMounted) {
        this.width = 44;
        this.height = 48;
      } else {
        this.width = 30;
        this.height = 46;
      }

      if (this.hurtTimer > 0) this.hurtTimer--;
      if (this.attackTimer > 0) this.attackTimer--;
      if (this.shootCooldown > 0) this.shootCooldown--;
      if (this.catChompTimer > 0) this.catChompTimer--;

      // Movement input
      const moveSpeed = this.isMounted ? 5.5 : 4.0;
      const accel = this.isMounted ? 0.6 : 0.45;
      const friction = 0.82;

      let moveX = 0;
      if (input.left) moveX -= 1;
      if (input.right) moveX += 1;

      if (moveX !== 0) {
        this.vx += moveX * accel;
        if (Math.abs(this.vx) > moveSpeed) {
          this.vx = Math.sign(this.vx) * moveSpeed;
        }
        this.facing = moveX;
      } else {
        this.vx *= friction;
        if (Math.abs(this.vx) < 0.1) this.vx = 0;
      }

      // Jump input
      const jumpImpulse = this.isMounted ? -12.5 : -10.8;
      if (input.jump && this.isGrounded) {
        this.vy = jumpImpulse;
        this.isGrounded = false;
        if (this.isMounted) {
          SoundEngine.playCatJump();
        } else {
          SoundEngine.playJump();
        }
        particles.emit(this.x + this.width / 2, this.y + this.height, '#e2e8f0', 5, 2, 3, 15);
      }

      // Attack input
      if (input.attack) {
        this.attack(projectiles);
      }

      // Gravity
      this.vy += Physics.GRAVITY;
      if (this.vy > Physics.TERMINAL_VELOCITY) {
        this.vy = Physics.TERMINAL_VELOCITY;
      }

      // Physics integration & Tile Collision
      this.handleHorizontalCollisions(level);
      this.handleVerticalCollisions(level, particles);

      // Animation state determination
      this.updateAnimation();
    }

    handleHorizontalCollisions(level) {
      this.x += this.vx;
      const box = { x: this.x, y: this.y, width: this.width, height: this.height };

      if (this.vx > 0) {
        // moving right
        const rightEdge = this.x + this.width;
        const topTile = Math.floor(this.y / level.tileSize);
        const bottomTile = Math.floor((this.y + this.height - 1) / level.tileSize);
        const col = Math.floor(rightEdge / level.tileSize);

        for (let r = topTile; r <= bottomTile; r++) {
          if (level.isSolidBlock(col, r)) {
            this.x = col * level.tileSize - this.width;
            this.vx = 0;
            break;
          }
        }
      } else if (this.vx < 0) {
        // moving left
        const leftEdge = this.x;
        const topTile = Math.floor(this.y / level.tileSize);
        const bottomTile = Math.floor((this.y + this.height - 1) / level.tileSize);
        const col = Math.floor(leftEdge / level.tileSize);

        for (let r = topTile; r <= bottomTile; r++) {
          if (level.isSolidBlock(col, r)) {
            this.x = (col + 1) * level.tileSize;
            this.vx = 0;
            break;
          }
        }
      }
    }

    handleVerticalCollisions(level, particles) {
      this.y += this.vy;
      this.isGrounded = false;

      const leftTile = Math.floor(this.x / level.tileSize);
      const rightTile = Math.floor((this.x + this.width - 1) / level.tileSize);

      if (this.vy > 0) {
        // falling down
        const bottomEdge = this.y + this.height;
        const row = Math.floor(bottomEdge / level.tileSize);

        for (let c = leftTile; c <= rightTile; c++) {
          if (level.isSolidBlock(c, row) || level.isOneWayPlatform(c, row, bottomEdge - this.vy)) {
            this.y = row * level.tileSize - this.height;
            this.vy = 0;
            this.isGrounded = true;
            break;
          }
        }
      } else if (this.vy < 0) {
        // jumping up
        const topEdge = this.y;
        const row = Math.floor(topEdge / level.tileSize);

        for (let c = leftTile; c <= rightTile; c++) {
          if (level.isSolidBlock(c, row)) {
            // Hit block from below!
            level.hitBlock(c, row, this, particles);
            this.y = (row + 1) * level.tileSize;
            this.vy = 0;
            break;
          }
        }
      }

      // Pit death check
      if (this.y > level.height * level.tileSize + 16) {
        this.takeDamage(999, particles);
      }
    }

    updateAnimation() {
      this.animTimer++;
      if (this.animTimer > 8) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
      }

      if (this.isDead) {
        this.state = 'defeat';
      } else if (this.hurtTimer > 40) {
        this.state = 'hurt';
      } else if (this.attackTimer > 0) {
        this.state = 'attack';
      } else if (!this.isGrounded) {
        this.state = this.vy < 0 ? 'jump' : 'fall';
      } else if (Math.abs(this.vx) > 0.3) {
        this.state = Math.abs(this.vx) > 4 ? 'run' : 'walk';
      } else {
        this.state = 'idle';
      }
    }

    draw(ctx) {
      if (this.hurtTimer > 0 && Math.floor(this.hurtTimer / 4) % 2 === 0) {
        return; // Flash effect when hurt
      }

      ctx.save();
      const drawX = Math.round(this.x);
      const drawY = Math.round(this.y);

      // Flip canvas if facing left
      if (this.facing === -1) {
        ctx.translate(drawX + this.width, drawY);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(drawX, drawY);
      }

      if (this.isMounted) {
        // Render Gato Preto mount + Galiano on top
        const catSprite = this.getCatSprite();
        const galianoSprite = this.getGalianoMountedSprite();

        // Draw Cat (aligned with ground at bottom)
        if (catSprite) {
          ctx.drawImage(catSprite, 0, 8);
        }

        // Draw Galiano sitting on Cat's back
        if (galianoSprite) {
          ctx.drawImage(galianoSprite, 6, -10);
        }

        // If equipped with weapon, show backpack blaster
        if (this.hasWeapon) {
          const bpSprite = Sprites.get('backpack_item');
          if (bpSprite) {
            ctx.drawImage(bpSprite, 0, -4, 18, 18);
          }
        }

        // Cat Chomp effect (NHAC! +300)
        if (this.catChompTimer > 0) {
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('★ NHAC! +300', 22, -18);
        }
      } else {
        // Normal Galiano on foot
        const sprite = this.getGalianoSprite();
        if (sprite) {
          ctx.drawImage(sprite, 0, 0);
        }

        // Draw backpack on back if equipped
        if (this.hasWeapon && this.state !== 'attack') {
          const bpSprite = Sprites.get('backpack_item');
          if (bpSprite) {
            ctx.drawImage(bpSprite, -4, 14, 16, 16);
          }
        }
      }

      ctx.restore();
    }

    getGalianoSprite() {
      switch (this.state) {
        case 'walk':
        case 'run':
          return Sprites.get('galiano_walk')[this.animFrame % 4];
        case 'jump':
          return Sprites.get('galiano_jump');
        case 'fall':
          return Sprites.get('galiano_fall');
        case 'attack':
          return Sprites.get('galiano_attack');
        case 'hurt':
          return Sprites.get('galiano_hurt');
        case 'defeat':
          return Sprites.get('galiano_defeat');
        case 'idle':
        default:
          return Sprites.get('galiano_idle')[this.animFrame % 4];
      }
    }

    getCatSprite() {
      if (!this.isGrounded) {
        return Sprites.get('cat_jump');
      }
      if (Math.abs(this.vx) > 0.3) {
        return Sprites.get('cat_walk')[this.animFrame % 4];
      }
      return Sprites.get('cat_idle')[this.animFrame % 4];
    }

    getGalianoMountedSprite() {
      if (this.state === 'attack') {
        return Sprites.get('galiano_attack');
      }
      if (!this.isGrounded) {
        return Sprites.get('galiano_jump');
      }
      return Sprites.get('galiano_idle')[0];
    }
  }

  // --- WEAPON PICKUP ITEM (MOCHILA - REFERENCE 4) ---
  class WeaponItem {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.width = 32;
      this.height = 32;
      this.baseY = y;
      this.timer = 0;
      this.collected = false;
    }

    update(player, particles) {
      if (this.collected) return;
      this.timer++;
      this.y = this.baseY + Math.sin(this.timer * 0.08) * 6;

      // Aura particles
      if (Math.random() < 0.3) {
        particles.emit(
          this.x + Math.random() * this.width,
          this.y + Math.random() * this.height,
          '#facc15', 1, 1, 2, 20
        );
      }

      // Check pickup by Galiano
      if (Physics.checkOverlap(this, player)) {
        this.collected = true;
        player.hasWeapon = true;
        SoundEngine.playPowerup();
        particles.emitSparks(this.x + 16, this.y + 16, 20);
      }
    }

    draw(ctx) {
      if (this.collected) return;
      const sprite = Sprites.get('backpack_item');
      if (sprite) {
        // Glowing halo
        ctx.save();
        ctx.fillStyle = 'rgba(0, 242, 254, 0.2)';
        ctx.beginPath();
        ctx.arc(this.x + 16, this.y + 16, 20 + Math.sin(this.timer * 0.1) * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.drawImage(sprite, Math.round(this.x), Math.round(this.y));
        ctx.restore();
      }
    }
  }

  // --- ENEMY: ARANHA (SPIDER - REFERENCE 5) ---
  class Spider {
    constructor(x, y, patrolDist = 120) {
      this.x = x;
      this.y = y;
      this.startX = x;
      this.patrolDist = patrolDist;
      this.vx = 1.2;
      this.vy = 0;
      this.width = 36;
      this.height = 24;

      this.alive = true;
      this.squishedTimer = 0;
      this.animTimer = 0;
      this.animFrame = 0;
    }

    update(level, player, particles, projectiles) {
      if (!this.alive) {
        if (this.squishedTimer > 0) this.squishedTimer--;
        return;
      }

      this.animTimer++;
      if (this.animTimer > 10) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 2;
      }

      // Gravity & floor collision for Spider
      this.vy += 0.4;
      if (this.vy > 8) this.vy = 8;
      this.y += this.vy;

      const bottomY = this.y + this.height;
      const footCol = Math.floor((this.x + this.width / 2) / level.tileSize);
      const footRow = Math.floor(bottomY / level.tileSize);
      if (level.isSolidBlock(footCol, footRow) || level.isOneWayPlatform(footCol, footRow, bottomY - this.vy)) {
        this.y = footRow * level.tileSize - this.height;
        this.vy = 0;
      }

      // Patrol logic
      this.x += this.vx;
      if (this.x > this.startX + this.patrolDist || this.x < this.startX - this.patrolDist) {
        this.vx *= -1;
      }

      // Wall collision check
      const nextX = this.vx > 0 ? this.x + this.width + 2 : this.x - 2;
      if (level.isSolidAt(nextX, this.y + this.height / 2)) {
        this.vx *= -1;
      }

      // Ledge / edge check (don't walk off cliffs)
      const nextFootCol = Math.floor(nextX / level.tileSize);
      const nextFootRow = Math.floor((this.y + this.height + 4) / level.tileSize);
      if (!level.isSolidBlock(nextFootCol, nextFootRow) && !level.isOneWayPlatform(nextFootCol, nextFootRow, this.y + this.height)) {
        this.vx *= -1;
      }

      // Check collision with Player projectiles
      for (const proj of projectiles) {
        if (proj.alive && !proj.isEnemy && Physics.checkOverlap(this, proj)) {
          proj.alive = false;
          this.defeat(particles, false);
          player.score += 200;
          return;
        }
      }

      // Check collision with Player
      if (player.hurtTimer <= 0 && Physics.checkOverlap(this, player)) {
        if (player.isMounted) {
          // GATO PRETO COME A ARANHA! (Estilo Yoshi - Não perde vida!)
          this.alive = false;
          SoundEngine.playCatChomp();
          player.score += 300;
          player.catChompTimer = 25;
          particles.emit(this.x + this.width / 2, this.y + this.height / 2, '#facc15', 12, 3, 3, 20);
          particles.emit(this.x + this.width / 2, this.y + this.height / 2, '#4ade80', 8, 2, 2.5, 20);
          return;
        }

        // Check if player jumped on spider's head
        const playerBottom = player.y + player.height;
        if (player.vy > 0 && playerBottom < this.y + 16) {
          // Stomped!
          this.defeat(particles, true);
          player.vy = -8.5; // bounce player
          player.score += 200;
          SoundEngine.playEnemyHit();
        } else {
          // Player hurt!
          player.takeDamage(1, particles);
        }
      }
    }

    defeat(particles, wasStomped) {
      this.alive = false;
      SoundEngine.playEnemyHit();
      if (wasStomped) {
        this.squishedTimer = 35;
      } else {
        particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 16);
      }
    }

    draw(ctx) {
      if (!this.alive && this.squishedTimer <= 0) return;

      ctx.save();
      const drawX = Math.round(this.x);
      const drawY = Math.round(this.y);

      if (this.vx < 0) {
        ctx.translate(drawX + this.width, drawY);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(drawX, drawY);
      }

      if (!this.alive && this.squishedTimer > 0) {
        const squishSprite = Sprites.get('spider_squished');
        if (squishSprite) ctx.drawImage(squishSprite, 0, 8);
      } else {
        const walkSprite = Sprites.get('spider_walk')[this.animFrame];
        if (walkSprite) ctx.drawImage(walkSprite, 0, 0);
      }

      ctx.restore();
    }
  }

  // --- FINAL BOSS: BARBA AMARELA (REFERENCE 3) ---
  class BossBarbaAmarela {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.startX = x;
      this.startY = y;
      this.width = 56;
      this.height = 64;

      this.hp = 100;
      this.maxHp = 100;
      this.state = 'idle'; // idle, cast, hurt, teleport, defeated
      this.stateTimer = 0;
      this.attackCycle = 0;
      this.hoverTimer = 0;

      this.hurtFlash = 0;
      this.isDefeated = false;
    }

    update(player, level, particles, projectiles) {
      if (this.isDefeated) {
        this.state = 'defeated';
        return;
      }

      this.hoverTimer += 0.05;
      this.y = this.startY + Math.sin(this.hoverTimer) * 18;

      if (this.hurtFlash > 0) this.hurtFlash--;

      // State Machine
      this.stateTimer++;
      if (this.state === 'idle') {
        if (this.stateTimer > 90) {
          this.stateTimer = 0;
          this.attackCycle = (this.attackCycle + 1) % 3;
          this.state = 'cast';
        }
      } else if (this.state === 'cast') {
        // Charging orb and attacking
        if (this.stateTimer === 30) {
          this.executeAttack(player, projectiles, particles);
        } else if (this.stateTimer > 60) {
          this.state = 'idle';
          this.stateTimer = 0;
        }
      }

      // Check hit by player's projectiles
      for (const proj of projectiles) {
        if (proj.alive && !proj.isEnemy && Physics.checkOverlap(this, proj)) {
          proj.alive = false;
          this.takeDamage(10, particles);
          break;
        }
      }

      // Boss damages player on contact
      if (player.hurtTimer <= 0 && Physics.checkOverlap(this, player)) {
        player.takeDamage(1, particles);
      }
    }

    executeAttack(player, projectiles, particles) {
      SoundEngine.playBossRoar();
      const originX = this.x + 12;
      const originY = this.y + 24;

      if (this.attackCycle === 0) {
        // Double magic orb blast directly aimed at player
        const dx = (player.x + player.width / 2) - originX;
        const dy = (player.y + player.height / 2) - originY;
        const dist = Math.hypot(dx, dy) || 1;
        const speed = 4.2;

        projectiles.push(new Projectile(originX, originY, (dx / dist) * speed, (dy / dist) * speed, true));
      } else if (this.attackCycle === 1) {
        // Triple spread orb blast
        projectiles.push(new Projectile(originX, originY, -4.5, -1.5, true));
        projectiles.push(new Projectile(originX, originY, -5.0, 0, true));
        projectiles.push(new Projectile(originX, originY, -4.5, 1.5, true));
      } else {
        // Golden Beard Lightning shockwave across floor
        particles.emitSparks(this.x + 28, this.y + 50, 25);
        projectiles.push(new Projectile(originX, this.startY + 40, -5.5, 0, true));
      }
    }

    takeDamage(amount, particles) {
      if (this.hurtFlash > 0 || this.isDefeated) return;
      this.hp -= amount;
      this.hurtFlash = 20;
      SoundEngine.playEnemyHit();
      particles.emitSparks(this.x + this.width / 2, this.y + this.height / 2, 15);

      if (this.hp <= 0) {
        this.hp = 0;
        this.isDefeated = true;
        this.state = 'defeated';
        SoundEngine.playBossRoar();
      }
    }

    draw(ctx) {
      ctx.save();
      const drawX = Math.round(this.x);
      const drawY = Math.round(this.y);

      // Flashing when hurt
      if (this.hurtFlash > 0 && Math.floor(this.hurtFlash / 3) % 2 === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(drawX, drawY, this.width, this.height);
        ctx.restore();
        return;
      }

      let sprite;
      if (this.state === 'cast') {
        sprite = Sprites.get('boss_cast');
      } else {
        const frame = Math.floor(this.hoverTimer * 2) % 2;
        sprite = Sprites.get('boss_idle')[frame];
      }

      if (sprite) {
        ctx.drawImage(sprite, drawX, drawY);
      }

      ctx.restore();
    }
  }

  // --- CIVILIANS (CIVIS - LEVEL 5 RESCUE TARGETS) ---
  class CivilianCage {
    constructor(x, y, id, name = "Civil") {
      this.x = x;
      this.y = y;
      this.id = id;
      this.name = name;
      this.width = 28;
      this.height = 36;
      this.isRescued = false;
      this.hp = 3; // takes 3 hits to shatter cage
      this.cheerTimer = 0;
    }

    update(player, particles, projectiles) {
      if (this.isRescued) {
        this.cheerTimer++;
        return;
      }

      // Hit by player projectile
      for (const proj of projectiles) {
        if (proj.alive && !proj.isEnemy && Physics.checkOverlap(this, proj)) {
          proj.alive = false;
          this.hp--;
          particles.emitSparks(this.x + 14, this.y + 18, 8);
          SoundEngine.playEnemyHit();

          if (this.hp <= 0) {
            this.rescue(particles);
          }
          break;
        }
      }

      // Stomped or touched by player
      if (Physics.checkOverlap(this, player) && player.vy > 0 && player.y + player.height < this.y + 16) {
        player.vy = -6;
        this.hp--;
        particles.emitSparks(this.x + 14, this.y + 18, 8);
        SoundEngine.playEnemyHit();
        if (this.hp <= 0) {
          this.rescue(particles);
        }
      }
    }

    rescue(particles) {
      this.isRescued = true;
      SoundEngine.playRescue();
      particles.emitSparks(this.x + 14, this.y + 18, 25);
    }

    draw(ctx) {
      const sprite = this.isRescued
        ? Sprites.get('civilian_free')
        : Sprites.get('civilian_trapped');

      if (sprite) {
        const bob = this.isRescued ? Math.sin(this.cheerTimer * 0.15) * 4 : 0;
        ctx.drawImage(sprite, Math.round(this.x), Math.round(this.y + bob));
      }
    }
  }

  // --- COLLECTIBLE COIN ---
  class Coin {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.width = 16;
      this.height = 16;
      this.collected = false;
      this.animTimer = 0;
      this.animFrame = 0;
    }

    update(player, particles) {
      if (this.collected) return;
      this.animTimer++;
      if (this.animTimer > 8) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
      }

      if (Physics.checkOverlap(this, player)) {
        this.collected = true;
        player.coins++;
        player.score += 100;
        SoundEngine.playCoin();
        particles.emit(this.x + 8, this.y + 8, '#facc15', 8, 2.5, 2, 20);
      }
    }

    draw(ctx) {
      if (this.collected) return;
      const sprite = Sprites.get('coins')[this.animFrame];
      if (sprite) {
        ctx.drawImage(sprite, Math.round(this.x), Math.round(this.y));
      }
    }
  }

  return {
    Player,
    WeaponItem,
    Spider,
    BossBarbaAmarela,
    CivilianCage,
    Coin,
    Projectile
  };
})();

if (typeof window !== 'undefined') {
  window.Entities = Entities;
}
