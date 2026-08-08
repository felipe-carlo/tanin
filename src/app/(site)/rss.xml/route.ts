import { convertLexicalToHTML, LinkHTMLConverter } from '@payloadcms/richtext-lexical/html'
import type { HTMLConvertersFunction } from '@payloadcms/richtext-lexical/html'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { comoMidia, urlDaMidia } from '@/components/Imagem'
import { listarTextos } from '@/lib/consultas'
import { categoriaPorValor } from '@/lib/categorias'
import { enderecoDoDoc } from '@/lib/secoes'
import { autoraDe, NOME_SITE, obterConfiguracoes, URL_SITE, urlAbsoluta } from '@/lib/site'
import { resumoOuTrecho } from '@/lib/texto'
import type { Midia } from '@/payload-types'

/**
 * O FEED RSS — TEXTO INTEGRAL
 *
 * Feed truncado é hábito de quem mede pageview. A Tanin publica o texto inteiro em
 * `content:encoded` porque quem lê por leitor de feed é leitor fiel, e porque o texto
 * completo é o que um agregador (ou uma IA) consegue de fato citar.
 */
export const revalidate = 3600

const QUANTIDADE = 40

/* -------------------------------------------------------------------------- */
/* XML                                                                         */
/* -------------------------------------------------------------------------- */

const escapar = (texto: string): string =>
  texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

/** Fecha e reabre a seção quando o próprio conteúdo contém `]]>`. */
const cdata = (texto: string): string => `<![CDATA[${texto.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`

/** Data no formato exigido pelo RSS 2.0 (RFC 822). */
const rfc822 = (valor?: string | null): string => {
  const data = new Date(valor ?? Date.now())
  // Uma data inválida viraria <pubDate>Invalid Date</pubDate>, que quebra o feed
  // inteiro em leitores estritos. Melhor cair no agora do que derrubar tudo.
  const valida = Number.isNaN(data.getTime()) ? new Date() : data
  return valida.toUTCString().replace('GMT', '+0000')
}

/* -------------------------------------------------------------------------- */
/* Lexical → HTML                                                              */
/* -------------------------------------------------------------------------- */

/** No feed todo endereço precisa ser absoluto: o HTML será lido fora do domínio. */
const enderecoDoDocumento = (relacao: string | undefined, valor: unknown): string =>
  urlAbsoluta(enderecoDoDoc(relacao, valor))

/** Os campos de um bloco do editor, já tipados — o conversor genérico entrega `any`. */
type Bloco<Campos> = { node: { fields: Campos } }

const conversores: HTMLConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkHTMLConverter({
    internalDocToHref: ({ linkNode }) =>
      enderecoDoDocumento(linkNode.fields.doc?.relationTo, linkNode.fields.doc?.value),
  }),

  upload: ({ node }) => {
    const midia = comoMidia(node.value as Midia)
    const url = urlDaMidia(midia, 'largura')
    if (!url) return ''
    const campos = (node.fields ?? {}) as { legenda?: string; credito?: string }
    const legenda = [campos.legenda ?? midia?.legenda, campos.credito ?? midia?.credito]
      .filter(Boolean)
      .join(' · ')
    const imagem = `<img src="${escapar(urlAbsoluta(url))}" alt="${escapar(midia?.alt ?? '')}" />`
    return `<figure>${imagem}${legenda ? `<figcaption>${escapar(legenda)}</figcaption>` : ''}</figure>`
  },

  relationship: ({ node }) => {
    const valor = node.value as { titulo?: string; nome?: string } | number
    if (!valor || typeof valor !== 'object') return ''
    const rotulo = valor.titulo ?? valor.nome ?? 'ver conteúdo'
    return `<a href="${escapar(enderecoDoDocumento(String(node.relationTo), valor))}">${escapar(rotulo)}</a>`
  },

  // Os blocos do editor viram HTML simples: leitor de feed não conhece o design do portal.
  blocks: {
    destaque: ({ node }: Bloco<{ texto: string; autoria?: string }>) => {
      const { texto, autoria } = node.fields
      const assinatura = autoria ? `<footer>${escapar(autoria)}</footer>` : ''
      return `<blockquote><p>${escapar(texto)}</p>${assinatura}</blockquote>`
    },
    caixa: ({ node }: Bloco<{ titulo: string; texto: string }>) =>
      `<aside><h3>${escapar(node.fields.titulo)}</h3><p>${escapar(node.fields.texto)}</p></aside>`,
    fichaVinho: ({
      node,
    }: Bloco<{ vinho: { slug?: string; produtor?: string; nome?: string; safra?: number } | number }>) => {
      const { vinho } = node.fields
      if (!vinho || typeof vinho !== 'object') return ''
      const nome = [vinho.produtor, vinho.nome, vinho.safra].filter(Boolean).join(' ')
      return `<p><a href="${escapar(enderecoDoDocumento('vinhos', vinho))}">${escapar(nome)}</a></p>`
    },
    listaNumerada: ({
      node,
    }: Bloco<{ titulo?: string; itens?: { titulo: string; texto?: string }[] }>) => {
      const { titulo, itens } = node.fields
      const linhas = (itens ?? [])
        .map(
          (item) =>
            `<li><strong>${escapar(item.titulo)}</strong>${item.texto ? ` — ${escapar(item.texto)}` : ''}</li>`,
        )
        .join('')
      return `${titulo ? `<h3>${escapar(titulo)}</h3>` : ''}<ol>${linhas}</ol>`
    },
  },
})

/**
 * Rede de segurança para o que escapou dos conversores: um link digitado à mão como
 * `/guias/algo` sai do editor relativo e, dentro de um leitor de feed, resolveria
 * contra o domínio do leitor. Aqui todo caminho de raiz vira endereço completo.
 */
const absolutizar = (html: string): string =>
  html.replace(/(href|src)="\/(?!\/)/g, `$1="${URL_SITE}/`)

/** Converte o corpo em HTML; se o documento estiver malformado, cai no resumo. */
const corpoEmHtml = (corpo: unknown, resumo: string): string => {
  try {
    const html = convertLexicalToHTML({
      data: corpo as SerializedEditorState,
      converters: conversores,
      disableContainer: true,
    })
    return absolutizar(html.trim()) || `<p>${escapar(resumo)}</p>`
  } catch {
    // Um documento quebrado tira o texto integral daquele item, não o feed inteiro do ar.
    return `<p>${escapar(resumo)}</p>`
  }
}

/* -------------------------------------------------------------------------- */
/* Itens                                                                       */
/* -------------------------------------------------------------------------- */

interface ItemDoFeed {
  titulo: string
  endereco: string
  data: string
  resumo: string
  autoria: string
  categoria: string
  conteudo: string
}

const publico = (documento: { seo?: { naoIndexar?: boolean | null } | null }): boolean =>
  !documento.seo?.naoIndexar

async function montarItens(): Promise<ItemDoFeed[]> {
  const [config, materias, edicoes] = await Promise.all([
    obterConfiguracoes(),
    listarTextos({ secao: 'materia', limite: QUANTIDADE }),
    listarTextos({ secao: 'boletim', limite: QUANTIDADE }),
  ])

  const assinaturaDaCasa = autoraDe(config).nome ?? (config.nomeSite ?? NOME_SITE)

  const deMaterias: ItemDoFeed[] = materias.docs.filter(publico).map((materia) => ({
    titulo: materia.titulo,
    endereco: urlAbsoluta(`/materias/${materia.slug}`),
    data: materia.dataPublicacao ?? materia.createdAt,
    resumo: resumoOuTrecho(materia),
    autoria: assinaturaDaCasa,
    categoria: categoriaPorValor(materia.categoria)?.label ?? 'Matérias',
    conteudo: corpoEmHtml(materia.corpo, resumoOuTrecho(materia)),
  }))

  const deEdicoes: ItemDoFeed[] = edicoes.docs.filter(publico).map((edicao) => ({
    titulo: `Edição ${edicao.numero} · ${edicao.titulo}`,
    endereco: urlAbsoluta(`/boletim/${edicao.slug}`),
    data: edicao.dataPublicacao ?? edicao.createdAt,
    resumo: resumoOuTrecho(edicao),
    autoria: assinaturaDaCasa,
    categoria: config.boletimTitulo ?? 'Boletim Tanin',
    conteudo: corpoEmHtml(edicao.corpo, resumoOuTrecho(edicao)),
  }))

  return [...deMaterias, ...deEdicoes]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, QUANTIDADE)
}

/* -------------------------------------------------------------------------- */
/* Rota                                                                        */
/* -------------------------------------------------------------------------- */

export async function GET(): Promise<Response> {
  const config = await obterConfiguracoes()
  let itens: ItemDoFeed[] = []

  try {
    itens = await montarItens()
  } catch {
    // Canal vazio é um feed válido; erro 500 desassina o leitor.
    itens = []
  }

  const corpo = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapar(config.nomeSite ?? NOME_SITE)}</title>`,
    `    <link>${escapar(`${URL_SITE}/`)}</link>`,
    `    <description>${escapar(config.descricao ?? 'Vinho contado como quem conversa, não como quem vende.')}</description>`,
    '    <language>pt-BR</language>',
    `    <lastBuildDate>${rfc822(itens[0]?.data)}</lastBuildDate>`,
    `    <atom:link href="${escapar(`${URL_SITE}/rss.xml`)}" rel="self" type="application/rss+xml" />`,
    ...itens.map((item) =>
      [
        '    <item>',
        `      <title>${escapar(item.titulo)}</title>`,
        `      <link>${escapar(item.endereco)}</link>`,
        `      <guid isPermaLink="true">${escapar(item.endereco)}</guid>`,
        `      <pubDate>${rfc822(item.data)}</pubDate>`,
        `      <dc:creator>${cdata(item.autoria)}</dc:creator>`,
        `      <category>${escapar(item.categoria)}</category>`,
        `      <description>${cdata(item.resumo)}</description>`,
        `      <content:encoded>${cdata(item.conteudo)}</content:encoded>`,
        '    </item>',
      ].join('\n'),
    ),
    '  </channel>',
    '</rss>',
  ].join('\n')

  return new Response(corpo, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
