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
  // Redireciona URLs antigas conhecidas para as rotas canônicas do portal.
  async redirects() {
    return [
      { source: '/newsletter', destination: '/boletim', permanent: true },
      { source: '/artigos/:slug', destination: '/materias/:slug', permanent: true },
      { source: '/posts/:slug', destination: '/materias/:slug', permanent: true },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
