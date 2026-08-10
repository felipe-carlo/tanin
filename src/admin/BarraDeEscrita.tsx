'use client'

import { useDocumentInfo, useFormModified, useFormProcessing } from '@payloadcms/ui'

/**
 * O aviso de que o trabalho está guardado.
 *
 * Aparece à esquerda dos botões de salvar e publicar, no topo da tela de escrita. É a
 * única informação de estado que sobrou no editor, e ela é indispensável: numa tela
 * sem botão de "salvar" à vista — porque o Payload salva sozinho a cada segundo e meio
 * —, o medo de perder o texto é o que faz alguém parar de escrever para conferir.
 *
 * Uma frase curta em português, e não um ícone: "salvo às 14:32" responde a pergunta
 * inteira, inclusive a que vem depois ("salvo quando?").
 */
export function BarraDeEscrita() {
  const { lastUpdateTime } = useDocumentInfo()
  const alterado = useFormModified()
  const processando = useFormProcessing()

  const estado = processando
    ? 'Salvando…'
    : alterado
      ? 'Alterações não salvas'
      : lastUpdateTime
        ? `Rascunho salvo às ${horario(lastUpdateTime)}`
        : 'Rascunho novo'

  return (
    <p
      aria-live="polite"
      className="tanin-barra-escrita"
      data-estado={processando ? 'salvando' : alterado ? 'alterado' : 'salvo'}
    >
      {estado}
    </p>
  )
}

/** "14:32" — sem segundos, que só acrescentariam movimento na tela. */
const horario = (instante: number): string =>
  new Date(instante).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
