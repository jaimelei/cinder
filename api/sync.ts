import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "method not allowed" });
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        return res.status(500).json({ error: "github token not configured" });
    }

    const response = await fetch(
        "https://api.github.com/repos/jaimelei/cinder/actions/workflows/sync.yml/dispatches",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ref: "main" }),
        }
    );

    // 204 = success, GitHub returns no body
    if (response.status === 204) {
        return res.status(200).json({ success: true });
    }

    const body = await response.text();
    return res.status(response.status).json({ error: body });
}