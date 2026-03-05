// ==========================================
// Child Wellbeing System
// Session timer, break reminders, goodnight mode,
// session counter, celebration messages, growth mindset
// Based on evidence: AAP, WHO, Przybylski & Weinstein 2017
// ==========================================

// ---- Configuration ----
const SESSION_MAX_MINUTES = 20;
const GOODNIGHT_HOUR = 19; // 7 PM
const MAX_SESSIONS_PER_DAY = 3;
const BREAK_DURATION_SECONDS = 60; // 1 min break screen
const LS_KEY_SESSIONS = 'kubaquest_sessions';
const LS_KEY_LAST_DATE = 'kubaquest_last_date';
const LS_KEY_TOTAL_PLAY_MINUTES = 'kubaquest_total_play';

// ---- Wellbeing State ----
export interface WellbeingState {
  sessionStartTime: number;       // Date.now() when session started
  sessionSeconds: number;          // seconds played this session
  isBreakTime: boolean;            // true = show break screen
  breakSecondsLeft: number;        // countdown during break
  isGoodnightMode: boolean;        // true = past bedtime
  sessionsToday: number;           // how many sessions today
  isSessionLimitReached: boolean;  // true = max sessions hit
  isDosycNaDzis: boolean;          // true = player chose to quit
  mathCorrect: number;             // correct answers this session
  mathWrong: number;               // wrong answers this session
  mathStreak: number;              // current streak of correct
  bestStreak: number;              // best streak this session
}

export function createWellbeingState(): WellbeingState {
  const sessions = getSessionsToday();
  return {
    sessionStartTime: Date.now(),
    sessionSeconds: 0,
    isBreakTime: false,
    breakSecondsLeft: BREAK_DURATION_SECONDS,
    isGoodnightMode: isGoodnightTime(),
    sessionsToday: sessions,
    isSessionLimitReached: sessions >= MAX_SESSIONS_PER_DAY,
    isDosycNaDzis: false,
    mathCorrect: 0,
    mathWrong: 0,
    mathStreak: 0,
    bestStreak: 0,
  };
}

// ---- Session Timer ----

/** Call every frame with dt in seconds */
export function updateWellbeing(state: WellbeingState, dt: number): void {
  if (state.isDosycNaDzis || state.isSessionLimitReached) return;

  // Track play time
  state.sessionSeconds += dt;

  // Check if break needed (every SESSION_MAX_MINUTES)
  if (!state.isBreakTime) {
    const minutesPlayed = state.sessionSeconds / 60;
    const breakCount = Math.floor(minutesPlayed / SESSION_MAX_MINUTES);
    const lastBreakAt = breakCount * SESSION_MAX_MINUTES * 60;
    const timeSinceLastBreak = state.sessionSeconds - lastBreakAt;

    if (minutesPlayed >= SESSION_MAX_MINUTES && timeSinceLastBreak < 2) {
      state.isBreakTime = true;
      state.breakSecondsLeft = BREAK_DURATION_SECONDS;
    }
  }

  // Break countdown
  if (state.isBreakTime) {
    state.breakSecondsLeft -= dt;
    if (state.breakSecondsLeft <= 0) {
      state.isBreakTime = false;
      state.breakSecondsLeft = BREAK_DURATION_SECONDS;
    }
  }

  // Check goodnight (every ~5 seconds to avoid Date overhead)
  if (Math.floor(state.sessionSeconds) % 5 === 0) {
    state.isGoodnightMode = isGoodnightTime();
  }
}

/** Trigger break manually (e.g., after quest completion near 20 min mark) */
export function triggerBreak(state: WellbeingState): void {
  state.isBreakTime = true;
  state.breakSecondsLeft = BREAK_DURATION_SECONDS;
}

/** Skip break (parent override) */
export function skipBreak(state: WellbeingState): void {
  state.isBreakTime = false;
}

/** Player chose "Dosyć na dziś" */
export function dosycNaDzis(state: WellbeingState): void {
  state.isDosycNaDzis = true;
  // Save session count
  incrementSessionCount();
  // Save total play time
  saveTotalPlayTime(state.sessionSeconds);
}

// ---- Goodnight Mode ----

function isGoodnightTime(): boolean {
  return new Date().getHours() >= GOODNIGHT_HOUR;
}

// ---- Session Counter (localStorage) ----

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getSessionsToday(): number {
  try {
    const stored = localStorage.getItem(LS_KEY_SESSIONS);
    const date = localStorage.getItem(LS_KEY_LAST_DATE);
    const today = getTodayKey();
    if (date !== today) return 0;
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
}

function incrementSessionCount(): void {
  try {
    const today = getTodayKey();
    const current = getSessionsToday();
    localStorage.setItem(LS_KEY_SESSIONS, String(current + 1));
    localStorage.setItem(LS_KEY_LAST_DATE, today);
  } catch {
    // localStorage not available
  }
}

function saveTotalPlayTime(sessionSeconds: number): void {
  try {
    const prev = parseFloat(localStorage.getItem(LS_KEY_TOTAL_PLAY_MINUTES) || '0');
    localStorage.setItem(LS_KEY_TOTAL_PLAY_MINUTES, String(prev + sessionSeconds / 60));
  } catch {
    // noop
  }
}

// ---- Math Tracking ----

export function recordMathAnswer(state: WellbeingState, correct: boolean): void {
  if (correct) {
    state.mathCorrect++;
    state.mathStreak++;
    if (state.mathStreak > state.bestStreak) state.bestStreak = state.mathStreak;
  } else {
    state.mathWrong++;
    state.mathStreak = 0;
  }
}

export function getMathAccuracy(state: WellbeingState): number {
  const total = state.mathCorrect + state.mathWrong;
  if (total === 0) return 1;
  return state.mathCorrect / total;
}

// ---- Celebration Messages (randomized!) ----

const CELEBRATION_MESSAGES = [
  'BRAWO KUBA! 🎉',
  'SUPER! Świetna robota! ⭐',
  'Ale ci poszło! 🌟',
  'Niesamowite! 🎊',
  'WOW! Dałeś radę! 💪',
  'Jesteś MISTRZEM! 🏆',
  'Fantastycznie! 🎈',
  'REWELACJA! 🌈',
  'Udało się! HURRA! 🎆',
  'Pięknie! 👏',
  'Odlotowo! 🚀',
  'Ekstra! Tak trzymaj! 💫',
  'BOMBA! 💥',
  'Mega! Franek też się cieszy! 🐕',
  'Wspaniale! Mama jest dumna! ❤️',
];

const CELEBRATION_SUBTITLES = [
  'Misja wykonana!',
  'Kolejna przygoda za Tobą!',
  'Robisz niesamowite postępy!',
  'Każda misja to nowa przygoda!',
  'Zbierasz doświadczenie!',
  'Sąsiedzi są wdzięczni!',
  'Migdałowa jest dumna z Ciebie!',
];

// ---- Growth Mindset Messages ----

const GROWTH_MINDSET_ON_SUCCESS = [
  'Widzisz? Próbowanie się opłaca! 💪',
  'Każdy krok przybliża do celu! 🎯',
  'Ćwiczenie czyni mistrza! ⭐',
  'Uczysz się coraz szybciej! 🧠',
  'To dlatego, że się starasz! 💫',
  'Twój wysiłek daje efekty! 🌱',
];

const GROWTH_MINDSET_ON_WRONG = [
  'Hmm, spróbuj inaczej! Każda próba się liczy! 💪',
  'Nie szkodzi! Pomyśl jeszcze raz 🤔',
  'Błędy pomagają się uczyć! Spróbuj jeszcze! 🌟',
  'Prawie! Jeszcze jedna próba! 💫',
  'To trudne, ale Ty dasz radę! 🎯',
  'Każdy mistrz kiedyś się uczył! ⭐',
  'Spokojnie, nie spiesz się 🧠',
];

// ---- Process-focused Messages ----

const STEP_COMPLETE_MESSAGES = [
  'Krok bliżej! 👣',
  'Świetnie idzie! 🌟',
  'Kolejny etap za Tobą! ✅',
  'Tak trzymaj! 💪',
  'Robisz postępy! 🎯',
  'Super, dalej! 🚀',
];

// ---- Goodbye Messages (Dosyć na dziś) ----

const GOODBYE_MESSAGES = [
  'Świetnie się dzisiaj bawiłeś! Do jutra! 🌙',
  'Franek idzie odpocząć. Ty też! 🐕💤',
  'Sąsiedzi mówią "Do zobaczenia!" 👋',
  'Super dzień na Migdałowej! Pora na przygody w realu! 🌳',
  'Mama i Tata czekają! Do następnego razu! ❤️',
  'Odpoczynek to też przygoda! 🛋️',
];

// ---- Break Messages ----

const BREAK_TITLES = [
  'Pora na przerwę! 🌈',
  'Czas na ruch! 💪',
  'Przerwa ruchowa! 🏃',
  'Wstań i się poruszaj! 🤸',
];

const BREAK_EXERCISES = [
  { text: 'Zrób 5 podskoków!', emoji: '🦘' },
  { text: 'Klaśnij 10 razy!', emoji: '👏' },
  { text: 'Dotknij palcami stóp!', emoji: '🙆' },
  { text: 'Pokręć się w kółko 3 razy!', emoji: '🌀' },
  { text: 'Zrób 5 przysiadów!', emoji: '🏋️' },
  { text: 'Pomachaj rękami jak ptak!', emoji: '🦅' },
  { text: 'Biegnij w miejscu 10 sekund!', emoji: '🏃' },
  { text: 'Zrób 3 głębokie oddechy!', emoji: '🌬️' },
  { text: 'Rozciągnij ręce do góry!', emoji: '🙌' },
  { text: 'Naśladuj kangura — skacz!', emoji: '🦘' },
];

// ---- Goodnight Messages ----

const GOODNIGHT_MESSAGES = [
  'Jest już wieczór! Franek idzie spać 🐕💤',
  'Migdałowa zasypia… Dobranoc! 🌙',
  'Pora na sen! Przygody czekają jutro! ⭐',
];

// ---- Public Getters (random) ----

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getCelebrationTitle(): string {
  return pick(CELEBRATION_MESSAGES);
}

export function getCelebrationSubtitle(): string {
  return pick(CELEBRATION_SUBTITLES);
}

export function getGrowthMindsetSuccess(): string {
  return pick(GROWTH_MINDSET_ON_SUCCESS);
}

export function getGrowthMindsetWrong(): string {
  return pick(GROWTH_MINDSET_ON_WRONG);
}

export function getStepCompleteMessage(): string {
  return pick(STEP_COMPLETE_MESSAGES);
}

export function getGoodbyeMessage(): string {
  return pick(GOODBYE_MESSAGES);
}

export function getBreakTitle(): string {
  return pick(BREAK_TITLES);
}

export function getBreakExercise(): { text: string; emoji: string } {
  return pick(BREAK_EXERCISES);
}

export function getGoodnightMessage(): string {
  return pick(GOODNIGHT_MESSAGES);
}

// ---- Session Time Formatting ----

export function formatSessionTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function getSessionMinutes(state: WellbeingState): number {
  return Math.floor(state.sessionSeconds / 60);
}

export function getTimeUntilBreak(state: WellbeingState): number {
  const minutesPlayed = state.sessionSeconds / 60;
  const nextBreakAt = Math.ceil(minutesPlayed / SESSION_MAX_MINUTES) * SESSION_MAX_MINUTES;
  if (nextBreakAt <= minutesPlayed) return SESSION_MAX_MINUTES;
  return Math.max(0, Math.floor((nextBreakAt - minutesPlayed) * 60));
}

// ---- Constants for UI ----
export const WELLBEING_CONFIG = {
  SESSION_MAX_MINUTES,
  GOODNIGHT_HOUR,
  MAX_SESSIONS_PER_DAY,
  BREAK_DURATION_SECONDS,
} as const;
