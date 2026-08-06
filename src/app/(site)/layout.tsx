import type { Metadata, Viewport } from 'next'

import { Cabecalho } from '@/components/Cabecalho'
import { EstilosDaEscala } from '@/components/Chip'
import { Rodape } from '@/components/Rodape'
import { JsonLd } from '@/components/JsonLd'
import { classesDeFonte } from '@/lib/fontes'
import { schemaDaPublicacao, schemaDoSite } from '@/lib/schema'
import { NOME_SITE, URL_SITE, obterConfiguracoes } from '@/lib/site'

import './globais.css'

export async function generateMetadata(): Promise<Metadata> {
  const config = await obterConfiguracoes()
  const descricao =
    config.descricao ??
    'A Tanin é uma publicação independente sobre vinho, escrita por Ana Luiza Leal para quem bebe — e não para quem vende.'

  return {
    metadataBase: new URL(URL_SITE),
    title: {
      default: `${config.nomeSite ?? NOME_SITE} · ${config.assinatura ?? 'Vinho com vagar'}`,
      template: `%s · ${config.nomeSite ?? NOME_SITE}`,
    },
    description: descricao,
    applicationName: config.nomeSite ?? NOME_SITE,
    alternates: {
      canonical: '/',
      types: { 'application/rss+xml': `${URL_SITE}/rss.xml` },
    },
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      siteName: config.nomeSite ?? NOME_SITE,
      url: URL_SITE,
      title: `${config.nomeSite ?? NOME_SITE} · ${config.assinatura ?? 'Vinho com vagar'}`,
      description: descricao,
    },
    twitter: { card: 'summary_large_image' },
    // Nenhum robô de IA bloqueado: o portal existe em boa parte para ser citado.
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    formatDetection: { telephone: false },
  }
}

export const viewport: Viewport = {
  themeColor: '#FAF8F5',
  colorScheme: 'light',
}

export default async function LayoutDoSite({ children }: { children: React.ReactNode }) {
  const [config] = await Promise.all([obterConfiguracoes()])

  return (
    <html lang="pt-BR" className={classesDeFonte}>
      <head>
        <EstilosDaEscala />
      </head>
      <body className="flex min-h-dvh flex-col antialiased">
        <a href="#conteudo" className="apenas-leitor focus:not-sr-only">
          Pular para o conteúdo
        </a>
        <Cabecalho />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Rodape />
        <JsonLd dados={[schemaDaPublicacao(config), schemaDoSite(config)]} />
      </body>
    </html>
  )
}
