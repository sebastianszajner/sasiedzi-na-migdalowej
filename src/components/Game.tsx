// ==========================================
// Sąsiedzi na Migdałowej — Main Game Component
// EXPANDED: wardrobe, achievements, weather,
// enhanced overlays, mobile controls
// ==========================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { AboutPanel } from './about/AboutPanel';
import type { GameState, MathProblem, DialogState, CostumeItem, CostumeSlot, Achievement, QuestCategory, SeasonType } from '../game/types';
import { CANVAS_W, CANVAS_H } from '../game/constants';
import {
  createGameState, updateGame, playerJump, playerInteract,
  advanceDialog, answerMath, equipCostume, setWeather, setSeason,
  tryInteractObject, playerCrouchOrLie, loadSave, clearSave,
  toggleRCControl, toggleVehicle, selectQuest, startBikeRace,
  startMinigame, answerMinigame, nextMinigameRound,
} from '../game/engine';
import { renderGame, renderIntro } from '../game/renderer';
import { LEVEL_1 } from '../game/level';
import {
  initAudio, cleanupAudio, sfxJump, sfxDialog, sfxDialogAdvance,
  sfxMathCorrect, sfxMathWrong,
  toggleSound, toggleMusic,
  sfxWheelTick, sfxWheelFanfare,
} from '../game/audio';
import type { MusicStyle } from '../game/audio';
import { initFaces, getFace } from '../game/faces';
import { initSpeech, speakDialog, stopSpeech, toggleSpeech, isSpeechEnabled } from '../game/speech';
import type { WellbeingState } from '../game/wellbeing';
import {
  createWellbeingState, updateWellbeing,
  dosycNaDzis, skipBreak, recordMathAnswer,
  getCelebrationTitle, getCelebrationSubtitle,
  getGrowthMindsetWrong, getBreakTitle, getBreakExercise,
  getGoodbyeMessage,
  getSessionMinutes,
  WELLBEING_CONFIG,
} from '../game/wellbeing';

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<string>('intro');
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [mathChallenge, setMathChallenge] = useState<MathProblem | null>(null);
  const [mathWrong, setMathWrong] = useState(false);
  const [stars, setStars] = useState(0);
  const [scale, setScale] = useState(1);
  const [costumes, setCostumes] = useState<CostumeItem[]>([]);
  const [equipped, setEquipped] = useState<Record<CostumeSlot, string | null>>({
    hat: null, glasses: null, cape: null, shoes: null, accessory: null,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<CostumeSlot>('hat');
  const [selectedCategory, setSelectedCategory] = useState<QuestCategory>('codzienne');
  const [currentSeason, setCurrentSeason] = useState<SeasonType>('wiosna');
  const [soundOn, setSoundOn] = useState(true);
  const [speechOn, setSpeechOn] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [musicStyleState, setMusicStyle] = useState<MusicStyle>('classical');
  const introStartRef = useRef<number>(0);
  const phaseRef = useRef<string>('intro');
  // Wheel state
  const [wheelActive, setWheelActive] = useState(false);
  const [wheelWinner, setWheelWinner] = useState<string | null>(null);
  const wheelCanvasRef = useRef<HTMLCanvasElement>(null);
  const wheelAnimRef = useRef<number>(0);
  const wheelVelRef = useRef<number>(0);
  const wheelAngleRef = useRef<number>(0);

  // Wellbeing system
  const wellbeingRef = useRef<WellbeingState>(createWellbeingState());
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [isDosycNaDzis, setIsDosycNaDzis] = useState(false);
  const [isSessionLimit, setIsSessionLimit] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [breakExercise, setBreakExercise] = useState(getBreakExercise());
  const [celebrationMsg, setCelebrationMsg] = useState('BRAWO KUBA! 🎉');
  const [celebrationSub, setCelebrationSub] = useState('Misja wykonana!');
  const [mathWrongMsg, setMathWrongMsg] = useState('');

  // Initialize game
  useEffect(() => {
    stateRef.current = createGameState(LEVEL_1);
    initFaces(); // Pre-load face portraits

    const handleResize = () => {
      if (!containerRef.current) return;
      const cw = containerRef.current.clientWidth;
      const ch = containerRef.current.clientHeight;
      const scaleX = cw / CANVAS_W;
      const scaleY = ch / CANVAS_H;
      setScale(Math.min(scaleX, scaleY));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keep phaseRef in sync
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let accumulator = 0;
    const FIXED_DT = 1 / 60; // Physics always runs at 60 FPS
    const MAX_ACCUMULATE = 0.1; // Max 6 steps per frame to prevent spiral of death
    let lastSecond = 0;

    const loop = (time: number) => {
      const elapsed = Math.min((time - lastTime) / 1000, MAX_ACCUMULATE);
      lastTime = time;

      // Intro animation (time-based, no physics — runs at native refresh rate)
      if (phase === 'intro') {
        if (introStartRef.current === 0) introStartRef.current = time;
        const introT = (time - introStartRef.current) / 1000;
        renderIntro(ctx, introT);

        // No auto-skip — user dismisses intro manually (click or key)
      }

      if (phase !== 'intro') {
        const state = stateRef.current;
        if (state) {
          // Fixed timestep: accumulate real time, step physics at exact 60 FPS
          accumulator += elapsed;
          while (accumulator >= FIXED_DT) {
            updateGame(state, FIXED_DT);
            accumulator -= FIXED_DT;
          }

          // Wellbeing system update (once per frame, real elapsed time)
          const wb = wellbeingRef.current;
          updateWellbeing(wb, elapsed);

          // Sync wellbeing React state (every ~1 second)
          const currentSecond = Math.floor(time / 1000);
          if (currentSecond !== lastSecond) {
            lastSecond = currentSecond;
            setSessionMinutes(getSessionMinutes(wb));
            if (wb.isBreakTime !== isBreakTime) {
              setIsBreakTime(wb.isBreakTime);
              if (wb.isBreakTime) setBreakExercise(getBreakExercise());
            }
          }

          renderGame(ctx, state);

          // Sync React state
          if (state.phase !== phase) setPhase(state.phase);
          // Generate random celebration message when entering celebration
          if (state.phase === 'celebration' && phase !== 'celebration') {
            setCelebrationMsg(getCelebrationTitle());
            setCelebrationSub(getCelebrationSubtitle());
          }
          if (state.dialog !== dialog) {
            setDialog(state.dialog);
            // Speak dialog line when dialog changes
            if (state.dialog && isSpeechEnabled()) {
              const line = state.dialog.lines[state.dialog.currentLine];
              if (line) speakDialog(state.dialog.npcId, line);
            } else {
              stopSpeech();
            }
          }
          if (state.mathChallenge !== mathChallenge) setMathChallenge(state.mathChallenge);
          if (state.stars !== stars) setStars(state.stars);
          // Sync costumes & achievements periodically
          if (currentSecond % 2 === 0) {
            setCostumes([...state.costumes]);
            setEquipped({ ...state.player.equippedCostumes });
            setAchievements([...state.achievements]);
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [phase, dialog, mathChallenge, stars]);

  // Cleanup audio on full unmount
  useEffect(() => {
    return () => cleanupAudio();
  }, []);

  // Keyboard input
  useEffect(() => {
    const state = stateRef.current;
    if (!state) return;

    const onKeyDown = (e: KeyboardEvent) => {
      state.keys.add(e.key);

      // Skip intro on any key
      if (phaseRef.current === 'intro') {
        setPhase('start');
        return;
      }

      if (state.phase === 'playing') {
        // E = Action (interact with NPC or objects)
        if (e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          const npcResult = playerInteract(state);
          if (npcResult) { sfxDialog(); }
          else if (tryInteractObject(state)) { /* object interaction handled */ }
        }
        // Space = Jump only
        if (e.key === ' ') {
          e.preventDefault();
          if (playerJump(state)) sfxJump();
        }
        if (e.key === 'ArrowUp' || e.key === 'e' || e.key === 'E') {
          e.preventDefault();
          // Try kindergarten minigame first (E key in przedszkole rooms)
          if (e.key === 'e' || e.key === 'E') {
            const px = state.player.x + state.player.w / 2;
            const py = state.player.y + state.player.h / 2;
            const currentRoom = state.rooms.find(r =>
              px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h
            );
            if (currentRoom && startMinigame(state, currentRoom.name)) {
              setPhase('minigame');
              return;
            }
          }
          const result = playerInteract(state);
          if (result) sfxDialog();
        }
        // ArrowDown / s = Crouch / Lie down
        if (e.key === 'ArrowDown' || e.key === 's') {
          playerCrouchOrLie(state);
        }
        // Toggle sound with M key
        if (e.key === 'm') { setMusicStyle(toggleMusic()); }
        if (e.key === 'n') { setSoundOn(toggleSound()); }
        // Open wardrobe with 'c' or 'g' (garderoba)
        if (e.key === 'c' || e.key === 'g') {
          state.phase = 'wardrobe';
          setPhase('wardrobe');
        }
        // Open achievements with 'a' or 'o' (osiągnięcia)
        if (e.key === 'o') {
          state.phase = 'achievements';
          setPhase('achievements');
        }
        // Open quest selection with 'q'
        if (e.key === 'q' || e.key === 'Q') {
          state.phase = 'quest_select';
          setPhase('quest_select');
        }
        // R = Toggle RC car control
        if (e.key === 'r' || e.key === 'R') {
          toggleRCControl(state);
        }
        // B = Mount/dismount vehicle
        if (e.key === 'b' || e.key === 'B') {
          toggleVehicle(state);
        }
        // G = Start bike race (when on vehicle near race zone)
        if (e.key === 'g' || e.key === 'G') {
          if (state.activeVehicle && !state.bikeRace) {
            // Find closest race to player
            const px = state.player.x;
            const races = [
              { id: 'race_sprint_skater', zone: [-4300, -4100] },
              { id: 'race_timeattack_bmx', zone: [-2600, -2400] },
              { id: 'race_tricks_park', zone: [-5900, -5700] },
              { id: 'race_sprint_road', zone: [5400, 5600] },
              { id: 'race_sprint_osiedle', zone: [9400, 9600] },
            ];
            for (const r of races) {
              if (px >= r.zone[0] && px <= r.zone[1]) {
                startBikeRace(state, r.id);
                break;
              }
            }
          }
        }
        // Weather toggle (for fun!) with number keys
        if (e.key === '1') setWeather(state, 'sunny');
        if (e.key === '2') setWeather(state, 'rainy');
        if (e.key === '3') setWeather(state, 'snowy');
        if (e.key === '4') setWeather(state, 'leaves');
      }

      if (state.phase === 'dialog') {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          advanceDialog(state);
          sfxDialogAdvance();
        }
      }

      // Minigame answer keys (1-4) and next round (Space/Enter)
      if (state.phase === 'minigame' && state.minigame) {
        if (['1', '2', '3', '4'].includes(e.key) && !state.minigame.answered) {
          answerMinigame(state, parseInt(e.key) - 1);
        }
        if ((e.key === ' ' || e.key === 'Enter') && state.minigame.answered) {
          nextMinigameRound(state);
          if (!state.minigame) setPhase('playing');
        }
        if (e.key === 'Escape') {
          state.minigame = null;
          state.phase = 'playing';
          setPhase('playing');
        }
      }

      // Close overlays with Escape
      if (state.phase === 'wardrobe' || state.phase === 'achievements' || state.phase === 'quest_select') {
        if (e.key === 'Escape' || e.key === 'c' || e.key === 'g' || e.key === 'o' || e.key === 'q') {
          state.phase = 'playing';
          setPhase('playing');
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      state.keys.delete(e.key);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const handleStart = useCallback((continueGame?: boolean) => {
    const state = stateRef.current;
    if (state) {
      // Try to restore save if continuing
      if (continueGame) {
        const save = loadSave();
        if (save && save.completedQuestIds) {
          // Mark completed quests
          for (const qid of save.completedQuestIds) {
            const q = state.quests.find(quest => quest.id === qid);
            if (q) {
              q.completed = true;
              q.active = true;
              q.currentStep = q.steps.length;
              q.steps.forEach(s => { s.completed = true; });
            }
          }
          state.stars = save.stars || 0;
          state.score = save.score || 0;
          state.questsCompleted = save.questsCompleted || 0;
          state.totalItemsCollected = save.completedQuestIds.length * 3;
          // Unlock achievements
          if (save.achievements) {
            for (const aid of save.achievements) {
              const a = state.achievements.find(ach => ach.id === aid);
              if (a) a.unlocked = true;
            }
          }
          // Unlock costumes
          if (save.costumes) {
            for (const cid of save.costumes) {
              const c = state.costumes.find(co => co.id === cid);
              if (c) c.unlocked = true;
            }
          }
          // Equip costumes
          if (save.equippedCostumes) {
            for (const [slot, id] of Object.entries(save.equippedCostumes)) {
              (state.player.equippedCostumes as Record<string, string | null>)[slot] = id;
            }
          }
          // Mark collected items
          for (const q of state.quests) {
            if (q.completed) {
              state.items.filter(i => i.questId === q.id).forEach(i => { i.collected = true; });
            }
          }
          // Activate next uncompleted quest
          const nextQ = state.quests.find(q => !q.completed);
          if (nextQ) {
            nextQ.active = true;
            const npc = state.npcs.find(n => n.id === nextQ.npcId);
            if (npc) { npc.emote = '❗'; if (!npc.visible) npc.visible = true; }
          }
        }
      }
      // Init wellbeing
      wellbeingRef.current = createWellbeingState();
      if (wellbeingRef.current.isSessionLimitReached) {
        setIsSessionLimit(true);
        return; // Don't start game
      }
      // Goodnight mode removed — parent controls bedtime, not the game
      state.phase = 'playing';
      setPhase('playing');
      initAudio();
      initSpeech(); // Init speech synthesis on first user interaction
    }
  }, []);

  const handleDialogClick = useCallback(() => {
    const state = stateRef.current;
    if (state && state.phase === 'dialog') {
      advanceDialog(state);
      sfxDialogAdvance();
      // Speak next line
      if (state.dialog && isSpeechEnabled()) {
        const line = state.dialog.lines[state.dialog.currentLine];
        if (line) speakDialog(state.dialog.npcId, line);
      } else {
        stopSpeech();
      }
    }
  }, []);

  const handleMathAnswer = useCallback((answer: number) => {
    const state = stateRef.current;
    if (!state) return;
    const correct = answerMath(state, answer);
    if (correct) {
      setMathWrong(false);
      sfxMathCorrect();
      recordMathAnswer(wellbeingRef.current, true);
    } else {
      setMathWrong(true);
      sfxMathWrong();
      setMathWrongMsg(getGrowthMindsetWrong());
      recordMathAnswer(wellbeingRef.current, false);
      setTimeout(() => setMathWrong(false), 800);
    }
  }, []);

  const handleEquipCostume = useCallback((costumeId: string | null, slot: CostumeSlot) => {
    const state = stateRef.current;
    if (!state) return;
    equipCostume(state, costumeId, slot);
    setEquipped({ ...state.player.equippedCostumes });
  }, []);

  const handleSelectQuest = useCallback((questId: string) => {
    const state = stateRef.current;
    if (!state) return;
    selectQuest(state, questId);
    setPhase('playing');
  }, []);

  // ---- Wheel (Koło Losujące) ----
  const handleSpinWheel = useCallback(() => {
    const state = stateRef.current;
    if (!state) return;
    const available = state.quests.filter(q => !q.completed);
    if (available.length < 2) return;

    setWheelActive(true);
    setWheelWinner(null);
    wheelVelRef.current = 0.48 + Math.random() * 0.28;
    wheelAngleRef.current = Math.random() * Math.PI * 2;

    const SEGMENT_COLORS = ['#FFD54F', '#4FC3F7', '#AED581', '#FF8A65', '#CE93D8', '#90CAF9', '#FFAB91', '#A5D6A7', '#EF9A9A', '#FFF59D'];

    let lastTickAngle = 0;

    const animate = () => {
      const canvas = wheelCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(cx, cy) - 20;

      // Physics
      wheelAngleRef.current += wheelVelRef.current;
      wheelVelRef.current *= 0.991;

      // Tick sound when passing segment boundary
      const segAngle = (Math.PI * 2) / available.length;
      const currentSeg = Math.floor(wheelAngleRef.current / segAngle);
      if (currentSeg !== lastTickAngle) {
        sfxWheelTick();
        lastTickAngle = currentSeg;
      }

      // Draw
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(wheelAngleRef.current);

      // Segments
      for (let i = 0; i < available.length; i++) {
        const startAngle = i * segAngle;
        const endAngle = startAngle + segAngle;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, R, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.save();
        ctx.rotate(startAngle + segAngle / 2);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333';
        ctx.font = `bold ${Math.max(10, Math.min(14, 180 / available.length))}px sans-serif`;
        const label = available[i].title.slice(0, 16);
        ctx.fillText(label, R * 0.55, 0);
        ctx.restore();
      }
      ctx.restore();

      // Pointer (top)
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.moveTo(cx - 12, 8);
      ctx.lineTo(cx + 12, 8);
      ctx.lineTo(cx, 28);
      ctx.closePath();
      ctx.fill();

      // Center circle
      ctx.fillStyle = '#FFF';
      ctx.strokeStyle = '#E53935';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#E53935';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎡', cx, cy);

      // Check if stopped
      if (wheelVelRef.current < 0.002) {
        wheelVelRef.current = 0;
        // Determine winner by pointer position (top = angle 3π/2)
        const pointerAngle = (Math.PI * 2 * 1.5 - wheelAngleRef.current % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const winnerIdx = Math.floor(pointerAngle / segAngle) % available.length;
        const winner = available[winnerIdx];
        setWheelWinner(winner.id);
        sfxWheelFanfare();
        return; // stop animation
      }

      wheelAnimRef.current = requestAnimationFrame(animate);
    };

    // Start after brief delay to let canvas mount
    setTimeout(() => {
      wheelAnimRef.current = requestAnimationFrame(animate);
    }, 100);
  }, []);

  const handleCloseOverlay = useCallback(() => {
    const state = stateRef.current;
    if (state) {
      state.phase = 'playing';
      setPhase('playing');
    }
  }, []);

  const fs = (base: number) => `${Math.max(base * 0.6, base * scale)}px`;

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-[#1a1a2e]">
      <div className="relative" style={{ width: CANVAS_W * scale, height: CANVAS_H * scale }}>
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="rounded-xl shadow-2xl"
          style={{ width: CANVAS_W * scale, height: CANVAS_H * scale }}
        />

        {/* INTRO ANIMATION */}
        {phase === 'intro' && (
          <div
            className="absolute inset-0 cursor-pointer rounded-xl"
            onClick={() => setPhase('start')}
          />
        )}

        {/* START SCREEN */}
        {phase === 'start' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-blue-400/90 to-green-400/90 rounded-xl">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🏠</div>
              <h1
                className="text-4xl font-bold text-white mb-2"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)', fontSize: fs(40) }}
              >
                Sąsiedzi na Migdałowej
              </h1>
              <p className="text-xl text-white/90 mb-2" style={{ fontSize: fs(20) }}>
                Przygody Kuby w domu na Migdałowej 47
              </p>
              <p className="text-white/70 mb-6" style={{ fontSize: fs(14) }}>
                39 misji • 5 kategorii • Żabka • Paczkomat • Antresola!
              </p>

              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => handleStart(false)}
                  className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold py-4 px-12 rounded-full text-2xl shadow-lg transform hover:scale-105 transition-all animate-pulse cursor-pointer"
                  style={{ fontSize: fs(28) }}
                >
                  GRAJ! 🎮
                </button>
                {loadSave() && (
                  <button
                    onClick={() => handleStart(true)}
                    className="bg-green-400 hover:bg-green-300 text-green-900 font-bold py-4 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition-all cursor-pointer"
                    style={{ fontSize: fs(18) }}
                  >
                    Kontynuuj ▶
                  </button>
                )}
              </div>
              {loadSave() && (
                <button
                  onClick={() => { clearSave(); window.location.reload(); }}
                  className="mt-2 text-white/50 hover:text-white/80 text-xs cursor-pointer underline"
                  style={{ fontSize: fs(10) }}
                >
                  Wyczyść zapis
                </button>
              )}

              <div className="mt-6 inline-grid gap-y-2 gap-x-6 text-white/80" style={{ fontSize: fs(12), gridTemplateColumns: 'auto auto' }}>
                {/* Row 1 - movement */}
                <span className="flex items-center gap-1">
                  <kbd className="bg-white/15 rounded px-1.5 py-0.5 text-white font-mono" style={{ fontSize: fs(11) }}>←→</kbd>
                  <span>Chodzenie</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white/15 rounded px-1.5 py-0.5 text-white font-mono" style={{ fontSize: fs(11) }}>↑</kbd>
                  <span>Schody</span>
                </span>
                {/* Row 2 */}
                <span className="flex items-center gap-1">
                  <kbd className="bg-white/15 rounded px-1.5 py-0.5 text-white font-mono" style={{ fontSize: fs(11) }}>SPACJA</kbd>
                  <span>Skok (2x = podwójny!)</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white/15 rounded px-1.5 py-0.5 text-white font-mono" style={{ fontSize: fs(11) }}>E</kbd>
                  <span>Akcja / Rozmowa</span>
                </span>
                {/* Row 3 */}
                <span className="flex items-center gap-1">
                  <kbd className="bg-white/15 rounded px-1.5 py-0.5 text-white font-mono" style={{ fontSize: fs(11) }}>↓</kbd>
                  <span>Kucanie</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white/15 rounded px-1.5 py-0.5 text-white font-mono" style={{ fontSize: fs(11) }}>↓↓</kbd>
                  <span>Leżenie</span>
                </span>
                {/* Divider */}
                <div className="col-span-2 border-t border-white/10 my-0.5" />
                {/* Row 4 - menus */}
                <span className="flex items-center gap-1">
                  <kbd className="bg-yellow-400/20 rounded px-1.5 py-0.5 text-yellow-300 font-mono" style={{ fontSize: fs(11) }}>Q</kbd>
                  <span>📋 Misje</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-yellow-400/20 rounded px-1.5 py-0.5 text-yellow-300 font-mono" style={{ fontSize: fs(11) }}>C</kbd>
                  <span>🎨 Garderoba</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-yellow-400/20 rounded px-1.5 py-0.5 text-yellow-300 font-mono" style={{ fontSize: fs(11) }}>O</kbd>
                  <span>🏆 Osiągnięcia</span>
                </span>
                {/* Row 5 - audio */}
                <span className="flex items-center gap-1">
                  <kbd className="bg-white/15 rounded px-1.5 py-0.5 text-white font-mono" style={{ fontSize: fs(11) }}>M</kbd>
                  <span>🎵 Muzyka (chill/klasyczna)</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white/15 rounded px-1.5 py-0.5 text-white font-mono" style={{ fontSize: fs(11) }}>N</kbd>
                  <span>🔊 Dźwięki</span>
                </span>
                {/* Row 6 - weather */}
                <span className="flex items-center gap-1 col-span-2 justify-center">
                  <kbd className="bg-white/15 rounded px-1.5 py-0.5 text-white font-mono" style={{ fontSize: fs(11) }}>1</kbd>☀️
                  <kbd className="bg-white/15 rounded px-1.5 py-0.5 text-white font-mono" style={{ fontSize: fs(11) }}>2</kbd>🌧️
                  <kbd className="bg-white/15 rounded px-1.5 py-0.5 text-white font-mono" style={{ fontSize: fs(11) }}>3</kbd>❄️
                  <kbd className="bg-white/15 rounded px-1.5 py-0.5 text-white font-mono" style={{ fontSize: fs(11) }}>4</kbd>🍂
                  <span className="ml-1">Pogoda</span>
                </span>
                {/* Row 7 - season selector */}
                <span className="flex items-center gap-1 col-span-2 justify-center">
                  {(['wiosna', 'lato', 'jesien', 'zima'] as SeasonType[]).map((s) => {
                    const emoji = { wiosna: '🌸', lato: '☀️', jesien: '🍂', zima: '❄️' }[s];
                    const label = { wiosna: 'Wiosna', lato: 'Lato', jesien: 'Jesień', zima: 'Zima' }[s];
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          if (stateRef.current) {
                            setSeason(stateRef.current, s);
                            setCurrentSeason(s);
                          }
                        }}
                        className={`px-2 py-0.5 rounded text-white ${currentSeason === s ? 'bg-yellow-600' : 'bg-white/15 hover:bg-white/25'}`}
                        style={{ fontSize: fs(11) }}
                        title={label}
                      >
                        {emoji}
                      </button>
                    );
                  })}
                  <span className="ml-1">Pora roku</span>
                </span>
              </div>
              <button
                onClick={() => setShowAbout(true)}
                className="mt-4 text-white/60 hover:text-white/90 text-sm cursor-pointer underline transition-colors"
                style={{ fontSize: fs(13) }}
              >
                O mnie — Sebastian Szajner
              </button>
            </div>
          </div>
        )}

        {/* ABOUT ME OVERLAY */}
        {showAbout && <AboutPanel onClose={() => setShowAbout(false)} />}

        {/* DIALOG */}
        {phase === 'dialog' && dialog && (
          <div
            className="absolute bottom-4 left-4 right-4 cursor-pointer"
            onClick={handleDialogClick}
            style={{ bottom: 16 * scale, left: 16 * scale, right: 16 * scale }}
          >
            <div
              className="bg-white/95 rounded-2xl p-6 shadow-2xl border-4 border-amber-700 max-w-2xl mx-auto"
              style={{ padding: `${Math.max(12, 24 * scale)}px` }}
            >
              <div className="flex items-start gap-4">
                {/* Face portrait or emoji fallback — large for visibility */}
                <div className="flex-shrink-0" style={{ width: fs(120), height: fs(120) }}>
                  {(() => {
                    const faceImg = getFace(dialog.npcId);
                    if (faceImg) {
                      return (
                        <div
                          className="rounded-full overflow-hidden"
                          style={{
                            width: fs(120), height: fs(120),
                            borderWidth: 4, borderColor: '#8D6E63', borderStyle: 'solid',
                            backgroundColor: '#FFDCB8', // skin tone background — no checkerboard
                          }}
                        >
                          <img
                            src={faceImg.src}
                            alt={dialog.npcName}
                            className="object-cover w-full h-full"
                            style={{ width: '100%', height: '100%' }}
                          />
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-center justify-center h-full" style={{ fontSize: fs(70) }}>
                        {dialog.icon}
                      </div>
                    );
                  })()}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-amber-800 mb-1" style={{ fontSize: fs(20) }}>
                    {dialog.npcName}
                  </div>
                  <div className="text-gray-800" style={{ fontSize: fs(24) }}>
                    {dialog.lines[dialog.currentLine]}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setSpeechOn(toggleSpeech()); }}
                  className={`text-xs px-2 py-0.5 rounded ${speechOn ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'}`}
                  style={{ fontSize: fs(11) }}
                >
                  {speechOn ? '🔊 Głos' : '🔇 Głos'}
                </button>
                <div className="text-gray-400" style={{ fontSize: fs(14) }}>
                  Kliknij lub SPACJA ▶
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOSYĆ NA DZIŚ button — always visible during gameplay */}
        {phase === 'playing' && (
          <button
            onClick={() => {
              dosycNaDzis(wellbeingRef.current);
              setIsDosycNaDzis(true);
            }}
            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700 rounded-full px-3 py-1 text-xs shadow cursor-pointer transition-all z-10"
            style={{ fontSize: fs(10) }}
            title="Zakończ grę na dziś"
          >
            🌙 Dosyć na dziś
          </button>
        )}

        {/* SESSION TIMER — top left during gameplay */}
        {phase === 'playing' && sessionMinutes > 0 && (
          <div
            className="absolute top-2 left-2 bg-white/70 rounded-full px-3 py-1 text-xs text-gray-500 z-10"
            style={{ fontSize: fs(10) }}
          >
            ⏱️ {sessionMinutes} min
          </div>
        )}

        {/* MATH CHALLENGE */}
        {phase === 'math' && mathChallenge && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
            <div
              className="bg-white rounded-3xl p-8 shadow-2xl max-w-lg mx-4 text-center"
              style={{ padding: `${Math.max(16, 32 * scale)}px` }}
            >
              <div className="text-3xl font-bold text-amber-700 mb-4" style={{ fontSize: fs(30) }}>
                🧮 Zagadka! {mathChallenge.difficulty > 1 && '⭐'.repeat(mathChallenge.difficulty)}
              </div>

              <div className="mb-4" style={{ fontSize: fs(32) }}>
                {mathChallenge.operation === '-' ? (
                  <div>
                    <div className="mb-2">{mathChallenge.visualIcon.repeat(mathChallenge.num1)}</div>
                    <div className="text-red-500 line-through">{mathChallenge.visualIcon.repeat(mathChallenge.num2)}</div>
                  </div>
                ) : mathChallenge.operation === '×' ? (
                  <div>
                    <div className="mb-1">
                      {Array.from({ length: mathChallenge.num1 }, (_, i) => (
                        <span key={i} className="inline-block mx-1 border-b-2 border-amber-300 pb-1">
                          {mathChallenge.visualIcon.repeat(mathChallenge.num2)}
                        </span>
                      ))}
                    </div>
                    <div className="text-amber-600 font-bold text-xl">razem?</div>
                  </div>
                ) : (
                  <div>
                    <div className="mb-1">{mathChallenge.visualIcon.repeat(mathChallenge.num1)}</div>
                    <div className="text-green-600 font-bold text-2xl">+</div>
                    <div>{mathChallenge.visualIcon.repeat(mathChallenge.num2)}</div>
                  </div>
                )}
              </div>

              <div className="text-gray-700 mb-6 whitespace-pre-line" style={{ fontSize: fs(20) }}>
                {mathChallenge.question}
              </div>

              <div className="flex gap-4 justify-center">
                {mathChallenge.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleMathAnswer(opt)}
                    className={`
                      rounded-2xl font-bold shadow-lg transform hover:scale-110 transition-all cursor-pointer
                      ${mathWrong ? 'bg-red-100 border-red-400 animate-shake' : 'bg-blue-100 hover:bg-blue-200 border-blue-400'}
                      border-4
                    `}
                    style={{
                      width: Math.max(50, 80 * scale),
                      height: Math.max(50, 80 * scale),
                      fontSize: fs(32),
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="mt-4 text-gray-400" style={{ fontSize: fs(14) }}>
                {mathChallenge.hint}
              </div>

              {mathWrong && (
                <div className="mt-3 text-orange-600 font-bold animate-bounce" style={{ fontSize: fs(18) }}>
                  {mathWrongMsg || 'Spróbuj jeszcze raz! 💪'}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CELEBRATION */}
        {phase === 'celebration' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center animate-bounce">
              <div style={{ fontSize: fs(80) }}>🎉</div>
              <div
                className="font-bold text-white"
                style={{ fontSize: fs(42), textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }}
              >
                {celebrationMsg}
              </div>
              <div
                className="text-white/80 mt-1"
                style={{ fontSize: fs(18), textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}
              >
                {celebrationSub}
              </div>
              <div
                className="text-yellow-300 mt-2"
                style={{ fontSize: fs(32), textShadow: '2px 2px 4px rgba(0,0,0,0.6)' }}
              >
                {'⭐'.repeat(stars)}
              </div>
            </div>
          </div>
        )}

        {/* LEVEL COMPLETE */}
        {phase === 'level_complete' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-yellow-400/80 to-green-400/80 rounded-xl">
            <div className="text-center">
              <div style={{ fontSize: fs(80) }}>🏆</div>
              <div className="font-bold text-white mb-2" style={{ fontSize: fs(48), textShadow: '3px 3px 6px rgba(0,0,0,0.5)' }}>
                Wszystkie misje ukończone! 🏆
              </div>
              <div className="text-white mb-2" style={{ fontSize: fs(24) }}>
                Wszystkie 39 misji ukończone!
              </div>
              <div className="text-yellow-300 mb-2" style={{ fontSize: fs(40) }}>
                {'⭐'.repeat(stars)}
              </div>
              <div className="text-white/80 mb-4" style={{ fontSize: fs(16) }}>
                Odblokowane kostiumy: {costumes.filter(c => c.unlocked).length}/{costumes.length}
              </div>
              <div className="text-white/80 mb-6" style={{ fontSize: fs(16) }}>
                Osiągnięcia: {achievements.filter(a => a.unlocked).length}/{achievements.length}
              </div>
              <button
                onClick={() => {
                  clearSave();
                  stateRef.current = createGameState(LEVEL_1);
                  setPhase('start');
                }}
                className="bg-white hover:bg-gray-100 text-green-700 font-bold py-3 px-8 rounded-full text-xl shadow-lg cursor-pointer"
                style={{ fontSize: fs(22) }}
              >
                Zagraj ponownie! 🔄
              </button>
            </div>
          </div>
        )}

        {/* WARDROBE (Garderoba) */}
        {phase === 'wardrobe' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
            <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-xl w-full mx-4" style={{ maxHeight: CANVAS_H * scale * 0.85 }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-amber-800" style={{ fontSize: fs(24) }}>
                  🎨 Garderoba Kuby
                </h2>
                <button
                  onClick={handleCloseOverlay}
                  className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Slot tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {(['hat', 'glasses', 'cape', 'accessory'] as CostumeSlot[]).map(slot => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-3 py-1.5 rounded-full text-sm font-bold cursor-pointer transition-all
                      ${selectedSlot === slot ? 'bg-amber-400 text-amber-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                    `}
                    style={{ fontSize: fs(13) }}
                  >
                    {slot === 'hat' && '🎩 Czapki'}
                    {slot === 'glasses' && '👓 Okulary'}
                    {slot === 'cape' && '🧥 Peleryny'}
                    {slot === 'accessory' && '⚔️ Akcesoria'}
                  </button>
                ))}
              </div>

              {/* Costume grid */}
              <div className="grid grid-cols-3 gap-3 overflow-y-auto" style={{ maxHeight: 200 * scale }}>
                {/* "None" option */}
                <button
                  onClick={() => handleEquipCostume(null, selectedSlot)}
                  className={`p-3 rounded-xl border-2 text-center cursor-pointer transition-all
                    ${equipped[selectedSlot] === null ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <div className="text-2xl mb-1">❌</div>
                  <div className="text-xs text-gray-500">Brak</div>
                </button>

                {costumes.filter(c => c.slot === selectedSlot).map(c => (
                  <button
                    key={c.id}
                    onClick={() => c.unlocked && handleEquipCostume(c.id, selectedSlot)}
                    className={`p-3 rounded-xl border-2 text-center transition-all
                      ${!c.unlocked ? 'border-gray-200 bg-gray-100 opacity-50' : 'cursor-pointer'}
                      ${c.unlocked && equipped[selectedSlot] === c.id ? 'border-amber-400 bg-amber-50 scale-105' : ''}
                      ${c.unlocked && equipped[selectedSlot] !== c.id ? 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/50' : ''}
                    `}
                  >
                    <div className="text-2xl mb-1">{c.unlocked ? c.emoji : '🔒'}</div>
                    <div className="text-xs" style={{ fontSize: fs(10) }}>
                      {c.unlocked ? c.name : '???'}
                    </div>
                  </button>
                ))}
              </div>

              {/* Currently equipped */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-500 mb-2" style={{ fontSize: fs(12) }}>Aktualny strój:</div>
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(equipped).map(([slot, costumeId]) => {
                    if (!costumeId) return null;
                    const c = costumes.find(co => co.id === costumeId);
                    if (!c) return null;
                    return (
                      <span key={slot} className="bg-amber-100 px-2 py-1 rounded-full text-sm">
                        {c.emoji} {c.name}
                      </span>
                    );
                  })}
                  {Object.values(equipped).every(v => v === null) && (
                    <span className="text-gray-400 text-sm">Brak — ukończ misje aby odblokować!</span>
                  )}
                </div>
              </div>

              <div className="mt-3 text-center text-gray-400" style={{ fontSize: fs(12) }}>
                ESC lub C aby zamknąć
              </div>
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS (Osiągnięcia) */}
        {phase === 'achievements' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
            <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-xl w-full mx-4" style={{ maxHeight: CANVAS_H * scale * 0.85 }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-amber-800" style={{ fontSize: fs(24) }}>
                  🏆 Osiągnięcia
                </h2>
                <button
                  onClick={handleCloseOverlay}
                  className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 300 * scale }}>
                {achievements.map(a => (
                  <div
                    key={a.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                      ${a.unlocked ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50 opacity-60'}
                    `}
                  >
                    <div className="text-3xl">{a.unlocked ? a.emoji : '🔒'}</div>
                    <div className="flex-1">
                      <div className="font-bold" style={{ fontSize: fs(14) }}>
                        {a.unlocked ? a.title : '???'}
                      </div>
                      <div className="text-gray-500" style={{ fontSize: fs(12) }}>
                        {a.description}
                      </div>
                      {a.costumeReward && a.unlocked && (
                        <div className="text-amber-600 mt-1" style={{ fontSize: fs(11) }}>
                          🎁 Nagroda: nowy kostium!
                        </div>
                      )}
                    </div>
                    {a.unlocked && <div className="text-green-500 text-xl">✅</div>}
                  </div>
                ))}
              </div>

              <div className="mt-4 text-center">
                <div className="text-amber-700 font-bold" style={{ fontSize: fs(16) }}>
                  {achievements.filter(a => a.unlocked).length} / {achievements.length} odblokowane
                </div>
              </div>

              <div className="mt-3 text-center text-gray-400" style={{ fontSize: fs(12) }}>
                ESC lub O aby zamknąć
              </div>
            </div>
          </div>
        )}

        {/* QUEST SELECTION (Misje) */}
        {phase === 'quest_select' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
            <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-2xl w-full mx-4 relative" style={{ maxHeight: CANVAS_H * scale * 0.9 }}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-amber-800" style={{ fontSize: fs(24) }}>
                  📋 Wybierz Misję
                </h2>
                <button
                  onClick={handleCloseOverlay}
                  className="text-gray-400 hover:text-gray-600 text-2xl cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Category tabs */}
              <div className="flex gap-1.5 mb-4 flex-wrap">
                {([
                  { key: 'codzienne' as QuestCategory, label: '🏠 Codzienne', color: 'amber' },
                  { key: 'przygody' as QuestCategory, label: '🗺️ Przygody', color: 'blue' },
                  { key: 'higiena' as QuestCategory, label: '🧼 Higiena', color: 'teal' },
                  { key: 'posilki' as QuestCategory, label: '🍽️ Posiłki', color: 'orange' },
                  { key: 'specjalne' as QuestCategory, label: '⭐ Specjalne', color: 'purple' },
                ]).map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`px-3 py-1.5 rounded-full text-sm font-bold cursor-pointer transition-all
                      ${selectedCategory === cat.key
                        ? 'bg-amber-400 text-amber-900 scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                    `}
                    style={{ fontSize: fs(12) }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Quest list */}
              <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 320 * scale }}>
                {stateRef.current?.quests
                  .filter(q => q.category === selectedCategory)
                  .map(q => {
                    const isActive = q.active && !q.completed;
                    const completedSteps = q.steps.filter(s => s.completed).length;
                    return (
                      <button
                        key={q.id}
                        onClick={() => !q.completed && handleSelectQuest(q.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                          ${q.completed
                            ? 'border-green-300 bg-green-50 opacity-70'
                            : isActive
                              ? 'border-amber-400 bg-amber-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50 cursor-pointer'}
                        `}
                      >
                        <div className="text-2xl flex-shrink-0" style={{ fontSize: fs(28) }}>
                          {q.completed ? '✅' : isActive ? '▶️' : '📋'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate" style={{ fontSize: fs(14) }}>
                            {q.title}
                          </div>
                          <div className="text-gray-500 flex items-center gap-2" style={{ fontSize: fs(11) }}>
                            <span>{'⭐'.repeat(q.reward)}</span>
                            <span>•</span>
                            <span>{q.steps.length} kroków</span>
                            {q.costumeReward && <span>• 🎁 Kostium</span>}
                          </div>
                          {isActive && (
                            <div className="mt-1">
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden" style={{ width: '100%' }}>
                                <div
                                  className="h-full bg-amber-400 rounded-full transition-all"
                                  style={{ width: `${(completedSteps / q.steps.length) * 100}%` }}
                                />
                              </div>
                              <div className="text-amber-600 mt-0.5" style={{ fontSize: fs(10) }}>
                                {completedSteps}/{q.steps.length} — {q.steps[q.currentStep]?.description}
                              </div>
                            </div>
                          )}
                        </div>
                        {q.completed && (
                          <div className="text-green-500 flex-shrink-0" style={{ fontSize: fs(16) }}>✓</div>
                        )}
                      </button>
                    );
                  })}
              </div>

              {/* Category stats + Wheel button */}
              <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                <div className="text-gray-500" style={{ fontSize: fs(12) }}>
                  {stateRef.current?.quests.filter(q => q.category === selectedCategory && q.completed).length}/
                  {stateRef.current?.quests.filter(q => q.category === selectedCategory).length} ukończone
                </div>
                <button
                  onClick={handleSpinWheel}
                  className="bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-white font-bold px-4 py-2 rounded-full shadow-lg transform hover:scale-105 transition-all cursor-pointer animate-pulse"
                  style={{ fontSize: fs(13) }}
                >
                  🎡 Wylosuj misję!
                </button>
                <div className="text-gray-400" style={{ fontSize: fs(11) }}>
                  ESC lub Q
                </div>
              </div>

              {/* Wheel overlay */}
              {wheelActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl z-10">
                  <div className="text-center">
                    <h3 className="text-white font-bold mb-3" style={{ fontSize: fs(22) }}>
                      🎡 Koło Losujące!
                    </h3>
                    <canvas
                      ref={wheelCanvasRef}
                      width={320}
                      height={320}
                      className="mx-auto rounded-full shadow-2xl"
                      style={{ width: 280 * scale, height: 280 * scale }}
                    />
                    {wheelWinner && (
                      <div className="mt-4">
                        <div className="text-yellow-300 font-bold animate-bounce" style={{ fontSize: fs(20) }}>
                          🎉 Wylosowano: {stateRef.current?.quests.find(q => q.id === wheelWinner)?.title}
                        </div>
                        <button
                          onClick={() => {
                            if (wheelWinner) {
                              handleSelectQuest(wheelWinner);
                              setWheelActive(false);
                              setWheelWinner(null);
                              if (wheelAnimRef.current) cancelAnimationFrame(wheelAnimRef.current);
                            }
                          }}
                          className="mt-3 bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-full shadow-lg cursor-pointer transform hover:scale-105 transition-all"
                          style={{ fontSize: fs(16) }}
                        >
                          ▶️ Graj!
                        </button>
                        <button
                          onClick={() => {
                            setWheelActive(false);
                            setWheelWinner(null);
                            if (wheelAnimRef.current) cancelAnimationFrame(wheelAnimRef.current);
                          }}
                          className="mt-2 ml-3 text-white/60 hover:text-white/90 cursor-pointer"
                          style={{ fontSize: fs(12) }}
                        >
                          Losuj ponownie
                        </button>
                      </div>
                    )}
                    {!wheelWinner && (
                      <div className="mt-3 text-white/60" style={{ fontSize: fs(14) }}>
                        Kręci się...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HUD buttons (playing phase) */}
        {phase === 'playing' && (
          <div className="absolute top-2 right-2 flex gap-1" style={{ top: 54 * scale }}>
            <button
              onClick={() => {
                const s = stateRef.current;
                if (s) { s.phase = 'quest_select'; setPhase('quest_select'); }
              }}
              className="bg-white/20 hover:bg-white/40 text-white rounded-lg px-2 py-1 text-sm cursor-pointer transition-all"
              style={{ fontSize: fs(12) }}
              title="Misje (Q)"
            >
              📋
            </button>
            <button
              onClick={() => {
                const s = stateRef.current;
                if (s) { s.phase = 'wardrobe'; setPhase('wardrobe'); }
              }}
              className="bg-white/20 hover:bg-white/40 text-white rounded-lg px-2 py-1 text-sm cursor-pointer transition-all"
              style={{ fontSize: fs(12) }}
              title="Garderoba (C)"
            >
              🎨
            </button>
            <button
              onClick={() => {
                const s = stateRef.current;
                if (s) { s.phase = 'achievements'; setPhase('achievements'); }
              }}
              className="bg-white/20 hover:bg-white/40 text-white rounded-lg px-2 py-1 text-sm cursor-pointer transition-all"
              style={{ fontSize: fs(12) }}
              title="Osiągnięcia (O)"
            >
              🏆
            </button>
            <button
              onClick={() => setMusicStyle(toggleMusic())}
              className="bg-white/20 hover:bg-white/40 text-white rounded-lg px-2 py-1 text-sm cursor-pointer transition-all"
              style={{ fontSize: fs(12) }}
              title="Muzyka (M)"
            >
              {musicStyleState === 'classical' ? '🎻' : '🔇'}
            </button>
            <button
              onClick={() => setSoundOn(toggleSound())}
              className="bg-white/20 hover:bg-white/40 text-white rounded-lg px-2 py-1 text-sm cursor-pointer transition-all"
              style={{ fontSize: fs(12) }}
              title="Dźwięki (N)"
            >
              {soundOn ? '🔊' : '🔈'}
            </button>
          </div>
        )}

        {/* BREAK TIME OVERLAY */}
        {isBreakTime && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-green-400/95 to-blue-400/95 rounded-xl z-50">
            <div className="text-center max-w-md mx-4">
              <div className="text-7xl mb-4 animate-bounce" style={{ fontSize: fs(80) }}>🤸</div>
              <div className="text-3xl font-bold text-white mb-3" style={{ fontSize: fs(32), textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                {getBreakTitle()}
              </div>
              <div className="bg-white/20 rounded-2xl p-6 mb-4">
                <div className="text-5xl mb-2" style={{ fontSize: fs(60) }}>{breakExercise.emoji}</div>
                <div className="text-2xl font-bold text-white" style={{ fontSize: fs(24) }}>
                  {breakExercise.text}
                </div>
              </div>
              <div className="text-white/80 mb-4" style={{ fontSize: fs(14) }}>
                Przerwa trwa minutę — ruszaj się! 💪
              </div>
              <button
                onClick={() => { skipBreak(wellbeingRef.current); setIsBreakTime(false); }}
                className="bg-white/30 hover:bg-white/50 text-white font-bold py-2 px-6 rounded-full cursor-pointer transition-all"
                style={{ fontSize: fs(16) }}
              >
                Wracam do gry! ▶
              </button>
            </div>
          </div>
        )}

        {/* DOSYĆ NA DZIŚ OVERLAY */}
        {isDosycNaDzis && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-amber-400/95 to-orange-400/95 rounded-xl z-50">
            <div className="text-center max-w-md mx-4">
              <div className="text-7xl mb-4 animate-bounce" style={{ fontSize: fs(80) }}>👋</div>
              <div className="text-3xl font-bold text-white mb-3" style={{ fontSize: fs(32), textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                {getGoodbyeMessage()}
              </div>
              <div className="text-white/80 mb-2" style={{ fontSize: fs(18) }}>
                Grałeś dzisiaj {sessionMinutes} minut
              </div>
              <div className="text-white/80 mb-4" style={{ fontSize: fs(18) }}>
                ⭐ Bonus za mądre zakończenie! +1⭐
              </div>
              <div className="text-6xl mb-6" style={{ fontSize: fs(60) }}>🌟</div>
              <button
                onClick={() => window.location.reload()}
                className="bg-white hover:bg-gray-100 text-orange-700 font-bold py-3 px-8 rounded-full shadow-lg cursor-pointer"
                style={{ fontSize: fs(20) }}
              >
                Zamknij grę 🌙
              </button>
            </div>
          </div>
        )}

        {/* SESSION LIMIT OVERLAY */}
        {isSessionLimit && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-500/95 to-purple-500/95 rounded-xl z-50">
            <div className="text-center max-w-md mx-4">
              <div className="text-7xl mb-4" style={{ fontSize: fs(80) }}>🎮</div>
              <div className="text-3xl font-bold text-white mb-3" style={{ fontSize: fs(28) }}>
                Dzisiaj już dość grania!
              </div>
              <div className="text-white/80 mb-4" style={{ fontSize: fs(16) }}>
                Grałeś już {WELLBEING_CONFIG.MAX_SESSIONS_PER_DAY} razy. Wróć jutro na nowe przygody!
              </div>
              <div className="text-6xl mb-4" style={{ fontSize: fs(60) }}>🐕😴</div>
              <div className="text-white/60" style={{ fontSize: fs(12) }}>
                Franek też odpoczywa!
              </div>
              <button
                onClick={() => setIsSessionLimit(false)}
                className="mt-4 bg-white/20 hover:bg-white/30 text-white/70 text-xs py-1 px-4 rounded-full cursor-pointer"
                style={{ fontSize: fs(10) }}
              >
                Rodzic: Kontynuuj mimo to
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
