import { jsPDF } from 'jspdf';
import { Share } from '@capacitor/share';
import { TournamentState } from '../types/tournament';
import { calculateStandings } from './standingsService';

export interface GeneratePdfResult {
  blob: Blob;
  filename: string;
  shareSummary: string;
}

/**
 * Gera o arquivo PDF em memória sem abrir navegadores externos e faz o download direto.
 */
export function generateAndDownloadTournamentPdf(state: TournamentState): GeneratePdfResult {
  const standings = calculateStandings(state.teams, state.matches);
  const teamMap = new Map<string, string>();
  state.teams.forEach(t => teamMap.set(t.id, t.name));

  const sf1 = state.knockoutMatches.find(m => m.id === 'sf1');
  const sf2 = state.knockoutMatches.find(m => m.id === 'sf2');
  const thirdPlace = state.knockoutMatches.find(m => m.id === 'third_place');
  const finalMatch = state.knockoutMatches.find(m => m.id === 'final');

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [0, 210, 106]; // #00D26A
  const darkBg = [11, 19, 32]; // #0B1320
  const grayText = [139, 155, 180]; // #8B9BB4

  // Top Bar Decorativo
  doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  doc.rect(0, 0, 210, 28, 'F');

  // Título e Subtítulo
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('ROCKGOL 2026 — SÃO PATRÍCIO BAR', 14, 12);

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(9);
  doc.text('RELATÓRIO OFICIAL DE CLASSIFICAÇÃO E MATA-MATA', 14, 18);

  const now = new Date();
  const dateStr = `Gerado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  doc.setTextColor(grayText[0], grayText[1], grayText[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(dateStr, 14, 24);

  // Linha divisória verde
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.8);
  doc.line(14, 28, 196, 28);

  // Seção 1: Classificação
  let y = 37;
  doc.setTextColor(11, 19, 32);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. Tabela de Classificação da 1ª Fase', 14, y);

  // Cabeçalho da Tabela
  y += 5;
  doc.setFillColor(18, 29, 47);
  doc.rect(14, y, 182, 7, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('POS', 16, y + 5);
  doc.text('EQUIPE', 30, y + 5);
  doc.text('PTS', 95, y + 5, { align: 'center' });
  doc.text('J', 110, y + 5, { align: 'center' });
  doc.text('V', 123, y + 5, { align: 'center' });
  doc.text('E', 136, y + 5, { align: 'center' });
  doc.text('D', 149, y + 5, { align: 'center' });
  doc.text('GP', 162, y + 5, { align: 'center' });
  doc.text('GC', 175, y + 5, { align: 'center' });
  doc.text('SG', 188, y + 5, { align: 'center' });

  // Linhas da Tabela
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  standings.forEach((team, idx) => {
    const isG4 = idx < 4;
    const rowHeight = 7;

    // Fundo zebrado ou destaque G4
    if (isG4) {
      doc.setFillColor(240, 253, 244); // Verde bem suave para G4
    } else if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(14, y, 182, rowHeight, 'F');

    // Linha inferior suave
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(14, y + rowHeight, 196, y + rowHeight);

    // Indicador G4
    if (isG4) {
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.circle(20, y + 3.5, 2.5, 'F');
      doc.setTextColor(11, 19, 32);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.text(String(idx + 1), 20, y + 4.5, { align: 'center' });
    } else {
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(`${idx + 1}º`, 20, y + 4.5, { align: 'center' });
    }

    // Nome da equipe
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(team.teamName, 30, y + 4.5);

    // Estatísticas
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 150, 70);
    doc.text(String(team.points), 95, y + 4.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(String(team.played), 110, y + 4.5, { align: 'center' });
    doc.text(String(team.won), 123, y + 4.5, { align: 'center' });
    doc.text(String(team.drawn), 136, y + 4.5, { align: 'center' });
    doc.text(String(team.lost), 149, y + 4.5, { align: 'center' });
    doc.text(String(team.goalsFor), 162, y + 4.5, { align: 'center' });
    doc.text(String(team.goalsAgainst), 175, y + 4.5, { align: 'center' });

    // Saldo de gols
    const sgStr = team.goalDifference > 0 ? `+${team.goalDifference}` : String(team.goalDifference);
    if (team.goalDifference > 0) {
      doc.setTextColor(0, 150, 70);
      doc.setFont('helvetica', 'bold');
    } else if (team.goalDifference < 0) {
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
    }
    doc.text(sgStr, 188, y + 4.5, { align: 'center' });

    y += rowHeight;
  });

  // Legenda G4
  y += 3;
  doc.setFontSize(7.5);
  doc.setTextColor(0, 150, 70);
  doc.setFont('helvetica', 'bold');
  doc.text('• 1º ao 4º Colocado (G4): Classificados para as Semifinais.', 14, y);
  y += 4;
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('* Critérios de Desempate: Pontos > Vitórias > Saldo de Gols > Gols Pró > Confronto Direto > Sorteio.', 14, y);

  // Seção 2: Chaveamento do Mata-Mata
  y += 10;
  doc.setTextColor(11, 19, 32);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. Chaveamento Eliminatório (Mata-Mata)', 14, y);

  const drawKnockoutBox = (
    title: string,
    fieldTime: string,
    homeId: string | null,
    awayId: string | null,
    hScore: number | null,
    aScore: number | null,
    hPen: number | null,
    aPen: number | null,
    winnerId: string | null,
    startY: number
  ) => {
    const boxHeight = 15;
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, startY, 182, boxHeight, 2, 2, 'FD');

    // Título do jogo
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(title, 18, startY + 5);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(fieldTime, 192, startY + 5, { align: 'right' });

    // Equipes e placar
    const homeName = homeId ? teamMap.get(homeId) || homeId : 'A definir';
    const awayName = awayId ? teamMap.get(awayId) || awayId : 'A definir';
    const scoreText = hScore !== null && aScore !== null
      ? `${hScore}  ×  ${aScore} ${hPen !== null && aPen !== null ? `(Pênaltis: ${hPen} × ${aPen})` : ''}`
      : 'A disputar';

    doc.setFontSize(9);
    doc.setFont('helvetica', winnerId === homeId && winnerId ? 'bold' : 'normal');
    doc.setTextColor(winnerId === homeId && winnerId ? 0 : 30, winnerId === homeId && winnerId ? 150 : 41, winnerId === homeId && winnerId ? 70 : 59);
    doc.text(homeName, 18, startY + 11);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(scoreText, 105, startY + 11, { align: 'center' });

    doc.setFont('helvetica', winnerId === awayId && winnerId ? 'bold' : 'normal');
    doc.setTextColor(winnerId === awayId && winnerId ? 0 : 30, winnerId === awayId && winnerId ? 150 : 41, winnerId === awayId && winnerId ? 70 : 59);
    doc.text(awayName, 192, startY + 11, { align: 'right' });

    return startY + boxHeight + 3;
  };

  y += 5;
  y = drawKnockoutBox(
    'Semifinal 1',
    `${sf1?.field || 'Campo 1'} • ${sf1?.time || '16:00'}`,
    sf1?.homeTeamId || null,
    sf1?.awayTeamId || null,
    sf1?.homeScore ?? null,
    sf1?.awayScore ?? null,
    sf1?.homePenalties ?? null,
    sf1?.awayPenalties ?? null,
    sf1?.winnerTeamId ?? null,
    y
  );

  y = drawKnockoutBox(
    'Semifinal 2',
    `${sf2?.field || 'Campo 2'} • ${sf2?.time || '16:00'}`,
    sf2?.homeTeamId || null,
    sf2?.awayTeamId || null,
    sf2?.homeScore ?? null,
    sf2?.awayScore ?? null,
    sf2?.homePenalties ?? null,
    sf2?.awayPenalties ?? null,
    sf2?.winnerTeamId ?? null,
    y
  );

  y = drawKnockoutBox(
    'Disputa de 3º Lugar',
    `${thirdPlace?.field || 'Campo 2'} • ${thirdPlace?.time || '16:30'}`,
    thirdPlace?.homeTeamId || null,
    thirdPlace?.awayTeamId || null,
    thirdPlace?.homeScore ?? null,
    thirdPlace?.awayScore ?? null,
    thirdPlace?.homePenalties ?? null,
    thirdPlace?.awayPenalties ?? null,
    thirdPlace?.winnerTeamId ?? null,
    y
  );

  y = drawKnockoutBox(
    'Grande Final',
    `${finalMatch?.field || 'Campo 1'} • ${finalMatch?.time || '17:00'}`,
    finalMatch?.homeTeamId || null,
    finalMatch?.awayTeamId || null,
    finalMatch?.homeScore ?? null,
    finalMatch?.awayScore ?? null,
    finalMatch?.homePenalties ?? null,
    finalMatch?.awayPenalties ?? null,
    finalMatch?.winnerTeamId ?? null,
    y
  );

  // Rodapé do documento
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('RockGol São Patrício Bar 2026 • Documento Oficial emitido via Aplicativo', 105, 285, { align: 'center' });

  // Nome do arquivo
  const filename = `RockGol_2026_Relatorio_${new Date().toISOString().slice(0, 10)}.pdf`;

  // Executa o download nativo do arquivo PDF (sem navegar para fora do app)
  doc.save(filename);

  // Monta resumo textual pronto para envio no WhatsApp
  const shareSummary = generateTournamentWhatsAppSummary(state);

  return {
    blob: doc.output('blob'),
    filename,
    shareSummary
  };
}

/**
 * Cria o resumo textual oficial com caracteres formatados para WhatsApp
 */
export function generateTournamentWhatsAppSummary(state: TournamentState): string {
  const standings = calculateStandings(state.teams, state.matches);
  const teamMap = new Map<string, string>();
  state.teams.forEach(t => teamMap.set(t.id, t.name));

  const sf1 = state.knockoutMatches.find(m => m.id === 'sf1');
  const sf2 = state.knockoutMatches.find(m => m.id === 'sf2');
  const thirdPlace = state.knockoutMatches.find(m => m.id === 'third_place');
  const finalMatch = state.knockoutMatches.find(m => m.id === 'final');

  let text = `🏆 *ROCKGOL 2026 — SÃO PATRÍCIO BAR*\n`;
  text += `📊 *Classificação Oficial (1ª Fase):*\n\n`;

  standings.forEach((t, i) => {
    const isG4 = i < 4;
    const badge = isG4 ? '🟢' : '⚪';
    const sg = t.goalDifference > 0 ? `+${t.goalDifference}` : t.goalDifference;
    text += `${badge} ${i + 1}º *${t.teamName}* — ${t.points} pts (${t.won}V | SG: ${sg})\n`;
  });

  const hasKnockoutStarted = state.knockoutMatches.some(m => m.status === 'FINISHED' || m.homeTeamId);
  if (hasKnockoutStarted) {
    text += `\n⚔️ *Mata-Mata:*\n`;
    const formatMatch = (title: string, m: any) => {
      if (!m) return '';
      const h = m.homeTeamId ? teamMap.get(m.homeTeamId) || m.homeTeamId : 'A definir';
      const a = m.awayTeamId ? teamMap.get(m.awayTeamId) || m.awayTeamId : 'A definir';
      const score = m.status === 'FINISHED' ? `${m.homeScore} × ${m.awayScore}` : 'A disputar';
      return `• ${title}: ${h} ${score} ${a}\n`;
    };

    text += formatMatch('SF1', sf1);
    text += formatMatch('SF2', sf2);
    text += formatMatch('3º Lugar', thirdPlace);
    text += formatMatch('Grande Final', finalMatch);
  }

  const now = new Date();
  const dateStr = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  text += `\n🕒 _Atualizado em ${dateStr}_\n`;
  text += `📱 _RockGol 2026 — App Oficial_`;

  return text;
}

/**
 * Dispara o compartilhamento da classificação diretamente no WhatsApp
 */
export async function shareClassificationToWhatsApp(state: TournamentState): Promise<void> {
  const summary = generateTournamentWhatsAppSummary(state);
  await shareReportToWhatsApp(summary);
}

/**
 * Dispara o compartilhamento de texto via WhatsApp ou folha nativa do aparelho
 */
export async function shareReportToWhatsApp(text: string): Promise<void> {
  try {
    // Tenta primeiro o compartilhamento nativo do Capacitor
    const canShare = await Share.canShare();
    if (canShare.value) {
      await Share.share({
        title: 'RockGol 2026 - Classificação',
        text: text,
        dialogTitle: 'Compartilhar Classificação'
      });
      return;
    }
  } catch {
    // Fallback gracioso
  }

  // Fallback via URL do WhatsApp (abre diretamente o app do WhatsApp sem fechar o nosso aplicativo)
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  window.location.href = whatsappUrl;
}
