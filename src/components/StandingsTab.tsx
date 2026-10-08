import React from 'react';
import { TeamStanding } from '../types/tournament';

interface StandingsTabProps {
  standings: TeamStanding[];
}

export const StandingsTab: React.FC<StandingsTabProps> = ({ standings }) => {
  return (
    <div className="space-y-3.5 pb-6">
      {/* Título de Seção conforme exemplodesing.jpeg */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight font-['Outfit',sans-serif]">
            Tabela de Classificação Geral
          </h2>
        </div>
        <span className="text-xs text-[#8B9BB4] font-medium">
          7 Equipes • 6 Jogos cada
        </span>
      </div>

      {/* Card Principal da Tabela */}
      <div className="bg-[#121D2F] border border-[#1E2D44] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E2D44]/80 text-[#8B9BB4] font-bold text-[10px] sm:text-[11px] tracking-wider uppercase">
                <th className="py-3 px-2 sm:px-3 text-center w-10">POS</th>
                <th className="py-3 px-2 sm:px-3">EQUIPE</th>
                <th className="py-3 px-2 text-center">PTS</th>
                <th className="py-3 px-2 text-center">J</th>
                <th className="py-3 px-2 text-center">V</th>
                <th className="py-3 px-2 text-center">E</th>
                <th className="py-3 px-2 text-center">D</th>
                <th className="py-3 px-2 text-center">GP</th>
                <th className="py-3 px-2 text-center">GC</th>
                <th className="py-3 px-2 sm:px-3 text-center">SG</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D44]/50">
              {standings.map((team, index) => {
                const pos = index + 1;
                const isG4 = pos <= 4;

                return (
                  <tr
                    key={team.teamId}
                    className="hover:bg-[#16243A]/60 transition-colors"
                  >
                    {/* POS */}
                    <td className="py-2.5 px-2 sm:px-3 text-center">
                      <div className="flex justify-center items-center">
                        <span
                          className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center transition-transform ${
                            isG4
                              ? 'bg-[#00D26A] text-[#0B1320] shadow-sm shadow-[#00D26A]/30'
                              : 'bg-[#1E2C42] text-[#8B9BB4]'
                          }`}
                        >
                          {pos}
                        </span>
                      </div>
                    </td>

                    {/* EQUIPE */}
                    <td className="py-2.5 px-2 sm:px-3 font-bold text-white whitespace-nowrap">
                      <span className="line-clamp-1">{team.teamName}</span>
                    </td>

                    {/* PTS */}
                    <td className="py-2.5 px-2 text-center font-bold text-sm text-[#00D26A] tabular-nums">
                      {team.points}
                    </td>

                    {/* J, V, E, D, GP, GC */}
                    <td className="py-2.5 px-2 text-center text-white/90 tabular-nums font-medium">
                      {team.played}
                    </td>
                    <td className="py-2.5 px-2 text-center text-white/90 tabular-nums font-medium">
                      {team.won}
                    </td>
                    <td className="py-2.5 px-2 text-center text-white/90 tabular-nums font-medium">
                      {team.drawn}
                    </td>
                    <td className="py-2.5 px-2 text-center text-white/90 tabular-nums font-medium">
                      {team.lost}
                    </td>
                    <td className="py-2.5 px-2 text-center text-white/90 tabular-nums font-medium">
                      {team.goalsFor}
                    </td>
                    <td className="py-2.5 px-2 text-center text-white/90 tabular-nums font-medium">
                      {team.goalsAgainst}
                    </td>

                    {/* SG */}
                    <td
                      className={`py-2.5 px-2 sm:px-3 text-center font-bold text-xs tabular-nums ${
                        team.goalDifference > 0
                          ? 'text-[#00D26A]'
                          : team.goalDifference < 0
                          ? 'text-[#EF4444]'
                          : 'text-white/80'
                      }`}
                    >
                      {team.goalDifference > 0
                        ? `+${team.goalDifference}`
                        : team.goalDifference}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legenda Oficial do exemplodesing.jpeg */}
      <div className="px-2 pt-1 space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#00D26A]">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#00D26A] inline-block shrink-0"></span>
          <span>G4: Classificados para as Semifinais (1º ao 4º)</span>
        </div>
        <p className="text-[11px] text-[#8B9BB4] leading-relaxed">
          * Desempate oficial: Pontos &gt; Vitórias &gt; Saldo de Gols &gt; Gols Pró &gt; Confronto Direto &gt; Sorteio.
        </p>
      </div>
    </div>
  );
};
