/**
 * Insere blocos JSON-LD na página.
 *
 * JSON-LD é o formato que buscadores e IAs leem para entender *o que* uma página é:
 * um artigo, uma resenha, uma pessoa. O texto visível diz o conteúdo; isto diz a
 * estrutura. Sem ele, um buscador precisa adivinhar — e adivinha mal.
 */
export function JsonLd({ dados }: { dados: (object | null | undefined)[] | object }) {
  const lista = (Array.isArray(dados) ? dados : [dados]).filter(Boolean) as object[]
  if (lista.length === 0) return null

  return (
    <>
      {lista.map((bloco, indice) => (
        <script
          key={indice}
          type="application/ld+json"
          // O conteúdo é montado por nós a partir do banco, nunca vem do leitor.
          // O escape de `<` evita que um texto com HTML feche a tag antes da hora.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(bloco).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  )
}
