import { describe, it, expect } from 'vitest';
import { calculateStandings, isGroupStageCompleted } from '../../src/services/standingsService';
import { Team, Match } from '../../src/types/tournament';
import { INITIAL_TEAMS } from '../../src/data/initialTournamentData';

describe('Serviço de Classificação e Desempate (StandingsService)', () => {
  const baseTeams: Team[] = INITIAL_TEAMS;

  it('deve inicializar todos os times com 0 pontos e 0 jogos quando não houver partidas finalizadas', () => {
    const matches: Match[] = [
      { id: 'm1', roundNumber: 1, roundTime: '09:00', field: 'Campo 1', homeTeamId: 'bordogos', awayTeamId: 'meia-boca', homeScore: null, awayScore: null, status: 'PENDING' }
    ];

    const standings = calculateStandings(baseTeams, matches);
    expect(standings).toHaveLength(7);
    standings.forEach(s => {
      expect(s.points).toBe(0);
      expect(s.played).toBe(0);
      expect(s.won).toBe(0);
      expect(s.drawn).toBe(0);
      expect(s.lost).toBe(0);
    });
  });

  it('deve atribuir 3 pontos para vitória e 0 para derrota', () => {
    const matches: Match[] = [
      { id: 'm1', roundNumber: 1, roundTime: '09:00', field: 'Campo 1', homeTeamId: 'bordogos', awayTeamId: 'meia-boca', homeScore: 3, awayScore: 1, status: 'FINISHED' }
    ];

    const standings = calculateStandings(baseTeams, matches);
    const bordogos = standings.find(s => s.teamId === 'bordogos')!;
    const meiaBoca = standings.find(s => s.teamId === 'meia-boca')!;

    expect(bordogos.points).toBe(3);
    expect(bordogos.won).toBe(1);
    expect(bordogos.goalDifference).toBe(2);
    expect(meiaBoca.points).toBe(0);
    expect(meiaBoca.lost).toBe(1);
    expect(meiaBoca.goalDifference).toBe(-2);
  });

  it('deve atribuir 1 ponto para cada time em caso de empate', () => {
    const matches: Match[] = [
      { id: 'm1', roundNumber: 1, roundTime: '09:00', field: 'Campo 1', homeTeamId: 'os-reis', awayTeamId: 'snow-beast', homeScore: 2, awayScore: 2, status: 'FINISHED' }
    ];

    const standings = calculateStandings(baseTeams, matches);
    const osReis = standings.find(s => s.teamId === 'os-reis')!;
    const snowBeast = standings.find(s => s.teamId === 'snow-beast')!;

    expect(osReis.points).toBe(1);
    expect(osReis.drawn).toBe(1);
    expect(snowBeast.points).toBe(1);
    expect(snowBeast.drawn).toBe(1);
  });

  it('deve desempatar por número de vitórias', () => {
    // Time A: 4 pontos (1 V, 1 E)
    // Time B: 4 pontos (0 V, 4 E) -> Time A deve ficar na frente
    const testTeams: Team[] = [
      { id: 'team-a', name: 'Alpha', players: Array(10).fill('') },
      { id: 'team-b', name: 'Beta', players: Array(10).fill('') }
    ];

    const matches: Match[] = [
      { id: 'm1', roundNumber: 1, roundTime: '09:00', field: 'Campo 1', homeTeamId: 'team-a', awayTeamId: 'team-c', homeScore: 1, awayScore: 0, status: 'FINISHED' },
      { id: 'm2', roundNumber: 2, roundTime: '09:30', field: 'Campo 1', homeTeamId: 'team-a', awayTeamId: 'team-d', homeScore: 0, awayScore: 0, status: 'FINISHED' },
      { id: 'm3', roundNumber: 1, roundTime: '09:00', field: 'Campo 2', homeTeamId: 'team-b', awayTeamId: 'team-c', homeScore: 0, awayScore: 0, status: 'FINISHED' },
      { id: 'm4', roundNumber: 2, roundTime: '09:30', field: 'Campo 2', homeTeamId: 'team-b', awayTeamId: 'team-d', homeScore: 0, awayScore: 0, status: 'FINISHED' },
      { id: 'm5', roundNumber: 3, roundTime: '10:00', field: 'Campo 1', homeTeamId: 'team-b', awayTeamId: 'team-e', homeScore: 0, awayScore: 0, status: 'FINISHED' },
      { id: 'm6', roundNumber: 4, roundTime: '10:30', field: 'Campo 1', homeTeamId: 'team-b', awayTeamId: 'team-f', homeScore: 0, awayScore: 0, status: 'FINISHED' }
    ];

    const standings = calculateStandings(testTeams, matches);
    expect(standings[0].teamId).toBe('team-a');
    expect(standings[1].teamId).toBe('team-b');
  });

  it('deve desempatar por confronto direto quando duas equipes possuem mesmos pontos, vitórias, saldo e gols pró', () => {
    const testTeams: Team[] = [
      { id: 'team-a', name: 'Time A', players: Array(10).fill('') },
      { id: 'team-b', name: 'Time B', players: Array(10).fill('') }
    ];

    // Jogo direto entre A e B: A 2 x 1 B (A vence)
    // Jogo com terceiro time C: A 0 x 1 C e B 1 x 0 C
    // Resumo:
    // A: 3 pts (1 V, 0 E, 1 D), GP: 2, GC: 2, SG: 0
    // B: 3 pts (1 V, 0 E, 1 D), GP: 2, GC: 2, SG: 0
    // Confronto direto: A venceu B -> A deve ficar em 1º
    const matches: Match[] = [
      { id: 'm1', roundNumber: 1, roundTime: '09:00', field: 'Campo 1', homeTeamId: 'team-a', awayTeamId: 'team-b', homeScore: 2, awayScore: 1, status: 'FINISHED' },
      { id: 'm2', roundNumber: 2, roundTime: '09:30', field: 'Campo 1', homeTeamId: 'team-a', awayTeamId: 'team-c', homeScore: 0, awayScore: 1, status: 'FINISHED' },
      { id: 'm3', roundNumber: 3, roundTime: '10:00', field: 'Campo 1', homeTeamId: 'team-b', awayTeamId: 'team-c', homeScore: 1, awayScore: 0, status: 'FINISHED' }
    ];

    const standings = calculateStandings(testTeams, matches);
    expect(standings[0].teamId).toBe('team-a');
    expect(standings[1].teamId).toBe('team-b');
  });

  it('isGroupStageCompleted deve retornar false se nem todas as 21 partidas estiverem FINISHED', () => {
    const matches: Match[] = Array.from({ length: 21 }, (_, i) => ({
      id: `m${i}`,
      roundNumber: 1,
      roundTime: '09:00',
      field: 'Campo 1',
      homeTeamId: 'bordogos',
      awayTeamId: 'meia-boca',
      homeScore: i < 20 ? 1 : null,
      awayScore: i < 20 ? 0 : null,
      status: i < 20 ? 'FINISHED' : 'PENDING'
    }));

    expect(isGroupStageCompleted(matches)).toBe(false);
  });

  it('isGroupStageCompleted deve retornar true quando todas as 21 partidas estiverem FINISHED', () => {
    const matches: Match[] = Array.from({ length: 21 }, (_, i) => ({
      id: `m${i}`,
      roundNumber: 1,
      roundTime: '09:00',
      field: 'Campo 1',
      homeTeamId: 'bordogos',
      awayTeamId: 'meia-boca',
      homeScore: 1,
      awayScore: 0,
      status: 'FINISHED'
    }));

    expect(isGroupStageCompleted(matches)).toBe(true);
  });
});
