import * as t from 'io-ts'
import * as fpt from 'fp-ts/lib/Tree'
import { Guid } from 'guid-typescript'
import { connect } from 'http2';
import { Option } from 'fp-ts/lib/Option';

export type ParamType = "number" | "float" | "string" | "toggle" | "menu" | "TOP" | "DAT" | "MAT" | "CHOP" | "COMP" | "SOP" | "OP" | "pulse"

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

export type IParamAny = IParam<ParamType> | IParam2<ParamType2> | IParam3<ParamType3> | IParam4<ParamType4>
export type Paramable =  IParamAny | string | number

export type OP = "TOP" | "CHOP" | "MAT" | "SOP" | "COMP" | "DAT"
export const OPTypes = ["TOP", "CHOP", "MAT", "SOP", "COMP", "DAT"]


export interface PulseAction {
  type: "pulse",
  param: string,
  val: number,
  frames: number,
  delay: number
}

export interface INode {
    family: OP
    type: string
    params: { [name: string] : Paramable }
    connections: Array<INode>
    text: Option<string>,
    actions: PulseAction[],
    unique: Option<string>
}

export interface NodeConnectFunc<T extends OP> {
 (inputs: Node<T>[]): Node<T>;
}

export class DisconnectedNode<T extends OP> {
  readonly _T!: T 
  constructor(private revConnect: NodeConnectFunc<T>){}
  connect(n: DisconnectedNode<T>) : DisconnectedNode<T> {
    return new DisconnectedNode(inputs => n.run([this.run(inputs)]))
  }
  c(n: DisconnectedNode<T>) : DisconnectedNode<T> {
    return this.connect(n);
  }
  run(inputs: (Node<T>| DisconnectedNode<T>)[]): Node<T> {
    return this.revConnect(inputs.map(n => n.runT()))
  }
  runT(): Node<T>{
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
  c(n: DisconnectedNode<T>): Node<T>{
    return this.connect(n);
  }
  runT(): Node<T>{
    return this;
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