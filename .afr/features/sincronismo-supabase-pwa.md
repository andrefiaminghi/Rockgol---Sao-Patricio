# Feature: Sincronismo Supabase e PWAs Independentes (Juiz e Torcida)

## 1. Visão Geral e Objetivo
Implementar a sincronização em nuvem via **Supabase** para o aplicativo do torneio *RockGol 2026 - São Patrício Bar* e disponibilizar **dois PWAs independentes** no mesmo deploy:
1. **PWA Juiz (`juiz.html`):** Perfil de arbitragem protegido por PIN (`2026`), com permissão total para preenchimento de súmulas, cadastro de atletas nos times e sincronização automática e manual com a nuvem.
2. **PWA Torcida (`index.html`):** Perfil público para a torcida e atletas com acesso de somente leitura às informações oficiais da súmula e dos times, permitindo simulação local de placares para jogos sem súmula e atualização sob demanda via botão **"Sincronizar"** no Header.

Ambos os perfis mantêm suporte offline transparente com persistência no `localStorage` e Service Worker compartilhado.

---

## 2. Configurações de Conexão com o Supabase
* **URL do Projeto:** `https://ihegprwkrmybdrpgodnf.supabase.co`
* **Chave Pública (Anon/Publishable):** `sb_publishable_zHKJEkKskBcBNzbU5vwWrA_9vRfLieO`
* **Biblioteca:** `@supabase/supabase-js`

---

## 3. Modelo de Dados e DDL SQL (Supabase)

### 3.1 Tabela `scoresheets`
Armazena as súmulas oficiais preenchidas pelos árbitros:
```sql
CREATE TABLE IF NOT EXISTS public.scoresheets (
  match_id TEXT PRIMARY KEY,
  has_scoresheet BOOLEAN NOT NULL DEFAULT true,
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  cards JSONB NOT NULL DEFAULT '[]'::jsonb,
  observations TEXT,
  home_penalties INTEGER,
  away_penalties INTEGER,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.scoresheets ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público anônimo
CREATE POLICY "Permitir leitura pública de súmulas" ON public.scoresheets
  FOR SELECT TO anon USING (true);

CREATE POLICY "Permitir escrita de súmulas via chave pública" ON public.scoresheets
  FOR ALL TO anon USING (true) WITH CHECK (true);
```

### 3.2 Tabela `teams`
Armazena a relação de times e os nomes dos jogadores cadastrados:
```sql
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  players JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ativar RLS
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público anônimo
CREATE POLICY "Permitir leitura pública de times" ON public.teams
  FOR SELECT TO anon USING (true);

CREATE POLICY "Permitir escrita de times via chave pública" ON public.teams
  FOR ALL TO anon USING (true) WITH CHECK (true);
```

---

## 4. Arquitetura dos Dois PWAs

### 4.1 Estrutura Multi-page do Vite
* **`index.html` (Torcida):**
  * Título: *"RockGol 2026 - Torcida"*
  * `manifest.json` próprio com `start_url: "./"`
  * Monta a aplicação no modo `role = 'torcida'`
* **`juiz.html` (Juiz / Arbitragem):**
  * Título: *"RockGol 2026 - Árbitro"*
  * `manifest-juiz.json` próprio com `start_url: "./juiz.html"` e ícone com insígnia de arbitragem
  * Monta a aplicação no modo `role = 'juiz'`
  * Se o PIN (`2026`) não estiver validado no `localStorage`, renderiza modal/tela de desbloqueio por teclado numérico.

### 4.2 Service Worker Unificado (`public/sw.js`)
* Gerencia o precache dos dois arquivos (`index.html`, `juiz.html`, `manifest.json`, `manifest-juiz.json`).
* Mantém estratégia **Network-First** para documentos e navegação com fallback de cache para modo offline.

---

## 5. Regras de Negócio e Permissões por Perfil

### 5.1 PWA do Juiz (`juiz.html`)
1. **Autenticação:**
   * PIN de 4 dígitos (padrão `2026`), salvo em `localStorage` no dispositivo após primeira validação bem-sucedida.
2. **Aba Times:**
   * Edição de nomes de jogadores permitida. Ao salvar/alterar, envia para o Supabase (`teams`).
3. **Aba Súmula:**
   * Permissão completa para preenchimento de gols, faltas/cartões, suspensões, penalidades e observações.
   * Botão "Limpar Súmula" disponível.
   * Ao confirmar o salvamento ou limpeza da súmula:
     - Grava localmente no `localStorage`.
     - Envia imediatamente para o Supabase (`scoresheets`).
     - Se estiver sem conexão, marca como pendente e atualiza indicador visual para "Offline".
4. **Header do Juiz:**
   * Indicador de nuvem (🟢 Conectado / 🟠 Offline/Pendente).
   * Botão **"Sincronizar"**:
     - Puxa súmulas preenchidas por outros árbitros em outros campos.
     - Tenta reenviar súmulas locais pendentes.
5. **Abas Jogos e Mata-Mata:**
   * Jogos com súmula preenchida ficam bloqueados para edição de placar.
   * Jogos sem súmula permitem simulação de placar local.

### 5.2 PWA da Torcida (`index.html`)
1. **Acesso:**
   * Acesso público direto, sem senha.
2. **Aba Times:**
   * Apenas consulta dos elencos (inputs desabilitados / somente leitura).
3. **Aba Súmula:**
   * Apenas consulta dos resultados oficiais, artilharia, cartões e suspensões.
   * Botões de preenchimento, edição ou limpeza de súmula **ocultos ou desabilitados**.
4. **Abas Jogos e Mata-Mata:**
   * Partidas com súmula registrada têm placares bloqueados (apenas consulta com badge `🔒 Súmula Oficial`).
   * Partidas sem súmula permitem edição de placar apenas localmente para simulações pessoais do torcedor.
5. **Header da Torcida:**
   * Substituição do botão "Reiniciar" pelo botão **"Sincronizar"** (ícone de nuvem com data/hora da última carga).
   * Ao clicar em "Sincronizar", executa leitura no Supabase e atualiza o estado local, recalculando classificação e mata-mata.
   * O app continua funcionando 100% offline após sincronizado.
6. **Aba Exportar:**
   * Disponível normalmente para download de PDF e compartilhamento no WhatsApp.

---

## 6. Critérios de Aceitação
1. **Deploy e Build:** `npm run build` deve gerar os bundles de `index.html` e `juiz.html` sem erros de TypeScript ou Vite.
2. **Isolamento de Perfis:**
   - No PWA Torcida, é impossível abrir o modal de edição de súmula ou alterar elencos na aba Times.
   - No PWA Juiz, a tela de PIN bloqueia o acesso até que `2026` seja informado corretamente.
3. **Sincronização no Supabase:**
   - Salvar uma súmula no PWA Juiz grava com sucesso na tabela `scoresheets` do Supabase.
   - Clicar em "Sincronizar" no PWA Torcida baixa os dados da tabela `scoresheets` e atualiza a classificação e artilharia.
4. **Resiliência Offline:**
   - Se o dispositivo perder a conexão, o PWA Juiz e o PWA Torcida continuam funcionando com os dados locais do `localStorage`.
5. **Testes Automatizados:**
   - Testes unitários para o serviço de integração do Supabase (`supabaseService.test.ts`), simulando operações de pull, push e fallback offline.
   - Cobertura de 100% de aprovação nos testes existentes e novos.
