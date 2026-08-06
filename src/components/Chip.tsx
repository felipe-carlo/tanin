import { ESCALA_CROMATICA, faixaPorId, numeroFaixa, varCor } from '@/lib/escala-cores'

/**
 * O chip da escala cromática.
 *
 * Um círculo de 1px de borda, sem sombra. A cor é dado, não enfeite: quem vê o chip
 * sabe de que família de vinho o conteúdo trata antes de ler o título.
 */
export function Chip({
  cor,
  tamanho = 'medio',
  titulo,
}: {
  cor?: string | null
  tamanho?: 'pequeno' | 'medio' | 'grande'
  titulo?: string
}) {
  const faixa = faixaPorId(cor)
  const lados = { pequeno: '0.5rem', medio: '0.65rem', grande: '0.9rem' }[tamanho]
  return (
    <span
      className="chip"
      style={{ backgroundColor: faixa.hex, width: lados, height: lados }}
      title={titulo ?? faixa.nome}
      aria-hidden="true"
    />
  )
}

/** Chip com o nome da faixa ao lado — usado nas fichas e na página de estilo. */
export function ChipNomeado({ cor, className = '' }: { cor?: string | null; className?: string }) {
  const faixa = faixaPorId(cor)
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Chip cor={cor} />
      <span className="rotulo text-grafite">{faixa.nome}</span>
    </span>
  )
}

/**
 * Injeta a escala inteira como variáveis CSS.
 *
 * Fica no layout, uma vez só. Assim a régua de cores existe em um lugar só — o
 * arquivo TypeScript — e o CSS a consome sem risco de os dois se desencontrarem.
 */
export function EstilosDaEscala() {
  const linhas = ESCALA_CROMATICA.map(
    (faixa) =>
      `${varCor(faixa)}:${faixa.hex};--cor-vinho-${numeroFaixa(faixa.numero)}-contraste:${faixa.contraste};`,
  ).join('')
  return <style>{`:root{${linhas}}`}</style>
}
