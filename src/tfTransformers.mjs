import { printKeyValues } from "./helpers.mjs";

/**
 * @param {import("./constants").Domain} domain 
 * @returns {boolean}
 */
export const isInwxDomain = (domain) => domain.ns.includes("ns.inwx.de");

/**
 * Generates a valid Terraform resource identifier.
 * @param {string} name
 * @returns {string}
 */
export const genResourceIdentifier = (name) => name.toLocaleLowerCase().replace(/[^\w\d\p{L}_\-]/gui, "_").replace("__", "_");

/**
 * Generates a valid Terraform resource identifier from a record name.
 * @param {string} domainName
 * @param {import("./constants").DomainRecord} record
 * @returns {string}
 */
export const getRecordResourceIdentifier = (domainName, record) => {
    const domainIdentifier = genResourceIdentifier(domainName);
    const recordIdentifier = genResourceIdentifier(record.name);
    let finalRecordIdentifier = recordIdentifier.replace(domainIdentifier, "");

    if (finalRecordIdentifier.endsWith("_")) finalRecordIdentifier = finalRecordIdentifier.slice(0, -1);

    if (record.type === "TXT" && record.content.includes("v=spf1")) {
        finalRecordIdentifier += "_spf";
    }

    return `${genResourceIdentifier(domainName)}_${record.type.toLowerCase()}${finalRecordIdentifier.length > 0 ? ("_" + finalRecordIdentifier).replace("__", "_") : ""}`;
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
 * @param {Record<number, string>} contactIDs 
 * @param {number} contactID 
 * @returns {string}
 */
const resolveContactIdentifier = (contactIDs, contactID) => {
    if (contactIDs[contactID])
        return `inwx_domain_contact.${contactIDs[contactID]}`;
    throw new Error(`Contact with ID ${contactID} not found.`);
}

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
 * @param {import("./constants").Contact} contact
 * @returns {import("./constants").ContactObject}
 */
export const getContactTfResource = (contact) => {
    const identifier = genResourceIdentifier(`${contact.type}_${contact.name}`);
    const importResource = `import {
    id = ${contact.id}
    to = inwx_domain_contact.${identifier}
}`;
    const resourceParams = {
        type: contact.type,
        name: contact.name,
        street_address: contact.street,
        city: contact.city,
        postal_code: contact.pc,
        country_code: contact.cc,
        phone_number: contact.voice,
        email: contact.email,
        ...(contact.org ? { organization: contact.org } : {}),
        ...(contact.sp ? { state_province: contact.sp } : {}),
        ...(contact.fax ? { fax: contact.fax } : {}),
        ...(contact.remarks ? { remarks: contact.remarks } : {}),
        ...(contact.protection ? { whois_protection: contact.protection } : {}),
    }
    return {
        identifier,
        roId: contact.id,
        import: importResource,
        resource: printKeyValues("inwx_domain_contact", identifier, resourceParams)
    };
}

/**
 * @param {Record<number, string>} contactIDs
 * @param {import("./constants").Domain} domain
 * @returns {import("./constants").DomainObject}
 */
export const getDomainTfResource = (contactIDs, domain) => {
    const identifier = genResourceIdentifier(domain.domain);
    const whoisProtection = domain.extData?.['WHOIS-PROTECTION'];
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
        admin = ${resolveContactIdentifier(contactIDs, domain.admin)}.id
        billing = ${resolveContactIdentifier(contactIDs, domain.billing)}.id
        registrant = ${resolveContactIdentifier(contactIDs, domain.registrant)}.id
        tech = ${resolveContactIdentifier(contactIDs, domain.tech)}.id
    }${whoisProtection !== undefined ? `
    extra_data = {
        "WHOIS-PROTECTION" = "${whoisProtection}"
    }` : ""}
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
                name: record.name,
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
            return printKeyValues("inwx_nameserver_record", identifier, finalRecord);
        }
    };
}