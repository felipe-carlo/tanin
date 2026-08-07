/**
 * O endereço público do portal, resolvido em um lugar só.
 *
 * Três partes do projeto precisam saber onde o site mora: o site (para canônicas e
 * JSON-LD), a configuração do Payload (para os arquivos enviados) e as coleções (para
 * os links de pré-visualização). Antes cada uma repetia a mesma expressão, e a reserva
 * de todas era `localhost` — o que produz um erro discreto e chato em produção: o
 * painel gera links que só funcionam na máquina de quem programou.
 *
 * A Vercel entrega o endereço de produção em `VERCEL_PROJECT_PRODUCTION_URL`. Usá-lo
 * como reserva faz o portal funcionar mesmo se ninguém preencher `NEXT_PUBLIC_URL_SITE`.
 *
 * Este arquivo não importa nada de propósito: assim pode ser lido tanto pelo site
 * quanto pela configuração do CMS, sem risco de referência circular.
 */
export const enderecoDoSite = (): string =>
  (
    process.env.NEXT_PUBLIC_URL_SITE ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000')
  ).replace(/\/$/, '')
