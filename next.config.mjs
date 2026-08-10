import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Imagens externas usadas pelas fichas e pelo conteúdo importado do beehiiv.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.beehiiv.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // O admin do Payload é pesado; deixá-lo fora do bundle do site é o padrão do plugin.
  experimental: {
    optimizePackageImports: ['@payloadcms/ui'],
    // Liga o `app/global-not-found.tsx`: sem ele, um endereço que não bate com rota
    // nenhuma cai na tela branca padrão do Next, em inglês e sem saída.
    globalNotFound: true,
  },
  /**
   * Redireciona URLs antigas conhecidas para as rotas canônicas do portal.
   *
   * A segunda leva é das seções que saíram do ar quando a publicação passou a ter um
   * tipo só de texto. São 301 e não 404 de propósito: link que já circula continua
   * chegando em algum lugar, e a pouca autoridade que esses endereços tenham acumulado
   * vai para o índice de textos em vez de evaporar. Quando as seções voltarem, é só
   * tirar a linha.
   *
   * `/boletim/:slug` e `/guias/:slug` vão para o índice, e não para `/materias/:slug`:
   * o slug existe, mas mandar um 301 para uma página que pode não responder é pior do
   * que mandar para a lista. Quem tinha o link encontra o texto ali, no topo ou pela
   * busca.
   */
  async redirects() {
    return [
      { source: '/newsletter', destination: '/#assinar', permanent: true },
      { source: '/artigos/:slug', destination: '/materias/:slug', permanent: true },
      { source: '/posts/:slug', destination: '/materias/:slug', permanent: true },
      { source: '/boletim', destination: '/#assinar', permanent: true },
      { source: '/boletim/:slug', destination: '/materias', permanent: true },
      { source: '/guias', destination: '/materias', permanent: true },
      { source: '/guias/:slug', destination: '/materias', permanent: true },
      { source: '/agenda', destination: '/materias', permanent: true },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
