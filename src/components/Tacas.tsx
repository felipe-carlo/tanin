import { NOTA_MAXIMA, formatarNota, rotuloDaNota, tacasDaNota } from '@/lib/nota'

/** Silhueta de taça. `preenchimento` vai de 0 a 1 e define quanto do bojo tem vinho. */
function Taca({ preenchimento, tamanho }: { preenchimento: number; tamanho: number }) {
  const id = `taca-${Math.round(preenchimento * 100)}-${tamanho}`
  return (
    <svg
      width={tamanho}
      height={tamanho * 1.5}
      viewBox="0 0 16 24"
      fill="none"
      aria-hidden="true"
      className="flex-none"
    >
      <defs>
        <clipPath id={id}>
          <rect x="0" y={11 - 11 * preenchimento} width="16" height={11 * preenchimento + 0.5} />
        </clipPath>
      </defs>
      {/* vinho dentro do bojo */}
      {preenchimento > 0 && (
        <path
          d="M2.2 1.2h11.6c0 6-1.6 9.6-5.8 10.2C3.8 10.8 2.2 7.2 2.2 1.2Z"
          fill="var(--color-borra)"
          clipPath={`url(#${id})`}
        />
      )}
      {/* contorno da taça */}
      <path
        d="M2.2 1.2h11.6c0 6-1.6 9.6-5.8 10.2C3.8 10.8 2.2 7.2 2.2 1.2Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path d="M8 11.4v8.4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M4.4 22.4h7.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}

/**
 * A nota da Tanin, desenhada.
 *
 * Cinco taças que se enchem, com meia taça permitida. O número e o rótulo aparecem
 * escritos ao lado — quem usa leitor de tela recebe a nota em texto, e quem só bate
 * o olho entende sem ler nada.
 */
export function Tacas({
  nota,
  tamanho = 16,
  comRotulo = true,
}: {
  nota?: number | null
  tamanho?: number
  comRotulo?: boolean
}) {
  if (typeof nota !== 'number') return null
  const { cheias, meia } = tacasDaNota(nota)
  const rotulo = rotuloDaNota(nota)

  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-1 text-tenue" aria-hidden="true">
        {Array.from({ length: NOTA_MAXIMA }, (_, indice) => (
          <Taca
            key={indice}
            tamanho={tamanho}
            preenchimento={indice < cheias ? 1 : indice === cheias && meia ? 0.5 : 0}
          />
        ))}
      </span>
      {comRotulo && (
        <span className="flex items-baseline gap-2">
          <span className="font-[family-name:var(--font-display)] text-t4 leading-none">
            {formatarNota(nota)}
          </span>
          {rotulo && <span className="rotulo text-grafite">{rotulo}</span>}
        </span>
      )}
      <span className="apenas-leitor">
        Nota {formatarNota(nota)} de {NOTA_MAXIMA} taças{rotulo ? `. ${rotulo}.` : '.'}
      </span>
    </div>
  )
}

/** Versão compacta para listagens: só o número, com a régua explícita. */
export function NotaCompacta({ nota }: { nota?: number | null }) {
  if (typeof nota !== 'number') return null
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-[family-name:var(--font-display)] text-t4 leading-none">
        {formatarNota(nota)}
      </span>
      <span className="rotulo text-grafite">/{NOTA_MAXIMA}</span>
      <span className="apenas-leitor">taças</span>
    </span>
  )
}
