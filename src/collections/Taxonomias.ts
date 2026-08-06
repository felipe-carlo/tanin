import type { CollectionConfig } from 'payload'

import { campoSlug } from '@/fields/slug'
import { campoChipCor } from '@/fields/comuns'
import { grupoSeo } from '@/fields/seo'

const acessoPadrao = {
  read: () => true,
  create: ({ req }: { req: { user?: unknown } }) => Boolean(req.user),
  update: ({ req }: { req: { user?: unknown } }) => Boolean(req.user),
  delete: ({ req }: { req: { user?: unknown } }) => Boolean(req.user),
}

export const Categorias: CollectionConfig = {
  slug: 'categorias',
  labels: { singular: 'Categoria', plural: 'Categorias' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'chipCor', 'ordem'],
    group: 'Taxonomia',
    description: 'As editorias do portal. Poucas e estáveis — categoria demais é o mesmo que nenhuma.',
  },
  access: acessoPadrao,
  defaultSort: 'ordem',
  fields: [
    { name: 'nome', type: 'text', label: 'Nome', required: true },
    campoSlug('nome'),
    { name: 'descricao', type: 'textarea', label: 'Descrição', maxLength: 300 },
    campoChipCor,
    {
      name: 'ordem',
      type: 'number',
      label: 'Ordem no menu',
      defaultValue: 100,
      admin: { position: 'sidebar' },
    },
    grupoSeo,
  ],
}

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: 'Tag', plural: 'Tags' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'updatedAt'],
    group: 'Taxonomia',
    description: 'Assuntos livres. Servem para relacionar conteúdo, não para navegar.',
  },
  access: acessoPadrao,
  fields: [
    { name: 'nome', type: 'text', label: 'Nome', required: true },
    campoSlug('nome'),
  ],
}

export const Uvas: CollectionConfig = {
  slug: 'uvas',
  labels: { singular: 'Uva', plural: 'Uvas' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'cor', 'updatedAt'],
    group: 'Taxonomia',
    description: 'O vocabulário de castas. Cada uva vira um filtro no índice de vinhos.',
  },
  access: acessoPadrao,
  fields: [
    { name: 'nome', type: 'text', label: 'Nome', required: true, index: true },
    campoSlug('nome'),
    {
      name: 'cor',
      type: 'select',
      label: 'Cor da casta',
      options: [
        { label: 'Tinta', value: 'tinta' },
        { label: 'Branca', value: 'branca' },
      ],
      defaultValue: 'tinta',
    },
    {
      name: 'sinonimos',
      type: 'text',
      label: 'Sinônimos',
      admin: { description: 'Separados por vírgula. Ex.: Syrah, Shiraz.' },
    },
    { name: 'descricao', type: 'textarea', label: 'Descrição curta', maxLength: 420 },
    {
      name: 'guia',
      type: 'relationship',
      relationTo: 'guias',
      label: 'Guia sobre esta uva',
      admin: { description: 'Se existir um guia dedicado, ligue aqui — vira link nas fichas.' },
    },
  ],
}

export const Regioes: CollectionConfig = {
  slug: 'regioes',
  typescript: { interface: 'Regiao' },
  graphQL: { singularName: 'Regiao', pluralName: 'Regioes' },
  labels: { singular: 'Região', plural: 'Regiões' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'pais', 'updatedAt'],
    group: 'Taxonomia',
    description: 'Regiões e denominações. Cada uma vira um filtro e pode ter um guia próprio.',
  },
  access: acessoPadrao,
  fields: [
    { name: 'nome', type: 'text', label: 'Nome', required: true, index: true },
    campoSlug('nome'),
    { name: 'pais', type: 'text', label: 'País', required: true, index: true },
    { name: 'descricao', type: 'textarea', label: 'Descrição curta', maxLength: 420 },
    {
      name: 'guia',
      type: 'relationship',
      relationTo: 'guias',
      label: 'Guia sobre esta região',
    },
  ],
}

export const Importadoras: CollectionConfig = {
  slug: 'importadoras',
  labels: { singular: 'Importadora', plural: 'Importadoras' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'site'],
    group: 'Taxonomia',
    description: 'Quem traz o vinho para o Brasil. Aparece na ficha e ajuda o leitor a encontrar a garrafa.',
  },
  access: acessoPadrao,
  fields: [
    { name: 'nome', type: 'text', label: 'Nome', required: true },
    campoSlug('nome'),
    { name: 'site', type: 'text', label: 'Site' },
    { name: 'cidade', type: 'text', label: 'Cidade' },
  ],
}
