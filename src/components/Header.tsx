import React from 'react';
import { RefreshCw, Cloud, CloudOff, ShieldCheck } from 'lucide-react';

export interface HeaderProps {
  role?: 'torcida' | 'juiz';
  finishedMatchesCount?: number;
  totalMatchesCount?: number;
  isSyncing?: boolean;
  lastSyncTime?: string | null;
  isOnline?: boolean;
  onSync?: () => void;
  onQuickSave?: () => void;
  onResetPrompt?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  role = 'torcida',
  isSyncing = false,
  lastSyncTime,
  isOnline = true,
  onSync
}) => {
  return (
    <header className="shrink-0 z-30 bg-[#0B1320]/95 backdrop-blur-md px-4 pt-safe pb-3 border-b border-[#1E2D44]">
      <div className="flex items-center justify-between">
        {/* Lado Esquerdo: Logo + Títulos */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="./logotipoapp.jpg"
              alt="RockGol São Patrício"
              className="w-10 h-10 rounded-full object-cover border-2 border-[#00D26A] shadow-sm shadow-[#00D26A]/20"
            />
            {role === 'juiz' && (
              <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black p-0.5 rounded-full ring-2 ring-[#0B1320]" title="Painel da Arbitragem">
                <ShieldCheck className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white leading-none font-['Outfit',sans-serif]">
                ROCKGOL 2026
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-1 leading-none">
              <p className="text-[11px] font-bold text-[#00D26A] tracking-wider uppercase font-['Outfit',sans-serif]">
                SÃO PATRÍCIO BAR
              </p>
              {lastSyncTime && (
                <span className="text-[10px] text-[#8B9BB4] font-medium hidden sm:inline">
                  • Sincronizado às {lastSyncTime}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito: Ações e Status (Árbitro perfeitamente alinhado com Sincronizar) */}
        <div className="flex items-center gap-2">
          {/* Badge Árbitro alinhado com Sincronizar */}
          {role === 'juiz' && (
            <span
              className="h-9 px-2.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center justify-center text-[10px] font-black tracking-wider uppercase shadow-sm"
              title="Painel Oficial da Arbitragem"
            >
              ÁRBITRO
            </span>
          )}

          {/* Indicador de Status da Nuvem para o Juiz */}
          {role === 'juiz' && (
            <div
              className={`h-9 flex items-center gap-1.5 px-2.5 rounded-xl text-[10px] font-bold border transition ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
              title={isOnline ? 'Nuvem Conectada (Supabase Online)' : 'Modo Offline (Sem internet)'}
            >
              {isOnline ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </div>
          )}

          {/* Botão Sincronizar (Nuvem / Supabase) */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            title={
              role === 'juiz'
                ? 'Sincronizar com a Nuvem (Receber súmulas de outros campos e reenviar pendências)'
                : 'Sincronizar Resultados Oficiais'
            }
            className={`h-9 px-2.5 sm:px-3 rounded-xl bg-[#1A2538] hover:bg-[#22314A] active:scale-95 border border-[#22314A] flex items-center justify-center gap-1.5 text-xs font-bold transition shadow-sm ${
              isSyncing ? 'text-[#00D26A] opacity-80 cursor-wait' : 'text-white'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#00D26A] ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="text-[11px] font-bold tracking-tight">Sincronizar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
