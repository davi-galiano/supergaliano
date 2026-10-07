/**
 * SUPER GALIANO - Level Designs & Environments
 * Phase 1: Tarde Ensolarada (Sunny Afternoon)
 * Phase 2: Cidade à Noite (City at Night with "CITY OF GALIANO" Billboard)
 * Phase 3: Arma e Aranhas (Backpack Weapon & Spiders)
 * Phase 4: Gato Preto (Mounted on Yoshi-style Black Cat)
 * Phase 5: Boss Barba Amarela (Grand Throne Arena & Civilian Rescue)
 */

const LevelManager = (() => {
  const TILE_SIZE = 32;

  // Level representation class
  class Level {
    constructor(def) {
      this.id = def.id;
      this.title = def.title;
      this.subtitle = def.subtitle;
      this.theme = def.theme; // sunny, city, spiders, cat, boss
      this.tileSize = TILE_SIZE;

      this.width = def.width;   // in tiles
      this.height = def.height; // in tiles (typically 14-16 tiles = 448-512px)

      this.tiles = def.tiles;   // 2D grid of chars
      this.spawnX = def.spawnX * TILE_SIZE;
      this.spawnY = def.spawnY * TILE_SIZE;
      this.goalX = def.goalX * TILE_SIZE;

      this.bgMusic = def.bgMusic;
      this.hasBillboard = !!def.hasBillboard;
      this.billboardX = def.billboardX ? def.billboardX * TILE_SIZE : 0;
      this.billboardY = def.billboardY ? def.billboardY * TILE_SIZE : 0;

      // Entity spawns
      this.enemyDefs = def.enemies || [];
      this.coinDefs = def.coins || [];
      this.weaponDef = def.weapon || null;
      this.civilianDefs = def.civilians || [];
      this.bossDef = def.boss || null;

      // Preloaded instances
      this.enemies = [];
      this.coins = [];
      this.weaponItem = null;
      this.civilians = [];
      this.boss = null;
      this.projectiles = [];
      this.particles = new Physics.ParticlePool();

      this.isCompleted = false;
      this.cloudOffsets = [0, 180, 420, 680, 950, 1300, 1700, 2200];
    }

    resetEntities(player) {
      this.isCompleted = false;
      this.projectiles = [];
      this.particles.clear();

      // Spawn weapon if level has one
      if (this.weaponDef) {
        this.weaponItem = new Entities.WeaponItem(
          this.weaponDef.x * TILE_SIZE,
          this.weaponDef.y * TILE_SIZE
        );
      } else {
        this.weaponItem = null;
      }

      // Spawn coins
      this.coins = this.coinDefs.map(c => new Entities.Coin(c.x * TILE_SIZE, c.y * TILE_SIZE));

      // Spawn enemies
      this.enemies = this.enemyDefs.map(e => new Entities.Spider(e.x * TILE_SIZE, e.y * TILE_SIZE, e.dist));

      // Spawn civilians
      this.civilians = this.civilianDefs.map((c, i) => new Entities.CivilianCage(c.x * TILE_SIZE, c.y * TILE_SIZE, i, c.name));

      // Spawn Boss
      if (this.bossDef) {
        this.boss = new Entities.BossBarbaAmarela(this.bossDef.x * TILE_SIZE, this.bossDef.y * TILE_SIZE);
      } else {
        this.boss = null;
      }

      // Phase specific player states
      if (this.id === 4 || this.id === 5) {
        player.isMounted = true;
      } else {
        player.isMounted = false;
      }

      if (this.id >= 3) {
        if (this.id > 3 || (this.weaponDef && this.weaponItem && this.weaponItem.collected)) {
          player.hasWeapon = true;
        }
      }
    }

    isSolidBlock(col, row) {
      if (col < 0 || col >= this.width || row < 0 || row >= this.height) {
        return col < 0 || col >= this.width; // bounds are walls
      }
      const char = this.tiles[row][col];
      return char === '#' || char === 'G' || char === 'D' || char === '?' || char === 'B' || char === 'M' || char === 'N' || char === 'R';
    }

    isOneWayPlatform(col, row, prevY) {
      if (col < 0 || col >= this.width || row < 0 || row >= this.height) return false;
      const char = this.tiles[row][col];
      if (char === '=') {
        const platformTop = row * this.tileSize;
        return prevY <= platformTop + 4;
      }
      return false;
    }

    isSolidAt(pixelX, pixelY) {
      const c = Math.floor(pixelX / this.tileSize);
      const r = Math.floor(pixelY / this.tileSize);
      return this.isSolidBlock(c, r);
    }

    hitBlock(col, row, player, particles) {
      if (col < 0 || col >= this.width || row < 0 || row >= this.height) return;
      const char = this.tiles[row][col];

      if (char === '?') {
        // Turn question block into metallic empty block
        const rowStr = this.tiles[row];
        this.tiles[row] = rowStr.substring(0, col) + 'M' + rowStr.substring(col + 1);

        player.coins++;
        player.score += 200;
        SoundEngine.playCoin();
        particles.emit(col * this.tileSize + 16, row * this.tileSize - 8, '#facc15', 10, 2.5, 3, 20);
      } else if (char === 'B') {
        // Brick block bump
        SoundEngine.playEnemyHit();
        particles.emit(col * this.tileSize + 16, row * this.tileSize + 16, '#b45309', 6, 2, 2.5, 15);
      }
    }

    update(player) {
      // Update entities
      if (this.weaponItem) {
        this.weaponItem.update(player, this.particles);
      }

      for (const coin of this.coins) {
        coin.update(player, this.particles);
      }

      for (const enemy of this.enemies) {
        enemy.update(this, player, this.particles, this.projectiles);
      }

      for (const civilian of this.civilians) {
        civilian.update(player, this.particles, this.projectiles);
      }

      if (this.boss) {
        this.boss.update(player, this, this.particles, this.projectiles);
      }

      // Update projectiles
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const proj = this.projectiles[i];
        proj.update(this, this.particles);
        if (!proj.alive) {
          this.projectiles.splice(i, 1);
        }
      }

      this.particles.update();

      // Check level completion goal
      if (this.id === 5) {
        // Boss level: beat boss AND rescue all civilians
        const allRescued = this.civilians.every(c => c.isRescued);
        if (this.boss && this.boss.isDefeated && allRescued) {
          this.isCompleted = true;
        }
      } else {
        // Normal levels: reach end goal zone
        if (player.x >= this.goalX) {
          this.isCompleted = true;
        }
      }
    }

    drawBackground(ctx, cameraX, canvasWidth, canvasHeight) {
      if (this.theme === 'sunny') {
        // Sunny Sky Gradient
        const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        grad.addColorStop(0, '#60a5fa');
        grad.addColorStop(0.65, '#93c5fd');
        grad.addColorStop(1, '#fed7aa'); // warm afternoon horizon
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Radiant pixel sun
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(canvasWidth - 110, 85, 42, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(canvasWidth - 110, 85, 34, 0, Math.PI * 2);
        ctx.fill();

        // Parallax Clouds
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < this.cloudOffsets.length; i++) {
          const cx = ((this.cloudOffsets[i] - cameraX * 0.25) % (canvasWidth + 240)) - 100;
          const cy = 40 + (i % 3) * 35;
          this.drawPixelCloud(ctx, cx, cy);
        }

        // Rolling Hills in background (parallax 0.4, cleanly stays above ground level)
        ctx.fillStyle = '#86efac';
        for (let x = -200; x < this.width * TILE_SIZE; x += 360) {
          const hillX = x - cameraX * 0.4;
          if (hillX > -300 && hillX < canvasWidth + 300) {
            ctx.beginPath();
            ctx.arc(hillX + 180, 316, 120, Math.PI, 0);
            ctx.fill();
          }
        }
      } else if (this.theme === 'city') {
        // Night City Sky
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Stars
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 45; i++) {
          const sx = ((i * 73 - cameraX * 0.05) % canvasWidth + canvasWidth) % canvasWidth;
          const sy = (i * 37) % (canvasHeight - 160);
          ctx.fillRect(sx, sy, (i % 2 === 0 ? 2 : 1), (i % 2 === 0 ? 2 : 1));
        }

        // Glowing Crescent Moon
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(canvasWidth - 90, 70, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(canvasWidth - 80, 65, 22, 0, Math.PI * 2);
        ctx.fill();

        // Parallax Skyline Buildings
        for (let x = -100; x < this.width * TILE_SIZE; x += 110) {
          const bx = x - cameraX * 0.3;
          if (bx > -150 && bx < canvasWidth + 150) {
            const bHeight = 160 + ((x * 17) % 120);
            const bWidth = 85;
            ctx.fillStyle = '#1e1b4b';
            ctx.fillRect(bx, canvasHeight - bHeight, bWidth, bHeight);

            // Windows
            ctx.fillStyle = '#fef08a';
            for (let wy = canvasHeight - bHeight + 15; wy < canvasHeight - 30; wy += 22) {
              for (let wx = bx + 10; wx < bx + bWidth - 15; wx += 20) {
                if (((wx + wy) % 5) !== 0) {
                  ctx.fillRect(wx, wy, 8, 12);
                }
              }
            }
          }
        }
      } else if (this.theme === 'spiders') {
        // Dark Cavern / Facility
        const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        grad.addColorStop(0, '#0f0c20');
        grad.addColorStop(1, '#241a45');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Glowing purple energy veins in background
        ctx.fillStyle = '#3b2d71';
        for (let x = -50; x < this.width * TILE_SIZE; x += 180) {
          const px = x - cameraX * 0.35;
          if (px > -100 && px < canvasWidth + 100) {
            ctx.fillRect(px, 40, 24, canvasHeight - 40);
            ctx.fillStyle = '#a855f7';
            ctx.fillRect(px + 8, 80, 8, 60);
            ctx.fillStyle = '#3b2d71';
          }
        }
      } else if (this.theme === 'cat') {
        // Twilight Mystic Sky
        const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        grad.addColorStop(0, '#1e1b4b');
        grad.addColorStop(0.5, '#4c1d95');
        grad.addColorStop(1, '#831843');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Golden stars
        ctx.fillStyle = '#fde047';
        for (let i = 0; i < 35; i++) {
          const sx = ((i * 89 - cameraX * 0.1) % canvasWidth + canvasWidth) % canvasWidth;
          const sy = (i * 29) % (canvasHeight - 140);
          ctx.fillRect(sx, sy, 2, 2);
        }
      } else if (this.theme === 'boss') {
        // Grand Throne Room / Barba Amarela Arena
        const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
        grad.addColorStop(0, '#1c1917');
        grad.addColorStop(0.5, '#292524');
        grad.addColorStop(1, '#451a03');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Grand stone pillars
        for (let x = 60; x < this.width * TILE_SIZE; x += 220) {
          const px = x - cameraX * 0.6;
          ctx.fillStyle = '#78350f';
          ctx.fillRect(px, 30, 36, canvasHeight - 30);
          ctx.fillStyle = '#b45309';
          ctx.fillRect(px + 4, 30, 8, canvasHeight - 30);
          // Torches
          ctx.fillStyle = '#facc15';
          ctx.fillRect(px + 14, 120, 8, 12);
        }
      }
    }

    drawPixelCloud(ctx, x, y) {
      ctx.fillRect(x + 16, y, 48, 16);
      ctx.fillRect(x + 8, y + 8, 64, 16);
      ctx.fillRect(x, y + 16, 80, 16);
    }

    drawWorld(ctx, cameraX, canvasWidth, canvasHeight) {
      // 1. Draw Billboard if present ("CITY OF GALIANO")
      if (this.hasBillboard) {
        const bb = Sprites.get('billboard');
        if (bb) {
          ctx.drawImage(bb, Math.round(this.billboardX), Math.round(this.billboardY));
        }
      }

      // 2. Draw Pit Abyss & Hazard signs for ground holes
      const startCol = Math.max(0, Math.floor(cameraX / this.tileSize));
      const endCol = Math.min(this.width, Math.ceil((cameraX + canvasWidth) / this.tileSize) + 1);

      if (this.tiles[10]) {
        for (let c = startCol; c < endCol; c++) {
          if (this.tiles[10][c] === '.') {
            const px = c * this.tileSize;

            // Deep dark chasm void
            const abyssGrad = ctx.createLinearGradient(0, 320, 0, 384);
            abyssGrad.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
            abyssGrad.addColorStop(0.4, '#090d16');
            abyssGrad.addColorStop(1, '#000000');
            ctx.fillStyle = abyssGrad;
            ctx.fillRect(px, 320, this.tileSize, 64);

            // Subtle danger crimson mist at the very bottom
            ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
            ctx.fillRect(px, 368, this.tileSize, 16);

            // Cliff edge shadow on neighboring solid left tile
            if (c > 0 && this.tiles[10][c - 1] !== '.') {
              ctx.fillStyle = '#020617';
              ctx.fillRect(px, 320, 4, 64);
              this.drawHazardSign(ctx, px - 20, 296);
            }

            // Cliff edge shadow on neighboring solid right tile
            if (c < this.width - 1 && this.tiles[10][c + 1] !== '.') {
              ctx.fillStyle = '#020617';
              ctx.fillRect(px + this.tileSize - 4, 320, 4, 64);
            }
          }
        }
      }

      // 3. Draw Tiles
      for (let r = 0; r < this.height; r++) {
        for (let c = startCol; c < endCol; c++) {
          const char = this.tiles[r][c];
          const px = c * this.tileSize;
          const py = r * this.tileSize;

          if (char === 'G') {
            // Grass tile
            const sprite = Sprites.get('tile_grass');
            if (sprite) ctx.drawImage(sprite, px, py);
          } else if (char === 'D') {
            // Dirt tile
            ctx.fillStyle = '#78350f';
            ctx.fillRect(px, py, this.tileSize, this.tileSize);
            ctx.fillStyle = '#5c2707';
            ctx.fillRect(px + 4, py + 4, 8, 8);
          } else if (char === 'B' || char === '#') {
            // Brick tile
            const sprite = Sprites.get('tile_brick');
            if (sprite) ctx.drawImage(sprite, px, py);
          } else if (char === '?') {
            // Question block
            const sprite = Sprites.get('tile_question');
            if (sprite) ctx.drawImage(sprite, px, py);
          } else if (char === 'M') {
            // Spent metal block
            ctx.fillStyle = '#64748b';
            ctx.fillRect(px, py, this.tileSize, this.tileSize);
            ctx.strokeStyle = '#334155';
            ctx.strokeRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
          } else if (char === '=') {
            // Semi-solid bridge / girder
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(px, py, this.tileSize, 8);
            ctx.fillStyle = '#64748b';
            ctx.fillRect(px, py + 8, this.tileSize, 4);
          } else if (char === 'N') {
            // City asphalt road
            const sprite = Sprites.get('tile_city');
            if (sprite) ctx.drawImage(sprite, px, py);
          }
        }
      }

      // 4. Draw Goal Arch / Flagpole
      if (this.id < 5) {
        this.drawGoalPost(ctx, this.goalX);
      }

      // 5. Draw Entities
      if (this.weaponItem) this.weaponItem.draw(ctx);
      for (const coin of this.coins) coin.draw(ctx);
      for (const enemy of this.enemies) enemy.draw(ctx);
      for (const civilian of this.civilians) civilian.draw(ctx);
      if (this.boss) this.boss.draw(ctx);

      for (const proj of this.projectiles) proj.draw(ctx);
      this.particles.draw(ctx);
    }

    drawHazardSign(ctx, x, y) {
      // Signpost: metal pole
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 5, y + 8, 3, 16);

      // Yellow warning diamond
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(x + 6, y);
      ctx.lineTo(x + 13, y + 7);
      ctx.lineTo(x + 6, y + 14);
      ctx.lineTo(x - 1, y + 7);
      ctx.closePath();
      ctx.fill();

      // Black diamond border
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      // "!" exclamation mark
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 5.5, y + 3, 1.5, 5);
      ctx.fillRect(x + 5.5, y + 10, 1.5, 1.5);
    }

    drawGoalPost(ctx, gx) {
      // Mario-style Goal Flagpole & Golden Arch (rests on row 10 at y=320)
      const gy = 140;
      // Pole
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(gx + 12, gy, 6, 180);
      // Gold top sphere
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(gx + 15, gy, 9, 0, Math.PI * 2);
      ctx.fill();
      // Flag
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(gx + 18, gy + 12);
      ctx.lineTo(gx + 54, gy + 28);
      ctx.lineTo(gx + 18, gy + 44);
      ctx.fill();

      // Sign: META / PRÓXIMA FASE
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(gx - 20, 296, 70, 24);
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('META ▶', gx + 15, 312);
    }
  }

  // --- LEVEL DEFINITIONS ---

  // Helper to build tile rows easily
  function buildMap(width, height, groundChar, platforms = []) {
    const grid = [];
    for (let r = 0; r < height; r++) {
      grid.push(new Array(width).fill('.'));
    }

    // Ground floor at bottom 2 rows
    for (let c = 0; c < width; c++) {
      grid[height - 2][c] = groundChar;
      grid[height - 1][c] = (groundChar === 'G' ? 'D' : groundChar);
    }

    // Insert platforms
    for (const p of platforms) {
      for (let c = p.x; c < p.x + p.w; c++) {
        if (c < width) {
          grid[p.y][c] = p.type;
        }
      }
    }

    return grid.map(row => row.join(''));
  }

  // 1. FASE 1: TARDE ENSOLARADA
  function createLevel1() {
    const width = 110;
    const height = 12; // 12 tiles * 32px = 384px (fits screen perfectly!)
    const platforms = [
      // Clearly defined pit gaps at rows 10 & 11
      { x: 20, w: 3, y: 10, type: '.' },
      { x: 20, w: 3, y: 11, type: '.' },
      { x: 44, w: 4, y: 10, type: '.' },
      { x: 44, w: 4, y: 11, type: '.' },
      { x: 72, w: 3, y: 10, type: '.' },
      { x: 72, w: 3, y: 11, type: '.' },

      // Elevated blocks and question marks
      { x: 8, w: 1, y: 7, type: '?' },
      { x: 9, w: 1, y: 7, type: 'B' },
      { x: 10, w: 1, y: 7, type: '?' },
      { x: 11, w: 1, y: 7, type: 'B' },
      { x: 12, w: 1, y: 7, type: '?' },

      // Bridges over Pit 1
      { x: 21, w: 1, y: 8, type: '=' },

      { x: 30, w: 4, y: 7, type: 'B' },
      { x: 32, w: 1, y: 4, type: '?' },

      // Platform over Pit 2
      { x: 45, w: 2, y: 7, type: '=' },

      { x: 55, w: 5, y: 7, type: 'G' },
      { x: 57, w: 1, y: 4, type: '?' },

      // Platform over Pit 3
      { x: 73, w: 1, y: 8, type: '=' },

      { x: 84, w: 6, y: 7, type: 'B' },
      { x: 86, w: 2, y: 4, type: '?' },

      // Goal staircase
      { x: 94, w: 2, y: 9, type: 'G' },
      { x: 96, w: 2, y: 8, type: 'G' },
      { x: 98, w: 2, y: 7, type: 'G' }
    ];

    const tiles = buildMap(width, height, 'G', platforms);

    return new Level({
      id: 1,
      title: "FASE 1:Café?",
      subtitle: "Uma jornada clássica pelo campo florido de Galiano!",
      theme: 'sunny',
      width,
      height,
      tiles,
      spawnX: 3,
      spawnY: 8,
      goalX: 102,
      bgMusic: 'sunny',
      coins: [
        { x: 8, y: 6 }, { x: 10, y: 6 }, { x: 12, y: 6 },
        { x: 31, y: 6 }, { x: 33, y: 6 },
        { x: 45, y: 6 }, { x: 46, y: 6 },
        { x: 56, y: 6 }, { x: 58, y: 6 },
        { x: 85, y: 6 }, { x: 87, y: 6 }
      ],
      enemies: [
        { x: 15, y: 9, dist: 60 },
        { x: 28, y: 9, dist: 80 },
        { x: 50, y: 9, dist: 80 },
        { x: 64, y: 9, dist: 90 },
        { x: 80, y: 9, dist: 80 }
      ]
    });
  }

  // 2. FASE 2: CIDADE À NOITE (with "CITY OF GALIANO" Billboard!)
  function createLevel2() {
    const width = 115;
    const height = 12;
    const platforms = [
      // Street pits at rows 10 & 11
      { x: 22, w: 4, y: 10, type: '.' },
      { x: 22, w: 4, y: 11, type: '.' },
      { x: 52, w: 4, y: 10, type: '.' },
      { x: 52, w: 4, y: 11, type: '.' },
      { x: 78, w: 5, y: 10, type: '.' },
      { x: 78, w: 5, y: 11, type: '.' },

      // Rooftops and fire escape metal platforms
      { x: 10, w: 6, y: 7, type: '=' },
      { x: 12, w: 2, y: 4, type: '?' },

      // Bridge over Pit 1
      { x: 23, w: 2, y: 8, type: '=' },

      // Large Building with Rooftop holding the Billboard
      { x: 32, w: 14, y: 6, type: '#' },
      { x: 34, w: 4, y: 4, type: '=' },

      // Bridge over Pit 2
      { x: 53, w: 2, y: 7, type: '=' },

      { x: 62, w: 7, y: 7, type: '#' },
      { x: 64, w: 2, y: 4, type: '?' },

      // Bridge over Pit 3
      { x: 79, w: 3, y: 8, type: '=' },

      { x: 88, w: 8, y: 7, type: '#' },
      { x: 98, w: 5, y: 8, type: '=' }
    ];

    const tiles = buildMap(width, height, 'N', platforms);

    return new Level({
      id: 2,
      title: "FASE 2: A Cidade de Galiano",
      subtitle: "Sob as luzes da vibrante metrópole!",
      theme: 'city',
      width,
      height,
      tiles,
      spawnX: 3,
      spawnY: 8,
      goalX: 108,
      bgMusic: 'city',
      hasBillboard: true,
      billboardX: 33, // Sits on top of the rooftop
      billboardY: 1.5,
      coins: [
        { x: 11, y: 6 }, { x: 13, y: 6 },
        { x: 33, y: 5 }, { x: 35, y: 3 }, { x: 37, y: 5 },
        { x: 63, y: 6 }, { x: 65, y: 6 },
        { x: 89, y: 6 }, { x: 91, y: 6 }
      ],
      enemies: [
        { x: 16, y: 9, dist: 70 },
        { x: 38, y: 5, dist: 60 },
        { x: 46, y: 9, dist: 80 },
        { x: 66, y: 6, dist: 60 },
        { x: 72, y: 9, dist: 70 },
        { x: 90, y: 6, dist: 60 }
      ]
    });
  }

  // 3. FASE 3: ARMA E ARANHAS (Weapon & Spiders)
  function createLevel3() {
    const width = 115;
    const height = 12;
    const platforms = [
      // Pit chasms
      { x: 22, w: 4, y: 10, type: '.' },
      { x: 22, w: 4, y: 11, type: '.' },
      { x: 48, w: 4, y: 10, type: '.' },
      { x: 48, w: 4, y: 11, type: '.' },
      { x: 74, w: 5, y: 10, type: '.' },
      { x: 74, w: 5, y: 11, type: '.' },

      // Weapon Pedestal at x=10
      { x: 9, w: 4, y: 7, type: '#' },

      // Bridges over Pit 1
      { x: 23, w: 2, y: 7, type: '=' },

      { x: 34, w: 6, y: 6, type: '#' },
      { x: 49, w: 2, y: 7, type: '=' },

      { x: 58, w: 7, y: 6, type: '#' },
      { x: 75, w: 3, y: 7, type: '=' },

      { x: 86, w: 8, y: 6, type: '#' },
      { x: 96, w: 6, y: 8, type: '=' }
    ];

    const tiles = buildMap(width, height, '#', platforms);

    return new Level({
      id: 3,
      title: "FASE 3: Entre armas e aranhas",
      subtitle: "Encontre a Mochila-Arma e enfrente a horda de aranhas!",
      theme: 'spiders',
      width,
      height,
      tiles,
      spawnX: 3,
      spawnY: 8,
      goalX: 108,
      bgMusic: 'spiders',
      weapon: { x: 10.5, y: 5 }, // The Mochila weapon powerup on pedestal!
      coins: [
        { x: 15, y: 9 }, { x: 17, y: 9 },
        { x: 27, y: 6 }, { x: 29, y: 6 },
        { x: 35, y: 5 }, { x: 37, y: 5 },
        { x: 60, y: 5 }, { x: 88, y: 5 }
      ],
      enemies: [
        { x: 16, y: 9, dist: 60 },
        { x: 28, y: 9, dist: 70 },
        { x: 36, y: 5, dist: 70 },
        { x: 44, y: 9, dist: 60 },
        { x: 54, y: 9, dist: 80 },
        { x: 60, y: 5, dist: 70 },
        { x: 70, y: 9, dist: 70 },
        { x: 88, y: 5, dist: 80 },
        { x: 98, y: 9, dist: 70 }
      ]
    });
  }

  // 4. FASE 4: GATO PRETO (Mounted on Yoshi-style Black Cat)
  function createLevel4() {
    const width = 120;
    const height = 12;
    const platforms = [
      // Wide chasms for exhilarating high cat jumps!
      { x: 18, w: 5, y: 10, type: '.' },
      { x: 18, w: 5, y: 11, type: '.' },
      { x: 36, w: 6, y: 10, type: '.' },
      { x: 36, w: 6, y: 11, type: '.' },
      { x: 58, w: 7, y: 10, type: '.' },
      { x: 58, w: 7, y: 11, type: '.' },
      { x: 80, w: 6, y: 10, type: '.' },
      { x: 80, w: 6, y: 11, type: '.' },

      // High bouncy platforms
      { x: 12, w: 4, y: 6, type: '=' },
      { x: 20, w: 2, y: 7, type: '=' },
      { x: 27, w: 5, y: 6, type: '=' },
      { x: 38, w: 2, y: 6, type: '=' },
      { x: 46, w: 7, y: 6, type: '#' },
      { x: 48, w: 3, y: 3, type: '?' },
      { x: 61, w: 2, y: 6, type: '=' },
      { x: 68, w: 6, y: 5, type: '=' },
      { x: 88, w: 7, y: 6, type: '#' },
      { x: 98, w: 6, y: 7, type: '=' }
    ];

    const tiles = buildMap(width, height, '#', platforms);

    return new Level({
      id: 4,
      title: "FASE 4: El Gato Galiano",
      subtitle: "Cavalgue o lendário felino com saltos velozes e acrobáticos!",
      theme: 'cat',
      width,
      height,
      tiles,
      spawnX: 3,
      spawnY: 8,
      goalX: 112,
      bgMusic: 'cat',
      coins: [
        { x: 13, y: 5 }, { x: 15, y: 5 },
        { x: 28, y: 5 }, { x: 30, y: 5 },
        { x: 47, y: 5 }, { x: 49, y: 2 },
        { x: 70, y: 4 }, { x: 90, y: 5 }
      ],
      enemies: [
        { x: 15, y: 9, dist: 60 },
        { x: 30, y: 9, dist: 70 },
        { x: 50, y: 5, dist: 80 },
        { x: 74, y: 9, dist: 80 },
        { x: 92, y: 5, dist: 70 }
      ]
    });
  }

  // 5. FASE 5: BOSS BARBA AMARELA (Final Boss Arena & Civilians)
  function createLevel5() {
    const width = 34; // Arena room
    const height = 12;
    const platforms = [
      // Left high platform (Cage 1)
      { x: 4, w: 5, y: 6, type: '#' },
      // Top center bridge (Cage 2 & 3)
      { x: 12, w: 10, y: 4, type: '=' },
      // Right high platform (Cage 4)
      { x: 24, w: 5, y: 6, type: '#' }
    ];

    const tiles = buildMap(width, height, '#', platforms);

    return new Level({
      id: 5,
      title: "FASE 5: Barba Amarela",
      subtitle: "Batalha Final: liberte todos os civis e derrote o vilão!",
      theme: 'boss',
      width,
      height,
      tiles,
      spawnX: 2,
      spawnY: 8,
      goalX: 30,
      bgMusic: 'boss',
      boss: { x: 25, y: 2 }, // Barba Amarela
      civilians: [
        { x: 5, y: 4.8, name: "Civil Carlos" },
        { x: 14, y: 2.8, name: "Civil Helena" },
        { x: 18, y: 2.8, name: "Civil Arthur" },
        { x: 26, y: 4.8, name: "Civil Sofia" }
      ]
    });
  }

  function getLevel(index) {
    switch (index) {
      case 1: return createLevel1();
      case 2: return createLevel2();
      case 3: return createLevel3();
      case 4: return createLevel4();
      case 5: return createLevel5();
      default: return null;
    }
  }

  return {
    getLevel,
    TILE_SIZE
  };
})();

if (typeof window !== 'undefined') {
  window.LevelManager = LevelManager;
}
