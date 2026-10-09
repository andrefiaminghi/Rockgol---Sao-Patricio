# DB sincronismo Rockgol

1. Quero vincular dados ao DB no supabase
    - https://ihegprwkrmybdrpgodnf.supabase.co
    - sb_publishable_zHKJEkKskBcBNzbU5vwWrA_9vRfLieO
    - postgresql://postgres:[YOUR-PASSWORD]@db.ihegprwkrmybdrpgodnf.supabase.co:5432/postgres
    - supabase login
        supabase init
        supabase link --project-ref ihegprwkrmybdrpgodnf

2. Quero que existam dois PWA para o projeto
    - Juiz: que permite acessar e editar sumula
    - Torcida: que acessa as demais abas

3. PWA de Juiz é a estrutura que tem atualmente - com tudo liberado
    - Esta versão possibilitará atualizar a base de dados, Torcida só realiza consulta para sincronismo de dados.
    - Edição de partidas na aba Jogos serve apenas em modo local no aparelho, para simular placares
    - Edição de partidas na aba Mata Mata serve apenas em modo local no aparelho, para simular placares
    - Apenas o registro de sumula e times (nomes dos jogadores) efetuam ação de registros no banco de dados. 
    - Ao confirmar registro da sumula, executa a ação de registro na base de dados, atualizado "placar partida", "Cartões", "Artilharia", "Suspensões"

4. PWA Torcida pode:
    - Editar placares na aba Jogos, de partidas que não possuem sumula registrada - partidas com sumula tem placares bloqueados, sendo apenas consulta
        - Edição de partidas na aba Jogos serve apenas em modo local no aparelho, para simular placares
    - Consultar aba times - sem edição
    - Consultas aba classificação
    - Editar placares na aba Mata Mata, de partidas que não possuem sumula registrada - partidas com sumula tem placares bloqueados, sendo apenas consulta
        - Edição de partidas na aba Mata Mata serve apenas em modo local no aparelho, para simular placares
    - Não acesso a aba Sumula apenas em modo consulta, não poderá editar absolutamente nada
    - Incluir um botão "Sincronizar" no Header do app para permitir efetuar uma carga dos dados da base de dados para o aparelho.
        - Substituir a função "Reiniar" que existe no header para ser o sincronizar.
        - Depois de sincronizar, podem continuar com o PWA offline.
    - Aba Exportar permite utilizar normalmente.