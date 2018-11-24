import { INode, IParam, OP, ParamType } from './Types'
import { option, none, isNone } from 'fp-ts/lib/Option'
import { StrMap, strmap } from 'fp-ts/lib/StrMap'
import { array } from 'fp-ts/lib/Array'
import deepEqual from 'deep-equal'

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
        parameters: array.reduce(node.params, {}, (acc, p) => addParameter(nodedict, acc, p)),
        connections: []
    }
    for(let n of node.connections) {
        let child = addNode(nodedict, n)
        parsednode.connections.push("/" + child[0] + "_" + child[1])
    }
    if(node.type in nodedict) {
        let nodes = nodedict[node.type];
        let foundnode = nodes.reduce((acc, n, idx) => isNone(acc) && deepEqual(n, parsednode) ? none : option.of(idx), none )
        if(foundnode.isSome()) {
            return [node.type, foundnode.value]
        }
    } else {
        nodedict[node.type] = []
    }

    nodedict[node.type].push(parsednode)
    return [node.type, nodedict[node.type].length - 1];
}

function addParameter(nodedict: NodeDict, parameters: {[name: string]: string}, param: IParam<ParamType>): {[name: string]: string} {
    if(param.type == "CHOP" || param.type == "TOP"|| param.type == "OP"|| param.type == "DAT"|| param.type == "MAT"|| param.type == "SOP") {
        let paramnode = array.reduce(param.value, "", (acc, p) => {
            let addednode = addNode(nodedict, p as INode)
            return acc + " " + addednode[0] + "_" + addednode[1]
        })
        parameters[param.name] = paramnode
        return parameters
    } else if (param.type == "xy") {
        parameters[param.name + "x"] = param.value[0] as string
        parameters[param.name + "y"] = param.value[1] as string
    } else if (param.type == "uv") {
        parameters[param.name + "u"] = param.value[0] as string
        parameters[param.name + "v"] = param.value[1] as string
    } else if (param.type == "rgb") {
        parameters[param.name + "r"] = param.value[0] as string
        parameters[param.name + "g"] = param.value[1] as string
        parameters[param.name + "b"] = param.value[2] as string
    } else if (param.type == "xyz") {
        parameters[param.name + "x"] = param.value[0] as string
        parameters[param.name + "y"] = param.value[1] as string
        parameters[param.name + "z"] = param.value[2] as string
    } else if (param.type == "rgba") {
        parameters[param.name + "r"] = param.value[0] as string
        parameters[param.name + "g"] = param.value[1] as string
        parameters[param.name + "b"] = param.value[2] as string
        parameters[param.name + "a"] = param.value[3] as string
    } else {
        parameters[param.name] = param.value[0] as string
    }
    return parameters
}