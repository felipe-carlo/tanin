import Link from 'next/link'
import type { Metadata } from 'next'

import { FitaCromatica, LinhaEdicao } from '@/components/FitaCromatica'
import { FormularioBoletim } from '@/components/FormularioBoletim'
import { JsonLd } from '@/components/JsonLd'
import { Migalhas } from '@/components/Migalhas'
import { TituloDeSecao } from '@/components/Secao'
import { ESCALA_CROMATICA } from '@/lib/escala-cores'
import { dataPorExtenso } from '@/lib/formatar'
import { metadadosDeIndice } from '@/lib/metadados'
import { listarEdicoes } from '@/lib/consultas'
import { schemaDaEdicao, schemaDeMigalhas, schemaDoPeriodico } from '@/lib/schema'
import { obterConfiguracoes } from '@/lib/site'

export const revalidate = 1800

const DESCRICAO =
  'O arquivo completo do Boletim Tanin: uma carta semanal sobre vinho, aberta e sem paywall. Cada edição tem página própria e endereço permanente.'

export const metadata: Metadata = metadadosDeIndice({
  titulo: 'Boletim Tanin',
  descricao: DESCRICAO,
  caminho: '/boletim',
})

export default async function HubDoBoletim() {
  const [config, arquivo] = await Promise.all([
    obterConfiguracoes(),
    listarEdicoes({ limite: 300, ordem: 'asc' }),
  ])

  const edicoes = arquivo.docs
  const maisRecentes = [...edicoes].reverse()
  const ultima = maisRecentes[0]

  const trilha = [
    { nome: 'Início', endereco: '/' },
    { nome: 'Boletim', endereco: '/boletim' },
  ]

  return (
    <>
      <div className="caixa pt-8 md:pt-10">
        <Migalhas trilha={trilha} className="mb-8" />

        <header className="grade items-end border-b border-tinta pb-10">
          <div className="col-span-6 lg:col-span-7">
            <p className="rotulo text-borra">
              {config.boletimPeriodicidade ?? 'Semanal, às quintas'}
            </p>
            <h1
              className="mt-4 text-manchete tracking-[-0.035em] equilibrado"
              style={{ fontVariationSettings: "'SOFT' 24, 'WONK' 1", fontWeight: 500 }}
            >
              {config.boletimTitulo ?? 'Boletim Tanin'}
            </h1>
            <p className="mt-6 max-w-2xl text-corpo-grande leading-snug text-grafite bonito">
              {config.boletimChamada ?? DESCRICAO}
            </p>
          </div>

          <div className="col-span-6 lg:col-span-4 lg:col-start-9">
            <dl className="grid grid-cols-2 gap-6">
              <div>
                <dt className="rotulo text-grafite">Edições</dt>
                <dd className="cartaz !text-[3rem] !leading-none mt-1">{arquivo.totalDocs}</dd>
              </div>
              <div>
                <dt className="rotulo text-grafite">Última</dt>
                <dd className="mt-2 text-apoio leading-snug">
                  {ultima ? dataPorExtenso(ultima.dataEnvio) : '—'}
                </dd>
              </div>
            </dl>
          </div>
        </header>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* A FITA CROMÁTICA                                                    */}
      {/* ------------------------------------------------------------------ */}
      {edicoes.length > 0 && (
        <section className="mt-12" aria-labelledby="fita">
          <div className="caixa">
            <h2 id="fita" className="rotulo border-b border-tinta pb-3">
              O arquivo em cores
            </h2>
            <p className="mt-4 max-w-2xl text-apoio leading-relaxed text-grafite bonito">
              Cada edição carrega uma faixa da escala cromática do vinho — do quase
              transparente do Vinho Verde ao tijolo de um Porto envelhecido. A fita cresce
              toda semana. Toque ou passe o cursor em qualquer faixa para ver o que tem
              dentro dela.
            </p>
          </div>

          <div className="mt-8">
            <FitaCromatica edicoes={edicoes} altura="alta" />
          </div>

          {/* Legenda da escala — a régua explicada, à maneira do Wine Folly. */}
          <div className="caixa mt-5">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {ESCALA_CROMATICA.map((faixa) => (
                <li key={faixa.id} className="flex items-center gap-2">
                  <span
                    className="chip"
                    style={{ backgroundColor: faixa.hex }}
                    aria-hidden="true"
                  />
                  <span className="rotulo text-grafite">{faixa.nome}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* INSCRIÇÃO                                                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="noturno mt-16" id="assinar">
        <div className="caixa py-16 md:py-24">
          <div className="grade items-start">
            <div className="col-span-6 lg:col-span-5">
              <h2
                className="text-t1 tracking-[-0.03em] equilibrado"
                style={{ fontVariationSettings: "'SOFT' 24, 'WONK' 1", fontWeight: 400 }}
              >
                Receba a próxima
              </h2>
              <p className="mt-5 max-w-md text-apoio leading-relaxed opacity-85 bonito">
                Tudo que sai no Boletim continua aqui, aberto e de graça. O e-mail é só a
                forma mais confortável de não perder.
              </p>
            </div>
            <div className="col-span-6 lg:col-span-6 lg:col-start-7">
              <FormularioBoletim origem="boletim" rotuloBotao="Quero receber" />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* ARQUIVO EM LISTA                                                    */}
      {/* ------------------------------------------------------------------ */}
      <section className="caixa mt-16">
        <TituloDeSecao>Todas as edições</TituloDeSecao>
        {maisRecentes.length === 0 ? (
          <p className="py-16 text-corpo-grande text-grafite">
            A primeira edição aparece aqui assim que for publicada.
          </p>
        ) : (
          <div>
            {maisRecentes.map((edicao) => (
              <LinhaEdicao key={edicao.id} edicao={edicao} />
            ))}
          </div>
        )}
        <p className="rotulo mt-10 text-grafite">
          Prefere ler por RSS?{' '}
          <Link href="/rss.xml" className="text-borra hover:underline">
            O feed traz o texto integral
          </Link>
          .
        </p>
      </section>

      <JsonLd
        dados={[
          schemaDoPeriodico(config),
          schemaDeMigalhas(trilha),
          ...maisRecentes.slice(0, 20).map((edicao) => schemaDaEdicao(edicao, config)),
        ]}
      />
    </>
  )
}
