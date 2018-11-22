import { INode, Node, OP, IParam, Param } from './Types'
import { strict } from 'assert';
import * as fpt from 'fp-ts/lib/Tree'

// Ops

export class OpTree<T extends OP> extends fpt.Tree<INode> {
  readonly _T!: T
  connect<R extends T>(n: OpTree<R>) : OpTree<R> {
    return new OpTree(n.value, n.forest.concat([this]))
  } 

  out(): INode {
    this.value.connections = this.forest.map((t : OpTree<T>) => t.out())
    return this.value
  }
}

const op = <T extends OP>(type: OP) => (optype: string, params: { [name: string] : IParam }) : OpTree<T> => {
  return new OpTree<T>({type: type, optype: optype, params: params, connections: []}, [])
}

export const top = op<"TOP">("TOP")
export const tope = (optype: string) => op<"TOP">("TOP")(optype, {})
export const chop = op<"CHOP">("CHOP")
export const chope = (optype: string) => op<"CHOP">("CHOP")(optype, {})
export const sop = op<"SOP">("SOP")
export const sope = (optype: string) => op<"SOP">("SOP")(optype, {})
export const mat = op<"MAT">("MAT")
export const mate = (optype: string) => op<"MAT">("MAT")(optype, {})
export const comp = op<"COMP">("COMP")
export const compe = (optype: string) => op<"COMP">("COMP")(optype, {})

export const fp = (v: number) =>  ({ type: "float", value: String(v) })
export const ip = (v: number) =>  ({ type: "number", value: String(v) })
export const sp = (v: string) =>  ({ type: "string", value: v })
export const tp = (v: boolean) =>  ({ type: "toggle", value: String(v ? 0 : 1) })
export const mp = (v: number) =>  ({ type: "menu", value: String(v) })
export const topp = (v: OpTree<"TOP">) => ({ type: "TOP", value: v })