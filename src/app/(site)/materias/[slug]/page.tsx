import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

import { BlocoAutor } from '@/components/BlocoAutor'
import { CartaoMateria } from '@/components/CartaoMateria'
import { Chip } from '@/components/Chip'
import { FormularioBoletim } from '@/components/FormularioBoletim'
import { JsonLd } from '@/components/JsonLd'
import { Migalhas } from '@/components/Migalhas'
import { TituloDeSecao } from '@/components/Secao'
import { TextoRico } from '@/components/TextoRico'
import { dataPorExtenso, iso } from '@/lib/formatar'
import { montarMetadados } from '@/lib/metadados'
import { obterPayload } from '@/lib/payload'
import { listarTextos, obterTexto } from '@/lib/consultas'
import { schemaDaMateria, schemaDeMigalhas } from '@/lib/schema'
import { autoraDe, obterConfiguracoes } from '@/lib/site'
import { resumoOuTrecho } from '@/lib/texto'

export const revalidate = 3600
export const dynamicParams = true

/** Gera as páginas de antemão: quem chega do Instagram recebe HTML pronto. */
export async function generateStaticParams() {
  try {
    const payload = await obterPayload()
    const textos = await payload.find({
      collection: 'textos',
      where: { _status: { equals: 'published' } },
      limit: 500,
      depth: 0,
      select: { slug: true },
      overrideAccess: false,
    })
    return textos.docs.filter((texto) => texto.slug).map((texto) => ({ slug: texto.slug! }))
  } catch {
    return []
  }
}

type Props = { params: Promise<{ slug: string }> }

/**
 * Os metadados saem inteiros do que foi escrito.
 *
 * Não há campo de SEO nesta publicação. `montarMetadados` já sabe cair no conteúdo da
 * página quando não recebe um grupo `seo` — era o comportamento de reserva, e virou o
 * único. A descrição é o resumo derivado do primeiro parágrafo; a imagem de
 * compartilhamento é a que foi marcada como principal dentro do texto.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const [texto, config] = await Promise.all([obterTexto(slug), obterConfiguracoes()])
  if (!texto) return { title: 'Texto não encontrado' }

  const autora = autoraDe(config)

  return montarMetadados({
    titulo: texto.titulo,
    descricao: resumoOuTrecho(texto),
    imagem: texto.capa,
    caminho: `/materias/${texto.slug}`,
    publicadoEm: texto.dataPublicacao,
    atualizadoEm: texto.dataAtualizacao ?? texto.updatedAt,
    autores: autora.nome ? [autora.nome] : undefined,
    tags: texto.palavrasChave
      ? texto.palavrasChave.split(',').map((termo) => termo.trim()).filter(Boolean)
      : undefined,
  })
}

export default async function PaginaDoTexto({ params }: Props) {
  const { slug } = await params
  const [texto, config] = await Promise.all([obterTexto(slug), obterConfiguracoes()])
  if (!texto) notFound()

  const autora = autoraDe(config)

  // Sem "leia também" escolhido à mão: os três mais recentes, que é o que uma
  // publicação semanal tem de mais útil a oferecer a quem acabou de chegar ao fim.
  const relacionados = (await listarTextos({ limite: 3, excluirIds: [texto.id] })).docs

  const dataDeEstreia = texto.dataPublicacao ?? texto.createdAt
  const foiAtualizado =
    texto.dataAtualizacao &&
    new Date(texto.dataAtualizacao).getTime() - new Date(dataDeEstreia).getTime() > 86_400_000

  const trilha = [
    { nome: 'Início', endereco: '/' },
    { nome: 'Textos', endereco: '/materias' },
    { nome: texto.titulo, endereco: `/materias/${texto.slug}` },
  ]

  // A capitular só entra em texto longo — três minutos são cerca de 600 palavras.
  // Em nota curta ela vira enfeite, que é a primeira coisa a fazer um projeto
  // editorial parecer template.
  const textoLongo = (texto.tempoLeitura ?? 0) >= 3

  return (
    <>
      <article className="caixa pt-8 md:pt-10">
        <Migalhas trilha={trilha} className="mb-8" />

        {/*
          A abertura virou uma coluna só, centrada.
          O trilho da direita existia para o resumo, os vinhos citados e os guias
          relacionados — três coisas que saíram junto com os campos que as alimentavam.
          Uma coluna vazia ao lado do título não é respiro, é falta.
        */}
        <header className="mx-auto max-w-3xl border-b border-tinta pb-10 md:pb-14">
          <p className="rotulo flex flex-wrap items-center gap-x-3 gap-y-1 text-borra">
            <Chip cor={texto.chipCor} tamanho="pequeno" />
            <time dateTime={iso(dataDeEstreia)} className="text-grafite">
              {dataPorExtenso(dataDeEstreia)}
            </time>
          </p>

          <h1
            className="mt-4 text-t1 tracking-[-0.032em] equilibrado"
            style={{ fontVariationSettings: "'SOFT' 22, 'WONK' 1", fontWeight: 500 }}
          >
            {texto.titulo}
          </h1>

          {texto.subtitulo && (
            <p className="mt-5 text-corpo-grande leading-snug text-grafite bonito">
              {texto.subtitulo}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2">
            {autora.nome && <p className="rotulo">Por {autora.nome}</p>}
            {texto.tempoLeitura ? (
              <>
                <span aria-hidden="true" className="rotulo text-tenue">
                  ·
                </span>
                <p className="rotulo text-grafite">{texto.tempoLeitura} min de leitura</p>
              </>
            ) : null}
          </div>

          {foiAtualizado && (
            <p className="rotulo mt-2 text-grafite">
              Atualizado em{' '}
              <time dateTime={iso(texto.dataAtualizacao)}>
                {dataPorExtenso(texto.dataAtualizacao)}
              </time>
            </p>
          )}
        </header>

        {/*
          Nenhuma imagem de capa é repetida aqui em cima.
          A imagem principal serve ao cartão, ao Google e ao WhatsApp; dentro da página
          ela aparece exatamente onde foi colocada no texto. Mostrá-la duas vezes seria
          desfazer a única decisão visual que o editor pede a quem escreve.
        */}
        <div className="mx-auto mt-12 max-w-3xl md:mt-16">
          <TextoRico dados={texto.corpo} capitular={textoLongo} />
          <BlocoAutor autor={autora} />
        </div>
      </article>

      {relacionados.length > 0 && (
        <section className="caixa mt-20">
          <TituloDeSecao acao="Todos os textos" enderecoAcao="/materias">
            Leia também
          </TituloDeSecao>
          <div className="grade">
            {relacionados.map((outro) => (
              <div key={outro.id} className="col-span-6 lg:col-span-4">
                <CartaoMateria conteudo={outro} tamanho="pequeno" />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="noturno mt-20" id="assinar">
        <div className="caixa py-14 md:py-20">
          <div className="grade items-start">
            <div className="col-span-6 lg:col-span-5">
              <h2
                className="text-t2 tracking-[-0.03em] equilibrado"
                style={{ fontVariationSettings: "'SOFT' 24, 'WONK' 1", fontWeight: 400 }}
              >
                Gostou? O próximo chega por e-mail.
              </h2>
            </div>
            <div className="col-span-6 lg:col-span-6 lg:col-start-7">
              <FormularioBoletim origem={`texto:${texto.slug}`} compacto />
            </div>
          </div>
        </div>
      </section>

      <JsonLd dados={[schemaDaMateria(texto, autora), schemaDeMigalhas(trilha)]} />
    </>
  )
}
