import {getAccessToken, setAccessToken} from '../store-token.svelte.js';
import {getCurrentUser, isTokenExpired} from '../jwt-utils.js';
import {throwError} from "../../error-handling/error-utils.js";
import {tokens} from "./urls.js";

export async function refreshAccessToken() {
    const res = await fetch(tokens.refresh, {
        method: 'post',
        credentials: 'include' // sends HttpOnly cookie
    });

    const json = await res.json();

    setAccessToken(json.accessToken);

    if (!res.ok) {
        throw Error("Not logged in.");
    }

    return json.accessToken;
}

export async function protectedFetch(url, options = {}) {
    if (getCurrentUser() && getCurrentUser().isAccountDisabled && url !== tokens.logout) {
        throwError('Your account has been disabled.');
    }

    let token = getAccessToken();

    if (!token) {
        window.location.pathname = '/';
        throw Error("Not logged in.");
    }

    // Refresh token if expired or about to expire
    if (isTokenExpired(token, 30)) {
        try {
            token = await refreshAccessToken();
        } catch (e) {
            console.error('Refresh failed', e);
            throw e;
        }
    }

    const res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
    });

    // Retry once if token expired unexpectedly
    if (res.status === 401) {
        token = await refreshAccessToken();
        return fetch(url, {
            ...options,
            headers: {...options.headers, 'Authorization': `Bearer ${token}`},
            credentials: 'include'
        });
    }

    return res;
}