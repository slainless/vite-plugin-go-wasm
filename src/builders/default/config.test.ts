import { describe, it } from 'vitest'

describe('Option resolving', () => {
  it('resolves options.binaryPath correctly')
  it(
    'resolves options.binaryPath to `${process.env.GOROOT}/bin/go` if its empty'
  )
  it(
    'throws error when both process.env.GOROOT and options.binaryPath are empty'
  )

  it('resolves options.tempDir correctly')
  it('creates temporary directory if options.tempDir is empty')
})

describe('Temporary directory cleanup', () => {
  it('destroys temporary directory on normal process exit')
  it('destroys temporary directory on interrupt')
  it('destroys temporary directory on process crashing')

  it('destroys locked temporary directory')

  it('destroys all temporary directory with pattern /go-wasm-.{6}/')
})
