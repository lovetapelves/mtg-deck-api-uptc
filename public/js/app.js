const API_BASE_URL = 'http://localhost:3000';
let currentDeckIdForModal = null;
let globalDecks = [];

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const notify = (msg, type = 'success') => { alert(msg); };

const updateUIState = () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    if (token) {
        document.getElementById('authSection').classList.add('hidden');
        document.getElementById('deckViewSection').classList.add('hidden');
        document.getElementById('dashboardSection').classList.remove('hidden');
        document.getElementById('userInfo').classList.remove('hidden');
        document.getElementById('welcomeMessage').innerText = `Viajero: ${username}`;
        loadDecks();
    } else {
        document.getElementById('authSection').classList.remove('hidden');
        document.getElementById('dashboardSection').classList.add('hidden');
        document.getElementById('deckViewSection').classList.add('hidden');
        document.getElementById('userInfo').classList.add('hidden');
    }
};

window.onload = updateUIState;

// --- LOGIN Y REGISTRO ---
const handleRegister = async () => {
    const username = document.getElementById('regUser').value.trim();
    const password = document.getElementById('regPass').value.trim();
    if (!username || !password) return notify("Completa todos los campos", "error");

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (response.ok) {
            notify("¡Registro exitoso! Ya puedes iniciar sesión.");
            document.getElementById('regUser').value = ''; document.getElementById('regPass').value = '';
        } else {
            const data = await response.json();
            notify(`Error: ${data.error}`, 'error');
        }
    } catch (error) { notify("Error conectando con el servidor.", 'error'); }
};

const handleLogin = async () => {
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value.trim();
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token); localStorage.setItem('username', username);
            updateUIState();
        } else notify(`Error: ${data.error}`, 'error');
    } catch (error) { notify("Error en el login.", 'error'); }
};

const logout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('username');
    updateUIState();
};

// --- GESTIÓN DE MAZOS (TABLA) ---
const loadDecks = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/decks`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error();
        globalDecks = await response.json();
        renderDecks(globalDecks);
    } catch (error) { console.error("Error al cargar mazos"); }
};

const toggleCreateDeckForm = () => {
    document.getElementById('createDeckForm').classList.toggle('hidden');
};

const renderDecks = (mazos) => {
    const tbody = document.getElementById('decksTableBody');
    tbody.innerHTML = '';
    if (mazos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500 italic">No hay mazos.</td></tr>`;
        return;
    }
    mazos.forEach(mazo => {
        const date = mazo.createdAt ? new Date(mazo.createdAt).toISOString().split('T')[0] : 'N/A';
        const tr = `
            <tr class="border-b border-gray-800 hover:bg-[#2A2A2A] transition group">
                <td class="p-4 text-blue-400 cursor-pointer hover:underline font-medium" onclick="viewDeck('${mazo._id}', false)">${mazo.name}</td>
                <td class="p-4 text-gray-300">${mazo.format}</td>
                <td class="p-4 text-gray-400">${date}</td>
                <td class="p-4 text-gray-400">public</td>
                <td class="p-4 text-right space-x-4">
                    <button onclick="viewDeck('${mazo._id}', true)" class="text-blue-500 hover:text-blue-300" title="Editar"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                    <button onclick="handleDeleteDeck('${mazo._id}', event)" class="text-red-500 hover:text-red-400" title="Eliminar"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </td>
            </tr>
        `;
        tbody.innerHTML += tr;
    });
};

const handleCreateDeck = async () => {
    const name = document.getElementById('newDeckName').value.trim();
    const format = document.getElementById('newDeckFormat').value.trim();
    const description = document.getElementById('newDeckDesc').value.trim();
    if (!name || !format) return notify("Nombre y Formato requeridos", 'error');

    try {
        const response = await fetch(`${API_BASE_URL}/decks`, {
            method: 'POST', headers: getAuthHeaders(),
            body: JSON.stringify({ name, format, description })
        });
        if (response.ok) {
            toggleCreateDeckForm(); loadDecks();
        } else notify("Error al crear mazo", "error");
    } catch (error) { notify("Error de red", 'error'); }
};

const handleDeleteDeck = async (deckId, event) => {
    event.stopPropagation();
    if (!confirm("¿Eliminar mazo?")) return;
    try {
        const response = await fetch(`${API_BASE_URL}/decks/${deckId}`, {
            method: 'DELETE', headers: getAuthHeaders()
        });
        if (response.ok) loadDecks();
    } catch (error) { notify("Error al eliminar", 'error'); }
};

// --- MÉTODO PUT: ACTUALIZACIÓN DE DETALLES ---
const handleSaveDeckDetails = async () => {
    const newName = document.getElementById('editDeckName').value.trim();
    const newFormat = document.getElementById('editDeckFormat').value.trim();
    const newDesc = document.getElementById('editDeckDesc').value.trim();

    if (!newName || !newFormat) return notify("Datos incompletos", "error");

    try {
        const response = await fetch(`${API_BASE_URL}/decks/${currentDeckIdForModal}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name: newName, format: newFormat, description: newDesc })
        });

        if (response.ok) {
            notify("Mazo actualizado.");
            await loadDecks();
            viewDeck(currentDeckIdForModal, false); // Volver a modo vista
        } else notify("Error al actualizar", "error");
    } catch (error) { notify("Error de red", "error"); }
};

// --- CORRECCIÓN DEFINITIVA DE LAS DOS FUNCIONES ---

const viewDeck = async (deckId, isEditMode = false) => {
    currentDeckIdForModal = deckId;
    const mazo = globalDecks.find(d => d._id === deckId);
    if (!mazo) return;

    document.getElementById('dashboardSection').classList.add('hidden');
    document.getElementById('deckViewSection').classList.remove('hidden');

    const addBtn = document.getElementById('addCardMainBtn');
    const saveBtn = document.getElementById('saveDeckBtn');
    const badge = document.getElementById('editModeBadge');
    const titleContainer = document.getElementById('deckTitleContainer');
    const metaContainer = document.getElementById('deckMetaContainer');

    if (isEditMode) {
        addBtn.classList.remove('hidden');
        saveBtn.classList.remove('hidden');
        badge.classList.remove('hidden');
        titleContainer.innerHTML = `<input type="text" id="editDeckName" value="${mazo.name}" class="w-full bg-mtg-dark border-b-2 border-mtg-gold text-3xl font-bold text-white outline-none p-1">`;

        // EL FIX: Dejamos el id="viewDeckFormat" oculto para que no haya error de NULL, 
        // y creamos un id="editModePrice" para mostrar el dinero mientras editas.
        metaContainer.innerHTML = `
            <div class="flex gap-4 items-center mb-2">
                <span class="text-xs text-mtg-gold font-bold uppercase">Formato:</span>
                <input type="text" id="editDeckFormat" value="${mazo.format}" class="bg-transparent border-b border-gray-700 text-sm text-mtg-gold font-bold outline-none">
                <span id="viewDeckFormat" class="hidden"></span>
            </div>
            <textarea id="editDeckDesc" class="w-full bg-transparent border border-gray-800 rounded p-2 text-sm text-gray-300 outline-none" rows="2" placeholder="Descripción...">${mazo.description || ''}</textarea>
            <div id="editModePrice" class="text-green-400 text-sm font-bold mt-2"></div>
        `;
    } else {
        addBtn.classList.add('hidden');
        saveBtn.classList.add('hidden');
        badge.classList.add('hidden');
        titleContainer.innerHTML = `<h2 id="viewDeckName" class="text-3xl font-bold text-white truncate">${mazo.name}</h2>`;
        metaContainer.innerHTML = `
            <p id="viewDeckFormat" class="text-sm text-mtg-gold uppercase tracking-widest font-bold">Formato: ${mazo.format}</p>
            <p id="viewDeckDesc" class="text-gray-400 text-sm italic">${mazo.description || 'Sin descripción'}</p>
        `;
    }

    renderDeckCards(mazo, isEditMode);
};

const renderDeckCards = async (mazo, isEditMode) => {
    const container = document.getElementById('viewDeckCards');
    const formatInfo = document.getElementById('viewDeckFormat');
    const editPriceInfo = document.getElementById('editModePrice'); // El nuevo espacio para el precio en edición

    if (!mazo.cards || mazo.cards.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-gray-500 italic">Mazo vacío. Dale al botón '+ Agregar Carta' para empezar.</div>`;
        if (formatInfo) formatInfo.innerHTML = `Formato: ${mazo.format} <span class="text-gray-600">|</span> <span class="text-green-400">Total: $0.00 USD</span>`;
        if (editPriceInfo) editPriceInfo.innerHTML = `Valor Total: $0.00 USD`;
        return;
    }

    container.innerHTML = `<div class="p-8 text-center text-mtg-gold animate-pulse text-xs uppercase tracking-widest font-bold">Consultando Scryfall...</div>`;

    try {
        const identifiers = mazo.cards.map(c => ({ id: c.card_id }));
        const res = await fetch('https://api.scryfall.com/cards/collection', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifiers })
        });

        if (!res.ok) throw new Error("Error Scryfall");

        const data = await res.json();
        const scryCards = data.data || [];

        let totalPrice = 0;
        let html = '';

        mazo.cards.sort((a, b) => a.name.localeCompare(b.name)).forEach(c => {
            const live = scryCards.find(sc => sc.id === c.card_id);
            const price = live?.prices?.usd ? parseFloat(live.prices.usd) : 0;
            totalPrice += (price * c.quantity);
            const mana = formatManaCost(live?.mana_cost);

            // CAMBIA ESTA LÍNEA DENTRO DE renderDeckCards:
            const delBtn = isEditMode ? `<button onclick="handleRemoveCard('${c.card_id}', ${c.quantity})" class="text-red-500 hover:text-red-400 w-8 text-right font-bold 
            text-lg" title="Quitar copias">&times;</button>` : `<span class="w-8 hidden"></span>`;

            html += `
                <div class="flex items-center justify-between p-2 hover:bg-[#2A2A2A] rounded transition cursor-crosshair group border-b border-gray-800 last:border-0"
                     onmouseenter="showCardPreview('${c.card_id}', event)" onmousemove="moveCardPreview(event)" onmouseleave="hideCardPreview()">
                    <div class="flex items-center gap-4">
                        <span class="w-8 text-center text-gray-400 font-mono bg-black rounded px-1">${c.quantity}</span>
                        <span class="text-blue-400 group-hover:underline">${c.name}</span>
                    </div>
                    <div class="flex items-center gap-8 pr-2">
                        <span class="flex gap-[2px] w-20 justify-center">${mana}</span>
                        <span class="w-16 text-right text-gray-300 font-mono tracking-tighter">$${price.toFixed(2)}</span>
                        ${delBtn}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // EL FIX: JS pregunta primero "si el elemento existe", le inyecta el HTML. Así evitamos crasheos.
        if (formatInfo) {
            formatInfo.innerHTML = `Formato: ${mazo.format} <span class="text-gray-600">|</span> <span class="text-green-400">Total: $${totalPrice.toFixed(2)} USD</span>`;
        }
        if (editPriceInfo) {
            editPriceInfo.innerHTML = `Valor Total: $${totalPrice.toFixed(2)} USD`;
        }

    } catch (e) {
        console.error(e); // Para ver el error real en la consola F12 si vuelve a pasar
        container.innerHTML = `<div class="p-4 text-center text-red-500 font-bold border border-red-900 bg-red-900/10 rounded">Error en Scryfall.</div>`;
    }
};

const formatManaCost = (str) => {
    if (!str) return '';
    return str.match(/\{[^}]+\}/g)?.map(m => {
        let sym = m.replace(/[{}/]/g, '').toUpperCase();
        return `<img src="https://svgs.scryfall.io/card-symbols/${sym}.svg" class="w-[15px] h-[15px] rounded-full shadow" alt="mana">`;
    }).join('') || '';
};

// --- NUEVO MANEJO DE ELIMINAR/RESTAR CARTAS ---
const handleRemoveCard = async (cardId, currentQty) => {
    hideCardPreview();

    let cantidadABorrar = currentQty;

    // Si hay más de una copia, le damos el poder de decidir al usuario
    if (currentQty > 1) {
        const input = prompt(`Tienes ${currentQty} copias de esta carta.\n¿Cuántas deseas quitar del mazo?`, "1");

        if (input === null) return; // Si le da a cancelar, no hacemos nada

        cantidadABorrar = parseInt(input);
        if (isNaN(cantidadABorrar) || cantidadABorrar <= 0) {
            return notify("Por favor, ingresa una cantidad válida.", "error");
        }
    } else {
        // Si solo hay 1 copia, confirmación rápida para no borrar por error
        if (!confirm("¿Eliminar la única copia de esta carta?")) return;
    }

    try {
        // Enviamos la cantidad a borrar como un parámetro en la URL (?cantidad=...)
        const res = await fetch(`${API_BASE_URL}/decks/${currentDeckIdForModal}/cards/${cardId}?cantidad=${cantidadABorrar}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (res.ok) {
            await loadDecks();
            viewDeck(currentDeckIdForModal, true);
        } else {
            notify("Error al quitar la carta", 'error');
        }
    } catch (e) { notify("Error de red", 'error'); }
};

// --- AUTOCOMPLETADO (NIVEL DIOS) ---
const searchInput = document.getElementById('searchCardInput');
const resultsContainer = document.getElementById('autocompleteResults');
let typingTimer;
const cache = {};

if (searchInput) {
    searchInput.addEventListener('input', () => {
        clearTimeout(typingTimer);
        const q = searchInput.value.trim().toLowerCase();
        if (q.length < 3) { resultsContainer.classList.add('hidden'); return; }
        if (cache[q]) { renderAutocomplete(cache[q]); return; }
        typingTimer = setTimeout(async () => {
            resultsContainer.innerHTML = `<div class="p-3 text-xs text-mtg-gold italic">Buscando...</div>`;
            resultsContainer.classList.remove('hidden');
            const res = await fetch(`https://api.scryfall.com/cards/autocomplete?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            cache[q] = data.data;
            renderAutocomplete(data.data);
        }, 300);
    });
}

const renderAutocomplete = (list) => {
    resultsContainer.innerHTML = '';
    if (list.length === 0) { resultsContainer.innerHTML = `<div class="p-3 text-xs text-gray-500">Sin resultados.</div>`; return; }
    list.forEach(name => {
        const btn = document.createElement('button');
        btn.className = "w-full text-left p-3 text-sm text-gray-300 hover:bg-[#333333] hover:text-white transition border-b border-gray-800 last:border-0";
        btn.innerText = name;
        btn.onclick = () => { searchInput.value = name; resultsContainer.classList.add('hidden'); document.getElementById('addCardSubmitBtn').focus(); };
        resultsContainer.appendChild(btn);
    });
    resultsContainer.classList.remove('hidden');
};

// --- UTILIDADES ---
const downloadDeckTxt = () => {
    const m = globalDecks.find(d => d._id === currentDeckIdForModal);
    let txt = `// ${m.name}\n\n` + m.cards.map(c => `${c.quantity} ${c.name}`).join('\n');
    const blob = new Blob([txt], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${m.name}.txt`; a.click();
};

const backToDashboard = () => {
    document.getElementById('deckViewSection').classList.add('hidden');
    document.getElementById('dashboardSection').classList.remove('hidden');
    hideCardPreview();
};

const showCardPreview = (id, e) => {
    const p = document.getElementById('cardHoverPreview');
    p.src = `https://api.scryfall.com/cards/${id}?format=image&version=normal`;
    p.classList.remove('hidden');
    moveCardPreview(e);
};

const moveCardPreview = (e) => {
    const p = document.getElementById('cardHoverPreview');
    p.style.left = (e.clientX + 20) + 'px';
    p.style.top = Math.max(10, Math.min(e.clientY - 150, window.innerHeight - 360)) + 'px';
};

const hideCardPreview = () => document.getElementById('cardHoverPreview').classList.add('hidden');

// --- MODAL AGREGAR CARTAS (CORREGIDO) ---
const openAddCardModal = () => {
    // Buscamos el mazo en nuestra memoria global usando el ID actual
    const mazo = globalDecks.find(d => d._id === currentDeckIdForModal);
    if (!mazo) return;

    // Ponemos el nombre correcto en el modal
    document.getElementById('modalDeckName').innerText = mazo.name;

    const modal = document.getElementById('addCardModal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (searchInput) searchInput.focus();
    }, 10);

    document.getElementById('addCardSubmitBtn').onclick = handleAddCard;
};

const closeModal = () => {
    const m = document.getElementById('addCardModal');
    m.classList.add('opacity-0');
    setTimeout(() => { m.classList.add('hidden'); searchInput.value = ''; }, 300);
};

const handleAddCard = async () => {
    const name = searchInput.value.trim();
    const qty = document.getElementById('addCardQty').value;
    const btn = document.getElementById('addCardSubmitBtn');
    btn.disabled = true;
    try {
        const res = await fetch(`${API_BASE_URL}/decks/${currentDeckIdForModal}/cards`, {
            method: 'POST', headers: getAuthHeaders(),
            body: JSON.stringify({ nombreCarta: name, cantidad: qty })
        });
        if (res.ok) { closeModal(); await loadDecks(); viewDeck(currentDeckIdForModal, true); }
        else notify("Error al agregar", "error");
    } catch (e) { notify("Error", "error"); } finally { btn.disabled = false; }
};