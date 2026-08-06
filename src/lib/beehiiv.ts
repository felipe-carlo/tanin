/**
 * CONVERSA COM O BEEHIIV
 *
 * O beehiiv continua sendo o disparador de e-mail e a lista oficial de assinantes.
 * O portal fala com ele em dois momentos: quando alguém se inscreve pelo formulário
 * do site, e quando rodamos a importação das edições antigas.
 *
 * Se as chaves não estiverem configuradas, nada aqui explode — as funções avisam que
 * não estão configuradas e quem chama decide o que fazer. No caso do formulário, a
 * inscrição fica guardada no painel para sincronizar depois.
 */

const BASE = 'https://api.beehiiv.com/v2'

export const beehiivConfigurado = (): boolean =>
  Boolean(process.env.BEEHIIV_API_KEY && process.env.BEEHIIV_PUBLICATION_ID)

interface RespostaBeehiiv<T> {
  ok: boolean
  dados?: T
  erro?: string
  status?: number
}

async function chamar<T>(
  caminho: string,
  opcoes: RequestInit = {},
): Promise<RespostaBeehiiv<T>> {
  const chave = process.env.BEEHIIV_API_KEY
  const publicacao = process.env.BEEHIIV_PUBLICATION_ID
  if (!chave || !publicacao) {
    return { ok: false, erro: 'beehiiv-nao-configurado' }
  }

  try {
    const resposta = await fetch(`${BASE}/publications/${publicacao}${caminho}`, {
      ...opcoes,
      headers: {
        Authorization: `Bearer ${chave}`,
        'Content-Type': 'application/json',
        ...opcoes.headers,
      },
      cache: 'no-store',
    })

    const texto = await resposta.text()
    const corpo = texto ? JSON.parse(texto) : {}

    if (!resposta.ok) {
      return {
        ok: false,
        status: resposta.status,
        erro:
          corpo?.errors?.[0]?.message ??
          corpo?.message ??
          `beehiiv respondeu ${resposta.status}`,
      }
    }

    return { ok: true, dados: corpo as T, status: resposta.status }
  } catch (erro) {
    return { ok: false, erro: erro instanceof Error ? erro.message : 'falha de rede' }
  }
}

/** Inscreve um e-mail na publicação. */
export async function inscreverNoBeehiiv(
  email: string,
  opcoes: { origem?: string; enviarBoasVindas?: boolean } = {},
): Promise<RespostaBeehiiv<{ data?: { id?: string; status?: string } }>> {
  return chamar('/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      email,
      reactivate_existing: true,
      send_welcome_email: opcoes.enviarBoasVindas ?? true,
      utm_source: 'portal-tanin',
      utm_medium: 'organic',
      referring_site: opcoes.origem ?? 'portal-tanin',
    }),
  })
}

export interface PostBeehiiv {
  id: string
  title: string
  subtitle?: string | null
  slug?: string
  status: string
  publish_date?: number
  created?: number
  displayed_date?: number
  web_url?: string
  thumbnail_url?: string | null
  preview_text?: string | null
  meta_default_description?: string | null
  content?: {
    free?: { web?: string; email?: string; rss?: string }
    premium?: { web?: string; email?: string }
  }
}

/** Lista as edições publicadas, uma página por vez. */
export async function listarPostsBeehiiv(opcoes: {
  pagina?: number
  porPagina?: number
} = {}): Promise<RespostaBeehiiv<{ data: PostBeehiiv[]; total_pages?: number; page?: number }>> {
  const parametros = new URLSearchParams({
    limit: String(opcoes.porPagina ?? 50),
    page: String(opcoes.pagina ?? 1),
    status: 'confirmed',
    expand: 'free_web_content',
    order_by: 'publish_date',
    direction: 'asc',
  })
  return chamar(`/posts?${parametros.toString()}`)
}

/** Busca uma edição específica com o conteúdo completo. */
export async function obterPostBeehiiv(
  id: string,
): Promise<RespostaBeehiiv<{ data: PostBeehiiv }>> {
  return chamar(`/posts/${id}?expand[]=free_web_content&expand[]=free_email_content`)
}
