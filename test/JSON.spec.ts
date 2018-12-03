import { expect } from 'chai';
import { OP, INode, nodeToJSON, FBNode, FBTargetNode } from '../src'
import { Guid } from 'guid-typescript'

describe('JSON', () => {
    it('can parse a single node', ()=> {
        const n : INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: {},
            connections: []
        }
        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{},\"connections\":[]}}")
    });
    it('can parse parameters', ()=>{
        const n: INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            connections: []
        }

        let parsed = nodeToJSON(n);

        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[]}}")
    })
    it('can parse xy parameters', ()=>{
        const n: INode = {
            family: "TOP",
            type: "rectangleTOP",
            params: {"size": {type: "xy", value0: ["0.5"], value1: ["0.75"] }},
            connections: []
        }

        let parsed = nodeToJSON(n);

        expect(parsed).to.equal("{\"/rectangleTOP_0\":{\"ty\":\"rectangleTOP\",\"optype\":\"TOP\",\"parameters\":{\"sizex\":\"0.5\",\"sizey\":\"0.75\"},\"connections\":[]}}")
    })
    it('can parse children', ()=>{
        const c1: INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            connections: []
        }
        const c2: INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.1"] }},
            connections: []
        }
        const n: INode = {
            family: "CHOP",
            type: "mathCHOP",
            params: {},
            connections: [c1, c2]
        }

        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[]},\"/waveCHOP_1\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"1.1\"},\"connections\":[]},\"/mathCHOP_0\":{\"ty\":\"mathCHOP\",\"optype\":\"CHOP\",\"parameters\":{},\"connections\":[\"/waveCHOP_0\",\"/waveCHOP_1\"]}}")
    })
    it('can condense similar children', ()=>{
        const c1: INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            connections: []
        }
        const c2: INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            connections: []
        }
        const n: INode = {
            family: "CHOP",
            type: "mathCHOP",
            params: {},
            connections: [c1, c2]
        }

        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[]},\"/mathCHOP_0\":{\"ty\":\"mathCHOP\",\"optype\":\"CHOP\",\"parameters\":{},\"connections\":[\"/waveCHOP_0\",\"/waveCHOP_0\"]}}")
    })
    it('can parse node params', ()=> {
        const c1: INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            connections: []
        }
        const n: INode = {
            family: "CHOP",
            type: "selectCHOP",
            params: {"chop": { type: "CHOP", value0: ['"', c1, '"']}},
            connections: []
        }

        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[]},\"/selectCHOP_0\":{\"ty\":\"selectCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"chop\":\"\\\"waveCHOP_0\\\"\"},\"connections\":[]}}")
    })
    it('can parse chan params', ()=>{
        const c1: INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ["1.0"] }},
            connections: []
        }
        const n: INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: {"rate": { type: "float", value0: ['op("', c1, '")[', "0", ']']}},
            connections: []
        }

        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"1.0\"},\"connections\":[]},\"/waveCHOP_1\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{\"rate\":\"op(\\\"waveCHOP_0\\\")[0]\"},\"connections\":[]}}")
    })
    it('can parse nested chan params', ()=>{
        const c1: INode = {
            family: "CHOP",
            type: "waveCHOP",
            params: {},
            connections: []
        }
        const n: INode = {
            family: "TOP",
            type: "rectangleTOP",
            params: {"size": { type: "xy", value0: ['op("', c1, '")[', "0", ']'], value1: ["0.2"]}},
            connections: []
        }

        let parsed = nodeToJSON(n);
        expect(parsed).to.equal("{\"/waveCHOP_0\":{\"ty\":\"waveCHOP\",\"optype\":\"CHOP\",\"parameters\":{},\"connections\":[]},\"/rectangleTOP_0\":{\"ty\":\"rectangleTOP\",\"optype\":\"TOP\",\"parameters\":{\"sizex\":\"op(\\\"waveCHOP_0\\\")[0]\",\"sizey\":\"0.2\"},\"connections\":[]}}")
    })
    it('can parse feedback', () => {
        let guid = Guid.create()
        const n : INode = { family: "TOP", type: "blurTOP", params: {}, connections:[ 
            {
                special: "FBT",
                family: "TOP",
                type: "compositeTOP",
                selects: [guid],
                params: {},
                connections:[
                {family: "TOP", type: "levelTOP", params: {}, connections: [
                    { special: "FB", family: "TOP", type: "feedbackTOP", id: guid, params: {}, connections:[
                    {family: "TOP", type: "rectangleTOP", params: {}, connections: []}
                    ]} as FBNode
                ]},
                { special: "FB", family: "TOP", type: "feedbackTOP", id: guid, params: {}, connections:[
                    {family: "TOP", type: "rectangleTOP", params: {}, connections: []}
                    ]} as FBNode
                ],
            } as FBTargetNode] as INode[]}

        expect(nodeToJSON(n)).to.equal(JSON.stringify({
            "/rectangleTOP_0": {
                ty: "rectangleTOP",
                optype: "TOP",
                parameters: {},
                connections: []
            },
            "/feedbackTOP_0": {
                ty: "feedbackTOP",
                optype:"TOP",
                parameters: {"top": '"compositeTOP_0"'},
                connections: ["/rectangleTOP_0"]
            },
            "/levelTOP_0": {
                ty: "levelTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/feedbackTOP_0"]
            },
            "/compositeTOP_0": {
                ty: "compositeTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/levelTOP_0", "/feedbackTOP_0"]
            },
            "/blurTOP_0": {
                ty: "blurTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/compositeTOP_0"]
            }
        }))

    })
    it('can parse multi feedback', () => {
        let guid = Guid.create()
        let guid2 = Guid.create()
        const n : INode =  {family: "TOP", type: "compositeTOP", params: {}, connections: [
            { family: "TOP", type: "blurTOP", params: {}, connections:[ 
                {
                special: "FBT",
                family: "TOP",
                type: "compositeTOP",
                selects: [guid],
                params: {},
                connections:[
                    {family: "TOP", type: "levelTOP", params: {}, connections: [
                    { special: "FB", family: "TOP", type: "feedbackTOP", id: guid, params: {}, connections:[
                        {family: "TOP", type: "rectangleTOP", params: {}, connections: []}
                    ]} as FBNode
                    ]},
                    { special: "FB", family: "TOP", type: "feedbackTOP", id: guid, params: {}, connections:[
                        {family: "TOP", type: "rectangleTOP", params: {}, connections: []}
                    ]} as FBNode
                ],
                } as FBTargetNode
            ]},
            { family: "TOP", type: "blurTOP", params: {}, connections:[ 
            {
                special: "FBT",
                family: "TOP",
                type: "compositeTOP",
                selects: [guid2],
                params: {},
                connections:[
                {family: "TOP", type: "levelTOP", params: {}, connections: [
                    { special: "FB", family: "TOP", type: "feedbackTOP", id: guid2, params: {}, connections:[
                    {family: "TOP", type: "rectangleTOP", params: {}, connections: []}
                    ]} as FBNode
                ]},
                { special: "FB", family: "TOP", type: "feedbackTOP", id: guid2, params: {}, connections:[
                    {family: "TOP", type: "rectangleTOP", params: {}, connections: []}
                    ]} as FBNode
                ]
            } as FBTargetNode
            ]}
            ]}

        expect(nodeToJSON(n)).to.equal(JSON.stringify({
            "/rectangleTOP_0": {
                ty: "rectangleTOP",
                optype: "TOP",
                parameters: {},
                connections: []
            },
            "/feedbackTOP_0": {
                ty: "feedbackTOP",
                optype:"TOP",
                parameters: {"top": '"compositeTOP_0"'},
                connections: ["/rectangleTOP_0"]
            },
            "/feedbackTOP_1": {
                ty: "feedbackTOP",
                optype:"TOP",
                parameters: {"top": '"compositeTOP_1"'},
                connections: ["/rectangleTOP_0"]
            },
            "/levelTOP_0": {
                ty: "levelTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/feedbackTOP_0"]
            },
            "/levelTOP_1": {
                ty: "levelTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/feedbackTOP_1"]
            },
            "/compositeTOP_0": {
                ty: "compositeTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/levelTOP_0", "/feedbackTOP_0"]
            },
            "/compositeTOP_1": {
                ty: "compositeTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/levelTOP_1", "/feedbackTOP_1"]
            },
            "/compositeTOP_2": {
                ty: "compositeTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/blurTOP_0", "/blurTOP_1"]
            },
            "/blurTOP_0": {
                ty: "blurTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/compositeTOP_0"]
            },
            "/blurTOP_1": {
                ty: "blurTOP",
                optype:"TOP",
                parameters: {},
                connections: ["/compositeTOP_1"]
            }
        }))

    })
})