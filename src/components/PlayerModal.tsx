import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { Team } from '../types/tournament';

interface PlayerModalProps {
  team: Team;
  readOnly?: boolean;
  onClose: () => void;
  onSave: (players: string[]) => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({ team, readOnly = false, onClose, onSave }) => {
  const [playerList, setPlayerList] = useState<string[]>(() => {
    const list = [...team.players];
    while (list.length < 10) list.push('');
    return list.slice(0, 10);
  });

  const handlePlayerChange = (index: number, name: string) => {
    const updated = [...playerList];
    updated[index] = name;
    setPlayerList(updated);
  };

  const handleSave = () => {
    onSave(playerList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121D2F] border border-[#1E2D44] rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1E2D44] bg-[#16243A]">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-[#00D26A]" />
            <h2 className="text-base font-bold text-white font-['Outfit',sans-serif]">Elenco: {team.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1A2538] text-[#8B9BB4] hover:text-white flex items-center justify-center border border-[#22314A] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          <p className="text-xs text-[#8B9BB4] mb-3">
            {readOnly
              ? 'Relação oficial dos atletas cadastrados para o torneio:'
              : 'Cadastre os 10 atletas da equipe para controle oficial do torneio:'}
          </p>

          {playerList.map((player, idx) => (
            <div key={idx} className="flex items-center space-x-2.5">
              <span className="w-6 text-center text-xs font-black text-[#00D26A] bg-[#0B1320] py-1.5 rounded-lg border border-[#1E2D44]">
                {idx + 1}
              </span>
              <input
                type="text"
                disabled={readOnly}
                placeholder={readOnly ? 'Atleta não cadastrado' : `Nome do Atleta ${idx + 1}`}
                value={player}
                onChange={e => handlePlayerChange(idx, e.target.value)}
                className={`flex-1 px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none transition ${
                  readOnly
                    ? 'bg-[#0E1726] border-[#1E2D44] text-white/90 cursor-default'
                    : 'bg-[#0B1320] border-[#1E2D44] focus:border-[#00D26A] text-white placeholder-[#5D6E87]'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E2D44] bg-[#16243A] flex gap-2">
          {readOnly ? (
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1A2538] hover:bg-[#22314A] font-bold text-xs text-white border border-[#22314A] transition"
            >
              Fechar
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#22314A] bg-[#1A2538] font-bold text-xs text-white hover:bg-[#22314A] transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#00D26A] hover:bg-[#00B85C] font-black text-xs text-[#0B1320] flex items-center justify-center gap-1.5 shadow-lg shadow-[#00D26A]/20 transition"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Salvar Elenco
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
