import {StatusCodes} from "http-status-codes";
import * as dbHelper from "../../db/database-helper.js";
import {accessDenied} from "../authorization-errors.js";
import {errors, isNotPositiveNumber} from "./general-validation.js";

export function isEmailInvalid(email) {
    return !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

export async function validateUserId(userId) {
    if (isNotPositiveNumber(userId)) {
        return {
            invalid: true,
            statusCode: StatusCodes.BAD_REQUEST,
            error: errors.idMustBePositiveInteger
        }
    }

    const user = await dbHelper.getUserById(userId);

    if (!user) {
        return {
            invalid: true,
            statusCode: StatusCodes.NOT_FOUND,
            error: userErrors.userWithIdNotFound(userId)
        }
    }

    return {invalid: false}
}

export async function validateAuthenticatedUserId(jwtUser, userId) {
    const userIdValidation = await validateUserId(userId);
    if (userIdValidation.invalid) {
        return userIdValidation;
    }

    if (jwtUser.id !== userId) {
        return {
            invalid: true,
            statusCode: StatusCodes.FORBIDDEN,
            error: accessDenied
        };
    }

    return {invalid: false};
}

export const userErrors = {
    usernameMustBeNonEmptyString: "The username must be a non-empty string.",
    passwordMustBeNonEmptyString: "The password must be a non-empty string.",
    emailUnexpectedFormat: "Invalid email format. Expected format: example@domain.com",
    isAccountDisabledMustBeBoolean: "isAccountDisabled must be boolean",
    thisEmailIsAlreadyRegistered: "This email is already registered.",
    currentAndNewPasswordsAreTheSame: "Current and new passwords are the same.",
    emailOrPasswordAreIncorrect: "Email or password are incorrect.",
    userWithIdNotFound: (id) => `User with id=${id} not found.`
}