import type { Metadata } from 'next'

import { urlDaMidia } from '@/components/Imagem'
import type { Midia } from '@/payload-types'
import { URL_SITE, urlAbsoluta } from '@/lib/site'

interface CamposSeo {
  titulo?: string | null
  descricao?: string | null
  imagem?: number | Midia | null
  naoIndexar?: boolean | null
  canonica?: string | null
  palavrasChave?: string | null
}

/**
 * Monta o `<head>` de uma página a partir do conteúdo, com queda sensata.
 *
 * A regra: o que a Ana escreveu no campo de SEO vence; se ela deixou em branco, o
 * título e o resumo da própria página assumem. Nenhuma página fica sem descrição só
 * porque alguém não preencheu um formulário — o que seria o jeito mais comum de
 * perder tráfego sem perceber.
 */
export function montarMetadados({
  seo,
  titulo,
  descricao,
  imagem,
  caminho,
  tipo = 'article',
  publicadoEm,
  atualizadoEm,
  autores,
  secao,
  tags,
}: {
  seo?: CamposSeo | null
  titulo: string
  descricao?: string | null
  imagem?: number | Midia | null
  caminho: string
  tipo?: 'article' | 'website' | 'profile'
  publicadoEm?: string | null
  atualizadoEm?: string | null
  autores?: string[]
  secao?: string | null
  tags?: string[]
}): Metadata {
  const tituloFinal = seo?.titulo?.trim() || titulo
  const descricaoFinal = (seo?.descricao?.trim() || descricao || '').slice(0, 300) || undefined
  const urlImagem = urlDaMidia((seo?.imagem ?? imagem) as never, 'compartilhamento')
  const imagens = urlImagem
    ? [{ url: urlAbsoluta(urlImagem), width: 1200, height: 630, alt: tituloFinal }]
    : undefined

  return {
    title: tituloFinal,
    description: descricaoFinal,
    keywords: seo?.palavrasChave
      ? seo.palavrasChave.split(',').map((termo) => termo.trim()).filter(Boolean)
      : undefined,
    alternates: { canonical: seo?.canonica?.trim() || urlAbsoluta(caminho) },
    robots: seo?.naoIndexar
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
        },
    openGraph: {
      type: tipo,
      url: urlAbsoluta(caminho),
      title: tituloFinal,
      description: descricaoFinal,
      images: imagens,
      locale: 'pt_BR',
      siteName: 'Tanin',
      ...(tipo === 'article'
        ? {
            publishedTime: publicadoEm ?? undefined,
            modifiedTime: atualizadoEm ?? undefined,
            authors: autores,
            section: secao ?? undefined,
            tags,
          }
        : {}),
    },
    twitter: {
      card: imagens ? 'summary_large_image' : 'summary',
      title: tituloFinal,
      description: descricaoFinal,
      images: imagens?.map((imagem) => imagem.url),
    },
  }
}

/** Metadados de páginas de índice, que não têm um documento por trás. */
export function metadadosDeIndice({
  titulo,
  descricao,
  caminho,
}: {
  titulo: string
  descricao: string
  caminho: string
}): Metadata {
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: `${URL_SITE}${caminho}` },
    openGraph: {
      type: 'website',
      url: `${URL_SITE}${caminho}`,
      title: titulo,
      description: descricao,
      locale: 'pt_BR',
      siteName: 'Tanin',
    },
  }
}
