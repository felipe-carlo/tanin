import Link from 'next/link'
import type { Metadata } from 'next'

import { CartaoMateria, LinhaMateria } from '@/components/CartaoMateria'
import { CartaoVinho } from '@/components/CartaoVinho'
import { Chip } from '@/components/Chip'
import { FitaCromatica } from '@/components/FitaCromatica'
import { FormularioBoletim } from '@/components/FormularioBoletim'
import { Imagem } from '@/components/Imagem'
import { Secao, TituloDeSecao } from '@/components/Secao'
import { dataPorExtenso, doisDigitos, iso } from '@/lib/formatar'
import { listarTextos, listarVinhos, obterManchete } from '@/lib/consultas'
import { categoriaPorValor } from '@/lib/categorias'
import { resumoOuTrecho } from '@/lib/texto'
import { autoraDe, obterConfiguracoes } from '@/lib/site'

// A home é montada a cada hora, ou quando o conteúdo muda. Ninguém espera pelo banco.
export const revalidate = 3600

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function Home() {
  const [config, manchete, edicoes, guias] = await Promise.all([
    obterConfiguracoes(),
    obterManchete(),
    listarTextos({ secao: 'boletim', limite: 60, ordem: 'numero' }),
    listarTextos({ secao: 'guia', limite: 5 }),
  ])

  const [materias, vinhos] = await Promise.all([
    listarTextos({ secao: 'materia', limite: 7, excluirIds: manchete ? [manchete.id] : [] }),
    listarVinhos({ limite: 4 }),
  ])

  const autora = autoraDe(config)
  const categoriaManchete = categoriaPorValor(manchete?.categoria)

  const [destaqueA, destaqueB, destaqueC, ...demais] = materias.docs
  const ultimaEdicao = edicoes.docs[edicoes.docs.length - 1]
  const vazio = !manchete && materias.docs.length === 0 && vinhos.docs.length === 0

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* MANCHETE                                                            */}
      {/* ------------------------------------------------------------------ */}
      {manchete ? (
        <section className="caixa border-b border-tinta pb-14 pt-10 md:pb-20 md:pt-14">
          <div className="grade items-start">
            <div className="revelar col-span-6 lg:col-span-7">
              <p className="rotulo flex flex-wrap items-center gap-x-3 gap-y-1 text-borra">
                <Chip cor={manchete.chipCor} tamanho="pequeno" />
                {categoriaManchete && <span>{categoriaManchete.label}</span>}
                <span aria-hidden="true" className="text-tenue">
                  ·
                </span>
                <time dateTime={iso(manchete.dataPublicacao ?? manchete.createdAt)} className="text-grafite">
                  {dataPorExtenso(manchete.dataPublicacao ?? manchete.createdAt)}
                </time>
              </p>

              <h1
                className="mt-5 text-manchete tracking-[-0.035em] equilibrado"
                style={{ fontVariationSettings: "'SOFT' 24, 'WONK' 1", fontWeight: 500 }}
              >
                <Link href={`/materias/${manchete.slug}`} className="link-titulo">
                  {manchete.titulo}
                </Link>
              </h1>

              {manchete.subtitulo && (
                <p className="mt-6 max-w-2xl text-corpo-grande leading-snug text-grafite bonito">
                  {manchete.subtitulo}
                </p>
              )}

              <p className="rotulo mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-grafite">
                {autora.nome && <span>Por {autora.nome}</span>}
                {manchete.tempoLeitura ? (
                  <>
                    <span aria-hidden="true" className="text-tenue">
                      ·
                    </span>
                    <span>{manchete.tempoLeitura} min de leitura</span>
                  </>
                ) : null}
              </p>
            </div>

            <div
              className="revelar col-span-6 lg:col-span-5"
              style={{ '--atraso': 1 } as React.CSSProperties}
            >
              {manchete.destaque?.imagem && typeof manchete.destaque.imagem === 'object' ? (
                <figure>
                  <Imagem
                    midia={manchete.destaque.imagem}
                    tamanho="largura"
                    sizes="(max-width: 62rem) 92vw, 40vw"
                    proporcao="4 / 5"
                    prioridade
                  />
                  {(manchete.destaque.legenda || manchete.destaque.credito) && (
                    <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 border-t border-fio pt-2.5">
                      {manchete.destaque.legenda && (
                        <span className="text-miudo leading-snug text-grafite">
                          {manchete.destaque.legenda}
                        </span>
                      )}
                      {manchete.destaque.credito && (
                        <span className="rotulo text-grafite/80">{manchete.destaque.credito}</span>
                      )}
                    </figcaption>
                  )}
                </figure>
              ) : (
                <p className="border-l border-borra pl-6 text-corpo-grande leading-relaxed bonito">
                  {resumoOuTrecho(manchete)}
                </p>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="caixa border-b border-tinta py-20 md:py-28">
          <h1
            className="max-w-4xl text-manchete tracking-[-0.035em] equilibrado"
            style={{ fontVariationSettings: "'SOFT' 24, 'WONK' 1", fontWeight: 500 }}
          >
            {config.homeChamada ??
              config.descricao ??
              'Vinho contado como quem conversa, não como quem vende.'}
          </h1>
          <p className="mt-8 max-w-xl text-corpo-grande leading-snug text-grafite bonito">
            O portal está de pé e esperando o primeiro texto. Publique pelo painel e ele
            aparece aqui.
          </p>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* GRADE ASSIMÉTRICA                                                   */}
      {/* ------------------------------------------------------------------ */}
      {(destaqueA || destaqueB || destaqueC) && (
        <Secao rotulo="Últimas matérias" className="caixa !pb-0">
          <div className="grade">
            {destaqueA && (
              <div className="revelar-ao-rolar col-span-6 lg:col-span-5">
                <CartaoMateria conteudo={destaqueA} tamanho="medio" nivel={2} />
              </div>
            )}
            {destaqueB && (
              <div className="revelar-ao-rolar col-span-6 lg:col-span-4">
                <CartaoMateria conteudo={destaqueB} tamanho="medio" nivel={2} />
              </div>
            )}
            {destaqueC && (
              <div className="revelar-ao-rolar col-span-6 border-t border-tinta pt-5 lg:col-span-3 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <CartaoMateria conteudo={destaqueC} tamanho="pequeno" mostrarResumo nivel={2} />
              </div>
            )}
          </div>

          {demais.length > 0 && (
            <div className="mt-16">
              <TituloDeSecao acao="Ver todas" enderecoAcao="/materias">
                Também publicamos
              </TituloDeSecao>
              <div className="grade">
                <div className="col-span-6 lg:col-span-8">
                  {demais.slice(0, 4).map((materia, indice) => (
                    <LinhaMateria key={materia.id} conteudo={materia} numero={indice + 1} />
                  ))}
                </div>

                {/* Um `div` e não um `aside`: o `h3` "Para entender" já dá a este bloco
                    um nome pelo qual leitor de tela navega, e um marco de página
                    aninhado dentro do `main` só acrescentaria ruído. */}
                {guias.docs.length > 0 && (
                  <div className="col-span-6 lg:col-span-3 lg:col-start-10">
                    <h3 className="rotulo border-b border-tinta pb-3">Para entender</h3>
                    <ul className="mt-4 space-y-4">
                      {guias.docs.slice(0, 5).map((guia) => (
                        <li key={guia.id}>
                          <Link
                            href={`/guias/${guia.slug}`}
                            className="group flex items-baseline gap-3"
                          >
                            <Chip cor={guia.chipCor} tamanho="pequeno" />
                            <span className="link-titulo text-apoio leading-snug">
                              {guia.titulo}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link href="/guias" className="rotulo mt-6 inline-block text-grafite hover:text-borra">
                      Todos os guias <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </Secao>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* BOLETIM E FITA CROMÁTICA                                            */}
      {/* ------------------------------------------------------------------ */}
      <Secao rotulo="Boletim Tanin" className="mt-8">
        <div className="caixa">
          <TituloDeSecao acao="Ver o arquivo" enderecoAcao="/boletim">
            {config.boletimTitulo ?? 'Boletim Tanin'} — {edicoes.totalDocs}{' '}
            {edicoes.totalDocs === 1 ? 'edição' : 'edições'}
          </TituloDeSecao>
        </div>

        {edicoes.docs.length > 0 ? (
          <>
            <FitaCromatica edicoes={edicoes.docs} altura="alta" />
            <div className="caixa mt-6">
              <div className="grade items-baseline">
                <p className="col-span-6 text-apoio leading-relaxed text-grafite lg:col-span-5 bonito">
                  Uma faixa por edição, na cor do vinho de que ela fala. A fita cresce toda
                  semana — passe o cursor para ver o que tem dentro de cada uma.
                </p>
                {ultimaEdicao && (
                  <div className="col-span-6 lg:col-span-5 lg:col-start-8">
                    <p className="rotulo text-grafite">
                      Última edição · {dataPorExtenso(ultimaEdicao.dataPublicacao)}
                    </p>
                    <h3 className="mt-2 text-t3 leading-tight">
                      <Link href={`/boletim/${ultimaEdicao.slug}`} className="link-titulo">
                        <span className="cartaz !text-t3 mr-2 text-borra">
                          {doisDigitos(ultimaEdicao.numero ?? 0)}
                        </span>
                        {ultimaEdicao.titulo}
                      </Link>
                    </h3>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="caixa">
            <p className="text-apoio text-grafite">
              O arquivo do Boletim aparece aqui assim que a primeira edição for publicada.
            </p>
          </div>
        )}
      </Secao>

      {/* ------------------------------------------------------------------ */}
      {/* FICHAS DE VINHO                                                     */}
      {/* ------------------------------------------------------------------ */}
      {vinhos.docs.length > 0 && (
        <Secao rotulo="Fichas de vinho" className="caixa">
          <TituloDeSecao acao="Todas as fichas" enderecoAcao="/vinhos">
            Provamos e contamos
          </TituloDeSecao>
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 lg:gap-x-8">
            {vinhos.docs.map((vinho) => (
              <div key={vinho.id} className="revelar-ao-rolar">
                <CartaoVinho vinho={vinho} />
              </div>
            ))}
          </div>
        </Secao>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* ASSINATURA                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="noturno mt-8" id="assinar">
        <div className="caixa py-16 md:py-24">
          <div className="grade items-start">
            <div className="col-span-6 lg:col-span-5">
              <p className="rotulo">{config.boletimPeriodicidade ?? 'Semanal, às quintas'}</p>
              <h2
                className="mt-4 text-t1 tracking-[-0.03em] equilibrado"
                style={{ fontVariationSettings: "'SOFT' 24, 'WONK' 1", fontWeight: 400 }}
              >
                {config.boletimTitulo ?? 'Boletim Tanin'}
              </h2>
              <p className="mt-5 max-w-md text-apoio leading-relaxed opacity-85 bonito">
                {config.boletimChamada ??
                  'Toda semana, uma carta sobre vinho — o que vale a pena abrir, o que não vale o preço e o que ninguém está contando.'}
              </p>
            </div>
            <div className="col-span-6 lg:col-span-6 lg:col-start-7">
              <FormularioBoletim origem="home" rotuloBotao="Quero receber" />
            </div>
          </div>
        </div>
      </section>

      {vazio && (
        <div className="caixa py-16">
          <p className="rotulo text-grafite">
            Nada publicado ainda ·{' '}
            <Link href="/admin" className="text-borra underline">
              abrir o painel
            </Link>
          </p>
        </div>
      )}
    </>
  )
}
