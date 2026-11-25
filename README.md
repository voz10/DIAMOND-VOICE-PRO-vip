# DV PRO

Estúdio digital de treino vocal construído sobre o material didático
**"Resistência Vocal para o Palco — 12 semanas"**, do Prof. Alê da Voz
(samba, pagode e gospel ao vivo).

É um **PWA offline-first**: depois do primeiro acesso funciona sem internet.
Nenhum dado sai do aparelho. Nenhuma API paga, nenhuma biblioteca de samples
comercial — todo o áudio é sintetizado em tempo real com Web Audio, e a
narração é composta por clipes de voz humana em português do Brasil
gerados para este projeto.

---

## Como rodar

```bash
node server.js 3000      # servidor estático sem dependências
# abra http://localhost:3000
```

Para rodar a suíte de testes (precisa do Playwright):

```bash
node tests/browser.test.mjs      # HEAD=1 para ver o navegador
```

---


---

## Motor de Inteligência Artificial Local (DV PRO AI v3)

Sistema especialista local (**sem nuvem, sem custos de API, 100% no aparelho**):
- **Leitura profunda do áudio gravado (`ia/analiseTake.js`)**: mede envelope de intensidade (20 ms), segmentação de frases e respirações reais, afinação janela a janela (MPM), extensão útil por percentis (p5–p95), estabilidade da emissão, variação fina de altura (jitter), tremor de intensidade (shimmer), clareza periódica, taxa/extensão de vibrato por autocorrelação e sustentação máxima;
- **Dossiê completo de evidências (`ia/coletor.js`)**: consolida prática, 39 exercícios, medições (/s/, /z/, mapa vocal, afinação, jogos), gravações, tarefas do caderno, diário vocal semanal, repertório e hábitos de saúde;
- **12 indicadores calculados (`ia/metricas.js`)**: constância de prática, cobertura do roteiro, fôlego (/s/ e razão s/z), afinação, estabilidade, uso do fôlego nas frases, projeção e dinâmica, extensão vocal, caderno de tarefas, resistência de palco, repertório/setlist e saúde vocal, com nota global ponderada (0–100) e classificação de confiança;
- **Redação profissional (`ia/texto.js`)**: resumo executivo, evolução com 4 gráficos e tendências estatísticas (r²), análise semanal automática do Diário Vocal (T7), análises pedidas em cada tarefa do Caderno (T1 a T8, incluindo mapas de respiros por música e teste de tons de T4), balanços de fase 1, 2 e 3 e plano de ação ordenado por prioridade;
- **Gravação segura no caderno (`ia/preencher.js`)**: preenche apenas os campos analíticos gerados pelos dados, respeitando rigorosamente os campos subjetivos do aluno;
- **Comparativo de turma (`ui/ia.js`)**: analisa cada aluno da turma separadamente com classificação por necessidade de atenção.

## O que realmente funciona

### Cada treino começa pela explicação
Antes de qualquer execução, a **voz explica o exercício em linguagem de quem
nunca estudou canto**: *o que é*, *para que serve* e *o que você deve sentir*.
O texto fica na tela ao mesmo tempo, então dá para ler e ouvir juntos.

- Textos autorais para **todos os 39 exercícios** (`src/js/data/explicacoes.js`).
- Narração gravada em português do Brasil (`src/assets/voice/ex-*.mp3`).
- Onde o clipe ainda não existe, o treino segue normalmente com o texto escrito
  e um selo "narração em breve" — nunca trava, nunca dá erro.
- Também vale para as rotinas: cada item anuncia e explica o exercício.

### Áudio (tudo sintetizado, nada de samples prontos)
| Módulo | O que faz de verdade |
|---|---|
| `audio/engine.js` | Contexto de áudio, barramentos (`music`, `click`, `voice`), reverb por convolução gerada por código, master, medição |
| `audio/piano.js` | Piano de 88 teclas por síntese aditiva: parciais com desafinação (inharmonicidade), ruído de martelo, decaimento por registro, ressonância simpática e pedal de sustentação |
| `audio/instruments.js` | Tons de referência, drones (fundamental/quinta/oitava/acorde), sinos, 5 timbres de clique de metrônomo |
| `audio/metronome.js` | Agendamento por *lookahead* no relógio do `AudioContext` — precisão de amostra, não atrasa em máquina lenta. Compassos simples e compostos, subdivisões, tercinas, aceleração progressiva, *tap tempo* |
| `audio/pitch.js` + `pitch-worklet.js` | Detector de altura próprio (MPM / autocorrelação normalizada) em `AudioWorklet`, com fallback para `AnalyserNode`. Devolve Hz, nota, cents, clareza, estabilidade e segmenta as notas cantadas |
| `audio/recorder.js` | `MediaRecorder` com AGC/eco/supressão de ruído desligados (para não mascarar a voz), medidor de nível, teto de 20 min, análise de RMS/pico e forma de onda |
| `audio/voice.js` | Narração humana em pt-BR por clipes MP3 agendados no tempo exato do áudio. Contagem "um, dois, três, quatro" separada por detecção de silêncio |

### Telas (16 rotas)
| Rota | Conteúdo |
|---|---|
| `/painel` | Painel do dia: fase do programa, minutos, streak, tarefas da semana |
| `/aulas`, `/aulas/1..8`, bônus | As 9 lições com os slides correspondentes |
| `/exercicios` | Biblioteca dos 39 exercícios (E1.1 – E7.5) com busca e filtros |
| `/exercicios/E1.1` | Execução guiada: linha do tempo com voz, metrônomo, contagem e cronômetro |
| `/rotinas` | 5 rotinas prontas (Completa, Mínima, Pré-show, Pós-show, Entre shows) + construtor de rotina própria |
| `/slides` | 46 lâminas do material, indexadas, pesquisáveis, com destaque e modo leitura |
| `/piano` | Piano de 88 teclas, oitavas, transposição, presets, notação BR/Científica, teclado do computador |
| `/metronomo` | Metrônomo completo com luzes de compasso e aceleração progressiva |
| `/pitch` | Laboratório de afinação ao vivo: nota, cents, agulha, rolo da afinação e resumo estatístico |
| `/gravar` | Gravador com forma de onda, reprodução, anotações, marcação de "referência" e exportação |
| `/ferramentas` | Drones, tons, escalas, arpejos, diapasão, razão s/z e mapa vocal |
| `/caderno` | Caderno de tarefas T1–T8 com campos dinâmicos e validação |
| `/repertorio` | Repertório com semáforo e montagem de setlist aplicando as regras do material |
| `/progresso` | Gráficos reais (minutos/semana, acumulado, 30 dias), medições e conquistas |

### Experiência de estúdio
- **Próximo passo**: o painel diz exatamente o que fazer agora, nesta ordem
  — segurança (avaliar com otorrino/fono) → treinar → completar os minutos →
  tarefa da semana → encerrar o dia.
- **Modo foco** (tecla `F`): apaga o resto da tela e deixa só o palco do treino.
- **Favoritos**: estrela em qualquer exercício + filtro "só favoritos".
- **Seletor de microfone** para interfaces de áudio externas.
- **Chip de narração** na barra lateral: quantos clipes estão instalados e
  quantos ainda estão baixando.
- **Impressão** do caderno, do setlist e do relatório de evolução.
- **Atalhos** completos (`H` abre a ajuda): busca `Ctrl/⌘+K`, metrônomo
  `Espaço`, navegação `1…9`, `Esc` fecha tudo.
- Fundo ambiente, cartões com luz superior, entrada animada das telas e
  tipografia em gradiente.

### Dados e persistência
- **IndexedDB** (`vocal-studio-pro`): estado, blobs e gravações.
- `core/store.js`: estado reativo com autosave de 450 ms, migração por versão
  e derivações (semana atual, minutos semanais, streak, tarefas).
- Exportar/importar JSON completo para backup.

### Conteúdo interligado
`src/js/data/course.js` (88 KB, gerado a partir do PDF e dos slides) é a fonte
única: **39 exercícios, 9 lições, 5 rotinas, 46 slides, 8 tarefas, 12 semanas
de plano, semáforo, escala de intensidade 1–5, glossário, regras de progressão
e regras de segurança**. Nenhum texto foi inventado.

---

## Segurança (regra do material, aplicada no código)

- O app **nunca** diagnostica lesão, nódulo, edema ou doença.
- Todo relatório termina com: *material educativo, não substitui avaliação de
  otorrinolaringologista e fonoaudiólogo*.
- Dor ao cantar, falha súbita ou rouquidão por mais de 2 semanas → o sistema
  orienta a parar e procurar um otorrino.
- A razão s/z acima de 1,4 gera aviso, mas sempre como *sinal a observar e
  conversar com o professor*, nunca como diagnóstico.
- O sistema assiste o professor; **não** substitui o Prof. Alê da Voz.

---

## Arquitetura

```
index.html            shell, boot e PWA
sw.js                 service worker (offline-first)
manifest.webmanifest  PWA (ícones gerados em src/assets/icons/)
server.js             servidor estático zero-dependência (Range, SPA, HEAD)
src/css/app.css       design system (paleta canônica escura)
src/js/
  main.js             boot, router por hash, navegação, busca global, atalhos
  data/course.js      conteúdo do material (fonte única)
  core/               util.js · idb.js · store.js
  audio/              engine · piano · instruments · metronome · pitch
                      · pitch-worklet · recorder · voice
  music/theory.js     notas, escalas, acordes, cents, padrões
  ui/                 as 16 telas + charts.js + icons.js
src/assets/voice/     clipes de narração + manifest.json
scripts/              gerador do manifesto de áudio
tests/browser.test.mjs  119 asserções end-to-end em Chromium real
```

---

## Testes

**336 asserções end-to-end + 91 de teoria musical, 0 falhas.**

A suíte roda em Chromium de verdade (Playwright) e cobre:

boot e onboarding · renderização das 16 rotas · integridade do curso
(39 exercícios com passo a passo e meta, rotinas sem referência quebrada) ·
piano (88 teclas, síntese offline, frequência medida por cruzamento de zero) ·
metrônomo (cadência medida, 120 BPM ± 25) · detecção de afinação (Dó4, cents) ·
clipes de voz (servidos, decodificados, contagem em 4 partes) ·
treino guiado (linha do tempo e cronômetro) ·
explicação falada de cada exercício (segmento de abertura, painel, clipe) ·
ciclo do aluno (treinar → registrar → evoluir) ·
**auditoria que clica em todos os botões de todas as telas** ·
favoritos · acessibilidade (nenhum botão sem nome) ·
próximo passo · modo foco · impressão · atalhos ·
PWA (manifesto, ícones, service worker, navegação offline) ·
persistência em IndexedDB · responsivo em 390/820/1440 px ·
sanidade visual (tamanhos e alturas medidas) · console limpo.

---

## Estado da narração

| Grupo | Clipes | Situação |
|---|---|---|
| Chamadas universais (inspire, solte, sustente, contagem…) | 10 | ✅ completas |
| Exercícios E1.1 – E7.5 (todos) | 39 | ✅ gravados |


A explicação **escrita** já existe para os 39. Para adicionar narração:
grave `src/assets/voice/ex-<CÓDIGO>.mp3` e rode
`node scripts/gerar_manifesto_voz.mjs` — o app passa a usá-la automaticamente.
Sem o arquivo, ele usa as chamadas universais e nunca quebra.
