import { Match, KnockoutMatch, Team, MatchScoresheet, TopScorer, PlayerSuspension } from '../types/tournament';
import { resolveKnockoutMatch, updateFinalsFromSemifinals } from './knockoutService';

/**
 * Sincroniza condicionalmente os placares de partidas da fase de grupos e mata-mata
 * apenas se houver uma súmula ativa (hasScoresheet: true). Caso contrário, preserva o placar manual.
 */
export function syncMatchScoresFromScoresheets(
  matches: Match[],
  knockoutMatches: KnockoutMatch[],
  scoresheets: Record<string, MatchScoresheet>
): { matches: Match[]; knockoutMatches: KnockoutMatch[] } {
  const updatedMatches = matches.map(match => {
    const sheet = scoresheets[match.id];
    if (!sheet || !sheet.hasScoresheet) {
      return match;
    }

    const homeGoals = sheet.goals.filter(
      g => (g.teamId === match.homeTeamId && !g.isOwnGoal) || (g.teamId === match.awayTeamId && g.isOwnGoal)
    ).length;

    const awayGoals = sheet.goals.filter(
      g => (g.teamId === match.awayTeamId && !g.isOwnGoal) || (g.teamId === match.homeTeamId && g.isOwnGoal)
    ).length;

    return {
      ...match,
      homeScore: homeGoals,
      awayScore: awayGoals,
      status: 'FINISHED' as const
    };
  });

  const updatedKnockout = knockoutMatches.map(match => {
    const sheet = scoresheets[match.id];
    if (!sheet || !sheet.hasScoresheet) {
      return match;
    }

    const homeGoals = sheet.goals.filter(
      g => (g.teamId === match.homeTeamId && !g.isOwnGoal) || (g.teamId === match.awayTeamId && g.isOwnGoal)
    ).length;

    const awayGoals = sheet.goals.filter(
      g => (g.teamId === match.awayTeamId && !g.isOwnGoal) || (g.teamId === match.homeTeamId && g.isOwnGoal)
    ).length;

    const homePenalties = sheet.homePenalties ?? null;
    const awayPenalties = sheet.awayPenalties ?? null;

    if (match.homeTeamId && match.awayTeamId) {
      const { updatedMatch, error } = resolveKnockoutMatch(
        match,
        homeGoals,
        awayGoals,
        homePenalties,
        awayPenalties
      );
      if (!error) {
        return updatedMatch;
      }
    }

    return {
      ...match,
      homeScore: homeGoals,
      awayScore: awayGoals,
      homePenalties,
      awayPenalties,
      status: (homeGoals !== awayGoals && match.homeTeamId && match.awayTeamId) ? ('FINISHED' as const) : match.status
    };
  });

  const finalKnockout = updateFinalsFromSemifinals(updatedKnockout);

  return { matches: updatedMatches, knockoutMatches: finalKnockout };
}

/**
 * Calcula a lista oficial de artilheiros do torneio em ordem decrescente de gols.
 * Gols contra são desconsiderados na artilharia individual.
 */
export function getTopScorers(
  teams: Team[],
  scoresheets: Record<string, MatchScoresheet>
): TopScorer[] {
  const scorersMap: Record<string, TopScorer> = {};

  Object.values(scoresheets).forEach(sheet => {
    if (!sheet || !sheet.hasScoresheet) return;

    sheet.goals.forEach(goal => {
      if (goal.isOwnGoal || goal.playerIndex === null) return;

      const key = `${goal.teamId}-${goal.playerIndex}`;
      const team = teams.find(t => t.id === goal.teamId);
      const teamName = team ? team.name : goal.teamId;

      if (!scorersMap[key]) {
        scorersMap[key] = {
          teamId: goal.teamId,
          teamName,
          playerIndex: goal.playerIndex,
          playerName: goal.playerName,
          goals: 0
        };
      }
      scorersMap[key].goals += 1;
    });
  });

  return Object.values(scorersMap).sort((a, b) => {
    if (b.goals !== a.goals) {
      return b.goals - a.goals;
    }
    return a.playerName.localeCompare(b.playerName);
  });
}

/**
 * Calcula a lista de atletas suspensos por equipe para as rodadas seguintes:
 * - 2 cartões amarelos no mesmo jogo: suspenso na partida seguinte da equipe (DOUBLE_YELLOW);
 * - 2 cartões amarelos acumulados em partidas distintas: suspenso na partida seguinte da equipe (ACCUMULATED_YELLOWS);
 * - Cartão vermelho direto: suspenso na partida seguinte da equipe (RED_CARD).
 */
export function getSuspensions(
  teams: Team[],
  matches: Match[],
  scoresheets: Record<string, MatchScoresheet>
): PlayerSuspension[] {
  const suspensions: PlayerSuspension[] = [];
  const sortedMatches = [...matches].sort((a, b) => a.roundNumber - b.roundNumber);

  teams.forEach(team => {
    const teamMatches = sortedMatches.filter(m => m.homeTeamId === team.id || m.awayTeamId === team.id);
    const accumulatedYellows: Record<number, number> = {};

    teamMatches.forEach((m, matchIndex) => {
      const sheet = scoresheets[m.id];
      if (!sheet || !sheet.hasScoresheet) return;

      const nextTeamMatch = teamMatches[matchIndex + 1];
      const targetSuspensionRound = nextTeamMatch ? nextTeamMatch.roundNumber : m.roundNumber + 1;

      const teamCards = sheet.cards.filter(c => c.teamId === team.id);
      const playerYellowsInMatch: Record<number, number> = {};
      const playerRedInMatch: Record<number, boolean> = {};

      teamCards.forEach(c => {
        if (c.cardType === 'YELLOW') {
          playerYellowsInMatch[c.playerIndex] = (playerYellowsInMatch[c.playerIndex] || 0) + 1;
        } else if (c.cardType === 'RED') {
          playerRedInMatch[c.playerIndex] = true;
        }
      });

      // Avaliação de cartões no jogo
      Object.keys(playerYellowsInMatch).forEach(idxStr => {
        const pIdx = Number(idxStr);
        const yellowsInThisGame = playerYellowsInMatch[pIdx];
        const rawName = team.players[pIdx]?.trim();
        const playerName = rawName ? `#${pIdx + 1} ${rawName}` : `#${pIdx + 1}`;

        if (yellowsInThisGame >= 2) {
          suspensions.push({
            teamId: team.id,
            teamName: team.name,
            playerIndex: pIdx,
            playerName,
            suspendedForRoundNumber: targetSuspensionRound,
            reason: 'DOUBLE_YELLOW',
            originMatchId: m.id
          });
        } else if (yellowsInThisGame === 1 && !playerRedInMatch[pIdx]) {
          accumulatedYellows[pIdx] = (accumulatedYellows[pIdx] || 0) + 1;
          if (accumulatedYellows[pIdx] >= 2) {
            suspensions.push({
              teamId: team.id,
              teamName: team.name,
              playerIndex: pIdx,
              playerName,
              suspendedForRoundNumber: targetSuspensionRound,
              reason: 'ACCUMULATED_YELLOWS',
              originMatchId: m.id
            });
            accumulatedYellows[pIdx] = 0; // zera ciclo após cumprimento
          }
        }
      });

      Object.keys(playerRedInMatch).forEach(idxStr => {
        const pIdx = Number(idxStr);
        const rawName = team.players[pIdx]?.trim();
        const playerName = rawName ? `#${pIdx + 1} ${rawName}` : `#${pIdx + 1}`;

        suspensions.push({
          teamId: team.id,
          teamName: team.name,
          playerIndex: pIdx,
          playerName,
          suspendedForRoundNumber: targetSuspensionRound,
          reason: 'RED_CARD',
          originMatchId: m.id
        });
      });
    });
  });

  return suspensions;
}

/**
 * Determina se um jogador está suspenso para a partida da rodada informada.
 */
export function isPlayerSuspended(
  teamId: string,
  playerIndex: number,
  roundNumber: number,
  suspensions: PlayerSuspension[]
): boolean {
  return suspensions.some(
    s => s.teamId === teamId && s.playerIndex === playerIndex && s.suspendedForRoundNumber === roundNumber
  );
}
