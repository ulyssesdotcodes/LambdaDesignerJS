import { expect } from 'chai';
import { INode, nodeToJSON } from '../src'

describe('Node', () => {
    it('can parse a single node', ()=> {
        const n : INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: {},
            connections: []
        }
        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"CHOP\",\"optype\":\"waveCHOP\",\"parameters\":{},\"connections\":[]}}")
    });
    it('can parse parameters', ()=>{
        const n: INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value: "1.0" }},
            connections: []
        }

        let parsed = nodeToJSON(n);

        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"CHOP\",\"optype\":\"waveCHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[]}}")
    })
    it('can parse children', ()=>{
        const c1: INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value: "1.0" }},
            connections: []
        }
        const c2: INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value: "1.0" }},
            connections: []
        }
        const n: INode = {
            family: "CHOP",
            type: "mathCHOP",
            params: {},
            connections: [c1, c2]
        }

        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"CHOP\",\"optype\":\"waveCHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[]},\"/waveCHOP_1\":{\"ty\":\"CHOP\",\"optype\":\"waveCHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[]},\"/mathCHOP_0\":{\"ty\":\"CHOP\",\"optype\":\"mathCHOP\",\"parameters\":{},\"connections\":[\"/waveCHOP_0\",\"/waveCHOP_1\"]}}")
    })
    it('can parse node params', ()=>{
        const c1: INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value: "1.0" }},
            connections: []
        }
        const n: INode = {
            family: "CHOP",
            type: "selectCHOP",
            params: {"chop": {type: "CHOP", value: c1}},
            connections: []
        }

        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"CHOP\",\"optype\":\"waveCHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[]},\"/selectCHOP_0\":{\"ty\":\"CHOP\",\"optype\":\"selectCHOP\",\"parameters\":{\"chop\":\"/waveCHOP_0\"},\"connections\":[]}}")
    })
})