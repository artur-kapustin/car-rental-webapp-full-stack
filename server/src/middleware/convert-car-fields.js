import {fieldsToDate, fieldsToNumber, trimFields} from "../utils/fields-conversion.js";

export function convertCarFields(req, res, next) {
    if (req.body) {
        trimFields(req.body, ["mark", "model", "imageUrl", "description"]);
        fieldsToNumber(req.body, ["pricePerDay", "maxReservedAtATime"]);
        fieldsToDate(req.body, ["startDate", "endDate"]);
    }

    fieldsToNumber(req.params, ["id"]);
    next();
}