import { expect } from 'chai';[]
import { validateNode } from '../src/Validate'
import * as chain from '../src/Chain'

describe('Chain', () =>  {
  it('can make node', () => {
    const n = chain.chope("waveCHOP").out()
    expect(n).to.eql({ type: "CHOP", optype: "waveCHOP", params: {}, connections: []})
  })
  it('can chain nodes', () => {
    const n = chain.chope("waveCHOP").connect(chain.chope("audiodevinCHOP")).out()
    expect(n).to.eql({ type: "CHOP", optype: "audiodevinCHOP", params: {}, connections:[{ type: "CHOP", optype: "waveCHOP", params: {}, connections: []}]})
  })
  it('errors if js parses wrong', () =>{
    let r = Function('return (function(validate, c){ return validate(c.tope("nopeTOP").connect(c.chope("waveCHOP")).out()) })')()(validateNode, chain) as any
    console.log(r)
    expect(r).to.eql(["optype 'waveTOP' does not exist"])
  })
  it('errors if js parses wrong', () =>{
    let r = Function('return (function(validate, c){ return validate(c.tope("rectangleTOP").connect(c.chope("waveCHOP")).out()) })')()(validateNode, chain) as any
    console.log(r)
    expect(r).to.eql(["optype 'waveTOP' does not exist"])
  })
})