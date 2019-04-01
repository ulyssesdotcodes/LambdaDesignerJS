import { FBNode, FBTargetNode, INode, IParamAny, IParam, OP, ParamType, PulseAction, Paramable } from './Types'
import { option, none, isNone, Option } from 'fp-ts/lib/Option'
import { StrMap, strmap } from 'fp-ts/lib/StrMap'
import { array } from 'fp-ts/lib/Array'
import deepEqual from 'deep-equal'
import { isString, isNumber } from 'util';
import { Guid } from 'guid-typescript'

interface ParsedAction { 
    command: string, 
    delay: number,
    args: (string | number)[]
}

interface ParsedNode {
    optype: OP,
    ty: string,
    parameters: {[name: string] : string },
    connections: Array<string>,
    fbid?: Guid
    text?: string,
    commands: ParsedAction[],
    unique?: string
}

type NodeDict = { [optype: string] : { [key: string]: ParsedNode }}

function nodedictout(nd : NodeDict): string {
    let ops : {[opname: string] : ParsedNode} = {}
    for(let optype in nd) {
        Object.entries(nd[optype]).forEach((v, idx) => ops[dictname(optype, v[0])] = v[1])
    }
    return JSON.stringify(ops)
}

function dictname(optype: string, opidx: string): string {
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

function addNode(nodedict: NodeDict, node: INode) : [string, string] {
    let parsednode: ParsedNode = Object.assign({
        ty: node.type,
        optype: node.family,
        parameters: array.reduce(Object.keys(node.params), {}, (acc, p) => addParameter(nodedict, acc, p, node.params[p])),
        connections: [],
        commands: node.actions.map(addAction(nodedict)),
    }, node.text.isNone() ? {} : { text: node.text.value }, node.unique.isNone() ? {} : { unique: node.unique.value });

    if(instanceofFBNode(node)) {
        parsednode.fbid = node.id
    }

    for(let n of node.connections) {
        let child = addNode(nodedict, n)
        parsednode.connections.push("/" + child[0] + "_" + child[1])
    }

    let output : [string, string]= placeInNodeDict(nodedict, parsednode)

    if (instanceofFBTargetNode(node)) {
        for(let fbn of Object.values(nodedict["feedback" + node.family])) {
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

function placeInNodeDict(nodedict: NodeDict, node: ParsedNode) : [string, string] {
    if(node.ty in nodedict) {
        let nodes = nodedict[node.ty];
        let foundnode = Object.entries(nodes).reduce((acc, n) => isNone(acc) && deepEqual(n[1], node) ? option.of(n[0]) : acc, none )
        if (foundnode.isSome()) {
            return [node.ty, foundnode.value]
        }
    } else {
        nodedict[node.ty] = {}
    }

    const nodeid = node.unique ? node.unique : (Object.keys(nodedict[node.ty]).length).toString();
    nodedict[node.ty][nodeid] = node
    return [node.ty, nodeid]
}

function addParameter(nodedict: NodeDict, parameters: {[name: string]: string},
     name: string, param: Paramable): {[name: string]: string} {
    if(isString(param)) {
        parameters[name] = param
    } else if(isNumber(param)) {
        parameters[name] = param.toString()
    }
    else if (param.type == "xy") {
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
            delay: action.delay,
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