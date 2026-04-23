import request from "supertest";
import app from "../index.js";
import {expect, it} from "vitest";
import {StatusCodes} from "http-status-codes";
import * as authorizationErrors from "../utils/authorization-errors.js";
import {user1} from "./seeding.js";

export const defaultInvalidValues = [null, undefined, ""];
export const invalidIds = [null, undefined, -1, 0, "abc"];
export const invalidNumbers = [...invalidIds, ""];
export const invalidEmailValues = [...defaultInvalidValues, "asdf@", "@", "@asdf.asdf", "asdf@asdf.", "asdf@.asdf"];

export async function login(user) {
    if (!user) {
        return "";
    }

    const res = await request(app)
        .post("/tokens")
        .send({
            email: user.email,
            password: user.password
        })

    expect(res.status).toBe(StatusCodes.OK);
    return res.body.accessToken;
}

export function testAuthorization(serverRequestTest) {
    it("returns UNAUTHORIZED(401) when not logged in", async () => {
        await serverRequestTest(null, StatusCodes.UNAUTHORIZED, {error: authorizationErrors.notLoggedIn});
    });

    it("returns UNAUTHORIZED(401) when logged in as user", async () => {
        await serverRequestTest(user1, StatusCodes.UNAUTHORIZED, {error: authorizationErrors.permissionDenied});
    });
}