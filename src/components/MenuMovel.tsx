'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useRef, useState } from 'react'

type ItemMenu = { rotulo: string; endereco: string }

/**
 * Menu do celular.
 *
 * A maior parte do tráfego vem do Instagram, então este é o menu que mais gente vai
 * ver. Ele abre em tela cheia, devolve o foco ao botão quando fecha, responde ao Esc
 * e trava a rolagem do fundo — o mínimo para não parecer um site improvisado.
 */
export function MenuMovel({ itens }: { itens: ItemMenu[] }) {
  const [aberto, setAberto] = useState(false)
  const caminho = usePathname()
  const botao = useRef<HTMLButtonElement>(null)
  const painel = useRef<HTMLDivElement>(null)
  const idPainel = useId()

  // Fecha ao navegar.
  useEffect(() => {
    setAberto(false)
  }, [caminho])

  useEffect(() => {
    if (!aberto) return

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        setAberto(false)
        botao.current?.focus()
      }
      if (evento.key !== 'Tab' || !painel.current) return
      const focaveis = painel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (focaveis.length === 0) return
      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]
      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primeiro.focus()
      }
    }

    const rolagemAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', aoTeclar)
    painel.current?.querySelector<HTMLElement>('a[href]')?.focus()

    return () => {
      document.body.style.overflow = rolagemAnterior
      document.removeEventListener('keydown', aoTeclar)
    }
  }, [aberto])

  return (
    <>
      <button
        ref={botao}
        type="button"
        className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
        aria-expanded={aberto}
        aria-controls={idPainel}
        onClick={() => setAberto((valor) => !valor)}
      >
        <span className="apenas-leitor">{aberto ? 'Fechar menu' : 'Abrir menu'}</span>
        <span aria-hidden="true" className="relative block h-3.5 w-6">
          <span
            className="absolute left-0 block h-px w-6 bg-tinta transition-transform duration-300"
            style={{
              top: aberto ? '50%' : 0,
              transform: aberto ? 'rotate(45deg)' : 'none',
            }}
          />
          <span
            className="absolute left-0 block h-px w-6 bg-tinta transition-transform duration-300"
            style={{
              bottom: aberto ? 'auto' : 0,
              top: aberto ? '50%' : 'auto',
              transform: aberto ? 'rotate(-45deg)' : 'none',
            }}
          />
        </span>
      </button>

      <div
        id={idPainel}
        ref={painel}
        hidden={!aberto}
        className="fixed inset-x-0 bottom-0 top-[var(--altura-cabecalho)] z-40 overflow-y-auto bg-papel lg:hidden"
      >
        <nav aria-label="Navegação principal" className="caixa flex flex-col py-6">
          {itens.map((item, indice) => {
            const ativo = caminho === item.endereco || caminho.startsWith(`${item.endereco}/`)
            return (
              <Link
                key={item.endereco}
                href={item.endereco}
                className="revelar flex items-baseline justify-between border-b border-fio py-5 font-[family-name:var(--font-display)] text-t2"
                style={{ '--atraso': indice } as React.CSSProperties}
                aria-current={ativo ? 'page' : undefined}
              >
                <span className={ativo ? 'text-borra' : undefined}>{item.rotulo}</span>
                <span className="rotulo text-tenue">
                  {String(indice + 1).padStart(2, '0')}
                </span>
              </Link>
            )
          })}
          <Link
            href="/busca"
            className="revelar mt-6 rotulo text-grafite"
            style={{ '--atraso': itens.length } as React.CSSProperties}
          >
            Buscar no portal
          </Link>
          <Link
            href="/#assinar"
            className="botao revelar mt-6 w-full"
            style={{ '--atraso': itens.length + 1 } as React.CSSProperties}
          >
            Assinar o boletim
          </Link>
        </nav>
      </div>
    </>
  )
}
