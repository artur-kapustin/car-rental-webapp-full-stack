import {setAccessToken} from "../store-token.svelte.js";
import {protectedFetch, refreshAccessToken} from "./fetch-wrapper.js";
import {throwError} from "../../error-handling/error-utils.js";
import {tokens} from "./urls.js";

export const login = async (email, password) => {
    const user = {
        email: email,
        password: password
    };

    const response = await fetch(tokens.base, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
        credentials: 'include'
    });

    const json = await response.json();

    if (!response.ok) {
        throwError(`Response status: ${response.status}; ${json.error}`);
    }

    setAccessToken(json.accessToken);

    await refreshAccessToken();
}

export const logout = async () => {
    const response = await protectedFetch(tokens.logout, {method: 'delete'});

    if (response.ok) {
        setAccessToken(null);
    }

    return response.status;
}