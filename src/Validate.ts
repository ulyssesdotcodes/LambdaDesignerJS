import { INode, Paramable, IParamAny, IParam, ParamType, OPTypes } from './Types'
import { Errors, Validation, string } from 'io-ts'
import * as parsedops from './parsedjs.json'
import { PathReporter } from 'io-ts/lib/PathReporter';
import { either, array, monad, foldable, applicative, functor, eitherT, traversable, pipeable } from 'fp-ts';
import { pipe } from 'fp-ts/lib/pipeable';

export function parseJSON(data: string) : either.Either<string, INode> {
    return pipe(
        either.tryCatch(
            () => JSON.parse(data), 
            e => (e instanceof Error ? e : new Error('couldn\'t parse json'))
        ),
        either.mapLeft(e => e.message),
        either.chain(d => validateNode(d))
    );
}

export function validateNode(node: INode) : either.Either<string, INode>{
  return pipe(
      [node],
      validateNodes,
      either.map(ns => ns[0])
  );
}

export function validateNodes(nodes: INode[]) : either.Either<string, INode[]> {
    return array.array.traverse(either.either)(nodes, n => pipe(
        either.right(n),
        either.chain(n => n.type in parsedops ? either.right(n) : either.left("type '" + n.type + "' does not exist")),
        either.chain(n => parsedops[n.type].type == n.family ? either.right(n) : either.left("type '" + n.family + "' is not correct for '" + n.type + "'")),
        either.chain(n => parsedops[n.type].type == n.family ? either.right(n) : either.left("type '" + n.family + "' is not correct for '" + n.type + "'")),
        either.chainFirst(n => testParams(n.type, n.params)),
        either.chain(n => n.connections.length < parsedops[n.type]['minInputs'] ? either.left("too few inputs for node '" + n.type + "'") : either.right(n)),
        either.chain(n => n.connections.length > parsedops[n.type]['maxInputs'] ? either.left("too many inputs for node '" + n.type + "'") : either.right(n)),
        either.chainFirst(n => array.array.traverse(either.either)(n.connections, c => testConnection(n.type, n.family, c)))
    ));
}

export function testConnection(type: string, family: string, connection:INode) : either.Either<string, INode> {
    return connection === undefined ? either.left("connection undefined for " + type) : 
        (connection.family == family || family == "COMP" || connection.family == "COMP" ? 
            validateNode(connection) : 
            either.left("expected '" + family + "' as '" + type + "' child but got '" + connection.family + "'"))
}
 
export function testParams(type: string, params: {[name: string] : Paramable }) : either.Either<string, {[name: string] : any}> {
    return array.array.traverse(either.either)(Object.entries(params), ([n, p]) => testParam(type, n, p))
}

function isIParamAny(param: Paramable): param is IParamAny {
    return (<IParamAny>param).type !== undefined
}

function testParam(type: string, name: string, param: Paramable): either.Either<string, IParamAny> {
    return pipe(
        either.right(param),
        either.chain(p => p === undefined ? 
            either.left("param " + name +" undefined in '" + type + "'") : either.right(p) 
        ),
        either.chain(p => (name in parsedops[type].pars) || type == "baseCOMP" ? 
            either.right(p) : either.left("param '" + name +"' does not exist for type '" + type + "'")
        ),
        either.chain(p => {
            if(typeof p === 'string') {
                let poptype = parsedops[type].pars[name].type
                if (poptype === "string"){
                    return either.right({type: "string", value0: [p.toString()]})
                } else if(poptype === "menu") {
                    let idx = parsedops[type].pars[name].menuitems.indexOf(p)
                    return idx >= 0 ? 
                        either.right({type: "menu", value0: [idx.toString()]}) : 
                        either.left("invalid menu parameter " + p + " for op " + type)
                } else {
                    return either.left("param type is not correct for " + type + "." + name)
                }
            } else if (typeof p === 'number' && (parsedops[type].pars[name].type == "number" || parsedops[type].pars[name].type == "float")){
                return either.right({type: parsedops[type].pars[name].type, value0: [p.toString()]})
            } else if(isIParamAny(p)) {
                return type != "baseCOMP" && (<IParamAny>p).type !== parsedops[type].pars[name].type && 
                    !(parsedops[type].pars[name].type == "OP" && OPTypes.indexOf((<IParamAny>p).type) > -1) ? 
                    either.left("param type is not correct for '" + type +"." + name + "'") : either.right(p)
            } else {
                return either.left("param type is not correct for '" + type +"." + name + "'")
            }
        }),
        either.chainFirst<string, IParamAny, INode[]>(p => pipe(
            p.value0,
            array.filter(val => !(typeof val === "string")),
            vs => array.array.traverse(either.either)(vs, validateNode)
        )))
}