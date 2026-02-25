// ==========================================
// Sąsiedzi na Migdałowej — Game Engine
// EXPANDED: costumes, NPC AI, achievements,
// combos, weather, screen shake, floating text
// ==========================================

import type {
  GameState, Player, NPC, CollectibleItem, DialogState, MathProblem,
  LevelData, ItemType, CostumeSlot, Achievement, InteractiveObject,
} from './types';
import {
  GRAVITY, JUMP_FORCE, MOVE_SPEED, CLIMB_SPEED, MAX_FALL_SPEED,
  FRICTION, PLAYER_W, PLAYER_H, CANVAS_W, CANVAS_H,
  ITEM_FLOAT_SPEED, ITEM_EMOJIS, COMBO, COLORS, GARDEN, HOUSE,
} from './constants';
import { getNpcDialog } from './level';
import {
  sfxTvToggle, sfxFridgeToggle, sfxLampToggle,
  sfxTapToggle, sfxPianoNote, sfxBookOpen,
  sfxDoorbell, sfxPackagePickup,
} from './audio';

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
  };

  const npcs: NPC[] = level.npcs.map(n => ({ ...n, photoUrl: null }));
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
    freezeTimer: 0,
    streetCars: [],
    streetCarTimer: 3 + Math.random() * 5,
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
  updateItems(state);
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
  updateStreetTraffic(state, dt);
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

    // Going DOWN: player near top of stairs (on 2nd floor)
    if (down && dist < 60 && Math.abs(player.y + player.h - stair.topY) < 20) {
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

      if (up && dist < 30 && player.y + player.h >= cl.topY && player.y + player.h <= cl.bottomY + 10) {
        player.onStairs = true; // reuse stairs climbing mechanic
        player.onGround = false;
        player.x = cl.x + cl.w / 2 - player.w / 2;
        player.vy = -CLIMB_SPEED;
        return;
      }
      if (down && dist < 30 && player.y + player.h >= cl.topY && player.y + player.h <= cl.bottomY + 10) {
        player.onStairs = true;
        player.onGround = false;
        player.x = cl.x + cl.w / 2 - player.w / 2;
        player.vy = CLIMB_SPEED;
        return;
      }
    }
  }

  // Keep player on climbable while climbing
  if (player.onStairs) {
    for (const cl of climbables) {
      const cx = cl.x + cl.w / 2;
      const dist = Math.abs(px - cx);
      if (dist < 40 && player.y + player.h >= cl.topY && player.y <= cl.bottomY) {
        // Clamp player to climbable bounds
        if (player.y + player.h < cl.topY) {
          player.y = cl.topY - player.h;
          player.vy = 0;
          player.onStairs = false;
          player.onGround = true;
          player.jumpCount = 0;
        }
        if (player.y + player.h > cl.bottomY) {
          player.y = cl.bottomY - player.h;
          player.vy = 0;
          player.onStairs = false;
          player.onGround = true;
          player.jumpCount = 0;
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
      // Normal horizontal movement
      if (left) { player.vx = -MOVE_SPEED; player.dir = -1; player.walking = true; }
      else if (right) { player.vx = MOVE_SPEED; player.dir = 1; player.walking = true; }
      else {
        player.vx *= FRICTION;
        if (Math.abs(player.vx) < 0.1) player.vx = 0;
      }
    }
  }

  if (player.walking) {
    player.walkTimer += 0.15;
    player.walkFrame = Math.floor(player.walkTimer) % 4;
  } else {
    player.walkFrame = 0;
    player.walkTimer = 0;
  }
}

// ---- Crouch/Lie down (called from keydown, NOT continuous polling) ----
export function playerCrouchOrLie(state: GameState): void {
  if (state.phase !== 'playing') return;
  const { player, stairs } = state;
  if (player.onStairs || !player.onGround) return;

  // Don't crouch if near stairs — DOWN is used to descend
  const px = player.x + player.w / 2;
  for (const stair of stairs) {
    const sx = stair.x + stair.w / 2;
    if (Math.abs(px - sx) < 60 && Math.abs(player.y + player.h - stair.topY) < 20) {
      return; // near stairs top — let autoEnterStairs handle DOWN
    }
    if (Math.abs(px - sx) < 60 && player.y + player.h >= stair.topY && player.y + player.h <= stair.bottomY + 10) {
      return; // on/near stairs body — don't crouch
    }
  }

  // Drop-through: if on 2nd floor platform (y+h ≈ 330), drop down
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
      // Landing dust particles
      const dustCount = Math.min(8, Math.floor(impactSpeed * 0.5));
      for (let i = 0; i < dustCount; i++) {
        state.particles.push({
          x: p.x + p.w / 2 + (Math.random() - 0.5) * p.w,
          y: p.y + p.h,
          vx: (Math.random() - 0.5) * impactSpeed * 0.3,
          vy: -Math.random() * 1.5,
          life: 0.3 + Math.random() * 0.2,
          maxLife: 0.5,
          color: '#B8A88A',
          size: 3 + Math.random() * 3,
        });
      }
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

  if (player.x < -580) player.x = -580; // left bound (street area)
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
    const onAnyStair = stairs.some(s => {
      const cx = player.x + player.w / 2;
      return cx > s.x - 20 && cx < s.x + s.w + 20 &&
        player.y + player.h >= s.topY && player.y <= s.bottomY;
    });
    if (!onAnyStair) { player.onStairs = false; player.jumpCount = 0; }

    for (const s of stairs) {
      if (player.y + player.h < s.topY) {
        player.y = s.topY - player.h;
        player.vy = 0;
        player.onStairs = false;
        player.onGround = true;
        player.jumpCount = 0;
      }
      if (player.y + player.h > s.bottomY) {
        player.y = s.bottomY - player.h;
        player.vy = 0;
        player.onStairs = false;
        player.onGround = true;
        player.jumpCount = 0;
      }
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

      if (step.itemType) {
        if (step.itemType !== item.type) {
          // Allow grouped items for specific quests
          const questAllowsGroup =
            (item.questId === 'quest_lego' && isAnyLego) ||
            (item.questId === 'quest_jurek' && isAnyPlush) ||
            (item.questId === 'quest_bath' && isAnyBath) ||
            (item.questId === 'quest_baby' && isAnyBaby);
          if (!questAllowsGroup) continue;
        }
      } else {
        // No specific type required — accept matching groups
        const isMatchingGroup =
          (item.questId === 'quest_toys' && isAnyToy) ||
          (item.questId === 'quest_lego' && isAnyLego) ||
          (item.questId === 'quest_jurek' && isAnyPlush) ||
          (item.questId === 'quest_bath' && isAnyBath) ||
          (item.questId === 'quest_baby' && isAnyBaby);
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

      // Collect particles
      spawnCollectParticles(state, item.x + item.w / 2, item.y + item.h / 2, item.type);

      // Floating text
      const emoji = ITEM_EMOJIS[item.type] || '📦';
      spawnFloatingText(state, item.x, item.y, `${emoji} +10`, '#FFD700', 18);

      // Count message
      showMessage(state, `${emoji} ${step.currentCount}/${step.targetCount}`, 1.5);

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

// ---- Update items (floating) ----
function updateItems(state: GameState): void {
  for (const item of state.items) {
    if (!item.collected) {
      item.floatPhase += ITEM_FLOAT_SPEED;
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

  camera.targetX = player.x + player.w / 2 - viewW / 2;
  camera.targetY = player.y + player.h / 2 - viewH / 2;

  // Clamp to world bounds (street extends to x=-600)
  const minX = -600;
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

  // Extra sparkle burst (stars going up)
  const starEmojis = ['✨', '⭐', '💫'];
  for (let i = 0; i < 5; i++) {
    state.particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y - 5,
      vx: (Math.random() - 0.5) * 4,
      vy: -(Math.random() * 5 + 3),
      life: 0.8 + Math.random() * 0.5,
      maxLife: 1.3,
      color: '#FFD700',
      size: 8 + Math.random() * 6,
      emoji: starEmojis[Math.floor(Math.random() * starEmojis.length)],
      type: 'sparkle',
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
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
  const emojis = ['⭐', '🎉', '✨', '🌟', '💫', '🎊', '🏆'];
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
  };
  return icons[npcId] || '💬';
}
