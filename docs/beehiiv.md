# Trazer o Boletim do beehiiv para o portal

Este documento é para quem vai tocar a migração — não é preciso saber programar.
Ele cobre quatro coisas: pegar as chaves do beehiiv, rodar a importação, revisar o
que chegou e decidir o que fazer com os endereços antigos.

Leia na ordem. Cada passo leva alguns minutos.

---

## 1. As duas chaves do beehiiv

O portal precisa de duas informações para conversar com o beehiiv:

- **a chave de API** — a senha que autoriza o portal a ler as edições;
- **o ID da publicação** — o número de identidade do Boletim Tanin lá dentro.
  Começa sempre com `pub_`.

### Onde pegar

1. Entre no beehiiv com a conta que administra a publicação.
2. Abra **Settings** (a engrenagem, no canto de baixo à esquerda).
3. Vá em **Integrations → API**.
4. Clique em **New API Key**, dê um nome que você reconheça depois — por exemplo
   `portal-tanin` — e confirme.
5. **Copie a chave na hora.** O beehiiv mostra a chave uma única vez; se fechar a
   janela sem copiar, é só apagar e criar outra.
6. Na mesma tela aparece o **Publication ID**, começando com `pub_`. Copie também.

> Os nomes dos menus do beehiiv mudam de tempos em tempos. Se "Integrations" não
> estiver onde o texto diz, procure por "API" na busca do painel de configurações.
> [A VERIFICAR: conferir os nomes exatos das telas no dia da migração.]

### Onde colar

Na raiz do projeto existe um arquivo chamado `.env`. Abra com qualquer editor de
texto e acrescente duas linhas:

```
BEEHIIV_API_KEY=cole-a-chave-aqui
BEEHIIV_PUBLICATION_ID=pub_cole-o-id-aqui
```

Salve e feche. Esse arquivo nunca vai para o GitHub — é o cofre local do projeto.
A chave de API é uma senha: não mande por WhatsApp, não cole em e-mail, não deixe
em documento compartilhado.

---

## 2. Se o plano atual não tiver API

O acesso à API do beehiiv é do **plano Scale**. Nos planos abaixo dele o botão de
criar chave simplesmente não aparece.

> [A VERIFICAR: confirmar em qual plano a Tanin está hoje, **antes** de marcar a
> data da migração. Se não for Scale, decidir entre subir de plano por um mês —
> tempo suficiente para importar tudo — ou seguir pelo caminho manual abaixo.]

**Caminho A — assinar o Scale por um mês.** É o mais rápido e o mais fiel: a
importação traz todas as edições com data, título, texto e link original corretos.
Feita a importação, o plano pode voltar ao que era; o portal não depende da API para
funcionar no dia a dia.

**Caminho B — trazer as edições à mão.** Funciona, dá trabalho e só compensa se o
arquivo for pequeno (até umas 15 edições):

1. Abra o feed RSS público da publicação — é o endereço que termina em `/feed`.
   Ele costuma trazer o texto completo das edições mais recentes.
   [A VERIFICAR: quantas edições o feed da Tanin devolve.]
2. Para o que não estiver no feed, abra cada edição no site do beehiiv, selecione o
   texto e copie.
3. No painel do portal (`/admin`), vá em **Boletim Tanin → Criar nova** e cole.
   Preencha à mão: número da edição (1 é a mais antiga), título, data de envio,
   resumo e o endereço original no campo "Endereço original no beehiiv".
4. Salve como rascunho e publique depois de revisar, exatamente como no caminho A.

---

## 3. Rodar a importação

Os comandos abaixo são digitados no terminal, dentro da pasta do projeto. Rode um
de cada vez, na ordem.

**Primeiro, um ensaio.** Não grava nada; só mostra o que aconteceria:

```
pnpm importar:beehiiv --seco
```

Leia a lista que aparece. Confira se o número de edições bate com o que existe no
beehiiv e se as datas fazem sentido (a edição 01 tem que ser a mais antiga).

**Depois, um teste pequeno.** Importa só as três edições mais antigas:

```
pnpm importar:beehiiv --limite=3
```

Abra `/admin`, entre em **Boletim Tanin** e olhe as três. Se estiverem boas, siga.

**Por fim, tudo:**

```
pnpm importar:beehiiv
```

Pode rodar quantas vezes quiser: a importação reconhece o que já trouxe e atualiza
em vez de duplicar. Se algo der errado no meio, é só rodar de novo.

**Se o número já estiver ocupado.** A importação numera as edições pela data — 1 é a
mais antiga. Quando um desses números já pertence a uma edição que *não* veio do
beehiiv (escrita à mão pelo painel, por exemplo), ela é pulada, nada é alterado, e o
aviso no fim diz qual edição está no caminho. É de propósito: apagar por cima do que
alguém escreveu seria pior do que parar. Para resolver, abra a edição citada no painel
e mude o número dela — ou apague, se for a mesma edição em duplicidade — e rode de
novo. **É por isso que os dois caminhos da seção 2 não se misturam:** ou a importação
traz tudo, ou as edições entram à mão. Fazer metade de cada um dá trabalho dobrado.

**Um aviso importante:** "atualiza" quer dizer que o texto vindo do beehiiv volta a
sobrescrever o que estiver na edição. Rode quantas vezes precisar **antes** de
começar a revisar; depois que a revisão começou, não rode mais — o trabalho de
revisão seria desfeito.

Para lembrar as opções: `pnpm importar:beehiiv --ajuda`.

### Por que entra tudo como rascunho

Porque tradução de texto entre dois sistemas nunca é perfeita, e o que sai errado
sai errado em público. Como rascunho, a edição fica visível só no painel: ninguém no
site vê, o Google não indexa, e nada quebra enquanto a revisão acontece. Publicar é
um clique — despublicar depois de o link ter circulado é bem mais chato.

Existe uma opção `--publicar`, que grava tudo já publicado. Use apenas se você já
revisou o conteúdo por outro caminho e sabe o que está fazendo.

---

## 4. O que revisar em cada edição, antes de publicar

Abra a edição no painel e passe por esta lista. Leva dois ou três minutos por
edição — e é o que separa um arquivo bonito de um arquivo remendado.

1. **Imagens.** A importação não baixa imagem nenhuma, de propósito. Onde havia uma
   foto, ficou uma marca em itálico assim:
   `[imagem do beehiiv — a garrafa: https://media.beehiiv.com/...]`.
   Abra o endereço, salve a imagem, suba pelo painel no lugar certo (com legenda e
   crédito) e apague a marca. Se a imagem não valer a pena, apague só a marca.
2. **Vídeos e conteúdo incorporado.** Vídeo do YouTube, player do Spotify e post do
   Instagram somem na importação — o aviso no fim da execução avisa quando isso
   aconteceu. Recoloque o link à mão onde fizer falta.
3. **Tabelas.** Também são descartadas, com aviso. Newsletter usa tabela para
   diagramar, e isso não é conteúdo; mas se alguma tabela tinha informação de
   verdade, remonte como lista.
4. **Resumo.** O campo "Resumo" é o trecho que o Google e as IAs citam. A importação
   preenche com o texto de prévia do beehiiv ou com as primeiras linhas da edição.
   Reescreva para que faça sentido sozinho, fora da página, em 40 a 60 palavras.
5. **Título e subtítulo.** Títulos de e-mail costumam ter emoji, "edição #12" e
   chamadas de assunto. No portal isso vira ruído: limpe.
6. **Blocos e âncoras.** A aba "Blocos e âncoras" foi preenchida com os subtítulos
   internos da edição, e vira o índice lateral da página. Apague os que não forem
   trechos de verdade.
7. **Links.** Confira dois ou três: links de rastreamento do beehiiv (com `utm_` no
   fim) continuam funcionando, mas ficam feios. Se o link aponta para uma matéria
   que hoje existe no portal, troque pelo endereço interno.
8. **Cor da edição.** Cada edição recebe automaticamente uma faixa da escala
   cromática, seguindo a numeração. Se a edição fala de um vinho específico, vale
   escolher a cor à mão no campo "Chip de cor".

Revisado, clique em **Publicar**.

---

## 5. Decisão pendente: o que fazer com os endereços antigos

> [DECISÃO PENDENTE — do dono do projeto. Precisa ser tomada antes de publicar as
> edições importadas, porque as duas opções levam a caminhos diferentes.]

Depois da migração, cada edição vai existir em dois lugares: no beehiiv, no endereço
antigo, e no portal, no endereço novo. Isso precisa de uma decisão, porque duas
páginas com o mesmo texto competem entre si no Google — e quando o buscador não sabe
qual é a oficial, ele escolhe sozinho, às vezes errado.

**Opção 1 — manter as páginas antigas no ar, apontando para o portal (RECOMENDADO).**

Existe uma etiqueta invisível chamada *canonical*. Ela é um bilhete da página antiga
para o Google dizendo: *"o texto é meu, mas a versão oficial mora ali"*. Com ela, todo
o crédito que a página antiga acumulou — cada link que alguém já publicou apontando
para lá, cada compartilhamento — passa a contar para o portal. Quem clicar num link
velho continua lendo a edição, e nada quebra.

É a opção recomendada porque preserva o que já foi construído. Autoridade de link
leva anos para nascer e some numa tarde se as páginas saírem do ar.

Como fazer, no beehiiv: abra a edição, entre nas configurações do post e procure o
campo de **Canonical URL** (fica na parte de SEO). Cole o endereço da edição no
portal — por exemplo `https://tanin.com.br/boletim/nome-da-edicao` — e salve. Repita
para cada edição. É chato, é repetitivo, é uma tarde de trabalho, e vale a pena.
[A VERIFICAR: confirmar que o plano atual da Tanin expõe o campo de canonical por
post. Se não expuser, a alternativa é manter as páginas no ar como estão e aceitar
que o Google decida — o que ainda é melhor do que apagá-las.]

**Opção 2 — despublicar as páginas antigas.**

Some a duplicidade de uma vez. Em compensação, todo link já publicado por aí vira
uma página de erro, e o crédito acumulado se perde. Só faz sentido se o arquivo do
beehiiv for pequeno e praticamente ninguém apontar para ele.

*Meio-termo, se a Opção 1 for inviável:* despublicar apenas as edições antigas que
ninguém acessa e manter as poucas que recebem visita, com canonical.

---

## 6. Como fica o dia a dia depois disso

O portal passa a ser a casa do conteúdo. O beehiiv continua sendo o carteiro.

1. A Ana escreve a edição no painel do portal, em **Boletim Tanin**, e publica.
2. No beehiiv, ela cria o disparo do e-mail com o começo do texto e um link
   "continuar lendo" apontando para a edição no portal.
3. Quem se inscreve pelo formulário do site entra direto na lista do beehiiv. Se a
   chave de API não estiver configurada, a inscrição fica guardada no painel, em
   **Inscrições no Boletim**, para ser sincronizada depois — ninguém se perde.

Ou seja: texto no portal, envio pelo beehiiv, lista no beehiiv. Cada ferramenta faz
o que faz bem, e o arquivo do Boletim deixa de morar numa plataforma alugada.
