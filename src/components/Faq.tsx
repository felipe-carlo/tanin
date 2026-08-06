/**
 * Perguntas frequentes.
 *
 * Renderizado com `<details>` nativo — abre e fecha sem uma linha de JavaScript,
 * funciona com teclado e leitor de tela de graça, e o conteúdo das respostas está no
 * HTML mesmo fechado, que é o que permite ao buscador lê-lo.
 */
export function Faq({
  perguntas,
  titulo = 'Perguntas frequentes',
}: {
  perguntas?: { pergunta: string; resposta: string; id?: string | null }[] | null
  titulo?: string
}) {
  if (!perguntas || perguntas.length === 0) return null

  return (
    <section className="mt-16" aria-labelledby="faq">
      <h2 id="faq" className="rotulo border-b border-tinta pb-3">
        {titulo}
      </h2>
      <div className="mt-2">
        {perguntas.map((item, indice) => (
          <details
            key={item.id ?? indice}
            className="group border-b border-fio"
            name="faq-tanin"
          >
            <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
              <h3 className="text-t4 leading-snug">{item.pergunta}</h3>
              <span
                aria-hidden="true"
                className="mt-1 flex-none text-grafite transition-transform duration-300 group-open:rotate-45"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="1.2">
                  <path d="M7 1v12M1 7h12" strokeLinecap="round" />
                </svg>
              </span>
            </summary>
            <p className="max-w-prose pb-6 text-apoio leading-relaxed text-grafite bonito">
              {item.resposta}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
