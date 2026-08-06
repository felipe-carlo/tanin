/**
 * IMPORTAÇÃO ÚNICA DAS EDIÇÕES ANTIGAS DO BEEHIIV
 *
 * Roda uma vez, na migração: lê todas as edições publicadas no beehiiv, converte o
 * HTML de cada uma em texto rico do Payload e grava a coleção "Boletim Tanin" —
 * como RASCUNHO, para a Ana revisar antes de publicar. Rodar de novo não duplica
 * nada: edições já importadas são atualizadas no lugar.
 *
 *   pnpm importar:beehiiv --seco        vê o que aconteceria, sem gravar
 *   pnpm importar:beehiiv               importa como rascunho
 *   pnpm importar:beehiiv --publicar    importa já publicado (só depois de revisar)
 *   pnpm importar:beehiiv --limite=3    só as 3 edições mais antigas, para testar
 *
 * -----------------------------------------------------------------------------
 * LIMITAÇÕES CONHECIDAS DO CONVERSOR DE HTML
 *
 * O conversor abaixo é escrito à mão, sem nenhuma biblioteca. Ele não é um
 * navegador: é uma varredura de tags que cobre o que uma newsletter realmente usa.
 * O que ele NÃO faz, de propósito:
 *
 *  1. Imagens não são baixadas. Cada <img> vira uma marca no texto com o endereço
 *     original, em itálico, para a Ana abrir, baixar e subir de novo pelo painel —
 *     onde a imagem ganha crédito, legenda e os tamanhos que o portal serve.
 *  2. <table>, <script>, <style>, <iframe>, <form>, <svg> e <noscript> são
 *     descartados inteiros, com aviso. Tabela de layout de e-mail não vira conteúdo;
 *     tabela de dados de verdade precisa ser remontada à mão (é raríssimo em carta).
 *  3. <pre>/<code> perdem o espaçamento: o editor do portal não tem bloco de código.
 *  4. Formatação inline reconhecida: negrito, itálico, sublinhado, riscado,
 *     subscrito, sobrescrito e link. Cor, tamanho de fonte, alinhamento e recuo são
 *     ignorados — quem decide como o texto se parece é o sistema de design.
 *  5. Títulos: h1 vira h2 (a página já tem um h1, que é o título da edição), h5 e h6
 *     viram h4. É a hierarquia que o editor do portal aceita.
 *  6. Vídeos e embeds (YouTube, Spotify, tweets) somem com aviso — o beehiiv os
 *     entrega como <iframe>. O endereço precisa ser recolocado à mão.
 *  7. HTML mal fechado é tolerado (a tag fica aberta até o fim do bloco), mas HTML
 *     muito exótico pode virar um parágrafo a mais ou a menos. Por isso a
 *     importação entra como rascunho: o olho humano é a última etapa.
 */

import { pathToFileURL } from 'node:url'

import type { Payload } from 'payload'

import { paraSlug } from '@/fields/slug'
import {
  beehiivConfigurado,
  listarPostsBeehiiv,
  obterPostBeehiiv,
  type PostBeehiiv,
} from '@/lib/beehiiv'
import type { Edicao } from '@/payload-types'

/* -------------------------------------------------------------------------- */
/* Nós do Lexical                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Forma mínima de um nó salvo pelo editor.
 *
 * O Payload guarda o texto rico como JSON puro, então o script pode montar os nós
 * na mão — sem instanciar o editor, que só existe no navegador.
 */
interface NoLexical {
  type: string
  version: number
  [chave: string]: unknown
}

/** Máscaras de formatação do Lexical. São bits: negrito + itálico = 3. */
const NEGRITO = 1
const ITALICO = 2
const RISCADO = 4
const SUBLINHADO = 8
const SUBSCRITO = 32
const SOBRESCRITO = 64

const noTexto = (texto: string, formato = 0): NoLexical => ({
  type: 'text',
  text: texto,
  format: formato,
  detail: 0,
  mode: 'normal',
  style: '',
  version: 1,
})

const noQuebraDeLinha = (): NoLexical => ({ type: 'linebreak', version: 1 })

const noFioHorizontal = (): NoLexical => ({ type: 'horizontalrule', version: 1 })

const noParagrafo = (filhos: NoLexical[]): NoLexical => ({
  type: 'paragraph',
  children: filhos,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  version: 1,
})

const noTitulo = (tag: 'h2' | 'h3' | 'h4', filhos: NoLexical[]): NoLexical => ({
  type: 'heading',
  tag,
  children: filhos,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

const noCitacao = (filhos: NoLexical[]): NoLexical => ({
  type: 'quote',
  children: filhos,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

const noItemDeLista = (filhos: NoLexical[], valor: number): NoLexical => ({
  type: 'listitem',
  children: filhos,
  value: valor,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

const noLista = (ordenada: boolean, itens: NoLexical[]): NoLexical => ({
  type: 'list',
  listType: ordenada ? 'number' : 'bullet',
  tag: ordenada ? 'ol' : 'ul',
  start: 1,
  children: itens,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

/**
 * Link externo. `newTab` fica ligado porque tudo que vem do beehiiv aponta para
 * fora do portal, e `seguir: false` é o padrão do campo extra do editor.
 */
const noLink = (endereco: string, filhos: NoLexical[]): NoLexical => ({
  type: 'link',
  fields: { linkType: 'custom', url: endereco, newTab: true, seguir: false },
  children: filhos,
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 3,
})

const montarCorpo = (nos: NoLexical[]): Edicao['corpo'] => ({
  root: {
    type: 'root',
    children: nos,
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

/* -------------------------------------------------------------------------- */
/* Mini-analisador de HTML                                                     */
/* -------------------------------------------------------------------------- */

interface ElementoHtml {
  tipo: 'elemento'
  tag: string
  atributos: Record<string, string>
  filhos: NoHtml[]
}

type NoHtml = { tipo: 'texto'; texto: string } | ElementoHtml

/** Tags que nunca têm fechamento. */
const TAGS_VAZIAS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
])

/** Tags jogadas fora com todo o conteúdo dentro. */
const TAGS_DESCARTADAS = ['script', 'style', 'iframe', 'table', 'noscript', 'svg', 'form']

/** Tags que vivem dentro de um parágrafo e não interrompem o fluxo do texto. */
const TAGS_EM_LINHA = new Set([
  'a',
  'abbr',
  'b',
  'cite',
  'code',
  'del',
  'em',
  'font',
  'i',
  'ins',
  'label',
  'mark',
  'q',
  's',
  'small',
  'span',
  'strike',
  'strong',
  'sub',
  'sup',
  'u',
])

/** Caixas que só agrupam: entramos nelas e seguimos procurando blocos. */
const TAGS_TRANSPARENTES = new Set([
  'article',
  'aside',
  'body',
  'center',
  'div',
  'figure',
  'footer',
  'header',
  'html',
  'main',
  'nav',
  'section',
])

const ENTIDADES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  bull: '•',
  middot: '·',
  laquo: '«',
  raquo: '»',
  deg: '°',
  euro: '€',
  pound: '£',
  reg: '®',
  copy: '©',
  trade: '™',
  times: '×',
  frac12: '½',
  aacute: 'á',
  acirc: 'â',
  atilde: 'ã',
  agrave: 'à',
  ccedil: 'ç',
  eacute: 'é',
  ecirc: 'ê',
  iacute: 'í',
  oacute: 'ó',
  ocirc: 'ô',
  otilde: 'õ',
  uacute: 'ú',
  Aacute: 'Á',
  Atilde: 'Ã',
  Ccedil: 'Ç',
  Eacute: 'É',
  Oacute: 'Ó',
}

const decodificarEntidades = (texto: string): string =>
  texto.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (inteira, corpo: string) => {
    if (corpo.startsWith('#')) {
      const codigo = corpo[1] === 'x' || corpo[1] === 'X'
        ? Number.parseInt(corpo.slice(2), 16)
        : Number.parseInt(corpo.slice(1), 10)
      return Number.isFinite(codigo) && codigo > 0 ? String.fromCodePoint(codigo) : inteira
    }
    return ENTIDADES[corpo] ?? inteira
  })

/**
 * Normaliza o texto solto do HTML.
 *
 * A quebra de linha do arquivo não é quebra de linha na página — só as tags
 * mandam. Por isso qualquer sequência de espaços vira um espaço só, antes de
 * decodificar as entidades (senão um `&nbsp;` recém-criado seria comido junto).
 */
const normalizarTexto = (texto: string): string =>
  decodificarEntidades(texto.replace(/[\t\r\n\f ]+/g, ' '))

const lerAtributos = (bruto: string): Record<string, string> => {
  const atributos: Record<string, string> = {}
  const padrao = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g
  let achado: RegExpExecArray | null
  while ((achado = padrao.exec(bruto)) !== null) {
    const valor = achado[2] ?? achado[3] ?? achado[4] ?? ''
    atributos[achado[1].toLowerCase()] = decodificarEntidades(valor)
  }
  return atributos
}

/** Remove blocos inteiros que não viram conteúdo, do mais interno para o mais externo. */
function descartarTagsInuteis(html: string, avisar: (aviso: string) => void): string {
  let resultado = html
  for (const tag of TAGS_DESCARTADAS) {
    const padrao = new RegExp(`<${tag}\\b[^>]*>(?:(?!<${tag}\\b)[\\s\\S])*?<\\/${tag}\\s*>`, 'gi')
    let quantidade = 0
    let anterior: string
    do {
      anterior = resultado
      resultado = resultado.replace(padrao, () => {
        quantidade += 1
        return ''
      })
    } while (resultado !== anterior)
    if (quantidade > 0 && tag !== 'script' && tag !== 'style') {
      avisar(`${quantidade} <${tag}> descartado(s) — confira se algo importante se perdeu`)
    }
  }
  return resultado
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<!doctype[^>]*>/gi, '')
}

/** Transforma o HTML numa árvore de nós. Tolera tag aberta que ninguém fechou. */
function analisarHtml(html: string): NoHtml[] {
  const raiz: ElementoHtml = { tipo: 'elemento', tag: '#raiz', atributos: {}, filhos: [] }
  const pilha: ElementoHtml[] = [raiz]
  const topo = () => pilha[pilha.length - 1]

  const fechar = (tag: string) => {
    for (let indice = pilha.length - 1; indice > 0; indice -= 1) {
      if (pilha[indice].tag === tag) {
        pilha.length = indice
        return
      }
    }
  }

  const padrao = /<\/([a-zA-Z][a-zA-Z0-9-]*)\s*>|<([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g
  let cursor = 0
  let achado: RegExpExecArray | null

  while ((achado = padrao.exec(html)) !== null) {
    const solto = html.slice(cursor, achado.index)
    if (solto) topo().filhos.push({ tipo: 'texto', texto: solto })
    cursor = padrao.lastIndex

    const [, tagFechada, tagAberta, atributosBrutos = ''] = achado
    if (tagFechada) {
      fechar(tagFechada.toLowerCase())
      continue
    }

    const tag = tagAberta.toLowerCase()
    // Parágrafo dentro de parágrafo e item dentro de item não existem: quem estava
    // aberto fecha aqui. É o caso mais comum de HTML de newsletter mal fechado.
    if (tag === 'p' || tag === 'li') {
      for (let indice = pilha.length - 1; indice > 0; indice -= 1) {
        if (pilha[indice].tag === tag) {
          fechar(tag)
          break
        }
        // Um bloco no meio do caminho significa que o `p`/`li` de cima é de outro
        // contexto (uma lista dentro de um item, por exemplo) e deve continuar aberto.
        if (!TAGS_EM_LINHA.has(pilha[indice].tag)) break
      }
    }

    const elemento: ElementoHtml = {
      tipo: 'elemento',
      tag,
      atributos: lerAtributos(atributosBrutos),
      filhos: [],
    }
    topo().filhos.push(elemento)
    if (!TAGS_VAZIAS.has(tag) && !atributosBrutos.trimEnd().endsWith('/')) pilha.push(elemento)
  }

  const resto = html.slice(cursor)
  if (resto) topo().filhos.push({ tipo: 'texto', texto: resto })
  return raiz.filhos
}

/* -------------------------------------------------------------------------- */
/* Árvore HTML → nós do Lexical                                                */
/* -------------------------------------------------------------------------- */

const enderecoValido = (endereco?: string): boolean =>
  Boolean(endereco && !/^(javascript|data):/i.test(endereco.trim()))

/**
 * Imagem: não baixamos nada. Fica uma marca visível no rascunho, com o endereço
 * original clicável, para a Ana subir a imagem pelo painel e apagar a marca.
 *
 * Dentro de um link a marca vira texto puro: link dentro de link não existe em
 * HTML, e o Lexical não sabe representar isso.
 */
const marcaDeImagem = (
  endereco: string,
  alternativo: string,
  comLink: boolean,
): NoLexical[] => {
  const legenda = alternativo.trim() || 'sem legenda'
  if (!comLink) return [noTexto(`[imagem do beehiiv — ${legenda}: ${endereco}]`, ITALICO)]
  return [
    noTexto(`[imagem do beehiiv — ${legenda}: `, ITALICO),
    noLink(endereco, [noTexto(endereco, ITALICO)]),
    noTexto(']', ITALICO),
  ]
}

const temTexto = (nos: NoLexical[]): boolean =>
  nos.some((no) => {
    if (no.type === 'text') return String(no.text ?? '').trim().length > 0
    if (Array.isArray(no.children)) return temTexto(no.children as NoLexical[])
    return no.type !== 'linebreak'
  })

/** Tira o espaço sobrando nas pontas de um bloco, que o HTML gera aos montes. */
function aparar(nos: NoLexical[]): NoLexical[] {
  const copia = [...nos]
  const ehVazio = (no: NoLexical): boolean =>
    no.type === 'text' && String(no.text ?? '').trim().length === 0
  while (copia.length > 0 && (ehVazio(copia[0]) || copia[0].type === 'linebreak')) copia.shift()
  while (copia.length > 0 && (ehVazio(copia[copia.length - 1]) || copia[copia.length - 1].type === 'linebreak'))
    copia.pop()
  return copia
}

interface Contexto {
  avisar: (aviso: string) => void
}

/** Converte o conteúdo de dentro de um bloco: texto, marcações e links. */
function converterEmLinha(
  nos: NoHtml[],
  formato: number,
  contexto: Contexto,
  dentroDeLink = false,
): NoLexical[] {
  const saida: NoLexical[] = []
  const recursao = (filhos: NoHtml[], formatoNovo: number) =>
    converterEmLinha(filhos, formatoNovo, contexto, dentroDeLink)

  for (const no of nos) {
    if (no.tipo === 'texto') {
      const texto = normalizarTexto(no.texto)
      if (texto) saida.push(noTexto(texto, formato))
      continue
    }

    switch (no.tag) {
      case 'strong':
      case 'b':
        saida.push(...recursao(no.filhos, formato | NEGRITO))
        break
      case 'em':
      case 'i':
      case 'cite':
        saida.push(...recursao(no.filhos, formato | ITALICO))
        break
      case 'u':
      case 'ins':
        saida.push(...recursao(no.filhos, formato | SUBLINHADO))
        break
      case 's':
      case 'strike':
      case 'del':
        saida.push(...recursao(no.filhos, formato | RISCADO))
        break
      case 'sub':
        saida.push(...recursao(no.filhos, formato | SUBSCRITO))
        break
      case 'sup':
        saida.push(...recursao(no.filhos, formato | SOBRESCRITO))
        break
      case 'br':
        saida.push(noQuebraDeLinha())
        break
      case 'img': {
        const endereco = no.atributos.src ?? no.atributos['data-src'] ?? ''
        if (enderecoValido(endereco)) {
          saida.push(...marcaDeImagem(endereco, no.atributos.alt ?? '', !dentroDeLink))
          contexto.avisar(`imagem não baixada: ${endereco}`)
        }
        break
      }
      case 'a': {
        const endereco = (no.atributos.href ?? '').trim()
        const filhos = converterEmLinha(no.filhos, formato, contexto, true)
        if (dentroDeLink || !enderecoValido(endereco)) {
          saida.push(...filhos)
          break
        }
        saida.push(noLink(endereco, filhos.length > 0 ? filhos : [noTexto(endereco, formato)]))
        break
      }
      default:
        // Qualquer outra tag inline (span, small, code, font…) é atravessada:
        // o texto interessa, a decoração dela não.
        saida.push(...recursao(no.filhos, formato))
    }
  }

  return saida
}

const TITULOS: Record<string, 'h2' | 'h3' | 'h4'> = {
  h1: 'h2', // a página da edição já tem um h1, que é o título
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h4',
  h6: 'h4',
}

/** Achata um blockquote com vários parágrafos numa citação só, com quebras de linha. */
function converterCitacao(nos: NoHtml[], contexto: Contexto): NoLexical[] {
  const saida: NoLexical[] = []

  for (const no of nos) {
    const ehBloco =
      no.tipo === 'elemento' &&
      (no.tag === 'p' || Boolean(TITULOS[no.tag]) || TAGS_TRANSPARENTES.has(no.tag))

    const filhos =
      no.tipo === 'elemento' && ehBloco
        ? converterCitacao(no.filhos, contexto)
        : converterEmLinha([no], 0, contexto)

    if (filhos.length === 0) continue
    if (saida.length > 0 && ehBloco) saida.push(noQuebraDeLinha())
    saida.push(...filhos)
  }

  return aparar(saida)
}

function converterBlocos(nos: NoHtml[], contexto: Contexto): NoLexical[] {
  const saida: NoLexical[] = []
  let acumulado: NoLexical[] = []

  // Texto solto entre blocos (o que acontece o tempo todo em HTML de e-mail) vira
  // um parágrafo assim que aparece o próximo bloco de verdade.
  const descarregar = () => {
    const filhos = aparar(acumulado)
    acumulado = []
    if (filhos.length > 0 && temTexto(filhos)) saida.push(noParagrafo(filhos))
  }

  for (const no of nos) {
    if (no.tipo === 'texto') {
      acumulado.push(...converterEmLinha([no], 0, contexto))
      continue
    }

    if (no.tag === 'p' || no.tag === 'figcaption' || no.tag === 'pre') {
      descarregar()
      const filhos = aparar(converterEmLinha(no.filhos, 0, contexto))
      if (filhos.length > 0 && temTexto(filhos)) saida.push(noParagrafo(filhos))
      continue
    }

    const tagDeTitulo = TITULOS[no.tag]
    if (tagDeTitulo) {
      descarregar()
      const filhos = aparar(converterEmLinha(no.filhos, 0, contexto))
      if (filhos.length > 0 && temTexto(filhos)) saida.push(noTitulo(tagDeTitulo, filhos))
      continue
    }

    if (no.tag === 'ul' || no.tag === 'ol') {
      descarregar()
      const lista = converterLista(no, contexto)
      if (lista) saida.push(lista)
      continue
    }

    if (no.tag === 'blockquote') {
      descarregar()
      const filhos = converterCitacao(no.filhos, contexto)
      if (filhos.length > 0 && temTexto(filhos)) saida.push(noCitacao(filhos))
      continue
    }

    if (no.tag === 'hr') {
      descarregar()
      saida.push(noFioHorizontal())
      continue
    }

    if (TAGS_TRANSPARENTES.has(no.tag)) {
      descarregar()
      saida.push(...converterBlocos(no.filhos, contexto))
      continue
    }

    // Sobrou tag inline (a, strong, img, span…): junta no parágrafo em formação.
    acumulado.push(...converterEmLinha([no], 0, contexto))
  }

  descarregar()
  return saida
}

function converterLista(lista: ElementoHtml, contexto: Contexto): NoLexical | null {
  const ordenada = lista.tag === 'ol'
  const itens: NoLexical[] = []

  for (const filho of lista.filhos) {
    if (filho.tipo !== 'elemento') continue
    if (filho.tag === 'ul' || filho.tag === 'ol') {
      // Lista solta dentro de lista, sem <li> em volta: vira um item só com a sublista.
      const sublista = converterLista(filho, contexto)
      if (sublista) itens.push(noItemDeLista([sublista], itens.length + 1))
      continue
    }
    if (filho.tag !== 'li') continue

    const emLinha = filho.filhos.filter(
      (neto) => neto.tipo === 'texto' || (neto.tag !== 'ul' && neto.tag !== 'ol'),
    )
    const sublistas = filho.filhos.filter(
      (neto): neto is ElementoHtml =>
        neto.tipo === 'elemento' && (neto.tag === 'ul' || neto.tag === 'ol'),
    )

    const conteudo = aparar(converterEmLinha(emLinha, 0, contexto))
    for (const sublista of sublistas) {
      const convertida = converterLista(sublista, contexto)
      if (convertida) conteudo.push(convertida)
    }
    if (conteudo.length > 0) itens.push(noItemDeLista(conteudo, itens.length + 1))
  }

  return itens.length > 0 ? noLista(ordenada, itens) : null
}

/** Converte o HTML de uma edição do beehiiv em nós do editor do portal. */
export function converterHtmlEmLexical(
  html: string,
  avisar: (aviso: string) => void = () => {},
): NoLexical[] {
  if (!html?.trim()) return []
  const contexto: Contexto = { avisar }
  return converterBlocos(analisarHtml(descartarTagsInuteis(html, avisar)), contexto)
}

/* -------------------------------------------------------------------------- */
/* Leitura do que foi convertido                                               */
/* -------------------------------------------------------------------------- */

/** Texto puro de uma árvore de nós — usado para resumo e para as âncoras. */
export function textoDe(nos: NoLexical[]): string {
  return nos
    .map((no) => {
      if (no.type === 'text') return String(no.text ?? '')
      if (no.type === 'linebreak') return ' '
      if (Array.isArray(no.children)) return textoDe(no.children as NoLexical[])
      return ''
    })
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Corta no limite de caracteres sem partir palavra ao meio. */
function encurtar(texto: string, limite: number): string {
  const limpo = texto.trim()
  if (limpo.length <= limite) return limpo
  const corte = limpo.slice(0, limite - 1)
  const espaco = corte.lastIndexOf(' ')
  return `${(espaco > limite * 0.6 ? corte.slice(0, espaco) : corte).trimEnd()}…`
}

const primeirasPalavras = (texto: string, quantas: number): string => {
  const palavras = texto.split(' ').filter(Boolean)
  const trecho = palavras.slice(0, quantas).join(' ')
  return palavras.length > quantas ? `${trecho}…` : trecho
}

/**
 * Os subtítulos internos viram o índice lateral da edição — é o que permite mandar
 * alguém direto para um trecho.
 */
export function extrairBlocos(nos: NoLexical[]): { titulo: string; ancora: string }[] {
  const usadas = new Set<string>()
  const blocos: { titulo: string; ancora: string }[] = []

  for (const no of nos) {
    if (no.type !== 'heading') continue
    if (no.tag !== 'h2' && no.tag !== 'h3') continue
    const titulo = textoDe((no.children as NoLexical[]) ?? [])
    if (!titulo) continue

    const base = paraSlug(titulo) || `trecho-${blocos.length + 1}`
    let ancora = base
    let sufixo = 2
    while (usadas.has(ancora)) {
      ancora = `${base}-${sufixo}`
      sufixo += 1
    }
    usadas.add(ancora)
    blocos.push({ titulo: encurtar(titulo, 120), ancora })
  }

  return blocos
}

/* -------------------------------------------------------------------------- */
/* Conversa com o beehiiv                                                      */
/* -------------------------------------------------------------------------- */

const POR_PAGINA = 50
const MAXIMO_DE_PAGINAS = 100

class ErroAmigavel extends Error {}

/** Baixa todas as edições publicadas, página por página, da mais antiga à mais nova. */
async function baixarPosts(): Promise<PostBeehiiv[]> {
  const posts: PostBeehiiv[] = []

  for (let pagina = 1; pagina <= MAXIMO_DE_PAGINAS; pagina += 1) {
    const resposta = await listarPostsBeehiiv({ pagina, porPagina: POR_PAGINA })
    if (!resposta.ok) {
      throw new ErroAmigavel(
        `O beehiiv recusou a consulta (${resposta.status ?? 'sem código'}): ${resposta.erro}.\n` +
          'Se a mensagem fala em plano ou permissão, veja docs/beehiiv.md — a API é do plano Scale.',
      )
    }

    const lote = resposta.dados?.data ?? []
    posts.push(...lote)
    console.log(`  · página ${pagina}: ${lote.length} edição(ões)`)

    const totalDePaginas = resposta.dados?.total_pages ?? 1
    if (pagina >= totalDePaginas || lote.length === 0) break
  }

  return posts
    .filter((post) => typeof post.publish_date === 'number')
    .sort((a, b) => (a.publish_date ?? 0) - (b.publish_date ?? 0))
}

/** O HTML da edição. A listagem costuma trazer junto; quando não traz, buscamos. */
async function corpoDoPost(post: PostBeehiiv): Promise<string> {
  const daListagem = post.content?.free?.web
  if (daListagem?.trim()) return daListagem
  const resposta = await obterPostBeehiiv(post.id)
  return resposta.ok ? (resposta.dados?.data?.content?.free?.web ?? '') : ''
}

/* -------------------------------------------------------------------------- */
/* Gravação no Payload                                                         */
/* -------------------------------------------------------------------------- */

interface DadosDaEdicao {
  titulo: string
  subtitulo?: string
  resumo: string
  corpo: Edicao['corpo']
  blocos: { titulo: string; ancora: string }[]
  numero: number
  slug: string
  dataEnvio: string
  urlBeehiiv?: string
  importadaEm: string
  _status: 'draft' | 'published'
}

/** Procura a edição já importada: primeiro pelo endereço no beehiiv, depois pelo número. */
async function edicaoExistente(
  payload: Payload,
  urlBeehiiv: string | undefined,
  numero: number,
): Promise<Edicao | null> {
  const resultado = await payload.find({
    collection: 'edicoes',
    where: {
      or: [
        ...(urlBeehiiv ? [{ urlBeehiiv: { equals: urlBeehiiv } }] : []),
        { numero: { equals: numero } },
      ],
    },
    limit: 5,
    depth: 0,
  })

  if (resultado.docs.length === 0) return null
  return resultado.docs.find((doc) => urlBeehiiv && doc.urlBeehiiv === urlBeehiiv) ?? resultado.docs[0]
}

/** Slug livre. Duas edições com o mesmo título acontecem — o número desempata. */
async function slugLivre(payload: Payload, base: string, idAtual?: number): Promise<string> {
  let candidato = base
  for (let tentativa = 2; tentativa <= 30; tentativa += 1) {
    const resultado = await payload.find({
      collection: 'edicoes',
      where: { slug: { equals: candidato } },
      limit: 1,
      depth: 0,
    })
    const encontrado = resultado.docs[0]
    if (!encontrado || encontrado.id === idAtual) return candidato
    candidato = `${base}-${tentativa}`
  }
  return `${base}-${Date.now()}`
}

/* -------------------------------------------------------------------------- */
/* Linha de comando                                                            */
/* -------------------------------------------------------------------------- */

interface Opcoes {
  publicar: boolean
  seco: boolean
  limite: number | null
}

function lerOpcoes(argumentos: string[]): Opcoes {
  const opcoes: Opcoes = { publicar: false, seco: false, limite: null }

  for (const argumento of argumentos) {
    if (argumento === '--publicar') opcoes.publicar = true
    else if (argumento === '--seco') opcoes.seco = true
    else if (argumento.startsWith('--limite=')) {
      const valor = Number.parseInt(argumento.slice('--limite='.length), 10)
      if (!Number.isFinite(valor) || valor < 1) {
        throw new ErroAmigavel(`--limite precisa ser um número maior que zero (recebi "${argumento}").`)
      }
      opcoes.limite = valor
    } else if (argumento === '--ajuda' || argumento === '--help') {
      console.log(AJUDA)
      process.exit(0)
    } else {
      throw new ErroAmigavel(`Não conheço a opção "${argumento}".\n${AJUDA}`)
    }
  }

  return opcoes
}

const AJUDA = `
Importa as edições antigas do beehiiv para o Boletim Tanin.

  pnpm importar:beehiiv --seco        mostra o que faria, sem gravar nada
  pnpm importar:beehiiv               importa como RASCUNHO (padrão)
  pnpm importar:beehiiv --publicar    importa já publicado
  pnpm importar:beehiiv --limite=3    só as 3 edições mais antigas

O passo a passo completo está em docs/beehiiv.md.
`.trim()

const RECADO_SEM_CHAVE = `
Falta a chave do beehiiv — nada foi importado.

O script precisa de duas variáveis no arquivo .env, na raiz do projeto:

  BEEHIIV_API_KEY=...
  BEEHIIV_PUBLICATION_ID=pub_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

Onde encontrar cada uma, dentro do beehiiv:

  1. Entre no beehiiv e abra Settings (engrenagem, no canto de baixo à esquerda).
  2. Vá em Integrations → API. O acesso à API é do plano Scale; se o botão de criar
     chave não aparecer, o plano atual não tem API — leia docs/beehiiv.md, que
     explica a alternativa de exportar as edições à mão.
  3. Clique em "New API Key", dê um nome (por exemplo "portal-tanin"), copie a chave
     na hora: o beehiiv só mostra uma vez.
  4. Na mesma tela aparece o ID da publicação, que começa com "pub_". Copie também.

Depois cole as duas linhas no .env, salve, e rode de novo:

  pnpm importar:beehiiv --seco

O passo a passo com telas está em docs/beehiiv.md.
`.trim()

/* -------------------------------------------------------------------------- */
/* Fluxo principal                                                             */
/* -------------------------------------------------------------------------- */

async function principal(): Promise<number> {
  const opcoes = lerOpcoes(process.argv.slice(2))

  if (!beehiivConfigurado()) {
    console.error(`\n${RECADO_SEM_CHAVE}\n`)
    return 1
  }

  console.log('\nBuscando as edições no beehiiv…')
  const posts = await baixarPosts()
  if (posts.length === 0) {
    console.log('\nNenhuma edição publicada encontrada no beehiiv. Nada a fazer.\n')
    return 0
  }

  const numeradas = posts.map((post, indice) => ({ post, numero: indice + 1 }))
  const selecionadas = opcoes.limite ? numeradas.slice(0, opcoes.limite) : numeradas

  console.log(
    `\n${posts.length} edição(ões) publicada(s). ` +
      `Importando ${selecionadas.length}, da mais antiga para a mais nova.`,
  )
  console.log(
    opcoes.seco
      ? 'Modo seco: nada será gravado.\n'
      : `Entrando como ${opcoes.publicar ? 'PUBLICADO' : 'RASCUNHO (padrão — revise antes de publicar)'}.\n`,
  )

  // A configuração só é importada agora porque ela lê o .env na hora em que é
  // carregada — e porque no modo seco sem chave o banco nem precisa ser tocado.
  const { getPayload } = await import('payload')
  const { default: config } = await import('@/payload.config')
  const payload = await getPayload({ config })

  let criadas = 0
  let atualizadas = 0
  let puladas = 0
  const avisos: string[] = []

  for (const { post, numero } of selecionadas) {
    const rotulo = `Edição ${String(numero).padStart(2, '0')}`
    const avisosDaEdicao: string[] = []
    const avisar = (aviso: string) => avisosDaEdicao.push(aviso)

    const html = await corpoDoPost(post)
    const nos = converterHtmlEmLexical(html, avisar)

    if (nos.length === 0 || !temTexto(nos)) {
      puladas += 1
      avisos.push(`${rotulo} "${post.title}" — sem corpo convertível; importe essa à mão.`)
      console.log(`  ${rotulo} · pulada (corpo vazio) · ${post.title}`)
      continue
    }

    const titulo = encurtar(post.title?.trim() || `Edição ${numero}`, 200)
    const textoDoCorpo = textoDe(nos)
    const resumo = encurtar(
      post.preview_text?.trim() ||
        post.meta_default_description?.trim() ||
        primeirasPalavras(textoDoCorpo, 50),
      420,
    )
    const blocos = extrairBlocos(nos)
    const dataEnvio = new Date((post.publish_date ?? 0) * 1000).toISOString()
    const urlBeehiiv = post.web_url?.trim() || undefined

    const existente = await edicaoExistente(payload, urlBeehiiv, numero)
    const slug = await slugLivre(
      payload,
      paraSlug(titulo) || `edicao-${numero}`,
      existente?.id,
    )

    const dados: DadosDaEdicao = {
      titulo,
      subtitulo: post.subtitle?.trim() ? encurtar(post.subtitle.trim(), 240) : undefined,
      resumo,
      corpo: montarCorpo(nos),
      blocos,
      numero,
      slug,
      dataEnvio,
      urlBeehiiv,
      importadaEm: new Date().toISOString(),
      _status: opcoes.publicar ? 'published' : 'draft',
    }

    const acao = existente ? 'atualizar' : 'criar'
    console.log(
      `  ${rotulo} · ${acao} · ${slug} · ${dataEnvio.slice(0, 10)} · ` +
        `${nos.length} bloco(s), ${blocos.length} âncora(s)`,
    )

    if (!opcoes.seco) {
      try {
        if (existente) {
          await payload.update({
            collection: 'edicoes',
            id: existente.id,
            data: dados,
            draft: !opcoes.publicar,
          })
          atualizadas += 1
        } else {
          await payload.create({
            collection: 'edicoes',
            // `chipCor` vazio de propósito: o hook da coleção pinta a edição pela
            // numeração, e é assim que a fita cromática do arquivo cresce sozinha.
            data: { ...dados, chipCor: null },
            draft: !opcoes.publicar,
          })
          criadas += 1
        }
      } catch (erro) {
        puladas += 1
        const detalhe = erro instanceof Error ? erro.message : String(erro)
        avisos.push(`${rotulo} "${titulo}" — o Payload recusou: ${detalhe}`)
        console.log(`  ${rotulo} · ERRO ao gravar · ${detalhe}`)
        continue
      }
    }

    for (const aviso of avisosDaEdicao) avisos.push(`${rotulo}: ${aviso}`)
  }

  console.log('\n──────────────────────────────────────────────')
  console.log(opcoes.seco ? 'Ensaio (nada foi gravado)' : 'Importação concluída')
  console.log(`  criadas:     ${opcoes.seco ? 0 : criadas}`)
  console.log(`  atualizadas: ${opcoes.seco ? 0 : atualizadas}`)
  console.log(`  puladas:     ${puladas}`)
  console.log(`  avisos:      ${avisos.length}`)

  if (avisos.length > 0) {
    console.log('\nAvisos:')
    for (const aviso of avisos.slice(0, 60)) console.log(`  · ${aviso}`)
    if (avisos.length > 60) console.log(`  · … e mais ${avisos.length - 60} aviso(s).`)
  }

  if (!opcoes.seco && !opcoes.publicar && criadas + atualizadas > 0) {
    console.log('\nAs edições entraram como rascunho. Revise em /admin e publique uma a uma.')
    console.log('O que conferir em cada uma está em docs/beehiiv.md.')
  }
  console.log('')

  return 0
}

/**
 * Só roda quando o arquivo é chamado direto. Assim o conversor pode ser importado
 * por um teste sem disparar nada contra o beehiiv nem contra o banco.
 */
const chamadoDireto =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href

if (chamadoDireto) {
  // O .env precisa entrar antes da configuração do Payload, que lê as variáveis no
  // momento em que é carregada. Em produção as variáveis já vêm do ambiente e o
  // arquivo não existe — por isso a falha aqui é silenciosa.
  try {
    process.loadEnvFile()
  } catch {
    /* sem .env: seguimos com o que estiver no ambiente */
  }

  let codigo = 1
  try {
    codigo = await principal()
  } catch (erro) {
    if (erro instanceof ErroAmigavel) {
      console.error(`\n${erro.message}\n`)
    } else {
      const detalhe = erro instanceof Error ? erro.message : String(erro)
      console.error(`\nA importação parou: ${detalhe}\n`)
      console.error('Se a mensagem não ajudar, rode com --seco e mande o texto acima para quem cuida do código.\n')
    }
  }
  process.exit(codigo)
}
