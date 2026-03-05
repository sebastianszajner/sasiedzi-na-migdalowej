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
  atticFloorY: 110,   // attic floor = same as ceiling of 2nd floor
  atticCeilingY: -10,  // attic ceiling raised for player space
  roofPeak: -20,       // roof peak raised to accommodate attic

  // Parter rooms
  kuchnia: { x: 80, w: 280 },
  salon: { x: 360, w: 320 },
  przedpokoj: { x: 680, w: 200 },

  // Piętro rooms
  pokojJurka: { x: 80, w: 300 },
  hall: { x: 380, w: 180 },
  sypialnia: { x: 560, w: 320 },

  // Antresola (attic/mezzanine above Kuba's room)
  antresola: { x: 200, w: 500 },

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

// Street (left of house — extended for Żabka + Paczkomat)
export const STREET = {
  startX: -1300,
  endX: -660,
  y: 556,
  sidewalkX: -200,
  sidewalkW: 80,
  roadY: 560,
  roadColor: '#555555',
  sidewalkColor: '#C0B8A8',
  lineColor: '#FFFFFF',
};

// Żabka convenience store (on the street)
export const ZABKA = {
  x: -1100,
  y: 332,
  w: 240,
  h: 224,
  doorX: -1010,
  doorW: 50,
  signColor: '#00A651',   // Żabka green
  wallColor: '#F5F0EB',
  floorColor: '#D5CFC8',
};

// Paczkomat (InPost parcel locker next to Żabka)
export const PACZKOMAT = {
  x: -830,
  y: 460,
  w: 60,
  h: 96,
  color: '#FFD700',       // InPost yellow
  screenColor: '#1A1A1A',
};

// === EXPANDED MAP: LEFT SIDE (sports zones) ===

// Skate Park (leftmost zone)
export const SKATE_PARK = {
  startX: -4500,
  endX: -3500,
  y: 556,
  halfpipeEdgeY: 420,
  quarterPipeY: 460,
  railY: 510,
  bgColor: '#A0A0A0',
  graffitiBg: '#E0E0E0',
};

// Basketball court
export const BASKETBALL = {
  startX: -3400,
  endX: -2600,
  y: 556,
  hoopY: 430,
  courtColor: '#E67E22',
  lineColor: '#FFFFFF',
};

// Bike path
export const BIKE_PATH = {
  startX: -2500,
  endX: -1700,
  y: 556,
  pathColor: '#888888',
  lineColor: '#FFD700',
};

// === EXPANDED MAP: RIGHT SIDE (institutions) ===

// Przedszkole (kindergarten) — 200% of house width
export const PRZEDSZKOLE = {
  x: 3500,
  w: 1600,
  floor1Y: 556,
  floor2Y: 330,
  ceilingF1: 332,
  ceilingF2: 110,
  wallColor: '#FFF8E1',
  roofColor: '#FF8F00',
  signText: 'Przedszkole Migdałowe',
};

// Szkoła (school) — largest building
export const SZKOLA = {
  x: 5500,
  w: 2300,
  floor1Y: 556,
  floor2Y: 330,
  ceilingF1: 332,
  ceilingF2: 110,
  wallColor: '#ECEFF1',
  roofColor: '#455A64',
  signText: 'Szkoła Podstawowa nr 3',
};

// === NEW ZONES (expansion left & right) ===

// City Park (left of skatepark)
export const CITY_PARK = {
  startX: -5800,
  endX: -5000,
  y: 556,
  fountainX: -5400,
  pondX: -5200,
};

// City Library (left of park)
export const CITY_LIBRARY = {
  x: -6400,
  w: 600,
  floor1Y: 556,
  floor2Y: 330,
  ceilingF1: 332,
  ceilingF2: 110,
  wallColor: '#F5F0E8',
  roofColor: '#6D4C41',
  signText: 'Biblioteka Miejska',
};

// City Playground (leftmost)
export const CITY_PLAYGROUND = {
  startX: -7200,
  endX: -6400,
  y: 556,
  carouselX: -7000,
  trampolineX: -6600,
};

// Park behind school (right of school yard)
export const PARK_BEHIND_SCHOOL = {
  startX: 8600,
  endX: 9200,
  y: 556,
};

// Bus stop
export const BUS_STOP = {
  x: 9200,
  w: 300,
  y: 556,
};

// Residential area (osiedle)
export const OSIEDLE = {
  x: 9500,
  w: 1500,
  floor1Y: 556,
  floor2Y: 380,
  floor3Y: 210,
  blockColors: ['#ECEFF1', '#E8EAF6', '#FFF8E1'],
};

// Vehicles — properties per type
export const VEHICLE_DEFS = {
  scooter:       { speed: 5.0, jumpForce: -11, w: 40, h: 28, tricks: ['bunnyHop', 'manual', 'kickflip'] as const, label: 'Hulajnoga' },
  rollerblades:  { speed: 6.0, jumpForce: -10, w: 32, h: 24, tricks: ['grind', 'slide', 'airSpin'] as const, label: 'Rolki' },
  bike_kid:      { speed: 4.5, jumpForce: -10, w: 44, h: 30, tricks: ['bunnyHop', 'wheelie'] as const, label: 'Rower dziecięcy' },
  bike_bmx:      { speed: 6.5, jumpForce: -14, w: 44, h: 30, tricks: ['bunnyHop', 'wheelie', 'manual', 'backflip', 'grind', 'airSpin', 'tailwhip', 'barspin', 'superman', 'noHander', 'spin360', 'tabletop'] as const, label: 'BMX' },
  bike_mountain: { speed: 5.5, jumpForce: -12, w: 48, h: 32, tricks: ['bunnyHop', 'wheelie', 'manual', 'stoppie'] as const, label: 'Rower górski' },
  bike_road:     { speed: 8.0, jumpForce: -9,  w: 50, h: 30, tricks: ['wheelie', 'manual'] as const, label: 'Kolażówka' },
} as const;

// Vehicle spawn locations
export const VEHICLE_SPAWNS = [
  { id: 'bike_kid_garage',  type: 'bike_kid' as const,     x: -130, y: 520 },  // garage
  { id: 'scooter_zabka',    type: 'scooter' as const,      x: -700, y: 540 },  // near Żabka
  { id: 'rollers_skatepark', type: 'rollerblades' as const, x: -4200, y: 540 }, // skatepark
  { id: 'bmx_track',        type: 'bike_bmx' as const,     x: -2100, y: 540 }, // bike path / BMX
  { id: 'mountain_sport',   type: 'bike_mountain' as const, x: -3000, y: 540 }, // between basketball & skatepark
  { id: 'road_school',      type: 'bike_road' as const,    x: 5200, y: 540 },  // near school
] as const;

// Trick scores
export const TRICK_SCORES: Record<string, number> = {
  bunnyHop: 10,
  wheelie: 5,      // per second
  manual: 5,       // per second
  grind: 20,       // per rail
  backflip: 50,
  stoppie: 15,
  airSpin: 30,
  kickflip: 25,
  slide: 15,
  // New BMX tricks
  tailwhip: 40,
  barspin: 35,
  superman: 45,
  noHander: 30,
  spin360: 60,
  tabletop: 25,
};

// Trick definitions with tiers and unlock requirements
export const TRICK_DEFS: Record<string, { name: string; tier: string; emoji: string; color: string; airOnly: boolean; unlock: number }> = {
  bunnyHop:  { name: 'Bunny Hop',   tier: 'basic',        emoji: '🐰', color: '#4CAF50', airOnly: false, unlock: 0 },
  wheelie:   { name: 'Wheelie',     tier: 'basic',        emoji: '🎯', color: '#FF9800', airOnly: false, unlock: 0 },
  manual:    { name: 'Manual',      tier: 'basic',        emoji: '⚖️', color: '#2196F3', airOnly: false, unlock: 0 },
  grind:     { name: 'Grind',       tier: 'basic',        emoji: '⚡', color: '#FFC107', airOnly: false, unlock: 0 },
  kickflip:  { name: 'Kickflip',    tier: 'intermediate', emoji: '🔄', color: '#9C27B0', airOnly: true,  unlock: 50 },
  slide:     { name: 'Slide',       tier: 'basic',        emoji: '💨', color: '#607D8B', airOnly: false, unlock: 0 },
  stoppie:   { name: 'Stoppie',     tier: 'intermediate', emoji: '🛑', color: '#F44336', airOnly: false, unlock: 30 },
  backflip:  { name: 'Backflip',    tier: 'intermediate', emoji: '🔥', color: '#FF5722', airOnly: true,  unlock: 100 },
  airSpin:   { name: 'Air Spin',    tier: 'intermediate', emoji: '🌀', color: '#2196F3', airOnly: true,  unlock: 80 },
  // New tricks
  tabletop:  { name: 'Tabletop',    tier: 'intermediate', emoji: '📐', color: '#8BC34A', airOnly: true,  unlock: 120 },
  noHander:  { name: 'No Hander',   tier: 'advanced',     emoji: '🙌', color: '#00BCD4', airOnly: true,  unlock: 200 },
  barspin:   { name: 'Barspin',     tier: 'advanced',     emoji: '🔃', color: '#E91E63', airOnly: true,  unlock: 250 },
  tailwhip:  { name: 'Tailwhip',    tier: 'advanced',     emoji: '🌪️', color: '#FF6F00', airOnly: true,  unlock: 350 },
  superman:  { name: 'Superman',    tier: 'pro',          emoji: '🦸', color: '#D50000', airOnly: true,  unlock: 500 },
  spin360:   { name: '360 Spin',    tier: 'pro',          emoji: '💫', color: '#FFD600', airOnly: true,  unlock: 750 },
};

// Balance meter config
export const BALANCE = {
  driftSpeed: 15,      // how fast balance drifts during wheelie/manual (per second)
  correctSpeed: 40,    // how fast player can correct with arrow keys
  failThreshold: 85,   // balance > this = trick fails
  perfectZone: 15,     // |balance| < this = perfect multiplier
  perfectBonus: 1.5,   // score multiplier in perfect zone
};

// Trick tier labels
export const TRICK_TIER_LABELS: Record<string, string> = {
  basic: '🟢 Podstawowy',
  intermediate: '🟡 Średni',
  advanced: '🔴 Zaawansowany',
  pro: '🏆 Pro',
};

// ---- Kindergarten Mini-Games ----
export const KINDERGARTEN_GAMES = {
  rebus: {
    name: 'Rebusy',
    emoji: '🧩',
    skill: 'logika' as const,
    rooms: ['Sala Motylki', 'Sala Biedronki', 'Sala Słoniki', 'Sala Zajęć'],
    puzzles: [
      { question: 'Co powstanie z: 🌞 + 🌻?', options: ['Słonecznik', 'Księżyc', 'Deszcz', 'Śnieg'], correct: 0 },
      { question: 'Co powstanie z: 🏠 + 🐱?', options: ['Domek dla kota', 'Szkoła', 'Sklep', 'Park'], correct: 0 },
      { question: 'Co powstanie z: 🎂 + 🕯️?', options: ['Urodziny', 'Obiad', 'Śniadanie', 'Kolacja'], correct: 0 },
      { question: 'Co powstanie z: ❄️ + ⛄?', options: ['Bałwan', 'Lato', 'Wiosna', 'Jesień'], correct: 0 },
      { question: 'Co powstanie z: 🎨 + 🖌️?', options: ['Obraz', 'Książka', 'Muzyka', 'Taniec'], correct: 0 },
      { question: 'Co powstanie z: 🥛 + 🍪?', options: ['Podwieczorek', 'Obiad', 'Zupa', 'Sałatka'], correct: 0 },
      { question: 'Co powstanie z: 📚 + 👓?', options: ['Czytanie', 'Bieganie', 'Spanie', 'Jedzenie'], correct: 0 },
      { question: 'Co powstanie z: 🎵 + 🥁?', options: ['Koncert', 'Cisza', 'Sen', 'Szkoła'], correct: 0 },
    ],
  },
  colors: {
    name: 'Kolory',
    emoji: '🎨',
    skill: 'kolory' as const,
    rooms: ['Sala Zajęć', 'Sala Motylki'],
    puzzles: [
      { question: 'Jaki kolor ma słońce? ☀️', options: ['🟡 Żółty', '🔴 Czerwony', '🔵 Niebieski', '🟢 Zielony'], correct: 0 },
      { question: 'Jaki kolor ma trawa? 🌿', options: ['🟢 Zielony', '🟡 Żółty', '🔴 Czerwony', '🔵 Niebieski'], correct: 0 },
      { question: 'Jaki kolor ma niebo? ☁️', options: ['🔵 Niebieski', '🟢 Zielony', '🟡 Żółty', '🔴 Czerwony'], correct: 0 },
      { question: 'Jaki kolor ma pomidor? 🍅', options: ['🔴 Czerwony', '🔵 Niebieski', '🟢 Zielony', '🟡 Żółty'], correct: 0 },
      { question: 'Po zmieszaniu 🔴+🔵 powstanie:', options: ['🟣 Fioletowy', '🟢 Zielony', '🟡 Żółty', '🟠 Pomarańczowy'], correct: 0 },
      { question: 'Po zmieszaniu 🔴+🟡 powstanie:', options: ['🟠 Pomarańczowy', '🟣 Fioletowy', '🟢 Zielony', '🔵 Niebieski'], correct: 0 },
    ],
  },
  counting: {
    name: 'Liczenie',
    emoji: '🔢',
    skill: 'liczenie' as const,
    rooms: ['Sala Biedronki', 'Sala Słoniki'],
    puzzles: [
      { question: 'Ile to: 🍎🍎🍎?', options: ['3', '2', '4', '5'], correct: 0 },
      { question: 'Ile to: 2 + 3 = ?', options: ['5', '4', '6', '3'], correct: 0 },
      { question: 'Ile to: 🐱🐱🐱🐱?', options: ['4', '3', '5', '6'], correct: 0 },
      { question: 'Ile to: 5 - 2 = ?', options: ['3', '2', '4', '5'], correct: 0 },
      { question: 'Ile to: ⭐⭐⭐⭐⭐?', options: ['5', '4', '6', '3'], correct: 0 },
      { question: 'Ile to: 1 + 1 + 1 = ?', options: ['3', '2', '4', '1'], correct: 0 },
      { question: 'Co jest większe: 7 czy 4?', options: ['7', '4', 'Tyle samo', 'Nie wiem'], correct: 0 },
      { question: 'Ile nóg ma pies? 🐕', options: ['4', '2', '6', '3'], correct: 0 },
    ],
  },
  shapes: {
    name: 'Kształty',
    emoji: '🔷',
    skill: 'logika' as const,
    rooms: ['Sala Zajęć', 'Korytarz P', 'Korytarz P Góra'],
    puzzles: [
      { question: 'To jest: ⬜', options: ['Kwadrat', 'Trójkąt', 'Koło', 'Prostokąt'], correct: 0 },
      { question: 'To jest: ⭕', options: ['Koło', 'Kwadrat', 'Trójkąt', 'Gwiazda'], correct: 0 },
      { question: 'To jest: 🔺', options: ['Trójkąt', 'Koło', 'Kwadrat', 'Romb'], correct: 0 },
      { question: 'Ile boków ma trójkąt?', options: ['3', '4', '2', '5'], correct: 0 },
      { question: 'Co ma 4 równe boki?', options: ['Kwadrat', 'Trójkąt', 'Koło', 'Pięciokąt'], correct: 0 },
      { question: 'Piłka ma kształt: ⚽', options: ['Koła', 'Kwadratu', 'Trójkąta', 'Prostokąta'], correct: 0 },
    ],
  },
  letters: {
    name: 'Literki',
    emoji: '🔤',
    skill: 'litery' as const,
    rooms: ['Sala Zajęć', 'Pokój Nauczycielski P'],
    puzzles: [
      { question: 'Jaką literą zaczyna się: 🍎 Jabłko?', options: ['J', 'A', 'K', 'B'], correct: 0 },
      { question: 'Jaką literą zaczyna się: 🐱 Kot?', options: ['K', 'P', 'M', 'T'], correct: 0 },
      { question: 'Jaką literą zaczyna się: 🏠 Dom?', options: ['D', 'B', 'G', 'H'], correct: 0 },
      { question: 'Jaką literą zaczyna się: 🌞 Słońce?', options: ['S', 'Z', 'C', 'Ś'], correct: 0 },
      { question: 'Jaka samogłoska: A, E, I, O, ...?', options: ['U', 'B', 'C', 'D'], correct: 0 },
      { question: 'Ile liter ma słowo KOT?', options: ['3', '2', '4', '5'], correct: 0 },
    ],
  },
  memory: {
    name: 'Pamięć',
    emoji: '🧠',
    skill: 'pamiec' as const,
    rooms: ['Gabinet Dyrektora P', 'Łazienka P'],
    puzzles: [
      { question: 'Zapamiętaj: 🍎🍌🍇. Co było drugie?', options: ['🍌 Banan', '🍎 Jabłko', '🍇 Winogrono', '🍊 Pomarańcza'], correct: 0 },
      { question: 'Zapamiętaj: 🔴🔵🟢. Co było trzecie?', options: ['🟢 Zielony', '🔴 Czerwony', '🔵 Niebieski', '🟡 Żółty'], correct: 0 },
      { question: 'Zapamiętaj: 🐱🐕🐰. Co było pierwsze?', options: ['🐱 Kot', '🐕 Pies', '🐰 Królik', '🐦 Ptak'], correct: 0 },
      { question: 'Zapamiętaj: ⭐🌙☀️. Co NIE było?', options: ['🌈 Tęcza', '⭐ Gwiazda', '🌙 Księżyc', '☀️ Słońce'], correct: 0 },
    ],
  },
};

// BMX Pump Track elements (within bike path area -2500 to -1700)
export const BMX_TRACK = {
  slalomStart: -2450,
  slalomEnd: -2300,
  coneCount: 6,
  rampX: -2220,
  rampW: 50,
  rampH: 36,
  kickerX: -2080,
  kickerW: 40,
  kickerH: 30,
  bermX: -1960,
  bermW: 100,
  dirtJumps: [
    { x: -1830, w: 30, h: 26 },
    { x: -1790, w: 30, h: 36 },
    { x: -1750, w: 30, h: 26 },
  ],
  finishX: -1700,
};

// Bike race definitions
export const BIKE_RACES = [
  {
    id: 'race_sprint_skater',
    name: 'Sprint ze Skaterem',
    type: 'sprint' as const,
    startX: -4200,
    endX: -1700,
    opponentId: 'skater',
    opponentSpeed: 5.2,
    timeLimit: 0,
    trickTarget: 0,
    checkpoints: [-3500, -2800, -2100],
    requiredVehicle: ['bike_bmx', 'rollerblades', 'scooter'] as string[],
  },
  {
    id: 'race_timeattack_bmx',
    name: 'BMX Time Attack',
    type: 'timeAttack' as const,
    startX: -2500,
    endX: -1700,
    opponentId: '',
    opponentSpeed: 0,
    timeLimit: 15,
    trickTarget: 0,
    checkpoints: [-2200, -1900],
    requiredVehicle: ['bike_bmx'] as string[],
  },
  {
    id: 'race_tricks_park',
    name: 'Pokaz Trików w Parku',
    type: 'trickChallenge' as const,
    startX: -5800,
    endX: -5000,
    opponentId: '',
    opponentSpeed: 0,
    timeLimit: 30,
    trickTarget: 200,
    checkpoints: [],
    requiredVehicle: ['bike_bmx', 'bike_mountain', 'rollerblades'] as string[],
  },
  {
    id: 'race_sprint_road',
    name: 'Wielki Wyścig Szosowy',
    type: 'sprint' as const,
    startX: 5500,
    endX: 9500,
    opponentId: 'rowerzysta',
    opponentSpeed: 7.0,
    timeLimit: 0,
    trickTarget: 0,
    checkpoints: [6500, 7500, 8500],
    requiredVehicle: ['bike_road', 'bike_mountain'] as string[],
  },
  {
    id: 'race_sprint_osiedle',
    name: 'Wyścig po Osiedlu',
    type: 'sprint' as const,
    startX: 9500,
    endX: 11000,
    opponentId: 'dziecko_osiedle1',
    opponentSpeed: 4.0,
    timeLimit: 0,
    trickTarget: 0,
    checkpoints: [10000, 10500],
    requiredVehicle: ['bike_kid', 'scooter', 'rollerblades'] as string[],
  },
];

// Garage (built into left side of house, narrowed for vestibule)
export const GARAGE = {
  x: -200,
  y: 332,
  w: 200,             // narrowed from 280 — vestibule takes 0-80
  h: 224,
  // Cars inside
  alfaX: -130,        // Alfa Romeo Junior Veloce (black electric)
  tiguanX: -40,       // VW Tiguan Allspace (gray SUV)
  carY: 510,          // car bottom on garage floor
  // Charging station
  chargerX: -180,
  chargerY: 480,
  // Garage door opening (left wall, ground level)
  doorY: 420,         // door top (opening from 420 to groundLevel)
};

// Vestibule / Przedsionek (between garage and kitchen)
export const VESTIBULE = {
  x: 0,
  y: 332,
  w: 80,
  h: 224,
};

// Front garden (between house and street, 7x player width)
export const FRONT_GARDEN = {
  startX: -630,       // from fence to pergola
  endX: -260,
  groundY: 560,
  fenceX: -630,       // fence position
};

// Pergola (black metal frame with ivy, at front door)
export const PERGOLA = {
  x: -260,
  w: 60,              // pergola width
  topY: 370,          // top of pergola
  bottomY: 560,
};

// Garbage bins (LEFT side of house, by the front gate)
export const BINS = {
  x: -640,            // by the gate/fence, left side
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
  // Siostrzyczka quest items
  babyNameCard: '#FFE0B2',
  hospitalItem: '#90CAF9',
  babyDecor: '#F8BBD0',
  craftSupply: '#FFCC80',
  balloon: '#EF5350',

  // Wujek Rafał items
  pierogi: '#F5F0DC',
  ptasieMleczko: '#6D4C41',
  backpack: '#FF7043',

  // Food / meals
  coffee: '#6D4C41',
  milk: '#F5F5F5',
  egg: '#FFF9C4',
  carrot: '#FF7043',
  cream: '#FFF8E1',
  flour: '#EFEBE9',
  gofry: '#D4A574',
  soup: '#FF8A65',
  bread: '#D7A86E',
  cheese: '#FDD835',
  juice: '#FF9800',
  salad: '#66BB6A',

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

  // Antresola / attic
  antresolaWall: '#E8E0D8',
  antresolaFloor: '#C8AD8A',
  // Żabka store
  zabkaGreen: '#00A651',
  zabkaWall: '#F5F0EB',
  // Paczkomat
  paczkomatYellow: '#FFD700',
  paczkomatGray: '#424242',
  // AC unit
  acUnit: '#E0E0E0',
  acUnitDark: '#BDBDBD',
  // Projector
  projectorBody: '#333333',
  projectorScreen: '#FAFAFA',
  projectorLight: '#FFE082',

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
  // Food / meals
  coffee: '☕',
  milk: '🥛',
  egg: '🥚',
  carrot: '🥕',
  cream: '🍦',
  flour: '🌾',
  gofry: '🧇',
  soup: '🍲',
  bread: '🍞',
  cheese: '🧀',
  juice: '🧃',
  salad: '🥗',
  // Żabka / Paczkomat
  chips: '🍿',
  candy: '🍬',
  water: '💧',
  ice_cream: '🍦',
  parcel: '📦',
  popcorn: '🍿',
  // Siostrzyczka quests
  baby_name_card: '📝',
  hospital_item: '👜',
  baby_decor: '🎨',
  craft_supply: '🖍️',
  balloon: '🎈',
  // Generic artifact (overridden by ARTIFACT_EMOJIS per label)
  artifact: '🏅',
};

// Per-quest artifact emoji map (24 unique accessories)
export const ARTIFACT_EMOJIS: Record<string, string> = {
  koszyk: '🧺',
  pudelko: '📦',
  instrukcja: '📖',
  znaczek: '💌',
  fartuszek: '👨‍🍳',
  klebek: '🧶',
  rekawiczki: '🧤',
  smycz: '🦮',
  prezent: '🎁',
  kask: '⛑️',
  nasionka: '🌱',
  mapa: '🗺️',
  blok: '📋',
  tortownica: '🎂',
  pileczka: '🎾',
  pasta: '🪥',
  recznik: '🧻',
  banki: '🫧',
  maskotka: '🌙',
  smoczek: '👶',
  pamiatka: '🏝️',
  filizanka: '☕',
  patelnia: '🍳',
  talerz: '🍽️',
  // ---- Wave 2: 13 for quests without artifacts ----
  gabka: '🧽',
  lina: '🧗',
  metronom: '🎹',
  ramka: '🖼️',
  termos: '🧊',
  lampka: '💡',
  wstazka: '🎀',
  swieczka: '🕯️',
  chochla: '🥄',
  torba: '🛍️',
  nozyczki: '✂️',
  koc: '🛋️',
  spinki: '💈',
  // ---- Wave 2: 17 second artifacts for existing quests ----
  drabina: '🪜',
  robot: '🤖',
  minifigurka: '🦸',
  przepis: '📜',
  dzwonek: '🔔',
  konewka_mala: '🌺',
  obroza: '📿',
  album: '📸',
  plan_budowy: '📐',
  kompas: '🧭',
  paleta: '🎨',
  mikser: '🫗',
  kubeczek: '🥤',
  mydlo_lux: '🛁',
  gryzak: '🦷',
  magnes: '🧲',
  termos_kawa: '♨️',
  // ---- Wave 3: 60 seasonal artifacts (15 per season) ----
  // Wiosna (spring)
  kwiaty_wiosenne: '🌷',
  konewka_ogrod: '🚿',
  ptasie_gniazdo: '🪺',
  biedronka: '🐞',
  motyl_wiosna: '🦋',
  krokus: '🌼',
  deszczowka: '🌧️',
  gumowce: '🥾',
  parasol: '☂️',
  nasiona_wiosna: '🌱',
  bocian: '🦢',
  wiosenna_salatka: '🥗',
  rower_wiosna: '🚲',
  latawiec: '🪁',
  tulipan: '🌹',
  // Lato (summer)
  lody_letnie: '🍦',
  basen: '🏊',
  okulary_sloneczne: '🕶️',
  arbuz: '🍉',
  krem_do_opalania: '🧴',
  zamek_z_piasku: '🏖️',
  lemonada: '🍋',
  plazowa_pilka: '🏐',
  muszla: '🐚',
  raczek: '🦀',
  koktajl: '🧃',
  hamak_lato: '🏝️',
  grill_letni: '🍖',
  wiatrak: '🌀',
  motylki_lato: '🦋',
  // Jesien (autumn)
  dynia: '🎃',
  kastany: '🌰',
  jesienny_lisc: '🍁',
  szalik: '🧣',
  herbata_jesienna: '🍵',
  grzyb: '🍄',
  deszczyk: '🌂',
  jablko_jesien: '🍎',
  wiewiorka: '🐿️',
  swiecka_jesien: '🕯️',
  latarnia: '🏮',
  drozd: '🐦',
  ciasto_jesien: '🥧',
  wrzos: '💐',
  dres_jesienny: '🧥',
  // Zima (winter)
  balwan: '⛄',
  sanki: '🛷',
  choinka: '🎄',
  prezent_zima: '🎁',
  czekolada: '🍫',
  rekawice: '🧤',
  narty: '⛷️',
  gwiazda_zima: '⭐',
  bombka: '🔮',
  piernik: '🍪',
  kozuch: '🧥',
  sniezka: '❄️',
  kominek_zima: '🔥',
  koleda: '🎵',
  renifer: '🦌',
};

// Combo thresholds
export const COMBO = {
  timeout: 3,       // seconds between items to keep combo
  bonusMultiplier: 2,
  rainbowTrailSpeed: 5, // items collected fast = rainbow trail
};
