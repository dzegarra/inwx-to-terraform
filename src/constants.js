/**
 * @enum {string}
 */
export const Period = {
    '1M': '1M',
    '1Y': '1Y',
    '2Y': '2Y',
    '3Y': '3Y',
    '4Y': '4Y',
    '5Y': '5Y',
    '6Y': '6Y',
    '7Y': '7Y',
    '8Y': '8Y',
    '9Y': '9Y',
    '10Y': '10Y',
}

/**
 * @enum {string}
 */
export const RenewalMode = {
    'AUTORENEW': 'AUTORENEW',
    'AUTODELETE': 'AUTODELETE',
    'AUTOEXPIRE': 'AUTOEXPIRE',
}

/**
 * @enum {string}
 */
export const TransferMode = {
    'DEFAULT': 'DEFAULT',
    'AUTOAPPROVE': 'AUTOAPPROVE',
    'AUTODENY': 'AUTODENY',
}

/**
 * @enum {string}
 */
export const RecordType = {
    A: 'A',
    AAAA: 'AAAA',
    AFSDB: 'AFSDB',
    ALIAS: 'ALIAS',
    CAA: 'CAA',
    CERT: 'CERT',
    CNAME: 'CNAME',
    HINFO: 'HINFO',
    HTTPS: 'HTTPS',
    IPSECKEY: 'IPSECKEY',
    KEY: 'KEY',
    LOC: 'LOC',
    MX: 'MX',
    NAPTR: 'NAPTR',
    NS: 'NS',
    OPENPGPKEY: 'OPENPGPKEY',
    PTR: 'PTR',
    RP: 'RP',
    SMIMEA: 'SMIMEA',
    SOA: 'SOA',
    SRV: 'SRV',
    SSHFP: 'SSHFP',
    SVCB: 'SVCB',
    TLSA: 'TLSA',
    TXT: 'TXT',
    URI: 'URI',
    URL: 'URL',
}

/**
 * @enum {string}
 */
export const UrlRedirectType = {
    HEADER301: 'HEADER301',
    HEADER302: 'HEADER302',
    FRAME: 'FRAME',
}

/**
 * @typedef {Object} DomainDate
 * @property {string} scalar
 * @property {string} xmlrpc_type
 * @property {number} timestamp
 */

/**
 * @typedef {{
 *   roId: number, 
 *   domain: string, 
 *   "domain-ace": string, 
 *   withPrivacy: string,
 *   period: Period, 
 *   crDate: DomainDate,
 *   exDate: DomainDate,
 *   reDate: DomainDate,
 *   upDate: DomainDate,
 *   transferLock:boolean, 
 *   status:string,
 *   authCode:string,
 *    renewalMode:RenewalMode,
 *    transferMode:TransferMode,
 *    registrant: number,
 *   admin: number,
 *   tech: number,
 *   billing: number,
 *    noDelegation: boolean,
 *    ns: Array<string>,
 *    tags: Array<string>,
 *    verificationStatus: string,
 * }} Domain
 */

/**
 * @typedef {{
 *   id: number,
 *   name: string,
 *   type: RecordType,
 *   content: string,
 *   ttl: number,
 *   prio: number,
 *   urlRedirectType: UrlRedirectType|undefined,
 *   urlRedirectTitle: string|undefined,
 *   urlRedirectDescription: string|undefined,
 *   urlRedirectKeywords: string|undefined,
 *   urlRedirectFavIcon: string|undefined,
 *   urlAppend: boolean|undefined,
 * }} DomainRecord
 */


/**
 * @typedef {{
*   domain: string, 
*   identifier: string, 
*   import: string, 
*   resource: string
* }} DomainResource
*/

/**
 * @typedef {{
 *   domain: string, 
 *   identifier: string, 
 *   buildImport: (identifier) => string, 
 *   buildResource: (identifier) => string
 * }} RecordResourceGenerator
 */