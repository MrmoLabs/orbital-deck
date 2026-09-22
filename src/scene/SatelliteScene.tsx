import { useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import { FUI_CYAN, OVERVIEW, type FocusId, type ModelDef } from '../lib/fleet';
import type { Analysis } from '../lib/parts';
import { PartMarker } from './PartMarker';

const CYAN = new THREE.Color(FUI_CYAN);

interface ColoredMaterial extends THREE.Material {
    color?: THREE.Color;
    emissive?: THREE.Color;
    wireframe?: boolean;
}

/** Base colors are tagged onto the material itself so they survive remounts. */
interface TaggedMaterial extends ColoredMaterial {
    __fuiBaseColor?: THREE.Color;
    __fuiBaseEmissive?: THREE.Color;
}

interface MatRuntime {
    mat: TaggedMaterial;
    dim: number;
    part: string;
}

interface RuntimeStore {
    analysis: Analysis | null;
    list: MatRuntime[];
}

interface SatelliteSceneProps {
    scene: THREE.Object3D;
    analysis: Analysis;
    model: ModelDef;
    focus: FocusId;
    wireframe: boolean;
    autoRotate: boolean;
    onPick: (id: FocusId) => void;
}

/**
 * Renders the fleet glTF, keeps a per-subsystem highlight state (dim everything
 * except the focused subsystem, pulse cyan emissive on it) and exposes
 * raycast picking through the mesh's materialIndex groups.
 */
export function SatelliteScene({
    scene,
    analysis,
    model,
    focus,
    wireframe,
    autoRotate,
    onPick,
}: SatelliteSceneProps) {
    const groupRef = useRef<THREE.Group>(null);
    const hoverRef = useRef<string | null>(null);
    const storeRef = useRef<RuntimeStore>({ analysis: null, list: [] });

    // Camera frames are computed in unrotated model space, so when a
    // subsystem is focused the model eases back to its canonical orientation
    // — otherwise the orbit pivot would trail behind the spinning geometry.
    useEffect(() => {
        const rot = groupRef.current?.rotation;
        if (!rot) return;
        gsap.killTweensOf(rot);
        if (focus !== OVERVIEW) {
            gsap.to(rot, { y: 0, duration: 1.4, ease: 'power3.inOut' });
        }
        return () => {
            gsap.killTweensOf(rot);
        };
    }, [focus]);

    const buildRuntime = (store: RuntimeStore, next: Analysis): MatRuntime[] => {
        store.analysis = next;
        const list: MatRuntime[] = [];
        for (const entry of next.entries) {
            entry.materials.forEach((mat, i) => {
                const m = mat as TaggedMaterial;
                m.__fuiBaseColor ??= m.color ? m.color.clone() : undefined;
                m.__fuiBaseEmissive ??= m.emissive ? m.emissive.clone() : undefined;
                if (m.__fuiBaseColor && m.color) m.color.copy(m.__fuiBaseColor);
                if (m.__fuiBaseEmissive && m.emissive) m.emissive.copy(m.__fuiBaseEmissive);
                m.wireframe = wireframe;
                list.push({
                    mat: m,
                    dim: 1,
                    part: entry.materialPart[i] ?? model.fallback,
                });
            });
        }
        return list;
    };

    useFrame((state, delta) => {
        const store = storeRef.current;
        if (store.analysis !== analysis) {
            store.list = buildRuntime(store, analysis);
        }
        const runtime = store.list;
        if (runtime.length === 0) return;

        const t = state.clock.elapsedTime;
        const pulse = (Math.sin(t * 3) + 1) / 2;
        const dt = Math.min(delta, 0.1);
        const hovered = hoverRef.current;

        for (const r of runtime) {
            r.mat.wireframe = wireframe;

            const targetDim = focus === OVERVIEW || r.part === focus ? 1 : 0.22;
            r.dim = THREE.MathUtils.damp(r.dim, targetDim, 6, dt);
            const baseColor = r.mat.__fuiBaseColor;
            if (baseColor && r.mat.color) r.mat.color.copy(baseColor).multiplyScalar(r.dim);

            let k = 0.04;
            if (focus !== OVERVIEW && r.part === focus) k = 0.26 + 0.3 * pulse;
            else if (hovered === r.part) k = 0.16;

            const baseEm = r.mat.__fuiBaseEmissive;
            if (baseEm && r.mat.emissive) {
                r.mat.emissive.copy(baseEm);
                r.mat.emissive.r += CYAN.r * k;
                r.mat.emissive.g += CYAN.g * k;
                r.mat.emissive.b += CYAN.b * k;
            }
        }

        if (groupRef.current && autoRotate && focus === OVERVIEW) {
            groupRef.current.rotation.y += dt * 0.06;
        }
    });

    const pickFromEvent = (e: ThreeEvent<MouseEvent>): string | null => {
        const entry = analysis.byMesh.get(e.object);
        const idx = e.face?.materialIndex;
        if (!entry || idx === undefined || idx === null) return null;
        return entry.materialPart[idx] ?? model.fallback;
    };

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        // Ignore the pointer-up at the end of an orbit drag (r3f reports how
        // far the pointer travelled since press as `delta`).
        const delta = (e as { delta?: number }).delta;
        if (typeof delta === 'number' && delta > 6) return;
        e.stopPropagation();
        const part = pickFromEvent(e);
        if (part) onPick(part);
    };

    const handleOver = (e: ThreeEvent<PointerEvent>) => {
        document.body.style.cursor = 'pointer';
        hoverRef.current = pickFromEvent(e as unknown as ThreeEvent<MouseEvent>);
    };

    const handleOut = () => {
        document.body.style.cursor = '';
        hoverRef.current = null;
    };

    const markers = useMemo(
        () =>
            model.parts
                .filter((p) => analysis.parts[p.id])
                .map((p) => ({ def: p, center: analysis.parts[p.id].center })),
        [analysis, model],
    );

    return (
        <group ref={groupRef}>
            <primitive
                object={scene}
                onClick={handleClick}
                onPointerOver={handleOver}
                onPointerOut={handleOut}
            />
            {markers.map((m) => (
                <PartMarker
                    key={m.def.id}
                    partId={m.def.id}
                    code={m.def.code}
                    name={m.def.name}
                    position={[m.center.x, m.center.y, m.center.z]}
                    focused={focus === m.def.id}
                />
            ))}
        </group>
    );
}
