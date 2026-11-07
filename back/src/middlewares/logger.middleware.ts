import type { Request, Response, NextFunction } from "express";

function sanitize(data: unknown): unknown {
    if (!data || typeof data !== "object") return data;
    if (Array.isArray(data)) return data.map(sanitize);

    const copy: Record<string, unknown> = { ...(data as Record<string, unknown>) };
    for (const key of Object.keys(copy)) {
        if (/pass|token|secret|auth|cred/i.test(key)) {
            copy[key] = "********";
        } else if (typeof copy[key] === "object") {
            copy[key] = sanitize(copy[key]);
        }
    }
    return copy;
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    const timestamp = new Date().toLocaleTimeString("es-AR", { hour12: false });
    const method = req.method;
    const url = req.originalUrl || req.url;

    const hasBody = req.body && Object.keys(req.body).length > 0;
    const hasQuery = req.query && Object.keys(req.query).length > 0;

    let incomingDetails = "";
    if (hasQuery) incomingDetails += ` | Query: ${JSON.stringify(req.query)}`;
    if (hasBody) incomingDetails += ` | Body: ${JSON.stringify(sanitize(req.body))}`;

    console.log(`[REQ] ${timestamp} -> ${method} ${url}${incomingDetails}`);

    res.on("finish", () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const tag = status >= 500 ? "ERROR" : status >= 400 ? "WARN" : "OK";
        console.log(`[RES] ${timestamp} <- ${method} ${url} [${status}] (${duration}ms) [${tag}]`);
    });

    next();
}

