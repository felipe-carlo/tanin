import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * LIMPEZA DA VIRADA DE MODELO — uso único
 *
 * O portal foi reestruturado de catorze coleções para cinco: Matérias, Boletim e Guias
 * viraram a coleção única `textos`, e Autores, Categorias, Tags, Uvas, Regiões,
 * Importadoras e Eventos deixaram de existir. O banco de produção, porém, ainda tem o
 * esquema antigo, e os dois se sobrepõem: vinte e oito tabelas e dezesseis tipos enum
 * têm exatamente o mesmo nome nos dois modelos (`vinhos`, `midia`, `usuarios`,
 * `configuracoes`, `enum_vinhos_tipo`, `enum_usuarios_papel`…).
 *
 * Sem esta limpeza, a migração inicial do modelo novo pararia no primeiro `CREATE TYPE`
 * e o deploy inteiro falharia. Ela roda antes daquela — o carimbo de hora no nome do
 * arquivo é anterior de propósito — e derruba o que houver pela frente.
 *
 * Duas observações sobre o que ela NÃO faz:
 *
 *  - Preserva `payload_migrations`, que é o histórico de migrações do próprio Payload.
 *    Apagá-la faria o Payload perder a conta do que já rodou — e, pior, o Payload grava
 *    o registro de cada migração logo depois do `up()`, na mesma transação: sem a
 *    tabela de pé naquele instante, esta própria migração falharia ao ser anotada.
 *    Pelo mesmo motivo ela é criada aqui caso ainda não exista, o que acontece num
 *    banco virgem, onde esta limpeza é a primeira coisa a rodar.
 *  - Num banco já limpo (uma instalação nova, o ambiente de desenvolvimento) ela não
 *    encontra nada para derrubar e não faz nada. É segura de rodar em qualquer lugar,
 *    e roda uma vez só em cada banco.
 *
 * Os tipos enum precisam de um laço próprio: derrubar uma tabela não derruba o tipo que
 * as colunas dela usavam, e é justamente aí que a colisão apareceria.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    DECLARE
      alvo record;
    BEGIN
      FOR alvo IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename <> 'payload_migrations'
      LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(alvo.tablename) || ' CASCADE';
      END LOOP;

      FOR alvo IN
        SELECT t.typname
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
          AND t.typtype = 'e'
      LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(alvo.typname) || ' CASCADE';
      END LOOP;
    END $$;

    CREATE TABLE IF NOT EXISTS "payload_migrations" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar,
      "batch" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  `)
}

/**
 * Não há volta.
 *
 * Desfazer esta migração significaria reconstruir um modelo de dados que foi
 * deliberadamente aposentado — e cujo conteúdo já não existe. Voltar atrás se faz
 * restaurando um backup do banco, não rodando um `down`.
 */
export async function down({}: MigrateDownArgs): Promise<void> {
  // Intencionalmente vazia.
}
