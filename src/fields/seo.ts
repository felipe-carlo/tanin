import type { Field } from 'payload'

/**
 * Grupo de SEO reaproveitado por todas as coleções publicáveis.
 *
 * Todos os campos são opcionais de propósito: quando estão vazios, o site cai
 * automaticamente no título, no resumo e na imagem de destaque do conteúdo.
 * A Ana só preenche quando quiser um texto diferente para o Google e para as redes.
 */
export const grupoSeo: Field = {
  name: 'seo',
  type: 'group',
  label: 'SEO e compartilhamento',
  admin: {
    description:
      'Opcional. Se ficar em branco, usamos o título, o resumo e a imagem de destaque da própria página.',
  },
  fields: [
    {
      name: 'titulo',
      type: 'text',
      label: 'Título para buscadores',
      maxLength: 70,
      admin: { description: 'Até 70 caracteres. Aparece na aba do navegador e no resultado do Google.' },
    },
    {
      name: 'descricao',
      type: 'textarea',
      label: 'Descrição para buscadores',
      maxLength: 165,
      admin: { description: 'Até 165 caracteres. É o parágrafo cinza embaixo do link no Google.' },
    },
    {
      name: 'imagem',
      type: 'upload',
      relationTo: 'midia',
      label: 'Imagem de compartilhamento',
      admin: { description: 'A imagem que aparece quando o link é colado no WhatsApp, Instagram ou X.' },
    },
    {
      name: 'palavrasChave',
      type: 'text',
      label: 'Termos que esta página quer responder',
      admin: {
        description:
          'Separe por vírgula. Não vai para a meta keywords (que morreu) — serve de guia editorial e alimenta a busca interna.',
      },
    },
    {
      name: 'naoIndexar',
      type: 'checkbox',
      label: 'Pedir para buscadores não indexarem',
      defaultValue: false,
      admin: {
        description: 'Use com muita parcimônia. O portal inteiro depende de ser encontrado.',
      },
    },
    {
      name: 'canonica',
      type: 'text',
      label: 'URL canônica externa',
      admin: {
        description:
          'Só preencha se este conteúdo foi publicado antes em outro lugar e aquele endereço deve continuar sendo o oficial.',
      },
    },
  ],
}

/** FAQ estruturado — vira `FAQPage` no JSON-LD e blocos de pergunta e resposta na página. */
export const campoFaq: Field = {
  name: 'faq',
  type: 'array',
  label: 'Perguntas frequentes',
  labels: { singular: 'Pergunta', plural: 'Perguntas' },
  admin: {
    description:
      'Cada par vira um bloco no fim da página e entra no código que o Google e as IAs leem. Responda de forma auto-contida, sem depender do resto do texto.',
    initCollapsed: true,
  },
  fields: [
    { name: 'pergunta', type: 'text', label: 'Pergunta', required: true },
    { name: 'resposta', type: 'textarea', label: 'Resposta', required: true },
  ],
}
