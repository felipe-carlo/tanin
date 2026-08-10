import Link from 'next/link'

import { ESCALA_CROMATICA } from '@/lib/escala-cores'
import { NOMES_DE_REDE, obterConfiguracoes } from '@/lib/site'

const SECOES = [
  {
    titulo: 'Ler',
    itens: [
      { rotulo: 'Todos os textos', endereco: '/materias' },
      { rotulo: 'Fichas de vinho', endereco: '/vinhos' },
    ],
  },
  {
    titulo: 'Boletim',
    itens: [
      { rotulo: 'Assinar', endereco: '/#assinar' },
      { rotulo: 'RSS', endereco: '/rss.xml' },
    ],
  },
  {
    titulo: 'Tanin',
    itens: [
      { rotulo: 'Sobre', endereco: '/sobre' },
      { rotulo: 'Buscar', endereco: '/busca' },
      { rotulo: 'Como avaliamos', endereco: '/sobre#como-avaliamos' },
    ],
  },
]

export async function Rodape() {
  const config = await obterConfiguracoes()
  const ano = new Date().getFullYear()

  return (
    <footer className="mt-24 border-t border-tinta sem-impressao">
      {/* A escala cromática inteira como fio de rodapé — a assinatura visual do portal
          fecha a página do mesmo jeito que a abre. */}
      <div className="flex h-1.5 w-full" aria-hidden="true">
        {ESCALA_CROMATICA.map((faixa) => (
          <span key={faixa.id} className="flex-1" style={{ backgroundColor: faixa.hex }} />
        ))}
      </div>

      <div className="caixa py-14 md:py-20">
        <div className="grade">
          <div className="col-span-6 lg:col-span-5">
            <p
              className="font-[family-name:var(--font-display)] text-t1 leading-none tracking-[-0.04em]"
              style={{ fontVariationSettings: "'SOFT' 20, 'WONK' 1", fontWeight: 500 }}
            >
              {config.nomeSite ?? 'Tanin'}
            </p>
            <p className="mt-4 max-w-md text-apoio leading-relaxed text-grafite bonito">
              {config.rodapeTexto ??
                config.descricao ??
                'Uma publicação independente sobre vinho, escrita para quem bebe — e não para quem vende.'}
            </p>

            {config.redes && config.redes.length > 0 && (
              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
                {config.redes.map((rede) => (
                  <li key={rede.id ?? rede.url}>
                    <a
                      href={rede.url}
                      className="rotulo text-grafite transition-colors hover:text-borra"
                      rel="me noopener"
                      target="_blank"
                    >
                      {NOMES_DE_REDE[rede.rede] ?? rede.rede}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="col-span-6 lg:col-span-6 lg:col-start-7">
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
              {SECOES.map((secao) => (
                <nav key={secao.titulo} aria-label={secao.titulo}>
                  <h2 className="rotulo border-b border-fio pb-3 text-grafite">{secao.titulo}</h2>
                  <ul className="mt-4 space-y-2.5">
                    {secao.itens.map((item) => (
                      <li key={item.endereco}>
                        <Link
                          href={item.endereco}
                          className="text-apoio transition-colors hover:text-borra"
                        >
                          {item.rotulo}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-fio pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="rotulo text-grafite">
            © {ano} {config.nomeSite ?? 'Tanin'} · Todo o conteúdo é aberto
          </p>
          <p className="rotulo text-grafite">
            Beba com moderação · Venda proibida para menores de 18 anos
          </p>
        </div>
      </div>
    </footer>
  )
}
