import React, { useState } from 'react';
import { X, Plus, Trash2, AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import { Match, KnockoutMatch, Team, MatchScoresheet, GoalEvent, CardEvent, PlayerSuspension } from '../types/tournament';
import { isPlayerSuspended } from '../services/scoresheetService';

interface ScoresheetModalProps {
  match: Match | KnockoutMatch;
  homeTeam: Team;
  awayTeam: Team;
  currentScoresheet?: MatchScoresheet;
  suspensions: PlayerSuspension[];
  roundNumber: number;
  onSave: (sheet: MatchScoresheet) => void;
  onDelete?: (matchId: string) => void;
  onClose: () => void;
}

export const ScoresheetModal: React.FC<ScoresheetModalProps> = ({
  match,
  homeTeam,
  awayTeam,
  currentScoresheet,
  suspensions,
  roundNumber,
  onSave,
  onDelete,
  onClose
}) => {
  const [goals, setGoals] = useState<GoalEvent[]>(currentScoresheet?.goals || []);
  const [cards, setCards] = useState<CardEvent[]>(currentScoresheet?.cards || []);
  const [observations, setObservations] = useState(currentScoresheet?.observations || '');

  // Modais internos de seleção
  const [selectedGoalTeamId, setSelectedGoalTeamId] = useState<string | null>(null);
  const [selectedCardTeamId, setSelectedCardTeamId] = useState<string | null>(null);

  // Placar calculado da súmula
  const homeGoalsCount = goals.filter(
    g => (g.teamId === homeTeam.id && !g.isOwnGoal) || (g.teamId === awayTeam.id && g.isOwnGoal)
  ).length;

  const awayGoalsCount = goals.filter(
    g => (g.teamId === awayTeam.id && !g.isOwnGoal) || (g.teamId === homeTeam.id && g.isOwnGoal)
  ).length;

  const handleAddGoal = (teamId: string, playerIndex: number | null, isOwnGoal = false) => {
    const team = teamId === homeTeam.id ? homeTeam : awayTeam;
    let playerName = 'Gol Contra';
    if (!isOwnGoal && playerIndex !== null) {
      const rawName = team.players[playerIndex]?.trim();
      playerName = rawName ? `#${playerIndex + 1} ${rawName}` : `#${playerIndex + 1}`;
    }

    const newGoal: GoalEvent = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      teamId,
      playerIndex,
      playerName,
      isOwnGoal
    };
    setGoals([...goals, newGoal]);
    setSelectedGoalTeamId(null);
  };

  const handleRemoveGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleAddCard = (teamId: string, playerIndex: number, cardType: 'YELLOW' | 'RED') => {
    const team = teamId === homeTeam.id ? homeTeam : awayTeam;
    const rawName = team.players[playerIndex]?.trim();
    const playerName = rawName ? `#${playerIndex + 1} ${rawName}` : `#${playerIndex + 1}`;

    const newCard: CardEvent = {
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      teamId,
      playerIndex,
      playerName,
      cardType
    };
    setCards([...cards, newCard]);
    setSelectedCardTeamId(null);
  };

  const handleRemoveCard = (id: string) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const handleSave = () => {
    onSave({
      matchId: match.id,
      hasScoresheet: true,
      goals,
      cards,
      observations,
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Deseja realmente remover esta súmula? O placar voltará a ser controlado manualmente.')) {
      if (onDelete) {
        onDelete(match.id);
      }
      onClose();
    }
  };

  const matchTitle = 'roundNumber' in match ? `Rodada ${match.roundNumber}` : match.title;
  const matchTime = 'roundTime' in match ? match.roundTime : match.time;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1C2127] border border-[#2F343C] rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-[#2F343C] flex justify-between items-center bg-[#252A31]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00D26A] bg-[#00D26A]/10 px-2 py-0.5 rounded">
                Súmula de Arbitragem
              </span>
              <span className="text-xs text-[#8F99A8]">
                {matchTitle} • {match.field} • {matchTime}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-1">
              {homeTeam.name} <span className="text-[#8F99A8] font-normal">vs</span> {awayTeam.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8F99A8] hover:text-white rounded-lg hover:bg-[#2F343C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Placar ao Vivo da Súmula */}
        <div className="bg-[#14181D] px-4 py-3 border-b border-[#2F343C] flex items-center justify-between">
          <div className="text-center flex-1">
            <span className="text-xs font-semibold text-[#8F99A8] block truncate">{homeTeam.name}</span>
            <span className="text-2xl font-black text-white">{homeGoalsCount}</span>
          </div>
          <span className="text-xs font-bold text-[#8F99A8] uppercase px-3">×</span>
          <div className="text-center flex-1">
            <span className="text-xs font-semibold text-[#8F99A8] block truncate">{awayTeam.name}</span>
            <span className="text-2xl font-black text-white">{awayGoalsCount}</span>
          </div>
        </div>

        {/* Conteúdo Rolável */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Seção de Gols */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                ⚽ Gols Marcados ({goals.length})
              </h4>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedGoalTeamId(homeTeam.id)}
                  className="text-[11px] bg-[#2F343C] hover:bg-[#383E47] text-white px-2 py-1 rounded-md font-semibold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-[#00D26A]" /> {homeTeam.name}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGoalTeamId(awayTeam.id)}
                  className="text-[11px] bg-[#2F343C] hover:bg-[#383E47] text-white px-2 py-1 rounded-md font-semibold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-[#00D26A]" /> {awayTeam.name}
                </button>
              </div>
            </div>

            {/* Modal de Seleção de Autor do Gol */}
            {selectedGoalTeamId && (
              <div className="p-3 mb-3 bg-[#252A31] border border-[#383E47] rounded-xl animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">
                    Quem marcou o gol para {selectedGoalTeamId === homeTeam.id ? homeTeam.name : awayTeam.name}?
                  </span>
                  <button onClick={() => setSelectedGoalTeamId(null)} className="text-[#8F99A8] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                  {(selectedGoalTeamId === homeTeam.id ? homeTeam : awayTeam).players.map((p, idx) => {
                    const suspended = isPlayerSuspended(selectedGoalTeamId!, idx, roundNumber, suspensions);
                    const label = p.trim() ? `#${idx + 1} ${p}` : `#${idx + 1}`;
                    return (
                      <button
                        key={idx}
                        disabled={suspended}
                        onClick={() => handleAddGoal(selectedGoalTeamId!, idx, false)}
                        className={`text-left text-xs p-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                          suspended
                            ? 'bg-[#1C2127]/50 text-[#8F99A8]/40 border border-red-500/20 cursor-not-allowed'
                            : 'bg-[#1C2127] text-white hover:bg-[#2F343C] border border-[#2F343C]'
                        }`}
                      >
                        <span className="truncate">{label}</span>
                        {suspended && <span className="text-[9px] text-red-400 font-bold ml-1">SUSPENSO</span>}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleAddGoal(selectedGoalTeamId!, null, true)}
                    className="col-span-2 text-center text-xs p-2 rounded-lg font-bold bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition-colors"
                  >
                    ⚠️ Gol Contra (Adversário)
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Gols */}
            {goals.length === 0 ? (
              <p className="text-xs text-[#8F99A8] italic bg-[#14181D] p-3 rounded-xl border border-[#2F343C]">
                Nenhum gol registrado.
              </p>
            ) : (
              <div className="space-y-1.5">
                {goals.map(g => {
                  const team = g.teamId === homeTeam.id ? homeTeam : awayTeam;
                  return (
                    <div
                      key={g.id}
                      className="flex items-center justify-between p-2.5 bg-[#14181D] border border-[#2F343C] rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span>{g.isOwnGoal ? '⚠️' : '⚽'}</span>
                        <span className="font-bold text-white">{g.playerName}</span>
                        <span className="text-[#8F99A8] font-normal">({team.name})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(g.id)}
                        className="text-[#8F99A8] hover:text-red-400 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seção de Cartões */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                🟨 Cartões & Disciplina ({cards.length})
              </h4>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedCardTeamId(homeTeam.id)}
                  className="text-[11px] bg-[#2F343C] hover:bg-[#383E47] text-white px-2 py-1 rounded-md font-semibold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-amber-400" /> {homeTeam.name}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCardTeamId(awayTeam.id)}
                  className="text-[11px] bg-[#2F343C] hover:bg-[#383E47] text-white px-2 py-1 rounded-md font-semibold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-amber-400" /> {awayTeam.name}
                </button>
              </div>
            </div>

            {/* Modal de Seleção de Cartão */}
            {selectedCardTeamId && (
              <div className="p-3 mb-3 bg-[#252A31] border border-[#383E47] rounded-xl animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">
                    Aplicar advertência para atleta de {selectedCardTeamId === homeTeam.id ? homeTeam.name : awayTeam.name}:
                  </span>
                  <button onClick={() => setSelectedCardTeamId(null)} className="text-[#8F99A8] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto">
                  {(selectedCardTeamId === homeTeam.id ? homeTeam : awayTeam).players.map((p, idx) => {
                    const suspended = isPlayerSuspended(selectedCardTeamId!, idx, roundNumber, suspensions);
                    const label = p.trim() ? `#${idx + 1} ${p}` : `#${idx + 1}`;
                    const currentYellows = cards.filter(c => c.teamId === selectedCardTeamId && c.playerIndex === idx && c.cardType === 'YELLOW').length;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                          suspended
                            ? 'bg-[#1C2127]/50 text-[#8F99A8]/40 border border-red-500/20'
                            : 'bg-[#1C2127] text-white border border-[#2F343C]'
                        }`}
                      >
                        <div className="truncate flex-1 pr-2">
                          <span>{label}</span>
                          {currentYellows > 0 && (
                            <span className="ml-2 text-[10px] text-amber-400 font-bold">({currentYellows}x 🟨 no jogo)</span>
                          )}
                          {suspended && (
                            <span className="ml-2 text-[9px] text-red-400 font-bold">🔴 SUSPENSO</span>
                          )}
                        </div>
                        {!suspended && (
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleAddCard(selectedCardTeamId!, idx, 'YELLOW')}
                              className="px-2 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded font-bold text-[10px] border border-amber-500/40"
                            >
                              🟨 Amarelo
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddCard(selectedCardTeamId!, idx, 'RED')}
                              className="px-2 py-1 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded font-bold text-[10px] border border-red-500/40"
                            >
                              🟥 Vermelho
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lista de Cartões */}
            {cards.length === 0 ? (
              <p className="text-xs text-[#8F99A8] italic bg-[#14181D] p-3 rounded-xl border border-[#2F343C]">
                Nenhum cartão aplicado.
              </p>
            ) : (
              <div className="space-y-1.5">
                {cards.map(c => {
                  const team = c.teamId === homeTeam.id ? homeTeam : awayTeam;
                  return (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-2.5 bg-[#14181D] border border-[#2F343C] rounded-xl text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span>{c.cardType === 'YELLOW' ? '🟨' : '🟥'}</span>
                        <span className="font-bold text-white">{c.playerName}</span>
                        <span className="text-[#8F99A8] font-normal">({team.name})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCard(c.id)}
                        className="text-[#8F99A8] hover:text-red-400 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Seção de Observações */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              📋 Observações da Arbitragem
            </h4>
            <textarea
              value={observations}
              onChange={e => setObservations(e.target.value)}
              placeholder="Descreva incidentes, atrasos, substituições relevantes ou observações do árbitro..."
              rows={3}
              className="w-full bg-[#14181D] border border-[#2F343C] rounded-xl p-3 text-xs text-white placeholder-[#8F99A8]/60 focus:outline-none focus:border-[#00D26A] transition-colors resize-none"
            />
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="p-4 border-t border-[#2F343C] bg-[#14181D] flex items-center justify-between gap-2">
          {currentScoresheet?.hasScoresheet ? (
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/20 transition-colors"
            >
              Remover Súmula
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-[#8F99A8] hover:text-white px-3 py-2 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="bg-[#00D26A] hover:bg-[#00B85C] text-[#0B1320] text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-[#00D26A]/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" /> Salvar Súmula
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
