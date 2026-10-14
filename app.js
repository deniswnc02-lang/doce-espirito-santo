/* ============================================================
   DOCE ESPÍRITO SANTO — UM AMIGO ÍNTIMO
   APP.JS — NOVA ARQUITETURA
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     CONFIGURAÇÃO PRINCIPAL
     ========================================================== */

  const APP = {
    name: "Doce Espírito Santo",
    subtitle: "Um Amigo Íntimo",
    version: "3.0.0",

    author: {
      name: "Dr. Denis Willian Cruz",
      instagram: "@dr.denispsicoterapeuta"
    },

    journey: {
      totalDays: 365,
      minimumMinutes: 40,
      idealMinutes: 50
    },

    terminology: {
      holySpirit: "Doce Espírito Santo",
      god: "o Eterno"
    }
  };


  /* ==========================================================
     12 FASES DA JORNADA
     ========================================================== */

  const PHASES = [
    {
      id: 1,
      name: "Perceber",
      start: 1,
      end: 30,
      description: "Aprender a reconhecer a presença."
    },

    {
      id: 2,
      name: "Aprofundar",
      start: 31,
      end: 60,
      description: "Ir além da superfície."
    },

    {
      id: 3,
      name: "Ser Transformado",
      start: 61,
      end: 90,
      description: "Permitir que a presença transforme o interior."
    },

    {
      id: 4,
      name: "Orar",
      start: 91,
      end: 120,
      description: "Aprender a conversar com o Eterno."
    },

    {
      id: 5,
      name: "Ouvir",
      start: 121,
      end: 150,
      description: "Desenvolver silêncio, percepção e discernimento."
    },

    {
      id: 6,
      name: "Palavra",
      start: 151,
      end: 180,
      description: "Aprender a permanecer nas Escrituras."
    },

    {
      id: 7,
      name: "Jesus",
      start: 181,
      end: 220,
      description: "Reconhecer Cristo como centro da caminhada."
    },

    {
      id: 8,
      name: "Direção",
      start: 221,
      end: 250,
      description: "Aprender a caminhar com discernimento."
    },

    {
      id: 9,
      name: "Fruto",
      start: 251,
      end: 290,
      description: "Permitir que o interior apareça no exterior."
    },

    {
      id: 10,
      name: "Servir",
      start: 291,
      end: 320,
      description: "Transformar presença em serviço."
    },

    {
      id: 11,
      name: "Testemunhar",
      start: 321,
      end: 345,
      description: "Compartilhar aquilo que foi vivido."
    },

    {
      id: 12,
      name: "Permanecer",
      start: 346,
      end: 365,
      description: "Continuar quando a jornada já virou vida."
    }
  ];


  /* ==========================================================
     ORDEM BÍBLICA DA JORNADA
     ========================================================== */

  const BIBLICAL_ORDER = [
    "Antigo Testamento",
    "Livros Poéticos",
    "Profetas",
    "Evangelhos",
    "Atos",
    "Cartas",
    "Apocalipse"
  ];


  /* ==========================================================
     ESTRUTURA EDITORIAL DE CADA DIA
     ========================================================== */

  const DAY_STRUCTURE = [
    "identificacao",
    "leituraBiblica",
    "contextoHistorico",
    "contextoLiterario",
    "contextoTeologico",
    "estudoBiblico",
    "conexoesBiblicas",
    "reflexaoProfunda",
    "perguntas",
    "aplicacaoPratica",
    "praticaEspiritual",
    "momentoDeSilencio",
    "oracao",
    "audio",
    "diario",
    "encerramento",
    "continuidade"
  ];


  /* ==========================================================
     ESTADO DO APLICATIVO
     ========================================================== */

  const STORAGE_KEY = "doce-espirito-santo-v3";

  const defaultState = {
    currentDay: 1,
    completedDays: [],
    favorites: [],
    journal: {},
    lastVisit: null,
    audioSpeed: 1
  };

  let state = loadState();

  let devotionalData = [];

  let currentAudio = null;


  /* ==========================================================
     ESTADO — LOCAL STORAGE
     ========================================================== */

  function loadState() {

    try {

      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return { ...defaultState };
      }

      const parsed = JSON.parse(saved);

      return {
        ...defaultState,
        ...parsed
      };

    } catch (error) {

      console.warn(
        "Não foi possível carregar o progresso.",
        error
      );

      return { ...defaultState };
    }
  }


  function saveState() {

    try {

      state.lastVisit = new Date().toISOString();

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
      );

    } catch (error) {

      console.warn(
        "Não foi possível salvar o progresso.",
        error
      );
    }
  }


  /* ==========================================================
     FASE
     ========================================================== */

  function getPhase(day) {

    return PHASES.find(
      phase =>
        day >= phase.start &&
        day <= phase.end
    ) || null;

  }


  /* ==========================================================
     PERCENTUAL DE PROGRESSO
     ========================================================== */

  function getProgress() {

    return Math.round(
      (
        state.completedDays.length /
        APP.journey.totalDays
      ) * 100
    );

  }


  /* ==========================================================
     DEVOCIONAL DO DIA
     ========================================================== */

  function getDevotional(day) {

    return devotionalData.find(
      item =>
        Number(item.day ?? item.dia ?? item.id) === Number(day)
    ) || null;

  }


  /* ==========================================================
     NORMALIZAÇÃO DO CONTEÚDO
     ========================================================== */

  function normalizeDevotional(item) {

    if (!item) return null;

    const day = Number(
      item.day ??
      item.dia ??
      item.id ??
      1
    );

    const phase = getPhase(day);

    return {

      id: item.id ?? day,

      day,

      title:
        item.title ??
        item.titulo ??
        `Dia ${day}`,

      subtitle:
        item.subtitle ??
        item.subtitulo ??
        "",

      theme:
        item.theme ??
        item.tema ??
        "",

      phase:
        item.phase ??
        item.fase ??
        phase?.name ??
        "",

      phaseDescription:
        phase?.description ??
        "",

      duration:
        item.duration ??
        item.duracao ??
        APP.journey.minimumMinutes,

      bible: {

        reference:
          item.reference ??
          item.referencia ??
          item.verse ??
          "",

        verse:
          item.verse ??
          item.versiculo ??
          "",

        text:
          item.bibleText ??
          item.textoBiblico ??
          "",

        historicalContext:
          item.contextoHistorico ??
          "",

        literaryContext:
          item.contextoLiterario ??
          "",

        theologicalContext:
          item.contextoTeologico ??
          "",

        relatedPassages:
          item.passagensRelacionadas ??
          []

      },

      study: {

        introduction:
          item.introduction ??
          item.introducao ??
          "",

        study:
          item.study ??
          item.estudoBiblico ??
          "",

        whatTextSays:
          item.oQueOTextoDiz ??
          "",

        meaning:
          item.oQueOTextoSignifica ??
          "",

        revelation:
          item.oQueOTextoRevela ??
          "",

        aboutGod:
          item.oQueRevelaSobreOEtterno ??
          "",

        aboutHolySpirit:
          item.oQueRevelaSobreODoceEspiritoSanto ??
          "",

        aboutUs:
          item.oQueRevelaSobreNos ??
          ""

      },

      reflection:
        item.reflection ??
        item.reflexao ??
        item.reflexaoProfunda ??
        "",

      questions:
        Array.isArray(item.questions)
          ? item.questions
          : Array.isArray(item.perguntas)
            ? item.perguntas
            : item.question
              ? [item.question]
              : item.pergunta
                ? [item.pergunta]
                : [],

      application:
        item.application ??
        item.aplicacaoPratica ??
        "",

      practice:
        item.practice ??
        item.pratica ??
        item.praticaEspiritual ??
        "",

      silence:
        item.silence ??
        item.momentoDeSilencio ??
        "",

      prayer:
        item.prayer ??
        item.oracao ??
        "",

      audioScript:
        item.audioScript ??
        item.roteiroAudio ??
        "",

      journalQuestion:
        item.journalQuestion ??
        item.perguntaDiario ??
        item.diario ??
        "",

      closing:
        item.closing ??
        item.encerramento ??
        "",

      nextDay:
        day < APP.journey.totalDays
          ? day + 1
          : null

    };

  }


  /* ==========================================================
     CARREGAR DEVOCIONAIS
     ========================================================== */

  async function loadDevotionals() {

    const possibleFiles = [
      "devocionais.json",
      "./devocionais.json",
      "/devocionais.json"
    ];

    for (const file of possibleFiles) {

      try {

        const response = await fetch(file, {
          cache: "no-store"
        });

        if (!response.ok) continue;

        const data = await response.json();

        if (Array.isArray(data)) {

          devotionalData =
            data.map(normalizeDevotional);

          console.info(
            `${devotionalData.length} devocionais carregados.`
          );

          return devotionalData;
        }

      } catch (error) {

        console.warn(
          `Não foi possível carregar ${file}.`,
          error
        );

      }

    }

    console.warn(
      "A base de devocionais ainda não foi carregada."
    );

    devotionalData = [];

    return [];

  }


  /* ==========================================================
     CONCLUSÃO DO DIA
     ========================================================== */

  function completeDay(day) {

    const numericDay = Number(day);

    if (!state.completedDays.includes(numericDay)) {

      state.completedDays.push(numericDay);

      state.completedDays.sort(
        (a, b) => a - b
      );

    }

    if (
      numericDay < APP.journey.totalDays
    ) {

      state.currentDay =
        numericDay + 1;

    }

    saveState();

    emitAppEvent(
      "dayCompleted",
      {
        day: numericDay,
        progress: getProgress()
      }
    );

  }


  /* ==========================================================
     FAVORITOS
     ========================================================== */

  function isFavorite(day) {

    return state.favorites.includes(
      Number(day)
    );

  }


  function toggleFavorite(day) {

    const numericDay = Number(day);

    if (isFavorite(numericDay)) {

      state.favorites =
        state.favorites.filter(
          item => item !== numericDay
        );

    } else {

      state.favorites.push(
        numericDay
      );

    }

    saveState();

    emitAppEvent(
      "favoriteChanged",
      {
        day: numericDay,
        favorite: isFavorite(numericDay)
      }
    );

  }


  /* ==========================================================
     DIÁRIO
     ========================================================== */

  function saveJournal(day, content) {

    const numericDay = Number(day);

    state.journal[numericDay] = {
      content: String(content ?? ""),
      updatedAt: new Date().toISOString()
    };

    saveState();

    emitAppEvent(
      "journalSaved",
      {
        day: numericDay
      }
    );

  }


  function getJournal(day) {

    return state.journal[Number(day)]?.content ?? "";

  }


  /* ==========================================================
     ÁUDIO
     ========================================================== */

  function stopAudio() {

    if (!currentAudio) return;

    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (_) {}

    currentAudio = null;

  }


  function playAudio(source) {

    if (!source) {

      emitAppEvent(
        "audioUnavailable",
        {}
      );

      return;
    }

    stopAudio();

    currentAudio =
      new Audio(source);

    currentAudio.playbackRate =
      Number(state.audioSpeed) || 1;

    currentAudio.play()
      .catch(error => {

        console.warn(
          "Não foi possível iniciar o áudio.",
          error
        );

      });

  }


  function setAudioSpeed(speed) {

    const allowed = [
      0.75,
      1,
      1.25,
      1.5
    ];

    const numericSpeed =
      Number(speed);

    if (!allowed.includes(numericSpeed)) {
      return;
    }

    state.audioSpeed =
      numericSpeed;

    if (currentAudio) {
      currentAudio.playbackRate =
        numericSpeed;
    }

    saveState();

  }


  /* ==========================================================
     NAVEGAÇÃO
     ========================================================== */

  function openDay(day) {

    const numericDay =
      Math.min(
        APP.journey.totalDays,
        Math.max(1, Number(day))
      );

    state.currentDay =
      numericDay;

    saveState();

    const devotional =
      getDevotional(numericDay);

    emitAppEvent(
      "dayOpened",
      {
        day: numericDay,
        devotional
      }
    );

    return devotional;

  }


  function nextDay() {

    if (
      state.currentDay >=
      APP.journey.totalDays
    ) {
      return null;
    }

    return openDay(
      state.currentDay + 1
    );

  }


  function previousDay() {

    if (
      state.currentDay <= 1
    ) {
      return null;
    }

    return openDay(
      state.currentDay - 1
    );

  }


  /* ==========================================================
     EVENTOS INTERNOS
     ========================================================== */

  function emitAppEvent(
    name,
    detail = {}
  ) {

    try {

      window.dispatchEvent(
        new CustomEvent(
          `doceEspíritoSanto:${name}`,
          {
            detail
          }
        )
      );

    } catch (_) {

      try {

        window.dispatchEvent(
          new Event(
            `doceEspíritoSanto:${name}`
          )
        );

      } catch (_) {}

    }

  }


  /* ==========================================================
     API PÚBLICA DO APLICATIVO
     ========================================================== */

  window.DoceEspiritoSanto = {

    APP,

    PHASES,

    BIBLICAL_ORDER,

    DAY_STRUCTURE,

    state,

    getPhase,

    getProgress,

    getDevotional,

    normalizeDevotional,

    loadDevotionals,

    openDay,

    nextDay,

    previousDay,

    completeDay,

    isFavorite,

    toggleFavorite,

    saveJournal,

    getJournal,

    playAudio,

    stopAudio,

    setAudioSpeed

  };


  /* ==========================================================
     INICIALIZAÇÃO
     ========================================================== */

  async function initialize() {

    console.log(
      "Doce Espírito Santo — Um Amigo Íntimo"
    );

    console.log(
      "Motor editorial:",
      APP.version
    );

    console.log(
      "Jornada:",
      APP.journey.totalDays,
      "dias"
    );

    console.log(
      "Experiência mínima:",
      APP.journey.minimumMinutes,
      "minutos"
    );

    await loadDevotionals();

    emitAppEvent(
      "ready",
      {
        app: APP,
        phases: PHASES,
        progress: getProgress(),
        currentDay: state.currentDay
      }
    );

  }


  /* ==========================================================
     INICIAR
     ========================================================== */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      initialize
    );

  } else {

    initialize();

  }

})();
