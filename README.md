# Car Rental Web Application

A full-stack web application that allows users to browse cars, authenticate, and book rental periods using a custom-built calendar.

---

## Overview

This project simulates a car rental platform where users can:

- Create an account and log in
- Browse available cars
- Select rental dates
- Book cars for specific periods

The focus of this project is on **full-stack integration and interactive frontend logic**, rather than payment processing.

---

## Tech Stack

### Frontend

- Svelte
- JavaScript
- Tailwind

### Backend

- Node.js
- Express.js
- REST API

### Testing

- Vitest + Supertest

### Tooling

- Swagger (API documentation)
- ESLint (linting)

---

## Key Features

- Token-based authentication with refresh tokens (HTTP-only cookies)
- Car listing (admin) and selection
- Custom rental booking system with calendar interface
- Frontend ↔ backend integration via REST API
- Modular Svelte components

---

## Booking System (Custom Calendar)

A core part of this project is a **custom-built rental calendar implemented from scratch in Svelte**.

### Functionality

- Date range selection (start → end)
- Restriction of selecting past dates
- Interactive UI feedback during selection
- Integration with backend booking validation

### Technical aspects

- Reactive state management (Svelte)
- Component-based UI logic
- Frontend ↔ backend interaction for booking validation

The calendar is implemented as a **set of reusable Svelte components*- that manage user interaction and state, while **booking constraints such as overlapping reservations are validated on the backend**.

This demonstrates handling complex frontend state and interaction while coordinating with backend validation logic.

---

## Project Structure

```text
client/        → Frontend
server/        → Backend + Tests + Inline Swagger Doc
```

---

## How to run

### 1. Clone the repository

```bash
git clone <your-repo-link>
cd <repo-name>
```

### 2. Install dependencies

Frontend:

```bash
cd client
npm install
```

Backend:

```bash
cd ../server
npm install
```

### 3. Run the application

Rename `.env.example` to `.env.dev`.

Start backend:

```bash
npm run dev
```

Start frontend (in another terminal):

```bash
cd ../client
npm run dev
```

---

## API Documentation

Available at: `http://localhost:3000/api-docs` once the backend has started.

---

## Testing

Run backend tests:

```bash
npm run test
```

---

## What I Learned

- Building a full-stack application with Svelte and Express
- Designing REST APIs
- Implementing authentication
- Managing UI state in a reactive framework
- Implementing booking logic with date selection and constraints

---

## Note

- There is no payment integration as this is a school project
- Commit history was not originally written with presentation in mind, so commit messages are not conventional.
  Therefore, I decided to have clean history in this repo.

---
