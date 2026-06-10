# Calculadora Simplex Gráfica

## O que é este projeto

Uma calculadora de **programação linear** que resolve problemas com até **2 variáveis de decisão** usando o **Método Simplex**. O usuário define a função objetivo e as restrições diretamente no navegador, e a calculadora exibe a solução, o tableau final e um gráfico da região viável com o ponto ótimo marcado.

Não depende de nenhuma biblioteca ou framework externo — é HTML, CSS e JavaScript puro.

---

## Como usar

1. Abra o arquivo `index.html` no navegador.
2. Na primeira visita, um modal solicita seu nome — ele é salvo no navegador para uso futuro.
3. Informe os coeficientes da **função objetivo** (Z = c₁x₁ + c₂x₂) e escolha entre **Maximizar** ou **Minimizar**.
4. Preencha as **restrições** (até 6). Cada restrição aceita os sinais ≤, ≥ ou =.
5. Clique em **Resolver**.

A calculadora mostra:
- Os valores ótimos de x₁ e x₂
- O valor de Z no ponto ótimo
- O número de iterações do Simplex
- O tableau da última iteração
- O gráfico com a região viável preenchida e o ponto ótimo destacado

Cada cálculo é salvo automaticamente no histórico, acessível pela navbar.

---

## Estrutura dos arquivos

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Página da calculadora (formulário, botões, canvas, modal de perfil) |
| `historico.html` | Página do histórico de cálculos |
| `perfil.html` | Página do perfil do usuário |
| `style.css` | Estilo visual compartilhado (tema escuro, navbar, layout responsivo) |
| `simplex.js` | Algoritmo Simplex, cálculo de vértices e geometria |
| `graph.js` | Desenho do gráfico no canvas (eixos, restrições, região viável) |
| `main.js` | Lógica da calculadora, salvamento no histórico e modal de primeiro acesso |
| `historico.js` | Leitura e renderização do histórico a partir do localStorage |
| `perfil.js` | Exibição e edição do perfil do usuário |

---

## Como o algoritmo funciona

### 1. Leitura das entradas
O `main.js` lê os coeficientes do formulário. Restrições do tipo ≥ são multiplicadas por −1 para ficarem na forma ≤. Restrições de igualdade são convertidas em dois pares (≤ e ≥).

### 2. Montagem do tableau
O `simplex.js` constrói o tableau inicial na forma padrão:

```
[ A | I | b ]
```

Onde `A` é a matriz de coeficientes das restrições, `I` é a identidade (variáveis de folga) e `b` são os lados direitos. A última linha contém a função objetivo com coeficientes negados.

### 3. Iterações do Simplex
A cada iteração:
- **Coluna pivô**: coluna com o valor mais negativo na linha objetivo (maior ganho potencial).
- **Linha pivô**: determinada pelo teste da razão mínima (evita que b fique negativo).
- **Pivoteamento**: a linha pivô é normalizada e depois usada para eliminar o elemento pivô de todas as outras linhas.

O processo repete até que não haja mais valores negativos na linha objetivo (solução ótima) ou até detectar problema ilimitado (sem linha pivô válida).

### 4. Extração da solução
Os valores de x₁ e x₂ são lidos a partir das variáveis na base final. O valor de Z vem diretamente da última célula da linha objetivo.

### 5. Cálculo dos vértices
O `simplex.js` também calcula os vértices da região viável testando todas as interseções entre pares de restrições e entre cada restrição e os eixos. Os pontos que satisfazem todas as restrições e são não-negativos são mantidos. Duplicatas são removidas.

### 6. Desenho do gráfico
O `graph.js` usa a API Canvas do HTML5 para desenhar a grade, os eixos, as retas de cada restrição (tracejadas e coloridas), a região viável preenchida (fecho convexo dos vértices), a reta da função objetivo no ponto ótimo e o ponto ótimo destacado.

### 7. Histórico e perfil
Cada cálculo realizado pelo usuário é serializado em JSON e armazenado no `localStorage` do navegador sob a chave `simplex_history`. O nome do usuário é armazenado sob `simplex_name`. As páginas de histórico e perfil leem essas chaves diretamente ao carregar.

---

## Limitações da versão atual

- Suporta apenas **2 variáveis de decisão** (x₁ e x₂). O gráfico 2D é a razão principal desta limitação.
- Máximo de **6 restrições**.
- Não trata problemas com **múltiplas soluções ótimas**.
- Não exibe o **passo a passo** das iterações do Simplex — apenas o tableau final.
- Não aceita variáveis que possam ser **negativas** (assume x₁, x₂ ≥ 0).
- O histórico é local por navegador — não sincroniza entre dispositivos.

---

## Melhorias para versões futuras

### Interface e usabilidade
- [ ] **Passo a passo das iterações**: exibir cada tableau intermediário com o pivô destacado, explicando a escolha.
- [ ] **Entrada por fórmula em texto**: permitir digitar restrições no formato `6x1 + 4x2 <= 24` em vez de campos separados.
- [ ] **Exportar resultado**: botão para baixar o resultado e o tableau como PDF ou imagem PNG.
- [ ] **Modo claro/escuro**: alternar entre temas.
- [ ] **Recarregar cálculo do histórico**: clicar em um item do histórico e restaurar os dados na calculadora.

### Algoritmo e funcionalidades matemáticas
- [ ] **Suporte a 3 variáveis**: resolver e exibir a região viável em 3D usando WebGL ou Three.js.
- [ ] **Método das Duas Fases**: tratar problemas que precisam de variáveis artificiais (restrições com ≥ ou = sem solução inicial viável óbvia).
- [ ] **Método Big-M**: alternativa ao método das duas fases para problemas com variáveis artificiais.
- [ ] **Análise de sensibilidade**: mostrar o intervalo em que os coeficientes da função objetivo ou os lados direitos podem variar sem mudar a base ótima.
- [ ] **Detecção de múltiplas soluções ótimas**: identificar e listar todos os pontos ótimos quando a função objetivo é paralela a uma restrição ativa.
- [ ] **Problema dual**: gerar e resolver automaticamente o problema dual a partir do primal informado.

### Qualidade e manutenção
- [ ] **Testes automatizados**: adicionar uma suite de testes (ex: com Vitest ou Jest) cobrindo casos como solução única, ilimitado, inviável e múltiplas soluções.
- [ ] **Validação de entradas**: alertas mais detalhados indicando exatamente qual campo está com valor inválido ou inconsistente.
- [ ] **Responsividade melhorada**: layout adaptado para telas pequenas (mobile), com o gráfico redimensionável.
- [ ] **Sincronização em nuvem**: salvar histórico e perfil em um backend para acessar de qualquer dispositivo.
- [ ] **Internacionalização**: suporte a inglês e espanhol além do português.
