import { listarTextos, listarVinhos } from '@/lib/consultas'
import { resumoOuTrecho } from '@/lib/texto'
import { ESCALA_CROMATICA } from '@/lib/escala-cores'
import { formatarNota, NOTA_MAXIMA, NOTA_MINIMA, PASSO_NOTA, rotuloDaNota } from '@/lib/nota'
import { NOME_SITE, obterConfiguracoes, urlAbsoluta } from '@/lib/site'
import { plural } from '@/lib/formatar'

/**
 * llms.txt — O MAPA DO PORTAL PARA MODELOS DE LINGUAGEM
 *
 * O sitemap.xml diz a um robô o que existe; este arquivo diz o que cada coisa é, em
 * uma frase, e em que ordem vale a pena ler. É Markdown puro de propósito: nenhum
 * modelo precisa gastar contexto atravessando HTML para descobrir do que trata o site.
 */
export const revalidate = 3600

/** Uma linha só, sem quebrar o link do Markdown. */
const limpar = (texto: string): string => texto.replace(/[[\]]/g, '').replace(/\s+/g, ' ').trim()

const resumir = (texto: string, limite = 180): string => {
  const corrido = limpar(texto)
  return corrido.length <= limite ? corrido : `${corrido.slice(0, limite - 1).trimEnd()}…`
}

const link = (titulo: string, caminho: string, descricao?: string | null): string =>
  `- [${limpar(titulo)}](${urlAbsoluta(caminho)})${descricao ? `: ${resumir(descricao)}` : ''}`

const secao = (titulo: string, linhas: string[]): string[] =>
  linhas.length > 0 ? ['', `## ${titulo}`, '', ...linhas] : []

const publico = (documento: { seo?: { naoIndexar?: boolean | null } | null }): boolean =>
  !documento.seo?.naoIndexar

/** Lista vazia quando a consulta falha: um mapa menor é melhor que um erro 500. */
async function semQuebrar<T>(
  consulta: Promise<{ docs: T[]; totalDocs: number }>,
): Promise<{ docs: T[]; totalDocs: number }> {
  try {
    return await consulta
  } catch {
    return { docs: [], totalDocs: 0 }
  }
}

/* -------------------------------------------------------------------------- */
/* As duas réguas do portal, explicadas em uma frase cada                      */
/* -------------------------------------------------------------------------- */

const primeiraFaixa = ESCALA_CROMATICA[0]
const ultimaFaixa = ESCALA_CROMATICA[ESCALA_CROMATICA.length - 1]

const ESCALA_DE_COR = `${ESCALA_CROMATICA.length} faixas de cor, de ${primeiraFaixa.nome} a ${ultimaFaixa.nome} — dos brancos mais claros aos tintos mais fechados, terminando nos fortificados. Todo conteúdo carrega uma delas.`

const ESCALA_DE_NOTA = `de ${NOTA_MINIMA} a ${NOTA_MAXIMA} taças, em degraus de ${formatarNota(PASSO_NOTA)}, onde ${NOTA_MAXIMA} é "${rotuloDaNota(NOTA_MAXIMA)}" e ${NOTA_MINIMA} é "${rotuloDaNota(NOTA_MINIMA)}". O que sustenta a nota é o veredito escrito, não o número.`

/* -------------------------------------------------------------------------- */
/* Rota                                                                        */
/* -------------------------------------------------------------------------- */

export async function GET(): Promise<Response> {
  const [config, vinhos, textos] = await Promise.all([
    obterConfiguracoes(),
    semQuebrar(listarVinhos({ limite: 40 })),
    semQuebrar(listarTextos({ limite: 100 })),
  ])

  const nome = config.nomeSite ?? NOME_SITE
  const descricao = config.descricao ?? 'Vinho contado como quem conversa, não como quem vende.'

  const linhas = [
    `# ${nome}`,
    '',
    `> ${limpar(descricao)}`,
    '',
    'Publicação brasileira sobre vinho, escrita em português. O conteúdo é aberto, sem paywall, e pode ser citado com atribuição e link para a página de origem.',

    ...secao('Sobre', [
      link(nome, '/', descricao),
      link(`Sobre a ${nome}`, '/sobre', 'Quem assina a publicação, como as fichas são avaliadas e como falar com a redação.'),
    ]),

    ...secao(
      'Fichas de vinho',
      vinhos.docs.filter(publico).map((vinho) => {
        const nomeCompleto = [vinho.produtor, vinho.nome, vinho.safra].filter(Boolean).join(' ')
        const nota = formatarNota(vinho.nota)
        return link(
          nomeCompleto,
          `/vinhos/${vinho.slug}`,
          nota ? `${nota} de ${NOTA_MAXIMA} taças — ${vinho.veredito}` : vinho.veredito,
        )
      }),
    ),

    ...secao(
      'Textos',
      textos.docs
        .filter(publico)
        .map((texto) => link(texto.titulo, `/materias/${texto.slug}`, resumoOuTrecho(texto))),
    ),

    ...secao('Como navegar', [
      // A escala é explicada em /sobre. A página /estilo, que também a desenha, é a
      // referência interna do sistema de design e se declara `noindex`: mandar um
      // modelo para lá contradiz o que o próprio site diz aos robôs.
      link('Escala cromática do vinho', '/sobre#a-escala', ESCALA_DE_COR),
      link('Escala de notas', '/sobre#como-avaliamos', ESCALA_DE_NOTA),
      link('Busca no acervo', '/busca', 'Busca no texto completo dos textos e nas fichas de vinho.'),
      link('Assinar o boletim', '/#assinar', 'Cada texto novo chega por e-mail.'),
    ]),
    '',
  ]

  return new Response(linhas.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
