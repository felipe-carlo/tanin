import type { Access, Where } from 'payload'

/**
 * Leitura pública de conteúdo publicado.
 *
 * Quem está logado no /admin enxerga rascunhos e conteúdo agendado; qualquer outra
 * pessoa (e qualquer robô) só enxerga o que já está publicado. É o que garante os
 * dois princípios ao mesmo tempo: nada de paywall, e nada de rascunho vazando.
 */
export const lerPublicados: Access = ({ req }) => {
  if (req.user) return true
  const condicao: Where = {
    and: [
      { _status: { equals: 'published' } },
      {
        or: [
          { dataPublicacao: { less_than_equal: new Date().toISOString() } },
          { dataPublicacao: { exists: false } },
        ],
      },
    ],
  }
  return condicao
}

/** Leitura pública sem controle de agendamento (coleções sem data de publicação). */
export const lerPublicadosSemData: Access = ({ req }) => {
  if (req.user) return true
  const condicao: Where = { _status: { equals: 'published' } }
  return condicao
}

export const autenticado: Access = ({ req }) => Boolean(req.user)

export const somenteAdministrador: Access = ({ req }) => req.user?.papel === 'administrador'
