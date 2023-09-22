import { ApiClient, Language } from "domrobot-client";

export const initApiClient = async () => {
    const username = process.env.INWX_USER;
    const password = process.env.INWX_PASSWORD;
    const twoFaSecret = process.env.INWX_2FA_SECRET || "";

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
 * 
 * @param {ApiClient} apiClient 
 * @param {string} method 
 * @param {object} params 
 * @returns 
 */
export const callApi = async (apiClient, method, params = {}) => {
    const response = await apiClient.callApi(method, params);
    if (response.code !== 1000) {
        throw new Error(`Api error while checking domain status. Code: ${response.code}  Message: ${response.msg}`);
    }
    return response?.resData;
}



/**
 * @link https://www.inwx.com/en/help/apidoc/f/ch02s09.html#domain.list
 * @param {ApiClient} apiClient 
 * @returns {Promise<Array<import("./constants").Domain>>}
 */
export const getDomains = async (apiClient) => {
    const domainsList = await callApi(apiClient, "domain.list", {});
    return domainsList?.domain;
}