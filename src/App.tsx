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
import {
  syncMatchScoresFromScoresheets,
  removeScoresheetAndResetMatch,
  canDeleteScoresheet,
  applyHardResetFromRemote
} from './services/scoresheetService';
import {
  pushScoresheetToSupabase,
  deleteScoresheetFromSupabase,
  pushTeamToSupabase,
  pullTournamentFromSupabase
} from './services/supabaseService';
import { Team } from './types/tournament';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { MatchesTab } from './components/MatchesTab';
import { TeamsTab } from './components/TeamsTab';
import { StandingsTab } from './components/StandingsTab';
import { KnockoutTab } from './components/KnockoutTab';
import { ExportTab } from './components/ExportTab';
import { ScoresheetTab } from './components/ScoresheetTab';
import { IOSInstallBanner } from './components/IOSInstallBanner';
import { JudgeAuthLock, isJudgeAuthenticated } from './components/JudgeAuthLock';

export interface AppProps {
  role?: 'torcida' | 'juiz';
}

export function App({ role = 'torcida' }: AppProps = {}) {
  const [isJudgeAuthed, setIsJudgeAuthed] = useState<boolean>(() => {
    if (role !== 'juiz') return true;
    return isJudgeAuthenticated();
  });
  const [state, setState] = useState<TournamentState>(() => loadTournamentState());
  const [activeTab, setActiveTab] = useState<TabType>('matches');
  const [useDeviceFrame, setUseDeviceFrame] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('12:00');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Monitora conectividade com a internet
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

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
      // Bloqueia edição manual se houver súmula oficial registrada
      if (prev.scoresheets?.[matchId]?.hasScoresheet) {
        return prev;
      }

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
      let targetTeam: Team | undefined;
      const updatedTeams = prev.teams.map(t => {
        if (t.id !== teamId) return t;
        targetTeam = { ...t, players };
        return targetTeam;
      });

      if (role === 'juiz' && targetTeam) {
        pushTeamToSupabase(targetTeam).catch(err => {
          console.warn('Falha no sync do time para Supabase:', err);
        });
      }

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
  const handleSaveScoresheet = async (sheet: MatchScoresheet) => {
    try {
      const res = await pushScoresheetToSupabase(sheet);
      if (res.success) {
        showToast('Súmula salva no banco com sucesso!');
      } else {
        showToast('Súmula salva localmente (aviso: erro no banco de dados).');
      }
    } catch (err) {
      console.warn('Falha no sync da súmula para Supabase:', err);
      showToast('Súmula salva localmente.');
    }

    setState(prev => {
      const updatedSheets = { ...prev.scoresheets, [sheet.matchId]: sheet };
      const { matches, knockoutMatches } = syncMatchScoresFromScoresheets(
        prev.matches,
        prev.knockoutMatches,
        updatedSheets
      );

      const updatedState: TournamentState = {
        ...prev,
        matches,
        knockoutMatches,
        scoresheets: updatedSheets,
        lastUpdated: new Date().toISOString()
      };
      saveTournamentState(updatedState);
      return updatedState;
    });
  };

  // Handler para remover/limpar súmula (zera o placar e desvincula a súmula)
  const handleDeleteScoresheet = async (matchId: string) => {
    // 1. Validação de segurança: proíbe limpar R1 a R11 se houver súmulas registradas no mata-mata
    const check = canDeleteScoresheet(matchId, state.scoresheets);
    if (!check.canDelete) {
      showToast(check.reason || 'Bloqueado: Limpe primeiro as súmulas do mata-mata.');
      return;
    }

    // 2. Deleta o registro no Supabase com feedback visual
    try {
      const res = await deleteScoresheetFromSupabase(matchId);
      if (res.success) {
        showToast('Súmula excluída do banco com sucesso!');
      } else {
        showToast('Súmula limpa localmente (aviso: erro no banco de dados).');
      }
    } catch (err) {
      console.warn('Falha ao deletar súmula no Supabase:', err);
      showToast('Súmula limpa localmente.');
    }

    // 3. Reseta os placares na memória e storage
    setState(prev => {
      const { matches, knockoutMatches, scoresheets } = removeScoresheetAndResetMatch(
        matchId,
        prev.matches,
        prev.knockoutMatches,
        prev.scoresheets
      );

      const updatedState: TournamentState = {
        ...prev,
        matches,
        knockoutMatches,
        scoresheets,
        lastUpdated: new Date().toISOString()
      };
      saveTournamentState(updatedState);
      return updatedState;
    });
  };

  // Handler para sincronizar dados com a nuvem (Supabase)
  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const remoteData = await pullTournamentFromSupabase();
      if (!remoteData.success) {
        showToast(remoteData.error || 'Não foi possível conectar ao servidor. Tente novamente.');
        return;
      }
      setState(prev => {
        const updatedState = applyHardResetFromRemote(prev, remoteData);
        saveTournamentState(updatedState);
        return updatedState;
      });

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      setLastSyncTime(timeStr);
      showToast('Dados sincronizados com sucesso!');
    } catch (err) {
      console.warn('Falha na sincronização com o Supabase:', err);
      showToast('Não foi possível sincronizar no momento. Verifique a internet.');
    } finally {
      setIsSyncing(false);
    }
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
    <div data-role={role} className="flex flex-col h-full max-h-full overflow-hidden bg-[#0B1320] text-white font-sans selection:bg-[#00D26A] selection:text-[#0B1320] relative">
      <Header
        role={role}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        isOnline={isOnline}
        onSync={handleSync}
        finishedMatchesCount={finishedMatchesCount}
        totalMatchesCount={state.matches.length}
      />

      {/* Segundo Header: Barra de Abas Fixa no Topo */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {toastMessage && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-50 bg-[#121D2F] text-white px-4 py-2.5 rounded-2xl border border-[#00D26A]/40 shadow-xl shadow-black/50 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-4 h-4 text-[#00D26A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      <IOSInstallBanner />

      <main className="flex-1 w-full overflow-y-auto overscroll-contain px-3.5 pt-3.5 pb-8">
        {activeTab === 'matches' && (
          <MatchesTab
            matches={state.matches}
            teams={state.teams}
            scoresheets={state.scoresheets}
            onUpdateScore={handleUpdateMatchScore}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsTab
            teams={state.teams}
            readOnly={role === 'torcida'}
            onUpdatePlayers={handleUpdatePlayers}
          />
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

        {activeTab === 'scoresheet' && (
          <ScoresheetTab
            teams={state.teams}
            matches={state.matches}
            knockoutMatches={state.knockoutMatches}
            scoresheets={state.scoresheets}
            readOnly={role === 'torcida'}
            onSaveScoresheet={handleSaveScoresheet}
            onDeleteScoresheet={handleDeleteScoresheet}
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
    </div>
  );

  // Guarda de autenticação por PIN no PWA do Árbitro
  if (role === 'juiz' && !isJudgeAuthed) {
    return <JudgeAuthLock onAuthenticated={() => setIsJudgeAuthed(true)} />;
  }

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
          <div className="relative w-full max-w-[420px] md:h-[860px] h-screen h-[100dvh] bg-[#0B1320] md:rounded-[48px] overflow-hidden md:border-[10px] md:border-[#182740] md:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] flex flex-col">
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

            {/* Viewport Contido com Rolagem no Miolo */}
            <div className="flex-1 overflow-hidden relative">
              {AppContent}
            </div>

            {/* Barra Home Indicator estilo iOS */}
            <div className="hidden md:flex justify-center pb-2 pt-1 bg-[#0B1320] shrink-0">
              <div className="w-32 h-1 bg-[#1E2D44] rounded-full"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md h-screen h-[100dvh] bg-[#0B1320] flex flex-col shadow-2xl overflow-hidden">
          {AppContent}
        </div>
      )}
    </div>
  );
}

export default App;
