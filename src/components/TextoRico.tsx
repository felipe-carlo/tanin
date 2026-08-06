import Link from 'next/link'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as RenderizadorLexical,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { Figura } from '@/components/Imagem'
import { CartaoVinhoLinha } from '@/components/CartaoVinho'
import { paraSlug } from '@/fields/slug'
import type { Midia, Vinho } from '@/payload-types'

/**
 * Forma mínima de um nó de bloco do editor.
 *
 * O tipo genérico do Payload para blocos customizados é amplo demais para inferir os
 * campos que nós mesmos definimos em `fields/editor.ts`. Declarar a forma aqui devolve
 * a checagem de tipo aos conversores sem espalhar `any` pelo arquivo.
 */
type NoDeBloco<Campos> = { node: { fields: Campos } }

/** Onde cada coleção mora no site. */
const BASE_POR_COLECAO: Record<string, string> = {
  materias: '/materias',
  edicoes: '/boletim',
  vinhos: '/vinhos',
  guias: '/guias',
}

/** Converte um link interno do editor no endereço público correspondente. */
const enderecoInterno = (relacao?: string | null, valor?: unknown): string => {
  const prefixo = BASE_POR_COLECAO[String(relacao)] ?? '/'
  const slug =
    valor && typeof valor === 'object' && 'slug' in valor
      ? String((valor as { slug?: string }).slug ?? '')
      : ''
  return slug ? `${prefixo}/${slug}` : prefixo
}

/** Texto puro de um nó do editor, para derivar a âncora de um título. */
const textoDoNo = (no: unknown): string => {
  if (!no || typeof no !== 'object') return ''
  const registro = no as { text?: unknown; children?: unknown[] }
  if (typeof registro.text === 'string') return registro.text
  if (Array.isArray(registro.children)) return registro.children.map(textoDoNo).join('')
  return ''
}

const conversores: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({
    internalDocToHref: ({ linkNode }) =>
      enderecoInterno(linkNode.fields.doc?.relationTo, linkNode.fields.doc?.value),
  }),

  /**
   * Todo título ganha um `id` derivado do próprio texto.
   *
   * Sem isso, o índice "Nesta edição" — que aponta para `#alguma-coisa` — leva a lugar
   * nenhum, e ninguém consegue mandar a alguém o link de um trecho específico. A regra
   * de conversão é a mesma do campo de âncora do painel, então os dois lados batem.
   */
  heading: ({ node, nodesToJSX }) => {
    const Marcacao = node.tag as 'h2' | 'h3' | 'h4'
    const id = paraSlug(textoDoNo(node))
    return (
      <Marcacao id={id || undefined} className="scroll-mt-28">
        {nodesToJSX({ nodes: node.children })}
      </Marcacao>
    )
  },

  // Imagem no meio do texto, com legenda e crédito em `<figure>` de verdade.
  upload: ({ node }) => {
    const midia = node.value as Midia | undefined
    if (!midia || typeof midia !== 'object') return null
    const campos = (node.fields ?? {}) as { legenda?: string; credito?: string }
    return (
      <Figura
        midia={midia}
        legenda={campos.legenda}
        credito={campos.credito}
        tamanho="largura"
        sizes="(max-width: 48rem) 100vw, 40rem"
      />
    )
  },

  // Menção a outro conteúdo, renderizada como link em linha.
  relationship: ({ node }) => {
    const valor = node.value as { slug?: string; titulo?: string; nome?: string } | number
    if (!valor || typeof valor !== 'object') return null
    return (
      <Link href={enderecoInterno(node.relationTo, valor)}>
        {valor.titulo ?? valor.nome ?? 'ver conteúdo'}
      </Link>
    )
  },

  blocks: {
    // Citação em destaque, à maneira de revista.
    destaque: ({ node }: NoDeBloco<{ texto: string; autoria?: string }>) => {
      const { texto, autoria } = node.fields
      return (
        <aside className="my-12 border-y border-tinta py-8 md:-mx-8 md:px-8">
          <p
            className="font-[family-name:var(--font-display)] text-t2 leading-[1.15] tracking-[-0.02em] equilibrado"
            style={{ fontVariationSettings: "'SOFT' 30, 'WONK' 1", fontWeight: 400 }}
          >
            {texto}
          </p>
          {autoria && <p className="rotulo mt-5 text-grafite">{autoria}</p>}
        </aside>
      )
    },

    // Caixa de apoio — "como servir", "o que levar".
    caixa: ({ node }: NoDeBloco<{ titulo: string; texto: string }>) => {
      const { titulo, texto } = node.fields
      return (
        <aside className="my-10 border-l-2 border-borra bg-papel-fundo px-6 py-6">
          <h3 className="rotulo !text-borra">{titulo}</h3>
          <p className="mt-3 text-apoio leading-relaxed">{texto}</p>
        </aside>
      )
    },

    // Ficha de vinho embutida no meio da matéria.
    fichaVinho: ({ node }: NoDeBloco<{ vinho: Vinho | number }>) => {
      const { vinho } = node.fields
      if (!vinho || typeof vinho !== 'object') return null
      return (
        <div className="my-10">
          <CartaoVinhoLinha vinho={vinho} />
        </div>
      )
    },

    // Lista numerada com título e descrição por item.
    listaNumerada: ({
      node,
    }: NoDeBloco<{ titulo?: string; itens?: { titulo: string; texto?: string }[] }>) => {
      const { titulo, itens } = node.fields
      return (
        <section className="my-10">
          {titulo && <h3 className="rotulo border-b border-fio pb-3 text-grafite">{titulo}</h3>}
          <ol className="mt-6 space-y-6">
            {itens?.map((item, indice) => (
              <li key={indice} className="grid grid-cols-[2.5rem_1fr] gap-4">
                <span className="font-[family-name:var(--font-display)] text-t3 leading-none text-borra">
                  {String(indice + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-t4 leading-snug">
                    {item.titulo}
                  </p>
                  {item.texto && (
                    <p className="mt-1.5 text-apoio leading-relaxed text-grafite">{item.texto}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )
    },
  },
})

/**
 * Renderiza o texto rico escrito no painel.
 *
 * O conteúdo é convertido em componentes React de verdade, não em HTML injetado —
 * o que significa que nada do que a Ana escreve pode virar script na página, e que
 * cada bloco especial ganha o design do portal em vez de um estilo genérico.
 */
export function TextoRico({
  dados,
  className = '',
  capitular = false,
}: {
  dados?: SerializedEditorState | null
  className?: string
  capitular?: boolean
}) {
  if (!dados) return null
  return (
    <div className={`prosa ${capitular ? 'capitular' : ''} ${className}`}>
      <RenderizadorLexical data={dados} converters={conversores} disableContainer />
    </div>
  )
}
