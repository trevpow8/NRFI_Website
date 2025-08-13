import { get } from '@vercel/blob';

export default async function handler(req: any, res: any) {
    try {
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        const { url } = await get('today.json', { token });
        const r = await fetch(url);
        if (!r.ok) throw new Error(`Blob fetch failed: ${r.status}`);
        const json = await r.json();

        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
        return res.status(200).json(json);
    } catch (err: any) {
        // Graceful empty response if blob missing
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=10');
        return res.status(200).json({ last_updated: null, model_version: 'nrfi-v0.1-logistic', items: [] });
    }
}

