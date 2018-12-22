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


// export class OpTree<T extends OP> {
//   readonly _T!: T
//   constructor(protected value : INode, protected forest: OpTree<T>[]){
//     forest.push(new ReplaceTree<T>(null, null));
//   }

//   connectTo(n: OpTree<T>) : OpTree<T> {
//     return n.handleConnection(this);
//   } 

//   addConnection(n: OpTree<T>) : OpTree<T> {
//       this.forest.push(n)
//       return this
//   }

//   handleConnection(n: OpTree<T>) : OpTree<T> {
//     if(this.forest.length > 0) {
//       n.connectTo(this.forest[0] as OpTree<T>)
//     } else {
//       this.forest[0] = n
//     }
//     return this
//   }

//   handleConnectionToIdx(n: OpTree<T>, idx: number) {

//   }

//   out(): INode {
//     this.value.connections = this.forest.map((t : OpTree<T>) => t.out())
//     return this.value
//   }
// }

// export class ReplaceTree<T extends OP> extends OpTree<T> { 
//     replaceTree: boolean = true
// }

// export class FillInOpTree<T extends OP> extends OpTree<T> {
//   constructor(private idx: number, val : INode, forest: OpTree<T>[]) {
//     super(val, forest)
//   }

//   handleConnection(n: OpTree<T>) : OpTree<T> {
//     this.forest.splice(this.idx, 0, n);
//     return this;
//   }
// }

// export class CustomConnectOpTree<T extends OP> extends OpTree<T> {
//   constructor(private handlef: (self: OpTree<T>, n: OpTree<T>) => OpTree<T>, val : INode, forest: OpTree<T>[]) {
//     super(val, forest)
//   }

//   handleConnection(n: OpTree<T>) : OpTree<T> {
//     return this.handlef(this, n);
//   }
// }

export interface NodeConnectFunc<T extends OP> {
 (inputs: Node<T>[]): Node<T>;
}

export class DisconnectedNode<T extends OP> {
  readonly _T!: T 
  constructor(private revConnect: NodeConnectFunc<T>){}
  connect(n: DisconnectedNode<T>) : DisconnectedNode<T> {
    return new DisconnectedNode(inputs => n.run([this.run(inputs)]))
  }
  run(inputs: Node<T>[]): Node<T> {
    return this.revConnect(inputs)
  }
  runT(){
    return this.run([])
  }
  out(): INode {
    return this.runT().node
  }
}

export class Node<T extends OP> {
  readonly _T!: T 
  constructor(public node: INode) {}
  connect(n: DisconnectedNode<T>): Node<T>{
    return n.run([this])
  }
  out(){ return this.node }
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