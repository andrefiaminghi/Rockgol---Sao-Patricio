import { describe, it, expect } from 'vitest';
import * as HeaderModule from '../../src/components/Header';
import * as NavigationModule from '../../src/components/Navigation';
import * as MatchesTabModule from '../../src/components/MatchesTab';
import * as TeamsTabModule from '../../src/components/TeamsTab';

describe('Componentes Visuais de UI (Header, Navigation, Matches, Teams)', () => {
  it('deve exportar os componentes de Header e Navigation', () => {
    expect(HeaderModule.Header).toBeDefined();
    expect(NavigationModule.Navigation).toBeDefined();
  });

  it('deve exportar MatchesTab e TeamsTab', () => {
    expect(MatchesTabModule.MatchesTab).toBeDefined();
    expect(TeamsTabModule.TeamsTab).toBeDefined();
  });
});
