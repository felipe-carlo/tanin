import Link from 'next/link'
import type { Metadata } from 'next'

import { JsonLd } from '@/components/JsonLd'
import { Migalhas } from '@/components/Migalhas'
import { TituloDeSecao } from '@/components/Secao'
import { listarEventos } from '@/lib/consultas'
import { dataCurta, dataMesEAno, horaDe, iso } from '@/lib/formatar'
import { metadadosDeIndice } from '@/lib/metadados'
import { schemaDeMigalhas, schemaDoEvento } from '@/lib/schema'
import type { Evento } from '@/payload-types'

// Meia hora: a agenda muda pouco, mas um evento que já passou não pode ficar de pé.
export const revalidate = 1800

const DESCRICAO =
  'Degustações, feiras, jantares harmonizados, cursos e lançamentos de vinho no Brasil — o que vale sair de casa, mês a mês.'

export const metadata: Metadata = metadadosDeIndice({
  titulo: 'Agenda',
  descricao: DESCRICAO,
  caminho: '/agenda',
})

/**
 * Os rótulos vivem aqui, e não em `collections/Eventos`, para que a página não
 * arraste a configuração do CMS (e o editor de texto rico junto) só para escrever
 * uma palavra. O tipo abaixo garante que um tipo novo no painel quebre a compilação.
 */
const NOMES_DE_TIPO: Record<Evento['tipo'], string> = {
  degustacao: 'Degustação',
  feira: 'Feira',
  jantar: 'Jantar harmonizado',
  curso: 'Curso',
  lancamento: 'Lançamento',
  online: 'Online',
}

const TRILHA = [
  { nome: 'Início', endereco: '/' },
  { nome: 'Agenda', endereco: '/agenda' },
]

/** O dia sai da data curta (12/03/2026) para herdar o fuso de São Paulo. */
const diaDoMes = (valor?: string | null): string => dataCurta(valor).slice(0, 2)

/** O `@context` vive uma vez só, no topo do ItemList. */
const semContexto = (bloco: Record<string, unknown>): Record<string, unknown> => {
  const copia = { ...bloco }
  delete copia['@context']
  return copia
}

/** Agrupa por mês confiando na ordem cronológica que `listarEventos` já devolve. */
const agruparPorMes = (eventos: Evento[]): { mes: string; eventos: Evento[] }[] =>
  eventos.reduce<{ mes: string; eventos: Evento[] }[]>((grupos, evento) => {
    const mes = dataMesEAno(evento.data)
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.mes === mes) ultimo.eventos.push(evento)
    else grupos.push({ mes, eventos: [evento] })
    return grupos
  }, [])

export default async function Agenda() {
  const eventos = await listarEventos({ futuros: true })
  const meses = agruparPorMes(eventos)

  return (
    <>
      <div className="caixa pb-24 pt-8 md:pt-10">
        <Migalhas trilha={TRILHA} className="mb-8" />

        <header className="grade items-baseline border-b border-tinta pb-8">
          <h1
            className="col-span-6 text-t1 tracking-[-0.032em] lg:col-span-5"
            style={{ fontVariationSettings: "'SOFT' 22, 'WONK' 1", fontWeight: 500 }}
          >
            Agenda
          </h1>
          <p className="col-span-6 mt-3 text-apoio leading-relaxed text-grafite lg:col-span-5 lg:col-start-8 lg:mt-0 bonito">
            {DESCRICAO} Cada evento sai daqui sozinho no fim do dia em que acontece.
          </p>
        </header>

        {meses.length === 0 ? (
          <div className="max-w-lg py-20">
            <h2 className="text-t2 equilibrado">A agenda está entre duas safras.</h2>
            <p className="mt-5 text-corpo leading-relaxed text-grafite bonito">
              Nada marcado por enquanto. Assim que aparecer degustação, feira ou jantar que
              justifique a viagem, ele entra aqui — e sai antes no Boletim, para quem quiser
              chegar na frente.
            </p>
            <Link href="/boletim#assinar" className="botao mt-8 min-h-11">
              Receber o Boletim
            </Link>
          </div>
        ) : (
          meses.map(({ mes, eventos: doMes }) => (
            <section key={mes} className="mt-16" aria-label={mes}>
              <TituloDeSecao>{mes}</TituloDeSecao>
              <ul>
                {doMes.map((evento) => (
                  <li key={evento.id}>
                    <LinhaDeEvento evento={evento} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      {eventos.length > 0 && (
        <JsonLd
          dados={[
            schemaDeMigalhas(TRILHA),
            {
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: 'Agenda de vinho da Tanin',
              description: DESCRICAO,
              numberOfItems: eventos.length,
              itemListOrder: 'https://schema.org/ItemListOrderAscending',
              itemListElement: eventos.map((evento, indice) => ({
                '@type': 'ListItem',
                position: indice + 1,
                item: semContexto(schemaDoEvento(evento)),
              })),
            },
          ]}
        />
      )}
    </>
  )
}

function LinhaDeEvento({ evento }: { evento: Evento }) {
  const hora = horaDe(evento.data)
  const onde = [evento.local, [evento.cidade, evento.estado].filter(Boolean).join('/')].filter(
    Boolean,
  )
  const detalhes = [NOMES_DE_TIPO[evento.tipo], ...onde].join(' · ')

  return (
    <article className="grid grid-cols-[3rem_1fr] gap-x-5 border-t border-fio py-7 md:grid-cols-[6rem_1fr] md:gap-x-8">
      <div>
        <time dateTime={iso(evento.data)} className="cartaz block text-t1 text-borra">
          {diaDoMes(evento.data)}
        </time>
        {hora && <span className="rotulo mt-1 block text-grafite">{hora}</span>}
      </div>

      <div className="min-w-0">
        <h3 className="text-t3 leading-tight equilibrado">{evento.nome}</h3>

        <p className="rotulo mt-2.5 text-grafite">{detalhes}</p>

        <p className="mt-3 max-w-prose text-apoio leading-relaxed text-grafite linhas-2 bonito">
          {evento.descricao}
        </p>

        {(evento.preco || evento.organizador) && (
          <p className="rotulo mt-3 text-grafite/75">
            {[evento.preco, evento.organizador].filter(Boolean).join(' · ')}
          </p>
        )}

        {evento.linkInscricao && (
          <a
            href={evento.linkInscricao}
            target="_blank"
            rel="noopener"
            className="botao mt-5 min-h-11 px-5 py-2.5"
          >
            Inscrições
            <span aria-hidden="true">→</span>
            <span className="apenas-leitor">para {evento.nome}</span>
          </a>
        )}
      </div>
    </article>
  )
}
