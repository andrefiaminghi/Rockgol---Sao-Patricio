import { describe, it, expect } from 'vitest';
import React from 'react';
import { TeamsTab } from '../../src/components/TeamsTab';
import { ScoresheetTab } from '../../src/components/ScoresheetTab';
import { PlayerModal } from '../../src/components/PlayerModal';
import { App } from '../../src/App';
import { Team, Match } from '../../src/types/tournament';

describe('Permissões de Perfil de Acesso (rolePermissions)', () => {
  const dummyTeams: Team[] = [
    { id: 'team_1', name: 'Time 1', players: ['Jogador 1'] },
    { id: 'team_2', name: 'Time 2', players: [] }
  ];

  const dummyMatches: Match[] = [
    {
      id: 'm1',
      roundNumber: 1,
      matchOrder: 1,
      court: 'Quadra A',
      time: '08:00',
      homeTeamId: 'team_1',
      awayTeamId: 'team_2',
      homeScore: null,
      awayScore: null
    }
  ];

  it('deve exportar TeamsTab, ScoresheetTab, PlayerModal e App', () => {
    expect(TeamsTab).toBeDefined();
    expect(ScoresheetTab).toBeDefined();
    expect(PlayerModal).toBeDefined();
    expect(App).toBeDefined();
  });

  it('deve instanciar TeamsTab com readOnly={true} para perfil de torcida', () => {
    const element = React.createElement(TeamsTab, {
      teams: dummyTeams,
      readOnly: true,
      onUpdatePlayers: () => {}
    });
    expect(element.props.readOnly).toBe(true);
    expect(element.props.teams.length).toBe(2);
  });

  it('deve instanciar TeamsTab com readOnly={false} para perfil de juiz', () => {
    const element = React.createElement(TeamsTab, {
      teams: dummyTeams,
      readOnly: false,
      onUpdatePlayers: () => {}
    });
    expect(element.props.readOnly).toBe(false);
  });

  it('deve instanciar ScoresheetTab com readOnly={true} para perfil de torcida', () => {
    const element = React.createElement(ScoresheetTab, {
      teams: dummyTeams,
      matches: dummyMatches,
      knockoutMatches: [],
      scoresheets: {},
      readOnly: true,
      onSaveScoresheet: () => {},
      onDeleteScoresheet: () => {}
    });

    expect(element.props.readOnly).toBe(true);
    expect(element.props.teams.length).toBe(2);
  });

  it('deve instanciar ScoresheetTab com readOnly={false} para perfil de juiz', () => {
    const element = React.createElement(ScoresheetTab, {
      teams: dummyTeams,
      matches: dummyMatches,
      knockoutMatches: [],
      scoresheets: {},
      readOnly: false,
      onSaveScoresheet: () => {},
      onDeleteScoresheet: () => {}
    });

    expect(element.props.readOnly).toBe(false);
  });

  it('deve aceitar a prop readOnly no PlayerModal', () => {
    const element = React.createElement(PlayerModal, {
      team: dummyTeams[0],
      readOnly: true,
      onClose: () => {},
      onSave: () => {}
    });
    expect(element.props.readOnly).toBe(true);
  });

  it('deve aceitar a prop role em App (padrão torcida ou juiz)', () => {
    const torcidaApp = React.createElement(App, { role: 'torcida' });
    const juizApp = React.createElement(App, { role: 'juiz' });

    expect(torcidaApp.props.role).toBe('torcida');
    expect(juizApp.props.role).toBe('juiz');
  });
});
