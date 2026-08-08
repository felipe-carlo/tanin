/**
 * CONFERE O AMBIENTE ANTES DE CONSTRUIR.
 *
 * Roda no começo do build de produção. Não conecta em nada — só olha o formato das
 * variáveis e barra os erros que, sem isto, só apareceriam como um despejo de pilha
 * de trinta linhas no meio do registro da Vercel.
 *
 * O caso que motivou o arquivo: o painel do Supabase oferece três endereços de
 * conexão, e o primeiro deles — "Direct connection" — aponta para um servidor que só
 * responde em IPv6. A máquina que constrói o site na Vercel não tem rota IPv6, então
 * o erro que chega é `ENETUNREACH` com um endereço hexadecimal gigante, que não diz
 * a ninguém que a solução é trocar de aba.
 */

const VERMELHO = '\x1b[31m'
const AMARELO = '\x1b[33m'
const CINZA = '\x1b[90m'
const NEGRITO = '\x1b[1m'
const FIM = '\x1b[0m'

const problemas: string[][] = []
const avisos: string[][] = []

const endereco = process.env.DATABASE_URI

if (!endereco) {
  problemas.push([
    'DATABASE_URI não está preenchida.',
    '',
    'Na Vercel: Settings → Environment Variables.',
    'O valor vem do Supabase, no botão Connect (topo do painel do projeto),',
    'aba Transaction pooler.',
  ])
} else {
  let url: URL | null = null
  try {
    url = new URL(endereco)
  } catch {
    problemas.push([
      'DATABASE_URI não parece um endereço válido.',
      '',
      'Deve começar com postgresql:// e ter usuário, senha, servidor, porta e banco:',
      'postgresql://usuario:senha@servidor:6543/postgres',
    ])
  }

  if (url) {
    const servidor = url.hostname
    const porta = url.port

    // O caso do "Direct connection": db.<ref>.supabase.co só resolve em IPv6.
    if (/^db\..*\.supabase\.co$/.test(servidor)) {
      problemas.push([
        'Esta é a conexão DIRETA do Supabase, e ela não funciona na Vercel.',
        '',
        `O servidor ${servidor} só responde em IPv6, e a máquina que constrói o site`,
        'não tem rota IPv6. O erro que aparece é "ENETUNREACH" com um endereço enorme',
        'cheio de dois-pontos.',
        '',
        'O QUE FAZER: no Supabase, botão Connect (no topo do painel do projeto),',
        'troque para a aba "Transaction pooler". O endereço certo é bem diferente:',
        '',
        '  postgresql://postgres.SEU-PROJETO:SENHA@aws-N-REGIAO.pooler.supabase.com:6543/postgres',
        '',
        'Repare que o servidor termina em .pooler.supabase.com, a porta é 6543 e o',
        'usuário tem um ponto e o código do projeto depois de "postgres".',
      ])
    }

    if (servidor.endsWith('.pooler.supabase.com')) {
      if (!url.username.includes('.')) {
        problemas.push([
          'O usuário está incompleto para o pooler do Supabase.',
          '',
          `Veio "${url.username}", mas o pooler exige o código do projeto junto:`,
          '"postgres.SEU-CODIGO-DE-PROJETO". Copie a linha inteira do painel.',
        ])
      }
      if (porta === '5432') {
        avisos.push([
          'Você está usando o Session pooler (porta 5432).',
          '',
          'Funciona, mas na Vercel cada requisição abre uma conexão nova e o Session',
          'pooler segura cada uma até o fim. Em pico de acesso isso esgota o limite.',
          'A porta 6543 (Transaction pooler) é a indicada para hospedagem sem servidor.',
        ])
      }
    }

    if (/supabase/.test(servidor) && process.env.DATABASE_SSL !== 'true') {
      problemas.push([
        'DATABASE_SSL precisa estar como "true".',
        '',
        'O Supabase só aceita conexão criptografada, e sem esta variável a conexão',
        'é recusada.',
      ])
    }
  }
}

if (!process.env.PAYLOAD_SECRET) {
  problemas.push([
    'PAYLOAD_SECRET não está preenchida.',
    '',
    'É o texto que assina os cookies de quem entra no painel. Gere um assim:',
    '  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
  ])
}

avisos.forEach((linhas) => {
  console.log(`\n${AMARELO}${NEGRITO}Atenção${FIM}${AMARELO} — ${linhas[0]}${FIM}`)
  linhas.slice(1).forEach((linha) => console.log(`${AMARELO}${linha}${FIM}`))
})

if (problemas.length === 0) {
  console.log(`${CINZA}Ambiente conferido.${FIM}`)
  process.exit(0)
}

console.error(`\n${VERMELHO}${NEGRITO}O build não pode começar.${FIM}\n`)
problemas.forEach((linhas, indice) => {
  if (indice > 0) console.error('')
  console.error(`${VERMELHO}${NEGRITO}${linhas[0]}${FIM}`)
  linhas.slice(1).forEach((linha) => console.error(linha))
})
console.error(`\n${CINZA}Detalhes em README.md, seção "Deploy na Vercel".${FIM}\n`)
process.exit(1)
