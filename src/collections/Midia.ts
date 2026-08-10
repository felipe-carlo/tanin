import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Midia: CollectionConfig = {
  slug: 'midia',
  labels: { singular: 'Imagem', plural: 'Mídia' },
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['thumbnail', 'alt', 'credito', 'updatedAt'],
    group: 'Conteúdo',
    description: 'Imagens e ilustrações usadas no site.',
  },
  access: {
    read: () => true, // todo conteúdo é público
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: {
    staticDir: path.resolve(dirname, '../../public/media'),
    mimeTypes: ['image/*'],
    focalPoint: true,
    crop: true,
    // Tamanhos pensados para o grid editorial: retrato de coluna, paisagem de capa,
    // quadrado de cartão e a miniatura do admin.
    imageSizes: [
      { name: 'miniatura', width: 400, height: 300, position: 'centre' },
      { name: 'cartao', width: 768, height: 512, position: 'centre' },
      { name: 'quadrado', width: 900, height: 900, position: 'centre' },
      { name: 'retrato', width: 900, height: 1200, position: 'centre' },
      { name: 'largura', width: 1600 },
      { name: 'compartilhamento', width: 1200, height: 630, position: 'centre' },
    ],
    adminThumbnail: 'miniatura',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto alternativo',
      /**
       * Deixou de ser obrigatório de propósito. Exigir a descrição no meio do upload
       * interrompe a escrita — e a interrupção, na prática, produz `alt="imagem"`, que
       * é pior do que nada para quem usa leitor de tela. Sem descrição, a legenda
       * assume; sem legenda, a imagem entra como decorativa, que é a marcação correta
       * para uma foto que o texto ao redor já explica.
       */
      admin: {
        description:
          'Descreve a imagem para quem não pode vê-la. Se ficar em branco, usamos a legenda.',
      },
    },
    {
      name: 'credito',
      type: 'text',
      label: 'Crédito',
      admin: { description: 'Fotógrafo, ilustrador ou banco de imagem.' },
    },
    {
      name: 'legenda',
      type: 'text',
      label: 'Legenda padrão',
      admin: { description: 'Usada quando a matéria não define uma legenda própria.' },
    },
  ],
}
