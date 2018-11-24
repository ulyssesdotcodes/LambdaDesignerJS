import { OpTree, INode, Node, OP, IParam, Param, ParamType } from './Types'
import { strict } from 'assert';
import * as fpt from 'fp-ts/lib/Tree'

// Ops

const op = <T extends OP>(type: OP) => (optype: string, params: IParam<ParamType>[]) : OpTree<T> => {
  return new OpTree<T>({family: type, type: optype, params: params, connections: []}, [])
}

export const top = op<"TOP">("TOP")
export const tope = (optype: string) => op<"TOP">("TOP")(optype, [])
export const chop = op<"CHOP">("CHOP")
export const chope = (optype: string) => op<"CHOP">("CHOP")(optype, [])
export const sop = op<"SOP">("SOP")
export const sope = (optype: string) => op<"SOP">("SOP")(optype, [])
export const mat = op<"MAT">("MAT")
export const mate = (optype: string) => op<"MAT">("MAT")(optype, [])
export const comp = op<"COMP">("COMP")
export const compe = (optype: string) => op<"COMP">("COMP")(optype, [])

export const fp = (n: string | undefined, v: number) : IParam<"float"> =>  ({ name: n, type: "float", value: [String(v)] })
export const ip = (n: string | undefined, v: number) : IParam<"number"> =>  ({ name: n, type: "number", value: [String(v)] })
export const sp = (n: string | undefined, v: string) : IParam<"string"> =>  ({ name: n, type: "string", value: [v] })
export const tp = (n: string | undefined, v: boolean) : IParam<"toggle"> =>  ({ name: n, type: "toggle", value: [String(v ? 0 : 1)] })
export const mp = (n: string | undefined, v: number) : IParam<"menu"> =>  ({ name: n, type: "menu", value: [String(v)] })
export const xyp = (n: string | undefined, v: [IParam<"float">, IParam<"float">]) : IParam<"xy"> =>  ({ name: n, type: "xy", value: [v[0].value[0], v[1].value[0]] })
export const topp = (n: string | undefined, v: OpTree<"TOP">) : IParam<"TOP"> => ({ name: n, type: "TOP", value: [v.out()] })
export const chopp = (n: string | undefined, v: OpTree<"CHOP">) : IParam<"CHOP"> => ({ name: n, type: "CHOP", value: [v.out()] })
export const sopp = (n: string | undefined, v: OpTree<"SOP">) : IParam<"SOP"> => ({ name: n, type: "SOP", value: [v.out()] })
export const matp = (n: string | undefined, v: OpTree<"MAT">) : IParam<"MAT"> => ({ name: n, type: "MAT", value: [v.out()] })
export const compp = (n: string | undefined, v: OpTree<"COMP">) : IParam<"COMP"> => ({ name: n, type: "COMP", value: [v.out()] })