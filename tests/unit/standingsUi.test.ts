import { describe, it, expect } from 'vitest';
import * as StandingsTabModule from '../../src/components/StandingsTab';
import * as KnockoutTabModule from '../../src/components/KnockoutTab';
import * as KnockoutScoreModalModule from '../../src/components/KnockoutScoreModal';

describe('Componentes Visuais de Classificação e Mata-Mata', () => {
  it('deve exportar StandingsTab, KnockoutTab e KnockoutScoreModal', () => {
    expect(StandingsTabModule.StandingsTab).toBeDefined();
    expect(KnockoutTabModule.KnockoutTab).toBeDefined();
    expect(KnockoutScoreModalModule.KnockoutScoreModal).toBeDefined();
  });
});
