import { FBNode, FBTargetNode, INode, IParamAny, IParam, OP, ParamType, PulseAction, Paramable } from './Types'
import { option, none, isNone, Option } from 'fp-ts/lib/Option'
import { StrMap, strmap, lookup, pop } from 'fp-ts/lib/StrMap'
import { array, intersection, head } from 'fp-ts/lib/Array'
import deepEqual from 'deep-equal'
import { isString, isNumber } from 'util';
import { Guid } from 'guid-typescript'
import { flatten } from 'fp-ts/lib/Chain';
import { findFirst, elem, toArray } from 'fp-ts/lib/Foldable2v';
import { setoidString, Setoid } from 'fp-ts/lib/Setoid';
import { getFoldableWithIndexComposition } from 'fp-ts/lib/FoldableWithIndex';

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
    commands: ParsedAction[],
    unique?: string
}

type NodeDict = StrMap<StrMap<ParsedNode>>;

const nodedictout = (nd : NodeDict): string =>
    JSON.stringify(nd.reduceWithKey({}, (optype, out, nodes) => nodes.reduceWithKey(out, (k, outp, n) => outp[dictname(optype,k)] = n)));

function dictname(optype: string, opidx: string): string {
    return "/" + optype + "_" + opidx
}

export function nodeToJSON(node: INode) : string {
    return nodesToJSON([node]);
}

export function nodesToJSON(nodes: INode[]) : string {
    return nodedictout(nodes.reduce((acc, val) => addToNodeDict(acc, val), new StrMap({}) as StrMap<StrMap<ParsedNode>>));
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

    const setoidGuid: Setoid<Guid> = { equals: (a, b) => a.equals(b)}

    if (instanceofFBTargetNode(node)) {
        lookup("feedback" + node.family, nodedict)
            .chain(ns => findFirst(strmap)(ns, p => elem(setoidGuid, array)(p.fbid, node.selects)).map(fbn => {
                // TODO: this is really ugly but I can't be bothered to change it. 
                fbn.parameters["top"] = '"' + output[0] + "_" + output[1] + '"'
                fbn.fbid = undefined
            }));
    }

    return output;
}

function placeInNodeDict(nodedict: NodeDict, node: ParsedNode) : [NodeDict, string, string] {
    const nodesoftype = lookup(node.ty, nodedict);
    // TODO: Ew ew ew modifying state
    if(nodesoftype.isSome()) {
        let foundnode = 
            nodesoftype.chain(pns => head(toArray(strmap)(pns.mapWithKey((k, pn) => [k, pn] as [string, ParsedNode]).filterWithKey((i, [k, pn]) => deepEqual(pn, node)))))
                .map(op => op[0]);

        if(foundnode.isSome()) {
            return [node.ty, foundnode.value]
        }
    } else {
        nodedict[node.ty] = {};
    }

    const mapid: string = node.unique ? node.unique : nodedict[node.ty].length;
    nodedict[node.ty][mapid] = node; 
    return [node.ty, (nodedict[node.ty] - 1).toString()]
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