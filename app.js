/* =========================================================
   DOCE ESPÍRITO SANTO — UM AMIGO ÍNTIMO
   APP.JS — Motor principal da experiência
   ========================================================= */

(() => {
  "use strict";

  /* ---------------------------------------------------------
     CONFIGURAÇÃO
  --------------------------------------------------------- */

  const STORAGE = {
    favoritos: "doce-favoritos",
    concluidos: "doce-concluidos",
    ultimoDia: "doce-ultimo-dia"
  };

  const ASSETS = {
    presenca: "./assets/card-presenca.svg",

    // Próximas artes que serão adicionadas ao projeto
    oracao: "./assets/card-oracao.svg",
    palavra: "./assets/card-palavra.svg",
    jejum: "./assets/card-jejum.svg",
    intimidade: "./assets/card-intimidade.svg",
    contemplacao: "./assets/card-contemplacao.svg",
    discernimento: "./assets/card-discernimento.svg",
    santificacao: "./assets/card-santificacao.svg",
    fruto: "./assets/card-fruto.svg",
    adoracao: "./assets/card-adoracao.svg",
    testemunho: "./assets/card-testemunho.svg"
  };

  const FALLBACK_IMAGE = ASSETS.presenca;

  let devocionais = [];
  let estudos = [];

  /* ---------------------------------------------------------
     UTILITÁRIOS
  --------------------------------------------------------- */

  const $ = (selector, scope = document) =>
    scope.querySelector(selector);

  const $$ = (selector, scope = document) =>
    [...scope.querySelectorAll(selector)];

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizarTexto(texto = "") {
    return String(texto)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function lerStorage(chave, fallback = []) {
    try {
      const valor = localStorage.getItem(chave);
      return valor ? JSON.parse(valor) : fallback;
    } catch {
      return fallback;
    }
  }

  function salvarStorage(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
    } catch {
      /* silencioso */
    }
  }

  function getFavoritos() {
    return lerStorage(STORAGE.favoritos, []);
  }

  function getConcluidos() {
    return lerStorage(STORAGE.concluidos, []);
  }

  function isFavorito(dia) {
    return getFavoritos().includes(Number(dia));
  }

  function isConcluido(dia) {
    return getConcluidos().includes(Number(dia));
  }

  function imagemPorCategoria(categoria = "") {
    const c = normalizarTexto(categoria);

    if (c.includes("presenca")) return ASSETS.presenca;
    if (c.includes("oracao")) return ASSETS.oracao;
    if (c.includes("palavra")) return ASSETS.palavra;
    if (c.includes("jejum")) return ASSETS.jejum;
    if (c.includes("intimidade")) return ASSETS.intimidade;
    if (c.includes("contemplacao")) return ASSETS.contemplacao;
    if (c.includes("discernimento")) return ASSETS.discernimento;
    if (c.includes("santificacao")) return ASSETS.santificacao;
    if (c.includes("fruto")) return ASSETS.fruto;
    if (c.includes("adoracao")) return ASSETS.adoracao;
    if (c.includes("testemunho")) return ASSETS.testemunho;

    return FALLBACK_IMAGE;
  }

  function imagemDoDevocional(item) {
    return imagemPorCategoria(
      item?.categoria ||
      item?.tema ||
      item?.trilha ||
      item?.referencia ||
      "presenca"
    );
  }

  function removerLoading() {
    const seletores = [
      "#loadingScreen",
      "#loading-screen",
      ".loading-screen",
      ".app-loading"
    ];

    seletores.forEach(selector => {
      $$(selector).forEach(element => {
        element.classList.add("is-hidden");

        setTimeout(() => {
          try {
            element.remove();
          } catch {
            /* */
          }
        }, 500);
      });
    });

    document.body.classList.remove("is-loading", "loading");
    document.documentElement.classList.remove("is-loading", "loading");
  }

  function mostrarToast(mensagem) {
    let toast = $("#doceToast");

    if (!toast) {
      toast = document.createElement("div");
      toast.id = "doceToast";
      toast.className = "doce-toast";
      document.body.appendChild(toast);
    }

    toast.textContent = mensagem;
    toast.classList.add("show");

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }

  /* ---------------------------------------------------------
     CARREGAMENTO DOS DADOS
  --------------------------------------------------------- */

  async function carregarDados() {
    const resultados = await Promise.allSettled([
      fetch("./devocionais.json", { cache: "no-store" }),
      fetch("./estudos.json", { cache: "no-store" })
    ]);

    /* DEVOCIONAIS */

    if (resultados[0].status === "fulfilled") {
      try {
        const json = await resultados[0].value.json();

        if (Array.isArray(json)) {
          devocionais = json;
        } else {
          devocionais =
            json.devocionais ||
            json.dias ||
            json.conteudos ||
            [];
        }
      } catch (erro) {
        console.warn("Erro ao ler devocionais.json:", erro);
        devocionais = [];
      }
    }

    /* ESTUDOS */

    if (resultados[1].status === "fulfilled") {
      try {
        const json = await resultados[1].value.json();

        if (Array.isArray(json)) {
          estudos = json;
        } else {
          estudos =
            json.estudos ||
            json.conteudos ||
            [];
        }
      } catch (erro) {
        console.warn("Erro ao ler estudos.json:", erro);
        estudos = [];
      }
    }

    devocionais.sort((a, b) =>
      Number(a.dia || 0) - Number(b.dia || 0)
    );

    estudos.sort((a, b) =>
      Number(a.dia || 0) - Number(b.dia || 0)
    );
  }

  /* ---------------------------------------------------------
     HOJE
  --------------------------------------------------------- */

  function obterDiaAtual() {
    const salvo = Number(
      localStorage.getItem(STORAGE.ultimoDia)
    );

    if (salvo && devocionais.some(d => Number(d.dia) === salvo)) {
      return salvo;
    }

    const concluidos = getConcluidos();

    const proximo = devocionais.find(
      d => !concluidos.includes(Number(d.dia))
    );

    return Number(proximo?.dia || devocionais[0]?.dia || 1);
  }

  function obterDevocional(dia) {
    return devocionais.find(
      item => Number(item.dia) === Number(dia)
    );
  }

  function obterEstudoPorDia(dia) {
    return estudos.find(
      item => Number(item.dia) === Number(dia)
    );
  }

  /* ---------------------------------------------------------
     PROGRESSO
  --------------------------------------------------------- */

  function percentualProgresso() {
    if (!devocionais.length) return 0;

    return Math.round(
      (getConcluidos().length / devocionais.length) * 100
    );
  }

  function atualizarProgresso() {
    const progresso = percentualProgresso();

    $$("[data-progress]").forEach(element => {
      element.style.width = `${progresso}%`;
    });

    $$("[data-progress-text]").forEach(element => {
      element.textContent = `${progresso}%`;
    });

    $$("[data-completed-count]").forEach(element => {
      element.textContent = getConcluidos().length;
    });

    $$("[data-total-days]").forEach(element => {
      element.textContent = devocionais.length || 365;
    });
  }

  /* ---------------------------------------------------------
     HERO
  --------------------------------------------------------- */

  function renderHero() {
    const hero = $(".hero");

    if (!hero) return;

    const titulo = $(".hero h1", hero);

    if (titulo && !titulo.textContent.trim()) {
      titulo.innerHTML = `
        Aprenda a <span>percebê-lo.</span>
      `;
    }

    const descricao = $(".hero p", hero);

    if (descricao && !descricao.textContent.trim()) {
      descricao.textContent =
        "Ele já está aqui. Uma jornada para desenvolver presença, Palavra, oração, contemplação e intimidade com o Doce Espírito Santo.";
    }
  }

  /* ---------------------------------------------------------
     CARD PREMIUM
  --------------------------------------------------------- */

  function criarCardDevocional(item, opcoes = {}) {
    if (!item) return "";

    const dia = Number(item.dia || 0);
    const titulo =
      item.titulo ||
      `Dia ${dia}`;

    const referencia =
      item.referencia ||
      item.texto_principal?.referencia ||
      "";

    const categoria =
      item.categoria ||
      item.tema ||
      "Presença";

    const imagem =
      opcoes.imagem ||
      imagemDoDevocional(item);

    const favorito = isFavorito(dia);
    const concluido = isConcluido(dia);

    return `
      <article
        class="card-square premium-card"
        data-open-day="${dia}"
        data-category="${escapeHTML(categoria)}"
        style="--card-image:url('${imagem}')"
      >
        <div class="card-square-image">
          <img
            src="${imagem}"
            alt=""
            loading="lazy"
            onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'"
          />

          <div class="card-square-overlay"></div>

          <div class="card-square-top">
            <span class="card-day">
              DIA ${dia}
            </span>

            <button
              class="card-favorite ${favorito ? "active" : ""}"
              data-favorite-day="${dia}"
              aria-label="Favoritar"
              type="button"
            >
              ${favorito ? "★" : "☆"}
            </button>
          </div>

          ${
            concluido
              ? `<span class="card-completed">✓</span>`
              : ""
          }

          <div class="card-square-content">
            <span class="card-category">
              ${escapeHTML(categoria)}
            </span>

            <h3>
              ${escapeHTML(titulo)}
            </h3>

            ${
              referencia
                ? `<p>${escapeHTML(referencia)}</p>`
                : ""
            }
          </div>
        </div>
      </article>
    `;
  }

  /* ---------------------------------------------------------
     CARD DE ESTUDO
  --------------------------------------------------------- */

  function criarCardEstudo(estudo) {
    if (!estudo) return "";

    const dia = Number(estudo.dia || 0);

    const titulo =
      estudo.titulo ||
      `Estudo — Dia ${dia}`;

    const categoria =
      estudo.categoria ||
      "Estudo";

    const imagem =
      imagemPorCategoria(categoria);

    const tempo =
      estudo.tempo_estimado_minutos ||
      estudo.tempo?.total_minutos ||
      40;

    return `
      <article
        class="card-square premium-card study-card"
        data-open-study="${escapeHTML(estudo.id || "")}"
        data-open-study-day="${dia}"
        style="--card-image:url('${imagem}')"
      >
        <div class="card-square-image">
          <img
            src="${imagem}"
            alt=""
            loading="lazy"
            onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'"
          />

          <div class="card-square-overlay"></div>

          <div class="card-square-top">
            <span class="card-day">
              ESTUDO
            </span>
          </div>

          <div class="card-square-content">
            <span class="card-category">
              ${escapeHTML(categoria)}
            </span>

            <h3>
              ${escapeHTML(titulo)}
            </h3>

            <p>
              ${tempo} min · aprofundamento
            </p>
          </div>
        </div>
      </article>
    `;
  }

  /* ---------------------------------------------------------
     RAIL — HOJE
  --------------------------------------------------------- */

  function renderTodayRail() {
    const rail =
      $("[data-today-rail]") ||
      $("#todayRail");

    if (!rail) return;

    const diaAtual = obterDiaAtual();

    const inicio = Math.max(0, diaAtual - 1);

    const itens = devocionais.slice(
      inicio,
      inicio + 8
    );

    if (!itens.length) {
      rail.innerHTML = `
        <div class="empty-state">
          Nenhum conteúdo disponível ainda.
        </div>
      `;
      return;
    }

    rail.innerHTML = itens
      .map(item =>
        criarCardDevocional(item)
      )
      .join("");
  }

  /* ---------------------------------------------------------
     RAIL — PRESENÇA
  --------------------------------------------------------- */

  function renderPresenceRail() {
    const rail =
      $("[data-presence-rail]") ||
      $("#presenceRail");

    if (!rail) return;

    const itens = devocionais
      .filter(item => {
        const texto = normalizarTexto(
          `${item.titulo || ""} ${item.referencia || ""} ${item.tema || ""} ${item.categoria || ""}`
        );

        return (
          texto.includes("presenca") ||
          texto.includes("espirito")
        );
      })
      .slice(0, 10);

    const fonte =
      itens.length
        ? itens
        : devocionais.slice(0, 10);

    rail.innerHTML = fonte
      .map(item =>
        criarCardDevocional(item, {
          imagem: ASSETS.presenca
        })
      )
      .join("");
  }

  /* ---------------------------------------------------------
     RAIL — ESTUDOS
  --------------------------------------------------------- */

  function renderStudiesRail() {
    const rail =
      $("[data-studies-rail]") ||
      $("#studiesRail");

    if (!rail) return;

    if (!estudos.length) {
      rail.innerHTML = `
        <div class="empty-state">
          Os estudos serão carregados em breve.
        </div>
      `;
      return;
    }

    rail.innerHTML = estudos
      .slice(0, 10)
      .map(criarCardEstudo)
      .join("");
  }

  /* ---------------------------------------------------------
     TOP 10
  --------------------------------------------------------- */

  function renderTop10() {
    const rail =
      $("[data-top10-rail]") ||
      $("#top10Rail");

    if (!rail) return;

    const ranking = [
      ...devocionais
    ]
      .sort((a, b) =>
        Number(a.dia || 0) -
        Number(b.dia || 0)
      )
      .slice(0, 10);

    rail.innerHTML = ranking
      .map((item, index) => {
        const dia = Number(item.dia || 0);
        const imagem = imagemDoDevocional(item);

        return `
          <article
            class="top10-card"
            data-open-day="${dia}"
            style="--top10-image:url('${imagem}')"
          >
            <div class="top10-number">
              ${String(index + 1).padStart(2, "0")}
            </div>

            <div class="top10-image">
              <img
                src="${imagem}"
                alt=""
                loading="lazy"
                onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'"
              />
            </div>

            <div class="top10-info">
              <span>
                DIA ${dia}
              </span>

              <strong>
                ${escapeHTML(item.titulo || "")}
              </strong>
            </div>
          </article>
        `;
      })
      .join("");
  }

  /* ---------------------------------------------------------
     FAVORITOS
  --------------------------------------------------------- */

  function renderFavorites() {
    const container =
      $("[data-favorites-list]") ||
      $("#favoritesList");

    if (!container) return;

    const favoritos = getFavoritos();

    const itens = favoritos
      .map(dia => obterDevocional(dia))
      .filter(Boolean);

    if (!itens.length) {
      container.innerHTML = `
        <div class="empty-state">
          <strong>Seu espaço está vazio.</strong>
          <p>
            Salve os conteúdos que deseja revisitar.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = itens
      .map(item =>
        criarCardDevocional(item)
      )
      .join("");
  }

  /* ---------------------------------------------------------
     FAVORITAR
  --------------------------------------------------------- */

  function alternarFavorito(dia) {
    dia = Number(dia);

    const favoritos = getFavoritos();

    const indice = favoritos.indexOf(dia);

    if (indice >= 0) {
      favoritos.splice(indice, 1);
      mostrarToast("Removido dos favoritos");
    } else {
      favoritos.push(dia);
      mostrarToast("Adicionado aos favoritos");
    }

    salvarStorage(
      STORAGE.favoritos,
      favoritos
    );

    renderTodayRail();
    renderPresenceRail();
    renderFavorites();
  }

  /* ---------------------------------------------------------
     CONCLUIR DIA
  --------------------------------------------------------- */

  function concluirDia(dia) {
    dia = Number(dia);

    const concluidos = getConcluidos();

    if (!concluidos.includes(dia)) {
      concluidos.push(dia);
      concluidos.sort((a, b) => a - b);

      salvarStorage(
        STORAGE.concluidos,
        concluidos
      );

      mostrarToast(
        `Dia ${dia} concluído`
      );
    }

    localStorage.setItem(
      STORAGE.ultimoDia,
      String(dia + 1)
    );

    atualizarProgresso();
    renderTodayRail();
    renderPresenceRail();
    renderFavorites();
  }

  /* ---------------------------------------------------------
     MODAL DEVOCIONAL
  --------------------------------------------------------- */

  function abrirDevocional(dia) {
    const item = obterDevocional(dia);

    if (!item) {
      mostrarToast(
        "Este conteúdo ainda não está disponível."
      );
      return;
    }

    fecharTodosModais();

    const modal = document.createElement("div");

    modal.className = "modal-backdrop";
    modal.id = "devotionalModal";

    const favorito = isFavorito(item.dia);
    const concluido = isConcluido(item.dia);

    const estudo =
      obterEstudoPorDia(item.dia);

    modal.innerHTML = `
      <div
        class="modal-sheet devotional-modal"
        role="dialog"
        aria-modal="true"
      >
        <button
          class="modal-close"
          data-close-modal
          type="button"
        >
          ×
        </button>

        <div class="modal-hero">
          <img
            src="${imagemDoDevocional(item)}"
            alt=""
            onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'"
          />

          <div class="modal-hero-overlay"></div>

          <div class="modal-hero-content">
            <span>
              DIA ${Number(item.dia)}
            </span>

            <h2>
              ${escapeHTML(item.titulo || "")}
            </h2>

            ${
              item.referencia
                ? `<p>${escapeHTML(item.referencia)}</p>`
                : ""
            }
          </div>
        </div>

        <div class="modal-content">

          ${
            item.introducao
              ? `
                <section>
                  <span class="eyebrow">
                    CHEGADA
                  </span>

                  <p class="lead">
                    ${escapeHTML(item.introducao)}
                  </p>
                </section>
              `
              : ""
          }

          ${
            item.reflexao
              ? `
                <section>
                  <span class="eyebrow">
                    REFLEXÃO
                  </span>

                  <div class="reading-text">
                    ${escapeHTML(item.reflexao)}
                  </div>
                </section>
              `
              : ""
          }

          ${
            item.pergunta
              ? `
                <section class="glass-highlight">
                  <span class="eyebrow">
                    CONTEMPLE
                  </span>

                  <h3>
                    ${escapeHTML(item.pergunta)}
                  </h3>
                </section>
              `
              : ""
          }

          ${
            item.pratica
              ? `
                <section>
                  <span class="eyebrow">
                    PRÁTICA
                  </span>

                  <div class="reading-text">
                    ${escapeHTML(item.pratica)}
                  </div>
                </section>
              `
              : ""
          }

          ${
            item.oracao
              ? `
                <section class="prayer-section">
                  <span class="eyebrow">
                    ORAÇÃO
                  </span>

                  <div class="prayer-text">
                    ${escapeHTML(item.oracao)}
                  </div>

                  <button
                    class="primary-button"
                    type="button"
                    data-audio-prayer="${Number(item.dia)}"
                  >
                    ▶ Ouvir oração
                  </button>
                </section>
              `
              : ""
          }

          <div class="deep-actions">

            ${
              estudo
                ? `
                  <button
                    class="glass-button"
                    type="button"
                    data-open-study-day="${Number(item.dia)}"
                  >
                    Aprofundar no estudo
                  </button>
                `
                : ""
            }

            <button
              class="glass-button"
              type="button"
              data-favorite-day="${Number(item.dia)}"
            >
              ${favorito ? "★ Favoritado" : "☆ Favoritar"}
            </button>

            <button
              class="primary-button"
              type="button"
              data-complete-day="${Number(item.dia)}"
            >
              ${
                concluido
                  ? "✓ Dia concluído"
                  : "Concluir este dia"
              }
            </button>

          </div>

        </div>
      </div>
    `;

    document.body.appendChild(modal);

    requestAnimationFrame(() => {
      modal.classList.add("is-visible");
    });

    document.body.classList.add("modal-open");
  }

  /* ---------------------------------------------------------
     MODAL ESTUDO
  --------------------------------------------------------- */

  function abrirEstudo(estudo) {
    if (!estudo) return;

    fecharTodosModais();

    const modal = document.createElement("div");

    modal.className = "modal-backdrop";
    modal.id = "studyModal";

    const leitura =
      estudo.leitura_biblica?.referencia ||
      estudo.texto_principal?.referencia ||
      "";

    const objetivo =
      estudo.objetivo ||
      "";

    const contexto =
      estudo.contexto_historico ||
      estudo.contexto_literario ||
      "";

    const pontos =
      estudo.exegese?.pontos ||
      [];

    modal.innerHTML = `
      <div
        class="modal-sheet study-modal"
        role="dialog"
        aria-modal="true"
      >
        <button
          class="modal-close"
          data-close-modal
          type="button"
        >
          ×
        </button>

        <div class="study-cover">
          <img
            src="${imagemPorCategoria(estudo.categoria || "Presença")}"
            alt=""
            onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'"
          />

          <div class="study-cover-overlay"></div>

          <div>
            <span class="eyebrow">
              ESTUDO PROFUNDO
            </span>

            <h2>
              ${escapeHTML(estudo.titulo || "")}
            </h2>

            ${
              estudo.subtitulo
                ? `<p>${escapeHTML(estudo.subtitulo)}</p>`
                : ""
            }
          </div>
        </div>

        <div class="modal-content">

          ${
            leitura
              ? `
                <section>
                  <span class="eyebrow">
                    TEXTO PRINCIPAL
                  </span>

                  <h3>
                    ${escapeHTML(leitura)}
                  </h3>
                </section>
              `
              : ""
          }

          ${
            objetivo
              ? `
                <section>
                  <span class="eyebrow">
                    OBJETIVO
                  </span>

                  <p class="reading-text">
                    ${escapeHTML(objetivo)}
                  </p>
                </section>
              `
              : ""
          }

          ${
            contexto
              ? `
                <section>
                  <span class="eyebrow">
                    CONTEXTO
                  </span>

                  <p class="reading-text">
                    ${escapeHTML(
                      typeof contexto === "string"
                        ? contexto
                        : JSON.stringify(contexto)
                    )}
                  </p>
                </section>
              `
              : ""
          }

          ${
            pontos.length
              ? `
                <section>
                  <span class="eyebrow">
                    EXEGESE
                  </span>

                  <div class="study-points">
                    ${pontos
                      .map(ponto => `
                        <div class="study-point">
                          <strong>
                            ${escapeHTML(
                              ponto.titulo ||
                              ponto.nome ||
                              ""
                            )}
                          </strong>

                          <p>
                            ${escapeHTML(
                              ponto.texto ||
                              ponto.explicacao ||
                              ponto.observacao ||
                              ""
                            )}
                          </p>
                        </div>
                      `)
                      .join("")}
                  </div>
                </section>
              `
              : ""
          }

          ${
            estudo.teologia
              ? `
                <section class="glass-highlight">
                  <span class="eyebrow">
                    TEOLOGIA
                  </span>

                  <p>
                    ${escapeHTML(
                      typeof estudo.teologia === "string"
                        ? estudo.teologia
                        : estudo.teologia.conteudo ||
                          estudo.teologia.descricao ||
                          JSON.stringify(estudo.teologia)
                    )}
                  </p>
                </section>
              `
              : ""
          }

          ${
            estudo.contemplacao_teologica
              ? `
                <section>
                  <span class="eyebrow">
                    CONTEMPLAÇÃO
                  </span>

                  <p class="reading-text">
                    ${escapeHTML(
                      typeof estudo.contemplacao_teologica === "string"
                        ? estudo.contemplacao_teologica
                        : estudo.contemplacao_teologica.texto ||
                          estudo.contemplacao_teologica.conteudo ||
                          JSON.stringify(estudo.contemplacao_teologica)
                    )}
                  </p>
                </section>
              `
              : ""
          }

          <div class="deep-actions">
            <button
              class="primary-button"
              type="button"
              data-close-modal
            >
              Continuar minha jornada
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.appendChild(modal);

    requestAnimationFrame(() => {
      modal.classList.add("is-visible");
    });

    document.body.classList.add("modal-open");
  }

  /* ---------------------------------------------------------
     MODAIS
  --------------------------------------------------------- */

  function fecharModal(modal) {
    if (!modal) return;

    modal.classList.remove("is-visible");

    setTimeout(() => {
      try {
        modal.remove();
      } catch {
        /* */
      }
    }, 300);

    document.body.classList.remove("modal-open");
  }

  function fecharTodosModais() {
    $$(".modal-backdrop").forEach(fecharModal);
  }

  /* ---------------------------------------------------------
     BUSCA
  --------------------------------------------------------- */

  function abrirBusca() {
    let overlay = $("#searchOverlay");

    if (!overlay) {
      overlay = document.createElement("div");

      overlay.id = "searchOverlay";
      overlay.className = "search-overlay";

      overlay.innerHTML = `
        <div class="search-panel">

          <button
            class="modal-close"
            data-close-search
            type="button"
          >
            ×
          </button>

          <span class="eyebrow">
            BUSCAR NA JORNADA
          </span>

          <input
            id="searchInput"
            type="search"
            placeholder="Tema, Palavra, oração..."
            autocomplete="off"
          />

          <div
            id="searchResults"
            class="search-results"
          ></div>

        </div>
      `;

      document.body.appendChild(overlay);

      const input = $("#searchInput", overlay);

      input?.addEventListener("input", () => {
        executarBusca(input.value);
      });
    }

    overlay.classList.add("is-visible");

    setTimeout(() => {
      $("#searchInput", overlay)?.focus();
    }, 100);
  }

  function executarBusca(termo) {
    const results = $("#searchResults");

    if (!results) return;

    const busca = normalizarTexto(termo);

    if (!busca) {
      results.innerHTML = `
        <p class="search-empty">
          Comece digitando um tema.
        </p>
      `;
      return;
    }

    const encontrados = devocionais
      .filter(item => {
        const texto = normalizarTexto(`
          ${item.titulo || ""}
          ${item.referencia || ""}
          ${item.introducao || ""}
          ${item.reflexao || ""}
          ${item.pratica || ""}
          ${item.categoria || ""}
        `);

        return texto.includes(busca);
      })
      .slice(0, 20);

    if (!encontrados.length) {
      results.innerHTML = `
        <p class="search-empty">
          Não encontramos esse tema ainda.
        </p>
      `;
      return;
    }

    results.innerHTML = encontrados
      .map(item => `
        <button
          class="search-result"
          type="button"
          data-open-day="${Number(item.dia)}"
        >
          <span>
            DIA ${Number(item.dia)}
          </span>

          <strong>
            ${escapeHTML(item.titulo || "")}
          </strong>
        </button>
      `)
      .join("");
  }

  function fecharBusca() {
    $("#searchOverlay")?.classList.remove(
      "is-visible"
    );
  }

  /* ---------------------------------------------------------
     NAVEGAÇÃO
  --------------------------------------------------------- */

  function navegar(screen) {
    if (!screen) return;

    const telas = $$("[data-screen]");

    if (!telas.length) return;

    telas.forEach(tela => {
      const ativa =
        tela.dataset.screen === screen;

      tela.classList.toggle(
        "active",
        ativa
      );

      tela.classList.toggle(
        "is-active",
        ativa
      );
    });

    $$("[data-nav]").forEach(nav => {
      nav.classList.toggle(
        "active",
        nav.dataset.nav === screen
      );
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    if (screen === "favoritos") {
      renderFavorites();
    }

    if (screen === "hoje") {
      renderTodayScreen();
    }
  }

  /* ---------------------------------------------------------
     TELA HOJE
  --------------------------------------------------------- */

  function renderTodayScreen() {
    const dia = obterDiaAtual();
    const item = obterDevocional(dia);

    $$("[data-today-day]").forEach(el => {
      el.textContent = dia;
    });

    $$("[data-today-title]").forEach(el => {
      el.textContent =
        item?.titulo ||
        `Dia ${dia}`;
    });

    $$("[data-today-reference]").forEach(el => {
      el.textContent =
        item?.referencia || "";
    });
  }

  /* ---------------------------------------------------------
     EVENTOS
  --------------------------------------------------------- */

  function bindEvents() {

    document.addEventListener(
      "click",
      event => {

        const target =
          event.target.closest(
            "[data-open-day]"
          );

        if (
          target &&
          !event.target.closest(
            "[data-favorite-day]"
          )
        ) {
          abrirDevocional(
            Number(target.dataset.openDay)
          );
          return;
        }

        const favorito =
          event.target.closest(
            "[data-favorite-day]"
          );

        if (favorito) {
          event.preventDefault();
          event.stopPropagation();

          alternarFavorito(
            Number(
              favorito.dataset.favoriteDay
            )
          );

          return;
        }

        const concluir =
          event.target.closest(
            "[data-complete-day]"
          );

        if (concluir) {
          concluirDia(
            Number(
              concluir.dataset.completeDay
            )
          );

          return;
        }

        const estudoDia =
          event.target.closest(
            "[data-open-study-day]"
          );

        if (estudoDia) {
          const estudo =
            obterEstudoPorDia(
              Number(
                estudoDia.dataset.openStudyDay
              )
            );

          if (estudo) {
            abrirEstudo(estudo);
          }

          return;
        }

        const estudo =
          event.target.closest(
            "[data-open-study]"
          );

        if (estudo) {
          const encontrado =
            estudos.find(
              item =>
                String(item.id) ===
                String(
                  estudo.dataset.openStudy
                )
            );

          if (encontrado) {
            abrirEstudo(encontrado);
          }

          return;
        }

        const nav =
          event.target.closest(
            "[data-nav]"
          );

        if (nav) {
          navegar(nav.dataset.nav);
          return;
        }

        const fechar =
          event.target.closest(
            "[data-close-modal]"
          );

        if (fechar) {
          fecharModal(
            fechar.closest(
              ".modal-backdrop"
            )
          );

          return;
        }

        const fecharBuscaBtn =
          event.target.closest(
            "[data-close-search]"
          );

        if (fecharBuscaBtn) {
          fecharBusca();
          return;
        }

        const busca =
          event.target.closest(
            "[data-open-search]"
          );

        if (busca) {
          abrirBusca();
          return;
        }

        const iniciar =
          event.target.closest(
            "[data-start-journey]"
          );

        if (iniciar) {
          navegar("hoje");
          abrirDevocional(
            obterDiaAtual()
          );
          return;
        }

        const explorar =
          event.target.closest(
            "[data-explore-studies]"
          );

        if (explorar) {
          navegar("estudos");
          return;
        }
      }
    );

    document.addEventListener(
      "keydown",
      event => {
        if (event.key === "Escape") {
          fecharTodosModais();
          fecharBusca();
        }
      }
    );
  }

  /* ---------------------------------------------------------
     SERVICE WORKER
  --------------------------------------------------------- */

  function registrarServiceWorker() {
    if (
      "serviceWorker" in navigator
    ) {
      window.addEventListener(
        "load",
        () => {
          navigator.serviceWorker
            .register("./sw.js")
            .then(registration => {
              console.log(
                "Service Worker ativo:",
                registration.scope
              );
            })
            .catch(error => {
              console.warn(
                "Service Worker:",
                error
              );
            });
        }
      );
    }
  }

  /* ---------------------------------------------------------
     INICIALIZAÇÃO
  --------------------------------------------------------- */

  async function iniciarApp() {

    /* Segurança contra loading infinito */
    const timeoutLoading =
      setTimeout(() => {
        removerLoading();
      }, 5000);

    try {

      renderHero();

      await carregarDados();

      renderHero();

      renderTodayRail();
      renderPresenceRail();
      renderStudiesRail();
      renderTop10();
      renderFavorites();
      renderTodayScreen();
      atualizarProgresso();

      bindEvents();

      registrarServiceWorker();

      window.DoceEspirito = {
        devocionais,
        estudos,
        abrirDevocional,
        abrirEstudo,
        navegar,
        renderTodayRail,
        renderPresenceRail,
        renderStudiesRail,
        renderTop10,
        renderFavorites,
        atualizarProgresso
      };

    } catch (erro) {

      console.error(
        "Erro ao iniciar o aplicativo:",
        erro
      );

    } finally {

      clearTimeout(
        timeoutLoading
      );

      removerLoading();
    }
  }

  /* ---------------------------------------------------------
     START
  --------------------------------------------------------- */

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      iniciarApp,
      { once: true }
    );
  } else {
    iniciarApp();
  }

})();
