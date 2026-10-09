import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import * as ExportTabModule from '../../src/components/ExportTab';
import * as PdfServiceModule from '../../src/services/pdfExportService';
import * as AppModule from '../../src/App';
import * as IOSInstallBannerModule from '../../src/components/IOSInstallBanner';
import { saveTournamentBackupFile } from '../../src/services/backupService';
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

  it('deve exportar o componente auxiliar IOSInstallBanner', () => {
    expect(IOSInstallBannerModule.IOSInstallBanner).toBeDefined();
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

describe('Configurações de PWA, iOS e Resiliência Offline', () => {
  const rootDir = path.resolve(__dirname, '../../');

  it('deve ter manifest.json com escopo e start_url relativos para rodar no GitHub Pages', () => {
    const manifestPath = path.join(rootDir, 'public/manifest.json');
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('./');
    expect(manifest.scope).toBe('./');
    expect(manifest.icons.length).toBeGreaterThan(0);
    manifest.icons.forEach((icon: any) => {
      expect(icon.src.startsWith('/')).toBe(false); // Não pode ter barra absoluta no início
    });
  });

  it('deve ter metatags oficiais da Apple no index.html para modo tela cheia no iOS', () => {
    const indexPath = path.join(rootDir, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf-8');

    expect(content).toContain('apple-mobile-web-app-capable');
    expect(content).toContain('apple-mobile-web-app-status-bar-style');
    expect(content).toContain('apple-mobile-web-app-title');
    expect(content).toContain('viewport-fit=cover');
    expect(content).toContain('rel="apple-touch-icon"');
    expect(content).toContain('href="./manifest.json"');
  });

  it('deve ter Service Worker com precache relativo e estratégia de cache offline dinâmico', () => {
    const swPath = path.join(rootDir, 'public/sw.js');
    const content = fs.readFileSync(swPath, 'utf-8');

    expect(content).toContain('PRECACHE_ASSETS');
    expect(content).toContain("'./'");
    expect(content).toContain("'./index.html'");
    expect(content).toContain('caches.open');
    expect(content).toContain('event.request.mode === \'navigate\'');
  });

  it('deve acionar navigator.share no saveTournamentBackupFile quando suportado no ambiente móvel', async () => {
    const testState: TournamentState = {
      teams: INITIAL_TEAMS,
      matches: INITIAL_MATCHES,
      knockoutMatches: INITIAL_KNOCKOUT_MATCHES,
      version: 1,
      lastUpdated: '2026-10-09T10:00:00.000Z'
    };

    const shareMock = vi.fn().mockResolvedValue(undefined);
    const canShareMock = vi.fn().mockReturnValue(true);

    vi.stubGlobal('navigator', {
      ...global.navigator,
      share: shareMock,
      canShare: canShareMock
    });

    const res = await saveTournamentBackupFile(testState);

    expect(canShareMock).toHaveBeenCalled();
    expect(shareMock).toHaveBeenCalled();
    expect(res.success).toBe(true);
    expect(res.message).toContain('Backup compartilhado com sucesso');

    vi.unstubAllGlobals();
  });

  it('deve tratar cancelamento amigável do menu de compartilhamento do iOS (AbortError)', async () => {
    const testState: TournamentState = {
      teams: INITIAL_TEAMS,
      matches: INITIAL_MATCHES,
      knockoutMatches: INITIAL_KNOCKOUT_MATCHES,
      version: 1,
      lastUpdated: '2026-10-09T10:00:00.000Z'
    };

    const abortError = new Error('The user canceled the share operation.');
    abortError.name = 'AbortError';

    const shareMock = vi.fn().mockRejectedValue(abortError);
    const canShareMock = vi.fn().mockReturnValue(true);

    vi.stubGlobal('navigator', {
      ...global.navigator,
      share: shareMock,
      canShare: canShareMock
    });

    const res = await saveTournamentBackupFile(testState);

    expect(res.success).toBe(true);
    expect(res.message).toContain('cancelado');

    vi.unstubAllGlobals();
  });
});
