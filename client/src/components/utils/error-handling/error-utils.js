let callback;

export const throwError = (errorMessage) => {
    callback(errorMessage);
    throw new Error(errorMessage);
}

export const setErrorMessageCallback = (callbackSet) => {
    callback = callbackSet;
}