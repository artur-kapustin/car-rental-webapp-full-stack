import {describe, it, expect, beforeEach} from "vitest";
import request from "supertest";
import app from "../index.js";
import {admin, seedTestDb, user1, user2} from "./seeding.js";
import {resetDb} from "../db/database-helper.js";
import {defaultInvalidValues, invalidIds, invalidNumbers, login, testAuthorization} from "./utils.js";
import {StatusCodes} from "http-status-codes";
import {errors} from "../utils/validation/general-validation.js";
import * as authorizationErrors from "../utils/authorization-errors.js";
import {dateErrors} from "../utils/validation/date-validation.js";
import {carErrors} from "../utils/validation/car-validation.js";
import {accessDenied} from "../utils/authorization-errors.js";


const reservations = [
    {
        "carId": 1,
        "endDate": "2028-03-24T22:00:00.000Z",
        "id": 1,
        "startDate": "2028-03-15T22:00:00.000Z",
        "total": 120,
        "userId": 1,
    },
    {
        "carId": 1,
        "endDate": "2028-04-30T21:00:00.000Z",
        "id": 2,
        "startDate": "2028-04-27T21:00:00.000Z",
        "total": 150,
        "userId": 2,
    },
]

beforeEach(async () => {
    await resetDb();
    await seedTestDb();
});

describe("GET /cars/:id/reservations", () => {
    async function getCarReservationsRequestTest(user, expectedStatus, expectedBody, id, search) {
        const token = await login(user);
        const res = await request(app)
            .get(`/cars/${id}/reservations?search=${search}`)
            .set("Authorization", `Bearer ${token}`);

        if (expectedStatus === StatusCodes.OK) {
            res.body.forEach((reservation) => {
                delete reservation.updatedAt;
                delete reservation.createdAt;
            })
        }

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    }

    it("returns OK(200) when a valid and existing id is provided and logged in as admin", async () => {
        await getCarReservationsRequestTest(
            admin,
            StatusCodes.OK,
            reservations,
            1,
            ''
        );
        await getCarReservationsRequestTest(
            admin,
            StatusCodes.OK,
            [reservations[1]],
            1,
            '2@test'
        );
        await getCarReservationsRequestTest(
            admin,
            StatusCodes.OK,
            [],
            1,
            'asdfasdfasdfa'
        );
    })

    it("returns BAD_REQUEST(400) when an invalid id is provided and logged in as admin", async () => {
        for (const id of invalidIds) {
            await getCarReservationsRequestTest(
                admin,
                StatusCodes.BAD_REQUEST,
                {error: errors.idMustBePositiveInteger},
                id,
                ''
            );
        }
    })

    testAuthorization(getCarReservationsRequestTest);
})

describe("GET /users/:id/reservations", () => {
    async function getUserReservationsRequestTest(user, expectedStatus, expectedBody, id, search) {
        const token = await login(user);
        const res = await request(app)
            .get(`/users/${id}/reservations?search=${search}`)
            .set("Authorization", `Bearer ${token}`);

        if (expectedStatus === StatusCodes.OK) {
            res.body.forEach((reservation) => {
                delete reservation.updatedAt;
                delete reservation.createdAt;
            })
        }

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    }

    it("returns OK(200) when a valid and existing id is provided and logged in", async () => {
        await getUserReservationsRequestTest(
            user1,
            StatusCodes.OK,
            [reservations[0]],
            1,
            ''
        );
        await getUserReservationsRequestTest(
            user2,
            StatusCodes.OK,
            [reservations[1]],
            2,
            'Test1 1'
        );
        await getUserReservationsRequestTest(
            user2,
            StatusCodes.OK,
            [],
            2,
            'asdfasdfad'
        );
    })

    it("returns BAD_REQUEST(400) when an invalid id is provided and logged in", async () => {
        for (const id of invalidIds) {
            await getUserReservationsRequestTest(
                user1,
                StatusCodes.BAD_REQUEST,
                {error: errors.idMustBePositiveInteger},
                id,
                ''
            );
        }
    })

    it("returns FORBIDDEN(403) when trying to access reservations of some other user and being logged in, EVEN if the userId provided does not exist", async () => {
        await getUserReservationsRequestTest(
            user1,
            StatusCodes.FORBIDDEN,
            {error: accessDenied},
            2,
            ''
        );
    })

    it("returns UNAUTHORIZED(401) when not logged in", async () => {
        await getUserReservationsRequestTest(null, StatusCodes.UNAUTHORIZED, {error: authorizationErrors.notLoggedIn});
    });
})

describe("POST /users/:id/reservations", () => {
    const validBody = {
        carId: 1,
        startDate: new Date("Fri Jan 19 2029 23:00:00 GMT+0100 (Central European Standard Time)"),
        endDate: new Date("Sun Jan 21 2029 23:00:00 GMT+0100 (Central European Standard Time)"),
        total: 100
    }

    async function postUserReservationRequestTest(user, expectedStatus, expectedBody, id, body) {
        const token = await login(user);
        const res = await request(app)
            .post(`/users/${id}/reservations`)
            .send(body)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    }

    it("returns CREATED(201) when all the data provided is valid and logged in", async () => {
        await postUserReservationRequestTest(
            user1,
            StatusCodes.CREATED,
            {message: "Successfully posted new reservation."},
            1,
            validBody
        )
        await postUserReservationRequestTest(
            user1,
            StatusCodes.CONFLICT,
            {error: dateErrors.theCarIsAlreadyReservedForSelectedDates},
            1,
            {...validBody, endDate: new Date("Mon Jan 22 2029 23:00:00 GMT+0100 (Central European Standard Time)")}
        )
        await postUserReservationRequestTest(
            user1,
            StatusCodes.CONFLICT,
            {error: dateErrors.theCarIsAlreadyReservedForSelectedDates},
            1,
            validBody
        )
        await postUserReservationRequestTest(
            user1,
            StatusCodes.CONFLICT,
            {error: dateErrors.maxReservationsReachedForSelectedCar},
            1,
            {
                ...validBody,
                startDate: validBody.endDate,
                endDate: new Date("Tue Jan 23 2029 23:00:00 GMT+0100 (Central European Standard Time)")
            }
        )
    })

    it("returns BAD_REQUEST(400) when user id is invalid and logged in", async () => {
        for (const id of invalidIds) {
            await postUserReservationRequestTest(
                user1,
                StatusCodes.BAD_REQUEST,
                {error: errors.idMustBePositiveInteger},
                id,
                validBody
            )
        }
    })

    it("returns BAD_REQUEST(400) when carId is invalid and logged in", async () => {
        for (const id of invalidIds) {
            await postUserReservationRequestTest(
                user1,
                StatusCodes.BAD_REQUEST,
                {error: errors.idMustBePositiveInteger},
                1,
                {...validBody, carId: id}
            )
        }
    })

    it("returns BAD_REQUEST(400) when startDate is invalid and logged in", async () => {
        for (const value of defaultInvalidValues) {
            await postUserReservationRequestTest(
                user1,
                StatusCodes.BAD_REQUEST,
                {error: dateErrors.invalidDateFormat},
                1,
                {...validBody, startDate: value}
            )
        }
    })

    it("returns BAD_REQUEST(400) when endDate is invalid and logged in", async () => {
        for (const value of defaultInvalidValues) {
            await postUserReservationRequestTest(
                user1,
                StatusCodes.BAD_REQUEST,
                {error: dateErrors.invalidDateFormat},
                1,
                {...validBody, endDate: value}
            )
        }
    })

    it("returns BAD_REQUEST(400) when startDate > endDate and logged in", async () => {
        await postUserReservationRequestTest(
            user1,
            StatusCodes.BAD_REQUEST,
            {error: dateErrors.startDateMustBeBeforeEndDate},
            1,
            {...validBody, startDate: new Date("Mon Jan 22 2029 23:00:00 GMT+0100 (Central European Standard Time)")}
        )
    })

    it("returns BAD_REQUEST(400) when total is invalid and logged in", async () => {
        for (const value of invalidNumbers) {
            await postUserReservationRequestTest(
                user1,
                StatusCodes.BAD_REQUEST,
                {error: errors.totalMustBePositiveNumber},
                1,
                {...validBody, total: value}
            )
        }
    })

    it("returns FORBIDDEN(403) when trying to reserve as some other user and being logged in, EVEN if the userId provided does not exist", async () => {
        await postUserReservationRequestTest(
            user1,
            StatusCodes.FORBIDDEN,
            {error: accessDenied},
            999,
            validBody
        );
        await postUserReservationRequestTest(
            user1,
            StatusCodes.FORBIDDEN,
            {error: accessDenied},
            2,
            validBody
        );
    })

    it("returns NOT_FOUND(404) when carId does not exist and logged in", async () => {
        const id = 999;
        await postUserReservationRequestTest(
            user1,
            StatusCodes.NOT_FOUND,
            {error: carErrors.carWithIdNotFound(id)},
            1,
            {...validBody, carId: id}
        )
    })

    it("returns UNAUTHORIZED(401) when not logged in", async () => {
        await postUserReservationRequestTest(null, StatusCodes.UNAUTHORIZED, {error: authorizationErrors.notLoggedIn});
    });
})

describe("DELETE /users/:id/reservations/:reservationId", () => {
    async function deleteReservation(user, expectedStatus, expectedBody, userId, reservationId) {
        const token = await login(user);
        const res = await request(app)
            .delete(`/users/${userId}/reservations/${reservationId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    }

    it("returns NO_CONTENT(204) when a valid and existing id is provided and logged in", async () => {
        await deleteReservation(
            user1,
            StatusCodes.NO_CONTENT,
            {},
            1,
            1
        );
        await deleteReservation(
            user2,
            StatusCodes.NO_CONTENT,
            {},
            2,
            2
        );
    })

    it("returns BAD_REQUEST(400) when id is invalid and logged in", async () => {
        for (const id of invalidIds) {
            await deleteReservation(
                user1,
                StatusCodes.BAD_REQUEST,
                {error: errors.idMustBePositiveInteger},
                1,
                id
            );
        }
    })

    it("returns NOT_FOUND(404) when reservationId does not exist and logged in", async () => {
        await deleteReservation(
            user1,
            StatusCodes.NOT_FOUND,
            {error: dateErrors.reservationWithIdNotFound(999)},
            1,
            999
        );
    })

    it("returns FORBIDDEN(403) when trying to delete reservation of a different user and being logged in, EVEN if the userId provided does not exist", async () => {
        await deleteReservation(
            user1,
            StatusCodes.FORBIDDEN,
            {error: accessDenied},
            999,
            1
        );
        await deleteReservation(
            user1,
            StatusCodes.FORBIDDEN,
            {error: accessDenied},
            2,
            1
        );
    })

    it("returns UNAUTHORIZED(401) when not logged in", async () => {
        await deleteReservation(null, StatusCodes.UNAUTHORIZED, {error: authorizationErrors.notLoggedIn});
    });
})