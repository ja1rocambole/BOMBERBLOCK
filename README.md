# Bomberman Clone

Clone do clássico Bomberman rodando no navegador, desenvolvido como teste técnico para vaga de dev full stack Node.

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

| Modo | Descrição |
| --- | --- |
| **Single Player** | Partida contra um oponente controlado pela CPU |
| **Multiplayer local** | 2 jogadores no mesmo teclado |

Vence o último jogador vivo. Se os dois morrerem na mesma explosão, é empate.

## Controles

| Jogador | Movimento | Bomba |
| --- | --- | --- |
| Player 1 (azul) | `W` `A` `S` `D` | `Espaço` |
| Player 2 / CPU (vermelho) | `←` `→` `↑` `↓` | `Enter` |

## Regras implementadas

- Arena 15x13 no padrão clássico: totalmente preenchida com blocos destrutíveis, exceto paredes indestrutíveis (bordas e pilares) e os cantos de spawn
- Zonas de spawn seguras nos cantos (o jogador nunca nasce encurralado)
- Bombas com timer de 2,5s e explosão em cruz (alcance de 2 tiles)
- A explosão para em paredes, destrói no máximo 1 bloco por direção e detona outras bombas em cadeia
- A bomba só se torna sólida depois que o dono sai de cima dela (comportamento clássico)
- 1 bomba ativa por jogador (limitado por `stats.maxBombs`)

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

## Preparado para power-ups

Power-ups ficaram fora desta primeira versão de propósito, mas a arquitetura já os prevê:

- `src/entities/powerup.ts` expõe `maybeSpawnPowerUp(tile)`, chamado toda vez que um bloco é destruído — basta ligar `POWERUPS_ENABLED` em `config.ts` e implementar os drops
- cada jogador tem um objeto `stats` mutável (`speed`, `bombRange`, `maxBombs`) que os power-ups irão modificar
- constantes `POWERUP_DROP_CHANCE`, `INITIAL_BOMB_RANGE` e `INITIAL_MAX_BOMBS` já estão centralizadas em `config.ts`

## Roadmap

- [ ] Power-ups (bomba extra, +alcance, +velocidade)
- [ ] Sprites e animações (hoje o jogo usa formas geométricas)
- [ ] Efeitos sonoros e música
- [ ] Placar de partidas (melhor de 3/5)
- [ ] Multiplayer online (WebSocket) — o modo atual é local no mesmo teclado
