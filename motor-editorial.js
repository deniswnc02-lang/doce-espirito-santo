/* =========================================================
   DOCE ESPÍRITO SANTO — UM AMIGO ÍNTIMO
   MOTOR EDITORIAL
   =========================================================
   
   Função:
   - Organizar a experiência de conteúdo
   - Conectar devocional + estudo + Bíblia + mapa + plano
   - Preparar a experiência de aprofundamento
   - Criar uma camada editorial independente do visual
   ========================================================= */

(() => {
  "use strict";

  const EDITORIAL = {
    nome: "Doce Espírito Santo",
    subtitulo: "Um Amigo Íntimo",

    manifesto: {
      principal: "Aprenda a percebê-lo.",
      apoio: "Ele já está aqui.",
      descricao:
        "Uma jornada de 365 dias para desenvolver presença, Palavra, oração, jejum, contemplação e intimidade com o Doce Espírito Santo."
    },

    experiencia: {
      principio:
        "Netflix na experiência; Doce Espírito Santo na identidade.",

      descoberta:
        "O usuário deve sentir que está entrando em uma biblioteca viva de conteúdo espiritual.",

      profundidade:
        "Cada tema deve poder ser contemplado, estudado, praticado e aprofundado.",

      continuidade:
        "Cada conteúdo deve conduzir naturalmente ao próximo passo."
    },

    camadas: [
      {
        id: "devocional",
        nome: "Devocional",
        descricao:
          "A experiência diária de presença, Palavra, reflexão, prática e oração."
      },

      {
        id: "biblia",
        nome: "Bíblia",
        descricao:
          "Leitura das Escrituras relacionada ao tema do dia."
      },

      {
        id: "estudo",
        nome: "Estudo",
        descricao:
          "Aprofundamento bíblico, histórico, exegético e teológico."
      },

      {
        id: "mapa",
        nome: "Mapa",
        descricao:
          "Organização visual das conexões entre conceitos e textos."
      },

      {
        id: "plano",
        nome: "Plano",
        descricao:
          "Sequências de leitura e aprofundamento."
      },

      {
        id: "oracao",
        nome: "Oração",
        descricao:
          "Momento de resposta, contemplação e comunhão."
      },

      {
        id: "diario",
        nome: "Diário",
        descricao:
          "Registro pessoal da experiência da jornada."
      }
    ],

    categorias: [
      "Presença",
      "Oração",
      "Palavra",
      "Jejum",
      "Contemplação",
      "Intimidade",
      "Discernimento",
      "Santificação",
      "Caráter",
      "Fruto",
      "Obediência",
      "Comunhão",
      "Missão",
      "Testemunho",
      "Adoração",
      "Vida diária"
    ],

    trilhas: [
      {
        id: "presenca",
        nome: "Aprenda a percebê-lo",
        descricao:
          "Uma trilha para desenvolver atenção espiritual e consciência da presença do Doce Espírito Santo.",
        categoria: "Presença"
      },

      {
        id: "oracao",
        nome: "Uma vida de oração",
        descricao:
          "Da oração mecânica à comunhão consciente.",
        categoria: "Oração"
      },

      {
        id: "palavra",
        nome: "A Palavra e a presença",
        descricao:
          "Aprender a ler a Escritura com reverência, contexto e aplicação.",
        categoria: "Palavra"
      },

      {
        id: "intimidade",
        nome: "Um Amigo Íntimo",
        descricao:
          "Uma jornada sobre relacionamento, comunhão e maturidade espiritual.",
        categoria: "Intimidade"
      },

      {
        id: "transformacao",
        nome: "Presença que transforma",
        descricao:
          "O Espírito Santo formando caráter, fruto e maturidade.",
        categoria: "Santificação"
      }
    ],

    /* =====================================================
       ESTRUTURA DE CADA EXPERIÊNCIA
       ===================================================== */

    experienciaDiaria: [
      {
        ordem: 1,
        id: "chegada",
        titulo: "Chegue",
        descricao:
          "Diminua o ritmo e perceba onde você está."
      },

      {
        ordem: 2,
        id: "palavra",
        titulo: "Leia",
        descricao:
          "Entre no texto bíblico antes de entrar na opinião."
      },

      {
        ordem: 3,
        id: "compreenda",
        titulo: "Compreenda",
        descricao:
          "Observe contexto, palavras, estrutura e sentido."
      },

      {
        ordem: 4,
        id: "contemple",
        titulo: "Contemple",
        descricao:
          "Permita que a verdade alcance a vida."
      },

      {
        ordem: 5,
        id: "pratique",
        titulo: "Pratique",
        descricao:
          "Transforme compreensão em uma atitude concreta."
      },

      {
        ordem: 6,
        id: "ore",
        titulo: "Ore",
        descricao:
          "Responda ao que foi percebido."
      },

      {
        ordem: 7,
        id: "registre",
        titulo: "Registre",
        descricao:
          "Escreva o que você percebeu."
      }
    ],

    /* =====================================================
       TEMPO DE EXPERIÊNCIA
       ===================================================== */

    tempos: {
      rapido: {
        minimo: 10,
        maximo: 20,
        nome: "Encontro breve"
      },

      completo: {
        minimo: 30,
        maximo: 45,
        nome: "Experiência completa"
      },

      profundo: {
        minimo: 45,
        maximo: 75,
        nome: "Imersão profunda"
      },

      estudo: {
        minimo: 40,
        maximo: 90,
        nome: "Estudo aprofundado"
      }
    },

    /* =====================================================
       COMANDOS EDITORIAIS
       ===================================================== */

    comandos: {

      "/estudo": {
        titulo: "Estudo",
        descricao:
          "Aprofunde o tema com contexto, exegese e teologia."
      },

      "/mapa": {
        titulo: "Mapa",
        descricao:
          "Visualize as conexões do tema."
      },

      "/bíblia": {
        titulo: "Bíblia",
        descricao:
          "Explore os textos relacionados."
      },

      "/plano": {
        titulo: "Plano",
        descricao:
          "Continue através de uma sequência de leitura."
      },

      "/oração": {
        titulo: "Oração",
        descricao:
          "Entre no momento de oração."
      },

      "/referências": {
        titulo: "Referências",
        descricao:
          "Veja as referências utilizadas no aprofundamento."
      },

      "/diário": {
        titulo: "Diário",
        descricao:
          "Registre sua experiência."
      },

      "/hoje": {
        titulo: "Hoje",
        descricao:
          "Volte para o encontro do dia."
      }
    },

    /* =====================================================
       ORDEM DE APROFUNDAMENTO
       ===================================================== */

    aprofundamento: [
      "Bíblia",
      "Contexto",
      "Exegese",
      "Teologia",
      "Contemplação",
      "Aplicação",
      "Oração",
      "Diário"
    ],

    /* =====================================================
       PRINCÍPIOS TEOLÓGICOS
       ===================================================== */

    principios: [

      "A Escritura é a referência fundamental para o conteúdo bíblico.",

      "A experiência espiritual não deve substituir a Palavra.",

      "A contemplação deve conduzir à verdade, não à mera sensação.",

      "A oração é resposta àquilo que foi compreendido e contemplado.",

      "O estudo deve respeitar contexto histórico, literário e linguístico.",

      "A aplicação deve conectar a verdade bíblica à vida cotidiana.",

      "O conteúdo deve apresentar Cristo e o Evangelho quando o texto e o tema permitirem.",

      "O Doce Espírito Santo deve ser tratado como Pessoa divina, não como uma força impessoal.",

      "A linguagem deve ser profunda sem se tornar artificialmente acadêmica.",

      "A experiência deve formar maturidade, caráter, discernimento e comunhão."
    ],

    /* =====================================================
       IDENTIDADE DE LINGUAGEM
       ===================================================== */

    linguagem: {

      nomeEspírito:
        "Doce Espírito Santo",

      nomeDeus:
        "o Eterno",

      tom: [
        "acolhedor",
        "profundo",
        "contemplativo",
        "teológico",
        "bíblico",
        "humano",
        "elegante"
      ],

      evitar: [
        "religiosês excessivo",
        "frases genéricas",
        "promessas sem fundamento bíblico",
        "sensacionalismo espiritual",
        "linguagem manipulativa",
        "experiências apresentadas como doutrina"
      ],

      buscar: [
        "clareza",
        "profundidade",
        "beleza",
        "reverência",
        "contexto",
        "aplicação",
        "contemplação"
      ]
    },

    /* =====================================================
       EXPERIÊNCIA DO USUÁRIO
       ===================================================== */

    ux: {

      inicio: {
        prioridade: [
          "Devocional de hoje",
          "Continuar jornada",
          "Práticas de presença",
          "Estudos teológicos",
          "365 dias",
          "Planos",
          "Áudio"
        ]
      },

      hoje: {
        prioridade: [
          "Texto bíblico",
          "Reflexão",
          "Prática",
          "Oração",
          "Aprofundamento"
        ]
      },

      estudo: {
        prioridade: [
          "Objetivo",
          "Texto bíblico",
          "Contexto",
          "Exegese",
          "Teologia",
          "Contemplação",
          "Aplicação",
          "Oração",
          "Bibliografia"
        ]
      }
    }
  };

  /* =========================================================
     FUNÇÕES
     ========================================================= */

  function obterTrilha(id) {
    return EDITORIAL.trilhas.find(
      trilha => trilha.id === id
    );
  }

  function obterCamada(id) {
    return EDITORIAL.camadas.find(
      camada => camada.id === id
    );
  }

  function obterComando(comando) {
    return EDITORIAL.comandos[comando];
  }

  function obterCategoria(nome) {
    return EDITORIAL.categorias.includes(nome);
  }

  function obterEstruturaDiaria() {
    return EDITORIAL.experienciaDiaria;
  }

  function obterAprofundamento() {
    return EDITORIAL.aprofundamento;
  }

  function obterTempo(tipo) {
    return EDITORIAL.tempos[tipo];
  }

  function montarContextoDevocional(devocional, estudo) {

    return {
      dia: devocional?.dia || estudo?.dia || null,

      titulo:
        devocional?.titulo ||
        estudo?.titulo ||
        "",

      referencia:
        devocional?.referencia ||
        estudo?.texto_principal?.referencia ||
        "",

      categoria:
        estudo?.categoria ||
        "Jornada",

      estudo: estudo || null,

      devocional: devocional || null,

      aprofundamentos: [
        {
          tipo: "biblia",
          titulo: "Abrir na Bíblia"
        },

        {
          tipo: "estudo",
          titulo: "Aprofundar no estudo"
        },

        {
          tipo: "mapa",
          titulo: "Ver mapa"
        },

        {
          tipo: "plano",
          titulo: "Continuar plano"
        },

        {
          tipo: "oracao",
          titulo: "Entrar em oração"
        },

        {
          tipo: "diario",
          titulo: "Escrever no diário"
        }
      ]
    };
  }

  /* =====================================================
     API GLOBAL
     ===================================================== */

  window.DoceEditorial = {

    dados: EDITORIAL,

    obterTrilha,
    obterCamada,
    obterComando,
    obterCategoria,
    obterEstruturaDiaria,
    obterAprofundamento,
    obterTempo,
    montarContextoDevocional

  };

})();
