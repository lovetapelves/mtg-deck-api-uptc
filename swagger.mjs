import swaggerJSDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Magic Deck Builder API - UPTC',
            version: '1.0.0',
            description: 'API RESTful para gestionar mazos de cartas usando Scryfall y seguridad JWT. Proyecto de Electiva 2.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor Local',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    // Le decimos a Swagger que busque la documentación en los archivos de la carpeta routes
    apis: ['./routes/*.mjs'],
};

export const specs = swaggerJSDoc(options);