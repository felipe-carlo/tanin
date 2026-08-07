# Portal Tanin

A casa canônica do conteúdo da **Tanin** — matérias, o arquivo do Boletim, fichas de
vinho, guias e agenda. Tudo público, tudo indexável, sem paywall e sem login para ler.

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
pnpm seed
```

Isso cria o usuário `ana@tanin.com.br` com a senha `tanin2026`, além de matérias,
22 edições do Boletim, fichas de vinho, guias e eventos fictícios.
`pnpm seed --limpar` apaga o conteúdo de exemplo antes de recriar.

### Precisa de um Postgres local

Qualquer Postgres 14+ serve. O endereço vai em `DATABASE_URI`. Em desenvolvimento o
Payload cria e atualiza as tabelas sozinho; em produção, só por migração.

---

## Publicar sem tocar em código

Entre em `/admin` e escreva. Alguns detalhes que valem saber:

- **Rascunho e agendamento.** Todo conteúdo nasce como rascunho. Publique quando quiser,
  ou marque uma data futura em "Data de publicação" e o site publica sozinho.
- **Pré-visualização.** O botão de pré-visualizar mostra a página real, com o design do
  site, antes de qualquer coisa ficar pública.
- **O endereço da página** é preenchido sozinho a partir do título. Só mexa se quiser.
- **O resumo importa mais do que parece.** É o trecho que o Google e as inteligências
  artificiais vão citar. Escreva de 40 a 60 palavras que façam sentido sozinhas, fora da
  página.
- **O chip de cor** liga o conteúdo à escala cromática do vinho. É o que dá cor ao
  cartão, à fita do arquivo e aos filtros.
- **SEO em branco não é problema.** Se você não preencher, o site usa o título, o resumo
  e a imagem de destaque da própria página.

---

## Como o projeto está organizado

```
src/
├── app/
│   ├── (site)/          o site público — uma pasta por rota
│   └── (payload)/       o painel; não precisa mexer
├── collections/         o modelo de dados (o que existe em cada tipo de conteúdo)
├── components/          as peças visuais reaproveitadas
├── fields/              campos compartilhados: SEO, slug, editor de texto
├── lib/                 consultas ao banco, formatação, JSON-LD, a escala de cores
├── globals/             configurações do site editáveis pelo painel
└── migrations/          mudanças de estrutura do banco, versionadas
scripts/
├── semear.ts            conteúdo de exemplo
└── importar-beehiiv.ts  importação única das edições antigas
docs/
└── beehiiv.md           como conectar o beehiiv, passo a passo
```

Dois arquivos concentram as decisões que mais importam:

- **`src/lib/escala-cores.ts`** — a escala cromática do vinho, em 14 faixas. É a fonte
  única: o painel, o CSS e os componentes leem daqui. Mudou aqui, mudou no site inteiro.
- **`src/lib/nota.ts`** — a escala de notas. Trocar de 5 taças para 100 pontos é mexer
  neste arquivo e no campo `nota` de `src/collections/Vinhos.ts`. Nada mais no projeto
  conhece a régua.

---

## Comandos

| Comando | O que faz |
| --- | --- |
| `pnpm dev` | Sobe o site e o painel para desenvolvimento |
| `pnpm build` | Gera a versão de produção |
| `pnpm start` | Roda a versão de produção já gerada |
| `pnpm typecheck` | Confere os tipos sem gerar nada |
| `pnpm testar:banco` | Diz se um endereço de banco conecta — e, se não, o que fazer |
| `pnpm seed` | Popula o banco com conteúdo de exemplo |
| `pnpm importar:beehiiv` | Importa as edições antigas do beehiiv como rascunho |
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
   | `DATABASE_URI` | Supabase → *Project Settings* → *Database* → *Connection string* → **URI**, opção **Transaction pooler** (porta 6543) |
   | `PAYLOAD_SECRET` | gere: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `NEXT_PUBLIC_URL_SITE` | o endereço final do portal, sem barra no fim |

   Acrescente também `DATABASE_SSL=true` — o Supabase exige conexão criptografada.

   > **Copie a linha do painel, não monte à mão.** O nome do servidor do pooler carrega
   > a região *e* um número de fragmento (`aws-0`, `aws-1`…) que muda de projeto para
   > projeto. Errar qualquer um dos dois derruba o deploy com
   > `tenant or user not found`. Para conferir antes de subir:
   > `pnpm testar:banco 'postgresql://...'`

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
