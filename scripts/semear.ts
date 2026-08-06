/**
 * SEMEADOR DO PORTAL TANIN
 *
 * Popula o banco com um acervo de exemplo que se parece com o portal em operação:
 * matérias, edições do Boletim, fichas de vinho, guias, agenda e taxonomia.
 *
 * Duas decisões governam este arquivo:
 *
 *  1. É IDEMPOTENTE. Todo documento é procurado pelo slug (ou pelo e-mail, ou pelo
 *     número da edição) antes de ser escrito. Rodar duas vezes atualiza; nunca duplica.
 *     Por isso cada semente carrega um `slug` escrito à mão em vez de deixar o hook
 *     inventar um: o slug é a chave, e chave não pode depender de acidente de título.
 *
 *  2. O CONTEÚDO NÃO É ENCHIMENTO. Os textos seguem a voz da casa — jornalística,
 *     específica, escrita para quem bebe vinho e não para quem vende. Um seed com
 *     lorem ipsum esconde exatamente os problemas de design que ele deveria revelar.
 *
 * Uso:
 *   pnpm seed              semeia (ou atualiza) tudo
 *   pnpm seed --limpar     apaga o conteúdo semeado antes. Nunca apaga usuários.
 *
 * Produtores, rótulos e importadoras são FICTÍCIOS de propósito. Atribuir nota a um
 * vinho real de um produtor real em dados de demonstração seria publicar uma avaliação
 * que ninguém fez.
 */

import { getPayload } from 'payload'
import type { CollectionSlug, RequiredDataFromCollectionSlug, Where } from 'payload'

import { paraSlug } from '../src/fields/slug'
import type { Materia } from '../src/payload-types'

/* -------------------------------------------------------------------------- */
/* Ambiente                                                                    */
/* -------------------------------------------------------------------------- */

// A configuração do Payload lê DATABASE_URI e PAYLOAD_SECRET no momento em que é
// avaliada. Como `import` estático é içado para antes de qualquer instrução, a config
// precisa entrar por importação dinâmica — depois de o .env estar no ambiente.
try {
  process.loadEnvFile()
} catch {
  // Sem .env em disco vale o que já estiver no ambiente (CI, contêiner, produção).
}

const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })

const APAGAR_ANTES = process.argv.includes('--limpar')

/* -------------------------------------------------------------------------- */
/* Nós do editor Lexical                                                       */
/* -------------------------------------------------------------------------- */

/** Forma mínima de um nó do documento rico, do jeito que o Payload guarda. */
interface No {
  type: string
  version: number
  [chave: string]: unknown
}

type Rico = Materia['corpo']

const textoSimples = (conteudo: string) => ({
  type: 'text',
  text: conteudo,
  format: 0,
  style: '',
  mode: 'normal',
  detail: 0,
  version: 1,
})

/** Parágrafo. */
const p = (conteudo: string): No => ({
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  children: [textoSimples(conteudo)],
})

const titulo = (tag: 'h2' | 'h3', conteudo: string): No => ({
  type: 'heading',
  tag,
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  children: [textoSimples(conteudo)],
})

const h2 = (conteudo: string): No => titulo('h2', conteudo)
const h3 = (conteudo: string): No => titulo('h3', conteudo)

const blocoCustomizado = (campos: Record<string, unknown>): No => ({
  type: 'block',
  format: '',
  version: 2,
  fields: campos,
})

/** Citação em destaque, à maneira de revista. */
const destaque = (frase: string, autoria?: string): No =>
  blocoCustomizado({ blockType: 'destaque', texto: frase, ...(autoria ? { autoria } : {}) })

/** Caixa de apoio — "como servir", "o que levar". */
const caixa = (tituloDaCaixa: string, texto: string): No =>
  blocoCustomizado({ blockType: 'caixa', titulo: tituloDaCaixa, texto })

/** Lista numerada com título e descrição por item. */
const listaNumerada = (
  tituloDaLista: string,
  itens: { titulo: string; texto?: string }[],
): No => blocoCustomizado({ blockType: 'listaNumerada', titulo: tituloDaLista, itens })

/** Documento rico completo, pronto para um campo `richText`. */
const rico = (...nos: No[]): Rico => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: nos,
  },
})

/* -------------------------------------------------------------------------- */
/* Datas                                                                       */
/* -------------------------------------------------------------------------- */

const AGORA = new Date()

const emDias = (dias: number, hora = 9): string => {
  const data = new Date(AGORA)
  data.setDate(data.getDate() + dias)
  data.setHours(hora, 0, 0, 0)
  return data.toISOString()
}

const diasAtras = (dias: number, hora = 9): string => emDias(-dias, hora)

/* -------------------------------------------------------------------------- */
/* Relatório e escrita                                                         */
/* -------------------------------------------------------------------------- */

type Desfecho = 'criado' | 'atualizado' | 'mantido'

const placar = new Map<string, Record<Desfecho, number>>()

const contar = (colecao: string, desfecho: Desfecho): void => {
  const atual = placar.get(colecao) ?? { criado: 0, atualizado: 0, mantido: 0 }
  atual[desfecho] += 1
  placar.set(colecao, atual)
}

const secao = (texto: string): void => console.log(`\n${texto}`)

/**
 * Cria ou atualiza um documento, identificado por uma condição estável.
 *
 * O `as never` no `data` do update existe porque o tipo de dados parcial do Payload é
 * um mapeamento genérico sobre um slug ainda não resolvido — o compilador não consegue
 * provar a compatibilidade dentro de uma função genérica, embora ela seja verdadeira
 * em toda chamada concreta.
 */
async function semear<T extends CollectionSlug>(
  colecao: T,
  onde: Where,
  dados: RequiredDataFromCollectionSlug<T>,
  rotulo: string,
): Promise<number> {
  const encontrados = await payload.find({
    collection: colecao,
    where: onde,
    limit: 1,
    depth: 0,
  })

  const anterior = encontrados.docs[0]
  if (anterior) {
    await payload.update({ collection: colecao, id: anterior.id, data: dados as never, depth: 0 })
    contar(colecao, 'atualizado')
    console.log(`  ~ ${rotulo}`)
    return Number(anterior.id)
  }

  const criado = await payload.create({ collection: colecao, data: dados, depth: 0 })
  contar(colecao, 'criado')
  console.log(`  + ${rotulo}`)
  return Number(criado.id)
}

/** Atalho para o caso mais comum: a chave é o slug. */
const porSlug = (slug: string): Where => ({ slug: { equals: slug } })

/* -------------------------------------------------------------------------- */
/* Limpeza                                                                     */
/* -------------------------------------------------------------------------- */

// Conteúdo primeiro, taxonomia depois: as tabelas de relação apagam em cascata, mas
// deixar os documentos que apontam para elas irem embora antes evita qualquer surpresa.
const COLECOES_SEMEADAS: CollectionSlug[] = [
  'materias',
  'edicoes',
  'vinhos',
  'guias',
  'eventos',
  'categorias',
  'tags',
  'uvas',
  'regioes',
  'importadoras',
  'autores',
]

async function limparConteudo(): Promise<void> {
  secao('Limpando o conteúdo semeado (usuários ficam intactos)')
  for (const colecao of COLECOES_SEMEADAS) {
    const resultado = await payload.delete({
      collection: colecao,
      where: { id: { exists: true } },
      depth: 0,
    })
    console.log(`  − ${colecao}: ${resultado.docs.length} apagados`)
  }
}

/* -------------------------------------------------------------------------- */
/* 1. Autoria e acesso                                                         */
/* -------------------------------------------------------------------------- */

async function semearAutora(): Promise<number> {
  secao('Autoria')

  const id = await semear(
    'autores',
    porSlug('ana-luiza-leal'),
    {
      nome: 'Ana Luiza Leal',
      slug: 'ana-luiza-leal',
      cargo: 'Jornalista de vinho e criadora da Tanin',
      bioCurta:
        'Jornalista há dezoito anos, escreve sobre vinho desde 2015. Criou a Tanin para contar o que acontece dentro da garrafa sem o vocabulário que afasta quem só queria beber melhor.',
      bioLonga: rico(
        p(
          'Comecei a escrever sobre vinho por um desvio. Cobria alimentação e restaurantes quando percebi que a parte do texto que os leitores recortavam e mandavam para as amigas era sempre a mesma: a que explicava por que aquela garrafa custava aquilo e o que esperar de sabor ao abri-la. Nunca a que descrevia taninos aveludados.',
        ),
        p(
          'A Tanin nasceu desse recorte. É uma publicação independente, sem patrocínio de importadora e sem link de afiliado, escrita para quem compra vinho com regularidade e quer decidir melhor — não para quem trabalha com vinho. Aqui não existe nota sem justificativa, elogio sem prova, nem palavra técnica que não seja explicada na frase seguinte.',
        ),
        p(
          'Provo os vinhos que avalio, quase sempre às cegas e em série, ao lado de garrafas comparáveis de preço parecido. Quando uma amostra chega de graça, isso é dito na ficha. Quando eu erro, a ficha é corrigida e a correção fica visível. É um método simples e é o que sustenta a única coisa que uma publicação sobre vinho tem para vender: a confiança de quem lê.',
        ),
        p(
          'Escrevo de São Paulo, viajo para vindimas quando a pauta pede e leio rótulos em supermercado por esporte. Se você chegou até aqui, provavelmente também.',
        ),
      ),
      credenciais: [
        { texto: 'Graduação em Jornalismo, com especialização em jornalismo de gastronomia', ano: '2007' },
        { texto: 'WSET Nível 2 em Vinhos, com distinção', ano: '2018' },
        { texto: 'Curso de sommelier profissional, módulos de degustação e serviço', ano: '2016' },
        { texto: 'Dez anos de cobertura de vinho em redações e em publicação própria', ano: '2015–2025' },
        { texto: 'Cobertura de vindima em Portugal, Argentina e Chile', ano: '2019–2024' },
      ],
      redes: [
        { rede: 'instagram', url: 'https://instagram.com/analuizaleal' },
        { rede: 'linkedin', url: 'https://www.linkedin.com/in/analuizaleal' },
        { rede: 'youtube', url: 'https://www.youtube.com/@analuizaleal' },
      ],
      email: 'ana@tanin.com.br',
    },
    'Ana Luiza Leal',
  )

  return id
}

async function semearUsuario(idDaAutora: number): Promise<void> {
  secao('Acesso ao painel')

  const existentes = await payload.find({
    collection: 'usuarios',
    where: { email: { equals: 'ana@tanin.com.br' } },
    limit: 1,
    depth: 0,
  })

  // Usuário existente não é reescrito: trocar a senha de quem já usa o painel a cada
  // execução do seed seria uma surpresa desagradável.
  if (existentes.docs[0]) {
    console.log('  = ana@tanin.com.br (já existia, mantido)')
    contar('usuarios', 'mantido')
    return
  }

  await payload.create({
    collection: 'usuarios',
    data: {
      email: 'ana@tanin.com.br',
      password: 'tanin2026',
      nome: 'Ana Luiza Leal',
      papel: 'administrador',
      autor: idDaAutora,
    },
  })
  contar('usuarios', 'criado')
  console.log('  + ana@tanin.com.br (administrador)')
}

/* -------------------------------------------------------------------------- */
/* 2. Taxonomia                                                                */
/* -------------------------------------------------------------------------- */

const CATEGORIAS = [
  {
    slug: 'reportagem',
    nome: 'Reportagem',
    ordem: 10,
    chipCor: 'granada',
    descricao: 'Apuração de campo: o que está acontecendo nas vinícolas, nas importadoras e na prateleira.',
  },
  {
    slug: 'ensaio',
    nome: 'Ensaio',
    ordem: 20,
    chipCor: 'ambar',
    descricao: 'Texto de opinião assinada, com tese explícita e argumento que se pode discordar.',
  },
  {
    slug: 'entrevista',
    nome: 'Entrevista',
    ordem: 30,
    chipCor: 'cereja',
    descricao: 'Conversas com quem produz, importa, serve e estuda vinho no Brasil.',
  },
  {
    slug: 'degustacao',
    nome: 'Degustação',
    ordem: 40,
    chipCor: 'purpura',
    descricao: 'Provas comparativas, quase sempre às cegas, com método descrito e resultado publicado por inteiro.',
  },
  {
    slug: 'mercado',
    nome: 'Mercado',
    ordem: 50,
    chipCor: 'ouro-velho',
    descricao: 'Preço, imposto, câmbio e distribuição — a parte do vinho que decide o que chega até você.',
  },
  {
    slug: 'cultura',
    nome: 'Cultura',
    ordem: 60,
    chipCor: 'salmao',
    descricao: 'O vinho como hábito: a mesa, a casa, o restaurante e o que ele diz sobre quem bebe.',
  },
] as const

const TAGS = [
  'Champagne',
  'Vinho natural',
  'Portugal',
  'Chile',
  'Argentina',
  'Harmonização',
  'Espumante',
  'Uva rara',
  'Preço justo',
  'Rótulo brasileiro',
  'Vinho de guarda',
  'Restaurante',
] as const

const UVAS = [
  {
    slug: 'touriga-nacional',
    nome: 'Touriga Nacional',
    cor: 'tinta',
    descricao:
      'A casta mais reconhecível de Portugal: flor de violeta, fruta escura e taninos firmes. Sustenta tanto o Porto quanto os tintos secos do Douro, e ganhou fôlego próprio quando os produtores pararam de usá-la só como tempero de corte.',
  },
  {
    slug: 'tempranillo',
    nome: 'Tempranillo',
    cor: 'tinta',
    sinonimos: 'Tinta Roriz, Aragonez, Tinto Fino, Cencibel',
    descricao:
      'Amadurece cedo, tem acidez média e aceita madeira com naturalidade. É a espinha dorsal da Rioja e um dos pilares do Douro, onde atende por Tinta Roriz.',
  },
  {
    slug: 'malbec',
    nome: 'Malbec',
    cor: 'tinta',
    sinonimos: 'Côt, Auxerrois',
    descricao:
      'Saiu de Cahors, no sudoeste francês, e virou identidade argentina em Mendoza. Dá vinhos de cor densa, fruta madura e tanino macio — o que explica boa parte da sua popularidade no Brasil.',
  },
  {
    slug: 'cabernet-sauvignon',
    nome: 'Cabernet Sauvignon',
    cor: 'tinta',
    descricao:
      'Casca grossa, tanino estruturado e aroma de cassis com um traço herbáceo. Envelhece bem e é a uva mais plantada do mundo, o que significa qualidade em toda a escala de preço.',
  },
  {
    slug: 'merlot',
    nome: 'Merlot',
    cor: 'tinta',
    descricao:
      'Fruta redonda, tanino baixo e álcool moderado quando colhida no ponto. Injustiçada por duas décadas de rótulos industriais, é o tinto que melhor resolve uma mesa com pratos diferentes.',
  },
  {
    slug: 'pinot-noir',
    nome: 'Pinot Noir',
    cor: 'tinta',
    descricao:
      'Cor clara, acidez alta e aroma de cereja e terra. Exige clima fresco e mão leve na vinificação — por isso é cara, e por isso quase não existe versão barata que preste.',
  },
  {
    slug: 'sangiovese',
    nome: 'Sangiovese',
    cor: 'tinta',
    sinonimos: 'Brunello, Prugnolo Gentile, Morellino',
    descricao:
      'A uva da Toscana: acidez alta, tanino seco e sabor de cereja azeda com ervas. Foi desenhada pela mesa italiana e continua sendo o tinto que melhor acompanha tomate.',
  },
  {
    slug: 'nebbiolo',
    nome: 'Nebbiolo',
    cor: 'tinta',
    sinonimos: 'Spanna, Chiavennasca',
    descricao:
      'Cor pálida que engana: por baixo há tanino severo e acidez alta, que pedem anos de garrafa. É a casta do Barolo e do Barbaresco, e uma das poucas que melhora de verdade com o tempo.',
  },
  {
    slug: 'syrah',
    nome: 'Syrah',
    cor: 'tinta',
    sinonimos: 'Shiraz',
    descricao:
      'No Rhône dá vinhos apimentados e de fruta escura; na Austrália, mais doces e encorpados. O nome no rótulo costuma anunciar qual dos dois estilos está na garrafa.',
  },
  {
    slug: 'garnacha',
    nome: 'Garnacha',
    cor: 'tinta',
    sinonimos: 'Grenache, Cannonau, Garnacha Tinta',
    descricao:
      'Pele fina, cor clara e fruta vermelha generosa. Resiste ao calor e é a base da maioria dos rosés do sul da França, onde a maceração curta preserva o tom pálido.',
  },
  {
    slug: 'chardonnay',
    nome: 'Chardonnay',
    cor: 'branca',
    descricao:
      'Uva neutra que assume o sotaque do lugar e da barrica. Vai do branco tenso e mineral de Chablis ao amanteigado da Califórnia — e é metade da alma da Champagne.',
  },
  {
    slug: 'sauvignon-blanc',
    nome: 'Sauvignon Blanc',
    cor: 'branca',
    descricao:
      'Acidez cortante e aroma inconfundível de erva, maracujá e limão. Feita para beber jovem, é o branco que mais funciona com queijo de cabra e com comida de sal alto.',
  },
  {
    slug: 'riesling',
    nome: 'Riesling',
    cor: 'branca',
    descricao:
      'Aromática, de acidez altíssima e álcool baixo, existe do seco absoluto ao doce de sobremesa. Envelhece melhor do que a maioria dos tintos, o que quase ninguém acredita na primeira vez.',
  },
  {
    slug: 'albarino',
    nome: 'Albariño',
    cor: 'branca',
    sinonimos: 'Alvarinho',
    descricao:
      'O branco do Atlântico ibérico: salino, cítrico e de corpo médio. Cruza a fronteira e vira Alvarinho no Vinho Verde português, com o mesmo talento para peixe.',
  },
  {
    slug: 'ribolla-gialla',
    nome: 'Ribolla Gialla',
    cor: 'branca',
    descricao:
      'Casta branca do nordeste italiano, de casca espessa e pouco aroma primário. Virou emblema do vinho laranja porque suporta semanas de contato com as cascas sem perder frescor.',
  },
] as const

const REGIOES = [
  {
    slug: 'douro',
    nome: 'Douro',
    pais: 'Portugal',
    descricao:
      'Vale de encostas íngremes no norte de Portugal, o primeiro território vinícola demarcado do mundo. Fez fama com o Porto e hoje tira dos mesmos vinhedos velhos tintos secos de estrutura séria.',
  },
  {
    slug: 'mendoza',
    nome: 'Mendoza',
    pais: 'Argentina',
    descricao:
      'Deserto irrigado ao pé dos Andes, entre 800 e 1.500 metros de altitude. A amplitude térmica preserva acidez em uvas que amadurecem sob sol constante — a razão técnica por trás do Malbec argentino.',
  },
  {
    slug: 'vale-de-colchagua',
    nome: 'Vale de Colchagua',
    pais: 'Chile',
    descricao:
      'Vale chileno de clima quente e seco, especializado em tintos de corpo cheio. É de onde vem boa parte do Cabernet Sauvignon e do Carménère que chegam ao supermercado brasileiro.',
  },
  {
    slug: 'borgonha',
    nome: 'Borgonha',
    pais: 'França',
    descricao:
      'Faixa estreita de vinhedos no leste francês onde Pinot Noir e Chardonnay são cultivadas há mais de mil anos. O preço acompanha a escassez: são poucos hectares para demanda mundial.',
  },
  {
    slug: 'champagne',
    nome: 'Champagne',
    pais: 'França',
    descricao:
      'Região fria a nordeste de Paris, única autorizada a usar o nome no rótulo. O frio dá a acidez que sustenta a segunda fermentação na garrafa e o longo repouso sobre as leveduras.',
  },
  {
    slug: 'vale-do-loire',
    nome: 'Vale do Loire',
    pais: 'França',
    descricao:
      'O rio mais longo da França atravessa vinhedos de brancos tensos e tintos leves. Sancerre e Pouilly-Fumé, no leste do vale, são a referência mundial de Sauvignon Blanc.',
  },
  {
    slug: 'toscana',
    nome: 'Toscana',
    pais: 'Itália',
    descricao:
      'Colinas do centro da Itália onde a Sangiovese domina. Chianti Classico, Brunello e Vino Nobile saem da mesma casta, com regras diferentes de tempo e de solo.',
  },
  {
    slug: 'piemonte',
    nome: 'Piemonte',
    pais: 'Itália',
    descricao:
      'No noroeste italiano, ao pé dos Alpes, é a casa da Nebbiolo. Barolo e Barbaresco são vinhos de guarda longa; Langhe Nebbiolo é a porta de entrada mais honesta para o estilo.',
  },
  {
    slug: 'mosel',
    nome: 'Mosel',
    pais: 'Alemanha',
    descricao:
      'Vinhedos em encostas de xisto tão íngremes que a colheita é feita à mão. Produz Riesling de álcool baixo, acidez alta e aroma de limão e pedra molhada.',
  },
  {
    slug: 'rias-baixas',
    nome: 'Rías Baixas',
    pais: 'Espanha',
    descricao:
      'Galícia atlântica, verde e chuvosa, no extremo noroeste espanhol. A Albariño cultivada em parreiras altas dá brancos salinos que nasceram para acompanhar frutos do mar.',
  },
  {
    slug: 'serra-gaucha',
    nome: 'Serra Gaúcha',
    pais: 'Brasil',
    descricao:
      'Principal região vinícola brasileira, no nordeste do Rio Grande do Sul. Chuva na vindima é o desafio permanente; a altitude e o frio noturno explicam o bom espumante de método tradicional.',
  },
  {
    slug: 'provence',
    nome: 'Provence',
    pais: 'França',
    descricao:
      'Sul da França, entre o Mediterrâneo e os Alpes. Definiu o estilo de rosé pálido e seco que o mundo inteiro copiou — e cujo preço médio subiu junto com a moda.',
  },
] as const

// Importadoras fictícias. O campo `site` fica vazio de propósito: apontar um endereço
// inventado para um domínio que pode existir de verdade seria colocar uma empresa real
// dentro de dados de demonstração.
const IMPORTADORAS = [
  { slug: 'vinci-importadora', nome: 'Vinci Importadora', cidade: 'São Paulo' },
  { slug: 'casa-iberica', nome: 'Casa Ibérica Vinhos', cidade: 'São Paulo' },
  { slug: 'norte-sul-vinhos', nome: 'Norte Sul Vinhos', cidade: 'Rio de Janeiro' },
  { slug: 'alameda-wine', nome: 'Alameda Wine', cidade: 'Curitiba' },
  { slug: 'companhia-do-meridiano', nome: 'Companhia do Meridiano', cidade: 'Porto Alegre' },
  { slug: 'bruma-importadora', nome: 'Bruma Importadora', cidade: 'Belo Horizonte' },
] as const

type Indice = Record<string, number>

async function semearTaxonomia(): Promise<{
  categorias: Indice
  tags: Indice
  uvas: Indice
  regioes: Indice
  importadoras: Indice
}> {
  const categorias: Indice = {}
  const tags: Indice = {}
  const uvas: Indice = {}
  const regioes: Indice = {}
  const importadoras: Indice = {}

  secao('Categorias')
  for (const categoria of CATEGORIAS) {
    categorias[categoria.slug] = await semear(
      'categorias',
      porSlug(categoria.slug),
      { ...categoria },
      categoria.nome,
    )
  }

  secao('Tags')
  for (const nome of TAGS) {
    const slug = paraSlug(nome)
    tags[slug] = await semear('tags', porSlug(slug), { nome, slug }, nome)
  }

  secao('Uvas')
  for (const uva of UVAS) {
    uvas[uva.slug] = await semear('uvas', porSlug(uva.slug), { ...uva }, uva.nome)
  }

  secao('Regiões')
  for (const regiao of REGIOES) {
    regioes[regiao.slug] = await semear(
      'regioes',
      porSlug(regiao.slug),
      { ...regiao },
      `${regiao.nome} · ${regiao.pais}`,
    )
  }

  secao('Importadoras')
  for (const importadora of IMPORTADORAS) {
    importadoras[importadora.slug] = await semear(
      'importadoras',
      porSlug(importadora.slug),
      { ...importadora },
      importadora.nome,
    )
  }

  return { categorias, tags, uvas, regioes, importadoras }
}

/* -------------------------------------------------------------------------- */
/* 3. Guias                                                                    */
/* -------------------------------------------------------------------------- */

interface SementeDeGuia {
  slug: string
  titulo: string
  subtitulo: string
  resumo: string
  tipoGuia: 'uva' | 'regiao' | 'harmonizacao' | 'servico' | 'compra' | 'tecnico'
  nivel: 'iniciante' | 'intermediario'
  chipCor: string
  tags: string[]
  paraLevar: string[]
  faq: { pergunta: string; resposta: string }[]
  corpo: No[]
  diasAtras: number
}

const GUIAS: SementeDeGuia[] = [
  {
    slug: 'como-ler-um-rotulo-de-vinho',
    titulo: 'Como ler um rótulo de vinho importado',
    subtitulo:
      'O que cada linha do rótulo promete, o que ela esconde e quais palavras não significam absolutamente nada.',
    resumo:
      'Um rótulo de vinho tem, no máximo, cinco informações que mudam o que você vai beber: origem, safra, uva, teor alcoólico e produtor. Todo o resto é desenho. Este guia mostra como ler essas cinco linhas em rótulos franceses, italianos, ibéricos e do Novo Mundo, e por que "reserva" quase nunca quer dizer o mesmo em dois países.',
    tipoGuia: 'compra',
    nivel: 'iniciante',
    chipCor: 'ouro-velho',
    tags: ['preco-justo', 'portugal'],
    paraLevar: [
      'A origem no rótulo é a informação mais confiável: quanto menor o território citado, mais rígidas as regras de produção.',
      'Rótulo europeu costuma dizer o lugar; rótulo do Novo Mundo costuma dizer a uva. Nenhum dos dois é mais honesto que o outro.',
      '"Reserva" tem regra legal em Espanha, Portugal e Itália, e nenhuma na maior parte do resto do mundo.',
      'Teor alcoólico é um bom termômetro de estilo: abaixo de 12,5% espere leveza; acima de 14,5%, corpo e maturação alta.',
      'O importador impresso no contrarrótulo é uma pista de qualidade tão útil quanto o produtor.',
    ],
    faq: [
      {
        pergunta: 'O que significa "reserva" no rótulo de um vinho?',
        resposta:
          'Depende do país. Na Espanha, um tinto "reserva" precisa de três anos de envelhecimento, sendo pelo menos um em barrica. Em Portugal e na Itália há regras próprias, também definidas em lei. No Chile, na Argentina, nos Estados Unidos e no Brasil a palavra não tem exigência legal e pode ser usada livremente — nesses casos, ela informa sobre marketing, não sobre o vinho.',
      },
      {
        pergunta: 'Vinho sem safra no rótulo é ruim?',
        resposta:
          'Não. Ausência de safra indica corte de anos diferentes, prática normal e desejável em Champagne, Porto Tawny, Jerez e na maioria dos espumantes de entrada. O objetivo é manter o mesmo sabor todo ano. Em vinhos tranquilos de mesa, porém, a falta de safra costuma indicar volume industrial.',
      },
      {
        pergunta: 'O teor alcoólico diz alguma coisa sobre a qualidade?',
        resposta:
          'Sobre qualidade, não; sobre estilo, muito. Um branco de 11% será leve e provavelmente ácido; um tinto de 15% terá corpo, fruta madura e sensação de calor. Escolher pela graduação é uma forma rápida de acertar o tipo de vinho que combina com a ocasião.',
      },
    ],
    corpo: [
      p(
        'Um rótulo de vinho é dois documentos ao mesmo tempo. Um deles é legal, obedece a regras e diz de onde o líquido veio, quanto álcool tem e quem se responsabiliza por ele. O outro é publicitário, não obedece a nada e existe para você pegar a garrafa da prateleira. Aprender a separar os dois resolve a maior parte das compras erradas.',
      ),
      h2('Origem: a linha que mais informa'),
      p(
        'Em rótulos europeus, a origem é o dado principal, e ela funciona como uma escala de precisão. "Vin de France" é o país inteiro. "Bourgogne" é uma região. "Gevrey-Chambertin" é uma vila. Quanto menor o território citado, mais apertadas são as regras de produtividade, uva e envelhecimento — e, em geral, maior o preço.',
      ),
      p(
        'No Novo Mundo o hábito é outro: o rótulo destaca a uva e trata a origem como informação secundária. Não é desonestidade, é uma tradição comercial diferente, nascida num mercado que precisava explicar ao consumidor o que havia dentro da garrafa sem apoio de séculos de fama regional.',
      ),
      h2('As palavras que não significam nada'),
      p(
        '"Grand vin", "cuvée spéciale", "selezione", "premium", "gran selección": nenhuma dessas expressões tem definição legal na maioria dos países. Elas podem descrever um vinho excelente ou uma garrafa comum com tipografia dourada. A regra prática: se a palavra elogia o vinho, ela é publicidade; se ela informa um lugar, um ano ou um número, é documento.',
      ),
      destaque(
        'Se a palavra elogia o vinho, é publicidade. Se informa um lugar, um ano ou um número, é documento.',
      ),
      h2('Safra: idade, não qualidade'),
      p(
        'A safra diz em que ano as uvas foram colhidas. Para 95% dos vinhos vendidos no Brasil, ela serve para uma coisa só: saber se o vinho ainda está no ponto. Brancos leves e rosés pedem os dois anos mais recentes. Tintos de entrada aguentam de três a cinco. Só uma minoria de garrafas melhora com uma década na horizontal.',
      ),
      caixa(
        'O contrarrótulo vale a leitura',
        'É lá que estão o importador, o teor alcoólico, o volume e, às vezes, a informação mais útil de todas: o tempo de barrica. Importadoras que trabalham com poucos produtores e explicam o que trazem costumam ser um atalho confiável — se você gostou de duas garrafas da mesma importadora, provavelmente gostará da terceira.',
      ),
      h2('Um método de trinta segundos'),
      listaNumerada('Como decidir na prateleira', [
        { titulo: 'Olhe a origem', texto: 'Território pequeno e específico é um bom sinal, mesmo que você nunca tenha ouvido o nome.' },
        { titulo: 'Confira a safra', texto: 'Branco ou rosé com mais de três anos na prateleira do supermercado: deixe onde está.' },
        { titulo: 'Leia o álcool', texto: 'Decida o estilo que você quer beber hoje antes de decidir a uva.' },
        { titulo: 'Vire a garrafa', texto: 'Importador conhecido e informação técnica no contrarrótulo indicam quem tem o que mostrar.' },
      ]),
      p(
        'Nada disso substitui provar. Mas reduz muito a chance de levar para casa uma garrafa que já passou do ponto — que é, de longe, o erro mais comum e o mais caro.',
      ),
    ],
    diasAtras: 120,
  },
  {
    slug: 'malbec-o-que-a-uva-virou',
    titulo: 'Malbec: o que a uva virou depois de sair da França',
    subtitulo:
      'A casta que quase desapareceu em Bordeaux encontrou altitude na Argentina e mudou de personalidade. O que esperar de cada faixa de preço.',
    resumo:
      'O Malbec é a uva tinta mais vendida no Brasil e a mais mal explicada. Na França dava vinhos rústicos e ácidos; em Mendoza, a altitude e o sol constante mudaram a fruta, o tanino e a cor. Este guia explica o que a altitude faz com a uva e o que separa um Malbec de sessenta reais de um de trezentos.',
    tipoGuia: 'uva',
    nivel: 'iniciante',
    chipCor: 'purpura',
    tags: ['argentina', 'preco-justo'],
    paraLevar: [
      'Malbec argentino de qualidade vem de altitude: acima de mil metros, a noite fria preserva acidez que o sol do dia gastaria.',
      'A diferença entre um Malbec de entrada e um de gama alta está mais na acidez e no tanino do que na intensidade da fruta.',
      'Madeira nova em excesso é o defeito mais comum na faixa intermediária: baunilha e coco cobrindo a uva.',
      'Serve entre 16 e 18 °C. Acima disso, o álcool aparece e a fruta some.',
    ],
    faq: [
      {
        pergunta: 'Qual a diferença entre o Malbec argentino e o francês?',
        resposta:
          'O Malbec francês, principalmente o de Cahors, tem cor escura, acidez alta, tanino rústico e aroma de fruta preta e terra. O argentino, cultivado em altitude sob sol intenso, apresenta fruta mais madura, tanino macio e álcool mais alto. São dois estilos distintos da mesma uva, moldados por clima e por escolha de vinificação.',
      },
      {
        pergunta: 'Quanto custa um bom Malbec no Brasil?',
        resposta:
          'A faixa entre R$ 80 e R$ 150 concentra os melhores negócios: já há seleção de vinhedo e uso comedido de madeira. Abaixo de R$ 60 o vinho costuma ser correto mas simples, e acima de R$ 250 o que se paga é vinhedo de parcela única e envelhecimento longo — diferença real, mas de retorno decrescente.',
      },
    ],
    corpo: [
      p(
        'Até os anos 1990, o Malbec era uma nota de rodapé. Em Bordeaux, entrava em pequena proporção nos cortes e ia sendo arrancado a cada replantio. Em Cahors, no sudoeste francês, sobrevivia como vinho regional escuro e áspero, conhecido localmente como "vinho negro". A Argentina, que o recebera no século XIX, tratava a uva como matéria-prima de vinho a granel.',
      ),
      h2('O que a altitude fez'),
      p(
        'A virada foi técnica antes de ser comercial. Ao subir os vinhedos de 700 para 1.100, 1.400 metros no Valle de Uco, os produtores argentinos encontraram uma equação incomum: sol forte o dia inteiro, que amadurece a fruta, e noites de 12 °C, que travam a perda de acidez. O resultado é uma uva que fica madura sem ficar mole.',
      ),
      p(
        'É por isso que a altitude virou argumento de rótulo em Mendoza. Não é folclore: entre um vinhedo a 800 metros e outro a 1.400, a diferença de temperatura noturna muda a acidez final do vinho de forma mensurável, e acidez é o que separa um tinto refrescante de um tinto pesado.',
      ),
      destaque(
        'A altitude não deixa o vinho mais fino. Deixa a uva madura sem ficar mole — e isso é outra coisa.',
      ),
      h2('As três faixas de preço'),
      listaNumerada('O que muda conforme o preço sobe', [
        {
          titulo: 'Até R$ 80',
          texto: 'Uva de várias origens, fermentação em tanque, pouca ou nenhuma madeira. Fruta direta, tanino baixo, para beber no ano. Cumpre o papel.',
        },
        {
          titulo: 'De R$ 80 a R$ 150',
          texto: 'Seleção por região ou por altitude, passagem curta por barrica usada. É onde a acidez aparece e o vinho ganha meio-de-boca. A melhor relação da categoria.',
        },
        {
          titulo: 'Acima de R$ 250',
          texto: 'Parcelas específicas, produção pequena, envelhecimento longo. Ganha-se complexidade e potencial de guarda; perde-se a simplicidade que tornou a uva popular.',
        },
      ]),
      h2('O defeito mais comum'),
      p(
        'Madeira. Na disputa por parecer caro, muitos rótulos da faixa intermediária passam tempo demais em barrica nova, e o vinho chega à taça com aroma de baunilha, coco e serragem doce cobrindo a fruta. Um bom teste: se depois de quinze minutos na taça o vinho cheira mais a padaria do que a ameixa, a madeira venceu.',
      ),
      caixa(
        'Como servir',
        'Entre 16 e 18 °C — na prática, vinte minutos na geladeira antes de abrir, porque a sala de um apartamento brasileiro raramente está a menos de 24 °C. Taça larga, o suficiente para o álcool evaporar. Não precisa decantar, salvo nas garrafas de guarda com cinco anos ou mais.',
      ),
      p(
        'O Malbec virou sinônimo de vinho argentino por motivos comerciais tanto quanto enológicos. Mas a fama não é imerecida: é uma das poucas castas que entrega prazer real em todas as faixas de preço, e isso é raro.',
      ),
    ],
    diasAtras: 105,
  },
  {
    slug: 'douro-alem-do-porto',
    titulo: 'Douro: a região que faz muito mais do que Porto',
    subtitulo:
      'Os mesmos vinhedos velhos que sustentam o vinho fortificado mais famoso do mundo produzem hoje tintos secos de estrutura séria. O que procurar e o que evitar.',
    resumo:
      'O Douro é o território vinícola demarcado mais antigo do mundo e passou dois séculos conhecido por um produto só. Desde os anos 1990, os tintos secos da região disputam espaço com os grandes vinhos da Europa, usando as mesmas castas e as mesmas encostas. Este guia explica o que muda entre as sub-regiões e como escolher.',
    tipoGuia: 'regiao',
    nivel: 'intermediario',
    chipCor: 'granada',
    tags: ['portugal', 'vinho-de-guarda'],
    paraLevar: [
      'Douro e Porto saem do mesmo lugar e muitas vezes das mesmas vinhas: a diferença está na interrupção da fermentação com aguardente.',
      'Vinhas velhas de campo misto, com dezenas de castas plantadas juntas, dão os tintos mais complexos da região.',
      'O Cima Corgo é a sub-região de referência; o Douro Superior é mais quente e produz vinhos mais potentes.',
      'Tinto do Douro pede tempo: até garrafas de faixa média melhoram com três a cinco anos.',
    ],
    faq: [
      {
        pergunta: 'Qual a diferença entre vinho do Douro e vinho do Porto?',
        resposta:
          'Os dois vêm da mesma região demarcada, no norte de Portugal, e frequentemente das mesmas castas. No Porto, adiciona-se aguardente vínica durante a fermentação, o que mata as leveduras, deixa açúcar residual e eleva o álcool para cerca de 20%. O vinho do Douro fermenta até o fim, fica seco e tem entre 13% e 14,5% de álcool.',
      },
      {
        pergunta: 'Vinho do Douro precisa de decantação?',
        resposta:
          'Tintos jovens e estruturados ganham com uma hora de contato com o ar, o que amacia o tanino. Garrafas com mais de dez anos podem ter depósito e devem ser decantadas com cuidado, apenas para separar o sedimento — e servidas logo em seguida.',
      },
      {
        pergunta: 'Qual a temperatura ideal para servir um tinto do Douro?',
        resposta:
          'Entre 16 e 18 °C. Como a temperatura ambiente no Brasil quase sempre é mais alta, vale deixar a garrafa quinze a vinte minutos na geladeira antes de abrir. Servido acima de 20 °C, o álcool domina e a fruta desaparece.',
      },
    ],
    corpo: [
      p(
        'Se existe um lugar onde a paisagem explica o vinho, é o Douro. As encostas de xisto caem quase verticais sobre o rio, cortadas por socalcos construídos à mão ao longo de trezentos anos. Nada ali é mecanizável. Cada quilo de uva é carregado por uma pessoa — o que aparece, inevitavelmente, no preço final da garrafa.',
      ),
      h2('Três sub-regiões, três climas'),
      p(
        'O Baixo Corgo, mais próximo do Atlântico, é o mais úmido e fresco, e concentra a produção de volume. O Cima Corgo, no meio do vale, é o coração qualitativo: onde estão as quintas históricas e as vinhas velhas. O Douro Superior, junto à fronteira espanhola, é quente, seco e pouco povoado, e dá vinhos de fruta mais madura e álcool mais alto.',
      ),
      h2('Vinha velha de campo misto'),
      p(
        'A expressão aparece cada vez mais nos rótulos e não é firula. Antes de existir a noção moderna de casta, plantava-se tudo junto: Touriga Nacional, Tinta Roriz, Tinta Barroca, Touriga Franca e mais de vinte outras variedades, sem separação, sem registro. Essas vinhas, muitas com mais de sessenta anos, produzem pouco e amadurecem de forma desigual — e é exatamente essa desigualdade que dá camadas ao vinho.',
      ),
      destaque(
        'Vinha velha produz pouco e amadurece desigual. É essa desigualdade que dá camadas ao vinho.',
        'O argumento técnico por trás do campo misto',
      ),
      h2('O que evitar'),
      p(
        'Duas armadilhas. A primeira é o tinto de entrada superextraído, escuro e amargo, feito para parecer caro em prova rápida e que cansa na segunda taça. A segunda é a garrafa pesadíssima: no Douro, como em toda parte, o peso do vidro tem correlação zero com a qualidade do líquido e correlação alta com o custo de transporte que você paga.',
      ),
      caixa(
        'Três anos fazem diferença',
        'Diferente de boa parte dos tintos do Novo Mundo, o Douro de faixa média não está pronto quando chega à loja. Um Reserva de 2021 comprado hoje ganha corpo e integra o tanino até 2027 sem esforço nenhum: basta deitar a garrafa em lugar escuro e estável. É a forma mais barata de melhorar um vinho.',
      ),
      p(
        'Para quem está começando pela região, o caminho mais seguro é um Reserva de Cima Corgo de safra recente na faixa de R$ 150 a R$ 250. É onde a relação entre estrutura, fruta e preço fica mais equilibrada — e onde fica evidente por que o Douro deixou de ser sinônimo de uma bebida só.',
      ),
    ],
    diasAtras: 96,
  },
  {
    slug: 'temperatura-de-servico',
    titulo: 'A temperatura muda o vinho mais do que a taça',
    subtitulo:
      'Nenhum outro ajuste doméstico transforma tanto o sabor de uma garrafa — e quase todo mundo erra na mesma direção.',
    resumo:
      'Servir um tinto a 24 °C e o mesmo tinto a 16 °C é beber dois vinhos diferentes: o calor evapora álcool e apaga a fruta, o frio realça acidez e tanino. Este guia dá as faixas por tipo de vinho, explica o que acontece quimicamente em cada uma e apresenta a regra dos vinte minutos, que resolve quase tudo.',
    tipoGuia: 'servico',
    nivel: 'iniciante',
    chipCor: 'cereja',
    tags: ['harmonizacao', 'espumante'],
    paraLevar: [
      'No Brasil, "temperatura ambiente" significa 25 °C ou mais — quente demais para qualquer tinto.',
      'Vinte minutos na geladeira antes de abrir resolve a maioria dos tintos; vinte minutos fora dela resolve a maioria dos brancos.',
      'Frio esconde defeito e também esconde qualidade: espumante bom servido a 4 °C perde metade do que tem a dizer.',
      'Tinto leve, como Pinot Noir e Gamay, aceita e agradece 14 °C.',
    ],
    faq: [
      {
        pergunta: 'Qual a temperatura certa para servir vinho tinto?',
        resposta:
          'Entre 14 e 18 °C, conforme o corpo: tintos leves como Pinot Noir e Gamay ficam melhores a 14–15 °C, tintos de corpo médio a 16 °C, e tintos encorpados a 17–18 °C. A expressão "temperatura ambiente" vem de casas europeias sem aquecimento, onde a sala ficava em torno de 16 °C — nada parecido com uma sala brasileira.',
      },
      {
        pergunta: 'Pode colocar gelo no vinho?',
        resposta:
          'Pode, sem cerimônia, se a alternativa for beber um branco quente. O gelo dilui à medida que derrete, o que reduz um pouco a intensidade — mas um vinho levemente diluído e frio agrada mais do que um vinho íntegro e morno. Para evitar a diluição, use uma pedra de gelo grande ou um balde com água, gelo e sal.',
      },
    ],
    corpo: [
      p(
        'Existe uma frase que atravessou o século XX intacta e continua causando estrago: "tinto se serve em temperatura ambiente". A frase é verdadeira e o ambiente é que mudou. Ela nasceu em casas europeias sem aquecimento central, onde a sala de jantar ficava entre 15 e 17 °C. Uma sala em São Paulo em fevereiro fica a 28 °C. Não é a mesma instrução.',
      ),
      h2('O que o calor faz'),
      p(
        'Álcool evapora mais rápido quando a temperatura sobe. Num vinho servido quente, o vapor de etanol domina o espaço da taça e chega ao nariz antes de qualquer aroma de fruta, dando aquela sensação de ardência. Na boca, o calor acentua a percepção de doçura e de álcool e reduz a de acidez — o vinho parece flácido, pesado e mais doce do que é.',
      ),
      h2('O que o frio faz'),
      p(
        'O caminho inverso: o frio realça acidez, amargor e tanino, e apaga aroma. É por isso que espumantes muito baratos são servidos quase congelados — o frio esconde defeito. E é por isso que um bom Champagne servido a 4 °C fica mudo: ele precisa de 8 a 10 °C para mostrar as notas de pão e de amêndoa que justificam o preço.',
      ),
      destaque('Frio esconde defeito. O problema é que ele esconde qualidade pelo mesmo mecanismo.'),
      h2('As faixas, na prática'),
      listaNumerada('Temperatura por tipo', [
        { titulo: 'Espumante · 8 a 10 °C', texto: 'Não abaixo disso. Os bons precisam de calor para falar.' },
        { titulo: 'Branco leve e rosé · 8 a 10 °C', texto: 'Sauvignon Blanc, Albariño, Vinho Verde, rosé de Provence.' },
        { titulo: 'Branco encorpado · 10 a 12 °C', texto: 'Chardonnay com madeira, brancos do Rhône, vinho laranja.' },
        { titulo: 'Tinto leve · 13 a 15 °C', texto: 'Pinot Noir, Gamay, Frappato. Frio faz bem a eles.' },
        { titulo: 'Tinto encorpado · 16 a 18 °C', texto: 'Cabernet, Malbec, Douro, Barolo. Nunca acima de 18 °C.' },
        { titulo: 'Fortificado · 12 a 16 °C', texto: 'Tawny e Madeira levemente frescos; Vintage mais próximo de um tinto.' },
      ]),
      caixa(
        'A regra dos vinte minutos',
        'Tinto que está na estante: vinte minutos na geladeira antes de abrir. Branco que está na geladeira: vinte minutos fora dela antes de servir. Essa única troca de hábito melhora mais o vinho da sua casa do que qualquer taça nova, decantador ou aerador comprado na internet.',
      ),
      p(
        'Vale acrescentar que o vinho esquenta na taça enquanto você bebe — cerca de 2 °C a cada quinze minutos numa sala quente. Servir levemente mais frio do que o ideal não é erro: é planejamento.',
      ),
    ],
    diasAtras: 88,
  },
  {
    slug: 'harmonizacao-na-pratica',
    titulo: 'Harmonização na prática: quatro perguntas antes de escolher',
    subtitulo:
      'Esqueça a tabela de "carne pede tinto". O que funciona é comparar intensidade, gordura, acidez e doçura entre o prato e a garrafa.',
    resumo:
      'A regra de que carne pede tinto e peixe pede branco acerta por acaso e erra com frequência. Harmonizar é comparar quatro variáveis entre o prato e o vinho: intensidade, gordura, acidez e doçura. Este guia transforma essas variáveis em quatro perguntas objetivas que funcionam em qualquer mesa, inclusive na de terça-feira.',
    tipoGuia: 'harmonizacao',
    nivel: 'iniciante',
    chipCor: 'rubi',
    tags: ['harmonizacao', 'restaurante'],
    paraLevar: [
      'Intensidade acompanha intensidade: prato delicado com vinho delicado, prato marcante com vinho marcante.',
      'Acidez no vinho corta gordura no prato — é o mecanismo mais confiável da harmonização.',
      'O vinho precisa ser pelo menos tão doce quanto a sobremesa, ou vai parecer azedo.',
      'Tanino briga com sal e com pimenta, e se acalma com proteína e gordura.',
      'Quando o prato tem molho, harmonize com o molho, não com a proteína.',
    ],
    faq: [
      {
        pergunta: 'Qual vinho combina com comida apimentada?',
        resposta:
          'Branco aromático com leve doçura, como um Riesling off-dry, ou espumante. A pimenta amplifica a percepção de álcool e de tanino, então tintos encorpados e vinhos acima de 14% pioram a ardência. Um pouco de açúcar residual e temperatura baixa acalmam o prato.',
      },
      {
        pergunta: 'Vinho tinto com peixe é sempre errado?',
        resposta:
          'Não. Tintos leves e pouco tânicos, servidos frescos, funcionam bem com peixes de carne firme e com preparos assados. O que costuma dar errado é a combinação de tanino alto com peixe gorduroso, que produz um gosto metálico. A regra útil não é a cor do vinho, e sim o nível de tanino.',
      },
      {
        pergunta: 'O que serve para uma mesa com pratos muito diferentes?',
        resposta:
          'Espumante seco ou um branco de acidez alta e sem madeira. Ambos têm acidez suficiente para atravessar pratos gordurosos e leveza para não atropelar os delicados. Se a mesa exigir tinto, escolha um de corpo médio, tanino baixo e servido fresco.',
      },
    ],
    corpo: [
      p(
        'Toda tabela de harmonização compartilha o mesmo defeito: trata prato e vinho como categorias fixas. Mas um salmão grelhado com limão e um salmão ao molho de manteiga não são o mesmo prato, e um Chardonnay de Chablis e um Chardonnay californiano com barrica nova não são o mesmo vinho. O que funciona é comparar características, não nomes.',
      ),
      h2('Pergunta 1: qual dos dois é mais intenso?'),
      p(
        'Um prato delicado servido ao lado de um vinho potente desaparece; um prato potente ao lado de um vinho delicado transforma a garrafa em água. A primeira decisão é de volume, não de cor. Peixe branco no vapor pede algo leve; costela de três horas pede algo que se sustente sozinho.',
      ),
      h2('Pergunta 2: o prato tem gordura?'),
      p(
        'Se tem, você precisa de acidez. É o mecanismo mais confiável da mesa: a acidez limpa a boca entre garfadas e devolve o apetite. É por isso que espumante com fritura funciona tão bem, e por que um branco tenso resolve uma massa com molho de queijo melhor do que um tinto encorpado.',
      ),
      destaque('Se o prato tem gordura, você precisa de acidez. É a regra que erra menos vezes.'),
      h2('Pergunta 3: existe doçura em jogo?'),
      p(
        'Doçura no prato exige doçura no vinho, e por uma razão física: o açúcar do prato reduz a percepção de doçura do vinho e aumenta a de acidez. Sobremesa com vinho seco produz uma sensação azeda e desagradável. A recíproca é útil: um toque de açúcar residual no vinho domina pimenta, curry e molhos agridoces.',
      ),
      h2('Pergunta 4: qual é o papel do sal e do tanino?'),
      p(
        'Sal amplifica a percepção de amargor e de adstringência. Um tinto muito tânico ao lado de um prato bem salgado fica seco e áspero. Já a gordura e a proteína fazem o oposto: elas se ligam ao tanino e o suavizam. É por isso que a combinação de bife com Cabernet virou lugar-comum — e por que a mesma garrafa fracassa ao lado de anchovas.',
      ),
      caixa(
        'Quando estiver em dúvida',
        'Escolha o vinho da região do prato — a combinação foi testada por gerações — ou abra um espumante seco. Espumante é a escolha mais versátil que existe: tem acidez para gordura, bolha para fritura e leveza para não atropelar nada. É a única garrafa que atravessa um jantar inteiro sem pedir licença.',
      ),
      p(
        'Nenhuma dessas perguntas exige vocabulário técnico ou conhecimento de rótulos. Exige apenas prestar atenção ao que está no prato antes de pegar a garrafa — o que, convenhamos, é uma inversão de ordem que a maioria de nós nunca faz.',
      ),
    ],
    diasAtras: 74,
  },
  {
    slug: 'espumante-o-metodo-explica-o-preco',
    titulo: 'Espumante: o método explica o preço',
    subtitulo:
      'Champagne, Prosecco, Cava e espumante brasileiro custam valores muito diferentes por uma razão concreta — onde a segunda fermentação acontece.',
    resumo:
      'A diferença de preço entre um Prosecco e um Champagne não está no país nem no prestígio, e sim em onde a bolha foi formada: num tanque de aço, em semanas, ou dentro da própria garrafa, ao longo de anos. Este guia explica os dois métodos, o que cada um entrega na taça e quando vale pagar pela diferença.',
    tipoGuia: 'tecnico',
    nivel: 'iniciante',
    chipCor: 'ouro',
    tags: ['espumante', 'champagne', 'rotulo-brasileiro'],
    paraLevar: [
      'Método tradicional: segunda fermentação dentro da garrafa, com anos sobre as leveduras. Dá aroma de pão, brioche e amêndoa.',
      'Método Charmat: segunda fermentação em tanque, engarrafamento rápido. Preserva aroma de fruta e flor.',
      'Nenhum dos dois é superior — eles produzem bebidas diferentes, para ocasiões diferentes.',
      'O espumante brasileiro de método tradicional é o melhor negócio disponível no país hoje.',
      'Brut nature, extra brut, brut e demi-sec indicam açúcar adicionado no final, do mais seco ao mais doce.',
    ],
    faq: [
      {
        pergunta: 'Qual a diferença entre Champagne e Prosecco?',
        resposta:
          'Champagne vem de uma região específica da França e passa pelo método tradicional: a segunda fermentação acontece dentro da garrafa que você compra, seguida de no mínimo quinze meses de repouso sobre as leveduras, o que gera aromas de pão e amêndoa. O Prosecco vem do nordeste italiano e usa o método Charmat, com segunda fermentação em tanque de aço e engarrafamento rápido, preservando aroma de pera e flor branca.',
      },
      {
        pergunta: 'O espumante brasileiro é bom?',
        resposta:
          'É a categoria em que o Brasil compete de igual para igual. O clima da Serra Gaúcha, com noites frias e chuva na vindima, produz uvas de acidez alta e açúcar moderado — exatamente o que um bom espumante exige. Rótulos nacionais de método tradicional na faixa de R$ 80 a R$ 150 costumam entregar mais do que importados do mesmo preço.',
      },
      {
        pergunta: 'O que significa "brut" no rótulo?',
        resposta:
          'Indica a quantidade de açúcar adicionada na etapa final. Brut nature tem até 3 gramas por litro, extra brut até 6, brut até 12, extra dry entre 12 e 17, sec entre 17 e 32 e demi-sec entre 32 e 50. Quase todo espumante recebe alguma dose de açúcar, inclusive os que se apresentam como muito secos.',
      },
    ],
    corpo: [
      p(
        'Toda bolha de espumante é gás carbônico produzido por uma segunda fermentação. A pergunta que separa uma garrafa de R$ 45 de uma de R$ 500 é simples: onde essa segunda fermentação aconteceu, e quanto tempo o vinho ficou em contato com as leveduras mortas depois dela.',
      ),
      h2('Método tradicional: dentro da garrafa'),
      p(
        'O vinho-base recebe açúcar e leveduras, é fechado e fermenta de novo dentro da própria garrafa que chegará à sua mesa. O gás não tem para onde ir e se dissolve no líquido, o que produz bolha fina e persistente. Terminada a fermentação, as leveduras morrem e se decompõem lentamente — processo que leva de quinze meses a vários anos e que transfere ao vinho aromas de pão fresco, brioche, amêndoa e manteiga.',
      ),
      p(
        'Depois vem a parte artesanal: girar cada garrafa aos poucos para concentrar o sedimento no gargalo, congelar essa ponta, expulsar o bloco de borra e completar o volume com uma dose de vinho e açúcar. Cada uma dessas etapas custa tempo, espaço de adega e trabalho. É isso que está no preço.',
      ),
      destaque(
        'Bolha fina não é um capricho estético: é a assinatura física de uma fermentação lenta sob pressão.',
      ),
      h2('Método Charmat: em tanque'),
      p(
        'A segunda fermentação acontece num tanque pressurizado de aço inoxidável, com centenas ou milhares de litros de uma vez, e o vinho é engarrafado sob pressão em poucas semanas. O contato com as leveduras é curto, então não há aroma de pão — e não deveria haver. A intenção é outra: preservar o aroma primário da uva, a pera do Glera no Prosecco, a flor branca do Moscatel.',
      ),
      p(
        'Chamar o Charmat de método inferior é um erro comum. Um Prosecco tratado como Champagne barato decepciona; tratado pelo que é — um espumante frutado, leve e imediato — cumpre exatamente o que promete, por um quarto do preço.',
      ),
      caixa(
        'Onde está o melhor negócio hoje',
        'Espumante brasileiro de método tradicional entre R$ 80 e R$ 150. A Serra Gaúcha tem o clima certo para vinho-base — noites frias, acidez alta, álcool contido — e o custo de produção nacional não carrega frete internacional nem imposto de importação. É a rara categoria em que o consumidor brasileiro paga menos por qualidade comparável.',
      ),
      h2('Uma nota sobre a doçura'),
      p(
        'Quase todo espumante leva açúcar na etapa final, inclusive os que se anunciam secos. A escala vai de brut nature, praticamente sem adição, a demi-sec, com até 50 gramas por litro. Se um espumante seco lhe parece agressivo, o problema costuma ser a temperatura de serviço ou a falta de comida ao lado — não a ausência de açúcar.',
      ),
    ],
    diasAtras: 63,
  },
  {
    slug: 'vinho-natural-organico-biodinamico',
    titulo: 'Vinho natural, orgânico e biodinâmico: o que cada palavra promete',
    subtitulo:
      'Duas dessas categorias têm certificação e regra escrita. A terceira não tem nenhuma das duas — e é justamente a que mais aparece nos rótulos.',
    resumo:
      'Orgânico e biodinâmico são certificações auditadas, com regras publicadas sobre o que pode entrar no vinhedo e na adega. Vinho natural não é categoria legal em lugar nenhum: é um acordo informal entre produtores. Este guia separa o que cada termo garante, o que nenhum deles garante e como isso muda o que você vai encontrar na taça.',
    tipoGuia: 'tecnico',
    nivel: 'intermediario',
    chipCor: 'laranja',
    tags: ['vinho-natural', 'uva-rara'],
    paraLevar: [
      'Orgânico é certificação de vinhedo: proíbe agroquímicos de síntese e é auditada por terceiros.',
      'Biodinâmico inclui as regras orgânicas e acrescenta preparados e calendário próprios, com certificação privada.',
      'Vinho natural não tem definição legal: o consenso informal é uva orgânica, fermentação espontânea e sulfito mínimo.',
      'Nenhum dos três selos garante que o vinho seja bom — garantem apenas como ele foi feito.',
      'Instabilidade não é virtude: vinho natural bem-feito não precisa cheirar a fermento nem a esmalte.',
    ],
    faq: [
      {
        pergunta: 'Vinho natural faz menos mal ou dá menos ressaca?',
        resposta:
          'Não há evidência disso. A ressaca depende principalmente da quantidade de álcool ingerida e da hidratação. Vinhos naturais costumam ter menos sulfitos adicionados, mas sulfito só provoca reação em uma parcela pequena da população, sobretudo pessoas asmáticas, e a quantidade presente no vinho é menor que a de muitas frutas secas.',
      },
      {
        pergunta: 'Vinho orgânico e vinho natural são a mesma coisa?',
        resposta:
          'Não. Orgânico é uma certificação oficial que trata de como a uva é cultivada, com auditoria e selo. Natural é um termo sem regulamentação, que descreve escolhas de adega — fermentação com leveduras nativas, pouca ou nenhuma correção e adição mínima de sulfito. Um vinho pode ser orgânico e nada natural, e vice-versa.',
      },
    ],
    corpo: [
      p(
        'Nos últimos dez anos, três palavras se instalaram nas cartas de vinho e nas prateleiras: orgânico, biodinâmico e natural. Elas são tratadas como sinônimos de um mesmo movimento, mas só duas delas significam algo verificável. Saber qual é qual muda o que se pode esperar da garrafa.',
      ),
      h2('Orgânico: regra escrita e auditoria'),
      p(
        'É a mais objetiva das três. A certificação orgânica proíbe herbicidas, pesticidas e fertilizantes de síntese no vinhedo e é fiscalizada por organismos independentes, com normas próprias na União Europeia, nos Estados Unidos e no Brasil. Desde 2012, a legislação europeia também limita a quantidade de sulfito no vinho acabado, não apenas no cultivo.',
      ),
      h2('Biodinâmico: orgânico com filosofia junto'),
      p(
        'Parte das mesmas exigências agrícolas e acrescenta um sistema criado nos anos 1920, com preparados à base de plantas e minerais, calendário lunar para as operações da vinha e a ideia da propriedade como organismo fechado. A certificação é privada. Há debate legítimo sobre a base científica de parte das práticas; há também um número desproporcional de produtores excelentes no grupo, o que provavelmente diz mais sobre atenção obsessiva ao vinhedo do que sobre o calendário.',
      ),
      destaque(
        'Orgânico e biodinâmico descrevem o vinhedo. Natural descreve a adega — e não tem quem fiscalize.',
      ),
      h2('Natural: um acordo entre produtores'),
      p(
        'Não existe lei que defina vinho natural em nenhum país relevante. O que existe é um consenso informal: uva de cultivo orgânico, fermentação com leveduras nativas, sem correção de acidez ou de açúcar, sem filtragem pesada e com sulfito adicionado apenas em dose mínima, ou nenhuma. A França criou em 2020 uma menção voluntária, "vin méthode nature", mas ela não vale fora do país e não é obrigatória.',
      ),
      h2('O que isso faz com o vinho'),
      p(
        'Sem sulfito e sem filtragem, o vinho fica vivo e imprevisível: pode ter leve turbidez, uma ponta de gás e variação entre garrafas do mesmo lote. Nas mãos certas, ganha textura e uma expressão de fruta que vinhos convencionais raramente alcançam. Nas mãos erradas, chega à taça com cheiro de fermento, de vinagre ou de esmalte — defeitos com nome técnico que às vezes são vendidos como personalidade.',
      ),
      caixa(
        'Como comprar sem depender de sorte',
        'Compre em lojas que armazenam refrigerado: vinho natural sofre com calor mais do que o convencional. Prefira safras recentes. E confie mais no importador do que no rótulo — quem seleciona bem nessa categoria costuma ser especializado, e o nome dele no contrarrótulo é uma garantia melhor do que qualquer selo.',
      ),
      p(
        'Nenhum dos três termos é promessa de qualidade. São informações sobre método, e método é apenas o começo da conversa. A pergunta que continua valendo é a de sempre: o vinho está bom na taça?',
      ),
    ],
    diasAtras: 51,
  },
  {
    slug: 'riesling-o-branco-mal-compreendido',
    titulo: 'Riesling: o branco mais mal compreendido do Brasil',
    subtitulo:
      'Uma reputação de vinho doce, construída nos anos 1980 por rótulos alemães industriais, ainda afasta o público da uva branca mais longeva do mundo.',
    resumo:
      'A Riesling tem acidez altíssima, álcool baixo e capacidade de envelhecer por décadas, mas carrega no Brasil a fama de vinho doce e simples — herança de rótulos industriais dos anos 1980. Este guia explica como identificar um Riesling seco no rótulo, o que esperar de cada região e por que a uva funciona tão bem com comida brasileira.',
    tipoGuia: 'uva',
    nivel: 'intermediario',
    chipCor: 'palha',
    tags: ['uva-rara', 'harmonizacao'],
    paraLevar: [
      'Riesling existe do seco absoluto ao doce de sobremesa: a palavra "trocken" no rótulo alemão significa seco.',
      'Álcool baixo, entre 8% e 12%, é característica da uva, não sinal de vinho fraco.',
      'A acidez alta faz da Riesling o branco mais versátil com comida apimentada e agridoce.',
      'Bons Riesling envelhecem trinta anos ou mais — mais do que a maioria dos tintos da mesma faixa de preço.',
    ],
    faq: [
      {
        pergunta: 'Todo Riesling é doce?',
        resposta:
          'Não. A maior parte do Riesling produzido hoje na Alemanha e praticamente todo o da Alsácia e da Austrália é seco. A confusão vem de rótulos industriais de exportação vendidos nos anos 1980. No rótulo alemão, "trocken" indica seco e "halbtrocken" ou "feinherb" indicam meio-seco.',
      },
      {
        pergunta: 'Riesling combina com quê?',
        resposta:
          'A acidez alta e o baixo teor alcoólico fazem dela uma das melhores companhias para comida apimentada, frituras, preparos agridoces e cozinha asiática. Versões secas funcionam com peixes e frango; versões com açúcar residual acalmam pimenta melhor do que qualquer tinto.',
      },
      {
        pergunta: 'Por quanto tempo um Riesling pode ser guardado?',
        resposta:
          'Rótulos de boa origem evoluem por vinte a trinta anos, e alguns por mais. A acidez alta funciona como conservante natural. Com o tempo, o vinho perde o aroma cítrico e ganha notas de mel, cera e querosene — esta última, apesar do nome, é considerada uma virtude entre quem conhece a uva.',
      },
    ],
    corpo: [
      p(
        'Pergunte a qualquer pessoa que bebe vinho no Brasil o que ela pensa de Riesling e a resposta virá em duas partes: "é doce" e "não é para mim". As duas estão erradas, e a culpa não é de quem responde. É de uma geração de rótulos alemães baratos, adocicados e produzidos em escala industrial que inundou o mercado internacional nos anos 1970 e 1980 e associou a uva a uma bebida que ela quase nunca é.',
      ),
      h2('O que a uva realmente é'),
      p(
        'Riesling é uma casta de clima frio, aromática, de acidez muito alta e álcool naturalmente baixo — entre 8% e 12% nos vinhos alemães. Ela tem uma característica rara: transmite diferenças de solo com clareza quase didática. O mesmo produtor, com a mesma vinificação, em duas encostas separadas por trezentos metros, entrega dois vinhos distinguíveis.',
      ),
      h2('Como saber se é seco antes de abrir'),
      p(
        'No rótulo alemão, procure "trocken", que significa seco. "Halbtrocken" e "feinherb" indicam meio-seco, com açúcar residual perceptível mas equilibrado pela acidez. Rótulos da Alsácia, na França, e da Austrália são secos por padrão e não costumam declarar nada. Uma pista indireta: teor alcoólico de 12% ou mais quase sempre indica fermentação completa, portanto vinho seco.',
      ),
      destaque(
        'A Riesling transmite diferenças de solo com clareza quase didática. Poucas castas fazem isso.',
      ),
      h2('Por que combina com a mesa brasileira'),
      p(
        'Acidez alta corta gordura, álcool baixo não amplifica pimenta e um resto de açúcar acalma o ardido. Isso descreve, com precisão, o vinho ideal para moqueca, para acarajé, para comida tailandesa e para qualquer prato agridoce. É também o motivo pelo qual sommeliers pedem Riesling quando a mesa tem pratos que não conversam entre si.',
      ),
      caixa(
        'Querosene não é defeito',
        'Riesling com alguns anos de garrafa desenvolve uma nota que a literatura técnica chama de querosene ou petróleo, resultado de um composto que se forma naturalmente com o tempo e com a exposição solar da uva. Quem conhece a casta procura por ela. Quem encontra pela primeira vez costuma achar que o vinho estragou — não estragou.',
      ),
      p(
        'A boa notícia para quem quiser experimentar: como a demanda ainda é baixa, o Riesling é uma das últimas castas nobres em que R$ 150 compram um vinho de produtor sério, de vinhedo identificado e com potencial de guarda de vinte anos. Nenhum tinto da mesma faixa oferece isso.',
      ),
    ],
    diasAtras: 40,
  },
]

async function semearGuias(
  idDaAutora: number,
  tags: Indice,
): Promise<Indice> {
  secao('Guias')
  const indice: Indice = {}

  for (const guia of GUIAS) {
    indice[guia.slug] = await semear(
      'guias',
      porSlug(guia.slug),
      {
        titulo: guia.titulo,
        slug: guia.slug,
        subtitulo: guia.subtitulo,
        resumo: guia.resumo,
        corpo: rico(...guia.corpo),
        paraLevar: guia.paraLevar.map((texto) => ({ texto })),
        faq: guia.faq,
        tipoGuia: guia.tipoGuia,
        nivel: guia.nivel,
        autor: idDaAutora,
        tags: guia.tags.map((slug) => tags[slug]).filter(Boolean),
        chipCor: guia.chipCor as never,
        dataPublicacao: diasAtras(guia.diasAtras),
        dataAtualizacao: diasAtras(Math.max(2, Math.round(guia.diasAtras / 4))),
        _status: 'published',
      },
      guia.titulo,
    )
  }

  return indice
}

/* -------------------------------------------------------------------------- */
/* 4. Vinhos                                                                   */
/* -------------------------------------------------------------------------- */

interface SementeDeVinho {
  slug: string
  nome: string
  produtor: string
  pais: string
  regiao?: string
  subRegiao?: string
  safra?: number
  tipo: 'tinto' | 'branco' | 'rose' | 'espumante' | 'laranja' | 'fortificado'
  corpoVinho?: 'leve' | 'medio' | 'encorpado'
  teorAlcoolico: number
  corNaEscala: string
  uvas: [string, number][]
  nota: number
  veredito: string
  notas: string[]
  harmonizacoes: { prato: string; observacao: string }[]
  temperaturaServico: string
  potencialGuarda: string
  tacaRecomendada: string
  decantacao?: string
  faixaPreco: string
  importadora: string
  tags: string[]
  guias: string[]
  similares: string[]
  diasAtras: number
}

const VINHOS: SementeDeVinho[] = [
  {
    slug: 'quinta-do-vale-escuro-reserva-2021',
    nome: 'Reserva Tinto',
    produtor: 'Quinta do Vale Escuro',
    pais: 'Portugal',
    regiao: 'douro',
    subRegiao: 'Cima Corgo',
    safra: 2021,
    tipo: 'tinto',
    corpoVinho: 'encorpado',
    teorAlcoolico: 14,
    corNaEscala: 'granada',
    uvas: [
      ['touriga-nacional', 60],
      ['tempranillo', 40],
    ],
    nota: 4.5,
    veredito:
      'Um Douro clássico que não abre mão da estrutura, mas resolve o tanino com elegância em vez de força. Flor de violeta, ameixa preta e um fundo de xisto molhado; na boca é seco, longo e ainda meio fechado. Precisa de ar hoje e de dois anos de garrafa para mostrar tudo — e vale a espera.',
    notas: [
      'No nariz, violeta e ameixa preta madura sobre um fundo mineral seco, quase de pedra molhada. A madeira aparece como especiaria escura, não como baunilha, o que indica barrica usada e passagem contida.',
      'Na boca, entra apertado e abre depois de vinte minutos. O tanino é fino e cobre toda a língua sem secar as gengivas; a acidez sustenta o meio-de-boca e o final é seco, com um retorno de cacau amargo que dura bem mais de dez segundos.',
    ],
    harmonizacoes: [
      { prato: 'Costela assada lentamente', observacao: 'A gordura da carne dissolve o tanino ainda firme do vinho.' },
      { prato: 'Cabrito ao forno com batatas', observacao: 'Combinação regional testada por gerações no norte de Portugal.' },
      { prato: 'Queijo da Serra curado', observacao: 'A untuosidade do queijo pede a acidez e o final seco deste tinto.' },
    ],
    temperaturaServico: '16 a 18 °C',
    potencialGuarda: 'Beber entre 2027 e 2034',
    tacaRecomendada: 'Bordeaux',
    decantacao: 'Abrir uma hora antes ou decantar por trinta minutos',
    faixaPreco: '150-250',
    importadora: 'casa-iberica',
    tags: ['portugal', 'vinho-de-guarda'],
    guias: ['douro-alem-do-porto'],
    similares: ['cascina-rovereto-barolo-2019', 'vina-piedra-clara-cabernet-2021'],
    diasAtras: 18,
  },
  {
    slug: 'bodega-alto-ramal-malbec-finca-la-loma-2022',
    nome: 'Malbec Finca La Loma',
    produtor: 'Bodega Alto Ramal',
    pais: 'Argentina',
    regiao: 'mendoza',
    subRegiao: 'Valle de Uco, 1.250 m',
    safra: 2022,
    tipo: 'tinto',
    corpoVinho: 'encorpado',
    teorAlcoolico: 14.5,
    corNaEscala: 'purpura',
    uvas: [['malbec', 100]],
    nota: 4,
    veredito:
      'O Malbec de altitude fazendo exatamente o que se espera dele: fruta escura generosa, tanino macio e acidez suficiente para não cansar na segunda taça. A madeira está bem dosada, o que é raro nesta faixa de preço. Não é um vinho de guarda; é um vinho de quarta-feira que se comporta como um de sábado.',
    notas: [
      'Amora, ameixa e uma nota floral de violeta que a altitude costuma preservar. Ao fundo, um toque de pimenta-preta e de grafite; a barrica aparece discreta, mais como textura do que como aroma.',
      'Entrada macia, meio-de-boca cheio e final de comprimento médio, com o tanino aveludado que popularizou a casta. A acidez segura o conjunto e evita a sensação pesada comum em Malbec de sol demais.',
    ],
    harmonizacoes: [
      { prato: 'Bife ancho na brasa', observacao: 'A gordura marmorizada da carne encontra o tanino macio sem disputa.' },
      { prato: 'Empanada de carne', observacao: 'Prato e vinho vêm do mesmo lugar, e a massa frita pede a acidez.' },
      { prato: 'Berinjela assada com melaço', observacao: 'A doçura defumada do prato conversa com a fruta madura da uva.' },
    ],
    temperaturaServico: '16 a 17 °C',
    potencialGuarda: 'Beber até 2028',
    tacaRecomendada: 'Bordeaux',
    faixaPreco: '80-150',
    importadora: 'vinci-importadora',
    tags: ['argentina', 'preco-justo'],
    guias: ['malbec-o-que-a-uva-virou'],
    similares: ['vina-piedra-clara-cabernet-2021', 'vinicola-pedra-fria-merlot-2021'],
    diasAtras: 26,
  },
  {
    slug: 'vina-piedra-clara-cabernet-2021',
    nome: 'Cabernet Sauvignon Gran Reserva',
    produtor: 'Viña Piedra Clara',
    pais: 'Chile',
    regiao: 'vale-de-colchagua',
    subRegiao: 'Apalta',
    safra: 2021,
    tipo: 'tinto',
    corpoVinho: 'encorpado',
    teorAlcoolico: 13.5,
    corNaEscala: 'purpura',
    uvas: [
      ['cabernet-sauvignon', 90],
      ['merlot', 10],
    ],
    nota: 3.5,
    veredito:
      'Cabernet chileno correto e previsível, do tipo que resolve um jantar sem chamar atenção para si. Cassis, pimentão maduro e um traço de menta; tanino presente mas domado. Falta-lhe alguma tensão para justificar a palavra "gran reserva" no rótulo, mas pelo preço entrega o que promete.',
    notas: [
      'Cassis e amora sobre a nota herbácea característica da casta no Chile, entre pimentão maduro e folha de tomate. Um sopro de menta e de café aparece depois de alguns minutos.',
      'Ataque firme, tanino de granulação média e final de amargor leve. A madeira dá volume ao centro da boca mas encurta o final, e é aí que o vinho mostra o preço que tem.',
    ],
    harmonizacoes: [
      { prato: 'Hambúrguer caseiro com queijo curado', observacao: 'O tanino corta a gordura e a fruta acompanha o pão tostado.' },
      { prato: 'Escondidinho de carne seca', observacao: 'A doçura do purê equilibra o amargor final do vinho.' },
    ],
    temperaturaServico: '16 a 18 °C',
    potencialGuarda: 'Beber até 2027',
    tacaRecomendada: 'Bordeaux',
    faixaPreco: 'ate-80',
    importadora: 'norte-sul-vinhos',
    tags: ['chile', 'preco-justo'],
    guias: ['como-ler-um-rotulo-de-vinho'],
    similares: ['bodega-alto-ramal-malbec-finca-la-loma-2022'],
    diasAtras: 33,
  },
  {
    slug: 'domaine-des-trois-fontaines-bourgogne-rouge-2022',
    nome: 'Bourgogne Rouge',
    produtor: 'Domaine des Trois Fontaines',
    pais: 'França',
    regiao: 'borgonha',
    subRegiao: 'Côte de Beaune',
    safra: 2022,
    tipo: 'tinto',
    corpoVinho: 'leve',
    teorAlcoolico: 13,
    corNaEscala: 'cereja',
    uvas: [['pinot-noir', 100]],
    nota: 4.5,
    veredito:
      'Um Bourgogne de entrada que explica, em uma taça, por que a Pinot Noir custa o que custa. Cor translúcida, aroma de cereja fresca e terra úmida, tanino quase inexistente e uma acidez que dá vontade de beber de novo. Serve levemente fresco e não precisa de ocasião especial.',
    notas: [
      'Cereja vermelha, framboesa e um fundo de terra molhada e cogumelo que a casta desenvolve mesmo em vinhos jovens. Nada de madeira aparente.',
      'Leve, quase transparente na boca, mas com definição: acidez viva, tanino sedoso e um final salgado de comprimento surpreendente para a categoria. É o tipo de vinho que melhora com comida ao lado.',
    ],
    harmonizacoes: [
      { prato: 'Frango assado com ervas', observacao: 'O clássico da região, e um dos poucos casamentos realmente infalíveis.' },
      { prato: 'Risoto de cogumelos', observacao: 'A nota terrosa do vinho amplifica a do prato em vez de competir.' },
      { prato: 'Salmão grelhado', observacao: 'Tanino baixo é o que permite tinto com peixe gordo sem gosto metálico.' },
    ],
    temperaturaServico: '14 a 15 °C',
    potencialGuarda: 'Beber até 2029',
    tacaRecomendada: 'Borgonha',
    faixaPreco: '250-400',
    importadora: 'alameda-wine',
    tags: ['vinho-de-guarda', 'harmonizacao'],
    guias: ['temperatura-de-servico'],
    similares: ['podere-casanuova-chianti-classico-2021'],
    diasAtras: 41,
  },
  {
    slug: 'podere-casanuova-chianti-classico-2021',
    nome: 'Chianti Classico',
    produtor: 'Podere Casanuova',
    pais: 'Itália',
    regiao: 'toscana',
    subRegiao: 'Gaiole in Chianti',
    safra: 2021,
    tipo: 'tinto',
    corpoVinho: 'medio',
    teorAlcoolico: 13.5,
    corNaEscala: 'rubi',
    uvas: [['sangiovese', 100]],
    nota: 4,
    veredito:
      'Sangiovese sem maquiagem: cereja azeda, tomate seco e um final de tanino seco que pede comida imediatamente. É um vinho construído para a mesa, não para a taça solitária, e nesse papel funciona melhor do que a maioria dos tintos do dobro do preço.',
    notas: [
      'Cereja azeda, casca de laranja e uma nota herbácea de orégano seco. Ao fundo, couro e um traço de tomate ao sol — o retrato aromático da casta na Toscana.',
      'Acidez alta e tanino seco, quase áspero sem comida. Com um prato ao lado o conjunto se organiza: a acidez limpa a gordura e o final ganha comprimento.',
    ],
    harmonizacoes: [
      { prato: 'Massa ao sugo com manjericão', observacao: 'A acidez do tomate encontra a do vinho, e nenhuma das duas incomoda.' },
      { prato: 'Pizza margherita', observacao: 'Combinação regional e uma das mais confiáveis que existem.' },
      { prato: 'Bruschetta com azeite verde', observacao: 'O amargor do azeite novo espelha o final seco do vinho.' },
    ],
    temperaturaServico: '15 a 17 °C',
    potencialGuarda: 'Beber até 2029',
    tacaRecomendada: 'Universal de bojo médio',
    faixaPreco: '150-250',
    importadora: 'vinci-importadora',
    tags: ['harmonizacao', 'restaurante'],
    guias: ['harmonizacao-na-pratica'],
    similares: ['domaine-des-trois-fontaines-bourgogne-rouge-2022', 'cascina-rovereto-barolo-2019'],
    diasAtras: 48,
  },
  {
    slug: 'cascina-rovereto-barolo-2019',
    nome: 'Barolo',
    produtor: 'Cascina Rovereto',
    pais: 'Itália',
    regiao: 'piemonte',
    subRegiao: 'Serralunga d’Alba',
    safra: 2019,
    tipo: 'tinto',
    corpoVinho: 'encorpado',
    teorAlcoolico: 14.5,
    corNaEscala: 'granada',
    uvas: [['nebbiolo', 100]],
    nota: 5,
    veredito:
      'Um Barolo que faz o que só a Nebbiolo faz: cor pálida, aroma imenso e tanino de granito. Rosa seca, alcatrão, cereja em conserva e couro; na boca, austero, longuíssimo e ainda a alguns anos do auge. É caro, é exigente e é um dos poucos vinhos que justificam as duas coisas.',
    notas: [
      'Rosa seca, alcatrão, cereja em conserva e casca de laranja amarga. Depois de meia hora na taça, chegam couro, ervas secas e uma nota de anis que não estava lá no início.',
      'Ataque enganosamente leve seguido de um tanino que toma a boca inteira e não solta. A acidez é alta, o álcool está integrado e o final passa fácil de trinta segundos, com retorno de fruta em conserva.',
    ],
    harmonizacoes: [
      { prato: 'Ossobuco com polenta', observacao: 'A gelatina do cozido longo é a única coisa que doma o tanino jovem.' },
      { prato: 'Risoto com trufa', observacao: 'Aroma terroso de um lado, aroma terroso do outro: eles se somam.' },
      { prato: 'Queijos duros de longa maturação', observacao: 'A cristalização do queijo velho pede acidez e estrutura nesta escala.' },
    ],
    temperaturaServico: '17 a 18 °C',
    potencialGuarda: 'Beber entre 2028 e 2040',
    tacaRecomendada: 'Borgonha de bojo largo',
    decantacao: 'Decantar por duas horas, ou abrir na véspera',
    faixaPreco: 'acima-700',
    importadora: 'alameda-wine',
    tags: ['vinho-de-guarda', 'uva-rara'],
    guias: ['temperatura-de-servico'],
    similares: ['quinta-do-vale-escuro-reserva-2021', 'podere-casanuova-chianti-classico-2021'],
    diasAtras: 55,
  },
  {
    slug: 'vinicola-pedra-fria-merlot-2021',
    nome: 'Merlot Reserva',
    produtor: 'Vinícola Pedra Fria',
    pais: 'Brasil',
    regiao: 'serra-gaucha',
    subRegiao: 'Vale dos Vinhedos',
    safra: 2021,
    tipo: 'tinto',
    corpoVinho: 'medio',
    teorAlcoolico: 13,
    corNaEscala: 'rubi',
    uvas: [['merlot', 100]],
    nota: 4,
    veredito:
      'O melhor argumento a favor do Merlot brasileiro: fruta vermelha limpa, acidez alta e álcool contido, sem tentar imitar o peso de um tinto chileno. É um vinho de mesa no melhor sentido da palavra, e nesta faixa de preço bate boa parte do importado equivalente.',
    notas: [
      'Ameixa vermelha, framboesa e uma nota de folha de figueira. A madeira mal aparece, o que é uma escolha acertada para o estilo.',
      'Corpo médio, acidez viva e tanino discreto. O final é limpo e um pouco curto, mas sem arestas — um vinho feito para beber, não para analisar.',
    ],
    harmonizacoes: [
      { prato: 'Galeto assado', observacao: 'Prato e vinho dividem a mesma região e a mesma escala de intensidade.' },
      { prato: 'Massa com molho de linguiça', observacao: 'A acidez do vinho corta a gordura da carne suína.' },
      { prato: 'Tábua de frios', observacao: 'Serve levemente fresco: funciona melhor a 15 °C do que a 18 °C.' },
    ],
    temperaturaServico: '15 a 16 °C',
    potencialGuarda: 'Beber até 2027',
    tacaRecomendada: 'Universal de bojo médio',
    faixaPreco: '80-150',
    importadora: 'companhia-do-meridiano',
    tags: ['rotulo-brasileiro', 'preco-justo'],
    guias: ['como-ler-um-rotulo-de-vinho'],
    similares: ['bodega-alto-ramal-malbec-finca-la-loma-2022', 'vinicola-alto-da-serra-brut-nature-2021'],
    diasAtras: 12,
  },
  {
    slug: 'maison-bellecourt-macon-villages-2022',
    nome: 'Mâcon-Villages',
    produtor: 'Maison Bellecourt',
    pais: 'França',
    regiao: 'borgonha',
    subRegiao: 'Mâconnais',
    safra: 2022,
    tipo: 'branco',
    corpoVinho: 'medio',
    teorAlcoolico: 13,
    corNaEscala: 'ouro',
    uvas: [['chardonnay', 100]],
    nota: 4,
    veredito:
      'Chardonnay branco da Borgonha na faixa de entrada, feito com contenção: fruta amarela madura, um toque de manteiga e acidez preservada. É a demonstração de que a uva não precisa de barrica nova para ter textura. Beba nos próximos dois anos e sirva a 11 °C, não gelado.',
    notas: [
      'Pêssego branco, maçã madura e avelã leve, com um traço de manteiga fresca que vem da fermentação, não da madeira.',
      'Textura cremosa no centro da boca sustentada por acidez cítrica. O final é seco e levemente amendoado, com bom comprimento para a denominação.',
    ],
    harmonizacoes: [
      { prato: 'Frango com creme e cogumelos', observacao: 'A textura do vinho acompanha a do molho sem pesar.' },
      { prato: 'Peixe branco na manteiga', observacao: 'Gordura da manteiga contra acidez do vinho: o mecanismo básico funcionando.' },
      { prato: 'Queijo de cabra maturado', observacao: 'A acidez limpa o paladar entre uma mordida e outra.' },
    ],
    temperaturaServico: '10 a 12 °C',
    potencialGuarda: 'Beber até 2027',
    tacaRecomendada: 'Branca de bojo médio',
    faixaPreco: '80-150',
    importadora: 'alameda-wine',
    tags: ['harmonizacao'],
    guias: ['temperatura-de-servico'],
    similares: ['maison-perrichon-champagne-brut-reserve', 'domaine-de-la-roche-grise-sancerre-2023'],
    diasAtras: 60,
  },
  {
    slug: 'domaine-de-la-roche-grise-sancerre-2023',
    nome: 'Sancerre',
    produtor: 'Domaine de la Roche Grise',
    pais: 'França',
    regiao: 'vale-do-loire',
    subRegiao: 'Sancerre',
    safra: 2023,
    tipo: 'branco',
    corpoVinho: 'leve',
    teorAlcoolico: 12.5,
    corNaEscala: 'verde-palha',
    uvas: [['sauvignon-blanc', 100]],
    nota: 4.5,
    veredito:
      'Sauvignon Blanc no seu registro mais preciso: cítrico, mineral e cortante, sem o excesso de maracujá dos exemplares do Novo Mundo. Tem tensão, salinidade e um final de pedra molhada que dura. É caro para um branco de beber jovem — e ainda assim vale, porque quase nada faz o que ele faz.',
    notas: [
      'Limão siciliano, groselha branca e folha de tomate, com um fundo mineral seco que lembra sílex. Nenhuma nota tropical exagerada.',
      'Ataque cítrico e afiado, meio-de-boca esguio e final longo e salgado. É um vinho de linhas retas, sem curvas — o que na Sauvignon Blanc é uma virtude.',
    ],
    harmonizacoes: [
      { prato: 'Queijo de cabra fresco', observacao: 'A combinação regional mais famosa da França, e por bons motivos.' },
      { prato: 'Ostras e frutos do mar crus', observacao: 'A salinidade do vinho amplifica a do mar.' },
      { prato: 'Salada com ervas e vinagrete', observacao: 'Um dos poucos vinhos que sobrevive ao vinagre no prato.' },
    ],
    temperaturaServico: '9 a 10 °C',
    potencialGuarda: 'Beber até 2027',
    tacaRecomendada: 'Branca de bojo estreito',
    faixaPreco: '250-400',
    importadora: 'alameda-wine',
    tags: ['harmonizacao', 'preco-justo'],
    guias: ['harmonizacao-na-pratica'],
    similares: ['adega-pazo-do-souto-albarino-2023', 'weingut-steinhof-riesling-trocken-2022'],
    diasAtras: 68,
  },
  {
    slug: 'weingut-steinhof-riesling-trocken-2022',
    nome: 'Riesling Trocken',
    produtor: 'Weingut Steinhof',
    pais: 'Alemanha',
    regiao: 'mosel',
    subRegiao: 'Mittelmosel',
    safra: 2022,
    tipo: 'branco',
    corpoVinho: 'leve',
    teorAlcoolico: 11.5,
    corNaEscala: 'palha',
    uvas: [['riesling', 100]],
    nota: 5,
    veredito:
      'Um Riesling seco que desmonta em cinco minutos a fama de vinho doce que a casta carrega no Brasil. Limão, pêssego branco e pedra; acidez altíssima sustentando um corpo leve de 11,5% de álcool. É preciso, longo e um dos melhores vinhos por real que se pode comprar hoje.',
    notas: [
      'Limão-taiti, pêssego branco e uma nota inconfundível de pedra molhada, herança do solo de xisto. Um leve toque de mel de flores começa a aparecer com o ar.',
      'Seco de verdade, com acidez vibrante que percorre a língua e um final salgado, longo e sem álcool aparente. A textura é fina mas nunca magra.',
    ],
    harmonizacoes: [
      { prato: 'Moqueca de peixe', observacao: 'Acidez alta e álcool baixo são o que a pimenta e o dendê pedem.' },
      { prato: 'Comida tailandesa agridoce', observacao: 'O leve resto de fruta do vinho acalma o ardido sem apagar o prato.' },
      { prato: 'Porco assado com maçã', observacao: 'Combinação clássica alemã: gordura, doçura e acidez em equilíbrio.' },
    ],
    temperaturaServico: '9 a 11 °C',
    potencialGuarda: 'Beber até 2038',
    tacaRecomendada: 'Branca de bojo estreito',
    faixaPreco: '150-250',
    importadora: 'bruma-importadora',
    tags: ['uva-rara', 'harmonizacao'],
    guias: ['riesling-o-branco-mal-compreendido'],
    similares: ['domaine-de-la-roche-grise-sancerre-2023', 'azienda-colle-sasso-ribolla-anfora-2021'],
    diasAtras: 8,
  },
  {
    slug: 'adega-pazo-do-souto-albarino-2023',
    nome: 'Albariño',
    produtor: 'Adega Pazo do Souto',
    pais: 'Espanha',
    regiao: 'rias-baixas',
    subRegiao: 'Val do Salnés',
    safra: 2023,
    tipo: 'branco',
    corpoVinho: 'medio',
    teorAlcoolico: 12.5,
    corNaEscala: 'verde-palha',
    uvas: [['albarino', 100]],
    nota: 4,
    veredito:
      'Branco atlântico de manual: casca de limão, maçã verde e uma salinidade que parece vir direto da maré. Tem corpo suficiente para não sumir ao lado de frutos do mar e acidez para pedir a próxima garfada. É a compra mais segura da faixa de cem reais para uma mesa de peixe.',
    notas: [
      'Casca de limão, maçã verde e flor de laranjeira, com um fundo salino discreto e persistente.',
      'Corpo médio com textura levemente cremosa, acidez firme e final salgado. Ganha em complexidade meia hora depois de aberto.',
    ],
    harmonizacoes: [
      { prato: 'Polvo à galega', observacao: 'A dupla regional da Galícia: o vinho nasceu para este prato.' },
      { prato: 'Camarão na chapa com alho', observacao: 'A salinidade do vinho reforça a doçura do crustáceo.' },
      { prato: 'Arroz de frutos do mar', observacao: 'Corpo médio é o necessário para não desaparecer sob o caldo.' },
    ],
    temperaturaServico: '9 a 11 °C',
    potencialGuarda: 'Beber até 2027',
    tacaRecomendada: 'Branca de bojo médio',
    faixaPreco: '80-150',
    importadora: 'casa-iberica',
    tags: ['harmonizacao', 'preco-justo'],
    guias: ['harmonizacao-na-pratica'],
    similares: ['domaine-de-la-roche-grise-sancerre-2023', 'chateau-val-dombre-rose-2023'],
    diasAtras: 74,
  },
  {
    slug: 'chateau-val-dombre-rose-2023',
    nome: 'Côtes de Provence Rosé',
    produtor: 'Château Val d’Ombre',
    pais: 'França',
    regiao: 'provence',
    subRegiao: 'Côtes de Provence',
    safra: 2023,
    tipo: 'rose',
    corpoVinho: 'leve',
    teorAlcoolico: 12.5,
    corNaEscala: 'rosa-palido',
    uvas: [
      ['garnacha', 60],
      ['syrah', 40],
    ],
    nota: 3,
    veredito:
      'Rosé de Provence correto e absolutamente previsível: cor pálida, morango discreto, acidez adequada e final curto. O problema não é o vinho, é a conta — pelo mesmo dinheiro há brancos e espumantes que entregam bem mais. Compre se a cor na mesa importa; troque se o que importa é a taça.',
    notas: [
      'Morango branco, melancia e um toque de casca de laranja. O aroma é discreto e se dissipa rápido na taça.',
      'Leve, seco e cítrico, com meio-de-boca fino e final curto. Refrescante e agradável, sem nada que fique na memória.',
    ],
    harmonizacoes: [
      { prato: 'Salada niçoise', observacao: 'Prato e vinho vêm da mesma costa e compartilham a mesma leveza.' },
      { prato: 'Tábua de vegetais grelhados', observacao: 'A acidez do vinho substitui o limão que o prato pediria.' },
    ],
    temperaturaServico: '8 a 10 °C',
    potencialGuarda: 'Beber ainda em 2026',
    tacaRecomendada: 'Branca de bojo médio',
    faixaPreco: '150-250',
    importadora: 'norte-sul-vinhos',
    tags: ['preco-justo', 'harmonizacao'],
    guias: ['temperatura-de-servico'],
    similares: ['adega-pazo-do-souto-albarino-2023'],
    diasAtras: 81,
  },
  {
    slug: 'maison-perrichon-champagne-brut-reserve',
    nome: 'Champagne Brut Réserve',
    produtor: 'Maison Perrichon',
    pais: 'França',
    regiao: 'champagne',
    subRegiao: 'Vallée de la Marne',
    tipo: 'espumante',
    corpoVinho: 'medio',
    teorAlcoolico: 12,
    corNaEscala: 'ouro',
    uvas: [
      ['chardonnay', 60],
      ['pinot-noir', 40],
    ],
    nota: 4.5,
    veredito:
      'Champagne sem safra que mostra por que o método tradicional custa o que custa: bolha fina, aroma de pão tostado e amêndoa, e uma acidez que atravessa a refeição inteira. Sirva a 9 °C, não a 4 °C — gelado demais, ele fica mudo e você paga caro por um silêncio.',
    notas: [
      'Maçã amarela, casca de limão e uma camada nítida de pão tostado, brioche e amêndoa, resultado dos anos sobre as leveduras.',
      'Bolha fina e persistente, textura cremosa e acidez cortante que limpa a boca por completo. O final é seco, longo e levemente salgado.',
    ],
    harmonizacoes: [
      { prato: 'Ostras', observacao: 'Acidez e salinidade se encontram sem que nenhuma das duas domine.' },
      { prato: 'Batata frita e frituras em geral', observacao: 'Bolha e acidez desmontam a gordura — a harmonização mais subestimada que existe.' },
      { prato: 'Frango assado', observacao: 'A nota tostada do vinho espelha a pele dourada da ave.' },
    ],
    temperaturaServico: '9 a 10 °C',
    potencialGuarda: 'Beber até 2030',
    tacaRecomendada: 'Branca de bojo alongado, nunca flûte estreita',
    faixaPreco: '400-700',
    importadora: 'vinci-importadora',
    tags: ['champagne', 'espumante'],
    guias: ['espumante-o-metodo-explica-o-preco'],
    similares: ['vinicola-alto-da-serra-brut-nature-2021', 'maison-bellecourt-macon-villages-2022'],
    diasAtras: 5,
  },
  {
    slug: 'vinicola-alto-da-serra-brut-nature-2021',
    nome: 'Brut Nature',
    produtor: 'Vinícola Alto da Serra',
    pais: 'Brasil',
    regiao: 'serra-gaucha',
    subRegiao: 'Pinto Bandeira',
    safra: 2021,
    tipo: 'espumante',
    corpoVinho: 'leve',
    teorAlcoolico: 12,
    corNaEscala: 'palha',
    uvas: [
      ['chardonnay', 70],
      ['pinot-noir', 30],
    ],
    nota: 4,
    veredito:
      'Método tradicional brasileiro com trinta meses sobre as leveduras e nenhum açúcar de correção — e o resultado sustenta a comparação com europeus de preço bem mais alto. Maçã verde, pão e limão, acidez firme e final seco. Hoje é o melhor negócio do mercado nacional de vinho.',
    notas: [
      'Maçã verde, limão e uma camada de pão fresco e levedura que denuncia o tempo de repouso. Sem doçura no aroma.',
      'Ataque seco e afiado, bolha fina, meio-de-boca com textura e final cítrico e salgado. A ausência total de açúcar deixa o vinho exposto — e ele aguenta.',
    ],
    harmonizacoes: [
      { prato: 'Pastel de feira', observacao: 'Fritura pede bolha e acidez; a combinação é séria, apesar da piada.' },
      { prato: 'Sushi e sashimi', observacao: 'Sem açúcar residual, o vinho não briga com o arroz avinagrado.' },
      { prato: 'Queijo brie', observacao: 'A acidez limpa a gordura láctea entre uma fatia e outra.' },
    ],
    temperaturaServico: '8 a 10 °C',
    potencialGuarda: 'Beber até 2029',
    tacaRecomendada: 'Branca de bojo alongado',
    faixaPreco: '80-150',
    importadora: 'companhia-do-meridiano',
    tags: ['espumante', 'rotulo-brasileiro', 'preco-justo'],
    guias: ['espumante-o-metodo-explica-o-preco'],
    similares: ['maison-perrichon-champagne-brut-reserve', 'vinicola-pedra-fria-merlot-2021'],
    diasAtras: 2,
  },
  {
    slug: 'azienda-colle-sasso-ribolla-anfora-2021',
    nome: 'Ribolla Gialla Anfora',
    produtor: 'Azienda Colle Sasso',
    pais: 'Itália',
    subRegiao: 'Collio, Friuli',
    safra: 2021,
    tipo: 'laranja',
    corpoVinho: 'medio',
    teorAlcoolico: 13,
    corNaEscala: 'laranja',
    uvas: [['ribolla-gialla', 100]],
    nota: 3.5,
    veredito:
      'Vinho laranja de manual: quatro meses de casca em ânfora, cor de chá gelado, aroma de casca de laranja seca e tanino perceptível num vinho branco. É fascinante e não é fácil — exige comida ao lado e uma taça a 13 °C. Quem espera um branco convencional vai estranhar, e deve.',
    notas: [
      'Casca de laranja seca, damasco, chá preto e uma nota de mel de flores, com um fundo levemente oxidativo que faz parte do estilo.',
      'Corpo médio com tanino real, herdado das cascas, e acidez firme. O final é seco, amargo na medida e mais longo do que a maioria dos brancos.',
    ],
    harmonizacoes: [
      { prato: 'Curry de grão-de-bico', observacao: 'Um dos poucos vinhos que atravessa especiarias sem se perder.' },
      { prato: 'Queijos semicurados', observacao: 'O tanino do vinho encontra a gordura do queijo, como faria um tinto leve.' },
      { prato: 'Porco assado com laranja', observacao: 'A nota cítrica seca do vinho espelha o preparo do prato.' },
    ],
    temperaturaServico: '12 a 14 °C',
    potencialGuarda: 'Beber até 2029',
    tacaRecomendada: 'Universal de bojo médio',
    faixaPreco: '150-250',
    importadora: 'bruma-importadora',
    tags: ['vinho-natural', 'uva-rara'],
    guias: ['vinho-natural-organico-biodinamico'],
    similares: ['weingut-steinhof-riesling-trocken-2022'],
    diasAtras: 88,
  },
  {
    slug: 'casa-do-corgo-tawny-10-anos',
    nome: 'Tawny 10 Anos',
    produtor: 'Casa do Corgo',
    pais: 'Portugal',
    regiao: 'douro',
    subRegiao: 'Cima Corgo',
    tipo: 'fortificado',
    corpoVinho: 'encorpado',
    teorAlcoolico: 20,
    corNaEscala: 'tawny',
    uvas: [
      ['touriga-nacional', 50],
      ['tempranillo', 50],
    ],
    nota: 4.5,
    veredito:
      'Tawny de dez anos com o equilíbrio que a categoria promete e nem sempre cumpre: noz, figo seco e caramelo, doçura contida e um final seco e amendoado. Serve levemente fresco, a 14 °C, e dura semanas depois de aberto — o que faz dele o vinho mais prático de ter em casa.',
    notas: [
      'Noz, avelã tostada, figo seco e caramelo, com um traço de casca de laranja cristalizada.',
      'Doce mas equilibrado por acidez viva e por um final seco e amendoado. O álcool está integrado e não queima. Comprimento longo, com retorno de nozes.',
    ],
    harmonizacoes: [
      { prato: 'Torta de nozes ou pecã', observacao: 'A regra da sobremesa: o vinho precisa ser tão doce quanto o prato.' },
      { prato: 'Queijo azul', observacao: 'Doçura contra sal é o contraste mais antigo e mais eficiente da mesa.' },
      { prato: 'Chocolate amargo 70%', observacao: 'O amargor do cacau encontra a nota tostada do vinho envelhecido.' },
    ],
    temperaturaServico: '13 a 15 °C',
    potencialGuarda: 'Pronto para beber; dura semanas depois de aberto',
    tacaRecomendada: 'Taça pequena de vinho fortificado',
    faixaPreco: '150-250',
    importadora: 'casa-iberica',
    tags: ['portugal', 'harmonizacao'],
    guias: ['douro-alem-do-porto'],
    similares: ['quinta-do-vale-escuro-reserva-2021'],
    diasAtras: 95,
  },
]

async function semearVinhos(
  idDaAutora: number,
  indices: {
    tags: Indice
    uvas: Indice
    regioes: Indice
    importadoras: Indice
    guias: Indice
  },
): Promise<Indice> {
  secao('Vinhos')
  const indice: Indice = {}

  for (const vinho of VINHOS) {
    const publicacao = diasAtras(vinho.diasAtras)
    indice[vinho.slug] = await semear(
      'vinhos',
      porSlug(vinho.slug),
      {
        nome: vinho.nome,
        slug: vinho.slug,
        produtor: vinho.produtor,
        pais: vinho.pais,
        regiao: vinho.regiao ? indices.regioes[vinho.regiao] : null,
        subRegiao: vinho.subRegiao ?? null,
        safra: vinho.safra ?? null,
        tipo: vinho.tipo,
        corpo: vinho.corpoVinho ?? null,
        teorAlcoolico: vinho.teorAlcoolico,
        corNaEscala: vinho.corNaEscala as never,
        uvas: vinho.uvas.map(([slug, percentual]) => ({
          uva: indices.uvas[slug],
          percentual,
        })),
        nota: vinho.nota,
        veredito: vinho.veredito,
        notasDegustacao: rico(...vinho.notas.map((texto) => p(texto))),
        harmonizacoes: vinho.harmonizacoes,
        temperaturaServico: vinho.temperaturaServico,
        potencialGuarda: vinho.potencialGuarda,
        tacaRecomendada: vinho.tacaRecomendada,
        decantacao: vinho.decantacao ?? null,
        faixaPreco: vinho.faixaPreco as never,
        dataPreco: publicacao,
        importadora: indices.importadoras[vinho.importadora],
        guiasRelacionados: vinho.guias.map((slug) => indices.guias[slug]).filter(Boolean),
        autor: idDaAutora,
        tags: vinho.tags.map((slug) => indices.tags[slug]).filter(Boolean),
        dataPublicacao: publicacao,
        _status: 'published',
      },
      `${vinho.produtor} · ${vinho.nome}`,
    )
  }

  // Os similares entram numa segunda passagem porque apontam para vinhos que só
  // existem depois que o laço acima termina.
  secao('Ligações entre vinhos')
  for (const vinho of VINHOS) {
    const similares = vinho.similares.map((slug) => indice[slug]).filter(Boolean)
    if (similares.length === 0) continue
    await payload.update({
      collection: 'vinhos',
      id: indice[vinho.slug],
      data: { vinhosSimilares: similares },
      depth: 0,
    })
    console.log(`  ↔ ${vinho.nome}: ${similares.length} similares`)
  }

  return indice
}

/* -------------------------------------------------------------------------- */
/* 5. Matérias                                                                 */
/* -------------------------------------------------------------------------- */

interface SementeDeMateria {
  slug: string
  titulo: string
  subtitulo: string
  resumo: string
  categoria: string
  tags: string[]
  chipCor: string
  diasAtras: number
  destaqueHome?: boolean
  vinhos?: string[]
  guias?: string[]
  faq?: { pergunta: string; resposta: string }[]
  corpo: No[]
}

const MATERIAS: SementeDeMateria[] = [
  {
    slug: 'o-vinho-brasileiro-parou-de-pedir-desculpas',
    titulo: 'O vinho brasileiro parou de pedir desculpas',
    subtitulo:
      'Em uma década, a Serra Gaúcha trocou a imitação do rótulo europeu por um sotaque próprio. O que mudou dentro da garrafa — e o que ainda trava o preço na prateleira.',
    resumo:
      'O vinho brasileiro deixou de se apresentar como versão barata do importado. Espumantes de método tradicional e tintos de altitude firmaram um estilo próprio, de acidez alta e álcool contido. O que ainda separa o país das prateleiras estrangeiras não é qualidade: é escala de produção, custo de insumo e uma carga tributária que ninguém discute em voz alta.',
    categoria: 'reportagem',
    tags: ['rotulo-brasileiro', 'espumante', 'preco-justo'],
    chipCor: 'purpura',
    diasAtras: 3,
    destaqueHome: true,
    vinhos: ['vinicola-alto-da-serra-brut-nature-2021', 'vinicola-pedra-fria-merlot-2021'],
    guias: ['espumante-o-metodo-explica-o-preco'],
    faq: [
      {
        pergunta: 'O vinho brasileiro melhorou de verdade nos últimos anos?',
        resposta:
          'Sim, e a mudança é verificável em provas às cegas. Os avanços vieram de três frentes: escolha de vinhedos mais altos e frios, colheita mais precoce para preservar acidez e domínio do método tradicional de espumante. O resultado é um perfil próprio — acidez alta e álcool entre 12% e 13% — em vez de tentativa de imitar tintos encorpados do hemisfério norte.',
      },
      {
        pergunta: 'Por que o vinho brasileiro ainda é caro?',
        resposta:
          'Porque a estrutura de custo é alta e a escala é pequena. Insumos como barrica, rolha e garrafa são importados e pagos em dólar; a produtividade por hectare é baixa por causa da chuva na vindima; e a carga tributária sobre o vinho nacional é comparável à de bebidas destiladas. O preço de prateleira reflete esses três fatores, não uma margem excessiva do produtor.',
      },
      {
        pergunta: 'Qual categoria de vinho brasileiro vale mais a pena?',
        resposta:
          'O espumante de método tradicional. O clima da Serra Gaúcha entrega naturalmente uvas de acidez alta e açúcar moderado, que é exatamente o que a categoria exige, e o produto nacional não carrega frete internacional nem imposto de importação. Na faixa de R$ 80 a R$ 150, os nacionais competem de igual para igual com importados do mesmo preço.',
      },
    ],
    corpo: [
      p(
        'Há dez anos, quase toda conversa sobre vinho brasileiro começava com uma justificativa. O produtor explicava a chuva, o importador explicava o preço, o sommelier explicava que era preciso ter paciência. Hoje as garrafas chegam à mesa sem nota de rodapé — e a mudança de postura corresponde a uma mudança concreta de conteúdo.',
      ),
      p(
        'Provamos ao longo de três meses quarenta rótulos nacionais de seis regiões, quase todos às cegas e sempre ao lado de importados de faixa de preço equivalente. O que se vê é um país que parou de perseguir um estilo alheio.',
      ),
      h2('A decisão de colher antes'),
      p(
        'A virada técnica mais importante foi banal: colher mais cedo. Durante décadas, a referência de qualidade era a maturação máxima, com fruta madura e álcool alto — o padrão que vendia bem em Bordeaux e na Califórnia e que, no clima úmido da Serra, produzia vinhos moles e sem definição. Antecipar a colheita em dez ou quinze dias preserva acidez, contém o álcool e devolve nitidez à fruta.',
      ),
      p(
        'O efeito é imediato na taça. Os tintos de agora têm entre 12,5% e 13,5% de álcool, acidez marcada e tanino discreto. São vinhos de mesa no sentido literal: pedem comida, não análise.',
      ),
      destaque(
        'O vinho brasileiro melhorou quando parou de tentar parecer um vinho que não é.',
      ),
      h2('O espumante como âncora'),
      p(
        'Se existe categoria em que o país compete sem desconto, é o espumante de método tradicional. As condições que atrapalham os tintos — noites frias, colheita antes do calor extremo, acidez naturalmente alta — são exatamente as que um bom vinho-base exige. Rótulos com trinta meses sobre as leveduras já são comuns na faixa de cem reais, prazo que na Europa costuma pertencer a garrafas bem mais caras.',
      ),
      p(
        'Não é acaso que as vinícolas mais sólidas da Serra hoje derivem a maior parte da receita da bolha. O espumante financia o experimento com os tintos.',
      ),
      h2('O que ainda trava'),
      p(
        'A resposta curta é custo. Barrica francesa, rolha portuguesa e garrafa de vidro pesada são pagos em moeda estrangeira. A produtividade por hectare é baixa porque a chuva na vindima obriga a descartar uva. E a carga tributária sobre vinho no Brasil é próxima da que incide sobre destilados, tratamento que quase nenhum país produtor aplica.',
      ),
      caixa(
        'A conta que ninguém mostra',
        'Numa garrafa nacional de R$ 120, o custo de produção raramente passa de R$ 35. O restante se divide entre impostos, distribuição, margem de varejo e o vidro — que, no caso de garrafas pesadas, pode custar mais que a rolha e o rótulo somados. Discutir o preço do vinho brasileiro sem olhar essa distribuição é discutir o sintoma.',
      ),
      h2('O que esperar da próxima década'),
      p(
        'Duas frentes parecem promissoras. A primeira é a produção de altitude em Santa Catarina, acima de 1.200 metros, com vindima em abril e maio e maturação lenta. A segunda é o vinho de inverno no sudeste, técnica que inverte o ciclo da videira e colhe na estação seca — solução engenhosa que ainda precisa provar consistência de safra a safra.',
      ),
      p(
        'Nenhuma das duas vai baixar o preço de prateleira. Mas ambas ampliam o repertório do que se pode chamar de vinho brasileiro — e essa palavra, hoje, já não precisa de defesa prévia.',
      ),
    ],
  },
  {
    slug: 'por-que-o-mesmo-vinho-custa-tres-vezes-mais-aqui',
    titulo: 'Por que o mesmo vinho custa três vezes mais no Brasil',
    subtitulo:
      'Abrimos a formação de preço de uma garrafa que sai da Espanha por sete euros e chega à prateleira brasileira por R$ 149.',
    resumo:
      'Uma garrafa que deixa a adega espanhola por sete euros chega ao consumidor brasileiro por cerca de R$ 149. Entre um valor e outro estão frete, seguro, imposto de importação, ICMS, PIS, Cofins, margem do importador, margem do distribuidor e margem do varejo. Este é o caminho completo, com cada etapa nomeada e quantificada.',
    categoria: 'mercado',
    tags: ['preco-justo', 'portugal'],
    chipCor: 'ouro-velho',
    diasAtras: 10,
    guias: ['como-ler-um-rotulo-de-vinho'],
    faq: [
      {
        pergunta: 'Quanto de imposto se paga em uma garrafa de vinho importado no Brasil?',
        resposta:
          'A carga tributária total sobre vinho importado costuma ficar entre 40% e 60% do preço final, somando imposto de importação, IPI, PIS, Cofins e ICMS estadual. A variação depende do estado de destino, porque a alíquota de ICMS sobre bebidas alcoólicas muda de um para outro.',
      },
      {
        pergunta: 'Comprar vinho direto do exterior compensa?',
        resposta:
          'Raramente, para uma ou duas garrafas. A importação por pessoa física paga imposto sobre o valor da compra somado ao frete, e o frete internacional de vidro é caro e arriscado. A conta só começa a fazer sentido em compras coletivas de caixa fechada, e ainda assim exige atenção às regras de importação vigentes.',
      },
    ],
    corpo: [
      p(
        'Toda conversa sobre preço de vinho no Brasil trava no mesmo ponto: alguém afirma que a culpa é do imposto, outra pessoa afirma que é da margem do varejo, e a discussão termina sem número nenhum. Fomos atrás dos números.',
      ),
      p(
        'Com a colaboração de duas importadoras de porte médio, que autorizaram a publicação dos percentuais sem identificação do rótulo, reconstruímos o caminho de uma garrafa de tinto espanhol que sai da adega por sete euros.',
      ),
      h2('Etapa 1: até o porto de Santos'),
      p(
        'Sete euros na origem viram cerca de R$ 44 na entrada, considerando câmbio, frete marítimo em contêiner refrigerado, seguro e despesas portuárias. O transporte refrigerado é o item que separa uma importadora séria de uma aventureira: vinho que atravessa o Equador em contêiner comum chega cozido, e o consumidor paga por um defeito que ele não sabe nomear.',
      ),
      h2('Etapa 2: os tributos'),
      p(
        'Sobre esse valor incidem imposto de importação, IPI, PIS, Cofins e o ICMS do estado de destino. Somados, os tributos costumam adicionar entre 60% e 90% ao custo de desembaraço, dependendo do estado. Nossa garrafa sai da alfândega custando por volta de R$ 78.',
      ),
      destaque(
        'A garrafa que deixou a adega por sete euros já custa R$ 78 antes de alguém tentar vendê-la.',
      ),
      h2('Etapa 3: as três margens'),
      p(
        'A importadora aplica a sua margem, o distribuidor aplica a dele e o varejo aplica a sua — e cada uma dessas margens precisa cobrir estoque parado, adega climatizada, equipe comercial e as garrafas que quebram ou passam do ponto. Empilhadas, elas levam a garrafa de R$ 78 para os R$ 149 da prateleira.',
      ),
      caixa(
        'Onde a conta muda a seu favor',
        'Importadoras que vendem direto ao consumidor cortam uma das três margens e costumam praticar preços 20% a 30% menores que o varejo tradicional. Compras de caixa fechada, clubes de assinatura e feiras de importador funcionam pelo mesmo mecanismo. Não há mágica: o desconto é o elo que deixou de existir.',
      ),
      h2('O que isso significa na hora de escolher'),
      p(
        'Duas consequências práticas. A primeira: no Brasil, a faixa entre R$ 80 e R$ 150 corresponde, em qualidade, ao que na Europa se compra por dez a quinze euros — não por trinta. A segunda: abaixo de R$ 60, a estrutura de custo praticamente não deixa espaço para vinho bem-feito importado, e é por isso que essa faixa é dominada por rótulos industriais e por nacionais.',
      ),
      p(
        'Nada disso torna o vinho importado caro demais por definição. Torna, isso sim, a comparação direta com o preço europeu uma armadilha — e explica por que a mesma garrafa fotografada na Espanha por sete euros provoca tanta indignação na estante brasileira.',
      ),
    ],
  },
  {
    slug: 'chile-mudou-de-assunto',
    titulo: 'O Chile mudou de assunto: menos Cabernet barato, mais costa fria',
    subtitulo:
      'O país que ensinou o Brasil a beber tinto de supermercado passou quinze anos migrando vinhedos para o litoral e para o sul. O que isso muda na prateleira.',
    resumo:
      'Durante décadas o Chile exportou tinto barato de vales quentes e ficou conhecido no Brasil por isso. Nos últimos quinze anos, o país plantou vinhedos perto do oceano e no extremo sul, buscando frio e acidez. O resultado começa a chegar às prateleiras brasileiras: brancos tensos, Pinot Noir de verdade e tintos com menos peso e mais nervo.',
    categoria: 'reportagem',
    tags: ['chile', 'preco-justo'],
    chipCor: 'cereja',
    diasAtras: 18,
    vinhos: ['vina-piedra-clara-cabernet-2021'],
    faq: [
      {
        pergunta: 'O vinho chileno ainda é uma boa compra no Brasil?',
        resposta:
          'Sim, especialmente entre R$ 60 e R$ 120, faixa em que o país oferece a melhor consistência do mercado por causa do acordo comercial que reduz o imposto de importação. A recomendação mudou de foco: em vez do Cabernet de vale quente, procure brancos e tintos leves de regiões costeiras como Casablanca, San Antonio e Limarí.',
      },
      {
        pergunta: 'O que significa "costa" no rótulo de um vinho chileno?',
        resposta:
          'Desde 2012, a legislação chilena permite indicar no rótulo se o vinhedo fica na faixa costeira, no vale central ou na cordilheira. A menção "costa" indica influência do oceano Pacífico e da corrente fria de Humboldt, o que costuma significar acidez mais alta, álcool mais baixo e vinhos menos encorpados.',
      },
    ],
    corpo: [
      p(
        'Por volta de 2005, o Chile era, para o consumidor brasileiro, sinônimo de uma coisa: tinto barato e confiável. O acordo comercial que reduz o imposto de importação tornou o país o fornecedor natural da faixa de entrada, e o Cabernet Sauvignon do vale central virou o vinho de supermercado por excelência.',
      ),
      p(
        'Essa reputação continua rendendo volume, mas já não descreve o que o país produz de mais interessante.',
      ),
      h2('A geografia que estava ali o tempo todo'),
      p(
        'O Chile tem 4.300 quilômetros de norte a sul e uma corrente oceânica gelada correndo pela costa inteira. Durante um século, quase toda a viticultura ficou concentrada nos vales protegidos do litoral pela cordilheira da Costa — lugares quentes, secos e generosos, ideais para produzir muito e barato.',
      ),
      p(
        'A partir dos anos 2000, produtores começaram a atravessar essa barreira e plantar do lado do oceano, onde a neblina matinal e o vento frio atrasam a maturação em duas a três semanas. Casablanca, San Antonio, Limarí e, mais ao sul, Itata e Bío-Bío deixaram de ser curiosidade e viraram origem.',
      ),
      destaque(
        'O Chile não descobriu uma técnica nova. Descobriu que o país tinha frio disponível — e foi buscá-lo.',
      ),
      h2('O que mudou na taça'),
      p(
        'Brancos com acidez cortante e sal, Pinot Noir de cor clara e aroma de cereja, Syrah apimentado em vez de doce. E, no sul profundo, a redescoberta de vinhas velhas de País e Cinsault plantadas no século XIX, conduzidas sem irrigação, que dão tintos leves, ácidos e de baixo álcool — o oposto exato do que exportou o país por trinta anos.',
      ),
      caixa(
        'Como identificar na loja',
        'Procure as palavras "costa", "Casablanca", "San Antonio", "Leyda", "Limarí", "Itata" ou "Bío-Bío" no rótulo. Teor alcoólico entre 12% e 13% também é uma boa pista: no Chile, isso indica vinhedo frio. Preço: a maior parte desses rótulos está entre R$ 90 e R$ 180 no Brasil.',
      ),
      h2('O problema de imagem'),
      p(
        'A dificuldade chilena hoje é de percepção. O consumidor brasileiro aprendeu que vinho chileno é barato, e essa lição foi ensinada com competência durante duas décadas. Convencer alguém a pagar R$ 180 por um Pinot Noir de Leyda exige desfazer uma associação que a própria indústria construiu.',
      ),
      p(
        'A rigor, é um bom problema para se ter: significa que existe um país inteiro de vinhos interessantes ainda subprecificado por causa da fama do vizinho de prateleira.',
      ),
    ],
  },
  {
    slug: 'vinho-natural-depois-do-hype',
    titulo: 'Vinho natural depois do hype: o que sobrou na taça',
    subtitulo:
      'A categoria saiu das capas, perdeu parte do público militante e ganhou algo mais útil: critério. Um balanço de dez anos de vinho sem aditivo no Brasil.',
    resumo:
      'O vinho natural chegou ao Brasil como bandeira e por algum tempo funcionou assim: quem estava dentro defendia tudo, quem estava fora recusava tudo. Passada a fase da militância, sobrou uma categoria menor, mais competente e mais interessante — e a discussão saiu do rótulo para o único lugar onde ela sempre deveria ter estado, que é a taça.',
    categoria: 'ensaio',
    tags: ['vinho-natural', 'uva-rara'],
    chipCor: 'laranja',
    diasAtras: 26,
    vinhos: ['azienda-colle-sasso-ribolla-anfora-2021'],
    guias: ['vinho-natural-organico-biodinamico'],
    faq: [
      {
        pergunta: 'Vinho natural estraga mais rápido?',
        resposta:
          'É mais sensível, principalmente ao calor. Com pouco ou nenhum sulfito adicionado, o vinho tem menos proteção contra oxidação e contra microrganismos, o que exige transporte e estoque refrigerados. Guardado bem, um vinho natural bem-feito evolui normalmente; guardado num depósito quente, deteriora mais rápido que um convencional.',
      },
      {
        pergunta: 'Como saber se um vinho natural está com defeito?',
        resposta:
          'Cheiro forte de esmalte de unha ou de cola indica acetato de etila; cheiro de vinagre indica acidez volátil alta; cheiro de curral ou de esparadrapo indica a levedura brettanomyces. Turbidez leve e um pouco de gás não são defeitos. Se o vinho cheira desagradável a ponto de você não querer beber, é defeito — independentemente do que digam.',
      },
    ],
    corpo: [
      p(
        'Por volta de 2016, era possível prever a temperatura de uma conversa sobre vinho apenas mencionando a palavra "natural". De um lado, produtores e bares que tratavam a categoria como correção moral de uma indústria adoecida. Do outro, profissionais experientes que descartavam o conjunto como vinho defeituoso vendido com discurso.',
      ),
      p(
        'Dez anos depois, quase ninguém sustenta nenhuma das duas posições — e a categoria melhorou justamente por causa disso.',
      ),
      h2('O que a militância acertou'),
      p(
        'Duas coisas importantes. A primeira foi trazer para o centro da conversa o que acontece no vinhedo, num setor que costumava falar apenas de adega e de nota de degustação. A segunda foi recolocar em circulação castas locais, vinhas velhas e regiões esquecidas que a viticultura de escala tinha condenado ao arranque.',
      ),
      h2('O que ela errou'),
      p(
        'Confundir ausência de intervenção com virtude automática. Fermentação espontânea não garante vinho bom; garante vinho imprevisível. Durante alguns anos, defeitos com nome técnico conhecido — acidez volátil alta, acetato de etila, brettanomyces — foram vendidos como personalidade, e uma parte considerável do público que experimentou a categoria nessa fase nunca voltou.',
      ),
      destaque(
        'Fermentação espontânea não garante vinho bom. Garante vinho imprevisível — que não é a mesma coisa.',
      ),
      h2('O que sobrou'),
      p(
        'Uma categoria menor e mais competente. Os produtores que permaneceram aprenderam a trabalhar com limpeza obsessiva de adega, controle de temperatura e, quando necessário, uma dose mínima de sulfito na hora do engarrafamento — o que, para os puristas de 2016, seria heresia, e que hoje é praticado com naturalidade por quem quer que o vinho chegue inteiro ao outro lado do Atlântico.',
      ),
      caixa(
        'Comprando sem depender de sorte',
        'Compre em lojas com estoque refrigerado, prefira safras recentes e confie no importador mais do que no rótulo. Nessa categoria, o nome de quem seleciona vale mais que qualquer selo: a diferença entre uma garrafa viva e uma garrafa avinagrada frequentemente está no contêiner em que ela atravessou o Equador.',
      ),
      h2('A pergunta que ficou'),
      p(
        'Se o vinho natural bem-feito é indistinguível de um bom vinho convencional de baixa intervenção, a categoria ainda faz sentido como categoria? Provavelmente não como identidade, e sim como método declarado — informação sobre como algo foi feito, que o consumidor pode considerar ou ignorar.',
      ),
      p(
        'É um final discreto para um movimento que começou barulhento. Também é, de longe, o melhor final possível: a discussão voltou a ser sobre o que está na taça.',
      ),
    ],
  },
  {
    slug: 'o-brasileiro-aprendeu-a-beber-branco',
    titulo: '“O brasileiro aprendeu a beber branco”',
    subtitulo:
      'A sommelière Marina Bastos, que monta cartas de vinho em São Paulo há doze anos, sobre o que mudou no pedido do cliente — e por que a mudança demorou tanto.',
    resumo:
      'Em doze anos montando cartas de vinho em São Paulo, a sommelière Marina Bastos viu a proporção de brancos vendidos por taça sair de um quinto para quase metade. Nesta entrevista, ela explica o papel do clima, do preço e da comida brasileira nessa virada, e por que a resistência ao branco nunca teve a ver com sabor.',
    categoria: 'entrevista',
    tags: ['restaurante', 'harmonizacao'],
    chipCor: 'ouro',
    diasAtras: 35,
    vinhos: ['weingut-steinhof-riesling-trocken-2022', 'adega-pazo-do-souto-albarino-2023'],
    guias: ['harmonizacao-na-pratica'],
    faq: [
      {
        pergunta: 'Por que vinho branco combina melhor com o clima brasileiro?',
        resposta:
          'Por temperatura de serviço e por teor alcoólico. Brancos são servidos entre 8 e 12 °C e costumam ter menos álcool que tintos, o que os torna mais refrescantes em ambientes quentes. Além disso, a acidez alta característica dos brancos funciona bem com frituras, frutos do mar e pratos com pimenta, todos frequentes na cozinha brasileira.',
      },
      {
        pergunta: 'Vinho branco pode acompanhar carne?',
        resposta:
          'Pode, e funciona melhor do que a maioria imagina. Brancos encorpados, com textura e alguma passagem por madeira, acompanham bem porco, frango assado e carnes brancas em geral. Com carne vermelha grelhada, a combinação é mais difícil, mas ainda possível se o preparo for leve e o vinho tiver corpo.',
      },
    ],
    corpo: [
      p(
        'Marina Bastos monta cartas de vinho em São Paulo desde 2013. Trabalhou em três casas de cozinha contemporânea e hoje presta consultoria para restaurantes que querem reformular o programa de vinho por taça. Ela nos recebeu numa tarde de terça, entre uma prova de amostras e outra.',
      ),
      h3('Você diz que a carta mudou. Mudou quanto?'),
      p(
        'Quando comecei, brancos eram algo entre 15% e 20% das taças vendidas num restaurante médio de São Paulo. Hoje, nas casas em que trabalho, ficam entre 40% e 50%. Em restaurante de frutos do mar passa disso. É uma mudança grande para doze anos.',
      ),
      h3('O que provocou isso?'),
      p(
        'Três coisas ao mesmo tempo. A primeira é o preço: um branco muito bom custa metade de um tinto muito bom, porque não precisa de barrica nem de anos de estoque. A segunda é o clima — a gente finalmente parou de fingir que mora em Bordeaux. A terceira é a comida brasileira, que tem sal, acidez e pimenta, e isso pede branco.',
      ),
      destaque(
        'A gente finalmente parou de fingir que mora em Bordeaux.',
        'Marina Bastos, sommelière',
      ),
      h3('Havia resistência a pedir branco?'),
      p(
        'Muita, e nunca foi sobre sabor. Era sobre o que pedir branco significava na mesa. Tinto era o vinho sério, o vinho de quem entende; branco era o que se pedia quando não se queria beber de verdade. Isso é uma construção social e ela demorou uma geração para se desmanchar.',
      ),
      h3('O que você recomenda para quem quer começar?'),
      p(
        'Peço para esquecerem o Chardonnay com madeira, que é o que muita gente experimentou nos anos 1990 e não gostou. Começo com Albariño ou com um Riesling seco. São vinhos de acidez alta, aroma claro e nenhum truque de adega. Em duas taças, a pessoa entende do que a gente estava falando.',
      ),
      caixa(
        'O erro mais comum, segundo ela',
        'Servir branco gelado demais. “Sai da geladeira a 4 °C, e a 4 °C todo vinho branco tem o mesmo gosto: nenhum. Deixe quinze minutos na mesa antes de servir e você vai achar que comprou outra garrafa.”',
      ),
      h3('E o tinto, perdeu espaço?'),
      p(
        'Perdeu volume no verão e ganhou qualidade. Quem pede tinto hoje pede com mais critério, quer saber a região, aceita um tinto leve servido fresco. Isso não existia. Há dez anos, tinto gelado era motivo de reclamação na mesa; hoje é o que mais vende de novembro a março.',
      ),
    ],
  },
  {
    slug: 'dez-tintos-de-ate-cem-reais-as-cegas',
    titulo: 'Dez tintos de até R$ 100, provados às cegas',
    subtitulo:
      'Compramos no varejo, escondemos os rótulos e provamos em duas sessões. Três garrafas valem a repetição, quatro cumprem o papel e três não deveriam estar na prateleira.',
    resumo:
      'Compramos dez tintos de até R$ 100 nas prateleiras de supermercados e lojas de São Paulo, escondemos os rótulos e provamos em duas sessões separadas. O resultado desmonta a ideia de que preço nessa faixa é sinônimo de qualidade: o segundo colocado custava R$ 58 e o mais caro do grupo ficou em sétimo lugar.',
    categoria: 'degustacao',
    tags: ['preco-justo', 'chile', 'argentina'],
    chipCor: 'rubi',
    diasAtras: 45,
    vinhos: ['vina-piedra-clara-cabernet-2021', 'vinicola-pedra-fria-merlot-2021'],
    faq: [
      {
        pergunta: 'Como funciona uma degustação às cegas?',
        resposta:
          'As garrafas são envolvidas para esconder o rótulo e a forma, recebem um número aleatório e são servidas na mesma temperatura e no mesmo tipo de taça. Quem prova não sabe país, produtor nem preço. O objetivo é eliminar o efeito da marca e da expectativa, que comprovadamente alteram a percepção de sabor.',
      },
      {
        pergunta: 'Vinho mais caro é sempre melhor?',
        resposta:
          'Não, e a correlação é fraca justamente nas faixas mais baixas. Até cerca de R$ 150, o preço reflete tanto custo de produção quanto posicionamento comercial, câmbio e canal de venda. A partir de faixas mais altas, a correlação melhora, porque práticas caras — vinhedo selecionado, produção pequena, envelhecimento longo — passam a ser determinantes.',
      },
    ],
    corpo: [
      p(
        'A faixa de até cem reais é a que mais vende no Brasil e a menos coberta pela crítica especializada. Decidimos preencher a lacuna do jeito mais simples possível: comprando no varejo, com nosso dinheiro, e provando sem saber o que havia na taça.',
      ),
      h2('O método'),
      p(
        'Dez tintos comprados em supermercados e lojas de São Paulo, todos entre R$ 45 e R$ 98. Garrafas envelopadas e numeradas por uma pessoa que não participou da prova. Duas sessões em dias diferentes, com a ordem alterada na segunda, todas as taças servidas a 16 °C. Três provadores, notas individuais, discussão só depois de fechadas as fichas.',
      ),
      h2('O resultado curto'),
      p(
        'Três garrafas se destacaram com folga: um Merlot brasileiro de R$ 89, um tinto português de R$ 58 e um Bonarda argentino de R$ 72. Quatro cumpriram o papel de tinto de semana sem defeito nem emoção. Três apresentaram problemas evidentes — dois com madeira em pó dominando tudo e um claramente oxidado, provavelmente por estoque mal cuidado.',
      ),
      destaque(
        'O segundo colocado custava R$ 58. O mais caro da mesa ficou em sétimo.',
      ),
      h2('O que os melhores tinham em comum'),
      p(
        'Acidez. Nos três primeiros colocados, o que apareceu nas fichas não foi concentração de fruta nem intensidade de cor, e sim frescor: vinhos que davam vontade de tomar a segunda taça. Os que ficaram para trás eram, em geral, mais escuros, mais doces e mais pesados — características que impressionam num gole e cansam numa refeição.',
      ),
      caixa(
        'Madeira em pó',
        'Dois dos piores colocados apresentavam aroma intenso de baunilha e coco sem qualquer nota de fruta por trás. É a assinatura do uso de chips ou de aduelas de carvalho em tanque, prática legal e comum nessa faixa de preço, que serve para simular envelhecimento em barrica. Feita com moderação, passa despercebida. Feita com pressa, produz vinho que cheira a sobremesa.',
      ),
      h2('O que levar desta prova'),
      p(
        'Primeiro: nessa faixa, gastar vinte reais a mais não garante nada. Segundo: rótulos nacionais competem de igual para igual e às vezes vencem. Terceiro: a variável que mais previu qualidade na nossa mesa foi o teor alcoólico — abaixo de 13,5%, os vinhos foram consistentemente melhores.',
      ),
      p(
        'Repetiremos a prova a cada seis meses, com garrafas compradas do mesmo jeito. A lista completa, com notas individuais de cada provador, está publicada no arquivo do Boletim.',
      ),
    ],
  },
  {
    slug: 'portugal-ficou-caro',
    titulo: 'Portugal ficou caro — e a culpa não é só do câmbio',
    subtitulo:
      'O país que virou refúgio do consumidor brasileiro em busca de bom vinho barato subiu de patamar. O que aconteceu entre 2015 e agora.',
    resumo:
      'Por uma década, Portugal foi a resposta padrão para quem queria bom vinho por pouco dinheiro no Brasil. Os preços subiram, e o câmbio explica só uma parte. Turismo, reconhecimento internacional, custo de produção em encostas e a valorização do Douro fizeram o resto. Ainda há bons negócios — mas em regiões que quase ninguém pronuncia.',
    categoria: 'mercado',
    tags: ['portugal', 'preco-justo'],
    chipCor: 'granada',
    diasAtras: 58,
    vinhos: ['quinta-do-vale-escuro-reserva-2021', 'casa-do-corgo-tawny-10-anos'],
    guias: ['douro-alem-do-porto'],
    faq: [
      {
        pergunta: 'Vinho português ainda vale a pena no Brasil?',
        resposta:
          'Vale, mas o mapa mudou. Nas regiões mais famosas, como Douro e Alentejo, os preços subiram consideravelmente desde 2015. As melhores relações entre preço e qualidade hoje estão em regiões menos divulgadas — Dão, Bairrada, Beira Interior, Setúbal e Trás-os-Montes — onde ainda se encontram vinhos sérios abaixo de R$ 120.',
      },
      {
        pergunta: 'Qual é a diferença entre Douro e Alentejo?',
        resposta:
          'O Douro fica no norte, tem encostas íngremes de xisto e clima de verões quentes e invernos rigorosos; seus tintos são estruturados, minerais e de acidez firme. O Alentejo fica no sul, é plano e quente, e produz tintos de fruta madura, tanino macio e álcool mais alto — geralmente mais imediatos e mais fáceis de beber jovens.',
      },
    ],
    corpo: [
      p(
        'Entre 2012 e 2018, a recomendação era quase automática. Alguém pedia um bom tinto por até oitenta reais e a resposta vinha em uma palavra: Portugal. O país oferecia castas próprias, vinhas velhas, produção artesanal e preços que não faziam sentido para a qualidade entregue.',
      ),
      p(
        'Essa equação mudou, e vale entender por quê — porque a parte da explicação que todo mundo cita é a menos importante.',
      ),
      h2('O câmbio explica menos do que parece'),
      p(
        'O real perdeu valor frente ao euro no período, mas perdeu de forma parecida com o que ocorreu em relação a outras moedas. Se fosse só câmbio, o vinho espanhol e o italiano teriam subido na mesma proporção. Não subiram: o preço médio do português no Brasil aumentou mais rápido que o dos vizinhos ibéricos.',
      ),
      h2('O que aconteceu do outro lado'),
      p(
        'Portugal foi redescoberto pelo mundo inteiro ao mesmo tempo. O turismo cresceu, os vinhos ganharam reconhecimento em publicações internacionais e a demanda por Douro e Alentejo subiu em mercados que pagam mais que o brasileiro. Somem-se a isso o custo de produção em socalcos — que não é mecanizável — e a competição por uva de vinhas velhas, e o preço na origem sobe antes de qualquer imposto.',
      ),
      destaque(
        'Se fosse só câmbio, o espanhol teria subido junto. Não subiu.',
      ),
      h2('Onde ainda há negócio'),
      p(
        'Nas regiões que o turismo não descobriu. O Dão, vizinho do Douro, faz tintos elegantes de Touriga Nacional e Jaen a preços de dez anos atrás. A Bairrada produz espumantes de método tradicional e tintos de Baga com acidez altíssima. A Beira Interior, alta e fria, dá brancos tensos. Setúbal continua sendo o melhor endereço para Moscatel.',
      ),
      caixa(
        'Três palavras para procurar no rótulo',
        'Dão, Bairrada e Beira Interior. Nenhuma delas tem o reconhecimento internacional do Douro, e por isso os preços permanecem entre R$ 70 e R$ 130 para garrafas de produtores sérios. Se você gostava do Douro de 2015, é ali que ele está agora.',
      ),
      p(
        'A alta de preço não é uma injustiça: é o que costuma acontecer quando um país produtor deixa de ser subestimado. O que muda é a estratégia de quem compra — e, em vinho, a melhor estratégia sempre foi olhar uma região antes de ela virar assunto.',
      ),
    ],
  },
  {
    slug: 'a-taca-muda-o-vinho',
    titulo: 'A taça muda o vinho? Provamos o mesmo tinto em quatro',
    subtitulo:
      'Serviço do mesmo Douro em taça Bordeaux, Borgonha, taça universal e copo de água, às cegas, com seis provadores. O resultado tem menos marketing do que se imagina — e mais física.',
    resumo:
      'Servimos o mesmo tinto português em quatro recipientes diferentes, às cegas, para seis provadores. O formato da taça alterou de forma consistente a percepção de aroma e de álcool, mas não a de qualidade. A conclusão prática é mais barata do que a indústria de cristais gostaria: duas taças resolvem uma casa inteira.',
    categoria: 'degustacao',
    tags: ['harmonizacao', 'portugal'],
    chipCor: 'ambar',
    diasAtras: 70,
    vinhos: ['quinta-do-vale-escuro-reserva-2021'],
    guias: ['temperatura-de-servico'],
    faq: [
      {
        pergunta: 'A taça realmente muda o sabor do vinho?',
        resposta:
          'Muda a percepção de aroma e de álcool, não a composição do vinho. Taças de bojo largo aumentam a superfície de contato com o ar e a evaporação, o que intensifica aromas voláteis; bocas estreitas concentram esses aromas no nariz. O efeito é real e mensurável, mas menor do que a diferença provocada pela temperatura de serviço.',
      },
      {
        pergunta: 'Quantas taças são realmente necessárias em casa?',
        resposta:
          'Duas dão conta de quase tudo: uma taça universal de bojo médio para tintos, brancos e rosés, e uma taça de bojo alongado para espumantes. Se houver espaço e interesse por Pinot Noir ou Nebbiolo, uma taça de bojo largo tipo Borgonha é o terceiro item mais útil.',
      },
    ],
    corpo: [
      p(
        'A indústria de cristais vende a ideia de que cada casta merece uma taça própria. É um argumento comercialmente eficiente e enologicamente exagerado. Decidimos medir quanto dele se sustenta.',
      ),
      h2('Como foi feito'),
      p(
        'Um único tinto do Douro, safra 2021, servido a 16 °C em quatro recipientes: taça Bordeaux de bojo alto, taça Borgonha de bojo largo, taça universal de bojo médio e um copo de água comum. Seis provadores, taças apresentadas com o vinho já servido e sem que ninguém visse a garrafa. Cada um descreveu aroma, intensidade e sensação de álcool antes de dar nota.',
      ),
      h2('O que apareceu de forma consistente'),
      p(
        'Na taça Borgonha, o vinho foi descrito como mais aromático e mais floral por cinco dos seis provadores, e também como o mais alcoólico. Na Bordeaux, as descrições enfatizaram fruta escura e estrutura. Na universal, as respostas ficaram no meio-termo. No copo de água, quatro provadores descreveram o vinho como "fechado" ou "curto".',
      ),
      destaque(
        'A taça mudou o que os provadores descreveram. Não mudou a nota que eles deram.',
      ),
      h2('O que não apareceu'),
      p(
        'Diferença relevante de nota. A média das avaliações ficou dentro de uma margem de 0,2 ponto entre os três formatos de taça — variação menor do que a que o mesmo grupo produz quando prova o mesmo vinho duas vezes na mesma sessão. Só o copo de água ficou claramente abaixo.',
      ),
      p(
        'A física explica: bojo largo aumenta a superfície de contato com o ar e acelera a evaporação de compostos voláteis, incluindo o etanol. Boca estreita funciona como funil e concentra o que subiu. Um copo reto faz mal as duas coisas. Nada disso melhora o vinho — apenas altera o que chega ao nariz.',
      ),
      caixa(
        'O que comprar, se for comprar',
        'Uma taça universal de bojo médio e haste longa resolve tinto, branco e rosé. Uma taça de bojo alongado resolve espumante melhor que a flûte estreita tradicional, que é bonita e abafa o aroma. Com essas duas, uma casa está equipada. A terceira, se houver curiosidade, é a Borgonha — e ela faz diferença perceptível em Pinot Noir e Nebbiolo.',
      ),
      p(
        'Uma observação final que atravessou toda a prova: a espessura da borda incomodou mais os provadores do que o formato do bojo. Borda grossa foi mencionada espontaneamente por quatro dos seis. Se houver um único critério para escolher uma taça, que seja esse.',
      ),
    ],
  },
  {
    slug: 'como-o-vinho-entrou-no-jantar-de-terca',
    titulo: 'Como o vinho entrou no jantar de terça-feira',
    subtitulo:
      'A garrafa deixou de ser evento e virou hábito doméstico. O que essa mudança de lugar fez com o que se compra, com o quanto se gasta e com o jeito de beber.',
    resumo:
      'Durante décadas o vinho foi bebida de ocasião no Brasil: aniversário, Natal, restaurante. Nos últimos anos ele migrou para a semana comum, e essa mudança de lugar alterou tudo — o preço médio de compra, o tipo de garrafa procurada, o tamanho da dose e até a temperatura em que se serve. Um ensaio sobre a domesticação do vinho.',
    categoria: 'cultura',
    tags: ['restaurante', 'preco-justo'],
    chipCor: 'salmao',
    diasAtras: 85,
    guias: ['harmonizacao-na-pratica'],
    corpo: [
      p(
        'A pergunta que mais recebo não é sobre safra, região ou uva. É esta: "o que eu abro numa terça?". A pergunta parece pequena e não é — ela registra uma mudança de lugar do vinho na casa brasileira que aconteceu em menos de dez anos.',
      ),
      h2('De evento a hábito'),
      p(
        'O vinho chegou ao Brasil como bebida cerimonial. Estava no Natal, no aniversário, no jantar fora. Isso definia tudo: comprava-se pouco e caro, guardava-se para "quando merecer", abria-se com anúncio prévio. Uma garrafa aberta numa terça-feira comum parecia desperdício de ocasião.',
      ),
      p(
        'A mudança começou com a expansão da oferta de rótulos entre cinquenta e cento e cinquenta reais e ganhou velocidade com o hábito doméstico consolidado a partir de 2020. Beber em casa deixou de ser plano B.',
      ),
      destaque(
        'Uma garrafa aberta numa terça-feira comum parecia, até pouco tempo atrás, desperdício de ocasião.',
      ),
      h2('O que muda quando o vinho vira rotina'),
      p(
        'Muda o que se procura. Vinho de terça precisa de três qualidades que o vinho de ocasião dispensa: preço que se possa repetir toda semana, leveza que permita uma taça só e simplicidade que não exija atenção. Isso desloca a demanda de tintos encorpados para brancos, rosés, espumantes e tintos leves servidos frescos.',
      ),
      p(
        'Muda também o tamanho da dose. Quem bebe uma taça por noite passa a se importar com o que fazer com o resto da garrafa — e descobre que, com uma rolha decente na geladeira, quase todo vinho aguenta três dias sem drama.',
      ),
      caixa(
        'Meia garrafa e vinho em lata',
        'Duas categorias em crescimento acompanham essa mudança. A meia garrafa, de 375 ml, resolve a noite de uma pessoa só e ainda é rara no varejo brasileiro. A lata, geralmente de 250 ml, tem qualidade média em ascensão e é a solução mais prática para praia, piquenique e viagem — sem cerimônia e sem saca-rolhas.',
      ),
      h2('O que se perde'),
      p(
        'Alguma coisa se perde, sim: o vinho de rotina tende a ser o mesmo vinho. Quando a garrafa vira item de lista de compras, a curiosidade cede à conveniência, e é comum ver alguém repetir o mesmo rótulo por um ano inteiro. A cerimônia tinha uma vantagem que a rotina não tem — ela obrigava a escolher.',
      ),
      p(
        'A correção é simples e custa pouco: uma garrafa diferente a cada quatro. Não precisa ser mais cara, precisa ser de outro lugar. É assim que um hábito continua sendo interessante depois de virar hábito.',
      ),
    ],
  },
  {
    slug: 'a-nota-de-um-vinho-diz-menos-do-que-parece',
    titulo: 'A nota de um vinho diz menos do que parece',
    subtitulo:
      'Noventa e dois pontos, quatro taças e meia, noventa e cinco. Como esses números são produzidos, o que eles conseguem informar e o que só o texto ao lado deles pode dizer.',
    resumo:
      'Notas de vinho parecem objetivas e não são: elas comprimem uma experiência de dezenas de variáveis em um número, e a escala de cem pontos usa, na prática, apenas os vinte últimos. Este ensaio explica como as notas são produzidas, por que a diferença entre 89 e 91 é quase toda comercial e o que ler no lugar delas.',
    categoria: 'ensaio',
    tags: ['preco-justo', 'vinho-de-guarda'],
    chipCor: 'ambar',
    diasAtras: 100,
    faq: [
      {
        pergunta: 'Como funciona a escala de 100 pontos para vinhos?',
        resposta:
          'Ela foi popularizada nos anos 1980 e, na prática, opera entre 80 e 100 pontos: abaixo de 80 os vinhos raramente são publicados. Isso comprime a escala útil em cerca de vinte pontos, dentro dos quais uma diferença de dois pontos é menor que a variação normal de um mesmo provador avaliando o mesmo vinho em dias diferentes.',
      },
      {
        pergunta: 'Devo comprar vinho pela nota?',
        resposta:
          'A nota é um filtro inicial razoável, não um critério final. Ela informa que alguém considerou o vinho bem-feito, mas não diz se o estilo combina com o seu gosto, com a ocasião ou com o prato. O texto que acompanha a nota costuma ser muito mais útil na decisão — e é ele que revela se o avaliador e você procuram a mesma coisa.',
      },
    ],
    corpo: [
      p(
        'Existe um paradoxo confortável no uso de notas para vinho: elas parecem objetivas justamente porque são números, e são números justamente porque a experiência que descrevem é impossível de comunicar por inteiro. O número é uma compressão. Como toda compressão, ele perde dados — e vale saber quais.',
      ),
      h2('Como uma nota é produzida'),
      p(
        'Alguém prova uma série de vinhos, quase sempre em sequência, muitas vezes às cegas, e atribui um valor considerando aparência, aroma, sabor, equilíbrio e potencial de evolução. Esse valor depende do que veio antes na fila, da hora do dia, da temperatura da sala e do repertório de quem prova. Nada disso é falha de método; é a condição do método.',
      ),
      h2('A escala que não é escala'),
      p(
        'A régua de cem pontos, dominante desde os anos 1980, opera na prática entre 80 e 100 — abaixo disso, quase nada é publicado. Sobram vinte pontos úteis, e dentro deles a diferença entre 89 e 91 é menor que a variação que o mesmo provador apresenta ao reavaliar a mesma garrafa uma semana depois.',
      ),
      p(
        'Só que 89 e 91 não têm o mesmo efeito comercial. O 90 funciona como fronteira psicológica: abaixo dele o vinho é bom, acima dele o vinho é notável. Essa fronteira não corresponde a nada que exista dentro da garrafa.',
      ),
      destaque(
        'A diferença entre 89 e 91 pontos é quase toda comercial. Dentro da garrafa, ela não existe.',
      ),
      h2('O que a nota consegue informar'),
      p(
        'Coisas úteis, desde que se saiba lê-las. Uma nota alta indica que o vinho é tecnicamente bem-feito e que não apresenta defeito evidente. Uma série de notas altas do mesmo produtor ao longo de várias safras indica consistência, que é uma informação valiosa e difícil de obter de outro jeito.',
      ),
      h2('O que só o texto pode dizer'),
      p(
        'Se o vinho é leve ou encorpado. Se está pronto ou precisa de tempo. Se combina com o que você vai comer. Se o estilo é o que você procura. Um vinho de 95 pontos feito para guardar dez anos é uma péssima compra para quem vai abri-lo no sábado — e a nota, sozinha, não avisa.',
      ),
      caixa(
        'Por que usamos cinco taças',
        'A escala de cem pontos é o dialeto de quem vende vinho e comunica mal para quem bebe: ninguém fora do ramo sabe dizer o que separa um 89 de um 91. Cinco taças, com meias taças, é a régua que já se usa todos os dias em restaurante e em hotel. E o peso da avaliação, aqui, fica com o veredito escrito — as duas ou três frases que explicam o número.',
      ),
      p(
        'A recomendação prática é modesta: use a nota para reduzir a lista e o texto para decidir. E desconfie de qualquer avaliação que não explique, em português claro, por que o número é aquele.',
      ),
    ],
  },
]

async function semearMaterias(
  idDaAutora: number,
  indices: { categorias: Indice; tags: Indice; vinhos: Indice; guias: Indice },
): Promise<Indice> {
  secao('Matérias')
  const indice: Indice = {}

  for (const materia of MATERIAS) {
    indice[materia.slug] = await semear(
      'materias',
      porSlug(materia.slug),
      {
        titulo: materia.titulo,
        slug: materia.slug,
        subtitulo: materia.subtitulo,
        resumo: materia.resumo,
        corpo: rico(...materia.corpo),
        vinhosRelacionados: (materia.vinhos ?? [])
          .map((slug) => indices.vinhos[slug])
          .filter(Boolean),
        guiasRelacionados: (materia.guias ?? []).map((slug) => indices.guias[slug]).filter(Boolean),
        faq: materia.faq ?? [],
        autor: idDaAutora,
        categoria: indices.categorias[materia.categoria],
        tags: materia.tags.map((slug) => indices.tags[slug]).filter(Boolean),
        chipCor: materia.chipCor as never,
        dataPublicacao: diasAtras(materia.diasAtras, 8),
        destaqueHome: materia.destaqueHome ?? false,
        _status: 'published',
      },
      materia.titulo,
    )
  }

  return indice
}

/* -------------------------------------------------------------------------- */
/* 6. Edições do Boletim                                                       */
/* -------------------------------------------------------------------------- */

interface SementeDeEdicao {
  numero: number
  slug: string
  titulo: string
  subtitulo?: string
  resumo: string
  abertura: string
  secoes: { titulo: string; resumo: string; texto: string }[]
  fecho?: { titulo: string; texto: string }
}

const EDICOES: SementeDeEdicao[] = [
  {
    numero: 1,
    slug: 'a-primeira-taca',
    titulo: 'A primeira taça',
    subtitulo: 'Por que existe mais um boletim sobre vinho e o que ele se compromete a não fazer.',
    resumo:
      'A edição de estreia do Boletim Tanin explica o que esta carta semanal pretende ser: um texto sobre vinho escrito para quem bebe, sem jargão, sem patrocínio de importadora e sem link de afiliado. Também define as três regras editoriais que valem daqui em diante, inclusive a de publicar quando um vinho não vale o preço.',
    abertura:
      'Existem muitos boletins sobre vinho e quase todos são escritos para o mesmo público: gente que trabalha com vinho. Este é para o outro lado do balcão — quem compra com regularidade, gosta do assunto e não tem paciência para adjetivo.',
    secoes: [
      {
        titulo: 'O que esta carta é',
        resumo: 'Uma edição por semana, com o que vale a pena abrir e o que não vale o preço.',
        texto:
          'Toda quinta-feira, um texto único sobre um assunto único. Nada de agregador de notícias, nada de lista de dez vinhos. Quando a pauta pedir uma ficha de vinho, ela virá com nota, veredito e preço conferido na semana da publicação.',
      },
      {
        titulo: 'As três regras',
        resumo: 'Sem patrocínio de importadora, sem link de afiliado e correção visível quando erramos.',
        texto:
          'Primeira: nenhuma importadora paga por espaço aqui. Segunda: não há link de afiliado; se um dia houver, virá marcado. Terceira: quando uma amostra chega de graça, isso é dito na ficha. Erro publicado é erro corrigido no mesmo endereço, com a correção visível.',
      },
      {
        titulo: 'O que não vai aparecer',
        resumo: 'Adjetivos de catálogo, listas de fim de ano e vinho recomendado por prestígio de rótulo.',
        texto:
          'Palavras como “imperdível”, “incrível” e “delicioso” não descrevem nada e não entram. Também não haverá recomendação baseada em fama de produtor: se a garrafa não foi provada, ela não é recomendada.',
      },
    ],
  },
  {
    numero: 2,
    slug: 'branco-no-inverno',
    titulo: 'Branco no inverno',
    resumo:
      'A associação entre vinho branco e calor é hábito, não regra. Brancos encorpados, com textura e alguma passagem por madeira, funcionam melhor com comida de inverno do que boa parte dos tintos — e resolvem pratos gordurosos que o tinto atrapalha. Três estilos para experimentar antes que o frio acabe.',
    abertura:
      'Todo mês de junho, as vendas de vinho branco caem no Brasil e as de tinto sobem. É um reflexo condicionado, não uma decisão de sabor — e ele tira da mesa exatamente os vinhos que resolveriam metade dos pratos de inverno.',
    secoes: [
      {
        titulo: 'Branco encorpado existe',
        resumo: 'Chardonnay com madeira, brancos do Rhône e Fiano têm corpo comparável a um tinto leve.',
        texto:
          'Um Chardonnay fermentado em barrica tem textura, peso e temperatura de serviço de 12 °C — quase a de um tinto leve. Servido assim, ao lado de um frango assado ou de um risoto, ele não desaparece nem gela a mesa.',
      },
      {
        titulo: 'Gordura pede acidez',
        resumo: 'A cozinha de inverno é gordurosa, e acidez é o que o branco tem de sobra.',
        texto:
          'A cozinha de inverno é gordurosa por definição: creme, manteiga, queijo derretido, carne de panela. Gordura pede acidez, e acidez é o que o branco tem de sobra. É o motivo técnico pelo qual fondue combina melhor com branco seco do que com tinto.',
      },
      {
        titulo: 'O que abrir',
        resumo: 'Chardonnay do Mâconnais, brancos do Douro e Fiano do sul da Itália.',
        texto:
          'Três caminhos de preço acessível: um Mâconnais francês, um branco do Douro feito de castas locais ou um Fiano da Campânia. Todos os três têm corpo, acidez e capacidade de aguentar prato quente sem sumir.',
      },
    ],
  },
  {
    numero: 3,
    slug: 'o-que-significa-reserva',
    titulo: 'O que significa “reserva” no rótulo',
    resumo:
      'A palavra “reserva” tem definição legal em alguns países e nenhuma em outros. Na Espanha exige três anos de envelhecimento; em Portugal e na Itália há regras próprias; no Chile, na Argentina e no Brasil ela pode ser impressa sem nenhum critério. Entender essa diferença muda o que se espera da garrafa.',
    abertura:
      'De todas as palavras impressas em um rótulo de vinho, “reserva” é a que mais promete e a que menos garante — porque o que ela garante depende inteiramente do país que a imprimiu.',
    secoes: [
      {
        titulo: 'Onde a palavra tem lei',
        resumo: 'Espanha, Portugal e Itália definem em norma o tempo mínimo de envelhecimento.',
        texto:
          'Na Espanha, um tinto “reserva” precisa de três anos de envelhecimento, ao menos um deles em barrica. Portugal e Itália têm exigências próprias, também escritas em lei e fiscalizadas. Nesses casos, a palavra é informação.',
      },
      {
        titulo: 'Onde ela é livre',
        resumo: 'Chile, Argentina, Estados Unidos e Brasil não exigem nada para usar o termo.',
        texto:
          'Em boa parte do Novo Mundo, “reserva” pode ser impressa em qualquer garrafa. Isso não significa que o vinho seja ruim — significa apenas que a palavra descreve a intenção comercial do produtor, não uma prática verificável.',
      },
      {
        titulo: 'O que olhar no lugar',
        resumo: 'Origem específica, safra e teor alcoólico dizem mais do que qualquer adjetivo.',
        texto:
          'Território pequeno e nomeado, safra recente para brancos e informação técnica no contrarrótulo são pistas confiáveis. A regra geral continua valendo: se a palavra elogia, é publicidade; se informa lugar, ano ou número, é documento.',
      },
    ],
  },
  {
    numero: 4,
    slug: 'comprar-vinho-no-supermercado',
    titulo: 'Comprar vinho no supermercado sem se arrepender',
    resumo:
      'O supermercado é onde a maioria dos brasileiros compra vinho e também onde o vinho é pior tratado: prateleira em pé, luz forte e temperatura alta. Três verificações de dez segundos — posição da garrafa, safra e localização na loja — evitam a maior parte das compras ruins.',
    abertura:
      'Não há nada de errado em comprar vinho no supermercado. Há muita coisa errada em como o supermercado guarda vinho, e o consumidor pode compensar boa parte disso sem sair do corredor.',
    secoes: [
      {
        titulo: 'A garrafa está em pé há quanto tempo?',
        resumo: 'Rolha seca deixa entrar ar; prefira o que estiver deitado ou de giro rápido.',
        texto:
          'Vinho de rolha guardado em pé por meses seca a vedação e oxida. Prefira rótulos de alto giro ou garrafas com tampa de rosca, que não têm esse problema — e não é demérito nenhum: boa parte dos brancos australianos e neozelandeses sérios usa rosca.',
      },
      {
        titulo: 'Onde fica a prateleira',
        resumo: 'Perto de forno, vitrine iluminada ou parede quente, o vinho cozinha.',
        texto:
          'Calor e luz são os dois inimigos. Se a seção de vinhos fica ao lado da padaria, sob luz forte ou perto da entrada de sol, escolha outro lugar para comprar. Vinho cozido tem aroma de fruta cozida e final curto.',
      },
      {
        titulo: 'A safra ainda faz sentido?',
        resumo: 'Branco ou rosé com mais de três anos de prateleira já passou do ponto.',
        texto:
          'Para 95% dos vinhos vendidos em supermercado, a safra serve para dizer se o vinho ainda está no ponto. Brancos e rosés pedem os dois anos mais recentes; tintos de entrada aguentam três a cinco.',
      },
    ],
  },
  {
    numero: 5,
    slug: 'a-safra-importa',
    titulo: 'A safra importa mesmo?',
    resumo:
      'Para a maior parte dos vinhos vendidos no Brasil, a safra indica frescor, não qualidade. Ela pesa de verdade em regiões de clima instável, como Borgonha, Bordeaux e o norte da Itália, e quase não pesa em vales quentes e secos do Chile e da Argentina. Como saber em qual caso você está.',
    abertura:
      'Existe uma tabela de safras circulando em toda loja de vinho, e ela é útil para uma fração pequena do que está na prateleira. Vale entender qual fração.',
    secoes: [
      {
        titulo: 'Onde a safra decide',
        resumo: 'Regiões de clima marginal, com chuva imprevisível na vindima.',
        texto:
          'Borgonha, Bordeaux, Piemonte, Champagne, Mosel: lugares onde a uva amadurece no limite e um mês de chuva muda o ano inteiro. Ali, a diferença entre duas safras vizinhas é maior que a diferença entre dois produtores.',
      },
      {
        titulo: 'Onde ela quase não muda nada',
        resumo: 'Vales quentes e secos com irrigação controlada entregam consistência entre anos.',
        texto:
          'Em Mendoza, no vale central chileno ou no sul da Austrália, o sol é confiável e a irrigação é decidida pelo produtor. A variação entre safras existe, mas é pequena o suficiente para não guiar a compra.',
      },
      {
        titulo: 'O uso prático',
        resumo: 'Para vinhos de até R$ 150, a safra serve para medir frescor.',
        texto:
          'Na faixa de preço em que a maioria compra, o que a safra informa é idade. Branco recente, tinto de entrada com até cinco anos. Tabela de safra só começa a valer o esforço em garrafas acima de duzentos reais e em regiões de clima instável.',
      },
    ],
  },
  {
    numero: 6,
    slug: 'rose-fora-do-verao',
    titulo: 'Rosé fora do verão',
    resumo:
      'O rosé virou refém de uma estação e de uma cor. Fora do estilo pálido de Provence existem rosés de maceração longa, com estrutura e tanino leve, que acompanham carne branca e comida quente. Também existe uma questão de preço que quase ninguém coloca: rosé pálido está caro.',
    abertura:
      'A ideia de que rosé é bebida de piscina custou caro à categoria. Custou também ao consumidor, que paga por uma cor tanto quanto por um vinho.',
    secoes: [
      {
        titulo: 'A cor não é qualidade',
        resumo: 'Rosé pálido indica maceração curta, não superioridade.',
        texto:
          'O tom pálido de Provence virou padrão global de qualidade percebida, e produtores do mundo inteiro passaram a persegui-lo. Mas cor em rosé indica apenas quanto tempo o suco ficou com as cascas — e macerações mais longas dão vinhos mais interessantes com comida.',
      },
      {
        titulo: 'Rosé com estrutura',
        resumo: 'Tavel, rosés de Garnacha e clarete espanhol acompanham prato quente.',
        texto:
          'Existem rosés de cor cobre, corpo médio e leve tanino, feitos para a mesa. Servidos a 10 °C, resolvem porco assado, frango com páprica e comida com especiaria — território em que o rosé pálido não chega.',
      },
      {
        titulo: 'A conta do rosé de moda',
        resumo: 'Na faixa de R$ 150, brancos e espumantes costumam entregar mais.',
        texto:
          'A demanda internacional elevou o preço médio do rosé pálido de Provence acima do que a maioria das garrafas justifica na taça. Se a cor na mesa não for essencial, o mesmo dinheiro compra um branco de acidez alta ou um espumante nacional com muito mais a dizer.',
      },
    ],
  },
  {
    numero: 7,
    slug: 'sobrou-vinho-na-garrafa',
    titulo: 'Sobrou vinho na garrafa',
    resumo:
      'A crença de que vinho aberto estraga no dia seguinte faz muita gente beber mais do que gostaria ou desperdiçar meia garrafa. Com rolha de volta e geladeira, a maioria dos vinhos aguenta três dias, e alguns melhoram. O que funciona, o que é inútil e quais categorias duram semanas.',
    abertura:
      'Metade das perguntas que recebo sobre serviço de vinho é uma variação desta: sobrou meia garrafa, o que eu faço? A resposta curta é tampe e ponha na geladeira. A longa é mais interessante.',
    secoes: [
      {
        titulo: 'O que acontece com o vinho aberto',
        resumo: 'O oxigênio oxida os aromas e, depois, transforma álcool em vinagre.',
        texto:
          'A oxidação começa no momento em que a rolha sai. Nas primeiras horas ela costuma ajudar, abrindo o aroma; nos dias seguintes, apaga a fruta. A temperatura acelera todo o processo, e é por isso que a geladeira é a melhor ferramenta disponível — inclusive para tinto.',
      },
      {
        titulo: 'O que funciona',
        resumo: 'Rolha de volta, geladeira e, se possível, garrafa menor.',
        texto:
          'Tampar e refrigerar resolve a maior parte. Transferir o que sobrou para uma garrafa pequena, reduzindo o contato com o ar, funciona ainda melhor. Bombas de vácuo ajudam pouco; sistemas de gás inerte ajudam de verdade, mas custam caro para uso doméstico.',
      },
      {
        titulo: 'Quanto tempo cada tipo dura',
        resumo: 'Espumante um a dois dias; brancos e tintos três; fortificados semanas.',
        texto:
          'Espumante com tampa própria aguenta um ou dois dias com bolha. Brancos e tintos, três dias na geladeira. Vinhos fortificados como Tawny e Madeira duram semanas — foram feitos para isso e são a solução para quem bebe uma taça por vez.',
      },
    ],
  },
  {
    numero: 8,
    slug: 'champagne-nao-e-o-unico-espumante',
    titulo: 'Champagne não é o único espumante',
    resumo:
      'Champagne é uma região da França, não um sinônimo de vinho com bolha. Cava, Franciacorta, Crémant e o espumante brasileiro usam o mesmo método tradicional por uma fração do preço, e o Prosecco usa outro método com outro objetivo. O mapa completo, com preços e ocasiões.',
    abertura:
      'Chamar todo espumante de champanhe é hábito antigo e sai caro: leva a comparar bebidas diferentes pelo mesmo critério e a pagar por um nome quando se queria uma bolha.',
    secoes: [
      {
        titulo: 'Mesmo método, outro endereço',
        resumo: 'Cava, Crémant, Franciacorta e o brasileiro fermentam na garrafa.',
        texto:
          'Todos fazem a segunda fermentação dentro da garrafa e repousam sobre as leveduras, exatamente como em Champagne. O que muda é a origem da uva, o tempo de repouso e o preço — geralmente entre um terço e metade.',
      },
      {
        titulo: 'Outro método, outro objetivo',
        resumo: 'Prosecco e Moscatel fermentam em tanque para preservar aroma de fruta.',
        texto:
          'O método Charmat não busca aroma de pão: busca preservar a pera, a maçã e a flor branca da uva. Julgar um Prosecco pelos critérios de um Champagne é como cobrar de uma laranja o sabor de uma maçã.',
      },
      {
        titulo: 'Qual abrir quando',
        resumo: 'Método tradicional para a mesa; Charmat para o começo da noite.',
        texto:
          'Espumante de método tradicional tem estrutura para atravessar uma refeição inteira. O Charmat funciona melhor sozinho, no início da noite, bem gelado, sem exigir atenção de ninguém.',
      },
    ],
  },
  {
    numero: 9,
    slug: 'vinho-e-queijo-quase-nunca-funciona',
    titulo: 'Vinho e queijo quase nunca funciona',
    resumo:
      'A dupla mais celebrada da gastronomia é também uma das mais problemáticas: gordura láctea e sal reagem mal com tanino, e tábuas de queijo variado tornam a escolha de uma garrafa impossível. O que costuma dar errado, e as três combinações que funcionam quase sempre.',
    abertura:
      'Poucas ideias sobrevivem tão bem à evidência quanto a de que vinho e queijo nasceram um para o outro. Na prática, a maior parte das combinações entre os dois é medíocre, e vale entender por quê.',
    secoes: [
      {
        titulo: 'O problema do tanino',
        resumo: 'Sal e gordura láctea acentuam a adstringência de tintos estruturados.',
        texto:
          'Um tinto tânico ao lado de um queijo salgado fica áspero e metálico. A tábua de queijos com um Cabernet encorpado, cena de tantos jantares, é uma das harmonizações mais frágeis que existem.',
      },
      {
        titulo: 'O problema da tábua',
        resumo: 'Cinco queijos diferentes exigem cinco vinhos diferentes.',
        texto:
          'Cabra fresco, brie, gouda curado e azul são quatro categorias com necessidades opostas. Nenhuma garrafa atende as quatro. Se a tábua é obrigatória, escolha o vinho pelo queijo que você mais quer comer.',
      },
      {
        titulo: 'As três que funcionam',
        resumo: 'Cabra com Sauvignon Blanc, azul com fortificado doce e duro com espumante.',
        texto:
          'Queijo de cabra com Sauvignon Blanc, por acidez espelhada. Queijo azul com Porto Tawny ou Sauternes, por contraste entre sal e doçura. Queijo duro e velho com espumante de método tradicional, por acidez e bolha limpando a gordura.',
      },
    ],
  },
  {
    numero: 10,
    slug: 'quanto-tempo-dura-um-vinho-guardado',
    titulo: 'Quanto tempo dura um vinho guardado',
    resumo:
      'A maioria absoluta dos vinhos vendidos no mundo foi feita para ser bebida em até cinco anos, e guardá-los por mais tempo não os melhora: apaga a fruta. Quais características indicam capacidade real de guarda, e como estimar o prazo de uma garrafa antes de deitá-la.',
    abertura:
      'A cena é comum: alguém ganha uma garrafa, decide guardá-la para uma ocasião especial e a abre oito anos depois, decepcionado. Quase sempre o vinho não estragou — ele apenas nunca foi feito para esperar.',
    secoes: [
      {
        titulo: 'O que sustenta um vinho no tempo',
        resumo: 'Acidez, tanino, açúcar e álcool funcionam como conservantes.',
        texto:
          'Vinhos que envelhecem bem têm pelo menos dois desses quatro elementos em quantidade alta. É por isso que Riesling seco e Barolo, tão diferentes entre si, duram décadas: um pela acidez, o outro pelo tanino.',
      },
      {
        titulo: 'O que a idade faz',
        resumo: 'A fruta primária cede lugar a notas terciárias de couro, cogumelo e mel.',
        texto:
          'Com os anos, a fruta fresca desaparece e surgem aromas de folha seca, couro, cogumelo, mel e nozes. Quem gosta de fruta viva não vai gostar de vinho velho — é uma questão de preferência, não de superioridade.',
      },
      {
        titulo: 'Uma estimativa honesta',
        resumo: 'Até R$ 100, beba em três anos; acima de R$ 300, pode haver o que esperar.',
        texto:
          'Regra prática para o mercado brasileiro: vinhos até cem reais foram feitos para os próximos três anos. Entre cem e trezentos, alguns ganham dois ou três anos de garrafa. Acima disso, e em regiões de guarda, aí sim vale deitar a garrafa.',
      },
    ],
  },
  {
    numero: 11,
    slug: 'quantas-tacas-voce-precisa',
    titulo: 'Quantas taças você realmente precisa',
    resumo:
      'A resposta comercial é uma para cada casta; a resposta prática é duas. Uma taça universal de bojo médio resolve tinto, branco e rosé, e uma de bojo alongado resolve espumante melhor que a flûte tradicional. O que importa de verdade em uma taça é a espessura da borda.',
    abertura:
      'Existe uma indústria inteira dedicada a convencer você de que cada uva merece um cristal diferente. Ela tem argumentos, alguns verdadeiros, e um interesse evidente.',
    secoes: [
      {
        titulo: 'O que o formato faz',
        resumo: 'Bojo largo acelera a evaporação; boca estreita concentra o aroma no nariz.',
        texto:
          'A física é simples e real: mais superfície de contato com o ar significa mais evaporação de compostos aromáticos, inclusive o álcool. Boca estreita funciona como funil. O efeito existe — e é menor que o da temperatura de serviço.',
      },
      {
        titulo: 'As duas que bastam',
        resumo: 'Universal de bojo médio e taça alongada para espumante.',
        texto:
          'Uma taça universal de bojo médio e haste longa atende tinto, branco e rosé sem prejuízo perceptível. Para espumante, prefira uma taça de bojo alongado à flûte estreita, que é elegante e abafa o aroma.',
      },
      {
        titulo: 'O que olhar na hora de comprar',
        resumo: 'Borda fina, haste que permita segurar sem esquentar o vinho e altura que caiba na pia.',
        texto:
          'Borda fina muda a sensação na boca mais do que o formato do bojo. Haste longa evita a mão aquecendo o vinho. E uma taça que não cabe no armário ou quebra na primeira lavagem não serve para uso doméstico, por melhor que seja o cristal.',
      },
    ],
  },
  {
    numero: 12,
    slug: 'o-tinto-gelado',
    titulo: 'O tinto gelado',
    resumo:
      'Servir tinto levemente gelado deixou de ser heresia e virou prática comum em restaurantes brasileiros — por razões físicas, não estéticas. Quais tintos ganham com 13 °C, quais perdem, e por que a expressão “temperatura ambiente” não descreve nenhum ambiente brasileiro.',
    abertura:
      'Há dez anos, pedir tinto gelado num restaurante rendia olhar atravessado. Hoje é o que mais sai entre novembro e março, e a mudança tem explicação técnica.',
    secoes: [
      {
        titulo: 'Por que o ambiente não serve',
        resumo: '“Temperatura ambiente” foi definida em casas europeias a 16 °C.',
        texto:
          'A expressão vem de residências sem aquecimento central, onde a sala de jantar ficava entre 15 e 17 °C. Uma sala brasileira em fevereiro passa dos 28 °C. Servir tinto “ao ambiente” aqui significa servir a uma temperatura em que o álcool domina e a fruta desaparece.',
      },
      {
        titulo: 'Quais tintos ganham',
        resumo: 'Pinot Noir, Gamay, Frappato, País e tintos leves de baixo tanino.',
        texto:
          'Tintos de cor clara, tanino baixo e acidez alta ficam melhores entre 13 e 15 °C: o frio realça a acidez e dá nitidez à fruta vermelha. Servidos quentes, esses mesmos vinhos ficam moles e sem contorno.',
      },
      {
        titulo: 'Quais tintos perdem',
        resumo: 'Vinhos muito tânicos ficam ásperos abaixo de 16 °C.',
        texto:
          'O frio acentua a adstringência. Um Barolo jovem ou um Cabernet estruturado a 13 °C fica seco e duro. Para esses, a faixa útil é de 16 a 18 °C — o que, num apartamento quente, ainda significa vinte minutos de geladeira.',
      },
    ],
  },
  {
    numero: 13,
    slug: 'uma-garrafa-de-sessenta-reais',
    titulo: 'Uma garrafa de R$ 60 que presta',
    resumo:
      'Abaixo de setenta reais, a estrutura de custo do vinho importado deixa pouca margem para qualidade — mas não nenhuma. Onde procurar nessa faixa: países com acordo comercial, regiões pouco famosas, castas fora de moda e vinho nacional. E o que aceitar em troca.',
    abertura:
      'A pergunta chega toda semana em alguma forma: existe vinho bom por sessenta reais? Existe, com uma condição — parar de procurar onde todo mundo procura.',
    secoes: [
      {
        titulo: 'A matemática da faixa',
        resumo: 'Metade do preço final é imposto e margem; sobra pouco para o vinho.',
        texto:
          'Numa garrafa importada de sessenta reais, o custo do vinho na origem raramente passa de dois euros. Isso limita o que é possível: não haverá vinhedo selecionado nem barrica. Haverá, no melhor caso, uva sã e vinificação limpa.',
      },
      {
        titulo: 'Onde procurar',
        resumo: 'Chile e Argentina por acordo comercial, regiões pouco famosas e castas fora de moda.',
        texto:
          'Chile e Argentina pagam menos imposto de importação. Regiões sem fama internacional — Beira Interior, Sicília, La Mancha, Douro Superior — vendem mais barato pelo mesmo trabalho. E castas fora de moda, como Carignan, Bonarda e Trebbiano, custam menos por não terem demanda.',
      },
      {
        titulo: 'O que aceitar em troca',
        resumo: 'Final curto e menos complexidade — não defeito.',
        texto:
          'Um bom vinho de sessenta reais é limpo, fresco e curto. Ele não deve ter aroma de vinagre, de esmalte, de madeira em pó nem de fruta cozida. Simplicidade é aceitável nessa faixa; defeito, não.',
      },
    ],
  },
  {
    numero: 14,
    slug: 'adega-em-apartamento',
    titulo: 'Adega em apartamento',
    resumo:
      'Guardar vinho num apartamento brasileiro é, sobretudo, um problema de temperatura constante — mais do que de temperatura baixa. Onde a garrafa não deve ficar, o que uma adega elétrica resolve, e por que a geladeira comum serve melhor do que a fama sugere.',
    abertura:
      'Quase ninguém precisa de uma adega. Quase todo mundo precisa parar de guardar vinho em cima do armário da cozinha, que é o pior lugar de qualquer casa.',
    secoes: [
      {
        titulo: 'O inimigo é a variação',
        resumo: 'Oscilação diária de temperatura envelhece o vinho mais rápido que calor estável.',
        texto:
          'Uma garrafa a 22 °C constantes sofre menos do que uma que passa de 20 para 30 °C todo dia. A dilatação e a contração repetidas empurram vinho contra a rolha e puxam ar para dentro. Constância vale mais que frio.',
      },
      {
        titulo: 'Onde não guardar',
        resumo: 'Cozinha, lavanderia, cima da geladeira e qualquer parede com sol.',
        texto:
          'A cozinha reúne calor, vapor e variação. O topo da geladeira dissipa calor do motor. Paredes voltadas para o sol da tarde chegam a 35 °C. Um armário interno no ponto mais fresco da casa é melhor do que qualquer um desses lugares.',
      },
      {
        titulo: 'Adega elétrica e geladeira comum',
        resumo: 'A adega resolve; a geladeira serve para semanas, não para anos.',
        texto:
          'Uma adega de vinte garrafas mantém 14 °C estáveis e custa menos que duas garrafas boas. Se não houver espaço, a geladeira comum é aceitável para guardar por semanas — o ar seco resseca a rolha no longo prazo, mas para consumo próximo é a opção mais estável de um apartamento quente.',
      },
    ],
  },
  {
    numero: 15,
    slug: 'vinho-em-restaurante',
    titulo: 'Vinho em restaurante sem pagar caro',
    resumo:
      'A margem sobre vinho em restaurante costuma ficar entre duas e três vezes o preço de varejo, e ela não é distribuída de forma uniforme pela carta. Onde estão os melhores negócios de uma lista, o que perguntar ao sommelier e por que a segunda garrafa mais barata é a pior escolha possível.',
    abertura:
      'Toda carta de vinhos tem pontos em que a margem aperta e pontos em que ela afrouxa. Saber onde eles ficam muda o valor da conta sem mudar a qualidade da noite.',
    secoes: [
      {
        titulo: 'A armadilha da segunda mais barata',
        resumo: 'É a linha que mais vende e, por isso, a de maior margem.',
        texto:
          'Muita gente evita o vinho mais barato por constrangimento e pede o segundo. Cartas bem construídas sabem disso e concentram ali a maior margem relativa da lista. Na prática, o mais barato costuma ser um negócio melhor.',
      },
      {
        titulo: 'Onde a margem afrouxa',
        resumo: 'No meio da carta e em regiões pouco conhecidas do público.',
        texto:
          'Garrafas de regiões que o cliente não reconhece giram devagar e recebem margem menor para sair. É onde ficam as melhores relações: brancos de regiões frias, tintos italianos fora da Toscana, portugueses fora do Douro.',
      },
      {
        titulo: 'A pergunta certa ao sommelier',
        resumo: 'Diga a faixa de preço em voz alta e peça o melhor negócio dela.',
        texto:
          'Em vez de pedir recomendação genérica, aponte uma garrafa na carta e diga: “quero gastar em torno disto — o que vale mais a pena nessa faixa?”. Sommelier bom responde com precisão, e a pergunta elimina o desconforto de falar de dinheiro na mesa.',
      },
    ],
  },
  {
    numero: 16,
    slug: 'sulfitos',
    titulo: 'Sulfitos: o que eles fazem e o que não fazem',
    resumo:
      'A frase “contém sulfitos” no rótulo é obrigatória por lei e assusta mais do que deveria. O dióxido de enxofre é conservante usado há séculos, presente em quantidade menor no vinho do que em muitas frutas secas. O que a ciência mostra sobre dor de cabeça, alergia e vinho sem sulfito.',
    abertura:
      'Poucos ingredientes carregam tanta fama ruim com tão pouca evidência quanto o sulfito. Vale separar o que ele faz do que lhe atribuem.',
    secoes: [
      {
        titulo: 'Para que serve',
        resumo: 'Impede oxidação e evita fermentações indesejadas.',
        texto:
          'O dióxido de enxofre protege o vinho do oxigênio e de microrganismos que o transformariam em vinagre. Sem ele, o vinho fica instável e sensível a calor e a transporte — motivo pelo qual quase todo vinho do mundo leva alguma dose.',
      },
      {
        titulo: 'Dor de cabeça',
        resumo: 'A evidência aponta para álcool, histaminas e taninos, não para o sulfito.',
        texto:
          'Não há suporte científico consistente para associar sulfito à dor de cabeça de vinho tinto. Sulfito provoca reação em uma parcela pequena da população, sobretudo pessoas asmáticas, e o sintoma típico é respiratório. Vinho branco costuma ter mais sulfito que tinto — e é o tinto que carrega a fama.',
      },
      {
        titulo: 'Vinho sem sulfito adicionado',
        resumo: 'Existe, é mais frágil e exige transporte e estoque refrigerados.',
        texto:
          'Toda fermentação produz uma pequena quantidade de sulfito naturalmente, então “zero sulfito” não existe. O que existe é vinho sem adição, que é mais sensível a calor. Comprado de quem cuida da cadeia de frio, é excelente; comprado de um depósito quente, é loteria.',
      },
    ],
  },
  {
    numero: 17,
    slug: 'porto-alem-da-sobremesa',
    titulo: 'Porto além da sobremesa',
    resumo:
      'O vinho do Porto costuma aparecer no fim da refeição e sair de cena até o fim do ano seguinte. É um desperdício: o Tawny funciona como aperitivo levemente fresco, dura semanas depois de aberto e resolve o problema de quem quer uma taça sem abrir uma garrafa inteira.',
    abertura:
      'Existe uma garrafa que aguenta um mês aberta na geladeira, custa o mesmo que um tinto mediano e quase ninguém compra fora de dezembro. É o Porto Tawny.',
    secoes: [
      {
        titulo: 'Os estilos, em uma frase cada',
        resumo: 'Ruby é fruta jovem, Tawny é oxidação lenta, Vintage é guarda longa.',
        texto:
          'Ruby envelhece pouco e mantém fruta vermelha vibrante. Tawny envelhece em cascos por dez, vinte ou trinta anos e ganha noz, figo e caramelo. Vintage vem de uma safra excepcional e é feito para décadas de garrafa.',
      },
      {
        titulo: 'Como servir um Tawny',
        resumo: 'Levemente fresco, a 14 °C, em taça pequena.',
        texto:
          'Servido gelado demais, fecha; servido morno, fica pesado e doce. A 14 °C, o equilíbrio entre doçura, acidez e a nota tostada aparece por inteiro. Taça pequena, dose curta — é um vinho de 20% de álcool.',
      },
      {
        titulo: 'Por que ele é prático',
        resumo: 'Dura semanas aberto, porque já foi oxidado de propósito.',
        texto:
          'Um Tawny passou anos em contato controlado com o ar antes de ser engarrafado. Isso significa que mais algumas semanas na geladeira não mudam nada. Para quem bebe uma taça por vez, é a garrafa mais econômica que existe.',
      },
    ],
  },
  {
    numero: 18,
    slug: 'carta-de-vinhos-por-taca',
    titulo: 'A carta por taça diz tudo sobre o restaurante',
    resumo:
      'O programa de vinho por taça é o lugar onde um restaurante mostra o que pensa sobre vinho. Quantos rótulos abertos, com que sistema de conservação, em que taça e a que temperatura — quatro sinais que se leem antes de pedir e que preveem bem a experiência da noite.',
    abertura:
      'Dá para saber muito sobre um restaurante olhando a seção de vinho por taça da carta, e mais ainda olhando a garrafa aberta atrás do balcão.',
    secoes: [
      {
        titulo: 'Quantos rótulos, e quais',
        resumo: 'Uma seleção curta e pensada vale mais que uma lista longa e óbvia.',
        texto:
          'Seis rótulos por taça bem escolhidos — um espumante, dois brancos de estilos diferentes, um rosé ou laranja, dois tintos de peso distinto — indicam um programa pensado. Doze rótulos previsíveis indicam uma lista comprada de um distribuidor.',
      },
      {
        titulo: 'Como a garrafa é conservada',
        resumo: 'Sistema de gás inerte ou giro rápido; rolha reposta é sinal de risco.',
        texto:
          'Vinho por taça só funciona com giro alto ou com sistema de preservação. Se a casa serve de uma garrafa aberta há três dias sem nenhum recurso, o que chega à taça é oxidação. Perguntar quando a garrafa foi aberta é legítimo e educado.',
      },
      {
        titulo: 'Taça e temperatura',
        resumo: 'Taça grossa e branco a 5 °C indicam que ninguém pensou no assunto.',
        texto:
          'Borda grossa, taça pequena demais e branco servido congelado são sinais de que o vinho é item de cardápio, não parte do projeto da casa. Um restaurante que serve tinto levemente fresco no verão, por outro lado, provavelmente pensou em tudo o mais.',
      },
    ],
  },
  {
    numero: 19,
    slug: 'presente-de-vinho-sem-errar',
    titulo: 'Presente de vinho sem errar',
    resumo:
      'Dar vinho de presente é arriscado porque o presenteador escolhe pelo próprio gosto ou pelo preço. Há três estratégias que reduzem quase a zero a chance de erro, e nenhuma delas exige saber do que a pessoa gosta — o que costuma ser exatamente a informação que falta.',
    abertura:
      'Quem dá vinho de presente costuma resolver o problema pelo preço, o que é a pior heurística disponível. Existem três melhores.',
    secoes: [
      {
        titulo: 'Estratégia 1: o espumante',
        resumo: 'É a categoria que menos depende do gosto de quem recebe.',
        texto:
          'Um bom espumante de método tradicional agrada quase todo mundo, serve para qualquer ocasião e não obriga o presenteado a esperar um momento especial. É a escolha mais segura que existe, e o nacional entrega muito na faixa de cem reais.',
      },
      {
        titulo: 'Estratégia 2: a história',
        resumo: 'Vinho com uma história para contar sobrevive à diferença de gosto.',
        texto:
          'Uma casta que quase desapareceu, uma região que ninguém conhece, uma vinha de cem anos. Se o vinho vem com um motivo, ele funciona como presente mesmo que o estilo não seja exatamente o preferido de quem recebe.',
      },
      {
        titulo: 'Estratégia 3: a meia garrafa dupla',
        resumo: 'Duas meias garrafas contrastantes valem mais que uma inteira.',
        texto:
          'Duas garrafas de 375 ml de estilos opostos — um branco tenso e um tinto leve, por exemplo — transformam o presente em experiência comparativa. Custa o mesmo e diz muito mais do que uma garrafa cara escolhida no escuro.',
      },
    ],
  },
  {
    numero: 20,
    slug: 'a-uva-que-ninguem-pede',
    titulo: 'A uva que ninguém pede',
    resumo:
      'Castas fora de moda são a última fronteira de preço justo no vinho: fazem vinhos tão bons quanto os das uvas famosas e custam menos porque ninguém as procura. Cinco nomes difíceis de pronunciar que valem a tentativa, e por que a moda define o preço mais que a qualidade.',
    abertura:
      'O preço de uma garrafa responde à demanda, e a demanda responde ao que as pessoas sabem pronunciar. Essa frase parece cínica e é apenas descritiva — e ela abre uma oportunidade.',
    secoes: [
      {
        titulo: 'Por que a moda define o preço',
        resumo: 'Uva reconhecível gira mais rápido e sustenta margem maior.',
        texto:
          'Um Cabernet e um Carignan do mesmo produtor, do mesmo vinhedo e com o mesmo custo saem da adega com preços diferentes, porque um deles vende sozinho. A diferença não está na taça: está no reconhecimento do nome.',
      },
      {
        titulo: 'Cinco nomes que valem a tentativa',
        resumo: 'Carignan, Assyrtiko, Mencía, Trousseau e Baga.',
        texto:
          'Carignan de vinhas velhas, do Chile ou do sul da França, dá tintos ácidos e sérios. Assyrtiko grego é um dos brancos mais salinos do mundo. Mencía, na Espanha, faz tintos leves e florais. Trousseau e Baga completam a lista com acidez alta e preço baixo.',
      },
      {
        titulo: 'Como pedir sem constrangimento',
        resumo: 'Aponte na carta e peça ajuda com a pronúncia; ninguém liga.',
        texto:
          'A barreira real do vinho quase nunca é o sabor — é o medo de errar o nome em voz alta. Apontar na carta resolve, e todo sommelier competente responde à pergunta como quem agradece pela curiosidade.',
      },
    ],
  },
  {
    numero: 21,
    slug: 'vinho-de-altitude-no-brasil',
    titulo: 'Vinho de altitude no Brasil',
    resumo:
      'Acima de 1.200 metros, em Santa Catarina, a vindima acontece em abril e maio, meses secos e frios, e a maturação é lenta. É a resposta brasileira ao problema histórico da chuva na colheita — e produz vinhos de acidez alta e álcool contido que não se parecem com nada mais no país.',
    abertura:
      'O maior obstáculo do vinho brasileiro nunca foi o sol: foi a chuva na hora errada. A viticultura de altitude catarinense é uma tentativa de contornar isso pela geografia.',
    secoes: [
      {
        titulo: 'O problema que ela resolve',
        resumo: 'Vindima em abril e maio escapa das chuvas de janeiro e fevereiro.',
        texto:
          'Na Serra Gaúcha, a colheita cai no auge do verão úmido, e chuva na vindima dilui a uva e favorece fungos. Acima de 1.200 metros em Santa Catarina, o ciclo atrasa em várias semanas e a colheita acontece em meses secos.',
      },
      {
        titulo: 'O que aparece na taça',
        resumo: 'Acidez alta, álcool entre 12% e 13% e fruta nítida.',
        texto:
          'A maturação lenta preserva acidez e aroma. Os tintos são de corpo médio, coloridos e frescos; os brancos e espumantes têm tensão. É um perfil próprio, que não imita nem Mendoza nem Bordeaux.',
      },
      {
        titulo: 'O que ainda falta',
        resumo: 'Escala pequena, custo alto e distribuição concentrada no Sul.',
        texto:
          'São poucas vinícolas, com produção limitada e custo por hectare elevado. Fora do Sul e de São Paulo, encontrar esses vinhos exige comprar direto do produtor. É o preço de uma categoria que ainda está sendo construída.',
      },
    ],
  },
  {
    numero: 22,
    slug: 'meia-garrafa-e-vinho-em-lata',
    titulo: 'Meia garrafa e vinho em lata',
    resumo:
      'Duas embalagens resolvem o problema de quem bebe uma taça por noite e não quer abrir 750 ml. A meia garrafa de 375 ml é subaproveitada no varejo brasileiro; a lata melhorou de qualidade e é a solução mais prática para praia, viagem e piquenique. O que considerar em cada uma.',
    abertura:
      'A garrafa de 750 ml existe por razões históricas de transporte, não por corresponder ao consumo de ninguém. Duas alternativas mais adequadas ao consumo doméstico atual seguem raras no Brasil.',
    secoes: [
      {
        titulo: 'A meia garrafa',
        resumo: 'Mesmo vinho, metade do volume, e envelhecimento mais rápido.',
        texto:
          'Os 375 ml resolvem a noite de uma pessoa. Um detalhe técnico importante: pela proporção maior entre ar e líquido, a meia garrafa evolui mais rápido — o que é vantagem para beber logo e desvantagem para guardar.',
      },
      {
        titulo: 'A lata',
        resumo: 'Qualidade média em alta, ideal para praia, viagem e piquenique.',
        texto:
          'A lata protege da luz por completo, esfria rápido e não quebra. A categoria melhorou bastante nos últimos anos, sobretudo em brancos e espumantes. O que se perde é a possibilidade de guarda — é bebida para os próximos meses.',
      },
      {
        titulo: 'Por que ainda são raras aqui',
        resumo: 'Custo por litro maior e resistência do varejo a formatos fora do padrão.',
        texto:
          'Envasar em 375 ml custa mais por litro e ocupa o mesmo espaço de prateleira. Enquanto o varejo tratar essas embalagens como exceção, elas continuarão caras — e o consumidor que bebe uma taça por noite continuará abrindo garrafas grandes demais.',
      },
    ],
  },
]

async function semearEdicoes(): Promise<void> {
  secao('Edições do Boletim')

  for (const edicao of EDICOES) {
    // A edição mais recente saiu na semana passada; as anteriores recuam uma semana
    // cada, reconstruindo um arquivo de vinte e dois envios.
    const dataEnvio = diasAtras((EDICOES.length - edicao.numero + 1) * 7, 7)

    const corpoDaEdicao: No[] = [
      p(edicao.abertura),
      ...edicao.secoes.flatMap((trecho) => [h2(trecho.titulo), p(trecho.texto)]),
    ]
    if (edicao.fecho) corpoDaEdicao.push(caixa(edicao.fecho.titulo, edicao.fecho.texto))

    await semear(
      'edicoes',
      { numero: { equals: edicao.numero } },
      {
        numero: edicao.numero,
        slug: edicao.slug,
        titulo: edicao.titulo,
        subtitulo: edicao.subtitulo ?? null,
        resumo: edicao.resumo,
        corpo: rico(...corpoDaEdicao),
        // Os blocos espelham as seções do corpo: o índice lateral aponta para trechos
        // que existem de verdade, em vez de virar uma lista decorativa.
        // A âncora fica vazia de propósito — o hook do campo a deriva do título.
        blocos: edicao.secoes.map((trecho) => ({
          titulo: trecho.titulo,
          resumo: trecho.resumo,
        })),
        dataEnvio,
        // `chipCor` vai nulo, e não ausente: ausente faria o valor padrão do campo
        // assumir antes do hook. Com nulo, é a numeração que escolhe a cor, e a fita
        // cromática do arquivo percorre a escala inteira sozinha.
        chipCor: null,
        _status: 'published',
      },
      `Edição ${String(edicao.numero).padStart(2, '0')} · ${edicao.titulo}`,
    )
  }
}

/* -------------------------------------------------------------------------- */
/* 7. Agenda                                                                   */
/* -------------------------------------------------------------------------- */

const EVENTOS = [
  {
    slug: 'brancos-que-envelhecem-sao-paulo',
    nome: 'Brancos que envelhecem: seis rótulos, seis safras',
    emDias: 12,
    hora: 19,
    tipo: 'degustacao',
    local: 'Casa Tanin',
    cidade: 'São Paulo',
    estado: 'SP',
    endereco: 'Rua dos Pinheiros, região de Pinheiros',
    descricao:
      'Prova comparativa de seis brancos da mesma casta em seis safras diferentes, de 2015 a 2023, para acompanhar o que o tempo faz com acidez, aroma e textura. Vinte lugares, prova conduzida e ficha de degustação em papel. Indicado para quem já bebe vinho com regularidade e nunca provou um branco com dez anos de garrafa.',
    preco: 'R$ 220',
    organizador: 'Tanin',
    chipCor: 'ouro-velho',
  },
  {
    slug: 'feira-do-vinho-independente-porto-alegre',
    nome: 'Feira do Vinho Independente',
    emDias: 20,
    hora: 14,
    tipo: 'feira',
    local: 'Pavilhão da Redenção',
    cidade: 'Porto Alegre',
    estado: 'RS',
    descricao:
      'Encontro de pequenos produtores e importadoras independentes, com trinta expositores e degustação livre mediante taça de entrada. É a melhor oportunidade do ano para provar rótulos de produção pequena que não chegam ao varejo tradicional e conversar diretamente com quem faz o vinho.',
    preco: 'R$ 90 com taça inclusa',
    organizador: 'Associação de Produtores Independentes',
    chipCor: 'purpura',
  },
  {
    slug: 'jantar-douro-em-cinco-tempos-rio',
    nome: 'Jantar harmonizado: o Douro em cinco tempos',
    emDias: 33,
    hora: 20,
    tipo: 'jantar',
    local: 'Restaurante Casa das Encostas',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    descricao:
      'Cinco pratos e cinco vinhos do Douro, de um branco de altitude ao Tawny de dez anos, com apresentação de cada garrafa antes do serviço. Trinta lugares em mesas comunitárias. O menu completo e as fichas dos vinhos são enviados por e-mail a quem se inscreve.',
    preco: 'R$ 480',
    organizador: 'Casa das Encostas',
    chipCor: 'granada',
  },
  {
    slug: 'curso-como-provar-vinho-bh',
    nome: 'Curso introdutório: como provar vinho',
    emDias: 47,
    hora: 10,
    tipo: 'curso',
    local: 'Centro Cultural da Savassi',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    descricao:
      'Aula de quatro horas sobre o método de degustação, sem jargão e sem exigência de conhecimento prévio. Doze vinhos servidos em comparações diretas para treinar a percepção de acidez, tanino, açúcar e álcool. Material impresso incluso e turma limitada a vinte e quatro pessoas.',
    preco: 'R$ 340',
    organizador: 'Escola Livre do Gosto',
    chipCor: 'cereja',
  },
  {
    slug: 'lancamento-safra-2024-bento-goncalves',
    nome: 'Lançamento das safras 2024 da Serra Gaúcha',
    emDias: 61,
    hora: 11,
    tipo: 'lancamento',
    local: 'Centro de Eventos do Vale',
    cidade: 'Bento Gonçalves',
    estado: 'RS',
    descricao:
      'Apresentação conjunta das safras 2024 de doze vinícolas da Serra Gaúcha, com prova aberta ao público na parte da tarde. É a primeira oportunidade de provar os espumantes e brancos do ano antes de eles chegarem ao varejo, e de comparar rótulos vizinhos lado a lado.',
    preco: 'Gratuito, com inscrição prévia',
    organizador: 'Consórcio de Vinícolas da Serra',
    chipCor: 'palha',
  },
  {
    slug: 'aula-aberta-espumantes-online',
    nome: 'Aula aberta: espumantes de método tradicional',
    emDias: 80,
    hora: 20,
    tipo: 'online',
    cidade: 'Online',
    descricao:
      'Encontro de noventa minutos, transmitido ao vivo, sobre como a segunda fermentação na garrafa muda aroma, textura e preço. Inclui roteiro de compra com rótulos nacionais e importados em três faixas de preço. A gravação fica disponível por trinta dias para quem se inscreve.',
    preco: 'Gratuito',
    organizador: 'Tanin',
    chipCor: 'ouro',
  },
] as const

async function semearEventos(): Promise<void> {
  secao('Agenda')

  for (const evento of EVENTOS) {
    await semear(
      'eventos',
      porSlug(evento.slug),
      {
        nome: evento.nome,
        slug: evento.slug,
        data: emDias(evento.emDias, evento.hora),
        local: 'local' in evento ? evento.local : null,
        cidade: evento.cidade,
        estado: 'estado' in evento ? evento.estado : null,
        endereco: 'endereco' in evento ? evento.endereco : null,
        tipo: evento.tipo,
        descricao: evento.descricao,
        preco: evento.preco,
        organizador: evento.organizador,
        chipCor: evento.chipCor as never,
        _status: 'published',
      },
      `${evento.nome} · ${evento.cidade}`,
    )
  }
}

/* -------------------------------------------------------------------------- */
/* 8. Configurações do site                                                    */
/* -------------------------------------------------------------------------- */

async function semearConfiguracoes(idDaAutora: number): Promise<void> {
  secao('Configurações do site')

  await payload.updateGlobal({
    slug: 'configuracoes',
    depth: 0,
    data: {
      nomeSite: 'Tanin',
      assinatura: 'Vinho com vagar',
      descricao:
        'A Tanin é uma publicação independente sobre vinho, escrita por Ana Luiza Leal para quem bebe — e não para quem vende.',
      autoraPrincipal: idDaAutora,
      boletimTitulo: 'Boletim Tanin',
      boletimChamada:
        'Toda semana, uma carta sobre vinho — o que vale a pena abrir, o que não vale o preço e o que ninguém está contando.',
      boletimPeriodicidade: 'Semanal, às quintas',
      menu: [
        { rotulo: 'Matérias', endereco: '/materias' },
        { rotulo: 'Boletim', endereco: '/boletim' },
        { rotulo: 'Vinhos', endereco: '/vinhos' },
        { rotulo: 'Guias', endereco: '/guias' },
        { rotulo: 'Agenda', endereco: '/agenda' },
      ],
      rodapeTexto:
        'A Tanin não recebe patrocínio de importadora, não publica conteúdo pago disfarçado de matéria e não usa link de afiliado. Quando uma garrafa chega como amostra, isso é dito na ficha. É o que sustenta a única coisa que temos para oferecer: a confiança de quem lê.',
      redes: [
        { rede: 'instagram', url: 'https://instagram.com/tanin.vinho' },
        { rede: 'youtube', url: 'https://www.youtube.com/@taninvinho' },
        { rede: 'linkedin', url: 'https://www.linkedin.com/company/tanin-vinho' },
      ],
      homeChamada: 'Vinho contado como quem conversa, não como quem vende.',
    },
  })

  console.log('  ~ global “configuracoes” atualizado')
}

/* -------------------------------------------------------------------------- */
/* Execução                                                                    */
/* -------------------------------------------------------------------------- */

async function contarTudo(): Promise<void> {
  secao('Acervo no banco')
  for (const colecao of COLECOES_SEMEADAS) {
    const { totalDocs } = await payload.count({ collection: colecao })
    console.log(`  ${colecao.padEnd(14)} ${String(totalDocs).padStart(3)}`)
  }
}

async function principal(): Promise<void> {
  const inicio = Date.now()
  console.log('\n════════ SEMEANDO A TANIN ════════')

  if (APAGAR_ANTES) await limparConteudo()

  const idDaAutora = await semearAutora()
  await semearUsuario(idDaAutora)

  const taxonomia = await semearTaxonomia()
  const guias = await semearGuias(idDaAutora, taxonomia.tags)
  const vinhos = await semearVinhos(idDaAutora, { ...taxonomia, guias })
  await semearMaterias(idDaAutora, {
    categorias: taxonomia.categorias,
    tags: taxonomia.tags,
    vinhos,
    guias,
  })
  await semearEdicoes()
  await semearEventos()
  await ligarTaxonomiaAosGuias(taxonomia, guias)
  await semearConfiguracoes(idDaAutora)

  secao('Resumo desta execução')
  for (const [colecao, desfechos] of placar) {
    const partes = [
      `${String(desfechos.criado).padStart(3)} criados`,
      `${String(desfechos.atualizado).padStart(3)} atualizados`,
    ]
    if (desfechos.mantido > 0) partes.push(`${desfechos.mantido} mantidos`)
    console.log(`  ${colecao.padEnd(14)} ${partes.join(' · ')}`)
  }

  await contarTudo()

  const segundos = ((Date.now() - inicio) / 1000).toFixed(1)
  console.log(`\n✓ Portal semeado em ${segundos}s. Painel em /admin, entrada ana@tanin.com.br.\n`)
}

/**
 * Liga as uvas e as regiões que têm guia dedicado.
 *
 * Fica no fim porque os guias precisam existir antes, e os dois lados da ligação são
 * escritos por coleções diferentes.
 */
async function ligarTaxonomiaAosGuias(
  taxonomia: { uvas: Indice; regioes: Indice },
  guias: Indice,
): Promise<void> {
  secao('Guias ligados à taxonomia')

  const ligacoes: { colecao: 'uvas' | 'regioes'; item: string; guia: string }[] = [
    { colecao: 'uvas', item: 'malbec', guia: 'malbec-o-que-a-uva-virou' },
    { colecao: 'uvas', item: 'riesling', guia: 'riesling-o-branco-mal-compreendido' },
    { colecao: 'uvas', item: 'ribolla-gialla', guia: 'vinho-natural-organico-biodinamico' },
    { colecao: 'regioes', item: 'douro', guia: 'douro-alem-do-porto' },
    { colecao: 'regioes', item: 'mendoza', guia: 'malbec-o-que-a-uva-virou' },
    { colecao: 'regioes', item: 'champagne', guia: 'espumante-o-metodo-explica-o-preco' },
    { colecao: 'regioes', item: 'serra-gaucha', guia: 'espumante-o-metodo-explica-o-preco' },
    { colecao: 'regioes', item: 'mosel', guia: 'riesling-o-branco-mal-compreendido' },
  ]

  for (const ligacao of ligacoes) {
    const indice = ligacao.colecao === 'uvas' ? taxonomia.uvas : taxonomia.regioes
    const id = indice[ligacao.item]
    const idDoGuia = guias[ligacao.guia]
    if (!id || !idDoGuia) continue

    await payload.update({
      collection: ligacao.colecao,
      id,
      data: { guia: idDoGuia },
      depth: 0,
    })
    console.log(`  → ${ligacao.item} aponta para “${ligacao.guia}”`)
  }
}

await principal()

// O pool do Postgres mantém o processo vivo depois do último await; sem esta saída
// explícita, `pnpm seed` termina o trabalho e nunca devolve o terminal.
process.exit(0)
