// ==========================================
// Speech Synthesis System
// Reads dialog lines aloud using Web Speech API
// Male/female Polish voices for different characters
// ==========================================

let _speechEnabled = false;
let _polishVoices: SpeechSynthesisVoice[] = [];
let _maleVoice: SpeechSynthesisVoice | null = null;
let _femaleVoice: SpeechSynthesisVoice | null = null;
let _childVoice: SpeechSynthesisVoice | null = null;

// Character → voice gender mapping
const CHARACTER_VOICE: Record<string, 'male' | 'female' | 'child'> = {
  mama: 'female',
  tata: 'male',
  kuba: 'child',
  rafal: 'male',
  listonosz: 'male',
  kowalski: 'male',
  babcia: 'female',
  franek: 'male',     // dog — male low pitch, bark-like
  kot: 'female',      // cat — female high pitch
  jurek_npc: 'child', // plush dog — child voice
  // Przedszkole
  pani_ania: 'female',
  pani_zosia: 'female',
  pan_tomek_p: 'male',
  dyrektor_p: 'female',
  kucharka_p: 'female',
  kasia_kid: 'child',
  janek_kid: 'child',
  ola_kid: 'child',
  // Szkoła — nauczyciele
  dyrektor_s: 'male',
  pani_magda: 'female',
  pan_marek_s: 'male',
  pani_krysia: 'female',
  pan_adam: 'male',
  pani_ewa: 'female',
  bibliotekarka: 'female',
  wf_teacher: 'male',
  wozny: 'male',
  kucharka_s: 'female',
  // Szkoła — uczniowie
  uczen_filip: 'child',
  uczen_maja: 'child',
  uczen_bartek: 'child',
  uczen_zuzia: 'child',
  uczen_tomek: 'child',
  uczen_hania: 'child',
  uczen_kacper: 'child',
  uczen_lena: 'child',
  uczen_szymon: 'child',
  uczen_iga: 'child',
  // Strefy sportowe
  skater: 'male',
  trener_koszykowki: 'male',
  rowerzysta: 'female',
  // Park miejski
  spacerujacy: 'male',
  babcia_park: 'female',
  // Biblioteka
  bibliotekarz_m: 'male',
  czytelniczka: 'female',
  dziecko_czytajace: 'child',
  wolontariusz: 'male',
  // Plac zabaw
  opiekun_placu: 'male',
  dziecko_hustawka: 'child',
  // Park za szkołą
  ogrodnik: 'male',
  // Przystanek
  czekajacy_1: 'male',
  czekajaca_2: 'female',
  // Osiedle
  sasiad_blok1: 'male',
  sasiada_blok2: 'female',
  dziecko_osiedle1: 'child',
  dziecko_osiedle2: 'child',
  sklepikarz: 'male',
  emeryt: 'male',
};

// Character-specific pitch adjustments (1.0 = normal)
const CHARACTER_PITCH: Record<string, number> = {
  mama: 1.1,
  tata: 0.85,
  kuba: 1.4,
  rafal: 0.9,
  listonosz: 0.95,
  franek: 0.7,
  kot: 1.5,
  jurek_npc: 1.3,
  // Przedszkole
  pani_ania: 1.15, pani_zosia: 1.1, pan_tomek_p: 0.9, dyrektor_p: 1.0,
  kucharka_p: 1.05, kasia_kid: 1.5, janek_kid: 1.45, ola_kid: 1.5,
  // Szkoła — nauczyciele
  dyrektor_s: 0.8, pani_magda: 1.05, pan_marek_s: 0.9, pani_krysia: 1.1,
  pan_adam: 0.85, pani_ewa: 1.1, bibliotekarka: 1.0, wf_teacher: 0.8,
  wozny: 0.85, kucharka_s: 1.05,
  // Szkoła — uczniowie
  uczen_filip: 1.4, uczen_maja: 1.5, uczen_bartek: 1.35, uczen_zuzia: 1.45,
  uczen_tomek: 1.3, uczen_hania: 1.5, uczen_kacper: 1.35, uczen_lena: 1.45,
  uczen_szymon: 1.3, uczen_iga: 1.5,
  // Strefy sportowe
  skater: 0.95, trener_koszykowki: 0.8, rowerzysta: 1.1,
  // Park / Biblioteka / Plac / Osiedle
  spacerujacy: 0.85, babcia_park: 1.0,
  bibliotekarz_m: 0.9, czytelniczka: 1.1, dziecko_czytajace: 1.45, wolontariusz: 1.0,
  opiekun_placu: 0.9, dziecko_hustawka: 1.5,
  ogrodnik: 0.85, czekajacy_1: 0.9, czekajaca_2: 1.05,
  sasiad_blok1: 0.85, sasiada_blok2: 1.1, dziecko_osiedle1: 1.4, dziecko_osiedle2: 1.45,
  sklepikarz: 0.9, emeryt: 0.75,
};

// Character-specific rate adjustments (1.0 = normal)
const CHARACTER_RATE: Record<string, number> = {
  mama: 0.95,
  tata: 0.9,
  kuba: 1.0,
  rafal: 0.85,
  listonosz: 1.0,
  franek: 1.1,
  kot: 1.2,
  jurek_npc: 1.0,
  // Przedszkole
  pani_ania: 0.95, pani_zosia: 0.9, pan_tomek_p: 0.95, dyrektor_p: 0.85,
  kucharka_p: 0.95, kasia_kid: 1.05, janek_kid: 1.0, ola_kid: 1.05,
  // Szkoła
  dyrektor_s: 0.85, pani_magda: 0.9, pan_marek_s: 0.9, pani_krysia: 0.9,
  pan_adam: 0.9, pani_ewa: 0.95, bibliotekarka: 0.85, wf_teacher: 1.0,
  wozny: 0.95, kucharka_s: 0.95,
  // Uczniowie
  uczen_filip: 1.0, uczen_maja: 1.0, uczen_bartek: 0.95, uczen_zuzia: 1.0,
  uczen_tomek: 0.9, uczen_hania: 1.0, uczen_kacper: 1.05, uczen_lena: 1.0,
  uczen_szymon: 1.05, uczen_iga: 1.0,
  // Sport
  skater: 1.05, trener_koszykowki: 0.9, rowerzysta: 0.95,
  // Park / Biblioteka / Plac / Osiedle
  spacerujacy: 0.85, babcia_park: 0.8,
  bibliotekarz_m: 0.85, czytelniczka: 0.9, dziecko_czytajace: 1.0, wolontariusz: 1.0,
  opiekun_placu: 0.95, dziecko_hustawka: 1.05,
  ogrodnik: 0.85, czekajacy_1: 0.9, czekajaca_2: 0.95,
  sasiad_blok1: 0.9, sasiada_blok2: 0.95, dziecko_osiedle1: 1.0, dziecko_osiedle2: 1.0,
  sklepikarz: 0.95, emeryt: 0.8,
};

/**
 * Initialize speech synthesis. Must be called after user interaction (browser requirement).
 */
export function initSpeech(): void {
  if (!('speechSynthesis' in window)) return;

  _speechEnabled = true;
  loadVoices();

  // Chrome loads voices async
  speechSynthesis.onvoiceschanged = loadVoices;
}

function loadVoices(): void {
  const voices = speechSynthesis.getVoices();
  _polishVoices = voices.filter(v => v.lang.startsWith('pl'));

  if (_polishVoices.length === 0) {
    // Fallback to any available voice
    _polishVoices = voices.slice(0, 3);
  }

  // Try to find distinct male/female voices
  // Polish voice names often contain gender hints
  for (const v of _polishVoices) {
    const name = v.name.toLowerCase();
    if (name.includes('zosia') || name.includes('kasia') || name.includes('ewa') ||
        name.includes('agnieszk') || name.includes('female') || name.includes('woman') ||
        name.includes('paulina') || name.includes('maja')) {
      if (!_femaleVoice) _femaleVoice = v;
    } else if (name.includes('krzysztof') || name.includes('adam') || name.includes('jan') ||
               name.includes('male') || name.includes('man') || name.includes('jacek') ||
               name.includes('piotr')) {
      if (!_maleVoice) _maleVoice = v;
    }
  }

  // If we couldn't differentiate, use first voice for both
  if (!_femaleVoice && _polishVoices.length > 0) _femaleVoice = _polishVoices[0];
  if (!_maleVoice && _polishVoices.length > 0) _maleVoice = _polishVoices[_polishVoices.length > 1 ? 1 : 0];
  _childVoice = _femaleVoice; // child uses female voice with higher pitch
}

/**
 * Speak a dialog line as a specific character.
 */
export function speakDialog(characterId: string, text: string): void {
  if (!_speechEnabled) return;

  // Stop any current speech
  speechSynthesis.cancel();

  // Clean text — remove emojis and special chars for cleaner speech
  const cleanText = text
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/[→←↑↓]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'pl-PL';

  // Select voice based on character
  const voiceType = CHARACTER_VOICE[characterId] || 'male';
  switch (voiceType) {
    case 'female': utterance.voice = _femaleVoice; break;
    case 'child': utterance.voice = _childVoice; break;
    default: utterance.voice = _maleVoice; break;
  }

  // Character-specific pitch and rate
  utterance.pitch = CHARACTER_PITCH[characterId] || 1.0;
  utterance.rate = CHARACTER_RATE[characterId] || 0.9;
  utterance.volume = 0.8;

  speechSynthesis.speak(utterance);
}

/**
 * Stop current speech.
 */
export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

/**
 * Toggle speech on/off.
 */
export function toggleSpeech(): boolean {
  _speechEnabled = !_speechEnabled;
  if (!_speechEnabled) stopSpeech();
  return _speechEnabled;
}

/**
 * Check if speech is enabled.
 */
export function isSpeechEnabled(): boolean {
  return _speechEnabled;
}

/**
 * Get available Polish voices (for debug/settings).
 */
export function getPolishVoices(): SpeechSynthesisVoice[] {
  return _polishVoices;
}
