---
project: "Rockgol - São Patrício"
last_updated: "2026-10-08T18:43:00-03:00"
maintainers: ["André Ribeiro"]
---

# Known Fixes — Rockgol - São Patrício

> Casos de erro divergentes do esperado pela IA, resolvidos com fix confirmado. Toda nova falha que **não** seria deduzida do código deve virar uma DIV nova aqui.
>
> Convenção de IDs: `DIV-NN` em ordem cronológica, sem reuso.

## Índice rápido

| ID | Categoria | Sintoma | Status |
|----|-----------|---------|--------|
| DIV-01 | Regra de Negócio | Partida não realizada contabilizada como empate 0x0 | documentado |
| DIV-02 | Mata-Mata | Semifinal gerada antes do término de todas as partidas da 1ª fase | documentado |
| DIV-03 | Desempate | Empate com múltiplos critérios e ordenação instável | documentado |
| DIV-04 | CI/CD / Android | Capacitor CLI 7+ falha no GitHub Actions por exigir Node >= 22 | resolvido |
| DIV-05 | CI/CD / Android | Capacitor 7 exige JDK 21 para compilação (error: invalid source release: 21) | resolvido |
| DIV-06 | Mobile / PDF | Exportação de PDF com window.open direciona para o Chrome e trava retorno | resolvido |
| DIV-07 | Mobile / Backup | Download de blob em WebView Android não salva arquivo físico no aparelho | resolvido |

---

## DIV-07 — Download de Blob via tag <a> em WebView Android não salva arquivo físico

**Sintoma:** Ao clicar no botão de "Baixar Backup (.json)", o aplicativo exibia a mensagem de sucesso informando que o arquivo havia sido baixado, mas o usuário não encontrava o arquivo na pasta Downloads nem no armazenamento do celular.

**Causa raiz:** O componente Android `WebView` não implementa `DownloadListener` por padrão para URLs do protocolo `blob:`. No navegador comum (Chrome de computador), o clique em `<a download>` captura o Blob e grava no disco. No WebView de um aplicativo empacotado (Capacitor/Cordova), a ação é ignorada silenciosamente sem lançar exceção no JavaScript.

**Fix:**
1. Instalar o plugin oficial `@capacitor/filesystem`.
2. Gravar o arquivo físico no sistema de arquivos do dispositivo via `Filesystem.writeFile({ directory: Directory.Cache, encoding: Encoding.UTF8 })`.
3. Disparar a folha nativa do Android via `Share.share({ url: fileResult.uri })`, que permite ao usuário escolher onde deseja salvar o arquivo (utilizando a opção nativa "Salvar em..." / "Copiar para...", escolhendo a pasta exata no gerenciador de arquivos do celular, além de WhatsApp, Google Drive, etc.).
4. Para navegadores Web de computador, implementar suporte nativo à `showSaveFilePicker` (File System Access API), permitindo que o usuário escolha a pasta de destino no diálogo "Salvar como...".

**Onde aplica:** `src/services/backupService.ts` e `src/components/ExportTab.tsx`.

---

## DIV-06 — Exportação de PDF com window.open redireciona para o Chrome no Android

**Sintoma:** Ao tentar exportar relatório no app Android compilado com Capacitor, a tela abre em branco e redireciona forçadamente para o Google Chrome, tirando o usuário do aplicativo e impedindo o retorno.

**Causa raiz:** O método `window.open('', '_blank')` com `printWindow.print()` força o WebView nativo do Android a chamar a intent do navegador externo do sistema (Chrome) para lidar com a janela.

**Fix:**
1. Substituir a geração via HTML impresso por geração vetorial client-side em memória com `jspdf`.
2. Realizar download direto do binário `.pdf` no dispositivo com `doc.save('RockGol_2026_Relatorio.pdf')`.
3. Oferecer modal nativo perguntando se deseja compartilhar os resultados via WhatsApp, integrando com o plugin `@capacitor/share` e fallback URL intent do WhatsApp, mantendo o usuário 100% dentro do aplicativo.

**Onde aplica:** `src/services/pdfExportService.ts` e `src/components/ExportTab.tsx`.

---

## DIV-01 — Partida não realizada contabilizada como empate 0x0

**Sintoma:** Ao iniciar o torneio ou deixar placares vazios, a tabela de classificação atribui 1 ponto para cada time como se tivessem empatado em 0x0.

**Causa raiz:** Inicialização de campos numéricos de placar com `0` em vez de `null` ou ausência de flag booleana `finalizada` / `status: "PENDENTE"`.

**Fix:**
Manter os placares como `null` ou adicionar status `finalizada: boolean`. Somente partidas com `finalizada === true` e placares válidos alimentam a tabela de classificação.

**Onde aplica:** Model de Partida, cálculo de pontuação na Classificação.

---

## DIV-02 — Semifinal gerada antes do término de todas as partidas da 1ª fase

**Sintoma:** A aba Mata-Mata trava ou exibe confrontos incompletos ou errados enquanto a fase de pontos corridos ainda está em andamento.

**Causa raiz:** O chaveamento do mata-mata tentar consumir o ranking da 1ª fase antes da 11ª rodada ser 100% finalizada.

**Fix:**
Exibir aviso informativo na aba Mata-Mata ("Aguardando conclusão de todas as 21 partidas da 1ª fase") até que todas as partidas estejam com placar finalizado, preenchendo os confrontos automaticamente assim que o ranking se consolidar.

**Onde aplica:** Módulo do Mata-Mata.

---

## DIV-03 — Empate com múltiplos critérios e ordenação instável

**Sintoma:** Duas equipes com mesmos pontos, vitórias, saldo e gols marcados alternam posições a cada renderização.

**Causa raiz:** Algoritmo de ordenação não determinístico sem critério de desempate final consistente (confronto direto / sorteio / critério alfabético de desempate residual).

**Fix:**
Garantir função de sort determinística com hierarquia estrita: Pontos > Vitórias > Saldo de Gols > Gols Pró > Confronto Direto > Ordem Alfabética / Sorteio pré-definido.

**Onde aplica:** Módulo da Classificação.

---

## DIV-04 — Capacitor CLI 7+ falha no GitHub Actions por exigir Node >= 22

**Sintoma:** O comando `npx cap sync android` aborta no runner do GitHub Actions com o erro `[fatal] The Capacitor CLI requires NodeJS >=22.0.0. Please install the latest LTS version. Process completed with exit code 1.`

**Causa raiz:** O workflow do GitHub Actions estava fixado em `node-version: 20`, enquanto a release mais recente do Capacitor CLI exige Node.js >= 22.0.0.

**Fix:** Atualizar o step `actions/setup-node@v4` no workflow `.github/workflows/build-apk.yml` definindo explicitamente `node-version: 22`.

**Onde aplica:** CI/CD, `.github/workflows/build-apk.yml`.

---

## DIV-05 — Capacitor 7 exige JDK 21 para compilação (error: invalid source release: 21)

**Sintoma:** O Gradle aborta na task `:capacitor-android:compileDebugJavaWithJavac` com o erro `error: invalid source release: 21`.

**Causa raiz:** O Capacitor 7 compila a biblioteca Android para Java 21 (`sourceCompatibility = JavaVersion.VERSION_21`), mas o workflow do GitHub Actions estava provisionando Java 17.

**Fix:** Atualizar o step `actions/setup-java@v4` no workflow `.github/workflows/build-apk.yml` definindo explicitamente `java-version: '21'`.

**Onde aplica:** CI/CD, `.github/workflows/build-apk.yml`.
