import { describe, it, expect } from 'vitest';
import { exportTournamentBackup, importTournamentBackup, saveTournamentBackupFile } from '../../src/services/backupService';
import { TournamentState } from '../../src/types/tournament';
import { INITIAL_TEAMS, INITIAL_MATCHES, INITIAL_KNOCKOUT_MATCHES } from '../../src/data/initialTournamentData';

describe('Serviço de Backup e Restauração (BackupService)', () => {
  const validState: TournamentState = {
    teams: INITIAL_TEAMS,
    matches: INITIAL_MATCHES,
    knockoutMatches: INITIAL_KNOCKOUT_MATCHES,
    version: 1,
    lastUpdated: '2026-10-08T18:00:00.000Z'
  };

  it('deve exportar o estado do torneio em formato JSON válido e indentado', () => {
    const json = exportTournamentBackup(validState);
    expect(typeof json).toBe('string');
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
    expect(parsed.teams).toHaveLength(7);
    expect(parsed.matches).toHaveLength(21);
    expect(parsed.knockoutMatches).toHaveLength(4);
  });

  it('deve importar com sucesso um backup JSON íntegro', () => {
    const json = exportTournamentBackup(validState);
    const result = importTournamentBackup(json);
    expect(result.success).toBe(true);
    expect(result.state).toBeDefined();
    expect(result.state?.teams).toHaveLength(7);
    expect(result.state?.matches).toHaveLength(21);
  });

  it('deve rejeitar backup corrompido que não seja JSON válido', () => {
    const invalidJson = 'arquivo_de_texto_qualquer_sem_json';
    const result = importTournamentBackup(invalidJson);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Falha ao processar arquivo JSON');
  });

  it('deve rejeitar backup que não possua as 7 equipes requeridas', () => {
    const invalidState = {
      ...validState,
      teams: validState.teams.slice(0, 5) // apenas 5 times
    };
    const json = JSON.stringify(invalidState);
    const result = importTournamentBackup(json);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Backup deve conter exatamente 7 equipes');
  });

  it('deve rejeitar backup que não possua as 21 partidas da 1ª fase', () => {
    const invalidState = {
      ...validState,
      matches: validState.matches.slice(0, 10) // apenas 10 partidas
    };
    const json = JSON.stringify(invalidState);
    const result = importTournamentBackup(json);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Backup deve conter exatamente 21 partidas');
  });

  it('deve rejeitar backup que não possua os 4 confrontos de mata-mata', () => {
    const invalidState = {
      ...validState,
      knockoutMatches: [] // vazio
    };
    const json = JSON.stringify(invalidState);
    const result = importTournamentBackup(json);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Backup deve conter exatamente 4 confrontos');
  });

  it('deve executar saveTournamentBackupFile com retorno de sucesso', async () => {
    const result = await saveTournamentBackupFile(validState);
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
