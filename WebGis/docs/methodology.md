# Metodologia

O índice combina, com pesos iguais, distância, oferta alcançável e vulnerabilidade.
Cada subindicador é normalizado por posto percentílico empírico, usando posto médio
nos empates e `(posto_médio - 1) / (n - 1)`. Com uma observação, retorna 0,5 e sinaliza
comparação insuficiente. Oferta e rendimento têm sentido invertido.

A dimensão econômica usa `V06006`, rendimento nominal mediano mensal das pessoas
responsáveis com rendimento, como proxy contextual. Ela não mede pobreza nem renda
domiciliar per capita. Cada modalidade de deslocamento escolhe independentemente o
destino de menor custo; empates usam o menor CNES lexical.

As faixas são quintis relativos. Empates que atravessam uma fronteira são promovidos
integralmente à faixa de maior risco. O resultado não é diagnóstico de suficiência.
