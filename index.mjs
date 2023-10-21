#! /usr/bin/env node
import { config } from "dotenv";
import { getContacts, getDomains, getNameServerInfo, initApiClient, resetOutputDir, saveIntoFile } from "./src/helpers.mjs";
import { buildImport, buildResource, getContactTfResource, getDomainRecordTfResource, getDomainTfResource, isInwxDomain } from "./src/tfTransformers.mjs";

config();

console.log("Authenticating with credentials ...");
const apiClient = await initApiClient(
    process.env.INWX_USER ?? "",
    process.env.INWX_PASSWORD ?? "",
    process.env.INWX_2FA_SECRET
);

resetOutputDir();

/**
 * Catalog with the contact IDs and their corresponding Terraform identifiers.
 * Later on, this catalog will be used to replace the contact IDs received from the API with the Terraform identifiers 
 *  for the inwx_domain_contact resources.
 * @type {Record<number, string>}
 */
let contactIDs = {};
let importFileContent = "";

try {
    console.log("Processing contacts information ...");
    const contacts = await getContacts(apiClient)
        .then((contacts) => contacts.map(getContactTfResource));
    contactIDs = contacts.reduce((acc, contact) => ({ ...acc, [contact.roId]: contact.identifier }), {});
    importFileContent = contacts.map((resource) => resource.import).join("\n\n");
    const contactResources = contacts.map((resource) => resource.resource).join("\n\n");

    saveIntoFile(`./output/contacts.tf`, contactResources);

} catch (error) {
    console.error("Error fetching the list of domains:", error);
}

/**
 * @type {Array<import("./src/constants").DomainObject>}
 */
let domains = [];

try {
    console.log("Processing domains information ...");
    domains = await getDomains(apiClient)
        .then((domains) => domains
            .filter(isInwxDomain)
            .map(getDomainTfResource.bind(null, contactIDs))
        );
} catch (error) {
    console.error("Error fetching the list of domains:", error);
    process.exit(1);
}

const totalDomainsCount = domains.length;
for (let currDomainIndex = 0; currDomainIndex < totalDomainsCount; currDomainIndex++) {
    const domain = domains[currDomainIndex];
    const positionString = `${currDomainIndex + 1}/${totalDomainsCount}`;
    try {
        console.log(`${positionString} - Processing domain ${domain.domain} ...`)

        const records = await getNameServerInfo(apiClient, domain.domain)
            .then(dnsRecords => dnsRecords
                // SOA records are skipped because their values are automatically generated by INWX
                .filter(dnsRecord => dnsRecord.type !== "SOA")
                .map((dnsRecord) => getDomainRecordTfResource(domain.domain, dnsRecord))
            );

        /**
         * @type {string}
         */
        const recordsResources = records.map(buildResource).join("\n\n");

        importFileContent += `\n\n#Domain ${positionString}\n${domain.import}`;
        importFileContent += `\n\n${records.map(buildImport).join("\n\n")}`;
        const domainAndRecordsResources = `${domain.resource}\n\n${recordsResources}`;

        saveIntoFile(`./output/${domain.domain}.tf`, domainAndRecordsResources);
    } catch (error) {
        console.error(`${positionString} - Error processing domain ${domain.domain}:`, error);
    }
}

saveIntoFile(`./output/import.tf`, importFileContent);