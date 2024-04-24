import { describe, it } from 'vitest'

describe('Build process', () => {
  it('compiles source to correct output path')
  it('calls compiler binary with format and environment')

  it('handles error of external build call')
  it('handles stdout of external build call')
  it('handles stderr of external build call')

  it('rejects promise correctly on execFile error event')
  it('rejects promise correctly on execFile exit event with status not 0')
  it('resolves promise correctly on execFile exit event with status 0')
})
