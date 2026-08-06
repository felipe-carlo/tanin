import Link from 'next/link'

import { ESCALA_CROMATICA, faixaPorId } from '@/lib/escala-cores'
import { OPCOES_CORPO, OPCOES_PRECO, OPCOES_TIPO, rotuloPreco, rotuloTipo } from '@/lib/vinho'
import type { ParametrosDeBusca } from '@/lib/payload'

/**
 * Monta o endereço que liga ou desliga um valor de filtro.
 *
 * Os filtros são links de verdade, não botões com JavaScript. Isso tem três
 * consequências boas: cada recorte tem endereço próprio e pode ser mandado por
 * WhatsApp; o buscador consegue percorrer as combinações; e a página funciona antes de
 * qualquer script carregar — o que importa muito num celular em rede ruim.
 */
function alternar(
  parametros: ParametrosDeBusca,
  chave: string,
  valor: string,
): string {
  const busca = new URLSearchParams()

  Object.entries(parametros).forEach(([nome, bruto]) => {
    if (nome === 'pagina' || bruto === undefined) return
    const lista = Array.isArray(bruto) ? bruto : [bruto]
    lista.flatMap((item) => item.split(',')).filter(Boolean).forEach((item) => {
      if (nome === chave && item === valor) return // é este que estamos removendo
      busca.append(nome, item)
    })
  })

  const jaAtivo = (() => {
    const bruto = parametros[chave]
    if (!bruto) return false
    const lista = Array.isArray(bruto) ? bruto : [bruto]
    return lista.flatMap((item) => item.split(',')).includes(valor)
  })()

  if (!jaAtivo) busca.append(chave, valor)

  const consulta = busca.toString()
  return consulta ? `/vinhos?${consulta}` : '/vinhos'
}

const estaAtivo = (parametros: ParametrosDeBusca, chave: string, valor: string): boolean => {
  const bruto = parametros[chave]
  if (!bruto) return false
  const lista = Array.isArray(bruto) ? bruto : [bruto]
  return lista.flatMap((item) => item.split(',')).includes(valor)
}

function GrupoDeFiltro({
  titulo,
  children,
  abertoPorPadrao = true,
}: {
  titulo: string
  children: React.ReactNode
  abertoPorPadrao?: boolean
}) {
  return (
    <details open={abertoPorPadrao} className="group border-b border-fio py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
        <h3 className="rotulo">{titulo}</h3>
        <span
          aria-hidden="true"
          className="text-grafite transition-transform duration-300 group-open:rotate-45"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.2">
            <path d="M6 1v10M1 6h10" strokeLinecap="round" />
          </svg>
        </span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  )
}

function Opcao({
  endereco,
  ativo,
  children,
}: {
  endereco: string
  ativo: boolean
  children: React.ReactNode
}) {
  return (
    // `aria-pressed` valeria num botão. Estes são links de verdade — cada filtro tem
    // endereço próprio — e o estado de um link se anuncia com `aria-current`.
    <Link
      href={endereco}
      scroll={false}
      aria-current={ativo ? 'true' : undefined}
      className={`flex min-h-11 items-center gap-2.5 py-1.5 text-apoio transition-colors ${
        ativo ? 'text-borra' : 'text-grafite hover:text-tinta'
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-4 w-4 flex-none items-center justify-center border ${
          ativo ? 'border-borra bg-borra' : 'border-fio-forte'
        }`}
      >
        {ativo && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="var(--color-papel)" strokeWidth="1.6">
            <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="min-w-0">{children}</span>
    </Link>
  )
}

export function FiltrosDeVinho({
  parametros,
  opcoes,
}: {
  parametros: ParametrosDeBusca
  opcoes: {
    paises: string[]
    tipos: string[]
    precos: string[]
    cores: string[]
    uvas: { slug: string; nome: string }[]
  }
}) {
  return (
    <div>
      {opcoes.tipos.length > 0 && (
        <GrupoDeFiltro titulo="Tipo">
          <ul>
            {OPCOES_TIPO.filter((tipo) => opcoes.tipos.includes(tipo.value)).map((tipo) => (
              <li key={tipo.value}>
                <Opcao
                  endereco={alternar(parametros, 'tipo', tipo.value)}
                  ativo={estaAtivo(parametros, 'tipo', tipo.value)}
                >
                  {tipo.label}
                </Opcao>
              </li>
            ))}
          </ul>
        </GrupoDeFiltro>
      )}

      {opcoes.cores.length > 0 && (
        <GrupoDeFiltro titulo="Cor na taça">
          <ul>
            {ESCALA_CROMATICA.filter((faixa) => opcoes.cores.includes(faixa.id)).map((faixa) => (
              <li key={faixa.id}>
                <Opcao
                  endereco={alternar(parametros, 'cor', faixa.id)}
                  ativo={estaAtivo(parametros, 'cor', faixa.id)}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="chip"
                      style={{ backgroundColor: faixa.hex }}
                      aria-hidden="true"
                    />
                    {faixa.nome}
                  </span>
                </Opcao>
              </li>
            ))}
          </ul>
        </GrupoDeFiltro>
      )}

      {opcoes.paises.length > 0 && (
        <GrupoDeFiltro titulo="País">
          <ul>
            {opcoes.paises.map((pais) => (
              <li key={pais}>
                <Opcao
                  endereco={alternar(parametros, 'pais', pais)}
                  ativo={estaAtivo(parametros, 'pais', pais)}
                >
                  {pais}
                </Opcao>
              </li>
            ))}
          </ul>
        </GrupoDeFiltro>
      )}

      {opcoes.uvas.length > 0 && (
        <GrupoDeFiltro titulo="Uva" abertoPorPadrao={false}>
          <ul className="max-h-72 overflow-y-auto pr-2">
            {opcoes.uvas.map((uva) => (
              <li key={uva.slug}>
                <Opcao
                  endereco={alternar(parametros, 'uva', uva.slug)}
                  ativo={estaAtivo(parametros, 'uva', uva.slug)}
                >
                  {uva.nome}
                </Opcao>
              </li>
            ))}
          </ul>
        </GrupoDeFiltro>
      )}

      {opcoes.precos.length > 0 && (
        <GrupoDeFiltro titulo="Faixa de preço">
          <ul>
            {OPCOES_PRECO.filter((preco) => opcoes.precos.includes(preco.value)).map((preco) => (
              <li key={preco.value}>
                <Opcao
                  endereco={alternar(parametros, 'preco', preco.value)}
                  ativo={estaAtivo(parametros, 'preco', preco.value)}
                >
                  {preco.label}
                </Opcao>
              </li>
            ))}
          </ul>
        </GrupoDeFiltro>
      )}

      <GrupoDeFiltro titulo="Corpo" abertoPorPadrao={false}>
        <ul>
          {OPCOES_CORPO.map((corpo) => (
            <li key={corpo.value}>
              <Opcao
                endereco={alternar(parametros, 'corpo', corpo.value)}
                ativo={estaAtivo(parametros, 'corpo', corpo.value)}
              >
                {corpo.label}
              </Opcao>
            </li>
          ))}
        </ul>
      </GrupoDeFiltro>
    </div>
  )
}

/** Etiquetas dos filtros ligados, cada uma removível com um clique. */
export function FiltrosAtivos({ parametros }: { parametros: ParametrosDeBusca }) {
  const rotulos: Record<string, (valor: string) => string> = {
    tipo: (valor) => rotuloTipo(valor) ?? valor,
    preco: (valor) => rotuloPreco(valor) ?? valor,
    cor: (valor) => faixaPorId(valor).nome,
    pais: (valor) => valor,
    uva: (valor) => valor.replace(/-/g, ' '),
    corpo: (valor) => valor.charAt(0).toUpperCase() + valor.slice(1),
  }

  const ativos = Object.entries(parametros).flatMap(([chave, bruto]) => {
    if (!(chave in rotulos) || !bruto) return []
    const lista = Array.isArray(bruto) ? bruto : [bruto]
    return lista
      .flatMap((item) => item.split(','))
      .filter(Boolean)
      .map((valor) => ({ chave, valor }))
  })

  if (ativos.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rotulo text-grafite">Filtrando por</span>
      {ativos.map(({ chave, valor }) => (
        <Link
          key={`${chave}-${valor}`}
          href={alternar(parametros, chave, valor)}
          scroll={false}
          className="rotulo inline-flex min-h-9 items-center gap-2 border border-tinta px-3 transition-colors hover:bg-tinta hover:text-papel"
        >
          {rotulos[chave](valor)}
          <span aria-hidden="true">×</span>
          <span className="apenas-leitor">remover filtro</span>
        </Link>
      ))}
      <Link href="/vinhos" className="rotulo min-h-9 px-2 text-borra hover:underline">
        limpar tudo
      </Link>
    </div>
  )
}
