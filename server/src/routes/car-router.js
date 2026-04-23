import express from "express";
import * as carController from "../controllers/car-controller.js"
import * as reservationsController from "../controllers/reservation-controller.js";
import {verifyAdmin} from "../middleware/verify-admin.js";
import {convertCarFields} from "../middleware/convert-car-fields.js";
import {convertReservationFields} from "../middleware/convert-reservation-fields.js";

const router = express.Router();

/**
 * @openapi
 * openapi: 3.0.0
 * info:
 *   title: Car Rental API
 *   version: 1.0.0
 *   description: API for managing cars, reservations, and users in a car rental system.
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     Car:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         mark:
 *           type: string
 *           example: Toyota
 *         model:
 *           type: string
 *           example: Corolla
 *         imageUrl:
 *           type: string
 *           example: "https://example.com/car1.jpg"
 *         pricePerDay:
 *           type: number
 *           example: 50
 *         maxReservedAtATime:
 *           type: integer
 *           example: 3
 *         description:
 *           type: string
 *           example: "Reliable compact car."
 *
 *     Reservation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 12
 *         userId:
 *           type: integer
 *           example: 5
 *         carId:
 *           type: integer
 *           example: 3
 *         startDate:
 *           type: string
 *           format: date
 *           example: "2028-03-15T22:00:00.000Z"
 *         endDate:
 *           type: string
 *           format: date
 *           example: "2028-03-24T22:00:00.000Z"
 *         total:
 *           type: number
 *           example: 200
 *
 * tags:
 *   - name: Cars
 *     description: Car management and reservation operations
 *
 * paths:
 *   /cars/stream:
 *     get:
 *       summary: Stream car updates
 *       description: Opens a server-sent events connection to stream car-related updates.
 *       tags: [Cars]
 *       responses:
 *         200:
 *           description: Connected to car stream successfully.
 *
 *   /cars/marks:
 *     get:
 *       summary: Get all car marks
 *       description: Retrieve a list of all unique car brands (marks) available.
 *       tags: [Cars]
 *       responses:
 *         200:
 *           description: List of car marks retrieved successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: string
 *
 *   /cars:
 *     get:
 *       summary: Get all available cars
 *       description: Retrieve a list of cars filtered by optional marks, date range, and price range.
 *       tags: [Cars]
 *       parameters:
 *         - in: query
 *           name: marks
 *           schema:
 *             type: array
 *             items:
 *               type: string
 *           description: Optional list of car brands (marks) to filter by.
 *         - in: query
 *           name: startDate
 *           schema:
 *             type: string
 *             format: date
 *           description: Optional start date for car availability.
 *         - in: query
 *           name: endDate
 *           schema:
 *             type: string
 *             format: date
 *           description: Optional end date for car availability.
 *         - in: query
 *           name: minPrice
 *           schema:
 *             type: number
 *           description: Optional minimum daily rental price.
 *         - in: query
 *           name: maxPrice
 *           schema:
 *             type: number
 *           description: Optional maximum daily rental price.
 *       responses:
 *         200:
 *           description: Cars retrieved successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Car'
 *         400:
 *           description: Invalid query parameters.
 *
 *     post:
 *       summary: Add a new car
 *       description: Adds a new car to the system. Admin access required.
 *       tags: [Cars]
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - mark
 *                 - model
 *                 - imageUrl
 *                 - pricePerDay
 *                 - maxReservedAtATime
 *                 - description
 *               properties:
 *                  mark:
 *                    type: string
 *                    example: Toyota
 *                  model:
 *                    type: string
 *                    example: Corolla
 *                  imageUrl:
 *                    type: string
 *                    example: "https://example.com/car1.jpg"
 *                  pricePerDay:
 *                    type: number
 *                    example: 50
 *                  maxReservedAtATime:
 *                    type: integer
 *                    example: 3
 *                  description:
 *                    type: string
 *                    example: "Reliable compact car."
 *       responses:
 *         201:
 *           description: Car added successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   message:
 *                     type: string
 *         400:
 *           description: Invalid input fields.
 *         401:
 *           description: Unauthorized. JWT token missing or not admin.
 *         403:
 *           description: Forbidden. Invalid token, JWT error.
 *
 *   /cars/{id}:
 *     get:
 *       summary: Get car by ID
 *       description: Retrieve a specific car by its ID.
 *       tags: [Cars]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         200:
 *           description: Car retrieved successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Car'
 *         400:
 *           description: Invalid car ID.
 *         404:
 *           description: Car not found.
 *
 *     put:
 *       summary: Update a car
 *       description: Updates the information of an existing car. Admin access required.
 *       tags: [Cars]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - mark
 *                 - model
 *                 - imageUrl
 *                 - pricePerDay
 *                 - maxReservedAtATime
 *                 - description
 *               properties:
 *                  mark:
 *                    type: string
 *                    example: Toyota
 *                  model:
 *                    type: string
 *                    example: Corolla
 *                  imageUrl:
 *                    type: string
 *                    example: "https://example.com/car1.jpg"
 *                  pricePerDay:
 *                    type: number
 *                    example: 50
 *                  maxReservedAtATime:
 *                    type: integer
 *                    example: 3
 *                  description:
 *                    type: string
 *                    example: "Reliable compact car."
 *       responses:
 *         200:
 *           description: Car updated successfully.
 *         400:
 *           description: Invalid input data or ID.
 *         401:
 *           description: Unauthorized. JWT token missing or not admin.
 *         403:
 *           description: Forbidden. Invalid token, JWT error.
 *         404:
 *           description: Car not found.
 *
 *     delete:
 *       summary: Delete a car
 *       description: Deletes a car by its ID. Admin access required.
 *       tags: [Cars]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *       responses:
 *         204:
 *           description: Car deleted successfully.
 *         400:
 *           description: Invalid car ID.
 *         401:
 *           description: Unauthorized. JWT token missing or not admin.
 *         403:
 *           description: Forbidden. Invalid token, JWT error.
 *         404:
 *           description: Car not found.
 *
 *   /cars/{id}/reservations:
 *     get:
 *       summary: Get all reservations for a specific car
 *       description: Retrieve all reservations linked to a specific car. Admin access required. Optional `search` query filters by customer name or email.
 *       tags: [Cars]
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *         - in: query
 *           name: search
 *           required: false
 *           schema:
 *             type: string
 *           description: Optional search term (customer name or email).
 *       responses:
 *         200:
 *           description: Reservations retrieved successfully.
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Reservation'
 *         400:
 *           description: Invalid car ID.
 *         401:
 *           description: Unauthorized. JWT token missing or not admin.
 *         403:
 *           description: Forbidden. Invalid token, JWT error.
 */
router.get("/stream", carController.streamCars);

router.get("/marks", carController.getCarMarks);

router.get("/:id", convertCarFields, carController.getCarById);

router.get("/", convertCarFields, carController.getCars);

router.post("/", verifyAdmin, convertCarFields, carController.postCar);

router.put("/:id", verifyAdmin, convertCarFields, carController.putCar);

router.delete("/:id", verifyAdmin, convertCarFields, carController.deleteCar);

// reservations

router.get("/:id/reservations", verifyAdmin, convertReservationFields, reservationsController.getReservationsOfCar);

export default router;