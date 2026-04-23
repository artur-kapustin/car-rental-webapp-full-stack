import * as dbHelper from "../db/database-helper.js";
import {StatusCodes} from "http-status-codes";
import {hashPassword, verifyPassword} from "../utils/hashing.js";
import * as generalValidator from "../utils/validation/general-validation.js";
import * as userValidator from "../utils/validation/user-validation.js";
import { UniqueConstraintError } from "sequelize";
import {accessDenied} from "../utils/authorization-errors.js";

export async function getUserById(req, res) {
    const { userId } = req.params;

    if (generalValidator.isNotPositiveNumber(userId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: generalValidator.errors.idMustBePositiveInteger});
    }

    const user = await dbHelper.getUserById(userId);

    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({error: userValidator.userErrors.userWithIdNotFound(userId)});
    }

    const userData = user.get({ plain: true });

    delete userData.password;

    return res.status(StatusCodes.OK).json(user);
}

export async function getUsers(req, res) {
    const { includes } = req.query;

    if (includes) {
        return res.status(StatusCodes.OK).json(await dbHelper.searchUsers(includes));
    }

    const users = await dbHelper.getUsers();

    return res.status(StatusCodes.OK).json(users);
}

export async function postUser(req, res) {
    const {name, email, password} = req.body;

    if (generalValidator.isNotStringOrIsEmpty(name)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: userValidator.userErrors.usernameMustBeNonEmptyString});
    }

    if (userValidator.isEmailInvalid(email)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: userValidator.userErrors.emailUnexpectedFormat});
    }

    if (generalValidator.isNotStringOrIsEmpty(password)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: userValidator.userErrors.passwordMustBeNonEmptyString});
    }

    let user;
    try {
        user = await dbHelper.postUser(name, email, await hashPassword(password));
    } catch (e) {
        if (e instanceof UniqueConstraintError) {
            return res.status(StatusCodes.CONFLICT).json({error: userValidator.userErrors.thisEmailIsAlreadyRegistered});
        }

        console.error(e);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: "Something went wrong in the server."});
    }

    return res.status(StatusCodes.CREATED).json({
        id: user.id,
        message: "User added successfully."
    });
}

export async function putUser(req, res) {
    const {name, email} = req.body;
    const { userId } = req.params;
    const { jwtUser } = req;

    if (generalValidator.isNotStringOrIsEmpty(name)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: userValidator.userErrors.usernameMustBeNonEmptyString});
    }

    if (userValidator.isEmailInvalid(email)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: userValidator.userErrors.emailUnexpectedFormat});
    }

    const userIdValidation = await userValidator.validateAuthenticatedUserId(jwtUser, userId);
    if (userIdValidation.invalid) {
        return res.status(userIdValidation.statusCode).json({error: userIdValidation.error});
    }

    let result;
    try {
        result = await dbHelper.putUser(userId, name, email);
    } catch(e) {
        if (e instanceof UniqueConstraintError) {
            return res.status(StatusCodes.CONFLICT).json({error: userValidator.userErrors.thisEmailIsAlreadyRegistered});
        }

        console.error(e);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({error: "Something went wrong in the server."});
    }

    return res.status(StatusCodes.OK).json({
        id: userId,
        message: `${result[0]} changes made to user.`
    });
}

export async function putUserPassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    const { userId } = req.params;
    const { jwtUser } = req;

    if (generalValidator.isNotStringOrIsEmpty(currentPassword) || generalValidator.isNotStringOrIsEmpty(newPassword)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: userValidator.userErrors.passwordMustBeNonEmptyString});
    }

    if (generalValidator.isNotPositiveNumber(userId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: generalValidator.errors.idMustBePositiveInteger});
    }

    if (currentPassword === newPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: userValidator.userErrors.currentAndNewPasswordsAreTheSame})
    }

    const user = await dbHelper.getUserById(userId);

    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({error: userValidator.userErrors.userWithIdNotFound(userId)})
    }

    if (jwtUser.id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({error: accessDenied});
    }

    const passwordMatch = await verifyPassword(currentPassword, user.password);
    if (!passwordMatch) {
        return res.status(StatusCodes.UNAUTHORIZED).json({error: "Invalid credentials."});
    }

    await dbHelper.putUserPassword(userId, await hashPassword(newPassword));

    return res.status(StatusCodes.OK).json({message: "Successfully updated password."});
}

export async function putUserStatus(req, res) {
    const { isAccountDisabled } = req.body;
    const { userId } = req.params;

    if (generalValidator.isNotBoolean(isAccountDisabled)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: userValidator.userErrors.isAccountDisabledMustBeBoolean});
    }

    if (generalValidator.isNotPositiveNumber(userId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: generalValidator.errors.idMustBePositiveInteger});
    }

    const [changes] = await dbHelper.putUserStatus(userId, isAccountDisabled);

    if (changes === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({error: userValidator.userErrors.userWithIdNotFound(userId)})
    }

    return res.status(StatusCodes.OK).json({
        id: userId,
        message: `${changes} changes made to user.`
    })
}

export async function deleteUser(req, res) {
    const { userId } = req.params;
    const { jwtUser } = req;

    const userIdValidation = await userValidator.validateAuthenticatedUserId(jwtUser, userId);
    if (userIdValidation.invalid) {
        return res.status(userIdValidation.statusCode).json({error: userIdValidation.error});
    }

    await dbHelper.deleteUser(userId);

    return res.sendStatus(StatusCodes.NO_CONTENT);
}