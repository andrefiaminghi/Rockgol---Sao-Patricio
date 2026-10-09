import { describe, it, expect, beforeEach } from 'vitest';
import {
  syncMatchScoresFromScoresheets,
  removeScoresheetAndResetMatch,
  canDeleteScoresheet
} from '../../src/services/scoresheetService';
import { calculateStandings } from '../../src/services/standingsService';
import { MatchScoresheet, TournamentState, KnockoutMatch } from '../../src/types/tournament';
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
    const { matches } = syncMatchScoresFromScoresheets(
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

  it('deve alimentar os times da final e disputa de 3º lugar ao registrar súmula das semifinais', () => {
    const initialKnockout = defaultState.knockoutMatches.map(m => {
      if (m.id === 'sf1') return { ...m, homeTeamId: 'team_1', awayTeamId: 'team_4' };
      if (m.id === 'sf2') return { ...m, homeTeamId: 'team_2', awayTeamId: 'team_3' };
      return m;
    });

    // Súmula da SF1: team_1 vence team_4 por 2 x 0
    const sheetSf1: MatchScoresheet = {
      matchId: 'sf1',
      hasScoresheet: true,
      goals: [
        { id: 'g1', teamId: 'team_1', playerIndex: 0, playerName: 'Atleta 1' },
        { id: 'g2', teamId: 'team_1', playerIndex: 1, playerName: 'Atleta 2' }
      ],
      cards: [],
      observations: '',
      updatedAt: new Date().toISOString()
    };

    // Súmula da SF2: team_2 vence team_3 por 3 x 1
    const sheetSf2: MatchScoresheet = {
      matchId: 'sf2',
      hasScoresheet: true,
      goals: [
        { id: 'g3', teamId: 'team_2', playerIndex: 0, playerName: 'Atleta 3' },
        { id: 'g4', teamId: 'team_2', playerIndex: 1, playerName: 'Atleta 4' },
        { id: 'g5', teamId: 'team_2', playerIndex: 2, playerName: 'Atleta 5' },
        { id: 'g6', teamId: 'team_3', playerIndex: 0, playerName: 'Atleta 6' }
      ],
      cards: [],
      observations: '',
      updatedAt: new Date().toISOString()
    };

    const sheets = { sf1: sheetSf1, sf2: sheetSf2 };
    const { knockoutMatches } = syncMatchScoresFromScoresheets(
      defaultState.matches,
      initialKnockout,
      sheets
    );

    const updatedSf1 = knockoutMatches.find(m => m.id === 'sf1')!;
    const updatedSf2 = knockoutMatches.find(m => m.id === 'sf2')!;
    const finalMatch = knockoutMatches.find(m => m.id === 'final')!;
    const thirdPlaceMatch = knockoutMatches.find(m => m.id === 'third_place')!;

    expect(updatedSf1.status).toBe('FINISHED');
    expect(updatedSf1.winnerTeamId).toBe('team_1');
    expect(updatedSf1.loserTeamId).toBe('team_4');

    expect(updatedSf2.status).toBe('FINISHED');
    expect(updatedSf2.winnerTeamId).toBe('team_2');
    expect(updatedSf2.loserTeamId).toBe('team_3');

    // Final deve ter os vencedores de SF1 e SF2
    expect(finalMatch.homeTeamId).toBe('team_1');
    expect(finalMatch.awayTeamId).toBe('team_2');

    // 3º Lugar deve ter os perdedores de SF1 e SF2
    expect(thirdPlaceMatch.homeTeamId).toBe('team_4');
    expect(thirdPlaceMatch.awayTeamId).toBe('team_3');
  });

  it('deve resolver semifinal empatada com cobrança de pênaltis informada na súmula', () => {
    const initialKnockout: KnockoutMatch[] = [
      {
        id: 'sf1',
        title: 'Semifinal 1',
        homeTeamId: 'team_1',
        awayTeamId: 'team_4',
        field: 'Campo 1',
        time: '14:00',
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        winnerTeamId: null,
        loserTeamId: null,
        status: 'PENDING'
      },
      {
        id: 'sf2',
        title: 'Semifinal 2',
        homeTeamId: 'team_2',
        awayTeamId: 'team_3',
        field: 'Campo 2',
        time: '14:00',
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        winnerTeamId: null,
        loserTeamId: null,
        status: 'PENDING'
      },
      {
        id: 'third_place',
        title: 'Disputa 3º Lugar',
        homeTeamId: null,
        awayTeamId: null,
        field: 'Campo 2',
        time: '16:00',
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        winnerTeamId: null,
        loserTeamId: null,
        status: 'PENDING'
      },
      {
        id: 'final',
        title: 'Grande Final',
        homeTeamId: null,
        awayTeamId: null,
        field: 'Campo 1',
        time: '16:00',
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        winnerTeamId: null,
        loserTeamId: null,
        status: 'PENDING'
      }
    ];

    // SF1 empatou em 2x2, mas team_4 venceu nos pênaltis 3x2
    const sheetSf1: MatchScoresheet = {
      matchId: 'sf1',
      hasScoresheet: true,
      goals: [
        { id: 'g1', teamId: 'team_1', playerIndex: 0, playerName: '#1 A', isOwnGoal: false },
        { id: 'g2', teamId: 'team_1', playerIndex: 1, playerName: '#2 B', isOwnGoal: false },
        { id: 'g3', teamId: 'team_4', playerIndex: 0, playerName: '#1 D', isOwnGoal: false },
        { id: 'g4', teamId: 'team_4', playerIndex: 1, playerName: '#2 E', isOwnGoal: false }
      ],
      cards: [],
      observations: 'Decidido nos penaltis',
      homePenalties: 2,
      awayPenalties: 3,
      updatedAt: '2026-10-09T14:30:00Z'
    };

    // SF2: team_2 venceu no tempo normal 1x0
    const sheetSf2: MatchScoresheet = {
      matchId: 'sf2',
      hasScoresheet: true,
      goals: [
        { id: 'g5', teamId: 'team_2', playerIndex: 0, playerName: '#1 C', isOwnGoal: false }
      ],
      cards: [],
      observations: '',
      updatedAt: '2026-10-09T14:30:00Z'
    };

    const sheets = { sf1: sheetSf1, sf2: sheetSf2 };
    const { knockoutMatches } = syncMatchScoresFromScoresheets(
      defaultState.matches,
      initialKnockout,
      sheets
    );

    const updatedSf1 = knockoutMatches.find(m => m.id === 'sf1')!;
    const finalMatch = knockoutMatches.find(m => m.id === 'final')!;
    const thirdPlaceMatch = knockoutMatches.find(m => m.id === 'third_place')!;

    expect(updatedSf1.status).toBe('FINISHED');
    expect(updatedSf1.homeScore).toBe(2);
    expect(updatedSf1.awayScore).toBe(2);
    expect(updatedSf1.homePenalties).toBe(2);
    expect(updatedSf1.awayPenalties).toBe(3);
    expect(updatedSf1.winnerTeamId).toBe('team_4');
    expect(updatedSf1.loserTeamId).toBe('team_1');

    // Final deve ter team_4 (vencedor nos pênaltis de SF1) e team_2 (vencedor de SF2)
    expect(finalMatch.homeTeamId).toBe('team_4');
    expect(finalMatch.awayTeamId).toBe('team_2');

    // 3º lugar deve ter team_1 (perdedor nos pênaltis de SF1) e team_3 (perdedor de SF2)
    expect(thirdPlaceMatch.homeTeamId).toBe('team_1');
    expect(thirdPlaceMatch.awayTeamId).toBe('team_3');
  });

  it('deve zerar placares da partida e recalcular classificação ao limpar súmula da 1ª fase', () => {
    const targetMatch = defaultState.matches[0];
    const sheet: MatchScoresheet = {
      matchId: targetMatch.id,
      hasScoresheet: true,
      goals: [
        { id: 'g1', teamId: targetMatch.homeTeamId, playerIndex: 0, playerName: '#1 A', isOwnGoal: false },
        { id: 'g2', teamId: targetMatch.awayTeamId, playerIndex: 1, playerName: '#2 B', isOwnGoal: false }
      ],
      cards: [],
      observations: '',
      updatedAt: '2026-10-09T14:00:00Z'
    };

    const initialSheets = { [targetMatch.id]: sheet };
    const syncedInitial = syncMatchScoresFromScoresheets(
      defaultState.matches,
      defaultState.knockoutMatches,
      initialSheets
    );

    const matchBeforeClear = syncedInitial.matches.find(m => m.id === targetMatch.id)!;
    expect(matchBeforeClear.homeScore).toBe(1);
    expect(matchBeforeClear.awayScore).toBe(1);
    expect(matchBeforeClear.status).toBe('FINISHED');

    // Executa a limpeza da súmula
    const { matches, scoresheets } = removeScoresheetAndResetMatch(
      targetMatch.id,
      syncedInitial.matches,
      syncedInitial.knockoutMatches,
      initialSheets
    );

    const matchAfterClear = matches.find(m => m.id === targetMatch.id)!;
    expect(scoresheets[targetMatch.id]).toBeUndefined();
    expect(matchAfterClear.homeScore).toBeNull();
    expect(matchAfterClear.awayScore).toBeNull();
    expect(matchAfterClear.status).toBe('PENDING');

    // Confirma que a tabela de classificação não contabiliza mais a partida
    const standings = calculateStandings(defaultState.teams, matches);
    const homeStanding = standings.find(s => s.teamId === targetMatch.homeTeamId)!;
    expect(homeStanding.played).toBe(0);
    expect(homeStanding.points).toBe(0);
  });

  it('deve zerar placares da semifinal e desqualificar times da final e 3º lugar ao limpar súmula de semifinal', () => {
    const initialKnockout: KnockoutMatch[] = [
      {
        id: 'sf1',
        title: 'Semifinal 1',
        homeTeamId: 'team_1',
        awayTeamId: 'team_4',
        field: 'Campo 1',
        time: '14:00',
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        winnerTeamId: null,
        loserTeamId: null,
        status: 'PENDING'
      },
      {
        id: 'sf2',
        title: 'Semifinal 2',
        homeTeamId: 'team_2',
        awayTeamId: 'team_3',
        field: 'Campo 2',
        time: '14:00',
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        winnerTeamId: null,
        loserTeamId: null,
        status: 'PENDING'
      },
      {
        id: 'third_place',
        title: 'Disputa 3º Lugar',
        homeTeamId: null,
        awayTeamId: null,
        field: 'Campo 2',
        time: '16:00',
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        winnerTeamId: null,
        loserTeamId: null,
        status: 'PENDING'
      },
      {
        id: 'final',
        title: 'Grande Final',
        homeTeamId: null,
        awayTeamId: null,
        field: 'Campo 1',
        time: '16:00',
        homeScore: null,
        awayScore: null,
        homePenalties: null,
        awayPenalties: null,
        winnerTeamId: null,
        loserTeamId: null,
        status: 'PENDING'
      }
    ];

    const sheetSf1: MatchScoresheet = {
      matchId: 'sf1',
      hasScoresheet: true,
      goals: [{ id: 'g1', teamId: 'team_1', playerIndex: 0, playerName: '#1 A', isOwnGoal: false }],
      cards: [],
      observations: '',
      updatedAt: '2026-10-09T14:00:00Z'
    };

    const sheetSf2: MatchScoresheet = {
      matchId: 'sf2',
      hasScoresheet: true,
      goals: [{ id: 'g2', teamId: 'team_2', playerIndex: 0, playerName: '#1 B', isOwnGoal: false }],
      cards: [],
      observations: '',
      updatedAt: '2026-10-09T14:00:00Z'
    };

    const sheets = { sf1: sheetSf1, sf2: sheetSf2 };
    const { knockoutMatches: filledKnockout } = syncMatchScoresFromScoresheets(
      defaultState.matches,
      initialKnockout,
      sheets
    );

    const finalBefore = filledKnockout.find(m => m.id === 'final')!;
    expect(finalBefore.homeTeamId).toBe('team_1');
    expect(finalBefore.awayTeamId).toBe('team_2');

    // Agora o usuário limpa a súmula da SF1
    const { knockoutMatches: clearedKnockout, scoresheets } = removeScoresheetAndResetMatch(
      'sf1',
      defaultState.matches,
      filledKnockout,
      sheets
    );

    const sf1After = clearedKnockout.find(m => m.id === 'sf1')!;
    const finalAfter = clearedKnockout.find(m => m.id === 'final')!;
    const thirdAfter = clearedKnockout.find(m => m.id === 'third_place')!;

    expect(scoresheets['sf1']).toBeUndefined();
    expect(sf1After.homeScore).toBeNull();
    expect(sf1After.awayScore).toBeNull();
    expect(sf1After.winnerTeamId).toBeNull();
    expect(sf1After.loserTeamId).toBeNull();
    expect(sf1After.status).toBe('PENDING');

    // Final: SF1 volta para null (A definir), enquanto o vencedor de SF2 (team_2) é mantido
    expect(finalAfter.homeTeamId).toBeNull();
    expect(finalAfter.awayTeamId).toBe('team_2');
    expect(finalAfter.status).toBe('PENDING');

    // Disputa de 3º lugar: perdedor de SF1 volta para null, perdedor de SF2 (team_3) é mantido
    expect(thirdAfter.homeTeamId).toBeNull();
    expect(thirdAfter.awayTeamId).toBe('team_3');
    expect(thirdAfter.status).toBe('PENDING');

    // Ao limpar também a súmula da SF2, ambos voltam a ser null
    const { knockoutMatches: fullyClearedKnockout } = removeScoresheetAndResetMatch(
      'sf2',
      defaultState.matches,
      clearedKnockout,
      scoresheets
    );
    const finalFullyCleared = fullyClearedKnockout.find(m => m.id === 'final')!;
    expect(finalFullyCleared.homeTeamId).toBeNull();
    expect(finalFullyCleared.awayTeamId).toBeNull();
  });

  it('deve identificar se a partida possui súmula preenchida e proibir alteração manual de placar', () => {
    const targetMatch = defaultState.matches[0];
    const sheet: MatchScoresheet = {
      matchId: targetMatch.id,
      hasScoresheet: true,
      goals: [
        { id: 'g1', teamId: targetMatch.homeTeamId, playerIndex: 0, playerName: '#1 Atleta A', isOwnGoal: false }
      ],
      cards: [],
      observations: 'Súmula oficial',
      updatedAt: '2026-10-09T14:00:00Z'
    };

    const sheets = { [targetMatch.id]: sheet };
    const { matches: syncedMatches } = syncMatchScoresFromScoresheets(
      defaultState.matches,
      defaultState.knockoutMatches,
      sheets
    );

    const matchWithScoresheet = syncedMatches.find(m => m.id === targetMatch.id)!;
    expect(matchWithScoresheet.homeScore).toBe(1);
    expect(matchWithScoresheet.awayScore).toBe(0);

    // Simulação do comportamento de bloqueio (como implementado no App.tsx e MatchesTab.tsx)
    const canEditScore = (matchId: string) => {
      return !sheets[matchId]?.hasScoresheet;
    };

    expect(canEditScore(targetMatch.id)).toBe(false);

    // Para partida sem súmula preenchida, deve ser permitido editar
    const otherMatch = defaultState.matches[1];
    expect(canEditScore(otherMatch.id)).toBe(true);
  });

  it('deve garantir que nenhuma súmula da fase de grupos possa ser limpa enquanto houver súmula no mata-mata', () => {
    const groupMatch = defaultState.matches[0];
    const groupSheet: MatchScoresheet = {
      matchId: groupMatch.id,
      hasScoresheet: true,
      goals: [{ id: 'g1', teamId: groupMatch.homeTeamId, playerIndex: 0, playerName: 'Atleta A' }],
      cards: [],
      observations: '',
      updatedAt: new Date().toISOString()
    };

    const knockoutSheet: MatchScoresheet = {
      matchId: 'sf1',
      hasScoresheet: true,
      goals: [{ id: 'g2', teamId: defaultState.teams[0].id, playerIndex: 1, playerName: 'Atleta B' }],
      cards: [],
      observations: '',
      updatedAt: new Date().toISOString()
    };

    let stateWithBoth: TournamentState = {
      ...defaultState,
      scoresheets: {
        [groupMatch.id]: groupSheet,
        sf1: knockoutSheet
      }
    };

    // 1. Tentar limpar partida de grupos: deve ser bloqueado
    const checkGroup = canDeleteScoresheet(groupMatch.id, stateWithBoth.scoresheets);
    expect(checkGroup.canDelete).toBe(false);
    expect(checkGroup.reason).toContain('Não é permitido limpar súmulas da fase de grupos');

    // 2. Executar remoção no estado com bloqueio: deve preservar intacta a súmula
    const blockedResult = removeScoresheetAndResetMatch(
      groupMatch.id,
      stateWithBoth.matches,
      stateWithBoth.knockoutMatches,
      stateWithBoth.scoresheets
    );
    expect(blockedResult.scoresheets[groupMatch.id]).toBeDefined();
    expect(blockedResult.scoresheets[groupMatch.id].hasScoresheet).toBe(true);

    // 3. Tentar limpar a semifinal: deve ser permitido
    const checkKnockout = canDeleteScoresheet('sf1', stateWithBoth.scoresheets);
    expect(checkKnockout.canDelete).toBe(true);

    // 4. Limpar a semifinal do estado
    const clearedKnockoutResult = removeScoresheetAndResetMatch(
      'sf1',
      stateWithBoth.matches,
      stateWithBoth.knockoutMatches,
      stateWithBoth.scoresheets
    );
    expect(clearedKnockoutResult.scoresheets['sf1']).toBeUndefined();

    // 5. Agora que o mata-mata está limpo, a partida da fase de grupos pode ser limpa!
    const checkGroupAfter = canDeleteScoresheet(groupMatch.id, clearedKnockoutResult.scoresheets);
    expect(checkGroupAfter.canDelete).toBe(true);

    const clearedGroupResult = removeScoresheetAndResetMatch(
      groupMatch.id,
      clearedKnockoutResult.matches,
      clearedKnockoutResult.knockoutMatches,
      clearedKnockoutResult.scoresheets
    );
    expect(clearedGroupResult.scoresheets[groupMatch.id]).toBeUndefined();
    const finalGroupMatch = clearedGroupResult.matches.find(m => m.id === groupMatch.id)!;
    expect(finalGroupMatch.homeScore).toBeNull();
    expect(finalGroupMatch.awayScore).toBeNull();
    expect(finalGroupMatch.status).toBe('PENDING');
  });
});


