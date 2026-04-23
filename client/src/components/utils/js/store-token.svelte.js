let token = $state(null);

export const setAccessToken = (accessToken) => {
    token = accessToken;
}

export const getAccessToken = () => {
    return token;
}