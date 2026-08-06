import path from 'path'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { pt } from '@payloadcms/translations/languages/pt'
import { en } from '@payloadcms/translations/languages/en'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Autores } from '@/collections/Autores'
import { Edicoes } from '@/collections/Edicoes'
import { Eventos } from '@/collections/Eventos'
import { Guias } from '@/collections/Guias'
import { Inscricoes } from '@/collections/Inscricoes'
import { Materias } from '@/collections/Materias'
import { Midia } from '@/collections/Midia'
import {
  Categorias,
  Importadoras,
  Regioes,
  Tags,
  Uvas,
} from '@/collections/Taxonomias'
import { Usuarios } from '@/collections/Usuarios'
import { Vinhos } from '@/collections/Vinhos'
import { Configuracoes } from '@/globals/Configuracoes'
import { editorTanin } from '@/fields/editor'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Armazenamento de mídia.
 *
 * Em desenvolvimento os arquivos ficam em `public/media`, no próprio computador.
 * Em produção a Vercel não guarda arquivos entre um deploy e outro, então é preciso
 * um armazenamento externo. O plugin abaixo fala o dialeto S3, que serve tanto para o
 * Storage do Supabase quanto para AWS S3 ou Cloudflare R2 — basta preencher as quatro
 * variáveis de ambiente. Sem elas, o plugin nem entra, e o site segue no disco local.
 */
const armazenamentoConfigurado = Boolean(
  process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY,
)

const plugins = armazenamentoConfigurado
  ? [
      s3Storage({
        collections: { midia: true },
        bucket: process.env.S3_BUCKET!,
        config: {
          endpoint: process.env.S3_ENDPOINT,
          region: process.env.S3_REGION ?? 'us-east-1',
          forcePathStyle: true, // o Storage do Supabase exige caminho, não subdomínio
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID!,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
          },
        },
      }),
    ]
  : []

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_URL_SITE ?? 'http://localhost:3000',
  admin: {
    user: Usuarios.slug,
    importMap: { baseDir: path.resolve(dirname) },
    // Data como se escreve em português: 06/08/2026 às 20:05, e não "August 6th, 8:05 PM".
    dateFormat: "dd/MM/yyyy 'às' HH:mm",
    meta: {
      titleSuffix: ' · Painel Tanin',
      description: 'Painel de publicação da Tanin',
    },
    components: {
      graphics: {
        Logo: '@/admin/Logo#Logo',
        Icon: '@/admin/Logo#Icone',
      },
    },
    livePreview: {
      breakpoints: [
        { label: 'Celular', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 834, height: 1112 },
        { label: 'Computador', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  /**
   * O painel fala português. O inglês fica disponível só como rede de segurança.
   *
   * A tradução oficial do Payload deixa alguns termos em inglês — "Login", "Email",
   * "Log out". Num painel que uma jornalista vai abrir todo dia, isso é justamente o
   * tipo de detalhe que faz a ferramenta parecer emprestada de outra pessoa.
   */
  i18n: {
    supportedLanguages: { pt, en },
    fallbackLanguage: 'pt',
    translations: {
      pt: {
        authentication: {
          login: 'Entrar',
          logOut: 'Sair',
          logout: 'Sair',
          emailAddress: 'E-mail',
          forgotPasswordQuestion: 'Esqueceu a senha?',
        },
        general: {
          email: 'E-mail',
          createNew: 'Criar',
          showAllLabel: 'Mostrar todos',
        },
      },
    },
  },
  localization: false,
  collections: [
    Materias,
    Edicoes,
    Vinhos,
    Guias,
    Eventos,
    Autores,
    Categorias,
    Tags,
    Uvas,
    Regioes,
    Importadoras,
    Midia,
    Inscricoes,
    Usuarios,
  ],
  globals: [Configuracoes],
  editor: editorTanin,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI ?? '',
      // O pooler do Supabase encerra conexões ociosas; manter o pool pequeno evita
      // erro de "too many clients" em ambiente serverless.
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
      ...(process.env.DATABASE_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
    },
    // Em produção as mudanças de estrutura entram por migração, nunca automaticamente.
    push: process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(dirname, './migrations'),
  }),
  sharp,
  secret: process.env.PAYLOAD_SECRET ?? 'tanin-desenvolvimento-trocar-em-producao',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  graphQL: { disable: false },
  plugins,
  upload: { limits: { fileSize: 12_000_000 } },
})
