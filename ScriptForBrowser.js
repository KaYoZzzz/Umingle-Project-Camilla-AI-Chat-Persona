// ==========================================
// 🤖 CAMILLA BOT
// ==========================================

// variabili di configurazione
const CONFIG = {
    chatContainerId: 'mainMessages', // ID del box dove appaiono i messaggi
    inputSelector: 'textarea.messageInput', // area di testo su cui scrivere
    apiEndpoint: 'http://127.0.0.1:8080/chat', // endpoint API del bot
    resetEndpoint: 'http://127.0.0.1:8080/reset', // endpoint per resettare la memoria del bot
    typingSpeed: { min: 30, max: 70 } // velocità di scrittura (ms per carattere)
};

let isTyping = false;
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms)); // funzione di attesa

// --- 1. FUNZIONE SCRITTURA ---
async function typeWriterResponse(text) {
    const inputField = document.querySelector(CONFIG.inputSelector); // seleziona l'area di testo
    if (!inputField || isTyping) return; // controlla se il bot sta già scrivendo (eviti sovrapposizioni)

    // Filtro anti-loop: se il bot risponde "...", ignoralo
    if (text === "..." || text.length < 1) return;

    // imposta che "sto scrivendo"
    isTyping = true;
    // Pausa realistica iniziale, aspetta dai 2 ai 4 secondi
    await wait(Math.random() * 2000 + 2000);

    // Simula la digitazione carattere per carattere
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
    let currentText = "";

    // Ciclo su ogni carattere del testo da scrivere
    for (let i = 0; i < text.length; i++) {
        currentText += text[i];
        nativeInputValueSetter.call(inputField, currentText); // Imposta il valore dell'input
        inputField.dispatchEvent(new Event('input', { bubbles: true })); // Trigger evento input per aggiornare eventuali listener

        // Ritardo casuale tra i caratteri per simulare la digitazione umana
        const delay = Math.random() * (CONFIG.typingSpeed.max - CONFIG.typingSpeed.min) + CONFIG.typingSpeed.min;
        await wait(delay);
    }

    await wait(200);
    // Simula la pressione del tasto Invio per inviare il messaggio
    const enterEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13 });
    inputField.dispatchEvent(enterEvent);

    isTyping = false; // ha finito di scrivere
    console.log(`✅ Risposto: "${text}"`);
}

// --- 2. COMUNICAZIONE ---
function sendToBot(userMessage) {
    if (isTyping) return; // evita di inviare se il bot sta ancora scrivendo
    // Invia il messaggio dell'utente al server del bot quando non sta scrivendo
    fetch(CONFIG.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: userMessage })
    })
        .then(res => res.json()) // parse della risposta JSON
        .then(data => typeWriterResponse(data.response)) // fa scrivere la risposta del bot
        .catch(err => { console.error("❌ Errore Server:", err); isTyping = false; }); // gestione errori
}

// --- 3. RESET ---
function resetBotMemory() {
    console.log("🚫 Resetting memory...");
    fetch(CONFIG.resetEndpoint).catch(() => { });
    isTyping = false;
}

// --- 4. OCCHI (OBSERVER CON "TIMBRO") ---
const chatContainer = document.getElementById(CONFIG.chatContainerId);

if (chatContainer) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {

                        // A. GESTIONE MESSAGGI STRANGER
                        const strangerSpan = node.querySelector('.Stranger');

                        // CONTROLLO FONDAMENTALE: 
                        // Se il nodo ha già "data-processed", lo ignoriamo.
                        if (strangerSpan && !node.classList.contains('information')) {

                            if (node.dataset.processed) return; // <--- STOP LOOP

                            // Mettiamo il timbro SUBITO
                            node.dataset.processed = "true";

                            // Estrai il testo del messaggio (rimuovi "Stranger" e spazi vuoti)
                            let text = node.innerText.replace('Stranger', '').trim();
                            // Invia il messaggio al bot solo se non sta scrivendo
                            if (text && !isTyping) {
                                console.log(`📩 NUOVO MESSAGGIO: "${text}"`);
                                sendToBot(text);
                            }
                        }

                        // B. GESTIONE DISCONNESSIONE
                        // Controlla se il messaggio è di tipo "information" o "disconnectMessage"
                        if (node.classList.contains('information') || node.classList.contains('disconnectMessage')) {
                            // Se il testo contiene "disconnect", resetta la memoria del bot
                            if (node.innerText.toLowerCase().includes('disconnect')) {
                                console.log("🔌 Stranger left.");
                                resetBotMemory();
                            }
                        }
                    }
                });
            }
        });
    });

    observer.observe(chatContainer, { childList: true });
    console.log("🛡️ BOT ATTIVO (Anti-Loop Attivato).");
} else {
    console.error("❌ ERRORE: Chat non trovata.");
}