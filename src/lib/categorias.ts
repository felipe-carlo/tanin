/**
 * AS EDITORIAS DAS MATÉRIAS
 *
 * Seis editorias fixas, definidas em código em vez de numa coleção do painel.
 * Editoria é decisão editorial estrutural — muda uma vez por ano, não uma vez
 * por semana — e mantê-la aqui elimina uma tela inteira do painel e o risco de
 * uma matéria apontar para uma categoria apagada. O filtro de /materias e os
 * chips dos cartões leem daqui.
 */

export const CATEGORIAS_DE_MATERIA = [
  {
    value: 'reportagem',
    label: 'Reportagem',
    chipCor: 'granada',
    descricao:
      'Apuração de campo: o que está acontecendo nas vinícolas, nas importadoras e na prateleira.',
  },
  {
    value: 'ensaio',
    label: 'Ensaio',
    chipCor: 'ambar',
    descricao: 'Texto de opinião assinada, com tese explícita e argumento que se pode discordar.',
  },
  {
    value: 'entrevista',
    label: 'Entrevista',
    chipCor: 'cereja',
    descricao: 'Conversas com quem produz, importa, serve e estuda vinho no Brasil.',
  },
  {
    value: 'degustacao',
    label: 'Degustação',
    chipCor: 'purpura',
    descricao:
      'Provas comparativas, quase sempre às cegas, com método descrito e resultado publicado por inteiro.',
  },
  {
    value: 'mercado',
    label: 'Mercado',
    chipCor: 'ouro-velho',
    descricao:
      'Preço, imposto, câmbio e distribuição — a parte do vinho que decide o que chega até você.',
  },
  {
    value: 'cultura',
    label: 'Cultura',
    chipCor: 'salmao',
    descricao: 'O vinho como hábito: a mesa, a casa, o restaurante e o que ele diz sobre quem bebe.',
  },
] as const

export type CategoriaDeMateria = (typeof CATEGORIAS_DE_MATERIA)[number]['value']

export const OPCOES_CATEGORIA = CATEGORIAS_DE_MATERIA.map(({ value, label }) => ({ value, label }))

export const categoriaPorValor = (valor?: string | null) =>
  CATEGORIAS_DE_MATERIA.find(({ value }) => value === valor)
