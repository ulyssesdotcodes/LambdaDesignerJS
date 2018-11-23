import { INode, IParam, OP } from './Types'
import de =  require('deep-equal')
import { option, none, isNone } from 'fp-ts/lib/Option'

interface ParsedNode {
    ty: OP,
    optype: string,
    parameters: string,
    connections: Array<[string, number]>
}

type NodeDict = { [optype: string] : Array<ParsedNode>}

function nodedictout(nd : NodeDict): string {
    let ops : {[opname: string] : string} = {}
    for(let optype in nd) {

    }
    return JSON.stringify(nd)
}

export function nodeToJSON(node: INode) : string {
    let nodedict : NodeDict = {};
    addNode(nodedict, node)
    return nodedictout(nodedict);
}

function addNode(nodedict: NodeDict, node: INode) : [string, number] {
    let parsednode: ParsedNode = {
        ty: node.type,
        optype: node.optype,
        parameters: JSON.stringify(node.params),
        connections: []
    }
    for(let n of node.connections) {
        parsednode.connections.push(addNode(nodedict, n))
    }
    if(node.optype in nodedict) {
        let nodes = nodedict[node.optype];
        let foundnode = nodes.reduce((acc, n, idx) => isNone(acc) && de(n, parsednode) ? none : option.of(idx), none )
        if(foundnode.isSome()) {
            return [node.optype, foundnode.value]
        }
    } else {
        nodedict[node.optype] = []
    }

    nodedict[node.optype].push(parsednode)
    return [node.optype, nodedict[node.optype].length - 1];
}


function paramsToJSON(params: {[key: string] : IParam}) : Object {
    let paramdict = {}
    for(let param in params){
        paramdict[param] = params[param].value;
    }
    return paramdict;
}