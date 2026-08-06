import { Archivo, Fraunces, Newsreader } from 'next/font/google'

/**
 * TIPOGRAFIA DO PORTAL
 *
 * A lógica é a de uma revista impressa: uma serifada de caráter para os títulos,
 * uma serifada de leitura para o texto longo e uma grotesca só para rótulos.
 *
 * - Fraunces é variável e tem dois eixos que quase nenhuma serifada tem: SOFT
 *   (arredondamento dos terminais) e WONK (torna alguns caracteres deliberadamente
 *   tortos). É o que dá caráter editorial sem parecer template comprado.
 * - Newsreader foi desenhada para texto corrido em tela — a altura de x é generosa
 *   e o contraste é baixo o bastante para aguentar parágrafos longos.
 * - Archivo em caixa alta, corpo pequeno e entreletra larga carrega as categorias,
 *   as datas e os números de edição.
 *
 * `display: 'swap'` deixa o texto aparecer na hora, com a fonte do sistema, e trocar
 * quando a fonte chegar. Fica um instante feio e evita meio segundo de tela em branco
 * — que é o que o Google mede como LCP.
 */

export const fonteDisplay = Fraunces({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--fonte-display',
  preload: true,
})

export const fonteCorpo = Newsreader({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--fonte-corpo',
  preload: true,
})

export const fonteRotulo = Archivo({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--fonte-rotulo',
  preload: true,
})

export const classesDeFonte = [
  fonteDisplay.variable,
  fonteCorpo.variable,
  fonteRotulo.variable,
].join(' ')
