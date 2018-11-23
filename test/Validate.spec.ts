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
    it('can have children', ()=> {
        let child = {
            type: "TOP",
            optype: "rectangleTOP",
            params: {},
            connections: []
        }
        let child2 = {
            type: "TOP",
            optype: "circleTOP",
            params: {},
            connections: []
        }
        let comp = {
            type: "TOP",
            optype: "compositeTOP",
            params: {"operand": {type: "menu", value: "31"} },
            connections: [child, child2]
        }
        let jsonn = JSON.stringify({
            type: "TOP",
            optype: "blurTOP",
            params: {},
            connections: [comp ]
        })
        const n = parseJSON(jsonn)
        expect(isRight(n)).to.be.true
        expect(n.map(n => n.connections[0].connections[1].optype).fold<any>(t.identity, t.identity)).to.equal("circleTOP")
    });
    it('errors if child is invalid', () =>{
        let child = {
            type: "TOP",
            optype: "waveTOP",
            params: {}
        }
        let child2 = {
            type: "TOP",
            optype: "waveTOP",
            params: {},
            connections: [child]
        }
        let jsonn = JSON.stringify({
            type: "CHOP",
            optype: "waveCHOP",
            params: {},
            connections: [child2]
        })
        const n = parseJSON(jsonn)
        expect(isLeft(n)).to.be.true
        expect(n.mapLeft(n => n[0]).fold<any>(t.identity, t.identity)).to.equal("Invalid value undefined supplied to : Node/connections: Array<Node>/0: Node/connections: Array<Node>/0: Node/connections: Array<Node>")
    });
    it('errors if child type is invalid', () =>{
        let child = {
            type: "TOP",
            optype: "blurTOP",
            params: {},
            connections: []
        }
        let jsonn = JSON.stringify({
            type: "CHOP",
            optype: "waveCHOP",
            params: {},
            connections: [child]
        })
        const n = parseJSON(jsonn)
        expect(isLeft(n)).to.be.true
        expect(n.mapLeft(n => n[0]).fold<any>(t.identity, t.identity)).to.equal("too many inputs for node 'waveCHOP'")
    });
    it('errors if second child is invalid', () =>{
        let child = {
            type: "CHOP",
            optype: "waveCHOP",
            params: {},
            connections: []
        }
        let child2 = {
            type: "TOP",
            optype: "blurTOP",
            params: {},
            connections: []
        }
        let jsonn = JSON.stringify({
            type: "CHOP",
            optype: "waveCHOP",
            params: {"rate": {type: "string", value: "1.0"} },
            connections: [child, child2]
        })
        const n = parseJSON(jsonn)
        expect(isLeft(n)).to.be.true
        expect(n.mapLeft(n => n[0]).fold<any>(t.identity, t.identity)).to.equal("param type is not correct for 'waveCHOP.rate'")
    });
    it('errors if wrong number of children', () =>{
        let child = {
            type: "CHOP",
            optype: "waveCHOP",
            params: {},
            connections: []
        }
        let jsonn = JSON.stringify({
            type: "CHOP",
            optype: "waveCHOP",
            params: {},
            connections: [child]
        })
        const n = parseJSON(jsonn)
        expect(isLeft(n)).to.be.true
        expect(n.mapLeft(n => n[0]).fold<any>(t.identity, t.identity)).to.equal("too many inputs for node 'waveCHOP'")
    });
})