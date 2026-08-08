import type { CollectionConfig, Field } from 'payload'

import { enderecoDoSite } from '@/lib/endereco'
import { enderecoDoTexto, OPCOES_SECAO } from '@/lib/secoes'
import { OPCOES_CATEGORIA } from '@/lib/categorias'
import { estimarTempoLeitura, resumoOuTrecho } from '@/lib/texto'
import { autenticado, lerPublicados, somenteAdministrador } from '@/lib/acesso'
import { ganchosDeRevalidacaoPorSecao } from '@/hooks/revalidar'
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
import { ESCALA_CROMATICA } from '@/lib/escala-cores'

export const TIPOS_DE_GUIA = [
  { label: 'Uva', value: 'uva' },
  { label: 'Região', value: 'regiao' },
  { label: 'Harmonização', value: 'harmonizacao' },
  { label: 'Serviço e taça', value: 'servico' },
  { label: 'Como comprar', value: 'compra' },
  { label: 'Tema técnico', value: 'tecnico' },
] as const

/**
 * A COLEÇÃO ÚNICA DE TEXTOS
 *
 * Tudo que se escreve no portal mora aqui: matérias, edições do boletim e guias.
 * O campo `secao` decide a forma e o endereço; o formulário é um só — texto no
 * centro, metadados na lateral — e nada além de título e corpo é obrigatório.
 * Escrever é abrir, digitar e publicar.
 */
export const Textos: CollectionConfig = {
  slug: 'textos',
  typescript: { interface: 'Texto' },
  graphQL: { singularName: 'Texto', pluralName: 'Textos' },
  labels: { singular: 'Texto', plural: 'Textos' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'secao', 'dataPublicacao', '_status'],
    group: 'Conteúdo',
    description:
      'Tudo que se escreve: matérias, edições do boletim e guias. A seção, na lateral, decide onde o texto aparece.',
    livePreview: {
      url: ({ data }) => `${enderecoDoSite()}${enderecoDoTexto(data)}`,
    },
    preview: (doc) =>
      `${enderecoDoSite()}${enderecoDoTexto(doc as { secao?: string; slug?: string })}`,
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
    /* A coluna de escrever: só o que é texto. */
    { name: 'titulo', type: 'text', label: 'Título', required: true },
    {
      name: 'subtitulo',
      type: 'textarea',
      label: 'Subtítulo',
      maxLength: 240,
      admin: { description: 'A linha fina, logo abaixo do título.' },
    },
    campoResumo(false),
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
        condition: (data) => data?.secao === 'guia',
        description:
          'Três a cinco frases curtas e auto-contidas. Abrem o guia e são o pedaço mais citável da página.',
      },
      fields: [{ name: 'texto', type: 'text', label: 'Ponto', required: true }],
    },
    {
      type: 'collapsible',
      label: 'Perguntas e SEO',
      admin: { initCollapsed: true },
      fields: [campoFaq, grupoSeo],
    },

    /* A lateral: metadados, quase tudo preenchido sozinho ou opcional. */
    {
      name: 'secao',
      type: 'select',
      label: 'Seção',
      required: true,
      defaultValue: 'materia',
      index: true,
      options: [...OPCOES_SECAO],
      admin: {
        position: 'sidebar',
        description: 'Decide onde o texto mora no site: /materias, /boletim ou /guias.',
      },
    },
    {
      name: 'categoria',
      type: 'select',
      label: 'Editoria',
      index: true,
      options: [...OPCOES_CATEGORIA],
      admin: {
        position: 'sidebar',
        condition: (data) => data?.secao === 'materia',
        description: 'Opcional. Sem editoria, a matéria aparece só no recorte "Tudo".',
      },
    },
    {
      name: 'tipoGuia',
      type: 'select',
      label: 'Tipo de guia',
      index: true,
      options: [...TIPOS_DE_GUIA],
      admin: {
        position: 'sidebar',
        condition: (data) => data?.secao === 'guia',
        description: 'Se ficar vazio, entra como "Tema técnico".',
      },
    },
    {
      name: 'nivel',
      type: 'select',
      label: 'Nível',
      options: [
        { label: 'Iniciante', value: 'iniciante' },
        { label: 'Intermediário', value: 'intermediario' },
      ],
      admin: {
        position: 'sidebar',
        condition: (data) => data?.secao === 'guia',
        description: 'Se ficar vazio, entra como "Iniciante".',
      },
    },
    {
      name: 'numero',
      type: 'number',
      label: 'Número da edição',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (data) => data?.secao === 'boletim',
        description: 'Numerada sozinha ao publicar: a próxima edição é sempre a maior + 1.',
      },
      hooks: {
        // Duplicar uma edição não pode carregar o número junto — ele é único.
        beforeDuplicate: [() => undefined],
      },
    },
    // O mesmo grupo de imagem das fichas de vinho; aqui ele mora na lateral.
    { ...grupoImagemDestaque, admin: { position: 'sidebar' } } as Field,
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
        condition: (data) => data?.secao === 'materia',
        description: 'A home usa a matéria marcada mais recente como manchete.',
      },
    },
    {
      name: 'relacionados',
      type: 'relationship',
      relationTo: ['textos', 'vinhos'],
      hasMany: true,
      label: 'Relacionados',
      admin: {
        position: 'sidebar',
        description: 'Vinhos citados viram cartões; textos viram o "leia também".',
      },
      // Em documento novo ainda não há `id` — sem o guard, a validação do create
      // compararia com undefined e recusaria qualquer seleção.
      filterOptions: ({ id, relationTo }) =>
        relationTo === 'textos' && id ? { id: { not_equals: id } } : true,
    },
    campoSlug('titulo'),
    campoIndiceBusca,
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
    {
      name: 'urlBeehiiv',
      type: 'text',
      label: 'Endereço original no beehiiv',
      admin: {
        position: 'sidebar',
        condition: (data) => data?.secao === 'boletim',
        description:
          'Preenchido pela importação. Serve para apontar a canônica do beehiiv de volta para cá.',
      },
    },
    {
      name: 'importadaEm',
      type: 'date',
      label: 'Importada em',
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (data) => data?.secao === 'boletim',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        if (operation === 'update' && originalDoc?._status === 'published') {
          data.dataAtualizacao = new Date().toISOString()
        }
        data.tempoLeitura = estimarTempoLeitura(data?.corpo)

        // Guia sem tipo nem nível entra com os padrões — sem bloquear o publish.
        if (data?.secao === 'guia') {
          if (!data.tipoGuia) data.tipoGuia = 'tecnico'
          if (!data.nivel) data.nivel = 'iniciante'
        }

        /**
         * A numeração do boletim é automática: ao publicar uma edição sem número,
         * ela recebe o maior existente + 1. Numerar só no publish evita buracos
         * deixados por rascunhos abandonados; a importação do beehiiv manda o
         * número explícito e passa direto por aqui.
         */
        if (data?.secao === 'boletim' && data?._status === 'published' && !data?.numero) {
          const ultimo = await req.payload.find({
            collection: 'textos',
            where: {
              and: [{ secao: { equals: 'boletim' } }, { numero: { exists: true } }],
            },
            sort: '-numero',
            limit: 1,
            depth: 0,
            overrideAccess: true,
          })
          const maior = Number(ultimo.docs[0]?.numero ?? 0)
          data.numero = maior + 1
        }

        // Edição sem chip escolhido ganha a cor da própria numeração: a fita
        // cromática do arquivo cresce sozinha, percorrendo a escala.
        if (data?.secao === 'boletim' && !data.chipCor && typeof data.numero === 'number') {
          const indice = (data.numero - 1) % ESCALA_CROMATICA.length
          data.chipCor = ESCALA_CROMATICA[indice].id
        }

        data.indiceBusca = montarIndiceBusca([
          data?.titulo,
          data?.subtitulo,
          resumoOuTrecho(data as { resumo?: string | null; corpo?: unknown }),
          data?.secao === 'boletim' && data?.numero ? `edicao ${data.numero}` : null,
        ])
        return data
      },
    ],
    ...ganchosDeRevalidacaoPorSecao(),
  },
}
