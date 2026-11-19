// =====================================================
// BYTE BREACH — lógica do jogo
// Os termos, pistas e situações vêm de dados.js (TERMOS)
// =====================================================

// ----- Configuração -----
const COMBO_MAXIMO = 5;
const PONTOS_POR_ACERTO = 10;
const BONUS_ALTO = 5;              // acertar o vírus no terço de cima da tela
const AUMENTO_POR_ACERTO = 0.2;    // a velocidade cresce a cada acerto...
const AUMENTO_MAXIMO = 3;          // ...até este limite por onda
const DURACAO_BANNER = 4.5;        // segundos do aviso de nova onda (inclui a contagem 3, 2, 1)
const DURACAO_CONTAGEM = 3;        // últimos segundos do aviso viram a contagem

// Vírus chefe (aparece depois da onda 3)
const CHEFE_ETAPAS = 3;            // precisa de 3 termos certos
const CHEFE_VELOCIDADE = 2.2;
const CHEFE_PONTOS_POR_ETAPA = 50;
const CHEFE_BONUS_FINAL = 100;
const CHEFE_RECUO = 0.15;          // cada acerto empurra o chefe 15% da altura para cima

// velocidade = % da altura da área que o vírus desce por segundo
const ONDAS = [
  { nome: "Reconhecimento", maxVirus: 1, velocidade: 3.6, intervalo: 0, tipo: "pista" },
  { nome: "Ataque", maxVirus: 2, velocidade: 4.9, intervalo: 4, tipo: "pista" },
  { nome: "Invasão", maxVirus: 3, velocidade: 4.0, intervalo: 5, tipo: "situacao" }
];

const DIFICULDADES = {
  facil:   { nome: "Fácil",   vidas: 5, multiplicador: 0.7, descricao: "5 vidas · vírus lentos" },
  normal:  { nome: "Normal",  vidas: 3, multiplicador: 1.0, descricao: "3 vidas · velocidade padrão" },
  dificil: { nome: "Difícil", vidas: 2, multiplicador: 1.35, descricao: "2 vidas · vírus rápidos" }
};

// Grupos das opções de resposta no painel lateral (e no glossário)
const GRUPOS = [
  { nome: "Processador", termos: ["CPU", "ULA", "UC", "REGISTRADORES", "DUALCORE", "QUADCORE"] },
  { nome: "Memórias", termos: ["CACHE", "RAM", "ROM", "EEPROM", "FLASH", "MEMORIADEMASSA"] },
  { nome: "Comunicação e sistemas", termos: ["ADDRESSBUS", "DATABUS", "DMA", "MICROCONTROLADOR"] }
];

// ----- Estado da partida -----
// parado | jogando | transicao | alerta | revisao | pausa | fim
let estado = "parado";
let estadoAntesDaPausa = "jogando";
let dificuldade = lerSalvo("virus-dificuldade") || "normal";
let somLigado = lerSalvo("virus-som") !== "off";
let ondaAtual = 0;
let fila = [];           // termos que ainda vão aparecer nesta onda
let virus = [];          // vírus na tela: { termo, explicacao, el, y, velocidade, chefe? }
let vidas, pontos, combo, maiorCombo, aumento;
let perdidos;            // termos errados na partida inteira (para a revisão final)
let errosDaOnda;         // termos errados só nesta onda (para a revisão entre ondas)
let chefeCriado = false;
let chefePendente = false;
let tempoDesdeVirus = 0;
let tempoBanner = 0;
let ultimaContagem = 0;
let ultimoQuadro = 0;
let timerMensagem = null;

// ----- Elementos da página -----
const telas = {
  inicio: document.getElementById("tela-inicio"),
  jogo: document.getElementById("tela-jogo"),
  fim: document.getElementById("tela-fim")
};
const area = document.getElementById("area");
const containerVirus = document.getElementById("virus-container");
const banner = document.getElementById("banner");
const alerta = document.getElementById("alerta");
const telaPausa = document.getElementById("pausa");
const telaRevisao = document.getElementById("revisao-onda");
const glossario = document.getElementById("glossario");
const elMensagem = document.getElementById("mensagem");
const btnSom = document.getElementById("btn-som");
const elServidores = document.getElementById("servidores");

// =====================================================
// Funções auxiliares
// =====================================================

function embaralhar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function sortear(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

// localStorage pode estar bloqueado em alguns navegadores: nunca deixa o jogo quebrar
function lerSalvo(chave) {
  try { return localStorage.getItem(chave); } catch { return null; }
}

function salvar(chave, valor) {
  try { localStorage.setItem(chave, valor); } catch { /* ignora */ }
}

function recordeAtual() {
  return Number(lerSalvo(`virus-recorde-${dificuldade}`)) || 0;
}

function mostrarTela(nome) {
  Object.values(telas).forEach((tela) => tela.classList.remove("ativa"));
  telas[nome].classList.add("ativa");
}

function mostrarMensagem(titulo, detalhe, tipo) {
  elMensagem.innerHTML = "";
  const forte = document.createElement("strong");
  forte.textContent = titulo;
  elMensagem.appendChild(forte);
  if (detalhe) {
    const span = document.createElement("span");
    span.textContent = detalhe;
    elMensagem.appendChild(span);
  }
  elMensagem.className = `mensagem ${tipo}`;
  clearTimeout(timerMensagem);
  timerMensagem = setTimeout(() => {
    elMensagem.innerHTML = "";
    elMensagem.className = "mensagem";
  }, 4500);
}

// =====================================================
// Rack de servidores: um servidor para cada vida
// =====================================================

function montarServidores(quantidade) {
  elServidores.innerHTML = "";
  for (let i = 0; i < quantidade; i++) {
    const srv = document.createElement("div");
    srv.className = "servidor";
    let baias = "";
    for (let b = 0; b < 3; b++) {
      baias += `
        <div class="srv-baia">
          <span class="srv-led"></span><span class="srv-led"></span><span class="srv-led"></span>
          <span class="srv-slot"></span>
        </div>`;
    }
    srv.innerHTML = `
      <span class="srv-nome">SRV-0${i + 1}</span>
      ${baias}
      <span class="srv-status">ONLINE</span>`;
    // cada servidor pisca num ritmo diferente
    srv.style.setProperty("--atraso", `${(i * 0.37).toFixed(2)}s`);
    elServidores.appendChild(srv);
  }
}

// Os servidores da direita caem primeiro, conforme as vidas acabam
function atualizarServidores() {
  const lista = elServidores.querySelectorAll(".servidor");
  lista.forEach((srv, i) => {
    const online = i < vidas;
    srv.classList.toggle("offline", !online);
    srv.querySelector(".srv-status").textContent = online ? "ONLINE" : "OFFLINE";
  });

  const integridade = Math.max(vidas, 0) / lista.length;
  elServidores.dataset.estado =
    integridade <= 0.34 ? "critico" : integridade <= 0.67 ? "alerta" : "ok";
}

// Guarda um termo errado: entra na revisão da onda e na revisão final
function registrarErro(termo) {
  perdidos.add(termo);
  errosDaOnda.add(termo);
}

function atualizarHud() {
  const maxVidas = DIFICULDADES[dificuldade].vidas;
  atualizarServidores();
  document.getElementById("vidas").textContent =
    "❤️".repeat(Math.max(vidas, 0)) + "🖤".repeat(maxVidas - Math.max(vidas, 0));
  document.getElementById("onda").textContent = chefeCriado
    ? "👾 Vírus chefe"
    : `${ondaAtual + 1}/${ONDAS.length} · ${ONDAS[ondaAtual].nome}`;
  document.getElementById("pontos").textContent = pontos;
  document.getElementById("combo").textContent = `x${combo}`;

  const chefe = virus.find((v) => v.chefe);
  document.getElementById("restantes").textContent = chefe
    ? `👾 Chefe: etapa ${chefe.etapa + 1} de ${CHEFE_ETAPAS}`
    : `🦠 ${fila.length + virus.length} vírus restantes nesta onda`;
}

// =====================================================
// Sons (gerados pelo navegador, sem arquivos de áudio)
// =====================================================
let audio = null;

function tocar(notas) {
  if (!somLigado) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    let inicio = audio.currentTime;
    notas.forEach(([frequencia, duracao, tipo = "square"]) => {
      const osc = audio.createOscillator();
      const volume = audio.createGain();
      osc.type = tipo;
      osc.frequency.value = frequencia;
      volume.gain.setValueAtTime(0.06, inicio);
      volume.gain.exponentialRampToValueAtTime(0.001, inicio + duracao);
      osc.connect(volume).connect(audio.destination);
      osc.start(inicio);
      osc.stop(inicio + duracao);
      inicio += duracao * 0.8;
    });
  } catch { /* navegador sem áudio: segue sem som */ }
}

const SONS = {
  acerto:    () => tocar([[660, 0.08], [990, 0.12]]),
  erro:      () => tocar([[160, 0.18, "sawtooth"]]),
  dano:      () => tocar([[400, 0.12, "sawtooth"], [250, 0.12, "sawtooth"], [120, 0.25, "sawtooth"]]),
  pular:     () => tocar([[500, 0.1, "triangle"], [350, 0.15, "triangle"]]),
  onda:      () => tocar([[523, 0.1], [659, 0.1], [784, 0.18]]),
  contagem:  () => tocar([[440, 0.1, "triangle"]]),
  vai:       () => tocar([[880, 0.2, "triangle"]]),
  chefe:     () => tocar([[110, 0.3, "sawtooth"], [98, 0.3, "sawtooth"], [82, 0.5, "sawtooth"]]),
  golpe:     () => tocar([[300, 0.06], [600, 0.06], [900, 0.12]]),
  vitoria:   () => tocar([[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.35]]),
  derrota:   () => tocar([[392, 0.2, "sawtooth"], [311, 0.2, "sawtooth"], [196, 0.45, "sawtooth"]])
};

function atualizarBotaoSom() {
  btnSom.textContent = somLigado ? "🔊" : "🔇";
}

function alternarSom() {
  somLigado = !somLigado;
  salvar("virus-som", somLigado ? "on" : "off");
  atualizarBotaoSom();
}

// =====================================================
// Desenho do vírus (SVG gerado por código)
// Casco hexagonal, núcleo pulsando e pontas girando.
// Usa "currentColor": a cor muda sozinha com o CSS (normal, perigo, crítico).
// =====================================================

function pontosDoPoligono(lados, raio, giro = 0) {
  const pontos = [];
  for (let i = 0; i < lados; i++) {
    const angulo = giro + (Math.PI * 2 * i) / lados;
    pontos.push(`${(32 + Math.cos(angulo) * raio).toFixed(1)},${(32 + Math.sin(angulo) * raio).toFixed(1)}`);
  }
  return pontos.join(" ");
}

function svgVirus(pontas = 8) {
  let hastes = "";
  for (let i = 0; i < pontas; i++) {
    const angulo = (Math.PI * 2 * i) / pontas;
    const x1 = (32 + Math.cos(angulo) * 17).toFixed(1);
    const y1 = (32 + Math.sin(angulo) * 17).toFixed(1);
    const x2 = (32 + Math.cos(angulo) * 27).toFixed(1);
    const y2 = (32 + Math.sin(angulo) * 27).toFixed(1);
    hastes += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/><rect x="${x2 - 2.5}" y="${y2 - 2.5}" width="5" height="5"/>`;
  }
  return `
    <svg class="virus-svg" viewBox="0 0 64 64" aria-hidden="true">
      <g class="virus-pontas">${hastes}</g>
      <polygon class="virus-casco" points="${pontosDoPoligono(6, 19, Math.PI / 6)}"/>
      <polygon class="virus-nucleo" points="${pontosDoPoligono(6, 11)}"/>
      <circle class="virus-olho" cx="32" cy="32" r="4.5"/>
    </svg>`;
}

// Código hexadecimal aleatório para o "nome" do vírus (ex.: 0x3FA2)
function codigoHex() {
  return Math.floor(Math.random() * 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

// =====================================================
// Efeitos visuais
// =====================================================

// Centro de um vírus, em coordenadas da área do jogo
function centroDoVirus(v) {
  return {
    x: v.el.offsetLeft + v.el.offsetWidth / 2,
    y: v.el.offsetTop + v.el.offsetHeight / 2
  };
}

// Pedacinhos voando a partir de um ponto
function explosao(x, y, cor, quantidade = 16) {
  for (let i = 0; i < quantidade; i++) {
    const p = document.createElement("span");
    p.className = "particula";
    const angulo = (Math.PI * 2 * i) / quantidade + Math.random() * 0.4;
    const distancia = 40 + Math.random() * 60;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.background = cor;
    p.style.setProperty("--dx", `${Math.cos(angulo) * distancia}px`);
    p.style.setProperty("--dy", `${Math.sin(angulo) * distancia}px`);
    area.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }
}

// "+15" subindo a partir de um ponto
function pontosFlutuando(x, y, texto) {
  const el = document.createElement("span");
  el.className = "pontos-flutuando";
  el.textContent = texto;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  area.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// A área do jogo treme (ao perder vida)
function tremerTela() {
  area.classList.remove("tremendo");
  void area.offsetWidth; // reinicia a animação
  area.classList.add("tremendo");
}

// Confete caindo na tela de vitória
function confete() {
  const cores = ["#a855f7", "#ff2bd6", "#00e5ff", "#2bffb1", "#ffd23f"];
  const caixa = document.createElement("div");
  caixa.className = "confete";
  for (let i = 0; i < 90; i++) {
    const c = document.createElement("span");
    c.style.left = `${Math.random() * 100}vw`;
    c.style.background = sortear(cores);
    c.style.animationDelay = `${Math.random() * 1.5}s`;
    c.style.animationDuration = `${2.5 + Math.random() * 2}s`;
    c.style.setProperty("--giro", `${Math.random() * 720 - 360}deg`);
    caixa.appendChild(c);
  }
  document.body.appendChild(caixa);
  setTimeout(() => caixa.remove(), 5000);
}

// =====================================================
// Tela inicial: dificuldade, recorde e glossário
// =====================================================

function montarDificuldades() {
  const caixa = document.getElementById("dificuldades");
  caixa.innerHTML = "";
  Object.entries(DIFICULDADES).forEach(([chave, dif]) => {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = "dificuldade" + (chave === dificuldade ? " selecionada" : "");
    botao.innerHTML = `<strong>${dif.nome}</strong><small>${dif.descricao}</small>`;
    botao.addEventListener("click", () => {
      dificuldade = chave;
      salvar("virus-dificuldade", chave);
      montarDificuldades();
    });
    caixa.appendChild(botao);
  });

  const recorde = recordeAtual();
  document.getElementById("recorde-inicio").textContent = recorde
    ? `🏆 Seu recorde no ${DIFICULDADES[dificuldade].nome}: ${recorde} pontos`
    : `Ainda sem recorde no ${DIFICULDADES[dificuldade].nome}. Bora jogar!`;
}

// Glossário: os 16 termos com pista e explicação, por grupo
function montarGlossario() {
  const lista = document.getElementById("glossario-lista");
  lista.innerHTML = "";
  GRUPOS.forEach((grupo) => {
    const titulo = document.createElement("h3");
    titulo.textContent = grupo.nome;
    lista.appendChild(titulo);

    grupo.termos.forEach((termo) => {
      const dados = TERMOS[termo];
      const item = document.createElement("div");
      item.className = "glossario-item";

      const nome = document.createElement("strong");
      nome.textContent = dados.nome;
      const pista = document.createElement("p");
      pista.textContent = dados.pista;
      const exemplo = document.createElement("p");
      exemplo.className = "glossario-exemplo";
      exemplo.textContent = `Exemplo: ${dados.situacoes[0].texto} → ${dados.situacoes[0].explicacao}`;

      item.append(nome, pista, exemplo);
      lista.appendChild(item);
    });
  });
}

function abrirGlossario() {
  glossario.classList.remove("escondido");
}

function fecharGlossario() {
  glossario.classList.add("escondido");
}

// Monta o painel lateral com as 16 opções de resposta, separadas por grupo
function montarOpcoes() {
  const painel = document.getElementById("opcoes");
  painel.innerHTML = "";

  GRUPOS.forEach((grupo) => {
    const titulo = document.createElement("p");
    titulo.className = "grupo-titulo";
    titulo.textContent = grupo.nome;
    painel.appendChild(titulo);

    const lista = document.createElement("div");
    lista.className = "grupo-lista";
    grupo.termos.forEach((termo) => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "opcao";
      botao.textContent = TERMOS[termo].nome;
      botao.dataset.termo = termo;
      botao.addEventListener("pointerdown", (evento) => comecarArraste(evento, botao));
      lista.appendChild(botao);
    });
    painel.appendChild(lista);
  });
}

// =====================================================
// Arrastar e soltar: leve o termo até o vírus certo
// (Pointer Events: funciona com mouse e com o dedo no celular)
// =====================================================
let arraste = null;   // { termo, botao, fantasma, alvo }

function comecarArraste(evento, botao) {
  if (estado !== "jogando") return;
  evento.preventDefault();

  // "Fantasma": cópia do botão que segue o ponteiro
  const fantasma = botao.cloneNode(true);
  fantasma.className = "opcao fantasma";
  document.body.appendChild(fantasma);

  arraste = { termo: botao.dataset.termo, botao, fantasma, alvo: null };
  botao.classList.add("arrastando");
  moverArraste(evento);
}

// Qual vírus está embaixo do ponteiro?
function virusNoPonto(x, y) {
  const el = document.elementsFromPoint(x, y).find((e) => e.closest && e.closest(".virus"));
  const elVirus = el ? el.closest(".virus") : null;
  return elVirus ? virus.find((v) => v.el === elVirus) : null;
}

function moverArraste(evento) {
  if (!arraste) return;
  arraste.fantasma.style.left = `${evento.clientX}px`;
  arraste.fantasma.style.top = `${evento.clientY}px`;

  const alvo = virusNoPonto(evento.clientX, evento.clientY);
  if (arraste.alvo && arraste.alvo !== alvo) arraste.alvo.el.classList.remove("alvo");
  if (alvo) alvo.el.classList.add("alvo");
  arraste.alvo = alvo;
}

function soltarArraste(evento) {
  if (!arraste) return;
  const { termo, botao } = arraste;
  const alvo = virusNoPonto(evento.clientX, evento.clientY);
  cancelarArraste();

  // Soltou fora de um vírus, ou o jogo parou no meio do arraste: não conta
  if (!alvo || estado !== "jogando") return;

  const certo = alvo.termo === termo;
  if (certo && alvo.chefe) {
    golpeNoChefe(alvo);
  } else if (certo) {
    acertou(alvo);
  } else {
    errouArraste(termo, alvo);
  }
  atualizarHud();

  botao.classList.add(certo ? "certa" : "errada");
  setTimeout(() => botao.classList.remove("certa", "errada"), 450);
}

function cancelarArraste() {
  if (!arraste) return;
  arraste.fantasma.remove();
  arraste.botao.classList.remove("arrastando");
  if (arraste.alvo) arraste.alvo.el.classList.remove("alvo");
  arraste = null;
}

// Soltou o termo no vírus errado: ensina o que aquele termo realmente é
function errouArraste(termo, alvo) {
  combo = 1;
  SONS.erro();
  registrarErro(alvo.termo);

  // o vírus "rejeita" o termo e treme
  alvo.el.classList.remove("rejeitou");
  void alvo.el.offsetWidth;
  alvo.el.classList.add("rejeitou");

  mostrarMensagem(
    `⚠️ ${TERMOS[termo].nome} não é a resposta desse vírus.`,
    `Lembre: ${TERMOS[termo].pista}`,
    "aviso"
  );
}

document.addEventListener("pointermove", moverArraste);
document.addEventListener("pointerup", soltarArraste);
document.addEventListener("pointercancel", cancelarArraste);

// =====================================================
// Fluxo do jogo
// =====================================================

function iniciarJogo() {
  vidas = DIFICULDADES[dificuldade].vidas;
  montarServidores(vidas);
  pontos = 0;
  combo = 1;
  maiorCombo = 1;
  perdidos = new Set();
  errosDaOnda = new Set();
  chefeCriado = false;
  chefePendente = false;
  limparVirus();
  [alerta, telaPausa, telaRevisao].forEach((el) => el.classList.add("escondido"));
  elMensagem.innerHTML = "";
  elMensagem.className = "mensagem";

  mostrarTela("jogo");
  comecarOnda(0);

  ultimoQuadro = performance.now();
  requestAnimationFrame(quadro);
}

function comecarOnda(indice) {
  ondaAtual = indice;
  aumento = 0;
  tempoDesdeVirus = 0;
  errosDaOnda = new Set();

  // As 16 palavras em toda onda. Os termos já errados vêm primeiro, para treinar mais.
  const errados = embaralhar([...perdidos]);
  const outros = embaralhar(Object.keys(TERMOS).filter((t) => !perdidos.has(t)));
  fila = [...errados, ...outros];

  const onda = ONDAS[indice];
  mostrarBanner(`Onda ${indice + 1}: ${onda.nome}`, descricaoOnda(onda));
  SONS.onda();
  atualizarHud();
}

function descricaoOnda(onda) {
  const quantos = onda.maxVirus === 1 ? "1 vírus por vez" : `até ${onda.maxVirus} vírus ao mesmo tempo`;
  const conteudo = onda.tipo === "situacao" ? "situações do dia a dia" : "pistas";
  return `${quantos} · ${conteudo}`;
}

// Aviso no meio da tela, com contagem 3, 2, 1 no final
function mostrarBanner(titulo, descricao) {
  banner.innerHTML = "";
  const t = document.createElement("span");
  t.textContent = titulo;
  const d = document.createElement("small");
  d.textContent = descricao;
  const contagem = document.createElement("span");
  contagem.className = "contagem";
  banner.append(t, d, contagem);
  banner.classList.remove("escondido");

  tempoBanner = DURACAO_BANNER;
  ultimaContagem = 0;
  estado = "transicao";
}

function atualizarContagem() {
  const elContagem = banner.querySelector(".contagem");
  if (tempoBanner > DURACAO_CONTAGEM) return;

  const numero = Math.ceil(tempoBanner);
  if (numero !== ultimaContagem && numero > 0) {
    ultimaContagem = numero;
    elContagem.textContent = numero;
    elContagem.classList.remove("pulso");
    void elContagem.offsetWidth;
    elContagem.classList.add("pulso");
    SONS.contagem();
  }
}

// Laço principal: roda a cada quadro de animação
function quadro(agora) {
  if (estado === "fim" || estado === "parado") return;

  // segundos desde o último quadro (limitado para não "pular" ao trocar de aba)
  const dt = Math.min((agora - ultimoQuadro) / 1000, 0.1);
  ultimoQuadro = agora;

  if (estado === "transicao") {
    tempoBanner -= dt;
    atualizarContagem();
    if (tempoBanner <= 0) {
      banner.classList.add("escondido");
      SONS.vai();
      estado = "jogando";
    }
  } else if (estado === "jogando") {
    atualizar(dt);
  }

  requestAnimationFrame(quadro);
}

function atualizar(dt) {
  const onda = ONDAS[ondaAtual];
  const altura = area.clientHeight;
  const alturaServidores = elServidores.offsetHeight;

  if (chefePendente) {
    chefePendente = false;
    criarChefe();
  }

  // Cria um novo vírus quando houver espaço
  tempoDesdeVirus += dt;
  const podeCriar = virus.length === 0 || tempoDesdeVirus >= onda.intervalo;
  if (fila.length > 0 && virus.length < onda.maxVirus && podeCriar) {
    criarVirus(fila.shift());
    tempoDesdeVirus = 0;
  }

  // Move os vírus para baixo
  for (const v of virus) {
    v.y += (v.velocidade / 100) * altura * dt;
    v.el.style.top = `${v.y}px`;

    // Muda de cor conforme se aproxima dos servidores
    const limite = altura - alturaServidores - v.el.offsetHeight;
    const perto = v.y / limite;
    v.el.classList.toggle("perigo", perto > 0.5 && perto <= 0.75);
    v.el.classList.toggle("critico", perto > 0.75);

    if (v.y >= limite) {
      virusChegouNaCpu(v);
      return;
    }
  }

  // Onda limpa?
  if (fila.length === 0 && virus.length === 0) {
    terminarOnda();
  }
}

// Fim de uma onda: revisão (se errou algo), depois próxima onda, chefe ou vitória
function terminarOnda() {
  if (chefeCriado) {
    fimDeJogo(true);
  } else if (errosDaOnda.size > 0) {
    mostrarRevisaoDaOnda();
  } else {
    avancar();
  }
}

function avancar() {
  telaRevisao.classList.add("escondido");
  if (ondaAtual < ONDAS.length - 1) {
    comecarOnda(ondaAtual + 1);
  } else {
    iniciarChefe();
  }
}

// ----- Revisão entre ondas -----
function mostrarRevisaoDaOnda() {
  const lista = document.getElementById("revisao-lista");
  lista.innerHTML = "";
  errosDaOnda.forEach((termo) => {
    const item = document.createElement("li");
    const nome = document.createElement("strong");
    nome.textContent = TERMOS[termo].nome;
    const pista = document.createElement("span");
    pista.textContent = TERMOS[termo].pista;
    item.append(nome, pista);
    lista.appendChild(item);
  });

  const proximo = ondaAtual < ONDAS.length - 1
    ? `Começar onda ${ondaAtual + 2} (Enter)`
    : "Enfrentar o vírus chefe (Enter)";
  document.getElementById("btn-proxima-onda").textContent = proximo;

  telaRevisao.classList.remove("escondido");
  estado = "revisao";
}

function criarVirus(termo) {
  const onda = ONDAS[ondaAtual];
  const dados = TERMOS[termo];

  let texto, explicacao;
  if (onda.tipo === "situacao") {
    const situacao = sortear(dados.situacoes);
    texto = situacao.texto;
    explicacao = situacao.explicacao;
  } else {
    texto = dados.pista;
    // nas ondas de pista, a explicação traz um fato novo (de uma situação)
    explicacao = sortear(dados.situacoes).explicacao;
  }

  const el = document.createElement("div");
  el.className = "virus";
  el.innerHTML = `
    <div class="virus-icone">${svgVirus()}</div>
    <div class="virus-corpo">
      <span class="virus-id">VIRUS.EXE // 0x${codigoHex()}</span>
      <p class="virus-texto"></p>
    </div>`;
  el.querySelector(".virus-texto").textContent = texto;
  containerVirus.appendChild(el);

  // posição horizontal sorteada, sempre dentro da área
  const espaco = Math.max(area.clientWidth - el.offsetWidth - 16, 0);
  el.style.left = `${8 + Math.random() * espaco}px`;
  el.style.top = "0px";

  const multiplicador = DIFICULDADES[dificuldade].multiplicador;
  virus.push({
    termo,
    explicacao,
    el,
    y: 0,
    velocidade: (onda.velocidade + aumento) * multiplicador
  });
  atualizarHud();
}

function removerVirus(v, explodir) {
  virus = virus.filter((outro) => outro !== v);
  if (explodir) {
    v.el.classList.add("explodindo");
    setTimeout(() => v.el.remove(), 350);
  } else {
    v.el.remove();
  }
}

function limparVirus() {
  virus.forEach((v) => v.el.remove());
  virus = [];
}

function virusMaisBaixo() {
  return [...virus].sort((a, b) => b.y - a.y)[0];
}

function acertou(v) {
  const noAlto = v.y < area.clientHeight / 3;
  const ganho = PONTOS_POR_ACERTO * combo + (noAlto ? BONUS_ALTO : 0);

  pontos += ganho;
  combo = Math.min(combo + 1, COMBO_MAXIMO);
  maiorCombo = Math.max(maiorCombo, combo);
  aumento = Math.min(aumento + AUMENTO_POR_ACERTO, AUMENTO_MAXIMO);

  const { x, y } = centroDoVirus(v);
  explosao(x, y, "#2bffb1");
  pontosFlutuando(x, y, `+${ganho}`);

  removerVirus(v, true);
  SONS.acerto();
  const extra = noAlto ? " ⚡ bônus por rapidez!" : "";
  // Mostra também a explicação: aprende mesmo quando acerta
  mostrarMensagem(`✅ ${TERMOS[v.termo].nome}! +${ganho}${extra}`, v.explicacao, "certo");
}

// =====================================================
// Vírus chefe: 3 situações seguidas, um termo certo por vez
// =====================================================

function iniciarChefe() {
  chefeCriado = true;
  chefePendente = true;
  mostrarBanner("👾 Vírus chefe!", `Acerte ${CHEFE_ETAPAS} termos seguidos para destruí-lo`);
  SONS.chefe();
  atualizarHud();
}

function criarChefe() {
  // Prefere os termos que o jogador mais errou
  const errados = embaralhar([...perdidos]);
  const outros = embaralhar(Object.keys(TERMOS).filter((t) => !perdidos.has(t)));
  const termos = [...errados, ...outros].slice(0, CHEFE_ETAPAS);
  const situacoes = termos.map((t) => sortear(TERMOS[t].situacoes));

  const el = document.createElement("div");
  el.className = "virus chefe";
  el.innerHTML = `
    <div class="virus-icone">${svgVirus(12)}</div>
    <div class="virus-corpo">
      <span class="virus-id">TROJAN.BOSS // 0x${codigoHex()}</span>
      <div class="chefe-vida"></div>
      <p class="virus-texto chefe-texto"></p>
    </div>`;
  containerVirus.appendChild(el);
  el.style.left = `${Math.max((area.clientWidth - el.offsetWidth) / 2, 8)}px`;
  el.style.top = "0px";

  const chefe = {
    chefe: true,
    termos,
    situacoes,
    etapa: 0,
    termo: termos[0],
    explicacao: situacoes[0].explicacao,
    el,
    y: 0,
    velocidade: CHEFE_VELOCIDADE * DIFICULDADES[dificuldade].multiplicador
  };
  virus.push(chefe);
  desenharChefe(chefe);
  atualizarHud();
}

function desenharChefe(chefe) {
  const vida = chefe.el.querySelector(".chefe-vida");
  vida.innerHTML = "";
  for (let i = 0; i < CHEFE_ETAPAS; i++) {
    const bloco = document.createElement("span");
    if (i < chefe.etapa) bloco.className = "perdida";
    vida.appendChild(bloco);
  }
  chefe.el.querySelector(".chefe-texto").textContent = chefe.situacoes[chefe.etapa].texto;
}

// Avança o chefe para a próxima etapa. Retorna true se ele foi destruído.
function avancarChefe(chefe) {
  chefe.etapa++;
  if (chefe.etapa >= CHEFE_ETAPAS) {
    const { x, y } = centroDoVirus(chefe);
    explosao(x, y, "#ff2bd6", 40);
    removerVirus(chefe, true);
    return true;
  }
  chefe.termo = chefe.termos[chefe.etapa];
  chefe.explicacao = chefe.situacoes[chefe.etapa].explicacao;
  // cada golpe empurra o chefe para cima
  chefe.y = Math.max(chefe.y - area.clientHeight * CHEFE_RECUO, 0);
  desenharChefe(chefe);
  return false;
}

function golpeNoChefe(chefe) {
  const termoAcertado = chefe.termo;
  const explicacao = chefe.explicacao;
  const { x, y } = centroDoVirus(chefe);

  let ganho = CHEFE_PONTOS_POR_ETAPA * combo;
  combo = Math.min(combo + 1, COMBO_MAXIMO);
  maiorCombo = Math.max(maiorCombo, combo);

  explosao(x, y, "#2bffb1");
  const destruido = avancarChefe(chefe);
  if (destruido) ganho += CHEFE_BONUS_FINAL;
  pontos += ganho;
  pontosFlutuando(x, y, `+${ganho}`);
  SONS.golpe();

  const titulo = destruido
    ? `💥 Vírus chefe destruído! +${ganho}`
    : `✅ ${TERMOS[termoAcertado].nome}! Golpe no chefe! +${ganho}`;
  mostrarMensagem(titulo, explicacao, "certo");
}

// ----- Pular: mostra a resposta do vírus mais baixo, sem perder vida -----
function pular() {
  if (estado !== "jogando" || virus.length === 0) return;
  const v = virusMaisBaixo();

  combo = 1;
  registrarErro(v.termo);
  SONS.pular();

  if (v.chefe) {
    // Mostra a resposta desta etapa e passa para a próxima, sem pontos
    mostrarAlerta("⏭ Você pulou esta etapa do chefe", v);
    avancarChefe(v);
  } else {
    removerVirus(v, false);
    fila.push(v.termo); // volta no fim da onda
    mostrarAlerta("⏭ Você pulou este vírus", v);
  }
  atualizarHud();
}

// ----- Vírus chegou aos servidores: derruba um -----
function virusChegouNaCpu(v) {
  vidas--;
  combo = 1;
  registrarErro(v.termo);

  if (v.chefe) {
    v.y = 0; // o chefe volta para o topo, com a mesma etapa
  } else {
    removerVirus(v, false);
    fila.push(v.termo); // o termo volta no fim da onda: precisa ser acertado
  }

  area.classList.remove("dano");
  void area.offsetWidth;
  area.classList.add("dano");
  tremerTela();
  atualizarHud();

  if (vidas <= 0) {
    fimDeJogo(false);
    return;
  }

  SONS.dano();
  mostrarAlerta(v.chefe ? "🚨 O vírus chefe derrubou um servidor!" : "🚨 Um vírus derrubou um servidor!", v);
}

function mostrarAlerta(titulo, v) {
  cancelarArraste();
  document.getElementById("alerta-titulo").textContent = titulo;
  document.getElementById("alerta-resposta").textContent = TERMOS[v.termo].nome;
  document.getElementById("alerta-explicacao").textContent =
    `${TERMOS[v.termo].pista} ${v.explicacao}`;
  alerta.classList.remove("escondido");
  estado = "alerta";
}

function continuar() {
  alerta.classList.add("escondido");
  estado = "jogando";
}

// ----- Pausa -----
function alternarPausa() {
  if (estado === "pausa") {
    telaPausa.classList.add("escondido");
    estado = estadoAntesDaPausa;
  } else if (estado === "jogando" || estado === "transicao") {
    cancelarArraste();
    estadoAntesDaPausa = estado;
    estado = "pausa";
    telaPausa.classList.remove("escondido");
  }
}

// ----- Fim de jogo -----
function fimDeJogo(venceu) {
  estado = "fim";
  cancelarArraste();
  limparVirus();
  [alerta, telaPausa, telaRevisao, banner].forEach((el) => el.classList.add("escondido"));
  (venceu ? SONS.vitoria : SONS.derrota)();
  if (venceu) confete();

  const total = Object.keys(TERMOS).length;
  const anterior = recordeAtual();
  const novoRecorde = pontos > anterior;
  if (novoRecorde) salvar(`virus-recorde-${dificuldade}`, pontos);

  document.getElementById("fim-titulo").textContent =
    venceu ? "🛡️ Sistema limpo! Você venceu!" : "💀 Sistema infectado!";
  document.getElementById("fim-recorde").classList.toggle("escondido", !novoRecorde || pontos === 0);
  document.getElementById("fim-pontos").textContent = `${pontos} pontos`;
  document.getElementById("fim-melhor").textContent =
    `Dificuldade ${DIFICULDADES[dificuldade].nome} · recorde: ${Math.max(pontos, anterior)} pontos`;
  document.getElementById("fim-onda").textContent = venceu
    ? "Chefe ✔"
    : chefeCriado ? "Chefe" : `${ondaAtual + 1}/${ONDAS.length}`;
  document.getElementById("fim-combo").textContent = `x${maiorCombo}`;
  document.getElementById("fim-dominados").textContent = `${total - perdidos.size}/${total}`;

  const lista = document.getElementById("lista-revisao");
  lista.innerHTML = "";
  if (perdidos.size === 0) {
    const item = document.createElement("li");
    item.textContent = "Nenhum! Você não errou nenhum termo. 🎯";
    lista.appendChild(item);
  } else {
    perdidos.forEach((termo) => {
      const item = document.createElement("li");
      const nome = document.createElement("strong");
      nome.textContent = TERMOS[termo].nome;
      item.append(nome, `: ${TERMOS[termo].pista}`);
      lista.appendChild(item);
    });
  }

  mostrarTela("fim");
}

function voltarAoInicio() {
  estado = "parado";
  limparVirus();
  montarDificuldades();
  mostrarTela("inicio");
}

function encerrarPartida() {
  telaPausa.classList.add("escondido");
  fimDeJogo(false);
}

// =====================================================
// Botões e teclado
// =====================================================
document.getElementById("btn-comecar").addEventListener("click", iniciarJogo);
document.getElementById("btn-jogar-novamente").addEventListener("click", iniciarJogo);
document.getElementById("btn-menu").addEventListener("click", voltarAoInicio);
document.getElementById("btn-continuar").addEventListener("click", continuar);
document.getElementById("btn-pular").addEventListener("click", pular);
document.getElementById("btn-pausa").addEventListener("click", alternarPausa);
document.getElementById("btn-retomar").addEventListener("click", alternarPausa);
document.getElementById("btn-desistir").addEventListener("click", encerrarPartida);
document.getElementById("btn-proxima-onda").addEventListener("click", avancar);
document.getElementById("btn-glossario").addEventListener("click", abrirGlossario);
document.getElementById("btn-fechar-glossario").addEventListener("click", fecharGlossario);
glossario.addEventListener("click", (evento) => {
  if (evento.target === glossario) fecharGlossario(); // clicou fora da caixa
});
btnSom.addEventListener("click", alternarSom);

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape") {
    if (!glossario.classList.contains("escondido")) fecharGlossario();
    else alternarPausa();
  }
  // Enter num botão já dispara o clique dele: não repete a ação
  if (evento.key === "Enter" && evento.target.tagName !== "BUTTON") {
    if (estado === "alerta") continuar();
    else if (estado === "revisao") avancar();
  }
});

montarOpcoes();
montarDificuldades();
montarGlossario();
atualizarBotaoSom();
document.getElementById("hero-virus").innerHTML = svgVirus(12);
