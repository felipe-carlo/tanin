import { cache } from 'react'
import type { Where } from 'payload'

import { normalizarParaBusca } from '@/fields/busca'
import { obterPayload } from '@/lib/payload'
import type { Edicao, Evento, Guia, Materia, Vinho } from '@/payload-types'

/**
 * CONSULTAS DO SITE
 *
 * Tudo que o site lê do banco passa por aqui. Concentrar as consultas em um arquivo
 * só tem uma vantagem prática grande: quando for preciso mexer em cache, em
 * ordenação ou em profundidade de relacionamento, mexe-se em um lugar — e não em
 * dezoito páginas.
 *
 * `depth` merece explicação: é quantos níveis de relacionamento o Payload traz junto.
 * `depth: 1` traz a categoria e o autor como objetos; `depth: 2` traz também a foto
 * do autor. Cada nível a mais é uma consulta a mais no banco, então usamos o menor
 * número que a página realmente precisa.
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
/* Matérias                                                                    */
/* -------------------------------------------------------------------------- */

export const listarMaterias = cache(
  async (opcoes: {
    limite?: number
    pagina?: number
    categoria?: string
    tag?: string
    excluirIds?: number[]
    depth?: number
  } = {}) => {
    const payload = await obterPayload()
    const filtros: Where[] = [publicado()]
    if (opcoes.categoria) filtros.push({ 'categoria.slug': { equals: opcoes.categoria } })
    if (opcoes.tag) filtros.push({ 'tags.slug': { equals: opcoes.tag } })
    if (opcoes.excluirIds?.length) filtros.push({ id: { not_in: opcoes.excluirIds } })

    return payload.find({
      collection: 'materias',
      where: combinar(...filtros),
      sort: '-dataPublicacao',
      limit: opcoes.limite ?? 12,
      page: opcoes.pagina ?? 1,
      depth: opcoes.depth ?? 1,
      overrideAccess: false,
    })
  },
)

export const obterMateria = cache(async (slug: string): Promise<Materia | null> => {
  const payload = await obterPayload()
  const resultado = await payload.find({
    collection: 'materias',
    where: combinar(publicado(), { slug: { equals: slug } }),
    limit: 1,
    depth: 2,
    overrideAccess: false,
  })
  return resultado.docs[0] ?? null
})

/** A manchete: a matéria marcada como candidata mais recente, ou a mais recente. */
export const obterManchete = cache(async (): Promise<Materia | null> => {
  const payload = await obterPayload()
  const destacada = await payload.find({
    collection: 'materias',
    where: combinar(publicado(), { destaqueHome: { equals: true } }),
    sort: '-dataPublicacao',
    limit: 1,
    depth: 2,
    overrideAccess: false,
  })
  if (destacada.docs[0]) return destacada.docs[0]

  const recente = await payload.find({
    collection: 'materias',
    where: publicado(),
    sort: '-dataPublicacao',
    limit: 1,
    depth: 2,
    overrideAccess: false,
  })
  return recente.docs[0] ?? null
})

/* -------------------------------------------------------------------------- */
/* Edições do Boletim                                                          */
/* -------------------------------------------------------------------------- */

export const listarEdicoes = cache(
  async (opcoes: { limite?: number; pagina?: number; ordem?: 'asc' | 'desc' } = {}) => {
    const payload = await obterPayload()
    return payload.find({
      collection: 'edicoes',
      where: publicado(),
      sort: opcoes.ordem === 'asc' ? 'numero' : '-numero',
      limit: opcoes.limite ?? 100,
      page: opcoes.pagina ?? 1,
      depth: 1,
      overrideAccess: false,
    })
  },
)

export const obterEdicao = cache(async (slug: string): Promise<Edicao | null> => {
  const payload = await obterPayload()
  const resultado = await payload.find({
    collection: 'edicoes',
    where: combinar(publicado(), { slug: { equals: slug } }),
    limit: 1,
    depth: 2,
    overrideAccess: false,
  })
  return resultado.docs[0] ?? null
})

/** Edição anterior e seguinte, para navegar o arquivo sem voltar ao índice. */
export const obterVizinhasDaEdicao = cache(
  async (numero: number): Promise<{ anterior: Edicao | null; proxima: Edicao | null }> => {
    const payload = await obterPayload()
    const [anterior, proxima] = await Promise.all([
      payload.find({
        collection: 'edicoes',
        where: combinar(publicado(), { numero: { less_than: numero } }),
        sort: '-numero',
        limit: 1,
        depth: 0,
        overrideAccess: false,
      }),
      payload.find({
        collection: 'edicoes',
        where: combinar(publicado(), { numero: { greater_than: numero } }),
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
  if (filtros.uva?.length) condicoes.push({ 'uvas.uva.slug': { in: filtros.uva } })

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
  const [vinhos, uvas] = await Promise.all([
    payload.find({
      collection: 'vinhos',
      where: publicado(),
      limit: 1000,
      depth: 1,
      select: { pais: true, tipo: true, faixaPreco: true, corNaEscala: true, uvas: true },
      overrideAccess: false,
    }),
    payload.find({ collection: 'uvas', limit: 500, depth: 0, sort: 'nome', overrideAccess: false }),
  ])

  const paises = new Set<string>()
  const tipos = new Set<string>()
  const precos = new Set<string>()
  const cores = new Set<string>()
  const uvasUsadas = new Set<string>()

  vinhos.docs.forEach((vinho) => {
    if (vinho.pais) paises.add(vinho.pais)
    if (vinho.tipo) tipos.add(vinho.tipo)
    if (vinho.faixaPreco) precos.add(vinho.faixaPreco)
    if (vinho.corNaEscala) cores.add(vinho.corNaEscala)
    vinho.uvas?.forEach((item) => {
      const uva = item.uva && typeof item.uva === 'object' ? item.uva : null
      if (uva?.slug) uvasUsadas.add(uva.slug)
    })
  })

  return {
    paises: Array.from(paises).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    tipos: Array.from(tipos),
    precos: Array.from(precos),
    cores: Array.from(cores),
    uvas: uvas.docs
      .filter((uva) => uva.slug && uvasUsadas.has(uva.slug))
      .map((uva) => ({ slug: uva.slug!, nome: uva.nome })),
    total: vinhos.totalDocs,
  }
})

/* -------------------------------------------------------------------------- */
/* Guias                                                                       */
/* -------------------------------------------------------------------------- */

export const listarGuias = cache(
  async (opcoes: { limite?: number; pagina?: number; tipo?: string; nivel?: string } = {}) => {
    const payload = await obterPayload()
    const condicoes: Where[] = [publicado()]
    if (opcoes.tipo) condicoes.push({ tipoGuia: { equals: opcoes.tipo } })
    if (opcoes.nivel) condicoes.push({ nivel: { equals: opcoes.nivel } })

    return payload.find({
      collection: 'guias',
      where: combinar(...condicoes),
      sort: 'titulo',
      limit: opcoes.limite ?? 50,
      page: opcoes.pagina ?? 1,
      depth: 1,
      overrideAccess: false,
    })
  },
)

export const obterGuia = cache(async (slug: string): Promise<Guia | null> => {
  const payload = await obterPayload()
  const resultado = await payload.find({
    collection: 'guias',
    where: combinar(publicado(), { slug: { equals: slug } }),
    limit: 1,
    depth: 2,
    overrideAccess: false,
  })
  return resultado.docs[0] ?? null
})

/* -------------------------------------------------------------------------- */
/* Eventos                                                                     */
/* -------------------------------------------------------------------------- */

export const listarEventos = cache(
  async (opcoes: { futuros?: boolean; limite?: number } = {}): Promise<Evento[]> => {
    const payload = await obterPayload()
    const condicoes: Where[] = [{ _status: { equals: 'published' } }]
    if (opcoes.futuros !== false) {
      // Um evento continua na agenda até o fim do dia em que acontece.
      const inicioDeHoje = new Date()
      inicioDeHoje.setHours(0, 0, 0, 0)
      condicoes.push({
        or: [
          { data: { greater_than_equal: inicioDeHoje.toISOString() } },
          { dataFim: { greater_than_equal: inicioDeHoje.toISOString() } },
        ],
      })
    }

    const resultado = await payload.find({
      collection: 'eventos',
      where: combinar(...condicoes),
      sort: 'data',
      limit: opcoes.limite ?? 60,
      depth: 1,
      overrideAccess: false,
    })
    return resultado.docs
  },
)

/* -------------------------------------------------------------------------- */
/* Autora                                                                      */
/* -------------------------------------------------------------------------- */

export const obterAutoraPrincipal = cache(async () => {
  const payload = await obterPayload()
  const resultado = await payload.find({
    collection: 'autores',
    limit: 1,
    depth: 2,
    sort: 'createdAt',
    overrideAccess: false,
  })
  return resultado.docs[0] ?? null
})

/* -------------------------------------------------------------------------- */
/* Busca                                                                       */
/* -------------------------------------------------------------------------- */

export type ResultadoDeBusca = {
  tipo: 'materia' | 'edicao' | 'vinho' | 'guia'
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
  const [materias, edicoes, vinhos, guias] = await Promise.all([
    payload.find({
      collection: 'materias',
      where: combinar(publicado(), contem),
      limit: 12,
      depth: 0,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'edicoes',
      where: combinar(publicado(), contem),
      limit: 12,
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
    payload.find({
      collection: 'guias',
      where: combinar(publicado(), contem),
      limit: 12,
      depth: 0,
      overrideAccess: false,
    }),
  ])

  return [
    ...materias.docs.map((doc) => ({
      tipo: 'materia' as const,
      id: doc.id,
      titulo: doc.titulo,
      resumo: doc.resumo,
      endereco: `/materias/${doc.slug}`,
      chipCor: doc.chipCor,
      data: doc.dataPublicacao,
    })),
    ...guias.docs.map((doc) => ({
      tipo: 'guia' as const,
      id: doc.id,
      titulo: doc.titulo,
      resumo: doc.resumo,
      endereco: `/guias/${doc.slug}`,
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
    ...edicoes.docs.map((doc) => ({
      tipo: 'edicao' as const,
      id: doc.id,
      titulo: `Edição ${doc.numero}: ${doc.titulo}`,
      resumo: doc.resumo,
      endereco: `/boletim/${doc.slug}`,
      chipCor: doc.chipCor,
      data: doc.dataEnvio,
    })),
  ]
})
