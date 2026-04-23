import {jwtDecode} from "jwt-decode";
import {getAccessToken} from "./store-token.svelte.js";

export const isTokenExpired = (token, bufferSeconds = 0) => {
    const decoded = jwtDecode(token);

    if (!decoded || !decoded.exp) {
        return true
    }

    return decoded.exp < (Date.now() / 1000 + bufferSeconds);
}

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {boolean} isAccountDisabled
 */

/**
 * @returns {User|null}
 */
export const getCurrentUser = () => {
    const token = getAccessToken();

    if (token) {
        return jwtDecode(token);
    } else {
        return null;
    }
}