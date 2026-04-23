export function isNotStringOrIsEmpty(value) {
    return typeof value !== "string" || !value;
}

export function isNotBoolean(value) {
    return typeof value !== "boolean";
}

export function isNotPositiveNumber(num) {
    return isNaN(num) || num < 1;
}

export const errors  = {
    idMustBePositiveInteger: "ID must be a positive integer.",
    totalMustBePositiveNumber: "Total must be a positive number.",
    tokenMustBeNonEmptyString: "Token must be a non-empty string.",
}