import { expect } from 'chai';
import { INode, nodeToJSON } from '../src'

describe('Node', () => {
    it('can parse a single node', ()=> {
        const n : INode = {
            type: "CHOP",
            optype: "waveCHOP",
            params: {},
            connections: []
        }
        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"parameters\":{},\"connections\":[]}}")
    });
    it('can parse parameters', ()=>{
        const n: INode = {
            type: "CHOP",
            optype: "waveCHOP",
            params: {"rate": { type: "float", value: "1.0" }},
            connections: []
        }

        let parsed = nodeToJSON(n);

        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[]}}")
    })
    it('can parse parameters', ()=>{
        const c1: INode = {
            type: "CHOP",
            optype: "waveCHOP",
            params: {"rate": { type: "float", value: "1.0" }},
            connections: []
        }
        const c2: INode = {
            type: "CHOP",
            optype: "waveCHOP",
            params: {"rate": { type: "float", value: "1.0" }},
            connections: []
        }
        const n: INode = {
            type: "CHOP",
            optype: "mathCHOP",
            params: {},
            connections: [c1, c2]
        }

        let parsed = nodeToJSON(n);
        console.log(parsed)
    })
})