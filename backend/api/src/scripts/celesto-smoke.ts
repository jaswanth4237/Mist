import { runCelestoSmokeTest } from "../services/celesto.service.js";

async function main() {
    try {
        const result = await runCelestoSmokeTest();
        console.log(`Celesto computer ready: ${result.computerName}`);
        console.log(result.stdout.trim());

        if (result.exitCode !== 0) {
            console.error(result.stderr.trim());
            process.exitCode = result.exitCode || 1;
        }
    } catch (error) {
        console.error("Celesto smoke test failed:", error instanceof Error ? error.message : error);
        process.exitCode = 1;
    }
}

void main();
