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

export interface TournamentState {
  teams: Team[];
  matches: Match[];
  knockoutMatches: KnockoutMatch[];
  version: number;
  lastUpdated: string;
}
