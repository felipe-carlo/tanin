'use client'

import { useField } from '@payloadcms/ui'
import type { TextareaFieldClientProps } from 'payload'

import { AreaQueCresce } from './AreaQueCresce'

/**
 * A linha fina, logo abaixo do título.
 *
 * Opcional, e o placeholder diz isso — um campo sem rótulo e sem asterisco não tem
 * outro jeito de contar se é obrigatório. `Enter` desce para o texto.
 */
export const CampoSubtitulo = ({ path }: TextareaFieldClientProps) => {
  const { setValue, value } = useField<string>({ path })

  return (
    <AreaQueCresce
      aoConfirmar=".rich-text-lexical [contenteditable='true']"
      aoMudar={setValue}
      className="tanin-subtitulo"
      marcador="subtitulo"
      placeholder="Subtítulo — opcional"
      rotulo="Subtítulo do texto"
      valor={value}
    />
  )
}
