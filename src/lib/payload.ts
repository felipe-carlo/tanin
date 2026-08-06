import { cache } from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Payload } from 'payload'

/**
 * Acesso ao Payload direto do servidor, sem passar por HTTP.
 *
 * Como o site e o CMS moram no mesmo aplicativo, as páginas conversam com o banco
 * chamando a API local do Payload. Isso elimina uma volta de rede por consulta e é
 * o principal motivo de o portal conseguir renderizar rápido.
 */
export const obterPayload = cache(async (): Promise<Payload> => getPayload({ config: configPromise }))

/** Formato dos parâmetros de busca em rotas do App Router. */
export type ParametrosDeBusca = { [chave: string]: string | string[] | undefined }

/** Lê um parâmetro de busca como texto único. */
export const umParametro = (valor: string | string[] | undefined): string | undefined =>
  Array.isArray(valor) ? valor[0] : valor

/** Lê um parâmetro de busca como lista (aceita `?uva=a&uva=b` e `?uva=a,b`). */
export const listaDeParametros = (valor: string | string[] | undefined): string[] => {
  if (!valor) return []
  const bruto = Array.isArray(valor) ? valor : [valor]
  return bruto.flatMap((item) => item.split(',')).map((item) => item.trim()).filter(Boolean)
}
