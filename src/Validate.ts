import { Node, INode, IParam } from './Types'
import { Either, left, right, tryCatch } from 'fp-ts/lib/Either'
import { Errors, Validation } from 'io-ts'
import * as parsedops from './parsedjs.json'
import { PathReporter } from 'io-ts/lib/PathReporter';
import * as fpa from 'fp-ts/lib/Array'

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
            .chain(n => n.connections.length < parsedops[n.optype]['minInputs'] ? left(["too few inputs for node '" + n.optype + "'"]) : right(n))
            .chain(n => n.connections.length > parsedops[n.optype]['maxInputs'] ? left(["too many inputs for node '" + n.optype + "'"]) : right(n))
            .chain(n => fpa.array.reduce<INode, Either<string[], INode>>(n.connections, right(n), (b, c) => 
                b.chain(_ => testConnection(n.type, n.optype, c)).chain(_ => b)
            ))
}

export function testConnection(type: string, optype: string, connection:INode) : Either<string[], INode> {
    return connection.type == type ? validateNode(connection) : left(["expected '" + type + "' as '" + optype + "' child but got '" + connection.type + "'"])
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