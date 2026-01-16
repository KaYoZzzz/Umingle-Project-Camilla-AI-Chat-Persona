# Umingle-Project-Camilla-AI-Chat-Persona
A realistic AI chat persona ("Camilla") for anonymous platform Umingle. Powered by Node.js and Llama 3, it features human-like typing simulation, context retention, and safety logic via simple console injection.


> **Note**: An educational experiment in Human-AI interaction, creating a realistic autonomous chatbot for anonymous platforms.

## ✨ About The Project

**Camilla** is a Node.js-powered AI agent designed to simulate a realistic conversation partner. Unlike standard bots, Camilla has a specific personality, backstory, and reacts naturally to context.

The goal is to study how Large Language Models (LLMs) can maintain a coherent "persona" (an 18-year-old Italian student) in unstructured, real-time chats.

## 🧠 How It Works

The system bridges your browser to a local AI server:
1.  **The Eyes**: A script in the browser reads the chat.
2.  **The Brain**: A local Node.js server processes the text using **Llama 3** (via Groq).
3.  **The Voice**: The script types back the answer with realistic human delays.

## 🚀 Quick Start (No extensions needed)

### 1. Start the Brain (Backend)

1.  Clone the repo and install dependencies:
    ```bash
    npm install express cors groq-sdk dotenv
    ```
2.  Get your free API Key at [console.groq.com](https://console.groq.com) and add it to a `.env` file:
    ```env
    GROQ_API_KEY=your_key_here
    ```
3.  Run the bot server:
    ```bash
    node groqBotApi.js
    ```
    *Wait for:* `🚀 SERVER AVVIATO: http://127.0.0.1:8080`.

### 2. Wake Up Camilla (Frontend)

1.  Open the file `ScriptForBrowser.js` and **copy all the code**.
2.  Go to **[umingle.com/text](https://umingle.com/text)**.
3.  Open Developer Tools (Press `F12` > click **Console** tab).
4.  **Paste** the code and hit **Enter**.

### 3. Chat!

Start a new conversation on the website. The bot will take over automatically.
* **To Reset Memory**: The bot automatically wipes memory when a stranger disconnects (or you manually do it).

## 🎭 Camilla's Personality

Camilla is programmed to be:
* **Realistic**: 18 years old, lives in Milan, attends "Liceo Linguistico".
* **Safe**: Automatically deflects "creepy" requests and refuses to share personal contacts.
* **Smart**: Understands context (e.g., age math) and switches language if spoken to in English.

## ⚠️ Known Limitations

1.  **Single-Task Attention (The "Typing" Blind Spot)**
    To maintain realistic typing simulation, the bot **stops listening** to new incoming messages while it is currently typing a response. If the stranger sends multiple messages rapidly while Camilla is typing, those specific messages might be ignored to prevent overlapping responses.

2.  **AI Hallucinations & Language**
    While Llama 3 is highly advanced, Camilla may occasionally:
    * Make grammatical errors or use slang incorrectly.
    * Misinterpret sarcasm or complex cultural nuances.
    * "Hallucinate" facts or forget context if the conversation becomes too long or complex.

## 📂 Tech Stack

* **Runtime**: Node.js & Express.
* **AI Model**: Llama-3.3-70b-versatile via Groq SDK.
* **Injection**: Vanilla JavaScript (Console-based).
