const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Alaswaf API Documentation",
            version: "1.0.0",
            description: "API for Alaswaf Travel & Umrah platform",
            contact: {
                name: "Developer",
            },
        },
        servers: [
            {
                url: "http://localhost:9000/api/v1",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.js", "./src/controllers/admin/*.js", "./src/server.js"], // files containing annotations
};

const specs = swaggerJsdoc(options);

module.exports = specs;
