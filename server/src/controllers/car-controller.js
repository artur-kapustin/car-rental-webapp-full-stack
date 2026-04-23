import * as dbHelper from "../db/database-helper.js";
import {StatusCodes} from "http-status-codes";
import * as carValidator from "../utils/validation/car-validation.js";
import * as generalValidator from "../utils/validation/general-validation.js";
import {validateDates} from "../utils/validation/date-validation.js";
import {fieldsToArray, fieldsToDate, fieldsToNumber} from "../utils/fields-conversion.js";
import {addClient, removeClient} from "../utils/server-sent-events.js";

export function streamCars(req, res) {
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    res.flushHeaders();
    res.write(': connected\n\n');
    addClient(res);

    const heartbeat = setInterval(() => {
        res.write(': ping\n\n');
    }, 30000);

    req.on('close', () => {
        clearInterval(heartbeat);
        removeClient(res);
    });
}

export async function getCarById(req, res) {
    const { id } = req.params;

    if (generalValidator.isNotPositiveNumber(id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: generalValidator.errors.idMustBePositiveInteger})
    }

    const car = await dbHelper.getCarById(id);

    if (car === null) {
        return res.status(StatusCodes.NOT_FOUND).json({error: carValidator.carErrors.carWithIdNotFound(id)});
    }

    return res.status(StatusCodes.OK).json(car);
}

export async function getCars(req, res) {
    // I think the only alternative way to
    // convert types for query is a custom query parser,
    // which seems to be not worth it in my case,
    // since I don't use queries that much.
    // I tried doing it in middleware,
    // but turns out query is immutable.
    const query = {...req.query};
    fieldsToNumber(query, ["minPrice", "maxPrice"]);
    fieldsToDate(query, ["startDate", "endDate"]);
    fieldsToArray(query, ["marks"]);
    const { marks, startDate, endDate, minPrice, maxPrice } = query;

    const datesValidation = validateDates(startDate, endDate);
    if (datesValidation.invalid) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: datesValidation.error });
    }

    if (await carValidator.isMarksArrayInvalid(marks)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: carValidator.carErrors.mustBeAnArrayOfValidMarks});
    }

    const priceValidation = carValidator.validateMinMaxPrice(minPrice, maxPrice);
    if (priceValidation.invalid) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: priceValidation.error})
    }

    return res.status(StatusCodes.OK).json(await dbHelper.getCars(marks, startDate, endDate, minPrice, maxPrice));
}

export async function getCarMarks(req, res) {
    return res.status(StatusCodes.OK).json(await dbHelper.getCarMarks());
}

export async function postCar(req, res) {
    const { mark, model, imageUrl, pricePerDay, maxReservedAtATime, description } = req.body;

    const carValidation = carValidator.validateCarInfo(mark, model, imageUrl, pricePerDay, maxReservedAtATime, description);
    if (carValidation.invalid) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: carValidation.error});
    }

    const car = await dbHelper.postCar(mark, model, imageUrl, pricePerDay, maxReservedAtATime, description);

    return res.status(StatusCodes.CREATED).json({
        id: car.id,
        message: "Car added successfully."
    });
}

export async function putCar(req, res) {
    const { mark, model, imageUrl, pricePerDay, maxReservedAtATime, description } = req.body;
    const id = req.params.id;

    if (generalValidator.isNotPositiveNumber(id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: generalValidator.errors.idMustBePositiveInteger})
    }

    const carValidation = carValidator.validateCarInfo(mark, model, imageUrl, pricePerDay, maxReservedAtATime, description);
    if (carValidation.invalid) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: carValidation.error});
    }

    if (!await dbHelper.getCarById(id)) {
        return res.status(StatusCodes.NOT_FOUND).json({error: carValidator.carErrors.carWithIdNotFound(id)})
    }

    const changes = await dbHelper.putCar(id, mark, model, imageUrl, pricePerDay, maxReservedAtATime, description);

    return res.status(StatusCodes.OK).json({
        id: id,
        message: `${changes[0]} changes made to car.`
    });
}

export async function deleteCar(req, res) {
    const id = req.params.id;

    if (generalValidator.isNotPositiveNumber(id)) {
        return res.status(StatusCodes.BAD_REQUEST).json({error: generalValidator.errors.idMustBePositiveInteger})
    }

    const changes = await dbHelper.deleteCar(id);

    if (changes === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({error: carValidator.carErrors.carWithIdNotFound(id)});
    }

    return res.sendStatus(StatusCodes.NO_CONTENT);
}