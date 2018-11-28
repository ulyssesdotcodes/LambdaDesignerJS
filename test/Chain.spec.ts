import { expect } from 'chai';[]
import { validateNode } from '../src/Validate'
import * as chain from '../src/Chain'
import * as t from 'io-ts'
import { isLeft, isRight } from 'fp-ts/lib/Either';

describe('Chain', () =>  {
  it('can make node', () => {
    const n = chain.chope("wave").out()
    expect(n).to.eql({ family: "CHOP", type: "waveCHOP", params: {}, connections: []})
  })
  it('can chain nodes', () => {
    const n = chain.chope("wave").connect(chain.chope("audiodevin")).out()
    expect(n).to.eql({ family: "CHOP", type: "audiodevinCHOP", params: {}, connections:[{ family: "CHOP", type: "waveCHOP", params: {}, connections: []}]})
  })
  it('errors if js is invalid', () =>{
    let r = Function('return (function(validate, c){ return validate(c.tope("nope").connect(c.chope("math")).out()) })')()(
      (n) => validateNode(n).fold<any>(t.identity, t.identity), chain
      ) as any
    expect(r).to.eql(["expected 'CHOP' as 'mathCHOP' child but got 'TOP'"])
  })
  it('errors if connections length is wrong', () => {
    const n = validateNode(chain.chope("wave").connect(chain.chope("audiodevicein")).out())
    expect(isLeft(n)).to.be.true
    expect(n.fold<any>(t.identity, t.identity)).to.eql(["too many inputs for node 'audiodeviceinCHOP'"])
  })
  it('can make params', () => {
    const n = chain.chop("wave",{"rate" : chain.fp(1)}).out()
    expect(n).to.eql({ family: "CHOP", type: "waveCHOP", params: {"rate": { type: "float", value0: ["1"]}}, connections:[]})
  })
  it('can make xy params', () => {
    const n = chain.top("rectangle", {"size" : chain.xyp(chain.fp(0.5), chain.fp(0.5))}).out()
    expect(n).to.eql({ family: "TOP", type: "rectangleTOP", params: {"size": { type: "xy", value0: ["0.5"], value1:["0.5"]}}, connections:[]})
  })
  it('can make node params', () => {
    const n = chain.chop("select", {"chop" : chain.chopp(chain.chop("wave",{"rate" : chain.fp(1)}))}).out()
    let c1 = { family: "CHOP", type: "waveCHOP", params: {"rate": { type: "float", value0: ["1"]}}, connections:[]}
    expect(n).to.eql({ family: "CHOP", type: "selectCHOP", params: {"chop": { type: "CHOP", value0: ['\"', c1, '\"']}}, connections:[]})
  })
  it('can make op channel params', () => {
    const n = chain.chop("wave",{"rate" : chain.chan(chain.ip(0), chain.chope("wave"))}).out()
    let c1 = { family: "CHOP", type: "waveCHOP", params: {}, connections:[]}
    expect(n).to.eql({ family: "CHOP", type: "waveCHOP", params: {"rate": { type: "float", value0: ["op(\"", c1, "\")[", "0", "]"]}}, connections:[]})
  })
  it('can make string op channel params', () => {
    const n = chain.chop("wave",{"rate" : chain.chan(chain.sp("wah"), chain.chope("wave"))}).out()
    let c1 = { family: "CHOP", type: "waveCHOP", params: {}, connections:[]}
    expect(n).to.eql({ family: "CHOP", type: "waveCHOP", params: {"rate": { type: "float", value0: ["op(\"", c1, "\")[", '"wah"', "]"]}}, connections:[]})
  })
  it('can make chain multivalue params', () => {
    const c1 = chain.chop("wave", {})
    const n = chain.top("rectangle", {"size": chain.xyp(chain.chan(chain.ip(0), c1), chain.fp(0.2))}).out()
    let c1o = { family: "CHOP", type: "waveCHOP", params: {}, connections:[]}
    expect(n).to.eql({ family: "TOP", type: "rectangleTOP", params: {"size": { type: "xy", value0: ["op(\"", c1o, "\")[", "0", "]"], value1: ["0.2"]}}, connections:[]})
  })
  it('can operate on params', () => {
    const n = chain.chop("wave",{"rate" : chain.multp(chain.chan(chain.ip(0), chain.chope("wave")), chain.fp(1))}).out()
    let c1 = { family: "CHOP", type: "waveCHOP", params: {}, connections:[]}
    expect(n).to.eql({ family: "CHOP", type: "waveCHOP", params: {"rate": { type: "float", value0: ["( ", "op(\"", c1, "\")[", "0", "]", " * ", "1", " )"]}}, connections:[]})
  })
})