# Projet 360 — Operational Memory & RAG Project Cockpit

[![GitHub](https://img.shields.io/badge/GitHub-Project--360-181717?logo=github&logoColor=white)](https://github.com/tristanriehl/Project-360)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Gemini_3.1-Flash_Lite-8e75ff?logo=google&logoColor=white)](https://ai.google.dev/)
[![Ollama](https://img.shields.io/badge/Ollama-Local_LLM-000000?logo=ollama&logoColor=white)](https://ollama.com/)

> **GitHub Repository:** [https://github.com/tristanriehl/Project-360](https://github.com/tristanriehl/Project-360)
> 
> Real-time operational project memory, automated discrepancy & contradiction detection, natural language RAG with strict document citations, and dynamic new event impact analysis.

---

## 🦙 Running with a Local Ollama Model on Mac (100% Offline / Local GPU)

You can run the full RAG assistant locally on your Mac (M1/M2/M3/M4 or Intel) using **Ollama**:

### 1. Install Ollama on your Mac
- **Via Homebrew** (recommended):
  ```bash
  brew install ollama
  ```
- **Or download the Mac app** from [https://ollama.com/download/mac](https://ollama.com/download/mac) and drag it to your Applications folder.

### 2. Download and start a model
Open Terminal on your Mac and run:
```bash
ollama run llama3.2
```
*(Other recommended models: `ollama run mistral` or `ollama run qwen2.5`)*

Ollama runs a local HTTP server on `http://localhost:11434`.

### 3. Configure `.env` in Project-360
Create or update your `.env` file in the project folder:
```env
OLLAMA_HOST="http://localhost:11434"
OLLAMA_MODEL="llama3.2"
PORT=3000
```

### 4. Start Project-360
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)**. The RAG assistant will now query your local Ollama model directly on your Mac!

---

## 🚀 How to Run Locally on Your Computer / Démarrage Local Standard

This application is built with **Node.js, Express, React 19, TypeScript, and Tailwind CSS v4**.

### 📋 Prerequisites / Prérequis
- **Node.js**: `v18.0.0` or higher (`v20+` or `v22+` recommended)
- **Package manager**: `npm` (included with Node.js), `yarn`, `pnpm`, or `bun`

---

### 💻 Step-by-Step Installation & Run / Instructions Pas-à-Pas

#### 1. Clone the Repository
Open your terminal (macOS/Linux) or PowerShell / Command Prompt (Windows):

```bash
git clone https://github.com/tristanriehl/Project-360.git
cd Project-360
```

#### 2. Install Dependencies
Run the standard package manager installation:

```bash
npm install
```

#### 3. Environment Variables Configuration (Optional / Optionnel)
Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your preferred text editor:
```env
# Option A: Local Ollama on Mac
OLLAMA_HOST="http://localhost:11434"
OLLAMA_MODEL="llama3.2"

# Option B: Cloud Gemini API
GEMINI_API_KEY="your_gemini_api_key_here"

# Server port (defaults to 3000)
PORT=3000
```

> **Note**: Even without an API key or Ollama, the application includes a **built-in offline local parser & heuristic RAG engine** so that all features (decisions extraction, contradiction spotting, timeline generation, and interactive graphs) work out of the box.

#### 4. Start the Local Server
```bash
npm run dev
```

#### 5. Open Your Browser
Navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

### 📁 Ingesting Your Project Dataset

1. On the home screen, click **"Select Folder from Disk"** (or drag and drop your project directory).
2. The folder parser automatically ingests:
   - ✉️ **Emails (`.eml`)**: Parses headers (`From:`, `To:`, `Date:`, `Subject:`) and body text with accent decoding.
   - 📝 **Documents & Notes (`.txt`, `.md`, `.json`, `.csv`, `.log`)**: Full text extraction.
   - 📊 **Spreadsheets & PDFs (`.xlsx`, `.pdf`, `.docx`)**: Structured data and readable text.
3. The RAG cockpit immediately extracts verified decisions, contradictions, delivery milestones, and active risks strictly from your uploaded files.

---

### 🛠️ Available NPM Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Express server with Vite middleware on `http://localhost:3000` |
| `npm run build` | Compiles frontend assets with TypeScript & Vite into `dist/` |
| `npm start` | Runs the production fullstack server (`NODE_ENV=production`) |
| `npm run lint` | Checks TypeScript compilation without emitting files (`tsc --noEmit`) |

---

### 🔗 Project Links
- **Source Code**: [https://github.com/tristanriehl/Project-360](https://github.com/tristanriehl/Project-360)
- **Author**: Tristan Riehl
