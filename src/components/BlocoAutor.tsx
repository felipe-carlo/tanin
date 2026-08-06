import Link from 'next/link'

import { Imagem } from '@/components/Imagem'
import { NOMES_DE_REDE } from '@/lib/site'
import type { Autor } from '@/payload-types'

/**
 * Assinatura no pé do texto.
 *
 * Não é vaidade: é o bloco que responde "quem está me dizendo isto?". Buscadores e
 * IAs pesam autoria identificável, e leitor também — sobretudo quando o texto opina
 * sobre o que vale o próprio dinheiro.
 */
export function BlocoAutor({ autor }: { autor: Autor }) {
  const temFoto = autor.foto && typeof autor.foto === 'object'

  return (
    <aside className="mt-16 border-t border-tinta pt-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {temFoto && (
          <div className="w-24 flex-none sm:w-28">
            <Imagem
              midia={autor.foto}
              tamanho="quadrado"
              sizes="7rem"
              proporcao="1 / 1"
              className="rounded-full"
            />
          </div>
        )}

        <div className="min-w-0">
          <p className="rotulo text-grafite">Quem escreveu</p>
          <h2 className="mt-2 text-t3 leading-tight">
            <Link href="/sobre" className="link-titulo">
              {autor.nome}
            </Link>
          </h2>
          {autor.cargo && <p className="rotulo mt-1.5 text-borra">{autor.cargo}</p>}
          {autor.bioCurta && (
            <p className="mt-3 max-w-prose text-apoio leading-relaxed text-grafite bonito">
              {autor.bioCurta}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/sobre" className="rotulo text-grafite transition-colors hover:text-borra">
              Perfil completo <span aria-hidden="true">→</span>
            </Link>
            {autor.redes?.map((rede) => (
              <a
                key={rede.id ?? rede.url}
                href={rede.url}
                target="_blank"
                rel="me noopener"
                className="rotulo text-grafite transition-colors hover:text-borra"
              >
                {NOMES_DE_REDE[rede.rede] ?? rede.rede}
              </a>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
