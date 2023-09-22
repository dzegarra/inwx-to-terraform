import { writeFileSync, rmSync, existsSync } from "fs"
import { config } from "dotenv";
import { getDomains, initApiClient } from "./src/helpers.mjs";
import { getDomainTfResources } from "./src/tfTransformers.mjs";

config();

console.log("Authenticating with credentials...");
const apiClient = await initApiClient();

try {
    console.log("Processing domains information...");
    const domains = await getDomains(apiClient);
    const tfDomainResources = getDomainTfResources(domains);
    if (existsSync("./output/domains.tf")) rmSync("./output/domains.tf");
    writeFileSync("./output/domains.tf", tfDomainResources);
} catch (error) {
    console.error(error);
    process.exit(1);
}