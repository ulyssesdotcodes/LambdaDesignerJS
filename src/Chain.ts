import { OpTree, INode, OP, IParamAny, IParam, IParam2, IParam3, IParam4, ParamType } from './Types'
import { strict } from 'assert';
import * as fpt from 'fp-ts/lib/Tree'
import * as assert from 'assert'
import { isNumber, isBoolean } from 'util';

// Ops

const op = <T extends OP>(type: OP) => (optype: string, params: { [name: string] : IParamAny}) : OpTree<T> => {
  return new OpTree<T>({family: type, type: optype + type, params: params, connections: []}, [])
}

export const top = op<"TOP">("TOP")
export const tope = (optype: string) => op<"TOP">("TOP")(optype, {})
export const dop = op<"DAT">("DAT")
export const date = (optype: string) => op<"DAT">("DAT")(optype, {})
export const chop = op<"CHOP">("CHOP")
export const chope = (optype: string) => op<"CHOP">("CHOP")(optype, {})
export const sop = op<"SOP">("SOP")
export const sope = (optype: string) => op<"SOP">("SOP")(optype, {})
export const mat = op<"MAT">("MAT")
export const mate = (optype: string) => op<"MAT">("MAT")(optype, {})
export const comp = op<"COMP">("COMP")
export const compe = (optype: string) => op<"COMP">("COMP")(optype, {})

export const fp = (v: number) : IParam<"float"> =>  {
  assert.ok(isNumber(v), "float param only takes numbers");
  return {  type: "float", value0: [String(v)] }
}
export const ip = (v: number) : IParam<"number"> =>  {
  assert.ok(Number.isSafeInteger(v), "integer param only takes integers");
  return {  type: "number", value0: [String(v)] }
}
export const sp = (v: string) : IParam<"string"> =>  {
  assert.equal(typeof v, "string")
  return ({ type: "string", value0: ['"' + v + '"'] })
}
export const tp = (v: boolean) : IParam<"toggle"> => {
  assert.ok(isBoolean(v), "boolean param only takes booleans");
  return {  type: "toggle", value0: [String(v ? 1 : 0)] }
}
export const mp = (v: number) : IParam<"menu"> =>  {
  assert.ok(Number.isSafeInteger(v), "menu param only takes integers");
  return {  type: "menu", value0: [String(v)] }
}
export const xyp = (v0: IParam<"float">, v1: IParam<"float">) : IParam2<"xy"> =>  {
  assert.ok(v0.type == "float" && v1.type == "float", "xy requires float params")
  return ({  type: "xy", value0: v0.value0, value1: v1.value0 })
}
export const whp = (v0: IParam<"number">, v1: IParam<"number">) : IParam2<"wh"> =>  {
  assert.ok(v0.type == "number" && v1.type == "number", "wh requires number params")
  return ({  type: "wh", value0: v0.value0, value1: v1.value0 })
}
export const topp = (v: OpTree<"TOP">) : IParam<"TOP"> => {
  let out = v.out()
  assert.equal("TOP", out.family, "param and op family must match")
  return {  type: "TOP", value0: ['\"', out, '\"'] }
}
export const datp = (v: OpTree<"DAT">) : IParam<"DAT"> => {
  let out = v.out()
  assert.equal("DAT", out.family, "param and op family must match")
  return {  type: "DAT", value0: ['\"', out, '\"'] }
}
export const chopp = (v: OpTree<"CHOP">) : IParam<"CHOP"> => {
  let out = v.out()
  assert.equal("CHOP", out.family, "param and op family must match")
  return {  type: "CHOP", value0: ['\"', out, '\"'] }
}
export const sopp = (v: OpTree<"SOP">) : IParam<"SOP"> => {
  let out = v.out()
  assert.equal("SOP", out.family, "param and op family must match")
  return {  type: "SOP", value0: ['\"', out, '\"'] }
}
export const matp = (v: OpTree<"MAT">) : IParam<"MAT"> => {
  let out = v.out()
  assert.equal("MAT", out.family, "param and op family must match")
  return {  type: "MAT", value0: ['\"', out, '\"'] }
}
export const compp = (v: OpTree<"COMP">) : IParam<"COMP"> => {
  let out = v.out()
  assert.equal("COMP", out.family, "param and op family must match")
  return {  type: "COMP", value0: ['\"', out, '\"'] }
}

export const chan = (i: IParam<"number" | "string">, v: OpTree<"CHOP">): IParam<"float"> => {
  let out = v.out()
  assert.equal("CHOP", out.family, "param and op family must match")
  assert.ok("number" === i.type || "string" === i.type, "chan needs integer or string param index")
  return ({ type: "float", value0: ['op(\"', v.out(), '\")['].concat(i.value0, [']'])})
}

const mathopp = (t: string) =>  (a: IParam<"float">, b: IParam<"float">): IParam<"float"> => {
  assert.equal("float", a.type, "mult is a float op")
  assert.equal("float", b.type, "mult is a float op")
  return { type: "float", value0: (["( "] as Array<string | INode>).concat(a.value0, [ " " + t + " " ], b.value0, [" )"])}
}

export const multp = mathopp("*")
export const addp = mathopp("+")
export const subp = mathopp("-")
export const divp = mathopp("/")
export const modp = mathopp("%")