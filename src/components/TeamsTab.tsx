import React, { useState } from 'react';
import { Users, ChevronRight } from 'lucide-react';
import { Team } from '../types/tournament';
import { PlayerModal } from './PlayerModal';

interface TeamsTabProps {
  teams: Team[];
  onUpdatePlayers: (teamId: string, players: string[]) => void;
}

export const TeamsTab: React.FC<TeamsTabProps> = ({ teams, onUpdatePlayers }) => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  return (
    <div className="space-y-3.5 pb-6">
      {/* Título da Seção */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">🛡️</span>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight font-['Outfit',sans-serif]">
            Equipes e Elencos
          </h2>
        </div>
        <span className="text-xs text-[#8B9BB4] font-medium">
          7 Equipes • 10 Atletas cada
        </span>
      </div>

      <div className="grid gap-2.5">
        {teams.map(team => {
          const registeredPlayersCount = team.players.filter(p => p.trim() !== '').length;

          return (
            <div
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className="bg-[#121D2F] hover:bg-[#16243A] border border-[#1E2D44] active:scale-[0.99] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#1A2538] border border-[#22314A] flex items-center justify-center font-black text-[#00D26A] text-xs font-['Outfit',sans-serif] shadow-inner">
                  {team.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-['Outfit',sans-serif]">{team.name}</h3>
                  <p className="text-xs text-[#8B9BB4] flex items-center gap-1.5 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-[#5D6E87]" />
                    <span>
                      {registeredPlayersCount} de 10 atletas cadastrados
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  registeredPlayersCount === 10
                    ? 'bg-[#00D26A]/15 text-[#00D26A] border-[#00D26A]/30'
                    : registeredPlayersCount > 0
                    ? 'bg-[#C87619]/15 text-[#C87619] border-[#C87619]/30'
                    : 'bg-[#1A2538] text-[#8B9BB4] border-[#22314A]'
                }`}>
                  {registeredPlayersCount === 10 ? 'Completo' : `${registeredPlayersCount}/10`}
                </span>
                <ChevronRight className="w-4 h-4 text-[#5D6E87]" />
              </div>
            </div>
          );
        })}
      </div>

      {selectedTeam && (
        <PlayerModal
          team={selectedTeam}
          onClose={() => setSelectedTeam(null)}
          onSave={players => {
            onUpdatePlayers(selectedTeam.id, players);
            setSelectedTeam(null);
          }}
        />
      )}
    </div>
  );
};
