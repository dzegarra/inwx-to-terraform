/**
 * @param {import("./constants").Domain} domain 
 * @returns {boolean}
 */
export const isInwxDomain = (domain) => domain.ns.includes("ns.inwx.de");

/**
 * Generates a valid Terraform resource identifier from a domain name.
 * @param {string} domainName
 * @returns {string}
 */
export const getDomainResourceIdentifier = (domainName) => domainName.replace(/[^\w\d\p{L}_\-]/gui, "_").replace("__", "_");

/**
 * Generates a valid Terraform resource identifier from a record name.
 * @param {string} domainName
 * @param {import("./constants").DomainRecord} record
 * @returns {string}
 */
export const getRecordResourceIdentifier = (domainName, record) => {
    const domainIdentifier = getDomainResourceIdentifier(domainName);
    const recordIdentifier = getDomainResourceIdentifier(record.name);
    let finalRecordIdentifier = recordIdentifier.replace(domainIdentifier, "");

    if (finalRecordIdentifier.endsWith("_")) finalRecordIdentifier = finalRecordIdentifier.slice(0, -1);

    if (record.type === "TXT" && record.content.includes("v=spf1")) {
        finalRecordIdentifier+= "_spf";
    }

    return `${getDomainResourceIdentifier(domainName)}_${record.type.toLowerCase()}${finalRecordIdentifier.length > 0 ? ("_" + finalRecordIdentifier).replace("__", "_") : ""}`;
}

/**
 * @param {Array<import("./constants").RecordResourceGenerator>} records 
 * @param {string} identifier 
 * @param {number} index
 * @returns {number}
 */
const countSameIdentifiersBeforeIndex = (records, identifier, index) =>
    records.slice(0, index).filter((r) => r.identifier === identifier).length;

/**
 * @param {import("./constants").RecordResourceGenerator} record 
 * @param {number} index 
 * @param {Array<import("./constants").RecordResourceGenerator>} allRecords 
 * @returns string
 */
export const buildImport = (record, index, allRecords) => {
    const sameIdCounter = countSameIdentifiersBeforeIndex(allRecords, record.identifier, index);
    return record.buildImport(record.identifier + (sameIdCounter > 0 ? sameIdCounter + 1 : ""));
}

/**
 * @param {import("./constants").RecordResourceGenerator} record 
 * @param {number} index 
 * @param {Array<import("./constants").RecordResourceGenerator>} allRecords 
 * @returns string
 */
export const buildResource = (record, index, allRecords) => {
    const sameIdCounter = countSameIdentifiersBeforeIndex(allRecords, record.identifier, index);
    return record.buildResource(record.identifier + (sameIdCounter > 0 ? sameIdCounter + 1 : ""));
}

/**
 * @param {import("./constants").Domain} domain
 * @returns {import("./constants").DomainResource}
 */
export const getDomainTfResource = (domain) => {
    const identifier = getDomainResourceIdentifier(domain.domain);
    const importResource = `import {
    id = "${domain.domain}"
    to = inwx_domain.${identifier}
}`;
    const domainResource = `resource "inwx_domain" "${identifier}" {
    name = "${domain.domain}"
    nameservers = [${domain.ns.map(n => `"${n}"`).join(",")}]
    period = "${domain.period}"
    renewal_mode = "${domain.renewalMode}"
    transfer_lock = ${domain.transferLock ? 'true' : 'false'}
    contacts {
        admin = ${domain.admin}
        billing = ${domain.billing}
        registrant = ${domain.registrant}
        tech = ${domain.tech}
    }
}`;

    return { domain: domain.domain, identifier, import: importResource, resource: domainResource };
}

/**
 * @param {string} domainName 
 * @param {import("./constants").DomainRecord} record
 * @returns {import("./constants").RecordResourceGenerator}
 */
export const getDomainRecordTfResource = (domainName, record) => {
    const proposedIdentifier = getRecordResourceIdentifier(domainName, record);
    return {
        domain: domainName,
        identifier: proposedIdentifier,
        buildImport: (identifier = proposedIdentifier) => `import {
    id = "${domainName}:${record.id}"
    to = inwx_nameserver_record.${identifier}
}`,
        buildResource: (identifier = proposedIdentifier) => {
            const finalRecord = {
                domain: domainName,
                type: record.type,
                ...(record.name !== domainName ? { name: record.name } : {}),
                content: record.content,
                ...(record.ttl !== 3600 ? { ttl: record.ttl } : {}),
                ...(record.prio !== 0 ? { prio: record.prio } : {}),
                ...(record.urlRedirectType ? { url_redirect_type: record.urlRedirectType } : {}),
                ...(record.urlRedirectTitle ? { url_redirect_title: record.urlRedirectTitle } : {}),
                ...(record.urlRedirectDescription ? { url_redirect_description: record.urlRedirectDescription } : {}),
                ...(record.urlRedirectFavIcon ? { url_redirect_fav_icon: record.urlRedirectFavIcon } : {}),
                ...(record.urlRedirectKeywords ? { url_redirect_keywords: record.urlRedirectKeywords } : {}),
                ...(record.urlAppend ? { url_append: record.urlAppend } : {}),
            }
            return `resource "inwx_nameserver_record" "${identifier}" {
    ${Object.entries(finalRecord).map(([key, value]) => `${key} = ${typeof value === "string" ? `"${value}"` : value}`).join("\n    ")}
}`
        }
    };
}