import { expect } from 'chai';
import { INode, nodeToJSON } from '../src'

describe('JSON', () => {
    it('can parse a single node', ()=> {
        const n : INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: [],
            connections: []
        }
        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{},\"connections\":[]}}")
    });
    it('can parse parameters', ()=>{
        const n: INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: [{name: "rate", type: "float", value: ["1.0"] }],
            connections: []
        }

        let parsed = nodeToJSON(n);

        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[]}}")
    })
    it('can parse xy parameters', ()=>{
        const n: INode = {
            family: "TOP",
            type: "rectangleTOP",
            params: [{name: "size", type: "xy", value: ["0.5", "0.75"] }],
            connections: []
        }

        let parsed = nodeToJSON(n);

        expect(parsed).to.equal("{\"/rectangleTOP_0\":{\"ty\":\"rectangleTOP\",\"optype\":\"TOP\",\"parameters\":{\"sizex\":\"0.5\",\"sizey\":\"0.75\"},\"connections\":[]}}")
    })
    it('can parse children', ()=>{
        const c1: INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: [{name:"rate", type: "float", value: ["1.0"] }],
            connections: []
        }
        const c2: INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: [{name: "rate", type: "float", value: ["1.0"] }],
            connections: []
        }
        const n: INode = {
            family: "CHOP",
            type: "mathCHOP",
            params: [],
            connections: [c1, c2]
        }

        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[]},\"/waveCHOP_1\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[]},\"/mathCHOP_0\":{\"ty\":\"mathCHOP\",\"optype\":\"CHOP\",\"parameters\":{},\"connections\":[\"/waveCHOP_0\",\"/waveCHOP_1\"]}}")
    })
    it('can parse node params', ()=>{
        const c1: INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: [{name: "rate", type: "float", value: ["1.0"] }],
            connections: []
        }
        const n: INode = {
            family: "CHOP",
            type: "selectCHOP",
            params: [{name: "chop", type: "CHOP", value: [c1]}],
            connections: []
        }

        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[]},\"/selectCHOP_0\":{\"ty\":\"selectCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"chop\":\" waveCHOP_0\"},\"connections\":[]}}")
    })
})