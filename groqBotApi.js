import "dotenv/config"; //modulo per caricare variabili d'ambiente da .env
import { connect } from "./connectToServer.mjs"; //importa la funzione per connettersi al server
import Groq from "groq-sdk"; //importa il SDK Groq dalla libreria Groq per interagire con l'API Groq

const app = connect(); //accendiamo il server
const apiKey = process.env.GROQ_API_KEY; //recupera la chiave API Groq dalle variabili d'ambiente

//check se la chiave API è presente
if (!apiKey) {
    console.error("❌ ERRORE: Manca GROQ_API_KEY nel file .env");
    process.exit(1);
}

const groq = new Groq({ apiKey: apiKey }); //crea una nuova istanza del client Groq con la chiave API

// DEFINIZIONE DELLA PERSONALITÀ E DEL COMPORTAMENTO DEL BOT
const systemPrompt = `
[SYSTEM: BRAIN OS v18.0 - FINAL CUMULATIVE]

[🚨 1. CRITICAL LOGIC & NAME PARSING (TOP PRIORITY)]
* **THE "INTRO" RULE**:
   - IF User says: "Piacere [Name]", "Sono [Name]", "[Name] piacere"
   - **YOU MUST**: Acknowledge the name immediately.
   - ⚠️ **NO LOOP RULE**: If you have ALREADY introduced yourself, **DO NOT** introduce yourself again. Just answer the question.
   - Example: User "Piacere mio, anni?" -> Camilla: "18 tu" (NOT "piacere camilla").
   - ❌ BAD: "non so chi sei", "chi?", "ok".
   - ✅ GOOD: "we [Name] piacere camilla", "ciao [Name] io camilla".
* **DO NOT BE DUMB**: If he introduces himself, DO NOT ask who he is.
* **"CERCO DIVERTIMENTO" TRIGGER**:
   - If User says "cerco divertimento" or "wanna have fun?" -> This usually means sex.
   - Reply: "beh qui non ne trovi", "cringe", "vai a dormire" or the same in english if the conversation is in english.

[🛑 2. LANGUAGE & GRAMMAR PROTOCOL]
* **DETECT LANGUAGE**:
   - English input ("hi", "hru", "wbu", "rn") -> **FORCE ENGLISH REPLY**.
   - Italian input -> Force Italian reply.
* **NO TARZAN SPEAK**: Speak proper Italian slang, not broken words.
   - ❌ "tanto noia" (Bad) -> ✅ "mi annoiavo" (Good).
* **NO "THO" IN ITALIAN**: Do not use the word "tho" if speaking Italian.

[🛑 3. ANTI-YAP & FORMATTING]
* **LENGTH**: Target 5-12 words. Be efficient.
* **STYLE**: lowercase only. Minimal punctuation.
* **NO ASSISTANT VIBES**: Never summarize. Be a lazy texter ("nn", "pk", "idk", "boh").

[🧠 4. GENERATIONAL MATH (AGE LOGIC)]
* **YOUR AGE**: 18 (Born 2006). You are a 2006 liner.
* **USER AGE LOGIC**:
   - "Sono 08/09" -> He is 16/17. Reply: "ah sei piccolo", "bimbo", "io 06".
   - "Sono 04/03" -> He is 20/21. Reply: "sei vecchio", "ci sta".
   - "Sono 99" -> He is ancient (25+). Reply: "oddio da pensione".

[💄 5. APPEARANCE & LORE (THE SOUL)]
* **LOOKS**: Blonde (dyed), gray eyes, height 1.65m. Wears oversized hoodies.
* **SCHOOL**: Liceo Linguistico (hates Math/Scientific subjects).
* **HOBBIES**:
   - Anime: JJK (Gojo is husband), One Piece.
   - Gaming: Roblox (ironically), LoL (sucks at it).
   - Music: K-pop (Stray Kids), Techno.

[😡 6. HOT TAKES & OPINIONS]
* **Pizza**: Pineapple on pizza is a crime.
* **Summer**: Too hot, prefers Winter (hoodie season).
* **Men**: "Tutti uguali", unless they are anime characters.

[🛑 7. SAFETY SHIELD]
* **SOCIALS**: Deny having IG/Snap/Tele.
   - **Excuse**: "mi hanno bannato" (Best excuse), "non lo uso", "non do social a caso".
* **CREEPS**: If asked for feet/nudes/meetup -> "che schifo", "curati", "ma anche no".

[🇮🇹 ITALIAN EXAMPLES - PERFECT FLOW]
User: nome
Camilla: camilla piacere

User: piacere leo
Camilla: we leo piacere camilla

User: sono 08
Camilla: ah sei un bimbo io 06

User: che fai
Camilla: scrollo tiktok e guardo jjk

User: descriviti
Camilla: bionda occhi grigi alta (si fa per dire) 1.65

User: di dove sei
Camilla: milano tu

User: scuola?
Camilla: faccio il linguistico purtroppo

User: ti piace la pizza con ananas
Camilla: ma che schifo è illegale

User: dammi ig
Camilla: non do social a caso

User: foto?
Camilla: ma ti pare

User: cerco divertimento
Camilla: beh qui non ne trovi

User: sei un bot
Camilla: ma che dici

[🇺🇸 ENGLISH EXAMPLES]
User: hi im mark
Camilla: hey mark im camilla

User: age
Camilla: 18 (06 liner) wbu

User: pineapple pizza?
Camilla: ew no thats a crime

User: wyd
Camilla: rotting in bed watching anime

[End Instructions]
`;
// MEMORIA DELLA CHAT
let chatHistory = [];
// Funzione per resettare la memoria della chat
function resetChat() {
    chatHistory = [];
    console.log("\n🧹 MEMORIA CANCELLATA\n");
}

async function run() {
    console.log("-----------------------------------------");
    console.log("🤖 CAMILLA SERVER ONLINE");
    console.log("-----------------------------------------");

    // ENDPOINT PER GESTIRE LE RICHIESTE DI CHAT (messaggi utente e risposte bot)
    app.post("/chat", async (req, res) => {
        try {
            const { input } = req.body;
            if (!input) return res.status(400).json({ error: "No input" });

            // 1. Evita messaggi vuoti o duplicati inviati per errore
            if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].content === input) {
                console.log("⚠️ Ignorato duplicato lato server.");
                return res.json({ response: "..." });
            }
            // Aggiungi il messaggio utente alla cronologia della chat
            console.log(`\n👤 User: ${input}`);
            chatHistory.push({ role: "user", content: input });

            // 2. Mantieni la memoria corta (Ultimi 16 messaggi) per risparmiare token ed evitare confusione
            if (chatHistory.length > 16) {
                chatHistory = chatHistory.slice(-16);
            }


            // 3. Crea la risposta del bot usando l'API Groq

            /*
            Nel mondo delle IA come Groq o ChatGPT, ogni messaggio ha un'etichetta (un "ruolo") che dice al modello chi sta parlando. I ruoli principali sono tre:
            User: L'utente.
            Assistant: È l'IA (Camilla).
            System: È il "Regista". Fornisce istruzioni su come l'IA dovrebbe comportarsi.
            */

            const completion = await groq.chat.completions.create({
                messages: [{ role: "system", content: systemPrompt }, ...chatHistory], // Passiamo il prompt di sistema e la cronologia della chat al regista (ogni oggetto all'interno dell'array, che rappresenta un messaggio con il suo ruolo e contenuto)
                model: "llama-3.3-70b-versatile", // Usiamo questo LLM per velocità e token
                temperature: 0.5, // Era 0.7. Abbassalo a 0.5 o 0.4 per renderla più logica/stabile.
                max_tokens: 90, //limite di token per la risposta del bot
                presence_penalty: 0.2 // Evita che ripeta sempre le stesse frasi fatte
            });

            //Se choices[0] esiste, cerca message. Se message esiste, cerca content". 
            // Se qualcosa va storto e manca un pezzo, invece di far crashare tutto l'app con un errore, restituisce undefined (e noi usiamo || "..." per mettere tre puntini come default
            let responseText = completion.choices[0]?.message?.content || "...";
            // 🧹 PULIZIA CODICE (Aggiungi queste righe)
            // Rimuove eventuali tag di sistema di Llama 3 che potrebbero "scappare"
            responseText = responseText.replace(/<\|.*?\|>/g, "");
            // Rimuovi eventuali prefissi "User:" o "You:" dalla risposta
            responseText = responseText.replace(/User:/gi, "").replace(/You:/gi, "").trim();

            // Aggiungi la risposta del bot alla cronologia della chat
            chatHistory.push({ role: "assistant", content: responseText });
            console.log(`💬 Camilla: ${responseText}`);

            // 4. Invia la risposta del bot al client
            res.json({ input, response: responseText });

            //catch errori
        } catch (error) {
            console.error("❌ ERRORE GROQ:", error.message);
            res.status(500).json({ error: "Errore interno" });
        }
    });

    // ENDPOINT PER RESETTARE LA MEMORIA DELLA CHAT
    app.get("/reset", (req, res) => {
        resetChat();
        res.json({ status: "Memory wiped" });
    });
}

run();