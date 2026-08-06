import type { CollectionConfig } from 'payload'

import { autenticado, somenteAdministrador } from '@/lib/acesso'

/**
 * Registro local de quem se inscreveu no Boletim.
 *
 * O beehiiv continua sendo a lista oficial — é ele que dispara o e-mail. Este
 * espelho existe por dois motivos práticos: se a API do beehiiv cair ou a chave não
 * estiver configurada, ninguém se perde no caminho; e a Ana consegue ver as
 * inscrições sem sair do painel.
 */
export const Inscricoes: CollectionConfig = {
  slug: 'inscricoes',
  typescript: { interface: 'Inscricao' },
  graphQL: { singularName: 'Inscricao', pluralName: 'Inscricoes' },
  labels: { singular: 'Inscrição', plural: 'Inscrições no Boletim' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'origem', 'statusBeehiiv', 'createdAt'],
    group: 'Configuração',
    description:
      'Espelho local das inscrições. A lista oficial continua no beehiiv — isto é rede de segurança.',
  },
  access: {
    read: autenticado,
    create: () => true, // criada pela rota /api/inscrever
    update: autenticado,
    delete: somenteAdministrador,
  },
  fields: [
    { name: 'email', type: 'email', label: 'E-mail', required: true, index: true, unique: true },
    { name: 'nome', type: 'text', label: 'Nome' },
    {
      name: 'origem',
      type: 'text',
      label: 'Origem',
      admin: { description: 'Qual página do site originou a inscrição.' },
    },
    {
      name: 'statusBeehiiv',
      type: 'select',
      label: 'Status no beehiiv',
      defaultValue: 'pendente',
      options: [
        { label: 'Sincronizada', value: 'sincronizada' },
        { label: 'Pendente de sincronização', value: 'pendente' },
        { label: 'Falhou', value: 'falhou' },
      ],
    },
    { name: 'erroBeehiiv', type: 'text', label: 'Detalhe do erro', admin: { readOnly: true } },
  ],
}
