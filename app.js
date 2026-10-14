/* =========================================================
   DOCE ESPÍRITO SANTO — UM AMIGO ÍNTIMO
   APP.JS — MOTOR PRINCIPAL DA EXPERIÊNCIA
   =========================================================

   DIRETRIZES DO PROJETO
   ---------------------------------------------------------
   Netflix na experiência.
   Doce Espírito Santo na identidade.

   Eixo principal:
   "Aprenda a percebê-lo.
    Ele já está aqui."

   O aplicativo deve funcionar como uma jornada de
   imersão espiritual, bíblica, teológica e contemplativa.

   Camadas:
   1. Devocional diário
   2. Estudo profundo
   3. Bíblia
   4. Mapas de estudo
   5. Planos de leitura
   6. Bibliografia
   7. Oração
   8. Diário
   9. Áudio
   10. Progresso
   11. Favoritos
   12. Busca
   13. Central de comandos
   ========================================================= */


/* =========================================================
   ESTADO GLOBAL
   ========================================================= */

let devotionals = [];
let studies = [];

let currentDay = 1;
let currentStudy = null;
let currentDevotional = null;

let currentFilter = "all";
let currentScreen = "home";

let searchResults = [];
let searchTimeout = null;


/* =========================================================
   HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);

const qs = (selector, root = document) =>
  root.querySelector(selector);

const qsa = (selector, root = document) =>
  [...root.querySelectorAll(selector)];

const safeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const escapeHTML = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE = {
  done: (day) => `des_done_${day}`,
  favorite: (day) => `des_favorite_${day}`,
  journal: (day) => `des_journal_${day}`,
  lastDay: `des_last_day`,
  studyProgress: (id) => `des_study_progress_${id}`,
  planProgress: (id) => `des_plan_progress_${id}`
};


function isDone(day) {
  return localStorage.getItem(STORAGE.done(day)) === "true";
}


function setDone(day, value = true) {
  localStorage.setItem(STORAGE.done(day), String(value));
}


function isFavorite(day) {
  return localStorage.getItem(STORAGE.favorite(day)) === "true";
}


function setFavorite(day, value = true) {
  localStorage.setItem(STORAGE.favorite(day), String(value));
}


function getJournal(day) {
  return localStorage.getItem(STORAGE.journal(day)) || "";
}


function saveJournalText(day, text) {
  localStorage.setItem(STORAGE.journal(day), text);
}


function getStudyProgress(id) {
  return safeNumber(
    localStorage.getItem(STORAGE.studyProgress(id)),
    0
  );
}


function setStudyProgress(id, value) {
  localStorage.setItem(
    STORAGE.studyProgress(id),
    String(Math.max(0, Math.min(100, value)))
  );
}


/* =========================================================
   CARREGAMENTO DOS DADOS
   ========================================================= */

async function loadJSON(path) {

  const response = await fetch(`${path}?v=${Date.now()}`);

  if (!response.ok) {
    throw new Error(`Não foi possível carregar ${path}`);
  }

  return await response.json();
}


/* =========================================================
   DEVOCIONAIS
   ========================================================= */

async function loadDevotionals() {

  try {

    const data = await loadJSON("devocionais.json");

    if (Array.isArray(data)) {
      devotionals = data;
    } else if (Array.isArray(data.devocionais)) {
      devotionals = data.devocionais;
    } else if (Array.isArray(data.dias)) {
      devotionals = data.dias;
    } else {
      devotionals = [];
    }

    console.log(
      `✓ ${devotionals.length} devocionais carregados`
    );

  } catch (error) {

    console.error("Erro ao carregar devocionais:", error);

    devotionals = [];

  }
}


/* =========================================================
   ESTUDOS
   ========================================================= */

async function loadStudies() {

  try {

    const data = await loadJSON("estudos.json");

    if (Array.isArray(data)) {
      studies = data;
    } else if (Array.isArray(data.estudos)) {
      studies = data.estudos;
    } else {
      studies = [];
    }

    console.log(
      `✓ ${studies.length} estudos carregados`
    );

  } catch (error) {

    console.warn(
      "estudos.json ainda não pôde ser carregado:",
      error
    );

    studies = [];

  }
}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

async function initApp() {

  console.log(
    "Doce Espírito Santo — iniciando experiência..."
  );

  await Promise.all([
    loadDevotionals(),
    loadStudies()
  ]);

  currentDay =
    safeNumber(localStorage.getItem(STORAGE.lastDay), 1);

  if (!getDevotional(currentDay)) {
    currentDay = 1;
  }

  renderAll();

  bindEvents();

  updateGlobalProgress();

  console.log(
    "✓ Aplicativo inicializado"
  );
}


function getDevotional(day) {

  return devotionals.find(
    item => safeNumber(item.dia) === safeNumber(day)
  ) || null;
}


function getStudyByDay(day) {

  return studies.find(
    item => safeNumber(item.dia) === safeNumber(day)
  ) || null;
}


function getStudyById(id) {

  if (!id) return null;

  return studies.find(
    item => item.id === id
  ) || null;
}


function getNextDay() {

  const next = devotionals.find(
    item => !isDone(safeNumber(item.dia))
  );

  return next || devotionals[0] || null;
}


/* =========================================================
   PROGRESSO
   ========================================================= */

function countDone() {

  let total = 0;

  devotionals.forEach(item => {

    const day = safeNumber(item.dia);

    if (isDone(day)) {
      total++;
    }

  });

  return total;
}


function getProgressPercent() {

  if (!devotionals.length) return 0;

  return Math.round(
    (countDone() / devotionals.length) * 100
  );
}


function updateGlobalProgress() {

  const done = countDone();
  const percent = getProgressPercent();

  qsa("[data-progress-count]").forEach(el => {
    el.textContent = `${done} / 365`;
  });

  qsa("[data-progress-percent]").forEach(el => {
    el.textContent = `${percent}%`;
  });

  qsa("[data-progress-bar]").forEach(el => {
    el.style.width = `${percent}%`;
  });
}


/* =========================================================
   CARDS
   ========================================================= */

function getCardImage(item) {

  if (!item) return "";

  return (
    item.imagem ||
    item.image ||
    item.capa ||
    item.thumbnail ||
    item.fundo ||
    ""
  );
}


function getIntroduction(item) {

  return (
    item.introducao ||
    item.subtitulo ||
    item.resumo ||
    item.descricao ||
    ""
  );
}


function cardHTML(item, options = {}) {

  if (!item) return "";

  const day = safeNumber(item.dia);
  const title =
    item.titulo ||
    item.title ||
    `Dia ${day}`;

  const reference =
    item.referencia ||
    item.referencia_biblica ||
    "";

  const image = getCardImage(item);

  const completed = isDone(day);
  const favorite = isFavorite(day);

  const type = options.type || "devotional";

  const imageStyle = image
    ? `style="background-image:url('${escapeHTML(image)}')"`
    : "";

  return `
    <article
      class="content-card ${completed ? "is-complete" : ""}"
      data-card-type="${type}"
      data-day="${day}"
      data-id="${escapeHTML(item.id || "")}"
      tabindex="0"
      role="button"
      aria-label="${escapeHTML(title)}"
    >

      <div
        class="content-card__image"
        ${imageStyle}
      >
        <div class="content-card__overlay"></div>

        ${
          completed
            ? `<span class="content-card__status">✓ CONCLUÍDO</span>`
            : ""
        }

        ${
          favorite
            ? `<span class="content-card__favorite">♡</span>`
            : ""
        }

        ${
          type === "study"
            ? `<span class="content-card__type">ESTUDO</span>`
            : ""
        }

        ${
          type === "devotional"
            ? `<span class="content-card__day">DIA ${String(day).padStart(2, "0")}</span>`
            : ""
        }
      </div>

      <div class="content-card__body">

        <h3>
          ${escapeHTML(title)}
        </h3>

        ${
          reference
            ? `<p class="content-card__reference">${escapeHTML(reference)}</p>`
            : ""
        }

        ${
          getIntroduction(item)
            ? `<p class="content-card__description">
                ${escapeHTML(getIntroduction(item))}
              </p>`
            : ""
        }

      </div>

    </article>
  `;
}


/* =========================================================
   RENDER PRINCIPAL
   ========================================================= */

function renderAll() {

  renderHome();
  renderJourney();
  renderToday();
  renderFavorites();
  renderStudies();
  renderPlans();
  renderProfile();
  updateGlobalProgress();

  bindCards();
}


/* =========================================================
   HOME
   ========================================================= */

function renderHome() {

  const next = getNextDay();

  if (!next) return;

  const nextDay = safeNumber(next.dia);

  const progress = getProgressPercent();

  /* -----------------------------------------
     CONTINUE ONDE PAROU
     ----------------------------------------- */

  qsa("[data-next-day]").forEach(el => {
    el.textContent =
      String(nextDay).padStart(2, "0");
  });

  qsa("[data-next-title]").forEach(el => {
    el.textContent =
      next.titulo || `Dia ${nextDay}`;
  });

  qsa("[data-next-description]").forEach(el => {
    el.textContent =
      getIntroduction(next) ||
      "Continue sua jornada de presença.";
  });


  /* -----------------------------------------
     HOJE
     ----------------------------------------- */

  qsa("[data-today-title]").forEach(el => {
    el.textContent =
      next.titulo || `Dia ${nextDay}`;
  });


  /* -----------------------------------------
     PROGRESSO
     ----------------------------------------- */

  qsa("[data-home-progress]").forEach(el => {
    el.textContent = `${progress}%`;
  });


  /* -----------------------------------------
     RAILS
     ----------------------------------------- */

  renderRail(
    "[data-rail-today]",
    devotionals.slice(0, 10)
  );

  renderRail(
    "[data-rail-presence]",
    devotionals.filter(item =>
      String(
        item.categoria ||
        item.tema ||
        ""
      ).toLowerCase().includes("presença")
    ).slice(0, 10)
  );

  renderRail(
    "[data-rail-top10]",
    devotionals.slice(0, 10),
    { type: "devotional" }
  );

  renderRail(
    "[data-rail-journey]",
    devotionals.slice(
      Math.max(0, nextDay - 1),
      Math.max(0, nextDay - 1) + 12
    )
  );

  renderRail(
    "[data-rail-studies]",
    studies.slice(0, 10),
    { type: "study" }
  );
}


/* =========================================================
   RAILS
   ========================================================= */

function renderRail(selector, items, options = {}) {

  const container = qs(selector);

  if (!container) return;

  if (!items || !items.length) {

    container.innerHTML = `
      <div class="empty-state">
        <p>
          Este conteúdo está sendo preparado para sua jornada.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    items.map(item =>
      cardHTML(item, options)
    ).join("");

  bindCards(container);
}


/* =========================================================
   JORNADA
   ========================================================= */

function renderJourney() {

  const container =
    qs("[data-journey-grid]") ||
    qs("#journeyGrid");

  if (!container) return;

  if (!devotionals.length) {

    container.innerHTML = `
      <div class="empty-state">
        <p>Nenhum devocional carregado.</p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    devotionals.map(item =>
      cardHTML(item)
    ).join("");

  bindCards(container);
}


/* =========================================================
   HOJE
   ========================================================= */

function renderToday() {

  const item = getNextDay();

  if (!item) return;

  qsa("[data-today-day]").forEach(el => {
    el.textContent =
      `DIA ${String(item.dia).padStart(2, "0")}`;
  });

  qsa("[data-today-reference]").forEach(el => {
    el.textContent =
      item.referencia || "";
  });

  qsa("[data-today-intro]").forEach(el => {
    el.textContent =
      getIntroduction(item);
  });
}


/* =========================================================
   FAVORITOS
   ========================================================= */

function renderFavorites() {

  const container =
    qs("[data-favorites-grid]") ||
    qs("#favoritesGrid");

  if (!container) return;

  const favorites =
    devotionals.filter(item =>
      isFavorite(safeNumber(item.dia))
    );

  if (!favorites.length) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-state__icon">♡</div>

        <h3>Sua lista está vazia</h3>

        <p>
          Salve devocionais, estudos e conteúdos
          que deseja revisitar.
        </p>

      </div>
    `;

    return;
  }

  container.innerHTML =
    favorites.map(item =>
      cardHTML(item)
    ).join("");

  bindCards(container);
}


/* =========================================================
   ESTUDOS
   ========================================================= */

function renderStudies() {

  const container =
    qs("[data-studies-grid]") ||
    qs("#studiesGrid");

  if (!container) return;

  if (!studies.length) {

    container.innerHTML = `
      <div class="empty-state">
        <p>Carregando estudos...</p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    studies.map(study =>
      cardHTML(study, { type: "study" })
    ).join("");

  bindCards(container);
}


/* =========================================================
   PLANOS
   ========================================================= */

function renderPlans() {

  const container =
    qs("[data-plans-grid]") ||
    qs("#plansGrid");

  if (!container) return;

  const plans = [];

  studies.forEach(study => {

    if (
      study.plano_leitura &&
      !plans.some(
        p => p.titulo === study.plano_leitura.titulo
      )
    ) {
      plans.push(study.plano_leitura);
    }

  });

  if (!plans.length) {

    container.innerHTML = `
      <div class="empty-state">
        <p>
          Os planos de leitura serão disponibilizados
          progressivamente.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    plans.map((plan, index) => `
      <article
        class="plan-card"
        data-plan-index="${index}"
      >

        <div class="plan-card__meta">
          PLANO DE LEITURA
        </div>

        <h3>
          ${escapeHTML(plan.titulo || "Plano")}
        </h3>

        <p>
          ${plan.dias?.length || 0} dias de leitura
          conectada à jornada.
        </p>

        <button
          class="btn btn-primary"
          data-action="open-plan"
          data-plan-index="${index}"
        >
          Começar plano
        </button>

      </article>
    `).join("");

}


/* =========================================================
   PERFIL
   ========================================================= */

function renderProfile() {

  const done = countDone();
  const percent = getProgressPercent();

  qsa("[data-profile-days]").forEach(el => {
    el.textContent = done;
  });

  qsa("[data-profile-progress]").forEach(el => {
    el.textContent = `${percent}%`;
  });
}


/* =========================================================
   ABRIR DEVOCIONAL
   ========================================================= */

function openDay(dayNumber) {

  const item = getDevotional(dayNumber);

  if (!item) return;

  currentDay = safeNumber(dayNumber);
  currentDevotional = item;

  localStorage.setItem(
    STORAGE.lastDay,
    String(currentDay)
  );

  renderDevotionalModal(item);
}


/* =========================================================
   MODAL DEVOCIONAL
   ========================================================= */

function renderDevotionalModal(item) {

  const modal =
    qs("#devotionalModal") ||
    qs("[data-devotional-modal]");

  if (!modal) {

    /* Se a estrutura atual não tiver modal,
       abrimos uma tela dedicada. */

    showDevotionalFallback(item);
    return;
  }

  const day = safeNumber(item.dia);
  const study = getStudyByDay(day);

  const title =
    item.titulo ||
    `Dia ${day}`;

  const reference =
    item.referencia ||
    "";

  const reflection =
    item.reflexao ||
    item.reflexão ||
    "";

  const practice =
    item.pratica ||
    item.prática ||
    "";

  const question =
    item.pergunta ||
    "";

  const prayer =
    item.oracao ||
    item.oração ||
    "";

  const diary =
    item.diario ||
    item.diário ||
    "";

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");

  const content =
    qs("[data-modal-content]", modal) ||
    qs(".modal-content", modal) ||
    modal;

  content.innerHTML = `

    <div class="devotional-reader">

      <div class="reader-header">

        <span class="reader-day">
          DIA ${String(day).padStart(2, "0")}
        </span>

        <h2>
          ${escapeHTML(title)}
        </h2>

        ${
          reference
            ? `<p class="reader-reference">
                ${escapeHTML(reference)}
              </p>`
            : ""
        }

      </div>


      ${
        item.introducao
          ? `
            <section class="reader-section reader-intro">
              <p>
                ${escapeHTML(item.introducao)}
              </p>
            </section>
          `
          : ""
      }


      ${
        reflection
          ? `
            <section class="reader-section">

              <span class="reader-label">
                REFLEXÃO
              </span>

              <div class="reader-text">
                ${formatText(reflection)}
              </div>

            </section>
          `
          : ""
      }


      ${
        practice
          ? `
            <section class="reader-section">

              <span class="reader-label">
                PRÁTICA
              </span>

              <div class="reader-text">
                ${formatText(practice)}
              </div>

            </section>
          `
          : ""
      }


      ${
        question
          ? `
            <section class="reader-question">

              <span class="reader-label">
                PARE E PERCEBA
              </span>

              <h3>
                ${escapeHTML(question)}
              </h3>

            </section>
          `
          : ""
      }


      ${
        prayer
          ? `
            <section class="reader-prayer">

              <span class="reader-label">
                ORAÇÃO
              </span>

              <div class="reader-text">
                ${formatText(prayer)}
              </div>

            </section>
          `
          : ""
      }


      ${
        diary
          ? `
            <section class="reader-section">

              <span class="reader-label">
                DIÁRIO
              </span>

              <div class="reader-text">
                ${formatText(diary)}
              </div>

            </section>
          `
          : ""
      }


      ${
        study
          ? `
            <section class="reader-deep-dive">

              <span class="reader-label">
                CONTINUE APROFUNDANDO
              </span>

              <h3>
                ${escapeHTML(
                  study.titulo ||
                  "Estudo teológico"
                )}
              </h3>

              <p>
                ${escapeHTML(
                  study.subtitulo ||
                  "Entre mais profundamente neste tema."
                )}
              </p>

              <button
                class="btn btn-primary"
                data-action="open-study"
                data-study-id="${escapeHTML(study.id)}"
              >
                Entrar no estudo
              </button>

            </section>
          `
          : ""
      }


      <div class="reader-actions">

        <button
          class="btn btn-secondary"
          data-action="toggle-favorite"
          data-day="${day}"
        >
          ${
            isFavorite(day)
              ? "♥ Remover da minha lista"
              : "♡ Salvar na minha lista"
          }
        </button>

        <button
          class="btn btn-primary"
          data-action="complete-day"
          data-day="${day}"
        >
          ${
            isDone(day)
              ? "✓ Dia concluído"
              : "Marcar como concluído"
          }
        </button>

      </div>

    </div>
  `;

  bindActionButtons(modal);
}


/* =========================================================
   TEXTO
   ========================================================= */

function formatText(text) {

  return escapeHTML(text)
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
}


/* =========================================================
   FALLBACK DEVOCIONAL
   ========================================================= */

function showDevotionalFallback(item) {

  const day = safeNumber(item.dia);

  const overlay = document.createElement("div");

  overlay.className = "dynamic-reader";

  overlay.innerHTML = `

    <div class="dynamic-reader__backdrop"
         data-action="close-dynamic-reader"></div>

    <div class="dynamic-reader__panel">

      <button
        class="dynamic-reader__close"
        data-action="close-dynamic-reader"
      >
        ×
      </button>

      <span>
        DIA ${String(day).padStart(2, "0")}
      </span>

      <h2>
        ${escapeHTML(item.titulo || "")}
      </h2>

      <p>
        ${formatText(
          item.reflexao ||
          item.introducao ||
          ""
        )}
      </p>

    </div>

  `;

  document.body.appendChild(overlay);

  bindActionButtons(overlay);
}


/* =========================================================
   ESTUDO PROFUNDO
   ========================================================= */

function openStudy(studyId) {

  const study = getStudyById(studyId);

  if (!study) {

    console.warn(
      "Estudo não encontrado:",
      studyId
    );

    return;
  }

  currentStudy = study;

  renderStudyReader(study);
}


/* =========================================================
   LEITOR DE ESTUDO
   ========================================================= */

function renderStudyReader(study) {

  const overlay = document.createElement("div");

  overlay.className =
    "dynamic-reader study-reader";

  overlay.innerHTML = `

    <div
      class="dynamic-reader__backdrop"
      data-action="close-dynamic-reader"
    ></div>


    <div class="dynamic-reader__panel">

      <button
        class="dynamic-reader__close"
        data-action="close-dynamic-reader"
        aria-label="Fechar"
      >
        ×
      </button>


      <header class="study-reader__header">

        <span class="study-reader__category">
          ${escapeHTML(
            study.categoria ||
            "ESTUDO"
          )}
        </span>

        <span class="study-reader__time">
          ${safeNumber(
            study.tempo_estimado_minutos,
            40
          )} MIN
        </span>

        <h1>
          ${escapeHTML(study.titulo || "")}
        </h1>

        ${
          study.subtitulo
            ? `
              <p>
                ${escapeHTML(study.subtitulo)}
              </p>
            `
            : ""
        }

      </header>


      ${
        study.objetivo
          ? `
            <section class="study-section">

              <span class="reader-label">
                OBJETIVO
              </span>

              <p>
                ${formatText(study.objetivo)}
              </p>

            </section>
          `
          : ""
      }


      ${
        study.pergunta_central
          ? `
            <section class="reader-question">

              <span class="reader-label">
                PERGUNTA CENTRAL
              </span>

              <h3>
                ${escapeHTML(
                  study.pergunta_central
                )}
              </h3>

            </section>
          `
          : ""
      }


      ${renderStudyReading(study)}


      ${renderStudyContext(study)}


      ${renderStudyExegesis(study)}


      ${renderStudyKeywords(study)}


      ${renderStudyTheology(study)}


      ${renderStudyContemplation(study)}


      ${renderStudyApplication(study)}


      ${renderStudyQuestions(study)}


      ${renderStudyConnections(study)}


      ${renderStudyBibliography(study)}


      ${renderStudyMap(study)}


      ${renderStudyPlan(study)}


      ${renderStudyPrayer(study)}


      ${renderStudyJournal(study)}


      <section class="study-section study-continue">

        <span class="reader-label">
          CONTINUE SUA JORNADA
        </span>

        <div class="study-continue__grid">

          <button
            class="btn btn-secondary"
            data-action="open-bible"
            data-reference="${
              escapeHTML(
                study.texto_principal?.referencia ||
                ""
              )
            }"
          >
            Bíblia
          </button>

          <button
            class="btn btn-secondary"
            data-action="open-study-map"
            data-study-id="${
              escapeHTML(study.id || "")
            }"
          >
            Mapa
          </button>

          <button
            class="btn btn-secondary"
            data-action="open-plan-from-study"
            data-study-id="${
              escapeHTML(study.id || "")
            }"
          >
            Plano
          </button>

          <button
            class="btn btn-secondary"
            data-action="open-audio"
            data-study-id="${
              escapeHTML(study.id || "")
            }"
          >
            Ouvir
          </button>

        </div>

      </section>


      <div class="study-reader__finish">

        <button
          class="btn btn-primary"
          data-action="complete-study"
          data-study-id="${
            escapeHTML(study.id || "")
          }"
        >
          ${
            getStudyProgress(study.id) >= 100
              ? "✓ Estudo concluído"
              : "Concluir estudo"
          }
        </button>

      </div>

    </div>

  `;

  document.body.appendChild(overlay);

  bindActionButtons(overlay);
}


/* =========================================================
   LEITURA BÍBLICA
   ========================================================= */

function renderStudyReading(study) {

  const data = study.leitura_biblica;

  if (!data) return "";

  const refs =
    Array.isArray(data.referencias)
      ? data.referencias
      : [];

  return `

    <section class="study-section">

      <span class="reader-label">
        LEITURA BÍBLICA
      </span>

      ${
        data.instrucao
          ? `
            <p>
              ${formatText(data.instrucao)}
            </p>
          `
          : ""
      }

      <div class="reference-list">

        ${refs.map(ref => `
          <button
            class="reference-chip"
            data-action="open-bible"
            data-reference="${escapeHTML(ref)}"
          >
            ${escapeHTML(ref)}
          </button>
        `).join("")}

      </div>

      ${
        Array.isArray(data.observacoes)
          ? `
            <ul class="study-list">
              ${data.observacoes.map(
                item => `
                  <li>${formatText(item)}</li>
                `
              ).join("")}
            </ul>
          `
          : ""
      }

    </section>

  `;
}


/* =========================================================
   CONTEXTO
   ========================================================= */

function renderStudyContext(study) {

  const historical =
    study.contexto_historico;

  const literary =
    study.contexto_literario;

  if (!historical && !literary) {
    return "";
  }

  return `

    <section class="study-section">

      <span class="reader-label">
        CONTEXTO
      </span>

      ${
        historical
          ? `
            <div class="study-subsection">

              <h3>
                ${
                  escapeHTML(
                    historical.titulo ||
                    "Contexto histórico"
                  )
                }
              </h3>

              <p>
                ${formatText(
                  historical.texto ||
                  historical.explicacao ||
                  ""
                )}
              </p>

            </div>
          `
          : ""
      }


      ${
        literary
          ? `
            <div class="study-subsection">

              <h3>
                ${
                  escapeHTML(
                    literary.titulo ||
                    "Contexto literário"
                  )
                }
              </h3>

              <p>
                ${formatText(
                  literary.texto ||
                  literary.explicacao ||
                  ""
                )}
              </p>

            </div>
          `
          : ""
      }

    </section>

  `;
}


/* =========================================================
   EXEGESE
   ========================================================= */

function renderStudyExegesis(study) {

  const data = study.exegese;

  if (!data) return "";

  const points =
    Array.isArray(data.pontos)
      ? data.pontos
      : [];

  return `

    <section class="study-section">

      <span class="reader-label">
        EXEGESE
      </span>

      ${
        data.titulo
          ? `
            <h2>
              ${escapeHTML(data.titulo)}
            </h2>
          `
          : ""
      }

      <div class="exegesis-list">

        ${points.map(point => `

          <article class="exegesis-item">

            <h3>
              ${escapeHTML(point.tema || "")}
            </h3>

            <p>
              ${formatText(
                point.explicacao ||
                point.explanation ||
                ""
              )}
            </p>

          </article>

        `).join("")}

      </div>

    </section>

  `;
}


/* =========================================================
   PALAVRAS-CHAVE
   ========================================================= */

function renderStudyKeywords(study) {

  const words =
    Array.isArray(study.palavras_chave)
      ? study.palavras_chave
      : [];

  if (!words.length) return "";

  return `

    <section class="study-section">

      <span class="reader-label">
        PALAVRAS-CHAVE
      </span>

      <div class="keyword-grid">

        ${words.map(word => `

          <article class="keyword-card">

            <strong>
              ${escapeHTML(word.termo || "")}
            </strong>

            ${
              word.idioma
                ? `<span>${escapeHTML(word.idioma)}</span>`
                : ""
            }

            ${
              word.observacao
                ? `<p>${formatText(word.observacao)}</p>`
                : ""
            }

          </article>

        `).join("")}

      </div>

    </section>

  `;
}


/* =========================================================
   TEOLOGIA
   ========================================================= */

function renderStudyTheology(study) {

  const data = study.teologia;

  if (!data) return "";

  return `

    <section class="study-section study-theology">

      <span class="reader-label">
        TEOLOGIA
      </span>

      ${
        data.titulo
          ? `
            <h2>
              ${escapeHTML(data.titulo)}
            </h2>
          `
          : ""
      }


      ${
        Array.isArray(data.pneumatologia)
          ? `
            <div class="theology-grid">

              ${data.pneumatologia.map(item => {

                if (typeof item === "string") {
                  return `
                    <article>
                      <p>${formatText(item)}</p>
                    </article>
                  `;
                }

                return `
                  <article>

                    <h3>
                      ${escapeHTML(
                        item.titulo ||
                        item.tema ||
                        ""
                      )}
                    </h3>

                    <p>
                      ${formatText(
                        item.texto ||
                        item.explicacao ||
                        ""
                      )}
                    </p>

                  </article>
                `;

              }).join("")}

            </div>
          `
          : ""
      }


      ${
        data.trindade
          ? `
            <div class="study-subsection">

              <h3>
                Trindade
              </h3>

              <p>
                ${formatText(data.trindade)}
              </p>

            </div>
          `
          : ""
      }


      ${
        data.implicacao
          ? `
            <div class="study-subsection">

              <h3>
                Implicação para a vida
              </h3>

              <p>
                ${formatText(data.implicacao)}
              </p>

            </div>
          `
          : ""
      }


      ${
        data.alerta_teologico
          ? `
            <aside class="theology-warning">

              <strong>
                Atenção teológica
              </strong>

              <p>
                ${formatText(
                  data.alerta_teologico
                )}
              </p>

            </aside>
          `
          : ""
      }

    </section>

  `;
}


/* =========================================================
   CONTEMPLAÇÃO
   ========================================================= */

function renderStudyContemplation(study) {

  const data =
    study.contemplacao_teologica;

  if (!data) return "";

  const phrases =
    Array.isArray(data.frases)
      ? data.frases
      : [];

  return `

    <section class="study-section contemplation">

      <span class="reader-label">
        CONTEMPLAÇÃO
      </span>

      ${
        data.titulo
          ? `
            <h2>
              ${escapeHTML(data.titulo)}
            </h2>
          `
          : ""
      }

      ${
        data.texto
          ? `
            <div class="contemplation-text">
              ${formatText(data.texto)}
            </div>
          `
          : ""
      }

      ${
        data.silencio
          ? `
            <div class="silence-card">

              <span>
                MOMENTO DE SILÊNCIO
              </span>

              <strong>
                ${Math.round(
                  safeNumber(
                    data.silencio.duracao_segundos,
                    120
                  ) / 60
                )} MIN
              </strong>

              <p>
                ${escapeHTML(
                  data.silencio.instrucao ||
                  "Permaneça em silêncio."
                )}
              </p>

            </div>
          `
          : ""
      }

      ${
        phrases.length
          ? `
            <div class="contemplation-phrases">

              ${phrases.map(
                phrase => `
                  <p>
                    ${escapeHTML(phrase)}
                  </p>
                `
              ).join("")}

            </div>
          `
          : ""
      }

    </section>

  `;
}


/* =========================================================
   APLICAÇÃO
   ========================================================= */

function renderStudyApplication(study) {

  const data = study.aplicacao;

  if (!data) return "";

  return `

    <section class="study-section">

      <span class="reader-label">
        APLICAÇÃO
      </span>

      ${
        data.titulo
          ? `
            <h2>
              ${escapeHTML(data.titulo)}
            </h2>
          `
          : ""
      }

      <p>
        ${formatText(
          data.texto ||
          data.explicacao ||
          data.pratica ||
          ""
        )}
      </p>

    </section>

  `;
}


/* =========================================================
   PERGUNTAS
   ========================================================= */

function renderStudyQuestions(study) {

  const questions =
    Array.isArray(study.perguntas)
      ? study.perguntas
      : [];

  if (!questions.length) return "";

  return `

    <section class="study-section">

      <span class="reader-label">
        PERGUNTAS PARA MEDITAÇÃO
      </span>

      <div class="questions-list">

        ${questions.map((question, index) => `

          <article class="question-item">

            <span>
              ${String(index + 1).padStart(2, "0")}
            </span>

            <p>
              ${formatText(
                typeof question === "string"
                  ? question
                  : question.pergunta ||
                    question.texto ||
                    ""
              )}
            </p>

          </article>

        `).join("")}

      </div>

    </section>

  `;
}


/* =========================================================
   CONEXÕES BÍBLICAS
   ========================================================= */

function renderStudyConnections(study) {

  const connections =
    Array.isArray(study.conexoes_biblicas)
      ? study.conexoes_biblicas
      : [];

  if (!connections.length) return "";

  return `

    <section class="study-section">

      <span class="reader-label">
        CONEXÕES NAS ESCRITURAS
      </span>

      <div class="reference-list">

        ${connections.map(connection => {

          const ref =
            typeof connection === "string"
              ? connection
              : connection.referencia || "";

          return `
            <button
              class="reference-chip"
              data-action="open-bible"
              data-reference="${escapeHTML(ref)}"
            >
              ${escapeHTML(ref)}
            </button>
          `;

        }).join("")}

      </div>

    </section>

  `;
}


/* =========================================================
   BIBLIOGRAFIA
   ========================================================= */

function renderStudyBibliography(study) {

  const data = study.bibliografia;

  if (!data) return "";

  const categories =
    Array.isArray(data.categorias)
      ? data.categorias
      : [];

  return `

    <section class="study-section bibliography">

      <span class="reader-label">
        BIBLIOGRAFIA
      </span>

      ${
        data.titulo
          ? `
            <h2>
              ${escapeHTML(data.titulo)}
            </h2>
          `
          : ""
      }

      ${
        data.observacao
          ? `
            <p class="bibliography-note">
              ${formatText(data.observacao)}
            </p>
          `
          : ""
      }

      <div class="bibliography-list">

        ${categories.map(category => `

          <article>

            <h3>
              ${escapeHTML(
                category.categoria ||
                "Referências"
              )}
            </h3>

            ${
              Array.isArray(category.referencias)
                ? `
                  <ul>
                    ${category.referencias.map(
                      reference => `
                        <li>
                          ${escapeHTML(reference)}
                        </li>
                      `
                    ).join("")}
                  </ul>
                `
                : ""
            }

          </article>

        `).join("")}

      </div>

    </section>

  `;
}


/* =========================================================
   MAPA
   ========================================================= */

function renderStudyMap(study) {

  const map = study.mapa_estudo;

  if (!map) return "";

  const branches =
    Array.isArray(map.ramificacoes)
      ? map.ramificacoes
      : [];

  return `

    <section class="study-section study-map">

      <span class="reader-label">
        MAPA DE ESTUDO
      </span>

      ${
        map.titulo
          ? `
            <h2>
              ${escapeHTML(map.titulo)}
            </h2>
          `
          : ""
      }

      ${
        map.raiz
          ? `
            <div class="map-root">
              ${escapeHTML(map.raiz)}
            </div>
          `
          : ""
      }

      <div class="map-branches">

        ${branches.map(branch => {

          if (typeof branch === "string") {

            return `
              <div class="map-branch">
                ${escapeHTML(branch)}
              </div>
            `;

          }

          const items =
            Array.isArray(branch.itens)
              ? branch.itens
              : [];

          return `
            <article class="map-branch">

              <h3>
                ${escapeHTML(
                  branch.titulo ||
                  ""
                )}
              </h3>

              ${
                items.length
                  ? `
                    <ul>
                      ${items.map(
                        item => `
                          <li>
                            ${escapeHTML(item)}
                          </li>
                        `
                      ).join("")}
                    </ul>
                  `
                  : ""
              }

            </article>
          `;

        }).join("")}

      </div>

    </section>

  `;
}


/* =========================================================
   PLANO
   ========================================================= */

function renderStudyPlan(study) {

  const plan = study.plano_leitura;

  if (!plan) return "";

  const days =
    Array.isArray(plan.dias)
      ? plan.dias
      : [];

  return `

    <section class="study-section study-plan">

      <span class="reader-label">
        PLANO DE LEITURA
      </span>

      ${
        plan.titulo
          ? `
            <h2>
              ${escapeHTML(plan.titulo)}
            </h2>
          `
          : ""
      }

      <div class="plan-days">

        ${days.map(day => `

          <article class="plan-day">

            <span>
              DIA ${safeNumber(day.dia)}
            </span>

            <strong>
              ${escapeHTML(
                day.referencia ||
                ""
              )}
            </strong>

            <p>
              ${escapeHTML(
                day.tema ||
                ""
              )}
            </p>

          </article>

        `).join("")}

      </div>

    </section>

  `;
}


/* =========================================================
   ORAÇÃO
   ========================================================= */

function renderStudyPrayer(study) {

  const prayer = study.oracao;

  if (!prayer) return "";

  const text =
    typeof prayer === "string"
      ? prayer
      : prayer.texto ||
        prayer.oracao ||
        "";

  if (!text) return "";

  return `

    <section class="study-section reader-prayer">

      <span class="reader-label">
        ORAÇÃO
      </span>

      <div class="reader-text">
        ${formatText(text)}
      </div>

    </section>

  `;
}


/* =========================================================
   DIÁRIO
   ========================================================= */

function renderStudyJournal(study) {

  const day =
    safeNumber(study.dia);

  const existing =
    getJournal(day);

  return `

    <section class="study-section study-journal">

      <span class="reader-label">
        MEU DIÁRIO
      </span>

      <h2>
        O que o Doce Espírito Santo está
        me ensinando hoje?
      </h2>

      <textarea
        class="journal-input"
        data-study-journal="${day}"
        placeholder="Escreva aqui aquilo que você percebeu, compreendeu ou deseja guardar..."
      >${escapeHTML(existing)}</textarea>

      <button
        class="btn btn-secondary"
        data-action="save-study-journal"
        data-day="${day}"
      >
        Guardar reflexão
      </button>

    </section>

  `;
}


/* =========================================================
   BÍBLIA
   ========================================================= */

function openBible(reference = "") {

  const overlay = document.createElement("div");

  overlay.className =
    "dynamic-reader bible-reader";

  overlay.innerHTML = `

    <div
      class="dynamic-reader__backdrop"
      data-action="close-dynamic-reader"
    ></div>

    <div class="dynamic-reader__panel">

      <button
        class="dynamic-reader__close"
        data-action="close-dynamic-reader"
      >
        ×
      </button>

      <span class="reader-label">
        BÍBLIA
      </span>

      <h1>
        ${escapeHTML(
          reference ||
          "Sua leitura bíblica"
        )}
      </h1>

      <div class="bible-placeholder">

        <div class="bible-placeholder__icon">
          ✦
        </div>

        <h2>
          Leia e aprofunde
        </h2>

        <p>
          Esta área será conectada à biblioteca bíblica
          completa do aplicativo, mantendo a referência
          bíblica vinculada ao devocional e ao estudo.
        </p>

        ${
          reference
            ? `
              <strong>
                ${escapeHTML(reference)}
              </strong>
            `
            : ""
        }

      </div>

    </div>

  `;

  document.body.appendChild(overlay);

  bindActionButtons(overlay);
}


/* =========================================================
   MAPA COMPLETO
   ========================================================= */

function openStudyMap(studyId) {

  const study =
    getStudyById(studyId) ||
    currentStudy;

  if (!study) return;

  const map = study.mapa_estudo;

  if (!map) {

    alert(
      "Este estudo ainda não possui um mapa cadastrado."
    );

    return;
  }

  const overlay = document.createElement("div");

  overlay.className =
    "dynamic-reader map-reader";

  const branches =
    Array.isArray(map.ramificacoes)
      ? map.ramificacoes
      : [];

  overlay.innerHTML = `

    <div
      class="dynamic-reader__backdrop"
      data-action="close-dynamic-reader"
    ></div>

    <div class="dynamic-reader__panel">

      <button
        class="dynamic-reader__close"
        data-action="close-dynamic-reader"
      >
        ×
      </button>

      <span class="reader-label">
        MAPA DE ESTUDO
      </span>

      <h1>
        ${escapeHTML(map.titulo || "")}
      </h1>

      <div class="map-visual">

        <div class="map-root">
          ${escapeHTML(
            map.raiz ||
            study.titulo ||
            "Tema central"
          )}
        </div>

        <div class="map-visual__branches">

          ${branches.map(branch => {

            const title =
              typeof branch === "string"
                ? branch
                : branch.titulo || "";

            const items =
              typeof branch === "string"
                ? []
                : branch.itens || [];

            return `
              <article>

                <h3>
                  ${escapeHTML(title)}
                </h3>

                ${
                  items.length
                    ? `
                      <div>
                        ${items.map(
                          item => `
                            <span>
                              ${escapeHTML(item)}
                            </span>
                          `
                        ).join("")}
                      </div>
                    `
                    : ""
                }

              </article>
            `;

          }).join("")}

        </div>

      </div>

    </div>

  `;

  document.body.appendChild(overlay);

  bindActionButtons(overlay);
}


/* =========================================================
   ÁUDIO
   ========================================================= */

function openAudio(studyId = null) {

  const study =
    getStudyById(studyId) ||
    currentStudy;

  const audioData =
    study?.audio ||
    null;

  const overlay = document.createElement("div");

  overlay.className =
    "dynamic-reader audio-reader";

  overlay.innerHTML = `

    <div
      class="dynamic-reader__backdrop"
      data-action="close-dynamic-reader"
    ></div>

    <div class="dynamic-reader__panel">

      <button
        class="dynamic-reader__close"
        data-action="close-dynamic-reader"
      >
        ×
      </button>

      <span class="reader-label">
        OUÇA SUA JORNADA
      </span>

      <h1>
        Uma voz para acompanhar sua caminhada
      </h1>

      <p>
        O áudio será integrado progressivamente
        para permitir que você ouça orações,
        devocionais e estudos completos.
      </p>

      ${
        audioData?.oracao?.disponivel
          ? `
            <button class="btn btn-primary">
              ▶ Ouvir oração
            </button>
          `
          : `
            <div class="audio-coming">
              <span>ÁUDIO</span>
              <strong>
                Preparando sua experiência de áudio
              </strong>
              <p>
                A estrutura já está pronta para receber
                os arquivos de áudio.
              </p>
            </div>
          `
      }

    </div>

  `;

  document.body.appendChild(overlay);

  bindActionButtons(overlay);
}


/* =========================================================
   PLANO A PARTIR DO ESTUDO
   ========================================================= */

function openPlanFromStudy(studyId) {

  const study = getStudyById(studyId);

  if (!study?.plano_leitura) return;

  const plan = study.plano_leitura;

  const overlay = document.createElement("div");

  overlay.className =
    "dynamic-reader plan-reader";

  overlay.innerHTML = `

    <div
      class="dynamic-reader__backdrop"
      data-action="close-dynamic-reader"
    ></div>

    <div class="dynamic-reader__panel">

      <button
        class="dynamic-reader__close"
        data-action="close-dynamic-reader"
      >
        ×
      </button>

      <span class="reader-label">
        PLANO DE LEITURA
      </span>

      <h1>
        ${escapeHTML(plan.titulo || "")}
      </h1>

      <div class="plan-days">

        ${(plan.dias || []).map(day => `

          <article class="plan-day">

            <span>
              DIA ${safeNumber(day.dia)}
            </span>

            <strong>
              ${escapeHTML(
                day.referencia || ""
              )}
            </strong>

            <p>
              ${escapeHTML(
                day.tema || ""
              )}
            </p>

          </article>

        `).join("")}

      </div>

    </div>

  `;

  document.body.appendChild(overlay);

  bindActionButtons(overlay);
}


/* =========================================================
   COMPLETAR DIA
   ========================================================= */

function completeDay(day) {

  const dayNumber =
    safeNumber(day);

  setDone(dayNumber, true);

  currentDay = dayNumber;

  localStorage.setItem(
    STORAGE.lastDay,
    String(dayNumber + 1)
  );

  updateGlobalProgress();

  renderAll();

  showCompletionFeedback(dayNumber);
}


function showCompletionFeedback(day) {

  const feedback =
    document.createElement("div");

  feedback.className =
    "completion-feedback";

  feedback.innerHTML = `

    <div class="completion-feedback__inner">

      <span>
        ✓
      </span>

      <strong>
        Jornada registrada
      </strong>

      <p>
        Você concluiu o Dia ${day}.
      </p>

    </div>

  `;

  document.body.appendChild(feedback);

  setTimeout(() => {
    feedback.classList.add("is-visible");
  }, 20);

  setTimeout(() => {

    feedback.classList.remove(
      "is-visible"
    );

    setTimeout(() => {
      feedback.remove();
    }, 400);

  }, 2200);
}


/* =========================================================
   FAVORITO
   ========================================================= */

function toggleFavorite(day) {

  const dayNumber =
    safeNumber(day);

  const current =
    isFavorite(dayNumber);

  setFavorite(
    dayNumber,
    !current
  );

  renderAll();

  if (currentDevotional) {

    renderDevotionalModal(
      getDevotional(dayNumber)
    );

  }
}


/* =========================================================
   CONCLUIR ESTUDO
   ========================================================= */

function completeStudy(studyId) {

  if (!studyId) return;

  setStudyProgress(
    studyId,
    100
  );

  if (currentStudy?.id === studyId) {

    const button =
      qs(
        `[data-action="complete-study"][data-study-id="${CSS.escape(studyId)}"]`
      );

    if (button) {
      button.textContent =
        "✓ Estudo concluído";
    }
  }
}


/* =========================================================
   DIÁRIO
   ========================================================= */

function saveCurrentJournal(day) {

  const textarea =
    qs(`[data-study-journal="${day}"]`);

  if (!textarea) return;

  saveJournalText(
    day,
    textarea.value
  );

  textarea.classList.add(
    "is-saved"
  );

  setTimeout(() => {
    textarea.classList.remove(
      "is-saved"
    );
  }, 1200);
}


/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

function showScreen(name) {

  currentScreen = name;

  const screens =
    qsa(
      "[data-screen], .screen, .app-screen"
    );

  screens.forEach(screen => {

    const screenName =
      screen.dataset.screen ||
      screen.id ||
      "";

    const normalized =
      screenName
        .replace("screen-", "")
        .replace("-screen", "");

    const active =
      normalized === name ||
      screenName === name;

    screen.classList.toggle(
      "is-active",
      active
    );

  });


  qsa(
    "[data-nav], [data-screen-link]"
  ).forEach(item => {

    const target =
      item.dataset.nav ||
      item.dataset.screenLink;

    item.classList.toggle(
      "is-active",
      target === name
    );

  });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   BUSCA
   ========================================================= */

function openSearch() {

  const overlay =
    qs("#searchOverlay") ||
    qs("[data-search-overlay]");

  if (!overlay) return;

  overlay.classList.add(
    "is-open"
  );

  overlay.setAttribute(
    "aria-hidden",
    "false"
  );

  const input =
    qs(
      "input[type='search'], input[data-search-input]",
      overlay
    );

  if (input) {
    setTimeout(() => input.focus(), 100);
  }
}


function closeSearch() {

  const overlay =
    qs("#searchOverlay") ||
    qs("[data-search-overlay]");

  if (!overlay) return;

  overlay.classList.remove(
    "is-open"
  );

  overlay.setAttribute(
    "aria-hidden",
    "true"
  );
}


function performSearch(query) {

  const term =
    String(query || "")
      .trim()
      .toLowerCase();

  if (!term) {

    searchResults = [];

    renderSearchResults();

    return;
  }

  const devotionalResults =
    devotionals
      .filter(item => {

        const text = [
          item.titulo,
          item.introducao,
          item.reflexao,
          item.pergunta,
          item.pratica,
          item.referencia
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(term);

      })
      .map(item => ({
        type: "devotional",
        item
      }));


  const studyResults =
    studies
      .filter(item => {

        const text = [
          item.titulo,
          item.subtitulo,
          item.objetivo,
          item.pergunta_central,
          item.categoria,
          item.texto_principal?.referencia
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return text.includes(term);

      })
      .map(item => ({
        type: "study",
        item
      }));


  searchResults = [
    ...devotionalResults,
    ...studyResults
  ].slice(0, 30);

  renderSearchResults();
}


function renderSearchResults() {

  const container =
    qs("[data-search-results]") ||
    qs("#searchResults");

  if (!container) return;

  if (!searchResults.length) {

    container.innerHTML = `
      <div class="empty-state">
        <p>
          Nenhum conteúdo encontrado.
        </p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    searchResults.map(result => {

      const item =
        result.item;

      if (result.type === "study") {

        return cardHTML(
          item,
          { type: "study" }
        );

      }

      return cardHTML(item);

    }).join("");

  bindCards(container);
}


/* =========================================================
   CENTRAL DE COMANDOS
   ========================================================= */

function openCommandCenter() {

  const overlay =
    qs("#commandOverlay") ||
    qs("[data-command-overlay]");

  if (!overlay) return;

  overlay.classList.add(
    "is-open"
  );

  overlay.setAttribute(
    "aria-hidden",
    "false"
  );

  const input =
    qs(
      "input",
      overlay
    );

  if (input) {

    setTimeout(
      () => input.focus(),
      100
    );

  }
}


function closeCommandCenter() {

  const overlay =
    qs("#commandOverlay") ||
    qs("[data-command-overlay]");

  if (!overlay) return;

  overlay.classList.remove(
    "is-open"
  );

  overlay.setAttribute(
    "aria-hidden",
    "true"
  );
}


function executeCommand(command) {

  const value =
    String(command || "")
      .trim()
      .toLowerCase();

  if (!value) return;


  if (
    value.startsWith("/estudo")
  ) {

    const query =
      value.replace(
        "/estudo",
        ""
      ).trim();

    if (query) {

      const found =
        studies.find(
          study =>
            `${study.titulo} ${study.subtitulo || ""}`
              .toLowerCase()
              .includes(query)
        );

      if (found) {
        openStudy(found.id);
        closeCommandCenter();
        return;
      }

    }

    showScreen("studies");
    closeCommandCenter();
    return;
  }


  if (
    value.startsWith("/mapa")
  ) {

    const query =
      value.replace(
        "/mapa",
        ""
      ).trim();

    const found =
      studies.find(
        study =>
          `${study.titulo} ${study.mapa_estudo?.titulo || ""}`
            .toLowerCase()
            .includes(query)
      );

    if (found) {
      openStudyMap(found.id);
    }

    closeCommandCenter();
    return;
  }


  if (
    value.startsWith("/bíblia") ||
    value.startsWith("/biblia")
  ) {

    const reference =
      value
        .replace("/bíblia", "")
        .replace("/biblia", "")
        .trim();

    openBible(reference);

    closeCommandCenter();

    return;
  }


  if (
    value.startsWith("/plano")
  ) {

    showScreen("plans");

    closeCommandCenter();

    return;
  }


  if (
    value.startsWith("/oração") ||
    value.startsWith("/oracao")
  ) {

    openPrayerCenter();

    closeCommandCenter();

    return;
  }


  if (
    value.startsWith("/referências") ||
    value.startsWith("/referencias")
  ) {

    openReferencesCenter();

    closeCommandCenter();

    return;
  }


  /* Busca normal */

  performSearch(value);

  closeCommandCenter();

  openSearch();
}


/* =========================================================
   CENTRAL DE ORAÇÃO
   ========================================================= */

function openPrayerCenter() {

  const overlay =
    document.createElement("div");

  overlay.className =
    "dynamic-reader prayer-reader";

  overlay.innerHTML = `

    <div
      class="dynamic-reader__backdrop"
      data-action="close-dynamic-reader"
    ></div>

    <div class="dynamic-reader__panel">

      <button
        class="dynamic-reader__close"
        data-action="close-dynamic-reader"
      >
        ×
      </button>

      <span class="reader-label">
        ORAÇÃO
      </span>

      <h1>
        Permaneça na presença
      </h1>

      <p>
        Não tenha pressa. Este espaço foi pensado
        para desacelerar, perceber e responder.
      </p>

      <div class="prayer-space">

        <p>
          Doce Espírito Santo,
          ensina-me a perceber Tua presença,
          a ouvir com atenção,
          a permanecer na Palavra
          e a viver aquilo que compreendi.
        </p>

      </div>

    </div>

  `;

  document.body.appendChild(overlay);

  bindActionButtons(overlay);
}


/* =========================================================
   REFERÊNCIAS
   ========================================================= */

function openReferencesCenter() {

  const references = [];

  studies.forEach(study => {

    if (study.bibliografia) {

      references.push(
        study.bibliografia
      );

    }

  });

  const overlay =
    document.createElement("div");

  overlay.className =
    "dynamic-reader references-reader";

  overlay.innerHTML = `

    <div
      class="dynamic-reader__backdrop"
      data-action="close-dynamic-reader"
    ></div>

    <div class="dynamic-reader__panel">

      <button
        class="dynamic-reader__close"
        data-action="close-dynamic-reader"
      >
        ×
      </button>

      <span class="reader-label">
        REFERÊNCIAS
      </span>

      <h1>
        Biblioteca de aprofundamento
      </h1>

      ${
        references.length
          ? references.map(ref => `

              <section class="bibliography-list">

                ${
                  (ref.categorias || []).map(
                    category => `
                      <article>

                        <h3>
                          ${escapeHTML(
                            category.categoria || ""
                          )}
                        </h3>

                        <ul>
                          ${(category.referencias || [])
                            .map(
                              item =>
                                `<li>${escapeHTML(item)}</li>`
                            )
                            .join("")}
                        </ul>

                      </article>
                    `
                  ).join("")
                }

              </section>

            `).join("")
          : `
              <p>
                A biblioteca de referências será expandida
                conforme a jornada crescer.
              </p>
            `
      }

    </div>

  `;

  document.body.appendChild(overlay);

  bindActionButtons(overlay);
}


/* =========================================================
   AÇÕES
   ========================================================= */

function handleAction(action, element) {

  switch (action) {

    case "open-day":
      openDay(
        element.dataset.day
      );
      break;


    case "open-study":
      openStudy(
        element.dataset.studyId ||
        element.dataset.id
      );
      break;


    case "toggle-favorite":
      toggleFavorite(
        element.dataset.day
      );
      break;


    case "complete-day":
      completeDay(
        element.dataset.day
      );
      break;


    case "complete-study":
      completeStudy(
        element.dataset.studyId
      );
      break;


    case "close-modal":
      closeModal();
      break;


    case "close-dynamic-reader":
      closeDynamicReader(element);
      break;


    case "open-bible":
      openBible(
        element.dataset.reference || ""
      );
      break;


    case "open-study-map":
      openStudyMap(
        element.dataset.studyId
      );
      break;


    case "open-plan-from-study":
      openPlanFromStudy(
        element.dataset.studyId
      );
      break;


    case "open-audio":
      openAudio(
        element.dataset.studyId
      );
      break;


    case "save-study-journal":
      saveCurrentJournal(
        element.dataset.day
      );
      break;


    case "open-search":
      openSearch();
      break;


    case "close-search":
      closeSearch();
      break;


    case "open-command":
      openCommandCenter();
      break;


    case "close-command":
      closeCommandCenter();
      break;


    case "open-plan":
      break;


    case "show-screen":
      showScreen(
        element.dataset.screen
      );
      break;

  }

}


/* =========================================================
   MODAL ANTIGO
   ========================================================= */

function closeModal() {

  const modal =
    qs("#devotionalModal") ||
    qs("[data-devotional-modal]");

  if (!modal) return;

  modal.classList.remove(
    "is-open"
  );

  modal.setAttribute(
    "aria-hidden",
    "true"
  );
}


function closeDynamicReader(element) {

  const reader =
    element.closest(
      ".dynamic-reader"
    );

  if (reader) {
    reader.remove();
  }
}


/* =========================================================
   EVENTOS DOS CARDS
   ========================================================= */

function bindCards(root = document) {

  qsa(
    ".content-card",
    root
  ).forEach(card => {

    if (card.dataset.bound === "true") {
      return;
    }

    card.dataset.bound = "true";

    const type =
      card.dataset.cardType;

    card.addEventListener(
      "click",
      () => {

        if (type === "study") {

          openStudy(
            card.dataset.id
          );

        } else {

          openDay(
            card.dataset.day
          );

        }

      }
    );


    card.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter" ||
          event.key === " "
        ) {

          event.preventDefault();

          if (type === "study") {

            openStudy(
              card.dataset.id
            );

          } else {

            openDay(
              card.dataset.day
            );

          }

        }

      }
    );

  });

}


/* =========================================================
   BOTÕES DE AÇÃO
   ========================================================= */

function bindActionButtons(root = document) {

  qsa(
    "[data-action]",
    root
  ).forEach(button => {

    if (
      button.classList.contains(
        "content-card"
      )
    ) {
      return;
    }

    if (
      button.dataset.actionBound === "true"
    ) {
      return;
    }

    button.dataset.actionBound =
      "true";

    button.addEventListener(
      "click",
      event => {

        event.preventDefault();
        event.stopPropagation();

        handleAction(
          button.dataset.action,
          button
        );

      }
    );

  });

}


/* =========================================================
   EVENTOS GLOBAIS
   ========================================================= */

function bindEvents() {

  /* Cards */

  bindCards();

  bindActionButtons();


  /* -----------------------------------------
     BUSCA
     ----------------------------------------- */

  qsa(
    "[data-search-input], #searchInput"
  ).forEach(input => {

    input.addEventListener(
      "input",
      event => {

        clearTimeout(
          searchTimeout
        );

        searchTimeout =
          setTimeout(() => {

            performSearch(
              event.target.value
            );

          }, 120);

      }
    );

  });


  /* -----------------------------------------
     COMANDOS
     ----------------------------------------- */

  qsa(
    "[data-command-input]"
  ).forEach(input => {

    input.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter"
        ) {

          executeCommand(
            event.target.value
          );

        }

      }
    );

  });


  /* -----------------------------------------
     NAVEGAÇÃO
     ----------------------------------------- */

  qsa(
    "[data-nav], [data-screen-link]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      event => {

        const target =
          button.dataset.nav ||
          button.dataset.screenLink;

        if (!target) return;

        event.preventDefault();

        showScreen(target);

      }
    );

  });


  /* -----------------------------------------
     ESC
     ----------------------------------------- */

  document.addEventListener(
    "keydown",
    event => {

      if (event.key !== "Escape") {
        return;
      }

      closeSearch();
      closeCommandCenter();

      const dynamic =
        qs(".dynamic-reader");

      if (dynamic) {
        dynamic.remove();
      }

      closeModal();

    }
  );


  /* -----------------------------------------
     HEADER SCROLL
     ----------------------------------------- */

  window.addEventListener(
    "scroll",
    () => {

      const topbar =
        qs("#topbar") ||
        qs(".topbar");

      if (!topbar) return;

      topbar.classList.toggle(
        "is-scrolled",
        window.scrollY > 20
      );

      topbar.classList.toggle(
        "scrolled",
        window.scrollY > 20
      );

    },
    {
      passive: true
    }
  );

}


/* =========================================================
   MOTOR EDITORIAL
   ========================================================= */

function notifyEditorialEngine() {

  if (
    typeof window.motorEditorial !==
    "undefined"
  ) {

    try {

      if (
        typeof window.motorEditorial.init ===
        "function"
      ) {

        window.motorEditorial.init({
          devotionals,
          studies
        });

      }

    } catch (error) {

      console.warn(
        "Motor editorial não inicializado:",
        error
      );

    }

  }

}


/* =========================================================
   SERVICE WORKER
   ========================================================= */

function registerServiceWorker() {

  if (
    "serviceWorker" in navigator
  ) {

    window.addEventListener(
      "load",
      () => {

        navigator.serviceWorker
          .register("sw.js")
          .then(() => {

            console.log(
              "✓ Service Worker registrado"
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


/* =========================================================
   PWA / INSTALAÇÃO
   ========================================================= */

let deferredInstallPrompt = null;

window.addEventListener(
  "beforeinstallprompt",
  event => {

    event.preventDefault();

    deferredInstallPrompt =
      event;

    qsa(
      "[data-install-app]"
    ).forEach(button => {

      button.hidden = false;

    });

  }
);


async function installApp() {

  if (!deferredInstallPrompt) {
    return;
  }

  deferredInstallPrompt.prompt();

  await deferredInstallPrompt.userChoice;

  deferredInstallPrompt = null;

}


/* =========================================================
   EXPOSIÇÃO GLOBAL
   ========================================================= */

window.DoceEspirito = {

  devotionals,
  studies,

  getDevotional,
  getStudyByDay,
  getStudyById,

  openDay,
  openStudy,
  openBible,
  openStudyMap,
  openAudio,

  showScreen,

  openSearch,
  openCommandCenter,

  executeCommand,

  completeDay,
  toggleFavorite,

  getProgressPercent,
  countDone,

  installApp

};


/* =========================================================
   INICIAR
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    await initApp();

    notifyEditorialEngine();

    registerServiceWorker();

  }
);
