import * as t from 'io-ts'

export interface IParam {
    type: "number" |  "float" |  "string" |  "toggle" |  "menu" |  "TOP" | "DAT" | "MAT" | "SOP" | "OP"
    value: string | INode
}

export type OP = "TOP" | "CHOP" | "MAT" | "SOP" | "COMP"

export interface INode {
    type: OP,
    optype: string
    params: {[key: string]: IParam }
    connections: INode[]
}

export const Param : t.RecursiveType<t.Type<IParam>> = t.recursion<IParam>('Param', _ => t.interface({
    type: t.union([
        t.literal("number"), 
        t.literal("float"), 
        t.literal("string"), 
        t.literal("toggle"), 
        t.literal("menu"), 
        t.literal("TOP"),
        t.literal("DAT"),
        t.literal("MAT"),
        t.literal("SOP"),
        t.literal("OP")
    ]),
    value: t.union([t.string, Node])
}))

export const Node : t.RecursiveType<t.Type<INode>> = t.recursion<INode>('Node', _ => 
    t.interface({
        type: t.union([t.literal("TOP"), t.literal("CHOP"), t.literal("MAT"), t.literal("SOP"), t.literal("COMP")]),
        optype: t.string,
        params: t.dictionary(t.string, Param),
        connections: t.array(Node)
    }))

export const Feedback = t.intersection([
    Node,
    t.interface({
        middle: Node,
        connectpath: t.string
    })
])