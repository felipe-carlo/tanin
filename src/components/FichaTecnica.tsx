/**
 * Ficha técnica em lista de definição.
 *
 * `<dl>` com `<dt>`/`<dd>` de verdade, separados por fios: é informação densa
 * organizada como tabela de livro, e é a marcação que faz um buscador entender que
 * "Safra" é um rótulo e "2021" é o valor dele — coisa que uma pilha de `<div>` não diz.
 */
export function FichaTecnica({
  itens,
  colunas = 2,
  titulo,
}: {
  itens: { rotulo: string; valor: React.ReactNode }[]
  colunas?: 1 | 2
  titulo?: string
}) {
  const preenchidos = itens.filter((item) => item.valor !== null && item.valor !== undefined && item.valor !== '')
  if (preenchidos.length === 0) return null

  return (
    <section>
      {titulo && <h2 className="rotulo border-b border-tinta pb-3">{titulo}</h2>}
      <dl
        className={`mt-1 grid ${colunas === 2 ? 'sm:grid-cols-2 sm:gap-x-8' : ''}`}
      >
        {preenchidos.map((item) => (
          <div
            key={item.rotulo}
            className="flex items-baseline justify-between gap-4 border-b border-fio py-3"
          >
            <dt className="rotulo flex-none text-grafite">{item.rotulo}</dt>
            <dd className="text-right text-apoio leading-snug">{item.valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
