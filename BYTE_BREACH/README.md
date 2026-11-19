# BYTE BREACH — Arquitetura Computacional

Jogo de navegador para treinar os termos da aula de Tópicos de Arquitetura Computacional.
Vírus descem pela tela carregando pistas sobre os componentes do computador. Arraste o termo certo até cada vírus para destruí-lo antes que ele derrube os servidores!

🔗 **Jogue aqui:** https://ofabs-dev.github.io/Arq_comp_jogo/jogo%20arqui-comp/

## Como jogar

1. Clique em **Começar**.
2. Leia a pista de cada vírus, **arraste** o termo da lista de **opções de resposta** (ao lado da tela, separada em Processador, Memórias e Comunicação e sistemas) e solte em cima do vírus certo.
3. Se acertar, o vírus explode e você ganha pontos. Acertos seguidos aumentam o **combo** (até x5).
4. Se um vírus chegar lá embaixo, ele **derruba um servidor** (cada servidor é uma vida ❤️). O jogo mostra a resposta e a explicação, e o termo volta no fim da onda.
5. Perdeu as 3 vidas? Sistema infectado! Passou pelas 3 ondas? Sistema limpo!

Funciona com mouse e com o dedo no celular.

### Recursos

- **Dificuldade:** Fácil (5 vidas, vírus lentos), Normal (3 vidas) ou Difícil (2 vidas, vírus rápidos).
- **⏭ Pular:** não sabe a resposta? Pule o vírus mais baixo: você vê a resposta e a explicação, perde o combo, mas não perde vida. O termo volta no fim da onda.
- **Explicação a cada acerto:** além dos pontos, o jogo mostra um fato sobre o termo.
- **Vírus mudam de cor** (magenta → amarelo → vermelho) conforme chegam perto dos servidores.
- **Pausa** com a tecla **Esc** ou o botão ⏸.
- **Sons** gerados pelo próprio navegador, com botão para silenciar 🔊.
- **Recorde** salvo no navegador para cada dificuldade.
- **📖 Glossário** na tela inicial, com os 16 termos, as pistas e um exemplo de cada.
- **Revisão entre ondas:** antes da próxima onda, o jogo mostra os termos que você errou. Eles voltam primeiro na onda seguinte.
- **Contagem 3, 2, 1** antes de cada onda.
- **👾 Vírus chefe** no final: só é destruído com 3 termos certos seguidos. Cada golpe empurra o chefe para cima.
- **Efeitos:** explosão com partículas, pontos flutuando, tela tremendo ao perder vida e confete na vitória.

### As 3 ondas e o chefe

| Onda | Vírus na tela | O que o vírus carrega |
|---|---|---|
| 1. Reconhecimento | 1 por vez | Pista |
| 2. Ataque | Até 2, mais rápidos | Pista |
| 3. Invasão | Até 3 | Uma situação do dia a dia |
| 👾 Chefe | 1 vírus gigante | 3 situações seguidas, uma por golpe |

Cada onda traz **as 16 palavras** em ordem sorteada.

### Pontuação

- Acerto: **10 pontos × combo**.
- Bônus de **+5** por acertar o vírus ainda no terço de cima da tela.
- Soltou o termo no vírus errado? O vírus treme, o combo zera e o jogo mostra a pista do termo que você arrastou, para você ver a diferença.
- No final aparecem os pontos, a onda alcançada, o maior combo e a lista dos termos para revisar.

## Palavras e pistas

| Nº | Termo | Pista |
|---|---|---|
| 1 | CPU | Cérebro do computador, que executa as instruções dos programas. |
| 2 | ULA | Parte interna da CPU que faz os cálculos e as comparações entre valores. |
| 3 | UC | Parte da CPU que busca, decodifica e coordena a execução das instruções. |
| 4 | Registradores | Pequenas memórias dentro da CPU, as mais rápidas do computador. |
| 5 | RAM | Memória principal e volátil onde ficam os programas em execução. |
| 6 | ROM | Memória não volátil gravada na fábrica que, em geral, não pode ser alterada. |
| 7 | EEPROM | Memória permanente que pode ser reescrita aos poucos, byte a byte, sem sair do circuito. |
| 8 | Flash | Memória permanente regravável em blocos, usada em pendrives e SSDs. |
| 9 | Cache | Memória pequena e rápida entre a CPU e a RAM, que guarda o mais usado. |
| 10 | Memória de massa | Onde os arquivos ficam guardados de forma permanente, como no HD e no SSD. |
| 11 | DMA | Recurso que transfere informações entre periféricos e RAM sem ocupar a CPU. |
| 12 | Address bus | Linhas por onde a CPU indica qual posição da memória quer acessar. |
| 13 | Data bus | Linhas por onde o conteúdo de fato trafega entre CPU, memória e periféricos. |
| 14 | Microcontrolador | Chip único com CPU, memória e entradas e saídas, usado no Arduino e em eletrodomésticos. |
| 15 | Dual core | CPU com duas unidades de processamento independentes no mesmo chip. |
| 16 | Quad core | CPU com quatro unidades de processamento independentes no mesmo chip. |

## Estrutura do projeto

```
index.html   → telas do jogo (início, jogo e resultado)
style.css    → visual (tema roxo cyberpunk, vírus, servidores, animações)
dados.js     → os 16 termos, suas pistas e as 48 situações do dia a dia
script.js    → lógica do jogo (ondas, movimento dos vírus, pontos, vidas)
README.md    → este arquivo
```

Feito com HTML, CSS e JavaScript puros, sem bibliotecas.
