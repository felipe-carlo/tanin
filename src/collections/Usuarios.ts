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
    group: 'Bastidores',
    description: 'Quem pode entrar no painel. Não confunda com a ficha pública da autora, que mora em Configurações.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: ({ req }) => req.user?.papel === 'administrador',
    // Cada pessoa pode editar a própria conta — trocar a senha, corrigir o nome.
    // O que ela NÃO pode é mudar o próprio papel; isso está trancado no campo.
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
      /**
       * Só administrador mexe em papel.
       *
       * Sem esta trava, a separação entre os dois papéis seria decorativa: como toda
       * pessoa pode editar a própria conta (para trocar a senha), um editor abriria o
       * próprio cadastro e se promoveria a administrador em dois cliques.
       */
      access: {
        create: ({ req }) => req.user?.papel === 'administrador',
        update: ({ req }) => req.user?.papel === 'administrador',
      },
      admin: {
        description:
          'Administrador mexe em tudo, inclusive em usuários. Editor escreve e publica conteúdo.',
      },
    },
  ],
  hooks: {
    beforeChange: [
      /**
       * A primeira pessoa a entrar no painel é administradora, sempre.
       *
       * O formulário de primeiro acesso do Payload usa o valor padrão do campo, que é
       * "editor" — e o resultado seria absurdo: a dona do site sem permissão para criar
       * usuários nem apagar conteúdo, no próprio site, e sem ninguém acima dela para
       * corrigir isso. Ninguém deveria precisar saber disso para começar.
       */
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data

        const existentes = await req.payload.count({
          collection: 'usuarios',
          overrideAccess: true,
        })

        if (existentes.totalDocs === 0) data.papel = 'administrador'
        return data
      },
    ],
  },
}
