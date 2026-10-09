---
id: "FEAT-2026-10-002"
title: "Controle de Súmula para Árbitros e Juízes"
slug: "controle-sumula-juizes"
type: "feature"
status: "SPEC_APPROVED"
owner: "afr-engineering"
target_branch: "feat/controle-sumula-juizes"
created_at: "2026-10-09"
---

# Feature: Controle de Súmula para Árbitros e Juízes

## 0. Resumo Executivo & Escopo

* **Problema:** No modelo atual do aplicativo do RockGol São Patrício 2026, os placares dos jogos são lançados apenas numericamente na aba *Jogos*, sem discriminação de quais atletas marcaram gols, quais receberam advertências disciplinares (cartões amarelos e vermelhos) ou registro de ocorrências da arbitragem. Isso gera dificuldades operacionais para os juízes e para a organização na apuração da artilharia, controle de suspensões automáticas por cartões para rodadas subsequentes e geração de relatórios de disciplina e gols.
* **Solução:** Implementar um módulo completo de Súmula de Arbitragem com:
  1. Nova aba dedicada **Súmula** na interface do aplicativo com seleção por Rodada e Partida;
  2. Registro individual de autores de gols por jogador (ou gol contra) vinculado ao elenco oficial da aba *Times*;
  3. Registro disciplinar de cartões amarelos e vermelhos com cálculo automático de suspensões (expulsão direta por vermelho ou 2 amarelos no jogo, e suspensão pelo acúmulo de 2 amarelos em partidas distintas);
  4. Sincronização condicional de placares: se a súmula for registrada, os gols alimentam automaticamente o placar do jogo e a classificação; se não houver súmula, o placar manual na aba Jogos permanece livremente funcional;
  5. Campo de observações livres para o árbitro;
  6. Painel consolidado de Artilharia e Quadro de Suspensões;
  7. Exportação modular no WhatsApp (Artilharia & Cartões, Classificação & Mata-Mata e Suspensões por Rodada) e inclusão da seção consolidada de súmula no relatório PDF com seleção de pasta de salvamento.
* **Como [Árbitro ou Organizador do Torneio RockGol]**, eu quero registrar e consultar as súmulas completas das partidas com autores de gols, cartões e observações, para que o campeonato tenha controle oficial de artilharia, suspensões automáticas por cartões e relatórios detalhados sem depender de anotações físicas de papel.

## 1. Contratos de Dados & Interfaces

### 1.1 Modelos de Dados e Tipos TypeScript (`src/types/tournament.ts`)

- Responsabilidade: Definir a estrutura dos eventos de gol, cartões disciplinares, súmula da partida e extensão do estado global do torneio.
- Contrato de código:

```typescript
export interface GoalEvent {
  id: string;
  teamId: string;
  playerIndex: number | null; // 0 a 9 conforme slots do elenco em Team.players, ou null para gol contra
  playerName: string;         // Ex: "Pedro" ou "Jogador 7" / "Gol Contra"
  isOwnGoal?: boolean;
}

export type CardType = 'YELLOW' | 'RED';

export interface CardEvent {
  id: string;
  teamId: string;
  playerIndex: number;        // 0 a 9 conforme slots do elenco em Team.players
  playerName: string;
  cardType: CardType;
}

export interface MatchScoresheet {
  matchId: string;            // ID correspondente em matches ou knockoutMatches
  hasScoresheet: boolean;     // Flag determinística indicando se a súmula está ativa/preenchida
  goals: GoalEvent[];
  cards: CardEvent[];
  observations: string;       // Observações livres da arbitragem
  updatedAt: string;
}

export interface PlayerSuspension {
  teamId: string;
  teamName: string;
  playerIndex: number;
  playerName: string;
  suspendedForRoundNumber: number; // Rodada em que o jogador deve cumprir suspensão
  reason: 'RED_CARD' | 'DOUBLE_YELLOW' | 'ACCUMULATED_YELLOWS';
  originMatchId: string;
}

export interface TopScorer {
  teamId: string;
  teamName: string;
  playerIndex: number | null;
  playerName: string;
  goals: number;
}
```

### 1.2 Serviço de Súmula e Cálculos Disciplinares (`src/services/scoresheetService.ts`)

```typescript
export interface ScoresheetServiceContract {
  // Sincronização condicional de placar
  syncMatchScoresFromScoresheets(
    matches: Match[],
    knockoutMatches: KnockoutMatch[],
    scoresheets: Record<string, MatchScoresheet>
  ): { matches: Match[]; knockoutMatches: KnockoutMatch[] };

  // Cálculo de artilharia ordenada
  getTopScorers(
    teams: Team[],
    scoresheets: Record<string, MatchScoresheet>
  ): TopScorer[];

  // Cálculo de jogadores suspensos para uma determinada rodada
  getSuspensions(
    teams: Team[],
    matches: Match[],
    scoresheets: Record<string, MatchScoresheet>
  ): PlayerSuspension[];

  // Verifica se um jogador específico está suspenso para uma partida
  isPlayerSuspended(
    teamId: string,
    playerIndex: number,
    roundNumber: number,
    suspensions: PlayerSuspension[]
  ): boolean;
}
```

## 2. Invariantes do Sistema

1. **INV-01 — Integridade dos Elencos:** Os jogadores registrados em gols e cartões devem ser referenciados pelos índices [0..9] da lista de jogadores da equipe (`Team.players`), formatados como `#Número Nome` ou `#Número` quando o nome não tiver sido informado.
2. **INV-02 — Sincronização Condicional Estrita:** O placar da partida só deve ser sobrescrito pelos gols da súmula quando `hasScoresheet: true`. Se a súmula for removida ou não existir, o placar manual cadastrado pelo usuário deve ser estritamente preservado.
3. **INV-03 — Regra Oficial de Suspensão de 2 Amarelos e Vermelho:** 
   - 2 cartões amarelos acumulados em partidas distintas geram suspensão de 1 partida no próximo jogo da equipe.
   - 1 cartão vermelho direto ou 2 cartões amarelos na mesma partida geram expulsão imediata e suspensão de 1 partida no próximo jogo da equipe.
   - Uma vez cumprida a suspensão em uma partida oficial da equipe, o ciclo disciplinar daquele motivo é considerado quitado.
4. **INV-04 — Isolamento de Atleta Suspenso:** Um atleta suspenso para a rodada em disputa não pode ter novos gols ou cartões lançados na respectiva partida pela interface da súmula.
5. **INV-05 — Retrocompatibilidade e Persistência Local:** O estado do torneio deve persistir em `localStorage` com chave de versão segura, garantindo que torneios iniciados sem súmula carreguem perfeitamente com `scoresheets: {}` sem quebras de runtime.

## 3. Critérios de Aceitação

* **AC-001: Lançamento de Gols e Sincronização Automática com o Placar**
  * **Dado** que uma partida entre Time A e Time B não possui súmula e está com placar manual 0 × 0,
  * **Quando** o árbitro abre a súmula, adiciona 2 gols para o jogador #7 do Time A e 1 gol para o jogador #10 do Time B e salva a súmula,
  * **Então** a partida tem `hasScoresheet` marcado como `true`, o placar na aba *Jogos* e no cálculo de classificação atualiza automaticamente para Time A 2 × 1 Time B e a artilharia computa os respectivos gols.

* **AC-002: Preservação do Placar Manual na Ausência de Súmula**
  * **Dado** que uma partida possui placar digitado manualmente como 3 × 2 na aba *Jogos*,
  * **Quando** o usuário navega pela aba *Jogos* e nenhuma súmula foi aberta ou salva para esse jogo,
  * **Então** o placar permanece 3 × 2 e os inputs numéricos manuais continuam habilitados para edição.

* **AC-003: Suspensão Automática por Acúmulo de 2 Cartões Amarelos**
  * **Dado** que o jogador #5 do Time A recebeu cartão amarelo na Rodada 1 e outro cartão amarelo na Rodada 2,
  * **Quando** a lista de suspensões é calculada para a Rodada 3 (próxima partida do Time A),
  * **Então** o jogador #5 do Time A é listado como Suspenso (`ACCUMULATED_YELLOWS`) para a partida da Rodada 3 e não pode atuar.

* **AC-004: Suspensão por Cartão Vermelho Direto ou Duplo Amarelo**
  * **Dado** que o jogador #9 do Time B recebe cartão vermelho direto (ou 2 amarelos no mesmo jogo) na Rodada 4,
  * **Quando** o árbitro salva a súmula da Rodada 4,
  * **Então** o jogador #9 é imediatamente classificado como suspenso para a próxima partida da sua equipe (Rodada 5).

* **AC-005: Compartilhamento Modular no WhatsApp e PDF Consolidado**
  * **Dado** que há partidas com súmulas preenchidas contendo gols e cartões,
  * **Quando** o usuário acessa a aba Exportar,
  * **Então** ele visualiza opções separadas de compartilhamento no WhatsApp para: 1) Classificação & Mata-Mata, 2) Artilharia & Cartões, 3) Suspensões por Rodada; e ao gerar o PDF, o arquivo completo traz a seção oficial de Súmula, Artilharia e Disciplina, solicitando o local para salvamento.

## 4. Casos Negativos & Condições de Borda

* **Gol Contra:** Quando selecionado "Gol Contra", o gol é atribuído ao placar da equipe adversária e contabilizado sem vincular a artilharia pessoal de atletas.
* **Exclusão de Súmula:** Se o árbitro optar por "Limpar/Excluir Súmula", o flag `hasScoresheet` passa a `false`, os gols vinculados são descartados e o placar manual volta a prevalecer.
* **Tentativa de Escalar Atleta Suspenso:** Se um atleta estiver suspenso para o jogo, seu nome aparece desabilitado com badge `🔴 Suspenso` no seletor da súmula para evitar erros do árbitro.

## 5. Fora de Escopo

* Cronometragem digital com marcação de minuto a minuto (descartado na fase de brainstorming por causar atrito excessivo).
* Assinatura digital ou fluxo de autenticação/login para árbitros (o app permanece 100% offline-first sem autenticação).
* Súmulas de penalidades de mata-mata em tela separada (as disputas de pênaltis permanecem gerenciadas no modal existente de Mata-Mata).
