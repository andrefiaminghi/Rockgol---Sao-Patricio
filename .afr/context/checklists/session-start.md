# Checklist: Início de Sessão (Session-Start)

Este checklist procedural padroniza a abertura de qualquer sessão de trabalho de engenharia no ecossistema AFR.

---

## 1. Verificação de Repositório & Branch
- [ ] Executar `git status` e conferir se o working tree está limpo.
- [ ] Confirmar que a branch de trabalho atual é a correta para a demanda (ex: `feature/...` ou `fix/...`).
- [ ] Sincronizar com o remoto se necessário (`git pull origin <branch>`).

## 2. Carregamento de Contexto & Estado
- [ ] Ler o topo de `.afr/context/session-history.md` para entender as últimas atividades, decisões e contexto deixado pela sessão anterior.
- [ ] Consultar `.afr/context/project-context.md` e `.afr/context/known-fixes.md` para relembrar restrições e correções já documentadas.
- [ ] Inspecionar `.afr/tasks/` para identificar a tarefa atômica em andamento ou próxima a executar.

## 3. Verificação de Ambiente & Sanidade
- [ ] Validar compilação ou suíte de testes básica do projeto.
- [ ] Confirmar que os hooks de governança estão ativos e o ambiente está operacional.

## 4. Alinhamento da Sessão
- [ ] Confirmar com o usuário o objetivo imediato do turno de trabalho.
- [ ] Carregar a skill correspondente (`afr-superpowers:*` ou skill de domínio) antes de qualquer ação.
