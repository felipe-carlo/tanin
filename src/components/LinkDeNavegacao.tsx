'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Item do menu do computador.
 *
 * Marca a seção corrente com um fio embaixo e com `aria-current`, para que a
 * informação chegue igual a quem enxerga e a quem usa leitor de tela.
 */
export function LinkDeNavegacao({ endereco, rotulo }: { endereco: string; rotulo: string }) {
  const caminho = usePathname()
  const ativo =
    endereco === '/' ? caminho === '/' : caminho === endereco || caminho.startsWith(`${endereco}/`)

  return (
    <Link
      href={endereco}
      aria-current={ativo ? 'page' : undefined}
      className="rotulo relative py-2 transition-colors duration-200 hover:text-borra"
      style={ativo ? { color: 'var(--color-borra)' } : undefined}
    >
      {rotulo}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-0.5 h-px origin-left bg-borra transition-transform duration-300"
        style={{ transform: ativo ? 'scaleX(1)' : 'scaleX(0)' }}
      />
    </Link>
  )
}
