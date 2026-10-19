/* =========================================================
   DOCE ESPÍRITO SANTO — UM AMIGO ÍNTIMO
   APP.JS
   ========================================================= */

"use strict";

/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const APP_CONFIG = {
  totalDays: 365,
  devotionalFile: "./devocionais.json",
  themesFile: "./temas.json",
  bibleFile: "./biblia.json",
  studiesFile: "./estudos.json",
  plansFile: "./planos.json",
  serviceWorker: "./sw.js",
  defaultBibleVersion: "ALMEIDA 1911"
};

/* =========================================================
   ESTADO GLOBAL
   ========================================================= */

const state = {
  devotionals: [],
  themes: [],
  bible: [],
  studies: [],
  plans: [],
  currentDay: 1,
  currentScreen: "home",
  currentBibleBook: null,
  currentBibleChapter: null,
  currentPlan: null,
  currentStudy: null,
  completedDays: [],
  journal: {},
  favorites: [],
  settings: {
    autoplay: false,
    persistentAudio: true
  },
  audio: {
    day: null,
    src: "",
    title: "",
    playing: false
  }
};

/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function byId(id) {
  return document.getElementById(id);
}

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

function toArray(value) {
  if (Array.isArray(value)) return value;

  if (value === null || value === undefined) {
    return [];
  }

  return [value];
}

function normalizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value
      .map(item => normalizeText(item))
      .filter(Boolean)
      .join("\n\n");
  }

  if (typeof value === "object") {
    if (value.texto) return normalizeText(value.texto);
    if (value.text) return normalizeText(value.text);
    if (value.conteudo) return normalizeText(value.conteudo);
    if (value.content) return normalizeText(value.content);

    return Object.values(value)
      .map(item => normalizeText(item))
      .filter(Boolean)
      .join("\n\n");
  }

  return String(value);
}

function normalizeNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function formatDay(day) {
  return String(day).padStart(2, "0");
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getDayNumber(item) {
  return normalizeNumber(
    item?.dia ??
    item?.day ??
    item?.numero ??
    item?.number,
    0
  );
}

function getCurrentDay() {
  return clamp(
    normalizeNumber(state.currentDay, 1),
    1,
    APP_CONFIG.totalDays
  );
}

/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function loadLocalState() {
  try {
    const completed = JSON.parse(
      localStorage.getItem("doce_completed_days") || "[]"
    );

    state.completedDays = Array.isArray(completed)
      ? completed.map(Number).filter(Boolean)
      : [];
  } catch {
    state.completedDays = [];
  }

  try {
    const journal = JSON.parse(
      localStorage.getItem("doce_journal") || "{}"
    );

    state.journal =
      journal && typeof journal === "object"
        ? journal
        : {};
  } catch {
    state.journal = {};
  }

  try {
    const favorites = JSON.parse(
      localStorage.getItem("doce_favorites") || "[]"
    );

    state.favorites = Array.isArray(favorites)
      ? favorites.map(Number).filter(Boolean)
      : [];
  } catch {
    state.favorites = [];
  }

  state.currentDay = clamp(
    normalizeNumber(
      localStorage.getItem("doce_current_day"),
      1
    ),
    1,
    APP_CONFIG.totalDays
  );

  state.settings.autoplay =
    localStorage.getItem("doce_autoplay") === "true";

  const persistentSetting =
    localStorage.getItem("doce_persistent_audio");

  state.settings.persistentAudio =
    persistentSetting === null
      ? true
      : persistentSetting === "true";
}

function saveCompletedDays() {
  state.completedDays = Array.from(
    new Set(
      state.completedDays
        .map(Number)
        .filter(day => day >= 1 && day <= APP_CONFIG.totalDays)
    )
  ).sort((a, b) => a - b);

  localStorage.setItem(
    "doce_completed_days",
    JSON.stringify(state.completedDays)
  );
}

function saveJournalState() {
  localStorage.setItem(
    "doce_journal",
    JSON.stringify(state.journal)
  );
}

function saveFavorites() {
  localStorage.setItem(
    "doce_favorites",
    JSON.stringify(state.favorites)
  );
}

function saveCurrentDay() {
  localStorage.setItem(
    "doce_current_day",
    String(state.currentDay)
  );
}

/* =========================================================
   CARREGAMENTO DOS DADOS
   ========================================================= */

async function fetchJSON(path) {
  const response = await fetch(
    `${path}?v=${Date.now()}`,
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error(
      `Não foi possível carregar ${path}`
    );
  }

  return response.json();
}

async function loadAllContent() {
  const results = await Promise.allSettled([
    fetchJSON(APP_CONFIG.devotionalFile),
    fetchJSON(APP_CONFIG.themesFile),
    fetchJSON(APP_CONFIG.bibleFile),
    fetchJSON(APP_CONFIG.studiesFile),
    fetchJSON(APP_CONFIG.plansFile)
  ]);

  const [
    devotionalsResult,
    themesResult,
    bibleResult,
    studiesResult,
    plansResult
  ] = results;

  if (devotionalsResult.status === "fulfilled") {
    state.devotionals =
      normalizeDevotionals(devotionalsResult.value);
  }

  if (themesResult.status === "fulfilled") {
    state.themes =
      normalizeThemes(themesResult.value);
  }

  if (bibleResult.status === "fulfilled") {
    state.bible =
      normalizeBible(bibleResult.value);
  }

  if (studiesResult.status === "fulfilled") {
    state.studies =
      normalizeStudies(studiesResult.value);
  }

  if (plansResult.status === "fulfilled") {
    state.plans =
      normalizePlans(plansResult.value);
  }

  if (!state.devotionals.length) {
    console.warn(
      "Nenhum devocional foi carregado."
    );
  }

  if (!state.bible.length) {
    console.warn(
      "Nenhum conteúdo bíblico foi carregado."
    );
  }
}

/* =========================================================
   NORMALIZAÇÃO DOS DEVOCIONAIS
   ========================================================= */

function normalizeDevotionals(data) {
  let list = data;

  if (data && Array.isArray(data.devocionais)) {
    list = data.devocionais;
  }

  if (
    data &&
    Array.isArray(data.days)
  ) {
    list = data.days;
  }

  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .map(item => {
      const day = getDayNumber(item);

      const leituraBiblica =
        item.leitura_biblica ||
        item.leituraBiblica ||
        {};

      return {
        ...item,

        dia: day,

        titulo:
          item.titulo ||
          item.title ||
          `Dia ${formatDay(day)}`,

        subtitulo:
          item.subtitulo ||
          item.subtitle ||
          "",

        tema:
          item.tema ||
          item.theme ||
          "",

        introducao:
          item.introducao ||
          item.introduction ||
          item.descricao ||
          item.description ||
          "",

        referencia_principal:
          item.referencia_principal ||
          item.referenciaPrincipal ||
          item.referencia ||
          item.biblia ||
          leituraBiblica.referencia ||
          "",

        leitura_biblica: leituraBiblica,

        contexto_biblico:
          item.contexto_biblico ||
          item.contextoBiblico ||
          item.contexto ||
          "",

        exposicao_biblica:
          item.exposicao_biblica ||
          item.exposicaoBiblica ||
          item.exposicao ||
          "",

        exegese:
          item.exegese ||
          "",

        comentario_teologico:
          item.comentario_teologico ||
          item.comentarioTeologico ||
          item.teologia ||
          "",

        reflexao:
          item.reflexao ||
          "",

        contemplacao_teologica:
          item.contemplacao_teologica ||
          item.contemplacaoTeologica ||
          item.contemplacao ||
          "",

        aplicacao_pratica:
          item.aplicacao_pratica ||
          item.aplicacaoPratica ||
          item.pratica ||
          "",

        perguntas_interiorizacao:
          item.perguntas_interiorizacao ||
          item.perguntasInteriorizacao ||
          item.perguntas ||
          [],

        diario_pessoal:
          item.diario_pessoal ||
          item.diarioPessoal ||
          "",

        referencias_relacionadas:
          item.referencias_relacionadas ||
          item.referenciasRelacionadas ||
          item.referencias ||
          [],

        oracao:
          item.oracao ||
          item.oracao_final ||
          "",

        audio:
          item.audio ||
          item.audio_url ||
          item.audioUrl ||
          `audio/dia-${formatDay(day)}.mp3`
      };
    })
    .filter(item => item.dia > 0)
    .sort((a, b) => a.dia - b.dia);
}

/* =========================================================
   NORMALIZAÇÃO DOS TEMAS
   ========================================================= */

function normalizeThemes(data) {
  let list = data;

  if (data && Array.isArray(data.temas)) {
    list = data.temas;
  }

  if (!Array.isArray(list)) {
    return [];
  }

  return list.map(item => ({
    ...item,

    id:
      item.id ||
      item.slug ||
      `tema-${item.numero || item.inicio || Math.random()}`,

    nome:
      item.nome ||
      item.titulo ||
      item.title ||
      "",

    titulo:
      item.titulo ||
      item.nome ||
      item.title ||
      "",

    descricao:
      item.descricao ||
      item.description ||
      "",

    inicio:
      normalizeNumber(
        item.inicio ||
        item.dia_inicio ||
        item.startDay,
        1
      ),

    fim:
      normalizeNumber(
        item.fim ||
        item.dia_fim ||
        item.endDay,
        APP_CONFIG.totalDays
      )
  }));
}

/* =========================================================
   NORMALIZAÇÃO DA BÍBLIA
   ========================================================= */

function normalizeBible(data) {
  let books = data;

  if (data && Array.isArray(data.books)) {
    books = data.books;
  }

  if (data && Array.isArray(data.livros)) {
    books = data.livros;
  }

  if (!Array.isArray(books)) {
    return [];
  }

  return books.map((book, index) => {
    const chapters =
      book.chapters ||
      book.capitulos ||
      book.chapter ||
      [];

    return {
      ...book,

      id:
        book.id ||
        book.slug ||
        `book-${index + 1}`,

      name:
        book.name ||
        book.nome ||
        book.title ||
        `Livro ${index + 1}`,

      nome:
        book.nome ||
        book.name ||
        book.title ||
        `Livro ${index + 1}`,

      chapters:
        normalizeBibleChapters(chapters)
    };
  });
}

function normalizeBibleChapters(chapters) {
  if (!Array.isArray(chapters)) {
    return [];
  }

  return chapters.map(
    (chapter, index) => {
      if (
        typeof chapter === "string"
      ) {
        return {
          number: index + 1,
          numero: index + 1,
          verses: [
            {
              number: 1,
              numero: 1,
              text: chapter
            }
          ]
        };
      }

      const verses =
        chapter.verses ||
        chapter.versiculos ||
        [];

      return {
        ...chapter,

        number:
          normalizeNumber(
            chapter.number ||
            chapter.numero ||
            chapter.capitulo,
            index + 1
          ),

        numero:
          normalizeNumber(
            chapter.numero ||
            chapter.number ||
            chapter.capitulo,
            index + 1
          ),

        verses:
          normalizeBibleVerses(verses)
      };
    }
  );
}

function normalizeBibleVerses(verses) {
  if (!Array.isArray(verses)) {
    return [];
  }

  return verses.map(
    (verse, index) => {
      if (
        typeof verse === "string"
      ) {
        return {
          number: index + 1,
          numero: index + 1,
          text: verse
        };
      }

      return {
        ...verse,

        number:
          normalizeNumber(
            verse.number ||
            verse.numero ||
            verse.versiculo,
            index + 1
          ),

        numero:
          normalizeNumber(
            verse.numero ||
            verse.number ||
            verse.versiculo,
            index + 1
          ),

        text:
          verse.text ||
          verse.texto ||
          verse.content ||
          ""
      };
    }
  );
}

/* =========================================================
   NORMALIZAÇÃO DOS ESTUDOS
   ========================================================= */

function normalizeStudies(data) {
  let list = data;

  if (data && Array.isArray(data.estudos)) {
    list = data.estudos;
  }

  if (
    data &&
    Array.isArray(data.studies)
  ) {
    list = data.studies;
  }

  if (!Array.isArray(list)) {
    return [];
  }

  return list.map(
    (item, index) => ({
      ...item,

      id:
        item.id ||
        item.slug ||
        `estudo-${index + 1}`,

      titulo:
        item.titulo ||
        item.title ||
        `Estudo ${index + 1}`,

      categoria:
        item.categoria ||
        item.category ||
        item.tipo ||
        "biblical",

      tipo:
        item.tipo ||
        item.category ||
        item.categoria ||
        "biblical",

      descricao:
        item.descricao ||
        item.description ||
        "",

      conteudo:
        item.conteudo ||
        item.content ||
        "",

      contexto:
        item.contexto ||
        "",

      exegese:
        item.exegese ||
        "",

      comentario_teologico:
        item.comentario_teologico ||
        item.comentarioTeologico ||
        "",

      tempo_estimado_minutos:
        normalizeNumber(
          item.tempo_estimado_minutos ||
          item.tempoEstimadoMinutos ||
          item.duration,
          0
        )
    })
  );
}

/* =========================================================
   NORMALIZAÇÃO DOS PLANOS
   ========================================================= */

function normalizePlans(data) {
  let list = data;

  if (data && Array.isArray(data.planos)) {
    list = data.planos;
  }

  if (data && Array.isArray(data.plans)) {
    list = data.plans;
  }

  if (!Array.isArray(list)) {
    return [];
  }

  return list.map(
    (plan, index) => ({
      ...plan,

      id:
        plan.id ||
        plan.slug ||
        `plano-${index + 1}`,

      titulo:
        plan.titulo ||
        plan.title ||
        `Plano ${index + 1}`,

      descricao:
        plan.descricao ||
        plan.description ||
        "",

      duracao:
        normalizeNumber(
          plan.duracao ||
          plan.duration ||
          plan.dias,
          0
        ),

      dias:
        Array.isArray(plan.dias)
          ? plan.dias
          : Array.isArray(plan.days)
            ? plan.days
            : []
    })
  );
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initializeApp();
  }
);

async function initializeApp() {
  loadLocalState();
  bindStaticEvents();

  await loadAllContent();

  initializeSplash();
  initializeAppInterface();
  registerServiceWorker();
}

/* =========================================================
   SPLASH SCREEN
   ========================================================= */

function initializeSplash() {
  const splash =
    byId("splash-screen");

  const app =
    byId("app-shell");

  const button =
    byId("startApp");

  if (!splash || !app || !button) {
    return;
  }

  button.onclick = () => {
    splash.classList.add(
      "is-hidden"
    );

    app.classList.remove(
      "is-hidden"
    );

    initializeAppInterface();
  };
}

/* =========================================================
   INTERFACE
   ========================================================= */

function initializeAppInterface() {
  renderHome();
  renderJourney();
  renderThemes();
  renderBibleBooks();
  renderStudies();
  renderPlans();
  renderJournalSelector();
  renderFavorites();
  updateProgress();
  updateProfile();
  updateSettingsUI();

  const manualSeen =
    localStorage.getItem(
      "doce_manual_seen"
    ) === "true";

  const splash =
    byId("splash-screen");

  const app =
    byId("app-shell");

  if (splash) {
    splash.classList.add(
      "is-hidden"
    );
  }

  if (app) {
    app.classList.remove(
      "is-hidden"
    );
  }

  showScreen(
    manualSeen
      ? "home"
      : "manual"
  );
}

/* =========================================================
   EVENTOS
   ========================================================= */

function bindStaticEvents() {
  $$(".nav-button").forEach(
    button => {
      button.addEventListener(
        "click",
        () => {
          const screen =
            button.dataset.screen;

          if (screen) {
            showScreen(screen);
          }
        }
      );
    }
  );

  $$("[data-target]").forEach(
    button => {
      button.addEventListener(
        "click",
        () => {
          const target =
            button.dataset.target;

          if (target) {
            showScreen(target);
          }
        }
      );
    }
  );

  byId(
    "manual-start-button"
  )?.addEventListener(
    "click",
    () => {
      localStorage.setItem(
        "doce_manual_seen",
        "true"
      );

      showScreen("home");
    }
  );

  byId(
    "continue-journey"
  )?.addEventListener(
    "click",
    () => {
      showScreen("journey");
    }
  );

  byId(
    "open-today"
  )?.addEventListener(
    "click",
    () => {
      openDevotional(
        getCurrentDay()
      );
    }
  );

  byId(
    "complete-devotional"
  )?.addEventListener(
    "click",
    completeCurrentDay
  );

  byId(
    "open-journal-from-devotional"
  )?.addEventListener(
    "click",
    () => {
      saveDevotionalJournal();
      showScreen("journal");
    }
  );

  byId(
    "open-search"
  )?.addEventListener(
    "click",
    () => {
      showScreen("search");

      setTimeout(
        () => {
          byId(
            "search-input"
          )?.focus();
        },
        100
      );
    }
  );

  byId(
    "search-input"
  )?.addEventListener(
    "input",
    event => {
      performGlobalSearch(
        event.target.value
      );
    }
  );

  byId(
    "bible-book"
  )?.addEventListener(
    "change",
    event => {
      populateBibleChapters(
        event.target.value
      );
    }
  );

  byId(
    "open-bible-chapter"
  )?.addEventListener(
    "click",
    openBibleChapter
  );

  byId(
    "bible-search-input"
  )?.addEventListener(
    "input",
    event => {
      searchBible(
        event.target.value
      );
    }
  );

  $$(".study-tab").forEach(
    tab => {
      tab.addEventListener(
        "click",
        () => {
          switchStudyType(
            tab.dataset.studyType
          );
        }
      );
    }
  );

  byId(
    "close-study-reader"
  )?.addEventListener(
    "click",
    () => {
      byId(
        "study-reader"
      )?.classList.add(
        "is-hidden"
      );
    }
  );

  byId(
    "close-plan-reader"
  )?.addEventListener(
    "click",
    () => {
      byId(
        "plan-reader"
      )?.classList.add(
        "is-hidden"
      );
    }
  );

  byId(
    "journal-day"
  )?.addEventListener(
    "change",
    event => {
      loadJournalDay(
        Number(event.target.value)
      );
    }
  );

  byId(
    "save-journal"
  )?.addEventListener(
    "click",
    saveJournal
  );

  byId(
    "ai-send"
  )?.addEventListener(
    "click",
    sendAIQuestion
  );

  byId(
    "ai-input"
  )?.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        sendAIQuestion();
      }
    }
  );

  byId(
    "global-audio-play"
  )?.addEventListener(
    "click",
    () => {
      byId(
        "global-audio"
      )?.play();
    }
  );

  byId(
    "global-audio-pause"
  )?.addEventListener(
    "click",
    () => {
      byId(
        "global-audio"
      )?.pause();
    }
  );

  byId(
    "global-audio-speed"
  )?.addEventListener(
    "change",
    event => {
      const audio =
        byId("global-audio");

      if (audio) {
        audio.playbackRate =
          Number(event.target.value);
      }
    }
  );

  byId(
    "setting-autoplay"
  )?.addEventListener(
    "change",
    event => {
      state.settings.autoplay =
        event.target.checked;

      localStorage.setItem(
        "doce_autoplay",
        String(
          state.settings.autoplay
        )
      );
    }
  );

  byId(
    "setting-persistent-audio"
  )?.addEventListener(
    "change",
    event => {
      state.settings.persistentAudio =
        event.target.checked;

      localStorage.setItem(
        "doce_persistent_audio",
        String(
          state.settings.persistentAudio
        )
      );
    }
  );

  const globalAudio =
    byId("global-audio");

  globalAudio?.addEventListener(
    "play",
    () => {
      state.audio.playing = true;
    }
  );

  globalAudio?.addEventListener(
    "pause",
    () => {
      state.audio.playing = false;
    }
  );
}

/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

function showScreen(screenName) {
  const target =
    String(screenName || "home");

  const screens =
    $$(".screen");

  screens.forEach(
    screen => {
      screen.classList.toggle(
        "is-active",
        screen.dataset.screen === target
      );
    }
  );

  $$(".nav-button").forEach(
    button => {
      button.classList.toggle(
        "is-active",
        button.dataset.screen === target
      );
    }
  );

  state.currentScreen = target;

  if (
    target === "home"
  ) {
    renderHome();
  }

  if (
    target === "journey"
  ) {
    renderJourney();
  }

  if (
    target === "journal"
  ) {
    renderJournalSelector();
  }

  if (
    target === "favorites"
  ) {
    renderFavorites();
  }

  if (
    target === "profile"
  ) {
    updateProfile();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================================================
   HOME
   ========================================================= */

function getDevotional(day) {
  return state.devotionals.find(
    item =>
      getDayNumber(item) ===
      Number(day)
  );
}

function renderHome() {
  const day =
    getCurrentDay();

  const devotional =
    getDevotional(day) ||
    state.devotionals[0];

  if (!devotional) {
    return;
  }

  const realDay =
    getDayNumber(devotional);

  const title =
    devotional.titulo ||
    `Dia ${formatDay(realDay)}`;

  const description =
    devotional.introducao ||
    devotional.descricao ||
    "";

  const reference =
    getReferenceText(devotional);

  const completed =
    state.completedDays.length;

  const percent =
    Math.round(
      (completed /
        APP_CONFIG.totalDays) *
      100
    );

  setText(
    "today-day",
    `DIA ${formatDay(realDay)}`
  );

  setText(
    "today-title",
    title
  );

  setText(
    "today-description",
    description
  );

  setText(
    "today-reference",
    reference
  );

  setText(
    "home-progress-day",
    `DIA ${formatDay(day)} DE 365`
  );

  setText(
    "home-progress-percent",
    `${percent}%`
  );

  setWidth(
    "home-progress-bar",
    percent
  );
}

/* =========================================================
   JORNADA
   ========================================================= */

function renderJourney() {
  renderThemes();

  const grid =
    byId("journey-grid");

  if (!grid) {
    return;
  }

  grid.innerHTML = "";

  for (
    let day = 1;
    day <= APP_CONFIG.totalDays;
    day++
  ) {
    const devotional =
      getDevotional(day);

    const card =
      document.createElement("article");

    card.className =
      "journey-day-card";

    const completed =
      state.completedDays.includes(day);

    const available =
      Boolean(devotional);

    if (completed) {
      card.classList.add(
        "is-completed"
      );
    }

    if (!available) {
      card.classList.add(
        "is-unavailable"
      );
    }

    const title =
      devotional?.titulo ||
      "Conteúdo em preparação";

    card.innerHTML = `
      <div class="journey-day-number">
        DIA ${formatDay(day)}
      </div>

      <h3>
        ${escapeHTML(title)}
      </h3>

      <p>
        ${
          completed
            ? "Concluído"
            : available
              ? "Disponível"
              : "Em preparação"
        }
      </p>

      ${
        available
          ? `
            <button
              class="secondary-button"
              type="button"
              data-open-day="${day}">
              ABRIR
            </button>
          `
          : ""
      }
    `;

    const openButton =
      card.querySelector(
        "[data-open-day]"
      );

    openButton?.addEventListener(
      "click",
      () => {
        openDevotional(day);
      }
    );

    grid.appendChild(card);
  }

  updateJourneyHeader();
}

function updateJourneyHeader() {
  const day =
    getCurrentDay();

  const devotional =
    getDevotional(day);

  const completed =
    state.completedDays.length;

  const percent =
    Math.round(
      (completed /
        APP_CONFIG.totalDays) *
      100
    );

  setText(
    "journey-current-day",
    `DIA ${formatDay(day)}`
  );

  setText(
    "journey-current-title",
    devotional?.titulo ||
    "Sua jornada continua."
  );

  setText(
    "journey-progress-percent",
    `${percent}%`
  );

  setWidth(
    "journey-progress-bar",
    percent
  );
}

/* =========================================================
   TEMAS
   ========================================================= */

function renderThemes() {
  const container =
    byId("themes-grid");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!state.themes.length) {
    container.innerHTML =
      "<p>Os ciclos da jornada serão apresentados aqui.</p>";

    return;
  }

  state.themes.forEach(
    theme => {
      const card =
        document.createElement("article");

      card.className =
        "theme-card";

      card.innerHTML = `
        <p class="section-kicker">
          DIAS ${formatDay(theme.inicio)}
          — ${formatDay(theme.fim)}
        </p>

        <h3>
          ${escapeHTML(
            theme.titulo ||
            theme.nome
          )}
        </h3>

        <p>
          ${escapeHTML(
            theme.descricao || ""
          )}
        </p>
      `;

      container.appendChild(card);
    }
  );
}

function getThemeForDay(day) {
  return state.themes.find(
    theme =>
      day >= theme.inicio &&
      day <= theme.fim
  );
}

/* =========================================================
   DEVOCIONAL
   ========================================================= */

function openDevotional(day) {
  const devotional =
    getDevotional(day);

  if (!devotional) {
    alert(
      "Este devocional ainda não está disponível."
    );

    return;
  }

  state.currentDay =
    getDayNumber(devotional);

  saveCurrentDay();

  renderDevotional(
    devotional
  );

  showScreen("devotional");

  prepareDevotionalAudio(
    devotional
  );
}

function renderDevotional(
  devotional
) {
  const day =
    getDayNumber(devotional);

  const theme =
    getThemeForDay(day);

  setText(
    "devotional-day",
    `DIA ${formatDay(day)}`
  );

  setText(
    "devotional-title",
    devotional.titulo
  );

  setText(
    "devotional-subtitle",
    devotional.subtitulo ||
    devotional.introducao ||
    ""
  );

  setText(
    "devotional-theme",
    theme
      ? theme.titulo || theme.nome
      : devotional.tema || ""
  );

  setText(
    "devotional-reference",
    getReferenceText(devotional)
  );

  renderContent(
    "devotional-reading",
    getReadingText(devotional)
  );

  renderContent(
    "devotional-context",
    devotional.contexto_biblico
  );

  renderContent(
    "devotional-exposition",
    devotional.exposicao_biblica
  );

  renderContent(
    "devotional-exegesis",
    devotional.exegese
  );

  renderContent(
    "devotional-theology",
    devotional.comentario_teologico
  );

  renderContent(
    "devotional-reflection",
    devotional.reflexao
  );

  renderContent(
    "devotional-contemplation",
    devotional.contemplacao_teologica
  );

  renderContent(
    "devotional-practice",
    devotional.aplicacao_pratica
  );

  renderListContent(
    "devotional-questions",
    devotional.perguntas_interiorizacao
  );

  renderDevotionalJournal(
    day,
    devotional
  );

  renderRelatedReferences(
    devotional.referencias_relacionadas
  );

  renderContent(
    "devotional-prayer",
    devotional.oracao
  );

  updateDevotionalAudio(
    devotional
  );
}

function getReferenceText(
  devotional
) {
  const reading =
    devotional.leitura_biblica;

  return (
    reading?.referencia ||
    devotional.referencia_principal ||
    devotional.referencia ||
    ""
  );
}

function getReadingText(
  devotional
) {
  const reading =
    devotional.leitura_biblica;

  if (
    typeof reading === "string"
  ) {
    return reading;
  }

  if (
    reading &&
    typeof reading === "object"
  ) {
    return (
      reading.texto ||
      reading.text ||
      reading.conteudo ||
      reading.content ||
      reading.referencia ||
      ""
    );
  }

  return "";
}

function renderContent(
  elementId,
  value
) {
  const container =
    byId(elementId);

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const text =
    normalizeText(value);

  if (!text.trim()) {
    container.innerHTML =
      "<p>Conteúdo em preparação.</p>";

    return;
  }

  text
    .split(/\n{2,}|\n/)
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(
      paragraph => {
        const p =
          document.createElement("p");

        p.textContent =
          paragraph;

        container.appendChild(p);
      }
    );
}

function renderListContent(
  elementId,
  value
) {
  const container =
    byId(elementId);

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const items =
    Array.isArray(value)
      ? value
      : normalizeText(value)
          .split(/\n+/)
          .filter(Boolean);

  if (!items.length) {
    container.innerHTML =
      "<p>As perguntas serão apresentadas neste espaço.</p>";

    return;
  }

  const list =
    document.createElement("ol");

  items.forEach(
    item => {
      const li =
        document.createElement("li");

      li.textContent =
        normalizeText(item);

      list.appendChild(li);
    }
  );

  container.appendChild(list);
}

function renderRelatedReferences(
  references
) {
  const container =
    byId("devotional-related");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const items =
    Array.isArray(references)
      ? references
      : normalizeText(references)
          .split(/\n+/)
          .filter(Boolean);

  if (!items.length) {
    container.innerHTML =
      "<p>As referências relacionadas aparecerão aqui.</p>";

    return;
  }

  items.forEach(
    reference => {
      const p =
        document.createElement("p");

      p.textContent =
        normalizeText(reference);

      container.appendChild(p);
    }
  );
}

/* =========================================================
   DIÁRIO DO DEVOCIONAL
   ========================================================= */

function renderDevotionalJournal(
  day
) {
  const container =
    byId("devotional-journal");

  if (!container) {
    return;
  }

  const saved =
    state.journal[day] || "";

  container.innerHTML = `
    <textarea
      id="devotional-journal-input"
      class="journal-textarea"
      placeholder="Escreva aquilo que você percebeu, sentiu, compreendeu ou decidiu neste dia..."
    ></textarea>
  `;

  const textarea =
    byId(
      "devotional-journal-input"
    );

  if (textarea) {
    textarea.value = saved;

    textarea.addEventListener(
      "input",
      () => {
        state.journal[day] =
          textarea.value;

        saveJournalState();
      }
    );
  }
}

function saveDevotionalJournal() {
  const day =
    getCurrentDay();

  const textarea =
    byId(
      "devotional-journal-input"
    );

  if (!textarea) {
    return;
  }

  state.journal[day] =
    textarea.value;

  saveJournalState();
}

/* =========================================================
   CONCLUSÃO DO DIA
   ========================================================= */

function completeCurrentDay() {
  saveDevotionalJournal();

  const day =
    getCurrentDay();

  if (
    !state.completedDays.includes(
      day
    )
  ) {
    state.completedDays.push(day);
  }

  saveCompletedDays();
  updateProgress();
  updateProfile();
  renderJourney();
  renderHome();

  alert(
    `Dia ${formatDay(day)} concluído.`
  );
}

/* =========================================================
   PROGRESSO
   ========================================================= */

function updateProgress() {
  const completed =
    state.completedDays.length;

  const percent =
    Math.round(
      (completed /
        APP_CONFIG.totalDays) *
      100
    );

  setText(
    "home-progress-percent",
    `${percent}%`
  );

  setWidth(
    "home-progress-bar",
    percent
  );

  setText(
    "journey-progress-percent",
    `${percent}%`
  );

  setWidth(
    "journey-progress-bar",
    percent
  );
}

function updateProfile() {
  const completed =
    state.completedDays.length;

  const percent =
    Math.round(
      (completed /
        APP_CONFIG.totalDays) *
      100
    );

  setText(
    "profile-day",
    getCurrentDay()
  );

  setText(
    "profile-completed-days",
    completed
  );

  setText(
    "profile-journey-percent",
    `${percent}%`
  );

  setText(
    "profile-progress-text",
    `${percent}% concluído`
  );

  setWidth(
    "profile-progress-bar",
    percent
  );
}

/* =========================================================
   BÍBLIA
   ========================================================= */

function renderBibleBooks() {
  const select =
    byId("bible-book");

  if (!select) {
    return;
  }

  select.innerHTML =
    `<option value="">Selecione um livro</option>`;

  state.bible.forEach(
    (book, index) => {
      const option =
        document.createElement("option");

      option.value =
        String(index);

      option.textContent =
        book.nome ||
        book.name;

      select.appendChild(option);
    }
  );
}

function populateBibleChapters(
  bookIndex
) {
  const chapterSelect =
    byId("bible-chapter");

  if (!chapterSelect) {
    return;
  }

  chapterSelect.innerHTML =
    `<option value="">Selecione um capítulo</option>`;

  if (
    bookIndex === "" ||
    bookIndex === null ||
    bookIndex === undefined
  ) {
    return;
  }

  const book =
    state.bible[
      Number(bookIndex)
    ];

  if (!book) {
    return;
  }

  book.chapters.forEach(
    (chapter, index) => {
      const option =
        document.createElement("option");

      const number =
        chapter.number ||
        chapter.numero ||
        index + 1;

      option.value =
        String(index);

      option.textContent =
        `Capítulo ${number}`;

      chapterSelect.appendChild(
        option
      );
    }
  );
}

function openBibleChapter() {
  const bookSelect =
    byId("bible-book");

  const chapterSelect =
    byId("bible-chapter");

  if (
    !bookSelect ||
    !chapterSelect
  ) {
    return;
  }

  if (
    bookSelect.value === "" ||
    chapterSelect.value === ""
  ) {
    return;
  }

  const book =
    state.bible[
      Number(bookSelect.value)
    ];

  const chapter =
    book?.chapters[
      Number(chapterSelect.value)
    ];

  if (!book || !chapter) {
    return;
  }

  state.currentBibleBook =
    Number(bookSelect.value);

  state.currentBibleChapter =
    Number(chapterSelect.value);

  renderBibleChapter(
    book,
    chapter
  );
}

function renderBibleChapter(
  book,
  chapter
) {
  const title =
    byId("bible-reader-title");

  const content =
    byId("bible-reader-content");

  if (!title || !content) {
    return;
  }

  const chapterNumber =
    chapter.number ||
    chapter.numero ||
    "";

  title.textContent =
    `${book.nome || book.name} ${chapterNumber}`;

  content.innerHTML = "";

  const verses =
    chapter.verses ||
    chapter.versiculos ||
    [];

  if (!verses.length) {
    content.innerHTML =
      "<p>O texto deste capítulo ainda não está disponível.</p>";

    return;
  }

  verses.forEach(
    verse => {
      const wrapper =
        document.createElement("p");

      wrapper.className =
        "bible-verse";

      const number =
        verse.number ||
        verse.numero ||
        "";

      const text =
        verse.text ||
        verse.texto ||
        "";

      wrapper.innerHTML = `
        <sup>${escapeHTML(number)}</sup>
        ${escapeHTML(text)}
      `;

      content.appendChild(
        wrapper
      );
    }
  );
}

function searchBible(query) {
  const container =
    byId("bible-search-results");

  if (!container) {
    return;
  }

  const term =
    String(query || "")
      .trim()
      .toLowerCase();

  container.innerHTML = "";

  if (term.length < 2) {
    return;
  }

  const results = [];

  state.bible.forEach(
    (book, bookIndex) => {
      book.chapters.forEach(
        (chapter, chapterIndex) => {
          chapter.verses.forEach(
            verse => {
              const text =
                verse.text ||
                "";

              if (
                text
                  .toLowerCase()
                  .includes(term)
              ) {
                results.push({
                  book,
                  bookIndex,
                  chapter,
                  chapterIndex,
                  verse
                });
              }
            }
          );
        }
      );
    }
  );

  results
    .slice(0, 50)
    .forEach(
      result => {
        const article =
          document.createElement("article");

        article.className =
          "search-result-card";

        article.innerHTML = `
          <strong>
            ${escapeHTML(
              result.book.nome ||
              result.book.name
            )}
            ${
              result.chapter.number ||
              result.chapter.numero
            }:
            ${
              result.verse.number ||
              result.verse.numero
            }
          </strong>

          <p>
            ${escapeHTML(
              result.verse.text
            )}
          </p>
        `;

        article.addEventListener(
          "click",
          () => {
            showScreen("bible");

            const bookSelect =
              byId("bible-book");

            if (bookSelect) {
              bookSelect.value =
                String(
                  result.bookIndex
                );

              populateBibleChapters(
                result.bookIndex
              );
            }

            const chapterSelect =
              byId("bible-chapter");

            if (chapterSelect) {
              chapterSelect.value =
                String(
                  result.chapterIndex
                );
            }

            renderBibleChapter(
              result.book,
              result.chapter
            );
          }
        );

        container.appendChild(
          article
        );
      }
    );

  if (!results.length) {
    container.innerHTML =
      "<p>Nenhum resultado encontrado.</p>";
  }
}

/* =========================================================
   ESTUDOS
   ========================================================= */

function renderStudies() {
  renderStudyCollection(
    "biblical",
    "biblical-studies-grid"
  );

  renderStudyCollection(
    "theological",
    "theological-studies-grid"
  );
}

function isTheologicalStudy(
  study
) {
  const category =
    String(
      study.categoria ||
      study.tipo ||
      ""
    ).toLowerCase();

  return (
    category.includes("theolog") ||
    category.includes("teolog")
  );
}

function renderStudyCollection(
  type,
  elementId
) {
  const container =
    byId(elementId);

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const studies =
    state.studies.filter(
      study =>
        type === "theological"
          ? isTheologicalStudy(study)
          : !isTheologicalStudy(study)
    );

  if (!studies.length) {
    container.innerHTML =
      "<p>Os estudos desta área serão disponibilizados aqui.</p>";

    return;
  }

  studies.forEach(
    study => {
      const card =
        document.createElement("article");

      card.className =
        "study-card";

      card.innerHTML = `
        <p class="section-kicker">
          ${escapeHTML(
            study.categoria ||
            study.tipo ||
            type
          )}
        </p>

        <h3>
          ${escapeHTML(
            study.titulo
          )}
        </h3>

        <p>
          ${escapeHTML(
            study.descricao
          )}
        </p>

        ${
          study.tempo_estimado_minutos
            ? `
              <small>
                ${study.tempo_estimado_minutos}
                minutos
              </small>
            `
            : ""
        }

        <button
          class="secondary-button"
          type="button">
          ABRIR ESTUDO
        </button>
      `;

      card
        .querySelector("button")
        ?.addEventListener(
          "click",
          () => openStudy(study)
        );

      container.appendChild(card);
    }
  );
}

function switchStudyType(
  type
) {
  $$(".study-tab").forEach(
    tab => {
      tab.classList.toggle(
        "is-active",
        tab.dataset.studyType === type
      );
    }
  );

  byId(
    "biblical-studies-panel"
  )?.classList.toggle(
    "is-hidden",
    type !== "biblical"
  );

  byId(
    "theological-studies-panel"
  )?.classList.toggle(
    "is-hidden",
    type !== "theological"
  );
}

function openStudy(study) {
  state.currentStudy =
    study;

  const reader =
    byId("study-reader");

  if (!reader) {
    return;
  }

  setText(
    "study-reader-category",
    study.categoria ||
    study.tipo ||
    "ESTUDO"
  );

  setText(
    "study-reader-title",
    study.titulo
  );

  const content =
    byId("study-reader-content");

  if (content) {
    content.innerHTML = "";

    const fields = [
      ["Descrição", study.descricao],
      ["Contexto", study.contexto],
      ["Conteúdo", study.conteudo],
      ["Exegese", study.exegese],
      [
        "Comentário teológico",
        study.comentario_teologico
      ]
    ];

    fields.forEach(
      ([title, value]) => {
        if (!value) {
          return;
        }

        const section =
          document.createElement("section");

        section.innerHTML = `
          <h4>${escapeHTML(title)}</h4>
        `;

        const body =
          document.createElement("div");

        body.className =
          "reader-content-body";

        body.textContent =
          normalizeText(value);

        section.appendChild(body);

        content.appendChild(section);
      }
    );
  }

  reader.classList.remove(
    "is-hidden"
  );

  reader.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* =========================================================
   PLANOS
   ========================================================= */

function renderPlans() {
  const container =
    byId("plans-grid");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!state.plans.length) {
    container.innerHTML =
      "<p>Nenhum plano disponível.</p>";

    return;
  }

  state.plans.forEach(
    plan => {
      const card =
        document.createElement("article");

      card.className =
        "plan-card";

      card.innerHTML = `
        <p class="section-kicker">
          ${
            plan.duracao
              ? `${plan.duracao} DIAS`
              : "PLANO"
          }
        </p>

        <h3>
          ${escapeHTML(
            plan.titulo
          )}
        </h3>

        <p>
          ${escapeHTML(
            plan.descricao
          )}
        </p>

        <button
          class="secondary-button"
          type="button">
          ABRIR PLANO
        </button>
      `;

      card
        .querySelector("button")
        ?.addEventListener(
          "click",
          () => openPlan(plan)
        );

      container.appendChild(card);
    }
  );
}

function openPlan(plan) {
  state.currentPlan =
    plan;

  const reader =
    byId("plan-reader");

  if (!reader) {
    return;
  }

  setText(
    "plan-reader-kicker",
    plan.duracao
      ? `${plan.duracao} DIAS`
      : "PLANO DE LEITURA"
  );

  setText(
    "plan-reader-title",
    plan.titulo
  );

  setText(
    "plan-reader-description",
    plan.descricao
  );

  const daysContainer =
    byId("plan-reader-days");

  if (!daysContainer) {
    return;
  }

  daysContainer.innerHTML = "";

  const days =
    plan.dias || [];

  if (!days.length) {
    daysContainer.innerHTML =
      "<p>As etapas deste plano serão disponibilizadas aqui.</p>";

    reader.classList.remove(
      "is-hidden"
    );

    return;
  }

  days.forEach(
    (day, index) => {
      const item =
        document.createElement("article");

      item.className =
        "plan-day-card";

      const number =
        normalizeNumber(
          day.dia ||
          day.day ||
          day.numero,
          index + 1
        );

      const references =
        day.referencias ||
        day.referencia ||
        day.reference ||
        day.leitura ||
        day.reading ||
        "";

      item.innerHTML = `
        <p class="section-kicker">
          DIA ${formatDay(number)}
        </p>

        <h4>
          ${escapeHTML(
            normalizeText(
              references
            )
          )}
        </h4>

        ${
          day.descricao ||
          day.description
            ? `
              <p>
                ${escapeHTML(
                  day.descricao ||
                  day.description
                )}
              </p>
            `
            : ""
        }
      `;

      daysContainer.appendChild(
        item
      );
    }
  );

  reader.classList.remove(
    "is-hidden"
  );

  reader.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

/* =========================================================
   DIÁRIO
   ========================================================= */

function renderJournalSelector() {
  const select =
    byId("journal-day");

  if (!select) {
    return;
  }

  const current =
    select.value ||
    String(getCurrentDay());

  select.innerHTML = "";

  for (
    let day = 1;
    day <= APP_CONFIG.totalDays;
    day++
  ) {
    const option =
      document.createElement("option");

    option.value =
      String(day);

    option.textContent =
      `Dia ${formatDay(day)}`;

    select.appendChild(option);
  }

  select.value =
    current;

  loadJournalDay(
    Number(current)
  );

  renderJournalHistory();
}

function loadJournalDay(day) {
  const textarea =
    byId("journal-entry");

  if (!textarea) {
    return;
  }

  textarea.value =
    state.journal[day] || "";
}

function saveJournal() {
  const select =
    byId("journal-day");

  const textarea =
    byId("journal-entry");

  const status =
    byId("journal-save-status");

  if (!select || !textarea) {
    return;
  }

  const day =
    Number(select.value);

  state.journal[day] =
    textarea.value;

  saveJournalState();

  if (status) {
    status.textContent =
      "Reflexão salva.";
  }

  renderJournalHistory();
}

function renderJournalHistory() {
  const container =
    byId("journal-history-list");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const entries =
    Object.entries(
      state.journal
    )
      .filter(
        ([, text]) =>
          String(text).trim()
      )
      .sort(
        ([a], [b]) =>
          Number(a) - Number(b)
      );

  if (!entries.length) {
    container.innerHTML =
      "<p>Seu diário ainda não possui registros.</p>";

    return;
  }

  entries.forEach(
    ([day, text]) => {
      const article =
        document.createElement("article");

      article.className =
        "journal-history-card";

      article.innerHTML = `
        <p class="section-kicker">
          DIA ${formatDay(day)}
        </p>

        <p>
          ${escapeHTML(text)}
        </p>
      `;

      article.addEventListener(
        "click",
        () => {
          const select =
            byId("journal-day");

          if (select) {
            select.value =
              String(day);
          }

          loadJournalDay(
            Number(day)
          );
        }
      );

      container.appendChild(
        article
      );
    }
  );
}

/* =========================================================
   FAVORITOS
   ========================================================= */

function toggleFavorite(day) {
  const number =
    Number(day);

  if (
    state.favorites.includes(
      number
    )
  ) {
    state.favorites =
      state.favorites.filter(
        item => item !== number
      );
  } else {
    state.favorites.push(number);
  }

  saveFavorites();
  renderFavorites();
}

function renderFavorites() {
  const container =
    byId("favorites-list");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!state.favorites.length) {
    container.innerHTML =
      "<p>Você ainda não salvou nenhum devocional.</p>";

    return;
  }

  state.favorites
    .sort((a, b) => a - b)
    .forEach(
      day => {
        const devotional =
          getDevotional(day);

        if (!devotional) {
          return;
        }

        const article =
          document.createElement("article");

        article.className =
          "favorite-card";

        article.innerHTML = `
          <p class="section-kicker">
            DIA ${formatDay(day)}
          </p>

          <h3>
            ${escapeHTML(
              devotional.titulo
            )}
          </h3>

          <button
            class="secondary-button"
            type="button">
            ABRIR
          </button>

          <button
            class="secondary-button"
            type="button">
            REMOVER
          </button>
        `;

        const buttons =
          article.querySelectorAll(
            "button"
          );

        buttons[0]?.addEventListener(
          "click",
          () => openDevotional(day)
        );

        buttons[1]?.addEventListener(
          "click",
          () => toggleFavorite(day)
        );

        container.appendChild(
          article
        );
      }
    );
}

/* =========================================================
   PESQUISA GERAL
   ========================================================= */

function performGlobalSearch(
  query
) {
  const container =
    byId("search-results");

  if (!container) {
    return;
  }

  const term =
    String(query || "")
      .trim()
      .toLowerCase();

  container.innerHTML = "";

  if (term.length < 2) {
    return;
  }

  const results = [];

  state.devotionals.forEach(
    devotional => {
      const searchable =
        [
          devotional.titulo,
          devotional.tema,
          devotional.introducao,
          devotional.contexto_biblico,
          devotional.exposicao_biblica,
          devotional.exegese,
          devotional.reflexao,
          devotional.comentario_teologico
        ]
          .map(normalizeText)
          .join(" ")
          .toLowerCase();

      if (
        searchable.includes(term)
      ) {
        results.push({
          type: "devotional",
          day: devotional.dia,
          title: devotional.titulo,
          description:
            devotional.introducao
        });
      }
    }
  );

  state.studies.forEach(
    study => {
      const searchable =
        [
          study.titulo,
          study.descricao,
          study.conteudo,
          study.contexto,
          study.exegese
        ]
          .map(normalizeText)
          .join(" ")
          .toLowerCase();

      if (
        searchable.includes(term)
      ) {
        results.push({
          type: "study",
          study,
          title: study.titulo,
          description:
            study.descricao
        });
      }
    }
  );

  results
    .slice(0, 50)
    .forEach(
      result => {
        const article =
          document.createElement("article");

        article.className =
          "search-result-card";

        article.innerHTML = `
          <p class="section-kicker">
            ${
              result.type ===
              "devotional"
                ? `DIA ${formatDay(
                    result.day
                  )}`
                : "ESTUDO"
            }
          </p>

          <h3>
            ${escapeHTML(
              result.title
            )}
          </h3>

          <p>
            ${escapeHTML(
              normalizeText(
                result.description
              )
            )}
          </p>
        `;

        article.addEventListener(
          "click",
          () => {
            if (
              result.type ===
              "devotional"
            ) {
              openDevotional(
                result.day
              );
            } else {
              showScreen("studies");
              openStudy(
                result.study
              );
            }
          }
        );

        container.appendChild(
          article
        );
      }
    );

  if (!results.length) {
    container.innerHTML =
      "<p>Nenhum conteúdo encontrado.</p>";
  }
}

/* =========================================================
   ÁUDIO
   ========================================================= */

function getAudioSource(
  devotional
) {
  const audio =
    devotional.audio;

  if (
    typeof audio === "string" &&
    audio.trim()
  ) {
    return audio.trim();
  }

  if (
    audio &&
    typeof audio === "object"
  ) {
    return (
      audio.src ||
      audio.url ||
      audio.path ||
      ""
    );
  }

  return `audio/dia-${formatDay(
    devotional.dia
  )}.mp3`;
}

function prepareDevotionalAudio(
  devotional
) {
  const src =
    getAudioSource(devotional);

  const globalAudio =
    byId("global-audio");

  if (
    !globalAudio ||
    !src
  ) {
    return;
  }

  state.audio.day =
    devotional.dia;

  state.audio.src =
    src;

  state.audio.title =
    devotional.titulo;

  globalAudio.src =
    src;

  globalAudio.load();

  setText(
    "global-audio-title",
    devotional.titulo
  );

  setText(
    "global-audio-day",
    `Dia ${formatDay(
      devotional.dia
    )}`
  );

  byId(
    "global-audio-player"
  )?.classList.remove(
    "is-hidden"
  );

  if (
    state.settings.autoplay
  ) {
    globalAudio.play().catch(
      () => {}
    );
  }
}

function updateDevotionalAudio(
  devotional
) {
  const audio =
    byId("devotional-audio");

  const status =
    byId("devotional-audio-status");

  if (!audio) {
    return;
  }

  const src =
    getAudioSource(devotional);

  audio.src =
    src;

  if (status) {
    status.textContent =
      `Áudio previsto para o Dia ${formatDay(
        devotional.dia
      )}.`;
  }
}

/* =========================================================
   ASSISTENTE
   ========================================================= */

function sendAIQuestion() {
  const input =
    byId("ai-input");

  const messages =
    byId("ai-messages");

  if (!input || !messages) {
    return;
  }

  const question =
    input.value.trim();

  if (!question) {
    return;
  }

  appendAIMessage(
    question,
    "user"
  );

  input.value = "";

  const answer =
    generateStudyResponse(
      question
    );

  setTimeout(
    () => {
      appendAIMessage(
        answer,
        "system"
      );
    },
    300
  );
}

function appendAIMessage(
  text,
  type
) {
  const messages =
    byId("ai-messages");

  if (!messages) {
    return;
  }

  const message =
    document.createElement("div");

  message.className =
    `ai-message ai-message-${type}`;

  const p =
    document.createElement("p");

  p.textContent =
    text;

  message.appendChild(p);

  messages.appendChild(
    message
  );

  messages.scrollTop =
    messages.scrollHeight;
}

function generateStudyResponse(
  question
) {
  const q =
    question.toLowerCase();

  if (
    q.includes("joão 14") ||
    q.includes("joao 14")
  ) {
    return (
      "João 14 deve ser lido dentro do discurso de despedida de Jesus. " +
      "Observe especialmente a relação entre amor, obediência, permanência, " +
      "a promessa da presença divina e a esperança oferecida aos discípulos. " +
      "Para um estudo responsável, leia todo o capítulo antes de interpretar um versículo isoladamente."
    );
  }

  if (
    q.includes("oração") ||
    q.includes("orar")
  ) {
    return (
      "Comece pela passagem bíblica relacionada à sua pergunta. " +
      "Observe quem está falando, para quem, em qual contexto e qual é o movimento do texto. " +
      "Depois transforme aquilo que você compreendeu em oração, sem substituir a interpretação do texto pela experiência pessoal."
    );
  }

  if (
    q.includes("espírito santo") ||
    q.includes("espirito santo")
  ) {
    return (
      "No estudo desta jornada, procure perceber como a presença do Doce Espírito Santo " +
      "é apresentada nas Escrituras, especialmente nos textos que tratam de presença, " +
      "habitação, ensino, consolação, santificação e condução."
    );
  }

  return (
    "Para aprofundar essa questão, comece pelo texto bíblico relacionado ao tema. " +
    "Leia o contexto, observe as palavras-chave, identifique a intenção do autor, " +
    "compare passagens relacionadas e somente depois formule a aplicação pessoal. " +
    "A experiência espiritual deve caminhar junto com uma leitura responsável das Escrituras."
  );
}

/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

function updateSettingsUI() {
  const autoplay =
    byId("setting-autoplay");

  const persistent =
    byId("setting-persistent-audio");

  if (autoplay) {
    autoplay.checked =
      state.settings.autoplay;
  }

  if (persistent) {
    persistent.checked =
      state.settings.persistentAudio;
  }
}

/* =========================================================
   FUNÇÕES DE APOIO À INTERFACE
   ========================================================= */

function setText(
  id,
  value
) {
  const element =
    byId(id);

  if (!element) {
    return;
  }

  element.textContent =
    String(value ?? "");
}

function setWidth(
  id,
  percentage
) {
  const element =
    byId(id);

  if (!element) {
    return;
  }

  const value =
    clamp(
      normalizeNumber(
        percentage,
        0
      ),
      0,
      100
    );

  element.style.width =
    `${value}%`;
}

/* =========================================================
   SERVICE WORKER
   ========================================================= */

function registerServiceWorker() {
  if (
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  window.addEventListener(
    "load",
    () => {
      navigator.serviceWorker
        .register(
          APP_CONFIG.serviceWorker
        )
        .then(
          registration => {
            console.log(
              "Service Worker registrado:",
              registration.scope
            );

            registration.update().catch(
              () => {}
            );
          }
        )
        .catch(
          error => {
            console.warn(
              "Falha ao registrar o Service Worker:",
              error
            );
          }
        );
    }
  );
}

/* =========================================================
   PROTEÇÃO DE NAVE
