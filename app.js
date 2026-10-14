/* ==========================================================
   DOCE ESPÍRITO SANTO — UM AMIGO ÍNTIMO
   APP.JS — VERSÃO ESTÁVEL
   ========================================================== */

(function () {
  "use strict";

  /* ========================================================
     CONFIGURAÇÃO
     ======================================================== */

  const APP = {
    name: "Doce Espírito Santo",
    subtitle: "Um Amigo Íntimo",
    phrase: "Ele já está aqui. Aprenda a percebê-lo.",
    cover: "capa.jpeg"
  };

  const state = {
    day: Number(localStorage.getItem("doce-dia")) || 1,
    devotional: null,
    studies: [],
    playing: false,
    audio: null
  };

  /* ========================================================
     UTILITÁRIOS
     ======================================================== */

  function esc(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function hideLoading() {
    const loading = document.getElementById("app-loading");

    if (loading) {
      loading.classList.add("hidden");

      setTimeout(() => {
        loading.style.display = "none";
      }, 500);
    }
  }

  function getApp() {
    let app = document.getElementById("app");

    if (!app) {
      app = document.createElement("main");
      app.id = "app";
      document.body.appendChild(app);
    }

    return app;
  }

  /* ========================================================
     CSS DE SEGURANÇA
     ======================================================== */

  const safetyStyle = document.createElement("style");

  safetyStyle.textContent = `
    #app {
      min-height: 100vh;
    }

    .dse-page {
      min-height: 100vh;
      padding-bottom: 115px;
    }

    .dse-container {
      width: min(100%, 1180px);
      margin: 0 auto;
      padding: 0 20px;
    }

    .dse-top {
      position: sticky;
      top: 0;
      z-index: 100;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      background: linear-gradient(
        to bottom,
        rgba(7,8,6,.98),
        rgba(7,8,6,.82),
        rgba(7,8,6,0)
      );
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }

    .dse-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .dse-brand img {
      width: 36px;
      height: 36px;
      object-fit: contain;
    }

    .dse-brand-text {
      color: #ead6a4;
      font-size: 13px;
      font-weight: 600;
    }

    .dse-search {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,.1);
      background: rgba(255,255,255,.045);
      color: #ead6a4;
      font-size: 19px;
      display: grid;
      place-items: center;
    }

    .dse-hero {
      position: relative;
      min-height: 650px;
      margin: 0 -20px;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
      border-radius: 0 0 34px 34px;
      background: #10120e;
    }

    .dse-hero img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    .dse-hero::before {
      content: "";
      position: absolute;
      inset: 0;
      z-index: 1;
      background:
        radial-gradient(
          circle at 72% 25%,
          rgba(228,190,108,.18),
          transparent 30%
        ),
        linear-gradient(
          to bottom,
          rgba(0,0,0,.08),
          rgba(0,0,0,.18) 40%,
          rgba(5,6,5,.95) 100%
        );
    }

    .dse-hero-content {
      position: relative;
      z-index: 2;
      padding: 55px 28px 42px;
      width: 100%;
    }

    .dse-small {
      color: #d8b86b;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .2em;
      text-transform: uppercase;
    }

    .dse-title {
      margin-top: 12px;
      color: #f7efd9;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(42px, 10vw, 76px);
      line-height: .98;
      font-weight: 400;
      letter-spacing: -.035em;
      text-shadow: 0 5px 30px rgba(0,0,0,.5);
    }

    .dse-subtitle {
      margin-top: 16px;
      color: #ddcfb2;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(18px, 4vw, 27px);
      line-height: 1.3;
    }

    .dse-button {
      margin-top: 25px;
      min-height: 51px;
      padding: 0 23px;
      border-radius: 999px;
      border: 0;
      color: #17130b;
      background: linear-gradient(135deg,#ebd59a,#b98e43);
      font-size: 13px;
      font-weight: 800;
      box-shadow: 0 14px 40px rgba(190,150,65,.2);
    }

    .dse-section {
      padding-top: 58px;
    }

    .dse-eyebrow {
      color: #c9a45a;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .2em;
      text-transform: uppercase;
    }

    .dse-section-title {
      margin-top: 7px;
      color: #f3ead7;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(28px, 7vw, 43px);
      font-weight: 400;
      line-height: 1.05;
    }

    .dse-section-text {
      margin-top: 10px;
      color: #928d82;
      font-size: 14px;
      line-height: 1.7;
    }

    .dse-devotional {
      position: relative;
      min-height: 360px;
      margin-top: 22px;
      overflow: hidden;
      border-radius: 27px;
      border: 1px solid rgba(255,255,255,.09);
      background: #11130f;
      box-shadow: 0 25px 70px rgba(0,0,0,.42);
    }

    .dse-devotional img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: .48;
    }

    .dse-devotional::after {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(
          to top,
          rgba(5,6,5,.98),
          rgba(5,6,5,.38) 65%,
          rgba(5,6,5,.08)
        );
    }

    .dse-devotional-content {
      position: relative;
      z-index: 2;
      min-height: 360px;
      padding: 27px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    .dse-day {
      color: #e1c47d;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .17em;
      text-transform: uppercase;
    }

    .dse-devotional-title {
      margin-top: 9px;
      color: #f4ead3;
      font-family: Georgia, "Times New Roman", serif;
      font-size: clamp(28px, 7vw, 45px);
      line-height: 1.03;
      font-weight: 400;
    }

    .dse-devotional-description {
      margin-top: 11px;
      color: rgba(245,240,230,.7);
      font-size: 14px;
      line-height: 1.65;
    }

    .dse-listen {
      margin-top: 18px;
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-radius: 17px;
      border: 1px solid rgba(255,255,255,.08);
      background: rgba(20,21,18,.72);
      backdrop-filter: blur(16px);
    }

    .dse-play {
      width: 43px;
      height: 43px;
      flex: 0 0 43px;
      border-radius: 50%;
      background: linear-gradient(135deg,#e7cf92,#b88e45);
      color: #17130b;
      display: grid;
      place-items: center;
      font-size: 16px;
    }

    .dse-listen-title {
      color: #eee5d2;
      font-size: 12px;
      font-weight: 700;
    }

    .dse-listen-meta {
      margin-top: 4px;
      color: #888379;
      font-size: 10px;
    }

    .dse-grid {
      margin-top: 22px;
      display: grid;
      grid-template-columns: repeat(2,minmax(0,1fr));
      gap: 13px;
    }

    .dse-image-card {
      position: relative;
      min-height: 225px;
      overflow: hidden;
      border-radius: 21px;
      border: 1px solid rgba(255,255,255,.08);
      background: #151711;
    }

    .dse-image-card img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: .7;
    }

    .dse-image-card::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to top,
        rgba(4,5,4,.95),
        rgba(4,5,4,.05)
      );
    }

    .dse-card-content {
      position: absolute;
      z-index: 2;
      left: 17px;
      right: 17px;
      bottom: 17px;
    }

    .dse-card-title {
      color: #f4ead5;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 22px;
      line-height: 1.05;
    }

    .dse-card-text {
      margin-top: 7px;
      color: rgba(245,240,230,.65);
      font-size: 11px;
      line-height: 1.5;
    }

    .dse-journey {
      position: relative;
      overflow: hidden;
      margin-top: 22px;
      padding: 30px;
      min-height: 285px;
      border-radius: 27px;
      border: 1px solid rgba(208,174,97,.18);
      background:
        radial-gradient(
          circle at 90% 10%,
          rgba(211,172,87,.14),
          transparent 35%
        ),
        linear-gradient(135deg,#151712,#0b0d0a);
    }

    .dse-365 {
      color: rgba(210,174,93,.18);
      font-family: Georgia, "Times New Roman", serif;
      font-size: 110px;
      line-height: .75;
    }

    .dse-journey-title {
      margin-top: 25px;
      color: #f2e7ca;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 39px;
    }

    .dse-journey-text {
      margin-top: 10px;
      color: #999388;
      font-size: 13px;
      line-height: 1.7;
    }

    .dse-progress {
      height: 4px;
      margin-top: 20px;
      overflow: hidden;
      border-radius: 99px;
      background: rgba(255,255,255,.08);
    }

    .dse-progress span {
      display: block;
      width: .3%;
      height: 100%;
      background: linear-gradient(90deg,#a47e39,#e4c77d);
    }

    .dse-study {
      position: relative;
      min-height: 300px;
      margin-top: 22px;
      overflow: hidden;
      border-radius: 27px;
      border: 1px solid rgba(255,255,255,.08);
    }

    .dse-study img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .dse-study::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to top,
        rgba(5,6,5,.97),
        rgba(5,6,5,.12)
      );
    }

    .dse-study-content {
      position: absolute;
      z-index: 2;
      left: 25px;
      right: 25px;
      bottom: 25px;
    }

    .dse-study-title {
      color: #f2e6ca;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 36px;
    }

    .dse-study-text {
      margin-top: 8px;
      color: rgba(255,248,233,.67);
      font-size: 13px;
      line-height: 1.6;
    }

    .dse-bottom {
      position: fixed;
      z-index: 300;
      left: 50%;
      bottom: 15px;
      transform: translateX(-50%);
      width: min(calc(100% - 28px),600px);
      min-height: 65px;
      padding: 7px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 23px;
      background: rgba(18,20,16,.78);
      box-shadow: 0 20px 70px rgba(0,0,0,.5);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
    }

    .dse-nav {
      min-width: 55px;
      height: 51px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 3px;
      border-radius: 16px;
      color: #77756d;
      background: transparent;
      font-size: 10px;
    }

    .dse-nav.active {
      color: #e2c47e;
      background: rgba(207,168,87,.08);
    }

    .dse-nav-icon {
      font-size: 17px;
    }

    .dse-modal {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: none;
      overflow-y: auto;
      background: rgba(4,5,4,.97);
    }

    .dse-modal.open {
      display: block;
    }

    .dse-modal-inner {
      width: min(100%,850px);
      margin: auto;
      padding: 25px 20px 110px;
    }

    .dse-close {
      width: 43px;
      height: 43px;
      margin-left: auto;
      display: grid;
      place-items: center;
      border-radius: 50%;
      color: white;
      background: rgba(255,255,255,.07);
      font-size: 20px;
    }

    .dse-reading {
      margin-top: 25px;
      color: #ded7ca;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 18px;
      line-height: 1.85;
    }

    .dse-reading p {
      margin-bottom: 1.25em;
    }

    .dse-search-modal {
      position: fixed;
      inset: 0;
      z-index: 900;
      display: none;
      padding: 90px 20px 40px;
      background: rgba(4,5,4,.97);
    }

    .dse-search-modal.open {
      display: block;
    }

    .dse-search-box {
      width: min(100%,700px);
      margin: auto;
    }

    .dse-search-input {
      width: 100%;
      height: 56px;
      padding: 0 18px;
      border-radius: 17px;
      outline: none;
      border: 1px solid rgba(255,255,255,.1);
      color: white;
      background: rgba(255,255,255,.06);
      font-size: 16px;
    }

    .dse-results {
      margin-top: 20px;
      display: grid;
      gap: 10px;
    }

    .dse-result {
      padding: 16px;
      border-radius: 15px;
      border: 1px solid rgba(255,255,255,.08);
      background: rgba(255,255,255,.04);
      color: #eee6d6;
    }

    @media (min-width:760px) {
      .dse-container {
        padding: 0 32px;
      }

      .dse-hero {
        margin: 0 -32px;
        min-height: 750px;
      }

      .dse-hero-content {
        padding: 75px 60px 60px;
      }

      .dse-grid {
        grid-template-columns: repeat(4,minmax(0,1fr));
      }
    }
  `;

  document.head.appendChild(safetyStyle);

  /* ========================================================
     DADOS PADRÃO
     ======================================================== */

  const fallbackDevotional = {
    day: 1,
    title: "A Presença que já está aqui",
    description:
      "Antes de procurar sinais extraordinários, aprenda a perceber a presença do Doce Espírito Santo naquilo que já está acontecendo dentro e ao redor de você.",
    text:
      "Há uma diferença profunda entre procurar a presença e aprender a percebê-la. O Doce Espírito Santo não precisa chegar para estar presente. A jornada começa quando nossos olhos espirituais aprendem a reconhecer aquilo que muitas vezes já estava diante de nós.",
    verse:
      "“E eu pedirei ao Pai, e ele lhes dará outro Consolador, para que esteja com vocês para sempre.” — João 14:16"
  };

  const fallbackStudies = [
    {
      title: "Quem é o Doce Espírito Santo?",
      description:
        "Uma introdução teológica à pessoa, presença e obra do Espírito Santo."
    },
    {
      title: "Presença",
      description:
        "Aprendendo a discernir a presença do Espírito Santo na vida cotidiana."
    },
    {
      title: "Intimidade",
      description:
        "O caminho bíblico de comunhão, escuta e relacionamento."
    }
  ];

  /* ========================================================
     CARREGAR JSON
     ======================================================== */

  async function loadJSON(file, fallback) {
    try {
      const response = await fetch(file, {
        cache: "no-store"
      });

      if (!response.ok) {
        return fallback;
      }

      const data = await response.json();

      return data || fallback;

    } catch (error) {
      console.warn("Não foi possível carregar:", file, error);
      return fallback;
    }
  }

  function normalizeDevotional(data) {
    if (!data) return fallbackDevotional;

    let item = data;

    if (Array.isArray(data)) {
      item =
        data.find(x =>
          Number(
            x.day ||
            x.dia ||
            x.numero ||
            x.id
          ) === state.day
        ) || data[0];
    }

    if (data.devocionais && Array.isArray(data.devocionais)) {
      item =
        data.devocionais.find(x =>
          Number(x.day || x.dia || x.numero || x.id) === state.day
        ) || data.devocionais[0];
    }

    return {
      day:
        item.day ||
        item.dia ||
        state.day,

      title:
        item.title ||
        item.titulo ||
        item.tema ||
        fallbackDevotional.title,

      description:
        item.description ||
        item.descricao ||
        item.resumo ||
        fallbackDevotional.description,

      text:
        item.text ||
        item.texto ||
        item.conteudo ||
        item.conteúdo ||
        fallbackDevotional.text,

      verse:
        item.verse ||
        item.versiculo ||
        item.versículo ||
        fallbackDevotional.verse,

      audio:
        item.audio ||
        item.audioUrl ||
        item.audio_url ||
        null,

      prayerAudio:
        item.prayerAudio ||
        item.audioOracao ||
        item.audio_oracao ||
        null
    };
  }

  function normalizeStudies(data) {
    if (!data) return fallbackStudies;

    if (Array.isArray(data)) {
      return data.map(item => ({
        title:
          item.title ||
          item.titulo ||
          item.nome ||
          "Estudo",

        description:
          item.description ||
          item.descricao ||
          item.resumo ||
          ""
      }));
    }

    if (data.estudos && Array.isArray(data.estudos)) {
      return normalizeStudies(data.estudos);
    }

    return fallbackStudies;
  }

  /* ========================================================
     IMAGEM SEGURA
     ======================================================== */

  function image(path) {
    return `
      <img
        src="${esc(path)}"
        alt=""
        loading="lazy"
        onerror="this.style.display='none'"
      >
    `;
  }

  /* ========================================================
     RENDER
     ======================================================== */

  function render() {

    const app = getApp();

    const d = state.devotional || fallbackDevotional;

    const study = state.studies[0] || fallbackStudies[0];

    app.innerHTML = `

      <div class="dse-page">

        <!-- TOPO -->

        <header class="dse-top">

          <div class="dse-brand">

            <img
              src="icon.svg"
              alt=""
            >

            <span class="dse-brand-text">
              ${APP.name}
            </span>

          </div>

          <button
            class="dse-search"
            id="openSearch"
            aria-label="Pesquisar"
          >
            ⌕
          </button>

        </header>


        <div class="dse-container">

          <!-- HERO -->

          <section class="dse-hero">

            <img
              src="${APP.cover}"
              alt="Doce Espírito Santo"
              onerror="this.style.display='none'"
            >

            <div class="dse-hero-content">

              <div class="dse-small">
                ${APP.subtitle}
              </div>

              <h1 class="dse-title">
                Doce Espírito Santo
              </h1>

              <div class="dse-subtitle">
                ${APP.phrase}
              </div>

              <button
                class="dse-button"
                id="startJourney"
              >
                Começar minha jornada
              </button>

            </div>

          </section>


          <!-- DEVOCIONAL -->

          <section class="dse-section">

            <div class="dse-eyebrow">
              Hoje
            </div>

            <h2 class="dse-section-title">
              Seu encontro de hoje
            </h2>

            <div class="dse-devotional">

              ${image(APP.cover)}

              <div class="dse-devotional-content">

                <div class="dse-day">
                  Dia ${esc(d.day)} de 365
                </div>

                <h3 class="dse-devotional-title">
                  ${esc(d.title)}
                </h3>

                <p class="dse-devotional-description">
                  ${esc(d.description)}
                </p>

                <div class="dse-listen">

                  <button
                    class="dse-play"
                    id="playDevotional"
                  >
                    ▶
                  </button>

                  <div>

                    <div class="dse-listen-title">
                      Ouvir devocional completo
                    </div>

                    <div class="dse-listen-meta">
                      Palavra • reflexão • contemplação
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </section>


          <!-- PRÁTICAS -->

          <section class="dse-section">

            <div class="dse-eyebrow">
              Presença
            </div>

            <h2 class="dse-section-title">
              Aprenda a percebê-lo
            </h2>

            <p class="dse-section-text">
              Pequenos espaços de atenção podem transformar
              a maneira como você vive a presença do Doce
              Espírito Santo.
            </p>

            <div class="dse-grid">

              <article class="dse-image-card">
                ${image(APP.cover)}
                <div class="dse-card-content">
                  <div class="dse-card-title">
                    Tempo com Ele
                  </div>
                  <div class="dse-card-text">
                    Um espaço diário para permanecer.
                  </div>
                </div>
              </article>

              <article class="dse-image-card">
                ${image(APP.cover)}
                <div class="dse-card-content">
                  <div class="dse-card-title">
                    Escuta
                  </div>
                  <div class="dse-card-text">
                    Silenciar para perceber.
                  </div>
                </div>
              </article>

              <article class="dse-image-card">
                ${image(APP.cover)}
                <div class="dse-card-content">
                  <div class="dse-card-title">
                    Contemplação
                  </div>
                  <div class="dse-card-text">
                    Permanecer diante da presença.
                  </div>
                </div>
              </article>

              <article class="dse-image-card">
                ${image(APP.cover)}
                <div class="dse-card-content">
                  <div class="dse-card-title">
                    Vida diária
                  </div>
                  <div class="dse-card-text">
                    Percebê-lo também no ordinário.
                  </div>
                </div>
              </article>

            </div>

          </section>


          <!-- 365 DIAS -->

          <section class="dse-section">

            <div class="dse-eyebrow">
              A jornada
            </div>

            <div class="dse-journey">

              <div class="dse-365">
                365
              </div>

              <h2 class="dse-journey-title">
                Um ano de intimidade
              </h2>

              <p class="dse-journey-text">
                Uma jornada construída dia após dia,
                conduzindo você para uma vida mais consciente
                da presença do Doce Espírito Santo.
              </p>

              <div class="dse-progress">
                <span></span>
              </div>

            </div>

          </section>


          <!-- ESTUDOS -->

          <section class="dse-section">

            <div class="dse-eyebrow">
              Aprofundamento
            </div>

            <h2 class="dse-section-title">
              Estudos teológicos
            </h2>

            <div class="dse-study">

              ${image(APP.cover)}

              <div class="dse-study-content">

                <h3 class="dse-study-title">
                  ${esc(study.title)}
                </h3>

                <p class="dse-study-text">
                  ${esc(study.description)}
                </p>

              </div>

            </div>

          </section>


          <!-- BÍBLIA -->

          <section class="dse-section">

            <div class="dse-eyebrow">
              Palavra
            </div>

            <h2 class="dse-section-title">
              A Bíblia dentro da jornada
            </h2>

            <p class="dse-section-text">
              Explore a Palavra, conecte textos, temas,
              estudos e momentos da sua caminhada.
            </p>

            <div class="dse-grid">

              <article class="dse-image-card">
                ${image(APP.cover)}
                <div class="dse-card-content">
                  <div class="dse-card-title">
                    Bíblia
                  </div>
                  <div class="dse-card-text">
                    Leia e medite na Palavra.
                  </div>
                </div>
              </article>

              <article class="dse-image-card">
                ${image(APP.cover)}
                <div class="dse-card-content">
                  <div class="dse-card-title">
                    Mapas
                  </div>
                  <div class="dse-card-text">
                    Organize sua compreensão.
                  </div>
                </div>
              </article>

              <article class="dse-image-card">
                ${image(APP.cover)}
                <div class="dse-card-content">
                  <div class="dse-card-title">
                    Planos
                  </div>
                  <div class="dse-card-text">
                    Caminhos de leitura e estudo.
                  </div>
                </div>
              </article>

              <article class="dse-image-card">
                ${image(APP.cover)}
                <div class="dse-card-content">
                  <div class="dse-card-title">
                    Práticas
                  </div>
                  <div class="dse-card-text">
                    Transforme conhecimento em experiência.
                  </div>
                </div>
              </article>

            </div>

          </section>


          <!-- FINAL -->

          <section class="dse-section">

            <div
              style="
                text-align:center;
                padding:90px 15px 50px;
              "
            >

              <div class="dse-eyebrow">
                Permaneça
              </div>

              <h2
                style="
                  margin-top:16px;
                  color:#f4ead3;
                  font-family:Georgia,serif;
                  font-size:clamp(30px,7vw,52px);
                  font-weight:400;
                  line-height:1.08;
                "
              >
                Ele já está aqui.
              </h2>

              <p
                style="
                  margin:16px auto 0;
                  max-width:520px;
                  color:#928d82;
                  font-size:14px;
                  line-height:1.8;
                "
              >
                Talvez a jornada não seja encontrar
                o Doce Espírito Santo, mas aprender a
                perceber que Ele nunca esteve longe.
              </p>

            </div>

          </section>

        </div>


        <!-- NAVEGAÇÃO -->

        <nav class="dse-bottom">

          <button
            class="dse-nav active"
            data-section="inicio"
          >
            <span class="dse-nav-icon">⌂</span>
            <span>Início</span>
          </button>

          <button
            class="dse-nav"
            id="navDevotional"
          >
            <span class="dse-nav-icon">◈</span>
            <span>Devocional</span>
          </button>

          <button
            class="dse-nav"
            id="navBible"
          >
            <span class="dse-nav-icon">▤</span>
            <span>Bíblia</span>
          </button>

          <button
            class="dse-nav"
            id="navStudies"
          >
            <span class="dse-nav-icon">◇</span>
            <span>Estudos</span>
          </button>

          <button
            class="dse-nav"
            id="navSearch"
          >
            <span class="dse-nav-icon">⌕</span>
            <span>Buscar</span>
          </button>

        </nav>


        <!-- MODAL DEVOCIONAL -->

        <div
          class="dse-modal"
          id="devotionalModal"
        >

          <div class="dse-modal-inner">

            <button
              class="dse-close"
              id="closeDevotional"
            >
              ×
            </button>

            <div class="dse-eyebrow">
              Dia ${esc(d.day)} de 365
            </div>

            <h1
              class="dse-section-title"
              style="margin-top:10px;"
            >
              ${esc(d.title)}
            </h1>

            <div class="dse-reading">

              <p>
                ${esc(d.text)}
              </p>

              <p>
                <strong style="color:#e0c37b;">
                  ${esc(d.verse)}
                </strong>
              </p>

              <p>
                Permaneça por alguns instantes em silêncio.
                Não tenha pressa para produzir uma resposta.
                Apenas perceba.
              </p>

              <p>
                O Doce Espírito Santo não é apenas um tema
                para ser estudado. Ele é uma presença para
                ser conhecida, uma comunhão para ser vivida
                e uma realidade que acompanha cada passo
                da caminhada.
              </p>

            </div>

            <div class="dse-listen">

              <button
                class="dse-play"
                id="playPrayer"
              >
                ▶
              </button>

              <div>

                <div class="dse-listen-title">
                  Ouvir oração
                </div>

                <div class="dse-listen-meta">
                  Permaneça em oração e contemplação
                </div>

              </div>

            </div>

          </div>

        </div>


        <!-- BUSCA -->

        <div
          class="dse-search-modal"
          id="searchModal"
        >

          <div class="dse-search-box">

            <button
              class="dse-close"
              id="closeSearch"
            >
              ×
            </button>

            <input
              class="dse-search-input"
              id="searchInput"
              type="search"
              placeholder="Buscar na sua jornada..."
              autocomplete="off"
            >

            <div
              class="dse-results"
              id="searchResults"
            ></div>

          </div>

        </div>

      </div>
    `;

    bindEvents();
  }

  /* ========================================================
     EVENTOS
     ======================================================== */

  function bindEvents() {

    const searchModal =
      document.getElementById("searchModal");

    const devotionalModal =
      document.getElementById("devotionalModal");

    const searchInput =
      document.getElementById("searchInput");

    const searchResults =
      document.getElementById("searchResults");


    /* BUSCA */

    function openSearch() {
      if (!searchModal) return;

      searchModal.classList.add("open");

      setTimeout(() => {
        if (searchInput) searchInput.focus();
      }, 100);
    }

    function closeSearch() {
      if (searchModal) {
        searchModal.classList.remove("open");
      }
    }

    document
      .getElementById("openSearch")
      ?.addEventListener("click", openSearch);

    document
      .getElementById("navSearch")
      ?.addEventListener("click", openSearch);

    document
      .getElementById("closeSearch")
      ?.addEventListener("click", closeSearch);


    /* DEVOCIONAL */

    function openDevotional() {
      if (devotionalModal) {
        devotionalModal.classList.add("open");
        document.body.style.overflow = "hidden";
      }
    }

    function closeDevotional() {
      if (devotionalModal) {
        devotionalModal.classList.remove("open");
        document.body.style.overflow = "";
      }
    }

    document
      .getElementById("startJourney")
      ?.addEventListener("click", openDevotional);

    document
      .getElementById("playDevotional")
      ?.addEventListener("click", openDevotional);

    document
      .getElementById("navDevotional")
      ?.addEventListener("click", openDevotional);

    document
      .getElementById("closeDevotional")
      ?.addEventListener("click", closeDevotional);


    /* ÁUDIO */

    document
      .getElementById("playPrayer")
      ?.addEventListener("click", function () {

        const audioURL =
          state.devotional?.prayerAudio ||
          state.devotional?.audio;

        if (!audioURL) {
          alert(
            "O áudio desta oração ainda não foi adicionado."
          );
          return;
        }

        playAudio(audioURL);
      });


    /* PESQUISA */

    if (searchInput) {

      searchInput.addEventListener(
        "input",
        function () {

          const term =
            this.value
              .trim()
              .toLowerCase();

          if (!searchResults) return;

          if (!term) {
            searchResults.innerHTML = "";
            return;
          }

          const items = [
            {
              title: "Devocional",
              text: state.devotional?.title || ""
            },
            ...state.studies.map(item => ({
              title: item.title,
              text: item.description
            })),
            {
              title: "Bíblia",
              text: "Palavra, textos e estudos bíblicos"
            },
            {
              title: "Práticas de presença",
              text: "Silêncio, escuta e contemplação"
            }
          ];

          const results =
            items.filter(item =>
              `${item.title} ${item.text}`
                .toLowerCase()
                .includes(term)
            );

          if (!results.length) {

            searchResults.innerHTML = `
              <div class="dse-result">
                Nenhum resultado encontrado.
              </div>
            `;

            return;
          }

          searchResults.innerHTML =
            results
              .map(item => `
                <div class="dse-result">
                  <strong>${esc(item.title)}</strong>
                  <div
                    style="
                      margin-top:5px;
                      color:#8f8a80;
                      font-size:12px;
                    "
                  >
                    ${esc(item.text)}
                  </div>
                </div>
              `)
              .join("");

        }
      );

    }


    /* NAVEGAÇÃO */

    document
      .getElementById("navBible")
      ?.addEventListener("click", function () {

        window.scrollTo({
          top: document.body.scrollHeight * .68,
          behavior: "smooth"
        });

      });

    document
      .getElementById("navStudies")
      ?.addEventListener("click", function () {

        window.scrollTo({
          top: document.body.scrollHeight * .48,
          behavior: "smooth"
        });

      });


    /* ESC */

    document.addEventListener(
      "keydown",
      function (event) {

        if (event.key !== "Escape") return;

        closeSearch();
        closeDevotional();

      }
    );
  }

  /* ========================================================
     ÁUDIO
     ======================================================== */

  function playAudio(url) {

    try {

      if (state.audio) {
        state.audio.pause();
      }

      state.audio = new Audio(url);

      state.audio.play()
        .catch(() => {
          alert(
            "Não foi possível reproduzir este áudio agora."
          );
        });

    } catch (error) {

      console.warn(
        "Erro ao reproduzir áudio:",
        error
      );

    }
  }

  /* ========================================================
     INICIALIZAÇÃO
     ======================================================== */

  async function init() {

    try {

      const devotionalData =
        await loadJSON(
          "devocionais.json",
          fallbackDevotional
        );

      const studiesData =
        await loadJSON(
          "estudos.json",
          fallbackStudies
        );

      state.devotional =
        normalizeDevotional(
          devotionalData
        );

      state.studies =
        normalizeStudies(
          studiesData
        );

      render();

      hideLoading();

      console.log(
        "Doce Espírito Santo carregado com sucesso."
      );

    } catch (error) {

      console.error(
        "Erro na inicialização:",
        error
      );

      /*
       * Mesmo que alguma coisa dê errado,
       * nunca deixamos a tela preta.
       */

      state.devotional =
        fallbackDevotional;

      state.studies =
        fallbackStudies;

      render();

      hideLoading();

    }

  }

  /* ========================================================
     START
     ======================================================== */

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();

  }

})();
