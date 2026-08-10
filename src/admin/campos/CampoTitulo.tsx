'use client'

import { useField } from '@payloadcms/ui'
import type { TextFieldClientProps } from 'payload'

import { AreaQueCresce } from './AreaQueCresce'

/**
 * O título, escrito como título — e não preenchido como campo.
 *
 * A diferença entre uma caixa de texto com rótulo "Título" em cima e uma linha grande
 * em Fraunces com um cinza claro dizendo "Título" é a diferença entre preencher um
 * formulário e começar um texto. O valor que sai daqui é o mesmo; o gesto não é.
 *
 * É um `textarea`, e não um `input`, porque título de jornalismo quebra em duas linhas
 * com frequência e o corte no meio da frase seria pior do que a altura variável.
 * `Enter` não quebra linha: leva para o subtítulo, como leva no Substack.
 */
export const CampoTitulo = ({ path }: TextFieldClientProps) => {
  const { setValue, value } = useField<string>({ path })

  return (
    <AreaQueCresce
      aoConfirmar="[data-tanin-campo='subtitulo'] textarea"
      aoMudar={setValue}
      className="tanin-titulo"
      marcador="titulo"
      placeholder="Título"
      rotulo="Título do texto"
      valor={value}
    />
  )
}
