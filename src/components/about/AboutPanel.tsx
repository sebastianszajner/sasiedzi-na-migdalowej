import './about-panel.css';

const DRIVES = [
  { icon: '🏆', label: 'Uznanie & Status', bar: 100, color: '#e91e63', desc: 'Potrzebuję wiedzieć, że moja praca ma znaczenie i jest dostrzegana. Status nie jest celem samym w sobie — to informacja zwrotna, że idę we właściwym kierunku.' },
  { icon: '💡', label: 'Idealizm & Misja', bar: 100, color: '#9c27b0', desc: 'Działam z poczuciem sensu. Muszę wierzyć, że to co robię zmienia coś na lepsze — u ludzi, w organizacji, w świecie.' },
  { icon: '⚡', label: 'Władza & Wpływ', bar: 90, color: '#ff9800', desc: 'Naturalnie przejmuję inicjatywę. Nie po to, by kontrolować — po to, by rzeczy się działy. Brak sprawczości działa na mnie demotywująco.' },
  { icon: '🔍', label: 'Ciekawość & Rozwój', bar: 90, color: '#2196f3', desc: 'Potrzeba ciągłego uczenia się to mój motor. Nowe idee, nowe dziedziny, intelektualne dyskusje — to mnie ładuje, nie wyczerpuje.' },
  { icon: '🌊', label: 'Napięcie, nie spokój', bar: 85, color: '#00bcd4', desc: 'Działam najlepiej pod presją i w zmiennym środowisku. Cisza i rutyna mnie nie relaksują — to wyzwania i złożone zadania dają mi energię.' },
];

const PEOPLE = [
  { icon: '🤝', label: 'Zaufanie jako default', desc: 'Wychodzę z założenia, że ludzie są szczerzy i dobrzy w intencjach. Daję kredyt zaufania — i oczekuję tego samego.' },
  { icon: '❤️', label: 'Wrażliwość społeczna', desc: 'Ciężko mi przejść obojętnie obok kogoś w potrzebie. Angażuję się w sprawy innych — to naturalne, nie wykalkulowane.' },
  { icon: '⚔️', label: 'Komfort w konflikcie', desc: 'Nie uciekam od trudnych rozmów. Konfrontacja nie jest dla mnie zagrożeniem — to narzędzie do rozwiązywania problemów.' },
  { icon: '🔄', label: 'Mediator & Partner', desc: 'Szukam rozwiązań korzystnych dla obu stron. Praca zarówno samodzielna, jak i zespołowa przychodzi mi naturalnie.' },
];

const THINKING = [
  { icon: '🎯', label: 'Wytrwałość w obliczu przeszkód', pct: 92 },
  { icon: '🧩', label: 'Wszechstronna ciekawość intelektualna', pct: 98 },
  { icon: '🚀', label: 'Inicjatywa i samomotywacja', pct: 90 },
  { icon: '🎨', label: 'Otwartość — nowe idee i doświadczenia', pct: 98 },
  { icon: '🔬', label: 'Refleksyjność i wieloperspektywowość', pct: 95 },
  { icon: '🛠️', label: 'Coaching i praca jeden na jeden', pct: 82 },
];

const OPTO_DIMS = [
  { dim: 'Wpływ', color: '#1565c0', icon: '📣', score: 9, desc: 'Bardzo wysoka asertywność (9/10) i komunikatywność (9/10) — naturalnie przejmuję inicjatywę, wiem jak zjednać sobie ludzi i jestem bardzo przekonujący. Pewność siebie w sytuacjach społecznych (8/10).', items: [{ label: 'Asertywność', val: 9 }, { label: 'Komunikacja', val: 9 }, { label: 'Pewność siebie', val: 8 }] },
  { dim: 'Odporność', color: '#2e7d32', icon: '🧱', score: 9, desc: 'Najwyższy wynik w radzeniu sobie ze stresem (9/10) — zawsze zachowuję spokój pod presją, w stresie wykazuję się odpornością psychiczną. Opanowanie emocji w pracy (7/10).', items: [{ label: 'Radzenie sobie ze stresem', val: 9 }, { label: 'Opanowanie', val: 7 }] },
  { dim: 'Efektywność', color: '#e65100', icon: '🎯', score: 10, desc: 'Orientacja na cel na poziomie maksymalnym (10/10) — zawsze zdeterminowany do osiągania wyznaczonych celów, bardzo ambitny, zawsze wierzy w swoje możliwości. Pracowitość i samodyscyplina (8/10).', items: [{ label: 'Orientacja na cel', val: 10 }, { label: 'Pracowitość', val: 8 }, { label: 'Zapał', val: 5 }] },
  { dim: 'Innowacyjność', color: '#6a1b9a', icon: '💡', score: 9, desc: 'Wysoka pomysłowość (9/10) — cały czas kwestionuję istniejący stan rzeczy, mam mnóstwo nowych pomysłów. Gotowość do podejmowania ryzyka i przedsiębiorczość (8/10). Łatwo dostosowuję się do zmian (7/10).', items: [{ label: 'Pomysłowość', val: 9 }, { label: 'Podejmowanie ryzyka', val: 8 }, { label: 'Zdolność adaptacji', val: 7 }] },
  { dim: 'Sumienność', color: '#37474f', icon: '✅', score: 8, desc: 'Wysoka obowiązkowość (8/10) i szczerość (8/10) — zawsze dotrzymuję zobowiązań, można na mnie polegać, bardzo wysoko cenię autentyczność. Organizacja pracy (7/10).', items: [{ label: 'Obowiązkowość', val: 8 }, { label: 'Szczerość', val: 8 }, { label: 'Organizacja', val: 7 }, { label: 'Zapewnianie jakości', val: 5 }] },
  { dim: 'Współpraca', color: '#00838f', icon: '🤝', score: 9, desc: 'Bardzo wysoka otwartość i towarzyskość (9/10) — lubię pracować w zespole, łatwo nawiązuję rozmowy. Altruizm i troska o innych (6/10). Zaufanie do ludzi (5/10) — z natury weryfikuję intencje.', items: [{ label: 'Utrzymywanie relacji', val: 9 }, { label: 'Altruizm', val: 6 }, { label: 'Zaufanie', val: 5 }] },
];

const TRAINING_AREAS = [
  {
    icon: 'about/icon-ai.png',
    title: 'AI w biznesie',
    level: 'Flagowy temat',
    desc: 'Od podstaw po zaawansowane wdrożenia. Prompt engineering, automatyzacja procesów, AI w sprzedaży i zarządzaniu.',
    tags: ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Automatyzacja'],
  },
  {
    icon: 'about/icon-sales.png',
    title: 'Psychologia sprzedaży',
    level: '2 dni',
    desc: 'Challenger Sale, SPIN Selling, psychologia decyzji zakupowych, praca z oporem klienta.',
    tags: ['Challenger Sale', 'SPIN', 'Negocjacje', 'Obiekcje'],
  },
  {
    icon: 'about/icon-communication.png',
    title: 'Komunikacja',
    level: '1–2 dni',
    desc: 'Feedback, NVC, prezentacje, storytelling, trudne rozmowy, asertywność.',
    tags: ['NVC', 'Feedback', 'Storytelling', 'Asertywność'],
  },
  {
    icon: 'about/icon-leadership.png',
    title: 'Zarządzanie & Przywództwo',
    level: '1–2 dni',
    desc: 'VUCA leadership, zarządzanie zespołem, delegowanie, motywowanie, zarządzanie zmianą.',
    tags: ['VUCA', 'Delegowanie', 'Motywacja', 'Zmiana'],
  },
  {
    icon: 'about/icon-effectiveness.png',
    title: 'Efektywność osobista',
    level: '1 dzień',
    desc: 'GTD, Deep Work, zarządzanie energią, priorytetyzacja, produktywność w erze AI.',
    tags: ['GTD', 'Deep Work', 'Priorytety', 'Nawyki'],
  },
  {
    icon: 'about/icon-group.png',
    title: 'Praca z grupą',
    level: '1–2 dni',
    desc: 'Dynamika grupowa, facylitacja, moderowanie dyskusji, zarządzanie konfliktem w grupie.',
    tags: ['Facylitacja', 'Dynamika', 'Tuckman', 'World Café'],
  },
  {
    icon: 'about/icon-ttt.png',
    title: 'Train the Trainer',
    level: '2–3 dni',
    desc: 'Projektowanie szkoleń (ROPES), metody aktywne, praca z energią grupy, ewaluacja.',
    tags: ['ROPES', 'Metody aktywne', 'Ewaluacja', 'Kirkpatrick'],
  },
];

const METHODOLOGIES = [
  'Challenger Sale', 'SPIN Selling', 'NVC', 'Design Thinking',
  'GTD', 'ROPES', 'Kirkpatrick', 'Tuckman', 'Kolb', 'DISC',
];

const GROUP_PROCESS = [
  { icon: '🎲', title: 'Losowość jako narzędzie, nie chaos', desc: 'Podział na grupy i losowanie uczestników to nie tylko "kto z kim" — to świadoma interwencja w dynamikę grupy. Losowość rozbija nieformalne koalicje, wymusza nowe perspektywy i tworzy warunki do autentycznej współpracy.' },
  { icon: '🌡️', title: 'Temperatura grupy', desc: 'Na każdym etapie warsztatu monitoruję poziom energii, napięcia i zaangażowania. Wiem, kiedy przyspieszyć, kiedy zwolnić — i kiedy potrzebny jest reset. Narzędzia jak losowanie czy koło fortuny pomagają zmieniać rytm i utrzymywać uwagę.' },
  { icon: '🧱', title: 'Fazy grupowe — od formowania do działania', desc: 'Grupy przechodzą przez przewidywalne fazy: forming → storming → norming → performing. Dobry trener nie omija "stormingu" — pomaga grupie przez niego przejść. Losuję, mieszam składy i prowokuję dialog właśnie wtedy, gdy jest to najbardziej potrzebne.' },
  { icon: '🎯', title: 'Struktura, która uwalnia', desc: 'Paradoks procesu grupowego: im lepsza struktura, tym więcej swobody twórczej. Jasne zasady losowania, przejrzyste reguły gry i przewidywalny rytm dają uczestnikom poczucie bezpieczeństwa — i przestrzeń do autentycznego zaangażowania.' },
  { icon: '👁️', title: 'Uważność na to, co niewidoczne', desc: 'Dynamika grupy dzieje się zarówno w słowach, jak i między nimi. Obserwuję, kto milczy, kto dominuje, jakie nieformalne role się tworzą. Narzędzia losowania pomagają mi jako trenerowi — bez tłumaczenia się — zmienić układ sił i dać głos tym, którzy go nie zabierają.' },
];

const CLIENTS: { sector: string; icon: string; names: string[] }[] = [
  { sector: 'Bankowość & Finanse', icon: '🏦', names: ['AASA Poland', 'Alior Bank', 'Bank BPH', 'CERI International', 'Noble Bank'] },
  { sector: 'Ubezpieczenia', icon: '🛡️', names: ['Aviva', 'Generali'] },
  { sector: 'IT & Technologie', icon: '💻', names: ['Atman', 'Capgemini', 'InPost', 'ISCH', 'Packhelp'] },
  { sector: 'Consulting & Doradztwo biznesowe', icon: '💼', names: ['Deloitte', 'McKinsey & Company'] },
  { sector: 'Szkolenia & Rozwój (L&D)', icon: '🎓', names: ['Certes', 'CERI', 'House of Skills', 'Polska Izba Firm Szkoleniowych', 'Teamformacja', 'Wszechnica UJ'] },
  { sector: 'FMCG & Artykuły konsumenckie', icon: '🛒', names: ['Coty', 'Danone', 'Intersnack', 'Japan Tobacco International (JTI)', "L'Oréal", 'Philip Morris Polska', 'Tobacco Trading International (TTI)'] },
  { sector: 'Retail & E-commerce', icon: '🛍️', names: ['Allegro', 'Empik', 'Lidl', 'NEINVER (Factory Outlets)'] },
  { sector: 'Rekrutacja & HR', icon: '👔', names: ['Adecco', 'Antal', 'Benefit Systems (MultiSport)'] },
  { sector: 'Ochrona Zdrowia & Farmacja', icon: '💊', names: ['Apteki DOZ', 'Narodowy Fundusz Zdrowia (NFZ)'] },
  { sector: 'Dystrybucja & Logistyka', icon: '📦', names: ['Agility Logistics', 'Lyreco', 'Orange'] },
  { sector: 'Motoryzacja & Wynajem', icon: '🚗', names: ['99Rent'] },
  { sector: 'OZE & Energetyka', icon: '⚡', names: ['4-Eco (fotowoltaika)', 'Solenerga'] },
  { sector: 'Branża prawna & Odszkodowania', icon: '⚖️', names: ['Helpea'] },
  { sector: 'Administracja publiczna & NGO', icon: '🏛️', names: ['Akademia PAN (Fundacja Polskiej Akademii Nauk)', 'Akademia Przyszłości', 'Fundacja im. Lesława Pagi', 'Fundacja Rozwoju Przedsiębiorczości „Twój Startup"', 'Ministerstwo Środowiska', 'Ministerstwo Sprawiedliwości', 'Szkoła Główna Gospodarstwa Wiejskiego (SGGW)'] },
];

function OptoDimCard({ dim, color, icon, desc, items }: Omit<typeof OPTO_DIMS[0], 'score'> & { score?: number }) {
  return (
    <div className="opto-dim-card">
      <div className="opto-dim-header">
        <span className="opto-dim-icon">{icon}</span>
        <span className="opto-dim-name">{dim}</span>
        <div className="opto-dim-bars">
          {items.map(it => (
            <div key={it.label} className="opto-bar-row">
              <span className="opto-bar-label">{it.label}</span>
              <div className="opto-bar-track">
                <div className="opto-bar-fill" style={{ width: `${it.val * 10}%`, background: color }} />
              </div>
              <span className="opto-bar-val" style={{ color }}>{it.val}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="opto-dim-desc">{desc}</p>
    </div>
  );
}

function DriveBar({ icon, label, bar, color, desc }: typeof DRIVES[0]) {
  return (
    <div className="drive-item">
      <div className="drive-top">
        <span className="drive-icon">{icon}</span>
        <span className="drive-label">{label}</span>
        <div className="drive-track">
          <div className="drive-fill" style={{ width: `${bar}%`, background: color }} />
        </div>
      </div>
      <p className="drive-desc">{desc}</p>
    </div>
  );
}

function ThinkingBar({ icon, label, pct }: typeof THINKING[0]) {
  return (
    <div className="rmp-row">
      <span className="rmp-label" style={{ width: 'auto', flex: 1, textAlign: 'left' }}>
        {icon} {label}
      </span>
      <div className="rmp-track" style={{ width: 80, flexShrink: 0 }}>
        <div className="rmp-fill" style={{ width: `${pct}%`, background: '#4caf50' }} />
      </div>
      <span className="rmp-val">{pct}%</span>
    </div>
  );
}

export function AboutPanel({ onClose }: { onClose?: () => void }) {
  const content = (
    <div className="about-body">
      {onClose && <button className="about-close-btn" onClick={onClose} aria-label="Zamknij">✕</button>}
      <div className="about-card">
        <div className="about-photo-wrap">
          <img src={`${import.meta.env.BASE_URL}author.jpg`} alt="Sebastian Szajner" className="about-photo" />
        </div>
        <div className="about-content">
          <h2 className="about-name">Sebastian Szajner</h2>
          <p className="about-role">Trener · Konsultant · Coach · Psycholog</p>
          <div className="about-tags">
            {['C-level','N-1 / N-2','Zarządzanie','Przywództwo','Psychologia sprzedaży','Efektywność osobista','AI w biznesie'].map(t => (
              <span key={t} className="about-tag">{t}</span>
            ))}
          </div>
          <p className="about-desc">
            Trener i konsultant z ponad <strong>10-letnim doświadczeniem</strong> w obszarze
            szkoleń i rozwoju (L&amp;D). Wcześniej pracował bezpośrednio w sprzedaży
            (m.in. Noble Bank), przeszedł pełną ścieżkę — od trenera wewnętrznego,
            przez L&amp;D Experta i Senior Trenera Sprzedaży, po Kierownika Szkoleń.
          </p>
          <p className="about-desc">
            Specjalizuje się w szkoleniach z zakresu <strong>psychologii sprzedaży</strong>,{' '}
            <strong>efektywności osobistej</strong> i <strong>zarządzania</strong>.
            Ponad <strong>6 000 godzin</strong> pracy warsztatowej. Od 2023 roku szkoli
            działy sprzedaży z <strong>efektywnego użycia AI</strong>. Prowadzi szkolenia
            w języku polskim i angielskim.
          </p>
        </div>
      </div>
      <div className="about-section-title">Podejście do procesu grupowego</div>
      <p className="about-intro-text">Warsztat to żywy organizm. To, co dzieje się między ludźmi — dynamika, napięcia, energie — ma równie duże znaczenie jak treść merytoryczna. Poniżej kilka zasad, którymi kieruję się podczas pracy z grupą.</p>
      <div className="group-process-grid">
        {GROUP_PROCESS.map(item => (<div key={item.title} className="group-process-card"><div className="group-process-icon">{item.icon}</div><div><strong className="group-process-title">{item.title}</strong><p className="group-process-desc">{item.desc}</p></div></div>))}
      </div>
      {/* ── Tematy szkoleniowe & kompetencje ─────────────────────────── */}
      <div className="about-section-title">Tematy szkoleniowe & kompetencje</div>
      <p className="about-intro-text">
        7 głównych obszarów tematycznych, w których prowadzę szkolenia i warsztaty.
        Każdy temat adaptuję do poziomu grupy — od podstawowego po zaawansowany.
      </p>
      <div className="training-areas-grid">
          <img src="about/banner-training.png" alt="Obszary szkoleniowe" className="training-banner" />
        {TRAINING_AREAS.map(area => (
          <div key={area.title} className="training-area-card">
            <div className="training-area-header">
              <img src={area.icon} alt={area.title} className="training-area-icon" />
              <div>
                <strong className="training-area-title">{area.title}</strong>
                <span className="training-area-level">{area.level}</span>
              </div>
            </div>
            <p className="training-area-desc">{area.desc}</p>
            <div className="training-area-tags">
              {area.tags.map(tag => (
                <span key={tag} className="training-area-tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="training-methodologies">
        <span className="training-methodologies-label">Metodologie & frameworki:</span>
        <div className="training-methodologies-list">
          {METHODOLOGIES.map(m => (
            <span key={m} className="training-methodology-chip">{m}</span>
          ))}
        </div>
      </div>

      {/* ── Profil osobowościowy ──────────────────────────────────────── */}
      <div className="about-section-title">Kim jestem — profil osobowościowy</div>
      <p className="about-intro-text">Poniższy opis powstał na podstawie kilku badań psychometrycznych z ostatnich lat. To nie są wyniki testów — to <strong>obraz tego, jak naprawdę funkcjonuję</strong>, co mnie napędza i jak wchodzę w relacje. Warto to znać, żeby dobrze ze mną współpracować.</p>
      <div className="about-psych-grid">
        <div className="about-psych-card about-psych-card--wide"><div className="about-psych-header"><span className="about-psych-badge rmp-badge">🔥 Motywacja</span><span className="about-psych-name">Co mnie napędza do działania</span></div><div className="drives-list">{DRIVES.map(d => <DriveBar key={d.label} {...d} />)}</div></div>
        <div className="about-psych-card"><div className="about-psych-header"><span className="about-psych-badge perso-badge">👥 Relacje</span><span className="about-psych-name">Jak funkcjonuję z ludźmi</span></div><div className="people-chips">{PEOPLE.map(p => (<div key={p.label} className="people-chip"><span className="people-icon">{p.icon}</span><div><strong>{p.label}</strong><p>{p.desc}</p></div></div>))}</div></div>
        <div className="about-psych-card"><div className="about-psych-header"><span className="about-psych-badge harrison-badge">🧠 Styl działania</span><span className="about-psych-name">Jak myślę i działam</span></div><p className="about-psych-desc">Niekonwencjonalny, otwarty na nowe doświadczenia — w górnym percentylu populacji. Unikam rutyny, chętnie wchodzę w intelektualne spory i eksperymentuję. Wyróżnia mnie duża wrażliwość emocjonalna połączona z komfortem w trudnych sytuacjach.</p><div className="rmp-bars">{THINKING.map(t => <ThinkingBar key={t.label} {...t} />)}</div></div>
        <div className="about-psych-card about-psych-card--wide"><div className="about-psych-header"><span className="about-psych-badge opto-badge">📊 OPTO · Master</span><span className="about-psych-name">Profil osobowości — 8 wymiarów (skala 1–10)</span></div><p className="about-psych-desc">Badanie OPTO (Master, 06.10.2025) mierzy 8 kluczowych wymiarów osobowości z punktu widzenia efektywności w pracy. Dwa dominujące obszary to <strong>Wpływ</strong> i{' '}<strong>Innowacyjność</strong> — co przekłada się na styl pracy: inicjatywa, perswazja, nieustanne kwestionowanie status quo i orientacja na cel maksymalny (10/10).</p><div className="opto-dims-grid">{OPTO_DIMS.map(d => <OptoDimCard key={d.dim} {...d} />)}</div></div>
      </div>
      <div className="about-section-title">Wybrani klienci — według branż</div>
      <p className="about-intro-text">Ponad 10 lat pracy z organizacjami z różnych sektorów. Poniżej wybrane firmy i instytucje, z którymi współpracowałem.</p>
      <div className="clients-sectors">
        {CLIENTS.map(sector => (<div key={sector.sector} className="clients-sector"><div className="clients-sector-header"><span className="clients-sector-icon">{sector.icon}</span><span className="clients-sector-name">{sector.sector}</span></div><div className="clients-list">{sector.names.map(name => (<span key={name} className="client-chip">{name}</span>))}</div></div>))}
      </div>
      <div className="about-app-note"><span className="about-app-label">O aplikacji</span><p><strong>Sąsiedzi na Migdałowej</strong> to interaktywna gra edukacyjna z elementami RPG, stworzona do nauki przez zabawę. Gracz wciela się w bohatera eksplorującego świat, rozwiązując wyzwania i poznając sąsiadów.</p></div>
      <div className="about-footer">Created &amp; designed by <strong>Sebastian Szajner</strong> · 2025</div>
    </div>
  );

  if (onClose) {
    return (
      <div className="about-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        {content}
      </div>
    );
  }
  return content;
}
