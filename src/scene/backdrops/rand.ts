/** Deterministic pseudo-random in [0,1) — keeps geometry builds pure/idempotent. */
export function rand(i: number): number {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
}
