import { writeFileSync, rmSync, existsSync, mkdirSync } from "fs"
import { ApiClient, Language } from "domrobot-client";
import { blacklistedExtraDataKeys } from "./constants.js";

/**
 * @param {string} username 
 * @param {string} password 
 * @param {string|undefined} twoFaSecret 
 * @returns {Promise<ApiClient>}
 */
export const initApiClient = async (username, password, twoFaSecret = "") => {
    if (!username || !password) {
        throw new Error(
            "Missing INWX credentials. Please specify INWX_USER and INWX_PASSWORD."
        );
    }

    const apiClient = new ApiClient(ApiClient.API_URL_LIVE, Language.EN);
    const response = await apiClient.login(username, password, twoFaSecret);
    if (response.code !== 1000) {
        throw new Error("Failed to login to INWX API. " + response.msg);
    }

    return apiClient;
}

/**
 * @param {ApiClient} apiClient 
 * @param {string} method 
 * @param {object} params 
 * @returns {Promise<any>}
 */
export const callApi = async (apiClient, method, params = {}) => {
    const response = await apiClient.callApi(method, params);
    if (response.code !== 1000) {
        throw new Error(`Api error while checking domain status. Code: ${response.code}  Message: ${response.msg}`);
    }
    return response?.resData;
}

/**
 * @link https://www.inwx.com/en/help/apidoc/f/ch02s06.html#contact.list
 * @param {ApiClient} apiClient 
 * @returns {Promise<Array<import("./constants.js").Contact>>}
 */
export const getContacts = async (apiClient, maxResultCount = 1000) => {
    const response = await callApi(apiClient, "contact.list", {pagelimit: maxResultCount});
    return response?.contact;
}

/**
 * @link https://www.inwx.com/en/help/apidoc/f/ch02s09.html#domain.list
 * @param {ApiClient} apiClient 
 * @returns {Promise<Array<import("./constants.js").Domain>>}
 */
export const getDomains = async (apiClient, maxResultCount = 1000) => {
    const response = await callApi(apiClient, "domain.list", {pagelimit: maxResultCount});
    return response?.domain;
}

/**
 * @link https://www.inwx.com/en/help/apidoc/f/ch02s15.html#nameserver.info
 * @param {ApiClient} apiClient 
 * @param {string} domainName
 * @returns {Promise<Array<import("./constants.js").DomainRecord>>}
 */
export const getNameServerInfo = async (apiClient, domainName) => {
    const response = await callApi(apiClient, "nameserver.info", {domain: domainName});
    return response?.record;
}

/**
 * @param {string} filePath
 * @param {string} contents 
 */
export const saveIntoFile = (filePath, contents) => {
    if (existsSync(filePath)) rmSync(filePath);
    writeFileSync(filePath, contents);
}

export const resetOutputDir = () => {
    if (existsSync('./output')){
        rmSync('./output', {recursive: true, force: true});
    }
    mkdirSync('./output');
}

/**
 * @param {Record<string, any>} params Key-value pairs to render per line
 * @param {string} indentStr String to render before each line
 * @returns 
 */
export const printKeyValues = (params, indentStr="    ") => 
    Object.entries(params)
        .map(([key, value]) => {
            const keyToPrint = (key.includes("-") || key.includes(" ")) ? `"${key}"` : key;
            const valueToPrint = typeof value === "string" ? `"${value}"` : value;
            return `${keyToPrint} = ${valueToPrint}`;
        })
        .join(`\n${indentStr}`);

/**
 * @param {string} resourceType
 * @param {string} identifier
 * @param {Record<string, any>} params
 */
export const printSimpleResource = (resourceType, identifier, params) => `resource "${resourceType}" "${identifier}" {
    ${printKeyValues(params, "    ")}
}`

/**
 * @param {import("./constants.js").Domain} domain 
 * @returns {Record<string, any>}
 */
export const extractDomainExtraData = domain => Object.entries((domain.extData ?? {}))
    .reduce((acc, [key, value]) => {
        if (blacklistedExtraDataKeys.includes(key)) return acc;
        return { ...acc, [key]: value };
    }, {});
