import { describe, it, expect, beforeEach } from 'vitest';
import { loadTournamentState, saveTournamentState, createDefaultTournamentState } from '../../src/services/storageService';
import { MatchScoresheet } from '../../src/types/tournament';

describe('Scoresheet Types & Storage Retrocompatibility', () => {
  let storageStore: Record<string, string> = {};

  beforeEach(() => {
    storageStore = {};
    (globalThis as any).window = globalThis;
    (globalThis as any).localStorage = {
      getItem: (key: string) => storageStore[key] || null,
      setItem: (key: string, value: string) => { storageStore[key] = value; },
      removeItem: (key: string) => { delete storageStore[key]; },
      clear: () => { storageStore = {}; }
    };
  });

  it('deve inicializar createDefaultTournamentState com mapa scoresheets vazio', () => {
    const defaultState = createDefaultTournamentState();
    expect(defaultState.scoresheets).toBeDefined();
    expect(typeof defaultState.scoresheets).toBe('object');
    expect(Object.keys(defaultState.scoresheets).length).toBe(0);
  });

  it('deve garantir fallback para scoresheets: {} ao carregar estado legado do localStorage', () => {
    const legacyState = {
      teams: [],
      matches: [],
      knockoutMatches: [],
      version: 1,
      lastUpdated: new Date().toISOString()
    };
    (globalThis as any).localStorage.setItem('rockgol_sao_patricio_2026_state', JSON.stringify(legacyState));

    const loaded = loadTournamentState();
    expect(loaded.scoresheets).toBeDefined();
    expect(typeof loaded.scoresheets).toBe('object');
    expect(Object.keys(loaded.scoresheets).length).toBe(0);
  });

  it('deve persistir e recuperar súmulas com gols e cartões corretamente', () => {
    const defaultState = createDefaultTournamentState();
    const sheet: MatchScoresheet = {
      matchId: 'round1-match1',
      hasScoresheet: true,
      goals: [
        {
          id: 'goal-1',
          teamId: 'team-1',
          playerIndex: 0,
          playerName: '#1 Craque',
          isOwnGoal: false
        }
      ],
      cards: [
        {
          id: 'card-1',
          teamId: 'team-1',
          playerIndex: 0,
          playerName: '#1 Craque',
          cardType: 'YELLOW'
        }
      ],
      observations: 'Partida tranquila.',
      updatedAt: new Date().toISOString()
    };

    defaultState.scoresheets = {
      'round1-match1': sheet
    };

    saveTournamentState(defaultState);
    const loaded = loadTournamentState();

    expect(loaded.scoresheets['round1-match1']).toBeDefined();
    expect(loaded.scoresheets['round1-match1'].hasScoresheet).toBe(true);
    expect(loaded.scoresheets['round1-match1'].goals.length).toBe(1);
    expect(loaded.scoresheets['round1-match1'].cards.length).toBe(1);
    expect(loaded.scoresheets['round1-match1'].observations).toBe('Partida tranquila.');
  });
});
