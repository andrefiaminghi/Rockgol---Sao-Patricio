---
last_updated: "2026-10-09T19:20:00-03:00"
project: "Rockgol - São Patrício"
---

# Histórico de Sessões — Rockgol - São Patrício

## [2026-10-09] Elevação do Footer e Respiro Seguro contra Botões Virtuais do Celular
- **Objetivo da Sessão:** Solucionar o problema onde o footer ficava escondido embaixo dos botões do celular (barra de navegação virtual Android / gestos iOS), impossibilitando o acesso e toque nas 6 abas.
- **Vínculo ao Plano:** Plan `plan-2026-10-09-007` (Tasks 1 a 3), Critérios AC-012 e AC-014 em `.afr/features/rockgol-torneio-app.md` e Registro de Bugfix DIV-09 em `.afr/context/known-fixes.md`.
- **Atividades Realizadas:**
  - **Diagnóstico da Causa Raiz:** A variável `env(safe-area-inset-bottom)` retorna `0px` na maioria dos navegadores Android, anulando fallbacks e colando o footer na borda inferior da tela, exatamente sob os botões nativos `Voltar`, `Início` e `Recentes`.
  - **Estilização e Respiro Ergonômico (`src/index.css` e `src/components/Navigation.tsx`):**
    - Criada a classe utilitária `.pb-safe-nav` com padding calculado `calc(env(safe-area-inset-bottom, 0px) + 2rem)`, garantindo pelo menos 32px de folga na base em qualquer aparelho.
    - O `<nav>` foi atualizado para utilizar `pb-safe-nav` com `pt-2 pb-1`, elevando as abas e deixando-as 100% visíveis e com área de toque confortável.
  - **Ajuste de Rolagem no Container Central (`src/App.tsx`):**
    - Aumentado o padding inferior do `<main>` para `pb-16` para folga total sobre o rodapé elevado.
  - **Testes Automatizados:**
    - Atualizado [`tests/unit/appShellLayout.test.ts`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/appShellLayout.test.ts) validando a presença de `pb-safe-nav`.
    - Suíte completa com 109/109 testes passando no Vitest (`npm test`).
    - Build de produção (`npm run build`) validado com sucesso.

## [2026-10-09] Header e Footer Estáticos no Topo e Base (App Shell Fixo)
- **Objetivo da Sessão:** Atender à solicitação do usuário para que o Header permaneça 100% estático no topo da tela e o Footer com as 6 abas permaneça 100% estático no rodapé da tela, sem nenhum deslocamento vertical ao rolar, em qualquer aba acessada e em ambos os PWAs (Torcida e Árbitro).
- **Vínculo ao Plano:** Plan `plan-2026-10-09-006` (Tasks 1 a 3) e Critérios AC-011 a AC-014 em `.afr/features/rockgol-torneio-app.md`.
- **Atividades Realizadas:**
  - **Refatoração da Arquitetura do App Shell (`src/App.tsx`):**
    - `AppContent`: configurado com `h-full max-h-full overflow-hidden flex flex-col relative`, contendo estritamente os limites visuais da tela.
    - `<main>`: configurado como o único container rolável vertical (`flex-1 w-full overflow-y-auto overscroll-contain px-3.5 pt-3.5 pb-8`), permitindo rolagem fluida e independente em todas as 6 abas (`Jogos`, `Times`, `Classificação`, `Mata-Mata`, `Súmula`, `Exportar`).
    - Viewport móvel e simulador desktop ajustados com `h-screen h-[100dvh]` e `overflow-hidden`, eliminando rolagem dupla da janela global.
  - **Componentes de Topo e Rodapé (`Header.tsx` e `Navigation.tsx`):**
    - `Header`: fixado no topo com `shrink-0 z-30 pt-safe`, mantendo o logotipo, título e botão sincronizar sempre visíveis.
    - `Navigation`: fixado no rodapé com `shrink-0 z-40 pb-safe`, mantendo as 6 abas permanentemente visíveis e clicáveis em qualquer momento da rolagem.
  - **Testes Automatizados:**
    - Criada a suíte [`tests/unit/appShellLayout.test.ts`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/appShellLayout.test.ts) cobrindo as classes estruturais de ancoragem e rolagem com ciclo TDD completo (RED -> GREEN).
    - Suíte completa com 109/109 testes passando no Vitest (`npm test`).
    - Compilação de produção (`npm run build`) validada sem erros.

## [2026-10-09] Protocolo de Hard Reset no Sincronismo Supabase e Proteção de PIN
- **Objetivo da Sessão:** Implementar a solução definitiva via TDD para o erro de sincronismo onde súmulas limpas eram restauradas ou novas súmulas eram sobrepostas ao sincronizar no celular. A cada sincronismo bem-sucedido, o aplicativo executa um Hard Reset no estado do torneio, reconstruindo os 21 jogos e o mata-mata a partir do zero com base estrita no Supabase.
- **Vínculo ao Plano:** Plan `plan-2026-10-09-005` (Tasks 1 e 2)
- **Atividades Realizadas:**
  - **Função Pura `applyHardResetFromRemote` (`src/services/scoresheetService.ts`):**
    - Descarte de qualquer súmula local não presente no Supabase.
    - Reset incondicional para `homeScore: null, awayScore: null, status: 'PENDING'` de todas as partidas sem súmula no servidor.
    - Aplicação limpa de gols e cartões apenas para partidas com súmula oficial.
    - Preservação da lista e nomes dos times locais ou atualização se o servidor fornecer.
    - Recálculo reativo da classificação geral e chaveamento de mata-mata.
  - **Integração no `App.tsx` (`handleSync`):**
    - Substituição da montagem manual pela chamada limpa `applyHardResetFromRemote(prev, remoteData)`.
    - Persistência imediata via `saveTournamentState`.
    - Preservação incondicional da chave de autenticação do árbitro (`rockgol_judge_pin_auth`) no `localStorage`.
    - Contingência offline: se `pullTournamentFromSupabase` falhar ou perder conexão, nenhum dado local é descartado.
  - **Testes Automatizados:**
    - Criado [`tests/unit/hardResetSync.test.ts`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/hardResetSync.test.ts) com 3 testes unitários cobrindo descarte de súmulas órfãs, aplicação de súmulas ativas e atualização de elencos.
    - Atualizado [`tests/unit/headerSync.test.ts`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/headerSync.test.ts) validando invariantes INV-03 (PIN intacto) e INV-04 (contingência offline).
    - 105/105 testes passando com 100% de cobertura e build de produção validado (`npm run build`).

## [2026-10-09] Diagnóstico e Resolução de Cache do Service Worker (PWA) e Sincronismo Supabase
- **Objetivo da Sessão:** Investigar e solucionar o problema reportado onde:
  1. Ao excluir uma súmula no celular, ao tocar em "Sincronizar", o sistema recarregava novamente os dados da súmula limpa/removida.
  2. Ao registrar uma nova súmula e sincronizar, a nova súmula era sobreposta pelos dados antigos.
- **Vínculo à Task / Bugfix:** DIV-08 (Supabase / PWA Cache & Sync Integrity)
- **Diagnóstico da Causa Raiz:**
  - O Service Worker (`public/sw.js`) aplicava a estratégia Cache-First a todas as requisições GET HTTP indiscriminadamente. As chamadas REST da API do Supabase (`https://*.supabase.co/rest/v1/scoresheets?select=*`) foram interceptadas e guardadas em cache no primeiro pull. Nas sincronizações subsequentes, o Service Worker devolvia sempre o snapshot congelado do Cache Storage, ignorando alterações remotas no banco.
  - O modal de súmula fechava imediatamente sem esperar o `push` ou `delete` no Supabase concluir na rede móvel, gerando concorrência com o botão "Sincronizar".
  - Ausência de headers `Cache-Control: no-cache, no-store` no cliente Supabase contra cache HTTP nativo do Safari/Chrome.
- **Atividades Realizadas:**
  - **Service Worker (`public/sw.js`):**
    - Adicionada regra explícita de bypass para a API do Supabase (`event.request.url.includes('supabase.co')`), garantindo que o banco de dados trafegue sempre direto pela rede do navegador.
    - Versão do cache elevada para `rockgol-cache-v5` para expurgar automaticamente os caches antigos.
  - **Cliente Supabase (`src/services/supabaseService.ts`):**
    - Configurados headers `Cache-Control: no-cache, no-store, must-revalidate` e `Pragma: no-cache` na instância do `@supabase/supabase-js`.
  - **Modal de Súmula (`src/components/ScoresheetModal.tsx`):**
    - Adicionado estado `isSubmitting` com `Loader2` animado ("Salvando no banco...", "Excluindo do banco..."), mantendo os botões desabilitados até a confirmação de rede antes de fechar o modal.
  - **Aplicação Principal (`src/App.tsx` e `src/components/ScoresheetTab.tsx`):**
    - Validação de segurança em `handleSync`: se `remoteData.success` for falso, aborta imediatamente com toast de erro de conexão em vez de resetar placares locais com objeto vazio.
    - Callbacks assíncronos integrados e propagados para a interface da aba Súmula.
  - **Testes Automatizados:**
    - Atualizado [`tests/unit/pwaSetup.test.ts`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/pwaSetup.test.ts) validando a versão `rockgol-cache-v5` e o bypass de `supabase.co`.
    - 100/100 testes passando (`npm test`) e build de produção (`npm run build`) validado.
  - **Registro de Known Fixes:**
    - Registrado item `DIV-08` em [`.afr/context/known-fixes.md`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/.afr/context/known-fixes.md).

## [2026-10-09] Exclusão de Súmula no Supabase e Trava de Limpeza da Fase de Grupos vs Mata-Mata
- **Objetivo da Sessão:** Atender à solicitação de:
  1. Ao limpar um registro de partida na súmula, excluir o registro correspondente do banco de dados Supabase (`deleteScoresheetFromSupabase`), além de zerar os placares locais na súmula e na aba Jogos.
  2. Ao registrar qualquer súmula na fase mata-mata (`sf1`, `sf2`, `third_place`, `final`), bloquear rigorosamente a limpeza de registros das rodadas R1 ao R11 (fase de grupos). Só permitir limpar R1 a R11 se não houver registros de súmula ativos no mata-mata.
- **Vínculo ao Plano:** Plan `plan-2026-10-09-004` (Tasks 1 a 3)
- **Atividades Realizadas:**
  - **Serviço de Súmula (`scoresheetService.ts`):**
    - Implementada função determinística `canDeleteScoresheet(matchId, scoresheets)` que verifica se a partida pertence ao mata-mata (sempre liberada) ou à fase de grupos (bloqueada se `hasKnockoutScoresheets` for true).
    - Integrada a trava de proteção em `removeScoresheetAndResetMatch`, impedindo qualquer mutação de estado se a regra for violada.
  - **Interface da Súmula (`ScoresheetTab.tsx`):**
    - Adicionado banner de alerta no topo da listagem de rodadas de grupos (R1 ao R11) quando houver partidas do mata-mata registradas (`🔒 Súmulas da Fase de Grupos Bloqueadas para Limpeza`).
    - Botão "Limpar" nos cards da fase de grupos estilizado como "Bloqueado" com estilo desabilitado e tooltip explicativo quando o mata-mata estiver em andamento.
    - Atualizada a mensagem de confirmação para informar que o registro será excluído do banco de dados.
  - **Integração Principal (`App.tsx` e `ScoresheetModal.tsx`):**
    - `handleDeleteScoresheet` e `handleSaveScoresheet` atualizados para chamadas assíncronas incondicionais ao Supabase com `await` e feedback imediato via Toast.
    - Integrada a trava de exclusão dentro de `ScoresheetModal.tsx`: o botão "Limpar Súmula" no rodapé do modal agora é desabilitado visualmente com badge "Bloqueado" e tooltip explicativo quando `canDelete` for falso (há mata-mata ativo).
    - Service Worker atualizado para `rockgol-cache-v4` garantindo invalidação de cache e entrega imediata do bundle novo em dispositivos móveis.
  - **Testes Automatizados:**
    - [`tests/unit/scoresheetService.test.ts`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/scoresheetService.test.ts): 6 novos testes cobrindo todas as variações de bloqueio e liberação.
    - [`tests/unit/scoresheetTab.test.ts`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/scoresheetTab.test.ts): testes de conformidade de props e renderização.
    - [`tests/unit/scoresheetIntegration.test.ts`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/scoresheetIntegration.test.ts): teste de ponta a ponta validando o bloqueio de R1-R11, liberação do mata-mata e posterior liberação de R1-R11 após esvaziamento.
  - **Verificação:** 100/100 testes aprovados no Vitest (`npm test`) e compilação de produção (`npm run build`) validada sem erros.

## [2026-10-09] Reset de Placares Manuais na Sincronização (Preservando Somente Dados do Servidor)
- **Objetivo da Sessão:** Atender à solicitação de que, ao sincronizar o aplicativo (Supabase), qualquer placar preenchido manualmente ou simulado localmente na aba Jogos seja resetado, mantendo estritamente os placares com súmula oficial registrada no servidor.
- **Vínculo à Task:** FEAT-2026-10-005 (Integridade e Sincronismo Fidedigno de Dados)
- **Atividades Realizadas:**
  - **Serviço de Súmula (`scoresheetService.ts`):**
    - Adicionado suporte ao parâmetro booleano `resetUnscheduledMatches = false` em `syncMatchScoresFromScoresheets`.
    - Quando ativado, qualquer partida que não possua súmula oficial no servidor é resetada para `homeScore: null, awayScore: null, status: 'PENDING'`.
    - No mata-mata, partidas sem súmula também têm placares, penalidades e vencedores zerados.
  - **Fluxo de Sincronização (`App.tsx`):**
    - Ao disparar `handleSync()`, a sincronização passa `resetUnscheduledMatches: true`.
    - A classificação oficial é recalculada com base exclusivamente nas partidas sincronizadas.
    - O chaveamento de mata-mata é atualizado: se a fase de grupos oficial do servidor ainda não estiver concluída, os confrontos de semifinal e final retornam para o estado pendente/a definir.
  - **Testes Automatizados:** Adicionado teste unitário em [`tests/unit/scoresheetService.test.ts`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/scoresheetService.test.ts) comprovando que partidas simuladas sem súmula são zeradas e partidas oficiais são preservadas.
  - **Verificação:** 92/92 testes aprovados no Vitest (`npm test`) e compilação de produção (`npm run build`) validada sem erros.

## [2026-10-09] Separação Bilateral de Gols e Cartões por Equipe nos Cards da Súmula
- **Objetivo da Sessão:** Atender à solicitação de exibir os gols e cartões da súmula separados por equipe nos cards de partida da aba Súmula, dividindo a área inferior em duas colunas correspondentes às equipes do placar (lado esquerdo para o time mandante/esquerda e lado direito para o time visitante/direita).
- **Vínculo à Task:** FEAT-2026-10-004 (UX e Layout Bilateral da Súmula)
- **Atividades Realizadas:**
  - **Componente `ScoresheetTab.tsx`:**
    - Substituída a listagem única de eventos por um grid de 2 colunas com divisor sutil (`divide-x divide-[#2F343C]/60`).
    - Lado Esquerdo: lista gols e cartões do mandante (`teamId === m.homeTeamId`), alinhados à esquerda.
    - Lado Direito: lista gols e cartões do visitante (`teamId === m.awayTeamId`), alinhados à direita e espelhados.
    - Observações mantidas centralizadas abaixo das duas colunas.
    - Caso não haja gols/cartões, exibe indicação discreta de partida sem eventos.
  - **Testes Automatizados:** Atualizado [`tests/unit/scoresheetTab.test.ts`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/scoresheetTab.test.ts) validando a estrutura e os dados de eventos.
  - **Verificação:** 91/91 testes aprovados no Vitest (`npm test`) e compilação de produção (`npm run build`) validada sem erros.

## [2026-10-09] Execução TDD: Sincronismo Supabase e PWAs Independentes (Juiz e Torcida)
- **Objetivo da Sessão:** Executar integralmente o plano `plan-2026-10-09-003` (Tasks 001 a 005) com metodologia estrita TDD, integrando a persistência na nuvem com o Supabase e separando a aplicação em dois PWAs no mesmo repositório: PWA Juiz (`juiz.html`) e PWA Torcida (`index.html`).
- **Vínculo à Task:** FEAT-2026-10-003 (Sincronismo Supabase e PWAs Independentes)
- **Tasks Executadas e Commits:**
  1. **Task 001 (`9391226`):** `feat(sync): implementar servico de sincronizacao com supabase e fallback offline`
     - Instalado `@supabase/supabase-js`.
     - Implementado [`src/services/supabaseService.ts`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/services/supabaseService.ts) com client Supabase oficial (`ihegprwkrmybdrpgodnf`), métodos `pushScoresheetToSupabase`, `deleteScoresheetFromSupabase`, `pushTeamToSupabase` e `pullTournamentFromSupabase`.
     - Criada migration SQL PostgreSQL em [`supabase/migrations/20261009180000_create_rockgol_sync_tables.sql`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/supabase/migrations/20261009180000_create_rockgol_sync_tables.sql).
     - Testes unitários em [`tests/unit/supabaseService.test.ts`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/supabaseService.test.ts).
  2. **Task 002 (`c145739`):** `feat(pwa): configurar suporte multi-page para app torcida e app arbitro`
     - Configurado Vite multi-page em [`vite.config.ts`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/vite.config.ts) com entrypoints `index.html` e `juiz.html`.
     - Criados [`public/manifest-juiz.json`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/public/manifest-juiz.json), [`juiz.html`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/juiz.html) e [`src/juiz.tsx`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/juiz.tsx).
     - Service Worker [`public/sw.js`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/public/sw.js) atualizado com precache de `juiz.html` e `manifest-juiz.json`.
     - Testes em [`tests/unit/pwaSetup.test.ts`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/pwaSetup.test.ts).
  3. **Task 003 (`2116be2`):** `feat(auth): implementar tela de desbloqueio por pin para arbitragem`
     - Implementado [`src/components/JudgeAuthLock.tsx`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/components/JudgeAuthLock.tsx) com teclado touch numérico, validação do PIN padrão `2026` e persistência no `localStorage`.
     - Guarda de autenticação integrada em [`src/App.tsx`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/App.tsx).
     - Testes em [`tests/unit/judgeAuth.test.ts`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/judgeAuth.test.ts).
  4. **Task 004 (`76de9e3`):** `feat(permissions): aplicar restricoes de somente leitura para torcida e edicao para juizes`
     - Modo Torcida: `readOnly={true}` propagado para `<TeamsTab />` e `<ScoresheetTab />`, bloqueando edição de nomes e ocultando botões de preenchimento, edição e limpeza de súmula.
     - Modo Juiz: edição de elencos e preenchimento de súmula liberados com push assíncrono para o Supabase.
     - Testes em [`tests/unit/rolePermissions.test.ts`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/rolePermissions.test.ts).
  5. **Task 005 (`5d55e4e`):** `feat(header): adicionar botao de sincronizacao supabase e indicador de status de nuvem`
     - Atualizado [`src/components/Header.tsx`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/components/Header.tsx): Torcida recebe botão "Sincronizar" (sem botão Reiniciar); Juiz recebe indicador de status online/offline da nuvem e botão "Sincronizar".
     - Integrado `pullTournamentFromSupabase` em [`src/App.tsx`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/App.tsx) com mesclagem inteligente de súmulas, recálculo de classificação e toast feedback visual.
     - Testes em [`tests/unit/headerSync.test.ts`](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/headerSync.test.ts).
- **Evidências Finais:**
  - 90/90 testes unitários e de integração aprovados no Vitest (`npm test`).
  - Build de produção gerado com sucesso pelo Vite (`dist/index.html` e `dist/juiz.html`).
- **Objetivo da Sessão:** Atender à solicitação de brainstorming e avaliação da demanda documentada em `.afr/context/sinc.md`, gerando a branch de trabalho e a especificação técnica formal para integração com o Supabase e criação de dois PWAs independentes (Juiz e Torcida).
- **Vínculo à Task:** FEAT-2026-10-003 (Sincronismo Supabase e PWAs Independentes)
- **Atividades Realizadas:**
  - **Nova Branch:** Criada e ativada a branch `feat/sincronismo-supabase-pwa`, com atualização em [.afr/git-preferences.md](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/.afr/git-preferences.md).
  - **Brainstorming Estruturado:**
    - Alinhada a arquitetura multi-page no Vite com dois entrypoints: `index.html` (Torcida) e `juiz.html` (Árbitro protegido por PIN `2026`).
    - Definido modelo do Supabase com tabelas dedicadas `scoresheets` e `teams` com RLS anônimo e scripts SQL DDL prontos.
    - Definido mecanismo de sincronização do Juiz (envio automático ao salvar + botão no Header para pull e contingência offline).
    - Definido mecanismo da Torcida (somente leitura oficial, botão "Sincronizar" no Header no lugar do "Reiniciar", simulação de placares permitida apenas localmente em jogos sem súmula).
  - **Documento Canônico de Feature:** Especificação técnica formal criada e commitada em [.afr/features/sincronismo-supabase-pwa.md](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/.afr/features/sincronismo-supabase-pwa.md).

## [2026-10-09] Atualização da Estratégia de Cache do Service Worker (PWA) e GitHub Pages
- **Objetivo da Sessão:** Diagnosticar e solucionar o problema de não atualização do PWA no GitHub Pages, onde o navegador continuava exibindo versões em cache antigo.
- **Diagnóstico Técnico:**
  - O workflow `deploy.yml` do GitHub Actions executou com sucesso o build do commit mais recente (`cde0de2`), e os arquivos servidos no GitHub Pages já continham o bundle atualizado.
  - No entanto, o `public/sw.js` utilizava estratégia puramente Cache-First em todos os recursos (inclusive `index.html` e rota raiz `./`), associado a uma chave estática `rockgol-cache-v2`.
  - Como consequência do "Cache Lock", dispositivos com o PWA ou com navegações anteriores interceptavam a requisição de inicialização e retornavam indefinidamente o `index.html` antigo do cache local, impedindo o carregamento dos novos scripts.
- **Atividades Realizadas:**
  - **Estratégia Network-First para Documentos (`public/sw.js`):** Modificado o evento `fetch` para usar Network-First em requisições de navegação (`request.mode === 'navigate'`) e documentos HTML, com fallback transparente para o cache offline caso o dispositivo esteja sem conexão.
  - **Atualização da Versão de Cache:** Chave do cache incrementada para `rockgol-cache-v3`, garantindo limpeza imediata dos caches anteriores no evento `activate`.
  - **Auto-Atualização e Reload (`src/main.tsx`):** Adicionado `registration.update()` no carregamento e listener de `controllerchange` para recarregar a aplicação de forma limpa e imediata assim que um novo Service Worker for ativado.
  - **Verificação Completa:** 68/68 testes aprovados no Vitest (`npm test`) e compilação de produção (`npm run build`) validada sem erros.

## [2026-10-09] Bloqueio de Edição Manual de Placares na Aba Jogos Quando Súmula Estiver Registrada
- **Objetivo da Sessão:** Atender à solicitação de que, quando uma partida possuir súmula oficial preenchida, os campos de placar na aba Jogos fiquem estritamente bloqueados para edição manual, garantindo integridade dos dados registrados pela arbitragem.
- **Vínculo à Task:** FEAT-2026-10-002 (Governança e Integridade de Placares da Súmula)
- **Atividades Realizadas:**
  - **Interface da Aba Jogos (`MatchesTab`):**
    - Atualizada a prop `scoresheets` no componente [src/components/MatchesTab.tsx](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/components/MatchesTab.tsx).
    - Desabilitados os inputs de placar mandante e visitante (`disabled={hasScoresheet}`) com estilos visuais de bloqueio (`cursor-not-allowed`, fundo escurecido e borda suave).
    - Adicionado badge de identificação `🔒 Súmula Oficial` no cabeçalho do card da partida e aviso de bloqueio no rodapé `🔒 Placar vinculado à súmula (Edição bloqueada)`.
    - Guarda no `handleScoreChange` para abortar qualquer tentativa de alteração manual se a partida tiver súmula ativa.
  - **Camada de Estado Global (`App.tsx`):**
    - Passada a prop `scoresheets={state.scoresheets}` para `<MatchesTab />` em [src/App.tsx](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/App.tsx).
    - Adicionada trava de segurança no manipulador `handleUpdateMatchScore`: se `state.scoresheets[matchId]?.hasScoresheet` for verdadeiro, a mutação de placar manual é ignorada.
  - **Testes Automatizados:** Adicionado teste de integração em [tests/unit/scoresheetIntegration.test.ts](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/scoresheetIntegration.test.ts) validando que partidas com súmula preenchida bloqueiam edição e partidas sem súmula permanecem editáveis.
  - **Verificação Completa:** 68/68 testes aprovados no Vitest (`npm test`) e compilação de produção (`npm run build`) concluída com sucesso.

## [2026-10-09] Identificação de Fases Mata-Mata, Pênaltis na Súmula e Nomes de Jogadores na Artilharia
- **Objetivo da Sessão:** Atender a três demandas de UI/domínio na aba Súmula:
  1. Identificação explícita de fase nos cards de mata-mata ("Semifinal 1/2", "Disputa de 3º e 4º Lugar", "Grande Final");
  2. Exibição do placar de pênaltis nos cards de mata-mata da aba Súmula quando houver decisão por penalidades;
  3. Resolução dinâmica dos nomes dos jogadores na lista de Artilharia a partir dos nomes preenchidos na aba Times.
- **Vínculo à Task:** FEAT-2026-10-002 (Refinamento de UI/UX e Domínio da Súmula)
- **Atividades Realizadas:**
  - **Identificação de Fase no Card Mata-Mata:** Em [src/components/ScoresheetTab.tsx](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/components/ScoresheetTab.tsx), adicionados badges de destaque para "🏆 Grande Final", "🥉 Disputa de 3º e 4º Lugar" e "⚔️ Semifinal 1/2" com estilo visual dedicado.
  - **Exibição de Pênaltis:** Adicionada exibição tabular de penalidades `({pen} pen)` ao lado do nome dos times e banner centralizado de decisão por pênaltis no card de confronto de mata-mata na aba Súmula.
  - **Resolução Dinâmica de Nomes na Artilharia:** Atualizado `getTopScorers` em [src/services/scoresheetService.ts](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/services/scoresheetService.ts) para consultar dinamicamente `team.players[playerIndex]`, garantindo que nomes preenchidos na aba Times apareçam na Artilharia, no resumo de gols da partida e nas exportações.
  - **Testes Automatizados:** Adicionado teste unitário em [tests/unit/scoresheetService.test.ts](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/scoresheetService.test.ts) validando a resolução do nome do jogador cadastrado na aba Times.
  - **Verificação Completa:** 67/67 testes aprovados no Vitest (`npm test`) e build de produção (`npm run build`) executado com sucesso.

## [2026-10-09] Limpeza de Súmula e Zeramento Completo de Placares (Aba Súmula e Aba Jogos)
- **Objetivo da Sessão:** Atender à solicitação de que, ao limpar/remover uma súmula, os placares da partida correspondente sejam imediatamente zerados (voltando ao estado pendente `- × -`) tanto na lista de partidas da aba Súmula quanto nos campos da aba Jogos e na tabela de classificação/mata-mata.
- **Vínculo à Task:** FEAT-2026-10-002 (Limpeza de Súmula e Integridade de Estado)
- **Atividades Realizadas:**
  - **Função Pura de Domínio:** Criada a função `removeScoresheetAndResetMatch` em [src/services/scoresheetService.ts](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/services/scoresheetService.ts) que exclui a súmula, define `homeScore = null`, `awayScore = null`, `status = 'PENDING'` e re-sincroniza todas as dependências.
  - **Proteção do Chaveamento Mata-Mata:** Atualizado `updateFinalsFromSemifinals` em [src/services/knockoutService.ts](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/services/knockoutService.ts) para que, se a semifinal for limpa, a vaga na final ou 3º lugar volte para `null` ("A definir") e qualquer placar pendente nas finais seja zerado.
  - **Interface do Modal:** Atualizado [src/components/ScoresheetModal.tsx](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/components/ScoresheetModal.tsx) com botão explícito "Limpar Súmula" e alerta descritivo de confirmação.
  - **Ação Rápida no Card:** Adicionado botão de atalho "Limpar" no card da partida em [src/components/ScoresheetTab.tsx](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/components/ScoresheetTab.tsx) para permitir zerar súmulas registradas diretamente da lista.
  - **Testes Automatizados:** Adicionados 2 novos testes de integração em [tests/unit/scoresheetIntegration.test.ts](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/scoresheetIntegration.test.ts), validando que a limpeza da súmula na 1ª fase e nas semifinais zera placares e remove pontos/confrontos da tabela.
  - **Verificação Completa:** 66/66 testes aprovados no Vitest (`npm test`) e compilação de produção (`npm run build`) validada sem erros.

## [2026-10-09] Correção da Propagação de Semifinais da Súmula para Grande Final e 3º Lugar
- **Objetivo da Sessão:** Corrigir a falha em que o preenchimento da súmula das semifinais (`sf1` e `sf2`) não estava alimentando os times vencedores na Grande Final (`final`) e perdedores na Disputa de 3º Lugar (`third_place`).
- **Vínculo à Task:** FEAT-2026-10-002 (Integração e Propagação de Mata-Mata da Súmula)
- **Causa Raiz Identificada:**
  - `syncMatchScoresFromScoresheets` apenas atribuía `homeScore` e `awayScore` nas partidas eliminatórias, mas deixava `winnerTeamId` e `loserTeamId` indefinidos e o status como `PENDING`.
  - Como `updateFinalsFromSemifinals` exige `sf.status === 'FINISHED' && sf.winnerTeamId && sf.loserTeamId`, os confrontos da final e do 3º lugar nunca recebiam os times classificados.
  - Além disso, partidas eliminatórias terminadas em empate no tempo normal não possuíam campos nem validação de disputa de pênaltis na interface da súmula.
- **Atividades Realizadas:**
  - **TDD / Teste de Regressão:** Adicionados testes em [tests/unit/scoresheetIntegration.test.ts](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/scoresheetIntegration.test.ts) validando a propagação automática de vencedores/perdedores das semifinais para final e 3º lugar, além de teste cobrindo desempate por cobrança de pênaltis na súmula.
  - **Serviço de Sincronização:** Atualizado [src/services/scoresheetService.ts](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/services/scoresheetService.ts) para invocar `resolveKnockoutMatch` nas partidas com súmula ativa (definindo `winnerTeamId`, `loserTeamId`, `status: 'FINISHED'`) e chamar `updateFinalsFromSemifinals` centralizadamente ao final do fluxo.
  - **Interface do Modal:** Em [src/components/ScoresheetModal.tsx](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/components/ScoresheetModal.tsx), adicionada seção interativa de cobrança de pênaltis para jogos de mata-mata empatados no tempo normal, com validações obrigatórias para impedir empates nas penalidades.
  - **Desfazer / Limpeza de Súmula:** Ajustado `handleDeleteScoresheet` em [src/App.tsx](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/App.tsx) para redefinir a partida para pendente e re-sincronizar as finais sem quebrar o chaveamento.
  - **Verificações:** 64/64 testes unitários e de integração aprovados no Vitest; compilação de produção (`npm run build`) validada sem erros.
- **Decisões Tomadas:**
  - Centralizar a chamada de `updateFinalsFromSemifinals` diretamente no retorno de `syncMatchScoresFromScoresheets` para garantir consistência automática tanto ao salvar quanto ao deletar ou sincronizar súmulas.
  - Adicionar suporte completo a pênaltis nas súmulas eliminatórias (`homePenalties`, `awayPenalties`).

## [2026-10-09] Ajuste de Usabilidade Mobile: Distribuição das Rodadas da Súmula em Grade de 2 Linhas
- **Objetivo da Sessão:** Atender à solicitação de usabilidade do usuário para eliminar a necessidade de rolagem horizontal na seleção de rodadas na aba "Súmula", organizando os 12 seletores em duas linhas visíveis simultaneamente.
- **Vínculo à Task:** FEAT-2026-10-002 (Refinamento de UI/UX Mobile)
- **Atividades Realizadas:**
  - Substituição do contêiner `flex overflow-x-auto` por uma grade responsiva `grid grid-cols-6 gap-1.5 sm:gap-2` no [src/components/ScoresheetTab.tsx](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/components/ScoresheetTab.tsx).
  - Distribuição exata dos 12 seletores em 2 linhas:
    - Linha 1: R1, R2, R3, R4, R5, R6
    - Linha 2: R7, R8, R9, R10, R11, Mata-Mata
  - Execução e aprovação de 100% dos testes unitários (62/62 testes passando no Vitest).
  - Validação de compilação e build de produção (`npm run build`) sem erros.
  - Commit atômico realizado: `aea9841 fix(ui): distribuir seletores de rodada da sumula em 2 linhas sem scroll horizontal`.
- **Decisões Tomadas:**
  - Adotar `grid-cols-6` para que os 12 botões de rodada fiquem perfeitamente balanceados (6 em cada linha), acessíveis com toque direto sem deslizar horizontalmente.
- **Próximos Passos:**
  - Notificar o usuário que a alteração já está aplicada e ativa no ambiente local.

## [2026-10-09] Conclusão da Esteira TDD: Módulo Completo de Súmula, Artilharia, Disciplina e Exportações
- **Objetivo da Sessão:** Executar rigorosamente o ciclo TDD (Red-Green-Refactor) para implementar o módulo completo de Controle de Súmula para Árbitros e Juízes no aplicativo do RockGol São Patrício 2026, concluindo as 6 tarefas atômicas do plano `plan-2026-10-09-002`.
- **Vínculo à Task:** FEAT-2026-10-002 (`status: COMPLETED`), Plano `plan-2026-10-09-002` (`status: DONE`), Tasks `task-001` a `task-006` (`status: DONE`).
- **Atividades Realizadas:**
  - **Task 1 (Commit `829c97f`):** Tipagens em `src/types/tournament.ts` (`GoalEvent`, `CardEvent`, `MatchScoresheet`, `PlayerSuspension`, `TopScorer`, `TournamentState.scoresheets`) e suporte a fallback retrocompatível em `src/services/storageService.ts`.
  - **Task 2 (Commit `14f90de`):** Serviço de domínio puro `src/services/scoresheetService.ts` com sincronização condicional de placar (`syncMatchScoresFromScoresheets`), ranking decrescente de artilharia (`getTopScorers`), apuração de suspensões (`getSuspensions`: 2 amarelos acumulados em rodadas distintas, 2 amarelos no jogo e vermelho direto) e verificação de escalação (`isPlayerSuspended`).
  - **Task 3 (Commit `f9d87a8`):** Integração reativa no `src/App.tsx` com handlers `handleSaveScoresheet` e `handleDeleteScoresheet`, propagando automaticamente para a tabela da 1ª fase e persistência em `localStorage`.
  - **Task 4 (Commit `2be17f7`):** Componente mobile `src/components/ScoresheetModal.tsx` com seleção rápida de autores de gols, suporte a gol contra, lançamento de cartões com bloqueio visual de atletas suspensos e observações livres do árbitro.
  - **Task 5 (Commit `8d2a203`):** Aba dedicada `ScoresheetTab.tsx` no menu inferior `Navigation.tsx` (6 abas com ícone `ClipboardList`), com seletor de rodada, status das partidas, ranking de artilharia e quadro de suspensões integrado.
  - **Task 6 (Commit `6a5c7e3`):** Formatadores de WhatsApp modulares (`formatTopScorersForWhatsApp`, `formatSuspensionsForWhatsApp`, `shareTopScorersToWhatsApp`, `shareSuspensionsToWhatsApp`), adição da Página 2 no relatório consolidado em PDF oficial (`generateAndDownloadTournamentPdf`) e interface renovada em `ExportTab.tsx` com download de PDF e 3 ações diretas de WhatsApp.
  - **Garantia de Qualidade & Build:** 62 testes unitários aprovados com 100% de sucesso no Vitest (`npm test`) e compilação de produção (`tsc && vite build`) validada sem advertências de tipagem.
- **Decisões Tomadas:**
  - Dividir o relatório em PDF oficial em 2 páginas A4 elegantes para que a primeira mantenha a Classificação e Mata-Mata e a segunda concentre a Súmula Oficial, Artilharia, Suspensões e Observações da Arbitragem.
  - Oferecer na aba Exportar 3 botões dedicados de envio para WhatsApp, permitindo ao organizador enviar comunicados específicos sem poluição visual.
- **Próximos Passos:**
  - Apresentar a conclusão da feature ao usuário para validação e homologação.

## [2026-10-09] Formalização da Tríade Canônica AFR: Spec, Plano e Tarefas Atômicas da Súmula
- **Vínculo à Task:** FEAT-2026-10-002, Plano `plan-2026-10-09-002`, Tasks `task-001` a `task-006`.
- **Atividades Realizadas:**
  - Criação da especificação formal [.afr/features/controle-sumula-juizes.md](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/.afr/features/controle-sumula-juizes.md) com User Story, contratos de dados em código TypeScript, 5 invariantes numeradas (`INV-01` a `INV-05`), 5 critérios BDD estritos (`AC-001` a `AC-005`), casos negativos e exclusões de escopo.
  - Criação do plano de implementação detalhado [.afr/plans/plan-2026-10-09-002.md](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/.afr/plans/plan-2026-10-09-002.md) com granularidade de passos RED, GREEN e Commits frequentes.
  - Decomposição em 6 tarefas atômicas estritas em `.afr/tasks/`:
    - `task-001`: Modelos de Domínio, Tipagem e Retrocompatibilidade de Storage
    - `task-002`: Serviço de Súmula, Sincronização e Regras de Suspensão (`scoresheetService.ts`)
    - `task-003`: Integração dos Handlers Reativos no Estado Global (`App.tsx`)
    - `task-004`: Componente Modal de Preenchimento da Súmula (`ScoresheetModal.tsx`)
    - `task-005`: Nova Aba "Súmula" e Integração na Barra de Navegação (`ScoresheetTab.tsx` e `Navigation.tsx`)
    - `task-006`: Exportação Modular WhatsApp e Relatório em PDF Consolidado (`pdfExportService.ts` e `ExportTab.tsx`)
  - Atualização do ponteiro [.afr/current_task](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/.afr/current_task) apontando para a `task-001`.
- **Decisões Tomadas:**
  - Garantir isolamento em cada tarefa com Allowlist estrita de leitura e escrita.
- **Próximos Passos:**
  - Iniciar a execução da Task 1 pelo ciclo TDD (escrever teste que falha em `tests/unit/scoresheetTypes.test.ts`, implementar código mínimo e validar).

## [2026-10-09] Brainstorming e Refinamento de Requisitos: Controle de Súmula para Juízes
- **Objetivo da Sessão:** Conduzir o brainstorming formal da skill `afr-superpowers:brainstorming` para definir escopo, contratos e fluxos da súmula de arbitragem dos juízes.
- **Vínculo à Task:** FEAT-2026-10-002 (Controle de Súmula para Juízes - Brainstorming)
- **Atividades Realizadas:**
  - Análise dos requisitos definidos pelo usuário: registro de autores de gols (artilharia) e cartões baseados nos atletas da aba Times (por número ou número + nome), horários oficiais das partidas mantidos, observações livres da arbitragem sem necessidade de aprovação formal, criação de aba dedicada "Súmula" no aplicativo e inclusão dos dados no relatório PDF e mensagem de WhatsApp com seleção de destino.
  - Definição das regras de negócio pelo usuário:
    - **Regra de Cartões:** 2 cartões amarelos acumulados em jogos distintos geram suspensão de 1 partida; cartão vermelho direto ou 2 amarelos no mesmo jogo geram suspensão automática de 1 partida.
    - **Sincronização Condicional de Placares:** Se a súmula da partida for preenchida, o placar na aba Jogos é alimentado automaticamente pelos gols da súmula; se não houver súmula registrada, o placar manual na aba Jogos permanece livremente editável.
    - **Exportação & Compartilhamento:** Compartilhamento WhatsApp modular com 3 formatos (Artilharia & Cartões, Classificação & Mata-Mata, e Suspensão por Rodadas); PDF consolidado contendo relatório completo (Classificação, Mata-Mata, Artilharia, Cartões, Suspensões e Súmulas).
  - Estruturação do Design Técnico de Dados, Componentes e Fluxos para validação.
- **Decisões Tomadas:**
  - Adoção da Abordagem 1 customizada com sincronização condicional e suspensão com acúmulo de 2 amarelos.
- **Próximos Passos:**
  - Apresentar o design estruturado para aprovação do usuário e, após aprovado, formalizar a especificação de feature em `.afr/features/` via `afr-planning:feature-spec-generator`.

## [2026-10-09] Inicialização da Branch de Trabalho e Preferências Git para Controle de Súmula dos Juízes
- **Objetivo da Sessão:** Atender ao comando de abertura de sessão da pipeline AFR (`/using-afr-superpowers`), executar o checklist `session-start.md`, validar a sanidade do projeto (testes e build limpos), inicializar o arquivo de preferências git canônico `.afr/git-preferences.md` e criar a branch de trabalho dedicada `feat/controle-sumula-juizes` para inclusão do controle de súmula para os juízes.
- **Vínculo à Task:** FEAT-2026-10-002 (Controle de Súmula para Juízes - Preparação & Branch)
- **Atividades Realizadas:**
  - Verificação de git status e sincronização da branch `main` com o remoto (`origin/main`).
  - Execução da suíte completa de testes automatizados com Vitest (41/41 testes aprovados com sucesso).
  - Configuração do arquivo canônico `.afr/git-preferences.md` com convenções AFR (Conventional Commits em pt-BR, branch base/destino `main`, autor André Ribeiro).
  - Criação e ativação da nova branch de trabalho `feat/controle-sumula-juizes`.
- **Decisões Tomadas:**
  - Adotar a nomenclatura canônica `feat/controle-sumula-juizes` alinhada aos padrões AFR (`feat/<nome-curto>`).
- **Próximos Passos:**
  - Iniciar a fase de Brainstorming e especificação Feature First em `.afr/features/` para detalhar os requisitos da súmula de arbitragem (cartões amarelo/vermelho, autores dos gols por atleta, tempos de jogo, observações e eventual impacto na artilharia e classificação).

## [2026-10-09] Estruturação PWA iOS 100% Offline e Pipeline GitHub Pages (HTTPS Gratuito)
- **Objetivo da Sessão:** Estruturar a página web para operação perfeita no iOS (iPhone / Safari) como PWA adicionado à Tela de Início em modo standalone (tela cheia sem barras), mantendo proposta 100% offline com persistência local direta no aparelho (`localStorage`), suporte a Web Share API para exportar backup e workflow de deploy automático contínuo via GitHub Actions no GitHub Pages com HTTPS seguro e custo zero.
- **Vínculo à Task:** FEAT-2026-10-001 (PWA iOS Offline & GitHub Pages Deploy), Plano `plan-2026-10-09-001` (Tasks 001 a 004).
- **Atividades Realizadas:**
  - Configuração de `base: './'` no [vite.config.ts](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/vite.config.ts) para resolução relativa universal de bundles e assets no subdiretório do GitHub Pages (`/Rockgol---Sao-Patricio/`).
  - Adição de metatags completas de PWA para Apple no [index.html](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/index.html) (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-mobile-web-app-title`, `apple-touch-icon` e `viewport-fit=cover`).
  - Configuração de safe area insets (`pt-safe`) no [Header.tsx](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/components/Header.tsx) para acomodar o entalhe/Dynamic Island e barra de status do iPhone.
  - Atualização do [manifest.json](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/public/manifest.json) com `start_url: "./"`, `scope: "./"` e ícones relativos.
  - Evolução do Service Worker [public/sw.js](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/public/sw.js) com precache relativo e estratégia de cache dinâmico de recursos estáticos compilados (JS, CSS, fontes e imagens) com fallback offline para navegação.
  - Ajuste de registro do Service Worker no [main.tsx](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/main.tsx) apontando para `./sw.js`.
  - Aprimoramento do [backupService.ts](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/services/backupService.ts) com suporte à Web Share API (`navigator.share`) com arquivo JSON para salvamento direto no app "Arquivos" do iPhone / WhatsApp / AirDrop.
  - Criação do componente [IOSInstallBanner.tsx](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/components/IOSInstallBanner.tsx) e integração no [App.tsx](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/src/App.tsx), apresentando guia passo a passo para o usuário adicionar à Tela de Início do Safari.
  - Criação do workflow [.github/workflows/deploy.yml](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/.github/workflows/deploy.yml) para automação de CI/CD no GitHub Pages.
  - Expansão dos testes unitários em [tests/unit/pwaSetup.test.ts](file:///c:/Users/andre.ribeiro/Documents/GitHub-AFR/Rockgol---Sao-Patricio/tests/unit/pwaSetup.test.ts) (41/41 testes verdes).
  - Build de produção verificado com sucesso (`npm run build`).
- **Decisões Tomadas:**
  - Adotar `base: './'` para manter o pacote universal (compatível tanto com GitHub Pages com subpath quanto com domínio customizado ou visualização local).
  - Utilizar a Web Share API como primeira opção móvel para salvar arquivos no iOS, permitindo acesso imediato ao app nativo "Arquivos" sem depender da API desktop não suportada pelo Safari.
- **Próximos Passos:**
  - Orientar o usuário a habilitar o GitHub Pages no repositório (`Settings > Pages > Source: GitHub Actions`) e realizar o push para a branch `main` para publicação automática no link seguro HTTPS.

## [2026-10-08] Detalhamento de Pênaltis no Mata-Mata e Destaque da Grande Final / Pódio no WhatsApp
- **Objetivo da Sessão:** Aprimorar o texto gerado para compartilhamento no WhatsApp para exibir explicitamente o resultado e vencedor das disputas de pênaltis em empates do mata-mata, além de dar destaque visual de honra à Grande Final (Campeão/Vice) e à disputa de 3º e 4º colocados.
- **Vínculo à Task:** FEAT-2026-10-001 (Compartilhamento & Comunicação do Torneio)
- **Atividades Realizadas:**
  - Implementação da função `formatKnockoutMatchForWhatsApp` em `src/services/pdfExportService.ts` com tratamento completo para empates no tempo regulamentar com decisão de pênaltis (`🎯 Pênaltis: TimeA X × Y TimeB ➔ Time vencedor nos pênaltis!`).
  - Criação de blocos temáticos destacados na mensagem:
    - `🥊 SEMIFINAIS` com confrontos e pênaltis;
    - `🥉 DISPUTA DO 3º LUGAR` com definição do 3º Colocado (Bronze) e 4º Colocado;
    - `👑 GRANDE FINAL DO TORNEIO` com coroação e bloco exclusivo `🌟 PÓDIO DOS CAMPEÕES: 🏆 CAMPEÃO / 🥈 VICE-CAMPEÃO`.
  - Adição de 2 novos testes unitários em `tests/unit/pwaSetup.test.ts` cobrindo cenários com e sem pênaltis (totalizando 35/35 testes verdes).
  - Execução de build de produção (`npm run build`) validado com código 0 e sincronização com a plataforma Android via `npx cap sync android`.
- **Decisões Tomadas:**
  - Separar visualmente o chaveamento em divisores claros no WhatsApp para leitura instantânea pelos atletas e organizadores nos grupos.
- **Próximos Passos:**
  - Usuário faz o push para o GitHub e baixa o novo APK atualizado na aba Actions.

## [2026-10-08] Correção do Download de Backup JSON com Seleção Nativa de Local (Android & Web)
- **Objetivo da Sessão:** Identificar a causa raiz do download de JSON não salvar arquivos no aparelho celular e implementar mecanismo para que o usuário possa escolher o local exato (pasta / aplicativo) onde salvar o backup.
- **Vínculo à Task:** FEAT-2026-10-001 (Persistência & Backup Mobile)
- **Atividades Realizadas:**
  - Diagnóstico da causa-raiz: o WebView do Android por padrão ignora downloads via Blob em tags `<a>` silenciosamente (documentado em `DIV-07`).
  - Instalação e sincronização do plugin oficial `@capacitor/filesystem`.
  - Implementação de `saveTournamentBackupFile` no `backupService.ts`:
    - No Android nativo, grava o arquivo no armazenamento do dispositivo (`Filesystem.writeFile`) e aciona a folha do sistema operacional via `Share.share` com a URI física do arquivo, permitindo ao usuário escolher a opção nativa "Salvar em..." / "Copiar para...", escolhendo a pasta desejada (Downloads, Documentos, Drive, WhatsApp, etc.).
    - Na Web, adicionado suporte à File System Access API (`showSaveFilePicker`) para abrir a caixa "Salvar como..." do sistema operacional.
  - Atualização do componente `ExportTab.tsx` para usar o novo fluxo assíncrono com mensagens informativas.
  - Atualização da suíte de testes com novo teste unitário cobrindo `saveTournamentBackupFile` (33/33 testes verdes).
  - Sincronização dos plugins e web assets no Android nativo via `npx cap sync android`.
- **Decisões Tomadas:**
  - Utilizar a combinação `Filesystem` + `Share` para delegar ao sistema operacional a responsabilidade de escolha de pasta, respeitando as políticas modernas de Scoped Storage do Android.
- **Próximos Passos:**
  - Subir alterações para o repositório para geração de novo APK.

## [2026-10-08] Correção da Exportação de PDF Nativo e Compartilhamento via WhatsApp
- **Objetivo da Sessão:** Corrigir a exportação de relatório para que o PDF seja baixado diretamente no celular sem abrir ou redirecionar para o Google Chrome, permitindo que o usuário permaneça dentro do aplicativo e possa optar por compartilhar o resumo formatado via WhatsApp.
- **Vínculo à Task:** FEAT-2026-10-001 (Exportação & Distribuição Mobile)
- **Atividades Realizadas:**
  - Diagnóstico da causa-raiz do redirecionamento para o Chrome: uso de `window.open` e `print()` em WebViews Android (documentado em `DIV-06`).
  - Instalação e integração da biblioteca `jspdf` para construção do documento vetorial `.pdf` A4 em memória.
  - Implementação do design vetorial do relatório com cores oficiais do torneio (`#0B1320`, `#00D26A`), tabela completa de classificação com destaque G4 e chaveamento de mata-mata.
  - Download nativo direto acionado via `doc.save('RockGol_2026_Relatorio_YYYY-MM-DD.pdf')`.
  - Instalação do plugin `@capacitor/share` e sincronização no Android (`npx cap sync android`).
  - Criação de modal nativo embutido no app após a geração do PDF, perguntando se o usuário deseja compartilhar a tabela e resultados com os grupos pelo WhatsApp.
  - Validação de compilação TypeScript e Vite (`npm run build`) com 0 erros.
  - Execução e aprovação de 100% dos testes unitários (32 testes em 8 suites passando).
  - Geração completa de ícones nativos do Android (`mipmap-mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`) com ícone adaptativo e fundo `#0B1320` a partir de `logotipoapp.jpg`.
  - Atualização dos ícones do PWA e favicons em `public/icon-192.png` e `public/icon-512.png`.
  - Simplificação do fluxo de exportação a pedido do usuário: alteração do bloco para "Compartilhar Classificação", botão "Compartilhar via WhatsApp" que vai direto para a tela de seleção de contatos/grupos do WhatsApp sem modais intermediários.
  - Sincronização dos novos web assets e plugins na pasta nativa `android/`.
- **Decisões Tomadas:**
  - Fluxo direto para o WhatsApp elimina a fricção de tentar localizar arquivos PDF salvos na árvore de diretórios do celular, entregando a informação imediatamente aos destinatários nos grupos.
  - Substituir todos os ícones padrões do Capacitor pelos ícones oficiais do RockGol São Patrício em todas as densidades do Android.
- **Próximos Passos:**
  - Realizar commit e push das alterações para que a esteira do GitHub Actions gere o novo APK atualizado com os novos ícones e a exportação corrigida.

## [2026-10-08] Configuração do Capacitor Android e Pipeline CI/CD de Build do APK
- **Objetivo da Sessão:** Configurar a estrutura nativa Android (Capacitor) e a esteira de CI/CD via GitHub Actions para compilação automatizada do APK Android (`app-debug.apk`) na nuvem sem sobrecarregar a máquina local.
- **Vínculo à Task:** FEAT-2026-10-001 (Empacotamento Nativo Android & Distribuição APK)
- **Atividades Realizadas:**
  - Instalação dos pacotes do Capacitor (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`).
  - Criação do `capacitor.config.json` com `appId: com.saopatricio.rockgol2026`, `appName: RockGol 2026` e `webDir: dist`.
  - Inicialização da plataforma nativa Android via `npx cap add android` gerando a pasta `android/` com Gradle e AndroidManifest.
  - Sincronização dos web assets compilados (`dist/`) com o projeto nativo via `npx cap sync android`.
  - Criação do workflow do GitHub Actions em `.github/workflows/build-apk.yml`.
  - Correção (DIV-04): Atualização do step de Node.js para `node-version: 22`, atendendo à exigência do `@capacitor/cli 7+` (`NodeJS >=22.0.0`).
  - Correção (DIV-05): Atualização do step de Java para `java-version: 21` (Temurin), resolvendo o erro `invalid source release: 21` exigido pelo compilador do Capacitor 7.
  - Atualização do `.gitignore` para ignorar caches do Gradle e pastas temporárias de build do Android.
  - Validação de 100% dos testes unitários (32/32) e integridade da build.
- **Decisões Tomadas:**
  - Compilação do APK delegada para o GitHub Actions na nuvem conforme escolha do usuário com Node.js 22 LTS e Java 21 LTS.
- **Próximos Passos:**
  - Usuário faz o push para o GitHub e baixa o APK gerado na aba Actions.

## [2026-10-08] Reformulação Visual Completa e Alinhamento com o Layout Oficial (exemplodesing.jpeg)
- **Objetivo da Sessão:** Atender à solicitação do usuário para reformular radicalmente o design do app, aplicando fielmente a identidade visual e layout fornecidos em `exemplodesing.jpeg` e os padrões canônicos da AFR.
- **Vínculo à Task:** FEAT-2026-10-001 (Refinamento Visual e Design System)
- **Atividades Realizadas:**
  - Diagnóstico da causa-raiz do visual cru anterior: ausência do plugin `@tailwindcss/vite` e `tailwindcss` no bundle do Vite, o que impedia a geração das classes utilitárias.
  - Instalação e integração do Tailwind CSS v4 oficial via `@tailwindcss/vite`.
  - Importação de tipografia de alta performance no `index.html` (`Outfit` para títulos e números, `Plus Jakarta Sans` para interfaces).
  - Implementação fiel da paleta extraída de `exemplodesing.jpeg`: fundo `#0B1320`, cards `#121D2F` com bordas `#1E2D44`, acento verde esmeralda `#00D26A`, e vermelho `#EF4444` para saldo negativo.
  - Redesenho completo de `Header.tsx`: logo com contorno verde circular, `ROCKGOL 2026` em caixa alta branca, `SÃO PATRÍCIO BAR` em verde `#00D26A`, e botões de ação translúcidos no topo direito (Salvar / Reset).
  - Redesenho idêntico de `StandingsTab.tsx`: badge circular verde `#00D26A` para o G4, badge escuro para as demais posições, números tabulares, saldo em cores corretas e legenda oficial idêntica à imagem de referência.
  - Harmonização de todas as demais abas (`MatchesTab.tsx`, `KnockoutTab.tsx`, `KnockoutScoreModal.tsx`, `TeamsTab.tsx`, `PlayerModal.tsx` e `ExportTab.tsx`).
  - Adição de simulador realista de Smartphone no Desktop com Dynamic Island, barra de status ao vivo e toggle para tela cheia.
  - Validação de 100% dos testes unitários (32/32) e compilação do build de produção com sucesso (`npm run build`).
- **Decisões Tomadas:**
  - Padronizar toda a aplicação na paleta exata de `exemplodesing.jpeg`.
- **Próximos Passos:**
  - Apresentar o novo layout ao usuário para validação visual.

## [2026-10-08] Conclusão Integral do Desenvolvimento TDD do Aplicativo PWA RockGol 2026
- **Objetivo da Sessão:** Execução ponta a ponta do ciclo rigoroso TDD (Tasks 001 a 008 do plano `plan-2026-10-08-001`) para entrega completa do aplicativo offline mobile PWA.
- **Vínculo à Task:** plan-2026-10-08-001 (Tasks 001 a 008) / FEAT-2026-10-001
- **Atividades Realizadas:**
  - Setup do projeto Vite + React 19 + TypeScript + Tailwind CSS + Lucide Icons + Vitest (`task-001`).
  - Extração canônica e validação dos dados das 7 equipes e 21 partidas da 1ª fase conforme docx (`task-002`).
  - Implementação TDD do serviço de classificação com ordenação determinística e desempate (Pontos > Vitórias > Saldo de Gols > Gols Pró > Confronto Direto > Gols Contra > Ordem Alfabética) (`task-003`).
  - Implementação TDD do serviço de mata-mata com regras de bloqueio antes de 21 jogos, semifinais (1ºx4º e 2ºx3º), disputa de pênaltis mandatória em empates e propagação para Grande Final e 3º Lugar (`task-004`).
  - Implementação TDD de persistência offline reativa em LocalStorage e backup/restauração validada com JSON (`task-005`).
  - Construção dos componentes UI mobile: Header com logotipo oficial, navegação ergonômica em 5 abas, Aba de Jogos com cards, campos 1/2 e intervalo de almoço, Aba de Times com modal de elenco de 10 atletas (`task-006`).
  - Construção dos componentes UI mobile: Aba de Classificação com realce G4 e Aba de Mata-Mata com chaveamento e modal de placar/pênaltis (`task-007`).
  - Construção da Aba de Exportar com geração de relatório em PDF para impressão e gerenciador de backup JSON, configuração PWA (`manifest.json` e `sw.js`) para operação 100% offline e montagem integrada no `App.tsx` (`task-008`).
  - Execução de build de produção (`npm run build`) validado com código 0 e execução de 100% dos testes unitários (32 testes em 8 suites passando com código 0).
- **Decisões Tomadas:**
  - Placar empatado no tempo normal do mata-mata exibe obrigatoriamente a interface de pênaltis para definição de vencedor e perdedor.
  - PWA opera 100% offline via Service Worker servindo assets do cache e persistindo no LocalStorage.
  - Relatório PDF gera layout otimizado para impressão/PDF nativo com logotipo oficial `logotipoapp.jpg`, tabela completa de classificação da 1ª fase e chaveamento do mata-mata.
- **Próximos Passos:**
  - Aplicação finalizada e pronta para uso pelos organizadores e atletas no torneio.

## [2026-10-08] Definição de Arquitetura PWA e Apresentação do Design
- **Objetivo da Sessão:** Validação da arquitetura tecnológica (PWA Mobile-First selecionado pelo usuário) e apresentação seccional do design técnico.
- **Vínculo à Task:** ANÁLISE-REQUISITOS-ROCKGOL-02
- **Atividades Realizadas:**
  - Usuário confirmou a Abordagem 1: PWA Mobile-First (React + Vite + Tailwind/CSS + TypeScript).
  - Estruturação do design arquitetural seccional (Arquitetura, Abas, Armazenamento Local, Regras de Classificação e Mata-Mata).
- **Decisões Tomadas:**
  - Stack definida: PWA Mobile-First com suporte a instalação na tela de início, offline via Service Worker, LocalStorage reativo e exportação de PDF / Backup JSON.
- **Próximos Passos:**
  - Validar a Seção 1 do Design com o usuário e avançar para a geração formal da spec em `.afr/features/` via `afr-planning:feature-spec-generator`.

## [2026-10-08] Análise de Requisitos e Regras de Negócio do Torneio RockGol 2026
- **Objetivo da Sessão:** Analisar `regra-negocio.md` e `Tabela_Rock_Gol_2026.docx` sob a governança do harness AFR e skills afr-superpowers.
- **Vínculo à Task:** ANÁLISE-REQUISITOS-ROCKGOL-01
- **Atividades Realizadas:**
  - Inicialização da infraestrutura canônica de contexto AFR (`.afr/context/`, `project-context.md`, `known-fixes.md` e checklists em `.afr/context/checklists/`).
  - Extração e análise aprofundada da tabela oficial do torneio (`Tabela_Rock_Gol_2026.docx`): 7 equipes, 11 rodadas, 21 jogos de turno único, intervalo de almoço (12:00-13:30), 2 campos, e chaveamento eliminatório de 4 jogos (Semifinais, 3º lugar e Final).
  - Análise das regras de negócio em `regra-negocio.md`: arquitetura mobile offline, sem login, abas (Jogos, Times, Classificação, Mata-Mata, Exportar), backup/restauração e geração de PDF.
  - Mapeamento detalhado de requisitos, invariantes, casos de borda e pontos de alinhamento com o usuário.
- **Decisões Tomadas:**
  - Seguir estritamente o harness AFR com governança física de contexto e documentação Feature-First.
  - Propor as abordagens de arquitetura e tecnologia (React Native / Expo vs PWA / Web Mobile) e os critérios de desempate canônicos para alinhamento.
- **Próximos Passos:**
  - Apresentar a análise completa ao usuário e alinhar os pontos de decisão (arquitetura e critérios de desempate).

