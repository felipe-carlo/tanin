import { paraSlug } from '@/fields/slug'
import { ESCALA_CROMATICA } from '@/lib/escala-cores'

/**
 * O MOTOR EDITORIAL — TUDO O QUE SE LÊ DO CORPO DO TEXTO
 *
 * Quem escreve digita três coisas: título, subtítulo e o texto. Todo o resto de que o
 * site precisa — o resumo que buscadores e IAs vão citar, a imagem que aparece no
 * WhatsApp, o tempo de leitura, o que a busca indexa, a cor do cartão — sai daqui, na
 * hora de salvar.
 *
 * O corpo é um documento Lexical: uma árvore de nós. `lerCorpo` percorre essa árvore
 * **uma vez só** e devolve tudo o que as funções abaixo precisam. Isso importa porque
 * este código roda a cada salvamento automático — de segundo e meio em segundo e meio,
 * enquanto a pessoa ainda está escrevendo. Três varreduras por tecla digitada seria
 * desperdício puro.
 *
 * Nenhuma função aqui toca no banco. É o que permite o importador do beehiiv usar
 * exatamente o mesmo cálculo que o painel, sem duplicar a lógica.
 */

/** Tipagem frouxa de propósito: o documento chega do banco como JSON qualquer. */
type No = Record<string, any>

/** Texto puro de um nó do editor, descendo pelos filhos. */
export const textoDoNo = (no: unknown): string => {
  if (!no || typeof no !== 'object') return ''
  const registro = no as { text?: unknown; children?: unknown[] }
  if (typeof registro.text === 'string') return registro.text
  if (Array.isArray(registro.children)) return registro.children.map(textoDoNo).join('')
  return ''
}

/** Os nós de primeiro nível do documento, venha ele como estado ou como raiz. */
const nosDaRaiz = (corpo: unknown): unknown[] => {
  if (!corpo || typeof corpo !== 'object') return []
  const raiz = (corpo as { root?: { children?: unknown[] } }).root
  return Array.isArray(raiz?.children) ? raiz.children : []
}

/* -------------------------------------------------------------------------- */
/* A varredura única                                                           */
/* -------------------------------------------------------------------------- */

export interface LeituraDoCorpo {
  /** O texto corrido, sem formatação, com espaços normalizados. */
  texto: string
  /** Quantas palavras o documento tem, contando o texto dentro dos blocos. */
  palavras: number
  /** Os parágrafos de primeiro nível, na ordem. Alimentam o resumo. */
  paragrafos: string[]
  /** O id da mídia escolhida como principal, se houver imagem no texto. */
  capa: number | null
}

const VAZIO: LeituraDoCorpo = { texto: '', palavras: 0, paragrafos: [], capa: null }

const contarPalavras = (texto: string): number => texto.split(/\s+/).filter(Boolean).length

/**
 * Percorre o documento uma vez e devolve tudo o que o motor precisa.
 *
 * A capa segue a escolha de quem escreveu: vence a primeira imagem marcada como
 * principal; sem nenhuma marcada, vale a primeira imagem do texto. É a diferença entre
 * "preencha o campo de imagem de destaque" e "arraste a foto e siga escrevendo".
 */
export function lerCorpo(corpo: unknown): LeituraDoCorpo {
  if (!corpo || typeof corpo !== 'object') return VAZIO

  const paragrafos: string[] = []
  const pedacos: string[] = []
  let palavras = 0
  let primeiraImagem: number | null = null
  let imagemMarcada: number | null = null

  const andar = (no: No | undefined | null, primeiroNivel: boolean): void => {
    if (!no || typeof no !== 'object') return

    // Imagem: o `value` é o id da mídia, ou o documento inteiro quando vem populado.
    if (no.type === 'upload') {
      const valor = no.value
      const id = typeof valor === 'object' && valor ? Number(valor.id) : Number(valor)
      if (Number.isFinite(id)) {
        if (primeiraImagem === null) primeiraImagem = id
        if (imagemMarcada === null && no.fields?.principal === true) imagemMarcada = id
      }
      // Legenda e crédito são texto de apoio, não corpo: ficam fora do resumo e da conta.
      return
    }

    if (typeof no.text === 'string') {
      const texto = no.text.trim()
      if (texto) {
        pedacos.push(texto)
        palavras += contarPalavras(texto)
      }
    }

    // Parágrafo de primeiro nível vira candidato a resumo. Título não — não é frase que
    // se cite sozinha —, e citação é a voz de outra pessoa.
    if (primeiroNivel && no.type === 'paragraph') {
      const texto = textoDoNo(no).trim()
      if (texto) paragrafos.push(texto)
    }

    const filhos = no.children ?? no.root?.children
    if (Array.isArray(filhos)) filhos.forEach((filho) => andar(filho as No, false))

    // Blocos custom (citação em destaque, caixa de apoio) guardam texto em `fields`.
    if (no.fields && typeof no.fields === 'object') {
      Object.values(no.fields as Record<string, unknown>).forEach((valor) => {
        if (typeof valor === 'string') {
          const texto = valor.trim()
          if (texto) {
            pedacos.push(texto)
            palavras += contarPalavras(texto)
          }
        } else if (Array.isArray(valor)) valor.forEach((item) => andar(item as No, false))
      })
    }
  }

  for (const no of nosDaRaiz(corpo)) andar(no as No, true)

  return {
    texto: pedacos.join(' ').replace(/\s+/g, ' ').trim(),
    palavras,
    paragrafos,
    capa: imagemMarcada ?? primeiraImagem,
  }
}

/* -------------------------------------------------------------------------- */
/* O que o motor deriva                                                        */
/* -------------------------------------------------------------------------- */

/** Tempo de leitura a 200 palavras por minuto, nunca menos de um minuto. */
export const estimarTempoLeitura = (corpo: unknown): number =>
  Math.max(1, Math.round(lerCorpo(corpo).palavras / 200))

/** As primeiras frases do corpo, para quando o resumo ficou em branco. */
export function trechoDoCorpo(corpo: unknown, limitePalavras = 55): string {
  return trechoDeLeitura(lerCorpo(corpo), limitePalavras)
}

/** A mesma coisa, a partir de uma leitura já feita — evita varrer a árvore de novo. */
export function trechoDeLeitura(leitura: LeituraDoCorpo, limitePalavras = 55): string {
  const palavras: string[] = []
  for (const paragrafo of leitura.paragrafos) {
    palavras.push(...paragrafo.split(/\s+/).filter(Boolean))
    if (palavras.length >= limitePalavras) break
  }
  if (palavras.length === 0) return ''
  const cortado = palavras.length > limitePalavras
  return palavras.slice(0, limitePalavras).join(' ') + (cortado ? '…' : '')
}

/**
 * O resumo de um texto, com queda para o começo do corpo.
 *
 * Não há campo de resumo no formulário: quem escreve escreve, e o primeiro parágrafo
 * é o que o Google e as inteligências artificiais vão citar. O campo continua no banco
 * para o que já foi escrito à mão, e para a semente que o importador do beehiiv traz do
 * texto de prévia da newsletter.
 */
export const resumoOuTrecho = (doc?: {
  resumo?: string | null
  corpo?: unknown
} | null): string => {
  if (doc?.resumo) return doc.resumo
  return trechoDoCorpo(doc?.corpo)
}

/**
 * Palavras vazias do português — as que aparecem em todo texto e por isso não
 * distinguem nenhum. Sem essa lista, as "palavras-chave" de qualquer matéria seriam
 * "de", "que" e "para".
 */
const PALAVRAS_VAZIAS = new Set(
  `a as o os um uma uns umas de do da dos das em no na nos nas por pelo pela pelos pelas
   para com sem sob sobre entre até após ante desde e ou mas nem que se como quando
   onde quem qual quais cujo cuja é são foi foram ser sendo sido está estão estava
   tem têm tinha havia há muito muita muitos muitas mais menos também já ainda só
   apenas todo toda todos todas outro outra outros outras mesmo mesma isso isto aquilo
   este esta estes estas esse essa esses essas aquele aquela seu sua seus suas meu
   minha nosso nossa lhe lhes ele ela eles elas eu você vocês nós me te nos
   não sim bem mal aqui ali lá então porque pois assim depois antes agora quase cada
   qualquer nada tudo algum alguma alguns algumas ter fazer faz feito dizer diz onde`
    .split(/\s+/)
    .filter(Boolean),
)

/**
 * As palavras-chave: os termos que este texto de fato responde.
 *
 * Não vão para a `meta keywords`, que morreu há vinte anos. Servem ao JSON-LD, que as
 * IAs leem. Frequência simples, descontadas as palavras vazias — um algoritmo mais
 * esperto (TF-IDF) exigiria conhecer o acervo inteiro a cada salvamento, e o ganho não
 * pagaria a consulta.
 */
export function derivarPalavrasChave(leitura: LeituraDoCorpo, quantas = 8): string {
  const contagem = new Map<string, number>()

  for (const bruta of leitura.texto.toLowerCase().split(/[^a-zà-ÿ0-9-]+/)) {
    const palavra = bruta.replace(/^-+|-+$/g, '')
    if (palavra.length < 4 || PALAVRAS_VAZIAS.has(palavra)) continue
    contagem.set(palavra, (contagem.get(palavra) ?? 0) + 1)
  }

  return [...contagem.entries()]
    .filter(([, vezes]) => vezes > 1) // uma aparição só é acaso, não assunto
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
    .slice(0, quantas)
    .map(([palavra]) => palavra)
    .join(', ')
}

/**
 * A cor do cartão.
 *
 * Determinística a partir do slug: o mesmo texto tem sempre a mesma faixa da escala
 * cromática. Sorteio de verdade faria o cartão trocar de cor a cada salvamento, e a
 * escala deixaria de significar coisa nenhuma.
 */
export function derivarChipCor(slug?: string | null): string {
  const semente = slug ?? ''
  let soma = 0
  for (let i = 0; i < semente.length; i += 1) soma = (soma * 31 + semente.charCodeAt(i)) % 100_003
  return ESCALA_CROMATICA[soma % ESCALA_CROMATICA.length]!.id
}

export interface ItemDeIndice {
  titulo: string
  ancora: string
}

/**
 * O índice "Nesta edição", derivado dos títulos H2 do corpo.
 *
 * As âncoras usam a MESMA conversão (`paraSlug`) que o renderizador aplica ao dar
 * `id` aos títulos — os dois lados batem por construção, e o índice nunca
 * dessincroniza do texto, porque não existe em separado dele.
 */
export function extrairIndice(corpo: unknown): ItemDeIndice[] {
  const itens: ItemDeIndice[] = []
  for (const no of nosDaRaiz(corpo)) {
    const registro = no as { type?: string; tag?: string }
    if (registro?.type !== 'heading' || registro?.tag !== 'h2') continue
    const titulo = textoDoNo(no).trim()
    const ancora = paraSlug(titulo)
    if (titulo && ancora) itens.push({ titulo, ancora })
  }
  return itens
}
