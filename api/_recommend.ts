export function americanToDecimal(american: number): number {
    return american > 0 ? 1 + american / 100 : 1 + 100 / Math.abs(american);
}

export function impliedFromDecimal(decimalOdds: number): number {
    return 1 / decimalOdds;
}

export function removeVigTwoWay(pNrfiRaw: number, pYrfiRaw: number) {
    const z = pNrfiRaw + pYrfiRaw;
    return { pNrfiFair: pNrfiRaw / z, pYrfiFair: pYrfiRaw / z };
}

export function kelly(probWin: number, decimalOdds: number) {
    const b = decimalOdds - 1;
    const fraction = (probWin * (b + 1) - 1) / b;
    return Math.max(0, fraction);
}

export type RecCfg = {
    play: number;
    lean: number;
    strong: number;
    fracKelly: number;
    maxKelly: number;
};

export const defaultCfg: RecCfg = {
    play: 0.03,
    lean: 0.015,
    strong: 0.06,
    fracKelly: 0.5,
    maxKelly: 0.1
};

export function makeRecommendation(
    myNrfiProb: number,
    nrfiDecimalOdds?: number,
    yrfiDecimalOdds?: number,
    cfg: RecCfg = defaultCfg
) {
    if (!nrfiDecimalOdds) {
        return {
            pick: "NO-BET",
            label: "PASS",
            my_nrfi_prob: round4(myNrfiProb),
            market_nrfi_prob: null as number | null,
            edge: null as number | null,
            stake_fraction: 0,
            notes: "No odds"
        };
    }

    let marketNrfi = impliedFromDecimal(nrfiDecimalOdds);
    let notes = "Single-side odds (vig not removed)";
    if (yrfiDecimalOdds) {
        const fair = removeVigTwoWay(
            impliedFromDecimal(nrfiDecimalOdds),
            impliedFromDecimal(yrfiDecimalOdds)
        );
        marketNrfi = fair.pNrfiFair;
        notes = "Vig-adjusted from both sides";
    }

    const edge = myNrfiProb - marketNrfi;

    let label = "PASS" as "PASS" | "LEAN" | "PLAY" | "STRONG";
    if (edge >= cfg.strong) label = "STRONG";
    else if (edge >= cfg.play) label = "PLAY";
    else if (edge >= cfg.lean) label = "LEAN";

    let stake = 0;
    if (label !== "PASS") {
        stake = Math.min(cfg.maxKelly, cfg.fracKelly * kelly(myNrfiProb, nrfiDecimalOdds));
    }

    return {
        pick: label === "PASS" ? "NO-BET" : "NRFI",
        label,
        my_nrfi_prob: round4(myNrfiProb),
        market_nrfi_prob: round4(marketNrfi),
        edge: round4(edge),
        stake_fraction: round4(stake),
        notes
    };
}

function round4(x: number | null) {
    return x == null ? x : Math.round(x * 10000) / 10000;
}

