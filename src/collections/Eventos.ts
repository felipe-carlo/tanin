import type { CollectionConfig } from 'payload'

import { autenticado, lerPublicadosSemData, somenteAdministrador } from '@/lib/acesso'
import { ganchosDeRevalidacao } from '@/hooks/revalidar'
import { campoSlug } from '@/fields/slug'
import { grupoSeo } from '@/fields/seo'
import { campoChipCor, grupoImagemDestaque } from '@/fields/comuns'

export const TIPOS_DE_EVENTO = [
  { label: 'Degustação', value: 'degustacao' },
  { label: 'Feira', value: 'feira' },
  { label: 'Jantar harmonizado', value: 'jantar' },
  { label: 'Curso ou aula', value: 'curso' },
  { label: 'Lançamento', value: 'lancamento' },
  { label: 'Online', value: 'online' },
] as const

export const Eventos: CollectionConfig = {
  slug: 'eventos',
  labels: { singular: 'Evento', plural: 'Agenda' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'data', 'cidade', 'tipo', '_status'],
    group: 'Conteúdo',
    description: 'A agenda de vinho. Eventos passados somem da listagem sozinhos.',
  },
  access: {
    read: lerPublicadosSemData,
    create: autenticado,
    update: autenticado,
    delete: somenteAdministrador,
  },
  versions: { drafts: true, maxPerDoc: 10 },
  defaultSort: 'data',
  fields: [
    { name: 'nome', type: 'text', label: 'Nome do evento', required: true },
    campoSlug('nome'),
    {
      type: 'row',
      fields: [
        {
          name: 'data',
          type: 'date',
          label: 'Data e hora de início',
          required: true,
          index: true,
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayAndTime', displayFormat: "dd/MM/yyyy 'às' HH:mm" },
          },
        },
        {
          name: 'dataFim',
          type: 'date',
          label: 'Termina em (opcional)',
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayAndTime', displayFormat: "dd/MM/yyyy 'às' HH:mm" },
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'local', type: 'text', label: 'Local', admin: { width: '50%' } },
        { name: 'cidade', type: 'text', label: 'Cidade', index: true, admin: { width: '25%' } },
        { name: 'estado', type: 'text', label: 'UF', admin: { width: '25%' } },
      ],
    },
    { name: 'endereco', type: 'text', label: 'Endereço completo' },
    {
      name: 'tipo',
      type: 'select',
      label: 'Tipo',
      required: true,
      index: true,
      options: [...TIPOS_DE_EVENTO],
    },
    { name: 'descricao', type: 'textarea', label: 'Descrição', required: true, maxLength: 900 },
    {
      type: 'row',
      fields: [
        { name: 'linkInscricao', type: 'text', label: 'Link de inscrição', admin: { width: '60%' } },
        { name: 'preco', type: 'text', label: 'Preço', admin: { width: '40%', placeholder: 'R$ 180 · gratuito' } },
      ],
    },
    { name: 'organizador', type: 'text', label: 'Organizador' },
    grupoImagemDestaque,
    campoChipCor,
    grupoSeo,
  ],
  hooks: ganchosDeRevalidacao('/agenda'),
}
