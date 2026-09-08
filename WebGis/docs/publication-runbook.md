# Publicação e rollback

1. Criar edição em `staging` e registrar os artefatos com checksum.
2. Validar esquema, tamanho, licença, geometrias, cobertura e integridade referencial.
3. Construir grafo e matrizes versionadas; executar casos dourados.
4. Marcar `ready`. Em uma transação, aposentar a ativa e ativar a nova.
5. Invalidar caches somente depois do commit.

Para rollback, inverta as edições ativa e anterior em uma única transação. Uma
falha antes do commit nunca altera a edição publicada. Preserve relatórios e artefatos.
