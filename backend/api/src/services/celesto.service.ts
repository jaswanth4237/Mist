import { Computer } from "@celestoai/sdk";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";

export function isCelestoConfigured(): boolean {
    return Boolean(env.CELESTO_API_KEY);
}

function requireCelestoApiKey(): string {
    if (!env.CELESTO_API_KEY) {
        throw new Error("CELESTO_API_KEY is not configured.");
    }

    return env.CELESTO_API_KEY;
}

export async function runCelestoSmokeTest() {
    const computer = await Computer.create(
        {},
        {
            token: requireCelestoApiKey(),
            headers: { "Idempotency-Key": randomUUID() },
        }
    );

    try {
        const result = await computer.run("uname -a");
        return {
            computerName: computer.name,
            computerId: computer.id,
            exitCode: result.exitCode,
            stdout: result.stdout,
            stderr: result.stderr,
        };
    } finally {
        await computer.delete();
    }
}
