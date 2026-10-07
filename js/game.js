/**
 * SUPER GALIANO - Main Game Loop & Controller
 * State Machine: MENU -> PLAYING -> LEVEL_TRANSITION -> VICTORY -> TRIBUTE
 */

const Game = (() => {
  // Canvas & Context
  let canvas = null;
  let ctx = null;

  // Viewport internal resolution (crisp retro pixel art)
  const VIEW_WIDTH = 576;
  const VIEW_HEIGHT = 384;

  // State
  let state = 'MENU'; // MENU, CUTSCENE, PLAYING, LEVEL_CLEAR, GAME_OVER, VICTORY, TRIBUTE
  let currentLevelIndex = 1;
  let currentLevel = null;
  let player = null;
  let cameraX = 0;

  // Inputs
  const input = {
    left: false,
    right: false,
    jump: false,
    attack: false
  };

  // Cutscene / Transition Timers
  let transitionTimer = 0;
  let cutsceneStep = 0;
  let cutsceneTimer = 0;
  let victoryStep = 0;
  let victoryTimer = 0;

  function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = VIEW_WIDTH;
    canvas.height = VIEW_HEIGHT;
    ctx.imageSmoothingEnabled = false;

    // Initialize Sprite Engine
    Sprites.init();

    // Setup input listeners
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('resize', handleResize);
    handleResize();

    // Initialize Player
    player = new Entities.Player(60, 200);

    // Setup UI button handlers
    const startBtn = document.getElementById('btnStart');
    if (startBtn) {
      startBtn.addEventListener('click', startGame);
    }

    const restartBtn = document.getElementById('btnRestart');
    if (restartBtn) {
      restartBtn.addEventListener('click', restartCurrentLevel);
    }

    const tributeRestartBtn = document.getElementById('btnTributeRestart');
    if (tributeRestartBtn) {
      tributeRestartBtn.addEventListener('click', returnToTitle);
    }

    // Start requestAnimationFrame loop
    requestAnimationFrame(gameLoop);
  }

  function handleResize() {
    // Keep canvas aspect ratio crisp and pixel-sharp
    if (!canvas) return;
    const container = document.getElementById('gameContainer');
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    const scale = Math.min(w / VIEW_WIDTH, h / VIEW_HEIGHT);

    canvas.style.width = `${Math.floor(VIEW_WIDTH * scale)}px`;
    canvas.style.height = `${Math.floor(VIEW_HEIGHT * scale)}px`;
  }

  function onKeyDown(e) {
    // Don't intercept F5, F12, etc.
    if (['F5', 'F12'].includes(e.key)) return;

    if (state === 'CUTSCENE' && (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyX')) {
      cutsceneTimer = 999;
      state = 'PLAYING';
      e.preventDefault();
      return;
    }

    if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
      input.left = true;
      e.preventDefault();
    } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
      input.right = true;
      e.preventDefault();
    } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      input.jump = true;
      e.preventDefault();
    } else if (e.code === 'KeyX' || e.code === 'KeyJ') {
      input.attack = true;
      e.preventDefault();
    } else if (e.code === 'KeyR') {
      restartCurrentLevel();
      e.preventDefault();
    } else if (e.code === 'KeyM') {
      SoundEngine.toggleMute();
      e.preventDefault();
    }
  }

  function onKeyUp(e) {
    if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
      input.left = false;
    } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
      input.right = false;
    } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      input.jump = false;
    } else if (e.code === 'KeyX' || e.code === 'KeyJ') {
      input.attack = false;
    }
  }

  function startGame() {
    SoundEngine.init();
    SoundEngine.resume();

    // Hide Start Menu DOM
    const startMenu = document.getElementById('startMenu');
    if (startMenu) startMenu.style.display = 'none';

    // Start Level 1
    currentLevelIndex = 1;
    loadLevel(currentLevelIndex);
  }

  function loadLevel(index) {
    currentLevelIndex = index;
    currentLevel = LevelManager.getLevel(index);

    if (!currentLevel) {
      triggerVictory();
      return;
    }

    player.reset(currentLevel.spawnX, currentLevel.spawnY);
    currentLevel.resetEntities(player);

    cameraX = 0;

    if (index === 5) {
      // Phase 5 has intro cutscene showing Barba Amarela capturing civilians!
      state = 'CUTSCENE';
      cutsceneStep = 0;
      cutsceneTimer = 0;
      SoundEngine.playMusic('boss');
    } else {
      state = 'PLAYING';
      SoundEngine.playMusic(currentLevel.bgMusic);
    }
  }

  function restartCurrentLevel() {
    if (state === 'PLAYING' || state === 'GAME_OVER') {
      loadLevel(currentLevelIndex);
    }
  }

  function returnToTitle() {
    SoundEngine.stopMusic();
    const victoryScreen = document.getElementById('victoryScreen');
    const tributeScreen = document.getElementById('tributeScreen');
    const startMenu = document.getElementById('startMenu');

    if (victoryScreen) victoryScreen.style.display = 'none';
    if (tributeScreen) tributeScreen.style.display = 'none';
    if (startMenu) startMenu.style.display = 'flex';

    state = 'MENU';
  }

  // --- MAIN LOOP ---
  function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
  }

  function update() {
    if (state === 'PLAYING') {
      updatePlaying();
    } else if (state === 'CUTSCENE') {
      updateCutscene();
    } else if (state === 'LEVEL_CLEAR') {
      updateLevelClear();
    } else if (state === 'GAME_OVER') {
      updateGameOver();
    } else if (state === 'VICTORY') {
      updateVictory();
    }
  }

  function updatePlaying() {
    if (!currentLevel) return;

    // Update Player & Level Entities
    player.update(input, currentLevel, currentLevel.particles, currentLevel.projectiles);
    currentLevel.update(player);

    // Smooth Camera lerp
    const targetCamX = player.x - VIEW_WIDTH * 0.4;
    const maxCamX = currentLevel.width * currentLevel.tileSize - VIEW_WIDTH;
    cameraX += (targetCamX - cameraX) * 0.12;
    if (cameraX < 0) cameraX = 0;
    if (cameraX > maxCamX) cameraX = maxCamX;

    // Check Player Death
    if (player.isDead) {
      if (player.y > currentLevel.height * currentLevel.tileSize + 32) {
        state = 'GAME_OVER';
        transitionTimer = 0;
      }
      return;
    }

    // Check Level Clear
    if (currentLevel.isCompleted) {
      state = 'LEVEL_CLEAR';
      transitionTimer = 0;
      SoundEngine.playPowerup();
    }
  }

  function updateCutscene() {
    cutsceneTimer++;
    if (cutsceneTimer > 180) { // 3 seconds cutscene intro
      state = 'PLAYING';
    }
  }

  function updateLevelClear() {
    transitionTimer++;
    // Walk player forward into goal
    player.vx = 2.0;
    player.x += player.vx;
    player.updateAnimation();

    if (transitionTimer > 120) {
      if (currentLevelIndex < 5) {
        loadLevel(currentLevelIndex + 1);
      } else {
        triggerVictory();
      }
    }
  }

  function updateGameOver() {
    transitionTimer++;
    if (transitionTimer > 90) {
      // Auto restart current phase
      loadLevel(currentLevelIndex);
    }
  }

  function triggerVictory() {
    state = 'VICTORY';
    victoryStep = 0;
    victoryTimer = 0;
    SoundEngine.stopMusic();

    const victoryScreen = document.getElementById('victoryScreen');
    const victoryContent = document.getElementById('victoryContent');
    if (victoryScreen) {
      victoryScreen.style.display = 'flex';
      victoryScreen.style.opacity = '1';
    }
    if (victoryContent) {
      victoryContent.style.opacity = '0';
    }
  }

  function updateVictory() {
    victoryTimer++;
    // Step 0: Pure black screen (first 90 frames / 1.5s)
    if (victoryStep === 0 && victoryTimer > 90) {
      victoryStep = 1;
      const victoryContent = document.getElementById('victoryContent');
      if (victoryContent) {
        victoryContent.style.opacity = '1';
      }
    }

    // Step 1: "You Win (Você Venceu)" displayed on black screen, then fade to Tribute (after 280 frames)
    if (victoryStep === 1 && victoryTimer > 280) {
      victoryStep = 2;
      const victoryScreen = document.getElementById('victoryScreen');
      const tributeScreen = document.getElementById('tributeScreen');

      if (victoryScreen) victoryScreen.style.display = 'none';
      if (tributeScreen) {
        tributeScreen.style.display = 'flex';
        tributeScreen.style.opacity = '0';
        setTimeout(() => {
          tributeScreen.style.opacity = '1';
        }, 50);
      }
      SoundEngine.playMusic('tribute');
    }
  }

  // --- RENDERING ---
  function render() {
    ctx.imageSmoothingEnabled = false;

    if (state === 'MENU') {
      renderMenuBackground();
      return;
    }

    if (state === 'VICTORY' || state === 'TRIBUTE') {
      // Render clean black starry backdrop behind DOM overlay
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
      return;
    }

    if (!currentLevel) return;

    // 1. Render screen-space parallax background
    currentLevel.drawBackground(ctx, cameraX, VIEW_WIDTH, VIEW_HEIGHT);

    // 2. Render world entities and tiles with camera offset
    ctx.save();
    ctx.translate(-Math.round(cameraX), 0);
    currentLevel.drawWorld(ctx, cameraX, VIEW_WIDTH, VIEW_HEIGHT);
    player.draw(ctx);
    ctx.restore();

    // Render HUD and overlays
    renderHUD();

    if (state === 'CUTSCENE') {
      renderCutsceneOverlay();
    } else if (state === 'LEVEL_CLEAR') {
      renderLevelClearOverlay();
    } else if (state === 'GAME_OVER') {
      renderGameOverOverlay();
    }
  }

  function renderMenuBackground() {
    // Beautiful animated retro pixel art demo on title screen
    const time = Date.now() * 0.002;
    const grad = ctx.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(1, '#3b82f6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    // Stars
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 30; i++) {
      const sx = (i * 47) % VIEW_WIDTH;
      const sy = (i * 29) % (VIEW_HEIGHT - 80);
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Floor
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, VIEW_HEIGHT - 64, VIEW_WIDTH, 32);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, VIEW_HEIGHT - 32, VIEW_WIDTH, 32);

    // Idle Galiano walking / thumbs up
    const galianoFrame = Sprites.get('galiano_idle')[Math.floor(time * 3) % 4];
    if (galianoFrame) {
      ctx.drawImage(galianoFrame, VIEW_WIDTH / 2 - 16, VIEW_HEIGHT - 64 - 46);
    }
  }

  function renderHUD() {
    // Clean, minimalist retro HUD
    ctx.save();

    // 1. Level & Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`FASE ${currentLevelIndex}/5: ${currentLevel.title.split(':')[1] || ''}`, 16, 22);

    // 2. Health (Hearts in pixel art)
    for (let i = 0; i < player.maxHp; i++) {
      ctx.fillStyle = i < player.hp ? '#ef4444' : '#475569';
      // Pixel heart icon
      drawPixelHeart(ctx, 16 + i * 18, 30);
    }

    // 3. Coins & Score
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'right';
    ctx.fillText(`★ COINS: ${player.coins}  PTS: ${player.score}`, VIEW_WIDTH - 16, 22);

    // 4. Equipment Indicator
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    if (player.hasWeapon) {
      ctx.fillStyle = '#00f2fe';
      ctx.fillText(`[X] MOCHILA-ARMA ATIVA`, 16, 58);
    }
    if (player.isMounted) {
      ctx.fillStyle = '#facc15';
      ctx.fillText(`MONTARIA: GATO PRETO`, 16, player.hasWeapon ? 70 : 58);
    }

    // 5. Phase 5 Boss HUD
    if (currentLevelIndex === 5 && currentLevel.boss) {
      renderBossBar(ctx, currentLevel.boss);
    }

    ctx.restore();
  }

  function drawPixelHeart(ctx, x, y) {
    ctx.beginPath();
    ctx.fillRect(x + 2, y, 4, 3);
    ctx.fillRect(x + 8, y, 4, 3);
    ctx.fillRect(x, y + 3, 14, 5);
    ctx.fillRect(x + 2, y + 8, 10, 3);
    ctx.fillRect(x + 5, y + 11, 4, 3);
  }

  function renderBossBar(ctx, boss) {
    const barWidth = 240;
    const barHeight = 14;
    const barX = (VIEW_WIDTH - barWidth) / 2;
    const barY = 32;

    // Label: BARBA AMARELA
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#facc15';
    ctx.fillText('👑 BARBA AMARELA 👑', VIEW_WIDTH / 2, barY - 6);

    // Outer frame
    ctx.fillStyle = '#000000';
    ctx.fillRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4);

    // Background bar
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health Fill
    const fillWidth = Math.max(0, (boss.hp / boss.maxHp) * barWidth);
    const grad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    grad.addColorStop(0, '#facc15');
    grad.addColorStop(1, '#ef4444');
    ctx.fillStyle = grad;
    ctx.fillRect(barX, barY, fillWidth, barHeight);

    // Rescued Civilians status
    const rescuedCount = currentLevel.civilians.filter(c => c.isRescued).length;
    const totalCivils = currentLevel.civilians.length;
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = rescuedCount === totalCivils ? '#22c55e' : '#ffffff';
    ctx.fillText(`CIVIS RESGATADOS: ${rescuedCount}/${totalCivils}`, VIEW_WIDTH / 2, barY + 26);
  }

  function renderCutsceneOverlay() {
    // Intro dialog box in Phase 5
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(40, VIEW_HEIGHT - 100, VIEW_WIDTH - 80, 75);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, VIEW_HEIGHT - 100, VIEW_WIDTH - 80, 75);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('BARBA AMARELA:', 56, VIEW_HEIGHT - 78);

    ctx.fillStyle = '#ffffff';
    ctx.font = '11px monospace';
    ctx.fillText('"Hahaha! Todos os civis de Galiano são meus prisioneiros!"', 56, VIEW_HEIGHT - 58);
    ctx.fillText('"Destrua as celas e me enfrente se tiver coragem!"', 56, VIEW_HEIGHT - 40);
  }

  function renderLevelClearOverlay() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FASE CONCLUÍDA!', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 10);

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText('PREPARANDO PRÓXIMA FASE...', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 18);
  }

  function renderGameOverOverlay() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('VOCÊ CAIU!', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 10);

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText('Reiniciando a fase...', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 18);
  }

  return {
    init
  };
})();

window.addEventListener('DOMContentLoaded', () => {
  Game.init();
});
