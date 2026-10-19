/* =========================================================
   DOCE ESPÍRITO SANTO — UM AMIGO ÍNTIMO
   APP.JS
   Arquitetura principal do aplicativo
   ========================================================= */

"use strict";


/* =========================================================
   01. CONFIGURAÇÃO
   ========================================================= */

const CONFIG = {
  totalDays: 365,

  files: {
    devotionals: "devocionais.json",
    themes: "temas.json",
    bible: "biblia.json",
    studies: "estudos.json",
    plans: "planos.json"
  },

  audioFolder: "audio/",

  storageKeys: {
    currentDay: "des_current_day",
    completedDays: "des_completed_days",
    journal: "des_journal",
    favorites: "des_favorites",
    settings: "des_settings",
    manualSeen: "des_manual_seen",
    lastAudio: "des_last_audio"
  }
};


/* =========================================================
   02. ESTADO
   ========================================================= */

const state = {

  currentScreen: "home",

  currentDay: 1,

  currentStudyType: "biblical",

  currentStudy: null,

  currentPlan: null,

  currentBibleBook: null,

  currentBibleChapter: null,

  devotionals: [],

  themes: [],

  bible: null,

  studies: [],

  plans: [],

  completedDays: [],

  journal: {},

  favorites: [],

  settings: {
    autoplay: false,
    persistentAudio: true
  },

  audio: {
    currentDay: null,
    playing: false,
    source: null
  }

};


/* =========================================================
   03. REFERÊNCIAS DOM
   ========================================================= */

const $ = (selector) =>
  document.querySelector(selector);

const $$ = (selector) =>
  Array.from(document.querySelectorAll(selector));


/* =========================================================
   04. INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});


async function initializeApp() {

  loadLocalState();

  bindStaticEvents();

  await loadAllContent();

  initializeSplash();

  initializeAppInterface();

  registerServiceWorker();

}


/* =========================================================
   05. ESTADO LOCAL
   ========================================================= */

function loadLocalState() {

  try {

    const currentDay =
      localStorage.getItem(
        CONFIG.storageKeys.currentDay
      );

    if (currentDay) {
      state.currentDay =
        Math.min(
          Math.max(
            Number(currentDay),
            1
          ),
          CONFIG.totalDays
        );
    }


    const completed =
      localStorage.getItem(
        CONFIG.storageKeys.completedDays
      );

    if (completed) {
      const parsed =
        JSON.parse(completed);

      if (Array.isArray(parsed)) {
        state.completedDays =
          parsed.map(Number)
            .filter(
              day =>
                day >= 1 &&
                day <= CONFIG.totalDays
            );
      }
    }


    const journal =
      localStorage.getItem(
        CONFIG.storageKeys.journal
      );

    if (journal) {

      const parsed =
        JSON.parse(journal);

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        state.journal = parsed;
      }

    }


    const favorites =
      localStorage.getItem(
        CONFIG.storageKeys.favorites
      );

    if (favorites) {

      const parsed =
        JSON.parse(favorites);

      if (Array.isArray(parsed)) {
        state.favorites = parsed;
      }

    }


    const settings =
      localStorage.getItem(
        CONFIG.storageKeys.settings
      );

    if (settings) {

      const parsed =
        JSON.parse(settings);

      if (
        parsed &&
        typeof parsed === "object"
      ) {
        state.settings = {
          ...state.settings,
          ...parsed
        };
      }

    }

  } catch (error) {

    console.warn(
      "Não foi possível carregar os dados locais.",
      error
    );

  }

}


/* =========================================================
   06. SALVAMENTO LOCAL
   ========================================================= */

function saveLocalState() {

  try {

    localStorage.setItem(
      CONFIG.storageKeys.currentDay,
      String(state.currentDay)
    );

    localStorage.setItem(
      CONFIG.storageKeys.completedDays,
      JSON.stringify(
        state.completedDays
      )
    );

    localStorage.setItem(
      CONFIG.storageKeys.journal,
      JSON.stringify(
        state.journal
      )
    );

    localStorage.setItem(
      CONFIG.storageKeys.favorites,
      JSON.stringify(
        state.favorites
      )
    );

    localStorage.setItem(
      CONFIG.storageKeys.settings,
      JSON.stringify(
        state.settings
      )
    );

  } catch (error) {

    console.warn(
      "Não foi possível salvar o estado.",
      error
    );

  }

}


/* =========================================================
   07. CARREGAMENTO DOS ARQUIVOS
   ========================================================= */

async function loadAllContent() {

  showInitialLoadingState();

  const results =
    await Promise.allSettled([

      loadJSON(
        CONFIG.files.devotionals,
        "devocionais"
      ),

      loadJSON(
        CONFIG.files.themes,
        "temas"
      ),

      loadJSON(
        CONFIG.files.bible,
        "biblia"
      ),

      loadJSON(
        CONFIG.files.studies,
        "estudos"
      ),

      loadJSON(
        CONFIG.files.plans,
        "planos"
      )

    ]);


  const [
    devotionalsResult,
    themesResult,
    bibleResult,
    studiesResult,
    plansResult
  ] = results;


  if (
    devotionalsResult.status === "fulfilled"
  ) {

    state.devotionals =
      normalizeDevotionals(
        devotionalsResult.value
      );

  }


  if (
    themesResult.status === "fulfilled"
  ) {

    state.themes =
      normalizeThemes(
        themesResult.value
      );

  }


  if (
    bibleResult.status === "fulfilled"
  ) {

    state.bible =
      normalizeBible(
        bibleResult.value
      );

  }


  if (
    studiesResult.status === "fulfilled"
  ) {

    state.studies =
      normalizeStudies(
        studiesResult.value
      );

  }


  if (
    plansResult.status === "fulfilled"
  ) {

    state.plans =
      normalizePlans(
        plansResult.value
      );

  }


  console.log(
    "Conteúdo carregado:",
    {
      devotionals:
        state.devotionals.length,

      themes:
        state.themes.length,

      bible:
        state.bible
          ? "disponível"
          : "não disponível",

      studies:
        state.studies.length,

      plans:
        state.plans.length
    }
  );

}


/* =========================================================
   08. FETCH JSON
   ========================================================= */

async function loadJSON(
  file,
  label
) {

  const response =
    await fetch(
      `${file}?v=10`,
      {
        cache: "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      `Falha ao carregar ${label}: ${response.status}`
    );

  }


  return await response.json();

}


/* =========================================================
   09. NORMALIZAÇÃO DOS DEVOCIONAIS
   ========================================================= */

function normalizeDevotionals(data) {

  if (Array.isArray(data)) {
    return data;
  }


  if (
    data &&
    Array.isArray(data.days)
  ) {
    return data.days;
  }


  if (
    data &&
    Array.isArray(data.devocionais)
  ) {
    return data.devocionais;
  }


  return [];

}


function getDevotionalNumber(
  devotional
) {

  return Number(
    devotional?.dia ??
    devotional?.day ??
    devotional?.number ??
    0
  );

}


function getDevotionalByDay(
  day
) {

  return state.devotionals.find(
    devotional =>
      getDevotionalNumber(
        devotional
      ) === Number(day)
  ) || null;

}


function getCurrentDevotional() {

  return getDevotionalByDay(
    state.currentDay
  );

}


/* =========================================================
   10. NORMALIZAÇÃO DOS TEMAS
   ========================================================= */

function normalizeThemes(data) {

  if (Array.isArray(data)) {
    return data;
  }


  if (
    data &&
    Array.isArray(data.themes)
  ) {
    return data.themes;
  }


  if (
    data &&
    Array.isArray(data.temas)
  ) {
    return data.temas;
  }


  return [];

}


/* =========================================================
   11. NORMALIZAÇÃO DA BÍBLIA
   ========================================================= */

function normalizeBible(data) {

  if (!data) {
    return null;
  }


  if (Array.isArray(data)) {
    return {
      version:
        "Almeida 1911",
      books:
        data
    };
  }


  if (
    Array.isArray(data.books)
  ) {

    return {
      version:
        data.version ||
        data.versao ||
        "Almeida 1911",

      books:
        data.books
    };

  }


  if (
    Array.isArray(data.livros)
  ) {

    return {
      version:
        data.version ||
        data.versao ||
        "Almeida 1911",

      books:
        data.livros
    };

  }


  return data;

}


/* =========================================================
   12. NORMALIZAÇÃO DOS ESTUDOS
   ========================================================= */

function normalizeStudies(data) {

  if (Array.isArray(data)) {
    return data;
  }


  if (
    data &&
    Array.isArray(data.estudos)
  ) {
    return data.estudos;
  }


  if (
    data &&
    Array.isArray(data.studies)
  ) {
    return data.studies;
  }


  return [];

}


/* =========================================================
   13. NORMALIZAÇÃO DOS PLANOS
   ========================================================= */

function normalizePlans(data) {

  if (Array.isArray(data)) {
    return data;
  }


  if (
    data &&
    Array.isArray(data.planos)
  ) {
    return data.planos;
  }


  if (
    data &&
    Array.isArray(data.plans)
  ) {
    return data.plans;
  }


  return [];

}


/* =========================================================
   14. SPLASH
   ========================================================= */

function initializeSplash() {

  const splash =
    $("#splash-screen");

  const app =
    $("#app-shell");

  const startButton =
    $("#startApp");


  if (!splash || !app) {
    return;
  }


  const manualSeen =
    localStorage.getItem(
      CONFIG.storageKeys.manualSeen
    );


  app.classList.add(
    "is-hidden"
  );

  splash.classList.remove(
    "is-hidden"
  );


  if (startButton) {

    startButton.addEventListener(
      "click",
      () => {

        splash.classList.add(
          "is-hidden"
        );

        app.classList.remove(
          "is-hidden"
        );


        setTimeout(
          () => {

            if (
              manualSeen === "true"
            ) {

              showScreen(
                "home"
              );

            } else {

              showScreen(
                "manual"
              );

            }

          },
          350
        );

      },
      {
        once: true
      }
    );

  }

}


/* =========================================================
   15. INTERFACE INICIAL
   ========================================================= */

function initializeAppInterface() {

  updateAllUI();

  renderThemes();

  renderJourney();

  renderBibleBooks();

  renderStudies();

  renderPlans();

  renderJournalHistory();

  renderFavorites();

  updateProfile();

  updateTodayCard();

  initializeSettings();

}


/* =========================================================
   16. EVENTOS ESTÁTICOS
   ========================================================= */

function bindStaticEvents() {


  /* ---------------------------------------------------------
     Navegação inferior
     --------------------------------------------------------- */

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


  /* ---------------------------------------------------------
     Botões com data-target
     --------------------------------------------------------- */

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


  /* ---------------------------------------------------------
     Começar jornada
     --------------------------------------------------------- */

  const manualStart =
    $("#manual-start-button");

  if (manualStart) {

    manualStart.addEventListener(
      "click",
      () => {

        localStorage.setItem(
          CONFIG.storageKeys.manualSeen,
          "true"
        );

        showScreen(
          "home"
        );

      }
    );

  }


  /* ---------------------------------------------------------
     Continuar jornada
     --------------------------------------------------------- */

  const continueJourney =
    $("#continue-journey");

  if (continueJourney) {

    continueJourney.addEventListener(
      "click",
      () => {

        showScreen(
          "journey"
        );

      }
    );

  }


  /* ---------------------------------------------------------
     Abrir devocional de hoje
     --------------------------------------------------------- */

  const openToday =
    $("#open-today");

  if (openToday) {

    openToday.addEventListener(
      "click",
      () => {

        openDevotional(
          state.currentDay
        );

      }
    );

  }


  /* ---------------------------------------------------------
     Abrir diário pelo devocional
     --------------------------------------------------------- */

  const devotionalJournal =
    $("#open-journal-from-devotional");

  if (devotionalJournal) {

    devotionalJournal.addEventListener(
      "click",
      () => {

        showScreen(
          "journal"
        );

        setTimeout(
          () => {

            const selector =
              $("#journal-day");

            if (selector) {
              selector.value =
                String(
                  state.currentDay
                );
            }

          },
          50
        );

      }
    );

  }


  /* ---------------------------------------------------------
     Completar devocional
     --------------------------------------------------------- */

  const completeButton =
    $("#complete-devotional");

  if (completeButton) {

    completeButton.addEventListener(
      "click",
      completeCurrentDay
    );

  }


  /* ---------------------------------------------------------
     Estudos
     --------------------------------------------------------- */

  $$(".study-tab").forEach(
    tab => {

      tab.addEventListener(
        "click",
        () => {

          const type =
            tab.dataset.studyType ||
            "biblical";

          switchStudyType(
            type
          );

        }
      );

    }
  );


  const closeStudy =
    $("#close-study-reader");

  if (closeStudy) {

    closeStudy.addEventListener(
      "click",
      () => {

        $("#study-reader")
          ?.classList.add(
            "is-hidden"
          );

      }
    );

  }


  /* ---------------------------------------------------------
     Planos
     --------------------------------------------------------- */

  const closePlan =
    $("#close-plan-reader");

  if (closePlan) {

    closePlan.addEventListener(
      "click",
      () => {

        $("#plan-reader")
          ?.classList.add(
            "is-hidden"
          );

      }
    );

  }


  /* ---------------------------------------------------------
     Bíblia
     --------------------------------------------------------- */

  const bibleBook =
    $("#bible-book");

  if (bibleBook) {

    bibleBook.addEventListener(
      "change",
      () => {

        state.currentBibleBook =
          bibleBook.value;

        renderBibleChapters();

      }
    );

  }


  const bibleChapter =
    $("#bible-chapter");

  if (bibleChapter) {

    bibleChapter.addEventListener(
      "change",
      () => {

        state.currentBibleChapter =
          bibleChapter.value;

      }
    );

  }


  const openChapter =
    $("#open-bible-chapter");

  if (openChapter) {

    openChapter.addEventListener(
      "click",
      openSelectedBibleChapter
    );

  }


  const bibleSearch =
    $("#bible-search-input");

  if (bibleSearch) {

    bibleSearch.addEventListener(
      "input",
      debounce(
        () => {

          searchBible(
            bibleSearch.value
          );

        },
        250
      )
    );

  }


  /* ---------------------------------------------------------
     Busca global
     --------------------------------------------------------- */

  const searchButton =
    $("#open-search");

  if (searchButton) {

    searchButton.addEventListener(
      "click",
      () => {

        showScreen(
          "search"
        );

        setTimeout(
          () => {

            $("#search-input")
              ?.focus();

          },
          100
        );

      }
    );

  }


  const globalSearch =
    $("#search-input");

  if (globalSearch) {

    globalSearch.addEventListener(
      "input",
      debounce(
        () => {

          searchEverything(
            globalSearch.value
          );

        },
        250
      )
    );

  }


  /* ---------------------------------------------------------
     Diário
     --------------------------------------------------------- */

  const journalDay =
    $("#journal-day");

  if (journalDay) {

    journalDay.addEventListener(
      "change",
      () => {

        loadJournalEntry(
          journalDay.value
        );

      }
    );

  }


  const saveJournalButton =
    $("#save-journal");

  if (saveJournalButton) {

    saveJournalButton.addEventListener(
      "click",
      saveJournalEntry
    );

  }


  /* ---------------------------------------------------------
     IA
     --------------------------------------------------------- */

  const aiSend =
    $("#ai-send");

  if (aiSend) {

    aiSend.addEventListener(
      "click",
      sendAIMessage
    );

  }


  const aiInput =
    $("#ai-input");

  if (aiInput) {

    aiInput.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter" &&
          !event.shiftKey
        ) {

          event.preventDefault();

          sendAIMessage();

        }

      }
    );

  }


  /* ---------------------------------------------------------
     Áudio global
     --------------------------------------------------------- */

  const globalAudio =
    $("#global-audio");

  if (globalAudio) {

    globalAudio.addEventListener(
      "play",
      () => {

        state.audio.playing =
          true;

      }
    );


    globalAudio.addEventListener(
      "pause",
      () => {

        state.audio.playing =
          false;

      }
    );


    globalAudio.addEventListener(
      "ended",
      () => {

        state.audio.playing =
          false;

      }
    );

  }


  const audioPlay =
    $("#global-audio-play");

  if (audioPlay) {

    audioPlay.addEventListener(
      "click",
      () => {

        globalAudio?.play();

      }
    );

  }


  const audioPause =
    $("#global-audio-pause");

  if (audioPause) {

    audioPause.addEventListener(
      "click",
      () => {

        globalAudio?.pause();

      }
    );

  }


  const audioSpeed =
    $("#global-audio-speed");

  if (audioSpeed) {

    audioSpeed.addEventListener(
      "change",
      () => {

        if (globalAudio) {

          globalAudio.playbackRate =
            Number(
              audioSpeed.value
            );

        }

      }
    );

  }


  /* ---------------------------------------------------------
     Configurações
     --------------------------------------------------------- */

  const autoplay =
    $("#setting-autoplay");

  if (autoplay) {

    autoplay.addEventListener(
      "change",
      () => {

        state.settings.autoplay =
          autoplay.checked;

        saveLocalState();

      }
    );

  }


  const persistentAudio =
    $("#setting-persistent-audio");

  if (persistentAudio) {

    persistentAudio.addEventListener(
      "change",
      () => {

        state.settings.persistentAudio =
          persistentAudio.checked;

        saveLocalState();

      }
    );

  }

}


/* =========================================================
   17. NAVEGAÇÃO
   ========================================================= */

function showScreen(
  screenName
) {

  const validScreens = [
    "manual",
    "home",
    "journey",
    "devotional",
    "bible",
    "studies",
    "plans",
    "journal",
    "favorites",
    "ai",
    "profile",
    "search"
  ];


  if (
    !validScreens.includes(
      screenName
    )
  ) {
    return;
  }


  $$(".screen").forEach(
    screen => {

      screen.classList.remove(
        "is-active"
      );

    }
  );


  const target =
    document.querySelector(
      `#screen-${screenName}`
    );


  if (!target) {
    return;
  }


  target.classList.add(
    "is-active"
  );


  state.currentScreen =
    screenName;


  $$(".nav-button").forEach(
    button => {

      button.classList.toggle(
        "is-active",
        button.dataset.screen ===
          screenName
      );

    }
  );


  if (
    screenName === "home"
  ) {

    updateTodayCard();

  }


  if (
    screenName === "journey"
  ) {

    renderJourney();

  }


  if (
    screenName === "bible"
  ) {

    renderBibleBooks();

  }


  if (
    screenName === "studies"
  ) {

    renderStudies();

  }


  if (
    screenName === "plans"
  ) {

    renderPlans();

  }


  if (
    screenName === "journal"
  ) {

    renderJournalHistory();

  }


  if (
    screenName === "favorites"
  ) {

    renderFavorites();

  }


  if (
    screenName === "profile"
  ) {

    updateProfile();

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   18. ATUALIZAÇÃO GERAL
   ========================================================= */

function updateAllUI() {

  updateTodayCard();

  updateProgressUI();

  updateProfile();

}


/* =========================================================
   19. CARD DE HOJE
   ========================================================= */

function updateTodayCard() {

  const devotional =
    getCurrentDevotional();


  const day =
    $("#today-day");

  const title =
    $("#today-title");

  const description =
    $("#today-description");

  const reference =
    $("#today-reference");


  if (!devotional) {

    if (day) {
      day.textContent =
        `DIA ${formatDay(state.currentDay)}`;
    }

    if (title) {
      title.textContent =
        "Conteúdo em preparação";
    }

    if (description) {
      description.textContent =
        "Este dia ainda será disponibilizado.";
    }

    if (reference) {
      reference.textContent =
        "";
    }

    return;
  }


  if (day) {

    day.textContent =
      `DIA ${formatDay(
        getDevotionalNumber(
          devotional
        )
      )}`;

  }


  if (title) {

    title.textContent =
      devotional.titulo ||
      "Devocional";

  }


  if (description) {

    description.textContent =
      devotional.subtitulo ||
      devotional.descricao ||
      "";

  }


  if (reference) {

    reference.textContent =
      getReferenceText(
        devotional
      ) ||
      "";

  }

}


/* =========================================================
   20. ABRIR DEVOCIONAL
   ========================================================= */

function openDevotional(
  day
) {

  const numericDay =
    Number(day);


  if (
    numericDay < 1 ||
    numericDay > CONFIG.totalDays
  ) {
    return;
  }


  state.currentDay =
    numericDay;


  localStorage.setItem(
    CONFIG.storageKeys.currentDay,
    String(
      state.currentDay
    )
  );


  renderDevotional(
    numericDay
  );


  showScreen(
    "devotional"
  );


  updateAllUI();

}


/* =========================================================
   21. RENDER DEVOCIONAL
   ========================================================= */

function renderDevotional(
  day
) {

  const devotional =
    getDevotionalByDay(
      day
    );


  if (!devotional) {

    renderMissingDevotional(
      day
    );

    return;
  }


  setText(
    "#devotional-day",
    `DIA ${formatDay(day)}`
  );


  setText(
    "#devotional-title",
    devotional.titulo ||
      "Devocional"
  );


  setText(
    "#devotional-subtitle",
    devotional.subtitulo ||
      devotional.descricao ||
      ""
  );


  setText(
    "#devotional-theme",
    devotional.tema ||
      ""
  );


  setText(
    "#devotional-reference",
    getReferenceText(
      devotional
    )
  );


  renderContentBlock(
    "#devotional-reading",
    devotional.leitura_biblica
  );


  renderContext(
    devotional.contexto_biblico
  );


  renderExposition(
    devotional.exposicao
  );


  renderExegesis(
    devotional.exegese
  );


  renderTheology(
    devotional.comentario_teologico
  );


  renderReflection(
    devotional.reflexao
  );


  renderContemplation(
    devotional.contemplacao_teologica
  );


  renderPractice(
    devotional.aplicacao_pratica
  );


  renderQuestions(
    devotional.perguntas_interiorizacao
  );


  renderJournalPrompt(
    devotional.diario
  );


  renderRelatedReferences(
    devotional.referencias_relacionadas
  );


  renderPrayer(
    devotional.oracao
  );


  renderDevotionalAudio(
    devotional
  );


  updateCompletionButton(
    day
  );

}


/* =========================================================
   22. DEVOCIONAL INEXISTENTE
   ========================================================= */

function renderMissingDevotional(
  day
) {

  setText(
    "#devotional-day",
    `DIA ${formatDay(day)}`
  );


  setText(
    "#devotional-title",
    "Este dia ainda está sendo preparado"
  );


  setText(
    "#devotional-subtitle",
    "A estrutura da jornada já está pronta. O conteúdo deste dia será inserido posteriormente."
  );


  setText(
    "#devotional-theme",
    getThemeForDay(day)?.titulo ||
      ""
  );


  setText(
    "#devotional-reference",
    ""
  );


  [
    "#devotional-reading",
    "#devotional-context",
    "#devotional-exposition",
    "#devotional-exegesis",
    "#devotional-theology",
    "#devotional-reflection",
    "#devotional-contemplation",
    "#devotional-practice",
    "#devotional-questions",
    "#devotional-journal",
    "#devotional-related",
    "#devotional-prayer"
  ].forEach(
    selector => {

      const element =
        $(selector);

      if (element) {

        element.innerHTML =
          `
            <div class="loading-state">
              O conteúdo deste dia será disponibilizado
              na próxima etapa da construção da jornada.
            </div>
          `;

      }

    }
  );


  renderDevotionalAudio(
    null
  );

}


/* =========================================================
   23. REFERÊNCIA
   ========================================================= */

function getReferenceText(
  devotional
) {

  const reference =
    devotional?.referencia_principal;


  if (!reference) {

    return (
      devotional?.referencia ||
      devotional?.referencia_biblica ||
      ""
    );

  }


  if (
    typeof reference === "string"
  ) {
    return reference;
  }


  return (
    reference.texto ||
    [
      reference.livro,
      reference.capitulo
        ? `${reference.capitulo}`
        : "",
      reference.versiculos
        ? `:${reference.versiculos}`
        : ""
    ]
      .filter(Boolean)
      .join(" ")
  );

}


/* =========================================================
   24. LEITURA
   ========================================================= */

function renderContentBlock(
  selector,
  data
) {

  const container =
    $(selector);


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (!data) {
    return;
  }


  if (
    typeof data === "string"
  ) {

    container.innerHTML =
      `<p>${escapeHTML(data)}</p>`;

    return;
  }


  if (data.referencia) {

    const reference =
      document.createElement(
        "p"
      );

    reference.className =
      "devotional-highlight";

    reference.textContent =
      data.referencia;

    container.appendChild(
      reference
    );

  }


  if (data.orientacao) {

    appendParagraph(
      container,
      data.orientacao
    );

  }


  if (data.conteudo) {

    appendRichText(
      container,
      data.conteudo
    );

  }


  if (data.texto) {

    appendRichText(
      container,
      data.texto
    );

  }

}


/* =========================================================
   25. CONTEXTO
   ========================================================= */

function renderContext(
  data
) {

  const container =
    $("#devotional-context");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (!data) {
    return;
  }


  if (data.conteudo) {

    appendRichText(
      container,
      data.conteudo
    );

  }


  if (
    Array.isArray(
      data.pontos
    )
  ) {

    const list =
      document.createElement(
        "ul"
      );

    list.className =
      "devotional-list";


    data.pontos.forEach(
      point => {

        const li =
          document.createElement(
            "li"
          );

        li.textContent =
          typeof point === "string"
            ? point
            : point?.texto ||
              point?.titulo ||
              "";

        list.appendChild(
          li
        );

      }
    );


    container.appendChild(
      list
    );

  }

}


/* =========================================================
   26. EXPOSIÇÃO
   ========================================================= */

function renderExposition(
  data
) {

  const container =
    $("#devotional-exposition");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (!data) {
    return;
  }


  if (data.conteudo) {

    appendRichText(
      container,
      data.conteudo
    );

  }


  const development =
    data.desenvolvimento ||
    data.subsecoes ||
    data.subsections;


  if (
    Array.isArray(
      development
    )
  ) {

    development.forEach(
      item => {

        const section =
          document.createElement(
            "article"
          );

        section.className =
          "devotional-subsection";


        const title =
          document.createElement(
            "h4"
          );

        title.textContent =
          item.titulo ||
          item.title ||
          "";


        section.appendChild(
          title
        );


        if (item.conteudo) {

          appendRichText(
            section,
            item.conteudo
          );

        }


        if (item.texto) {

          appendRichText(
            section,
            item.texto
          );

        }


        container.appendChild(
          section
        );

      }
    );

  }

}


/* =========================================================
   27. EXEGESE
   ========================================================= */

function renderExegesis(
  data
) {

  const container =
    $("#devotional-exegesis");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (!data) {
    return;
  }


  if (data.conteudo) {

    appendRichText(
      container,
      data.conteudo
    );

  }


  const observations =
    data.observacoes ||
    data.observations;


  if (
    Array.isArray(
      observations
    )
  ) {

    const list =
      document.createElement(
        "ul"
      );

    list.className =
      "devotional-list";


    observations.forEach(
      observation => {

        const li =
          document.createElement(
            "li"
          );

        li.textContent =
          typeof observation === "string"
            ? observation
            : observation?.texto ||
              observation?.conteudo ||
              "";

        list.appendChild(
          li
        );

      }
    );


    container.appendChild(
      list
    );

  }

}


/* =========================================================
   28. TEOLOGIA
   ========================================================= */

function renderTheology(
  data
) {

  const container =
    $("#devotional-theology");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (!data) {
    return;
  }


  if (data.conteudo) {

    appendRichText(
      container,
      data.conteudo
    );

  }


  if (data.texto) {

    appendRichText(
      container,
      data.texto
    );

  }


  if (data.contemplacao) {

    const box =
      document.createElement(
        "div"
      );

    box.className =
      "devotional-highlight";

    box.textContent =
      data.contemplacao;

    container.appendChild(
      box
    );

  }

}


/* =========================================================
   29. REFLEXÃO
   ========================================================= */

function renderReflection(
  data
) {

  const container =
    $("#devotional-reflection");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (!data) {
    return;
  }


  if (data.conteudo) {

    appendRichText(
      container,
      data.conteudo
    );

  }


  if (data.aplicacao) {

    const box =
      document.createElement(
        "div"
      );

    box.className =
      "devotional-highlight";

    box.textContent =
      data.aplicacao;

    container.appendChild(
      box
    );

  }

}


/* =========================================================
   30. CONTEMPLAÇÃO
   ========================================================= */

function renderContemplation(
  data
) {

  const container =
    $("#devotional-contemplation");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (!data) {
    return;
  }


  if (data.texto) {

    appendRichText(
      container,
      data.texto
    );

  }


  if (
    Array.isArray(
      data.perguntas
    )
  ) {

    renderQuestionArray(
      container,
      data.perguntas
    );

  }

}


/* =========================================================
   31. PRÁTICA
   ========================================================= */

function renderPractice(
  data
) {

  const container =
    $("#devotional-practice");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (!data) {
    return;
  }


  if (data.conteudo) {

    appendRichText(
      container,
      data.conteudo
    );

  }


  if (data.orientacao) {

    appendRichText(
      container,
      data.orientacao
    );

  }


  const steps =
    data.passos ||
    data.steps;


  if (
    Array.isArray(
      steps
    )
  ) {

    const wrapper =
      document.createElement(
        "div"
      );

    wrapper.className =
      "devotional-steps";


    steps.forEach(
      (step, index) => {

        const item =
          document.createElement(
            "article"
          );

        item.className =
          "devotional-step";


        const title =
          document.createElement(
            "strong"
          );

        title.textContent =
          step.titulo ||
          step.title ||
          `Etapa ${index + 1}`;


        item.appendChild(
          title
        );


        const text =
          step.conteudo ||
          step.texto ||
          step.descricao;


        if (text) {

          const paragraph =
            document.createElement(
              "p"
            );

          paragraph.textContent =
            text;

          item.appendChild(
            paragraph
          );

        }


        wrapper.appendChild(
          item
        );

      }
    );


    container.appendChild(
      wrapper
    );

  }

}


/* =========================================================
   32. PERGUNTAS
   ========================================================= */

function renderQuestions(
  questions
) {

  const container =
    $("#devotional-questions");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (
    !Array.isArray(
      questions
    )
  ) {
    return;
  }


  renderQuestionArray(
    container,
    questions
  );

}


function renderQuestionArray(
  container,
  questions
) {

  const wrapper =
    document.createElement(
      "div"
    );

  wrapper.className =
    "devotional-questions";


  questions.forEach(
    (question, index) => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "devotional-question";


      item.textContent =
        typeof question === "string"
          ? question
          : question?.pergunta ||
            question?.texto ||
            `${index + 1}.`;


      wrapper.appendChild(
        item
      );

    }
  );


  container.appendChild(
    wrapper
  );

}


/* =========================================================
   33. DIÁRIO DO DEVOCIONAL
   ========================================================= */

function renderJournalPrompt(
  data
) {

  const container =
    $("#devotional-journal");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (!data) {
    return;
  }


  if (data.orientacao) {

    appendRichText(
      container,
      data.orientacao
    );

  }


  if (data.conteudo) {

    appendRichText(
      container,
      data.conteudo
    );

  }


  if (
    Array.isArray(
      data.perguntas
    )
  ) {

    renderQuestionArray(
      container,
      data.perguntas
    );

  }

}


/* =========================================================
   34. REFERÊNCIAS RELACIONADAS
   ========================================================= */

function renderRelatedReferences(
  references
) {

  const container =
    $("#devotional-related");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (
    !Array.isArray(
      references
    )
  ) {
    return;
  }


  const wrapper =
    document.createElement(
      "div"
    );

  wrapper.className =
    "devotional-related-list";


  references.forEach(
    reference => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "devotional-related-item";


      item.textContent =
        typeof reference === "string"
          ? reference
          : reference?.texto ||
            reference?.referencia ||
            [
              reference?.livro,
              reference?.capitulo
                ? `${reference.capitulo}`
                : "",
              reference?.versiculos
                ? `:${reference.versiculos}`
                : ""
            ]
              .filter(Boolean)
              .join(" ");


      wrapper.appendChild(
        item
      );

    }
  );


  container.appendChild(
    wrapper
  );

}


/* =========================================================
   35. ORAÇÃO
   ========================================================= */

function renderPrayer(
  data
) {

  const container =
    $("#devotional-prayer");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (!data) {
    return;
  }


  if (data.texto) {

    appendRichText(
      container,
      data.texto
    );

  }


  if (data.conteudo) {

    appendRichText(
      container,
      data.conteudo
    );

  }

}


/* =========================================================
   36. ÁUDIO DO DEVOCIONAL
   ========================================================= */

function renderDevotionalAudio(
  devotional
) {

  const audio =
    $("#devotional-audio");

  const status =
    $("#devotional-audio-status");


  if (!audio) {
    return;
  }


  audio.pause();

  audio.removeAttribute(
    "src"
  );

  audio.load();


  if (!devotional) {

    if (status) {

      status.textContent =
        "O áudio deste dia será disponibilizado quando o conteúdo estiver pronto.";

    }

    hideGlobalAudio();

    return;
  }


  const audioData =
    devotional.audio ||
    {};


  const available =
    audioData.disponivel === true &&
    Boolean(
      audioData.arquivo
    );


  if (!available) {

    if (status) {

      status.textContent =
        "O áudio completo deste devocional será disponibilizado nesta área.";

    }

    hideGlobalAudio();

    return;
  }


  const source =
    audioData.arquivo;


  audio.src =
    source;


  if (status) {

    status.textContent =
      "Áudio completo do devocional disponível.";

  }


  setupGlobalAudio(
    source,
    devotional
  );


  if (
    state.settings.autoplay
  ) {

    audio.play()
      .catch(
        () => {}
      );

  }

}


/* =========================================================
   37. PLAYER GLOBAL
   ========================================================= */

function setupGlobalAudio(
  source,
  devotional
) {

  const globalPlayer =
    $("#global-audio-player");

  const globalAudio =
    $("#global-audio");


  if (
    !globalPlayer ||
    !globalAudio
  ) {
    return;
  }


  globalAudio.src =
    source;


  globalAudio.playbackRate =
    Number(
      $("#global-audio-speed")
        ?.value || 1
    );


  setText(
    "#global-audio-title",
    devotional?.titulo ||
      "Devocional"
  );


  setText(
    "#global-audio-day",
    `Dia ${formatDay(
      getDevotionalNumber(
        devotional
      )
    )}`
  );


  globalPlayer.classList.remove(
    "is-hidden"
  );


  state.audio.currentDay =
    getDevotionalNumber(
      devotional
    );

  state.audio.source =
    source;


  localStorage.setItem(
    CONFIG.storageKeys.lastAudio,
    JSON.stringify({
      day:
        state.audio.currentDay,

      source
    })
  );

}


/* =========================================================
   38. ESCONDER PLAYER
   ========================================================= */

function hideGlobalAudio() {

  const player =
    $("#global-audio-player");


  if (player) {

    player.classList.add(
      "is-hidden"
    );

  }

}


/* =========================================================
   39. CONCLUSÃO DO DIA
   ========================================================= */

function completeCurrentDay() {

  const day =
    state.currentDay;


  if (
    !state.completedDays.includes(
      day
    )
  ) {

    state.completedDays.push(
      day
    );

    state.completedDays =
      [...new Set(
        state.completedDays
      )]
        .sort(
          (a, b) => a - b
        );

  }


  const nextDay =
    Math.min(
      day + 1,
      CONFIG.totalDays
    );


  if (
    day < CONFIG.totalDays
  ) {

    state.currentDay =
      nextDay;

  }


  saveLocalState();

  updateAllUI();

  updateCompletionButton(
    day
  );


  const button =
    $("#complete-devotional");


  if (button) {

    button.textContent =
      "DIA CONCLUÍDO";

  }

}


function updateCompletionButton(
  day
) {

  const button =
    $("#complete-devotional");


  if (!button) {
    return;
  }


  const completed =
    state.completedDays.includes(
      Number(day)
    );


  button.textContent =
    completed
      ? "DIA CONCLUÍDO"
      : "MARCAR DIA COMO CONCLUÍDO";

}


/* =========================================================
   40. TEMAS MENSAIS
   ========================================================= */

function renderThemes() {

  const container =
    $("#themes-grid");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (
    !state.themes.length
  ) {

    container.innerHTML =
      `
        <div class="loading-state">
          Os temas da jornada serão carregados aqui.
        </div>
      `;

    return;
  }


  state.themes.forEach(
    theme => {

      const card =
        document.createElement(
          "button"
        );

      card.className =
        "theme-card";

      card.type =
        "button";


      const month =
        theme.mes ??
        theme.month ??
        "";


      const title =
        theme.titulo ||
        theme.title ||
        "Tema";


      const subtitle =
        theme.subtitulo ||
        theme.subtitle ||
        "";


      const days =
        theme.dias ||
        theme.days ||
        "";


      card.innerHTML =
        `
          <span>
            ${escapeHTML(
              `MÊS ${month}`
            )}
          </span>

          <strong>
            ${escapeHTML(
              title
            )}
          </strong>

          <small>
            ${escapeHTML(
              subtitle
            )}
          </small>

          ${
            days
              ? `
                <small>
                  ${escapeHTML(
                    String(days)
                  )}
                </small>
              `
              : ""
          }
        `;


      card.addEventListener(
        "click",
        () => {

          const firstDay =
            getFirstDayFromTheme(
              theme
            );

          if (firstDay) {

            openDevotional(
              firstDay
            );

          }

        }
      );


      container.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   41. TEMA DO DIA
   ========================================================= */

function getThemeForDay(
  day
) {

  if (
    !state.themes.length
  ) {
    return null;
  }


  return state.themes.find(
    theme =>
      isDayInsideTheme(
        day,
        theme
      )
  ) || null;

}


function isDayInsideTheme(
  day,
  theme
) {

  const range =
    String(
      theme.dias ??
      theme.days ??
      ""
    );


  const match =
    range.match(
      /(\d+)\s*[–-]\s*(\d+)/
    );


  if (!match) {
    return false;
  }


  const start =
    Number(match[1]);

  const end =
    Number(match[2]);


  return (
    day >= start &&
    day <= end
  );

}


function getFirstDayFromTheme(
  theme
) {

  const range =
    String(
      theme.dias ??
      theme.days ??
      ""
    );


  const match =
    range.match(
      /(\d+)/
    );


  return match
    ? Number(match[1])
    : null;

}


/* =========================================================
   42. JORNADA
   ========================================================= */

function renderJourney() {

  const container =
    $("#journey-grid");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  for (
    let day = 1;
    day <= CONFIG.totalDays;
    day++
  ) {

    const devotional =
      getDevotionalByDay(
        day
      );


    const card =
      document.createElement(
        "button"
      );

    card.type =
      "button";

    card.className =
      "journey-day-card";


    if (
      state.completedDays.includes(
        day
      )
    ) {

      card.classList.add(
        "is-completed"
      );

    }


    const title =
      devotional?.titulo ||
      `Dia ${formatDay(day)}`;


    card.innerHTML =
      `
        <span class="journey-day-number">
          DIA ${formatDay(day)}
        </span>

        <strong class="journey-day-title">
          ${escapeHTML(
            title
          )}
        </strong>
      `;


    card.addEventListener(
      "click",
      () => {

        openDevotional(
          day
        );

      }
    );


    container.appendChild(
      card
    );

  }


  updateJourneyHeader();

}


/* =========================================================
   43. CABEÇALHO DA JORNADA
   ========================================================= */

function updateJourneyHeader() {

  setText(
    "#journey-current-day",
    `DIA ${formatDay(
      state.currentDay
    )}`
  );


  const devotional =
    getCurrentDevotional();


  setText(
    "#journey-current-title",
    devotional?.titulo ||
      "Conteúdo em preparação"
  );


  const percent =
    calculateProgress();


  setText(
    "#journey-progress-percent",
    `${percent}%`
  );


  const bar =
    $("#journey-progress-bar");


  if (bar) {

    bar.style.width =
      `${percent}%`;

  }

}


/* =========================================================
   44. PROGRESSO
   ========================================================= */

function calculateProgress() {

  return Math.round(
    (
      state.completedDays.length /
      CONFIG.totalDays
    ) * 100
  );

}


function updateProgressUI() {

  const percent =
    calculateProgress();


  setText(
    "#home-progress-day",
    `DIA ${formatDay(
      state.currentDay
    )} DE 365`
  );


  setText(
    "#home-progress-percent",
    `${percent}%`
  );


  setWidth(
    "#home-progress-bar",
    percent
  );


  updateJourneyHeader();

}


function updateProfile() {

  const completed =
    state.completedDays.length;

  const percent =
    calculateProgress();


  setText(
    "#profile-day",
    String(
      state.currentDay
    )
  );


  setText(
    "#profile-completed-days",
    String(
      completed
    )
  );


  setText(
    "#profile-journey-percent",
    `${percent}%`
  );


  setText(
    "#profile-progress-text",
    `${percent}% concluído`
  );


  setWidth(
    "#profile-progress-bar",
    percent
  );

}


/* =========================================================
   45. BÍBLIA — LIVROS
   ========================================================= */

function getBibleBooks() {

  if (
    !state.bible
  ) {
    return [];
  }


  return (
    state.bible.books ||
    state.bible.livros ||
    []
  );

}


function getBibleBookName(
  book
) {

  return (
    book?.name ||
    book?.nome ||
    book?.book ||
    book?.livro ||
    ""
  );

}


function getBibleBookId(
  book,
  index
) {

  return String(
    book?.id ??
    book?.abbrev ??
    book?.abreviacao ??
    book?.slug ??
    getBibleBookName(
      book
    ) ||
    index
  );

}


function renderBibleBooks() {

  const select =
    $("#bible-book");


  if (!select) {
    return;
  }


  const books =
    getBibleBooks();


  const current =
    state.currentBibleBook;


  select.innerHTML =
    `
      <option value="">
        Selecione o livro
      </option>
    `;


  books.forEach(
    (book, index) => {

      const id =
        getBibleBookId(
          book,
          index
        );


      const option =
        document.createElement(
          "option"
        );

      option.value =
        id;

      option.textContent =
        getBibleBookName(
          book
        ) ||
        `Livro ${index + 1}`;


      select.appendChild(
        option
      );

    }
  );


  if (current) {
    select.value =
      current;
  }


  renderBibleChapters();

}


/* =========================================================
   46. BÍBLIA — CAPÍTULOS
   ========================================================= */

function getSelectedBibleBook() {

  const books =
    getBibleBooks();


  if (!books.length) {
    return null;
  }


  const select =
    $("#bible-book");


  const value =
    select?.value ||
    state.currentBibleBook;


  if (!value) {
    return null;
  }


  return books.find(
    (book, index) =>
      getBibleBookId(
        book,
        index
      ) === String(value)
  ) || null;

}


function getBookChapters(
  book
) {

  if (!book) {
    return [];
  }


  if (
    Array.isArray(
      book.chapters
    )
  ) {
    return book.chapters;
  }


  if (
    Array.isArray(
      book.capitulos
    )
  ) {
    return book.capitulos;
  }


  if (
    book.chapters &&
    typeof book.chapters === "object"
  ) {

    return Object.values(
      book.chapters
    );

  }


  if (
    book.capitulos &&
    typeof book.capitulos === "object"
  ) {

    return Object.values(
      book.capitulos
    );

  }


  return [];

}


function renderBibleChapters() {

  const select =
    $("#bible-chapter");


  if (!select) {
    return;
  }


  const book =
    getSelectedBibleBook();


  select.innerHTML =
    `
      <option value="">
        Selecione o capítulo
      </option>
    `;


  if (!book) {
    return;
  }


  const chapters =
    getBookChapters(
      book
    );


  chapters.forEach(
    (chapter, index) => {

      const number =
        getChapterNumber(
          chapter,
          index
        );


      const option =
        document.createElement(
          "option"
        );

      option.value =
        String(number);

      option.textContent =
        `Capítulo ${number}`;

      select.appendChild(
        option
      );

    }
  );

}


function getChapterNumber(
  chapter,
  index
) {

  if (
    typeof chapter === "object"
  ) {

    return Number(
      chapter.chapter ??
      chapter.capitulo ??
      chapter.number ??
      chapter.numero ??
      index + 1
    );

  }


  return index + 1;

}


/* =========================================================
   47. BÍBLIA — ABRIR CAPÍTULO
   ========================================================= */

function openSelectedBibleChapter() {

  const book =
    getSelectedBibleBook();


  const chapterSelect =
    $("#bible-chapter");


  if (!book) {
    return;
  }


  const chapterNumber =
    Number(
      chapterSelect?.value
    );


  if (!chapterNumber) {
    return;
  }


  state.currentBibleBook =
    getBibleBookName(
      book
    );

  state.currentBibleChapter =
    chapterNumber;


  renderBibleChapter(
    book,
    chapterNumber
  );

}


function renderBibleChapter(
  book,
  chapterNumber
) {

  const title =
    $("#bible-reader-title");

  const content =
    $("#bible-reader-content");


  if (!content) {
    return;
  }


  const bookName =
    getBibleBookName(
      book
    );


  setText(
    "#bible-reader-version",
    state.bible?.version ||
      "Almeida 1911"
  );


  if (title) {

    title.textContent =
      `${bookName} ${chapterNumber}`;

  }


  const chapters =
    getBookChapters(
      book
    );


  const chapter =
    chapters.find(
      (item, index) =>
        getChapterNumber(
          item,
          index
        ) ===
        Number(chapterNumber)
    );


  content.innerHTML =
    "";


  if (!chapter) {

    content.innerHTML =
      `
        <div class="error-state">
          O conteúdo deste capítulo ainda não está disponível
          no arquivo da Bíblia.
        </div>
      `;

    return;
  }


  const verses =
    getChapterVerses(
      chapter
    );


  if (!verses.length) {

    content.innerHTML =
      `
        <div class="error-state">
          Não foi possível localizar os versículos deste capítulo.
        </div>
      `;

    return;
  }


  verses.forEach(
    (verse, index) => {

      const paragraph =
        document.createElement(
          "p"
        );

      paragraph.className =
        "bible-verse";


      const number =
        getVerseNumber(
          verse,
          index
        );


      const text =
        getVerseText(
          verse
        );


      const numberSpan =
        document.createElement(
          "span"
        );

      numberSpan.className =
        "bible-verse-number";

      numberSpan.textContent =
        number;


      paragraph.appendChild(
        numberSpan
      );


      paragraph.appendChild(
        document.createTextNode(
          text
        )
      );


      content.appendChild(
        paragraph
      );

    }
  );


  const reader =
    $("#bible-reader");


  if (reader) {

    reader.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }

}


/* =========================================================
   48. BÍBLIA — VERSÍCULOS
   ========================================================= */

function getChapterVerses(
  chapter
) {

  if (
    Array.isArray(
      chapter
    )
  ) {
    return chapter;
  }


  if (
    Array.isArray(
      chapter?.verses
    )
  ) {
    return chapter.verses;
  }


  if (
    Array.isArray(
      chapter?.versiculos
    )
  ) {
    return chapter.versiculos;
  }


  if (
    chapter?.verses &&
    typeof chapter.verses === "object"
  ) {

    return Object.values(
      chapter.verses
    );

  }


  if (
    chapter?.versiculos &&
    typeof chapter.versiculos === "object"
  ) {

    return Object.values(
      chapter.versiculos
    );

  }


  return [];

}


function getVerseNumber(
  verse,
  index
) {

  if (
    typeof verse === "object"
  ) {

    return (
      verse.number ??
      verse.numero ??
      verse.verse ??
      verse.versiculo ??
      index + 1
    );

  }


  return index + 1;

}


function getVerseText(
  verse
) {

  if (
    typeof verse === "string"
  ) {
    return verse;
  }


  return (
    verse?.text ||
    verse?.texto ||
    verse?.content ||
    verse?.conteudo ||
    ""
  );

}


/* =========================================================
   49. BUSCA NA BÍBLIA
   ========================================================= */

function searchBible(
  query
) {

  const container =
    $("#bible-search-results");


  if (!container) {
    return;
  }


  const term =
    String(
      query || ""
    )
      .trim()
      .toLowerCase();


  container.innerHTML =
    "";


  if (
    term.length < 2
  ) {
    return;
  }


  const books =
    getBibleBooks();


  const results = [];


  books.forEach(
    (book, bookIndex) => {

      const bookName =
        getBibleBookName(
          book
        );


      const chapters =
        getBookChapters(
          book
        );


      chapters.forEach(
        (chapter, chapterIndex) => {

          const chapterNumber =
            getChapterNumber(
              chapter,
              chapterIndex
            );


          const verses =
            getChapterVerses(
              chapter
            );


          verses.forEach(
            (verse, verseIndex) => {

              const text =
                getVerseText(
                  verse
                );


              if (
                text
                  .toLowerCase()
                  .includes(term)
              ) {

                results.push({
                  book,
                  bookIndex,
                  chapter,
                  chapterNumber,
                  verse,
                  verseIndex,
                  bookName,
                  text
                });

              }

            }
          );

        }
      );

    }
  );


  results
    .slice(0, 30)
    .forEach(
      result => {

        const item =
          document.createElement(
            "button"
          );

        item.type =
          "button";

        item.className =
          "search-result";


        item.innerHTML =
          `
            <span>
              ${escapeHTML(
                `${result.bookName} ${result.chapterNumber}:${getVerseNumber(result.verse, result.verseIndex)}`
              )}
            </span>

            <strong>
              ${escapeHTML(
                result.text
              )}
            </strong>
          `;


        item.addEventListener(
          "click",
          () => {

            openBibleSearchResult(
              result
            );

          }
        );


        container.appendChild(
          item
        );

      }
    );


  if (
    !results.length
  ) {

    container.innerHTML =
      `
        <div class="loading-state">
          Nenhum resultado encontrado.
        </div>
      `;

  }

}


function openBibleSearchResult(
  result
) {

  const bookSelect =
    $("#bible-book");


  if (bookSelect) {

    bookSelect.value =
      getBibleBookId(
        result.book,
        result.bookIndex
      );

  }


  state.currentBibleBook =
    getBibleBookId(
      result.book,
      result.bookIndex
    );


  renderBibleChapters();


  const chapterSelect =
    $("#bible-chapter");


  if (chapterSelect) {

    chapterSelect.value =
      String(
        result.chapterNumber
      );

  }


  state.currentBibleChapter =
    result.chapterNumber;


  renderBibleChapter(
    result.book,
    result.chapterNumber
  );

}


/* =========================================================
   50. ESTUDOS
   ========================================================= */

function getStudyType(
  study
) {

  const type =
    String(
      study?.tipo ||
      study?.type ||
      study?.categoria ||
      study?.category ||
      ""
    )
      .toLowerCase();


  if (
    type.includes("teolog")
  ) {
    return "theological";
  }


  return "biblical";

}


function renderStudies() {

  const biblicalContainer =
    $("#biblical-studies-grid");

  const theologicalContainer =
    $("#theological-studies-grid");


  if (
    !biblicalContainer ||
    !theologicalContainer
  ) {
    return;
  }


  biblicalContainer.innerHTML =
    "";

  theologicalContainer.innerHTML =
    "";


  if (
    !state.studies.length
  ) {

    const empty =
      `
        <div class="loading-state">
          Os estudos serão disponibilizados aqui.
        </div>
      `;

    biblicalContainer.innerHTML =
      empty;

    theologicalContainer.innerHTML =
      empty;

    return;
  }


  state.studies.forEach(
    (study, index) => {

      const card =
        createStudyCard(
          study,
          index
        );


      if (
        getStudyType(
          study
        ) === "theological"
      ) {

        theologicalContainer.appendChild(
          card
        );

      } else {

        biblicalContainer.appendChild(
          card
        );

      }

    }
  );

}


function createStudyCard(
  study,
  index
) {

  const button =
    document.createElement(
      "button"
    );

  button.type =
    "button";

  button.className =
    "study-card";


  const category =
    getStudyType(
      study
    ) === "theological"
      ? "ESTUDO TEOLÓGICO"
      : "ESTUDO BÍBLICO";


  button.innerHTML =
    `
      <span>
        ${category}
      </span>

      <h4>
        ${escapeHTML(
          study.titulo ||
          study.title ||
          `Estudo ${index + 1}`
        )}
      </h4>

      <p>
        ${escapeHTML(
          study.subtitulo ||
          study.subtitle ||
          study.descricao ||
          study.description ||
          ""
        )}
      </p>
    `;


  button.addEventListener(
    "click",
    () => {

      openStudy(
        study
      );

    }
  );


  return button;

}


function switchStudyType(
  type
) {

  state.currentStudyType =
    type;


  $$(".study-tab").forEach(
    tab => {

      tab.classList.toggle(
        "is-active",
        tab.dataset.studyType ===
          type
      );

    }
  );


  const biblicalPanel =
    $("#biblical-studies-panel");

  const theologicalPanel =
    $("#theological-studies-panel");


  biblicalPanel?.classList.toggle(
    "is-hidden",
    type !== "biblical"
  );


  theologicalPanel?.classList.toggle(
    "is-hidden",
    type !== "theological"
  );

}


function openStudy(
  study
) {

  const reader =
    $("#study-reader");


  if (!reader) {
    return;
  }


  setText(
    "#study-reader-category",
    getStudyType(
      study
    ) === "theological"
      ? "ESTUDO TEOLÓGICO"
      : "ESTUDO BÍBLICO"
  );


  setText(
    "#study-reader-title",
    study.titulo ||
      study.title ||
      "Estudo"
  );


  const content =
    $("#study-reader-content");


  if (content) {

    content.innerHTML =
      "";


    const data =
      study.conteudo ||
      study.content ||
      study.texto ||
      "";


    if (
      typeof data === "string"
    ) {

      appendRichText(
        content,
        data
      );

    } else {

      renderObjectContent(
        content,
        data
      );

    }

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
   51. PLANOS
   ========================================================= */

function renderPlans() {

  const container =
    $("#plans-grid");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (
    !state.plans.length
  ) {

    container.innerHTML =
      `
        <div class="loading-state">
          Os planos de leitura serão disponibilizados aqui.
        </div>
      `;

    return;
  }


  state.plans.forEach(
    (plan, index) => {

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "plan-card";


      card.innerHTML =
        `
          <span>
            PLANO ${formatDay(index + 1)}
          </span>

          <h3>
            ${escapeHTML(
              plan.titulo ||
              plan.title ||
              `Plano ${index + 1}`
            )}
          </h3>

          <p>
            ${escapeHTML(
              plan.subtitulo ||
              plan.subtitle ||
              plan.descricao ||
              plan.description ||
              ""
            )}
          </p>
        `;


      const button =
        document.createElement(
          "button"
        );

      button.type =
        "button";

      button.className =
        "secondary-button";

      button.textContent =
        "ABRIR PLANO";


      button.addEventListener(
        "click",
        () => {

          openPlan(
            plan
          );

        }
      );


      card.appendChild(
        button
      );


      container.appendChild(
        card
      );

    }
  );

}


function openPlan(
  plan
) {

  const reader =
    $("#plan-reader");


  if (!reader) {
    return;
  }


  state.currentPlan =
    plan;


  setText(
    "#plan-reader-kicker",
    "PLANO DE LEITURA"
  );


  setText(
    "#plan-reader-title",
    plan.titulo ||
      plan.title ||
      "Plano"
  );


  setText(
    "#plan-reader-description",
    plan.descricao ||
      plan.description ||
      plan.subtitulo ||
      plan.subtitle ||
      ""
  );


  const daysContainer =
    $("#plan-reader-days");


  if (daysContainer) {

    daysContainer.innerHTML =
      "";


    const days =
      plan.dias ||
      plan.days ||
      plan.leituras ||
      plan.readings ||
      [];


    if (
      Array.isArray(days)
    ) {

      days.forEach(
        (day, index) => {

          const item =
            document.createElement(
              "article"
            );

          item.className =
            "plan-day";


          item.textContent =
            typeof day === "string"
              ? day
              : day?.leitura ||
                day?.reading ||
                day?.referencia ||
                day?.reference ||
                `Dia ${index + 1}`;


          daysContainer.appendChild(
            item
          );

        }
      );

    }

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
   52. DIÁRIO
   ========================================================= */

function initializeJournalDays() {

  const select =
    $("#journal-day");


  if (!select) {
    return;
  }


  select.innerHTML =
    "";


  for (
    let day = 1;
    day <= CONFIG.totalDays;
    day++
  ) {

    const option =
      document.createElement(
        "option"
      );

    option.value =
      String(day);

    option.textContent =
      `Dia ${formatDay(day)}`;


    select.appendChild(
      option
    );

  }


  select.value =
    String(
      state.currentDay
    );


  loadJournalEntry(
    state.currentDay
  );

}


function loadJournalEntry(
  day
) {

  const textarea =
    $("#journal-entry");


  if (!textarea) {
    return;
  }


  textarea.value =
    state.journal[
      String(day)
    ] || "";


  setText(
    "#journal-save-status",
    ""
  );

}


function saveJournalEntry() {

  const selector =
    $("#journal-day");

  const textarea =
    $("#journal-entry");


  if (
    !selector ||
    !textarea
  ) {
    return;
  }


  const day =
    selector.value;


  state.journal[
    String(day)
  ] =
    textarea.value;


  saveLocalState();

  setText(
    "#journal-save-status",
    "Registro salvo nesta jornada."
  );


  renderJournalHistory();

}


function renderJournalHistory() {

  const container =
    $("#journal-history-list");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  const entries =
    Object.entries(
      state.journal
    )
      .filter(
        ([, value]) =>
          String(value).trim()
      )
      .sort(
        (
          [dayA],
          [dayB]
        ) =>
          Number(dayA) -
          Number(dayB)
      );


  if (!entries.length) {

    container.innerHTML =
      `
        <div class="empty-state">
          <h3>
            Seu diário ainda está vazio
          </h3>

          <p>
            As suas reflexões aparecerão aqui conforme você escrever.
          </p>
        </div>
      `;

    return;
  }


  entries.forEach(
    ([day, text]) => {

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "journal-entry-card";


      card.innerHTML =
        `
          <span>
            DIA ${formatDay(day)}
          </span>

          <p>
            ${escapeHTML(
              text
            )}
          </p>
        `;


      container.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   53. FAVORITOS
   ========================================================= */

function renderFavorites() {

  const container =
    $("#favorites-list");


  if (!container) {
    return;
  }


  container.innerHTML =
    "";


  if (
    !state.favorites.length
  ) {

    container.innerHTML =
      `
        <div class="empty-state">

          <h3>
            Nenhum conteúdo salvo
          </h3>

          <p>
            Quando a função de favoritos for utilizada,
            seus conteúdos aparecerão aqui.
          </p>

        </div>
      `;

    return;
  }


  state.favorites.forEach(
    favorite => {

      const card =
        document.createElement(
          "article"
        );

      card.className =
        "favorite-card";


      card.textContent =
        favorite.title ||
        favorite.titulo ||
        String(
          favorite
        );


      container.appendChild(
        card
      );

    }
  );

}


function addFavorite(
  favorite
) {

  state.favorites.push(
    favorite
  );

  saveLocalState();

  renderFavorites();

}


/* =========================================================
   54. BUSCA GLOBAL
   ========================================================= */

function searchEverything(
  query
) {

  const container =
    $("#search-results");


  if (!container) {
    return;
  }


  const term =
    String(
      query || ""
    )
      .trim()
      .toLowerCase();


  container.innerHTML =
    "";


  if (
    term.length < 2
  ) {
    return;
  }


  const results = [];


  state.devotionals.forEach(
    devotional => {

      const haystack =
        [
          devotional.titulo,
          devotional.subtitulo,
          devotional.tema,
          devotional.referencia,
          devotional.referencia_principal?.texto,
          devotional.contexto_biblico?.conteudo,
          devotional.exposicao?.conteudo,
          devotional.exegese?.conteudo,
          devotional.comentario_teologico?.conteudo,
          devotional.reflexao?.conteudo
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();


      if (
        haystack.includes(term)
      ) {

        results.push({
          type:
            "DEVOCIONAL",

          title:
            devotional.titulo ||
            "Devocional",

          description:
            devotional.subtitulo ||
            "",

          day:
            getDevotionalNumber(
              devotional
            )

        });

      }

    }
  );


  state.studies.forEach(
    study => {

      const haystack =
        [
          study.titulo,
          study.title,
          study.subtitulo,
          study.subtitle,
          study.descricao,
          study.description,
          typeof study.conteudo === "string"
            ? study.conteudo
            : "",
          typeof study.content === "string"
            ? study.content
            : ""
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();


      if (
        haystack.includes(term)
      ) {

        results.push({
          type:
            getStudyType(
              study
            ) === "theological"
              ? "ESTUDO TEOLÓGICO"
              : "ESTUDO BÍBLICO",

          title:
            study.titulo ||
            study.title ||
            "Estudo",

          description:
            study.subtitulo ||
            study.subtitle ||
            study.descricao ||
            study.description ||
            "",

          study

        });

      }

    }
  );


  results
    .slice(0, 50)
    .forEach(
      result => {

        const item =
          document.createElement(
            "button"
          );

        item.type =
          "button";

        item.className =
          "search-result";


        item.innerHTML =
          `
            <span>
              ${escapeHTML(
                result.type
              )}
            </span>

            <strong>
              ${escapeHTML(
                result.title
              )}
            </strong>

            <p>
              ${escapeHTML(
                result.description
              )}
            </p>
          `;


        item.addEventListener(
          "click",
          () => {

            if (
              result.day
            ) {

              openDevotional(
                result.day
              );

            } else if (
              result.study
            ) {

              showScreen(
                "studies"
              );

              openStudy(
                result.study
              );

            }

          }
        );


        container.appendChild(
          item
        );

      }
    );


  if (
    !results.length
  ) {

    container.innerHTML =
      `
        <div class="loading-state">
          Nenhum conteúdo encontrado.
        </div>
      `;

  }

}


/* =========================================================
   55. IA
   ========================================================= */

function sendAIMessage() {

  const input =
    $("#ai-input");

  const messages =
    $("#ai-messages");


  if (
    !input ||
    !messages
  ) {
    return;
  }


  const text =
    input.value.trim();


  if (!text) {
    return;
  }


  appendAIMessage(
    text,
    "user"
  );


  input.value =
    "";


  /*
    IMPORTANTE:

    Esta primeira versão deixa a interface pronta.
    A conexão com um modelo de IA será feita posteriormente
    através de um backend seguro.

    Nenhuma chave de API deve ser colocada neste arquivo
    quando o aplicativo estiver hospedado no GitHub Pages.
  */


  setTimeout(
    () => {

      appendAIMessage(
        "O assistente de estudo será conectado à próxima camada da aplicação. A estrutura da conversa já está preparada.",
        "system"
      );

    },
    350
  );

}


function appendAIMessage(
  text,
  type
) {

  const messages =
    $("#ai-messages");


  if (!messages) {
    return;
  }


  const item =
    document.createElement(
      "div"
    );

  item.className =
    `ai-message ai-message-${type}`;


  const paragraph =
    document.createElement(
      "p"
    );

  paragraph.textContent =
    text;


  item.appendChild(
    paragraph
  );


  messages.appendChild(
    item
  );


  messages.scrollTop =
    messages.scrollHeight;

}


/* =========================================================
   56. CONFIGURAÇÕES
   ========================================================= */

function initializeSettings() {

  const autoplay =
    $("#setting-autoplay");

  const persistentAudio =
    $("#setting-persistent-audio");


  if (autoplay) {

    autoplay.checked =
      Boolean(
        state.settings.autoplay
      );

  }


  if (persistentAudio) {

    persistentAudio.checked =
      Boolean(
        state.settings.persistentAudio
      );

  }


  initializeJournalDays();

}


/* =========================================================
   57. SERVICE WORKER
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
          "sw.js"
        )
        .then(
          registration => {

            console.log(
              "Service Worker ativo:",
              registration.scope
            );

          }
        )
        .catch(
          error => {

            console.warn(
              "Service Worker não pôde ser registrado.",
              error
            );

          }
        );

    }
  );

}


/* =========================================================
   58. ESTADO INICIAL DE CARREGAMENTO
   ========================================================= */

function showInitialLoadingState() {

  const grids = [
    "#themes-grid",
    "#journey-grid",
    "#biblical-studies-grid",
    "#theological-studies-grid",
    "#plans-grid",
    "#journal-history-list"
  ];


  grids.forEach(
    selector => {

      const element =
        $(selector);

      if (element) {

        element.innerHTML =
          `
            <div class="loading-state">
              Preparando conteúdo...
            </div>
          `;

      }

    }
  );

}


/* =========================================================
   59. RENDERIZAÇÃO DE OBJETOS
   ========================================================= */

function renderObjectContent(
  container,
  data
) {

  if (
    typeof data === "string"
  ) {

    appendRichText(
      container,
      data
    );

    return;
  }


  if (
    Array.isArray(data)
  ) {

    data.forEach(
      item => {

        if (
          typeof item === "string"
        ) {

          appendParagraph(
            container,
            item
          );

        } else {

          renderObjectContent(
            container,
            item
          );

        }

      }
    );

    return;
  }


  if (
    data &&
    typeof data === "object"
  ) {

    Object.entries(
      data
    ).forEach(
      ([key, value]) => {

        const section =
          document.createElement(
            "section"
          );

        section.className =
          "devotional-subsection";


        const heading =
          document.createElement(
            "h4"
          );

        heading.textContent =
          prettifyKey(
            key
          );


        section.appendChild(
          heading
        );


        if (
          typeof value === "string"
        ) {

          appendRichText(
            section,
            value
          );

        } else {

          renderObjectContent(
            section,
            value
          );

        }


        container.appendChild(
          section
        );

      }
    );

  }

}


/* =========================================================
   60. TEXTO RICO
   ========================================================= */

function appendRichText(
  container,
  text
) {

  if (
    text === null ||
    text === undefined
  ) {
    return;
  }


  const normalized =
    String(text)
      .replace(
        /\r\n/g,
        "\n"
      );


  const paragraphs =
    normalized
      .split(
        /\n{2,}/
      )
      .map(
        item =>
          item.trim()
      )
      .filter(Boolean);


  if (!paragraphs.length) {

    appendParagraph(
      container,
      normalized
    );

    return;
  }


  paragraphs.forEach(
    paragraph => {

      appendParagraph(
        container,
        paragraph
      );

    }
  );

}


function appendParagraph(
  container,
  text
) {

  const paragraph =
    document.createElement(
      "p"
    );


  paragraph.textContent =
    String(text);


  container.appendChild(
    paragraph
  );

}


/* =========================================================
   61. UTILITÁRIOS DOM
   ========================================================= */

function setText(
  selector,
  text
) {

  const element =
    $(selector);


  if (element) {

    element.textContent =
      text ?? "";

  }

}


function setWidth(
  selector,
  percent
) {

  const element =
    $(selector);


  if (element) {

    element.style.width =
      `${Math.max(
        0,
        Math.min(
          100,
          percent
        )
      )}%`;

  }

}


/* =========================================================
   62. FORMATAÇÃO
   ========================================================= */

function formatDay(
  day
) {

  return String(
    day
  )
    .padStart(
      2,
      "0"
    );

}


function prettifyKey(
  key
) {

  return String(
    key
  )
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      letter =>
        letter.toUpperCase()
    );

}


/* =========================================================
   63. SEGURANÇA DE TEXTO
   ========================================================= */

function escapeHTML(
  value
) {

  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* =========================================================
   64. DEBOUNCE
   ========================================================= */

function debounce(
  callback,
  delay
) {

  let timeout;


  return function (...args) {

    clearTimeout(
      timeout
    );


    timeout =
      setTimeout(
        () => {

          callback(
            ...args
          );

        },
        delay
      );

  };

}


/* =========================================================
   65. EXPOSIÇÃO GLOBAL
   ========================================================= */

window.DoceEspiritoSanto = {

  state,

  openDevotional,

  showScreen,

  searchBible,

  searchEverything,

  completeCurrentDay,

  saveJournalEntry,

  addFavorite

};


/* =========================================================
   FIM DO APP.JS
   ========================================================= */
