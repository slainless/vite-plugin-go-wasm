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

  it('expects correct Builder from option')
  it('expects correct Transformer from option')
})

describe('Plugin runtime execution', () => {
  it('executes Builder.buildStart on buildStart hook correctly')
  it('executes Transformer.buildStart on buildStart hook correctly')
  it('executes Transformer.loadWasmExec on load hook correctly')
  it('executes Builder.build on transform hook correctly')
  it('executes Transformer.transform on transform hook correctly')
  it('executes Transformer.loadWasmExec on load hook correctly')
})

describe('Plugin runtime output', () => {
  it('resolves virtual module for wasm_exec correctly')
  it('loads virtual module for wasm_exec correctly')
  it('only load .go files')
  it('only transform .go files')
})
