import { TournamentState } from '../types/tournament';
import { INITIAL_TEAMS, INITIAL_MATCHES, INITIAL_KNOCKOUT_MATCHES } from '../data/initialTournamentData';

const STORAGE_KEY = 'rockgol_sao_patricio_2026_state';

export function createDefaultTournamentState(): TournamentState {
  return {
    teams: INITIAL_TEAMS,
    matches: INITIAL_MATCHES,
    knockoutMatches: INITIAL_KNOCKOUT_MATCHES,
    scoresheets: {},
    version: 1,
    lastUpdated: new Date().toISOString()
  };
}

export function loadTournamentState(): TournamentState {
  if (typeof window === 'undefined') {
    return createDefaultTournamentState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = createDefaultTournamentState();
      saveTournamentState(fresh);
      return fresh;
    }

    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.teams) && Array.isArray(parsed.matches)) {
      return {
        ...parsed,
        scoresheets: parsed.scoresheets || {}
      } as TournamentState;
    }
  } catch (err) {
    console.error('Falha ao ler localStorage, utilizando estado padrão:', err);
  }

  return createDefaultTournamentState();
}

export function saveTournamentState(state: TournamentState): void {
  if (typeof window === 'undefined') return;
  try {
    const updated = {
      ...state,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Erro ao salvar no localStorage:', err);
  }
}

export function resetTournamentState(): TournamentState {
  const defaultState = createDefaultTournamentState();
  saveTournamentState(defaultState);
  return defaultState;
}
