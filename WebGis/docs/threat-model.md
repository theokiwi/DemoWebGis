# Modelo de ameaças

Entradas externas são não confiáveis. Produção deve impor allowlist de origens e
formatos, limites comprimidos e expandidos, checksum, staging sem privilégios e
validação geométrica. A API valida e limita bbox/categorias, usa consultas parametrizadas,
papel somente leitura, timeout, rate limit, cabeçalhos defensivos e erros sem stack.
Texto externo é sempre renderizado como texto React, nunca com `innerHTML`.
