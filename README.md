# Portal Tanin

A casa canônica do conteúdo da **Tanin** — textos e fichas de vinho. Tudo público, tudo
indexável, sem paywall e sem login para ler.

Quem escreve digita três coisas: **título, subtítulo e o texto**. Resumo, endereço da
página, imagem de compartilhamento, palavras-chave, tempo de leitura e busca saem
sozinhos, calculados pelo motor editorial (`src/lib/texto.ts`) na hora de salvar.

- **Site:** Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- **Painel:** Payload CMS 3, em português, dentro do mesmo aplicativo, em `/admin`
- **Banco:** Postgres (Supabase em produção)
- **Hospedagem:** Vercel

> Se você não programa e só quer publicar: vá direto para
> [Publicar sem tocar em código](#publicar-sem-tocar-em-código).
> Se quer saber o que já está pronto e o que falta: leia o [PROGRESSO.md](./PROGRESSO.md).

---

## Começar

```bash
pnpm install
cp .env.example .env     # e preencha — o arquivo explica cada variável
pnpm dev
```

- Site: <http://localhost:3000>
- Painel: <http://localhost:3000/admin>
- Sistema de design: <http://localhost:3000/estilo>

Para ver o portal cheio de conteúdo de exemplo:

```bash
pnpm semear
```

Isso cria o usuário `ana@tanin.com.br` com a senha `tanin2026`, além de matérias,
22 edições do Boletim, guias e fichas de vinho fictícias.
`pnpm semear --limpar` apaga o conteúdo de exemplo antes de recriar.

### Precisa de um Postgres local

Qualquer Postgres 14+ serve. O endereço vai em `DATABASE_URI`. Em desenvolvimento o
Payload cria e atualiza as tabelas sozinho; em produção, só por migração.

---

## Publicar sem tocar em código

Entre em `/admin`, clique em **Textos → Criar** e comece a digitar. A tela tem três
coisas: título, subtítulo e a página em branco. Não há mais nada para preencher.

- **`Enter` no título** desce para o subtítulo; `Enter` no subtítulo desce para o texto.
  Dá para escrever o texto inteiro sem tirar a mão do teclado.
- **A tecla `/`** abre a lista de blocos: subtítulo interno, citação em destaque, caixa
  de apoio, lista, fio, imagem.
- **Imagens** entram arrastando para dentro do texto. Se houver mais de uma, marque
  **"Usar como imagem principal do texto"** naquela que deve representar o texto no
  cartão da home, no Google e no WhatsApp. Sem marcar nenhuma, vale a primeira.
- **O texto se salva sozinho** a cada segundo e meio. O canto de cima diz quando foi a
  última vez: *"rascunho salvo às 14:32"*.
- **Rascunho e agendamento.** Todo texto nasce como rascunho. Publique quando quiser —
  ou use "Publicar depois", no menu ao lado do botão, para marcar dia e hora.
- **Não existe campo de SEO, de resumo, de seção, de editoria nem de endereço.** O
  título da aba, a descrição do Google, o resumo que as inteligências artificiais
  citam, o endereço da página, o tempo de leitura e a cor do cartão são calculados a
  partir do que você escreveu, toda vez que o texto é salvo.
- **A ficha da autora** (bio, foto, credenciais, redes) mora em Configurações do site,
  na aba "Autora" — preencha uma vez e ela assina tudo.

Essa penúltima linha é a decisão central do projeto: o resumo sai do primeiro parágrafo,
o endereço sai do título, a imagem de compartilhamento sai do próprio texto. Quem
escreve escreve; o site cuida do resto.

**Vinhos** continua sendo uma coleção à parte, com as fichas estruturadas — nota,
veredito e filtros. Uva, região e importadora são texto simples: escreva o nome e pronto.

---

## Como o projeto está organizado

```
src/
├── app/
│   ├── (site)/          o site público — uma pasta por rota
│   └── (payload)/       o painel; não precisa mexer
├── collections/         o modelo de dados (o que existe em cada tipo de conteúdo)
├── components/          as peças visuais reaproveitadas
├── admin/               a tela de escrita: título, subtítulo, barra de rascunho salvo
├── fields/              campos compartilhados: SEO, slug, editor de texto
├── lib/                 o motor editorial, consultas, JSON-LD, a escala de cores
├── globals/             configurações do site editáveis pelo painel
└── migrations/          mudanças de estrutura do banco, versionadas
scripts/
├── semear.ts            conteúdo de exemplo
└── importar-beehiiv.ts  traz os textos e as imagens do beehiiv
docs/
└── beehiiv.md           como conectar o beehiiv, passo a passo
```

Quatro arquivos concentram as decisões que mais importam:

- **`src/lib/texto.ts`** — o motor editorial. Tudo o que o site sabe sobre um texto sem
  ter perguntado nasce aqui: resumo, imagem principal, palavras-chave, tempo de leitura,
  índice de busca, cor do cartão. Mexer na régua do resumo ou nas palavras vazias é
  mexer aqui.
- **`src/app/(payload)/painel.css`** — a tela de escrita. O bloco "modo escrita" é o que
  transforma o formulário do Payload numa página em branco.
- **`src/lib/escala-cores.ts`** — a escala cromática do vinho, em 14 faixas. É a fonte
  única: o painel, o CSS e os componentes leem daqui. Mudou aqui, mudou no site inteiro.
- **`src/lib/nota.ts`** — a escala de notas. Trocar de 5 taças para 100 pontos é mexer
  neste arquivo e no campo `nota` de `src/collections/Vinhos.ts`. Nada mais no projeto
  conhece a régua.

### O que está escondido, e como voltar

A coleção `Textos` continua tendo os campos de seção, editoria, tipo de guia, nível,
número de edição, imagem de destaque, FAQ, SEO, relacionados e manchete — todos com
`admin: { hidden: true }`, com os dados intactos no banco. Sumiram da tela, não do
modelo, porque a publicação tem hoje um tipo só de texto. Para trazer um de volta:
apague o `hidden: true` do campo em `src/collections/Textos.ts`, e, se for a seção,
recrie a página em `src/app/(site)/` e tire o redirecionamento do `next.config.mjs`.

---

## Comandos

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Sobe o site e o painel para desenvolvimento |
| `pnpm build` | Gera a versão de produção |
| `pnpm start` | Roda a versão de produção já gerada |
| `pnpm typecheck` | Confere os tipos sem gerar nada |
| `pnpm testar:banco` | Diz se um endereço de banco conecta — e, se não, o que fazer |
| `pnpm semear` | Popula o banco com conteúdo de exemplo |
| `pnpm importar:beehiiv` | Traz os textos e as imagens do beehiiv como rascunho |
| `pnpm generate:types` | Regenera os tipos depois de mexer nas coleções |
| `pnpm migrate:criar <nome>` | Cria uma migração a partir das mudanças no modelo |
| `pnpm migrate` | Aplica as migrações pendentes |

**Sempre que mexer em `src/collections/`**, rode `pnpm generate:types`. E antes de
subir para produção, `pnpm migrate:criar <nome-do-que-mudou>`.

---

## Deploy na Vercel

1. **Conecte o repositório.** A Vercel detecta Next.js sozinha; o `vercel.json` já manda
   rodar as migrações antes de construir o site.

2. **Preencha as variáveis de ambiente** em *Settings → Environment Variables*. É aí que
   a senha do banco deve morar: fica criptografada e não passa por arquivo nenhum.
   As obrigatórias são três:

   | Variável | Onde achar |
   | --- | --- |
   | `DATABASE_URI` | Supabase → botão **Connect**, no topo do painel do projeto → **Transaction pooler** (porta 6543). Copie a linha e troque `[YOUR-PASSWORD]` pela senha do banco |
   | `PAYLOAD_SECRET` | gere: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `NEXT_PUBLIC_URL_SITE` | o endereço final do portal, sem barra no fim |

   Acrescente também `DATABASE_SSL=true` — o Supabase exige conexão criptografada.

   > **A janela `Connect` do Supabase oferece três endereços. Só um serve aqui.**
   >
   > | Aba | Endereço | Serve na Vercel? |
   > | --- | --- | --- |
   > | Direct connection | `db.SEU-PROJETO.supabase.co:5432` | **Não.** Só responde em IPv6, e a Vercel não tem rota IPv6 — o build morre com `ENETUNREACH`. |
   > | Session pooler | `aws-N-REGIAO.pooler.supabase.com:5432` | Funciona, mas segura cada conexão até o fim; em pico, esgota o limite. |
   > | **Transaction pooler** | `aws-N-REGIAO.pooler.supabase.com:**6543**` | **Sim — use esta.** |
   >
   > Confira antes de subir: `pnpm conferir:ambiente` avisa se o endereço é do tipo
   > errado, e `pnpm testar:banco 'postgresql://...'` tenta conectar de verdade.
   > O `build:vercel` roda a primeira conferência sozinho, então um endereço errado
   > para com uma frase em português em vez de um despejo de pilha.

3. **O primeiro deploy cria o banco sozinho.** O comando de build roda `payload migrate`
   antes de construir, e as migrações estão versionadas em `src/migrations/`. Você não
   precisa rodar nada à mão no Supabase.

4. **Crie o primeiro acesso.** Abra `SEU-ENDERECO/admin`. Como ainda não existe ninguém,
   o painel mostra a tela de primeiro usuário: nome, e-mail e senha. **Essa primeira
   pessoa vira administradora automaticamente** — é a única que pode criar outros
   usuários e apagar conteúdo.

5. **Configure o armazenamento de imagens** (as quatro variáveis `S3_*`). Sem isso o site
   funciona, mas cada deploy apaga as imagens enviadas pelo painel — a Vercel não guarda
   arquivos entre deploys.

---

## Princípios que o código segue

Estão aqui porque são fáceis de quebrar sem perceber.

1. **Todo conteúdo é público e indexável.** Nada de paywall, nada de login para ler.
   Nenhum robô de inteligência artificial bloqueado no `robots.txt` — eles aparecem
   nominalmente e liberados, por decisão.
2. **O portal é a casa canônica.** O beehiiv passa a ser só o disparador de e-mail.
3. **A Ana publica sozinha.** Se publicar uma matéria exigir um desenvolvedor, alguma
   coisa foi construída errado.
4. **Decisões chatas e estáveis** em vez de espertas e frágeis. O dono vai iterar muito
   agora e pouco depois.
5. **Fio de 1px, nunca sombra.** É o que separa um projeto editorial de um template.
6. **Filtros e paginação são links de verdade**, para que possam ser compartilhados e
   percorridos por quem indexa.
