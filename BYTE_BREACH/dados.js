// =====================================================
// DADOS DO JOGO
// Cada termo tem: nome exibido, pista, termos parecidos
// (usados como alternativas erradas) e 3 situações.
// =====================================================

const TERMOS = {
  CPU: {
    nome: "CPU",
    pista: "Cérebro do computador, que executa as instruções dos programas.",
    confusoes: ["ULA", "UC", "RAM", "CACHE", "MICROCONTROLADOR"],
    situacoes: [
      {
        texto: "Você abre o navegador. Que componente executa as instruções desse programa?",
        explicacao: "A CPU executa as instruções de todos os programas."
      },
      {
        texto: "O PC trava em jogos e o técnico diz: \"o cérebro do computador é fraco\". Que peça trocar?",
        explicacao: "A CPU é considerada o cérebro do computador."
      },
      {
        texto: "Todo programa, do sistema ao jogo, precisa passar por qual componente para ser executado?",
        explicacao: "Sem a CPU, nenhuma instrução é executada."
      }
    ]
  },

  ULA: {
    nome: "ULA",
    pista: "Parte interna da CPU que faz os cálculos e as comparações entre valores.",
    confusoes: ["UC", "REGISTRADORES", "CPU", "CACHE"],
    situacoes: [
      {
        texto: "Na calculadora do PC você digita 25 × 4. Que parte da CPU faz a conta?",
        explicacao: "A ULA faz as operações aritméticas."
      },
      {
        texto: "Um site confere se a idade digitada é maior que 18. Que parte da CPU compara os valores?",
        explicacao: "Comparações são operações lógicas, feitas pela ULA."
      },
      {
        texto: "Uma planilha soma as notas da turma. Que parte da CPU realiza as somas?",
        explicacao: "Toda conta passa pela ULA."
      }
    ]
  },

  UC: {
    nome: "UC",
    pista: "Parte da CPU que busca, decodifica e coordena a execução das instruções.",
    confusoes: ["ULA", "REGISTRADORES", "CPU", "DMA"],
    situacoes: [
      {
        texto: "Antes da conta ser feita, alguém lê a instrução e decide qual parte vai agir. Quem?",
        explicacao: "A UC busca e decodifica as instruções."
      },
      {
        texto: "A CPU recebe a instrução \"somar\". Quem entende o pedido e manda a ULA trabalhar?",
        explicacao: "A UC coordena as outras partes da CPU."
      },
      {
        texto: "Como um maestro, quem define a ordem em que as partes da CPU trabalham?",
        explicacao: "A UC controla o fluxo de execução."
      }
    ]
  },

  REGISTRADORES: {
    nome: "Registradores",
    pista: "Pequenas memórias dentro da CPU, as mais rápidas do computador.",
    confusoes: ["CACHE", "RAM", "ULA", "UC"],
    situacoes: [
      {
        texto: "Durante a conta 25 × 4, os dois números ficam guardados por um instante dentro da CPU. Onde?",
        explicacao: "Os registradores guardam os valores em uso imediato."
      },
      {
        texto: "O resultado de uma soma precisa ficar no lugar mais rápido possível para a próxima operação. Onde?",
        explicacao: "Os registradores são as memórias mais rápidas do computador."
      },
      {
        texto: "A CPU precisa lembrar qual é a próxima instrução a executar. Onde guarda essa informação?",
        explicacao: "Num registrador chamado contador de programa."
      }
    ]
  },

  RAM: {
    nome: "RAM",
    pista: "Memória principal e volátil onde ficam os programas em execução.",
    confusoes: ["ROM", "CACHE", "MEMORIADEMASSA", "REGISTRADORES"],
    situacoes: [
      {
        texto: "Você não salva o trabalho, a luz acaba e o texto some. Onde ele estava?",
        explicacao: "A RAM é volátil: perde tudo sem energia."
      },
      {
        texto: "Com 30 abas abertas o PC fica lento, e o técnico sugere passar de 4 GB para 16 GB. De quê?",
        explicacao: "Mais RAM permite mais programas abertos ao mesmo tempo."
      },
      {
        texto: "Ao abrir um jogo, ele é copiado do SSD para uma memória mais rápida, onde roda. Qual?",
        explicacao: "Os programas em execução ficam na RAM."
      }
    ]
  },

  ROM: {
    nome: "ROM",
    pista: "Memória não volátil gravada na fábrica que, em geral, não pode ser alterada.",
    confusoes: ["RAM", "EEPROM", "FLASH", "CACHE"],
    situacoes: [
      {
        texto: "Um brinquedo eletrônico antigo traz um programa gravado na fábrica que nunca muda. Onde ele fica?",
        explicacao: "A ROM é gravada na fabricação e não é alterada."
      },
      {
        texto: "Um cartucho de videogame antigo traz o jogo gravado sem poder ser modificado. Que memória é essa?",
        explicacao: "A ROM é não volátil e fixa."
      },
      {
        texto: "As funções de uma calculadora simples vêm gravadas de fábrica num chip permanente. Qual?",
        explicacao: "A ROM guarda programas fixos."
      }
    ]
  },

  EEPROM: {
    nome: "EEPROM",
    pista: "Memória permanente que pode ser reescrita aos poucos, byte a byte, sem sair do circuito.",
    confusoes: ["FLASH", "ROM", "RAM", "CACHE"],
    situacoes: [
      {
        texto: "Um Arduino guarda o recorde de um joguinho, gravando poucos bytes, mesmo depois de desligado. Onde?",
        explicacao: "A EEPROM é não volátil e regravável byte a byte."
      },
      {
        texto: "O rádio do carro lembra as estações favoritas mesmo sem bateria. Que memória guarda isso?",
        explicacao: "Configurações pequenas costumam ficar na EEPROM."
      },
      {
        texto: "Um aparelho precisa mudar só uma configuração, sem apagar as outras, e mantê-la sem energia. Qual memória?",
        explicacao: "A EEPROM altera byte por byte."
      }
    ]
  },

  FLASH: {
    nome: "Flash",
    pista: "Memória permanente regravável em blocos, usada em pendrives e SSDs.",
    // sem MEMORIADEMASSA: o SSD usa Flash por dentro e geraria duas respostas certas
    confusoes: ["EEPROM", "ROM", "RAM"],
    situacoes: [
      {
        texto: "Você leva fotos num pendrive para a casa de um amigo. Que tecnologia guarda as fotos?",
        explicacao: "O pendrive usa memória Flash."
      },
      {
        texto: "A câmera grava fotos num cartão de memória que pode ser apagado e regravado. Que tecnologia é essa?",
        explicacao: "O cartão de memória é Flash, regravável em blocos."
      },
      {
        texto: "Você atualiza o firmware da placa-mãe, que é regravado no chip. Que memória permite isso?",
        explicacao: "A Flash é não volátil e regravável em blocos."
      }
    ]
  },

  CACHE: {
    nome: "Cache",
    pista: "Memória pequena e rápida entre a CPU e a RAM, que guarda o mais usado.",
    confusoes: ["REGISTRADORES", "RAM", "ROM", "MEMORIADEMASSA"],
    situacoes: [
      {
        texto: "A CPU usa os mesmos dados várias vezes e guarda uma cópia perto dela, para não ir até a RAM. Onde?",
        explicacao: "A cache guarda o que é mais usado."
      },
      {
        texto: "Dois processadores iguais, mas um tem 8 MB a mais de uma memória interna e é mais rápido. Qual memória?",
        explicacao: "Mais cache significa menos idas à RAM."
      },
      {
        texto: "Que memória tem níveis L1, L2 e L3 e é mais rápida que a RAM?",
        explicacao: "A cache é dividida em níveis."
      }
    ]
  },

  MEMORIADEMASSA: {
    nome: "Memória de massa",
    pista: "Onde os arquivos ficam guardados de forma permanente, como no HD e no SSD.",
    // sem FLASH: o SSD usa Flash por dentro e geraria duas respostas certas
    confusoes: ["RAM", "ROM", "CACHE"],
    situacoes: [
      {
        texto: "Você instala um jogo de 50 GB e no dia seguinte ele continua lá. Onde foi instalado?",
        explicacao: "A memória de massa guarda de forma permanente."
      },
      {
        texto: "Ao salvar um vídeo aparece \"disco cheio\". Que componente lotou?",
        explicacao: "O HD ou SSD é a memória de massa."
      },
      {
        texto: "Ao comprar um PC você compara 512 GB com 1 TB. Essa é a capacidade de qual componente?",
        explicacao: "É o armazenamento, de grande capacidade."
      }
    ]
  },

  DMA: {
    nome: "DMA",
    pista: "Recurso que transfere informações entre periféricos e RAM sem ocupar a CPU.",
    confusoes: ["CPU", "DATABUS", "ADDRESSBUS", "UC"],
    situacoes: [
      {
        texto: "Você copia um filme grande e a CPU continua livre para você jogar. Quem move os dados?",
        explicacao: "O DMA transfere dados sem ocupar a CPU."
      },
      {
        texto: "A placa de rede recebe um arquivo e grava direto na RAM, sem a CPU copiar byte a byte. Que recurso é esse?",
        explicacao: "O DMA liga o periférico direto à memória."
      },
      {
        texto: "A placa de som busca o áudio na memória continuamente, sem interromper o processador. Qual recurso?",
        explicacao: "O DMA libera a CPU para outras tarefas."
      }
    ]
  },

  ADDRESSBUS: {
    nome: "Address bus",
    pista: "Linhas por onde a CPU indica qual posição da memória quer acessar.",
    confusoes: ["DATABUS", "DMA", "UC"],
    situacoes: [
      {
        texto: "A CPU quer ler a posição 2048 da memória. Por onde ela informa essa posição?",
        explicacao: "O address bus leva o endereço."
      },
      {
        texto: "A quantidade de linhas de um barramento define quanta memória a CPU consegue acessar. Que barramento?",
        explicacao: "Mais linhas permitem mais endereços possíveis."
      },
      {
        texto: "Como um carteiro que só sabe o número da casa, mas não o conteúdo da carta. Que barramento é esse?",
        explicacao: "Ele leva só a posição, não o conteúdo."
      }
    ]
  },

  DATABUS: {
    nome: "Data bus",
    pista: "Linhas por onde o conteúdo de fato trafega entre CPU, memória e periféricos.",
    confusoes: ["ADDRESSBUS", "DMA", "CACHE"],
    situacoes: [
      {
        texto: "Depois de informada a posição, o valor guardado ali volta até a CPU. Por onde ele viaja?",
        explicacao: "O data bus transporta o conteúdo."
      },
      {
        texto: "Um barramento de 64 bits define quantos bits passam de uma vez entre a CPU e a memória. Qual barramento?",
        explicacao: "A largura do data bus define o volume por transferência."
      },
      {
        texto: "Como um caminhão que leva a carga, mas não escolhe o destino. Que barramento é esse?",
        explicacao: "Ele leva o conteúdo; o destino vem do address bus."
      }
    ]
  },

  MICROCONTROLADOR: {
    nome: "Microcontrolador",
    pista: "Chip único com CPU, memória e entradas e saídas, usado no Arduino e em eletrodomésticos.",
    confusoes: ["CPU", "DUALCORE", "QUADCORE", "ROM"],
    situacoes: [
      {
        texto: "Uma máquina de lavar precisa de um único chip barato que controle o tempo, a água e o motor. Qual?",
        explicacao: "Ele tem CPU, memória e entradas e saídas num só chip."
      },
      {
        texto: "Num Arduino, que chip lê os sensores e acende os LEDs?",
        explicacao: "O Arduino é baseado num microcontrolador."
      },
      {
        texto: "O micro-ondas, o controle remoto e o termostato têm em comum qual tipo de chip?",
        explicacao: "Aparelhos simples usam microcontroladores."
      }
    ]
  },

  DUALCORE: {
    nome: "Dual core",
    pista: "CPU com duas unidades de processamento independentes no mesmo chip.",
    confusoes: ["QUADCORE", "MICROCONTROLADOR", "CPU"],
    situacoes: [
      {
        texto: "Na loja, um notebook básico anuncia \"2 núcleos\". Como esse processador é chamado?",
        explicacao: "Dual core significa dois núcleos."
      },
      {
        texto: "Um processador roda música e navegador realmente ao mesmo tempo, um em cada um dos seus 2 núcleos. Qual tipo?",
        explicacao: "Cada núcleo executa uma tarefa em paralelo."
      },
      {
        texto: "No gerenciador de tarefas aparecem só dois gráficos de uso do processador. Qual tipo de CPU?",
        explicacao: "Um gráfico para cada núcleo."
      }
    ]
  },

  QUADCORE: {
    nome: "Quad core",
    pista: "CPU com quatro unidades de processamento independentes no mesmo chip.",
    confusoes: ["DUALCORE", "MICROCONTROLADOR", "CPU"],
    situacoes: [
      {
        texto: "Um PC gamer anuncia \"4 núcleos\". Como esse processador é chamado?",
        explicacao: "Quad core significa quatro núcleos."
      },
      {
        texto: "Um programa de edição divide o vídeo em 4 partes e processa todas ao mesmo tempo no mesmo chip. Qual CPU?",
        explicacao: "Quatro núcleos, quatro tarefas em paralelo."
      },
      {
        texto: "O dual core ficou lento para edição, e o técnico recomenda dobrar os núcleos. Qual processador comprar?",
        explicacao: "O dobro de dual é quad."
      }
    ]
  }
};
