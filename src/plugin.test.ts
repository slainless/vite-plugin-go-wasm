import type { ViteDevServer } from 'vite'
import { beforeAll, describe, it } from 'vitest'
import { createServer } from '../test/mock_server/server'
import { randomInt } from 'crypto'

let server: ViteDevServer
let port: number

beforeAll(async () => {
  server = await createServer()
  port = await randomInt(9999)
  return () => server.close()
})

describe('Initial plugin loading', () => {
  it('Should expect correct Builder from option')
  it('Should expect correct Transformer from option')
})

describe('Plugin runtime execution', () => {
  it('Should execute Builder.buildStart on buildStart hook')
  it('Should execute Transformer.buildStart on buildStart hook')
  it('Should execute Transformer.loadWasmExec on load hook')
  it('Should execute Builder.build on transform hook')
  it('Should execute Transformer.transform on transform hook')
  it('Should execute Transformer.loadWasmExec on load hook')
})

describe('Plugin runtime output', () => {
  it('Should resolve virtual module for wasm_exec correctly')
  it('Should load virtual module for wasm_exec correctly')
  it('Should only load .go files')
  it('Should only transform .go files')
})
