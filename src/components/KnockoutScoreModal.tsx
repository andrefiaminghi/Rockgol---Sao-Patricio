import React, { useState } from 'react';
import { X, Check, AlertCircle, Swords } from 'lucide-react';
import { KnockoutMatch, Team } from '../types/tournament';

interface KnockoutScoreModalProps {
  match: KnockoutMatch;
  teams: Team[];
  onClose: () => void;
  onSave: (
    match: KnockoutMatch,
    homeScore: number,
    awayScore: number,
    homePenalties: number | null,
    awayPenalties: number | null
  ) => void;
}

export const KnockoutScoreModal: React.FC<KnockoutScoreModalProps> = ({
  match,
  teams,
  onClose,
  onSave
}) => {
  const teamMap = new Map<string, string>();
  teams.forEach(t => teamMap.set(t.id, t.name));

  const homeName = match.homeTeamId ? teamMap.get(match.homeTeamId) || match.homeTeamId : 'A definir';
  const awayName = match.awayTeamId ? teamMap.get(match.awayTeamId) || match.awayTeamId : 'A definir';

  const [homeScore, setHomeScore] = useState<string>(
    match.homeScore !== null ? String(match.homeScore) : ''
  );
  const [awayScore, setAwayScore] = useState<string>(
    match.awayScore !== null ? String(match.awayScore) : ''
  );
  const [homePenalties, setHomePenalties] = useState<string>(
    match.homePenalties !== null ? String(match.homePenalties) : ''
  );
  const [awayPenalties, setAwayPenalties] = useState<string>(
    match.awayPenalties !== null ? String(match.awayPenalties) : ''
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isTied = homeScore !== '' && awayScore !== '' && parseInt(homeScore, 10) === parseInt(awayScore, 10);

  const handleSave = () => {
    setErrorMessage(null);

    if (homeScore === '' || awayScore === '') {
      setErrorMessage('Por favor, informe os placares do tempo normal.');
      return;
    }

    const hScore = parseInt(homeScore, 10);
    const aScore = parseInt(awayScore, 10);

    if (isNaN(hScore) || isNaN(aScore) || hScore < 0 || aScore < 0) {
      setErrorMessage('Placares devem ser números válidos maiores ou iguais a 0.');
      return;
    }

    if (hScore === aScore) {
      if (homePenalties === '' || awayPenalties === '') {
        setErrorMessage('Jogo empatado! É obrigatório preencher o placar da disputa de pênaltis.');
        return;
      }

      const hPen = parseInt(homePenalties, 10);
      const aPen = parseInt(awayPenalties, 10);

      if (isNaN(hPen) || isNaN(aPen) || hPen < 0 || aPen < 0) {
        setErrorMessage('Os pênaltis devem ser valores numéricos válidos.');
        return;
      }

      if (hPen === aPen) {
        setErrorMessage('A disputa de pênaltis não pode terminar empatada. Um vencedor deve ser definido.');
        return;
      }

      onSave(match, hScore, aScore, hPen, aPen);
      onClose();
    } else {
      onSave(match, hScore, aScore, null, null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#121D2F] border border-[#1E2D44] rounded-t-2xl sm:rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1E2D44] bg-[#16243A]">
          <div className="flex items-center space-x-2">
            <Swords className="w-5 h-5 text-[#00D26A]" />
            <div>
              <h2 className="text-sm font-bold text-white font-['Outfit',sans-serif]">{match.title}</h2>
              <p className="text-[11px] text-[#8B9BB4] font-medium">
                {match.field} • {match.time}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1A2538] text-[#8B9BB4] hover:text-white flex items-center justify-center border border-[#22314A] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-xl flex items-start gap-2 text-[#EF4444] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Confronto e Inputs de Placar */}
          <div className="bg-[#0E1726] p-4 rounded-xl border border-[#1E2D44]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#8B9BB4] mb-3 text-center font-['Outfit',sans-serif]">
              Tempo Normal (2 tempos de 10 min)
            </div>

            <div className="grid grid-cols-[1fr_auto_auto_auto_1fr] items-center gap-2.5">
              <div className="text-right">
                <span className="text-sm font-bold text-white line-clamp-1">{homeName}</span>
              </div>

              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={homeScore}
                onChange={e => setHomeScore(e.target.value)}
                className="w-12 h-12 text-center font-black text-xl bg-[#0B1320] border border-[#1E2D44] focus:border-[#00D26A] rounded-xl text-white outline-none transition tabular-nums"
                placeholder="0"
              />

              <span className="text-sm font-black text-[#5D6E87]">×</span>

              <input
                type="number"
                inputMode="numeric"
                min="0"
                value={awayScore}
                onChange={e => setAwayScore(e.target.value)}
                className="w-12 h-12 text-center font-black text-xl bg-[#0B1320] border border-[#1E2D44] focus:border-[#00D26A] rounded-xl text-white outline-none transition tabular-nums"
                placeholder="0"
              />

              <div className="text-left">
                <span className="text-sm font-bold text-white line-clamp-1">{awayName}</span>
              </div>
            </div>
          </div>

          {/* Botão ou Bloco de Pênaltis */}
          {isTied && (
            <div className="p-4 bg-[#0E1726] border border-[#C87619]/50 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-[#C87619] uppercase tracking-wide flex items-center gap-1.5 font-['Outfit',sans-serif]">
                  <span>Disputa de Pênaltis</span>
                </div>
                <span className="text-[10px] text-[#8B9BB4] font-medium">Obrigatório em empate</span>
              </div>

              <div className="grid grid-cols-[1fr_auto_auto_auto_1fr] items-center gap-2.5">
                <div className="text-right">
                  <span className="text-xs font-bold text-white line-clamp-1">{homeName}</span>
                </div>

                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={homePenalties}
                  onChange={e => setHomePenalties(e.target.value)}
                  className="w-11 h-10 text-center font-black text-base bg-[#0B1320] border border-[#C87619]/60 focus:border-[#C87619] rounded-lg text-[#C87619] outline-none transition tabular-nums"
                  placeholder="Pen"
                />

                <span className="text-xs font-black text-[#C87619]">×</span>

                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={awayPenalties}
                  onChange={e => setAwayPenalties(e.target.value)}
                  className="w-11 h-10 text-center font-black text-base bg-[#0B1320] border border-[#C87619]/60 focus:border-[#C87619] rounded-lg text-[#C87619] outline-none transition tabular-nums"
                  placeholder="Pen"
                />

                <div className="text-left">
                  <span className="text-xs font-bold text-white line-clamp-1">{awayName}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#1E2D44] bg-[#16243A] flex gap-2">
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
            Salvar Resultado
          </button>
        </div>
      </div>
    </div>
  );
};
