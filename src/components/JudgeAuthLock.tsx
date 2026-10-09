import React, { useState } from 'react';
import { ShieldCheck, Lock, Delete, ArrowRight, AlertCircle } from 'lucide-react';

export const JUDGE_PIN_STORAGE_KEY = 'rockgol_judge_authenticated';
export const JUDGE_PIN_DEFAULT = '2026';

export function isJudgeAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(JUDGE_PIN_STORAGE_KEY) === 'true';
}

export function setJudgeAuthenticated(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(JUDGE_PIN_STORAGE_KEY, 'true');
}

export function clearJudgeAuthentication(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(JUDGE_PIN_STORAGE_KEY);
}

interface JudgeAuthLockProps {
  onAuthenticated: () => void;
}

export const JudgeAuthLock: React.FC<JudgeAuthLockProps> = ({ onAuthenticated }) => {
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    setErrorMsg('');
    const newPin = pin + digit;
    setPin(newPin);

    // Se atingiu 4 dígitos, valida automaticamente
    if (newPin.length === 4) {
      validatePin(newPin);
    }
  };

  const handleDelete = () => {
    setErrorMsg('');
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setErrorMsg('');
    setPin('');
  };

  const validatePin = (codeToTest: string) => {
    if (codeToTest === JUDGE_PIN_DEFAULT) {
      setJudgeAuthenticated();
      onAuthenticated();
    } else {
      setIsShaking(true);
      setErrorMsg('PIN incorreto. Tente novamente.');
      setTimeout(() => {
        setIsShaking(false);
        setPin('');
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1320] flex flex-col items-center justify-center p-4 selection:bg-[#00D26A] selection:text-[#0B1320]">
      {/* Card Central */}
      <div className="w-full max-w-sm bg-[#121D2F] border border-[#1E2D44] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Ícone de Destaque */}
        <div className="w-16 h-16 rounded-2xl bg-[#00D26A]/10 border border-[#00D26A]/30 flex items-center justify-center text-[#00D26A] mb-4 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>

        {/* Cabeçalho */}
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Outfit',sans-serif]">
          Painel da Arbitragem
        </h1>
        <p className="text-xs sm:text-sm text-[#8B9BB4] mt-1 mb-6">
          Digite o PIN de 4 dígitos para acessar o controle oficial de súmulas
        </p>

        {/* Indicador dos 4 Dígitos */}
        <div className={`flex items-center gap-4 mb-6 ${isShaking ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3].map(idx => {
            const hasDigit = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  hasDigit
                    ? 'bg-[#00D26A] scale-110 shadow-[0_0_12px_rgba(0,210,106,0.5)]'
                    : 'bg-[#1E2D44] border border-[#2D3F5A]'
                }`}
              />
            );
          })}
        </div>

        {/* Mensagem de Erro */}
        {errorMsg && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF4D4D] bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 px-3 py-1.5 rounded-lg mb-4">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Teclado Numérico */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-14 rounded-2xl bg-[#16243A] hover:bg-[#1E2D44] active:bg-[#00D26A]/20 active:scale-95 text-white text-xl font-bold font-['Outfit',sans-serif] border border-[#22314A] transition-all flex items-center justify-center cursor-pointer select-none"
            >
              {num}
            </button>
          ))}

          {/* Botão Limpar */}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-[#16243A]/60 hover:bg-[#1E2D44] active:scale-95 text-[#8B9BB4] text-xs font-bold uppercase tracking-wider border border-[#22314A] transition-all flex items-center justify-center cursor-pointer select-none"
          >
            Limpar
          </button>

          {/* Dígito 0 */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-[#16243A] hover:bg-[#1E2D44] active:bg-[#00D26A]/20 active:scale-95 text-white text-xl font-bold font-['Outfit',sans-serif] border border-[#22314A] transition-all flex items-center justify-center cursor-pointer select-none"
          >
            0
          </button>

          {/* Botão Apagar (Backspace) */}
          <button
            type="button"
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-[#16243A]/60 hover:bg-[#1E2D44] active:scale-95 text-[#8B9BB4] border border-[#22314A] transition-all flex items-center justify-center cursor-pointer select-none"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Rodapé Informativo */}
        <div className="mt-6 pt-4 border-t border-[#1E2D44] w-full flex items-center justify-center gap-1.5 text-[11px] text-[#5D6E87]">
          <Lock className="w-3 h-3" />
          <span>Acesso restrito à comissão organizadora</span>
        </div>
      </div>
    </div>
  );
};
