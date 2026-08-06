import Link from 'next/link'

import { Chip } from '@/components/Chip'
import { Imagem } from '@/components/Imagem'
import { dataPorExtenso, iso } from '@/lib/formatar'
import type { Categoria, Guia, Materia } from '@/payload-types'

type Conteudo = Materia | Guia

const categoriaDe = (conteudo: Conteudo): string | null => {
  if ('categoria' in conteudo && conteudo.categoria && typeof conteudo.categoria === 'object') {
    return (conteudo.categoria as Categoria).nome ?? null
  }
  if ('tipoGuia' in conteudo) return 'Guia'
  return null
}

const enderecoDe = (conteudo: Conteudo): string =>
  'tipoGuia' in conteudo ? `/guias/${conteudo.slug}` : `/materias/${conteudo.slug}`

/**
 * Cartão de matéria com imagem.
 *
 * `tamanho` controla a hierarquia: uma página com todos os cartões do mesmo peso é
 * uma lista, não uma capa. A revista decide o que é grande e o que é pequeno.
 */
export function CartaoMateria({
  conteudo,
  tamanho = 'medio',
  prioridade = false,
  mostrarResumo = true,
}: {
  conteudo: Conteudo
  tamanho?: 'pequeno' | 'medio' | 'grande'
  prioridade?: boolean
  mostrarResumo?: boolean
}) {
  const categoria = categoriaDe(conteudo)
  const data = conteudo.dataPublicacao ?? conteudo.createdAt
  const temImagem = conteudo.destaque?.imagem && typeof conteudo.destaque.imagem === 'object'

  const classesTitulo = {
    pequeno: 'text-t4',
    medio: 'text-t3',
    grande: 'text-t2',
  }[tamanho]

  const sizes = {
    pequeno: '(max-width: 48rem) 45vw, 18rem',
    medio: '(max-width: 48rem) 92vw, (max-width: 80rem) 45vw, 28rem',
    grande: '(max-width: 48rem) 92vw, 55vw',
  }[tamanho]

  return (
    <article className="group relative flex h-full flex-col">
      {temImagem && (
        <div className="mb-5 overflow-hidden bg-papel-fundo">
          <Imagem
            midia={conteudo.destaque?.imagem}
            tamanho={tamanho === 'grande' ? 'largura' : 'cartao'}
            sizes={sizes}
            proporcao={tamanho === 'grande' ? '16 / 9' : '3 / 2'}
            prioridade={prioridade}
            className="transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.25,1)] group-hover:scale-[1.03]"
          />
        </div>
      )}

      <p className="rotulo flex flex-wrap items-center gap-x-2.5 gap-y-1 text-grafite">
        <Chip cor={conteudo.chipCor} tamanho="pequeno" />
        {categoria && <span>{categoria}</span>}
        {categoria && data && <span aria-hidden="true" className="text-tenue">·</span>}
        {data && <time dateTime={iso(data)}>{dataPorExtenso(data)}</time>}
      </p>

      <h3 className={`mt-2.5 leading-tight ${classesTitulo}`}>
        <Link href={enderecoDe(conteudo)} className="link-titulo">
          <span className="absolute inset-0" aria-hidden="true" />
          {conteudo.titulo}
        </Link>
      </h3>

      {mostrarResumo && conteudo.resumo && (
        <p className="mt-3 text-apoio leading-relaxed text-grafite linhas-3 bonito">
          {conteudo.resumo}
        </p>
      )}

      {'tempoLeitura' in conteudo && conteudo.tempoLeitura ? (
        <p className="rotulo mt-auto pt-4 text-tenue">{conteudo.tempoLeitura} min de leitura</p>
      ) : null}
    </article>
  )
}

/**
 * Cartão sem imagem, em fio — para listas longas e para a segunda dobra da home.
 * Ocupa um terço do espaço vertical e mantém a página respirando.
 */
export function LinhaMateria({
  conteudo,
  numero,
}: {
  conteudo: Conteudo
  numero?: number
}) {
  const categoria = categoriaDe(conteudo)
  const data = conteudo.dataPublicacao ?? conteudo.createdAt

  return (
    <article className="group relative border-t border-fio py-5 first:border-t-0">
      <div className="flex gap-4">
        {typeof numero === 'number' && (
          <span
            aria-hidden="true"
            className="rotulo w-6 flex-none pt-1 text-tenue"
          >
            {String(numero).padStart(2, '0')}
          </span>
        )}
        <div className="min-w-0">
          <p className="rotulo flex flex-wrap items-center gap-x-2.5 gap-y-1 text-grafite">
            <Chip cor={conteudo.chipCor} tamanho="pequeno" />
            {categoria && <span>{categoria}</span>}
            {data && <time dateTime={iso(data)}>{dataPorExtenso(data)}</time>}
          </p>
          <h3 className="mt-2 text-t4 leading-tight">
            <Link href={enderecoDe(conteudo)} className="link-titulo">
              <span className="absolute inset-0" aria-hidden="true" />
              {conteudo.titulo}
            </Link>
          </h3>
          {conteudo.resumo && (
            <p className="mt-2 max-w-prose text-apoio leading-relaxed text-grafite linhas-2 bonito">
              {conteudo.resumo}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}
