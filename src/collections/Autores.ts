import type { CollectionConfig } from 'payload'

import { campoSlug } from '@/fields/slug'
import { grupoSeo } from '@/fields/seo'
import { editorTanin } from '@/fields/editor'

export const Autores: CollectionConfig = {
  slug: 'autores',
  typescript: { interface: 'Autor' },
  graphQL: { singularName: 'Autor', pluralName: 'Autores' },
  labels: { singular: 'Autor', plural: 'Autores' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'cargo', 'updatedAt'],
    group: 'Conteúdo',
    description: 'Quem assina o conteúdo. A ficha alimenta a página /sobre e o schema Person.',
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => req.user?.papel === 'administrador',
  },
  fields: [
    { name: 'nome', type: 'text', label: 'Nome', required: true },
    campoSlug('nome'),
    {
      name: 'cargo',
      type: 'text',
      label: 'Como se apresenta',
      admin: { description: 'Ex.: "Jornalista de vinho e criadora da Tanin".' },
    },
    {
      name: 'bioCurta',
      type: 'textarea',
      label: 'Bio curta',
      maxLength: 280,
      admin: { description: 'Uma ou duas frases. Aparece no pé das matérias.' },
    },
    {
      name: 'bioLonga',
      type: 'richText',
      label: 'Bio longa',
      editor: editorTanin,
      admin: { description: 'Texto completo da página /sobre.' },
    },
    { name: 'foto', type: 'upload', relationTo: 'midia', label: 'Foto' },
    {
      name: 'credenciais',
      type: 'array',
      label: 'Credenciais',
      labels: { singular: 'Credencial', plural: 'Credenciais' },
      admin: {
        description:
          'Formação, certificações, prêmios e veículos onde publicou. É o que sustenta a autoridade do portal aos olhos do Google e das IAs.',
      },
      fields: [
        { name: 'texto', type: 'text', label: 'Credencial', required: true },
        { name: 'ano', type: 'text', label: 'Ano' },
        { name: 'link', type: 'text', label: 'Link (opcional)' },
      ],
    },
    {
      name: 'redes',
      type: 'array',
      label: 'Redes e perfis',
      labels: { singular: 'Perfil', plural: 'Perfis' },
      admin: {
        description:
          'Entram no `sameAs` do schema — é assim que buscadores ligam a pessoa aos perfis dela.',
      },
      fields: [
        {
          name: 'rede',
          type: 'select',
          label: 'Rede',
          required: true,
          options: [
            { label: 'Instagram', value: 'instagram' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'X (Twitter)', value: 'x' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'Site pessoal', value: 'site' },
            { label: 'Outro', value: 'outro' },
          ],
        },
        { name: 'url', type: 'text', label: 'Endereço', required: true },
      ],
    },
    {
      name: 'email',
      type: 'text',
      label: 'E-mail de contato público',
      admin: { description: 'Opcional. Aparece na página /sobre se preenchido.' },
    },
    grupoSeo,
  ],
}
