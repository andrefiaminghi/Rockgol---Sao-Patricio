# Checklist: Pré-Commit (Pre-Commit Quality Gate)

Este checklist procedural padroniza a validação de qualidade antes de qualquer commit no ecossistema AFR.

> [!NOTE]
> Natureza Consultiva por Design: Este checklist é consultivo por design para auto-inspeção voluntária pelo engenheiro antes de criar commits.

---

## 1. Qualidade e Formatação de Código
- [ ] Executar formatação e linting do código.
- [ ] Código compila com zero erros e zero warnings críticos.

## 2. Validação de Testes Automatizados (TDD Verde)
- [ ] Executar a suíte de testes unitários relevante e certificar 100% de testes verdes.
- [ ] Nenhuma asserção de teste foi comentada ou suprimida para "forçar" o verde.

## 3. Segurança e Segredos
- [ ] Verificar `git diff --staged` e garantir que nenhuma chave de API, segredo, senha ou token foi incluído.
- [ ] Nenhum arquivo de ambiente sensível ou credencial está presente na área de staging.

## 4. Padrão de Mensagem de Commit
- [ ] Mensagem segue rigorosamente o formato Conventional Commits: `{tipo}({escopo}): {descrição em pt-BR}`.
- [ ] Idioma obrigatoriamente em português brasileiro com acentuação correta.
