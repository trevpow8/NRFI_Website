export type Features = {
    pitcherEraHome?: number;
    pitcherEraAway?: number;
};

export function predictNrfiProb(features: Features): number {
    const eraHome = features.pitcherEraHome ?? 4.0;
    const eraAway = features.pitcherEraAway ?? 4.0;

    const z = 1.25 - 0.22 * (eraHome - 4.0) - 0.20 * (eraAway - 4.0);
    const p = 1 / (1 + Math.exp(-z));
    return Math.min(Math.max(p, 0.05), 0.95);
}

