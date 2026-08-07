/**
 * TESTA UMA CONEXÃO COM O BANCO — antes de descobrir no meio de um deploy.
 *
 *   pnpm testar:banco                          usa o DATABASE_URI do .env
 *   pnpm testar:banco 'postgresql://...'       testa um endereço específico
 *
 * Existe porque a mensagem que o Postgres devolve quando algo está errado é curta,
 * técnica e some no meio de um registro de build de trezentas linhas. Aqui ela vira
 * uma frase em português que diz o que fazer.
 */
import { Client } from 'pg'

const VERDE = '\x1b[32m'
const VERMELHO = '\x1b[31m'
const AMARELO = '\x1b[33m'
const CINZA = '\x1b[90m'
const FIM = '\x1b[0m'

try {
  process.loadEnvFile()
} catch {
  // Sem .env: o endereço tem de vir por argumento.
}

const endereco = process.argv[2] ?? process.env.DATABASE_URI

if (!endereco) {
  console.error(`${VERMELHO}Nenhum endereço de banco.${FIM}`)
  console.error(`Preencha DATABASE_URI no .env, ou passe direto:`)
  console.error(`  pnpm testar:banco 'postgresql://usuario:senha@servidor:6543/postgres'`)
  process.exit(1)
}

/** Esconde a senha, para o endereço poder ser mostrado sem vazar nada. */
const semSenha = (url: string): string => url.replace(/:\/\/([^:]+):[^@]+@/, '://$1:••••••@')

/**
 * Traduz o erro do Postgres para o que fazer a respeito.
 *
 * As três primeiras são as que de fato acontecem com o Supabase, e cada uma tem uma
 * causa bem diferente — confundi-las custa uma tarde.
 */
function explicar(erro: { message?: string; code?: string }): string[] {
  const mensagem = erro.message ?? ''

  if (/tenant or user not found|tenant\/user .* not found/i.test(mensagem)) {
    return [
      'O pooler respondeu, mas não reconhece este projeto.',
      '',
      'A conexão chegou ao Supabase — rede, porta e senha nem chegaram a ser testadas.',
      'O problema está no ENDEREÇO do servidor: cada projeto vive num fragmento do',
      'pooler, e o número no começo do nome (aws-0, aws-1, aws-2…) faz parte dele.',
      '',
      'O que fazer: copie a linha exata do painel, em vez de montá-la à mão —',
      'Supabase → botão Connect, no topo do painel → aba Transaction pooler.',
      'Atalho: se está usando aws-0, tente aws-1, e vice-versa.',
    ]
  }

  if (/password authentication failed|senha/i.test(mensagem)) {
    return [
      'O servidor foi encontrado, mas a senha não confere.',
      '',
      'Se você não lembra, pode trocar sem perder nada:',
      'Supabase → Project Settings → Database → Reset database password.',
      'Atenção ao copiar: caracteres especiais na senha precisam ser codificados na URL',
      '(por exemplo, @ vira %40).',
    ]
  }

  if (/ENOTFOUND|getaddrinfo/i.test(mensagem)) {
    return [
      'Este endereço de servidor não existe.',
      '',
      'Provavelmente há um erro de digitação, ou a região está errada.',
      'A região faz parte do nome do servidor (us-west-2, sa-east-1…).',
      'Copie a linha do painel: botão Connect, no topo → aba Transaction pooler.',
    ]
  }

  if (/ECONNREFUSED/i.test(mensagem)) {
    return [
      'Não há nada escutando nesse endereço e nessa porta.',
      '',
      'Se for o banco local, ele provavelmente não está rodando — suba o Postgres.',
      'Se for o Supabase, confira a porta: 6543 para o Transaction pooler, 5432 para o',
      'Session pooler.',
    ]
  }

  if (/ETIMEDOUT|timeout/i.test(mensagem)) {
    return [
      'O servidor não respondeu no tempo esperado.',
      '',
      'Costuma ser uma destas três: a porta está bloqueada pela rede em que você está',
      '(alguns escritórios e VPNs fecham a 5432 e a 6543); o projeto do Supabase está',
      'pausado por inatividade; ou a região do endereço está errada.',
    ]
  }

  if (/self.signed|certificate|SSL/i.test(mensagem)) {
    return [
      'A conexão criptografada foi recusada.',
      '',
      'Confira se DATABASE_SSL está como "true" — o Supabase exige.',
    ]
  }

  return [mensagem]
}

const cliente = new Client({
  connectionString: endereco,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 15_000,
})

console.log(`${CINZA}Testando ${semSenha(endereco)}${FIM}\n`)

try {
  await cliente.connect()

  const versao = await cliente.query('select version()')
  const tabelas = await cliente.query(
    "select count(*)::int as total from information_schema.tables where table_schema = 'public'",
  )
  const migracoes = await cliente
    .query('select name from payload_migrations order by id')
    .catch(() => null)

  console.log(`${VERDE}✓ Conectou.${FIM}`)
  console.log(`  ${String(versao.rows[0].version).split(' on ')[0]}`)
  console.log(`  ${tabelas.rows[0].total} tabela(s) no schema público`)

  if (!migracoes) {
    console.log(`\n${AMARELO}Banco ainda vazio.${FIM} As tabelas são criadas no primeiro deploy,`)
    console.log(`ou agora, com: DATABASE_URI='${'<este endereço>'}' pnpm migrate`)
  } else {
    const nomes = migracoes.rows.map((linha) => linha.name).filter((n) => n !== 'dev')
    console.log(`  ${nomes.length} migração(ões) aplicada(s)${nomes.length ? `: ${nomes.join(', ')}` : ''}`)
  }

  await cliente.end()
  process.exit(0)
} catch (erro) {
  console.log(`${VERMELHO}✗ Não conectou.${FIM}\n`)
  explicar(erro as { message?: string; code?: string }).forEach((linha) => console.log(linha))
  console.log(`\n${CINZA}Mensagem original: ${(erro as Error).message}${FIM}`)
  await cliente.end().catch(() => {})
  process.exit(1)
}
