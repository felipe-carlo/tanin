import type { CollectionConfig, Field } from 'payload'

import { enderecoDoSite } from '@/lib/endereco'
import { enderecoDoTexto, OPCOES_SECAO } from '@/lib/secoes'
import { OPCOES_CATEGORIA } from '@/lib/categorias'
import { derivarChipCor, derivarPalavrasChave, lerCorpo, trechoDeLeitura } from '@/lib/texto'
import { autenticado, lerPublicados, somenteAdministrador } from '@/lib/acesso'
import { ganchosDeRevalidacaoPorSecao } from '@/hooks/revalidar'
import { editorTanin } from '@/fields/editor'
import { campoFaq, grupoSeo } from '@/fields/seo'
import { campoSlugOculto } from '@/fields/slug'
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

/** Esconde um campo do formulário sem tirá-lo do banco. */
const oculto = <T extends Field>(campo: T): T =>
  ({ ...campo, admin: { ...(campo as { admin?: object }).admin, hidden: true } }) as T

/**
 * A COLEÇÃO DE TEXTOS
 *
 * O formulário pede três coisas: **título, subtítulo e o texto**. Mais nada.
 *
 * Todo o resto — o resumo que buscadores e IAs citam, o endereço da página, a imagem
 * que aparece no WhatsApp, as palavras-chave, o tempo de leitura, o que a busca indexa,
 * a cor do cartão — é derivado do próprio texto pelo motor editorial (`src/lib/texto.ts`)
 * no momento de salvar. Os campos existem no banco; só não existem na tela.
 *
 * A razão é simples: um formulário longo é uma lista de tarefas antes de escrever. Quem
 * publica toda semana abandona a lista, e o site fica com metade dos campos vazios — a
 * pior versão dos dois mundos, porque o formulário continua lá atrapalhando sem que
 * ninguém colha o benefício. Melhor o site fazer o trabalho.
 *
 * **O que está escondido continua existindo.** Seção, editoria, imagem de destaque,
 * FAQ, SEO, número de edição, relacionados: os campos seguem declarados, com os dados
 * intactos, para o dia em que o acervo justificar trazê-los de volta. Apagar a
 * declaração apagaria a coluna na próxima migração.
 */
export const Textos: CollectionConfig = {
  slug: 'textos',
  typescript: { interface: 'Texto' },
  graphQL: { singularName: 'Texto', pluralName: 'Textos' },
  labels: { singular: 'Texto', plural: 'Textos' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'dataPublicacao', '_status'],
    group: 'Conteúdo',
    description: 'Tudo o que a Tanin publica.',
    livePreview: {
      url: ({ data }) => `${enderecoDoSite()}${enderecoDoTexto(data)}`,
    },
    preview: (doc) =>
      `${enderecoDoSite()}${enderecoDoTexto(doc as { secao?: string; slug?: string })}`,
    components: {
      edit: {
        beforeDocumentControls: ['@/admin/BarraDeEscrita#BarraDeEscrita'],
      },
    },
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
    /* ------------------------------------------------------------------ */
    /* O que se escreve                                                    */
    /* ------------------------------------------------------------------ */
    {
      name: 'titulo',
      type: 'text',
      label: 'Título',
      required: true,
      admin: { components: { Field: '@/admin/campos/CampoTitulo#CampoTitulo' } },
    },
    {
      name: 'subtitulo',
      type: 'textarea',
      label: 'Subtítulo',
      maxLength: 240,
      admin: { components: { Field: '@/admin/campos/CampoSubtitulo#CampoSubtitulo' } },
    },
    {
      name: 'corpo',
      type: 'richText',
      label: 'Texto',
      editor: editorTanin,
      required: true,
    },

    /* ------------------------------------------------------------------ */
    /* O que o motor preenche                                              */
    /* ------------------------------------------------------------------ */
    campoSlugOculto('textos'),
    campoIndiceBusca,
    oculto(campoResumo(false)),
    {
      name: 'capa',
      type: 'upload',
      relationTo: 'midia',
      label: 'Imagem principal',
      admin: { hidden: true, disableBulkEdit: true },
    },
    {
      name: 'palavrasChave',
      type: 'text',
      admin: { hidden: true, disableBulkEdit: true },
    },
    {
      name: 'tempoLeitura',
      type: 'number',
      admin: { hidden: true, disableBulkEdit: true },
    },
    oculto(campoChipCor),
    oculto(campoDataPublicacao),
    oculto(campoDataAtualizacao),

    /* ------------------------------------------------------------------ */
    /* Guardados: fora da tela, dentro do banco                            */
    /* ------------------------------------------------------------------ */
    {
      name: 'secao',
      type: 'select',
      label: 'Seção',
      required: true,
      defaultValue: 'materia',
      index: true,
      // As três opções continuam declaradas de propósito: elas são o enum
      // `enum_textos_secao` no Postgres. Reduzir a lista geraria um ALTER TYPE
      // derrubando valores — destrutivo contra as linhas de boletim e guia que já
      // existem. Escondido e com padrão, o campo nunca aparece e nunca bloqueia.
      options: [...OPCOES_SECAO],
      admin: { hidden: true, disableBulkEdit: true },
    },
    {
      name: 'categoria',
      type: 'select',
      label: 'Editoria',
      index: true,
      options: [...OPCOES_CATEGORIA],
      admin: { hidden: true, disableBulkEdit: true },
    },
    {
      name: 'tipoGuia',
      type: 'select',
      label: 'Tipo de guia',
      index: true,
      options: [...TIPOS_DE_GUIA],
      admin: { hidden: true, disableBulkEdit: true },
    },
    {
      name: 'nivel',
      type: 'select',
      label: 'Nível',
      options: [
        { label: 'Iniciante', value: 'iniciante' },
        { label: 'Intermediário', value: 'intermediario' },
      ],
      admin: { hidden: true, disableBulkEdit: true },
    },
    {
      name: 'numero',
      type: 'number',
      label: 'Número da edição',
      unique: true,
      index: true,
      admin: { hidden: true, disableBulkEdit: true },
      hooks: {
        // Duplicar um texto não pode carregar o número junto — ele é único.
        beforeDuplicate: [() => undefined],
      },
    },
    {
      name: 'paraLevar',
      type: 'array',
      label: 'O que levar deste guia',
      labels: { singular: 'Ponto', plural: 'Pontos' },
      admin: { hidden: true },
      fields: [{ name: 'texto', type: 'text', label: 'Ponto', required: true }],
    },
    oculto(grupoImagemDestaque),
    oculto(campoFaq),
    oculto(grupoSeo),
    {
      name: 'destaqueHome',
      type: 'checkbox',
      label: 'Candidata a manchete',
      defaultValue: false,
      admin: { hidden: true, disableBulkEdit: true },
    },
    {
      name: 'relacionados',
      type: 'relationship',
      relationTo: ['textos', 'vinhos'],
      hasMany: true,
      label: 'Relacionados',
      admin: { hidden: true, disableBulkEdit: true },
      filterOptions: ({ id, relationTo }) =>
        relationTo === 'textos' && id ? { id: { not_equals: id } } : true,
    },
    {
      name: 'urlBeehiiv',
      type: 'text',
      label: 'Endereço original no beehiiv',
      index: true,
      admin: { hidden: true, disableBulkEdit: true },
    },
    {
      name: 'importadaEm',
      type: 'date',
      label: 'Importado em',
      admin: { hidden: true, disableBulkEdit: true },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc, operation, req }) => {
        if (operation === 'update' && originalDoc?._status === 'published') {
          data.dataAtualizacao = new Date().toISOString()
        }

        const corpo = data.corpo ?? originalDoc?.corpo
        const titulo = data.titulo ?? originalDoc?.titulo
        const subtitulo = data.subtitulo ?? originalDoc?.subtitulo

        // Uma varredura da árvore do texto por salvamento, e não uma por valor
        // derivado. O gancho roda a cada segundo e meio enquanto a pessoa digita.
        const leitura = lerCorpo(corpo)

        data.tempoLeitura = Math.max(1, Math.round(leitura.palavras / 200))
        data.capa = leitura.capa ?? null
        data.palavrasChave = derivarPalavrasChave(leitura)

        /**
         * A numeração do boletim é automática: ao publicar uma edição sem número,
         * ela recebe o maior existente + 1. Continua aqui, inerte, porque nada mais
         * é gravado como boletim pelo painel — só a importação do beehiiv, que manda
         * o número explícito.
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
          data.numero = Number(ultimo.docs[0]?.numero ?? 0) + 1
        }

        // A cor do cartão sai do endereço: determinística, então o mesmo texto tem
        // sempre a mesma faixa da escala. Edição do boletim mantém a cor da numeração,
        // que é o que faz a fita cromática do arquivo crescer percorrendo a régua.
        if (data?.secao === 'boletim' && typeof data.numero === 'number') {
          data.chipCor = ESCALA_CROMATICA[(data.numero - 1) % ESCALA_CROMATICA.length].id
        } else {
          data.chipCor = derivarChipCor(data.slug ?? originalDoc?.slug)
        }

        // O índice de busca inclui o corpo inteiro. Antes só via título, subtítulo e
        // resumo — uma uva citada no quinto parágrafo não era encontrável.
        const resumo = data.resumo || trechoDeLeitura(leitura)
        data.indiceBusca = montarIndiceBusca([titulo, subtitulo, resumo, leitura.texto])

        return data
      },
    ],
    ...ganchosDeRevalidacaoPorSecao(),
  },
}
