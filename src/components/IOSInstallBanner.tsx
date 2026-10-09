import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Smartphone, CheckCircle2 } from 'lucide-react';

export const IOSInstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detecta se é dispositivo iOS (iPhone, iPad, iPod)
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // Detecta se já está rodando em modo standalone (PWA instalado)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;

    // Verifica se o usuário já dispensou o aviso nesta sessão
    const dismissed = sessionStorage.getItem('rockgol_ios_banner_dismissed');

    if (isIOSDevice && !isStandalone && !dismissed) {
      setShowBanner(true);
    }
  }, []);

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('rockgol_ios_banner_dismissed', 'true');
  };

  return (
    <>
      {/* Banner Superior Discreto */}
      {showBanner && (
        <div className="bg-gradient-to-r from-[#122238] via-[#162740] to-[#122238] border-b border-[#00D26A]/30 px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-200 shadow-md">
          <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-2">
            <span className="p-1.5 rounded-lg bg-[#00D26A]/10 border border-[#00D26A]/30 text-[#00D26A] flex-shrink-0">
              <Smartphone className="w-4 h-4" />
            </span>
            <div className="truncate">
              <span className="font-bold text-white">Usando no iPhone? </span>
              <span className="text-slate-300">Instale na Tela de Início para usar 100% offline.</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="px-2.5 py-1 rounded-lg bg-[#00D26A] hover:bg-[#00B85C] active:scale-95 text-slate-950 font-bold text-[11px] transition shadow-sm"
            >
              Como Instalar
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 text-slate-400 hover:text-white transition"
              title="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Passo a Passo de Instalação no iOS */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121D2F] border border-[#2A3E5E] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            {/* Cabeçalho do Modal */}
            <div className="px-4 py-3 bg-[#0B1320] border-b border-[#1E2D44] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#00D26A]" />
                <h3 className="font-bold text-white text-sm font-['Outfit',sans-serif]">
                  Instalação no iPhone (PWA)
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white transition rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo do Tutorial */}
            <div className="p-4 space-y-3.5 text-xs text-slate-300">
              <p className="text-slate-300 leading-relaxed">
                Para ter a experiência completa de aplicativo nativo, <strong className="text-white">100% offline</strong> e sem custos no iOS, siga estes 3 passos:
              </p>

              {/* Passo 1 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#0B1320] border border-[#1E2D44]">
                <div className="w-6 h-6 rounded-full bg-[#00D26A]/20 text-[#00D26A] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-white">Toque no botão Compartilhar</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                    Na barra inferior do Safari, clique no ícone <Share className="w-3.5 h-3.5 inline text-[#38BDF8]" /> (quadrado com seta para cima).
                  </p>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#0B1320] border border-[#1E2D44]">
                <div className="w-6 h-6 rounded-full bg-[#00D26A]/20 text-[#00D26A] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-white">Adicionar à Tela de Início</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                    Role a lista para baixo e toque em <PlusSquare className="w-3.5 h-3.5 inline text-[#00D26A]" /> <strong>"Adicionar à Tela de Início"</strong>.
                  </p>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#0B1320] border border-[#1E2D44]">
                <div className="w-6 h-6 rounded-full bg-[#00D26A]/20 text-[#00D26A] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-white">Confirme em "Adicionar"</p>
                  <p className="text-[11px] text-slate-400">
                    Toque em "Adicionar" no canto superior direito. O ícone do RockGol aparecerá junto com seus outros apps!
                  </p>
                </div>
              </div>

              {/* Vantagens */}
              <div className="p-2.5 rounded-xl bg-[#00D26A]/10 border border-[#00D26A]/20 text-[#00D26A] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span className="text-[11px] leading-tight">
                  Após adicionar, o app roda em tela cheia, grava tudo localmente e funciona sem nenhuma conexão de internet!
                </span>
              </div>
            </div>

            {/* Rodapé com Botão Entendi */}
            <div className="p-3 bg-[#0B1320] border-t border-[#1E2D44]">
              <button
                onClick={() => {
                  setShowModal(false);
                  handleDismiss();
                }}
                className="w-full py-2 rounded-xl bg-[#00D26A] hover:bg-[#00B85C] active:scale-95 text-slate-950 font-bold text-xs transition shadow-sm"
              >
                Entendi, vamos lá!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
