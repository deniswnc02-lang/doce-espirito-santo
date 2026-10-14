/* =========================================================
   DOCE ESPÍRITO SANTO — UM AMIGO ÍNTIMO
   APP.JS — MOTOR PRINCIPAL
   ========================================================= */

let devotionals = [];
let studies = [];
let currentDay = 1;
let currentStudy = null;
let currentFilter = "all";

/* =========================================================
   HELPERS
   ========================================================= */

const $ = (id) => document.getElementById(id);

const doneKey = (day) => `des-day-${day}-done`;
const favKey = (day) => `des-day-${day}-favorite`;
const journalKey = (day) => `des-day-${day}-journal`;

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function isDone(day) {
  return localStorage.getItem(doneKey(day)) === "true";
}

function isFavorite(day) {
  return localStorage.getItem(favKey(day)) === "true";
}

function getJournal(day) {
  return localStorage.getItem(journalKey(day)) || "";
}

function getDay(day) {
  return devotionals.find(
    item => Number(item.dia) === Number(day)
  );
}

function getStudy(day) {
  return studies.find(
    item => Number(item.dia) === Number(day)
  );
}

function countDone() {
  return devotionals.filter(
    item => isDone(Number(item.dia))
  ).length;
}

/* =========================================================
   CARREGAMENTO DOS DADOS
   ========================================================= */

async function loadJSON(url) {
  const response = await fetch(`${url}?v=${Date.now()}`);

  if (!response.ok) {
    throw new Error(`${url} não encontrado`);
  }

  return response.json();
}

async function loadData() {
  try {
    const devotionalData = await loadJSON("devocionais.json");

    devotionals = Array.isArray(devotionalData)
      ? devotionalData
      : devotionalData.devocionais || [];

    console.log(
      `✓ ${devotionals.length} devocionais carregados`
    );

  } catch (error) {
    console.error("Erro ao carregar devocionais:", error);
    devotionals = [];
  }

  try {
    const studyData = await loadJSON("estudos.json");

    studies = Array.isArray(studyData)
      ? studyData
      : studyData.estudos || [];

    console.log(
      `✓ ${studies.length} estudos carregados`
    );

  } catch (error) {
    console.error("Erro ao carregar estudos:", error);
    studies = [];
  }

  initializeApp();
}

/* =========================================================
   PROGRESSO
   ========================================================= */

function updateProgress() {

  const completed = countDone();

  const total = 365;

  const percentage = Math.min(
    100,
    Math.round((completed / total) * 100)
  );

  const progressBars = document.querySelectorAll(
    "[data-progress]"
  );

  progressBars.forEach(bar => {
    bar.style.width = `${percentage}%`;
  });

  const progressTexts = document.querySelectorAll(
    "[data-progress-text]"
  );

  progressTexts.forEach(text => {
    text.textContent =
      `${completed} de ${total} dias`;
  });

  const percentageElements =
    document.querySelectorAll(
      "[data-progress-percent]"
    );

  percentageElements.forEach(element => {
    element.textContent = `${percentage}%`;
  });
}

/* =========================================================
   CARD DO DEVOCIONAL
   ========================================================= */

function cardHTML(day) {

  const devotional = getDay(day);

  if (!devotional) return "";

  const favorite = isFavorite(day);
  const completed = isDone(day);

  const title =
    devotional.titulo ||
    `Dia ${day}`;

  const reference =
    devotional.referencia ||
    "";

  const intro =
    devotional.introducao ||
    devotional.reflexao ||
    "";

  return `
    <article
      class="content-card"
      data-day="${day}"
      tabindex="0"
      role="button"
    >

      <div class="content-card-image">

        <div class="card-day">
          DIA ${String(day).padStart(3, "0")}
        </div>

        <div class="card-status">

          ${
            completed
              ? `<span class="status-done">✓</span>`
              : ""
          }

          ${
            favorite
              ? `<span class="status-favorite">♡</span>`
              : ""
          }

        </div>

      </div>

      <div class="content-card-body">

        <span class="content-card-reference">
          ${escapeHTML(reference)}
        </span>

        <h3>
          ${escapeHTML(title)}
        </h3>

        <p>
          ${escapeHTML(intro)}
        </p>

      </div>

    </article>
  `;
}

/* =========================================================
   RAILS
   ========================================================= */

function renderRail(containerId, items) {

  const container = $(containerId);

  if (!container) return;

  container.innerHTML = items
    .map(item => cardHTML(Number(item.dia)))
    .join("");

  bindCards(container);
}

function renderRails() {

  if (!devotionals.length) return;

  const today = getNextDay();

  const todayRail =
    devotionals.filter(
      item => Number(item.dia) >= Number(today?.dia || 1)
    ).slice(0, 10);

  const presenceRail =
    devotionals.slice(0, 12);

  const topRail =
    [...devotionals]
      .sort((a, b) => {

        const aScore =
          Number(a.dia) % 7;

        const bScore =
          Number(b.dia) % 7;

        return aScore - bScore;

      })
      .slice(0, 10);

  const journeyRail =
    devotionals.slice(
      Math.max(0, Number(today?.dia || 1) - 1),
      Number(today?.dia || 1) + 8
    );

  renderRail(
    "todayRail",
    todayRail
  );

  renderRail(
    "presenceRail",
    presenceRail
  );

  renderRail(
    "top10Rail",
    topRail
  );

  renderRail(
    "journeyRail",
    journeyRail
  );
}

/* =========================================================
   GRADE DE DIAS
   ========================================================= */

function renderDayGrid() {

  const grid = $("dayGrid");

  if (!grid) return;

  let filtered = devotionals;

  if (currentFilter === "completed") {

    filtered = devotionals.filter(
      item => isDone(Number(item.dia))
    );

  }

  if (currentFilter === "favorites") {

    filtered = devotionals.filter(
      item => isFavorite(Number(item.dia))
    );

  }

  if (currentFilter === "pending") {

    filtered = devotionals.filter(
      item => !isDone(Number(item.dia))
    );

  }

  grid.innerHTML = filtered
    .map(item => cardHTML(Number(item.dia)))
    .join("");

  bindCards(grid);
}

/* =========================================================
   FAVORITOS
   ========================================================= */

function renderFavorites() {

  const container = $("favoritesGrid");

  if (!container) return;

  const favorites =
    devotionals.filter(
      item => isFavorite(Number(item.dia))
    );

  if (!favorites.length) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">♡</div>

        <h3>Nenhum favorito ainda</h3>

        <p>
          Salve os devocionais que deseja
          revisitar durante sua jornada.
        </p>

      </div>
    `;

    return;
  }

  container.innerHTML =
    favorites
      .map(item => cardHTML(Number(item.dia)))
      .join("");

  bindCards(container);
}

/* =========================================================
   HOJE
   ========================================================= */

function getNextDay() {

  const pending =
    devotionals.find(
      item => !isDone(Number(item.dia))
    );

  return pending || devotionals[0];
}

function renderToday() {

  const today = getNextDay();

  if (!today) return;

  currentDay = Number(today.dia);

  const title =
    document.querySelector(
      "[data-today-title]"
    );

  if (title) {
    title.textContent =
      today.titulo ||
      `Dia ${currentDay}`;
  }

  const reference =
    document.querySelector(
      "[data-today-reference]"
    );

  if (reference) {
    reference.textContent =
      today.referencia || "";
  }

  const intro =
    document.querySelector(
      "[data-today-intro]"
    );

  if (intro) {
    intro.textContent =
      today.introducao ||
      today.reflexao ||
      "";
  }
}

/* =========================================================
   MODAL DO DEVOCIONAL
   ========================================================= */

function openDay(dayNumber) {

  const devotional =
    getDay(dayNumber);

  if (!devotional) return;

  currentDay = Number(dayNumber);

  const study =
    getStudy(currentDay);

  const modal =
    $("devotionalModal");

  if (!modal) {
    console.warn(
      "devotionalModal não encontrado"
    );
    return;
  }

  const title =
    modal.querySelector(
      "[data-modal-title]"
    );

  if (title) {
    title.textContent =
      devotional.titulo ||
      `Dia ${currentDay}`;
  }

  const reference =
    modal.querySelector(
      "[data-modal-reference]"
    );

  if (reference) {
    reference.textContent =
      devotional.referencia || "";
  }

  const intro =
    modal.querySelector(
      "[data-modal-intro]"
    );

  if (intro) {
    intro.textContent =
      devotional.introducao ||
      "";
  }

  const reflection =
    modal.querySelector(
      "[data-modal-reflection]"
    );

  if (reflection) {
    reflection.innerHTML =
      formatText(
        devotional.reflexao ||
        "Permaneça neste texto e perceba o que ele desperta em você."
      );
  }

  const practice =
    modal.querySelector(
      "[data-modal-practice]"
    );

  if (practice) {
    practice.innerHTML =
      formatText(
        devotional.pratica ||
        ""
      );
  }

  const question =
    modal.querySelector(
      "[data-modal-question]"
    );

  if (question) {
    question.innerHTML =
      formatText(
        devotional.pergunta ||
        ""
      );
  }

  const prayer =
    modal.querySelector(
      "[data-modal-prayer]"
    );

  if (prayer) {
    prayer.innerHTML =
      formatText(
        devotional.oracao ||
        ""
      );
  }

  const studyButton =
    modal.querySelector(
      '[data-action="study"]'
    );

  if (studyButton) {

    if (study) {

      studyButton.hidden = false;

      studyButton.innerHTML = `
        <span>ESTUDO</span>
        <small>
          ${study.tempo_estimado_minutos || 40} min
        </small>
      `;

    } else {

      studyButton.hidden = true;

    }
  }

  modal.classList.add("active");
  document.body.classList.add("modal-open");

  updateModalState();
}

function closeModal() {

  const modal =
    $("devotionalModal");

  if (!modal) return;

  modal.classList.remove("active");

  document.body.classList.remove(
    "modal-open"
  );
}

function updateModalState() {

  const completeButton =
    $("completeButton");

  const favoriteButton =
    $("favoriteButton");

  if (completeButton) {

    completeButton.textContent =
      isDone(currentDay)
        ? "Concluído ✓"
        : "Concluir devocional";

  }

  if (favoriteButton) {

    favoriteButton.textContent =
      isFavorite(currentDay)
        ? "Favoritado ♥"
        : "Favoritar ♡";

  }
}

/* =========================================================
   CONCLUIR
   ========================================================= */

function completeCurrentDay() {

  if (!currentDay) return;

  const key =
    doneKey(currentDay);

  const newState =
    !isDone(currentDay);

  localStorage.setItem(
    key,
    String(newState)
  );

  updateProgress();
  updateModalState();
  renderRails();
  renderDayGrid();
  renderFavorites();
  renderToday();
}

/* =========================================================
   FAVORITAR
   ========================================================= */

function toggleFavorite() {

  if (!currentDay) return;

  const key =
    favKey(currentDay);

  const newState =
    !isFavorite(currentDay);

  localStorage.setItem(
    key,
    String(newState)
  );

  updateModalState();
  renderRails();
  renderFavorites();
}

/* =========================================================
   ESTUDO PROFUNDO
   ========================================================= */

function openStudy(day) {

  const study =
    getStudy(day);

  if (!study) {

    console.warn(
      `Nenhum estudo encontrado para o dia ${day}`
    );

    return;

  }

  currentStudy = study;

  closeModal();

  const modal =
    $("studyModal");

  if (!modal) {

    createStudyModal();

  }

  renderStudyModal(study);
}

function renderStudyModal(study) {

  const modal =
    $("studyModal");

  if (!modal) return;

  const tempo =
    study.tempo_estimado_minutos ||
    40;

  const html = `

    <div class="study-modal-inner">

      <button
        class="modal-close"
        data-close-study
        aria-label="Fechar"
      >
        ×
      </button>

      <div class="study-header">

        <span class="eyebrow">
          ESTUDO PROFUNDO
        </span>

        <div class="study-day">
          DIA ${String(study.dia).padStart(3, "0")}
        </div>

        <h2>
          ${escapeHTML(study.titulo)}
        </h2>

        <p class="study-subtitle">
          ${escapeHTML(study.subtitulo || "")}
        </p>

        <div class="study-meta">

          <span>
            ${escapeHTML(study.categoria || "Teologia")}
          </span>

          <span>
            ${tempo} minutos
          </span>

          <span>
            ${escapeHTML(study.nivel || "Profundo")}
          </span>

        </div>

      </div>

      ${
        study.objetivo
          ? sectionHTML(
              "Objetivo",
              `<p>${escapeHTML(study.objetivo)}</p>`
            )
          : ""
      }

      ${
        study.pergunta_central
          ? sectionHTML(
              "Pergunta central",
              `<blockquote>
                ${escapeHTML(study.pergunta_central)}
              </blockquote>`
            )
          : ""
      }

      ${
        study.leitura_biblica
          ? renderBibleReading(
              study.leitura_biblica
            )
          : ""
      }

      ${
        study.contexto_historico
          ? renderObjectSection(
              "Contexto histórico",
              study.contexto_historico
            )
          : ""
      }

      ${
        study.contexto_literario
          ? renderObjectSection(
              "Contexto literário",
              study.contexto_literario
            )
          : ""
      }

      ${
        study.exegese
          ? renderExegesis(
              study.exegese
            )
          : ""
      }

      ${
        study.palavras_chave
          ? renderKeywords(
              study.palavras_chave
            )
          : ""
      }

      ${
        study.teologia
          ? renderTheology(
              study.teologia
            )
          : ""
      }

      ${
        study.contemplacao_teologica
          ? renderContemplation(
              study.contemplacao_teologica
            )
          : ""
      }

      ${
        study.aplicacao
          ? renderObjectSection(
              "Aplicação",
              study.aplicacao
            )
          : ""
      }

      ${
        study.perguntas
          ? renderQuestions(
              study.perguntas
            )
          : ""
      }

      ${
        study.conexoes_biblicas
          ? renderConnections(
              study.conexoes_biblicas
            )
          : ""
      }

      ${
        study.bibliografia
          ? renderBibliography(
              study.bibliografia
            )
          : ""
      }

      ${
        study.mapa_estudo
          ? renderStudyMap(
              study.mapa_estudo
            )
          : ""
      }

      ${
        study.plano_leitura
          ? renderReadingPlan(
              study.plano_leitura
            )
          : ""
      }

      ${
        study.oracao
          ? renderPrayer(
              study.oracao
            )
          : ""
      }

      ${
        study.diario
          ? renderJournal(
              study.diario
            )
          : ""
      }

      <div class="study-finish">

        <button
          class="primary-button"
          data-study-complete
        >
          Marcar estudo como concluído
        </button>

      </div>

    </div>
  `;

  modal.innerHTML = html;

  modal.classList.add("active");

  document.body.classList.add(
    "modal-open"
  );

  bindStudyEvents();
}

/* =========================================================
   COMPONENTES DO ESTUDO
   ========================================================= */

function sectionHTML(title, content) {

  return `

    <section class="study-section">

      <h3>
        ${escapeHTML(title)}
      </h3>

      <div class="study-content">
        ${content}
      </div>

    </section>
  `;
}

function renderBibleReading(data) {

  const refs =
    data.referencias || [];

  const observations =
    data.observacoes || [];

  return sectionHTML(
    data.titulo || "Leitura bíblica",

    `

      ${
        data.instrucao
          ? `<p>${escapeHTML(data.instrucao)}</p>`
          : ""
      }

      <div class="reference-list">

        ${refs.map(ref => `
          <span class="reference-chip">
            ${escapeHTML(ref)}
          </span>
        `).join("")}

      </div>

      ${
        observations.length
          ? `
            <ul>
              ${observations.map(item => `
                <li>${escapeHTML(item)}</li>
              `).join("")}
            </ul>
          `
          : ""
      }

    `
  );
}

function renderObjectSection(title, data) {

  if (!data) return "";

  if (typeof data === "string") {

    return sectionHTML(
      title,
      `<p>${escapeHTML(data)}</p>`
    );

  }

  const parts = [];

  Object.entries(data).forEach(
    ([key, value]) => {

      if (
        key === "titulo" ||
        key === "title"
      ) return;

      const label =
        key
          .replace(/_/g, " ")
          .replace(/\b\w/g, l => l.toUpperCase());

      if (Array.isArray(value)) {

        parts.push(`

          <div class="study-subsection">

            <h4>
              ${escapeHTML(label)}
            </h4>

            <ul>

              ${value.map(item => `
                <li>
                  ${escapeHTML(
                    typeof item === "string"
                      ? item
                      : JSON.stringify(item)
                  )}
                </li>
              `).join("")}

            </ul>

          </div>
        `);

      } else if (
        typeof value === "object" &&
        value !== null
      ) {

        parts.push(
          renderObjectSection(
            label,
            value
          )
        );

      } else {

        parts.push(`

          <div class="study-subsection">

            <h4>
              ${escapeHTML(label)}
            </h4>

            <p>
              ${escapeHTML(value)}
            </p>

          </div>
        `);

      }

    }
  );

  return sectionHTML(
    data.titulo || title,
    parts.join("")
  );
}

function renderExegesis(data) {

  const points =
    data.pontos || [];

  return sectionHTML(
    data.titulo || "Exegese",

    points.map(point => `

      <div class="exegesis-point">

        <h4>
          ${escapeHTML(point.tema || "")}
        </h4>

        <p>
          ${escapeHTML(point.explicacao || "")}
        </p>

      </div>

    `).join("")
  );
}

function renderKeywords(words) {

  return sectionHTML(
    "Palavras-chave no texto bíblico",

    `

      <div class="keyword-grid">

        ${words.map(word => `

          <div class="keyword-card">

            <strong>
              ${escapeHTML(word.termo)}
            </strong>

            ${
              word.idioma
                ? `<span>
                    ${escapeHTML(word.idioma)}
                   </span>`
                : ""
            }

            ${
              word.observacao
                ? `<p>
                    ${escapeHTML(word.observacao)}
                   </p>`
                : ""
            }

          </div>

        `).join("")}

      </div>

    `
  );
}

function renderTheology(data) {

  let content = "";

  if (data.pneumatologia) {

    content += `

      <div class="study-subsection">

        <h4>Pneumatologia</h4>

        <ul>

          ${
            Array.isArray(data.pneumatologia)

              ? data.pneumatologia.map(item => `
                  <li>
                    ${escapeHTML(
                      typeof item === "string"
                        ? item
                        : JSON.stringify(item)
                    )}
                  </li>
                `).join("")

              : `
                <li>
                  ${escapeHTML(data.pneumatologia)}
                </li>
              `
          }

        </ul>

      </div>
    `;
  }

  if (data.trindade) {

    content += `

      <div class="study-subsection">

        <h4>Trindade</h4>

        <p>
          ${escapeHTML(data.trindade)}
        </p>

      </div>
    `;
  }

  if (data.implicacao) {

    content += `

      <div class="study-subsection">

        <h4>Implicação</h4>

        <p>
          ${escapeHTML(data.implicacao)}
        </p>

      </div>
    `;
  }

  if (data.alerta_teologico) {

    content += `

      <div class="theology-warning">

        <strong>
          Atenção teológica
        </strong>

        <p>
          ${escapeHTML(data.alerta_teologico)}
        </p>

      </div>
    `;
  }

  return sectionHTML(
    data.titulo ||
    "Teologia",
    content
  );
}

function renderContemplation(data) {

  return sectionHTML(
    data.titulo ||
    "Contemplação teológica",

    `

      <div class="contemplation-card">

        <p>
          ${escapeHTML(data.texto || "")}
        </p>

        ${
          data.silencio
            ? `
              <div class="silence-block">

                <strong>
                  Silêncio contemplativo
                </strong>

                <span>
                  ${Math.round(
                    Number(
                      data.silencio.duracao_segundos || 120
                    ) / 60
                  )} minutos
                </span>

                <p>
                  ${escapeHTML(
                    data.silencio.instrucao || ""
                  )}
                </p>

              </div>
            `
            : ""
        }

        ${
          data.frases
            ? `
              <div class="contemplation-phrases">

                ${data.frases.map(
                  phrase => `
                    <span>
                      ${escapeHTML(phrase)}
                    </span>
                  `
                ).join("")}

              </div>
            `
            : ""
        }

      </div>
    `
  );
}

function renderQuestions(questions) {

  if (!Array.isArray(questions)) {

    questions = [questions];

  }

  return sectionHTML(
    "Perguntas para aprofundamento",

    `

      <ol class="deep-questions">

        ${questions.map(question => `

          <li>
            ${escapeHTML(
              typeof question === "string"
                ? question
                : JSON.stringify(question)
            )}
          </li>

        `).join("")}

      </ol>

    `
  );
}

function renderConnections(connections) {

  return sectionHTML(
    "Conexões bíblicas",

    `

      <div class="connections-list">

        ${connections.map(item => {

          if (typeof item === "string") {

            return `
              <div class="connection">
                ${escapeHTML(item)}
              </div>
            `;

          }

          return `

            <div class="connection">

              <strong>
                ${escapeHTML(
                  item.referencia || ""
                )}
              </strong>

              ${
                item.tema
                  ? `<span>
                      ${escapeHTML(item.tema)}
                     </span>`
                  : ""
              }

            </div>
          `;

        }).join("")}

      </div>
    `
  );
}

function renderBibliography(data) {

  const categories =
    data.categorias || [];

  return sectionHTML(
    data.titulo ||
    "Bibliografia",

    `

      ${
        data.observacao
          ? `<p class="bibliography-note">
              ${escapeHTML(data.observacao)}
             </p>`
          : ""
      }

      <div class="bibliography-list">

        ${categories.map(category => `

          <div class="bibliography-category">

            <h4>
              ${escapeHTML(
                category.categoria || ""
              )}
            </h4>

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

        `).join("")}

      </div>

    `
  );
}

function renderStudyMap(data) {

  const branches =
    data.ramificacoes || [];

  return sectionHTML(
    data.titulo ||
    "Mapa de estudo",

    `

      <div class="study-map">

        <div class="map-root">

          ${escapeHTML(
            data.raiz || "ESTUDO"
          )}

        </div>

        <div class="map-branches">

          ${
            branches.map(branch => `

              <div class="map-branch">

                <h4>
                  ${escapeHTML(
                    branch.titulo || ""
                  )}
                </h4>

                <div>

                  ${
                    (branch.itens || [])
                      .map(item => `
                        <span>
                          ${escapeHTML(item)}
                        </span>
                      `)
                      .join("")
                  }

                </div>

              </div>

            `).join("")
          }

        </div>

      </div>
    `
  );
}

function renderReadingPlan(data) {

  const days =
    data.dias || [];

  return sectionHTML(
    data.titulo ||
    "Plano de leitura",

    `

      <div class="reading-plan">

        ${days.map(item => `

          <div class="reading-plan-day">

            <span>
              DIA ${escapeHTML(item.dia)}
            </span>

            <strong>
              ${escapeHTML(
                item.referencia || ""
              )}
            </strong>

            <p>
              ${escapeHTML(
                item.tema || ""
              )}
            </p>

          </div>

        `).join("")}

      </div>

    `
  );
}

function renderPrayer(data) {

  const text =
    data.texto ||
    data.oracao ||
    data.conteudo ||
    "";

  return sectionHTML(
    data.titulo ||
    "Oração",

    `

      <div class="prayer-card">

        <div class="prayer-symbol">
          ✦
        </div>

        <p>
          ${escapeHTML(text)}
        </p>

      </div>

    `
  );
}

function renderJournal(data) {

  const title =
    data.titulo ||
    "Diário espiritual";

  const instruction =
    data.instrucao ||
    data.instrução ||
    "Registre aquilo que o Doce Espírito Santo trouxe à sua atenção.";

  return sectionHTML(
    title,

    `

      <p>
        ${escapeHTML(instruction)}
      </p>

      <textarea
        class="study-journal"
        id="studyJournal"
        placeholder="Escreva aqui..."
      >${escapeHTML(
        getJournal(
          currentStudy?.dia
        )
      )}</textarea>

      <button
        class="secondary-button"
        data-save-study-journal
      >
        Salvar reflexão
      </button>

    `
  );
}

/* =========================================================
   MODAL DE ESTUDO
   ========================================================= */

function createStudyModal() {

  if ($("studyModal")) return;

  const modal =
    document.createElement("div");

  modal.id =
    "studyModal";

  modal.className =
    "study-modal";

  document.body.appendChild(modal);
}

function closeStudyModal() {

  const modal =
    $("studyModal");

  if (!modal) return;

  modal.classList.remove(
    "active"
  );

  document.body.classList.remove(
    "modal-open"
  );

  currentStudy = null;
}

function bindStudyEvents() {

  const modal =
    $("studyModal");

  if (!modal) return;

  modal.querySelector(
    "[data-close-study]"
  )?.addEventListener(
    "click",
    closeStudyModal
  );

  modal.querySelector(
    "[data-study-complete]"
  )?.addEventListener(
    "click",
    () => {

      if (!currentStudy) return;

      localStorage.setItem(
        `des-study-${currentStudy.id}`,
        "true"
      );

      const button =
        modal.querySelector(
          "[data-study-complete]"
        );

      if (button) {
        button.textContent =
          "Estudo concluído ✓";
      }

    }
  );

  modal.querySelector(
    "[data-save-study-journal]"
  )?.addEventListener(
    "click",
    saveStudyJournal
  );
}

function saveStudyJournal() {

  if (!currentStudy) return;

  const field =
    $("studyJournal");

  if (!field) return;

  localStorage.setItem(
    journalKey(currentStudy.dia),
    field.value
  );

  const button =
    document.querySelector(
      "[data-save-study-journal]"
    );

  if (button) {

    button.textContent =
      "Salvo ✓";

    setTimeout(() => {

      button.textContent =
        "Salvar reflexão";

    }, 1500);

  }
}

/* =========================================================
   FORMATAÇÃO
   ========================================================= */

function formatText(text) {

  return escapeHTML(text)
    .replace(/\n\n+/g, "</p><p>")
    .replace(/\n/g, "<br>");

}

/* =========================================================
   NAVEGAÇÃO
   ========================================================= */

function showScreen(name) {

  document
    .querySelectorAll(
      ".screen"
    )
    .forEach(screen => {

      screen.classList.toggle(
        "active",
        screen.dataset.screen === name
      );

    });

  document
    .querySelectorAll(
      "[data-screen-target]"
    )
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.screenTarget === name
      );

    });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (name === "today") {
    renderToday();
  }

  if (name === "favorites") {
    renderFavorites();
  }

  if (name === "journey") {
    renderDayGrid();
  }
}

/* =========================================================
   BUSCA
   ========================================================= */

function openSearch() {

  const search =
    $("searchOverlay");

  if (!search) return;

  search.classList.add(
    "active"
  );

  document.body.classList.add(
    "modal-open"
  );

  const input =
    search.querySelector(
      "input"
    );

  input?.focus();
}

function closeSearch() {

  const search =
    $("searchOverlay");

  if (!search) return;

  search.classList.remove(
    "active"
  );

  document.body.classList.remove(
    "modal-open"
  );
}

function search(query) {

  const results =
    $("searchResults");

  if (!results) return;

  const term =
    query
      .trim()
      .toLowerCase();

  if (!term) {

    results.innerHTML = `
      <div class="search-empty">
        Digite algo para começar.
      </div>
    `;

    return;
  }

  const matches =
    devotionals.filter(item => {

      const text = [

        item.titulo,
        item.introducao,
        item.reflexao,
        item.pergunta,
        item.pratica,
        item.oracao,
        item.referencia

      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(term);

    });

  if (!matches.length) {

    results.innerHTML = `
      <div class="search-empty">
        Nenhum conteúdo encontrado.
      </div>
    `;

    return;
  }

  results.innerHTML =
    matches
      .slice(0, 30)
      .map(item =>
        cardHTML(Number(item.dia))
      )
      .join("");

  bindCards(results);
}

/* =========================================================
   CARDS
   ========================================================= */

function bindCards(container = document) {

  container
    .querySelectorAll(
      "[data-day]"
    )
    .forEach(card => {

      if (card.dataset.bound)
        return;

      card.dataset.bound = "true";

      card.addEventListener(
        "click",
        () => {

          const day =
            Number(card.dataset.day);

          openDay(day);

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

            openDay(
              Number(
                card.dataset.day
              )
            );

          }

        }
      );

    });
}

/* =========================================================
   AÇÕES GLOBAIS
   ========================================================= */

function handleAction(action) {

  switch (action) {

    case "study":

      openStudy(currentDay);

      break;

    case "bible":

      showScreen("bible");

      break;

    case "map":

      showScreen("maps");

      break;

    case "plan":

      showScreen("plans");

      break;

    case "journal":

      showScreen("journal");

      break;

    case "references":

      showScreen("studies");

      break;

    case "audio":

      showScreen("audio");

      break;

    case "prayer":

      if (currentDay) {
        openDay(currentDay);
      }

      break;

    default:

      console.log(
        "Ação:",
        action
      );

  }
}

/* =========================================================
   COMMAND SYSTEM
   ========================================================= */

function openCommand() {

  const overlay =
    $("commandOverlay");

  if (!overlay) return;

  overlay.classList.add(
    "active"
  );

  document.body.classList.add(
    "modal-open"
  );

}

function closeCommand() {

  const overlay =
    $("commandOverlay");

  if (!overlay) return;

  overlay.classList.remove(
    "active"
  );

  document.body.classList.remove(
    "modal-open"
  );

}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function renderAll() {

  renderRails();

  renderDayGrid();

  renderFavorites();

  renderToday();

  updateProgress();

  bindCards();

}

/* =========================================================
   EVENTOS
   ========================================================= */

document.addEventListener(
  "click",
  event => {

    const target =
      event.target.closest(
        "[data-action]"
      );

    if (target) {

      handleAction(
        target.dataset.action
      );

      return;

    }

    const nav =
      event.target.closest(
        "[data-screen-target]"
      );

    if (nav) {

      showScreen(
        nav.dataset.screenTarget
      );

      return;

    }

    if (
      event.target.matches(
        "[data-open-search]"
      )
    ) {

      openSearch();

      return;

    }

    if (
      event.target.matches(
        "[data-close-search]"
      )
    ) {

      closeSearch();

      return;

    }

    if (
      event.target.matches(
        "[data-open-command]"
      )
    ) {

      openCommand();

      return;

    }

    if (
      event.target.matches(
        "[data-close-command]"
      )
    ) {

      closeCommand();

      return;

    }

  }
);

/* =========================================================
   BOTÕES DO MODAL
   ========================================================= */

$("completeButton")
  ?.addEventListener(
    "click",
    completeCurrentDay
  );

$("favoriteButton")
  ?.addEventListener(
    "click",
    toggleFavorite
  );

$("closeModal")
  ?.addEventListener(
    "click",
    closeModal
  );

/* =========================================================
   BUSCA
   ========================================================= */

$("searchInput")
  ?.addEventListener(
    "input",
    event => {

      search(
        event.target.value
      );

    }
  );

/* =========================================================
   FILTROS
   ========================================================= */

document
  .querySelectorAll(
    ".chip"
  )
  .forEach(chip => {

    chip.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(
            ".chip"
          )
          .forEach(item =>
            item.classList.remove(
              "active"
            )
          );

        chip.classList.add(
          "active"
        );

        currentFilter =
          chip.dataset.filter ||
          "all";

        renderDayGrid();

      }
    );

  });

/* =========================================================
   ESC
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key !== "Escape"
    ) return;

    closeModal();
    closeSearch();
    closeCommand();
    closeStudyModal();

  }
);

/* =========================================================
   TOPBAR
   ========================================================= */

window.addEventListener(
  "scroll",
  () => {

    const topbar =
      $("topbar");

    if (!topbar) return;

    topbar.classList.toggle(
      "scrolled",
      window.scrollY > 20
    );

  },
  {
    passive: true
  }
);

/* =========================================================
   START
   ========================================================= */

loadData();
