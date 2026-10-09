import { describe, it, expect } from 'vitest';
import { applyHardResetFromRemote } from '../../src/services/scoresheetService';
import { TournamentState, MatchScoresheet, Team } from '../../src/types/tournament';
import { INITIAL_TEAMS, INITIAL_MATCHES, INITIAL_KNOCKOUT_MATCHES } from '../../src/data/initialTournamentData';

describe('Protocolo Hard Reset no Sincronismo Supabase (applyHardResetFromRemote)', () => {
  const createDirtyState = (): TournamentState => {
    // Estado local "sujo" com placares simulados e súmulas antigas
    const dirtyMatches = INITIAL_MATCHES.map((m, idx) => {
      if (idx === 0) {
        return { ...m, homeScore: 3, awayScore: 1, status: 'FINISHED' as const };
      }
      if (idx === 1) {
        return { ...m, homeScore: 2, awayScore: 2, status: 'FINISHED' as const };
      }
      return m;
    });

    const dirtyScoresheets: Record<string, MatchScoresheet> = {
      m1: {
        matchId: 'm1',
        hasScoresheet: true,
        goals: [{ id: 'g1', teamId: 't1', playerIndex: 0, playerName: 'Atleta Local', isOwnGoal: false }],
        cards: [],
        observations: 'Súmula antiga local que foi limpa no servidor',
        homePenalties: null,
        awayPenalties: null,
        updatedAt: '2026-10-09T10:00:00.000Z'
      }
    };

    return {
      teams: INITIAL_TEAMS,
      matches: dirtyMatches,
      knockoutMatches: INITIAL_KNOCKOUT_MATCHES,
      scoresheets: dirtyScoresheets,
      version: 1,
      lastUpdated: '2026-10-09T10:00:00.000Z'
    };
  };

  it('deve descartar súmula local antiga se ela foi removida do Supabase (hard reset limpo)', () => {
    const dirtyState = createDirtyState();

    // Supabase retorna sem nenhuma súmula (servidor limpo)
    const remoteData = {
      scoresheets: {},
      teams: []
    };

    const newState = applyHardResetFromRemote(dirtyState, remoteData);

    // Todas as súmulas locais devem ter sido descartadas
    expect(newState.scoresheets).toEqual({});

    // Todos os 21 jogos devem estar no estado virgem (placar null e status PENDING)
    expect(newState.matches.every(m => m.homeScore === null && m.awayScore === null && m.status === 'PENDING')).toBe(true);

    // Chaveamento de mata-mata deve estar virgem
    expect(newState.knockoutMatches.every(m => m.status === 'PENDING' && m.homeScore === null)).toBe(true);
  });

  it('deve aplicar estritamente as súmulas ativas do Supabase e resetar as demais partidas', () => {
    const dirtyState = createDirtyState();

    // Servidor possui apenas a súmula da partida m2 (m1 foi limpa/excluída no servidor)
    const remoteScoresheets: Record<string, MatchScoresheet> = {
      m2: {
        matchId: 'm2',
        hasScoresheet: true,
        goals: [
          { id: 'g_rem_1', teamId: 'barcelona', playerIndex: 1, playerName: 'Gol Oficial Servidor', isOwnGoal: false }
        ],
        cards: [],
        observations: 'Oficial Supabase',
        homePenalties: null,
        awayPenalties: null,
        updatedAt: '2026-10-09T19:00:00.000Z'
      }
    };

    const newState = applyHardResetFromRemote(dirtyState, { scoresheets: remoteScoresheets });

    // m1 não está no servidor -> deve estar resetada
    const m1 = newState.matches.find(m => m.id === 'm1')!;
    expect(m1.homeScore).toBeNull();
    expect(m1.awayScore).toBeNull();
    expect(m1.status).toBe('PENDING');

    // m2 está no servidor -> deve ter placar aplicado
    const m2 = newState.matches.find(m => m.id === 'm2')!;
    expect(m2.status).toBe('FINISHED');
    expect(m2.homeScore !== null || m2.awayScore !== null).toBe(true);

    // O mapa de súmulas deve conter apenas m2
    expect(Object.keys(newState.scoresheets)).toEqual(['m2']);
  });

  it('deve atualizar elencos se o Supabase trouxer tabela teams atualizada', () => {
    const dirtyState = createDirtyState();

    const remoteTeams: Team[] = [
      {
        id: 'bordogos',
        name: 'Bordogos FC (Atualizado)',
        players: ['Novo Atleta 1', 'Novo Atleta 2']
      }
    ];

    const newState = applyHardResetFromRemote(dirtyState, {
      scoresheets: {},
      teams: remoteTeams
    });

    const updatedBordogos = newState.teams.find(t => t.id === 'bordogos')!;
    expect(updatedBordogos.name).toBe('Bordogos FC (Atualizado)');
    expect(updatedBordogos.players).toEqual(['Novo Atleta 1', 'Novo Atleta 2']);

    // Outros times mantidos
    const meiaBoca = newState.teams.find(t => t.id === 'meia-boca')!;
    expect(meiaBoca).toBeDefined();
  });
});
