import {fieldsToBoolean, fieldsToNumber, trimFields} from "../utils/fields-conversion.js";

export function convertUserFields(req, res, next) {
    if (req.body) {
        trimFields(req.body, ["name", "email"]);
        fieldsToBoolean(req.body, ["isAccountDisabled"]);
    }

    fieldsToNumber(req.params, ["userId"]);
    next();
}