import { describe, it, expect, beforeEach } from 'vitest';
import { syncMatchScoresFromScoresheets } from '../../src/services/scoresheetService';
import { calculateStandings } from '../../src/services/standingsService';
import { Match, KnockoutMatch, Team, MatchScoresheet, TournamentState } from '../../src/types/tournament';
import { createDefaultTournamentState } from '../../src/services/storageService';

describe('Integração de Súmula e Estado Global', () => {
  let defaultState: TournamentState;

  beforeEach(() => {
    defaultState = createDefaultTournamentState();
  });

  it('deve sincronizar placar de partida da 1ª fase e recalcular classificação ao salvar súmula', () => {
    const targetMatch = defaultState.matches[0]; // Rodada 1, Campo 1
    const homeTeam = defaultState.teams.find(t => t.id === targetMatch.homeTeamId)!;
    const awayTeam = defaultState.teams.find(t => t.id === targetMatch.awayTeamId)!;

    const sheet: MatchScoresheet = {
      matchId: targetMatch.id,
      hasScoresheet: true,
      goals: [
        { id: 'g1', teamId: homeTeam.id, playerIndex: 0, playerName: '#1 Atleta A' },
        { id: 'g2', teamId: homeTeam.id, playerIndex: 1, playerName: '#2 Atleta B' }
      ],
      cards: [],
      observations: 'Súmula preenchida pelo juiz.',
      updatedAt: new Date().toISOString()
    };

    const updatedSheets = { ...defaultState.scoresheets, [sheet.matchId]: sheet };
    const { matches, knockoutMatches } = syncMatchScoresFromScoresheets(
      defaultState.matches,
      defaultState.knockoutMatches,
      updatedSheets
    );

    const updatedTargetMatch = matches.find(m => m.id === targetMatch.id)!;
    expect(updatedTargetMatch.homeScore).toBe(2);
    expect(updatedTargetMatch.awayScore).toBe(0);
    expect(updatedTargetMatch.status).toBe('FINISHED');

    // Recálculo da classificação com base nos jogos sincronizados
    const standings = calculateStandings(defaultState.teams, matches);
    const homeStanding = standings.find(s => s.teamId === homeTeam.id)!;
    const awayStanding = standings.find(s => s.teamId === awayTeam.id)!;

    expect(homeStanding.points).toBe(3);
    expect(homeStanding.won).toBe(1);
    expect(homeStanding.goalsFor).toBe(2);
    expect(awayStanding.points).toBe(0);
    expect(awayStanding.lost).toBe(1);
  });

  it('deve desativar a sincronização quando a súmula é removida', () => {
    const targetMatch = defaultState.matches[0];
    const sheet: MatchScoresheet = {
      matchId: targetMatch.id,
      hasScoresheet: true,
      goals: [{ id: 'g1', teamId: targetMatch.homeTeamId, playerIndex: 0, playerName: '#1 Atleta' }],
      cards: [],
      observations: '',
      updatedAt: new Date().toISOString()
    };

    let sheets = { [targetMatch.id]: sheet };
    let synced = syncMatchScoresFromScoresheets(defaultState.matches, defaultState.knockoutMatches, sheets);
    expect(synced.matches[0].homeScore).toBe(1);

    // Remoção da súmula
    delete sheets[targetMatch.id];
    expect(sheets[targetMatch.id]).toBeUndefined();
  });
});
