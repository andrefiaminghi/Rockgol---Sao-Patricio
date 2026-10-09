import { KnockoutMatch, TeamStanding } from '../types/tournament';

export function generateSemifinals(
  standings: TeamStanding[],
  currentKnockout: KnockoutMatch[]
): KnockoutMatch[] {
  if (standings.length < 4) return currentKnockout;

  const first = standings[0].teamId;
  const second = standings[1].teamId;
  const third = standings[2].teamId;
  const fourth = standings[3].teamId;

  return currentKnockout.map(m => {
    if (m.id === 'sf1') {
      return { ...m, homeTeamId: first, awayTeamId: fourth };
    }
    if (m.id === 'sf2') {
      return { ...m, homeTeamId: second, awayTeamId: third };
    }
    return m;
  });
}

export function resolveKnockoutMatch(
  match: KnockoutMatch,
  homeScore: number,
  awayScore: number,
  homePenalties: number | null = null,
  awayPenalties: number | null = null
): { updatedMatch: KnockoutMatch; error?: string } {
  if (homeScore === awayScore) {
    if (homePenalties === null || awayPenalties === null) {
      return {
        updatedMatch: match,
        error: 'Partida empatada necessita do resultado das cobranças de pênaltis.'
      };
    }
    if (homePenalties === awayPenalties) {
      return {
        updatedMatch: match,
        error: 'Disputa de pênaltis não pode terminar empatada.'
      };
    }
  }

  const isHomeWinner =
    homeScore > awayScore ||
    (homeScore === awayScore && (homePenalties ?? 0) > (awayPenalties ?? 0));

  const winnerTeamId = isHomeWinner ? match.homeTeamId : match.awayTeamId;
  const loserTeamId = isHomeWinner ? match.awayTeamId : match.homeTeamId;

  const updatedMatch: KnockoutMatch = {
    ...match,
    homeScore,
    awayScore,
    homePenalties,
    awayPenalties,
    winnerTeamId,
    loserTeamId,
    status: 'FINISHED'
  };

  return { updatedMatch };
}

export function updateFinalsFromSemifinals(knockoutMatches: KnockoutMatch[]): KnockoutMatch[] {
  const sf1 = knockoutMatches.find(m => m.id === 'sf1');
  const sf2 = knockoutMatches.find(m => m.id === 'sf2');

  const sf1Done = sf1?.status === 'FINISHED' && Boolean(sf1.winnerTeamId) && Boolean(sf1.loserTeamId);
  const sf2Done = sf2?.status === 'FINISHED' && Boolean(sf2.winnerTeamId) && Boolean(sf2.loserTeamId);

  return knockoutMatches.map(m => {
    if (m.id === 'final') {
      const homeTeamId = sf1Done ? sf1!.winnerTeamId : null;
      const awayTeamId = sf2Done ? sf2!.winnerTeamId : null;
      const ready = Boolean(homeTeamId && awayTeamId);

      return {
        ...m,
        homeTeamId,
        awayTeamId,
        homeScore: ready ? m.homeScore : null,
        awayScore: ready ? m.awayScore : null,
        homePenalties: ready ? m.homePenalties : null,
        awayPenalties: ready ? m.awayPenalties : null,
        winnerTeamId: ready ? m.winnerTeamId : null,
        loserTeamId: ready ? m.loserTeamId : null,
        status: ready ? m.status : ('PENDING' as const)
      };
    }
    if (m.id === 'third_place') {
      const homeTeamId = sf1Done ? sf1!.loserTeamId : null;
      const awayTeamId = sf2Done ? sf2!.loserTeamId : null;
      const ready = Boolean(homeTeamId && awayTeamId);

      return {
        ...m,
        homeTeamId,
        awayTeamId,
        homeScore: ready ? m.homeScore : null,
        awayScore: ready ? m.awayScore : null,
        homePenalties: ready ? m.homePenalties : null,
        awayPenalties: ready ? m.awayPenalties : null,
        winnerTeamId: ready ? m.winnerTeamId : null,
        loserTeamId: ready ? m.loserTeamId : null,
        status: ready ? m.status : ('PENDING' as const)
      };
    }
    return m;
  });
}
