// ==========================================
// Sąsiedzi na Migdałowej — Game Types
// EXPANDED: costumes, events, achievements, effects
// ==========================================

export interface Vec2 {
  x: number;
  y: number;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  targetZoom: number;
  targetX: number;
  targetY: number;
  currentRoom: string | null;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ---- Costume System ----
export type CostumeSlot = 'hat' | 'glasses' | 'cape' | 'shoes' | 'accessory';

export interface CostumeItem {
  id: string;
  name: string;
  slot: CostumeSlot;
  emoji: string;
  color: string;       // primary render color
  unlocked: boolean;
  unlockedBy: string;  // quest ID or 'default'
}

// ---- Characters ----
export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  dir: 1 | -1;
  onGround: boolean;
  onStairs: boolean;
  walking: boolean;
  walkFrame: number;
  walkTimer: number;
  name: string;
  color: string;
  hairColor: string;
  photoUrl: string | null;
  equippedCostumes: Record<CostumeSlot, string | null>;
  trailTimer: number; // rainbow trail
  jumpCount: number;  // double jump tracking
  crouching: boolean;
  lying: boolean;
  crouchTimer: number; // for double-tap detection
  dropThrough: number; // timer to ignore thin platforms (drop from 2nd floor)
  // Game juice
  scaleX: number;     // squash & stretch X (1.0 = normal)
  scaleY: number;     // squash & stretch Y (1.0 = normal)
  coyoteTimer: number;  // frames left to still jump after leaving edge
  jumpBufferTimer: number; // frames left of buffered jump input
  wasOnGround: boolean; // previous frame ground state (for landing detection)
  prevVy: number;       // previous frame vy (for landing impact)
}

export interface NPC {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dir: 1 | -1;
  color: string;
  hairColor: string;
  hairLong: boolean;
  photoUrl: string | null;
  dialogLines: string[];
  questId: string | null;
  interactRadius: number;
  emote: string | null;
  behavior: 'static' | 'patrol' | 'flee'; // NPC AI
  patrolMinX?: number;
  patrolMaxX?: number;
  patrolSpeed?: number;
  visible: boolean;
  animTimer: number;
}

// ---- World ----
export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Wall {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Stairs {
  x: number;
  y: number;
  w: number;
  topY: number;
  bottomY: number;
}

export interface Room {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  bgColor: string;
  floorColor: string;
  icon: string;
  bgImageUrl: string | null;
}

export interface Door {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
}

// ---- Interactive Objects ----
export type InteractiveType = 'tv' | 'fridge' | 'lamp' | 'tap' | 'piano' | 'bookshelf' | 'rc_controller';

export interface InteractiveObject {
  id: string;
  type: InteractiveType;
  x: number;
  y: number;
  w: number;
  h: number;
  state: boolean;    // on/off, open/closed
  room: string;      // which room it belongs to
  label: string;     // display name
  emoji: string;     // icon
  cooldown: number;  // prevent rapid toggling
}

// ---- Items (EXPANDED) ----
export type ItemType =
  | 'apple' | 'banana' | 'cookie' | 'star'
  | 'toy_car' | 'toy_ball' | 'toy_bear' | 'toy_block'
  | 'lego_red' | 'lego_blue' | 'lego_yellow' | 'lego_green'
  | 'plush_dog' | 'plush_panda' | 'plush_rabbit'
  | 'letter' | 'flower' | 'key' | 'crayon' | 'book'
  | 'watering_can' | 'ingredient'
  // Hygiene items
  | 'toothbrush' | 'soap' | 'towel' | 'comb' | 'pajama' | 'rubber_duck' | 'shampoo'
  // Baby / pregnancy items
  | 'baby_toy' | 'baby_bottle' | 'baby_blanket';

export interface CollectibleItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  w: number;
  h: number;
  collected: boolean;
  questId: string;
  floatPhase: number;
  label?: string; // optional label for LEGO color etc.
}

// ---- Quests ----
export interface Quest {
  id: string;
  title: string;
  npcId: string;
  steps: QuestStep[];
  currentStep: number;
  completed: boolean;
  active: boolean;
  reward: number;          // stars
  costumeReward?: string;  // costume item ID unlocked on completion
}

export interface QuestStep {
  type: 'talk' | 'collect' | 'deliver' | 'math' | 'chase' | 'find';
  description: string;
  icon: string;
  itemType?: ItemType;
  targetCount?: number;
  currentCount?: number;
  targetNpcId?: string;
  mathProblem?: MathProblem;
  completed: boolean;
}

export interface MathProblem {
  visualIcon: string;
  question: string;
  num1: number;
  num2: number;
  operation: '+' | '-' | '×';
  answer: number;
  options: number[];
  hint: string;
  difficulty: 1 | 2 | 3;  // 1=easy, 2=medium, 3=hard
}

// ---- Dialog ----
export interface DialogState {
  npcId: string;
  npcName: string;
  lines: string[];
  currentLine: number;
  icon: string;
  onComplete?: () => void;
}

// ---- Particles & Effects ----
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  emoji?: string;
  type?: 'sparkle' | 'rain' | 'snow' | 'leaf' | 'trail' | 'confetti' | 'heart' | 'note';
  rotation?: number;
  rotationSpeed?: number;
}

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface ScreenShake {
  x: number;
  y: number;
  intensity: number;
  timer: number;
}

// ---- Weather ----
export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'leaves';

// ---- Achievements ----
export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  costumeReward?: string;
}

// ---- Climbable Surfaces (trees, poles, fence posts) ----
export interface Climbable {
  x: number;
  y: number;
  w: number;
  topY: number;     // top of climbable area
  bottomY: number;  // bottom of climbable area
  label: string;    // display name
  emoji: string;    // icon
}

// ---- RC Car ----
export interface RCCar {
  x: number;
  y: number;
  vx: number;
  dir: 1 | -1;
  active: boolean;        // player has the controller
  controlMode: boolean;   // player is driving the RC car
  color: string;
  type: 'monster' | 'racing' | 'buggy';
}

// ---- Game Phases ----
export type GamePhase =
  | 'start' | 'playing' | 'dialog' | 'math'
  | 'celebration' | 'level_complete'
  | 'wardrobe' | 'achievements';

// ---- Full Game State ----
export interface GameState {
  phase: GamePhase;
  player: Player;
  npcs: NPC[];
  items: CollectibleItem[];
  platforms: Platform[];
  walls: Wall[];
  stairs: Stairs[];
  rooms: Room[];
  doors: Door[];
  interactiveObjects: InteractiveObject[];
  quests: Quest[];
  inventory: Record<string, number>;
  dialog: DialogState | null;
  mathChallenge: MathProblem | null;
  mathCallback: (() => void) | null;
  camera: CameraState;
  worldWidth: number;
  worldHeight: number;
  score: number;
  stars: number;
  totalStarsAvailable: number;
  particles: Particle[];
  weatherParticles: Particle[];
  floatingTexts: FloatingText[];
  screenShake: ScreenShake;
  time: number;
  keys: Set<string>;
  interactCooldown: number;
  celebrationTimer: number;
  message: { text: string; timer: number; icon: string } | null;
  questPointer: { x: number; y: number; label: string } | null;
  // New systems
  costumes: CostumeItem[];
  achievements: Achievement[];
  weather: WeatherType;
  comboCount: number;
  comboTimer: number;
  questsCompleted: number;
  totalItemsCollected: number;
  showAchievement: Achievement | null;
  achievementTimer: number;
  // Airplanes
  airplanes: Airplane[];
  airplaneTimer: number;
  // Courier/doorbell
  doorbellActive: boolean;
  courierPackage: { x: number; y: number; collected: boolean } | null;
  // Climbable surfaces
  climbables: Climbable[];
  // RC Car
  rcCar: RCCar | null;
  // Game juice
  freezeTimer: number; // hitstop: pause game logic while rendering
  // Street traffic
  streetCars: StreetCar[];
  streetCarTimer: number;
}

// ---- Street Traffic ----
export interface StreetCar {
  x: number;
  y: number;
  speed: number;
  dir: 1 | -1;
  color: string;
  type: 'sedan' | 'suv' | 'van' | 'bus' | 'police';
  stopped: boolean;
  stopTimer: number;
}

export interface Airplane {
  x: number;
  y: number;
  speed: number;
  dir: 1 | -1;
  type: 'small' | 'jet' | 'biplane';
  altitude: number;
  trailLength: number;
}

// ---- Level Definition ----
export interface LevelData {
  worldWidth: number;
  worldHeight: number;
  playerStart: Vec2;
  rooms: Room[];
  platforms: Platform[];
  walls: Wall[];
  stairs: Stairs[];
  doors: Door[];
  interactiveObjects: Omit<InteractiveObject, 'cooldown'>[];
  npcs: Omit<NPC, 'photoUrl'>[];
  items: Omit<CollectibleItem, 'collected' | 'floatPhase'>[];
  quests: Quest[];
  costumes: CostumeItem[];
  achievements: Achievement[];
  climbables: Omit<Climbable, never>[];
}
