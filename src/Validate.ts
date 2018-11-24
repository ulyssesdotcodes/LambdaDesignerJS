import { Node, INode, IParam, ParamType } from './Types'
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
            .mapLeft<string[]>(n => PathReporter.report(left(n)))
            .chain<INode>(n => n.type in parsedops ? right(n) : left(["type '" + n.type + "' does not exist"]))
            .chain<INode>(n => parsedops[n.type].type == n.family ? right(n) : left(["type '" + n.family + "' is not correct for '" + n.type + "'"]))
            .chain<INode>(n => testParams(n.type, n.params).map(_ => n))
            .chain<INode>(n => n.connections.length < parsedops[n.type]['minInputs'] ? left(["too few inputs for node '" + n.type + "'"]) : right(n))
            .chain<INode>(n => n.connections.length > parsedops[n.type]['maxInputs'] ? left(["too many inputs for node '" + n.type + "'"]) : right(n))
            .chain<INode>(n => fpa.array.reduce<INode, Either<string[], INode>>(n.connections, right(n), (b, c) => 
                b.chain(_ => testConnection(n.type, n.family, c)).chain(_ => b)
            ))
}

export function testConnection(type: string, family: string, connection:INode) : Either<string[], INode> {
    return connection.family == family ? validateNode(connection) : left(["expected '" + family + "' as '" + type + "' child but got '" + connection.family + "'"])
}
 
export function testParams(type: string, params: Array<IParam<ParamType>>) : Either<string[], {[name: string] : any}> {
    for(let param of params) {
        if(!(param.name in parsedops[type].pars)){
            return left(["param '" + param.name +"' does not exist for type '" + type + "'"])
        } else if(param.type != parsedops[type].pars[param.name].type) {
            return left(["param type is not correct for '" + type +"." + param.name + "'"])
        } 
    }

    return right(params)
}