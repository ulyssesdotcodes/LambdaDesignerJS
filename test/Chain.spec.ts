import { expect } from 'chai';[]
import { validateNode } from '../src/Validate'
import * as chain from '../src/Chain'
import * as t from 'io-ts'
import { isLeft } from 'fp-ts/lib/Either';

describe('Chain', () =>  {
  it('can make node', () => {
    const n = chain.chope("waveCHOP").out()
    expect(n).to.eql({ type: "CHOP", optype: "waveCHOP", params: {}, connections: []})
  })
  it('can chain nodes', () => {
    const n = chain.chope("waveCHOP").connect(chain.chope("audiodevinCHOP")).out()
    expect(n).to.eql({ type: "CHOP", optype: "audiodevinCHOP", params: {}, connections:[{ type: "CHOP", optype: "waveCHOP", params: {}, connections: []}]})
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
})