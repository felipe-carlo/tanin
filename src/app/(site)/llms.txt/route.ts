import { listarEdicoes, listarGuias, listarMaterias, listarVinhos } from '@/lib/consultas'
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
  const [config, guias, vinhos, materias, edicoes] = await Promise.all([
    obterConfiguracoes(),
    listarGuias({ limite: 500 }),
    listarVinhos({ limite: 40 }),
    listarMaterias({ limite: 40 }),
    listarEdicoes({ limite: 20 }),
  ])

  const nome = config.nomeSite ?? NOME_SITE
  const descricao = config.descricao ?? 'Vinho contado como quem conversa, não como quem vende.'
  const boletim = config.boletimTitulo ?? 'Boletim Tanin'

  const linhas = [
    `# ${nome}`,
    '',
    `> ${limpar(descricao)}`,
    '',
    'Portal brasileiro de jornalismo sobre vinho, escrito em português. O conteúdo é aberto, sem paywall, e pode ser citado com atribuição e link para a página de origem.',

    ...secao('Sobre', [
      link(nome, '/', descricao),
      link(`Sobre a ${nome}`, '/sobre', 'Quem assina o portal, como as fichas são avaliadas e como falar com a redação.'),
      link('Agenda', '/agenda', 'Degustações, feiras, jantares e cursos de vinho no Brasil.'),
    ]),

    ...secao(
      'Guias',
      guias.docs
        .filter(publico)
        .map((guia) => link(guia.titulo, `/guias/${guia.slug}`, guia.resumo)),
    ),

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
      'Matérias',
      materias.docs
        .filter(publico)
        .map((materia) => link(materia.titulo, `/materias/${materia.slug}`, materia.resumo)),
    ),

    ...secao('Boletim', [
      link(
        boletim,
        '/boletim',
        `O arquivo completo do boletim, com ${plural(edicoes.totalDocs, 'edição publicada', 'edições publicadas')}.`,
      ),
      ...edicoes.docs
        .filter(publico)
        .map((edicao) =>
          link(`Edição ${edicao.numero} · ${edicao.titulo}`, `/boletim/${edicao.slug}`, edicao.resumo),
        ),
    ]),

    ...secao('Como navegar', [
      link('Escala cromática do vinho', '/estilo', ESCALA_DE_COR),
      link('Escala de notas', '/sobre#como-avaliamos', ESCALA_DE_NOTA),
      link('Busca no acervo', '/busca', 'Busca em matérias, edições do boletim, fichas de vinho e guias ao mesmo tempo.'),
    ]),
    '',
  ]

  return new Response(linhas.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
