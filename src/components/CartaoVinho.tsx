import Link from 'next/link'

import { Chip } from '@/components/Chip'
import { Imagem } from '@/components/Imagem'
import { NotaCompacta, Tacas } from '@/components/Tacas'
import { faixaPorId, type FaixaCromatica } from '@/lib/escala-cores'
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

/**
 * O que aparece quando a ficha ainda não tem foto.
 *
 * A saída óbvia seria um retângulo chapado na cor do vinho, mas quatro deles em fila
 * viram uma parede de cor que rouba a página inteira. Aqui a cor entra onde ela de fato
 * está — dentro da taça —, sobre papel. Continua informando a mesma coisa e pesa um
 * décimo do que pesava.
 */
function SilhuetaDaTaca({ faixa }: { faixa: FaixaCromatica }) {
  return (
    <div
      className="relative flex items-center justify-center border border-fio bg-papel-fundo"
      style={{ aspectRatio: '3 / 4' }}
    >
      <svg
        viewBox="0 0 16 24"
        className="h-[62%] w-auto"
        fill="none"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M2.2 1.2h11.6c0 6-1.6 9.6-5.8 10.2C3.8 10.8 2.2 7.2 2.2 1.2Z"
          fill={faixa.hex}
        />
        <path
          d="M2.2 1.2h11.6c0 6-1.6 9.6-5.8 10.2C3.8 10.8 2.2 7.2 2.2 1.2Z"
          stroke="var(--color-tinta)"
          strokeWidth="0.5"
          strokeLinejoin="round"
        />
        <path d="M8 11.4v8.4" stroke="var(--color-tinta)" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M4.4 22.4h7.2" stroke="var(--color-tinta)" strokeWidth="0.5" strokeLinecap="round" />
      </svg>
      <span className="rotulo absolute inset-x-0 bottom-3 text-center text-tenue">
        {faixa.nome}
      </span>
    </div>
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
          <SilhuetaDaTaca faixa={faixa} />
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
