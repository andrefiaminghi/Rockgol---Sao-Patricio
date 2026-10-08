# Checklist: Conclusão de Tarefa (Task-Complete)

Este checklist procedural assegura que todos os critérios de aceitação de uma tarefa atômica foram comprovados antes de considerá-la pronta.

---

## 1. Verificação de Critérios de Aceitação
- [ ] Revisar um a um todos os critérios listados na seção `## 5. Critérios de Aceitação da Tarefa` em `.afr/tasks/plan-*-task-*.md`.
- [ ] Confirmar que cada critério possui evidência empírica comprovada.

## 2. Rastreabilidade do Ciclo TDD
- [ ] Confirmar que a fase RED existiu.
- [ ] Confirmar que a fase GREEN foi alcançada com o menor código possível.
- [ ] Confirmar que a fase REFACTOR eliminou duplicidades ou dívida técnica sem quebrar testes existentes.

## 3. Cobertura de Casos Negativos e Borda
- [ ] Foram testadas entradas nulas, vazias ou fora dos limites esperados?
- [ ] Cenários de erro retornam mensagens assertivas em vez de falhas silenciosas ou crashes genéricos?

## 4. Atualização de Metadados & Sincronização do Plano Pai
- [ ] Marcar todas as caixas `[x]` dos critérios cumpridos no arquivo da tarefa (`.afr/tasks/plan-*-task-*.md`).
- [ ] Atualizar o campo `status: "DONE"` no frontmatter YAML da tarefa em `.afr/tasks/plan-*-task-*.md`.
- [ ] Sincronizar o plano pai em `.afr/plans/plan-*.md`, marcando como `[x]` a subtarefa correspondente e seus passos técnicos.
- [ ] Se todas as tarefas do plano foram concluídas, atualizar o plano pai para `status: "DONE"` com 100% dos checkboxes marcados com `[x]`.
