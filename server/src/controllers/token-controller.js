import "dotenv/config";
import * as dbHelper from "../db/database-helper.js";
import {StatusCodes} from "http-status-codes";
import jwt from "jsonwebtoken";
import {verifyPassword} from "../utils/hashing.js";
import * as generalValidator from "../utils/validation/general-validation.js";
import * as userValidator from "../utils/validation/user-validation.js";


export async function login(req, res) {
    const {email, password} = req.body;

    if (userValidator.isEmailInvalid(email)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: userValidator.userErrors.emailUnexpectedFormat})
    }

    if (generalValidator.isNotStringOrIsEmpty(password)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: userValidator.userErrors.passwordMustBeNonEmptyString})
    }

    const user = await dbHelper.getUserByEmail(email);

    if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({error: userValidator.userErrors.emailOrPasswordAreIncorrect});
    }

    const refreshId = crypto.randomUUID();
    const jwtUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAccountDisabled: user.isAccountDisabled,
        refreshTokenId: refreshId
    }

    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) {
        return res.status(StatusCodes.UNAUTHORIZED).json({error: userValidator.userErrors.emailOrPasswordAreIncorrect});
    }

    const accessToken = generateAccessToken(jwtUser);
    const refreshToken = generateRefreshToken(jwtUser);
    await dbHelper.postRefreshToken(refreshId, user.id, refreshToken, new Date(Date.now() + 10 * 60 * 1000))

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        path: "/",
        maxAge: 10 * 60 * 1000 // 10min
    });

    return res.status(StatusCodes.OK).json({accessToken: accessToken});
}

export async function logout(req, res) {
    const {refreshTokenId} = req.jwtUser;

    if (generalValidator.isNotStringOrIsEmpty(refreshTokenId)) {
        await dbHelper.deleteRefreshTokenById(refreshTokenId);
    }

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        path: "/",
        maxAge: 10 * 60 * 1000 // 10min
    });

    return res.sendStatus(StatusCodes.NO_CONTENT);
}

export async function refreshAccessToken(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken || !await dbHelper.getRefreshToken(refreshToken)) {
        return res.status(StatusCodes.UNAUTHORIZED).json({error: "Invalid refresh token."})
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, user) => {
        if (err) {
            return res.sendStatus(StatusCodes.FORBIDDEN)
        }

        const dbUser = await dbHelper.getUserById(user.id);

        const jwtUser = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            isAccountDisabled: dbUser.isAccountDisabled,
            refreshTokenId: user.refreshTokenId
        }

        const accessToken = generateAccessToken(jwtUser);
        return res.status(StatusCodes.OK).json({accessToken: accessToken});
    });
}

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "15s"});
}

function generateRefreshToken(user) {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {expiresIn: "10m"});
}