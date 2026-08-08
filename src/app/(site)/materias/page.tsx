import Link from 'next/link'
import type { Metadata } from 'next'

import { CartaoMateria } from '@/components/CartaoMateria'
import { Chip } from '@/components/Chip'
import { JsonLd } from '@/components/JsonLd'
import { Migalhas } from '@/components/Migalhas'
import { Paginacao } from '@/components/Paginacao'
import { metadadosDeIndice } from '@/lib/metadados'
import { CATEGORIAS_DE_MATERIA, categoriaPorValor } from '@/lib/categorias'
import { listarTextos } from '@/lib/consultas'
import { umParametro, type ParametrosDeBusca } from '@/lib/payload'
import { schemaDeLista, schemaDeMigalhas } from '@/lib/schema'

export const revalidate = 1800

const DESCRICAO =
  'Reportagens, ensaios e entrevistas sobre vinho — escritos para quem bebe, não para quem vende.'

type Props = { searchParams: Promise<ParametrosDeBusca> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const parametros = await searchParams
  const categoria = umParametro(parametros.categoria)
  const pagina = Number(umParametro(parametros.pagina) ?? 1)

  const base = metadadosDeIndice({
    titulo: categoria ? `Matérias sobre ${categoria}` : 'Matérias',
    descricao: DESCRICAO,
    caminho: '/materias',
  })

  // Página 2 em diante não compete com a primeira no índice do buscador.
  if (pagina > 1) return { ...base, robots: { index: false, follow: true } }
  return base
}

export default async function IndiceDeMaterias({ searchParams }: Props) {
  const parametros = await searchParams
  const categoriaAtiva = umParametro(parametros.categoria)
  const pagina = Math.max(1, Number(umParametro(parametros.pagina) ?? 1) || 1)

  const resultado = await listarTextos({
    secao: 'materia',
    limite: 13,
    pagina,
    categoria: categoriaAtiva,
  })

  const [primeira, ...demais] = resultado.docs
  const trilha = [
    { nome: 'Início', endereco: '/' },
    { nome: 'Matérias', endereco: '/materias' },
  ]

  const filtroAtivo = categoriaPorValor(categoriaAtiva)

  return (
    <>
      <div className="caixa pt-8 md:pt-10">
        <Migalhas trilha={trilha} className="mb-8" />

        <header className="grade items-baseline border-b border-tinta pb-8">
          <h1
            className="col-span-6 text-t1 tracking-[-0.032em] lg:col-span-5"
            style={{ fontVariationSettings: "'SOFT' 22, 'WONK' 1", fontWeight: 500 }}
          >
            {filtroAtivo ? filtroAtivo.label : 'Matérias'}
          </h1>
          <p className="col-span-6 mt-3 text-apoio leading-relaxed text-grafite lg:col-span-5 lg:col-start-8 lg:mt-0 bonito">
            {filtroAtivo?.descricao ?? DESCRICAO}
          </p>
        </header>

        {/* Filtro de categoria em links de verdade: cada recorte tem endereço próprio,
            pode ser compartilhado e é rastreável pelo buscador. */}
        <nav aria-label="Filtrar por editoria" className="mt-6 overflow-x-auto">
          <ul className="flex min-w-max items-center gap-2 pb-1">
            <li>
              <Link
                href="/materias"
                aria-current={!categoriaAtiva ? 'page' : undefined}
                className={`rotulo inline-flex h-11 items-center border px-4 transition-colors ${
                  !categoriaAtiva
                    ? 'border-tinta bg-tinta text-papel'
                    : 'border-fio text-grafite hover:border-tinta hover:text-tinta'
                }`}
              >
                Tudo
              </Link>
            </li>
            {CATEGORIAS_DE_MATERIA.map((categoria) => {
              const ativa = categoria.value === categoriaAtiva
              return (
                <li key={categoria.value}>
                  <Link
                    href={`/materias?categoria=${categoria.value}`}
                    aria-current={ativa ? 'page' : undefined}
                    className={`rotulo inline-flex h-11 items-center gap-2 border px-4 transition-colors ${
                      ativa
                        ? 'border-tinta bg-tinta text-papel'
                        : 'border-fio text-grafite hover:border-tinta hover:text-tinta'
                    }`}
                  >
                    <Chip cor={categoria.chipCor} tamanho="pequeno" />
                    {categoria.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {resultado.docs.length === 0 ? (
          <p className="py-20 text-corpo-grande text-grafite">
            Nada por aqui ainda.{' '}
            <Link href="/materias" className="text-borra underline">
              Ver todas as matérias
            </Link>
            .
          </p>
        ) : (
          <>
            {/* A primeira matéria da página vem grande — a lista tem hierarquia,
                não é uma fileira de itens iguais. */}
            {primeira && pagina === 1 && (
              <div className="mt-12 border-b border-tinta pb-12">
                <div className="grade">
                  <div className="col-span-6 lg:col-span-7">
                    <CartaoMateria conteudo={primeira} tamanho="grande" prioridade nivel={2} />
                  </div>
                </div>
              </div>
            )}

            <div className="grade mt-12">
              {(pagina === 1 ? demais : resultado.docs).map((materia) => (
                <div key={materia.id} className="revelar-ao-rolar col-span-6 lg:col-span-4">
                  <CartaoMateria conteudo={materia} tamanho="medio" nivel={2} />
                </div>
              ))}
            </div>
          </>
        )}

        <Paginacao
          paginaAtual={resultado.page ?? 1}
          totalDePaginas={resultado.totalPages ?? 1}
          base="/materias"
          parametros={parametros}
        />
      </div>

      <JsonLd
        dados={[
          schemaDeMigalhas(trilha),
          schemaDeLista(
            'Matérias da Tanin',
            resultado.docs.map((materia) => ({
              nome: materia.titulo,
              endereco: `/materias/${materia.slug}`,
            })),
            DESCRICAO,
          ),
        ]}
      />
    </>
  )
}
