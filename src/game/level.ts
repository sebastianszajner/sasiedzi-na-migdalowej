// ==========================================
// Sąsiedzi na Migdałowej — Level 1 Data
// EXPANDED: 8 quests, new NPCs, new items, math
// ==========================================

import type { LevelData, MathProblem, CostumeItem, Achievement, QuestCategory, SeasonType, ItemType } from './types';
import { GARDEN, HOUSE, ZABKA, PACZKOMAT, PRZEDSZKOLE, SZKOLA } from './constants';

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
  // --- WUJEK RAFAŁ QUEST MATH ---
  // [28] Pierogi + ptasie mleczko
  {
    visualIcon: '🥟',
    question: 'Zrobiłeś 3 pierogi i 2 ptasie mleczko.\nIle jedzenia przygotowałeś?',
    num1: 3, num2: 2, operation: '+', answer: 5,
    options: [4, 5, 6], hint: '🥟🥟🥟 + 🍫🍫 = ?', difficulty: 1,
  },
  // --- MEAL QUEST MATH ---
  // [29] Coffee quest — Tata needs coffee
  {
    visualIcon: '☕',
    question: 'Tata pił 2 kawy rano.\nMama piła 1. Ile kaw razem?',
    num1: 2, num2: 1, operation: '+', answer: 3,
    options: [2, 3, 4], hint: '☕☕ + ☕ = ?', difficulty: 1,
  },
  // [30] Breakfast — gofry ingredients
  {
    visualIcon: '🧇',
    question: 'Na gofry potrzeba 2 jajka i 1 mleko.\nIle składników?',
    num1: 2, num2: 1, operation: '+', answer: 3,
    options: [2, 3, 4], hint: '🥚🥚 + 🥛 = ?', difficulty: 1,
  },
  // [31] Lunch — soup + bread
  {
    visualIcon: '🍲',
    question: 'Na stole 4 talerze zupy.\nKuba zjadł 1. Ile zostało?',
    num1: 4, num2: 1, operation: '-', answer: 3,
    options: [2, 3, 4], hint: '🍲🍲🍲🍲 - 🍲 = ?', difficulty: 1,
  },
  // [32] Dinner — sandwiches
  {
    visualIcon: '🍞',
    question: 'Mama zrobiła 3 kanapki.\nTata dołożył 2. Ile jest?',
    num1: 3, num2: 2, operation: '+', answer: 5,
    options: [4, 5, 6], hint: '🍞🍞🍞 + 🍞🍞 = ?', difficulty: 1,
  },
  // [33] Żabka shopping
  {
    visualIcon: '🛒',
    question: 'Kupiłeś 3 chipsy i 2 lody.\nIle produktów w torbie?',
    num1: 3, num2: 2, operation: '+', answer: 5,
    options: [4, 5, 6], hint: '🍿🍿🍿 + 🍦🍦 = ?', difficulty: 1,
  },
  // [34] Paczkomat
  {
    visualIcon: '📦',
    question: 'W paczkomacie 6 paczek.\nOdebrałeś 2. Ile zostało?',
    num1: 6, num2: 2, operation: '-', answer: 4,
    options: [3, 4, 5], hint: '📦📦📦📦📦📦 - 📦📦 = ?', difficulty: 1,
  },
  // [35] Projector movie night
  {
    visualIcon: '🎬',
    question: '4 osoby oglądają film.\nFranek też! Ile widzów?',
    num1: 4, num2: 1, operation: '+', answer: 5,
    options: [4, 5, 6], hint: '👨‍👩‍👦 + 🐕 + 👤 = ?', difficulty: 1,
  },
  // [36] Baby name - Zuzia letters
  {
    visualIcon: '📝',
    question: 'Ile literek ma imię ZUZIA?',
    num1: 5, num2: 0, operation: '+', answer: 5,
    options: [4, 5, 6], hint: 'Z-U-Z-I-A → policz!', difficulty: 1,
  },
  // [37] Baby room - teddy bears
  {
    visualIcon: '🧸',
    question: 'W pokoju dzidzi jest 2 misie.\nKuba dał jeszcze 1. Ile razem?',
    num1: 2, num2: 1, operation: '+', answer: 3,
    options: [2, 3, 4], hint: '🧸🧸 + 🧸 = ?', difficulty: 1,
  },
  // [38] Breathing exercise
  {
    visualIcon: '🎈',
    question: 'Mama oddycha 3 razy.\nKuba 3 razy. Ile razem?',
    num1: 3, num2: 3, operation: '+', answer: 6,
    options: [5, 6, 7], hint: '🫁🫁🫁 + 🫁🫁🫁 = ?', difficulty: 1,
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
  { id: 'hat_baby', name: 'Opaska starszego braciszka', slot: 'hat', emoji: '👶', color: '#F48FB1', unlocked: false, unlockedBy: 'quest_baby' },
  // Wujek Rafał quest costume
  { id: 'hat_vietnam', name: 'Nón lá (kapelusz wietnamski)', slot: 'hat', emoji: '🎋', color: '#C8AD8A', unlocked: false, unlockedBy: 'quest_rafal' },
  // Meal quest costumes
  { id: 'hat_chef_pro', name: 'Czapka szefa kuchni', slot: 'hat', emoji: '👨‍🍳', color: '#FFFDE7', unlocked: false, unlockedBy: 'quest_breakfast' },
  { id: 'acc_apron', name: 'Fartuszek kucharza', slot: 'accessory', emoji: '🧑‍🍳', color: '#FF8A65', unlocked: false, unlockedBy: 'quest_dinner' },
  // Żabka & Paczkomat
  { id: 'hat_zabka', name: 'Czapka Żabki', slot: 'hat', emoji: '🐸', color: '#00A651', unlocked: false, unlockedBy: 'quest_zabka' },
  { id: 'acc_popcorn', name: 'Kubek popcornu', slot: 'accessory', emoji: '🍿', color: '#FFD700', unlocked: false, unlockedBy: 'quest_movie_night' },
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
  worldWidth: 11000,
  worldHeight: 720,
  playerStart: { x: 480, y: 472 },

  rooms: [
    // === ULICA ===
    { name: 'Żabka', x: ZABKA.x, y: ZABKA.y, w: ZABKA.w, h: ZABKA.h, bgColor: '#F5F0EB', floorColor: '#D5CFC8', icon: '🐸', bgImageUrl: `${import.meta.env.BASE_URL}rooms/zabka.png` },
    // === PARTER ===
    { name: 'Garaż', x: -200, y: 332, w: 200, h: 224, bgColor: '#E8E4E0', floorColor: '#8C8C8C', icon: '🚗', bgImageUrl: `${import.meta.env.BASE_URL}rooms/garaz.png` },
    { name: 'Przedsionek', x: 0, y: 332, w: 80, h: 224, bgColor: '#F0EBE3', floorColor: '#B89B74', icon: '👟', bgImageUrl: `${import.meta.env.BASE_URL}rooms/przedsionek.png` },
    { name: 'Kuchnia', x: 80, y: 332, w: 280, h: 224, bgColor: '#F2EDE6', floorColor: '#D5C8B5', icon: '🍳', bgImageUrl: `${import.meta.env.BASE_URL}rooms/kuchnia.png` },
    { name: 'Salon', x: 360, y: 332, w: 320, h: 224, bgColor: '#EDE8E0', floorColor: '#A0886A', icon: '🛋️', bgImageUrl: `${import.meta.env.BASE_URL}rooms/salon.png` },
    { name: 'Gabinet Taty', x: 680, y: 332, w: 200, h: 224, bgColor: '#EDE8E3', floorColor: '#D5CFC8', icon: '📚', bgImageUrl: `${import.meta.env.BASE_URL}rooms/gabinet_taty.png` },
    // === PIĘTRO ===
    { name: 'Pokój Kuby', x: 80, y: 110, w: 300, h: 220, bgColor: '#E3EDF5', floorColor: '#B89B74', icon: '🧸', bgImageUrl: `${import.meta.env.BASE_URL}rooms/pokoj_kuby.png` },
    { name: 'Hall', x: 380, y: 110, w: 180, h: 220, bgColor: '#EDE8E0', floorColor: '#B89B74', icon: '🏠', bgImageUrl: `${import.meta.env.BASE_URL}rooms/hall.png` },
    { name: 'Łazienka', x: 560, y: 110, w: 160, h: 220, bgColor: '#F0F0EC', floorColor: '#C5BFB5', icon: '🚿', bgImageUrl: `${import.meta.env.BASE_URL}rooms/lazienka.png` },
    { name: 'Sypialnia', x: 720, y: 110, w: 160, h: 220, bgColor: '#EDE5E0', floorColor: '#A0886A', icon: '🛏️', bgImageUrl: `${import.meta.env.BASE_URL}rooms/sypialnia.png` },
    // === ANTRESOLA (attic) ===
    { name: 'Antresola', x: HOUSE.antresola.x, y: HOUSE.atticCeilingY, w: HOUSE.antresola.w, h: HOUSE.atticFloorY - HOUSE.atticCeilingY, bgColor: '#D8D0C8', floorColor: '#9E8E78', icon: '🏠', bgImageUrl: `${import.meta.env.BASE_URL}rooms/antresola.png` },

    // === PRZEDSZKOLE — PARTER (y:332, h:224) ===
    { name: 'Szatnia P', x: 3500, y: 332, w: 200, h: 224, bgColor: '#FFF8E1', floorColor: '#D5C8B5', icon: '👟', bgImageUrl: `${import.meta.env.BASE_URL}rooms/p_szatnia.png` },
    { name: 'Sala Motylki', x: 3700, y: 332, w: 350, h: 224, bgColor: '#E8F5E9', floorColor: '#C8AD8A', icon: '🦋', bgImageUrl: `${import.meta.env.BASE_URL}rooms/p_sala_motylki.png` },
    { name: 'Korytarz P', x: 4050, y: 332, w: 150, h: 224, bgColor: '#FFF8E1', floorColor: '#D5CFC8', icon: '🚪', bgImageUrl: `${import.meta.env.BASE_URL}rooms/p_korytarz.png` },
    { name: 'Sala Biedronki', x: 4200, y: 332, w: 350, h: 224, bgColor: '#FFF3E0', floorColor: '#C8AD8A', icon: '🐞', bgImageUrl: `${import.meta.env.BASE_URL}rooms/p_sala_biedronki.png` },
    { name: 'Kuchnia P', x: 4550, y: 332, w: 250, h: 224, bgColor: '#F5F0EB', floorColor: '#D5CFC8', icon: '🍳', bgImageUrl: `${import.meta.env.BASE_URL}rooms/p_kuchnia.png` },
    { name: 'Jadalnia P', x: 4800, y: 332, w: 300, h: 224, bgColor: '#FFF8E1', floorColor: '#C8AD8A', icon: '🍽️', bgImageUrl: `${import.meta.env.BASE_URL}rooms/p_jadalnia.png` },
    // === PRZEDSZKOLE — PIĘTRO (y:110, h:220) ===
    { name: 'Gabinet Dyrektora P', x: 3500, y: 110, w: 250, h: 220, bgColor: '#EFEBE9', floorColor: '#B89B74', icon: '📋', bgImageUrl: `${import.meta.env.BASE_URL}rooms/p_gabinet_dyrektora.png` },
    { name: 'Sala Zajęć', x: 3750, y: 110, w: 400, h: 220, bgColor: '#E3F2FD', floorColor: '#C8AD8A', icon: '🎨', bgImageUrl: `${import.meta.env.BASE_URL}rooms/p_sala_zajec.png` },
    { name: 'Korytarz P Góra', x: 4150, y: 110, w: 150, h: 220, bgColor: '#FFF8E1', floorColor: '#D5CFC8', icon: '🚪', bgImageUrl: `${import.meta.env.BASE_URL}rooms/p_korytarz_gora.png` },
    { name: 'Sala Słoniki', x: 4300, y: 110, w: 350, h: 220, bgColor: '#F3E5F5', floorColor: '#C8AD8A', icon: '🐘', bgImageUrl: `${import.meta.env.BASE_URL}rooms/p_sala_sloniki.png` },
    { name: 'Łazienka P', x: 4650, y: 110, w: 200, h: 220, bgColor: '#E0F7FA', floorColor: '#C5BFB5', icon: '🚿', bgImageUrl: `${import.meta.env.BASE_URL}rooms/p_lazienka.png` },
    { name: 'Pokój Nauczycielski P', x: 4850, y: 110, w: 250, h: 220, bgColor: '#EFEBE9', floorColor: '#B89B74', icon: '☕', bgImageUrl: `${import.meta.env.BASE_URL}rooms/p_pokoj_nauczycielski.png` },

    // === SZKOŁA — PARTER (y:332, h:224) ===
    { name: 'Hol Główny', x: 5500, y: 332, w: 300, h: 224, bgColor: '#ECEFF1', floorColor: '#B0BEC5', icon: '🏫', bgImageUrl: `${import.meta.env.BASE_URL}rooms/s_hol_glowny.png` },
    { name: 'Klasa 1A', x: 5800, y: 332, w: 350, h: 224, bgColor: '#E8F5E9', floorColor: '#C8AD8A', icon: '📝', bgImageUrl: `${import.meta.env.BASE_URL}rooms/s_klasa_1a.png` },
    { name: 'Korytarz S', x: 6150, y: 332, w: 150, h: 224, bgColor: '#ECEFF1', floorColor: '#B0BEC5', icon: '🚪', bgImageUrl: `${import.meta.env.BASE_URL}rooms/s_korytarz.png` },
    { name: 'Klasa 2A', x: 6300, y: 332, w: 350, h: 224, bgColor: '#FFF3E0', floorColor: '#C8AD8A', icon: '📝', bgImageUrl: `${import.meta.env.BASE_URL}rooms/s_klasa_2a.png` },
    { name: 'Świetlica', x: 6650, y: 332, w: 350, h: 224, bgColor: '#FFF8E1', floorColor: '#C8AD8A', icon: '🎮', bgImageUrl: `${import.meta.env.BASE_URL}rooms/s_swietlica.png` },
    { name: 'Stołówka', x: 7000, y: 332, w: 400, h: 224, bgColor: '#F5F0EB', floorColor: '#D5CFC8', icon: '🍽️', bgImageUrl: `${import.meta.env.BASE_URL}rooms/s_stolowka.png` },
    { name: 'Sala Gimnastyczna', x: 7400, y: 332, w: 400, h: 224, bgColor: '#E3F2FD', floorColor: '#BBDEFB', icon: '🏀', bgImageUrl: `${import.meta.env.BASE_URL}rooms/s_sala_gimnastyczna.png` },
    // === SZKOŁA — PIĘTRO (y:110, h:220) ===
    { name: 'Gabinet Dyrektora S', x: 5500, y: 110, w: 250, h: 220, bgColor: '#EFEBE9', floorColor: '#B89B74', icon: '📋', bgImageUrl: `${import.meta.env.BASE_URL}rooms/s_gabinet_dyrektora.png` },
    { name: 'Klasa 3A', x: 5750, y: 110, w: 350, h: 220, bgColor: '#E8F5E9', floorColor: '#C8AD8A', icon: '📝', bgImageUrl: `${import.meta.env.BASE_URL}rooms/s_klasa_3a.png` },
    { name: 'Korytarz S Góra', x: 6100, y: 110, w: 150, h: 220, bgColor: '#ECEFF1', floorColor: '#B0BEC5', icon: '🚪', bgImageUrl: `${import.meta.env.BASE_URL}rooms/s_korytarz_gora.png` },
    { name: 'Klasa 4A', x: 6250, y: 110, w: 350, h: 220, bgColor: '#FFF3E0', floorColor: '#C8AD8A', icon: '📝', bgImageUrl: `${import.meta.env.BASE_URL}rooms/s_klasa_4a.png` },
    { name: 'Biblioteka', x: 6600, y: 110, w: 400, h: 220, bgColor: '#EFEBE9', floorColor: '#B89B74', icon: '📚', bgImageUrl: `${import.meta.env.BASE_URL}rooms/s_biblioteka.png` },
    { name: 'Sala Komputerowa', x: 7000, y: 110, w: 350, h: 220, bgColor: '#E0F2F1', floorColor: '#B0BEC5', icon: '💻', bgImageUrl: `${import.meta.env.BASE_URL}rooms/s_sala_komputerowa.png` },
    { name: 'Pokój Nauczycielski S', x: 7350, y: 110, w: 250, h: 220, bgColor: '#EFEBE9', floorColor: '#B89B74', icon: '☕', bgImageUrl: `${import.meta.env.BASE_URL}rooms/s_pokoj_nauczycielski.png` },
    { name: 'Łazienka S', x: 7600, y: 110, w: 200, h: 220, bgColor: '#E0F7FA', floorColor: '#C5BFB5', icon: '🚿', bgImageUrl: `${import.meta.env.BASE_URL}rooms/s_lazienka.png` },
    // === BIBLIOTEKA MIEJSKA (x:-6400, w:600) ===
    // Parter
    { name: 'Hol Biblioteki', x: -6400, y: 332, w: 150, h: 224, bgColor: '#F5F0E8', floorColor: '#D2B48C', icon: '🏛️', bgImageUrl: `${import.meta.env.BASE_URL}rooms/b_hol.png` },
    { name: 'Wypożyczalnia', x: -6250, y: 332, w: 150, h: 224, bgColor: '#FFF8E1', floorColor: '#D2B48C', icon: '📚', bgImageUrl: `${import.meta.env.BASE_URL}rooms/b_wypozyczalnia.png` },
    { name: 'Czytelnia', x: -6100, y: 332, w: 150, h: 224, bgColor: '#EFEBE9', floorColor: '#C9A875', icon: '📖', bgImageUrl: `${import.meta.env.BASE_URL}rooms/b_czytelnia.png` },
    { name: 'Sala Bajek', x: -5950, y: 332, w: 150, h: 224, bgColor: '#E8F5E9', floorColor: '#C9A875', icon: '🧚', bgImageUrl: `${import.meta.env.BASE_URL}rooms/b_sala_bajek.png` },
    // Piętro
    { name: 'Magazyn', x: -6400, y: 110, w: 150, h: 220, bgColor: '#ECEFF1', floorColor: '#B0BEC5', icon: '📦', bgImageUrl: `${import.meta.env.BASE_URL}rooms/b_magazyn.png` },
    { name: 'Sala Multimedialna', x: -6250, y: 110, w: 150, h: 220, bgColor: '#E3F2FD', floorColor: '#B0BEC5', icon: '🎬', bgImageUrl: `${import.meta.env.BASE_URL}rooms/b_sala_multimedialna.png` },
    { name: 'Biuro Biblioteki', x: -6100, y: 110, w: 150, h: 220, bgColor: '#FFF3E0', floorColor: '#C4A265', icon: '🖥️', bgImageUrl: `${import.meta.env.BASE_URL}rooms/b_biuro.png` },
    { name: 'Archiwum', x: -5950, y: 110, w: 150, h: 220, bgColor: '#F3E5F5', floorColor: '#B0BEC5', icon: '🗂️', bgImageUrl: `${import.meta.env.BASE_URL}rooms/b_archiwum.png` },
    // === OSIEDLE (x:9500, w:1500, 3 blocks simplified) ===
    { name: 'Sklep Osiedlowy', x: 9500, y: 380, w: 200, h: 176, bgColor: '#FFF8E1', floorColor: '#D5CFC8', icon: '🏪', bgImageUrl: `${import.meta.env.BASE_URL}rooms/o_sklep.png` },
    { name: 'Pralnia', x: 9700, y: 380, w: 150, h: 176, bgColor: '#E3F2FD', floorColor: '#C5D0D8', icon: '👕', bgImageUrl: `${import.meta.env.BASE_URL}rooms/o_pralnia.png` },
    { name: 'Świetlica Osiedlowa', x: 9850, y: 380, w: 150, h: 176, bgColor: '#FFF3E0', floorColor: '#D2B48C', icon: '🎲', bgImageUrl: `${import.meta.env.BASE_URL}rooms/o_swietlica.png` },
    { name: 'Mieszkanie Blok 2', x: 10000, y: 380, w: 250, h: 176, bgColor: '#ECEFF1', floorColor: '#C5BFB5', icon: '🏠', bgImageUrl: `${import.meta.env.BASE_URL}rooms/o_mieszkanie_2.png` },
    { name: 'Mieszkanie Blok 3', x: 10500, y: 380, w: 250, h: 176, bgColor: '#E8EAF6', floorColor: '#C5BFB5', icon: '🏠', bgImageUrl: `${import.meta.env.BASE_URL}rooms/o_mieszkanie_3.png` },
  ],

  platforms: [
    { x: -7300, y: 556, w: 18400, h: 200 },   // ground (full map: playground → osiedle, -7300 to 11100)
    { x: ZABKA.x, y: 556, w: ZABKA.w, h: 12 }, // Żabka floor
    { x: -200, y: 556, w: 280, h: 12 },      // garage floor
    { x: 80, y: 556, w: 800, h: 12 },        // floor 1
    { x: 80, y: 330, w: 800, h: 12 },        // floor 2
    { x: HOUSE.antresola.x, y: HOUSE.atticFloorY, w: HOUSE.antresola.w, h: 12 }, // attic floor
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
    // === SKATE PARK platforms ===
    { x: -4400, y: 420, w: 120, h: 8 },          // halfpipe left edge
    { x: -3720, y: 420, w: 120, h: 8 },          // halfpipe right edge
    { x: -4100, y: 460, w: 80, h: 8 },           // quarter pipe lip
    { x: -3900, y: 510, w: 200, h: 6 },          // grind rail
    // === BASKETBALL hoop platforms ===
    { x: -3350, y: 430, w: 40, h: 8 },           // left hoop backboard
    { x: -2650, y: 430, w: 40, h: 8 },           // right hoop backboard
    // === PRZEDSZKOLE floors ===
    { x: PRZEDSZKOLE.x, y: 556, w: PRZEDSZKOLE.w, h: 12 },  // Przedszkole floor 1
    { x: PRZEDSZKOLE.x, y: 330, w: PRZEDSZKOLE.w, h: 12 },  // Przedszkole floor 2
    // === SZKOŁA floors ===
    { x: SZKOLA.x, y: 556, w: SZKOLA.w, h: 12 },  // Szkoła floor 1
    { x: SZKOLA.x, y: 330, w: SZKOLA.w, h: 12 },  // Szkoła floor 2
    // === BIBLIOTEKA floors ===
    { x: -6400, y: 556, w: 600, h: 12 },  // Biblioteka floor 1
    { x: -6400, y: 330, w: 600, h: 12 },  // Biblioteka floor 2
    // === BMX PUMP TRACK platforms ===
    { x: -2220, y: 520, w: 50, h: 6 },   // small ramp lip
    { x: -2080, y: 500, w: 40, h: 6 },   // kicker lip
    { x: -1830, y: 530, w: 30, h: 6 },   // dirt jump 1
    { x: -1790, y: 520, w: 30, h: 6 },   // dirt jump 2
    { x: -1750, y: 530, w: 30, h: 6 },   // dirt jump 3
    // === PLAC ZABAW platforms (climbing) ===
    { x: -7000, y: 490, w: 60, h: 8 },   // climbing level 1
    { x: -6950, y: 420, w: 60, h: 8 },   // climbing level 2
    { x: -6900, y: 350, w: 60, h: 8 },   // climbing level 3
    { x: -6600, y: 530, w: 40, h: 8 },   // trampoline platform (bounce handled in engine)
    // === OSIEDLE floors ===
    { x: 9500, y: 556, w: 1500, h: 12 },  // Osiedle ground floor
    { x: 9500, y: 380, w: 1500, h: 12 },  // Osiedle floor 2
  ],

  walls: [
    // Żabka walls
    { x: ZABKA.x - 4, y: ZABKA.y, w: 8, h: ZABKA.h },  // Żabka left wall
    { x: ZABKA.x + ZABKA.w - 4, y: ZABKA.y, w: 8, h: ZABKA.h }, // Żabka right wall
    // House
    { x: -204, y: 332, w: 8, h: 88 },           // garage left wall (332-420), gap 420-556 = ground-level garage door
    { x: 76, y: HOUSE.atticCeilingY, w: 8, h: 332 - HOUSE.atticCeilingY }, // left house wall upper (attic to 1st floor)
    { x: 76, y: 332, w: 8, h: 88 },            // left house wall lower (332-420), gap 420-556 = ground-level doorway vestibule→kitchen
    { x: 876, y: HOUSE.atticCeilingY, w: 8, h: 310 + (110 - HOUSE.atticCeilingY) }, // right house wall — extended up for attic
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
    // === PRZEDSZKOLE walls ===
    { x: 3496, y: 110, w: 8, h: 310 },             // Przedszkole left outer wall upper (110-420), gap 420-556 = entry
    { x: 5096, y: 110, w: 8, h: 310 },             // Przedszkole right outer wall upper (110-420), gap 420-556 = exit
    // Parter dividers (y:332, h:120 — gap at bottom 452-556 for passage)
    { x: 3696, y: 332, w: 8, h: 120 },             // Szatnia / Sala Motylki
    { x: 4046, y: 332, w: 8, h: 120 },             // Sala Motylki / Korytarz
    { x: 4196, y: 332, w: 8, h: 120 },             // Korytarz / Sala Biedronki
    { x: 4546, y: 332, w: 8, h: 120 },             // Sala Biedronki / Kuchnia
    { x: 4796, y: 332, w: 8, h: 120 },             // Kuchnia / Jadalnia
    // Piętro dividers (y:110, h:120 — gap at bottom 230-330 for passage)
    { x: 3746, y: 110, w: 8, h: 120 },             // Gabinet / Sala Zajęć
    { x: 4146, y: 110, w: 8, h: 120 },             // Sala Zajęć / Korytarz Góra
    { x: 4296, y: 110, w: 8, h: 120 },             // Korytarz Góra / Sala Słoniki
    { x: 4646, y: 110, w: 8, h: 120 },             // Sala Słoniki / Łazienka P
    { x: 4846, y: 110, w: 8, h: 120 },             // Łazienka P / Pokój Nauczycielski
    // === SZKOŁA walls ===
    { x: 5496, y: 110, w: 8, h: 310 },             // Szkoła left outer wall upper (110-420), gap 420-556 = entry
    { x: 7796, y: 110, w: 8, h: 310 },             // Szkoła right outer wall upper (110-420), gap 420-556 = exit
    // Parter dividers (y:332, h:120)
    { x: 5796, y: 332, w: 8, h: 120 },             // Hol / Klasa 1A
    { x: 6146, y: 332, w: 8, h: 120 },             // Klasa 1A / Korytarz S
    { x: 6296, y: 332, w: 8, h: 120 },             // Korytarz S / Klasa 2A
    { x: 6646, y: 332, w: 8, h: 120 },             // Klasa 2A / Świetlica
    { x: 6996, y: 332, w: 8, h: 120 },             // Świetlica / Stołówka
    { x: 7396, y: 332, w: 8, h: 120 },             // Stołówka / Sala Gimnastyczna
    // Piętro dividers (y:110, h:120)
    { x: 5746, y: 110, w: 8, h: 120 },             // Gabinet S / Klasa 3A
    { x: 6096, y: 110, w: 8, h: 120 },             // Klasa 3A / Korytarz S Góra
    { x: 6246, y: 110, w: 8, h: 120 },             // Korytarz S / Klasa 4A
    { x: 6596, y: 110, w: 8, h: 120 },             // Klasa 4A / Biblioteka
    { x: 6996, y: 110, w: 8, h: 120 },             // Biblioteka / Sala Komputerowa
    { x: 7346, y: 110, w: 8, h: 120 },             // Sala Komputerowa / Pokój Nauczycielski S
    { x: 7596, y: 110, w: 8, h: 120 },             // Pokój Nauczycielski S / Łazienka S
    // === BIBLIOTEKA walls ===
    { x: -6404, y: 110, w: 8, h: 310 },             // Biblioteka left outer wall upper (gap 420-556 = entry)
    { x: -5804, y: 110, w: 8, h: 310 },             // Biblioteka right outer wall upper (110-420), gap 420-556 = exit
    // Parter dividers
    { x: -6254, y: 332, w: 8, h: 120 },             // Hol / Wypożyczalnia
    { x: -6104, y: 332, w: 8, h: 120 },             // Wypożyczalnia / Czytelnia
    { x: -5954, y: 332, w: 8, h: 120 },             // Czytelnia / Sala Bajek
    // Piętro dividers
    { x: -6254, y: 110, w: 8, h: 120 },             // Magazyn / Sala Multimedialna
    { x: -6104, y: 110, w: 8, h: 120 },             // Sala Multimedialna / Biuro
    { x: -5954, y: 110, w: 8, h: 120 },             // Biuro / Archiwum
    // === OSIEDLE walls (3 simplified blocks) — gap 420-556 for ground-level entry ===
    { x: 9496, y: 110, w: 8, h: 310 },              // Osiedle block 1 left wall (110-420), gap 420-556
    { x: 9996, y: 110, w: 8, h: 310 },              // Block 1 right / Block 2 left (110-420), gap 420-556
    { x: 10496, y: 110, w: 8, h: 310 },             // Block 2 right / Block 3 left (110-420), gap 420-556
    { x: 10996, y: 110, w: 8, h: 310 },             // Block 3 right wall (110-420), gap 420-556
    // World boundaries
    { x: -7290, y: 0, w: 10, h: 556 },              // left world boundary (playground)
    { x: 10990, y: 0, w: 10, h: 556 },              // right world boundary (osiedle)
  ],

  stairs: [
    { x: 720, y: 332, w: 56, topY: 330, bottomY: 556 },
    // Ladder to antresola (from Kuba's room / hall area)
    { x: 350, y: HOUSE.atticFloorY, w: 30, topY: HOUSE.atticFloorY, bottomY: 330 },
    // Przedszkole stairs (korytarz area)
    { x: 4070, y: 332, w: 56, topY: 330, bottomY: 556 },
    // Szkoła stairs (korytarz area)
    { x: 6170, y: 332, w: 56, topY: 330, bottomY: 556 },
    // Biblioteka stairs (hol area)
    { x: -6350, y: 332, w: 56, topY: 330, bottomY: 556 },
    // Osiedle stairs (block 1)
    { x: 9750, y: 380, w: 56, topY: 378, bottomY: 556 },
  ],

  doors: [
    { x: 870, y: 440, w: 20, h: 116, label: 'Wyjście →' },
    { x: 3500, y: 440, w: 20, h: 116, label: 'Przedszkole →' },
    { x: 5500, y: 440, w: 20, h: 116, label: 'Szkoła →' },
  ],

  interactiveObjects: [
    // Projector in salon — replaces TV (mounted on ceiling, projects onto pull-down screen)
    {
      id: 'projector_salon', type: 'projector' as const,
      x: 440, y: 345, w: 50, h: 20,
      state: false, room: 'salon', label: 'Projektor', emoji: '📽️',
    },
    // Paczkomat (InPost parcel locker on the street)
    {
      id: 'paczkomat_street', type: 'paczkomat' as const,
      x: PACZKOMAT.x, y: PACZKOMAT.y, w: PACZKOMAT.w, h: PACZKOMAT.h,
      state: false, room: 'street', label: 'Paczkomat', emoji: '📦',
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
      id: 'listonosz', name: 'Pan Marek', x: -500, y: 472, w: 52, h: 84, dir: 1,
      color: '#1565C0', hairColor: '#5D4037', hairLong: false,
      dialogLines: [], questId: 'quest_mailman', interactRadius: 90, emote: '📬',
      behavior: 'patrol', patrolMinX: -500, patrolMaxX: 860, patrolSpeed: 1.8,
      visible: false, animTimer: 0,
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
    // Wujek Rafał — wraca z Wietnamu, przyjeżdża czerwonym cabrio z lewej
    {
      id: 'rafal', name: 'Wujek Rafał', x: -700, y: 472, w: 52, h: 84, dir: 1,
      color: '#2E7D32', hairColor: '#5D4037', hairLong: false,
      dialogLines: [], questId: 'quest_rafal', interactRadius: 90, emote: '🎒',
      behavior: 'static', visible: false, animTimer: 0,
    },
    // Żabka shop clerk — Pani Kasia
    {
      id: 'zabka_clerk', name: 'Pani Kasia', x: ZABKA.x + 80, y: 472, w: 52, h: 84, dir: 1,
      color: '#00A651', hairColor: '#795548', hairLong: true,
      dialogLines: [], questId: 'quest_zabka', interactRadius: 90, emote: '🐸',
      behavior: 'static', visible: false, animTimer: 0,
    },

    // === PRZEDSZKOLE NPC (8) ===
    // Nauczyciele (w:52, h:84, parter y=472, piętro y=246)
    {
      id: 'pani_ania', name: 'Pani Ania', x: 3720, y: 472, w: 52, h: 84, dir: 1,
      color: '#E91E63', hairColor: '#5D4037', hairLong: true,
      dialogLines: ['Cześć! Chcesz malować z nami? 🎨', 'Motylki dziś robią kolaż!'],
      questId: null, interactRadius: 90, emote: '🎨',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'pani_zosia', name: 'Pani Zosia', x: 4250, y: 472, w: 52, h: 84, dir: -1,
      color: '#7B1FA2', hairColor: '#4E342E', hairLong: true,
      dialogLines: ['A, B, C... kto tu przyszedł? 📖', 'Biedronki uczą się literek!'],
      questId: null, interactRadius: 90, emote: '📖',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'pan_tomek_p', name: 'Pan Tomek', x: 3800, y: 246, w: 52, h: 84, dir: 1,
      color: '#1565C0', hairColor: '#3E2723', hairLong: false,
      dialogLines: ['Zaśpiewamy razem? 🎵', 'Dziś gramy na bębenku!'],
      questId: null, interactRadius: 90, emote: '🎵',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'dyrektor_p', name: 'Pani Dyrektor', x: 3550, y: 246, w: 52, h: 84, dir: 1,
      color: '#455A64', hairColor: '#795548', hairLong: true,
      dialogLines: ['Witaj w naszym przedszkolu! 🏫', 'Mam nadzieję, że ci się tu podoba!'],
      questId: null, interactRadius: 90, emote: '🏫',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'kucharka_p', name: 'Pani Marta', x: 4600, y: 472, w: 52, h: 84, dir: -1,
      color: '#FFFFFF', hairColor: '#8D6E63', hairLong: false,
      dialogLines: ['Dziś na obiad zupa pomidorowa! 🍅', 'Kto chce dokładkę?'],
      questId: null, interactRadius: 90, emote: '🍳',
      behavior: 'static', visible: true, animTimer: 0,
    },
    // Dzieci (w:42, h:68, y = 556 - 68 = 488)
    {
      id: 'kasia_kid', name: 'Kasia', x: 3800, y: 488, w: 42, h: 68, dir: 1,
      color: '#F48FB1', hairColor: '#FFD54F', hairLong: true,
      dialogLines: ['Hej! Jestem Kasia! 😊', 'Lubisz rysować?'],
      questId: null, interactRadius: 60, emote: null,
      behavior: 'patrol', patrolMinX: 3700, patrolMaxX: 4000, patrolSpeed: 1.0,
      visible: true, animTimer: 0,
    },
    {
      id: 'janek_kid', name: 'Janek', x: 4300, y: 488, w: 42, h: 68, dir: -1,
      color: '#42A5F5', hairColor: '#5D4037', hairLong: false,
      dialogLines: ['Cześć! Gram w klocki! 🧱', 'Chcesz zobaczyć moją wieżę?'],
      questId: null, interactRadius: 60, emote: null,
      behavior: 'patrol', patrolMinX: 4200, patrolMaxX: 4500, patrolSpeed: 1.0,
      visible: true, animTimer: 0,
    },
    {
      id: 'ola_kid', name: 'Ola', x: 3900, y: 488, w: 42, h: 68, dir: 1,
      color: '#CE93D8', hairColor: '#8D6E63', hairLong: true,
      dialogLines: ['Cześć! Baw się z nami! 🎈', 'Słoniki to najlepsza grupa!'],
      questId: null, interactRadius: 60, emote: null,
      behavior: 'patrol', patrolMinX: 3600, patrolMaxX: 4000, patrolSpeed: 0.9,
      visible: true, animTimer: 0,
    },

    // === SZKOŁA NPC — NAUCZYCIELE (10) ===
    {
      id: 'dyrektor_s', name: 'Pan Dyrektor', x: 5550, y: 246, w: 52, h: 84, dir: 1,
      color: '#37474F', hairColor: '#616161', hairLong: false,
      dialogLines: ['Witaj w naszej szkole! 🏫', 'Nauka to przygoda!'],
      questId: null, interactRadius: 90, emote: '🏫',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'pani_magda', name: 'Pani Magda', x: 5850, y: 472, w: 52, h: 84, dir: -1,
      color: '#1B5E20', hairColor: '#4E342E', hairLong: true,
      dialogLines: ['Ile to jest 7 + 5? 🧮', 'Matematyka jest wszędzie!'],
      questId: null, interactRadius: 90, emote: '🧮',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'pan_marek_s', name: 'Pan Marek', x: 6350, y: 472, w: 52, h: 84, dir: 1,
      color: '#33691E', hairColor: '#3E2723', hairLong: false,
      dialogLines: ['Wiecie co jedzą żaby? 🐸', 'Przyroda jest fascynująca!'],
      questId: null, interactRadius: 90, emote: '🌿',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'pani_krysia', name: 'Pani Krysia', x: 5800, y: 246, w: 52, h: 84, dir: 1,
      color: '#880E4F', hairColor: '#5D4037', hairLong: true,
      dialogLines: ['Kto przeczytał lekturę? 📚', 'Język polski jest piękny!'],
      questId: null, interactRadius: 90, emote: '📖',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'pan_adam', name: 'Pan Adam', x: 6300, y: 246, w: 52, h: 84, dir: -1,
      color: '#0D47A1', hairColor: '#424242', hairLong: false,
      dialogLines: ['Kto pokaże Polskę na mapie? 🗺️', 'Dzisiaj lecimy do Afryki!'],
      questId: null, interactRadius: 90, emote: '🗺️',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'pani_ewa', name: 'Pani Ewa', x: 7050, y: 246, w: 52, h: 84, dir: 1,
      color: '#4A148C', hairColor: '#3E2723', hairLong: true,
      dialogLines: ['Uruchamiamy komputery! 💻', 'Kto napisze swój pierwszy program?'],
      questId: null, interactRadius: 90, emote: '💻',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'bibliotekarka', name: 'Pani Bibliotekarka', x: 6650, y: 246, w: 52, h: 84, dir: -1,
      color: '#BF360C', hairColor: '#795548', hairLong: true,
      dialogLines: ['Szukasz jakiejś książki? 📚', 'Mamy nowe komiksy!'],
      questId: null, interactRadius: 90, emote: '📚',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'wf_teacher', name: 'Pan Wojtek', x: 7500, y: 472, w: 52, h: 84, dir: -1,
      color: '#E65100', hairColor: '#5D4037', hairLong: false,
      dialogLines: ['Rozgrzewka! 10 pajacyków! 🏃', 'Ruch to zdrowie!'],
      questId: null, interactRadius: 90, emote: '🏀',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'wozny', name: 'Pan Staszek', x: 6000, y: 472, w: 52, h: 84, dir: 1,
      color: '#546E7A', hairColor: '#9E9E9E', hairLong: false,
      dialogLines: ['Nie biegać po korytarzu! 🔔', 'Przerwa za 5 minut!'],
      questId: null, interactRadius: 90, emote: '🔔',
      behavior: 'patrol', patrolMinX: 5500, patrolMaxX: 7800, patrolSpeed: 1.5,
      visible: true, animTimer: 0,
    },
    {
      id: 'kucharka_s', name: 'Pani Halina', x: 7100, y: 472, w: 52, h: 84, dir: -1,
      color: '#FFFFFF', hairColor: '#8D6E63', hairLong: false,
      dialogLines: ['Dziś kotlet z ziemniakami! 🍽️', 'Kto chce kompot?'],
      questId: null, interactRadius: 90, emote: '🍽️',
      behavior: 'static', visible: true, animTimer: 0,
    },

    // === SZKOŁA NPC — UCZNIOWIE (10, w:42, h:68, y=488) ===
    {
      id: 'uczen_filip', name: 'Filip', x: 5900, y: 488, w: 42, h: 68, dir: 1,
      color: '#2196F3', hairColor: '#5D4037', hairLong: false,
      dialogLines: ['Hej! Jestem w 1A! 😄', 'Masz fajne buty!'],
      questId: null, interactRadius: 60, emote: null,
      behavior: 'patrol', patrolMinX: 5800, patrolMaxX: 6100, patrolSpeed: 1.0,
      visible: true, animTimer: 0,
    },
    {
      id: 'uczen_maja', name: 'Maja', x: 6400, y: 488, w: 42, h: 68, dir: -1,
      color: '#F06292', hairColor: '#FFD54F', hairLong: true,
      dialogLines: ['Lubię przyrodę! 🌱', 'Pan Marek jest super!'],
      questId: null, interactRadius: 60, emote: null,
      behavior: 'patrol', patrolMinX: 6300, patrolMaxX: 6600, patrolSpeed: 1.0,
      visible: true, animTimer: 0,
    },
    {
      id: 'uczen_bartek', name: 'Bartek', x: 5800, y: 262, w: 42, h: 68, dir: 1,
      color: '#4CAF50', hairColor: '#3E2723', hairLong: false,
      dialogLines: ['Czytasz komiksy? 📖', 'Pani Krysia dała nam wiersz!'],
      questId: null, interactRadius: 60, emote: null,
      behavior: 'patrol', patrolMinX: 5750, patrolMaxX: 6050, patrolSpeed: 0.9,
      visible: true, animTimer: 0,
    },
    {
      id: 'uczen_zuzia', name: 'Zuzia', x: 6300, y: 262, w: 42, h: 68, dir: -1,
      color: '#AB47BC', hairColor: '#8D6E63', hairLong: true,
      dialogLines: ['Wiesz gdzie jest Brazylia? 🌍', 'Geografia jest fajna!'],
      questId: null, interactRadius: 60, emote: null,
      behavior: 'patrol', patrolMinX: 6250, patrolMaxX: 6550, patrolSpeed: 0.9,
      visible: true, animTimer: 0,
    },
    {
      id: 'uczen_tomek', name: 'Tomek', x: 6700, y: 262, w: 42, h: 68, dir: 1,
      color: '#FF7043', hairColor: '#5D4037', hairLong: false,
      dialogLines: ['Czytam Harrego Pottera! 🧙', 'Biblioteka to moje miejsce!'],
      questId: null, interactRadius: 60, emote: null,
      behavior: 'patrol', patrolMinX: 6600, patrolMaxX: 6950, patrolSpeed: 0.8,
      visible: true, animTimer: 0,
    },
    {
      id: 'uczen_hania', name: 'Hania', x: 7050, y: 262, w: 42, h: 68, dir: -1,
      color: '#EC407A', hairColor: '#4E342E', hairLong: true,
      dialogLines: ['Piszę program w Scratchu! 💻', 'Lubię informatykę!'],
      questId: null, interactRadius: 60, emote: null,
      behavior: 'patrol', patrolMinX: 7000, patrolMaxX: 7300, patrolSpeed: 0.9,
      visible: true, animTimer: 0,
    },
    {
      id: 'uczen_kacper', name: 'Kacper', x: 7500, y: 488, w: 42, h: 68, dir: 1,
      color: '#FF9800', hairColor: '#3E2723', hairLong: false,
      dialogLines: ['Gram w kosza po lekcjach! 🏀', 'Pan Wojtek jest mega!'],
      questId: null, interactRadius: 60, emote: null,
      behavior: 'patrol', patrolMinX: 7400, patrolMaxX: 7750, patrolSpeed: 1.1,
      visible: true, animTimer: 0,
    },
    {
      id: 'uczen_lena', name: 'Lena', x: 6700, y: 488, w: 42, h: 68, dir: 1,
      color: '#26C6DA', hairColor: '#795548', hairLong: true,
      dialogLines: ['Gramy w gry planszowe! 🎲', 'Świetlica jest fajna!'],
      questId: null, interactRadius: 60, emote: null,
      behavior: 'patrol', patrolMinX: 6650, patrolMaxX: 6950, patrolSpeed: 0.9,
      visible: true, animTimer: 0,
    },
    {
      id: 'uczen_szymon', name: 'Szymon', x: 7900, y: 488, w: 42, h: 68, dir: -1,
      color: '#66BB6A', hairColor: '#5D4037', hairLong: false,
      dialogLines: ['Gramy w piłkę! ⚽', 'Boisko jest nasze po lekcjach!'],
      questId: null, interactRadius: 60, emote: null,
      behavior: 'patrol', patrolMinX: 7800, patrolMaxX: 8400, patrolSpeed: 1.2,
      visible: true, animTimer: 0,
    },
    {
      id: 'uczen_iga', name: 'Iga', x: 8100, y: 488, w: 42, h: 68, dir: 1,
      color: '#EF5350', hairColor: '#FFD54F', hairLong: true,
      dialogLines: ['Kto gra w berka? 🏃‍♀️', 'Lubię biegać!'],
      questId: null, interactRadius: 60, emote: null,
      behavior: 'patrol', patrolMinX: 7800, patrolMaxX: 8400, patrolSpeed: 1.1,
      visible: true, animTimer: 0,
    },

    // === STREFY SPORTOWE (lewa strona) ===
    {
      id: 'skater', name: 'Dawid', x: -4200, y: 472, w: 52, h: 84, dir: 1,
      color: '#212121', hairColor: '#FFD54F', hairLong: false,
      dialogLines: ['Siema! Robię kickflipa! 🛹', 'Chcesz spróbować? Trzymaj deskę!'],
      questId: null, interactRadius: 90, emote: '🛹',
      behavior: 'patrol', patrolMinX: -4400, patrolMaxX: -3600, patrolSpeed: 2.0,
      visible: true, animTimer: 0,
    },
    {
      id: 'trener_koszykowki', name: 'Pan Darek', x: -3100, y: 472, w: 52, h: 84, dir: -1,
      color: '#E65100', hairColor: '#5D4037', hairLong: false,
      dialogLines: ['Podaj piłkę i rzuć do kosza! 🏀', 'Trening czyni mistrza!'],
      questId: null, interactRadius: 90, emote: '🏀',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'rowerzysta', name: 'Pani Magda R.', x: -2200, y: 472, w: 52, h: 84, dir: 1,
      color: '#00897B', hairColor: '#4E342E', hairLong: true,
      dialogLines: ['Cześć! Lubisz jeździć na rowerze? 🚴', 'Ta ścieżka jest super na wyścigi!'],
      questId: null, interactRadius: 90, emote: '🚴',
      behavior: 'patrol', patrolMinX: -2400, patrolMaxX: -1800, patrolSpeed: 2.2,
      visible: true, animTimer: 0,
    },
    // === PARK MIEJSKI NPCs ===
    {
      id: 'spacerujacy', name: 'Pan Zenon', x: -5500, y: 472, w: 52, h: 84, dir: 1,
      color: '#795548', hairColor: '#9E9E9E', hairLong: false,
      dialogLines: ['Dobry dzień! 🌳', 'Ładna pogoda na spacer, co?', 'Fontanna jest piękna o zmierzchu!'],
      questId: null, interactRadius: 90, emote: '🚶',
      behavior: 'patrol', patrolMinX: -5700, patrolMaxX: -5100, patrolSpeed: 1.2,
      visible: true, animTimer: 0,
    },
    {
      id: 'babcia_park', name: 'Pani Jadwiga', x: -5300, y: 472, w: 52, h: 84, dir: -1,
      color: '#8D6E63', hairColor: '#BDBDBD', hairLong: true,
      dialogLines: ['Ach, jak miło! 🌸', 'Karmię tu kaczki codziennie!', 'Masz cukierka? 🍬'],
      questId: null, interactRadius: 90, emote: '🧶',
      behavior: 'static', visible: true, animTimer: 0,
    },
    // === BIBLIOTEKA NPCs ===
    {
      id: 'bibliotekarz_m', name: 'Pan Henryk', x: -6300, y: 472, w: 52, h: 84, dir: 1,
      color: '#5D4037', hairColor: '#9E9E9E', hairLong: false,
      dialogLines: ['Witaj w bibliotece! 📚', 'Polecam dział z bajkami!', 'Ciii... tutaj się nie krzyczy 🤫'],
      questId: null, interactRadius: 90, emote: '📖',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'czytelniczka', name: 'Pani Wanda', x: -6050, y: 472, w: 52, h: 84, dir: -1,
      color: '#7B1FA2', hairColor: '#5D4037', hairLong: true,
      dialogLines: ['Czytam wspaniałą książkę! 📖', 'Znasz baśnie braci Grimm?'],
      questId: null, interactRadius: 90, emote: '📕',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'dziecko_czytajace', name: 'Marysia', x: -5920, y: 488, w: 42, h: 68, dir: 1,
      color: '#E91E63', hairColor: '#F9A825', hairLong: true,
      dialogLines: ['Lubisz czytać? 📚', 'Czytam o smokach! 🐉', 'Ta biblioteka jest magiczna!'],
      questId: null, interactRadius: 80, emote: '📖',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'wolontariusz', name: 'Kamil', x: -6200, y: 248, w: 52, h: 84, dir: -1,
      color: '#1565C0', hairColor: '#3E2723', hairLong: false,
      dialogLines: ['Hej! Pomagam tu jako wolontariusz! 🤝', 'Na górze mamy multimedia i archiwa!'],
      questId: null, interactRadius: 90, emote: '🙋',
      behavior: 'static', visible: true, animTimer: 0,
    },
    // === PLAC ZABAW NPCs ===
    {
      id: 'opiekun_placu', name: 'Pan Robert', x: -7100, y: 472, w: 52, h: 84, dir: 1,
      color: '#FF6F00', hairColor: '#4E342E', hairLong: false,
      dialogLines: ['Witaj na placu zabaw! 🎡', 'Baw się bezpiecznie!', 'Karuzela jest super, co? 🎠'],
      questId: null, interactRadius: 90, emote: '👷',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'dziecko_hustawka', name: 'Zosia', x: -6800, y: 488, w: 42, h: 68, dir: -1,
      color: '#F06292', hairColor: '#FFB74D', hairLong: true,
      dialogLines: ['Huśtam się! Weee! 🤸', 'Lubisz trampolinę? 🤩', 'Skacze się na niej super wysoko!'],
      questId: null, interactRadius: 80, emote: '🤸',
      behavior: 'patrol', patrolMinX: -6900, patrolMaxX: -6500, patrolSpeed: 1.5,
      visible: true, animTimer: 0,
    },
    // === PARK ZA SZKOŁĄ NPC ===
    {
      id: 'ogrodnik', name: 'Pan Kazimierz', x: 8900, y: 472, w: 52, h: 84, dir: -1,
      color: '#33691E', hairColor: '#9E9E9E', hairLong: false,
      dialogLines: ['Piękne kwiaty, prawda? 🌺', 'Zajmuję się tym parkiem od 20 lat!', 'Uważaj na kaczki! 🦆'],
      questId: null, interactRadius: 90, emote: '🌻',
      behavior: 'patrol', patrolMinX: 8650, patrolMaxX: 9150, patrolSpeed: 1.0,
      visible: true, animTimer: 0,
    },
    // === PRZYSTANEK NPCs ===
    {
      id: 'czekajacy_1', name: 'Pan Stanisław', x: 9250, y: 472, w: 52, h: 84, dir: 1,
      color: '#455A64', hairColor: '#BDBDBD', hairLong: false,
      dialogLines: ['Autobus powinien zaraz przyjechać... 🚌', 'Czekam tu od 15 minut!'],
      questId: null, interactRadius: 90, emote: '🕐',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'czekajaca_2', name: 'Pani Teresa', x: 9350, y: 472, w: 52, h: 84, dir: -1,
      color: '#AD1457', hairColor: '#5D4037', hairLong: true,
      dialogLines: ['Jadę do centrum! 🏙️', 'Ten autobus zawsze się spóźnia...', 'Ładna pogoda!'],
      questId: null, interactRadius: 90, emote: '👜',
      behavior: 'static', visible: true, animTimer: 0,
    },
    // === OSIEDLE NPCs ===
    {
      id: 'sasiad_blok1', name: 'Pan Ryszard', x: 9600, y: 472, w: 52, h: 84, dir: 1,
      color: '#37474F', hairColor: '#78909C', hairLong: false,
      dialogLines: ['Witaj sąsiedzie! 👋', 'Ładne osiedle, co?', 'Mamy tu super plac zabaw!'],
      questId: null, interactRadius: 90, emote: '🏢',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'sasiada_blok2', name: 'Pani Grażyna', x: 10100, y: 472, w: 52, h: 84, dir: -1,
      color: '#C62828', hairColor: '#8D6E63', hairLong: true,
      dialogLines: ['Dzień dobry! 🌷', 'Robię najlepsze sernik na osiedlu!', 'Zapraszam na kawę! ☕'],
      questId: null, interactRadius: 90, emote: '🎂',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'dziecko_osiedle1', name: 'Patryk', x: 9800, y: 488, w: 42, h: 68, dir: 1,
      color: '#1976D2', hairColor: '#3E2723', hairLong: false,
      dialogLines: ['Hej! Grasz w piłkę? ⚽', 'Umiem robić tricki na rowerze! 🚲'],
      questId: null, interactRadius: 80, emote: '⚽',
      behavior: 'patrol', patrolMinX: 9700, patrolMaxX: 10000, patrolSpeed: 1.8,
      visible: true, animTimer: 0,
    },
    {
      id: 'dziecko_osiedle2', name: 'Weronika', x: 10300, y: 488, w: 42, h: 68, dir: -1,
      color: '#E040FB', hairColor: '#F9A825', hairLong: true,
      dialogLines: ['Cześć! 🌈', 'Rysuję kredą na chodniku!', 'Lubisz rolki? Ja mam różowe! 🛼'],
      questId: null, interactRadius: 80, emote: '🎨',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'sklepikarz', name: 'Pan Zbigniew', x: 9550, y: 296, w: 52, h: 84, dir: 1,
      color: '#4E342E', hairColor: '#616161', hairLong: false,
      dialogLines: ['Witam w sklepiku! 🛒', 'Mam najlepsze bułki w okolicy!', 'Coś do picia? 🥤'],
      questId: null, interactRadius: 90, emote: '🛒',
      behavior: 'static', visible: true, animTimer: 0,
    },
    {
      id: 'emeryt', name: 'Pan Władysław', x: 10600, y: 472, w: 52, h: 84, dir: -1,
      color: '#3E2723', hairColor: '#E0E0E0', hairLong: false,
      dialogLines: ['Za moich czasów... 👴', 'Kiedyś tu było pole! Teraz bloki!', 'Mam 82 lata i ciągle chodzę! 💪'],
      questId: null, interactRadius: 90, emote: '🎩',
      behavior: 'patrol', patrolMinX: 10400, patrolMaxX: 10800, patrolSpeed: 0.8,
      visible: true, animTimer: 0,
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

    // ---- Quest: Imię dla siostrzyczki (name cards in house) ----
    { id: 'bname1', type: 'baby_name_card', x: 600, y: 285, w: 24, h: 24, questId: 'quest_baby_name' },
    { id: 'bname2', type: 'baby_name_card', x: 300, y: 525, w: 24, h: 24, questId: 'quest_baby_name' },
    { id: 'bname3', type: 'baby_name_card', x: 130, y: 285, w: 24, h: 24, questId: 'quest_baby_name' },

    // ---- Quest: Torba do szpitala (hospital items scattered in rooms) ----
    { id: 'hosp1', type: 'hospital_item', x: 680, y: 285, w: 24, h: 24, questId: 'quest_hospital_bag' },
    { id: 'hosp2', type: 'hospital_item', x: 180, y: 525, w: 24, h: 24, questId: 'quest_hospital_bag' },
    { id: 'hosp3', type: 'hospital_item', x: 450, y: 525, w: 24, h: 24, questId: 'quest_hospital_bag' },
    { id: 'hosp4', type: 'hospital_item', x: 820, y: 285, w: 24, h: 24, questId: 'quest_hospital_bag' },

    // ---- Quest: Pokój dla siostrzyczki (decorations in rooms) ----
    { id: 'bdec1', type: 'baby_decor', x: 250, y: 285, w: 24, h: 24, questId: 'quest_baby_room' },
    { id: 'bdec2', type: 'baby_decor', x: 650, y: 285, w: 24, h: 24, questId: 'quest_baby_room' },
    { id: 'bdec3', type: 'baby_decor', x: 480, y: 525, w: 24, h: 24, questId: 'quest_baby_room' },

    // ---- Quest: Prezent od Kuby (craft supplies in house) ----
    { id: 'craft1', type: 'craft_supply', x: 140, y: 285, w: 24, h: 24, questId: 'quest_baby_gift' },
    { id: 'craft2', type: 'craft_supply', x: 420, y: 285, w: 24, h: 24, questId: 'quest_baby_gift' },
    { id: 'craft3', type: 'craft_supply', x: 700, y: 525, w: 24, h: 24, questId: 'quest_baby_gift' },

    // ---- Quest: Oddychamy razem! (balloons scattered everywhere) ----
    { id: 'ball1', type: 'balloon', x: 350, y: 525, w: 24, h: 24, questId: 'quest_breathing' },
    { id: 'ball2', type: 'balloon', x: 550, y: 285, w: 24, h: 24, questId: 'quest_breathing' },
    { id: 'ball3', type: 'balloon', x: 1050, y: 525, w: 24, h: 24, questId: 'quest_breathing' },

    // ---- Quest: Wujek Rafał — pierogi + ptasie mleczko (kuchnia + salon) ----
    { id: 'pierogi1', type: 'pierogi', x: 120, y: 525, w: 28, h: 28, questId: 'quest_rafal' },
    { id: 'pierogi2', type: 'pierogi', x: 200, y: 525, w: 28, h: 28, questId: 'quest_rafal' },
    { id: 'pierogi3', type: 'pierogi', x: 280, y: 525, w: 28, h: 28, questId: 'quest_rafal' },
    { id: 'ptasie1', type: 'ptasie_mleczko', x: 420, y: 525, w: 28, h: 28, questId: 'quest_rafal' },
    { id: 'ptasie2', type: 'ptasie_mleczko', x: 550, y: 525, w: 28, h: 28, questId: 'quest_rafal' },

    // ---- MEAL QUEST ITEMS ----
    // Quest: Tata's coffee (kuchnia — near fridge/counter)
    { id: 'coffee1', type: 'coffee', x: 130, y: 525, w: 26, h: 26, questId: 'quest_coffee' },
    { id: 'coffee2', type: 'milk', x: 200, y: 525, w: 26, h: 26, questId: 'quest_coffee' },
    { id: 'coffee3', type: 'cookie', x: 260, y: 525, w: 26, h: 26, questId: 'quest_coffee' },

    // Quest: Breakfast gofry (fridge items — kuchnia + przedpokój)
    { id: 'bf1', type: 'egg', x: 100, y: 525, w: 24, h: 24, questId: 'quest_breakfast' },
    { id: 'bf2', type: 'egg', x: 160, y: 525, w: 24, h: 24, questId: 'quest_breakfast' },
    { id: 'bf3', type: 'milk', x: 230, y: 525, w: 24, h: 24, questId: 'quest_breakfast' },
    { id: 'bf4', type: 'cream', x: 310, y: 525, w: 24, h: 24, questId: 'quest_breakfast' },
    { id: 'bf5', type: 'flour', x: 720, y: 525, w: 24, h: 24, questId: 'quest_breakfast' },

    // Quest: Lunch/obiad (zupa + chleb — kuchnia + salon)
    { id: 'lu1', type: 'carrot', x: 120, y: 525, w: 24, h: 24, questId: 'quest_lunch' },
    { id: 'lu2', type: 'carrot', x: 180, y: 525, w: 24, h: 24, questId: 'quest_lunch' },
    { id: 'lu3', type: 'ingredient', x: 250, y: 525, w: 24, h: 24, questId: 'quest_lunch' },
    { id: 'lu4', type: 'bread', x: 440, y: 525, w: 24, h: 24, questId: 'quest_lunch' },

    // Quest: Dinner/kolacja (kanapki — chleb, ser, sałatka, sok)
    { id: 'di1', type: 'bread', x: 140, y: 525, w: 24, h: 24, questId: 'quest_dinner' },
    { id: 'di2', type: 'cheese', x: 210, y: 525, w: 24, h: 24, questId: 'quest_dinner' },
    { id: 'di3', type: 'salad', x: 290, y: 525, w: 24, h: 24, questId: 'quest_dinner' },
    { id: 'di4', type: 'juice', x: 440, y: 525, w: 24, h: 24, questId: 'quest_dinner' },
    { id: 'di5', type: 'cheese', x: 520, y: 525, w: 24, h: 24, questId: 'quest_dinner' },

    // ---- Quest: Żabka shopping (items inside Żabka) ----
    { id: 'zab1', type: 'chips', x: ZABKA.x + 30, y: 525, w: 24, h: 24, questId: 'quest_zabka' },
    { id: 'zab2', type: 'candy', x: ZABKA.x + 80, y: 525, w: 24, h: 24, questId: 'quest_zabka' },
    { id: 'zab3', type: 'water', x: ZABKA.x + 130, y: 525, w: 24, h: 24, questId: 'quest_zabka' },
    { id: 'zab4', type: 'ice_cream', x: ZABKA.x + 180, y: 525, w: 24, h: 24, questId: 'quest_zabka' },

    // ---- Quest: Paczkomat (parcels to collect from various locations) ----
    { id: 'parcel1', type: 'parcel', x: PACZKOMAT.x + 15, y: 480, w: 28, h: 28, questId: 'quest_paczkomat' },
    { id: 'parcel2', type: 'parcel', x: 800, y: 525, w: 28, h: 28, questId: 'quest_paczkomat' },
    { id: 'parcel3', type: 'parcel', x: 500, y: 525, w: 28, h: 28, questId: 'quest_paczkomat' },

    // ---- Quest: Movie night (popcorn scattered in house) ----
    { id: 'pop1', type: 'popcorn', x: 380, y: 525, w: 24, h: 24, questId: 'quest_movie_night' },
    { id: 'pop2', type: 'popcorn', x: 460, y: 525, w: 24, h: 24, questId: 'quest_movie_night' },
    { id: 'pop3', type: 'popcorn', x: 540, y: 525, w: 24, h: 24, questId: 'quest_movie_night' },
    { id: 'pop4', type: 'popcorn', x: 620, y: 525, w: 24, h: 24, questId: 'quest_movie_night' },

    // ---- Antresola items (stars hidden in attic) ----
    { id: 'attic_star1', type: 'star', x: 260, y: 70, w: 28, h: 28, questId: 'quest_climb' },
    { id: 'attic_star2', type: 'star', x: 450, y: 70, w: 28, h: 28, questId: 'quest_treasure' },

    // ---- BONUS ARTIFACTS (24 unique per-quest accessories) ----
    { id: 'art_apples', type: 'artifact', x: 1380, y: 505, w: 28, h: 28, questId: 'quest_apples', label: 'koszyk' },
    { id: 'art_toys', type: 'artifact', x: 260, y: 275, w: 28, h: 28, questId: 'quest_toys', label: 'pudelko' },
    { id: 'art_lego', type: 'artifact', x: 580, y: 520, w: 28, h: 28, questId: 'quest_lego', label: 'instrukcja' },
    { id: 'art_mailman', type: 'artifact', x: 825, y: 520, w: 28, h: 28, questId: 'quest_mailman', label: 'znaczek' },
    { id: 'art_cook', type: 'artifact', x: 340, y: 520, w: 28, h: 28, questId: 'quest_cook', label: 'fartuszek' },
    { id: 'art_cat', type: 'artifact', x: 1480, y: 520, w: 28, h: 28, questId: 'quest_cat', label: 'klebek' },
    { id: 'art_flowers', type: 'artifact', x: 1230, y: 520, w: 28, h: 28, questId: 'quest_flowers', label: 'rekawiczki' },
    { id: 'art_jurek', type: 'artifact', x: 470, y: 280, w: 28, h: 28, questId: 'quest_jurek', label: 'smycz' },
    { id: 'art_uncle', type: 'artifact', x: 700, y: 280, w: 28, h: 28, questId: 'quest_uncle', label: 'prezent' },
    { id: 'art_crane', type: 'artifact', x: 1900, y: 520, w: 28, h: 28, questId: 'quest_crane', label: 'kask' },
    { id: 'art_garden', type: 'artifact', x: 1280, y: 520, w: 28, h: 28, questId: 'quest_garden_help', label: 'nasionka' },
    { id: 'art_treasure', type: 'artifact', x: 700, y: 520, w: 28, h: 28, questId: 'quest_treasure', label: 'mapa' },
    { id: 'art_draw', type: 'artifact', x: 320, y: 280, w: 28, h: 28, questId: 'quest_draw', label: 'blok' },
    { id: 'art_banana', type: 'artifact', x: 1260, y: 515, w: 28, h: 28, questId: 'quest_banana', label: 'tortownica' },
    { id: 'art_franek', type: 'artifact', x: 920, y: 520, w: 28, h: 28, questId: 'quest_franek', label: 'pileczka' },
    { id: 'art_brush', type: 'artifact', x: 790, y: 280, w: 28, h: 28, questId: 'quest_brush_teeth', label: 'pasta' },
    { id: 'art_wash', type: 'artifact', x: 260, y: 520, w: 28, h: 28, questId: 'quest_wash_hands', label: 'recznik' },
    { id: 'art_bath', type: 'artifact', x: 670, y: 275, w: 28, h: 28, questId: 'quest_bath', label: 'banki' },
    { id: 'art_pajamas', type: 'artifact', x: 220, y: 275, w: 28, h: 28, questId: 'quest_pajamas', label: 'maskotka' },
    { id: 'art_baby', type: 'artifact', x: 810, y: 280, w: 28, h: 28, questId: 'quest_baby', label: 'smoczek' },
    { id: 'art_rafal', type: 'artifact', x: 460, y: 520, w: 28, h: 28, questId: 'quest_rafal', label: 'pamiatka' },
    { id: 'art_coffee', type: 'artifact', x: 290, y: 520, w: 28, h: 28, questId: 'quest_coffee', label: 'filizanka' },
    { id: 'art_breakfast', type: 'artifact', x: 750, y: 520, w: 28, h: 28, questId: 'quest_breakfast', label: 'patelnia' },
    { id: 'art_dinner', type: 'artifact', x: 500, y: 520, w: 28, h: 28, questId: 'quest_dinner', label: 'talerz' },
    // ---- ARTIFACTS WAVE 2 (30 new) ----
    // 13 for quests without artifacts
    { id: 'art_bathroom', type: 'artifact', x: 610, y: 280, w: 28, h: 28, questId: 'quest_bathroom', label: 'gabka' },
    { id: 'art_climb', type: 'artifact', x: 2050, y: 250, w: 28, h: 28, questId: 'quest_climb', label: 'lina' },
    { id: 'art_piano', type: 'artifact', x: 180, y: 280, w: 28, h: 28, questId: 'quest_piano', label: 'metronom' },
    { id: 'art_baby_name', type: 'artifact', x: 400, y: 280, w: 28, h: 28, questId: 'quest_baby_name', label: 'ramka' },
    { id: 'art_hospital', type: 'artifact', x: 720, y: 280, w: 28, h: 28, questId: 'quest_hospital_bag', label: 'termos' },
    { id: 'art_baby_room', type: 'artifact', x: 350, y: 280, w: 28, h: 28, questId: 'quest_baby_room', label: 'lampka' },
    { id: 'art_baby_gift', type: 'artifact', x: 520, y: 280, w: 28, h: 28, questId: 'quest_baby_gift', label: 'wstazka' },
    { id: 'art_breathing', type: 'artifact', x: 900, y: 520, w: 28, h: 28, questId: 'quest_breathing', label: 'swieczka' },
    { id: 'art_lunch', type: 'artifact', x: 360, y: 520, w: 28, h: 28, questId: 'quest_lunch', label: 'chochla' },
    { id: 'art_zabka', type: 'artifact', x: ZABKA.x + 60, y: 520, w: 28, h: 28, questId: 'quest_zabka', label: 'torba' },
    { id: 'art_paczkomat', type: 'artifact', x: 600, y: 520, w: 28, h: 28, questId: 'quest_paczkomat', label: 'nozyczki' },
    { id: 'art_movie', type: 'artifact', x: 440, y: 520, w: 28, h: 28, questId: 'quest_movie_night', label: 'koc' },
    { id: 'art_comb', type: 'artifact', x: 330, y: 280, w: 28, h: 28, questId: 'quest_comb_hair', label: 'spinki' },
    // 17 second artifacts for quests that already have 1
    { id: 'art2_apples', type: 'artifact', x: 1100, y: 510, w: 28, h: 28, questId: 'quest_apples', label: 'drabina' },
    { id: 'art2_toys', type: 'artifact', x: 140, y: 280, w: 28, h: 28, questId: 'quest_toys', label: 'robot' },
    { id: 'art2_lego', type: 'artifact', x: 430, y: 520, w: 28, h: 28, questId: 'quest_lego', label: 'minifigurka' },
    { id: 'art2_cook', type: 'artifact', x: 220, y: 520, w: 28, h: 28, questId: 'quest_cook', label: 'przepis' },
    { id: 'art2_cat', type: 'artifact', x: 1320, y: 520, w: 28, h: 28, questId: 'quest_cat', label: 'dzwonek' },
    { id: 'art2_flowers', type: 'artifact', x: 1100, y: 520, w: 28, h: 28, questId: 'quest_flowers', label: 'konewka_mala' },
    { id: 'art2_jurek', type: 'artifact', x: 300, y: 280, w: 28, h: 28, questId: 'quest_jurek', label: 'obroza' },
    { id: 'art2_uncle', type: 'artifact', x: 550, y: 520, w: 28, h: 28, questId: 'quest_uncle', label: 'album' },
    { id: 'art2_crane', type: 'artifact', x: 2100, y: 520, w: 28, h: 28, questId: 'quest_crane', label: 'plan_budowy' },
    { id: 'art2_treasure', type: 'artifact', x: 250, y: 280, w: 28, h: 28, questId: 'quest_treasure', label: 'kompas' },
    { id: 'art2_draw', type: 'artifact', x: 550, y: 280, w: 28, h: 28, questId: 'quest_draw', label: 'paleta' },
    { id: 'art2_banana', type: 'artifact', x: 1150, y: 520, w: 28, h: 28, questId: 'quest_banana', label: 'mikser' },
    { id: 'art2_brush', type: 'artifact', x: 660, y: 280, w: 28, h: 28, questId: 'quest_brush_teeth', label: 'kubeczek' },
    { id: 'art2_bath', type: 'artifact', x: 590, y: 280, w: 28, h: 28, questId: 'quest_bath', label: 'mydlo_lux' },
    { id: 'art2_baby', type: 'artifact', x: 650, y: 520, w: 28, h: 28, questId: 'quest_baby', label: 'gryzak' },
    { id: 'art2_rafal', type: 'artifact', x: 300, y: 520, w: 28, h: 28, questId: 'quest_rafal', label: 'magnes' },
    { id: 'art2_coffee', type: 'artifact', x: 180, y: 520, w: 28, h: 28, questId: 'quest_coffee', label: 'termos_kawa' },

    // ---- SEASONAL ARTIFACT ITEMS (60 items, 15 per season) ----

    // == WIOSNA (Spring) — 15 items across 6 quests ==
    // quest_season_garden_spring (4 items)
    { id: 'season_wiosna_1', type: 'artifact' as ItemType, x: 1050, y: 520, w: 32, h: 32, questId: 'quest_season_garden_spring', label: 'kwiaty_wiosenne' },
    { id: 'season_wiosna_2', type: 'artifact' as ItemType, x: 200, y: 520, w: 32, h: 32, questId: 'quest_season_garden_spring', label: 'konewka_ogrod' },
    { id: 'season_wiosna_3', type: 'artifact' as ItemType, x: 1200, y: 520, w: 32, h: 32, questId: 'quest_season_garden_spring', label: 'nasiona_wiosna' },
    { id: 'season_wiosna_4', type: 'artifact' as ItemType, x: 400, y: 290, w: 32, h: 32, questId: 'quest_season_garden_spring', label: 'tulipan' },
    // quest_season_butterflies (5 items)
    { id: 'season_wiosna_5', type: 'artifact' as ItemType, x: 1300, y: 520, w: 32, h: 32, questId: 'quest_season_butterflies', label: 'motyl_wiosna' },
    { id: 'season_wiosna_6', type: 'artifact' as ItemType, x: -400, y: 520, w: 32, h: 32, questId: 'quest_season_butterflies', label: 'biedronka' },
    { id: 'season_wiosna_7', type: 'artifact' as ItemType, x: 600, y: 290, w: 32, h: 32, questId: 'quest_season_butterflies', label: 'krokus' },
    { id: 'season_wiosna_8', type: 'artifact' as ItemType, x: 1400, y: 520, w: 32, h: 32, questId: 'quest_season_butterflies', label: 'ptasie_gniazdo' },
    { id: 'season_wiosna_9', type: 'artifact' as ItemType, x: 350, y: 70, w: 32, h: 32, questId: 'quest_season_butterflies', label: 'bocian' },
    // quest_season_rain_walk (4 items)
    { id: 'season_wiosna_10', type: 'artifact' as ItemType, x: -500, y: 520, w: 32, h: 32, questId: 'quest_season_rain_walk', label: 'deszczowka' },
    { id: 'season_wiosna_11', type: 'artifact' as ItemType, x: 750, y: 520, w: 32, h: 32, questId: 'quest_season_rain_walk', label: 'gumowce' },
    { id: 'season_wiosna_12', type: 'artifact' as ItemType, x: -350, y: 520, w: 32, h: 32, questId: 'quest_season_rain_walk', label: 'parasol' },
    { id: 'season_wiosna_13', type: 'artifact' as ItemType, x: 500, y: 70, w: 32, h: 32, questId: 'quest_season_rain_walk', label: 'wiosenna_salatka' },
    // quest_season_birds — shares 2 items from garden_spring via universal matching
    // quest_season_spring_clean — shares items via universal matching
    // quest_season_kite — shares items via universal matching
    // Remaining wiosna fillers for birds/spring_clean/kite (2 more to reach 15)
    { id: 'season_wiosna_14', type: 'artifact' as ItemType, x: 130, y: 290, w: 32, h: 32, questId: 'quest_season_birds', label: 'rower_wiosna' },
    { id: 'season_wiosna_15', type: 'artifact' as ItemType, x: -900, y: 520, w: 32, h: 32, questId: 'quest_season_kite', label: 'latawiec' },

    // == LATO (Summer) — 15 items across 6 quests ==
    // quest_season_beach (5 items)
    { id: 'season_lato_1', type: 'artifact' as ItemType, x: 1150, y: 520, w: 32, h: 32, questId: 'quest_season_beach', label: 'zamek_z_piasku' },
    { id: 'season_lato_2', type: 'artifact' as ItemType, x: -300, y: 520, w: 32, h: 32, questId: 'quest_season_beach', label: 'muszla' },
    { id: 'season_lato_3', type: 'artifact' as ItemType, x: 300, y: 520, w: 32, h: 32, questId: 'quest_season_beach', label: 'raczek' },
    { id: 'season_lato_4', type: 'artifact' as ItemType, x: 1350, y: 520, w: 32, h: 32, questId: 'quest_season_beach', label: 'plazowa_pilka' },
    { id: 'season_lato_5', type: 'artifact' as ItemType, x: 250, y: 70, w: 32, h: 32, questId: 'quest_season_beach', label: 'okulary_sloneczne' },
    // quest_season_ice_cream (4 items)
    { id: 'season_lato_6', type: 'artifact' as ItemType, x: 150, y: 520, w: 32, h: 32, questId: 'quest_season_ice_cream', label: 'lody_letnie' },
    { id: 'season_lato_7', type: 'artifact' as ItemType, x: 700, y: 290, w: 32, h: 32, questId: 'quest_season_ice_cream', label: 'arbuz' },
    { id: 'season_lato_8', type: 'artifact' as ItemType, x: -1000, y: 520, w: 32, h: 32, questId: 'quest_season_ice_cream', label: 'koktajl' },
    { id: 'season_lato_9', type: 'artifact' as ItemType, x: 550, y: 520, w: 32, h: 32, questId: 'quest_season_ice_cream', label: 'krem_do_opalania' },
    // quest_season_pool (3 items)
    { id: 'season_lato_10', type: 'artifact' as ItemType, x: 1450, y: 520, w: 32, h: 32, questId: 'quest_season_pool', label: 'basen' },
    { id: 'season_lato_11', type: 'artifact' as ItemType, x: 450, y: 290, w: 32, h: 32, questId: 'quest_season_pool', label: 'hamak_lato' },
    { id: 'season_lato_12', type: 'artifact' as ItemType, x: -800, y: 520, w: 32, h: 32, questId: 'quest_season_pool', label: 'motylki_lato' },
    // quest_season_grill (1 item) + quest_season_bugs (1 item) + quest_season_lemonade (1 item)
    { id: 'season_lato_13', type: 'artifact' as ItemType, x: 950, y: 520, w: 32, h: 32, questId: 'quest_season_grill', label: 'grill_letni' },
    { id: 'season_lato_14', type: 'artifact' as ItemType, x: 600, y: 70, w: 32, h: 32, questId: 'quest_season_bugs', label: 'wiatrak' },
    { id: 'season_lato_15', type: 'artifact' as ItemType, x: -550, y: 520, w: 32, h: 32, questId: 'quest_season_lemonade', label: 'lemonada' },

    // == JESIEN (Autumn) — 15 items across 6 quests ==
    // quest_season_mushrooms (5 items)
    { id: 'season_jesien_1', type: 'artifact' as ItemType, x: 1100, y: 520, w: 32, h: 32, questId: 'quest_season_mushrooms', label: 'grzyb' },
    { id: 'season_jesien_2', type: 'artifact' as ItemType, x: -450, y: 520, w: 32, h: 32, questId: 'quest_season_mushrooms', label: 'jablko_jesien' },
    { id: 'season_jesien_3', type: 'artifact' as ItemType, x: 200, y: 290, w: 32, h: 32, questId: 'quest_season_mushrooms', label: 'wiewiorka' },
    { id: 'season_jesien_4', type: 'artifact' as ItemType, x: 1250, y: 520, w: 32, h: 32, questId: 'quest_season_mushrooms', label: 'herbata_jesienna' },
    { id: 'season_jesien_5', type: 'artifact' as ItemType, x: 400, y: 70, w: 32, h: 32, questId: 'quest_season_mushrooms', label: 'drozd' },
    // quest_season_pumpkin (4 items)
    { id: 'season_jesien_6', type: 'artifact' as ItemType, x: 1400, y: 520, w: 32, h: 32, questId: 'quest_season_pumpkin', label: 'dynia' },
    { id: 'season_jesien_7', type: 'artifact' as ItemType, x: 500, y: 520, w: 32, h: 32, questId: 'quest_season_pumpkin', label: 'swiecka_jesien' },
    { id: 'season_jesien_8', type: 'artifact' as ItemType, x: -600, y: 520, w: 32, h: 32, questId: 'quest_season_pumpkin', label: 'latarnia' },
    { id: 'season_jesien_9', type: 'artifact' as ItemType, x: 300, y: 290, w: 32, h: 32, questId: 'quest_season_pumpkin', label: 'szalik' },
    // quest_season_chestnuts (2 items)
    { id: 'season_jesien_10', type: 'artifact' as ItemType, x: -1050, y: 520, w: 32, h: 32, questId: 'quest_season_chestnuts', label: 'kastany' },
    { id: 'season_jesien_11', type: 'artifact' as ItemType, x: 800, y: 520, w: 32, h: 32, questId: 'quest_season_chestnuts', label: 'jesienny_lisc' },
    // quest_season_leaves (1 item)
    { id: 'season_jesien_12', type: 'artifact' as ItemType, x: 650, y: 290, w: 32, h: 32, questId: 'quest_season_leaves', label: 'deszczyk' },
    // quest_season_pie (2 items)
    { id: 'season_jesien_13', type: 'artifact' as ItemType, x: 120, y: 520, w: 32, h: 32, questId: 'quest_season_pie', label: 'ciasto_jesien' },
    { id: 'season_jesien_14', type: 'artifact' as ItemType, x: 550, y: 70, w: 32, h: 32, questId: 'quest_season_pie', label: 'wrzos' },
    // quest_season_scarecrow (1 item)
    { id: 'season_jesien_15', type: 'artifact' as ItemType, x: -850, y: 520, w: 32, h: 32, questId: 'quest_season_scarecrow', label: 'dres_jesienny' },

    // == ZIMA (Winter) — 15 items across 6 quests ==
    // quest_season_snowman (5 items)
    { id: 'season_zima_1', type: 'artifact' as ItemType, x: 1150, y: 520, w: 32, h: 32, questId: 'quest_season_snowman', label: 'balwan' },
    { id: 'season_zima_2', type: 'artifact' as ItemType, x: -400, y: 520, w: 32, h: 32, questId: 'quest_season_snowman', label: 'sniezka' },
    { id: 'season_zima_3', type: 'artifact' as ItemType, x: 350, y: 290, w: 32, h: 32, questId: 'quest_season_snowman', label: 'rekawice' },
    { id: 'season_zima_4', type: 'artifact' as ItemType, x: 1350, y: 520, w: 32, h: 32, questId: 'quest_season_snowman', label: 'kozuch' },
    { id: 'season_zima_5', type: 'artifact' as ItemType, x: 300, y: 70, w: 32, h: 32, questId: 'quest_season_snowman', label: 'kominek_zima' },
    // quest_season_sled (4 items)
    { id: 'season_zima_6', type: 'artifact' as ItemType, x: -550, y: 520, w: 32, h: 32, questId: 'quest_season_sled', label: 'sanki' },
    { id: 'season_zima_7', type: 'artifact' as ItemType, x: 600, y: 520, w: 32, h: 32, questId: 'quest_season_sled', label: 'narty' },
    { id: 'season_zima_8', type: 'artifact' as ItemType, x: 450, y: 70, w: 32, h: 32, questId: 'quest_season_sled', label: 'gwiazda_zima' },
    { id: 'season_zima_9', type: 'artifact' as ItemType, x: 1450, y: 520, w: 32, h: 32, questId: 'quest_season_sled', label: 'koleda' },
    // quest_season_christmas_tree (2 items)
    { id: 'season_zima_10', type: 'artifact' as ItemType, x: 500, y: 290, w: 32, h: 32, questId: 'quest_season_christmas_tree', label: 'choinka' },
    { id: 'season_zima_11', type: 'artifact' as ItemType, x: 750, y: 290, w: 32, h: 32, questId: 'quest_season_christmas_tree', label: 'bombka' },
    // quest_season_hot_choc (2 items)
    { id: 'season_zima_12', type: 'artifact' as ItemType, x: 200, y: 520, w: 32, h: 32, questId: 'quest_season_hot_choc', label: 'czekolada' },
    { id: 'season_zima_13', type: 'artifact' as ItemType, x: -950, y: 520, w: 32, h: 32, questId: 'quest_season_hot_choc', label: 'piernik' },
    // quest_season_snow_fight (1 item)
    { id: 'season_zima_14', type: 'artifact' as ItemType, x: 1000, y: 520, w: 32, h: 32, questId: 'quest_season_snow_fight', label: 'renifer' },
    // quest_season_presents (1 item)
    { id: 'season_zima_15', type: 'artifact' as ItemType, x: 650, y: 70, w: 32, h: 32, questId: 'quest_season_presents', label: 'prezent_zima' },
  ],

  quests: [
    // Quest 1: Zbierz jabłka
    {
      id: 'quest_apples', title: '🍎 Zbierz jabłka!', npcId: 'mama', category: 'codzienne',
      steps: [
        { type: 'talk', description: 'Porozmawiaj z Mamą', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 5 jabłek + koszyk 🧺', icon: '🍎', itemType: 'apple', targetCount: 7, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś jabłka Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Rozwiąż zadanie!', icon: '🧮', mathProblem: MATH_PROBLEMS[0], completed: false },
      ],
      currentStep: 0, completed: false, active: true, reward: 1, costumeReward: 'hat_pirate',
    },
    // Quest 2: Posprzątaj pokój
    {
      id: 'quest_toys', title: '🧸 Posprzątaj pokój!', npcId: 'tata', category: 'codzienne',
      steps: [
        { type: 'talk', description: 'Porozmawiaj z Tatą', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 zabawki + pudełko 📦', icon: '🧸', targetCount: 6, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Taty', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Rozwiąż zadanie!', icon: '🧮', mathProblem: MATH_PROBLEMS[1], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1, costumeReward: 'hat_crown',
    },
    // Quest 3: Zbuduj wieżę z LEGO
    {
      id: 'quest_lego', title: '🧱 Zbuduj wieżę z LEGO!', npcId: 'tata', category: 'codzienne',
      steps: [
        { type: 'talk', description: 'Porozmawiaj z Tatą', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 6 klocków + instrukcję 📖', icon: '🧱', targetCount: 8, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Taty z klockami', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Policz klocki!', icon: '🧮', mathProblem: MATH_PROBLEMS[6], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, costumeReward: 'hat_wizard',
    },
    // Quest 4: Przepędź kota
    {
      id: 'quest_cat', title: '🐱 Przepędź kota!', npcId: 'mama', category: 'przygody',
      steps: [
        { type: 'talk', description: 'Mama mówi o kocie w ogrodzie', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 ciasteczka + kłębek 🧶', icon: '🍪', itemType: 'cookie', targetCount: 5, currentCount: 0, completed: false },
        { type: 'chase', description: 'Podejdź do kota — ucieknie!', icon: '🐱', targetNpcId: 'kot', completed: false },
        { type: 'deliver', description: 'Wróć do Mamy', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Zagadka o ciasteczkach!', icon: '🧮', mathProblem: MATH_PROBLEMS[4], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, costumeReward: 'hat_cowboy',
    },
    // Quest 5: Listonosz
    {
      id: 'quest_mailman', title: '📬 Otwórz listonoszowi!', npcId: 'listonosz', category: 'przygody',
      steps: [
        { type: 'talk', description: 'Otwórz drzwi listonoszowi', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 listy + znaczek 💌', icon: '✉️', itemType: 'letter', targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś listy Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Policz listy!', icon: '🧮', mathProblem: MATH_PROBLEMS[5], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1, costumeReward: 'glasses_cool',
    },
    // Quest 6: Pomóż mamie gotować
    {
      id: 'quest_cook', title: '🍳 Pomóż mamie gotować!', npcId: 'mama', category: 'codzienne',
      steps: [
        { type: 'talk', description: 'Mama potrzebuje składników!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 składniki + fartuszek 👨‍🍳', icon: '🥕', itemType: 'ingredient', targetCount: 6, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Daj składniki Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile składników razem?', icon: '🧮', mathProblem: MATH_PROBLEMS[9], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, costumeReward: 'hat_chef',
    },
    // Quest 7: Podlej kwiatki
    {
      id: 'quest_flowers', title: '🌸 Podlej kwiatki!', npcId: 'mama', category: 'codzienne',
      steps: [
        { type: 'talk', description: 'Mama prosi o podlanie kwiatów', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 5 kwiatków + rękawiczki 🧤', icon: '🌸', itemType: 'flower', targetCount: 7, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Mamy', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile kwiatków zostało?', icon: '🧮', mathProblem: MATH_PROBLEMS[7], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1, costumeReward: 'glasses_heart',
    },
    // Quest 8: Znajdź Jurka (plush dog hide and seek)
    {
      id: 'quest_jurek', title: '🐕 Znajdź Jurka!', npcId: 'tata', category: 'przygody',
      steps: [
        { type: 'talk', description: 'Tata mówi: Jurek się schował!', icon: '💬', completed: false },
        { type: 'collect', description: 'Znajdź 3 pluszaki + smycz 🦮', icon: '🐕', targetCount: 5, currentCount: 0, completed: false },
        { type: 'find', description: 'Znajdź Jurka!', icon: '🐕', targetNpcId: 'jurek_npc', completed: false },
        { type: 'deliver', description: 'Zanieś Jurka do Taty', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile pluszaków znalazłeś?', icon: '🧮', mathProblem: MATH_PROBLEMS[8], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, costumeReward: 'glasses_star',
    },
    // Quest 9: Kurier — paczka od kuriera
    {
      id: 'quest_courier', title: '📦 Paczka od kuriera!', npcId: 'mama', category: 'przygody',
      steps: [
        { type: 'talk', description: 'Mama czeka na paczkę', icon: '💬', completed: false },
        { type: 'collect', description: 'Idź do ogródka + znajdź piłeczkę 🎾', icon: '📦', targetCount: 2, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś paczkę Mamie!', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Zagadka o paczkach!', icon: '🧮', mathProblem: MATH_PROBLEMS[12], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, costumeReward: 'acc_package',
    },
    // === 10 NEW QUESTS ===
    // Quest 10: Wujek Tomek (BMW 4 Cabrio from left)
    {
      id: 'quest_uncle', title: '🚗 Wujek przyjechał!', npcId: 'wujek', category: 'przygody',
      steps: [
        { type: 'talk', description: 'Powitaj Wujka Tomka', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 książki + prezent 🎁', icon: '📚', itemType: 'book', targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś książki Tacie', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Zagadka o książkach!', icon: '🧮', mathProblem: MATH_PROBLEMS[13], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest 11: Budowlaniec (construction site)
    {
      id: 'quest_crane', title: '🏗️ Pomóż na budowie!', npcId: 'budowlaniec', category: 'przygody',
      steps: [
        { type: 'talk', description: 'Porozmawiaj z Panem Jackiem', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 narzędzia + kask ⛑️', icon: '🔧', itemType: 'key', targetCount: 6, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś narzędzia Panu Jackowi', icon: '🏃', targetNpcId: 'budowlaniec', completed: false },
        { type: 'math', description: 'Policz narzędzia!', icon: '🧮', mathProblem: MATH_PROBLEMS[14], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest 12: Pomóż sąsiadce w ogrodzie
    {
      id: 'quest_garden_help', title: '🌻 Pomóż Pani Basi!', npcId: 'sasiadka', category: 'przygody',
      steps: [
        { type: 'talk', description: 'Pani Basia potrzebuje pomocy', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 konewki + nasionka 🌱', icon: '🚿', itemType: 'watering_can', targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś konewki Pani Basi', icon: '🏃', targetNpcId: 'sasiadka', completed: false },
        { type: 'math', description: 'Ile grządek podlałeś?', icon: '🧮', mathProblem: MATH_PROBLEMS[15], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1,
    },
    // Quest 13: Sprzątanie łazienki
    {
      id: 'quest_bathroom', title: '🧹 Posprzątaj łazienkę!', npcId: 'mama', category: 'codzienne',
      steps: [
        { type: 'talk', description: 'Mama prosi o pomoc', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 rzeczy w łazience', icon: '🧹', itemType: 'ingredient', targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Powiedz Mamie że gotowe', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile zostało brudnych?', icon: '🧮', mathProblem: MATH_PROBLEMS[16], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1,
    },
    // Quest 14: Wspinaczka — gwiazdki na budowie
    {
      id: 'quest_climb', title: '⭐ Gwiazdki na budowie!', npcId: 'budowlaniec', category: 'przygody',
      steps: [
        { type: 'talk', description: 'Pan Jacek widział gwiazdki', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 5 gwiazdek na rusztowaniach', icon: '⭐', itemType: 'star', targetCount: 6, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Pana Jacka', icon: '🏃', targetNpcId: 'budowlaniec', completed: false },
        { type: 'math', description: 'Ile gwiazdek znalazłeś?', icon: '🧮', mathProblem: MATH_PROBLEMS[17], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest 15: Poszukiwanie skarbów
    {
      id: 'quest_treasure', title: '🔑 Poszukiwanie skarbów!', npcId: 'tata', category: 'przygody',
      steps: [
        { type: 'talk', description: 'Tata ukrył skarby po świecie!', icon: '💬', completed: false },
        { type: 'collect', description: 'Znajdź 4 klucze + mapę 🗺️', icon: '🔑', itemType: 'key', targetCount: 6, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Taty z kluczami', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile skrzyń otworzysz?', icon: '🧮', mathProblem: MATH_PROBLEMS[18], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest 16: Narysuj obrazek
    {
      id: 'quest_draw', title: '🖍️ Narysuj obrazek!', npcId: 'mama', category: 'codzienne',
      steps: [
        { type: 'talk', description: 'Mama chce obrazek na lodówkę!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 kredki + blok 📋', icon: '🖍️', itemType: 'crayon', targetCount: 6, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś rysunek Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile kredek użyłeś?', icon: '🧮', mathProblem: MATH_PROBLEMS[19], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1,
    },
    // Quest 17: Koncert na pianinie
    {
      id: 'quest_piano', title: '🎹 Koncert dla rodziny!', npcId: 'tata', category: 'codzienne',
      steps: [
        { type: 'talk', description: 'Tata chce posłuchać koncertu', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 nuty w pokoju Kuby', icon: '🎵', itemType: 'star', targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zagraj koncert dla Taty', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile nut zagrałeś?', icon: '🧮', mathProblem: MATH_PROBLEMS[20], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1,
    },
    // Quest 18: Tort bananowy
    {
      id: 'quest_banana', title: '🍌 Tort bananowy!', npcId: 'mama', category: 'przygody',
      steps: [
        { type: 'talk', description: 'Mama robi tort bananowy!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 banany + tortownicę 🎂', icon: '🍌', itemType: 'banana', targetCount: 6, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś banany Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile bananów potrzeba?', icon: '🧮', mathProblem: MATH_PROBLEMS[21], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest 19: Zabawa z Frankiem
    {
      id: 'quest_franek', title: '🐾 Zabawa z Frankiem!', npcId: 'mama', category: 'przygody',
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
      id: 'quest_brush_teeth', title: '🪥 Umyj ząbki!', npcId: 'mama', category: 'higiena',
      steps: [
        { type: 'talk', description: 'Mama mówi: pora na mycie zębów!', icon: '💬', completed: false },
        { type: 'collect', description: 'Znajdź 3 szczoteczki + pastę 🪥', icon: '🪥', itemType: 'toothbrush', targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Mamy i pokaż zęby!', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Zagadka o zębach!', icon: '🧮', mathProblem: MATH_PROBLEMS[23], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1,
    },
    // Quest 21: Mycie rąk (Mirek - lekarz sąsiad uczy higieny)
    {
      id: 'quest_wash_hands', title: '🧼 Umyj rączki!', npcId: 'mirek', category: 'higiena',
      steps: [
        { type: 'talk', description: 'Pan Mirek uczy o myciu rąk!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 mydełka + ręcznik 🧻', icon: '🧼', itemType: 'soap', targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Pokaż Panu Mirkowi czyste ręce', icon: '🏃', targetNpcId: 'mirek', completed: false },
        { type: 'math', description: 'Ile razy umyłeś ręce?', icon: '🧮', mathProblem: MATH_PROBLEMS[24], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, costumeReward: 'acc_stethoscope',
    },
    // Quest 22: Kąpiel
    {
      id: 'quest_bath', title: '🛁 Pora na kąpiel!', npcId: 'mama', category: 'higiena',
      steps: [
        { type: 'talk', description: 'Mama mówi: kąpielowe przygody!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz kaczuszki, szampon + bańki 🫧', icon: '🐤', targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Mamy — pora do wanny!', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Zagadka kąpielowa!', icon: '🧮', mathProblem: MATH_PROBLEMS[25], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1, costumeReward: 'hat_shower',
    },
    // Quest 23: Czesanie
    {
      id: 'quest_comb_hair', title: '💇 Uczesz się!', npcId: 'mama', category: 'higiena',
      steps: [
        { type: 'talk', description: 'Mama mówi: włosy do czesania!', icon: '💬', completed: false },
        { type: 'collect', description: 'Znajdź 3 grzebienie', icon: '💇', itemType: 'comb', targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Pokaż Mamie ładną fryzurę', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Zagadka o czesaniu!', icon: '🧮', mathProblem: MATH_PROBLEMS[26], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1,
    },
    // Quest 24: Piżama
    {
      id: 'quest_pajamas', title: '👕 Ubierz piżamę!', npcId: 'tata', category: 'higiena',
      steps: [
        { type: 'talk', description: 'Tata mówi: pora na piżamę!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 piżamy + maskotkę 🌙', icon: '👕', itemType: 'pajama', targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Pokaż Tacie gotowego do snu!', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile części ma piżama?', icon: '🧮', mathProblem: MATH_PROBLEMS[28], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 1,
    },
    // Quest 25: Mistrz higieny (meta quest — after completing hygiene quests)
    {
      id: 'quest_hygiene_master', title: '🏆 Mistrz higieny!', npcId: 'mirek', category: 'higiena',
      steps: [
        { type: 'talk', description: 'Pan Mirek ma specjalną nagrodę!', icon: '💬', completed: false },
        { type: 'deliver', description: 'Opowiedz o higienie!', icon: '🏃', targetNpcId: 'mirek', completed: false },
        { type: 'math', description: 'Zagadka o czystych uszkach!', icon: '🧮', mathProblem: MATH_PROBLEMS[27], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 3, costumeReward: 'glasses_doctor',
    },

    // === PREGNANCY STORY QUEST ===
    // === SIOSTRZYCZKA QUEST LINE (6 misji o przygotowaniu na poród) ===
    // Quest 26: Wiadomość o siostrzyczce
    {
      id: 'quest_baby', title: '👶 Siostrzyczka nadchodzi!', npcId: 'mama', category: 'specjalne',
      steps: [
        { type: 'talk', description: 'Mama ma ważną wiadomość!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 rzeczy + smoczek 👶', icon: '🍼', targetCount: 6, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś wszystko Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile miesięcy nosi się dzidzi?', icon: '🧮', mathProblem: MATH_PROBLEMS[27], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 3, costumeReward: 'hat_baby',
    },
    // Quest: Imię dla siostrzyczki
    {
      id: 'quest_baby_name', title: '💝 Imię dla siostrzyczki', npcId: 'mama', category: 'specjalne',
      steps: [
        { type: 'talk', description: 'Porozmawiaj z Mamą o imieniu', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 karteczki z imionami', icon: '📝', itemType: 'baby_name_card', targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś karteczki do Taty', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile liter w imieniu Zuzia?', icon: '🧮', mathProblem: MATH_PROBLEMS[36], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest: Torba do szpitala
    {
      id: 'quest_hospital_bag', title: '🏥 Torba do szpitala', npcId: 'mama', category: 'specjalne',
      steps: [
        { type: 'talk', description: 'Mama mówi co spakować', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 rzeczy do torby', icon: '👜', itemType: 'hospital_item', targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś torbę do Mamy', icon: '🏃', targetNpcId: 'mama', completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest: Pokój dla siostrzyczki
    {
      id: 'quest_baby_room', title: '🎀 Pokój dla siostrzyczki', npcId: 'tata', category: 'specjalne',
      steps: [
        { type: 'talk', description: 'Tata mówi co przygotować', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 dekoracje do pokoju', icon: '🎨', itemType: 'baby_decor', targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś dekoracje do Taty', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile misiów w pokoju dzidzi?', icon: '🧮', mathProblem: MATH_PROBLEMS[37], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest: Prezent od braciszka
    {
      id: 'quest_baby_gift', title: '🎁 Prezent od Kuby', npcId: 'mama', category: 'specjalne',
      steps: [
        { type: 'talk', description: 'Mama ma pomysł na prezent', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz materiały na rysunek', icon: '🖍️', itemType: 'craft_supply', targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Pokaż rysunek Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest: Ćwiczenia oddechowe z Mamą
    {
      id: 'quest_breathing', title: '🫁 Oddychamy razem!', npcId: 'mama', category: 'specjalne',
      steps: [
        { type: 'talk', description: 'Mama uczy ćwiczeń oddechowych', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 3 baloniki do ćwiczeń', icon: '🎈', itemType: 'balloon', targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Mamy z balonikami', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile oddechów na minutę?', icon: '🧮', mathProblem: MATH_PROBLEMS[38], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest: Wujek Rafał wraca z Wietnamu
    {
      id: 'quest_rafal', title: '🎒 Wujek Rafał wraca!', npcId: 'mama', category: 'specjalne',
      steps: [
        { type: 'talk', description: 'Mama ma wiadomość o Wujku!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz pierogi, ptasie mleczko + pamiątkę 🏝️', icon: '🥟', targetCount: 7, currentCount: 0, completed: false },
        { type: 'math', description: 'Ile jedzenia przygotowałeś?', icon: '🧮', mathProblem: MATH_PROBLEMS[28], completed: false },
        { type: 'deliver', description: 'Powitaj Wujka Rafała!', icon: '🎒', targetNpcId: 'rafal', completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 3, costumeReward: 'hat_vietnam',
    },
    // Quest: Kawka dla Taty (gabinet/szkolenie)
    {
      id: 'quest_coffee', title: '☕ Kawka dla Taty', npcId: 'mama', category: 'posilki',
      steps: [
        { type: 'talk', description: 'Mama prosi o pomoc!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz kawę, mleko, ciasteczko + filiżankę ☕', icon: '☕', targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś kawkę Tacie do gabinetu', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile kaw piją rodzice?', icon: '🧮', mathProblem: MATH_PROBLEMS[29], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest: Śniadanie — gofry!
    {
      id: 'quest_breakfast', title: '🧇 Śniadanie — gofry!', npcId: 'tata', category: 'posilki',
      steps: [
        { type: 'talk', description: 'Tata robi gofry!', icon: '💬', completed: false },
        { type: 'collect', description: 'Podaj składniki + patelnię 🍳', icon: '🧇', targetCount: 6, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś wszystko Tacie', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile składników na gofry?', icon: '🧮', mathProblem: MATH_PROBLEMS[30], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 3, costumeReward: 'hat_chef_pro',
    },
    // Quest: Obiad — zupa!
    {
      id: 'quest_lunch', title: '🍲 Obiad — zupka!', npcId: 'mama', category: 'posilki',
      steps: [
        { type: 'talk', description: 'Mama gotuje obiad!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz marchewki, składniki i chleb', icon: '🍲', targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś wszystko Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile talerzy zupy?', icon: '🧮', mathProblem: MATH_PROBLEMS[31], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest: Kolacja — kanapki!
    {
      id: 'quest_dinner', title: '🍞 Kolacja — kanapki!', npcId: 'mama', category: 'posilki',
      steps: [
        { type: 'talk', description: 'Mama przygotowuje kolację!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz kanapki + talerz 🍽️', icon: '🍞', targetCount: 6, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś składniki Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile kanapek zrobiła Mama?', icon: '🧮', mathProblem: MATH_PROBLEMS[32], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 3, costumeReward: 'acc_apron',
    },
    // === ŻABKA & PACZKOMAT & MOVIE NIGHT QUESTS ===
    // Quest: Zakupy w Żabce
    {
      id: 'quest_zabka', title: '🐸 Zakupy w Żabce!', npcId: 'mama', category: 'przygody',
      steps: [
        { type: 'talk', description: 'Mama daje listę zakupów!', icon: '💬', completed: false },
        { type: 'collect', description: 'Kup 4 produkty w Żabce', icon: '🛒', targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś zakupy Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile produktów kupiłeś?', icon: '🧮', mathProblem: MATH_PROBLEMS[33], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, costumeReward: 'hat_zabka',
    },
    // Quest: Odbierz paczkę z Paczkomatu
    {
      id: 'quest_paczkomat', title: '📦 Paczka z Paczkomatu!', npcId: 'tata', category: 'przygody',
      steps: [
        { type: 'talk', description: 'Tata czeka na paczkę!', icon: '💬', completed: false },
        { type: 'collect', description: 'Odbierz 3 paczki', icon: '📦', itemType: 'parcel', targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś paczki Tacie', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile paczek w paczkomacie?', icon: '🧮', mathProblem: MATH_PROBLEMS[34], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2,
    },
    // Quest: Wieczór filmowy z projektorem
    {
      id: 'quest_movie_night', title: '🎬 Wieczór filmowy!', npcId: 'tata', category: 'specjalne',
      steps: [
        { type: 'talk', description: 'Tata ma pomysł na wieczór!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 porcje popcornu', icon: '🍿', targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś popcorn do salonu', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile osób ogląda film?', icon: '🧮', mathProblem: MATH_PROBLEMS[35], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 3, costumeReward: 'acc_popcorn',
    },

    // === SEASONAL QUESTS (24 quests, 6 per season) ===

    // ---- WIOSNA (Spring) ----
    // Quest: Sadzenie kwiatów z mamą
    {
      id: 'quest_season_garden_spring', title: '🌷 Sadzenie kwiatów!', npcId: 'mama', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Mama chce sadzić kwiatki!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 wiosenne rzeczy', icon: '🌷', itemType: 'artifact' as ItemType, targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś kwiatki Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile kwiatków posadziliśmy?', icon: '🧮', mathProblem: MATH_PROBLEMS[0], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'wiosna' as SeasonType,
    },
    // Quest: Łapanie motyli z Frankiem
    {
      id: 'quest_season_butterflies', title: '🦋 Łapanie motyli!', npcId: 'franek', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Franek widzi motyle!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 5 wiosennych skarbów', icon: '🦋', itemType: 'artifact' as ItemType, targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Franka', icon: '🏃', targetNpcId: 'franek', completed: false },
        { type: 'math', description: 'Ile motyli widzieliśmy?', icon: '🧮', mathProblem: MATH_PROBLEMS[1], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'wiosna' as SeasonType,
    },
    // Quest: Spacer w deszczu z tatą
    {
      id: 'quest_season_rain_walk', title: '🌧️ Spacer w deszczu!', npcId: 'tata', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Tata zaprasza na spacer!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 deszczowe skarby', icon: '☂️', itemType: 'artifact' as ItemType, targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Taty', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile kropelek spadło?', icon: '🧮', mathProblem: MATH_PROBLEMS[2], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'wiosna' as SeasonType,
    },
    // Quest: Budowanie budki dla ptaków
    {
      id: 'quest_season_birds', title: '🪺 Budka dla ptaków!', npcId: 'tata', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Tata chce zbudować budkę!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 materiały', icon: '🪺', itemType: 'artifact' as ItemType, targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś materiały Tacie', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile desek potrzebujemy?', icon: '🧮', mathProblem: MATH_PROBLEMS[3], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'wiosna' as SeasonType,
    },
    // Quest: Wielkie sprzątanie ogrodu
    {
      id: 'quest_season_spring_clean', title: '🌱 Sprzątanie ogrodu!', npcId: 'mama', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Mama chce posprzątać ogród!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 5 rzeczy z ogrodu', icon: '🌱', itemType: 'artifact' as ItemType, targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś wszystko Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile rzeczy posprzątaliśmy?', icon: '🧮', mathProblem: MATH_PROBLEMS[4], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'wiosna' as SeasonType,
    },
    // Quest: Puszczanie latawców
    {
      id: 'quest_season_kite', title: '🪁 Puszczamy latawce!', npcId: 'tata', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Tata ma latawce!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 wiosenne rzeczy', icon: '🪁', itemType: 'artifact' as ItemType, targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Taty', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile latawców lata?', icon: '🧮', mathProblem: MATH_PROBLEMS[5], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'wiosna' as SeasonType,
    },

    // ---- LATO (Summer) ----
    // Quest: Budowanie zamku z piasku
    {
      id: 'quest_season_beach', title: '🏖️ Zamek z piasku!', npcId: 'tata', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Tata chce budować zamek!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 5 letnich skarbów', icon: '🏖️', itemType: 'artifact' as ItemType, targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Taty', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile wież ma zamek?', icon: '🧮', mathProblem: MATH_PROBLEMS[6], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'lato' as SeasonType,
    },
    // Quest: Przygotuj lody dla rodziny
    {
      id: 'quest_season_ice_cream', title: '🍦 Lody dla rodziny!', npcId: 'mama', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Mama chce zrobić lody!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 letnie składniki', icon: '🍦', itemType: 'artifact' as ItemType, targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś składniki Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile gałek lodów?', icon: '🧮', mathProblem: MATH_PROBLEMS[7], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'lato' as SeasonType,
    },
    // Quest: Zabawy w basenie
    {
      id: 'quest_season_pool', title: '🏊 Zabawy w basenie!', npcId: 'tata', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Tata napełnił basen!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 5 rzeczy do basenu', icon: '🏊', itemType: 'artifact' as ItemType, targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Taty', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile osób w basenie?', icon: '🧮', mathProblem: MATH_PROBLEMS[8], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'lato' as SeasonType,
    },
    // Quest: Pomóż przy grillu
    {
      id: 'quest_season_grill', title: '🍖 Pomóż przy grillu!', npcId: 'tata', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Tata rozpala grilla!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 grillowe rzeczy', icon: '🍖', itemType: 'artifact' as ItemType, targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś Tacie', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile kiełbasek na grillu?', icon: '🧮', mathProblem: MATH_PROBLEMS[9], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'lato' as SeasonType,
    },
    // Quest: Poszukiwanie owadów
    {
      id: 'quest_season_bugs', title: '🐚 Poszukiwanie skarbów!', npcId: 'franek', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Franek szuka skarbów!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 letnie skarby', icon: '🐚', itemType: 'artifact' as ItemType, targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Pokaż Frankowi', icon: '🏃', targetNpcId: 'franek', completed: false },
        { type: 'math', description: 'Ile skarbów znaleźliśmy?', icon: '🧮', mathProblem: MATH_PROBLEMS[10], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'lato' as SeasonType,
    },
    // Quest: Zrób lemoniadę
    {
      id: 'quest_season_lemonade', title: '🍋 Zrób lemoniadę!', npcId: 'mama', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Mama chce lemoniadę!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 5 składników', icon: '🍋', itemType: 'artifact' as ItemType, targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś składniki Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile szklanek lemoniady?', icon: '🧮', mathProblem: MATH_PROBLEMS[11], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'lato' as SeasonType,
    },

    // ---- JESIEN (Autumn) ----
    // Quest: Zbieranie grzybów z tatą
    {
      id: 'quest_season_mushrooms', title: '🍄 Zbieranie grzybów!', npcId: 'tata', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Tata idzie na grzyby!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 5 jesiennych skarbów', icon: '🍄', itemType: 'artifact' as ItemType, targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Pokaż grzyby Tacie', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile grzybów zebraliśmy?', icon: '🧮', mathProblem: MATH_PROBLEMS[0], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'jesien' as SeasonType,
    },
    // Quest: Rzeźbienie dyni na Halloween
    {
      id: 'quest_season_pumpkin', title: '🎃 Rzeźbienie dyni!', npcId: 'mama', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Mama ma dynie!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 halloweenowe rzeczy', icon: '🎃', itemType: 'artifact' as ItemType, targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś dynie Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile dyni wyrzeźbiliśmy?', icon: '🧮', mathProblem: MATH_PROBLEMS[1], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'jesien' as SeasonType,
    },
    // Quest: Zbieranie kasztanów
    {
      id: 'quest_season_chestnuts', title: '🌰 Zbieranie kasztanów!', npcId: 'tata', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Tata widzi kasztany!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 5 kasztanów', icon: '🌰', itemType: 'artifact' as ItemType, targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś kasztany Tacie', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile kasztanów mamy?', icon: '🧮', mathProblem: MATH_PROBLEMS[2], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'jesien' as SeasonType,
    },
    // Quest: Skaczemy w liściach!
    {
      id: 'quest_season_leaves', title: '🍁 Skaczemy w liściach!', npcId: 'franek', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Franek chce bawić się w liściach!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 jesienne liście', icon: '🍁', itemType: 'artifact' as ItemType, targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Pokaż liście Frankowi', icon: '🏃', targetNpcId: 'franek', completed: false },
        { type: 'math', description: 'Ile liści zebraliśmy?', icon: '🧮', mathProblem: MATH_PROBLEMS[3], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'jesien' as SeasonType,
    },
    // Quest: Pieczenie ciasta z mamą
    {
      id: 'quest_season_pie', title: '🥧 Pieczenie ciasta!', npcId: 'mama', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Mama piecze ciasto!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 5 składników', icon: '🥧', itemType: 'artifact' as ItemType, targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś składniki Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile kawałków ciasta?', icon: '🧮', mathProblem: MATH_PROBLEMS[4], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'jesien' as SeasonType,
    },
    // Quest: Budowanie straszydła
    {
      id: 'quest_season_scarecrow', title: '🧥 Budujemy straszydło!', npcId: 'tata', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Tata buduje straszydło!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 części straszydła', icon: '🧥', itemType: 'artifact' as ItemType, targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś rzeczy Tacie', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile ubrań ma straszydło?', icon: '🧮', mathProblem: MATH_PROBLEMS[5], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'jesien' as SeasonType,
    },

    // ---- ZIMA (Winter) ----
    // Quest: Lepienie bałwana
    {
      id: 'quest_season_snowman', title: '⛄ Lepienie bałwana!', npcId: 'tata', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Tata lepi bałwana!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 5 zimowych rzeczy', icon: '⛄', itemType: 'artifact' as ItemType, targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś Tacie', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile kul ma bałwan?', icon: '🧮', mathProblem: MATH_PROBLEMS[6], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'zima' as SeasonType,
    },
    // Quest: Jazda na sankach
    {
      id: 'quest_season_sled', title: '🛷 Jazda na sankach!', npcId: 'tata', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Tata bierze sanki!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 zimowe skarby', icon: '🛷', itemType: 'artifact' as ItemType, targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Taty', icon: '🏃', targetNpcId: 'tata', completed: false },
        { type: 'math', description: 'Ile razy zjechaliśmy?', icon: '🧮', mathProblem: MATH_PROBLEMS[7], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'zima' as SeasonType,
    },
    // Quest: Ubieranie choinki
    {
      id: 'quest_season_christmas_tree', title: '🎄 Ubieramy choinkę!', npcId: 'mama', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Mama przynosi ozdoby!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 5 ozdób choinkowych', icon: '🎄', itemType: 'artifact' as ItemType, targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś ozdoby Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile bombek na choince?', icon: '🧮', mathProblem: MATH_PROBLEMS[8], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'zima' as SeasonType,
    },
    // Quest: Gorąca czekolada
    {
      id: 'quest_season_hot_choc', title: '🍫 Gorąca czekolada!', npcId: 'mama', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Mama robi czekoladę!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 składniki', icon: '🍫', itemType: 'artifact' as ItemType, targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś składniki Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile kubków czekolady?', icon: '🧮', mathProblem: MATH_PROBLEMS[9], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'zima' as SeasonType,
    },
    // Quest: Bitwa na śnieżki!
    {
      id: 'quest_season_snow_fight', title: '❄️ Bitwa na śnieżki!', npcId: 'franek', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Franek chce się bawić w śniegu!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 5 śnieżnych skarbów', icon: '❄️', itemType: 'artifact' as ItemType, targetCount: 5, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Wróć do Franka', icon: '🏃', targetNpcId: 'franek', completed: false },
        { type: 'math', description: 'Ile śnieżek rzuciliśmy?', icon: '🧮', mathProblem: MATH_PROBLEMS[10], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'zima' as SeasonType,
    },
    // Quest: Pakowanie prezentów
    {
      id: 'quest_season_presents', title: '🎁 Pakowanie prezentów!', npcId: 'mama', category: 'przygody' as QuestCategory,
      steps: [
        { type: 'talk', description: 'Mama pakuje prezenty!', icon: '💬', completed: false },
        { type: 'collect', description: 'Zbierz 4 prezenty', icon: '🎁', itemType: 'artifact' as ItemType, targetCount: 4, currentCount: 0, completed: false },
        { type: 'deliver', description: 'Zanieś prezenty Mamie', icon: '🏃', targetNpcId: 'mama', completed: false },
        { type: 'math', description: 'Ile prezentów zapakowaliśmy?', icon: '🧮', mathProblem: MATH_PROBLEMS[11], completed: false },
      ],
      currentStep: 0, completed: false, active: false, reward: 2, season: 'zima' as SeasonType,
    },
  ],

  costumes: COSTUMES,
  achievements: ACHIEVEMENTS,

  climbables: [
    // Ladder to antresola (in hall area)
    { x: 350, y: 330, w: 30, topY: HOUSE.atticFloorY, bottomY: 330, label: 'Drabinka', emoji: '🪜' },
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
    if (stepIndex === 0) return ['Kuba, usiądź... 💕', 'Mama ma ważną wiadomość!', 'Będziesz miał siostrzyczkę! 👶🎀', 'Pomożesz przygotować rzeczy dla niej?', 'Zbierz co potrzeba dla maluszka! 🍼'];
    if (stepIndex === 2) return ['Wszystko gotowe dla siostrzyczki! 👶💕', 'Będziesz najlepszym starszym bratem na świecie!', 'A teraz zagadka...'];
    return ['Zbierz rzeczy dla siostrzyczki! 🍼'];
  }
  if (npcId === 'mama' && questId === 'quest_baby_name') {
    if (stepIndex === 0) return ['Kuba, jak nazwiemy siostrzyczkę? 💝', 'Poszukaj karteczek z imionami!', 'Rozrzuciłam je po domu... 📝'];
    if (stepIndex === 2) return ['Jakie ładne imiona! 💕', 'Które Ci się podoba najbardziej?', 'Policzmy literki...'];
    return ['Szukaj karteczek z imionami! 📝'];
  }
  if (npcId === 'mama' && questId === 'quest_hospital_bag') {
    if (stepIndex === 0) return ['Kuba, muszę spakować torbę do szpitala! 🏥', 'Pomożesz? Potrzebuję:', 'Kocyk, body, pieluszkę i smoczek 👶', 'Poszukaj po domu!'];
    if (stepIndex === 2) return ['Super! Torba gotowa! 👜💕', 'Jak siostrzyczka się urodzi, będziemy przygotowani!'];
    return ['Szukaj rzeczy do torby szpitalnej! 👜'];
  }
  if (npcId === 'tata' && questId === 'quest_baby_room') {
    if (stepIndex === 0) return ['Kuba, pomalujemy pokój! 🎨', 'Siostrzyczka potrzebuje ładnego pokoiku!', 'Zbierz dekoracje — gwiazdki, chmurki, motylki! 🎀'];
    if (stepIndex === 2) return ['Pięknie! Pokój jak z bajki! 🌟', 'Siostrzyczka będzie zachwycona!', 'A teraz policzmy misie...'];
    return ['Zbierz dekoracje do pokoju! 🎨'];
  }
  if (npcId === 'mama' && questId === 'quest_baby_gift') {
    if (stepIndex === 0) return ['Kuba, a może narysujesz coś dla siostrzyczki? 🎁', 'Prezent od starszego brata!', 'Zbierz kredki i papier! 🖍️'];
    if (stepIndex === 2) return ['Jaki piękny rysunek! 🖼️💕', 'Siostrzyczka na pewno go pokocha!', 'Powiesisz go nad łóżeczkiem!'];
    return ['Zbierz materiały na rysunek! 🖍️'];
  }
  if (npcId === 'mama' && questId === 'quest_breathing') {
    if (stepIndex === 0) return ['Kuba, mama ćwiczy oddychanie! 🫁', 'To pomaga przy porodzie 💪', 'Przynieś baloniki — poćwiczymy razem! 🎈'];
    if (stepIndex === 2) return ['Świetnie ćwiczysz! 🎈💨', 'Teraz mama i Kuba umieją oddychać!', 'Policzmy oddechy...'];
    return ['Zbierz baloniki! 🎈'];
  }

  // Quest: Wujek Rafał
  if (npcId === 'mama' && questId === 'quest_rafal') {
    if (stepIndex === 0) return [
      'Kuba! Mam super wiadomość! 🎉',
      'Wujek Rafał wraca z Wietnamu! ✈️',
      'Jedzie swoim czerwonym cabrio! 🚗💨',
      'Był tam na długiej podróży z plecakiem 🎒',
      'Zróbmy mu niespodziankę!',
      'Przygotujmy pierogi i Ptasie Mleczko! 🥟🍫',
      'Zbierz wszystko w kuchni i salonie!',
    ];
    if (stepIndex === 2) return [
      'Super! Jedzenie gotowe! 🥟🍫',
      'Wujek Rafał właśnie przyjechał cabrio! 🚗',
      'Ale zanim do niego pobiegniemy...',
      'Rozwiąż zagadkę! 🧮',
    ];
    return ['Zbierz pierogi i Ptasie Mleczko! 🥟🍫'];
  }
  if (npcId === 'rafal' && questId === 'quest_rafal') {
    if (stepIndex === 3) return [
      'KUBUŚ!!! 🤗🤗🤗',
      'Jak Ty urosłeś! Daj buziaka! 💕',
      'Wiecie co? Wietnam jest PIĘKNY! 🌴',
      'Przywiozłem Ci prawdziwy kapelusz wietnamski! 🎋',
      'A widziałeś moje cabrio? Jechałem z dachem otwartym! 🚗💨',
      'A co to? PIEROGI?! I PTASIE MLECZKO?! 🥟🍫',
      'Najlepsza niespodzianka na świecie! 🎉',
      'Kocham Was! Dziękuję Kuba! ❤️',
    ];
    return ['Hej Kuba! Fajnie że wróciłem! 🎒'];
  }

  // === MEAL QUESTS DIALOG ===

  // Quest: Kawka dla Taty
  if (npcId === 'mama' && questId === 'quest_coffee') {
    if (stepIndex === 0) return [
      'Kuba! ☕',
      'Tata prowadzi szkolenie w gabinecie! 💻',
      'Jest bardzo zajęty...',
      'Zróbmy mu niespodziankę!',
      'Przygotuj kawkę z mlekiem i ciasteczko! 🍪',
      'Wszystko jest w kuchni!',
    ];
    return ['Przygotuj kawkę dla Taty! ☕'];
  }
  if (npcId === 'tata' && questId === 'quest_coffee') {
    if (stepIndex === 2) return [
      'O! Kuba! ☕😊',
      'Kawka dla mnie? Z mlekiem?',
      'I ciasteczko?! 🍪',
      'Jesteś najlepszy syn na świecie! ❤️',
      'Dzięki Tobie dam radę skończyć szkolenie!',
      'A teraz zagadka...',
    ];
    return ['Dzięki za kawkę, Kuba! ☕❤️'];
  }

  // Quest: Śniadanie — gofry
  if (npcId === 'tata' && questId === 'quest_breakfast') {
    if (stepIndex === 0) return [
      'Dzień dobry, Kuba! 🌅',
      'Dziś na śniadanie robimy GOFRY! 🧇',
      'Mama siedzi i odpoczywa.',
      'Pomożesz mi? 👨‍🍳',
      'Potrzebuję z lodówki: 2 jajka, mleko, śmietanę i mąkę!',
      'Leć, szybko! 🏃',
    ];
    if (stepIndex === 2) return [
      'Super! Mamy wszystkie składniki! 🧇',
      'Jajka, mleko, śmietana, mąka...',
      'Teraz mieszam ciasto! 🥣',
      'A teraz zagadka dla Ciebie!',
    ];
    return ['Przynieś składniki na gofry! 🧇'];
  }

  // Quest: Obiad — zupka
  if (npcId === 'mama' && questId === 'quest_lunch') {
    if (stepIndex === 0) return [
      'Kuba! Czas na obiad! 🍲',
      'Robię zupę marchewkową!',
      'Pomożesz mi zebrać składniki? 🥕',
      'Potrzebuję marchewki, inne warzywa i chleb!',
      'Szukaj po kuchni i jadalni!',
    ];
    if (stepIndex === 2) return [
      'Brawo! Mamy wszystko! 🍲',
      'Zupa będzie pyszna!',
      'Cała rodzina usiądzie do stołu! 👨‍👩‍👦',
      'A teraz zagadka...',
    ];
    return ['Zbierz składniki na obiad! 🍲'];
  }

  // Quest: Kolacja — kanapki
  if (npcId === 'mama' && questId === 'quest_dinner') {
    if (stepIndex === 0) return [
      'Kuba, wieczór! 🌙',
      'Na kolację robimy kanapki!',
      'Potrzebuję chleb, sery, sałatę i sok! 🥪',
      'Pomożesz mi wszystko przygotować?',
      'Szukaj w kuchni i lodówce!',
    ];
    if (stepIndex === 2) return [
      'Wspaniale! Mamy składniki! 🍞🧀',
      'Kanapki dla całej rodziny!',
      'Tata, Mama, Kuba i Franek dostanie kawałeczek! 🐕',
      'A teraz zagadka...',
    ];
    return ['Zbierz składniki na kolację! 🍞'];
  }

  // === ŻABKA QUEST DIALOG ===
  if (npcId === 'mama' && questId === 'quest_zabka') {
    if (stepIndex === 0) return [
      'Kuba! 🐸',
      'Potrzebuję kilku rzeczy ze sklepu!',
      'Żabka jest dalej na ulicy — w lewo!',
      'Kup chipsy, cukierki, wodę i lody! 🛒',
      'Uważaj na ulicy! 🚗',
    ];
    if (stepIndex === 2) return [
      'Brawo! Zakupy zrobione! 🛍️',
      'Dziękuję Kuba!',
      'A teraz zagadka...',
    ];
    return ['Idź do Żabki po zakupy! 🐸'];
  }
  if (npcId === 'zabka_clerk' && questId === 'quest_zabka') {
    return ['Dzień dobry! 🐸', 'Witamy w Żabce!', 'Bierz co potrzebujesz z półek!'];
  }

  // === PACZKOMAT QUEST DIALOG ===
  if (npcId === 'tata' && questId === 'quest_paczkomat') {
    if (stepIndex === 0) return [
      'Kuba! 📦',
      'Przyszła wiadomość z Paczkomatu!',
      'Mamy 3 paczki do odebrania!',
      'Paczkomat stoi obok Żabki na ulicy!',
      'Odbierz je i przynieś mi! 📱',
    ];
    if (stepIndex === 2) return [
      'Super! Wszystkie paczki! 📦🎉',
      'Jedna jest dla Ciebie — niespodzianka!',
      'A teraz zagadka...',
    ];
    return ['Odbierz paczki z Paczkomatu! 📦'];
  }

  // === MOVIE NIGHT QUEST DIALOG ===
  if (npcId === 'tata' && questId === 'quest_movie_night') {
    if (stepIndex === 0) return [
      'Kuba! 🎬',
      'Dziś wieczór filmowy!',
      'Włączymy projektor w salonie! 📽️',
      'Ale najpierw... POPCORN! 🍿',
      'Zbierz popcorn po domu!',
      'I przynieś do salonu!',
    ];
    if (stepIndex === 2) return [
      'Popcorn jest! 🍿🎉',
      'Mama, Tata, Kuba i Franek!',
      'Włączamy projektor! 📽️✨',
      'A teraz zagadka przed filmem...',
    ];
    return ['Zbierz popcorn na wieczór filmowy! 🍿'];
  }

  return ['...'];
}
