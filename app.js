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
        "devocionais.json"
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


  /*
    Aceita tanto:

    [
      {...},
      {...}
    ]

    quanto:

    {
      "days": [...]
    }
  */

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
    "";


  const devotionalReference =
    devotional.reference ||
    devotional.referencia ||
    devotional.verse ||
    devotional.versiculo ||
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
          Seu conteúdo será carregado
          quando o arquivo de devocionais
          estiver disponível.
        </p>
      `;

    }

    return;

  }


  const devotionalTitle =
    devotional.title ||
    devotional.titulo ||
    "A Presença que já está aqui";


  const devotionalBody =
    devotional.content ||
    devotional.conteudo ||
    devotional.body ||
    devotional.corpo ||
    devotional.reflection ||
    devotional.reflexao ||
    "";


  if (title) {

    title.textContent =
      devotionalTitle;

  }


  if (body) {

    body.innerHTML =
      formatContent(
        devotionalBody
      );

  }

}


/* =========================================================
   FORMATADOR
========================================================= */

function formatContent(content) {

  if (!content) {

    return `
      <p>
        Conteúdo em preparação.
      </p>
    `;

  }


  if (
    typeof content !== "string"
  ) {

    return `
      <p>
        ${escapeHTML(
          JSON.stringify(content)
        )}
      </p>
    `;

  }


  return content
    .split(/\n\s*\n/)
    .map(
      paragraph =>
        `<p>${escapeHTML(
          paragraph
        )}</p>`
    )
    .join("");

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


function openDay(day) {

  state.currentDay =
    day;


  localStorage.setItem(
    "des_current_day",
    day
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
/* =========================================
   TELA DE ABERTURA
   365 DIAS DE PRESENÇA
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const splashScreen = document.getElementById("splashScreen");
    const startButton = document.getElementById("startApp");

    if (!splashScreen || !startButton) {
        return;
    }

    // Mantém o aplicativo travado enquanto a capa está aberta
    document.body.classList.add("splash-active");

    startButton.addEventListener("click", () => {

        // Inicia o desaparecimento suave da capa
        splashScreen.classList.add("hidden");

        // Libera a rolagem do aplicativo
        document.body.classList.remove("splash-active");

        // Remove a capa depois da animação
        setTimeout(() => {
            splashScreen.remove();
        }, 1000);
    });
});
