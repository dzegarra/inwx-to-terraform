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