import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { Chip } from '@/components/Chip'
import { Figura } from '@/components/Imagem'
import { FormularioBoletim } from '@/components/FormularioBoletim'
import { JsonLd } from '@/components/JsonLd'
import { Migalhas } from '@/components/Migalhas'
import { TextoRico } from '@/components/TextoRico'
import { faixaPorId } from '@/lib/escala-cores'
import { dataPorExtenso, doisDigitos, iso } from '@/lib/formatar'
import { montarMetadados } from '@/lib/metadados'
import { obterPayload } from '@/lib/payload'
import { obterEdicao, obterVizinhasDaEdicao } from '@/lib/consultas'
import { schemaDaEdicao, schemaDeMigalhas } from '@/lib/schema'
import { obterConfiguracoes } from '@/lib/site'

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const payload = await obterPayload()
    const edicoes = await payload.find({
      collection: 'edicoes',
      where: { _status: { equals: 'published' } },
      limit: 500,
      depth: 0,
      select: { slug: true },
      overrideAccess: false,
    })
    return edicoes.docs.filter((edicao) => edicao.slug).map((edicao) => ({ slug: edicao.slug! }))
  } catch {
    return []
  }
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const edicao = await obterEdicao(slug)
  if (!edicao) return { title: 'Edição não encontrada' }

  return montarMetadados({
    seo: edicao.seo,
    titulo: `Edição ${edicao.numero}: ${edicao.titulo}`,
    descricao: edicao.resumo,
    imagem: edicao.destaque?.imagem,
    caminho: `/boletim/${edicao.slug}`,
    publicadoEm: edicao.dataEnvio,
    atualizadoEm: edicao.updatedAt,
  })
}

export default async function PaginaDaEdicao({ params }: Props) {
  const { slug } = await params
  const edicao = await obterEdicao(slug)
  if (!edicao) notFound()

  const [config, vizinhas] = await Promise.all([
    obterConfiguracoes(),
    obterVizinhasDaEdicao(edicao.numero),
  ])

  const faixa = faixaPorId(edicao.chipCor)
  const blocos = (edicao.blocos ?? []).filter((bloco) => bloco.titulo && bloco.ancora)

  const trilha = [
    { nome: 'Início', endereco: '/' },
    { nome: 'Boletim', endereco: '/boletim' },
    { nome: `Edição ${edicao.numero}`, endereco: `/boletim/${edicao.slug}` },
  ]

  return (
    <>
      {/* A faixa de cor da edição atravessa o topo: identidade antes do texto. */}
      <div className="h-2 w-full" style={{ backgroundColor: faixa.hex }} aria-hidden="true" />

      <article className="caixa pt-8 md:pt-10">
        <Migalhas trilha={trilha} className="mb-8" />

        <header className="grade items-end border-b border-tinta pb-10 md:pb-14">
          {/* O número da edição como elemento gráfico, à maneira de revista. */}
          <p
            className="col-span-6 cartaz text-borra lg:col-span-2"
            aria-hidden="true"
          >
            {doisDigitos(edicao.numero)}
          </p>

          <div className="col-span-6 lg:col-span-8 lg:col-start-4">
            <p className="rotulo flex flex-wrap items-center gap-x-3 gap-y-1 text-grafite">
              <Chip cor={edicao.chipCor} tamanho="pequeno" />
              <span>
                Edição {edicao.numero} · {faixa.nome}
              </span>
              <span aria-hidden="true" className="text-tenue">
                ·
              </span>
              <time dateTime={iso(edicao.dataEnvio)}>{dataPorExtenso(edicao.dataEnvio)}</time>
            </p>

            <h1
              className="mt-4 text-t1 tracking-[-0.032em] equilibrado"
              style={{ fontVariationSettings: "'SOFT' 22, 'WONK' 1", fontWeight: 500 }}
            >
              {edicao.titulo}
            </h1>

            {edicao.subtitulo && (
              <p className="mt-5 max-w-2xl text-corpo-grande leading-snug text-grafite bonito">
                {edicao.subtitulo}
              </p>
            )}
          </div>
        </header>

        {edicao.destaque?.imagem && typeof edicao.destaque.imagem === 'object' && (
          <Figura
            midia={edicao.destaque.imagem}
            legenda={edicao.destaque.legenda}
            credito={edicao.destaque.credito}
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
              {edicao.resumo}
            </p>

            <TextoRico dados={edicao.corpo} />
          </div>

          {/* Índice dos blocos: permite mandar alguém direto para um trecho. */}
          {blocos.length > 0 && (
            <aside className="col-span-6 lg:col-span-3 lg:col-start-10">
              <nav
                aria-label="Nesta edição"
                className="lg:sticky lg:top-[calc(var(--altura-cabecalho)+2rem)]"
              >
                <h2 className="rotulo border-b border-tinta pb-3">Nesta edição</h2>
                <ol className="mt-4 space-y-3.5">
                  {blocos.map((bloco, indice) => (
                    <li key={bloco.id ?? indice} className="flex gap-3">
                      <span aria-hidden="true" className="rotulo pt-0.5 text-tenue">
                        {doisDigitos(indice + 1)}
                      </span>
                      <a href={`#${bloco.ancora}`} className="link-titulo text-apoio leading-snug">
                        {bloco.titulo}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          )}
        </div>

        {/* Navegação do arquivo: dá para percorrer as 22 edições sem voltar ao índice. */}
        <nav
          aria-label="Outras edições"
          className="mt-20 grid gap-px border-y border-tinta bg-fio sm:grid-cols-2"
        >
          {vizinhas.anterior ? (
            <Link
              href={`/boletim/${vizinhas.anterior.slug}`}
              rel="prev"
              className="group flex flex-col justify-between gap-3 bg-papel p-6 transition-colors hover:bg-papel-fundo sm:p-8"
            >
              <span className="rotulo text-grafite">
                ← Edição {vizinhas.anterior.numero}
              </span>
              <span className="link-titulo text-t4 leading-snug">
                {vizinhas.anterior.titulo}
              </span>
            </Link>
          ) : (
            <span className="bg-papel p-6 sm:p-8">
              <span className="rotulo text-tenue">Primeira edição</span>
            </span>
          )}

          {vizinhas.proxima ? (
            <Link
              href={`/boletim/${vizinhas.proxima.slug}`}
              rel="next"
              className="group flex flex-col items-end justify-between gap-3 bg-papel p-6 text-right transition-colors hover:bg-papel-fundo sm:p-8"
            >
              <span className="rotulo text-grafite">Edição {vizinhas.proxima.numero} →</span>
              <span className="link-titulo text-t4 leading-snug">{vizinhas.proxima.titulo}</span>
            </Link>
          ) : (
            <span className="bg-papel p-6 text-right sm:p-8">
              <span className="rotulo text-tenue">Edição mais recente</span>
            </span>
          )}
        </nav>
      </article>

      <section className="noturno mt-16">
        <div className="caixa py-14 md:py-20">
          <div className="grade items-start">
            <div className="col-span-6 lg:col-span-5">
              <h2
                className="text-t2 tracking-[-0.03em] equilibrado"
                style={{ fontVariationSettings: "'SOFT' 24, 'WONK' 1", fontWeight: 400 }}
              >
                A próxima edição chega na quinta.
              </h2>
              <p className="mt-4 text-apoio leading-relaxed opacity-85">
                <Link href="/boletim" className="underline">
                  Ver o arquivo completo
                </Link>{' '}
                — tudo aberto, sem cadastro para ler.
              </p>
            </div>
            <div className="col-span-6 lg:col-span-6 lg:col-start-7">
              <FormularioBoletim origem={`edicao:${edicao.numero}`} compacto />
            </div>
          </div>
        </div>
      </section>

      <JsonLd dados={[schemaDaEdicao(edicao, config), schemaDeMigalhas(trilha)]} />
    </>
  )
}
