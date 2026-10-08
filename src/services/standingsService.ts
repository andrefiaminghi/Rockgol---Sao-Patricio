import { Team, Match, TeamStanding } from '../types/tournament';

export function calculateStandings(teams: Team[], matches: Match[]): TeamStanding[] {
  const standingsMap = new Map<string, TeamStanding>();

  teams.forEach(team => {
    standingsMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0
    });
  });

  const finishedMatches = matches.filter(
    m => m.status === 'FINISHED' && m.homeScore !== null && m.awayScore !== null
  );

  finishedMatches.forEach(m => {
    const home = standingsMap.get(m.homeTeamId);
    const away = standingsMap.get(m.awayTeamId);
    if (!home || !away) return;

    home.played += 1;
    away.played += 1;
    home.goalsFor += m.homeScore!;
    home.goalsAgainst += m.awayScore!;
    away.goalsFor += m.awayScore!;
    away.goalsAgainst += m.homeScore!;
    home.goalDifference = home.goalsFor - home.goalsAgainst;
    away.goalDifference = away.goalsFor - away.goalsAgainst;

    if (m.homeScore! > m.awayScore!) {
      home.points += 3;
      home.won += 1;
      away.lost += 1;
    } else if (m.homeScore! < m.awayScore!) {
      away.points += 3;
      away.won += 1;
      home.lost += 1;
    } else {
      home.points += 1;
      away.points += 1;
      home.drawn += 1;
      away.drawn += 1;
    }
  });

  const standings = Array.from(standingsMap.values());

  standings.sort((a, b) => {
    // 1. Pontos
    if (b.points !== a.points) return b.points - a.points;
    // 2. Vitórias
    if (b.won !== a.won) return b.won - a.won;
    // 3. Saldo de Gols
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    // 4. Gols Pró
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

    // 5. Confronto Direto (se empate entre 2 equipes)
    const headToHead = finishedMatches.find(
      m => (m.homeTeamId === a.teamId && m.awayTeamId === b.teamId) ||
           (m.homeTeamId === b.teamId && m.awayTeamId === a.teamId)
    );
    if (headToHead) {
      const aGoals = headToHead.homeTeamId === a.teamId ? headToHead.homeScore! : headToHead.awayScore!;
      const bGoals = headToHead.homeTeamId === b.teamId ? headToHead.homeScore! : headToHead.awayScore!;
      if (aGoals !== bGoals) return bGoals - aGoals;
    }

    // 6. Menor número de Gols Sofridos
    if (a.goalsAgainst !== b.goalsAgainst) return a.goalsAgainst - b.goalsAgainst;

    // 7. Ordem alfabética
    return a.teamName.localeCompare(b.teamName);
  });

  return standings;
}

export function isGroupStageCompleted(matches: Match[]): boolean {
  return (
    matches.length === 21 &&
    matches.every(m => m.status === 'FINISHED' && m.homeScore !== null && m.awayScore !== null)
  );
}
