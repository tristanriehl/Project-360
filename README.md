# Projet 360 — Operational Memory & RAG Project Cockpit

> Real-time operational project memory, automated discrepancy & contradiction detection, natural language RAG with strict document citations, and dynamic new event impact analysis.

---

## 🚀 How to Run Locally on Your Computer / Démarrage Local

This application is built with **Node.js, Express, React 19, TypeScript, and Tailwind CSS v4**.

### 📋 Prerequisites / Prérequis
- **Node.js**: `v18.0.0` or higher (`v20+` or `v22+` recommended)
- **Package manager**: `npm` (included with Node.js), `yarn`, `pnpm`, or `bun`

---

### 💻 Step-by-Step Installation & Run / Instructions Pas-à-Pas

#### 1. Clone or Extract the Project
Open your terminal (macOS/Linux) or PowerShell / Command Prompt (Windows):

```bash
git clone <your-repository-url> projet-360
cd projet-360
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
# Optional: Set your Gemini API key for live generative synthesis
# The app uses the ultra-fast and token-efficient gemini-3.1-flash-lite model
GEMINI_API_KEY="your_gemini_api_key_here"

# Optional: Custom port (defaults to 3000)
PORT=3000
```

> **Note**: Even without a `GEMINI_API_KEY`, the application includes an **offline local parser & heuristic RAG engine** so that you can test and demonstrate all features (decisions extraction, contradiction spotting, timeline generation, interactive graph, and briefing) directly on your machine.

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
   - ✉️ **Emails (`.eml`)**: Parses headers (`From:`, `To:`, `Date:`, `Subject:`) and body text.
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

### ❓ Troubleshooting / Dépannage

- **Port 3000 already in use?**
  Change the port in `.env` (e.g. `PORT=3001`) or run:
  ```bash
  PORT=3001 npm run dev
  ```
- **Windows PowerShell script execution policy?**
  If `tsx` or `npm` fails due to execution policy, run:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  npm run dev
  ```
