import * as t from 'io-ts'


export const Param = t.interface({
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
    value: t.string
})

export interface IParam extends t.TypeOf<typeof Param> {}

export interface INode {
    type: "TOP" | "CHOP" | "MAT" | "SOP" | "COMP",
    optype: string
    params: {[key: string]: IParam }
}

export const Node : t.RecursiveType<t.Type<INode>> = t.recursion<INode>('Node', _ => 
    t.interface({
        type: t.union([t.literal("TOP"), t.literal("CHOP"), t.literal("MAT"), t.literal("SOP"), t.literal("COMP")]),
        optype: t.string,
        params: t.dictionary(t.string, Param)
    }))

export const Feedback = t.intersection([
    Node,
    t.interface({
        middle: Node,
        connectpath: t.string
    })
])