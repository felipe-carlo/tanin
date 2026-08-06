import type { Field } from 'payload'

import { OPCOES_ESCALA } from '@/lib/escala-cores'

/** O chip da escala cromática que cada conteúdo carrega. */
export const campoChipCor: Field = {
  name: 'chipCor',
  type: 'select',
  label: 'Chip de cor',
  options: OPCOES_ESCALA,
  defaultValue: 'rubi',
  admin: {
    position: 'sidebar',
    description:
      'A faixa da escala cromática do vinho que representa este conteúdo. É o que dá cor ao cartão, à fita do boletim e aos filtros.',
  },
}

/** Estado editorial: rascunho, publicado ou agendado. */
export const campoDataPublicacao: Field = {
  name: 'dataPublicacao',
  type: 'date',
  label: 'Data de publicação',
  index: true,
  admin: {
    position: 'sidebar',
    date: { pickerAppearance: 'dayAndTime', displayFormat: "dd/MM/yyyy 'às' HH:mm" },
    description: 'Deixe uma data futura para agendar. O conteúdo só aparece no site depois dela.',
  },
  hooks: {
    beforeChange: [
      ({ siblingData, value }) => {
        if (!value && siblingData?._status === 'published') return new Date()
        return value
      },
    ],
  },
}

export const campoDataAtualizacao: Field = {
  name: 'dataAtualizacao',
  type: 'date',
  label: 'Última atualização',
  admin: {
    position: 'sidebar',
    date: { pickerAppearance: 'dayAndTime', displayFormat: "dd/MM/yyyy 'às' HH:mm" },
    description: 'Aparece nas páginas evergreen. Atualize quando revisar o conteúdo.',
  },
}

/** Resumo auto-contido — o trecho que a IA vai citar. */
export const campoResumo = (obrigatorio = true): Field => ({
  name: 'resumo',
  type: 'textarea',
  label: 'Resumo',
  required: obrigatorio,
  maxLength: 420,
  admin: {
    description:
      'De 40 a 60 palavras, escritas para fazer sentido sozinhas, fora da página. É o trecho que buscadores e IAs vão citar.',
  },
})

/** Imagem de destaque com crédito obrigatório — jornalismo se faz creditando. */
export const grupoImagemDestaque: Field = {
  type: 'group',
  name: 'destaque',
  label: 'Imagem de destaque',
  fields: [
    {
      name: 'imagem',
      type: 'upload',
      relationTo: 'midia',
      label: 'Imagem',
    },
    {
      name: 'credito',
      type: 'text',
      label: 'Crédito',
      admin: { description: 'Fotógrafo, ilustrador ou origem. Aparece embaixo da imagem.' },
    },
    {
      name: 'legenda',
      type: 'text',
      label: 'Legenda',
    },
  ],
}
