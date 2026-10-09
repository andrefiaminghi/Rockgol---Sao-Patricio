import { useState, useEffect, useMemo } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Sparkles } from 'lucide-react';
import { TournamentState, KnockoutMatch, MatchScoresheet } from './types/tournament';
import {
  loadTournamentState,
  saveTournamentState,
  resetTournamentState
} from './services/storageService';
import { calculateStandings, isGroupStageCompleted } from './services/standingsService';
import {
  generateSemifinals,
  resolveKnockoutMatch,
  updateFinalsFromSemifinals
} from './services/knockoutService';
import { syncMatchScoresFromScoresheets } from './services/scoresheetService';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { MatchesTab } from './components/MatchesTab';
import { TeamsTab } from './components/TeamsTab';
import { StandingsTab } from './components/StandingsTab';
import { KnockoutTab } from './components/KnockoutTab';
import { ExportTab } from './components/ExportTab';
import { IOSInstallBanner } from './components/IOSInstallBanner';

export function App() {
  const [state, setState] = useState<TournamentState>(() => loadTournamentState());
  const [activeTab, setActiveTab] = useState<TabType>('matches');
  const [useDeviceFrame, setUseDeviceFrame] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('12:00');

  // Relógio do status bar do aparelho
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Salva no localStorage em cada alteração de estado
  useEffect(() => {
    saveTournamentState(state);
  }, [state]);

  // Cálculos reativos da tabela e conclusão de fase
  const standings = useMemo(() => {
    return calculateStandings(state.teams, state.matches);
  }, [state.teams, state.matches]);

  const groupStageDone = useMemo(() => {
    return isGroupStageCompleted(state.matches);
  }, [state.matches]);

  const finishedMatchesCount = useMemo(() => {
    return state.matches.filter(m => m.status === 'FINISHED').length;
  }, [state.matches]);

  // Atualização automática das Semifinais quando a 1ª fase termina
  useEffect(() => {
    if (groupStageDone) {
      setState(prev => {
        const updatedKnockout = generateSemifinals(standings, prev.knockoutMatches);
        return {
          ...prev,
          knockoutMatches: updatedKnockout
        };
      });
    }
  }, [groupStageDone, standings]);

  // Handler para atualizar placar de partida da 1ª fase
  const handleUpdateMatchScore = (
    matchId: string,
    homeScore: number | null,
    awayScore: number | null
  ) => {
    setState(prev => {
      const updatedMatches = prev.matches.map(m => {
        if (m.id !== matchId) return m;
        const status = homeScore !== null && awayScore !== null ? 'FINISHED' : 'PENDING';
        return {
          ...m,
          homeScore,
          awayScore,
          status: status as 'FINISHED' | 'PENDING'
        };
      });

      return {
        ...prev,
        matches: updatedMatches,
        lastUpdated: new Date().toISOString()
      };
    });
  };

  // Handler para atualizar elencos
  const handleUpdatePlayers = (teamId: string, players: string[]) => {
    setState(prev => {
      const updatedTeams = prev.teams.map(t => {
        if (t.id !== teamId) return t;
        return { ...t, players };
      });

      return {
        ...prev,
        teams: updatedTeams,
        lastUpdated: new Date().toISOString()
      };
    });
  };

  // Handler para atualizar placar e pênaltis do mata-mata
  const handleUpdateKnockoutScore = (
    match: KnockoutMatch,
    homeScore: number,
    awayScore: number,
    homePenalties: number | null,
    awayPenalties: number | null
  ) => {
    setState(prev => {
      const { updatedMatch } = resolveKnockoutMatch(match, homeScore, awayScore, homePenalties, awayPenalties);
      let updatedMatches = prev.knockoutMatches.map(m => (m.id === updatedMatch.id ? updatedMatch : m));

      if (updatedMatch.id === 'sf1' || updatedMatch.id === 'sf2') {
        updatedMatches = updateFinalsFromSemifinals(updatedMatches);
      }

      return {
        ...prev,
        knockoutMatches: updatedMatches,
        lastUpdated: new Date().toISOString()
      };
    });
  };

  // Handler para salvar/atualizar súmula oficial
  const handleSaveScoresheet = (sheet: MatchScoresheet) => {
    setState(prev => {
      const updatedSheets = { ...prev.scoresheets, [sheet.matchId]: sheet };
      const { matches, knockoutMatches } = syncMatchScoresFromScoresheets(
        prev.matches,
        prev.knockoutMatches,
        updatedSheets
      );

      let finalKnockout = knockoutMatches;
      const targetKnockout = finalKnockout.find(m => m.id === sheet.matchId);
      if (
        targetKnockout &&
        (targetKnockout.id === 'sf1' || targetKnockout.id === 'sf2') &&
        targetKnockout.status === 'FINISHED'
      ) {
        finalKnockout = updateFinalsFromSemifinals(finalKnockout);
      }

      const updatedState: TournamentState = {
        ...prev,
        matches,
        knockoutMatches: finalKnockout,
        scoresheets: updatedSheets,
        lastUpdated: new Date().toISOString()
      };
      saveTournamentState(updatedState);
      return updatedState;
    });
  };

  // Handler para remover súmula (reverte ao modo de placar manual)
  const handleDeleteScoresheet = (matchId: string) => {
    setState(prev => {
      const updatedSheets = { ...prev.scoresheets };
      delete updatedSheets[matchId];
      const updatedState: TournamentState = {
        ...prev,
        scoresheets: updatedSheets,
        lastUpdated: new Date().toISOString()
      };
      saveTournamentState(updatedState);
      return updatedState;
    });
  };

  const handleRestoreState = (newState: TournamentState) => {
    setState(newState);
    saveTournamentState(newState);
  };

  const handleResetState = () => {
    const reset = resetTournamentState();
    setState(reset);
  };

  // Conteúdo interno do aplicativo
  const AppContent = (
    <div className="flex flex-col min-h-full bg-[#0B1320] text-white font-sans selection:bg-[#00D26A] selection:text-[#0B1320]">
      <Header
        finishedMatchesCount={finishedMatchesCount}
        totalMatchesCount={state.matches.length}
        onQuickSave={() => setActiveTab('export')}
        onResetPrompt={handleResetState}
      />

      <IOSInstallBanner />

      <main className="flex-1 w-full px-3.5 pt-3.5 pb-24">
        {activeTab === 'matches' && (
          <MatchesTab
            matches={state.matches}
            teams={state.teams}
            onUpdateScore={handleUpdateMatchScore}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsTab teams={state.teams} onUpdatePlayers={handleUpdatePlayers} />
        )}

        {activeTab === 'standings' && <StandingsTab standings={standings} />}

        {activeTab === 'knockout' && (
          <KnockoutTab
            knockoutMatches={state.knockoutMatches}
            teams={state.teams}
            isGroupStageDone={groupStageDone}
            onUpdateKnockoutScore={handleUpdateKnockoutScore}
          />
        )}

        {activeTab === 'export' && (
          <ExportTab
            state={state}
            onRestoreState={handleRestoreState}
            onResetState={handleResetState}
          />
        )}
      </main>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070D17] text-white flex flex-col justify-center items-center font-sans antialiased">
      {/* Barra de Ferramentas Desktop Superior (visível apenas em telas médias e grandes) */}
      <div className="hidden md:flex items-center justify-between w-full max-w-4xl px-6 py-3 border-b border-[#1E2D44] bg-[#0B1320]/95 backdrop-blur-md mb-6 rounded-b-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00D26A]/20 border border-[#00D26A]/40 flex items-center justify-center text-[#00D26A]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-white font-['Outfit',sans-serif]">
              RockGol 2026 • Modo Preview Mobile
            </h2>
            <p className="text-[11px] text-[#8B9BB4]">
              Layout Oficial São Patrício • 100% Offline PWA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUseDeviceFrame(!useDeviceFrame)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
              useDeviceFrame
                ? 'bg-[#1A2538] text-white border-[#22314A]'
                : 'bg-[#00D26A] text-[#0B1320] border-[#00D26A]'
            }`}
          >
            {useDeviceFrame ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#00D26A]" />
                <span>Simulador de Celular Ativo</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>Tela Cheia</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Renderização Condicional: No celular é 100% nativo. No Desktop oferece a moldura elegante do aparelho */}
      {useDeviceFrame ? (
        <div className="w-full flex justify-center items-center py-0 md:py-6">
          <div className="relative w-full max-w-[420px] md:h-[860px] h-screen bg-[#0B1320] md:rounded-[48px] overflow-hidden md:border-[10px] md:border-[#182740] md:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] flex flex-col">
            {/* Dynamic Island e Status Bar (estilo smartphone moderno) */}
            <div className="hidden md:flex items-center justify-between px-7 pt-3.5 pb-2 text-xs text-[#8B9BB4] bg-[#0B1320] select-none shrink-0 z-50">
              <span className="font-semibold text-xs text-white">{currentTime}</span>

              {/* Dynamic Island */}
              <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center shadow-inner">
                <div className="w-2 h-2 rounded-full bg-[#1A2538] mr-2"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#22314A]"></div>
              </div>

              <div className="flex items-center gap-1.5 text-[#8B9BB4]">
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-4 h-4 text-[#00D26A]" />
              </div>
            </div>

            {/* Viewport com Rolagem Suave */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
              {AppContent}
            </div>

            {/* Barra Home Indicator estilo iOS */}
            <div className="hidden md:flex justify-center pb-2 pt-1 bg-[#0B1320] shrink-0">
              <div className="w-32 h-1 bg-[#1E2D44] rounded-full"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md min-h-screen bg-[#0B1320] flex flex-col shadow-2xl">
          {AppContent}
        </div>
      )}
    </div>
  );
}

export default App;
