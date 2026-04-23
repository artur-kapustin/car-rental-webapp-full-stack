import {describe, it, expect, beforeEach} from "vitest";
import request from "supertest";
import * as dbHelper from "../db/database-helper.js";
import {admin, seedTestDb, user1, user2} from "./seeding.js";
import app from "../index.js";
import {StatusCodes} from "http-status-codes";
import {userErrors} from "../utils/validation/user-validation.js";
import {errors} from "../utils/validation/general-validation.js";
import * as authorizationErrors from "../utils/authorization-errors.js";
import {defaultInvalidValues, invalidEmailValues, invalidIds, login, testAuthorization} from "./utils.js";
import {accessDenied} from "../utils/authorization-errors.js";


const usersArray = [
    {
        "email": "user1@test.com",
        "id": 1,
        "isAccountDisabled": false,
        "name": "user1",
        "role": "user",
    },
    {
        "email": "user2@test.com",
        "id": 2,
        "isAccountDisabled": false,
        "name": "user2",
        "role": "user",
    },
    {
        "email": "admin@test.com",
        "id": 3,
        "isAccountDisabled": false,
        "name": "admin",
        "role": "admin",
    },
];

beforeEach(async () => {
    await dbHelper.resetDb();
    await seedTestDb();
});

describe("GET /users/:userId", () => {
    async function getUserByIdRequestTest(user, expectedStatus, expectedBody, id) {
        const token = await login(user);
        const res = await request(app)
            .get(`/users/${id}`)
            .set("Authorization", `Bearer ${token}`);

        if (expectedStatus === StatusCodes.OK) {
            delete res.body.createdAt;
            delete res.body.updatedAt;
        }

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    }

    it("returns OK(200) when id exists, is valid and logged in as admin", async () => {
        await getUserByIdRequestTest(
            admin,
            StatusCodes.OK,
            usersArray[0],
            1
        )
    })

    it("returns NOT_FOUND(404) when id does not exist but is valid and logged in as admin", async () => {
        const id = 4;

        await getUserByIdRequestTest(
            admin,
            StatusCodes.NOT_FOUND,
            {error: userErrors.userWithIdNotFound(id)},
            id
        )
    })

    it("returns BAD_REQUEST(400) when id is invalid and logged in as admin", async () => {
        for (const id of invalidIds) {
            await getUserByIdRequestTest(
                admin,
                StatusCodes.BAD_REQUEST,
                {error: errors.idMustBePositiveInteger},
                id
            )
        }
    })

    testAuthorization(getUserByIdRequestTest);
})

describe("GET /users", () => {
    async function getUsersRequestTest(user, expectedStatus, expectedBody, query) {
        const token = await login(user);
        const res = await request(app)
            .get(`/users?includes=${query}`)
            .set("Authorization", `Bearer ${token}`);

        if (expectedStatus === StatusCodes.OK) {
            res.body.forEach((element) => {
                delete element.createdAt;
                delete element.updatedAt;
            })
        }

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    }

    it("returns OK(200) when logged in as admin", async () => {
        await getUsersRequestTest(
            admin,
            StatusCodes.OK,
            usersArray,
            ""
        );
    })

    it("returns OK(200) and users who match the query when one is provided", async () => {
        await getUsersRequestTest(
            admin,
            StatusCodes.OK,
            usersArray.slice(0, 2),
            "user"
        );

        await getUsersRequestTest(
            admin,
            StatusCodes.OK,
            usersArray.slice(0, 1),
            "user1"
        );

        await getUsersRequestTest(
            admin,
            StatusCodes.OK,
            usersArray.slice(1, 2),
            "2@test"
        );
    })

    testAuthorization(getUsersRequestTest);
})

describe("POST /users", () => {
    const validPostUser = {
        name: "hello",
        email: "bye@hello.com",
        password: "12345678"
    }

    async function postRequestTest(user, expectedStatus, expectedBody, body) {
        const token = await login(user);
        const res = await request(app)
            .post(`/users`)
            .send(body)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    }

    it("returns CREATED(201) when all the information provided is valid", async () => {
        await postRequestTest(
            null,
            StatusCodes.CREATED,
            {
                id: 4,
                message: "User added successfully.",
            },
            validPostUser
        );
    })

    it("returns BAD_REQUEST(400) when name is invalid", async () => {
        for (const value of defaultInvalidValues) {
            await postRequestTest(
                null,
                StatusCodes.BAD_REQUEST,
                {error: userErrors.usernameMustBeNonEmptyString},
                {...validPostUser, name: value}
            );
        }
    })

    it("returns BAD_REQUEST(400) when email is invalid", async () => {
        for (const value of invalidEmailValues) {
            await postRequestTest(
                null,
                StatusCodes.BAD_REQUEST,
                {error: userErrors.emailUnexpectedFormat},
                {...validPostUser, email: value}
            );
        }
    })

    it("returns BAD_REQUEST(400) when password is invalid", async () => {
        for (const value of defaultInvalidValues) {
            await postRequestTest(
                null,
                StatusCodes.BAD_REQUEST,
                {error: userErrors.passwordMustBeNonEmptyString},
                {...validPostUser, password: value}
            );
        }
    })

    it("returns CONFLICT(409) when email is duplicate", async () => {
        await postRequestTest(
            null,
            StatusCodes.CONFLICT,
            {error: userErrors.thisEmailIsAlreadyRegistered},
            {...validPostUser, email: user1.email}
        );
    })
})

describe("PUT /users/:userId", () => {
    const validPutUser = {
        name: "hello",
        email: "bye@hello.com"
    }

    async function putRequestTest(user, expectedStatus, expectedBody, body, id) {
        const token = await login(user);
        const res = await request(app)
            .put(`/users/${id}`)
            .send(body)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    }

    it("returns OK(200) when all provided information is valid and logged in", async () => {
        const id = 1;

        await putRequestTest(
            user1,
            StatusCodes.OK,
            {
                "id": id,
                "message": "1 changes made to user.",
            }
            ,
            validPutUser,
            id
        );
    })

    it("returns BAD_REQUEST(400) when name is invalid and logged in", async () => {
        for (const value of defaultInvalidValues) {
            await putRequestTest(
                user1,
                StatusCodes.BAD_REQUEST,
                {error: userErrors.usernameMustBeNonEmptyString},
                {...validPutUser, name: value},
                1
            );
        }
    })

    it("returns BAD_REQUEST(400) when email is invalid and logged in", async () => {
        for (const value of invalidEmailValues) {
            await putRequestTest(
                user1,
                StatusCodes.BAD_REQUEST,
                {error: userErrors.emailUnexpectedFormat},
                {...validPutUser, email: value},
                1
            );
        }
    })

    it("returns BAD_REQUEST(400) when id is invalid and logged in", async () => {
        for (const id of invalidIds) {
            await putRequestTest(
                user1,
                StatusCodes.BAD_REQUEST,
                {error: errors.idMustBePositiveInteger},
                validPutUser,
                id
            );
        }
    })

    it("returns CONFLICT(409) when email is duplicate and logged in", async () => {
        await putRequestTest(
            user1,
            StatusCodes.CONFLICT,
            {error: userErrors.thisEmailIsAlreadyRegistered},
            {...validPutUser, email: user2.email},
            1
        );
    })

    it("returns NOT_FOUND(409) when id does not exist and logged in", async () => {
        const id = 999;

        await putRequestTest(
            user1,
            StatusCodes.NOT_FOUND,
            {error: userErrors.userWithIdNotFound(id)},
            validPutUser,
            id
        );
    })

    it("returns UNAUTHORIZED(401) when not logged in", async () => {
        await putRequestTest(null, StatusCodes.UNAUTHORIZED, {error: authorizationErrors.notLoggedIn}, {}, 1);
    });

    it("returns FORBIDDEN(403) when id of a different user provided and logged in", async () => {
        await putRequestTest(user1, StatusCodes.FORBIDDEN, {error: accessDenied}, validPutUser, 2);
    });
})

describe("PUT /users/:userId/password", () => {
    const validBody = {
        currentPassword: user1.password,
        newPassword: "12345678"
    }

    async function putPasswordRequestTest(user, expectedStatus, expectedBody, body, id) {
        const token = await login(user);
        const res = await request(app)
            .put(`/users/${id}/password`)
            .send(body)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    }

    it("returns OK(200) when all the information provided is valid and logged in", async () => {
        await putPasswordRequestTest(
            user1,
            StatusCodes.OK,
            {message: "Successfully updated password."},
            validBody,
            1
        );
    })

    it("returns BAD_REQUEST(400) when current password is invalid and logged in", async () => {
        for (const value of defaultInvalidValues) {
            await putPasswordRequestTest(
                user1,
                StatusCodes.BAD_REQUEST,
                {error: userErrors.passwordMustBeNonEmptyString},
                {...validBody, currentPassword: value},
                1
            );
        }
    })

    it("returns BAD_REQUEST(400) when new password is invalid and logged in", async () => {
        for (const value of defaultInvalidValues) {
            await putPasswordRequestTest(
                user1,
                StatusCodes.BAD_REQUEST,
                {error: userErrors.passwordMustBeNonEmptyString},
                {...validBody, newPassword: value},
                1
            );
        }
    })

    it("returns BAD_REQUEST(400) when current password equals new password and logged in", async () => {
        await putPasswordRequestTest(
            user1,
            StatusCodes.BAD_REQUEST,
            {error: userErrors.currentAndNewPasswordsAreTheSame},
            {...validBody, newPassword: validBody.currentPassword},
            1
        );
    })

    it("returns BAD_REQUEST(400) when current password equals new password and logged in", async () => {
        for (const id of invalidIds) {
            await putPasswordRequestTest(
                user1,
                StatusCodes.BAD_REQUEST,
                {error: errors.idMustBePositiveInteger},
                validBody,
                id
            );
        }
    })

    it("returns NOT_FOUND(404) when id does not exist and logged in", async () => {
        const id = 999;

        await putPasswordRequestTest(
            user1,
            StatusCodes.NOT_FOUND,
            {error: userErrors.userWithIdNotFound(id)},
            validBody,
            id
        );
    })

    it("returns UNAUTHORIZED(401) when current password does not match actual user's password and logged in", async () => {
        await putPasswordRequestTest(
            user1,
            StatusCodes.UNAUTHORIZED,
            {error: "Invalid credentials."},
            {...validBody, currentPassword: "asdfqewr1234gbgbg24g55626t2g"},
            1
        );
    })

    it("returns FORBIDDEN(403) when id of a different user provided and logged in", async () => {
        await putPasswordRequestTest(user1, StatusCodes.FORBIDDEN, {error: accessDenied}, validBody, 2);
    });
})

describe("PUT /users/:userId/status", () => {
    const validBody = {
        isAccountDisabled: true,
    }

    async function putPasswordRequestTest(user, expectedStatus, expectedBody, body, id) {
        const token = await login(user);
        const res = await request(app)
            .put(`/users/${id}/status`)
            .send(body)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    }

    it("returns OK(200) when all the information provided is valid and logged in as admin", async () => {
        const id = 1;

        await putPasswordRequestTest(
            admin,
            StatusCodes.OK,
            {
                id: id,
                message: `1 changes made to user.`
            },
            validBody,
            id
        )
    })

    it("returns BAD_REQUEST(400) when isAccountDisabled is invalid and logged in as admin", async () => {
        for (const value of [...defaultInvalidValues, "asdf", 1]) {
            await putPasswordRequestTest(
                admin,
                StatusCodes.BAD_REQUEST,
                {error: userErrors.isAccountDisabledMustBeBoolean},
                {
                    isAccountDisabled: value
                },
                1
            )
        }
    })

    it("returns BAD_REQUEST(400) when id is invalid and logged in as admin", async () => {
        for (const id of invalidIds) {
            await putPasswordRequestTest(
                admin,
                StatusCodes.BAD_REQUEST,
                {error: errors.idMustBePositiveInteger},
                validBody,
                id
            )
        }
    })

    it("returns NOT_FOUND(404) when id does not exist and logged in as admin", async () => {
        const id = 999

        await putPasswordRequestTest(
            admin,
            StatusCodes.NOT_FOUND,
            {error: userErrors.userWithIdNotFound(id)},
            validBody,
            id
        )
    })

    testAuthorization(putPasswordRequestTest);
})

describe("DELETE /users/:userId", () => {
    async function deleteRequestTest(user, expectedStatus, expectedBody,  id) {
        const token = await login(user);
        const res = await request(app)
            .delete(`/users/${id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    }

    it("returns NO_CONTENT(204) when the id provided is valid and exists and logged in", async () => {
        await deleteRequestTest(
            user2,
            StatusCodes.NO_CONTENT,
            {},
            2
        )
    })

    it("returns BAD_REQUEST(400) when id is invalid and logged in", async () => {
        for (const id of invalidIds) {
            await deleteRequestTest(
                user2,
                StatusCodes.BAD_REQUEST,
                {error: errors.idMustBePositiveInteger},
                id
            )
        }
    })

    it("returns NOT_FOUND(400) when id does not exist logged in", async () => {
        const id = 999;

        await deleteRequestTest(
            user2,
            StatusCodes.NOT_FOUND,
            {error: userErrors.userWithIdNotFound(id)},
            id
        )
    })

    it("returns FORBIDDEN(403) when id of a different user provided and logged in", async () => {
        await deleteRequestTest(user1, StatusCodes.FORBIDDEN, {error: accessDenied}, 2);
    });
})
