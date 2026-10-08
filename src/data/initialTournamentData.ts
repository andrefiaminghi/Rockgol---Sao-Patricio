import { Team, Match, KnockoutMatch } from '../types/tournament';

export const INITIAL_TEAMS: Team[] = [
  { id: 'bordogos', name: 'Bordogos', players: Array(10).fill('') },
  { id: 'meia-boca', name: 'Meia Boca Jr', players: Array(10).fill('') },
  { id: 'os-reis', name: 'Os Reis', players: Array(10).fill('') },
  { id: 'snow-beast', name: 'Snow Beast', players: Array(10).fill('') },
  { id: 'real-matismo', name: 'Real Matismo', players: Array(10).fill('') },
  { id: 'infarto', name: 'Infarto', players: Array(10).fill('') },
  { id: 'time-teu', name: 'Time Teu', players: Array(10).fill('') }
];

export const ROUND_RESTING_TEAMS: Record<number, string[]> = {
  1: ['real-matismo', 'infarto', 'time-teu'],
  2: ['os-reis', 'snow-beast', 'meia-boca'],
  3: ['infarto', 'time-teu', 'bordogos'],
  4: ['meia-boca', 'snow-beast', 'real-matismo'],
  5: ['bordogos', 'os-reis', 'infarto'],
  6: ['meia-boca', 'snow-beast', 'time-teu'],
  7: ['os-reis', 'real-matismo', 'bordogos'],
  8: ['infarto', 'meia-boca', 'snow-beast'],
  9: ['os-reis', 'real-matismo', 'time-teu'],
  10: ['bordogos', 'meia-boca', 'real-matismo'],
  11: ['bordogos', 'infarto', 'os-reis', 'snow-beast', 'time-teu']
};

export const INITIAL_MATCHES: Match[] = [
  // Rodada 1 - 09:00
  { id: 'm1', roundNumber: 1, roundTime: '09:00', field: 'Campo 1', homeTeamId: 'bordogos', awayTeamId: 'meia-boca', homeScore: null, awayScore: null, status: 'PENDING' },
  { id: 'm2', roundNumber: 1, roundTime: '09:00', field: 'Campo 2', homeTeamId: 'os-reis', awayTeamId: 'snow-beast', homeScore: null, awayScore: null, status: 'PENDING' },
  // Rodada 2 - 09:30
  { id: 'm3', roundNumber: 2, roundTime: '09:30', field: 'Campo 1', homeTeamId: 'real-matismo', awayTeamId: 'infarto', homeScore: null, awayScore: null, status: 'PENDING' },
  { id: 'm4', roundNumber: 2, roundTime: '09:30', field: 'Campo 2', homeTeamId: 'time-teu', awayTeamId: 'bordogos', homeScore: null, awayScore: null, status: 'PENDING' },
  // Rodada 3 - 10:00
  { id: 'm5', roundNumber: 3, roundTime: '10:00', field: 'Campo 1', homeTeamId: 'os-reis', awayTeamId: 'meia-boca', homeScore: null, awayScore: null, status: 'PENDING' },
  { id: 'm6', roundNumber: 3, roundTime: '10:00', field: 'Campo 2', homeTeamId: 'snow-beast', awayTeamId: 'real-matismo', homeScore: null, awayScore: null, status: 'PENDING' },
  // Rodada 4 - 10:30
  { id: 'm7', roundNumber: 4, roundTime: '10:30', field: 'Campo 1', homeTeamId: 'infarto', awayTeamId: 'time-teu', homeScore: null, awayScore: null, status: 'PENDING' },
  { id: 'm8', roundNumber: 4, roundTime: '10:30', field: 'Campo 2', homeTeamId: 'bordogos', awayTeamId: 'os-reis', homeScore: null, awayScore: null, status: 'PENDING' },
  // Rodada 5 - 11:00
  { id: 'm9', roundNumber: 5, roundTime: '11:00', field: 'Campo 1', homeTeamId: 'meia-boca', awayTeamId: 'snow-beast', homeScore: null, awayScore: null, status: 'PENDING' },
  { id: 'm10', roundNumber: 5, roundTime: '11:00', field: 'Campo 2', homeTeamId: 'real-matismo', awayTeamId: 'time-teu', homeScore: null, awayScore: null, status: 'PENDING' },
  // Rodada 6 - 11:30
  { id: 'm11', roundNumber: 6, roundTime: '11:30', field: 'Campo 1', homeTeamId: 'infarto', awayTeamId: 'bordogos', homeScore: null, awayScore: null, status: 'PENDING' },
  { id: 'm12', roundNumber: 6, roundTime: '11:30', field: 'Campo 2', homeTeamId: 'os-reis', awayTeamId: 'real-matismo', homeScore: null, awayScore: null, status: 'PENDING' },
  // ALMOÇO 12:00 às 13:30 (Pausa Geral)
  // Rodada 7 - 13:30
  { id: 'm13', roundNumber: 7, roundTime: '13:30', field: 'Campo 1', homeTeamId: 'meia-boca', awayTeamId: 'time-teu', homeScore: null, awayScore: null, status: 'PENDING' },
  { id: 'm14', roundNumber: 7, roundTime: '13:30', field: 'Campo 2', homeTeamId: 'snow-beast', awayTeamId: 'infarto', homeScore: null, awayScore: null, status: 'PENDING' },
  // Rodada 8 - 14:00
  { id: 'm15', roundNumber: 8, roundTime: '14:00', field: 'Campo 1', homeTeamId: 'bordogos', awayTeamId: 'real-matismo', homeScore: null, awayScore: null, status: 'PENDING' },
  { id: 'm16', roundNumber: 8, roundTime: '14:00', field: 'Campo 2', homeTeamId: 'os-reis', awayTeamId: 'time-teu', homeScore: null, awayScore: null, status: 'PENDING' },
  // Rodada 9 - 14:30
  { id: 'm17', roundNumber: 9, roundTime: '14:30', field: 'Campo 1', homeTeamId: 'meia-boca', awayTeamId: 'infarto', homeScore: null, awayScore: null, status: 'PENDING' },
  { id: 'm18', roundNumber: 9, roundTime: '14:30', field: 'Campo 2', homeTeamId: 'snow-beast', awayTeamId: 'bordogos', homeScore: null, awayScore: null, status: 'PENDING' },
  // Rodada 10 - 15:00
  { id: 'm19', roundNumber: 10, roundTime: '15:00', field: 'Campo 1', homeTeamId: 'time-teu', awayTeamId: 'snow-beast', homeScore: null, awayScore: null, status: 'PENDING' },
  { id: 'm20', roundNumber: 10, roundTime: '15:00', field: 'Campo 2', homeTeamId: 'os-reis', awayTeamId: 'infarto', homeScore: null, awayScore: null, status: 'PENDING' },
  // Rodada 11 - 15:30 (Campo 1 ocupado, Campo 2 livre)
  { id: 'm21', roundNumber: 11, roundTime: '15:30', field: 'Campo 1', homeTeamId: 'real-matismo', awayTeamId: 'meia-boca', homeScore: null, awayScore: null, status: 'PENDING' }
];

export const INITIAL_KNOCKOUT_MATCHES: KnockoutMatch[] = [
  { id: 'sf1', title: 'Semifinal 1', field: 'Campo 1', time: '16:00', homeTeamId: null, awayTeamId: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, winnerTeamId: null, loserTeamId: null, status: 'PENDING' },
  { id: 'sf2', title: 'Semifinal 2', field: 'Campo 2', time: '16:00', homeTeamId: null, awayTeamId: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, winnerTeamId: null, loserTeamId: null, status: 'PENDING' },
  { id: 'third_place', title: 'Disputa de 3º Lugar', field: 'Campo 1', time: '16:30', homeTeamId: null, awayTeamId: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, winnerTeamId: null, loserTeamId: null, status: 'PENDING' },
  { id: 'final', title: 'Grande Final', field: 'Campo 1', time: '17:00', homeTeamId: null, awayTeamId: null, homeScore: null, awayScore: null, homePenalties: null, awayPenalties: null, winnerTeamId: null, loserTeamId: null, status: 'PENDING' }
];
