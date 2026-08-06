import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "materias" ADD COLUMN "indice_busca" varchar;
  ALTER TABLE "_materias_v" ADD COLUMN "version_indice_busca" varchar;
  ALTER TABLE "edicoes" ADD COLUMN "indice_busca" varchar;
  ALTER TABLE "_edicoes_v" ADD COLUMN "version_indice_busca" varchar;
  ALTER TABLE "vinhos" ADD COLUMN "indice_busca" varchar;
  ALTER TABLE "_vinhos_v" ADD COLUMN "version_indice_busca" varchar;
  ALTER TABLE "guias" ADD COLUMN "indice_busca" varchar;
  ALTER TABLE "_guias_v" ADD COLUMN "version_indice_busca" varchar;
  CREATE INDEX "materias_indice_busca_idx" ON "materias" USING btree ("indice_busca");
  CREATE INDEX "_materias_v_version_version_indice_busca_idx" ON "_materias_v" USING btree ("version_indice_busca");
  CREATE INDEX "edicoes_indice_busca_idx" ON "edicoes" USING btree ("indice_busca");
  CREATE INDEX "_edicoes_v_version_version_indice_busca_idx" ON "_edicoes_v" USING btree ("version_indice_busca");
  CREATE INDEX "vinhos_indice_busca_idx" ON "vinhos" USING btree ("indice_busca");
  CREATE INDEX "_vinhos_v_version_version_indice_busca_idx" ON "_vinhos_v" USING btree ("version_indice_busca");
  CREATE INDEX "guias_indice_busca_idx" ON "guias" USING btree ("indice_busca");
  CREATE INDEX "_guias_v_version_version_indice_busca_idx" ON "_guias_v" USING btree ("version_indice_busca");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "materias_indice_busca_idx";
  DROP INDEX "_materias_v_version_version_indice_busca_idx";
  DROP INDEX "edicoes_indice_busca_idx";
  DROP INDEX "_edicoes_v_version_version_indice_busca_idx";
  DROP INDEX "vinhos_indice_busca_idx";
  DROP INDEX "_vinhos_v_version_version_indice_busca_idx";
  DROP INDEX "guias_indice_busca_idx";
  DROP INDEX "_guias_v_version_version_indice_busca_idx";
  ALTER TABLE "materias" DROP COLUMN "indice_busca";
  ALTER TABLE "_materias_v" DROP COLUMN "version_indice_busca";
  ALTER TABLE "edicoes" DROP COLUMN "indice_busca";
  ALTER TABLE "_edicoes_v" DROP COLUMN "version_indice_busca";
  ALTER TABLE "vinhos" DROP COLUMN "indice_busca";
  ALTER TABLE "_vinhos_v" DROP COLUMN "version_indice_busca";
  ALTER TABLE "guias" DROP COLUMN "indice_busca";
  ALTER TABLE "_guias_v" DROP COLUMN "version_indice_busca";`)
}
