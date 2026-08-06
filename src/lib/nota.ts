/**
 * A ESCALA DE NOTA DA TANIN.
 *
 * DECISÃO TOMADA (confirmar): cinco taças, com meias taças — de 1,0 a 5,0.
 *
 * Por quê, e não 100 pontos: a escala de 100 é o dialeto da indústria (Parker, Wine
 * Spectator). Ela comunica bem para quem vende vinho e mal para quem bebe vinho —
 * ninguém fora do ramo sabe dizer o que separa um 89 de um 91. O público da Tanin é
 * consumidor final e não técnico, e a régua de cinco é a que ele já usa todo dia em
 * restaurante, hotel e livro.
 *
 * O peso da citação por IA não fica com o número, e sim com o `veredito` — as duas ou
 * três frases auto-contidas de cada ficha. O número entra no JSON-LD com `bestRating`
 * e `worstRating` explícitos, então buscadores e IAs interpretam a escala corretamente
 * seja ela qual for.
 *
 * TROCAR DEPOIS: mexer em `NOTA_MINIMA`, `NOTA_MAXIMA`, `PASSO_NOTA` e em
 * `formatarNota` aqui, e no `min`/`max`/`step` do campo `nota` em `collections/Vinhos.ts`.
 * Nada mais no projeto conhece a escala.
 */

export const NOTA_MINIMA = 1
export const NOTA_MAXIMA = 5
export const PASSO_NOTA = 0.5

/** Rótulo curto de cada faixa de nota — aparece ao lado das taças. */
export const FAIXAS_DE_NOTA: { minimo: number; rotulo: string }[] = [
  { minimo: 5, rotulo: 'Excepcional' },
  { minimo: 4.5, rotulo: 'Notável' },
  { minimo: 4, rotulo: 'Muito bom' },
  { minimo: 3.5, rotulo: 'Bom' },
  { minimo: 3, rotulo: 'Correto' },
  { minimo: 2, rotulo: 'Fraco' },
  { minimo: 1, rotulo: 'Passe longe' },
]

export const rotuloDaNota = (nota?: number | null): string | null => {
  if (typeof nota !== 'number') return null
  return FAIXAS_DE_NOTA.find((faixa) => nota >= faixa.minimo)?.rotulo ?? null
}

/** "4,5" — vírgula decimal, como se escreve em português. */
export const formatarNota = (nota?: number | null): string | null => {
  if (typeof nota !== 'number') return null
  return nota.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

/** Quantas taças cheias, meias e vazias desenhar. */
export const tacasDaNota = (nota: number): { cheias: number; meia: boolean; vazias: number } => {
  const cheias = Math.floor(nota)
  const meia = nota - cheias >= 0.5
  return { cheias, meia, vazias: NOTA_MAXIMA - cheias - (meia ? 1 : 0) }
}

/** Bloco `Rating` do schema.org, com a escala declarada de forma explícita. */
export const notaParaSchema = (nota?: number | null) => {
  if (typeof nota !== 'number') return undefined
  return {
    '@type': 'Rating' as const,
    ratingValue: nota,
    bestRating: NOTA_MAXIMA,
    worstRating: NOTA_MINIMA,
  }
}
