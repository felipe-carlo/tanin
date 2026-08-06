import Link from 'next/link'
import type { Metadata } from 'next'

import { CartaoVinhoLinha } from '@/components/CartaoVinho'
import { FiltrosAtivos, FiltrosDeVinho } from '@/components/FiltrosDeVinho'
import { JsonLd } from '@/components/JsonLd'
import { Migalhas } from '@/components/Migalhas'
import { Paginacao } from '@/components/Paginacao'
import { ESCALA_CROMATICA, faixaPorId } from '@/lib/escala-cores'
import { plural } from '@/lib/formatar'
import { metadadosDeIndice } from '@/lib/metadados'
import { listarVinhos, opcoesDeFiltroDeVinho } from '@/lib/consultas'
import { listaDeParametros, umParametro, type ParametrosDeBusca } from '@/lib/payload'
import { schemaDeLista, schemaDeMigalhas } from '@/lib/schema'
import { NOTA_MAXIMA } from '@/lib/nota'
import { nomeCompleto, rotuloPreco, rotuloTipo } from '@/lib/vinho'

export const revalidate = 1800

const DESCRICAO =
  'Fichas de vinho da Tanin: o que provamos, o que achamos e quanto custa. Filtre por tipo, cor na taça, país, uva e faixa de preço.'

type Props = { searchParams: Promise<ParametrosDeBusca> }

const contarFiltros = (parametros: ParametrosDeBusca): number =>
  ['tipo', 'pais', 'uva', 'preco', 'cor', 'corpo'].reduce(
    (total, chave) => total + listaDeParametros(parametros[chave]).length,
    0,
  )

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const parametros = await searchParams
  const quantidade = contarFiltros(parametros)
  const tipo = listaDeParametros(parametros.tipo)[0]
  const pais = listaDeParametros(parametros.pais)[0]
  const cor = listaDeParametros(parametros.cor)[0]

  let titulo = 'Fichas de vinho'
  if (quantidade === 1) {
    if (tipo) titulo = `Vinhos ${rotuloTipo(tipo)?.toLowerCase()}`
    else if (pais) titulo = `Vinhos de ${pais}`
    else if (cor) titulo = `Vinhos cor ${faixaPorId(cor).nome.toLowerCase()}`
  }

  const base = metadadosDeIndice({ titulo, descricao: DESCRICAO, caminho: '/vinhos' })

  // Um recorte só (todos os tintos, todos os de Portugal) é uma página útil e merece
  // estar no índice. Combinações de dois ou mais filtros geram milhares de variações
  // quase idênticas — isso é lixo de índice, e pedimos para não indexar.
  if (quantidade > 1 || Number(umParametro(parametros.pagina) ?? 1) > 1) {
    return { ...base, robots: { index: false, follow: true } }
  }
  return base
}

export default async function IndiceDeVinhos({ searchParams }: Props) {
  const parametros = await searchParams
  const pagina = Math.max(1, Number(umParametro(parametros.pagina) ?? 1) || 1)
  const ordem = (umParametro(parametros.ordem) ?? 'recentes') as 'recentes' | 'nota' | 'nome'

  const [resultado, opcoes] = await Promise.all([
    listarVinhos({
      tipo: listaDeParametros(parametros.tipo),
      pais: listaDeParametros(parametros.pais),
      uva: listaDeParametros(parametros.uva),
      preco: listaDeParametros(parametros.preco),
      cor: listaDeParametros(parametros.cor),
      corpo: listaDeParametros(parametros.corpo),
      ordem,
      pagina,
      limite: 20,
    }),
    opcoesDeFiltroDeVinho(),
  ])

  const trilha = [
    { nome: 'Início', endereco: '/' },
    { nome: 'Vinhos', endereco: '/vinhos' },
  ]

  const enderecoDeOrdem = (valor: string): string => {
    const busca = new URLSearchParams()
    Object.entries(parametros).forEach(([chave, bruto]) => {
      if (chave === 'ordem' || chave === 'pagina' || bruto === undefined) return
      const lista = Array.isArray(bruto) ? bruto : [bruto]
      lista.flatMap((item) => item.split(',')).filter(Boolean).forEach((item) => busca.append(chave, item))
    })
    if (valor !== 'recentes') busca.set('ordem', valor)
    const consulta = busca.toString()
    return consulta ? `/vinhos?${consulta}` : '/vinhos'
  }

  const ORDENACOES = [
    { valor: 'recentes', rotulo: 'Mais recentes' },
    { valor: 'nota', rotulo: 'Melhor nota' },
    { valor: 'nome', rotulo: 'A a Z' },
  ]

  return (
    <>
      <div className="caixa pt-8 md:pt-10">
        <Migalhas trilha={trilha} className="mb-8" />

        <header className="grade items-end border-b border-tinta pb-8">
          <div className="col-span-6 lg:col-span-6">
            <h1
              className="text-t1 tracking-[-0.032em]"
              style={{ fontVariationSettings: "'SOFT' 22, 'WONK' 1", fontWeight: 500 }}
            >
              Fichas de vinho
            </h1>
            <p className="mt-4 max-w-xl text-apoio leading-relaxed text-grafite bonito">
              {DESCRICAO}
            </p>
          </div>

          <div className="col-span-6 lg:col-span-5 lg:col-start-8">
            <p className="rotulo text-grafite">Como lemos a nota</p>
            <p className="mt-2 text-apoio leading-relaxed text-grafite bonito">
              De 1 a {NOTA_MAXIMA} taças, com meias taças. Cada ficha traz um veredito em
              duas ou três frases — é o que responde se a garrafa vale o dinheiro.
            </p>
          </div>
        </header>

        {/* Régua cromática como navegação: clicar numa faixa filtra por aquela cor. */}
        <nav aria-label="Filtrar por cor na taça" className="mt-8">
          <ol className="flex h-10 w-full border border-tinta md:h-12">
            {ESCALA_CROMATICA.map((faixa) => {
              const disponivel = opcoes.cores.includes(faixa.id)
              return (
                <li key={faixa.id} className="min-w-0 flex-1 border-r border-papel/30 last:border-r-0">
                  {disponivel ? (
                    <Link
                      href={`/vinhos?cor=${faixa.id}`}
                      className="block h-full w-full transition-[filter] duration-300 hover:brightness-90"
                      style={{ backgroundColor: faixa.hex }}
                      title={`${faixa.nome} — ${faixa.descricao}`}
                    >
                      <span className="apenas-leitor">Ver vinhos de cor {faixa.nome}</span>
                    </Link>
                  ) : (
                    <span
                      className="block h-full w-full"
                      style={{ backgroundColor: faixa.hex, filter: 'saturate(0.2) opacity(0.35)' }}
                      title={`${faixa.nome} — nenhuma ficha ainda`}
                      aria-hidden="true"
                    />
                  )}
                </li>
              )
            })}
          </ol>
        </nav>

        <div className="grade mt-10">
          {/* Filtros. No celular vira um acordeão fechado; no computador, trilho fixo. */}
          <aside className="col-span-6 lg:col-span-3">
            <details className="lg:hidden" name="painel-vinhos">
              <summary className="botao botao--vazado w-full cursor-pointer list-none justify-between [&::-webkit-details-marker]:hidden">
                Filtrar
                <span aria-hidden="true">＋</span>
              </summary>
              <div className="mt-4">
                <FiltrosDeVinho parametros={parametros} opcoes={opcoes} />
              </div>
            </details>

            <div className="hidden lg:block lg:sticky lg:top-[calc(var(--altura-cabecalho)+2rem)]">
              <h2 className="rotulo border-b border-tinta pb-3">Filtrar</h2>
              <FiltrosDeVinho parametros={parametros} opcoes={opcoes} />
            </div>
          </aside>

          <div className="col-span-6 lg:col-span-8 lg:col-start-5">
            <div className="flex flex-col gap-4 border-b border-tinta pb-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="rotulo text-grafite">
                {plural(resultado.totalDocs, 'ficha', 'fichas')}
              </p>
              <nav aria-label="Ordenar" className="flex flex-wrap items-center gap-x-4">
                {ORDENACOES.map((opcao) => (
                  <Link
                    key={opcao.valor}
                    href={enderecoDeOrdem(opcao.valor)}
                    scroll={false}
                    aria-current={ordem === opcao.valor ? 'true' : undefined}
                    className={`rotulo min-h-11 py-3 transition-colors ${
                      ordem === opcao.valor ? 'text-borra' : 'text-grafite hover:text-tinta'
                    }`}
                  >
                    {opcao.rotulo}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-5">
              <FiltrosAtivos parametros={parametros} />
            </div>

            {resultado.docs.length === 0 ? (
              <div className="py-20">
                <p className="text-corpo-grande text-grafite bonito">
                  Nenhuma ficha com essa combinação de filtros.
                </p>
                <Link href="/vinhos" className="botao mt-6 inline-flex">
                  Ver todas as fichas
                </Link>
              </div>
            ) : (
              <div className="mt-6">
                {resultado.docs.map((vinho) => (
                  <CartaoVinhoLinha key={vinho.id} vinho={vinho} />
                ))}
              </div>
            )}

            <Paginacao
              paginaAtual={resultado.page ?? 1}
              totalDePaginas={resultado.totalPages ?? 1}
              base="/vinhos"
              parametros={parametros}
            />
          </div>
        </div>
      </div>

      <JsonLd
        dados={[
          schemaDeMigalhas(trilha),
          schemaDeLista(
            'Fichas de vinho da Tanin',
            resultado.docs.map((vinho) => ({
              nome: `${nomeCompleto(vinho)}${vinho.faixaPreco ? ` — ${rotuloPreco(vinho.faixaPreco)}` : ''}`,
              endereco: `/vinhos/${vinho.slug}`,
            })),
            DESCRICAO,
          ),
        ]}
      />
    </>
  )
}
