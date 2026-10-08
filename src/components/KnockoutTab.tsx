import React, { useState } from 'react';
import { Swords, Trophy, Medal, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { KnockoutMatch, Team } from '../types/tournament';
import { KnockoutScoreModal } from './KnockoutScoreModal';

interface KnockoutTabProps {
  knockoutMatches: KnockoutMatch[];
  teams: Team[];
  isGroupStageDone: boolean;
  onUpdateKnockoutScore: (
    match: KnockoutMatch,
    homeScore: number,
    awayScore: number,
    homePenalties: number | null,
    awayPenalties: number | null
  ) => void;
}

export const KnockoutTab: React.FC<KnockoutTabProps> = ({
  knockoutMatches,
  teams,
  isGroupStageDone,
  onUpdateKnockoutScore
}) => {
  const [selectedMatch, setSelectedMatch] = useState<KnockoutMatch | null>(null);

  const teamMap = new Map<string, string>();
  teams.forEach(t => teamMap.set(t.id, t.name));

  const sfMatches = knockoutMatches.filter(m => m.id === 'sf1' || m.id === 'sf2');
  const thirdPlaceMatch = knockoutMatches.find(m => m.id === 'third_place')!;
  const finalMatch = knockoutMatches.find(m => m.id === 'final')!;

  const renderMatchCard = (match: KnockoutMatch, icon: React.ReactNode) => {
    const homeName = match.homeTeamId ? teamMap.get(match.homeTeamId) || match.homeTeamId : 'A definir';
    const awayName = match.awayTeamId ? teamMap.get(match.awayTeamId) || match.awayTeamId : 'A definir';
    const isReady = match.homeTeamId !== null && match.awayTeamId !== null;
    const isFinished = match.status === 'FINISHED';

    return (
      <div
        key={match.id}
        onClick={() => isReady && setSelectedMatch(match)}
        className={`p-4 rounded-2xl border transition-all shadow-md ${
          isReady ? 'cursor-pointer active:scale-[0.99]' : 'opacity-80'
        } ${
          isFinished
            ? 'bg-[#121D2F] border-[#00D26A]/40'
            : isReady
            ? 'bg-[#121D2F] border-[#1E2D44] hover:border-[#2A3E5E]'
            : 'bg-[#0E1726]/80 border-[#1E2D44]'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <h3 className="text-sm font-bold text-white font-['Outfit',sans-serif]">{match.title}</h3>
              <p className="text-[11px] text-[#8B9BB4] flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#00D26A]" />
                  {match.time}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#00D26A]" />
                  {match.field}
                </span>
              </p>
            </div>
          </div>

          <div>
            {isFinished ? (
              <span className="text-[10px] font-bold text-[#00D26A] flex items-center gap-1 bg-[#0E1726] px-2 py-0.5 rounded-lg border border-[#00D26A]/30">
                <CheckCircle2 className="w-3 h-3" />
                Finalizado
              </span>
            ) : isReady ? (
              <span className="text-[10px] font-bold text-[#38BDF8] bg-[#1A2538] px-2 py-0.5 rounded-lg border border-[#22314A]">
                Toque p/ Placar
              </span>
            ) : (
              <span className="text-[10px] font-medium text-[#5D6E87] bg-[#0E1726] px-2 py-0.5 rounded-lg border border-[#1E2D44]">
                Aguardando 1ª Fase
              </span>
            )}
          </div>
        </div>

        {/* Confronto e Placares */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-2 bg-[#0E1726] rounded-xl px-3 border border-[#1E2D44]/70">
          <div className="flex-1 text-right">
            <span
              className={`text-xs sm:text-sm font-bold ${
                match.winnerTeamId === match.homeTeamId && isFinished
                  ? 'text-[#00D26A]'
                  : 'text-white'
              }`}
            >
              {homeName}
            </span>
            {match.homePenalties !== null && (
              <span className="block text-[10px] text-[#D99B00] font-semibold">
                ({match.homePenalties} pen)
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 px-3 py-1 bg-[#0B1320] rounded-lg border border-[#1E2D44]">
            <span className="text-base font-black text-white tabular-nums">
              {match.homeScore !== null ? match.homeScore : '-'}
            </span>
            <span className="text-xs font-bold text-[#5D6E87]">×</span>
            <span className="text-base font-black text-white tabular-nums">
              {match.awayScore !== null ? match.awayScore : '-'}
            </span>
          </div>

          <div className="flex-1 text-left">
            <span
              className={`text-xs sm:text-sm font-bold ${
                match.winnerTeamId === match.awayTeamId && isFinished
                  ? 'text-[#00D26A]'
                  : 'text-white'
              }`}
            >
              {awayName}
            </span>
            {match.awayPenalties !== null && (
              <span className="block text-[10px] text-[#D99B00] font-semibold">
                ({match.awayPenalties} pen)
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Título da Seção */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚔️</span>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight font-['Outfit',sans-serif]">
            Chaveamento do Mata-Mata
          </h2>
        </div>
        <span className="text-xs text-[#8B9BB4] font-medium">
          Semifinais • 3º Lugar • Final
        </span>
      </div>

      {/* Aviso caso a 1ª fase não esteja concluída */}
      {!isGroupStageDone && (
        <div className="p-3.5 bg-[#121D2F] border border-[#C87619]/40 rounded-2xl flex items-start gap-2.5 text-[#C87619] text-xs shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#C87619] mt-0.5" />
          <div>
            <span className="font-bold">Fase de Pontos Corridos em Andamento:</span>
            <p className="text-[#8B9BB4] mt-0.5 text-[11px] leading-relaxed">
              O chaveamento das Semifinais será preenchido automaticamente assim que as 21 partidas da 1ª fase forem finalizadas.
            </p>
          </div>
        </div>
      )}

      {/* Seção 1: Semifinais */}
      <div className="space-y-2.5">
        <h2 className="text-xs uppercase font-extrabold tracking-wider text-[#8B9BB4] flex items-center gap-1.5 font-['Outfit',sans-serif]">
          <Swords className="w-3.5 h-3.5 text-[#00D26A]" />
          Semifinais (16:00)
        </h2>
        <div className="grid gap-2.5">
          {sfMatches.map(m =>
            renderMatchCard(
              m,
              <Swords className="w-4 h-4 text-[#00D26A]" />
            )
          )}
        </div>
      </div>

      {/* Seção 2: Disputa de 3º Lugar */}
      <div className="space-y-2.5 pt-1">
        <h2 className="text-xs uppercase font-extrabold tracking-wider text-[#8B9BB4] flex items-center gap-1.5 font-['Outfit',sans-serif]">
          <Medal className="w-3.5 h-3.5 text-[#C87619]" />
          Disputa de 3º Lugar (16:30)
        </h2>
        {renderMatchCard(
          thirdPlaceMatch,
          <Medal className="w-4 h-4 text-[#C87619]" />
        )}
      </div>

      {/* Seção 3: Grande Final */}
      <div className="space-y-2.5 pt-1">
        <h2 className="text-xs uppercase font-extrabold tracking-wider text-[#8B9BB4] flex items-center gap-1.5 font-['Outfit',sans-serif]">
          <Trophy className="w-3.5 h-3.5 text-[#D99B00]" />
          Grande Final (17:00)
        </h2>
        {renderMatchCard(
          finalMatch,
          <Trophy className="w-4 h-4 text-[#D99B00]" />
        )}
      </div>

      {/* Modal de Placar */}
      {selectedMatch && (
        <KnockoutScoreModal
          match={selectedMatch}
          teams={teams}
          onClose={() => setSelectedMatch(null)}
          onSave={onUpdateKnockoutScore}
        />
      )}
    </div>
  );
};
