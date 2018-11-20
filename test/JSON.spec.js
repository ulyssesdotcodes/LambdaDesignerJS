"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const src_1 = require("../src");
describe('Node', () => {
    it('can parse a single node', () => {
        const n = {
            type: "CHOP",
            optype: "waveCHOP",
            params: {}
        };
        let parsed = src_1.nodeToJSON(n);
        chai_1.expect(parsed).to.equal("{\"waveCHOP_0\":{\"ty\":\"waveCHOP\",\"parameters\":{}}}");
    });
    it('can parse parameters', () => {
        const n = {
            type: "CHOP",
            optype: "waveCHOP",
            params: { "rate": { type: "float", value: "1.0" } }
        };
        let parsed = src_1.nodeToJSON(n);
        chai_1.expect(parsed).to.equal("{\"waveCHOP_0\":{\"ty\":\"waveCHOP\",\"parameters\":{\"rate\":\"1.0\"}}}");
    });
});
//# sourceMappingURL=JSON.spec.js.map