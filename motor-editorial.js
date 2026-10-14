// ============================================================
// DOCE ESPÍRITO SANTO — UM AMIGO ÍNTIMO
// MOTOR EDITORIAL DA JORNADA DE 365 DIAS
// ============================================================

const MOTOR_EDITORIAL = {
  versao: "2.0",

  projeto: {
    nome: "Doce Espírito Santo",
    subtitulo: "Um Amigo Íntimo",
    dias: 365,

    objetivo:
      "Conduzir o usuário em uma jornada bíblica progressiva de percepção, aprofundamento, transformação, oração, escuta, Palavra, vida em Cristo, direção, fruto, serviço, testemunho e permanência.",

    duracaoMinimaMinutos: 40,
    duracaoIdealMinutos: 50,

    terminologia: {
      espiritoSanto: "Doce Espírito Santo",
      deus: "o Eterno"
    }
  },

  // ==========================================================
  // PRINCÍPIO BÍBLICO
  // ==========================================================

  principioBiblico: {
    ordem: "Antigo Testamento → Profetas → Evangelhos → Atos → Cartas",

    regra:
      "A jornada deve respeitar a progressão da revelação bíblica, começando no Antigo Testamento e avançando progressivamente para o Novo Testamento.",

    conexoes:
      "Quando uma passagem do Antigo Testamento possui relação com uma passagem do Novo Testamento, apresentar primeiro o contexto original e depois explicar a conexão bíblica.",

    cuidado:
      "Não forçar conexões proféticas ou tipológicas que o próprio texto bíblico não sustente."
  },

  // ==========================================================
  // FASES DA JORNADA
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
  // ESTRUTURA OBRIGATÓRIA DE CADA DEVOCIONAL
  // ==========================================================

  estruturaDoDia: {
    identificacao: [
      "dia",
      "fase",
      "titulo",
      "subtitulo",
      "objetivo",
      "duracaoEstimada"
    ],

    biblia: [
      "referenciaPrincipal",
      "textoPrincipal",
      "contextoHistorico",
      "contextoLiterario",
      "contextoTeologico",
      "passagensRelacionadas",
      "conexoesAntigoNovoTestamento"
    ],

    estudo: [
      "introducao",
      "estudoBiblico",
      "oQueOTextoDiz",
      "oQueOTextoSignifica",
      "oQueOTextoRevela",
      "oQueRevelaSobreOEtterno",
      "oQueRevelaSobreODoceEspiritoSanto",
      "oQueRevelaSobreNos"
    ],

    experiencia: [
      "reflexaoProfunda",
      "perguntas",
      "aplicacaoPratica",
      "praticaEspiritual",
      "momentoDeSilencio"
    ],

    oracao: [
      "introducaoOracao",
      "oracao",
      "roteiroAudio"
    ],

    diario: [
      "perguntaDiario",
      "campoLivre"
    ],

    continuidade: [
      "encerramento",
      "proximoDia"
    ]
  },

  // ==========================================================
  // DISTRIBUIÇÃO DA EXPERIÊNCIA DE 40–50 MINUTOS
  // ==========================================================

  experiencia: {
    leituraBiblica: {
      minimo: 5,
      maximo: 8
    },

    contexto: {
      minimo: 4,
      maximo: 6
    },

    estudoBiblico: {
      minimo: 12,
      maximo: 15
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
      personalidade: "acolhedora e madura",
      interpretacao: "humana e contemplativa",
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
    ],

    velocidades: [
      0.75,
      1,
      1.25,
      1.5
    ]
  },

  // ==========================================================
  // MOMENTO DE SILÊNCIO
  // ==========================================================

  silencio: {
    habilitado: true,

    duracoes: [
      3,
      5,
      10
    ],

    mensagem:
      "Agora, não leia. Permaneça. Não tente produzir uma experiência. Apenas perceba."
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

    percentualBaseadoEm:
      "dias concluídos / 365"
  },

  // ==========================================================
  // REGRAS DE QUALIDADE
  // ==========================================================

  qualidade: {
    evitarConteudoSuperficial: true,

    evitarRepeticao: true,

    evitarVersiculosForaDoContexto: true,

    evitarFrasesGenericas: true,

    evitarOracoesIdenticas: true,

    evitarPerguntasIdenticas: true,

    exigirFundamentacaoBiblica: true,

    diferenciarTextoInterpretacaoAplicacao: true,

    regraCentral:
      "Nenhum dia deve existir apenas para preencher espaço. Cada devocional deve possuir fundamento bíblico, propósito espiritual, desenvolvimento, experiência prática e continuidade dentro da jornada."
  }
};


// ============================================================
// FUNÇÕES DO MOTOR
// ============================================================

function encontrarFase(dia) {
  return MOTOR_EDITORIAL.fases.find(
    fase => dia >= fase.inicio && dia <= fase.fim
  );
}


function obterInformacoesDoDia(dia) {
  const fase = encontrarFase(dia);

  if (!fase) {
    return null;
  }

  return {
    dia,
    fase: fase.nome,
    objetivoDaFase: fase.objetivo,
    duracaoMinima:
      MOTOR_EDITORIAL.duracaoMinimaMinutos,
    duracaoIdeal:
      MOTOR_EDITORIAL.duracaoIdealMinutos
  };
}


// ============================================================
// NORMALIZAÇÃO DOS DEVOCIONAIS EXISTENTES
// ============================================================

function normalizarDevocional(devocional) {

  const dia = Number(devocional.dia);
  const fase = encontrarFase(dia);

  return {
    ...devocional,

    fase: fase ? fase.nome : null,

    subtitulo:
      devocional.subtitulo || "",

    objetivo:
      devocional.objetivo || "",

    duracaoEstimada:
      devocional.duracaoEstimada || 40,

    biblia: {
      referenciaPrincipal:
        devocional.referencia || "",

      textoPrincipal:
        devocional.textoPrincipal || "",

      contextoHistorico:
        devocional.contextoHistorico || "",

      contextoLiterario:
        devocional.contextoLiterario || "",

      contextoTeologico:
        devocional.contextoTeologico || "",

      passagensRelacionadas:
        devocional.passagensRelacionadas || [],

      conexoesAntigoNovoTestamento:
        devocional.conexoesAntigoNovoTestamento || ""
    },

    estudo: {
      introducao:
        devocional.introducao || "",

      estudoBiblico:
        devocional.estudoBiblico || "",

      oQueOTextoDiz:
        devocional.oQueOTextoDiz || "",

      oQueOTextoSignifica:
        devocional.oQueOTextoSignifica || "",

      oQueOTextoRevela:
        devocional.oQueOTextoRevela || "",

      oQueRevelaSobreOEtterno:
        devocional.oQueRevelaSobreOEtterno || "",

      oQueRevelaSobreODoceEspiritoSanto:
        devocional.oQueRevelaSobreODoceEspiritoSanto || "",

      oQueRevelaSobreNos:
        devocional.oQueRevelaSobreNos || ""
    },

    experiencia: {
      reflexaoProfunda:
        devocional.reflexao || "",

      perguntas:
        devocional.perguntas
          ? devocional.perguntas
          : devocional.pergunta
            ? [devocional.pergunta]
            : [],

      aplicacaoPratica:
        devocional.aplicacaoPratica || "",

      praticaEspiritual:
        devocional.pratica || "",

      momentoDeSilencio:
        devocional.momentoDeSilencio || ""
    },

    oracao: {
      introducaoOracao:
        devocional.introducaoOracao || "",

      oracao:
        devocional.oracao || "",

      roteiroAudio:
        devocional.roteiroAudio || ""
    },

    diario: {
      perguntaDiario:
        devocional.diario || "",

      campoLivre: true
    },

    continuidade: {
      encerramento:
        devocional.encerramento || "",

      proximoDia:
        dia < 365 ? dia + 1 : null
    }
  };
}


// ============================================================
// EXPORTAÇÃO
// ============================================================

if (typeof module !== "undefined") {
  module.exports = {
    MOTOR_EDITORIAL,
    encontrarFase,
    obterInformacoesDoDia,
    normalizarDevocional
  };
}
