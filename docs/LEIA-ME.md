# Home Movimento Bahia pela Educação: protótipo v3 — "O caderno de cada município"

Esfera Informática · 05/11/2026 · Evolução da v1 (home e navegação). Sem páginas internas e sem backend.

## 1. Como revisar

- **Prévia em arquivo único:** `dist/previa-home-movimento.html`, abre direto no navegador. Também há um link privado no claude.ai (ver resposta da entrega).
- **Código-fonte:** `index.html` + `assets/`. Sirva com `python3 -m http.server` na pasta.
- **Notas de revisão:** botão amarelo no canto inferior direito, ou `?revisao` na URL. Ficam agrupadas em **Confirmado**, **Provisório** e **Ilustrativo/não validado**.
- **Versões anteriores preservadas:** `versoes/v1-2026-11-05/` e `versoes/v2-2026-11-05/`. Os links da v1 e da v2 continuam ativos.
- **Capturas (v3):** `docs/capturas/home-desktop-1440.jpg`, `home-mobile-390.jpg`, `capa-1440x900.png` e `folha-quixabeira-1440.png`.


## v3 — "O caderno de cada município" (05/11/2026)

A v3 é uma proposta alternativa. **A v2.6 continua intacta**, com link e arquivos próprios. Usa os mesmos menus, nomes do mapa do site, dados, rótulos, notas de revisão e cuidados de acessibilidade.

- **Capa do caderno (no lugar da abertura):**
  - "417 municípios. Uma meta.", com a meta de 80% para 2030 e o ICA 2025 de 56%, citando a fonte;
  - a pergunta "Qual é o seu município?", com busca nos 417 municípios. Quando o nome digitado é ambíguo (ex.: "Feira"), aparecem as opções;
  - o mapa real da Bahia (malha IBGE), clicável. Os municípios com alguma informação publicada aparecem hachurados;
  - papel pautado com margem vermelha, data e pergunta escritas à mão, e o contorno do estado desenhado como um traço de lápis.
- **Folha do município:** abre na própria home, com endereço próprio (`?municipio=quixabeira`) e o botão "Copiar o link desta folha". Tem quatro lições:
  1. **Como estamos:** régua com o município, a Bahia (56%) e a meta (80%);
  2. **O que já fizemos juntos:** checklist com Prêmio, Doc, PAR e encontros;
  3. **Próxima lição:** Prêmio em 27/11 e encontros de 2027;
  4. **Para estudar:** atalhos para os materiais.
- **Só dados publicados:** 28 municípios têm alguma informação (PAR, encontros e Prêmio pelo Portal FIEB; ICA municipal pelo modelo Lovable, a validar).
  - **Quixabeira:** mostra "70% ou mais", o critério do nível Ouro, sem inventar o valor exato.
  - **Municípios sem dados:** a folha mostra "Ainda não temos o ICA" e "PAR: ainda sem registro (a lista publicada é parcial)", além do encontro de 2026 mais próximo, marcado como realizado.
  - **Fontes:** cada folha lista as suas fontes.
- **Valores de exemplo:** a consulta da Lição 2 deixou de mostrar valores gerados para demonstração. Agora ela também abre a folha.
- **"Por onde começar?" + Sumário do caderno:** os perfis continuam, e ao lado entra o sumário com as 8 lições, que levam às seções.
- **Lições numeradas:** cada seção da v2.6 ganhou o número da lição, escrito à mão no rótulo. O conteúdo não mudou.
- **Movimento:**
  - escrita à mão e traço do mapa animados uma única vez;
  - com redução de movimento, tudo aparece pronto;
  - o mapa funciona com mouse e toque, e pelo teclado o caminho é a busca.
- **Para o Laravel:** os dados das folhas são gerados por `build.py` (`window.MBE_FOLHAS`). Na versão dinâmica, virão do Observatório/BI. A rota pode ser `/municipios/{slug}` ou `?municipio=`.
- **Verificações:**
  - sem rolagem horizontal de 320 a 1920 px;
  - sem erros de console;
  - os 144 links fixos têm destino;
  - a busca trata nome inexistente e nome ambíguo;
  - a folha abre pela capa, pelo mapa, pelos atalhos, pela consulta da Lição 2 e pelo endereço direto;
  - com redução de movimento, nada fica oculto;
  - a prévia em arquivo único funciona.

## Mudanças da v2.6 (ajustes pedidos na revisão)

- **"Por onde começar?":** deixou de ser cartão com sombra e passou a ser uma faixa no fluxo da página, logo abaixo da abertura.
  - Título e subtítulo ficam à esquerda (a partir de 1280 px) e as abas à direita.
  - As abas são texto com sublinhado em degradê da marca.
  - Os atalhos seguem o padrão "link →" usado no resto do site.
  - Abaixo de 1280 px tudo fica em uma coluna; no celular, as abas rolam na horizontal.
  - O teclado continua funcionando: setas, Home e End.
- **"Mapa da atuação / Nossos resultados":** o link foi para a direita do título da seção, como nas demais.
- **Instituições integrantes:** a grade de nomes virou um carrossel de logos.
  - **Controles:** botões anterior/próximo e Pausar/Reproduzir.
  - **Avanço automático:** a cada 3 s. Ele pausa com o mouse em cima, com o foco do teclado, fora da tela ou com a aba oculta, e fica desligado quando o sistema pede menos movimento.
  - **Rolagem:** também funciona com toque, trackpad e as setas do teclado.
  - **Acessibilidade:** cada logo tem como texto alternativo o nome completo da instituição.
  - **Logos:** 10 dos 12 foram copiados dos sites oficiais (`assets/img/logos/`).
  - **Sem logo ainda:** SEC e Cátedra Sérgio Henrique Ferreira aparecem com o nome em texto até chegarem os arquivos oficiais.
  - **Recortes:** retirei os selos comemorativos de SESI ("80 anos"), Undime ("40 anos") e TCM ("55 anos"). Nada foi redesenhado.
  - **Uso provisório:** o uso definitivo depende dos arquivos oficiais e da autorização de cada instituição (RN07). A régua de marcas do manual e o local definitivo (rodapé ou Quem somos, PA17) continuam em aberto.

## Mudanças da v2.5 (ajustes pedidos na revisão)

- **Caderno da abertura:** voltou a linha "Bahia", em vermelho, escrita por último.
- **"Por onde começar?":** virou um cartão em destaque, sobreposto à borda da abertura, com título maior em roxo e subtítulo. As abas ficaram maiores e cabem em uma linha no desktop; os atalhos viraram botões.
- **Espaços em branco:**
  - "Nossa atuação em números": o mapa fica ao lado dos três números principais, e formações e satisfação ganharam uma linha própria em duas colunas;
  - "Acontece no Movimento": agenda ao lado da notícia de destaque, e as 4 publicações do Instagram em uma linha de 4 colunas abaixo.
- **Instagram:** novo cabeçalho com ícone, rótulo "No Instagram", o @ como link e a nota "Seleção manual de publicações".

## Mudanças da v2.4 (itens dos requisitos que faltavam)

- **Caminhos por público (item 4.3 dos requisitos):** a faixa "Por onde começar?", logo abaixo da abertura, tem abas acessíveis: Sou educador, Sou gestor público, Represento uma instituição, Sou da imprensa e Quero contribuir. Cada aba leva às páginas que o requisito indica para aquele perfil. No teclado, as setas trocam de aba e Home/End vão para a primeira e a última. No celular, as abas rolam na horizontal.
- **Perguntas do RF02 como títulos:** "Como está a Bahia?" (já existia), "Como podemos ajudar?" (Como atuamos) e "Como podemos ajudar educadores?" (Nossas formações).
- **Banner de cookies (RF43):**
  - opções Aceitar todos, Recusar opcionais e Configurar (necessários, métricas e conteúdos externos);
  - link para a política de privacidade;
  - a escolha fica gravada no navegador e pode ser reaberta em "Preferências de cookies", no rodapé;
  - no desktop o banner aparece como cartão no canto direito e não cobre as chamadas da abertura (conferido em 1366×657); no celular ocupa a parte de baixo da tela;
  - nesta prévia o registro é só local; na versão dinâmica o consentimento vai para o servidor.
- **Metadados dos indicadores (RN02):** a régua do ICA mostra fonte, ano de referência, data de atualização e o link "Como o ICA é medido". Evolução do ICA, IDEB e os resultados têm uma linha de fonte com a data. A data vem de `atualizado_em` em `data/indicadores.json`.
- **Modo apresentação:** abra com `?apresentacao` para esconder o botão de notas. Use `?semcookies` para não mostrar o banner e `?cookies` para mostrá-lo de novo.

## Mudanças da v2.3 (legendas)

- Nenhuma legenda fica mais sobre a foto. Na abertura, a legenda aparece abaixo da foto e do caderno, sem sobreposição. Na frente de encontros, ela ganhou uma faixa própria sob a imagem.
- O teste automático confirma, em 1440, 1024 e 390 px, que nenhuma legenda encosta em foto, moldura ou caderno.

## Mudanças da v2.2 (ajustes de diagramação e paleta)

- **"O que é o Movimento":** texto e foto lado a lado, com visão e propósito em duas colunas logo abaixo. Acabou o vazio à direita.
- **Frentes:** o PAR virou uma ficha (carga horária, formato, público) e as datas dos encontros ficaram em duas colunas. Os dois cartões agora têm alturas equilibradas.
- **Formações:** o curso com foto ocupa a linha inteira e nenhuma célula fica vazia, de 1024 a 1440 px.
- **Paleta das redes sociais,** amostrada dos posts do @bahiapelaeducacao: roxo #452C87, magenta #BD328B e amarelo #F8C000.
  - Faixa "Como está a Bahia?" em degradê roxo-magenta, com meta e destaques em amarelo.
  - "Participe" no mesmo degradê dos posts, com a assinatura branca e o arco.
  - Faixa do Instagram em cartão roxo.
  - Toques de magenta e amarelo na agenda, no mapa e na moldura da foto da abertura.
  - Contrastes calculados: amarelo sobre roxo 6,4:1; branco sobre magenta 5,3:1.
- **Inscrições:** o cartão lista os tipos de formação disponíveis (PAR, encontros, cursos on-line), sem espaço vazio.

## Mudanças da v2.1 (05/11/2026, a partir das decisões do responsável)

- **Fotos reais de adultos**, publicadas pelo Sistema FIEB e pelo Movimento, com crédito visível:
  - abertura: encontro territorial;
  - frente de encontros: Feira de Santana;
  - "O que é o Movimento": capacitação na FIEB;
  - notícia de destaque: reunião de balanço;
  - curso: Fernando Lauria.

  Na abertura, o caderno de alfabetização passou a ser um detalhe sobre a foto.
- **ICA 2025 = 56%**, valor publicado pelo Movimento e adotado por decisão do responsável. A distância até a meta passou a 24 p.p. O conflito com os 55% da FIEB, da imprensa e do Lovable está registrado.
- **"Nossa atuação em números" com dados reais da FIEB:** 254 de 417 municípios representados nos encontros, cerca de 1.800 professores no PAR, 1.154 participantes e 10 encontros formativos. Só a satisfação continua ilustrativa, com a identificação na tela.
- **O mapa deixou de ser simulação.** Mostra as 7 cidades-sede de 2026, os municípios do PAR citados pela FIEB (lista parcial) e os 3 vencedores Ouro do Prêmio.
- **PAR:** carga horária, público e forma de atuação conforme a FIEB.
- **Encontros territoriais:** as 7 datas de 2026.
- **Prêmio:** 1ª edição (Ouro) e 2ª edição em 27/11.
- **Agenda:** Prêmio em 27/11 (próximo); aula de 13/10/2026 e encontro em Salvador em 09/06 (realizados).
- **Notícias:** matéria da FIEB e 4 posts reais do Instagram, todos com link.
- **Faixa do Instagram:** 6 posts reais, marcada como "Seleção manual".
- **Curso de Alfabetização Inclusiva:** ano 2026 e professor Fernando Lauria.
- **Fale conosco:** inclui o Instagram @bahiapelaeducacao. O telefone continua pendente.
- **Pontos a conferir com o Movimento:**
  - "Encontro de lideranças 2024" no mapa × "I Ciclo de Seminários" de nov/2025 na FIEB;
  - criação em agosto de 2025 (requisitos) × lançamento oficial em outubro de 2025 (FIEB);
  - link exato do Doc de Quixabeira no YouTube do SESI Bahia.

Detalhes completos em `docs/indicadores.md`.

## 2. O que mudou da v1 para a v2

1. **Abertura**
   - Os 80% agora vêm com o selo **"Nossa meta para 2030"**, para não parecer resultado alcançado.
   - Proporções reduzidas: em 1366×768 (área útil ≈ 1366×657) título, texto e botões cabem na primeira dobra. Medido: os botões terminam em 640 px.
   - A moldura provisória virou uma **ilustração editorial**: caderno de alfabetização ("Aa Bb Cc Dd", "ba be bi bo bu", "Bahia"), lápis e o contorno real da Bahia com "417 municípios, uma meta".
2. **O desafio da Bahia**
   - Régua comparativa: ICA 2025 = 55% × meta 80%, com a distância de **25 p.p.** marcada.
   - Barras do ICA 2023–2025 com as metas intermediárias do MEC.
   - IDEB em um bloco separado, com escala própria de 0 a 10.
   - Consulta por município com resultado na hora e origem identificada (dados Lovable ou valor de exemplo).
   - Não há conexão simulada com o BI.
3. **Nova seção "Nossa atuação em números"**, ligada a *Mapa da atuação / Nossos resultados*.
   - Mapa real da Bahia com os 417 municípios (malha IBGE), dos quais 132 aparecem destacados como simulação.
   - Números organizados por hierarquia: municípios em destaque; professores e gestores lado a lado; formações com a composição do total; satisfação com escala, número de respostas e distribuição.
4. **Atuação × formações sem repetição**
   - "Como atuamos" explica as frentes.
   - "Oportunidades e histórico" mostra o status de cada item: inscrições abertas (exemplo demonstrativo), encerrada, realizados e evolução futura.
5. **Curso de Alfabetização Inclusiva**
   - Aparece como **Encerrado**, com "ano a confirmar", porque o formulário não informa o ano.
   - A chamada aponta para uma página específica da formação (`/nossas-acoes/formacoes/alfabetizacao-inclusiva`, modelo RF18), e não mais para a listagem geral.
6. **Agenda, notícias e Instagram preenchidos**
   - Conteúdos reais referenciados: lançamento no Portal FIEB, vídeo no YouTube, encontros de 2025, aulas do curso.
   - Exemplos marcados na tela como "Exemplo demonstrativo".
   - A grade do Instagram está marcada como "Prévia de layout · integração não ativa".
7. **Doc de Quixabeira:** composição editorial provisória com tipografia e a localização real de Quixabeira no mapa. Não usa foto genérica.
8. **Correção:** o menu completo passou a aparecer a partir de **1280 px**. Na v1, a verificação a 1200 px foi feita antes de as fontes carregarem e não detectou um estouro real de cerca de 50 px. Agora o teste espera as fontes.

## 3. Imagens e recursos visuais

| Recurso | Origem | Uso |
|---|---|---|
| Logo e assinatura "A Bahia aprende com a Bahia" | Arquivos oficiais do projeto (vetores extraídos sem redesenho) | Cabeçalho, rodapé, Participe |
| Mapa da Bahia (contorno e 417 municípios) | IBGE, malha municipal, via geodata-br (licença **CC0**). Arquivo: `data/geo/` | Abertura, encontros, resultados, Doc |
| Ilustrações do caderno, aula do PAR, Doc e grade do Instagram | Criadas em HTML/CSS para o protótipo, de uso livre | **Provisórias.** Substituir por fotos oficiais autorizadas |
| Logos das instituições integrantes (10) | Sites oficiais de cada instituição (Governo da Bahia, MP-BA, TCE-BA, TCM-BA, UPB, FIEB, FETRABASE, SEBRAE, SESI, Undime), sem redesenho | **Provisórios.** Substituir pelos arquivos oficiais autorizados (RN07) |
| Fontes Montserrat, Source Sans 3 e Caveat | Google Fonts / Fontsource, licença OFL, hospedadas localmente | Substitutas de TCCC Unity e Myriad Pro. A Caveat aparece só nas ilustrações |

(v2) Não usei fotografia de banco de imagens. Na v2.1 entraram fotos oficiais de adultos, com crédito (ver `indicadores.md`). Nenhuma imagem mostra crianças identificáveis (RN04).

## 4. Efeitos e microinterações

| Onde | Efeito | Executa |
|---|---|---|
| Abertura | O "80%" entra com o degradê da marca; o caderno surge e as linhas são "escritas" em sequência; lápis e selo entram em seguida | Uma vez, ≈3 s, sem bloquear a leitura do texto ao lado |
| Fio da marca | O arco da assinatura se desenha sob a abertura; o traço colorido dos rótulos de seção cresce ao entrar na tela | Uma vez |
| Títulos e grupos | Entrada curta de baixo para cima; listas entram em cascata (70 ms por item) | Uma vez por elemento |
| Régua do ICA | Preenche até 55%, depois aparecem a marca da meta, a distância (25 p.p.) e os rótulos | Uma vez |
| Barras do ICA | Crescem em sequência; a meta intermediária aparece depois | Uma vez |
| Mapa de resultados | Os municípios destacados acendem a partir das cidades-sede | Uma vez |
| Números | Contagem até o valor final. O valor final fica no HTML e no texto para leitores de tela | Uma vez |
| Barras de resultados | Crescem da esquerda para a direita | Uma vez |
| Mapa de encontros | Pinos entram em sequência | Uma vez |
| Menus | Painel desktop com fade e deslize (180 ms), itens em cascata; gaveta mobile desliza (240 ms); acordeões, busca e avisos com entrada curta | A cada abertura e fechamento |
| Carrossel de logos (v2.6) | Avança um logo a cada 3 s | Só com a seção visível; pausável |
| Botões e links | Elevação leve, sublinhado que cresce e seta que avança. Os mesmos estados valem para `:focus-visible` e há estado de toque (`:active`) | Interação |

**Proteções**

- Com `prefers-reduced-motion` nada anima e todo o conteúdo aparece no estado final.
- Sem JavaScript, ou se o script falhar, as animações são desligadas após 3 s.
- Não há rolagem controlada nem parallax. O único avanço automático é o do carrossel de logos (v2.6): um passo a cada 3 s, com botão Pausar, pausa no mouse e no foco, e desligado com `prefers-reduced-motion`.

## 5. Proposta de nomenclatura pública (não aplicada; requer aprovação)

| No mapa (mantido no menu) | Proposta para o visitante | Motivo |
|---|---|---|
| Quem somos — carômetro | Quem somos | "Carômetro" descreve o formato da página, não o conteúdo |
| PAR — mapa e conteúdos das aulas | PAR · Programa de Alfabetização Responsável | Nome completo; mapa e aulas são abas da página |
| Indicadores — BI | Indicadores dos municípios | "BI" é termo técnico; o link externo continua sinalizado com ↗ |
| Mapa da atuação / Nossos resultados | Nossos resultados | Escolher um único nome |
| Movimento na mídia / Imprensa | Imprensa (ou Movimento na mídia) | Pendência PA19 |
| Plataforma formativa — evolução futura | Plataforma formativa (selo "Em breve") | O termo "evolução" é interno |

## 6. Verificações realizadas (Chrome headless/Playwright, com espera do carregamento das fontes)

- **Rolagem horizontal:** nenhuma em 320, 360, 390, 768, 1024, 1279, 1280, 1366, 1440 e 1920 px. Também não há elementos fora da tela, exceto a ponta do lápis da ilustração, que fica recortada dentro da abertura.
- **Primeira dobra:** a 1366×657 os botões terminam em 640 px.
- **Menus:**
  - todos os submenus desktop abrem com transição;
  - Seta ↓ leva o foco ao primeiro item;
  - Esc fecha e devolve o foco ao botão;
  - o menu mobile abre e fecha com transição, mantém o foco dentro do painel e Esc devolve o foco ao botão "Menu".
- **Animações:** depois de rolar a página inteira, todos os blocos animados ficaram visíveis. Os contadores terminam exatamente nos valores de `indicadores.json`. Na v2.1: 254, 1.800, 1.154, 10 e 4,6.
- **Redução de movimento:** com `prefers-reduced-motion` nenhum elemento fica oculto ou transparente.
- **Consulta por município:**
  - Salvador mostra um valor de exemplo identificado como tal;
  - Licínio de Almeida mostra o valor do Lovable com a origem;
  - nomes inválidos geram aviso.
- **Links (v2.4):** os 143 links têm destino definido. Os links externos (FIEB e Instagram) abrem em nova aba.
- **v2.6:**
  - sem rolagem horizontal em 390 e 1366 px;
  - as abas dos perfis cabem sem corte de 1000 a 1920 px;
  - os 10 logos carregam;
  - o carrossel avança sozinho, para com o foco e não avança com redução de movimento;
  - anterior/próximo e as setas do teclado funcionam;
  - os 144 links continuam com destino.
- **Console:** sem erros.
- **Imagens (v2.1):** todas as fotos são arquivos locais e carregaram por completo depois de rolar a página (verificado em 1440 e 390 px).
- **Coerência de dados (v2.1):**
  - 7 + 3 = 10 encontros formativos;
  - 254/417 = 61%;
  - 80 − 56 = 24;
  - a distribuição de satisfação resulta em média 4,61;
  - professores e participantes não são somados.
- **Revisão visual:** página inteira em 1440 e 390 px, mais os estados abertos de menu, busca, consulta e notas.

**Não verificado:**

- leitores de tela reais (NVDA, VoiceOver, TalkBack);
- Safari/iOS e Firefox;
- dispositivos físicos;
- Lighthouse e Core Web Vitals;
- alto contraste bloco a bloco.

Não há declaração de conformidade WCAG nem de metas de desempenho.

## 7. Estrutura

```
index.html                  gerado por build.py
src/index.template.html     marcação (@partial / @section = futuros Blade)
data/navegacao.json         menu (fonte única)
data/indicadores.json       todos os números e origens
data/municipios-ba.json     417 municípios
data/geo/                   malha municipal IBGE (CC0)
tools/geo.py                gera os mapas SVG
assets/css, js, fonts, brand
build.py · tools_bundle.py  geração da página e da prévia em arquivo único
docs/                       este documento, indicadores.md, rotas.md, capturas/
versoes/v1-2026-11-05/, versoes/v2-2026-11-05/   versões anteriores
```
