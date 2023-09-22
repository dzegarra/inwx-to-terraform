
/**
 * 
 * @param {Array<import("./constants").Domain>} domains 
 * @returns Array<string>
 */
export const getDomainTfResources = (domains) => domains.filter(domain => domain.ns.includes("ns.inwx.de"))
    .map((domain) => {
        const identifier = domain.domain.replace(/\./g, "_").replace(/[^a-zA-Z0-9_\- ]/g, '');
        return `import {
    id = "${domain.domain}"
    to = inwx_domain.${identifier}
}
resource "inwx_domain" "${identifier}" {
    name = "${domain.domain}"
    nameservers = [${domain.ns.map(n => `"${n}"`).join(",")}]
    period = "${domain.period}"
    renewal_mode = "${domain.renewalMode}"
    transfer_lock = "${domain.transferLock}"
    contacts {
        admin = ${domain.admin}
        billing = ${domain.billing}
        registrant = ${domain.registrant}
        tech = ${domain.tech}
    }
}`
    }).join("\n\n");