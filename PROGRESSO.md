# PROGRESSO — Portal Tanin

Documento de acompanhamento. Cada fase registra **o que foi feito**, **o que ficou
pendente** e **o que precisa de decisão sua**.

Última atualização: fases 1 a 7 concluídas.

---

## Como rodar o projeto

```bash
pnpm install          # instala tudo
pnpm dev              # sobe o site em http://localhost:3000
                      # e o painel em http://localhost:3000/admin
pnpm semear           # popula o banco com conteúdo de exemplo
pnpm build            # gera a versão de produção
```

O arquivo `.env.example` explica cada variável de ambiente, uma por uma, em português.
Copie para `.env` e preencha antes do primeiro `pnpm dev`.

**Acesso do painel no conteúdo de exemplo:** `ana@tanin.com.br` / `tanin2026`.
Troque a senha assim que entrar.

---

## Fase 1 — Fundação ✅

**Feito**

- Next.js 16 (App Router, TypeScript) com **Payload CMS 3** rodando dentro do mesmo
  aplicativo. Um repositório, um deploy, um banco.
- Banco **Postgres**. Em desenvolvimento roda localmente; em produção aponta para o
  Supabase pela variável `DATABASE_URI`.
- Painel em `/admin`, **todo em português**, com o vinho da marca como cor de ação.
- Modelo de dados completo: Matérias, Edições do Boletim, Vinhos, Guias, Eventos,
  Autores, Categorias, Tags, Uvas, Regiões, Importadoras, Mídia, Inscrições e Usuários.
- Rascunho, **agendamento de publicação** e **pré-visualização ao vivo** ligados nas
  coleções publicáveis. A Ana escreve, agenda para quinta e o site publica sozinho.
- Migração inicial gerada em `src/migrations/`. Em produção o banco muda por migração,
  nunca automaticamente — é o que impede um deploy de alterar a estrutura por engano.

**Por que Payload, e não Sanity** — como você propôs, e mantido: roda no mesmo projeto
Next.js, usa Postgres comum (nada de linguagem de consulta nova), o painel já vem
traduzido e não cobra por usuário. Nenhum argumento apareceu no caminho que justificasse
trocar.

---

## Fase 2 — Sistema de design ✅

**Feito**

- Paleta de cinco cores: tinta, papel, borra, grafite e fio. Sem sombra em lugar nenhum —
  o que separa blocos é **fio de 1px**, como em impresso.
- Tipografia via `next/font`, sem requisição a servidor de terceiros:
  **Fraunces** nos títulos (com os eixos SOFT e WONK), **Newsreader** no texto longo,
  **Archivo** em caixa alta nos rótulos.
- **A escala cromática do vinho** — 14 faixas nomeadas em português, de Verde-palha a
  Tawny, definidas num arquivo só (`src/lib/escala-cores.ts`) e usadas em três lugares:
  o seletor do painel, as variáveis de CSS e os componentes.
- Grade editorial de 12 colunas com composições assimétricas, capitular nos textos
  longos, número de edição como elemento gráfico e uma entrada escalonada por página.
- **Página de amostra em `/estilo`** — a régua tipográfica, a paleta, a escala e os
  componentes, todos em um lugar. É onde se aprova o visual sem abrir código.

---

## Fase 3 — Matérias e Boletim ✅

**Feito**

- `/materias` com filtro por categoria em links de verdade (cada recorte tem endereço
  próprio) e paginação rastreável.
- `/materias/[slug]`: abertura assimétrica, capitular, trilho lateral com vinhos citados
  e guias, FAQ, bloco de autoria, "leia também" e convite ao boletim.
- `/boletim`: o hub, com **a fita cromática** — cada edição é uma faixa de cor, a fita
  cresce toda semana e cada faixa leva à edição.
- `/boletim/[slug]`: número da edição em corpo de cartaz, índice de blocos com âncora
  (dá para mandar alguém direto para um trecho) e navegação entre edições vizinhas.
- Formulário de inscrição **nativo do site**, não o iframe do beehiiv. Funciona mesmo
  sem JavaScript e guarda a inscrição no painel caso o beehiiv esteja fora do ar.
- Script de importação das edições antigas do beehiiv (`pnpm importar:beehiiv`),
  documentado em `docs/beehiiv.md`.

---

## Fase 4 — Vinhos ✅

**Feito**

- `/vinhos`: índice filtrável por tipo, cor na taça, país, uva, faixa de preço e corpo.
  Os filtros são links — compartilháveis e rastreáveis pelo buscador.
  A régua cromática no topo funciona como navegação.
- `/vinhos/[slug]`: o veredito vem antes de tudo, a nota em taças, a régua com a posição
  da garrafa marcada, ficha técnica em lista de definição, harmonizações, como servir,
  onde encontrar e FAQ.
- JSON-LD de `Review` sobre `Product`, com `AggregateOffer` derivado da faixa de preço.

---

## Fase 5 — Guias, Agenda, Sobre e busca ✅

**Feito**

- `/guias` agrupado por tema, com filtro de nível, e `/guias/[slug]` com o bloco
  "Em resumo" no alto — a parte mais citável da página — e data de atualização visível.
- `/agenda` agrupada por mês, com JSON-LD de `Event`.
- `/sobre`: a âncora de autoridade. Bio, credenciais, **como avaliamos** (a régua de
  notas explicada) e **a escala cromática** explicada faixa por faixa.
- `/busca`: busca simultânea em matérias, guias, fichas e edições.
- Páginas de erro e 404 com o mesmo tom editorial do resto.

---

## Fase 6 — SEO, GEO, performance e acessibilidade ✅

**Feito**

- JSON-LD por tipo: `Article` nas matérias e guias, `Review` + `Product` nas fichas,
  `PublicationIssue` + `Periodical` no boletim, `Person` na autora com `sameAs`,
  `NewsMediaOrganization` na Tanin, `FAQPage` onde há FAQ, `BreadcrumbList` em tudo.
- `sitemap.xml` e `robots.txt` gerados sozinhos. **Nenhum robô de IA bloqueado** — eles
  aparecem nominalmente e liberados, por decisão, não por descuido.
- `llms.txt` na raiz, apontando o conteúdo evergreen principal.
- **RSS com texto integral**, não só resumo.
- Metadados em todas as rotas, com queda sensata quando o campo de SEO está vazio.
- HTML semântico: um `h1` por página, `<time datetime>`, `<figure>`/`<figcaption>`,
  `nav` com rótulo. Alvos de toque de 44px. Foco visível em tudo.
- Imagens por `next/image` com `sizes` declarado; fontes com `display: swap`.
- Revalidação sob demanda: publicar no painel refaz só as páginas afetadas, em vez de
  esperar o cache expirar. Na prática, a Ana salva e vê no ar.

### O que foi medido, não só afirmado

| Verificação | Resultado |
| --- | --- |
| Build de produção | passa; **73 páginas** geradas de antemão |
| Tipos (`tsc --noEmit`) | limpo |
| Acessibilidade (axe, WCAG 2.1 AA + boas práticas) | **zero violações em 14 páginas** |
| Um `h1` por página | confere nas 14 |
| JSON-LD | válido e completo em todos os tipos de página |
| Tempo de resposta das páginas prontas | 3 a 8 ms |
| Busca com e sem acento | "regiao" e "região" devolvem o mesmo |
| Filtros de vinho | tipo, cor, país, uva, preço e ordenação, todos conferidos |

Duas coisas foram corrigidas depois de medidas, e vale registrar porque não seriam
percebidas a olho: **Âmbar e Laranja tinham a cor de texto invertida** na escala
cromática (contraste de 3,3 e 3,7 contra o mínimo de 4,5 — agora as quatorze faixas têm
a cor escolhida por cálculo), e o `robots.txt` **bloqueava `/api`, que é justamente o
endereço das imagens** enviadas pelo painel — o portal inteiro ficaria sem imagem de
compartilhamento no WhatsApp e fora do Google Imagens.

---

## Fase 7 — O painel virou um Substack ✅

O CMS foi reestruturado de ponta a ponta. O diagnóstico: 14 coleções com dependências
cruzadas — para publicar a primeira matéria era preciso passar por até 4 telas (criar
Autor, criar Categoria, subir Mídia) antes de escrever a primeira linha.

**O que mudou**

- **De 14 coleções para 5.** Matérias, Boletim e Guias viraram uma coleção só,
  **Textos**: o campo "Seção" decide a forma e o endereço. Sobraram Textos, Vinhos,
  Mídia, Inscrições e Usuários.
- **Uma tela para escrever.** O formulário de texto não tem mais abas: título, corpo e
  publicar. Tudo o mais é opcional e mora na lateral. Só título e corpo são
  obrigatórios.
- **Zero telas de apoio.** Somem as coleções de Autores, Categorias, Tags, Uvas,
  Regiões e Importadoras. A editoria da matéria é um select fixo; uva, região e
  importadora são texto simples na ficha; a ficha da autora mora em Configurações
  (aba "Autora"). Imagem se envia direto do formulário, sem visitar "Mídia" antes.
- **O resumo ficou opcional** — em branco, o site usa as primeiras linhas do texto.
- **A edição do Boletim se numera sozinha** ao publicar (maior número + 1), a cor da
  faixa continua vindo da numeração, e o índice "Nesta edição" agora nasce dos títulos
  H2 do próprio corpo — não existe mais a aba "Blocos e âncoras".
- **Agenda removida** (coleção Eventos e página /agenda), como combinado.
- **O site público não mudou** para o leitor: /materias, /boletim, /guias, /vinhos,
  /sobre e /busca continuam iguais, agora lendo do modelo novo.
- **Painel 100% português do Brasil.** O inglês saiu do seletor de idioma e as
  traduções do próprio Payload — que vinham em português de Portugal com sobras de
  inglês ("Iniciar sessão", "Tem a certeza?", "Log out", "Upload em Massa", "Cultura"
  como tradução de *crop*) — foram sobrescritas uma a uma em `src/admin/traducoes.ts`.
- **Banco recomeçado limpo**: uma única migração inicial do modelo novo; o seed foi
  reescrito preservando todo o conteúdo editorial de exemplo (agora 40 textos e 16
  fichas), e a importação do beehiiv grava direto em Textos.

### 🔴 Atenção no próximo deploy

O banco de produção (Supabase) ainda tem as tabelas do modelo antigo, e as migrações
antigas não existem mais. **Antes do primeiro deploy desta versão**, rode no SQL editor
do Supabase:

```sql
drop schema public cascade; create schema public;
```

Sem isso o `payload migrate` do build falha. Isso apaga também os usuários do painel —
abra `/admin` depois do deploy e crie o primeiro acesso de novo (a primeira pessoa vira
administradora). Arquivos órfãos no bucket de mídia são inofensivos.

---

## Decisões que tomei sozinho — e que você pode reverter

Estas apareceram no meio do caminho. Registrei a escolha e o motivo; nenhuma é cara de
desfazer, mas vale você saber que existem.

### 1. A escala de nota é de **5 taças, com meias taças** — não de 100 pontos

A escala de 100 é o dialeto da indústria. Comunica bem para quem vende vinho e mal para
quem bebe — ninguém fora do ramo sabe dizer o que separa um 89 de um 91. Como o público
é consumidor final e não técnico, a régua de cinco é a que ele já usa todo dia.

O peso da citação por IA não fica com o número, e sim com o **veredito** de cada ficha.
O número entra no código estruturado com a escala declarada (`bestRating`/`worstRating`),
então buscadores interpretam corretamente qualquer que seja a régua.

**Se quiser trocar para 100 pontos:** mexe-se em `src/lib/nota.ts` e no campo `nota` de
`src/collections/Vinhos.ts`. Mais nada no projeto conhece a escala. Mas quanto mais
fichas existirem, mais fichas precisarão ser renotadas — então decida cedo.

### 2. Preço em **faixa**, com data de conferência visível

Preço de importado muda toda semana, e ficha com número velho perde a confiança de quem
lê. As faixas envelhecem bem e a data deixa claro quando foi conferido.

### 3. **Espelho local das inscrições** do boletim

O beehiiv continua sendo a lista oficial. Mas se a chave não estiver configurada ou a
API cair, a inscrição fica guardada no painel, em "Inscrições no Boletim", marcada como
pendente. Ninguém se perde no caminho.

### 4. Filtros e paginação como **links**, não como botões de JavaScript

Custou um pouco mais de código e paga em duas moedas: cada recorte pode ser mandado por
WhatsApp, e o buscador consegue percorrer o acervo inteiro.

---

## O que precisa de você

### 🔴 1. Colar as variáveis na Vercel — e trocar a senha do banco depois

A senha do banco está no `.env` local, que **nunca vai para o Git** (o `.gitignore` agora
ignora qualquer `.env*`, e libera só o `.env.example`, que tem marcadores). Nenhum segredo
está versionado — conferido.

**Na Vercel:** *Settings* → *Environment Variables*. É lá que a senha deve morar em
produção: fica criptografada, é injetada só na hora do build e da execução, e não passa
por nenhum arquivo. Cole estas:

| Variável | Valor |
| --- | --- |
| `DATABASE_URI` | a *Connection string* do Supabase, **Transaction pooler**, porta 6543 |
| `DATABASE_SSL` | `true` |
| `PAYLOAD_SECRET` | um texto longo e aleatório — gere um novo, não reaproveite o local |
| `NEXT_PUBLIC_URL_SITE` | o endereço final do portal, sem barra no fim |

> **Copie o `DATABASE_URI` do painel do Supabase, não do `.env`.** O host do pooler tem a
> região no nome (`aws-0-us-east-1…`), e eu não consegui confirmar a sua daqui: este
> ambiente só tem saída HTTPS, e Postgres fala outro protocolo em outra porta. Tentei
> conectar e não passou — então o que está no `.env` é a melhor suposição, não uma
> verificação. O host certo vem do botão **Connect**, no topo do painel do projeto,
> na aba **Transaction pooler**. Confira antes de subir com `pnpm testar:banco`.

**Recomendo trocar a senha do banco depois de configurar.** Ela passou por uma conversa
de chat, o que significa que ficou registrada em pelo menos um lugar além do cofre do
Supabase. Trocar leva um minuto (*Database* → *Reset database password*) e é a diferença
entre uma senha que só o cofre conhece e uma que já circulou.

### 🔴 2. Onde as imagens vão morar em produção

A Vercel apaga os arquivos a cada deploy, então as imagens precisam ficar fora dela.
O portal já fala o dialeto S3, que serve para o Storage do Supabase.

**O que fazer:** Supabase → *Storage* → criar um bucket público chamado `midia`; depois
*Project Settings* → *Storage* → *S3 Access Keys* → gerar uma chave. Preencher
`S3_BUCKET`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID` e `S3_SECRET_ACCESS_KEY`.

Sem isso o site funciona, mas cada deploy apaga as imagens enviadas pelo painel.

### 🟡 3. O plano do beehiiv dá acesso à API?

A importação das 22 edições e o formulário de inscrição integrado dependem da API do
beehiiv, que **exige o plano Scale**.

- **Se o plano atual tiver API:** pegue a chave em beehiiv → *Settings* → *Integrations*
  → *API*, e preencha `BEEHIIV_API_KEY` e `BEEHIIV_PUBLICATION_ID`. A importação roda
  com um comando.
- **Se não tiver:** o formulário do site continua funcionando (as inscrições ficam no
  painel para sincronizar depois), mas as 22 edições precisarão ser passadas à mão ou o
  plano precisa subir. Me avise que eu ajusto o plano de migração.

Detalhes em `docs/beehiiv.md`.

### 🟡 4. O que fazer com as URLs antigas do beehiiv

**Minha recomendação: manter no ar com `canonical` apontando para o portal.** Quem já
linkou uma edição continua chegando em algum lugar, e a autoridade desses links passa a
contar para o portal em vez de para o beehiiv. Despublicar joga fora esse acúmulo.

Precisa de você porque depende do que o beehiiv permite configurar no seu plano.

### 🟢 5. Conteúdo real

O que está no ar agora é **conteúdo de exemplo**, gerado para você ver o portal
funcionando de verdade — com voz editorial plausível, mas fictício. Produtores e rótulos
das fichas **são inventados de propósito**: não seria honesto atribuir notas a vinhos
reais sem alguém tê-los provado.

Antes de abrir ao público: rodar `pnpm semear --limpar`, ou apagar pelo painel, e publicar
o conteúdo verdadeiro.

### 🟢 6. Fotos e ilustrações

Não há nenhuma imagem no projeto. O design foi feito para aguentar isso — onde falta
foto, a cor da escala assume o lugar. Mas a home ganha muito com uma ilustração de
abertura, e a página `/sobre` pede uma foto sua.

A direção visual pede **ilustração acima de foto de banco de imagem**. Se quiser, posso
sugerir uma referência de estilo antes de você encomendar.

---

## O que ficou de fora, de propósito

Conforme combinado: área logada, checkout, clube e loja. Nada no que foi construído
impede acrescentá-los — as coleções, o controle de acesso e a autenticação do Payload já
estão de pé, então um dia isso é acréscimo, não reescrita.
