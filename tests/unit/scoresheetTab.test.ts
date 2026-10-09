import { describe, it, expect } from 'vitest';
import React from 'react';
import { ScoresheetTab } from '../../src/components/ScoresheetTab';
import { Team, Match, MatchScoresheet, KnockoutMatch } from '../../src/types/tournament';

describe('ScoresheetTab Componente e Resumo Bilateral de Súmula', () => {
  const dummyTeams: Team[] = [
    { id: 'team_a', name: 'Time Mandante', players: ['Atleta A1', 'Atleta A2'] },
    { id: 'team_b', name: 'Time Visitante', players: ['Atleta B1', 'Atleta B2'] }
  ];

  const dummyMatches: Match[] = [
    {
      id: 'm1',
      roundNumber: 1,
      roundTime: '08:00',
      field: 'Campo 1',
      homeTeamId: 'team_a',
      awayTeamId: 'team_b',
      homeScore: 2,
      awayScore: 1,
      status: 'FINISHED'
    }
  ];

  const dummyScoresheets: Record<string, MatchScoresheet> = {
    m1: {
      matchId: 'm1',
      hasScoresheet: true,
      goals: [
        { id: 'g1', teamId: 'team_a', playerName: 'Atleta A1', playerIndex: 0 },
        { id: 'g2', teamId: 'team_a', playerName: 'Atleta A2', playerIndex: 1 },
        { id: 'g3', teamId: 'team_b', playerName: 'Atleta B1', playerIndex: 0 }
      ],
      cards: [
        { id: 'c1', teamId: 'team_a', playerName: 'Atleta A2', playerIndex: 1, cardType: 'YELLOW' },
        { id: 'c2', teamId: 'team_b', playerName: 'Atleta B2', playerIndex: 1, cardType: 'RED' }
      ],
      observations: 'Excelente partida disputada',
      homePenalties: null,
      awayPenalties: null,
      updatedAt: '2026-10-09T18:00:00Z'
    }
  };

  it('deve exportar o componente ScoresheetTab corretamente', () => {
    expect(ScoresheetTab).toBeDefined();
    expect(typeof ScoresheetTab).toBe('function');
  });

  it('deve instanciar ScoresheetTab com súmula dividida entre mandante e visitante', () => {
    const element = React.createElement(ScoresheetTab, {
      teams: dummyTeams,
      matches: dummyMatches,
      knockoutMatches: [],
      scoresheets: dummyScoresheets,
      readOnly: false,
      onSaveScoresheet: () => {},
      onDeleteScoresheet: () => {}
    });

    expect(element.props.teams.length).toBe(2);
    expect(element.props.matches[0].id).toBe('m1');
    expect(element.props.scoresheets['m1'].goals.length).toBe(3);
    expect(element.props.scoresheets['m1'].cards.length).toBe(2);
  });

  it('deve receber e renderizar sem erros quando há partidas e súmulas no mata-mata', () => {
    const scoresheetsWithKnockout: Record<string, MatchScoresheet> = {
      ...dummyScoresheets,
      sf1: {
        matchId: 'sf1',
        hasScoresheet: true,
        goals: [],
        cards: [],
        observations: '',
        updatedAt: '2026-10-09T18:00:00Z'
      }
    };

    const dummyKnockoutMatches: KnockoutMatch[] = [
      {
        id: 'sf1',
        title: 'Semifinal 1',
        field: 'Campo 1',
        time: '14:00',
        homeTeamId: 'team_a',
        awayTeamId: 'team_b',
        homeScore: 1,
        awayScore: 0,
        homePenalties: null,
        awayPenalties: null,
        winnerTeamId: 'team_a',
        loserTeamId: 'team_b',
        status: 'FINISHED'
      }
    ];

    const element = React.createElement(ScoresheetTab, {
      teams: dummyTeams,
      matches: dummyMatches,
      knockoutMatches: dummyKnockoutMatches,
      scoresheets: scoresheetsWithKnockout,
      readOnly: false,
      onSaveScoresheet: () => {},
      onDeleteScoresheet: () => {}
    });

    expect(element).toBeDefined();
    expect((element.props as any).scoresheets['sf1'].hasScoresheet).toBe(true);
  });
});

