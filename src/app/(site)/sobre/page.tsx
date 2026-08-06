import Link from 'next/link'
import type { Metadata } from 'next'

import { FormularioBoletim } from '@/components/FormularioBoletim'
import { Imagem } from '@/components/Imagem'
import { JsonLd } from '@/components/JsonLd'
import { Migalhas } from '@/components/Migalhas'
import { TextoRico } from '@/components/TextoRico'
import { ESCALA_CROMATICA } from '@/lib/escala-cores'
import { FAIXAS_DE_NOTA, NOTA_MAXIMA, formatarNota } from '@/lib/nota'
import { metadadosDeIndice } from '@/lib/metadados'
import { obterAutoraPrincipal } from '@/lib/consultas'
import { schemaDaPessoa, schemaDeMigalhas } from '@/lib/schema'
import { NOMES_DE_REDE, URL_SITE, obterConfiguracoes } from '@/lib/site'
import type { Autor } from '@/payload-types'

export const revalidate = 3600

const DESCRICAO =
  'Quem escreve a Tanin, como escolhemos o que provar, como funciona a nota de taças e por que todo o conteúdo é aberto.'

export async function generateMetadata(): Promise<Metadata> {
  const config = await obterConfiguracoes()
  const autora =
    config.autoraPrincipal && typeof config.autoraPrincipal === 'object'
      ? (config.autoraPrincipal as Autor)
      : await obterAutoraPrincipal()

  return {
    ...metadadosDeIndice({
      titulo: autora ? `Sobre ${autora.nome} e a Tanin` : 'Sobre a Tanin',
      descricao: autora?.bioCurta ?? DESCRICAO,
      caminho: '/sobre',
    }),
    openGraph: {
      type: 'profile',
      url: `${URL_SITE}/sobre`,
      title: autora ? `Sobre ${autora.nome} e a Tanin` : 'Sobre a Tanin',
      description: autora?.bioCurta ?? DESCRICAO,
      locale: 'pt_BR',
      siteName: 'Tanin',
    },
  }
}

export default async function PaginaSobre() {
  const config = await obterConfiguracoes()
  const autora =
    config.autoraPrincipal && typeof config.autoraPrincipal === 'object'
      ? (config.autoraPrincipal as Autor)
      : await obterAutoraPrincipal()

  const trilha = [
    { nome: 'Início', endereco: '/' },
    { nome: 'Sobre', endereco: '/sobre' },
  ]

  return (
    <>
      <div className="caixa pt-8 md:pt-10">
        <Migalhas trilha={trilha} className="mb-8" />

        {/* ---------------------------------------------------------------- */}
        {/* A AUTORA — a âncora de autoridade do portal                       */}
        {/* ---------------------------------------------------------------- */}
        <header className="grade items-start border-b border-tinta pb-12 md:pb-16">
          <div className="col-span-6 lg:col-span-7">
            <p className="rotulo text-borra">{autora?.cargo ?? 'A publicação'}</p>
            <h1
              className="mt-4 text-manchete tracking-[-0.035em] equilibrado"
              style={{ fontVariationSettings: "'SOFT' 24, 'WONK' 1", fontWeight: 500 }}
            >
              {autora?.nome ?? 'Tanin'}
            </h1>
            {autora?.bioCurta && (
              <p className="mt-6 max-w-2xl text-corpo-grande leading-snug text-grafite bonito">
                {autora.bioCurta}
              </p>
            )}

            {autora?.redes && autora.redes.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {autora.redes.map((rede) => (
                  <li key={rede.id ?? rede.url}>
                    <a
                      href={rede.url}
                      target="_blank"
                      rel="me noopener"
                      className="rotulo text-grafite transition-colors hover:text-borra"
                    >
                      {NOMES_DE_REDE[rede.rede] ?? rede.rede} <span aria-hidden="true">→</span>
                    </a>
                  </li>
                ))}
                {autora.email && (
                  <li>
                    <a
                      href={`mailto:${autora.email}`}
                      className="rotulo text-grafite transition-colors hover:text-borra"
                    >
                      E-mail <span aria-hidden="true">→</span>
                    </a>
                  </li>
                )}
              </ul>
            )}
          </div>

          {autora?.foto && typeof autora.foto === 'object' && (
            <div className="col-span-6 lg:col-span-4 lg:col-start-9">
              <Imagem
                midia={autora.foto}
                tamanho="retrato"
                sizes="(max-width: 62rem) 92vw, 26rem"
                proporcao="3 / 4"
                prioridade
              />
            </div>
          )}
        </header>

        <div className="grade mt-12 md:mt-16">
          <div className="col-span-6 lg:col-span-7 lg:col-start-2">
            {autora?.bioLonga ? (
              <TextoRico dados={autora.bioLonga} capitular />
            ) : (
              <div className="prosa">
                <p>
                  {config.descricao ??
                    'A Tanin é uma publicação independente sobre vinho, escrita para quem bebe — e não para quem vende.'}
                </p>
              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* COMO AVALIAMOS — a página de método                            */}
            {/* -------------------------------------------------------------- */}
            <section id="como-avaliamos" className="mt-20 scroll-mt-32">
              <h2 className="rotulo border-b border-tinta pb-3 !font-semibold">
                Como avaliamos
              </h2>

              <div className="prosa mt-8 !max-w-none">
                <h3>A nota é de taças, não de pontos</h3>
                <p>
                  A escala de 100 pontos é o dialeto da indústria. Comunica bem para quem
                  vende vinho e mal para quem bebe: ninguém fora do ramo sabe dizer o que
                  separa um 89 de um 91. Aqui a régua vai de 1 a {NOTA_MAXIMA} taças, com
                  meias taças — a mesma que qualquer pessoa já usa para avaliar um
                  restaurante ou um hotel.
                </p>
              </div>

              <dl className="mt-8">
                {FAIXAS_DE_NOTA.map((faixa) => (
                  <div
                    key={faixa.rotulo}
                    className="flex items-baseline justify-between gap-4 border-b border-fio py-3"
                  >
                    <dt className="font-[family-name:var(--font-display)] text-t4">
                      {formatarNota(faixa.minimo)}
                      {faixa.minimo < NOTA_MAXIMA ? ' ou mais' : ''}
                    </dt>
                    <dd className="rotulo text-grafite">{faixa.rotulo}</dd>
                  </div>
                ))}
              </dl>

              <div className="prosa mt-10 !max-w-none">
                <h3>O veredito importa mais que o número</h3>
                <p>
                  Toda ficha começa por duas ou três frases que se sustentam sozinhas, fora
                  da página. É de propósito: é o trecho que responde se a garrafa vale o seu
                  dinheiro, e é o que buscadores e assistentes de inteligência artificial vão
                  citar quando alguém perguntar sobre aquele vinho.
                </p>

                <h3>Preço em faixa, com data</h3>
                <p>
                  Preço de vinho importado muda toda semana, e ficha com número velho perde a
                  confiança de quem lê. Trabalhamos com faixas, e cada ficha diz quando o
                  preço foi conferido pela última vez.
                </p>

                <h3>Independência</h3>
                <p>
                  As garrafas provadas são compradas ou recebidas como amostra — e quando são
                  amostra, isso não muda a nota nem o texto. Não há publieditorial disfarçado
                  de matéria. Se algum dia houver link de afiliado, ele vem marcado como tal,
                  na própria ficha, sem letra miúda.
                </p>

                <h3>Correções</h3>
                <p>
                  Erro acontece. Quando acontece, a página é corrigida e a data de atualização
                  muda — ela fica visível em todo conteúdo evergreen, justamente para você
                  saber o quanto aquela informação está fresca.
                </p>
              </div>
            </section>

            {/* -------------------------------------------------------------- */}
            {/* A ESCALA CROMÁTICA                                              */}
            {/* -------------------------------------------------------------- */}
            <section id="a-escala" className="mt-20 scroll-mt-32">
              <h2 className="rotulo border-b border-tinta pb-3 !font-semibold">
                A escala cromática
              </h2>
              <div className="prosa mt-8 !max-w-none">
                <p>
                  A cor de um vinho conta muita coisa antes do primeiro gole: a uva, a idade,
                  se passou por madeira, se ficou em contato com as cascas. Por isso a cor
                  virou o sistema de organização deste site. Cada conteúdo carrega uma faixa
                  desta régua, e é possível navegar por ela.
                </p>
              </div>

              <ul className="mt-8">
                {ESCALA_CROMATICA.map((faixa) => (
                  <li
                    key={faixa.id}
                    className="flex items-start gap-4 border-b border-fio py-4"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1 h-8 w-8 flex-none"
                      style={{ backgroundColor: faixa.hex }}
                    />
                    <div className="min-w-0">
                      <p className="font-[family-name:var(--font-display)] text-t4 leading-snug">
                        <Link href={`/vinhos?cor=${faixa.id}`} className="link-titulo">
                          {faixa.nome}
                        </Link>
                      </p>
                      <p className="mt-1 text-apoio leading-relaxed text-grafite bonito">
                        {faixa.descricao}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Credenciais no trilho lateral — o que sustenta a autoridade. */}
          <aside className="col-span-6 lg:col-span-3 lg:col-start-10">
            <div className="space-y-12 lg:sticky lg:top-[calc(var(--altura-cabecalho)+2rem)]">
              {autora?.credenciais && autora.credenciais.length > 0 && (
                <section>
                  <h2 className="rotulo border-b border-tinta pb-3">Formação e trajetória</h2>
                  <ul className="mt-4 space-y-4">
                    {autora.credenciais.map((credencial, indice) => (
                      <li key={credencial.id ?? indice}>
                        <p className="text-apoio leading-snug bonito">
                          {credencial.link ? (
                            <a
                              href={credencial.link}
                              target="_blank"
                              rel="noopener"
                              className="link-titulo"
                            >
                              {credencial.texto}
                            </a>
                          ) : (
                            credencial.texto
                          )}
                        </p>
                        {credencial.ano && (
                          <p className="rotulo mt-1 text-fio-forte">{credencial.ano}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <nav aria-label="Nesta página">
                <h2 className="rotulo border-b border-tinta pb-3">Nesta página</h2>
                <ul className="mt-4 space-y-3">
                  <li>
                    <a href="#como-avaliamos" className="link-titulo text-apoio">
                      Como avaliamos
                    </a>
                  </li>
                  <li>
                    <a href="#a-escala" className="link-titulo text-apoio">
                      A escala cromática
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </aside>
        </div>
      </div>

      <section className="noturno mt-20">
        <div className="caixa py-16 md:py-20">
          <div className="grade items-start">
            <div className="col-span-6 lg:col-span-5">
              <h2
                className="text-t2 tracking-[-0.03em] equilibrado"
                style={{ fontVariationSettings: "'SOFT' 24, 'WONK' 1", fontWeight: 400 }}
              >
                Vamos conversar toda quinta?
              </h2>
            </div>
            <div className="col-span-6 lg:col-span-6 lg:col-start-7">
              <FormularioBoletim origem="sobre" compacto />
            </div>
          </div>
        </div>
      </section>

      <JsonLd
        dados={[
          autora ? schemaDaPessoa(autora, true) : null,
          schemaDeMigalhas(trilha),
        ]}
      />
    </>
  )
}
