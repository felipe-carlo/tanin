import Link from 'next/link'
import type { Metadata } from 'next'

import { CampoDeBusca } from '@/components/CampoDeBusca'
import { Chip } from '@/components/Chip'
import { Migalhas } from '@/components/Migalhas'
import { TituloDeSecao } from '@/components/Secao'
import { buscar, listarGuias, type ResultadoDeBusca } from '@/lib/consultas'
import { dataPorExtenso, iso, plural } from '@/lib/formatar'
import { umParametro, type ParametrosDeBusca } from '@/lib/payload'
import { URL_SITE } from '@/lib/site'

type Props = { searchParams: Promise<ParametrosDeBusca> }

const DESCRICAO =
  'Procure por uva, região, produtor, prato ou tema em tudo que a Tanin já publicou: matérias, guias, fichas de vinho e o arquivo do Boletim.'

/** A ordem dos grupos é a ordem de utilidade, não a do banco. */
const GRUPOS: { tipo: ResultadoDeBusca['tipo']; titulo: string }[] = [
  { tipo: 'materia', titulo: 'Matérias' },
  { tipo: 'guia', titulo: 'Guias' },
  { tipo: 'vinho', titulo: 'Fichas de vinho' },
  { tipo: 'edicao', titulo: 'Boletim' },
]

const SECOES = [
  { rotulo: 'Matérias', endereco: '/materias', nota: 'Reportagens, ensaios e entrevistas' },
  { rotulo: 'Guias', endereco: '/guias', nota: 'Uvas, regiões, harmonização e serviço' },
  { rotulo: 'Vinhos', endereco: '/vinhos', nota: 'Fichas com nota, preço e onde comprar' },
  { rotulo: 'Boletim', endereco: '/boletim', nota: 'O arquivo de todas as edições' },
  { rotulo: 'Agenda', endereco: '/agenda', nota: 'Degustações, feiras e cursos' },
]

/** Rede de segurança para quando ainda não há guias publicados. */
const TERMOS_SUGERIDOS = ['Malbec', 'Vinho verde', 'Harmonização', 'Champagne', 'Portugal', 'Rosé']

const TRILHA = [
  { nome: 'Início', endereco: '/' },
  { nome: 'Busca', endereco: '/busca' },
]

const lerTermo = (parametros: ParametrosDeBusca): string =>
  (umParametro(parametros.q) ?? '').trim().slice(0, 120)

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const termo = lerTermo(await searchParams)
  const canonica = `${URL_SITE}/busca`

  if (!termo) {
    return {
      title: 'Busca',
      description: DESCRICAO,
      alternates: { canonical: canonica },
      robots: { index: true, follow: true },
    }
  }

  return {
    title: `Busca por “${termo}”`,
    description: `O que a Tanin já publicou sobre “${termo}”.`,
    alternates: { canonical: canonica },
    // A página de resultado não disputa o índice com o conteúdo que ela lista —
    // quem procura no Google tem que cair na matéria, nunca na busca do site.
    robots: { index: false, follow: true },
  }
}

export default async function PaginaDeBusca({ searchParams }: Props) {
  const termo = lerTermo(await searchParams)

  if (!termo) return <BuscaEmBranco />

  // Uma letra só devolveria meio acervo; `buscar` já ignora, aqui a gente explica.
  const curto = termo.length < 2
  const resultados = curto ? [] : await buscar(termo)

  return (
    <div className="caixa pb-24 pt-8 md:pt-10">
      <Migalhas trilha={TRILHA} className="mb-8" />

      <header className="border-b border-tinta pb-8">
        <p className="rotulo text-grafite">
          {resultados.length > 0
            ? plural(resultados.length, 'resultado', 'resultados')
            : 'Nenhum resultado'}
        </p>
        <h1
          className="mt-3 max-w-3xl text-t1 tracking-[-0.032em] equilibrado"
          style={{ fontVariationSettings: "'SOFT' 22, 'WONK' 1", fontWeight: 500 }}
        >
          <span className="apenas-leitor">Resultados da busca por </span>“{termo}”
        </h1>
        <div className="mt-8 max-w-2xl">
          <CampoDeBusca valorInicial={termo} />
        </div>
      </header>

      {resultados.length > 0 ? (
        <div className="grade mt-14">
          <div className="col-span-6 lg:col-span-8">
            {GRUPOS.map(({ tipo, titulo }) => {
              const doGrupo = resultados.filter((resultado) => resultado.tipo === tipo)
              if (doGrupo.length === 0) return null

              return (
                <section key={tipo} className="mb-14 last:mb-0" aria-label={titulo}>
                  <TituloDeSecao>
                    {titulo} · {doGrupo.length}
                  </TituloDeSecao>
                  <ul>
                    {doGrupo.map((resultado) => (
                      <li key={`${resultado.tipo}-${resultado.id}`}>
                        <LinhaDeResultado resultado={resultado} />
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>

          <aside className="col-span-6 lg:col-span-3 lg:col-start-10">
            <h2 className="rotulo border-b border-tinta pb-3">Seções</h2>
            <ListaDeSecoes />
          </aside>
        </div>
      ) : (
        <div className="mt-14 max-w-2xl">
          <h2 className="text-t2 equilibrado">
            {curto ? 'Falta uma letra.' : 'Não achamos nada com essa palavra.'}
          </h2>
          <p className="mt-5 text-corpo leading-relaxed text-grafite bonito">
            {curto
              ? 'A busca precisa de pelo menos duas letras para não devolver o acervo inteiro.'
              : 'A busca procura o texto exato no título, no resumo e no veredito das fichas. Tente uma palavra só — “malbec” no lugar de “vinho malbec argentino” —, procure pelo produtor ou pela região, e confira o acento.'}
          </p>

          <h3 className="rotulo mt-12 border-b border-tinta pb-3">Ou tente por aqui</h3>
          <ListaDeSecoes />
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Peças da página                                                             */
/* -------------------------------------------------------------------------- */

async function BuscaEmBranco() {
  const guias = await listarGuias({ limite: 6 })

  return (
    <div className="caixa pb-24 pt-8 md:pt-10">
      <Migalhas trilha={TRILHA} className="mb-14" />

      <div className="mx-auto max-w-2xl text-center">
        <h1
          className="text-t1 tracking-[-0.032em] equilibrado"
          style={{ fontVariationSettings: "'SOFT' 22, 'WONK' 1", fontWeight: 500 }}
        >
          O que você quer descobrir?
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-corpo-grande leading-snug text-grafite bonito">
          {DESCRICAO}
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-2xl text-left">
        <CampoDeBusca autoFoco grande />
      </div>

      <div className="grade mt-20 border-t border-tinta pt-10">
        <section className="col-span-6 lg:col-span-5">
          <h2 className="rotulo text-grafite">Percorrer o portal</h2>
          <ListaDeSecoes />
        </section>

        <section className="col-span-6 lg:col-span-6 lg:col-start-7">
          <h2 className="rotulo text-grafite">
            {guias.docs.length > 0 ? 'Começar por um guia' : 'Buscas para começar'}
          </h2>

          {guias.docs.length > 0 ? (
            <ul className="mt-2">
              {guias.docs.map((guia) => (
                <li key={guia.id} className="border-b border-fio">
                  <Link
                    href={`/guias/${guia.slug}`}
                    className="group flex min-h-11 items-center gap-3 py-3.5"
                  >
                    <Chip cor={guia.chipCor} tamanho="pequeno" />
                    <span className="link-titulo text-apoio leading-snug">{guia.titulo}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-5 flex flex-wrap gap-2">
              {TERMOS_SUGERIDOS.map((termo) => (
                <li key={termo}>
                  <Link
                    href={`/busca?q=${encodeURIComponent(termo)}`}
                    className="rotulo inline-flex min-h-11 items-center border border-fio px-4 text-grafite transition-colors hover:border-tinta hover:text-tinta"
                  >
                    {termo}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function ListaDeSecoes() {
  return (
    <ul className="mt-2">
      {SECOES.map((secao) => (
        <li key={secao.endereco} className="border-b border-fio">
          <Link
            href={secao.endereco}
            className="group flex min-h-11 items-baseline justify-between gap-4 py-3.5"
          >
            <span className="rotulo transition-colors group-hover:text-borra">{secao.rotulo}</span>
            <span className="text-miudo text-grafite">{secao.nota}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function LinhaDeResultado({ resultado }: { resultado: ResultadoDeBusca }) {
  return (
    <article className="group relative border-t border-fio py-5">
      <p className="rotulo flex flex-wrap items-center gap-x-2.5 gap-y-1 text-grafite">
        <Chip cor={resultado.chipCor} tamanho="pequeno" />
        {resultado.data && (
          <time dateTime={iso(resultado.data)}>{dataPorExtenso(resultado.data)}</time>
        )}
      </p>

      <h3 className="mt-2 text-t4 leading-tight">
        <Link href={resultado.endereco} className="link-titulo">
          <span className="absolute inset-0" aria-hidden="true" />
          {resultado.titulo}
        </Link>
      </h3>

      {resultado.resumo && (
        <p className="mt-2 max-w-prose text-apoio leading-relaxed text-grafite linhas-2 bonito">
          {resultado.resumo}
        </p>
      )}
    </article>
  )
}
