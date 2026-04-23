export function validateDates(startDate, endDate) {
    // Check if dates are valid Date objects
    if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return { invalid: true, error: dateErrors.invalidDateFormat };
    }

    // Check if startDate is before or equal to endDate
    if (startDate.getTime() > endDate.getTime()) {
        return { invalid: true, error: dateErrors.startDateMustBeBeforeEndDate };
    }

    return { invalid: false };
}

export const dateErrors = {
    invalidDateFormat: "Invalid date format.",
    startDateMustBeBeforeEndDate: "Start date must be before end date.",
    theCarIsAlreadyReservedForSelectedDates: "The car is already reserved for the selected dates.",
    maxReservationsReachedForSelectedCar: "Maximum reservations reached for selected car",
    reservationWithIdNotFound: (id) => `Reservation with id=${id} not found.`
}