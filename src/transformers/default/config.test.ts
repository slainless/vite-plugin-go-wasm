import { assert, beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveOptions } from './config'

const goRootStub = '/test/path/to/go'

describe('Option resolving', () => {
  beforeEach(() => {
    vi.stubEnv('GOROOT', goRootStub)
  })

  it('resolves options.wasmExecPath correctly', async () => {
    expect(await resolveOptions({ wasmExecPath: 'a path' }))
      .to.have.property('wasmExecPath')
      .that.is.equal('a path')
  })
  it('resolves options.wasmExecPath to GOROOT fallback path if its empty', async () => {
    expect(process.env.GOROOT).to.be.equal(goRootStub)
    expect(await resolveOptions())
      .to.have.property('wasmExecPath')
      .that.is.equal(`${goRootStub}/misc/wasm/wasm_exec.js`)
  })
  it('throws error when both process.env.GOROOT and options.wasmExecPath are empty', async () => {
    vi.unstubAllEnvs()
    expect.assertions(2)
    try {
      await resolveOptions()
      assert.fail(`Should have thrown error`)
    } catch (e) {
      expect(e).to.be.instanceOf(Error)
      expect(e?.toString()).toContain('Cannot determine wasm_exec path')
    }
  })
})
