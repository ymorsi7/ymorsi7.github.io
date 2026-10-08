export type InputState = {
  pointerX: number
  pointerY: number
  pointerInside: boolean
  pointerDown: boolean
  justDown: boolean
  justUp: boolean
  pointerButton: number
  keys: Set<string>
  justKeys: Set<string>
}

export function createInput(): InputState {
  return {
    pointerX: 0,
    pointerY: 0,
    pointerInside: false,
    pointerDown: false,
    justDown: false,
    justUp: false,
    pointerButton: 0,
    keys: new Set(),
    justKeys: new Set(),
  }
}

export function edgeFree(input: InputState): InputState {
  return {
    ...input,
    justDown: false,
    justUp: false,
    justKeys: new Set(),
    keys: input.keys,
  }
}
