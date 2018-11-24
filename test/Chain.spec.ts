import { expect } from 'chai';[]
import { validateNode } from '../src/Validate'
import * as chain from '../src/Chain'
import * as t from 'io-ts'
import { isLeft, isRight } from 'fp-ts/lib/Either';

describe('Chain', () =>  {
  it('can make node', () => {
    const n = chain.chope("waveCHOP").out()
    expect(n).to.eql({ family: "CHOP", type: "waveCHOP", params: [], connections: []})
  })
  it('can chain nodes', () => {
    const n = chain.chope("waveCHOP").connect(chain.chope("audiodevinCHOP")).out()
    expect(n).to.eql({ family: "CHOP", type: "audiodevinCHOP", params: [], connections:[{ family: "CHOP", type: "waveCHOP", params: [], connections: []}]})
  })
  it('errors if js is invalid', () =>{
    let r = Function('return (function(validate, c){ return validate(c.tope("nopeTOP").connect(c.chope("mathCHOP")).out()) })')()(
      (n) => validateNode(n).fold<any>(t.identity, t.identity), chain
      ) as any
    expect(r).to.eql(["expected 'CHOP' as 'mathCHOP' child but got 'TOP'"])
  })
  it('errors if connections length is wrong', () => {
    const n = validateNode(chain.chope("waveCHOP").connect(chain.chope("audiodeviceinCHOP")).out())
    expect(isLeft(n)).to.be.true
    expect(n.fold<any>(t.identity, t.identity)).to.eql(["too many inputs for node 'audiodeviceinCHOP'"])
  })
  it('can make params', () => {
    const n = chain.chop("waveCHOP", [chain.fp("rate", 1)]).out()
    expect(n).to.eql({ family: "CHOP", type: "waveCHOP", params: [{name: "rate", type: "float", value: ["1"]}], connections:[]})
  })
  it('can make xy params', () => {
    const n = chain.top("rectangleTOP", [chain.xyp("size", [chain.fp(undefined, 0.5), chain.fp(undefined, 0.5)])]).out()
    expect(n).to.eql({ family: "TOP", type: "rectangleTOP", params: [{name: "size", type: "xy", value: ["0.5", "0.5"]}], connections:[]})
  })
})