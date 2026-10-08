---
id: "FEAT-2026-10-001"
title: "Aplicativo Mobile PWA RockGol São Patrício 2026"
slug: "rockgol-torneio-app"
type: "feature"
status: "COMPLETED"
owner: "afr-engineering"
target_branch: "feature/rockgol-torneio-app"
created_at: "2026-10-08"
---

# Feature: Aplicativo Mobile PWA RockGol São Patrício 2026

## 0. Resumo Executivo & Escopo

* **Problema:** A organização do torneio de futebol "RockGol São Patrício Bar" (edição 2026) necessita registrar e acompanhar 21 partidas da 1ª fase (todos contra todos entre 7 equipes) em 2 campos simultâneos, calcular pontuações e critérios de desempate em tempo real, montar o chaveamento eliminatório (semifinais, 3º lugar e final com disputa de pênaltis), gerenciar elencos de até 10 atletas por equipe, gerar relatórios em PDF e realizar backups dos dados entre aparelhos móveis sem depender de conexão com a internet (campo aberto / offline). O uso de planilhas de papel ou planilhas manuais em celular causa atrasos, inconsistências de critérios de desempate e risco de perda de dados.
* **Solução:** Desenvolver um Progressive Web App (PWA) mobile-first, 100% offline-first com persistência reativa em `localStorage`, contendo as 21 partidas da 1ª fase pré-programadas conforme a tabela oficial (`Tabela_Rock_Gol_2026.docx`), cálculo automático e determinístico da tabela de classificação, geração automática dos confrontos de mata-mata com suporte a pênaltis em empates, visualização por abas ergonômicas, modal de elenco dos times, exportação de PDF formatado com logotipo e funcionalidade de backup/restauração via JSON.
* **Como [Organizador ou Participante do Torneio RockGol]**, eu quero registrar e consultar placares, classificação, elencos e confrontos eliminatórios direto no celular de forma offline, para que o torneio transcorra com pontualidade, transparência e sem erros de chaveamento ou perda de dados.

## 1. Contratos de Dados & Interfaces

### 1.1 Modelos de Domínio e Tipos TypeScript (`src/types/tournament.ts`)

```typescript
export interface Team {
  id: string;
  name: string;
  players: string[]; // Exatamente 10 slots (índices 0 a 9)
}

export type MatchStatus = 'PENDING' | 'FINISHED';

export interface Match {
  id: string;
  roundNumber: number; // 1 a 11
  roundTime: string; // Ex: '09:00', '09:30'
  field: 'Campo 1' | 'Campo 2';
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
}

export interface RoundInfo {
  roundNumber: number;
  time: string;
  restingTeamIds: string[];
  isLunchBreakBefore?: boolean;
}

export interface TeamStanding {
  teamId: string;
  teamName: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface KnockoutMatch {
  id: 'sf1' | 'sf2' | 'third_place' | 'final';
  title: string;
  field: 'Campo 1' | 'Campo 2';
  time: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties: number | null;
  awayPenalties: number | null;
  winnerTeamId: string | null;
  loserTeamId: string | null;
  status: MatchStatus;
}

export interface TournamentState {
  teams: Team[];
  matches: Match[];
  knockoutMatches: KnockoutMatch[];
  version: number;
  lastUpdated: string;
}
```

### 1.2 Contrato do Serviço de Regras e Classificação (`src/services/standingsService.ts`)

```typescript
import { Match, TeamStanding, Team } from '../types/tournament';

export interface IStandingsService {
  /**
   * Calcula a tabela de classificação ordenada pelos critérios oficiais:
   * 1. Pontos (PG: V=3, E=1, D=0)
   * 2. Número de Vitórias (V)
   * 3. Saldo de Gols (SG)
   * 4. Gols Pró (GP)
   * 5. Confronto Direto (em caso de empate entre 2 equipes)
   * 6. Menor número de Gols Contra (GC)
   * 7. Ordem alfabética determinística
   */
  calculateStandings(teams: Team[], matches: Match[]): TeamStanding[];

  /**
   * Valida se a 1ª fase foi totalmente finalizada (21 jogos com status FINISHED)
   */
  isGroupStageCompleted(matches: Match[]): boolean;
}
```

### 1.3 Contrato de Backup e Restauração (`src/services/backupService.ts`)

```typescript
import { TournamentState } from '../types/tournament';

export interface IBackupService {
  exportBackup(state: TournamentState): string; // Retorna JSON formatado
  importBackup(jsonString: string): { success: boolean; data?: TournamentState; error?: string };
}
```

## 2. Invariantes do Sistema

1. **INV-01 — Integridade dos Placares da 1ª Fase:** Uma partida com placar não preenchido DEVE permanecer com status `PENDENTE` e placares `null`. NUNCA computar placar padrão `0 x 0` para partidas não jogadas.
2. **INV-02 — Hierarquia de Desempate Estrita:** O cálculo de classificação DEVE ser 100% determinístico e seguir a ordem: Pontos > Vitórias > Saldo de Gols > Gols Pró > Confronto Direto > Gols Sofridos > Nome Alfabético.
3. **INV-03 — Bloqueio e Chaveamento do Mata-Mata:** As semifinais (SF1: 1º x 4º e SF2: 2º x 3º) só podem ser calculadas e vinculadas aos times quando todos os 21 jogos da 1ª fase estiverem finalizados.
4. **INV-04 — Decisão Obrigatória no Mata-Mata:** Em caso de empate no tempo normal de qualquer confronto do mata-mata, o placar de pênaltis DEVE ser obrigatório e não pode resultar em empate nos pênaltis.
5. **INV-05 — Limite do Elenco:** Cada equipe possui exatamente 10 slots indexados de jogadores (1 a 10), garantindo integridade visual e consistência no cadastro.
6. **INV-06 — Persistência Reativa e Offline:** Toda alteração de placar, pênalti ou jogador DEVE ser persistida de forma síncrona no armazenamento local (`localStorage`), sobrevivendo ao fechamento e recarregamento da página sem necessidade de conexão de rede.

## 3. Critérios de Aceitação

* **AC-001:**
  * **Dado** que a aplicação é iniciada pela primeira vez sem dados prévios,
  * **Quando** o estado inicial é carregado,
  * **Então** o sistema deve conter exatamente as 7 equipes oficiais e as 21 partidas da 1ª fase distribuídas nas 11 rodadas rigorosamente de acordo com a `Tabela_Rock_Gol_2026.docx`, com a pausa de almoço indicada entre a 6ª e 7ª rodada.

* **AC-002:**
  * **Dado** uma partida pendente entre Bordogos e Meia Boca Jr,
  * **Quando** o usuário digita o placar 2 x 1 e confirma a partida,
  * **Então** a partida passa para status `FINISHED`, Bordogos recebe 3 pontos, Meia Boca Jr recebe 0 pontos, e a tabela de classificação atualiza instantaneamente.

* **AC-003:**
  * **Dado** duas equipes com a mesma pontuação, vitórias, saldo de gols e gols marcados,
  * **Quando** a tabela de classificação for calculada,
  * **Então** o desempate deve ser resolvido pelo confronto direto realizado entre as duas equipes na 1ª fase.

* **AC-004:**
  * **Dado** que os 21 jogos da 1ª fase foram todos finalizados com placares válidos,
  * **Quando** o usuário acessa a aba Mata-Mata,
  * **Então** a Semifinal 1 (Campo 1, 16:00) deve estar automaticamente preenchida com o 1º Colocado x 4º Colocado, e a Semifinal 2 (Campo 2, 16:00) com o 2º Colocado x 3º Colocado.

* **AC-005:**
  * **Dado** uma partida semifinal que termina empatada em 1 x 1,
  * **Quando** o placar de tempo normal é preenchido,
  * **Então** o sistema exibe o botão/campos de "Pênaltis", define o vencedor após a inserção das penalidades e projeta o vencedor para a Grande Final e o perdedor para a Disputa de 3º Lugar.

* **AC-006:**
  * **Dado** dados preenchidos no aplicativo,
  * **Quando** o usuário clica em "Baixar Backup (.json)",
  * **Então** um arquivo contendo o estado completo do torneio é baixado, e sua importação em outro dispositivo restaura com fidelidade 100% de times, elencos, placares e chaveamentos.

## 4. Casos Negativos & Condições de Borda

* **Edição de Placar Após Avanço do Mata-Mata:** Se um placar da 1ª fase for modificado após o início do mata-mata e alterar os 4 primeiros colocados, o sistema deve alertar o usuário de que o mata-mata precisará ser recalculado ou mantido.
* **Valores Não Numéricos ou Negativos:** Os campos de placar e pênaltis devem rejeitar valores negativos, decimais ou caracteres não numéricos.
* **Importação de Backup Inválido ou Corrompido:** O serviço de backup deve validar a assinatura do JSON, a lista de 7 equipes e a estrutura das partidas, rejeitando arquivos inválidos sem comprometer os dados locais existentes.
* **Empate nos Pênaltis:** O modal de pênaltis não deve permitir salvar se a pontuação dos pênaltis for igual para ambos os times.

## 5. Fora de Escopo

* Autenticação de usuários, login social ou perfis administrativos com senha.
* Backend em nuvem ou sincronização em tempo real via websockets entre múltiplos celulares (o compartilhamento é via arquivo de backup JSON).
* Controle de cartões amarelos/vermelhos e cronômetro/relógio ao vivo durante as partidas.
* Pagamentos ou inscrições de times dentro do aplicativo.
