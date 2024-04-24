import { describe, it } from 'vitest'

describe('Option resolving', () => {
  it('resolves options.wasmExecPath correctly')
  it('resolves options.wasmExecPath to GOROOT fallback path if its empty')
  it(
    'throws error when both process.env.GOROOT and options.wasmExecPath are empty'
  )
})
