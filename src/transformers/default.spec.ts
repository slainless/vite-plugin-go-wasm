import { describe, it } from 'vitest'

describe('WASM executable', () => {
  it('loads wasm_exec correctly')
  it('appends default Go() export to the file')
})

describe("'Go' source code transformation", () => {
  describe('Asset output mode', () => {
    it('emits given compiled wasm path as asset')
    it('returns correct loading code in transform()')
  })

  describe('Inline output mode', () => {
    it('returns correct loading code in transform()')
  })
})
