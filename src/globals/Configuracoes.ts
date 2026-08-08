import type { GlobalConfig } from 'payload'

import { autenticado } from '@/lib/acesso'
import { revalidarSiteInteiro } from '@/hooks/revalidar'
import { editorTanin } from '@/fields/editor'

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
  hooks: { afterChange: [revalidarSiteInteiro] },
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
          ],
        },
        {
          label: 'Autora',
          fields: [
            {
              name: 'autora',
              type: 'group',
              label: 'Quem assina a publicação',
              admin: {
                description:
                  'A ficha pública da autora. Alimenta a página /sobre, o pé das matérias e o schema Person que buscadores e IAs leem.',
              },
              fields: [
                { name: 'nome', type: 'text', label: 'Nome', defaultValue: 'Ana Luiza Leal' },
                {
                  name: 'cargo',
                  type: 'text',
                  label: 'Como se apresenta',
                  admin: { description: 'Ex.: "Jornalista de vinho e criadora da Tanin".' },
                },
                { name: 'foto', type: 'upload', relationTo: 'midia', label: 'Foto' },
                {
                  name: 'bioCurta',
                  type: 'textarea',
                  label: 'Biografia curta',
                  maxLength: 280,
                  admin: { description: 'Uma ou duas frases. Aparece no pé das matérias.' },
                },
                {
                  name: 'bioLonga',
                  type: 'richText',
                  label: 'Biografia completa',
                  editor: editorTanin,
                  admin: { description: 'Texto completo da página /sobre.' },
                },
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
                    { name: 'link', type: 'text', label: 'Endereço (opcional)' },
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
              ],
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
              relationTo: ['textos', 'vinhos'],
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
