import { describe, it, expect } from 'vitest';
import {
  syncMatchScoresFromScoresheets,
  getTopScorers,
  getSuspensions,
  isPlayerSuspended
} from '../../src/services/scoresheetService';
import { Match, KnockoutMatch, Team, MatchScoresheet } from '../../src/types/tournament';

describe('ScoresheetService — Regras de Negócio, Sincronização e Disciplina', () => {
  const mockTeams: Team[] = [
    { id: 'team-1', name: 'Bordogos', players: ['Jogador 1', 'Jogador 2', 'Craque 3'] },
    { id: 'team-2', name: 'Meia Boca Jr', players: ['Atleta 1', 'Atleta 2'] }
  ];

  const mockMatches: Match[] = [
    {
      id: 'match-1',
      roundNumber: 1,
      roundTime: '09:00',
      field: 'Campo 1',
      homeTeamId: 'team-1',
      awayTeamId: 'team-2',
      homeScore: 0,
      awayScore: 0,
      status: 'PENDING'
    },
    {
      id: 'match-2',
      roundNumber: 2,
      roundTime: '09:30',
      field: 'Campo 1',
      homeTeamId: 'team-1',
      awayTeamId: 'team-2',
      homeScore: 3,
      awayScore: 1,
      status: 'FINISHED'
    },
    {
      id: 'match-3',
      roundNumber: 3,
      roundTime: '10:00',
      field: 'Campo 1',
      homeTeamId: 'team-1',
      awayTeamId: 'team-2',
      homeScore: null,
      awayScore: null,
      status: 'PENDING'
    }
  ];

  const mockKnockoutMatches: KnockoutMatch[] = [
    {
      id: 'sf1',
      title: 'Semifinal 1',
      field: 'Campo 1',
      time: '14:00',
      homeTeamId: 'team-1',
      awayTeamId: 'team-2',
      homeScore: null,
      awayScore: null,
      homePenalties: null,
      awayPenalties: null,
      winnerTeamId: null,
      loserTeamId: null,
      status: 'PENDING'
    }
  ];

  describe('1. Sincronização Condicional de Placares', () => {
    it('deve atualizar o placar do jogo automaticamente quando a súmula estiver ativa (hasScoresheet: true)', () => {
      const scoresheets: Record<string, MatchScoresheet> = {
        'match-1': {
          matchId: 'match-1',
          hasScoresheet: true,
          goals: [
            { id: 'g1', teamId: 'team-1', playerIndex: 2, playerName: '#3 Craque 3' },
            { id: 'g2', teamId: 'team-1', playerIndex: 2, playerName: '#3 Craque 3' },
            { id: 'g3', teamId: 'team-2', playerIndex: 0, playerName: '#1 Atleta 1' }
          ],
          cards: [],
          observations: '',
          updatedAt: new Date().toISOString()
        }
      };

      const result = syncMatchScoresFromScoresheets(mockMatches, mockKnockoutMatches, scoresheets);
      const match1 = result.matches.find(m => m.id === 'match-1');

      expect(match1).toBeDefined();
      expect(match1?.homeScore).toBe(2);
      expect(match1?.awayScore).toBe(1);
      expect(match1?.status).toBe('FINISHED');
    });

    it('deve atribuir gol contra ao placar da equipe adversária', () => {
      const scoresheets: Record<string, MatchScoresheet> = {
        'match-1': {
          matchId: 'match-1',
          hasScoresheet: true,
          goals: [
            // Time 1 faz gol contra -> conta para Time 2
            { id: 'g1', teamId: 'team-1', playerIndex: null, playerName: 'Gol Contra', isOwnGoal: true }
          ],
          cards: [],
          observations: '',
          updatedAt: new Date().toISOString()
        }
      };

      const result = syncMatchScoresFromScoresheets(mockMatches, mockKnockoutMatches, scoresheets);
      const match1 = result.matches.find(m => m.id === 'match-1');

      expect(match1?.homeScore).toBe(0);
      expect(match1?.awayScore).toBe(1);
    });

    it('deve preservar o placar manual se a partida não possuir súmula ou hasScoresheet for false', () => {
      const scoresheets: Record<string, MatchScoresheet> = {
        'match-2': {
          matchId: 'match-2',
          hasScoresheet: false,
          goals: [{ id: 'g1', teamId: 'team-1', playerIndex: 0, playerName: '#1 Jogador 1' }],
          cards: [],
          observations: '',
          updatedAt: new Date().toISOString()
        }
      };

      const result = syncMatchScoresFromScoresheets(mockMatches, mockKnockoutMatches, scoresheets);
      const match2 = result.matches.find(m => m.id === 'match-2');
      // Placar original (3x1) deve ser estritamente preservado
      expect(match2?.homeScore).toBe(3);
      expect(match2?.awayScore).toBe(1);
    });

    it('deve resetar partidas não sumarizadas quando resetUnscheduledMatches for true, mantendo somente jogos do servidor', () => {
      // Simulação: match-2 tinha placar manual (3x1) mas NÃO está no servidor/scoresheets
      // match-1 possui súmula oficial no servidor (1x0)
      const scoresheets: Record<string, MatchScoresheet> = {
        'match-1': {
          matchId: 'match-1',
          hasScoresheet: true,
          goals: [{ id: 'g1', teamId: 'team-1', playerIndex: 0, playerName: 'Jogador 1' }],
          cards: [],
          observations: '',
          updatedAt: new Date().toISOString()
        }
      };

      const result = syncMatchScoresFromScoresheets(mockMatches, mockKnockoutMatches, scoresheets, true);

      // match-1 deve assumir placar oficial da súmula
      const m1 = result.matches.find(m => m.id === 'match-1');
      expect(m1?.homeScore).toBe(1);
      expect(m1?.awayScore).toBe(0);
      expect(m1?.status).toBe('FINISHED');

      // match-2 tinha placar manual 3x1 mas sem súmula no servidor -> deve ser resetado para null
      const m2 = result.matches.find(m => m.id === 'match-2');
      expect(m2?.homeScore).toBeNull();
      expect(m2?.awayScore).toBeNull();
      expect(m2?.status).toBe('PENDING');
    });
  });

  describe('2. Apuração de Artilharia (getTopScorers)', () => {
    it('deve calcular artilharia em ordem decrescente de gols e ignorar gols contra', () => {
      const scoresheets: Record<string, MatchScoresheet> = {
        'match-1': {
          matchId: 'match-1',
          hasScoresheet: true,
          goals: [
            { id: 'g1', teamId: 'team-1', playerIndex: 2, playerName: '#3 Craque 3' },
            { id: 'g2', teamId: 'team-1', playerIndex: 2, playerName: '#3 Craque 3' },
            { id: 'g3', teamId: 'team-2', playerIndex: 0, playerName: '#1 Atleta 1' },
            { id: 'g4', teamId: 'team-1', playerIndex: null, playerName: 'Gol Contra', isOwnGoal: true }
          ],
          cards: [],
          observations: '',
          updatedAt: new Date().toISOString()
        },
        'match-2': {
          matchId: 'match-2',
          hasScoresheet: true,
          goals: [
            { id: 'g5', teamId: 'team-2', playerIndex: 0, playerName: '#1 Atleta 1' },
            { id: 'g6', teamId: 'team-2', playerIndex: 0, playerName: '#1 Atleta 1' }
          ],
          cards: [],
          observations: '',
          updatedAt: new Date().toISOString()
        }
      };

      const scorers = getTopScorers(mockTeams, scoresheets);
      expect(scorers).toHaveLength(2);
      // Atleta 1 tem 3 gols no total (1 no match-1 + 2 no match-2)
      expect(scorers[0].playerName).toBe('#1 Atleta 1');
      expect(scorers[0].goals).toBe(3);
      expect(scorers[0].teamName).toBe('Meia Boca Jr');

      // Craque 3 tem 2 gols
      expect(scorers[1].playerName).toBe('#3 Craque 3');
      expect(scorers[1].goals).toBe(2);
      expect(scorers[1].teamName).toBe('Bordogos');
    });

    it('deve utilizar o nome do jogador cadastrado na aba Times mesmo se o gol tiver apenas o número salvo', () => {
      const teamsWithNames: Team[] = [
        { id: 'team-1', name: 'Bordogos', players: ['Romário', '', 'Ronaldo'] }
      ];

      const scoresheets: Record<string, MatchScoresheet> = {
        'match-1': {
          matchId: 'match-1',
          hasScoresheet: true,
          goals: [
            { id: 'g1', teamId: 'team-1', playerIndex: 0, playerName: '#1' },
            { id: 'g2', teamId: 'team-1', playerIndex: 2, playerName: '#3' },
            { id: 'g3', teamId: 'team-1', playerIndex: 1, playerName: '#2' }
          ],
          cards: [],
          observations: '',
          updatedAt: new Date().toISOString()
        }
      };

      const scorers = getTopScorers(teamsWithNames, scoresheets);
      const romario = scorers.find(s => s.playerIndex === 0)!;
      const ronaldo = scorers.find(s => s.playerIndex === 2)!;
      const semNome = scorers.find(s => s.playerIndex === 1)!;

      expect(romario.playerName).toBe('#1 Romário');
      expect(ronaldo.playerName).toBe('#3 Ronaldo');
      expect(semNome.playerName).toBe('#2');
    });
  });

  describe('3. Disciplina & Cálculo de Suspensões (getSuspensions e isPlayerSuspended)', () => {
    it('deve suspender atleta por acúmulo de 2 cartões amarelos em jogos diferentes para o próximo jogo', () => {
      const scoresheets: Record<string, MatchScoresheet> = {
        'match-1': {
          matchId: 'match-1',
          hasScoresheet: true,
          goals: [],
          cards: [
            { id: 'c1', teamId: 'team-1', playerIndex: 1, playerName: '#2 Jogador 2', cardType: 'YELLOW' }
          ],
          observations: '',
          updatedAt: new Date().toISOString()
        },
        'match-2': {
          matchId: 'match-2',
          hasScoresheet: true,
          goals: [],
          cards: [
            { id: 'c2', teamId: 'team-1', playerIndex: 1, playerName: '#2 Jogador 2', cardType: 'YELLOW' }
          ],
          observations: '',
          updatedAt: new Date().toISOString()
        }
      };

      const suspensions = getSuspensions(mockTeams, mockMatches, scoresheets);
      expect(suspensions).toHaveLength(1);
      expect(suspensions[0].teamId).toBe('team-1');
      expect(suspensions[0].playerIndex).toBe(1);
      expect(suspensions[0].reason).toBe('ACCUMULATED_YELLOWS');
      // Próxima partida de Team-1 é match-3 (rodada 3)
      expect(suspensions[0].suspendedForRoundNumber).toBe(3);

      expect(isPlayerSuspended('team-1', 1, 3, suspensions)).toBe(true);
      expect(isPlayerSuspended('team-1', 1, 2, suspensions)).toBe(false);
    });

    it('deve suspender atleta imediatamente por 2 amarelos no mesmo jogo (DOUBLE_YELLOW)', () => {
      const scoresheets: Record<string, MatchScoresheet> = {
        'match-1': {
          matchId: 'match-1',
          hasScoresheet: true,
          goals: [],
          cards: [
            { id: 'c1', teamId: 'team-1', playerIndex: 0, playerName: '#1 Jogador 1', cardType: 'YELLOW' },
            { id: 'c2', teamId: 'team-1', playerIndex: 0, playerName: '#1 Jogador 1', cardType: 'YELLOW' }
          ],
          observations: '',
          updatedAt: new Date().toISOString()
        }
      };

      const suspensions = getSuspensions(mockTeams, mockMatches, scoresheets);
      expect(suspensions).toHaveLength(1);
      expect(suspensions[0].playerIndex).toBe(0);
      expect(suspensions[0].reason).toBe('DOUBLE_YELLOW');
      // Próxima partida de Team-1 é match-2 (rodada 2)
      expect(suspensions[0].suspendedForRoundNumber).toBe(2);
    });

    it('deve suspender atleta por cartão vermelho direto (RED_CARD)', () => {
      const scoresheets: Record<string, MatchScoresheet> = {
        'match-1': {
          matchId: 'match-1',
          hasScoresheet: true,
          goals: [],
          cards: [
            { id: 'c1', teamId: 'team-2', playerIndex: 1, playerName: '#2 Atleta 2', cardType: 'RED' }
          ],
          observations: '',
          updatedAt: new Date().toISOString()
        }
      };

      const suspensions = getSuspensions(mockTeams, mockMatches, scoresheets);
      expect(suspensions).toHaveLength(1);
      expect(suspensions[0].teamId).toBe('team-2');
      expect(suspensions[0].playerIndex).toBe(1);
      expect(suspensions[0].reason).toBe('RED_CARD');
      expect(suspensions[0].suspendedForRoundNumber).toBe(2);
    });
  });
});
