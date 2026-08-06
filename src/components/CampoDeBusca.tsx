'use client'

import { useId } from 'react'

/**
 * Campo de busca do portal.
 *
 * É um formulário GET de verdade: o próprio navegador monta `/busca?q=…`, então a
 * busca funciona antes de o JavaScript carregar, o resultado tem endereço próprio e
 * dá para colar o link no WhatsApp. Nenhum estado, nenhum `onChange`, nenhum
 * `router.push` — a plataforma já resolve.
 */
export function CampoDeBusca({
  valorInicial = '',
  autoFoco = false,
  grande = false,
}: {
  valorInicial?: string
  autoFoco?: boolean
  /** Versão de capa da página de busca: mesmo campo, corpo maior. */
  grande?: boolean
}) {
  const idCampo = useId()

  return (
    <form
      method="get"
      action="/busca"
      role="search"
      className="flex w-full flex-col gap-4 sm:flex-row sm:items-end"
    >
      <div className="min-w-0 flex-1">
        <label htmlFor={idCampo} className="rotulo block pb-1 text-grafite">
          Buscar no portal
        </label>
        <input
          id={idCampo}
          name="q"
          type="search"
          defaultValue={valorInicial}
          // Foco automático só onde o campo é o assunto da página; em qualquer outro
          // lugar ele roubaria o começo da leitura de quem usa leitor de tela.
          autoFocus={autoFoco}
          autoComplete="off"
          spellCheck={false}
          placeholder="uva, região, produtor, prato…"
          className={grande ? 'campo py-4 text-corpo-grande' : 'campo'}
        />
      </div>

      <button type="submit" className="botao min-h-11 whitespace-nowrap">
        Buscar
      </button>
    </form>
  )
}
