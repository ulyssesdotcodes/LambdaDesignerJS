import * as t from 'io-ts'
import * as fpt from 'fp-ts/lib/Tree'

const ParamTypes = t.union([
        t.literal("number"), 
        t.literal("float"), 
        t.literal("string"), 
        t.literal("toggle"), 
        t.literal("menu"), 
        t.literal("xy"), 
        t.literal("wh"), 
        t.literal("uv"), 
        t.literal("xyz"), 
        t.literal("rgb"), 
        t.literal("rgba"), 
        t.literal("TOP"),
        t.literal("DAT"),
        t.literal("MAT"),
        t.literal("CHOP"),
        t.literal("COMP"),
        t.literal("SOP"),
        t.literal("OP")
    ])
export type ParamType = t.TypeOf<typeof ParamTypes>

export interface IParam<T extends ParamType> {
    type: T,
    value: Array<string | INode>,
    name: string | undefined
}

export type OP = "TOP" | "CHOP" | "MAT" | "SOP" | "COMP"

export interface INode {
    family: OP
    type: string
    params: Array<IParam<ParamType>>
    connections: Array<INode>
}

export const Param : t.RecursiveType<t.Type<IParam<ParamType>>> = t.recursion<IParam<ParamType>>('Param', _ => t.interface({
    type: ParamTypes,
    name: t.string,
    value: t.array(t.union([t.string, Node]))
}))

export const Node : t.RecursiveType<t.Type<INode>> = t.recursion<INode>('Node', _ => 
    t.interface({
        family: t.union([t.literal("TOP"), t.literal("CHOP"), t.literal("MAT"), t.literal("SOP"), t.literal("COMP")]),
        type: t.string,
        params: t.array(Param),
        connections: t.array(Node)
    }))

export const Feedback = t.intersection([
    Node,
    t.interface({
        middle: Node,
        connectpath: t.string
    })
])

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