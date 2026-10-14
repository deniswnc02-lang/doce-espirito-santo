/* =========================================================
   DOCE ESPÍRITO SANTO — UM AMIGO ÍNTIMO
   APP ENGINE
   Inicialização segura + carregamento dos conteúdos
   ========================================================= */

"use strict";

let devotionals = [];
let studies = [];

let currentDay = 1;
let currentStudy = null;
let currentScreen = "home";

/* =========================================================
   UTILITÁRIOS
   ========================================================= */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function safeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getDay(day) {
  return devotionals.find(
    item => safeNumber(item.dia) === safeNumber(day)
  );
}

function getStudyByDay(day) {
  return studies.find(
    item => safeNumber(item.dia) === safeNumber(day)
  );
}

function getTodayDay() {
  const date = new Date();

  const start = new Date(date.getFullYear(), 0, 1);
  const diff = date - start;

  return Math.min(
    365,
    Math.max(
      1,
      Math.floor(diff / 86400000) + 1
    )
  );
}

/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function doneKey(day) {
  return `doce-espirito-dia-${day}-concluido`;
}

function favoriteKey(day) {
  return `doce-espirito-dia-${day}-favorito`;
}

function isDone(day) {
  return localStorage.getItem(doneKey(day)) === "true";
}

function isFavorite(day) {
  return localStorage.getItem(favoriteKey(day)) === "true";
}

function toggleDone(day) {
  localStorage.setItem(
    doneKey(day),
    String(!isDone(day))
  );
}

function toggleFavorite(day) {
  localStorage.setItem(
    favoriteKey(day),
    String(!isFavorite(day))
  );
}

function countCompleted() {
  let total = 0;

  for (let i = 1; i <= 365; i++) {
    if (isDone(i)) total++;
  }

  return total;
}

/* =========================================================
   SPLASH SCREEN
   REGRA CRÍTICA:
   NUNCA DEIXAR O SPLASH PRESO
   ========================================================= */

let splashReleased = false;

function releaseSplash() {

  if (splashReleased) return;

  splashReleased = true;

  const selectors = [
    "#splash",
    "#splashScreen",
    "#loadingScreen",
    "#loading",
    ".splash",
    ".splash-screen",
    ".loading-screen",
    ".app-loader",
    "[data-splash]"
  ];

  selectors.forEach(selector => {

    document.querySelectorAll(selector).forEach(element => {

      element.classList.add("is-hidden");
      element.classList.add("hidden");
      element.classList.remove("active");

      element.style.opacity = "0";
      element.style.visibility = "hidden";
      element.style.pointerEvents = "none";

      setTimeout(() => {
        if (element && element.parentNode) {
          element.style.display = "none";
        }
      }, 650);

    });

  });

  document.documentElement.classList.remove("is-loading");
  document.body.classList.remove("is-loading");
  document.body.classList.add("app-ready");

  /*
   * Segurança adicional:
   * caso exista uma camada fixa desconhecida,
   * procuramos elementos que claramente sejam loaders.
   */

  document.querySelectorAll(
    ".loader-overlay, .loading-overlay, .startup-overlay"
  ).forEach(element => {

    element.style.opacity = "0";
    element.style.pointerEvents = "none";
    element.style.visibility = "hidden";

    setTimeout(() => {
      element.style.display = "none";
    }, 500);

  });
}

/*
 * Se alguma coisa der errado no JavaScript,
 * ainda assim liberamos a interface.
 */
window.setTimeout(releaseSplash, 3500);


/* =========================================================
   CARREGAR DADOS
   ========================================================= */

async function loadJSON(url) {

  const response = await fetch(
    `${url}?v=${Date.now()}`,
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error(
      `Não foi possível carregar ${url}`
    );
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

    } else {

      throw new Error(
        "Formato do devocionais.json não reconhecido."
      );

    }

  } catch (error) {

    console.error(
      "Erro carregando devocionais:",
      error
    );

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

      throw new Error(
        "Formato do estudos.json não reconhecido."
      );

    }

  } catch (error) {

    console.error(
      "Erro carregando estudos:",
      error
    );

    studies = [];

  }
}


/* =========================================================
   PROGRESSO
   ========================================================= */

function updateProgress() {

  const completed = countCompleted();

  const percentage =
    Math.round((completed / 365) * 100);

  document.querySelectorAll(
    "[data-progress]"
  ).forEach(element => {
    element.textContent = `${percentage}%`;
  });

  document.querySelectorAll(
    "[data-completed]"
  ).forEach(element => {
    element.textContent = completed;
  });

  document.querySelectorAll(
    "[data-total-days]"
  ).forEach(element => {
    element.textContent = "365";
  });

  document.querySelectorAll(
    "[data-progress-bar]"
  ).forEach(element => {
    element.style.width = `${percentage}%`;
  });
}


/* =========================================================
   CARD DE DEVOCIONAL
   ========================================================= */

function devotionalCard(day) {

  if (!day) return "";

  const number = safeNumber(day.dia);
  const done = isDone(number);

  const title =
    day.titulo ||
    `Dia ${number}`;

  const reference =
    day.referencia ||
    day.referencia_biblica ||
    "";

  const intro =
    day.introducao ||
    day.resumo ||
    day.reflexao ||
    "Uma nova experiência de presença e intimidade.";

  return `
    <article
      class="content-card devotional-card"
      data-day="${number}"
      tabindex="0"
      role="button"
      aria-label="Abrir Dia ${number}: ${escapeHTML(title)}"
    >

      <div class="content-card__image">

        <div class="content-card__number">
          ${String(number).padStart(2, "0")}
        </div>

        ${
          done
            ? `<span class="content-card__status">✓</span>`
            : ""
        }

      </div>

      <div class="content-card__body">

        <span class="eyebrow">
          DIA ${number}
        </span>

        <h3>
          ${escapeHTML(title)}
        </h3>

        ${
          reference
            ? `<span class="reference">
                ${escapeHTML(reference)}
              </span>`
            : ""
        }

        <p>
          ${escapeHTML(intro)}
        </p>

      </div>

    </article>
  `;
}


/* =========================================================
   RENDERIZAR CARDS
   ========================================================= */

function renderDayRails() {

  const containers = $$(
    "[data-devotional-rail]"
  );

  if (!containers.length) return;

  const completed = countCompleted();

  const nextDay =
    devotionals.find(
      item => !isDone(safeNumber(item.dia))
    ) ||
    devotionals[0];

  containers.forEach(container => {

    let list = [];

    if (nextDay) {

      const start =
        safeNumber(nextDay.dia);

      list = devotionals
        .filter(item => {
          const d = safeNumber(item.dia);
          return d >= start && d <= start + 9;
        });

    }

    if (!list.length) {
      list = devotionals.slice(0, 10);
    }

    container.innerHTML =
      list.map(devotionalCard).join("");

  });

  document.querySelectorAll(
    "[data-progress-label]"
  ).forEach(element => {

    element.textContent =
      `${completed} / 365`;

  });
}


/* =========================================================
   HOJE
   ========================================================= */

function renderToday() {

  const today = getTodayDay();

  const devotional =
    getDay(today) ||
    devotionals[0];

  if (!devotional) return;

  document.querySelectorAll(
    "[data-today-title]"
  ).forEach(element => {
    element.textContent =
      devotional.titulo ||
      `Dia ${today}`;
  });

  document.querySelectorAll(
    "[data-today-day]"
  ).forEach(element => {
    element.textContent =
      `DIA ${safeNumber(devotional.dia)}`;
  });

}


/* =========================================================
   ABRIR DEVOCIONAL
   ========================================================= */

function openDevotional(day) {

  const devotional =
    getDay(day);

  if (!devotional) {

    console.warn(
      "Devocional não encontrado:",
      day
    );

    return;
  }

  currentDay =
    safeNumber(devotional.dia);

  const study =
    getStudyByDay(currentDay);

  const modal =
    document.querySelector(
      "#devotionalModal, [data-devotional-modal]"
    );

  if (!modal) {

    console.warn(
      "Modal de devocional não encontrado."
    );

    return;
  }

  const title =
    devotional.titulo ||
    `Dia ${currentDay}`;

  const reference =
    devotional.referencia ||
    "";

  const intro =
    devotional.introducao ||
    "";

  const reflection =
    devotional.reflexao ||
    "";

  const practice =
    devotional.pratica ||
    "";

  const question =
    devotional.pergunta ||
    "";

  const prayer =
    devotional.oracao ||
    "";

  const content =
    modal.querySelector(
      "[data-modal-content]"
    ) ||
    modal;

  content.innerHTML = `

    <div class="modal-inner">

      <button
        class="modal-close"
        type="button"
        data-close-modal
        aria-label="Fechar"
      >
        ×
      </button>

      <span class="eyebrow">
        DIA ${String(currentDay).padStart(2, "0")}
      </span>

      <h2>
        ${escapeHTML(title)}
      </h2>

      ${
        reference
          ? `<div class="modal-reference">
              ${escapeHTML(reference)}
            </div>`
          : ""
      }

      ${
        intro
          ? `
            <section>
              <h3>Comece aqui</h3>
              <p>${escapeHTML(intro)}</p>
            </section>
          `
          : ""
      }

      ${
        reflection
          ? `
            <section>
              <h3>Reflexão</h3>
              <p>${escapeHTML(reflection)}</p>
            </section>
          `
          : ""
      }

      ${
        practice
          ? `
            <section>
              <h3>Prática de presença</h3>
              <p>${escapeHTML(practice)}</p>
            </section>
          `
          : ""
      }

      ${
        question
          ? `
            <section>
              <h3>Pare e responda</h3>
              <p>${escapeHTML(question)}</p>
            </section>
          `
          : ""
      }

      ${
        prayer
          ? `
            <section>
              <h3>Oração</h3>
              <p>${escapeHTML(prayer)}</p>
            </section>
          `
          : ""
      }

      ${
        study
          ? `
            <div class="deep-study-entry">

              <span class="eyebrow">
                APROFUNDE
              </span>

              <h3>
                ${escapeHTML(
                  study.titulo ||
                  "Estudo relacionado"
                )}
              </h3>

              <p>
                ${
                  escapeHTML(
                    study.subtitulo ||
                    "Continue sua jornada de aprofundamento."
                  )
                }
              </p>

              <button
                type="button"
                class="primary-button"
                data-open-study="${escapeHTML(study.id || "")}"
              >
                Abrir estudo
              </button>

            </div>
          `
          : ""
      }

      <div class="modal-actions">

        <button
          type="button"
          class="secondary-button"
          data-toggle-favorite="${currentDay}"
        >
          ${
            isFavorite(currentDay)
              ? "♥ Na minha lista"
              : "♡ Minha lista"
          }
        </button>

        <button
          type="button"
          class="primary-button"
          data-complete-day="${currentDay}"
        >
          ${
            isDone(currentDay)
              ? "✓ Dia concluído"
              : "Concluir dia"
          }
        </button>

      </div>

    </div>
  `;

  modal.classList.add("is-open");
  modal.classList.add("active");

  modal.style.display = "flex";

  document.body.classList.add(
    "modal-open"
  );
}


/* =========================================================
   FECHAR MODAL
   ========================================================= */

function closeModal() {

  const modal =
    document.querySelector(
      "#devotionalModal, [data-devotional-modal]"
    );

  if (!modal) return;

  modal.classList.remove("is-open");
  modal.classList.remove("active");

  document.body.classList.remove(
    "modal-open"
  );

  setTimeout(() => {

    if (
      !modal.classList.contains("is-open") &&
      !modal.classList.contains("active")
    ) {
      modal.style.display = "none";
    }

  }, 350);
}


/* =========================================================
   ABRIR ESTUDO
   ========================================================= */

function openStudy(id) {

  const study =
    studies.find(
      item => item.id === id
    );

  if (!study) {

    console.warn(
      "Estudo não encontrado:",
      id
    );

    return;
  }

  currentStudy = study;

  const modal =
    document.querySelector(
      "#studyModal, [data-study-modal]"
    );

  if (!modal) {

    console.warn(
      "Modal de estudos não encontrado."
    );

    return;
  }

  const content =
    modal.querySelector(
      "[data-study-content]"
    ) ||
    modal;

  const exegese =
    Array.isArray(study.exegese?.pontos)
      ? study.exegese.pontos
      : [];

  const perguntas =
    Array.isArray(study.perguntas)
      ? study.perguntas
      : [];

  content.innerHTML = `

    <div class="modal-inner study-detail">

      <button
        type="button"
        class="modal-close"
        data-close-study
        aria-label="Fechar estudo"
      >
        ×
      </button>

      <span class="eyebrow">
        ESTUDO PROFUNDO
      </span>

      <h2>
        ${escapeHTML(study.titulo || "")}
      </h2>

      ${
        study.subtitulo
          ? `<p class="study-subtitle">
              ${escapeHTML(study.subtitulo)}
            </p>`
          : ""
      }

      ${
        study.texto_principal?.referencia
          ? `
            <div class="modal-reference">
              ${escapeHTML(
                study.texto_principal.referencia
              )}
            </div>
          `
          : ""
      }

      ${
        study.objetivo
          ? `
            <section>
              <h3>Objetivo</h3>
              <p>${escapeHTML(study.objetivo)}</p>
            </section>
          `
          : ""
      }

      ${
        study.pergunta_central
          ? `
            <section>
              <h3>Pergunta central</h3>
              <p>${escapeHTML(study.pergunta_central)}</p>
            </section>
          `
          : ""
      }

      ${
        study.contexto_historico?.texto
          ? `
            <section>
              <h3>Contexto histórico</h3>
              <p>
                ${escapeHTML(
                  study.contexto_historico.texto
                )}
              </p>
            </section>
          `
          : ""
      }

      ${
        study.contexto_literario?.texto
          ? `
            <section>
              <h3>Contexto literário</h3>
              <p>
                ${escapeHTML(
                  study.contexto_literario.texto
                )}
              </p>
            </section>
          `
          : ""
      }

      ${
        exegese.length
          ? `
            <section>

              <h3>
                ${
                  escapeHTML(
                    study.exegese.titulo ||
                    "Exegese"
                  )
                }
              </h3>

              ${exegese.map(point => `
                <div class="study-point">

                  <strong>
                    ${escapeHTML(point.tema || "")}
                  </strong>

                  <p>
                    ${escapeHTML(
                      point.explicacao || ""
                    )}
                  </p>

                </div>
              `).join("")}

            </section>
          `
          : ""
      }

      ${
        study.teologia
          ? `
            <section>

              <h3>
                ${
                  escapeHTML(
                    study.teologia.titulo ||
                    "Teologia"
                  )
                }
              </h3>

              ${
                study.teologia.implicacao
                  ? `<p>
                      ${escapeHTML(
                        study.teologia.implicacao
                      )}
                    </p>`
                  : ""
              }

              ${
                study.teologia.alerta_teologico
                  ? `
                    <div class="study-alert">
                      ${escapeHTML(
                        study.teologia.alerta_teologico
                      )}
                    </div>
                  `
                  : ""
              }

            </section>
          `
          : ""
      }

      ${
        study.contemplacao_teologica
          ? `
            <section class="study-contemplation">

              <span class="eyebrow">
                CONTEMPLAÇÃO
              </span>

              <h3>
                ${
                  escapeHTML(
                    study.contemplacao_teologica.titulo ||
                    "Pare e contemple"
                  )
                }
              </h3>

              <p>
                ${escapeHTML(
                  study.contemplacao_teologica.texto ||
                  ""
                )}
              </p>

            </section>
          `
          : ""
      }

      ${
        perguntas.length
          ? `
            <section>

              <h3>
                Perguntas para aprofundar
              </h3>

              <ol class="study-questions">

                ${perguntas.map(question => `
                  <li>
                    ${
                      escapeHTML(
                        typeof question === "string"
                          ? question
                          : question.pergunta || ""
                      )
                    }
                  </li>
                `).join("")}

              </ol>

            </section>
          `
          : ""
      }

      ${
        study.bibliografia
          ? `
            <section>

              <h3>
                Bibliografia
              </h3>

              ${
                study.bibliografia.observacao
                  ? `<p class="muted">
                      ${escapeHTML(
                        study.bibliografia.observacao
                      )}
                    </p>`
                  : ""
              }

              ${
                Array.isArray(
                  study.bibliografia.categorias
                )
                  ? study.bibliografia.categorias.map(category => `
                      <div class="bibliography-group">

                        <strong>
                          ${escapeHTML(
                            category.categoria || ""
                          )}
                        </strong>

                        <ul>
                          ${
                            (category.referencias || [])
                              .map(ref => `
                                <li>
                                  ${escapeHTML(ref)}
                                </li>
                              `)
                              .join("")
                          }
                        </ul>

                      </div>
                    `).join("")
                  : ""
              }

            </section>
          `
          : ""
      }

      ${
        study.oracao
          ? `
            <section>

              <h3>
                Oração
              </h3>

              <p class="prayer-text">
                ${
                  escapeHTML(
                    typeof study.oracao === "string"
                      ? study.oracao
                      : study.oracao.texto || ""
                  )
                }
              </p>

            </section>
          `
          : ""
      }

    </div>
  `;

  modal.classList.add("is-open");
  modal.classList.add("active");

  modal.style.display = "flex";

  document.body.classList.add(
    "modal-open"
  );
}


/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

function navigate(screen) {

  currentScreen = screen;

  $$(".screen, [data-screen]").forEach(
    element => {

      const target =
        element.dataset.screen ||
        element.id;

      if (
        target === screen ||
        target === `screen-${screen}`
      ) {

        element.classList.add("active");

      } else {

        element.classList.remove("active");

      }

    }
  );

  $$("[data-nav]").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.nav === screen
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

function searchContent(query) {

  const term =
    String(query || "")
      .trim()
      .toLowerCase();

  if (!term) return [];

  const devotionalResults =
    devotionals.filter(item => {

      const text = [
        item.titulo,
        item.introducao,
        item.reflexao,
        item.pratica,
        item.pergunta,
        item.referencia
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(term);

    });

  const studyResults =
    studies.filter(item => {

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

    });

  return {
    devotionals: devotionalResults,
    studies: studyResults
  };
}


/* =========================================================
   EVENTOS
   ========================================================= */

document.addEventListener(
  "click",
  (event) => {

    const dayCard =
      event.target.closest(
        "[data-day]"
      );

    if (
      dayCard &&
      !event.target.closest("button")
    ) {

      const day =
        safeNumber(
          dayCard.dataset.day
        );

      if (day) {
        openDevotional(day);
      }

      return;
    }


    const openDayButton =
      event.target.closest(
        "[data-open-day]"
      );

    if (openDayButton) {

      openDevotional(
        safeNumber(
          openDayButton.dataset.openDay
        )
      );

      return;
    }


    const favoriteButton =
      event.target.closest(
        "[data-toggle-favorite]"
      );

    if (favoriteButton) {

      const day =
        safeNumber(
          favoriteButton.dataset.toggleFavorite
        );

      toggleFavorite(day);

      openDevotional(day);

      renderDayRails();
      updateProgress();

      return;
    }


    const completeButton =
      event.target.closest(
        "[data-complete-day]"
      );

    if (completeButton) {

      const day =
        safeNumber(
          completeButton.dataset.completeDay
        );

      toggleDone(day);

      openDevotional(day);

      renderDayRails();
      updateProgress();

      return;
    }


    const openStudyButton =
      event.target.closest(
        "[data-open-study]"
      );

    if (openStudyButton) {

      openStudy(
        openStudyButton.dataset.openStudy
      );

      return;
    }


    if (
      event.target.closest(
        "[data-close-modal]"
      )
    ) {

      closeModal();

      return;
    }


    if (
      event.target.closest(
        "[data-close-study]"
      )
    ) {

      const modal =
        document.querySelector(
          "#studyModal, [data-study-modal]"
        );

      if (modal) {

        modal.classList.remove("is-open");
        modal.classList.remove("active");

        modal.style.display = "none";

      }

      document.body.classList.remove(
        "modal-open"
      );

      return;
    }


    const nav =
      event.target.closest(
        "[data-nav]"
      );

    if (nav) {

      navigate(
        nav.dataset.nav
      );

    }

  }
);


/* =========================================================
   TECLADO
   ========================================================= */

document.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Escape") {

      closeModal();

      const studyModal =
        document.querySelector(
          "#studyModal, [data-study-modal]"
        );

      if (studyModal) {

        studyModal.classList.remove(
          "is-open",
          "active"
        );

        studyModal.style.display = "none";

      }

      document.body.classList.remove(
        "modal-open"
      );

    }

  }
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

async function initializeApp() {

  try {

    /*
     * Carrega os dois bancos em paralelo.
     */
    await Promise.all([
      loadDevotionals(),
      loadStudies()
    ]);

    currentDay =
      getTodayDay();

    renderDayRails();
    renderToday();
    updateProgress();

    console.log(
      "Doce Espírito Santo iniciado."
    );

    console.log(
      `Devocionais carregados: ${devotionals.length}`
    );

    console.log(
      `Estudos carregados: ${studies.length}`
    );

  } catch (error) {

    console.error(
      "Erro na inicialização:",
      error
    );

  } finally {

    /*
     * ESSA É A CORREÇÃO PRINCIPAL.
     * A interface SEMPRE será liberada.
     */
    releaseSplash();

  }

}


/* =========================================================
   START
   ========================================================= */

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeApp,
    {
      once: true
    }
  );

} else {

  initializeApp();

}


/*
 * Última barreira de segurança.
 * Se qualquer coisa acima quebrar,
 * o usuário ainda consegue entrar no aplicativo.
 */
window.addEventListener(
  "load",
  () => {

    setTimeout(
      releaseSplash,
      250
    );

  },
  {
    once: true
  }
);

window.addEventListener(
  "error",
  () => {

    setTimeout(
      releaseSplash,
      100
    );

  }
);

window.addEventListener(
  "unhandledrejection",
  () => {

    setTimeout(
      releaseSplash,
      100
    );

  }
);
