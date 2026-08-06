import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { BlocoAutor } from '@/components/BlocoAutor'
import { CartaoVinhoLinha } from '@/components/CartaoVinho'
import { Chip } from '@/components/Chip'
import { Faq } from '@/components/Faq'
import { Figura } from '@/components/Imagem'
import { JsonLd } from '@/components/JsonLd'
import { Migalhas } from '@/components/Migalhas'
import { TituloDeSecao } from '@/components/Secao'
import { TextoRico } from '@/components/TextoRico'
import { TIPOS_DE_GUIA } from '@/collections/Guias'
import { dataPorExtenso, iso } from '@/lib/formatar'
import { montarMetadados } from '@/lib/metadados'
import { obterPayload } from '@/lib/payload'
import { listarGuias, obterGuia } from '@/lib/consultas'
import { schemaDeFaq, schemaDeMigalhas, schemaDoGuia } from '@/lib/schema'
import type { Autor, Guia, Materia, Vinho } from '@/payload-types'

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const payload = await obterPayload()
    const guias = await payload.find({
      collection: 'guias',
      where: { _status: { equals: 'published' } },
      limit: 500,
      depth: 0,
      select: { slug: true },
      overrideAccess: false,
    })
    return guias.docs.filter((guia) => guia.slug).map((guia) => ({ slug: guia.slug! }))
  } catch {
    return []
  }
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guia = await obterGuia(slug)
  if (!guia) return { title: 'Guia não encontrado' }

  const autor = guia.autor && typeof guia.autor === 'object' ? (guia.autor as Autor) : null

  return montarMetadados({
    seo: guia.seo,
    titulo: guia.titulo,
    descricao: guia.resumo,
    imagem: guia.destaque?.imagem,
    caminho: `/guias/${guia.slug}`,
    publicadoEm: guia.dataPublicacao,
    atualizadoEm: guia.dataAtualizacao ?? guia.updatedAt,
    autores: autor ? [autor.nome] : undefined,
    secao: 'Guias',
  })
}

export default async function PaginaDoGuia({ params }: Props) {
  const { slug } = await params
  const guia = await obterGuia(slug)
  if (!guia) notFound()

  const autor = guia.autor && typeof guia.autor === 'object' ? (guia.autor as Autor) : null
  const tipoRotulo = TIPOS_DE_GUIA.find((tipo) => tipo.value === guia.tipoGuia)?.label

  const vinhos = (guia.vinhosExemplo ?? []).filter(
    (item): item is Vinho => typeof item === 'object',
  )

  const relacionados = (guia.conteudosRelacionados ?? [])
    .filter((item) => typeof item === 'object' && item !== null && 'value' in item)
    .map((item) => item as { relationTo: string; value: Materia | Guia | Vinho })
    .filter((item) => typeof item.value === 'object')

  const outros = (await listarGuias({ limite: 4, tipo: guia.tipoGuia })).docs.filter(
    (outro) => outro.id !== guia.id,
  )

  const atualizadoEm = guia.dataAtualizacao ?? guia.updatedAt
  const trilha = [
    { nome: 'Início', endereco: '/' },
    { nome: 'Guias', endereco: '/guias' },
    { nome: guia.titulo, endereco: `/guias/${guia.slug}` },
  ]

  return (
    <>
      <article className="caixa pt-8 md:pt-10">
        <Migalhas trilha={trilha} className="mb-8" />

        <header className="grade items-start border-b border-tinta pb-10 md:pb-14">
          <div className="col-span-6 lg:col-span-8">
            <p className="rotulo flex flex-wrap items-center gap-x-3 gap-y-1 text-borra">
              <Chip cor={guia.chipCor} tamanho="pequeno" />
              {tipoRotulo && (
                <Link href={`/guias?tipo=${guia.tipoGuia}`} className="hover:underline">
                  {tipoRotulo}
                </Link>
              )}
              <span aria-hidden="true" className="text-tenue">
                ·
              </span>
              <span className="text-grafite">
                {guia.nivel === 'iniciante' ? 'Iniciante' : 'Intermediário'}
              </span>
            </p>

            <h1
              className="mt-4 text-t1 tracking-[-0.032em] equilibrado"
              style={{ fontVariationSettings: "'SOFT' 22, 'WONK' 1", fontWeight: 500 }}
            >
              {guia.titulo}
            </h1>

            {guia.subtitulo && (
              <p className="mt-5 max-w-2xl text-corpo-grande leading-snug text-grafite bonito">
                {guia.subtitulo}
              </p>
            )}

            {/* Data de atualização visível: em conteúdo evergreen, ela é o que diz ao
                leitor (e ao buscador) que a página continua sendo cuidada. */}
            <p className="rotulo mt-7 text-grafite">
              Atualizado em{' '}
              <time dateTime={iso(atualizadoEm)}>{dataPorExtenso(atualizadoEm)}</time>
              {autor ? ` · por ${autor.nome}` : ''}
            </p>
          </div>

          {/* "O que levar" — a versão curta do guia, no alto, para quem tem pressa.
              É também o bloco mais citável da página. */}
          {guia.paraLevar && guia.paraLevar.length > 0 && (
            <div className="col-span-6 lg:col-span-3 lg:col-start-10">
              <h2 className="rotulo border-b border-tinta pb-3">Em resumo</h2>
              <ul className="mt-4 space-y-3.5">
                {guia.paraLevar.map((ponto, indice) => (
                  <li key={ponto.id ?? indice} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2.5 h-px w-3 flex-none bg-borra" />
                    <span className="text-apoio leading-relaxed bonito">{ponto.texto}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </header>

        {guia.destaque?.imagem && typeof guia.destaque.imagem === 'object' && (
          <Figura
            midia={guia.destaque.imagem}
            legenda={guia.destaque.legenda}
            credito={guia.destaque.credito}
            tamanho="largura"
            sizes="(max-width: 62rem) 100vw, 82rem"
            proporcao="16 / 9"
            prioridade
            className="mt-10"
          />
        )}

        <div className="grade mt-12 md:mt-16">
          <div className="col-span-6 lg:col-span-7 lg:col-start-2">
            <p className="mb-10 border-l border-borra pl-5 text-corpo-grande leading-relaxed bonito">
              {guia.resumo}
            </p>

            <TextoRico dados={guia.corpo} />

            <Faq perguntas={guia.faq} />

            {autor && <BlocoAutor autor={autor} />}
          </div>

          {/* Um `div`, e não um `aside`: cada bloco aqui dentro já é uma `section` com
              título próprio, que é o que leitor de tela usa para navegar. O `aside`
              aninhado no artigo não acrescentaria informação nenhuma. */}
          <div className="col-span-6 lg:col-span-3 lg:col-start-10">
            <div className="space-y-12 lg:sticky lg:top-[calc(var(--altura-cabecalho)+2rem)]">
              {relacionados.length > 0 && (
                <section>
                  <h2 className="rotulo border-b border-tinta pb-3">Ver também</h2>
                  <ul className="mt-4 space-y-3">
                    {relacionados.map((item, indice) => {
                      const base =
                        item.relationTo === 'materias'
                          ? '/materias'
                          : item.relationTo === 'vinhos'
                            ? '/vinhos'
                            : '/guias'
                      const doc = item.value as { slug?: string; titulo?: string; nome?: string }
                      return (
                        <li key={`${item.relationTo}-${indice}`}>
                          <Link
                            href={`${base}/${doc.slug}`}
                            className="link-titulo text-apoio leading-snug"
                          >
                            {doc.titulo ?? doc.nome}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )}

              {outros.length > 0 && (
                <section>
                  <h2 className="rotulo border-b border-tinta pb-3">
                    Outros guias de {tipoRotulo?.toLowerCase()}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {outros.slice(0, 4).map((outro) => (
                      <li key={outro.id}>
                        <Link
                          href={`/guias/${outro.slug}`}
                          className="link-titulo text-apoio leading-snug"
                        >
                          {outro.titulo}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      </article>

      {vinhos.length > 0 && (
        <section className="caixa mt-20">
          <TituloDeSecao acao="Todas as fichas" enderecoAcao="/vinhos">
            Garrafas que exemplificam
          </TituloDeSecao>
          <div>
            {vinhos.map((vinho) => (
              <CartaoVinhoLinha key={vinho.id} vinho={vinho} />
            ))}
          </div>
        </section>
      )}

      <JsonLd dados={[schemaDoGuia(guia), schemaDeFaq(guia.faq), schemaDeMigalhas(trilha)]} />
    </>
  )
}
