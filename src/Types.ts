import * as t from 'io-ts'
import * as fpt from 'fp-ts/lib/Tree'
import { Guid } from 'guid-typescript'

// const ParamTypes = t.union([
//         t.literal("number"), 
//         t.literal("float"), 
//         t.literal("string"), 
//         t.literal("toggle"), 
//         t.literal("menu"), 
//         t.literal("xy"), 
//         t.literal("wh"), 
//         t.literal("uv"), 
//         t.literal("xyz"), 
//         t.literal("rgb"), 
//         t.literal("rgba"), 
//         t.literal("TOP"),
//         t.literal("DAT"),
//         t.literal("MAT"),
//         t.literal("CHOP"),
//         t.literal("COMP")
//         t.literal("SOP"),
//         t.literal("OP")
//     ])
// export type ParamType = t.TypeOf<typeof ParamTypes>

export type ParamType = "number" | "float" | "string" | "toggle" | "menu" | "TOP" | "DAT" | "MAT" | "CHOP" | "COMP" | "SOP" | "OP"

export type ParamType2 = "xy" | "uv" | "wh"
export type ParamType3 = "xyz" | "uvw" | "rgb"
export type ParamType4 = "xyzw" | "rgba"

export interface IParam<T extends ParamType> {
    type: T,
    value0: Array<string | INode>
}
export interface IParam2<T extends ParamType2> {
    type: T,
    value0: Array<string | INode>
    value1: Array<string | INode>
}
export interface IParam3<T extends ParamType3> {
    type: T,
    value0: Array<string | INode>
    value1: Array<string | INode>
    value2: Array<string | INode>
}

export interface IParam4<T extends ParamType4> {
    type: T,
    value0: Array<string | INode>
    value1: Array<string | INode>
    value2: Array<string | INode>
    value3: Array<string | INode>
}

export type OP = "TOP" | "CHOP" | "MAT" | "SOP" | "COMP" | "DAT"

export type IParamAny = IParam<ParamType> | IParam2<ParamType2> | IParam3<ParamType3> | IParam4<ParamType4>

export interface INode {
    family: OP
    type: string
    params: { [name: string] : IParamAny }
    connections: Array<INode>
    text?: string
}

// export const Param : t.RecursiveType<t.Type<IParam<ParamType>>> = t.recursion<IParam<ParamType>>('Param', _ => t.interface({
//     type: ParamTypes,
//     value: t.array(t.union([t.string, Node]))
// }))

// export const Node : t.RecursiveType<t.Type<INode>> = t.recursion<INode>('Node', _ => 
//     t.interface({
//         family: t.union([t.literal("TOP"), t.literal("CHOP"), t.literal("MAT"), t.literal("SOP"), t.literal("COMP")]),
//         type: t.string,
//         params: t.dictionary(t.string, Param),
//         connections: t.array(Node)
//     }))

// export const Feedback = t.intersection([
//     Node,
//     t.interface({
//         middle: Node,
//         connectpath: t.string
//     })
// ])

export class OpTree<T extends OP> extends fpt.Tree<INode> {
  readonly _T!: T
  connect<R extends T>(n: OpTree<R>) : OpTree<R> {
    let root : OpTree<T> = n
    while(root.forest.length > 0) {
      root = root.forest[0] as OpTree<T>
    }
    root.forest[0] = new OpTree(this.value, this.forest)
    return n
  } 

  addConnect<R extends T>(n: OpTree<R>) : OpTree<R> {
    return new OpTree(n.value, n.forest.concat([this]))
  } 

  out(): INode {
    this.value.connections = this.forest.map((t : OpTree<T>) => t.out())
    return this.value
  }
}

export interface FBNode extends INode{
    readonly special: "FB",
    id: Guid,
    params: {},
}

export interface FBTargetNode extends INode {
    readonly special: "FBT"
    selects: Array<Guid>
}

export class FBOpTree<T extends OP> extends OpTree<T> {
    readonly _T!: T
}