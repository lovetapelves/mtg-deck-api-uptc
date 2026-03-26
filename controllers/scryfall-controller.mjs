// Función para buscar una carta en Scryfall
export const buscarCartaScryfall = async (nombreCarta) => {
    try {
        // 1. Codificamos el nombre para que sea seguro en una URL (ej: espacios -> %20)
        const url = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(nombreCarta)}`;

        // 2. Hacemos la petición a Scryfall
        const respuesta = await fetch(url);

        // 3. Si Scryfall dice que no la encontró (404)
        if (respuesta.status === 404) {
            return null;
        }

        const datos = await respuesta.json();

        // 4. Retornamos solo lo que nos interesa para nuestro modelo Deck.mjs
        return {
            card_id: datos.id,
            name: datos.name,
            image: datos.image_uris?.normal, // Opcional: por si quieres mostrar la foto
            type: datos.type_line
        };
    } catch (error) {
        console.error("Error consultando Scryfall:", error);
        throw new Error("No se pudo conectar con el servicio de cartas");
    }
};