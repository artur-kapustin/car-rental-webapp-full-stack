import {protectedFetch} from "./fetch-wrapper.js";
import {throwError} from "../../error-handling/error-utils.js";
import {cars, reservationUrl, users} from "./urls.js";

export const getReservationsOfUser = async (id, search) => {
    const response = await protectedFetch(users.reservationsWithSearch(id, search), {
        method: "get"
    });

    if (!response.ok) {
        throwError(`Response status: ${response.status}`);
    }

    return await response.json();
}


export const getReservationsOfCar = async (id, search) => {
    const response = await protectedFetch(cars.reservationsWithSearch(id, search), {
        method: "get"
    });

    if (!response.ok) {
        throwError(`Response status: ${response.status}`);
    }

    return await response.json();
}

export const postReservation = async (userId, carId, startDate, endDate, total) => {
    const reservation = {
        userId: userId,
        carId: carId,
        startDate: startDate,
        endDate: endDate,
        total: total
    };

    console.log(1)

    const response = await protectedFetch(users.reservations(userId), {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(reservation)
    });

    console.log(2)
    const json = await response.json();

    console.log(3)
    if (!response.ok) {
        throwError(`Response status: ${response.status}; ${json.error}`);
        return json.error;
    }
}

export const deleteReservation = async (userId, reservationId) => {
    const response = await protectedFetch(reservationUrl(userId, reservationId), {
        method: "delete"
    });

    if (!response.ok) {
        throwError(`Response status: ${response.status}; failed to delete`);
    }
}