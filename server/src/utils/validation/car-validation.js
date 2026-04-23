import * as generalValidation from "./general-validation.js";
import {getCarMarks} from "../../db/database-helper.js"

export function isImageUrlInvalid(imageUrl) {
    return !(/^(https?:\/\/\S+)\.(png|jpe?g)([?#].*)?$/i.test(imageUrl));
}

export function isPricePerDayInvalid(pricePerDay) {
    return generalValidation.isNotPositiveNumber(pricePerDay) || pricePerDay > 999;
}

export function isDescriptionInvalid(description) {
    return !(description && /^.{1,1999}$/.test(description.trim()));
}

export async function isMarksArrayInvalid(array) {
    const carMarks = await getCarMarks();

    if (!array || (array.length !== 0 && !array.every((value) => carMarks.includes(value)))) {
        return true;
    }

    return false;
}

export function validateMinMaxPrice(minPrice, maxPrice) {
    if (isPricePerDayInvalid(minPrice) || isPricePerDayInvalid(maxPrice)) {
        return {invalid: true, error: carErrors.pricePerDayMustBeBetweenOneAndThousand};
    }

    if (minPrice > maxPrice) {
        return {invalid: true, error: carErrors.maxPriceMustBeGreaterThanMinPrice};
    }

    return { invalid: false };
}

export function validateCarInfo(mark, model, imageUrl, pricePerDay, maxReservedAtATime, description) {
    if (generalValidation.isNotStringOrIsEmpty(mark)) {
        return { invalid: true, error: carErrors.markMustBeNonEmptyString };
    }

    if (generalValidation.isNotStringOrIsEmpty(model)) {
        return { invalid: true, error: carErrors.modelMustBeNonEmptyString };
    }

    if (isImageUrlInvalid(imageUrl)) {
        return { invalid: true, error: carErrors.imageUrlMustBeOfValidFormat };
    }

    if (isPricePerDayInvalid(pricePerDay)) {
        return { invalid: true, error: carErrors.pricePerDayMustBeBetweenOneAndThousand };
    }

    if (generalValidation.isNotPositiveNumber(maxReservedAtATime)) {
        return { invalid: true, error: carErrors.maxReservedAtATimeMustBePositiveInteger };
    }

    if (isDescriptionInvalid(description)) {
        return { invalid: true, error: carErrors.descriptionMustBeBetweenOneAndTwoThousandCharacters };
    }

    return { invalid: false };
}

export const carErrors = {
    modelMustBeNonEmptyString: "Model must be a non-empty string.",
    markMustBeNonEmptyString: "Mark must be a non-empty string",
    mustBeAnArrayOfValidMarks: "Must be an array of valid marks",
    imageUrlMustBeOfValidFormat: "Image URL must be a valid PNG, JPG, or JPEG link.",
    pricePerDayMustBeBetweenOneAndThousand: "Price per day must be a number between 1 and 1000 (exclusive).",
    maxPriceMustBeGreaterThanMinPrice: "Max price must be greater than min price",
    maxReservedAtATimeMustBePositiveInteger: "Max reserved at a time must be a positive number.",
    descriptionMustBeBetweenOneAndTwoThousandCharacters: "Description must be between 1 and 2000 characters.",
    carWithIdNotFound: (id) => `Car with id=${id} not found.`
}