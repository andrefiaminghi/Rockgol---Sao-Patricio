export interface Team {
  id: string;
  name: string;
  players: string[]; // Exatamente 10 slots (índices 0 a 9)
}

export type MatchStatus = 'PENDING' | 'FINISHED';

export interface Match {
  id: string;
  roundNumber: number; // 1 a 11
  roundTime: string; // Ex: '09:00', '09:30'
  field: 'Campo 1' | 'Campo 2';
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
}

export interface KnockoutMatch {
  id: 'sf1' | 'sf2' | 'third_place' | 'final';
  title: string;
  field: 'Campo 1' | 'Campo 2';
  time: string;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties: number | null;
  awayPenalties: number | null;
  winnerTeamId: string | null;
  loserTeamId: string | null;
  status: MatchStatus;
}

export interface TeamStanding {
  teamId: string;
  teamName: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface GoalEvent {
  id: string;
  teamId: string;
  playerIndex: number | null; // 0 a 9 conforme slots do elenco em Team.players, ou null para gol contra
  playerName: string;         // Ex: "Pedro" ou "Jogador 7" / "Gol Contra"
  isOwnGoal?: boolean;
}

export type CardType = 'YELLOW' | 'RED';

export interface CardEvent {
  id: string;
  teamId: string;
  playerIndex: number;        // 0 a 9 conforme slots do elenco em Team.players
  playerName: string;
  cardType: CardType;
}

export interface MatchScoresheet {
  matchId: string;            // ID correspondente em matches ou knockoutMatches
  hasScoresheet: boolean;     // Flag determinística indicando se a súmula está ativa/preenchida
  goals: GoalEvent[];
  cards: CardEvent[];
  observations: string;       // Observações livres da arbitragem
  updatedAt: string;
}

export interface PlayerSuspension {
  teamId: string;
  teamName: string;
  playerIndex: number;
  playerName: string;
  suspendedForRoundNumber: number; // Rodada em que o jogador deve cumprir suspensão
  reason: 'RED_CARD' | 'DOUBLE_YELLOW' | 'ACCUMULATED_YELLOWS';
  originMatchId: string;
}

export interface TopScorer {
  teamId: string;
  teamName: string;
  playerIndex: number | null;
  playerName: string;
  goals: number;
}

export interface TournamentState {
  teams: Team[];
  matches: Match[];
  knockoutMatches: KnockoutMatch[];
  scoresheets: Record<string, MatchScoresheet>;
  version: number;
  lastUpdated: string;
}

