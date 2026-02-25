// ============================================================
// MODEL FLUX — dane interaktywnego diagramu
// Bazowane na modelu infuture.institute (Natalia Hatalska)
// ============================================================

export interface FluxTrend {
  id: string;
  name: string;
  description: string;
  examples: FluxExample[];
  layer: FluxLayer;
  scenario: string; // ID scenariusza
}

export interface FluxExample {
  industry: string;
  title: string;
  description: string;
  source?: string;
}

export type FluxLayer = "NOW" | "NEW" | "NEXT" | "BEYOND";

export interface FluxScenario {
  id: string;
  name: string;
  color: string;
  colorLight: string;
  icon: string;
  description: string;
}

// ============================================================
// SCENARIUSZE (osie diagramu)
// ============================================================
export const SCENARIOS: FluxScenario[] = [
  {
    id: "ai",
    name: "Świat AI",
    color: "#6366f1",
    colorLight: "#a5b4fc",
    icon: "🤖",
    description:
      "Sztuczna inteligencja przenika każdy aspekt życia — od pracy, przez edukację, po relacje.",
  },
  {
    id: "social",
    name: "Świat Przeobrażeń Społecznych",
    color: "#f59e0b",
    colorLight: "#fcd34d",
    icon: "👥",
    description:
      "Zmiany demograficzne, nierówności, nowe modele rodziny i wspólnoty redefiniują tkankę społeczną.",
  },
  {
    id: "sustainability",
    name: "Zrównoważony Świat",
    color: "#10b981",
    colorLight: "#6ee7b7",
    icon: "🌱",
    description:
      "Klimat, zasoby, bioróżnorodność — presja na zrównoważony rozwój rośnie wykładniczo.",
  },
  {
    id: "health",
    name: "Świat Kryzysów Zdrowotnych",
    color: "#ef4444",
    colorLight: "#fca5a5",
    icon: "🏥",
    description:
      "Pandemia zmieniła podejście do zdrowia. Longevity, zdrowie psychiczne, biohacking.",
  },
  {
    id: "mirror",
    name: "Świat Lustrzany",
    color: "#8b5cf6",
    colorLight: "#c4b5fd",
    icon: "🪞",
    description:
      "Cyfrowe bliźniaki, metaverse, wirtualne tożsamości — granica online/offline się zaciera.",
  },
  {
    id: "conflict",
    name: "Świat Wojen i Konfliktów",
    color: "#64748b",
    colorLight: "#cbd5e1",
    icon: "⚔️",
    description:
      "Geopolityka, cyberwojny, dezinformacja, nowe formy konfliktu redefiniują bezpieczeństwo.",
  },
];

// ============================================================
// WARSTWY CZASOWE
// ============================================================
export const LAYERS: Record<FluxLayer, { label: string; radius: number; description: string }> = {
  NOW: {
    label: "NOW",
    radius: 0.25,
    description: "Trendy obecne — już wpływają na biznes i społeczeństwo",
  },
  NEW: {
    label: "NEW",
    radius: 0.45,
    description: "Trendy wschodzące — nabierają tempa, wymagają uwagi",
  },
  NEXT: {
    label: "NEXT",
    radius: 0.7,
    description: "Trendy przyszłościowe — 3-7 lat do mainstreamu",
  },
  BEYOND: {
    label: "BEYOND",
    radius: 0.95,
    description: "Trendy odległe — 10+ lat, ale kształtują się już teraz",
  },
};

// ============================================================
// TRENDY — z przykładami branżowymi
// ============================================================
export const TRENDS: FluxTrend[] = [
  // ==================== ŚWIAT AI ====================
  {
    id: "ai-coworker",
    name: "AI jako współpracownik",
    description:
      "AI przestaje być narzędziem, staje się członkiem zespołu — podejmuje decyzje, sugeruje strategie, tworzy content.",
    layer: "NOW",
    scenario: "ai",
    examples: [
      {
        industry: "FMCG",
        title: "Asystent trade-marketingowy",
        description:
          "AI analizuje dane sprzedażowe i rekomenduje rozmieszczenie produktów na półce w real-time.",
      },
      {
        industry: "Bankowość",
        title: "AI Credit Analyst",
        description:
          "Modele scoringowe oparte na ML zastępują tradycyjne modele oceny kredytowej.",
      },
      {
        industry: "Pharma",
        title: "AI Drug Discovery",
        description:
          "Systemy AI skracają proces odkrywania leków z 10 lat do 2-3 lat.",
      },
    ],
  },
  {
    id: "ai-personalization",
    name: "Hiperpersonalizacja AI",
    description:
      "Każde doświadczenie — od reklamy po edukację — dostosowane do jednostki w czasie rzeczywistym.",
    layer: "NOW",
    scenario: "ai",
    examples: [
      {
        industry: "Retail",
        title: "Dynamic pricing per user",
        description: "Ceny produktów dostosowane do profilu klienta, historii zakupów i kontekstu.",
      },
      {
        industry: "Edukacja",
        title: "Adaptive learning paths",
        description:
          "Platforma edukacyjna dostosowuje tempo, styl i materiały do każdego ucznia osobno.",
      },
    ],
  },
  {
    id: "ai-autonomy",
    name: "Autonomiczne systemy AI",
    description:
      "AI podejmuje decyzje bez nadzoru ludzkiego — od pojazdów autonomicznych po zarządzanie infrastrukturą.",
    layer: "NEW",
    scenario: "ai",
    examples: [
      {
        industry: "Logistyka",
        title: "Autonomiczne magazyny",
        description:
          "Roboty zarządzają pełnym procesem magazynowym bez interwencji ludzkiej.",
      },
      {
        industry: "Energetyka",
        title: "Smart grid management",
        description: "AI automatycznie balansuje sieć energetyczną i przewiduje awarie.",
      },
    ],
  },
  {
    id: "ai-creativity",
    name: "Generatywna kreacja",
    description:
      "AI tworzy muzykę, filmy, architekturę, design — kto jest autorem?",
    layer: "NEW",
    scenario: "ai",
    examples: [
      {
        industry: "Marketing",
        title: "AI-generated campaigns",
        description:
          "Kampanie reklamowe tworzone w 100% przez AI — od copy po visual.",
      },
      {
        industry: "Architektura",
        title: "Generative design",
        description: "AI proponuje optymalne rozwiązania architektoniczne na podstawie parametrów.",
      },
    ],
  },
  {
    id: "agi",
    name: "Droga do AGI",
    description:
      "Sztuczna inteligencja ogólna — systemy dorównujące ludzkiej elastyczności poznawczej.",
    layer: "BEYOND",
    scenario: "ai",
    examples: [
      {
        industry: "Nauka",
        title: "Autonomiczny naukowiec",
        description: "AI formułuje hipotezy, projektuje eksperymenty i analizuje wyniki samodzielnie.",
      },
    ],
  },
  {
    id: "ai-governance",
    name: "Regulacje AI",
    description:
      "EU AI Act, transparentność algorytmów, odpowiedzialność za decyzje AI.",
    layer: "NEXT",
    scenario: "ai",
    examples: [
      {
        industry: "Finanse",
        title: "Explainable AI w bankach",
        description: "Banki muszą wyjaśniać decyzje kredytowe podjęte przez AI.",
      },
      {
        industry: "HR",
        title: "Audyt bias w rekrutacji",
        description: "Obowiązkowe audyty algorytmów rekrutacyjnych pod kątem dyskryminacji.",
      },
    ],
  },

  // ==================== ŚWIAT PRZEOBRAŻEŃ SPOŁECZNYCH ====================
  {
    id: "loneliness",
    name: "Epidemia samotności",
    description:
      "Samotność jako problem zdrowia publicznego — wpływa na produktywność, zdrowie, konsumpcję.",
    layer: "NOW",
    scenario: "social",
    examples: [
      {
        industry: "Ubezpieczenia",
        title: "Loneliness risk scoring",
        description: "Ubezpieczyciele uwzględniają izolację społeczną w modelach ryzyka zdrowotnego.",
      },
      {
        industry: "Real Estate",
        title: "Co-living spaces",
        description: "Nowe modele mieszkaniowe zaprojektowane wokół budowania społeczności.",
      },
    ],
  },
  {
    id: "silver-economy",
    name: "Silver Economy",
    description:
      "Starzejące się społeczeństwa = nowy ogromny segment rynku. 50+ to nie niche.",
    layer: "NOW",
    scenario: "social",
    examples: [
      {
        industry: "Finanse",
        title: "Retirement-as-a-Service",
        description: "Nowe produkty finansowe dla ludzi żyjących 90+ lat.",
      },
      {
        industry: "Tech",
        title: "Senior-friendly UX",
        description: "Redesign interfejsów pod użytkowników 60+ (większe fonty to za mało).",
      },
    ],
  },
  {
    id: "gen-z-workforce",
    name: "Gen Z w pracy",
    description:
      "Pokolenie Z redefiniuje kulturę pracy — elastyczność, sens, wellbeing > pensja.",
    layer: "NOW",
    scenario: "social",
    examples: [
      {
        industry: "HR",
        title: "4-day work week",
        description: "Firmy testują 4-dniowy tydzień pracy jako narzędzie retencji Gen Z.",
      },
      {
        industry: "Employer Branding",
        title: "Purpose-driven employer",
        description: "Gen Z wybiera pracodawców po wartościach, nie po benefitach.",
      },
    ],
  },
  {
    id: "trust-deficit",
    name: "Kryzys zaufania",
    description: "Spadek zaufania do instytucji, mediów, marek. Weryfikacja staje się kluczowa.",
    layer: "NEW",
    scenario: "social",
    examples: [
      {
        industry: "Media",
        title: "Weryfikacja AI-generated content",
        description: "Narzędzia do rozpoznawania treści wygenerowanych przez AI stają się standardem.",
      },
      {
        industry: "FMCG",
        title: "Radical transparency",
        description: "Marki udostępniają pełen łańcuch dostaw w blockchain.",
      },
    ],
  },
  {
    id: "post-work",
    name: "Post-work society",
    description:
      "Gdy AI zastąpi 40% zadań — czym będziemy się zajmować? UBI, nowe modele społeczne.",
    layer: "BEYOND",
    scenario: "social",
    examples: [
      {
        industry: "Rządy",
        title: "Universal Basic Income",
        description: "Pilotaże UBI w odpowiedzi na automatyzację pracy.",
      },
    ],
  },

  // ==================== ZRÓWNOWAŻONY ŚWIAT ====================
  {
    id: "circular-economy",
    name: "Gospodarka cyrkularna",
    description:
      "Od linearnego produce-use-dispose do zamkniętych obiegów materiałów.",
    layer: "NOW",
    scenario: "sustainability",
    examples: [
      {
        industry: "Fashion",
        title: "Resale & rental",
        description: "Platformy wynajmu i odsprzedaży ubrań rosną 25x szybciej niż fast fashion.",
      },
      {
        industry: "Elektronika",
        title: "Right to repair",
        description: "Legislacja wymuszająca naprawialność urządzeń elektronicznych.",
      },
    ],
  },
  {
    id: "green-finance",
    name: "Zielone finanse",
    description: "ESG, green bonds, carbon credits — pieniądze płyną w kierunku sustainability.",
    layer: "NOW",
    scenario: "sustainability",
    examples: [
      {
        industry: "Bankowość",
        title: "ESG-linked loans",
        description: "Oprocentowanie kredytu zależy od spełnienia celów ESG.",
      },
      {
        industry: "Ubezpieczenia",
        title: "Climate risk pricing",
        description: "Modele wyceny ryzyka uwzględniające zmiany klimatyczne.",
      },
    ],
  },
  {
    id: "regenerative",
    name: "Regenerative economy",
    description:
      "Nie wystarczy 'nie szkodzić' — trzeba aktywnie odtwarzać ekosystemy.",
    layer: "NEXT",
    scenario: "sustainability",
    examples: [
      {
        industry: "Rolnictwo",
        title: "Regenerative farming",
        description: "Uprawa odbudowująca glebę zamiast ją wyczerpywać.",
      },
      {
        industry: "Budownictwo",
        title: "Carbon-negative buildings",
        description: "Budynki pochłaniające więcej CO2 niż emitują.",
      },
    ],
  },
  {
    id: "degrowth",
    name: "Post-growth / Degrowth",
    description:
      "Czy ciągły wzrost jest możliwy? Nowe modele ekonomiczne odchodzą od PKB.",
    layer: "BEYOND",
    scenario: "sustainability",
    examples: [
      {
        industry: "Rządy",
        title: "Wellbeing Economy",
        description: "Nowa Zelandia, Islandia mierzą dobrostan zamiast PKB.",
      },
    ],
  },

  // ==================== ŚWIAT KRYZYSÓW ZDROWOTNYCH ====================
  {
    id: "mental-health",
    name: "Kryzys zdrowia psychicznego",
    description:
      "Lęk, depresja, wypalenie — pandemia zdrowia psychicznego dotyka wszystkie grupy wiekowe.",
    layer: "NOW",
    scenario: "health",
    examples: [
      {
        industry: "HR",
        title: "Mental health benefits",
        description: "Firmy oferują terapię online jako standard pakietu benefitów.",
      },
      {
        industry: "Tech",
        title: "Digital wellbeing tools",
        description: "Aplikacje do mindfulness i zarządzania stresem jako mainstream.",
      },
    ],
  },
  {
    id: "longevity",
    name: "Longevity revolution",
    description:
      "Nauka o przedłużaniu życia — od suplementów po inżynierię genetyczną.",
    layer: "NEW",
    scenario: "health",
    examples: [
      {
        industry: "Pharma",
        title: "Anti-aging therapeutics",
        description: "Leki spowalniające starzenie na poziomie komórkowym wchodzą do badań klinicznych.",
      },
      {
        industry: "Ubezpieczenia",
        title: "100-year life products",
        description: "Produkty finansowe projektowane dla ludzi żyjących 100+ lat.",
      },
    ],
  },
  {
    id: "biohacking",
    name: "Biohacking & self-optimization",
    description: "Ludzie hackują własną biologię — sen, dieta, suplementy, implanty.",
    layer: "NEW",
    scenario: "health",
    examples: [
      {
        industry: "Wellness",
        title: "Quantified self",
        description: "Wearables śledzą każdy parametr ciała — HRV, glukozę, kortyzol.",
      },
      {
        industry: "Żywność",
        title: "Personalized nutrition",
        description: "Diety oparte na DNA i mikrobiomie zamiast ogólnych zaleceń.",
      },
    ],
  },
  {
    id: "pandemic-preparedness",
    name: "Pandemic preparedness",
    description: "Systemy wczesnego ostrzegania, szybkie szczepionki, global health security.",
    layer: "NEXT",
    scenario: "health",
    examples: [
      {
        industry: "Pharma",
        title: "100-day vaccine",
        description: "Cel: opracowanie szczepionki na nowy patogen w 100 dni.",
      },
    ],
  },

  // ==================== ŚWIAT LUSTRZANY ====================
  {
    id: "digital-twins",
    name: "Cyfrowe bliźniaki",
    description:
      "Wirtualne kopie miast, fabryk, ciał — testowanie scenariuszy bez ryzyka.",
    layer: "NOW",
    scenario: "mirror",
    examples: [
      {
        industry: "Produkcja",
        title: "Factory digital twin",
        description: "Wirtualna kopia fabryki pozwala optymalizować procesy przed zmianą fizyczną.",
      },
      {
        industry: "Urbanistyka",
        title: "City digital twin",
        description: "Singapur ma cyfrowego bliźniaka miasta do planowania infrastruktury.",
      },
    ],
  },
  {
    id: "spatial-computing",
    name: "Spatial computing",
    description:
      "AR/VR/MR przenika do codzienności — Apple Vision Pro otwiera nową erę.",
    layer: "NEW",
    scenario: "mirror",
    examples: [
      {
        industry: "Retail",
        title: "Virtual try-on",
        description: "Przymierzanie ubrań, mebli, makijażu w AR przed zakupem.",
      },
      {
        industry: "Szkolenia",
        title: "VR safety training",
        description: "Szkolenia BHP w VR — bezpieczne ćwiczenie niebezpiecznych sytuacji.",
      },
    ],
  },
  {
    id: "synthetic-media",
    name: "Synthetic media",
    description:
      "Deepfake, AI-generated voices, virtual influencers — co jest prawdziwe?",
    layer: "NEW",
    scenario: "mirror",
    examples: [
      {
        industry: "Marketing",
        title: "Virtual influencers",
        description: "AI-generowane postacie z milionami followersów i umowami sponsorskimi.",
      },
      {
        industry: "Media",
        title: "AI news anchors",
        description: "Wirtualni prezenterzy wiadomości nadają 24/7 bez przerw.",
      },
    ],
  },
  {
    id: "brain-computer",
    name: "Brain-Computer Interface",
    description: "Neuralink i podobne — bezpośrednie połączenie mózg-komputer.",
    layer: "BEYOND",
    scenario: "mirror",
    examples: [
      {
        industry: "Medycyna",
        title: "Neural prosthetics",
        description: "Protezy sterowane myślą przywracają sprawność osobom po urazach.",
      },
    ],
  },

  // ==================== ŚWIAT WOJEN I KONFLIKTÓW ====================
  {
    id: "cyber-warfare",
    name: "Cyberwojny",
    description:
      "Ataki na infrastrukturę krytyczną, ransomware, state-sponsored hacking.",
    layer: "NOW",
    scenario: "conflict",
    examples: [
      {
        industry: "Energetyka",
        title: "Grid cyberattacks",
        description: "Ataki na sieci energetyczne jako narzędzie geopolitycznej presji.",
      },
      {
        industry: "Finanse",
        title: "Banking cyber resilience",
        description: "Banki budują odporność na skoordynowane ataki cybernetyczne.",
      },
    ],
  },
  {
    id: "disinformation",
    name: "Dezinformacja jako broń",
    description: "Fake news, deepfakes, manipulacja opinii publicznej na skalę przemysłową.",
    layer: "NOW",
    scenario: "conflict",
    examples: [
      {
        industry: "Media",
        title: "AI fact-checking",
        description: "Automatyczne systemy weryfikacji treści w mediach społecznościowych.",
      },
      {
        industry: "Rządy",
        title: "Digital literacy programs",
        description: "Programy edukacyjne budujące odporność na dezinformację.",
      },
    ],
  },
  {
    id: "supply-chain-fragility",
    name: "Kruchość łańcuchów dostaw",
    description: "Globalne łańcuchy dostaw okazują się kruche — reshoring, nearshoring, friendshoring.",
    layer: "NOW",
    scenario: "conflict",
    examples: [
      {
        industry: "Automotive",
        title: "Chip reshoring",
        description: "Przenoszenie produkcji chipów bliżej rynków zbytu po kryzysie 2021.",
      },
      {
        industry: "FMCG",
        title: "Dual sourcing",
        description: "Dywersyfikacja dostawców jako strategia odporności.",
      },
    ],
  },
  {
    id: "autonomous-weapons",
    name: "Autonomiczna broń",
    description: "Drony bojowe, systemy decyzyjne bez człowieka — etyka i regulacje.",
    layer: "NEXT",
    scenario: "conflict",
    examples: [
      {
        industry: "Obronność",
        title: "AI-powered defense",
        description: "Systemy obronne podejmujące decyzje w milisekundach bez operatora.",
      },
    ],
  },
  {
    id: "space-conflict",
    name: "Militaryzacja kosmosu",
    description: "Satelity jako cele, ASAT weapons, dominacja orbitalna.",
    layer: "BEYOND",
    scenario: "conflict",
    examples: [
      {
        industry: "Telco",
        title: "Satellite resilience",
        description: "Budowa odpornych konstelacji satelitarnych na wypadek konfliktu.",
      },
    ],
  },
];

// ============================================================
// HELPER: pobranie trendów per scenariusz/warstwa
// ============================================================
export function getTrendsByScenario(scenarioId: string): FluxTrend[] {
  return TRENDS.filter((t) => t.scenario === scenarioId);
}

export function getTrendsByLayer(layer: FluxLayer): FluxTrend[] {
  return TRENDS.filter((t) => t.layer === layer);
}

export function getTrend(id: string): FluxTrend | undefined {
  return TRENDS.find((t) => t.id === id);
}
