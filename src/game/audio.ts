// ==========================================
// Sąsiedzi na Migdałowej — Audio System
// 100% Classical Music (Vivaldi Spring)
// Procedural sounds via Web Audio API
// ==========================================

let audioCtx: AudioContext | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicPlaying = false;
let musicTimeout: ReturnType<typeof setTimeout> | null = null;

// Audio preferences
let soundEnabled = true;
export type MusicStyle = 'off' | 'classical';
let musicStyle: MusicStyle = 'classical';
let musicEnabled = true;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.12;
    musicGain.connect(audioCtx.destination);
    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = 0.25;
    sfxGain.connect(audioCtx.destination);
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// ---- Toggle functions ----
export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  if (sfxGain) sfxGain.gain.value = soundEnabled ? 0.25 : 0;
  return soundEnabled;
}

export function toggleMusic(): MusicStyle {
  // Cycle: classical → off → classical
  if (musicStyle === 'classical') musicStyle = 'off';
  else musicStyle = 'classical';

  musicEnabled = musicStyle !== 'off';
  if (musicGain) musicGain.gain.value = musicEnabled ? 0.12 : 0;
  if (musicEnabled) { stopMusic(); startMusic(); }
  else stopMusic();
  return musicStyle;
}

export function isSoundEnabled(): boolean { return soundEnabled; }
export function isMusicEnabled(): boolean { return musicEnabled; }
export function getMusicStyle(): MusicStyle { return musicStyle; }

// ---- SFX Helper: play a tone ----
function playTone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.2, detune = 0): void {
  if (!soundEnabled) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    gain.gain.value = vol;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(sfxGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch { /* ignore audio errors */ }
}

// ---- Sound Effects ----

export function sfxJump(): void {
  if (!soundEnabled) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(560, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(sfxGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch { /* ignore */ }
}

export function sfxCollect(): void {
  // Pleasant ding - two quick notes
  playTone(880, 0.12, 'sine', 0.18);
  setTimeout(() => playTone(1175, 0.15, 'sine', 0.15), 60);
}

export function sfxDialog(): void {
  // Soft pop
  playTone(440, 0.08, 'sine', 0.1);
  setTimeout(() => playTone(554, 0.1, 'sine', 0.08), 40);
}

export function sfxDialogAdvance(): void {
  // Quick blip
  playTone(660, 0.05, 'triangle', 0.08);
}

export function sfxQuestComplete(): void {
  // Celebratory jingle: C-E-G-C (ascending)
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.15), i * 100);
  });
}

export function sfxMathCorrect(): void {
  // Happy ascending arpeggio
  playTone(523, 0.15, 'sine', 0.12);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 80);
  setTimeout(() => playTone(784, 0.2, 'sine', 0.15), 160);
}

export function sfxMathWrong(): void {
  // Sad descending sound
  playTone(330, 0.15, 'sawtooth', 0.08);
  setTimeout(() => playTone(277, 0.2, 'sawtooth', 0.06), 100);
}

export function sfxStep(): void {
  // Very subtle footstep
  if (!soundEnabled) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 80 + Math.random() * 40;
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.connect(sfxGain!);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.06);
  } catch { /* ignore */ }
}

export function sfxInteract(): void {
  // Click/interact sound
  playTone(600, 0.06, 'square', 0.06);
  setTimeout(() => playTone(800, 0.08, 'sine', 0.05), 30);
}

export function sfxStairs(): void {
  // Wooden stair creak
  playTone(180, 0.1, 'triangle', 0.06);
}

export function sfxAchievement(): void {
  // Fanfare: C-E-G-high C with slight delay
  const notes = [523, 659, 784, 1047, 1318];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, 'sine', 0.12), i * 80);
  });
}

export function sfxCombo(): void {
  // Quick ascending sparkle
  playTone(880, 0.06, 'sine', 0.08);
  setTimeout(() => playTone(1175, 0.08, 'sine', 0.08), 40);
  setTimeout(() => playTone(1397, 0.1, 'sine', 0.1), 80);
}

export function sfxWeatherChange(): void {
  playTone(400, 0.2, 'sine', 0.06);
  setTimeout(() => playTone(500, 0.2, 'sine', 0.06), 100);
}

// ---- Interactive object SFX ----

export function sfxTvToggle(on: boolean): void {
  if (on) {
    playTone(800, 0.08, 'square', 0.06);
    setTimeout(() => playTone(1200, 0.12, 'sine', 0.08), 50);
  } else {
    playTone(600, 0.1, 'square', 0.04);
    setTimeout(() => playTone(200, 0.15, 'sine', 0.04), 50);
  }
}

export function sfxFridgeToggle(open: boolean): void {
  if (open) {
    // Fridge opening — deep pop + air release
    playTone(150, 0.12, 'sine', 0.08);
    setTimeout(() => playTone(300, 0.15, 'triangle', 0.05), 60);
  } else {
    playTone(120, 0.15, 'sine', 0.06);
  }
}

export function sfxLampToggle(): void {
  playTone(1000, 0.04, 'sine', 0.06);
}

export function sfxTapToggle(on: boolean): void {
  if (!soundEnabled) return;
  try {
    const ctx = getCtx();
    // Water sound — white noise burst
    const bufferSize = ctx.sampleRate * (on ? 0.3 : 0.15);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.03 * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = on ? 2000 : 800;
    filter.Q.value = 1;
    source.connect(filter);
    filter.connect(sfxGain!);
    source.start();
  } catch { /* ignore */ }
}

export function sfxPianoNote(noteIndex: number): void {
  const notes = [523, 587, 659, 698, 784, 880, 988, 1047]; // C major scale
  const freq = notes[noteIndex % notes.length];
  playTone(freq, 0.4, 'sine', 0.12);
  // Harmonic
  setTimeout(() => playTone(freq * 2, 0.2, 'sine', 0.04), 20);
}

export function sfxBookOpen(): void {
  playTone(300, 0.06, 'triangle', 0.04);
  setTimeout(() => playTone(400, 0.08, 'triangle', 0.03), 40);
}

// ---- Doorbell SFX ----
export function sfxDoorbell(): void {
  // Classic ding-dong doorbell
  playTone(880, 0.25, 'sine', 0.08);
  setTimeout(() => playTone(660, 0.35, 'sine', 0.06), 280);
}

// ---- Package pickup SFX ----
export function sfxPackagePickup(): void {
  playTone(330, 0.08, 'triangle', 0.05);
  setTimeout(() => playTone(440, 0.08, 'triangle', 0.04), 60);
  setTimeout(() => playTone(550, 0.1, 'triangle', 0.04), 120);
  setTimeout(() => playTone(660, 0.15, 'triangle', 0.03), 180);
}

// ---- Wheel SFX (Wodzirej-style) ----
export function sfxWheelTick(): void {
  playTone(1200, 0.03, 'sine', 0.06);
}

export function sfxWheelFanfare(): void {
  const notes = [523, 659, 784, 1047, 1318, 1568];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, 'sine', 0.12), i * 80);
  });
}

// ---- Background Music ----
// Vivaldi "La Primavera" (Spring) — 1st movement main theme
// Allegro in E major, simplified for oscillator synthesis
// Brighter, more energetic feel with staccato-like short notes

const VIVALDI_SPRING: { note: number; dur: number }[] = [
  // Opening motif — joyful, bright E major
  { note: 659, dur: 0.2 },  // E5
  { note: 659, dur: 0.2 },  // E5
  { note: 659, dur: 0.2 },  // E5
  { note: 0, dur: 0.1 },    // rest
  { note: 659, dur: 0.2 },  // E5
  { note: 659, dur: 0.2 },  // E5
  { note: 659, dur: 0.2 },  // E5
  { note: 0, dur: 0.1 },    // rest
  { note: 659, dur: 0.15 }, // E5
  { note: 740, dur: 0.15 }, // F#5
  { note: 831, dur: 0.3 },  // G#5
  { note: 831, dur: 0.15 }, // G#5
  { note: 740, dur: 0.15 }, // F#5
  { note: 659, dur: 0.3 },  // E5
  { note: 0, dur: 0.2 },    // rest

  // Descending answer phrase
  { note: 659, dur: 0.2 },  // E5
  { note: 659, dur: 0.2 },  // E5
  { note: 659, dur: 0.2 },  // E5
  { note: 0, dur: 0.1 },    // rest
  { note: 659, dur: 0.2 },  // E5
  { note: 659, dur: 0.2 },  // E5
  { note: 659, dur: 0.2 },  // E5
  { note: 0, dur: 0.1 },    // rest
  { note: 659, dur: 0.15 }, // E5
  { note: 740, dur: 0.15 }, // F#5
  { note: 831, dur: 0.15 }, // G#5
  { note: 740, dur: 0.15 }, // F#5
  { note: 659, dur: 0.15 }, // E5
  { note: 554, dur: 0.15 }, // C#5
  { note: 494, dur: 0.4 },  // B4
  { note: 0, dur: 0.2 },    // rest

  // Bird song motif — trills and runs
  { note: 831, dur: 0.12 }, // G#5
  { note: 880, dur: 0.12 }, // A5
  { note: 831, dur: 0.12 }, // G#5
  { note: 740, dur: 0.12 }, // F#5
  { note: 831, dur: 0.25 }, // G#5
  { note: 0, dur: 0.1 },    // rest
  { note: 880, dur: 0.12 }, // A5
  { note: 988, dur: 0.12 }, // B5
  { note: 880, dur: 0.12 }, // A5
  { note: 831, dur: 0.12 }, // G#5
  { note: 880, dur: 0.25 }, // A5
  { note: 0, dur: 0.15 },   // rest

  // Gentle flowing passage — Spring feeling
  { note: 659, dur: 0.25 }, // E5
  { note: 554, dur: 0.2 },  // C#5
  { note: 494, dur: 0.2 },  // B4
  { note: 440, dur: 0.25 }, // A4
  { note: 494, dur: 0.2 },  // B4
  { note: 554, dur: 0.2 },  // C#5
  { note: 659, dur: 0.4 },  // E5
  { note: 0, dur: 0.15 },   // rest

  // Ascending scale passage
  { note: 494, dur: 0.15 }, // B4
  { note: 554, dur: 0.15 }, // C#5
  { note: 587, dur: 0.15 }, // D5
  { note: 659, dur: 0.15 }, // E5
  { note: 740, dur: 0.15 }, // F#5
  { note: 831, dur: 0.15 }, // G#5
  { note: 880, dur: 0.3 },  // A5
  { note: 831, dur: 0.2 },  // G#5
  { note: 740, dur: 0.15 }, // F#5
  { note: 659, dur: 0.4 },  // E5 (rest on tonic)
  { note: 0, dur: 0.3 },    // rest

  // Repeat motif variation — lower register
  { note: 494, dur: 0.2 },  // B4
  { note: 494, dur: 0.2 },  // B4
  { note: 494, dur: 0.2 },  // B4
  { note: 0, dur: 0.1 },    // rest
  { note: 554, dur: 0.15 }, // C#5
  { note: 659, dur: 0.15 }, // E5
  { note: 554, dur: 0.15 }, // C#5
  { note: 494, dur: 0.3 },  // B4
  { note: 440, dur: 0.2 },  // A4
  { note: 494, dur: 0.3 },  // B4
  { note: 0, dur: 0.15 },   // rest

  // Cadence — resolving to E
  { note: 554, dur: 0.2 },  // C#5
  { note: 494, dur: 0.15 }, // B4
  { note: 440, dur: 0.15 }, // A4
  { note: 494, dur: 0.15 }, // B4
  { note: 554, dur: 0.15 }, // C#5
  { note: 659, dur: 0.5 },  // E5 (hold)
  { note: 0, dur: 0.4 },    // rest before repeat
];

// Mozart — Eine kleine Nachtmusik opening theme (alternating with Vivaldi)
const MOZART_NACHTMUSIK: { note: number; dur: number }[] = [
  // Opening forte — G major
  { note: 392, dur: 0.3 },  // G4
  { note: 0, dur: 0.05 },   // rest
  { note: 294, dur: 0.15 }, // D4
  { note: 392, dur: 0.3 },  // G4
  { note: 0, dur: 0.05 },   // rest
  { note: 294, dur: 0.15 }, // D4
  { note: 392, dur: 0.15 }, // G4
  { note: 494, dur: 0.15 }, // B4
  { note: 587, dur: 0.4 },  // D5
  { note: 0, dur: 0.15 },   // rest

  // Answer phrase
  { note: 523, dur: 0.3 },  // C5
  { note: 0, dur: 0.05 },   // rest
  { note: 330, dur: 0.15 }, // E4
  { note: 523, dur: 0.3 },  // C5
  { note: 0, dur: 0.05 },   // rest
  { note: 330, dur: 0.15 }, // E4
  { note: 523, dur: 0.15 }, // C5
  { note: 659, dur: 0.15 }, // E5
  { note: 784, dur: 0.4 },  // G5
  { note: 0, dur: 0.2 },    // rest

  // Running passage — lively and bright
  { note: 784, dur: 0.15 }, // G5
  { note: 740, dur: 0.15 }, // F#5
  { note: 659, dur: 0.15 }, // E5
  { note: 740, dur: 0.15 }, // F#5
  { note: 784, dur: 0.15 }, // G5
  { note: 0, dur: 0.1 },    // rest
  { note: 587, dur: 0.15 }, // D5
  { note: 659, dur: 0.15 }, // E5
  { note: 587, dur: 0.15 }, // D5
  { note: 523, dur: 0.15 }, // C5
  { note: 494, dur: 0.15 }, // B4
  { note: 0, dur: 0.1 },    // rest

  // Second theme — more lyrical
  { note: 440, dur: 0.25 }, // A4
  { note: 494, dur: 0.15 }, // B4
  { note: 523, dur: 0.15 }, // C5
  { note: 523, dur: 0.25 }, // C5
  { note: 0, dur: 0.1 },    // rest
  { note: 494, dur: 0.2 },  // B4
  { note: 440, dur: 0.15 }, // A4
  { note: 392, dur: 0.3 },  // G4
  { note: 0, dur: 0.15 },   // rest

  // Flowing middle section
  { note: 392, dur: 0.15 }, // G4
  { note: 440, dur: 0.15 }, // A4
  { note: 494, dur: 0.15 }, // B4
  { note: 523, dur: 0.15 }, // C5
  { note: 587, dur: 0.15 }, // D5
  { note: 659, dur: 0.15 }, // E5
  { note: 587, dur: 0.15 }, // D5
  { note: 523, dur: 0.25 }, // C5
  { note: 494, dur: 0.15 }, // B4
  { note: 440, dur: 0.15 }, // A4
  { note: 392, dur: 0.4 },  // G4
  { note: 0, dur: 0.15 },   // rest

  // Recapitulation hint
  { note: 587, dur: 0.2 },  // D5
  { note: 523, dur: 0.15 }, // C5
  { note: 494, dur: 0.15 }, // B4
  { note: 440, dur: 0.15 }, // A4
  { note: 494, dur: 0.15 }, // B4
  { note: 392, dur: 0.5 },  // G4
  { note: 0, dur: 0.4 },    // rest before repeat
];

let melodyIndex = 0;
let currentPiece = 0; // 0 = Vivaldi, 1 = Mozart (alternate between pieces)

const PIECES = [VIVALDI_SPRING, MOZART_NACHTMUSIK];

function playMelodyNote(): void {
  if (!musicEnabled || !musicPlaying) return;

  try {
    const ctx = getCtx();
    const notes = PIECES[currentPiece];
    const { note, dur } = notes[melodyIndex % notes.length];
    melodyIndex++;

    // Switch piece when current one finishes
    if (melodyIndex >= notes.length) {
      melodyIndex = 0;
      currentPiece = (currentPiece + 1) % PIECES.length;
    }

    if (note > 0) {
      // Melody voice — triangle wave for classical warmth
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = note;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(musicGain!);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + dur);

      // Soft harmony — octave below
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = note * 0.5;
      gain2.gain.setValueAtTime(0.025, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc2.connect(gain2);
      gain2.connect(musicGain!);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + dur);

      // Third voice — fifth above, very quiet (string ensemble feel)
      if (dur > 0.2) {
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.value = note * 1.5;
        gain3.gain.setValueAtTime(0.012, ctx.currentTime);
        gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc3.connect(gain3);
        gain3.connect(musicGain!);
        osc3.start(ctx.currentTime);
        osc3.stop(ctx.currentTime + dur);
      }
    }

    // Schedule next note
    musicTimeout = setTimeout(playMelodyNote, dur * 1000);
  } catch {
    // If audio fails, try again later
    musicTimeout = setTimeout(playMelodyNote, 1000);
  }
}

export function startMusic(): void {
  if (musicPlaying) return;
  musicPlaying = true;
  melodyIndex = 0;
  getCtx(); // ensure context exists
  playMelodyNote();
}

export function stopMusic(): void {
  musicPlaying = false;
  if (musicTimeout) {
    clearTimeout(musicTimeout);
    musicTimeout = null;
  }
}

// ---- Initialize audio on first user interaction ----
export function initAudio(): void {
  getCtx();
  if (musicEnabled) startMusic();

  // Pause music when tab/window loses focus, resume when back
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopMusic();
      if (audioCtx && audioCtx.state === 'running') audioCtx.suspend();
    } else {
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      if (musicEnabled) startMusic();
    }
  });
}

// ---- Cleanup all audio (call on component unmount) ----
export function cleanupAudio(): void {
  stopMusic();
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
    musicGain = null;
    sfxGain = null;
  }
}
