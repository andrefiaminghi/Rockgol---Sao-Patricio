import { TournamentState } from '../types/tournament';

export function exportTournamentBackup(state: TournamentState): string {
  return JSON.stringify(state, null, 2);
}

export function importTournamentBackup(jsonContent: string): {
  success: boolean;
  state?: TournamentState;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonContent);

    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'Arquivo de backup com formato inválido.' };
    }

    if (!Array.isArray(parsed.teams) || parsed.teams.length !== 7) {
      return { success: false, error: 'Backup deve conter exatamente 7 equipes.' };
    }

    if (!Array.isArray(parsed.matches) || parsed.matches.length !== 21) {
      return { success: false, error: 'Backup deve conter exatamente 21 partidas da 1ª fase.' };
    }

    if (!Array.isArray(parsed.knockoutMatches) || parsed.knockoutMatches.length !== 4) {
      return { success: false, error: 'Backup deve conter exatamente 4 confrontos de mata-mata.' };
    }

    return { success: true, state: parsed as TournamentState };
  } catch (err: any) {
    return { success: false, error: `Falha ao processar arquivo JSON: ${err.message}` };
  }
}
