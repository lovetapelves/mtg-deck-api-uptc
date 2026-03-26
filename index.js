import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swagger.mjs';
import path from 'path';

// 1. Inicializamos la aplicación
const app = express();
const PORT = process.env.PORT || 3000;

// 2. Middlewares globales (Configuraciones base)
app.use(cors()); // Permite que otros dominios (como un frontend) se conecten a tu API
app.use(express.json()); // Permite que Express entienda los JSON que enviamos en el body

// 3. Conexión a la base de datos (Persistencia en la nube)
// Usamos una promesa (.then / .catch) porque conectarse a internet toma tiempo
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado exitosamente a MongoDB Atlas'))
    .catch((error) => console.error('Error conectando a MongoDB:', error));

/*
// 4. Ruta base de prueba
app.get('/', (req, res) => {
    res.json({ mensaje: 'API de Deck Builder funcionando correctamente' });
});*/

import authRoutes from './routes/auth-routes.mjs';
// Le decimos a Express dónde buscar los archivos de la página web
app.use(express.static('public'));
app.use('/auth', authRoutes);
import deckRoutes from './routes/deck-routes.mjs';
app.use('/decks', deckRoutes);
// Ruta para ver la documentación visual
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
// 5. Levantar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${PORT}`);
});