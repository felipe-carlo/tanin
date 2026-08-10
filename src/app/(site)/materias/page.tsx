import Link from 'next/link'
import type { Metadata } from 'next'

import { CartaoMateria } from '@/components/CartaoMateria'
import { JsonLd } from '@/components/JsonLd'
import { Migalhas } from '@/components/Migalhas'
import { Paginacao } from '@/components/Paginacao'
import { metadadosDeIndice } from '@/lib/metadados'
import { listarTextos } from '@/lib/consultas'
import { umParametro, type ParametrosDeBusca } from '@/lib/payload'
import { schemaDeLista, schemaDeMigalhas } from '@/lib/schema'

export const revalidate = 1800

const DESCRICAO =
  'Tudo o que a Tanin já publicou sobre vinho — escrito para quem bebe, não para quem vende.'

type Props = { searchParams: Promise<ParametrosDeBusca> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const parametros = await searchParams
  const pagina = Number(umParametro(parametros.pagina) ?? 1)

  const base = metadadosDeIndice({
    titulo: 'Textos',
    descricao: DESCRICAO,
    caminho: '/materias',
  })

  // Página 2 em diante não compete com a primeira no índice do buscador.
  if (pagina > 1) return { ...base, robots: { index: false, follow: true } }
  return base
}

/**
 * O arquivo: tudo em ordem de publicação, sem filtro.
 *
 * Havia aqui uma barra de editorias. Ela saiu junto com o campo — um filtro com um
 * recorte só não filtra nada, apenas ocupa a primeira dobra da página com uma promessa
 * de organização que não existe. Quem procura assunto usa a busca, que desde o motor
 * editorial procura no texto inteiro.
 */
export default async function IndiceDeTextos({ searchParams }: Props) {
  const parametros = await searchParams
  const pagina = Math.max(1, Number(umParametro(parametros.pagina) ?? 1) || 1)

  const resultado = await listarTextos({ limite: 13, pagina })

  const [primeiro, ...demais] = resultado.docs
  const trilha = [
    { nome: 'Início', endereco: '/' },
    { nome: 'Textos', endereco: '/materias' },
  ]

  return (
    <>
      <div className="caixa pt-8 md:pt-10">
        <Migalhas trilha={trilha} className="mb-8" />

        <header className="grade items-baseline border-b border-tinta pb-8">
          <h1
            className="col-span-6 text-t1 tracking-[-0.032em] lg:col-span-5"
            style={{ fontVariationSettings: "'SOFT' 22, 'WONK' 1", fontWeight: 500 }}
          >
            Textos
          </h1>
          <p className="col-span-6 mt-3 text-apoio leading-relaxed text-grafite lg:col-span-5 lg:col-start-8 lg:mt-0 bonito">
            {DESCRICAO}
          </p>
        </header>

        {resultado.docs.length === 0 ? (
          <p className="py-20 text-corpo-grande text-grafite">
            Nada publicado ainda.{' '}
            <Link href="/" className="text-borra underline">
              Voltar ao início
            </Link>
            .
          </p>
        ) : (
          <>
            {/* O primeiro texto da página vem grande — a lista tem hierarquia,
                não é uma fileira de itens iguais. */}
            {primeiro && pagina === 1 && (
              <div className="mt-12 border-b border-tinta pb-12">
                <div className="grade">
                  <div className="col-span-6 lg:col-span-7">
                    <CartaoMateria conteudo={primeiro} tamanho="grande" prioridade nivel={2} />
                  </div>
                </div>
              </div>
            )}

            <div className="grade mt-12">
              {(pagina === 1 ? demais : resultado.docs).map((texto) => (
                <div key={texto.id} className="revelar-ao-rolar col-span-6 lg:col-span-4">
                  <CartaoMateria conteudo={texto} tamanho="medio" nivel={2} />
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
            'Textos da Tanin',
            resultado.docs.map((texto) => ({
              nome: texto.titulo,
              endereco: `/materias/${texto.slug}`,
            })),
            DESCRICAO,
          ),
        ]}
      />
    </>
  )
}
