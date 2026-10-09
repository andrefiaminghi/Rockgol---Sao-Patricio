import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  Trophy,
  ShieldAlert,
  Calendar,
  Clock,
  MapPin,
  Award,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { Match, KnockoutMatch, Team, MatchScoresheet } from '../types/tournament';
import { getTopScorers, getSuspensions } from '../services/scoresheetService';
import { ScoresheetModal } from './ScoresheetModal';

interface ScoresheetTabProps {
  teams: Team[];
  matches: Match[];
  knockoutMatches: KnockoutMatch[];
  scoresheets: Record<string, MatchScoresheet>;
  readOnly?: boolean;
  onSaveScoresheet: (sheet: MatchScoresheet) => void;
  onDeleteScoresheet: (matchId: string) => void;
}

type SubTabType = 'partidas' | 'artilharia' | 'suspensoes';

export const ScoresheetTab: React.FC<ScoresheetTabProps> = ({
  teams,
  matches,
  knockoutMatches,
  scoresheets,
  readOnly = false,
  onSaveScoresheet,
  onDeleteScoresheet
}) => {
  const [subTab, setSubTab] = useState<SubTabType>('partidas');
  const [selectedRound, setSelectedRound] = useState<number | 'mata-mata'>(1);
  const [activeModalMatch, setActiveModalMatch] = useState<Match | KnockoutMatch | null>(null);

  const teamMap = useMemo(() => {
    const map = new Map<string, Team>();
    teams.forEach(t => map.set(t.id, t));
    return map;
  }, [teams]);

  // Artilharia em tempo real
  const topScorers = useMemo(() => {
    return getTopScorers(teams, scoresheets);
  }, [teams, scoresheets]);

  // Suspensões em tempo real
  const allSuspensions = useMemo(() => {
    return getSuspensions(teams, matches, scoresheets);
  }, [teams, matches, scoresheets]);

  // Partidas da rodada selecionada
  const displayedMatches = useMemo(() => {
    if (selectedRound === 'mata-mata') {
      return knockoutMatches;
    }
    return matches.filter(m => m.roundNumber === selectedRound);
  }, [selectedRound, matches, knockoutMatches]);

  const rounds = Array.from({ length: 11 }, (_, i) => i + 1);

  // Identificação dos times do modal ativo
  const modalTeams = useMemo(() => {
    if (!activeModalMatch) return null;
    const homeTeam = activeModalMatch.homeTeamId ? teamMap.get(activeModalMatch.homeTeamId) : null;
    const awayTeam = activeModalMatch.awayTeamId ? teamMap.get(activeModalMatch.awayTeamId) : null;
    if (!homeTeam || !awayTeam) return null;
    return { homeTeam, awayTeam };
  }, [activeModalMatch, teamMap]);

  return (
    <div className="space-y-4 pb-8">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">📋</span>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight font-['Outfit',sans-serif]">
            Controle de Súmula dos Juízes
          </h2>
        </div>
        <span className="text-xs text-[#00D26A] font-bold bg-[#00D26A]/10 px-2 py-0.5 rounded-full border border-[#00D26A]/20">
          Arbitragem Oficial
        </span>
      </div>

      {/* Sub-Navegação interna */}
      <div className="flex bg-[#14181D] p-1 rounded-xl border border-[#2F343C]">
        <button
          type="button"
          onClick={() => setSubTab('partidas')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            subTab === 'partidas'
              ? 'bg-[#00D26A] text-[#0B1320] shadow-md shadow-[#00D26A]/20'
              : 'text-[#8F99A8] hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Partidas</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('artilharia')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            subTab === 'artilharia'
              ? 'bg-[#00D26A] text-[#0B1320] shadow-md shadow-[#00D26A]/20'
              : 'text-[#8F99A8] hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Artilharia</span>
          {topScorers.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 ml-0.5">
              {topScorers.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab('suspensoes')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            subTab === 'suspensoes'
              ? 'bg-[#00D26A] text-[#0B1320] shadow-md shadow-[#00D26A]/20'
              : 'text-[#8F99A8] hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Suspensões</span>
          {allSuspensions.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 ml-0.5">
              {allSuspensions.length}
            </span>
          )}
        </button>
      </div>

      {/* Conteúdo: 1. Partidas da Rodada */}
      {subTab === 'partidas' && (
        <div className="space-y-3">
          {/* Distribuição das Rodadas em 2 linhas (sem necessidade de rolagem horizontal) */}
          <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
            {rounds.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRound(r)}
                className={`py-2 px-1 rounded-xl text-xs font-bold text-center transition-all border flex items-center justify-center ${
                  selectedRound === r
                    ? 'bg-[#29A634] text-white border-[#29A634] shadow-md shadow-[#29A634]/20'
                    : 'bg-[#1C2127] text-[#8F99A8] border-[#2F343C] hover:text-white hover:border-[#383E47]'
                }`}
              >
                R{r}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedRound('mata-mata')}
              className={`py-2 px-1 rounded-xl text-[10px] sm:text-xs font-bold text-center transition-all border flex items-center justify-center ${
                selectedRound === 'mata-mata'
                  ? 'bg-amber-500 text-black border-amber-500 shadow-md shadow-amber-500/20'
                  : 'bg-[#1C2127] text-[#8F99A8] border-[#2F343C] hover:text-white hover:border-[#383E47]'
              }`}
            >
              Mata-Mata
            </button>
          </div>

          {/* Lista de Partidas */}
          <div className="space-y-2.5">
            {displayedMatches.map(m => {
              const homeTeam = m.homeTeamId ? teamMap.get(m.homeTeamId) : null;
              const awayTeam = m.awayTeamId ? teamMap.get(m.awayTeamId) : null;
              const sheet = scoresheets[m.id];
              const hasSheet = Boolean(sheet && sheet.hasScoresheet);

              const isKnockout = selectedRound === 'mata-mata' || !('roundNumber' in m);
              const matchTime = 'roundTime' in m ? m.roundTime : m.time;

              // Identificação do título / fase do mata-mata
              const knockoutPhaseTitle = isKnockout
                ? m.id === 'final'
                  ? 'Grande Final'
                  : m.id === 'third_place'
                  ? 'Disputa de 3º e 4º Lugar'
                  : m.id === 'sf1'
                  ? 'Semifinal 1'
                  : m.id === 'sf2'
                  ? 'Semifinal 2'
                  : ('title' in m ? m.title : 'Mata-Mata')
                : null;

              return (
                <div
                  key={m.id}
                  className="bg-[#1C2127] border border-[#2F343C] rounded-2xl p-3.5 hover:border-[#383E47] transition-all shadow-md"
                >
                  {/* Identificação de Fase para Mata-Mata */}
                  {isKnockout && (
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#2F343C]">
                      <div className="flex items-center gap-2">
                        {m.id === 'final' ? (
                          <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                            🏆 Grande Final
                          </span>
                        ) : m.id === 'third_place' ? (
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                            🥉 Disputa de 3º e 4º Lugar
                          </span>
                        ) : (
                          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                            ⚔️ {knockoutPhaseTitle}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-[#8F99A8] uppercase tracking-wider">
                        Fase Eliminatória
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-[#8F99A8] mb-2">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#00D26A]" />
                      <span className="font-semibold text-white">{matchTime}</span>
                      <span>•</span>
                      <MapPin className="w-3.5 h-3.5 text-[#8F99A8]" />
                      <span>{m.field}</span>
                    </div>

                    {hasSheet ? (
                      <span className="text-[10px] font-bold text-[#00D26A] bg-[#00D26A]/10 border border-[#00D26A]/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Súmula Registrada
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-[#8F99A8] bg-[#252A31] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-400" /> Placar Manual
                      </span>
                    )}
                  </div>

                  {/* Confronto e Placares */}
                  <div className="flex items-center justify-between py-1">
                    <div className="flex-1 flex items-center justify-between pr-3">
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px] sm:max-w-[150px] block">
                          {homeTeam ? homeTeam.name : 'A definir'}
                        </span>
                        {isKnockout && 'homePenalties' in m && m.homePenalties !== null && (
                          <span className="block text-[10px] text-[#D99B00] font-bold">
                            ({m.homePenalties} pen)
                          </span>
                        )}
                      </div>
                      <span className="text-base font-black text-white ml-2 bg-[#14181D] px-2 py-0.5 rounded border border-[#2F343C]">
                        {m.homeScore !== null ? m.homeScore : '-'}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-[#8F99A8] px-1">×</span>

                    <div className="flex-1 flex items-center justify-between pl-3">
                      <span className="text-base font-black text-white mr-2 bg-[#14181D] px-2 py-0.5 rounded border border-[#2F343C]">
                        {m.awayScore !== null ? m.awayScore : '-'}
                      </span>
                      <div className="min-w-0 text-right">
                        <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px] sm:max-w-[150px] block">
                          {awayTeam ? awayTeam.name : 'A definir'}
                        </span>
                        {isKnockout && 'awayPenalties' in m && m.awayPenalties !== null && (
                          <span className="block text-[10px] text-[#D99B00] font-bold">
                            ({m.awayPenalties} pen)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Destaque de Pênaltis no Card para Mata-Mata */}
                  {isKnockout &&
                    'homePenalties' in m &&
                    'awayPenalties' in m &&
                    m.homePenalties !== null &&
                    m.awayPenalties !== null && (
                      <div className="my-2 py-1 px-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-amber-300">
                        <span>⚖️ Decisão por Pênaltis:</span>
                        <span className="text-white bg-[#14181D] px-2 py-0.5 rounded border border-amber-500/30">
                          {homeTeam?.name || 'Mandante'} {m.homePenalties} × {m.awayPenalties} {awayTeam?.name || 'Visitante'}
                        </span>
                      </div>
                    )}

                  {/* Resumo da Súmula se houver */}
                  {hasSheet && sheet && (
                    <div className="mt-2.5 pt-2 border-t border-[#2F343C] text-[11px] text-[#8F99A8] space-y-1">
                      {sheet.goals.length > 0 && (
                        <div className="flex items-start gap-1">
                          <span className="shrink-0">⚽</span>
                          <span className="text-white truncate">
                            {sheet.goals
                              .map(g => {
                                if (g.isOwnGoal) return 'Gol Contra (GC)';
                                const team = teamMap.get(g.teamId);
                                const rawName = g.playerIndex !== null ? team?.players[g.playerIndex]?.trim() : null;
                                return rawName ? `#${g.playerIndex! + 1} ${rawName}` : g.playerName;
                              })
                              .join(', ')}
                          </span>
                        </div>
                      )}
                      {sheet.cards.length > 0 && (
                        <div className="flex items-start gap-1">
                          <span className="shrink-0">🟨</span>
                          <span className="truncate">
                            {sheet.cards
                              .map(c => {
                                const team = teamMap.get(c.teamId);
                                const rawName = team?.players[c.playerIndex]?.trim();
                                const name = rawName ? `#${c.playerIndex + 1} ${rawName}` : c.playerName;
                                return `${c.cardType === 'RED' ? '🟥' : '🟨'} ${name}`;
                              })
                              .join(', ')}
                          </span>
                        </div>
                      )}
                      {sheet.observations && (
                        <p className="italic text-[#8F99A8]/80 line-clamp-1">
                          "${sheet.observations}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Botões de Ação da Súmula (Apenas Arbitragem) */}
                  {!readOnly && (
                    <div className="mt-3 pt-2 flex items-center justify-end gap-2">
                      {hasSheet && (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                'Deseja realmente limpar a súmula desta partida? Os placares na aba Súmula e na aba Jogos serão zerados.'
                              )
                            ) {
                              onDeleteScoresheet(m.id);
                            }
                          }}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
                          title="Limpar Súmula e Zerar Placar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Limpar</span>
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={!homeTeam || !awayTeam}
                        onClick={() => setActiveModalMatch(m)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                          !homeTeam || !awayTeam
                            ? 'bg-[#2F343C]/40 text-[#8F99A8]/40 cursor-not-allowed'
                            : hasSheet
                            ? 'bg-[#2F343C] hover:bg-[#383E47] text-white border border-[#383E47]'
                            : 'bg-[#00D26A] hover:bg-[#00B85C] text-[#0B1320] shadow-md shadow-[#00D26A]/20'
                        }`}
                      >
                        <ClipboardList className="w-3.5 h-3.5" />
                        <span>{hasSheet ? 'Editar Súmula' : 'Preencher Súmula'}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Conteúdo: 2. Artilharia */}
      {subTab === 'artilharia' && (
        <div className="space-y-3">
          <div className="bg-[#1C2127] border border-[#2F343C] rounded-2xl overflow-hidden shadow-lg">
            <div className="p-3 bg-[#252A31] border-b border-[#2F343C] flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" /> Ranking de Artilheiros
              </span>
              <span className="text-xs text-[#8F99A8]">
                {topScorers.length} goleador(es)
              </span>
            </div>

            {topScorers.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8F99A8]">
                <Award className="w-8 h-8 mx-auto text-[#8F99A8]/40 mb-2" />
                <p>Nenhum gol registrado em súmula até o momento.</p>
                <p className="text-[11px] text-[#8F99A8]/60 mt-1">
                  Os gols lançados nas súmulas oficiais aparecerão automaticamente aqui.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#2F343C]">
                {topScorers.map((scorer, index) => {
                  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`;
                  return (
                    <div key={`${scorer.teamId}-${scorer.playerIndex}`} className="p-3 flex items-center justify-between hover:bg-[#252A31]/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold w-6 text-center text-amber-300">
                          {medal}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-white">{scorer.playerName}</p>
                          <p className="text-[10px] text-[#8F99A8]">{scorer.teamName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-[#00D26A] bg-[#00D26A]/10 border border-[#00D26A]/20 px-2 py-0.5 rounded-lg">
                          {scorer.goals} {scorer.goals === 1 ? 'gol' : 'gols'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo: 3. Quadro de Suspensões */}
      {subTab === 'suspensoes' && (
        <div className="space-y-3">
          <div className="bg-[#1C2127] border border-[#2F343C] rounded-2xl overflow-hidden shadow-lg">
            <div className="p-3 bg-[#252A31] border-b border-[#2F343C] flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" /> Atletas Suspensos por Rodada
              </span>
              <span className="text-xs text-[#8F99A8]">
                Regra: 2 Amarelos ou Vermelho
              </span>
            </div>

            {allSuspensions.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8F99A8]">
                <CheckCircle2 className="w-8 h-8 mx-auto text-[#00D26A] mb-2" />
                <p className="font-bold text-white">Nenhum atleta suspenso no momento!</p>
                <p className="text-[11px] text-[#8F99A8]/60 mt-1">
                  Fair play total em campo. Atletas com 2 cartões amarelos acumulados ou expulsos serão listados aqui.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#2F343C]">
                {allSuspensions.map((s, idx) => {
                  const motivoLabel =
                    s.reason === 'RED_CARD'
                      ? '🟥 Cartão Vermelho Direto'
                      : s.reason === 'DOUBLE_YELLOW'
                      ? '🟨🟨 2 Amarelos na Mesma Partida'
                      : '🟨 Acúmulo de 2 Amarelos em Jogos Distintos';

                  return (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-[#252A31]/50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{s.playerName}</span>
                          <span className="text-[10px] text-[#8F99A8]">({s.teamName})</span>
                        </div>
                        <p className="text-[11px] text-red-400 font-semibold mt-0.5">{motivoLabel}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-red-300 bg-red-500/10 border border-red-500/30 px-2 py-1 rounded-lg">
                          Suspenso na R{s.suspendedForRoundNumber}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Súmula (Apenas Arbitragem) */}
      {!readOnly && activeModalMatch && modalTeams && (
        <ScoresheetModal
          match={activeModalMatch}
          homeTeam={modalTeams.homeTeam}
          awayTeam={modalTeams.awayTeam}
          currentScoresheet={scoresheets[activeModalMatch.id]}
          suspensions={allSuspensions}
          roundNumber={'roundNumber' in activeModalMatch ? activeModalMatch.roundNumber : 12}
          onSave={onSaveScoresheet}
          onDelete={onDeleteScoresheet}
          onClose={() => setActiveModalMatch(null)}
        />
      )}
    </div>
  );
};
