"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const src_1 = require("../src");
const Either_1 = require("fp-ts/lib/Either");
const t = require("io-ts");
describe('Validate', () => {
    it('can be validated', () => {
        let jsonn = JSON.stringify({
            type: "CHOP",
            optype: "waveCHOP",
            params: {}
        });
        const n = src_1.parseJSON(jsonn);
        chai_1.expect(Either_1.isRight(n)).to.be.true;
        chai_1.expect(n.map(n => n.optype).fold(t.identity, t.identity)).to.equal("waveCHOP");
    });
    it('errors if invalid', () => {
        let jsonn = JSON.stringify({
            type: "ha",
            optype: 2,
            params: "test"
        });
        const n = src_1.parseJSON(jsonn);
        chai_1.expect(Either_1.isLeft(n)).to.be.true;
        chai_1.expect(n.mapLeft(n => n[0]).fold(t.identity, t.identity)).to.equal("Invalid value \"ha\" supplied to : Node/type: (\"TOP\" | \"CHOP\" | \"MAT\" | \"SOP\" | \"COMP\")/0: \"TOP\"");
    });
    it('errors if optype doesn\'t exist', () => {
        let jsonn = JSON.stringify({
            type: "CHOP",
            optype: "notaCHOP",
            params: {}
        });
        const n = src_1.parseJSON(jsonn);
        chai_1.expect(Either_1.isLeft(n)).to.be.true;
        chai_1.expect(n.mapLeft(n => n[0]).fold(t.identity, t.identity)).to.equal("optype 'notaCHOP' does not exist");
    });
    it('errors if type is incorrect', () => {
        let jsonn = JSON.stringify({
            type: "TOP",
            optype: "waveCHOP",
            params: {}
        });
        const n = src_1.parseJSON(jsonn);
        chai_1.expect(Either_1.isLeft(n)).to.be.true;
        chai_1.expect(n.mapLeft(n => n[0]).fold(t.identity, t.identity)).to.equal("type 'TOP' is not correct for 'waveCHOP'");
    });
    it('can have params', () => {
        let jsonn = JSON.stringify({
            type: "CHOP",
            optype: "waveCHOP",
            params: { "rate": { type: "float", value: "1.0" } }
        });
        const n = src_1.parseJSON(jsonn);
        chai_1.expect(Either_1.isRight(n)).to.be.true;
        chai_1.expect(n.map(n => n.params.rate.value).fold(t.identity, t.identity)).to.equal("1.0");
    });
    it('errors if param doesn\'t exist', () => {
        let jsonn = JSON.stringify({
            type: "CHOP",
            optype: "waveCHOP",
            params: { "notaparam": { type: "string", value: "nope" } }
        });
        const n = src_1.parseJSON(jsonn);
        chai_1.expect(Either_1.isLeft(n)).to.be.true;
        chai_1.expect(n.mapLeft(n => n[0]).fold(t.identity, t.identity)).to.equal("param 'notaparam' does not exist for optype 'waveCHOP'");
    });
    it('errors if param is the wrong type', () => {
        let jsonn = JSON.stringify({
            type: "CHOP",
            optype: "waveCHOP",
            params: { "rate": { type: "string", value: "1.0" } }
        });
        const n = src_1.parseJSON(jsonn);
        chai_1.expect(Either_1.isLeft(n)).to.be.true;
        chai_1.expect(n.mapLeft(n => n[0]).fold(t.identity, t.identity)).to.equal("param type is not correct for 'waveCHOP.rate'");
    });
});
//# sourceMappingURL=Validate.spec.js.map