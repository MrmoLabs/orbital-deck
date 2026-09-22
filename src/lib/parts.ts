import * as THREE from 'three';
import { OVERVIEW, type FocusId, type ModelDef } from './fleet';

/**
 * Framing target + HUD marker anchor for one bounding region.
 *
 * `center` is NOT the plain bounding-box centre: it is the vertex-mean
 * centroid of the region, and when that centroid floats in empty space (e.g.
 * between two symmetric solar wings) it snaps to the nearest real vertex.
 * OrbitControls then pivots around geometry the user can actually see,
 * instead of around the floating label.
 */
export interface Bounds {
    center: THREE.Vector3;
    radius: number;
}

/** One mesh of the loaded model plus its per-material subsystem mapping. */
export interface MeshEntry {
    mesh: THREE.Mesh;
    /** materials of this mesh, index = face materialIndex */
    materials: THREE.Material[];
    /** subsystem id for each material index */
    materialPart: string[];
}

export interface Analysis {
    entries: MeshEntry[];
    byMesh: Map<THREE.Object3D, MeshEntry>;
    bounds: Bounds;
    parts: Record<string, Bounds>;
}

/**
 * Fleet assets ship at wildly different scales (GOES ~0.2 units diagonal,
 * Hubble ~900). Rescale each model to one envelope so camera distances,
 * stars, lights and control limits can stay fixed.
 */
const TARGET_SIZE = 60;

/** Key for the whole-model accumulator; part ids can never equal this. */
const OVERALL = '\u0000overall';

interface Acc {
    min: THREE.Vector3;
    max: THREE.Vector3;
    sum: THREE.Vector3;
    count: number;
}

function newAcc(): Acc {
    return {
        min: new THREE.Vector3(Infinity, Infinity, Infinity),
        max: new THREE.Vector3(-Infinity, -Infinity, -Infinity),
        sum: new THREE.Vector3(0, 0, 0),
        count: 0,
    };
}

function grow(acc: Acc, x: number, y: number, z: number) {
    if (x < acc.min.x) acc.min.x = x;
    if (y < acc.min.y) acc.min.y = y;
    if (z < acc.min.z) acc.min.z = z;
    if (x > acc.max.x) acc.max.x = x;
    if (y > acc.max.y) acc.max.y = y;
    if (z > acc.max.z) acc.max.z = z;
    acc.sum.x += x;
    acc.sum.y += y;
    acc.sum.z += z;
    acc.count += 1;
}

function accOf(map: Map<string, Acc>, key: string): Acc {
    let a = map.get(key);
    if (!a) {
        a = newAcc();
        map.set(key, a);
    }
    return a;
}

/**
 * Walk the glTF, group vertices by subsystem (via material name), merge the
 * boxes in model-root space and derive surface-attached pivots per
 * subsystem. Used for camera framing and HUD marker anchors.
 *
 * Also normalizes the model scale in place (idempotent across remounts).
 */
export function analyzeModel(root: THREE.Object3D, model: ModelDef): Analysis | null {
    const meshes: THREE.Mesh[] = [];
    root.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) meshes.push(obj as THREE.Mesh);
    });
    if (meshes.length === 0) return null;

    // --- scale normalization (idempotent: divides out the current scale) ---
    const pre = new THREE.Box3().setFromObject(root);
    const measured = pre.getSize(new THREE.Vector3()).length();
    if (measured > 1e-6) {
        const cur = Math.abs(root.scale.x) > 1e-9 ? root.scale.x : 1;
        root.scale.setScalar((TARGET_SIZE * cur) / measured);
        root.updateMatrixWorld(true);
    }

    const v = new THREE.Vector3();

    /** Transform the 8 corners of a local box into root space and merge. */
    const mergeBox = (target: Acc, box: Acc, mtx: THREE.Matrix4) => {
        for (let i = 0; i < 8; i++) {
            v.set(
                i & 1 ? box.max.x : box.min.x,
                i & 2 ? box.max.y : box.min.y,
                i & 4 ? box.max.z : box.min.z,
            ).applyMatrix4(mtx);
            if (v.x < target.min.x) target.min.x = v.x;
            if (v.y < target.min.y) target.min.y = v.y;
            if (v.z < target.min.z) target.min.z = v.z;
            if (v.x > target.max.x) target.max.x = v.x;
            if (v.y > target.max.y) target.max.y = v.y;
            if (v.z > target.max.z) target.max.z = v.z;
        }
    };

    const entries: MeshEntry[] = [];
    const byMesh = new Map<THREE.Object3D, MeshEntry>();
    const globalAcc = new Map<string, Acc>();

    const groupsOf = (mesh: THREE.Mesh) => {
        const geo = mesh.geometry;
        const index = geo.getIndex();
        const count = index ? index.count : geo.getAttribute('position').count;
        return geo.groups.length > 0 ? geo.groups : [{ start: 0, count, materialIndex: 0 }];
    };

    // ---- pass 1: boxes + vertex means in local space, merged to root space ----
    for (const mesh of meshes) {
        mesh.updateWorldMatrix(true, false);
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const materialPart = materials.map((m) => model.resolve(m.name));
        const entry: MeshEntry = { mesh, materials, materialPart };
        entries.push(entry);
        byMesh.set(mesh, entry);

        const geo = mesh.geometry;
        const pos = geo.getAttribute('position');
        const index = geo.getIndex();
        const local = new Map<string, Acc>();

        const addVert = (vi: number, part: string) => {
            const x = pos.getX(vi);
            const y = pos.getY(vi);
            const z = pos.getZ(vi);
            grow(accOf(local, OVERALL), x, y, z);
            grow(accOf(local, part), x, y, z);
        };

        for (const g of groupsOf(mesh)) {
            const part = materialPart[g.materialIndex ?? 0] ?? model.fallback;
            if (index) {
                for (let i = g.start, end = g.start + g.count; i < end; i++) addVert(index.getX(i), part);
            } else {
                for (let i = g.start, end = g.start + g.count; i < end; i++) addVert(i, part);
            }
        }

        const mtx = mesh.matrixWorld;
        local.forEach((acc, key) => {
            const target = accOf(globalAcc, key);
            mergeBox(target, acc, mtx);
            if (acc.count > 0) {
                // the mean of an affinely transformed set transforms as a point
                v.copy(acc.sum).multiplyScalar(1 / acc.count).applyMatrix4(mtx);
                target.sum.addScaledVector(v, acc.count);
                target.count += acc.count;
            }
        });
    }

    // ---- centroids in root space ----
    const centroid = new Map<string, THREE.Vector3>();
    globalAcc.forEach((acc, key) => {
        centroid.set(
            key,
            acc.count > 0
                ? acc.sum.clone().multiplyScalar(1 / acc.count)
                : acc.min.clone().add(acc.max).multiplyScalar(0.5),
        );
    });

    // ---- pass 2: nearest / farthest vertex to each centroid, root space ----
    const nearest = new Map<string, { d2: number; p: THREE.Vector3 }>();
    const far2 = new Map<string, number>();
    const w = new THREE.Vector3();

    const track = (key: string) => {
        const c = centroid.get(key);
        if (!c) return;
        const d2 = w.distanceToSquared(c);
        const n = nearest.get(key);
        if (!n || d2 < n.d2) nearest.set(key, { d2, p: w.clone() });
        const f = far2.get(key);
        if (f === undefined || d2 > f) far2.set(key, d2);
    };

    for (const mesh of meshes) {
        const entry = byMesh.get(mesh);
        if (!entry) continue;
        const mtx = mesh.matrixWorld;
        const pos = mesh.geometry.getAttribute('position');
        const index = mesh.geometry.getIndex();

        const visit = (vi: number, part: string) => {
            w.set(pos.getX(vi), pos.getY(vi), pos.getZ(vi)).applyMatrix4(mtx);
            track(OVERALL);
            track(part);
        };

        for (const g of groupsOf(mesh)) {
            const part = entry.materialPart[g.materialIndex ?? 0] ?? model.fallback;
            if (index) {
                for (let i = g.start, end = g.start + g.count; i < end; i++) visit(index.getX(i), part);
            } else {
                for (let i = g.start, end = g.start + g.count; i < end; i++) visit(i, part);
            }
        }
    }

    // ---- final bounds: surface-attached pivot + conservative radius ----
    const toBounds = (key: string): Bounds => {
        const acc = globalAcc.get(key) ?? newAcc();
        const c = centroid.get(key) ?? new THREE.Vector3();
        const n = nearest.get(key);
        const f = far2.get(key) ?? 0;
        const halfDiag = acc.max.distanceTo(acc.min) * 0.5;
        // centroid floating in a gap (>> fraction of the box) → snap onto a vertex
        const pivot = n && Math.sqrt(n.d2) > 0.35 * halfDiag ? n.p : c;
        const radius = Math.sqrt(f) + c.distanceTo(pivot);
        return { center: pivot, radius: Math.max(radius, 1e-4) };
    };

    const parts: Analysis['parts'] = {};
    globalAcc.forEach((_acc, key) => {
        if (key !== OVERALL) parts[key] = toBounds(key);
    });

    return { entries, byMesh, bounds: toBounds(OVERALL), parts };
}

export interface CameraFrame {
    position: THREE.Vector3;
    target: THREE.Vector3;
}

/** Compute where the camera should fly for a given focus state. */
export function frameFor(analysis: Analysis, model: ModelDef, focus: FocusId): CameraFrame {
    if (focus !== OVERVIEW) {
        const b = analysis.parts[focus];
        const def = model.parts.find((p) => p.id === focus);
        if (b && def) {
            const dir = new THREE.Vector3(...def.dir).normalize();
            const dist = Math.max(b.radius * 3.4, analysis.bounds.radius * 0.15);
            return {
                position: b.center.clone().addScaledVector(dir, dist),
                target: b.center.clone(),
            };
        }
    }
    const dir = new THREE.Vector3(0.85, 0.42, 1.1).normalize();
    const dist = analysis.bounds.radius * 2.7;
    return {
        position: analysis.bounds.center.clone().addScaledVector(dir, dist),
        target: analysis.bounds.center.clone(),
    };
}
