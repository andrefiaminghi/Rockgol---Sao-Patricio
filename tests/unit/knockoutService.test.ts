import { describe, it, expect } from 'vitest';
import { generateSemifinals, resolveKnockoutMatch, updateFinalsFromSemifinals } from '../../src/services/knockoutService';
import { KnockoutMatch, TeamStanding } from '../../src/types/tournament';
import { INITIAL_KNOCKOUT_MATCHES } from '../../src/data/initialTournamentData';

describe('Serviço de Mata-Mata e Eliminatórias (KnockoutService)', () => {
  const mockStandings: TeamStanding[] = [
    { teamId: 'time-1', teamName: '1º Colocado', points: 15, played: 6, won: 5, drawn: 0, lost: 1, goalsFor: 10, goalsAgainst: 2, goalDifference: 8 },
    { teamId: 'time-2', teamName: '2º Colocado', points: 12, played: 6, won: 4, drawn: 0, lost: 2, goalsFor: 9, goalsAgainst: 4, goalDifference: 5 },
    { teamId: 'time-3', teamName: '3º Colocado', points: 10, played: 6, won: 3, drawn: 1, lost: 2, goalsFor: 7, goalsAgainst: 5, goalDifference: 2 },
    { teamId: 'time-4', teamName: '4º Colocado', points: 9, played: 6, won: 3, drawn: 0, lost: 3, goalsFor: 6, goalsAgainst: 6, goalDifference: 0 },
    { teamId: 'time-5', teamName: '5º Colocado', points: 7, played: 6, won: 2, drawn: 1, lost: 3, goalsFor: 4, goalsAgainst: 6, goalDifference: -2 },
    { teamId: 'time-6', teamName: '6º Colocado', points: 4, played: 6, won: 1, drawn: 1, lost: 4, goalsFor: 3, goalsAgainst: 8, goalDifference: -5 },
    { teamId: 'time-7', teamName: '7º Colocado', points: 2, played: 6, won: 0, drawn: 2, lost: 4, goalsFor: 2, goalsAgainst: 10, goalDifference: -8 }
  ];

  it('deve gerar semifinais cruzando 1º x 4º (SF1) e 2º x 3º (SF2)', () => {
    const updatedKnockout = generateSemifinals(mockStandings, INITIAL_KNOCKOUT_MATCHES);
    const sf1 = updatedKnockout.find(m => m.id === 'sf1')!;
    const sf2 = updatedKnockout.find(m => m.id === 'sf2')!;

    expect(sf1.homeTeamId).toBe('time-1');
    expect(sf1.awayTeamId).toBe('time-4');
    expect(sf1.field).toBe('Campo 1');
    expect(sf1.time).toBe('16:00');

    expect(sf2.homeTeamId).toBe('time-2');
    expect(sf2.awayTeamId).toBe('time-3');
    expect(sf2.field).toBe('Campo 2');
    expect(sf2.time).toBe('16:00');
  });

  it('deve resolver vitória simples no tempo normal sem cobrança de pênaltis', () => {
    const sf1: KnockoutMatch = {
      id: 'sf1',
      title: 'Semifinal 1',
      field: 'Campo 1',
      time: '16:00',
      homeTeamId: 'time-1',
      awayTeamId: 'time-4',
      homeScore: null,
      awayScore: null,
      homePenalties: null,
      awayPenalties: null,
      winnerTeamId: null,
      loserTeamId: null,
      status: 'PENDING'
    };

    const result = resolveKnockoutMatch(sf1, 2, 0);
    expect(result.error).toBeUndefined();
    expect(result.updatedMatch.status).toBe('FINISHED');
    expect(result.updatedMatch.winnerTeamId).toBe('time-1');
    expect(result.updatedMatch.loserTeamId).toBe('time-4');
  });

  it('deve exigir cobrança de pênaltis quando a partida terminar empatada no tempo normal', () => {
    const sf1: KnockoutMatch = {
      id: 'sf1',
      title: 'Semifinal 1',
      field: 'Campo 1',
      time: '16:00',
      homeTeamId: 'time-1',
      awayTeamId: 'time-4',
      homeScore: null,
      awayScore: null,
      homePenalties: null,
      awayPenalties: null,
      winnerTeamId: null,
      loserTeamId: null,
      status: 'PENDING'
    };

    const resultWithoutPenalties = resolveKnockoutMatch(sf1, 1, 1);
    expect(resultWithoutPenalties.error).toBeDefined();
    expect(resultWithoutPenalties.updatedMatch.status).toBe('PENDING');

    const resultEqualPenalties = resolveKnockoutMatch(sf1, 1, 1, 3, 3);
    expect(resultEqualPenalties.error).toBeDefined();

    const resultValidPenalties = resolveKnockoutMatch(sf1, 1, 1, 4, 3);
    expect(resultValidPenalties.error).toBeUndefined();
    expect(resultValidPenalties.updatedMatch.winnerTeamId).toBe('time-1');
    expect(resultValidPenalties.updatedMatch.loserTeamId).toBe('time-4');
  });

  it('deve atualizar Grande Final com os vencedores de SF1 e SF2, e 3º Lugar com os perdedores', () => {
    const knockoutWithSFDone: KnockoutMatch[] = [
      { id: 'sf1', title: 'Semifinal 1', field: 'Campo 1', time: '16:00', homeTeamId: 'time-1', awayTeamId: 'time-4', homeScore: 2, awayScore: 1, homePenalties: null, awayPenalties: null, winnerTeamId: 'time-1', loserTeamId: 'time-4', status: 'FINISHED' },
      { id: 'sf2', title: 'Semifinal 2', field: 'Campo 2', time: '16:00', homeTeamId: 'time-2', awayTeamId: 'time-3', homeScore: 0, awayScore: 1, homePenalties: null, awayPenalties: null, winnerTeamId: 'time-3', loserTeamId: 'time-2', status: 'FINISHED' },
      { id: 'third_place', title: 'Disputa de 3º Lugar', field: 'Campo 1', time: '16:30', homeTeamId: null, awayTeamId: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, winnerTeamId: null, loserTeamId: null, status: 'PENDING' },
      { id: 'final', title: 'Grande Final', field: 'Campo 1', time: '17:00', homeTeamId: null, awayTeamId: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, winnerTeamId: null, loserTeamId: null, status: 'PENDING' }
    ];

    const finalsUpdated = updateFinalsFromSemifinals(knockoutWithSFDone);
    const finalMatch = finalsUpdated.find(m => m.id === 'final')!;
    const thirdPlaceMatch = finalsUpdated.find(m => m.id === 'third_place')!;

    expect(finalMatch.homeTeamId).toBe('time-1');
    expect(finalMatch.awayTeamId).toBe('time-3');

    expect(thirdPlaceMatch.homeTeamId).toBe('time-4');
    expect(thirdPlaceMatch.awayTeamId).toBe('time-2');
  });
});
