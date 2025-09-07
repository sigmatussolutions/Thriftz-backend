const swaggerJSDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0", // or "2.0"
    info: {
      title: "Fanclip Backend API",
      version: "1.0.0",
      description: "API documentation for the Fanclip backend",
    },
    servers: [
      {
        url: "http://localhost:3001", // Replace with your server URL
      },
    ],
  },
  apis: ["./routes/*.js"], // Path to your route files with Swagger comments
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
