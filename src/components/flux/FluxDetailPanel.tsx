import { type FluxTrend, type FluxScenario, LAYERS } from "./fluxData";

interface Props {
  trend: FluxTrend;
  scenario: FluxScenario;
  onClose: () => void;
}

const LAYER_BADGES: Record<string, string> = {
  NOW: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  NEW: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  NEXT: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  BEYOND: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const INDUSTRY_ICONS: Record<string, string> = {
  FMCG: "🛒",
  Bankowość: "🏦",
  Pharma: "💊",
  Retail: "🏬",
  Edukacja: "🎓",
  Logistyka: "📦",
  Energetyka: "⚡",
  Marketing: "📣",
  Architektura: "🏗️",
  Nauka: "🔬",
  Finanse: "💰",
  HR: "👔",
  Media: "📺",
  Tech: "💻",
  Ubezpieczenia: "🛡️",
  "Real Estate": "🏠",
  "Employer Branding": "🎯",
  Rządy: "🏛️",
  Fashion: "👗",
  Elektronika: "📱",
  Rolnictwo: "🌾",
  Budownictwo: "🏗️",
  Wellness: "🧘",
  Żywność: "🍽️",
  Produkcja: "🏭",
  Urbanistyka: "🌆",
  Szkolenia: "📚",
  Obronność: "🎖️",
  Telco: "📡",
  Automotive: "🚗",
  Medycyna: "🏥",
};

export default function FluxDetailPanel({ trend, scenario, onClose }: Props) {
  const layerInfo = LAYERS[trend.layer];

  return (
    <div
      className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden"
      style={{ animation: "flux-fade-in 0.3s ease-out" }}
    >
      {/* Header */}
      <div
        className="p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${scenario.color}22, ${scenario.color}08)`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200"
        >
          ✕
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: scenario.color,
              boxShadow: `0 0 8px ${scenario.color}`,
            }}
          />
          <span className="text-xs text-white/40 uppercase tracking-widest font-semibold">
            {scenario.icon} {scenario.name}
          </span>
        </div>

        <h2 className="text-xl font-black text-white mb-2">{trend.name}</h2>

        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${LAYER_BADGES[trend.layer]}`}
        >
          {trend.layer} — {layerInfo.description.split("—")[0].trim()}
        </span>
      </div>

      {/* Description */}
      <div className="px-6 py-4 border-b border-white/5">
        <p className="text-white/70 text-sm leading-relaxed">
          {trend.description}
        </p>
      </div>

      {/* Industry Examples */}
      <div className="px-6 py-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">
          Przykłady z branż
        </h3>
        <div className="space-y-4">
          {trend.examples.map((ex, i) => (
            <div
              key={i}
              className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all duration-300 hover:bg-white/[0.07]"
              style={{
                animation: `flux-fade-in ${0.3 + i * 0.1}s ease-out`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {INDUSTRY_ICONS[ex.industry] || "🏢"}
                </span>
                <span
                  className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  style={{
                    color: scenario.color,
                    backgroundColor: `${scenario.color}15`,
                  }}
                >
                  {ex.industry}
                </span>
              </div>
              <h4 className="text-white/90 font-semibold text-sm mb-1">
                {ex.title}
              </h4>
              <p className="text-white/50 text-xs leading-relaxed">
                {ex.description}
              </p>
              {ex.source && (
                <p className="text-white/20 text-[10px] mt-2 italic">
                  Źródło: {ex.source}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Learning prompt */}
      <div className="px-6 pb-6">
        <div
          className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-4 border border-indigo-500/10"
        >
          <h4 className="text-xs font-bold text-indigo-300/80 uppercase tracking-wider mb-2">
            💡 Do refleksji
          </h4>
          <p className="text-white/50 text-xs leading-relaxed italic">
            Jak trend „{trend.name}" może wpłynąć na Twoją branżę w
            perspektywie {trend.layer === "NOW" ? "najbliższych miesięcy" : trend.layer === "NEW" ? "1-3 lat" : trend.layer === "NEXT" ? "3-7 lat" : "dekady"}?
            Jakie szanse i zagrożenia widzisz?
          </p>
        </div>
      </div>
    </div>
  );
}
