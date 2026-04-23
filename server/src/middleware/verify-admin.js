import jwt from "jsonwebtoken";
import {StatusCodes} from "http-status-codes";
import * as authorizationErrors from "../utils/authorization-errors.js";
import {notLoggedIn} from "../utils/authorization-errors.js";

export function verifyAdmin(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(StatusCodes.UNAUTHORIZED).json({error: notLoggedIn});

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(StatusCodes.FORBIDDEN).json({error: authorizationErrors.notLoggedIn});
        if (user.role !== "admin") {
            return res.status(StatusCodes.UNAUTHORIZED).json({error: authorizationErrors.permissionDenied});
        }
        req.jwtUser = user;
        next();
    })
}