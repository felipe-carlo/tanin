import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

import { BASE_DOS_TEXTOS } from '@/lib/secoes'

/**
 * REVALIDAÇÃO SOB DEMANDA
 *
 * As páginas do site são geradas de antemão e servidas prontas — é o que faz o portal
 * abrir rápido no celular de quem chega pelo Instagram. O efeito colateral é que uma
 * página pronta continua pronta, mesmo depois de o texto mudar no painel.
 *
 * Estes ganchos resolvem isso: quando a Ana publica ou corrige alguma coisa, o Next
 * é avisado e refaz só as páginas afetadas. Na prática, ela salva e vê no ar.
 *
 * O `try` é obrigatório: `revalidatePath` só existe dentro de uma requisição do Next.
 * Quando o Payload é usado fora dele — pelo script de conteúdo de exemplo, pela
 * importação do beehiiv — não há o que revalidar, e falhar ali seria absurdo.
 */
async function revalidar(caminhos: string[]): Promise<void> {
  try {
    const { revalidatePath } = await import('next/cache')
    caminhos.forEach((caminho) => revalidatePath(caminho))
  } catch {
    // Fora de uma requisição do Next não há cache para limpar. Seguimos em frente.
  }
}

/** Caminhos que sempre listam conteúdo novo e por isso envelhecem juntos. */
const SEMPRE = ['/', '/sitemap.xml', '/rss.xml', '/llms.txt']

/**
 * Monta os ganchos de uma coleção.
 *
 * @param indice   endereço do índice da coleção, ex.: '/materias'
 * @param extras   outros endereços que mostram este conteúdo
 */
export const ganchosDeRevalidacao = (
  indice: string,
  extras: string[] = [],
): {
  afterChange: CollectionAfterChangeHook[]
  afterDelete: CollectionAfterDeleteHook[]
} => ({
  afterChange: [
    async ({ doc, previousDoc, context }) => {
      // O autosave de rascunho dispara este gancho a cada segundo e meio. Revalidar a
      // cada tecla digitada seria desperdício puro — só interessa o que está publicado.
      const foiPublicado = doc?._status === 'published'
      const eraPublicado = previousDoc?._status === 'published'
      if (!foiPublicado && !eraPublicado) return doc
      if (context?.pularRevalidacao) return doc

      const caminhos = [...SEMPRE, indice, ...extras]
      if (doc?.slug) caminhos.push(`${indice}/${doc.slug}`)
      // Um slug que mudou deixa a página antiga órfã no cache; limpa também.
      if (previousDoc?.slug && previousDoc.slug !== doc?.slug) {
        caminhos.push(`${indice}/${previousDoc.slug}`)
      }
      await revalidar(caminhos)
      return doc
    },
  ],
  afterDelete: [
    async ({ doc }) => {
      const caminhos = [...SEMPRE, indice, ...extras]
      if (doc?.slug) caminhos.push(`${indice}/${doc.slug}`)
      await revalidar(caminhos)
      return doc
    },
  ],
})

/**
 * Ganchos da coleção de textos.
 *
 * O índice já dependeu da seção do documento; hoje há um endereço só, e o que sobra
 * de cuidado é o slug: um texto que mudou de endereço deixa a página antiga órfã no
 * cache, e ela precisa ser limpa junto.
 */
export const ganchosDeRevalidacaoPorSecao = (): {
  afterChange: CollectionAfterChangeHook[]
  afterDelete: CollectionAfterDeleteHook[]
} => ganchosDeRevalidacao(BASE_DOS_TEXTOS)

/** Mexer nas configurações do site muda o cabeçalho e o rodapé de todas as páginas. */
export const revalidarSiteInteiro: GlobalAfterChangeHook = async ({ doc }) => {
  await revalidar(['/', '/materias', '/vinhos', '/busca', '/sobre'])
  return doc
}
