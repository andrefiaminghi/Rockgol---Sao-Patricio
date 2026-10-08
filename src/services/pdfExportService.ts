import { TournamentState } from '../types/tournament';
import { calculateStandings } from './standingsService';

export function generateTournamentReportHtml(state: TournamentState): string {
  const standings = calculateStandings(state.teams, state.matches);
  const teamMap = new Map<string, string>();
  state.teams.forEach(t => teamMap.set(t.id, t.name));

  const sf1 = state.knockoutMatches.find(m => m.id === 'sf1');
  const sf2 = state.knockoutMatches.find(m => m.id === 'sf2');
  const thirdPlace = state.knockoutMatches.find(m => m.id === 'third_place');
  const finalMatch = state.knockoutMatches.find(m => m.id === 'final');

  const renderKnockoutItem = (label: string, match?: typeof sf1) => {
    if (!match) return '';
    const home = match.homeTeamId ? teamMap.get(match.homeTeamId) || match.homeTeamId : 'A definir';
    const away = match.awayTeamId ? teamMap.get(match.awayTeamId) || match.awayTeamId : 'A definir';
    const score = match.status === 'FINISHED'
      ? `${match.homeScore} × ${match.awayScore}${match.homePenalties !== null ? ` (Pênaltis: ${match.homePenalties} × ${match.awayPenalties})` : ''}`
      : 'A disputar';

    return `
      <div style="border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; margin-bottom: 8px;">
        <div style="font-weight: bold; font-size: 13px; color: #047857; margin-bottom: 4px;">${label} (${match.field} • ${match.time})</div>
        <div style="display: flex; justify-content: space-between; font-size: 14px;">
          <span><strong>${home}</strong></span>
          <span style="font-weight: bold; padding: 0 10px;">${score}</span>
          <span><strong>${away}</strong></span>
        </div>
      </div>
    `;
  };

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>Relatório Oficial - RockGol São Patrício 2026</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 25px; margin: 0; background: #fff; }
        .header { display: flex; align-items: center; border-bottom: 2px solid #10b981; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { width: 70px; height: 70px; border-radius: 12px; object-fit: cover; margin-right: 15px; border: 2px solid #10b981; }
        h1 { margin: 0; font-size: 22px; color: #0f172a; text-transform: uppercase; }
        p { margin: 3px 0; color: #64748b; font-size: 13px; }
        h2 { font-size: 16px; margin: 20px 0 10px 0; color: #0f172a; border-left: 4px solid #10b981; padding-left: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 12px; }
        th { background: #0f172a; color: #fff; text-align: center; padding: 8px 6px; font-size: 11px; }
        th.team { text-align: left; padding-left: 10px; }
        td { border-bottom: 1px solid #e2e8f0; padding: 7px 6px; text-align: center; }
        td.team { text-align: left; font-weight: bold; padding-left: 10px; }
        tr:nth-child(even) { background-color: #f8fafc; }
        .g4 { background-color: #ecfdf5 !important; }
        .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        @media print {
          body { padding: 10px; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="/logotipoapp.jpg" class="logo" alt="RockGol" />
        <div>
          <h1>RockGol 2026 — São Patrício Bar</h1>
          <p>Relatório Oficial de Classificação e Chaveamento Eliminatório</p>
          <p>Emitido em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </div>

      <h2>1. Classificação Geral da 1ª Fase (Turno Único)</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 30px;">#</th>
            <th class="team">Equipe</th>
            <th>PG</th>
            <th>J</th>
            <th>V</th>
            <th>E</th>
            <th>D</th>
            <th>GP</th>
            <th>GC</th>
            <th>SG</th>
          </tr>
        </thead>
        <tbody>
          ${standings.map((t, idx) => `
            <tr class="${idx < 4 ? 'g4' : ''}">
              <td style="font-weight: bold;">${idx + 1}º</td>
              <td class="team">${t.teamName} ${idx < 4 ? '<small style="color:#059669;">[G4]</small>' : ''}</td>
              <td style="font-weight: bold; color: #059669;">${t.points}</td>
              <td>${t.played}</td>
              <td>${t.won}</td>
              <td>${t.drawn}</td>
              <td>${t.lost}</td>
              <td>${t.goalsFor}</td>
              <td>${t.goalsAgainst}</td>
              <td style="font-weight: bold;">${t.goalDifference > 0 ? `+${t.goalDifference}` : t.goalDifference}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>2. Fase Final — Mata-Mata</h2>
      ${renderKnockoutItem('Semifinal 1', sf1)}
      ${renderKnockoutItem('Semifinal 2', sf2)}
      ${renderKnockoutItem('Disputa de 3º Lugar', thirdPlace)}
      ${renderKnockoutItem('Grande Final', finalMatch)}

      <div class="footer">
        RockGol São Patrício Bar 2026 • Documento oficial gerado via Aplicativo Mobile PWA
      </div>
    </body>
    </html>
  `;
}

export function openPrintReport(state: TournamentState): void {
  const html = generateTournamentReportHtml(state);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }
}
