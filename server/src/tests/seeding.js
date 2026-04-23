import {hashPassword} from "../utils/hashing.js";
import {postAdmin, postCar, postReservation, postUser} from "../db/database-helper.js";

export const car = {
    mark: "Test1",
    model: "1",
    url: "some url",
    pricePerDay: 22,
    maxReservedAtATime: 3,
    description: "some description"
}

export const user1 = {
    name: "user1",
    email: "user1@test.com",
    password: "password1"
}

export const user2 = {
    name: "user2",
    email: "user2@test.com",
    password: "password2"
}

export const admin = {
    name: "admin",
    email: "admin@test.com",
    password: "adminPassword"
}

export async function seedTestDb() {
    await postCar(car.mark, car.model, car.url, car.pricePerDay, car.maxReservedAtATime, car.description);
    await postUser(user1.name, user1.email, await hashPassword(user1.password));
    await postUser(user2.name, user2.email, await hashPassword(user2.password));
    await postAdmin(admin.name, admin.email, await hashPassword(admin.password));
    await postReservation(1, 1, new Date("Wed Mar 15 2028 23:00:00 GMT+0100 (Central European Standard Time)"), new Date("Fri Mar 24 2028 23:00:00 GMT+0100 (Central European Standard Time)"), 120)
    await postReservation(2, 1, new Date("Thu Apr 27 2028 23:00:00 GMT+0200 (Central European Summer Time)"), new Date("Sun Apr 30 2028 23:00:00 GMT+0200 (Central European Summer Time)"), 150)
}