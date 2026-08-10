'use client'

import { useCallback, useLayoutEffect, useRef } from 'react'

/**
 * A caixa de texto que não parece uma caixa de texto.
 *
 * Sem moldura, sem rótulo visível, com a altura acompanhando o conteúdo. É o que o
 * título e o subtítulo têm em comum, e o que separa uma tela de escrita de um
 * formulário: nada aqui anuncia que existe um campo.
 *
 * O rótulo continua existindo para quem usa leitor de tela — via `aria-label`. Campo
 * sem nome acessível é campo que não dá para preencher às cegas, e "minimalista" nunca
 * foi desculpa para isso.
 */
export function AreaQueCresce({
  aoConfirmar,
  aoMudar,
  className,
  marcador,
  placeholder,
  rotulo,
  valor,
}: {
  /** Seletor de para onde o `Enter` leva o foco. */
  aoConfirmar: string
  aoMudar: (valor: string) => void
  className: string
  /** Vira `data-tanin-campo`, usado pelo CSS do modo escrita e pelo salto de foco. */
  marcador: string
  placeholder: string
  rotulo: string
  valor?: string
}) {
  const referencia = useRef<HTMLTextAreaElement>(null)

  /**
   * A altura é recalculada zerando antes de medir: sem isso o `scrollHeight` nunca
   * encolhe, e a caixa cresce para sempre à medida que o texto é apagado.
   */
  const ajustarAltura = useCallback(() => {
    const campo = referencia.current
    if (!campo) return
    campo.style.height = 'auto'
    campo.style.height = `${campo.scrollHeight}px`
  }, [])

  // `useLayoutEffect` e não `useEffect`: medir depois da pintura faria a caixa piscar
  // com uma linha só antes de abrir na altura certa, a cada carregamento do documento.
  useLayoutEffect(ajustarAltura, [ajustarAltura, valor])

  return (
    <div className={`field-type tanin-campo ${className}`} data-tanin-campo={marcador}>
      <textarea
        aria-label={rotulo}
        className="tanin-campo__area"
        onChange={(evento) => {
          aoMudar(evento.target.value)
          ajustarAltura()
        }}
        onKeyDown={(evento) => {
          if (evento.key !== 'Enter' || evento.shiftKey) return
          evento.preventDefault()
          const proximo = document.querySelector<HTMLElement>(aoConfirmar)
          proximo?.focus()
        }}
        placeholder={placeholder}
        ref={referencia}
        rows={1}
        spellCheck
        value={valor ?? ''}
      />
    </div>
  )
}
