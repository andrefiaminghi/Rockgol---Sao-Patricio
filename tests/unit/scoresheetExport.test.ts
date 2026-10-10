import { describe, it, expect, vi } from 'vitest';

// Mock do jsPDF para ambiente de testes unitários Node.js
const mockSave = vi.fn();
const mockAddPage = vi.fn();

vi.mock('jspdf', () => {
  return {
    jsPDF: class {
      setFillColor() { return this; }
      rect() { return this; }
      setTextColor() { return this; }
      setFont() { return this; }
      setFontSize() { return this; }
      text() { return this; }
      setDrawColor() { return this; }
      setLineWidth() { return this; }
      line() { return this; }
      circle() { return this; }
      roundedRect() { return this; }
      addPage(...args: any[]) {
        mockAddPage(...args);
        return this;
      }
      save(...args: any[]) {
        mockSave(...args);
        return this;
      }
      output() { return new Blob(['fake pdf content'], { type: 'application/pdf' }); }
    }
  };
});

import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  formatTopScorersForWhatsApp,
  formatSuspensionsForWhatsApp,
  shareTopScorersToWhatsApp,
  shareSuspensionsToWhatsApp,
  generateAndDownloadTournamentPdf
} from '../../src/services/pdfExportService';
import { ExportTab } from '../../src/components/ExportTab';
import { Navigation } from '../../src/components/Navigation';
import { TopScorer, PlayerSuspension, TournamentState } from '../../src/types/tournament';
import { INITIAL_TEAMS, INITIAL_MATCHES, INITIAL_KNOCKOUT_MATCHES } from '../../src/data/initialTournamentData';

describe('Exportação de Súmulas e WhatsApp (scoresheetExport)', () => {
  describe('formatTopScorersForWhatsApp', () => {
    it('deve retornar mensagem amigável quando não houver artilheiros registrados', () => {
      const result = formatTopScorersForWhatsApp([]);
      expect(result).toContain('*⚽ ROCKGOL 2026 — ARTILHARIA OFICIAL*');
      expect(result).toContain('Nenhum gol registrado até o momento.');
    });

    it('deve formatar lista de artilheiros com medalhas e quantidade de gols', () => {
      const mockScorers: TopScorer[] = [
        { teamId: 't1', teamName: 'Time Alpha', playerIndex: 0, playerName: 'Carlos', goals: 4 },
        { teamId: 't2', teamName: 'Time Beta', playerIndex: 1, playerName: 'André', goals: 3 },
        { teamId: 't3', teamName: 'Time Gama', playerIndex: 2, playerName: 'Pedro', goals: 2 },
        { teamId: 't1', teamName: 'Time Alpha', playerIndex: 3, playerName: 'Lucas', goals: 1 },
      ];

      const result = formatTopScorersForWhatsApp(mockScorers);
      expect(result).toContain('🥇 *Carlos* (Time Alpha) — *4* gol(s)');
      expect(result).toContain('🥈 *André* (Time Beta) — *3* gol(s)');
      expect(result).toContain('🥉 *Pedro* (Time Gama) — *2* gol(s)');
      expect(result).toContain('⚽ *Lucas* (Time Alpha) — *1* gol(s)');
    });
  });

  describe('formatSuspensionsForWhatsApp', () => {
    it('deve retornar mensagem de fair play quando não houver atletas suspensos', () => {
      const result = formatSuspensionsForWhatsApp([]);
      expect(result).toContain('*🚫 ROCKGOL 2026 — QUADRO DE SUSPENSÕES*');
      expect(result).toContain('Nenhum atleta suspenso no momento. Fair play total!');
    });

    it('deve formatar suspensões por cartão vermelho direto, duplo amarelo e acúmulo', () => {
      const mockSuspensions: PlayerSuspension[] = [
        {
          teamId: 't1',
          teamName: 'Time Alpha',
          playerIndex: 0,
          playerName: 'Roberto',
          suspendedForRoundNumber: 3,
          reason: 'RED_CARD',
          originMatchId: 'm1'
        },
        {
          teamId: 't2',
          teamName: 'Time Beta',
          playerIndex: 1,
          playerName: 'Marcos',
          suspendedForRoundNumber: 4,
          reason: 'DOUBLE_YELLOW',
          originMatchId: 'm2'
        },
        {
          teamId: 't3',
          teamName: 'Time Gama',
          playerIndex: 2,
          playerName: 'Felipe',
          suspendedForRoundNumber: 5,
          reason: 'ACCUMULATED_YELLOWS',
          originMatchId: 'm3'
        }
      ];

      const result = formatSuspensionsForWhatsApp(mockSuspensions);
      expect(result).toContain('• *Roberto* (Time Alpha)');
      expect(result).toContain('Suspenso para a Rodada 3 (🟥 Cartão Vermelho)');
      expect(result).toContain('• *Marcos* (Time Beta)');
      expect(result).toContain('Suspenso para a Rodada 4 (🟨🟨 2 Amarelos no Jogo)');
      expect(result).toContain('• *Felipe* (Time Gama)');
      expect(result).toContain('Suspenso para a Rodada 5 (🟨 2 Amarelos Acumulados)');
    });
  });

  describe('Funções de compartilhamento direto para WhatsApp', () => {
    it('deve exportar as funções shareTopScorersToWhatsApp e shareSuspensionsToWhatsApp', () => {
      expect(typeof shareTopScorersToWhatsApp).toBe('function');
      expect(typeof shareSuspensionsToWhatsApp).toBe('function');
    });
  });

  describe('Geração de Relatório Consolidado em PDF com Súmulas', () => {
    it('deve gerar PDF oficial adicionando página de Súmulas e salvando com sucesso', () => {
      mockSave.mockClear();
      mockAddPage.mockClear();

      const stateWithScoresheets: TournamentState = {
        teams: INITIAL_TEAMS,
        matches: INITIAL_MATCHES,
        knockoutMatches: INITIAL_KNOCKOUT_MATCHES,
        scoresheets: {
          match_1: {
            matchId: 'match_1',
            hasScoresheet: true,
            goals: [
              { id: 'g1', teamId: INITIAL_TEAMS[0].id, playerIndex: 0, playerName: 'Atleta Teste 1' },
              { id: 'g2', teamId: INITIAL_TEAMS[1].id, playerIndex: 1, playerName: 'Atleta Teste 2' }
            ],
            cards: [
              { id: 'c1', teamId: INITIAL_TEAMS[0].id, playerIndex: 2, playerName: 'Atleta Cartão', cardType: 'RED' }
            ],
            observations: 'Jogo com arbitragem tranquila e clima amigável.',
            updatedAt: new Date().toISOString()
          }
        },
        version: 1,
        lastUpdated: new Date().toISOString()
      };

      const result = generateAndDownloadTournamentPdf(stateWithScoresheets);

      expect(result).toBeDefined();
      expect(result.filename).toContain('RockGol_2026_Relatorio_');
      expect(result.shareSummary).toBeDefined();
      expect(mockAddPage).toHaveBeenCalledWith('a4', 'portrait');
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('Componente ExportTab e Navegação da Aba Info', () => {
    it('deve exportar o componente ExportTab atualizado', () => {
      expect(ExportTab).toBeDefined();
    });

    it('Navigation deve exibir a aba com o nome Info e não mais Exportar', () => {
      const htmlNav = renderToString(
        React.createElement(Navigation, { activeTab: 'export', onTabChange: () => {} })
      );

      expect(htmlNav).toContain('Info');
      expect(htmlNav).not.toContain('Exportar');
    });

    it('ExportTab deve renderizar título Informações Gerais, sem menção a PDF/Whatsapp/Json no subtítulo', () => {
      const dummyState: TournamentState = {
        teams: INITIAL_TEAMS,
        matches: INITIAL_MATCHES,
        knockoutMatches: INITIAL_KNOCKOUT_MATCHES,
        scoresheets: {},
        version: 1,
        lastUpdated: new Date().toISOString()
      };

      const htmlTab = renderToString(
        React.createElement(ExportTab, {
          state: dummyState,
          onRestoreState: () => {},
          onResetState: () => {}
        })
      );

      // Deve ter Informações Gerais e não ter Exportação & Relatórios
      expect(htmlTab).toContain('Informações Gerais');
      expect(htmlTab).not.toContain('Exportação &amp; Relatórios');
      expect(htmlTab).not.toContain('Exportação & Relatórios');

      // Não deve ter o subtítulo PDF • WhatsApp • JSON
      expect(htmlTab).not.toContain('PDF • WhatsApp • JSON');
      expect(htmlTab).not.toContain('PDF - Whatsapp - Json');
    });

    it('ExportTab não deve conter o bloco Backup e Sincronização e deve incluir Desenvolvido por AFR Soluções como último bloco', () => {
      const dummyState: TournamentState = {
        teams: INITIAL_TEAMS,
        matches: INITIAL_MATCHES,
        knockoutMatches: INITIAL_KNOCKOUT_MATCHES,
        scoresheets: {},
        version: 1,
        lastUpdated: new Date().toISOString()
      };

      const htmlTab = renderToString(
        React.createElement(ExportTab, {
          state: dummyState,
          onRestoreState: () => {},
          onResetState: () => {}
        })
      );

      // Bloco de Backup removido
      expect(htmlTab).not.toContain('Backup e Sincronização');
      expect(htmlTab).not.toContain('Baixar Backup (.json)');
      expect(htmlTab).not.toContain('Restaurar Backup');

      // Bloco institucional AFR Soluções presente
      expect(htmlTab).toContain('Desenvolvido por AFR Soluções');
    });
  });
});
