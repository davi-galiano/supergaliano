/**
 * SUPER GALIANO - Pixel Art Sprite Engine
 * Generates all pixel art sprites programmatically onto offscreen canvases.
 * Strictly uses procedural pixel grids - NO external or original image files are loaded.
 */

const Sprites = (() => {
  // Utility: create an offscreen canvas
  function createOffscreen(width, height) {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx: ctx };
  }

  // Draw pixel grid from string array and palette
  function drawPixelMatrix(ctx, matrix, palette, scale = 1, offsetX = 0, offsetY = 0) {
    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r];
      for (let c = 0; c < row.length; c++) {
        const char = row[c];
        if (char !== '.' && char !== ' ' && palette[char]) {
          ctx.fillStyle = palette[char];
          ctx.fillRect(offsetX + c * scale, offsetY + r * scale, scale, scale);
        }
      }
    }
  }

  // Helper to compile a matrix into an offscreen canvas
  function compileMatrix(matrix, palette, scale = 2) {
    const height = matrix.length * scale;
    const width = matrix[0].length * scale;
    const { canvas, ctx } = createOffscreen(width, height);
    drawPixelMatrix(ctx, matrix, palette, scale);
    return canvas;
  }

  // =========================================================================
  // 1. GALIANO (Protagonist - Inspired by Ref 1)
  // Dark hair, rectangular glasses, peach skin, heather gray hoodie with green logo,
  // kangaroo pocket, gray sweatpants with white swoosh, dark sneakers.
  // =========================================================================
  const PALETTE_GALIANO = {
    'H': '#241814', // Hair dark brown / black (Reference 1)
    'h': '#150d0a', // Hair shadow
    'S': '#f3ba92', // Peach skin tone
    's': '#d99a70', // Skin shadow
    'N': '#e29d72', // 3D Voxel nose
    'G': '#000000', // Rectangular glasses frame
    'g': '#94a3b8', // Glasses bridge & rim
    'E': '#0c0600d5', // Eye pupil
    'e': '#ffffff', // Eye lens white shine
    'M': '#c26a58', // Smiling mouth
    'C': '#94a3b8', // Heather gray hoodie
    'c': '#6e7683', // Hoodie dark shadow
    'K': '#475569', // Zipper & hood lines
    'L': '#22c55e', // Green "L" chest logo (Reference 1)
    'l': '#15803d', // Green logo shadow
    'W': '#ffffff', // White drawstrings / white swoosh / coffee cup
    'w': '#e2e8f0', // Cup highlight
    'T': '#cbd5e1', // Coffee cup rim / lid
    'P': '#888f9c', // Gray sweatpants
    'p': '#616874', // Pants shadow
    'B': '#1e232a', // Dark sneakers
    'b': '#0f1216', // Sneaker sole shadow
    'R': '#ef4444', // Hurt flash red
    // Weapon additions
    'A': '#1e232a', // Tactical backpack dark
    'a': '#2f3542', // Backpack highlight
    'Z': '#dcdde1', // Silver zipper/buckles
    'X': '#00f2fe', // Cyan plasma emitter
    'x': '#54a0ff'  // Plasma glow
  };

  // Upgraded 20x24 Galiano Sprite Matrices
  // Features: Thumbs-up 👍, Coffee Cup ☕, Glasses with Eyes, Green L logo, Drawstrings, White swoosh

  // Frame 1: Idle stand with thumbs-up and coffee cup
  const GALIANO_IDLE_1 = [
    ".....HHHHHHHH.......",
    "....HHhHHHHHHH......",
    "....HHhHHHHHHH......",
    "....HSSSSSSSSsH.....",
    "....HSGEeSsEeGH.....",
    "....HSGGgNNGGgH.....",
    "....HSSSSsSSsSH.....",
    ".....SSMMMSSs.......",
    "..S..CcCCCCCc..T....",
    ".SSsCCsWcKWLCcTTT...",
    ".SSsCCSWcKWCsCWWW...",
    "..SsCCsWcKWCsCWWW...",
    "...cCCSCKKCSCCwWw...",
    "....SsPPPPPPsS......",
    ".....PpPPPPpP.......",
    ".....PPW..PP........",
    ".....PPW..PP........",
    ".....PP...PP........",
    ".....Pp...pP........",
    ".....Pp...pP........",
    ".....PP...PP........",
    ".....BB...BB........",
    ".....Bb...bB........",
    ".....WW...WW........"
  ];

  // Frame 2: Idle breathing / slight blink
  const GALIANO_IDLE_2 = [
    "....................",
    ".....HHHHHHHH.......",
    "....HHhHHHHHHH......",
    "....HHhHHHHHHH......",
    "....HSSSSSSSSsH.....",
    "....HSGEGSsGEGH.....",
    "....HSGGgNNGGgH.....",
    "....HSSSSsSSsSH.....",
    ".....SSMMMSSs.......",
    "..S..CcCCCCCc..T....",
    ".SSsCCsWcKWLCcTTT...",
    ".SSsCCSWcKWCsCWWW...",
    "..SsCCsWcKWCsCWWW...",
    "...cCCSCKKCSCCwWw...",
    "....SsPPPPPPsS......",
    ".....PpPPPPpP.......",
    ".....PPW..PP........",
    ".....PPW..PP........",
    ".....PP...PP........",
    ".....Pp...pP........",
    ".....Pp...pP........",
    ".....PP...PP........",
    ".....BB...BB........",
    ".....WW...WW........"
  ];

  // Frame 3: Thumbs-up bob
  const GALIANO_IDLE_THUMB = GALIANO_IDLE_1;

  // Walk Frame 1 (stride forward, carrying coffee cup)
  const GALIANO_WALK_1 = [
    ".....HHHHHHHH.......",
    "....HHhHHHHHHH......",
    "....HHhHHHHHHH......",
    "....HSSSSSSSSsH.....",
    "....HSGEeSsEeGH.....",
    "....HSGGgNNGGgH.....",
    "....HSSSSsSSsSH.....",
    ".....SSMMMSSs.......",
    "..S..CcCCCCCc..T....",
    ".SSsCCsWcKWLCcTTT...",
    ".SSsCCSWcKWCsCWWW...",
    "..SsCCsWcKWCsCWWW...",
    "...cCCSCKKCSCCwWw...",
    "....SsPPPPPPsS......",
    ".....Pp..Pp.........",
    ".....PP...PP........",
    "....PP.....PP.......",
    "....Pp......pP......",
    "....Pp......pP......",
    "...PP........PP.....",
    "...BB.........BB....",
    "...Bb.........Bb....",
    "...WW.........WW....",
    "...................."
  ];

  // Walk Frame 2 (passing)
  const GALIANO_WALK_2 = [
    ".....HHHHHHHH.......",
    "....HHhHHHHHHH......",
    "....HHhHHHHHHH......",
    "....HSSSSSSSSsH.....",
    "....HSGEeSsEeGH.....",
    "....HSGGgNNGGgH.....",
    "....HSSSSsSSsSH.....",
    ".....SSMMMSSs.......",
    "..S..CcCCCCCc..T....",
    ".SSsCCsWcKWLCcTTT...",
    ".SSsCCSWcKWCsCWWW...",
    "..SsCCsWcKWCsCWWW...",
    "...cCCSCKKCSCCwWw...",
    "....SsPPPPPPsS......",
    ".....PpPPPPpP.......",
    ".....PPW..PP........",
    ".....PP...PP........",
    ".....PP...PP........",
    ".....Pp...pP........",
    ".....BB...PP........",
    ".....Bb...BB........",
    ".....WW...Bb........",
    "..........WW........",
    "...................."
  ];

  // Walk Frame 3 (opposite leg forward)
  const GALIANO_WALK_3 = [
    ".....HHHHHHHH.......",
    "....HHhHHHHHHH......",
    "....HHhHHHHHHH......",
    "....HSSSSSSSSsH.....",
    "....HSGEeSsEeGH.....",
    "....HSGGgNNGGgH.....",
    "....HSSSSsSSsSH.....",
    ".....SSMMMSSs.......",
    "..S..CcCCCCCc..T....",
    ".SSsCCsWcKWLCcTTT...",
    ".SSsCCSWcKWCsCWWW...",
    "..SsCCsWcKWCsCWWW...",
    "...cCCSCKKCSCCwWw...",
    "....SsPPPPPPsS......",
    ".....Pp..Pp.........",
    "....PP....PP........",
    "...PP......PP.......",
    "...pP.......Pp......",
    "...pP.......Pp......",
    "...PP........PP.....",
    "..BB..........BB....",
    "..Bb..........Bb....",
    "..WW..........WW....",
    "...................."
  ];

  // Walk Frame 4
  const GALIANO_WALK_4 = GALIANO_WALK_2;

  // Jump Frame (rising, coffee held tight)
  const GALIANO_JUMP = [
    ".....HHHHHHHH.......",
    "....HHhHHHHHHH......",
    "....HHhHHHHHHH......",
    "....HSSSSSSSSsH.....",
    "....HSGEeSsEeGH.....",
    "....HSGGgNNGGgH.....",
    "....HSSSSsSSsSH.....",
    ".....SSMMMSSs.......",
    "..SS.CcCCCCCc.ST....",
    "..SSsCsWcKWLCsSTTT..",
    "...cCCSWcKWCsCWWW...",
    "...cCCsWcKWCsCWWW...",
    "....CCSCKKCSCCwWw...",
    ".....sPPPPPPs.......",
    ".....PPPPPPPP.......",
    "....PPP....PPP......",
    "...PPP......PPP.....",
    "...PP........PP.....",
    "...BB........BB.....",
    "...Bb........Bb.....",
    "...WW........WW.....",
    "....................",
    "....................",
    "...................."
  ];

  // Fall Frame (falling downwards)
  const GALIANO_FALL = [
    ".....HHHHHHHH.......",
    "....HHhHHHHHHH......",
    "....HHhHHHHHHH......",
    "....HSSSSSSSSsH.....",
    "....HSGEeSsEeGH.....",
    "....HSGGgNNGGgH.....",
    "....HSSSSsSSsSH.....",
    ".....SSMMMSSs.......",
    "..S..CcCCCCCc..T....",
    ".SSsCCsWcKWLCcTTT...",
    ".SSsCCSWcKWCsCWWW...",
    "..SsCCsWcKWCsCWWW...",
    "...cCCSCKKCSCCwWw...",
    "....SsPPPPPPsS......",
    ".....PpPPPPpP.......",
    ".....PPW..PP........",
    ".....PP...PP........",
    ".....PP...PP........",
    ".....PP...PP........",
    ".....BB...BB........",
    ".....Bb...bB........",
    ".....WW...WW........",
    "....................",
    "...................."
  ];

  // Attack Frame (Backpack Blaster cannon firing)
  const GALIANO_ATTACK = [
    ".....HHHHHHHH.......",
    "....HHhHHHHHHH......",
    "....HHhHHHHHHH......",
    "....HSSSSSSSSsH.....",
    "....HSGEeSsEeGH.....",
    "....HSGGgNNGGgH.....",
    "....HSSSSsSSsSH.....",
    ".....SSMMMSSs.XXxxx.",
    "..Ac.CcCCCCCcSXXxxx.",
    ".AAAsCsWcKWLCsS.....",
    ".AaZCCSWcKWCsCC.....",
    ".AaZCCsWcKWCsCC.....",
    "..AAsCCKKCSCC.......",
    "....SsPPPPPPsS......",
    ".....PpPPPPpP.......",
    ".....PPW..PP........",
    ".....PP...PP........",
    ".....PP...PP........",
    ".....Pp...pP........",
    ".....PP...PP........",
    ".....BB...BB........",
    ".....Bb...bB........",
    ".....WW...WW........",
    "...................."
  ];

  // Hurt Frame (recoiling with red flash)
  const GALIANO_HURT = [
    ".....HHHHHHHH.......",
    "....HHhHHHHHHH......",
    "....HHhHHHHHHH......",
    "....HSSSSSSSSsH.....",
    "....HSGEeSsEeGH.....",
    "....HSGGgNNGGgH.....",
    "....HSSSSsSSsSH.....",
    ".....SSMMMSSs.......",
    "..R..RcRRRRRc..R....",
    ".RRsRRsRcKRLRsRRR...",
    ".RRsRRsRcKRsRsRRR...",
    "..RsRRsRcKRsRsRRR...",
    "...rRRSRKKRSRRrRr...",
    "....SsPPPPPPsS......",
    ".....PpPPPPpP.......",
    ".....PP...PP........",
    ".....PP...PP........",
    ".....Pp...pP........",
    ".....BB...BB........",
    ".....Bb...bB........",
    ".....WW...WW........",
    "....................",
    "....................",
    "...................."
  ];

  // Defeat Frame (tumbling spin)
  const GALIANO_DEFEAT = [
    "....................",
    ".....SSMMMSSs.......",
    "....HSSSSsSSsSH.....",
    "....HSGGgNNGGgH.....",
    "....HSGEeSsEeGH.....",
    "....HSSSSSSSSsH.....",
    "....HHhHHHHHHH......",
    ".....HHHHHHHH.......",
    ".....CcCCCCCc.......",
    "....CCsWcKWLCc......",
    "....CCSWcKWCsC......",
    ".....SsPPPPsS.......",
    "......PP..PP........",
    "......BB..BB........",
    "......WW..WW........",
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
    "...................."
  ];

  // Backpack Overlay Grid (worn on back)
  const BACKPACK_OVERLAY = [
    ".....AAa........",
    "....AAAAAa......",
    "....AaZZaa......",
    "....AaZZaa......",
    "....AAAAAA......",
    ".....AaZaa......",
    "......AA........",
    "................"
  ];

  // =========================================================================
  // 2. GATO PRETO (Black Cat - Yoshi Mount - Inspired by Ref 2)
  // Jet black fur, pointed ears with white inner ear, HUGE yellow glowing eyes,
  // vertical pupil slit, white muzzle dot, curved tail.
  // =========================================================================
  const PALETTE_CAT = {
    'B': '#101216', // Pure black fur
    'b': '#222630', // Fur highlight
    'W': '#ffffff', // Inner ears / muzzle / teeth
    'Y': '#facc15', // Bright yellow eyes
    'y': '#eab308', // Eye shade
    'P': '#090a0c', // Eye pupil
    'R': '#ef4444', // Hurt tint
    'N': '#f472b6'  // Cute nose pink
  };

  // Cat Idle 1 (24x20)
  const CAT_IDLE_1 = [
    "....BB.......BB.........",
    "...BWWb.....BWWb........",
    "...BWWb.....BWWb........",
    "..BbbbB.....BbbbB.......",
    "..BBBBBBBBBBBBBBB.......",
    ".BBBBBBBBBBBBBBBBB......",
    ".BBBYYYBBBBBYYYBBB......",
    ".BBBYPYBBBBBYPYBBB......",
    ".BBBYYYBBBBBYYYBBB......",
    ".BBBBBBWWNWWBBBBBB......",
    "..BBBBBBWWWWBBBBB...BBB.",
    "...BBBBBBBBBBBBBB..BBBBb",
    "...bBBBBBBBBBBBBBBBBBbbb",
    "....bBBBBBBBBBBBBBBBB...",
    ".....bBBBBBBBBBBBBBb....",
    "......BBBBBBBBBBBBB.....",
    "......BB..BB...BB.BB....",
    "......BB..BB...BB.BB....",
    ".....bWW.bWW..bWW.bWW...",
    "........................"
  ];

  // Cat Idle 2 (Blinking / Tail wave)
  const CAT_IDLE_2 = [
    "....BB.......BB.........",
    "...BWWb.....BWWb........",
    "...BWWb.....BWWb........",
    "..BbbbB.....BbbbB.......",
    "..BBBBBBBBBBBBBBB.......",
    ".BBBBBBBBBBBBBBBBB......",
    ".BBBYYYBBBBBYYYBBB......",
    ".BBBBPBBBBBBBPBBBB......",
    ".BBBYYYBBBBBYYYBBB......",
    ".BBBBBBWWNWWBBBBBB......",
    "..BBBBBBWWWWBBBBB..BBBB.",
    "...BBBBBBBBBBBBBB.BBBBb.",
    "...bBBBBBBBBBBBBBBBBBbbb",
    "....bBBBBBBBBBBBBBBBB...",
    ".....bBBBBBBBBBBBBBb....",
    "......BBBBBBBBBBBBB.....",
    "......BB..BB...BB.BB....",
    "......BB..BB...BB.BB....",
    ".....bWW.bWW..bWW.bWW...",
    "........................"
  ];

  // Cat Walk 1 (Running/walking cycle)
  const CAT_WALK_1 = [
    "....BB.......BB.........",
    "...BWWb.....BWWb........",
    "...BWWb.....BWWb........",
    "..BbbbB.....BbbbB.......",
    "..BBBBBBBBBBBBBBB.......",
    ".BBBBBBBBBBBBBBBBB......",
    ".BBBYYYBBBBBYYYBBB......",
    ".BBBYPYBBBBBYPYBBB......",
    ".BBBYYYBBBBBYYYBBB......",
    ".BBBBBBWWNWWBBBBBB......",
    "..BBBBBBWWWWBBBBB...BBB.",
    "...BBBBBBBBBBBBBB..BBBBb",
    "...bBBBBBBBBBBBBBBBBBbbb",
    "....bBBBBBBBBBBBBBBBB...",
    ".....bBBBBBBBBBBBBBb....",
    "......BBBBBBBBBBBBB.....",
    ".....BB....BB...BB..BB..",
    "....BB......BB...BB..BB.",
    "...bWW.....bWW..bWW..bWW",
    "........................"
  ];

  // Cat Walk 2 (stride forward)
  const CAT_WALK_2 = [
    "....BB.......BB.........",
    "...BWWb.....BWWb........",
    "...BWWb.....BWWb........",
    "..BbbbB.....BbbbB.......",
    "..BBBBBBBBBBBBBBB.......",
    ".BBBBBBBBBBBBBBBBB......",
    ".BBBYYYBBBBBYYYBBB......",
    ".BBBYPYBBBBBYPYBBB......",
    ".BBBYYYBBBBBYYYBBB......",
    ".BBBBBBWWNWWBBBBBB......",
    "..BBBBBBWWWWBBBBB..bBBB.",
    "...BBBBBBBBBBBBBB.bBBBBb",
    "...bBBBBBBBBBBBBBBBBBbbb",
    "....bBBBBBBBBBBBBBBBB...",
    ".....bBBBBBBBBBBBBBb....",
    "......BBBBBBBBBBBBB.....",
    "......BB..BB...BB..BB...",
    "......BB..BB....BB..BB..",
    ".....bWW.bWW...bWW..bWW.",
    "........................"
  ];

  // Cat Jump (leaping in the air, paws stretched)
  const CAT_JUMP = [
    "....BB.......BB.........",
    "...BWWb.....BWWb........",
    "...BWWb.....BWWb........",
    "..BbbbB.....BbbbB.......",
    "..BBBBBBBBBBBBBBB.......",
    ".BBBBBBBBBBBBBBBBB......",
    ".BBBYYYBBBBBYYYBBB......",
    ".BBBYPYBBBBBYPYBBB......",
    ".BBBYYYBBBBBYYYBBB......",
    ".BBBBBBWWNWWBBBBBB..BBB.",
    "..BBBBBBWWWWBBBBBB.BBBBb",
    "...bBBBBBBBBBBBBBBBBBbbb",
    "....bBBBBBBBBBBBBBBBB...",
    "....bBBBBBBBBBBBBBB.....",
    "...bWW.bWW...bWW.bWW....",
    "..bWW...bWW.bWW...bWW...",
    "........................",
    "........................",
    "........................",
    "........................"
  ];

  // =========================================================================
  // 3. BARBA AMARELA (Final Boss - Inspired by Ref 3)
  // Dark bronze skin, bald/receded head, fierce white/dark eyes, massive radiant
  // yellow beard, royal blue flowing robe, hands holding a pulsing cyan glowing orb!
  // =========================================================================
  const PALETTE_BOSS = {
    'S': '#8b5a3c', // Bronze skin
    's': '#633d26', // Bronze shadow
    'E': '#ffffff', // Fierce eye white
    'e': '#1e293b', // Eye pupil
    'Y': '#facc15', // Vibrant golden-yellow beard
    'y': '#eab308', // Yellow beard shadow
    'L': '#fef08a', // Beard bright highlight
    'B': '#3b82f6', // Royal blue robe
    'b': '#1d4ed8', // Dark blue robe folds
    'O': '#00f2fe', // Glowing power orb cyan
    'o': '#ffffff', // Glowing orb center
    'G': '#4facfe', // Orb outer glow
    'W': '#ffffff', // White details
    'R': '#ef4444'  // Hurt flash red
  };

  // Boss Idle 1 (28x32)
  const BOSS_IDLE_1 = [
    "..........ssssssss..........",
    "........ssSSSSSSSSss........",
    ".......sSSSSSSSSSSSSs.......",
    ".......sSSSSSSSSSSSSs.......",
    ".......sSsEEEEssEEEEs.......",
    ".......sSsEeEEssEeEEs.......",
    ".......sSSSSSSSSSSSSs.......",
    ".......sSSSSSSSSSSSSs.......",
    "......ssYYYYYYYYYYYYss......",
    ".....sYYYYLYYYYYYLYYYs......",
    "....YYYYYYYYYYYYYYYYYYYY....",
    "...YYYYYYYYYYYYYYYYYYYYYY...",
    "..bBYYYYYLYYYYYYYYLYYYYYBb..",
    "..bBbYYYYYYYYYYYYYYYYYYbBb..",
    ".bBBbYYYYYLYYYYYYLYYYYYbBBb.",
    ".bBBBbYYYYYYYYYYYYYYYYbBBBb.",
    ".bBBBBbyyyyyYYYYyyyyybBBBBb.",
    ".bBBBBBBb...yyyy...bBBBBBBb.",
    ".bBBBBBBb...SSSS...bBBBBBBb.",
    ".bBBBBBBb..sSSSSs..bBBBBBBb.",
    ".bBBBBBBb.SSSOOOSS.bBBBBBBb.",
    "..bBBBBBB.SSOooOSS.BBBBBBb..",
    "...bBBBBb.SSGOOGSS.bBBBBb...",
    "....bBBBB..sSSSSs..BBBBb....",
    ".....bBBBB..ssss..BBBBb.....",
    "......bBBBB......BBBBb......",
    ".......bBBBB....BBBBb.......",
    "........bBBBB..BBBBb........",
    ".........bBBBBBBBBb.........",
    "..........bBBBBBBb..........",
    "............................",
    "............................"
  ];

  // Boss Idle 2 (Hover floating up / beard swaying / orb glowing)
  const BOSS_IDLE_2 = [
    "............................",
    "..........ssssssss..........",
    "........ssSSSSSSSSss........",
    ".......sSSSSSSSSSSSSs.......",
    ".......sSSSSSSSSSSSSs.......",
    ".......sSsEEEEssEEEEs.......",
    ".......sSsEeEEssEeEEs.......",
    ".......sSSSSSSSSSSSSs.......",
    ".......sSSSSSSSSSSSSs.......",
    "......ssYYYYYYYYYYYYss......",
    ".....sYYYYLYYYYYYLYYYs......",
    "....YYYYYYYYYYYYYYYYYYYY....",
    "...YYYYYYYYYYYYYYYYYYYYYY...",
    "..bBYYYYYLYYYYYYYYLYYYYYBb..",
    "..bBbYYYYYYYYYYYYYYYYYYbBb..",
    ".bBBbYYYYYLYYYYYYLYYYYYbBBb.",
    ".bBBBBbyyyyyYYYYyyyyybBBBBb.",
    ".bBBBBBBb...yyyy...bBBBBBBb.",
    ".bBBBBBBb..SSssSS..bBBBBBBb.",
    ".bBBBBBBb.SSSOOOSS.bBBBBBBb.",
    ".bBBBBBBb.SSOooOSS.bBBBBBBb.",
    "..bBBBBBB.SSGOOGSS.BBBBBBb..",
    "...bBBBBb..sSSSSs..bBBBBb...",
    "....bBBBB...ssss...BBBBb....",
    ".....bBBBB........BBBBb.....",
    "......bBBBB......BBBBb......",
    ".......bBBBB....BBBBb.......",
    "........bBBBBBBBBBBb........",
    ".........bBBBBBBBBb.........",
    "............................",
    "............................",
    "............................"
  ];

  // Boss Casting / Attacking (Orb expands, rays shoot out!)
  const BOSS_CAST = [
    "..........ssssssss..........",
    "........ssSSSSSSSSss........",
    ".......sSSSSSSSSSSSSs.......",
    ".......sSsEEEEssEEEEs.......",
    ".......sSsEeEEssEeEEs.......",
    ".......sSSSSSSSSSSSSs.......",
    "......ssYYYYYYYYYYYYss......",
    ".....sYYYYLYYYYYYLYYYs......",
    "....YYYYYYYYYYYYYYYYYYYY....",
    "..bBYYYYYLYYYYYYYYLYYYYYBb..",
    ".bBBbYYYYYYYYYYYYYYYYYYbBBb.",
    ".bBBBBbyyyyyYYYYyyyyybBBBBb.",
    ".bBBBBBBb...yyyy...bBBBBBBb.",
    "..bBBBBBb...SSSS...bBBBBBb..",
    "...bBBBB...SGOOGS...BBBBb...",
    "....bBB...GGOoooOGG...BBb...",
    ".....b...GGOooooooOGG...b...",
    "........GOOooooooooOOG......",
    "........GOOooooooooOOG......",
    ".........GGOooooooOGG.......",
    "..........GGOoooOGG.........",
    "...........SGOOGS...........",
    "............SSSS............",
    "...........bBBBBb...........",
    "..........bBBBBBBb..........",
    ".........bBBBBBBBBb.........",
    "........bBBBBBBBBBBb........",
    "............................",
    "............................",
    "............................",
    "............................",
    "............................"
  ];

  // =========================================================================
  // 4. MOCHILA / ARMA (Backpack Weapon - Inspired by Ref 4)
  // Tactical black backpack with silver buckles, side straps, top handle,
  // converted into an energy backpack cannon with cyan plasma barrel.
  // =========================================================================
  const PALETTE_BACKPACK = {
    'B': '#111317', // Dark black fabric
    'b': '#22252a', // Fabric highlight
    'S': '#353a42', // Straps
    'Z': '#e2e8f0', // Silver buckles / zippers
    'z': '#94a3b8', // Silver shadow
    'C': '#00f2fe', // Plasma cannon muzzle cyan
    'G': '#4facfe', // Energy glow
    'W': '#ffffff'  // White highlight
  };

  const BACKPACK_ITEM = [
    ".......bBBB.........",
    "......bSSSSS........",
    ".....bBBBBBBB.......",
    "....bBBBBBBBBb......",
    "...bBBbZZZZbBBb.....",
    "...bBBbZWWZbBBb.....",
    "..bSBBbZZZZbBBSb....",
    "..bSBBBBBBBBBBBb....",
    "..bSBBbZZZZbBBBb....",
    "..bSBBbZWWZbBBBb.CC.",
    "..bSBBbZZZZbBBBbCGGC",
    "...bBBBBBBBBBBb.CWWG",
    "....bBBBBBBBBb...CC.",
    ".....bSSSSSSb.......",
    "......bBBBBb........",
    "...................."
  ];

  // =========================================================================
  // 5. ARANHAS (Spiders - Enemies - Inspired by Ref 5)
  // Deep midnight purple/navy body, glowing fiery red eyes, sharp fangs,
  // 8 articulated creepily jointed spider legs.
  // =========================================================================
  const PALETTE_SPIDER = {
    'B': '#181528', // Darkest body
    'P': '#2d2647', // Purple body mid
    'p': '#463c6c', // Purple highlight
    'R': '#ff0033', // Glowing red eyes
    'r': '#ff6b81', // Eye shine
    'W': '#ffffff', // Fangs white
    'K': '#100e1b', // Legs shadow
    'k': '#383256'  // Legs joint
  };

  // Spider Walk 1 (24x18)
  const SPIDER_WALK_1 = [
    "..k...k......k...k..",
    ".K.K.K.K....K.K.K.K.",
    ".K..K..K.PP.K..K..K.",
    "..K..K..PPPP..K..K..",
    "...K...PPPPPP...K...",
    "......PPppppPP......",
    ".....PPppppppPP.....",
    "....PPPppppppPPP....",
    "....PPPBrrrBPPP....",
    ".....PPBRRRBPP.....",
    "......PPWWWWPP......",
    ".......PWWWWP.......",
    "..K..K..W..W..K..K..",
    ".K.K.K.K....K.K.K.K.",
    ".k..k..........k..k.",
    "....................",
    "....................",
    "...................."
  ];

  // Spider Walk 2 (alternating legs)
  const SPIDER_WALK_2 = [
    ".k..k..........k..k.",
    ".K.K.K.K....K.K.K.K.",
    "..K..K..kPPk..K..K..",
    "...K...PPPPPP...K...",
    "......PPppppPP......",
    ".....PPppppppPP.....",
    "....PPPppppppPPP....",
    "....PPPBrrrBPPP....",
    ".....PPBRRRBPP.....",
    "......PPWWWWPP......",
    ".......PWWWWP.......",
    "........W..W........",
    "...K..K.W..W.K..K...",
    "..K.K.K.K..K.K.K.K..",
    "..k...k......k...k..",
    "....................",
    "....................",
    "...................."
  ];

  // Spider Squished / Defeated Frame
  const SPIDER_SQUISHED = [
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
    "..K.K.k.PPPP.k.K.K..",
    ".KK.K.KPPPPPPK.K.KK.",
    ".KKKKKPPBrrrBPPKKKKK",
    ".k...k.PBRRRBP.k...k",
    ".......PWWWWP.......",
    "....................",
    "....................",
    "....................",
    "....................",
    "....................",
    "...................."
  ];

  // =========================================================================
  // 6. CIVILIANS (Civis - Level 5 Rescues)
  // Diverse men and women in pixel art
  // =========================================================================
  const PALETTE_CIVILIAN = {
    'H': '#3d2314', // Brown hair
    'h': '#ffd166', // Blonde hair
    'S': '#fcd5b5', // Peach skin
    's': '#c68b59', // Darker skin
    'E': '#000000', // Eyes
    'M': '#ef476f', // Mouth
    'B': '#118ab2', // Blue shirt/suit
    'P': '#06d6a0', // Teal pants
    'D': '#f72585', // Pink dress
    'W': '#ffffff', // White
    'C': '#64748b'  // Cage iron gray
  };

  const CIVILIAN_1_TRAPPED = [
    "CCCC.HHHH.CCCC",
    "C..ChHHHHhC..C",
    "C..CSSSSSSsC.C",
    "C..CSEEESEEC.C",
    "C..CSSMMSSC..C",
    "C..C.BBBB.C..C",
    "C..CBBBBBBC..C",
    "C..CBDDDBBC..C",
    "C..CBDDDBBC..C",
    "C..C.PPPP.C..C",
    "C..CPPPPPPC..C",
    "C..CPP..PPC..C",
    "CCCC.WW..WW.CC"
  ];

  const CIVILIAN_1_FREE = [
    "....HHHH......",
    "...hHHHHh.....",
    "...SSSSSSs....",
    "...SEEESEE....",
    "...SSMMSSC....",
    "....BBBB......",
    "...BBBBBB.....",
    "...BDDDBB.....",
    "...BDDDBB.....",
    "....PPPP......",
    "...PPPPPP.....",
    "...PP..PP.....",
    "...WW..WW....."
  ];

  // =========================================================================
  // 7. TILES & ENVIRONMENT ASSETS
  // =========================================================================
  const PALETTE_TILES = {
    'G': '#4ade80', // Grass top green
    'g': '#22c55e', // Grass dark green
    'D': '#92400e', // Dirt brown
    'd': '#78350f', // Dirt dark brown
    'R': '#475569', // Stone/Rock slate
    'r': '#334155', // Rock dark
    'B': '#b45309', // Brick orange-brown
    'b': '#7c2d12', // Brick dark
    'Q': '#f59e0b', // Question block gold
    'q': '#d97706', // Question block shade
    'W': '#ffffff', // White highlight / text
    'C': '#fbbf24', // Coin bright gold
    'c': '#b45309', // Coin edge
    'S': '#38bdf8', // Pipe cyan/blue
    's': '#0284c7', // Pipe shadow
    'N': '#0f172a', // Night asphalt
    'n': '#1e293b', // Night concrete
    'Y': '#facc15', // Street lamp / window yellow
    'M': '#64748b'  // Metallic girder
  };

  const TILE_GRASS = [
    "GGGGGGGGGGGGGGGG",
    "GGGGGGGGGGGGGGGG",
    "gggggggggggggggg",
    "GgGGgGGGgGGgGGgG",
    "DDDDDDDDDDDDDDDD",
    "DDDDdDDDDDDDdDDD",
    "DDDdDDDDdDDDDDDD",
    "DDDDDDDDDDDDDDDD",
    "DdDDDDDdDDDDDDDd",
    "DDDDDDDDDDDDDDDD",
    "DDDDDdDDDDDDdDDD",
    "DDDdDDDDdDDDDDDD",
    "DDDDDDDDDDDDDDDD",
    "DdDDDDDdDDDDDDDd",
    "DDDDDDDDDDDDDDDD",
    "dddddddddddddddd"
  ];

  const TILE_BRICK = [
    "bbbbbbbbbbbbbbbb",
    "bBBBBBBbBBBBBBBb",
    "bBBBBBBbBBBBBBBb",
    "bbbbbbbbbbbbbbbb",
    "bBBBbBBBBBBbBBBb",
    "bBBBbBBBBBBbBBBb",
    "bbbbbbbbbbbbbbbb",
    "bBBBBBBbBBBBBBBb",
    "bBBBBBBbBBBBBBBb",
    "bbbbbbbbbbbbbbbb",
    "bBBBbBBBBBBbBBBb",
    "bBBBbBBBBBBbBBBb",
    "bbbbbbbbbbbbbbbb",
    "bBBBBBBbBBBBBBBb",
    "bBBBBBBbBBBBBBBb",
    "bbbbbbbbbbbbbbbb"
  ];

  const TILE_QUESTION = [
    "qqqqqqqqqqqqqqqq",
    "qQQQQQQQQQQQQQQq",
    "qQQWWWWWWQQQQQQq",
    "qQQWWQQQWWQQQQQq",
    "qQQQQQQQWWQQQQQq",
    "qQQQQQQWWQQQQQQq",
    "qQQQQQWWQQQQQQQq",
    "qQQQQQWWQQQQQQQq",
    "qQQQQQQQQQQQQQQq",
    "qQQQQQWWQQQQQQQq",
    "qQQQQQWWQQQQQQQq",
    "qQQQQQQQQQQQQQQq",
    "qQQQQQQQQQQQQQQq",
    "qQQQQQQQQQQQQQQq",
    "qQQQQQQQQQQQQQQq",
    "qqqqqqqqqqqqqqqq"
  ];

  const TILE_CITY_ROAD = [
    "nnnnnnnnnnnnnnnn",
    "nNNNNNNNNNNNNNNn",
    "nNNNNNNNNNNNNNNn",
    "nNNNNNNNNNNNNNNn",
    "nNNNNNNNNNNNNNNn",
    "nNNNNWWWWWNNNNNn",
    "nNNNNWWWWWNNNNNn",
    "nNNNNNNNNNNNNNNn",
    "nNNNNNNNNNNNNNNn",
    "nNNNNNNNNNNNNNNn",
    "nNNNNNNNNNNNNNNn",
    "nNNNNNNNNNNNNNNn",
    "nNNNNNNNNNNNNNNn",
    "nNNNNNNNNNNNNNNn",
    "nNNNNNNNNNNNNNNn",
    "nnnnnnnnnnnnnnnn"
  ];

  // Coin animation (4 frames)
  const COIN_1 = [
    "..CCCC..",
    ".CWWWWc.",
    "CWCCCCc.",
    "CWCCCCc.",
    "CWCCCCc.",
    "CWCCCCc.",
    ".Cccccc.",
    "..cccc.."
  ];
  const COIN_2 = [
    "...CC...",
    "..CWCc..",
    "..CWCc..",
    "..CWCc..",
    "..CWCc..",
    "..CWCc..",
    "..CWCc..",
    "...cc..."
  ];
  const COIN_3 = [
    "....C...",
    "...CW...",
    "...CW...",
    "...CW...",
    "...CW...",
    "...CW...",
    "...CW...",
    "....c..."
  ];

  // Projectile (Laser / Energy blast)
  const PALETTE_FX = {
    'C': '#00f2fe',
    'W': '#ffffff',
    'B': '#4facfe',
    'Y': '#facc15',
    'R': '#ef4444'
  };

  const PROJECTILE_LASER = [
    "..CC..",
    ".CWWc.",
    "CWWWBc",
    "CWWWBc",
    ".CWWc.",
    "..CC.."
  ];

  const BOSS_ORB_PROJ = [
    "...YYYY...",
    "..YYYYYY..",
    ".YYWWWWYY.",
    "YYWWWWWWYY",
    "YYWWWWWWYY",
    ".YYWWWWYY.",
    "..YYYYYY..",
    "...YYYY..."
  ];

  // Build compiled sprite library
  const cache = {};

  function init() {
    const S = 2; // Pixel scale for crisply rendered character sprites
    // Galiano normal
    cache.galiano_idle = [
      compileMatrix(GALIANO_IDLE_1, PALETTE_GALIANO, S),
      compileMatrix(GALIANO_IDLE_2, PALETTE_GALIANO, S),
      compileMatrix(GALIANO_IDLE_THUMB, PALETTE_GALIANO, S),
      compileMatrix(GALIANO_IDLE_2, PALETTE_GALIANO, S)
    ];
    cache.galiano_walk = [
      compileMatrix(GALIANO_WALK_1, PALETTE_GALIANO, S),
      compileMatrix(GALIANO_WALK_2, PALETTE_GALIANO, S),
      compileMatrix(GALIANO_WALK_3, PALETTE_GALIANO, S),
      compileMatrix(GALIANO_WALK_4, PALETTE_GALIANO, S)
    ];
    cache.galiano_jump = compileMatrix(GALIANO_JUMP, PALETTE_GALIANO, S);
    cache.galiano_fall = compileMatrix(GALIANO_FALL, PALETTE_GALIANO, S);
    cache.galiano_attack = compileMatrix(GALIANO_ATTACK, PALETTE_GALIANO, S);
    cache.galiano_hurt = compileMatrix(GALIANO_HURT, PALETTE_GALIANO, S);
    cache.galiano_defeat = compileMatrix(GALIANO_DEFEAT, PALETTE_GALIANO, S);

    // Gato Preto
    cache.cat_idle = [
      compileMatrix(CAT_IDLE_1, PALETTE_CAT, S),
      compileMatrix(CAT_IDLE_2, PALETTE_CAT, S),
      compileMatrix(CAT_IDLE_1, PALETTE_CAT, S),
      compileMatrix(CAT_IDLE_2, PALETTE_CAT, S)
    ];
    cache.cat_walk = [
      compileMatrix(CAT_WALK_1, PALETTE_CAT, S),
      compileMatrix(CAT_WALK_2, PALETTE_CAT, S),
      compileMatrix(CAT_WALK_1, PALETTE_CAT, S),
      compileMatrix(CAT_WALK_2, PALETTE_CAT, S)
    ];
    cache.cat_jump = compileMatrix(CAT_JUMP, PALETTE_CAT, S);

    // Boss Barba Amarela
    cache.boss_idle = [
      compileMatrix(BOSS_IDLE_1, PALETTE_BOSS, S),
      compileMatrix(BOSS_IDLE_2, PALETTE_BOSS, S)
    ];
    cache.boss_cast = compileMatrix(BOSS_CAST, PALETTE_BOSS, S);

    // Mochila weapon item
    cache.backpack_item = compileMatrix(BACKPACK_ITEM, PALETTE_BACKPACK, S);

    // Spiders
    cache.spider_walk = [
      compileMatrix(SPIDER_WALK_1, PALETTE_SPIDER, S),
      compileMatrix(SPIDER_WALK_2, PALETTE_SPIDER, S)
    ];
    cache.spider_squished = compileMatrix(SPIDER_SQUISHED, PALETTE_SPIDER, S);

    // Civilians
    cache.civilian_trapped = compileMatrix(CIVILIAN_1_TRAPPED, PALETTE_CIVILIAN, S);
    cache.civilian_free = compileMatrix(CIVILIAN_1_FREE, PALETTE_CIVILIAN, S);

    // Tiles
    cache.tile_grass = compileMatrix(TILE_GRASS, PALETTE_TILES, S);
    cache.tile_brick = compileMatrix(TILE_BRICK, PALETTE_TILES, S);
    cache.tile_question = compileMatrix(TILE_QUESTION, PALETTE_TILES, S);
    cache.tile_city = compileMatrix(TILE_CITY_ROAD, PALETTE_TILES, S);

    // Coins
    cache.coins = [
      compileMatrix(COIN_1, PALETTE_TILES, S),
      compileMatrix(COIN_2, PALETTE_TILES, S),
      compileMatrix(COIN_3, PALETTE_TILES, S),
      compileMatrix(COIN_2, PALETTE_TILES, S)
    ];

    // FX
    cache.projectile_laser = compileMatrix(PROJECTILE_LASER, PALETTE_FX, S);
    cache.projectile_boss = compileMatrix(BOSS_ORB_PROJ, PALETTE_FX, S);

    // City of Galiano Billboard Generator
    cache.billboard = createCityBillboard();
  }

  // Generates the grand pixel art billboard "CITY OF GALIANO" (Ref Requirement)
  function createCityBillboard() {
    const width = 280;
    const height = 90;
    const { canvas, ctx } = createOffscreen(width, height);

    // Outer metal frame with bolts
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#334155';
    ctx.fillRect(4, 4, width - 8, height - 8);

    ctx.fillStyle = '#020617';
    ctx.fillRect(8, 8, width - 16, height - 16);

    // Neon skyline silhouette in background of billboard
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(12, 45, width - 24, 25);
    // Skyscraper silhouettes
    ctx.fillStyle = '#2e1065';
    ctx.fillRect(20, 25, 25, 45);
    ctx.fillRect(50, 15, 30, 55);
    ctx.fillRect(85, 30, 20, 40);
    ctx.fillRect(170, 20, 35, 50);
    ctx.fillRect(210, 15, 25, 55);
    ctx.fillRect(240, 28, 20, 42);

    // Neon glow border
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Draw pixelated neon text: "CITY OF GALIANO"
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Shadow glow
    ctx.fillStyle = '#4facfe';
    ctx.fillText('CITY OF GALIANO', width / 2 + 1, 35);
    ctx.fillText('CITY OF GALIANO', width / 2 - 1, 35);
    ctx.fillText('CITY OF GALIANO', width / 2, 36);

    // Bright neon text
    ctx.fillStyle = '#ffffff';
    ctx.fillText('CITY OF GALIANO', width / 2, 34);

    // Subtitle / tag
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#facc15';
    ctx.fillText('★ BEM-VINDO ★', width / 2, 60);

    // Billboard spotlights at bottom
    ctx.fillStyle = '#e2e8f0';
    for (let x = 40; x < width - 20; x += 50) {
      ctx.fillRect(x - 4, height - 8, 8, 4);
    }

    return canvas;
  }

  return {
    init,
    get: (name) => cache[name]
  };
})();

if (typeof window !== 'undefined') {
  window.Sprites = Sprites;
}
