import { expect } from 'chai';
import { INode, nodeToJSON } from '../src'

describe('Node', () => {
    it('can parse a single node', ()=> {
        const n : INode = {
            type: "CHOP",
            optype: "waveCHOP",
            params: {}
        }
        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"waveCHOP_0\":{\"ty\":\"waveCHOP\",\"parameters\":{}}}")
    });
    it('can parse parameters', ()=>{
        const n: INode = {
            type: "CHOP",
            optype: "waveCHOP",
            params: {"rate": { type: "float", value: "1.0" }}
        }

        let parsed = nodeToJSON(n);

        expect(parsed).to.equal("{\"waveCHOP_0\":{\"ty\":\"waveCHOP\",\"parameters\":{\"rate\":\"1.0\"}}}")
    })
})