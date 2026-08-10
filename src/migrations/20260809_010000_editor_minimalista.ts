import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * O EDITOR MINIMALISTA
 *
 * Duas colunas novas em `textos` (e na tabela espelho das versões), as duas preenchidas
 * pelo motor editorial a cada salvamento:
 *
 *   capa_id         a imagem principal, escolhida dentro do próprio texto — é o nó
 *                   `upload` marcado como "principal", ou o primeiro do corpo
 *   palavras_chave  os termos que o texto responde, tirados da frequência do corpo
 *
 * Mais um índice em `url_beehiiv`, que virou a chave de idempotência da importação.
 *
 * ESCRITA À MÃO, DE PROPÓSITO.
 *
 * O `payload migrate:create` geraria também os `DROP COLUMN` de tudo o que saiu do
 * formulário nesta virada — resumo, imagem de destaque, os seis campos de SEO, as
 * perguntas frequentes, editoria, tipo de guia, nível, número da edição, relacionados,
 * a caixa de manchete. Só que esses campos não foram apagados: foram **escondidos**. As
 * seções e as editorias podem voltar, e o dia em que voltarem é tarde demais para
 * descobrir que o conteúdo virou coluna dropada.
 *
 * Coluna anulável que ninguém declara não custa quase nada num Postgres. Perder o
 * conteúdo custa o conteúdo.
 *
 * Aditiva e idempotente: roda sozinha no build da Vercel, contra o banco de produção.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "textos" ADD COLUMN IF NOT EXISTS "capa_id" integer;
  ALTER TABLE "textos" ADD COLUMN IF NOT EXISTS "palavras_chave" varchar;
  ALTER TABLE "_textos_v" ADD COLUMN IF NOT EXISTS "version_capa_id" integer;
  ALTER TABLE "_textos_v" ADD COLUMN IF NOT EXISTS "version_palavras_chave" varchar;

  DO $$ BEGIN
    ALTER TABLE "textos" ADD CONSTRAINT "textos_capa_id_midia_id_fk"
      FOREIGN KEY ("capa_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

  DO $$ BEGIN
    ALTER TABLE "_textos_v" ADD CONSTRAINT "_textos_v_version_capa_id_midia_id_fk"
      FOREIGN KEY ("version_capa_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;

  CREATE INDEX IF NOT EXISTS "textos_capa_idx" ON "textos" USING btree ("capa_id");
  CREATE INDEX IF NOT EXISTS "textos_url_beehiiv_idx" ON "textos" USING btree ("url_beehiiv");
  CREATE INDEX IF NOT EXISTS "_textos_v_version_version_capa_idx" ON "_textos_v" USING btree ("version_capa_id");
  CREATE INDEX IF NOT EXISTS "_textos_v_version_version_url_beehiiv_idx" ON "_textos_v" USING btree ("version_url_beehiiv");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX IF EXISTS "textos_capa_idx";
  DROP INDEX IF EXISTS "textos_url_beehiiv_idx";
  DROP INDEX IF EXISTS "_textos_v_version_version_capa_idx";
  DROP INDEX IF EXISTS "_textos_v_version_version_url_beehiiv_idx";

  ALTER TABLE "textos" DROP CONSTRAINT IF EXISTS "textos_capa_id_midia_id_fk";
  ALTER TABLE "_textos_v" DROP CONSTRAINT IF EXISTS "_textos_v_version_capa_id_midia_id_fk";

  ALTER TABLE "textos" DROP COLUMN IF EXISTS "capa_id";
  ALTER TABLE "textos" DROP COLUMN IF EXISTS "palavras_chave";
  ALTER TABLE "_textos_v" DROP COLUMN IF EXISTS "version_capa_id";
  ALTER TABLE "_textos_v" DROP COLUMN IF EXISTS "version_palavras_chave";`)
}
