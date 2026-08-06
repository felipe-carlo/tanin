import Link from 'next/link'
import type { Metadata } from 'next'

import { Chip } from '@/components/Chip'
import { JsonLd } from '@/components/JsonLd'
import { Migalhas } from '@/components/Migalhas'
import { TIPOS_DE_GUIA } from '@/collections/Guias'
import { dataPorExtenso, iso, plural } from '@/lib/formatar'
import { metadadosDeIndice } from '@/lib/metadados'
import { listarGuias } from '@/lib/consultas'
import { umParametro, type ParametrosDeBusca } from '@/lib/payload'
import { schemaDeLista, schemaDeMigalhas } from '@/lib/schema'

export const revalidate = 1800

const DESCRICAO =
  'Guias da Tanin sobre uvas, regiões, harmonização e serviço. Conteúdo que não vence, escrito para quem quer entender vinho sem virar sommelier.'

type Props = { searchParams: Promise<ParametrosDeBusca> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const parametros = await searchParams
  const tipo = umParametro(parametros.tipo)
  const rotulo = TIPOS_DE_GUIA.find((item) => item.value === tipo)?.label

  return metadadosDeIndice({
    titulo: rotulo ? `Guias de ${rotulo.toLowerCase()}` : 'Guias',
    descricao: DESCRICAO,
    caminho: '/guias',
  })
}

export default async function IndiceDeGuias({ searchParams }: Props) {
  const parametros = await searchParams
  const tipoAtivo = umParametro(parametros.tipo)
  const nivelAtivo = umParametro(parametros.nivel)

  const resultado = await listarGuias({ limite: 100, tipo: tipoAtivo, nivel: nivelAtivo })
  const guias = resultado.docs

  const trilha = [
    { nome: 'Início', endereco: '/' },
    { nome: 'Guias', endereco: '/guias' },
  ]

  // Agrupa por tipo, para que o índice conte a taxonomia em vez de listar tudo em fila.
  const porTipo = TIPOS_DE_GUIA.map((tipo) => ({
    ...tipo,
    guias: guias.filter((guia) => guia.tipoGuia === tipo.value),
  })).filter((grupo) => grupo.guias.length > 0)

  const enderecoDeTipo = (valor?: string): string => {
    const busca = new URLSearchParams()
    if (valor) busca.set('tipo', valor)
    if (nivelAtivo) busca.set('nivel', nivelAtivo)
    const consulta = busca.toString()
    return consulta ? `/guias?${consulta}` : '/guias'
  }

  const enderecoDeNivel = (valor?: string): string => {
    const busca = new URLSearchParams()
    if (tipoAtivo) busca.set('tipo', tipoAtivo)
    if (valor) busca.set('nivel', valor)
    const consulta = busca.toString()
    return consulta ? `/guias?${consulta}` : '/guias'
  }

  return (
    <>
      <div className="caixa pt-8 md:pt-10">
        <Migalhas trilha={trilha} className="mb-8" />

        <header className="grade items-end border-b border-tinta pb-8">
          <div className="col-span-6 lg:col-span-7">
            <h1
              className="text-t1 tracking-[-0.032em]"
              style={{ fontVariationSettings: "'SOFT' 22, 'WONK' 1", fontWeight: 500 }}
            >
              Guias
            </h1>
            <p className="mt-4 max-w-2xl text-corpo-grande leading-snug text-grafite bonito">
              {DESCRICAO}
            </p>
          </div>
          <p className="col-span-6 rotulo text-grafite lg:col-span-3 lg:col-start-10 lg:text-right">
            {plural(resultado.totalDocs, 'guia', 'guias')}
          </p>
        </header>

        <div className="mt-6 flex flex-col gap-4 border-b border-fio pb-6 lg:flex-row lg:items-start lg:justify-between">
          <nav aria-label="Filtrar por tema" className="overflow-x-auto">
            <ul className="flex min-w-max items-center gap-2">
              <li>
                <Link
                  href={enderecoDeNivel(nivelAtivo)}
                  aria-current={!tipoAtivo ? 'page' : undefined}
                  className={`rotulo inline-flex h-11 items-center border px-4 transition-colors ${
                    !tipoAtivo
                      ? 'border-tinta bg-tinta text-papel'
                      : 'border-fio text-grafite hover:border-tinta hover:text-tinta'
                  }`}
                >
                  Todos os temas
                </Link>
              </li>
              {TIPOS_DE_GUIA.map((tipo) => {
                const ativo = tipo.value === tipoAtivo
                return (
                  <li key={tipo.value}>
                    <Link
                      href={enderecoDeTipo(ativo ? undefined : tipo.value)}
                      aria-current={ativo ? 'page' : undefined}
                      className={`rotulo inline-flex h-11 items-center border px-4 transition-colors ${
                        ativo
                          ? 'border-tinta bg-tinta text-papel'
                          : 'border-fio text-grafite hover:border-tinta hover:text-tinta'
                      }`}
                    >
                      {tipo.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <nav aria-label="Filtrar por nível" className="flex items-center gap-4">
            {[
              { valor: undefined, rotulo: 'Todos' },
              { valor: 'iniciante', rotulo: 'Iniciante' },
              { valor: 'intermediario', rotulo: 'Intermediário' },
            ].map((nivel) => (
              <Link
                key={nivel.rotulo}
                href={enderecoDeNivel(nivel.valor)}
                aria-current={nivelAtivo === nivel.valor ? 'true' : undefined}
                className={`rotulo min-h-11 py-3 transition-colors ${
                  nivelAtivo === nivel.valor ? 'text-borra' : 'text-grafite hover:text-tinta'
                }`}
              >
                {nivel.rotulo}
              </Link>
            ))}
          </nav>
        </div>

        {guias.length === 0 ? (
          <p className="py-20 text-corpo-grande text-grafite">
            Nenhum guia com esse recorte ainda.{' '}
            <Link href="/guias" className="text-borra underline">
              Ver todos
            </Link>
            .
          </p>
        ) : (
          <div className="mt-14 space-y-16">
            {porTipo.map((grupo) => (
              <section key={grupo.value} aria-labelledby={`tema-${grupo.value}`}>
                <h2
                  id={`tema-${grupo.value}`}
                  className="rotulo border-b border-tinta pb-3 !font-semibold"
                >
                  {grupo.label}
                </h2>
                <ol className="mt-2">
                  {grupo.guias.map((guia, indice) => (
                    <li key={guia.id}>
                      <article className="group relative flex gap-4 border-b border-fio py-6 md:gap-8">
                        <span aria-hidden="true" className="rotulo w-8 flex-none pt-1 text-fio-forte">
                          {String(indice + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="rotulo flex flex-wrap items-center gap-x-2.5 gap-y-1 text-grafite">
                            <Chip cor={guia.chipCor} tamanho="pequeno" />
                            <span>{guia.nivel === 'iniciante' ? 'Iniciante' : 'Intermediário'}</span>
                            {guia.dataAtualizacao && (
                              <>
                                <span aria-hidden="true" className="text-fio-forte">
                                  ·
                                </span>
                                <span>
                                  Atualizado em{' '}
                                  <time dateTime={iso(guia.dataAtualizacao)}>
                                    {dataPorExtenso(guia.dataAtualizacao)}
                                  </time>
                                </span>
                              </>
                            )}
                          </p>
                          <h3 className="mt-2 text-t3 leading-tight">
                            <Link href={`/guias/${guia.slug}`} className="link-titulo">
                              <span className="absolute inset-0" aria-hidden="true" />
                              {guia.titulo}
                            </Link>
                          </h3>
                          {guia.resumo && (
                            <p className="mt-2 max-w-prose text-apoio leading-relaxed text-grafite linhas-2 bonito">
                              {guia.resumo}
                            </p>
                          )}
                        </div>
                      </article>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        )}
      </div>

      <JsonLd
        dados={[
          schemaDeMigalhas(trilha),
          schemaDeLista(
            'Guias da Tanin',
            guias.map((guia) => ({ nome: guia.titulo, endereco: `/guias/${guia.slug}` })),
            DESCRICAO,
          ),
        ]}
      />
    </>
  )
}
