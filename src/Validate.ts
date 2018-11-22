import { Node, INode, IParam } from './Types'
import { Either, left, right, tryCatch } from 'fp-ts/lib/Either'
import { Errors, Validation } from 'io-ts'
import * as parsedops from './parsedjs.json'
import { PathReporter } from 'io-ts/lib/PathReporter';

export function parseJSON(data: string) : Either<string[], INode> {
    return tryCatch(() => JSON.parse(data))
            .mapLeft(e => [e.message])
            .chain(d => validateNode(d))
}

export function validateNode(node: INode) : Either<string[], INode> {
    return Node.decode(node)
            .mapLeft(n => PathReporter.report(left(n)))
            .chain(n => n.optype in parsedops ? right(n) : left(["optype '" + n.optype + "' does not exist"]))
            .chain(n => parsedops[n.optype].type == n.type ? right(n) : left(["type '" + n.type + "' is not correct for '" + n.optype + "'"]))
            .chain(n => testParams(n.optype, n.params).map(_ => n))
            .chain(n => n.connections.map(c => c.type == n.type ? validateNode(c) : left(["expected '" + n.type + "' as '" + n.optype + "' child but got '" + c.type + "'"])))
}
 
export function testParams(optype: string, params: {[name: string] : IParam }) : Either<string[], {[name: string] : any}> {
    for(let param in params) {
        if(!(param in parsedops[optype].pars)){
            return left(["param '" + param +"' does not exist for optype '" + optype + "'"])
        } else if(params[param].type != parsedops[optype].pars[param].type) {
            return left(["param type is not correct for '" + optype +"." + param + "'"])
        } 
    }

    return right(params)
}

// export interface TOP {
//     kind: "TOP";
// } 

// export interface MAT {
//     kind: "MAT"
// }

// export interface CHOP {
//     kind: "CHOP"
// }

// export interface SOP {
//     kind: "SOP"
// }

// export interface COMP {
//     kind: "COMP"
// }

// export type OP = TOP | MAT | CHOP | SOP | COMP

// export class Node<OP> {
//     public params: ParamMap;
//     constructor(public readonly json: string) {
//         let input = JSON.parse(json);
//     }
// }

// export type ParamType = string | number | boolean | undefined | Node<OP>

// export interface ParamMap {
//     [name: string]: ParamType
// }