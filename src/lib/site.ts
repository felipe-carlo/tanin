import { cache } from 'react'

import { enderecoDoSite } from '@/lib/endereco'
import { obterPayload } from '@/lib/payload'
import type { Configuracoes } from '@/payload-types'

/** Endereço público do portal, sem barra no fim. */
export const URL_SITE = enderecoDoSite()

export const NOME_SITE = 'Tanin'

export const urlAbsoluta = (caminho = '/'): string =>
  caminho.startsWith('http') ? caminho : `${URL_SITE}${caminho.startsWith('/') ? caminho : `/${caminho}`}`

/**
 * Menu usado quando ninguém configurou nada no painel.
 *
 * Três itens. Enquanto a publicação tem um tipo só de texto, um menu com cinco seções
 * prometeria cinco lugares para ir e entregaria dois — pior do que não ter menu.
 */
export const MENU_PADRAO = [
  { rotulo: 'Textos', endereco: '/materias' },
  { rotulo: 'Vinhos', endereco: '/vinhos' },
  { rotulo: 'Sobre', endereco: '/sobre' },
]

/** A ficha pública da autora, como guardada no global de configurações. */
export type Autora = NonNullable<Configuracoes['autora']>

/** A autora configurada, ou um esqueleto com o nome padrão para o site não quebrar. */
export const autoraDe = (config: Partial<Configuracoes>): Autora =>
  config.autora ?? { nome: 'Ana Luiza Leal' }

/**
 * Lê as configurações do site.
 *
 * O `try` existe porque a primeira execução acontece com o banco ainda vazio: sem
 * ele, o site inteiro quebraria antes de a Ana conseguir abrir o painel pela
 * primeira vez. Os padrões abaixo dão um site apresentável desde o minuto zero.
 */
export const obterConfiguracoes = cache(async (): Promise<Partial<Configuracoes>> => {
  try {
    const payload = await obterPayload()
    const config = await payload.findGlobal({ slug: 'configuracoes', depth: 2 })
    return config ?? {}
  } catch {
    return {}
  }
})

export const NOMES_DE_REDE: Record<string, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  x: 'X',
  site: 'Site',
  outro: 'Perfil',
}
