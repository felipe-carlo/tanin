import Link from 'next/link'

/**
 * Cabeçalho de seção.
 *
 * Um rótulo em caixa alta sobre um fio forte. É o recurso que organiza a home e os
 * índices sem precisar de caixa, fundo cinza ou sombra — exatamente como uma revista
 * separa editorias.
 */
export function TituloDeSecao({
  children,
  acao,
  enderecoAcao,
  nivel = 2,
  className = '',
}: {
  children: React.ReactNode
  acao?: string
  enderecoAcao?: string
  nivel?: 2 | 3
  className?: string
}) {
  const Marcacao = nivel === 2 ? 'h2' : 'h3'
  return (
    <div
      className={`mb-8 flex items-baseline justify-between gap-4 border-b border-tinta pb-3 ${className}`}
    >
      <Marcacao className="rotulo !font-semibold">{children}</Marcacao>
      {acao && enderecoAcao && (
        <Link
          href={enderecoAcao}
          className="rotulo whitespace-nowrap text-grafite transition-colors hover:text-borra"
        >
          {acao} <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  )
}

/** Espaço vertical padrão entre seções. */
export function Secao({
  children,
  className = '',
  id,
  rotulo,
}: {
  children: React.ReactNode
  className?: string
  id?: string
  rotulo?: string
}) {
  return (
    <section id={id} aria-label={rotulo} className={`py-14 md:py-20 ${className}`}>
      {children}
    </section>
  )
}
