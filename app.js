/* =========================================================
   DOCE ESPÍRITO SANTO
   UM AMIGO ÍNTIMO

   Motor principal da aplicação
========================================================= */


/* =========================================================
   ESTADO
========================================================= */

const state = {

  currentScreen: "home",

  currentDay:
    Number(
      localStorage.getItem("des_current_day")
    ) || 1,

  completedDays:
    JSON.parse(
      localStorage.getItem("des_completed_days")
    ) || [],

  devotionals: [],

  studies: []

};


/* =========================================================
   ELEMENTOS
========================================================= */

const screens =
  document.querySelectorAll(".screen");

const navigationItems =
  document.querySelectorAll(
    "[data-screen]"
  );


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    setupNavigation();

    setupActions();

    await loadContent();

    updateInterface();

  }
);


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function setupNavigation() {

  navigationItems.forEach(
    element => {

      element.addEventListener(
        "click",
        () => {

          const screen =
            element.dataset.screen;

          if (!screen) return;

          showScreen(screen);

        }
      );

    }
  );

}


function showScreen(screenName) {

  state.currentScreen =
    screenName;

  screens.forEach(
    screen => {

      screen.classList.remove(
        "active"
      );

    }
  );


  const target =
    document.getElementById(
      `${screenName}-screen`
    );


  if (target) {

    target.classList.add(
      "active"
    );

  }


  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.screen === screenName
      );

    });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  if (screenName === "journey") {

    renderJourney();

  }


  if (screenName === "studies") {

    renderStudies();

  }


  if (screenName === "today") {

    renderToday();

  }


  if (screenName === "profile") {

    updateProfile();

  }

}


/* =========================================================
   AÇÕES
========================================================= */

function setupActions() {

  document
    .querySelectorAll(
      '[data-action="start"]'
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          showScreen("journey");

        }
      );

    });


  document
    .querySelectorAll(
      '[data-action="today"]'
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          showScreen("today");

        }
      );

    });


  const searchInput =
    document.getElementById(
      "search-input"
    );


  if (searchInput) {

    searchInput.addEventListener(
      "input",
      event => {

        searchContent(
          event.target.value
        );

      }
    );

  }

}


/* =========================================================
   CONTEÚDO
========================================================= */

async function loadContent() {

  try {

    const devotionalResponse =
      await fetch(
        "devocionais.json?v=8"
      );

    if (
      devotionalResponse.ok
    ) {

      state.devotionals =
        await devotionalResponse.json();

    }

  } catch (error) {

    console.warn(
      "Não foi possível carregar devocionais.json",
      error
    );

  }


  try {

    const studiesResponse =
      await fetch(
        "estudos.json"
      );

    if (
      studiesResponse.ok
    ) {

      state.studies =
        await studiesResponse.json();

    }

  } catch (error) {

    console.warn(
      "Não foi possível carregar estudos.json",
      error
    );

  }

}


/* =========================================================
   INTERFACE
========================================================= */

function updateInterface() {

  updateTodayCard();

  updateJourneyProgress();

  updateProfile();

}


/* =========================================================
   DEVOCIONAL
========================================================= */

function getCurrentDevotional() {

  if (
    !Array.isArray(
      state.devotionals
    )
  ) {

    return null;

  }


  if (
    state.devotionals.length === 0
  ) {

    return null;

  }


  const list =
    Array.isArray(
      state.devotionals
    )
      ? state.devotionals
      : state.devotionals.days;


  if (
    !Array.isArray(list)
  ) {

    return null;

  }


  return (
    list.find(
      item =>
        Number(
          item.day ||
          item.dia ||
          item.number
        ) === state.currentDay
    )
    ||
    list[state.currentDay - 1]
    ||
    null
  );

}


function getDevotionalByDay(day) {

  const list =
    Array.isArray(
      state.devotionals
    )
      ? state.devotionals
      : state.devotionals?.days;


  if (
    !Array.isArray(list)
  ) {

    return null;

  }


  return (
    list.find(
      item =>
        Number(
          item.day ||
          item.dia ||
          item.number
        ) === day
    )
    ||
    list[day - 1]
    ||
    null
  );

}


/* =========================================================
   CARD DE HOJE
========================================================= */

function updateTodayCard() {

  const devotional =
    getCurrentDevotional();


  const progress =
    document.getElementById(
      "today-progress"
    );

  const title =
    document.getElementById(
      "today-title"
    );

  const description =
    document.getElementById(
      "today-description"
    );

  const reference =
    document.getElementById(
      "today-reference"
    );


  if (progress) {

    progress.textContent =
      `Dia ${state.currentDay} de 365`;

  }


  if (!devotional) {

    return;

  }


  const devotionalTitle =
    devotional.title ||
    devotional.titulo ||
    "A Presença que já está aqui";


  const devotionalDescription =
    devotional.description ||
    devotional.descricao ||
    devotional.excerpt ||
    devotional.resumo ||
    devotional.subtitulo ||
    "";


  const devotionalReference =
    devotional.reference ||
    devotional.referencia ||
    devotional.verse ||
    devotional.versiculo ||
    devotional.referencia_principal?.texto ||
    "";


  if (title) {

    title.textContent =
      devotionalTitle;

  }


  if (description) {

    description.textContent =
      devotionalDescription;

  }


  if (reference) {

    reference.textContent =
      devotionalReference;

  }

}


/* =========================================================
   TELA DE HOJE
   DEVOCIONAL COMPLETO
========================================================= */

function renderToday() {

  const devotional =
    getCurrentDevotional();


  const day =
    document.getElementById(
      "reading-day"
    );

  const title =
    document.getElementById(
      "reading-title"
    );

  const body =
    document.getElementById(
      "reading-body"
    );


  if (day) {

    day.textContent =
      `DIA ${state.currentDay}`;

  }


  if (!devotional) {

    if (body) {

      body.innerHTML = `
        <p>
          O devocional deste dia ainda
          não está disponível.
        </p>
      `;

    }

    return;

  }


  if (title) {

    title.textContent =
      devotional.titulo ||
      devotional.title ||
      `Dia ${state.currentDay}`;

  }


  if (!body) return;


  const sections = [];


  /* =====================================================
     TEMA
  ===================================================== */

  if (
    devotional.tema ||
    devotional.subtitulo
  ) {

    sections.push(`

      <section class="devotional-section">

        <div class="eyebrow">
          TEMA DO DIA
        </div>

        ${
          devotional.tema
            ? `
              <h2>
                ${escapeHTML(
                  devotional.tema
                )}
              </h2>
            `
            : ""
        }

        ${
          devotional.subtitulo
            ? `
              <p class="devotional-subtitle">
                ${escapeHTML(
                  devotional.subtitulo
                )}
              </p>
            `
            : ""
        }

      </section>

    `);

  }


  /* =====================================================
     REFERÊNCIA PRINCIPAL
  ===================================================== */

  const reference =
    devotional.referencia_principal;


  if (reference) {

    const referenceText =
      typeof reference === "string"
        ? reference
        : reference.texto ||
          reference.referencia ||
          "";


    if (referenceText) {

      sections.push(`

        <section class="devotional-section">

          <div class="eyebrow">
            REFERÊNCIA BÍBLICA PRINCIPAL
          </div>

          <p class="biblical-reference">
            ${escapeHTML(
              referenceText
            )}
          </p>

        </section>

      `);

    }

  }


  /* =====================================================
     LEITURA BÍBLICA
  ===================================================== */

  if (
    devotional.leitura_biblica
  ) {

    const reading =
      devotional.leitura_biblica;


    sections.push(`

      <section class="devotional-section">

        <div class="eyebrow">
          LEITURA BÍBLICA
        </div>

        ${
          reading.referencia
            ? `
              <h3>
                ${escapeHTML(
                  reading.referencia
                )}
              </h3>
            `
            : ""
        }

        ${
          reading.orientacao
            ? `
              <p>
                ${escapeHTML(
                  reading.orientacao
                )}
              </p>
            `
            : ""
        }

      </section>

    `);

  }


  /* =====================================================
     CONTEXTO BÍBLICO
  ===================================================== */

  if (
    devotional.contexto_biblico
  ) {

    const context =
      devotional.contexto_biblico;


    sections.push(`

      <section class="devotional-section">

        <div class="eyebrow">
          CONTEXTO BÍBLICO
        </div>

        ${
          context.titulo
            ? `
              <h2>
                ${escapeHTML(
                  context.titulo
                )}
              </h2>
            `
            : ""
        }

        ${
          context.conteudo
            ? `
              <p>
                ${escapeHTML(
                  context.conteudo
                )}
              </p>
            `
            : ""
        }

        ${
          Array.isArray(
            context.pontos
          )
            ? `
              <div class="devotional-list">

                ${context.pontos
                  .map(
                    item => `
                      <p>
                        ${escapeHTML(
                          item
                        )}
                      </p>
                    `
                  )
                  .join("")}

              </div>
            `
            : ""
        }

      </section>

    `);

  }


  /* =====================================================
     EXPOSIÇÃO BÍBLICA
  ===================================================== */

  if (
    devotional.exposicao
  ) {

    const exposition =
      devotional.exposicao;


    let content = "";


    if (
      exposition.conteudo
    ) {

      content += `
        <p>
          ${escapeHTML(
            exposition.conteudo
          )}
        </p>
      `;

    }


    if (
      Array.isArray(
        exposition.desenvolvimento
      )
    ) {

      content +=
        exposition.desenvolvimento
          .map(
            item => `

              <div class="devotional-subsection">

                <h3>
                  ${escapeHTML(
                    item.titulo || ""
                  )}
                </h3>

                <p>
                  ${escapeHTML(
                    item.conteudo || ""
                  )}
                </p>

              </div>

            `
          )
          .join("");

    }


    sections.push(`

      <section class="devotional-section">

        <div class="eyebrow">
          EXPOSIÇÃO BÍBLICA
        </div>

        ${
          exposition.titulo
            ? `
              <h2>
                ${escapeHTML(
                  exposition.titulo
                )}
              </h2>
            `
            : ""
        }

        ${content}

      </section>

    `);

  }


  /* =====================================================
     EXEGESE
  ===================================================== */

  if (
    devotional.exegese
  ) {

    const exegesis =
      devotional.exegese;


    sections.push(`

      <section class="devotional-section">

        <div class="eyebrow">
          EXEGESE
        </div>

        ${
          exegesis.titulo
            ? `
              <h2>
                ${escapeHTML(
                  exegesis.titulo
                )}
              </h2>
            `
            : ""
        }

        ${
          exegesis.conteudo
            ? `
              <p>
                ${escapeHTML(
                  exegesis.conteudo
                )}
              </p>
            `
            : ""
        }

        ${
          Array.isArray(
            exegesis.observacoes
          )
            ? `
              <div class="devotional-list">

                ${exegesis.observacoes
                  .map(
                    item => `
                      <p>
                        ${escapeHTML(
                          item
                        )}
                      </p>
                    `
                  )
                  .join("")}

              </div>
            `
            : ""
        }

      </section>

    `);

  }


  /* =====================================================
     COMENTÁRIO TEOLÓGICO
  ===================================================== */

  if (
    devotional.comentario_teologico
  ) {

    const commentary =
      devotional.comentario_teologico;


    sections.push(`

      <section class="devotional-section">

        <div class="eyebrow">
          COMENTÁRIO TEOLÓGICO
        </div>

        ${
          commentary.titulo
            ? `
              <h2>
                ${escapeHTML(
                  commentary.titulo
                )}
              </h2>
            `
            : ""
        }

        ${
          commentary.conteudo
            ? `
              <p>
                ${escapeHTML(
                  commentary.conteudo
                )}
              </p>
            `
            : ""
        }

        ${
          commentary.contemplacao
            ? `
              <div class="devotional-highlight">

                <p>
                  ${escapeHTML(
                    commentary.contemplacao
                  )}
                </p>

              </div>
            `
            : ""
        }

      </section>

    `);

  }


  /* =====================================================
     REFLEXÃO
  ===================================================== */

  if (
    devotional.reflexao
  ) {

    const reflection =
      devotional.reflexao;


    sections.push(`

      <section class="devotional-section">

        <div class="eyebrow">
          REFLEXÃO
        </div>

        ${
          reflection.titulo
            ? `
              <h2>
                ${escapeHTML(
                  reflection.titulo
                )}
              </h2>
            `
            : ""
        }

        ${
          reflection.conteudo
            ? `
              <p>
                ${escapeHTML(
                  reflection.conteudo
                )}
              </p>
            `
            : ""
        }

        ${
          reflection.aplicacao
            ? `
              <div class="devotional-highlight">

                <p>
                  ${escapeHTML(
                    reflection.aplicacao
                  )}
                </p>

              </div>
            `
            : ""
        }

      </section>

    `);

  }


  /* =====================================================
     CONTEMPLAÇÃO TEOLÓGICA
  ===================================================== */

  if (
    devotional.contemplacao_teologica
  ) {

    const contemplation =
      devotional.contemplacao_teologica;


    sections.push(`

      <section class="devotional-section">

        <div class="eyebrow">
          CONTEMPLAÇÃO TEOLÓGICA
        </div>

        ${
          contemplation.titulo
            ? `
              <h2>
                ${escapeHTML(
                  contemplation.titulo
                )}
              </h2>
            `
            : ""
        }

        ${
          contemplation.texto
            ? `
              <p>
                ${escapeHTML(
                  contemplation.texto
                )}
              </p>
            `
            : ""
        }

        ${
          Array.isArray(
            contemplation.perguntas
          )
            ? `
              <div class="devotional-questions">

                ${contemplation.perguntas
                  .map(
                    question => `
                      <p>
                        ${escapeHTML(
                          question
                        )}
                      </p>
                    `
                  )
                  .join("")}

              </div>
            `
            : ""
        }

      </section>

    `);

  }


  /* =====================================================
     APLICAÇÃO PRÁTICA
  ===================================================== */

  if (
    devotional.aplicacao_pratica
  ) {

    const practice =
      devotional.aplicacao_pratica;


    sections.push(`

      <section class="devotional-section">

        <div class="eyebrow">
          PRÁTICA DO DIA
        </div>

        ${
          practice.titulo
            ? `
              <h2>
                ${escapeHTML(
                  practice.titulo
                )}
              </h2>
            `
            : ""
        }

        ${
          Array.isArray(
            practice.passos
          )
            ? `
              <div class="devotional-steps">

                ${practice.passos
                  .map(
                    (step, index) => `
                      <p>
                        <strong>
                          ${index + 1}.
                        </strong>
                        ${escapeHTML(
                          step
                        )}
                      </p>
                    `
                  )
                  .join("")}

              </div>
            `
            : ""
        }

      </section>

    `);

  }


  /* =====================================================
     PERGUNTAS DE INTERIORIZAÇÃO
  ===================================================== */

  if (
    Array.isArray(
      devotional.perguntas_interiorizacao
    )
  ) {

    sections.push(`

      <section class="devotional-section">

        <div class="eyebrow">
          PARA INTERIORIZAR
        </div>

        <div class="devotional-questions">

          ${devotional.perguntas_interiorizacao
            .map(
              question => `
                <p>
                  ${escapeHTML(
                    question
                  )}
                </p>
              `
            )
            .join("")}

        </div>

      </section>

    `);

  }


  /* =====================================================
     DIÁRIO
  ===================================================== */

  if (
    devotional.diario
  ) {

    const journal =
      devotional.diario;


    sections.push(`

      <section class="devotional-section">

        <div class="eyebrow">
          DIÁRIO PESSOAL
        </div>

        ${
          journal.titulo
            ? `
              <h2>
                ${escapeHTML(
                  journal.titulo
                )}
              </h2>
            `
            : ""
        }

        ${
          journal.orientacao
            ? `
              <p>
                ${escapeHTML(
                  journal.orientacao
                )}
              </p>
            `
            : ""
        }

        ${
          Array.isArray(
            journal.perguntas
          )
            ? `
              <div class="devotional-questions">

                ${journal.perguntas
                  .map(
                    question => `
                      <p>
                        ${escapeHTML(
                          question
                        )}
                      </p>
                    `
                  )
                  .join("")}

              </div>
            `
            : ""
        }

      </section>

    `);

  }


  /* =====================================================
     REFERÊNCIAS RELACIONADAS
  ===================================================== */

  if (
    Array.isArray(
      devotional.referencias_relacionadas
    )
  ) {

    sections.push(`

      <section class="devotional-section">

        <div class="eyebrow">
          REFERÊNCIAS RELACIONADAS
        </div>

        <div class="devotional-list">

          ${devotional.referencias_relacionadas
            .map(
              reference => `
                <p>
                  ${escapeHTML(
                    reference
                  )}
                </p>
              `
            )
            .join("")}

        </div>

      </section>

    `);

  }


  /* =====================================================
     ORAÇÃO
  ===================================================== */

  if (
    devotional.oracao
  ) {

    const prayer =
      devotional.oracao;


    sections.push(`

      <section class="devotional-section prayer-section">

        <div class="eyebrow">
          ORAÇÃO
        </div>

        ${
          prayer.titulo
            ? `
              <h2>
                ${escapeHTML(
                  prayer.titulo
                )}
              </h2>
            `
            : ""
        }

        ${
          prayer.texto
            ? `
              <p>
                ${escapeHTML(
                  prayer.texto
                )}
              </p>
            `
            : ""
        }

      </section>

    `);

  }


  /* =====================================================
     ÁUDIO
  ===================================================== */

  if (
    devotional.audio
  ) {

    const audio =
      devotional.audio;


    sections.push(`

      <section class="devotional-section audio-section">

        <div class="eyebrow">
          ÁUDIO DO DIA
        </div>

        ${
          audio.disponivel &&
          audio.arquivo
            ? `
              <audio
                controls
                preload="metadata"
                style="width:100%"
              >

                <source
                  src="${escapeHTML(
                    audio.arquivo
                  )}"
                  type="audio/mpeg"
                >

                Seu navegador não suporta
                reprodução de áudio.

              </audio>
            `
            : `
              <p>
                O áudio completo deste
                devocional será disponibilizado
                nesta etapa da jornada.
              </p>
            `
        }

      </section>

    `);

  }


  body.innerHTML =
    sections.join("");

}


/* =========================================================
   JORNADA
========================================================= */

function renderJourney() {

  const container =
    document.getElementById(
      "journey-grid"
    );


  if (!container) return;


  container.innerHTML = "";


  for (
    let day = 1;
    day <= 365;
    day++
  ) {

    const devotional =
      getDevotionalByDay(day);


    const title =
      devotional
        ? (
            devotional.title ||
            devotional.titulo ||
            `Dia ${day}`
          )
        : `Dia ${day}`;


    const card =
      document.createElement(
        "article"
      );


    card.className =
      "day-card";


    card.innerHTML = `

      <div
        class="day-card-image"
        style="
          background-image:
          url('assets/jornada/day-${String(day).padStart(3, "0")}.jpg')
        "
      ></div>

      <div class="day-card-overlay"></div>

      <div class="day-card-content">

        <div class="day-number">
          DIA ${day}
        </div>

        <div class="day-title">
          ${escapeHTML(title)}
        </div>

      </div>

    `;


    card.addEventListener(
      "click",
      () => {

        openDay(day);

      }
    );


    container.appendChild(
      card
    );

  }

}


/* =========================================================
   ABRIR DIA
========================================================= */

function openDay(day) {

  state.currentDay =
    Number(day);


  localStorage.setItem(
    "des_current_day",
    state.currentDay
  );


  updateInterface();

  showScreen("today");

}


/* =========================================================
   PROGRESSO
========================================================= */

function updateJourneyProgress() {

  const day =
    document.getElementById(
      "journey-day"
    );

  const bar =
    document.getElementById(
      "journey-progress-bar"
    );


  if (day) {

    day.textContent =
      `${Math.max(
        0,
        state.currentDay - 1
      )} de 365 dias`;

  }


  if (bar) {

    const percentage =
      (
        Math.max(
          0,
          state.currentDay - 1
        ) / 365
      ) * 100;


    bar.style.width =
      `${percentage}%`;

  }

}


/* =========================================================
   ESTUDOS
========================================================= */

function renderStudies() {

  const container =
    document.getElementById(
      "studies-grid"
    );


  if (!container) return;


  container.innerHTML = "";


  const list =
    Array.isArray(
      state.studies
    )
      ? state.studies
      : state.studies?.studies;


  if (
    !Array.isArray(list) ||
    list.length === 0
  ) {

    container.innerHTML = `

      <div class="profile-card">

        <div class="eyebrow">
          ESTUDOS
        </div>

        <h2>
          Seus estudos teológicos
          aparecerão aqui.
        </h2>

      </div>

    `;

    return;

  }


  list.forEach(
    (study, index) => {

      const title =
        study.title ||
        study.titulo ||
        study.name ||
        `Estudo ${index + 1}`;


      const description =
        study.description ||
        study.descricao ||
        "";


      const image =
        study.image ||
        study.imagem ||
        `assets/estudos/study-${String(
          index + 1
        ).padStart(3, "0")}.jpg`;


      const card =
        document.createElement(
          "article"
        );


      card.className =
        "study-card";


      card.style.backgroundImage =
        `url("${image}")`;


      card.innerHTML = `

        <div class="study-card-content">

          <div class="eyebrow">
            ESTUDO TEOLÓGICO
          </div>

          <h2>
            ${escapeHTML(title)}
          </h2>

          ${
            description
              ? `
                <p>
                  ${escapeHTML(
                    description
                  )}
                </p>
              `
              : ""
          }

        </div>

      `;


      container.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   PERFIL
========================================================= */

function updateProfile() {

  const element =
    document.getElementById(
      "profile-day"
    );


  if (element) {

    element.textContent =
      Math.max(
        0,
        state.currentDay - 1
      );

  }

}


/* =========================================================
   PESQUISA
========================================================= */

function searchContent(query) {

  const container =
    document.getElementById(
      "search-results"
    );


  if (!container) return;


  const normalized =
    query
      .trim()
      .toLowerCase();


  if (!normalized) {

    container.innerHTML = "";

    return;

  }


  const results = [];


  const devotionalList =
    Array.isArray(
      state.devotionals
    )
      ? state.devotionals
      : state.devotionals?.days;


  if (
    Array.isArray(
      devotionalList
    )
  ) {

    devotionalList.forEach(
      (item, index) => {

        const title =
          item.title ||
          item.titulo ||
          "";


        const content =
          item.content ||
          item.conteudo ||
          item.body ||
          item.reflexao?.conteudo ||
          item.exposicao?.conteudo ||
          item.comentario_teologico?.conteudo ||
          item.contexto_biblico?.conteudo ||
          "";


        const text =
          `${title} ${content}`
            .toLowerCase();


        if (
          text.includes(
            normalized
          )
        ) {

          results.push({
            type: "Devocional",
            day:
              Number(
                item.day ||
                item.dia ||
                index + 1
              ),
            title
          });

        }

      }
    );

  }


  if (
    results.length === 0
  ) {

    container.innerHTML = `

      <div class="profile-card">

        <h2>
          Nenhum resultado encontrado.
        </h2>

      </div>

    `;

    return;

  }


  container.innerHTML =
    results
      .map(
        result => `

          <article
            class="profile-card"
            style="min-height:150px"
          >

            <div class="eyebrow">
              ${escapeHTML(
                result.type
              )}
            </div>

            <h2>
              ${escapeHTML(
                result.title ||
                `Dia ${result.day}`
              )}
            </h2>

            <button
              class="secondary-button"
              onclick="openDay(${result.day})"
            >
              Abrir
            </button>

          </article>

        `
      )
      .join("");

}


/* =========================================================
   SEGURANÇA
========================================================= */

function escapeHTML(value) {

  return String(value)
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
   PWA / SERVICE WORKER
========================================================= */

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register("sw.js")
        .catch(
          error =>
            console.warn(
              "Service Worker:",
              error
            )
        );

    }
  );

}


/* =========================================================
   TELA DE ABERTURA
   365 DIAS DE PRESENÇA
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const splashScreen =
      document.getElementById(
        "splashScreen"
      );

    const startButton =
      document.getElementById(
        "startApp"
      );


    if (
      !splashScreen ||
      !startButton
    ) {

      return;

    }


    document.body.classList.add(
      "splash-active"
    );


    startButton.addEventListener(
      "click",
      () => {

        splashScreen.classList.add(
          "hidden"
        );


        document.body.classList.remove(
          "splash-active"
        );


        setTimeout(
          () => {

            splashScreen.remove();

          },
          1000
        );

      }
    );

  }
);
