import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { BlocoAutor } from '@/components/BlocoAutor'
import { CartaoMateria } from '@/components/CartaoMateria'
import { CartaoVinhoLinha } from '@/components/CartaoVinho'
import { Chip } from '@/components/Chip'
import { Faq } from '@/components/Faq'
import { Figura } from '@/components/Imagem'
import { FormularioBoletim } from '@/components/FormularioBoletim'
import { JsonLd } from '@/components/JsonLd'
import { Migalhas } from '@/components/Migalhas'
import { TituloDeSecao } from '@/components/Secao'
import { TextoRico } from '@/components/TextoRico'
import { dataPorExtenso, iso } from '@/lib/formatar'
import { montarMetadados } from '@/lib/metadados'
import { obterPayload } from '@/lib/payload'
import { listarMaterias, obterMateria } from '@/lib/consultas'
import { schemaDaMateria, schemaDeFaq, schemaDeMigalhas } from '@/lib/schema'
import type { Autor, Categoria, Guia, Materia, Tag, Vinho } from '@/payload-types'

export const revalidate = 3600
export const dynamicParams = true

/** Gera as páginas de antemão: quem chega do Instagram recebe HTML pronto. */
export async function generateStaticParams() {
  try {
    const payload = await obterPayload()
    const materias = await payload.find({
      collection: 'materias',
      where: { _status: { equals: 'published' } },
      limit: 500,
      depth: 0,
      select: { slug: true },
      overrideAccess: false,
    })
    return materias.docs
      .filter((materia) => materia.slug)
      .map((materia) => ({ slug: materia.slug! }))
  } catch {
    return []
  }
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const materia = await obterMateria(slug)
  if (!materia) return { title: 'Matéria não encontrada' }

  const autor = materia.autor && typeof materia.autor === 'object' ? (materia.autor as Autor) : null
  const categoria =
    materia.categoria && typeof materia.categoria === 'object'
      ? (materia.categoria as Categoria)
      : null

  return montarMetadados({
    seo: materia.seo,
    titulo: materia.titulo,
    descricao: materia.resumo,
    imagem: materia.destaque?.imagem,
    caminho: `/materias/${materia.slug}`,
    publicadoEm: materia.dataPublicacao,
    atualizadoEm: materia.dataAtualizacao ?? materia.updatedAt,
    autores: autor ? [autor.nome] : undefined,
    secao: categoria?.nome,
    tags: materia.tags
      ?.map((tag) => (typeof tag === 'object' ? (tag as Tag).nome : null))
      .filter((nome): nome is string => Boolean(nome)),
  })
}

export default async function PaginaDaMateria({ params }: Props) {
  const { slug } = await params
  const materia = await obterMateria(slug)
  if (!materia) notFound()

  const autor = materia.autor && typeof materia.autor === 'object' ? (materia.autor as Autor) : null
  const categoria =
    materia.categoria && typeof materia.categoria === 'object'
      ? (materia.categoria as Categoria)
      : null

  const vinhos = (materia.vinhosRelacionados ?? []).filter(
    (item): item is Vinho => typeof item === 'object',
  )
  const guias = (materia.guiasRelacionados ?? []).filter(
    (item): item is Guia => typeof item === 'object',
  )
  const tags = (materia.tags ?? []).filter((item): item is Tag => typeof item === 'object')

  // "Leia também" escolhido à mão vence; sem escolha, cai nas mais recentes.
  const escolhidas = (materia.materiasRelacionadas ?? []).filter(
    (item): item is Materia => typeof item === 'object',
  )
  const relacionadas =
    escolhidas.length > 0
      ? escolhidas.slice(0, 3)
      : (await listarMaterias({ limite: 3, excluirIds: [materia.id] })).docs

  const dataDeEstreia = materia.dataPublicacao ?? materia.createdAt
  const foiAtualizada =
    materia.dataAtualizacao &&
    new Date(materia.dataAtualizacao).getTime() - new Date(dataDeEstreia).getTime() > 86_400_000

  const trilha = [
    { nome: 'Início', endereco: '/' },
    { nome: 'Matérias', endereco: '/materias' },
    { nome: materia.titulo, endereco: `/materias/${materia.slug}` },
  ]

  // A capitular só entra em texto longo. Em nota curta, vira enfeite.
  const textoLongo = (materia.tempoLeitura ?? 0) >= 4

  return (
    <>
      <article className="caixa pt-8 md:pt-10">
        <Migalhas trilha={trilha} className="mb-8" />

        {/* Abertura assimétrica: o título ocupa o lugar da capa de revista. */}
        <header className="grade border-b border-tinta pb-10 md:pb-14">
          <div className="col-span-6 lg:col-span-8">
            <p className="rotulo flex flex-wrap items-center gap-x-3 gap-y-1 text-borra">
              <Chip cor={materia.chipCor} tamanho="pequeno" />
              {categoria?.nome && (
                <Link href={`/materias?categoria=${categoria.slug}`} className="hover:underline">
                  {categoria.nome}
                </Link>
              )}
            </p>

            <h1
              className="mt-4 text-t1 tracking-[-0.032em] equilibrado"
              style={{ fontVariationSettings: "'SOFT' 22, 'WONK' 1", fontWeight: 500 }}
            >
              {materia.titulo}
            </h1>

            {materia.subtitulo && (
              <p className="mt-5 max-w-2xl text-corpo-grande leading-snug text-grafite bonito">
                {materia.subtitulo}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
              {autor && (
                <p className="rotulo">
                  Por{' '}
                  <Link href="/sobre" className="text-borra hover:underline">
                    {autor.nome}
                  </Link>
                </p>
              )}
              <span aria-hidden="true" className="rotulo text-tenue">
                ·
              </span>
              <p className="rotulo text-grafite">
                <time dateTime={iso(dataDeEstreia)}>{dataPorExtenso(dataDeEstreia)}</time>
              </p>
              {materia.tempoLeitura ? (
                <>
                  <span aria-hidden="true" className="rotulo text-tenue">
                    ·
                  </span>
                  <p className="rotulo text-grafite">{materia.tempoLeitura} min de leitura</p>
                </>
              ) : null}
            </div>

            {foiAtualizada && (
              <p className="rotulo mt-2 text-grafite">
                Atualizada em{' '}
                <time dateTime={iso(materia.dataAtualizacao)}>
                  {dataPorExtenso(materia.dataAtualizacao)}
                </time>
              </p>
            )}
          </div>

          {/* O resumo como olho de revista — e como o trecho que a IA vai citar. */}
          <p className="col-span-6 self-end border-l border-borra pl-5 text-apoio leading-relaxed text-grafite lg:col-span-3 lg:col-start-10 bonito">
            {materia.resumo}
          </p>
        </header>

        {materia.destaque?.imagem && typeof materia.destaque.imagem === 'object' && (
          <Figura
            midia={materia.destaque.imagem}
            legenda={materia.destaque.legenda}
            credito={materia.destaque.credito}
            tamanho="largura"
            sizes="(max-width: 62rem) 100vw, 82rem"
            proporcao="16 / 9"
            prioridade
            className="mt-10 md:mt-14"
          />
        )}

        {/* Corpo em coluna de leitura, com trilho lateral para o material de apoio. */}
        <div className="grade mt-12 md:mt-16">
          <div className="col-span-6 lg:col-span-7 lg:col-start-2">
            <TextoRico dados={materia.corpo} capitular={textoLongo} />

            <Faq perguntas={materia.faq} />

            {tags.length > 0 && (
              <div className="mt-14 border-t border-fio pt-5">
                <h2 className="rotulo text-grafite">Assuntos</h2>
                <ul className="mt-3 flex flex-wrap gap-x-2 gap-y-2">
                  {tags.map((tag) => (
                    <li key={tag.id}>
                      <Link
                        href={`/materias?tag=${tag.slug}`}
                        className="rotulo inline-block border border-fio px-3 py-2 text-grafite transition-colors hover:border-tinta hover:text-tinta"
                      >
                        {tag.nome}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {autor && <BlocoAutor autor={autor} />}
          </div>

          <aside className="col-span-6 lg:col-span-3 lg:col-start-10">
            <div className="lg:sticky lg:top-[calc(var(--altura-cabecalho)+2rem)]">
              {vinhos.length > 0 && (
                <section>
                  <h2 className="rotulo border-b border-tinta pb-3">Vinhos citados</h2>
                  <div className="mt-1">
                    {vinhos.map((vinho) => (
                      <CartaoVinhoLinha key={vinho.id} vinho={vinho} />
                    ))}
                  </div>
                </section>
              )}

              {guias.length > 0 && (
                <section className={vinhos.length > 0 ? 'mt-12' : undefined}>
                  <h2 className="rotulo border-b border-tinta pb-3">Para entender melhor</h2>
                  <ul className="mt-4 space-y-4">
                    {guias.map((guia) => (
                      <li key={guia.id}>
                        <Link href={`/guias/${guia.slug}`} className="group flex items-baseline gap-3">
                          <Chip cor={guia.chipCor} tamanho="pequeno" />
                          <span className="link-titulo text-apoio leading-snug">{guia.titulo}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </aside>
        </div>
      </article>

      {relacionadas.length > 0 && (
        <section className="caixa mt-20">
          <TituloDeSecao acao="Todas as matérias" enderecoAcao="/materias">
            Leia também
          </TituloDeSecao>
          <div className="grade">
            {relacionadas.map((outra) => (
              <div key={outra.id} className="col-span-6 lg:col-span-4">
                <CartaoMateria conteudo={outra} tamanho="pequeno" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="noturno mt-20">
        <div className="caixa py-14 md:py-20">
          <div className="grade items-start">
            <div className="col-span-6 lg:col-span-5">
              <h2
                className="text-t2 tracking-[-0.03em] equilibrado"
                style={{ fontVariationSettings: "'SOFT' 24, 'WONK' 1", fontWeight: 400 }}
              >
                Gostou? O Boletim chega toda semana.
              </h2>
            </div>
            <div className="col-span-6 lg:col-span-6 lg:col-start-7">
              <FormularioBoletim origem={`materia:${materia.slug}`} compacto />
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        dados={[
          schemaDaMateria(materia),
          schemaDeFaq(materia.faq),
          schemaDeMigalhas(trilha),
        ]}
      />
    </>
  )
}
