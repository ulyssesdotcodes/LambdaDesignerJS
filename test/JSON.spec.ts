import { expect } from 'chai';
import { OP, INode, nodeToJSON, FBNode, FBTargetNode, constructNodeFromDefault } from '../src'
import { Guid } from 'guid-typescript'
import { some } from 'fp-ts/lib/Option';

describe('JSON', () => {
    it('can parse a single node', ()=> {
        const n : INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {},
            connections: [],
            actions: [],
        })
        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{},\"connections\":[],\"commands\":[]}}")
    });
    it('can parse actions', ()=> {
        const n : INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {},
            connections: [],
            actions: [{type: "pulse", param: "reset", val: 1.2, frames: 2}],
        })
        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{},\"connections\":[],\"commands\":[{\"command\":\"pulse\",\"args\":[\"reset\",1.2,2]}]}}")
    });
    it('can parse parameters', ()=>{
        const n: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            actions: [],
            connections: []
        })

        let parsed = nodeToJSON(n);

        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[],\"commands\":[]}}")
    })
    it('can parse number parameters', ()=>{
        const n: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": 1},
            actions: [],
            connections: []
        })

        let parsed = nodeToJSON(n);

        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"1\"},\"connections\":[],\"commands\":[]}}")
    })
    it('can parse string parameters', ()=>{
        const n: INode = constructNodeFromDefault({
            family: "TOP",
            type: "textTOP",
            params: {"text": "hi"},
            actions: [],
            connections: []
        })

        let parsed = nodeToJSON(n);

        expect(parsed).to.equal("{\"/textTOP_0\":{\"ty\":\"textTOP\",\"optype\":\"TOP\",\"parameters\":{\"text\":\"hi\"},\"connections\":[],\"commands\":[]}}")
    })
    it('can parse xy parameters', ()=>{
        const n: INode = constructNodeFromDefault({
            family: "TOP",
            type: "rectangleTOP",
            params: {"size": {type: "xy", value0: ["0.5"], value1: ["0.75"] }},
            actions: [],
            connections: []
        })

        let parsed = nodeToJSON(n);

        expect(parsed).to.equal("{\"/rectangleTOP_0\":{\"ty\":\"rectangleTOP\",\"optype\":\"TOP\",\"parameters\":{\"sizex\":\"0.5\",\"sizey\":\"0.75\"},\"connections\":[],\"commands\":[]}}")
    })
    it('can parse children', ()=>{
        const c1: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            actions: [],
            connections: []
        })
        const c2: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.1"] }},
            actions: [],
            connections: []
        })
        const n: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "mathCHOP",
            params: {},
            actions: [],
            connections: [c1, c2]
        })

        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[],\"commands\":[]},\"/waveCHOP_1\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"1.1\"},\"connections\":[],\"commands\":[]},\"/mathCHOP_0\":{\"ty\":\"mathCHOP\",\"optype\":\"CHOP\",\"parameters\":{},\"connections\":[\"/waveCHOP_0\",\"/waveCHOP_1\"],\"commands\":[]}}")
    })
    it('can condense similar children', ()=>{
        const c1: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            actions: [],
            connections: []
        })
        const c2: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            actions: [],
            connections: []
        })
        const n: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "mathCHOP",
            params: {},
            actions: [],
            connections: [c1, c2]
        })

        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[],\"commands\":[]},\"/mathCHOP_0\":{\"ty\":\"mathCHOP\",\"optype\":\"CHOP\",\"parameters\":{},\"connections\":[\"/waveCHOP_0\",\"/waveCHOP_0\"],\"commands\":[]}}")
    })
    it('can make similar children unique', ()=>{
        const c1: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            actions: [],
            connections: [],
            unique: some("c1")
        })
        const c2: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            actions: [],
            connections: [],
            unique: some("c2")
        })
        const n: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "mathCHOP",
            params: {},
            actions: [],
            connections: [c1, c2]
        })

        let parsed = nodeToJSON(n);
        expect(parsed).to.equal(JSON.stringify({
            "/waveCHOP_c1": {
                ty: "waveCHOP",
                optype: "CHOP",
                parameters: {"rate": '1.0'},
                connections: [],
                commands: [],
                unique: "c1"
            },
            "/waveCHOP_c2": {
                ty: "waveCHOP",
                optype: "CHOP",
                parameters: {"rate": '1.0'},
                connections: [],
                commands: [],
                unique: "c2"
            },
            "/mathCHOP_0": {
                ty: "mathCHOP",
                optype: "CHOP",
                parameters: {},
                connections: ["/waveCHOP_c1", "/waveCHOP_c2"],
                commands: []
            },
        }));
    })
    it('can condense unique children by reference', ()=>{
        const c1: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            actions: [],
            connections: [],
            unique: some("c1")
        })

        const c2: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            actions: [],
            connections: [],
            unique: some("c1")
        })
        const n: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "mathCHOP",
            params: {},
            actions: [],
            connections: [c1, c2]
        })

        let parsed = nodeToJSON(n);
        expect(parsed).to.equal(JSON.stringify({
            "/waveCHOP_c1": {
                ty: "waveCHOP",
                optype: "CHOP",
                parameters: {"rate": '1.0'},
                connections: [],
                commands: [],
                unique: "c1"
            },
            "/mathCHOP_0": {
                ty: "mathCHOP",
                optype: "CHOP",
                parameters: {},
                connections: ["/waveCHOP_c1", "/waveCHOP_c1"],
                commands: []
            },
        }));
    })
    it('can condense similar nested children', ()=>{
        const c1: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            connections: [],
            actions: []
        })
        const c2: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            actions: [],
            connections: []
        })
        const n1: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "mathCHOP",
            params: {},
            actions: [],
            connections: [c1, c2]
        })
        const n: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "mathCHOP",
            params: {},
            actions: [],
            connections: [n1, c2]
        })

        let parsed = nodeToJSON(n);

        expect(parsed).to.equal(JSON.stringify({
            "/waveCHOP_0": {
                ty: "waveCHOP",
                optype: "CHOP",
                parameters: {"rate": '1.0'},
                connections: [],
                commands: []
            },
            "/mathCHOP_0": {
                ty: "mathCHOP",
                optype: "CHOP",
                parameters: {},
                connections: ["/waveCHOP_0", "/waveCHOP_0"],
                commands: []
            },
            "/mathCHOP_1": {
                ty: "mathCHOP",
                optype: "CHOP",
                parameters: {},
                connections: ["/mathCHOP_0", "/waveCHOP_0"],
                commands: []
            },
        }));
    })
    it('can condense similar params', ()=>{
        const c1: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            actions: [],
            connections: []
        })
        const c2: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "constantCHOP",
            params: {},
            actions: [],
            connections: []
        })
        const t1: INode = constructNodeFromDefault({
            family: "TOP",
            type: "choptoTOP",
            params: {"chop": { type: "CHOP", value0: [c1] }},
            actions: [],
            connections: []
        })
        const t2: INode = constructNodeFromDefault({
            family: "TOP",
            type: "choptoTOP",
            params: {"chop": { type: "CHOP", value0: [c2] }},
            actions: [],
            connections: []
        })
        const n1: INode = constructNodeFromDefault({
            family: "TOP",
            type: "compositeTOP",
            params: {},
            actions: [],
            connections: [t1, t2]
        })
        const n2: INode = constructNodeFromDefault({
            family: "TOP",
            type: "compositeTOP",
            params: {},
            actions: [],
            connections: [t1, t2]
        })
        const n: INode = constructNodeFromDefault({
            family: "TOP",
            type: "compositeTOP",
            params: {},
            actions: [],
            connections: [n1, n2]
        })

        let parsed = nodeToJSON(n);

        expect(parsed).to.equal(JSON.stringify({
            "/waveCHOP_0": {
                ty: "waveCHOP",
                optype: "CHOP",
                parameters: {"rate": '1.0'},
                connections: [],
                commands: []
            },
            "/choptoTOP_0": {
                ty: "choptoTOP",
                optype: "TOP",
                parameters: {"chop": 'waveCHOP_0'},
                connections: [],
                commands: []
            },
            "/choptoTOP_1": {
                ty: "choptoTOP",
                optype: "TOP",
                parameters: {"chop": 'constantCHOP_0'},
                connections: [],
                commands: []
            },
            "/constantCHOP_0": {
                ty: "constantCHOP",
                optype: "CHOP",
                parameters: {},
                connections: [],
                commands: []
            },
            "/compositeTOP_0": {
                ty: "compositeTOP",
                optype: "TOP",
                parameters: {},
                connections: ["/choptoTOP_0", "/choptoTOP_1"],
                commands: []
            },
            "/compositeTOP_1": {
                ty: "compositeTOP",
                optype: "TOP",
                parameters: {},
                connections: ["/compositeTOP_0", "/compositeTOP_0"],
                commands: []
            },
        }));
    })
    it('can parse node params', ()=> {
        const c1: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            actions: [],
            connections: []
        })
        const n: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "selectCHOP",
            params: {"chop": { type: "CHOP", value0: ['"', c1, '"']}},
            actions: [],
            connections: []
        })

        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[],\"commands\":[]},\"/selectCHOP_0\":{\"ty\":\"selectCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"chop\":\"\\\"waveCHOP_0\\\"\"},\"connections\":[],\"commands\":[]}}")
    })
    it('can parse chan params', ()=>{
        const c1: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            actions: [],
            connections: []
        })
        const n: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ['op("', c1, '")[', "0", ']']}},
            actions: [],
            connections: []
        })

        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[],\"commands\":[]},\"/waveCHOP_1\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"op(\\\"waveCHOP_0\\\")[0]\"},\"connections\":[],\"commands\":[]}}")
    })
    it('can parse nested chan params', ()=>{
        const c1: INode = constructNodeFromDefault({
            family: "CHOP",
            type: "waveCHOP",
            params: {},
            actions: [],
            connections: []
        })
        const n: INode = constructNodeFromDefault({
            family: "TOP",
            type: "rectangleTOP",
            params: {"size": { type: "xy", value0: ['op("', c1, '")[', "0", ']'], value1: ["0.2"]}},
            actions: [],
            connections: []
        })

        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{},\"connections\":[],\"commands\":[]},\"/rectangleTOP_0\":{\"ty\":\"rectangleTOP\",\"optype\":\"TOP\",\"parameters\":{\"sizex\":\"op(\\\"waveCHOP_0\\\")[0]\",\"sizey\":\"0.2\"},\"connections\":[],\"commands\":[]}}")
    })
    it('can parse feedback', () => {
        let guid = Guid.create()
        const n : INode = constructNodeFromDefault({ family: "TOP", type: "blurTOP", params: {}, actions:[], connections:[ 
            constructNodeFromDefault({
                special: "FBT",
                family: "TOP",
                type: "compositeTOP",
                selects: [guid],
                params: {},
                actions: [],
                connections:[
                constructNodeFromDefault({family: "TOP", type: "levelTOP", params: {}, actions: [], connections: [
                    constructNodeFromDefault({ special: "FB", family: "TOP", type: "feedbackTOP", id: guid, params: {}, actions: [], connections:[
                    constructNodeFromDefault({family: "TOP", type: "rectangleTOP", params: {}, actions: [], connections: []})
                    ]} as FBNode)
                ]}),
                constructNodeFromDefault({ special: "FB", family: "TOP", type: "feedbackTOP", id: guid, params: {}, actions: [], connections:[
                    constructNodeFromDefault({family: "TOP", type: "rectangleTOP", params: {}, actions: [], connections: []})
                    ]} as FBNode)
                ],
            }) as FBTargetNode] as INode[]});

        expect(nodeToJSON(n)).to.equal(JSON.stringify({
            "/rectangleTOP_0": {
                ty: "rectangleTOP",
                optype: "TOP",
                parameters: {},
                connections: [],
                commands: []
            },
            "/feedbackTOP_0": {
                ty: "feedbackTOP",
                optype:"TOP",
                parameters: {"top": '"compositeTOP_0"'},
                connections: ["/rectangleTOP_0"],
                commands: []
            },
            "/levelTOP_0": {
                ty: "levelTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/feedbackTOP_0"],
                commands: []
            },
            "/compositeTOP_0": {
                ty: "compositeTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/levelTOP_0", "/feedbackTOP_0"],
                commands: []
            },
            "/blurTOP_0": {
                ty: "blurTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/compositeTOP_0"],
                commands: []
            }
        }))

    })
    it('can parse multi feedback', () => {
        let guid = Guid.create()
        let guid2 = Guid.create()
        const n : INode = constructNodeFromDefault( {family: "TOP", type: "compositeTOP", params: {}, actions: [], connections: [
            constructNodeFromDefault({ family: "TOP", type: "blurTOP", params: {}, actions:[], connections:[ 
                constructNodeFromDefault({
                special: "FBT",
                family: "TOP",
                type: "compositeTOP",
                selects: [guid],
                actions: [],
                params: {},
                connections:[
                    constructNodeFromDefault({family: "TOP", type: "levelTOP", params: {}, actions: [], connections: [
                    constructNodeFromDefault({ special: "FB", family: "TOP", type: "feedbackTOP", id: guid, params: {}, actions: [], connections:[
                        constructNodeFromDefault({family: "TOP", type: "rectangleTOP", params: {}, actions: [], connections: []})
                    ]} as FBNode)
                    ]}),
                    constructNodeFromDefault({ special: "FB", family: "TOP", type: "feedbackTOP", id: guid, params: {}, actions: [], connections:[
                        constructNodeFromDefault({family: "TOP", type: "rectangleTOP", params: {}, actions: [], connections: []})
                    ]} as FBNode)
                ],
                } as FBTargetNode)
            ]}),
            constructNodeFromDefault({ family: "TOP", type: "blurTOP", params: {}, actions: [], connections:[ 
            constructNodeFromDefault({
                special: "FBT",
                family: "TOP",
                type: "compositeTOP",
                selects: [guid2],
                params: {},
                actions: [],
                connections:[
                constructNodeFromDefault({family: "TOP", type: "levelTOP", params: {}, actions: [], connections: [
                    constructNodeFromDefault({ special: "FB", family: "TOP", type: "feedbackTOP", id: guid2, params: {}, actions: [], connections:[
                    constructNodeFromDefault({family: "TOP", type: "rectangleTOP", params: {}, actions: [], connections: []})
                    ]} as FBNode)
                ]}),
                constructNodeFromDefault({ special: "FB", family: "TOP", type: "feedbackTOP", id: guid2, params: {}, actions: [], connections:[
                    constructNodeFromDefault({family: "TOP", type: "rectangleTOP", params: {}, actions: [], connections: []})
                    ]} as FBNode)
                ]
            } as FBTargetNode)
            ]})
            ]})

        expect(nodeToJSON(n)).to.equal(JSON.stringify({
            "/rectangleTOP_0": {
                ty: "rectangleTOP",
                optype: "TOP",
                parameters: {},
                connections: [],
                commands: []
            },
            "/feedbackTOP_0": {
                ty: "feedbackTOP",
                optype:"TOP",
                parameters: {"top": '"compositeTOP_0"'},
                connections: ["/rectangleTOP_0"],
                commands: []
            },
            "/feedbackTOP_1": {
                ty: "feedbackTOP",
                optype:"TOP",
                parameters: {"top": '"compositeTOP_1"'},
                connections: ["/rectangleTOP_0"],
                commands: []
            },
            "/levelTOP_0": {
                ty: "levelTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/feedbackTOP_0"],
                commands: []
            },
            "/levelTOP_1": {
                ty: "levelTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/feedbackTOP_1"],
                commands: []
            },
            "/compositeTOP_0": {
                ty: "compositeTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/levelTOP_0", "/feedbackTOP_0"],
                commands: []
            },
            "/compositeTOP_1": {
                ty: "compositeTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/levelTOP_1", "/feedbackTOP_1"],
                commands: []
            },
            "/compositeTOP_2": {
                ty: "compositeTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/blurTOP_0", "/blurTOP_1"],
                commands: []
            },
            "/blurTOP_0": {
                ty: "blurTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/compositeTOP_0"],
                commands: []
            },
            "/blurTOP_1": {
                ty: "blurTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/compositeTOP_1"],
                commands: []
            }
        }))

    })
})