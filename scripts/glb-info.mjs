import { readFileSync } from 'node:fs';

function parseGlb(path) {
    const buf = readFileSync(path);
    const magic = buf.toString('ascii', 0, 4);
    if (magic !== 'glTF') throw new Error(`not a glb: ${path}`);
    const jsonLen = buf.readUInt32LE(12);
    const json = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
    return json;
}

const files = process.argv.slice(2);
for (const f of files) {
    const j = parseGlb(f);
    console.log(`\n===== ${f.split(/[\\/]/).pop()} =====`);
    console.log(`nodes=${j.nodes?.length ?? 0} meshes=${j.meshes?.length ?? 0} materials=${j.materials?.length ?? 0} animations=${j.animations?.length ?? 0} textures=${j.textures?.length ?? 0}`);
    console.log('materials:', (j.materials ?? []).map((m) => m.name).join(' | '));
    const nodeNames = (j.nodes ?? []).map((n) => n.name).filter(Boolean);
    if (nodeNames.length) console.log('nodes:', nodeNames.slice(0, 40).join(' | '));
    // overall bbox from POSITION accessors
    let min = [Infinity, Infinity, Infinity];
    let max = [-Infinity, -Infinity, -Infinity];
    for (const mesh of j.meshes ?? []) {
        for (const p of mesh.primitives ?? []) {
            const ai = p.attributes?.POSITION;
            if (ai == null) continue;
            const acc = j.accessors[ai];
            if (!acc?.min) continue;
            for (let k = 0; k < 3; k++) {
                min[k] = Math.min(min[k], acc.min[k]);
                max[k] = Math.max(max[k], acc.max[k]);
            }
        }
    }
    // node transforms shift things; approximate using node translation if single-level — skip, print raw
    console.log(`bbox raw: [${min.map((v) => v.toFixed(1))}] .. [${max.map((v) => v.toFixed(1))}]`);
    const matsPerMesh = (j.meshes ?? []).map((m, i) => `${i}:${m.primitives?.length ?? 0}prim`);
    console.log('mesh primitives:', matsPerMesh.join(' '));
}
