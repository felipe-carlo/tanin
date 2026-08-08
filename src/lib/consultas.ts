import { cache } from 'react'
import type { Where } from 'payload'

import { normalizarParaBusca } from '@/fields/busca'
import { obterPayload } from '@/lib/payload'
import { enderecoDoTexto, type Secao } from '@/lib/secoes'
import { resumoOuTrecho } from '@/lib/texto'
import type { Texto, Vinho } from '@/payload-types'

/**
 * CONSULTAS DO SITE
 *
 * Tudo que o site lê do banco passa por aqui. Concentrar as consultas em um arquivo
 * só tem uma vantagem prática grande: quando for preciso mexer em cache, em
 * ordenação ou em profundidade de relacionamento, mexe-se em um lugar — e não em
 * dezoito páginas.
 *
 * `depth` merece explicação: é quantos níveis de relacionamento o Payload traz junto.
 * `depth: 1` traz a imagem de destaque como objeto; `depth: 2` traz também os
 * relacionados populados. Cada nível a mais é uma consulta a mais no banco, então
 * usamos o menor número que a página realmente precisa.
 */

/** Só conteúdo publicado e com data de publicação já passada. */
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

const combinar = (...condicoes: (Where | undefined)[]): Where => {
  const validas = condicoes.filter(Boolean) as Where[]
  return validas.length === 1 ? validas[0] : { and: validas }
}

/* -------------------------------------------------------------------------- */
/* Textos — matérias, edições do boletim e guias, numa coleção só              */
/* -------------------------------------------------------------------------- */

/** A ordenação natural de cada seção: cronológica, por número ou alfabética. */
const ORDEM_PADRAO: Record<Secao, string> = {
  materia: '-dataPublicacao',
  boletim: '-numero',
  guia: 'titulo',
}

export const listarTextos = cache(
  async (opcoes: {
    secao: Secao
    limite?: number
    pagina?: number
    categoria?: string
    tipoGuia?: string
    nivel?: string
    excluirIds?: number[]
    ordem?: string
    depth?: number
  }) => {
    const payload = await obterPayload()
    const filtros: Where[] = [publicado(), { secao: { equals: opcoes.secao } }]
    if (opcoes.categoria) filtros.push({ categoria: { equals: opcoes.categoria } })
    if (opcoes.tipoGuia) filtros.push({ tipoGuia: { equals: opcoes.tipoGuia } })
    if (opcoes.nivel) filtros.push({ nivel: { equals: opcoes.nivel } })
    if (opcoes.excluirIds?.length) filtros.push({ id: { not_in: opcoes.excluirIds } })

    return payload.find({
      collection: 'textos',
      where: combinar(...filtros),
      sort: opcoes.ordem ?? ORDEM_PADRAO[opcoes.secao],
      limit: opcoes.limite ?? 12,
      page: opcoes.pagina ?? 1,
      depth: opcoes.depth ?? 1,
      overrideAccess: false,
    })
  },
)

/**
 * Um texto pelo slug, DENTRO da seção pedida.
 *
 * A seção faz parte do endereço: um guia não pode responder em /materias/…, então
 * a consulta filtra pelas duas coisas e a URL errada devolve 404, não conteúdo.
 */
export const obterTexto = cache(
  async (secao: Secao, slug: string): Promise<Texto | null> => {
    const payload = await obterPayload()
    const resultado = await payload.find({
      collection: 'textos',
      where: combinar(publicado(), { secao: { equals: secao } }, { slug: { equals: slug } }),
      limit: 1,
      depth: 2,
      overrideAccess: false,
    })
    return resultado.docs[0] ?? null
  },
)

/** A manchete: a matéria marcada como candidata mais recente, ou a mais recente. */
export const obterManchete = cache(async (): Promise<Texto | null> => {
  const payload = await obterPayload()
  const destacada = await payload.find({
    collection: 'textos',
    where: combinar(publicado(), { secao: { equals: 'materia' } }, { destaqueHome: { equals: true } }),
    sort: '-dataPublicacao',
    limit: 1,
    depth: 2,
    overrideAccess: false,
  })
  if (destacada.docs[0]) return destacada.docs[0]

  const recente = await payload.find({
    collection: 'textos',
    where: combinar(publicado(), { secao: { equals: 'materia' } }),
    sort: '-dataPublicacao',
    limit: 1,
    depth: 2,
    overrideAccess: false,
  })
  return recente.docs[0] ?? null
})

/** Edição anterior e seguinte, para navegar o arquivo sem voltar ao índice. */
export const obterVizinhasDaEdicao = cache(
  async (numero: number): Promise<{ anterior: Texto | null; proxima: Texto | null }> => {
    const payload = await obterPayload()
    const boletim: Where = { secao: { equals: 'boletim' } }
    const [anterior, proxima] = await Promise.all([
      payload.find({
        collection: 'textos',
        where: combinar(publicado(), boletim, { numero: { less_than: numero } }),
        sort: '-numero',
        limit: 1,
        depth: 0,
        overrideAccess: false,
      }),
      payload.find({
        collection: 'textos',
        where: combinar(publicado(), boletim, { numero: { greater_than: numero } }),
        sort: 'numero',
        limit: 1,
        depth: 0,
        overrideAccess: false,
      }),
    ])
    return { anterior: anterior.docs[0] ?? null, proxima: proxima.docs[0] ?? null }
  },
)

/* -------------------------------------------------------------------------- */
/* Vinhos                                                                      */
/* -------------------------------------------------------------------------- */

export interface FiltrosDeVinho {
  tipo?: string[]
  pais?: string[]
  uva?: string[]
  preco?: string[]
  cor?: string[]
  corpo?: string[]
  ordem?: 'recentes' | 'nota' | 'nome'
  pagina?: number
  limite?: number
}

export const listarVinhos = cache(async (filtros: FiltrosDeVinho = {}) => {
  const payload = await obterPayload()
  const condicoes: Where[] = [publicado()]

  if (filtros.tipo?.length) condicoes.push({ tipo: { in: filtros.tipo } })
  if (filtros.pais?.length) condicoes.push({ pais: { in: filtros.pais } })
  if (filtros.preco?.length) condicoes.push({ faixaPreco: { in: filtros.preco } })
  if (filtros.cor?.length) condicoes.push({ corNaEscala: { in: filtros.cor } })
  if (filtros.corpo?.length) condicoes.push({ corpo: { in: filtros.corpo } })
  // A uva é texto na ficha; o filtro compara o nome como está escrito.
  if (filtros.uva?.length) condicoes.push({ 'uvas.uva': { in: filtros.uva } })

  const ordenacao = {
    recentes: '-dataPublicacao',
    nota: '-nota',
    nome: 'nome',
  }[filtros.ordem ?? 'recentes']

  return payload.find({
    collection: 'vinhos',
    where: combinar(...condicoes),
    sort: ordenacao,
    limit: filtros.limite ?? 24,
    page: filtros.pagina ?? 1,
    depth: 1,
    overrideAccess: false,
  })
})

export const obterVinho = cache(async (slug: string): Promise<Vinho | null> => {
  const payload = await obterPayload()
  const resultado = await payload.find({
    collection: 'vinhos',
    where: combinar(publicado(), { slug: { equals: slug } }),
    limit: 1,
    depth: 2,
    overrideAccess: false,
  })
  return resultado.docs[0] ?? null
})

/** Valores realmente presentes no acervo — para montar filtros sem opções mortas. */
export const opcoesDeFiltroDeVinho = cache(async () => {
  const payload = await obterPayload()
  const vinhos = await payload.find({
    collection: 'vinhos',
    where: publicado(),
    limit: 1000,
    depth: 0,
    select: { pais: true, tipo: true, faixaPreco: true, corNaEscala: true, uvas: true },
    overrideAccess: false,
  })

  const paises = new Set<string>()
  const tipos = new Set<string>()
  const precos = new Set<string>()
  const cores = new Set<string>()
  const uvas = new Set<string>()

  vinhos.docs.forEach((vinho) => {
    if (vinho.pais) paises.add(vinho.pais)
    if (vinho.tipo) tipos.add(vinho.tipo)
    if (vinho.faixaPreco) precos.add(vinho.faixaPreco)
    if (vinho.corNaEscala) cores.add(vinho.corNaEscala)
    vinho.uvas?.forEach((item) => {
      if (item.uva) uvas.add(item.uva)
    })
  })

  const ordenar = (valores: Set<string>) =>
    Array.from(valores).sort((a, b) => a.localeCompare(b, 'pt-BR'))

  return {
    paises: ordenar(paises),
    tipos: Array.from(tipos),
    precos: Array.from(precos),
    cores: Array.from(cores),
    uvas: ordenar(uvas),
    total: vinhos.totalDocs,
  }
})

/* -------------------------------------------------------------------------- */
/* Busca                                                                       */
/* -------------------------------------------------------------------------- */

export type ResultadoDeBusca = {
  tipo: Secao | 'vinho'
  id: number
  titulo: string
  resumo?: string | null
  endereco: string
  chipCor?: string | null
  data?: string | null
}

/**
 * Busca no acervo inteiro.
 *
 * Procura no `indiceBusca` — a cópia sem acento e em caixa baixa que cada documento
 * guarda de si mesmo. É o que faz "regiao" encontrar "região" e "sao paulo" encontrar
 * "São Paulo", que é como as pessoas de fato digitam no celular.
 *
 * Cada palavra da consulta precisa aparecer, mas não necessariamente juntas nem na
 * mesma ordem: "malbec argentina" acha uma ficha que diz "Malbec de Mendoza, Argentina".
 *
 * Usa o `like` do Postgres em vez de um serviço externo. Para um acervo da ordem de
 * milhares de documentos isso resolve bem, custa zero e não acrescenta um serviço a
 * manter. Se um dia ficar lento, o lugar para trocar a implementação é este — e só este.
 */
export const buscar = cache(async (termo: string): Promise<ResultadoDeBusca[]> => {
  const consulta = normalizarParaBusca(termo)
  if (consulta.length < 2) return []

  const palavras = consulta.split(' ').filter((palavra) => palavra.length >= 2).slice(0, 6)
  if (palavras.length === 0) return []

  const contem: Where = {
    and: palavras.map((palavra) => ({ indiceBusca: { like: palavra } })),
  }

  const payload = await obterPayload()
  const [textos, vinhos] = await Promise.all([
    payload.find({
      collection: 'textos',
      where: combinar(publicado(), contem),
      limit: 36,
      depth: 0,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'vinhos',
      where: combinar(publicado(), contem),
      limit: 12,
      depth: 0,
      overrideAccess: false,
    }),
  ])

  return [
    ...textos.docs.map((doc) => ({
      tipo: (doc.secao ?? 'materia') as Secao,
      id: doc.id,
      titulo:
        doc.secao === 'boletim' && doc.numero
          ? `Edição ${doc.numero}: ${doc.titulo}`
          : doc.titulo,
      resumo: resumoOuTrecho(doc),
      endereco: enderecoDoTexto(doc),
      chipCor: doc.chipCor,
      data: doc.dataAtualizacao ?? doc.dataPublicacao,
    })),
    ...vinhos.docs.map((doc) => ({
      tipo: 'vinho' as const,
      id: doc.id,
      titulo: [doc.produtor, doc.nome, doc.safra].filter(Boolean).join(' '),
      resumo: doc.veredito,
      endereco: `/vinhos/${doc.slug}`,
      chipCor: doc.corNaEscala,
      data: doc.dataPublicacao,
    })),
  ]
})
