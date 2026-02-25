// ==========================================
// Sąsiedzi na Migdałowej — Game Constants
// EXPANDED: new items, costumes, effects
// ==========================================

// Canvas
export const CANVAS_W = 1280;
export const CANVAS_H = 720;

// Physics
export const GRAVITY = 0.55;
export const JUMP_FORCE = -11;
export const MOVE_SPEED = 3.5;
export const CLIMB_SPEED = 3;
export const MAX_FALL_SPEED = 12;
export const FRICTION = 0.85;

// Player (bigger for better face details)
export const PLAYER_W = 52;
export const PLAYER_H = 84;

// NPC
export const NPC_W = 52;
export const NPC_H = 84;
export const INTERACT_RADIUS = 60;

// Items
export const ITEM_SIZE = 32;
export const ITEM_FLOAT_SPEED = 0.03;
export const ITEM_FLOAT_AMP = 4;

// House layout (based on Migdałowa 47 floor plans)
export const HOUSE = {
  leftWall: 80,
  rightWall: 880,
  width: 800,

  // Floors
  groundLevel: 560,
  floor1Y: 556,
  floor2Y: 330,
  ceilingF1: 332,
  ceilingF2: 110,
  roofPeak: 60,

  // Parter rooms
  kuchnia: { x: 80, w: 280 },
  salon: { x: 360, w: 320 },
  przedpokoj: { x: 680, w: 200 },

  // Piętro rooms
  pokojJurka: { x: 80, w: 300 },
  hall: { x: 380, w: 180 },
  sypialnia: { x: 560, w: 320 },

  // Stairs
  stairsX: 720,
  stairsW: 60,

  // Door
  doorX: 870,
  doorW: 30,
};

// Terrace (between house and garden)
export const TERRACE = {
  x: 880,
  y: 516,       // terrace deck level (raised slightly from ground)
  w: 120,
  h: 40,
  deckColor: '#D4B896',    // beige teak
  deckDark: '#C4A876',
  railColor: '#8D6E63',
  grillX: 930,             // grill position on terrace
};

// Street (left of house)
export const STREET = {
  startX: -600,
  endX: -200,
  y: 556,
  sidewalkX: -200,
  sidewalkW: 80,
  roadY: 560,
  roadColor: '#555555',
  sidewalkColor: '#C0B8A8',
  lineColor: '#FFFFFF',
};

// Garage (built into left side of house)
export const GARAGE = {
  x: -200,
  y: 332,
  w: 280,
  h: 224,
  // Cars inside
  alfaX: -120,        // Alfa Romeo Junior Veloce (black electric)
  tiguanX: -10,       // VW Tiguan Allspace (gray SUV)
  carY: 510,          // car bottom on garage floor
  // Charging station
  chargerX: -180,
  chargerY: 480,
};

// Garbage bins (between garage and terrace area)
export const BINS = {
  x: 860,             // just outside front door area
  y: 530,
  spacing: 22,
  colors: {
    mixed: '#333333',     // black — zmieszane
    plastic: '#FDD835',   // yellow — plastik
    paper: '#1565C0',     // blue — papier
  },
};

// Garden / Outside (EXPANDED - wider world)
export const GARDEN = {
  startX: 1000,       // shifted right to make room for terrace
  groundY: 560,
  treeX: 1100,
  treeW: 60,
  treeH: 180,
  // New garden elements
  sandboxX: 1150,
  playhouseX: 1350,
  hamakX: 1450,
  flowerBedX: 1050,
  endX: 1550,
};

// Colors
export const COLORS = {
  // Sky & nature
  sky: '#87CEEB',
  skyBottom: '#B0E0E6',
  grass: '#4CAF50',
  grassDark: '#388E3C',
  dirt: '#8D6E63',

  // House exterior
  wallExterior: '#D7CEC7',
  wallBrick: '#C4A882',
  roofTiles: '#5D4037',
  roofSide: '#6D4C41',

  // Room backgrounds
  kuchnia: '#F5F0EB',
  salon: '#E8E0D8',
  przedpokoj: '#EDE8E3',
  pokojJurka: '#DCEAF8',
  hall: '#E8E3DD',
  sypialnia: '#E8DAE8',

  // Floors
  floorWood: '#C8AD8A',
  floorWoodDark: '#B89B74',
  floorTile: '#D5CFC8',

  // Furniture
  sofa: '#C8BEB4',
  table: '#A0846B',
  cabinet: '#8B7355',
  fireplace: '#4A4A4A',

  // Characters (based on real family photos - Nintendo Switch quality)
  // Kuba (player) - dirty blond hair, brown eyes, black Adidas shirt
  kubaShirt: '#1A1A1A',
  kubaStripes: '#E53935',
  kubaPants: '#2C3E50',
  kubaHair: '#C4A265',
  kubaHairHighlight: '#D4B878',
  kubaEyes: '#6D4C30',
  kubaSkin: '#FFCC99',
  kubaSkinShadow: '#F0BB88',
  kubaShoe: '#FAFAFA',
  // Mama Ola - long dark brown hair, red top
  mamaTop: '#C0392B',
  mamaPants: '#2C3E50',
  mamaHair: '#4A2A12',
  mamaHairHighlight: '#6B3D1E',
  mamaSkin: '#FFCC99',
  // Tata Seba - dark hair, short beard, black shirt, watch
  tataShirt: '#1A1A1A',
  tataPants: '#2C3E50',
  tataHair: '#2E1A0E',
  tataBeard: '#3A2518',
  tataEyes: '#5D4037',
  tataSkin: '#F0C090',
  tataWatch: '#C0A060',
  // Franek (white Spitz dog)
  franekFur: '#FAFAFA',
  franekFurShadow: '#E8E8E8',
  franekFurChest: '#FFFFFF',
  franekNose: '#1A1A1A',
  franekEyes: '#2A1A0A',
  franekTongue: '#E88090',
  franekEarInner: '#FFD0D0',

  // Items (existing)
  apple: '#E53935',
  appleLeaf: '#4CAF50',
  toycar: '#2196F3',
  toyball: '#FF9800',
  toybear: '#A1887F',
  toyblock: '#9C27B0',

  // Items (NEW)
  legoRed: '#E53935',
  legoBlue: '#1565C0',
  legoYellow: '#FDD835',
  legoGreen: '#43A047',
  cookie: '#D4A574',
  letter: '#F5F5DC',
  flower: '#E91E63',
  key: '#FFD700',
  crayon: '#FF5722',
  book: '#5C6BC0',
  plushDog: '#C8AD8A',
  plushPanda: '#333333',
  plushRabbit: '#F8BBD0',
  wateringCan: '#42A5F5',
  ingredient: '#FF8A65',

  // Hygiene items
  toothbrush: '#42A5F5',
  soap: '#E8D0F0',
  towel: '#FF8A65',
  comb: '#8D6E63',
  pajama: '#7986CB',
  rubberDuck: '#FFD600',
  shampoo: '#80CBC4',
  // Baby items
  babyToy: '#F48FB1',
  babyBottle: '#B3E5FC',
  babyBlanket: '#CE93D8',

  // Wujek Rafał items
  pierogi: '#F5F0DC',
  ptasieMleczko: '#6D4C41',
  backpack: '#FF7043',

  // Wujek Rafał character
  rafalShirt: '#2E7D32',     // green travel shirt
  rafalPants: '#5D4037',     // brown cargo pants
  rafalHair: '#5D4037',      // dark brown
  rafalSkin: '#F0C090',
  rafalTan: '#E0B080',       // slightly tanned from Vietnam

  // Cars
  alfaBlack: '#1A1A1A',
  tiguanGray: '#9E9E9E',
  taxiYellow: '#FDD835',

  // Costume colors
  hatPirate: '#333333',
  hatCrown: '#FFD700',
  hatWizard: '#7B1FA2',
  hatCowboy: '#8D6E63',
  glassesCool: '#333333',
  glassesHeart: '#E91E63',
  capeSuperHero: '#E53935',
  capeWizard: '#7B1FA2',

  // UI
  dialogBg: 'rgba(255, 255, 255, 0.95)',
  dialogBorder: '#5D4037',
  hudBg: 'rgba(0, 0, 0, 0.6)',
  questActive: '#FFD700',
  questComplete: '#4CAF50',
  starColor: '#FFD700',

  // Effects
  comboGold: '#FFD700',
  rainColor: '#90CAF9',
  snowColor: '#FFFFFF',
  trailRainbow: ['#FF0000', '#FF7700', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF'],
};

// Item emoji map (EXPANDED)
export const ITEM_EMOJIS: Record<string, string> = {
  apple: '🍎',
  banana: '🍌',
  cookie: '🍪',
  star: '⭐',
  toy_car: '🚗',
  toy_ball: '⚽',
  toy_bear: '🧸',
  toy_block: '🧱',
  lego_red: '🔴',
  lego_blue: '🔵',
  lego_yellow: '🟡',
  lego_green: '🟢',
  plush_dog: '🐕',
  plush_panda: '🐼',
  plush_rabbit: '🐰',
  letter: '✉️',
  flower: '🌸',
  key: '🔑',
  crayon: '🖍️',
  book: '📚',
  watering_can: '🚿',
  ingredient: '🥕',
  // Hygiene
  toothbrush: '🪥',
  soap: '🧼',
  towel: '🧺',
  comb: '💇',
  pajama: '👕',
  rubber_duck: '🐤',
  shampoo: '🧴',
  // Baby
  baby_toy: '🧸',
  baby_bottle: '🍼',
  baby_blanket: '🧶',
  // Wujek Rafał
  pierogi: '🥟',
  ptasie_mleczko: '🍫',
  backpack: '🎒',
};

// Combo thresholds
export const COMBO = {
  timeout: 3,       // seconds between items to keep combo
  bonusMultiplier: 2,
  rainbowTrailSpeed: 5, // items collected fast = rainbow trail
};
