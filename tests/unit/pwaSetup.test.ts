import { describe, it, expect } from 'vitest';
import * as ExportTabModule from '../../src/components/ExportTab';
import * as PdfServiceModule from '../../src/services/pdfExportService';
import * as AppModule from '../../src/App';

describe('Exportação PDF, Backup e Integração Geral (App & ExportTab)', () => {
  it('deve exportar o componente ExportTab', () => {
    expect(ExportTabModule.ExportTab).toBeDefined();
  });

  it('deve exportar o serviço de geração de documento/PDF', () => {
    expect(PdfServiceModule.generateTournamentReportHtml).toBeDefined();
  });

  it('deve exportar o componente principal App', () => {
    expect(AppModule.default).toBeDefined();
  });
});
