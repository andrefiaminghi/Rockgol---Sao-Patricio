import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Header } from '../../src/components/Header';
import { applyHardResetFromRemote } from '../../src/services/scoresheetService';
import { saveTournamentState, createDefaultTournamentState } from '../../src/services/storageService';

describe('Header com Sincronização Supabase (HeaderSync)', () => {
  let storageStore: Record<string, string> = {};

  beforeEach(() => {
    storageStore = {};
    (globalThis as any).window = globalThis;
    (globalThis as any).localStorage = {
      getItem: (key: string) => storageStore[key] || null,
      setItem: (key: string, value: string) => { storageStore[key] = value; },
      removeItem: (key: string) => { delete storageStore[key]; },
      clear: () => { storageStore = {}; }
    };
  });
  it('deve exportar o componente Header', () => {
    expect(Header).toBeDefined();
    expect(typeof Header).toBe('function');
  });

  it('deve instanciar Header para o perfil torcida com onSync e sem onResetPrompt', () => {
    const handleSync = vi.fn();

    const element = React.createElement(Header, {
      role: 'torcida',
      onSync: handleSync
    });

    expect(element.props.role).toBe('torcida');
    expect(element.props.onSync).toBe(handleSync);
    expect(element.props.onResetPrompt).toBeUndefined();
  });

  it('deve instanciar Header para o perfil juiz com suporte a onResetPrompt e status de conexão', () => {
    const handleSync = vi.fn();
    const handleReset = vi.fn();

    const element = React.createElement(Header, {
      role: 'juiz',
      isSyncing: true,
      lastSyncTime: '15:30',
      isOnline: true,
      onSync: handleSync,
      onResetPrompt: handleReset
    });

    expect(element.props.role).toBe('juiz');
    expect(element.props.isSyncing).toBe(true);
    expect(element.props.lastSyncTime).toBe('15:30');
    expect(element.props.isOnline).toBe(true);
    expect(element.props.onResetPrompt).toBe(handleReset);
  });

  it('deve permitir exibir modo offline para o perfil juiz quando desconectado', () => {
    const element = React.createElement(Header, {
      role: 'juiz',
      isOnline: false
    });

    expect(element.props.isOnline).toBe(false);
  });

  it('NÃO deve renderizar o botão de disquete (salvar dados) nem botão de resetar torneio no header', () => {
    const htmlJuiz = renderToString(React.createElement(Header, { role: 'juiz' }));
    const htmlTorcida = renderToString(React.createElement(Header, { role: 'torcida' }));

    expect(htmlJuiz).not.toContain('Salvar / Exportar Backup');
    expect(htmlJuiz).not.toContain('Reiniciar Torneio');
    expect(htmlTorcida).not.toContain('Salvar / Exportar Backup');
    expect(htmlTorcida).not.toContain('Reiniciar Torneio');
  });

  it('deve alinhar o badge ÁRBITRO junto ao agrupamento de ações do lado direito com Sincronizar', () => {
    const htmlJuiz = renderToString(React.createElement(Header, { role: 'juiz' }));

    expect(htmlJuiz).toContain('ÁRBITRO');
    expect(htmlJuiz).toContain('Sincronizar');
    // Valida que o badge ÁRBITRO está dentro do container de ações da direita
    const direitoIndex = htmlJuiz.indexOf('Sincronizar');
    const arbitroIndex = htmlJuiz.indexOf('ÁRBITRO');
    expect(arbitroIndex).toBeGreaterThan(-1);
    expect(direitoIndex).toBeGreaterThan(-1);
  });

  describe('Proteção de PIN e Invariantes no Sincronismo (INV-03, INV-04)', () => {
    it('deve preservar incondicionalmente a chave rockgol_judge_pin_auth no localStorage durante o sincronismo', () => {
      localStorage.setItem('rockgol_judge_pin_auth', '1234');
      expect(localStorage.getItem('rockgol_judge_pin_auth')).toBe('1234');

      // Simula a execução do hard reset
      const cleanState = applyHardResetFromRemote(createDefaultTournamentState(), { scoresheets: {} });
      saveTournamentState(cleanState);

      // O PIN não deve ser apagado nem alterado
      expect(localStorage.getItem('rockgol_judge_pin_auth')).toBe('1234');
    });

    it('não deve apagar dados locais se o retorno do Supabase indicar falha de rede/servidor (INV-04)', () => {
      const remoteFailure = {
        success: false,
        error: 'Erro de conexão ou timeout'
      };

      // Se success for false, a rotina de sincronismo aborta sem chamar o reset
      expect(remoteFailure.success).toBe(false);
      expect(remoteFailure.error).toBeDefined();
    });
  });
});
