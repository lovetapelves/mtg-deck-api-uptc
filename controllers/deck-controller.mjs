import { Deck } from '../models/Deck.mjs';
import { buscarCartaScryfall } from './scryfall-controller.mjs';

// 1. CREAR UN MAZO NUEVO (Vacío)
export const crearMazo = async (req, res) => {
    try {
        const { name, format, description } = req.body;

        if (!name || !format) {
            return res.status(400).json({ error: "El nombre y el formato son obligatorios." });
        }

        const nuevoMazo = new Deck({
            name,
            format,
            description,
            user_id: req.user.id // El ID viene del JWT
        });

        await nuevoMazo.save();
        res.status(201).json({ mensaje: "Mazo creado exitosamente", mazo: nuevoMazo });
    } catch (error) {
        res.status(500).json({ error: "Error al crear el mazo" });
    }
};

// 2. OBTENER MIS MAZOS 
export const obtenerMisMazos = async (req, res) => {
    try {
        const mazos = await Deck.find({ user_id: req.user.id })
            .populate('user_id', 'username -_id')
            .lean();

        res.json(mazos);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener los mazos" });
    }
};

// 3. AGREGAR CARTA AL MAZO (La versión inteligente)
export const agregarCartaAlMazo = async (req, res) => {
    try {
        const { idMazo } = req.params;
        const { nombreCarta, cantidad } = req.body;

        const qty = cantidad ? parseInt(cantidad) : 1;

        // Vamos a Scryfall
        const infoCarta = await buscarCartaScryfall(nombreCarta);
        if (!infoCarta) return res.status(404).json({ error: "Carta no encontrada en Scryfall" });

        // Buscamos tu mazo
        const mazo = await Deck.findOne({ _id: idMazo, user_id: req.user.id });
        if (!mazo) return res.status(403).json({ error: "No tienes permiso sobre este mazo" });

        // ¿La carta ya está en el mazo?
        const indiceCarta = mazo.cards.findIndex(c => c.card_id === infoCarta.card_id);

        if (indiceCarta > -1) {
            // Ya existe: sumamos la cantidad
            mazo.cards[indiceCarta].quantity += qty;
        } else {
            // No existe: la agregamos
            mazo.cards.push({
                card_id: infoCarta.card_id,
                name: infoCarta.name,
                quantity: qty
            });
        }

        await mazo.save();
        res.json({ mensaje: "Mazo actualizado correctamente", mazo });
    } catch (error) {
        res.status(500).json({ error: "Error al procesar la carta" });
    }

};
// 4. ELIMINAR UN MAZO
export const eliminarMazo = async (req, res) => {
    try {
        const { idMazo } = req.params;

        // Buscamos y eliminamos el mazo en un solo paso. 
        // Validamos el user_id para que un hacker no borre mazos de otros.
        const mazoEliminado = await Deck.findOneAndDelete({ _id: idMazo, user_id: req.user.id });

        if (!mazoEliminado) {
            return res.status(404).json({ error: "Mazo no encontrado o no tienes permisos para eliminarlo" });
        }

        res.json({ mensaje: "Mazo eliminado y devuelto al vacío" });
    } catch (error) {
        res.status(500).json({ error: "Error al intentar eliminar el mazo" });
    }
};
// 5. REDUCIR CANTIDAD O ELIMINAR CARTA DEL MAZO
export const eliminarCartaDeMazo = async (req, res) => {
    try {
        const { idMazo, idCarta } = req.params;
        const cantidadRestar = parseInt(req.query.cantidad);

        const mazo = await Deck.findOne({ _id: idMazo, user_id: req.user.id });
        if (!mazo) return res.status(403).json({ error: "No tienes permiso" });

        const cartaIndex = mazo.cards.findIndex(c => c.card_id === idCarta);
        if (cartaIndex === -1) return res.status(404).json({ error: "Carta no encontrada en el mazo" });

        if (!isNaN(cantidadRestar) && cantidadRestar < mazo.cards[cartaIndex].quantity) {
            // Si mandan cantidad válida y es menor a lo que hay, solo restamos
            mazo.cards[cartaIndex].quantity -= cantidadRestar;
        } else {
            // Si no mandaron cantidad, es inválida o supera el stock, eliminamos la carta completa
            mazo.cards.splice(cartaIndex, 1);
        }

        await mazo.save();
        res.json({ mensaje: "Inventario de carta actualizado", mazo });

    } catch (error) {
        console.error("Error en eliminarCartaDeMazo:", error);
        res.status(500).json({ error: "Error al modificar la carta" });
    }
};
// 6. ACTUALIZAR DETALLES DEL MAZO (Nombre, Formato, Descripción)
export const actualizarMazo = async (req, res) => {
    try {
        const { idMazo } = req.params;
        const { name, format, description } = req.body;

        // Buscamos por ID y que pertenezca al usuario
        const mazo = await Deck.findOneAndUpdate(
            { _id: idMazo, user_id: req.user.id },
            { name, format, description },
            { new: true, runValidators: true } // 'new' devuelve el mazo ya editado
        );

        if (!mazo) return res.status(404).json({ error: "Mazo no encontrado" });

        res.json({ mensaje: "Mazo actualizado con éxito", mazo });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el mazo" });
    }
};