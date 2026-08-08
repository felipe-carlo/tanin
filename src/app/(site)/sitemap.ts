import type { MetadataRoute } from 'next'
import type { Where } from 'payload'

import { obterPayload } from '@/lib/payload'
import { BASE_POR_SECAO, type Secao } from '@/lib/secoes'
import { URL_SITE } from '@/lib/site'

/**
 * O MAPA DO SITE
 *
 * Remontado a cada hora. Nenhum robô espera pelo banco, e o conteúdo novo entra no
 * mapa sem ninguém precisar publicar nada de novo.
 */
export const revalidate = 3600

type Frequencia = MetadataRoute.Sitemap[number]['changeFrequency']

const endereco = (caminho: string): string => `${URL_SITE}${caminho}`

/** Todas as seções, quando a rota fixa é o índice de uma delas. */
const TUDO = '*'

/**
 * As páginas que existem mesmo com o banco vazio.
 *
 * `secao` é de onde sai o `lastmod` do índice: a data do conteúdo mais novo que ele
 * lista. Quem não tem seção sai sem `lastmod` nenhum, de propósito — carimbar a hora
 * da requisição em toda página faz o Google concluir que o campo é automático e
 * descartar o `lastmod` do mapa inteiro, inclusive o das matérias, que é o único que
 * de fato informa alguma coisa.
 */
const ROTAS_FIXAS: {
  caminho: string
  prioridade: number
  frequencia: Frequencia
  secao?: string
}[] = [
  { caminho: '/', prioridade: 1, frequencia: 'daily', secao: TUDO },
  { caminho: '/materias', prioridade: 0.8, frequencia: 'daily', secao: '/materias' },
  { caminho: '/boletim', prioridade: 0.8, frequencia: 'weekly', secao: '/boletim' },
  { caminho: '/vinhos', prioridade: 0.8, frequencia: 'daily', secao: '/vinhos' },
  { caminho: '/guias', prioridade: 0.8, frequencia: 'weekly', secao: '/guias' },
  { caminho: '/sobre', prioridade: 0.6, frequencia: 'yearly' },
  // A busca só serve a quem já está dentro do site: entra no mapa, mas por último.
  { caminho: '/busca', prioridade: 0.2, frequencia: 'monthly' },
]

/** A mesma regra que o site usa para exibir conteúdo: publicado e com data já vencida. */
const publicado = (): Where => ({
  and: [
    { _status: { equals: 'published' } },
    {
      or: [
        { dataPublicacao: { less_than_equal: new Date().toISOString() } },
        { dataPublicacao: { exists: false } },
      ],
    },
  ],
})

interface DocumentoDoMapa {
  slug?: string | null
  secao?: string | null
  dataAtualizacao?: string | null
  updatedAt?: string | null
  seo?: { naoIndexar?: boolean | null } | null
}

interface SecaoDoMapa {
  base: string
  rotas: MetadataRoute.Sitemap
  /** A data do documento mais novo da seção — vira o `lastmod` honesto do índice. */
  atualizadaEm?: Date
}

const montarSecao = (
  base: string,
  documentos: DocumentoDoMapa[],
  prioridade: number,
  frequencia: Frequencia,
): SecaoDoMapa => {
  const publicos = documentos.filter((documento) => documento.slug && !documento.seo?.naoIndexar)
  const datas = publicos.map(
    (documento) => new Date(documento.dataAtualizacao ?? documento.updatedAt ?? Date.now()),
  )

  return {
    base,
    rotas: publicos.map((documento, indice) => ({
      url: endereco(`${base}/${documento.slug}`),
      lastModified: datas[indice],
      changeFrequency: frequencia,
      priority: prioridade,
    })),
    atualizadaEm:
      datas.length > 0 ? new Date(Math.max(...datas.map((data) => data.getTime()))) : undefined,
  }
}

async function rotasDeConteudo(): Promise<SecaoDoMapa[]> {
  const payload = await obterPayload()
  const comum = { where: publicado(), depth: 0, pagination: false, overrideAccess: false }

  const [textos, vinhos] = await Promise.all([
    payload.find({
      collection: 'textos',
      ...comum,
      select: { slug: true, secao: true, dataAtualizacao: true, updatedAt: true, seo: true },
    }),
    payload.find({
      collection: 'vinhos',
      ...comum,
      select: { slug: true, dataAtualizacao: true, updatedAt: true, seo: true },
    }),
  ])

  const daSecao = (secao: Secao) => textos.docs.filter((texto) => texto.secao === secao)

  return [
    montarSecao(BASE_POR_SECAO.materia, daSecao('materia'), 0.7, 'monthly'),
    // Uma edição enviada é um arquivo fechado: muda de endereço nunca, de conteúdo quase nunca.
    montarSecao(BASE_POR_SECAO.boletim, daSecao('boletim'), 0.7, 'yearly'),
    montarSecao(BASE_POR_SECAO.guia, daSecao('guia'), 0.7, 'monthly'),
    montarSecao('/vinhos', vinhos.docs, 0.7, 'monthly'),
  ]
}

const maisRecente = (datas: (Date | undefined)[]): Date | undefined =>
  datas
    .filter((data): data is Date => data instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let secoes: SecaoDoMapa[] = []
  try {
    secoes = await rotasDeConteudo()
  } catch {
    // Um mapa parcial ainda entrega os índices ao robô; um erro 500 não entrega nada.
  }

  const porSecao = new Map(secoes.map((secao) => [secao.base, secao.atualizadaEm]))
  const doPortalInteiro = maisRecente(secoes.map((secao) => secao.atualizadaEm))

  const fixas: MetadataRoute.Sitemap = ROTAS_FIXAS.map(
    ({ caminho, prioridade, frequencia, secao }) => {
      const atualizadaEm = secao === TUDO ? doPortalInteiro : secao && porSecao.get(secao)
      return {
        url: endereco(caminho),
        ...(atualizadaEm ? { lastModified: atualizadaEm } : {}),
        changeFrequency: frequencia,
        priority: prioridade,
      }
    },
  )

  return [...fixas, ...secoes.flatMap((secao) => secao.rotas)]
}
