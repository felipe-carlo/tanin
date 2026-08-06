'use client'

import Link from 'next/link'
import { useEffect } from 'react'

const CAMINHOS = [
  { rotulo: 'Página inicial', endereco: '/' },
  { rotulo: 'Matérias', endereco: '/materias' },
  { rotulo: 'Busca', endereco: '/busca' },
]

/**
 * Erro inesperado em qualquer página do site.
 *
 * O leitor recebe uma frase e um botão; o log recebe o erro inteiro. Mostrar a
 * mensagem técnica na tela não ajuda quem está lendo e ainda entrega o desenho do
 * sistema por dentro — o `digest` basta para achar o registro do lado de cá.
 */
export default function ErroInesperado({
  error,
  reset,
  retry,
}: {
  error: Error & { digest?: string }
  reset: () => void
  retry?: () => void
}) {
  useEffect(() => {
    console.error('Erro inesperado na página:', error)
  }, [error])

  // No Next 16, `retry` refaz a consulta ao servidor; `reset` só repinta o que já
  // está em memória. Quando o erro vem do banco, repintar mostraria o mesmo erro.
  const tentarDeNovo = retry ?? reset

  return (
    <div className="caixa pb-24 pt-14 md:pt-20">
      <div className="max-w-xl">
        <p className="rotulo text-borra">Alguma coisa se quebrou</p>

        <h1
          className="mt-5 text-t1 tracking-[-0.032em] equilibrado"
          style={{ fontVariationSettings: "'SOFT' 22, 'WONK' 1", fontWeight: 500 }}
        >
          A página parou no meio da frase.
        </h1>

        <p className="mt-6 text-corpo-grande leading-snug text-grafite bonito">
          O erro é nosso, não seu, e ficou registrado do nosso lado. Quase sempre é
          passageiro: tente de novo antes de desistir da leitura.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button type="button" onClick={tentarDeNovo} className="botao min-h-11">
            Tentar de novo
          </button>
          <Link href="/" className="botao botao--vazado min-h-11">
            Voltar à capa
          </Link>
        </div>

        <nav aria-label="Outros caminhos" className="mt-12 border-t border-tinta pt-5">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {CAMINHOS.map((caminho) => (
              <li key={caminho.endereco}>
                <Link
                  href={caminho.endereco}
                  className="rotulo inline-flex min-h-11 items-center text-grafite transition-colors hover:text-borra"
                >
                  {caminho.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {error.digest && (
          <p className="rotulo mt-10 text-grafite/70">Referência {error.digest}</p>
        )}
      </div>
    </div>
  )
}
