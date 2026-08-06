'use client'

import { useEffect } from 'react'

/**
 * A última rede de proteção.
 *
 * O `error.tsx` de cada seção não captura erro lançado pelo layout que está acima
 * dele — é uma regra do Next, não uma escolha nossa. Se o layout do site quebrar (por
 * exemplo, se o banco cair no meio da leitura das configurações), quem responde é este
 * arquivo, e por isso ele precisa carregar o `<html>` inteiro e não depender de nada.
 *
 * Nenhum estilo externo, nenhuma fonte, nenhuma consulta: se a página chegou até aqui,
 * é porque alguma dessas coisas já falhou.
 */
export default function ErroGlobal({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // O leitor não precisa ver a mensagem técnica; quem cuida do site, sim.
    console.error('[tanin] falha no layout raiz', error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FAF8F5',
          color: '#14110F',
          fontFamily: 'Georgia, "Times New Roman", serif',
          padding: '2rem',
        }}
      >
        <main style={{ maxWidth: '34rem' }}>
          <p
            style={{
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              fontSize: '0.6875rem',
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#6B2130',
              margin: 0,
            }}
          >
            Erro inesperado
          </p>
          <h1
            style={{
              fontSize: 'clamp(1.75rem, 1.2rem + 2vw, 2.75rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              fontWeight: 500,
              margin: '1rem 0 0',
            }}
          >
            Alguma coisa saiu do lugar
          </h1>
          <p style={{ fontSize: '1.0625rem', lineHeight: 1.6, color: '#4A4744', marginTop: '1.25rem' }}>
            O portal não conseguiu montar esta página. Já registramos o que aconteceu.
            Tente de novo — e, se insistir, volte daqui a pouco.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={reset}
              style={{
                fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '0.9rem 1.6rem',
                border: '1px solid #14110F',
                backgroundColor: '#14110F',
                color: '#FAF8F5',
                cursor: 'pointer',
              }}
            >
              Tentar de novo
            </button>
            <a
              href="/"
              style={{
                fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                fontSize: '0.6875rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '0.9rem 1.6rem',
                border: '1px solid #14110F',
                color: '#14110F',
                textDecoration: 'none',
              }}
            >
              Voltar ao início
            </a>
          </div>

          {error.digest && (
            <p
              style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: '0.75rem',
                color: '#8A857D',
                marginTop: '2.5rem',
              }}
            >
              Código da ocorrência: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  )
}
