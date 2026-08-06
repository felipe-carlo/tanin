import Image from 'next/image'

import type { Midia } from '@/payload-types'

export type ReferenciaDeMidia = number | Midia | null | undefined

/** Descarta a referência numérica: só serve o documento já populado. */
export const comoMidia = (valor: ReferenciaDeMidia): Midia | null =>
  valor && typeof valor === 'object' ? valor : null

type NomeDeTamanho = 'miniatura' | 'cartao' | 'quadrado' | 'retrato' | 'largura' | 'compartilhamento'

/** Endereço de uma versão específica da imagem, caindo no original quando não existir. */
export const urlDaMidia = (valor: ReferenciaDeMidia, tamanho?: NomeDeTamanho): string | null => {
  const midia = comoMidia(valor)
  if (!midia) return null
  if (tamanho) {
    const versao = midia.sizes?.[tamanho]
    if (versao?.url) return versao.url
  }
  return midia.url ?? null
}

/**
 * Imagem do portal.
 *
 * Encapsula o `next/image` para que nenhuma página precise saber como o Payload
 * guarda os tamanhos. `sizes` é obrigatório de propósito: sem ele o navegador baixa
 * a versão maior do que precisa, que é o jeito mais fácil de destruir o LCP no celular.
 */
export function Imagem({
  midia,
  tamanho,
  sizes,
  className = '',
  prioridade = false,
  proporcao,
}: {
  midia: ReferenciaDeMidia
  tamanho?: NomeDeTamanho
  sizes: string
  className?: string
  prioridade?: boolean
  /** Proporção forçada, ex.: '3 / 2'. Sem ela, a imagem mantém a proporção original. */
  proporcao?: string
}) {
  const doc = comoMidia(midia)
  const url = urlDaMidia(midia, tamanho)
  if (!doc || !url) return null

  const versao = tamanho ? doc.sizes?.[tamanho] : undefined
  const largura = versao?.width ?? doc.width ?? 1600
  const altura = versao?.height ?? doc.height ?? 1067

  return (
    <Image
      src={url}
      alt={doc.alt ?? ''}
      width={largura}
      height={altura}
      sizes={sizes}
      priority={prioridade}
      className={className}
      style={proporcao ? { aspectRatio: proporcao, objectFit: 'cover', width: '100%' } : undefined}
    />
  )
}

/**
 * Imagem com legenda e crédito, em `<figure>`/`<figcaption>` de verdade.
 * Jornalismo se faz creditando — e o HTML semântico é o que faz o crédito ser lido
 * por buscadores e leitores de tela.
 */
export function Figura({
  midia,
  legenda,
  credito,
  tamanho = 'largura',
  sizes,
  className = '',
  prioridade = false,
  proporcao,
}: {
  midia: ReferenciaDeMidia
  legenda?: string | null
  credito?: string | null
  tamanho?: NomeDeTamanho
  sizes: string
  className?: string
  prioridade?: boolean
  proporcao?: string
}) {
  const doc = comoMidia(midia)
  if (!doc) return null

  const textoLegenda = legenda ?? doc.legenda
  const textoCredito = credito ?? doc.credito

  return (
    <figure className={className}>
      <Imagem
        midia={midia}
        tamanho={tamanho}
        sizes={sizes}
        prioridade={prioridade}
        proporcao={proporcao}
        className="w-full"
      />
      {(textoLegenda || textoCredito) && (
        <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-t border-fio pt-2.5">
          {textoLegenda && (
            <span className="font-[family-name:var(--font-rotulo)] text-miudo leading-snug text-grafite">
              {textoLegenda}
            </span>
          )}
          {textoCredito && (
            <span className="rotulo text-grafite/80">{textoCredito}</span>
          )}
        </figcaption>
      )}
    </figure>
  )
}
