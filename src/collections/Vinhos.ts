import type { CollectionConfig } from 'payload'

import { enderecoDoSite } from '@/lib/endereco'

import { autenticado, lerPublicados, somenteAdministrador } from '@/lib/acesso'
import { ganchosDeRevalidacao } from '@/hooks/revalidar'
import { editorTanin } from '@/fields/editor'
import { campoFaq, grupoSeo } from '@/fields/seo'
import { campoSlug } from '@/fields/slug'
import { campoIndiceBusca, montarIndiceBusca } from '@/fields/busca'
import { campoDataAtualizacao, campoDataPublicacao, grupoImagemDestaque } from '@/fields/comuns'
import { OPCOES_ESCALA } from '@/lib/escala-cores'
import { NOTA_MAXIMA, NOTA_MINIMA, PASSO_NOTA } from '@/lib/nota'

export const TIPOS_DE_VINHO = [
  { label: 'Tinto', value: 'tinto' },
  { label: 'Branco', value: 'branco' },
  { label: 'Rosé', value: 'rose' },
  { label: 'Espumante', value: 'espumante' },
  { label: 'Laranja', value: 'laranja' },
  { label: 'Fortificado', value: 'fortificado' },
] as const

export const CORPOS_DE_VINHO = [
  { label: 'Leve', value: 'leve' },
  { label: 'Médio', value: 'medio' },
  { label: 'Encorpado', value: 'encorpado' },
] as const

/**
 * Faixas de preço em vez de preço exato: preço de vinho muda toda semana e uma ficha
 * com número velho perde a confiança do leitor. A faixa envelhece bem, e a `dataPreco`
 * deixa claro quando foi conferida.
 */
export const FAIXAS_DE_PRECO = [
  { label: 'Até R$ 80', value: 'ate-80' },
  { label: 'R$ 80 a R$ 150', value: '80-150' },
  { label: 'R$ 150 a R$ 250', value: '150-250' },
  { label: 'R$ 250 a R$ 400', value: '250-400' },
  { label: 'R$ 400 a R$ 700', value: '400-700' },
  { label: 'Acima de R$ 700', value: 'acima-700' },
] as const

export const Vinhos: CollectionConfig = {
  slug: 'vinhos',
  labels: { singular: 'Vinho', plural: 'Vinhos' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'produtor', 'safra', 'tipo', 'nota', '_status'],
    group: 'Conteúdo',
    description:
      'As fichas. Cada uma é uma página que responde uma pergunta inteira sobre uma garrafa.',
    preview: (doc) =>
      `${enderecoDoSite()}/vinhos/${doc?.slug ?? ''}`,
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
  defaultSort: '-dataPublicacao',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'A garrafa',
          fields: [
            { name: 'nome', type: 'text', label: 'Nome do vinho', required: true },
            { name: 'produtor', type: 'text', label: 'Produtor', required: true, index: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'pais',
                  type: 'text',
                  label: 'País',
                  required: true,
                  index: true,
                  admin: { width: '33%' },
                },
                {
                  name: 'regiao',
                  type: 'relationship',
                  relationTo: 'regioes',
                  label: 'Região',
                  admin: { width: '33%' },
                },
                {
                  name: 'subRegiao',
                  type: 'text',
                  label: 'Sub-região ou denominação',
                  admin: { width: '34%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'safra',
                  type: 'number',
                  label: 'Safra',
                  admin: { width: '25%', description: 'Deixe vazio para vinhos sem safra.' },
                },
                {
                  name: 'tipo',
                  type: 'select',
                  label: 'Tipo',
                  required: true,
                  index: true,
                  options: [...TIPOS_DE_VINHO],
                  admin: { width: '25%' },
                },
                {
                  name: 'corpo',
                  type: 'select',
                  label: 'Corpo',
                  options: [...CORPOS_DE_VINHO],
                  admin: { width: '25%' },
                },
                {
                  name: 'teorAlcoolico',
                  type: 'number',
                  label: 'Álcool (%)',
                  admin: { width: '25%', step: 0.1 },
                },
              ],
            },
            {
              name: 'corNaEscala',
              type: 'select',
              label: 'Cor na escala',
              required: true,
              index: true,
              options: OPCOES_ESCALA,
              admin: {
                description:
                  'A cor real da taça. É o chip que a ficha carrega e o que liga a garrafa à escala cromática do portal.',
              },
            },
            {
              name: 'uvas',
              type: 'array',
              label: 'Uvas',
              labels: { singular: 'Uva', plural: 'Uvas' },
              admin: { description: 'Deixe o percentual vazio quando o produtor não informa.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'uva',
                      type: 'relationship',
                      relationTo: 'uvas',
                      label: 'Uva',
                      required: true,
                      admin: { width: '70%' },
                    },
                    {
                      name: 'percentual',
                      type: 'number',
                      label: '%',
                      min: 0,
                      max: 100,
                      admin: { width: '30%' },
                    },
                  ],
                },
              ],
            },
            grupoImagemDestaque,
          ],
        },
        {
          label: 'O veredito',
          fields: [
            {
              name: 'nota',
              type: 'number',
              label: `Nota (${NOTA_MINIMA} a ${NOTA_MAXIMA} taças)`,
              min: NOTA_MINIMA,
              max: NOTA_MAXIMA,
              index: true,
              admin: {
                step: PASSO_NOTA,
                description: 'Meias taças são permitidas: 3,5 · 4 · 4,5 · 5.',
              },
            },
            {
              name: 'veredito',
              type: 'textarea',
              label: 'Veredito',
              required: true,
              maxLength: 480,
              admin: {
                description:
                  'Duas ou três frases que se sustentam sozinhas, fora da página. É o trecho que buscadores e IAs vão citar quando alguém perguntar sobre este vinho.',
              },
            },
            {
              name: 'notasDegustacao',
              type: 'richText',
              label: 'Notas de degustação',
              editor: editorTanin,
            },
            {
              name: 'harmonizacoes',
              type: 'array',
              label: 'Harmonizações',
              labels: { singular: 'Harmonização', plural: 'Harmonizações' },
              fields: [
                { name: 'prato', type: 'text', label: 'Prato ou ingrediente', required: true },
                { name: 'observacao', type: 'text', label: 'Por quê' },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'temperaturaServico',
                  type: 'text',
                  label: 'Temperatura de serviço',
                  admin: { width: '33%', placeholder: '14 a 16 °C' },
                },
                {
                  name: 'potencialGuarda',
                  type: 'text',
                  label: 'Potencial de guarda',
                  admin: { width: '33%', placeholder: 'Beber até 2030' },
                },
                {
                  name: 'tacaRecomendada',
                  type: 'text',
                  label: 'Taça recomendada',
                  admin: { width: '34%', placeholder: 'Bordeaux' },
                },
              ],
            },
            {
              name: 'decantacao',
              type: 'text',
              label: 'Decantação',
              admin: { placeholder: 'Abrir uma hora antes' },
            },
          ],
        },
        {
          label: 'Onde encontrar',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'faixaPreco',
                  type: 'select',
                  label: 'Faixa de preço',
                  options: [...FAIXAS_DE_PRECO],
                  index: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'dataPreco',
                  type: 'date',
                  label: 'Preço conferido em',
                  admin: {
                    width: '50%',
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
                    description: 'Aparece na ficha, para o leitor saber o quanto a faixa está fresca.',
                  },
                },
              ],
            },
            {
              name: 'importadora',
              type: 'relationship',
              relationTo: 'importadoras',
              label: 'Importadora',
            },
            {
              name: 'ondeComprar',
              type: 'array',
              label: 'Onde comprar',
              labels: { singular: 'Loja', plural: 'Lojas' },
              admin: {
                description:
                  'Links informativos, sem afiliação. Se algum dia houver afiliação, marque abaixo — a transparência é parte da credibilidade.',
              },
              fields: [
                { name: 'loja', type: 'text', label: 'Loja', required: true },
                { name: 'url', type: 'text', label: 'Endereço', required: true },
                { name: 'afiliado', type: 'checkbox', label: 'É link de afiliado', defaultValue: false },
              ],
            },
          ],
        },
        {
          label: 'Relacionados',
          fields: [
            {
              name: 'materiasRelacionadas',
              type: 'relationship',
              relationTo: 'materias',
              hasMany: true,
              label: 'Matérias que citam este vinho',
            },
            {
              name: 'vinhosSimilares',
              type: 'relationship',
              relationTo: 'vinhos',
              hasMany: true,
              label: 'Se gostou deste, prove',
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
        { label: 'Perguntas e SEO', fields: [campoFaq, grupoSeo] },
      ],
    },
    campoSlug('nome'),
    campoIndiceBusca,
    {
      name: 'autor',
      type: 'relationship',
      relationTo: 'autores',
      label: 'Quem provou',
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
    campoDataPublicacao,
    campoDataAtualizacao,
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc, operation }) => {
        if (operation === 'update' && originalDoc?._status === 'published') {
          data.dataAtualizacao = new Date().toISOString()
        }
        data.indiceBusca = montarIndiceBusca([
          data?.nome,
          data?.produtor,
          data?.pais,
          data?.subRegiao,
          data?.safra,
          data?.veredito,
        ])
        return data
      },
    ],
    ...ganchosDeRevalidacao('/vinhos'),
  },
}
