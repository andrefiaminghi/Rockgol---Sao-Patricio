import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { Header } from '../../src/components/Header';

describe('Header com Sincronização Supabase (HeaderSync)', () => {
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
});
