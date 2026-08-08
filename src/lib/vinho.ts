import { CORPOS_DE_VINHO, FAIXAS_DE_PRECO, TIPOS_DE_VINHO } from '@/collections/Vinhos'
import type { Vinho } from '@/payload-types'

const rotuloDe = (opcoes: readonly { label: string; value: string }[], valor?: string | null) =>
  opcoes.find((opcao) => opcao.value === valor)?.label ?? null

export const rotuloTipo = (valor?: string | null) => rotuloDe(TIPOS_DE_VINHO, valor)
export const rotuloCorpo = (valor?: string | null) => rotuloDe(CORPOS_DE_VINHO, valor)
export const rotuloPreco = (valor?: string | null) => rotuloDe(FAIXAS_DE_PRECO, valor)

export const OPCOES_TIPO = TIPOS_DE_VINHO
export const OPCOES_CORPO = CORPOS_DE_VINHO
export const OPCOES_PRECO = FAIXAS_DE_PRECO

/** "Malbec 70% · Cabernet Sauvignon 30%" — ou só os nomes, quando não há percentual. */
export function descreverUvas(vinho: Pick<Vinho, 'uvas'>): string {
  if (!vinho.uvas || vinho.uvas.length === 0) return ''
  return vinho.uvas
    .map((item) => {
      if (!item.uva) return null
      return item.percentual ? `${item.uva} ${item.percentual}%` : item.uva
    })
    .filter(Boolean)
    .join(' · ')
}

/** Lista de nomes de uva, para filtros e schema. */
export function nomesDasUvas(vinho: Pick<Vinho, 'uvas'>): string[] {
  return (
    vinho.uvas
      ?.map((item) => item.uva ?? null)
      .filter((nome): nome is string => Boolean(nome)) ?? []
  )
}

/** "Mendoza, Argentina" — a procedência em uma linha. */
export function descreverProcedencia(vinho: Pick<Vinho, 'pais' | 'regiao' | 'subRegiao'>): string {
  return [vinho.subRegiao, vinho.regiao, vinho.pais].filter(Boolean).join(', ')
}

/** "Catena Zapata Malbec 2021" — o nome como se lê no rótulo. */
export function nomeCompleto(vinho: Pick<Vinho, 'nome' | 'produtor' | 'safra'>): string {
  const partes = [vinho.produtor, vinho.nome]
  const base = Array.from(new Set(partes.filter(Boolean))).join(' ')
  return vinho.safra ? `${base} ${vinho.safra}` : base
}
