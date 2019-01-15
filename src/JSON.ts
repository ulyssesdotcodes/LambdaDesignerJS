import { FBNode, FBTargetNode, INode, IParamAny, IParam, OP, ParamType, PulseAction } from './Types'
import { option, none, isNone } from 'fp-ts/lib/Option'
import { StrMap, strmap } from 'fp-ts/lib/StrMap'
import { array } from 'fp-ts/lib/Array'
import deepEqual from 'deep-equal'
import { isString } from 'util';
import { Guid } from 'guid-typescript'

interface ParsedAction { 
    command: string, 
    args: (string | number)[]
}

interface ParsedNode {
    optype: OP,
    ty: string,
    parameters: {[name: string] : string },
    connections: Array<string>,
    fbid?: Guid
    text?: string,
    commands: ParsedAction[]
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
    return nodesToJSON([node]);
}

export function nodesToJSON(nodes: INode[]) : string {
    return nodedictout(nodes.reduce((acc, val) => addToNodeDict(acc, val), {}));
}

function instanceofFBTargetNode(node: INode): node is FBTargetNode {
    return 'selects' in node;
}

function instanceofFBNode(node: INode): node is FBNode {
    return 'id' in node;
}

function addToNodeDict(nodedict: NodeDict, node: INode) : NodeDict {
    addNode(nodedict, node);
    return nodedict
}

function addNode(nodedict: NodeDict, node: INode) : [string, number] {
    let parsednode: ParsedNode = {
        ty: node.type,
        optype: node.family,
        parameters: array.reduce(Object.keys(node.params), {}, (acc, p) => addParameter(nodedict, acc, p, node.params[p])),
        connections: [],
        commands: node.actions.map(addAction(nodedict))
    }

    if(instanceofFBNode(node)) {
        parsednode.fbid = node.id
    }

    for(let n of node.connections) {
        let child = addNode(nodedict, n)
        parsednode.connections.push("/" + child[0] + "_" + child[1])
    }

    let output : [string, number]= placeInNodeDict(nodedict, parsednode)

    if (instanceofFBTargetNode(node)) {
        for(let fbn of nodedict["feedback" + node.family]) {
            for(let id of node.selects) {
                if(fbn.fbid !== undefined && fbn.fbid.equals(id)) {
                    fbn.parameters["top"] = '"' + output[0] + "_" + output[1] + '"'
                    fbn.fbid = undefined
                }
            }
        }
    }

    return output;
}

function placeInNodeDict(nodedict: NodeDict, node: ParsedNode) : [string, number] {
    if(node.ty in nodedict) {
        let nodes = nodedict[node.ty];
        let foundnode = nodes.reduce((acc, n, idx) => isNone(acc) && deepEqual(n, node) ? option.of(idx) : acc, none )
        if(foundnode.isSome()) {
            return [node.ty, foundnode.value]
        }
    } else {
        nodedict[node.ty] = []
    }

    nodedict[node.ty].push(node)
    return [node.ty, nodedict[node.ty].length - 1]
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
    } else if (param.type == "xyzw") {
        parameters[name + "x"] = parseParamValue(nodedict, param.value0)
        parameters[name + "y"] = parseParamValue(nodedict, param.value1)
        parameters[name + "z"] = parseParamValue(nodedict, param.value2)
        parameters[name + "w"] = parseParamValue(nodedict, param.value3)
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

function addAction(nodedict: NodeDict) {
    return (action: PulseAction) : ParsedAction => {
        return {
            command: action.type,
            args: [action.param, action.val, action.frames]
        }
    }
}

function parseParamValue(nodedict: NodeDict, value: Array<string | INode>) : string | undefined {
    let val = array.reduce<string | INode, string | undefined>(value, "", (acc, p) => {
        if (isString(p)) {
            return acc + p;
        } else {
            let addednode = addNode(nodedict, p as INode)
            return acc + addednode[0] + "_" + addednode[1]
        }
    });
    return val == "" ? undefined : val;
}