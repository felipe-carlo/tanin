/**
 * AS SEÇÕES DO PORTAL
 *
 * Todo texto — matéria, edição do boletim ou guia — mora na mesma coleção e se
 * diferencia por um campo `secao`. Este arquivo é a fonte única da verdade sobre
 * o que cada seção significa e onde ela mora no site: o painel monta o select a
 * partir daqui, e o site resolve endereços a partir daqui. Mudou aqui, mudou em
 * todo lugar.
 */

export const SECOES = [
  { value: 'materia', label: 'Matéria', base: '/materias' },
  { value: 'boletim', label: 'Edição do Boletim', base: '/boletim' },
  { value: 'guia', label: 'Guia', base: '/guias' },
] as const

export type Secao = (typeof SECOES)[number]['value']

export const OPCOES_SECAO = SECOES.map(({ value, label }) => ({ value, label }))

export const BASE_POR_SECAO = Object.fromEntries(
  SECOES.map(({ value, base }) => [value, base]),
) as Record<Secao, string>

export const rotuloDaSecao = (secao?: string | null): string =>
  SECOES.find(({ value }) => value === secao)?.label ?? 'Texto'

/** Endereço público de um texto — a seção decide a base, o slug completa. */
export const enderecoDoTexto = (doc?: {
  secao?: string | null
  slug?: string | null
} | null): string => {
  const base = BASE_POR_SECAO[(doc?.secao ?? 'materia') as Secao] ?? '/materias'
  return doc?.slug ? `${base}/${doc.slug}` : base
}

/**
 * Endereço público de qualquer documento ligável a partir do editor: textos são
 * resolvidos pela seção, vinhos pelo slug. Um valor despovoado (só o id) cai na
 * raiz — melhor um link genérico do que um endereço quebrado.
 */
export const enderecoDoDoc = (relacao?: string | null, valor?: unknown): string => {
  const doc =
    valor && typeof valor === 'object'
      ? (valor as { secao?: string | null; slug?: string | null })
      : undefined
  if (relacao === 'vinhos') return doc?.slug ? `/vinhos/${doc.slug}` : '/vinhos'
  if (relacao === 'textos' && doc?.slug) return enderecoDoTexto(doc)
  return '/'
}
