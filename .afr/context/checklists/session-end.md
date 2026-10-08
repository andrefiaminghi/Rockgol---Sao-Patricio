# Checklist: Encerramento de Sessão (Session-End)

Este checklist procedural padroniza a finalização e o handoff de uma sessão de trabalho de engenharia no ecossistema AFR.

---

## 1. Atualização Mandatória do Histórico (Hard Gate)
- [ ] **Obrigatório:** Inserir no topo de `.afr/context/session-history.md` a entrada da sessão corrente contendo data, atividades detalhadas e decisões arquiteturais tomadas.
- [ ] Atualizar o campo `last_updated` no frontmatter YAML de `session-history.md`.

## 2. Fechamento de Tarefas & Planos
- [ ] Atualizar o status da tarefa técnica corrente em `.afr/tasks/plan-*-task-*.md` (`IN_PROGRESS` -> `DONE` se finalizada) e marcar 100% dos seus critérios com `[x]`.
- [ ] Marcar com `[x]` no plano técnico (`.afr/plans/plan-*.md`) todos os passos e subtarefas já implementados.
- [ ] Se todas as tarefas do plano foram concluídas, atualizar o plano pai para `status: "DONE"` com 100% dos checkboxes marcados com `[x]`.
- [ ] Se uma nova feature foi concluída, atualizar o status em `.afr/features/*.md` (`COMPLETED`).

## 3. Verificação de Código & Git
- [ ] Garantir que nenhum arquivo de debug, log temporário ou rascunho efêmero tenha sido deixado na árvore de trabalho.
- [ ] Rodar `git status` para verificar alterações pendentes de commit.
- [ ] Realizar commits utilizando `afr-git:conventional-commit` com mensagens em pt-BR.

## 4. Notas de Handoff para a Próxima Sessão
- [ ] Registrar claramente o próximo passo lógico a ser executado no início da próxima sessão.
- [ ] Destacar se há bloqueios, dependências externas ou revisões pendentes.
