import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  SCENARIOS,
  LAYERS,
  TRENDS,
  type FluxTrend,
  type FluxLayer,
  type FluxScenario,
} from "./fluxData";
import FluxDetailPanel from "./FluxDetailPanel";

// ============================================================
// SVG Radial Diagram — interactive FLUX model
// ============================================================

const LAYER_ORDER: FluxLayer[] = ["NOW", "NEW", "NEXT", "BEYOND"];
const CX = 500;
const CY = 500;
const MAX_R = 460;

// pulse keyframes injected once
const PULSE_CSS = `
@keyframes flux-pulse {
  0%, 100% { r: var(--base-r); opacity: 0.85; }
  50% { r: calc(var(--base-r) + 3px); opacity: 1; }
}
@keyframes flux-ring-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes flux-fade-in {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes flux-glow {
  0%, 100% { filter: drop-shadow(0 0 4px var(--glow-color)); }
  50% { filter: drop-shadow(0 0 12px var(--glow-color)); }
}
`;

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}


function sectorPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number
) {
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

// ============================================================
// Main component
// ============================================================
export default function FluxDiagram() {
  const [selectedTrend, setSelectedTrend] = useState<FluxTrend | null>(null);
  const [hoveredTrend, setHoveredTrend] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<FluxLayer | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scenarioCount = SCENARIOS.length;
  const sectorAngle = 360 / scenarioCount;

  // compute positions for each trend dot
  const trendPositions = useMemo(() => {
    const map = new Map<
      string,
      { x: number; y: number; scenario: FluxScenario }
    >();

    SCENARIOS.forEach((sc, si) => {
      const startAngle = si * sectorAngle;
      const scenarioTrends = TRENDS.filter((t) => t.scenario === sc.id);

      // group by layer
      const byLayer: Record<string, FluxTrend[]> = {};
      scenarioTrends.forEach((t) => {
        if (!byLayer[t.layer]) byLayer[t.layer] = [];
        byLayer[t.layer].push(t);
      });

      Object.entries(byLayer).forEach(([layer, trends]) => {
        const layerInfo = LAYERS[layer as FluxLayer];
        const r = layerInfo.radius * MAX_R;
        trends.forEach((t, ti) => {
          const angleSpread = sectorAngle - 8; // padding
          const angleStep = angleSpread / (trends.length + 1);
          const angle = startAngle + 4 + angleStep * (ti + 1);
          const pos = polarToCartesian(CX, CY, r, angle);
          map.set(t.id, { ...pos, scenario: sc });
        });
      });
    });
    return map;
  }, [sectorAngle]);

  const filteredTrends = useMemo(() => {
    return TRENDS.filter((t) => {
      if (activeScenario && t.scenario !== activeScenario) return false;
      if (activeLayer && t.layer !== activeLayer) return false;
      return true;
    });
  }, [activeScenario, activeLayer]);

  const handleTrendClick = useCallback((trend: FluxTrend) => {
    setSelectedTrend((prev) => (prev?.id === trend.id ? null : trend));
  }, []);

  const isFiltered = (trend: FluxTrend) => {
    return filteredTrends.some((t) => t.id === trend.id);
  };

  return (
    <>
      <style>{PULSE_CSS}</style>
      <div className="flex flex-col xl:flex-row gap-6 w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-4 md:p-8">
        {/* LEFT — Filters + Legend */}
        <aside className="xl:w-72 shrink-0 space-y-6">
          {/* SCENARIO filters */}
          <div
            className="backdrop-blur-xl bg-white/5 rounded-2xl p-5 border border-white/10"
            style={{
              animation: mounted ? "flux-fade-in 0.5s ease-out" : "none",
            }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
              Scenariusze
            </h3>
            <button
              onClick={() => setActiveScenario(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-all duration-300 ${
                activeScenario === null
                  ? "bg-white/15 text-white font-semibold"
                  : "text-white/60 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              Wszystkie
            </button>
            {SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() =>
                  setActiveScenario((p) => (p === sc.id ? null : sc.id))
                }
                className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 flex items-center gap-2 transition-all duration-300 ${
                  activeScenario === sc.id
                    ? "bg-white/15 text-white font-semibold shadow-lg"
                    : "text-white/60 hover:bg-white/5 hover:text-white/80"
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0 transition-transform duration-300"
                  style={{
                    backgroundColor: sc.color,
                    transform:
                      activeScenario === sc.id ? "scale(1.3)" : "scale(1)",
                    boxShadow:
                      activeScenario === sc.id
                        ? `0 0 8px ${sc.color}`
                        : "none",
                  }}
                />
                <span className="text-base mr-1">{sc.icon}</span>
                {sc.name}
              </button>
            ))}
          </div>

          {/* LAYER filters */}
          <div
            className="backdrop-blur-xl bg-white/5 rounded-2xl p-5 border border-white/10"
            style={{
              animation: mounted ? "flux-fade-in 0.6s ease-out" : "none",
            }}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
              Horyzont czasowy
            </h3>
            <button
              onClick={() => setActiveLayer(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-all duration-300 ${
                activeLayer === null
                  ? "bg-white/15 text-white font-semibold"
                  : "text-white/60 hover:bg-white/5"
              }`}
            >
              Wszystkie
            </button>
            {LAYER_ORDER.map((l) => (
              <button
                key={l}
                onClick={() =>
                  setActiveLayer((p) => (p === l ? null : l))
                }
                className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 transition-all duration-300 ${
                  activeLayer === l
                    ? "bg-white/15 text-white font-semibold"
                    : "text-white/60 hover:bg-white/5"
                }`}
              >
                <span className="font-mono font-bold mr-2">{l}</span>
                <span className="text-xs text-white/40">
                  {LAYERS[l].description.split("—")[0]}
                </span>
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
            <p className="text-4xl font-black text-white/90">
              {filteredTrends.length}
            </p>
            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
              {filteredTrends.length === TRENDS.length
                ? "trendów w modelu"
                : "trendów po filtrze"}
            </p>
          </div>
        </aside>

        {/* CENTER — SVG Diagram */}
        <main className="flex-1 flex flex-col items-center justify-center min-w-0">
          <h1
            className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-2 text-center"
            style={{
              animation: mounted ? "flux-fade-in 0.4s ease-out" : "none",
            }}
          >
            Model FLUX
          </h1>
          <p className="text-white/40 text-sm mb-6 text-center max-w-lg">
            Interaktywny model FLUX — scenariusze przyszłości i trendy. Kliknij w trend, aby zobaczyć przykłady z realnych branż.
          </p>

          <div
            className="w-full max-w-[800px] aspect-square relative"
            style={{
              animation: mounted ? "flux-fade-in 0.7s ease-out" : "none",
            }}
          >
            <svg
              ref={svgRef}
              viewBox="0 0 1000 1000"
              className="w-full h-full"
            >
              <defs>
                {SCENARIOS.map((sc) => (
                  <radialGradient
                    key={`grad-${sc.id}`}
                    id={`grad-${sc.id}`}
                    cx="50%"
                    cy="50%"
                    r="50%"
                  >
                    <stop
                      offset="0%"
                      stopColor={sc.color}
                      stopOpacity="0.15"
                    />
                    <stop
                      offset="100%"
                      stopColor={sc.color}
                      stopOpacity="0.03"
                    />
                  </radialGradient>
                ))}
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Background ring guides */}
              {LAYER_ORDER.map((l) => (
                <circle
                  key={`ring-${l}`}
                  cx={CX}
                  cy={CY}
                  r={LAYERS[l].radius * MAX_R}
                  fill="none"
                  stroke="white"
                  strokeOpacity={activeLayer === l ? 0.2 : 0.06}
                  strokeWidth={activeLayer === l ? 2 : 1}
                  strokeDasharray={l === "BEYOND" ? "4 4" : undefined}
                  className="transition-all duration-500"
                />
              ))}

              {/* Layer labels */}
              {LAYER_ORDER.map((l) => {
                const r = LAYERS[l].radius * MAX_R;
                return (
                  <text
                    key={`label-${l}`}
                    x={CX + 8}
                    y={CY - r + 14}
                    fill="white"
                    fillOpacity={activeLayer === l ? 0.6 : 0.2}
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="transition-all duration-300 select-none pointer-events-none"
                  >
                    {l}
                  </text>
                );
              })}

              {/* Sector fills */}
              {SCENARIOS.map((sc, si) => {
                const startA = si * sectorAngle;
                const endA = startA + sectorAngle;
                const dimmed =
                  activeScenario !== null && activeScenario !== sc.id;
                return (
                  <path
                    key={`sector-${sc.id}`}
                    d={sectorPath(CX, CY, 40, MAX_R, startA, endA)}
                    fill={`url(#grad-${sc.id})`}
                    opacity={dimmed ? 0.15 : 1}
                    className="transition-opacity duration-500"
                  />
                );
              })}

              {/* Sector divider lines */}
              {SCENARIOS.map((_, si) => {
                const angle = si * sectorAngle;
                const inner = polarToCartesian(CX, CY, 40, angle);
                const outer = polarToCartesian(CX, CY, MAX_R, angle);
                return (
                  <line
                    key={`div-${si}`}
                    x1={inner.x}
                    y1={inner.y}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="white"
                    strokeOpacity="0.08"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Scenario labels on arc */}
              {SCENARIOS.map((sc, si) => {
                const midAngle = si * sectorAngle + sectorAngle / 2;
                const labelR = MAX_R + 5;
                const pos = polarToCartesian(CX, CY, labelR, midAngle);
                const dimmed =
                  activeScenario !== null && activeScenario !== sc.id;

                // flip text if on bottom half
                const rotateAngle = midAngle;
                const flip = rotateAngle > 90 && rotateAngle < 270;
                const textRotation = flip
                  ? rotateAngle + 180
                  : rotateAngle;

                return (
                  <g key={`sclabel-${sc.id}`} opacity={dimmed ? 0.2 : 0.7}
                    className="transition-opacity duration-500">
                    <text
                      x={pos.x}
                      y={pos.y}
                      fill={sc.color}
                      fontSize="10"
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textRotation}, ${pos.x}, ${pos.y})`}
                      className="select-none pointer-events-none uppercase tracking-wider"
                    >
                      {sc.icon} {sc.name}
                    </text>
                  </g>
                );
              })}

              {/* Trend dots */}
              {TRENDS.map((trend) => {
                const pos = trendPositions.get(trend.id);
                if (!pos) return null;
                const sc = pos.scenario;
                const visible = isFiltered(trend);
                const hovered = hoveredTrend === trend.id;
                const selected = selectedTrend?.id === trend.id;
                const dotR = selected ? 10 : hovered ? 8 : 6;

                return (
                  <g
                    key={trend.id}
                    className="cursor-pointer"
                    opacity={visible ? 1 : 0.08}
                    style={{
                      transition: "opacity 0.4s ease",
                    }}
                    onClick={() => handleTrendClick(trend)}
                    onMouseEnter={() => setHoveredTrend(trend.id)}
                    onMouseLeave={() => setHoveredTrend(null)}
                  >
                    {/* Outer glow */}
                    {(hovered || selected) && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={dotR + 6}
                        fill={sc.color}
                        opacity={0.15}
                        className="pointer-events-none"
                      />
                    )}
                    {/* Dot */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={dotR}
                      fill={sc.color}
                      stroke={selected ? "#fff" : "transparent"}
                      strokeWidth={selected ? 2 : 0}
                      filter={selected ? "url(#glow)" : undefined}
                      style={{
                        transition: "r 0.3s ease, stroke 0.3s ease",
                      }}
                    />
                    {/* Tooltip on hover */}
                    {hovered && !selected && (
                      <g className="pointer-events-none">
                        <rect
                          x={pos.x - 70}
                          y={pos.y - 32}
                          width="140"
                          height="22"
                          rx="6"
                          fill="rgba(0,0,0,0.85)"
                          stroke={sc.color}
                          strokeWidth="1"
                        />
                        <text
                          x={pos.x}
                          y={pos.y - 18}
                          fill="white"
                          fontSize="9"
                          fontWeight="600"
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {trend.name}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Center */}
              <circle
                cx={CX}
                cy={CY}
                r="38"
                fill="url(#center-grad)"
                stroke="white"
                strokeOpacity="0.1"
                strokeWidth="1"
              />
              <defs>
                <radialGradient id="center-grad">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.9" />
                </radialGradient>
              </defs>
              <text
                x={CX}
                y={CY - 6}
                fill="white"
                fontSize="16"
                fontWeight="900"
                textAnchor="middle"
                dominantBaseline="middle"
                className="select-none pointer-events-none"
              >
                FLUX
              </text>
              <text
                x={CX}
                y={CY + 12}
                fill="white"
                fillOpacity="0.4"
                fontSize="8"
                textAnchor="middle"
                dominantBaseline="middle"
                className="select-none pointer-events-none"
              >
                scenariusze przyszłości
              </text>
            </svg>
          </div>
        </main>

        {/* RIGHT — Detail panel */}
        <aside className="xl:w-96 shrink-0">
          {selectedTrend ? (
            <FluxDetailPanel
              trend={selectedTrend}
              scenario={SCENARIOS.find(
                (s) => s.id === selectedTrend.scenario
              )!}
              onClose={() => setSelectedTrend(null)}
            />
          ) : (
            <div
              className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 text-center"
              style={{
                animation: mounted
                  ? "flux-fade-in 0.8s ease-out"
                  : "none",
              }}
            >
              <div className="text-5xl mb-4 opacity-30">🔍</div>
              <h3 className="text-white/60 text-lg font-semibold mb-2">
                Wybierz trend
              </h3>
              <p className="text-white/30 text-sm leading-relaxed">
                Kliknij dowolny punkt na diagramie, aby zobaczyć opis trendu
                i przykłady zastosowań z realnych branż.
              </p>
              <div className="mt-6 space-y-3">
                {LAYER_ORDER.map((l) => (
                  <div
                    key={l}
                    className="flex items-center gap-3 text-left"
                  >
                    <span className="text-xs font-mono font-bold text-white/30 w-14">
                      {l}
                    </span>
                    <span className="text-xs text-white/20">
                      {LAYERS[l].description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
