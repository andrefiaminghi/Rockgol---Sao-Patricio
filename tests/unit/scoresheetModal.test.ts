import { describe, it, expect } from 'vitest';
import * as ScoresheetModalModule from '../../src/components/ScoresheetModal';

describe('ScoresheetModal Componente', () => {
  it('deve exportar o componente ScoresheetModal corretamente', () => {
    expect(ScoresheetModalModule.ScoresheetModal).toBeDefined();
    expect(typeof ScoresheetModalModule.ScoresheetModal).toBe('function');
  });
});
