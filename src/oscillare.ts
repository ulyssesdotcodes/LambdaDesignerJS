import * as c from "./Chain";
import * as t from "./Types";

function zip(arrs) {
    let shortest = arrs.reduce((acc, p) => acc.length < p.length ? acc : p)
    return shortest.map(function(_, i){
        return arrs.map(function(array){ return array[i]})
    })
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

const compose = (...fns) =>
  fns.reduceRight((prevFn, nextFn) =>
    (...args) => nextFn(prevFn(...args)),
    value => value
  );

let hex = (h) => hexToRgb(h)
let rgb = (r, g, b) => ({ r: r, g: g, b: b })

export function ain(g?: number){ return  c.chope("audiodevicein")
        .connect(c.chop("select", {channames: c.sp("chan1")}))
        .connect(c.chop("resample", {"timeslice": c.tp(false), "method": c.mp(0), "relative": c.mp(0), "end": c.fp(0.03)}))
        .connect(c.chop("math", {"gain": g === undefined ? c.fp(1) : g}))
} export function aine(v){ return  ain(v == undefined ? c.fp(1) : v)
} export function atex(v){ return  c.top("chopto", {"chop": c.chopp([ain(v)])})
} export function aspect(){ return  c.chope('audiodevicein').connect(c.chope('audiospectrum'))
} export function aspecttex(){ return  c.top("chopto", {"chop": c.chopp([aspect()])})
} export function analyze(i){ return  c.chop('analyze', {"function": c.mp(i)})
} export function vol(v){ return  ain(v).connect(analyze(6))
} export function vols(v){ return  vol(v).connect(c.chop("speed"))
} export function volc(v){ return  c.chan(c.ip(0), vol(v))
} export function volsc(v){ return  c.chan(c.ip(0), vols(v))
} export function lowPass(){ return  c.chop("audiofilter", {"filter": c.mp(0)})
} export function lowv(v){ return  ain(v).connect(lowPass()).connect(analyze(6))
} export function lowvs(v){ return  lowv(v).connect(c.chop("speed"))
} export function lowvc(v){ return  c.chan(c.ip(0), lowv(v))
} export function lowvsc(v){ return  c.chan(c.ip(0), lowvs(v))
} export function highPass(){ return  c.chop("audiofilter", {"filter": c.mp(1)})
} export function highv(v){ return  ain(v).connect(highPass()).connect(analyze(6))
} export function highvc(v){ return  c.chan(c.ip(0), highv(v))
} export function bandPass(b){ return  c.chop("audiofilter", {"filter": c.mp(2), "cutofflog": c.multp(b, c.fp(4.5))})
} export function bandv(b, v){ return  ain(v).connect(bandPass(b)).connect(analyze(6))
} export function bandvc(b, v){ return  c.chan(c.ip(0), bandv(b, v))
} export function mchan(chan){ return  c.chan(c.sp(chan), c.chope("midiinmap"))
} export function mchop(chan){ return  c.chope("midiinmap").connect(c.chop("select", {"channames": c.sp(chan)}))
} export function cxyzp(val){ return  c.xyzp(val, val, val)
} export function lagdown(val){ return  c.chop("lag", {lag2: val})
} export function lagup(val){ return  c.chop("lag", {lag1: val})
} export function lagboth(val){ return  c.chop("lag", {lag1: val, lag2: val})
} export function frag(fragname, uniforms){ return  c.top("glslmulti", Object.assign({
            "resolutionw": c.ip(1920), 
            "resolutionh": c.ip(1080),
            "pixeldat": c.datp([c.dat("text", {"file" : c.sp("scripts/Visuals/" + fragname)})]),
            "outputresolution": c.mp(9),
            "format": c.mp(4) 
        }, zip([Array(8).fill("uniname"), Array.from(Array(8).keys()), Object.keys(uniforms)]).reduce((acc, v) => { acc[v[0]+v[1]] = c.sp(v[2]); return acc; }, {})
        , zip([Array(8).fill("value"), Array.from(Array(8).keys()), Object.values(uniforms)]).reduce((acc, v) => { acc[v[0]+v[1]] = v[2]; return acc; }, {})),
        )
} export function sidebyside(inputs){ 
    return  c.top("glslmulti", {
            pixeldat: c.datp([
                c.dat("text", {
                    "file" : c.sp("scripts/sidebyside.frag")
                })]),
            resolutionw: c.ip(inputs.length * 1920),
            resolutionh: c.ip(1080),
            outputresolution: c.mp(9)
        }).run(inputs)
} export function verticalstack(inputs){ 
    return  c.top("glslmulti", {
            pixeldat: c.datp([
                c.dat("text", {
                    "file" : c.sp("scripts/verticalstack.frag")
                })]),
            resolutionw: { type: "number", value0: [ "max(map(lambda n: n.width, me.inputs))" ] },
            resolutionh: { type: "number", value0: [ "sum(map(lambda n: n.height, me.inputs))" ] },
            outputresolution: c.mp(9)
        }).run(inputs)
} export function adata(v){ return  atex(v).connect(frag('audio_data.frag', {'i_volume': c.x4p(c.fp(1))}))
} export function noiset(t){ return  c.top("noise", {"t": c.xyzp(c.fp(0), c.fp(0), t)})
} export function noisecc(t, amp, channames){ return  c.chan(c.ip(0), noisec(t, amp, channames))
} export function speed(val){ return  c.chop("speed")
} export function timeslice(off){ return  c.chop("trim", {
        relative: c.mp(0), 
        startunit: c.mp(2),
        endunit: c.mp(2),
        start: off,
        end: off
    })}
export function noisec(t, amp, channames, seed = c.fp(0)){ return c.chop("noise", {
        type: c.mp(3), 
        amp: amp,
        left: c.mp(2),
        right: c.mp(2),
        channelname: c.sp(channames),
        seed: seed,
        })
} export function sparsenoisec(t, g){ return  c.chan0(c.chop("noise", {
            seed: c.fp(new Date().getMilliseconds()),
            t: c.xyzp(t, c.fp(0), c.fp(0)) ,
        })
        .c(c.cc((inputs) => c.chop("math", { gain: g }).run(inputs)))
        .c(c.chop("function", { func: c.mp(1),}))
        .c(c.chop("speed")))
    }
export function noisects(t, amp, channames, seed = c.fp(0)) { 
        return noisec(t, amp, channames, seed)
            .c(timeslice(t))
} export function lines(spacing, width){ return  frag("lines.frag", {"i_spacing": c.x4p(spacing), "i_width": c.x4p(width)})
} export function shapes(sides, size, width){ return  frag("shapes.frag", {"i_size": c.x4p(size), "i_width": c.x4p(width), "i_sides": c.x4p(sides)})
} export function stringtheory(time, angle, angle_delta, xoffset){ 
    return frag("string_theory.frag", 
            { 
                "i_time": c.x4p(time), 
                "i_angle": c.x4p(angle), 
                "i_angle_delta": c.x4p(angle_delta === undefined ? c.fp(0.4) : angle_delta), 
                "i_xoff": c.x4p(xoffset === undefined ? c.fp(0) : xoffset)
            })
} export function crosshatch(){ return  frag("crosshatch.frag", {})
} export function commandcode(text){ return  c.top("text", {
        "resolutionw": c.ip(1920), 
        "resolutionh": c.ip(1080), 
        "fontsizey": c.fp(16), 
        "alignx": c.mp(0),
        "aligny": c.mp(0),
        "text": c.sp(text),
        "dispmethod": c.mp(3),
        "fontautosize": c.mp(1)
    })
} export function flowermod(s){ return  frag("flower_mod.frag", {"uSeconds": c.x4p(s)})
} export function lumidots(){ return  frag("lumidots.frag", {})
} export function mosaic(t, s){ return  frag("mosaic.frag", {"uTime" : c.x4p(t), "uScale" : c.x4p(s)})
} export function noisedisplace(t, d){ return  frag("noise_displace.frag", {"uTime": c.x4p(t), "uDisplacement": c.x4p(d)})
} export function transform(extra){ return  c.top("transform", extra)
} export function rotate(r){ return  transform({"rotate": r})
} export function translate(x, y){ return  transform({"t": c.xyp(x, y), "extend": c.mp(3)})
} export function translatee(x, y, e){ return  transform({"t": c.xyp(x, y), "extend": c.mp(e)})
} export function translatex(x){ return  translate(x, c.fp(0))
} export function translatexclamp(t, clamp){ return  c.top("transform", {
        t: c.xyp(c.multp(floor(c.divp(c.modp(t, c.fp(1)), clamp)), clamp), c.fp(0)),
        extend: c.mp(2),
    })
} export function translatey(y){ return  translate(c.fp(0), y)
} export function val(v){ return  c.top("hsvadjust", {"valuemult": v})
} export function transformscale(f, x, y, e){ return  transform(Object.assign({
        "extend": c.mp(e),
        "s": c.xyp(c.powp(x, c.fp(-1)), c.powp(y, c.fp(-1)))
    }, f))
} export function scale(xy){ return  transformscale({}, xy, xy, 1)
} export function rgbsplit(s){ return  frag("rgbsplit.frag", {"uFrames": c.x4p(s)})
} export function repeatT(x, y){ return  transformscale({}, x, y, 3) }
export function repeatTxy (xy){ return transformscale({}, xy, xy, 3)}
 export function strobe(s){ return  frag("strobe.frag", {"uSpeed": c.x4p(s), "uTime": c.x4p(c.seconds)})
} export function mirrorx(){ return  c.cc((inputs) => addops([inputs[0].c(c.top("flip", {flipx: c.tp(true)}))].concat(inputs)))
} export function mirrory(){ return  c.cc((inputs) => addops([inputs[0].c(c.top("flip", {flipy: c.tp(true)}))].concat(inputs)))
} export function const1(v){ return  c.chop("constant", {"name0": c.sp("const"), "value0": v})
} export function constc(namevals){ return  c.chop("constant", Object.entries(namevals).reduce(function(map, val, idx) {
        map["name" + idx] = c.sp(val[0])
        map["value" + idx] = val[1]
        return map
    }, {}))

} export function rgbc(r, g, b){ return  constc({ r: r, g: g, b: b })
} export function palettergbc(color){ return  rgbc(c.fp(color.r / 255), c.fp(color.g / 255), c.fp(color.b / 255))
} export function rgbt(color){ return  c.top("chopto", {"chop": c.chopp([palettergbc(color).runT()]), "dataformat": c.mp(2) })
} export function palette(colors){ 
    return  c.top("chopto", {
            "chop":
                c.chopp([
                    c.chope("merge")
                        .run(colors.map((col) => palettergbc(col).runT()))
                        .connect(c.chop("shuffle", {"method": c.mp(2), "nval": c.ip(3)}))
                ]),
            "dataformat": c.mp(2)
        })

} export function palettemap(p, o){ 
    return  c.insertconn(
            frag("palette_map.frag", {"uOffset": c.x4p(o), "uSamples": c.x4p(c.fp(16))}), 
            [], 
            [palette(p).runT()])
} export function palettecycle(palette, s){ 
        let palettechop = c.chop("cross", {"cross": c.modp(s, c.fp(palette.length))}).run(palette.map((col) => palettergbc(col).runT()))
        let palettet = c.top("chopto", {"chop": c.chopp([palettechop]), "dataformat": c.mp(2)})
        return c.cc((inputs: t.Node<"TOP">[]) => 
            c.top("composite", {"operand": c.mp(27)}).run([palettet.runT()].concat(inputs))
        )
}

export const tealcontrast =[rgb(188, 242, 246), rgb(50, 107, 113), rgb(211, 90, 30), rgb(209, 122, 43), rgb(188, 242, 246)]
export const purplish =[rgb(150, 110, 100), rgb(223, 143, 67), rgb(76, 73, 100, ), rgb(146, 118, 133), rgb(165, 148, 180)]
export const bnw =[rgb(255, 255, 255), rgb(0, 0, 0)]
export const sunset =[rgb(185, 117, 19), rgb(228, 187, 108), rgb(251, 162, 1), rgb(255, 243, 201)]
export const coolpink =[rgb(215, 40, 26), rgb(157, 60, 121), rgb(179, 83, 154), rgb(187, 59, 98)]
export const darkestred =[rgb(153, 7, 17), rgb(97, 6, 11), rgb(49, 7, 8), rgb(13, 7, 7), rgb(189, 5, 13)]
export const nature =[rgb(63, 124, 7), rgb(201, 121, 66), rgb(213, 101, 23), rgb(177, 201, 80), rgb(180, 207, 127)]
export const greenpurple =[rgb(42, 4, 74), rgb(11, 46, 89), rgb(13, 103, 89), rgb(122, 179, 23), rgb(160, 197, 95)]
export const tealblue =[rgb(188, 242, 246), rgb(50, 107, 113), rgb(188, 242, 246), rgb(165, 148, 180)]
export const neon = ["A9336B", "5F2F88", "CB673D", "87BB38"].map(hexToRgb)
export const fire = ["F07F13", "800909", "F27D0C", "FDCF58"].map(hexToRgb)
export const buddhist = ["0000FF", "FFFF00", "FF0000", "FFFFFF", "FF9800"].map(hexToRgb)
export const flower = ["000E00", "003D00", "E4A900", "FEDEEF", "C99CB8"].map(hexToRgb)
export const bluepink = ["F2C6F2", "F8F0F0", "A6D1FF", "3988E1", "4C8600"].map(hexToRgb)
export const lime = ["FF4274", "DCD549", "ABDFAB", "437432", "033B45"].map(hexToRgb)

export function sat(s){ return  c.top("hsvadjust", {"saturationmult": s})
} export function edgesc(original){ return  c.cc((inputs: t.Node<"TOP">[]) => 
        c.top("composite", {"operand": c.mp(0)})
            .run([
                inputs[0].connect(c.tope("edge")), 
                inputs[0].connect(c.top("level", {"opacity": original}))
            ]))
} export function addops(nodes){ return  c.top("composite", { "operand":c.mp(0)}).run(nodes.map((n) => n.runT()))
} export function multops(nodes){ return  c.top("composite", { "operand":c.mp(27)}).run(nodes.map((n) => n.runT()))
} export function overops(nodes){ return  c.top("composite", { "operand":c.mp(31)}).run(nodes.map((n) => n.runT()))
} export function fadeops(idx, ops){ return  c.top("switch", { "blend": c.tp(true), "index": bounce(idx, 0.4)}).run(ops.map(o => o.runT()))
} export function bounce(fp, i){ return  c.absp(c.subp(c.modp(fp, c.fp(i * 2)), c.fp(1)))
} export function triggercount(l, f){ return  f.connect(c.chop("count", {
        "threshold": c.tp(true),
        "threshup": c.fp(0.5),
        "limitmax": c.fp(l),
        "output": c.mp(1)
    }))

} export function littleplanet(){ return  frag("little_planet.frag", {})

} export function triggerops(f, inputs){ return  c.top("switch", {
        "index": c.chan(c.ip(0), triggercount(inputs.length - 1, f))
    }).run(inputs.map((i) => i.runT()))

} export function triggerchops(f, inputs){ return  c.chop("switch", {
        "index": c.chan(c.ip(0), triggercount(inputs.length - 1, f))
    }).run(inputs.map((i) => i.runT()))
}

export function fade (opacity, midops = c.cc((inputs: t.Node<"TOP">[]) => inputs[0])) { return  c.cc((inputs: t.Node<"TOP">[]) => 
        c.feedbackChain(c.cc((fbinputs) => 
            c.top("composite", {"operand": c.mp(0)})
                .run(inputs.concat([
                    c.top("level", {"opacity": opacity})
                    .c(midops)
                    .run(fbinputs)
                ])))).run(inputs))
} export function secs(m){ return  c.multp(c.seconds, m)
} export function floor(f){ return  c.funcp("math.floor")(f)

} export function geo(params){ return  c.comp("geometry", Object.assign({externaltox: c.sp("toxes/Visuals/geo.tox")}, params))
} export function tox(tox, params){ return  c.comp("base", Object.assign({externaltox: c.sp(tox)}, params)) }
export function render(g, cam?: (t.Node<"COMP">| t.DisconnectedNode<"COMP">)[], light?: t.Node<"COMP">[] | t.DisconnectedNode<"COMP">[]) {
    return c.top("render", {
        lights: light === undefined ? c.compp([c.compe("light")]) : c.compp(light),
        geometry: c.compp(g),
        camera: cam === undefined ? c.compp([c.compe("camera")]) : c.compp(cam),
        resolutionw: c.ip(1920),
        resolutionh: c.ip(1080)
    })
} export function renderEasy(sop, instances, geoparams){ return  c.top("render", {
        "lights": c.compp([c.comp("light", { lighttype: c.mp(2) })]),
        "geometry": c.compp([
            sop.connect(c.comp("geometry", Object.assign({
                externaltox: c.sp("toxes/Visuals/geo.tox"),
                material: c.matp([c.mat("pbr", {
                    roughness: c.fp(0.2), 
                    metallic: c.fp(0.5),
                    rim1enable: c.tp(true),
                    rim1color: c.rgbp(c.fp(1), c.fp(0), c.fp(0.55)),
                })]),
                instanceop: c.chopp([instances]),
                instancing: c.tp(true),
                instancetx: c.sp("tx"),
                instancety: c.sp("ty"),
                instancetz: c.sp("tz"),
                instancerx: c.sp("rx"),
                instancery: c.sp("ry"),
                instancerz: c.sp("rz"),
                instancesx: c.sp("sx"),
                instancesy: c.sp("sy"),
                instancesz: c.sp("sz"),
            }, geoparams))),
        ]),
        "camera": c.compp([c.compe("camera")]),
        resolutionw: c.ip(1920),
        resolutionh: c.ip(1080)
    })
} export function sinC(i, phase, off){ 
    return  c.chop("wave", {
            "channelname": c.sp("rz"), 
            "end": i, 
            "endunit": c.mp(1), 
            phase: phase, 
            offset: off
    })
} export function scaleC(i, n){ return  c.chop("wave", {
        channelname: c.sp("sx"), 
        "end" : i, 
        "endunit": c.mp(1), 
        "wavetype": c.mp(4), 
        "period": i, 
        "amp": n
    })
} export function sidesTorus(sides, scale){ return  c.sop("torus", {
        orientation: c.fp(2),
        rows: c.fp(10),
        columns: sides,
        radius: c.xyp(scale, c.multp(scale, c.fp(0.5)))
    })
} export function line(ty, rz, sx, sy, sop, width, instances, mat){ 
        let tx = c.chop("wave", {
            channelname: c.sp("tx"), 
            end: instances,
            endunit: c.mp(1), 
            period: instances,
            amp: width,
            offset: c.fp(-0.5),
            "wavetype": c.mp(4), 
        });
        let typ = ty.connect(c.chop("resample", {
            rate: instances,
            timeslice: c.tp(false)
        })).connect(c.chop("rename", {renameto: c.sp("ty")}))
        let poses = c.chop("merge", {align: c.mp(7)}).run(
            [tx, typ, 
                rz.c(c.chop("rename", {renameto: c.sp("rz")})), 
                sx.c(c.chop("rename", {renameto: c.sp("sx")})), 
                sx.c(c.chop("rename", {renameto: c.sp("sz")})), 
                sy.c(c.chop("rename", {renameto: c.sp("sy")}))]
                .map((r) => r.runT()))
        let sgeo = sop.connect(geo({
            material: c.matp([mat]), 
            instanceop: c.chopp([poses]),
            instancing: c.tp(true),
            instancetx: c.sp("tx"),
            instancety: c.sp("ty"),
            instancetz: c.sp("tz"),
            instancerx: c.sp("rx"),
            instancery: c.sp("ry"),
            instancerz: c.sp("rz"),
            instancesx: c.sp("sx"),
            instancesy: c.sp("sy"),
            instancesz: c.sp("sz"),
        }))
        let centerCam = (t, r) => c.comp("camera", {
            translate: t,
            // pivot: v3mult (float (-1)) t,
            rotate: r
        })
        return render(sgeo)
    }
export function lineLines(width, scale, inst, sop){ 
        let instances = c.addp(inst, c.fp(2))
        return line(
            ain(scale).connect(
                c.chop("resample", {
                    method: c.mp(0), 
                    end: instances, 
                    endunit: c.mp(1),
                    timeslice: c.tp(false),
                    relative: c.mp(0)
                })),
            sinC(instances, c.fp(0), c.fp(0)),
            scaleC(instances, c.fp(10)),
            scaleC(instances, c.fp(10)),
            sop, width, instances, c.mate("wireframe").runT())
    }
export function centerCam(t, r){ return  c.comp("camera", {
        t: c.xyzp(c.fp(0), c.fp(0), t),
        p: c.xyzp(c.fp(0), c.fp(0), c.multp(c.fp(-1), t)),
        r: r === undefined ? c.xyzp(c.fp(0), c.fp(0), c.fp(0)) : r
    })
} export function decaywave(v){ 
    return  c.chop("wave", {
            wavetype: c.mp(1),
            end: c.fp(32), 
            endunit: c.mp(1),
            amp: c.fp(0.11),
            decay: c.fp(0.1),
            decayunit: c.mp(1),
            ramp: c.fp(0),
            rampunit: c.mp(1),
            period: c.fp(16),
            periodunit: c.mp(1),
            right: c.mp(0),
        })
        .c(c.chop("trim", { start: c.fp(2) }))
        .c(c.chop("math", { gain: c.fp(2) }))
} export function movecircle(off, off2){ 
    return constc({
            tx: c.multp(c.sinp(off), c.cosp(off2)),
            ty: c.multp(c.sinp(off), c.sinp(off2)),
            tz: c.cosp(off)
        })
} export function distfun(outerc, fun){ 
        return c.chop("math", { chopop: c.mp(2) })
            .run([outerc.runT(), fun.runT()])
            .c(c.chop("function", {func: c.mp(19), expval: c.fp(2)}))
            .c(c.chop("function", {func:c.mp(1)}))
            .c(c.chop("math", {chanop: c.mp(1)}))
}
export function geoGeo(instancesop, parentchop, scale, cam: t.Node<"COMP"> | t.DisconnectedNode<"COMP">, lightmap){
        let chop = 
            c.chop("merge").run([
                parentchop.runT(),
                scale.c(c.chop("rename", {renameto: c.sp("sx")})).runT(),
                scale.c(c.chop("rename", {renameto: c.sp("sy")})).runT(),
                scale.c(c.chop("rename", {renameto: c.sp("sz")})).runT()
                ])

        let metalic = c.mat("pbr", {
            roughness: c.fp(0.2), 
            metallic: c.fp(0.5),
            // rim1enable: c.tp(true),
            // rim1color: c.rgbp(c.fp(1), c.fp(0), c.fp(0.55)),
        })

        let sgeo = instancesop.connect(geo({
            material: c.matp([metalic]), 
            scale: c.fp(1),
            instanceop: c.chopp([chop]),
            instancing: c.tp(true),
            instancetx: c.sp("tx"),
            instancety: c.sp("ty"),
            instancetz: c.sp("tz"),
            instancerx: c.sp("rx"),
            instancery: c.sp("ry"),
            instancerz: c.sp("rz"),
            instancesx: c.sp("sx"),
            instancesy: c.sp("sy"),
            instancesz: c.sp("sz"),
        }))

        return render([sgeo], 
            [cam], 
            [c.comp("environmentlight", {
                envlightmap: c.topp([lightmap.runT()]),
                envlightmapprefilter: c.mp(0)
            })]
        )
    }
export function torusGeo(sop, lightmap){ 
        let s = c.chop("wave", {
            end: c.fp(50), 
            endunit: c.mp(1),
            amp: c.fp(0.1),
            phase: secs(c.fp(0.3)),
            offset: c.fp(1),
        })

        let torus = c.chop("sopto", {sop: c.sopp([c.sop("torus", { rows: c.ip(5), cols:c.ip(10)}).runT()])})
        let cam = centerCam(c.fp(5), c.xyzp(c.fp(-30), secs(c.fp(30)), c.fp(0)))

        return geoGeo(sop, torus, s, cam, lightmap)
    }
export function flocking(cohesion, sep, sp){ 
    return  tox("toxes/Visuals/flockingGpu.tox",
            { Cohesion: cohesion
            , Separation: sep
            , Alignment: cohesion
            , Speed: sp
            })
} export function sinct(t, i, w){ return  c.cc((inputs: t.Node<"TOP">[]) => 
        multops([
            c.top("chopto", {"chop": 
                c.chopp([sinC(i, t, w)])}).runT()
        ].concat(inputs)))
} export function tapbeat(input, g, reset){ 
        let beat = input.c(c.chop("logic", {preop: c.mp(5)})).runT()
        let beathold = c.chop("hold").run([
                c.chop("speed").run([const1(c.fp(1)).runT(), beat])
                        .c(c.chop("delay", {delay: c.fp(1), delayunit: c.mp(1)})), 
                beat]).c(c.chop("null", {cooktype: c.mp(2)})).runT()
        let beattrail = 
                c.chop("trail", {
                        wlength: c.fp(8), 
                        wlengthunit: c.mp(1), 
                        capture: c.mp(1)}).run([beathold])
                .c(c.chop("delete", {
                        delsamples: c.tp(true),
                        condition: c.mp(5),  
                        inclvalue1:c.tp(false)})).runT()
        let bps = c.chop("math", {postop: c.mp(5), gain: g})
                .c(c.chop("analyze", {function: c.mp(1)}))
                .run([beattrail])
        let beataccum = c.chop("speed").run([bps, reset.runT()])
        let finalbeat = 
                beataccum 
                    .c(c.chop("limit", {
                    max: c.fp(1), 
                    type: c.mp(2), 
                    min: c.fp(0)})) 
                    .c(c.chop("logic", {
                    boundmax: c.fp(0.08), 
                    preop: c.mp(5), 
                    convert: c.mp(2)}))
        return {beatpulse: finalbeat, bps: bps}
} export function tapbeatm9(){ return  tapbeat(mchop("b9"), (c.powp(c.fp(2), (floor(c.multp(c.subp(mchan("s1a"), c.fp(0.5)), c.fp(4)))))), mchop("b10"))

} export function beatramp(beat){ return  c.chop("speed", {resetcondition: c.mp(2)}).run([beat.bps, beat.beatpulse])
} export function beatxcount(x, reset, beat){ return  c.chop("count", { output: c.mp(1), limitmax: c.fp(x - 1) }).run([beat.beatpulse, reset])
} export function beatxpulse(x, reset, beat){ return  beatxcount(x, reset, beat).c(c.chop("logic", { preop: c.mp(6) }))
} export function beatxramp(x, reset, beat){ return  c.chop("speed").run([
                beat.bps.c(c.chop("math", { gain: c.fp(1/x) })).runT(), 
                beatxpulse(x, reset, beat).runT()
        ])
} export function beatseconds(b, reset){ return  c.multp(c.seconds, c.chan0(b.bps))
} export function tapbeatm9sec(){ return  beatseconds(tapbeatm9(), mchop("b10"))
} export function beatsecondschop(b){ return  c.chop("speed").run([b.bps.runT()])
} export function dmxtochop(dmx){ 
        switch(dmx.type) {
            case 'GenericRGB':
                return dmx.color
            case '5Chan':
                return c.chop("merge").run([
                    dmx.dim, dmx.color,
                    constc({ gen1: c.fp(0), gen2: c.fp(0) })
                ])
            case 'Fill':
                return constc(Object.assign({}, new Array(dmx.num).fill(c.fp(0))))
            case 'FillVal':
                return constc(Object.assign({}, new Array(dmx.num).fill(dmx.value)))
        }
} export function multchops(chops){ return  c.chop("math", {chopop: c.mp(3)}).run(chops)
} export function pulse(g, usb){ return  c.chop("datto", {
        firstrow: c.mp(1),
        firstcolumn: c.mp(2),
        dat: c.datp([c.dat("serial", { 
            port: c.sp(usb),
            maxlines: c.ip(1)
        }).runT()])})
        .c(c.chop("math", {gain: g === undefined ? c.fp(1) : g}))

} export function sensel(){ return  c.chop("cplusplus")
} export function senselchop(){ return  sensel().c(c.chop("select", {channames: c.sp("chan")})).c(c.chop("shuffle", { method: c.mp(8), nval: c.ip(185) }))
} export function senseltop(f = (n) => n){
        return c.top("chopto", { chop: c.chopp([f(senselchop())])})
        .c(c.top("flip", {flipy: c.tp(true)}))
        .c(c.top("resolution", {resolutionw: c.ip(1920), resolutionh: c.ip(1080), outputresolution: c.mp(9)}))
        .c(c.top("reorder", {format: c.mp(26), outputalphachan: c.mp(0)}))
} export function senseltouches(){ return  sensel().c(c.chop("select", {channames: c.sp("chan1")})).c(c.chop("delete", { delsamples: c.tp(true)}))
} export function gesture(mchan){ return  c.chop("gesture").run([
            sensel()
                .c(c.chop("select", { channames: c.sp("chan") }))
                .c(c.chop("shuffle", { method: c.mp(1)})), 
            mchop(mchan)
        ]).c(c.chop("shuffle", { 
            method: c.mp(4), 
            nval: c.ip(185), 
            firstsample: c.tp(true)
        }))
} export function gesturetop(chop){ return c.top("chopto", { chop: c.chopp([chop])})
            .c(c.top("flip", {flipy: c.tp(true)}))
            .c(c.top("resolution", {resolutionw: c.ip(1920), resolutionh: c.ip(1080), outputresolution: c.mp(9)}))
            .c(c.top("reorder", {format: c.mp(26), outputalphachan: c.mp(0)}))
} export function added(changes){ return  c.dat("table", {}, [], null, changes)
        .c(c.dat("select", { extractrows: c.mp(5), rownames: c.sp("added"), extractcols: c.mp(2), colindexstart: c.ip(1)}))
} export function addedchange(changes){ 
    return  c.chop("math", { gain: c.fp(0.8), chopop: c.mp(2), postop: c.mp(0) }).run([
            c.chop("info", { op: c.datp(added(changes)), iscope: c.sp("cook_abs_frame") }),
            c.chop("timeline", { absframe: c.tp(true), frame: c.tp(false) })
        ])
        .c(c.chop("logic", { preop: c.mp(1), convert: c.mp(0) }))
} export function addedtop(changes){ 
    return  fullscreentext(
            added(changes).c(c.dat("convert", { how: c.mp(0) })), 
            c.chan(c.sp("num_rows"), c.chop("info", { op: c.datp(added(changes)) })))
            .c(c.top("level", {  opacity:  c.chan0(addedchange(changes).c(c.chop("trigger", { 
                attack: c.fp(0),
                peak: c.fp(1),
                sustain: c.fp(1),
                minsustain: c.fp(5),
                release: c.fp(1)
             })))}))
} export function removed(changes){ return  c.dat("table", {}, [], null, changes)
        .c(c.dat("select", { extractrows: c.mp(5), rownames: c.sp("removed"), extractcols: c.mp(2), colindexstart: c.ip(1)}))
} export function removedchange(changes){ return  c.chop("math", { gain: c.fp(0.8), chopop: c.mp(2), postop: c.mp(0) }).run([
            c.chop("info", { op: c.datp(removed(changes)), iscope: c.sp("cook_abs_frame") }),
            c.chop("timeline", { absframe: c.tp(true), frame: c.tp(false) })
        ])
        .c(c.chop("logic", { preop: c.mp(1), convert: c.mp(0) }))
} export function removedtop(changes){ return  fullscreentext(
            removed(changes).c(c.dat("convert", { how: c.mp(0) })), 
            c.chan(c.sp("num_rows"), c.chop("info", { op: c.datp(removed(changes)) }))
            )
            .c(c.top("level", {  opacity:  c.chan0(addedchange(changes).c(c.chop("trigger", { 
                attack: c.fp(0),
                peak: c.fp(1),
                sustain: c.fp(1),
                minsustain: c.fp(2),
                release: c.fp(1)
             })))}))
} export function changestop(changes){ return  verticalstack([
        multops([c.top("constant", { color: c.rgbp(c.fp(0), c.fp(1), c.fp(0)) }), addedtop(changes)]),
        multops([c.top("constant", { color: c.rgbp(c.fp(1), c.fp(0), c.fp(0)) }), removedtop(changes)]),
    ]).c(c.top("fit", {  resolutionw: c.ip(1920) ,  resolutionh: c.ip(1080), outputresolution: c.mp(9), outputaspect: c.mp(1),  }))
} export function textdat(text){ return  c.dat("text", {}, [], null, text)
} export function fullscreentext(textdat, rowcount){ return  c.top("text", {
        dat: c.datp(textdat),
        "resolutionw": c.ip(1920), 
        "resolutionh": c.multp(c.ip(36), 
        c.casti(rowcount)), 
        "fontsizey": c.fp(18), 
        "alignx": c.mp(0),
        "aligny": c.mp(2),
        "dispmethod": c.mp(3),
        "fontautosize": c.mp(1),
        fontsizex: c.fp(16),
        text: c.sp(""),
        fontfile: c.sp("AnonymousPro-Regular.ttf") ,
        linespacing: c.fp(12) ,
        bgalpha: c.fp(0.4)
    })
} export function runop(op, opp){ return  c.cc((inputs) => op.run(inputs.concat([opp]))) }