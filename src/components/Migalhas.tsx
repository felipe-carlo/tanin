import Link from 'next/link'

/**
 * Trilha de navegação.
 *
 * Serve a duas plateias ao mesmo tempo: quem chegou pelo Instagram direto numa
 * matéria e não sabe onde está, e o buscador, que usa a trilha para entender a
 * hierarquia do site e mostrá-la no resultado de busca.
 */
export function Migalhas({
  trilha,
  className = '',
}: {
  trilha: { nome: string; endereco: string }[]
  className?: string
}) {
  if (trilha.length === 0) return null

  return (
    <nav aria-label="Você está em" className={`sem-impressao ${className}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {trilha.map((item, indice) => {
          const ultimo = indice === trilha.length - 1
          return (
            <li key={item.endereco} className="flex items-center gap-2">
              {ultimo ? (
                <span className="rotulo text-grafite" aria-current="page">
                  {item.nome}
                </span>
              ) : (
                <>
                  <Link
                    href={item.endereco}
                    className="rotulo text-grafite transition-colors hover:text-borra"
                  >
                    {item.nome}
                  </Link>
                  <span aria-hidden="true" className="rotulo text-fio-forte">
                    /
                  </span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
