# Documento de Requisitos: Simulador de Atração 8-Arquétipos

## 1. Estrutura de Navegação (State Machine)

O app deve gerenciar 5 estados de visualização:

1. `INTRO`: Fase 0 (Boas-vindas sem viés).
2. `REACTIVE_GAME`: Fase 1 (Cenários rápidos).
3. `DECLARATIVE_SURVEY`: Fase 3 (O que ela diz querer).
4. `DIAGNOSTIC_MIRROR`: Fase 4 e 5 (Gráfico de Radar + Texto de Consequência).
5. `RETEST`: Fase 6 (Validação final).

## 2. Lógica de Scoring (Fase 2)

- Criar um objeto userPulse (escolhas rápidas) e userIdeal (escolhas racionais).
- Cada opção nos cenários deve ter um impactWeight (0.5 a 2.0) baseado na gravidade do comportamento.
- **Cálculo de Inconsistência**: Se userPulse.Narcissistic > 2 e userIdeal.Security > 4, disparar o gatilho de "Dissonância de Atração".

## 3. UI/UX (Fase 1)

- Utilizar componentes que simulem interfaces reais:
 - Chat View: Mensagens subindo com delay simulado (0.8s).
 - Profile Cards: Estilo Tinder para os cenários de App.
 - POV Image Placeholders: Descrições ricas que evoquem a sensação de estar no lugar.

## 4. Gráfico de Radar (Fase 4)

- Utilizar biblioteca leve de gráficos para plotar dois datasets sobrepostos:
 - **Dataset A (Linha Sólida)**: O que ela realmente escolheu (Instinto).
 - **Dataset B (Linha Pontilhada)**: O que ela disse que valoriza (Idealização).
 - O contraste visual entre as duas áreas do gráfico é o diagnóstico principal.

## 5. Gatilhos de Tradução (Fase 5)

- Mapear os 3 maiores scores e gerar o texto de "Consequência Relacional".
- Se Narcisista + Inconsistente estiverem no Top 3: Texto focado em "Ciclo de Ansiedade e Dopamina".
- Se Seguro + Consistente estiverem no Top 3: Texto focado em "Prontidão para Estabilidade".