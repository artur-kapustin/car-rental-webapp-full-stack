import {describe, it, expect, beforeEach} from "vitest";
import request from "supertest";
import app from "../index.js";
import * as dbHelper from "../db/database-helper.js";
import {StatusCodes} from "http-status-codes";
import {admin, seedTestDb, user1} from "./seeding.js"
import * as carValidator from "../utils/validation/car-validation.js";
import * as authorizationErrors from "../utils/authorization-errors.js";
import * as generalValidator from "../utils/validation/general-validation.js";
import * as dateValidator from "../utils/validation/date-validation.js";
import {defaultInvalidValues, invalidIds, invalidNumbers} from "./utils.js";


beforeEach(async () => {
    await dbHelper.resetDb();
    await seedTestDb();
});

async function login(role) {
    if (role === "none") {
        return;
    }

    const res = await request(app)
        .post("/tokens")
        .send({
            email: role === "admin" ? admin.email : user1.email,
            password: role === "admin" ? admin.password : user1.password
        })

    expect(res.status).toBe(StatusCodes.OK);
    return res.body.accessToken;
}

const validCar = {
    mark: "test",
    model: "3",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/eb/2025_Audi_Q7_%284M%29_DSC_7492.jpg",
    pricePerDay: 123,
    maxReservedAtATime: 5,
    description: "description"
};

async function testInvalidField(validObject, field, expectedError, serverRequestTest) {
    await serverRequestTest(
        'admin',
        {...validObject, ...field},
        StatusCodes.BAD_REQUEST,
        {error: expectedError}
    )
}

async function testDefaultInvalidValues(validObject, fieldName, expectedError, serverRequestTest) {
    for (const value of defaultInvalidValues) {
        await testInvalidField(validObject, {[fieldName]: value}, expectedError, serverRequestTest);
    }
}

async function testNonEmptyString(validObject, fieldName, serverRequestTest) {
    const error = carValidator.carErrors[`${fieldName}MustBeNonEmptyString`];
    await testDefaultInvalidValues(validObject, fieldName, error, serverRequestTest);
}

async function testNotPositiveNumber(validObject, fieldName, error, serverRequestTest) {
    for (const value of invalidNumbers) {
        await testInvalidField(validObject, {[fieldName]: value}, error, serverRequestTest);
    }
}

function testPostPutCarValidation(serverRequestTest) {
    it("returns BAD_REQUEST(400) when car mark is invalid", async () => {
        await testNonEmptyString(validCar, "mark", serverRequestTest);
    });

    it("returns BAD_REQUEST(400) when car model is invalid", async () => {
        await testNonEmptyString(validCar, "model", serverRequestTest);
    });

    it("returns BAD_REQUEST(400) when car imageUrl is invalid", async () => {
        const error = carValidator.carErrors.imageUrlMustBeOfValidFormat;
        const fieldName = "imageUrl";

        await testDefaultInvalidValues(validCar, fieldName, error, serverRequestTest);
        await testInvalidField(validCar, {[fieldName]: "https://google.com/"}, error, serverRequestTest);
    });

    it("returns BAD_REQUEST(400) when car pricePerDay is invalid", async () => {
        const error = carValidator.carErrors.pricePerDayMustBeBetweenOneAndThousand;
        const fieldName = "pricePerDay";

        await testDefaultInvalidValues(validCar, fieldName, error, serverRequestTest);
        await testNotPositiveNumber(validCar, fieldName, error, serverRequestTest);
        await testInvalidField(validCar, {pricePerDay: 1000}, error, serverRequestTest);
    });

    it("returns BAD_REQUEST(400) when car maxReservedAtATime is invalid", async () => {
        const error = carValidator.carErrors.maxReservedAtATimeMustBePositiveInteger;
        const fieldName = "maxReservedAtATime";

        await testDefaultInvalidValues(validCar, fieldName, error, serverRequestTest);
        await testNotPositiveNumber(validCar, fieldName, error, serverRequestTest);
    });

    it("returns BAD_REQUEST(400) when car description is invalid", async () => {
        const error = carValidator.carErrors.descriptionMustBeBetweenOneAndTwoThousandCharacters;
        const fieldName = "description";

        await testDefaultInvalidValues(validCar, fieldName, error, serverRequestTest);
        await testInvalidField(validCar, {[fieldName]: "a".repeat(2000)}, error, serverRequestTest);
    });
}

function testPostPutAuthorization(serverRequestTest) {
    it("returns FORBIDDEN(403) when not logged in", async () => {
        await serverRequestTest("none", validCar, StatusCodes.FORBIDDEN, {error: authorizationErrors.notLoggedIn})
    });

    it("returns UNAUTHORIZED(401) when logged in as user", async () => {
        await serverRequestTest("user", validCar, StatusCodes.UNAUTHORIZED, {error: authorizationErrors.permissionDenied})
    });
}

describe("GET /cars/:id", () => {
    async function getCarByIdRequestTest(id, expectedStatus, expectedBody) {
        const res = await request(app).get(`/cars/${id}`);

        if (expectedStatus === StatusCodes.OK) {
            delete res.body.createdAt;
            delete res.body.updatedAt;
        }

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    }

    async function testForBadRequest(id) {
        await getCarByIdRequestTest(
            id,
            StatusCodes.BAD_REQUEST,
            {error: "ID must be a positive integer."}
        );
    }

    it("returns OK(200) when exists and is valid", async () => {
        await getCarByIdRequestTest(
            1,
            StatusCodes.OK,
            {
            "id": 1,
            "mark": "Test1",
            "model": "1",
            "imageUrl": "some url",
            "pricePerDay": 22,
            "maxReservedAtATime": 3,
            "description": "some description"
            }
        )
    });

    it("returns NOT_FOUND(404) when does not exist", async () => {
        await getCarByIdRequestTest(
            2,
            StatusCodes.NOT_FOUND,
            {error: "Car with id=2 not found."}
        );
    });

    it("return BAD_REQUEST(400) when id is invalid", async () => {
        for (const value of invalidIds) {
            await testForBadRequest(value);
        }
    })
});

describe("GET /cars", () => {
    const validQuery = {
        marks: ["Test1"],
        startDate: "Mon May 25 2026 23:00:00 GMT+0200 (Central European Summer Time)",
        endDate: "Thu May 28 2026 23:00:00 GMT+0200 (Central European Summer Time)",
        minPrice: 1,
        maxPrice: 100
    };

    const validReturnBody = [
        {
            "description": "some description",
            "id": 1,
            "imageUrl": "some url",
            "mark": "Test1",
            "maxReservedAtATime": 3,
            "model": "1",
            "numReservedTotal": 2,
            "numReservedAtChosenDates": 0,
            "pricePerDay": 22,
        },
    ];

    async function getCarsRequestTest(role, query, expectedStatus, expectedBody) {
        const res = await request(app)
            .get(`/cars?marks=${query.marks}&startDate=${query.startDate}&endDate=${query.endDate}&minPrice=${query.minPrice}&maxPrice=${query.maxPrice}`);

        if (expectedStatus === StatusCodes.OK) {
            res.body.forEach((element) => {
                delete element.createdAt;
                delete element.updatedAt;
            })
        }

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    }

    it("returns OK(200) when all the data provided is valid", async () => {
        await getCarsRequestTest(
            "none",
            validQuery,
            StatusCodes.OK,
            validReturnBody
        )
    })

    it("returns BAD_REQUEST(400) when marks is an invalid array", async () => {
        await testInvalidField(validQuery, {marks: "[asdf,"}, carValidator.carErrors.mustBeAnArrayOfValidMarks, getCarsRequestTest);
        await testInvalidField(validQuery, {marks: ",asdf]"}, carValidator.carErrors.mustBeAnArrayOfValidMarks, getCarsRequestTest);
        await testInvalidField(validQuery, {marks: "asdf"}, carValidator.carErrors.mustBeAnArrayOfValidMarks, getCarsRequestTest);
        await testInvalidField(validQuery, {marks: null}, carValidator.carErrors.mustBeAnArrayOfValidMarks, getCarsRequestTest);
        await testInvalidField(validQuery, {marks: undefined}, carValidator.carErrors.mustBeAnArrayOfValidMarks, getCarsRequestTest);
    })

    it("returns BAD_REQUEST(400) when startDate is invalid", async () => {
        await testDefaultInvalidValues(validQuery, "startDate", dateValidator.dateErrors.invalidDateFormat, getCarsRequestTest);
        await testInvalidField(validQuery, {startDate: "Sat Dec 40 0234 25:26:21 GMT+0100 (asdfasdf)"}, dateValidator.dateErrors.invalidDateFormat, getCarsRequestTest);
    })

    it("returns BAD_REQUEST(400) when endDate is invalid", async () => {
        await testDefaultInvalidValues(validQuery, "endDate", dateValidator.dateErrors.invalidDateFormat, getCarsRequestTest);
        await testInvalidField(validQuery, {endDate: "Sat Dec 40 0234 25:26:21 GMT+0100 (asdfasdf)"}, dateValidator.dateErrors.invalidDateFormat, getCarsRequestTest);
    })

    it("returns BAD_REQUEST(400) when startDate is later than endDate", async () => {
        await getCarsRequestTest(
            "none",
            {
                ...validQuery,
                startDate: "Thu May 28 2026 23:00:00 GMT+0200 (Central European Summer Time)",
                endDate: "Mon May 25 2026 23:00:00 GMT+0200 (Central European Summer Time)"
            },
            StatusCodes.BAD_REQUEST,
            {error: dateValidator.dateErrors.startDateMustBeBeforeEndDate}
        )
    })

    it("returns BAD_REQUEST(400) when minPrice is a number not between 1(including) and 1000(excluding)", async () => {
        const error = carValidator.carErrors.pricePerDayMustBeBetweenOneAndThousand;
        // await testDefaultInvalidValues(validQuery, "minPrice", error, getCarsRequestTest);
        await testNotPositiveNumber(validQuery, "minPrice", error, getCarsRequestTest);
        // await testInvalidField(validQuery, {minPrice: -1}, error, getCarsRequestTest);
        // await testInvalidField(validQuery, {minPrice: 0}, error, getCarsRequestTest);
        await testInvalidField(validQuery, {minPrice: 1000}, error, getCarsRequestTest);
    })

    it("returns BAD_REQUEST(400) when maxPrice is a number not between 1(including) and 1000(excluding)", async () => {
        const error = carValidator.carErrors.pricePerDayMustBeBetweenOneAndThousand;
        // await testDefaultInvalidValues(validQuery, "maxPrice", error, getCarsRequestTest);
        await testNotPositiveNumber(validQuery, "maxPrice", error, getCarsRequestTest);
        // await testInvalidField(validQuery, {maxPrice: -1}, error, getCarsRequestTest);
        // await testInvalidField(validQuery, {maxPrice: 0}, error, getCarsRequestTest);
        await testInvalidField(validQuery, {maxPrice: 1000}, error, getCarsRequestTest);
    })

    it("returns BAD_REQUEST(400) when minPrice is greater than maxPrice", async () => {
        await getCarsRequestTest(
            "none",
            {
                ...validQuery,
                minPrice: 100,
                maxPrice: 50
            },
            StatusCodes.BAD_REQUEST,
            {error: carValidator.carErrors.maxPriceMustBeGreaterThanMinPrice}
        )
    })
});

describe("POST /cars", () => {
    async function postRequestTest(role, car, expectedStatus, expectedBody) {
        const token = await login(role);
        const res = await request(app)
            .post("/cars")
            .send(car)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    }

    it("returns CREATED(201) when all the information provided is valid and logged in as admin", async () => {
        await postRequestTest(
            "admin",
            validCar,
            StatusCodes.CREATED,
            {
                id: 2,
                message: "Car added successfully."
            }
        )
    });

    testPostPutCarValidation(postRequestTest);
    testPostPutAuthorization(postRequestTest);
});

describe("PUT /cars/:id", () => {
    async function putRequestTest(role, car, expectedStatus, expectedBody, id) {
        id = arguments.length >= 5 ? id : 1;
        const token = await login(role);
        const res = await request(app)
            .put(`/cars/${id}`)
            .send(car)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    }

    async function testIdForBadRequest(id) {
        await putRequestTest(
            "admin",
            validCar,
            StatusCodes.BAD_REQUEST,
            {error: generalValidator.errors.idMustBePositiveInteger},
            id
        );
    }

    async function testIdForNotFound(id, expectedBody) {
        await putRequestTest(
            "admin",
            validCar,
            StatusCodes.NOT_FOUND,
            expectedBody,
            id
        );
    }

    it("returns OK(200) when all the information passed is valid and logged in as admin", async () => {
        await putRequestTest(
            "admin",
            validCar,
            StatusCodes.OK,
            {
                id: 1,
                message: "1 changes made to car."
            },
            1
        );
    });

    it("returns BAD_REQUEST(400) when id is invalid", async () => {
        for (const value of invalidIds) {
            await testIdForBadRequest(value);
        }
    });

    it("returns NOT_FOUND(404) when id does not exist in the database", async () => {
        const id = 2;
        await testIdForNotFound(id, {error: carValidator.carErrors.carWithIdNotFound(id)});
        await testIdForNotFound("", {});
    });

    testPostPutCarValidation(putRequestTest);
    testPostPutAuthorization(putRequestTest);
});

describe("DELETE /cars/:id", () => {
    async function deleteRequestTest(role, id, expectedStatus, expectedBody) {
        const token = await login(role);
        const res = await request(app)
            .delete(`/cars/${id}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    }

    async function testForBadRequest(id) {
        await deleteRequestTest(
            "admin",
            id,
            StatusCodes.BAD_REQUEST,
            {error: generalValidator.errors.idMustBePositiveInteger}
        );
    }

    it("returns NO_CONTENT(204) when a valid id is provided and logged in as admin", async () => {
        const id = 1;
        await deleteRequestTest(
            "admin",
            id,
            StatusCodes.NO_CONTENT,
            {}
        );
        await deleteRequestTest(
            "admin",
            id,
            StatusCodes.NOT_FOUND,
            {error: carValidator.carErrors.carWithIdNotFound(id)}
        );
    })

    it("returns NOT_FOUND(404) when a id that does not exist is provided and logged in as admin", async () => {
        const id = 2;

        await deleteRequestTest(
            "admin",
            id,
            StatusCodes.NOT_FOUND,
            {error: carValidator.carErrors.carWithIdNotFound(id)}
        );
    })

    it("returns BAD_REQUEST(400) when id is not a positive integer and logged in as admin", async () => {
        for (const value of invalidIds) {
            await testForBadRequest(value);
        }
    })

    it("returns FORBIDDEN(403) when not logged in", async () => {
        await deleteRequestTest("none", 1, StatusCodes.FORBIDDEN, {error: authorizationErrors.notLoggedIn})
    });

    it("returns UNAUTHORIZED(401) when logged in as user", async () => {
        await deleteRequestTest("user", 1, StatusCodes.UNAUTHORIZED, {error: authorizationErrors.permissionDenied});
    });
})

describe("GET /cars/marks", () => {
    it("returns OK(200)", async () => {
        const res = await request(app)
            .get(`/cars/marks`);

        expect(res.status).toBe(StatusCodes.OK);
        expect(res.body).toEqual(["Test1"]);
    })
})