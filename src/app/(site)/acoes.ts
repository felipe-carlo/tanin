'use server'

import { beehiivConfigurado, inscreverNoBeehiiv } from '@/lib/beehiiv'
import { obterPayload } from '@/lib/payload'

export type EstadoInscricao = {
  status: 'ocioso' | 'sucesso' | 'erro'
  mensagem?: string
}

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Inscrição no Boletim.
 *
 * Roda no servidor como Server Action, o que traz três coisas de graça: o formulário
 * funciona mesmo se o JavaScript falhar, a chave do beehiiv nunca sai do servidor, e
 * não existe rota de API para alguém descobrir e abusar.
 *
 * A ordem importa: primeiro guardamos no banco, depois tentamos o beehiiv. Se o
 * beehiiv estiver fora do ar ou sem chave configurada, a pessoa continua inscrita e a
 * sincronização fica pendente no painel — ninguém se perde no caminho.
 */
export async function assinarBoletim(
  _anterior: EstadoInscricao,
  dados: FormData,
): Promise<EstadoInscricao> {
  const email = String(dados.get('email') ?? '').trim().toLowerCase()
  const nome = String(dados.get('nome') ?? '').trim()
  const origem = String(dados.get('origem') ?? 'portal') || 'portal'
  const armadilha = String(dados.get('sobrenome') ?? '')

  // Campo escondido que só um robô preenche.
  if (armadilha) {
    return { status: 'sucesso', mensagem: 'Pronto. Confira sua caixa de entrada.' }
  }

  if (!email || !EMAIL_VALIDO.test(email)) {
    return { status: 'erro', mensagem: 'Confira o e-mail — parece que faltou alguma coisa.' }
  }

  const resposta = beehiivConfigurado()
    ? await inscreverNoBeehiiv(email, { origem })
    : { ok: false, erro: 'beehiiv-nao-configurado' as const }

  try {
    const payload = await obterPayload()
    const existentes = await payload.find({
      collection: 'inscricoes',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })

    const campos = {
      email,
      nome: nome || undefined,
      origem,
      statusBeehiiv: resposta.ok
        ? ('sincronizada' as const)
        : resposta.erro === 'beehiiv-nao-configurado'
          ? ('pendente' as const)
          : ('falhou' as const),
      erroBeehiiv: resposta.ok ? undefined : resposta.erro,
    }

    if (existentes.docs.length > 0) {
      await payload.update({
        collection: 'inscricoes',
        id: existentes.docs[0].id,
        data: campos,
        overrideAccess: true,
      })
    } else {
      await payload.create({ collection: 'inscricoes', data: campos, overrideAccess: true })
    }
  } catch (erro) {
    // Se o banco falhar e o beehiiv tiver aceitado, a inscrição valeu assim mesmo.
    if (!resposta.ok) {
      console.error('[boletim] falha ao guardar inscrição', erro)
      return {
        status: 'erro',
        mensagem: 'Deu algo errado aqui do nosso lado. Tente de novo em um instante.',
      }
    }
  }

  if (!resposta.ok && resposta.erro !== 'beehiiv-nao-configurado') {
    console.error('[boletim] beehiiv recusou a inscrição:', resposta.erro)
  }

  return {
    status: 'sucesso',
    mensagem: 'Pronto. A próxima edição chega no seu e-mail.',
  }
}
