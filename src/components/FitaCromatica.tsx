import Link from 'next/link'

import { faixaPorId } from '@/lib/escala-cores'
import { dataCurta, doisDigitos, iso } from '@/lib/formatar'
import type { Edicao } from '@/payload-types'

/**
 * A FITA CROMÁTICA DO BOLETIM — o elemento assinatura do arquivo.
 *
 * Cada edição é uma faixa de cor. Uma edição por semana, uma faixa por semana: a fita
 * cresce sozinha e, em um ano, vira um objeto gráfico que nenhum outro site tem,
 * porque ninguém mais tem exatamente este arquivo.
 *
 * A fita é navegação de verdade, não decoração: cada faixa é um link com nome
 * acessível completo. No celular ela rola na horizontal com encaixe, e cada faixa
 * tem largura mínima de toque confortável.
 */
export function FitaCromatica({
  edicoes,
  altura = 'alta',
}: {
  edicoes: Edicao[]
  altura?: 'baixa' | 'alta'
}) {
  if (edicoes.length === 0) return null

  const classesAltura = altura === 'alta' ? 'h-32 md:h-52' : 'h-14 md:h-20'

  return (
    <nav aria-label="Arquivo do Boletim por edição">
      <ol
        className={`flex snap-x snap-mandatory overflow-x-auto border-y border-tinta ${classesAltura}`}
        style={{ scrollbarWidth: 'thin' }}
      >
        {edicoes.map((edicao) => {
          const faixa = faixaPorId(edicao.chipCor)
          return (
            <li
              key={edicao.id}
              className="group relative min-w-[2.75rem] flex-1 snap-start border-r border-papel/25 last:border-r-0"
            >
              <Link
                href={`/boletim/${edicao.slug}`}
                className="relative flex h-full w-full flex-col items-center justify-end pb-3 transition-[filter] duration-300 hover:brightness-90 focus-visible:brightness-90"
                style={{ backgroundColor: faixa.hex }}
              >
                <span className="apenas-leitor">
                  Edição {edicao.numero}: {edicao.titulo}
                </span>
                <span
                  aria-hidden="true"
                  className="font-[family-name:var(--font-rotulo)] text-[0.625rem] font-semibold tracking-[0.1em]"
                  style={{ color: faixa.contraste, opacity: 0.8 }}
                >
                  {doisDigitos(edicao.numero)}
                </span>

                {/* Etiqueta que aparece ao passar o cursor ou ao chegar pelo teclado. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-56 -translate-x-1/2 border border-tinta bg-papel px-3 py-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 md:block"
                >
                  <span className="rotulo block text-grafite">
                    Edição {edicao.numero} · {dataCurta(edicao.dataEnvio)}
                  </span>
                  <span className="mt-1 block font-[family-name:var(--font-display)] text-[0.95rem] leading-snug linhas-2">
                    {edicao.titulo}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** Fita reduzida, sem links — usada como ornamento no topo de uma seção. */
export function FitaDecorativa({ edicoes }: { edicoes: Pick<Edicao, 'id' | 'chipCor'>[] }) {
  if (edicoes.length === 0) return null
  return (
    <div className="flex h-1.5 w-full" aria-hidden="true">
      {edicoes.map((edicao) => (
        <span
          key={edicao.id}
          className="flex-1"
          style={{ backgroundColor: faixaPorId(edicao.chipCor).hex }}
        />
      ))}
    </div>
  )
}

/** Item de lista de edição — a alternativa em texto à fita. */
export function LinhaEdicao({ edicao }: { edicao: Edicao }) {
  const faixa = faixaPorId(edicao.chipCor)
  return (
    <article className="group relative flex items-baseline gap-4 border-t border-fio py-6 md:gap-8">
      <span
        className="cartaz !text-[2.5rem] !leading-none text-tenue transition-colors duration-300 group-hover:text-borra md:!text-[3.5rem]"
        aria-hidden="true"
      >
        {doisDigitos(edicao.numero)}
      </span>

      <div className="min-w-0 flex-1">
        <p className="rotulo flex items-center gap-2 text-grafite">
          <span
            className="chip"
            style={{ backgroundColor: faixa.hex }}
            aria-hidden="true"
          />
          <time dateTime={iso(edicao.dataEnvio)}>{dataCurta(edicao.dataEnvio)}</time>
        </p>
        <h3 className="mt-1.5 text-t3 leading-tight">
          <Link href={`/boletim/${edicao.slug}`} className="link-titulo">
            <span className="absolute inset-0" aria-hidden="true" />
            {edicao.titulo}
          </Link>
        </h3>
        {edicao.resumo && (
          <p className="mt-2 max-w-prose text-apoio leading-relaxed text-grafite linhas-2 bonito">
            {edicao.resumo}
          </p>
        )}
      </div>
    </article>
  )
}
