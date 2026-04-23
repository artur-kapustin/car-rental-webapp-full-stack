import * as dbHelper from "../db/database-helper.js";
import {StatusCodes} from "http-status-codes";
import * as generalValidator from "../utils/validation/general-validation.js";
import * as datesValidator from "../utils/validation/date-validation.js";
import {userErrors} from "../utils/validation/user-validation.js";
import {carErrors} from "../utils/validation/car-validation.js";
import {broadcast} from "../utils/server-sent-events.js";
import {accessDenied} from "../utils/authorization-errors.js";

export async function getReservationsOfCar(req, res) {
    const { id } = req.params;
    const search = req.query.search?.trim();

    if (generalValidator.isNotPositiveNumber(id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: generalValidator.errors.idMustBePositiveInteger});
    }

    let reservations;
    if (search) {
        reservations = await dbHelper.searchReservationsOfCar(id, search);
    } else {
        reservations = await dbHelper.getReservationsOfCar(id);
    }

    return res.status(StatusCodes.OK).json(reservations);
}

export async function getReservationsOfUser(req, res) {
    const { userId } = req.params;
    const { jwtUser } = req;
    const search = req.query.search?.trim();

    if (generalValidator.isNotPositiveNumber(userId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: generalValidator.errors.idMustBePositiveInteger});
    }

    if (jwtUser.id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({error: accessDenied});
    }

    let reservations;
    if (search) {
        reservations = await dbHelper.searchReservationsOfUser(userId, search);
    } else {
        reservations = await dbHelper.getReservationsOfUser(userId);
    }

    return res.status(StatusCodes.OK).json(reservations);
}

export async function postReservation(req, res) {
    const { carId, startDate, endDate, total } = req.body;
    const { userId } = req.params;
    const { jwtUser } = req;

    if (generalValidator.isNotPositiveNumber(userId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: generalValidator.errors.idMustBePositiveInteger});
    }

    if (generalValidator.isNotPositiveNumber(carId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: generalValidator.errors.idMustBePositiveInteger});
    }

    if (generalValidator.isNotPositiveNumber(total)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: generalValidator.errors.totalMustBePositiveNumber});
    }

    if (jwtUser.id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({error: accessDenied});
    }

    const datesValidation = datesValidator.validateDates(startDate, endDate);
    if (datesValidation.invalid) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: datesValidation.error})
    }

    const user = await dbHelper.getUserById(userId);
    // It is expected to never hit this. However, I still leave it here just in case.
    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({error: userErrors.userWithIdNotFound(userId)})
    }

    const car = await dbHelper.getCarById(carId);
    if (!car) {
        return res.status(StatusCodes.NOT_FOUND).json({error: carErrors.carWithIdNotFound(carId)})
    }

    const overlapping = await dbHelper.overlappingReservations(carId, startDate, endDate);
    if (overlapping) {
        return res.status(StatusCodes.CONFLICT).json({error: datesValidator.dateErrors.theCarIsAlreadyReservedForSelectedDates})
    }

    const countCarReservations = await dbHelper.countCarReservations(carId);
    if (countCarReservations >= car.maxReservedAtATime) {
        return res.status(StatusCodes.CONFLICT).json({error: datesValidator.dateErrors.maxReservationsReachedForSelectedCar});
    }

    await dbHelper.postReservation(userId, carId, startDate, endDate, total);

    broadcast('car-updated', {});

    return res.status(StatusCodes.CREATED).json({message: "Successfully posted new reservation."});
}

export async function deleteReservation(req, res) {
    const { userId, reservationId } = req.params;
    const { jwtUser } = req;

    if (generalValidator.isNotPositiveNumber(reservationId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: generalValidator.errors.idMustBePositiveInteger});
    }

    if (jwtUser.id !== userId) {
        return res.status(StatusCodes.FORBIDDEN).json({error: accessDenied});
    }

    const changes = await dbHelper.deleteReservation(userId, reservationId);

    if (changes === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({error: datesValidator.dateErrors.reservationWithIdNotFound(reservationId)});
    }

    broadcast('car-updated', {});

    return res.sendStatus(StatusCodes.NO_CONTENT);
}