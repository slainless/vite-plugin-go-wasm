export class GoWasmError extends Error {
  name = 'GoWasmError'

  constructor(public message: string, public code: number) {
    super(message)
  }
}

export namespace Code {
  export const UNSET_BINARY_PATH = 11
  export const BINARY_READ_FAILED = 12
}
