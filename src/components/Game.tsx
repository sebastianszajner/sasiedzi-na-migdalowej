// ==========================================
// Sąsiedzi na Migdałowej — Main Game Component
// EXPANDED: wardrobe, achievements, weather,
// enhanced overlays, mobile controls
// ==========================================

import { useEffect, useRef, useState, useCallback } from 'react';
import type { GameState, MathProblem, DialogState, CostumeItem, CostumeSlot, Achievement } from '../game/types';
import { CANVAS_W, CANVAS_H } from '../game/constants';
import {
  createGameState, updateGame, playerJump, playerInteract,
  advanceDialog, answerMath, equipCostume, setWeather,
  tryInteractObject, playerCrouchOrLie, loadSave, clearSave,
  toggleRCControl,
} from '../game/engine';
import { renderGame, renderIntro } from '../game/renderer';
import { LEVEL_1 } from '../game/level';
import {
  initAudio, cleanupAudio, sfxJump, sfxDialog, sfxDialogAdvance,
  sfxMathCorrect, sfxMathWrong,
  toggleSound, toggleMusic,
} from '../game/audio';
import type { MusicStyle } from '../game/audio';

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
  const [soundOn, setSoundOn] = useState(true);
  const [musicStyleState, setMusicStyle] = useState<MusicStyle>('chill');
  const introStartRef = useRef<number>(0);
  const phaseRef = useRef<string>('intro');

  // Initialize game
  useEffect(() => {
    stateRef.current = createGameState(LEVEL_1);

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

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      // Intro animation
      if (phase === 'intro') {
        if (introStartRef.current === 0) introStartRef.current = time;
        const introT = (time - introStartRef.current) / 1000;
        renderIntro(ctx, introT);

        // Auto-transition after 8 seconds
        if (introT > 8) {
          setPhase('start');
        }
      }

      if (phase !== 'intro') {
        const state = stateRef.current;
        if (state) {
          updateGame(state, dt);
          renderGame(ctx, state);

          // Sync React state
          if (state.phase !== phase) setPhase(state.phase);
          if (state.dialog !== dialog) setDialog(state.dialog);
          if (state.mathChallenge !== mathChallenge) setMathChallenge(state.mathChallenge);
          if (state.stars !== stars) setStars(state.stars);
          // Sync costumes & achievements periodically
          if (Math.floor(time / 1000) % 2 === 0) {
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
        if (e.key === 'ArrowUp') {
          e.preventDefault();
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
        // R = Toggle RC car control
        if (e.key === 'r' || e.key === 'R') {
          toggleRCControl(state);
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

      // Close overlays with Escape
      if (state.phase === 'wardrobe' || state.phase === 'achievements') {
        if (e.key === 'Escape' || e.key === 'c' || e.key === 'g' || e.key === 'o') {
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
      state.phase = 'playing';
      setPhase('playing');
      initAudio();
    }
  }, []);

  const handleDialogClick = useCallback(() => {
    const state = stateRef.current;
    if (state && state.phase === 'dialog') {
      advanceDialog(state);
      sfxDialogAdvance();
    }
  }, []);

  const handleMathAnswer = useCallback((answer: number) => {
    const state = stateRef.current;
    if (!state) return;
    const correct = answerMath(state, answer);
    if (correct) {
      setMathWrong(false);
      sfxMathCorrect();
    } else {
      setMathWrong(true);
      sfxMathWrong();
      setTimeout(() => setMathWrong(false), 800);
    }
  }, []);

  const handleEquipCostume = useCallback((costumeId: string | null, slot: CostumeSlot) => {
    const state = stateRef.current;
    if (!state) return;
    equipCostume(state, costumeId, slot);
    setEquipped({ ...state.player.equippedCostumes });
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
                19 misji • Kostiumy • Matematyka • Przygoda!
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
              </div>
            </div>
          </div>
        )}

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
                <div className="text-4xl flex-shrink-0" style={{ fontSize: fs(40) }}>
                  {dialog.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-amber-800 mb-1" style={{ fontSize: fs(16) }}>
                    {dialog.npcName}
                  </div>
                  <div className="text-gray-800" style={{ fontSize: fs(22) }}>
                    {dialog.lines[dialog.currentLine]}
                  </div>
                </div>
              </div>
              <div className="text-right mt-2 text-gray-400" style={{ fontSize: fs(14) }}>
                Kliknij lub SPACJA ▶
              </div>
            </div>
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
                <div className="mt-3 text-red-500 font-bold animate-bounce" style={{ fontSize: fs(20) }}>
                  Spróbuj jeszcze raz! 💪
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
                style={{ fontSize: fs(48), textShadow: '3px 3px 6px rgba(0,0,0,0.8)' }}
              >
                BRAWO KUBA!
              </div>
              <div
                className="text-yellow-300"
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
                SUPER KUBA!
              </div>
              <div className="text-white mb-2" style={{ fontSize: fs(24) }}>
                Wszystkie 19 misji ukończone!
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

        {/* HUD buttons (playing phase) */}
        {phase === 'playing' && (
          <div className="absolute top-2 right-2 flex gap-1" style={{ top: 54 * scale }}>
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
              {musicStyleState === 'chill' ? '🎵' : musicStyleState === 'classical' ? '🎻' : '🔇'}
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
      </div>
    </div>
  );
}
