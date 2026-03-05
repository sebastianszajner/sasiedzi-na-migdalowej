// ==========================================
// Sąsiedzi na Migdałowej — Game Engine
// EXPANDED: costumes, NPC AI, achievements,
// combos, weather, screen shake, floating text
// ==========================================

import type {
  GameState, Player, NPC, CollectibleItem, DialogState, MathProblem,
  LevelData, ItemType, CostumeSlot, Achievement, InteractiveObject,
  ParallaxCloud, Vehicle, VehicleType, TrickState, RaceType,
  MinigameType, KinderSkill,
} from './types';
import {
  GRAVITY, JUMP_FORCE, MOVE_SPEED, CLIMB_SPEED, MAX_FALL_SPEED,
  FRICTION, PLAYER_W, PLAYER_H, CANVAS_W, CANVAS_H,
  ITEM_FLOAT_SPEED, ITEM_EMOJIS, COMBO, COLORS, GARDEN, HOUSE,
  VEHICLE_DEFS, VEHICLE_SPAWNS, TRICK_SCORES, BIKE_RACES,
  TRICK_DEFS, BALANCE, KINDERGARTEN_GAMES,
} from './constants';
import { getNpcDialog } from './level';
import {
  sfxTvToggle, sfxFridgeToggle, sfxLampToggle,
  sfxTapToggle, sfxPianoNote, sfxBookOpen,
  sfxDoorbell, sfxPackagePickup,
} from './audio';

// ---- Generate parallax clouds ----
function generateClouds(): ParallaxCloud[] {
  const clouds: ParallaxCloud[] = [];
  for (let i = 0; i < 12; i++) {
    const layer = i < 4 ? 0 : i < 8 ? 1 : 2;
    clouds.push({
      x: Math.random() * 4000 - 1500,
      y: -80 + Math.random() * 120 + layer * 20,
      w: 60 + Math.random() * 100,
      h: 20 + Math.random() * 30,
      speed: 0.08 + layer * 0.06 + Math.random() * 0.04,
      opacity: 0.3 + layer * 0.15,
      layer,
    });
  }
  return clouds;
}

// ---- Spawn Franek companion ----
function spawnCompanion(state: GameState): void {
  if (state.companionFranek) return;
  state.companionFranek = {
    x: state.player.x - 60,
    y: state.player.y + 42,
    vx: 0, vy: 0,
    dir: state.player.dir,
    onGround: true,
    tailWag: 0,
    emotion: 'happy',
    followDelay: 0,
    posHistory: [],
  };
}

// ---- Shuffle quests & randomize collect counts for replayability ----
function shuffleAndRandomizeQuests(quests: GameState['quests']): GameState['quests'] {
  // Fisher-Yates shuffle
  for (let i = quests.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [quests[i], quests[j]] = [quests[j], quests[i]];
  }
  // First quest is active, rest inactive
  quests.forEach((q, idx) => {
    q.active = idx === 0;
    q.completed = false;
    q.currentStep = 0;
    q.steps.forEach(s => { s.completed = false; if ('currentCount' in s) (s as { currentCount: number }).currentCount = 0; });
  });
  // Randomize collect step target counts (0 or -1 from base, min 2)
  // Never INCREASE beyond base — base matches exact available items
  for (const q of quests) {
    for (const step of q.steps) {
      if (step.type === 'collect' && 'targetCount' in step) {
        const s = step as { targetCount: number };
        const base = s.targetCount;
        const delta = -Math.floor(Math.random() * 2); // 0 or -1
        s.targetCount = Math.max(2, base + delta);
      }
    }
  }
  return quests;
}

// ---- Create initial game state from level data ----
export function createGameState(level: LevelData): GameState {
  const player: Player = {
    x: level.playerStart.x,
    y: level.playerStart.y,
    w: PLAYER_W,
    h: PLAYER_H,
    vx: 0,
    vy: 0,
    dir: 1,
    onGround: false,
    onStairs: false,
    walking: false,
    walkFrame: 0,
    walkTimer: 0,
    name: 'Kuba',
    color: '#1A1A1A',       // black Adidas shirt (real photo)
    hairColor: '#C4A265',   // dirty blond (real photo)
    photoUrl: null,
    equippedCostumes: { hat: null, glasses: null, cape: null, shoes: null, accessory: null },
    trailTimer: 0,
    jumpCount: 0,
    crouching: false,
    lying: false,
    crouchTimer: 0,
    dropThrough: 0,
    // Game juice
    scaleX: 1,
    scaleY: 1,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    wasOnGround: false,
    prevVy: 0,
    emotion: 'neutral',
    emotionTimer: 0,
  };

  const npcs: NPC[] = level.npcs.map(n => ({
    ...n,
    photoUrl: null,
    idlePhase: Math.random() * Math.PI * 2,
    blinkTimer: 2 + Math.random() * 4,
  }));
  const items: CollectibleItem[] = level.items.map(i => ({
    ...i,
    collected: false,
    floatPhase: Math.random() * Math.PI * 2,
  }));

  const inventory: Record<string, number> = {};

  const totalStarsAvailable = level.quests.reduce((sum, q) => sum + q.reward, 0);

  const state: GameState = {
    phase: 'start',
    player,
    npcs,
    items,
    platforms: [...level.platforms],
    walls: [...level.walls],
    stairs: [...level.stairs],
    rooms: [...level.rooms],
    doors: [...level.doors],
    interactiveObjects: (level.interactiveObjects || []).map(o => ({ ...o, cooldown: 0 })),
    quests: shuffleAndRandomizeQuests(JSON.parse(JSON.stringify(level.quests))),
    inventory,
    dialog: null,
    mathChallenge: null,
    mathCallback: null,
    camera: { x: 0, y: 0, zoom: 1, targetZoom: 1, targetX: 0, targetY: 0, currentRoom: null },
    worldWidth: level.worldWidth,
    worldHeight: level.worldHeight,
    score: 0,
    stars: 0,
    totalStarsAvailable,
    particles: [],
    weatherParticles: [],
    floatingTexts: [],
    screenShake: { x: 0, y: 0, intensity: 0, timer: 0 },
    time: 0,
    keys: new Set(),
    interactCooldown: 0,
    celebrationTimer: 0,
    message: null,
    questPointer: null,
    costumes: JSON.parse(JSON.stringify(level.costumes)),
    achievements: JSON.parse(JSON.stringify(level.achievements)),
    weather: 'sunny',
    comboCount: 0,
    comboTimer: 0,
    questsCompleted: 0,
    totalItemsCollected: 0,
    showAchievement: null,
    achievementTimer: 0,
    airplanes: [],
    airplaneTimer: 0,
    doorbellActive: false,
    courierPackage: null,
    climbables: level.climbables ? [...level.climbables] : [],
    rcCar: null,
    // Vehicles
    vehicles: VEHICLE_SPAWNS.map(s => ({
      id: s.id,
      type: s.type as VehicleType,
      x: s.x,
      y: s.y,
      parkX: s.x,
      parkY: s.y,
      vx: 0,
      dir: 1 as const,
      active: false,
      trickState: 'none' as TrickState,
      trickTimer: 0,
      trickScore: 0,
      comboCount: 0,
      comboTimer: 0,
      wheelieAngle: 0,
      airRotation: 0,
      // BMX expansion
      balanceMeter: 0,
      totalTrickScore: 0,
      unlockedTricks: ['bunnyHop', 'wheelie', 'manual', 'grind', 'slide'] as TrickState[],
      trickChain: [],
      speedBoost: 0,
      grindSparks: false,
      landingDust: false,
    })),
    activeVehicle: null,
    freezeTimer: 0,
    streetCars: [],
    streetCarTimer: 3 + Math.random() * 5,
    // Parallax clouds (pre-generated)
    parallaxClouds: generateClouds(),
    // Day/night (start at morning ~0.15)
    dayTime: 0.2,  // start at morning (0.25=noon)
    // Franek companion (activated during quest_franek or always after quest)
    companionFranek: null,
    // Screen transition
    screenTransition: { type: 'fade', progress: 0, active: false },
    // Seasons
    season: 'wiosna',
    // Bike races
    bikeRace: null,
    // Kindergarten mini-games
    minigame: null,
    kindergartenProgress: {
      skills: { logika: 0, kreatywnosc: 0, liczenie: 0, litery: 0, kolory: 0, rytm: 0, pamiec: 0 },
      totalGames: 0,
      totalCorrect: 0,
      bestStreak: 0,
      level: 1,
      badges: [],
    },
  };

  // Setup first quest's NPC — emote + visibility (shuffle may pick any quest first)
  const firstQuest = state.quests.find(q => q.active);
  if (firstQuest) {
    const npc = state.npcs.find(n => n.id === firstQuest.npcId);
    if (npc) {
      npc.emote = '❗';
      if (!npc.visible) npc.visible = true;
    }
    // Reset all other NPCs' emotes so only the active quest NPC has ❗
    for (const n of state.npcs) {
      if (n.id !== firstQuest.npcId) n.emote = n.emote === '❗' ? null : n.emote;
    }
  }

  return state;
}

// ---- Main update loop ----
export function updateGame(state: GameState, dt: number): void {
  state.time += dt;
  (window as unknown as Record<string, unknown>).__gs = state;

  // Freeze frame (hitstop): skip game logic, only render + update effects
  if (state.freezeTimer > 0) {
    state.freezeTimer -= dt;
    updateParticles(state, dt);
    updateFloatingTexts(state, dt);
    updateScreenShake(state, dt);
    return;
  }

  // Always update effects
  updateParticles(state, dt);
  updateWeatherParticles(state, dt);
  updateFloatingTexts(state, dt);
  updateScreenShake(state, dt);
  updateAchievementDisplay(state, dt);

  if (state.phase === 'start' || state.phase === 'dialog' || state.phase === 'math'
    || state.phase === 'wardrobe' || state.phase === 'achievements') {
    return;
  }

  if (state.phase === 'celebration') {
    state.celebrationTimer -= dt;
    if (state.celebrationTimer <= 0) {
      state.phase = 'playing';
      activateNextQuest(state);
    }
    return;
  }

  if (state.phase === 'level_complete') {
    return;
  }

  // Decrement interact cooldown
  if (state.interactCooldown > 0) state.interactCooldown -= dt;

  // Playing state
  handleInput(state);
  autoEnterStairs(state);
  updatePhysics(state);
  checkPlatformCollisions(state);
  checkWallCollisions(state);
  // checkFenceBarrier removed — fence is decorative only (see level.ts walls comment)
  checkStairsProximity(state);
  checkClimbableProximity(state);
  updateGameJuice(state, dt);
  // Explorer achievement: player reached the construction site
  if (state.player.x > 1700) {
    checkAchievement(state, 'achievement_explorer');
  }
  checkItemCollection(state);
  updateItems(state, dt);
  updateNPCBehavior(state, dt);
  autoInteractNPC(state);
  autoInteractObjects(state, dt);
  updateQuestPointer(state);
  updateCamera(state);
  updateMessage(state, dt);
  updateCombo(state, dt);
  updateTrailEffect(state, dt);
  updateAirplanes(state, dt);
  updateCourierQuest(state, dt);
  updateRCCar(state, dt);
  updateVehicleTricks(state, dt);
  updateBikeRace(state, dt);
  updateStreetTraffic(state, dt);
  updateParallaxClouds(state, dt);
  updateDayNightCycle(state, dt);
  updateNPCIdle(state, dt);
  updatePlayerEmotion(state, dt);
  updateCompanionFranek(state, dt);
  updateScreenTransition(state, dt);
}

// ---- Auto-enter stairs when pressing Up or Down near stairs ----
function autoEnterStairs(state: GameState): void {
  const { player, keys, stairs } = state;
  if (player.onStairs) return;
  const up = keys.has('ArrowUp') || keys.has('w');
  const down = keys.has('ArrowDown') || keys.has('s');
  if (!up && !down) return;

  const px = player.x + player.w / 2;
  for (const stair of stairs) {
    const sx = stair.x + stair.w / 2;
    const dist = Math.abs(px - sx);

    // Going UP: player near bottom of stairs
    if (up && dist < 60 && player.y + player.h >= stair.topY && player.y + player.h <= stair.bottomY + 10) {
      player.onStairs = true;
      player.onGround = false;
      player.x = stair.x + stair.w / 2 - player.w / 2;
      player.vy = -CLIMB_SPEED;
      return;
    }

    // Going DOWN: player near top of stairs (on 2nd floor) — wider tolerance
    if (down && dist < 80 && Math.abs(player.y + player.h - stair.topY) < 30) {
      player.onStairs = true;
      player.onGround = false;
      player.x = stair.x + stair.w / 2 - player.w / 2;
      player.vy = CLIMB_SPEED;
      return;
    }
  }
}

// ---- Climbable surfaces (trees, poles, crane mast) ----
function checkClimbableProximity(state: GameState): void {
  const { player, keys, climbables } = state;
  if (!climbables || climbables.length === 0) return;

  const up = keys.has('ArrowUp') || keys.has('w');
  const down = keys.has('ArrowDown') || keys.has('s');
  const px = player.x + player.w / 2;

  // Auto-enter climbing when pressing Up/Down near a climbable
  if (!player.onStairs && (up || down)) {
    for (const cl of climbables) {
      const cx = cl.x + cl.w / 2;
      const dist = Math.abs(px - cx);

      if (up && dist < 40 && player.y + player.h >= cl.topY && player.y + player.h <= cl.bottomY + 10) {
        player.onStairs = true; // reuse stairs climbing mechanic
        player.onGround = false;
        player.x = cl.x + cl.w / 2 - player.w / 2;
        player.vy = -CLIMB_SPEED;
        return;
      }
      if (down && dist < 40 && player.y + player.h >= cl.topY - 5 && player.y + player.h <= cl.bottomY + 10) {
        player.onStairs = true;
        player.onGround = false;
        player.x = cl.x + cl.w / 2 - player.w / 2;
        player.vy = CLIMB_SPEED;
        return;
      }
    }
  }

  // Keep player on climbable while climbing — find active climbable and clamp
  if (player.onStairs) {
    for (const cl of climbables) {
      const cx = cl.x + cl.w / 2;
      const dist = Math.abs(px - cx);
      if (dist < 40) {
        // Check if player is within extended bounds (allow small overshoot)
        if (player.y + player.h >= cl.topY - 10 && player.y <= cl.bottomY + 10) {
          // Clamp to top
          if (player.y + player.h < cl.topY) {
            player.y = cl.topY - player.h;
            player.vy = 0;
            player.onStairs = false;
            player.onGround = true;
            player.jumpCount = 0;
          }
          // Clamp to bottom
          if (player.y + player.h > cl.bottomY) {
            player.y = cl.bottomY - player.h;
            player.vy = 0;
            player.onStairs = false;
            player.onGround = true;
            player.jumpCount = 0;
          }
          break; // only clamp to nearest climbable
        }
      }
    }
  }
}

// ---- Auto-interact with NPC when player walks close (child-friendly!) ----
function autoInteractNPC(state: GameState): void {
  if (state.phase !== 'playing') return;
  if (state.interactCooldown > 0) return;

  const { player, npcs, quests } = state;
  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  for (const npc of npcs) {
    if (!npc.visible) continue;

    const nx = npc.x + npc.w / 2;
    const ny = npc.y + npc.h / 2;
    const dist = Math.sqrt((px - nx) ** 2 + (py - ny) ** 2);

    // Auto-trigger dialog when close (within 60px) — child-friendly!
    if (dist < 60) {
      const quest = quests.find(q => q.active && !q.completed && (q.npcId === npc.id ||
        q.steps[q.currentStep]?.targetNpcId === npc.id));
      if (!quest) continue;

      const step = quest.steps[quest.currentStep];

      if (step.type === 'talk' && quest.npcId === npc.id) {
        playerInteract(state);
        return;
      }
      if (step.type === 'deliver' && step.targetNpcId === npc.id) {
        playerInteract(state);
        return;
      }
      if (step.type === 'chase' && step.targetNpcId === npc.id) {
        playerInteract(state);
        return;
      }
      if (step.type === 'find' && step.targetNpcId === npc.id) {
        playerInteract(state);
        return;
      }
    }
  }
}

// ---- Particle helper ----
function spawnParticles(state: GameState, x: number, y: number, count: number, color: string): void {
  for (let i = 0; i < count; i++) {
    state.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 60,
      vy: -(Math.random() * 40 + 20),
      life: 0.6 + Math.random() * 0.4,
      maxLife: 1,
      color,
      size: 3 + Math.random() * 3,
      type: 'sparkle',
    });
  }
}

// ---- Auto-interact with environmental objects ----
function autoInteractObjects(state: GameState, dt: number): void {
  if (state.phase !== 'playing') return;
  const { player, interactiveObjects, keys } = state;
  const px = player.x + player.w / 2;
  const actionKey = keys.has('e') || keys.has('E');

  for (const obj of interactiveObjects) {
    // Decrease cooldown
    if (obj.cooldown > 0) obj.cooldown -= dt;

    // Check proximity (horizontal distance only — objects on walls above player)
    const ox = obj.x + obj.w / 2;
    const distX = Math.abs(px - ox);

    if (distX < 50 && actionKey && obj.cooldown <= 0) {
      toggleInteractiveObject(state, obj);
      obj.cooldown = 0.8; // prevent rapid toggling
    }
  }
}

// Try to interact with nearest object (called from keydown handler)
export function tryInteractObject(state: GameState): boolean {
  const px = state.player.x + state.player.w / 2;
  for (const obj of state.interactiveObjects) {
    const ox = obj.x + obj.w / 2;
    const distX = Math.abs(px - ox);
    if (distX < 50 && obj.cooldown <= 0) {
      toggleInteractiveObject(state, obj);
      obj.cooldown = 0.8;
      return true;
    }
  }
  return false;
}

// Toggle an interactive object and play appropriate SFX
export function toggleInteractiveObject(state: GameState, obj: InteractiveObject): void {
  obj.state = !obj.state;

  switch (obj.type) {
    case 'tv':
      sfxTvToggle(obj.state);
      state.message = {
        text: obj.state ? '📺 Telewizor włączony!' : '📺 Telewizor wyłączony',
        timer: 1.5, icon: '📺',
      };
      break;
    case 'fridge':
      sfxFridgeToggle(obj.state);
      state.message = {
        text: obj.state ? '🧊 Lodówka otwarta! Brr, zimno!' : '🧊 Lodówka zamknięta',
        timer: 2, icon: '🧊',
      };
      break;
    case 'lamp':
      sfxLampToggle();
      state.message = {
        text: obj.state ? '💡 Światło włączone!' : '💡 Światło wyłączone',
        timer: 1.5, icon: '💡',
      };
      break;
    case 'tap':
      sfxTapToggle(obj.state);
      state.message = {
        text: obj.state ? '🚿 Woda leci!' : '🚿 Kran zakręcony',
        timer: 1.5, icon: '🚿',
      };
      break;
    case 'piano': {
      const noteIdx = Math.floor(Math.random() * 8);
      sfxPianoNote(noteIdx);
      state.message = {
        text: '🎹 ♪♫♬ Piękna melodia!',
        timer: 1.5, icon: '🎹',
      };
      // Piano always resets to allow re-play
      obj.state = false;
      break;
    }
    case 'bookshelf':
      sfxBookOpen();
      state.message = {
        text: '📚 Ciekawe książki! "Przygody Kubusia Puchatka"',
        timer: 2.5, icon: '📚',
      };
      obj.state = false;
      break;
    case 'rc_controller':
      if (!state.rcCar) {
        spawnRCCar(state);
        obj.state = true; // picked up — can't pick up again
      } else {
        toggleRCControl(state);
      }
      break;
    case 'projector':
      sfxTvToggle(obj.state); // reuse TV sound for projector
      state.message = {
        text: obj.state ? '📽️ Projektor włączony! Ekran opuszczony!' : '📽️ Projektor wyłączony',
        timer: 2, icon: '📽️',
      };
      break;
    case 'paczkomat':
      state.message = {
        text: '📦 Paczkomat otwarty! Sprawdź swoje paczki!',
        timer: 2, icon: '📦',
      };
      obj.state = false; // reset
      break;
  }

  // Spawn particles
  spawnParticles(state, obj.x + obj.w / 2, obj.y, 5, obj.type === 'tap' ? '#42A5F5' : '#FFD700');
}

// ---- Input handling ----
function handleInput(state: GameState): void {
  const { player, keys } = state;
  const left = keys.has('ArrowLeft') || keys.has('a');
  const right = keys.has('ArrowRight') || keys.has('d');
  const up = keys.has('ArrowUp') || keys.has('w');
  const down = keys.has('ArrowDown') || keys.has('s');
  const jump = keys.has(' ');

  player.walking = false;

  // === VEHICLE MODE ===
  if (state.activeVehicle) {
    const v = state.activeVehicle;
    const def = VEHICLE_DEFS[v.type];
    player.crouching = false;
    player.lying = false;

    const ACCEL = 0.5;
    const boostedSpeed = def.speed * (1 + v.speedBoost * 0.4); // up to 40% speed boost
    const targetVx = left ? -boostedSpeed : right ? boostedSpeed : 0;
    if (left || right) {
      player.vx += (targetVx - player.vx) * ACCEL;
      player.dir = left ? -1 : 1;
      v.dir = player.dir;
      player.walking = true;
    } else {
      player.vx *= FRICTION;
      if (Math.abs(player.vx) < 0.1) player.vx = 0;
    }
    v.vx = player.vx;
    v.x = player.x;
    v.y = player.y;

    // Trick detection on vehicle
    if (down && player.onGround && (def.tricks as readonly string[]).includes('manual')) {
      if (v.trickState === 'none') {
        v.trickState = 'manual';
        v.trickTimer = 0;
      }
    } else if (up && player.onGround && (def.tricks as readonly string[]).includes('wheelie')) {
      if (v.trickState === 'none') {
        v.trickState = 'wheelie';
        v.trickTimer = 0;
        v.wheelieAngle = 0;
      }
    } else if (!down && !up && v.trickState === 'manual') {
      v.trickState = 'none';
    } else if (!up && v.trickState === 'wheelie') {
      v.trickState = 'none';
      v.wheelieAngle = 0;
    }

    // Walk cycle
    if (player.walking) {
      player.walkTimer += 0.12;
      player.walkFrame = Math.floor(player.walkTimer) % 8;
    } else {
      player.walkFrame = 0;
      player.walkTimer = 0;
    }
    return; // skip normal input handling
  }

  if (player.onStairs) {
    // On stairs: no crouching/lying
    player.crouching = false;
    player.lying = false;
    player.vx = 0;
    if (up) { player.vy = -CLIMB_SPEED; player.walking = true; }
    else if (down) { player.vy = CLIMB_SPEED; player.walking = true; }
    else { player.vy = 0; }
    if (left) { player.vx = -MOVE_SPEED * 0.5; player.dir = -1; }
    if (right) { player.vx = MOVE_SPEED * 0.5; player.dir = 1; }
  } else {
    // Stand up from lying when movement key or jump pressed
    if (player.lying && (left || right || up || jump)) {
      player.lying = false;
      player.crouching = false;
    }

    // Release down while crouching → stand up (lying stays until explicit action)
    if (!down && player.crouching) {
      player.crouching = false;
    }

    // While crouching or lying: stop horizontal movement
    if (player.crouching || player.lying) {
      player.vx = 0;
      player.walking = false;
    } else {
      // Smooth acceleration movement (not instant)
      const ACCEL = 0.6;   // acceleration rate
      const targetVx = left ? -MOVE_SPEED : right ? MOVE_SPEED : 0;
      if (left || right) {
        player.vx += (targetVx - player.vx) * ACCEL;
        player.dir = left ? -1 : 1;
        player.walking = true;
      } else {
        player.vx *= FRICTION;
        if (Math.abs(player.vx) < 0.1) player.vx = 0;
      }
    }
  }

  // 8-frame walk cycle for smoother animation
  if (player.walking) {
    player.walkTimer += 0.12;
    player.walkFrame = Math.floor(player.walkTimer) % 8;
  } else {
    // Smooth deceleration of walkTimer
    if (player.walkTimer > 0) {
      player.walkFrame = 0;
      player.walkTimer = 0;
    }
  }
}

// ---- Crouch/Lie down (called from keydown, NOT continuous polling) ----
export function playerCrouchOrLie(state: GameState): void {
  if (state.phase !== 'playing') return;
  const { player, stairs } = state;
  if (player.onStairs || !player.onGround) return;

  // Don't crouch if near stairs — DOWN is used to descend
  const px = player.x + player.w / 2;
  let nearStairs = false;
  for (const stair of stairs) {
    const sx = stair.x + stair.w / 2;
    if (Math.abs(px - sx) < 80 && Math.abs(player.y + player.h - stair.topY) < 30) {
      nearStairs = true;
      break; // near stairs top — let autoEnterStairs handle DOWN
    }
    if (Math.abs(px - sx) < 80 && player.y + player.h >= stair.topY && player.y + player.h <= stair.bottomY + 10) {
      nearStairs = true;
      break; // on/near stairs body — don't crouch
    }
  }
  // Also check climbables (ladders)
  for (const cl of state.climbables) {
    const cx = cl.x + cl.w / 2;
    if (Math.abs(px - cx) < 40 && player.y + player.h >= cl.topY && player.y + player.h <= cl.bottomY + 10) {
      nearStairs = true;
      break;
    }
  }
  if (nearStairs) return;

  // Drop-through: if on 2nd floor platform (y+h ≈ 330), drop down — but NOT near stairs
  if (player.onGround && player.y + player.h < 400) {
    player.dropThrough = 0.3; // ignore thin platforms for 0.3s
    player.onGround = false;
    player.vy = 2;
    return;
  }

  if (player.lying) {
    // Already lying — pressing down again stands up
    player.lying = false;
    player.crouching = false;
  } else if (player.crouching) {
    // Already crouching — check double-tap timer for lying
    if (state.time - player.crouchTimer < 0.4) {
      player.lying = true;
      player.crouching = false;
    }
  } else {
    // Not crouching, not lying — start crouching
    player.crouching = true;
    player.lying = false;
    player.crouchTimer = state.time;
  }
}

// ---- Jump (with double jump, coyote time & jump buffer!) ----
const COYOTE_FRAMES = 7;  // ~116ms at 60fps — grace period after leaving edge
const JUMP_BUFFER_FRAMES = 7; // ~116ms — buffer jump input before landing

export function playerJump(state: GameState): boolean {
  if (state.phase !== 'playing') return false;
  const { player } = state;

  // Vehicle jump
  if (state.activeVehicle) {
    const v = state.activeVehicle;
    const def = VEHICLE_DEFS[v.type];
    player.jumpBufferTimer = JUMP_BUFFER_FRAMES;
    const canGroundJump = (player.onGround || player.coyoteTimer > 0) && !player.onStairs;
    if (canGroundJump && player.jumpCount === 0) {
      player.vy = def.jumpForce;
      player.onGround = false;
      player.jumpCount = 1;
      player.coyoteTimer = 0;
      player.jumpBufferTimer = 0;
      player.scaleX = 0.75;
      player.scaleY = 1.3;
      // Trick: bunnyHop on jump
      if ((def.tricks as readonly string[]).includes('bunnyHop') && v.trickState === 'none') {
        v.trickState = 'bunnyHop';
        v.trickTimer = 0;
        v.comboCount++;
        v.comboTimer = 2;
        v.trickScore += TRICK_SCORES.bunnyHop || 10;
        spawnFloatingText(state, player.x + player.w / 2, player.y - 10, 'Bunny Hop!', '#4CAF50', 18);
      }
      spawnJumpParticles(state, player.x + player.w / 2, player.y + player.h);
      return true;
    }
    // Airborne trick: pick from unlocked air tricks
    if (!player.onGround && player.jumpCount === 1) {
      const airTricks = (def.tricks as readonly string[]).filter(t => {
        const td = TRICK_DEFS[t];
        return td && td.airOnly && v.trickState !== t && v.unlockedTricks.includes(t as TrickState);
      });
      if (airTricks.length > 0) {
        // Cycle through air tricks based on combo count (so player gets different tricks each jump)
        const trickId = airTricks[v.comboCount % airTricks.length] as TrickState;
        const td = TRICK_DEFS[trickId];
        v.trickState = trickId;
        v.airRotation = 0;
        v.trickTimer = 0;
        v.comboCount++;
        v.comboTimer = 2;
        const score = TRICK_SCORES[trickId] || 30;
        v.trickScore += score;
        v.totalTrickScore += score;
        v.trickChain.push(trickId);
        // Unlock check — unlock next tier tricks
        checkTrickUnlocks(v);
        spawnFloatingText(state, player.x + player.w / 2, player.y - 20,
          `${td?.emoji || '🔥'} ${td?.name || trickId}!`, td?.color || '#FF5722', 22);
        player.vy = JUMP_FORCE * 0.7;
        player.jumpCount = 2;
        // Speed boost after trick
        v.speedBoost = Math.min(v.speedBoost + 0.15, 1.0);
        return true;
      }
    }
    return false;
  }

  // Stand up first if crouching/lying — don't jump
  if (player.crouching || player.lying) {
    player.crouching = false;
    player.lying = false;
    return false;
  }

  // Buffer the jump input (used later if player lands within buffer window)
  player.jumpBufferTimer = JUMP_BUFFER_FRAMES;

  // Can jump: on ground OR within coyote time window (just fell off edge)
  const canGroundJump = (player.onGround || player.coyoteTimer > 0) && !player.onStairs;

  // Normal jump (from ground or coyote)
  if (canGroundJump && player.jumpCount === 0) {
    player.vy = JUMP_FORCE;
    player.onGround = false;
    player.jumpCount = 1;
    player.coyoteTimer = 0; // consume coyote time
    player.jumpBufferTimer = 0;
    // Squash & stretch: stretch on jump
    player.scaleX = 0.75;
    player.scaleY = 1.3;
    spawnJumpParticles(state, player.x + player.w / 2, player.y + player.h);
    return true;
  }
  // Double jump in air (press space again!)
  if (!player.onGround && !player.onStairs && player.jumpCount === 1) {
    player.vy = JUMP_FORCE * 0.82; // slightly weaker second jump
    player.jumpCount = 2;
    player.jumpBufferTimer = 0;
    // Squash & stretch: stretch on double jump
    player.scaleX = 0.7;
    player.scaleY = 1.35;
    spawnDoubleJumpParticles(state, player.x + player.w / 2, player.y + player.h / 2);
    return true;
  }
  return false;
}

// ---- Interact ----
export function playerInteract(state: GameState): DialogState | MathProblem | null {
  if (state.phase !== 'playing') return null;
  if (state.interactCooldown > 0) return null;
  state.interactCooldown = 0.3;

  const { player, npcs, quests, stairs } = state;
  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;

  // Check stairs entry
  for (const stair of stairs) {
    const sx = stair.x + stair.w / 2;
    const dist = Math.abs(px - sx);
    if (dist < 50 && !player.onStairs) {
      player.onStairs = true;
      player.onGround = false;
      player.x = stair.x + stair.w / 2 - player.w / 2;
      return null;
    }
  }

  // Check NPC interaction
  for (const npc of npcs) {
    if (!npc.visible) continue;

    const nx = npc.x + npc.w / 2;
    const ny = npc.y + npc.h / 2;
    const dist = Math.sqrt((px - nx) ** 2 + (py - ny) ** 2);

    if (dist < npc.interactRadius) {
      // Find matching quest
      const quest = quests.find(q => q.active && !q.completed && (q.npcId === npc.id ||
        q.steps[q.currentStep]?.targetNpcId === npc.id));
      if (!quest) continue;

      const step = quest.steps[quest.currentStep];

      // Talk step
      if (step.type === 'talk' && quest.npcId === npc.id) {
        const lines = getNpcDialog(npc.id, quest.id, quest.currentStep);
        const dialog: DialogState = {
          npcId: npc.id, npcName: npc.name, lines, currentLine: 0,
          icon: getNpcIcon(npc.id),
          onComplete: () => {
            step.completed = true;
            quest.currentStep++;
            npc.emote = null;
            state.phase = 'playing';
            // Show NPCs that become relevant
            showQuestNPCs(state, quest.id);
            const nextStep = quest.steps[quest.currentStep];
            if (nextStep) showMessage(state, `${nextStep.icon} ${nextStep.description}`, 3);
          },
        };
        state.dialog = dialog;
        state.phase = 'dialog';
        return dialog;
      }

      // Chase step (approach NPC → per-NPC behavior)
      if (step.type === 'chase' && step.targetNpcId === npc.id) {
        step.completed = true;
        quest.currentStep++;
        if (npc.id === 'kot') {
          npc.visible = false; // cat runs away
          spawnFleeParticles(state, npc.x, npc.y);
          triggerScreenShake(state, 3, 0.3);
          showMessage(state, '🐱💨 Kot uciekł!', 2);
          checkAchievement(state, 'achievement_cat_chaser');
        } else if (npc.id === 'franek') {
          // Franek stays — he's a good boy
          spawnCelebrationParticles(state, npc.x, npc.y);
          triggerScreenShake(state, 3, 0.3);
          showMessage(state, '🐾 Złapałeś Franka! Hau hau! 🐕', 2);
          npc.emote = '❤️';
        } else {
          npc.visible = false;
          spawnFleeParticles(state, npc.x, npc.y);
          triggerScreenShake(state, 3, 0.3);
          showMessage(state, `✅ ${npc.name} dogoniony!`, 2);
        }
        const nextStep = quest.steps[quest.currentStep];
        if (nextStep) showMessage(state, `${nextStep.icon} ${nextStep.description}`, 3);
        return null;
      }

      // Find step (find hidden NPC)
      if (step.type === 'find' && step.targetNpcId === npc.id) {
        const lines = getNpcDialog(npc.id, quest.id, quest.currentStep);
        const dialog: DialogState = {
          npcId: npc.id, npcName: npc.name, lines, currentLine: 0,
          icon: '🐕',
          onComplete: () => {
            step.completed = true;
            quest.currentStep++;
            state.phase = 'playing';
            spawnCelebrationParticles(state, npc.x, npc.y);
            const nextStep = quest.steps[quest.currentStep];
            if (nextStep) showMessage(state, `${nextStep.icon} ${nextStep.description}`, 3);
          },
        };
        state.dialog = dialog;
        state.phase = 'dialog';
        return dialog;
      }

      // Deliver step
      if (step.type === 'deliver' && step.targetNpcId === npc.id) {
        step.completed = true;
        quest.currentStep++;
        const lines = getNpcDialog(npc.id, quest.id, quest.currentStep - 1);
        const dialog: DialogState = {
          npcId: npc.id, npcName: npc.name, lines, currentLine: 0,
          icon: getNpcIcon(npc.id),
          onComplete: () => {
            const mathStep = quest.steps[quest.currentStep];
            if (mathStep && mathStep.type === 'math' && mathStep.mathProblem) {
              state.mathChallenge = mathStep.mathProblem;
              state.mathCallback = () => {
                mathStep.completed = true;
                quest.currentStep++;
                quest.completed = true;
                state.stars += quest.reward;
                state.score += 100;
                state.questsCompleted++;
                state.phase = 'celebration';
                state.celebrationTimer = 3;
                spawnCelebrationParticles(state, player.x + player.w / 2, player.y);
                triggerScreenShake(state, 5, 0.5);
                // Unlock costume reward
                if (quest.costumeReward) {
                  unlockCostume(state, quest.costumeReward);
                }
                // Check achievements
                checkAchievement(state, 'achievement_first_quest');
                checkAchievement(state, 'achievement_helper');
                checkAchievement(state, 'achievement_math_master');
                if (state.questsCompleted >= state.quests.length) {
                  checkAchievement(state, 'achievement_all_quests');
                }
                autoSave(state);
              };
              state.phase = 'math';
            } else {
              // Quest without math at end
              quest.completed = true;
              state.stars += quest.reward;
              state.score += 100;
              state.questsCompleted++;
              state.phase = 'celebration';
              state.celebrationTimer = 3;
              spawnCelebrationParticles(state, player.x + player.w / 2, player.y);
              if (quest.costumeReward) unlockCostume(state, quest.costumeReward);
              checkAchievement(state, 'achievement_first_quest');
              autoSave(state);
            }
          },
        };
        state.dialog = dialog;
        state.phase = 'dialog';
        return dialog;
      }
    }
  }

  return null;
}

// ---- Show quest-specific NPCs (with entrance animation reset) ----
function showNpc(state: GameState, id: string): void {
  const npc = state.npcs.find(n => n.id === id);
  if (npc && !npc.visible) {
    npc.visible = true;
    npc.animTimer = 0; // reset for entrance animation
  }
}

function showQuestNPCs(state: GameState, questId: string): void {
  if (questId === 'quest_cat') showNpc(state, 'kot');
  if (questId === 'quest_mailman') showNpc(state, 'listonosz');
  if (questId === 'quest_jurek') showNpc(state, 'jurek_npc');
  if (questId === 'quest_uncle') showNpc(state, 'wujek');
  if (questId === 'quest_crane' || questId === 'quest_climb') showNpc(state, 'budowlaniec');
  if (questId === 'quest_garden_help') showNpc(state, 'sasiadka');
  if (questId === 'quest_franek') showNpc(state, 'franek');
  if (questId === 'quest_wash_hands' || questId === 'quest_hygiene_master') showNpc(state, 'mirek');
  if (questId === 'quest_baby') showNpc(state, 'mama');
  if (questId === 'quest_baby_name') showNpc(state, 'mama');
  if (questId === 'quest_hospital_bag') showNpc(state, 'mama');
  if (questId === 'quest_baby_room') showNpc(state, 'tata');
  if (questId === 'quest_baby_gift') showNpc(state, 'mama');
  if (questId === 'quest_breathing') showNpc(state, 'mama');
  if (questId === 'quest_rafal') { showNpc(state, 'mama'); showNpc(state, 'rafal'); }
  if (questId === 'quest_zabka') showNpc(state, 'zabka_clerk');
  if (questId === 'quest_police') showNpc(state, 'policjant');
  // Food quests — mama and tata are always visible, no special NPC show needed
}

// ---- NPC AI Behavior ----
function updateNPCBehavior(state: GameState, dt: number): void {
  for (const npc of state.npcs) {
    if (!npc.visible) continue;
    npc.animTimer += dt;

    if (npc.behavior === 'patrol' && npc.patrolMinX !== undefined && npc.patrolMaxX !== undefined) {
      const speed = npc.patrolSpeed || 1;
      npc.x += npc.dir * speed;

      if (npc.x <= npc.patrolMinX) { npc.dir = 1; }
      if (npc.x >= npc.patrolMaxX) { npc.dir = -1; }
    }

    // Flee from player when close (cat) — constrained to garden bounds
    if (npc.behavior === 'flee' || (npc.id === 'kot' && npc.visible)) {
      const px = state.player.x + state.player.w / 2;
      const nx = npc.x + npc.w / 2;
      const dist = Math.abs(px - nx);
      // Only flee during the active cat quest chase step
      const catQuest = state.quests.find(q => q.id === 'quest_cat' && q.active && !q.completed);
      const isChaseStep = catQuest && catQuest.steps[catQuest.currentStep]?.type === 'chase';
      const fleeSpeed = isChaseStep ? 1.5 : 1.8; // slower during chase so player can catch
      if (dist < 120) {
        npc.dir = px < nx ? 1 : -1;
        npc.x += npc.dir * fleeSpeed;
      }
      // Constrain cat to garden area — can't run away forever
      const catMinX = 920;
      const catMaxX = 1400;
      if (npc.x < catMinX) { npc.x = catMinX; npc.dir = 1; }
      if (npc.x > catMaxX) { npc.x = catMaxX; npc.dir = -1; }
    }

    // Franek follows player when nearby (loyal dog!) — with hysteresis to prevent jitter
    if (npc.id === 'franek' && npc.visible) {
      const px = state.player.x + state.player.w / 2;
      const nx = npc.x + npc.w / 2;
      const dist = Math.abs(px - nx);
      if (dist < 200 && dist > 55) {
        // Run towards player (start following at 55px, stop at 35px — hysteresis)
        npc.dir = px < nx ? -1 : 1;
        npc.x += npc.dir * 2;
      } else if (dist <= 35) {
        // Sit near player, face same direction
        npc.dir = state.player.dir;
      }
      // Franek stays in garden/house area
      if (npc.x < 0) npc.x = 0;
      if (npc.x > 1500) npc.x = 1500;
    }
  }
}

// ---- Game Juice: coyote time, jump buffer, squash & stretch, landing FX ----
function updateGameJuice(state: GameState, dt: number): void {
  const p = state.player;

  // --- Coyote time: grace period after walking off edge ---
  if (p.onGround) {
    p.coyoteTimer = COYOTE_FRAMES;
  } else if (p.coyoteTimer > 0) {
    p.coyoteTimer--;
  }

  // --- Jump buffer: if player pressed jump recently and just landed ---
  if (p.jumpBufferTimer > 0) {
    p.jumpBufferTimer--;
    if (p.onGround && p.jumpCount === 0) {
      // Execute buffered jump!
      p.vy = JUMP_FORCE;
      p.onGround = false;
      p.jumpCount = 1;
      p.jumpBufferTimer = 0;
      p.coyoteTimer = 0;
      p.scaleX = 0.75;
      p.scaleY = 1.3;
      spawnJumpParticles(state, p.x + p.w / 2, p.y + p.h);
    }
  }

  // --- Landing detection: squash + dust + optional freeze ---
  if (p.onGround && !p.wasOnGround) {
    const impactSpeed = Math.abs(p.prevVy);
    if (impactSpeed > 3) {
      // Squash on landing (proportional to fall speed)
      const squashAmount = Math.min(0.4, impactSpeed * 0.03);
      p.scaleX = 1 + squashAmount;
      p.scaleY = 1 - squashAmount;
      // Landing dust particles (enhanced)
      spawnLandingDust(state);
      // Hard landing freeze frame (only for big falls)
      if (impactSpeed > 8) {
        state.freezeTimer = 0.04; // 40ms hitstop
        triggerScreenShake(state, impactSpeed * 0.4, 0.15);
      }
    }
  }

  // --- Squash & stretch lerp back to 1.0 ---
  p.scaleX += (1 - p.scaleX) * 10 * dt;
  p.scaleY += (1 - p.scaleY) * 10 * dt;
  // Snap to 1.0 when close enough
  if (Math.abs(p.scaleX - 1) < 0.005) p.scaleX = 1;
  if (Math.abs(p.scaleY - 1) < 0.005) p.scaleY = 1;

  // --- Running dust particles ---
  if (p.onGround && p.walking && Math.random() < 0.15) {
    state.particles.push({
      x: p.x + p.w / 2 - p.dir * 8,
      y: p.y + p.h,
      vx: -p.dir * (0.5 + Math.random()),
      vy: -Math.random() * 1,
      life: 0.3,
      maxLife: 0.3,
      color: '#C8B898',
      size: 2 + Math.random() * 2,
    });
  }

  // --- Store previous frame state for next frame ---
  p.wasOnGround = p.onGround;
  p.prevVy = p.vy;
}

// ---- Physics ----
function updatePhysics(state: GameState): void {
  const { player } = state;

  // Decrement drop-through timer
  if (player.dropThrough > 0) player.dropThrough -= 1 / 60;

  if (!player.onStairs) {
    player.vy += GRAVITY;
    if (player.vy > MAX_FALL_SPEED) player.vy = MAX_FALL_SPEED;
  }

  player.x += player.vx;
  player.y += player.vy;

  if (player.x < -7250) player.x = -7250; // left bound (extended to plac zabaw)
  if (player.x + player.w > state.worldWidth) {
    player.x = state.worldWidth - player.w;
  }
}

// ---- Platform collisions ----
function checkPlatformCollisions(state: GameState): void {
  const { player, platforms } = state;
  player.onGround = false;

  // Skip platform collisions while on stairs — stair system handles positioning
  if (player.onStairs) return;

  for (const plat of platforms) {
    if (player.vy >= 0) {
      const playerBottom = player.y + player.h;
      const prevBottom = playerBottom - player.vy;

      if (
        player.x + player.w > plat.x &&
        player.x < plat.x + plat.w &&
        prevBottom <= plat.y + 2 &&
        playerBottom >= plat.y
      ) {
        // Skip thin platforms (floor2) during drop-through
        if (player.dropThrough > 0 && plat.h <= 12) continue;

        player.y = plat.y - player.h;
        player.vy = 0;
        player.onGround = true;
        player.jumpCount = 0;
      }
    }
  }

  // Trampoline bounce zone (garden, x:1100-1150)
  if (player.onGround && player.x + player.w > 1100 && player.x < 1150 &&
      player.y + player.h >= 548 && player.y + player.h <= 566) {
    player.vy = -16; // super bounce!
    player.onGround = false;
    player.jumpCount = 1;
  }
}

// ---- Wall collisions ----
function checkWallCollisions(state: GameState): void {
  const { player, walls } = state;

  for (const wall of walls) {
    if (
      player.x + player.w > wall.x &&
      player.x < wall.x + wall.w &&
      player.y + player.h > wall.y &&
      player.y < wall.y + wall.h
    ) {
      const overlapLeft = player.x + player.w - wall.x;
      const overlapRight = wall.x + wall.w - player.x;
      const overlapTop = player.y + player.h - wall.y;
      const overlapBottom = wall.y + wall.h - player.y;

      const min = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if (min === overlapLeft) { player.x = wall.x - player.w; player.vx = 0; }
      else if (min === overlapRight) { player.x = wall.x + wall.w; player.vx = 0; }
      else if (min === overlapTop) { player.y = wall.y - player.h; player.vy = 0; player.onGround = true; player.jumpCount = 0; }
      else { player.y = wall.y + wall.h; player.vy = 0; }
    }
  }
}

// ---- Stairs proximity ----
function checkStairsProximity(state: GameState): void {
  const { player, stairs } = state;

  if (player.onStairs) {
    const px = player.x + player.w / 2;

    // Find which stair the player is actually on (by x proximity)
    let activeStair: typeof stairs[0] | null = null;
    for (const s of stairs) {
      if (px > s.x - 30 && px < s.x + s.w + 30 &&
          player.y + player.h >= s.topY - 10 && player.y <= s.bottomY + 10) {
        activeStair = s;
        break;
      }
    }

    if (!activeStair) {
      player.onStairs = false;
      player.jumpCount = 0;
      return;
    }

    // Clamp only to the active stair
    if (player.y + player.h < activeStair.topY) {
      player.y = activeStair.topY - player.h;
      player.vy = 0;
      player.onStairs = false;
      player.onGround = true;
      player.jumpCount = 0;
    }
    if (player.y + player.h > activeStair.bottomY) {
      player.y = activeStair.bottomY - player.h;
      player.vy = 0;
      player.onStairs = false;
      player.onGround = true;
      player.jumpCount = 0;
    }
  }
}

// ---- Item collection ----
function checkItemCollection(state: GameState): void {
  const { player, items, quests } = state;

  for (const item of items) {
    if (item.collected) continue;

    if (
      player.x + player.w > item.x &&
      player.x < item.x + item.w &&
      player.y + player.h > item.y &&
      player.y < item.y + item.h
    ) {
      const quest = quests.find(q => q.id === item.questId && q.active && !q.completed);
      if (!quest) continue;

      const step = quest.steps[quest.currentStep];
      if (step.type !== 'collect') continue;

      // Check item type match
      const isAnyToy = ['toy_car', 'toy_ball', 'toy_bear', 'toy_block'].includes(item.type);
      const isAnyLego = item.type.startsWith('lego_');
      const isAnyPlush = item.type.startsWith('plush_');
      const isAnyBath = ['rubber_duck', 'shampoo'].includes(item.type);
      const isAnyBaby = ['baby_toy', 'baby_bottle', 'baby_blanket'].includes(item.type);
      const isAnyBabyName = item.type === 'baby_name_card';
      const isAnyHospital = item.type === 'hospital_item';
      const isAnyBabyDecor = item.type === 'baby_decor';
      const isAnyCraftSupply = item.type === 'craft_supply';
      const isAnyBalloon = item.type === 'balloon';
      const isAnyRafal = ['pierogi', 'ptasie_mleczko'].includes(item.type);
      const isAnyCoffee = ['coffee', 'milk', 'cookie'].includes(item.type);
      const isAnyBreakfast = ['egg', 'milk', 'cream', 'flour'].includes(item.type);
      const isAnyLunch = ['carrot', 'ingredient', 'bread'].includes(item.type);
      const isAnyDinner = ['bread', 'cheese', 'salad', 'juice'].includes(item.type);
      const isAnyZabka = ['chips', 'candy', 'water', 'ice_cream'].includes(item.type);
      const isAnyMovieNight = ['popcorn'].includes(item.type);
      const isAnyArtifact = item.type === 'artifact';

      if (step.itemType) {
        if (step.itemType !== item.type) {
          // Allow grouped items for specific quests
          const questAllowsGroup =
            (item.questId === 'quest_lego' && isAnyLego) ||
            (item.questId === 'quest_jurek' && isAnyPlush) ||
            (item.questId === 'quest_bath' && isAnyBath) ||
            (item.questId === 'quest_baby' && isAnyBaby) ||
            (item.questId === 'quest_baby_name' && isAnyBabyName) ||
            (item.questId === 'quest_hospital_bag' && isAnyHospital) ||
            (item.questId === 'quest_baby_room' && isAnyBabyDecor) ||
            (item.questId === 'quest_baby_gift' && isAnyCraftSupply) ||
            (item.questId === 'quest_breathing' && isAnyBalloon) ||
            (item.questId === 'quest_rafal' && isAnyRafal) ||
            (item.questId === 'quest_coffee' && isAnyCoffee) ||
            (item.questId === 'quest_breakfast' && isAnyBreakfast) ||
            (item.questId === 'quest_lunch' && isAnyLunch) ||
            (item.questId === 'quest_dinner' && isAnyDinner) ||
            (item.questId === 'quest_zabka' && isAnyZabka) ||
            (item.questId === 'quest_movie_night' && isAnyMovieNight) ||
            isAnyArtifact;
          if (!questAllowsGroup) continue;
        }
      } else {
        // No specific type required — accept matching groups
        const isMatchingGroup =
          (item.questId === 'quest_toys' && isAnyToy) ||
          (item.questId === 'quest_lego' && isAnyLego) ||
          (item.questId === 'quest_jurek' && isAnyPlush) ||
          (item.questId === 'quest_bath' && isAnyBath) ||
          (item.questId === 'quest_baby' && isAnyBaby) ||
          (item.questId === 'quest_baby_name' && isAnyBabyName) ||
          (item.questId === 'quest_hospital_bag' && isAnyHospital) ||
          (item.questId === 'quest_baby_room' && isAnyBabyDecor) ||
          (item.questId === 'quest_baby_gift' && isAnyCraftSupply) ||
          (item.questId === 'quest_breathing' && isAnyBalloon) ||
          (item.questId === 'quest_rafal' && isAnyRafal) ||
          (item.questId === 'quest_coffee' && isAnyCoffee) ||
          (item.questId === 'quest_breakfast' && isAnyBreakfast) ||
          (item.questId === 'quest_lunch' && isAnyLunch) ||
          (item.questId === 'quest_dinner' && isAnyDinner) ||
          (item.questId === 'quest_zabka' && isAnyZabka) ||
          (item.questId === 'quest_movie_night' && isAnyMovieNight) ||
          isAnyArtifact;
        if (!isMatchingGroup) continue;
      }

      item.collected = true;
      step.currentCount = (step.currentCount || 0) + 1;
      state.inventory[item.type] = (state.inventory[item.type] || 0) + 1;
      state.score += 10;
      state.totalItemsCollected++;

      // Combo system
      state.comboCount++;
      state.comboTimer = COMBO.timeout;
      if (state.comboCount >= 3) {
        state.score += state.comboCount * COMBO.bonusMultiplier;
        spawnFloatingText(state, item.x, item.y - 20, `COMBO ×${state.comboCount}!`, COLORS.comboGold, 24);
      }
      if (state.comboCount >= 5) {
        checkAchievement(state, 'achievement_combo_5');
      }

      // Game juice: micro-freeze + shake on collect
      state.freezeTimer = 0.025; // 25ms hitstop — subtle but impactful
      triggerScreenShake(state, 2, 0.1);

      // Sparkle particles on item collect
      for (let si = 0; si < 6; si++) {
        state.particles.push({
          x: item.x + item.w / 2,
          y: item.y + item.h / 2,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4 - 2,
          life: 0.6 + Math.random() * 0.3,
          maxLife: 0.9,
          color: '#FFD700',
          size: 4 + Math.random() * 3,
          type: 'sparkle',
        });
      }
      // Happy emotion
      setPlayerEmotion(state, 'happy', 1.5);

      // Collect particles
      spawnCollectParticles(state, item.x + item.w / 2, item.y + item.h / 2, item.type);

      // Floating text
      const emoji = ITEM_EMOJIS[item.type] || '📦';
      spawnFloatingText(state, item.x, item.y, `${emoji} +10`, '#FFD700', 18);

      // Count message
      const remaining = step.targetCount! - step.currentCount!;
      if (remaining <= 0) {
        showMessage(state, `${emoji} Wszystko zebrane! ✅`, 1.5);
      } else if (remaining === 1) {
        showMessage(state, `${emoji} Jeszcze tylko 1! 🔥`, 1.5);
      } else if (remaining === 2) {
        showMessage(state, `${emoji} Jeszcze ${remaining}! Prawie! 💪`, 1.5);
      } else {
        showMessage(state, `${emoji} ${step.currentCount}/${step.targetCount}`, 1.5);
      }

      // Check achievement
      if (state.totalItemsCollected >= 20) {
        checkAchievement(state, 'achievement_collector');
      }

      // Check if step complete
      if (step.currentCount! >= step.targetCount!) {
        step.completed = true;
        quest.currentStep++;
        const nextStep = quest.steps[quest.currentStep];
        if (nextStep) {
          showMessage(state, `✅ Brawo! ${nextStep.description}`, 2.5);
          triggerScreenShake(state, 3, 0.2);
        }
      }
    }
  }
}

// ---- Update items (floating + fade-in for active quest) ----
function updateItems(state: GameState, dt: number): void {
  const activeQuest = state.quests.find(q => q.active && !q.completed);
  const activeQuestId = activeQuest?.id;
  const activeStep = activeQuest?.steps[activeQuest.currentStep];
  const isCollectPhase = activeStep?.type === 'collect';

  for (const item of state.items) {
    if (!item.collected) {
      item.floatPhase += ITEM_FLOAT_SPEED;
      // Fade-in items that belong to active quest's collect step
      if (item.questId === activeQuestId && isCollectPhase) {
        item.fadeIn = Math.min(1, (item.fadeIn ?? 0) + dt * 2.5); // 0.4s fade
      } else {
        item.fadeIn = Math.max(0, (item.fadeIn ?? 0) - dt * 3); // fast fade-out
      }
    }
  }
}

// ---- Update quest pointer ----
function updateQuestPointer(state: GameState): void {
  const quest = state.quests.find(q => q.active && !q.completed);
  if (!quest) { state.questPointer = null; return; }

  const step = quest.steps[quest.currentStep];
  if (!step) { state.questPointer = null; return; }

  if (step.type === 'talk' || step.type === 'deliver' || step.type === 'chase' || step.type === 'find') {
    const targetNpcId = step.targetNpcId || quest.npcId;
    const npc = state.npcs.find(n => n.id === targetNpcId && n.visible);
    if (npc) {
      state.questPointer = { x: npc.x + npc.w / 2, y: npc.y - 30, label: step.icon };
    } else {
      state.questPointer = null;
    }
  } else if (step.type === 'collect') {
    // Special handling for courier quest: point to package or garden
    if (quest.id === 'quest_courier') {
      if (state.courierPackage && !state.courierPackage.collected) {
        state.questPointer = { x: state.courierPackage.x + 12, y: state.courierPackage.y - 20, label: '📦' };
      } else {
        // Point to garden (player needs to go there to trigger doorbell)
        state.questPointer = { x: GARDEN.startX + 100, y: HOUSE.groundLevel - 50, label: '🌳' };
      }
    } else {
      const uncollected = state.items.find(i => !i.collected && i.questId === quest.id);
      if (uncollected) {
        state.questPointer = { x: uncollected.x + uncollected.w / 2, y: uncollected.y - 20, label: step.icon };
      }
    }
  } else {
    state.questPointer = null;
  }
}

// ---- Camera (with zoom) ----
function updateCamera(state: GameState): void {
  const { player, camera, rooms } = state;

  // --- Determine target zoom based on player location ---
  // Inside a room → zoom in for detail; outside → zoom out for overview
  const px = player.x + player.w / 2;
  const py = player.y + player.h / 2;
  let inRoom: string | null = null;
  for (const room of rooms) {
    if (px >= room.x && px <= room.x + room.w && py >= room.y && py <= room.y + room.h) {
      inRoom = room.name;
      break;
    }
  }
  camera.currentRoom = inRoom;

  // Zoom targets: inside room = 1.25, outside = 1.0, construction site = 0.85
  if (inRoom) {
    camera.targetZoom = 1.25;
  } else if (px > 1500) {
    // Construction site — wide view
    camera.targetZoom = 0.85;
  } else {
    camera.targetZoom = 1.0;
  }

  // Smooth zoom interpolation
  camera.zoom += (camera.targetZoom - camera.zoom) * 0.04;
  if (Math.abs(camera.zoom - camera.targetZoom) < 0.002) camera.zoom = camera.targetZoom;

  // --- Camera position (zoom-aware) ---
  const viewW = CANVAS_W / camera.zoom;
  const viewH = CANVAS_H / camera.zoom;

  // Camera look-ahead: offset in movement direction for better visibility
  const lookAheadX = player.vx * 18;  // look ~18 frames ahead
  const lookAheadY = player.vy > 2 ? player.vy * 6 : 0; // look down when falling
  camera.targetX = player.x + player.w / 2 - viewW / 2 + lookAheadX;
  camera.targetY = player.y + player.h / 2 - viewH / 2 + lookAheadY;

  // Clamp to world bounds (map extends left to plac zabaw, right to osiedle)
  const minX = -7400;
  if (camera.targetX < minX) camera.targetX = minX;
  if (camera.targetX > state.worldWidth - viewW) camera.targetX = state.worldWidth - viewW;
  if (camera.targetY < 0) camera.targetY = 0;
  if (camera.targetY > state.worldHeight - viewH) camera.targetY = state.worldHeight - viewH;

  // Smooth follow
  camera.x += (camera.targetX - camera.x) * 0.08;
  camera.y += (camera.targetY - camera.y) * 0.06;

  // Clamp final values
  if (camera.x < minX) camera.x = minX;
  if (camera.x > state.worldWidth - viewW) camera.x = Math.max(minX, state.worldWidth - viewW);
  if (camera.y < 0) camera.y = 0;
  if (camera.y > state.worldHeight - viewH) camera.y = Math.max(0, state.worldHeight - viewH);
}

// ---- Particles ----
function updateParticles(state: GameState, dt: number): void {
  for (let i = state.particles.length - 1; i >= 0; i--) {
    const p = state.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.type !== 'trail') p.vy += 0.1;
    if (p.rotation !== undefined && p.rotationSpeed) p.rotation += p.rotationSpeed;
    p.life -= dt;
    if (p.life <= 0) state.particles.splice(i, 1);
  }
}

// Weather particles (separate pool for performance)
function updateWeatherParticles(state: GameState, dt: number): void {
  // Spawn weather
  if (state.weather === 'rainy') {
    for (let i = 0; i < 3; i++) {
      state.weatherParticles.push({
        x: state.camera.x + Math.random() * CANVAS_W,
        y: -10,
        vx: -1, vy: 8 + Math.random() * 4,
        life: 2, maxLife: 2, color: COLORS.rainColor,
        size: 2, type: 'rain',
      });
    }
  }
  if (state.weather === 'snowy') {
    if (Math.random() < 0.3) {
      state.weatherParticles.push({
        x: state.camera.x + Math.random() * CANVAS_W,
        y: -10,
        vx: (Math.random() - 0.5) * 2, vy: 1 + Math.random() * 2,
        life: 5, maxLife: 5, color: COLORS.snowColor,
        size: 3 + Math.random() * 3, type: 'snow',
      });
    }
  }
  if (state.weather === 'leaves') {
    if (Math.random() < 0.1) {
      state.weatherParticles.push({
        x: state.camera.x + Math.random() * CANVAS_W,
        y: -10,
        vx: (Math.random() - 0.5) * 3, vy: 1 + Math.random(),
        life: 6, maxLife: 6, color: ['#FF8A65', '#FFB74D', '#A5D6A7', '#EF5350'][Math.floor(Math.random() * 4)],
        size: 5, type: 'leaf', rotation: 0, rotationSpeed: 0.05 + Math.random() * 0.1,
      });
    }
  }

  for (let i = state.weatherParticles.length - 1; i >= 0; i--) {
    const p = state.weatherParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.type === 'leaf' && p.rotation !== undefined && p.rotationSpeed) {
      p.rotation += p.rotationSpeed;
      p.vx += Math.sin(state.time * 2 + i) * 0.05; // sway
    }
    p.life -= dt;
    if (p.life <= 0 || p.y > CANVAS_H + 10) state.weatherParticles.splice(i, 1);
  }

  // Cap weather particles
  if (state.weatherParticles.length > 200) {
    state.weatherParticles.splice(0, state.weatherParticles.length - 200);
  }
}

// Floating texts
function updateFloatingTexts(state: GameState, dt: number): void {
  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const ft = state.floatingTexts[i];
    ft.y += ft.vy;
    ft.vy -= 0.02; // slow down going up
    ft.life -= dt;
    if (ft.life <= 0) state.floatingTexts.splice(i, 1);
  }
}

// Screen shake
function updateScreenShake(state: GameState, dt: number): void {
  if (state.screenShake.timer > 0) {
    state.screenShake.timer -= dt;
    const i = state.screenShake.intensity * (state.screenShake.timer / 0.5);
    state.screenShake.x = (Math.random() - 0.5) * i;
    state.screenShake.y = (Math.random() - 0.5) * i;
  } else {
    state.screenShake.x = 0;
    state.screenShake.y = 0;
  }
}

// Achievement display timer
function updateAchievementDisplay(state: GameState, dt: number): void {
  if (state.achievementTimer > 0) {
    state.achievementTimer -= dt;
    if (state.achievementTimer <= 0) {
      state.showAchievement = null;
    }
  }
}

// Trail effect for running
function updateTrailEffect(state: GameState, dt: number): void {
  if (state.player.walking && state.comboCount >= COMBO.rainbowTrailSpeed) {
    state.player.trailTimer += dt;
    if (state.player.trailTimer > 0.05) {
      state.player.trailTimer = 0;
      const colors = COLORS.trailRainbow;
      state.particles.push({
        x: state.player.x + state.player.w / 2,
        y: state.player.y + state.player.h - 5,
        vx: -state.player.dir * 0.5,
        vy: 0,
        life: 0.4, maxLife: 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6, type: 'trail',
      });
    }
  }
}

// Airplanes in the sky
function updateAirplanes(state: GameState, dt: number): void {
  // Countdown timer — spawn new airplane when it hits 0
  state.airplaneTimer -= dt;
  if (state.airplaneTimer <= 0 && state.airplanes.length < 3) {
    const types: Array<'small' | 'jet' | 'biplane'> = ['small', 'jet', 'biplane'];
    const type = types[Math.floor(Math.random() * types.length)];
    const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
    const altitude = 30 + Math.random() * 70; // 30-100px from top

    // Speed depends on type: jet fastest, biplane slowest
    let speed: number;
    let trailLength: number;
    switch (type) {
      case 'jet':
        speed = 80 + Math.random() * 20; // 80-100
        trailLength = 80 + Math.random() * 40;
        break;
      case 'small':
        speed = 55 + Math.random() * 15; // 55-70
        trailLength = 40 + Math.random() * 20;
        break;
      case 'biplane':
        speed = 40 + Math.random() * 15; // 40-55
        trailLength = 20 + Math.random() * 15;
        break;
    }

    const x = dir === 1 ? -100 : state.worldWidth + 100;

    state.airplanes.push({ x, y: altitude, speed, dir, type, altitude, trailLength });

    // Reset timer: random 8-20 seconds until next spawn
    state.airplaneTimer = 8 + Math.random() * 12;
  } else if (state.airplaneTimer <= 0) {
    // Max airplanes reached, just reset timer
    state.airplaneTimer = 5 + Math.random() * 8;
  }

  // Move airplanes
  for (let i = state.airplanes.length - 1; i >= 0; i--) {
    const plane = state.airplanes[i];
    plane.x += plane.dir * plane.speed * dt;

    // Remove when off-screen
    if (plane.x > state.worldWidth + 200 || plane.x < -200) {
      state.airplanes.splice(i, 1);
    }
  }
}

// ---- Courier quest: doorbell + package pickup ----
function updateCourierQuest(state: GameState, _dt: number): void {
  const quest = state.quests.find(q => q.id === 'quest_courier' && q.active && !q.completed);
  if (!quest) return;

  const step = quest.steps[quest.currentStep];
  if (!step || step.type !== 'collect') return;

  const { player } = state;

  // Player entered garden → trigger doorbell and spawn package
  if (player.x > GARDEN.startX && !state.courierPackage && !state.doorbellActive) {
    state.doorbellActive = true;
    sfxDoorbell();
    showMessage(state, '🔔 Dzwonek do drzwi! Kurier przyjechał!', 3);

    // Spawn package near the front door
    state.courierPackage = {
      x: HOUSE.doorX - 10,
      y: HOUSE.groundLevel - 24,
      collected: false,
    };
  }

  // Check if player picks up the package
  if (state.courierPackage && !state.courierPackage.collected) {
    const pkg = state.courierPackage;
    const px = player.x + player.w / 2;
    const py = player.y + player.h / 2;
    const dist = Math.sqrt((px - pkg.x - 12) ** 2 + (py - pkg.y - 12) ** 2);

    if (dist < 40) {
      // Pick up the package!
      state.courierPackage.collected = true;
      state.doorbellActive = false;
      sfxPackagePickup();
      spawnParticles(state, pkg.x + 12, pkg.y, 8, '#8B6914');
      spawnFloatingText(state, pkg.x, pkg.y - 10, '📦 Paczka!', '#8B6914', 20);
      showMessage(state, '📦 Masz paczkę! Zanieś ją Mamie!', 2.5);

      // Advance quest step
      step.currentCount = 1;
      step.completed = true;
      quest.currentStep++;
    }
  }
}

// ---- RC Car System ----
function updateRCCar(state: GameState, _dt: number): void {
  const rc = state.rcCar;
  if (!rc || !rc.active) return;

  if (rc.controlMode) {
    // Player controlling RC car directly
    const left = state.keys.has('ArrowLeft') || state.keys.has('a');
    const right = state.keys.has('ArrowRight') || state.keys.has('d');

    if (left) { rc.vx = -5; rc.dir = -1; }
    else if (right) { rc.vx = 5; rc.dir = 1; }
    else { rc.vx *= 0.9; if (Math.abs(rc.vx) < 0.1) rc.vx = 0; }

    rc.x += rc.vx;
    // Keep in world bounds
    if (rc.x < 0) rc.x = 0;
    if (rc.x > state.worldWidth - 30) rc.x = state.worldWidth - 30;
  } else {
    // RC car follows player automatically (drives alongside)
    const px = state.player.x;
    const targetOffset = state.player.dir === 1 ? -60 : 60; // drive next to player
    const targetX = px + targetOffset;
    const diff = targetX - rc.x;

    if (Math.abs(diff) > 5) {
      rc.vx = diff * 0.08;
      rc.dir = diff > 0 ? 1 : -1;
    } else {
      rc.vx *= 0.9;
    }
    rc.x += rc.vx;
    // Keep on ground
    if (rc.x < 0) rc.x = 0;
    if (rc.x > state.worldWidth - 30) rc.x = state.worldWidth - 30;
  }
}

// Spawn RC car for player
export function spawnRCCar(state: GameState): void {
  if (state.rcCar) return; // already have one
  const types: Array<'monster' | 'racing' | 'buggy'> = ['monster', 'racing', 'buggy'];
  const type = types[Math.floor(Math.random() * types.length)];
  const colors = ['#E53935', '#2196F3', '#4CAF50', '#FF9800', '#9C27B0'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  state.rcCar = {
    x: state.player.x + 30,
    y: 0, // always on ground (calculated in render)
    vx: 0,
    dir: state.player.dir,
    active: true,
    controlMode: false,
    color,
    type,
  };
  showMessage(state, '🎮 Samochód RC aktywowany! Naciśnij R aby sterować!', 3);
  spawnParticles(state, state.player.x + state.player.w / 2, state.player.y, 8, color);
}

// Toggle RC car control mode
export function toggleRCControl(state: GameState): void {
  if (!state.rcCar || !state.rcCar.active) return;
  state.rcCar.controlMode = !state.rcCar.controlMode;
  if (state.rcCar.controlMode) {
    showMessage(state, '🎮 Sterujesz samochodem RC! R = wróć', 2);
  } else {
    showMessage(state, '🏃 Sterowanie Kubą. R = steruj RC', 2);
  }
}

// ---- Vehicle mount/dismount ----
export function toggleVehicle(state: GameState): void {
  if (state.phase !== 'playing') return;

  // If already on a vehicle — dismount
  if (state.activeVehicle) {
    dismountVehicle(state);
    return;
  }

  // Find nearest parked vehicle within range
  const px = state.player.x + state.player.w / 2;
  const py = state.player.y + state.player.h;
  let nearest: Vehicle | null = null;
  let nearestDist = 160;
  for (const v of state.vehicles) {
    if (v.active) continue;
    const dx = Math.abs(v.x - px);
    const dy = Math.abs(v.y - py);
    const dist = dx + dy;
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = v;
    }
  }
  if (nearest) {
    mountVehicle(state, nearest);
  }
}

function mountVehicle(state: GameState, vehicle: Vehicle): void {
  vehicle.active = true;
  state.activeVehicle = vehicle;
  vehicle.dir = state.player.dir;
  vehicle.vx = 0;
  vehicle.trickState = 'none';
  vehicle.trickTimer = 0;
  vehicle.trickScore = 0;
  vehicle.comboCount = 0;
  vehicle.comboTimer = 0;
  vehicle.wheelieAngle = 0;
  vehicle.airRotation = 0;
  const def = VEHICLE_DEFS[vehicle.type];
  showMessage(state, `🚲 ${def.label}! B = zsiądź`, 2);
  spawnParticles(state, state.player.x + state.player.w / 2, state.player.y + state.player.h, 6, '#FFD700');
}

function dismountVehicle(state: GameState): void {
  if (!state.activeVehicle) return;
  const v = state.activeVehicle;
  v.active = false;
  v.x = state.player.x;
  v.y = state.player.y + state.player.h - 10;
  v.vx = 0;
  v.trickState = 'none';
  v.wheelieAngle = 0;
  v.airRotation = 0;
  state.activeVehicle = null;
  showMessage(state, '🚶 Kuba zszedł z pojazdu', 1.5);
}

// Update vehicle trick timers & scoring
function updateVehicleTricks(state: GameState, dt: number): void {
  const v = state.activeVehicle;
  if (!v) return;

  // Trick timer
  if (v.trickState !== 'none') {
    v.trickTimer += dt;
    // Continuous tricks (wheelie, manual) score per second
    if (v.trickState === 'wheelie' || v.trickState === 'manual') {
      v.trickScore += (TRICK_SCORES[v.trickState] || 5) * dt;
      if (v.trickState === 'wheelie') {
        v.wheelieAngle = Math.min(45, v.wheelieAngle + 60 * dt);
      }
    }
  }

  // Balance meter for wheelie/manual
  if (v.active && (v.trickState === 'wheelie' || v.trickState === 'manual')) {
    const balanced = updateBalanceMeter(v, dt, state.keys);
    if (!balanced) {
      spawnFloatingText(state, state.player.x + state.player.w / 2, state.player.y - 20,
        '💥 Stracono równowagę!', '#F44336', 16);
      v.speedBoost = 0;
    }
  }

  // Speed boost decay
  if (v.speedBoost > 0) {
    v.speedBoost = Math.max(0, v.speedBoost - 0.3 * dt);
  }

  // Combo timer
  if (v.comboTimer > 0) {
    v.comboTimer -= dt;
    if (v.comboTimer <= 0) {
      // Combo ended — give score + chain bonus
      if (v.comboCount > 1) {
        const chainBonus = v.trickChain.length > 2 ? 1.5 : 1.0;
        const totalScore = Math.floor(v.trickScore * v.comboCount * chainBonus);
        state.score += totalScore;
        v.totalTrickScore += totalScore;
        const chainLabel = v.trickChain.length > 2 ? ' CHAIN!' : '';
        spawnFloatingText(state, state.player.x + state.player.w / 2, state.player.y - 30,
          `${v.comboCount}x COMBO${chainLabel} +${totalScore}`, '#FFD700', 24);
        checkTrickUnlocks(v);
      }
      v.comboCount = 0;
      v.trickScore = 0;
      v.trickChain = [];
    }
  }

  // Auto-dismount when entering buildings
  if (v.active) {
    const px = state.player.x + state.player.w / 2;
    for (const room of state.rooms) {
      if (px >= room.x && px <= room.x + room.w &&
          state.player.y + state.player.h > room.y &&
          state.player.y < room.y + room.h) {
        dismountVehicle(state);
        break;
      }
    }
  }
}

// ---- Street traffic (cars driving on street, left of house) ----
function updateStreetTraffic(state: GameState, dt: number): void {
  // Spawn cars
  state.streetCarTimer -= dt;
  if (state.streetCarTimer <= 0 && state.streetCars.length < 4) {
    const types: Array<'sedan' | 'suv' | 'van' | 'bus' | 'police'> = ['sedan', 'suv', 'van', 'sedan', 'suv', 'police'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = ['#E53935', '#1565C0', '#4CAF50', '#FF9800', '#9E9E9E', '#333333', '#FFFFFF', '#F5F5DC'];
    const color = type === 'police' ? '#FFFFFF' : colors[Math.floor(Math.random() * colors.length)];
    const dir: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
    const speed = 40 + Math.random() * 30;
    const x = dir === 1 ? -700 : 200;

    state.streetCars.push({
      x, y: 540, speed, dir, color, type,
      stopped: false, stopTimer: 0,
    });
    state.streetCarTimer = 4 + Math.random() * 8;
  } else if (state.streetCarTimer <= 0) {
    state.streetCarTimer = 3 + Math.random() * 5;
  }

  // Move cars
  for (let i = state.streetCars.length - 1; i >= 0; i--) {
    const car = state.streetCars[i];
    if (car.stopped) {
      car.stopTimer -= dt;
      if (car.stopTimer <= 0) car.stopped = false;
    } else {
      car.x += car.dir * car.speed * dt;
      // Random stop near house (simulates parking / waiting)
      if (!car.stopped && Math.random() < 0.001 && car.x > -500 && car.x < -100) {
        car.stopped = true;
        car.stopTimer = 2 + Math.random() * 4;
      }
    }
    // Remove when off-screen
    if (car.x > 300 || car.x < -800) {
      state.streetCars.splice(i, 1);
    }
  }
}

// Combo timer
function updateCombo(state: GameState, dt: number): void {
  if (state.comboTimer > 0) {
    state.comboTimer -= dt;
    if (state.comboTimer <= 0) {
      state.comboCount = 0;
    }
  }
}

// ---- Spawn effects ----
export function spawnCollectParticles(state: GameState, x: number, y: number, type: ItemType): void {
  const colorMap: Record<string, string> = {
    apple: '#E53935', toy_car: '#2196F3', toy_ball: '#FF9800', toy_bear: '#A1887F',
    toy_block: '#9C27B0', banana: '#FFD600', star: '#FFD700',
    lego_red: '#E53935', lego_blue: '#1565C0', lego_yellow: '#FDD835', lego_green: '#43A047',
    plush_dog: '#C8AD8A', plush_panda: '#333', plush_rabbit: '#F8BBD0',
    cookie: '#D4A574', letter: '#F5F5DC', flower: '#E91E63',
    key: '#FFD700', crayon: '#FF5722', book: '#5C6BC0',
    watering_can: '#42A5F5', ingredient: '#FF8A65',
  };
  const color = colorMap[type] || '#FFD700';

  // Ring burst (original 10 particles)
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 * i) / 10;
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * (2 + Math.random() * 3),
      vy: Math.sin(angle) * (2 + Math.random() * 3) - 2,
      life: 0.6 + Math.random() * 0.4,
      maxLife: 1,
      color,
      size: 4 + Math.random() * 4,
      type: 'sparkle',
    });
  }

  // Extra upward sparkles (no star emojis — just colored dots)
  for (let i = 0; i < 4; i++) {
    state.particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y - 5,
      vx: (Math.random() - 0.5) * 3,
      vy: -(Math.random() * 4 + 2),
      life: 0.6 + Math.random() * 0.3,
      maxLife: 0.9,
      color,
      size: 5 + Math.random() * 4,
      type: 'sparkle',
    });
  }

  // Expanding ring particles
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * 5,
      vy: Math.sin(angle) * 5,
      life: 0.3,
      maxLife: 0.3,
      color: '#FFF',
      size: 2,
      type: 'trail',
    });
  }
}

export function spawnCelebrationParticles(state: GameState, x: number, y: number): void {
  const emojis = ['🎉', '✨', '🎊', '🏆', '👏', '💪'];
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#DDA0DD'];

  for (let i = 0; i < 40; i++) {
    state.particles.push({
      x: x + (Math.random() - 0.5) * 150,
      y: y + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 10,
      vy: -Math.random() * 10 - 3,
      life: 2 + Math.random(),
      maxLife: 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 10,
      emoji: Math.random() > 0.4 ? emojis[Math.floor(Math.random() * emojis.length)] : undefined,
      type: 'confetti',
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
    });
  }
}

function spawnJumpParticles(state: GameState, x: number, y: number): void {
  for (let i = 0; i < 5; i++) {
    state.particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y,
      vx: (Math.random() - 0.5) * 3,
      vy: -Math.random() * 2,
      life: 0.4, maxLife: 0.4,
      color: '#E0D8D0', size: 3 + Math.random() * 3,
    });
  }
}

function spawnDoubleJumpParticles(state: GameState, x: number, y: number): void {
  // Ring burst around player for double jump
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'];
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    state.particles.push({
      x, y,
      vx: Math.cos(angle) * 4,
      vy: Math.sin(angle) * 4,
      life: 0.5, maxLife: 0.5,
      color: colors[i % colors.length],
      size: 4 + Math.random() * 3,
      type: 'sparkle',
    });
  }
  // Wind puff below
  for (let i = 0; i < 6; i++) {
    state.particles.push({
      x: x + (Math.random() - 0.5) * 30,
      y: y + 10,
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * 3 + 1,
      life: 0.4, maxLife: 0.4,
      color: '#B0E0E6', size: 5 + Math.random() * 4,
      emoji: '💨',
    });
  }
}

function spawnFleeParticles(state: GameState, x: number, y: number): void {
  for (let i = 0; i < 12; i++) {
    state.particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 6,
      vy: -Math.random() * 5 - 2,
      life: 0.8, maxLife: 0.8,
      color: '#FF8F00', size: 4 + Math.random() * 4,
      emoji: i % 3 === 0 ? '💨' : undefined,
    });
  }
}

export function spawnFloatingText(state: GameState, x: number, y: number, text: string, color: string, size: number): void {
  state.floatingTexts.push({
    x, y, text, color,
    vy: -1.5, life: 1.5, maxLife: 1.5, size,
  });
}

function triggerScreenShake(state: GameState, intensity: number, duration: number): void {
  state.screenShake.intensity = intensity;
  state.screenShake.timer = duration;
}

// ---- Costume system ----
export function unlockCostume(state: GameState, costumeId: string): void {
  const costume = state.costumes.find(c => c.id === costumeId);
  if (costume && !costume.unlocked) {
    costume.unlocked = true;
    spawnFloatingText(state, state.player.x, state.player.y - 40, `🎁 ${costume.emoji} ${costume.name}!`, '#FFD700', 20);
    showMessage(state, `🎁 Nowy kostium: ${costume.emoji} ${costume.name}!`, 3);
  }
}

export function equipCostume(state: GameState, costumeId: string | null, slot: CostumeSlot): void {
  state.player.equippedCostumes[slot] = costumeId;
}

// ---- Achievement system ----
function checkAchievement(state: GameState, achievementId: string): void {
  const achievement = state.achievements.find(a => a.id === achievementId);
  if (achievement && !achievement.unlocked) {
    // Check conditions
    let shouldUnlock = false;

    switch (achievementId) {
      case 'achievement_first_quest':
        shouldUnlock = state.questsCompleted >= 1;
        break;
      case 'achievement_all_quests':
        shouldUnlock = state.questsCompleted >= state.quests.length;
        break;
      case 'achievement_math_master':
        shouldUnlock = state.questsCompleted >= 5; // solved 5+ math problems
        break;
      case 'achievement_combo_5':
        shouldUnlock = state.comboCount >= 5;
        break;
      case 'achievement_collector':
        shouldUnlock = state.totalItemsCollected >= 20;
        break;
      case 'achievement_helper':
        shouldUnlock = state.questsCompleted >= 2;
        break;
      case 'achievement_cat_chaser':
        shouldUnlock = true;
        break;
      case 'achievement_explorer':
        shouldUnlock = true; // simplified - can add room tracking later
        break;
      default:
        shouldUnlock = false;
    }

    if (shouldUnlock) {
      unlockAchievement(state, achievement);
    }
  }
}

function unlockAchievement(state: GameState, achievement: Achievement): void {
  achievement.unlocked = true;
  state.showAchievement = achievement;
  state.achievementTimer = 4;
  state.score += 50;

  // Unlock costume reward if any
  if (achievement.costumeReward) {
    unlockCostume(state, achievement.costumeReward);
  }
}

// ---- Weather control ----
export function setWeather(state: GameState, weather: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'leaves'): void {
  state.weather = weather;
  state.weatherParticles = [];
}

// ---- Season control ----
export function setSeason(state: GameState, season: 'wiosna' | 'lato' | 'jesien' | 'zima'): void {
  state.season = season;
  // Auto-set default weather for season
  const seasonWeather: Record<string, 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'leaves'> = {
    wiosna: 'rainy',
    lato: 'sunny',
    jesien: 'leaves',
    zima: 'snowy',
  };
  setWeather(state, seasonWeather[season]);
  // Show/hide season-specific items
  for (const item of state.items) {
    if (item.id.startsWith('season_')) {
      const itemSeason = item.id.split('_')[1]; // season_wiosna_xxx
      item.collected = itemSeason !== season; // hide items from other seasons
    }
  }
  // Show/hide season quests
  for (const quest of state.quests) {
    if (quest.season && quest.season !== season && !quest.completed) {
      quest.active = false;
    }
  }
}

// ---- Messages ----
function showMessage(state: GameState, text: string, duration: number): void {
  state.message = { text, timer: duration, icon: '' };
}

function updateMessage(state: GameState, dt: number): void {
  if (state.message) {
    state.message.timer -= dt;
    if (state.message.timer <= 0) state.message = null;
  }
}

// ---- Auto-save to localStorage ----
function autoSave(state: GameState): void {
  try {
    const saveData = {
      questsCompleted: state.questsCompleted,
      stars: state.stars,
      score: state.score,
      totalItemsCollected: state.totalItemsCollected,
      completedQuestIds: state.quests.filter(q => q.completed).map(q => q.id),
      achievements: state.achievements.filter(a => a.unlocked).map(a => a.id),
      costumes: state.costumes.filter(c => c.unlocked).map(c => c.id),
      equippedCostumes: state.player.equippedCostumes,
      timestamp: Date.now(),
    };
    localStorage.setItem('migdalowa_save', JSON.stringify(saveData));
  } catch { /* localStorage not available */ }
}

export function loadSave(): { questsCompleted: number; stars: number; score: number; completedQuestIds: string[]; achievements: string[]; costumes: string[]; equippedCostumes: Record<string, string | null> } | null {
  try {
    const raw = localStorage.getItem('migdalowa_save');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export function clearSave(): void {
  try { localStorage.removeItem('migdalowa_save'); } catch { /* ok */ }
}

// ---- Bike Race System ----
export function startBikeRace(state: GameState, raceId: string): boolean {
  const raceDef = BIKE_RACES.find(r => r.id === raceId);
  if (!raceDef) return false;
  if (!state.activeVehicle) return false;
  if (!raceDef.requiredVehicle.includes(state.activeVehicle.type)) {
    showMessage(state, `Potrzebujesz: ${raceDef.requiredVehicle.join(' / ')}`, 3);
    return false;
  }
  if (state.bikeRace) return false;

  // Position player at start
  state.player.x = raceDef.startX;

  state.bikeRace = {
    type: raceDef.type as RaceType,
    name: raceDef.name,
    startX: raceDef.startX,
    endX: raceDef.endX,
    opponentId: raceDef.opponentId,
    opponentX: raceDef.startX,
    opponentSpeed: raceDef.opponentSpeed,
    opponentDir: raceDef.endX > raceDef.startX ? 1 : -1,
    timer: 0,
    timeLimit: raceDef.timeLimit,
    countdown: 3,
    finished: false,
    won: false,
    bestTime: Infinity,
    trickTarget: raceDef.trickTarget,
    tricksCurrent: 0,
    arcadeOverlay: true,
    checkpoints: [...raceDef.checkpoints],
    checkpointsPassed: 0,
  };

  showMessage(state, `🏁 ${raceDef.name} — PRZYGOTUJ SIĘ!`, 2);
  return true;
}

function updateBikeRace(state: GameState, dt: number): void {
  const race = state.bikeRace;
  if (!race) return;

  // Countdown phase
  if (race.countdown > 0) {
    race.countdown -= dt;
    if (race.countdown <= 0) {
      race.countdown = 0;
      showMessage(state, '🏁 START!', 1);
    }
    return;
  }

  if (race.finished) return;

  // Update race timer
  race.timer += dt;

  // Move opponent (for sprint races)
  if (race.opponentId && race.opponentSpeed > 0) {
    const dir = race.endX > race.startX ? 1 : -1;
    race.opponentX += race.opponentSpeed * dir * dt * 60;
    race.opponentDir = dir;

    // Check if opponent finished
    if ((dir > 0 && race.opponentX >= race.endX) || (dir < 0 && race.opponentX <= race.endX)) {
      race.finished = true;
      race.won = false;
      showMessage(state, '😞 Przegrałeś! Spróbuj ponownie!', 3);
      setTimeout(() => { state.bikeRace = null; }, 3000);
      return;
    }
  }

  // Track trick score for trick challenges
  if (race.type === 'trickChallenge' && state.activeVehicle) {
    race.tricksCurrent = state.activeVehicle.trickScore;
    if (race.tricksCurrent >= race.trickTarget) {
      race.finished = true;
      race.won = true;
      showMessage(state, `🏆 BRAWO! Zdobyłeś ${race.tricksCurrent} pkt!`, 3);
      spawnRaceReward(state);
      setTimeout(() => { state.bikeRace = null; }, 3000);
      return;
    }
  }

  // Time limit check
  if (race.timeLimit > 0 && race.timer >= race.timeLimit) {
    race.finished = true;
    race.won = race.type === 'trickChallenge' ? race.tricksCurrent >= race.trickTarget : false;
    showMessage(state, race.won ? '🏆 BRAWO! Zdążyłeś!' : '⏰ Czas minął!', 3);
    if (race.won) spawnRaceReward(state);
    setTimeout(() => { state.bikeRace = null; }, 3000);
    return;
  }

  // Check checkpoints
  const px = state.player.x + state.player.w / 2;
  const dir = race.endX > race.startX ? 1 : -1;
  if (race.checkpointsPassed < race.checkpoints.length) {
    const nextCP = race.checkpoints[race.checkpointsPassed];
    if ((dir > 0 && px >= nextCP) || (dir < 0 && px <= nextCP)) {
      race.checkpointsPassed++;
      addFloatingText(state, state.player.x, state.player.y - 40,
        `✅ CP ${race.checkpointsPassed}/${race.checkpoints.length}`, '#4CAF50');
    }
  }

  // Check if player crossed finish line
  if ((dir > 0 && px >= race.endX) || (dir < 0 && px <= race.endX)) {
    race.finished = true;
    race.won = true;
    const timeStr = race.timer.toFixed(1);
    showMessage(state, `🏆 WYGRAŁEŚ! Czas: ${timeStr}s`, 4);
    if (race.timer < race.bestTime) race.bestTime = race.timer;
    spawnRaceReward(state);
    setTimeout(() => { state.bikeRace = null; }, 4000);
  }
}

function spawnRaceReward(state: GameState): void {
  state.score += 100;
  state.stars += 1;
  addFloatingText(state, state.player.x, state.player.y - 60, '+100 ⭐ +1', '#FFD700');
  // Particles celebration
  for (let i = 0; i < 20; i++) {
    state.particles.push({
      x: state.player.x + state.player.w / 2,
      y: state.player.y,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 6 - 2,
      life: 1,
      maxLife: 1,
      color: ['#FFD700', '#FF5722', '#4CAF50', '#2196F3'][Math.floor(Math.random() * 4)],
      size: 3 + Math.random() * 4,
      type: 'confetti',
    });
  }
}

function addFloatingText(state: GameState, x: number, y: number, text: string, color: string): void {
  state.floatingTexts.push({
    x, y, text, color, life: 2, maxLife: 2, vy: -1.5, size: 16,
  });
}

// ---- Activate next quest ----
function activateNextQuest(state: GameState): void {
  const next = state.quests.find(q => !q.active && !q.completed);
  if (next) {
    next.active = true;
    const npc = state.npcs.find(n => n.id === next.npcId);
    if (npc) {
      npc.emote = '❗';
      // Make NPC visible if hidden (with entrance animation)
      if (!npc.visible) {
        npc.visible = true;
        npc.animTimer = 0;
      }
    }
    // Also show quest-specific NPCs (kot, jurek_npc, listonosz)
    showQuestNPCs(state, next.id);
    showMessage(state, `📋 Nowe zadanie: ${next.title}`, 3);

    // Change weather with quest progression for variety
    const weatherCycle: Array<'sunny' | 'leaves' | 'cloudy' | 'rainy' | 'snowy'> = [
      'sunny', 'leaves', 'cloudy', 'sunny', 'rainy', 'sunny', 'leaves', 'sunny', 'sunny',
      'cloudy', 'sunny', 'leaves', 'sunny', 'rainy', 'sunny', 'snowy', 'sunny', 'leaves', 'sunny',
    ];
    const idx = state.quests.indexOf(next);
    if (idx >= 0 && idx < weatherCycle.length) {
      setWeather(state, weatherCycle[idx]);
    }
  } else {
    const allDone = state.quests.every(q => q.completed);
    if (allDone) {
      state.phase = 'level_complete';
      spawnCelebrationParticles(state, CANVAS_W / 2, CANVAS_H / 2);
    }
  }
}

// ---- Quest selection: activate a specific quest by ID ----
export function selectQuest(state: GameState, questId: string): void {
  // Deactivate current non-completed active quest
  const current = state.quests.find(q => q.active && !q.completed);
  if (current) {
    current.active = false;
    // Reset current quest progress
    current.currentStep = 0;
    current.steps.forEach(s => {
      s.completed = false;
      if ('currentCount' in s) (s as { currentCount: number }).currentCount = 0;
    });
    // Uncollect items for this quest
    state.items.filter(i => i.questId === current.id && i.collected).forEach(i => { i.collected = false; });
  }

  // Activate selected quest
  const quest = state.quests.find(q => q.id === questId);
  if (quest && !quest.completed) {
    quest.active = true;
    quest.currentStep = 0;
    quest.steps.forEach(s => {
      s.completed = false;
      if ('currentCount' in s) (s as { currentCount: number }).currentCount = 0;
    });
    const npc = state.npcs.find(n => n.id === quest.npcId);
    if (npc) {
      npc.emote = '❗';
      if (!npc.visible) { npc.visible = true; npc.animTimer = 0; }
    }
    showQuestNPCs(state, quest.id);
    showMessage(state, `📋 Misja: ${quest.title}`, 3);
  }
  state.phase = 'playing';
}

// ---- Dialog advancement ----
export function advanceDialog(state: GameState): void {
  if (!state.dialog) return;
  state.dialog.currentLine++;
  if (state.dialog.currentLine >= state.dialog.lines.length) {
    const cb = state.dialog.onComplete;
    state.dialog = null;
    if (cb) cb();
    else state.phase = 'playing';
  }
}

// ---- Math answer ----
export function answerMath(state: GameState, answer: number): boolean {
  if (!state.mathChallenge) return false;

  if (answer === state.mathChallenge.answer) {
    state.mathChallenge = null;
    if (state.mathCallback) {
      state.mathCallback();
      state.mathCallback = null;
    }
    return true;
  }
  return false;
}

// ---- Helpers ----
function getNpcIcon(npcId: string): string {
  const icons: Record<string, string> = {
    mama: '👩', tata: '👨', kot: '🐱', listonosz: '📮', jurek_npc: '🐕',
    wujek: '🚗', budowlaniec: '🏗️', sasiadka: '🌻', franek: '🐾',
    zabka_clerk: '🐸', mirek: '🩺', policjant: '👮', rafal: '🎒',
  };
  return icons[npcId] || '💬';
}

// ============================
// NEW SYSTEMS (10 improvements)
// ============================

// ---- 1. Parallax cloud movement ----
function updateParallaxClouds(state: GameState, _dt: number): void {
  for (const cloud of state.parallaxClouds) {
    cloud.x += cloud.speed;
    // Wrap around when off-screen
    if (cloud.x > state.camera.x + CANVAS_W / state.camera.zoom + 200) {
      cloud.x = state.camera.x - 300 - cloud.w;
    }
    if (cloud.x + cloud.w < state.camera.x - 300) {
      cloud.x = state.camera.x + CANVAS_W / state.camera.zoom + 200;
    }
  }
}

// ---- 2. Day/night cycle (slow, ~5 min per full day) ----
function updateDayNightCycle(state: GameState, dt: number): void {
  state.dayTime = (state.dayTime + dt * 0.0016) % 1; // full cycle in ~625s (~10min)
}

// ---- 3. NPC idle animations ----
function updateNPCIdle(state: GameState, dt: number): void {
  for (const npc of state.npcs) {
    if (!npc.visible) continue;
    npc.idlePhase = (npc.idlePhase || 0) + dt * 1.5;
    npc.blinkTimer = (npc.blinkTimer || 3) - dt;
    if (npc.blinkTimer <= 0) {
      npc.blinkTimer = 3 + Math.random() * 5; // reset blink
    }
  }
}

// ---- 4. Dust/landing particles (triggered from physics) ----
function spawnLandingDust(state: GameState): void {
  const { player } = state;
  const impact = Math.abs(player.prevVy);
  if (impact < 4) return;
  const count = Math.min(8, Math.floor(impact * 0.8));
  for (let i = 0; i < count; i++) {
    state.particles.push({
      x: player.x + player.w / 2 + (Math.random() - 0.5) * player.w,
      y: player.y + player.h,
      vx: (Math.random() - 0.5) * impact * 0.5,
      vy: -Math.random() * 2,
      life: 0.5 + Math.random() * 0.3,
      maxLife: 0.8,
      color: '#C8AD8A',
      size: 3 + Math.random() * 3,
      type: 'sparkle',
    });
  }
}

// ---- 8. Franek companion AI ----
function updateCompanionFranek(state: GameState, dt: number): void {
  const comp = state.companionFranek;
  if (!comp) {
    // Activate Franek companion after 3 quests completed
    if (state.questsCompleted >= 3) {
      spawnCompanion(state);
    }
    return;
  }

  // Record player position for delayed following
  comp.posHistory.push({ x: state.player.x, y: state.player.y });
  if (comp.posHistory.length > 30) comp.posHistory.shift(); // ~0.5s delay at 60fps

  // Follow delayed position
  const target = comp.posHistory[0] || { x: state.player.x, y: state.player.y };
  const dx = target.x - comp.x;
  const distX = Math.abs(dx);

  // Move toward player if far enough
  if (distX > 80) {
    comp.vx += (dx > 0 ? 2.2 : -2.2) * dt * 60;
    comp.dir = dx > 0 ? 1 : -1;
  } else if (distX < 30) {
    comp.vx *= 0.9; // slow down when close
  }
  comp.vx *= 0.92; // friction
  comp.x += comp.vx * dt * 60 * 0.016;

  // Gravity
  comp.vy += GRAVITY * 0.5;
  comp.y += comp.vy;

  // Ground collision
  for (const plat of state.platforms) {
    if (comp.x + 24 > plat.x && comp.x < plat.x + plat.w &&
        comp.y + 42 > plat.y && comp.y + 42 < plat.y + plat.h + 10 && comp.vy >= 0) {
      comp.y = plat.y - 42;
      comp.vy = 0;
      comp.onGround = true;
    }
  }

  // Jump if player is higher
  if (comp.onGround && target.y < comp.y - 60) {
    comp.vy = JUMP_FORCE * 0.8;
    comp.onGround = false;
  }

  // Tail wag
  comp.tailWag += dt * (distX < 60 ? 8 : 4);

  // Emotion based on context
  const nearKot = state.npcs.find(n => n.id === 'kot' && n.visible && Math.abs(n.x - comp.x) < 100);
  if (nearKot) {
    comp.emotion = 'alert';
  } else if (Math.abs(comp.vx) > 1.5) {
    comp.emotion = 'excited';
  } else {
    comp.emotion = 'happy';
  }
}

// ---- 9. Screen transition ----
function updateScreenTransition(state: GameState, dt: number): void {
  const t = state.screenTransition;
  if (!t.active) return;
  t.progress += dt * 3;
  if (t.progress >= 1) {
    t.active = false;
    t.progress = 0;
  }
}

// ---- 10. Player emotion ----
function updatePlayerEmotion(state: GameState, dt: number): void {
  const { player } = state;
  if (player.emotionTimer > 0) {
    player.emotionTimer -= dt;
    if (player.emotionTimer <= 0) {
      player.emotion = 'neutral';
    }
  }

  // Auto-set emotions based on context
  if (player.emotionTimer <= 0) {
    // Running fast = excited
    if (Math.abs(player.vx) > 2.5 && player.walking) {
      player.emotion = 'excited';
    }
    // Near NPC with emote = surprised
    else if (state.npcs.some(n => n.visible && n.emote === '❗' &&
      Math.abs(n.x - player.x) < 80 && Math.abs(n.y - player.y) < 80)) {
      player.emotion = 'surprised';
    }
    // Default
    else {
      player.emotion = 'neutral';
    }
  }
}

// Trigger emotion from external events (called from collection, quest completion etc.)
function setPlayerEmotion(state: GameState, emotion: Player['emotion'], duration: number): void {
  state.player.emotion = emotion;
  state.player.emotionTimer = duration;
}

// ---- BMX TRICK UNLOCK SYSTEM ----
function checkTrickUnlocks(v: Vehicle): void {
  for (const [trickId, td] of Object.entries(TRICK_DEFS)) {
    if (!v.unlockedTricks.includes(trickId as TrickState) && v.totalTrickScore >= td.unlock) {
      v.unlockedTricks.push(trickId as TrickState);
    }
  }
}

// ---- BALANCE METER UPDATE (for wheelie/manual) ----
function updateBalanceMeter(v: Vehicle, dt: number, keys: Set<string>): boolean {
  if (v.trickState !== 'wheelie' && v.trickState !== 'manual') {
    v.balanceMeter = 0;
    return true; // no fail
  }
  // Drift toward fall
  const driftDir = v.trickState === 'wheelie' ? 1 : -1;
  v.balanceMeter += driftDir * BALANCE.driftSpeed * dt;
  // Player correction with left/right keys
  if (keys.has('ArrowLeft') || keys.has('a')) v.balanceMeter -= BALANCE.correctSpeed * dt;
  if (keys.has('ArrowRight') || keys.has('d')) v.balanceMeter += BALANCE.correctSpeed * dt;
  // Clamp
  v.balanceMeter = Math.max(-100, Math.min(100, v.balanceMeter));
  // Check fail
  if (Math.abs(v.balanceMeter) > BALANCE.failThreshold) {
    v.trickState = 'none';
    v.balanceMeter = 0;
    return false; // trick failed
  }
  // Perfect zone bonus (score multiplied)
  return true;
}

// ---- KINDERGARTEN MINI-GAMES ----
export function startMinigame(state: GameState, roomName: string): boolean {
  if (state.minigame) return false;
  // Find matching game type for this room
  let gameType: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let gameData: any = null;
  for (const [type, data] of Object.entries(KINDERGARTEN_GAMES)) {
    if (data.rooms.includes(roomName)) {
      gameType = type;
      gameData = data;
      break;
    }
  }
  if (!gameType || !gameData) return false;

  // Pick random puzzle
  const puzzleIdx = Math.floor(Math.random() * gameData.puzzles.length);
  const puzzle = gameData.puzzles[puzzleIdx];

  state.minigame = {
    type: gameType as MinigameType,
    name: gameData.name,
    roomName,
    question: puzzle.question,
    options: puzzle.options.map((label: string) => ({ label })),
    correctIndex: puzzle.correct,
    selectedIndex: -1,
    answered: false,
    correct: false,
    streak: state.kindergartenProgress.bestStreak > 0 ? 0 : 0, // reset per session
    round: 1,
    maxRounds: 3,
    skillPoints: {},
    timer: 0,
    difficulty: 1,
  };
  state.phase = 'minigame';
  return true;
}

export function answerMinigame(state: GameState, optionIndex: number): void {
  if (!state.minigame || state.minigame.answered) return;
  const mg = state.minigame;
  mg.selectedIndex = optionIndex;
  mg.answered = true;
  mg.correct = optionIndex === mg.correctIndex;

  const kp = state.kindergartenProgress;
  kp.totalGames++;

  if (mg.correct) {
    kp.totalCorrect++;
    mg.streak++;
    if (mg.streak > kp.bestStreak) kp.bestStreak = mg.streak;

    // Add skill points
    const gameData = KINDERGARTEN_GAMES[mg.type as keyof typeof KINDERGARTEN_GAMES];
    if (gameData) {
      const skill = gameData.skill as KinderSkill;
      kp.skills[skill] = Math.min(100, (kp.skills[skill] || 0) + 5 + mg.streak);
    }
    // Score bonus
    state.score += 10 + mg.streak * 5;
    spawnFloatingText(state, state.player.x + state.player.w / 2, state.player.y - 30,
      `✅ Brawo! +${10 + mg.streak * 5} pkt`, '#4CAF50', 20);
  } else {
    mg.streak = 0;
    spawnFloatingText(state, state.player.x + state.player.w / 2, state.player.y - 30,
      '❌ Spróbuj jeszcze!', '#F44336', 18);
  }

  // Level up check (every 10 correct answers)
  const newLevel = Math.min(5, 1 + Math.floor(kp.totalCorrect / 10));
  if (newLevel > kp.level) {
    kp.level = newLevel;
    const levelNames = ['', 'Żółwik', 'Króliczek', 'Sówka', 'Lisek', 'Mistrz'];
    spawnFloatingText(state, state.player.x + state.player.w / 2, state.player.y - 60,
      `🎉 Nowy poziom: ${levelNames[newLevel]}!`, '#FFD600', 24);
  }
}

export function nextMinigameRound(state: GameState): void {
  if (!state.minigame) return;
  const mg = state.minigame;
  if (mg.round >= mg.maxRounds) {
    // End minigame
    state.minigame = null;
    state.phase = 'playing';
    return;
  }
  // Next round — pick new puzzle
  const gameData = KINDERGARTEN_GAMES[mg.type as keyof typeof KINDERGARTEN_GAMES];
  if (!gameData) { state.minigame = null; state.phase = 'playing'; return; }
  const puzzleIdx = Math.floor(Math.random() * gameData.puzzles.length);
  const puzzle = gameData.puzzles[puzzleIdx];
  mg.round++;
  mg.question = puzzle.question;
  mg.options = puzzle.options.map((label: string) => ({ label }));
  mg.correctIndex = puzzle.correct;
  mg.selectedIndex = -1;
  mg.answered = false;
  mg.correct = false;
}
