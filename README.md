# 🦠 BYTE BREACH — Arquitetura Computacional

Jogo de navegador para estudar os termos da disciplina de **Tópicos de Arquitetura Computacional** de forma divertida.

Vírus invadem a rede e descem pela tela carregando **pistas** sobre componentes do computador (CPU, RAM, cache, barramentos...). Sua missão é **arrastar o termo certo até cada vírus** para destruí-lo antes que ele chegue aos servidores. Se os vírus derrubarem todos os servidores, o sistema é infectado e o jogo acaba.

🔗 **Jogue online:** https://ofabs-dev.github.io/Arq_comp_jogo/jogo%20arqui-comp/ *(requer o GitHub Pages ativado no repositório)*

---

## ▶️ Como rodar

Não precisa instalar nada. O jogo é feito só com HTML, CSS e JavaScript puros, sem bibliotecas.

1. Baixe ou clone o repositório:
   ```bash
   git clone https://github.com/oFabs-dev/Arq_comp_jogo.git
   ```
2. Abra o arquivo [`jogo arqui-comp/index.html`](jogo%20arqui-comp/index.html) no navegador.

Funciona no computador (mouse) e no celular (toque).

---

## 🎮 Como jogar

1. Na tela inicial, escolha a **dificuldade** e clique em **Começar**.
2. Cada vírus que desce mostra uma pista. Ao lado da tela fica a lista de **opções de resposta**, dividida em três grupos: *Processador*, *Memórias* e *Comunicação e sistemas*.
3. **Arraste** o termo correto e **solte em cima do vírus** correspondente.
4. ✅ **Acertou:** o vírus explode, você ganha pontos e o jogo mostra uma explicação sobre o termo.
5. ❌ **Errou o alvo:** o vírus treme, o combo zera e o jogo mostra a pista do termo que você arrastou, para você perceber a diferença.
6. 💥 **O vírus chegou lá embaixo:** ele derruba um servidor (uma vida ❤️). O jogo mostra a resposta certa e o termo volta no fim da onda.
7. Sobreviva às **3 ondas** e derrote o **vírus chefe** para limpar o sistema!

### Dificuldades

| Dificuldade | Vidas | Velocidade dos vírus |
|---|---|---|
| Fácil | 5 | Lenta (70%) |
| Normal | 3 | Padrão |
| Difícil | 2 | Rápida (135%) |

O **recorde** de cada dificuldade fica salvo no navegador.

### Ondas

| Onda | Vírus na tela | O que o vírus mostra |
|---|---|---|
| 1. Reconhecimento | 1 por vez | Uma pista (definição) |
| 2. Ataque | Até 2, mais rápidos | Uma pista (definição) |
| 3. Invasão | Até 3 | Uma situação do dia a dia |
| 👾 Chefe | 1 vírus gigante | 3 situações seguidas |

- Cada onda traz **os 16 termos** em ordem sorteada.
- A cada acerto os vírus ficam um pouco mais rápidos.
- Antes de cada onda há uma contagem **3, 2, 1**.
- Entre as ondas aparece uma **revisão** com os termos que você errou — eles voltam primeiro na onda seguinte.

### Vírus chefe 👾

Depois da onda 3 surge o **TROJAN.BOSS**. Ele tem 3 barras de vida e mostra uma situação por vez: cada termo certo tira uma barra e **empurra o chefe para cima**. Acerte as 3 para vencer.

### Pontuação

| Ação | Pontos |
|---|---|
| Acertar um vírus | **10 × combo** |
| Acertar no terço de cima da tela | **+5** de bônus |
| Golpe no chefe | **50 × combo** |
| Destruir o chefe | **+100** de bônus |

O **combo** sobe a cada acerto seguido (até **x5**) e volta para x1 quando você erra, pula ou perde uma vida.

No final, a tela de resultado mostra os pontos, a onda alcançada, o maior combo e a lista de termos para revisar.

### Outros recursos

- **⏭ Pular:** não sabe a resposta? Pule o vírus mais baixo. Você vê a resposta, perde o combo, mas **não perde vida**.
- **⏸ Pausa:** botão na tela ou tecla **Esc**.
- **🔊 Sons** gerados pelo próprio navegador, com botão para silenciar.
- **📖 Glossário** na tela inicial, com todos os termos, pistas e exemplos.
- Vírus **mudam de cor** (magenta → amarelo → vermelho) conforme se aproximam dos servidores.
- Efeitos de explosão, tela tremendo ao perder vida e confete na vitória.

---

## 📚 Termos do jogo

| Grupo | Termos |
|---|---|
| Processador | CPU, ULA, UC, Registradores, Dual core, Quad core |
| Memórias | RAM, ROM, EEPROM, Flash, Cache, Memória de massa |
| Comunicação e sistemas | DMA, Address bus, Data bus, Microcontrolador |

A lista completa com as pistas está no [README do jogo](jogo%20arqui-comp/README.md) e no glossário dentro do próprio jogo.

---

## 🗂️ Estrutura do projeto

```
Arq_comp_jogo/
└── jogo arqui-comp/
    ├── index.html   → telas do jogo (início, jogo e resultado)
    ├── style.css    → visual (tema roxo cyberpunk, vírus, servidores, animações)
    ├── dados.js     → os 16 termos, suas pistas, explicações e as situações do dia a dia
    ├── script.js    → lógica (ondas, movimento dos vírus, chefe, pontos, vidas, sons)
    └── README.md    → detalhes do jogo e tabela completa de pistas
```

### Personalizando

- Para mudar **termos, pistas ou situações**, edite [`dados.js`](jogo%20arqui-comp/dados.js).
- Para ajustar **pontuação, velocidade, ondas e dificuldades**, altere as constantes no topo de [`script.js`](jogo%20arqui-comp/script.js) (`ONDAS`, `DIFICULDADES`, `PONTOS_POR_ACERTO`, `COMBO_MAXIMO`, `CHEFE_*`...).
