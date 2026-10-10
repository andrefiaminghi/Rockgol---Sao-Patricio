import React, { useState } from 'react';
import { Download, AlertCircle, CheckCircle2, MessageCircle, FileText, Trophy, ShieldAlert, RotateCcw, Info, Sparkles } from 'lucide-react';
import { TournamentState } from '../types/tournament';
import {
  generateAndDownloadTournamentPdf,
  shareClassificationToWhatsApp,
  shareTopScorersToWhatsApp,
  shareSuspensionsToWhatsApp
} from '../services/pdfExportService';

interface ExportTabProps {
  state: TournamentState;
  onRestoreState?: (state: TournamentState) => void;
  onResetState?: () => void;
}

export const ExportTab: React.FC<ExportTabProps> = ({ state, onResetState }) => {
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

  const handleReset = () => {
    if (onResetState && window.confirm('Atenção: Deseja realmente resetar todos os placares e dados para o início do torneio?')) {
      onResetState();
      setFeedback({ message: 'Torneio resetado para os valores padrões iniciais.', isError: false });
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Título da Seção */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-[#00D26A]" />
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight font-['Outfit',sans-serif]">
            Informações Gerais
          </h2>
        </div>
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

      {/* Card 3: Reiniciar Dados do Torneio (Apenas se configurado) */}
      {onResetState && (
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
      )}

      {/* Último Bloco: Desenvolvido por AFR Soluções */}
      <div className="bg-[#121D2F] border border-[#1E2D44] rounded-2xl p-4 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00D26A]/15 border border-[#00D26A]/30 flex items-center justify-center text-[#00D26A]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#8B9BB4] font-['Outfit',sans-serif]">
              Tecnologia & Inovação
            </p>
            <h3 className="text-sm font-bold text-white tracking-tight font-['Outfit',sans-serif]">
              Desenvolvido por AFR Soluções
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#00D26A]/10 border border-[#00D26A]/30 text-[#00D26A] text-[10px] font-black tracking-wider uppercase">
          Versão 2026
        </div>
      </div>
    </div>
  );
};
