import React from 'react';
import { Clock, Coffee, CheckCircle2, MapPin, Lock } from 'lucide-react';
import { Match, Team, MatchScoresheet } from '../types/tournament';
import { ROUND_RESTING_TEAMS } from '../data/initialTournamentData';

interface MatchesTabProps {
  matches: Match[];
  teams: Team[];
  scoresheets?: Record<string, MatchScoresheet>;
  onUpdateScore: (matchId: string, homeScore: number | null, awayScore: number | null) => void;
}

export const MatchesTab: React.FC<MatchesTabProps> = ({
  matches,
  teams,
  scoresheets,
  onUpdateScore
}) => {
  const teamMap = new Map<string, string>();
  teams.forEach(t => teamMap.set(t.id, t.name));

  const rounds = Array.from({ length: 11 }, (_, i) => i + 1);

  const handleScoreChange = (
    matchId: string,
    currentHomeScore: number | null,
    currentAwayScore: number | null,
    isHome: boolean,
    val: string
  ) => {
    // Se a partida tiver súmula registrada, a edição manual fica estritamente bloqueada
    const sheet = scoresheets?.[matchId];
    if (sheet && sheet.hasScoresheet) {
      return;
    }

    if (val === '') {
      if (isHome) {
        onUpdateScore(matchId, null, currentAwayScore);
      } else {
        onUpdateScore(matchId, currentHomeScore, null);
      }
      return;
    }

    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0) return;

    if (isHome) {
      onUpdateScore(matchId, num, currentAwayScore !== null ? currentAwayScore : 0);
    } else {
      onUpdateScore(matchId, currentHomeScore !== null ? currentHomeScore : 0, num);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Título da Seção */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚽</span>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight font-['Outfit',sans-serif]">
            Tabela de Jogos da 1ª Fase
          </h2>
        </div>
        <span className="text-xs text-[#8B9BB4] font-medium">
          11 Rodadas • 21 Partidas
        </span>
      </div>

      {rounds.map(roundNum => {
        const roundMatches = matches.filter(m => m.roundNumber === roundNum);
        const restingIds = ROUND_RESTING_TEAMS[roundNum] || [];
        const restingNames = restingIds.map(id => teamMap.get(id) || id).join(', ');
        const roundTime = roundMatches[0]?.roundTime || '';

        return (
          <React.Fragment key={roundNum}>
            {/* Banner Especial de Almoço entre Rodada 6 e 7 */}
            {roundNum === 7 && (
              <div className="my-4 p-3 bg-[#121D2F] border border-[#C87619]/40 rounded-2xl flex items-center justify-center space-x-3 shadow-lg">
                <Coffee className="w-5 h-5 text-[#C87619] shrink-0" />
                <div className="text-center">
                  <div className="text-xs uppercase font-extrabold tracking-wider text-[#C87619] font-['Outfit',sans-serif]">
                    Pausa Geral de Almoço
                  </div>
                  <div className="text-[11px] text-[#8B9BB4] font-medium">
                    12:00 às 13:30 • Intervalo para todas as equipes
                  </div>
                </div>
              </div>
            )}

            {/* Card da Rodada */}
            <div className="bg-[#121D2F] border border-[#1E2D44] rounded-2xl overflow-hidden shadow-lg">
              {/* Header da Rodada */}
              <div className="bg-[#16243A] px-3.5 py-2.5 border-b border-[#1E2D44] flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-[#00D26A] text-[#0B1320] flex items-center justify-center text-xs font-black">
                    {roundNum}
                  </span>
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-['Outfit',sans-serif]">
                    Rodada {roundNum}
                  </span>
                </div>
                <div className="flex items-center text-xs text-white/90 font-medium gap-1.5 bg-[#1A2538] px-2.5 py-1 rounded-lg border border-[#22314A]">
                  <Clock className="w-3.5 h-3.5 text-[#00D26A]" />
                  <span className="tabular-nums">{roundTime}</span>
                </div>
              </div>

              {/* Informação de Folga / Descanso */}
              {restingNames && (
                <div className="px-3.5 py-1.5 bg-[#0E1726] border-b border-[#1E2D44] text-[11px] text-[#8B9BB4] flex items-center gap-1.5">
                  <span className="font-semibold text-white/80">Folgam:</span>
                  <span className="truncate">{restingNames}</span>
                </div>
              )}

              {/* Lista de Partidas da Rodada */}
              <div className="p-3 space-y-2.5">
                {roundMatches.map(match => {
                  const homeName = teamMap.get(match.homeTeamId) || match.homeTeamId;
                  const awayName = teamMap.get(match.awayTeamId) || match.awayTeamId;
                  const sheet = scoresheets?.[match.id];
                  const hasScoresheet = Boolean(sheet && sheet.hasScoresheet);
                  const isFinished = match.status === 'FINISHED';

                  return (
                    <div
                      key={match.id}
                      className={`p-3 rounded-xl border transition-all ${
                        hasScoresheet
                          ? 'bg-[#0E1726] border-[#00D26A]/40 shadow-sm'
                          : isFinished
                          ? 'bg-[#0E1726] border-[#00D26A]/30 shadow-sm'
                          : 'bg-[#0E1726]/80 border-[#1E2D44]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#1A2538] text-[#8B9BB4] border border-[#22314A] flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#00D26A]" />
                          {match.field}
                        </span>

                        {hasScoresheet ? (
                          <span
                            className="text-[10px] font-bold text-[#00D26A] bg-[#00D26A]/10 border border-[#00D26A]/30 px-2 py-0.5 rounded-md flex items-center gap-1"
                            title="Placar controlado pela súmula de arbitragem. Edição manual bloqueada."
                          >
                            <Lock className="w-3 h-3 text-[#00D26A]" />
                            Súmula Oficial
                          </span>
                        ) : isFinished ? (
                          <span className="text-[10px] font-bold text-[#00D26A] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Finalizado
                          </span>
                        ) : null}
                      </div>

                      {/* Placar Confronto */}
                      <div className="grid grid-cols-[1fr_auto_auto_auto_1fr] items-center gap-2">
                        {/* Time Mandante (Esquerda) */}
                        <div className="text-right">
                          <span className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                            {homeName}
                          </span>
                        </div>

                        {/* Input Mandante */}
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          max="99"
                          disabled={hasScoresheet}
                          value={match.homeScore !== null ? match.homeScore : ''}
                          onChange={e =>
                            handleScoreChange(
                              match.id,
                              match.homeScore,
                              match.awayScore,
                              true,
                              e.target.value
                            )
                          }
                          className={`w-11 h-10 text-center font-black text-base rounded-xl outline-none transition tabular-nums ${
                            hasScoresheet
                              ? 'bg-[#141C28] text-white/90 border border-[#00D26A]/40 cursor-not-allowed shadow-inner'
                              : 'bg-[#0B1320] text-white border border-[#1E2D44] focus:border-[#00D26A]'
                          }`}
                          placeholder="-"
                          title={
                            hasScoresheet
                              ? 'Placar oficial definido via súmula. Para alterar, utilize a aba Súmula.'
                              : 'Editar placar'
                          }
                        />

                        {/* Divisor X */}
                        <span className="text-xs font-black text-[#5D6E87] px-0.5">
                          ×
                        </span>

                        {/* Input Visitante */}
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          max="99"
                          disabled={hasScoresheet}
                          value={match.awayScore !== null ? match.awayScore : ''}
                          onChange={e =>
                            handleScoreChange(
                              match.id,
                              match.homeScore,
                              match.awayScore,
                              false,
                              e.target.value
                            )
                          }
                          className={`w-11 h-10 text-center font-black text-base rounded-xl outline-none transition tabular-nums ${
                            hasScoresheet
                              ? 'bg-[#141C28] text-white/90 border border-[#00D26A]/40 cursor-not-allowed shadow-inner'
                              : 'bg-[#0B1320] text-white border border-[#1E2D44] focus:border-[#00D26A]'
                          }`}
                          placeholder="-"
                          title={
                            hasScoresheet
                              ? 'Placar oficial definido via súmula. Para alterar, utilize a aba Súmula.'
                              : 'Editar placar'
                          }
                        />

                        {/* Time Visitante (Direita) */}
                        <div className="text-left">
                          <span className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                            {awayName}
                          </span>
                        </div>
                      </div>

                      {/* Aviso de Súmula Vinculada */}
                      {hasScoresheet && (
                        <div className="mt-2.5 pt-1.5 border-t border-[#1E2D44]/60 flex items-center justify-between text-[10px] text-[#8B9BB4]">
                          <span className="flex items-center gap-1 text-[#00D26A]">
                            <Lock className="w-3 h-3" /> Placar vinculado à súmula
                          </span>
                          <span className="text-[#5D6E87]">
                            Edição bloqueada
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
