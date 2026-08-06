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
      <ol className="flex h-14 w-full border border-tinta md:h-16">
        {ESCALA_CROMATICA.map((faixa) => {
          const marcada = faixa.id === atual.id
          const conteudo = (
            <span
              className="relative flex h-full w-full items-end justify-center pb-1.5 transition-[filter] duration-300"
              style={{
                backgroundColor: faixa.hex,
                filter: marcada ? 'none' : 'saturate(0.35) opacity(0.5)',
              }}
            >
              {marcada && (
                <span
                  aria-hidden="true"
                  className="font-[family-name:var(--font-rotulo)] text-[0.625rem] font-semibold tracking-[0.1em]"
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
              className="min-w-0 flex-1 border-r border-papel/30 last:border-r-0"
              aria-current={marcada ? 'true' : undefined}
            >
              {comLinks ? (
                <Link
                  href={`/vinhos?cor=${faixa.id}`}
                  className="block h-full w-full"
                  title={`${faixa.nome} — ${faixa.descricao}`}
                >
                  <span className="apenas-leitor">
                    {faixa.nome}
                    {marcada ? ' — a cor deste vinho' : ''}
                  </span>
                  {conteudo}
                </Link>
              ) : (
                <span className="block h-full w-full" title={faixa.nome}>
                  {conteudo}
                </span>
              )}
            </li>
          )
        })}
      </ol>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="rotulo">
          Cor na taça: <span className="text-borra">{atual.nome}</span>
        </p>
        <p className="text-miudo leading-snug text-grafite">{atual.descricao}</p>
      </div>
    </div>
  )
}
