// ============================================================
// DOCE ESPÍRITO SANTO — UM AMIGO ÍNTIMO
// MOTOR EDITORIAL — VERSÃO 2.0
// ============================================================

window.MOTOR_EDITORIAL = {

  versao: "2.0",

  projeto: {
    nome: "Doce Espírito Santo",
    subtitulo: "Um Amigo Íntimo",
    dias: 365,

    duracaoMinimaMinutos: 40,
    duracaoIdealMinutos: 50,

    terminologia: {
      espiritoSanto: "Doce Espírito Santo",
      deus: "o Eterno"
    }
  },

  // ==========================================================
  // ORDEM DA JORNADA
  // ==========================================================

  principioBiblico: {

    ordem:
      "Antigo Testamento → Livros Poéticos → Profetas → Evangelhos → Atos → Cartas → Apocalipse",

    regra:
      "A jornada deve respeitar a progressão histórica e teológica das Escrituras, apresentando primeiro o contexto do Antigo Testamento e avançando progressivamente para a revelação do Novo Testamento.",

    conexoes:
      "Quando houver relação entre uma passagem do Antigo Testamento e o Novo Testamento, apresentar primeiro o contexto original da passagem e depois explicar a conexão.",

    cuidado:
      "Não criar conexões artificiais. Toda aplicação deve respeitar o contexto bíblico."
  },

  // ==========================================================
  // 12 ETAPAS DA JORNADA
  // ==========================================================

  fases: [

    {
      id: 1,
      nome: "Perceber",
      inicio: 1,
      fim: 30,
      objetivo: "Aprender a reconhecer a presença."
    },

    {
      id: 2,
      nome: "Aprofundar",
      inicio: 31,
      fim: 60,
      objetivo: "Ir além da superfície."
    },

    {
      id: 3,
      nome: "Ser Transformado",
      inicio: 61,
      fim: 90,
      objetivo: "Permitir que a presença transforme o interior."
    },

    {
      id: 4,
      nome: "Orar",
      inicio: 91,
      fim: 120,
      objetivo: "Aprender a conversar com o Eterno."
    },

    {
      id: 5,
      nome: "Ouvir",
      inicio: 121,
      fim: 150,
      objetivo: "Desenvolver silêncio, percepção e discernimento."
    },

    {
      id: 6,
      nome: "Palavra",
      inicio: 151,
      fim: 180,
      objetivo: "Aprender a permanecer nas Escrituras."
    },

    {
      id: 7,
      nome: "Jesus",
      inicio: 181,
      fim: 220,
      objetivo: "Reconhecer Cristo como centro da caminhada."
    },

    {
      id: 8,
      nome: "Direção",
      inicio: 221,
      fim: 250,
      objetivo: "Aprender a caminhar com discernimento."
    },

    {
      id: 9,
      nome: "Fruto",
      inicio: 251,
      fim: 290,
      objetivo: "Permitir que o interior apareça no exterior."
    },

    {
      id: 10,
      nome: "Servir",
      inicio: 291,
      fim: 320,
      objetivo: "Transformar presença em serviço."
    },

    {
      id: 11,
      nome: "Testemunhar",
      inicio: 321,
      fim: 345,
      objetivo: "Compartilhar aquilo que foi vivido."
    },

    {
      id: 12,
      nome: "Permanecer",
      inicio: 346,
      fim: 365,
      objetivo: "Continuar quando a jornada já virou vida."
    }

  ],

  // ==========================================================
  // ESTRUTURA DE UM DIA
  // ==========================================================

  estruturaDoDia: [

    "identificacao",

    "leituraBiblica",

    "contextoHistorico",

    "contextoLiterario",

    "contextoTeologico",

    "estudoBiblico",

    "conexoesBiblicas",

    "reflexaoProfunda",

    "perguntas",

    "aplicacaoPratica",

    "praticaEspiritual",

    "momentoDeSilencio",

    "oracao",

    "audio",

    "diario",

    "encerramento",

    "continuidade"

  ],

  // ==========================================================
  // TEMPO MÍNIMO
  // ==========================================================

  experiencia: {

    leituraBiblica: {
      minimo: 5,
      maximo: 8
    },

    contexto: {
      minimo: 5,
      maximo: 7
    },

    estudoBiblico: {
      minimo: 15,
      maximo: 20
    },

    reflexao: {
      minimo: 5,
      maximo: 7
    },

    aplicacao: {
      minimo: 3,
      maximo: 5
    },

    silencio: {
      minimo: 3,
      maximo: 10
    },

    oracao: {
      minimo: 5,
      maximo: 8
    },

    diario: {
      minimo: 2,
      maximo: 5
    }

  },

  // ==========================================================
  // ÁUDIO
  // ==========================================================

  audio: {

    habilitado: true,

    voz: {

      genero: "masculina",

      tonalidade: "grave",

      estilo: "natural",

      personalidade:
        "madura, serena, acolhedora e contemplativa",

      interpretacao:
        "humana, pausada e expressiva",

      evitar: [
        "voz robótica",
        "entonação artificial",
        "leitura acelerada",
        "voz publicitária",
        "excesso de dramatização"
      ]

    },

    controles: [
      "play",
      "pause",
      "continuar",
      "reiniciar",
      "velocidade",
      "progresso"
    ]

  },

  // ==========================================================
  // SILÊNCIO
  // ==========================================================

  silencio: {

    habilitado: true,

    duracoes: [3, 5, 10],

    mensagem:
      "Agora, não tente produzir uma experiência. Permaneça. Leia novamente. Perceba. Silencie por alguns instantes."
  },

  // ==========================================================
  // DIÁRIO
  // ==========================================================

  diario: {

    habilitado: true,

    salvarPorDia: true,

    campos: [
      "percepcao",
      "reflexao",
      "aprendizado",
      "aplicacao",
      "anotacaoLivre"
    ]

  },

  // ==========================================================
  // PROGRESSO
  // ==========================================================

  progresso: {

    registrarDiaConcluido: true,

    registrarUltimoDia: true,

    registrarFaseAtual: true,

    registrarFavoritos: true,

    registrarDiario: true,

    percentual:
      "dias concluídos / 365 * 100"

  },

  // ==========================================================
  // REGRAS EDITORIAIS
  // ==========================================================

  qualidade: {

    evitarConteudoSuperficial: true,

    evitarRepeticao: true,

    evitarVersiculosForaDoContexto: true,

    evitarFrasesGenericas: true,

    evitarOracoesIdenticas: true,

    evitarPerguntasIdenticas: true,

    exigirFundamentacaoBiblica: true,

    exigirContextoBiblico: true,

    exigirAplicacaoPratica: true,

    diferenciarTextoInterpretacaoAplicacao: true,

    regraCentral:
      "Nenhum dia deve existir apenas para preencher espaço. Cada devocional precisa possuir fundamento bíblico, contexto, interpretação responsável, reflexão, aplicação, oração e continuidade dentro da jornada."

  }

};


// ============================================================
// FUNÇÕES DO MOTOR
// ============================================================

window.encontrarFase = function(dia) {

  return window.MOTOR_EDITORIAL.fases.find(

    fase =>
      dia >= fase.inicio &&
      dia <= fase.fim

  );

};


window.obterInformacoesDoDia = function(dia) {

  const fase = window.encontrarFase(dia);

  if (!fase) return null;

  return {

    dia: dia,

    fase: fase.nome,

    objetivo: fase.objetivo,

    duracaoMinima:
      window.MOTOR_EDITORIAL.projeto.duracaoMinimaMinutos,

    duracaoIdeal:
      window.MOTOR_EDITORIAL.projeto.duracaoIdealMinutos

  };

};
