import { expect } from 'chai';
import { parseJSON } from '../src'
import { isRight, right, isLeft, left } from 'fp-ts/lib/Either'
import * as t from 'io-ts'

describe('Validate', () => {
    it('errors if invalid json', () => {
        const n = parseJSON(``)
        expect(isLeft(n)).to.be.true
        expect(n.mapLeft(n => n[0]).fold<any>(t.identity, t.identity)).to.equal("Unexpected end of JSON input")
    });
    it('can be validated', ()=> {
        let jsonn = JSON.stringify({
            type: "CHOP",
            optype: "waveCHOP",
            params: {},
            connections: []
        })
        const n = parseJSON(jsonn)
        expect(isRight(n)).to.be.true
        expect(n.map(n => n.optype).fold<any>(t.identity, t.identity)).to.equal("waveCHOP")
    });
    it('errors if invalid', () => {
        let jsonn = JSON.stringify({
            type: "ha",
            optype: 2,
            params: "test",
            connections: []
        })
        const n = parseJSON(jsonn)
        expect(isLeft(n)).to.be.true
        expect(n.mapLeft(n => n[0]).fold<any>(t.identity, t.identity)).to.equal("Invalid value \"ha\" supplied to : Node/type: (\"TOP\" | \"CHOP\" | \"MAT\" | \"SOP\" | \"COMP\")/0: \"TOP\"")
    });
    it('errors if optype doesn\'t exist', () =>{
        let jsonn = JSON.stringify({
            type: "CHOP",
            optype: "notaCHOP",
            params: {},
            connections: []
        })
        const n = parseJSON(jsonn)
        expect(isLeft(n)).to.be.true
        expect(n.mapLeft(n => n[0]).fold<any>(t.identity, t.identity)).to.equal("optype 'notaCHOP' does not exist")
    });
    it('errors if type is incorrect', () => {
        let jsonn = JSON.stringify({
            type: "TOP",
            optype: "waveCHOP",
            params: {},
            connections: []
        })
        const n = parseJSON(jsonn)
        expect(isLeft(n)).to.be.true
        expect(n.mapLeft(n => n[0]).fold<any>(t.identity, t.identity)).to.equal("type 'TOP' is not correct for 'waveCHOP'")
    });
    it('can have params', ()=> {
        let jsonn = JSON.stringify({
            type: "CHOP",
            optype: "waveCHOP",
            params: {"rate": {type: "float", value: "1.0"}},
            connections: []
        })
        const n = parseJSON(jsonn)
        expect(isRight(n)).to.be.true
        expect(n.map(n => n.params.rate.value).fold<any>(t.identity, t.identity)).to.equal("1.0")
    });
    it('errors if param doesn\'t exist', () =>{
        let jsonn = JSON.stringify({
            type: "CHOP",
            optype: "waveCHOP",
            params: {"notaparam": { type: "string", value: "nope" } },
            connections: []
        })
        const n = parseJSON(jsonn)
        expect(isLeft(n)).to.be.true
        expect(n.mapLeft(n => n[0]).fold<any>(t.identity, t.identity)).to.equal("param 'notaparam' does not exist for optype 'waveCHOP'")
    });
    it('errors if param is the wrong type', () =>{
        let jsonn = JSON.stringify({
            type: "CHOP",
            optype: "waveCHOP",
            params: {"rate": {type: "string", value: "1.0"} },
            connections: []
        })
        const n = parseJSON(jsonn)
        expect(isLeft(n)).to.be.true
        expect(n.mapLeft(n => n[0]).fold<any>(t.identity, t.identity)).to.equal("param type is not correct for 'waveCHOP.rate'")
    });
})