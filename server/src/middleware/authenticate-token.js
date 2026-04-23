import jwt from "jsonwebtoken";
import {StatusCodes} from "http-status-codes";
import {notLoggedIn} from "../utils/authorization-errors.js";

export function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(StatusCodes.UNAUTHORIZED).json({error: notLoggedIn});

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.error("authentication failed", err);
            return res.status(StatusCodes.FORBIDDEN).json({error: notLoggedIn});
        }

        req.jwtUser = user;
        next();
    })
}