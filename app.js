/* =========================================================
   DOCE ESPÍRITO SANTO — UM AMIGO ÍNTIMO
   APP.JS — MOTOR PRINCIPAL DA EXPERIÊNCIA
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     ESTADO
     ========================================================= */

  let devocionais = [];
  let estudos = [];

  let diaAtual = Number(localStorage.getItem("des-dia-atual") || 1);
  let telaAtual = "inicio";
  let buscaAberta = false;

  const TOTAL_DIAS = 365;

  /* =========================================================
     UTILITÁRIOS
     ========================================================= */

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  const escapeHTML = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const numero = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const getDevocional = (dia) => {
    return devocionais.find(
      item => numero(item.dia) === numero(dia)
    );
  };

  const getEstudo = (dia) => {
    return estudos.find(
      item => numero(item.dia) === numero(dia)
    );
  };

  const isFavorite = (dia) =>
    localStorage.getItem(`des-favorito-${dia}`) === "true";

  const isCompleted = (dia) =>
    localStorage.getItem(`des-concluido-${dia}`) === "true";

  const setCompleted = (dia, value = true) => {
    localStorage.setItem(
      `des-concluido-${dia}`,
      String(value)
    );
  };

  const toggleFavoriteStorage = (dia) => {
    const novo = !isFavorite(dia);

    localStorage.setItem(
      `des-favorito-${dia}`,
      String(novo)
    );

    return novo;
  };

  const contarDiasConcluidos = () => {
    let total = 0;

    for (let i = 1; i <= TOTAL_DIAS; i++) {
      if (isCompleted(i)) total++;
    }

    return total;
  };

  const progresso = () => {
    return Math.round(
      (contarDiasConcluidos() / TOTAL_DIAS) * 100
    );
  };

  /* =========================================================
     CARREGAMENTO
     ========================================================= */

  async function carregarJSON(url) {
    const response = await fetch(`${url}?v=${Date.now()}`);

    if (!response.ok) {
      throw new Error(`Não foi possível carregar ${url}`);
    }

    return await response.json();
  }

  async function carregarConteudo() {
    try {
      const [dadosDevocionais, dadosEstudos] =
        await Promise.allSettled([
          carregarJSON("devocionais.json"),
          carregarJSON("estudos.json")
        ]);

      if (
        dadosDevocionais.status === "fulfilled"
      ) {
        const dados = dadosDevocionais.value;

        if (Array.isArray(dados)) {
          devocionais = dados;
        } else if (Array.isArray(dados.devocionais)) {
          devocionais = dados.devocionais;
        }
      }

      if (
        dadosEstudos.status === "fulfilled"
      ) {
        const dados = dadosEstudos.value;

        if (Array.isArray(dados)) {
          estudos = dados;
        } else if (Array.isArray(dados.estudos)) {
          estudos = dados.estudos;
        }
      }

      console.log(
        "Doce Espírito Santo carregado:",
        {
          devocionais: devocionais.length,
          estudos: estudos.length
        }
      );

      renderizarAplicacao();

    } catch (erro) {

      console.error(
        "Erro ao carregar conteúdo:",
        erro
      );

      renderizarAplicacao();

    } finally {

      /* =====================================================
         IMPORTANTE:
         REMOVE A TELA DE CARREGAMENTO
         ===================================================== */

      removerLoading();
    }
  }

  /* =========================================================
     LOADING
     ========================================================= */

  function removerLoading() {
    const loading =
      $("#loadingScreen") ||
      $("#loading-screen") ||
      $(".loading-screen") ||
      $(".app-loading");

    if (loading) {
      loading.classList.add("is-hidden");

      setTimeout(() => {
        loading.style.display = "none";
        loading.remove();
      }, 650);
    }

    document.body.classList.remove(
      "is-loading",
      "loading"
    );

    document.documentElement.classList.remove(
      "is-loading",
      "loading"
    );
  }

  /* =========================================================
     CARD DO DEVOCIONAL
     ========================================================= */

  function cardDevocional(dia, classe = "") {

    const item = getDevocional(dia);

    if (!item) {
      return `
        <article class="content-card ${classe}">
          <div class="content-card__body">
            <span class="eyebrow">
              DIA ${dia}
            </span>

            <h3>
              Jornada do Dia ${dia}
            </h3>

            <p>
              Continue sua caminhada com o
              Doce Espírito Santo.
            </p>
          </div>
        </article>
      `;
    }

    const titulo =
      item.titulo ||
      `Dia ${dia}`;

    const descricao =
      item.introducao ||
      item.reflexao ||
      "Continue sua caminhada de presença, Palavra e intimidade.";

    const referencia =
      item.referencia ||
      "";

    return `
      <article
        class="content-card ${classe}"
        data-dia="${dia}"
        data-open-day="${dia}"
      >

        <div class="content-card__image"></div>

        <div class="content-card__overlay"></div>

        <div class="content-card__body">

          <span class="eyebrow">
            DIA ${String(dia).padStart(2, "0")}
          </span>

          <h3>
            ${escapeHTML(titulo)}
          </h3>

          <p>
            ${escapeHTML(descricao)}
          </p>

          ${
            referencia
              ? `
                <span class="content-card__reference">
                  ${escapeHTML(referencia)}
                </span>
              `
              : ""
          }

        </div>

      </article>
    `;
  }

  /* =========================================================
     CARD DE PRÁTICA
     ========================================================= */

  function cardPratica(
    titulo,
    texto,
    classe = ""
  ) {
    return `
      <article class="practice-card ${classe}">

        <div class="practice-card__image"></div>

        <div class="practice-card__overlay"></div>

        <div class="practice-card__content">

          <span class="eyebrow">
            APRENDA A PERCEBÊ-LO
          </span>

          <h3>
            ${escapeHTML(titulo)}
          </h3>

          ${
            texto
              ? `<p>${escapeHTML(texto)}</p>`
              : ""
          }

        </div>

      </article>
    `;
  }

  /* =========================================================
     ESTUDO TEOLÓGICO
     ========================================================= */

  function renderizarEstudos() {

    const container =
      $("#studiesRail") ||
      $("#estudosRail") ||
      $("[data-estudos]");

    if (!container) return;

    const lista = estudos.slice(0, 6);

    container.innerHTML = lista.map(estudo => {

      return `
        <article
          class="study-card"
          data-open-study="${escapeHTML(estudo.id || estudo.dia)}"
        >

          <div class="study-card__image"></div>

          <div class="study-card__content">

            <span class="eyebrow">
              ${escapeHTML(
                estudo.categoria ||
                "ESTUDO"
              )}
            </span>

            <h3>
              ${escapeHTML(
                estudo.titulo ||
                "Estudo teológico"
              )}
            </h3>

            <p>
              ${escapeHTML(
                estudo.subtitulo ||
                estudo.objetivo ||
                "Aprofunde sua compreensão da Palavra."
              )}
            </p>

            ${
              estudo.tempo_estimado_minutos
                ? `
                  <span class="study-card__time">
                    ${estudo.tempo_estimado_minutos} min
                  </span>
                `
                : ""
            }

          </div>

        </article>
      `;

    }).join("");
  }

  /* =========================================================
     JORNADA
     ========================================================= */

  function renderizarJornada() {

    const container =
      $("#journeyRail") ||
      $("#jornadaRail") ||
      $("[data-jornada]");

    if (!container) return;

    const inicio = Math.max(
      1,
      Math.floor((diaAtual - 1) / 10) * 10 + 1
    );

    const dias = [];

    for (
      let i = inicio;
      i < inicio + 10 && i <= TOTAL_DIAS;
      i++
    ) {
      dias.push(i);
    }

    container.innerHTML =
      dias.map(dia =>
        cardDevocional(
          dia,
          dia === diaAtual
            ? "is-current"
            : ""
        )
      ).join("");
  }

  /* =========================================================
     HOJE
     ========================================================= */

  function renderizarHoje() {

    const item = getDevocional(diaAtual);

    if (!item) return;

    const titulo =
      item.titulo ||
      `Dia ${diaAtual}`;

    const referencia =
      item.referencia ||
      "";

    const descricao =
      item.introducao ||
      item.reflexao ||
      "";

    const elementos = [
      ["#todayTitle", titulo],
      ["#todayReference", referencia],
      ["#todayDescription", descricao]
    ];

    elementos.forEach(([selector, texto]) => {
      const el = $(selector);

      if (el) {
        el.textContent = texto;
      }
    });
  }

  /* =========================================================
     PROGRESSO
     ========================================================= */

  function renderizarProgresso() {

    const concluido =
      contarDiasConcluidos();

    const porcentagem =
      progresso();

    $$("[data-progress]").forEach(el => {
      el.style.width = `${porcentagem}%`;
    });

    $$("[data-progress-text]").forEach(el => {
      el.textContent =
        `${concluido} de ${TOTAL_DIAS} dias`;
    });

    $$("[data-progress-number]").forEach(el => {
      el.textContent = concluido;
    });
  }

  /* =========================================================
     ABRIR DEVOCIONAL
     ========================================================= */

  function abrirDevocional(dia) {

    const item = getDevocional(dia);

    if (!item) return;

    diaAtual = numero(dia, 1);

    localStorage.setItem(
      "des-dia-atual",
      diaAtual
    );

    const modal =
      $("#devotionalModal") ||
      $("#devocionalModal") ||
      $("#dayModal");

    if (!modal) {

      console.warn(
        "Modal do devocional não encontrado."
      );

      return;
    }

    const titulo =
      item.titulo ||
      `Dia ${diaAtual}`;

    const referencia =
      item.referencia ||
      "";

    const introducao =
      item.introducao ||
      "";

    const reflexao =
      item.reflexao ||
      "";

    const pratica =
      item.pratica ||
      "";

    const pergunta =
      item.pergunta ||
      "";

    const oracao =
      item.oracao ||
      "";

    const campos = {

      "#modalDay":
        `DIA ${String(diaAtual).padStart(2, "0")}`,

      "#modalTitle":
        titulo,

      "#modalReference":
        referencia,

      "#modalIntroduction":
        introducao,

      "#modalReflection":
        reflexao,

      "#modalPractice":
        pratica,

      "#modalQuestion":
        pergunta,

      "#modalPrayer":
        oracao

    };

    Object.entries(campos).forEach(
      ([selector, valor]) => {

        const el = $(selector);

        if (el) {
          el.textContent = valor;
        }

      }
    );

    const favorite =
      isFavorite(diaAtual);

    const favoriteButton =
      $("#favoriteButton");

    if (favoriteButton) {

      favoriteButton.classList.toggle(
        "is-active",
        favorite
      );

      favoriteButton.setAttribute(
        "aria-label",
        favorite
          ? "Remover dos favoritos"
          : "Adicionar aos favoritos"
      );
    }

    modal.classList.add("is-open");
    document.body.classList.add("modal-open");

    modal.setAttribute(
      "aria-hidden",
      "false"
    );
  }

  /* =========================================================
     FECHAR MODAL
     ========================================================= */

  function fecharModais() {

    $$(".modal, .overlay, .sheet").forEach(el => {

      el.classList.remove(
        "is-open",
        "active",
        "visible"
      );

    });

    document.body.classList.remove(
      "modal-open"
    );
  }

  /* =========================================================
     FAVORITO
     ========================================================= */

  function alternarFavorito() {

    const novoEstado =
      toggleFavoriteStorage(diaAtual);

    const button =
      $("#favoriteButton");

    if (button) {

      button.classList.toggle(
        "is-active",
        novoEstado
      );
    }

    renderizarProgresso();
  }

  /* =========================================================
     CONCLUIR DIA
     ========================================================= */

  function concluirDia() {

    setCompleted(
      diaAtual,
      true
    );

    const proximo =
      Math.min(
        TOTAL_DIAS,
        diaAtual + 1
      );

    diaAtual = proximo;

    localStorage.setItem(
      "des-dia-atual",
      diaAtual
    );

    renderizarProgresso();
    renderizarJornada();

    fecharModais();

    setTimeout(() => {

      const item =
        getDevocional(diaAtual);

      if (item) {
        abrirDevocional(diaAtual);
      }

    }, 250);
  }

  /* =========================================================
     NAVEGAÇÃO PRINCIPAL
     ========================================================= */

  function navegar(tela) {

    telaAtual = tela;

    $$("[data-screen]").forEach(
      screen => {

        screen.classList.toggle(
          "is-active",
          screen.dataset.screen === tela
        );

      }
    );

    $$("[data-nav]").forEach(
      button => {

        button.classList.toggle(
          "is-active",
          button.dataset.nav === tela
        );

      }
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  /* =========================================================
     BUSCA
     ========================================================= */

  function abrirBusca() {

    const overlay =
      $("#searchOverlay") ||
      $("#searchModal");

    if (!overlay) return;

    overlay.classList.add("is-open");

    buscaAberta = true;

    const input =
      $("#searchInput");

    if (input) {

      setTimeout(
        () => input.focus(),
        100
      );
    }
  }

  function fecharBusca() {

    const overlay =
      $("#searchOverlay") ||
      $("#searchModal");

    if (!overlay) return;

    overlay.classList.remove(
      "is-open"
    );

    buscaAberta = false;
  }

  function pesquisar(termo) {

    const container =
      $("#searchResults");

    if (!container) return;

    const q =
      termo
        .trim()
        .toLowerCase();

    if (!q) {

      container.innerHTML = `
        <div class="search-empty">
          <span>⌕</span>
          <p>
            Pesquise por um tema,
            palavra ou referência bíblica.
          </p>
        </div>
      `;

      return;
    }

    const resultados =
      devocionais.filter(item => {

        const texto = [
          item.titulo,
          item.introducao,
          item.reflexao,
          item.referencia,
          item.pratica,
          item.pergunta
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return texto.includes(q);

      }).slice(0, 20);

    if (!resultados.length) {

      container.innerHTML = `
        <div class="search-empty">
          <h3>Nada encontrado</h3>
          <p>
            Tente outro termo.
          </p>
        </div>
      `;

      return;
    }

    container.innerHTML =
      resultados.map(item => {

        return `
          <button
            class="search-result"
            data-open-day="${numero(item.dia)}"
          >

            <span class="search-result__day">
              DIA ${String(item.dia).padStart(2, "0")}
            </span>

            <strong>
              ${escapeHTML(item.titulo || "")}
            </strong>

            <small>
              ${escapeHTML(item.referencia || "")}
            </small>

          </button>
        `;

      }).join("");
  }

  /* =========================================================
     ESTUDO
     ========================================================= */

  function abrirEstudo(diaOuId) {

    const estudo =
      estudos.find(
        item =>
          String(item.id) ===
          String(diaOuId)
      ) ||
      estudos.find(
        item =>
          String(item.dia) ===
          String(diaOuId)
      );

    if (!estudo) return;

    const modal =
      $("#studyModal") ||
      $("#estudoModal");

    if (!modal) {

      console.warn(
        "Modal de estudo não encontrado."
      );

      return;
    }

    const titulo =
      estudo.titulo ||
      "Estudo teológico";

    const subtitulo =
      estudo.subtitulo ||
      "";

    const objetivo =
      estudo.objetivo ||
      "";

    const referencia =
      estudo.texto_principal?.referencia ||
      "";

    const tempo =
      estudo.tempo_estimado_minutos ||
      "";

    const preencher = (
      selector,
      texto
    ) => {

      const el = $(selector);

      if (el) {
        el.textContent = texto;
      }
    };

    preencher(
      "#studyModalTitle",
      titulo
    );

    preencher(
      "#studyModalSubtitle",
      subtitulo
    );

    preencher(
      "#studyModalObjective",
      objetivo
    );

    preencher(
      "#studyModalReference",
      referencia
    );

    preencher(
      "#studyModalTime",
      tempo
        ? `${tempo} minutos`
        : ""
    );

    const exegese =
      estudo.exegese?.pontos || [];

    const exegeseContainer =
      $("#studyExegesis");

    if (
      exegeseContainer &&
      exegese.length
    ) {

      exegeseContainer.innerHTML =
        exegese.map(ponto => {

          return `
            <article class="study-section">

              <h4>
                ${escapeHTML(
                  ponto.tema || ""
                )}
              </h4>

              <p>
                ${escapeHTML(
                  ponto.explicacao || ""
                )}
              </p>

            </article>
          `;

        }).join("");
    }

    modal.classList.add(
      "is-open"
    );

    document.body.classList.add(
      "modal-open"
    );
  }

  /* =========================================================
     APLICAÇÃO PRINCIPAL
     ========================================================= */

  function renderizarAplicacao() {

    renderizarHoje();
    renderizarJornada();
    renderizarEstudos();
    renderizarProgresso();

    const hoje = getDevocional(
      diaAtual
    );

    if (hoje) {

      $$("[data-today-title]").forEach(
        el => {
          el.textContent =
            hoje.titulo || "";
        }
      );

      $$("[data-today-reference]").forEach(
        el => {
          el.textContent =
            hoje.referencia || "";
        }
      );

      $$("[data-today-description]").forEach(
        el => {
          el.textContent =
            hoje.introducao ||
            hoje.reflexao ||
            "";
        }
      );
    }

    /* =====================================================
       DIA ATUAL
       ===================================================== */

    $$("[data-current-day]").forEach(
      el => {
        el.textContent =
          diaAtual;
      }
    );

    $$("[data-total-days]").forEach(
      el => {
        el.textContent =
          TOTAL_DIAS;
      }
    );
  }

  /* =========================================================
     EVENTOS
     ========================================================= */

  document.addEventListener(
    "click",
    event => {

      const openDay =
        event.target.closest(
          "[data-open-day]"
        );

      if (openDay) {

        const dia =
          openDay.dataset.openDay;

        abrirDevocional(dia);

        return;
      }

      const openStudy =
        event.target.closest(
          "[data-open-study]"
        );

      if (openStudy) {

        abrirEstudo(
          openStudy.dataset.openStudy
        );

        return;
      }

      const nav =
        event.target.closest(
          "[data-nav]"
        );

      if (nav) {

        navegar(
          nav.dataset.nav
        );

        return;
      }

      const openSearchButton =
        event.target.closest(
          "[data-open-search]"
        );

      if (openSearchButton) {

        abrirBusca();

        return;
      }

      const closeSearchButton =
        event.target.closest(
          "[data-close-search]"
        );

      if (closeSearchButton) {

        fecharBusca();

        return;
      }

      const closeModal =
        event.target.closest(
          "[data-close-modal]"
        );

      if (closeModal) {

        fecharModais();

        return;
      }

      const favorite =
        event.target.closest(
          "#favoriteButton"
        );

      if (favorite) {

        alternarFavorito();

        return;
      }

      const complete =
        event.target.closest(
          "#completeButton"
        );

      if (complete) {

        concluirDia();

        return;
      }

      const start =
        event.target.closest(
          "[data-start-journey]"
        );

      if (start) {

        navegar("hoje");

        setTimeout(() => {
          abrirDevocional(diaAtual);
        }, 350);

        return;
      }

      const continueButton =
        event.target.closest(
          "[data-continue]"
        );

      if (continueButton) {

        abrirDevocional(
          diaAtual
        );

        return;
      }

      const exploreStudies =
        event.target.closest(
          "[data-explore-studies]"
        );

      if (exploreStudies) {

        navegar("estudos");

        return;
      }

    },
    false
  );

  /* =========================================================
     BUSCA
     ========================================================= */

  document.addEventListener(
    "input",
    event => {

      if (
        event.target.matches(
          "#searchInput"
        )
      ) {

        pesquisar(
          event.target.value
        );
      }

    }
  );

  /* =========================================================
     ESC
     ========================================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

        if (buscaAberta) {
          fecharBusca();
        } else {
          fecharModais();
        }

      }

    }
  );

  /* =========================================================
     CLIQUE FORA DO MODAL
     ========================================================= */

  document.addEventListener(
    "click",
    event => {

      const modal =
        event.target.closest(
          ".modal"
        );

      if (
        modal &&
        event.target === modal
      ) {

        fecharModais();
      }

    }
  );

  /* =========================================================
     VOLTAR DO NAVEGADOR
     ========================================================= */

  window.addEventListener(
    "popstate",
    () => {
      fecharModais();
      fecharBusca();
    }
  );

  /* =========================================================
     INICIALIZAÇÃO
     ========================================================= */

  function iniciar() {

    /*
      Remove qualquer loading preso
      depois de uma margem de segurança.
    */

    setTimeout(
      removerLoading,
      5000
    );

    carregarConteudo();
  }

  /* =========================================================
     EXPÕE FUNÇÕES PARA O HTML
     ========================================================= */

  window.DoceEspirito = {

    abrirDevocional,
    abrirEstudo,
    navegar,
    abrirBusca,
    fecharBusca,
    fecharModais,

    getDevocional,
    getEstudo,

    estado: {
      get diaAtual() {
        return diaAtual;
      },

      get devocionais() {
        return devocionais;
      },

      get estudos() {
        return estudos;
      }
    }

  };

  /* =========================================================
     COMEÇAR
     ========================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      iniciar
    );

  } else {

    iniciar();

  }

})();
