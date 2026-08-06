/**
 * CONSTRUTORES DE JSON-LD
 *
 * Cada função devolve um objeto que descreve uma página para máquinas. É aqui que o
 * portal ganha o direito de ser citado: uma resenha marcada como `Review` com nota,
 * autor e data é reconhecida como opinião de alguém identificável — o que uma página
 * de texto solto nunca consegue provar.
 *
 * `@id` aparece em quase tudo de propósito: é o que permite a um bloco apontar para
 * outro sem repetir a informação inteira, e é o que faz o buscador entender que a
 * autora de uma matéria é a mesma pessoa da página /sobre.
 */

import type { Autor, Configuracoes, Edicao, Evento, Guia, Materia, Midia, Vinho } from '@/payload-types'
import { NOTA_MAXIMA, NOTA_MINIMA, notaParaSchema } from '@/lib/nota'
import { URL_SITE, urlAbsoluta } from '@/lib/site'
import { comoMidia, urlDaMidia } from '@/components/Imagem'

const ID_PUBLICACAO = `${URL_SITE}/#publicacao`
const ID_SITE = `${URL_SITE}/#site`

type Relacao<T> = number | T | null | undefined

const populado = <T,>(valor: Relacao<T>): T | null =>
  valor && typeof valor === 'object' ? (valor as T) : null

const imagemAbsoluta = (midia: Relacao<Midia>, tamanho?: 'compartilhamento' | 'largura') => {
  const url = urlDaMidia(midia as never, tamanho)
  return url ? urlAbsoluta(url) : undefined
}

const limpar = <T extends object>(objeto: T): T =>
  Object.fromEntries(
    Object.entries(objeto).filter(([, valor]) => valor !== undefined && valor !== null && valor !== ''),
  ) as T

/* -------------------------------------------------------------------------- */
/* Organização e site                                                          */
/* -------------------------------------------------------------------------- */

/**
 * `NewsMediaOrganization` em vez de `Organization` genérica: diz ao buscador que a
 * Tanin é um veículo, não uma empresa qualquer com um blog.
 */
export function schemaDaPublicacao(config: Partial<Configuracoes>) {
  const autora = populado<Autor>(config.autoraPrincipal as Relacao<Autor>)
  const redes = [
    ...(config.redes?.map((rede) => rede.url) ?? []),
    ...(autora?.redes?.map((rede) => rede.url) ?? []),
  ].filter(Boolean)

  return limpar({
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    '@id': ID_PUBLICACAO,
    name: config.nomeSite ?? 'Tanin',
    alternateName: config.assinatura ?? undefined,
    url: URL_SITE,
    description: config.descricao ?? undefined,
    logo: imagemAbsoluta(config.imagemPadrao as Relacao<Midia>, 'compartilhamento'),
    sameAs: redes.length > 0 ? Array.from(new Set(redes)) : undefined,
    founder: autora ? { '@id': `${URL_SITE}/sobre#${autora.slug ?? 'autora'}` } : undefined,
    inLanguage: 'pt-BR',
    knowsAbout: ['Vinho', 'Enologia', 'Harmonização', 'Regiões vinícolas', 'Degustação'],
    ethicsPolicy: `${URL_SITE}/sobre#como-avaliamos`,
  })
}

export function schemaDoSite(config: Partial<Configuracoes>) {
  return limpar({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': ID_SITE,
    name: config.nomeSite ?? 'Tanin',
    url: URL_SITE,
    inLanguage: 'pt-BR',
    publisher: { '@id': ID_PUBLICACAO },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${URL_SITE}/busca?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  })
}

/* -------------------------------------------------------------------------- */
/* Pessoa                                                                      */
/* -------------------------------------------------------------------------- */

export function schemaDaPessoa(autor: Autor, comContexto = false) {
  return limpar({
    ...(comContexto ? { '@context': 'https://schema.org' } : {}),
    '@type': 'Person',
    '@id': `${URL_SITE}/sobre#${autor.slug ?? autor.id}`,
    name: autor.nome,
    jobTitle: autor.cargo ?? undefined,
    description: autor.bioCurta ?? undefined,
    image: imagemAbsoluta(autor.foto as Relacao<Midia>, 'quadrado' as never),
    url: `${URL_SITE}/sobre`,
    email: autor.email ?? undefined,
    sameAs: autor.redes?.map((rede) => rede.url).filter(Boolean),
    knowsAbout: ['Vinho', 'Jornalismo de vinho', 'Degustação'],
    hasCredential: autor.credenciais?.map((credencial) =>
      limpar({
        '@type': 'EducationalOccupationalCredential',
        name: credencial.texto,
        url: credencial.link ?? undefined,
      }),
    ),
    worksFor: { '@id': ID_PUBLICACAO },
  })
}

/* -------------------------------------------------------------------------- */
/* Artigos                                                                     */
/* -------------------------------------------------------------------------- */

export function schemaDaMateria(materia: Materia) {
  const autor = populado<Autor>(materia.autor as Relacao<Autor>)
  const url = `${URL_SITE}/materias/${materia.slug}`
  const imagem = imagemAbsoluta(materia.destaque?.imagem as Relacao<Midia>, 'compartilhamento')

  return limpar({
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#artigo`,
    headline: materia.titulo,
    alternativeHeadline: materia.subtitulo ?? undefined,
    description: materia.resumo,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: materia.dataPublicacao ?? materia.createdAt,
    dateModified: materia.dataAtualizacao ?? materia.updatedAt,
    image: imagem ? [imagem] : undefined,
    author: autor ? schemaDaPessoa(autor) : undefined,
    publisher: { '@id': ID_PUBLICACAO },
    isAccessibleForFree: true,
    inLanguage: 'pt-BR',
    articleSection:
      populado<{ nome?: string }>(materia.categoria as Relacao<{ nome?: string }>)?.nome ?? undefined,
    keywords: materia.tags
      ?.map((tag) => populado<{ nome?: string }>(tag as Relacao<{ nome?: string }>)?.nome)
      .filter(Boolean)
      .join(', '),
    wordCount: materia.tempoLeitura ? materia.tempoLeitura * 200 : undefined,
    timeRequired: materia.tempoLeitura ? `PT${materia.tempoLeitura}M` : undefined,
  })
}

export function schemaDoGuia(guia: Guia) {
  const autor = populado<Autor>(guia.autor as Relacao<Autor>)
  const url = `${URL_SITE}/guias/${guia.slug}`
  const imagem = imagemAbsoluta(guia.destaque?.imagem as Relacao<Midia>, 'compartilhamento')

  return limpar({
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#guia`,
    headline: guia.titulo,
    alternativeHeadline: guia.subtitulo ?? undefined,
    description: guia.resumo,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: guia.dataPublicacao ?? guia.createdAt,
    dateModified: guia.dataAtualizacao ?? guia.updatedAt,
    image: imagem ? [imagem] : undefined,
    author: autor ? schemaDaPessoa(autor) : undefined,
    publisher: { '@id': ID_PUBLICACAO },
    isAccessibleForFree: true,
    inLanguage: 'pt-BR',
    educationalLevel: guia.nivel === 'iniciante' ? 'Iniciante' : 'Intermediário',
about: { '@type': 'Thing', name: 'Vinho' },
  })
}

/* -------------------------------------------------------------------------- */
/* Boletim                                                                     */
/* -------------------------------------------------------------------------- */

/** O boletim como periódico — cada edição é um `PublicationIssue` dele. */
export function schemaDoPeriodico(config: Partial<Configuracoes>) {
  return limpar({
    '@context': 'https://schema.org',
    '@type': 'Periodical',
    '@id': `${URL_SITE}/boletim#periodico`,
    name: config.boletimTitulo ?? 'Boletim Tanin',
    url: `${URL_SITE}/boletim`,
    description: config.boletimChamada ?? undefined,
    publisher: { '@id': ID_PUBLICACAO },
    inLanguage: 'pt-BR',
    issn: undefined,
  })
}

export function schemaDaEdicao(edicao: Edicao, config: Partial<Configuracoes>) {
  const url = `${URL_SITE}/boletim/${edicao.slug}`
  const imagem = imagemAbsoluta(edicao.destaque?.imagem as Relacao<Midia>, 'compartilhamento')

  return limpar({
    '@context': 'https://schema.org',
    '@type': 'PublicationIssue',
    '@id': `${url}#edicao`,
    issueNumber: edicao.numero,
    name: edicao.titulo,
    headline: edicao.titulo,
    description: edicao.resumo,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: edicao.dataEnvio,
    dateModified: edicao.updatedAt,
    image: imagem ? [imagem] : undefined,
    isPartOf: {
      '@type': 'Periodical',
      '@id': `${URL_SITE}/boletim#periodico`,
      name: config.boletimTitulo ?? 'Boletim Tanin',
    },
    publisher: { '@id': ID_PUBLICACAO },
    isAccessibleForFree: true,
    inLanguage: 'pt-BR',
  })
}

/* -------------------------------------------------------------------------- */
/* Vinho: Review sobre Product                                                 */
/* -------------------------------------------------------------------------- */

const FAIXA_PARA_PRECO: Record<string, { min: number; max?: number }> = {
  'ate-80': { min: 0, max: 80 },
  '80-150': { min: 80, max: 150 },
  '150-250': { min: 150, max: 250 },
  '250-400': { min: 250, max: 400 },
  '400-700': { min: 400, max: 700 },
  'acima-700': { min: 700 },
}

/**
 * A ficha de vinho é uma `Review` cujo objeto é um `Product`.
 *
 * Essa combinação é a maior oportunidade de citação do projeto: é o formato que o
 * Google entende como "alguém identificável provou isto e deu uma nota", e é dele
 * que saem as respostas quando alguém pergunta a uma IA se um vinho vale a pena.
 */
export function schemaDoVinho(vinho: Vinho) {
  const autor = populado<Autor>(vinho.autor as Relacao<Autor>)
  const url = `${URL_SITE}/vinhos/${vinho.slug}`
  const imagem = imagemAbsoluta(vinho.destaque?.imagem as Relacao<Midia>, 'compartilhamento')
  const regiao = populado<{ nome?: string }>(vinho.regiao as Relacao<{ nome?: string }>)
  const importadora = populado<{ nome?: string }>(vinho.importadora as Relacao<{ nome?: string }>)
  const faixa = vinho.faixaPreco ? FAIXA_PARA_PRECO[vinho.faixaPreco] : undefined

  const uvas =
    vinho.uvas
      ?.map((item) => populado<{ nome?: string }>(item.uva as Relacao<{ nome?: string }>)?.nome)
      .filter(Boolean) ?? []

  const produto = limpar({
    '@type': 'Product',
    '@id': `${url}#produto`,
    name: `${vinho.produtor} ${vinho.nome}${vinho.safra ? ` ${vinho.safra}` : ''}`,
    category: 'Vinho',
    brand: { '@type': 'Brand', name: vinho.produtor },
    image: imagem ? [imagem] : undefined,
    description: vinho.veredito,
    countryOfOrigin: vinho.pais,
    additionalProperty: [
      regiao?.nome && { '@type': 'PropertyValue', name: 'Região', value: regiao.nome },
      vinho.subRegiao && { '@type': 'PropertyValue', name: 'Denominação', value: vinho.subRegiao },
      vinho.safra && { '@type': 'PropertyValue', name: 'Safra', value: String(vinho.safra) },
      uvas.length > 0 && { '@type': 'PropertyValue', name: 'Uvas', value: uvas.join(', ') },
      vinho.teorAlcoolico && {
        '@type': 'PropertyValue',
        name: 'Teor alcoólico',
        value: `${vinho.teorAlcoolico}%`,
      },
      vinho.temperaturaServico && {
        '@type': 'PropertyValue',
        name: 'Temperatura de serviço',
        value: vinho.temperaturaServico,
      },
      vinho.potencialGuarda && {
        '@type': 'PropertyValue',
        name: 'Potencial de guarda',
        value: vinho.potencialGuarda,
      },
      importadora?.nome && {
        '@type': 'PropertyValue',
        name: 'Importadora',
        value: importadora.nome,
      },
    ].filter(Boolean),
    offers: faixa
      ? limpar({
          '@type': 'AggregateOffer',
          priceCurrency: 'BRL',
          lowPrice: faixa.min,
          highPrice: faixa.max,
          availability: 'https://schema.org/InStock',
          offerCount: vinho.ondeComprar?.length ?? 1,
        })
      : undefined,
  })

  return limpar({
    '@context': 'https://schema.org',
    '@type': 'Review',
    '@id': `${url}#resenha`,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    itemReviewed: produto,
    reviewBody: vinho.veredito,
    headline: `${vinho.nome}${vinho.safra ? ` ${vinho.safra}` : ''}`,
    reviewRating: notaParaSchema(vinho.nota),
    author: autor ? schemaDaPessoa(autor) : undefined,
    publisher: { '@id': ID_PUBLICACAO },
    datePublished: vinho.dataPublicacao ?? vinho.createdAt,
    dateModified: vinho.dataAtualizacao ?? vinho.updatedAt,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
  })
}

/** Explica a régua de notas em uma página só, para quem quiser conferir. */
export const ESCALA_DE_NOTA_LEGIVEL = `Escala de ${NOTA_MINIMA} a ${NOTA_MAXIMA} taças, com meias taças.`

/* -------------------------------------------------------------------------- */
/* Evento                                                                      */
/* -------------------------------------------------------------------------- */

export function schemaDoEvento(evento: Evento) {
  return limpar({
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${URL_SITE}/agenda#${evento.slug ?? evento.id}`,
    name: evento.nome,
    description: evento.descricao,
    startDate: evento.data,
    endDate: evento.dataFim ?? undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode:
      evento.tipo === 'online'
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : 'https://schema.org/OfflineEventAttendanceMode',
    location:
      evento.tipo === 'online'
        ? { '@type': 'VirtualLocation', url: evento.linkInscricao ?? URL_SITE }
        : limpar({
            '@type': 'Place',
            name: evento.local ?? evento.cidade ?? undefined,
            address: limpar({
              '@type': 'PostalAddress',
              streetAddress: evento.endereco ?? undefined,
              addressLocality: evento.cidade ?? undefined,
              addressRegion: evento.estado ?? undefined,
              addressCountry: 'BR',
            }),
          }),
    image: imagemAbsoluta(evento.destaque?.imagem as Relacao<Midia>, 'compartilhamento'),
    organizer: evento.organizador
      ? { '@type': 'Organization', name: evento.organizador }
      : { '@id': ID_PUBLICACAO },
    url: evento.linkInscricao ?? `${URL_SITE}/agenda`,
    inLanguage: 'pt-BR',
  })
}

/* -------------------------------------------------------------------------- */
/* Blocos auxiliares                                                           */
/* -------------------------------------------------------------------------- */

export function schemaDeFaq(faq?: { pergunta: string; resposta: string }[] | null) {
  if (!faq || faq.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: item.resposta },
    })),
  }
}

export function schemaDeMigalhas(trilha: { nome: string; endereco: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trilha.map((item, indice) => ({
      '@type': 'ListItem',
      position: indice + 1,
      name: item.nome,
      item: urlAbsoluta(item.endereco),
    })),
  }
}

export function schemaDeLista(
  nome: string,
  itens: { nome: string; endereco: string }[],
  descricao?: string,
) {
  return limpar({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: nome,
    description: descricao,
    isPartOf: { '@id': ID_SITE },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: itens.length,
      itemListElement: itens.map((item, indice) => ({
        '@type': 'ListItem',
        position: indice + 1,
        name: item.nome,
        url: urlAbsoluta(item.endereco),
      })),
    },
  })
}

export { comoMidia }
