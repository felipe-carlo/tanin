/** Formatação de datas e números em português do Brasil. */

const FUSO = 'America/Sao_Paulo'

const formatador = (opcoes: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, ...opcoes })

const porExtenso = formatador({ day: 'numeric', month: 'long', year: 'numeric' })
const curta = formatador({ day: '2-digit', month: '2-digit', year: 'numeric' })
const diaEMes = formatador({ day: 'numeric', month: 'long' })
const mesEAno = formatador({ month: 'long', year: 'numeric' })
const comHora = formatador({
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const apenasHora = formatador({ hour: '2-digit', minute: '2-digit' })

const paraData = (valor?: string | Date | null): Date | null => {
  if (!valor) return null
  const data = valor instanceof Date ? valor : new Date(valor)
  return Number.isNaN(data.getTime()) ? null : data
}

export const dataPorExtenso = (valor?: string | Date | null): string =>
  paraData(valor) ? porExtenso.format(paraData(valor)!) : ''

export const dataCurta = (valor?: string | Date | null): string =>
  paraData(valor) ? curta.format(paraData(valor)!) : ''

export const dataDiaEMes = (valor?: string | Date | null): string =>
  paraData(valor) ? diaEMes.format(paraData(valor)!) : ''

export const dataMesEAno = (valor?: string | Date | null): string =>
  paraData(valor) ? mesEAno.format(paraData(valor)!) : ''

export const dataComHora = (valor?: string | Date | null): string =>
  paraData(valor) ? comHora.format(paraData(valor)!) : ''

export const horaDe = (valor?: string | Date | null): string =>
  paraData(valor) ? apenasHora.format(paraData(valor)!) : ''

/** Valor do atributo `datetime` de `<time>` — sempre ISO, sempre legível por máquina. */
export const iso = (valor?: string | Date | null): string | undefined =>
  paraData(valor)?.toISOString()

/** "12 de março de 2025" → "há 3 dias" quando faz sentido, senão a data completa. */
export const dataRelativa = (valor?: string | Date | null): string => {
  const data = paraData(valor)
  if (!data) return ''
  const dias = Math.round((Date.now() - data.getTime()) / 86_400_000)
  if (dias < 1) return 'hoje'
  if (dias === 1) return 'ontem'
  if (dias < 7) return `há ${dias} dias`
  if (dias < 30) {
    const semanas = Math.floor(dias / 7)
    return semanas === 1 ? 'há uma semana' : `há ${semanas} semanas`
  }
  return dataPorExtenso(data)
}

/** Junta uma lista em português: "a, b e c". */
export const listar = (itens: string[]): string => {
  const limpos = itens.filter(Boolean)
  if (limpos.length === 0) return ''
  if (limpos.length === 1) return limpos[0]
  return `${limpos.slice(0, -1).join(', ')} e ${limpos[limpos.length - 1]}`
}

export const numero = (valor: number): string => valor.toLocaleString('pt-BR')

/** "3" → "03" — usado nos números de edição. */
export const doisDigitos = (valor: number): string => String(valor).padStart(2, '0')

/** Plural simples: `plural(2, 'edição', 'edições')`. */
export const plural = (quantidade: number, singular: string, plural: string): string =>
  `${numero(quantidade)} ${quantidade === 1 ? singular : plural}`
