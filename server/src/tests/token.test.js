import {describe, it, expect, beforeEach} from "vitest";
import request from "supertest";
import app from "../index.js";
import {seedTestDb, user1} from "./seeding.js";
import {resetDb} from "../db/database-helper.js";
import {defaultInvalidValues, invalidEmailValues, login} from "./utils.js";
import {StatusCodes} from "http-status-codes";
import {userErrors} from "../utils/validation/user-validation.js";

beforeEach(async () => {
    await resetDb();
    await seedTestDb();
});

describe("POST /tokens", () => {
    async function loginRequestTest(user, expectedStatus, expectedBody) {
        const res = await request(app)
            .post("/tokens")
            .send({
                email: user.email,
                password: user.password
            })

        if (expectedStatus === StatusCodes.OK) {
            expect(res.body.accessToken).toBeDefined();
            expect(res.body.accessToken).not.toBeNull();
            expect(res.body.accessToken).not.toBe('');
            expect(res.body.accessToken.split('.').length).toBe(3);
        } else {
            expect(res.status).toBe(expectedStatus);
            expect(res.body).toEqual(expectedBody);
        }
    }

    it("returns OK(200) when email and password are valid and exist", async () => {
        await loginRequestTest(user1, StatusCodes.OK);
    })

    it("returns BAD_REQUEST(400) when when email is invalid", async () => {
        for (const value of invalidEmailValues) {
            await loginRequestTest(
                {...user1, email: value},
                StatusCodes.BAD_REQUEST,
                {error: userErrors.emailUnexpectedFormat}
            );
        }
    })

    it("returns BAD_REQUEST(400) when when password is invalid", async () => {
        for (const value of defaultInvalidValues) {
            await loginRequestTest(
                {...user1, password: value},
                StatusCodes.BAD_REQUEST,
                {error: userErrors.passwordMustBeNonEmptyString}
            );
        }
    })

    it("returns UNAUTHORIZED(401) when email is valid but does not exist", async () => {
        await loginRequestTest(
            {...user1, email: "asdfbqwer1234f1234g@asdfqwervqwe.com"},
            StatusCodes.UNAUTHORIZED,
            {error: userErrors.emailOrPasswordAreIncorrect}
        );
    })

    it("returns UNAUTHORIZED(401) when password is valid but does not match", async () => {
        await loginRequestTest(
            {...user1, password: "asdfbqwer1234f1234g@asdfqwervqwe.com"},
            StatusCodes.UNAUTHORIZED,
            {error: userErrors.emailOrPasswordAreIncorrect}
        );
    })
})

describe("DELETE /tokens/logout", () => {
    async function logoutRequestTest(user, expectedStatus, expectedBody) {
        const token = await login(user);
        const res = await request(app)
            .delete("/tokens/logout")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    }

    it("returns NO_CONTENT(204) when refreshTokenId is valid and exists", async () => {
        await logoutRequestTest(user1, StatusCodes.NO_CONTENT, {});
    })
})