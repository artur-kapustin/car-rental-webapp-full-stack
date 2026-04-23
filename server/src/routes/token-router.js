import express from "express";
import * as tokensController from "../controllers/token-controller.js"
import {authenticateToken} from "../middleware/authenticate-token.js";

const router = express.Router();

/**
 * @openapi
 * tags:
 *   name: Authentication
 *   description: User login, logout, and token management endpoints
 *
 * /tokens:
 *   post:
 *     summary: User login
 *     description: |
 *       Authenticates a user using email and password.
 *       Returns an access token in the JSON body and sets a refresh token as an HTTP-only cookie.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Login successful. Access token returned, refresh token stored in cookie.
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=abc123; HttpOnly; Path=/; Max-Age=600
 *             description: The refresh token cookie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid email or password not string or is empty.
 *       401:
 *         description: Invalid credentials.
 *       404:
 *         description: Email not found.
 *
 * /tokens/logout:
 *   delete:
 *     summary: Logout user
 *     description: |
 *       Logs out the current authenticated user by invalidating their refresh token and clearing the cookie.
 *       Requires a valid **access token** in the `Authorization` header.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Logout successful. Refresh token deleted and cookie cleared.
 *       401:
 *         description: Unauthorized or missing token.
 *       403:
 *         description: Forbidden. Token invalid, JWT error.
 *
 * /tokens/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: |
 *       Generates a new access token using a valid refresh token from cookies.
 *       The refresh token is validated against the database and JWT signature.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: New access token issued successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: Invalid or missing refresh token.
 *       403:
 *         description: Refresh token expired or forbidden.
 */
router.post("/", tokensController.login);

router.delete("/logout", authenticateToken, tokensController.logout);

router.post("/refresh", tokensController.refreshAccessToken);

export default router;