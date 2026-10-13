# BomberBlock

Jogo estilo Bomberman rodando no navegador, desenvolvido como teste técnico para vaga de dev full stack Node. A identidade visual segue o nome: **tudo é um bloco** — cenário, personagens, bombas e power-ups são cubos com bevel, desenhados por código (sem assets de imagem).

## Stack

- **[Vite](https://vite.dev/)** — build tool e dev server com HMR
- **[TypeScript](https://www.typescriptlang.org/)** — tipagem estática
- **[KAPLAY](https://kaplayjs.com/)** — engine de jogos 2D para navegador (sucessora da Kaboom.js)

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:5173 no navegador.

Outros comandos:

```bash
npm run build    # type-check + build de produção em dist/
npm run preview  # serve o build de produção localmente
```

## Modos de jogo

Toda partida tem **4 personagens** (modo batalha); os jogadores humanos ocupam os primeiros slots e o restante é controlado pela CPU:

| Modo | Composição |
| --- | --- |
| **Single Player** | Você + 3 CPUs |
| **Multiplayer local** | 2 jogadores no mesmo teclado + 2 CPUs |

Vence o último personagem vivo. Se os últimos morrerem na mesma explosão, é empate. A partida também termina quando todos os jogadores humanos são eliminados (derrota), mesmo que ainda restem CPUs.

## Interface

- **Menu** navegável com `←` setas/`W`/`S` + `Enter` (ou `Espaço`) para confirmar, com legenda dos power-ups
- **HUD** durante a partida: status ao vivo dos 4 personagens (nome, bombas `B`, alcance `F`); eliminados ficam esmaecidos
- **Fim de jogo**: vencedor na cor dele, placar de vitórias acumulado entre partidas, `R` para revanche instantânea e `Enter` para o menu

## Controles

| Jogador | Movimento | Bomba |
| --- | --- | --- |
| Player 1 (azul) | `W` `A` `S` `D` | `Espaço` |
| Player 2 (vermelho) | `←` `→` `↑` `↓` | `Enter` |
| CPUs (amarelo e roxo) | — | — |

## Regras implementadas

- Arena 15x13 no padrão clássico: totalmente preenchida com blocos destrutíveis, exceto paredes indestrutíveis (bordas e pilares) e os cantos de spawn
- Zonas de spawn seguras nos cantos (o jogador nunca nasce encurralado)
- Bombas com timer de 2,5s e explosão em cruz (alcance inicial de 1 tile)
- A explosão para em paredes, destrói no máximo 1 bloco por direção e detona outras bombas em cadeia
- A bomba só se torna sólida depois que o dono sai de cima dela (comportamento clássico)
- Cada jogador começa com 1 bomba ativa por vez

## Power-ups

Blocos destruídos têm 35% de chance de revelar um power-up, coletado ao passar por cima (vale para humanos e CPUs). Explosões queimam power-ups já revelados.

| Power-up | Efeito | Limite |
| --- | --- | --- |
| **B** (cinza) | +1 bomba simultânea | 6 bombas |
| **F** (laranja) | +1 tile de alcance da explosão | 15 tiles |

## Estrutura do projeto

```
src/
├── main.ts              # bootstrap: registra as cenas e abre o menu
├── config.ts            # todas as constantes de gameplay em um só lugar
├── kaplayCtx.ts         # contexto KAPLAY compartilhado
├── map.ts               # geração procedural da arena e helpers de grid
├── scenes/
│   ├── menu.ts          # seleção de modo (1P / 2P)
│   ├── game.ts          # montagem da partida e condição de vitória
│   └── gameover.ts      # resultado e retorno ao menu
└── entities/
    ├── player.ts        # jogador, controles e stats
    ├── bomb.ts          # bombas e explosões
    ├── ai.ts            # oponente CPU do modo single-player
    └── powerup.ts       # hook para power-ups (ainda não implementado)
```

## Arquitetura dos power-ups

- `src/entities/powerup.ts` concentra spawn (`maybeSpawnPowerUp`, chamado a cada bloco destruído) e efeito (`applyPowerUp`)
- cada jogador tem um objeto `stats` mutável (`speed`, `bombRange`, `maxBombs`) que os power-ups modificam
- limites e chances são constantes em `config.ts` (`MAX_BOMBS`, `MAX_BOMB_RANGE`, `POWERUP_DROP_CHANCE`)

## Roadmap

- [x] Power-ups (bomba extra, +alcance)
- [x] Efeitos sonoros sintetizados (Web Audio API, sem assets)
- [x] Efeitos visuais (screen shake, partículas, animações)
- [ ] Power-up de velocidade (o `stats.speed` já existe)
- [x] Identidade visual "BomberBlock" (blocos com bevel, sem assets)
- [ ] Música de fundo
- [ ] Placar de partidas (melhor de 3/5)
- [ ] Multiplayer online (WebSocket) — o modo atual é local no mesmo teclado
