import React, { useRef, useState } from 'react';
import { FileText, Download, Upload, RotateCcw, CheckCircle2, AlertCircle, X, MessageCircle } from 'lucide-react';
import { TournamentState } from '../types/tournament';
import { exportTournamentBackup, importTournamentBackup } from '../services/backupService';
import { generateAndDownloadTournamentPdf, shareReportToWhatsApp } from '../services/pdfExportService';

interface ExportTabProps {
  state: TournamentState;
  onRestoreState: (state: TournamentState) => void;
  onResetState: () => void;
}

export const ExportTab: React.FC<ExportTabProps> = ({ state, onRestoreState, onResetState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [shareDialog, setShareDialog] = useState<{ isOpen: boolean; summary: string; filename: string } | null>(null);

  const handleDownloadBackup = () => {
    try {
      const json = exportTournamentBackup(state);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rockgol_2026_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setFeedback({ message: 'Backup JSON baixado no aparelho com sucesso!', isError: false });
    } catch (err: any) {
      setFeedback({ message: `Erro ao baixar backup: ${err.message}`, isError: true });
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

  const handleGeneratePdf = () => {
    try {
      // 1. Gera o PDF em memória e dispara o download direto no celular
      const result = generateAndDownloadTournamentPdf(state);

      setFeedback({
        message: `PDF salvo como "${result.filename}" na pasta de Downloads!`,
        isError: false
      });

      // 2. Pergunta ao usuário se ele deseja compartilhar por WhatsApp
      setShareDialog({
        isOpen: true,
        summary: result.shareSummary,
        filename: result.filename
      });
    } catch (err: any) {
      setFeedback({
        message: `Erro ao gerar PDF: ${err.message}`,
        isError: true
      });
    }
  };

  const handleConfirmWhatsAppShare = async () => {
    if (!shareDialog) return;
    await shareReportToWhatsApp(shareDialog.summary);
    setShareDialog(null);
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
            Exportação & Backup
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

      {/* Card 1: Relatório em PDF Direto no Aparelho */}
      <div className="bg-[#121D2F] border border-[#1E2D44] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#00D26A]/15 border border-[#00D26A]/30 flex items-center justify-center text-[#00D26A]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-['Outfit',sans-serif]">Exportar Relatório em PDF</h2>
            <p className="text-xs text-[#8B9BB4]">
              Baixa o arquivo PDF diretamente no seu celular e permite compartilhar no WhatsApp.
            </p>
          </div>
        </div>

        <button
          onClick={handleGeneratePdf}
          className="w-full py-3 px-4 rounded-xl bg-[#00D26A] hover:bg-[#00B85C] active:scale-[0.99] font-black text-xs text-[#0B1320] flex items-center justify-center gap-2 shadow-lg shadow-[#00D26A]/20 transition"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          Baixar PDF no Celular & Compartilhar
        </button>
      </div>

      {/* Card 2: Backup JSON */}
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

      {/* Card 3: Zona de Perigo / Reset */}
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

      {/* Modal / Diálogo: Perguntar se deseja Compartilhar no WhatsApp */}
      {shareDialog && shareDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121D2F] border border-[#1E2D44] rounded-2xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#00D26A]/15 border border-[#00D26A]/30 flex items-center justify-center text-[#00D26A]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-['Outfit',sans-serif]">PDF Baixado com Sucesso!</h3>
                  <p className="text-[11px] text-[#8B9BB4]">{shareDialog.filename}</p>
                </div>
              </div>
              <button
                onClick={() => setShareDialog(null)}
                className="w-7 h-7 rounded-lg bg-[#1A2538] text-[#8B9BB4] hover:text-white flex items-center justify-center border border-[#22314A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/90 leading-relaxed bg-[#0E1726] p-3 rounded-xl border border-[#1E2D44]">
              O documento PDF foi salvo na memória do seu aparelho. Deseja compartilhar os resultados e a tabela com os grupos pelo <strong>WhatsApp</strong>?
            </p>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleConfirmWhatsAppShare}
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] active:scale-[0.99] font-black text-xs text-[#0B1320] flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition"
              >
                <MessageCircle className="w-4 h-4 stroke-[2.5]" />
                Sim, Compartilhar no WhatsApp
              </button>

              <button
                onClick={() => setShareDialog(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1A2538] hover:bg-[#22314A] font-bold text-xs text-[#8B9BB4] hover:text-white border border-[#22314A] transition"
              >
                Concluir (Apenas Manter no Celular)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
