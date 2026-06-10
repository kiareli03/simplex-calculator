# Calculadora Simplex Gráfica

Calculadora de **programação linear** que resolve problemas com até 2 variáveis de decisão usando o **Método Simplex**, com visualização gráfica da região viável e do ponto ótimo.

Roda diretamente no navegador, sem dependências externas.

---

## Funcionalidades

- Maximização ou minimização da função objetivo
- Suporte a restrições com os sinais ≤, ≥ e =
- Até 6 restrições simultâneas
- Exibição do tableau final do Simplex
- Gráfico interativo com região viável, vértices e ponto ótimo destacado
- Histórico de cálculos salvo no navegador (localStorage)
- Perfil de usuário com nome personalizado

---

## Como usar

1. Clone o repositório:
   ```bash
   git clone https://github.com/kiareli03/simplex-calculator.git
   ```
2. Abra o arquivo `index.html` no navegador.
3. Na primeira visita, informe seu nome quando solicitado.
4. Preencha a função objetivo e as restrições.
5. Clique em **Resolver**.

---

## Páginas

| Rota | Descrição |
|---|---|
| `index.html` | Calculadora principal |
| `historico.html` | Histórico de cálculos realizados |
| `perfil.html` | Perfil do usuário |

---

## Estrutura do projeto

```
simplex-calculator/
├── index.html      # Página da calculadora
├── historico.html  # Página do histórico
├── perfil.html     # Página do perfil
├── simplex.js      # Algoritmo Simplex e cálculo de vértices
├── graph.js        # Renderização do gráfico no canvas
├── main.js         # Lógica da calculadora e modal de perfil
├── historico.js    # Lógica da página de histórico
├── perfil.js       # Lógica da página de perfil
├── style.css       # Estilo visual (tema escuro, responsivo)
└── PROJETO.md      # Documentação detalhada e roadmap
```

---

## Tecnologias

- HTML5
- CSS3
- JavaScript (Vanilla)
- Canvas API
- localStorage

---

## Documentação

Para uma descrição detalhada do funcionamento do algoritmo e o roadmap de melhorias futuras, consulte o arquivo [PROJETO.md](./PROJETO.md).

---

Desenvolvido por **Gabriel Chiareli**
