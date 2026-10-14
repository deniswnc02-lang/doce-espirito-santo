/* =========================================================
   DOCE ESPÍRITO SANTO — UM AMIGO ÍNTIMO
   APP ENGINE
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     CONFIGURAÇÃO
     ======================================================= */

  const CONFIG = {
    DEVOCIONAIS: "./devocionais.json",
    ESTUDOS: "./estudos.json",

    STORAGE: {
      COMPLETOS: "doce_espirito_completos_v3",
      FAVORITOS: "doce_espirito_favoritos_v3",
      DIA_ATUAL: "doce_espirito_dia_v3"
    }
  };

  const state = {
    devocionais: [],
    estudos: [],
    completos: [],
    favoritos: [],
    diaAtual: 1,
    telaAtual: "inicio",
    carregado: false
  };


  /* =======================================================
     UTILITÁRIOS
     ======================================================= */

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  function escapeHTML(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getJSON(url) {
    return fetch(`${url}?v=${Date.now()}`, {
      cache: "no-store"
    }).then(response => {
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${url}`);
      }

      return response.json();
    });
  }

  function readStorage(key, fallback = []) {
    try {
      const value = localStorage.getItem(key);

      if (!value) {
        return fallback;
      }

      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn("Não foi possível salvar no armazenamento.");
    }
  }


  /* =======================================================
     NORMALIZAÇÃO DOS DADOS
     ======================================================= */

  function normalizarDevocionais(data) {

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.devocionais)) {
      return data.devocionais;
    }

    if (Array.isArray(data?.dias)) {
      return data.dias;
    }

    return [];
  }


  function normalizarEstudos(data) {

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.estudos)) {
      return data.estudos;
    }

    return [];
  }


  /* =======================================================
     CARREGAMENTO
     ======================================================= */

  async function carregarConteudo() {

    const resultados = await Promise.allSettled([
      getJSON(CONFIG.DEVOCIONAIS),
      getJSON(CONFIG.ESTUDOS)
    ]);

    const devocionais = resultados[0];
    const estudos = resultados[1];

    if (devocionais.status === "fulfilled") {
      state.devocionais =
        normalizarDevocionais(devocionais.value);
    } else {
      console.warn(
        "Não foi possível carregar devocionais.json",
        devocionais.reason
      );
    }

    if (estudos.status === "fulfilled") {
      state.estudos =
        normalizarEstudos(estudos.value);
    } else {
      console.warn(
        "Não foi possível carregar estudos.json",
        estudos.reason
      );
    }

    state.completos = readStorage(
      CONFIG.STORAGE.COMPLETOS,
      []
    );

    state.favoritos = readStorage(
      CONFIG.STORAGE.FAVORITOS,
      []
    );

    const diaSalvo = Number(
      localStorage.getItem(CONFIG.STORAGE.DIA_ATUAL)
    );

    if (Number.isFinite(diaSalvo) && diaSalvo > 0) {
      state.diaAtual = diaSalvo;
    } else {
      state.diaAtual = detectarDiaAtual();
    }

    state.carregado = true;
  }


  function detectarDiaAtual() {

    /*
      O aplicativo começa no Dia 1.
      Posteriormente podemos conectar isso
      a calendário/progresso real.
    */

    if (state.completos.length === 0) {
      return 1;
    }

    const maiorDia = Math.max(
      ...state.completos.map(Number).filter(Boolean)
    );

    return Math.min(
      Math.max(maiorDia + 1, 1),
      365
    );
  }


  /* =======================================================
     BUSCA DE CONTEÚDO
     ======================================================= */

  function encontrarDevocional(dia) {

    return state.devocionais.find(item =>
      Number(item.dia) === Number(dia)
    );
  }


  function encontrarEstudoPorDia(dia) {

    return state.estudos.find(item =>
      Number(item.dia) === Number(dia)
    );
  }


  /* =======================================================
     PROGRESSO
     ======================================================= */

  function progresso() {

    return Math.min(
      Math.round((state.completos.length / 365) * 100),
      100
    );
  }


  function salvarDiaAtual() {

    try {
      localStorage.setItem(
        CONFIG.STORAGE.DIA_ATUAL,
        String(state.diaAtual)
      );
    } catch {}
  }


  function marcarCompleto(dia) {

    dia = Number(dia);

    if (!dia || dia < 1 || dia > 365) {
      return;
    }

    if (!state.completos.includes(dia)) {
      state.completos.push(dia);

      state.completos.sort((a, b) => a - b);

      writeStorage(
        CONFIG.STORAGE.COMPLETOS,
        state.completos
      );
    }

    if (dia >= state.diaAtual) {
      state.diaAtual = Math.min(dia + 1, 365);
      salvarDiaAtual();
    }

    renderTudo();
  }


  function alternarFavorito(dia) {

    dia = Number(dia);

    if (state.favoritos.includes(dia)) {

      state.favoritos =
        state.favoritos.filter(item => item !== dia);

    } else {

      state.favoritos.push(dia);
    }

    writeStorage(
      CONFIG.STORAGE.FAVORITOS,
      state.favoritos
    );

    renderTudo();
  }


  /* =======================================================
     LOADING
     ======================================================= */

  function removerLoading() {

    const elementos = [
      "#loadingScreen",
      "#loading-screen",
      ".loading-screen",
      ".app-loading"
    ];

    elementos.forEach(selector => {

      $$(selector).forEach(element => {

        element.classList.add("hidden");

        element.style.opacity = "0";
        element.style.pointerEvents = "none";
        element.style.visibility = "hidden";

        setTimeout(() => {

          try {
            element.remove();
          } catch {}

        }, 500);
      });
    });

    document.documentElement.classList.remove(
      "loading",
      "is-loading"
    );

    document.body.classList.remove(
      "loading",
      "is-loading"
    );
  }


  /* =======================================================
     HERO
     ======================================================= */

  function renderHero() {

    const hero = $(".hero");

    if (!hero) {
      return;
    }

    /*
      Não destruímos o HTML original do Hero.
      Apenas garantimos que o conteúdo principal
      permaneça coerente com a identidade.
    */

    const title = $(".hero h1", hero);

    if (title && !title.textContent.trim()) {

      title.innerHTML = `
        <span>Aprenda a</span>
        <span class="accent">percebê-lo.</span>
      `;
    }
  }


  /* =======================================================
     DIA DE HOJE
     ======================================================= */

  function renderToday() {

    const elements = $$("[data-today-day]");

    elements.forEach(element => {
      element.textContent = state.diaAtual;
    });

    $$("[data-today-title]").forEach(element => {

      const devocional =
        encontrarDevocional(state.diaAtual);

      if (devocional) {
        element.textContent =
          devocional.titulo || `Dia ${state.diaAtual}`;
      }
    });
  }


  /* =======================================================
     PROGRESSO VISUAL
     ======================================================= */

  function renderProgress() {

    $$("[data-progress]").forEach(element => {

      element.style.setProperty(
        "--progress",
        `${progresso()}%`
      );
    });

    $$("[data-progress-number]").forEach(element => {
      element.textContent = `${progresso()}%`;
    });

    $$("[data-completed-count]").forEach(element => {
      element.textContent =
        state.completos.length;
    });
  }


  /* =======================================================
     JORNADA
     ======================================================= */

  function renderJourney() {

    $$("[data-journey-progress]").forEach(element => {

      element.textContent =
        `${state.completos.length} de 365 dias`;
    });
  }


  /* =======================================================
     RAIL DE HOJE
     ======================================================= */

  function renderTodayRail() {

    const container =
      $("[data-today-rail]");

    if (!container) {
      return;
    }

    const inicio =
      Math.max(1, state.diaAtual - 1);

    const dias = [];

    for (
      let dia = inicio;
      dia <= Math.min(inicio + 7, 365);
      dia++
    ) {
      dias.push(dia);
    }

    container.innerHTML =
      dias.map(dia => {

        const item =
          encontrarDevocional(dia);

        const titulo =
          item?.titulo ||
          `Dia ${dia}`;

        const referencia =
          item?.referencia ||
          "Jornada de 365 dias";

        const concluido =
          state.completos.includes(dia);

        return `
          <article
            class="card-square"
            data-open-day="${dia}"
            role="button"
            tabindex="0"
            aria-label="Abrir Dia ${dia}"
          >

            <div class="card-content">

              <div class="card-number">
                ${concluido ? "Concluído" : `Dia ${dia}`}
              </div>

              <div class="card-title">
                ${escapeHTML(titulo)}
              </div>

              <div class="card-meta">
                ${escapeHTML(referencia)}
              </div>

            </div>

          </article>
        `;

      }).join("");
  }


  /* =======================================================
     RAIL DE ESTUDOS
     ======================================================= */

  function renderStudiesRail() {

    const containers =
      $$("[data-studies-rail]");

    if (!containers.length) {
      return;
    }

    containers.forEach(container => {

      if (!state.estudos.length) {

        container.innerHTML = `
          <div class="empty-state">
            <h3>Estudos em preparação</h3>
            <p>
              A biblioteca teológica será ampliada
              progressivamente ao longo da jornada.
            </p>
          </div>
        `;

        return;
      }

      container.innerHTML =
        state.estudos.slice(0, 10).map(estudo => {

          return `
            <article
              class="card-square"
              data-open-study="${escapeHTML(estudo.id || "")}"
              role="button"
              tabindex="0"
            >

              <div class="card-content">

                <div class="card-number">
                  Estudo · Dia ${Number(estudo.dia) || ""}
                </div>

                <div class="card-title">
                  ${escapeHTML(estudo.titulo || "Estudo")}
                </div>

                <div class="card-meta">
                  ${escapeHTML(
                    estudo.categoria || "Aprofundamento"
                  )}
                </div>

              </div>

            </article>
          `;

        }).join("");
    });
  }


  /* =======================================================
     FAVORITOS
     ======================================================= */

  function renderFavorites() {

    const containers =
      $$("[data-favorites-list]");

    if (!containers.length) {
      return;
    }

    containers.forEach(container => {

      const favoritos =
        state.favoritos
          .map(dia => encontrarDevocional(dia))
          .filter(Boolean);

      if (!favoritos.length) {

        container.innerHTML = `
          <div class="empty-state">
            <h3>Seu espaço está vazio</h3>
            <p>
              Ao encontrar um conteúdo especial,
              toque no favorito para guardá-lo aqui.
            </p>
          </div>
        `;

        return;
      }

      container.innerHTML =
        favoritos.map(item => {

          return `
            <article
              class="card-square"
              data-open-day="${Number(item.dia)}"
              role="button"
              tabindex="0"
            >

              <div class="card-content">

                <div class="card-number">
                  Dia ${Number(item.dia)}
                </div>

                <div class="card-title">
                  ${escapeHTML(item.titulo || "")}
                </div>

                <div class="card-meta">
                  ${escapeHTML(item.referencia || "")}
                </div>

              </div>

            </article>
          `;

        }).join("");
    });
  }


  /* =======================================================
     MODAL DEVOCIONAL
     ======================================================= */

  function obterModal() {

    let modal = $("#devotionalModal");

    if (modal) {
      return modal;
    }

    modal = document.createElement("div");

    modal.id = "devotionalModal";
    modal.className = "modal";

    modal.innerHTML = `
      <div class="modal-content">

        <button
          class="modal-close"
          type="button"
          data-close-modal
          aria-label="Fechar"
        >
          ×
        </button>

        <div data-modal-body></div>

      </div>
    `;

    document.body.appendChild(modal);

    return modal;
  }


  function abrirDevocional(dia) {

    const item =
      encontrarDevocional(dia);

    if (!item) {

      console.warn(
        `Devocional do Dia ${dia} não encontrado.`
      );

      return;
    }

    const modal = obterModal();

    const body =
      $("[data-modal-body]", modal);

    const favorito =
      state.favoritos.includes(Number(dia));

    const completo =
      state.completos.includes(Number(dia));

    body.innerHTML = `

      <div class="modal-kicker">
        Jornada · Dia ${Number(item.dia)}
      </div>

      <h2 class="modal-title">
        ${escapeHTML(item.titulo || "")}
      </h2>

      ${
        item.referencia
          ? `
            <div class="modal-reference">
              ${escapeHTML(item.referencia)}
            </div>
          `
          : ""
      }

      ${
        item.introducao
          ? `
            <section class="modal-section">
              <h3>Chegue</h3>
              <p>
                ${escapeHTML(item.introducao)}
              </p>
            </section>
          `
          : ""
      }

      ${
        item.reflexao
          ? `
            <section class="modal-section">
              <h3>Contemple</h3>
              <p>
                ${escapeHTML(item.reflexao)}
              </p>
            </section>
          `
          : ""
      }

      ${
        item.pergunta
          ? `
            <section class="modal-section">
              <h3>Pergunta para hoje</h3>
              <p>
                ${escapeHTML(item.pergunta)}
              </p>
            </section>
          `
          : ""
      }

      ${
        item.pratica
          ? `
            <section class="modal-section">
              <h3>Pratique</h3>
              <p>
                ${escapeHTML(item.pratica)}
              </p>
            </section>
          `
          : ""
      }

      ${
        item.oracao
          ? `
            <section class="modal-section">
              <h3>Oração</h3>
              <p>
                ${escapeHTML(item.oracao)}
              </p>
            </section>
          `
          : ""
      }

      ${
        item.diario
          ? `
            <section class="modal-section">
              <h3>Registre</h3>
              <p>
                ${escapeHTML(item.diario)}
              </p>
            </section>
          `
          : ""
      }

      <div class="modal-actions">

        <button
          class="primary-button"
          type="button"
          data-complete-day="${Number(item.dia)}"
        >
          ${completo ? "Concluído" : "Concluir dia"}
        </button>

        <button
          class="secondary-button"
          type="button"
          data-favorite-day="${Number(item.dia)}"
        >
          ${favorito ? "Remover favorito" : "Favoritar"}
        </button>

        <button
          class="secondary-button"
          type="button"
          data-open-study-day="${Number(item.dia)}"
        >
          Aprofundar estudo
        </button>

      </div>
    `;

    modal.classList.add("open");

    document.body.style.overflow = "hidden";
  }


  function fecharModal() {

    const modal =
      $("#devotionalModal");

    if (!modal) {
      return;
    }

    modal.classList.remove("open");

    document.body.style.overflow = "";

    setTimeout(() => {

      if (!modal.classList.contains("open")) {
        modal.remove();
      }

    }, 350);
  }


  /* =======================================================
     MODAL DE ESTUDO
     ======================================================= */

  function abrirEstudo(id) {

    const estudo =
      state.estudos.find(item =>
        String(item.id) === String(id)
      );

    if (!estudo) {
      return;
    }

    const modal = obterModal();

    const body =
      $("[data-modal-body]", modal);

    body.innerHTML = `

      <div class="modal-kicker">
        Estudo · Dia ${Number(estudo.dia) || ""}
      </div>

      <h2 class="modal-title">
        ${escapeHTML(estudo.titulo || "Estudo")}
      </h2>

      ${
        estudo.subtitulo
          ? `
            <p class="screen-description">
              ${escapeHTML(estudo.subtitulo)}
            </p>
          `
          : ""
      }

      ${
        estudo.texto_principal
          ? `
            <section class="modal-section">
              <h3>Texto principal</h3>
              <p>
                ${escapeHTML(
                  estudo.texto_principal.referencia || ""
                )}
              </p>
              ${
                estudo.texto_principal.tema
                  ? `
                    <p style="margin-top:8px">
                      ${escapeHTML(
                        estudo.texto_principal.tema
                      )}
                    </p>
                  `
                  : ""
              }
            </section>
          `
          : ""
      }

      ${
        estudo.objetivo
          ? `
            <section class="modal-section">
              <h3>Objetivo</h3>
              <p>
                ${escapeHTML(estudo.objetivo)}
              </p>
            </section>
          `
          : ""
      }

      ${
        estudo.pergunta_central
          ? `
            <section class="modal-section">
              <h3>Pergunta central</h3>
              <p>
                ${escapeHTML(estudo.pergunta_central)}
              </p>
            </section>
          `
          : ""
      }

      ${
        estudo.exegese?.pontos?.length
          ? `
            <section class="modal-section">

              <h3>
                ${escapeHTML(
                  estudo.exegese.titulo ||
                  "Exegese"
                )}
              </h3>

              <p>
                ${estudo.exegese.pontos
                  .map(ponto =>
                    `• ${escapeHTML(
                      typeof ponto === "string"
                        ? ponto
                        : ponto.titulo || ponto.texto || ""
                    )}`
                  )
                  .join("<br><br>")}
              </p>

            </section>
          `
          : ""
      }

      ${
        estudo.teologia?.sintese
          ? `
            <section class="modal-section">
              <h3>Teologia</h3>
              <p>
                ${escapeHTML(
                  estudo.teologia.sintese
                )}
              </p>
            </section>
          `
          : ""
      }

      ${
        estudo.contemplacao_teologica?.texto
          ? `
            <section class="modal-section">
              <h3>Contemplação teológica</h3>
              <p>
                ${escapeHTML(
                  estudo.contemplacao_teologica.texto
                )}
              </p>
            </section>
          `
          : ""
      }

      ${
        estudo.oracao?.texto
          ? `
            <section class="modal-section">
              <h3>Oração</h3>
              <p>
                ${escapeHTML(
                  estudo.oracao.texto
                )}
              </p>
            </section>
          `
          : ""
      }

      <div class="modal-actions">

        <button
          class="primary-button"
          type="button"
          data-open-day="${Number(estudo.dia) || 1}"
        >
          Ver devocional
        </button>

      </div>
    `;

    modal.classList.add("open");

    document.body.style.overflow = "hidden";
  }


  /* =======================================================
     BUSCA
     ======================================================= */

  function criarBusca() {

    let overlay =
      $("#searchOverlay");

    if (overlay) {
      return overlay;
    }

    overlay = document.createElement("div");

    overlay.id = "searchOverlay";
    overlay.className = "search-overlay";

    overlay.innerHTML = `

      <button
        class="icon-button"
        data-close-search
        type="button"
        aria-label="Fechar busca"
      >
        ×
      </button>

      <div style="height:14px"></div>

      <input
        class="search-input"
        type="search"
        placeholder="Buscar na jornada..."
        autocomplete="off"
        data-search-input
      >

      <div
        class="search-results"
        data-search-results
      ></div>

    `;

    document.body.appendChild(overlay);

    return overlay;
  }


  function abrirBusca() {

    const overlay =
      criarBusca();

    overlay.classList.add("open");

    const input =
      $("[data-search-input]", overlay);

    setTimeout(() => input?.focus(), 100);
  }


  function fecharBusca() {

    const overlay =
      $("#searchOverlay");

    if (overlay) {
      overlay.classList.remove("open");
    }
  }


  function executarBusca(termo) {

    const results =
      $("[data-search-results]");

    if (!results) {
      return;
    }

    termo = termo
      .trim()
      .toLowerCase();

    if (!termo) {

      results.innerHTML = `
        <div class="empty-state">
          <h3>O que você procura?</h3>
          <p>
            Busque por tema, palavra,
            referência ou dia.
          </p>
        </div>
      `;

      return;
    }

    const encontrados =
      state.devocionais.filter(item => {

        const texto = [
          item.titulo,
          item.referencia,
          item.introducao,
          item.reflexao,
          item.pergunta,
          item.pratica
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return texto.includes(termo);
      });

    if (!encontrados.length) {

      results.innerHTML = `
        <div class="empty-state">
          <h3>Nenhum resultado</h3>
          <p>
            Não encontramos esse conteúdo
            na jornada.
          </p>
        </div>
      `;

      return;
    }

    results.innerHTML =
      encontrados.slice(0, 20).map(item => `

        <article
          class="glass-card"
          style="padding:16px;margin-bottom:10px"
          data-open-day="${Number(item.dia)}"
          role="button"
          tabindex="0"
        >

          <div class="card-number">
            Dia ${Number(item.dia)}
          </div>

          <div class="card-title">
            ${escapeHTML(item.titulo || "")}
          </div>

          <div class="card-meta">
            ${escapeHTML(item.referencia || "")}
          </div>

        </article>

      `).join("");
  }


  /* =======================================================
     NAVEGAÇÃO
     ======================================================= */

  function navegar(tela) {

    state.telaAtual = tela;

    $$("[data-screen]").forEach(screen => {

      const ativa =
        screen.dataset.screen === tela;

      screen.hidden = !ativa;
    });

    $$("[data-nav]").forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.nav === tela
      );
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }


  /* =======================================================
     EVENTOS
     ======================================================= */

  function configurarEventos() {

    document.addEventListener("click", event => {

      const openDay =
        event.target.closest("[data-open-day]");

      if (openDay) {

        const dia =
          Number(openDay.dataset.openDay);

        if (dia) {
          abrirDevocional(dia);
        }

        return;
      }


      const openStudy =
        event.target.closest("[data-open-study]");

      if (openStudy) {

        abrirEstudo(
          openStudy.dataset.openStudy
        );

        return;
      }


      const nav =
        event.target.closest("[data-nav]");

      if (nav) {

        navegar(
          nav.dataset.nav
        );

        return;
      }


      const closeModal =
        event.target.closest("[data-close-modal]");

      if (closeModal) {
        fecharModal();
        return;
      }


      const closeSearch =
        event.target.closest("[data-close-search]");

      if (closeSearch) {
        fecharBusca();
        return;
      }


      const openSearch =
        event.target.closest("[data-open-search]");

      if (openSearch) {
        abrirBusca();
        return;
      }


      const favorite =
        event.target.closest("[data-favorite-day]");

      if (favorite) {

        alternarFavorito(
          Number(favorite.dataset.favoriteDay)
        );

        abrirDevocional(
          Number(favorite.dataset.favoriteDay)
        );

        return;
      }


      const complete =
        event.target.closest("[data-complete-day]");

      if (complete) {

        marcarCompleto(
          Number(complete.dataset.completeDay)
        );

        abrirDevocional(
          Number(complete.dataset.completeDay)
        );

        return;
      }


      const studyDay =
        event.target.closest("[data-open-study-day]");

      if (studyDay) {

        const estudo =
          encontrarEstudoPorDia(
            Number(studyDay.dataset.openStudyDay)
          );

        if (estudo) {
          abrirEstudo(estudo.id);
        }

        return;
      }


      const start =
        event.target.closest("[data-start-journey]");

      if (start) {

        state.diaAtual = 1;
        salvarDiaAtual();

        abrirDevocional(1);

        return;
      }


      const continueButton =
        event.target.closest("[data-continue]");

      if (continueButton) {

        abrirDevocional(
          state.diaAtual
        );

        return;
      }


      const exploreStudies =
        event.target.closest("[data-explore-studies]");

      if (exploreStudies) {

        navegar("estudos");

        return;
      }

    });


    document.addEventListener("input", event => {

      if (
        event.target.matches(
          "[data-search-input]"
        )
      ) {
        executarBusca(
          event.target.value
        );
      }

    });


    document.addEventListener("keydown", event => {

      if (
        event.key === "Escape"
      ) {

        fecharModal();
        fecharBusca();

      }


      if (
        event.key === "Enter" &&
        event.target.matches("[data-open-day]")
      ) {

        const dia =
          Number(
            event.target.dataset.openDay
          );

        if (dia) {
          abrirDevocional(dia);
        }
      }

    });


    document.addEventListener("click", event => {

      const modal =
        event.target.closest("#devotionalModal");

      if (
        modal &&
        event.target === modal
      ) {
        fecharModal();
      }

    });

  }


  /* =======================================================
     RENDER GERAL
     ======================================================= */

  function renderTudo() {

    renderHero();
    renderToday();
    renderProgress();
    renderJourney();
    renderTodayRail();
    renderStudiesRail();
    renderFavorites();
  }


  /* =======================================================
     SERVICE WORKER
     ======================================================= */

  function registrarServiceWorker() {

    if (
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    window.addEventListener(
      "load",
      () => {

        navigator.serviceWorker
          .register("./sw.js")
          .then(registration => {

            console.log(
              "Doce Espírito Santo:",
              "Service Worker ativo.",
              registration.scope
            );

          })
          .catch(error => {

            console.warn(
              "Service Worker não registrado:",
              error
            );

          });

      }
    );
  }


  /* =======================================================
     INICIALIZAÇÃO
     ======================================================= */

  async function iniciar() {

    /*
      Segurança contra loading infinito.
      Mesmo que algum arquivo externo falhe,
      a interface não ficará presa.
    */

    const timeoutLoading =
      setTimeout(
        removerLoading,
        5000
      );

    try {

      await carregarConteudo();

      configurarEventos();

      renderTudo();

      registrarServiceWorker();

      console.log(
        "Doce Espírito Santo iniciado.",
        {
          devocionais:
            state.devocionais.length,

          estudos:
            state.estudos.length,

          diaAtual:
            state.diaAtual,

          progresso:
            progresso()
        }
      );

    } catch (error) {

      console.error(
        "Erro ao iniciar o aplicativo:",
        error
      );

    } finally {

      clearTimeout(timeoutLoading);

      /*
        Pequeno atraso para permitir
        que o navegador pinte a interface
        antes de retirar o loading.
      */

      requestAnimationFrame(() => {

        requestAnimationFrame(() => {

          removerLoading();

        });

      });

    }

  }


  /* =======================================================
     API PÚBLICA
     ======================================================= */

  window.DoceEspirito = {

    state,

    abrirDevocional,

    abrirEstudo,

    abrirBusca,

    navegar,

    marcarCompleto,

    alternarFavorito,

    renderTudo,

    encontrarDevocional,

    encontrarEstudoPorDia

  };


  /* =======================================================
     START
     ======================================================= */

  if (
    document.readyState === "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      iniciar,
      { once: true }
    );

  } else {

    iniciar();

  }

})();
