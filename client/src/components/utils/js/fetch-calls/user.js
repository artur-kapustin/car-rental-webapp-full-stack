import {protectedFetch, refreshAccessToken} from "./fetch-wrapper.js";
import {throwError} from "../../error-handling/error-utils.js";
import {logout} from "./token.js";
import {users} from "./urls.js";

export const getUsers = async (string) => {
    const response = await protectedFetch(users.withQuery(`includes=${string}`), {
        method: "get"
    });

    if (!response.ok) {
        throwError(`Response status: ${response.status}`);
    }

    return await response.json();
}


export const getUserById = async (id) => {
    const response = await protectedFetch(users.withId(id), {
        method: "get"
    });

    if (!response.ok) {
        throwError(`Response status: ${response.status}`);
    }

    return await response.json();
}

export const postUser = async (name, email, password) => {
    const user = {
        name: name,
        email: email,
        password: password
    };

    const response = await fetch(users.base, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user)
    });

    const json = await response.json();

    if (!response.ok) {
        throwError(`Response status: ${response.status}; ${json.error}`);
        return json.error;
    }
}

export const deleteUser = async (id) => {
    const response = await protectedFetch(users.withId(id), {
        method: "delete"
    });

    if (!response.ok) {
        throwError(`Response status: ${response.status}; failed to delete`);
    }
}

export const putUser = async (id, name, email) => {
    const user = {
        name: name,
        email: email
    };

    const response = await protectedFetch(users.withId(id), {
        method: "put",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user)
    });

    if (!response.ok) {
        throwError(`Response status: ${response.status}; ${(await response.json()).error}`);
    } else {
        await refreshAccessToken();
    }
}

export const changeUserPassword = async (id, currentPassword, newPassword) => {
    const user = {
        currentPassword: currentPassword,
        newPassword: newPassword
    };

    console.log(user)

    const response = await protectedFetch(users.password(id), {
        method: "put",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user)
    });

    if (!response.ok) {
        throwError(`Response status: ${response.status}; ${(await response.json()).error}`);
    } else {
        await logout();
        window.location.href = '/sign-in';
    }
}

export const putUserStatus = async (id, isAccountDisabled) => {
    const user = {
        isAccountDisabled: isAccountDisabled
    };

    const response = await protectedFetch(users.status(id), {
        method: "put",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user)
    });

    if (!response.ok) {
        throwError(`Response status: ${response.status}; ${(await response.json()).error}`);
    } else {
        await refreshAccessToken();
    }
}