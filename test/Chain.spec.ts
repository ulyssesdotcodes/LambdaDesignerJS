import { expect } from 'chai';[]
import { validateNode } from '../src/Validate'
import * as chain from '../src/Chain'
import * as t from 'io-ts'
import { isLeft, isRight } from 'fp-ts/lib/Either';
import { FBNode, FBTargetNode } from '../src/Types'

describe('Chain', () =>  {
  it('can make node', () => {
    const n = chain.chope("wave").out()
    expect(n).to.eql({ family: "CHOP", type: "waveCHOP", params: {}, connections: []})
  })
  it('can chain nodes', () => {
    const n = chain.chope("wave").connect(chain.chope("audiodevin")).out()
    expect(n).to.eql({ family: "CHOP", type: "audiodevinCHOP", params: {}, connections:[{ family: "CHOP", type: "waveCHOP", params: {}, connections: []}]})
  })
  // it('can fillin connect', () => {
  //   const a = chain.chope("wave")
  //   const n = a.customConnect((ap) => ap.addConnect(ap.connect(chain.chope("math")).connect(chain.chope("merge")))).out()
  //   expect(n).to.eql({ 
  //     family: "CHOP", 
  //     type: "mergeCHOP", 
  //     params: {}, 
  //     connections:[{ 
  //       family: "CHOP", 
  //       type: "mathCHOP", 
  //       params: {}, 
  //       connections: [{ 
  //         family: "CHOP", 
  //         type: "waveCHOP", 
  //         params: {}, 
  //         connections: []
  //       }]
  //     }, { 
  //       family: "CHOP", 
  //       type: "waveCHOP", 
  //       params: {}, 
  //       connections: []
  //     }]
  //   })
  // })
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
    const n = chain.chop("select", {"chop" : chain.chopp(chain.chop("wave",{"rate" : chain.fp(1)}).run([]))}).out()
    let c1 = { family: "CHOP", type: "waveCHOP", params: {"rate": { type: "float", value0: ["1"]}}, connections:[]}
    expect(n).to.eql({ family: "CHOP", type: "selectCHOP", params: {"chop": { type: "CHOP", value0: ['\"', c1, '\"']}}, connections:[]})
  })
  it('can make op channel params', () => {
    const n = chain.chop("wave",{"rate" : chain.chan(chain.ip(0), chain.chope("wave").run([]))}).out()
    let c1 = { family: "CHOP", type: "waveCHOP", params: {}, connections:[]}
    expect(n).to.eql({ family: "CHOP", type: "waveCHOP", params: {"rate": { type: "float", value0: ["op(\"", c1, "\")[", "0", "]"]}}, connections:[]})
  })
  it('can make string op channel params', () => {
    const n = chain.chop("wave",{"rate" : chain.chan(chain.sp("wah"), chain.chope("wave").runT())}).out()
    let c1 = { family: "CHOP", type: "waveCHOP", params: {}, connections:[]}
    expect(n).to.eql({ family: "CHOP", type: "waveCHOP", params: {"rate": { type: "float", value0: ["op(\"", c1, "\")[", '"wah"', "]"]}}, connections:[]})
  })
  it('can make chain multivalue params', () => {
    const c1 = chain.chop("wave", {})
    const n = chain.top("rectangle", {"size": chain.xyp(chain.chan(chain.ip(0), c1.runT()), chain.fp(0.2))}).out()
    let c1o = { family: "CHOP", type: "waveCHOP", params: {}, connections:[]}
    expect(n).to.eql({ family: "TOP", type: "rectangleTOP", params: {"size": { type: "xy", value0: ["op(\"", c1o, "\")[", "0", "]"], value1: ["0.2"]}}, connections:[]})
  })
  it('can operate on params', () => {
    const n = chain.chop("wave",{"rate" : chain.multp(chain.chan(chain.ip(0), chain.chope("wave").runT()), chain.fp(1))}).out()
    let c1 = { family: "CHOP", type: "waveCHOP", params: {}, connections:[]}
    expect(n).to.eql({ family: "CHOP", type: "waveCHOP", params: {"rate": { type: "float", value0: ["( ", "op(\"", c1, "\")[", "0", "]", " * ", "1", " )"]}}, connections:[]})
  })
//   it('can make feedback ops', () => {
//     let fbt = chain.feedbacktop()
//     let n = chain.tope("rectangle")
//       .connect(fbt)
//       .addConnection(fbt.connect(chain.tope("level")).connect(chain.feedbacktarget((fbt.value as FBNode).id, "composite", {})))
//       .connect(chain.tope("blur"))
//       .out()

//     let guid = (n.connections[0] as FBTargetNode).selects[0]

//     expect(n).to.eql({ family: "TOP", type: "blurTOP", params: {}, connections:[ 
//       {
//         special: "FBT",
//         family: "TOP",
//         type: "compositeTOP",
//         selects: [guid],
//         params: {},
//         connections:[
//           {family: "TOP", type: "levelTOP", params: {}, connections: [
//             { special: "FB", family: "TOP", type: "feedbackTOP", id: guid, params: {}, connections:[
//               {family: "TOP", type: "rectangleTOP", params: {}, connections: []}
//             ]}
//           ]},
//           { special: "FB", family: "TOP", type: "feedbackTOP", id: guid, params: {}, connections:[
//               {family: "TOP", type: "rectangleTOP", params: {}, connections: []}
//             ]}
//         ],
//       }
//     ]})
//   })
  it('can make multi feedback ops', () => {
    let fbt = chain.feedbacktop()
    let fbt2 = chain.feedbacktop()
    let n = chain.tope("rectangle")
      .connect(chain.customconnectop((inputs) => 
        chain.feedbackChain(chain.customconnectop(
          (fbinputs) => chain.tope("composite").run(inputs.concat([chain.tope("rectangle")
            .connect(chain.customconnectop((inputs) => 
              chain.feedbackChain(chain.customconnectop(
                (fbinputs) => chain.tope("composite").run(inputs.concat([chain.tope("level").run(fbinputs)])))
            ).run(inputs)))
            .connect(chain.tope("blur")).runT(), chain.tope("level").run(fbinputs)])))
      ).run(inputs)))
      .connect(chain.tope("blur"))
      .out()

    console.log(JSON.stringify(n))
    let guid = (n.connections[0] as FBTargetNode).selects[0]
    let guid2 = (n.connections[0].connections[1].connections[0] as FBTargetNode).selects[0]

    expect(n).to.eql(
      { family: "TOP", type: "blurTOP", params: {}, connections:[ 
        {
          special: "FBT",
          family: "TOP",
          type: "compositeTOP",
          selects: [guid],
          params: {},
          connections:[
            {family: "TOP", type: "rectangleTOP", params: {}, connections: []},
            { family: "TOP", type: "blurTOP", params: {}, connections:[ 
              {
                special: "FBT",
                family: "TOP",
                type: "compositeTOP",
                selects: [guid2],
                params: {},
                connections:[
                  {family: "TOP", type: "rectangleTOP", params: {}, connections: []},
                  {family: "TOP", type: "levelTOP", params: {}, connections: [
                    { special: "FB", family: "TOP", type: "feedbackTOP", id: guid2, params: {}, connections:[
                      {family: "TOP", type: "rectangleTOP", params: {}, connections: []}
                    ]}
                  ]}
                ]
              }
            ]},
            {family: "TOP", type: "levelTOP", params: {}, connections: [
              { special: "FB", family: "TOP", type: "feedbackTOP", id: guid, params: {}, connections:[
                {family: "TOP", type: "rectangleTOP", params: {}, connections: []}
              ]}
            ]}
          ],
        }
      ]})
  })
  it('can use feedback util', () => {
    let n = chain.tope("rectangle")
      .connect(chain.customconnectop((inputs) => chain.feedbackChain(chain.customconnectop(
        (fbinputs) => chain.tope("composite").run(inputs.concat([chain.tope("level").run(fbinputs)])))
      ).run(inputs)))
      .connect(chain.tope("blur"))
      .out()

    let guid = (n.connections[0] as FBTargetNode).selects[0]

    expect(n).to.eql({ family: "TOP", type: "blurTOP", params: {}, connections:[ 
      {
        special: "FBT",
        family: "TOP",
        type: "compositeTOP",
        selects: [guid],
        params: {},
        connections:[
          { family: "TOP", type: "rectangleTOP", params: {}, connections:[] },
          {family: "TOP", type: "levelTOP", params: {}, connections: [
            { special: "FB", family: "TOP", type: "feedbackTOP", id: guid, params: {}, connections:[
              {family: "TOP", type: "rectangleTOP", params: {}, connections: []}
            ]}
          ]}
        ],
      }
    ]})
  })
//   it('can use feedback with customconnect', () => {
//     let comp = chain.tope("level")
//     let fbprep = chain.customconnectop((self, n) => {
//       n.connect(self.forest[0] as OpTree<T>)
//       self.addConnection(n)
//       return self
//     }, chain.feedbackChain(chain.tope("level").connect(chain.tope("composite"))));

//     let n = chain.tope("rectangle")
//       .connect(fbprep)
//       .connect(chain.tope("blur"))
//       .out()

//     let guid = (n.connections[0] as FBTargetNode).selects[0]

//     expect(n).to.eql({ family: "TOP", type: "blurTOP", params: {}, connections:[ 
//       {
//         special: "FBT",
//         family: "TOP",
//         type: "compositeTOP",
//         selects: [guid],
//         params: {},
//         connections:[
//           {family: "TOP", type: "levelTOP", params: {}, connections: [
//             { special: "FB", family: "TOP", type: "feedbackTOP", id: guid, params: {}, connections:[
//               {family: "TOP", type: "rectangleTOP", params: {}, connections: []}
//             ]}
//           ]},
//           { family: "TOP", type: "rectangleTOP", params: {}, connections:[] }
//         ],
//       }
//     ]})
//   })
})