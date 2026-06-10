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

---

## Como usar

1. Clone o repositório:
   ```bash
   git clone https://github.com/kiareli03/simplex-calculator.git
   ```
2. Abra o arquivo `index.html` no navegador.
3. Preencha a função objetivo e as restrições.
4. Clique em **Resolver**.

---

## Estrutura do projeto

```
simplex-calculator/
├── index.html    # Interface da aplicação
├── simplex.js    # Algoritmo Simplex e cálculo de vértices
├── graph.js      # Renderização do gráfico no canvas
├── main.js       # Lógica da interface e integração
├── style.css     # Estilo visual (tema escuro)
└── PROJETO.md    # Documentação detalhada e roadmap
```

---

## Tecnologias

- HTML5
- CSS3
- JavaScript (Vanilla)
- Canvas API

---

## Documentação

Para uma descrição detalhada do funcionamento do algoritmo e o roadmap de melhorias futuras, consulte o arquivo [PROJETO.md](./PROJETO.md).

---

Desenvolvido por **Gabriel Chiareli**
