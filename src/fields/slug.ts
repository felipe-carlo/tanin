import type { Field, FieldHook } from 'payload'

/** Transforma "Champagne, o que ninguém conta" em "champagne-o-que-ninguem-conta". */
export const paraSlug = (valor: string): string =>
  valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // tira acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)

const gerarSlug =
  (campoOrigem: string): FieldHook =>
  ({ data, operation, value }) => {
    if (typeof value === 'string' && value.length > 0) return paraSlug(value)
    if (operation === 'create' || operation === 'update') {
      const origem = data?.[campoOrigem]
      if (typeof origem === 'string' && origem.length > 0) return paraSlug(origem)
    }
    return value
  }

/**
 * Campo de slug com preenchimento automático a partir do título.
 * A Ana nunca precisa digitar um slug — mas pode corrigir quando quiser.
 */
export const campoSlug = (campoOrigem = 'titulo'): Field => ({
  name: 'slug',
  type: 'text',
  label: 'Endereço da página (slug)',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description:
      'Preenchido sozinho a partir do título. Prefira slugs curtos, em português, com um tema só.',
  },
  hooks: {
    beforeValidate: [gerarSlug(campoOrigem)],
  },
})

/**
 * Encontra um slug livre acrescentando `-2`, `-3`… quando o endereço já existe.
 *
 * Só faz sentido onde o slug é invisível para quem escreve: se o endereço colide e
 * ninguém pode corrigi-lo à mão, o salvamento morre num erro de unicidade que a autora
 * não tem como interpretar — no meio de um salvamento automático, ainda por cima.
 */
const slugLivre = async (
  req: { payload?: any },
  colecao: string,
  base: string,
  idAtual: number | string | undefined,
): Promise<string> => {
  const payload = req?.payload
  if (!payload) return base

  let candidato = base
  // Vinte tentativas é folga de sobra; passar disso é sinal de outra coisa errada, e
  // devolver o candidato deixa o erro de unicidade aparecer em vez de girar em falso.
  for (let sufixo = 2; sufixo < 22; sufixo += 1) {
    const encontrados = await payload.find({
      collection: colecao,
      where: { slug: { equals: candidato } },
      limit: 5,
      depth: 0,
      pagination: false,
      overrideAccess: true,
    })
    const ocupado = encontrados.docs.find((doc: { id: number | string }) => doc.id !== idAtual)
    if (!ocupado) return candidato
    candidato = `${base}-${sufixo}`
  }

  return candidato
}

/**
 * Slug invisível: nasce do título, some do formulário e se desvia sozinho de colisões.
 *
 * É a contrapartida de uma tela de escrita com três campos. O endereço continua sendo
 * uma decisão editorial importante — só deixou de ser uma decisão que interrompe.
 */
export const campoSlugOculto = (colecao: string, campoOrigem = 'titulo'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: { hidden: true, disableBulkEdit: true },
  hooks: {
    beforeValidate: [
      async ({ data, operation, originalDoc, req, value }) => {
        const id: number | string | undefined = originalDoc?.id ?? data?.id
        const manual = typeof value === 'string' && value.length > 0 ? paraSlug(value) : null
        const origem = data?.[campoOrigem]
        const doTitulo = typeof origem === 'string' && origem.length > 0 ? paraSlug(origem) : null

        // Título ainda em branco não gera endereço: `sem-titulo` viraria o slug
        // definitivo do texto, porque depois disso o campo já não estaria mais vazio.
        const base = manual ?? doTitulo
        if (!base) return value

        // Uma vez publicado, o endereço é um compromisso: link compartilhado, indexado,
        // citado. Renomear o título não pode mudá-lo por baixo dos panos.
        if (operation === 'update' && !manual && typeof value === 'string' && value.length > 0) {
          return value
        }

        return slugLivre(req, colecao, base, id)
      },
    ],
  },
})
