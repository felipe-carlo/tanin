import type { Field } from 'payload'

/**
 * ÍNDICE DE BUSCA SEM ACENTO
 *
 * Em português, quem digita rápido no celular escreve "regiao", "sao paulo", "champanhe".
 * Uma busca que exige o acento exato devolve zero resultado para metade das pessoas — e
 * quem procurou uma vez e não achou nada não procura de novo.
 *
 * A solução é guardar, junto de cada documento, uma cópia do texto pesquisável já em
 * caixa baixa e sem acento. A consulta faz a mesma normalização no que a pessoa digitou,
 * e os dois lados se encontram.
 *
 * Por que não a extensão `unaccent` do Postgres: ela exige um `CREATE EXTENSION` que nem
 * todo banco hospedado permite sem intervenção manual. Um campo comum funciona em
 * qualquer Postgres, hoje e daqui a cinco anos.
 */

/** "Região do Douro" → "regiao do douro". */
export const normalizarParaBusca = (texto: string): string =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

/** Junta os campos pesquisáveis de um documento numa linha só, já normalizada. */
export const montarIndiceBusca = (partes: (string | number | null | undefined)[]): string =>
  normalizarParaBusca(partes.filter(Boolean).join(' ')).slice(0, 4000)

/**
 * O campo em si. Fica escondido do painel de propósito: é máquina falando com máquina,
 * e mostrá-lo só criaria a dúvida "preciso preencher isto?".
 */
export const campoIndiceBusca: Field = {
  name: 'indiceBusca',
  type: 'text',
  index: true,
  admin: { hidden: true, disableBulkEdit: true },
}
