import { config } from "dotenv";
import { getDomains, getNameServerInfo, initApiClient, resetOutputDir, saveIntoFile } from "./src/helpers.mjs";
import { buildImport, buildResource, getDomainRecordTfResource, getDomainTfResource, isInwxDomain } from "./src/tfTransformers.mjs";

config();

console.log("Authenticating with credentials...");
const apiClient = await initApiClient(
    process.env.INWX_USER ?? "",
    process.env.INWX_PASSWORD ?? "",
    process.env.INWX_2FA_SECRET
);

resetOutputDir();

/**
 * @type {Array<import("./src/constants").DomainResource>}
 */
let domains = [];

try {
    console.log("Processing domains information:");
    domains = await getDomains(apiClient)
        .then((domains) => domains.filter(isInwxDomain))
        .then((domains) => domains.map(getDomainTfResource));
} catch (error) {
    console.error("Error fetching the list of domains:", error);
    process.exit(1);
}

let importResources = domains.map((domainResource) => domainResource.import).join("\n\n");

for (const domain of domains) {
    let domainResource = domain.resource;
    
    try {
        console.log(`Processing domain ${domain.domain}...`)

        const records = await getNameServerInfo(apiClient, domain.domain)
            .then(records => records.map((record) => getDomainRecordTfResource(domain.domain, record)));

        const recordImports = records.map(buildImport).join("\n\n");
        const recordResources = records.map(buildResource).join("\n\n");

        importResources += `\n\n${recordImports}`;
        domainResource += `\n\n${recordResources}`;

        saveIntoFile(`./output/${domain.domain}.tf`, domainResource);
    } catch (error) {
        console.error("Error fetching the nameserver information of the domain:", error);
    }

    saveIntoFile(`./output/import.tf`, importResources);
} 