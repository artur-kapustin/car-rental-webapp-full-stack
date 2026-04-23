const generalConstraints = [
    {
        validate: (value) => value.trim().length > 0,
        message: 'The field must not be empty.'
    },
    {
        validate: (value) => value.trim().length < 256,
        message: 'The field must be less than 256 characters.'
    }
]

const passwordConstraints = [
    {
        validate: (value) => value.length < 256,
        message: 'The field must be less than 256 characters.'
    },
    {
        validate: (value) => value.length >= 8,
        message: 'The password must be at least 8 characters long.'
    }
]

const emailConstraints = [
    {
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Please provide a valid email. E.g. abc@defg.com'
    }
]

const numberConstraints = [
    {
        validate: (value) => value > 0,
        message: 'Please enter a number greater than zero.'
    }
]

const pricePerDayConstraints = [
    {
        validate: (value) => value > 0 && value < 1000,
        message: 'Please enter a number from 1 to 1000(exclusive).'
    }
]

const urlConstraints = [
    generalConstraints[0],
    {
        validate: (value) => /^(https?:\/\/\S+)\.(png|jpe?g)([?#].*)?$/i.test(value),
        message: 'Please enter a valid png, jpg or jpeg image url.'
    }
]

const descriptionConstraints = [
    generalConstraints[0],
    {
        validate: (value) => value.trim().length < 2000,
        message: 'Description must not exceed 2000 characters.'
    }
]

export const constraintsMap = new Map([
    ['text', generalConstraints],
    ['email', emailConstraints],
    ['password', passwordConstraints],
    ['url', urlConstraints],
    ['number', numberConstraints],
    ['textarea', descriptionConstraints],
    ['pricePerDay', pricePerDayConstraints]
]);