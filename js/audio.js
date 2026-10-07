/**
 * SUPER GALIANO - Retro 8-Bit Web Audio Engine
 * Provides authentic procedural chiptune sound effects and dynamic background music.
 * Zero external audio files required!
 */

const SoundEngine = (() => {
  let ctx = null;
  let isMuted = false;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;

  let currentTrack = null;
  let musicTimer = null;
  let stepIndex = 0;

  function init() {
    if (ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioCtx();

      masterGain = ctx.createGain();
      masterGain.gain.value = 0.5;
      masterGain.connect(ctx.destination);

      musicGain = ctx.createGain();
      musicGain.gain.value = 0.28;
      musicGain.connect(masterGain);

      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.55;
      sfxGain.connect(masterGain);
    } catch (e) {
      console.warn("Web Audio not supported or failed to initialize", e);
    }
  }

  function resume() {
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    if (masterGain) {
      masterGain.gain.value = isMuted ? 0 : 0.5;
    }
    return isMuted;
  }

  // --- SOUND EFFECTS ---

  function playJump() {
    if (!ctx || isMuted) return;
    resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.16);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  function playCatJump() {
    if (!ctx || isMuted) return;
    resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // High chirp / meow-like jump
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(680, now + 0.1);
    osc.frequency.linearRampToValueAtTime(840, now + 0.22);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.24);

    osc.connect(gain);
    gain.connect(sfxGain);

    osc.start(now);
    osc.stop(now + 0.24);
  }

  function playCatChomp() {
    if (!ctx || isMuted) return;
    resume();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Yoshi-style chomp / gulp sound
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);
    osc.frequency.setValueAtTime(260, now + 0.09);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.17);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  function playCoin() {
    if (!ctx || isMuted) return;
    resume();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    osc2.frequency.setValueAtTime(987.77, now);
    osc2.frequency.setValueAtTime(1318.51, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  function playShoot() {
    if (!ctx || isMuted) return;
    resume();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  function playEnemyHit() {
    if (!ctx || isMuted) return;
    resume();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.15);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  function playPlayerHurt() {
    if (!ctx || isMuted) return;
    resume();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.25);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.28);

    osc.connect(gain);
    gain.connect(sfxGain);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  function playPowerup() {
    if (!ctx || isMuted) return;
    resume();
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.07;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.12);

      osc.connect(gain);
      gain.connect(sfxGain);

      osc.start(t);
      osc.stop(t + 0.12);
    });
  }

  function playRescue() {
    if (!ctx || isMuted) return;
    resume();
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.25);

      osc.connect(gain);
      gain.connect(sfxGain);

      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  function playBossRoar() {
    if (!ctx || isMuted) return;
    resume();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.2);
    osc.frequency.linearRampToValueAtTime(50, now + 0.45);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(sfxGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  // --- DYNAMIC BACKGROUND CHIPTUNE MUSIC ---

  // Note frequency map
  const N = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
    R: 0 // Rest
  };

  // Music patterns for each phase
  const THEMES = {
    // Phase 1: Cheerful sunny Mario-inspired
    sunny: {
      tempo: 135,
      lead: [
        N.E4, N.E4, N.R, N.E4, N.R, N.C4, N.E4, N.R,
        N.G4, N.R, N.R, N.R, N.G3, N.R, N.R, N.R,
        N.C4, N.R, N.R, N.G3, N.R, N.R, N.E3, N.R,
        N.A3, N.R, N.B3, N.R, N.A3, N.R, N.G3, N.R
      ],
      bass: [
        N.C3, N.G3, N.C3, N.G3, N.G2, N.D3, N.G2, N.D3,
        N.C3, N.G3, N.C3, N.G3, N.F2, N.C3, N.G2, N.D3
      ]
    },
    // Phase 2: Cool nocturnal city
    city: {
      tempo: 120,
      lead: [
        N.A4, N.C5, N.E5, N.D5, N.C5, N.B4, N.A4, N.R,
        N.F4, N.A4, N.C5, N.B4, N.A4, N.G4, N.E4, N.R,
        N.D4, N.F4, N.A4, N.G4, N.F4, N.E4, N.D4, N.R,
        N.E4, N.G4, N.B4, N.C5, N.B4, N.G4, N.E4, N.R
      ],
      bass: [
        N.A2, N.E3, N.A2, N.E3, N.F2, N.C3, N.F2, N.C3,
        N.D2, N.A2, N.D2, N.A2, N.E2, N.B2, N.E2, N.B2
      ]
    },
    // Phase 3: Cavern / Industrial Spiders
    spiders: {
      tempo: 140,
      lead: [
        N.E4, N.G4, N.E4, N.B4, N.A4, N.G4, N.E4, N.R,
        N.E4, N.G4, N.E4, N.C5, N.B4, N.A4, N.F4, N.R,
        N.D4, N.F4, N.D4, N.A4, N.G4, N.F4, N.D4, N.R,
        N.B3, N.D4, N.F4, N.G4, N.F4, N.D4, N.B3, N.R
      ],
      bass: [
        N.E2, N.E3, N.E2, N.E3, N.C2, N.C3, N.C2, N.C3,
        N.D2, N.D3, N.D2, N.D3, N.B1, N.B2, N.B1, N.B2
      ]
    },
    // Phase 4: Galloping Cat Mount
    cat: {
      tempo: 155,
      lead: [
        N.C5, N.D5, N.E5, N.G5, N.A5, N.G5, N.E5, N.C5,
        N.F5, N.E5, N.D5, N.C5, N.D5, N.R, N.G4, N.R,
        N.C5, N.D5, N.E5, N.G5, N.A5, N.C5, N.D5, N.E5,
        N.D5, N.C5, N.B4, N.A4, N.G4, N.R, N.C5, N.R
      ],
      bass: [
        N.C3, N.C3, N.G2, N.C3, N.F2, N.F2, N.C3, N.F2,
        N.A2, N.A2, N.E2, N.A2, N.G2, N.G2, N.D2, N.G2
      ]
    },
    // Phase 5: Boss Barba Amarela
    boss: {
      tempo: 160,
      lead: [
        N.D4, N.D4, N.F4, N.R, N.G4, N.F4, N.D4, N.R,
        N.A4, N.R, N.A4, N.R, N.G4, N.F4, N.E4, N.R,
        N.D4, N.F4, N.A4, N.D5, N.C5, N.A4, N.F4, N.R,
        N.G4, N.A4, N.C5, N.A4, N.G4, N.F4, N.E4, N.R
      ],
      bass: [
        N.D2, N.D3, N.D2, N.D3, N.Bb2, N.Bb1, N.C2, N.C3,
        N.D2, N.D3, N.D2, N.D3, N.A1, N.A2, N.A1, N.A2
      ]
    },
    // Ending / Tribute: Gentle, emotional, peaceful
    tribute: {
      tempo: 80,
      lead: [
        N.C4, N.E4, N.G4, N.C5, N.B4, N.G4, N.E4, N.R,
        N.A4, N.C5, N.E5, N.D5, N.C5, N.A4, N.F4, N.R,
        N.G4, N.B4, N.D5, N.C5, N.G4, N.E4, N.C4, N.R,
        N.F4, N.A4, N.C5, N.B4, N.G4, N.D4, N.C4, N.R
      ],
      bass: [
        N.C3, N.G3, N.C3, N.G3, N.F2, N.C3, N.F2, N.C3,
        N.G2, N.D3, N.G2, N.D3, N.C3, N.G3, N.C3, N.G3
      ]
    }
  };

  function playMusic(themeName) {
    if (!ctx) init();
    resume();
    if (currentTrack === themeName && musicTimer) return;

    stopMusic();
    currentTrack = themeName;
    const theme = THEMES[themeName];
    if (!theme) return;

    stepIndex = 0;
    const stepDuration = 60 / theme.tempo / 2; // sixteenth or eighth notes

    function step() {
      if (!ctx || isMuted || !theme) return;
      const now = ctx.currentTime;

      // Play lead note
      const leadNote = theme.lead[stepIndex % theme.lead.length];
      if (leadNote && leadNote > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = themeName === 'tribute' ? 'sine' : 'square';
        osc.frequency.setValueAtTime(leadNote, now);

        gain.gain.setValueAtTime(themeName === 'tribute' ? 0.18 : 0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + stepDuration * 0.9);

        osc.connect(gain);
        gain.connect(musicGain);

        osc.start(now);
        osc.stop(now + stepDuration * 0.9);
      }

      // Play bass note
      const bassIndex = Math.floor(stepIndex / 2) % theme.bass.length;
      const bassNote = theme.bass[bassIndex];
      if (stepIndex % 2 === 0 && bassNote && bassNote > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(bassNote, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + stepDuration * 1.8);

        osc.connect(gain);
        gain.connect(musicGain);

        osc.start(now);
        osc.stop(now + stepDuration * 1.8);
      }

      stepIndex++;
    }

    musicTimer = setInterval(step, stepDuration * 1000);
  }

  function stopMusic() {
    if (musicTimer) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
    currentTrack = null;
  }

  return {
    init,
    resume,
    toggleMute,
    isMuted: () => isMuted,
    playJump,
    playCatJump,
    playCatChomp,
    playCoin,
    playShoot,
    playEnemyHit,
    playPlayerHurt,
    playPowerup,
    playRescue,
    playBossRoar,
    playMusic,
    stopMusic
  };
})();

if (typeof window !== 'undefined') {
  window.SoundEngine = SoundEngine;
}
