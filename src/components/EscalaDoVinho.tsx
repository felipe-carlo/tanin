import Link from 'next/link'

import { ESCALA_CROMATICA, faixaPorId } from '@/lib/escala-cores'

/**
 * A régua cromática com a posição de um vinho marcada.
 *
 * Este é o componente que traduz o sistema visual em informação útil: em vez de dizer
 * "rubi" e esperar que o leitor saiba o que isso significa, mostra a régua inteira e
 * aponta onde a taça está. Quem lê aprende a escala usando o site.
 */
export function EscalaDoVinho({
  cor,
  comLinks = true,
  className = '',
}: {
  cor?: string | null
  comLinks?: boolean
  className?: string
}) {
  const atual = faixaPorId(cor)

  return (
    <div className={className}>
      {/* A régua guarda a cor cheia em todas as faixas: apagar as outras faria a escala
          parecer quebrada e tiraria justamente o que ela ensina. O que marca a faixa do
          vinho é altura, moldura e a seta — recursos de forma, não de cor. */}
      <ol className="flex h-14 w-full items-end md:h-16">
        {ESCALA_CROMATICA.map((faixa) => {
          const marcada = faixa.id === atual.id
          const conteudo = (
            <span
              className="relative flex w-full items-end justify-center pb-1 transition-[height] duration-300"
              style={{
                backgroundColor: faixa.hex,
                height: marcada ? '100%' : '72%',
                outline: marcada ? '1px solid var(--color-tinta)' : 'none',
                outlineOffset: marcada ? '0' : undefined,
              }}
            >
              {marcada && (
                <span
                  aria-hidden="true"
                  className="text-[0.5rem] leading-none"
                  style={{ color: faixa.contraste }}
                >
                  ▲
                </span>
              )}
            </span>
          )

          return (
            <li
              key={faixa.id}
              className="flex h-full min-w-0 flex-1 items-end border-r border-papel last:border-r-0"
              aria-current={marcada ? 'true' : undefined}
            >
              {comLinks ? (
                <Link
                  href={`/vinhos?cor=${faixa.id}`}
                  className="flex h-full w-full items-end"
                  title={`${faixa.nome} — ${faixa.descricao}`}
                >
                  <span className="apenas-leitor">
                    {faixa.nome}
                    {marcada ? ' — a cor deste vinho' : ''}
                  </span>
                  {conteudo}
                </Link>
              ) : (
                <span className="flex h-full w-full items-end" title={faixa.nome}>
                  {conteudo}
                </span>
              )}
            </li>
          )
        })}
      </ol>
      <div className="h-px w-full bg-tinta" aria-hidden="true" />

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="rotulo">
          Cor na taça: <span className="text-borra">{atual.nome}</span>
        </p>
        <p className="text-miudo leading-snug text-grafite">{atual.descricao}</p>
      </div>
    </div>
  )
}
