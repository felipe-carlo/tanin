import type { Field, FieldHook } from 'payload'

/** Transforma "Champagne, o que ninguém conta" em "champagne-o-que-ninguem-conta". */
export const paraSlug = (valor: string): string =>
  valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // tira acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)

const gerarSlug =
  (campoOrigem: string): FieldHook =>
  ({ data, operation, value }) => {
    if (typeof value === 'string' && value.length > 0) return paraSlug(value)
    if (operation === 'create' || operation === 'update') {
      const origem = data?.[campoOrigem]
      if (typeof origem === 'string' && origem.length > 0) return paraSlug(origem)
    }
    return value
  }

/**
 * Campo de slug com preenchimento automático a partir do título.
 * A Ana nunca precisa digitar um slug — mas pode corrigir quando quiser.
 */
export const campoSlug = (campoOrigem = 'titulo'): Field => ({
  name: 'slug',
  type: 'text',
  label: 'Endereço da página (slug)',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description:
      'Preenchido sozinho a partir do título. Prefira slugs curtos, em português, com um tema só.',
  },
  hooks: {
    beforeValidate: [gerarSlug(campoOrigem)],
  },
})
