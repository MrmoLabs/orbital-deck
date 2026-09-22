/**
 * Fleet domain types + shared helpers. The concrete spacecraft live in
 * ./models/* and are assembled into FLEET by ./index.ts.
 */

export type FocusId = string; // 'overview' | a PartDef id
export const OVERVIEW: FocusId = 'overview';

/** A single simulated telemetry channel. */
export interface MetricDef {
    key: string;
    label: string;
    unit: string;
    base: number;
    /** random-walk amplitude per tick */
    spread: number;
    decimals: number;
}

/** A physical subsystem of a spacecraft, mapped from GLB material names. */
export interface PartDef {
    id: string;
    code: string;
    name: string;
    nameZh: string;
    blurb: string;
    /** camera approach direction in model space */
    dir: [number, number, number];
    metrics: MetricDef[];
}

export interface ModelDef {
    id: string;
    /** short code used in the fleet selector */
    code: string;
    name: string;
    nameZh: string;
    url: string;
    /** heading for the always-visible orbit/telemetry block */
    commonLabel: string;
    parts: PartDef[];
    common: MetricDef[];
    /** map a GLB material name onto a part id (fallback: last rule miss) */
    resolve: (materialName: string) => string;
    /** part id used when nothing matches */
    fallback: string;
}

/** Build a material-name → part resolver from ordered substring rules. */
export const resolver =
    (rules: Array<[string, string]>, fallback: string) =>
    (materialName: string): string => {
        const n = (materialName ?? '').toLowerCase();
        for (const [sub, id] of rules) {
            if (n.includes(sub)) return id;
        }
        return fallback;
    };

export function partById(model: ModelDef, id: FocusId): PartDef | undefined {
    return model.parts.find((p) => p.id === id);
}

/** All telemetry channels of a model, in display order. */
export function metricsOf(model: ModelDef): MetricDef[] {
    return [...model.common, ...model.parts.flatMap((p) => p.metrics)];
}
