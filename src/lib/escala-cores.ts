/**
 * A ESCALA CROMÁTICA DO VINHO — o elemento assinatura do portal.
 *
 * Fonte única da verdade. É lida em três lugares:
 *   1. o CMS, para montar o seletor de "chip de cor" de cada conteúdo;
 *   2. o CSS, que gera as variáveis `--cor-vinho-01` … `--cor-vinho-14`;
 *   3. os componentes, que usam a cor como dado (chips, fita do boletim, filtros).
 *
 * A ordem não é decorativa: ela segue a taxonomia real do vinho, dos brancos mais
 * claros aos tintos mais fechados, terminando nos fortificados. Quem olha a régua
 * aprende alguma coisa — que é exatamente o ponto do sistema visual do Wine Folly.
 */

export type FamiliaVinho = 'branco' | 'laranja' | 'rose' | 'tinto' | 'fortificado'

export interface FaixaCromatica {
  /** Identificador estável usado no banco. Nunca mudar. */
  id: string
  /** Número da faixa, 1 a 14. */
  numero: number
  /** Nome da faixa em português, exibido no site e no CMS. */
  nome: string
  /** Hex da faixa. */
  hex: string
  /** Cor de texto legível sobre a faixa (contraste AA garantido). */
  contraste: string
  /** Família de vinho a que a faixa pertence. */
  familia: FamiliaVinho
  /** Frase curta que descreve a faixa — usada em tooltips e na página de estilo. */
  descricao: string
}

export const ESCALA_CROMATICA: readonly FaixaCromatica[] = [
  {
    id: 'verde-palha',
    numero: 1,
    nome: 'Verde-palha',
    hex: '#E4E9CE',
    contraste: '#14110F',
    familia: 'branco',
    descricao: 'Quase transparente, com reflexo verde. Vinho Verde, Muscadet, Albariño jovem.',
  },
  {
    id: 'palha',
    numero: 2,
    nome: 'Palha',
    hex: '#F0E3B2',
    contraste: '#14110F',
    familia: 'branco',
    descricao: 'Amarelo pálido de branco jovem sem madeira. Pinot Grigio, Vinho Verde maduro.',
  },
  {
    id: 'ouro',
    numero: 3,
    nome: 'Ouro',
    hex: '#E7C463',
    contraste: '#14110F',
    familia: 'branco',
    descricao: 'Amarelo cheio, de uva madura ou passagem por barrica. Chardonnay, Viognier.',
  },
  {
    id: 'ouro-velho',
    numero: 4,
    nome: 'Ouro-velho',
    hex: '#D3A335',
    contraste: '#14110F',
    familia: 'branco',
    descricao: 'Branco com alguns anos de garrafa ou vindima tardia. Riesling maduro, Sauternes.',
  },
  {
    id: 'ambar',
    numero: 5,
    nome: 'Âmbar',
    hex: '#B87E25',
    contraste: '#FAF8F5',
    familia: 'branco',
    descricao: 'Branco de guarda longa, já oxidativo. Jerez, brancos do Jura, colheitas antigas.',
  },
  {
    id: 'laranja',
    numero: 6,
    nome: 'Laranja',
    hex: '#C46A24',
    contraste: '#FAF8F5',
    familia: 'laranja',
    descricao: 'Uva branca fermentada com as cascas. Ribolla Gialla, Rkatsiteli, âmbar georgiano.',
  },
  {
    id: 'rosa-palido',
    numero: 7,
    nome: 'Rosa-pálido',
    hex: '#F5DCD5',
    contraste: '#14110F',
    familia: 'rose',
    descricao: 'Rosé de contato curtíssimo. Provence, o tom que virou assinatura do estilo.',
  },
  {
    id: 'salmao',
    numero: 8,
    nome: 'Salmão',
    hex: '#EDB199',
    contraste: '#14110F',
    familia: 'rose',
    descricao: 'Rosé com mais fruta e um traço alaranjado. Bandol, rosés de Pinot Noir.',
  },
  {
    id: 'cobre',
    numero: 9,
    nome: 'Cobre',
    hex: '#D2825C',
    contraste: '#14110F',
    familia: 'rose',
    descricao: 'Rosé encorpado, quase clarete. Tavel, rosés de Garnacha com maceração longa.',
  },
  {
    id: 'cereja',
    numero: 10,
    nome: 'Cereja',
    hex: '#B23A47',
    contraste: '#FAF8F5',
    familia: 'tinto',
    descricao: 'Tinto leve e translúcido. Pinot Noir, Gamay, Frappato.',
  },
  {
    id: 'rubi',
    numero: 11,
    nome: 'Rubi',
    hex: '#8D1F2D',
    contraste: '#FAF8F5',
    familia: 'tinto',
    descricao: 'O vermelho vivo do tinto de corpo médio. Sangiovese, Tempranillo, Merlot.',
  },
  {
    id: 'purpura',
    numero: 12,
    nome: 'Púrpura',
    hex: '#6B2130',
    contraste: '#FAF8F5',
    familia: 'tinto',
    descricao: 'Tinto jovem e concentrado, com borda violeta. Syrah, Malbec, Cabernet.',
  },
  {
    id: 'granada',
    numero: 13,
    nome: 'Granada',
    hex: '#451620',
    contraste: '#FAF8F5',
    familia: 'tinto',
    descricao: 'Tinto de guarda, opaco no centro. Nebbiolo maduro, Barolo, Douro de anos.',
  },
  {
    id: 'tawny',
    numero: 14,
    nome: 'Tawny',
    hex: '#8A4A24',
    contraste: '#FAF8F5',
    familia: 'fortificado',
    descricao: 'O tijolo dos fortificados envelhecidos. Porto Tawny, Madeira, Marsala.',
  },
] as const

export const NOMES_FAMILIA: Record<FamiliaVinho, string> = {
  branco: 'Brancos',
  laranja: 'Laranjas',
  rose: 'Rosés',
  tinto: 'Tintos',
  fortificado: 'Fortificados',
}

/** Formata o número da faixa como token CSS: 1 → "01". */
export const numeroFaixa = (numero: number): string => String(numero).padStart(2, '0')

/** Nome da variável CSS de uma faixa. */
export const varCor = (faixa: FaixaCromatica): string => `--cor-vinho-${numeroFaixa(faixa.numero)}`

const porId = new Map(ESCALA_CROMATICA.map((faixa) => [faixa.id, faixa]))

/** Busca uma faixa pelo id. Cai na faixa Rubi quando o conteúdo ainda não tem chip. */
export const faixaPorId = (id?: string | null): FaixaCromatica =>
  (id && porId.get(id)) || porId.get('rubi')!

/** Opções prontas para os campos `select` do Payload. */
export const OPCOES_ESCALA = ESCALA_CROMATICA.map((faixa) => ({
  label: `${numeroFaixa(faixa.numero)} · ${faixa.nome}`,
  value: faixa.id,
}))

/** Faixas agrupadas por família — usado nos filtros do índice de vinhos. */
export const ESCALA_POR_FAMILIA = (Object.keys(NOMES_FAMILIA) as FamiliaVinho[]).map((familia) => ({
  familia,
  nome: NOMES_FAMILIA[familia],
  faixas: ESCALA_CROMATICA.filter((faixa) => faixa.familia === familia),
}))
