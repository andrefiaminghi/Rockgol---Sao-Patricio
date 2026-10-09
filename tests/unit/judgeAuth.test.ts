import { describe, it, expect, beforeEach } from 'vitest';
import {
  isJudgeAuthenticated,
  setJudgeAuthenticated,
  clearJudgeAuthentication,
  JUDGE_PIN_DEFAULT
} from '../../src/components/JudgeAuthLock';

describe('Autenticação por PIN da Arbitragem (JudgeAuthLock)', () => {
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

  it('deve ter o PIN padrão definido como 2026', () => {
    expect(JUDGE_PIN_DEFAULT).toBe('2026');
  });

  it('deve iniciar desautenticado por padrão quando o localStorage estiver vazio', () => {
    expect(isJudgeAuthenticated()).toBe(false);
  });

  it('deve registrar e validar autenticação no localStorage', () => {
    setJudgeAuthenticated();
    expect(isJudgeAuthenticated()).toBe(true);
    expect(localStorage.getItem('rockgol_judge_authenticated')).toBe('true');
  });

  it('deve limpar a autenticação ao deslogar', () => {
    setJudgeAuthenticated();
    expect(isJudgeAuthenticated()).toBe(true);
    clearJudgeAuthentication();
    expect(isJudgeAuthenticated()).toBe(false);
    expect(localStorage.getItem('rockgol_judge_authenticated')).toBeNull();
  });
});
