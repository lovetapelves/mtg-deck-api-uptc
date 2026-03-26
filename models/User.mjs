import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true // Evita que dos personas se registren con el mismo usuario
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Crea automáticamente los campos 'createdAt' y 'updatedAt'
});

export const User = mongoose.model('User', userSchema);