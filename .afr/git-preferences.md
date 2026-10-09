---
last_updated: "2026-10-09"
---

# Preferências Git

## Repositório
- **Remote:** origin (https://github.com/andrefiaminghi/Rockgol---Sao-Patricio)
- **Branch de trabalho:** feat/controle-sumula-juizes
- **Branch de destino (PRs):** main
- **Branch de produção:** main
- **Fluxo de promoção:** feat/* → main (deploy contínuo automático via GitHub Actions para GitHub Pages e build de APK Android)

## Commits
- **Idioma:** pt-BR (caracteres latinos obrigatórios: á, ã, ç, etc.)
- **Formato:** Conventional Commits (feat, fix, docs, chore, etc.)
- **Autor:** André Ribeiro <137097327+andresilsistemas@users.noreply.github.com>
- **Co-author Antigravity:** não
- **Template:** `{tipo}({escopo}): {descrição em pt-BR}`

## Push
- **Modo:** ao finalizar etapa / quando solicitado
- **Instruções especiais:** nenhuma

## Regras Adicionais
- Commits atômicos no padrão Conventional Commits em português do Brasil (pt-BR).
- Testes automatizados (`npm test`) e verificação de build (`npm run build`) mandatários antes de concluir etapas.
