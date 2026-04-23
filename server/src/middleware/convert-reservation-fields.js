import {fieldsToDate, fieldsToNumber} from "../utils/fields-conversion.js";

export function convertReservationFields(req, res, next) {
    if (req.body) {
        fieldsToNumber(req.body, ["userId", "carId", "total"]);
        fieldsToDate(req.body, ["startDate", "endDate"]);
    }

    fieldsToNumber(req.params, ["userId", "reservationId"]);
    next();
}