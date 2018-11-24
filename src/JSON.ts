import { INode, IParam, OP } from './Types'
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
        parameters: new StrMap(node.params).map<string>(p => {
            if(p.type == "CHOP" || p.type == "TOP"|| p.type == "OP"|| p.type == "DAT"|| p.type == "MAT"|| p.type == "SOP") {
                let paramnode = addNode(nodedict, p.value as INode)
                return dictname(paramnode[0], paramnode[1])
            }
            return p.value as string
        }).value,
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