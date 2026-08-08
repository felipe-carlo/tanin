import Link from 'next/link'
import type { Metadata } from 'next'

import { CampoDeBusca } from '@/components/CampoDeBusca'
import { LinhaMateria } from '@/components/CartaoMateria'
import { listarTextos } from '@/lib/consultas'
import type { Texto } from '@/payload-types'

/**
 * Sem este bloco, o 404 herda do layout raiz `canonical: '/'` e `index, follow` — ou
 * seja, sai dizendo ao buscador que esta página é a capa e que vale indexá-la, bem ao
 * lado do `noindex` que o Next injeta na resposta 404. Sinal contraditório apontando
 * para a página mais importante do portal: `alternates: null` apaga a canônica e o
 * `robots` daqui substitui o do layout.
 */
export const metadata: Metadata = {
  title: 'Página não encontrada',
  alternates: null,
  robots: { index: false, follow: true },
}

const CAMINHOS = [
  { rotulo: 'Página inicial', endereco: '/', nota: 'A capa de hoje' },
  { rotulo: 'Matérias', endereco: '/materias', nota: 'Tudo que já publicamos' },
  { rotulo: 'Guias', endereco: '/guias', nota: 'O conteúdo que não vence' },
  { rotulo: 'Vinhos', endereco: '/vinhos', nota: 'As fichas de degustação' },
  { rotulo: 'Busca', endereco: '/busca', nota: 'Procurar no acervo inteiro' },
]

export default async function NaoEncontrada() {
  // Um 404 não pode depender do banco: se o banco cair, esta é justamente a página
  // que todo mundo vai ver. Sem as matérias recentes ela continua de pé.
  const recentes: Texto[] = await listarTextos({ secao: 'materia', limite: 3 })
    .then((lista) => lista.docs)
    .catch(() => [])

  return (
    <div className="caixa pb-24 pt-14 md:pt-20">
      <div className="grade items-start">
        <div className="col-span-6 lg:col-span-7">
          <p className="cartaz text-borra">
            <span className="apenas-leitor">Erro </span>404
          </p>

          <h1
            className="mt-6 max-w-xl text-t1 tracking-[-0.032em] equilibrado"
            style={{ fontVariationSettings: "'SOFT' 22, 'WONK' 1", fontWeight: 500 }}
          >
            Esta página não está na adega.
          </h1>

          <p className="mt-6 max-w-lg text-corpo-grande leading-snug text-grafite bonito">
            Ou o endereço veio com uma letra trocada, ou o texto que morava aqui mudou de
            lugar. As duas coisas acontecem, e nenhuma delas é culpa sua.
          </p>

          <nav aria-label="Caminhos de volta" className="mt-12 border-t border-tinta">
            <ul>
              {CAMINHOS.map((caminho) => (
                <li key={caminho.endereco} className="border-b border-fio">
                  <Link
                    href={caminho.endereco}
                    className="group flex min-h-11 items-baseline justify-between gap-4 py-3.5"
                  >
                    <span className="rotulo transition-colors group-hover:text-borra">
                      {caminho.rotulo}
                    </span>
                    <span className="text-miudo text-grafite">{caminho.nota}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 max-w-lg">
            <CampoDeBusca />
          </div>
        </div>

        {recentes.length > 0 && (
          <aside className="col-span-6 lg:col-span-4 lg:col-start-9">
            <h2 className="rotulo border-b border-tinta pb-3">Publicado agora há pouco</h2>
            <div className="mt-1">
              {recentes.map((materia) => (
                <LinhaMateria key={materia.id} conteudo={materia} />
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
