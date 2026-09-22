import { readFileSync } from 'node:fs';

function parseGlb(path) {
    const buf = readFileSync(path);
    if (buf.toString('ascii', 0, 4) !== 'glTF') throw new Error(`not a glb: ${path}`);
    const jsonLen = buf.readUInt32LE(12);
    return JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
}

for (const f of process.argv.slice(2)) {
    const j = parseGlb(f);
    console.log(`\n===== ${f.split(/[\\/]/).pop()} =====`);
    const byMat = new Map();
    for (const mesh of j.meshes ?? []) {
        for (const p of mesh.primitives ?? []) {
            const ai = p.attributes?.POSITION;
            if (ai == null) continue;
            const acc = j.accessors[ai];
            if (!acc?.min) continue;
            const name = p.material != null ? (j.materials[p.material]?.name ?? `#${p.material}`) : '(none)';
            let b = byMat.get(name);
            if (!b) {
                b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
                byMat.set(name, b);
            }
            for (let k = 0; k < 3; k++) {
                b[k] = Math.min(b[k], acc.min[k]);
                b[3 + k] = Math.max(b[3 + k], acc.max[k]);
            }
        }
    }
    for (const [name, b] of byMat) {
        const size = [0, 1, 2].map((k) => (b[3 + k] - b[k]).toFixed(1));
        const center = [0, 1, 2].map((k) => ((b[3 + k] + b[k]) / 2).toFixed(1));
        console.log(`  ${name.padEnd(32)} size=[${size}] center=[${center}]`);
    }
}
