import Link from 'next/link'

import { Chip } from '@/components/Chip'
import { Imagem } from '@/components/Imagem'
import { NotaCompacta, Tacas } from '@/components/Tacas'
import { faixaPorId } from '@/lib/escala-cores'
import { descreverProcedencia, descreverUvas, rotuloPreco, rotuloTipo } from '@/lib/vinho'
import type { Vinho } from '@/payload-types'

/**
 * Ficha em linha — a forma padrão de listar vinho.
 *
 * O chip de cor à esquerda funciona como marcador de índice: percorrendo a lista de
 * cima a baixo, a coluna de cores já conta que tipo de vinho vem por aí antes de
 * qualquer palavra ser lida.
 */
export function CartaoVinhoLinha({ vinho }: { vinho: Vinho }) {
  const faixa = faixaPorId(vinho.corNaEscala)
  const uvas = descreverUvas(vinho)

  return (
    <article className="group relative border-t border-fio py-6 transition-colors duration-200 first:border-t-0 hover:bg-papel-fundo/60">
      <div className="flex items-start gap-4 md:gap-6">
        <span
          aria-hidden="true"
          className="mt-1.5 h-10 w-1 flex-none md:h-14"
          style={{ backgroundColor: faixa.hex }}
        />

        <div className="min-w-0 flex-1">
          <p className="rotulo text-grafite">
            {[rotuloTipo(vinho.tipo), vinho.pais].filter(Boolean).join(' · ')}
          </p>
          <h3 className="mt-2 text-t4 leading-tight">
            <Link href={`/vinhos/${vinho.slug}`} className="link-titulo">
              <span className="absolute inset-0" aria-hidden="true" />
              {vinho.produtor} {vinho.nome}
              {vinho.safra ? <span className="text-grafite"> {vinho.safra}</span> : null}
            </Link>
          </h3>
          {uvas && <p className="mt-1.5 text-miudo text-grafite linhas-2">{uvas}</p>}
          <p className="mt-2.5 max-w-prose text-apoio leading-relaxed text-grafite linhas-2 bonito">
            {vinho.veredito}
          </p>
        </div>

        <div className="hidden flex-none flex-col items-end gap-2 pt-1 sm:flex">
          <NotaCompacta nota={vinho.nota} />
          {vinho.faixaPreco && (
            <span className="rotulo text-grafite">{rotuloPreco(vinho.faixaPreco)}</span>
          )}
        </div>
      </div>

      {/* No celular a nota vai para baixo, onde há largura. */}
      <div className="mt-3 flex items-center gap-4 pl-8 sm:hidden">
        <NotaCompacta nota={vinho.nota} />
        {vinho.faixaPreco && (
          <span className="rotulo text-grafite">{rotuloPreco(vinho.faixaPreco)}</span>
        )}
      </div>
    </article>
  )
}

/** Cartão com imagem — usado na home e no fim das matérias. */
export function CartaoVinho({ vinho, prioridade = false }: { vinho: Vinho; prioridade?: boolean }) {
  const faixa = faixaPorId(vinho.corNaEscala)
  const temImagem = vinho.destaque?.imagem && typeof vinho.destaque.imagem === 'object'

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative overflow-hidden bg-papel-fundo">
        {temImagem ? (
          <Imagem
            midia={vinho.destaque?.imagem}
            tamanho="retrato"
            sizes="(max-width: 48rem) 45vw, (max-width: 80rem) 25vw, 18rem"
            proporcao="3 / 4"
            prioridade={prioridade}
            className="transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.25,1)] group-hover:scale-[1.03]"
          />
        ) : (
          // Sem foto, a cor da taça ocupa o lugar da imagem. A ausência vira sistema.
          <div
            className="flex items-end p-4"
            style={{ aspectRatio: '3 / 4', backgroundColor: faixa.hex }}
          >
            <span
              className="rotulo"
              style={{ color: faixa.contraste, opacity: 0.75 }}
            >
              {faixa.nome}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <p className="rotulo flex items-center gap-2 text-grafite">
          <Chip cor={vinho.corNaEscala} tamanho="pequeno" />
          {[rotuloTipo(vinho.tipo), descreverProcedencia(vinho)].filter(Boolean).join(' · ')}
        </p>
        <h3 className="mt-2 text-t4 leading-tight">
          <Link href={`/vinhos/${vinho.slug}`} className="link-titulo">
            <span className="absolute inset-0" aria-hidden="true" />
            {vinho.produtor} {vinho.nome}
            {vinho.safra ? <span className="text-grafite"> {vinho.safra}</span> : null}
          </Link>
        </h3>
        <p className="mt-2 text-apoio leading-relaxed text-grafite linhas-3 bonito">
          {vinho.veredito}
        </p>
        <div className="mt-auto pt-4">
          <Tacas nota={vinho.nota} tamanho={13} comRotulo={false} />
        </div>
      </div>
    </article>
  )
}
