/* ============================================================
   DOCE ESPÍRITO SANTO — UM AMIGO ÍNTIMO
   NOVA INTERFACE CINEMATOGRÁFICA
   Arquivo: app.js

   IMPORTANTE:
   Este arquivo cria a nova interface e injeta o CSS automaticamente.
   Não é necessário criar Home.jsx.
============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     CONFIGURAÇÃO
  ========================================================== */

  const APP_NAME = "Doce Espírito Santo";
  const APP_SUBTITLE = "Um Amigo Íntimo";

  const IMAGES = {
    capa: "capa.jpeg",

    presence:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85",

    light:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85",

    mountains:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85",

    forest:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85",

    water:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=85",

    sunset:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85"
  };


  /* ==========================================================
     CSS
  ========================================================== */

  const style = document.createElement("style");

  style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

  :root {
    --black: #080908;
    --black-2: #0d0e0c;
    --black-3: #131512;
    --gold: #d6b77b;
    --gold-light: #efd8a7;
    --champagne: #f3e6c9;
    --cream: #e9dfc9;
    --muted: #a9a497;
    --white: #f8f6ef;
    --green: #27352b;
    --green-light: #405444;
    --border: rgba(239,216,167,.16);
  }

  * {
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  html {
    scroll-behavior: smooth;
    background: var(--black);
  }

  body {
    margin: 0;
    background:
      radial-gradient(circle at 10% 10%, rgba(74,91,65,.20), transparent 30%),
      radial-gradient(circle at 90% 20%, rgba(143,103,48,.16), transparent 30%),
      radial-gradient(circle at 50% 70%, rgba(39,53,43,.22), transparent 35%),
      linear-gradient(145deg, #070807, #10120f 45%, #090a08);
    color: var(--white);
    font-family: "Inter", sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  body::before {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    background:
      radial-gradient(circle at 50% -10%, rgba(255,214,139,.07), transparent 38%),
      linear-gradient(180deg, transparent 75%, rgba(0,0,0,.45));
  }

  button,
  input {
    font-family: inherit;
  }

  button {
    cursor: pointer;
  }

  img {
    max-width: 100%;
    display: block;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  .app-shell {
    width: 100%;
    min-height: 100vh;
    padding-bottom: 120px;
  }

  /* ==========================================================
     TOPO
  ========================================================== */

  .topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 18px 22px;

    background:
      linear-gradient(
        180deg,
        rgba(5,6,5,.90),
        rgba(5,6,5,.30),
        transparent
      );

    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .brand-mini {
    display: flex;
    flex-direction: column;
    line-height: 1;
  }

  .brand-mini strong {
    font-family: "Cormorant Garamond", serif;
    font-size: 21px;
    font-weight: 600;
    color: var(--champagne);
    letter-spacing: .02em;
  }

  .brand-mini span {
    margin-top: 4px;
    font-size: 8px;
    letter-spacing: .27em;
    text-transform: uppercase;
    color: var(--gold);
  }

  .search-button {
    width: 43px;
    height: 43px;
    border: 1px solid rgba(255,255,255,.16);
    border-radius: 50%;
    background: rgba(15,16,14,.48);
    color: var(--cream);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 19px;
    backdrop-filter: blur(12px);
  }

  /* ==========================================================
     HERO
  ========================================================== */

  .hero {
    position: relative;
    min-height: 720px;
    height: 94vh;
    max-height: 900px;

    overflow: hidden;

    display: flex;
    align-items: flex-end;

    background:
      linear-gradient(
        180deg,
        rgba(0,0,0,.12) 0%,
        rgba(0,0,0,.05) 25%,
        rgba(5,6,5,.25) 48%,
        rgba(5,6,5,.95) 100%
      ),
      linear-gradient(
        90deg,
        rgba(0,0,0,.70),
        transparent 55%,
        rgba(0,0,0,.20)
      ),
      url("capa.jpeg") center center / cover no-repeat;

    isolation: isolate;
  }

  .hero::before {
    content: "";
    position: absolute;
    inset: 0;

    background:
      radial-gradient(
        ellipse at 62% 25%,
        rgba(246,207,126,.30),
        transparent 25%
      ),
      radial-gradient(
        ellipse at 28% 50%,
        rgba(72,96,73,.22),
        transparent 30%
      ),
      linear-gradient(
        135deg,
        rgba(15,24,18,.35),
        transparent 50%,
        rgba(92,62,26,.18)
      );

    z-index: -1;
  }

  .hero::after {
    content: "";
    position: absolute;
    inset: 0;

    background:
      linear-gradient(
        180deg,
        transparent 35%,
        rgba(5,6,5,.10) 55%,
        rgba(5,6,5,.96) 100%
      );

    z-index: -1;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    width: 100%;
    padding: 0 25px 54px;
  }

  .eyebrow {
    display: flex;
    align-items: center;
    gap: 10px;

    color: var(--gold-light);
    font-size: 9px;
    letter-spacing: .32em;
    text-transform: uppercase;
    margin-bottom: 15px;
  }

  .eyebrow::before {
    content: "";
    width: 28px;
    height: 1px;
    background: var(--gold);
  }

  .hero h1 {
    margin: 0;
    max-width: 520px;

    font-family: "Cormorant Garamond", serif;
    font-size: clamp(46px, 13vw, 78px);
    line-height: .86;
    font-weight: 500;
    letter-spacing: -.025em;
  }

  .hero h1 span {
    display: block;
    color: var(--gold-light);
  }

  .hero-subtitle {
    max-width: 410px;
    margin: 20px 0 0;

    color: rgba(247,242,228,.78);
    font-family: "Cormorant Garamond", serif;
    font-size: 22px;
    line-height: 1.25;
  }

  .hero-description {
    max-width: 390px;
    margin-top: 12px;

    color: rgba(238,233,220,.62);
    font-size: 13px;
    line-height: 1.7;
  }

  .hero-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    margin-top: 25px;
    padding: 15px 23px;

    border: 1px solid rgba(239,216,167,.40);
    border-radius: 999px;

    background:
      linear-gradient(
        135deg,
        rgba(229,198,133,.98),
        rgba(170,129,63,.98)
      );

    color: #15120b;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .02em;

    box-shadow:
      0 12px 40px rgba(0,0,0,.35),
      inset 0 1px rgba(255,255,255,.45);
  }

  /* ==========================================================
     CONTEÚDO
  ========================================================== */

  .main {
    position: relative;
    z-index: 5;
    margin-top: -1px;
  }

  .section {
    padding: 48px 21px 0;
  }

  .section-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 20px;
  }

  .section-kicker {
    color: var(--gold);
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: .30em;
    margin-bottom: 6px;
  }

  .section-title {
    margin: 0;
    font-family: "Cormorant Garamond", serif;
    font-size: 32px;
    font-weight: 500;
    line-height: .95;
    color: var(--champagne);
  }

  .section-description {
    max-width: 350px;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.7;
    margin-top: 9px;
  }

  .section-link {
    color: var(--gold-light);
    font-size: 10px;
    white-space: nowrap;
  }

  /* ==========================================================
     DEVOCIONAL DE HOJE
  ========================================================== */

  .today-card {
    position: relative;
    overflow: hidden;

    min-height: 400px;
    border-radius: 28px;

    display: flex;
    align-items: flex-end;

    background:
      linear-gradient(
        180deg,
        transparent 25%,
        rgba(0,0,0,.18) 40%,
        rgba(0,0,0,.94) 100%
      ),
      url("${IMAGES.presence}") center / cover;
    
    border: 1px solid rgba(255,255,255,.10);

    box-shadow:
      0 25px 80px rgba(0,0,0,.30),
      inset 0 0 80px rgba(0,0,0,.20);
  }

  .today-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(
        circle at 70% 20%,
        rgba(244,208,132,.20),
        transparent 30%
      );
  }

  .today-content {
    position: relative;
    z-index: 2;
    padding: 27px;
    width: 100%;
  }

  .day-label {
    color: var(--gold-light);
    font-size: 9px;
    letter-spacing: .22em;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .today-title {
    font-family: "Cormorant Garamond", serif;
    font-size: 36px;
    line-height: .95;
    margin: 0;
    max-width: 370px;
  }

  .today-excerpt {
    color: rgba(255,255,255,.70);
    font-size: 12px;
    line-height: 1.65;
    margin: 13px 0 18px;
    max-width: 390px;
  }

  .today-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
  }

  .button-light,
  .button-outline {
    border-radius: 999px;
    padding: 11px 16px;
    font-size: 10px;
    border: 1px solid rgba(255,255,255,.18);
  }

  .button-light {
    background: var(--champagne);
    color: #16130c;
  }

  .button-outline {
    background: rgba(0,0,0,.22);
    color: var(--champagne);
    backdrop-filter: blur(10px);
  }

  /* ==========================================================
     PRÁTICAS — IMAGENS, SEM ÍCONES EM QUADRADOS
  ========================================================== */

  .image-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 11px;
  }

  .image-card {
    position: relative;
    min-height: 185px;
    overflow: hidden;
    border-radius: 22px;

    display: flex;
    align-items: flex-end;

    border: 1px solid rgba(255,255,255,.09);

    background-size: cover;
    background-position: center;

    transition:
      transform .25s ease,
      border-color .25s ease;
  }

  .image-card:active {
    transform: scale(.98);
  }

  .image-card::after {
    content: "";
    position: absolute;
    inset: 0;

    background:
      linear-gradient(
        180deg,
        transparent 25%,
        rgba(0,0,0,.82) 100%
      );
  }

  .image-card-content {
    position: relative;
    z-index: 2;
    padding: 18px;
  }

  .image-card h3 {
    margin: 0;
    font-family: "Cormorant Garamond", serif;
    font-size: 23px;
    font-weight: 500;
  }

  .image-card p {
    margin: 5px 0 0;
    color: rgba(255,255,255,.62);
    font-size: 9px;
    line-height: 1.45;
  }

  /* ==========================================================
     JORNADA 365
  ========================================================== */

  .journey {
    position: relative;
    min-height: 300px;
    border-radius: 27px;
    overflow: hidden;

    background:
      linear-gradient(
        90deg,
        rgba(0,0,0,.86),
        rgba(0,0,0,.22)
      ),
      url("${IMAGES.mountains}") center / cover;
  }

  .journey-content {
    position: relative;
    z-index: 2;
    padding: 28px;
    max-width: 420px;
  }

  .journey-number {
    font-family: "Cormorant Garamond", serif;
    font-size: 82px;
    line-height: .75;
    color: rgba(239,216,167,.22);
  }

  .journey h3 {
    margin: 24px 0 8px;
    font-family: "Cormorant Garamond", serif;
    font-size: 34px;
    font-weight: 500;
  }

  .journey p {
    margin: 0;
    color: rgba(255,255,255,.66);
    font-size: 11px;
    line-height: 1.65;
  }

  .progress-wrap {
    margin-top: 22px;
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    color: rgba(255,255,255,.56);
    font-size: 9px;
    margin-bottom: 7px;
  }

  .progress {
    height: 3px;
    background: rgba(255,255,255,.14);
    border-radius: 99px;
    overflow: hidden;
  }

  .progress span {
    display: block;
    height: 100%;
    width: 4%;
    background: linear-gradient(90deg, var(--gold), var(--gold-light));
  }

  /* ==========================================================
     ESTUDOS
  ========================================================== */

  .study-card {
    position: relative;
    min-height: 230px;
    overflow: hidden;
    border-radius: 25px;

    background:
      linear-gradient(
        90deg,
        rgba(5,6,5,.92),
        rgba(5,6,5,.25)
      ),
      url("${IMAGES.light}") center / cover;

    display: flex;
    align-items: center;
    padding: 28px;

    border: 1px solid rgba(255,255,255,.08);
  }

  .study-card-content {
    max-width: 390px;
  }

  .study-card h3 {
    margin: 0;
    font-family: "Cormorant Garamond", serif;
    font-size: 35px;
    font-weight: 500;
  }

  .study-card p {
    color: rgba(255,255,255,.64);
    font-size: 11px;
    line-height: 1.7;
  }

  /* ==========================================================
     BÍBLIA
  ========================================================== */

  .bible-card {
    display: grid;
    grid-template-columns: 1.2fr .8fr;
    min-height: 220px;
    overflow: hidden;
    border-radius: 24px;

    background:
      linear-gradient(
        135deg,
        #1c211c,
        #0d100e
      );

    border: 1px solid rgba(239,216,167,.12);
  }

  .bible-content {
    padding: 27px;
  }

  .bible-content h3 {
    margin: 0;
    font-family: "Cormorant Garamond", serif;
    font-size: 31px;
    font-weight: 500;
  }

  .bible-content p {
    color: var(--muted);
    font-size: 10px;
    line-height: 1.6;
  }

  .bible-image {
    background:
      linear-gradient(
        90deg,
        #1c211c,
        transparent
      ),
      url("${IMAGES.water}") center / cover;
  }

  /* ==========================================================
     ÁUDIO
  ========================================================== */

  .audio-player {
    margin-top: 16px;
    padding: 17px;

    border-radius: 20px;
    border: 1px solid rgba(239,216,167,.13);

    background:
      linear-gradient(
        135deg,
        rgba(255,255,255,.06),
        rgba(255,255,255,.025)
      );

    backdrop-filter: blur(18px);
  }

  .audio-top {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .audio-play {
    width: 43px;
    height: 43px;
    border: 0;
    border-radius: 50%;

    background: var(--champagne);
    color: #17130b;

    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 14px;
  }

  .audio-title {
    font-family: "Cormorant Garamond", serif;
    font-size: 20px;
  }

  .audio-subtitle {
    color: var(--muted);
    font-size: 8px;
    margin-top: 3px;
  }

  .audio-progress {
    margin-top: 14px;
    height: 3px;
    background: rgba(255,255,255,.13);
    border-radius: 99px;
    overflow: hidden;
  }

  .audio-progress span {
    display: block;
    width: 0;
    height: 100%;
    background: var(--gold);
  }

  /* ==========================================================
     BUSCA
  ========================================================== */

  .search-overlay {
    position: fixed;
    inset: 0;
    z-index: 5000;

    display: none;
    align-items: flex-start;
    justify-content: center;

    padding: 90px 20px 30px;

    background:
      radial-gradient(
        circle at 50% 0%,
        rgba(70,80,57,.25),
        transparent 35%
      ),
      rgba(4,5,4,.96);

    backdrop-filter: blur(25px);
  }

  .search-overlay.active {
    display: flex;
  }

  .search-box {
    width: 100%;
    max-width: 650px;
  }

  .search-input {
    width: 100%;
    padding: 18px 0;

    background: transparent;
    border: 0;
    border-bottom: 1px solid rgba(239,216,167,.25);

    color: var(--white);

    font-family: "Cormorant Garamond", serif;
    font-size: 34px;
    outline: none;
  }

  .search-input::placeholder {
    color: rgba(255,255,255,.25);
  }

  .search-results {
    margin-top: 25px;
  }

  .search-result {
    padding: 15px 0;
    border-bottom: 1px solid rgba(255,255,255,.08);
  }

  .search-result small {
    color: var(--gold);
    text-transform: uppercase;
    letter-spacing: .16em;
    font-size: 7px;
  }

  .search-result strong {
    display: block;
    margin-top: 4px;
    font-family: "Cormorant Garamond", serif;
    font-size: 23px;
    font-weight: 500;
  }

  .close-search {
    position: fixed;
    top: 20px;
    right: 20px;

    width: 40px;
    height: 40px;

    border-radius: 50%;
    border: 1px solid rgba(255,255,255,.14);

    background: rgba(255,255,255,.05);
    color: white;
  }

  /* ==========================================================
     NAVEGAÇÃO INFERIOR
  ========================================================== */

  .bottom-nav {
    position: fixed;
    left: 14px;
    right: 14px;
    bottom: 13px;
    z-index: 2000;

    display: flex;
    align-items: center;
    justify-content: space-around;

    min-height: 65px;

    border-radius: 25px;
    border: 1px solid rgba(255,255,255,.12);

    background:
      linear-gradient(
        135deg,
        rgba(24,26,22,.78),
        rgba(10,11,10,.78)
      );

    box-shadow:
      0 18px 60px rgba(0,0,0,.55);

    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
  }

  .nav-item {
    border: 0;
    background: transparent;
    color: rgba(255,255,255,.42);

    font-size: 8px;
    letter-spacing: .05em;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;

    padding: 8px 12px;
  }

  .nav-item.active {
    color: var(--gold-light);
  }

  .nav-item span:first-child {
    font-family: "Cormorant Garamond", serif;
    font-size: 16px;
  }

  /* ==========================================================
     MODAL DO DEVOCIONAL
  ========================================================== */

  .devotional-view {
    position: fixed;
    inset: 0;
    z-index: 4000;

    display: none;
    overflow-y: auto;

    background:
      radial-gradient(
        circle at 50% 0%,
        rgba(80,94,65,.20),
        transparent 35%
      ),
      #090a08;

    padding-bottom: 100px;
  }

  .devotional-view.active {
    display: block;
  }

  .devotional-header {
    position: sticky;
    top: 0;
    z-index: 2;

    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 17px 20px;

    background: rgba(8,9,8,.76);
    backdrop-filter: blur(18px);
  }

  .back-button {
    border: 0;
    background: transparent;
    color: var(--champagne);
    font-size: 13px;
  }

  .devotional-inner {
    max-width: 720px;
    margin: auto;
    padding: 35px 23px;
  }

  .devotional-day {
    color: var(--gold);
    text-transform: uppercase;
    letter-spacing: .25em;
    font-size: 8px;
  }

  .devotional-title {
    margin: 12px 0 20px;
    font-family: "Cormorant Garamond", serif;
    font-size: clamp(42px, 11vw, 68px);
    line-height: .88;
    font-weight: 500;
  }

  .devotional-text {
    color: rgba(245,241,228,.78);
    font-family: "Cormorant Garamond", serif;
    font-size: 21px;
    line-height: 1.55;
  }

  .devotional-text p {
    margin: 0 0 20px;
  }

  .verse {
    margin: 28px 0;
    padding: 22px;

    border-left: 1px solid var(--gold);

    background: rgba(255,255,255,.035);

    color: var(--champagne);
    font-family: "Cormorant Garamond", serif;
    font-size: 23px;
    line-height: 1.4;
  }

  .prayer-card {
    margin-top: 35px;
    padding: 25px;

    border-radius: 22px;

    background:
      linear-gradient(
        145deg,
        rgba(75,83,62,.28),
        rgba(180,134,65,.10)
      );

    border: 1px solid rgba(239,216,167,.15);
  }

  .prayer-card h3 {
    font-family: "Cormorant Garamond", serif;
    font-size: 28px;
    font-weight: 500;
    margin: 0 0 12px;
  }

  .prayer-card p {
    color: rgba(255,255,255,.70);
    font-family: "Cormorant Garamond", serif;
    font-size: 19px;
    line-height: 1.55;
  }

  /* ==========================================================
     RESPONSIVO
  ========================================================== */

  @media (min-width: 700px) {

    .topbar {
      padding-left: 40px;
      padding-right: 40px;
    }

    .hero-content {
      padding-left: 8%;
      padding-bottom: 75px;
    }

    .section {
      max-width: 1050px;
      margin: auto;
      padding-left: 35px;
      padding-right: 35px;
    }

    .image-grid {
      grid-template-columns: repeat(4, 1fr);
    }

    .image-card {
      min-height: 260px;
    }

    .today-card {
      min-height: 480px;
    }

    .journey {
      min-height: 360px;
    }

    .bottom-nav {
      left: 50%;
      right: auto;
      width: 530px;
      transform: translateX(-50%);
    }
  }

  @media (max-width: 380px) {
    .hero {
      min-height: 670px;
    }

    .hero h1 {
      font-size: 45px;
    }

    .section-title {
      font-size: 29px;
    }

    .image-card {
      min-height: 165px;
    }
  }
  `;

  document.head.appendChild(style);


  /* ==========================================================
     ESTRUTURA PRINCIPAL
  ========================================================== */

  const root = document.body;

  root.innerHTML = `
    <div class="app-shell">

      <header class="topbar">

        <div class="brand-mini">
          <strong>Doce Espírito Santo</strong>
          <span>Um Amigo Íntimo</span>
        </div>

        <button
          class="search-button"
          id="openSearch"
          aria-label="Pesquisar">
          ⌕
        </button>

      </header>


      <!-- HERO -->

      <section class="hero">

        <div class="hero-content">

          <div class="eyebrow">
            Uma jornada de presença
          </div>

          <h1>
            Doce Espírito
            <span>Santo</span>
          </h1>

          <div class="hero-subtitle">
            Um Amigo Íntimo
          </div>

          <p class="hero-description">
            Ele já está aqui.
            Aprenda a percebê-lo.
          </p>

          <button
            class="hero-button"
            id="startJourney">
            Começar minha jornada
          </button>

        </div>

      </section>


      <main class="main">

        <!-- HOJE -->

        <section class="section">

          <div class="section-header">

            <div>
              <div class="section-kicker">
                Hoje
              </div>

              <h2 class="section-title">
                Um encontro com a Presença
              </h2>
            </div>

          </div>

          <article class="today-card">

            <div class="today-content">

              <div class="day-label" id="todayDay">
                DIA 1
              </div>

              <h3 class="today-title" id="todayTitle">
                A Presença que já está aqui
              </h3>

              <p class="today-excerpt" id="todayExcerpt">
                Antes de procurarmos a presença do Doce Espírito Santo,
                precisamos aprender a perceber que Ele já está aqui.
              </p>

              <div class="today-actions">

                <button
                  class="button-light"
                  id="openToday">
                  Entrar no devocional
                </button>

                <button
                  class="button-outline"
                  id="listenToday">
                  Ouvir devocional
                </button>

              </div>

            </div>

          </article>

          <div id="todayAudio"></div>

        </section>


        <!-- PRÁTICAS -->

        <section class="section">

          <div class="section-header">

            <div>

              <div class="section-kicker">
                Prática da presença
              </div>

              <h2 class="section-title">
                Aprenda a percebê-lo
              </h2>

              <p class="section-description">
                Pequenas práticas para transformar o cotidiano
                em lugar de encontro.
              </p>

            </div>

          </div>


          <div class="image-grid">

            <article
              class="image-card"
              style="background-image:url('${IMAGES.forest}')">

              <div class="image-card-content">

                <h3>
                  Tempo com Ele
                </h3>

                <p>
                  Silêncio, presença e permanência.
                </p>

              </div>

            </article>


            <article
              class="image-card"
              style="background-image:url('${IMAGES.light}')">

              <div class="image-card-content">

                <h3>
                  Escuta
                </h3>

                <p>
                  Sensibilidade para perceber Sua presença.
                </p>

              </div>

            </article>


            <article
              class="image-card"
              style="background-image:url('${IMAGES.water}')">

              <div class="image-card-content">

                <h3>
                  Contemplação
                </h3>

                <p>
                  Permanecer antes de tentar produzir.
                </p>

              </div>

            </article>


            <article
              class="image-card"
              style="background-image:url('${IMAGES.sunset}')">

              <div class="image-card-content">

                <h3>
                  Vida diária
                </h3>

                <p>
                  Encontrá-lo também no ordinário.
                </p>

              </div>

            </article>

          </div>

        </section>


        <!-- JORNADA -->

        <section class="section">

          <div class="section-header">

            <div>

              <div class="section-kicker">
                A jornada
              </div>

              <h2 class="section-title">
                365 dias
              </h2>

            </div>

          </div>


          <article class="journey">

            <div class="journey-content">

              <div class="journey-number">
                365
              </div>

              <h3>
                Um ano aprendendo a percebê-lo.
              </h3>

              <p>
                Uma caminhada progressiva de intimidade,
                conhecimento, prática e presença.
              </p>

              <div class="progress-wrap">

                <div class="progress-info">
                  <span id="journeyProgressText">
                    Dia 1 de 365
                  </span>

                  <span id="journeyPercent">
                    0%
                  </span>
                </div>

                <div class="progress">
                  <span id="journeyProgress"></span>
                </div>

              </div>

            </div>

          </article>

        </section>


        <!-- ESTUDOS -->

        <section class="section">

          <div class="section-header">

            <div>

              <div class="section-kicker">
                Profundidade
              </div>

              <h2 class="section-title">
                Estudos teológicos
              </h2>

              <p class="section-description">
                Vá além da leitura devocional.
                Conheça, investigue e contemple.
              </p>

            </div>

          </div>


          <article
            class="study-card"
            id="openStudies">

            <div class="study-card-content">

              <h3>
                Conhecer para aprofundar.
              </h3>

              <p>
                Estudos bíblicos, teologia do Espírito Santo,
                contexto histórico, referências e mapas de estudo.
              </p>

              <button
                class="button-light"
                id="studiesButton">
                Explorar estudos
              </button>

            </div>

          </article>

        </section>


        <!-- BÍBLIA -->

        <section class="section">

          <div class="section-header">

            <div>

              <div class="section-kicker">
                Escrituras
              </div>

              <h2 class="section-title">
                A Bíblia no centro
              </h2>

            </div>

          </div>


          <article class="bible-card">

            <div class="bible-content">

              <h3>
                Palavra, contexto e presença.
              </h3>

              <p>
                Leia as Escrituras enquanto percorre
                sua jornada com o Doce Espírito Santo.
              </p>

              <button class="button-outline">
                Abrir Bíblia
              </button>

            </div>

            <div class="bible-image"></div>

          </article>

        </section>


        <!-- ENCERRAMENTO -->

        <section class="section" style="padding-bottom:30px">

          <div
            style="
              min-height:330px;
              border-radius:28px;
              overflow:hidden;
              display:flex;
              align-items:flex-end;
              background:
                linear-gradient(
                  180deg,
                  transparent,
                  rgba(0,0,0,.88)
                ),
                url('${IMAGES.sunset}') center/cover;
            "
          >

            <div style="padding:30px">

              <div class="section-kicker">
                Permaneça
              </div>

              <div
                style="
                  font-family:'Cormorant Garamond',serif;
                  font-size:40px;
                  line-height:.95;
                  max-width:430px;
                "
              >
                Ele já está aqui.
                <br>
                Aprenda a percebê-lo.
              </div>

            </div>

          </div>

        </section>

      </main>


      <!-- NAVEGAÇÃO -->

      <nav class="bottom-nav">

        <button
          class="nav-item active"
          data-nav="home">

          <span>Início</span>

        </button>

        <button
          class="nav-item"
          data-nav="journey">

          <span>Jornada</span>

        </button>

        <button
          class="nav-item"
          data-nav="today">

          <span>Hoje</span>

        </button>

        <button
          class="nav-item"
          data-nav="studies">

          <span>Estudos</span>

        </button>

      </nav>


      <!-- BUSCA -->

      <div
        class="search-overlay"
        id="searchOverlay">

        <button
          class="close-search"
          id="closeSearch">
          ×
        </button>

        <div class="search-box">

          <input
            id="searchInput"
            class="search-input"
            type="search"
            placeholder="O que você deseja encontrar?"
            autocomplete="off"
          >

          <div
            class="search-results"
            id="searchResults">
          </div>

        </div>

      </div>


      <!-- DEVOCIONAL -->

      <div
        class="devotional-view"
        id="devotionalView">

        <header class="devotional-header">

          <button
            class="back-button"
            id="closeDevotional">
            ← Voltar
          </button>

          <span
            style="
              color:var(--gold);
              font-size:8px;
              letter-spacing:.22em;
              text-transform:uppercase;
            ">
            Doce Espírito Santo
          </span>

        </header>

        <div class="devotional-inner">

          <div
            class="devotional-day"
            id="devotionalDay">
            DIA 1
          </div>

          <h1
            class="devotional-title"
            id="devotionalTitle">
            A Presença que já está aqui
          </h1>

          <div
            class="audio-player"
            id="devotionalPlayer">

            <div class="audio-top">

              <button
                class="audio-play"
                id="audioPlay">
                ▶
              </button>

              <div>

                <div class="audio-title">
                  Ouvir devocional completo
                </div>

                <div class="audio-subtitle">
                  Permaneça ouvindo enquanto contempla.
                </div>

              </div>

            </div>

            <div class="audio-progress">
              <span id="audioProgress"></span>
            </div>

          </div>

          <article
            class="devotional-text"
            id="devotionalText">

            <p>
              Antes de procurar sinais extraordinários,
              aprenda a perceber a presença que já está diante de você.
            </p>

            <div class="verse">
              “Não sabeis vós que sois santuário de Deus
              e que o Espírito de Deus habita em vós?”
            </div>

            <p>
              A jornada começa não com uma tentativa de trazer
              o Doce Espírito Santo para perto, mas com a consciência
              de que Ele já está aqui.
            </p>

          </article>

          <div class="prayer-card">

            <h3>
              Oração
            </h3>

            <p id="prayerText">
              Doce Espírito Santo, ensina-me a perceber Sua presença.
              Tira de mim a pressa, o ruído e a distração.
              Quero aprender a permanecer.
            </p>

            <button
              class="button-light"
              id="prayerAudio">
              Ouvir oração
            </button>

          </div>

        </div>

      </div>

    </div>
  `;


  /* ==========================================================
     DADOS
  ========================================================== */

  let devotionals = [];
  let studies = [];
  let currentDevotional = null;

  async function loadData() {

    try {
      const response = await fetch("devocionais.json", {
        cache: "no-store"
      });

      if (response.ok) {
        const data = await response.json();

        if (Array.isArray(data)) {
          devotionals = data;
        } else if (Array.isArray(data.devocionais)) {
          devotionals = data.devocionais;
        } else if (Array.isArray(data.days)) {
          devotionals = data.days;
        }
      }

    } catch (error) {
      console.warn("Não foi possível carregar devocionais.json", error);
    }


    try {

      const response = await fetch("estudos.json", {
        cache: "no-store"
      });

      if (response.ok) {

        const data = await response.json();

        if (Array.isArray(data)) {
          studies = data;
        } else if (Array.isArray(data.estudos)) {
          studies = data.estudos;
        }

      }

    } catch (error) {
      console.warn("Não foi possível carregar estudos.json", error);
    }

    updateToday();

  }


  /* ==========================================================
     LOCALIZAR CAMPOS DO JSON
  ========================================================== */

  function getField(item, names, fallback = "") {

    if (!item) return fallback;

    for (const name of names) {

      if (
        item[name] !== undefined &&
        item[name] !== null &&
        item[name] !== ""
      ) {
        return item[name];
      }

    }

    return fallback;
  }


  /* ==========================================================
     DEVOCIONAL DE HOJE
  ========================================================== */

  function getTodayDevotional() {

    if (!devotionals.length) {

      return {
        day: 1,
        title: "A Presença que já está aqui",
        excerpt:
          "Antes de procurarmos a presença do Doce Espírito Santo, precisamos aprender a perceber que Ele já está aqui.",
        text: `
          <p>
            Antes de procurar sinais extraordinários,
            aprenda a perceber a presença que já está diante de você.
          </p>

          <div class="verse">
            “Não sabeis vós que sois santuário de Deus
            e que o Espírito de Deus habita em vós?”
          </div>

          <p>
            A jornada começa não com uma tentativa de trazer
            o Doce Espírito Santo para perto, mas com a consciência
            de que Ele já está aqui.
          </p>
        `,
        prayer:
          "Doce Espírito Santo, ensina-me a perceber Sua presença. Tira de mim a pressa, o ruído e a distração. Quero aprender a permanecer."
      };

    }


    const index = getSavedDay() - 1;

    const item = devotionals[
      Math.max(0, Math.min(index, devotionals.length - 1))
    ];


    return {

      original: item,

      day: getField(
        item,
        ["dia", "day", "numero", "number"],
        getSavedDay()
      ),

      title: getField(
        item,
        ["titulo", "title", "nome", "name"],
        "A Presença que já está aqui"
      ),

      excerpt: getField(
        item,
        ["resumo", "excerpt", "descricao", "description"],
        "Um encontro com a Presença."
      ),

      text: getField(
        item,
        ["conteudo", "texto", "text", "devocional", "body"],
        "<p>Permaneça nesta reflexão e permita que o Doce Espírito Santo conduza este momento.</p>"
      ),

      prayer: getField(
        item,
        ["oracao", "oração", "prayer"],
        "Doce Espírito Santo, ensina-me a perceber Sua presença."
      ),

      audio: getField(
        item,
        ["audio", "audioUrl", "audio_url", "urlAudio"],
        ""
      ),

      prayerAudio: getField(
        item,
        ["audioOracao", "audioOração", "prayerAudio"],
        ""
      )

    };

  }


  /* ==========================================================
     DIA SALVO
  ========================================================== */

  function getSavedDay() {

    const saved =
      Number(localStorage.getItem("doce-espirito-dia"));

    if (
      Number.isFinite(saved) &&
      saved >= 1
    ) {
      return saved;
    }

    return 1;
  }


  function saveDay(day) {

    localStorage.setItem(
      "doce-espirito-dia",
      String(day)
    );

  }


  /* ==========================================================
     ATUALIZA HOME
  ========================================================== */

  function updateToday() {

    currentDevotional = getTodayDevotional();

    document.getElementById("todayDay").textContent =
      "DIA " + currentDevotional.day;

    document.getElementById("todayTitle").textContent =
      currentDevotional.title;

    document.getElementById("todayExcerpt").textContent =
      currentDevotional.excerpt;


    const day = Number(currentDevotional.day) || 1;

    const percent =
      Math.min(100, Math.round((day / 365) * 100));

    document.getElementById(
      "journeyProgressText"
    ).textContent =
      `Dia ${day} de 365`;

    document.getElementById(
      "journeyPercent"
    ).textContent =
      `${percent}%`;

    document.getElementById(
      "journeyProgress"
    ).style.width =
      `${percent}%`;

  }


  /* ==========================================================
     ABRIR DEVOCIONAL
  ========================================================== */

  function openDevotional(devotional = currentDevotional) {

    if (!devotional) return;

    currentDevotional = devotional;

    const view =
      document.getElementById("devotionalView");

    document.getElementById(
      "devotionalDay"
    ).textContent =
      "DIA " + devotional.day;

    document.getElementById(
      "devotionalTitle"
    ).textContent =
      devotional.title;

    document.getElementById(
      "devotionalText"
    ).innerHTML =
      devotional.text || "<p>Permaneça nesta reflexão.</p>";

    document.getElementById(
      "prayerText"
    ).textContent =
      devotional.prayer ||
      "Doce Espírito Santo, ensina-me a permanecer.";

    view.classList.add("active");

    document.body.style.overflow = "hidden";

  }


  function closeDevotional() {

    document
      .getElementById("devotionalView")
      .classList.remove("active");

    document.body.style.overflow = "";

  }


  /* ==========================================================
     ÁUDIO
  ========================================================== */

  let audio = null;

  function playDevotionalAudio() {

    if (!currentDevotional) return;

    const url = currentDevotional.audio;

    if (!url) {

      alert(
        "O áudio deste devocional ainda não foi configurado."
      );

      return;
    }


    if (!audio || audio.src !== new URL(url, location.href).href) {

      audio = new Audio(url);

      audio.addEventListener(
        "timeupdate",
        updateAudioProgress
      );

      audio.addEventListener(
        "ended",
        () => {
          document.getElementById(
            "audioPlay"
          ).textContent = "▶";
        }
      );

    }


    if (audio.paused) {

      audio.play();

      document.getElementById(
        "audioPlay"
      ).textContent = "Ⅱ";

    } else {

      audio.pause();

      document.getElementById(
        "audioPlay"
      ).textContent = "▶";

    }

  }


  function updateAudioProgress() {

    if (!audio || !audio.duration) return;

    const percent =
      (audio.currentTime / audio.duration) * 100;

    document.getElementById(
      "audioProgress"
    ).style.width =
      `${percent}%`;

  }


  /* ==========================================================
     BUSCA
  ========================================================== */

  const searchOverlay =
    document.getElementById("searchOverlay");

  const searchInput =
    document.getElementById("searchInput");

  const searchResults =
    document.getElementById("searchResults");


  function openSearch() {

    searchOverlay.classList.add("active");

    setTimeout(
      () => searchInput.focus(),
      100
    );

  }


  function closeSearch() {

    searchOverlay.classList.remove("active");

    searchInput.value = "";

    searchResults.innerHTML = "";

  }


  function performSearch(query) {

    query =
      String(query || "")
        .trim()
        .toLowerCase();


    if (!query) {

      searchResults.innerHTML = "";

      return;

    }


    const devotionalResults =
      devotionals
        .map((item, index) => {

          const title =
            getField(
              item,
              ["titulo", "title", "nome", "name"],
              `Dia ${index + 1}`
            );

          const text =
            getField(
              item,
              ["conteudo", "texto", "text", "devocional"],
              ""
            );

          return {
            item,
            index,
            title,
            text,
            type: "Devocional"
          };

        })
        .filter(item =>
          `${item.title} ${item.text}`
            .toLowerCase()
            .includes(query)
        )
        .slice(0, 10);


    const studyResults =
      studies
        .map((item, index) => {

          const title =
            getField(
              item,
              ["titulo", "title", "nome", "name"],
              `Estudo ${index + 1}`
            );

          const text =
            getField(
              item,
              ["conteudo", "texto", "text", "descricao"],
              ""
            );

          return {
            item,
            index,
            title,
            text,
            type: "Estudo"
          };

        })
        .filter(item =>
          `${item.title} ${item.text}`
            .toLowerCase()
            .includes(query)
        )
        .slice(0, 10);


    const results = [
      ...devotionalResults,
      ...studyResults
    ];


    if (!results.length) {

      searchResults.innerHTML = `
        <div
          style="
            color:rgba(255,255,255,.45);
            padding:25px 0;
            font-family:'Cormorant Garamond',serif;
            font-size:22px;
          ">
          Nenhum resultado encontrado.
        </div>
      `;

      return;

    }


    searchResults.innerHTML =
      results
        .map((result, resultIndex) => `

          <button
            class="search-result"
            data-result="${resultIndex}"
            style="
              width:100%;
              background:transparent;
              border:0;
              color:white;
              text-align:left;
            ">

            <small>
              ${result.type}
            </small>

            <strong>
              ${escapeHtml(result.title)}
            </strong>

          </button>

        `)
        .join("");


    searchResults
      .querySelectorAll(".search-result")
      .forEach((button, index) => {

        button.addEventListener(
          "click",
          () => {

            const result = results[index];

            if (result.type === "Devocional") {

              const item = result.item;

              openDevotional({

                original: item,

                day: getField(
                  item,
                  ["dia", "day", "numero", "number"],
                  result.index + 1
                ),

                title: result.title,

                excerpt: getField(
                  item,
                  ["resumo", "excerpt", "descricao"],
                  ""
                ),

                text: getField(
                  item,
                  ["conteudo", "texto", "text", "devocional"],
                  ""
                ),

                prayer: getField(
                  item,
                  ["oracao", "oração", "prayer"],
                  ""
                ),

                audio: getField(
                  item,
                  ["audio", "audioUrl", "audio_url"],
                  ""
                )

              });

              closeSearch();

            }

          }
        );

      });

  }


  function escapeHtml(value) {

    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  }


  /* ==========================================================
     NAVEGAÇÃO
  ========================================================== */

  function scrollToSection(selector) {

    const element =
      document.querySelector(selector);

    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }


  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

      item.addEventListener(
        "click",
        () => {

          document
            .querySelectorAll(".nav-item")
            .forEach(nav =>
              nav.classList.remove("active")
            );

          item.classList.add("active");

          const nav =
            item.dataset.nav;

          if (nav === "home") {

            window.scrollTo({
              top: 0,
              behavior: "smooth"
            });

          }

          if (nav === "journey") {

            scrollToSection(".journey");

          }

          if (nav === "today") {

            scrollToSection(".today-card");

          }

          if (nav === "studies") {

            scrollToSection(".study-card");

          }

        }
      );

    });


  /* ==========================================================
     EVENTOS
  ========================================================== */

  document
    .getElementById("openSearch")
    .addEventListener(
      "click",
      openSearch
    );


  document
    .getElementById("closeSearch")
    .addEventListener(
      "click",
      closeSearch
    );


  searchInput.addEventListener(
    "input",
    event =>
      performSearch(event.target.value)
  );


  document
    .getElementById("startJourney")
    .addEventListener(
      "click",
      () => {

        scrollToSection(".today-card");

      }
    );


  document
    .getElementById("openToday")
    .addEventListener(
      "click",
      () => openDevotional()
    );


  document
    .getElementById("listenToday")
    .addEventListener(
      "click",
      () => {

        openDevotional();

        setTimeout(
          playDevotionalAudio,
          300
        );

      }
    );


  document
    .getElementById("closeDevotional")
    .addEventListener(
      "click",
      closeDevotional
    );


  document
    .getElementById("audioPlay")
    .addEventListener(
      "click",
      playDevotionalAudio
    );


  document
    .getElementById("prayerAudio")
    .addEventListener(
      "click",
      () => {

        const url =
          currentDevotional &&
          currentDevotional.prayerAudio;

        if (!url) {

          alert(
            "O áudio da oração ainda não foi configurado."
          );

          return;

        }

        const prayer =
          new Audio(url);

        prayer.play();

      }
    );


  document
    .getElementById("studiesButton")
    .addEventListener(
      "click",
      () => {

        alert(
          "A área de estudos continuará conectada ao seu conteúdo de estudos.json."
        );

      }
    );


  document.addEventListener(
    "keydown",
    event => {

      if (event.key === "Escape") {

        closeSearch();
        closeDevotional();

      }

    }
  );


  /* ==========================================================
     INICIALIZAÇÃO
  ========================================================== */

  loadData();

})();
