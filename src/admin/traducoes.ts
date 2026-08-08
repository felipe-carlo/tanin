/**
 * PORTUGUÊS DO BRASIL PARA O PAINEL
 *
 * O pacote de tradução do Payload só tem um português — e ele veio de Portugal, com
 * sobras de inglês por cima: "Iniciar sessão", "Tem a certeza?", "Log out", "Upload em
 * Massa" e até "Cultura" como tradução de *crop*. Num painel que uma jornalista abre
 * todo dia, é o tipo de detalhe que faz a ferramenta parecer emprestada.
 *
 * Este arquivo sobrescreve, chave a chave, tudo que foi encontrado fora do português
 * do Brasil no bundle `pt` (conferido contra o Payload 3.87). As chaves espelham a
 * estrutura do pacote: `@payloadcms/translations/dist/languages/pt.js`.
 *
 * Anglicismos dicionarizados ficam como estão: SEO, link, site, online, slug, status.
 */
export const traducoesPtBr = {
  pt: {
    authentication: {
      alreadyLoggedIn: 'Você já entrou no painel',
      backToLogin: 'Voltar para a tela de entrada',
      checkYourEmailForPasswordReset:
        'Se o endereço de e-mail estiver associado a uma conta, você receberá em instantes as instruções para redefinir a senha. Confira também a caixa de spam.',
      emailNotValid: 'O e-mail informado não é válido',
      emailOrUsername: 'E-mail ou nome de usuário',
      emailSent: 'E-mail enviado',
      emailVerified: 'E-mail verificado com sucesso.',
      emailAddress: 'E-mail',
      forgotPasswordEmailInstructions:
        'Preencha seu e-mail abaixo. Você receberá uma mensagem com as instruções para criar uma nova senha.',
      forgotPasswordQuestion: 'Esqueceu a senha?',
      logBackIn: 'Entrar de novo',
      loggedIn: 'Para entrar como outra pessoa, primeiro <0>saia</0> da conta atual.',
      loggedOutSuccessfully: 'Você saiu do painel.',
      login: 'Entrar',
      loginAttempts: 'Tentativas de entrada',
      loginUser: 'Entrar',
      loginWithAnotherUser: 'Para entrar como outra pessoa, primeiro <0>saia</0> da conta atual.',
      logOut: 'Sair',
      logout: 'Sair',
      logoutSuccessful: 'Você saiu do painel.',
      newAccountCreated:
        'Uma conta foi criada para você acessar <a href="{{serverURL}}">{{serverURL}}</a>. Clique no link a seguir ou cole o endereço no navegador para verificar seu e-mail: <a href="{{verificationURL}}">{{verificationURL}}</a><br> Depois da verificação, você já consegue entrar.',
      resetPasswordToken: 'Código de redefinição de senha',
      stayLoggedIn: 'Continuar conectado',
      verifyYourEmail: 'Verifique seu e-mail',
      youDidNotRequestPassword:
        'Se você não pediu essa mudança, ignore esta mensagem e sua senha continuará a mesma.',
    },
    error: {
      emailOrPasswordIncorrect: 'E-mail ou senha incorretos.',
      missingEmail: 'Falta o e-mail.',
      noFilesUploaded: 'Nenhum arquivo foi enviado.',
      problemUploadingFile: 'Houve um problema ao enviar o arquivo.',
      tokenInvalidOrExpired: 'Código expirado ou inválido.',
      tokenNotProvided: 'Código não fornecido.',
      userEmailAlreadyRegistered: 'Já existe um usuário com esse e-mail.',
      verificationTokenInvalid: 'Código de verificação inválido.',
    },
    fields: {
      addUpload: 'Adicionar arquivo',
      removeUpload: 'Remover arquivo',
      swapUpload: 'Trocar arquivo',
      uploadNewLabel: 'Enviar novo(a) {{label}}',
    },
    folder: {
      deleteFolder: 'Excluir pasta',
    },
    general: {
      aboutToDeleteCount_many: 'Você está prestes a excluir {{count}} {{label}}',
      aboutToDeleteCount_one: 'Você está prestes a excluir {{count}} {{label}}',
      aboutToDeleteCount_other: 'Você está prestes a excluir {{count}} {{label}}',
      aboutToPermanentlyDelete:
        'Você está prestes a excluir permanentemente o {{label}} <1>{{title}}</1>. Tem certeza?',
      aboutToRestore: 'Você está prestes a restaurar o {{label}} <1>{{title}}</1>. Tem certeza?',
      aboutToRestoreAsDraft:
        'Você está prestes a restaurar o {{label}} <1>{{title}}</1> como rascunho. Tem certeza?',
      aboutToRestoreAsDraftCount: 'Você está prestes a restaurar {{count}} {{label}} como rascunho',
      aboutToTrashCount: 'Você está prestes a mover {{count}} {{label}} para a lixeira',
      createNew: 'Criar',
      deletedSuccessfully: 'Excluído com sucesso.',
      deleteLabel: 'Excluir {{label}}',
      email: 'E-mail',
      emailAddress: 'Endereço de e-mail',
      payloadSettings: 'Configurações do painel',
      showAllLabel: 'Mostrar todos',
      uploading: 'Enviando…',
      uploadingBulk: 'Enviando {{current}} de {{total}}',
    },
    upload: {
      bulkUpload: 'Envio em massa',
      // "Cultura" era tradução automática de *crop* — a colheita, não o recorte.
      crop: 'Recorte',
      fileToUpload: 'Arquivo para enviar',
      filesToUpload: 'Arquivos para enviar',
    },
    validation: {
      emailAddress: 'Insira um endereço de e-mail válido.',
    },
    version: {
      aboutToUnpublishIn:
        'Você está prestes a despublicar este documento em {{locale}}. Tem certeza?',
    },
  },
}
