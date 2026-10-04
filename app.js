const DEVOTIONALS = [

{
id:1,
day:1,
title:"A presença que permanece",
theme:"Presença",

verse:"“E eu pedirei ao Pai, e ele lhes dará outro Consolador para estar com vocês para sempre.” — João 14:16",

text:[
"Há presenças que chegam e vão embora. A presença do Doce Espírito Santo é diferente: Ele não está interessado apenas em visitar momentos da sua vida, mas em caminhar com você.",

"A intimidade começa quando você deixa de procurar apenas respostas e começa a perceber a companhia. Antes de falar, Ele já conhece. Antes de você entender, Ele já está presente."
],

reflection:
"Em quais momentos do seu dia você costuma agir como se estivesse sozinho?",

prayer:
"Doce Espírito Santo, ensina-me a perceber Tua presença nas pequenas coisas. Que eu não procure apenas sinais extraordinários, mas aprenda a reconhecer Tua companhia no cotidiano. Amém.",

tags:[
"presença",
"intimidade"
]

},

{
id:2,
day:2,
title:"Silêncio também é encontro",
theme:"Silêncio",

verse:"“Aquietem-se e saibam que eu sou Deus.” — Salmos 46:10",

text:[
"Nem toda resposta chega acompanhada de barulho. Existe um tipo de encontro que acontece quando a mente desacelera e o coração deixa de disputar o controle.",

"O silêncio não é ausência. Pode ser espaço. Espaço para perceber, elaborar, agradecer e ouvir com mais profundidade."
],

reflection:
"O que dentro de você precisa diminuir de volume para que possa perceber melhor o que está acontecendo?",

prayer:
"Doce Espírito Santo, ensina-me a permanecer em silêncio sem medo. Que eu encontre descanso na Tua presença e sabedoria para não preencher todo vazio com pressa. Amém.",

tags:[
"silêncio",
"escuta"
]

},

{
id:3,
day:3,
title:"Quando o coração está cansado",
theme:"Descanso",

verse:"“Venham a mim, todos os que estão cansados e sobrecarregados, e eu lhes darei descanso.” — Mateus 11:28",

text:[
"Há um cansaço que não se resolve simplesmente dormindo. É o peso de tentar sustentar tudo, responder a todos e controlar aquilo que não depende de nós.",

"Descansar também é reconhecer limites. Você não precisa provar valor o tempo inteiro."
],

reflection:
"Qual peso você está carregando que talvez não precise continuar carregando sozinho?",

prayer:
"Doce Espírito Santo, recebe aquilo que tenho tentado controlar. Dá-me discernimento para agir no que me cabe e serenidade para entregar o que não está nas minhas mãos. Amém.",

tags:[
"descanso",
"limites"
]

},

{
id:4,
day:4,
title:"Você não precisa entender tudo hoje",
theme:"Confiança",

verse:"“Confia no Senhor de todo o teu coração e não te estribes no teu próprio entendimento.” — Provérbios 3:5",

text:[
"A necessidade de entender tudo pode transformar a vida em uma tentativa permanente de antecipar o amanhã.",

"Confiar não significa abandonar a responsabilidade. Significa fazer o que está ao alcance e aceitar que algumas etapas precisam ser atravessadas antes de serem compreendidas."
],

reflection:
"Qual situação você está tentando resolver mentalmente repetidas vezes sem conseguir avançar?",

prayer:
"Doce Espírito Santo, ajuda-me a trocar a necessidade de controlar pela disposição de confiar. Dá-me coragem para viver o presente sem exigir que o futuro me conte tudo agora. Amém.",

tags:[
"confiança",
"ansiedade"
]

}

];


const STORAGE_KEY =
"doce_espirito_santo_v1";


let state =
JSON.parse(
localStorage.getItem(STORAGE_KEY) || "{}"
);


state.read =
state.read || [];


state.favorites =
state.favorites || [];


state.notes =
state.notes || {};


state.profile =
state.profile || {
name:"",
goal:"intimidade"
};


state.theme =
state.theme || "dark";


let route =
"home";


let searchTerm =
"";


function save(){

localStorage.setItem(
STORAGE_KEY,
JSON.stringify(state)
);

}


function getToday(){

const index =
(new Date().getDate() - 1)
% DEVOTIONALS.length;

return DEVOTIONALS[index];

}


function isFavorite(id){

return state.favorites.includes(id);

}


function toggleFavorite(id){

if(isFavorite(id)){

state.favorites =
state.favorites.filter(
item => item !== id
);

}else{

state.favorites.push(id);

}

save();

render();

}


function markRead(id){

if(!state.read.includes(id)){

state.read.push(id);

save();

}

}


function progress(){

return Math.round(

state.read.length /
DEVOTIONALS.length *
100

);

}


function devotionalCard(devotional){

return `

<article

class="card devotional-card"

data-open="${devotional.id}"

>

<button

class="fav"

data-fav="${devotional.id}"

>

${
isFavorite(devotional.id)
? "♥"
: "♡"
}

</button>


<span class="tag">

Dia ${devotional.day}
·
${devotional.theme}

</span>


<h3>

${devotional.title}

</h3>


<div class="meta">

${
state.read.includes(devotional.id)
? "✓ Lido · "
: ""
}

${devotional.tags
.map(tag => "#" + tag)
.join(" ")}

</div>


<p class="muted">

${devotional.text[0].slice(0,125)}…

</p>


</article>

`;

}


function renderHome(){

const today =
getToday();


return `

<section class="hero">

<span class="eyebrow">

Seu momento de hoje

</span>


<h1>

Um lugar para<br>

permanecer.

</h1>


<p class="quote">

“Não é apenas sobre ler.
É sobre perceber a presença.”

</p>


<div class="actions">

<button

class="btn"

data-open="${today.id}"

>

Abrir devocional de hoje

</button>


</div>

</section>


<div class="section-head">

<h2>

Seu caminho

</h2>


<span class="muted">

${progress()}%

</span>

</div>


<div class="progress">

<i
style="width:${progress()}%"
></i>

</div>


<div
class="grid two"
style="margin-top:13px"
>

<div class="card stat">

<b>

${state.read.length}

</b>

<span>

leituras concluídas

</span>

</div>


<div class="card stat">

<b>

${state.favorites.length}

</b>

<span>

favoritos

</span>

</div>

</div>


<div class="section-head">

<h2>

Devocional de hoje

</h2>

</div>


${devotionalCard(today)}

`;

}


function renderDevotionals(){

const filtered =
DEVOTIONALS.filter(

devotional =>

(

devotional.title +
" " +
devotional.theme +
" " +
devotional.text.join(" ") +
" " +
devotional.tags.join(" ")

)
.toLowerCase()
.includes(
searchTerm.toLowerCase()
)

);


return `

<div class="section-head">

<div>

<span class="eyebrow">

Biblioteca

</span>


<h2>

Devocionais

</h2>

</div>

</div>


<input

class="search"

id="search"

placeholder="Buscar por tema, palavra ou título…"

value="${searchTerm}"

>


<div
class="grid"
style="margin-top:16px"
>

${
filtered.length

?

filtered
.map(devotionalCard)
.join("")

:

`

<div class="empty">

<div class="big">

⌕

</div>

Nenhum devocional encontrado.

</div>

`

}

</div>

`;

}


function renderFavorites(){

const favorites =
DEVOTIONALS.filter(

devotional =>
state.favorites.includes(
devotional.id
)

);


return `

<span class="eyebrow">

Guardados

</span>


<h2>

Meus favoritos

</h2>


<div
class="grid"
style="margin-top:16px"
>

${
favorites.length

?

favorites
.map(devotionalCard)
.join("")

:

`

<div class="empty">

<div class="big">

♡

</div>

<p>

Seus favoritos aparecerão aqui.

</p>

</div>

`

}

</div>

`;

}


function renderProfile(){

return `

<div class="hero">

<span class="eyebrow">

Seu espaço

</span>


<h1>

${state.profile.name || "Amigo(a)"}

</h1>


<p class="muted">

Aqui ficam suas preferências e seu progresso.

</p>

</div>


<div class="section-head">

<h2>

Progresso

</h2>

</div>


<div class="grid two">

<div class="card stat">

<b>

${progress()}%

</b>

<span>

jornada concluída

</span>

</div>


<div class="card stat">

<b>

${state.read.length}

</b>

<span>

dias lidos

</span>

</div>

</div>


<div class="section-head">

<h2>

Perfil

</h2>

</div>


<div class="card">

<label class="muted">

Como gostaria de ser chamado?

</label>


<input

class="search"

id="nameInput"

style="margin-top:8px"

value="${state.profile.name}"

placeholder="Seu nome"

>


<div class="actions">

<button

class="btn"

id="saveProfile"

>

Salvar perfil

</button>

</div>

</div>

`;

}


function renderReader(id){

const devotional =
DEVOTIONALS.find(
item => item.id === Number(id)
);


if(!devotional){

return renderHome();

}


markRead(
devotional.id
);


return `

<article class="reader">


<button

class="btn ghost"

data-route="devotionals"

>

← Voltar

</button>


<div class="cover">

<span class="eyebrow">

Dia ${devotional.day}

·

${devotional.theme}

</span>


<h1>

${devotional.title}

</h1>


<p class="quote">

${devotional.verse}

</p>


<div
class="actions"
style="justify-content:center"
>

<button

class="btn secondary"

data-fav="${devotional.id}"

>

${
isFavorite(devotional.id)
? "♥ Favoritado"
: "♡ Favoritar"
}

</button>


<button

class="btn secondary"

id="speak"

>

Ouvir

</button>

</div>

</div>


<div class="body">

${devotional.text
.map(
text =>
`<p>${text}</p>`
)
.join("")}


<div class="reflection">

<span class="eyebrow">

Para refletir

</span>


<h3>

${devotional.reflection}

</h3>

</div>


<p class="verse">

${devotional.prayer}

</p>

</div>


<div class="section-head">

<h2>

Sua anotação

</h2>

</div>


<textarea

id="note"

placeholder="Escreva o que este momento despertou em você…"

>${state.notes[devotional.id] || ""}</textarea>


<div class="actions">

<button

class="btn"

id="saveNote"

>

Salvar anotação

</button>

</div>


</article>

`;

}


function render(){

document.documentElement
.classList.toggle(
"light",
state.theme === "light"
);


const view =
document.querySelector("#view");


if(route.startsWith("read:")){

view.innerHTML =
renderReader(
route.split(":")[1]
);

}else{

if(route === "home")
view.innerHTML =
renderHome();


if(route === "devotionals")
view.innerHTML =
renderDevotionals();


if(route === "favorites")
view.innerHTML =
renderFavorites();


if(route === "profile")
view.innerHTML =
renderProfile();

}


bindEvents();

}


function bindEvents(){

document
.querySelectorAll("[data-open]")
.forEach(button => {

button.addEventListener(
"click",
event => {

if(
event.target.closest(
"[data-fav]"
)
)return;


route =
"read:" +
button.dataset.open;


render();

}

);

});


document
.querySelectorAll("[data-fav]")
.forEach(button => {

button.addEventListener(
"click",
event => {

event.stopPropagation();

toggleFavorite(
Number(
button.dataset.fav
)
);

}

);

});


document
.querySelectorAll("[data-route]")
.forEach(button => {

button.addEventListener(
"click",
() => {

route =
button.dataset.route;

render();

}

);

});


document
.querySelector("#search")
?.addEventListener(
"input",
event => {

searchTerm =
event.target.value;

renderDevotionalsOnly();

}

);


document
.querySelector("#saveProfile")
?.addEventListener(
"click",
() => {

state.profile.name =
document.querySelector(
"#nameInput"
).value.trim();

save();

render();

}

);


document
.querySelector("#saveNote")
?.addEventListener(
"click",
() => {

const id =
Number(
route.split(":")[1]
);

state.notes[id] =
document.querySelector(
"#note"
).value;

save();

alert(
"Anotação salva."
);

}

);


document
.querySelector("#speak")
?.addEventListener(
"click",
speakCurrent
);

}


function renderDevotionalsOnly(){

document.querySelector(
"#view"
).innerHTML =
renderDevotionals();

bindEvents();

}


function speakCurrent(){

const devotional =
DEVOTIONALS.find(

item =>

item.id ===
Number(
route.split(":")[1]
)

);


if(!devotional)
return;


if(!window.speechSynthesis){

alert(
"Leitura em voz alta não disponível."
);

return;

}


speechSynthesis.cancel();


const speech =
new SpeechSynthesisUtterance(

[

devotional.title,

devotional.verse,

...devotional.text,

devotional.reflection,

devotional.prayer

].join(". ")

);


speech.lang =
"pt-BR";


speechSynthesis.speak(
speech
);

}


function toggleTheme(){

state.theme =
state.theme === "dark"
? "light"
: "dark";


save();

render();

}


document
.querySelector("#themeBtn")
.addEventListener(
"click",
toggleTheme
);


document
.querySelector("#menuBtn")
.addEventListener(
"click",
() => {

document
.querySelector("#drawer")
.classList.add(
"open"
);


document
.querySelector("#backdrop")
.classList.add(
"show"
);

}
);


document
.querySelector("#closeDrawer")
.addEventListener(
"click",
closeDrawer
);


document
.querySelector("#backdrop")
.addEventListener(
"click",
closeDrawer
);


function closeDrawer(){

document
.querySelector("#drawer")
.classList.remove(
"open"
);


document
.querySelector("#backdrop")
.classList.remove(
"show"
);

}


document
.querySelector("#resetBtn")
?.addEventListener(
"click",
() => {

if(
confirm(
"Restaurar todos os dados locais?"
)
){

localStorage.removeItem(
STORAGE_KEY
);

location.reload();

}

}
);


render();
