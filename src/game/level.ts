// ==========================================
// Sąsiedzi na Migdałowej — Level 1 Data
// EXPANDED: 8 quests, new NPCs, new items, math
// ==========================================

import type { LevelData, MathProblem, CostumeItem, Achievement } from './types';
import { GARDEN } from './constants';

// Local constants for climbable references
const GARDEN_TREE_X = GARDEN.treeX;      // 1100
const GARDEN_PLAYHOUSE_X = GARDEN.playhouseX; // 1250

// ---- Math Problems (expanded: 12 problems, 3 difficulty levels) ----
export const MATH_PROBLEMS: MathProblem[] = [
  // Difficulty 1 (age 4-5: simple counting)
  {
    visualIcon: '🍎',
    question: 'Mama wzięła 2 jabłka do ciasta.\nIle jabłek zostało?',
    num1: 5, num2: 2, operation: '-', answer: 3,
    options: [2, 3, 4], hint: '🍎🍎🍎🍎🍎 minus 🍎🍎 = ?', difficulty: 1,
  },
  {
    visualIcon: '🧸',
    question: 'Znalazłeś jeszcze 2 zabawki pod łóżkiem!\nIle masz razem?',
    num1: 4, num2: 2, operation: '+', answer: 6,
    options: [5, 6, 7], hint: '🧸🧸🧸🧸 plus 🧸🧸 = ?', difficulty: 1,
  },
  {
    visualIcon: '🍎',
    question: 'Masz 3 jabłka.\nTata dał ci jeszcze 2. Ile masz?',
    num1: 3, num2: 2, operation: '+', answer: 5,
    options: [4, 5, 6], hint: '🍎🍎🍎 plus 🍎🍎 = ?', difficulty: 1,
  },
  {
    visualIcon: '⭐',
    question: 'Zdobyłeś 2 gwiazdki.\nPotem jeszcze 1. Ile masz?',
    num1: 2, num2: 1, operation: '+', answer: 3,
    options: [2, 3, 4], hint: '⭐⭐ plus ⭐ = ?', difficulty: 1,
  },
  // Difficulty 1 (new)
  {
    visualIcon: '🍪',
    question: 'Mama upiekła 4 ciasteczka.\nZjadłeś 1. Ile zostało?',
    num1: 4, num2: 1, operation: '-', answer: 3,
    options: [2, 3, 4], hint: '🍪🍪🍪🍪 minus 🍪 = ?', difficulty: 1,
  },
  {
    visualIcon: '✉️',
    question: 'Listonosz przyniósł 3 listy.\nPotem jeszcze 2. Ile razem?',
    num1: 3, num2: 2, operation: '+', answer: 5,
    options: [4, 5, 6], hint: '✉️✉️✉️ plus ✉️✉️ = ?', difficulty: 1,
  },
  // Difficulty 2 (age 5-6: bigger numbers)
  {
    visualIcon: '🔴',
    question: 'Masz 4 czerwone klocki LEGO\ni 3 niebieskie. Ile razem?',
    num1: 4, num2: 3, operation: '+', answer: 7,
    options: [6, 7, 8], hint: '🔴🔴🔴🔴 plus 🔵🔵🔵 = ?', difficulty: 2,
  },
  {
    visualIcon: '🌸',
    question: 'W ogrodzie rosło 6 kwiatków.\n2 zwiędły. Ile zostało?',
    num1: 6, num2: 2, operation: '-', answer: 4,
    options: [3, 4, 5], hint: '🌸🌸🌸🌸🌸🌸 minus 🌸🌸 = ?', difficulty: 2,
  },
  {
    visualIcon: '🐕',
    question: 'Jurek ma 3 piłeczki.\nZnalazł jeszcze 4. Ile ma?',
    num1: 3, num2: 4, operation: '+', answer: 7,
    options: [6, 7, 8], hint: '⚾⚾⚾ plus ⚾⚾⚾⚾ = ?', difficulty: 2,
  },
  // Difficulty 2 (new)
  {
    visualIcon: '🍪',
    question: 'Na talerzu było 7 ciasteczek.\nKuba zjadł 3. Ile zostało?',
    num1: 7, num2: 3, operation: '-', answer: 4,
    options: [3, 4, 5], hint: '🍪🍪🍪🍪🍪🍪🍪 minus 🍪🍪🍪 = ?', difficulty: 2,
  },
  // Difficulty 3 (age 6+: intro to multiplication as repeated addition)
  {
    visualIcon: '🧱',
    question: 'Masz 2 wieże z klocków.\nKażda ma 3 klocki. Ile klocków?',
    num1: 2, num2: 3, operation: '×', answer: 6,
    options: [5, 6, 7], hint: '🧱🧱🧱 + 🧱🧱🧱 = ?', difficulty: 3,
  },
  {
    visualIcon: '🍎',
    question: 'W 3 koszyczkach jest po 2 jabłka.\nIle jabłek razem?',
    num1: 3, num2: 2, operation: '×', answer: 6,
    options: [5, 6, 8], hint: '🍎🍎 + 🍎🍎 + 🍎🍎 = ?', difficulty: 3,
  },
  // [10] Courier quest
  {
    visualIcon: '📦',
    question: 'Kurier przyniósł 3 paczki.\nJedną odebrałeś. Ile zostało?',
    num1: 3, num2: 1, operation: '-', answer: 2,
    options: [1, 2, 3], hint: '📦📦📦 minus 📦 = ?', difficulty: 1,
  },
  // [11] Uncle quest
  {
    visualIcon: '📚',
    question: 'Wujek przywiózł 3 książki.\nMasz już 4. Ile razem?',
    num1: 4, num2: 3, operation: '+', answer: 7,
    options: [6, 7, 8], hint: '📚📚📚📚 plus 📚📚📚 = ?', difficulty: 2,
  },
  // [12] Crane quest
  {
    visualIcon: '🔧',
    question: 'Są 4 narzędzia. 2 zaniosłeś.\nIle zostało?',
    num1: 4, num2: 2, operation: '-', answer: 2,
    options: [1, 2, 3], hint: '🔧🔧🔧🔧 minus 🔧🔧 = ?', difficulty: 1,
  },
  // [13] Garden help
  {
    visualIcon: '🌻',
    question: 'Podlałeś 3 grządki.\nZostały jeszcze 2. Ile razem?',
    num1: 3, num2: 2, operation: '+', answer: 5,
    options: [4, 5, 6], hint: '🌻🌻🌻 plus 🌻🌻 = ?', difficulty: 1,
  },
  // [14] Bathroom quest
  {
    visualIcon: '🧹',
    question: 'W łazience było 5 brudnych rzeczy.\nPosprzątałeś 3. Ile zostało?',
    num1: 5, num2: 3, operation: '-', answer: 2,
    options: [1, 2, 3], hint: '🧹🧹🧹🧹🧹 minus 🧹🧹🧹 = ?', difficulty: 1,
  },
  // [15] Climb quest
  {
    visualIcon: '⭐',
    question: 'Na budowie znalazłeś 5 gwiazdek.\n2 wypadły. Ile masz?',
    num1: 5, num2: 2, operation: '-', answer: 3,
    options: [2, 3, 4], hint: '⭐⭐⭐⭐⭐ minus ⭐⭐ = ?', difficulty: 1,
  },
  // [16] Treasure quest
  {
    visualIcon: '🔑',
    question: 'Znalazłeś 4 klucze.\nKażdy otwiera 1 skrzynię. Ile skrzyń?',
    num1: 4, num2: 1, operation: '×', answer: 4,
    options: [3, 4, 5], hint: '🔑 + 🔑 + 🔑 + 🔑 = ?', difficulty: 2,
  },
  // [17] Draw quest
  {
    visualIcon: '🖍️',
    question: 'Masz 4 kredki.\nDokupiono 3. Ile razem?',
    num1: 4, num2: 3, operation: '+', answer: 7,
    options: [6, 7, 8], hint: '🖍️🖍️🖍️🖍️ plus 🖍️🖍️🖍️ = ?', difficulty: 2,
  },
  // [18] Piano quest
  {
    visualIcon: '🎵',
    question: 'Zagrałeś 3 nuty.\nPotem jeszcze 3. Ile razem?',
    num1: 3, num2: 3, operation: '+', answer: 6,
    options: [5, 6, 7], hint: '🎵🎵🎵 plus 🎵🎵🎵 = ?', difficulty: 1,
  },
  // [19] Banana quest
  {
    visualIcon: '🍌',
    question: '3 grupy bananów po 2.\nIle bananów razem?',
    num1: 3, num2: 2, operation: '×', answer: 6,
    options: [5, 6, 7], hint: '🍌🍌 + 🍌🍌 + 🍌🍌 = ?', difficulty: 3,
  },
  // [20] Hide and seek with Franek
  {
    visualIcon: '🐾',
    question: 'Franek schował 3 kości w ogrodzie\ni 2 w domu. Ile razem?',
    num1: 3, num2: 2, operation: '+', answer: 5,
    options: [4, 5, 6], hint: '🦴🦴🦴 plus 🦴🦴 = ?', difficulty: 1,
  },
  // --- HYGIENE QUESTS MATH ---
  // [21] Brush teeth
  {
    visualIcon: '🪥',
    question: 'Myjesz zęby 2 razy dziennie.\nIle razy w 3 dni?',
    num1: 2, num2: 3, operation: '×', answer: 6,
    options: [5, 6, 7], hint: '🪥🪥 + 🪥🪥 + 🪥🪥 = ?', difficulty: 2,
  },
  // [22] Wash hands
  {
    visualIcon: '🧼',
    question: 'Umyłeś ręce 4 razy.\nPotem jeszcze 2. Ile razem?',
    num1: 4, num2: 2, operation: '+', answer: 6,
    options: [5, 6, 7], hint: '🧼🧼🧼🧼 plus 🧼🧼 = ?', difficulty: 1,
  },
  // [23] Bath time
  {
    visualIcon: '🛁',
    question: 'Do kąpieli potrzebujesz 3 rzeczy.\nMasz 1. Ile brakuje?',
    num1: 3, num2: 1, operation: '-', answer: 2,
    options: [1, 2, 3], hint: '🧴🧼🐤 minus 🧴 = ?', difficulty: 1,
  },
  // [24] Comb hair
  {
    visualIcon: '💇',
    question: 'Czesałeś się 3 minuty rano\ni 2 wieczorem. Ile razem?',
    num1: 3, num2: 2, operation: '+', answer: 5,
    options: [4, 5, 6], hint: '3 minuty plus 2 minuty = ?', difficulty: 1,
  },
  // [25] Clean ears
  {
    visualIcon: '👂',
    question: 'Masz 2 uszy.\nKażde wymaga 2 patyczki. Ile patyczków?',
    num1: 2, num2: 2, operation: '×', answer: 4,
    options: [3, 4, 5], hint: '🧹🧹 + 🧹🧹 = ?', difficulty: 2,
  },
  // [26] Pajamas
  {
    visualIcon: '👕',
    question: 'Piżama ma 2 części: górę i dół.\nIle części na 3 dni?',
    num1: 2, num2: 3, operation: '×', answer: 6,
    options: [5, 6, 7], hint: '👕🩳 + 👕🩳 + 👕🩳 = ?', difficulty: 2,
  },
  // --- PREGNANCY QUEST MATH ---
  // [27] Pregnancy
  {
    visualIcon: '👶',
    question: 'Mama czeka 9 miesięcy.\nMinęło 6. Ile zostało?',
    num1: 9, num2: 6, operation: '-', answer: 3,
    options: [2, 3, 4], hint: '9 miesięcy minus 6 = ?', difficulty: 1,
  },
];

// ---- Costumes (unlockable) ----
export const COSTUMES: CostumeItem[] = [
  // Hats — starting + quest rewards
  { id: 'hat_beanie', name: 'Czapka Kuby', slot: 'hat', emoji: '🧢', color: '#2196F3', unlocked: true, unlockedBy: 'start' },
  { id: 'hat_pirate', name: 'Kapelusz pirata', slot: 'hat', emoji: '🏴‍☠️', color: '#333', unlocked: false, unlockedBy: 'quest_apples' },
  { id: 'hat_crown', name: 'Korona króla', slot: 'hat', emoji: '👑', color: '#FFD700', unlocked: false, unlockedBy: 'quest_toys' },
  { id: 'hat_wizard', name: 'Czapka czarodzieja', slot: 'hat', emoji: '🧙', color: '#7B1FA2', unlocked: false, unlockedBy: 'quest_lego' },
  { id: 'hat_cowboy', name: 'Kapelusz kowboja', slot: 'hat', emoji: '🤠', color: '#8D6E63', unlocked: false, unlockedBy: 'quest_cat' },
  { id: 'hat_chef', name: 'Czapka kucharza', slot: 'hat', emoji: '👨‍🍳', color: '#FFFFFF', unlocked: false, unlockedBy: 'quest_cook' },
  // Glasses — starting + quest rewards
  { id: 'glasses_round', name: 'Okulary okrągłe', slot: 'glasses', emoji: '🤓', color: '#795548', unlocked: true, unlockedBy: 'start' },
  { id: 'glasses_cool', name: 'Okulary przeciwsłoneczne', slot: 'glasses', emoji: '😎', color: '#333', unlocked: false, unlockedBy: 'quest_mailman' },
  { id: 'glasses_heart', name: 'Okulary serduszka', slot: 'glasses', emoji: '❤️', color: '#E91E63', unlocked: false, unlockedBy: 'quest_flowers' },
  { id: 'glasses_star', name: 'Okulary gwiazdki', slot: 'glasses', emoji: '⭐', color: '#FFD700', unlocked: false, unlockedBy: 'quest_jurek' },
  // Capes
  { id: 'cape_super', name: 'Peleryna superbohatera', slot: 'cape', emoji: '🦸', color: '#E53935', unlocked: false, unlockedBy: 'achievement_all_quests' },
  { id: 'cape_wizard', name: 'Peleryna czarodzieja', slot: 'cape', emoji: '🧙‍♂️', color: '#7B1FA2', unlocked: false, unlockedBy: 'achievement_math_master' },
  // Accessories — starting + quest rewards
  { id: 'acc_scarf', name: 'Szalik Kuby', slot: 'accessory', emoji: '🧣', color: '#FF5722', unlocked: true, unlockedBy: 'start' },
  { id: 'acc_sword', name: 'Miecz rycerza', slot: 'accessory', emoji: '⚔️', color: '#9E9E9E', unlocked: false, unlockedBy: 'achievement_combo_5' },
  { id: 'acc_wand', name: 'Różdżka magiczna', slot: 'accessory', emoji: '🪄', color: '#CE93D8', unlocked: false, unlockedBy: 'achievement_explorer' },
  { id: 'acc_package', name: 'Torba kuriera', slot: 'accessory', emoji: '📦', color: '#8D6E63', unlocked: false, unlockedBy: 'quest_courier' },
  // Hygiene costumes
  { id: 'hat_shower', name: 'Czepek kąpielowy', slot: 'hat', emoji: '🚿', color: '#80CBC4', unlocked: false, unlockedBy: 'quest_bath' },
  { id: 'glasses_doctor', name: 'Okulary doktora', slot: 'glasses', emoji: '🩺', color: '#42A5F5', unlocked: false, unlockedBy: 'quest_hygiene_master' },
  { id: 'acc_stethoscope', name: 'Stetoskop', slot: 'accessory', emoji: '🩺', color: '#E53935', unlocked: false, unlockedBy: 'quest_wash_hands' },
  // Baby quest costume
  { id: 'hat_baby', name: 'Czapeczka starszego brata', slot: 'hat', emoji: '👶', color: '#F48FB1', unlocked: false, unlockedBy: 'quest_baby' },
];

// ---- Achievements ----
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'achievement_first_quest', title: 'Pierwsze zadanie!', description: 'Ukończ pierwsze zadanie', emoji: '🌟', unlocked: false },
  { id: 'achievement_all_quests', title: 'Mistrz Migdałowej!', description: 'Ukończ wszystkie zadania', emoji: '🏆', unlocked: false, costumeReward: 'cape_super' },
  { id: 'achievement_math_master', title: 'Matematyk!', description: 'Rozwiąż 5 zadań matematycznych', emoji: '🧮', unlocked: false, costumeReward: 'cape_wizard' },
  { id: 'achievement_combo_5', title: 'Combo Master!', description: 'Zbierz 5 przedmiotów z rzędu', emoji: '🔥', unlocked: false, costumeReward: 'acc_sword' },
  { id: 'achievement_explorer', title: 'Odkrywca!', description: 'Odwiedź każdy pokój w domu', emoji: '🗺️', unlocked: false, costumeReward: 'acc_wand' },
  { id: 'achievement_collector', title: 'Kolekcjoner!', description: 'Zbierz 20 przedmiotów', emoji: '💎', unlocked: false },
  { id: 'achievement_helper', title: 'Pomocnik!', description: 'Pomóż mamie i tacie', emoji: '💪', unlocked: false },
  { id: 'achievement_cat_chaser', title: 'Pogromca kotów!', description: 'Przepędź kota z ogrodu', emoji: '🐱', unlocked: false },
];

// ---- Level 1: "Przygody na Migdałowej" (8 quests!) ----
export const LEVEL_1: LevelData = {
  worldWidth: 3200,
  worldHeight: 720,
  playerStart: { x: 480, y: 472 },

  rooms: [
    // === PARTER ===
    { name: 'Garaż', x: -200, y: 332, w: 280, h: 224, bgColor: '#D5D0CB', floorColor: '#A0A0A0', icon: '🚗', bgImageUrl: null },
    { name: 'Kuchnia', x: 80, y: 332, w: 280, h: 224, bgColor: '#F5F0EB', floorColor: '#D5CFC8', icon: '🍳', bgImageUrl: null },
    { name: 'Salon', x: 360, y: 332, w: 320, h: 224, bgColor: '#E8E0D8', floorColor: '#C8AD8A', icon: '🛋️', bgImageUrl: null },
    { name: 'Przedpokój', x: 680, y: 332, w: 200, h: 224, bgColor: '#EDE8E3', floorColor: '#D5CFC8', icon: '🚪', bgImageUrl: null },
    // === PIĘTRO ===
    { name: 'Pokój Kuby', x: 80, y: 110, w: 300, h: 220, bgColor: '#DCEAF8', floorColor: '#C8AD8A', icon: '🧸', bgImageUrl: null },
    { name: 'Hall', x: 380, y: 110, w: 180, h: 220, bgColor: '#E8E3DD', floorColor: '#C8AD8A', icon: '🏠', bgImageUrl: null },
    { name: 'Łazienka', x: 560, y: 110, w: 160, h: 220, bgColor: '#E0F0F8', floorColor: '#CCE8E8', icon: '🚿', bgImageUrl: null },
    { name: 'Sypialnia', x: 720, y: 110, w: 160, h: 220, bgColor: '#E8DAE8', floorColor: '#C8AD8A', icon: '🛏️', bgImageUrl: null },
  ],

  platforms: [
    { x: -600, y: 556, w: 3900, h: 200 },   // ground (extended left for street + right for construction)
    { x: -200, y: 556, w: 280, h: 12 },      // garage floor
    { x: 80, y: 556, w: 800, h: 12 },        // floor 1
    { x: 80, y: 330, w: 800, h: 12 },        // floor 2
    { x: 0, y: 556, w: 80, h: 12 },          // taras
    // Garden platforms (sandbox rim, playhouse platform)
    { x: 990, y: 546, w: 60, h: 10 },        // sandbox edge
    { x: 1240, y: 520, w: 70, h: 10 },       // playhouse floor
    // === CONSTRUCTION SITE ===
    // Building scaffolding platforms (3 floors)
    { x: 1800, y: 466, w: 400, h: 8 },       // scaffold floor 1 (90px jump from ground)
    { x: 1820, y: 370, w: 360, h: 8 },       // scaffold floor 2 (96px jump)
    { x: 1840, y: 274, w: 320, h: 8 },       // scaffold floor 3 (96px jump)
    // Crane mast ladder platforms (climbable)
    { x: 2480, y: 490, w: 40, h: 6 },        // crane step 1
    { x: 2480, y: 424, w: 40, h: 6 },        // crane step 2
    { x: 2480, y: 358, w: 40, h: 6 },        // crane step 3
    { x: 2480, y: 292, w: 40, h: 6 },        // crane step 4
    { x: 2480, y: 226, w: 40, h: 6 },        // crane step 5
    { x: 2480, y: 160, w: 40, h: 6 },        // crane step 6
    { x: 2480, y: 94, w: 40, h: 6 },         // crane step 7
    // Crane jib (horizontal arm at top)
    { x: 2300, y: 76, w: 400, h: 8 },        // crane jib walkway
  ],

  walls: [
    { x: -204, y: 332, w: 8, h: 224 },          // garage left wall
    { x: 76, y: 110, w: 8, h: 310 },            // left house wall (gap at y:420..556 for garage passage)
    { x: 876, y: 110, w: 8, h: 310 },           // right house wall — upper part (above door)
    // Gap at y:420..556 for door to garden (136px gap for 84px tall player)
    { x: 356, y: 332, w: 8, h: 120 },           // kitchen-salon divider (partial)
    { x: 676, y: 332, w: 8, h: 120 },           // salon-hallway divider (partial, gap at bottom for passage)
    { x: 376, y: 110, w: 8, h: 120 },           // kuba room-hall divider (gap y:230-330 = 100px)
    { x: 556, y: 110, w: 8, h: 120 },           // hall-bathroom divider (gap y:230-330 = 100px)
    { x: 716, y: 110, w: 8, h: 120 },           // bathroom-bedroom divider (gap y:230-330 = 100px)
    // === CONSTRUCTION FENCE ===
    // Fence is visual only — no collision walls (player walks through gap freely)
    // The gap (WEJŚCIE sign) is at x:1508-1588 in the renderer
    // Fence is decorative — construction site is open
    // Right world boundary
    { x: 3190, y: 0, w: 10, h: 556 },            // right world boundary
  ],

  stairs: [
    { x: 720, y: 332, w: 56, topY: 330, bottomY: 556 },
  ],

  doors: [
    { x: 870, y: 440, w: 20, h: 116, label: 'Wyjście →' },
  ],

  interactiveObjects: [
    // TV in salon — can be turned on/off
    {
      id: 'tv_salon', type: 'tv' as const,
      x: 440, y: 420, w: 60, h: 40,
      state: false, room: 'salon', label: 'Telewizor', emoji: '📺',
    },
    // Fridge in kitchen — can be opened/closed
    {
      id: 'fridge_kitchen', type: 'fridge' as const,
      x: 310, y: 426, w: 35, h: 130,
      state: false, room: 'kuchnia', label: 'Lodówka', emoji: '🧊',
    },
    // Lamp in sypialnia — can be turned on/off
    {
      id: 'lamp_bedroom', type: 'lamp' as const,
      x: 576, y: 300, w: 18, h: 30,
      state: true, room: 'sypialnia', label: 'Lampka', emoji: '💡',
    },
    // Tap in łazienka — can be turned on/off
    {
      id: 'tap_bathroom', type: 'tap' as const,
      x: 610, y: 270, w: 24, h: 20,
      state: false, room: 'lazienka', label: 'Kran', emoji: '🚿',
    },
    // Piano in pokój Kuby — plays notes
    {
      id: 'piano_jurek', type: 'piano' as const,
      x: 130, y: 310, w: 50, h: 20,
      state: false, room: 'pokojJurka', label: 'Pianinko', emoji: '🎹',
    },
    // Bookshelf in hall — can examine
    {
      id: 'books_hall', type: 'bookshelf' as const,
      x: 400, y: 300, w: 40, h: 30,
      state: false, room: 'hall', label: 'Książki', emoji: '📚',
    },
    // RC Controller in garage — activates RC car!
    {
      id: 'rc_controller', type: 'rc_controller' as const,
      x: -100, y: 520, w: 30, h: 20,
      state: false, room: 'garaz', label: 'Pilot RC', emoji: '🎮',
    },
  ],

  npcs: [
    // Mama Ola - kuchnia (ground floor: y = 556 - 84 = 472)
    {
      id: 'mama', name: 'Mama Ola', x: 200, y: 472, w: 52, h: 84, dir: 1,
      color: '#E74C3C', hairColor: '#5D3A1A', hairLong: true,
      dialogLines: [], questId: 'quest_apples', interactRadius: 90, emote: '❗',
      behavior: 'static', visible: true, animTimer: 0,
    },
    // Tata Seba - sypialnia (upper floor: y = 330 - 84 = 246)
    {
      id: 'tata', name: 'Tata Seba', x: 760, y: 246, w: 52, h: 84, dir: -1,
      color: '#1A1A1A', hairColor: '#2E1A0E', hairLong: false,
      dialogLines: [], questId: 'quest_toys', interactRadius: 90, emote: null,
      behavior: 'static', visible: true, animTimer: 0,
    },
    // Kot Mruczek - patrols garden (cat: w:36, h:36, y = 556 - 36 = 520)
    {
      id: 'kot', name: 'Kot Mruczek', x: 1050, y: 520, w: 36, h: 36, dir: -1,
      color: '#FF8F00', hairColor: '#FF8F00', hairLong: false,
      dialogLines: [], questId: 'quest_cat', interactRadius: 50, emote: '😾',
      behavior: 'patrol', patrolMinX: 950, patrolMaxX: 1200, patrolSpeed: 1.5,
      visible: false, animTimer: 0,
    },
    // Listonosz Pan Marek - appears at door (ground floor: y = 556 - 84 = 472)
    {
      id: 'listonosz', name: 'Pan Marek', x: 860, y: 472, w: 52, h: 84, dir: -1,
      color: '#1565C0', hairColor: '#5D4037', hairLong: false,
      dialogLines: [], questId: 'quest_mailman', interactRadius: 90, emote: '📬',
      behavior: 'static', visible: false, animTimer: 0,
    },
    // Jurek (plush dog NPC: w:32, h:32, y = 556 - 32 = 524)
    {
      id: 'jurek_npc', name: 'Jurek 🐕', x: 300, y: 524, w: 32, h: 32, dir: 1,
      color: '#C8AD8A', hairColor: '#C8AD8A', hairLong: false,
      dialogLines: [], questId: 'quest_jurek', interactRadius: 40, emote: null,
      behavior: 'static', visible: false, animTimer: 0,
    },
    // Franek — biały pies (Japanese Spitz), prawdziwy pies rodziny (dog: w:48, h:42, y = 556 - 42 = 514)
    {
      id: 'franek', name: 'Franek 🐾', x: 1020, y: 514, w: 48, h: 42, dir: 1,
      color: '#FAFAFA', hairColor: '#FAFAFA', hairLong: false,
      dialogLines: [], questId: null, interactRadius: 50, emote: '🐾',
      behavior: 'patrol', patrolMinX: 920, patrolMaxX: 1350, patrolSpeed: 1.2,
      visible: true, animTimer: 0,
    },
    // Wujek Tomek — przyjeżdża BMW 4 Cabrio od lewej (ground floor)
    {
      id: 'wujek', name: 'Wujek Tomek', x: 10, y: 472, w: 52, h: 84, dir: 1,
      color: '#1B5E20', hairColor: '#4E342E', hairLong: false,
      dialogLines: [], questId: 'quest_uncle', interactRadius: 90, emote: '🚗',
      behavior: 'static', visible: false, animTimer: 0,
    },
    // Budowlaniec Jacek — na budowie
    {
      id: 'budowlaniec', name: 'Pan Jacek', x: 1900, y: 472, w: 52, h: 84, dir: -1,
      color: '#FF8F00', hairColor: '#5D4037', hairLong: false,
      dialogLines: [], questId: 'quest_crane', interactRadius: 90, emote: '🏗️',
      behavior: 'static', visible: false, animTimer: 0,
    },
    // Sąsiadka Pani Basia — ogród
    {
      id: 'sasiadka', name: 'Pani Basia', x: 1100, y: 472, w: 52, h: 84, dir: -1,
      color: '#9C27B0', hairColor: '#795548', hairLong: true,
      dialogLines: [], questId: 'quest_garden_help', interactRadius: 90, emote: null,
      behavior: 'static', visible: false, animTimer: 0,
    },
    // === NEW NPCs ===
    // Sąsiad Mirek — gruby lekarz, przychodzi z ulicy (z lewej)
    {
      id: 'mirek', name: 'Pan Mirek', x: -350, y: 472, w: 62, h: 84, dir: 1,
      color: '#FFFFFF', hairColor: '#616161', hairLong: false,
      dialogLines: [], questId: 'quest_wash_hands', interactRadius: 90, emote: '🩺',
      behavior: 'static', visible: false, animTimer: 0,
    },
    // Policjant — przychodzi z ulicy (z lewej) dla quest higieny
    {
      id: 'policjant', name: 'Pan Policjant', x: -400, y: 472, w: 52, h: 84, dir: 1,
      color: '#1A237E', hairColor: '#333333', hairLong: false,
      dialogLines: [], questId: null, interactRadius: 90, emote: '👮',
      behavior: 'static', visible: false, animTimer: 0,
    },
  ],

  items: [
    // ---- Quest: Apples (garden, ground floor ~y:520-530) ----
    { id: 'apple1', type: 'apple', x: 960, y: 520, w: 32, h: 32, questId: 'quest_apples' },
    { id: 'apple2', type: 'apple', x: 1050, y: 500, w: 32, h: 32, questId: 'quest_apples' },
    { id: 'apple3', type: 'apple', x: 1140, y: 520, w: 32, h: 32, questId: 'quest_apples' },
    { id: 'apple4', type: 'apple', x: 1200, y: 495, w: 32, h: 32, questId: 'quest_apples' },
    { id: 'apple5', type: 'apple', x: 1300, y: 520, w: 32, h: 32, questId: 'quest_apples' },

    // ---- Quest: Toys (upper floor ~y:280-290) ----
    { id: 'toy1', type: 'toy_car', x: 120, y: 280, w: 30, h: 30, questId: 'quest_toys' },
    { id: 'toy2', type: 'toy_ball', x: 220, y: 290, w: 28, h: 28, questId: 'quest_toys' },
    { id: 'toy3', type: 'toy_bear', x: 300, y: 285, w: 30, h: 30, questId: 'quest_toys' },
    { id: 'toy4', type: 'toy_block', x: 170, y: 288, w: 26, h: 26, questId: 'quest_toys' },

    // ---- Quest: LEGO Tower (salon, ground floor ~y:525) ----
    { id: 'lego1', type: 'lego_red', x: 400, y: 525, w: 24, h: 24, questId: 'quest_lego', label: 'czerwony' },
    { id: 'lego2', type: 'lego_blue', x: 450, y: 525, w: 24, h: 24, questId: 'quest_lego', label: 'niebieski' },
    { id: 'lego3', type: 'lego_yellow', x: 500, y: 525, w: 24, h: 24, questId: 'quest_lego', label: 'żółty' },
    { id: 'lego4', type: 'lego_red', x: 550, y: 525, w: 24, h: 24, questId: 'quest_lego', label: 'czerwony' },
    { id: 'lego5', type: 'lego_green', x: 420, y: 525, w: 24, h: 24, questId: 'quest_lego', label: 'zielony' },
    { id: 'lego6', type: 'lego_blue', x: 480, y: 525, w: 24, h: 24, questId: 'quest_lego', label: 'niebieski' },

    // ---- Quest: Mailman letters (przedpokój, ground floor ~y:525) ----
    { id: 'letter1', type: 'letter', x: 730, y: 525, w: 26, h: 26, questId: 'quest_mailman' },
    { id: 'letter2', type: 'letter', x: 760, y: 525, w: 26, h: 26, questId: 'quest_mailman' },
    { id: 'letter3', type: 'letter', x: 790, y: 525, w: 26, h: 26, questId: 'quest_mailman' },

    // ---- Quest: Cook (ingredients in kitchen, ground floor ~y:520-530) ----
    { id: 'ing1', type: 'ingredient', x: 120, y: 525, w: 28, h: 28, questId: 'quest_cook' },
    { id: 'ing2', type: 'ingredient', x: 180, y: 520, w: 28, h: 28, questId: 'quest_cook' },
    { id: 'ing3', type: 'ingredient', x: 250, y: 525, w: 28, h: 28, questId: 'quest_cook' },
    { id: 'ing4', type: 'ingredient', x: 300, y: 520, w: 28, h: 28, questId: 'quest_cook' },

    // ---- Quest: Flowers (garden, ground floor ~y:525) ----
    { id: 'flower1', type: 'flower', x: 960, y: 525, w: 24, h: 24, questId: 'quest_flowers' },
    { id: 'flower2', type: 'flower', x: 1010, y: 525, w: 24, h: 24, questId: 'quest_flowers' },
    { id: 'flower3', type: 'flower', x: 1060, y: 525, w: 24, h: 24, questId: 'quest_flowers' },
    { id: 'flower4', type: 'flower', x: 1110, y: 525, w: 24, h: 24, questId: 'quest_flowers' },
    { id: 'flower5', type: 'flower', x: 1160, y: 525, w: 24, h: 24, questId: 'quest_flowers' },

    // ---- Quest: Find Jurek (plushies scattered, upper ~y:285, ground ~y:525) ----
    { id: 'plush1', type: 'plush_dog', x: 420, y: 285, w: 28, h: 28, questId: 'quest_jurek' },
    { id: 'plush2', type: 'plush_panda', x: 600, y: 525, w: 28, h: 28, questId: 'quest_jurek' },
    { id: 'plush3', type: 'plush_rabbit', x: 160, y: 280, w: 28, h: 28, questId: 'quest_jurek' },

    // ---- Quest: Cat chase (cookies as lure, ground ~y:525) ----
    { id: 'cookie1', type: 'cookie', x: 1350, y: 525, w: 26, h: 26, questId: 'quest_cat' },
    { id: 'cookie2', type: 'cookie', x: 1400, y: 525, w: 26, h: 26, questId: 'quest_cat' },
    { id: 'cookie3', type: 'cookie', x: 1450, y: 525, w: 26, h: 26, questId: 'quest_cat' },

    // ---- New items: Bathroom & Garage (free-play collecting) ----
    { id: 'soap1', type: 'ingredient', x: 150, y: 525, w: 24, h: 24, questId: 'quest_cook' },
    { id: 'wrench1', type: 'toy_car', x: 640, y: 525, w: 28, h: 28, questId: 'quest_toys' },

    // ---- Quest: Uncle (books in salon & bedroom) ----
    { id: 'book1', type: 'book', x: 380, y: 525, w: 24, h: 24, questId: 'quest_uncle' },
    { id: 'book2', type: 'book', x: 500, y: 525, w: 24, h: 24, questId: 'quest_uncle' },
    { id: 'book3', type: 'book', x: 760, y: 285, w: 24, h: 24, questId: 'quest_uncle' },

    // ---- Quest: Crane (tools on construction site) ----
    { id: 'tool1', type: 'key', x: 1700, y: 525, w: 24, h: 24, questId: 'quest_crane' },
    { id: 'tool2', type: 'key', x: 1850, y: 525, w: 24, h: 24, questId: 'quest_crane' },
    { id: 'tool3', type: 'key', x: 2000, y: 525, w: 24, h: 24, questId: 'quest_crane' },
    { id: 'tool4', type: 'key', x: 2100, y: 525, w: 24, h: 24, questId: 'quest_crane' },

    // ---- Quest: Garden help (watering cans) ----
    { id: 'water1', type: 'watering_can', x: 950, y: 525, w: 26, h: 26, questId: 'quest_garden_help' },
    { id: 'water2', type: 'watering_can', x: 1050, y: 525, w: 26, h: 26, questId: 'quest_garden_help' },
    { id: 'water3', type: 'watering_can', x: 1150, y: 525, w: 26, h: 26, questId: 'quest_garden_help' },

    // ---- Quest: Clean bathroom (items in bathroom) ----
    { id: 'clean1', type: 'ingredient', x: 580, y: 285, w: 22, h: 22, questId: 'quest_bathroom' },
    { id: 'clean2', type: 'ingredient', x: 640, y: 285, w: 22, h: 22, questId: 'quest_bathroom' },
    { id: 'clean3', type: 'ingredient', x: 700, y: 285, w: 22, h: 22, questId: 'quest_bathroom' },

    // ---- Quest: Stars on crane (stars on scaffold platforms) ----
    { id: 'cstar1', type: 'star', x: 1850, y: 450, w: 28, h: 28, questId: 'quest_climb' },
    { id: 'cstar2', type: 'star', x: 1950, y: 354, w: 28, h: 28, questId: 'quest_climb' },
    { id: 'cstar3', type: 'star', x: 2050, y: 258, w: 28, h: 28, questId: 'quest_climb' },
    { id: 'cstar4', type: 'star', x: 2490, y: 400, w: 28, h: 28, questId: 'quest_climb' },
    { id: 'cstar5', type: 'star', x: 2490, y: 280, w: 28, h: 28, questId: 'quest_climb' },

    // ---- Quest: Treasure hunt (scattered items) ----
    { id: 'treas1', type: 'key', x: 150, y: 285, w: 24, h: 24, questId: 'quest_treasure' },
    { id: 'treas2', type: 'key', x: 550, y: 525, w: 24, h: 24, questId: 'quest_treasure' },
    { id: 'treas3', type: 'key', x: 1300, y: 525, w: 24, h: 24, questId: 'quest_treasure' },
    { id: 'treas4', type: 'key', x: 2200, y: 525, w: 24, h: 24, questId: 'quest_treasure' },

    // ---- Quest: Photo (crayons scattered) ----
    { id: 'crayon1', type: 'crayon', x: 200, y: 285, w: 22, h: 22, questId: 'quest_draw' },
    { id: 'crayon2', type: 'crayon', x: 350, y: 285, w: 22, h: 22, questId: 'quest_draw' },
    { id: 'crayon3', type: 'crayon', x: 450, y: 525, w: 22, h: 22, questId: 'quest_draw' },
    { id: 'crayon4', type: 'crayon', x: 650, y: 525, w: 22, h: 22, questId: 'quest_draw' },

    // ---- Quest: Piano recital (notes in pokój Kuby) ----
    { id: 'note1', type: 'star', x: 100, y: 285, w: 22, h: 22, questId: 'quest_piano' },
    { id: 'note2', type: 'star', x: 250, y: 285, w: 22, h: 22, questId: 'quest_piano' },
    { id: 'note3', type: 'star', x: 350, y: 285, w: 22, h: 22, questId: 'quest_piano' },

    // ---- Quest: Banana cake (bananas in garden) ----
    { id: 'banana1', type: 'banana', x: 970, y: 520, w: 28, h: 28, questId: 'quest_banana' },
    { id: 'banana2', type: 'banana', x: 1080, y: 520, w: 28, h: 28, questId: 'quest_banana' },
    { id: 'banana3', type: 'banana', x: 1200, y: 520, w: 28, h: 28, questId: 'quest_banana' },
    { id: 'banana4', type: 'banana', x: 1320, y: 520, w: 28, h: 28, questId: 'quest_banana' },

    // ---- HYGIENE QUEST ITEMS ----
    // Quest: Brush teeth (toothbrushes in bathroom + bedroom)
    { id: 'tb1', type: 'toothbrush', x: 590, y: 285, w: 22, h: 22, questId: 'quest_brush_teeth' },
    { id: 'tb2', type: 'toothbrush', x: 660, y: 285, w: 22, h: 22, questId: 'quest_brush_teeth' },
    { id: 'tb3', type: 'toothbrush', x: 130, y: 285, w: 22, h: 22, questId: 'quest_brush_teeth' },

    // Quest: Wash hands (soap in kitchen + bathroom)
    { id: 'soap1_h', type: 'soap', x: 120, y: 525, w: 22, h: 22, questId: 'quest_wash_hands' },
    { id: 'soap2_h', type: 'soap', x: 620, y: 285, w: 22, h: 22, questId: 'quest_wash_hands' },
    { id: 'soap3_h', type: 'soap', x: 200, y: 525, w: 22, h: 22, questId: 'quest_wash_hands' },

    // Quest: Bath time (rubber ducks + shampoo in bathroom)
    { id: 'duck1', type: 'rubber_duck', x: 580, y: 280, w: 24, h: 24, questId: 'quest_bath' },
    { id: 'duck2', type: 'rubber_duck', x: 650, y: 280, w: 24, h: 24, questId: 'quest_bath' },
    { id: 'shamp1', type: 'shampoo', x: 700, y: 285, w: 22, h: 22, questId: 'quest_bath' },

    // Quest: Comb hair (combs scattered in house)
    { id: 'comb1', type: 'comb', x: 760, y: 285, w: 20, h: 20, questId: 'quest_comb_hair' },
    { id: 'comb2', type: 'comb', x: 420, y: 525, w: 20, h: 20, questId: 'quest_comb_hair' },
    { id: 'comb3', type: 'comb', x: 250, y: 285, w: 20, h: 20, questId: 'quest_comb_hair' },

    // Quest: Pajamas (pajama parts in bedroom + pokój Kuby)
    { id: 'pj1', type: 'pajama', x: 740, y: 285, w: 24, h: 24, questId: 'quest_pajamas' },
    { id: 'pj2', type: 'pajama', x: 160, y: 285, w: 24, h: 24, questId: 'quest_pajamas' },
    { id: 'pj3', type: 'pajama', x: 300, y: 285, w: 24, h: 24, questId: 'quest_pajamas' },

    // ---- PREGNANCY QUEST ITEMS ----
    { id: 'baby1', type: 'baby_toy', x: 400, y: 525, w: 26, h: 26, questId: 'quest_baby' },
    { id: 'baby2', type: 'baby_bottle', x: 500, y: 525, w: 26, h: 26, questId: 'quest_baby' },
    { id: 'baby3', type: 'baby_blanket', x: 750, y: 285, w: 26, h: 26, questId: 'quest_baby' },
    { id: 'baby4', type: 'baby_toy', x: 200, y: 285, w: 26, h: 26, questId: 'quest_baby' },
  ],

  quests: [
    // Quest 1: Zbierz jabłka
    {
      id: 'quest_apples', title: '🍎 Zbierz jabłka!', npcId: 'mama',
      steps: [
        { type: 'talk', description: 'Porozmawiaj z Mamą', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 5 jabłek w ogrodzie', icon: '🍎', itemType: 'apple', targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś jabłka Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Rozwiąż zadanie!', icon: '🧮', mathProblem: MATH_PROBLEMS[0], completed: false },
      ],
      currentStep: 0, completed: false, active: true, reward: 1, costumeReward: 'hat_pirate',
    },
    // Quest 2: Posprzątaj pokój
    {
      id: 'quest_toys', title: '🧸 Posprzątaj pokój!', npcId: 'tata',
      steps: [
        { type: 'talk', description: 'Porozmawiaj z Tatą', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 zabawki w pokoju', icon: '🧸', targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Taty', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Rozwiąż zadanie!', icon: '🧮', mathProblem: MATH_PROBLEMS[1], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1, costumeReward: 'hat_crown',
    },
    // Quest 3: Zbuduj wieżę z LEGO
    {
      id: 'quest_lego', title: '🧱 Zbuduj wieżę z LEGO!', npcId: 'tata',
      steps: [
        { type: 'talk', description: 'Porozmawiaj z Tatą', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 6 klocków LEGO', icon: '🧱', targetCount: 6, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Taty z klockami', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Policz klocki!', icon: '🧮', mathProblem: MATH_PROBLEMS[6], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, costumeReward: 'hat_wizard',
    },
    // Quest 4: Przepędź kota
    {
      id: 'quest_cat', title: '🐱 Przepędź kota!', npcId: 'mama',
      steps: [
        { type: 'talk', description: 'Mama mówi o kocie w ogrodzie', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 ciasteczka na przynętę', icon: '🍪', itemType: 'cookie', targetCount: 3, currentCount: 0, completed: false },
        { type: 'chase', description: 'Podejdź do kota — ucieknie!', icon: '🐱', targetNpcId: 'kot', completed: false },
        { type: 'deliver', description: 'Wróć do Mamy', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Zagadka o ciasteczkach!', icon: '🧮', mathProblem: MATH_PROBLEMS[4], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, costumeReward: 'hat_cowboy',
    },
    // Quest 5: Listonosz
    {
      id: 'quest_mailman', title: '📬 Otwórz listonoszowi!', npcId: 'listonosz',
      steps: [
        { type: 'talk', description: 'Otwórz drzwi listonoszowi', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 listy w przedpokoju', icon: '✉️', itemType: 'letter', targetCount: 3, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś listy Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Policz listy!', icon: '🧮', mathProblem: MATH_PROBLEMS[5], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1, costumeReward: 'glasses_cool',
    },
    // Quest 6: Pomóż mamie gotować
    {
      id: 'quest_cook', title: '🍳 Pomóż mamie gotować!', npcId: 'mama',
      steps: [
        { type: 'talk', description: 'Mama potrzebuje składników!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 składniki w kuchni', icon: '🥕', itemType: 'ingredient', targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Daj składniki Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile składników razem?', icon: '🧮', mathProblem: MATH_PROBLEMS[9], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, costumeReward: 'hat_chef',
    },
    // Quest 7: Podlej kwiatki
    {
      id: 'quest_flowers', title: '🌸 Podlej kwiatki!', npcId: 'mama',
      steps: [
        { type: 'talk', description: 'Mama prosi o podlanie kwiatów', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 5 kwiatków w ogrodzie', icon: '🌸', itemType: 'flower', targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Mamy', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile kwiatków zostało?', icon: '🧮', mathProblem: MATH_PROBLEMS[7], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1, costumeReward: 'glasses_heart',
    },
    // Quest 8: Znajdź Jurka (plush dog hide and seek)
    {
      id: 'quest_jurek', title: '🐕 Znajdź Jurka!', npcId: 'tata',
      steps: [
        { type: 'talk', description: 'Tata mówi: Jurek się schował!', icon: '💬', completed: false },
        { type: 'collect', description: 'Znajdź 3 pluszaki w domu', icon: '🐕', targetCount: 3, currentCount: 0, completed: false },
        { type: 'find', description: 'Znajdź Jurka!', icon: '🐕', targetNpcId: 'jurek_npc', completed: false },
        { type: 'deliver', description: 'Zanieś Jurka do Taty', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile pluszaków znalazłeś?', icon: '🧮', mathProblem: MATH_PROBLEMS[8], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, costumeReward: 'glasses_star',
    },
    // Quest 9: Kurier — paczka od kuriera
    {
      id: 'quest_courier', title: '📦 Paczka od kuriera!', npcId: 'mama',
      steps: [
        { type: 'talk', description: 'Mama czeka na paczkę', icon: '💬', completed: false },
        { type: 'collect', description: 'Idź do ogródka — kurier zadzwoni!', icon: '📦', targetCount: 1, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś paczkę Mamie!', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Zagadka o paczkach!', icon: '🧮', mathProblem: MATH_PROBLEMS[12], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, costumeReward: 'acc_package',
    },
    // === 10 NEW QUESTS ===
    // Quest 10: Wujek Tomek (BMW 4 Cabrio from left)
    {
      id: 'quest_uncle', title: '🚗 Wujek przyjechał!', npcId: 'wujek',
      steps: [
        { type: 'talk', description: 'Powitaj Wujka Tomka', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 książki od wujka', icon: '📚', itemType: 'book', targetCount: 3, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś książki Tacie', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Zagadka o książkach!', icon: '🧮', mathProblem: MATH_PROBLEMS[13], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest 11: Budowlaniec (construction site)
    {
      id: 'quest_crane', title: '🏗️ Pomóż na budowie!', npcId: 'budowlaniec',
      steps: [
        { type: 'talk', description: 'Porozmawiaj z Panem Jackiem', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 narzędzia na budowie', icon: '🔧', itemType: 'key', targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś narzędzia Panu Jackowi', icon: '🏃', targetNpcId: 'budowlaniec', completed: false },
        { type: 'math', description: 'Policz narzędzia!', icon: '🧮', mathProblem: MATH_PROBLEMS[14], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest 12: Pomóż sąsiadce w ogrodzie
    {
      id: 'quest_garden_help', title: '🌻 Pomóż Pani Basi!', npcId: 'sasiadka',
      steps: [
        { type: 'talk', description: 'Pani Basia potrzebuje pomocy', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 konewki w ogrodzie', icon: '🚿', itemType: 'watering_can', targetCount: 3, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś konewki Pani Basi', icon: '🏃', targetNpcId: 'sasiadka', completed: false },
        { type: 'math', description: 'Ile grządek podlałeś?', icon: '🧮', mathProblem: MATH_PROBLEMS[15], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1,
    },
    // Quest 13: Sprzątanie łazienki
    {
      id: 'quest_bathroom', title: '🧹 Posprzątaj łazienkę!', npcId: 'mama',
      steps: [
        { type: 'talk', description: 'Mama prosi o pomoc', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 rzeczy w łazience', icon: '🧹', itemType: 'ingredient', targetCount: 3, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Powiedz Mamie że gotowe', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile zostało brudnych?', icon: '🧮', mathProblem: MATH_PROBLEMS[16], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1,
    },
    // Quest 14: Wspinaczka — gwiazdki na budowie
    {
      id: 'quest_climb', title: '⭐ Gwiazdki na budowie!', npcId: 'budowlaniec',
      steps: [
        { type: 'talk', description: 'Pan Jacek widział gwiazdki', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 5 gwiazdek na rusztowaniach', icon: '⭐', itemType: 'star', targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Pana Jacka', icon: '🏃', targetNpcId: 'budowlaniec', completed: false },
        { type: 'math', description: 'Ile gwiazdek znalazłeś?', icon: '🧮', mathProblem: MATH_PROBLEMS[17], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest 15: Poszukiwanie skarbów
    {
      id: 'quest_treasure', title: '🔑 Poszukiwanie skarbów!', npcId: 'tata',
      steps: [
        { type: 'talk', description: 'Tata ukrył skarby po świecie!', icon: '💬', completed: false },
        { type: 'collect', description: 'Znajdź 4 klucze', icon: '🔑', itemType: 'key', targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Taty z kluczami', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile skrzyń otworzysz?', icon: '🧮', mathProblem: MATH_PROBLEMS[18], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest 16: Narysuj obrazek
    {
      id: 'quest_draw', title: '🖍️ Narysuj obrazek!', npcId: 'mama',
      steps: [
        { type: 'talk', description: 'Mama chce obrazek na lodówkę!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 kredki', icon: '🖍️', itemType: 'crayon', targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś rysunek Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile kredek użyłeś?', icon: '🧮', mathProblem: MATH_PROBLEMS[19], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1,
    },
    // Quest 17: Koncert na pianinie
    {
      id: 'quest_piano', title: '🎹 Koncert dla rodziny!', npcId: 'tata',
      steps: [
        { type: 'talk', description: 'Tata chce posłuchać koncertu', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 nuty w pokoju Kuby', icon: '🎵', itemType: 'star', targetCount: 3, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zagraj koncert dla Taty', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile nut zagrałeś?', icon: '🧮', mathProblem: MATH_PROBLEMS[20], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1,
    },
    // Quest 18: Tort bananowy
    {
      id: 'quest_banana', title: '🍌 Tort bananowy!', npcId: 'mama',
      steps: [
        { type: 'talk', description: 'Mama robi tort bananowy!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 banany w ogrodzie', icon: '🍌', itemType: 'banana', targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś banany Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile bananów potrzeba?', icon: '🧮', mathProblem: MATH_PROBLEMS[21], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest 19: Zabawa z Frankiem
    {
      id: 'quest_franek', title: '🐾 Zabawa z Frankiem!', npcId: 'mama',
      steps: [
        { type: 'talk', description: 'Mama mówi: Franek chce się bawić!', icon: '💬', completed: false },
        { type: 'chase', description: 'Dogoni Franka!', icon: '🐾', targetNpcId: 'franek', completed: false },
        { type: 'deliver', description: 'Wróć do Mamy', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile kości ukrył Franek?', icon: '🧮', mathProblem: MATH_PROBLEMS[22], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1,
    },

    // === HYGIENE QUESTS (6) ===
    // Quest 20: Mycie zębów
    {
      id: 'quest_brush_teeth', title: '🪥 Umyj ząbki!', npcId: 'mama',
      steps: [
        { type: 'talk', description: 'Mama mówi: pora na mycie zębów!', icon: '💬', completed: false },
        { type: 'collect', description: 'Znajdź 3 szczoteczki w domu', icon: '🪥', itemType: 'toothbrush', targetCount: 3, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Mamy i pokaż zęby!', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Zagadka o zębach!', icon: '🧮', mathProblem: MATH_PROBLEMS[23], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1,
    },
    // Quest 21: Mycie rąk (Mirek - lekarz sąsiad uczy higieny)
    {
      id: 'quest_wash_hands', title: '🧼 Umyj rączki!', npcId: 'mirek',
      steps: [
        { type: 'talk', description: 'Pan Mirek uczy o myciu rąk!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 mydełka', icon: '🧼', itemType: 'soap', targetCount: 3, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Pokaż Panu Mirkowi czyste ręce', icon: '🏃', targetNpcId: 'mirek', completed: false },
        { type: 'math', description: 'Ile razy umyłeś ręce?', icon: '🧮', mathProblem: MATH_PROBLEMS[24], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, costumeReward: 'acc_stethoscope',
    },
    // Quest 22: Kąpiel
    {
      id: 'quest_bath', title: '🛁 Pora na kąpiel!', npcId: 'mama',
      steps: [
        { type: 'talk', description: 'Mama mówi: kąpielowe przygody!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz kaczuszki i szampon', icon: '🐤', targetCount: 3, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Mamy — pora do wanny!', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Zagadka kąpielowa!', icon: '🧮', mathProblem: MATH_PROBLEMS[25], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1, costumeReward: 'hat_shower',
    },
    // Quest 23: Czesanie
    {
      id: 'quest_comb_hair', title: '💇 Uczesz się!', npcId: 'mama',
      steps: [
        { type: 'talk', description: 'Mama mówi: włosy do czesania!', icon: '💬', completed: false },
        { type: 'collect', description: 'Znajdź 3 grzebienie', icon: '💇', itemType: 'comb', targetCount: 3, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Pokaż Mamie ładną fryzurę', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Zagadka o czesaniu!', icon: '🧮', mathProblem: MATH_PROBLEMS[26], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1,
    },
    // Quest 24: Piżama
    {
      id: 'quest_pajamas', title: '👕 Ubierz piżamę!', npcId: 'tata',
      steps: [
        { type: 'talk', description: 'Tata mówi: pora na piżamę!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 części piżamy', icon: '👕', itemType: 'pajama', targetCount: 3, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Pokaż Tacie gotowego do snu!', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile części ma piżama?', icon: '🧮', mathProblem: MATH_PROBLEMS[28], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1,
    },
    // Quest 25: Mistrz higieny (meta quest — after completing hygiene quests)
    {
      id: 'quest_hygiene_master', title: '🏆 Mistrz higieny!', npcId: 'mirek',
      steps: [
        { type: 'talk', description: 'Pan Mirek ma specjalną nagrodę!', icon: '💬', completed: false },
        { type: 'deliver', description: 'Opowiedz o higienie!', icon: '🏃', targetNpcId: 'mirek', completed: false },
        { type: 'math', description: 'Zagadka o czystych uszkach!', icon: '🧮', mathProblem: MATH_PROBLEMS[27], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 3, costumeReward: 'glasses_doctor',
    },

    // === PREGNANCY STORY QUEST ===
    // Quest 26: Braciszek/siostrzyczka
    {
      id: 'quest_baby', title: '👶 Braciszek nadchodzi!', npcId: 'mama',
      steps: [
        { type: 'talk', description: 'Mama ma ważną wiadomość!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 rzeczy dla dzidzi', icon: '🍼', targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś wszystko Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile miesięcy do przyjścia dzidzi?', icon: '🧮', mathProblem: MATH_PROBLEMS[29], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 3, costumeReward: 'hat_baby',
    },
  ],

  costumes: COSTUMES,
  achievements: ACHIEVEMENTS,

  climbables: [
    // Apple tree trunk (garden)
    { x: GARDEN_TREE_X - 12, y: 560, w: 24, topY: 380, bottomY: 560, label: 'Jabłoń', emoji: '🌳' },
    // Construction crane mast
    { x: 2480, y: 556, w: 40, topY: 80, bottomY: 556, label: 'Dźwig', emoji: '🏗️' },
    // Playhouse pole (garden)
    { x: GARDEN_PLAYHOUSE_X - 5, y: 560, w: 10, topY: 480, bottomY: 560, label: 'Domek', emoji: '🏠' },
    // Fence post (garden) — can climb over fence
    { x: 1380, y: 560, w: 10, topY: 470, bottomY: 560, label: 'Słupek', emoji: '🪵' },
  ],
};

// ---- NPC Dialog System (expanded for 8 quests) ----
export function getNpcDialog(npcId: string, questId: string, stepIndex: number): string[] {
  // Quest 1: Apples
  if (npcId === 'mama' && questId === 'quest_apples') {
    if (stepIndex === 0) return ['Dzień dobry, Kuba! ☀️', 'Pomożesz mi? Potrzebuję jabłek!', 'Idź do ogrodu i zbierz 5 jabłek 🍎', 'Uważaj, są rozrzucone po trawie!'];
    if (stepIndex === 2) return ['Brawo! Masz wszystkie jabłka! 🎉', 'A teraz zagadka...'];
    return ['Zbierz jabłka z ogrodu! 🍎'];
  }

  // Quest 2: Toys
  if (npcId === 'tata' && questId === 'quest_toys') {
    if (stepIndex === 0) return ['Hej Kuba! 👋', 'W twoim pokoju bałagan!', 'Zbierz 4 zabawki z podłogi 🧸', 'Pokażesz, że potrafisz!'];
    if (stepIndex === 2) return ['Super! Pokój czysty! ✨', 'Mam dla ciebie zadanie...'];
    return ['Posprzątaj zabawki w pokoju! 🧸'];
  }

  // Quest 3: LEGO
  if (npcId === 'tata' && questId === 'quest_lego') {
    if (stepIndex === 0) return ['Kuba, zbudujemy wieżę! 🏗️', 'Zbierz 6 klocków LEGO z salonu!', 'Są w różnych kolorach — zbierz wszystkie! 🧱'];
    if (stepIndex === 2) return ['Ale dużo klocków! 🤩', 'Policzmy je razem...'];
    return ['Szukaj klocków LEGO! 🧱'];
  }

  // Quest 4: Cat
  if (npcId === 'mama' && questId === 'quest_cat') {
    if (stepIndex === 0) return ['Kuba! 😮', 'Kot Mruczek wszedł do ogrodu!', 'Weź ciasteczka i zwab go dalej 🍪', 'Potem podejdź blisko — ucieknie!'];
    if (stepIndex === 3) return ['Brawo! Kot uciekł! 🐱💨', 'A teraz zagadka o ciasteczkach...'];
    return ['Przepędź kota z ogrodu! 🐱'];
  }

  // Quest 5: Mailman
  if (npcId === 'listonosz' && questId === 'quest_mailman') {
    if (stepIndex === 0) return ['Dzień dobry! 📮', 'Jestem listonosz Pan Marek!', 'Mam 3 listy dla waszej rodziny ✉️', 'Zbierz je i zanieś Mamie!'];
    return ['Zbierz listy w przedpokoju! ✉️'];
  }
  if (npcId === 'mama' && questId === 'quest_mailman') {
    if (stepIndex === 2) return ['Och, listy! Dziękuję Kuba! 💌', 'Policzmy je razem...'];
    return ['Zanieś listy Mamie! ✉️'];
  }

  // Quest 6: Cook
  if (npcId === 'mama' && questId === 'quest_cook') {
    if (stepIndex === 0) return ['Kuba, będziemy gotować! 👨‍🍳', 'Potrzebuję 4 składników z kuchni!', 'Marchewkę, ziemniaka, cebulę i pomidora 🥕', 'Pomożesz mi je znaleźć?'];
    if (stepIndex === 2) return ['Wszystko mamy! Zaczynamy! 🍲', 'Ale najpierw policzmy...'];
    return ['Zbierz składniki w kuchni! 🥕'];
  }

  // Quest 7: Flowers
  if (npcId === 'mama' && questId === 'quest_flowers') {
    if (stepIndex === 0) return ['Kuba, kwiatki w ogrodzie chcą pić! 🌸', 'Zbierz 5 kwiatków do wazonu!', 'Są przy płocie w ogrodzie 🌺'];
    if (stepIndex === 2) return ['Piękne kwiatki! 💐', 'A teraz zagadka...'];
    return ['Zbierz kwiatki w ogrodzie! 🌸'];
  }

  // Quest 8: Jurek
  if (npcId === 'tata' && questId === 'quest_jurek') {
    if (stepIndex === 0) return ['Kuba, Jurek się schował! 🐕', 'Trzeba go znaleźć!', 'Szukaj pluszaków po domu — Jurek jest między nimi!', 'Jak zbierzesz pluszaki, znajdź prawdziwego Jurka!'];
    if (stepIndex === 3) return ['Znalazłeś Jurka! 🐕❤️', 'A teraz zagadka...'];
    return ['Szukaj pluszaków i Jurka! 🐕'];
  }
  if (npcId === 'jurek_npc') {
    return ['Hau hau! 🐕❤️', 'Jurek cię znalazł! Albo ty jego? 😄'];
  }

  // Quest 9: Courier
  if (npcId === 'mama' && questId === 'quest_courier') {
    if (stepIndex === 0) return ['Kuba! 📦', 'Czekam na paczkę od kuriera!', 'Idź pobaw się w ogródku...', 'Jak usłyszysz dzwonek — leć do drzwi! 🔔'];
    if (stepIndex === 2) return ['Masz paczkę! Dziękuję Kuba! 📦💕', 'Widzę, że to moje zamówienie!', 'A teraz zagadka...'];
    return ['Czekamy na kuriera! 📦'];
  }

  // Quest 10: Uncle (Wujek Tomek)
  if (npcId === 'wujek' && questId === 'quest_uncle') {
    if (stepIndex === 0) return ['Cześć Kuba! 🚗', 'Wujek Tomek przyjechał!', 'Przywiozłem ci 3 książki do czytania! 📚', 'Poszukaj ich w domu!'];
    return ['Szukaj książek od wujka! 📚'];
  }
  if (npcId === 'tata' && questId === 'quest_uncle') {
    if (stepIndex === 2) return ['Książki od wujka! Super! 📚', 'A teraz zagadka...'];
    return ['Zanieś książki Tacie! 📚'];
  }

  // Quest 11: Crane (Budowlaniec)
  if (npcId === 'budowlaniec' && questId === 'quest_crane') {
    if (stepIndex === 0) return ['Hej mały! 🏗️', 'Jestem Pan Jacek, budowniczy!', 'Zgubiłem 4 narzędzia na budowie 🔧', 'Pomożesz mi je znaleźć?'];
    if (stepIndex === 2) return ['Wszystkie narzędzia! Dzięki! 🛠️', 'A teraz policzmy je...'];
    return ['Szukaj narzędzi na budowie! 🔧'];
  }

  // Quest 12: Garden help (Sąsiadka)
  if (npcId === 'sasiadka' && questId === 'quest_garden_help') {
    if (stepIndex === 0) return ['Dzień dobry Kuba! 🌻', 'Jestem Pani Basia, sąsiadka!', 'Potrzebuję 3 konewek do podlania grządek 🚿', 'Leżą gdzieś w ogrodzie...'];
    if (stepIndex === 2) return ['Pięknie! Grządki podlane! 🌻', 'Ile grządek podlaliśmy?'];
    return ['Zbierz konewki w ogrodzie! 🚿'];
  }

  // Quest 13: Bathroom
  if (npcId === 'mama' && questId === 'quest_bathroom') {
    if (stepIndex === 0) return ['Kuba! 🧹', 'Łazienka potrzebuje sprzątania!', 'Zbierz 3 rzeczy do posprzątania!', 'Są rozrzucone po łazience!'];
    if (stepIndex === 2) return ['Łazienka lśni! Brawo! ✨', 'A ile było brudnych rzeczy?'];
    return ['Posprzątaj łazienkę! 🧹'];
  }

  // Quest 14: Climb (stars on construction)
  if (npcId === 'budowlaniec' && questId === 'quest_climb') {
    if (stepIndex === 0) return ['Hej Kuba! ⭐', 'Widziałem gwiazdki na rusztowaniach!', 'Zbierz 5 gwiazdek — wspinaj się wyżej! 🏗️', 'Uważaj na siebie!'];
    if (stepIndex === 2) return ['Ale odważny! Wszystkie gwiazdki! ⭐', 'Policzmy je...'];
    return ['Wspinaj się i zbieraj gwiazdki! ⭐'];
  }

  // Quest 15: Treasure hunt
  if (npcId === 'tata' && questId === 'quest_treasure') {
    if (stepIndex === 0) return ['Kuba, mam niespodziankę! 🔑', 'Ukryłem 4 klucze po całym świecie!', 'Jeden w domu, jeden w ogrodzie...', 'A reszta? Musisz poszukać! 🗝️'];
    if (stepIndex === 2) return ['Wszystkie klucze znalezione! 🎉', 'Ile skrzyń otworzysz?'];
    return ['Szukaj kluczy po świecie! 🔑'];
  }

  // Quest 16: Draw
  if (npcId === 'mama' && questId === 'quest_draw') {
    if (stepIndex === 0) return ['Kuba! 🖍️', 'Narysuj mi piękny obrazek!', 'Potrzebujesz 4 kredki — rozrzuciły się!', 'Poszukaj po domu! 🎨'];
    if (stepIndex === 2) return ['Ale piękny rysunek! 🖼️', 'Ile kredek użyłeś?'];
    return ['Zbierz kredki! 🖍️'];
  }

  // Quest 17: Piano
  if (npcId === 'tata' && questId === 'quest_piano') {
    if (stepIndex === 0) return ['Kuba, zagraj mi koncert! 🎹', 'Nuty się rozrzuciły po pokoju!', 'Zbierz 3 nuty i zagraj! 🎵'];
    if (stepIndex === 2) return ['Piękny koncert! Brawo! 🎶', 'Ile nut zagrałeś?'];
    return ['Zbierz nuty w pokoju! 🎵'];
  }

  // Quest 18: Banana cake
  if (npcId === 'mama' && questId === 'quest_banana') {
    if (stepIndex === 0) return ['Kuba! 🍌', 'Robimy tort bananowy!', 'Zbierz 4 banany w ogrodzie!', 'Rosną przy drzewkach! 🌳'];
    if (stepIndex === 2) return ['Banany są! Tort będzie pyszny! 🎂', 'Ile bananów potrzeba?'];
    return ['Zbierz banany! 🍌'];
  }

  // Quest 19: Play with Franek
  if (npcId === 'mama' && questId === 'quest_franek') {
    if (stepIndex === 0) return ['Kuba! 🐾', 'Franek chce się bawić!', 'Dogoni go w ogrodzie! 🐕', 'Biega szybko, ale dasz radę!'];
    if (stepIndex === 2) return ['Złapałeś Franka! 🐾❤️', 'Ile kości ukrył?'];
    return ['Dogoni Franka! 🐾'];
  }

  // Kot (when chased)
  if (npcId === 'kot') {
    return ['Miau! 😾', '...kot ucieka!'];
  }

  // === HYGIENE QUESTS DIALOG ===

  // Quest 20: Brush teeth
  if (npcId === 'mama' && questId === 'quest_brush_teeth') {
    if (stepIndex === 0) return ['Kuba! 🪥', 'Pora umyć ząbki!', 'Znajdź szczoteczki — rozrzuciły się!', 'Pamiętaj: myj górę i dół! ✨'];
    if (stepIndex === 2) return ['Ale piękne ząbki! 😁✨', 'Teraz zagadka!'];
    return ['Myj ząbki rano i wieczorem! 🪥'];
  }

  // Quest 21: Wash hands (Mirek — sąsiad lekarz)
  if (npcId === 'mirek' && questId === 'quest_wash_hands') {
    if (stepIndex === 0) return ['Cześć Kuba! 🩺', 'Jestem Pan Mirek, lekarz!', 'Wiesz, że mycie rąk chroni przed zarazkami?', 'Zbierz mydełka — pokażę ci jak! 🧼'];
    if (stepIndex === 2) return ['Czyściutkie rączki! Brawo! 🧼✨', 'Pamiętaj: przed jedzeniem ZAWSZE myj ręce!', 'A teraz zagadka...'];
    return ['Zbierz mydełka! 🧼'];
  }

  // Quest 22: Bath time
  if (npcId === 'mama' && questId === 'quest_bath') {
    if (stepIndex === 0) return ['Kuba! 🛁', 'Pora na kąpiel!', 'Znajdź kaczuszki i szampon!', 'Kąpiel może być super zabawą! 🐤'];
    if (stepIndex === 2) return ['Mamy wszystko do kąpieli! 🛁💦', 'Do wanny! Ale najpierw zagadka...'];
    return ['Znajdź kaczuszki do kąpieli! 🐤'];
  }

  // Quest 23: Comb hair
  if (npcId === 'mama' && questId === 'quest_comb_hair') {
    if (stepIndex === 0) return ['Kuba, twoje włosy! 💇', 'Wyglądają jak jeż! 🦔', 'Znajdź grzebienie po domu!', 'Ładna fryzura to podstawa! ✨'];
    if (stepIndex === 2) return ['Ale elegancki! 😎', 'Zagadka o czesaniu...'];
    return ['Znajdź grzebienie! 💇'];
  }

  // Quest 24: Pajamas
  if (npcId === 'tata' && questId === 'quest_pajamas') {
    if (stepIndex === 0) return ['Kuba, pora na piżamę! 👕', 'Trzeba się przebrać na noc!', 'Części piżamy się rozrzuciły!', 'Góra, dół i skarpetki! 🧦'];
    if (stepIndex === 2) return ['Gotowy do snu! 😴', 'Ale najpierw zagadka!'];
    return ['Zbierz piżamę! 👕'];
  }

  // Quest 25: Hygiene master
  if (npcId === 'mirek' && questId === 'quest_hygiene_master') {
    if (stepIndex === 0) return ['Kuba! 🏆', 'Słyszałem, że dbasz o higienę!', 'Ząbki, rączki, kąpiel — super!', 'Mam dla ciebie specjalną nagrodę! 🩺'];
    if (stepIndex === 1) return ['Jesteś prawdziwym Mistrzem Higieny! 🌟', 'Pamiętaj te zasady na zawsze!', 'A teraz ostatnia zagadka...'];
    return ['Mistrz Higieny! 🏆'];
  }

  // === PREGNANCY QUEST DIALOG ===
  if (npcId === 'mama' && questId === 'quest_baby') {
    if (stepIndex === 0) return ['Kuba, usiądź... 💕', 'Mama ma ważną wiadomość!', 'Będziesz miał braciszka lub siostrzyczkę! 👶', 'Pomożesz przygotować pokój?', 'Zbierz rzeczy dla maluszka! 🍼'];
    if (stepIndex === 2) return ['Wszystko gotowe dla maluszka! 👶💕', 'Będziesz najlepszym starszym bratem!', 'A teraz zagadka...'];
    return ['Zbierz rzeczy dla dzidzi! 🍼'];
  }

  return ['...'];
}
