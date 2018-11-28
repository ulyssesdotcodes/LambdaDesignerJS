import { INode, IParamAny, IParam, OP, ParamType } from './Types'
import { option, none, isNone } from 'fp-ts/lib/Option'
import { StrMap, strmap } from 'fp-ts/lib/StrMap'
import { array } from 'fp-ts/lib/Array'
import deepEqual from 'deep-equal'
import { isString } from 'util';

interface ParsedNode {
    optype: OP,
    ty: string,
    parameters: {[name: string] : string },
    connections: Array<string>
}

type NodeDict = { [optype: string] : Array<ParsedNode>}

function nodedictout(nd : NodeDict): string {
    let ops : {[opname: string] : ParsedNode} = {}
    for(let optype in nd) {
        nd[optype].forEach((v, idx, arr) => ops[dictname(optype, idx)] = v)
    }
    return JSON.stringify(ops)
}

function dictname(optype: string, opidx: number): string {
    return "/" + optype + "_" + opidx
}

export function nodeToJSON(node: INode) : string {
    let nodedict : NodeDict = {};
    addNode(nodedict, node)
    return nodedictout(nodedict);
}

function addNode(nodedict: NodeDict, node: INode) : [string, number] {
    let parsednode: ParsedNode = {
        ty: node.type,
        optype: node.family,
        parameters: array.reduce(Object.keys(node.params), {}, (acc, p) => addParameter(nodedict, acc, p, node.params[p])),
        connections: []
    }
    for(let n of node.connections) {
        let child = addNode(nodedict, n)
        parsednode.connections.push("/" + child[0] + "_" + child[1])
    }
    if(node.type in nodedict) {
        let nodes = nodedict[node.type];
        let foundnode = nodes.reduce((acc, n, idx) => isNone(acc) && deepEqual(n, parsednode) ? option.of(idx) : none, none )
        if(foundnode.isSome()) {
            return [node.type, foundnode.value]
        }
    } else {
        nodedict[node.type] = []
    }

    nodedict[node.type].push(parsednode)
    return [node.type, nodedict[node.type].length - 1];
}

function addParameter(nodedict: NodeDict, parameters: {[name: string]: string},
     name: string, param: IParamAny): {[name: string]: string} {
    if (param.type == "xy") {
        parameters[name + "x"] = parseParamValue(nodedict, param.value0)
        parameters[name + "y"] = parseParamValue(nodedict, param.value1)
    } else if (param.type == "uv") {
        parameters[name + "u"] = parseParamValue(nodedict, param.value0)
        parameters[name + "v"] = parseParamValue(nodedict, param.value1)
    } else if (param.type == "rgb") {
        parameters[name + "r"] = parseParamValue(nodedict, param.value0)
        parameters[name + "g"] = parseParamValue(nodedict, param.value1)
        parameters[name + "b"] = parseParamValue(nodedict, param.value2)
    } else if (param.type == "xyz") {
        parameters[name + "x"] = parseParamValue(nodedict, param.value0)
        parameters[name + "y"] = parseParamValue(nodedict, param.value1)
        parameters[name + "z"] = parseParamValue(nodedict, param.value2)
    } else if (param.type == "rgba") {
        parameters[name + "r"] = parseParamValue(nodedict, param.value0)
        parameters[name + "g"] = parseParamValue(nodedict, param.value1)
        parameters[name + "b"] = parseParamValue(nodedict, param.value2)
        parameters[name + "a"] = parseParamValue(nodedict, param.value3)
    } else {
        parameters[name] = parseParamValue(nodedict, param.value0);
    }
    return parameters
}

function parseParamValue(nodedict: NodeDict, value: Array<string | INode>) {
    return array.reduce<string | INode, string>(value, "", (acc, p) => {
        if (isString(p)) {
            return acc + p;
        } else {
            let addednode = addNode(nodedict, p as INode)
            return acc + addednode[0] + "_" + addednode[1]
        }
    })
}