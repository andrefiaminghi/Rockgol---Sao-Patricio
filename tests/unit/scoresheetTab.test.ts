import { describe, it, expect } from 'vitest';
import * as ScoresheetTabModule from '../../src/components/ScoresheetTab';

describe('ScoresheetTab Componente', () => {
  it('deve exportar o componente ScoresheetTab corretamente', () => {
    expect(ScoresheetTabModule.ScoresheetTab).toBeDefined();
    expect(typeof ScoresheetTabModule.ScoresheetTab).toBe('function');
  });
});
