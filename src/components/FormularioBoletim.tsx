'use client'

import { useActionState, useId } from 'react'
import { useFormStatus } from 'react-dom'

import { assinarBoletim, type EstadoInscricao } from '@/app/(site)/acoes'

const INICIAL: EstadoInscricao = { status: 'ocioso' }

function BotaoEnviar({ rotulo }: { rotulo: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="botao whitespace-nowrap" disabled={pending}>
      {pending ? 'Enviando…' : rotulo}
    </button>
  )
}

/**
 * Formulário de inscrição — nativo do site, não um iframe do beehiiv.
 *
 * O embed do beehiiv resolveria em uma linha e traria três problemas: não dá para
 * estilizar, não é indexável e coloca um domínio de terceiro no meio do carregamento
 * da página. Este aqui é HTML nosso, com o design do portal, e conversa com o beehiiv
 * pelo servidor.
 */
export function FormularioBoletim({
  origem = 'portal',
  rotuloBotao = 'Assinar',
  compacto = false,
}: {
  origem?: string
  rotuloBotao?: string
  compacto?: boolean
}) {
  const [estado, acao] = useActionState(assinarBoletim, INICIAL)
  const idEmail = useId()
  const idNome = useId()
  const idAviso = useId()

  if (estado.status === 'sucesso') {
    return (
      <p
        className="flex items-baseline gap-3 border-t border-current/25 pt-5 font-[family-name:var(--font-display)] text-t4"
        role="status"
      >
        <span aria-hidden="true">—</span>
        {estado.mensagem}
      </p>
    )
  }

  return (
    <form action={acao} className="w-full" noValidate>
      <input type="hidden" name="origem" value={origem} />

      {/* Armadilha para robôs: gente não vê, robô preenche. */}
      <div aria-hidden="true" className="apenas-leitor">
        <label htmlFor={`${idNome}-sobrenome`}>Não preencha este campo</label>
        <input
          id={`${idNome}-sobrenome`}
          type="text"
          name="sobrenome"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className={compacto ? 'flex flex-col gap-3 sm:flex-row sm:items-end' : 'grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end'}>
        {!compacto && (
          <div className="sm:col-span-2">
            <label htmlFor={idNome} className="rotulo block pb-1">
              Nome <span className="normal-case tracking-normal opacity-60">(opcional)</span>
            </label>
            <input id={idNome} name="nome" type="text" autoComplete="given-name" className="campo" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <label htmlFor={idEmail} className="rotulo block pb-1">
            Seu e-mail
          </label>
          <input
            id={idEmail}
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="voce@exemplo.com"
            className="campo"
            aria-describedby={estado.status === 'erro' ? idAviso : undefined}
            aria-invalid={estado.status === 'erro' || undefined}
          />
        </div>

        <BotaoEnviar rotulo={rotuloBotao} />
      </div>

      {estado.status === 'erro' && (
        <p id={idAviso} role="alert" className="mt-3 text-apoio text-borra">
          {estado.mensagem}
        </p>
      )}

      <p className="mt-4 text-miudo leading-relaxed opacity-70">
        Uma carta por semana. Sem spam, sem publieditorial disfarçado, e você sai quando
        quiser com um clique.
      </p>
    </form>
  )
}
