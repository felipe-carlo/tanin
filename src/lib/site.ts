import { cache } from 'react'

import { enderecoDoSite } from '@/lib/endereco'
import { obterPayload } from '@/lib/payload'
import type { Configuracoes } from '@/payload-types'

/** Endereço público do portal, sem barra no fim. */
export const URL_SITE = enderecoDoSite()

export const NOME_SITE = 'Tanin'

export const urlAbsoluta = (caminho = '/'): string =>
  caminho.startsWith('http') ? caminho : `${URL_SITE}${caminho.startsWith('/') ? caminho : `/${caminho}`}`

/** Menu usado quando ninguém configurou nada no painel. */
export const MENU_PADRAO = [
  { rotulo: 'Matérias', endereco: '/materias' },
  { rotulo: 'Boletim', endereco: '/boletim' },
  { rotulo: 'Vinhos', endereco: '/vinhos' },
  { rotulo: 'Guias', endereco: '/guias' },
  { rotulo: 'Agenda', endereco: '/agenda' },
]

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
