import express from "express"; //utilizzo framework express 
import cors from "cors"; //utilizzo middleware cors

let server = null;
let app = null;

export function connect() {
    //se il server è già attivo, ritorna l'app esistente
    if (server) {
        console.log("⚠️ Server già attivo.");
        return app;
    }

    app = express(); //Crea una nuova istanza di Express e la assegna alla variabile

    // Middleware che consente richieste cross-origin (CORS). permette di fare richieste da domini diversi
    app.use(cors({
        origin: "*", //Permette a chiunque (qualsiasi sito web o frontend) di fare richieste al tuo server.
        methods: ["GET", "POST", "OPTIONS"], // Specifica quali azioni sono permesse (leggere dati, inviare dati, e OPTIONS serve al browser per i controlli preliminari)
        allowedHeaders: ["Content-Type"]
    }));

    app.use(express.json()); //Middleware per il parsing del JSON nel corpo delle richieste che vanno al server

    // IMPOSTAZIONI SERVER

    const PORT = 8080; // Porta su cui il server ascolta
    // MODIFICA CRITICA QUI SOTTO:
    const HOST = "127.0.0.1"; // Ascolta sull'indirizzo localhost 127.0.0.1

    // Binda l'app alla porta/host e memorizza l'istanza del server. gestisce il protocollo TCP/HTTP
    server = app.listen(PORT, HOST, () => {
        console.log(`🚀 SERVER AVVIATO: http://${HOST}:${PORT}`);
        console.log(`   (Ora accetta connessioni su 127.0.0.1)`);
    });

    return app; //restituisce l'istanza dell'app Express, pronta ad accogliere le richieste
}