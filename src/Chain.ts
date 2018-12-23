import { DisconnectedNode, Node, NodeConnectFunc, FBNode, FBTargetNode, INode, OP, IParamAny, IParam, IParam2, IParam3, IParam4, ParamType } from './Types'
import { strict } from 'assert';
import * as fpt from 'fp-ts/lib/Tree'
import * as assert from 'assert'
import { isNumber, isBoolean } from 'util';
import { Guid } from 'guid-typescript'

// Ops

// const op = <T extends OP>(type: OP) => (optype: string, params: { [name: string] : IParamAny}) : OpTree<T> => {
//   if (type === "DAT"){}
//   return new OpTree<T>({family: type, type: optype + type, params: params, connections: []}, [])
// }

// New chain mechanism

const op = <T extends OP>(type: T) => 
  (ty: string, params: { [name: string] : IParamAny}) => 
    new DisconnectedNode<T>(
      (inputs: Node<T>[]) => 
          new Node({type: ty + type, family:type, params: params, connections: inputs.map(n => n.node)})
    )

export const top = op<"TOP">("TOP")
export const tope = (optype: string) => op<"TOP">("TOP")(optype, {})
export const dat = op<"DAT">("DAT")
export const date = (optype: string) => op<"DAT">("DAT")(optype, {})
export const chop = op<"CHOP">("CHOP")
export const chope = (optype: string) => op<"CHOP">("CHOP")(optype, {})
export const sop = op<"SOP">("SOP")
export const sope = (optype: string) => op<"SOP">("SOP")(optype, {})
export const mat = op<"MAT">("MAT")
export const mate = (optype: string) => op<"MAT">("MAT")(optype, {})
export const comp = op<"COMP">("COMP")
export const compe = (optype: string) => op<"COMP">("COMP")(optype, {})

// export const replacetop = new ReplaceTree<"TOP">(tope("null").value, [])
// export const replacechop = new ReplaceTree<"CHOP">(chope("null").value, [])
// export const replacedat = new ReplaceTree<"DAT">(date("null").value, [])
// export const replacesop = new ReplaceTree<"SOP">(sope("null").value, [])
// export const replacemat = new ReplaceTree<"MAT">(mate("null").value, [])

// export const cc = <T extends OP>(handlef: (self: OpTree<T>, n: OpTree<T>) => OpTree<T>, root: OpTree<T>) => {
//   new CustomConnectOpTree<T>(handlef, root.value, root.forest as OpTree<T>[]);
// }

export const cc = <T extends OP>(func: NodeConnectFunc<T>) => {
  return new DisconnectedNode(func);
}

export const insertconn = <T extends OP>(dn: DisconnectedNode<T>, before: Node<T>[], after: Node<T>[]) => {
  return cc<T>((inputs) => dn.run(before.concat(inputs, after)))
}

export const node = <T extends OP, R extends INode>(n: R) => {
  return new Node<T>(n)
}

export const feedbacktop = (): DisconnectedNode<"TOP"> => {
  return cc((inputs) => node({ family: "TOP", type: "feedbackTOP", special: "FB", id: Guid.create(), connections: inputs.map(i => i.out()), params: {}}))
}

export const feedbacktarget = (fbg: Guid, optype: string, params: {[name: string] : IParamAny}) : DisconnectedNode<"TOP"> => {
  return cc((inputs) => node({special: "FBT", selects: [fbg], connections: inputs.map(i => i.out()), params: params, type: optype + "TOP", family: "TOP"}))
}

export const feedbackChain = (middle: DisconnectedNode<"TOP">) : DisconnectedNode<"TOP"> => {
  return cc<"TOP">((inputs) => {
    let fbt = feedbacktop()
    let baseop = (id: Guid) => cc<"TOP">((inputs) => {
      let basemiddle = middle.run(inputs).out()
      return node({special: "FBT", selects: [id], connections: basemiddle.connections, params: middle.run(inputs).out().params, type: middle.out().type, family: "TOP"})
    })
    return fbt.connect(cc((inputs) => baseop((inputs[0].node as FBNode).id).run(inputs))).run(inputs)
  })
}

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
export const xyzp = (v0: IParam<"float">, v1: IParam<"float">, v2: IParam<"float">) : IParam3<"xyz"> =>  {
  assert.ok(v0.type == "float", "xyz requires float params")
  assert.ok(v1.type == "float", "xyz requires float params")
  assert.ok(v2.type == "float", "xyz requires float params")
  return ({  type: "xyz", value0: v0.value0, value1: v1.value0, value2: v2.value0 })
}
export const xyzwp = (v0: IParam<"float">, v1: IParam<"float">, v2: IParam<"float">, v3: IParam<"float">) : IParam4<"xyzw"> =>  {
  assert.ok(v0.type == "float", "xyzw requires float params")
  assert.ok(v1.type == "float", "xyzw requires float params")
  assert.ok(v2.type == "float", "xyzw requires float params")
  assert.ok(v3.type == "float", "xyzw requires float params")
  return ({  type: "xyzw", value0: v0.value0, value1: v1.value0, value2: v2.value0, value3: v3.value0 })
}
export const whp = (v0: IParam<"number">, v1: IParam<"number">) : IParam2<"wh"> =>  {
  assert.ok(v0.type == "number" && v1.type == "number", "wh requires number params")
  return ({  type: "wh", value0: v0.value0, value1: v1.value0 })
}
export const topp = (v: Node<"TOP">) : IParam<"TOP"> => {
  let out = v.out()
  assert.equal("TOP", out.family, "param and op family must match")
  return {  type: "TOP", value0: ['\"', out, '\"'] }
}
export const datp = (v: Node<"DAT">) : IParam<"DAT"> => {
  let out = v.out()
  assert.equal("DAT", out.family, "param and op family must match")
  return {  type: "DAT", value0: ['\"', out, '\"'] }
}
export const chopp = (v: Node<"CHOP">) : IParam<"CHOP"> => {
  let out = v.out()
  assert.equal("CHOP", out.family, "param and op family must match")
  return {  type: "CHOP", value0: ['\"', out, '\"'] }
}
export const sopp = (v: Node<"SOP">) : IParam<"SOP"> => {
  let out = v.out()
  assert.equal("SOP", out.family, "param and op family must match")
  return {  type: "SOP", value0: ['\"', out, '\"'] }
}
export const matp = (v: Node<"MAT">) : IParam<"MAT"> => {
  let out = v.out()
  assert.equal("MAT", out.family, "param and op family must match")
  return {  type: "MAT", value0: ['\"', out, '\"'] }
}
export const compp = (v: Node<"COMP">) : IParam<"COMP"> => {
  let out = v.out()
  assert.equal("COMP", out.family, "param and op family must match")
  return {  type: "COMP", value0: ['\"', out, '\"'] }
}

export const chan = (i: IParam<"number" | "string">, v: Node<"CHOP">): IParam<"float"> => {
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
export const powp = mathopp("**")

export const x4p = (v0: IParam<"float">) : IParam4<"xyzw"> =>  {
  assert.ok(v0.type == "float", "xyzw requires float params")
  let undef = { type: "float", value0: [] }
  return ({  type: "xyzw", value0: v0.value0, value1: [], value2: [], value3: [] })
}

export const seconds = { type: "float", value0: ["absTime.seconds"]} as IParam<"float">
export const frames = { type: "float", value0: ["absTime.frame"]} as IParam<"float">

