import type { MetadataRoute } from 'next'
import type { Where } from 'payload'

import { obterPayload } from '@/lib/payload'
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

/** As páginas que existem mesmo com o banco vazio. */
const ROTAS_FIXAS: { caminho: string; prioridade: number; frequencia: Frequencia }[] = [
  { caminho: '/', prioridade: 1, frequencia: 'daily' },
  { caminho: '/materias', prioridade: 0.8, frequencia: 'daily' },
  { caminho: '/boletim', prioridade: 0.8, frequencia: 'weekly' },
  { caminho: '/vinhos', prioridade: 0.8, frequencia: 'daily' },
  { caminho: '/guias', prioridade: 0.8, frequencia: 'weekly' },
  { caminho: '/agenda', prioridade: 0.8, frequencia: 'weekly' },
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
  dataAtualizacao?: string | null
  updatedAt?: string | null
  seo?: { naoIndexar?: boolean | null } | null
}

const rotas = (
  base: string,
  documentos: DocumentoDoMapa[],
  prioridade: number,
  frequencia: Frequencia,
): MetadataRoute.Sitemap =>
  documentos
    .filter((documento) => documento.slug && !documento.seo?.naoIndexar)
    .map((documento) => ({
      url: endereco(`${base}/${documento.slug}`),
      lastModified: new Date(documento.dataAtualizacao ?? documento.updatedAt ?? Date.now()),
      changeFrequency: frequencia,
      priority: prioridade,
    }))

async function rotasDeConteudo(): Promise<MetadataRoute.Sitemap> {
  const payload = await obterPayload()
  const comum = { where: publicado(), depth: 0, pagination: false, overrideAccess: false }

  const [materias, edicoes, vinhos, guias] = await Promise.all([
    payload.find({
      collection: 'materias',
      ...comum,
      select: { slug: true, dataAtualizacao: true, updatedAt: true, seo: true },
    }),
    payload.find({
      collection: 'edicoes',
      ...comum,
      select: { slug: true, updatedAt: true, seo: true },
    }),
    payload.find({
      collection: 'vinhos',
      ...comum,
      select: { slug: true, dataAtualizacao: true, updatedAt: true, seo: true },
    }),
    payload.find({
      collection: 'guias',
      ...comum,
      select: { slug: true, dataAtualizacao: true, updatedAt: true, seo: true },
    }),
  ])

  return [
    ...rotas('/materias', materias.docs, 0.7, 'monthly'),
    // Uma edição enviada é um arquivo fechado: muda de endereço nunca, de conteúdo quase nunca.
    ...rotas('/boletim', edicoes.docs, 0.7, 'yearly'),
    ...rotas('/vinhos', vinhos.docs, 0.7, 'monthly'),
    ...rotas('/guias', guias.docs, 0.7, 'monthly'),
  ]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixas: MetadataRoute.Sitemap = ROTAS_FIXAS.map(({ caminho, prioridade, frequencia }) => ({
    url: endereco(caminho),
    lastModified: new Date(),
    changeFrequency: frequencia,
    priority: prioridade,
  }))

  try {
    return [...fixas, ...(await rotasDeConteudo())]
  } catch {
    // Um mapa parcial ainda entrega os índices ao robô; um erro 500 não entrega nada.
    return fixas
  }
}
