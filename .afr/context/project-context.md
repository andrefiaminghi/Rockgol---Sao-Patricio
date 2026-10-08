---
last_updated: "2026-10-08T18:43:00-03:00"
project: "Rockgol - São Patrício"
maintainers: ["André Ribeiro"]
---

# Contexto do Projeto: Rockgol - São Patrício

## 1. Visão Geral
Aplicativo mobile (offline-first) para controle completo de partidas, classificação e chaveamento eliminatório (mata-mata) do torneio de futebol "RockGol São Patrício Bar" (edição 2026).

## 2. Escopo do Torneio
- **Equipes Participantes (7 equipes):**
  1. Bordogos
  2. Meia Boca Jr
  3. Os Reis
  4. Snow Beast
  5. Real Matismo
  6. Infarto
  7. Time Teu
- **Fase 1 (Turno Único / Todos contra Todos):**
  - 11 rodadas, 21 jogos ao todo.
  - Cada equipe disputa exatamente 6 partidas.
  - Campos: Campo 1 e Campo 2.
  - Pausa Geral de Almoço entre Rodada 6 e Rodada 7 (12:00 às 13:30).
  - Partidas com 2 tempos de 10 minutos cada, e 10 minutos de intervalo/hidratação.
- **Fase 2 (Mata-Mata / Eliminatória):**
  - Semifinais: 1º x 4º colocado (SF1 - Campo 1) e 2º x 3º colocado (SF2 - Campo 2).
  - Decisão de 3º Lugar: Perdedor SF1 x Perdedor SF2 (Campo 1).
  - Grande Final: Vencedor SF1 x Vencedor SF2 (Campo 1).
  - Empate no mata-mata decidido em disputa de pênaltis.

## 3. Funcionalidades do Aplicativo
- **Sem login / 100% Offline:** Operação imediata e local sem autenticação.
- **Aba Jogos:** Listagem vertical das 11 rodadas, identificação de campos, horários, times de folga, pausa de almoço e input numérico de placares.
- **Aba Times:** Listagem dos 7 times com cadastro dos elencos (1 a 10 jogadores por time).
- **Aba Classificação:** Tabela ao vivo em ordem decrescente de pontos (Vitória: 3, Empate: 1, Derrota: 0) com critérios padrão de desempate.
- **Aba Mata-Mata:** Cruzamentos automáticos baseados na classificação final da Fase 1, telas/modais de placar e botão de pênaltis em caso de empate.
- **Backup e Restauração:** Exportação e importação de arquivo (JSON) dos dados salvos para sincronização entre aparelhos.
- **Exportação PDF:** Relatório formatado com tabela de classificação e chaveamento eliminatório.
- **Identidade Visual:** Capa/cabeçalho utilizando `logotipoapp.jpg`.

## 4. Diretrizes Arquiteturais & Convenções
- Padrão AFR: Feature First, documentação canônica em `.afr/features/` e planos em `.afr/plans/`.
- Offline-first: Persistência local segura e reativa.
