import { INode, IParamAny, IParam, ParamType, OPTypes } from './Types'
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
    return right<Errors, INode>(node)
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
    return connection === undefined ? left(["connection undefined for " + type]) : 
        (connection.family == family || family == "COMP" || connection.family == "COMP" ? validateNode(connection) : left(["expected '" + family + "' as '" + type + "' child but got '" + connection.family + "'"]))
}
 
export function testParams(type: string, params: {[name: string] : IParamAny }) : Either<string[], {[name: string] : any}> {
    return fpa.array.reduce(Object.keys(params), right(params), (acc, p) => 
        acc.chain(c => testParam(type, p, params[p]).map(_ => c))
    )
}

function testParam(type: string, name: string, param: IParamAny): Either<string[], IParamAny> {
    return right<string[], IParamAny>(param)
        .chain(p => p === undefined ? 
            left<string[], IParamAny>(["param unefined in '" + type + "'"]) : right<string[], IParamAny>(p) 
        )
        .chain(p => (name in parsedops[type].pars) || type == "baseCOMP" ? 
            right<string[], IParamAny>(p) : left<string[], IParamAny>(["param '" + name +"' does not exist for type '" + type + "'"])
        )
        .chain(p => type != "baseCOMP" && param.type !== parsedops[type].pars[name].type && !(parsedops[type].pars[name].type == "OP" && OPTypes.indexOf(param.type) > -1) ? 
            left<string[], IParamAny>(["param type is not correct for '" + type +"." + name + "'"]) : right<string[], IParamAny>(p)
        )
        .chain(p => fpa.array.reduce(p.value0, right(p), (acc, b) => acc.chain(c => typeof b === "string" ? right(p) : validateNode(b as INode).map(_ => c))))
}