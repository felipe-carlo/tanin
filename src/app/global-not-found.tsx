import Link from 'next/link'
import type { Metadata, Viewport } from 'next'

import { classesDeFonte } from '@/lib/fontes'
import { EstilosDaEscala } from '@/components/Chip'

import './(site)/globais.css'

/**
 * O 404 de endereço que não existe em rota nenhuma.
 *
 * Sem este arquivo, quem digita um endereço torto recebe a página branca padrão do
 * Next — em inglês, com a tipografia do sistema e nenhuma saída. Como o portal não tem
 * um layout raiz (o site e o painel têm cada um o seu), este é o único lugar onde dá
 * para desenhar essa página; por isso ele traz o `<html>` inteiro.
 *
 * Não consulta o banco de propósito: um 404 precisa funcionar até quando o banco é a
 * própria razão do erro.
 */

export const metadata: Metadata = {
  title: 'Página não encontrada · Tanin',
  description: 'O endereço que você procurou não existe neste portal.',
  robots: { index: false, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#FAF8F5',
  colorScheme: 'light',
}

const CAMINHOS = [
  { rotulo: 'Matérias', endereco: '/materias', nota: 'Reportagens, ensaios e entrevistas' },
  { rotulo: 'Boletim', endereco: '/boletim', nota: 'O arquivo de todas as edições' },
  { rotulo: 'Vinhos', endereco: '/vinhos', nota: 'As fichas, com nota e faixa de preço' },
  { rotulo: 'Guias', endereco: '/guias', nota: 'Uvas, regiões, harmonização e serviço' },
]

export default function PaginaInexistente() {
  return (
    <html lang="pt-BR" className={classesDeFonte}>
      <head>
        <EstilosDaEscala />
      </head>
      <body className="flex min-h-dvh flex-col bg-papel text-tinta antialiased">
        <main className="caixa flex flex-1 flex-col justify-center py-20">
          <div className="grade items-end border-b border-tinta pb-10">
            <p className="col-span-6 cartaz text-borra lg:col-span-3" aria-hidden="true">
              404
            </p>
            <div className="col-span-6 lg:col-span-7 lg:col-start-5">
              <h1
                className="text-t1 tracking-[-0.032em] equilibrado"
                style={{ fontVariationSettings: "'SOFT' 22, 'WONK' 1", fontWeight: 500 }}
              >
                Esta página não existe
              </h1>
              <p className="mt-5 max-w-xl text-corpo-grande leading-snug text-grafite bonito">
                Ou o endereço veio errado, ou o conteúdo mudou de lugar. As duas coisas
                acontecem — e nenhuma delas é culpa sua.
              </p>
            </div>
          </div>

          <nav aria-label="Por onde continuar" className="mt-12">
            <h2 className="rotulo text-grafite">Por onde continuar</h2>
            <ul className="grade mt-6">
              {CAMINHOS.map((caminho) => (
                <li key={caminho.endereco} className="col-span-6 lg:col-span-3">
                  <Link
                    href={caminho.endereco}
                    className="group flex h-full flex-col border-t border-tinta pt-4"
                  >
                    <span className="link-titulo text-t4 leading-snug">{caminho.rotulo}</span>
                    <span className="mt-2 text-apoio leading-relaxed text-grafite bonito">
                      {caminho.nota}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/" className="botao">
                Voltar ao início
              </Link>
              <Link href="/busca" className="rotulo text-grafite transition-colors hover:text-borra">
                Buscar no portal <span aria-hidden="true">→</span>
              </Link>
            </p>
          </nav>
        </main>
      </body>
    </html>
  )
}
