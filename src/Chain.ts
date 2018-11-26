import { OpTree, INode, Node, OP, IParam, Param, ParamType } from './Types'
import { strict } from 'assert';
import * as fpt from 'fp-ts/lib/Tree'

// Ops

const op = <T extends OP>(type: OP) => (optype: string, params: { [name: string] : IParam<ParamType>}) : OpTree<T> => {
  return new OpTree<T>({family: type, type: optype + type, params: params, connections: []}, [])
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

export const fp = (v: number) : IParam<"float"> =>  ({  type: "float", value: [String(v)] })
export const ip = (v: number) : IParam<"number"> =>  ({  type: "number", value: [String(v)] })
export const sp = (v: string) : IParam<"string"> =>  ({  type: "string", value: [v] })
export const tp = (v: boolean) : IParam<"toggle"> =>  ({  type: "toggle", value: [String(v ? 1 : 0)] })
export const mp = (v: number) : IParam<"menu"> =>  ({  type: "menu", value: [String(v)] })
export const xyp = (v: [IParam<"float">, IParam<"float">]) : IParam<"xy"> =>  ({  type: "xy", value: [v[0].value[0], v[1].value[0]] })
export const topp = (v: OpTree<"TOP">) : IParam<"TOP"> => ({  type: "TOP", value: [v.out()] })
export const chopp = (v: OpTree<"CHOP">) : IParam<"CHOP"> => ({  type: "CHOP", value: [v.out()] })
export const sopp = (v: OpTree<"SOP">) : IParam<"SOP"> => ({  type: "SOP", value: [v.out()] })
export const matp = (v: OpTree<"MAT">) : IParam<"MAT"> => ({  type: "MAT", value: [v.out()] })
export const compp = (v: OpTree<"COMP">) : IParam<"COMP"> => ({  type: "COMP", value: [v.out()] })