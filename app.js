/* =========================================================
   DOCE ESPÍRITO SANTO
   UM AMIGO ÍNTIMO
   Streaming Experience Engine
========================================================= */

let devotionals = [];
let currentDay = 1;
let currentFilter = "all";

const $ = (id) => document.getElementById(id);

const doneKey = (day) => `doce-day-${day}-done`;
const favKey = (day) => `doce-day-${day}-favorite`;


/* =========================================================
   UTILIDADES
========================================================= */

function escapeHTML(value){

  return String(value ?? "").replace(
    /[&<>"']/g,
    char => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    }[char])
  );

}


function normalizeText(value){

  if(Array.isArray(value)){
    return value.join(" ");
  }

  return String(value ?? "");

}


function isDone(day){

  return localStorage.getItem(doneKey(day)) === "true";

}


function isFavorite(day){

  return localStorage.getItem(favKey(day)) === "true";

}


function getDay(number){

  return devotionals.find(
    item => Number(item.dia) === Number(number)
  );

}


/* =========================================================
   CORES CINEMATOGRÁFICAS
   Cada card recebe uma atmosfera diferente
========================================================= */

const posterPalettes = [

  ["#4c3016","#120b06","#e8bb72"],
  ["#30251a","#0b0907","#d9c39a"],
  ["#563519","#100906","#f0c777"],
  ["#37261b","#0a0806","#d8b27a"],
  ["#5a3b20","#120b06","#f3d59a"],
  ["#2c241b","#090806","#c9ae7b"],
  ["#47301c","#100a06","#e7c184"],
  ["#392619","#080706","#f0cc8a"],
  ["#51341c","#0d0906","#ddb36c"],
  ["#2a2119","#080706","#e6cfaa"]
];


function getPalette(day){

  return posterPalettes[
    (Number(day) - 1) %
    posterPalettes.length
  ];

}


function getPosterStyle(day){

  const palette = getPalette(day);

  const angle =
    125 +
    ((Number(day) * 17) % 60);

  const glowX =
    25 +
    ((Number(day) * 13) % 55);

  const glowY =
    10 +
    ((Number(day) * 7) % 55);

  return `
    background:
      radial-gradient(
        circle at ${glowX}% ${glowY}%,
        ${palette[2]}55,
        transparent 22%
      ),
      radial-gradient(
        circle at 70% 75%,
        ${palette[2]}18,
        transparent 32%
      ),
      linear-gradient(
        ${angle}deg,
        ${palette[0]},
        ${palette[1]} 72%
      );
  `;

}


function getFeatherRotation(day){

  const rotations = [
    "-22deg",
    "-12deg",
    "8deg",
    "18deg",
    "-30deg",
    "24deg",
    "-5deg"
  ];

  return rotations[
    (Number(day)-1) %
    rotations.length
  ];

}


/* =========================================================
   POSTER VISUAL
========================================================= */

function posterArt(day){

  const n = Number(day);

  return `
    <div
      class="generated-poster-art"
      style="
        position:absolute;
        inset:0;
        overflow:hidden;
        ${getPosterStyle(n)}
      "
    >

      <div
        style="
          position:absolute;
          width:80px;
          height:80px;
          right:-15px;
          top:20px;
          border-radius:50%;
          background:rgba(255,221,163,.13);
          filter:blur(18px);
        "
      ></div>

      <div
        style="
          position:absolute;
          width:120px;
          height:1px;
          left:12px;
          top:39px;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(245,210,145,.55),
              transparent
            );
        "
      ></div>

      <div
        style="
          position:absolute;
          width:55px;
          height:55px;
          left:50%;
          top:51%;
          transform:
            translate(-50%,-50%)
            rotate(${getFeatherRotation(n)});
          opacity:.58;
          color:#f3d49a;
          font-size:47px;
          line-height:1;
          font-family:Georgia,serif;
          text-shadow:
            0 10px 20px rgba(0,0,0,.7);
        "
      >⌁</div>

      <div
        style="
          position:absolute;
          left:0;
          right:0;
          bottom:0;
          height:65%;
          background:
            linear-gradient(
              180deg,
              transparent,
              rgba(0,0,0,.75)
            );
        "
      ></div>

    </div>
  `;

}


/* =========================================================
   CARDS
========================================================= */

function cardHTML(day){

  const n = Number(day.dia);

  const title =
    day.titulo ||
    `Encontro do Dia ${n}`;

  const done =
    isDone(n);

  return `

    <button
      class="dev-card ${done ? "done" : ""}"
      data-open-day="${n}"
      aria-label="Abrir Dia ${n}: ${escapeHTML(title)}"
    >

      ${posterArt(n)}

      <div class="dev-card-content">

        <div class="dev-card-day">
          DIA ${String(n).padStart(2,"0")}
        </div>

        <h3>
          ${escapeHTML(title)}
        </h3>

      </div>

    </button>

  `;

}


/* =========================================================
   TOP 10
========================================================= */

function topTenHTML(day,index){

  const n = Number(day.dia);

  return `

    <button
      class="top-ten-item"
      data-open-day="${n}"
      aria-label="Top ${index + 1}"
    >

      <div class="top-ten-number">
        ${index + 1}
      </div>

      <div
        class="top-ten-poster"
        style="${getPosterStyle(n)}"
      >

        <div
          style="
            position:absolute;
            inset:0;
            background:
              radial-gradient(
                circle at 65% 20%,
                rgba(255,224,165,.22),
                transparent 24%
              ),
              linear-gradient(
                180deg,
                transparent 25%,
                rgba(0,0,0,.8)
              );
          "
        ></div>

        <div
          style="
            position:absolute;
            left:11px;
            right:11px;
            bottom:11px;
            z-index:5;
          "
        >

          <small
            style="
              color:#f1d39a;
              font-size:7px;
              letter-spacing:1.5px;
            "
          >
            DIA ${String(n).padStart(2,"0")}
          </small>

          <strong
            style="
              display:block;
              margin-top:4px;
              color:#fff8ef;
              font-family:Georgia,serif;
              font-size:14px;
              line-height:1.05;
            "
          >
            ${escapeHTML(
              day.titulo ||
              "Um novo encontro"
            )}
          </strong>

        </div>

      </div>

    </button>

  `;

}


/* =========================================================
   PROGRESSO
========================================================= */

function countDone(){

  let total = 0;

  devotionals.forEach(day => {

    if(isDone(Number(day.dia))){
      total++;
    }

  });

  return total;

}


function updateProgress(){

  const done =
    countDone();

  const total =
    Math.max(
      365,
      devotionals.length
    );

  const percent =
    Math.min(
      100,
      (done / total) * 100
    );


  if($("progressLabel")){
    $("progressLabel").textContent =
      `${done} / ${total}`;
  }


  if($("progressFill")){
    $("progressFill").style.width =
      `${percent}%`;
  }


  if($("journeyDone")){
    $("journeyDone").textContent =
      done;
  }


  if($("journeyPercent")){
    $("journeyPercent").textContent =
      `${Math.round(percent)}%`;
  }


  if($("profileProgress")){
    $("profileProgress").textContent =
      `${done} / ${total}`;
  }


  if($("profileProgressFill")){
    $("profileProgressFill").style.width =
      `${percent}%`;
  }


  if($("heroProgressFill")){
    $("heroProgressFill").style.width =
      `${percent}%`;
  }


  if($("heroProgressLabel")){
    $("heroProgressLabel").textContent =
      `${done} de ${total} dias`;
  }

}


/* =========================================================
   PRÓXIMO DIA
========================================================= */

function getNextDay(){

  const unfinished =
    devotionals.find(
      day =>
        !isDone(Number(day.dia))
    );

  return unfinished ||
         devotionals[0] ||
         null;

}


/* =========================================================
   RAILS
========================================================= */

function renderRails(){

  const next =
    getNextDay();


  /* CONTINUE */

  if(next){

    const n =
      Number(next.dia);

    if($("continueNumber")){
      $("continueNumber").textContent =
        String(n).padStart(2,"0");
    }

    if($("continueTitle")){
      $("continueTitle").textContent =
        next.titulo ||
        `Dia ${n}`;
    }

    if($("continueIntro")){
      $("continueIntro").textContent =
        next.introducao ||
        "Continue sua caminhada.";
    }

  }


  /* PARA HOJE */

  const todayItems =
    devotionals.slice(
      Math.max(
        0,
        (next ? Number(next.dia)-1 : 0)
      ),
      Math.max(
        0,
        (next ? Number(next.dia)-1 : 0)
      ) + 10
    );

  if($("todayRail")){

    $("todayRail").innerHTML =
      todayItems
        .map(cardHTML)
        .join("");

  }


  /* PRESENÇA */

  const presence =
    devotionals.filter(
      day => {

        const text =
          (
            normalizeText(day.titulo) +
            " " +
            normalizeText(day.introducao) +
            " " +
            normalizeText(day.reflexao) +
            " " +
            normalizeText(day.pratica)
          ).toLowerCase();

        return (
          text.includes("presença") ||
          text.includes("presenca") ||
          text.includes("perceb") ||
          text.includes("silêncio") ||
          text.includes("silencio") ||
          text.includes("atenção") ||
          text.includes("atencao")
        );

      }
    );


  if($("presenceRail")){

    $("presenceRail").innerHTML =
      (
        presence.length
          ? presence
          : devotionals
      )
      .slice(0,10)
      .map(cardHTML)
      .join("");

  }


  /* JORNADA */

  if($("journeyRail")){

    $("journeyRail").innerHTML =
      devotionals
        .slice(0,14)
        .map(cardHTML)
        .join("");

  }


  /* TOP 10 */

  const topTen =
    [...devotionals]
      .sort(
        (a,b) =>
          Number(a.dia) -
          Number(b.dia)
      )
      .slice(0,10);


  if($("topTenRail")){

    $("topTenRail").innerHTML =
      topTen
        .map(
          (day,index) =>
            topTenHTML(day,index)
        )
        .join("");

  }


  bindCards();

}


/* =========================================================
   GRID DOS 365 DIAS
========================================================= */

function renderDayGrid(){

  if(!$("dayGrid")) return;

  $("dayGrid").innerHTML =
    devotionals
      .map(day => {

        const n =
          Number(day.dia);

        return `

          <button
            class="
              day-tile
              ${isDone(n) ? "done" : ""}
            "
            data-open-day="${n}"
          >

            <small>
              DIA ${String(n).padStart(2,"0")}
            </small>

            <strong>
              ${escapeHTML(
                day.titulo ||
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

  if(!$("favoritesRail"))
    return;


  const favorites =
    devotionals.filter(
      day =>
        isFavorite(
          Number(day.dia)
        )
    );


  $("favoritesRail").innerHTML =
    favorites
      .map(cardHTML)
      .join("");


  if($("favoritesEmpty")){

    $("favoritesEmpty").style.display =
      favorites.length
        ? "none"
        : "block";

  }


  bindCards();

}


/* =========================================================
   TELA HOJE
========================================================= */

function renderToday(){

  if(!$("todayDetail"))
    return;


  const day =
    getNextDay();


  if(!day)
    return;


  const n =
    Number(day.dia);


  $("todayDetail").innerHTML = `

    <button
      class="continue-card"
      data-open-day="${n}"
    >

      <div class="continue-art">

        <div class="continue-orb"></div>

        <div class="continue-feather">
          ⌁
        </div>

        <div class="continue-number">
          DIA ${String(n).padStart(2,"0")}
        </div>

      </div>

      <div class="continue-copy">

        <span class="continue-label">
          SEU PRÓXIMO ENCONTRO
        </span>

        <h3>
          ${escapeHTML(
            day.titulo ||
            `Dia ${n}`
          )}
        </h3>

        <p>
          ${escapeHTML(
            day.introducao ||
            "Continue sua caminhada."
          )}
        </p>

      </div>

      <div class="continue-arrow">
        ›
      </div>

    </button>


    <div style="padding:18px">

      <div
        class="detail-block"
        style="
          border-top:0;
          margin-top:0;
        "
      >

        <span>
          REFERÊNCIA
        </span>

        <p>
          ${escapeHTML(
            day.referencia ||
            day.biblia ||
            ""
          )}
        </p>

      </div>


      <div class="detail-block">

        <span>
          PRÁTICA DE PRESENÇA
        </span>

        <p>
          ${escapeHTML(
            day.pratica ||
            ""
          )}
        </p>

      </div>


      <button
        class="primary-cta wide"
        data-open-day="${n}"
      >

        <span class="play-icon">
          ▶
        </span>

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


  if(!day)
    return;


  currentDay =
    Number(day.dia);


  if($("detailDay")){

    $("detailDay").textContent =
      `DIA ${String(currentDay).padStart(2,"0")}`;

  }


  if($("detailRef")){

    $("detailRef").textContent =
      day.referencia ||
      day.biblia ||
      "";

  }


  if($("detailTitle")){

    $("detailTitle").textContent =
      day.titulo ||
      "";

  }


  if($("detailIntro")){

    $("detailIntro").textContent =
      day.introducao ||
      "";

  }


  if($("detailPractice")){

    $("detailPractice").textContent =
      day.pratica ||
      "";

  }


  if($("detailQuestion")){

    $("detailQuestion").textContent =
      day.pergunta ||
      "";

  }


  if($("detailPrayer")){

    $("detailPrayer").textContent =
      day.oracao ||
      "";

  }


  /* REFLEXÃO */

  if($("detailReflection")){

    const reflection =
      day.reflexao ||
      "";

    const paragraphs =
      Array.isArray(reflection)
        ? reflection
        : String(reflection)
            .split(/\n+/);


    $("detailReflection").innerHTML =
      paragraphs
        .filter(Boolean)
        .map(
          paragraph =>
            `<p>${escapeHTML(paragraph)}</p>`
        )
        .join("");

  }


  /* BOTÃO FAVORITO */

  if($("favoriteButton")){

    $("favoriteButton").textContent =
      isFavorite(currentDay)
        ? "♥ Na minha lista"
        : "♡ Minha lista";

  }


  /* BOTÃO CONCLUSÃO */

  if($("completeButton")){

    $("completeButton").textContent =
      isDone(currentDay)
        ? "✓ Dia concluído"
        : "✓ Concluir este dia";

  }


  /* MODAL */

  if($("detailModal")){

    $("detailModal").classList.add("open");

    $("detailModal").setAttribute(
      "aria-hidden",
      "false"
    );

  }


  document.body.style.overflow =
    "hidden";

}


/* =========================================================
   FECHAR MODAL
========================================================= */

function closeModal(){

  if(!$("detailModal"))
    return;


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
   CONCLUIR
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


  if($("completeButton")){

    $("completeButton").textContent =
      "✓ Dia concluído";

  }

}


/* =========================================================
   FAVORITO
========================================================= */

function toggleFavorite(){

  const key =
    favKey(currentDay);


  if(
    isFavorite(currentDay)
  ){

    localStorage.removeItem(key);

  }else{

    localStorage.setItem(
      key,
      "true"
    );

  }


  if($("favoriteButton")){

    $("favoriteButton").textContent =
      isFavorite(currentDay)
        ? "♥ Na minha lista"
        : "♡ Minha lista";

  }


  renderFavorites();

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function showScreen(name){

  document
    .querySelectorAll(".screen")
    .forEach(
      screen =>
        screen.classList.remove(
          "active"
        )
    );


  const target =
    $(`${name}Screen`);


  if(target){

    target.classList.add(
      "active"
    );

  }


  document
    .querySelectorAll(".nav-item")
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.action === name
        );

      }
    );


  window.scrollTo({
    top:0,
    behavior:"smooth"
  });


  if(name === "today"){
    renderToday();
  }


  if(name === "favorites"){
    renderFavorites();
  }

}


/* =========================================================
   BUSCA
========================================================= */

function openSearch(){

  if(!$("searchOverlay"))
    return;


  $("searchOverlay")
    .classList
    .add("open");


  if($("searchInput")){

    $("searchInput").value = "";

    setTimeout(
      () =>
        $("searchInput").focus(),
      100
    );

  }

}


function closeSearch(){

  if(!$("searchOverlay"))
    return;


  $("searchOverlay")
    .classList
    .remove("open");

}


function search(query){

  if(!$("searchResults"))
    return;


  const q =
    query
      .trim()
      .toLowerCase();


  if(!q){

    $("searchResults").innerHTML =
      "";

    return;

  }


  const results =
    devotionals
      .filter(day => {

        const text =
          [
            day.dia,
            day.titulo,
            day.introducao,
            day.reflexao,
            day.referencia,
            day.pratica,
            day.pergunta,
            day.oracao
          ]
          .map(normalizeText)
          .join(" ")
          .toLowerCase();


        return text.includes(q);

      })
      .slice(0,30);


  $("searchResults").innerHTML =
    results.length
      ? results.map(cardHTML).join("")
      : `
        <div class="empty-state">
          Nenhum encontro encontrado.
        </div>
      `;


  bindCards();

}


/* =========================================================
   DIÁRIO
========================================================= */

function saveJournal(){

  if(!$("journal"))
    return;


  localStorage.setItem(
    "doce-general-journal",
    $("journal").value
  );


  const button =
    document.querySelector(
      '[data-action="saveJournal"]'
    );


  if(button){

    const original =
      button.textContent;

    button.textContent =
      "Salvo ✓";


    setTimeout(
      () =>
        button.textContent =
          original,
      1500
    );

  }

}


/* =========================================================
   EVENTOS DOS CARDS
========================================================= */

function bindCards(){

  document
    .querySelectorAll(
      "[data-open-day]"
    )
    .forEach(element => {

      element.onclick = () => {

        const day =
          Number(
            element.dataset.openDay
          );

        openDay(day);

      };

    });

}


/* =========================================================
   AÇÕES
========================================================= */

function handleAction(action){

  switch(action){

    case "home":

      showScreen("home");

      break;


    case "journey":

      showScreen("journey");

      break;


    case "today":

      showScreen("today");

      break;


    case "favorites":

      showScreen("favorites");

      break;


    case "profile":

      showScreen("profile");

      break;


    case "journal":

      showScreen("journal");

      break;


    case "continue":

      openDay(
        Number(
          getNextDay()?.dia ||
          1
        )
      );

      break;


    case "search":

      openSearch();

      break;


    case "closeModal":

      closeModal();

      break;


    case "closeSearch":

      closeSearch();

      break;


    case "saveJournal":

      saveJournal();

      break;

  }

}


/* =========================================================
   FILTROS
========================================================= */

function applyFilter(filter){

  currentFilter =
    filter;


  const matches =
    devotionals.filter(
      day => {

        const text =
          (
            normalizeText(day.titulo) +
            " " +
            normalizeText(day.introducao) +
            " " +
            normalizeText(day.reflexao) +
            " " +
            normalizeText(day.pratica) +
            " " +
            normalizeText(day.oracao)
          )
          .toLowerCase();


        switch(filter){

          case "presence":

            return (
              text.includes("presença") ||
              text.includes("presenca") ||
              text.includes("perceb") ||
              text.includes("silêncio") ||
              text.includes("silencio") ||
              text.includes("atenção") ||
              text.includes("atencao")
            );


          case "prayer":

            return (
              text.includes("oração") ||
              text.includes("oracao") ||
              text.includes("orar") ||
              text.includes("oração")
            );


          case "word":

            return (
              text.includes("palavra") ||
              text.includes("bíblia") ||
              text.includes("biblia") ||
              text.includes("escritura") ||
              text.includes("versículo") ||
              text.includes("versiculo")
            );


          case "journey":

            return true;


          default:

            return true;

        }

      }
    );


  if(filter === "all"){

    renderRails();

    return;

  }


  if($("todayRail")){

    $("todayRail").innerHTML =
      matches
        .slice(0,12)
        .map(cardHTML)
        .join("");

  }


  if($("presenceRail")){

    $("presenceRail").innerHTML =
      matches
        .slice(12,24)
        .map(cardHTML)
        .join("");

  }


  if($("journeyRail")){

    $("journeyRail").innerHTML =
      matches
        .slice(24,38)
        .map(cardHTML)
        .join("");

  }


  bindCards();

}


/* =========================================================
   CARREGAMENTO DOS DEVOCIONAIS
========================================================= */

async function loadDevotionals(){

  try{

    const response =
      await fetch(
        `devocionais.json?v=${Date.now()}`
      );


    if(!response.ok){

      throw new Error(
        "Não foi possível carregar devocionais.json"
      );

    }


    const data =
      await response.json();


    if(Array.isArray(data)){

      devotionals =
        data;

    }

    else if(
      Array.isArray(
        data.devocionais
      )
    ){

      devotionals =
        data.devocionais;

    }

    else if(
      Array.isArray(
        data.days
      )
    ){

      devotionals =
        data.days;

    }

    else if(
      Array.isArray(
        data.dias
      )
    ){

      devotionals =
        data.dias;

    }

    else{

      throw new Error(
        "Estrutura do devocionais.json não reconhecida"
      );

    }


    devotionals =
      devotionals
        .filter(Boolean)
        .sort(
          (a,b) =>
            Number(a.dia || 0) -
            Number(b.dia || 0)
        );


    if(!devotionals.length){

      throw new Error(
        "O arquivo não possui devocionais."
      );

    }


    console.log(
      `✓ ${devotionals.length} devocionais carregados`
    );

  }

  catch(error){

    console.error(
      "Erro ao carregar devocionais:",
      error
    );


    /*
      Não vamos inventar 365 conteúdos.
      Se o JSON não carregar, mostramos
      apenas uma mensagem elegante.
    */

    devotionals = [

      {
        dia:1,

        titulo:
          "A presença que já está aqui",

        referencia:
          "João 14:16–17",

        introducao:
          "Antes de tentar encontrar alguma coisa, pare. A presença não precisa ser fabricada.",

        reflexao:
          "O Doce Espírito Santo não chega apenas quando sentimos alguma emoção extraordinária. Ele já está aqui.",

        pratica:
          "Diminua o ritmo por alguns minutos e perceba conscientemente o ambiente ao seu redor.",

        pergunta:
          "O que muda em mim quando percebo que não estou sozinho?",

        oracao:
          "Doce Espírito Santo, ensina-me a perceber Tua presença."
      }

    ];

  }


  renderAll();

}


/* =========================================================
   RENDER GERAL
========================================================= */

function renderAll(){

  renderRails();

  renderDayGrid();

  renderFavorites();

  renderToday();

  updateProgress();


  const journal =
    localStorage.getItem(
      "doce-general-journal"
    );


  if(
    journal &&
    $("journal")
  ){

    $("journal").value =
      journal;

  }

}


/* =========================================================
   EVENT LISTENER GLOBAL
========================================================= */

document.addEventListener(
  "click",
  event => {

    const actionElement =
      event.target.closest(
        "[data-action]"
      );


    if(
      actionElement
    ){

      handleAction(
        actionElement.dataset.action
      );

    }

  }
);


/* =========================================================
   BOTÕES DO MODAL
========================================================= */

if($("completeButton")){

  $("completeButton")
    .addEventListener(
      "click",
      completeCurrentDay
    );

}


if($("favoriteButton")){

  $("favoriteButton")
    .addEventListener(
      "click",
      toggleFavorite
    );

}


/* =========================================================
   BUSCA
========================================================= */

if($("searchInput")){

  $("searchInput")
    .addEventListener(
      "input",
      event =>
        search(
          event.target.value
        )
    );

}


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
            item =>
              item.classList.remove(
                "active"
              )
          );


        chip.classList.add(
          "active"
        );


        applyFilter(
          chip.dataset.filter ||
          "all"
        );

      }
    );

  });


/* =========================================================
   SCROLL TOPBAR
========================================================= */

window.addEventListener(
  "scroll",
  () => {

    if($("topbar")){

      $("topbar")
        .classList
        .toggle(
          "scrolled",
          window.scrollY > 25
        );

    }

  },
  {
    passive:true
  }
);


/* =========================================================
   ESC PARA FECHAR
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if(event.key === "Escape"){

      closeModal();

      closeSearch();

    }

  }
);


/* =========================================================
   INICIAR
========================================================= */

loadDevotionals();
