import mongoose from 'mongoose';

// Sub-esquema: La estructura de cada carta individual
const cardSchema = new mongoose.Schema({
    card_id: { type: String, required: true }, // Aquí guardaremos el ID que viene de la API de Scryfall
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    section: { type: String, enum: ['mainboard', 'sideboard'], default: 'mainboard' }
});

// Esquema principal: El Mazo
const deckSchema = new mongoose.Schema({
    name: { type: String, required: true },
    format: { type: String, required: true }, // Ej: 'Pauper', 'Commander'
    description: { type: String },

    // Relación Referenciada (1 a muchos con User)
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Relación Embebida (1 a muchos con Cards)
    cards: [cardSchema],

    is_public: { type: Boolean, default: false },
    is_legal: { type: Boolean, default: true }
}, {
    timestamps: true
});

export const Deck = mongoose.model('Deck', deckSchema);