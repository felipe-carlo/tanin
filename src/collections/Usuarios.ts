import type { CollectionConfig } from 'payload'

export const Usuarios: CollectionConfig = {
  slug: 'usuarios',
  labels: { singular: 'Usuário', plural: 'Usuários' },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30, // 30 dias — a Ana não deveria ter de logar toda semana
    maxLoginAttempts: 8,
    lockTime: 10 * 60 * 1000,
  },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'email', 'papel'],
    group: 'Configuração',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => req.user?.papel === 'administrador',
    update: ({ req, id }) => req.user?.papel === 'administrador' || req.user?.id === id,
    delete: ({ req }) => req.user?.papel === 'administrador',
  },
  fields: [
    { name: 'nome', type: 'text', label: 'Nome', required: true },
    {
      name: 'papel',
      type: 'select',
      label: 'Papel',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Administrador', value: 'administrador' },
        { label: 'Editor', value: 'editor' },
      ],
      admin: {
        description:
          'Administrador mexe em tudo, inclusive em usuários. Editor escreve e publica conteúdo.',
      },
    },
    {
      name: 'autor',
      type: 'relationship',
      relationTo: 'autores',
      label: 'Ficha de autor',
      admin: {
        description: 'Liga este login à ficha pública de autoria, que aparece nas matérias.',
      },
    },
  ],
}
