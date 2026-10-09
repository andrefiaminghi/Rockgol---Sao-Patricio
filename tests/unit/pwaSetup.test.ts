import { describe, it, expect } from 'vitest';
import * as ExportTabModule from '../../src/components/ExportTab';
import * as PdfServiceModule from '../../src/services/pdfExportService';
import * as AppModule from '../../src/App';
import { INITIAL_TEAMS, INITIAL_MATCHES, INITIAL_KNOCKOUT_MATCHES } from '../../src/data/initialTournamentData';
import { TournamentState } from '../../src/types/tournament';

describe('Exportação PDF, Backup e Integração Geral (App & ExportTab)', () => {
  it('deve exportar o componente ExportTab', () => {
    expect(ExportTabModule.ExportTab).toBeDefined();
  });

  it('deve exportar o serviço de geração de documento/PDF e compartilhamento', () => {
    expect(PdfServiceModule.generateAndDownloadTournamentPdf).toBeDefined();
    expect(PdfServiceModule.shareReportToWhatsApp).toBeDefined();
  });

  it('deve exportar o componente principal App', () => {
    expect(AppModule.default).toBeDefined();
  });

  it('deve incluir resultado dos pênaltis e vencedor no resumo do WhatsApp quando houver empate no mata-mata', () => {
    const testState: TournamentState = {
      teams: INITIAL_TEAMS,
      matches: INITIAL_MATCHES,
      knockoutMatches: [
        {
          id: 'sf1',
          title: 'Semifinal 1',
          field: 'Campo 1',
          time: '16:00',
          homeTeamId: 'team_1',
          awayTeamId: 'team_4',
          homeScore: 2,
          awayScore: 2,
          homePenalties: 4,
          awayPenalties: 5,
          winnerTeamId: 'team_4',
          loserTeamId: 'team_1',
          status: 'FINISHED'
        },
        ...INITIAL_KNOCKOUT_MATCHES.slice(1)
      ],
      version: 1,
      lastUpdated: '2026-10-08T18:00:00.000Z'
    };

    const summary = PdfServiceModule.generateTournamentWhatsAppSummary(testState);
    expect(summary).toContain('Pênaltis:');
    expect(summary).toContain('4 × 5');
    expect(summary).toContain('venceu nos pênaltis!');
  });

  it('deve dar destaque especial ao Pódio dos Campeões e 3º/4º colocados quando a final for concluída', () => {
    const testState: TournamentState = {
      teams: INITIAL_TEAMS,
      matches: INITIAL_MATCHES,
      knockoutMatches: [
        {
          id: 'sf1',
          title: 'Semifinal 1',
          field: 'Campo 1',
          time: '16:00',
          homeTeamId: 'team_1',
          awayTeamId: 'team_4',
          homeScore: 1,
          awayScore: 0,
          homePenalties: null,
          awayPenalties: null,
          winnerTeamId: 'team_1',
          loserTeamId: 'team_4',
          status: 'FINISHED'
        },
        {
          id: 'sf2',
          title: 'Semifinal 2',
          field: 'Campo 2',
          time: '16:00',
          homeTeamId: 'team_2',
          awayTeamId: 'team_3',
          homeScore: 2,
          awayScore: 0,
          homePenalties: null,
          awayPenalties: null,
          winnerTeamId: 'team_2',
          loserTeamId: 'team_3',
          status: 'FINISHED'
        },
        {
          id: 'third_place',
          title: 'Disputa de 3º Lugar',
          field: 'Campo 2',
          time: '16:30',
          homeTeamId: 'team_4',
          awayTeamId: 'team_3',
          homeScore: 3,
          awayScore: 1,
          homePenalties: null,
          awayPenalties: null,
          winnerTeamId: 'team_4',
          loserTeamId: 'team_3',
          status: 'FINISHED'
        },
        {
          id: 'final',
          title: 'Grande Final',
          field: 'Campo 1',
          time: '17:00',
          homeTeamId: 'team_1',
          awayTeamId: 'team_2',
          homeScore: 1,
          awayScore: 1,
          homePenalties: 6,
          awayPenalties: 5,
          winnerTeamId: 'team_1',
          loserTeamId: 'team_2',
          status: 'FINISHED'
        }
      ],
      version: 1,
      lastUpdated: '2026-10-08T18:00:00.000Z'
    };

    const summary = PdfServiceModule.generateTournamentWhatsAppSummary(testState);
    expect(summary).toContain('PÓDIO DOS CAMPEÕES');
    expect(summary).toContain('CAMPEÃO');
    expect(summary).toContain('VICE-CAMPEÃO');
    expect(summary).toContain('3º Colocado (Bronze)');
    expect(summary).toContain('4º Colocado');
    expect(summary).toContain('CAMPEÃO nos pênaltis!');
  });
});
