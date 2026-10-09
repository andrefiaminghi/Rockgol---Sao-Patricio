-- ==============================================================================
-- Migration: 20261009180000_create_rockgol_sync_tables.sql
-- Descrição: Tabelas dedicadas e políticas RLS para sincronismo do RockGol 2026
-- Projeto Supabase: https://ihegprwkrmybdrpgodnf.supabase.co
-- ==============================================================================

-- 1. Tabela de Súmulas Oficiais (scoresheets)
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

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.scoresheets ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes caso estejam sendo recriadas
DROP POLICY IF EXISTS "Permitir leitura pública de súmulas" ON public.scoresheets;
DROP POLICY IF EXISTS "Permitir escrita de súmulas via chave pública" ON public.scoresheets;

-- Política de leitura anônima para a Torcida
CREATE POLICY "Permitir leitura pública de súmulas" ON public.scoresheets
  FOR SELECT TO anon USING (true);

-- Política de escrita irrestrita para o PWA Juiz usando a chave anônima/publicável
CREATE POLICY "Permitir escrita de súmulas via chave pública" ON public.scoresheets
  FOR ALL TO anon USING (true) WITH CHECK (true);


-- 2. Tabela de Times e Atletas (teams)
CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  players JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes caso estejam sendo recriadas
DROP POLICY IF EXISTS "Permitir leitura pública de times" ON public.teams;
DROP POLICY IF EXISTS "Permitir escrita de times via chave pública" ON public.teams;

-- Política de leitura anônima para a Torcida
CREATE POLICY "Permitir leitura pública de times" ON public.teams
  FOR SELECT TO anon USING (true);

-- Política de escrita de elencos para o PWA Juiz usando a chave anônima/publicável
CREATE POLICY "Permitir escrita de times via chave pública" ON public.teams
  FOR ALL TO anon USING (true) WITH CHECK (true);
