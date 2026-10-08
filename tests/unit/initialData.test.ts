import { describe, it, expect } from 'vitest';
import { INITIAL_TEAMS, INITIAL_MATCHES, ROUND_RESTING_TEAMS, INITIAL_KNOCKOUT_MATCHES } from '../../src/data/initialTournamentData';

describe('Dados Canônicos do Torneio RockGol 2026', () => {
  it('deve possuir exatamente 7 equipes oficiais cadastradas', () => {
    expect(INITIAL_TEAMS).toHaveLength(7);
    const teamNames = INITIAL_TEAMS.map(t => t.name);
    expect(teamNames).toContain('Bordogos');
    expect(teamNames).toContain('Meia Boca Jr');
    expect(teamNames).toContain('Os Reis');
    expect(teamNames).toContain('Snow Beast');
    expect(teamNames).toContain('Real Matismo');
    expect(teamNames).toContain('Infarto');
    expect(teamNames).toContain('Time Teu');
  });

  it('cada equipe deve possuir exatamente 10 slots de jogadores disponíveis', () => {
    INITIAL_TEAMS.forEach(team => {
      expect(team.players).toHaveLength(10);
    });
  });

  it('deve possuir exatamente 21 partidas na 1ª fase (Turno Único)', () => {
    expect(INITIAL_MATCHES).toHaveLength(21);
  });

  it('cada equipe deve jogar exatamente 6 partidas na 1ª fase', () => {
    INITIAL_TEAMS.forEach(team => {
      const teamMatches = INITIAL_MATCHES.filter(
        m => m.homeTeamId === team.id || m.awayTeamId === team.id
      );
      expect(teamMatches).toHaveLength(6);
    });
  });

  it('todas as equipes devem jogar contra todas as outras equipes exatamente uma vez', () => {
    for (let i = 0; i < INITIAL_TEAMS.length; i++) {
      for (let j = i + 1; j < INITIAL_TEAMS.length; j++) {
        const teamA = INITIAL_TEAMS[i].id;
        const teamB = INITIAL_TEAMS[j].id;
        const confrontation = INITIAL_MATCHES.filter(
          m => (m.homeTeamId === teamA && m.awayTeamId === teamB) ||
               (m.homeTeamId === teamB && m.awayTeamId === teamA)
        );
        expect(confrontation).toHaveLength(1);
      }
    }
  });

  it('as partidas devem ser distribuídas em 11 rodadas, sendo a rodada 11 com apenas 1 jogo', () => {
    const rounds = new Set(INITIAL_MATCHES.map(m => m.roundNumber));
    expect(rounds.size).toBe(11);

    const r11Matches = INITIAL_MATCHES.filter(m => m.roundNumber === 11);
    expect(r11Matches).toHaveLength(1);
    expect(r11Matches[0].field).toBe('Campo 1');
    expect(r11Matches[0].homeTeamId).toBe('real-matismo');
    expect(r11Matches[0].awayTeamId).toBe('meia-boca');
  });

  it('deve possuir a lista exata de equipes em descanso para as 11 rodadas', () => {
    expect(Object.keys(ROUND_RESTING_TEAMS)).toHaveLength(11);
    expect(ROUND_RESTING_TEAMS[1]).toEqual(['real-matismo', 'infarto', 'time-teu']);
    expect(ROUND_RESTING_TEAMS[11]).toHaveLength(5);
  });

  it('deve possuir os 4 confrontos de mata-mata inicializados', () => {
    expect(INITIAL_KNOCKOUT_MATCHES).toHaveLength(4);
    const ids = INITIAL_KNOCKOUT_MATCHES.map(k => k.id);
    expect(ids).toContain('sf1');
    expect(ids).toContain('sf2');
    expect(ids).toContain('third_place');
    expect(ids).toContain('final');
  });
});
