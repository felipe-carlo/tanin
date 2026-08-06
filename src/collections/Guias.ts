import type { CollectionConfig } from 'payload'

import { autenticado, lerPublicados, somenteAdministrador } from '@/lib/acesso'
import { ganchosDeRevalidacao } from '@/hooks/revalidar'
import { editorTanin } from '@/fields/editor'
import { campoFaq, grupoSeo } from '@/fields/seo'
import { campoSlug } from '@/fields/slug'
import {
  campoChipCor,
  campoDataAtualizacao,
  campoDataPublicacao,
  campoResumo,
  grupoImagemDestaque,
} from '@/fields/comuns'

export const TIPOS_DE_GUIA = [
  { label: 'Uva', value: 'uva' },
  { label: 'Região', value: 'regiao' },
  { label: 'Harmonização', value: 'harmonizacao' },
  { label: 'Serviço e taça', value: 'servico' },
  { label: 'Como comprar', value: 'compra' },
  { label: 'Tema técnico', value: 'tecnico' },
] as const

export const Guias: CollectionConfig = {
  slug: 'guias',
  labels: { singular: 'Guia', plural: 'Guias' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'tipoGuia', 'nivel', 'dataAtualizacao', '_status'],
    group: 'Conteúdo',
    description:
      'Conteúdo que não vence. É o que sustenta o tráfego de busca e o que as IAs citam como referência.',
    preview: (doc) =>
      `${process.env.NEXT_PUBLIC_URL_SITE ?? 'http://localhost:3000'}/guias/${doc?.slug ?? ''}`,
  },
  access: {
    read: lerPublicados,
    create: autenticado,
    update: autenticado,
    delete: somenteAdministrador,
  },
  versions: {
    drafts: { autosave: { interval: 1500 }, schedulePublish: true },
    maxPerDoc: 25,
  },
  defaultSort: 'titulo',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Guia',
          fields: [
            { name: 'titulo', type: 'text', label: 'Título', required: true },
            { name: 'subtitulo', type: 'textarea', label: 'Subtítulo', maxLength: 240 },
            campoResumo(true),
            grupoImagemDestaque,
            {
              name: 'corpo',
              type: 'richText',
              label: 'Corpo',
              editor: editorTanin,
              required: true,
            },
            {
              name: 'paraLevar',
              type: 'array',
              label: 'O que levar deste guia',
              labels: { singular: 'Ponto', plural: 'Pontos' },
              admin: {
                description:
                  'Três a cinco frases curtas e auto-contidas. Abrem o guia e são o pedaço mais citável da página.',
              },
              fields: [{ name: 'texto', type: 'text', label: 'Ponto', required: true }],
            },
          ],
        },
        {
          label: 'Relacionados',
          fields: [
            {
              name: 'conteudosRelacionados',
              type: 'relationship',
              relationTo: ['materias', 'guias', 'vinhos'],
              hasMany: true,
              label: 'Conteúdos relacionados',
            },
            {
              name: 'vinhosExemplo',
              type: 'relationship',
              relationTo: 'vinhos',
              hasMany: true,
              label: 'Garrafas que exemplificam',
            },
          ],
        },
        { label: 'Perguntas e SEO', fields: [campoFaq, grupoSeo] },
      ],
    },
    campoSlug('titulo'),
    {
      name: 'tipoGuia',
      type: 'select',
      label: 'Tipo de guia',
      required: true,
      index: true,
      options: [...TIPOS_DE_GUIA],
      admin: { position: 'sidebar' },
    },
    {
      name: 'nivel',
      type: 'select',
      label: 'Nível',
      required: true,
      defaultValue: 'iniciante',
      options: [
        { label: 'Iniciante', value: 'iniciante' },
        { label: 'Intermediário', value: 'intermediario' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'autor',
      type: 'relationship',
      relationTo: 'autores',
      label: 'Autoria',
      required: true,
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
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        if (operation === 'update' && originalDoc?._status === 'published') {
          data.dataAtualizacao = new Date().toISOString()
        }
        return data
      },
    ],
    ...ganchosDeRevalidacao('/guias'),
  },
}
