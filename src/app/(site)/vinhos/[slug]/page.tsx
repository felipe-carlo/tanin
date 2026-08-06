import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { BlocoAutor } from '@/components/BlocoAutor'
import { CartaoVinhoLinha } from '@/components/CartaoVinho'
import { CartaoMateria } from '@/components/CartaoMateria'
import { EscalaDoVinho } from '@/components/EscalaDoVinho'
import { Faq } from '@/components/Faq'
import { FichaTecnica } from '@/components/FichaTecnica'
import { Figura } from '@/components/Imagem'
import { JsonLd } from '@/components/JsonLd'
import { Migalhas } from '@/components/Migalhas'
import { TituloDeSecao } from '@/components/Secao'
import { Tacas } from '@/components/Tacas'
import { TextoRico } from '@/components/TextoRico'
import { dataCurta, dataPorExtenso, iso } from '@/lib/formatar'
import { montarMetadados } from '@/lib/metadados'
import { obterPayload } from '@/lib/payload'
import { obterVinho } from '@/lib/consultas'
import { schemaDeFaq, schemaDeMigalhas, schemaDoVinho } from '@/lib/schema'
import {
  descreverProcedencia,
  descreverUvas,
  nomeCompleto,
  rotuloCorpo,
  rotuloPreco,
  rotuloTipo,
} from '@/lib/vinho'
import type { Autor, Guia, Importadora, Materia, Regiao, Uva, Vinho } from '@/payload-types'

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const payload = await obterPayload()
    const vinhos = await payload.find({
      collection: 'vinhos',
      where: { _status: { equals: 'published' } },
      limit: 1000,
      depth: 0,
      select: { slug: true },
      overrideAccess: false,
    })
    return vinhos.docs.filter((vinho) => vinho.slug).map((vinho) => ({ slug: vinho.slug! }))
  } catch {
    return []
  }
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const vinho = await obterVinho(slug)
  if (!vinho) return { title: 'Ficha não encontrada' }

  const autor = vinho.autor && typeof vinho.autor === 'object' ? (vinho.autor as Autor) : null

  return montarMetadados({
    seo: vinho.seo,
    titulo: nomeCompleto(vinho),
    descricao: vinho.veredito,
    imagem: vinho.destaque?.imagem,
    caminho: `/vinhos/${vinho.slug}`,
    publicadoEm: vinho.dataPublicacao,
    atualizadoEm: vinho.dataAtualizacao ?? vinho.updatedAt,
    autores: autor ? [autor.nome] : undefined,
    secao: 'Fichas de vinho',
  })
}

export default async function PaginaDoVinho({ params }: Props) {
  const { slug } = await params
  const vinho = await obterVinho(slug)
  if (!vinho) notFound()

  const autor = vinho.autor && typeof vinho.autor === 'object' ? (vinho.autor as Autor) : null
  const regiao = vinho.regiao && typeof vinho.regiao === 'object' ? (vinho.regiao as Regiao) : null
  const importadora =
    vinho.importadora && typeof vinho.importadora === 'object'
      ? (vinho.importadora as Importadora)
      : null

  const uvas = (vinho.uvas ?? [])
    .map((item) => (item.uva && typeof item.uva === 'object' ? (item.uva as Uva) : null))
    .filter((uva): uva is Uva => Boolean(uva))

  const similares = (vinho.vinhosSimilares ?? []).filter(
    (item): item is Vinho => typeof item === 'object',
  )
  const materias = (vinho.materiasRelacionadas ?? []).filter(
    (item): item is Materia => typeof item === 'object',
  )
  const guias = (vinho.guiasRelacionados ?? []).filter(
    (item): item is Guia => typeof item === 'object',
  )

  const dataDeEstreia = vinho.dataPublicacao ?? vinho.createdAt
  const trilha = [
    { nome: 'Início', endereco: '/' },
    { nome: 'Vinhos', endereco: '/vinhos' },
    { nome: nomeCompleto(vinho), endereco: `/vinhos/${vinho.slug}` },
  ]

  return (
    <>
      <article className="caixa pt-8 md:pt-10">
        <Migalhas trilha={trilha} className="mb-8" />

        {/* ---------------------------------------------------------------- */}
        {/* ABERTURA                                                          */}
        {/* ---------------------------------------------------------------- */}
        <header className="grade items-start border-b border-tinta pb-10 md:pb-14">
          <div className="col-span-6 lg:col-span-7">
            <p className="rotulo flex flex-wrap items-center gap-x-3 gap-y-1 text-borra">
              <Link href={`/vinhos?tipo=${vinho.tipo}`} className="hover:underline">
                {rotuloTipo(vinho.tipo)}
              </Link>
              <span aria-hidden="true" className="text-tenue">
                ·
              </span>
              <Link
                href={`/vinhos?pais=${encodeURIComponent(vinho.pais)}`}
                className="text-grafite hover:underline"
              >
                {descreverProcedencia(vinho)}
              </Link>
            </p>

            <h1
              className="mt-4 text-t1 tracking-[-0.032em] equilibrado"
              style={{ fontVariationSettings: "'SOFT' 22, 'WONK' 1", fontWeight: 500 }}
            >
              <span className="block text-t3 text-grafite">{vinho.produtor}</span>
              {vinho.nome}
              {vinho.safra ? <span className="text-grafite"> {vinho.safra}</span> : null}
            </h1>

            {/* O VEREDITO — o trecho que a IA vai citar. Vem antes de tudo. */}
            <p className="mt-7 max-w-2xl border-l-2 border-borra pl-5 text-corpo-grande leading-relaxed bonito">
              {vinho.veredito}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Tacas nota={vinho.nota} tamanho={18} />
              <p className="rotulo text-grafite">
                Provado por{' '}
                <Link href="/sobre" className="text-borra hover:underline">
                  {autor?.nome ?? 'Tanin'}
                </Link>{' '}
                em <time dateTime={iso(dataDeEstreia)}>{dataCurta(dataDeEstreia)}</time>
              </p>
            </div>
          </div>

          <div className="col-span-6 lg:col-span-4 lg:col-start-9">
            {vinho.destaque?.imagem && typeof vinho.destaque.imagem === 'object' ? (
              <Figura
                midia={vinho.destaque.imagem}
                legenda={vinho.destaque.legenda}
                credito={vinho.destaque.credito}
                tamanho="retrato"
                sizes="(max-width: 62rem) 92vw, 26rem"
                proporcao="3 / 4"
                prioridade
              />
            ) : null}
            <EscalaDoVinho
              cor={vinho.corNaEscala}
              className={vinho.destaque?.imagem ? 'mt-8' : undefined}
            />
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* CORPO                                                             */}
        {/* ---------------------------------------------------------------- */}
        <div className="grade mt-12 md:mt-16">
          <div className="col-span-6 lg:col-span-7">
            {vinho.notasDegustacao && (
              <section>
                <h2 className="rotulo border-b border-tinta pb-3">Na taça</h2>
                <TextoRico dados={vinho.notasDegustacao} className="mt-6" />
              </section>
            )}

            {vinho.harmonizacoes && vinho.harmonizacoes.length > 0 && (
              <section className="mt-14">
                <h2 className="rotulo border-b border-tinta pb-3">Com o que comer</h2>
                <ul className="mt-1">
                  {vinho.harmonizacoes.map((item, indice) => (
                    <li
                      key={item.id ?? indice}
                      className="flex flex-col gap-1 border-b border-fio py-4 sm:flex-row sm:items-baseline sm:gap-6"
                    >
                      <span className="font-[family-name:var(--font-display)] text-t4 leading-snug sm:w-2/5 sm:flex-none">
                        {item.prato}
                      </span>
                      {item.observacao && (
                        <span className="text-apoio leading-relaxed text-grafite bonito">
                          {item.observacao}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Faq perguntas={vinho.faq} />

            {materias.length > 0 && (
              <section className="mt-14">
                <h2 className="rotulo border-b border-tinta pb-3">Onde falamos deste vinho</h2>
                <ul className="mt-4 space-y-3">
                  {materias.map((materia) => (
                    <li key={materia.id}>
                      <Link href={`/materias/${materia.slug}`} className="link-titulo text-apoio">
                        {materia.titulo}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {autor && <BlocoAutor autor={autor} />}
          </div>

          {/* Trilho de dados — a parte "Wine Folly" da página. */}
          {/* Um `div`, e não um `aside`: cada bloco aqui dentro já é uma `section` com
              título próprio, que é o que leitor de tela usa para navegar. O `aside`
              aninhado no artigo não acrescentaria informação nenhuma. */}
          <div className="col-span-6 lg:col-span-4 lg:col-start-9">
            <div className="space-y-12">
              <FichaTecnica
                titulo="Ficha"
                colunas={1}
                itens={[
                  { rotulo: 'Produtor', valor: vinho.produtor },
                  {
                    rotulo: 'Região',
                    valor: regiao ? (
                      <Link href={`/vinhos?pais=${encodeURIComponent(vinho.pais)}`} className="hover:underline">
                        {regiao.nome}
                      </Link>
                    ) : (
                      vinho.subRegiao
                    ),
                  },
                  { rotulo: 'País', valor: vinho.pais },
                  { rotulo: 'Safra', valor: vinho.safra ?? 'Sem safra' },
                  { rotulo: 'Tipo', valor: rotuloTipo(vinho.tipo) },
                  { rotulo: 'Corpo', valor: rotuloCorpo(vinho.corpo) },
                  {
                    rotulo: 'Álcool',
                    valor: vinho.teorAlcoolico
                      ? `${vinho.teorAlcoolico.toLocaleString('pt-BR')}%`
                      : null,
                  },
                  {
                    rotulo: 'Uvas',
                    valor:
                      uvas.length > 0 ? (
                        <span className="inline-flex flex-wrap justify-end gap-x-2">
                          {vinho.uvas?.map((item, indice) => {
                            const uva = item.uva && typeof item.uva === 'object' ? (item.uva as Uva) : null
                            if (!uva) return null
                            return (
                              <span key={item.id ?? indice}>
                                <Link href={`/vinhos?uva=${uva.slug}`} className="hover:underline">
                                  {uva.nome}
                                </Link>
                                {item.percentual ? ` ${item.percentual}%` : ''}
                              </span>
                            )
                          })}
                        </span>
                      ) : (
                        descreverUvas(vinho) || null
                      ),
                  },
                ]}
              />

              <FichaTecnica
                titulo="Como servir"
                colunas={1}
                itens={[
                  { rotulo: 'Temperatura', valor: vinho.temperaturaServico },
                  { rotulo: 'Taça', valor: vinho.tacaRecomendada },
                  { rotulo: 'Decantar', valor: vinho.decantacao },
                  { rotulo: 'Guarda', valor: vinho.potencialGuarda },
                ]}
              />

              <section>
                <h2 className="rotulo border-b border-tinta pb-3">Onde encontrar</h2>
                <dl className="mt-1">
                  {vinho.faixaPreco && (
                    <div className="flex items-baseline justify-between gap-4 border-b border-fio py-3">
                      <dt className="rotulo text-grafite">Faixa de preço</dt>
                      <dd className="text-right text-apoio">
                        <Link
                          href={`/vinhos?preco=${vinho.faixaPreco}`}
                          className="hover:underline"
                        >
                          {rotuloPreco(vinho.faixaPreco)}
                        </Link>
                      </dd>
                    </div>
                  )}
                  {vinho.dataPreco && (
                    <div className="flex items-baseline justify-between gap-4 border-b border-fio py-3">
                      <dt className="rotulo text-grafite">Preço conferido</dt>
                      <dd className="text-right text-apoio">
                        <time dateTime={iso(vinho.dataPreco)}>{dataCurta(vinho.dataPreco)}</time>
                      </dd>
                    </div>
                  )}
                  {importadora && (
                    <div className="flex items-baseline justify-between gap-4 border-b border-fio py-3">
                      <dt className="rotulo text-grafite">Importadora</dt>
                      <dd className="text-right text-apoio">
                        {importadora.site ? (
                          <a
                            href={importadora.site}
                            target="_blank"
                            rel="noopener"
                            className="hover:underline"
                          >
                            {importadora.nome}
                          </a>
                        ) : (
                          importadora.nome
                        )}
                      </dd>
                    </div>
                  )}
                </dl>

                {vinho.ondeComprar && vinho.ondeComprar.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {vinho.ondeComprar.map((loja, indice) => (
                      <li key={loja.id ?? indice}>
                        <a
                          href={loja.url}
                          target="_blank"
                          rel={loja.afiliado ? 'sponsored noopener' : 'noopener'}
                          className="rotulo flex h-11 items-center justify-between border border-fio px-4 transition-colors hover:border-tinta"
                        >
                          <span>{loja.loja}</span>
                          <span aria-hidden="true">→</span>
                        </a>
                        {loja.afiliado && (
                          <p className="rotulo mt-1 text-tenue">Link de afiliado</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                <p className="mt-5 text-miudo leading-relaxed text-grafite">
                  Preço de vinho muda toda semana. Trabalhamos com faixas em vez de números
                  exatos, e a data acima diz quando conferimos pela última vez.
                </p>
              </section>

              {guias.length > 0 && (
                <section>
                  <h2 className="rotulo border-b border-tinta pb-3">Para entender melhor</h2>
                  <ul className="mt-4 space-y-3">
                    {guias.map((guia) => (
                      <li key={guia.id}>
                        <Link href={`/guias/${guia.slug}`} className="link-titulo text-apoio">
                          {guia.titulo}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <p className="rotulo text-grafite">
                Atualizada em{' '}
                <time dateTime={iso(vinho.dataAtualizacao ?? vinho.updatedAt)}>
                  {dataPorExtenso(vinho.dataAtualizacao ?? vinho.updatedAt)}
                </time>
              </p>
            </div>
          </div>
        </div>
      </article>

      {similares.length > 0 && (
        <section className="caixa mt-20">
          <TituloDeSecao acao="Todas as fichas" enderecoAcao="/vinhos">
            Se gostou deste, prove
          </TituloDeSecao>
          <div>
            {similares.map((similar) => (
              <CartaoVinhoLinha key={similar.id} vinho={similar} />
            ))}
          </div>
        </section>
      )}

      {materias.length > 0 && (
        <section className="caixa mt-20">
          <TituloDeSecao>Leia também</TituloDeSecao>
          <div className="grade">
            {materias.slice(0, 3).map((materia) => (
              <div key={materia.id} className="col-span-6 lg:col-span-4">
                <CartaoMateria conteudo={materia} tamanho="pequeno" />
              </div>
            ))}
          </div>
        </section>
      )}

      <JsonLd
        dados={[schemaDoVinho(vinho), schemaDeFaq(vinho.faq), schemaDeMigalhas(trilha)]}
      />
    </>
  )
}
