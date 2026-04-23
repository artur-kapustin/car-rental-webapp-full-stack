import express from "express";
import * as userController from "../controllers/user-controller.js";
import * as reservationsController from "../controllers/reservation-controller.js";
import {authenticateToken} from "../middleware/authenticate-token.js";
import {verifyAdmin} from "../middleware/verify-admin.js";
import {convertUserFields} from "../middleware/convert-user-fields.js";
import {convertReservationFields} from "../middleware/convert-reservation-fields.js";

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Users
 *   description: User management and reservation operations
 *
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve all registered users. Admin access required.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includes
 *         schema:
 *           type: string
 *           example: "john"
 *         description: Optional filter to search users by partial name or email.
 *     responses:
 *       200:
 *         description: Users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     example: "john@example.com"
 *                   role:
 *                     type: string
 *                     example: "user"
 *                   isAccountDisabled:
 *                     type: boolean
 *                     example: false
 *       401:
 *         description: Unauthorized. JWT missing or user is not admin.
 *       403:
 *         description: Forbidden. Invalid token, JWT error.
 *
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account. No authentication required.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jane@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "StrongPassword123"
 *     responses:
 *       201:
 *         description: User registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 5
 *                 message:
 *                   type: string
 *                   example: "User added successfully."
 *       400:
 *         description: Missing or invalid input fields.
 *       409:
 *         description: Email already registered.
 *       500:
 *         description: Server error while creating user.
 *
 * /users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a specific user's details. Admin access required.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *       400:
 *         description: Invalid user ID.
 *       401:
 *         description: Unauthorized. JWT token missing or not admin.
 *       403:
 *         description: Forbidden. Invalid token, JWT error.
 *       404:
 *         description: User not found.
 *
 *   put:
 *     summary: Update user details
 *     description: Updates a user's name and/or email. Requires authentication.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Name"
 *               email:
 *                 type: string
 *                 example: "updated@example.com"
 *     responses:
 *       200:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized. JWT token missing.
 *       403:
 *         description: Forbidden. Token invalid. User cannot update another user's data.
 *       409:
 *         description: Email already registered.
 *       500:
 *         description: Server error while updating user.
 *
 *   delete:
 *     summary: Delete a user
 *     description: Deletes a user account. Requires authentication.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: User deleted successfully.
 *       400:
 *         description: Invalid user ID.
 *       401:
 *         description: Unauthorized. JWT token missing.
 *       403:
 *         description: Forbidden. Token invalid. User cannot delete another user's account.
 *       404:
 *         description: User not found.
 *
 * /users/{userId}/password:
 *   put:
 *     summary: Update user password
 *     description: Change password of the authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "oldPassword123"
 *               newPassword:
 *                 type: string
 *                 example: "newPassword456"
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *       400:
 *         description: Missing passwords or current and new passwords are the same.
 *       401:
 *         description: Unauthorized. Invalid current password. JWT token missing.
 *       403:
 *         description: Forbidden. Token invalid. Cannot change another user's password.
 *       404:
 *         description: User not found.
 *
 * /users/{userId}/status:
 *   put:
 *     summary: Update user account status
 *     description: Enables or disables a user account. Admin access required.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isAccountDisabled
 *             properties:
 *               isAccountDisabled:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: User account status updated successfully.
 *       400:
 *         description: Missing or invalid status field.
 *       401:
 *         description: Unauthorized. JWT token missing or not admin.
 *       403:
 *         description: Forbidden. Invalid token, JWT error.
 *       404:
 *         description: User not found.
 *
 * /users/{userId}/reservations:
 *   get:
 *     summary: Get user reservations
 *     description: Retrieve all reservations of the authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reservations retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 12
 *                   carId:
 *                     type: integer
 *                     example: 12
 *                   userId:
 *                     type: integer
 *                     example: 12
 *                   startDate:
 *                     type: string
 *                     format: date
 *                     example: "2028-03-15T22:00:00.000Z"
 *                   endDate:
 *                     type: string
 *                     format: date
 *                     example: "2028-03-24T22:00:00.000Z"
 *                   total:
 *                     type: number
 *                     example: 400
 *       400:
 *         description: Invalid user ID.
 *       401:
 *         description: Unauthorized. Invalid current password. JWT token missing.
 *       403:
 *         description: Forbidden. Token invalid. User cannot view another user's reservations.
 *
 *   post:
 *     summary: Create a reservation
 *     description: Create a new reservation for the authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - carId
 *               - startDate
 *               - endDate
 *               - total
 *             properties:
 *               userId:
 *                 type: integer
 *                 example: 1
 *               carId:
 *                 type: integer
 *                 example: 4
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2028-03-15T22:00:00.000Z"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2028-03-24T22:00:00.000Z"
 *               total:
 *                 type: number
 *                 example: 400
 *     responses:
 *       201:
 *         description: Reservation created successfully.
 *       400:
 *         description: Invalid reservation data (dates, total, IDs).
 *       403:
 *         description: Forbidden. Token invalid. Cannot create reservation for another user.
 *       404:
 *         description: User or car not found.
 *       409:
 *         description: Car is already reserved or max reservations reached.
 *
 * /users/{userId}/reservations/{reservationId}:
 *   delete:
 *     summary: Delete a reservation
 *     description: Deletes a specific reservation made by the authenticated user.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Reservation deleted successfully.
 *       400:
 *         description: Invalid reservation ID.
 *       403:
 *         description: Forbidden. Token invalid. Cannot delete another user's reservation.
 *       404:
 *         description: Reservation not found.
 */
router.get("/:userId", verifyAdmin, convertUserFields, userController.getUserById);

router.get("/", verifyAdmin, convertUserFields, userController.getUsers);

router.post("/", convertUserFields, userController.postUser);

router.put("/:userId", authenticateToken, convertUserFields, userController.putUser);

router.put("/:userId/password", authenticateToken, convertUserFields, userController.putUserPassword)

router.put("/:userId/status", verifyAdmin, convertUserFields, userController.putUserStatus)

router.delete("/:userId", authenticateToken, convertUserFields, userController.deleteUser);

// reservations

router.get("/:userId/reservations", authenticateToken, convertReservationFields, reservationsController.getReservationsOfUser);

router.post("/:userId/reservations", authenticateToken, convertReservationFields, reservationsController.postReservation);

router.delete("/:userId/reservations/:reservationId", authenticateToken, convertReservationFields, reservationsController.deleteReservation);

export default router;