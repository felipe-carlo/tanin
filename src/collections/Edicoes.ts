import type { CollectionConfig } from 'payload'

import { autenticado, lerPublicados, somenteAdministrador } from '@/lib/acesso'
import { editorTanin } from '@/fields/editor'
import { grupoSeo } from '@/fields/seo'
import { campoSlug } from '@/fields/slug'
import { campoChipCor, campoResumo, grupoImagemDestaque } from '@/fields/comuns'
import { ESCALA_CROMATICA } from '@/lib/escala-cores'

export const Edicoes: CollectionConfig = {
  slug: 'edicoes',
  typescript: { interface: 'Edicao' },
  graphQL: { singularName: 'Edicao', pluralName: 'Edicoes' },
  labels: { singular: 'Edição do Boletim', plural: 'Boletim Tanin' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['numero', 'titulo', 'dataEnvio', '_status'],
    group: 'Conteúdo',
    description:
      'O arquivo do Boletim. Cada edição vira uma página própria e uma faixa na fita cromática.',
    preview: (doc) =>
      `${process.env.NEXT_PUBLIC_URL_SITE ?? 'http://localhost:3000'}/boletim/${doc?.slug ?? ''}`,
  },
  access: {
    read: lerPublicados,
    create: autenticado,
    update: autenticado,
    delete: somenteAdministrador,
  },
  versions: {
    drafts: { autosave: { interval: 1500 }, schedulePublish: true },
    maxPerDoc: 15,
  },
  defaultSort: '-numero',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Edição',
          fields: [
            { name: 'titulo', type: 'text', label: 'Título da edição', required: true },
            {
              name: 'subtitulo',
              type: 'textarea',
              label: 'Subtítulo',
              maxLength: 240,
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
          label: 'Blocos e âncoras',
          description:
            'Os trechos da edição que merecem link direto. Viram o índice lateral e permitem mandar alguém para um pedaço específico.',
          fields: [
            {
              name: 'blocos',
              type: 'array',
              label: 'Blocos',
              labels: { singular: 'Bloco', plural: 'Blocos' },
              admin: { initCollapsed: true },
              fields: [
                { name: 'titulo', type: 'text', label: 'Título do bloco', required: true },
                {
                  name: 'ancora',
                  type: 'text',
                  label: 'Âncora',
                  admin: {
                    description:
                      'Preenchida sozinha a partir do título. É o que vem depois do # no endereço.',
                  },
                  hooks: {
                    beforeValidate: [
                      ({ siblingData, value }) => {
                        if (value) return value
                        const titulo = (siblingData as { titulo?: string })?.titulo
                        if (!titulo) return value
                        return titulo
                          .normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, '')
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-+|-+$/g, '')
                      },
                    ],
                  },
                },
                { name: 'resumo', type: 'textarea', label: 'Resumo do bloco', maxLength: 240 },
              ],
            },
          ],
        },
        { label: 'SEO', fields: [grupoSeo] },
      ],
    },
    {
      name: 'numero',
      type: 'number',
      label: 'Número da edição',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Vira o número gigante da página, à maneira de revista.',
      },
    },
    campoSlug('titulo'),
    {
      name: 'dataEnvio',
      type: 'date',
      label: 'Data de envio',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
      },
    },
    {
      // Espelha `dataEnvio` para que o controle de acesso público (que olha
      // `dataPublicacao`) funcione igual em todas as coleções.
      name: 'dataPublicacao',
      type: 'date',
      admin: { hidden: true },
      hooks: {
        beforeChange: [({ siblingData }) => (siblingData as { dataEnvio?: string })?.dataEnvio],
      },
    },
    campoChipCor,
    {
      name: 'urlBeehiiv',
      type: 'text',
      label: 'Endereço original no beehiiv',
      admin: {
        position: 'sidebar',
        description:
          'Preenchido pela importação. Serve para apontar a canônica do beehiiv de volta para cá.',
      },
    },
    {
      name: 'importadaEm',
      type: 'date',
      label: 'Importada em',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // Quando a edição não tem chip escolhido, a própria numeração define a cor:
        // a fita cromática do arquivo cresce sozinha, percorrendo a escala.
        if (!data.chipCor && typeof data.numero === 'number') {
          const indice = (data.numero - 1) % ESCALA_CROMATICA.length
          data.chipCor = ESCALA_CROMATICA[indice].id
        }
        if (operation === 'create' && !data.dataPublicacao) data.dataPublicacao = data.dataEnvio
        return data
      },
    ],
  },
}
