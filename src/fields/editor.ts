import {
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  RelationshipFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { Block } from 'payload'

/** Citação em destaque, à maneira de revista. */
const blocoDestaque: Block = {
  slug: 'destaque',
  labels: { singular: 'Citação em destaque', plural: 'Citações em destaque' },
  fields: [
    { name: 'texto', type: 'textarea', label: 'Frase', required: true },
    { name: 'autoria', type: 'text', label: 'Quem disse' },
  ],
}

/** Caixa lateral com informação complementar — "para levar", "como servir", etc. */
const blocoCaixa: Block = {
  slug: 'caixa',
  labels: { singular: 'Caixa de apoio', plural: 'Caixas de apoio' },
  fields: [
    { name: 'titulo', type: 'text', label: 'Título da caixa', required: true },
    { name: 'texto', type: 'textarea', label: 'Texto', required: true },
  ],
}

/** Ficha de vinho embutida no meio do texto. */
const blocoFichaVinho: Block = {
  slug: 'fichaVinho',
  labels: { singular: 'Ficha de vinho', plural: 'Fichas de vinho' },
  fields: [
    {
      name: 'vinho',
      type: 'relationship',
      relationTo: 'vinhos',
      label: 'Vinho',
      required: true,
    },
  ],
}

/** Lista numerada de itens com título e descrição — para guias e roteiros. */
const blocoLista: Block = {
  slug: 'listaNumerada',
  labels: { singular: 'Lista numerada', plural: 'Listas numeradas' },
  fields: [
    { name: 'titulo', type: 'text', label: 'Título da lista' },
    {
      name: 'itens',
      type: 'array',
      label: 'Itens',
      minRows: 1,
      fields: [
        { name: 'titulo', type: 'text', label: 'Título do item', required: true },
        { name: 'texto', type: 'textarea', label: 'Descrição' },
      ],
    },
  ],
}

/**
 * Editor de texto rico do portal.
 *
 * Ficou de fora de propósito: H1 (a página já tem um só, o título), cores de texto e
 * tamanhos de fonte. Formatação visual arbitrária no corpo destrói a consistência
 * tipográfica — quem decide como o texto se parece é o sistema de design, não o editor.
 */
export const editorTanin = lexicalEditor({
  features: () => [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    StrikethroughFeature(),
    SubscriptFeature(),
    SuperscriptFeature(),
    BlockquoteFeature(),
    UnorderedListFeature(),
    OrderedListFeature(),
    HorizontalRuleFeature(),
    LinkFeature({
      enabledCollections: ['textos', 'vinhos'],
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: 'seguir',
          type: 'checkbox',
          label: 'Link patrocinado ou não editorial (adiciona rel="nofollow")',
          defaultValue: false,
        },
      ],
    }),
    RelationshipFeature({ enabledCollections: ['textos', 'vinhos'] }),
    UploadFeature({
      collections: {
        midia: {
          fields: [
            { name: 'legenda', type: 'text', label: 'Legenda' },
            { name: 'credito', type: 'text', label: 'Crédito' },
          ],
        },
      },
    }),
    BlocksFeature({ blocks: [blocoDestaque, blocoCaixa, blocoFichaVinho, blocoLista] }),
    InlineToolbarFeature(),
  ],
})
