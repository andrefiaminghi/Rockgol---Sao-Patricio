import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  pushScoresheetToSupabase,
  deleteScoresheetFromSupabase,
  pushTeamToSupabase,
  pullTournamentFromSupabase,
  isSupabaseConfigured
} from '../../src/services/supabaseService';
import { MatchScoresheet, Team } from '../../src/types/tournament';

const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockEq = vi.fn().mockResolvedValue({ error: null });
const mockDelete = vi.fn(() => ({ eq: mockEq }));
const mockSelect = vi.fn().mockResolvedValue({ data: [], error: null });

const mockFrom = vi.fn((table: string) => {
  if (table === 'scoresheets') {
    return {
      upsert: mockUpsert,
      delete: mockDelete,
      select: mockSelect
    };
  }
  if (table === 'teams') {
    return {
      upsert: mockUpsert,
      select: mockSelect
    };
  }
  return {};
});

// Mock do cliente Supabase para testes controlados
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn(() => ({
      from: mockFrom
    }))
  };
});

describe('Serviço de Sincronização Supabase (supabaseService)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpsert.mockResolvedValue({ error: null });
    mockEq.mockResolvedValue({ error: null });
    mockSelect.mockResolvedValue({ data: [], error: null });
  });

  it('deve confirmar que o Supabase está configurado com URL e Anon Key', () => {
    expect(isSupabaseConfigured()).toBe(true);
  });

  it('deve realizar push de súmula com sucesso para a tabela scoresheets', async () => {
    const sheet: MatchScoresheet = {
      matchId: 'r1_m1',
      hasScoresheet: true,
      goals: [
        { id: 'g1', teamId: 'team_1', playerIndex: 0, playerName: 'Atleta 1', isOwnGoal: false }
      ],
      cards: [],
      observations: 'Partida concluída',
      updatedAt: '2026-10-09T18:00:00.000Z'
    };

    const result = await pushScoresheetToSupabase(sheet);
    expect(result.success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('scoresheets');
    expect(mockUpsert).toHaveBeenCalled();
  });

  it('deve deletar súmula da tabela scoresheets pelo matchId', async () => {
    const result = await deleteScoresheetFromSupabase('r1_m1');
    expect(result.success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('scoresheets');
    expect(mockEq).toHaveBeenCalledWith('match_id', 'r1_m1');
  });

  it('deve realizar push de time e atletas para a tabela teams', async () => {
    const team: Team = {
      id: 'team_1',
      name: 'Time A',
      color: '#00D26A',
      players: ['Jogador 1', 'Jogador 2']
    };

    const result = await pushTeamToSupabase(team);
    expect(result.success).toBe(true);
    expect(mockFrom).toHaveBeenCalledWith('teams');
    expect(mockUpsert).toHaveBeenCalled();
  });

  it('deve realizar pull de todos os dados do torneio (súmulas e times)', async () => {
    mockSelect
      .mockResolvedValueOnce({
        data: [
          {
            match_id: 'r1_m1',
            has_scoresheet: true,
            goals: [{ id: 'g1', teamId: 'team_1', playerIndex: 0, playerName: 'Atleta 1' }],
            cards: [],
            observations: 'Observação teste',
            updated_at: '2026-10-09T18:00:00.000Z'
          }
        ],
        error: null
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'team_1',
            name: 'Time A',
            color: '#00D26A',
            players: ['Jogador 1']
          }
        ],
        error: null
      });

    const result = await pullTournamentFromSupabase();
    expect(result.success).toBe(true);
    expect(result.scoresheets).toBeDefined();
    expect(result.scoresheets!['r1_m1'].hasScoresheet).toBe(true);
    expect(result.teams).toBeDefined();
    expect(result.teams![0].name).toBe('Time A');
  });

  it('deve tratar erro gracioso quando o Supabase retornar falha no pull', async () => {
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: { message: 'Network connection failed' }
    });

    const result = await pullTournamentFromSupabase();
    expect(result.success).toBe(false);
    expect(result.error).toContain('Network connection failed');
  });
});
