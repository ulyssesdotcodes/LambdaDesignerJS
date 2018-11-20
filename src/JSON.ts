import { INode, IParam } from './Types'

export function nodeToJSON(node: INode) : string {
    let nodedict = {};
    nodedict["/" + node.optype + "_0"] = { ty: node.optype, parameters: paramsToJSON(node.params), connections: []};
    return JSON.stringify(nodedict);
}

function paramsToJSON(params: {[key: string] : IParam}) : Object {
    let paramdict = {}
    for(let param in params){
        paramdict[param] = params[param].value;
    }
    return paramdict;
}