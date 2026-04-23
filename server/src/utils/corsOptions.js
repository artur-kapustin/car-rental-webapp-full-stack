const allowedOrigins = [
    "http://localhost:4173",
    "http://localhost:5173",
    "http://localhost:3000"
]

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true)
        } else {
            callback(new Error("Origin not allowed by CORS"));
        }
    },
    credentials: true
}

export default corsOptions;