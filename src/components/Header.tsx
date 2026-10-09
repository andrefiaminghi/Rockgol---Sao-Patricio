import React from 'react';
import { Save, RotateCcw } from 'lucide-react';

interface HeaderProps {
  finishedMatchesCount?: number;
  totalMatchesCount?: number;
  onQuickSave?: () => void;
  onResetPrompt?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onQuickSave,
  onResetPrompt
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0B1320]/95 backdrop-blur-md px-4 pt-safe pb-3 border-b border-[#1E2D44]">
      <div className="flex items-center justify-between">
        {/* Lado Esquerdo: Logo + Títulos */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="./logotipoapp.jpg"
              alt="RockGol São Patrício"
              className="w-10 h-10 rounded-full object-cover border-2 border-[#00D26A] shadow-sm shadow-[#00D26A]/20"
            />
          </div>

          <div>
            <h1 className="text-base font-black tracking-tight text-white leading-none font-['Outfit',sans-serif]">
              ROCKGOL 2026
            </h1>
            <p className="text-[11px] font-bold text-[#00D26A] tracking-wider uppercase mt-1 leading-none font-['Outfit',sans-serif]">
              SÃO PATRÍCIO BAR
            </p>
          </div>
        </div>

        {/* Lado Direito: Botões de Ação estilo exemplodesing */}
        <div className="flex items-center gap-2">
          {/* Botão Salvar / Backup */}
          <button
            onClick={onQuickSave}
            title="Salvar / Exportar Backup"
            className="w-9 h-9 rounded-xl bg-[#1A2538] hover:bg-[#22314A] active:scale-95 border border-[#22314A] flex items-center justify-center text-[#8B9BB4] hover:text-white transition shadow-sm"
          >
            <Save className="w-4 h-4 text-[#A78BFA]" />
          </button>

          {/* Botão Reset / Sincronizar */}
          <button
            onClick={onResetPrompt}
            title="Reiniciar Torneio"
            className="w-9 h-9 rounded-xl bg-[#1A2538] hover:bg-[#22314A] active:scale-95 border border-[#22314A] flex items-center justify-center text-[#8B9BB4] hover:text-white transition shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-[#38BDF8]" />
          </button>
        </div>
      </div>
    </header>
  );
};
