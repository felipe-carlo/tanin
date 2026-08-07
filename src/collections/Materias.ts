import type { CollectionConfig } from 'payload'

import { enderecoDoSite } from '@/lib/endereco'

import { autenticado, lerPublicados, somenteAdministrador } from '@/lib/acesso'
import { ganchosDeRevalidacao } from '@/hooks/revalidar'
import { editorTanin } from '@/fields/editor'
import { campoFaq, grupoSeo } from '@/fields/seo'
import { campoSlug } from '@/fields/slug'
import { campoIndiceBusca, montarIndiceBusca } from '@/fields/busca'
import {
  campoChipCor,
  campoDataAtualizacao,
  campoDataPublicacao,
  campoResumo,
  grupoImagemDestaque,
} from '@/fields/comuns'

export const Materias: CollectionConfig = {
  slug: 'materias',
  labels: { singular: 'Matéria', plural: 'Matérias' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'categoria', 'dataPublicacao', '_status'],
    group: 'Conteúdo',
    description: 'O jornalismo do portal: reportagens, ensaios, entrevistas.',
    livePreview: {
      url: ({ data }) =>
        `${enderecoDoSite()}/materias/${data?.slug ?? ''}`,
    },
    preview: (doc) =>
      `${enderecoDoSite()}/materias/${doc?.slug ?? ''}`,
  },
  access: {
    read: lerPublicados,
    create: autenticado,
    update: autenticado,
    delete: somenteAdministrador,
  },
  versions: {
    drafts: {
      autosave: { interval: 1500 },
      schedulePublish: true,
    },
    maxPerDoc: 25,
  },
  defaultSort: '-dataPublicacao',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Matéria',
          fields: [
            { name: 'titulo', type: 'text', label: 'Título', required: true },
            {
              name: 'subtitulo',
              type: 'textarea',
              label: 'Subtítulo',
              maxLength: 240,
              admin: { description: 'A linha fina, logo abaixo do título.' },
            },
            campoResumo(true),
            grupoImagemDestaque,
            {
              name: 'corpo',
              type: 'richText',
              label: 'Corpo',
              editor: editorTanin,
              required: true,
            },
          ],
        },
        {
          label: 'Relacionados',
          fields: [
            {
              name: 'vinhosRelacionados',
              type: 'relationship',
              relationTo: 'vinhos',
              hasMany: true,
              label: 'Vinhos citados',
              admin: { description: 'Viram cartões no fim da matéria e ligam a ficha ao texto.' },
            },
            {
              name: 'materiasRelacionadas',
              type: 'relationship',
              relationTo: 'materias',
              hasMany: true,
              label: 'Leia também',
              filterOptions: ({ id }) => ({ id: { not_equals: id } }),
            },
            {
              name: 'guiasRelacionados',
              type: 'relationship',
              relationTo: 'guias',
              hasMany: true,
              label: 'Guias relacionados',
            },
          ],
        },
        {
          label: 'Perguntas e SEO',
          fields: [campoFaq, grupoSeo],
        },
      ],
    },
    campoSlug('titulo'),
    campoIndiceBusca,
    {
      name: 'autor',
      type: 'relationship',
      relationTo: 'autores',
      label: 'Autoria',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'categoria',
      type: 'relationship',
      relationTo: 'categorias',
      label: 'Categoria',
      required: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      label: 'Tags',
      admin: { position: 'sidebar' },
    },
    campoChipCor,
    campoDataPublicacao,
    campoDataAtualizacao,
    {
      name: 'destaqueHome',
      type: 'checkbox',
      label: 'Candidata a manchete',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'A home usa a matéria marcada mais recente como manchete.',
      },
    },
    {
      name: 'tempoLeitura',
      type: 'number',
      label: 'Tempo de leitura (min)',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Calculado sozinho a partir do corpo.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        if (operation === 'update' && originalDoc?._status === 'published') {
          data.dataAtualizacao = new Date().toISOString()
        }
        data.tempoLeitura = estimarTempoLeitura(data?.corpo)
        data.indiceBusca = montarIndiceBusca([data?.titulo, data?.subtitulo, data?.resumo])
        return data
      },
    ],
    ...ganchosDeRevalidacao('/materias'),
  },
}

/** Conta as palavras do documento Lexical e converte em minutos a 200 palavras/min. */
export function estimarTempoLeitura(corpo: unknown): number {
  let palavras = 0
  const andar = (no: any): void => {
    if (!no || typeof no !== 'object') return
    if (typeof no.text === 'string') palavras += no.text.trim().split(/\s+/).filter(Boolean).length
    const filhos = no.children ?? no.root?.children
    if (Array.isArray(filhos)) filhos.forEach(andar)
    if (no.fields && typeof no.fields === 'object') {
      Object.values(no.fields).forEach((valor) => {
        if (typeof valor === 'string') palavras += valor.trim().split(/\s+/).filter(Boolean).length
        else if (Array.isArray(valor)) valor.forEach(andar)
      })
    }
  }
  andar(corpo)
  return Math.max(1, Math.round(palavras / 200))
}
