import Link from 'next/link'
import type { Metadata } from 'next'

import { CartaoMateria, LinhaMateria } from '@/components/CartaoMateria'
import { CartaoVinho } from '@/components/CartaoVinho'
import { Chip } from '@/components/Chip'
import { FormularioBoletim } from '@/components/FormularioBoletim'
import { Imagem } from '@/components/Imagem'
import { Secao, TituloDeSecao } from '@/components/Secao'
import { dataPorExtenso, iso } from '@/lib/formatar'
import { listarTextos, listarVinhos, obterManchete } from '@/lib/consultas'
import { resumoOuTrecho } from '@/lib/texto'
import { autoraDe, obterConfiguracoes } from '@/lib/site'

// A home é montada a cada hora, ou quando o conteúdo muda. Ninguém espera pelo banco.
export const revalidate = 3600

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function Home() {
  const [config, manchete] = await Promise.all([obterConfiguracoes(), obterManchete()])

  const [textos, vinhos] = await Promise.all([
    listarTextos({ limite: 11, excluirIds: manchete ? [manchete.id] : [] }),
    listarVinhos({ limite: 4 }),
  ])

  const autora = autoraDe(config)

  const [destaqueA, destaqueB, destaqueC, ...demais] = textos.docs
  const vazio = !manchete && textos.docs.length === 0 && vinhos.docs.length === 0

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
        <Secao rotulo="Últimos textos" className="caixa !pb-0">
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
              <TituloDeSecao acao="Ver todos" enderecoAcao="/materias">
                Também publicamos
              </TituloDeSecao>
              {/* Sem trilho lateral: com um tipo só de conteúdo, não há um segundo
                  acervo de textos para oferecer aqui. A lista ocupa a largura. */}
              <div className="grade">
                <div className="col-span-6 lg:col-span-8 lg:col-start-3">
                  {demais.map((texto, indice) => (
                    <LinhaMateria key={texto.id} conteudo={texto} numero={indice + 1} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </Secao>
      )}

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
