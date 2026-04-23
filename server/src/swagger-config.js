import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My Web Advanced API",
      version: "1.0.0",
      description: "API documentation generated with JSDoc + swagger-jsdoc",
    },
  },
  // Point to folder where Swagger should look for the routes
  apis: ["./src/routes/*.js"], 
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);