import type { MetadataRoute } from 'next'

import { URL_SITE } from '@/lib/site'

/**
 * ROBOTS
 *
 * A Tanin quer ser lida por gente e por máquina. Bloquear robô de IA seria abrir mão
 * de ser a fonte citada quando alguém perguntar sobre vinho a um assistente — que é
 * exatamente o tráfego que este portal existe para conquistar. Por isso os agentes de
 * IA aparecem aqui nominalmente e liberados: não por descuido, por decisão.
 *
 * Fora do mapa ficam só duas coisas: o painel, que é privado, e a API, que serve dados
 * crus que já existem em HTML nas páginas.
 *
 * Este arquivo mora na raiz de `app/`, e não em `app/(site)/`, porque o Next só
 * reconhece `robots` quando ele está na raiz — ao contrário de `sitemap`, que vale em
 * qualquer segmento. Dentro do grupo de rotas, o endereço /robots.txt devolve 404.
 */

const FORA_DO_MAPA = ['/admin', '/api']

/**
 * O Payload serve todo arquivo enviado em `/api/midia/file/…`, e é esse endereço que
 * vai na `og:image`, na `twitter:image` e nas imagens do feed. Sem esta exceção, o
 * `Disallow: /api` tiraria do índice a foto de toda matéria e faria o cartão de
 * compartilhamento chegar sem imagem — o robô obedece à regra mais específica, então
 * ela precisa estar escrita.
 */
const LIBERADO = ['/', '/api/midia/']

/** Agentes de IA explicitamente bem-vindos — leitura, busca e treinamento. */
const ROBOS_DE_IA = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'CCBot',
  'Google-Extended',
  'Applebot-Extended',
  'meta-externalagent',
  'Amazonbot',
  'Bytespider',
  'cohere-ai',
  'DuckAssistBot',
  'MistralAI-User',
  'YouBot',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: LIBERADO, disallow: FORA_DO_MAPA },
      { userAgent: ROBOS_DE_IA, allow: LIBERADO, disallow: FORA_DO_MAPA },
    ],
    sitemap: `${URL_SITE}/sitemap.xml`,
  }
}
