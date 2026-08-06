import type { Metadata } from 'next'

import { Chip } from '@/components/Chip'
import { EscalaDoVinho } from '@/components/EscalaDoVinho'
import { FichaTecnica } from '@/components/FichaTecnica'
import { FormularioBoletim } from '@/components/FormularioBoletim'
import { Migalhas } from '@/components/Migalhas'
import { Tacas } from '@/components/Tacas'
import { ESCALA_POR_FAMILIA, numeroFaixa } from '@/lib/escala-cores'
import { FAIXAS_DE_NOTA, NOTA_MAXIMA, formatarNota } from '@/lib/nota'

export const metadata: Metadata = {
  title: 'Sistema de design',
  description: 'A régua tipográfica, a paleta e a escala cromática do vinho que sustentam o portal.',
  // Página interna de referência: útil para quem constrói, ruído no índice do Google.
  robots: { index: false, follow: false },
}

function Bloco({
  titulo,
  descricao,
  children,
  id,
}: {
  titulo: string
  descricao?: string
  children: React.ReactNode
  id: string
}) {
  return (
    <section id={id} className="scroll-mt-32 border-t border-tinta pt-8">
      <h2 className="rotulo !font-semibold">{titulo}</h2>
      {descricao && (
        <p className="mt-3 max-w-2xl text-apoio leading-relaxed text-grafite bonito">
          {descricao}
        </p>
      )}
      <div className="mt-8">{children}</div>
    </section>
  )
}

export default function PaginaDeEstilo() {
  return (
    <div className="caixa pt-8 md:pt-10">
      <Migalhas
        trilha={[
          { nome: 'Início', endereco: '/' },
          { nome: 'Sistema de design', endereco: '/estilo' },
        ]}
        className="mb-8"
      />

      <header className="border-b border-tinta pb-12">
        <p className="rotulo text-borra">Referência interna</p>
        <h1
          className="mt-4 text-manchete tracking-[-0.035em] equilibrado"
          style={{ fontVariationSettings: "'SOFT' 24, 'WONK' 1", fontWeight: 500 }}
        >
          O sistema visual da Tanin
        </h1>
        <p className="mt-6 max-w-2xl text-corpo-grande leading-snug text-grafite bonito">
          Revista editorial impressa traduzida para a tela. Preto e branco dominantes,
          vermelho vinho como único acento, fios de 1px no lugar de sombras — e a escala
          cromática do vinho como sistema de organização.
        </p>
      </header>

      <div className="mt-16 space-y-20">
        {/* ---------------------------------------------------------------- */}
        <Bloco
          id="paleta"
          titulo="Paleta"
          descricao="Cinco cores, e só. Escuridão e clareza vêm da tipografia e do espaço, não de sombras."
        >
          <ul className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { nome: 'Tinta', token: '--color-tinta', hex: '#14110F', uso: 'Texto e fios fortes' },
              { nome: 'Papel', token: '--color-papel', hex: '#FAF8F5', uso: 'Fundo, nunca branco puro' },
              { nome: 'Borra', token: '--color-borra', hex: '#6B2130', uso: 'O único acento' },
              { nome: 'Grafite', token: '--color-grafite', hex: '#4A4744', uso: 'Texto secundário' },
              { nome: 'Fio', token: '--color-fio', hex: '#DDD8D0', uso: 'Divisórias de 1px' },
            ].map((cor) => (
              <li key={cor.nome}>
                <span
                  className="block h-20 w-full border border-tinta/10"
                  style={{ backgroundColor: cor.hex }}
                  aria-hidden="true"
                />
                <p className="rotulo mt-3">{cor.nome}</p>
                <p className="mt-1 font-[family-name:var(--font-rotulo)] text-miudo text-grafite">
                  {cor.hex}
                </p>
                <p className="mt-1 text-miudo leading-snug text-grafite">{cor.uso}</p>
              </li>
            ))}
          </ul>
        </Bloco>

        {/* ---------------------------------------------------------------- */}
        <Bloco
          id="escala"
          titulo="A escala cromática do vinho"
          descricao="Quatorze faixas, do quase transparente ao tijolo dos fortificados, agrupadas por família. Cor aqui é dado, não decoração: o chip diz de que vinho a página fala antes de qualquer palavra ser lida."
        >
          <div className="space-y-10">
            {ESCALA_POR_FAMILIA.map((grupo) => (
              <div key={grupo.familia}>
                <h3 className="rotulo border-b border-fio pb-2 text-grafite">{grupo.nome}</h3>
                <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3">
                  {grupo.faixas.map((faixa) => (
                    <li
                      key={faixa.id}
                      className="flex gap-4 border-b border-fio py-4 pr-4 sm:[&:nth-child(odd)]:pr-8 lg:pr-8"
                    >
                      <span
                        aria-hidden="true"
                        className="h-14 w-14 flex-none"
                        style={{ backgroundColor: faixa.hex }}
                      />
                      <div className="min-w-0">
                        <p className="rotulo text-fio-forte">{numeroFaixa(faixa.numero)}</p>
                        <p className="font-[family-name:var(--font-display)] text-t4 leading-snug">
                          {faixa.nome}
                        </p>
                        <p className="mt-1 font-[family-name:var(--font-rotulo)] text-miudo text-grafite">
                          {faixa.hex}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <p className="rotulo mb-4 text-grafite">A régua com uma posição marcada</p>
            <EscalaDoVinho cor="rubi" comLinks={false} />
          </div>
        </Bloco>

        {/* ---------------------------------------------------------------- */}
        <Bloco
          id="tipografia"
          titulo="Tipografia"
          descricao="Fraunces nos títulos, com os eixos SOFT e WONK que dão caráter sem parecer template. Newsreader no texto longo. Archivo em caixa alta para rótulos, datas e números de edição."
        >
          <div className="space-y-10">
            <div className="border-b border-fio pb-8">
              <p className="rotulo text-grafite">Cartaz · Fraunces 300</p>
              <p className="cartaz mt-2">22</p>
            </div>

            <div className="border-b border-fio pb-8">
              <p className="rotulo text-grafite">Manchete · Fraunces 500</p>
              <p
                className="mt-2 text-manchete tracking-[-0.035em]"
                style={{ fontVariationSettings: "'SOFT' 24, 'WONK' 1", fontWeight: 500 }}
              >
                O Champagne que ninguém te contou
              </p>
            </div>

            <div className="border-b border-fio pb-8">
              <p className="rotulo text-grafite">Título 1 · Fraunces 500</p>
              <p
                className="mt-2 text-t1 tracking-[-0.032em]"
                style={{ fontVariationSettings: "'SOFT' 22, 'WONK' 1", fontWeight: 500 }}
              >
                Por que a Borgonha ficou cara
              </p>
            </div>

            <div className="border-b border-fio pb-8">
              <p className="rotulo text-grafite">Título 2 e 3</p>
              <p className="mt-2 text-t2">Um branco para o calor</p>
              <p className="mt-2 text-t3">Quando o rosé vale a pena</p>
            </div>

            <div className="border-b border-fio pb-8">
              <p className="rotulo text-grafite">Corpo · Newsreader</p>
              <div className="prosa capitular mt-3">
                <p>
                  Há uma pergunta que quase ninguém faz na loja, e que decide mais sobre a
                  garrafa do que o país, a uva ou o preço: quando este vinho foi engarrafado
                  para ser bebido? Um Beaujolais de dois anos e um Barolo de dois anos são
                  duas coisas diferentes, e a diferença não está no rótulo — está no que o
                  produtor esperava de você.
                </p>
                <p>
                  A capitular acima só aparece em textos longos. Em nota curta, ela vira
                  enfeite — e enfeite é a primeira coisa que faz um projeto editorial parecer
                  um template.
                </p>
              </div>
            </div>

            <div>
              <p className="rotulo text-grafite">Rótulo · Archivo caixa alta</p>
              <p className="rotulo mt-3">Degustação · 14 de março de 2026 · 7 min de leitura</p>
            </div>
          </div>
        </Bloco>

        {/* ---------------------------------------------------------------- */}
        <Bloco
          id="componentes"
          titulo="Componentes"
          descricao="Tudo separado por fio, nunca por sombra. Se um bloco precisa se destacar, ele ganha espaço — não caixa."
        >
          <div className="grade">
            <div className="col-span-6 lg:col-span-4">
              <p className="rotulo mb-4 text-grafite">Botões</p>
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="botao">
                  Assinar
                </button>
                <button type="button" className="botao botao--vazado">
                  Ver mais
                </button>
              </div>
            </div>

            <div className="col-span-6 lg:col-span-4">
              <p className="rotulo mb-4 text-grafite">Chips</p>
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-2">
                  <Chip cor="palha" /> <span className="rotulo">Palha</span>
                </span>
                <span className="flex items-center gap-2">
                  <Chip cor="rubi" /> <span className="rotulo">Rubi</span>
                </span>
                <span className="flex items-center gap-2">
                  <Chip cor="tawny" /> <span className="rotulo">Tawny</span>
                </span>
              </div>
            </div>

            <div className="col-span-6 lg:col-span-4">
              <p className="rotulo mb-4 text-grafite">Notas</p>
              <div className="space-y-3">
                <Tacas nota={4.5} />
                <Tacas nota={3} />
              </div>
            </div>
          </div>

          <div className="grade mt-12">
            <div className="col-span-6 lg:col-span-5">
              <FichaTecnica
                titulo="Ficha técnica"
                colunas={1}
                itens={[
                  { rotulo: 'Produtor', valor: 'Domaine Exemplo' },
                  { rotulo: 'Região', valor: 'Vale do Loire' },
                  { rotulo: 'Safra', valor: 2021 },
                  { rotulo: 'Uvas', valor: 'Chenin Blanc 100%' },
                  { rotulo: 'Álcool', valor: '12,5%' },
                ]}
              />
            </div>

            <div className="col-span-6 lg:col-span-6 lg:col-start-7">
              <p className="rotulo mb-4 text-grafite">Escala de nota</p>
              <dl>
                {FAIXAS_DE_NOTA.map((faixa) => (
                  <div
                    key={faixa.rotulo}
                    className="flex items-baseline justify-between gap-4 border-b border-fio py-2.5"
                  >
                    <dt className="font-[family-name:var(--font-display)] text-t4">
                      {formatarNota(faixa.minimo)}
                      {faixa.minimo < NOTA_MAXIMA ? '+' : ''}
                    </dt>
                    <dd className="rotulo text-grafite">{faixa.rotulo}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Bloco>

        {/* ---------------------------------------------------------------- */}
        <Bloco
          id="noturno"
          titulo="Bloco noturno"
          descricao="A inversão de cor é o único recurso de ênfase forte do sistema. Usada uma vez por página, no máximo."
        >
          <div className="noturno p-8 md:p-12">
            <p className="rotulo">Semanal, às quintas</p>
            <h3
              className="mt-4 text-t2 tracking-[-0.03em]"
              style={{ fontVariationSettings: "'SOFT' 24, 'WONK' 1", fontWeight: 400 }}
            >
              Boletim Tanin
            </h3>
            <div className="mt-8 max-w-xl">
              <FormularioBoletim origem="estilo" compacto />
            </div>
          </div>
        </Bloco>

        {/* ---------------------------------------------------------------- */}
        <Bloco
          id="grade"
          titulo="A grade editorial"
          descricao="Doze colunas com goteira larga. As composições são assimétricas de propósito: nem tudo precisa estar centralizado nem em três colunas iguais."
        >
          <div className="grade">
            {[
              { classe: 'col-span-6 lg:col-span-7', rotulo: '7 colunas' },
              { classe: 'col-span-6 lg:col-span-4 lg:col-start-9', rotulo: '4 colunas, a partir da 9' },
              { classe: 'col-span-6 lg:col-span-5', rotulo: '5 colunas' },
              { classe: 'col-span-6 lg:col-span-3', rotulo: '3 colunas' },
              { classe: 'col-span-6 lg:col-span-4', rotulo: '4 colunas' },
            ].map((celula) => (
              <div key={celula.rotulo} className={celula.classe}>
                <div className="border border-fio bg-papel-fundo p-4">
                  <p className="rotulo text-grafite">{celula.rotulo}</p>
                </div>
              </div>
            ))}
          </div>
        </Bloco>
      </div>
    </div>
  )
}
