import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_materias_chip_cor" AS ENUM('verde-palha', 'palha', 'ouro', 'ouro-velho', 'ambar', 'laranja', 'rosa-palido', 'salmao', 'cobre', 'cereja', 'rubi', 'purpura', 'granada', 'tawny');
  CREATE TYPE "public"."enum_materias_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__materias_v_version_chip_cor" AS ENUM('verde-palha', 'palha', 'ouro', 'ouro-velho', 'ambar', 'laranja', 'rosa-palido', 'salmao', 'cobre', 'cereja', 'rubi', 'purpura', 'granada', 'tawny');
  CREATE TYPE "public"."enum__materias_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_edicoes_chip_cor" AS ENUM('verde-palha', 'palha', 'ouro', 'ouro-velho', 'ambar', 'laranja', 'rosa-palido', 'salmao', 'cobre', 'cereja', 'rubi', 'purpura', 'granada', 'tawny');
  CREATE TYPE "public"."enum_edicoes_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__edicoes_v_version_chip_cor" AS ENUM('verde-palha', 'palha', 'ouro', 'ouro-velho', 'ambar', 'laranja', 'rosa-palido', 'salmao', 'cobre', 'cereja', 'rubi', 'purpura', 'granada', 'tawny');
  CREATE TYPE "public"."enum__edicoes_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_vinhos_tipo" AS ENUM('tinto', 'branco', 'rose', 'espumante', 'laranja', 'fortificado');
  CREATE TYPE "public"."enum_vinhos_corpo" AS ENUM('leve', 'medio', 'encorpado');
  CREATE TYPE "public"."enum_vinhos_cor_na_escala" AS ENUM('verde-palha', 'palha', 'ouro', 'ouro-velho', 'ambar', 'laranja', 'rosa-palido', 'salmao', 'cobre', 'cereja', 'rubi', 'purpura', 'granada', 'tawny');
  CREATE TYPE "public"."enum_vinhos_faixa_preco" AS ENUM('ate-80', '80-150', '150-250', '250-400', '400-700', 'acima-700');
  CREATE TYPE "public"."enum_vinhos_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__vinhos_v_version_tipo" AS ENUM('tinto', 'branco', 'rose', 'espumante', 'laranja', 'fortificado');
  CREATE TYPE "public"."enum__vinhos_v_version_corpo" AS ENUM('leve', 'medio', 'encorpado');
  CREATE TYPE "public"."enum__vinhos_v_version_cor_na_escala" AS ENUM('verde-palha', 'palha', 'ouro', 'ouro-velho', 'ambar', 'laranja', 'rosa-palido', 'salmao', 'cobre', 'cereja', 'rubi', 'purpura', 'granada', 'tawny');
  CREATE TYPE "public"."enum__vinhos_v_version_faixa_preco" AS ENUM('ate-80', '80-150', '150-250', '250-400', '400-700', 'acima-700');
  CREATE TYPE "public"."enum__vinhos_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_guias_tipo_guia" AS ENUM('uva', 'regiao', 'harmonizacao', 'servico', 'compra', 'tecnico');
  CREATE TYPE "public"."enum_guias_nivel" AS ENUM('iniciante', 'intermediario');
  CREATE TYPE "public"."enum_guias_chip_cor" AS ENUM('verde-palha', 'palha', 'ouro', 'ouro-velho', 'ambar', 'laranja', 'rosa-palido', 'salmao', 'cobre', 'cereja', 'rubi', 'purpura', 'granada', 'tawny');
  CREATE TYPE "public"."enum_guias_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__guias_v_version_tipo_guia" AS ENUM('uva', 'regiao', 'harmonizacao', 'servico', 'compra', 'tecnico');
  CREATE TYPE "public"."enum__guias_v_version_nivel" AS ENUM('iniciante', 'intermediario');
  CREATE TYPE "public"."enum__guias_v_version_chip_cor" AS ENUM('verde-palha', 'palha', 'ouro', 'ouro-velho', 'ambar', 'laranja', 'rosa-palido', 'salmao', 'cobre', 'cereja', 'rubi', 'purpura', 'granada', 'tawny');
  CREATE TYPE "public"."enum__guias_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_eventos_tipo" AS ENUM('degustacao', 'feira', 'jantar', 'curso', 'lancamento', 'online');
  CREATE TYPE "public"."enum_eventos_chip_cor" AS ENUM('verde-palha', 'palha', 'ouro', 'ouro-velho', 'ambar', 'laranja', 'rosa-palido', 'salmao', 'cobre', 'cereja', 'rubi', 'purpura', 'granada', 'tawny');
  CREATE TYPE "public"."enum_eventos_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__eventos_v_version_tipo" AS ENUM('degustacao', 'feira', 'jantar', 'curso', 'lancamento', 'online');
  CREATE TYPE "public"."enum__eventos_v_version_chip_cor" AS ENUM('verde-palha', 'palha', 'ouro', 'ouro-velho', 'ambar', 'laranja', 'rosa-palido', 'salmao', 'cobre', 'cereja', 'rubi', 'purpura', 'granada', 'tawny');
  CREATE TYPE "public"."enum__eventos_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_autores_redes_rede" AS ENUM('instagram', 'linkedin', 'youtube', 'x', 'tiktok', 'site', 'outro');
  CREATE TYPE "public"."enum_categorias_chip_cor" AS ENUM('verde-palha', 'palha', 'ouro', 'ouro-velho', 'ambar', 'laranja', 'rosa-palido', 'salmao', 'cobre', 'cereja', 'rubi', 'purpura', 'granada', 'tawny');
  CREATE TYPE "public"."enum_uvas_cor" AS ENUM('tinta', 'branca');
  CREATE TYPE "public"."enum_inscricoes_status_beehiiv" AS ENUM('sincronizada', 'pendente', 'falhou');
  CREATE TYPE "public"."enum_usuarios_papel" AS ENUM('administrador', 'editor');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_configuracoes_redes_rede" AS ENUM('instagram', 'youtube', 'linkedin', 'tiktok', 'x');
  CREATE TABLE "materias_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pergunta" varchar,
  	"resposta" varchar
  );
  
  CREATE TABLE "materias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"subtitulo" varchar,
  	"resumo" varchar,
  	"destaque_imagem_id" integer,
  	"destaque_credito" varchar,
  	"destaque_legenda" varchar,
  	"corpo" jsonb,
  	"seo_titulo" varchar,
  	"seo_descricao" varchar,
  	"seo_imagem_id" integer,
  	"seo_palavras_chave" varchar,
  	"seo_nao_indexar" boolean DEFAULT false,
  	"seo_canonica" varchar,
  	"slug" varchar,
  	"autor_id" integer,
  	"categoria_id" integer,
  	"chip_cor" "enum_materias_chip_cor" DEFAULT 'rubi',
  	"data_publicacao" timestamp(3) with time zone,
  	"data_atualizacao" timestamp(3) with time zone,
  	"destaque_home" boolean DEFAULT false,
  	"tempo_leitura" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_materias_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "materias_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"vinhos_id" integer,
  	"materias_id" integer,
  	"guias_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "_materias_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"pergunta" varchar,
  	"resposta" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_materias_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_titulo" varchar,
  	"version_subtitulo" varchar,
  	"version_resumo" varchar,
  	"version_destaque_imagem_id" integer,
  	"version_destaque_credito" varchar,
  	"version_destaque_legenda" varchar,
  	"version_corpo" jsonb,
  	"version_seo_titulo" varchar,
  	"version_seo_descricao" varchar,
  	"version_seo_imagem_id" integer,
  	"version_seo_palavras_chave" varchar,
  	"version_seo_nao_indexar" boolean DEFAULT false,
  	"version_seo_canonica" varchar,
  	"version_slug" varchar,
  	"version_autor_id" integer,
  	"version_categoria_id" integer,
  	"version_chip_cor" "enum__materias_v_version_chip_cor" DEFAULT 'rubi',
  	"version_data_publicacao" timestamp(3) with time zone,
  	"version_data_atualizacao" timestamp(3) with time zone,
  	"version_destaque_home" boolean DEFAULT false,
  	"version_tempo_leitura" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__materias_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_materias_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"vinhos_id" integer,
  	"materias_id" integer,
  	"guias_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "edicoes_blocos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"ancora" varchar,
  	"resumo" varchar
  );
  
  CREATE TABLE "edicoes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"subtitulo" varchar,
  	"resumo" varchar,
  	"destaque_imagem_id" integer,
  	"destaque_credito" varchar,
  	"destaque_legenda" varchar,
  	"corpo" jsonb,
  	"seo_titulo" varchar,
  	"seo_descricao" varchar,
  	"seo_imagem_id" integer,
  	"seo_palavras_chave" varchar,
  	"seo_nao_indexar" boolean DEFAULT false,
  	"seo_canonica" varchar,
  	"numero" numeric,
  	"slug" varchar,
  	"data_envio" timestamp(3) with time zone,
  	"data_publicacao" timestamp(3) with time zone,
  	"chip_cor" "enum_edicoes_chip_cor" DEFAULT 'rubi',
  	"url_beehiiv" varchar,
  	"importada_em" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_edicoes_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_edicoes_v_version_blocos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"ancora" varchar,
  	"resumo" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_edicoes_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_titulo" varchar,
  	"version_subtitulo" varchar,
  	"version_resumo" varchar,
  	"version_destaque_imagem_id" integer,
  	"version_destaque_credito" varchar,
  	"version_destaque_legenda" varchar,
  	"version_corpo" jsonb,
  	"version_seo_titulo" varchar,
  	"version_seo_descricao" varchar,
  	"version_seo_imagem_id" integer,
  	"version_seo_palavras_chave" varchar,
  	"version_seo_nao_indexar" boolean DEFAULT false,
  	"version_seo_canonica" varchar,
  	"version_numero" numeric,
  	"version_slug" varchar,
  	"version_data_envio" timestamp(3) with time zone,
  	"version_data_publicacao" timestamp(3) with time zone,
  	"version_chip_cor" "enum__edicoes_v_version_chip_cor" DEFAULT 'rubi',
  	"version_url_beehiiv" varchar,
  	"version_importada_em" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__edicoes_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "vinhos_uvas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"uva_id" integer,
  	"percentual" numeric
  );
  
  CREATE TABLE "vinhos_harmonizacoes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"prato" varchar,
  	"observacao" varchar
  );
  
  CREATE TABLE "vinhos_onde_comprar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"loja" varchar,
  	"url" varchar,
  	"afiliado" boolean DEFAULT false
  );
  
  CREATE TABLE "vinhos_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pergunta" varchar,
  	"resposta" varchar
  );
  
  CREATE TABLE "vinhos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"produtor" varchar,
  	"pais" varchar,
  	"regiao_id" integer,
  	"sub_regiao" varchar,
  	"safra" numeric,
  	"tipo" "enum_vinhos_tipo",
  	"corpo" "enum_vinhos_corpo",
  	"teor_alcoolico" numeric,
  	"cor_na_escala" "enum_vinhos_cor_na_escala",
  	"destaque_imagem_id" integer,
  	"destaque_credito" varchar,
  	"destaque_legenda" varchar,
  	"nota" numeric,
  	"veredito" varchar,
  	"notas_degustacao" jsonb,
  	"temperatura_servico" varchar,
  	"potencial_guarda" varchar,
  	"taca_recomendada" varchar,
  	"decantacao" varchar,
  	"faixa_preco" "enum_vinhos_faixa_preco",
  	"data_preco" timestamp(3) with time zone,
  	"importadora_id" integer,
  	"seo_titulo" varchar,
  	"seo_descricao" varchar,
  	"seo_imagem_id" integer,
  	"seo_palavras_chave" varchar,
  	"seo_nao_indexar" boolean DEFAULT false,
  	"seo_canonica" varchar,
  	"slug" varchar,
  	"autor_id" integer,
  	"data_publicacao" timestamp(3) with time zone,
  	"data_atualizacao" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_vinhos_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "vinhos_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"materias_id" integer,
  	"vinhos_id" integer,
  	"guias_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "_vinhos_v_version_uvas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"uva_id" integer,
  	"percentual" numeric,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_vinhos_v_version_harmonizacoes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"prato" varchar,
  	"observacao" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_vinhos_v_version_onde_comprar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"loja" varchar,
  	"url" varchar,
  	"afiliado" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_vinhos_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"pergunta" varchar,
  	"resposta" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_vinhos_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_produtor" varchar,
  	"version_pais" varchar,
  	"version_regiao_id" integer,
  	"version_sub_regiao" varchar,
  	"version_safra" numeric,
  	"version_tipo" "enum__vinhos_v_version_tipo",
  	"version_corpo" "enum__vinhos_v_version_corpo",
  	"version_teor_alcoolico" numeric,
  	"version_cor_na_escala" "enum__vinhos_v_version_cor_na_escala",
  	"version_destaque_imagem_id" integer,
  	"version_destaque_credito" varchar,
  	"version_destaque_legenda" varchar,
  	"version_nota" numeric,
  	"version_veredito" varchar,
  	"version_notas_degustacao" jsonb,
  	"version_temperatura_servico" varchar,
  	"version_potencial_guarda" varchar,
  	"version_taca_recomendada" varchar,
  	"version_decantacao" varchar,
  	"version_faixa_preco" "enum__vinhos_v_version_faixa_preco",
  	"version_data_preco" timestamp(3) with time zone,
  	"version_importadora_id" integer,
  	"version_seo_titulo" varchar,
  	"version_seo_descricao" varchar,
  	"version_seo_imagem_id" integer,
  	"version_seo_palavras_chave" varchar,
  	"version_seo_nao_indexar" boolean DEFAULT false,
  	"version_seo_canonica" varchar,
  	"version_slug" varchar,
  	"version_autor_id" integer,
  	"version_data_publicacao" timestamp(3) with time zone,
  	"version_data_atualizacao" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__vinhos_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_vinhos_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"materias_id" integer,
  	"vinhos_id" integer,
  	"guias_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "guias_para_levar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar
  );
  
  CREATE TABLE "guias_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"pergunta" varchar,
  	"resposta" varchar
  );
  
  CREATE TABLE "guias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"subtitulo" varchar,
  	"resumo" varchar,
  	"destaque_imagem_id" integer,
  	"destaque_credito" varchar,
  	"destaque_legenda" varchar,
  	"corpo" jsonb,
  	"seo_titulo" varchar,
  	"seo_descricao" varchar,
  	"seo_imagem_id" integer,
  	"seo_palavras_chave" varchar,
  	"seo_nao_indexar" boolean DEFAULT false,
  	"seo_canonica" varchar,
  	"slug" varchar,
  	"tipo_guia" "enum_guias_tipo_guia",
  	"nivel" "enum_guias_nivel" DEFAULT 'iniciante',
  	"autor_id" integer,
  	"chip_cor" "enum_guias_chip_cor" DEFAULT 'rubi',
  	"data_publicacao" timestamp(3) with time zone,
  	"data_atualizacao" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_guias_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "guias_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"materias_id" integer,
  	"guias_id" integer,
  	"vinhos_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "_guias_v_version_para_levar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"texto" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_guias_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"pergunta" varchar,
  	"resposta" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_guias_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_titulo" varchar,
  	"version_subtitulo" varchar,
  	"version_resumo" varchar,
  	"version_destaque_imagem_id" integer,
  	"version_destaque_credito" varchar,
  	"version_destaque_legenda" varchar,
  	"version_corpo" jsonb,
  	"version_seo_titulo" varchar,
  	"version_seo_descricao" varchar,
  	"version_seo_imagem_id" integer,
  	"version_seo_palavras_chave" varchar,
  	"version_seo_nao_indexar" boolean DEFAULT false,
  	"version_seo_canonica" varchar,
  	"version_slug" varchar,
  	"version_tipo_guia" "enum__guias_v_version_tipo_guia",
  	"version_nivel" "enum__guias_v_version_nivel" DEFAULT 'iniciante',
  	"version_autor_id" integer,
  	"version_chip_cor" "enum__guias_v_version_chip_cor" DEFAULT 'rubi',
  	"version_data_publicacao" timestamp(3) with time zone,
  	"version_data_atualizacao" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__guias_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_guias_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"materias_id" integer,
  	"guias_id" integer,
  	"vinhos_id" integer,
  	"tags_id" integer
  );
  
  CREATE TABLE "eventos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar,
  	"slug" varchar,
  	"data" timestamp(3) with time zone,
  	"data_fim" timestamp(3) with time zone,
  	"local" varchar,
  	"cidade" varchar,
  	"estado" varchar,
  	"endereco" varchar,
  	"tipo" "enum_eventos_tipo",
  	"descricao" varchar,
  	"link_inscricao" varchar,
  	"preco" varchar,
  	"organizador" varchar,
  	"destaque_imagem_id" integer,
  	"destaque_credito" varchar,
  	"destaque_legenda" varchar,
  	"chip_cor" "enum_eventos_chip_cor" DEFAULT 'rubi',
  	"seo_titulo" varchar,
  	"seo_descricao" varchar,
  	"seo_imagem_id" integer,
  	"seo_palavras_chave" varchar,
  	"seo_nao_indexar" boolean DEFAULT false,
  	"seo_canonica" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_eventos_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_eventos_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_nome" varchar,
  	"version_slug" varchar,
  	"version_data" timestamp(3) with time zone,
  	"version_data_fim" timestamp(3) with time zone,
  	"version_local" varchar,
  	"version_cidade" varchar,
  	"version_estado" varchar,
  	"version_endereco" varchar,
  	"version_tipo" "enum__eventos_v_version_tipo",
  	"version_descricao" varchar,
  	"version_link_inscricao" varchar,
  	"version_preco" varchar,
  	"version_organizador" varchar,
  	"version_destaque_imagem_id" integer,
  	"version_destaque_credito" varchar,
  	"version_destaque_legenda" varchar,
  	"version_chip_cor" "enum__eventos_v_version_chip_cor" DEFAULT 'rubi',
  	"version_seo_titulo" varchar,
  	"version_seo_descricao" varchar,
  	"version_seo_imagem_id" integer,
  	"version_seo_palavras_chave" varchar,
  	"version_seo_nao_indexar" boolean DEFAULT false,
  	"version_seo_canonica" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__eventos_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "autores_credenciais" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar NOT NULL,
  	"ano" varchar,
  	"link" varchar
  );
  
  CREATE TABLE "autores_redes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rede" "enum_autores_redes_rede" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "autores" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"slug" varchar,
  	"cargo" varchar,
  	"bio_curta" varchar,
  	"bio_longa" jsonb,
  	"foto_id" integer,
  	"email" varchar,
  	"seo_titulo" varchar,
  	"seo_descricao" varchar,
  	"seo_imagem_id" integer,
  	"seo_palavras_chave" varchar,
  	"seo_nao_indexar" boolean DEFAULT false,
  	"seo_canonica" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categorias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"slug" varchar,
  	"descricao" varchar,
  	"chip_cor" "enum_categorias_chip_cor" DEFAULT 'rubi',
  	"ordem" numeric DEFAULT 100,
  	"seo_titulo" varchar,
  	"seo_descricao" varchar,
  	"seo_imagem_id" integer,
  	"seo_palavras_chave" varchar,
  	"seo_nao_indexar" boolean DEFAULT false,
  	"seo_canonica" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "uvas" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"slug" varchar,
  	"cor" "enum_uvas_cor" DEFAULT 'tinta',
  	"sinonimos" varchar,
  	"descricao" varchar,
  	"guia_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "regioes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"slug" varchar,
  	"pais" varchar NOT NULL,
  	"descricao" varchar,
  	"guia_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "importadoras" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"slug" varchar,
  	"site" varchar,
  	"cidade" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "midia" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"credito" varchar,
  	"legenda" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_miniatura_url" varchar,
  	"sizes_miniatura_width" numeric,
  	"sizes_miniatura_height" numeric,
  	"sizes_miniatura_mime_type" varchar,
  	"sizes_miniatura_filesize" numeric,
  	"sizes_miniatura_filename" varchar,
  	"sizes_cartao_url" varchar,
  	"sizes_cartao_width" numeric,
  	"sizes_cartao_height" numeric,
  	"sizes_cartao_mime_type" varchar,
  	"sizes_cartao_filesize" numeric,
  	"sizes_cartao_filename" varchar,
  	"sizes_quadrado_url" varchar,
  	"sizes_quadrado_width" numeric,
  	"sizes_quadrado_height" numeric,
  	"sizes_quadrado_mime_type" varchar,
  	"sizes_quadrado_filesize" numeric,
  	"sizes_quadrado_filename" varchar,
  	"sizes_retrato_url" varchar,
  	"sizes_retrato_width" numeric,
  	"sizes_retrato_height" numeric,
  	"sizes_retrato_mime_type" varchar,
  	"sizes_retrato_filesize" numeric,
  	"sizes_retrato_filename" varchar,
  	"sizes_largura_url" varchar,
  	"sizes_largura_width" numeric,
  	"sizes_largura_height" numeric,
  	"sizes_largura_mime_type" varchar,
  	"sizes_largura_filesize" numeric,
  	"sizes_largura_filename" varchar,
  	"sizes_compartilhamento_url" varchar,
  	"sizes_compartilhamento_width" numeric,
  	"sizes_compartilhamento_height" numeric,
  	"sizes_compartilhamento_mime_type" varchar,
  	"sizes_compartilhamento_filesize" numeric,
  	"sizes_compartilhamento_filename" varchar
  );
  
  CREATE TABLE "inscricoes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"nome" varchar,
  	"origem" varchar,
  	"status_beehiiv" "enum_inscricoes_status_beehiiv" DEFAULT 'pendente',
  	"erro_beehiiv" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "usuarios_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "usuarios" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome" varchar NOT NULL,
  	"papel" "enum_usuarios_papel" DEFAULT 'editor' NOT NULL,
  	"autor_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"materias_id" integer,
  	"edicoes_id" integer,
  	"vinhos_id" integer,
  	"guias_id" integer,
  	"eventos_id" integer,
  	"autores_id" integer,
  	"categorias_id" integer,
  	"tags_id" integer,
  	"uvas_id" integer,
  	"regioes_id" integer,
  	"importadoras_id" integer,
  	"midia_id" integer,
  	"inscricoes_id" integer,
  	"usuarios_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"usuarios_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "configuracoes_menu" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rotulo" varchar NOT NULL,
  	"endereco" varchar NOT NULL
  );
  
  CREATE TABLE "configuracoes_redes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"rede" "enum_configuracoes_redes_rede" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "configuracoes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nome_site" varchar DEFAULT 'Tanin',
  	"assinatura" varchar DEFAULT 'Vinho com vagar',
  	"descricao" varchar DEFAULT 'A Tanin é uma publicação independente sobre vinho, escrita por Ana Luiza Leal para quem bebe — e não para quem vende.',
  	"imagem_padrao_id" integer,
  	"autora_principal_id" integer,
  	"boletim_titulo" varchar DEFAULT 'Boletim Tanin',
  	"boletim_chamada" varchar DEFAULT 'Toda semana, uma carta sobre vinho — o que vale a pena abrir, o que não vale o preço e o que ninguém está contando.',
  	"boletim_periodicidade" varchar DEFAULT 'Semanal, às quintas',
  	"rodape_texto" varchar,
  	"home_chamada" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "configuracoes_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"materias_id" integer,
  	"guias_id" integer,
  	"vinhos_id" integer
  );
  
  ALTER TABLE "materias_faq" ADD CONSTRAINT "materias_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."materias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materias" ADD CONSTRAINT "materias_destaque_imagem_id_midia_id_fk" FOREIGN KEY ("destaque_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "materias" ADD CONSTRAINT "materias_seo_imagem_id_midia_id_fk" FOREIGN KEY ("seo_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "materias" ADD CONSTRAINT "materias_autor_id_autores_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."autores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "materias" ADD CONSTRAINT "materias_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "materias_rels" ADD CONSTRAINT "materias_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."materias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materias_rels" ADD CONSTRAINT "materias_rels_vinhos_fk" FOREIGN KEY ("vinhos_id") REFERENCES "public"."vinhos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materias_rels" ADD CONSTRAINT "materias_rels_materias_fk" FOREIGN KEY ("materias_id") REFERENCES "public"."materias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materias_rels" ADD CONSTRAINT "materias_rels_guias_fk" FOREIGN KEY ("guias_id") REFERENCES "public"."guias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "materias_rels" ADD CONSTRAINT "materias_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materias_v_version_faq" ADD CONSTRAINT "_materias_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_materias_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materias_v" ADD CONSTRAINT "_materias_v_parent_id_materias_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."materias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_materias_v" ADD CONSTRAINT "_materias_v_version_destaque_imagem_id_midia_id_fk" FOREIGN KEY ("version_destaque_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_materias_v" ADD CONSTRAINT "_materias_v_version_seo_imagem_id_midia_id_fk" FOREIGN KEY ("version_seo_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_materias_v" ADD CONSTRAINT "_materias_v_version_autor_id_autores_id_fk" FOREIGN KEY ("version_autor_id") REFERENCES "public"."autores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_materias_v" ADD CONSTRAINT "_materias_v_version_categoria_id_categorias_id_fk" FOREIGN KEY ("version_categoria_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_materias_v_rels" ADD CONSTRAINT "_materias_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_materias_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materias_v_rels" ADD CONSTRAINT "_materias_v_rels_vinhos_fk" FOREIGN KEY ("vinhos_id") REFERENCES "public"."vinhos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materias_v_rels" ADD CONSTRAINT "_materias_v_rels_materias_fk" FOREIGN KEY ("materias_id") REFERENCES "public"."materias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materias_v_rels" ADD CONSTRAINT "_materias_v_rels_guias_fk" FOREIGN KEY ("guias_id") REFERENCES "public"."guias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_materias_v_rels" ADD CONSTRAINT "_materias_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "edicoes_blocos" ADD CONSTRAINT "edicoes_blocos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."edicoes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "edicoes" ADD CONSTRAINT "edicoes_destaque_imagem_id_midia_id_fk" FOREIGN KEY ("destaque_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "edicoes" ADD CONSTRAINT "edicoes_seo_imagem_id_midia_id_fk" FOREIGN KEY ("seo_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_edicoes_v_version_blocos" ADD CONSTRAINT "_edicoes_v_version_blocos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_edicoes_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_edicoes_v" ADD CONSTRAINT "_edicoes_v_parent_id_edicoes_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."edicoes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_edicoes_v" ADD CONSTRAINT "_edicoes_v_version_destaque_imagem_id_midia_id_fk" FOREIGN KEY ("version_destaque_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_edicoes_v" ADD CONSTRAINT "_edicoes_v_version_seo_imagem_id_midia_id_fk" FOREIGN KEY ("version_seo_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vinhos_uvas" ADD CONSTRAINT "vinhos_uvas_uva_id_uvas_id_fk" FOREIGN KEY ("uva_id") REFERENCES "public"."uvas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vinhos_uvas" ADD CONSTRAINT "vinhos_uvas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vinhos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vinhos_harmonizacoes" ADD CONSTRAINT "vinhos_harmonizacoes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vinhos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vinhos_onde_comprar" ADD CONSTRAINT "vinhos_onde_comprar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vinhos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vinhos_faq" ADD CONSTRAINT "vinhos_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."vinhos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vinhos" ADD CONSTRAINT "vinhos_regiao_id_regioes_id_fk" FOREIGN KEY ("regiao_id") REFERENCES "public"."regioes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vinhos" ADD CONSTRAINT "vinhos_destaque_imagem_id_midia_id_fk" FOREIGN KEY ("destaque_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vinhos" ADD CONSTRAINT "vinhos_importadora_id_importadoras_id_fk" FOREIGN KEY ("importadora_id") REFERENCES "public"."importadoras"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vinhos" ADD CONSTRAINT "vinhos_seo_imagem_id_midia_id_fk" FOREIGN KEY ("seo_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vinhos" ADD CONSTRAINT "vinhos_autor_id_autores_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."autores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vinhos_rels" ADD CONSTRAINT "vinhos_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vinhos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vinhos_rels" ADD CONSTRAINT "vinhos_rels_materias_fk" FOREIGN KEY ("materias_id") REFERENCES "public"."materias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vinhos_rels" ADD CONSTRAINT "vinhos_rels_vinhos_fk" FOREIGN KEY ("vinhos_id") REFERENCES "public"."vinhos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vinhos_rels" ADD CONSTRAINT "vinhos_rels_guias_fk" FOREIGN KEY ("guias_id") REFERENCES "public"."guias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "vinhos_rels" ADD CONSTRAINT "vinhos_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vinhos_v_version_uvas" ADD CONSTRAINT "_vinhos_v_version_uvas_uva_id_uvas_id_fk" FOREIGN KEY ("uva_id") REFERENCES "public"."uvas"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_vinhos_v_version_uvas" ADD CONSTRAINT "_vinhos_v_version_uvas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_vinhos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vinhos_v_version_harmonizacoes" ADD CONSTRAINT "_vinhos_v_version_harmonizacoes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_vinhos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vinhos_v_version_onde_comprar" ADD CONSTRAINT "_vinhos_v_version_onde_comprar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_vinhos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vinhos_v_version_faq" ADD CONSTRAINT "_vinhos_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_vinhos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vinhos_v" ADD CONSTRAINT "_vinhos_v_parent_id_vinhos_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."vinhos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_vinhos_v" ADD CONSTRAINT "_vinhos_v_version_regiao_id_regioes_id_fk" FOREIGN KEY ("version_regiao_id") REFERENCES "public"."regioes"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_vinhos_v" ADD CONSTRAINT "_vinhos_v_version_destaque_imagem_id_midia_id_fk" FOREIGN KEY ("version_destaque_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_vinhos_v" ADD CONSTRAINT "_vinhos_v_version_importadora_id_importadoras_id_fk" FOREIGN KEY ("version_importadora_id") REFERENCES "public"."importadoras"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_vinhos_v" ADD CONSTRAINT "_vinhos_v_version_seo_imagem_id_midia_id_fk" FOREIGN KEY ("version_seo_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_vinhos_v" ADD CONSTRAINT "_vinhos_v_version_autor_id_autores_id_fk" FOREIGN KEY ("version_autor_id") REFERENCES "public"."autores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_vinhos_v_rels" ADD CONSTRAINT "_vinhos_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_vinhos_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vinhos_v_rels" ADD CONSTRAINT "_vinhos_v_rels_materias_fk" FOREIGN KEY ("materias_id") REFERENCES "public"."materias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vinhos_v_rels" ADD CONSTRAINT "_vinhos_v_rels_vinhos_fk" FOREIGN KEY ("vinhos_id") REFERENCES "public"."vinhos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vinhos_v_rels" ADD CONSTRAINT "_vinhos_v_rels_guias_fk" FOREIGN KEY ("guias_id") REFERENCES "public"."guias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_vinhos_v_rels" ADD CONSTRAINT "_vinhos_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guias_para_levar" ADD CONSTRAINT "guias_para_levar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guias_faq" ADD CONSTRAINT "guias_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."guias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guias" ADD CONSTRAINT "guias_destaque_imagem_id_midia_id_fk" FOREIGN KEY ("destaque_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guias" ADD CONSTRAINT "guias_seo_imagem_id_midia_id_fk" FOREIGN KEY ("seo_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guias" ADD CONSTRAINT "guias_autor_id_autores_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."autores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "guias_rels" ADD CONSTRAINT "guias_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."guias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guias_rels" ADD CONSTRAINT "guias_rels_materias_fk" FOREIGN KEY ("materias_id") REFERENCES "public"."materias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guias_rels" ADD CONSTRAINT "guias_rels_guias_fk" FOREIGN KEY ("guias_id") REFERENCES "public"."guias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guias_rels" ADD CONSTRAINT "guias_rels_vinhos_fk" FOREIGN KEY ("vinhos_id") REFERENCES "public"."vinhos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "guias_rels" ADD CONSTRAINT "guias_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guias_v_version_para_levar" ADD CONSTRAINT "_guias_v_version_para_levar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_guias_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guias_v_version_faq" ADD CONSTRAINT "_guias_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_guias_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guias_v" ADD CONSTRAINT "_guias_v_parent_id_guias_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."guias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guias_v" ADD CONSTRAINT "_guias_v_version_destaque_imagem_id_midia_id_fk" FOREIGN KEY ("version_destaque_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guias_v" ADD CONSTRAINT "_guias_v_version_seo_imagem_id_midia_id_fk" FOREIGN KEY ("version_seo_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guias_v" ADD CONSTRAINT "_guias_v_version_autor_id_autores_id_fk" FOREIGN KEY ("version_autor_id") REFERENCES "public"."autores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_guias_v_rels" ADD CONSTRAINT "_guias_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_guias_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guias_v_rels" ADD CONSTRAINT "_guias_v_rels_materias_fk" FOREIGN KEY ("materias_id") REFERENCES "public"."materias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guias_v_rels" ADD CONSTRAINT "_guias_v_rels_guias_fk" FOREIGN KEY ("guias_id") REFERENCES "public"."guias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guias_v_rels" ADD CONSTRAINT "_guias_v_rels_vinhos_fk" FOREIGN KEY ("vinhos_id") REFERENCES "public"."vinhos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_guias_v_rels" ADD CONSTRAINT "_guias_v_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "eventos" ADD CONSTRAINT "eventos_destaque_imagem_id_midia_id_fk" FOREIGN KEY ("destaque_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "eventos" ADD CONSTRAINT "eventos_seo_imagem_id_midia_id_fk" FOREIGN KEY ("seo_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_eventos_v" ADD CONSTRAINT "_eventos_v_parent_id_eventos_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."eventos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_eventos_v" ADD CONSTRAINT "_eventos_v_version_destaque_imagem_id_midia_id_fk" FOREIGN KEY ("version_destaque_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_eventos_v" ADD CONSTRAINT "_eventos_v_version_seo_imagem_id_midia_id_fk" FOREIGN KEY ("version_seo_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "autores_credenciais" ADD CONSTRAINT "autores_credenciais_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."autores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "autores_redes" ADD CONSTRAINT "autores_redes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."autores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "autores" ADD CONSTRAINT "autores_foto_id_midia_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "autores" ADD CONSTRAINT "autores_seo_imagem_id_midia_id_fk" FOREIGN KEY ("seo_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categorias" ADD CONSTRAINT "categorias_seo_imagem_id_midia_id_fk" FOREIGN KEY ("seo_imagem_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "uvas" ADD CONSTRAINT "uvas_guia_id_guias_id_fk" FOREIGN KEY ("guia_id") REFERENCES "public"."guias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "regioes" ADD CONSTRAINT "regioes_guia_id_guias_id_fk" FOREIGN KEY ("guia_id") REFERENCES "public"."guias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "usuarios_sessions" ADD CONSTRAINT "usuarios_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_autor_id_autores_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."autores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_materias_fk" FOREIGN KEY ("materias_id") REFERENCES "public"."materias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_edicoes_fk" FOREIGN KEY ("edicoes_id") REFERENCES "public"."edicoes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vinhos_fk" FOREIGN KEY ("vinhos_id") REFERENCES "public"."vinhos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_guias_fk" FOREIGN KEY ("guias_id") REFERENCES "public"."guias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_eventos_fk" FOREIGN KEY ("eventos_id") REFERENCES "public"."eventos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_autores_fk" FOREIGN KEY ("autores_id") REFERENCES "public"."autores"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_uvas_fk" FOREIGN KEY ("uvas_id") REFERENCES "public"."uvas"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_regioes_fk" FOREIGN KEY ("regioes_id") REFERENCES "public"."regioes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_importadoras_fk" FOREIGN KEY ("importadoras_id") REFERENCES "public"."importadoras"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_midia_fk" FOREIGN KEY ("midia_id") REFERENCES "public"."midia"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inscricoes_fk" FOREIGN KEY ("inscricoes_id") REFERENCES "public"."inscricoes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_usuarios_fk" FOREIGN KEY ("usuarios_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_usuarios_fk" FOREIGN KEY ("usuarios_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configuracoes_menu" ADD CONSTRAINT "configuracoes_menu_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configuracoes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configuracoes_redes" ADD CONSTRAINT "configuracoes_redes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configuracoes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configuracoes" ADD CONSTRAINT "configuracoes_imagem_padrao_id_midia_id_fk" FOREIGN KEY ("imagem_padrao_id") REFERENCES "public"."midia"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "configuracoes" ADD CONSTRAINT "configuracoes_autora_principal_id_autores_id_fk" FOREIGN KEY ("autora_principal_id") REFERENCES "public"."autores"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "configuracoes_rels" ADD CONSTRAINT "configuracoes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."configuracoes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configuracoes_rels" ADD CONSTRAINT "configuracoes_rels_materias_fk" FOREIGN KEY ("materias_id") REFERENCES "public"."materias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configuracoes_rels" ADD CONSTRAINT "configuracoes_rels_guias_fk" FOREIGN KEY ("guias_id") REFERENCES "public"."guias"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configuracoes_rels" ADD CONSTRAINT "configuracoes_rels_vinhos_fk" FOREIGN KEY ("vinhos_id") REFERENCES "public"."vinhos"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "materias_faq_order_idx" ON "materias_faq" USING btree ("_order");
  CREATE INDEX "materias_faq_parent_id_idx" ON "materias_faq" USING btree ("_parent_id");
  CREATE INDEX "materias_destaque_destaque_imagem_idx" ON "materias" USING btree ("destaque_imagem_id");
  CREATE INDEX "materias_seo_seo_imagem_idx" ON "materias" USING btree ("seo_imagem_id");
  CREATE UNIQUE INDEX "materias_slug_idx" ON "materias" USING btree ("slug");
  CREATE INDEX "materias_autor_idx" ON "materias" USING btree ("autor_id");
  CREATE INDEX "materias_categoria_idx" ON "materias" USING btree ("categoria_id");
  CREATE INDEX "materias_data_publicacao_idx" ON "materias" USING btree ("data_publicacao");
  CREATE INDEX "materias_updated_at_idx" ON "materias" USING btree ("updated_at");
  CREATE INDEX "materias_created_at_idx" ON "materias" USING btree ("created_at");
  CREATE INDEX "materias__status_idx" ON "materias" USING btree ("_status");
  CREATE INDEX "materias_rels_order_idx" ON "materias_rels" USING btree ("order");
  CREATE INDEX "materias_rels_parent_idx" ON "materias_rels" USING btree ("parent_id");
  CREATE INDEX "materias_rels_path_idx" ON "materias_rels" USING btree ("path");
  CREATE INDEX "materias_rels_vinhos_id_idx" ON "materias_rels" USING btree ("vinhos_id");
  CREATE INDEX "materias_rels_materias_id_idx" ON "materias_rels" USING btree ("materias_id");
  CREATE INDEX "materias_rels_guias_id_idx" ON "materias_rels" USING btree ("guias_id");
  CREATE INDEX "materias_rels_tags_id_idx" ON "materias_rels" USING btree ("tags_id");
  CREATE INDEX "_materias_v_version_faq_order_idx" ON "_materias_v_version_faq" USING btree ("_order");
  CREATE INDEX "_materias_v_version_faq_parent_id_idx" ON "_materias_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_materias_v_parent_idx" ON "_materias_v" USING btree ("parent_id");
  CREATE INDEX "_materias_v_version_destaque_version_destaque_imagem_idx" ON "_materias_v" USING btree ("version_destaque_imagem_id");
  CREATE INDEX "_materias_v_version_seo_version_seo_imagem_idx" ON "_materias_v" USING btree ("version_seo_imagem_id");
  CREATE INDEX "_materias_v_version_version_slug_idx" ON "_materias_v" USING btree ("version_slug");
  CREATE INDEX "_materias_v_version_version_autor_idx" ON "_materias_v" USING btree ("version_autor_id");
  CREATE INDEX "_materias_v_version_version_categoria_idx" ON "_materias_v" USING btree ("version_categoria_id");
  CREATE INDEX "_materias_v_version_version_data_publicacao_idx" ON "_materias_v" USING btree ("version_data_publicacao");
  CREATE INDEX "_materias_v_version_version_updated_at_idx" ON "_materias_v" USING btree ("version_updated_at");
  CREATE INDEX "_materias_v_version_version_created_at_idx" ON "_materias_v" USING btree ("version_created_at");
  CREATE INDEX "_materias_v_version_version__status_idx" ON "_materias_v" USING btree ("version__status");
  CREATE INDEX "_materias_v_created_at_idx" ON "_materias_v" USING btree ("created_at");
  CREATE INDEX "_materias_v_updated_at_idx" ON "_materias_v" USING btree ("updated_at");
  CREATE INDEX "_materias_v_latest_idx" ON "_materias_v" USING btree ("latest");
  CREATE INDEX "_materias_v_autosave_idx" ON "_materias_v" USING btree ("autosave");
  CREATE INDEX "_materias_v_rels_order_idx" ON "_materias_v_rels" USING btree ("order");
  CREATE INDEX "_materias_v_rels_parent_idx" ON "_materias_v_rels" USING btree ("parent_id");
  CREATE INDEX "_materias_v_rels_path_idx" ON "_materias_v_rels" USING btree ("path");
  CREATE INDEX "_materias_v_rels_vinhos_id_idx" ON "_materias_v_rels" USING btree ("vinhos_id");
  CREATE INDEX "_materias_v_rels_materias_id_idx" ON "_materias_v_rels" USING btree ("materias_id");
  CREATE INDEX "_materias_v_rels_guias_id_idx" ON "_materias_v_rels" USING btree ("guias_id");
  CREATE INDEX "_materias_v_rels_tags_id_idx" ON "_materias_v_rels" USING btree ("tags_id");
  CREATE INDEX "edicoes_blocos_order_idx" ON "edicoes_blocos" USING btree ("_order");
  CREATE INDEX "edicoes_blocos_parent_id_idx" ON "edicoes_blocos" USING btree ("_parent_id");
  CREATE INDEX "edicoes_destaque_destaque_imagem_idx" ON "edicoes" USING btree ("destaque_imagem_id");
  CREATE INDEX "edicoes_seo_seo_imagem_idx" ON "edicoes" USING btree ("seo_imagem_id");
  CREATE UNIQUE INDEX "edicoes_numero_idx" ON "edicoes" USING btree ("numero");
  CREATE UNIQUE INDEX "edicoes_slug_idx" ON "edicoes" USING btree ("slug");
  CREATE INDEX "edicoes_data_envio_idx" ON "edicoes" USING btree ("data_envio");
  CREATE INDEX "edicoes_updated_at_idx" ON "edicoes" USING btree ("updated_at");
  CREATE INDEX "edicoes_created_at_idx" ON "edicoes" USING btree ("created_at");
  CREATE INDEX "edicoes__status_idx" ON "edicoes" USING btree ("_status");
  CREATE INDEX "_edicoes_v_version_blocos_order_idx" ON "_edicoes_v_version_blocos" USING btree ("_order");
  CREATE INDEX "_edicoes_v_version_blocos_parent_id_idx" ON "_edicoes_v_version_blocos" USING btree ("_parent_id");
  CREATE INDEX "_edicoes_v_parent_idx" ON "_edicoes_v" USING btree ("parent_id");
  CREATE INDEX "_edicoes_v_version_destaque_version_destaque_imagem_idx" ON "_edicoes_v" USING btree ("version_destaque_imagem_id");
  CREATE INDEX "_edicoes_v_version_seo_version_seo_imagem_idx" ON "_edicoes_v" USING btree ("version_seo_imagem_id");
  CREATE INDEX "_edicoes_v_version_version_numero_idx" ON "_edicoes_v" USING btree ("version_numero");
  CREATE INDEX "_edicoes_v_version_version_slug_idx" ON "_edicoes_v" USING btree ("version_slug");
  CREATE INDEX "_edicoes_v_version_version_data_envio_idx" ON "_edicoes_v" USING btree ("version_data_envio");
  CREATE INDEX "_edicoes_v_version_version_updated_at_idx" ON "_edicoes_v" USING btree ("version_updated_at");
  CREATE INDEX "_edicoes_v_version_version_created_at_idx" ON "_edicoes_v" USING btree ("version_created_at");
  CREATE INDEX "_edicoes_v_version_version__status_idx" ON "_edicoes_v" USING btree ("version__status");
  CREATE INDEX "_edicoes_v_created_at_idx" ON "_edicoes_v" USING btree ("created_at");
  CREATE INDEX "_edicoes_v_updated_at_idx" ON "_edicoes_v" USING btree ("updated_at");
  CREATE INDEX "_edicoes_v_latest_idx" ON "_edicoes_v" USING btree ("latest");
  CREATE INDEX "_edicoes_v_autosave_idx" ON "_edicoes_v" USING btree ("autosave");
  CREATE INDEX "vinhos_uvas_order_idx" ON "vinhos_uvas" USING btree ("_order");
  CREATE INDEX "vinhos_uvas_parent_id_idx" ON "vinhos_uvas" USING btree ("_parent_id");
  CREATE INDEX "vinhos_uvas_uva_idx" ON "vinhos_uvas" USING btree ("uva_id");
  CREATE INDEX "vinhos_harmonizacoes_order_idx" ON "vinhos_harmonizacoes" USING btree ("_order");
  CREATE INDEX "vinhos_harmonizacoes_parent_id_idx" ON "vinhos_harmonizacoes" USING btree ("_parent_id");
  CREATE INDEX "vinhos_onde_comprar_order_idx" ON "vinhos_onde_comprar" USING btree ("_order");
  CREATE INDEX "vinhos_onde_comprar_parent_id_idx" ON "vinhos_onde_comprar" USING btree ("_parent_id");
  CREATE INDEX "vinhos_faq_order_idx" ON "vinhos_faq" USING btree ("_order");
  CREATE INDEX "vinhos_faq_parent_id_idx" ON "vinhos_faq" USING btree ("_parent_id");
  CREATE INDEX "vinhos_produtor_idx" ON "vinhos" USING btree ("produtor");
  CREATE INDEX "vinhos_pais_idx" ON "vinhos" USING btree ("pais");
  CREATE INDEX "vinhos_regiao_idx" ON "vinhos" USING btree ("regiao_id");
  CREATE INDEX "vinhos_tipo_idx" ON "vinhos" USING btree ("tipo");
  CREATE INDEX "vinhos_cor_na_escala_idx" ON "vinhos" USING btree ("cor_na_escala");
  CREATE INDEX "vinhos_destaque_destaque_imagem_idx" ON "vinhos" USING btree ("destaque_imagem_id");
  CREATE INDEX "vinhos_nota_idx" ON "vinhos" USING btree ("nota");
  CREATE INDEX "vinhos_faixa_preco_idx" ON "vinhos" USING btree ("faixa_preco");
  CREATE INDEX "vinhos_importadora_idx" ON "vinhos" USING btree ("importadora_id");
  CREATE INDEX "vinhos_seo_seo_imagem_idx" ON "vinhos" USING btree ("seo_imagem_id");
  CREATE UNIQUE INDEX "vinhos_slug_idx" ON "vinhos" USING btree ("slug");
  CREATE INDEX "vinhos_autor_idx" ON "vinhos" USING btree ("autor_id");
  CREATE INDEX "vinhos_data_publicacao_idx" ON "vinhos" USING btree ("data_publicacao");
  CREATE INDEX "vinhos_updated_at_idx" ON "vinhos" USING btree ("updated_at");
  CREATE INDEX "vinhos_created_at_idx" ON "vinhos" USING btree ("created_at");
  CREATE INDEX "vinhos__status_idx" ON "vinhos" USING btree ("_status");
  CREATE INDEX "vinhos_rels_order_idx" ON "vinhos_rels" USING btree ("order");
  CREATE INDEX "vinhos_rels_parent_idx" ON "vinhos_rels" USING btree ("parent_id");
  CREATE INDEX "vinhos_rels_path_idx" ON "vinhos_rels" USING btree ("path");
  CREATE INDEX "vinhos_rels_materias_id_idx" ON "vinhos_rels" USING btree ("materias_id");
  CREATE INDEX "vinhos_rels_vinhos_id_idx" ON "vinhos_rels" USING btree ("vinhos_id");
  CREATE INDEX "vinhos_rels_guias_id_idx" ON "vinhos_rels" USING btree ("guias_id");
  CREATE INDEX "vinhos_rels_tags_id_idx" ON "vinhos_rels" USING btree ("tags_id");
  CREATE INDEX "_vinhos_v_version_uvas_order_idx" ON "_vinhos_v_version_uvas" USING btree ("_order");
  CREATE INDEX "_vinhos_v_version_uvas_parent_id_idx" ON "_vinhos_v_version_uvas" USING btree ("_parent_id");
  CREATE INDEX "_vinhos_v_version_uvas_uva_idx" ON "_vinhos_v_version_uvas" USING btree ("uva_id");
  CREATE INDEX "_vinhos_v_version_harmonizacoes_order_idx" ON "_vinhos_v_version_harmonizacoes" USING btree ("_order");
  CREATE INDEX "_vinhos_v_version_harmonizacoes_parent_id_idx" ON "_vinhos_v_version_harmonizacoes" USING btree ("_parent_id");
  CREATE INDEX "_vinhos_v_version_onde_comprar_order_idx" ON "_vinhos_v_version_onde_comprar" USING btree ("_order");
  CREATE INDEX "_vinhos_v_version_onde_comprar_parent_id_idx" ON "_vinhos_v_version_onde_comprar" USING btree ("_parent_id");
  CREATE INDEX "_vinhos_v_version_faq_order_idx" ON "_vinhos_v_version_faq" USING btree ("_order");
  CREATE INDEX "_vinhos_v_version_faq_parent_id_idx" ON "_vinhos_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_vinhos_v_parent_idx" ON "_vinhos_v" USING btree ("parent_id");
  CREATE INDEX "_vinhos_v_version_version_produtor_idx" ON "_vinhos_v" USING btree ("version_produtor");
  CREATE INDEX "_vinhos_v_version_version_pais_idx" ON "_vinhos_v" USING btree ("version_pais");
  CREATE INDEX "_vinhos_v_version_version_regiao_idx" ON "_vinhos_v" USING btree ("version_regiao_id");
  CREATE INDEX "_vinhos_v_version_version_tipo_idx" ON "_vinhos_v" USING btree ("version_tipo");
  CREATE INDEX "_vinhos_v_version_version_cor_na_escala_idx" ON "_vinhos_v" USING btree ("version_cor_na_escala");
  CREATE INDEX "_vinhos_v_version_destaque_version_destaque_imagem_idx" ON "_vinhos_v" USING btree ("version_destaque_imagem_id");
  CREATE INDEX "_vinhos_v_version_version_nota_idx" ON "_vinhos_v" USING btree ("version_nota");
  CREATE INDEX "_vinhos_v_version_version_faixa_preco_idx" ON "_vinhos_v" USING btree ("version_faixa_preco");
  CREATE INDEX "_vinhos_v_version_version_importadora_idx" ON "_vinhos_v" USING btree ("version_importadora_id");
  CREATE INDEX "_vinhos_v_version_seo_version_seo_imagem_idx" ON "_vinhos_v" USING btree ("version_seo_imagem_id");
  CREATE INDEX "_vinhos_v_version_version_slug_idx" ON "_vinhos_v" USING btree ("version_slug");
  CREATE INDEX "_vinhos_v_version_version_autor_idx" ON "_vinhos_v" USING btree ("version_autor_id");
  CREATE INDEX "_vinhos_v_version_version_data_publicacao_idx" ON "_vinhos_v" USING btree ("version_data_publicacao");
  CREATE INDEX "_vinhos_v_version_version_updated_at_idx" ON "_vinhos_v" USING btree ("version_updated_at");
  CREATE INDEX "_vinhos_v_version_version_created_at_idx" ON "_vinhos_v" USING btree ("version_created_at");
  CREATE INDEX "_vinhos_v_version_version__status_idx" ON "_vinhos_v" USING btree ("version__status");
  CREATE INDEX "_vinhos_v_created_at_idx" ON "_vinhos_v" USING btree ("created_at");
  CREATE INDEX "_vinhos_v_updated_at_idx" ON "_vinhos_v" USING btree ("updated_at");
  CREATE INDEX "_vinhos_v_latest_idx" ON "_vinhos_v" USING btree ("latest");
  CREATE INDEX "_vinhos_v_autosave_idx" ON "_vinhos_v" USING btree ("autosave");
  CREATE INDEX "_vinhos_v_rels_order_idx" ON "_vinhos_v_rels" USING btree ("order");
  CREATE INDEX "_vinhos_v_rels_parent_idx" ON "_vinhos_v_rels" USING btree ("parent_id");
  CREATE INDEX "_vinhos_v_rels_path_idx" ON "_vinhos_v_rels" USING btree ("path");
  CREATE INDEX "_vinhos_v_rels_materias_id_idx" ON "_vinhos_v_rels" USING btree ("materias_id");
  CREATE INDEX "_vinhos_v_rels_vinhos_id_idx" ON "_vinhos_v_rels" USING btree ("vinhos_id");
  CREATE INDEX "_vinhos_v_rels_guias_id_idx" ON "_vinhos_v_rels" USING btree ("guias_id");
  CREATE INDEX "_vinhos_v_rels_tags_id_idx" ON "_vinhos_v_rels" USING btree ("tags_id");
  CREATE INDEX "guias_para_levar_order_idx" ON "guias_para_levar" USING btree ("_order");
  CREATE INDEX "guias_para_levar_parent_id_idx" ON "guias_para_levar" USING btree ("_parent_id");
  CREATE INDEX "guias_faq_order_idx" ON "guias_faq" USING btree ("_order");
  CREATE INDEX "guias_faq_parent_id_idx" ON "guias_faq" USING btree ("_parent_id");
  CREATE INDEX "guias_destaque_destaque_imagem_idx" ON "guias" USING btree ("destaque_imagem_id");
  CREATE INDEX "guias_seo_seo_imagem_idx" ON "guias" USING btree ("seo_imagem_id");
  CREATE UNIQUE INDEX "guias_slug_idx" ON "guias" USING btree ("slug");
  CREATE INDEX "guias_tipo_guia_idx" ON "guias" USING btree ("tipo_guia");
  CREATE INDEX "guias_autor_idx" ON "guias" USING btree ("autor_id");
  CREATE INDEX "guias_data_publicacao_idx" ON "guias" USING btree ("data_publicacao");
  CREATE INDEX "guias_updated_at_idx" ON "guias" USING btree ("updated_at");
  CREATE INDEX "guias_created_at_idx" ON "guias" USING btree ("created_at");
  CREATE INDEX "guias__status_idx" ON "guias" USING btree ("_status");
  CREATE INDEX "guias_rels_order_idx" ON "guias_rels" USING btree ("order");
  CREATE INDEX "guias_rels_parent_idx" ON "guias_rels" USING btree ("parent_id");
  CREATE INDEX "guias_rels_path_idx" ON "guias_rels" USING btree ("path");
  CREATE INDEX "guias_rels_materias_id_idx" ON "guias_rels" USING btree ("materias_id");
  CREATE INDEX "guias_rels_guias_id_idx" ON "guias_rels" USING btree ("guias_id");
  CREATE INDEX "guias_rels_vinhos_id_idx" ON "guias_rels" USING btree ("vinhos_id");
  CREATE INDEX "guias_rels_tags_id_idx" ON "guias_rels" USING btree ("tags_id");
  CREATE INDEX "_guias_v_version_para_levar_order_idx" ON "_guias_v_version_para_levar" USING btree ("_order");
  CREATE INDEX "_guias_v_version_para_levar_parent_id_idx" ON "_guias_v_version_para_levar" USING btree ("_parent_id");
  CREATE INDEX "_guias_v_version_faq_order_idx" ON "_guias_v_version_faq" USING btree ("_order");
  CREATE INDEX "_guias_v_version_faq_parent_id_idx" ON "_guias_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_guias_v_parent_idx" ON "_guias_v" USING btree ("parent_id");
  CREATE INDEX "_guias_v_version_destaque_version_destaque_imagem_idx" ON "_guias_v" USING btree ("version_destaque_imagem_id");
  CREATE INDEX "_guias_v_version_seo_version_seo_imagem_idx" ON "_guias_v" USING btree ("version_seo_imagem_id");
  CREATE INDEX "_guias_v_version_version_slug_idx" ON "_guias_v" USING btree ("version_slug");
  CREATE INDEX "_guias_v_version_version_tipo_guia_idx" ON "_guias_v" USING btree ("version_tipo_guia");
  CREATE INDEX "_guias_v_version_version_autor_idx" ON "_guias_v" USING btree ("version_autor_id");
  CREATE INDEX "_guias_v_version_version_data_publicacao_idx" ON "_guias_v" USING btree ("version_data_publicacao");
  CREATE INDEX "_guias_v_version_version_updated_at_idx" ON "_guias_v" USING btree ("version_updated_at");
  CREATE INDEX "_guias_v_version_version_created_at_idx" ON "_guias_v" USING btree ("version_created_at");
  CREATE INDEX "_guias_v_version_version__status_idx" ON "_guias_v" USING btree ("version__status");
  CREATE INDEX "_guias_v_created_at_idx" ON "_guias_v" USING btree ("created_at");
  CREATE INDEX "_guias_v_updated_at_idx" ON "_guias_v" USING btree ("updated_at");
  CREATE INDEX "_guias_v_latest_idx" ON "_guias_v" USING btree ("latest");
  CREATE INDEX "_guias_v_autosave_idx" ON "_guias_v" USING btree ("autosave");
  CREATE INDEX "_guias_v_rels_order_idx" ON "_guias_v_rels" USING btree ("order");
  CREATE INDEX "_guias_v_rels_parent_idx" ON "_guias_v_rels" USING btree ("parent_id");
  CREATE INDEX "_guias_v_rels_path_idx" ON "_guias_v_rels" USING btree ("path");
  CREATE INDEX "_guias_v_rels_materias_id_idx" ON "_guias_v_rels" USING btree ("materias_id");
  CREATE INDEX "_guias_v_rels_guias_id_idx" ON "_guias_v_rels" USING btree ("guias_id");
  CREATE INDEX "_guias_v_rels_vinhos_id_idx" ON "_guias_v_rels" USING btree ("vinhos_id");
  CREATE INDEX "_guias_v_rels_tags_id_idx" ON "_guias_v_rels" USING btree ("tags_id");
  CREATE UNIQUE INDEX "eventos_slug_idx" ON "eventos" USING btree ("slug");
  CREATE INDEX "eventos_data_idx" ON "eventos" USING btree ("data");
  CREATE INDEX "eventos_cidade_idx" ON "eventos" USING btree ("cidade");
  CREATE INDEX "eventos_tipo_idx" ON "eventos" USING btree ("tipo");
  CREATE INDEX "eventos_destaque_destaque_imagem_idx" ON "eventos" USING btree ("destaque_imagem_id");
  CREATE INDEX "eventos_seo_seo_imagem_idx" ON "eventos" USING btree ("seo_imagem_id");
  CREATE INDEX "eventos_updated_at_idx" ON "eventos" USING btree ("updated_at");
  CREATE INDEX "eventos_created_at_idx" ON "eventos" USING btree ("created_at");
  CREATE INDEX "eventos__status_idx" ON "eventos" USING btree ("_status");
  CREATE INDEX "_eventos_v_parent_idx" ON "_eventos_v" USING btree ("parent_id");
  CREATE INDEX "_eventos_v_version_version_slug_idx" ON "_eventos_v" USING btree ("version_slug");
  CREATE INDEX "_eventos_v_version_version_data_idx" ON "_eventos_v" USING btree ("version_data");
  CREATE INDEX "_eventos_v_version_version_cidade_idx" ON "_eventos_v" USING btree ("version_cidade");
  CREATE INDEX "_eventos_v_version_version_tipo_idx" ON "_eventos_v" USING btree ("version_tipo");
  CREATE INDEX "_eventos_v_version_destaque_version_destaque_imagem_idx" ON "_eventos_v" USING btree ("version_destaque_imagem_id");
  CREATE INDEX "_eventos_v_version_seo_version_seo_imagem_idx" ON "_eventos_v" USING btree ("version_seo_imagem_id");
  CREATE INDEX "_eventos_v_version_version_updated_at_idx" ON "_eventos_v" USING btree ("version_updated_at");
  CREATE INDEX "_eventos_v_version_version_created_at_idx" ON "_eventos_v" USING btree ("version_created_at");
  CREATE INDEX "_eventos_v_version_version__status_idx" ON "_eventos_v" USING btree ("version__status");
  CREATE INDEX "_eventos_v_created_at_idx" ON "_eventos_v" USING btree ("created_at");
  CREATE INDEX "_eventos_v_updated_at_idx" ON "_eventos_v" USING btree ("updated_at");
  CREATE INDEX "_eventos_v_latest_idx" ON "_eventos_v" USING btree ("latest");
  CREATE INDEX "autores_credenciais_order_idx" ON "autores_credenciais" USING btree ("_order");
  CREATE INDEX "autores_credenciais_parent_id_idx" ON "autores_credenciais" USING btree ("_parent_id");
  CREATE INDEX "autores_redes_order_idx" ON "autores_redes" USING btree ("_order");
  CREATE INDEX "autores_redes_parent_id_idx" ON "autores_redes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "autores_slug_idx" ON "autores" USING btree ("slug");
  CREATE INDEX "autores_foto_idx" ON "autores" USING btree ("foto_id");
  CREATE INDEX "autores_seo_seo_imagem_idx" ON "autores" USING btree ("seo_imagem_id");
  CREATE INDEX "autores_updated_at_idx" ON "autores" USING btree ("updated_at");
  CREATE INDEX "autores_created_at_idx" ON "autores" USING btree ("created_at");
  CREATE UNIQUE INDEX "categorias_slug_idx" ON "categorias" USING btree ("slug");
  CREATE INDEX "categorias_seo_seo_imagem_idx" ON "categorias" USING btree ("seo_imagem_id");
  CREATE INDEX "categorias_updated_at_idx" ON "categorias" USING btree ("updated_at");
  CREATE INDEX "categorias_created_at_idx" ON "categorias" USING btree ("created_at");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE INDEX "uvas_nome_idx" ON "uvas" USING btree ("nome");
  CREATE UNIQUE INDEX "uvas_slug_idx" ON "uvas" USING btree ("slug");
  CREATE INDEX "uvas_guia_idx" ON "uvas" USING btree ("guia_id");
  CREATE INDEX "uvas_updated_at_idx" ON "uvas" USING btree ("updated_at");
  CREATE INDEX "uvas_created_at_idx" ON "uvas" USING btree ("created_at");
  CREATE INDEX "regioes_nome_idx" ON "regioes" USING btree ("nome");
  CREATE UNIQUE INDEX "regioes_slug_idx" ON "regioes" USING btree ("slug");
  CREATE INDEX "regioes_pais_idx" ON "regioes" USING btree ("pais");
  CREATE INDEX "regioes_guia_idx" ON "regioes" USING btree ("guia_id");
  CREATE INDEX "regioes_updated_at_idx" ON "regioes" USING btree ("updated_at");
  CREATE INDEX "regioes_created_at_idx" ON "regioes" USING btree ("created_at");
  CREATE UNIQUE INDEX "importadoras_slug_idx" ON "importadoras" USING btree ("slug");
  CREATE INDEX "importadoras_updated_at_idx" ON "importadoras" USING btree ("updated_at");
  CREATE INDEX "importadoras_created_at_idx" ON "importadoras" USING btree ("created_at");
  CREATE INDEX "midia_updated_at_idx" ON "midia" USING btree ("updated_at");
  CREATE INDEX "midia_created_at_idx" ON "midia" USING btree ("created_at");
  CREATE UNIQUE INDEX "midia_filename_idx" ON "midia" USING btree ("filename");
  CREATE INDEX "midia_sizes_miniatura_sizes_miniatura_filename_idx" ON "midia" USING btree ("sizes_miniatura_filename");
  CREATE INDEX "midia_sizes_cartao_sizes_cartao_filename_idx" ON "midia" USING btree ("sizes_cartao_filename");
  CREATE INDEX "midia_sizes_quadrado_sizes_quadrado_filename_idx" ON "midia" USING btree ("sizes_quadrado_filename");
  CREATE INDEX "midia_sizes_retrato_sizes_retrato_filename_idx" ON "midia" USING btree ("sizes_retrato_filename");
  CREATE INDEX "midia_sizes_largura_sizes_largura_filename_idx" ON "midia" USING btree ("sizes_largura_filename");
  CREATE INDEX "midia_sizes_compartilhamento_sizes_compartilhamento_file_idx" ON "midia" USING btree ("sizes_compartilhamento_filename");
  CREATE UNIQUE INDEX "inscricoes_email_idx" ON "inscricoes" USING btree ("email");
  CREATE INDEX "inscricoes_updated_at_idx" ON "inscricoes" USING btree ("updated_at");
  CREATE INDEX "inscricoes_created_at_idx" ON "inscricoes" USING btree ("created_at");
  CREATE INDEX "usuarios_sessions_order_idx" ON "usuarios_sessions" USING btree ("_order");
  CREATE INDEX "usuarios_sessions_parent_id_idx" ON "usuarios_sessions" USING btree ("_parent_id");
  CREATE INDEX "usuarios_autor_idx" ON "usuarios" USING btree ("autor_id");
  CREATE INDEX "usuarios_updated_at_idx" ON "usuarios" USING btree ("updated_at");
  CREATE INDEX "usuarios_created_at_idx" ON "usuarios" USING btree ("created_at");
  CREATE UNIQUE INDEX "usuarios_email_idx" ON "usuarios" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_materias_id_idx" ON "payload_locked_documents_rels" USING btree ("materias_id");
  CREATE INDEX "payload_locked_documents_rels_edicoes_id_idx" ON "payload_locked_documents_rels" USING btree ("edicoes_id");
  CREATE INDEX "payload_locked_documents_rels_vinhos_id_idx" ON "payload_locked_documents_rels" USING btree ("vinhos_id");
  CREATE INDEX "payload_locked_documents_rels_guias_id_idx" ON "payload_locked_documents_rels" USING btree ("guias_id");
  CREATE INDEX "payload_locked_documents_rels_eventos_id_idx" ON "payload_locked_documents_rels" USING btree ("eventos_id");
  CREATE INDEX "payload_locked_documents_rels_autores_id_idx" ON "payload_locked_documents_rels" USING btree ("autores_id");
  CREATE INDEX "payload_locked_documents_rels_categorias_id_idx" ON "payload_locked_documents_rels" USING btree ("categorias_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_uvas_id_idx" ON "payload_locked_documents_rels" USING btree ("uvas_id");
  CREATE INDEX "payload_locked_documents_rels_regioes_id_idx" ON "payload_locked_documents_rels" USING btree ("regioes_id");
  CREATE INDEX "payload_locked_documents_rels_importadoras_id_idx" ON "payload_locked_documents_rels" USING btree ("importadoras_id");
  CREATE INDEX "payload_locked_documents_rels_midia_id_idx" ON "payload_locked_documents_rels" USING btree ("midia_id");
  CREATE INDEX "payload_locked_documents_rels_inscricoes_id_idx" ON "payload_locked_documents_rels" USING btree ("inscricoes_id");
  CREATE INDEX "payload_locked_documents_rels_usuarios_id_idx" ON "payload_locked_documents_rels" USING btree ("usuarios_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_usuarios_id_idx" ON "payload_preferences_rels" USING btree ("usuarios_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "configuracoes_menu_order_idx" ON "configuracoes_menu" USING btree ("_order");
  CREATE INDEX "configuracoes_menu_parent_id_idx" ON "configuracoes_menu" USING btree ("_parent_id");
  CREATE INDEX "configuracoes_redes_order_idx" ON "configuracoes_redes" USING btree ("_order");
  CREATE INDEX "configuracoes_redes_parent_id_idx" ON "configuracoes_redes" USING btree ("_parent_id");
  CREATE INDEX "configuracoes_imagem_padrao_idx" ON "configuracoes" USING btree ("imagem_padrao_id");
  CREATE INDEX "configuracoes_autora_principal_idx" ON "configuracoes" USING btree ("autora_principal_id");
  CREATE INDEX "configuracoes_rels_order_idx" ON "configuracoes_rels" USING btree ("order");
  CREATE INDEX "configuracoes_rels_parent_idx" ON "configuracoes_rels" USING btree ("parent_id");
  CREATE INDEX "configuracoes_rels_path_idx" ON "configuracoes_rels" USING btree ("path");
  CREATE INDEX "configuracoes_rels_materias_id_idx" ON "configuracoes_rels" USING btree ("materias_id");
  CREATE INDEX "configuracoes_rels_guias_id_idx" ON "configuracoes_rels" USING btree ("guias_id");
  CREATE INDEX "configuracoes_rels_vinhos_id_idx" ON "configuracoes_rels" USING btree ("vinhos_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "materias_faq" CASCADE;
  DROP TABLE "materias" CASCADE;
  DROP TABLE "materias_rels" CASCADE;
  DROP TABLE "_materias_v_version_faq" CASCADE;
  DROP TABLE "_materias_v" CASCADE;
  DROP TABLE "_materias_v_rels" CASCADE;
  DROP TABLE "edicoes_blocos" CASCADE;
  DROP TABLE "edicoes" CASCADE;
  DROP TABLE "_edicoes_v_version_blocos" CASCADE;
  DROP TABLE "_edicoes_v" CASCADE;
  DROP TABLE "vinhos_uvas" CASCADE;
  DROP TABLE "vinhos_harmonizacoes" CASCADE;
  DROP TABLE "vinhos_onde_comprar" CASCADE;
  DROP TABLE "vinhos_faq" CASCADE;
  DROP TABLE "vinhos" CASCADE;
  DROP TABLE "vinhos_rels" CASCADE;
  DROP TABLE "_vinhos_v_version_uvas" CASCADE;
  DROP TABLE "_vinhos_v_version_harmonizacoes" CASCADE;
  DROP TABLE "_vinhos_v_version_onde_comprar" CASCADE;
  DROP TABLE "_vinhos_v_version_faq" CASCADE;
  DROP TABLE "_vinhos_v" CASCADE;
  DROP TABLE "_vinhos_v_rels" CASCADE;
  DROP TABLE "guias_para_levar" CASCADE;
  DROP TABLE "guias_faq" CASCADE;
  DROP TABLE "guias" CASCADE;
  DROP TABLE "guias_rels" CASCADE;
  DROP TABLE "_guias_v_version_para_levar" CASCADE;
  DROP TABLE "_guias_v_version_faq" CASCADE;
  DROP TABLE "_guias_v" CASCADE;
  DROP TABLE "_guias_v_rels" CASCADE;
  DROP TABLE "eventos" CASCADE;
  DROP TABLE "_eventos_v" CASCADE;
  DROP TABLE "autores_credenciais" CASCADE;
  DROP TABLE "autores_redes" CASCADE;
  DROP TABLE "autores" CASCADE;
  DROP TABLE "categorias" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "uvas" CASCADE;
  DROP TABLE "regioes" CASCADE;
  DROP TABLE "importadoras" CASCADE;
  DROP TABLE "midia" CASCADE;
  DROP TABLE "inscricoes" CASCADE;
  DROP TABLE "usuarios_sessions" CASCADE;
  DROP TABLE "usuarios" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "configuracoes_menu" CASCADE;
  DROP TABLE "configuracoes_redes" CASCADE;
  DROP TABLE "configuracoes" CASCADE;
  DROP TABLE "configuracoes_rels" CASCADE;
  DROP TYPE "public"."enum_materias_chip_cor";
  DROP TYPE "public"."enum_materias_status";
  DROP TYPE "public"."enum__materias_v_version_chip_cor";
  DROP TYPE "public"."enum__materias_v_version_status";
  DROP TYPE "public"."enum_edicoes_chip_cor";
  DROP TYPE "public"."enum_edicoes_status";
  DROP TYPE "public"."enum__edicoes_v_version_chip_cor";
  DROP TYPE "public"."enum__edicoes_v_version_status";
  DROP TYPE "public"."enum_vinhos_tipo";
  DROP TYPE "public"."enum_vinhos_corpo";
  DROP TYPE "public"."enum_vinhos_cor_na_escala";
  DROP TYPE "public"."enum_vinhos_faixa_preco";
  DROP TYPE "public"."enum_vinhos_status";
  DROP TYPE "public"."enum__vinhos_v_version_tipo";
  DROP TYPE "public"."enum__vinhos_v_version_corpo";
  DROP TYPE "public"."enum__vinhos_v_version_cor_na_escala";
  DROP TYPE "public"."enum__vinhos_v_version_faixa_preco";
  DROP TYPE "public"."enum__vinhos_v_version_status";
  DROP TYPE "public"."enum_guias_tipo_guia";
  DROP TYPE "public"."enum_guias_nivel";
  DROP TYPE "public"."enum_guias_chip_cor";
  DROP TYPE "public"."enum_guias_status";
  DROP TYPE "public"."enum__guias_v_version_tipo_guia";
  DROP TYPE "public"."enum__guias_v_version_nivel";
  DROP TYPE "public"."enum__guias_v_version_chip_cor";
  DROP TYPE "public"."enum__guias_v_version_status";
  DROP TYPE "public"."enum_eventos_tipo";
  DROP TYPE "public"."enum_eventos_chip_cor";
  DROP TYPE "public"."enum_eventos_status";
  DROP TYPE "public"."enum__eventos_v_version_tipo";
  DROP TYPE "public"."enum__eventos_v_version_chip_cor";
  DROP TYPE "public"."enum__eventos_v_version_status";
  DROP TYPE "public"."enum_autores_redes_rede";
  DROP TYPE "public"."enum_categorias_chip_cor";
  DROP TYPE "public"."enum_uvas_cor";
  DROP TYPE "public"."enum_inscricoes_status_beehiiv";
  DROP TYPE "public"."enum_usuarios_papel";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";
  DROP TYPE "public"."enum_configuracoes_redes_rede";`)
}
