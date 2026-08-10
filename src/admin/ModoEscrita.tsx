'use client'

import { usePathname } from 'next/navigation'

/**
 * Liga o modo escrita só onde ele faz sentido.
 *
 * O CSS de escrita (em `painel.css`) esconde a barra lateral do documento e tira a
 * moldura dos campos. Isso é ótimo na tela de um texto e péssimo na de mídia, onde a
 * barra lateral é justamente onde ficam o arquivo e as dimensões. Em vez de tentar
 * escopar cada regra por coleção — nome de classe do Payload é coisa que muda de
 * versão —, o escopo é uma classe só, ligada aqui, pela rota.
 *
 * Envolve também as fontes do site: o layout do painel não passa pelo `(site)`, então
 * as variáveis do `next/font` precisam ser declaradas de novo por aqui.
 */
export function ModoEscrita({
  children,
  classesDeFonte,
}: {
  children: React.ReactNode
  classesDeFonte: string
}) {
  const rota = usePathname() ?? ''
  const escrevendo = /\/collections\/textos\/(create|\d+)/.test(rota)

  return (
    <div className={`${classesDeFonte} ${escrevendo ? 'tanin-escrita' : ''}`.trim()}>
      {children}
    </div>
  )
}
