import React, { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, CheckCircle2, AlertCircle, MessageCircle, FileText, Trophy, ShieldAlert } from 'lucide-react';
import { TournamentState } from '../types/tournament';
import { saveTournamentBackupFile, importTournamentBackup } from '../services/backupService';
import {
  generateAndDownloadTournamentPdf,
  shareClassificationToWhatsApp,
  shareTopScorersToWhatsApp,
  shareSuspensionsToWhatsApp
} from '../services/pdfExportService';

interface ExportTabProps {
  state: TournamentState;
  onRestoreState: (state: TournamentState) => void;
  onResetState: () => void;
}

export const ExportTab: React.FC<ExportTabProps> = ({ state, onRestoreState, onResetState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  const handleDownloadPdf = () => {
    try {
      setFeedback({
        message: 'Gerando relatório oficial em PDF com Súmulas...',
        isError: false
      });
      const result = generateAndDownloadTournamentPdf(state);
      setFeedback({
        message: `Relatório "${result.filename}" gerado e baixado com sucesso!`,
        isError: false
      });
    } catch (err: any) {
      setFeedback({ message: `Erro ao gerar PDF: ${err.message}`, isError: true });
    }
  };

  const handleShareClassification = async () => {
    try {
      setFeedback({
        message: 'Abrindo WhatsApp para enviar a classificação...',
        isError: false
      });
      await shareClassificationToWhatsApp(state);
    } catch (err: any) {
      setFeedback({
        message: `Erro ao compartilhar: ${err.message}`,
        isError: true
      });
    }
  };

  const handleShareTopScorers = async () => {
    try {
      setFeedback({
        message: 'Abrindo WhatsApp para enviar a artilharia oficial...',
        isError: false
      });
      await shareTopScorersToWhatsApp(state);
    } catch (err: any) {
      setFeedback({
        message: `Erro ao compartilhar artilharia: ${err.message}`,
        isError: true
      });
    }
  };

  const handleShareSuspensions = async () => {
    try {
      setFeedback({
        message: 'Abrindo WhatsApp para enviar o quadro de suspensões...',
        isError: false
      });
      await shareSuspensionsToWhatsApp(state);
    } catch (err: any) {
      setFeedback({
        message: `Erro ao compartilhar suspensões: ${err.message}`,
        isError: true
      });
    }
  };

  const handleDownloadBackup = async () => {
    try {
      setFeedback({
        message: 'Preparando arquivo de backup...',
        isError: false
      });
      const result = await saveTournamentBackupFile(state);
      setFeedback({
        message: result.message,
        isError: !result.success
      });
    } catch (err: any) {
      setFeedback({ message: `Erro ao exportar backup: ${err.message}`, isError: true });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const res = importTournamentBackup(content);
      if (res.success && res.state) {
        onRestoreState(res.state);
        setFeedback({ message: 'Backup restaurado com 100% de sucesso!', isError: false });
      } else {
        setFeedback({ message: res.error || 'Falha ao restaurar arquivo.', isError: true });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    if (window.confirm('Atenção: Deseja realmente resetar todos os placares e dados para o início do torneio?')) {
      onResetState();
      setFeedback({ message: 'Torneio resetado para os valores padrões iniciais.', isError: false });
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Título da Seção */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">📁</span>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight font-['Outfit',sans-serif]">
            Exportação & Relatórios
          </h2>
        </div>
        <span className="text-xs text-[#8B9BB4] font-medium">
          PDF • WhatsApp • JSON
        </span>
      </div>

      {/* Banner / Feedback */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs transition ${
            feedback.isError
              ? 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
              : 'bg-[#00D26A]/15 border-[#00D26A]/40 text-[#00D26A]'
          }`}
        >
          {feedback.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00D26A]" />
          )}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* Card 1: Relatório Completo em PDF */}
      <div className="bg-[#121D2F] border border-[#1E2D44] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#00D26A]/15 border border-[#00D26A]/30 flex items-center justify-center text-[#00D26A]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-['Outfit',sans-serif]">Relatório Completo em PDF</h2>
            <p className="text-xs text-[#8B9BB4]">
              Gera documento oficial A4 de 2 páginas com Classificação, Chaveamento, Artilharia e Relatório Disciplinar.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadPdf}
          className="w-full py-3.5 px-4 rounded-xl bg-[#00D26A] hover:bg-[#00B85C] active:scale-[0.99] font-black text-xs text-[#0B1320] flex items-center justify-center gap-2 shadow-lg shadow-[#00D26A]/20 transition"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          Baixar Relatório Oficial (PDF)
        </button>
      </div>

      {/* Card 2: Compartilhamento Modular no WhatsApp */}
      <div className="bg-[#121D2F] border border-[#1E2D44] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center text-[#25D366]">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-['Outfit',sans-serif]">Compartilhar no WhatsApp</h2>
            <p className="text-xs text-[#8B9BB4]">
              Envie comunicados rápidos e segmentados diretamente para jogadores e grupos:
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {/* Opção 1: Classificação & Mata-Mata */}
          <button
            onClick={handleShareClassification}
            className="w-full py-2.5 px-3.5 rounded-xl bg-[#1A2538] hover:bg-[#22314A] active:scale-[0.99] font-bold text-xs text-white flex items-center justify-between border border-[#22314A] transition"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#F59E0B]" />
              <span>Classificação & Mata-Mata</span>
            </div>
            <span className="text-[10px] text-[#25D366] font-semibold flex items-center gap-1">
              Enviar <MessageCircle className="w-3 h-3" />
            </span>
          </button>

          {/* Opção 2: Artilharia Oficial */}
          <button
            onClick={handleShareTopScorers}
            className="w-full py-2.5 px-3.5 rounded-xl bg-[#1A2538] hover:bg-[#22314A] active:scale-[0.99] font-bold text-xs text-white flex items-center justify-between border border-[#22314A] transition"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">⚽</span>
              <span>Artilharia Oficial</span>
            </div>
            <span className="text-[10px] text-[#25D366] font-semibold flex items-center gap-1">
              Enviar <MessageCircle className="w-3 h-3" />
            </span>
          </button>

          {/* Opção 3: Quadro de Suspensões */}
          <button
            onClick={handleShareSuspensions}
            className="w-full py-2.5 px-3.5 rounded-xl bg-[#1A2538] hover:bg-[#22314A] active:scale-[0.99] font-bold text-xs text-white flex items-center justify-between border border-[#22314A] transition"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#EF4444]" />
              <span>Quadro de Suspensões por Rodada</span>
            </div>
            <span className="text-[10px] text-[#25D366] font-semibold flex items-center gap-1">
              Enviar <MessageCircle className="w-3 h-3" />
            </span>
          </button>
        </div>
      </div>

      {/* Card 3: Backup JSON */}
      <div className="bg-[#121D2F] border border-[#1E2D44] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8]">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-['Outfit',sans-serif]">Backup e Sincronização</h2>
            <p className="text-xs text-[#8B9BB4]">
              Exporte todos os dados para transferir ou restaurar em outro aparelho celular.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleDownloadBackup}
            className="py-2.5 px-3 rounded-xl bg-[#1A2538] hover:bg-[#22314A] active:scale-[0.99] font-bold text-xs text-white flex items-center justify-center gap-1.5 border border-[#22314A] transition"
          >
            <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
            Baixar Backup (.json)
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 rounded-xl bg-[#1A2538] hover:bg-[#22314A] active:scale-[0.99] font-bold text-xs text-white flex items-center justify-center gap-1.5 border border-[#22314A] transition"
          >
            <Upload className="w-3.5 h-3.5 text-[#00D26A]" />
            Restaurar Backup
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Card 4: Zona de Perigo / Reset */}
      <div className="bg-[#121D2F]/70 border border-[#EF4444]/30 rounded-2xl p-4 space-y-2">
        <div className="flex items-center space-x-2 text-[#EF4444]">
          <RotateCcw className="w-4 h-4" />
          <h2 className="text-xs font-bold uppercase tracking-wider font-['Outfit',sans-serif]">Reiniciar Dados do Torneio</h2>
        </div>
        <p className="text-[11px] text-[#8B9BB4]">
          Limpa todos os placares preenchidos e redefine as partidas para o estado inicial da tabela oficial.
        </p>
        <button
          onClick={handleReset}
          className="mt-2 py-2 px-3 rounded-xl border border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/10 font-bold text-xs transition"
        >
          Resetar Torneio
        </button>
      </div>
    </div>
  );
};
