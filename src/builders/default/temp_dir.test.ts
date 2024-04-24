import { describe, it } from 'vitest'

describe('Temporary directory creation', () => {
  it('create temporary directory correctly')
})

describe('Temporary directory cleanup', () => {
  it('destroy temporary directory on normal process exit')
  it('destroy temporary directory on interrupt')
  it('destroy temporary directory on process crashing')

  it('destroy locked temporary directory')

  it('destroy all temporary directory with pattern /go-wasm-.{6}/')
})
