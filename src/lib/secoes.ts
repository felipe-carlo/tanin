/**
 * AS SEÇÕES DO PORTAL — HOJE, UMA SÓ
 *
 * Todo texto mora na mesma coleção e carrega um campo `secao`. O portal já teve três
 * — matéria, edição do boletim e guia — e hoje publica só uma: **texto**, em
 * `/materias`. O campo saiu do formulário e vale sempre `materia`.
 *
 * As três continuam declaradas aqui de propósito. `OPCOES_SECAO` alimenta as `options`
 * do campo no Payload, que no Postgres é o enum `enum_textos_secao`: cortar a lista
 * geraria um `ALTER TYPE` derrubando valores de enum — destrutivo contra as linhas de
 * boletim e guia que já existem no banco. Declaradas e não usadas, elas não custam
 * nada e mantêm a volta barata.
 *
 * O que mudou é o que o *site* expõe: `enderecoDoTexto` devolve `/materias/:slug` para
 * qualquer texto, inclusive os gravados como boletim ou guia, para que nenhum deles
 * fique apontando para uma rota que não existe mais. As rotas antigas respondem com 301
 * (ver `next.config.mjs`).
 */

export const SECOES = [
  { value: 'materia', label: 'Matéria', base: '/materias' },
  { value: 'boletim', label: 'Edição do Boletim', base: '/boletim' },
  { value: 'guia', label: 'Guia', base: '/guias' },
] as const

export type Secao = (typeof SECOES)[number]['value']

export const OPCOES_SECAO = SECOES.map(({ value, label }) => ({ value, label }))

/** A única seção que o site publica hoje. */
export const SECAO_PADRAO: Secao = 'materia'

/** Onde os textos moram. Uma constante, porque hoje há um endereço só. */
export const BASE_DOS_TEXTOS = '/materias'

/**
 * Endereço público de um texto.
 *
 * Ignora a seção gravada: tudo responde em `/materias/:slug`. Um texto antigo marcado
 * como guia continua no ar, no endereço novo, em vez de apontar para uma rota morta.
 */
export const enderecoDoTexto = (doc?: { slug?: string | null } | null): string =>
  doc?.slug ? `${BASE_DOS_TEXTOS}/${doc.slug}` : BASE_DOS_TEXTOS

/**
 * Endereço público de qualquer documento ligável a partir do editor: textos pelo slug,
 * vinhos pelo slug. Um valor despovoado (só o id) cai na raiz — melhor um link
 * genérico do que um endereço quebrado.
 */
export const enderecoDoDoc = (relacao?: string | null, valor?: unknown): string => {
  const doc =
    valor && typeof valor === 'object' ? (valor as { slug?: string | null }) : undefined
  if (relacao === 'vinhos') return doc?.slug ? `/vinhos/${doc.slug}` : '/vinhos'
  if (relacao === 'textos' && doc?.slug) return enderecoDoTexto(doc)
  return '/'
}
