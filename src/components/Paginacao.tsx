import Link from 'next/link'

/**
 * Paginação em links de verdade (`<a href>`), não em botões com JavaScript.
 *
 * É o que garante que o buscador consiga percorrer o arquivo inteiro: um índice cujas
 * páginas 2, 3 e 4 só existem depois de um clique em JavaScript é, na prática, um
 * índice de uma página só aos olhos de quem indexa.
 */
export function Paginacao({
  paginaAtual,
  totalDePaginas,
  base,
  parametros,
}: {
  paginaAtual: number
  totalDePaginas: number
  /** Caminho sem a página, ex.: '/materias'. */
  base: string
  /** Demais filtros ativos, preservados na troca de página. */
  parametros?: Record<string, string | string[] | undefined>
}) {
  if (totalDePaginas <= 1) return null

  const enderecoDaPagina = (pagina: number): string => {
    const busca = new URLSearchParams()
    Object.entries(parametros ?? {}).forEach(([chave, valor]) => {
      if (chave === 'pagina' || valor === undefined) return
      const lista = Array.isArray(valor) ? valor : [valor]
      lista.filter(Boolean).forEach((item) => busca.append(chave, item))
    })
    if (pagina > 1) busca.set('pagina', String(pagina))
    const consulta = busca.toString()
    return consulta ? `${base}?${consulta}` : base
  }

  // Mostra as vizinhas da página atual, mais a primeira e a última.
  const paginas = new Set<number>([1, totalDePaginas])
  for (let i = paginaAtual - 1; i <= paginaAtual + 1; i += 1) {
    if (i >= 1 && i <= totalDePaginas) paginas.add(i)
  }
  const ordenadas = Array.from(paginas).sort((a, b) => a - b)

  return (
    <nav aria-label="Paginação" className="mt-16 border-t border-tinta pt-6 sem-impressao">
      <ol className="flex flex-wrap items-center justify-center gap-2">
        {paginaAtual > 1 && (
          <li>
            <Link href={enderecoDaPagina(paginaAtual - 1)} rel="prev" className="rotulo px-3 py-2 text-grafite hover:text-borra">
              ← Anterior
            </Link>
          </li>
        )}

        {ordenadas.map((pagina, indice) => {
          const anterior = ordenadas[indice - 1]
          const salto = anterior && pagina - anterior > 1
          return (
            <li key={pagina} className="flex items-center">
              {salto && (
                <span aria-hidden="true" className="rotulo px-2 text-fio-forte">
                  …
                </span>
              )}
              {pagina === paginaAtual ? (
                <span
                  aria-current="page"
                  className="rotulo flex h-10 w-10 items-center justify-center border border-tinta bg-tinta text-papel"
                >
                  {pagina}
                </span>
              ) : (
                <Link
                  href={enderecoDaPagina(pagina)}
                  className="rotulo flex h-10 w-10 items-center justify-center border border-fio text-grafite transition-colors hover:border-tinta hover:text-tinta"
                >
                  {pagina}
                </Link>
              )}
            </li>
          )
        })}

        {paginaAtual < totalDePaginas && (
          <li>
            <Link href={enderecoDaPagina(paginaAtual + 1)} rel="next" className="rotulo px-3 py-2 text-grafite hover:text-borra">
              Próxima →
            </Link>
          </li>
        )}
      </ol>
    </nav>
  )
}
