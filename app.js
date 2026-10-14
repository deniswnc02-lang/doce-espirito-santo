let devotionals = [];
let currentDay = 1;
let currentFilter = "all";

const $ = (id) => document.getElementById(id);

const doneKey = (d) => `day-${d}-done`;
const favKey = (d) => `day-${d}-favorite`;

function escapeHTML(value){
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  }[c]));
}

function isDone(day){
  return localStorage.getItem(doneKey(day)) === "true";
}

function isFavorite(day){
  return localStorage.getItem(favKey(day)) === "true";
}


/* =========================================================
   CARREGAR DEVOCIONAIS
========================================================= */

async function loadDevotionals(){

  try{

    const response = await fetch(
      `devocionais.json?v=${Date.now()}`
    );

    if(!response.ok){
      throw new Error("devocionais.json não encontrado");
    }

    const data = await response.json();

    devotionals =
      Array.isArray(data)
        ? data
        : (
            Array.isArray(data.devocionais)
              ? data.devocionais
              : []
          );

    if(!devotionals.length){
      throw new Error(
        "Nenhum devocional encontrado"
      );
    }

  }catch(err){

    console.error(err);

    /*
      Fallback apenas para a interface não ficar
      completamente vazia caso o JSON não carregue.
    */

    devotionals = Array.from(
      {length:365},
      (_,i) => ({

        dia:i+1,

        titulo:
          i === 0
            ? "Comece aprendendo a percebê-lo"
            : `Jornada — Dia ${i+1}`,

        introducao:
          i === 0
            ? "A presença não precisa ser fabricada. Aprenda a reconhecer aquilo que já está aqui."
            : "Um novo passo para aprofundar sua caminhada.",

        referencia:
          "João 14:16–17",

        reflexao:
          "O conteúdo deste dia será carregado a partir do seu devocionais.json.",

        pratica:
          "Abra o coração, diminua o ruído e permaneça alguns minutos consciente da presença do Doce Espírito Santo.",

        pergunta:
          "O que estou percebendo hoje?",

        oracao:
          "Doce Espírito Santo, ensina-me a perceber Tua presença e a viver esta jornada com verdade. Amém."
      })
    );
  }

  renderAll();
}


/* =========================================================
   LOCALIZAR DIA
========================================================= */

function getDay(n){

  return (
    devotionals.find(
      d => Number(d.dia) === Number(n)
    )
    ||
    devotionals[n-1]
  );
}


/* =========================================================
   PRÓXIMO DIA
========================================================= */

function getNextDay(){

  const first =
    devotionals.find(
      d => !isDone(Number(d.dia))
    );

  return first || devotionals[0];
}


/* =========================================================
   PROGRESSO
========================================================= */

function countDone(){

  let count = 0;

  for(let i = 1; i <= 365; i++){

    if(isDone(i)){
      count++;
    }

  }

  return count;
}


function updateProgress(){

  const done = countDone();

  const pct =
    Math.min(
      100,
      (done / 365) * 100
    );

  if($("progressLabel")){
    $("progressLabel").textContent =
      `${done} / 365`;
  }

  if($("progressFill")){
    $("progressFill").style.width =
      `${pct}%`;
  }

  if($("journeyDone")){
    $("journeyDone").textContent =
      done;
  }

  if($("journeyPercent")){
    $("journeyPercent").textContent =
      `${Math.round(pct)}%`;
  }

  if($("profileProgress")){
    $("profileProgress").textContent =
      `${done} / 365`;
  }

  if($("profileProgressFill")){
    $("profileProgressFill").style.width =
      `${pct}%`;
  }
}


/* =========================================================
   CARD
========================================================= */

function cardHTML(day){

  const n = Number(day.dia);

  return `

    <button
      class="dev-card ${isDone(n) ? "done" : ""}"
      data-open-day="${n}"
    >

      <img
        src="capa.jpeg"
        alt=""
      >

      <div class="dev-card-content">

        <div class="dev-card-day">
          DIA ${String(n).padStart(2,"0")}
        </div>

        <h3>
          ${escapeHTML(
            day.titulo ||
            "Um novo encontro"
          )}
        </h3>

      </div>

    </button>

  `;
}


/* =========================================================
   RAILS
========================================================= */

function renderRails(){

  const next = getNextDay();

  if(next){

    const n =
      Number(next.dia);

    $("continueNumber").textContent =
      String(n).padStart(2,"0");

    $("continueTitle").textContent =
      next.titulo ||
      `Dia ${n}`;

    $("continueIntro").textContent =
      next.introducao ||
      "Continue sua jornada.";
  }


  /*
    Primeira fileira
  */

  $("todayRail").innerHTML =
    devotionals
      .slice(0,10)
      .map(cardHTML)
      .join("");


  /*
    Fileira sobre presença
  */

  $("presenceRail").innerHTML =
    devotionals
      .filter(d =>
        /presen|perceb|silên|silenc|atenção|presença/i
          .test(
            `${d.titulo}
             ${d.introducao}
             ${d.pratica}`
          )
      )
      .slice(0,10)
      .map(cardHTML)
      .join("");


  /*
    Caso não encontre conteúdo
  */

  if(
    !$("presenceRail").innerHTML
  ){

    $("presenceRail").innerHTML =
      devotionals
        .slice(0,10)
        .map(cardHTML)
        .join("");
  }


  /*
    Jornada
  */

  $("journeyRail").innerHTML =
    devotionals
      .slice(0,14)
      .map(cardHTML)
      .join("");


  bindCards();
}


/* =========================================================
   GRID DOS 365 DIAS
========================================================= */

function renderDayGrid(){

  $("dayGrid").innerHTML =
    devotionals
      .map(d => {

        const n =
          Number(d.dia);

        return `

          <button
            class="day-tile ${isDone(n) ? "done" : ""}"
            data-open-day="${n}"
          >

            <small>
              DIA ${String(n).padStart(2,"0")}
            </small>

            <strong>
              ${escapeHTML(
                d.titulo ||
                "Devocional"
              )}
            </strong>

          </button>

        `;
      })
      .join("");

  bindCards();
}


/* =========================================================
   FAVORITOS
========================================================= */

function renderFavorites(){

  const favs =
    devotionals.filter(
      d => isFavorite(
        Number(d.dia)
      )
    );

  $("favoritesRail").innerHTML =
    favs
      .map(cardHTML)
      .join("");

  $("favoritesEmpty").style.display =
    favs.length
      ? "none"
      : "block";

  bindCards();
}


/* =========================================================
   TELA "HOJE"
========================================================= */

function renderToday(){

  const day =
    getNextDay() ||
    devotionals[0];

  if(!day) return;

  $("todayDetail").innerHTML = `

    <div
      class="journey-card"
      data-open-day="${Number(day.dia)}"
    >

      <div class="journey-number">
        ${String(
          Number(day.dia)
        ).padStart(2,"0")}
      </div>

      <div class="journey-copy">

        <span>
          SEU PRÓXIMO ENCONTRO
        </span>

        <h3>
          ${escapeHTML(day.titulo)}
        </h3>

        <p>
          ${escapeHTML(
            day.introducao || ""
          )}
        </p>

      </div>

      <div class="journey-arrow">
        ›
      </div>

    </div>

    <div style="padding:18px">

      <div
        class="detail-block"
        style="border-top:0;margin-top:0"
      >

        <span>
          REFERÊNCIA
        </span>

        <p>
          ${escapeHTML(
            day.referencia || ""
          )}
        </p>

      </div>

      <div class="detail-block">

        <span>
          PRÁTICA DE PRESENÇA
        </span>

        <p>
          ${escapeHTML(
            day.pratica || ""
          )}
        </p>

      </div>

      <button
        class="primary-cta wide"
        data-open-day="${Number(day.dia)}"
      >
        Abrir encontro
      </button>

    </div>

  `;

  bindCards();
}


/* =========================================================
   ABRIR DEVOCIONAL
========================================================= */

function openDay(dayNumber){

  const day =
    getDay(dayNumber);

  if(!day) return;

  currentDay =
    Number(day.dia);


  $("detailDay").textContent =
    `DIA ${String(
      currentDay
    ).padStart(2,"0")}`;


  $("detailRef").textContent =
    day.referencia ||
    day.biblia ||
    "";


  $("detailTitle").textContent =
    day.titulo ||
    "";


  $("detailIntro").textContent =
    day.introducao ||
    "";


  $("detailPractice").textContent =
    day.pratica ||
    "";


  $("detailQuestion").textContent =
    day.pergunta ||
    "";


  $("detailPrayer").textContent =
    day.oracao ||
    "";


  /*
    Reflexão
  */

  const reflection =
    day.reflexao ||
    "";


  const paragraphs =
    Array.isArray(reflection)
      ? reflection
      : String(
          reflection
        ).split(/\n+/);


  $("detailReflection").innerHTML =
    paragraphs
      .filter(Boolean)
      .map(
        p =>
          `<p>${escapeHTML(p)}</p>`
      )
      .join("");


  /*
    Favorito
  */

  $("favoriteButton").textContent =
    isFavorite(currentDay)
      ? "♥ Na minha lista"
      : "♡ Minha lista";


  /*
    Concluído
  */

  $("completeButton").textContent =
    isDone(currentDay)
      ? "✓ Dia concluído"
      : "✓ Concluir este dia";


  /*
    Abrir modal
  */

  $("detailModal")
    .classList
    .add("open");


  $("detailModal")
    .setAttribute(
      "aria-hidden",
      "false"
    );


  document.body.style.overflow =
    "hidden";
}


/* =========================================================
   FECHAR MODAL
========================================================= */

function closeModal(){

  $("detailModal")
    .classList
    .remove("open");


  $("detailModal")
    .setAttribute(
      "aria-hidden",
      "true"
    );


  document.body.style.overflow =
    "";
}


/* =========================================================
   CONCLUIR DIA
========================================================= */

function completeCurrentDay(){

  localStorage.setItem(
    doneKey(currentDay),
    "true"
  );

  updateProgress();

  renderRails();

  renderDayGrid();

  renderFavorites();

  renderToday();


  $("completeButton").textContent =
    "✓ Dia concluído";
}


/* =========================================================
   FAVORITAR
========================================================= */

function toggleFavorite(){

  const key =
    favKey(currentDay);


  if(
    isFavorite(currentDay)
  ){

    localStorage.removeItem(
      key
    );

  }else{

    localStorage.setItem(
      key,
      "true"
    );

  }


  $("favoriteButton").textContent =
    isFavorite(currentDay)
      ? "♥ Na minha lista"
      : "♡ Minha lista";


  renderFavorites();
}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function showScreen(name){

  document
    .querySelectorAll(".screen")
    .forEach(
      s =>
        s.classList.remove(
          "active"
        )
    );


  const screen =
    $(`${name}Screen`);


  if(screen){

    screen.classList.add(
      "active"
    );

  }


  document
    .querySelectorAll(
      ".nav-item"
    )
    .forEach(
      b =>
        b.classList.toggle(
          "active",
          b.dataset.action === name
        )
    );


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}


/* =========================================================
   BUSCA
========================================================= */

function openSearch(){

  $("searchOverlay")
    .classList
    .add("open");


  $("searchInput").value =
    "";


  setTimeout(
    () =>
      $("searchInput").focus(),
    100
  );
}


function closeSearch(){

  $("searchOverlay")
    .classList
    .remove("open");
}


function search(query){

  const q =
    query
      .trim()
      .toLowerCase();


  const results =
    q
      ? devotionals
          .filter(d =>
            `
              ${d.dia}
              ${d.titulo || ""}
              ${d.introducao || ""}
              ${d.reflexao || ""}
              ${d.referencia || ""}
            `
              .toLowerCase()
              .includes(q)
          )
          .slice(0,30)
      : [];


  $("searchResults").innerHTML =
    results
      .map(cardHTML)
      .join("")
      ||
      (
        q
          ? `
            <div class="empty-state">
              Nenhum encontro encontrado.
            </div>
          `
          : ""
      );


  bindCards();
}


/* =========================================================
   DIÁRIO
========================================================= */

function saveJournal(){

  localStorage.setItem(
    "general-journal",
    $("journal").value
  );


  const btn =
    document.querySelector(
      '[data-action="saveJournal"]'
    );


  if(btn){

    const old =
      btn.textContent;

    btn.textContent =
      "Salvo ✓";


    setTimeout(
      () =>
        btn.textContent =
          old,
      1400
    );
  }
}


/* =========================================================
   VINCULAR CARDS
========================================================= */

function bindCards(){

  document
    .querySelectorAll(
      "[data-open-day]"
    )
    .forEach(el => {

      el.onclick = () =>
        openDay(
          Number(
            el.dataset.openDay
          )
        );

    });
}


/* =========================================================
   AÇÕES
========================================================= */

function handleAction(action){

  if(action === "home"){

    showScreen("home");

  }

  else if(action === "journey"){

    showScreen("journey");

  }

  else if(action === "today"){

    showScreen("today");

    renderToday();

  }

  else if(action === "favorites"){

    showScreen("favorites");

    renderFavorites();

  }

  else if(action === "profile"){

    showScreen("profile");

  }

  else if(action === "journal"){

    showScreen("journal");

  }

  else if(action === "continue"){

    openDay(
      Number(
        getNextDay()?.dia ||
        1
      )
    );

  }

  else if(action === "search"){

    openSearch();

  }

  else if(action === "closeModal"){

    closeModal();

  }

  else if(action === "closeSearch"){

    closeSearch();

  }

  else if(action === "saveJournal"){

    saveJournal();

  }

}


/* =========================================================
   RENDERIZAÇÃO GERAL
========================================================= */

function renderAll(){

  renderRails();

  renderDayGrid();

  renderFavorites();

  renderToday();

  updateProgress();


  const saved =
    localStorage.getItem(
      "general-journal"
    );


  if(
    saved &&
    $("journal")
  ){

    $("journal").value =
      saved;

  }
}


/* =========================================================
   EVENTOS
========================================================= */

document.addEventListener(
  "click",
  e => {

    const actionEl =
      e.target.closest(
        "[data-action]"
      );


    if(actionEl){

      handleAction(
        actionEl.dataset.action
      );

    }

  }
);


/* =========================================================
   BOTÕES DO MODAL
========================================================= */

$("completeButton")
  .addEventListener(
    "click",
    completeCurrentDay
  );


$("favoriteButton")
  .addEventListener(
    "click",
    toggleFavorite
  );


/* =========================================================
   BUSCA
========================================================= */

$("searchInput")
  .addEventListener(
    "input",
    e =>
      search(
        e.target.value
      )
  );


/* =========================================================
   FILTROS
========================================================= */

document
  .querySelectorAll(".chip")
  .forEach(chip => {

    chip.addEventListener(
      "click",
      () => {

        document
          .querySelectorAll(".chip")
          .forEach(
            c =>
              c.classList.remove(
                "active"
              )
          );


        chip.classList.add(
          "active"
        );


        currentFilter =
          chip.dataset.filter;


        if(
          currentFilter === "all"
        ){

          renderRails();

          return;
        }


        const filtered =
          devotionals.filter(
            d => {

              const text =
                `
                  ${d.titulo || ""}
                  ${d.introducao || ""}
                  ${d.reflexao || ""}
                  ${d.pratica || ""}
                `
                  .toLowerCase();


              if(
                currentFilter ===
                "presence"
              ){

                return /presen|perceb|atenção|silên|silenc/
                  .test(text);

              }


              if(
                currentFilter ===
                "prayer"
              ){

                return /oraç|oração|orar/
                  .test(text);

              }


              if(
                currentFilter ===
                "word"
              ){

                return /palavra|bíblia|bíblico|escritura/
                  .test(text);

              }


              return true;

            }
          );


        $("todayRail").innerHTML =
          filtered
            .slice(0,12)
            .map(cardHTML)
            .join("");


        $("presenceRail").innerHTML =
          filtered
            .slice(12,24)
            .map(cardHTML)
            .join("");


        $("journeyRail").innerHTML =
          filtered
            .slice(24,38)
            .map(cardHTML)
            .join("");


        bindCards();

      }
    );

  });


/* =========================================================
   TOPBAR
========================================================= */

window.addEventListener(
  "scroll",
  () => {

    $("topbar")
      .classList
      .toggle(
        "scrolled",
        window.scrollY > 20
      );

  },
  {
    passive:true
  }
);


/* =========================================================
   FECHAR MODAL CLICANDO FORA
========================================================= */

$("detailModal")
  .addEventListener(
    "click",
    e => {

      if(
        e.target ===
        $("detailModal")
      ){

        closeModal();

      }

    }
  );


/* =========================================================
   TECLA ESC
========================================================= */

document.addEventListener(
  "keydown",
  e => {

    if(e.key === "Escape"){

      closeModal();

      closeSearch();

    }

  }
);


/* =========================================================
   INICIAR APP
========================================================= */

loadDevotionals();
