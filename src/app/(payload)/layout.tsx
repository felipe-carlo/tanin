/* Layout do painel do Payload. Vive isolado do site: o /admin tem o CSS dele. */
import type { ServerFunctionClient } from 'payload'
import config from '@payload-config'
import '@payloadcms/next/css'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'
import React from 'react'

import { ModoEscrita } from '@/admin/ModoEscrita'
import { classesDeFonte } from '@/lib/fontes'

import { importMap } from './admin/importMap.js'
import './painel.css'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({ ...args, config, importMap })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    <ModoEscrita classesDeFonte={classesDeFonte}>{children}</ModoEscrita>
  </RootLayout>
)

export default Layout
