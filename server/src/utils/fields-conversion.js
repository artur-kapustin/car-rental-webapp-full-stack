export function trimFields(object, fields) {
    fields.forEach((field) => {
        if (object[field]) {
            object[field] = object[field].trim();
        }
    })
}

export function fieldsToNumber(object, fields) {
    fields.forEach((field) => {
        if (object[field]) {
            object[field] = Number(object[field]);
        }
    })
}

export function fieldsToDate(object, fields) {
    fields.forEach((field) => {
        if (object[field]) {
            object[field] = new Date(object[field]);
        }
    })
}

export function fieldsToBoolean(object, fields) {
    fields.forEach((field) => {
        if (object[field]) {
            if (object[field] === "true") {
                object[field] = true;
            } else if (object[field] === "false") {
                object[field] = false;
            }
        }
    })
}

export function fieldsToArray(object, fields) {
    fields.forEach((field) => {
        if (object[field]) {
            object[field] = object[field].split(",");
        } else {
            object[field] = [];
        }
    })
}