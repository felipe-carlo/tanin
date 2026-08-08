import { paraSlug } from '@/fields/slug'

/**
 * UTILITÁRIOS QUE LEEM O CORPO DO TEXTO
 *
 * O corpo é um documento Lexical — uma árvore de nós. Estas funções andam por ela
 * para derivar o que o painel não deve pedir duas vezes: o tempo de leitura, o
 * trecho que substitui um resumo em branco e o índice de âncoras de uma edição.
 */

/** Texto puro de um nó do editor, descendo pelos filhos. */
export const textoDoNo = (no: unknown): string => {
  if (!no || typeof no !== 'object') return ''
  const registro = no as { text?: unknown; children?: unknown[] }
  if (typeof registro.text === 'string') return registro.text
  if (Array.isArray(registro.children)) return registro.children.map(textoDoNo).join('')
  return ''
}

/** Os nós de primeiro nível do documento, venha ele como estado ou como raiz. */
const nosDaRaiz = (corpo: unknown): unknown[] => {
  if (!corpo || typeof corpo !== 'object') return []
  const raiz = (corpo as { root?: { children?: unknown[] } }).root
  return Array.isArray(raiz?.children) ? raiz.children : []
}

/** Conta as palavras do documento Lexical e converte em minutos a 200 palavras/min. */
export function estimarTempoLeitura(corpo: unknown): number {
  let palavras = 0
  const andar = (no: any): void => {
    if (!no || typeof no !== 'object') return
    if (typeof no.text === 'string') palavras += no.text.trim().split(/\s+/).filter(Boolean).length
    const filhos = no.children ?? no.root?.children
    if (Array.isArray(filhos)) filhos.forEach(andar)
    if (no.fields && typeof no.fields === 'object') {
      Object.values(no.fields).forEach((valor) => {
        if (typeof valor === 'string') palavras += valor.trim().split(/\s+/).filter(Boolean).length
        else if (Array.isArray(valor)) valor.forEach(andar)
      })
    }
  }
  andar(corpo)
  return Math.max(1, Math.round(palavras / 200))
}

/** As primeiras frases do corpo, para quando o resumo ficou em branco. */
export function trechoDoCorpo(corpo: unknown, limitePalavras = 55): string {
  const palavras: string[] = []
  for (const no of nosDaRaiz(corpo)) {
    const tipo = (no as { type?: string })?.type
    if (tipo !== 'paragraph') continue
    const texto = textoDoNo(no).trim()
    if (!texto) continue
    palavras.push(...texto.split(/\s+/))
    if (palavras.length >= limitePalavras) break
  }
  if (palavras.length === 0) return ''
  const cortado = palavras.length > limitePalavras
  return palavras.slice(0, limitePalavras).join(' ') + (cortado ? '…' : '')
}

/**
 * O resumo de um texto, com queda para o começo do corpo.
 *
 * O resumo deixou de ser obrigatório: quem quiser um trecho lapidado para o
 * Google e para os cartões escreve um; quem não quiser publica assim mesmo,
 * e o site usa as primeiras linhas do próprio texto.
 */
export const resumoOuTrecho = (doc?: {
  resumo?: string | null
  corpo?: unknown
} | null): string => {
  if (doc?.resumo) return doc.resumo
  return trechoDoCorpo(doc?.corpo)
}

export interface ItemDeIndice {
  titulo: string
  ancora: string
}

/**
 * O índice "Nesta edição", derivado dos títulos H2 do corpo.
 *
 * As âncoras usam a MESMA conversão (`paraSlug`) que o renderizador aplica ao dar
 * `id` aos títulos — os dois lados batem por construção, e o índice nunca
 * dessincroniza do texto, porque não existe em separado dele.
 */
export function extrairIndice(corpo: unknown): ItemDeIndice[] {
  const itens: ItemDeIndice[] = []
  for (const no of nosDaRaiz(corpo)) {
    const registro = no as { type?: string; tag?: string }
    if (registro?.type !== 'heading' || registro?.tag !== 'h2') continue
    const titulo = textoDoNo(no).trim()
    const ancora = paraSlug(titulo)
    if (titulo && ancora) itens.push({ titulo, ancora })
  }
  return itens
}
