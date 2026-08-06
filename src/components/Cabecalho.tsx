import Link from 'next/link'

import { MenuMovel } from '@/components/MenuMovel'
import { LinkDeNavegacao } from '@/components/LinkDeNavegacao'
import { MENU_PADRAO, obterConfiguracoes } from '@/lib/site'

export async function Cabecalho() {
  const config = await obterConfiguracoes()

  // O menu do painel vence quando existe. Um array vazio (que é como o Payload devolve
  // um global recém-criado) não é uma escolha da Ana — é ausência de escolha, e por isso
  // cai no padrão em vez de deixar o cabeçalho sem navegação.
  const doPainel = (config.menu ?? [])
    .filter((item) => item.rotulo && item.endereco)
    .map((item) => ({ rotulo: item.rotulo!, endereco: item.endereco! }))
  const itens = doPainel.length > 0 ? doPainel : MENU_PADRAO

  return (
    <header className="sticky top-0 z-50 border-b border-fio bg-papel/92 backdrop-blur-sm sem-impressao">
      <div className="caixa flex h-[var(--altura-cabecalho)] items-center justify-between gap-6">
        <Link href="/" className="group flex items-baseline gap-3" aria-label="Tanin, página inicial">
          <span
            className="font-[family-name:var(--font-display)] text-[1.75rem] leading-none tracking-[-0.04em] md:text-[2.125rem]"
            style={{ fontVariationSettings: "'SOFT' 20, 'WONK' 1", fontWeight: 500 }}
          >
            {config.nomeSite ?? 'Tanin'}
          </span>
          <span className="rotulo hidden text-grafite md:block">
            {config.assinatura ?? 'Vinho com vagar'}
          </span>
        </Link>

        <nav aria-label="Navegação principal" className="hidden items-center gap-8 lg:flex">
          {itens.map((item) => (
            <LinkDeNavegacao key={item.endereco} endereco={item.endereco} rotulo={item.rotulo} />
          ))}
        </nav>

        <div className="flex items-center gap-1 lg:gap-4">
          <Link
            href="/busca"
            className="hidden h-11 w-11 items-center justify-center lg:flex"
            aria-label="Buscar no portal"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="5.5" />
              <path d="M11 11L15.5 15.5" strokeLinecap="round" />
            </svg>
          </Link>
          <Link href="/boletim#assinar" className="botao hidden !px-5 !py-2.5 lg:inline-flex">
            Assinar
          </Link>
          <MenuMovel itens={itens} />
        </div>
      </div>
    </header>
  )
}
