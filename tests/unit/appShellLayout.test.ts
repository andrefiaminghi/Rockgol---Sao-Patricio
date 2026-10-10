import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Header } from '../../src/components/Header';
import { Navigation } from '../../src/components/Navigation';
import { App, AppProps } from '../../src/App';

describe('Layout Estático do App Shell (Header e Footer Imóveis)', () => {
  it('o Header deve conter a classe shrink-0 e pt-safe para ancoragem fixa no topo', () => {
    const html = renderToString(React.createElement(Header, { role: 'torcida' }));

    expect(html).toContain('shrink-0');
    expect(html).toContain('pt-safe');
  });

  it('o Navigation deve conter a classe shrink-0 e pb-safe-nav para respiro seguro sobre os botões do celular', () => {
    const html = renderToString(
      React.createElement(Navigation, { activeTab: 'matches', onTabChange: () => {} })
    );

    expect(html).toContain('shrink-0');
    expect(html).toContain('pb-safe-nav');
  });

  it('o container <main> deve possuir overflow-y-auto e flex-1 para rolagem vertical independente', () => {
    const html = renderToString(React.createElement<AppProps>(App, { role: 'torcida' }));

    expect(html).toContain('flex-1');
    expect(html).toContain('overflow-y-auto');
  });

  it('o AppContent deve possuir overflow-hidden e h-full para impedir rolagem dupla na página', () => {
    const html = renderToString(React.createElement<AppProps>(App, { role: 'torcida' }));

    expect(html).toContain('overflow-hidden');
    expect(html).toContain('h-full');
  });
});
