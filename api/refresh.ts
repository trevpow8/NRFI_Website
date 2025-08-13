import { put } from '@vercel/blob';
import { predictNrfiProb } from './_model';
import { makeRecommendation } from './_recommend';

const MODEL_VERSION = 'nrfi-v0.1-logistic';

function chicagoDateYMD(): string {
    const now = new Date();
    const ymd = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(now);
    return ymd; // YYYY-MM-DD
}

async function fetchMlbSchedule(dateYmd: string) {
    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${dateYmd}&hydrate=probablePitchers`; // probable pitchers
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch MLB schedule: ${res.status}`);
    }
    return res.json();
}

function mapGame(g: any) {
    const awayTeam = g?.teams?.away?.team?.name ?? 'TBD';
    const homeTeam = g?.teams?.home?.team?.name ?? 'TBD';
    const awayPitcher = g?.teams?.away?.probablePitcher?.fullName ?? 'TBD';
    const homePitcher = g?.teams?.home?.probablePitcher?.fullName ?? 'TBD';

    const myNrfi = predictNrfiProb({});
    const rec = makeRecommendation(myNrfi);

    return {
        game_id: g?.gamePk,
        away_team: awayTeam,
        home_team: homeTeam,
        game_time: g?.gameDate,
        status: g?.status?.detailedState ?? 'Scheduled',
        away_pitcher: awayPitcher,
        home_pitcher: homePitcher,
        nrfi_probability: myNrfi,
        yrfi_probability: 1 - myNrfi,
        recommendation: rec.label
    };
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        res.setHeader('Allow', 'GET, POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
        return res.status(500).json({ error: 'Missing BLOB_READ_WRITE_TOKEN' });
    }

    try {
        const dateYmd = chicagoDateYMD();
        const schedule = await fetchMlbSchedule(dateYmd);
        const games = (schedule?.dates?.[0]?.games ?? []).map(mapGame);

        const payload = {
            last_updated: new Date().toISOString(),
            model_version: MODEL_VERSION,
            items: games
        };

        await put('today.json', JSON.stringify(payload), {
            token,
            access: 'public',
            addRandomSuffix: false,
            contentType: 'application/json; charset=utf-8',
            cacheControl: 'public, max-age=0'
        });

        return res.status(200).json({ ok: true, count: games.length, date: dateYmd });
    } catch (err: any) {
        console.error('refresh error', err);
        return res.status(500).json({ error: 'Refresh failed', message: err?.message ?? String(err) });
    }
}

