import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MatchScoresheet, Team } from '../types/tournament';

// Credenciais padrão do Supabase para o RockGol 2026
const SUPABASE_URL = 'https://ihegprwkrmybdrpgodnf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zHKJEkKskBcBNzbU5vwWrA_9vRfLieO';

let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Retorna o cliente Supabase inicializado (Singleton)
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }
  return supabaseClientInstance;
}

/**
 * Verifica se o Supabase está devidamente configurado com URL e chave
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/**
 * Envia ou atualiza uma súmula oficial no Supabase (Upsert)
 */
export async function pushScoresheetToSupabase(
  sheet: MatchScoresheet
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient();
    const payload = {
      match_id: sheet.matchId,
      has_scoresheet: sheet.hasScoresheet,
      goals: sheet.goals || [],
      cards: sheet.cards || [],
      observations: sheet.observations || '',
      home_penalties: sheet.homePenalties ?? null,
      away_penalties: sheet.awayPenalties ?? null,
      updated_at: sheet.updatedAt || new Date().toISOString()
    };

    const { error } = await supabase
      .from('scoresheets')
      .upsert(payload, { onConflict: 'match_id' });

    if (error) {
      console.warn('Erro ao salvar súmula no Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Exceção ao enviar súmula para o Supabase (modo offline):', err?.message || err);
    return { success: false, error: err?.message || 'Erro de conexão com o banco de dados.' };
  }
}

/**
 * Remove uma súmula do Supabase (quando o árbitro clica em limpar súmula)
 */
export async function deleteScoresheetFromSupabase(
  matchId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('scoresheets')
      .delete()
      .eq('match_id', matchId);

    if (error) {
      console.warn('Erro ao remover súmula no Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Exceção ao deletar súmula no Supabase:', err?.message || err);
    return { success: false, error: err?.message || 'Erro de conexão.' };
  }
}

/**
 * Envia ou atualiza o elenco de um time no Supabase
 */
export async function pushTeamToSupabase(
  team: Team
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient();
    const payload = {
      id: team.id,
      name: team.name,
      players: team.players || [],
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('teams')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Erro ao atualizar time no Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Exceção ao enviar time para o Supabase:', err?.message || err);
    return { success: false, error: err?.message || 'Erro de conexão.' };
  }
}

/**
 * Baixa todas as súmulas e elencos de times cadastrados no Supabase
 */
export async function pullTournamentFromSupabase(): Promise<{
  success: boolean;
  scoresheets?: Record<string, MatchScoresheet>;
  teams?: Team[];
  error?: string;
}> {
  try {
    const supabase = getSupabaseClient();

    // 1. Busca todas as súmulas oficiais
    const { data: sheetsData, error: sheetsError } = await supabase
      .from('scoresheets')
      .select('*');

    if (sheetsError) {
      return { success: false, error: sheetsError.message };
    }

    // 2. Busca todos os times
    const { data: teamsData, error: teamsError } = await supabase
      .from('teams')
      .select('*');

    if (teamsError) {
      return { success: false, error: teamsError.message };
    }

    // Mapeamento dos registros para os tipos da aplicação
    const scoresheets: Record<string, MatchScoresheet> = {};
    if (sheetsData && Array.isArray(sheetsData)) {
      sheetsData.forEach((row: any) => {
        scoresheets[row.match_id] = {
          matchId: row.match_id,
          hasScoresheet: Boolean(row.has_scoresheet),
          goals: Array.isArray(row.goals) ? row.goals : [],
          cards: Array.isArray(row.cards) ? row.cards : [],
          observations: row.observations || '',
          homePenalties: row.home_penalties ?? null,
          awayPenalties: row.away_penalties ?? null,
          updatedAt: row.updated_at || new Date().toISOString()
        };
      });
    }

    const teams: Team[] = [];
    if (teamsData && Array.isArray(teamsData)) {
      teamsData.forEach((row: any) => {
        teams.push({
          id: row.id,
          name: row.name,
          players: Array.isArray(row.players) ? row.players : []
        });
      });
    }

    return {
      success: true,
      scoresheets,
      teams
    };
  } catch (err: any) {
    console.warn('Exceção ao sincronizar torneio do Supabase:', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Falha de comunicação com o servidor Supabase.'
    };
  }
}
