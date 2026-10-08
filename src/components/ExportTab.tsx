import React, { useRef, useState } from 'react';
import { FileText, Download, Upload, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { TournamentState } from '../types/tournament';
import { exportTournamentBackup, importTournamentBackup } from '../services/backupService';
import { openPrintReport } from '../services/pdfExportService';

interface ExportTabProps {
  state: TournamentState;
  onRestoreState: (state: TournamentState) => void;
  onResetState: () => void;
}

export const ExportTab: React.FC<ExportTabProps> = ({ state, onRestoreState, onResetState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);

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
      setFeedback({ message: 'Backup JSON baixado com sucesso!', isError: false });
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

  const handlePrintPdf = () => {
    openPrintReport(state);
    setFeedback({ message: 'Janela de impressão/PDF aberta.', isError: false });
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
          PDF • JSON • Restauração
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

      {/* Card 1: Relatório em PDF */}
      <div className="bg-[#121D2F] border border-[#1E2D44] rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#00D26A]/15 border border-[#00D26A]/30 flex items-center justify-center text-[#00D26A]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-['Outfit',sans-serif]">Exportar Relatório em PDF</h2>
            <p className="text-xs text-[#8B9BB4]">
              Gera documento formatado com logotipo oficial, tabela completa e confrontos finais.
            </p>
          </div>
        </div>

        <button
          onClick={handlePrintPdf}
          className="w-full py-3 px-4 rounded-xl bg-[#00D26A] hover:bg-[#00B85C] active:scale-[0.99] font-black text-xs text-[#0B1320] flex items-center justify-center gap-2 shadow-lg shadow-[#00D26A]/20 transition"
        >
          <FileText className="w-4 h-4 stroke-[2.5]" />
          Visualizar & Salvar em PDF
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
              Exporte todos os placares e elencos para transferir ou restaurar em outro aparelho celular.
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
    </div>
  );
};
