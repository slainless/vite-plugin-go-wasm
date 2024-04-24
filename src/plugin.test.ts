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
  it('can fallback to default Builder')
  it('can fallback to default Transformer')

  it('expect correct Builder from option')
  it('expect correct Transformer from option')
})

describe('Plugin runtime execution', () => {
  it('execute Builder.buildStart on buildStart hook')
  it('execute Transformer.buildStart on buildStart hook')
  it('execute Transformer.loadWasmExec on load hook')
  it('execute Builder.build on transform hook')
  it('execute Transformer.transform on transform hook')
  it('execute Transformer.loadWasmExec on load hook')
})

describe('Plugin runtime output', () => {
  it('resolve virtual module for wasm_exec correctly')
  it('load virtual module for wasm_exec correctly')
  it('only load .go files')
  it('only transform .go files')
})
