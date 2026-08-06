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
 */

const FORA_DO_MAPA = ['/admin', '/api']

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
      { userAgent: '*', allow: '/', disallow: FORA_DO_MAPA },
      { userAgent: ROBOS_DE_IA, allow: '/', disallow: FORA_DO_MAPA },
    ],
    sitemap: `${URL_SITE}/sitemap.xml`,
    host: URL_SITE,
  }
}
