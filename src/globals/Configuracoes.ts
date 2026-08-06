import type { GlobalConfig } from 'payload'

import { autenticado } from '@/lib/acesso'

export const Configuracoes: GlobalConfig = {
  slug: 'configuracoes',
  typescript: { interface: 'Configuracoes' },
  graphQL: { name: 'Configuracoes' },
  label: 'Configurações do site',
  admin: {
    group: 'Configuração',
    description: 'Textos e ligações que aparecem em todas as páginas.',
  },
  access: { read: () => true, update: autenticado },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Identidade',
          fields: [
            { name: 'nomeSite', type: 'text', label: 'Nome do site', defaultValue: 'Tanin' },
            {
              name: 'assinatura',
              type: 'text',
              label: 'Assinatura',
              defaultValue: 'Vinho com vagar',
              admin: { description: 'A linha curta que acompanha o nome no cabeçalho e no rodapé.' },
            },
            {
              name: 'descricao',
              type: 'textarea',
              label: 'Descrição do site',
              maxLength: 300,
              defaultValue:
                'A Tanin é uma publicação independente sobre vinho, escrita por Ana Luiza Leal para quem bebe — e não para quem vende.',
              admin: { description: 'Usada como descrição padrão quando a página não tem uma própria.' },
            },
            {
              name: 'imagemPadrao',
              type: 'upload',
              relationTo: 'midia',
              label: 'Imagem padrão de compartilhamento',
            },
            {
              name: 'autoraPrincipal',
              type: 'relationship',
              relationTo: 'autores',
              label: 'Autora principal',
              admin: { description: 'Quem assina a publicação. Alimenta a página /sobre e o schema.' },
            },
          ],
        },
        {
          label: 'Boletim',
          fields: [
            {
              name: 'boletimTitulo',
              type: 'text',
              label: 'Título do convite',
              defaultValue: 'Boletim Tanin',
            },
            {
              name: 'boletimChamada',
              type: 'textarea',
              label: 'Chamada de inscrição',
              maxLength: 300,
              defaultValue:
                'Toda semana, uma carta sobre vinho — o que vale a pena abrir, o que não vale o preço e o que ninguém está contando.',
            },
            {
              name: 'boletimPeriodicidade',
              type: 'text',
              label: 'Periodicidade',
              defaultValue: 'Semanal, às quintas',
            },
          ],
        },
        {
          label: 'Menu e rodapé',
          fields: [
            {
              name: 'menu',
              type: 'array',
              label: 'Menu principal',
              labels: { singular: 'Item', plural: 'Itens' },
              admin: { description: 'A ordem aqui é a ordem no cabeçalho. Cinco itens já é bastante.' },
              fields: [
                { name: 'rotulo', type: 'text', label: 'Rótulo', required: true },
                { name: 'endereco', type: 'text', label: 'Endereço', required: true },
              ],
            },
            {
              name: 'rodapeTexto',
              type: 'textarea',
              label: 'Texto do rodapé',
              maxLength: 400,
            },
            {
              name: 'redes',
              type: 'array',
              label: 'Redes da publicação',
              labels: { singular: 'Rede', plural: 'Redes' },
              fields: [
                {
                  name: 'rede',
                  type: 'select',
                  label: 'Rede',
                  required: true,
                  options: [
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'TikTok', value: 'tiktok' },
                    { label: 'X (Twitter)', value: 'x' },
                  ],
                },
                { name: 'url', type: 'text', label: 'Endereço', required: true },
              ],
            },
          ],
        },
        {
          label: 'Home',
          fields: [
            {
              name: 'homeChamada',
              type: 'textarea',
              label: 'Chamada da home',
              maxLength: 300,
              admin: {
                description:
                  'A frase de abertura da home. Deixe vazio para usar a descrição do site.',
              },
            },
            {
              name: 'homeDestaques',
              type: 'relationship',
              relationTo: ['materias', 'guias', 'vinhos'],
              hasMany: true,
              maxRows: 4,
              label: 'Destaques fixos',
              admin: {
                description:
                  'Opcional. Se ficar vazio, a home se monta sozinha com o conteúdo mais recente.',
              },
            },
          ],
        },
      ],
    },
  ],
}
