import {protectedFetch} from "./fetch-wrapper.js";
import {throwError} from "../../error-handling/error-utils.js";
import {cars} from "./urls.js";

export const getCars = async (marks, datesRange, minPrice, maxPrice) => {
    const response = await fetch(cars.withQuery(`marks=${marks}&startDate=${datesRange.startDate}&endDate=${datesRange.endDate}&minPrice=${minPrice}&maxPrice=${maxPrice}`), {
        method: "get"
    });

    const json = await response.json()

    if (!response.ok) {
        throwError(`Response status: ${response.status}; ${json.error}`);
        return;
    }

    return json;
}


export const getCarById = async (id) => {
    const response = await fetch(cars.withId(id), {
        method: "get"
    });

    if (!response.ok) {
        throwError(`Response status: ${response.status}`);
    }

    return await response.json();
}

export const postCar = async (mark, model, imageUrl, pricePerDay, maxReservedAtATime, description) => {
    console.log(mark, model, imageUrl, pricePerDay, maxReservedAtATime, description)

    const car = {
        mark: mark,
        model: model,
        imageUrl: imageUrl,
        pricePerDay: pricePerDay,
        maxReservedAtATime: maxReservedAtATime,
        description: description
    };

    const response = await protectedFetch(cars.base, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(car)
    });

    const json = await response.json();

    if (!response.ok) {
        throwError(`Response status: ${response.status}; ${json.error}`);
        return json.error;
    }
}

export const deleteCar = async (id) => {
    const response = await protectedFetch(cars.withId(id), {
        method: "delete"
    });

    if (!response.ok) {
        throwError(`Response status: ${response.status}; failed to delete`);
    }

    return response.status;
}

export const putCar = async (id, mark, model, imageUrl, pricePerDay, maxReservedAtATime, description) => {
    const car = {
        mark: mark,
        model: model,
        imageUrl: imageUrl,
        pricePerDay: pricePerDay,
        maxReservedAtATime: maxReservedAtATime,
        description: description
    };

    const response = await protectedFetch(cars.withId(id), {
        method: "put",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(car)
    });

    if (!response.ok) {
        throwError(`Response status: ${response.status}; ${await response.json()}`);
    }
}

export const getCarMarks = async () => {
    const response = await fetch(cars.marks, {
        method: "get"
    });

    const json = await response.json()

    if (!response.ok) {
        throwError(`Response status: ${response.status}; ${json.error}`);
        return;
    }

    return json;
}